import type { TrustFactorsDTO } from "@/lib/types";

export function computeAssetTrustFactors(input: {
  valueCents: number;
  debtCents: number;
  yieldBps: number;
  occupancyBps?: number | null;
  hasAttestation: boolean;
  navAgeDays: number;
  reserveMatchBps: number;
}): TrustFactorsDTO {
  const ltv = input.debtCents / Math.max(input.valueCents, 1);
  const titleVerification = input.hasAttestation ? 95 : 70;
  const navFreshness = input.navAgeDays <= 30 ? 95 : input.navAgeDays <= 90 ? 80 : 60;
  const debtStability = ltv < 0.3 ? 95 : ltv < 0.5 ? 85 : ltv < 0.65 ? 70 : 55;
  const reserveMatch = Math.min(100, Math.round(input.reserveMatchBps / 100));
  const occupancy = input.occupancyBps ? Math.round(input.occupancyBps / 100) : 85;

  return { titleVerification, navFreshness, debtStability, reserveMatch, occupancy };
}

export function compositeAssetTrustScore(factors: TrustFactorsDTO): number {
  const weighted =
    factors.titleVerification * 0.25 +
    factors.navFreshness * 0.2 +
    factors.debtStability * 0.2 +
    factors.reserveMatch * 0.2 +
    factors.occupancy * 0.15;
  return Math.min(100, Math.max(50, Math.round(weighted)));
}

export function computeUserTrustScore(input: {
  kycTier: string;
  repaymentScore: number;
  tradingScore: number;
  communityScore: number;
}): number {
  const kyc =
    input.kycTier === "accredited" ? 95 : input.kycTier === "basic" ? 80 : input.kycTier === "pending" ? 60 : 45;
  const weighted =
    kyc * 0.35 + input.repaymentScore * 0.3 + input.tradingScore * 0.25 + input.communityScore * 0.1;
  return Math.min(100, Math.max(30, Math.round(weighted)));
}

export function trustGatedBorrowLtvBps(userScore: number, assetScore: number): number {
  const combined = userScore * 0.4 + assetScore * 0.6;
  if (combined >= 90) return 5500;
  if (combined >= 80) return 5000;
  if (combined >= 70) return 4500;
  return 4000;
}

export function trustGatedMaxLeverage(userScore: number, assetScore: number, marketMax: number): number {
  const combined = userScore * 0.4 + assetScore * 0.6;
  if (combined >= 95) return marketMax;
  if (combined >= 85) return Math.min(marketMax, 8);
  if (combined >= 75) return Math.min(marketMax, 5);
  return Math.min(marketMax, 3);
}
