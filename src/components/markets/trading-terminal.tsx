import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  usePerpCandles,
  usePerpMarkets,
  usePerpOrderBook,
  usePerpOrders,
  usePerpPositions,
  usePerpTerminal,
  usePerpTrades,
} from "@/hooks/use-perp-terminal";
import { MarketSelector } from "@/components/markets/market-selector";
import { MarketStatsBar } from "@/components/markets/market-stats-bar";
import { PerpChart } from "@/components/markets/perp-chart";
import { OrderBook } from "@/components/markets/order-book";
import { TradesTape } from "@/components/markets/trades-tape";
import { OrderTicket } from "@/components/markets/order-ticket";
import { PositionsDock } from "@/components/markets/positions-dock";
import { ModuleStatusBadge } from "@/components/module-status-badge";

interface TradingTerminalProps {
  symbol: string;
}

export function TradingTerminal({ symbol }: TradingTerminalProps) {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const [search, setSearch] = useState("");
  const [interval, setInterval] = useState("1h");

  const { data: markets = [] } = usePerpMarkets();
  const { data: terminal } = usePerpTerminal(symbol);
  const { data: candles = [] } = usePerpCandles(symbol, interval);
  const { data: book } = usePerpOrderBook(symbol);
  const { data: trades = [] } = usePerpTrades(symbol);
  const { data: positions = [] } = usePerpPositions(wallet);
  const { data: orders = [] } = usePerpOrders(wallet);

  const handleSelect = (next: string) => {
    void navigate({ to: "/markets/$symbol", params: { symbol: next } });
  };

  if (!terminal || !book) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-muted-foreground">
        Loading terminal…
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-amber-500/5 px-4 py-2 text-sm text-muted-foreground">
        <ModuleStatusBadge status="demo" />
        <span>Synthetic order book for UI exploration — not production trading.</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-56 shrink-0 lg:block">
          <MarketSelector
            markets={markets}
            activeSymbol={symbol}
            onSelect={handleSelect}
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <MarketStatsBar terminal={terminal} />
          <div className="grid min-h-0 flex-1 grid-rows-[1fr_200px]">
            <PerpChart candles={candles} interval={interval} onIntervalChange={setInterval} />
            <div className="grid min-h-0 grid-cols-2 border-t border-border">
              <OrderBook book={book} />
              <TradesTape trades={trades} />
            </div>
          </div>
        </div>

        <div className="hidden w-80 shrink-0 xl:block">
          <OrderTicket terminal={terminal} />
        </div>
      </div>

      <div className="xl:hidden border-t border-border p-4">
        <OrderTicket terminal={terminal} />
      </div>

      <PositionsDock wallet={wallet} positions={positions} orders={orders} trades={trades} />
    </div>
  );
}
