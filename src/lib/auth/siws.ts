import nacl from "tweetnacl";
import bs58 from "bs58";

const NONCE_TTL_MS = 5 * 60 * 1000;

export function buildSiwsMessage(walletAddress: string, nonce: string, domain: string): string {
  const issuedAt = new Date().toISOString();
  return [
    `${domain} wants you to sign in with your Solana account:`,
    walletAddress,
    "",
    "Sign in to Aethelred RWA",
    "",
    `URI: https://${domain}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export function verifySiwsSignature(
  message: string,
  signatureBase58: string,
  walletAddress: string,
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signature = bs58.decode(signatureBase58);
    const publicKey = bs58.decode(walletAddress);
    return nacl.sign.detached.verify(messageBytes, signature, publicKey);
  } catch {
    return false;
  }
}

export function generateNonce(): string {
  return crypto.randomUUID();
}

export function isNonceFresh(issuedAt: Date | null | undefined): boolean {
  if (!issuedAt) return false;
  return Date.now() - issuedAt.getTime() < NONCE_TTL_MS;
}

export interface AuthenticatedWalletInput {
  walletAddress: string;
  signature: string;
  message: string;
}

export function assertWalletInMessage(message: string, walletAddress: string): boolean {
  return message.includes(walletAddress);
}
