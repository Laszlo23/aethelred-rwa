import { formatEuro } from "@/lib/format";
import type { PerpTradeDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TradesTapeProps {
  trades: PerpTradeDTO[];
}

export function TradesTape({ trades }: TradesTapeProps) {
  return (
    <div className="flex h-full flex-col border-l border-border">
      <p className="border-b border-border px-3 py-2 text-xs font-semibold">Recent trades</p>
      <div className="grid grid-cols-3 gap-2 px-3 py-1 text-[10px] text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        {trades.map((t) => (
          <div key={t.id} className="grid grid-cols-3 gap-2 py-0.5 text-[11px] tabular-nums">
            <span className={cn(t.side === "long" ? "text-verified" : "text-destructive")}>
              {formatEuro(t.priceCents)}
            </span>
            <span className="text-right text-muted-foreground">{formatEuro(t.sizeCents)}</span>
            <span className="text-right text-muted-foreground">
              {new Date(t.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
