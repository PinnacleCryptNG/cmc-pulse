"use client";

import Link from "next/link";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import type { CallEvidence, DataSource } from "@/lib/cmc/types";
import { cn } from "@/lib/utils";

export function SiteHeader({ evidence, source }: { evidence: CallEvidence[]; source: DataSource }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 leading-tight">
          <DeskMark />
          <span className="block text-[13px] font-semibold tracking-[0.16em] uppercase">UnderScope</span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
            title={source === "live" ? "Serving live CoinMarketCap RWA endpoints" : "Serving checked-in fixture responses"}
          >
            <span className={cn("mr-1.5 inline-block size-1.5 align-middle", source === "live" ? "bg-up" : "bg-muted-foreground/50")} aria-hidden />
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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path d="M3.25 3.25v9.5a4 4 0 0 0 4 4h5.5a4 4 0 0 0 4-4v-9.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.75 3.25h8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="8" r="1.7" fill="var(--up)" />
      <path d="M10 9.7v3.2" stroke="var(--up)" strokeWidth="1.5" />
    </svg>
  );
}
