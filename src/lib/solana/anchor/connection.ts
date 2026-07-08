import { Connection } from "@solana/web3.js";
import { SOLANA_CONFIG } from "../config";

export function getSolanaConnection(): Connection {
  const url =
    typeof process !== "undefined" && process.env.SOLANA_RPC_URL
      ? process.env.SOLANA_RPC_URL
      : SOLANA_CONFIG.rpcUrl;
  return new Connection(url, "confirmed");
}
