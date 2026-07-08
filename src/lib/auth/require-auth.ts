import { prisma } from "@/lib/db";
import {
  assertWalletInMessage,
  isNonceFresh,
  verifySiwsSignature,
  type AuthenticatedWalletInput,
} from "@/lib/auth/siws";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export async function requireAuthenticatedWallet(
  input: AuthenticatedWalletInput,
): Promise<{ id: string; walletAddress: string }> {
  const wallet = input.walletAddress?.trim();
  if (!wallet) {
    throw new Error("Wallet address required");
  }

  const user = await prisma.user.findUnique({ where: { walletAddress: wallet } });
  if (!user) {
    throw new Error("Connect wallet first");
  }

  if (input.signature && input.message) {
    if (!assertWalletInMessage(input.message, wallet)) {
      throw new Error("Signed message does not match wallet");
    }
    if (!verifySiwsSignature(input.message, input.signature, wallet)) {
      throw new Error("Invalid wallet signature");
    }
    if (!user.signingNonce || !input.message.includes(user.signingNonce)) {
      throw new Error("Stale or invalid sign-in nonce");
    }
    return { id: user.id, walletAddress: wallet };
  }

  if (user.lastSignedAt && Date.now() - user.lastSignedAt.getTime() < SESSION_TTL_MS) {
    return { id: user.id, walletAddress: wallet };
  }

  throw new Error("Wallet authentication required — sign in again");
}

export type AuthFields = {
  walletAddress: string;
  signature?: string;
  message?: string;
};

export async function requireAuthSession(walletAddress: string) {
  return requireAuthenticatedWallet({ walletAddress, signature: "", message: "" });
}
