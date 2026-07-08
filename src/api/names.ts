import { prisma, ensureSeeded } from "@/lib/db";
import { requireAuthenticatedWallet } from "@/lib/auth/require-auth";
import type { NameRegistrationDTO } from "@/lib/types";
import { createServerFn } from "@tanstack/react-start";
import { PublicKey } from "@solana/web3.js";

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

function deriveNamePda(handle: string): string {
  const programId = process.env.NAMES_PROGRAM_ID ?? "Names11111111111111111111111111111111111111";
  const enc = new TextEncoder();
  const [pda] = PublicKey.findProgramAddressSync(
    [enc.encode("name"), enc.encode(handle)],
    new PublicKey(programId),
  );
  return pda.toBase58();
}

export const resolveName = createServerFn({ method: "GET" })
  .validator((data: { handle: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const record = await prisma.nameRegistration.findUnique({
      where: { handle: data.handle.toLowerCase() },
    });
    if (!record || record.expiresAt < new Date()) return null;
    return {
      handle: record.handle,
      walletAddress: record.walletAddress,
      expiresAt: record.expiresAt.toISOString(),
      solanaPda: record.solanaPda,
    } satisfies NameRegistrationDTO;
  });

export const registerName = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      handle: string;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const handle = data.handle.toLowerCase().replace(/\.aethel$/, "");
    if (!HANDLE_RE.test(handle)) {
      throw new Error("Handle must be 3–30 lowercase alphanumeric characters");
    }

    const existing = await prisma.nameRegistration.findUnique({ where: { handle } });
    if (existing && existing.walletAddress !== data.walletAddress) {
      throw new Error("Handle already taken");
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: data.walletAddress },
      include: { trustProfile: true },
    });
    if (!user) throw new Error("User not found");

    const trustScore = user.trustProfile?.trustScore ?? 50;
    if (handle.length <= 4 && trustScore < 80) {
      throw new Error("Premium handles require trust score ≥ 80");
    }

    const expiresAt = new Date(Date.now() + 365 * 86400000);
    const solanaPda = deriveNamePda(handle);

    const record = await prisma.nameRegistration.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        walletAddress: data.walletAddress,
        handle,
        solanaPda,
        expiresAt,
      },
      update: { handle, solanaPda, expiresAt },
    });

    return {
      handle: record.handle,
      walletAddress: record.walletAddress,
      expiresAt: record.expiresAt.toISOString(),
      solanaPda: record.solanaPda,
    } satisfies NameRegistrationDTO;
  });

export const getNameForWallet = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const record = await prisma.nameRegistration.findUnique({
      where: { walletAddress: data.walletAddress },
    });
    if (!record) return null;
    return {
      handle: record.handle,
      walletAddress: record.walletAddress,
      expiresAt: record.expiresAt.toISOString(),
      solanaPda: record.solanaPda,
    } satisfies NameRegistrationDTO;
  });
