import { Link } from "@tanstack/react-router";
import { Building2, Compass, ShieldCheck, Users, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const pillars: {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Real assets",
    description: "Verified buildings, land, and water — tangible value on-chain.",
    to: "/explore",
    icon: Building2,
  },
  {
    title: "Verification",
    description: "Guardian checks ownership, valuation, debt, and risk continuously.",
    to: "/guardian",
    icon: ShieldCheck,
  },
  {
    title: "Community ownership",
    description: "Join holders building the world's largest real asset network.",
    to: "/tasks",
    icon: Users,
  },
  {
    title: "Yield opportunities",
    description: "Earn from rent share, debt paydown, and holder benefits.",
    to: "/funds",
    icon: TrendingUp,
  },
  {
    title: "Asset discovery",
    description: "Browse curated properties with transparent passports.",
    to: "/explore",
    icon: Compass,
  },
];

export function HubPillars() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">One ecosystem</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Discover. Verify. Own.{" "}
            <span className="text-editorial text-accent">Participate.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Aethelred Hub connects real assets, Guardian verification, community capital, and
            yield — in one place anyone can understand.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              to={pillar.to}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-strong"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-soft">
                <pillar.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-sm font-semibold tracking-tight">{pillar.title}</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
