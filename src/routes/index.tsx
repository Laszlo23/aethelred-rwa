import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HubPillars } from "@/components/hub/hub-pillars";
import { BuildingCultureNetwork } from "@/components/hub/building-culture-network";
import { SimplePassportCard } from "@/components/simple-passport-card";
import { HeroPassportCard } from "@/components/hero-passport-card";
import { HeroVideoBackground } from "@/components/hero-video-background";
import { HowItWorksSection } from "@/components/how-it-works";
import { GuardianSpotlight } from "@/components/guardian-spotlight";
import { ActionLink } from "@/components/action-link";
import { AssetCard } from "@/components/asset-card";
import { useAssets } from "@/hooks/use-api";
import { listAssets } from "@/api/assets";
import { BC_FEATURED_SLUGS } from "@/lib/data/seed-building-culture";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ["assets", undefined],
      queryFn: () => listAssets({ data: {} }),
    });
  },
  head: () =>
    pageSeo({
      title: "Own a piece of the real world",
      description:
        "Discover verified buildings, land, water, and real assets. Everything backed by transparent collateral and Guardian verification.",
      path: "/",
    }),
  component: HubPage,
});

function HubPage() {
  const { data: assets = [] } = useAssets();
  const heroAsset = assets.find((a) => a.slug === "berggasse-35") ?? assets[0];
  const featuredProperties = BC_FEATURED_SLUGS.map((slug) =>
    assets.find((a) => a.slug === slug),
  ).filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
        <HeroVideoBackground />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-28">
          <div className="animate-fade-up space-y-8 lg:space-y-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/60 backdrop-blur-sm">
              Aethelred Hub
            </span>

            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-balance text-white md:text-6xl lg:text-7xl">
              Own a piece of the <span className="text-gold-gradient">real world.</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/65">
              Discover verified buildings, land, water, and real assets. Everything backed by
              transparent collateral and Guardian verification.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <ActionLink to="/choose" icon={ArrowRight} variant="hero-primary">
                Explore Real Assets
              </ActionLink>
              <a
                href="#how-it-works"
                className="btn-hero-secondary inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold"
              >
                How it Works
              </a>
            </div>
          </div>

          {heroAsset && (
            <div className="animate-float-slow">
              <HeroPassportCard
                name={heroAsset.name}
                slug={heroAsset.slug}
                valueCents={heroAsset.valueCents}
                debtCents={heroAsset.debtCents}
                trustScore={heroAsset.passport?.trustScore ?? 97}
              />
            </div>
          )}
        </div>
      </section>

      <HubPillars />

      {featuredProperties.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Building Culture</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  Featured real assets —{" "}
                  <span className="text-editorial text-accent">verified on-chain.</span>
                </h2>
              </div>
              <Link
                to="/explore"
                search={{ from: "hub" }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                View all assets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        </section>
      )}

      <BuildingCultureNetwork assets={assets} />

      <section id="how-it-works" className="border-t border-border scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:py-32">
          <HowItWorksSection />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="max-w-md">
              <p className="eyebrow">Digital passport</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Every asset gets a{" "}
                <span className="text-editorial text-accent">digital passport.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                One clear view of what an asset is worth, what debt sits on it, and how much
                liquidity you can unlock — updated as things change.
              </p>
            </div>
            {heroAsset && (
              <SimplePassportCard
                name="Vienna Apartment Complex"
                valueCents={1_500_000_00}
                debtCents={500_000_00}
                availableCents={500_000_00}
                trustScore={97}
              />
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:py-32">
          <GuardianSpotlight />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="text-2xl leading-relaxed tracking-tight md:text-3xl">
            <span className="text-editorial text-accent">Discover</span> → Verify → Own →
            Participate
          </p>
          <p className="mt-4 text-muted-foreground">
            One place where anyone can discover, understand, verify, and own real-world assets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ActionLink to="/choose" icon={ArrowRight} variant="hero-primary">
              Explore Real Assets
            </ActionLink>
          </div>
        </div>
      </section>
    </>
  );
}
