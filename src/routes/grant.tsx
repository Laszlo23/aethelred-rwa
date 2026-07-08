import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  Github,
  PlayCircle,
  Shield,
  Wallet,
} from "lucide-react";
import { pageSeo } from "@/lib/seo";
import {
  CI_BADGE,
  DEVNET_USDC_MINT,
  EXAMPLE_SHARE_MINT,
  GITHUB_REPO,
  getLoomDemoUrl,
  getLoomEmbedUrl,
  ON_CHAIN_PROGRAMS,
  solanaExplorerAddress,
} from "@/lib/data/on-chain-programs";

export const Route = createFileRoute("/grant")({
  head: () =>
    pageSeo({
      title: "Grant Reviewer Hub",
      description:
        "Solana Foundation grant reviewer hub — live demo, on-chain accounts, walkthrough, and open-source package for Aethelred RWA.",
      path: "/grant",
    }),
  component: GrantReviewerPage,
});

const DEMO_STEPS = [
  {
    step: 1,
    title: "Explore verified assets",
    path: "/explore",
    detail: "Open Berggasse 35 — passport, NAV, debt transparency.",
  },
  {
    step: 2,
    title: "Compliance gate",
    path: "/profile",
    detail: "Connect Phantom on devnet → submit KYC. Approve via /admin if demoing live.",
  },
  {
    step: 3,
    title: "Primary market",
    path: "/explore",
    detail: "KYC-verified wallet → USDC purchase → SPL share settlement on devnet.",
  },
  {
    step: 4,
    title: "Transparency",
    path: "/funds",
    detail: "Fund ledger, treasury bands, Guardian attestation pipeline.",
  },
  {
    step: 5,
    title: "Open source",
    href: GITHUB_REPO,
    detail: "MIT repo, 6 Anchor programs, CI, architecture + security audit v1.",
  },
] as const;

const DOC_LINKS = [
  { label: "Grant package", href: `${GITHUB_REPO}/blob/main/GRANT.md` },
  { label: "Architecture", href: `${GITHUB_REPO}/blob/main/docs/ARCHITECTURE.md` },
  { label: "Security audit v1", href: `${GITHUB_REPO}/blob/main/docs/security-audit-v1.md` },
  { label: "5-min demo script", href: `${GITHUB_REPO}/blob/main/docs/DEMO.md` },
  { label: "On-chain accounts", href: `${GITHUB_REPO}/blob/main/docs/ON-CHAIN.md` },
  { label: "SME call prep", href: `${GITHUB_REPO}/blob/main/docs/SME-CALL.md` },
] as const;

function GrantReviewerPage() {
  const loomShare = getLoomDemoUrl();
  const loomEmbed = loomShare ? getLoomEmbedUrl(loomShare) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-6 py-16 lg:space-y-24 lg:py-24">
      <header className="max-w-3xl">
        <p className="eyebrow">Solana Foundation · Building Culture LLC</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Grant reviewer hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Aethelred is MIT-licensed Solana RWA infrastructure — live demo, six Anchor programs on
          devnet, and a forkable primary-market reference stack for European heritage real estate.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-accent/40"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <img src={CI_BADGE} alt="CI passing" className="h-5" />
          <Link
            to="/about"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Live metrics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-8 lg:p-10">
        <div className="flex items-start gap-3">
          <PlayCircle className="mt-0.5 h-5 w-5 text-accent" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">2-minute demo video</h2>
            {loomEmbed ? (
              <div className="mt-6 aspect-video overflow-hidden rounded-xl border border-border bg-background">
                <iframe
                  src={loomEmbed}
                  title="Aethelred RWA grant demo"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Video coming soon. Walk the{" "}
                <a
                  href={`${GITHUB_REPO}/blob/main/docs/LOOM-SCRIPT.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  2-min script
                </a>{" "}
                or use the live walkthrough below. Set{" "}
                <code className="rounded bg-background px-1 py-0.5 text-xs">
                  VITE_LOOM_DEMO_URL
                </code>{" "}
                to embed when recorded.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8">
          <Wallet className="h-5 w-5 text-accent" />
          <h2 className="mt-4 text-xl font-semibold">Reviewer quick-start</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1.</span> Switch Phantom to{" "}
              <strong>Solana devnet</strong> (Settings → Developer Settings).
            </li>
            <li>
              <span className="font-medium text-foreground">2.</span> Open{" "}
              <Link to="/explore" className="text-accent hover:underline">
                Explore
              </Link>{" "}
              — thirteen curated EU properties with on-chain passports.
            </li>
            <li>
              <span className="font-medium text-foreground">3.</span> Connect wallet →{" "}
              <Link to="/profile" className="text-accent hover:underline">
                Profile
              </Link>{" "}
              for KYC, or approve via{" "}
              <Link to="/admin" className="text-accent hover:underline">
                Admin · KYC
              </Link>{" "}
              (admin passphrase in deploy env).
            </li>
            <li>
              <span className="font-medium text-foreground">4.</span> Demo modules (perps, Kamino,
              EURO vault CPI) are labeled — not claimed as production.
            </li>
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <BadgeCheck className="h-5 w-5 text-accent" />
          <h2 className="mt-4 text-xl font-semibold">5-minute walkthrough</h2>
          <ul className="mt-4 space-y-4">
            {DEMO_STEPS.map((s) => (
              <li key={s.step} className="flex gap-3 text-sm">
                <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent">
                  {s.step}
                </span>
                <div>
                  {"href" in s ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      {s.title}
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                  ) : (
                    <Link to={s.path} className="font-medium text-accent hover:underline">
                      {s.title}
                    </Link>
                  )}
                  <p className="mt-0.5 text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-8 lg:p-10">
        <Shield className="h-5 w-5 text-accent" />
        <h2 className="mt-4 text-xl font-semibold">On-chain accounts (devnet)</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Six deployed Anchor programs + reference mints. Full copy-paste pack in{" "}
          <a
            href={`${GITHUB_REPO}/blob/main/docs/ON-CHAIN.md`}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            docs/ON-CHAIN.md
          </a>
          .
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Account</th>
                <th className="pb-2 font-medium">Address</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {ON_CHAIN_PROGRAMS.map((p) => (
                <tr key={p.name} className="border-b border-border/60">
                  <td className="py-2 pr-4 capitalize text-foreground">{p.name}</td>
                  <td className="py-2">
                    <a
                      href={solanaExplorerAddress(p.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      {p.id}
                    </a>
                  </td>
                </tr>
              ))}
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 text-foreground">USDC (devnet)</td>
                <td className="py-2">
                  <a
                    href={solanaExplorerAddress(DEVNET_USDC_MINT)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {DEVNET_USDC_MINT}
                  </a>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-foreground">Share mint (Berggasse)</td>
                <td className="py-2">
                  <a
                    href={solanaExplorerAddress(EXAMPLE_SHARE_MINT)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {EXAMPLE_SHARE_MINT}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Documentation</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {DOC_LINKS.map((d) => (
            <a
              key={d.href}
              href={d.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-accent/40"
            >
              {d.label}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
