import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BC_TEAM_SOURCE_URL, BUILDING_CULTURE_TEAM } from "@/lib/data/building-culture-team";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/team")({
  head: () =>
    pageSeo({
      title: "Team",
      description:
        "Meet the Building Culture team behind Aethelred — product, real estate, and financial operations for verified RWAs on Solana.",
      path: "/team",
    }),
  component: TeamPage,
});

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-20 px-6 py-16 lg:space-y-28 lg:py-24">
      <header className="max-w-3xl">
        <p className="eyebrow">People</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          The team building <span className="text-editorial text-accent">Aethelred.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Operators across product, physical assets, and reporting — focused on shipping what
          communities can actually use. Aethelred is the Solana RWA layer of{" "}
          <a
            href="https://buildingcultureid.space"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline decoration-accent/50 underline-offset-4 hover:text-accent"
          >
            Building Culture
          </a>
          .
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-1">
        {BUILDING_CULTURE_TEAM.map((member) => (
          <article
            key={member.name}
            className="grid gap-8 rounded-2xl border border-border bg-surface p-8 lg:grid-cols-[auto_1fr] lg:p-10"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent/5 ring-1 ring-inset ring-white/10">
              <span className="text-xl font-semibold tracking-tight text-accent">
                {initials(member.name)}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{member.name}</h2>
                <p className="mt-1 text-sm font-medium text-accent">{member.role}</p>
                <p className="mt-3 text-sm text-muted-foreground">{member.tagline}</p>
              </div>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {member.bio}
              </p>
              {member.links && member.links.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {member.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-surface/50 p-8 lg:p-10">
        <p className="eyebrow">About the project</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Building Culture is the trust layer where people, communities, businesses, and AI agents
          build reputation, earn credentials, and unlock access together. Aethelred extends that
          mission to verified real-world assets on Solana.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href={BC_TEAM_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            Full team on Building Culture
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            About Aethelred
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
