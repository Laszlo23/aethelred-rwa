import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getFundsTransparency } from "@/api/funds";
import { formatEuro, formatPercent } from "@/lib/format";
import { Shield, Wallet } from "lucide-react";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/funds")({
  head: () =>
    pageSeo({
      title: "Fund Transparency",
      description:
        "Open-book fund transparency for Building Culture RWAs: reserves, yields, and allocator exposure.",
      path: "/funds",
    }),
  component: FundsPage,
});

function FundsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["funds-transparency"],
    queryFn: () => getFundsTransparency(),
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-muted-foreground">Loading fund transparency…</p>
      </div>
    );
  }

  const reserveRatio =
    data.offChainReferenceCents > 0
      ? Math.round((data.onChainReserveCents / data.offChainReferenceCents) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:py-28">
      <header className="max-w-2xl">
        <p className="eyebrow">Transparent funds</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          On-chain reserves, <span className="text-editorial text-accent">auditable NAV.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Vault collateral, property-level AUM, and Guardian NAV attestations — reconciled against
          Building Culture reference acquisitions.
        </p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="eyebrow">Total AUM</p>
          <p className="tabular mt-2 font-mono text-2xl">{formatEuro(data.totalAumCents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="eyebrow">On-chain reserves</p>
          <p className="tabular mt-2 font-mono text-2xl">{formatEuro(data.onChainReserveCents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="eyebrow">Reserve coverage</p>
          <p className="tabular mt-2 font-mono text-2xl">{reserveRatio}%</p>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-lg font-semibold">Property breakdown</h2>
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {data.propertyBreakdown.map((p) => (
            <div key={p.slug} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.slug}</p>
              </div>
              <div className="text-right">
                <p className="tabular font-mono text-sm">{formatEuro(p.navCents)}</p>
                <p className="text-xs text-muted-foreground">
                  Trust {p.trustScore} · Ref {formatEuro(p.acquisitionCents)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold">Guardian NAV snapshots</h2>
          </div>
          <div className="mt-4 space-y-3">
            {data.oracleSnapshots.slice(0, 8).map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{s.assetSlug}</span>
                  <span className="tabular font-mono">{formatEuro(s.navCents)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.source} · {formatPercent(s.yieldBps)} yield ·{" "}
                  {new Date(s.recordedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold">Fund ledger</h2>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentLedger.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <div className="flex justify-between">
                  <span className="capitalize">{e.direction}</span>
                  <span className="tabular font-mono">{formatEuro(e.amountCents)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.currency}
                  {e.assetSlug ? ` · ${e.assetSlug}` : ""}
                  {e.txSignature ? ` · ${e.txSignature.slice(0, 12)}…` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
