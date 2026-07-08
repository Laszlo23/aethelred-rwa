import type {
  AssetDTO,
  AssetPerkDTO,
  AssetPropertyDTO,
  AssetShareDTO,
  DebtSnapshotDTO,
  GuardianAuditDTO,
  LendingPositionDTO,
  LiquidityPoolDTO,
  PassportDTO,
  ProposalDTO,
  ShareSummaryDTO,
  TaskDTO,
  UserDTO,
  YieldDistributionDTO,
} from "@/lib/types";
import { computeAvailableLiquidity } from "@/lib/format";

type AssetWithPassport = {
  id: string;
  slug: string;
  name: string;
  location: string;
  assetType: string;
  imageUrl: string;
  valueCents: number;
  debtCents: number;
  originalDebtCents: number;
  debtRepaidCents: number;
  health: number;
  yieldBps: number;
  status: string;
  passport?: {
    id: string;
    assetId: string;
    trustScore: number;
    collateralRatio: number;
    guardianGrade: string;
    solanaMint: string | null;
    lastAuditAt: Date;
    attestationSig: string | null;
  } | null;
};

export function mapPassport(p: NonNullable<AssetWithPassport["passport"]>): PassportDTO {
  return {
    id: p.id,
    assetId: p.assetId,
    trustScore: p.trustScore,
    collateralRatio: p.collateralRatio,
    guardianGrade: p.guardianGrade,
    solanaMint: p.solanaMint,
    lastAuditAt: p.lastAuditAt.toISOString(),
    attestationSig: p.attestationSig,
  };
}

export function mapAsset(a: AssetWithPassport): AssetDTO {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    location: a.location,
    assetType: a.assetType,
    imageUrl: a.imageUrl,
    valueCents: a.valueCents,
    debtCents: a.debtCents,
    originalDebtCents: a.originalDebtCents,
    debtRepaidCents: a.debtRepaidCents,
    health: a.health,
    yieldBps: a.yieldBps,
    status: a.status as AssetDTO["status"],
    availableLiquidityCents: computeAvailableLiquidity(a.valueCents, a.debtCents),
    passport: a.passport ? mapPassport(a.passport) : null,
  };
}

export function mapLiquidityPool(p: {
  collateralCents: bigint;
  backingRatioBps: number;
  euroSupplyCents: bigint;
  assetsMonitored: number;
  healthyPercent: number;
  riskChecksToday: number;
}): LiquidityPoolDTO {
  return {
    collateralCents: Number(p.collateralCents),
    backingRatioBps: p.backingRatioBps,
    euroSupplyCents: Number(p.euroSupplyCents),
    assetsMonitored: p.assetsMonitored,
    healthyPercent: p.healthyPercent,
    riskChecksToday: p.riskChecksToday,
  };
}

export function mapGuardianAudit(a: {
  id: string;
  event: string;
  target: string;
  result: string;
  riskLevel: string | null;
  createdAt: Date;
}): GuardianAuditDTO {
  return {
    id: a.id,
    event: a.event,
    target: a.target,
    result: a.result,
    riskLevel: a.riskLevel,
    createdAt: a.createdAt.toISOString(),
  };
}

export function mapUser(u: { id: string; walletAddress: string; pointsBalance: number }): UserDTO {
  return { id: u.id, walletAddress: u.walletAddress, pointsBalance: u.pointsBalance };
}

export function mapProposal(p: {
  id: string;
  title: string;
  description: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  endsAt: Date;
}): ProposalDTO {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    endsAt: p.endsAt.toISOString(),
  };
}

export function mapTask(
  t: {
    id: string;
    slug: string;
    category: string;
    title: string;
    description: string;
    rewardPoints: number;
    rewardTokenAmount: number;
    timeEstimate: string;
    verificationType: string;
  },
  completion?: { id: string; status: string; proofUrl: string | null; txSignature: string | null } | null,
): TaskDTO {
  return {
    id: t.id,
    slug: t.slug,
    category: t.category as TaskDTO["category"],
    title: t.title,
    description: t.description,
    rewardPoints: t.rewardPoints,
    rewardTokenAmount: t.rewardTokenAmount,
    timeEstimate: t.timeEstimate,
    verificationType: t.verificationType as TaskDTO["verificationType"],
    completion: completion
      ? {
          id: completion.id,
          status: completion.status as TaskDTO["completion"] extends infer C
            ? C extends { status: infer S }
              ? S
              : never
            : never,
          proofUrl: completion.proofUrl,
          txSignature: completion.txSignature,
        }
      : null,
  };
}

export function mapDebtSnapshot(s: {
  recordedAt: Date;
  remainingDebtCents: number;
  repaidCents: number;
  health: number;
}): DebtSnapshotDTO {
  return {
    recordedAt: s.recordedAt.toISOString(),
    remainingDebtCents: s.remainingDebtCents,
    repaidCents: s.repaidCents,
    health: s.health,
  };
}

export function mapProperty(p: {
  tagline: string;
  description: string;
  galleryUrls: string;
  propertyClass: string;
  cultureSegment?: string | null;
  sqm: number | null;
  units: number | null;
  beds: number | null;
  yearBuilt: number | null;
  occupancyBps: number | null;
  bankHolder: string | null;
  communityRaiseTargetCents: number | null;
  tokensSoldBps: number;
  placesPropertyId?: number | null;
  externalRef?: string | null;
  tokenSymbol?: string | null;
  jurisdiction?: string | null;
  evmShareToken?: string | null;
}): AssetPropertyDTO {
  let galleryUrls: string[] = [];
  try {
    galleryUrls = JSON.parse(p.galleryUrls) as string[];
  } catch {
    galleryUrls = [];
  }
  return {
    tagline: p.tagline,
    description: p.description,
    galleryUrls,
    propertyClass: p.propertyClass as AssetPropertyDTO["propertyClass"],
    cultureSegment: (p.cultureSegment as AssetPropertyDTO["cultureSegment"]) ?? null,
    sqm: p.sqm,
    units: p.units,
    beds: p.beds,
    yearBuilt: p.yearBuilt,
    occupancyBps: p.occupancyBps,
    bankHolder: p.bankHolder,
    communityRaiseTargetCents: p.communityRaiseTargetCents,
    tokensSoldBps: p.tokensSoldBps,
    placesPropertyId: p.placesPropertyId ?? null,
    externalRef: p.externalRef ?? null,
    tokenSymbol: p.tokenSymbol ?? null,
    jurisdiction: p.jurisdiction ?? null,
    evmShareToken: p.evmShareToken ?? null,
  };
}

export function mapPerk(p: {
  id: string;
  perkType: string;
  title: string;
  description: string;
  minShareBps: number;
  sortOrder: number;
}): AssetPerkDTO {
  return {
    id: p.id,
    perkType: p.perkType as AssetPerkDTO["perkType"],
    title: p.title,
    description: p.description,
    minShareBps: p.minShareBps,
    sortOrder: p.sortOrder,
  };
}

export function mapShare(
  s: { id: string; assetId: string; shareBps: number; holderWallet: string },
  asset: { slug: string; name: string },
): AssetShareDTO {
  return {
    id: s.id,
    assetId: s.assetId,
    assetSlug: asset.slug,
    assetName: asset.name,
    shareBps: s.shareBps,
    holderWallet: s.holderWallet,
  };
}

export function mapLendingPosition(
  l: {
    id: string;
    assetId: string;
    principalCents: number;
    collateralShareBps: number;
    currency: string;
    accruedInterestCents: number;
    apyBps: number;
    status: string;
    protocol?: string;
    healthFactorBps?: number | null;
    liquidationPriceCents?: number | null;
    createdAt: Date;
  },
  asset: { slug: string; name: string },
): LendingPositionDTO {
  return {
    id: l.id,
    assetId: l.assetId,
    assetSlug: asset.slug,
    assetName: asset.name,
    principalCents: l.principalCents,
    collateralShareBps: l.collateralShareBps,
    currency: l.currency,
    accruedInterestCents: l.accruedInterestCents,
    apyBps: l.apyBps,
    status: l.status,
    protocol: l.protocol,
    healthFactorBps: l.healthFactorBps,
    liquidationPriceCents: l.liquidationPriceCents,
    createdAt: l.createdAt.toISOString(),
  };
}

export function mapDistribution(d: {
  id: string;
  assetId: string;
  periodLabel: string;
  totalCents: number;
  source: string;
  distributedAt: Date;
}): YieldDistributionDTO {
  return {
    id: d.id,
    assetId: d.assetId,
    periodLabel: d.periodLabel,
    totalCents: d.totalCents,
    source: d.source,
    distributedAt: d.distributedAt.toISOString(),
  };
}

export function computeShareSummary(shares: { shareBps: number }[]): ShareSummaryDTO {
  const totalSharesBps = shares.reduce((s, sh) => s + sh.shareBps, 0);
  const holderCount = shares.length;
  return {
    totalSharesBps,
    holderCount,
    tokensAvailableBps: Math.max(0, 10000 - totalSharesBps),
  };
}
