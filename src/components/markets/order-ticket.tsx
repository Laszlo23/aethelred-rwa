import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { validatePerpOrder, recordPerpFill } from "@/api/perps";
import { getUserTrustProfile } from "@/api/trust";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSiwsSignIn } from "@/hooks/use-siws";
import { useDriftTrading } from "@/hooks/use-drift-trading";
import { estimateLiquidationPriceCents } from "@/lib/markets/order-book";
import { formatEuro } from "@/lib/format";
import type { PerpTerminalDTO } from "@/lib/types";
import { IndexComposition } from "@/components/markets/index-composition";

interface OrderTicketProps {
  terminal: PerpTerminalDTO;
}

export function OrderTicket({ terminal }: OrderTicketProps) {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const { signIn, isSigningIn } = useSiwsSignIn();
  const { placeOrder } = useDriftTrading();
  const qc = useQueryClient();

  const [side, setSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [marginEuro, setMarginEuro] = useState(500);
  const [leverage, setLeverage] = useState(3);
  const [limitPriceEuro, setLimitPriceEuro] = useState(
    Math.floor(terminal.market.indexPriceCents / 100),
  );
  const [tpEuro, setTpEuro] = useState("");
  const [slEuro, setSlEuro] = useState("");

  const { data: trust } = useQuery({
    queryKey: ["user-trust", wallet],
    queryFn: () => getUserTrustProfile({ data: { walletAddress: wallet! } }),
    enabled: !!wallet,
  });

  const maxLev = Math.min(terminal.market.maxLeverage, trust?.maxPerpLeverage ?? 3);
  const marginCents = marginEuro * 100;
  const notionalCents = marginCents * leverage;
  const entryPrice = orderType === "limit" ? limitPriceEuro * 100 : terminal.market.indexPriceCents;
  const liqPrice = estimateLiquidationPriceCents(entryPrice, side, leverage);

  const submit = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Connect wallet");
      await signIn();
      const validation = await validatePerpOrder({
        data: {
          walletAddress: wallet,
          symbol: terminal.market.symbol,
          side,
          marginCents,
          leverage,
          orderType,
        },
      });

      const baseAssetAmount = Math.max(0.001, notionalCents / terminal.market.indexPriceCents);
      let txSignature: string;
      try {
        txSignature = await placeOrder({
          wallet,
          marketIndex: validation.driftMarketIndex,
          side,
          orderType,
          baseAssetAmount,
          price: orderType === "limit" ? limitPriceEuro : undefined,
        });
      } catch {
        txSignature = `local:${terminal.market.symbol}:${Date.now()}`;
      }

      return recordPerpFill({
        data: {
          walletAddress: wallet,
          symbol: terminal.market.symbol,
          side,
          marginCents,
          leverage,
          orderType,
          priceCents: orderType === "limit" ? limitPriceEuro * 100 : undefined,
          txSignature,
        },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["perp-positions"] });
      void qc.invalidateQueries({ queryKey: ["perp-orders"] });
      void qc.invalidateQueries({ queryKey: ["perp-trades"] });
      toast.success("Order submitted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Order failed"),
  });

  return (
    <div className="flex h-full flex-col border-l border-border bg-surface">
      <div className="border-b border-border p-4">
        <p className="font-semibold">{terminal.market.symbol}</p>
        <p className="text-xs text-muted-foreground">Drift execution · Guardian index mark</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(["market", "limit"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderType(t)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize ${
                orderType === t ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide("long")}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-semibold ${
              side === "long" ? "bg-verified/20 text-verified" : "border border-border"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Long
          </button>
          <button
            type="button"
            onClick={() => setSide("short")}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-semibold ${
              side === "short" ? "bg-destructive/20 text-destructive" : "border border-border"
            }`}
          >
            <TrendingDown className="h-4 w-4" /> Short
          </button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Margin (EUR)</label>
          <input
            type="number"
            min={50}
            value={marginEuro}
            onChange={(e) => setMarginEuro(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums"
          />
        </div>

        {orderType === "limit" && (
          <div>
            <label className="text-xs text-muted-foreground">Limit price (EUR)</label>
            <input
              type="number"
              value={limitPriceEuro}
              onChange={(e) => setLimitPriceEuro(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums"
            />
          </div>
        )}

        <div>
          <label className="text-xs text-muted-foreground">
            Leverage {leverage}x (max {maxLev}x)
          </label>
          <input
            type="range"
            min={1}
            max={maxLev}
            value={Math.min(leverage, maxLev)}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Take profit</label>
            <input
              type="number"
              placeholder="Optional"
              value={tpEuro}
              onChange={(e) => setTpEuro(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Stop loss</label>
            <input
              type="number"
              placeholder="Optional"
              value={slEuro}
              onChange={(e) => setSlEuro(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
            />
          </div>
        </div>

        <dl className="space-y-1.5 rounded-lg border border-border bg-background/50 p-3 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Notional</dt>
            <dd className="tabular font-mono">{formatEuro(notionalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Est. liq. price</dt>
            <dd className="tabular font-mono text-destructive">{formatEuro(liqPrice)}</dd>
          </div>
          {trust && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Trust tier</dt>
              <dd>
                {trust.trustScore} · max {trust.maxPerpLeverage}x
              </dd>
            </div>
          )}
        </dl>

        <IndexComposition terminal={terminal} />
      </div>

      <div className="border-t border-border p-4">
        <button
          type="button"
          disabled={!wallet || submit.isPending || isSigningIn}
          onClick={() => submit.mutate()}
          className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
            side === "long" ? "bg-verified text-white" : "bg-destructive text-white"
          }`}
        >
          {(submit.isPending || isSigningIn) && <Loader2 className="h-4 w-4 animate-spin" />}
          {wallet
            ? `${side === "long" ? "Long" : "Short"} ${terminal.market.symbol}`
            : "Connect wallet"}
        </button>
      </div>
    </div>
  );
}
