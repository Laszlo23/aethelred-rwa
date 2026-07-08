import { BadgeCheck } from "lucide-react";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SimplePassportCardProps {
  name: string;
  valueCents: number;
  debtCents: number;
  availableCents?: number;
  trustScore: number;
  verified?: boolean;
  className?: string;
}

export function SimplePassportCard({
  name,
  valueCents,
  debtCents,
  availableCents,
  trustScore,
  verified = true,
  className,
}: SimplePassportCardProps) {
  const available =
    availableCents ?? Math.max(0, Math.floor(valueCents / 1.5) - debtCents);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border-strong bg-surface p-8 shadow-passport",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">{name}</h3>
        {verified && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-verified/15 px-2.5 py-1 text-xs font-medium text-verified">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        )}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <dt className="text-xs text-muted-foreground">Value</dt>
          <dd className="tabular mt-1 font-mono text-lg">{formatEuro(valueCents)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Debt</dt>
          <dd className="tabular mt-1 font-mono text-lg">{formatEuro(debtCents)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Available</dt>
          <dd className="tabular mt-1 font-mono text-lg text-accent">
            {formatEuro(available)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Trust</dt>
          <dd className="tabular mt-1 font-mono text-lg">{trustScore}%</dd>
        </div>
      </dl>
    </div>
  );
}
