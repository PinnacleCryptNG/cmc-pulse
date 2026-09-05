"use client";

import { useSyncExternalStore } from "react";
import { Star } from "lucide-react";
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
      <Star className={cn("size-3.5", saved && "fill-current")} aria-hidden />
    </button>
  );
}
