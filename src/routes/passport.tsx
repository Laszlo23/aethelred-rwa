import { createFileRoute, Link } from "@tanstack/react-router";
import { VerificationPassport } from "@/components/verification-passport";
import { usePassports } from "@/hooks/use-api";
import { formatEuro } from "@/lib/format";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/passport")({
  head: () =>
    pageSeo({
      title: "Asset Passport",
      description:
        "Browse on-chain Asset Passports: verified identity, valuation, and ownership records for RWAs.",
      path: "/passport",
    }),
  component: PassportPage,
});

function PassportPage() {
  const { data: passports = [] } = usePassports();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
      <header className="mb-16 max-w-3xl">
        <p className="eyebrow">Core Product</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Asset Passport™ —{" "}
          <span className="text-editorial text-accent">a living digital identity.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every RWA receives a verified passport: value, debt, liquidity, collateral, and Guardian
          trust score — updated continuously and anchored on Solana.
        </p>
        <Link
          to="/create"
          className="mt-8 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
        >
          Create Asset Passport
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {passports.map(({ passport, asset }) => (
          <Link
            key={passport.id}
            to="/assets/$assetId"
            params={{ assetId: asset.slug }}
            className="block transition-transform hover:scale-[1.01]"
          >
            <VerificationPassport
              variant="compact"
              name={asset.name}
              location={asset.location}
              valuationCents={asset.valueCents}
              debtCents={asset.debtCents}
              availableLiquidityCents={Math.floor(asset.valueCents / 1.5) - asset.debtCents}
              trustScore={passport.trustScore}
              collateralRatio={passport.collateralRatio}
              tokenId={passport.solanaMint ?? "—"}
              category="Verified"
              lastAuditAt={passport.lastAuditAt}
            />
            <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
              {formatEuro(asset.valueCents)} · Grade {passport.guardianGrade}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
