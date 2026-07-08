import { formatEuro, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PerpMarketDTO } from "@/lib/types";

interface MarketSelectorProps {
  markets: PerpMarketDTO[];
  activeSymbol: string;
  onSelect: (symbol: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export function MarketSelector({
  markets,
  activeSymbol,
  onSelect,
  search,
  onSearchChange,
}: MarketSelectorProps) {
  const filtered = markets.filter((m) => m.symbol.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-3">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search markets"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((m) => {
          const change = m.change24hBps ?? 0;
          return (
            <button
              key={m.symbol}
              type="button"
              onClick={() => onSelect(m.symbol)}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-border/50 px-3 py-2.5 text-left text-xs transition-colors hover:bg-white/5",
                activeSymbol === m.symbol && "bg-gold-soft/20",
              )}
            >
              <div>
                <p className="font-semibold">{m.symbol}</p>
                <p className="text-muted-foreground">Fund {formatPercent(m.fundingRateBps)}</p>
              </div>
              <div className="text-right">
                <p className="tabular font-mono">{formatEuro(m.indexPriceCents)}</p>
                <p
                  className={cn(
                    "tabular font-mono",
                    change >= 0 ? "text-verified" : "text-destructive",
                  )}
                >
                  {change >= 0 ? "+" : ""}
                  {formatPercent(change)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
