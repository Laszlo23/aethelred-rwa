import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNameForWallet, registerName, resolveName } from "@/api/names";
import { getUserTrustProfile } from "@/api/trust";
import { useSiwsSignIn } from "@/hooks/use-siws";
import { formatPercent } from "@/lib/format";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/names")({
  head: () =>
    pageSeo({
      title: "Names",
      description:
        "Register your on-chain Aethelred name, resolve wallets, and build reputation across the network.",
      path: "/names",
    }),
  component: NamesPage,
});

function NamesPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const { signIn, isSigningIn } = useSiwsSignIn();
  const qc = useQueryClient();
  const [handle, setHandle] = useState("");
  const [lookup, setLookup] = useState("");

  const { data: myName } = useQuery({
    queryKey: ["my-name", wallet],
    queryFn: () => getNameForWallet({ data: { walletAddress: wallet! } }),
    enabled: !!wallet,
  });

  const { data: trust } = useQuery({
    queryKey: ["user-trust", wallet],
    queryFn: () => getUserTrustProfile({ data: { walletAddress: wallet! } }),
    enabled: !!wallet,
  });

  const { data: resolved, refetch: refetchLookup } = useQuery({
    queryKey: ["resolve-name", lookup],
    queryFn: () => resolveName({ data: { handle: lookup } }),
    enabled: false,
  });

  const register = useMutation({
    mutationFn: registerName,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["my-name"] });
      toast.success("Name registered");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Registration failed"),
  });

  const onRegister = async () => {
    if (!wallet) {
      toast.error("Connect wallet first");
      return;
    }
    try {
      await signIn();
      await register.mutateAsync({
        data: { walletAddress: wallet, handle },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in required");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-28">
      <header>
        <p className="eyebrow">Identity</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Register your <span className="text-editorial text-accent">.aethel</span> name
        </h1>
        <p className="mt-4 text-muted-foreground">
          Human-readable Solana identity linked to your trust profile. Premium short handles require
          trust score ≥ 80.
        </p>
      </header>

      {wallet && (
        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium">
                {myName ? `${myName.handle}.aethel` : "No name registered"}
              </p>
              {trust && (
                <p className="text-xs text-muted-foreground">
                  Trust {trust.trustScore} · Max perp {trust.maxPerpLeverage}x · KYC {trust.kycTier}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-4 rounded-xl border border-border bg-surface p-6">
        <label className="text-xs text-muted-foreground">Choose handle</label>
        <div className="flex gap-2">
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase())}
            placeholder="berggasse"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <span className="flex items-center text-sm text-muted-foreground">.aethel</span>
        </div>
        <button
          type="button"
          onClick={onRegister}
          disabled={!handle || register.isPending || isSigningIn}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
        >
          {(register.isPending || isSigningIn) && <Loader2 className="h-4 w-4 animate-spin" />}
          Register name
        </button>
      </div>

      <div className="mt-10 space-y-4 rounded-xl border border-border bg-surface p-6">
        <label className="text-xs text-muted-foreground">Resolve handle</label>
        <div className="flex gap-2">
          <input
            value={lookup}
            onChange={(e) => setLookup(e.target.value.toLowerCase())}
            placeholder="laszlo"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void refetchLookup()}
            className="rounded-md border border-border px-4 py-2 text-sm"
          >
            Lookup
          </button>
        </div>
        {resolved && (
          <p className="text-sm">
            <span className="font-medium">{resolved.handle}.aethel</span> →{" "}
            <Link to="/portfolio" className="font-mono text-accent hover:underline">
              {resolved.walletAddress.slice(0, 8)}…
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
