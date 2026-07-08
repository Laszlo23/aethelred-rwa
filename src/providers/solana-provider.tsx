import { useMemo, useEffect, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { SOLANA_CONFIG } from "@/lib/solana/config";
import { useUpsertUser } from "@/hooks/use-api";
import "@solana/wallet-adapter-react-ui/styles.css";

function WalletSync({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const upsertUser = useUpsertUser();

  useEffect(() => {
    if (connected && publicKey) {
      upsertUser.mutate({ data: { walletAddress: publicKey.toBase58() } });
    }
  }, [connected, publicKey]);

  return <>{children}</>;
}

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = SOLANA_CONFIG.rpcUrl;
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletSync>{children}</WalletSync>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
