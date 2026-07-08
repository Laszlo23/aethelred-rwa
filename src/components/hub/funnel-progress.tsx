interface FunnelProgressProps {
  currentStep: number;
  totalSteps?: number;
  label?: string;
}

export function FunnelProgress({
  currentStep,
  totalSteps = 5,
  label,
}: FunnelProgressProps) {
  const pct = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="mb-8 rounded-xl border border-border bg-surface/60 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-muted-foreground">
          {label ?? `Step ${currentStep} of ${totalSteps}`}
        </span>
        <span className="tabular font-mono text-accent">{pct}%</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
