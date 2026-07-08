import { createServerFn } from "@tanstack/react-start";
import { PublicKey } from "@solana/web3.js";
import { mintTestUsdcToWallet } from "@/lib/solana/primary-sale-server";
import { getSolanaConnection } from "@/lib/solana/anchor/connection";

const MAX_FAUCET_UI = 1_000;
const COOLDOWN_MS = 60_000;
const lastFaucetByWallet = new Map<string, number>();

function requireAdminSecret(header: string | undefined) {
  const secret = process.env.DEPLOY_ADMIN_SECRET?.trim();
  if (!secret) {
    throw new Error("Faucet disabled — set DEPLOY_ADMIN_SECRET");
  }
  if (!header || header !== secret) {
    throw new Error("Unauthorized faucet request");
  }
}

/** Local/devnet only — airdrop test USDC to a wallet for primary market testing. */
export const faucetTestUsdc = createServerFn({ method: "POST" })
  .validator((data: { walletAddress: string; amountUi?: number; adminSecret?: string }) => data)
  .handler(async ({ data, request }) => {
    const network = process.env.VITE_SOLANA_NETWORK ?? process.env.SOLANA_NETWORK ?? "devnet";
    if (network === "mainnet-beta") {
      throw new Error("Test USDC faucet is disabled on mainnet");
    }

    const headerSecret =
      request?.headers.get("x-deploy-admin-secret") ??
      request?.headers.get("X-Deploy-Admin-Secret") ??
      undefined;
    requireAdminSecret(data.adminSecret ?? headerSecret ?? undefined);

    const amountUi = Math.min(data.amountUi ?? 1_000, MAX_FAUCET_UI);
    const wallet = data.walletAddress.trim();
    const last = lastFaucetByWallet.get(wallet) ?? 0;
    if (Date.now() - last < COOLDOWN_MS) {
      throw new Error("Faucet cooldown active — try again in one minute");
    }

    const mint = process.env.USDC_MINT_ADDRESS ?? process.env.VITE_USDC_MINT_ADDRESS;
    if (!mint) {
      throw new Error("USDC mint not configured — run npm run setup:chain");
    }

    const connection = getSolanaConnection();
    const signature = await mintTestUsdcToWallet(
      connection,
      new PublicKey(mint),
      new PublicKey(wallet),
      amountUi,
    );
    lastFaucetByWallet.set(wallet, Date.now());

    return { signature, amountUi };
  });
