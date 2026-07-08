import { prisma, ensureSeeded } from "@/lib/db";
import { recomputeUserTrust } from "@/lib/trust/refresh";
import type { UserTrustProfileDTO } from "@/lib/types";
import { createServerFn } from "@tanstack/react-start";

function mapTrustProfile(
  profile: {
    walletAddress: string;
    trustScore: number;
    kycTier: string;
    maxBorrowLtvBps: number;
    maxPerpLeverage: number;
    factorsJson: string | null;
  },
  handle?: string | null,
): UserTrustProfileDTO {
  let factors: Record<string, number> = {};
  if (profile.factorsJson) {
    try {
      factors = JSON.parse(profile.factorsJson) as Record<string, number>;
    } catch {
      factors = {};
    }
  }
  return {
    walletAddress: profile.walletAddress,
    trustScore: profile.trustScore,
    kycTier: profile.kycTier,
    maxBorrowLtvBps: profile.maxBorrowLtvBps,
    maxPerpLeverage: profile.maxPerpLeverage,
    factors,
    handle,
  };
}

export const getUserTrustProfile = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.findUnique({
      where: { walletAddress: data.walletAddress },
      include: { trustProfile: true, nameRegistration: true },
    });
    if (!user?.trustProfile) {
      return mapTrustProfile({
        walletAddress: data.walletAddress,
        trustScore: 50,
        kycTier: user?.kycTier ?? "unverified",
        maxBorrowLtvBps: 4000,
        maxPerpLeverage: 3,
        factorsJson: null,
      });
    }
    return mapTrustProfile(user.trustProfile, user.nameRegistration?.handle);
  });

export const refreshUserTrustScore = createServerFn({ method: "POST" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { profile, handle } = await recomputeUserTrust(data.walletAddress);
    return mapTrustProfile(profile, handle);
  });

export const getAssetTrustFactors = createServerFn({ method: "GET" })
  .validator((data: { assetSlug: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const asset = await prisma.asset.findUnique({
      where: { slug: data.assetSlug },
      include: { passport: true },
    });
    if (!asset?.passport) return null;
    if (!asset.passport.trustFactorsJson) return null;
    return JSON.parse(asset.passport.trustFactorsJson) as Record<string, number>;
  });
