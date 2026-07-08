/**
 * Bootstrap local test validator chain: deploy programs, mints, BC assets, test USDC.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import BN from "bn.js";
import { PrismaClient } from "@prisma/client";

const ROOT = join(import.meta.dirname, "..");
const RPC = process.env.SOLANA_RPC_URL ?? "http://127.0.0.1:8899";
const KEYPAIR_PATH = join(homedir(), ".config/solana/id.json");

const PROGRAM_IDS = {
  PASSPORT_PROGRAM_ID: "9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A",
  REGISTRY_PROGRAM_ID: "AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU",
  NAMES_PROGRAM_ID: "APU7238FpwdCWTrx5jSKpQYnkrrHiT1HgQgtPPRY3aDd",
  VAULT_PROGRAM_ID: "4tzFUjGPaiENbHR3vZE9bLEdjrMSbewZqizkwP5m5t9X",
  EURO_PROGRAM_ID: "H3DagyBbC86U62PVkPV6pgtJcuuhhK7FpWwoLWsYHboL",
  REWARDS_PROGRAM_ID: "4j6QfsG5mbZ6RaYZpdnzpk5zYfiJJWex2YA6TjsBhnhE",
};

// Set program IDs before loading app modules that read SOLANA_CONFIG
process.env.VITE_PASSPORT_PROGRAM_ID = PROGRAM_IDS.PASSPORT_PROGRAM_ID;
process.env.VITE_REGISTRY_PROGRAM_ID = PROGRAM_IDS.REGISTRY_PROGRAM_ID;
process.env.VITE_NAMES_PROGRAM_ID = PROGRAM_IDS.NAMES_PROGRAM_ID;
process.env.VITE_VAULT_PROGRAM_ID = PROGRAM_IDS.VAULT_PROGRAM_ID;
process.env.PASSPORT_PROGRAM_ID = PROGRAM_IDS.PASSPORT_PROGRAM_ID;
process.env.REGISTRY_PROGRAM_ID = PROGRAM_IDS.REGISTRY_PROGRAM_ID;
process.env.NAMES_PROGRAM_ID = PROGRAM_IDS.NAMES_PROGRAM_ID;
process.env.VAULT_PROGRAM_ID = PROGRAM_IDS.VAULT_PROGRAM_ID;
process.env.SOLANA_RPC_URL = RPC;
process.env.VITE_SOLANA_RPC_URL = RPC;
process.env.VITE_SOLANA_NETWORK = "localnet";

const { getRegistryProgram, getPassportProgram } = await import("../src/lib/solana/anchor/client");
const { registryPda, registryConfigPda, passportConfigPda } =
  await import("../src/lib/solana/anchor/pdas");
const { deployRwaShareMint } = await import("../src/lib/solana/rwa-mint-server");
const { BUILDING_CULTURE_ASSETS } = await import("../src/lib/data/seed-building-culture");
const { ensureSeeded } = await import("../src/lib/db");

function loadKeypair(): Keypair {
  const raw = JSON.parse(readFileSync(KEYPAIR_PATH, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function updateEnv(vars: Record<string, string>) {
  const envPath = join(ROOT, ".env");
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}="${value}"`;
    content = re.test(content) ? content.replace(re, line) : `${content}\n${line}\n`;
  }
  writeFileSync(envPath, content.trim() + "\n");
  console.log(`Updated .env (${Object.keys(vars).length} keys)`);
}

async function deploySplMint(
  connection: Connection,
  deployer: Keypair,
  decimals = 6,
  supply = 10_000_000,
): Promise<{ mint: PublicKey; signature: string }> {
  const mintKeypair = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const ata = getAssociatedTokenAddressSync(mintKeypair.publicKey, deployer.publicKey);
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: deployer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(
      mintKeypair.publicKey,
      decimals,
      deployer.publicKey,
      deployer.publicKey,
    ),
    createAssociatedTokenAccountInstruction(
      deployer.publicKey,
      ata,
      deployer.publicKey,
      mintKeypair.publicKey,
    ),
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      deployer.publicKey,
      BigInt(supply) * 10n ** BigInt(decimals),
    ),
  );
  const signature = await sendAndConfirmTransaction(connection, tx, [deployer, mintKeypair]);
  return { mint: mintKeypair.publicKey, signature };
}

async function initializeProtocolConfigs(deployer: Keypair) {
  const connection = new Connection(RPC, "confirmed");
  const passportConfig = passportConfigPda();
  if (!(await connection.getAccountInfo(passportConfig))) {
    const program = getPassportProgram(deployer);
    await program.methods
      .initializeConfig(deployer.publicKey)
      .accounts({
        authority: deployer.publicKey,
        config: passportConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("  passport config initialized");
  }

  const registryConfig = registryConfigPda();
  if (!(await connection.getAccountInfo(registryConfig))) {
    const program = getRegistryProgram(deployer);
    await program.methods
      .initializeConfig(deployer.publicKey)
      .accounts({
        authority: deployer.publicKey,
        config: registryConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("  registry config initialized");
  }
}

async function registerOnChain(
  deployer: Keypair,
  slug: string,
  mint: string,
  navCents: number,
  trustScore: number,
) {
  const strict = process.env.SETUP_STRICT === "1" || RPC.includes("devnet");
  try {
    const connection = new Connection(RPC, "confirmed");
    const registry = registryPda(slug);
    const existing = await connection.getAccountInfo(registry);
    if (existing) {
      console.log(`  registry exists for ${slug}`);
      return;
    }
    const program = getRegistryProgram(deployer);
    const tx = await program.methods
      .registerAsset(slug, new BN(navCents), trustScore)
      .accounts({
        authority: deployer.publicKey,
        config: registryConfigPda(),
        mint: new PublicKey(mint),
        registry,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`  registry tx: ${tx}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (strict) throw err;
    console.warn(`  registry skip ${slug}:`, message);
  }
}

async function main() {
  const deployer = loadKeypair();
  const deployerSecret = bs58.encode(deployer.secretKey);
  console.log(`Deployer: ${deployer.publicKey.toBase58()}`);
  console.log(`RPC: ${RPC}\n`);

  const connection = new Connection(RPC, "confirmed");
  const balance = await connection.getBalance(deployer.publicKey);
  console.log(`Balance: ${balance / 1e9} SOL\n`);

  if (balance < 1e9) {
    console.log("Low balance — requesting airdrop...");
    try {
      execSync(`solana airdrop 10 --url ${RPC}`, { stdio: "inherit" });
    } catch {
      console.warn(
        "Airdrop failed — ensure solana-test-validator is running or fund devnet wallet",
      );
    }
  }

  const isDevnet = RPC.includes("devnet");
  if (!isDevnet) {
    console.log("Deploying Anchor programs...");
    execSync(
      "mkdir -p target/deploy && cp programs/target/deploy/*.so programs/target/deploy/*-keypair.json target/deploy/ 2>/dev/null; anchor deploy --provider.cluster localnet",
      {
        cwd: ROOT,
        stdio: "inherit",
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:/Users/poker.vibe/.local/share/solana/install/active_release/bin`,
        },
      },
    );
  } else {
    console.log("Devnet mode — skipping anchor deploy (run npm run deploy:anchor first)");
  }

  console.log("\nInitializing protocol configs...");
  await initializeProtocolConfigs(deployer);

  console.log("\nCreating test USDC, EURO, and REWARDS mints...");
  const devnetUsdc = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
  let usdcMint: PublicKey;
  if (isDevnet) {
    usdcMint = new PublicKey(devnetUsdc);
    console.log(`  Using Circle devnet USDC: ${devnetUsdc}`);
  } else {
    const usdc = await deploySplMint(connection, deployer);
    usdcMint = usdc.mint;
    console.log(`  USDC mint: ${usdcMint.toBase58()}`);
  }
  const euro = await deploySplMint(connection, deployer);
  const rewards = await deploySplMint(connection, deployer);
  console.log(`  EURO mint: ${euro.mint.toBase58()}`);
  console.log(`  REWARDS mint: ${rewards.mint.toBase58()}`);

  process.env.SOLANA_DEPLOYER_SECRET = deployerSecret;
  process.env.SOLANA_RPC_URL = RPC;
  process.env.VITE_SOLANA_RPC_URL = RPC;
  process.env.VITE_USDC_MINT_ADDRESS = usdcMint.toBase58();
  process.env.USDC_MINT_ADDRESS = usdcMint.toBase58();
  process.env.PASSPORT_PROGRAM_ID = PROGRAM_IDS.PASSPORT_PROGRAM_ID;
  process.env.REGISTRY_PROGRAM_ID = PROGRAM_IDS.REGISTRY_PROGRAM_ID;
  process.env.NAMES_PROGRAM_ID = PROGRAM_IDS.NAMES_PROGRAM_ID;
  process.env.VAULT_PROGRAM_ID = PROGRAM_IDS.VAULT_PROGRAM_ID;
  process.env.VITE_PASSPORT_PROGRAM_ID = PROGRAM_IDS.PASSPORT_PROGRAM_ID;
  process.env.VITE_REGISTRY_PROGRAM_ID = PROGRAM_IDS.REGISTRY_PROGRAM_ID;
  process.env.VITE_NAMES_PROGRAM_ID = PROGRAM_IDS.NAMES_PROGRAM_ID;
  process.env.VITE_VAULT_PROGRAM_ID = PROGRAM_IDS.VAULT_PROGRAM_ID;
  process.env.VITE_EURO_MINT_ADDRESS = euro.mint.toBase58();
  process.env.VITE_REWARDS_MINT_ADDRESS = rewards.mint.toBase58();
  process.env.EURO_MINT_ADDRESS = euro.mint.toBase58();
  process.env.REWARDS_MINT_ADDRESS = rewards.mint.toBase58();
  process.env.TREASURY_WALLET_ADDRESS = deployer.publicKey.toBase58();

  updateEnv({
    DATABASE_URL: "file:./dev.db",
    SIWS_DOMAIN: "localhost",
    SOLANA_RPC_URL: RPC,
    VITE_SOLANA_RPC_URL: RPC,
    VITE_SOLANA_NETWORK: isDevnet ? "devnet" : "localnet",
    SOLANA_DEPLOYER_SECRET: deployerSecret,
    TREASURY_WALLET_ADDRESS: deployer.publicKey.toBase58(),
    VITE_USDC_MINT_ADDRESS: usdcMint.toBase58(),
    USDC_MINT_ADDRESS: usdcMint.toBase58(),
    VITE_PASSPORT_PROGRAM_ID: PROGRAM_IDS.PASSPORT_PROGRAM_ID,
    VITE_REGISTRY_PROGRAM_ID: PROGRAM_IDS.REGISTRY_PROGRAM_ID,
    VITE_NAMES_PROGRAM_ID: PROGRAM_IDS.NAMES_PROGRAM_ID,
    VITE_VAULT_PROGRAM_ID: PROGRAM_IDS.VAULT_PROGRAM_ID,
    PASSPORT_PROGRAM_ID: PROGRAM_IDS.PASSPORT_PROGRAM_ID,
    REGISTRY_PROGRAM_ID: PROGRAM_IDS.REGISTRY_PROGRAM_ID,
    NAMES_PROGRAM_ID: PROGRAM_IDS.NAMES_PROGRAM_ID,
    VAULT_PROGRAM_ID: PROGRAM_IDS.VAULT_PROGRAM_ID,
    VITE_EURO_MINT_ADDRESS: euro.mint.toBase58(),
    VITE_REWARDS_MINT_ADDRESS: rewards.mint.toBase58(),
    EURO_MINT_ADDRESS: euro.mint.toBase58(),
    REWARDS_MINT_ADDRESS: rewards.mint.toBase58(),
    VITE_DRIFT_ENV: "devnet",
    DEPLOY_ADMIN_SECRET: "local-dev-admin",
  });

  const prisma = new PrismaClient();
  await ensureSeeded();
  console.log("\nDeploying Building Culture RWA share mints...");
  for (const bc of BUILDING_CULTURE_ASSETS) {
    const asset = await prisma.asset.findUnique({
      where: { slug: bc.slug },
      include: { passport: true },
    });
    if (!asset?.passport) {
      console.warn(`  SKIP ${bc.symbol} — seed DB first (npm run dev once)`);
      continue;
    }

    const existing = asset.passport.solanaMint;
    const mintOnChain =
      existing &&
      existing.length > 32 &&
      !existing.startsWith("Passport") &&
      (await connection.getAccountInfo(new PublicKey(existing)))?.owner.equals(TOKEN_PROGRAM_ID);
    if (mintOnChain) {
      console.log(`  OK ${bc.symbol} → ${existing}`);
      await registerOnChain(
        deployer,
        bc.slug,
        existing,
        Math.round(bc.acquisitionEur * 100),
        Math.min(99, Math.round(bc.yieldBps / 10)),
      );
      continue;
    }
    if (existing && existing.length > 32) {
      console.log(`  REDEPLOY ${bc.symbol} — local mint not on chain`);
    }

    const deployed = await deployRwaShareMint({ symbol: bc.symbol, assetSlug: bc.slug });
    await prisma.assetPassport.update({
      where: { assetId: asset.id },
      data: {
        solanaMint: deployed.mintAddress,
        attestationSig: deployed.txSignature,
        registryPda: registryPda(bc.slug).toBase58(),
      },
    });
    await registerOnChain(
      deployer,
      bc.slug,
      deployed.mintAddress,
      Math.round(bc.acquisitionEur * 100),
      Math.min(99, Math.round(bc.yieldBps / 10)),
    );
    console.log(`  DONE ${bc.symbol} mint=${deployed.mintAddress}`);
  }

  await prisma.$disconnect();
  console.log("\n✓ Local chain ready. Restart dev server: npm run dev");
  console.log(`  Wallet: ${deployer.publicKey.toBase58()}`);
  console.log(`  Fund test buyers with USDC from deployer treasury`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
