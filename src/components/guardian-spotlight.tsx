import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye, Scale, Shield, TrendingUp } from "lucide-react";
import { useGuardianAudits } from "@/hooks/use-api";
import { format } from "date-fns";

const checks = [
  {
    icon: Eye,
    title: "Is it still owned?",
    detail: "Title & registry cross-check",
  },
  {
    icon: TrendingUp,
    title: "Is the value correct?",
    detail: "Live comparables & appraisals",
  },
  {
    icon: Scale,
    title: "Is the debt changing?",
    detail: "Liens, repayments & covenants",
  },
];

export function GuardianSpotlight() {
  const { data: audits = [] } = useGuardianAudits(5);

  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="max-w-lg">
        <p className="eyebrow">Guardian</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Guardian watches{" "}
          <span className="text-editorial text-accent">your assets.</span>
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          An always-on verification layer. Every passport is re-checked daily so
          token holders never fly blind on ownership, value, or debt.
        </p>
        <Link
          to="/guardian"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          Open Guardian dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,oklch(0.75_0.14_155/0.12),transparent_55%)]" />
        <div className="relative border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified opacity-40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-verified" />
              </span>
              <span className="text-sm font-medium">Guardian online</span>
            </div>
            <Shield className="h-5 w-5 text-verified" strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Monitoring verified assets across the network
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
          {checks.map((check) => (
            <div key={check.title} className="bg-surface px-4 py-5">
              <check.icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
              <p className="mt-3 text-sm font-medium leading-snug">{check.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{check.detail}</p>
            </div>
          ))}
        </div>

        <div className="relative border-t border-border px-6 py-4">
          <p className="eyebrow !text-[10px]">Live feed</p>
          <ul className="mt-3 space-y-2 font-mono text-[11px] text-muted-foreground">
            {audits.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-foreground/80">{a.target}</span>
                <span className="shrink-0 text-verified">{a.result}</span>
              </li>
            ))}
            {audits.length === 0 && (
              <li className="text-muted-foreground">Awaiting audit stream…</li>
            )}
          </ul>
          {audits[0] && (
            <p className="mt-3 text-[10px] text-muted-foreground">
              Last check {format(new Date(audits[0].createdAt), "PPp")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
