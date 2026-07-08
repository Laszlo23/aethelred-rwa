import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
} from "@solana/spl-token";
import { SOLANA_CONFIG } from "./config";

const USDC_DECIMALS = 6;

function treasuryAddress(): string {
  if (SOLANA_CONFIG.treasuryWalletAddress) {
    return SOLANA_CONFIG.treasuryWalletAddress;
  }
  throw new Error("Treasury wallet not configured");
}

export function getSaleConnection(): Connection {
  return new Connection(SOLANA_CONFIG.rpcUrl, "confirmed");
}

/** Client-only USDC primary sale — no Anchor deps. */
export async function buildUsdcPrimarySaleTx(
  walletAddress: string,
  _assetSlug: string,
  amountCents: number,
): Promise<Transaction> {
  const usdcMint = new PublicKey(SOLANA_CONFIG.usdcMintAddress);
  const connection = getSaleConnection();
  const buyer = new PublicKey(walletAddress);
  const treasury = new PublicKey(treasuryAddress());
  const buyerAta = getAssociatedTokenAddressSync(usdcMint, buyer);
  const treasuryAta = getAssociatedTokenAddressSync(usdcMint, treasury);
  const amountRaw = BigInt(amountCents) * 10n ** BigInt(USDC_DECIMALS - 2);

  const tx = new Transaction();
  try {
    await getAccount(connection, buyerAta);
  } catch {
    tx.add(
      createAssociatedTokenAccountInstruction(buyer, buyerAta, buyer, usdcMint),
    );
  }

  try {
    await getAccount(connection, treasuryAta);
  } catch {
    throw new Error("Treasury USDC account not ready — run npm run setup:chain");
  }

  tx.add(
    createTransferCheckedInstruction(
      buyerAta,
      usdcMint,
      treasuryAta,
      buyer,
      amountRaw,
      USDC_DECIMALS,
    ),
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = buyer;
  return tx;
}
