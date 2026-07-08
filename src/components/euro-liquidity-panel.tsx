import { ModuleStatusBadge } from "@/components/module-status-badge";
import { useLiquidityPool } from "@/hooks/use-api";
import { formatEuroCompact, formatPercent } from "@/lib/format";

export function EuroLiquidityPanel() {
  const { data } = useLiquidityPool();

  return (
    <section className="rounded-2xl border border-border bg-surface p-8 lg:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <p className="eyebrow">EURO Liquidity Layer</p>
        <ModuleStatusBadge status="in_progress" />
      </div>
      <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight md:text-3xl">
        Verified asset-backed liquidity —{" "}
        <span className="text-editorial text-accent">not a random stablecoin.</span>
      </h2>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Every EURO in circulation is backed by Guardian-verified collateral. Users interact with
        transparent, asset-anchored liquidity — not opaque synthetic exposure. Vault SPL custody and
        EURO mint CPIs are in progress on devnet — see{" "}
        <a href="/technology" className="text-accent hover:underline">
          Technology
        </a>{" "}
        and the architecture doc.
      </p>
      <dl className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="panel p-6">
          <dt className="eyebrow">Collateral Pool</dt>
          <dd className="tabular mt-2 font-mono text-2xl md:text-3xl">
            {data ? formatEuroCompact(data.collateralCents) : "€412.8M"}
          </dd>
        </div>
        <div className="panel bg-gold-soft/50 p-6 ring-1 ring-accent/20">
          <dt className="eyebrow !text-accent">Backing Ratio</dt>
          <dd className="tabular mt-2 font-mono text-2xl text-accent md:text-3xl">
            {data ? formatPercent(data.backingRatioBps) : "157.6%"}
          </dd>
        </div>
        <div className="panel p-6">
          <dt className="eyebrow">EURO Supply</dt>
          <dd className="tabular mt-2 font-mono text-2xl md:text-3xl">
            {data ? formatEuroCompact(data.euroSupplyCents) : "€275M"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
