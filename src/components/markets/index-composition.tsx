import { formatPercent } from "@/lib/format";
import type { PerpTerminalDTO } from "@/lib/types";
import { Shield } from "lucide-react";

interface IndexCompositionProps {
  terminal: PerpTerminalDTO;
}

export function IndexComposition({ terminal }: IndexCompositionProps) {
  const comp = terminal.indexComponents;
  if (!comp) {
    return (
      <div className="rounded-lg border border-border bg-background/50 p-3 text-xs text-muted-foreground">
        Basket index — weighted Building Culture NAV
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background/50 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-medium">
        <Shield className="h-3.5 w-3.5 text-accent" />
        RWA index components
      </div>
      <dl className="mt-2 space-y-1.5">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Asset</dt>
          <dd>{comp.assetName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">NAV</dt>
          <dd className="tabular font-mono">€{(comp.navCents / 100).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Yield</dt>
          <dd className="tabular font-mono">{formatPercent(comp.yieldBps)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Trust</dt>
          <dd className="tabular font-mono text-verified">{comp.trustScore}%</dd>
        </div>
      </dl>
    </div>
  );
}
