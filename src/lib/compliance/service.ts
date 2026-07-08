import { prisma } from "@/lib/db";
import { recomputeUserTrust } from "@/lib/trust/refresh";
import type { WalletComplianceDTO } from "@/lib/types";

export async function getWalletComplianceRecord(
  walletAddress: string,
): Promise<WalletComplianceDTO> {
  const record = await prisma.walletCompliance.findUnique({ where: { walletAddress } });
  if (!record) {
    return { walletAddress, kycTier: "unverified", verified: false, verifiedAt: null };
  }
  return {
    walletAddress: record.walletAddress,
    kycTier: record.kycTier,
    verified: record.kycTier !== "unverified",
    verifiedAt: record.verifiedAt?.toISOString() ?? null,
  };
}

export async function markWalletVerified(input: {
  walletAddress: string;
  kycTier?: string;
  externalRef?: string;
  provider?: string;
}): Promise<WalletComplianceDTO> {
  const kycTier = input.kycTier ?? "basic";
  const record = await prisma.walletCompliance.upsert({
    where: { walletAddress: input.walletAddress },
    create: {
      walletAddress: input.walletAddress,
      kycTier,
      verifiedAt: new Date(),
      provider: input.provider ?? "manual",
      externalRef: input.externalRef,
    },
    update: {
      kycTier,
      verifiedAt: new Date(),
      externalRef: input.externalRef,
    },
  });

  await prisma.user.upsert({
    where: { walletAddress: input.walletAddress },
    create: { walletAddress: input.walletAddress, kycTier, kycVerifiedAt: new Date() },
    update: { kycTier, kycVerifiedAt: new Date() },
  });

  await recomputeUserTrust(input.walletAddress);

  return {
    walletAddress: record.walletAddress,
    kycTier: record.kycTier,
    verified: true,
    verifiedAt: record.verifiedAt?.toISOString() ?? null,
  };
}
