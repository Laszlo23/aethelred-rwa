import { prisma, ensureSeeded } from "@/lib/db";
import type { PublicMetricsDTO } from "@/lib/types";
import { createServerFn } from "@tanstack/react-start";

export const getPublicMetrics = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();

  const [
    assetCount,
    navAgg,
    taskCount,
    kycApproved,
    kycPending,
    walletCount,
    ledgerCount,
    shareHolders,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.aggregate({ _sum: { valueCents: true } }),
    prisma.task.count(),
    prisma.kycApplication.count({ where: { status: "approved" } }),
    prisma.kycApplication.count({ where: { status: "pending" } }),
    prisma.user.count(),
    prisma.fundLedgerEntry.count(),
    prisma.assetShare.groupBy({
      by: ["holderWallet"],
      _count: { holderWallet: true },
    }),
  ]);

  const metrics: PublicMetricsDTO = {
    assetCount,
    totalNavCents: navAgg._sum.valueCents ?? 0,
    taskCount,
    kycApproved,
    kycPending,
    walletCount,
    onChainPrograms: 6,
    ledgerEntries: ledgerCount,
    uniqueShareholders: shareHolders.length,
    liveUrl: "https://rwa.buildingcultureid.space",
    repositoryUrl: "https://github.com/Laszlo23/aethelred-rwa",
    ecosystemUrl: "https://buildingcultureid.space",
    chain: "Solana devnet",
  };

  return metrics;
});
