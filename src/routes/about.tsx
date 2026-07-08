import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ExternalLink,
  Github,
  Globe,
  Shield,
  Users,
} from "lucide-react";
import { getPublicMetrics } from "@/api/metrics";
import { formatEuroCompact } from "@/lib/format";
import { pageSeo, SITE } from "@/lib/seo";
import { BC_REFERENCE_YIELD_BAND } from "@/lib/data/seed-building-culture";

export const Route = createFileRoute("/about")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ["public-metrics"],
      queryFn: () => getPublicMetrics(),
    });
  },
  head: () =>
    pageSeo({
      title: "About",
      description:
        "Building Culture and Aethelred — open-source Solana RWA infrastructure for verified European real estate.",
      path: "/about",
    }),
  component: AboutPage,
});

const ROADMAP = [
  {
    quarter: "Q3 2026",
    title: "Audit & on-chain completion",
    items: ["Third-party security audit", "EURO/BCT CPI wiring", "On-chain names registration"],
  },
  {
    quarter: "Q4 2026",
    title: "Mainnet pilot",
    items: ["Postgres production DB", "Squads multisig upgrades", "Regulated KYC partner integration"],
  },
  {
    quarter: "Q1 2027",
    title: "Institutional readiness",
    items: ["Vault SPL custody", "Token-2022 compliance hooks", "Real DeFi integrations or demo removal"],
  },
] as const;

const PROGRAMS = [
  { name: "passport", id: "9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A" },
  { name: "registry", id: "AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU" },
  { name: "names", id: "APU7238FpwdCWTrx5jSKpQYnkrrHiT1HgQgtPPRY3aDd" },
  { name: "vault", id: "4tzFUjGPaiENbHR3vZE9bLEdjrMSbewZqizkwP5m5t9X" },
  { name: "euro", id: "H3DagyBbC86U62PVkPV6pgtJcuuhhK7FpWwoLWsYHboL" },
  { name: "rewards", id: "4j6QfsG5mbZ6RaYZpdnzpk5zYfiJJWex2YA6TjsBhnhE" },
] as const;

function AboutPage() {
  const { data: metrics } = useQuery({
    queryKey: ["public-metrics"],
    queryFn: () => getPublicMetrics(),
  });

  const stats = [
    { label: "Verified assets", value: metrics?.assetCount ?? "—" },
    { label: "Portfolio NAV", value: metrics ? formatEuroCompact(metrics.totalNavCents) : "—" },
    { label: "Anchor programs", value: metrics?.onChainPrograms ?? 6 },
    { label: "Community tasks", value: metrics?.taskCount ?? "—" },
    { label: "KYC verified", value: metrics?.kycApproved ?? "—" },
    { label: "Shareholders", value: metrics?.uniqueShareholders ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-24 px-6 py-16 lg:space-y-32 lg:py-24">
      <header className="max-w-3xl">
        <p className="eyebrow">Building Culture × Aethelred</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Heritage assets. <span className="text-editorial text-accent">On-chain truth.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {SITE.name} is the Solana settlement layer for Building Culture — a European real estate
          collective tokenizing verified properties with Asset Passports, KYC-gated primary sales,
          and transparent debt reporting.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={metrics?.repositoryUrl ?? "https://github.com/Laszlo23/aethelred-rwa"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-accent/40"
          >
            <Github className="h-4 w-4" />
            Open source (MIT)
          </a>
          <a
            href={metrics?.ecosystemUrl ?? "https://buildingcultureid.space"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-accent/40"
          >
            <Globe className="h-4 w-4" />
            Building Culture
          </a>
        </div>
      </header>

      <section>
        <p className="eyebrow mb-6">Live metrics</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Reference yield band {BC_REFERENCE_YIELD_BAND} · Chain: {metrics?.chain ?? "Solana devnet"} ·{" "}
          {metrics?.ledgerEntries ?? 0} ledger entries
        </p>
      </section>

      <section className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="eyebrow">Mission</p>
          <h2 className="text-2xl font-semibold">Make RWAs legible</h2>
          <p className="text-muted-foreground">
            Bank titles hide debt. REITs hide individual assets. Aethelred gives each property an
            on-chain passport — ownership, NAV, Guardian audits, and primary-market access with
            compliance gates.
          </p>
        </div>
        <div className="space-y-4">
          <p className="eyebrow">Team</p>
          <h2 className="text-2xl font-semibold">Building Culture</h2>
          <p className="text-muted-foreground">
            A European heritage real estate collective curating city, land, and water assets across
            Austria and beyond. Aethelred is the open-source protocol layer — MIT licensed, audited
            in progress, built for Solana ecosystem grants and institutional pilots.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-8 lg:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">On-chain infrastructure</p>
            <h2 className="mt-2 text-2xl font-semibold">Six Anchor programs on devnet</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Passport, registry, names, vault, euro, and rewards — with committed IDLs and a
              published security audit v1.
            </p>
          </div>
          <Link
            to="/technology"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            Protocol details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PROGRAMS.map((p) => (
            <div
              key={p.name}
              className="rounded-lg border border-border bg-background/50 px-4 py-3 font-mono text-xs"
            >
              <span className="text-accent">aethelred_{p.name}</span>
              <p className="mt-1 truncate text-muted-foreground">{p.id}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="eyebrow mb-8">Roadmap</p>
        <div className="grid gap-6 md:grid-cols-3">
          {ROADMAP.map((phase) => (
            <article key={phase.quarter} className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {phase.quarter}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{phase.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {phase.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Shield className="h-5 w-5 text-accent" />
          <h3 className="mt-4 font-semibold">Security</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Self-audit published. KYC-gated purchases. Tx dedup. Third-party audit planned Q3 2026.
          </p>
          <a
            href="https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/security-audit-v1.md"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Read audit v1 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Users className="h-5 w-5 text-accent" />
          <h3 className="mt-4 font-semibold">Community</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {metrics?.taskCount ?? 17} contribution tasks with BCT rewards. Grow the issuer network.
          </p>
          <Link
            to="/tasks"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Task board <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Building2 className="h-5 w-5 text-accent" />
          <h3 className="mt-4 font-semibold">For grant reviewers</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Open-source MIT repo, passing CI, live demo, and grant application package on GitHub.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/SOLANA-GRANT-FORM.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Grant form answers <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://github.com/Laszlo23/aethelred-rwa/blob/main/GRANT.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-accent hover:underline"
            >
              Full grant package <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center lg:p-12">
        <p className="eyebrow">Explore the registry</p>
        <h2 className="mt-3 text-2xl font-semibold">See verified assets in action</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Connect a devnet wallet, complete KYC, and walk through a primary-market purchase on a
          live Building Culture property.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/explore"
            className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Explore assets
          </Link>
          <Link
            to="/guardian"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium"
          >
            Meet the Guardian
          </Link>
        </div>
      </section>
    </div>
  );
}
