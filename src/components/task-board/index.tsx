import type { TaskDTO } from "@/lib/types";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStartTask, useSubmitTaskProof, useClaimTaskReward, useTasks } from "@/hooks/use-api";
import {
  enrichTaskAction,
  GROK_SHARE_URL,
  isQuickSocialTask,
  platformLabel,
} from "@/lib/tasks/social-actions";
import { SOCIAL_LINKS } from "@/lib/data/seed";
import { CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_META: Record<string, { label: string; color: string; hint: string }> = {
  EASY: { label: "Easy tasks", color: "text-verified", hint: "One tap — open X, done, claim" },
  COMMUNITY: { label: "Community tasks", color: "text-accent", hint: "Creative contributions" },
  BUILDER: { label: "Builder tasks", color: "text-foreground", hint: "On-chain actions" },
};

const FILTERS = ["ALL", "EASY", "COMMUNITY", "BUILDER"] as const;

function taskButtonLabel(task: TaskDTO): string {
  const status = task.completion?.status;
  const enriched = enrichTaskAction(task);
  if (status === "CLAIMED") return "Claimed";
  if (status === "CLAIMABLE") return `Claim +${task.rewardPoints}`;
  if (status === "STARTED" || status === "SUBMITTED") return "I followed — claim";
  return enriched.label;
}

function TaskCard({
  task,
  onAction,
  busy,
}: {
  task: TaskDTO;
  onAction: (task: TaskDTO) => void;
  busy: boolean;
}) {
  const catColor =
    task.category === "EASY"
      ? "bg-verified/20 text-verified"
      : task.category === "COMMUNITY"
        ? "bg-accent/20 text-accent"
        : "bg-white/10 text-foreground";

  const status = task.completion?.status;
  const claimed = status === "CLAIMED";
  const claimable = status === "CLAIMABLE";
  const inProgress = status === "STARTED" || status === "SUBMITTED";
  const quick = isQuickSocialTask(task);

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-surface p-6 transition-all ${
        claimed
          ? "border-verified/30 opacity-80"
          : inProgress
            ? "border-verified/40 shadow-[0_0_0_1px_rgba(34,197,94,0.15)]"
            : "border-border hover:border-accent/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${catColor}`}
        >
          {task.category}
        </span>
        <span className="tabular shrink-0 font-mono text-sm font-semibold text-verified">
          +{task.rewardPoints}
          {task.rewardTokenAmount > 0 && (
            <span className="ml-1 text-[10px] text-muted-foreground">BCT</span>
          )}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug">{task.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{task.description}</p>
      {inProgress && quick && (
        <p className="mt-3 text-xs font-medium text-verified">
          Step 2: confirm on X, then claim below
        </p>
      )}
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">⚡ {task.timeEstimate}</span>
        <button
          type="button"
          disabled={busy || claimed}
          onClick={() => onAction(task)}
          className={`inline-flex min-w-[9rem] items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            claimed
              ? "bg-verified/15 text-verified"
              : claimable
                ? "bg-verified text-background hover:brightness-110"
                : inProgress
                  ? "border border-verified/40 bg-verified/10 text-verified hover:bg-verified/20"
                  : "bg-accent text-accent-foreground hover:brightness-110"
          }`}
        >
          {claimed ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Claimed
            </>
          ) : (
            taskButtonLabel(task)
          )}
          {!claimed && quick && !claimable && !inProgress && (
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          )}
        </button>
      </div>
    </article>
  );
}

function SocialDoneSheet({
  task,
  openUrl,
  busy,
  onOpenAgain,
  onLater,
  onDone,
}: {
  task: TaskDTO;
  openUrl?: string;
  busy: boolean;
  onOpenAgain: () => void;
  onLater: () => void;
  onDone: () => void;
}) {
  const platform = platformLabel(task);
  const enriched = enrichTaskAction(task);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-in slide-in-from-bottom-4 rounded-t-3xl border border-border bg-surface p-6 pb-8 shadow-2xl sm:rounded-3xl sm:m-4">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background text-lg font-bold">
            𝕏
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-verified">
              Almost done
            </p>
            <h3 className="text-lg font-semibold">{enriched.label}</h3>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          We opened {platform} in a new tab. Follow{" "}
          <span className="font-medium text-foreground">@buildingcultu3</span>, then come back and
          claim your +{task.rewardPoints} points.
        </p>
        <ol className="mt-5 space-y-3">
          {[
            `Complete the action on ${platform}`,
            "Return to this tab",
            "Tap I followed — claim reward",
          ].map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col gap-3">
          {openUrl && (
            <button
              type="button"
              onClick={onOpenAgain}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-white/5"
            >
              Open {platform} again
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onDone}
            className="inline-flex w-full items-center justify-center rounded-xl bg-verified px-4 py-3.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-50"
          >
            I followed — claim reward
          </button>
          <button
            type="button"
            onClick={onLater}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            I&apos;ll finish later
          </button>
        </div>
      </div>
    </div>
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
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.category === filter);

  const grouped = (["EASY", "COMMUNITY", "BUILDER"] as const).map((cat) => ({
    cat,
    tasks: filtered.filter((t) => t.category === cat),
  }));

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleClaim = async (task: TaskDTO) => {
    if (!wallet) return;
    try {
      const { buildClaimRewardTx } = await import("@/lib/solana/transactions");
      const tx = await buildClaimRewardTx(wallet, task.rewardTokenAmount);
      const sig = tx ? `sim_${Date.now()}` : `points_${Date.now()}`;
      await claimReward.mutateAsync({
        data: { taskSlug: task.slug, walletAddress: wallet, txSignature: sig },
      });
      toast.success(`Claimed +${task.rewardPoints} points`);
      setActiveTask(null);
      void refetch();
    } catch {
      toast.error("Claim failed");
    }
  };

  const handleComplete = async (task: TaskDTO) => {
    if (!wallet) return;
    setBusySlug(task.slug);
    try {
      await submitProof.mutateAsync({
        data: { taskSlug: task.slug, walletAddress: wallet, proofUrl: proofUrl || undefined },
      });
      toast.success("Reward ready — tap Claim on the card");
      setActiveTask(null);
      setProofUrl("");
      void refetch();
    } catch {
      toast.error("Could not complete task");
    } finally {
      setBusySlug(null);
    }
  };

  const handleAction = async (task: TaskDTO) => {
    if (!wallet) {
      toast.error("Connect your wallet first");
      return;
    }

    const status = task.completion?.status;
    if (status === "CLAIMED") return;

    const enriched = enrichTaskAction(task);
    const quick = isQuickSocialTask(task);

    setBusySlug(task.slug);
    try {
      if (status === "CLAIMABLE") {
        await handleClaim(task);
        return;
      }

      if (status === "STARTED" || status === "SUBMITTED") {
        if (quick) {
          await handleComplete(task);
          return;
        }
        if (task.verificationType === "MANUAL_REVIEW" || task.requiresProof) {
          setActiveTask(task);
          return;
        }
        await handleComplete(task);
        return;
      }

      await startTask.mutateAsync({ data: { taskSlug: task.slug, walletAddress: wallet } });

      if (enriched.openUrl && quick) {
        openExternal(enriched.openUrl);
        toast.message(`Opened ${platformLabel(task)}`, {
          description: "Complete the action, then tap I followed — claim reward",
        });
        setActiveTask(task);
        return;
      }

      if (enriched.openUrl) {
        openExternal(enriched.openUrl);
      }

      if (task.verificationType === "MANUAL_REVIEW" || task.requiresProof) {
        setActiveTask(task);
        return;
      }

      await handleComplete(task);
    } catch {
      toast.error("Could not start task");
    } finally {
      setBusySlug(null);
    }
  };

  const handleFollowHero = async () => {
    const followTask = tasks.find((t) => t.slug === "follow-bc-x");
    if (followTask) {
      await handleAction(followTask);
      return;
    }
    openExternal("https://x.com/intent/follow?screen_name=buildingcultu3");
    toast.message("Opened X", { description: "Follow @buildingcultu3 to stay in the loop" });
  };

  const totalCount = tasks.length;
  const activeEnriched = activeTask ? enrichTaskAction(activeTask) : null;
  const showSocialSheet = activeTask && isQuickSocialTask(activeTask);
  const showManualSheet =
    activeTask && !isQuickSocialTask(activeTask) && activeTask.verificationType === "MANUAL_REVIEW";

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-accent/25 bg-gradient-to-br from-gold-soft/30 via-surface to-surface p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Boost traffic
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">Follow @buildingcultu3 on X</h2>
            <p className="text-sm text-muted-foreground">
              One tap opens X with the follow screen ready. Confirm, claim points — no links to
              paste.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleFollowHero()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110"
            >
              Follow on X
              <ExternalLink className="h-4 w-4" />
            </button>
            <a
              href={GROK_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:bg-white/5"
            >
              Share on X / Grok
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
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
                <TaskCard
                  key={t.id}
                  task={t}
                  onAction={(task) => void handleAction(task)}
                  busy={busySlug === t.slug}
                />
              ))}
            </div>
          </section>
        );
      })}

      {showSocialSheet && activeTask && (
        <SocialDoneSheet
          task={activeTask}
          openUrl={activeEnriched?.openUrl}
          busy={busySlug === activeTask.slug}
          onOpenAgain={() => {
            if (activeEnriched?.openUrl) openExternal(activeEnriched.openUrl);
          }}
          onLater={() => setActiveTask(null)}
          onDone={() => void handleComplete(activeTask)}
        />
      )}

      {showManualSheet && activeTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-8">
            <p className="eyebrow">{activeTask.category}</p>
            <h3 className="mt-2 text-xl font-semibold">{activeTask.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{activeTask.description}</p>
            {activeEnriched?.openUrl && (
              <a
                href={activeEnriched.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-gold-soft/40 px-4 py-3 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
              >
                {activeEnriched.label}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <input
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder={activeTask.proofHint ?? "Optional link to your work"}
              className="mt-4 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busySlug === activeTask.slug}
                onClick={() => void handleComplete(activeTask)}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Official X:{" "}
        <a
          href={SOCIAL_LINKS.xAccount}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          @buildingcultu3
        </a>
      </p>
    </div>
  );
}
