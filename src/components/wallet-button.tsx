import { useEffect, useState, type ComponentType } from "react";

export function WalletButton() {
  const [Inner, setInner] = useState<ComponentType | null>(null);

  useEffect(() => {
    void import("@/components/wallet-button-inner").then((m) => setInner(() => m.WalletButtonInner));
  }, []);

  if (!Inner) {
    return (
      <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground opacity-80">
        Connect Vault
      </button>
    );
  }

  return <Inner />;
}
