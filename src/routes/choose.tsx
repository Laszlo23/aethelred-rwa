import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PathCard, persistHubPath } from "@/components/hub/path-card";
import { FunnelProgress } from "@/components/hub/funnel-progress";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/choose")({
  head: () =>
    pageSeo({
      title: "Choose your path",
      description:
        "Invest in real assets, tokenize your property, or learn how blockchain connects physical assets with digital ownership.",
      path: "/choose",
    }),
  component: ChoosePage,
});

function ChoosePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hub
      </Link>

      <FunnelProgress currentStep={2} label="Step 2 — Choose your path" />

      <header className="mb-12 max-w-2xl">
        <p className="eyebrow">Your journey</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          What brings you to{" "}
          <span className="text-editorial text-accent">Aethelred?</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pick a path — you can always explore everything later from the main navigation.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <PathCard
          emoji="🏠"
          title="Own real assets"
          description="Access apartments, land, and real-world assets without buying an entire property."
          ctaLabel="Explore Assets"
          to="/explore"
          search={{ from: "hub" }}
          onNavigate={() => persistHubPath("invest")}
        />
        <PathCard
          emoji="🏗️"
          title="Tokenize my asset"
          description="Turn your property, business, or real-world asset into a verified digital asset."
          ctaLabel="Create Asset"
          to="/create"
          onNavigate={() => persistHubPath("tokenize")}
        />
        <PathCard
          emoji="🌎"
          title="Understand RWA"
          description="Learn how blockchain connects physical assets with digital ownership."
          ctaLabel="Start Guide"
          to="/learn"
          onNavigate={() => persistHubPath("learn")}
        />
      </div>
    </div>
  );
}
