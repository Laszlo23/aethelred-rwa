import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { useKycStatus } from "@/hooks/use-kyc";

interface KycStatusBannerProps {
  walletAddress: string;
}

export function KycStatusBanner({ walletAddress }: KycStatusBannerProps) {
  const { data } = useKycStatus(walletAddress);
  if (!data || data.verified) return null;

  if (data.application?.status === "pending") {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium">KYC under review</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your identity application is pending. This page updates automatically once approved.
            </p>
          </div>
        </div>
        <Link to="/profile" className="shrink-0 text-sm font-medium text-accent hover:underline">
          View profile →
        </Link>
      </div>
    );
  }

  if (data.application?.status === "rejected") {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium">Verification needs attention</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data.application.reviewerNote ?? "Update your details and resubmit on your profile."}
            </p>
          </div>
        </div>
        <Link
          to="/profile"
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110"
        >
          Resubmit KYC
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <p className="font-medium">Verify to unlock restricted shares</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Complete KYC on your profile before purchasing Token-2022 RWA shares.
          </p>
        </div>
      </div>
      <Link
        to="/profile"
        className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110"
      >
        Start verification
      </Link>
    </div>
  );
}
