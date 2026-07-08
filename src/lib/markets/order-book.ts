export interface OrderBookLevel {
  priceCents: number;
  sizeCents: number;
  totalCents: number;
}

export interface SyntheticOrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spreadBps: number;
  markPriceCents: number;
  isSynthetic: true;
}

export function buildSyntheticOrderBook(
  markPriceCents: number,
  depth = 15,
  fundingRateBps = 10,
  trustScore = 85,
): SyntheticOrderBook {
  const spreadBps = Math.max(4, Math.round(8 + fundingRateBps * 0.3 - (trustScore - 80) * 0.1));
  const halfSpread = (markPriceCents * spreadBps) / 20000;

  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < depth; i++) {
    const levelOffset = halfSpread * (1 + i * 0.35);
    const bidPrice = Math.round(markPriceCents - levelOffset);
    const askPrice = Math.round(markPriceCents + levelOffset);
    const decay = 1 / (1 + i * 0.22);
    const bidSize = Math.floor(markPriceCents * 0.00015 * decay);
    const askSize = Math.floor(markPriceCents * 0.00014 * decay);
    bidTotal += bidSize;
    askTotal += askSize;
    bids.push({ priceCents: bidPrice, sizeCents: bidSize, totalCents: bidTotal });
    asks.push({ priceCents: askPrice, sizeCents: askSize, totalCents: askTotal });
  }

  return {
    bids,
    asks,
    spreadBps,
    markPriceCents,
    isSynthetic: true,
  };
}

export function estimateLiquidationPriceCents(
  entryPriceCents: number,
  side: "long" | "short",
  leverage: number,
  maintenanceMarginBps = 500,
): number {
  const liqMoveBps = Math.floor(10000 / leverage - maintenanceMarginBps);
  const factor = liqMoveBps / 10000;
  if (side === "long") {
    return Math.max(0, Math.round(entryPriceCents * (1 - factor)));
  }
  return Math.round(entryPriceCents * (1 + factor));
}
