import { prisma, ensureSeeded } from "@/lib/db";
import { mapLendingPosition } from "@/lib/db/mappers";
import { computeLendingApyBps, maxPrincipalCents } from "@/lib/lending/config";
import { createServerFn } from "@tanstack/react-start";

export const listLendingPositions = createServerFn({ method: "GET" })
  .validator((data: { walletAddress?: string; assetId?: string }) => data ?? {})
  .handler(async ({ data }) => {
    await ensureSeeded();
    const assetFilter = data.assetId
      ? await prisma.asset.findFirst({
          where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
        })
      : null;

    const user = data.walletAddress
      ? await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } })
      : null;

    const positions = await prisma.lendingPosition.findMany({
      where: {
        ...(user ? { userId: user.id } : {}),
        ...(assetFilter ? { assetId: assetFilter.id } : {}),
        status: "active",
      },
      include: { asset: true },
      orderBy: { createdAt: "desc" },
    });

    return positions.map((p) => mapLendingPosition(p, p.asset));
  });

export const getLendingStats = createServerFn({ method: "GET" })
  .validator((data: { assetId: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
    });
    if (!asset) {
      return { totalPrincipalCents: 0, activePositions: 0, avgApyBps: 0 };
    }
    const positions = await prisma.lendingPosition.findMany({
      where: { assetId: asset.id, status: "active" },
    });
    const totalPrincipalCents = positions.reduce((s, p) => s + p.principalCents, 0);
    const avgApyBps =
      positions.length > 0
        ? Math.round(positions.reduce((s, p) => s + p.apyBps, 0) / positions.length)
        : computeLendingApyBps(asset.yieldBps);
    return {
      totalPrincipalCents,
      activePositions: positions.length,
      avgApyBps,
    };
  });

export const createLendingPosition = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      assetId: string;
      collateralShareBps: number;
      principalCents: number;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { requireAuthenticatedWallet } = await import("@/lib/auth/require-auth");
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
    });
    if (!asset) throw new Error("Asset not found");

    const userShare = await prisma.assetShare.findFirst({
      where: {
        assetId: asset.id,
        holderWallet: data.walletAddress,
      },
    });
    if (!userShare || userShare.shareBps < data.collateralShareBps) {
      throw new Error("Insufficient share collateral");
    }

    const maxPrincipal = maxPrincipalCents(asset.valueCents, data.collateralShareBps);
    if (data.principalCents > maxPrincipal) {
      throw new Error(`Maximum borrow is ${maxPrincipal} cents at 50% LTV`);
    }
    if (data.principalCents <= 0) {
      throw new Error("Principal must be positive");
    }

    const user = await prisma.user.upsert({
      where: { walletAddress: data.walletAddress },
      create: { walletAddress: data.walletAddress },
      update: {},
    });

    const { depositToKamino } = await import("@/lib/solana/integrations/kamino");
    const kamino = await depositToKamino({
      wallet: data.walletAddress,
      assetSlug: asset.slug,
      collateralShareBps: data.collateralShareBps,
      principalCents: data.principalCents,
    });

    const position = await prisma.lendingPosition.create({
      data: {
        userId: user.id,
        assetId: asset.id,
        principalCents: data.principalCents,
        collateralShareBps: data.collateralShareBps,
        currency: "USDC",
        apyBps: computeLendingApyBps(asset.yieldBps),
        status: "active",
        protocol: "kamino",
        onChainPubkey: kamino.pubkey,
        healthFactorBps: kamino.healthFactorBps,
        liquidationPriceCents: kamino.liquidationPriceCents,
      },
      include: { asset: true },
    });

    return mapLendingPosition(position, position.asset);
  });

export const repayLendingPosition = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      positionId: string;
      amountCents: number;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { requireAuthenticatedWallet } = await import("@/lib/auth/require-auth");
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (!user) throw new Error("User not found");

    const position = await prisma.lendingPosition.findFirst({
      where: { id: data.positionId, userId: user.id, status: "active" },
      include: { asset: true },
    });
    if (!position) throw new Error("Position not found");

    const { repayKaminoPosition } = await import("@/lib/solana/integrations/kamino");
    await repayKaminoPosition({
      wallet: data.walletAddress,
      positionPubkey: position.onChainPubkey ?? position.id,
      amountCents: data.amountCents,
    });

    const remaining = position.principalCents - data.amountCents;
    if (remaining <= 0) {
      const closed = await prisma.lendingPosition.update({
        where: { id: position.id },
        data: { status: "repaid", principalCents: 0 },
        include: { asset: true },
      });
      return mapLendingPosition(closed, closed.asset);
    }

    const updated = await prisma.lendingPosition.update({
      where: { id: position.id },
      data: { principalCents: remaining },
      include: { asset: true },
    });
    return mapLendingPosition(updated, updated.asset);
  });
