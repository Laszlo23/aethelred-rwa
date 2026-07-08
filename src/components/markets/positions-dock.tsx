import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closePerpPosition, cancelPerpOrder } from "@/api/perps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEuro } from "@/lib/format";
import type { PerpOrderDTO, PerpPositionDTO, PerpTradeDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PositionsDockProps {
  wallet?: string;
  positions: PerpPositionDTO[];
  orders: PerpOrderDTO[];
  trades: PerpTradeDTO[];
}

export function PositionsDock({ wallet, positions, orders, trades }: PositionsDockProps) {
  const qc = useQueryClient();

  const close = useMutation({
    mutationFn: closePerpPosition,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["perp-positions"] });
      toast.success("Position closed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Close failed"),
  });

  const cancel = useMutation({
    mutationFn: cancelPerpOrder,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["perp-orders"] });
      toast.success("Order cancelled");
    },
  });

  return (
    <div className="border-t border-border bg-surface">
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="h-10 w-full justify-start rounded-none border-b border-border bg-transparent px-4">
          <TabsTrigger value="positions">Positions ({positions.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="m-0 max-h-48 overflow-y-auto">
          {positions.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No open positions</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left">Market</th>
                  <th className="px-4 py-2 text-left">Side</th>
                  <th className="px-4 py-2 text-right">Size</th>
                  <th className="px-4 py-2 text-right">Entry</th>
                  <th className="px-4 py-2 text-right">uPnL</th>
                  <th className="px-4 py-2 text-right">Liq.</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="px-4 py-2 font-medium">{p.symbol}</td>
                    <td className={cn("px-4 py-2 capitalize", p.side === "long" ? "text-verified" : "text-destructive")}>
                      {p.side} {p.leverage}x
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatEuro(p.sizeCents)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatEuro(p.entryPriceCents)}</td>
                    <td className={cn("px-4 py-2 text-right tabular-nums", p.unrealizedPnlCents >= 0 ? "text-verified" : "text-destructive")}>
                      {formatEuro(p.unrealizedPnlCents)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {p.liquidationPriceCents ? formatEuro(p.liquidationPriceCents) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {wallet && (
                        <button
                          type="button"
                          onClick={() => close.mutate({ data: { walletAddress: wallet, positionId: p.id } })}
                          className="text-accent hover:underline"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TabsContent>

        <TabsContent value="orders" className="m-0 max-h-48 overflow-y-auto">
          {orders.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No open orders</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left">Market</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Size</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/50">
                    <td className="px-4 py-2">{o.symbol}</td>
                    <td className="px-4 py-2 capitalize">{o.side} {o.orderType}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {o.priceCents ? formatEuro(o.priceCents) : "Market"}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatEuro(o.sizeCents)}</td>
                    <td className="px-4 py-2 text-right">
                      {wallet && (
                        <button
                          type="button"
                          onClick={() => cancel.mutate({ data: { walletAddress: wallet, orderId: o.id } })}
                          className="text-accent hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TabsContent>

        <TabsContent value="history" className="m-0 max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Side</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(t.recordedAt).toLocaleString()}
                  </td>
                  <td className={cn("px-4 py-2 capitalize", t.side === "long" ? "text-verified" : "text-destructive")}>
                    {t.side}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatEuro(t.priceCents)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatEuro(t.sizeCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
