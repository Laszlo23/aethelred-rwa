import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthChallenge, verifyAuth } from "@/api/auth";

export function useAuthChallenge(walletAddress?: string) {
  return useQuery({
    queryKey: ["auth-challenge", walletAddress],
    queryFn: () => getAuthChallenge({ data: { walletAddress: walletAddress! } }),
    enabled: false,
  });
}

export function useVerifyAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: verifyAuth,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["user-trust"] });
    },
  });
}
