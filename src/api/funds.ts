import { prisma, ensureSeeded } from "@/lib/db";
import type { FundsTransparencyDTO, FundLedgerEntryDTO, OracleSnapshotDTO } from "@/lib/types";
import { createServerFn } from "@tanstack/react-start";

function mapLedger(
  entry: {
    id: string;
    direction: string;
    amountCents: number;
    currency: string;
    proofHash: string | null;
    txSignature: string | null;
    recordedAt: Date;
    asset: { slug: string } | null;
  },
): FundLedgerEntryDTO {
  return {
    id: entry.id,
    assetSlug: entry.asset?.slug ?? null,
    direction: entry.direction,
    amountCents: entry.amountCents,
    currency: entry.currency,
    proofHash: entry.proofHash,
    txSignature: entry.txSignature,
    recordedAt: entry.recordedAt.toISOString(),
  };
}

function mapOracle(
  snap: {
    id: string;
    assetId: string;
    navCents: number;
    debtCents: number;
    yieldBps: number;
    source: string;
    recordedAt: Date;
    asset: { slug: string };
  },
): OracleSnapshotDTO {
  return {
    id: snap.id,
    assetId: snap.assetId,
    assetSlug: snap.asset.slug,
    navCents: snap.navCents,
    debtCents: snap.debtCents,
    yieldBps: snap.yieldBps,
    source: snap.source,
    recordedAt: snap.recordedAt.toISOString(),
  };
}

export const getFundsTransparency = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const assets = await prisma.asset.findMany({
    include: { passport: true, property: true },
    orderBy: { valueCents: "desc" },
  });

  const pool = await prisma.liquidityPool.findUnique({ where: { id: "singleton" } });
  const ledger = await prisma.fundLedgerEntry.findMany({
    take: 20,
    orderBy: { recordedAt: "desc" },
    include: { asset: true },
  });
  const snapshots = await prisma.oracleSnapshot.findMany({
    take: 16,
    orderBy: { recordedAt: "desc" },
    include: { asset: true },
  });

  const propertyBreakdown = assets.map((a) => ({
    slug: a.slug,
    name: a.name,
    navCents: a.valueCents,
    acquisitionCents: a.property?.communityRaiseTargetCents ?? a.valueCents,
    trustScore: a.passport?.trustScore ?? 0,
  }));

  const totalAumCents = assets.reduce((s, a) => s + a.valueCents, 0);
  const offChainReferenceCents = propertyBreakdown.reduce((s, p) => s + p.acquisitionCents, 0);
  const onChainReserveCents = pool ? Number(pool.collateralCents) / 100 : Math.floor(totalAumCents * 0.65);

  const result: FundsTransparencyDTO = {
    totalAumCents,
    onChainReserveCents,
    offChainReferenceCents,
    propertyBreakdown,
    recentLedger: ledger.map(mapLedger),
    oracleSnapshots: snapshots.map(mapOracle),
  };
  return result;
});

export const publishNavSnapshot = createServerFn({ method: "POST" })
  .validator(
    (data: { assetSlug: string; navCents?: number; debtCents?: number; yieldBps?: number }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const asset = await prisma.asset.findUnique({
      where: { slug: data.assetSlug },
      include: { passport: true },
    });
    if (!asset) throw new Error("Asset not found");

    const navCents = data.navCents ?? asset.valueCents;
    const debtCents = data.debtCents ?? asset.debtCents;
    const yieldBps = data.yieldBps ?? asset.yieldBps;

    const snap = await prisma.oracleSnapshot.create({
      data: {
        assetId: asset.id,
        navCents,
        debtCents,
        yieldBps,
        source: "guardian",
        attestationSig: asset.passport?.attestationSig,
      },
      include: { asset: true },
    });

    await prisma.asset.update({
      where: { id: asset.id },
      data: { valueCents: navCents, debtCents },
    });

    return mapOracle({ ...snap, asset });
  });
