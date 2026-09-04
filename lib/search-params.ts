import type { AssetType } from "@/lib/cmc/types";

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
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
  if (next.type && next.type !== "all") params.set("type", next.type);
  if (next.sort && next.sort !== "rwa_rank") params.set("sort", next.sort);
  if (next.dir && next.dir !== "asc") params.set("dir", next.dir);
  if (next.start && next.start !== "1") params.set("start", next.start);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
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
