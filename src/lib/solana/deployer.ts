import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const DEFAULT_KEYPAIR = join(homedir(), ".config/solana/id.json");

export function loadDeployerKeypair(): Keypair {
  const secret = process.env.SOLANA_DEPLOYER_SECRET?.trim();
  if (secret) {
    return Keypair.fromSecretKey(bs58.decode(secret));
  }
  const path = process.env.SOLANA_KEYPAIR_PATH?.trim() || DEFAULT_KEYPAIR;
  if (!existsSync(path)) {
    throw new Error(
      "Set SOLANA_DEPLOYER_SECRET or create ~/.config/solana/id.json with a funded keypair",
    );
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

export function getTreasuryAddress(): string {
  return (
    process.env.TREASURY_WALLET_ADDRESS?.trim() ||
    loadDeployerKeypair().publicKey.toBase58()
  );
}

/** Guardian co-signer for passport mints; defaults to deployer on devnet. */
export function loadGuardianKeypair(): Keypair {
  const secret = process.env.GUARDIAN_SIGNER_SECRET?.trim();
  if (secret) {
    return Keypair.fromSecretKey(bs58.decode(secret));
  }
  return loadDeployerKeypair();
}

export function getGuardianAddress(): string {
  const configured = process.env.GUARDIAN_SIGNER_PUBKEY?.trim();
  if (configured) return configured;
  return loadGuardianKeypair().publicKey.toBase58();
}
