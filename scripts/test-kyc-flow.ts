/**
 * E2E test for the KYC + admin verification flow (service layer).
 * Usage: npx tsx scripts/test-kyc-flow.ts
 */
import { Keypair } from "@solana/web3.js";
import { PrismaClient } from "@prisma/client";

process.env.DEPLOY_ADMIN_SECRET = process.env.DEPLOY_ADMIN_SECRET ?? "local-dev-admin";

const prisma = new PrismaClient();
const wallet = Keypair.generate().publicKey.toBase58();
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? process.env.DEPLOY_ADMIN_SECRET!;

const results: { step: string; pass: boolean; detail: string }[] = [];
function record(step: string, pass: boolean, detail: string) {
  results.push({ step, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${step}: ${detail}`);
}

async function main() {
  const { submitKyc, getKyc, listKyc, reviewKyc } = await import("../src/lib/kyc/service");
  const { isAdminRequest } = await import("../src/lib/auth/require-admin");

  // Seed a user (KYC submit requires an authenticated wallet in the real API)
  await prisma.user.upsert({
    where: { walletAddress: wallet },
    create: { walletAddress: wallet, lastSignedAt: new Date() },
    update: { lastSignedAt: new Date() },
  });

  const before = await getKyc(wallet);
  record("initial-status", !before.verified && !before.application, `verified=${before.verified}`);

  const app = await submitKyc({
    walletAddress: wallet,
    fullName: "Jane Doe",
    country: "Austria",
    dateOfBirth: "1990-01-01",
    docType: "passport",
    docNumber: "P12345678",
    requestedTier: "basic",
  });
  record(
    "submit",
    app.status === "pending" && app.docNumberMasked.includes("5678"),
    `status=${app.status} masked=${app.docNumberMasked}`,
  );

  const badAdmin = isAdminRequest({ adminSecret: "wrong" });
  const goodAdmin = isAdminRequest({ adminSecret: ADMIN_SECRET });
  record("admin-gate", !badAdmin && goodAdmin, `bad=${badAdmin} good=${goodAdmin}`);

  const pending = await listKyc("pending");
  const found = pending.find((a) => a.walletAddress === wallet);
  record("admin-list", Boolean(found), `pending count=${pending.length}`);

  const approved = await reviewKyc({ applicationId: app.id, decision: "approve", tier: "basic" });
  record("approve", approved.status === "approved", `status=${approved.status}`);

  const after = await getKyc(wallet);
  record(
    "verified",
    after.verified && after.kycTier === "basic",
    `verified=${after.verified} tier=${after.kycTier}`,
  );

  // Reject path on a second wallet
  const wallet2 = Keypair.generate().publicKey.toBase58();
  await prisma.user.create({ data: { walletAddress: wallet2, lastSignedAt: new Date() } });
  const app2 = await submitKyc({
    walletAddress: wallet2,
    fullName: "John Roe",
    country: "Germany",
    docType: "id_card",
    docNumber: "ID999",
    requestedTier: "basic",
  });
  const rejected = await reviewKyc({
    applicationId: app2.id,
    decision: "reject",
    note: "Blurry document",
  });
  const after2 = await getKyc(wallet2);
  record(
    "reject",
    rejected.status === "rejected" &&
      !after2.verified &&
      after2.application?.reviewerNote === "Blurry document",
    `status=${rejected.status} verified=${after2.verified}`,
  );

  // Cleanup
  await prisma.kycApplication.deleteMany({ where: { walletAddress: { in: [wallet, wallet2] } } });
  await prisma.walletCompliance.deleteMany({ where: { walletAddress: { in: [wallet, wallet2] } } });
  await prisma.userTrustProfile.deleteMany({ where: { walletAddress: { in: [wallet, wallet2] } } });
  await prisma.user.deleteMany({ where: { walletAddress: { in: [wallet, wallet2] } } });
  await prisma.$disconnect();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
