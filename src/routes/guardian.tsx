import { createFileRoute } from "@tanstack/react-router";
import { useGuardianAudits } from "@/hooks/use-api";
import { format } from "date-fns";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/guardian")({
  head: () =>
    pageSeo({
      title: "Guardian",
      description:
        "Meet the RWA Guardian: continuous ownership, debt, and compliance verification for tokenized assets.",
      path: "/guardian",
    }),
  component: GuardianPage,
});

const checks = [
  {
    title: "Is it still owned?",
    description: "Guardian cross-checks ownership records and title documents.",
  },
  {
    title: "Is the value correct?",
    description: "Market data and comparables keep valuations up to date.",
  },
  {
    title: "Is the debt changing?",
    description: "Outstanding debt and repayments are tracked continuously.",
  },
];

function GuardianPage() {
  const { data: audits = [] } = useGuardianAudits(30);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:py-28">
      <header className="mb-16 max-w-2xl">
        <p className="eyebrow">Guardian</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Guardian watches{" "}
          <span className="text-editorial text-accent">your assets.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guardian checks every asset every day to make sure the information
          stays true.
        </p>
      </header>

      <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {checks.map((c) => (
          <article key={c.title} className="rounded-2xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-5">
          <p className="eyebrow !text-foreground">Recent activity</p>
        </div>
        <ul className="divide-y divide-border font-mono text-xs">
          {audits.map((row) => (
            <li
              key={row.id}
              className="grid grid-cols-[80px_1fr_1fr_100px] items-center gap-3 px-5 py-3"
            >
              <span className="tabular text-muted-foreground">
                {format(new Date(row.createdAt), "HH:mm:ss")}
              </span>
              <span>{row.event}</span>
              <span className="truncate text-muted-foreground">{row.target}</span>
              <span className="justify-self-end rounded-sm bg-gold-soft px-2 py-0.5 text-[10px] text-accent">
                {row.result}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
