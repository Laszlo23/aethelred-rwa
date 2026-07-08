import { PublicKey } from "@solana/web3.js";
import { SOLANA_CONFIG } from "../config";

function seedBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function passportProgramId(): PublicKey {
  const id = SOLANA_CONFIG.passportProgramId;
  if (!id) throw new Error("PASSPORT_PROGRAM_ID not configured");
  return new PublicKey(id);
}

function registryProgramId(): PublicKey {
  const id = SOLANA_CONFIG.registryProgramId;
  if (!id) throw new Error("REGISTRY_PROGRAM_ID not configured");
  return new PublicKey(id);
}

function namesProgramId(): PublicKey {
  const id = SOLANA_CONFIG.namesProgramId;
  if (!id) throw new Error("NAMES_PROGRAM_ID not configured");
  return new PublicKey(id);
}

function vaultProgramId(): PublicKey {
  const id = SOLANA_CONFIG.vaultProgramId;
  if (!id) throw new Error("VAULT_PROGRAM_ID not configured");
  return new PublicKey(id);
}

export function passportPda(assetId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [seedBytes("passport"), seedBytes(assetId)],
    passportProgramId(),
  );
  return pda;
}

export function passportConfigPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([seedBytes("config")], passportProgramId());
  return pda;
}

export function registryPda(slug: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [seedBytes("registry"), seedBytes(slug)],
    registryProgramId(),
  );
  return pda;
}

export function registryConfigPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([seedBytes("config")], registryProgramId());
  return pda;
}

export function namePda(handle: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [seedBytes("name"), seedBytes(handle)],
    namesProgramId(),
  );
  return pda;
}

export function vaultPda(owner: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [seedBytes("vault"), owner.toBuffer()],
    vaultProgramId(),
  );
  return pda;
}
