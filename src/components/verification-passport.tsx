import { formatEuro, truncateAddress } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";

export type PassportVariant = "full" | "compact" | "mini";

interface PassportProps {
  name: string;
  location: string;
  valuationCents: number;
  debtCents?: number;
  availableLiquidityCents?: number;
  trustScore: number;
  collateralRatio: number;
  tokenId: string;
  category: string;
  lastAuditAt?: string;
  variant?: PassportVariant;
  className?: string;
}

export function VerificationPassport({
  name,
  location,
  valuationCents,
  debtCents = 0,
  availableLiquidityCents,
  trustScore,
  collateralRatio,
  tokenId,
  category,
  lastAuditAt,
  variant = "full",
  className = "",
}: PassportProps) {
  const liquidity = availableLiquidityCents ?? Math.max(0, Math.floor(valuationCents / 1.5) - debtCents);
  const auditLabel = lastAuditAt
    ? formatDistanceToNow(new Date(lastAuditAt), { addSuffix: true })
    : "12m ago";

  if (variant === "mini") {
    return (
      <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{name}</span>
          <span className="rounded-sm bg-verified/20 px-1.5 py-0.5 text-[10px] text-verified">VERIFIED</span>
        </div>
        <p className="mt-1 font-mono text-xs text-accent">{truncateAddress(tokenId)}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`rounded-xl border border-border-strong bg-surface p-5 ${className}`}>
        <div className="flex justify-between">
          <div>
            <p className="eyebrow !text-[9px]">Asset Passport™</p>
            <h3 className="mt-1 font-semibold">{name}</h3>
          </div>
          <span className="rounded-sm bg-verified/20 px-2 py-0.5 text-[10px] text-verified">VERIFIED</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Value</p>
            <p className="tabular font-mono">{formatEuro(valuationCents)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Trust</p>
            <p className="tabular font-mono">{trustScore}/100</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2rem] bg-gold-soft blur-3xl"
        style={{ maskImage: "radial-gradient(closest-side, black, transparent)" }}
      />
      <div
        className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface p-7 shadow-passport"
        style={{
          backgroundImage:
            "linear-gradient(140deg, oklch(0.2 0.007 260 / 0.6), oklch(0.14 0.005 260))",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px gold-hairline" />

        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Asset Passport™</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">{name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{location}</p>
          </div>
          <div className="text-right">
            <p className="eyebrow">Status</p>
            <p className="mt-1 font-mono text-[11px] text-verified">
              <span className="rounded-sm bg-verified/15 px-1.5 py-0.5 ring-1 ring-verified/30">
                VERIFIED · {truncateAddress(tokenId)}
              </span>
            </p>
          </div>
        </div>

        <div className="my-8 grid grid-cols-2 gap-6">
          <div>
            <p className="eyebrow">Asset Value</p>
            <p className="tabular mt-1 font-mono text-2xl font-medium tracking-tight">
              {formatEuro(valuationCents)}
            </p>
          </div>
          <div>
            <p className="eyebrow">Debt</p>
            <p className="tabular mt-1 font-mono text-2xl font-medium tracking-tight">
              {formatEuro(debtCents)}
            </p>
          </div>
          <div>
            <p className="eyebrow">Available Liquidity</p>
            <p className="tabular mt-1 font-mono text-xl font-medium tracking-tight text-accent">
              {formatEuro(liquidity)}
            </p>
          </div>
          <div>
            <p className="eyebrow">Collateral</p>
            <p className="tabular mt-1 font-mono text-xl font-medium tracking-tight">
              {collateralRatio}%
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Trust Score</span>
            <span className="font-mono tabular">{trustScore}/100</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
              style={{ width: `${trustScore}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5">
          <div>
            <p className="eyebrow">Category</p>
            <p className="mt-1 text-sm">{category}</p>
          </div>
          <div>
            <p className="eyebrow">Last Guardian Audit</p>
            <p className="mt-1 text-sm">{auditLabel}</p>
          </div>
          <div>
            <p className="eyebrow">Network</p>
            <p className="mt-1 text-sm">Solana · SPL</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg bg-black/30 p-3 ring-1 ring-inset ring-white/5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-guardian rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="eyebrow !text-[10px] !text-foreground">Guardian Presence</span>
          </div>
          <span className="eyebrow !text-[10px]">Real-time</span>
        </div>
      </div>
    </div>
  );
}

// Legacy prop adapter for gradual migration
export function VerificationPassportLegacy({
  name,
  location,
  valuation,
  maxMint,
  trustScore,
  ratio,
  tokenId,
  category,
  className,
}: {
  name: string;
  location: string;
  valuation: string;
  maxMint: string;
  trustScore: number;
  ratio: string;
  tokenId: string;
  category: string;
  className?: string;
}) {
  const parseEuro = (s: string) => parseInt(s.replace(/[€,.]/g, ""), 10) * 100 || 0;
  return (
    <VerificationPassport
      name={name}
      location={location}
      valuationCents={parseEuro(valuation)}
      debtCents={parseEuro(valuation) - parseEuro(maxMint) * 1.5}
      availableLiquidityCents={parseEuro(maxMint)}
      trustScore={trustScore}
      collateralRatio={parseInt(ratio)}
      tokenId={tokenId}
      category={category}
      className={className}
    />
  );
}
