/** Devnet Anchor programs + reference mints for grant reviewers and docs. */

export const ON_CHAIN_PROGRAMS = [
  { name: "passport", id: "9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A" },
  { name: "registry", id: "AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU" },
  { name: "names", id: "APU7238FpwdCWTrx5jSKpQYnkrrHiT1HgQgtPPRY3aDd" },
  { name: "vault", id: "4tzFUjGPaiENbHR3vZE9bLEdjrMSbewZqizkwP5m5t9X" },
  { name: "euro", id: "H3DagyBbC86U62PVkPV6pgtJcuuhhK7FpWwoLWsYHboL" },
  { name: "rewards", id: "4j6QfsG5mbZ6RaYZpdnzpk5zYfiJJWex2YA6TjsBhnhE" },
] as const;

export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/** Example SPL share mint — Building Culture City Berggasse (berggasse-35). */
export const EXAMPLE_SHARE_MINT = "8QNgtUCgqfHq1fNZbxUz41FNuWBYA2e4WUeXaqwfHbdm";

export const GITHUB_REPO = "https://github.com/Laszlo23/aethelred-rwa";
export const CI_BADGE =
  "https://github.com/Laszlo23/aethelred-rwa/actions/workflows/ci.yml/badge.svg";

export function solanaExplorerAddress(address: string, cluster = "devnet"): string {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

/** Optional 2-min grant demo video — set VITE_LOOM_DEMO_URL in .env */
export function getLoomDemoUrl(): string {
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOOM_DEMO_URL) ||
    (typeof process !== "undefined" && process.env.VITE_LOOM_DEMO_URL) ||
    "";
  return String(raw).trim();
}

export function getLoomEmbedUrl(shareOrEmbedUrl: string): string | null {
  const trimmed = shareOrEmbedUrl.trim();
  if (!trimmed) return null;
  if (trimmed.includes("/embed/")) return trimmed;
  const match = trimmed.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (match) return `https://www.loom.com/embed/${match[1]}`;
  return trimmed;
}
