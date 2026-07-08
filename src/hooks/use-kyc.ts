import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  submitKycApplication,
  getKycStatus,
  listKycApplications,
  reviewKycApplication,
  checkAdminAccess,
} from "@/api/kyc";

export function useKycStatus(walletAddress?: string) {
  return useQuery({
    queryKey: ["kyc-status", walletAddress],
    queryFn: () => getKycStatus({ data: { walletAddress: walletAddress! } }),
    enabled: !!walletAddress,
    refetchInterval: (query) =>
      query.state.data?.application?.status === "pending" ? 10_000 : false,
  });
}

export function useSubmitKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitKycApplication,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["kyc-status"] });
      void qc.invalidateQueries({ queryKey: ["compliance"] });
    },
  });
}

export function useKycApplications(
  auth: { adminSecret?: string; walletAddress?: string },
  status?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["kyc-applications", status, auth.adminSecret, auth.walletAddress],
    queryFn: () => listKycApplications({ data: { ...auth, status } }),
    enabled,
    refetchInterval: 15_000,
  });
}

export function useReviewKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewKycApplication,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["kyc-applications"] });
      void qc.invalidateQueries({ queryKey: ["kyc-status"] });
      void qc.invalidateQueries({ queryKey: ["compliance"] });
    },
  });
}

export function useCheckAdmin() {
  return useMutation({ mutationFn: checkAdminAccess });
}
