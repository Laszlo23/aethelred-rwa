import { formatEuro } from "@/lib/format";
import type { OrderBookDTO } from "@/lib/types";

interface OrderBookProps {
  book: OrderBookDTO;
}

function DepthRow({
  price,
  size,
  total,
  side,
  maxTotal,
}: {
  price: number;
  size: number;
  total: number;
  side: "bid" | "ask";
  maxTotal: number;
}) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  return (
    <div className="relative grid grid-cols-3 gap-2 py-0.5 text-[11px] tabular-nums">
      <div
        className={`absolute inset-y-0 ${side === "bid" ? "right-0 bg-verified/10" : "left-0 bg-destructive/10"}`}
        style={{ width: `${pct}%` }}
      />
      <span className={side === "bid" ? "text-verified" : "text-destructive"}>
        {formatEuro(price)}
      </span>
      <span className="text-right text-muted-foreground">{formatEuro(size)}</span>
      <span className="text-right">{formatEuro(total)}</span>
    </div>
  );
}

export function OrderBook({ book }: OrderBookProps) {
  const maxTotal = Math.max(
    book.bids[book.bids.length - 1]?.totalCents ?? 0,
    book.asks[book.asks.length - 1]?.totalCents ?? 0,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs font-semibold">Order book</p>
        {book.isSynthetic && (
          <span className="rounded bg-gold-soft/30 px-1.5 py-0.5 text-[10px] text-accent">
            Index book
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 px-3 py-1 text-[10px] text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        {[...book.asks].reverse().map((l, i) => (
          <DepthRow
            key={`a-${i}`}
            price={l.priceCents}
            size={l.sizeCents}
            total={l.totalCents}
            side="ask"
            maxTotal={maxTotal}
          />
        ))}
        <div className="my-1 border-y border-border py-1 text-center text-xs text-muted-foreground">
          Spread {book.spreadBps / 100}%
        </div>
        {book.bids.map((l, i) => (
          <DepthRow
            key={`b-${i}`}
            price={l.priceCents}
            size={l.sizeCents}
            total={l.totalCents}
            side="bid"
            maxTotal={maxTotal}
          />
        ))}
      </div>
    </div>
  );
}
