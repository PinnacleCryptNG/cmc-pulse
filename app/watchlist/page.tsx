import { AppFrame } from "@/components/app-frame";
import { WatchlistView } from "@/components/watchlist-view";
import { hasLiveKey } from "@/lib/cmc/client";

export const dynamic = "force-dynamic";

export default function WatchlistPage() {
  return (
    <AppFrame
      evidence={[]}
      source={hasLiveKey() ? "live" : "fixture"}
      warning={null}
    >
      <WatchlistView />
    </AppFrame>
  );
}
