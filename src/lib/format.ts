export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatEuroCompact(cents: number): string {
  const euros = cents / 100;
  if (euros >= 1_000_000) return `€${(euros / 1_000_000).toFixed(2)}M`;
  if (euros >= 1_000) return `€${(euros / 1_000).toFixed(0)}K`;
  return formatEuro(cents);
}

export function formatPercent(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 1) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatUsdc(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatPropertyClass(propertyClass: string): string {
  return propertyClass.charAt(0).toUpperCase() + propertyClass.slice(1);
}

export function computeAvailableLiquidity(valueCents: number, debtCents: number): number {
  const maxMint = Math.floor(valueCents / 1.5);
  return Math.max(0, maxMint - debtCents);
}
