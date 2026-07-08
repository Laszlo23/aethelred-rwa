import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { AssetDetailDTO } from "@/lib/types";
import { formatEuro, formatPercent } from "@/lib/format";
import { usePurchaseShares } from "@/hooks/use-api";
import { useSiwsSignIn } from "@/hooks/use-siws";
import { getWalletCompliance } from "@/api/compliance";
import { SOLANA_CONFIG } from "@/lib/solana/config";

interface BuyTokensPanelProps {
  asset: AssetDetailDTO;
}

const PRESETS = [500, 1000, 5000, 10000];

export function BuyTokensPanel({ asset }: BuyTokensPanelProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const purchase = usePurchaseShares();
  const { signIn, isSigningIn } = useSiwsSignIn();
  const [amountEuro, setAmountEuro] = useState(1000);
  const [fauceting, setFauceting] = useState(false);

  const wallet = publicKey?.toBase58();
  const { data: compliance } = useQuery({
    queryKey: ["compliance", wallet],
    queryFn: () => getWalletCompliance({ data: { walletAddress: wallet! } }),
    enabled: !!wallet,
  });

  const amountCents = amountEuro * 100;
  const estimatedBps = Math.round((amountCents / asset.valueCents) * 10000);
  const availableBps = asset.shareSummary.tokensAvailableBps;
  const canBuy = estimatedBps > 0 && estimatedBps <= availableBps;

  const handleFaucet = async () => {
    if (!wallet) return;
    setFauceting(true);
    try {
      const { faucetTestUsdc } = await import("@/api/faucet");
      await faucetTestUsdc({ data: { walletAddress: wallet, amountUi: 50_000 } });
      toast.success("Test USDC sent to your wallet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Faucet failed");
    } finally {
      setFauceting(false);
    }
  };

  const handleBuy = async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    if (!canBuy) {
      toast.error("Amount exceeds available token supply");
      return;
    }
    try {
      const wallet = publicKey.toBase58();
      await signIn();
      if (!compliance?.verified) {
        toast.error("Complete KYC verification before purchasing restricted shares", {
          action: {
            label: "Go to profile",
            onClick: () => {
              window.location.href = "/profile";
            },
          },
        });
        return;
      }
      if (!signTransaction) {
        toast.error("Wallet cannot sign transactions");
        return;
      }
      const { buildUsdcPrimarySaleTx } = await import("@/lib/solana/primary-sale-client");
      const saleTx = await buildUsdcPrimarySaleTx(wallet, asset.slug, amountCents);
      const signed = await signTransaction(saleTx);
      const txSignature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
      });
      await connection.confirmTransaction(txSignature, "confirmed");
      await purchase.mutateAsync({
        data: {
          walletAddress: wallet,
          assetId: asset.slug,
          amountCents,
          txSignature,
        },
      });
      toast.success(
        `Purchased ${formatPercent(estimatedBps)} of ${asset.name} — USDC settlement recorded`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed");
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t border-border pt-6">
      <div>
        <label className="text-xs text-muted-foreground">Investment amount (EUR)</label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">€</span>
          <input
            type="number"
            min={100}
            step={100}
            value={amountEuro}
            onChange={(e) => setAmountEuro(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm tabular-nums"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmountEuro(p)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              €{p.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <dl className="space-y-2 rounded-lg border border-border/80 bg-background/50 px-4 py-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">You receive</dt>
          <dd className="tabular font-mono text-accent">{formatPercent(estimatedBps)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Available</dt>
          <dd className="tabular font-mono">{formatPercent(availableBps)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Est. annual yield</dt>
          <dd className="tabular font-mono">{formatPercent(asset.yieldBps)}</dd>
        </div>
      </dl>

      {SOLANA_CONFIG.network === "localnet" && wallet && (
        <button
          type="button"
          onClick={handleFaucet}
          disabled={fauceting}
          className="w-full rounded-md border border-accent/40 px-4 py-2 text-xs text-accent hover:bg-accent/10"
        >
          {fauceting ? "Sending test USDC…" : "Get test USDC (local chain)"}
        </button>
      )}

      <button
        type="button"
        onClick={handleBuy}
        disabled={purchase.isPending || isSigningIn || !canBuy}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 disabled:opacity-50"
      >
        {purchase.isPending || isSigningIn ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : publicKey ? (
          <>Buy with USDC · {formatEuro(amountCents)}</>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect wallet to buy
          </>
        )}
      </button>

      {wallet && compliance && !compliance.verified && (
        <p className="text-center text-xs text-muted-foreground">
          <ShieldCheck className="mr-1 inline h-3 w-3" />
          KYC required for restricted Token-2022 shares.{" "}
          <Link to="/profile" className="text-accent hover:underline">
            Verify on your profile →
          </Link>
        </p>
      )}

      {!canBuy && amountEuro >= 100 && (
        <p className="text-center text-xs text-destructive">
          Reduce amount — only {formatPercent(availableBps)} remains unsold
        </p>
      )}
    </div>
  );
}
