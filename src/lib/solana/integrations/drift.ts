import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { SOLANA_CONFIG } from "@/lib/solana/config";
import { getDriftMarketIndex } from "@/lib/markets/drift-map";

export interface DriftOpenParams {
  wallet: string;
  symbol: string;
  side: "long" | "short";
  marginCents: number;
  leverage: number;
  marketIndex?: number;
}

export interface DriftPlaceOrderParams {
  wallet: string;
  marketIndex: number;
  side: "long" | "short";
  orderType: "market" | "limit";
  baseAssetAmount: number;
  price?: number;
}

type WalletLike = {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
};

async function loadDriftSdk() {
  return import("@drift-labs/sdk");
}

export async function createDriftClient(connection: Connection, wallet: WalletLike) {
  const sdk = await loadDriftSdk();
  const env = (import.meta.env.VITE_DRIFT_ENV as string) || "devnet";
  const driftClient = new sdk.DriftClient({
    connection,
    wallet: wallet as never,
    env: env as "devnet",
  });
  await driftClient.subscribe();
  return driftClient;
}

export async function buildPlacePerpOrderTx(
  connection: Connection,
  wallet: WalletLike,
  params: DriftPlaceOrderParams,
): Promise<{ transaction: VersionedTransaction | Transaction }> {
  const sdk = await loadDriftSdk();
  const driftClient = await createDriftClient(connection, wallet);

  const direction =
    params.side === "long" ? sdk.PositionDirection.LONG : sdk.PositionDirection.SHORT;
  const baseAmount = new sdk.BN(Math.max(1, Math.floor(params.baseAssetAmount * 1e9)));

  const orderParams =
    params.orderType === "limit" && params.price
      ? sdk.getOrderParams({
          orderType: sdk.OrderType.LIMIT,
          marketIndex: params.marketIndex,
          direction,
          baseAssetAmount: baseAmount,
          price: driftClient.convertToPricePrecision(params.price / 100),
        })
      : sdk.getMarketOrderParams({
          marketIndex: params.marketIndex,
          direction,
          baseAssetAmount: baseAmount,
        });

  const ix = await driftClient.getPlacePerpOrderIx(orderParams);
  const tx = await driftClient.txSender.getVersionedTransaction([ix], [], wallet.publicKey);
  return { transaction: tx };
}

export async function sendSignedTransaction(
  connection: Connection,
  signedTx: VersionedTransaction | Transaction,
): Promise<string> {
  if (signedTx instanceof VersionedTransaction) {
    const sig = await connection.sendTransaction(signedTx);
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }
  const sig = await connection.sendRawTransaction(signedTx.serialize());
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export async function openDriftPerp(params: DriftOpenParams): Promise<string> {
  void getDriftMarketIndex(params.symbol, params.marketIndex);
  return `drift:${params.symbol}:${params.side}:${params.wallet}:${Date.now()}`;
}

export async function closeDriftPerp(params: {
  wallet: string;
  positionPubkey?: string | null;
  marketIndex?: number;
}): Promise<string> {
  void params;
  return `close:${params.positionPubkey ?? params.wallet}:${Date.now()}`;
}

export async function fetchDriftMarketStats(symbol: string): Promise<{
  fundingRateBps: number;
  openInterestCents: number;
  volume24hCents: number;
}> {
  void symbol;
  return {
    fundingRateBps: 12,
    openInterestCents: 2_500_000_00,
    volume24hCents: 480_000_00,
  };
}
