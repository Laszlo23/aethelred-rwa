import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useQuery } from "@tanstack/react-query";
import { truncateAddress } from "@/lib/format";
import { useTasks } from "@/hooks/use-api";
import { useSiwsSignIn } from "@/hooks/use-siws";
import { getNameForWallet } from "@/api/names";
import { Loader2 } from "lucide-react";

export function WalletButtonInner() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: tasks } = useTasks(publicKey?.toBase58());
  const { signIn, isSigningIn, isAuthenticated } = useSiwsSignIn();
  const wallet = publicKey?.toBase58();

  const { data: name } = useQuery({
    queryKey: ["my-name", wallet],
    queryFn: () => getNameForWallet({ data: { walletAddress: wallet! } }),
    enabled: !!wallet,
  });

  const points = tasks
    ? tasks
        .filter((t) => t.completion?.status === "CLAIMED")
        .reduce((s, t) => s + t.rewardPoints, 0)
    : 0;

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        {points > 0 && (
          <span className="hidden rounded-full border border-border bg-white/5 px-2 py-1 font-mono text-[10px] text-accent sm:inline">
            {points} pts
          </span>
        )}
        {!isAuthenticated && (
          <button
            onClick={() => void signIn().catch(() => undefined)}
            disabled={isSigningIn}
            className="hidden items-center gap-1 rounded-md border border-accent/40 px-2 py-1 text-[10px] font-semibold text-accent sm:inline-flex"
          >
            {isSigningIn && <Loader2 className="h-3 w-3 animate-spin" />}
            Sign in
          </button>
        )}
        <button
          onClick={() => disconnect()}
          className="rounded-md border border-border-strong bg-white/5 px-3 py-2 font-mono text-xs hover:bg-white/10"
          title={publicKey.toBase58()}
        >
          {name ? `${name.handle}.aethel` : truncateAddress(publicKey.toBase58())}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 active:scale-[0.98]"
    >
      Connect Vault
    </button>
  );
}
