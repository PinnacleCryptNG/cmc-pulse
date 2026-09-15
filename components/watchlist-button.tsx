"use client";

import { useSyncExternalStore } from "react";
import {
  isOnWatchlist,
  subscribeWatchlist,
  toggleWatchlist,
} from "@/lib/watchlist";
import { cn } from "@/lib/utils";

export function WatchlistButton({
  rwaId,
  name,
  symbol,
  assetType,
}: {
  rwaId: number;
  name: string;
  symbol: string;
  assetType: string;
}) {
  const saved = useSyncExternalStore(
    subscribeWatchlist,
    () => isOnWatchlist(rwaId),
    () => false,
  );

  function onToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    toggleWatchlist({ rwaId, name, symbol, assetType });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${symbol} from watchlist` : `Save ${symbol} to watchlist`}
      className={cn(
        "relative z-10 inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground",
        saved && "text-up",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
      </svg>
    </button>
  );
}
