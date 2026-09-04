import type { AssetType } from "./cmc/types";

export const SCREENER_SORTS = [
  "rwa_rank",
  "average_tokenized_price",
  "tokenized_market_cap",
  "tokenized_volume_24h",
] as const;

export type ScreenerSort = (typeof SCREENER_SORTS)[number];

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseSortParam(value: string | undefined): ScreenerSort {
  if (value && (SCREENER_SORTS as readonly string[]).includes(value)) {
    return value as ScreenerSort;
  }
  return "rwa_rank";
}

export function parseSortDir(value: string | undefined): "asc" | "desc" {
  return value === "desc" ? "desc" : "asc";
}

export function isRwaIdParam(value: string): boolean {
  return /^\d{1,12}$/.test(value);
}

export function isIssuerIdParam(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}

export function screenerHref(
  current: {
    q?: string;
    type?: string;
    sort?: string;
    dir?: string;
    start?: string;
  },
  patch: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  const next = { ...current, ...patch };
  if (next.q) params.set("q", next.q);
  const type = parseAssetTypeParam(next.type);
  if (type !== "all") params.set("type", type);
  const sort = parseSortParam(next.sort);
  if (sort !== "rwa_rank") params.set("sort", sort);
  const dir = parseSortDir(next.dir);
  if (dir !== "asc") params.set("dir", dir);
  if (next.start && next.start !== "1") params.set("start", next.start);
  const qs = params.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

export function parseAssetTypeParam(value: string | undefined): AssetType | "all" {
  if (
    value === "stock" ||
    value === "commodity" ||
    value === "currency" ||
    value === "government_security" ||
    value === "etf" ||
    value === "real_estate"
  ) {
    return value;
  }
  return "all";
}
