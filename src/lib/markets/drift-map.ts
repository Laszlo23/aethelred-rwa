/** Drift perp market index proxy until custom RWA markets are listed on Drift. */
export const DEFAULT_DRIFT_MARKET_INDEX = 0;

export function getDriftMarketIndex(symbol: string, dbIndex?: number | null): number {
  if (dbIndex != null) return dbIndex;
  if (symbol === "BC-RWA") return 1;
  return DEFAULT_DRIFT_MARKET_INDEX;
}

export const DRIFT_ENV = (import.meta.env.VITE_DRIFT_ENV as string) || "devnet";
