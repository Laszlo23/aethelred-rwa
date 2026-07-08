import { prisma, ensureSeeded } from "@/lib/db";
import { mapDistribution } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";

export const listDistributions = createServerFn({ method: "GET" })
  .validator((data: { assetId: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
    });
    if (!asset) return [];

    const distributions = await prisma.yieldDistribution.findMany({
      where: { assetId: asset.id },
      orderBy: { distributedAt: "desc" },
      take: 12,
    });
    return distributions.map(mapDistribution);
  });

export const getHolderPayouts = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string; assetId?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();

    let assetFilterId: string | undefined;
    if (data.assetId) {
      const asset = await prisma.asset.findFirst({
        where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
      });
      assetFilterId = asset?.id;
    }

    const payouts = await prisma.sharePayout.findMany({
      where: {
        holderWallet: data.walletAddress,
        ...(assetFilterId ? { distribution: { assetId: assetFilterId } } : {}),
      },
      include: {
        distribution: { include: { asset: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return payouts.map((p) => ({
      id: p.id,
      distributionId: p.distributionId,
      periodLabel: p.distribution.periodLabel,
      assetSlug: p.distribution.asset.slug,
      assetName: p.distribution.asset.name,
      amountCents: p.amountCents,
      shareBpsAtSnapshot: p.shareBpsAtSnapshot,
      distributedAt: p.distribution.distributedAt.toISOString(),
    }));
  });
