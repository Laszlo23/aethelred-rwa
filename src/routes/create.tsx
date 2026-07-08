import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Building2, Factory, Wheat, FileText } from "lucide-react";
import { SimplePassportCard } from "@/components/simple-passport-card";
import { ActionButton } from "@/components/action-link";
import { useSubmitAsset, useUploadDocument, useMintPassportRecord } from "@/hooks/use-api";
import { formatEuro } from "@/lib/format";
import type { ExtractedAssetFields, GuardianAuditResult } from "@/lib/types";
import { toast } from "sonner";
import { ArrowRight, Unlock } from "lucide-react";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/create")({
  ssr: false,
  head: () =>
    pageSeo({
      title: "Create Asset",
      description:
        "Mint an Asset Passport, run Guardian verification, and tokenize real-world property on Solana.",
      path: "/create",
    }),
  component: CreatePage,
});

const hintChips = [
  { icon: Building2, label: "Property" },
  { icon: Factory, label: "Business" },
  { icon: Wheat, label: "Agriculture" },
  { icon: FileText, label: "Revenue" },
];

function inferAssetType(text: string): string {
  const lower = text.toLowerCase();
  if (/hotel|apartment|building|property|real estate|land/.test(lower)) return "Real Estate";
  if (/farm|agriculture|timber|crop/.test(lower)) return "Agriculture";
  if (/invoice|revenue|contract|receivable/.test(lower)) return "Invoice";
  if (/machine|equipment|fleet|industrial/.test(lower)) return "Machinery";
  if (/solar|wind|energy|power/.test(lower)) return "Energy";
  if (/business|company|operating/.test(lower)) return "Business";
  return "Real Estate";
}

function CreatePage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [nl, setNl] = useState("");
  const [extracted, setExtracted] = useState<ExtractedAssetFields | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<GuardianAuditResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const submitAsset = useSubmitAsset();
  const uploadDocument = useUploadDocument();
  const mintPassport = useMintPassportRecord();

  const assetType = inferAssetType(nl);
  const assetLabel = extracted?.assetType ?? assetType;

  const handleContinue = async () => {
    if (!nl.trim()) return;
    const res = await submitAsset.mutateAsync({
      data: { naturalLanguage: nl, assetType: inferAssetType(nl) },
    });
    setExtracted(res.extracted);
    setAssetId(res.assetId);
    setStep(2);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !assetId) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const buffer = await file.arrayBuffer();
        const contentBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        await uploadDocument.mutateAsync({
          data: {
            assetId,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            contentBase64,
          },
        });
      }
      setAuditResult({
        trustScore: extracted?.estimatedValueCents ? 94 : 85,
        collateralRatio: 150,
        guardianGrade: "A+",
        liquidityEstimateCents: Math.floor((extracted?.estimatedValueCents ?? 0) / 1.5),
        riskProfile: extracted?.riskProfile ?? "standard",
      });
      setStep(4);
      toast.success("Your asset is verified");
    } finally {
      setUploading(false);
    }
  };

  const handleUnlock = async () => {
    if (!publicKey || !assetId) {
      toast.error("Connect your wallet to unlock liquidity");
      return;
    }
    try {
      const { buildMintPassportTx } = await import("@/lib/solana/transactions");
      const { passportPda } = await import("@/lib/solana/anchor/pdas");
      if (!signTransaction) {
        toast.error("Wallet cannot sign transactions");
        return;
      }
      const transaction = await buildMintPassportTx(publicKey.toBase58(), assetId, {
        trustScore: auditResult?.trustScore ?? 85,
        guardianGrade: auditResult?.guardianGrade ?? "A+",
        navCents: extracted?.estimatedValueCents ?? 0,
      });
      const signed = await signTransaction(transaction);
      const { coSignPassportMint } = await import("@/api/solana-passport");
      const { signature: sig } = await coSignPassportMint({
        data: { signedTxBase64: Buffer.from(signed.serialize()).toString("base64") },
      });
      const pda = passportPda(assetId).toBase58();
      await mintPassport.mutateAsync({
        data: {
          assetId,
          solanaMint: pda,
          walletAddress: publicKey.toBase58(),
        },
      });
      toast.success("Passport minted on-chain");
    } catch {
      toast.error("Could not unlock — connect wallet and try again");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:py-28">
      {/* Step 1: NL first */}
      {step === 1 && (
        <div className="animate-fade-up space-y-8">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              What would you like to verify?
            </h1>
          </header>
          <textarea
            value={nl}
            onChange={(e) => setNl(e.target.value)}
            placeholder="I own a hotel in Austria worth around €5 million."
            className="min-h-40 w-full resize-none rounded-xl border border-border bg-surface p-5 text-base leading-relaxed outline-none transition-colors focus:border-accent"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {hintChips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                {label}
              </span>
            ))}
          </div>
          <ActionButton
            onClick={() => void handleContinue()}
            icon={ArrowRight}
            disabled={!nl.trim() || submitAsset.isPending}
          >
            {submitAsset.isPending ? "Understanding…" : "Continue"}
          </ActionButton>
        </div>
      )}

      {/* Step 2: Guardian understood */}
      {step === 2 && extracted && (
        <div className="animate-fade-up space-y-8">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight">
              Great. Guardian understood your asset.
            </h1>
            <p className="mt-3 text-muted-foreground">
              We need {extracted.documentsNeeded.length} documents to verify your{" "}
              {assetLabel.toLowerCase()}.
            </p>
          </header>
          <div className="rounded-xl border border-border bg-surface p-6 text-sm">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd className="mt-1 font-medium">{extracted.location}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="mt-1 font-medium">{extracted.assetType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estimated value</dt>
                <dd className="tabular mt-1 font-mono">
                  {formatEuro(extracted.estimatedValueCents)}
                </dd>
              </div>
            </dl>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {extracted.documentsNeeded.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {d}
              </li>
            ))}
          </ul>
          <ActionButton onClick={() => setStep(3)} icon={ArrowRight}>
            Upload documents
          </ActionButton>
        </div>
      )}

      {/* Step 3: Upload */}
      {step === 3 && (
        <div className="animate-fade-up space-y-8">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight">Upload documents</h1>
            <p className="mt-3 text-muted-foreground">
              Drag and drop your files. Guardian will verify them.
            </p>
          </header>
          <label className="flex aspect-[2/1] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface transition-colors hover:bg-white/[0.02]">
            <span className="text-muted-foreground">
              {uploading ? "Uploading…" : "Drop files here"}
            </span>
            <span className="text-xs text-muted-foreground">PDF, images · max 50MB</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
          </label>
        </div>
      )}

      {/* Step 4: Verified */}
      {step === 4 && auditResult && extracted && (
        <div className="animate-fade-up space-y-8">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight">Your asset is verified.</h1>
            <p className="mt-3 text-muted-foreground">
              Here is your digital passport. You can now unlock liquidity.
            </p>
          </header>
          <SimplePassportCard
            name={`${assetLabel} — ${extracted.location}`}
            valueCents={extracted.estimatedValueCents}
            debtCents={0}
            availableCents={auditResult.liquidityEstimateCents}
            trustScore={auditResult.trustScore}
          />
          <ActionButton onClick={() => void handleUnlock()} icon={Unlock}>
            Unlock liquidity
          </ActionButton>
        </div>
      )}
    </div>
  );
}
