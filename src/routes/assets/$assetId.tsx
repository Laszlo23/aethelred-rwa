import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { VerificationPassport } from "@/components/verification-passport";
import { DebtTransparencyPanel } from "@/components/debt-transparency-panel";
import { PropertyHeroGallery } from "@/components/asset/property-hero-gallery";
import { PropertyStory } from "@/components/asset/property-story";
import { PropertySpecs } from "@/components/asset/property-specs";
import { InvestPanel } from "@/components/asset/invest-panel";
import { HolderPerksGrid } from "@/components/asset/holder-perks-grid";
import { LendAgainstShares } from "@/components/asset/lend-against-shares";
import { YieldDistributions } from "@/components/asset/yield-distributions";
import { PassportStory } from "@/components/asset/passport-story";
import { FunnelProgress } from "@/components/hub/funnel-progress";
import {
  useAssetDetail,
  useGuardianAudits,
  useHolderPayouts,
  useWalletHoldings,
} from "@/hooks/use-api";
import { getAssetDetail } from "@/api/assets";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { pageSeo, absoluteUrl } from "@/lib/seo";

type AssetSearch = {
  from?: string;
};

export const Route = createFileRoute("/assets/$assetId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): AssetSearch => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  loader: async ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData({
      queryKey: ["asset-detail", params.assetId, undefined],
      queryFn: () => getAssetDetail({ data: { slugOrId: params.assetId } }),
    });
  },
  head: ({ loaderData, params }) => {
    const asset = loaderData;
    const title = asset?.name ?? params.assetId;
    const description =
      asset?.property?.tagline ??
      asset?.property?.description ??
      `Invest in ${title} — a verified Building Culture real-world asset on Aethelred.`;
    const image = asset?.imageUrl ? absoluteUrl(asset.imageUrl) : undefined;
    return pageSeo({
      title,
      description,
      path: `/assets/${params.assetId}`,
      image,
    });
  },
  component: AssetDetailPage,
});

const tabs = ["Overview", "Invest", "Perks", "Lend", "Yield"] as const;
type Tab = (typeof tabs)[number];

function AssetDetailPage() {
  const { assetId } = Route.useParams();
  const { from } = Route.useSearch();
  const fromHub = from === "hub";
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const investPanelRef = useRef<HTMLDivElement>(null);
  const debtDetailsRef = useRef<HTMLDetailsElement>(null);

  const { data: asset, isLoading } = useAssetDetail(assetId, walletAddress);
  const { data: audits = [] } = useGuardianAudits(10);
  const { data: holdings = [] } = useWalletHoldings(walletAddress, assetId);
  const { data: payouts = [] } = useHolderPayouts(walletAddress, assetId);

  const scrollToInvest = () => {
    setActiveTab("Invest");
    requestAnimationFrame(() => {
      investPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const scrollToDebt = () => {
    const details = debtDetailsRef.current;
    if (details) {
      details.open = true;
      details.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading…</div>;
  }

  if (!asset) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="text-2xl font-semibold">Asset not found</h1>
        <Link to="/explore" className="mt-4 inline-block text-accent">
          ← Back to discovery
        </Link>
      </div>
    );
  }

  const userShareBps = holdings.reduce((s, h) => s + h.shareBps, 0);
  const assetAudits = audits.filter((a) => a.target.includes(asset.name.split(" ")[0] ?? ""));
  const isPropertyListing = !!asset.property;
  const galleryImages = asset.property?.galleryUrls?.length
    ? asset.property.galleryUrls
    : [asset.imageUrl];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
      {fromHub && (
        <FunnelProgress currentStep={4} label="Step 4 — Asset passport" />
      )}

      <Link
        to="/explore"
        search={fromHub ? { from: "hub" } : undefined}
        className="text-sm text-accent hover:underline"
      >
        {fromHub ? "← Back to discovery" : "← Back to collection"}
      </Link>

      {isPropertyListing ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <PropertyHeroGallery images={galleryImages} alt={asset.name} />
              <div>
                <p className="eyebrow capitalize">
                  {asset.property!.cultureSegment ?? asset.property!.propertyClass}
                </p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight lg:text-5xl">
                  {asset.name}
                </h1>
                <p className="mt-2 text-muted-foreground">{asset.location}</p>
              </div>
            </div>
            <div ref={investPanelRef} id="invest-panel" className="scroll-mt-24">
              <InvestPanel asset={asset} />
            </div>
          </div>

          <div className="mt-16">
            <p className="eyebrow">Asset passport</p>
            <PassportStory
              asset={asset}
              onBecomeHolder={scrollToInvest}
              onViewPerks={() => {
                setActiveTab("Perks");
                requestAnimationFrame(() => {
                  document.getElementById("asset-tabs")?.scrollIntoView({ behavior: "smooth" });
                });
              }}
              onViewLend={() => {
                setActiveTab("Lend");
                requestAnimationFrame(() => {
                  document.getElementById("asset-tabs")?.scrollIntoView({ behavior: "smooth" });
                });
              }}
              onViewDebt={scrollToDebt}
            />
          </div>

          <details id="asset-tabs" className="mt-16 scroll-mt-24" open={!fromHub}>
            <summary className="cursor-pointer rounded-xl border border-border bg-surface px-6 py-4 text-sm font-semibold">
              Advanced details
            </summary>
            <div className="mt-6 border-b border-border">
              <nav className="-mb-px flex gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors",
                      activeTab === tab
                        ? "border-accent text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-12">
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
                  <PropertyStory property={asset.property!} />
                  <PropertySpecs property={asset.property!} />
                </div>
              )}
              {activeTab === "Invest" && (
                <div className="max-w-lg">
                  <InvestPanel asset={asset} />
                </div>
              )}
              {activeTab === "Perks" && (
                <HolderPerksGrid perks={asset.perks} userShareBps={userShareBps} />
              )}
              {activeTab === "Lend" && (
                <div className="max-w-md">
                  <LendAgainstShares
                    asset={asset}
                    walletAddress={walletAddress}
                    userShareBps={userShareBps}
                  />
                </div>
              )}
              {activeTab === "Yield" && (
                <YieldDistributions distributions={asset.recentDistributions} payouts={payouts} />
              )}
            </div>
          </details>
        </>
      ) : (
        <div className="mt-8 space-y-16">
          <header>
            <h1 className="text-4xl font-semibold tracking-tight">{asset.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {asset.location} · {asset.assetType}
            </p>
          </header>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
            <img
              src={asset.imageUrl}
              alt={asset.name}
              className="aspect-video w-full rounded-2xl object-cover"
            />
            <VerificationPassport
              name={asset.name}
              location={asset.location}
              valuationCents={asset.valueCents}
              debtCents={asset.debtCents}
              availableLiquidityCents={asset.availableLiquidityCents}
              trustScore={asset.passport?.trustScore ?? 0}
              collateralRatio={asset.passport?.collateralRatio ?? 150}
              tokenId={asset.passport?.solanaMint ?? "—"}
              category={asset.assetType}
              lastAuditAt={asset.passport?.lastAuditAt}
            />
          </div>

          <PassportStory
            asset={asset}
            onBecomeHolder={scrollToInvest}
            onViewPerks={() => setActiveTab("Perks")}
            onViewLend={() => setActiveTab("Lend")}
            onViewDebt={scrollToDebt}
          />

          <div ref={investPanelRef} id="invest-panel" className="max-w-lg scroll-mt-24">
            <InvestPanel asset={asset} />
          </div>
        </div>
      )}

      <details
        ref={debtDetailsRef}
        className="mt-8 scroll-mt-24 rounded-xl border border-border bg-surface"
      >
        <summary className="cursor-pointer px-6 py-4 text-sm font-semibold">
          Verification & financials
        </summary>
        <div className="space-y-8 border-t border-border p-6">
          <VerificationPassport
            name={asset.name}
            location={asset.location}
            valuationCents={asset.valueCents}
            debtCents={asset.debtCents}
            availableLiquidityCents={asset.availableLiquidityCents}
            trustScore={asset.passport?.trustScore ?? 0}
            collateralRatio={asset.passport?.collateralRatio ?? 150}
            tokenId={asset.passport?.solanaMint ?? "—"}
            category={asset.assetType}
            lastAuditAt={asset.passport?.lastAuditAt}
          />
          <DebtTransparencyPanel
            name={asset.name}
            originalValueCents={asset.valueCents}
            originalDebtCents={asset.originalDebtCents}
            debtRepaidCents={asset.debtRepaidCents}
            remainingDebtCents={asset.debtCents}
            health={asset.health}
            snapshots={asset.debtSnapshots}
          />
        </div>
      </details>

      {assetAudits.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <p className="eyebrow">Guardian history</p>
          <ul className="mt-4 divide-y divide-border font-mono text-xs">
            {assetAudits.map((a) => (
              <li key={a.id} className="flex justify-between gap-4 py-3">
                <span>{a.event}</span>
                <span className="text-muted-foreground">
                  {format(new Date(a.createdAt), "PPp")}
                </span>
                <span className="text-accent">{a.result}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
