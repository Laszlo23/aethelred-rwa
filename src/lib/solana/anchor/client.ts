import BN from "bn.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import passportIdl from "../idl/aethelred_passport.json";
import registryIdl from "../idl/aethelred_registry.json";
import namesIdl from "../idl/aethelred_names.json";
import { getSolanaConnection } from "./connection";

type AnchorModule = typeof import("@coral-xyz/anchor");
type Idl = import("@coral-xyz/anchor").Idl;

let anchorModule: AnchorModule | null = null;

async function loadAnchor(): Promise<AnchorModule> {
  if (!anchorModule) {
    anchorModule = await import("@coral-xyz/anchor");
  }
  return anchorModule;
}

export async function getAnchorProvider(wallet?: Keypair) {
  const { AnchorProvider } = await loadAnchor();
  const connection = getSolanaConnection();
  const signer = wallet ?? Keypair.generate();
  return new AnchorProvider(
    connection,
    {
      publicKey: signer.publicKey,
      signAllTransactions: async (txs) => {
        txs.forEach((tx) => tx.partialSign(signer));
        return txs;
      },
      signTransaction: async (tx) => {
        tx.partialSign(signer);
        return tx;
      },
    },
    { commitment: "confirmed" },
  );
}

export async function getPassportProgram(wallet?: Keypair) {
  const { Program } = await loadAnchor();
  const provider = await getAnchorProvider(wallet);
  return new Program(passportIdl as Idl, provider);
}

export async function getRegistryProgram(wallet?: Keypair) {
  const { Program } = await loadAnchor();
  const provider = await getAnchorProvider(wallet);
  return new Program(registryIdl as Idl, provider);
}

export async function getNamesProgram(wallet?: Keypair) {
  const { Program } = await loadAnchor();
  const provider = await getAnchorProvider(wallet);
  return new Program(namesIdl as Idl, provider);
}

export function requireProgramId(value: string, label: string): PublicKey {
  if (!value?.trim()) {
    throw new Error(`${label} is not configured — run npm run setup:chain`);
  }
  return new PublicKey(value);
}

// Re-export for callers that only need a connection (no Anchor import at module load).
export { getSolanaConnection } from "./connection";

// Preserve BN export for any legacy imports from this module.
export { BN };
