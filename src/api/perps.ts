import { prisma, ensureSeeded } from "@/lib/db";
import { requireAuthenticatedWallet } from "@/lib/auth/require-auth";
import { trustGatedMaxLeverage } from "@/lib/trust/scoring";
import { buildSyntheticOrderBook, estimateLiquidationPriceCents } from "@/lib/markets/order-book";
import { getDriftMarketIndex } from "@/lib/markets/drift-map";
import type {
  OrderBookDTO,
  PerpCandleDTO,
  PerpMarketDTO,
  PerpOrderDTO,
  PerpPositionDTO,
  PerpTerminalDTO,
  PerpTradeDTO,
} from "@/lib/types";
import { createServerFn } from "@tanstack/react-start";

function mapMarket(
  m: {
    symbol: string;
    indexPriceCents: number;
    fundingRateBps: number;
    openInterestCents: number;
    volume24hCents: number;
    maxLeverage: number;
    trustMinScore: number;
    driftMarketIndex?: number | null;
    change24hBps?: number;
    high24hCents?: number | null;
    low24hCents?: number | null;
    asset: { slug: string } | null;
  },
): PerpMarketDTO {
  return {
    symbol: m.symbol,
    assetSlug: m.asset?.slug ?? null,
    indexPriceCents: m.indexPriceCents,
    fundingRateBps: m.fundingRateBps,
    openInterestCents: m.openInterestCents,
    volume24hCents: m.volume24hCents,
    maxLeverage: m.maxLeverage,
    trustMinScore: m.trustMinScore,
    driftMarketIndex: m.driftMarketIndex,
    change24hBps: m.change24hBps,
    high24hCents: m.high24hCents,
    low24hCents: m.low24hCents,
  };
}

function mapPosition(
  p: {
    id: string;
    side: string;
    sizeCents: number;
    entryPriceCents: number;
    leverage: number;
    marginCents: number;
    unrealizedPnlCents: number;
    status: string;
    market: { symbol: string; indexPriceCents: number };
  },
): PerpPositionDTO {
  const mark = p.market.indexPriceCents;
  const pnl = Math.round(
    (mark - p.entryPriceCents) * (p.side === "long" ? 1 : -1) * p.leverage * 0.01,
  );
  return {
    id: p.id,
    symbol: p.market.symbol,
    side: p.side,
    sizeCents: p.sizeCents,
    entryPriceCents: p.entryPriceCents,
    leverage: p.leverage,
    marginCents: p.marginCents,
    unrealizedPnlCents: p.status === "open" ? pnl : p.unrealizedPnlCents,
    status: p.status,
    liquidationPriceCents: estimateLiquidationPriceCents(
      p.entryPriceCents,
      p.side as "long" | "short",
      p.leverage,
    ),
  };
}

export const listPerpMarkets = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const markets = await prisma.perpMarket.findMany({
    include: { asset: true },
    orderBy: { symbol: "asc" },
  });
  return markets.map(mapMarket);
});

export const getPerpTerminal = createServerFn({ method: "GET" })
  .validator((data: { symbol: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const market = await prisma.perpMarket.findUnique({
      where: { symbol: data.symbol },
      include: {
        asset: { include: { passport: true } },
      },
    });
    if (!market) throw new Error("Market not found");

    const indexComponents = market.asset
      ? {
          navCents: market.asset.valueCents,
          yieldBps: market.asset.yieldBps,
          trustScore: market.asset.passport?.trustScore ?? 80,
          assetName: market.asset.name,
        }
      : null;

    const hour = new Date().getUTCHours();
    const fundingCountdownSec = (8 - (hour % 8)) * 3600 - new Date().getUTCMinutes() * 60;

    const result: PerpTerminalDTO = {
      market: mapMarket(market),
      indexComponents,
      fundingCountdownSec: Math.max(0, fundingCountdownSec),
    };
    return result;
  });

export const getPerpCandles = createServerFn({ method: "GET" })
  .validator(
    (data: { symbol: string; interval?: string; limit?: number }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const interval = data.interval ?? "1h";
    const limit = data.limit ?? 72;
    const candles = await prisma.perpCandle.findMany({
      where: { symbol: data.symbol, interval },
      orderBy: { recordedAt: "asc" },
      take: limit,
    });

    if (candles.length === 0) {
      const market = await prisma.perpMarket.findUnique({ where: { symbol: data.symbol } });
      if (!market) return [];
      const { generateCandleHistory } = await import("@/lib/markets/candles");
      const generated = generateCandleHistory(
        data.symbol,
        market.indexPriceCents,
        interval as "1h",
        limit,
      );
      return generated.map(
        (c): PerpCandleDTO => ({
          time: Math.floor(c.recordedAt.getTime() / 1000),
          open: c.openCents / 100,
          high: c.highCents / 100,
          low: c.lowCents / 100,
          close: c.closeCents / 100,
          volume: c.volumeCents / 100,
        }),
      );
    }

    return candles.map(
      (c): PerpCandleDTO => ({
        time: Math.floor(c.recordedAt.getTime() / 1000),
        open: c.openCents / 100,
        high: c.highCents / 100,
        low: c.lowCents / 100,
        close: c.closeCents / 100,
        volume: c.volumeCents / 100,
      }),
    );
  });

export const getSyntheticOrderBook = createServerFn({ method: "GET" })
  .validator((data: { symbol: string; depth?: number }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const market = await prisma.perpMarket.findUnique({
      where: { symbol: data.symbol },
      include: { asset: { include: { passport: true } } },
    });
    if (!market) throw new Error("Market not found");

    const book = buildSyntheticOrderBook(
      market.indexPriceCents,
      data.depth ?? 15,
      market.fundingRateBps,
      market.asset?.passport?.trustScore ?? 85,
    );

    const result: OrderBookDTO = { ...book, isSynthetic: true };
    return result;
  });

export const getRecentTrades = createServerFn({ method: "GET" })
  .validator((data: { symbol: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const trades = await prisma.perpTrade.findMany({
      where: { symbol: data.symbol },
      orderBy: { recordedAt: "desc" },
      take: data.limit ?? 30,
    });
    return trades.map(
      (t): PerpTradeDTO => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        priceCents: t.priceCents,
        sizeCents: t.sizeCents,
        recordedAt: t.recordedAt.toISOString(),
      }),
    );
  });

export const listPerpPositions = createServerFn({ method: "GET" })
  .validator((data: { walletAddress?: string }) => data ?? {})
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = data.walletAddress
      ? await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } })
      : null;
    const positions = await prisma.perpPosition.findMany({
      where: user ? { userId: user.id, status: "open" } : { status: "open" },
      include: { market: true },
      orderBy: { createdAt: "desc" },
    });
    return positions.map(mapPosition);
  });

export const listPerpOrders = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (!user) return [];
    const orders = await prisma.perpOrder.findMany({
      where: { userId: user.id, status: "open" },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(
      (o): PerpOrderDTO => ({
        id: o.id,
        symbol: o.symbol,
        side: o.side,
        orderType: o.orderType,
        priceCents: o.priceCents,
        sizeCents: o.sizeCents,
        leverage: o.leverage,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }),
    );
  });

export const validatePerpOrder = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      symbol: string;
      side: "long" | "short";
      marginCents: number;
      leverage: number;
      orderType?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const market = await prisma.perpMarket.findUnique({
      where: { symbol: data.symbol },
      include: { asset: { include: { passport: true } } },
    });
    if (!market) throw new Error("Market not found");

    const user = await prisma.user.findUnique({
      where: { walletAddress: data.walletAddress },
      include: { trustProfile: true },
    });
    if (!user) throw new Error("User not found");

    const userScore = user.trustProfile?.trustScore ?? 50;
    if (userScore < market.trustMinScore) {
      throw new Error(`Trust score ${userScore} below minimum ${market.trustMinScore}`);
    }

    const assetScore = market.asset?.passport?.trustScore ?? 85;
    const maxLev = trustGatedMaxLeverage(userScore, assetScore, market.maxLeverage);
    if (data.leverage > maxLev) {
      throw new Error(`Max leverage for your trust tier is ${maxLev}x`);
    }

    return {
      ok: true,
      maxLeverage: maxLev,
      driftMarketIndex: getDriftMarketIndex(market.symbol, market.driftMarketIndex),
      markPriceCents: market.indexPriceCents,
    };
  });

export const recordPerpFill = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      symbol: string;
      side: "long" | "short";
      marginCents: number;
      leverage: number;
      orderType: string;
      priceCents?: number;
      txSignature: string;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const market = await prisma.perpMarket.findUnique({
      where: { symbol: data.symbol },
      include: { asset: { include: { passport: true } } },
    });
    if (!market) throw new Error("Market not found");

    const user = await prisma.user.findUnique({
      where: { walletAddress: data.walletAddress },
      include: { trustProfile: true },
    });
    if (!user) throw new Error("User not found");

    const userScore = user.trustProfile?.trustScore ?? 50;
    const assetScore = market.asset?.passport?.trustScore ?? 85;
    const maxLev = trustGatedMaxLeverage(userScore, assetScore, market.maxLeverage);
    if (data.leverage > maxLev) throw new Error(`Max leverage is ${maxLev}x`);

    const sizeCents = data.marginCents * data.leverage;
    const entryPrice = data.priceCents ?? market.indexPriceCents;

    if (data.orderType === "limit" && data.priceCents) {
      const order = await prisma.perpOrder.create({
        data: {
          userId: user.id,
          symbol: data.symbol,
          side: data.side,
          orderType: "limit",
          priceCents: data.priceCents,
          sizeCents,
          leverage: data.leverage,
          status: "open",
          txSignature: data.txSignature,
        },
      });
      return {
        type: "order" as const,
        order: {
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          orderType: order.orderType,
          priceCents: order.priceCents,
          sizeCents: order.sizeCents,
          leverage: order.leverage,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
        },
      };
    }

    const position = await prisma.perpPosition.create({
      data: {
        userId: user.id,
        marketId: market.id,
        side: data.side,
        sizeCents,
        entryPriceCents: entryPrice,
        leverage: data.leverage,
        marginCents: data.marginCents,
        onChainPubkey: data.txSignature,
        status: "open",
      },
      include: { market: true },
    });

    await prisma.perpTrade.create({
      data: {
        symbol: data.symbol,
        side: data.side,
        priceCents: entryPrice,
        sizeCents,
        txSignature: data.txSignature,
      },
    });

    await prisma.perpMarket.update({
      where: { id: market.id },
      data: {
        openInterestCents: market.openInterestCents + sizeCents,
        volume24hCents: market.volume24hCents + sizeCents,
      },
    });

    return { type: "position" as const, position: mapPosition(position) };
  });

export const openPerpPosition = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      symbol: string;
      side: "long" | "short";
      marginCents: number;
      leverage: number;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const { openDriftPerp } = await import("@/lib/solana/integrations/drift");
    const txSignature = await openDriftPerp({
      wallet: data.walletAddress,
      symbol: data.symbol,
      side: data.side,
      marginCents: data.marginCents,
      leverage: data.leverage,
    });

    return recordPerpFill({
      data: {
        ...data,
        orderType: "market",
        txSignature,
      },
    });
  });

export const closePerpPosition = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      positionId: string;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (!user) throw new Error("User not found");

    const position = await prisma.perpPosition.findFirst({
      where: { id: data.positionId, userId: user.id, status: "open" },
      include: { market: true },
    });
    if (!position) throw new Error("Position not found");

    const { closeDriftPerp } = await import("@/lib/solana/integrations/drift");
    await closeDriftPerp({ wallet: data.walletAddress, positionPubkey: position.onChainPubkey });

    const pnl = Math.round(
      (position.market.indexPriceCents - position.entryPriceCents) *
        (position.side === "long" ? 1 : -1) *
        position.leverage *
        0.01,
    );

    const updated = await prisma.perpPosition.update({
      where: { id: position.id },
      data: { status: "closed", unrealizedPnlCents: pnl },
      include: { market: true },
    });

    return mapPosition(updated);
  });

export const cancelPerpOrder = createServerFn({ method: "POST" })
  .validator(
    (data: { walletAddress: string; orderId: string; signature?: string; message?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (!user) throw new Error("User not found");

    const order = await prisma.perpOrder.findFirst({
      where: { id: data.orderId, userId: user.id, status: "open" },
    });
    if (!order) throw new Error("Order not found");

    const updated = await prisma.perpOrder.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });

    return {
      id: updated.id,
      symbol: updated.symbol,
      side: updated.side,
      orderType: updated.orderType,
      priceCents: updated.priceCents,
      sizeCents: updated.sizeCents,
      leverage: updated.leverage,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    } satisfies PerpOrderDTO;
  });

export const syncPerpPositions = createServerFn({ method: "POST" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    return listPerpPositions({ data: { walletAddress: data.walletAddress } });
  });
