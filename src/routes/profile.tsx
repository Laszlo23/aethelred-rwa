import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BadgeCheck, Clock, ShieldCheck, ShieldX, Loader2, Wallet, Compass } from "lucide-react";
import { toast } from "sonner";
import { useKycStatus, useSubmitKyc } from "@/hooks/use-kyc";
import { useSiwsSignIn } from "@/hooks/use-siws";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () =>
    pageSeo({
      title: "Profile",
      description:
        "Connect your wallet, complete KYC verification, and unlock restricted share purchases.",
      path: "/profile",
      noIndex: true,
    }),
  component: ProfilePage,
});

const COUNTRIES = [
  "Austria",
  "Germany",
  "Switzerland",
  "France",
  "Italy",
  "Netherlands",
  "United States",
  "United Kingdom",
  "Other",
];

const DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "id_card", label: "National ID card" },
  { value: "drivers_license", label: "Driver's license" },
];

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function ProfilePage() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const wallet = publicKey?.toBase58();
  const { signIn, isSigningIn } = useSiwsSignIn();
  const { data: status, isLoading } = useKycStatus(wallet);
  const submit = useSubmitKyc();

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Austria");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [docType, setDocType] = useState("passport");
  const [docNumber, setDocNumber] = useState("");

  if (!wallet) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <p className="eyebrow">Profile</p>
        <h1 className="mt-4 text-3xl font-semibold">Connect your wallet</h1>
        <p className="mt-3 text-muted-foreground">
          Your profile holds your verification status, trust tier, and account details.
        </p>
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="mt-8 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110"
        >
          Connect Vault
        </button>
      </div>
    );
  }

  const application = status?.application ?? null;
  const verified = status?.verified ?? false;
  const appStatus = verified ? "approved" : (application?.status ?? "none");

  const handleSubmit = async () => {
    if (!fullName.trim() || !docNumber.trim()) {
      toast.error("Enter your full name and document number");
      return;
    }
    try {
      await signIn();
      await submit.mutateAsync({
        data: {
          walletAddress: wallet,
          fullName,
          country,
          dateOfBirth: dateOfBirth || undefined,
          docType,
          docNumber,
          requestedTier: "basic",
        },
      });
      toast.success("KYC application submitted — pending review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="mb-10">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Your <span className="text-editorial text-accent">profile.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Verify your identity to unlock restricted RWA share purchases and higher trust tiers.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Wallet</p>
              <p className="font-mono text-sm text-muted-foreground">{short(wallet)}</p>
            </div>
          </div>
          <StatusBadge status={appStatus} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">KYC tier</dt>
            <dd className="mt-1 font-medium capitalize">{status?.kycTier ?? "unverified"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Verified at</dt>
            <dd className="mt-1 font-medium">
              {status?.verifiedAt ? new Date(status.verifiedAt).toLocaleDateString() : "—"}
            </dd>
          </div>
        </dl>
      </section>

      {isLoading ? (
        <p className="text-muted-foreground">Loading status…</p>
      ) : verified ? (
        <VerifiedPanel />
      ) : appStatus === "pending" ? (
        <PendingPanel />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-5 rounded-xl border border-border bg-surface/40 p-6"
        >
          <div>
            <h2 className="text-lg font-semibold">Identity verification</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {appStatus === "rejected"
                ? "Your previous application was rejected. Update your details and resubmit."
                : "Submit your details for manual KYC review."}
            </p>
            {appStatus === "rejected" && application?.reviewerNote && (
              <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Reviewer note: {application.reviewerNote}
              </p>
            )}
          </div>

          <Field label="Full legal name">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Country">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date of birth">
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Document type">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Document number">
              <input
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="P1234567"
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submit.isPending || isSigningIn}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 disabled:opacity-50"
          >
            {submit.isPending || isSigningIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {isSigningIn ? "Sign in wallet…" : "Submit for verification"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            You'll sign a message to prove wallet ownership. No document images are stored in this
            demo.
          </p>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: typeof BadgeCheck; label: string; cls: string }> = {
    approved: { icon: BadgeCheck, label: "Verified", cls: "bg-emerald-500/15 text-emerald-400" },
    pending: { icon: Clock, label: "Pending review", cls: "bg-amber-500/15 text-amber-400" },
    rejected: { icon: ShieldX, label: "Rejected", cls: "bg-destructive/15 text-destructive" },
    none: { icon: ShieldCheck, label: "Unverified", cls: "bg-muted text-muted-foreground" },
  };
  const s = map[status] ?? map.none;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {s.label}
    </span>
  );
}

function VerifiedPanel() {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
      <BadgeCheck className="mx-auto h-10 w-10 text-emerald-400" />
      <h2 className="mt-3 text-lg font-semibold">You're verified</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your wallet can now purchase restricted RWA shares.
      </p>
      <Link
        to="/explore"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110"
      >
        <Compass className="h-4 w-4" />
        Explore assets
      </Link>
    </div>
  );
}

function PendingPanel() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
      <Clock className="mx-auto h-10 w-10 text-amber-400" />
      <h2 className="mt-3 text-lg font-semibold">Application under review</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A compliance reviewer will approve or reject your KYC shortly. This page updates
        automatically.
      </p>
    </div>
  );
}
