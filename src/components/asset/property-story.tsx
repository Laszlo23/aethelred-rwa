import type { AssetPropertyDTO } from "@/lib/types";
import { formatEuro } from "@/lib/format";

interface PropertyStoryProps {
  property: AssetPropertyDTO;
}

export function PropertyStory({ property }: PropertyStoryProps) {
  const raiseProgress = property.communityRaiseTargetCents
    ? Math.min(100, Math.round((property.tokensSoldBps / 10000) * 100))
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg leading-relaxed text-muted-foreground">{property.tagline}</p>
        <p className="mt-4 leading-relaxed text-foreground/90">{property.description}</p>
      </div>

      {property.bankHolder && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="eyebrow">Title today</p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{property.bankHolder}</span> holds the
            deed. Community capital retires the lien — token holders become the new ownership layer.
          </p>
          {property.communityRaiseTargetCents && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Community raise</span>
                <span className="tabular font-mono">
                  {formatEuro(property.communityRaiseTargetCents)} target · {raiseProgress}%
                  subscribed
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${raiseProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
