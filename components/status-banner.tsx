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
  const fixtureBanner =
    source === "fixture" ? (
      <Alert>
        <AlertTitle>Fixture mode</AlertTitle>
        <AlertDescription>
          {hasKey ? (
            <>
              <code>CMC_USE_FIXTURES=1</code> is set. Live CoinMarketCap calls
              are skipped even though a key is configured.
            </>
          ) : (
            <>
              No <code>CMC_API_KEY</code> is set. The desk is serving checked-in
              responses so the underlier join still runs. Add a key to{" "}
              <code>.env.local</code> to read live CoinMarketCap RWA endpoints.
            </>
          )}
        </AlertDescription>
      </Alert>
    ) : null;

  const warningBanner = warning ? (
    <Alert
      variant={
        warning.toLowerCase().includes("not on this cmc plan") ||
        warning.toLowerCase().includes("no name-search")
          ? "default"
          : "destructive"
      }
    >
      <AlertTitle>
        {warning.toLowerCase().includes("not on this cmc plan")
          ? "Plan limit"
          : warning.toLowerCase().includes("no name-search")
            ? "How lookup works"
            : "CMC response issue"}
      </AlertTitle>
      <AlertDescription>{warning}</AlertDescription>
    </Alert>
  ) : null;

  if (!fixtureBanner && !warningBanner) return null;

  return (
    <div className="flex flex-col gap-2">
      {fixtureBanner}
      {warningBanner}
    </div>
  );
}
