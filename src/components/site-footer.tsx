export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="inline-block h-4 w-4 rounded-sm bg-gradient-to-br from-accent to-accent/40" />
          <p className="eyebrow !tracking-[0.3em]">© Aethelred by Building Culture</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a href="/about" className="eyebrow hover:!text-foreground">
            About
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
