import {
  ArrowRight,
  Building2,
  Factory,
  FileText,
  ShieldCheck,
  Unlock,
  Wheat,
  BadgeCheck,
  Coins,
  LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    phase: "Verify",
    title: "Tokenize your asset",
    description: "List property, hotels, or income streams. Guardian-ready in minutes.",
    icon: Building2,
    accent: "from-accent/20 to-transparent",
    examples: [
      { icon: Building2, label: "Property" },
      { icon: Factory, label: "Business" },
      { icon: Wheat, label: "Agriculture" },
      { icon: FileText, label: "Revenue" },
    ],
  },
  {
    phase: "Back",
    title: "Guardian attests",
    description: "AI verifies ownership, valuation, debt, and risk — on-chain passport issued.",
    icon: ShieldCheck,
    accent: "from-verified/15 to-transparent",
    checks: [
      { icon: BadgeCheck, label: "Ownership" },
      { icon: LineChart, label: "Value" },
      { icon: Coins, label: "Debt" },
      { icon: ShieldCheck, label: "Risk" },
    ],
  },
  {
    phase: "Unlock",
    title: "Earn & trade",
    description: "Buy tokens, lend USDC, earn rent share, and trade on perpetual markets.",
    icon: Unlock,
    accent: "from-gold-soft to-transparent",
    outcomes: ["Rent yield", "Holder perks", "USDC lending", "Perps"],
  },
] as const;

function FlowConnector() {
  return (
    <div aria-hidden className="hidden items-center justify-center md:flex md:w-12 lg:w-16">
      <div className="relative h-px w-full bg-gradient-to-r from-border via-accent/50 to-border">
        <ArrowRight className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-accent/70" />
      </div>
    </div>
  );
}

function MiniChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground">
      <Icon className="h-3 w-3 text-accent" strokeWidth={1.75} />
      {label}
    </span>
  );
}

export function HowItWorksSection() {
  return (
    <section>
      <div className="mb-16 max-w-2xl">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
          Verify. Back. <span className="text-editorial text-accent">Unlock.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Three steps from bricks to on-chain real assets — with bank titles retired and community
          capital in control.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
        {steps.map((step, i) => (
          <div key={step.phase} className="flex flex-1 flex-col md:flex-row md:items-stretch">
            <article
              className={cn(
                "group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-border-strong",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
                  step.accent,
                )}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-gold-soft shadow-glow-gold">
                    <step.icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="text-gold-gradient font-mono text-3xl font-semibold leading-none opacity-80">
                    0{i + 1}
                  </span>
                </div>

                <p className="eyebrow mt-6 !text-accent">{step.phase}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {"examples" in step && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {step.examples.map((ex) => (
                      <MiniChip key={ex.label} icon={ex.icon} label={ex.label} />
                    ))}
                  </div>
                )}

                {"checks" in step && (
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {step.checks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 px-3 py-2.5 text-xs"
                      >
                        <check.icon className="h-3.5 w-3.5 shrink-0 text-verified" />
                        {check.label}
                      </div>
                    ))}
                  </div>
                )}

                {"outcomes" in step && (
                  <ul className="mt-6 space-y-2">
                    {step.outcomes.map((o) => (
                      <li key={o} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
            {i < steps.length - 1 && <FlowConnector />}
          </div>
        ))}
      </div>
    </section>
  );
}
