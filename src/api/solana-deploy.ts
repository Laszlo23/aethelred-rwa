import { prisma, ensureSeeded } from "@/lib/db";
import { BUILDING_CULTURE_ASSETS } from "@/lib/data/seed-building-culture";
import { deployRwaShareMint } from "@/lib/solana/rwa-mint-server";
import { createServerFn } from "@tanstack/react-start";

export const deployBuildingCultureMint = createServerFn({ method: "POST" })
  .validator((data: { assetSlug: string; adminSecret?: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env.DEPLOY_ADMIN_SECRET?.trim();
    if (expected && data.adminSecret !== expected) {
      throw new Error("Unauthorized");
    }

    await ensureSeeded();
    const bc = BUILDING_CULTURE_ASSETS.find((a) => a.slug === data.assetSlug);
    if (!bc) throw new Error(`Unknown Building Culture asset: ${data.assetSlug}`);

    const asset = await prisma.asset.findUnique({
      where: { slug: bc.slug },
      include: { passport: true },
    });
    if (!asset) throw new Error(`Asset not seeded: ${bc.slug}`);
    if (asset.passport?.solanaMint && !asset.passport.solanaMint.startsWith("Passport")) {
      return {
        alreadyDeployed: true,
        mintAddress: asset.passport.solanaMint,
        symbol: bc.symbol,
      };
    }

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

    return {
      alreadyDeployed: false,
      mintAddress: deployed.mintAddress,
      txSignature: deployed.txSignature,
      symbol: bc.symbol,
      explorerUrl: `https://explorer.solana.com/address/${deployed.mintAddress}?cluster=devnet`,
    };
  });

export const deployAllBuildingCultureMints = createServerFn({ method: "POST" })
  .validator((data: { adminSecret?: string }) => data)
  .handler(async ({ data }) => {
    const results = [];
    for (const bc of BUILDING_CULTURE_ASSETS) {
      try {
        const result = await deployBuildingCultureMint({
          data: { assetSlug: bc.slug, adminSecret: data.adminSecret },
        });
        results.push({ slug: bc.slug, symbol: bc.symbol, ...result });
      } catch (err) {
        results.push({
          slug: bc.slug,
          symbol: bc.symbol,
          error: err instanceof Error ? err.message : "Deploy failed",
        });
      }
    }
    return results;
  });

export const listBuildingCultureDeployStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    await ensureSeeded();
    const assets = await prisma.asset.findMany({
      where: { slug: { in: BUILDING_CULTURE_ASSETS.map((a) => a.slug) } },
      include: { passport: true, property: true },
    });

    return BUILDING_CULTURE_ASSETS.map((bc) => {
      const asset = assets.find((a) => a.slug === bc.slug);
      const mint = asset?.passport?.solanaMint;
      const deployed = !!mint && !mint.startsWith("Passport") && mint.length > 32;
      return {
        slug: bc.slug,
        symbol: bc.symbol,
        name: bc.name,
        cultureSegment: bc.cultureSegment,
        evmShareToken: bc.evmShareToken,
        solanaMint: deployed ? mint : null,
        deployed,
        acquisitionEur: bc.acquisitionEur,
      };
    });
  },
);
