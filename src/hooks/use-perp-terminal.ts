import { useQuery } from "@tanstack/react-query";
import {
  getPerpTerminal,
  getPerpCandles,
  getSyntheticOrderBook,
  getRecentTrades,
  listPerpMarkets,
  listPerpPositions,
  listPerpOrders,
} from "@/api/perps";

const POLL_MS = 3000;

export function usePerpMarkets() {
  return useQuery({
    queryKey: ["perp-markets"],
    queryFn: () => listPerpMarkets(),
    refetchInterval: POLL_MS,
  });
}

export function usePerpTerminal(symbol: string) {
  return useQuery({
    queryKey: ["perp-terminal", symbol],
    queryFn: () => getPerpTerminal({ data: { symbol } }),
    enabled: !!symbol,
    refetchInterval: POLL_MS,
  });
}

export function usePerpCandles(symbol: string, interval: string) {
  return useQuery({
    queryKey: ["perp-candles", symbol, interval],
    queryFn: () => getPerpCandles({ data: { symbol, interval, limit: 120 } }),
    enabled: !!symbol,
    refetchInterval: POLL_MS * 2,
  });
}

export function usePerpOrderBook(symbol: string) {
  return useQuery({
    queryKey: ["perp-orderbook", symbol],
    queryFn: () => getSyntheticOrderBook({ data: { symbol, depth: 15 } }),
    enabled: !!symbol,
    refetchInterval: POLL_MS,
  });
}

export function usePerpTrades(symbol: string) {
  return useQuery({
    queryKey: ["perp-trades", symbol],
    queryFn: () => getRecentTrades({ data: { symbol, limit: 40 } }),
    enabled: !!symbol,
    refetchInterval: POLL_MS,
  });
}

export function usePerpPositions(wallet?: string) {
  return useQuery({
    queryKey: ["perp-positions", wallet],
    queryFn: () => listPerpPositions({ data: { walletAddress: wallet } }),
    enabled: !!wallet,
    refetchInterval: POLL_MS,
  });
}

export function usePerpOrders(wallet?: string) {
  return useQuery({
    queryKey: ["perp-orders", wallet],
    queryFn: () => listPerpOrders({ data: { walletAddress: wallet! } }),
    enabled: !!wallet,
    refetchInterval: POLL_MS,
  });
}
