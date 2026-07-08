import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { EuroLiquidityPanel } from "@/components/euro-liquidity-panel";
import { toast } from "sonner";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/vault")({
  ssr: false,
  head: () =>
    pageSeo({
      title: "EURO Vault",
      description:
        "Deposit and withdraw Euro-backed liquidity, view vault reserves, and access on-chain RWA financing.",
      path: "/vault",
    }),
  component: VaultPage,
});

function VaultPage() {
  const [amount, setAmount] = useState(10000);
  const [mode, setMode] = useState<"mint" | "burn">("mint");
  const { publicKey } = useWallet();

  const handleAction = async () => {
    if (!publicKey) {
      toast.error("Connect wallet first");
      return;
    }
    const { buildMintEuroTx } = await import("@/lib/solana/transactions");
    const tx = await buildMintEuroTx(publicKey.toBase58(), amount * 100);
    if (!tx) {
      toast.info(`${mode === "mint" ? "Mint" : "Burn"} queued — EURO program deploying on devnet`);
      return;
    }
    toast.success(`EURO ${mode} transaction prepared`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-6 py-16 lg:py-24">
      <header className="max-w-2xl">
        <p className="eyebrow">EURO Vault</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Verified asset-backed{" "}
          <span className="text-editorial text-accent">liquidity.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Mint EURO against Guardian-verified collateral. Burn EURO to reduce debt and
          strengthen asset health.
        </p>
      </header>

      <EuroLiquidityPanel />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="mb-6 flex gap-2">
            {(["mint", "burn"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
                  mode === m ? "bg-accent text-accent-foreground" : "border border-border"
                }`}
              >
                {m} EURO
              </button>
            ))}
          </div>
          <label className="eyebrow" htmlFor="euro-amount">Amount (EUR)</label>
          <input
            id="euro-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="tabular mt-2 w-full rounded-lg border border-border bg-background p-4 font-mono text-2xl outline-none"
          />
          <button
            onClick={() => void handleAction()}
            className="mt-6 w-full rounded-md bg-accent py-3 text-sm font-semibold text-accent-foreground"
          >
            {mode === "mint" ? "Mint EURO" : "Burn EURO"}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <p className="eyebrow">Future: Institutional Vaults</p>
          <h3 className="mt-2 text-xl font-semibold">Vault tiers</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>· Standard — 150% collateral, retail access</li>
            <li>· Institutional — segregated custody, custom ratios</li>
            <li>· Premium — priority liquidation protection</li>
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            RWA lending and fractionalization modules scaffolded — see governance for roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}
