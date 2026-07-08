import { createRequire } from "node:module";
import { SOLANA_CONFIG } from "../config";

const require = createRequire(import.meta.url);

export function getSolanaConnection() {
  const { Connection } = require("@solana/web3.js") as typeof import("@solana/web3.js");
  const url =
    typeof process !== "undefined" && process.env.SOLANA_RPC_URL
      ? process.env.SOLANA_RPC_URL
      : SOLANA_CONFIG.rpcUrl;
  return new Connection(url, "confirmed");
}
