function env(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env[key]) {
    return process.env[key] as string;
  }
  const viteEnv =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env as Record<string, string | undefined>)[key];
  return viteEnv ?? fallback;
}

export const SOLANA_CONFIG = {
  network: env("VITE_SOLANA_NETWORK", "devnet"),
  rpcUrl: env("VITE_SOLANA_RPC_URL", env("SOLANA_RPC_URL", "https://api.devnet.solana.com")),
  passportProgramId: env("VITE_PASSPORT_PROGRAM_ID", env("PASSPORT_PROGRAM_ID")),
  registryProgramId: env("VITE_REGISTRY_PROGRAM_ID", env("REGISTRY_PROGRAM_ID")),
  namesProgramId: env("VITE_NAMES_PROGRAM_ID", env("NAMES_PROGRAM_ID")),
  vaultProgramId: env("VITE_VAULT_PROGRAM_ID", env("VAULT_PROGRAM_ID")),
  euroMintAddress: env("VITE_EURO_MINT_ADDRESS", env("EURO_MINT_ADDRESS")),
  rewardsMintAddress: env("VITE_REWARDS_MINT_ADDRESS", env("REWARDS_MINT_ADDRESS")),
  usdcMintAddress: env(
    "VITE_USDC_MINT_ADDRESS",
    env("USDC_MINT_ADDRESS", "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
  ),
  treasuryWalletAddress: env("TREASURY_WALLET_ADDRESS", env("VITE_TREASURY_WALLET_ADDRESS")),
  guardianPubkey: env(
    "VITE_GUARDIAN_SIGNER_PUBKEY",
    env(
      "GUARDIAN_SIGNER_PUBKEY",
      env("TREASURY_WALLET_ADDRESS", env("VITE_TREASURY_WALLET_ADDRESS")),
    ),
  ),
} as const;
