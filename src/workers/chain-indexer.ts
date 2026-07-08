import { createRequire } from "node:module";
import { prisma } from "@/lib/db";

const require = createRequire(import.meta.url);
const { Connection, PublicKey } = require("@solana/web3.js") as typeof import("@solana/web3.js");

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export interface IndexerConfig {
  rpcUrl: string;
  heliusApiKey?: string;
}

export async function syncWalletSplBalances(walletAddress: string): Promise<number> {
  const connection = new Connection(
    process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    "confirmed",
  );
  const owner = new PublicKey(walletAddress);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  let synced = 0;
  const user = await prisma.user.findUnique({ where: { walletAddress } });

  for (const { pubkey, account } of tokenAccounts.value) {
    const parsed = account.data.parsed as {
      info: { mint: string; tokenAmount: { amount: string; decimals: number } };
    };
    const mint = parsed.info.mint;
    const amountRaw = parsed.info.tokenAmount.amount;

    const passport = await prisma.assetPassport.findFirst({ where: { solanaMint: mint } });
    const assetId = passport?.assetId ?? null;

    await prisma.onChainPosition.upsert({
      where: { pubkey: pubkey.toBase58() },
      create: {
        walletAddress,
        userId: user?.id,
        assetId,
        program: "spl-token",
        positionType: "token_account",
        pubkey: pubkey.toBase58(),
        mint,
        amountRaw,
        lastSyncedAt: new Date(),
      },
      update: {
        amountRaw,
        assetId,
        lastSyncedAt: new Date(),
      },
    });
    synced++;
  }

  return synced;
}

export async function reconcileShareHoldingsFromChain(walletAddress: string): Promise<void> {
  const positions = await prisma.onChainPosition.findMany({
    where: { walletAddress, positionType: "token_account", assetId: { not: null } },
    include: { asset: true },
  });

  for (const pos of positions) {
    if (!pos.assetId || !pos.asset || !pos.amountRaw) continue;
    const decimals = 6;
    const raw = BigInt(pos.amountRaw);
    const totalSupply = BigInt(1_000_000) * BigInt(10 ** decimals);
    const shareBps = Number((raw * BigInt(10000)) / totalSupply);

    const existing = await prisma.assetShare.findFirst({
      where: { assetId: pos.assetId, holderWallet: walletAddress },
    });
    if (existing) {
      await prisma.assetShare.update({
        where: { id: existing.id },
        data: { shareBps: Math.max(existing.shareBps, shareBps) },
      });
    } else if (shareBps > 0) {
      await prisma.assetShare.create({
        data: { assetId: pos.assetId, holderWallet: walletAddress, shareBps },
      });
    }
  }
}

export interface HeliusWebhookPayload {
  type?: string;
  accountData?: { account: string; nativeBalanceChange?: number }[];
  signature?: string;
}

export async function handleHeliusWebhook(payload: HeliusWebhookPayload): Promise<{ ok: boolean }> {
  if (!payload.accountData?.length) return { ok: true };

  for (const entry of payload.accountData) {
    const wallet = entry.account;
    if (!wallet) continue;
    await syncWalletSplBalances(wallet);
    await reconcileShareHoldingsFromChain(wallet);

    if (payload.signature) {
      await prisma.fundLedgerEntry.create({
        data: {
          direction: "inbound",
          amountCents: Math.abs(entry.nativeBalanceChange ?? 0),
          currency: "SOL",
          txSignature: payload.signature,
          note: `helius:${payload.type ?? "unknown"}`,
        },
      });
    }
  }

  return { ok: true };
}

export async function runIndexerCycle(): Promise<void> {
  const wallets = await prisma.user.findMany({
    select: { walletAddress: true },
    take: 100,
  });
  for (const { walletAddress } of wallets) {
    await syncWalletSplBalances(walletAddress);
    await reconcileShareHoldingsFromChain(walletAddress);
  }
}
