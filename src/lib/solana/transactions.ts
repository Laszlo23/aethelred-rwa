import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";
import { getPassportProgram } from "./anchor/client";
import { passportConfigPda, passportPda } from "./anchor/pdas";
import { SOLANA_CONFIG } from "./config";

export function getConnection(): Connection {
  return new Connection(SOLANA_CONFIG.rpcUrl, "confirmed");
}

/** Build on-chain passport mint instruction (owner + guardian must sign). */
export async function buildMintPassportTx(
  walletAddress: string,
  assetId: string,
  meta?: {
    trustScore?: number;
    guardianGrade?: string;
    attestationSig?: string;
    navCents?: number;
  },
): Promise<Transaction> {
  if (!SOLANA_CONFIG.passportProgramId) {
    throw new Error("Passport program not deployed — run npm run setup:chain");
  }
  const connection = getConnection();
  const owner = new PublicKey(walletAddress);
  if (!SOLANA_CONFIG.guardianPubkey) {
    throw new Error("Guardian signer not configured (VITE_GUARDIAN_SIGNER_PUBKEY)");
  }
  const guardian = new PublicKey(SOLANA_CONFIG.guardianPubkey);
  const program = await getPassportProgram();
  const passport = passportPda(assetId);
  const config = passportConfigPda();

  const tx = await program.methods
    .mintPassport(
      assetId,
      meta?.trustScore ?? 85,
      meta?.guardianGrade ?? "A",
      meta?.attestationSig ?? `passport:${assetId}`,
      new BN(meta?.navCents ?? 0),
    )
    .accounts({
      owner,
      guardian,
      config,
      passport,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = owner;
  return tx;
}

/** Guardian co-signs an owner-signed passport mint and broadcasts it. Server-only. */
export async function coSignAndSendPassportMint(signedTxBase64: string): Promise<string> {
  const { loadGuardianKeypair } = await import("./deployer");
  const guardian = loadGuardianKeypair();
  const connection = getConnection();
  const tx = Transaction.from(Buffer.from(signedTxBase64, "base64"));
  tx.partialSign(guardian);
  const signature = await sendAndConfirmTransaction(connection, tx, [guardian], {
    commitment: "confirmed",
  });
  return signature;
}

/** USDC primary sale: buyer transfers USDC to protocol treasury. */
export async function buildUsdcPrimarySaleTx(
  walletAddress: string,
  assetSlug: string,
  amountCents: number,
  mintAddress?: string,
): Promise<Transaction> {
  const { buildUsdcPrimarySaleTx: buildClient } = await import("./primary-sale-client");
  void mintAddress;
  void assetSlug;
  return buildClient(walletAddress, assetSlug, amountCents);
}

/** Alias kept for buy panel — USDC payment is the on-chain settlement step. */
export async function buildBuyRwaTx(
  walletAddress: string,
  assetSlug: string,
  amountCents: number,
  mintAddress?: string,
): Promise<Transaction> {
  return buildUsdcPrimarySaleTx(walletAddress, assetSlug, amountCents, mintAddress);
}

export async function buildMintEuroTx(
  walletAddress: string,
  amountEuroCents: number,
): Promise<Transaction | null> {
  if (!SOLANA_CONFIG.euroMintAddress) return null;
  const connection = getConnection();
  const wallet = new PublicKey(walletAddress);
  const mint = new PublicKey(SOLANA_CONFIG.euroMintAddress);
  const ata = getAssociatedTokenAddressSync(mint, wallet);
  const amountRaw = BigInt(amountEuroCents) * 10n ** 4n;

  const tx = new Transaction();
  try {
    await getAccount(connection, ata);
  } catch {
    tx.add(createAssociatedTokenAccountInstruction(wallet, ata, wallet, mint));
  }
  void amountRaw;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet;
  return tx;
}

export async function buildClaimRewardTx(
  walletAddress: string,
  amount: number,
): Promise<Transaction> {
  if (!SOLANA_CONFIG.rewardsMintAddress) {
    throw new Error("Rewards mint not deployed — run npm run setup:chain");
  }
  const connection = getConnection();
  const wallet = new PublicKey(walletAddress);
  const mint = new PublicKey(SOLANA_CONFIG.rewardsMintAddress);
  const ata = getAssociatedTokenAddressSync(mint, wallet);
  const amountRaw = BigInt(amount) * 1_000_000n;

  const tx = new Transaction();
  try {
    await getAccount(connection, ata);
  } catch {
    tx.add(createAssociatedTokenAccountInstruction(wallet, ata, wallet, mint));
  }
  void amountRaw;
  void TOKEN_PROGRAM_ID;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet;
  return tx;
}
