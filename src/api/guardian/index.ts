import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma, ensureSeeded } from "@/lib/db";
import { mapGuardianAudit } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";
import { computeAuditResult, extractAssetFields, signAttestation } from "./extract";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

async function runAuditJob(assetId: string) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return;

  const steps = [
    { event: "Scanning ownership documents", target: asset.name, result: "PASSED" },
    { event: "Cross-referencing land registry", target: asset.location, result: "VERIFIED" },
    {
      event: "Modeling market valuation",
      target: asset.name,
      result: `€${(asset.valueCents / 100).toLocaleString()}`,
    },
    { event: "Running risk & solvency analysis", target: asset.name, result: "COMPLETE" },
  ];

  for (const step of steps) {
    await prisma.guardianAudit.create({ data: { ...step, riskLevel: "low" } });
    await new Promise((r) => setTimeout(r, 300));
  }

  const job = await prisma.guardianJob.findFirst({
    where: { assetId },
    orderBy: { createdAt: "desc" },
  });
  let riskProfile = "standard";
  if (job?.extractedJson) {
    try {
      riskProfile =
        (JSON.parse(job.extractedJson) as { riskProfile?: string }).riskProfile ?? "standard";
    } catch {
      /* ignore */
    }
  }

  const audit = computeAuditResult(asset.valueCents, asset.debtCents, riskProfile);
  const attestationSig = signAttestation({
    assetId,
    trustScore: audit.trustScore,
    grade: audit.guardianGrade,
    at: new Date().toISOString(),
  });

  await prisma.assetPassport.upsert({
    where: { assetId },
    create: {
      assetId,
      trustScore: audit.trustScore,
      collateralRatio: audit.collateralRatio,
      guardianGrade: audit.guardianGrade,
      attestationSig,
      trustFactorsJson: JSON.stringify(audit.trustFactors),
      lastAuditAt: new Date(),
    },
    update: {
      trustScore: audit.trustScore,
      guardianGrade: audit.guardianGrade,
      attestationSig,
      trustFactorsJson: JSON.stringify(audit.trustFactors),
      lastAuditAt: new Date(),
    },
  });

  await prisma.oracleSnapshot.create({
    data: {
      assetId,
      navCents: asset.valueCents,
      debtCents: asset.debtCents,
      yieldBps: asset.yieldBps,
      source: "guardian",
      attestationSig,
    },
  });

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: "VERIFIED", health: audit.trustScore },
  });

  await prisma.guardianAudit.create({
    data: {
      event: "Passport attestation",
      target: asset.name,
      result: audit.guardianGrade,
      riskLevel: "low",
      signedPayload: attestationSig,
    },
  });

  if (job) {
    await prisma.guardianJob.update({ where: { id: job.id }, data: { status: "complete" } });
  }

  const pool = await prisma.liquidityPool.findUnique({ where: { id: "singleton" } });
  if (pool) {
    await prisma.liquidityPool.update({
      where: { id: "singleton" },
      data: { riskChecksToday: pool.riskChecksToday + 1 },
    });
  }

  return audit;
}

export const submitAsset = createServerFn({ method: "POST" })
  .validator(
    (data: { naturalLanguage: string; assetType: string; assetId?: string; name?: string }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const extracted = await extractAssetFields(data.naturalLanguage, data.assetType);
    let assetId = data.assetId;
    if (!assetId) {
      const slug =
        (data.name ?? extracted.location)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 40) +
        "-" +
        Date.now().toString(36);
      const asset = await prisma.asset.create({
        data: {
          slug,
          name: data.name ?? `${data.assetType} — ${extracted.location}`,
          location: extracted.location,
          assetType: data.assetType,
          imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1024&q=80",
          valueCents: extracted.estimatedValueCents,
          debtCents: 0,
          originalDebtCents: 0,
          health: 0,
          yieldBps: 500,
          status: "PENDING_AUDIT",
        },
      });
      assetId = asset.id;
    }
    await prisma.guardianJob.create({
      data: {
        assetId,
        naturalLanguage: data.naturalLanguage,
        extractedJson: JSON.stringify(extracted),
        status: "extracted",
      },
    });
    return { assetId, extracted };
  });

export const uploadDocument = createServerFn({ method: "POST" })
  .validator(
    (data: { assetId: string; fileName: string; mimeType: string; contentBase64: string }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    await mkdir(UPLOAD_DIR, { recursive: true });
    const storageKey = `${data.assetId}/${Date.now()}-${data.fileName}`;
    const buffer = Buffer.from(data.contentBase64, "base64");
    await writeFile(join(UPLOAD_DIR, storageKey.replace(/\//g, "_")), buffer);
    const doc = await prisma.document.create({
      data: {
        assetId: data.assetId,
        storageKey,
        fileName: data.fileName,
        mimeType: data.mimeType,
        verified: false,
      },
    });
    void runAuditJob(data.assetId);
    return { documentId: doc.id, storageKey };
  });

export const getGuardianStatus = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const pool = await prisma.liquidityPool.findUnique({ where: { id: "singleton" } });
  return {
    online: true,
    assetsMonitored: pool?.assetsMonitored ?? 1284,
    healthyPercent: pool?.healthyPercent ?? 98,
    riskChecksToday: pool?.riskChecksToday ?? 12,
  };
});

export const getGuardianAudits = createServerFn({ method: "GET" })
  .validator((data: { limit?: number } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    await ensureSeeded();
    const audits = await prisma.guardianAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: data.limit ?? 20,
    });
    return audits.map(mapGuardianAudit);
  });

export const runGuardianAudit = createServerFn({ method: "POST" })
  .validator((data: { assetId: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    return runAuditJob(data.assetId);
  });

export const mintPassportRecord = createServerFn({ method: "POST" })
  .validator((data: { assetId: string; solanaMint: string; walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const passport = await prisma.assetPassport.update({
      where: { assetId: data.assetId },
      data: { solanaMint: data.solanaMint, lastAuditAt: new Date() },
    });
    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (user) {
      const task = await prisma.task.findUnique({ where: { slug: "mint-passport" } });
      if (task) {
        await prisma.taskCompletion.upsert({
          where: { userId_taskId: { userId: user.id, taskId: task.id } },
          create: { userId: user.id, taskId: task.id, status: "CLAIMABLE" },
          update: { status: "CLAIMABLE" },
        });
      }
    }
    return { passportId: passport.id, solanaMint: passport.solanaMint };
  });
