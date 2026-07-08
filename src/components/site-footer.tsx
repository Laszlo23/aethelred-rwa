import { SOCIAL_LINKS } from "@/lib/data/seed";
import { Globe, Send } from "lucide-react";

const FOOTER_SOCIAL = [
  {
    label: "X — @buildingcultu3",
    href: SOCIAL_LINKS.xAccount,
    icon: "x",
  },
  {
    label: "Telegram",
    href: SOCIAL_LINKS.telegram,
    icon: "telegram",
  },
  {
    label: "Farcaster",
    href: SOCIAL_LINKS.farcasterRwaCast,
    icon: "farcaster",
  },
  {
    label: "Building Culture",
    href: "https://buildingcultureid.space",
    icon: "globe",
  },
] as const;

function SocialIcon({ type }: { type: (typeof FOOTER_SOCIAL)[number]["icon"] }) {
  const className = "h-4 w-4";
  switch (type) {
    case "x":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "telegram":
      return <Send className={className} />;
    case "farcaster":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4.5 3.75h15A1.75 1.75 0 0 1 21.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-15A1.75 1.75 0 0 1 3 18.5v-13A1.75 1.75 0 0 1 4.5 3.75zm2.1 4.2 2.55 6.05 2.55-6.05h2.1l-3.6 8.1h-1.5l-3.6-8.1h2.1zm7.8 0h2.1v8.1h-2.1V7.95z" />
        </svg>
      );
    case "globe":
      return <Globe className={className} />;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-10">
        <div className="flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="inline-block h-4 w-4 rounded-sm bg-gradient-to-br from-accent to-accent/40" />
            <p className="eyebrow !tracking-[0.3em]">© Aethelred by Building Culture</p>
          </div>
          <div className="flex items-center gap-2">
            {FOOTER_SOCIAL.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                title={item.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface/60 text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
              >
                <SocialIcon type={item.icon} />
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a href="/about" className="eyebrow hover:!text-foreground">
            About
          </a>
          <a href="/grant" className="eyebrow hover:!text-foreground">
            Grant
          </a>
          <a href="/team" className="eyebrow hover:!text-foreground">
            Team
          </a>
          <a href="/technology" className="eyebrow hover:!text-foreground">
            Technology
          </a>
          <a href="/tasks" className="eyebrow hover:!text-foreground">
            Community
          </a>
          <a href="/explore" className="eyebrow hover:!text-foreground">
            Explore
          </a>
          <a
            href="https://solana.com"
            className="eyebrow hover:!text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            Solana
          </a>
        </div>
      </div>
    </footer>
  );
}
