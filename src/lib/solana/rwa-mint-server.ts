import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SOLANA_CONFIG } from "./config";
import { loadDeployerKeypair } from "./deployer";

export interface DeployRwaMintResult {
  mintAddress: string;
  txSignature: string;
  decimals: number;
  totalSupply: bigint;
}

/** Server-only: deploy SPL share-token mint for a Building Culture property. */
export async function deployRwaShareMint(params: {
  symbol: string;
  assetSlug: string;
  decimals?: number;
  totalSupply?: bigint;
}): Promise<DeployRwaMintResult> {
  const deployer = loadDeployerKeypair();
  const rpcUrl =
    typeof process !== "undefined" && process.env.SOLANA_RPC_URL
      ? process.env.SOLANA_RPC_URL
      : SOLANA_CONFIG.rpcUrl;
  const connection = new Connection(rpcUrl, "confirmed");
  const decimals = params.decimals ?? 6;
  const totalSupply = params.totalSupply ?? 1_000_000n;
  const mintKeypair = Keypair.generate();

  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const ata = getAssociatedTokenAddressSync(mintKeypair.publicKey, deployer.publicKey);

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: deployer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  const initMintIx = createInitializeMint2Instruction(
    mintKeypair.publicKey,
    decimals,
    deployer.publicKey,
    deployer.publicKey,
    TOKEN_PROGRAM_ID,
  );

  const createAtaIx = createAssociatedTokenAccountInstruction(
    deployer.publicKey,
    ata,
    deployer.publicKey,
    mintKeypair.publicKey,
  );

  const mintAmount = totalSupply * 10n ** BigInt(decimals);
  const mintToIx = createMintToInstruction(
    mintKeypair.publicKey,
    ata,
    deployer.publicKey,
    mintAmount,
  );

  const fullTx = new Transaction().add(createAccountIx, initMintIx, createAtaIx, mintToIx);

  const signature = await sendAndConfirmTransaction(connection, fullTx, [deployer, mintKeypair], {
    commitment: "confirmed",
  });

  void params.symbol;
  void params.assetSlug;

  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    txSignature: signature,
    decimals,
    totalSupply,
  };
}
