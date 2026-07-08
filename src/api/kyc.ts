import { ensureSeeded } from "@/lib/db";
import { requireAuthenticatedWallet } from "@/lib/auth/require-auth";
import { requireAdmin, isAdminRequest } from "@/lib/auth/require-admin";
import { submitKyc, getKyc, listKyc, reviewKyc } from "@/lib/kyc/service";
import type { KycApplicationDTO, KycStatusDTO } from "@/lib/types";
import { createServerFn } from "@tanstack/react-start";

export const submitKycApplication = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      fullName: string;
      country: string;
      dateOfBirth?: string;
      docType: string;
      docNumber: string;
      requestedTier?: string;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<KycApplicationDTO> => {
    await ensureSeeded();
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });
    return submitKyc(data);
  });

export const getKycStatus = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }): Promise<KycStatusDTO> => {
    await ensureSeeded();
    return getKyc(data.walletAddress);
  });

export const listKycApplications = createServerFn({ method: "GET" })
  .validator((data: { adminSecret?: string; walletAddress?: string; status?: string }) => data)
  .handler(async ({ data }): Promise<KycApplicationDTO[]> => {
    await ensureSeeded();
    requireAdmin(data);
    return listKyc(data.status);
  });

export const reviewKycApplication = createServerFn({ method: "POST" })
  .validator(
    (data: {
      adminSecret?: string;
      walletAddress?: string;
      applicationId: string;
      decision: "approve" | "reject";
      note?: string;
      tier?: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<KycApplicationDTO> => {
    await ensureSeeded();
    requireAdmin(data);
    return reviewKyc({
      applicationId: data.applicationId,
      decision: data.decision,
      note: data.note,
      tier: data.tier,
      reviewedBy: data.walletAddress,
    });
  });

export const checkAdminAccess = createServerFn({ method: "POST" })
  .validator((data: { adminSecret?: string; walletAddress?: string }) => data)
  .handler(async ({ data }) => {
    return { isAdmin: isAdminRequest(data) };
  });
