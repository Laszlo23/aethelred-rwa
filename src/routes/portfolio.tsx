import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Plus } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePortfolio } from "@/hooks/use-api";
import { ActionLink } from "@/components/action-link";
import { DefiDashboard } from "@/components/portfolio/defi-dashboard";
import { KycStatusBanner } from "@/components/kyc-status-banner";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/portfolio")({
  ssr: false,
  head: () =>
    pageSeo({
      title: "Portfolio",
      description:
        "Track your RWA holdings, DeFi positions, yield, and compliance status in one vault dashboard.",
      path: "/portfolio",
      noIndex: true,
    }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const wallet = publicKey?.toBase58();
  const { data, isLoading } = usePortfolio(wallet);

  if (!wallet) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <p className="eyebrow">Portfolio</p>
        <h1 className="mt-4 text-3xl font-semibold">Connect your wallet</h1>
        <p className="mt-3 text-muted-foreground">
          Track PnL, staking yield, lending positions, and holder perks across your RWA portfolio.
        </p>
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="mt-8 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110"
        >
          Connect Vault
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:py-28">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">DeFi portfolio</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Your RWA <span className="text-editorial text-accent">command center.</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Real-time view of token holdings, yield, collateralized lending, and unrealized PnL —
            all backed by Guardian-verified assets.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionLink to="/explore" icon={Compass} variant="secondary">
            Explore
          </ActionLink>
          <ActionLink to="/create" icon={Plus}>
            Tokenize asset
          </ActionLink>
        </div>
      </header>

      <KycStatusBanner walletAddress={wallet} />

      {isLoading && <p className="text-muted-foreground">Loading portfolio…</p>}

      {data && <DefiDashboard data={data} walletAddress={wallet} />}

      {!isLoading && data && data.positions.length === 0 && data.holdings.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          Start by buying RWA tokens.{" "}
          <Link to="/explore" className="text-accent hover:underline">
            Explore the collection →
          </Link>
        </p>
      )}
    </div>
  );
}
