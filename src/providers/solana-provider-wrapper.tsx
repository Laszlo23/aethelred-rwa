import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

const SolanaReadyContext = createContext(false);

export function useSolanaReady() {
  return useContext(SolanaReadyContext);
}

let providerImport: Promise<typeof import("@/providers/solana-provider")> | null = null;

function loadSolanaProvider() {
  if (typeof window === "undefined") return null;
  providerImport ??= import("@/providers/solana-provider");
  return providerImport;
}

export function SolanaProviderWrapper({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    void loadSolanaProvider()
      ?.then((m) => setProvider(() => m.SolanaProvider))
      .catch((err) => {
        console.error("[SolanaProvider] Failed to load wallet layer:", err);
      });
  }, []);

  if (!Provider) {
    return <SolanaReadyContext.Provider value={false}>{children}</SolanaReadyContext.Provider>;
  }

  return (
    <Provider>
      <SolanaReadyContext.Provider value={true}>{children}</SolanaReadyContext.Provider>
    </Provider>
  );
}
