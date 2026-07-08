type ModuleStatus = "demo" | "stub" | "in_progress";

const LABELS: Record<ModuleStatus, string> = {
  demo: "Demo",
  stub: "Stub integration",
  in_progress: "CPI in progress",
};

const STYLES: Record<ModuleStatus, string> = {
  demo: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  stub: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  in_progress: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

export function ModuleStatusBadge({
  status,
  className = "",
}: {
  status: ModuleStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STYLES[status]} ${className}`}
    >
      {LABELS[status]}
    </span>
  );
}
