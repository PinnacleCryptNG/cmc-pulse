"use client";

import Link from "next/link";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import type { CallEvidence, DataSource } from "@/lib/cmc/types";
import { cn } from "@/lib/utils";

export function SiteHeader({
  evidence,
  source,
}: {
  evidence: CallEvidence[];
  source: DataSource;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 leading-tight">
          <DeskMark />
          <span>
            <span className="block text-[13px] font-semibold tracking-[0.16em] uppercase">
              Underlier Desk
            </span>
            <span className="hidden text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:block">
              RWA intelligence
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
            title={
              source === "live"
                ? "Serving live CoinMarketCap RWA endpoints"
                : "Serving checked-in fixture responses"
            }
          >
            <span
              className={cn(
                "mr-1.5 inline-block size-1.5 align-middle",
                source === "live" ? "bg-up" : "bg-muted-foreground/50",
              )}
              aria-hidden
            />
            {source === "live" ? "Live" : "Fixture"}
          </span>
          {evidence.length > 0 ? <EvidenceDrawer evidence={evidence} /> : null}
        </div>
      </div>
    </header>
  );
}

function DeskMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0 text-foreground">
      <path fill="currentColor" fillOpacity="0.92" d="M2 3.2h6.5v2.1H2zM9.5 3.2H16v2.1H9.5zM2 7.95h4.2v2.1H2zM7.2 7.95H16v2.1H7.2zM2 12.7h8.5v2.1H2zM12.5 12.7H16v2.1h-3.5z" />
    </svg>
  );
}
