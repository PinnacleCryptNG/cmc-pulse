export type WatchlistItem = {
  rwaId: number;
  name: string;
  symbol: string;
  assetType: string;
  savedAt: string;
};

const KEY = "underlier-watchlist-v1";
const listeners = new Set<() => void>();
let cached: WatchlistItem[] | null = null;

export function subscribeWatchlist(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

function emit() {
  for (const listener of listeners) listener();
}

export function readWatchlist(): WatchlistItem[] {
  if (cached) return cached;
  if (typeof window === "undefined") {
    cached = [];
    return cached;
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      cached = [];
      return cached;
    }
    const parsed: unknown = JSON.parse(raw);
    cached = Array.isArray(parsed) ? parsed.filter(isWatchlistItem) : [];
  } catch {
    cached = [];
  }
  return cached;
}

export function writeWatchlist(items: WatchlistItem[]) {
  cached = items;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

export function isOnWatchlist(rwaId: number): boolean {
  return readWatchlist().some((item) => item.rwaId === rwaId);
}

export function toggleWatchlist(item: Omit<WatchlistItem, "savedAt">): WatchlistItem[] {
  const current = readWatchlist();
  const exists = current.some((row) => row.rwaId === item.rwaId);
  const next = exists
    ? current.filter((row) => row.rwaId !== item.rwaId)
    : [{ ...item, savedAt: new Date().toISOString() }, ...current];
  writeWatchlist(next);
  return next;
}

function isWatchlistItem(value: unknown): value is WatchlistItem {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.rwaId === "number" &&
    typeof row.name === "string" &&
    typeof row.symbol === "string" &&
    typeof row.assetType === "string"
  );
}
