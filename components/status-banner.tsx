import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { liveKeyConfigured } from "@/lib/cmc/client";

export function StatusBanner({
  source,
  warning,
}: {
  source: "live" | "fixture";
  warning: string | null;
}) {
  const hasKey = liveKeyConfigured();
  if (source === "live" && !warning) return null;

  if (!hasKey) {
    return (
      <Alert>
        <AlertTitle>Waiting on a CoinMarketCap API key</AlertTitle>
        <AlertDescription>
          Underlier is running on checked-in fixture responses so the join still
          works. Put <code>CMC_API_KEY</code> in <code>.env.local</code> to make
          live calls to <code>pro-api.coinmarketcap.com</code>. No database and no
          AI model.
        </AlertDescription>
      </Alert>
    );
  }

  if (warning) {
    return (
      <Alert variant="destructive">
        <AlertTitle>CMC response issue</AlertTitle>
        <AlertDescription>{warning}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
