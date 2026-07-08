import { useState } from "react";
import { toast } from "sonner";
import type { AssetDetailDTO } from "@/lib/types";
import { formatUsdc, formatPercent } from "@/lib/format";
import { maxPrincipalCents } from "@/lib/lending/config";
import { useCreateLendingPosition } from "@/hooks/use-api";
import { useSiwsSignIn } from "@/hooks/use-siws";

interface LendAgainstSharesProps {
  asset: AssetDetailDTO;
  walletAddress?: string;
  userShareBps?: number;
}

export function LendAgainstShares({
  asset,
  walletAddress,
  userShareBps = 0,
}: LendAgainstSharesProps) {
  const [collateralBps, setCollateralBps] = useState(Math.min(userShareBps, 500));
  const [principalCents, setPrincipalCents] = useState(0);
  const createLending = useCreateLendingPosition();
  const { signIn, isSigningIn } = useSiwsSignIn();

  const maxPrincipal = maxPrincipalCents(asset.valueCents, collateralBps);
  const suggestedPrincipal = Math.floor(maxPrincipal * 0.8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      toast.error("Connect your wallet to borrow USDC");
      return;
    }
    try {
      await signIn();
      await createLending.mutateAsync({
        data: {
          walletAddress,
          assetId: asset.slug,
          collateralShareBps: collateralBps,
          principalCents: principalCents || suggestedPrincipal,
        },
      });
      toast.success("Kamino lending position created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create position");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <p className="eyebrow">Lend against your shares</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Pledge tokenized property shares as collateral. Borrow USDC at{" "}
        <span className="text-foreground">{formatPercent(asset.lendingSummary.avgApyBps)}</span> APY
        — profits from the asset are shared with all token holders.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Collateral (share %)</label>
          <input
            type="range"
            min={100}
            max={userShareBps || 100}
            step={50}
            value={collateralBps}
            onChange={(e) => setCollateralBps(Number(e.target.value))}
            className="mt-2 w-full"
            disabled={!userShareBps}
          />
          <p className="tabular mt-1 font-mono text-sm">{formatPercent(collateralBps)} pledged</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Borrow (USDC)</label>
          <input
            type="number"
            placeholder={String(Math.floor(suggestedPrincipal / 100))}
            value={principalCents ? principalCents / 100 : ""}
            onChange={(e) => setPrincipalCents(Math.floor(Number(e.target.value) * 100))}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            disabled={!userShareBps}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Max {formatUsdc(maxPrincipal)} at 50% LTV
          </p>
        </div>

        <button
          type="submit"
          disabled={!walletAddress || !userShareBps || createLending.isPending || isSigningIn}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
        >
          {createLending.isPending || isSigningIn ? "Creating…" : "Borrow USDC via Kamino"}
        </button>
      </form>

      {!walletAddress && (
        <p className="mt-3 text-xs text-muted-foreground">Connect wallet to borrow against shares.</p>
      )}
      {walletAddress && !userShareBps && (
        <p className="mt-3 text-xs text-muted-foreground">
          You need token holdings in this asset to borrow.
        </p>
      )}
    </div>
  );
}
