import type { DebtSnapshotDTO } from "@/lib/types";
import { formatEuro } from "@/lib/format";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DebtTimelineProps {
  snapshots?: DebtSnapshotDTO[];
}

const DEFAULT_SNAPSHOTS: DebtSnapshotDTO[] = [
  { recordedAt: "2024-01-01", remainingDebtCents: 400_000_000, repaidCents: 0, health: 70 },
  {
    recordedAt: "2024-06-01",
    remainingDebtCents: 350_000_000,
    repaidCents: 50_000_000,
    health: 75,
  },
  {
    recordedAt: "2024-12-01",
    remainingDebtCents: 300_000_000,
    repaidCents: 100_000_000,
    health: 78,
  },
  {
    recordedAt: "2025-06-01",
    remainingDebtCents: 275_000_000,
    repaidCents: 125_000_000,
    health: 79,
  },
  {
    recordedAt: "2026-01-01",
    remainingDebtCents: 250_000_000,
    repaidCents: 150_000_000,
    health: 80,
  },
];

export function DebtTimeline({ snapshots = DEFAULT_SNAPSHOTS }: DebtTimelineProps) {
  const data = snapshots.map((s) => ({
    date: new Date(s.recordedAt).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
    debt: s.remainingDebtCents / 100,
    repaid: s.repaidCents / 100,
  }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-8">
      <p className="eyebrow">Debt Reduction Timeline</p>
      <div className="mt-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 78)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.78 0.13 78)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${(v / 1e6).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.17 0.006 260)",
                border: "1px solid oklch(1 0 0 / 0.08)",
                borderRadius: 8,
              }}
              formatter={(value: number) => [formatEuro(value * 100), "Remaining"]}
            />
            <Area
              type="monotone"
              dataKey="debt"
              stroke="oklch(0.78 0.13 78)"
              fill="url(#debtGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{formatEuro(snapshots[0]?.repaidCents ?? 0)} repaid</span>
        <span>
          {formatEuro(snapshots[snapshots.length - 1]?.remainingDebtCents ?? 0)} remaining
        </span>
      </div>
    </div>
  );
}
