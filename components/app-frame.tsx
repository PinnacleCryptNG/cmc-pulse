import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import type { CallEvidence, DataSource } from "@/lib/cmc/types";

export function AppFrame({
  evidence,
  source,
  warning,
  children,
}: {
  evidence: CallEvidence[];
  source: DataSource;
  warning: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader evidence={evidence} source={source} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        <StatusBanner source={source} warning={warning} />
        {children}
      </main>
      <footer className="mt-auto border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground">
          <p>
            Track: Real World Assets. Live reads from{" "}
            <span className="font-mono">/v5/real-world-assets/*</span>
            {source === "live" ? " against pro-api.coinmarketcap.com." : " via fixtures until a key is set."}
          </p>
          <p>
            Tickers collide. Resolve <span className="font-mono">rwa_id</span>, then compare each
            issuer token to the average tokenized price.
          </p>
        </div>
      </footer>
    </div>
  );
}
