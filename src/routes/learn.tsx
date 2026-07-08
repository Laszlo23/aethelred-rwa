import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HowItWorksSection } from "@/components/how-it-works";
import { GuardianSpotlight } from "@/components/guardian-spotlight";
import { FunnelProgress } from "@/components/hub/funnel-progress";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/learn")({
  head: () =>
    pageSeo({
      title: "Understand RWA",
      description:
        "Learn how real-world assets connect to blockchain — verified ownership, Guardian attestation, and community participation.",
      path: "/learn",
    }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <Link
        to="/choose"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to path selection
      </Link>

      <FunnelProgress currentStep={2} label="Learn — Understand RWA" />

      <header className="mb-14 max-w-2xl">
        <p className="eyebrow">Start guide</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Real-world assets, <span className="text-editorial text-accent">made simple.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          No crypto jargon required. Here is how Aethelred connects physical assets with digital
          ownership.
        </p>
      </header>

      <section className="mb-16 rounded-2xl border border-border bg-surface p-8 lg:p-10">
        <p className="eyebrow">Step 1</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">What is an RWA?</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          A Real-World Asset (RWA) is something tangible — a building, land, water rights, or
          business — represented as a verified digital token. Instead of buying an entire property,
          you can own a share backed by real collateral and transparent data.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Every asset on Aethelred has a digital passport showing its value, debt, and trust score —
          so you always know what you own.
        </p>
      </section>

      <section className="mb-16">
        <p className="eyebrow mb-8">Step 2</p>
        <GuardianSpotlight />
      </section>

      <section className="mb-16">
        <p className="eyebrow mb-8">Step 3</p>
        <HowItWorksSection />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-8 text-center lg:p-10">
        <h2 className="text-xl font-semibold">Ready to explore?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse verified assets or tokenize your own property.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/explore"
            search={{ from: "hub" }}
            className="btn-hero-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
          >
            Explore Assets
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/choose"
            className="btn-hero-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
          >
            Choose another path
          </Link>
        </div>
      </section>
    </div>
  );
}
