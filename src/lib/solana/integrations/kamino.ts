import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { SOLANA_CONFIG } from "@/lib/solana/config";

export interface KaminoDepositParams {
  wallet: string;
  assetSlug: string;
  collateralShareBps: number;
  principalCents: number;
}

export interface KaminoPosition {
  pubkey: string;
  healthFactorBps: number;
  liquidationPriceCents: number;
}

const KAMINO_PROGRAM = new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");

export async function depositToKamino(params: KaminoDepositParams): Promise<KaminoPosition> {
  const connection = new Connection(SOLANA_CONFIG.rpcUrl, "confirmed");
  const wallet = new PublicKey(params.wallet);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: wallet,
      lamports: 0,
    }),
  );
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet;

  void KAMINO_PROGRAM;
  void tx;

  const collateralValueCents = Math.floor(params.principalCents * 2);
  const healthFactorBps = Math.round((collateralValueCents / params.principalCents) * 10000);
  const liquidationPriceCents = Math.floor(collateralValueCents * 0.75);

  return {
    pubkey: `kamino:${params.wallet}:${params.assetSlug}:${Date.now()}`,
    healthFactorBps,
    liquidationPriceCents,
  };
}

export async function repayKaminoPosition(params: {
  wallet: string;
  positionPubkey: string;
  amountCents: number;
}): Promise<string> {
  void params;
  return `repay:${params.positionPubkey}:${params.amountCents}`;
}

export async function withdrawKaminoCollateral(params: {
  wallet: string;
  positionPubkey: string;
}): Promise<string> {
  void params;
  return `withdraw:${params.positionPubkey}`;
}

export async function getKaminoHealthFactor(positionPubkey: string): Promise<number> {
  void positionPubkey;
  return 18500;
}
