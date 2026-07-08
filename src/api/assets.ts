import { prisma, ensureSeeded } from "@/lib/db";
import {
  computeShareSummary,
  mapAsset,
  mapDebtSnapshot,
  mapDistribution,
  mapPerk,
  mapProperty,
} from "@/lib/db/mappers";
import { computeLendingApyBps } from "@/lib/lending/config";
import { createServerFn } from "@tanstack/react-start";

export const listAssets = createServerFn({ method: "GET" })
  .validator((data: { assetType?: string; status?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    await ensureSeeded();
    const assets = await prisma.asset.findMany({
      where: {
        ...(data.assetType ? { assetType: data.assetType } : {}),
        ...(data.status ? { status: data.status as never } : {}),
      },
      include: { passport: true, property: true },
      orderBy: { createdAt: "desc" },
    });
    return assets.map((a) => ({
      ...mapAsset(a),
      property: a.property ? mapProperty(a.property) : null,
    }));
  });

export const getAsset = createServerFn({ method: "GET" })
  .validator((data: { slugOrId: string }) => data)
  .handler(async ({ data }) => {
    const detail = await getAssetDetailHandler(data.slugOrId);
    return detail;
  });

export const getAssetDetail = createServerFn({ method: "GET" })
  .validator((data: { slugOrId: string; walletAddress?: string }) => data)
  .handler(async ({ data }) => getAssetDetailHandler(data.slugOrId, data.walletAddress));

async function getAssetDetailHandler(slugOrId: string, _walletAddress?: string) {
  await ensureSeeded();
  const asset = await prisma.asset.findFirst({
    where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
    include: {
      passport: true,
      property: true,
      perks: { orderBy: { sortOrder: "asc" } },
      shares: true,
      lendingPositions: { where: { status: "active" } },
      debtSnapshots: { orderBy: { recordedAt: "asc" } },
      yieldDistributions: { orderBy: { distributedAt: "desc" }, take: 6 },
    },
  });
  if (!asset) return null;

  const shareSummary = computeShareSummary(asset.shares);
  const totalPrincipalCents = asset.lendingPositions.reduce(
    (s, p) => s + p.principalCents,
    0,
  );
  const avgApyBps =
    asset.lendingPositions.length > 0
      ? Math.round(
          asset.lendingPositions.reduce((s, p) => s + p.apyBps, 0) /
            asset.lendingPositions.length,
        )
      : computeLendingApyBps(asset.yieldBps);

  return {
    ...mapAsset(asset),
    property: asset.property ? mapProperty(asset.property) : null,
    perks: asset.perks.map(mapPerk),
    shareSummary,
    lendingSummary: {
      totalPrincipalCents,
      activePositions: asset.lendingPositions.length,
      avgApyBps,
    },
    recentDistributions: asset.yieldDistributions.map(mapDistribution),
    debtSnapshots: asset.debtSnapshots.map(mapDebtSnapshot),
  };
}

export const createAssetDraft = createServerFn({ method: "POST" })
  .validator(
    (data: {
      assetType: string;
      name: string;
      location: string;
      valueCents: number;
      debtCents?: number;
      naturalLanguage?: string;
      ownerWallet?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48) + "-" + Date.now().toString(36);
    let ownerId: string | undefined;
    if (data.ownerWallet) {
      const user = await prisma.user.upsert({
        where: { walletAddress: data.ownerWallet },
        create: { walletAddress: data.ownerWallet },
        update: {},
      });
      ownerId = user.id;
    }
    const asset = await prisma.asset.create({
      data: {
        slug,
        name: data.name,
        location: data.location,
        assetType: data.assetType,
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1024&q=80",
        valueCents: data.valueCents,
        debtCents: data.debtCents ?? 0,
        originalDebtCents: data.debtCents ?? 0,
        health: 0,
        yieldBps: 0,
        status: "PENDING_AUDIT",
        ownerId,
      },
      include: { passport: true },
    });
    if (data.naturalLanguage) {
      await prisma.guardianJob.create({
        data: { assetId: asset.id, naturalLanguage: data.naturalLanguage, status: "queued" },
      });
    }
    return mapAsset(asset);
  });
