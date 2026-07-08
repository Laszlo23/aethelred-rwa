import type { TaskDTO } from "@/lib/types";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStartTask, useSubmitTaskProof, useClaimTaskReward, useTasks } from "@/hooks/use-api";
import { toast } from "sonner";

const CATEGORY_META: Record<string, { label: string; color: string; hint: string }> = {
  EASY: { label: "Easy tasks", color: "text-verified", hint: "30 seconds to 2 minutes" },
  COMMUNITY: { label: "Community tasks", color: "text-accent", hint: "Creative contributions" },
  BUILDER: { label: "Builder tasks", color: "text-foreground", hint: "On-chain actions" },
};

const FILTERS = ["ALL", "EASY", "COMMUNITY", "BUILDER"] as const;

function TaskCard({ task, onStart }: { task: TaskDTO; onStart: (task: TaskDTO) => void }) {
  const catColor =
    task.category === "EASY"
      ? "bg-verified/20 text-verified"
      : task.category === "COMMUNITY"
        ? "bg-accent/20 text-accent"
        : "bg-white/10 text-foreground";

  const status = task.completion?.status;

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent/30">
      <div className="flex items-start justify-between">
        <span
          className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${catColor}`}
        >
          {task.category}
        </span>
        <span className="tabular font-mono text-sm font-semibold text-verified">
          +{task.rewardPoints}
          {task.rewardTokenAmount > 0 && (
            <span className="ml-1 text-[10px] text-muted-foreground">BCT</span>
          )}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug">{task.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{task.description}</p>
      <div className="mt-6 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          ⚡ {task.timeEstimate}
        </span>
        {status === "CLAIMED" ? (
          <span className="text-xs font-semibold text-verified">Claimed ✓</span>
        ) : status === "CLAIMABLE" ? (
          <button
            onClick={() => onStart(task)}
            className="text-sm font-semibold text-verified hover:underline"
          >
            Claim →
          </button>
        ) : (
          <button
            onClick={() => onStart(task)}
            className="text-sm font-semibold text-accent hover:underline"
          >
            Start →
          </button>
        )}
      </div>
    </article>
  );
}

export function TaskBoard() {
  const [filter, setFilter] = useState<string>("ALL");
  const [activeTask, setActiveTask] = useState<TaskDTO | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const { data: tasks = [], refetch } = useTasks(wallet, filter === "ALL" ? undefined : filter);
  const startTask = useStartTask();
  const submitProof = useSubmitTaskProof();
  const claimReward = useClaimTaskReward();

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.category === filter);

  const grouped = (["EASY", "COMMUNITY", "BUILDER"] as const).map((cat) => ({
    cat,
    tasks: filtered.filter((t) => t.category === cat),
  }));

  const handleStart = async (task: TaskDTO) => {
    if (!wallet) {
      toast.error("Connect your wallet first");
      return;
    }
    if (task.completion?.status === "CLAIMABLE") {
      try {
        const { buildClaimRewardTx } = await import("@/lib/solana/transactions");
        const tx = await buildClaimRewardTx(wallet, task.rewardTokenAmount);
        const sig = tx ? `sim_${Date.now()}` : `points_${Date.now()}`;
        await claimReward.mutateAsync({
          data: { taskSlug: task.slug, walletAddress: wallet, txSignature: sig },
        });
        toast.success(`Claimed +${task.rewardPoints} points`);
        void refetch();
      } catch {
        toast.error("Claim failed");
      }
      return;
    }
    setActiveTask(task);
    await startTask.mutateAsync({ data: { taskSlug: task.slug, walletAddress: wallet } });
  };

  const handleSubmitProof = async () => {
    if (!wallet || !activeTask) return;
    await submitProof.mutateAsync({
      data: { taskSlug: activeTask.slug, walletAddress: wallet, proofUrl },
    });
    toast.success("Proof submitted — reward claimable");
    setActiveTask(null);
    setProofUrl("");
    void refetch();
  };

  const totalCount = tasks.length;

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f
                ? "bg-accent text-accent-foreground shadow-glow-gold"
                : "border border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "ALL"
              ? `All tasks ${totalCount}`
              : `${f.charAt(0) + f.slice(1).toLowerCase()} ${tasks.filter((t) => t.category === f).length}`}
          </button>
        ))}
      </div>

      {grouped.map(({ cat, tasks: catTasks }) => {
        if (catTasks.length === 0) return null;
        const meta = CATEGORY_META[cat];
        return (
          <section key={cat} className="space-y-6">
            <div className="flex items-center gap-3">
              <span
                className={`h-2 w-2 rounded-full ${cat === "EASY" ? "bg-verified" : cat === "COMMUNITY" ? "bg-accent" : "bg-foreground"}`}
              />
              <div>
                <h2 className="text-lg font-semibold">{meta.label}</h2>
                <p className="text-sm text-muted-foreground">{meta.hint}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catTasks.map((t) => (
                <TaskCard key={t.id} task={t} onStart={handleStart} />
              ))}
            </div>
          </section>
        );
      })}

      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">
            <p className="eyebrow">{activeTask.category}</p>
            <h3 className="mt-2 text-xl font-semibold">{activeTask.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{activeTask.description}</p>
            {activeTask.verificationType === "SOCIAL_FOLLOW" && (
              <input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="Paste proof URL"
                className="mt-6 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setActiveTask(null)}
                className="flex-1 rounded-md border border-border py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProof}
                className="flex-1 rounded-md bg-accent py-2 text-sm font-semibold text-accent-foreground"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
