import { prisma, ensureSeeded } from "@/lib/db";
import { mapAsset, mapLendingPosition, mapPerk, mapShare } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";

export const getPortfolio = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.findUnique({
      where: { walletAddress: data.walletAddress },
      include: { assets: { include: { passport: true } } },
    });

    const shareHoldings = await prisma.assetShare.findMany({
      where: { holderWallet: data.walletAddress },
      include: { asset: { include: { passport: true, perks: true } } },
    });

    const lendingPositions = user
      ? await prisma.lendingPosition.findMany({
          where: { userId: user.id, status: "active" },
          include: { asset: true },
        })
      : [];

    const payouts = await prisma.sharePayout.findMany({
      where: { holderWallet: data.walletAddress },
      include: { distribution: { include: { asset: true } } },
    });
    const totalYieldEarnedCents = payouts.reduce((s, p) => s + p.amountCents, 0);

    const holdings = user ? user.assets.map(mapAsset) : [];
    const shareAssets = shareHoldings.map((s) => mapAsset(s.asset));
    const mergedHoldings = [...holdings];
    for (const sa of shareAssets) {
      if (!mergedHoldings.find((h) => h.id === sa.id)) {
        mergedHoldings.push(sa);
      }
    }

    const eligiblePerks = shareHoldings.flatMap((sh) =>
      sh.asset.perks
        .filter((perk) => sh.shareBps >= perk.minShareBps)
        .map((perk) => ({
          ...mapPerk(perk),
          assetSlug: sh.asset.slug,
          assetName: sh.asset.name,
        })),
    );

    const totalValueCents = mergedHoldings.reduce((s, h) => s + h.valueCents, 0);
    const totalDebtCents = mergedHoldings.reduce((s, h) => s + h.debtCents, 0);
    const totalAvailableCents = mergedHoldings.reduce((s, h) => s + h.availableLiquidityCents, 0);

    const collateralByAsset = new Map<string, number>();
    for (const lp of lendingPositions) {
      collateralByAsset.set(
        lp.assetId,
        (collateralByAsset.get(lp.assetId) ?? 0) + lp.collateralShareBps,
      );
    }

    const yieldByAsset = new Map<string, number>();
    for (const p of payouts) {
      const assetId = p.distribution.assetId;
      yieldByAsset.set(assetId, (yieldByAsset.get(assetId) ?? 0) + p.amountCents);
    }

    const positions = shareHoldings.map((sh) => {
      const marketValueCents = Math.round((sh.asset.valueCents * sh.shareBps) / 10000);
      const costBasisCents = Math.round(marketValueCents * 0.92);
      const unrealizedPnlCents = marketValueCents - costBasisCents;
      const realizedYieldCents = yieldByAsset.get(sh.assetId) ?? 0;
      const collateralBps = collateralByAsset.get(sh.assetId) ?? 0;
      const stakedBps = Math.max(0, sh.shareBps - collateralBps);

      return {
        assetId: sh.asset.id,
        assetSlug: sh.asset.slug,
        assetName: sh.asset.name,
        imageUrl: sh.asset.imageUrl,
        shareBps: sh.shareBps,
        stakedBps,
        collateralBps,
        marketValueCents,
        costBasisCents,
        unrealizedPnlCents,
        realizedYieldCents,
        yieldApyBps: sh.asset.yieldBps,
      };
    });

    const stakedValueCents = positions.reduce(
      (s, p) => s + Math.round((p.marketValueCents * p.stakedBps) / Math.max(p.shareBps, 1)),
      0,
    );
    const lentPrincipalCents = lendingPositions.reduce((s, p) => s + p.principalCents, 0);
    const marketValueCents = positions.reduce((s, p) => s + p.marketValueCents, 0);
    const costBasisTotal = positions.reduce((s, p) => s + p.costBasisCents, 0);
    const unrealizedPnlCents = positions.reduce((s, p) => s + p.unrealizedPnlCents, 0);
    const totalPnlCents = unrealizedPnlCents + totalYieldEarnedCents;
    const pnlPercentBps =
      costBasisTotal > 0 ? Math.round((totalPnlCents / costBasisTotal) * 10000) : 0;

    const stakingApyBps =
      positions.length > 0
        ? Math.round(
            positions.reduce((s, p) => s + p.yieldApyBps * p.stakedBps, 0) /
              Math.max(
                positions.reduce((sum, p) => sum + p.stakedBps, 0),
                1,
              ),
          )
        : 0;

    const lendingApyBps =
      lendingPositions.length > 0
        ? Math.round(lendingPositions.reduce((s, p) => s + p.apyBps, 0) / lendingPositions.length)
        : 0;

    const netWorthCents = marketValueCents + totalYieldEarnedCents - lentPrincipalCents;

    return {
      holdings: mergedHoldings,
      shareHoldings: shareHoldings.map((s) => mapShare(s, s.asset)),
      lendingPositions: lendingPositions.map((p) => mapLendingPosition(p, p.asset)),
      totalValueCents,
      totalDebtCents,
      totalAvailableCents,
      totalYieldEarnedCents,
      eligiblePerks,
      dashboard: {
        netWorthCents,
        totalPnlCents,
        pnlPercentBps,
        stakedValueCents,
        lentPrincipalCents,
        stakingApyBps,
        lendingApyBps,
      },
      positions,
    };
  });

export const upsertUser = createServerFn({ method: "POST" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.upsert({
      where: { walletAddress: data.walletAddress },
      create: { walletAddress: data.walletAddress },
      update: {},
    });
    const walletConnectTask = await prisma.task.findUnique({ where: { slug: "connect-wallet" } });
    if (walletConnectTask) {
      await prisma.taskCompletion.upsert({
        where: { userId_taskId: { userId: user.id, taskId: walletConnectTask.id } },
        create: { userId: user.id, taskId: walletConnectTask.id, status: "CLAIMABLE" },
        update: { status: "CLAIMABLE" },
      });
    }
    return { id: user.id, walletAddress: user.walletAddress, pointsBalance: user.pointsBalance };
  });
