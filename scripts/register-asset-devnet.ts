/**
 * Register a single asset on devnet registry.
 * Usage: npx tsx scripts/register-asset-devnet.ts <slug> <mint> [navCents] [trustScore]
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";

const slug = process.argv[2];
const mint = process.argv[3];
const navCents = Number(process.argv[4] ?? 0);
const trustScore = Number(process.argv[5] ?? 85);

if (!slug || !mint) {
  console.error("Usage: npx tsx scripts/register-asset-devnet.ts <slug> <mint> [navCents] [trustScore]");
  process.exit(1);
}

process.env.SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
process.env.REGISTRY_PROGRAM_ID = "AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU";

const { getRegistryProgram } = await import("../src/lib/solana/anchor/client");
const { registryPda, registryConfigPda } = await import("../src/lib/solana/anchor/pdas");

const raw = JSON.parse(readFileSync(join(homedir(), ".config/solana/id.json"), "utf8")) as number[];
const deployer = Keypair.fromSecretKey(Uint8Array.from(raw));
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
const registry = registryPda(slug);

if (await connection.getAccountInfo(registry)) {
  console.log(`Registry already exists for ${slug}`);
  process.exit(0);
}

const program = getRegistryProgram(deployer);
const sig = await program.methods
  .registerAsset(slug, new BN(navCents), trustScore)
  .accounts({
    authority: deployer.publicKey,
    config: registryConfigPda(),
    mint: new PublicKey(mint),
    registry,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log(`Registered ${slug} → ${sig}`);
