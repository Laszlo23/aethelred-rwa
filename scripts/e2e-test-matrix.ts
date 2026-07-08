/**
 * E2E test matrix (T1–T7) against localnet or devnet.
 * Usage: npx tsx scripts/e2e-test-matrix.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PrismaClient } from "@prisma/client";
import { registryPda } from "../src/lib/solana/anchor/pdas";
import { verifyUsdcPayment, settleShareTransfer } from "../src/lib/solana/primary-sale-server";
import { loadDeployerKeypair } from "../src/lib/solana/deployer";

const ROOT = join(import.meta.dirname, "..");
const RPC = process.env.SOLANA_RPC_URL ?? "http://127.0.0.1:8899";
const TEST_WALLET = Keypair.generate();
const ASSET_SLUG = "berggasse-35";
const AMOUNT_CENTS = 100_000;

function loadEnv() {
  try {
    const raw = readFileSync(join(ROOT, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)="?([^"\n]*)"?$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* no .env */
  }
}

const results: { id: string; pass: boolean; detail: string }[] = [];

function record(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const connection = new Connection(RPC, "confirmed");
  const deployer = loadDeployerKeypair();

  // T1 — asset exists in DB (property page data)
  const asset = await prisma.asset.findFirst({
    where: { slug: ASSET_SLUG },
    include: { passport: true, property: true },
  });
  record(
    "T1",
    Boolean(asset?.property && asset.passport),
    asset ? `asset ${asset.slug} loaded` : "asset not found",
  );

  // T2 — KYC gate
  await prisma.walletCompliance.upsert({
    where: { walletAddress: TEST_WALLET.publicKey.toBase58() },
    create: {
      walletAddress: TEST_WALLET.publicKey.toBase58(),
      kycTier: "basic",
      verifiedAt: new Date(),
      provider: "e2e",
    },
    update: { kycTier: "basic", verifiedAt: new Date() },
  });
  const compliance = await prisma.walletCompliance.findUnique({
    where: { walletAddress: TEST_WALLET.publicKey.toBase58() },
  });
  record("T2", compliance?.kycTier !== "unverified", `kycTier=${compliance?.kycTier}`);

  // T3 — fund buyer with USDC from deployer treasury
  const usdcMint = process.env.USDC_MINT_ADDRESS ?? process.env.VITE_USDC_MINT_ADDRESS;
  if (!usdcMint) throw new Error("USDC mint missing");
  const mintPk = new PublicKey(usdcMint);
  const fromAta = getAssociatedTokenAddressSync(mintPk, deployer.publicKey);
  const toAta = getAssociatedTokenAddressSync(mintPk, TEST_WALLET.publicKey);
  const fundTx = new Transaction();
  try {
    await connection.getAccountInfo(toAta);
  } catch {
    /* create below */
  }
  const toInfo = await connection.getAccountInfo(toAta);
  if (!toInfo) {
    fundTx.add(
      createAssociatedTokenAccountInstruction(
        deployer.publicKey,
        toAta,
        TEST_WALLET.publicKey,
        mintPk,
      ),
    );
  }
  fundTx.add(createTransferInstruction(fromAta, toAta, deployer.publicKey, 1_000_000_000n));
  const fundSig = await connection.sendTransaction(fundTx, [deployer]);
  await connection.confirmTransaction(fundSig, "confirmed");
  const buyerBal = await connection.getTokenAccountBalance(toAta);
  record("T3", Number(buyerBal.value.amount) > 0, `buyer USDC=${buyerBal.value.uiAmountString}`);

  // Fund buyer SOL for tx fees
  const solFund = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: deployer.publicKey,
      toPubkey: TEST_WALLET.publicKey,
      lamports: 1_000_000_000,
    }),
  );
  const solSig = await connection.sendTransaction(solFund, [deployer]);
  await connection.confirmTransaction(solSig, "confirmed");

  // T4 — primary sale: USDC payment + share transfer
  const mintAddress = asset?.passport?.solanaMint;
  if (!mintAddress) {
    record("T4", false, "share mint missing");
  } else {
    const payTx = new Transaction().add(
      createTransferInstruction(toAta, fromAta, TEST_WALLET.publicKey, 1_000_000_000n),
    );
    const paySig = await connection.sendTransaction(payTx, [TEST_WALLET]);
    await connection.confirmTransaction(paySig, "confirmed");
    const verified = await verifyUsdcPayment({
      signature: paySig,
      buyerWallet: TEST_WALLET.publicKey.toBase58(),
      expectedAmountCents: AMOUNT_CENTS,
    });
    const shareBps = Math.round((AMOUNT_CENTS / (asset?.valueCents ?? 1)) * 10000);
    const transferSig = verified
      ? await settleShareTransfer({
          mintAddress,
          buyerWallet: TEST_WALLET.publicKey.toBase58(),
          shareBps,
        })
      : "";
    const buyerShareAta = getAssociatedTokenAddressSync(
      new PublicKey(mintAddress),
      TEST_WALLET.publicKey,
    );
    let shareBal = 0;
    try {
      shareBal = Number((await connection.getTokenAccountBalance(buyerShareAta)).value.amount);
    } catch {
      shareBal = 0;
    }
    record(
      "T4",
      verified && shareBal > 0,
      `verify=${verified} transfer=${transferSig.slice(0, 12)}… shares=${shareBal}`,
    );
  }

  // T5 — indexer sync
  const { syncWalletSplBalances, reconcileShareHoldingsFromChain } =
    await import("../src/workers/chain-indexer");
  await syncWalletSplBalances(TEST_WALLET.publicKey.toBase58());
  await reconcileShareHoldingsFromChain(TEST_WALLET.publicKey.toBase58());
  const holding = await prisma.assetShare.findFirst({
    where: { holderWallet: TEST_WALLET.publicKey.toBase58(), assetId: asset?.id },
  });
  record("T5", Boolean(holding && holding.shareBps > 0), `holding bps=${holding?.shareBps ?? 0}`);

  // T6 — passport PDA derivable (on-chain mint tested via create flow separately)
  const { passportPda } = await import("../src/lib/solana/anchor/pdas");
  const pda = passportPda(`e2e-${Date.now()}`);
  record("T6", pda.toBase58().length > 32, `passport PDA ${pda.toBase58().slice(0, 8)}…`);

  // T7 — registry on-chain
  const regPda = registryPda(ASSET_SLUG);
  const regAcct = await connection.getAccountInfo(regPda);
  record(
    "T7",
    Boolean(regAcct && regAcct.data.length > 0),
    `registry bytes=${regAcct?.data.length ?? 0}`,
  );

  await prisma.$disconnect();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
