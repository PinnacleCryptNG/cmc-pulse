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
        <AlertTitle>Fixture mode</AlertTitle>
        <AlertDescription>
          No <code>CMC_API_KEY</code> is set. The desk is serving checked-in
          responses so the underlier join still runs. Add a key to{" "}
          <code>.env.local</code> to read live CoinMarketCap RWA endpoints.
        </AlertDescription>
      </Alert>
    );
  }

  if (warning) {
    const planLimited = warning.toLowerCase().includes("not on this cmc plan");
    return (
      <Alert variant={planLimited ? "default" : "destructive"}>
        <AlertTitle>{planLimited ? "Plan limit" : "CMC response issue"}</AlertTitle>
        <AlertDescription>{warning}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
