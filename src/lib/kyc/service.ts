import { prisma } from "@/lib/db";
import { markWalletVerified } from "@/lib/compliance/service";
import type { KycApplicationDTO, KycStatusDTO } from "@/lib/types";

type KycRow = {
  id: string;
  walletAddress: string;
  fullName: string;
  country: string;
  dateOfBirth: string | null;
  docType: string;
  docNumber: string;
  requestedTier: string;
  status: string;
  reviewerNote: string | null;
  reviewedBy: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
};

export function mapApplication(a: KycRow): KycApplicationDTO {
  return {
    id: a.id,
    walletAddress: a.walletAddress,
    fullName: a.fullName,
    country: a.country,
    dateOfBirth: a.dateOfBirth,
    docType: a.docType,
    docNumberMasked: a.docNumber.length > 4 ? `••••${a.docNumber.slice(-4)}` : a.docNumber,
    requestedTier: a.requestedTier,
    status: a.status as KycApplicationDTO["status"],
    reviewerNote: a.reviewerNote,
    reviewedBy: a.reviewedBy,
    submittedAt: a.submittedAt.toISOString(),
    reviewedAt: a.reviewedAt?.toISOString() ?? null,
  };
}

export async function submitKyc(input: {
  walletAddress: string;
  fullName: string;
  country: string;
  dateOfBirth?: string;
  docType: string;
  docNumber: string;
  requestedTier?: string;
}): Promise<KycApplicationDTO> {
  if (!input.fullName?.trim() || !input.country?.trim() || !input.docNumber?.trim()) {
    throw new Error("Full name, country, and document number are required");
  }
  const shared = {
    fullName: input.fullName.trim(),
    country: input.country.trim(),
    dateOfBirth: input.dateOfBirth?.trim() || null,
    docType: input.docType,
    docNumber: input.docNumber.trim(),
    requestedTier: input.requestedTier ?? "basic",
    status: "pending",
    reviewerNote: null,
    reviewedBy: null,
    reviewedAt: null,
  };
  const application = await prisma.kycApplication.upsert({
    where: { walletAddress: input.walletAddress },
    create: { walletAddress: input.walletAddress, ...shared },
    update: shared,
  });
  return mapApplication(application);
}

export async function getKyc(walletAddress: string): Promise<KycStatusDTO> {
  const [compliance, application] = await Promise.all([
    prisma.walletCompliance.findUnique({ where: { walletAddress } }),
    prisma.kycApplication.findUnique({ where: { walletAddress } }),
  ]);
  return {
    walletAddress,
    verified: Boolean(compliance && compliance.kycTier !== "unverified"),
    kycTier: compliance?.kycTier ?? "unverified",
    verifiedAt: compliance?.verifiedAt?.toISOString() ?? null,
    application: application ? mapApplication(application) : null,
  };
}

export async function listKyc(status?: string): Promise<KycApplicationDTO[]> {
  const applications = await prisma.kycApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
  });
  return applications.map(mapApplication);
}

export async function reviewKyc(input: {
  applicationId: string;
  decision: "approve" | "reject";
  note?: string;
  tier?: string;
  reviewedBy?: string;
}): Promise<KycApplicationDTO> {
  const application = await prisma.kycApplication.findUnique({
    where: { id: input.applicationId },
  });
  if (!application) throw new Error("Application not found");

  const reviewedBy = input.reviewedBy ?? "admin-secret";

  if (input.decision === "approve") {
    const tier = input.tier ?? application.requestedTier ?? "basic";
    await markWalletVerified({
      walletAddress: application.walletAddress,
      kycTier: tier,
      externalRef: `manual:${application.id}`,
    });
    const updated = await prisma.kycApplication.update({
      where: { id: application.id },
      data: {
        status: "approved",
        reviewerNote: input.note ?? null,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
    return mapApplication(updated);
  }

  const updated = await prisma.kycApplication.update({
    where: { id: application.id },
    data: {
      status: "rejected",
      reviewerNote: input.note ?? "Rejected by reviewer",
      reviewedBy,
      reviewedAt: new Date(),
    },
  });
  return mapApplication(updated);
}
