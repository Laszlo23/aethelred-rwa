import { Link } from "@tanstack/react-router";
import { ArrowRight, Scale, Sparkles, Users } from "lucide-react";
import type { AssetDTO } from "@/lib/types";
import { usePublicMetrics, useProposals } from "@/hooks/use-api";
import { formatEuro } from "@/lib/format";
import { BC_FEATURED_SLUGS } from "@/lib/data/seed-building-culture";

interface BuildingCultureNetworkProps {
  assets: AssetDTO[];
}

export function BuildingCultureNetwork({ assets }: BuildingCultureNetworkProps) {
  const { data: metrics } = usePublicMetrics();
  const { data: proposals = [] } = useProposals();

  const upcomingAssets = assets.filter((a) => !BC_FEATURED_SLUGS.includes(a.slug)).slice(0, 2);

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">Building Culture Network</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Community-owned <span className="text-editorial text-accent">real assets.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We are building the world&apos;s largest community-owned real asset network.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <Users className="h-5 w-5 text-accent" />
            <p className="tabular mt-4 font-mono text-3xl font-semibold">
              {metrics?.uniqueShareholders ?? "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Asset holders</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="tabular mt-4 font-mono text-3xl font-semibold">
              {metrics?.assetCount ?? "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Verified assets</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <Scale className="h-5 w-5 text-accent" />
            <p className="tabular mt-4 font-mono text-3xl font-semibold">{proposals.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Governance proposals</p>
          </div>
        </div>

        {upcomingAssets.length > 0 && (
          <div className="mt-12">
            <p className="eyebrow">New assets coming</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {upcomingAssets.map((asset) => (
                <Link
                  key={asset.id}
                  to="/assets/$assetId"
                  params={{ assetId: asset.slug }}
                  className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-surface/50 p-4 transition-colors hover:border-border-strong"
                >
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.location}</p>
                    <p className="tabular mt-1 font-mono text-xs text-accent">
                      {formatEuro(asset.valueCents)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gold-soft px-2.5 py-0.5 text-[10px] font-medium text-accent">
                    Coming soon
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
          <div>
            <p className="text-sm font-medium">Join the community</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete tasks, earn rewards, and help grow the network.
              {metrics?.taskCount ? ` ${metrics.taskCount} tasks available.` : ""}
            </p>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            Explore community
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {proposals.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface/60 p-6">
            <div>
              <p className="text-sm font-medium">Governance activity</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Shape protocol decisions with verified passport holders.
              </p>
            </div>
            <Link
              to="/governance"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              View proposals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
