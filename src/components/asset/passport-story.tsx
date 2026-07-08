import type { AssetDetailDTO } from "@/lib/types";
import { formatEuro } from "@/lib/format";
import { BadgeCheck, Coins, Gift, LineChart, ShieldCheck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PassportStoryProps {
  asset: AssetDetailDTO;
  onBecomeHolder: () => void;
  onViewPerks: () => void;
  onViewLend: () => void;
  onViewDebt: () => void;
}

const trustChecks: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: "Ownership checked" },
  { icon: LineChart, label: "Valuation monitored" },
  { icon: Wallet, label: "Debt transparency" },
  { icon: ShieldCheck, label: "Risk tracking" },
];

function buildIntro(asset: AssetDetailDTO): string {
  if (asset.property?.tagline) {
    return asset.property.tagline;
  }
  if (asset.property?.description) {
    return asset.property.description;
  }
  return `This ${asset.assetType.toLowerCase()} in ${asset.location} represents real-world ownership backed by verified property data.`;
}

export function PassportStory({
  asset,
  onBecomeHolder,
  onViewPerks,
  onViewLend,
  onViewDebt,
}: PassportStoryProps) {
  const trustScore = asset.passport?.trustScore ?? asset.health;
  const raiseProgress = asset.property?.communityRaiseTargetCents
    ? Math.min(100, Math.round(asset.property.tokensSoldBps / 100))
    : null;
  const firstPerk = asset.perks[0];

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-border bg-surface p-8 lg:p-10">
        <p className="eyebrow">What is this?</p>
        <p className="mt-4 text-lg leading-relaxed text-foreground/90">{buildIntro(asset)}</p>
        {asset.property?.description && asset.property.tagline && (
          <p className="mt-4 leading-relaxed text-muted-foreground">{asset.property.description}</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Why trust it?</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Guardian verification</h2>
          </div>
          {asset.status === "VERIFIED" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-verified/30 bg-verified/10 px-3 py-1 text-xs font-medium text-verified">
              <BadgeCheck className="h-3.5 w-3.5" />
              Guardian Verified · {trustScore}% trust
            </span>
          )}
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trustChecks.map((check) => (
            <li
              key={check.label}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-sm"
            >
              <check.icon className="h-4 w-4 shrink-0 text-verified" />
              {check.label}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onViewDebt}
          className="mt-6 text-sm font-medium text-accent hover:underline"
        >
          View debt transparency →
        </button>
      </section>

      <section>
        <p className="eyebrow">How can I participate?</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Three ways to join</h2>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-surface p-6">
            <Coins className="h-5 w-5 text-accent" />
            <h3 className="mt-4 font-semibold">Own tokens</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Buy a share of this asset without purchasing the entire property.
            </p>
            {raiseProgress != null && asset.property?.communityRaiseTargetCents && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Community progress</span>
                  <span className="tabular font-mono">{raiseProgress}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${raiseProgress}%` }}
                  />
                </div>
                <p className="tabular mt-2 font-mono text-xs text-muted-foreground">
                  {formatEuro(asset.property.communityRaiseTargetCents)} target
                </p>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-border bg-surface p-6">
            <Gift className="h-5 w-5 text-accent" />
            <h3 className="mt-4 font-semibold">Receive holder benefits</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {firstPerk
                ? firstPerk.title
                : "Exclusive perks for verified token holders — from stays to dining credits."}
            </p>
            <button
              type="button"
              onClick={onViewPerks}
              className="mt-4 text-sm font-medium text-accent hover:underline"
            >
              See all perks →
            </button>
          </article>

          <article className="rounded-2xl border border-border bg-surface p-6">
            <Wallet className="h-5 w-5 text-accent" />
            <h3 className="mt-4 font-semibold">Use tokens as collateral</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Borrow against your verified shares without selling your position.
            </p>
            <button
              type="button"
              onClick={onViewLend}
              className="mt-4 text-sm font-medium text-accent hover:underline"
            >
              Learn about lending →
            </button>
          </article>
        </div>

        <button
          type="button"
          onClick={onBecomeHolder}
          className="btn-hero-primary mt-10 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold"
        >
          Become a Holder
        </button>
      </section>
    </div>
  );
}
