import { Connection, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
} from "@solana/spl-token";
import { loadDeployerKeypair, getTreasuryAddress } from "./deployer";
import { getSolanaConnection } from "./anchor/connection";

const USDC_DECIMALS = 6;

export async function verifyUsdcPayment(params: {
  signature: string;
  buyerWallet: string;
  expectedAmountCents: number;
  treasuryAddress?: string;
}): Promise<boolean> {
  const connection = getSolanaConnection();
  const tx = await connection.getParsedTransaction(params.signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  if (!tx?.meta || tx.meta.err) return false;

  const treasury = params.treasuryAddress ?? getTreasuryAddress();
  const usdcMint = process.env.VITE_USDC_MINT_ADDRESS ?? process.env.USDC_MINT_ADDRESS;
  if (!usdcMint) return false;

  const expectedRaw = BigInt(params.expectedAmountCents) * 10n ** BigInt(USDC_DECIMALS - 2);
  const buyer = params.buyerWallet;
  const treasuryPk = new PublicKey(treasury);
  const mintPk = new PublicKey(usdcMint);

  const treasuryAta = getAssociatedTokenAddressSync(mintPk, treasuryPk);

  const accountKeys = tx.transaction.message.accountKeys.map((k) =>
    typeof k === "string" ? k : k.pubkey.toBase58(),
  );

  let treasuryAtaIndex = accountKeys.indexOf(treasuryAta.toBase58());
  if (treasuryAtaIndex < 0) {
    for (const after of tx.meta.postTokenBalances ?? []) {
      if (after.mint === usdcMint && after.owner === treasury) {
        treasuryAtaIndex = after.accountIndex;
        break;
      }
    }
  }
  if (treasuryAtaIndex < 0) return false;

  const pre = tx.meta.preTokenBalances ?? [];
  const post = tx.meta.postTokenBalances ?? [];
  const before = pre.find((b) => b.accountIndex === treasuryAtaIndex);
  const after = post.find((b) => b.accountIndex === treasuryAtaIndex);
  if (!after || after.mint !== usdcMint || after.owner !== treasury) return false;

  const delta = BigInt(after.uiTokenAmount.amount) - BigInt(before?.uiTokenAmount.amount ?? "0");
  if (delta < expectedRaw) return false;

  const feePayer = accountKeys[0];
  if (feePayer !== buyer) {
    const signers = tx.transaction.message.accountKeys
      .filter((k) => (typeof k === "object" && "signer" in k ? k.signer : false))
      .map((k) => (typeof k === "string" ? k : k.pubkey.toBase58()));
    if (!signers.includes(buyer)) return false;
  }

  return true;
}

/** Server-side: transfer RWA share tokens from deployer treasury to buyer after USDC payment. */
export async function settleShareTransfer(params: {
  mintAddress: string;
  buyerWallet: string;
  shareBps: number;
  totalSupply?: bigint;
  decimals?: number;
}): Promise<string> {
  const deployer = loadDeployerKeypair();
  const connection = getSolanaConnection();
  const mint = new PublicKey(params.mintAddress);
  const buyer = new PublicKey(params.buyerWallet);
  const decimals = params.decimals ?? 6;
  const totalSupply = params.totalSupply ?? 1_000_000n;
  const amountRaw = (totalSupply * BigInt(params.shareBps) * 10n ** BigInt(decimals)) / 10000n;

  const fromAta = getAssociatedTokenAddressSync(mint, deployer.publicKey);
  const toAta = getAssociatedTokenAddressSync(mint, buyer);

  const tx = new Transaction();
  try {
    await getAccount(connection, toAta);
  } catch {
    tx.add(createAssociatedTokenAccountInstruction(deployer.publicKey, toAta, buyer, mint));
  }

  tx.add(createTransferInstruction(fromAta, toAta, deployer.publicKey, amountRaw));

  const signature = await sendAndConfirmTransaction(connection, tx, [deployer], {
    commitment: "confirmed",
  });
  return signature;
}

export async function mintTestUsdcToWallet(
  connection: Connection,
  usdcMint: PublicKey,
  recipient: PublicKey,
  amountUi: number,
): Promise<string> {
  const deployer = loadDeployerKeypair();
  const decimals = USDC_DECIMALS;
  const amountRaw = BigInt(Math.floor(amountUi * 10 ** decimals));
  const fromAta = getAssociatedTokenAddressSync(usdcMint, deployer.publicKey);
  const toAta = getAssociatedTokenAddressSync(usdcMint, recipient);

  const tx = new Transaction();
  try {
    await getAccount(connection, toAta);
  } catch {
    tx.add(createAssociatedTokenAccountInstruction(deployer.publicKey, toAta, recipient, usdcMint));
  }
  tx.add(createTransferInstruction(fromAta, toAta, deployer.publicKey, amountRaw));
  return sendAndConfirmTransaction(connection, tx, [deployer], { commitment: "confirmed" });
}
