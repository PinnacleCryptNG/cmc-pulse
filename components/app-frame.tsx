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
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader evidence={evidence} source={source} />
      <main className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-5 px-3 py-5 sm:px-5">
        <StatusBanner source={source} warning={warning} />
        {children}
      </main>
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-0.5 px-3 py-2.5 text-[10px] leading-relaxed tracking-wide text-muted-foreground sm:px-4 sm:flex-row sm:items-baseline sm:justify-between">
          <p>
            Underlier Desk · Real World Assets ·{" "}
            <span className="font-mono">/v5/real-world-assets/*</span>
            {source === "live"
              ? " · pro-api.coinmarketcap.com"
              : " · fixture payloads"}
          </p>
          <p>
            Tickers collide. Resolve <span className="font-mono">rwa_id</span>, then
            compare each issuer token to the average tokenized price.
          </p>
        </div>
      </footer>
    </div>
  );
}
