export const MAX_LTV_BPS = 5000;
export const PROTOCOL_SPREAD_BPS = 80;

export function computeLendingApyBps(assetYieldBps: number): number {
  return Math.max(100, assetYieldBps - PROTOCOL_SPREAD_BPS);
}

export function maxPrincipalCents(
  assetValueCents: number,
  collateralShareBps: number,
): number {
  const collateralValue = Math.floor((assetValueCents * collateralShareBps) / 10000);
  return Math.floor((collateralValue * MAX_LTV_BPS) / 10000);
}
