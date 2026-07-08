import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAssets, getAsset, getAssetDetail } from "@/api/assets";
import { getPoolStats } from "@/api/liquidity";
import { listPassports } from "@/api/passport";
import { getPortfolio, upsertUser } from "@/api/portfolio";
import { getGuardianStatus, getGuardianAudits, submitAsset, uploadDocument, runGuardianAudit, mintPassportRecord } from "@/api/guardian";
import { listTasks, startTask, submitTaskProof, claimTaskReward } from "@/api/tasks";
import { listProposals, voteProposal } from "@/api/governance";
import { listLendingPositions, createLendingPosition, repayLendingPosition } from "@/api/lending";
import { listDistributions, getHolderPayouts } from "@/api/distributions";
import { getWalletHoldings, purchaseShares } from "@/api/shares";

export function useAssets(filters?: { assetType?: string }) {
  return useQuery({
    queryKey: ["assets", filters],
    queryFn: () => listAssets({ data: filters ?? {} }),
  });
}

export function useAsset(slugOrId: string) {
  return useQuery({
    queryKey: ["asset", slugOrId],
    queryFn: () => getAsset({ data: { slugOrId } }),
    enabled: !!slugOrId,
  });
}

export function useAssetDetail(slugOrId: string, walletAddress?: string) {
  return useQuery({
    queryKey: ["asset-detail", slugOrId, walletAddress],
    queryFn: () => getAssetDetail({ data: { slugOrId, walletAddress } }),
    enabled: !!slugOrId,
  });
}

export function useWalletHoldings(walletAddress?: string, assetId?: string) {
  return useQuery({
    queryKey: ["wallet-holdings", walletAddress, assetId],
    queryFn: () => getWalletHoldings({ data: { walletAddress: walletAddress!, assetId } }),
    enabled: !!walletAddress,
  });
}

export function useLendingPositions(walletAddress?: string, assetId?: string) {
  return useQuery({
    queryKey: ["lending-positions", walletAddress, assetId],
    queryFn: () => listLendingPositions({ data: { walletAddress, assetId } }),
  });
}

export function useDistributions(assetId: string) {
  return useQuery({
    queryKey: ["distributions", assetId],
    queryFn: () => listDistributions({ data: { assetId } }),
    enabled: !!assetId,
  });
}

export function useHolderPayouts(walletAddress?: string, assetId?: string) {
  return useQuery({
    queryKey: ["holder-payouts", walletAddress, assetId],
    queryFn: () => getHolderPayouts({ data: { walletAddress: walletAddress!, assetId } }),
    enabled: !!walletAddress,
  });
}

export function useCreateLendingPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLendingPosition,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["lending-positions"] });
      void qc.invalidateQueries({ queryKey: ["asset-detail"] });
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}

export function useRepayLendingPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repayLendingPosition,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["lending-positions"] });
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}

export function usePurchaseShares() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseShares,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet-holdings"] });
      void qc.invalidateQueries({ queryKey: ["asset-detail"] });
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
      void qc.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useLiquidityPool() {
  return useQuery({
    queryKey: ["liquidity-pool"],
    queryFn: () => getPoolStats(),
  });
}

export function usePassports() {
  return useQuery({
    queryKey: ["passports"],
    queryFn: () => listPassports(),
  });
}

export function usePortfolio(walletAddress?: string) {
  return useQuery({
    queryKey: ["portfolio", walletAddress],
    queryFn: () => getPortfolio({ data: { walletAddress: walletAddress! } }),
    enabled: !!walletAddress,
  });
}

export function useGuardianStatus() {
  return useQuery({
    queryKey: ["guardian-status"],
    queryFn: () => getGuardianStatus(),
    refetchInterval: 30_000,
  });
}

export function useGuardianAudits(limit = 20) {
  return useQuery({
    queryKey: ["guardian-audits", limit],
    queryFn: () => getGuardianAudits({ data: { limit } }),
    refetchInterval: 10_000,
  });
}

export function useTasks(walletAddress?: string, category?: string) {
  return useQuery({
    queryKey: ["tasks", walletAddress, category],
    queryFn: () => listTasks({ data: { walletAddress, category } }),
  });
}

export function useProposals() {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: () => listProposals(),
  });
}

export function useSubmitAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitAsset,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useUploadDocument() {
  return useMutation({ mutationFn: uploadDocument });
}

export function useRunAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: runGuardianAudit,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["guardian-audits"] });
      void qc.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useMintPassportRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mintPassportRecord,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["passports"] });
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpsertUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertUser,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useStartTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: startTask,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useSubmitTaskProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitTaskProof,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useClaimTaskReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: claimTaskReward,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useVoteProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: voteProposal,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["proposals"] }),
  });
}
