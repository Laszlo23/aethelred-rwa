import { createFileRoute } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProposals, useVoteProposal } from "@/hooks/use-api";
import { format } from "date-fns";
import { toast } from "sonner";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/governance")({
  ssr: false,
  head: () =>
    pageSeo({
      title: "Governance",
      description:
        "Vote on Aethelred protocol proposals and shape the future of Building Culture RWAs.",
      path: "/governance",
    }),
  component: GovernancePage,
});

function GovernancePage() {
  const { data: proposals = [] } = useProposals();
  const { publicKey } = useWallet();
  const vote = useVoteProposal();

  const handleVote = async (proposalId: string, support: boolean) => {
    if (!publicKey) {
      toast.error("Connect wallet to vote");
      return;
    }
    await vote.mutateAsync({
      data: { proposalId, walletAddress: publicKey.toBase58(), support },
    });
    toast.success(support ? "Voted for" : "Voted against");
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <header className="mb-14">
        <p className="eyebrow">DAO Governance</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Shape the <span className="text-editorial text-accent">trust layer.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Vote on protocol parameters. Vote weight scales with verified passport collateral.
        </p>
      </header>

      <div className="space-y-6">
        {proposals.map((p) => {
          const total = p.votesFor + p.votesAgainst;
          const forPct = total ? Math.round((p.votesFor / total) * 100) : 50;
          return (
            <article key={p.id} className="rounded-2xl border border-border bg-surface p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="eyebrow">{p.status}</span>
                  <h2 className="mt-2 text-xl font-semibold">{p.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  Ends {format(new Date(p.endsAt), "dd MMM")}
                </span>
              </div>
              <div className="mt-6">
                <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="bg-verified" style={{ width: `${forPct}%` }} />
                  <div className="bg-destructive/60" style={{ width: `${100 - forPct}%` }} />
                </div>
                <div className="mt-2 flex justify-between font-mono text-xs">
                  <span className="text-verified">{p.votesFor} for</span>
                  <span className="text-destructive">{p.votesAgainst} against</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => void handleVote(p.id, true)}
                  className="rounded-md bg-verified/20 px-4 py-2 text-sm font-semibold text-verified"
                >
                  Vote For
                </button>
                <button
                  onClick={() => void handleVote(p.id, false)}
                  className="rounded-md border border-border px-4 py-2 text-sm"
                >
                  Vote Against
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-16 rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="eyebrow">Roadmap</p>
        <p className="mt-2 text-muted-foreground">
          On-chain governance via Solana programs — proposals execute through the vault program.
        </p>
      </section>
    </div>
  );
}
