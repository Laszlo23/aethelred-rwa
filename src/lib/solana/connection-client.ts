import { Connection } from "@solana/web3.js";
import { SOLANA_CONFIG } from "./config";

/** Browser-safe Solana RPC connection (no Anchor dependency). */
export function getConnection(): Connection {
  return new Connection(SOLANA_CONFIG.rpcUrl, "confirmed");
}
