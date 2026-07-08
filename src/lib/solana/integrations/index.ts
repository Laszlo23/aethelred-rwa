export interface DeFiIntegration {
  name: string;
  description: string;
  status: "planned" | "active";
}

export const DEFI_INTEGRATIONS: DeFiIntegration[] = [
  { name: "Meteora", description: "EURO liquidity pools", status: "planned" },
  { name: "Kamino", description: "Collateral lending markets", status: "active" },
  { name: "Drift", description: "RWA perpetual markets", status: "active" },
  { name: "Jupiter", description: "EURO swap routing", status: "planned" },
];

export { depositToKamino, repayKaminoPosition, withdrawKaminoCollateral, getKaminoHealthFactor } from "./kamino";
export { openDriftPerp, closeDriftPerp, fetchDriftMarketStats, getDriftIndexPrice } from "./drift";
