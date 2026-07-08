import { createFileRoute, Link } from "@tanstack/react-router";
import { EuroLiquidityPanel } from "@/components/euro-liquidity-panel";
import { DebtTransparencyPanel } from "@/components/debt-transparency-panel";
import { HowItWorksSection } from "@/components/how-it-works";
import { ArrowRight } from "lucide-react";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/technology")({
  head: () =>
    pageSeo({
      title: "Technology",
      description:
        "How Aethelred tokenizes RWAs on Solana: Asset Passports, Euro liquidity, debt transparency, and Guardian audits.",
      path: "/technology",
    }),
  component: TechnologyPage,
});

function TechnologyPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-24 px-6 py-16 lg:space-y-32 lg:py-24">
      <header className="max-w-2xl">
        <p className="eyebrow">Protocol</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          The technology <span className="text-editorial text-accent">underneath.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Aethelred runs on verified collateral, continuous AI monitoring, and on-chain asset
          passports. Here is how the protocol works.
        </p>
      </header>

      <HowItWorksSection />

      <EuroLiquidityPanel />

      <DebtTransparencyPanel />

      <section className="rounded-2xl border border-border bg-surface p-8 lg:p-12">
        <p className="eyebrow">On-chain infrastructure</p>
        <h2 className="mt-3 text-2xl font-semibold">Built on Solana</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every verified asset receives a digital passport anchored on Solana as SPL metadata —
          ownership, valuation, debt, and audit history in one tamper-evident record.
        </p>
        <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Asset Passports", "Living digital identity for every RWA"],
            ["Collateral Vault", "150% backing ratio for EURO liquidity"],
            ["Guardian Agent", "Continuous AI verification and risk scoring"],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-border bg-background p-6">
              <dt className="font-semibold">{title}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{desc}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/vault"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            EURO Vault
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/passport"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            Passport gallery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
