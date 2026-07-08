/**
 * Deploy Building Culture RWA share mints on Solana devnet.
 *
 * Prerequisites:
 *   SOLANA_DEPLOYER_SECRET=<base58 secret key with devnet SOL>
 *   SOLANA_RPC_URL=https://api.devnet.solana.com
 *   DATABASE_URL=file:./dev.db
 *
 * Usage:
 *   npm run deploy:bc-solana
 *   npm run deploy:bc-solana -- berggasse-35
 */
import { PrismaClient } from "@prisma/client";
import { Connection, PublicKey } from "@solana/web3.js";
import { BUILDING_CULTURE_ASSETS } from "../src/lib/data/seed-building-culture";
import { deployRwaShareMint } from "../src/lib/solana/rwa-mint-server";

const prisma = new PrismaClient();
const targetSlug = process.argv[2];
const force = process.argv.includes("--force");
const rpc = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const connection = new Connection(rpc, "confirmed");

async function mintExistsOnChain(address: string): Promise<boolean> {
  try {
    const info = await connection.getAccountInfo(new PublicKey(address));
    return Boolean(info && info.owner.toBase58() === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  } catch {
    return false;
  }
}

const assets = targetSlug
  ? BUILDING_CULTURE_ASSETS.filter((a) => a.slug === targetSlug)
  : BUILDING_CULTURE_ASSETS;

if (targetSlug && assets.length === 0) {
  console.error(`Unknown slug: ${targetSlug}`);
  process.exit(1);
}

async function main() {
  console.log(`Deploying ${assets.length} Building Culture RWA mint(s) on Solana...\n`);

  for (const bc of assets) {
    const asset = await prisma.asset.findUnique({
      where: { slug: bc.slug },
      include: { passport: true },
    });

    if (!asset?.passport) {
      console.warn(`SKIP ${bc.symbol} — asset not in DB (start dev server once to seed)`);
      continue;
    }

    const existing = asset.passport.solanaMint;
    if (
      !force &&
      existing &&
      !existing.startsWith("Passport") &&
      existing.length > 32 &&
      (await mintExistsOnChain(existing))
    ) {
      console.log(`OK   ${bc.symbol} already deployed → ${existing}`);
      continue;
    }
    if (existing && !force) {
      console.log(`REDEPLOY ${bc.symbol} — mint missing on chain (${existing})`);
    }

    try {
      const deployed = await deployRwaShareMint({
        symbol: bc.symbol,
        assetSlug: bc.slug,
      });

      await prisma.assetPassport.update({
        where: { assetId: asset.id },
        data: {
          solanaMint: deployed.mintAddress,
          attestationSig: deployed.txSignature,
        },
      });

      console.log(`DONE ${bc.symbol} ${bc.name}`);
      console.log(`     Mint: ${deployed.mintAddress}`);
      console.log(`     Tx:   ${deployed.txSignature}`);
      console.log(
        `     Explorer: https://explorer.solana.com/address/${deployed.mintAddress}?cluster=devnet\n`,
      );
    } catch (err) {
      console.error(`FAIL ${bc.symbol}:`, err instanceof Error ? err.message : err);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
