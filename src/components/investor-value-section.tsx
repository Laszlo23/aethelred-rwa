import { Building2, LineChart, Repeat2, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

interface ValueCardProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
  cta: { label: string; to: string };
}

function ValueCard({ eyebrow, title, description, bullets, icon: Icon, cta }: ValueCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-border-strong lg:p-10">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold-soft opacity-60 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft">
          <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>
        <p className="eyebrow mt-6">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          to={cta.to}
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-foreground"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

const perpetualHighlights = [
  {
    label: "Real estate",
    detail: "Apartments, commercial, land",
    icon: Building2,
  },
  {
    label: "Yield exposure",
    detail: "Rental income & debt paydown",
    icon: TrendingUp,
  },
  {
    label: "Perpetual markets",
    detail: "Long or short verified RWAs",
    icon: Repeat2,
  },
] as const;

export function InvestorValueSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Why Aethelred</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            The platform for{" "}
            <span className="text-editorial text-accent">tokenized real assets.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            The bank holds the title. We raise community capital to retire the lien and place real
            assets in token holders&apos; hands — with stays, governance, rent share, and USDC
            lending against your shares.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ValueCard
            eyebrow="For investors"
            title="Put capital to work in real assets"
            description="Access institutional-grade RWAs without buying a whole building. Every position is backed by verified collateral, transparent debt, and daily Guardian monitoring."
            bullets={[
              "Buy into apartments, hotels, and commercial properties verified by Guardian",
              "Unlock holder perks — stays, dining credits, governance, and rent dividends",
              "Lend USDC against your shares; profits flow pro-rata to all token holders",
            ]}
            icon={LineChart}
            cta={{ label: "Explore assets", to: "/explore" }}
          />
          <ValueCard
            eyebrow="For asset owners"
            title="Tokenize what you own"
            description="Turn apartments, hotels, or commercial blocks into verified tokens. Raise from the community to buy out the bank — keep operating income while holders share the upside."
            bullets={[
              "List property with a digital passport and bank-title transparency",
              "Community raise retires senior debt; tokens represent real ownership",
              "Configure holder perks — stays, lounge access, rent share tiers",
            ]}
            icon={Wallet}
            cta={{ label: "Tokenize an asset", to: "/create" }}
          />
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-surface-elevated p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-verified" />
                <p className="eyebrow !text-verified">Perpetuals-ready infrastructure</p>
              </div>
              <p className="mt-3 text-lg font-medium tracking-tight">
                Verified RWAs are designed to be tradable — not locked in a vault.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Each asset passport feeds collateral data into perpetual markets, so investors can
                express conviction on real estate and income streams with the same clarity they
                expect from modern trading platforms.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
              {perpetualHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-background/60 px-4 py-5 text-center"
                >
                  <item.icon className="mx-auto h-5 w-5 text-accent" strokeWidth={1.5} />
                  <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
