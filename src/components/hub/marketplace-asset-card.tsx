import type { AssetDTO } from "@/lib/types";
import { formatEuro, formatPercent } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck } from "lucide-react";

interface MarketplaceAssetCardProps {
  asset: AssetDTO;
  fromHub?: boolean;
}

export function MarketplaceAssetCard({ asset, fromHub }: MarketplaceAssetCardProps) {
  const trustScore = asset.passport?.trustScore ?? asset.health;
  const ownershipPct = asset.property
    ? Math.min(100, Math.round(asset.property.tokensSoldBps / 100))
    : null;
  const assetType = asset.property?.cultureSegment ?? asset.assetType;

  return (
    <Link
      to="/assets/$assetId"
      params={{ assetId: asset.slug }}
      search={fromHub ? { from: "hub" } : undefined}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-border-strong hover:shadow-passport"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium capitalize text-white backdrop-blur">
          {assetType}
        </span>
        {asset.status === "VERIFIED" && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-verified/30 bg-black/50 px-2.5 py-0.5 text-[10px] text-verified backdrop-blur">
            <BadgeCheck className="h-3 w-3" />
            Guardian Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold tracking-tight">{asset.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{asset.location}</p>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="eyebrow !text-[9px]">Value</p>
            <p className="tabular mt-1 font-mono text-sm">{formatEuro(asset.valueCents)}</p>
          </div>
          <div>
            <p className="eyebrow !text-[9px]">Yield</p>
            <p className="tabular mt-1 font-mono text-sm text-accent">
              {formatPercent(asset.yieldBps)}
            </p>
          </div>
          <div>
            <p className="eyebrow !text-[9px]">Trust</p>
            <p className="tabular mt-1 font-mono text-sm text-verified">{trustScore}%</p>
          </div>
          {ownershipPct != null && (
            <div>
              <p className="eyebrow !text-[9px]">Community owned</p>
              <p className="tabular mt-1 font-mono text-sm">{ownershipPct}%</p>
            </div>
          )}
        </div>

        <span className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/40 bg-gold-soft/50 px-4 py-2.5 text-sm font-semibold text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
          View Asset Passport
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
