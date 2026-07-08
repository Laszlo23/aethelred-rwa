import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AssetCard } from "@/components/asset-card";
import { useAssets } from "@/hooks/use-api";
import { listAssets } from "@/api/assets";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/explore")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ["assets", undefined],
      queryFn: () => listAssets({ data: {} }),
    });
  },
  head: () =>
    pageSeo({
      title: "Explore",
      description:
        "Browse verified Building Culture real-world assets. Curated properties, transparent debt, and on-chain passports.",
      path: "/explore",
    }),
  component: ExplorePage,
});

const categories = ["All", "City", "Land", "Water"] as const;

function ExplorePage() {
  const [filter, setFilter] = useState<string>("All");
  const { data: assets = [], isLoading } = useAssets();

  const filtered =
    filter === "All"
      ? assets
      : assets.filter((a) => a.property?.cultureSegment === filter.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:py-28">
      <header className="mb-14 max-w-2xl">
        <p className="eyebrow">Collection</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Curated real assets. <span className="text-editorial text-accent">Community owned.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Building Culture City, Land, and Water — curated cultural real estate on Solana. Bank
          titles retire; community capital and Guardian verification take over.
        </p>
      </header>

      <div className="mb-12 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === c
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <AssetCard key={a.id} asset={a} />
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground">No assets in this category.</p>
      )}
      {isLoading && <p className="text-center text-muted-foreground">Loading collection…</p>}
    </div>
  );
}
