import { BadgeCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroPassportCardProps {
  name: string;
  slug: string;
  valueCents: number;
  debtCents: number;
  trustScore: number;
  className?: string;
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{label}</span>
        <span className="tabular font-mono text-white/70">{clamped}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent/80 to-gold"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function HeroPassportCard({
  name,
  slug,
  valueCents,
  debtCents,
  trustScore,
  className,
}: HeroPassportCardProps) {
  const debtRatio = valueCents > 0 ? Math.round((debtCents / valueCents) * 100) : 0;
  const collateralHealth = Math.max(0, 100 - debtRatio);

  return (
    <div
      className={cn(
        "glass-panel shadow-passport rounded-2xl p-7 md:p-8",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-verified/30 bg-verified/10 px-3 py-1 text-xs font-medium text-verified shadow-[0_0_20px_-4px_oklch(0.75_0.14_155/0.5)]">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </span>
        <span className="text-gold-gradient tabular text-4xl font-semibold tracking-tight md:text-5xl">
          {trustScore}%
        </span>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold tracking-tight text-white md:text-xl">
          {name}
        </h3>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/40">
          {slug.replace(/-/g, " ")}
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <ProgressBar value={trustScore} label="Trust score" />
        <ProgressBar value={collateralHealth} label="Collateral health" />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Shield className="h-3.5 w-3.5 text-accent" />
          Guardian attested
        </div>
        <span className="tabular font-mono text-sm text-accent">{trustScore}%</span>
      </div>
    </div>
  );
}
