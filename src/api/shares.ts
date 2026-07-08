import { prisma, ensureSeeded } from "@/lib/db";
import { mapShare } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";

export const getAssetShares = createServerFn({ method: "GET" })
  .validator((data: { assetId: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
    });
    if (!asset) return [];
    const shares = await prisma.assetShare.findMany({
      where: { assetId: asset.id },
      orderBy: { shareBps: "desc" },
    });
    return shares.map((s) => mapShare(s, asset));
  });

export const getWalletHoldings = createServerFn({ method: "GET" })
  .validator((data: { walletAddress: string; assetId?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const where: { holderWallet: string; assetId?: string } = {
      holderWallet: data.walletAddress,
    };
    if (data.assetId) {
      const asset = await prisma.asset.findFirst({
        where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
      });
      if (asset) where.assetId = asset.id;
    }
    const shares = await prisma.assetShare.findMany({
      where,
      include: { asset: true },
    });
    return shares.map((s) => mapShare(s, s.asset));
  });

export const purchaseShares = createServerFn({ method: "POST" })
  .validator(
    (data: {
      walletAddress: string;
      assetId: string;
      amountCents: number;
      txSignature?: string;
      signature?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { requireAuthenticatedWallet } = await import("@/lib/auth/require-auth");
    await requireAuthenticatedWallet({
      walletAddress: data.walletAddress,
      signature: data.signature ?? "",
      message: data.message ?? "",
    });

    const compliance = await prisma.walletCompliance.findUnique({
      where: { walletAddress: data.walletAddress },
    });
    if (!compliance || compliance.kycTier === "unverified") {
      throw new Error("KYC verification required before purchasing restricted shares");
    }

    if (!data.walletAddress?.trim()) {
      throw new Error("Wallet address required");
    }
    if (data.amountCents < 100_00) {
      throw new Error("Minimum purchase is €100");
    }

    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: data.assetId }, { slug: data.assetId }] },
      include: { shares: true, property: true, passport: true },
    });
    if (!asset) throw new Error("Asset not found");

    const mintAddress = asset.passport?.solanaMint;
    if (!mintAddress || mintAddress.length < 32) {
      throw new Error("Asset share mint not deployed — run npm run deploy:bc-solana");
    }

    if (!data.txSignature?.trim()) {
      throw new Error("USDC payment transaction signature required");
    }

    const existingPayment = await prisma.fundLedgerEntry.findFirst({
      where: { txSignature: data.txSignature },
    });
    if (existingPayment) {
      throw new Error("This payment transaction was already used for a purchase");
    }

    const { verifyUsdcPayment, settleShareTransfer } = await import(
      "@/lib/solana/primary-sale-server"
    );
    const paid = await verifyUsdcPayment({
      signature: data.txSignature,
      buyerWallet: data.walletAddress,
      expectedAmountCents: data.amountCents,
    });
    console.info("[purchaseShares]", {
      assetId: asset.id,
      slug: asset.slug,
      txSignature: data.txSignature,
      verifyUsdcPayment: paid,
      amountCents: data.amountCents,
      wallet: data.walletAddress,
    });
    if (!paid) {
      throw new Error("USDC payment not confirmed on-chain");
    }

    const shareBps = Math.round((data.amountCents / asset.valueCents) * 10000);
    if (shareBps < 50) {
      throw new Error("Purchase amount too small for a token allocation");
    }

    const totalSoldBps = asset.shares.reduce((s, sh) => s + sh.shareBps, 0);
    if (totalSoldBps + shareBps > 10000) {
      throw new Error("Not enough tokens available for this purchase");
    }

    const existing = await prisma.assetShare.findFirst({
      where: { assetId: asset.id, holderWallet: data.walletAddress },
    });
    void existing;

    if (asset.property) {
      await prisma.assetProperty.update({
        where: { id: asset.property.id },
        data: { tokensSoldBps: totalSoldBps + shareBps },
      });
    }

    const transferSig = await settleShareTransfer({
      mintAddress,
      buyerWallet: data.walletAddress,
      shareBps,
    });
    console.info("[purchaseShares] settleShareTransfer", { transferSig, shareBps });

    const { syncWalletSplBalances, reconcileShareHoldingsFromChain } = await import(
      "@/workers/chain-indexer"
    );
    await syncWalletSplBalances(data.walletAddress);
    await reconcileShareHoldingsFromChain(data.walletAddress);

    await prisma.fundLedgerEntry.create({
      data: {
        assetId: asset.id,
        direction: "inbound",
        amountCents: data.amountCents,
        currency: "USDC",
        txSignature: data.txSignature,
        proofHash: `primary-sale:${asset.slug}:${shareBps}`,
        note: `USDC primary sale — ${shareBps} bps (transfer ${transferSig})`,
      },
    });

    const updatedShare = await prisma.assetShare.findFirst({
      where: { assetId: asset.id, holderWallet: data.walletAddress },
      include: { asset: true },
    });
    if (!updatedShare) throw new Error("Share settlement failed");

    return { ...mapShare(updatedShare, updatedShare.asset), transferSig };
  });
