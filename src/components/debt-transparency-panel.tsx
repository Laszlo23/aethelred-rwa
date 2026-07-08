import type { DebtSnapshotDTO } from "@/lib/types";
import { formatEuro } from "@/lib/format";
import { DebtTimeline } from "@/components/debt-timeline";

interface DebtTransparencyPanelProps {
  name?: string;
  originalValueCents?: number;
  originalDebtCents?: number;
  debtRepaidCents?: number;
  remainingDebtCents?: number;
  health?: number;
  snapshots?: DebtSnapshotDTO[];
}

export function DebtTransparencyPanel({
  name = "Vienna Commercial Building",
  originalValueCents = 1_000_000_000,
  originalDebtCents = 400_000_000,
  debtRepaidCents = 150_000_000,
  remainingDebtCents = 250_000_000,
  health = 80,
  snapshots,
}: DebtTransparencyPanelProps) {
  const rows = [
    ["Original Value", formatEuro(originalValueCents)],
    ["Original Debt", formatEuro(originalDebtCents)],
    ["Debt Repaid", formatEuro(debtRepaidCents)],
    ["Remaining Debt", formatEuro(remainingDebtCents)],
    ["Collateral Health", `${health}%`],
  ];

  return (
    <section className="space-y-8">
      <div>
        <p className="eyebrow">Debt Transparency</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
          Debt is no longer{" "}
          <span className="text-editorial text-accent">hidden.</span>
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Every asset shows its full debt position — original value, repayments, and
          remaining obligations — updated by the Guardian in real time.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <p className="eyebrow">Position</p>
          <h3 className="mt-2 text-xl font-semibold">{name}</h3>
          <dl className="mt-6 space-y-4">
            {rows.map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
              >
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="tabular font-mono text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DebtTimeline snapshots={snapshots} />
      </div>
    </section>
  );
}
