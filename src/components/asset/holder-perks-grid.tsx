import {
  BedDouble,
  Coins,
  Lock,
  Shield,
  Utensils,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AssetPerkDTO, PerkType } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const perkIcons: Record<PerkType, LucideIcon> = {
  STAY: BedDouble,
  GOVERNANCE: Vote,
  RENT_SHARE: Coins,
  DINING: Utensils,
  LOUNGE: Shield,
  PRIORITY_ACCESS: Shield,
};

interface HolderPerksGridProps {
  perks: AssetPerkDTO[];
  userShareBps?: number;
}

export function HolderPerksGrid({ perks, userShareBps = 0 }: HolderPerksGridProps) {
  if (perks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No holder perks configured for this asset.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {perks.map((perk) => {
        const unlocked = userShareBps >= perk.minShareBps;
        const Icon = perkIcons[perk.perkType] ?? Shield;
        return (
          <article
            key={perk.id}
            className={cn(
              "rounded-xl border p-5 transition-colors",
              unlocked
                ? "border-accent/30 bg-gold-soft/30"
                : "border-border bg-surface opacity-80",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  unlocked ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground",
                )}
              >
                {unlocked ? <Icon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </span>
              <div>
                <h4 className="font-semibold">{perk.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{perk.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Requires {formatPercent(perk.minShareBps)} holding
                  {unlocked && <span className="ml-2 text-verified">Unlocked</span>}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
