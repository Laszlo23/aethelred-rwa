import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

interface PathCardProps {
  emoji: string;
  title: string;
  description: string;
  ctaLabel: string;
  to: string;
  search?: Record<string, string>;
  onNavigate?: () => void;
}

export function PathCard({
  emoji,
  title,
  description,
  ctaLabel,
  to,
  search,
  onNavigate,
}: PathCardProps) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-border-strong lg:p-10">
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <Link
        to={to}
        search={search}
        onClick={onNavigate}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export const HUB_PATH_STORAGE_KEY = "aethelred-hub-path";

export type HubPath = "invest" | "tokenize" | "learn";

export function persistHubPath(path: HubPath) {
  try {
    localStorage.setItem(HUB_PATH_STORAGE_KEY, path);
  } catch {
    // ignore storage errors
  }
}
