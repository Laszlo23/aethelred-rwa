import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { AssetDetailDTO } from "@/lib/types";
import { formatEuro, formatPercent } from "@/lib/format";
import { BuyTokensPanel } from "@/components/asset/buy-tokens-panel";

interface InvestPanelProps {
  asset: AssetDetailDTO;
}

export function InvestPanel({ asset }: InvestPanelProps) {
  const property = asset.property;
  const raisePct = property ? Math.min(100, Math.round(property.tokensSoldBps / 100)) : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24">
      <p className="eyebrow">Invest</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{formatEuro(asset.valueCents)}</p>
      <p className="mt-1 text-sm text-muted-foreground">Total asset value</p>

      <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Net yield</dt>
          <dd className="tabular font-mono text-accent">{formatPercent(asset.yieldBps)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Trust score</dt>
          <dd className="tabular font-mono">{asset.passport?.trustScore ?? "—"}%</dd>
        </div>
        {property && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tokens sold</dt>
            <dd className="tabular font-mono">{raisePct}%</dd>
          </div>
        )}
      </dl>

      {property && (
        <div className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent" style={{ width: `${raisePct}%` }} />
          </div>
        </div>
      )}

      {property?.tokenSymbol && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-accent/30 bg-gold-soft/20 px-2.5 py-1 font-mono text-accent">
            {property.tokenSymbol}
          </span>
          {asset.passport?.solanaMint && asset.passport.solanaMint.length > 32 && (
            <a
              href={`https://explorer.solana.com/address/${asset.passport.solanaMint}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-accent"
            >
              Solana mint ↗
            </a>
          )}
          {property.evmShareToken && (
            <a
              href={`https://basescan.org/token/${property.evmShareToken}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-accent"
            >
              Base OG token ↗
            </a>
          )}
        </div>
      )}

      <BuyTokensPanel asset={asset} />

      <Link
        to="/markets/$symbol"
        params={{ symbol: property?.tokenSymbol ? `${property.tokenSymbol}-PERP` : "OG1-PERP" }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/5"
      >
        Trade perp
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
