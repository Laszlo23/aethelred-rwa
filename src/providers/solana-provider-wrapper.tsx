import { useEffect, useState, type ComponentType, type ReactNode } from "react";

export function SolanaProviderWrapper({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    void import("@/providers/solana-provider").then((m) => setProvider(() => m.SolanaProvider));
  }, []);

  if (!Provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Connecting to Solana…</p>
      </div>
    );
  }

  return <Provider>{children}</Provider>;
}
