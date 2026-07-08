import { prisma } from "@/lib/db";
import {
  computeUserTrustScore,
  trustGatedBorrowLtvBps,
  trustGatedMaxLeverage,
} from "@/lib/trust/scoring";

/**
 * Recomputes and persists a user's trust profile from their on-chain / lending
 * activity and KYC tier. Plain server-side helper shared by the trust server
 * function and the compliance/KYC flows.
 */
export async function recomputeUserTrust(walletAddress: string) {
  const user = await prisma.user.findUnique({
    where: { walletAddress },
    include: {
      lendingPositions: { where: { status: "active" } },
      perpPositions: { where: { status: "open" } },
      nameRegistration: true,
    },
  });
  if (!user) throw new Error("User not found");

  const compliance = await prisma.walletCompliance.findUnique({
    where: { walletAddress },
  });
  const kycTier = compliance?.kycTier ?? user.kycTier;

  const liquidations = user.perpPositions.filter(
    (p) => p.unrealizedPnlCents < -p.marginCents * 0.5,
  ).length;
  const repaymentScore =
    user.lendingPositions.length === 0
      ? 70
      : user.lendingPositions.every((p) => (p.healthFactorBps ?? 10000) > 12000)
        ? 90
        : 65;
  const tradingScore = liquidations === 0 ? 85 : Math.max(40, 85 - liquidations * 15);
  const communityScore = user.nameRegistration ? 80 : 55;

  const trustScore = computeUserTrustScore({ kycTier, repaymentScore, tradingScore, communityScore });
  const factors = { repaymentScore, tradingScore, communityScore };

  const avgAssetTrust = await prisma.assetPassport.aggregate({ _avg: { trustScore: true } });
  const assetScore = Math.round(avgAssetTrust._avg.trustScore ?? 85);

  const profile = await prisma.userTrustProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      walletAddress: user.walletAddress,
      trustScore,
      kycTier,
      maxBorrowLtvBps: trustGatedBorrowLtvBps(trustScore, assetScore),
      maxPerpLeverage: trustGatedMaxLeverage(trustScore, assetScore, 10),
      factorsJson: JSON.stringify(factors),
    },
    update: {
      trustScore,
      kycTier,
      maxBorrowLtvBps: trustGatedBorrowLtvBps(trustScore, assetScore),
      maxPerpLeverage: trustGatedMaxLeverage(trustScore, assetScore, 10),
      factorsJson: JSON.stringify(factors),
    },
  });

  return { profile, handle: user.nameRegistration?.handle ?? null };
}
