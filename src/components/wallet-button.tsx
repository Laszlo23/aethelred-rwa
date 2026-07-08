import { useEffect, useState, type ComponentType } from "react";
import { useSolanaReady } from "@/providers/solana-provider-wrapper";

export function WalletButton() {
  const solanaReady = useSolanaReady();
  const [Inner, setInner] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!solanaReady) return;
    void import("@/components/wallet-button-inner").then((m) =>
      setInner(() => m.WalletButtonInner),
    );
  }, [solanaReady]);

  if (!Inner) {
    return (
      <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground opacity-80">
        Connect Vault
      </button>
    );
  }

  return <Inner />;
}
