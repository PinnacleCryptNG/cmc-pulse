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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-5">
        <StatusBanner source={source} warning={warning} />
        {children}
      </main>
      <footer className="mt-auto border-t border-border/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 text-[11px] text-muted-foreground">
          <p>
            Underlier Desk · Real World Assets ·{" "}
            <span className="font-mono">/v5/real-world-assets/*</span>
            {source === "live"
              ? " · pro-api.coinmarketcap.com"
              : " · fixture payloads until a key is set"}
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
