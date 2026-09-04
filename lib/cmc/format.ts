const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatUsd(value: number | null, opts?: { compact?: boolean }): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (opts?.compact || Math.abs(value) >= 1_000_000) {
    return `$${compact.format(value)}`;
  }
  if (Math.abs(value) >= 1) return usd.format(value);
  return `$${value.toPrecision(4)}`;
}

export function formatPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatInt(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatType(value: string): string {
  return value.replaceAll("_", " ");
}
