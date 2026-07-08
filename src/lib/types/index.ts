export type AssetStatus = "DRAFT" | "PENDING_AUDIT" | "VERIFIED" | "REJECTED" | "LIQUIDATING";
export type TaskCategory = "EASY" | "COMMUNITY" | "BUILDER";
export type VerificationType =
  "SOCIAL_FOLLOW" | "WALLET_CONNECT" | "ONCHAIN_ACTION" | "MANUAL_REVIEW";
export type TaskCompletionStatus =
  "STARTED" | "SUBMITTED" | "VERIFIED" | "CLAIMABLE" | "CLAIMED" | "REJECTED";

export interface AssetDTO {
  id: string;
  slug: string;
  name: string;
  location: string;
  assetType: string;
  imageUrl: string;
  valueCents: number;
  debtCents: number;
  originalDebtCents: number;
  debtRepaidCents: number;
  health: number;
  yieldBps: number;
  status: AssetStatus;
  availableLiquidityCents: number;
  passport?: PassportDTO | null;
  property?: AssetPropertyDTO | null;
}

export interface PassportDTO {
  id: string;
  assetId: string;
  trustScore: number;
  collateralRatio: number;
  guardianGrade: string;
  solanaMint: string | null;
  lastAuditAt: string;
  attestationSig: string | null;
}

export interface LiquidityPoolDTO {
  collateralCents: number;
  backingRatioBps: number;
  euroSupplyCents: number;
  assetsMonitored: number;
  healthyPercent: number;
  riskChecksToday: number;
}

export interface GuardianStatusDTO {
  online: boolean;
  assetsMonitored: number;
  healthyPercent: number;
  riskChecksToday: number;
}

export interface GuardianAuditDTO {
  id: string;
  event: string;
  target: string;
  result: string;
  riskLevel: string | null;
  createdAt: string;
}

export interface TaskDTO {
  id: string;
  slug: string;
  category: TaskCategory;
  title: string;
  description: string;
  rewardPoints: number;
  rewardTokenAmount: number;
  timeEstimate: string;
  verificationType: VerificationType;
  actionUrl?: string;
  intentUrl?: string;
  actionLabel?: string;
  requiresProof?: boolean;
  proofHint?: string;
  completion?: TaskCompletionDTO | null;
}

export interface TaskCompletionDTO {
  id: string;
  status: TaskCompletionStatus;
  proofUrl: string | null;
  txSignature: string | null;
}

export interface ExtractedAssetFields {
  location: string;
  assetType: string;
  estimatedValueCents: number;
  documentsNeeded: string[];
  riskProfile: string;
}

export interface GuardianAuditResult {
  trustScore: number;
  collateralRatio: number;
  guardianGrade: string;
  liquidityEstimateCents: number;
  riskProfile: string;
}

export interface UserDTO {
  id: string;
  walletAddress: string;
  pointsBalance: number;
}

export interface ProposalDTO {
  id: string;
  title: string;
  description: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  endsAt: string;
}

export interface DebtSnapshotDTO {
  recordedAt: string;
  remainingDebtCents: number;
  repaidCents: number;
  health: number;
}

export type PerkType =
  "STAY" | "GOVERNANCE" | "RENT_SHARE" | "DINING" | "LOUNGE" | "PRIORITY_ACCESS";

export type PropertyClass = "apartment" | "hotel" | "commercial" | "residential";
export type CultureSegment = "city" | "land" | "water";

export interface AssetPropertyDTO {
  tagline: string;
  description: string;
  galleryUrls: string[];
  propertyClass: PropertyClass;
  cultureSegment: CultureSegment | null;
  sqm: number | null;
  units: number | null;
  beds: number | null;
  yearBuilt: number | null;
  occupancyBps: number | null;
  bankHolder: string | null;
  communityRaiseTargetCents: number | null;
  tokensSoldBps: number;
  placesPropertyId: number | null;
  externalRef: string | null;
  tokenSymbol: string | null;
  jurisdiction: string | null;
  evmShareToken: string | null;
}

export interface AssetPerkDTO {
  id: string;
  perkType: PerkType;
  title: string;
  description: string;
  minShareBps: number;
  sortOrder: number;
}

export interface AssetShareDTO {
  id: string;
  assetId: string;
  assetSlug: string;
  assetName: string;
  shareBps: number;
  holderWallet: string;
}

export interface LendingPositionDTO {
  id: string;
  assetId: string;
  assetSlug: string;
  assetName: string;
  principalCents: number;
  collateralShareBps: number;
  currency: string;
  accruedInterestCents: number;
  apyBps: number;
  status: string;
  protocol?: string;
  healthFactorBps?: number | null;
  liquidationPriceCents?: number | null;
  createdAt: string;
}

export interface YieldDistributionDTO {
  id: string;
  assetId: string;
  periodLabel: string;
  totalCents: number;
  source: string;
  distributedAt: string;
}

export interface SharePayoutDTO {
  id: string;
  distributionId: string;
  periodLabel: string;
  assetSlug: string;
  assetName: string;
  amountCents: number;
  shareBpsAtSnapshot: number;
  distributedAt: string;
}

export interface ShareSummaryDTO {
  totalSharesBps: number;
  holderCount: number;
  tokensAvailableBps: number;
}

export interface LendingSummaryDTO {
  totalPrincipalCents: number;
  activePositions: number;
  avgApyBps: number;
}

export interface AssetDetailDTO extends AssetDTO {
  property: AssetPropertyDTO | null;
  perks: AssetPerkDTO[];
  shareSummary: ShareSummaryDTO;
  lendingSummary: LendingSummaryDTO;
  recentDistributions: YieldDistributionDTO[];
  debtSnapshots: DebtSnapshotDTO[];
}

export interface PortfolioDTO {
  holdings: AssetDTO[];
  shareHoldings: AssetShareDTO[];
  lendingPositions: LendingPositionDTO[];
  totalValueCents: number;
  totalDebtCents: number;
  totalAvailableCents: number;
  totalYieldEarnedCents: number;
  eligiblePerks: (AssetPerkDTO & { assetSlug: string; assetName: string })[];
  dashboard: PortfolioDashboardDTO;
  positions: PortfolioPositionDTO[];
}

export interface PortfolioDashboardDTO {
  netWorthCents: number;
  totalPnlCents: number;
  pnlPercentBps: number;
  stakedValueCents: number;
  lentPrincipalCents: number;
  stakingApyBps: number;
  lendingApyBps: number;
}

export interface PortfolioPositionDTO {
  assetId: string;
  assetSlug: string;
  assetName: string;
  imageUrl: string;
  shareBps: number;
  stakedBps: number;
  collateralBps: number;
  marketValueCents: number;
  costBasisCents: number;
  unrealizedPnlCents: number;
  realizedYieldCents: number;
  yieldApyBps: number;
}

export interface TrustFactorsDTO {
  titleVerification: number;
  navFreshness: number;
  debtStability: number;
  reserveMatch: number;
  occupancy: number;
}

export interface UserTrustProfileDTO {
  walletAddress: string;
  trustScore: number;
  kycTier: string;
  maxBorrowLtvBps: number;
  maxPerpLeverage: number;
  factors: Record<string, number>;
  handle?: string | null;
}

export interface OracleSnapshotDTO {
  id: string;
  assetId: string;
  assetSlug: string;
  navCents: number;
  debtCents: number;
  yieldBps: number;
  source: string;
  recordedAt: string;
}

export interface FundLedgerEntryDTO {
  id: string;
  assetSlug: string | null;
  direction: string;
  amountCents: number;
  currency: string;
  proofHash: string | null;
  txSignature: string | null;
  recordedAt: string;
}

export interface PublicMetricsDTO {
  assetCount: number;
  totalNavCents: number;
  taskCount: number;
  kycApproved: number;
  kycPending: number;
  walletCount: number;
  onChainPrograms: number;
  ledgerEntries: number;
  uniqueShareholders: number;
  liveUrl: string;
  repositoryUrl: string;
  ecosystemUrl: string;
  chain: string;
}

export interface FundsTransparencyDTO {
  totalAumCents: number;
  onChainReserveCents: number;
  offChainReferenceCents: number;
  propertyBreakdown: {
    slug: string;
    name: string;
    navCents: number;
    acquisitionCents: number;
    trustScore: number;
  }[];
  recentLedger: FundLedgerEntryDTO[];
  oracleSnapshots: OracleSnapshotDTO[];
}

export interface NameRegistrationDTO {
  handle: string;
  walletAddress: string;
  expiresAt: string;
  solanaPda: string | null;
}

export interface PerpMarketDTO {
  symbol: string;
  assetSlug: string | null;
  indexPriceCents: number;
  fundingRateBps: number;
  openInterestCents: number;
  volume24hCents: number;
  maxLeverage: number;
  trustMinScore: number;
  driftMarketIndex?: number | null;
  change24hBps?: number;
  high24hCents?: number | null;
  low24hCents?: number | null;
}

export interface PerpCandleDTO {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PerpTradeDTO {
  id: string;
  symbol: string;
  side: string;
  priceCents: number;
  sizeCents: number;
  recordedAt: string;
}

export interface PerpOrderDTO {
  id: string;
  symbol: string;
  side: string;
  orderType: string;
  priceCents: number | null;
  sizeCents: number;
  leverage: number;
  status: string;
  createdAt: string;
}

export interface PerpTerminalDTO {
  market: PerpMarketDTO;
  indexComponents: {
    navCents: number;
    yieldBps: number;
    trustScore: number;
    assetName: string | null;
  } | null;
  fundingCountdownSec: number;
}

export interface OrderBookDTO {
  bids: { priceCents: number; sizeCents: number; totalCents: number }[];
  asks: { priceCents: number; sizeCents: number; totalCents: number }[];
  spreadBps: number;
  markPriceCents: number;
  isSynthetic: boolean;
}

export interface PerpPositionDTO {
  id: string;
  symbol: string;
  side: string;
  sizeCents: number;
  entryPriceCents: number;
  leverage: number;
  marginCents: number;
  unrealizedPnlCents: number;
  status: string;
  liquidationPriceCents?: number;
}

export interface WalletComplianceDTO {
  walletAddress: string;
  kycTier: string;
  verified: boolean;
  verifiedAt: string | null;
}

export type KycStatusValue = "pending" | "approved" | "rejected";

export interface KycApplicationDTO {
  id: string;
  walletAddress: string;
  fullName: string;
  country: string;
  dateOfBirth: string | null;
  docType: string;
  docNumberMasked: string;
  requestedTier: string;
  status: KycStatusValue;
  reviewerNote: string | null;
  reviewedBy: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface KycStatusDTO {
  walletAddress: string;
  verified: boolean;
  kycTier: string;
  verifiedAt: string | null;
  application: KycApplicationDTO | null;
}
