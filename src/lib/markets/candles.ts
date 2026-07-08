export type CandleInterval = "1m" | "5m" | "1h" | "1d";

const INTERVAL_MS: Record<CandleInterval, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "1h": 60 * 60_000,
  "1d": 24 * 60 * 60_000,
};

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateCandleHistory(
  symbol: string,
  markPriceCents: number,
  interval: CandleInterval,
  count: number,
  endAt = Date.now(),
): {
  openCents: number;
  highCents: number;
  lowCents: number;
  closeCents: number;
  volumeCents: number;
  recordedAt: Date;
}[] {
  const step = INTERVAL_MS[interval];
  const candles: ReturnType<typeof generateCandleHistory> = [];
  let price = markPriceCents;

  for (let i = count - 1; i >= 0; i--) {
    const t = endAt - i * step;
    const seed = t / step + symbol.length * 17;
    const drift = (pseudoRandom(seed) - 0.48) * 0.012;
    const open = price;
    const close = Math.max(100_00, Math.round(open * (1 + drift)));
    const wick = Math.round(open * (0.003 + pseudoRandom(seed + 1) * 0.008));
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick;
    const volumeCents = Math.floor(markPriceCents * (0.0001 + pseudoRandom(seed + 2) * 0.0004));

    candles.push({
      openCents: open,
      highCents: high,
      lowCents: Math.max(100_00, low),
      closeCents: close,
      volumeCents,
      recordedAt: new Date(t),
    });
    price = close;
  }

  return candles;
}

export function compute24hChange(candles: { closeCents: number }[]): number {
  if (candles.length < 2) return 0;
  const first = candles[0].closeCents;
  const last = candles[candles.length - 1].closeCents;
  if (first === 0) return 0;
  return Math.round(((last - first) / first) * 10000);
}

export function compute24hHighLow(candles: { highCents: number; lowCents: number }[]): {
  high24hCents: number;
  low24hCents: number;
} {
  if (candles.length === 0) {
    return { high24hCents: 0, low24hCents: 0 };
  }
  return {
    high24hCents: Math.max(...candles.map((c) => c.highCents)),
    low24hCents: Math.min(...candles.map((c) => c.lowCents)),
  };
}
