import { formatEuro, formatPercent } from "@/lib/format";
import type { PerpTerminalDTO } from "@/lib/types";

interface MarketStatsBarProps {
  terminal: PerpTerminalDTO;
}

function formatCountdown(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

export function MarketStatsBar({ terminal }: MarketStatsBarProps) {
  const { market, fundingCountdownSec } = terminal;
  const change = market.change24hBps ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-border bg-surface px-4 py-3 text-xs">
      <div>
        <p className="text-muted-foreground">Mark</p>
        <p className="tabular mt-0.5 font-mono text-lg font-semibold">
          {formatEuro(market.indexPriceCents)}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground">24h</p>
        <p className={change >= 0 ? "text-verified" : "text-destructive"}>
          {change >= 0 ? "+" : ""}
          {formatPercent(change)}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground">24h High</p>
        <p className="tabular font-mono">{formatEuro(market.high24hCents ?? market.indexPriceCents)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">24h Low</p>
        <p className="tabular font-mono">{formatEuro(market.low24hCents ?? market.indexPriceCents)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Volume 24h</p>
        <p className="tabular font-mono">{formatEuro(market.volume24hCents)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Open interest</p>
        <p className="tabular font-mono">{formatEuro(market.openInterestCents)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Funding</p>
        <p className="tabular font-mono">{formatPercent(market.fundingRateBps)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Next funding</p>
        <p className="tabular font-mono">{formatCountdown(fundingCountdownSec)}</p>
      </div>
    </div>
  );
}
