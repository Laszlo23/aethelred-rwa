import type { SharePayoutDTO, YieldDistributionDTO } from "@/lib/types";
import { formatEuro, formatUsdc } from "@/lib/format";
import { format } from "date-fns";

interface YieldDistributionsProps {
  distributions: YieldDistributionDTO[];
  payouts?: SharePayoutDTO[];
}

export function YieldDistributions({ distributions, payouts = [] }: YieldDistributionsProps) {
  const totalEarned = payouts.reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="space-y-6">
      {payouts.length > 0 && (
        <div className="rounded-xl border border-accent/20 bg-gold-soft/20 p-5">
          <p className="eyebrow">Your distributions</p>
          <p className="tabular mt-2 text-2xl font-semibold">{formatUsdc(totalEarned)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Total yield received across holdings</p>
        </div>
      )}

      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {distributions.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No distributions yet.</p>
        ) : (
          distributions.map((d) => {
            const userPayout = payouts.find((p) => p.distributionId === d.id);
            return (
              <div key={d.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{d.periodLabel}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {d.source} · {format(new Date(d.distributedAt), "PP")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular font-mono text-sm">{formatEuro(d.totalCents)}</p>
                  {userPayout && (
                    <p className="tabular mt-0.5 font-mono text-xs text-accent">
                      +{formatUsdc(userPayout.amountCents)} yours
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
