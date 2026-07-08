import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  Coins,
  Layers,
  Lock,
  Repeat2,
  TrendingUp,
} from "lucide-react";
import type { PortfolioDTO } from "@/lib/types";
import { formatEuro, formatPercent, formatUsdc } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePerpPositions } from "@/hooks/use-perp-terminal";

interface DefiDashboardProps {
  data: PortfolioDTO;
  walletAddress?: string;
}

function MetricCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="bg-background p-6">
      <p className="eyebrow">{label}</p>
      <p className="tabular mt-2 font-mono text-2xl font-medium tracking-tight">{value}</p>
      {(sub || trend) && (
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs",
            trend === "up" && "text-verified",
            trend === "down" && "text-destructive",
            !trend && "text-muted-foreground",
          )}
        >
          {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
          {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

function AllocationBar({ staked, lent, idle }: { staked: number; lent: number; idle: number }) {
  const total = staked + lent + idle || 1;
  const segments = [
    { pct: (staked / total) * 100, color: "bg-accent", label: "Staked" },
    { pct: (lent / total) * 100, color: "bg-verified", label: "Lent collateral" },
    { pct: (idle / total) * 100, color: "bg-border", label: "Idle" },
  ];

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-border">
        {segments.map((s) => (
          <div
            key={s.label}
            className={cn("h-full transition-all", s.color)}
            style={{ width: `${s.pct}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", s.color)} />
            {s.label} {s.pct.toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}

export function DefiDashboard({ data, walletAddress }: DefiDashboardProps) {
  const { data: perpPositions = [] } = usePerpPositions(walletAddress);
  const { dashboard, positions, lendingPositions, eligiblePerks } = data;
  const pnlUp = dashboard.totalPnlCents >= 0;
  const marketTotal = positions.reduce((s, p) => s + p.marketValueCents, 0);
  const stakedTotal = dashboard.stakedValueCents;
  const lentCollateral = positions.reduce((s, p) => s + p.collateralBps, 0);
  const idleValue = Math.max(0, marketTotal - stakedTotal);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Net worth"
          value={formatEuro(dashboard.netWorthCents)}
          sub={`${positions.length} RWA positions`}
        />
        <MetricCard
          label="Total PnL"
          value={`${pnlUp ? "+" : ""}${formatUsdc(dashboard.totalPnlCents)}`}
          sub={`${formatPercent(dashboard.pnlPercentBps)} all-time`}
          trend={pnlUp ? "up" : "down"}
        />
        <MetricCard
          label="Staked (yield)"
          value={formatEuro(dashboard.stakedValueCents)}
          sub={`${formatPercent(dashboard.stakingApyBps)} blended APY`}
        />
        <MetricCard
          label="Borrowed USDC"
          value={formatUsdc(dashboard.lentPrincipalCents)}
          sub={
            dashboard.lendingApyBps
              ? `${formatPercent(dashboard.lendingApyBps)} avg borrow rate`
              : "No active loans"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Layers className="h-5 w-5 text-accent" />
              Positions
            </h2>
            <span className="text-xs text-muted-foreground">{positions.length} assets</span>
          </div>

          {positions.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Share</th>
                    <th className="pb-3 font-medium">Value</th>
                    <th className="pb-3 font-medium">PnL</th>
                    <th className="pb-3 font-medium">Yield</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {positions.map((p) => (
                    <tr key={p.assetId} className="group">
                      <td className="py-4 pr-4">
                        <Link
                          to="/assets/$assetId"
                          params={{ assetId: p.assetSlug }}
                          className="flex items-center gap-3 font-medium hover:text-accent"
                        >
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                          {p.assetName}
                        </Link>
                      </td>
                      <td className="tabular py-4 font-mono">{(p.shareBps / 100).toFixed(2)}%</td>
                      <td className="tabular py-4 font-mono">{formatEuro(p.marketValueCents)}</td>
                      <td
                        className={cn(
                          "tabular py-4 font-mono",
                          p.unrealizedPnlCents >= 0 ? "text-verified" : "text-destructive",
                        )}
                      >
                        {p.unrealizedPnlCents >= 0 ? "+" : ""}
                        {formatUsdc(p.unrealizedPnlCents + p.realizedYieldCents)}
                      </td>
                      <td className="tabular py-4 font-mono text-accent">
                        {formatPercent(p.yieldApyBps)}
                      </td>
                      <td className="py-4">
                        {p.collateralBps > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-verified/30 bg-verified/10 px-2 py-0.5 text-[11px] text-verified">
                            <Lock className="h-3 w-3" />
                            {(p.collateralBps / 100).toFixed(1)}% collateral
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-gold-soft/30 px-2 py-0.5 text-[11px] text-accent">
                            <TrendingUp className="h-3 w-3" />
                            Staking
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              No token positions yet.{" "}
              <Link to="/explore" className="text-accent hover:underline">
                Browse assets →
              </Link>
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">Capital allocation</h2>
          <p className="mt-1 text-sm text-muted-foreground">How your RWA exposure is deployed</p>
          <div className="mt-6">
            <AllocationBar
              staked={stakedTotal}
              lent={dashboard.lentPrincipalCents}
              idle={idleValue}
            />
          </div>
          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Yield earned</dt>
              <dd className="tabular font-mono text-verified">
                +{formatUsdc(data.totalYieldEarnedCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Collateral pledged</dt>
              <dd className="tabular font-mono">{(lentCollateral / 100).toFixed(1)}%</dd>
            </div>
          </dl>
        </section>
      </div>

      {perpPositions.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Repeat2 className="h-5 w-5 text-accent" />
            Perpetual positions
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {perpPositions.map((p) => (
              <Link
                key={p.id}
                to="/markets/$symbol"
                params={{ symbol: p.symbol }}
                className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{p.symbol}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {p.side} · {p.leverage}x
                    </p>
                  </div>
                  <p
                    className={cn(
                      "tabular font-mono text-sm",
                      p.unrealizedPnlCents >= 0 ? "text-verified" : "text-destructive",
                    )}
                  >
                    {formatEuro(p.unrealizedPnlCents)}
                  </p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Size {formatEuro(p.sizeCents)} · Entry {formatEuro(p.entryPriceCents)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lendingPositions.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Coins className="h-5 w-5 text-accent" />
            Lending positions
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {lendingPositions.map((lp) => (
              <Link
                key={lp.id}
                to="/assets/$assetId"
                params={{ assetId: lp.assetSlug }}
                className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{lp.assetName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lp.collateralShareBps / 100}% collateral · {lp.apyBps / 100}% APY
                    </p>
                  </div>
                  <p className="tabular font-mono text-sm">{formatUsdc(lp.principalCents)}</p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Accrued interest {formatUsdc(lp.accruedInterestCents)}
                  {lp.healthFactorBps != null && (
                    <> · Health {(lp.healthFactorBps / 100).toFixed(0)}%</>
                  )}
                  {lp.liquidationPriceCents != null && (
                    <> · Liq. {formatUsdc(lp.liquidationPriceCents)}</>
                  )}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {eligiblePerks.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BedDouble className="h-5 w-5 text-accent" />
            Holder perks
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {eligiblePerks.map((perk) => (
              <li
                key={`${perk.assetSlug}-${perk.id}`}
                className="rounded-xl border border-accent/20 bg-gold-soft/20 px-5 py-4"
              >
                <p className="text-sm font-medium">{perk.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {perk.assetName} · {perk.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
