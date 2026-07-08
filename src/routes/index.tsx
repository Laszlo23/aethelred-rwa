import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { SimplePassportCard } from "@/components/simple-passport-card";
import { HeroPassportCard } from "@/components/hero-passport-card";
import { HeroVideoBackground } from "@/components/hero-video-background";
import { HowItWorksSection } from "@/components/how-it-works";
import { GuardianSpotlight } from "@/components/guardian-spotlight";
import { InvestorValueSection } from "@/components/investor-value-section";
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
      title: "Real Assets. Verified. Accessible.",
      description:
        "Turn real-world assets into trusted digital value. Verify ownership, see debt clearly, and unlock Euro-backed liquidity on Solana.",
      path: "/",
    }),
  component: LandingPage,
});

function LandingPage() {
  const { data: assets = [] } = useAssets();
  const heroAsset = assets.find((a) => a.slug === "berggasse-35") ?? assets[0];
  const featuredProperties = BC_FEATURED_SLUGS.map((slug) =>
    assets.find((a) => a.slug === slug),
  ).filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
        <HeroVideoBackground />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-28">
          <div className="animate-fade-up space-y-8 lg:space-y-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/60 backdrop-blur-sm">
              RWA
            </span>

            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-balance text-white md:text-6xl lg:text-7xl">
              Real Assets. <span className="text-gold-gradient">Verified.</span> Accessible.
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/65">
              Turn bricks into blocks. Every Euro backed by real collateral.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <ActionLink to="/create" icon={Plus} variant="hero-primary">
                Create Asset
              </ActionLink>
              <ActionLink to="/explore" icon={ArrowRight} variant="hero-secondary">
                Explore Assets
              </ActionLink>
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

      {/* Why this platform */}
      <InvestorValueSection />

      {/* Featured properties */}
      {featuredProperties.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:py-32">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Building Culture</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  City · Land · Water —{" "}
                  <span className="text-editorial text-accent">on Solana.</span>
                </h2>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                View collection
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

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:py-32">
          <HowItWorksSection />
        </div>
      </section>

      {/* Passport explainer */}
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

      {/* Guardian */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:py-32">
          <GuardianSpotlight />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="text-2xl leading-relaxed tracking-tight md:text-3xl">
            A simple way to turn real assets into{" "}
            <span className="text-editorial text-accent">trusted digital value.</span>
          </p>
          <div className="mt-10">
            <ActionLink to="/create" icon={Plus}>
              Create Asset
            </ActionLink>
          </div>
        </div>
      </section>
    </>
  );
}
