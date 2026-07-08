import { useGuardianStatus } from "@/hooks/use-api";

export function GuardianStatusPanel() {
  const { data } = useGuardianStatus();

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Guardian Status</p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-guardian rounded-full bg-verified opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-verified" />
          </span>
          <span className="font-mono text-xs font-semibold text-verified">
            {data?.online ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-6">
        <div>
          <dt className="eyebrow !text-[9px]">Assets monitored</dt>
          <dd className="tabular mt-1 font-mono text-xl">{data?.assetsMonitored?.toLocaleString() ?? "—"}</dd>
        </div>
        <div>
          <dt className="eyebrow !text-[9px]">Healthy</dt>
          <dd className="tabular mt-1 font-mono text-xl text-verified">
            {data?.healthyPercent ?? "—"}%
          </dd>
        </div>
        <div>
          <dt className="eyebrow !text-[9px]">Risk checks today</dt>
          <dd className="tabular mt-1 font-mono text-xl">{data?.riskChecksToday ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
