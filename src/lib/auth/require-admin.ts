/**
 * Admin authorization for the KYC review board.
 *
 * Two mechanisms (either grants access):
 *  1. Admin secret — the value of ADMIN_SECRET (falls back to DEPLOY_ADMIN_SECRET),
 *     supplied by the client from the admin passphrase gate.
 *  2. Wallet allowlist — ADMIN_WALLETS, a comma-separated list of base58 addresses.
 */
function adminSecret(): string {
  return (process.env.ADMIN_SECRET ?? process.env.DEPLOY_ADMIN_SECRET ?? "").trim();
}

function adminWallets(): string[] {
  return (process.env.ADMIN_WALLETS ?? "")
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
}

export function isAdminRequest(input: { adminSecret?: string; walletAddress?: string }): boolean {
  const secret = adminSecret();
  if (secret && input.adminSecret && input.adminSecret === secret) {
    return true;
  }
  const wallets = adminWallets();
  if (input.walletAddress && wallets.includes(input.walletAddress.trim())) {
    return true;
  }
  return false;
}

export function requireAdmin(input: { adminSecret?: string; walletAddress?: string }): void {
  if (!isAdminRequest(input)) {
    throw new Error("Unauthorized — admin access required");
  }
}
