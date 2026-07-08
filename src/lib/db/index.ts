import { SEED_GUARDIAN_LOG, SEED_PROPOSALS, SEED_TASKS } from "@/lib/data/seed";
import { TASK_FLOW_VERSION } from "@/lib/tasks/social-actions";
import { COMMUNITY_TREASURY_WALLET, DEMO_INVESTOR_WALLET } from "@/lib/data/seed-mogul";
import {
  BC_PERKS,
  BC_TREASURY_SHARES,
  BUILDING_CULTURE_ASSETS,
} from "@/lib/data/seed-building-culture";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

export const prisma: InstanceType<typeof PrismaClient> =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const BC_SLUGS = BUILDING_CULTURE_ASSETS.map((a) => a.slug);

let tasksSyncedThisProcess = false;

export async function ensureSeeded() {
  await seedAuxiliaryIfEmpty();
  await syncSeedTasksIfNeeded();
  await ensureBuildingCultureSeeded();
  await pruneNonBuildingCultureAssets();
}

async function syncSeedTasksIfNeeded() {
  if (tasksSyncedThisProcess) return;

  const followTask = await prisma.task.findUnique({
    where: { slug: "follow-bc-x" },
    select: { verificationConfig: true },
  });

  let needsSync = !followTask;
  if (followTask?.verificationConfig) {
    try {
      const config = JSON.parse(followTask.verificationConfig) as { flowVersion?: number };
      needsSync = config.flowVersion !== TASK_FLOW_VERSION;
    } catch {
      needsSync = true;
    }
  } else if (followTask) {
    needsSync = true;
  }

  if (!needsSync) {
    tasksSyncedThisProcess = true;
    return;
  }

  for (const t of SEED_TASKS) {
    await prisma.task.upsert({
      where: { slug: t.slug },
      create: { ...t, active: true },
      update: {
        category: t.category,
        title: t.title,
        description: t.description,
        rewardPoints: t.rewardPoints,
        rewardTokenAmount: t.rewardTokenAmount,
        timeEstimate: t.timeEstimate,
        verificationType: t.verificationType,
        verificationConfig: t.verificationConfig ?? null,
        active: true,
      },
    });
  }

  tasksSyncedThisProcess = true;
}

async function seedAuxiliaryIfEmpty() {
  const assetCount = await prisma.asset.count();
  if (assetCount > 0) return;

  await prisma.liquidityPool.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      collateralCents: BigInt(41_280_000_000),
      backingRatioBps: 15760,
      euroSupplyCents: BigInt(27_500_000_000),
      assetsMonitored: BC_SLUGS.length,
      healthyPercent: 98,
      riskChecksToday: 12,
    },
    update: {},
  });

  for (const t of SEED_TASKS) {
    await prisma.task.create({ data: t });
  }

  for (const p of SEED_PROPOSALS) {
    await prisma.proposal.create({
      data: {
        ...p,
        status: "ACTIVE",
        endsAt: new Date(Date.now() + 14 * 86400000),
      },
    });
  }

  for (const log of SEED_GUARDIAN_LOG) {
    await prisma.guardianAudit.create({ data: log });
  }
}

async function pruneNonBuildingCultureAssets() {
  await prisma.asset.deleteMany({
    where: { slug: { notIn: BC_SLUGS } },
  });
}

async function ensureBuildingCultureSeeded() {
  await prisma.user.upsert({
    where: { walletAddress: DEMO_INVESTOR_WALLET },
    create: { walletAddress: DEMO_INVESTOR_WALLET },
    update: {},
  });

  for (const bc of BUILDING_CULTURE_ASSETS) {
    const valueCents = bc.acquisitionEur * 100;
    const debtCents = Math.floor(valueCents * 0.28);
    const debtRepaidCents = Math.floor(valueCents * 0.04);

    const asset = await prisma.asset.upsert({
      where: { slug: bc.slug },
      create: {
        slug: bc.slug,
        name: bc.name,
        location: bc.location,
        assetType: "Real Estate",
        imageUrl: bc.imageUrl,
        valueCents,
        debtCents,
        originalDebtCents: Math.floor(valueCents * 0.32),
        debtRepaidCents,
        health: 95,
        yieldBps: bc.yieldBps,
        status: "VERIFIED",
        fractionalized: true,
        passport: {
          create: {
            trustScore: 96,
            collateralRatio: 150,
            guardianGrade: "A",
            solanaMint: null,
            attestationSig: `bc:${bc.externalRef}`,
          },
        },
        debtSnapshots: {
          create: [
            {
              remainingDebtCents: Math.floor(valueCents * 0.32),
              repaidCents: 0,
              health: 88,
              recordedAt: new Date(Date.now() - 120 * 86400000),
            },
            {
              remainingDebtCents: debtCents + debtRepaidCents,
              repaidCents: 0,
              health: 92,
              recordedAt: new Date(Date.now() - 60 * 86400000),
            },
            {
              remainingDebtCents: debtCents,
              repaidCents: debtRepaidCents,
              health: 95,
              recordedAt: new Date(),
            },
          ],
        },
      },
      update: {
        name: bc.name,
        location: bc.location,
        imageUrl: bc.imageUrl,
        valueCents,
        yieldBps: bc.yieldBps,
        status: "VERIFIED",
        fractionalized: true,
      },
      include: { passport: true },
    });

    if (!asset.passport) {
      await prisma.assetPassport.create({
        data: {
          assetId: asset.id,
          trustScore: 96,
          collateralRatio: 150,
          guardianGrade: "A",
          attestationSig: `bc:${bc.externalRef}`,
        },
      });
    }

    const existingProperty = await prisma.assetProperty.findUnique({
      where: { assetId: asset.id },
    });

    if (!existingProperty) {
      await prisma.assetProperty.create({
        data: {
          assetId: asset.id,
          tagline: bc.tagline,
          description: bc.description,
          galleryUrls: JSON.stringify(bc.galleryUrls),
          propertyClass: bc.propertyClass,
          cultureSegment: bc.cultureSegment,
          units: bc.units,
          occupancyBps: 9000,
          bankHolder: "Issuer SPV (off-chain title)",
          communityRaiseTargetCents: valueCents,
          tokensSoldBps: bc.tokensSoldBps,
          placesPropertyId: bc.placesPropertyId,
          externalRef: bc.externalRef,
          tokenSymbol: bc.symbol,
          jurisdiction: bc.jurisdiction,
          evmShareToken: bc.evmShareToken,
        },
      });
    } else {
      await prisma.assetProperty.update({
        where: { assetId: asset.id },
        data: {
          tagline: bc.tagline,
          description: bc.description,
          galleryUrls: JSON.stringify(bc.galleryUrls),
          cultureSegment: bc.cultureSegment,
          placesPropertyId: bc.placesPropertyId,
          externalRef: bc.externalRef,
          tokenSymbol: bc.symbol,
          jurisdiction: bc.jurisdiction,
          evmShareToken: bc.evmShareToken,
        },
      });
    }

    const perkGroup = BC_PERKS.find((p) => p.slug === bc.slug);
    if (perkGroup) {
      const existingPerks = await prisma.assetPerk.count({ where: { assetId: asset.id } });
      if (existingPerks === 0) {
        for (const perk of perkGroup.perks) {
          await prisma.assetPerk.create({
            data: { assetId: asset.id, ...perk },
          });
        }
      }
    }

    const treasuryShare = BC_TREASURY_SHARES.find((s) => s.slug === bc.slug);
    if (treasuryShare) {
      const existingShare = await prisma.assetShare.findFirst({
        where: { assetId: asset.id, holderWallet: COMMUNITY_TREASURY_WALLET },
      });
      if (!existingShare) {
        await prisma.assetShare.create({
          data: {
            assetId: asset.id,
            holderWallet: COMMUNITY_TREASURY_WALLET,
            shareBps: treasuryShare.shareBps,
          },
        });
      }
    }

    if (bc.annualRentEur > 0) {
      const existingDist = await prisma.yieldDistribution.count({
        where: { assetId: asset.id },
      });
      if (existingDist === 0) {
        const quarterlyCents = Math.floor((bc.annualRentEur * 100) / 4);
        await prisma.yieldDistribution.create({
          data: {
            assetId: asset.id,
            periodLabel: "Q1 2026 Rent (reference)",
            totalCents: quarterlyCents,
            source: "rent",
            distributedAt: new Date(Date.now() - 45 * 86400000),
          },
        });
      }
    }

    const oracleCount = await prisma.oracleSnapshot.count({ where: { assetId: asset.id } });
    if (oracleCount === 0) {
      await prisma.oracleSnapshot.create({
        data: {
          assetId: asset.id,
          navCents: valueCents,
          debtCents,
          yieldBps: bc.yieldBps,
          occupancyBps: 9000,
          source: "guardian",
          attestationSig: `bc-nav:${bc.externalRef}`,
        },
      });
    }

    const perpSymbol = `${bc.symbol}-PERP`;
    const change24hBps = -120 + Math.floor(Math.random() * 480);
    await prisma.perpMarket.upsert({
      where: { symbol: perpSymbol },
      create: {
        assetId: asset.id,
        symbol: perpSymbol,
        indexPriceCents: valueCents,
        fundingRateBps: 8 + Math.floor(Math.random() * 20),
        openInterestCents: Math.floor(valueCents * 0.02),
        volume24hCents: Math.floor(valueCents * 0.005),
        maxLeverage: bc.slug === "berggasse-35" ? 12 : 8,
        trustMinScore: bc.slug === "berggasse-35" ? 70 : 60,
        driftMarketIndex: bc.symbol === "OG1" ? 0 : bc.symbol === "OG2" ? 1 : 0,
        change24hBps,
        high24hCents: Math.floor(valueCents * 1.012),
        low24hCents: Math.floor(valueCents * 0.988),
      },
      update: {
        indexPriceCents: valueCents,
        assetId: asset.id,
        change24hBps,
        high24hCents: Math.floor(valueCents * 1.012),
        low24hCents: Math.floor(valueCents * 0.988),
      },
    });
  }

  await seedPerpMarketData();
}

async function seedPerpMarketData() {
  const { generateCandleHistory } = await import("@/lib/markets/candles");
  const markets = await prisma.perpMarket.findMany();

  for (const market of markets) {
    const candleCount = await prisma.perpCandle.count({
      where: { symbol: market.symbol, interval: "1h" },
    });
    if (candleCount === 0) {
      const history = generateCandleHistory(market.symbol, market.indexPriceCents, "1h", 72);
      for (const c of history) {
        await prisma.perpCandle.create({
          data: { symbol: market.symbol, interval: "1h", ...c },
        });
      }
    }

    const tradeCount = await prisma.perpTrade.count({ where: { symbol: market.symbol } });
    if (tradeCount === 0) {
      const trades = Array.from({ length: 24 }, (_, i) => {
        const side = i % 3 === 0 ? "short" : "long";
        const offset = (i % 5) - 2;
        return {
          symbol: market.symbol,
          side,
          priceCents: market.indexPriceCents + offset * Math.floor(market.indexPriceCents * 0.0001),
          sizeCents: Math.floor(market.indexPriceCents * 0.0002),
          recordedAt: new Date(Date.now() - i * 120_000),
        };
      });
      await prisma.perpTrade.createMany({ data: trades });
    }
  }

  const basketNavCents = Math.floor(
    BUILDING_CULTURE_ASSETS.reduce((s, a) => s + a.acquisitionEur * 100, 0) /
      BUILDING_CULTURE_ASSETS.length,
  );

  await prisma.perpMarket.upsert({
    where: { symbol: "BC-RWA" },
    create: {
      symbol: "BC-RWA",
      indexPriceCents: basketNavCents,
      fundingRateBps: 15,
      openInterestCents: 5_000_000_00,
      volume24hCents: 1_200_000_00,
      maxLeverage: 10,
      trustMinScore: 65,
      driftMarketIndex: 1,
      change24hBps: 85,
      high24hCents: Math.floor(basketNavCents * 1.008),
      low24hCents: Math.floor(basketNavCents * 0.992),
    },
    update: {
      indexPriceCents: basketNavCents,
      change24hBps: 85,
      high24hCents: Math.floor(basketNavCents * 1.008),
      low24hCents: Math.floor(basketNavCents * 0.992),
    },
  });

  const ledgerCount = await prisma.fundLedgerEntry.count();
  if (ledgerCount === 0) {
    await prisma.fundLedgerEntry.createMany({
      data: [
        {
          direction: "inbound",
          amountCents: 2_500_000_00,
          currency: "USDC",
          proofHash: "vault:genesis",
          note: "EURO vault genesis collateral",
        },
        {
          direction: "inbound",
          amountCents: 890_000_00,
          currency: "USDC",
          proofHash: "primary:og1",
          note: "OG1 primary market inflows",
        },
      ],
    });
  }

  const demoUser = await prisma.user.findUnique({ where: { walletAddress: DEMO_INVESTOR_WALLET } });
  if (demoUser) {
    await prisma.walletCompliance.upsert({
      where: { walletAddress: DEMO_INVESTOR_WALLET },
      create: {
        walletAddress: DEMO_INVESTOR_WALLET,
        kycTier: "basic",
        verifiedAt: new Date(),
        provider: "seed",
      },
      update: {},
    });

    await prisma.userTrustProfile.upsert({
      where: { userId: demoUser.id },
      create: {
        userId: demoUser.id,
        walletAddress: DEMO_INVESTOR_WALLET,
        trustScore: 82,
        kycTier: "basic",
        maxBorrowLtvBps: 5000,
        maxPerpLeverage: 8,
        factorsJson: JSON.stringify({ repaymentScore: 85, tradingScore: 80, communityScore: 75 }),
      },
      update: {},
    });
  }
}
