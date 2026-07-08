import { ensureSeeded } from "@/lib/db";
import { getWalletComplianceRecord, markWalletVerified } from "@/lib/compliance/service";
import { createServerFn } from "@tanstack/react-start";

export const getWalletCompliance = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    return getWalletComplianceRecord(data.walletAddress);
  });

export const setWalletVerified = createServerFn({ method: "POST" })
  .validator((data: { walletAddress: string; kycTier?: string; externalRef?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    return markWalletVerified({
      walletAddress: data.walletAddress,
      kycTier: data.kycTier,
      externalRef: data.externalRef,
      provider: "veriff",
    });
  });
