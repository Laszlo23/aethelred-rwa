import { prisma, ensureSeeded } from "@/lib/db";
import { buildSiwsMessage, generateNonce } from "@/lib/auth/siws";
import { requireAuthenticatedWallet } from "@/lib/auth/require-auth";
import { createServerFn } from "@tanstack/react-start";

const APP_DOMAIN = process.env.SIWS_DOMAIN ?? "localhost";

export const getAuthChallenge = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const wallet = data.walletAddress.trim();
    const nonce = generateNonce();
    const message = buildSiwsMessage(wallet, nonce, APP_DOMAIN);

    await prisma.user.upsert({
      where: { walletAddress: wallet },
      create: { walletAddress: wallet, signingNonce: nonce },
      update: { signingNonce: nonce },
    });

    return { message, nonce };
  });

export const verifyAuth = createServerFn({ method: "POST" })
  .validator(
    (data: { walletAddress: string; signature: string; message: string }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await requireAuthenticatedWallet(data);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastSignedAt: new Date(), signingNonce: null },
    });

    await prisma.userTrustProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        walletAddress: user.walletAddress,
        trustScore: 50,
        kycTier: "unverified",
      },
      update: {},
    });

    return { ok: true, walletAddress: user.walletAddress };
  });
