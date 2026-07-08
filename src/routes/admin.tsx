import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { BadgeCheck, Clock, Loader2, Lock, ShieldX, X } from "lucide-react";
import { toast } from "sonner";
import { useKycApplications, useReviewKyc, useCheckAdmin } from "@/hooks/use-kyc";
import type { KycApplicationDTO } from "@/lib/types";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () =>
    pageSeo({
      title: "Admin — KYC Review",
      description: "Internal KYC review board for Building Culture compliance operators.",
      path: "/admin",
      noIndex: true,
    }),
  component: AdminPage,
});

const STORAGE_KEY = "aethelred_admin_secret";
const FILTERS = ["pending", "approved", "rejected", "all"] as const;

function AdminPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const checkAdmin = useCheckAdmin();

  const [secret, setSecret] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setSecret(stored);
  }, []);

  useEffect(() => {
    if (!secret && !wallet) return;
    void checkAdmin
      .mutateAsync({ data: { adminSecret: secret || undefined, walletAddress: wallet } })
      .then((r) => setAuthorized(r.isAdmin))
      .catch(() => setAuthorized(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret, wallet]);

  const handleUnlock = () => {
    localStorage.setItem(STORAGE_KEY, input.trim());
    setSecret(input.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSecret("");
    setAuthorized(false);
    setInput("");
  };

  if (!authorized) {
    return (
      <div className="mx-auto max-w-md px-6 py-32">
        <div className="rounded-xl border border-border bg-surface/40 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">Admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the admin passphrase to review KYC applications. An allowlisted admin wallet
            also grants access automatically.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Admin passphrase"
            className="mt-6 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleUnlock}
            disabled={checkAdmin.isPending || !input.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-50"
          >
            {checkAdmin.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Unlock
          </button>
          {secret && !checkAdmin.isPending && (
            <p className="mt-3 text-xs text-destructive">Incorrect passphrase</p>
          )}
        </div>
      </div>
    );
  }

  return <AdminBoard secret={secret} wallet={wallet} onLogout={handleLogout} />;
}

function AdminBoard({
  secret,
  wallet,
  onLogout,
}: {
  secret: string;
  wallet?: string;
  onLogout: () => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const auth = useMemo(
    () => ({ adminSecret: secret || undefined, walletAddress: wallet }),
    [secret, wallet],
  );
  const { data: applications = [], isLoading } = useKycApplications(
    auth,
    filter === "all" ? undefined : filter,
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Compliance</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            KYC <span className="text-editorial text-accent">review board.</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Approve or reject identity verification requests. Approving marks the wallet KYC-verified.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Lock board
        </button>
      </header>

      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading applications…</p>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No {filter === "all" ? "" : filter} applications.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} auth={auth} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  auth,
}: {
  app: KycApplicationDTO;
  auth: { adminSecret?: string; walletAddress?: string };
}) {
  const review = useReviewKyc();
  const [note, setNote] = useState("");
  const [showReject, setShowReject] = useState(false);

  const decide = async (decision: "approve" | "reject") => {
    try {
      await review.mutateAsync({
        data: { ...auth, applicationId: app.id, decision, note: note || undefined },
      });
      toast.success(decision === "approve" ? "Wallet verified" : "Application rejected");
      setShowReject(false);
      setNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Review failed");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{app.fullName}</h3>
            <StatusPill status={app.status} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{app.walletAddress}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
            <Info label="Country" value={app.country} />
            <Info label="DoB" value={app.dateOfBirth ?? "—"} />
            <Info label="Document" value={app.docType.replace("_", " ")} />
            <Info label="Doc no." value={app.docNumberMasked} />
            <Info label="Tier" value={app.requestedTier} />
            <Info label="Submitted" value={new Date(app.submittedAt).toLocaleString()} />
          </dl>
          {app.reviewerNote && (
            <p className="mt-2 text-xs text-muted-foreground">Note: {app.reviewerNote}</p>
          )}
        </div>

        {app.status === "pending" && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => decide("approve")}
              disabled={review.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {review.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
              Approve
            </button>
            <button
              type="button"
              onClick={() => setShowReject((s) => !s)}
              disabled={review.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <ShieldX className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}
      </div>

      {showReject && (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for rejection (shown to applicant)"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => decide("reject")}
            disabled={review.isPending}
            className="shrink-0 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            Confirm reject
          </button>
          <button
            type="button"
            onClick={() => setShowReject(false)}
            className="shrink-0 rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium capitalize">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: KycApplicationDTO["status"] }) {
  const map = {
    pending: { icon: Clock, cls: "bg-amber-500/15 text-amber-400" },
    approved: { icon: BadgeCheck, cls: "bg-emerald-500/15 text-emerald-400" },
    rejected: { icon: ShieldX, cls: "bg-destructive/15 text-destructive" },
  } as const;
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${s.cls}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
