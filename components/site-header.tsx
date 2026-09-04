"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const onDesk = pathname === "/" || pathname.startsWith("/asset/");
  const onIssuers = pathname.startsWith("/issuer");

  return (
    <header className="border-b border-border/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-[0.04em] uppercase"
          >
            Underlier Desk
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Research desk for tokenized real-world assets.
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-1 text-sm"
          aria-label="Desk"
        >
          <Link
            href="/"
            aria-current={onDesk ? "page" : undefined}
            className={cn(
              "rounded-md px-2 py-1",
              onDesk
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Desk
          </Link>
          <Link
            href="/issuers"
            aria-current={onIssuers ? "page" : undefined}
            className={cn(
              "rounded-md px-2 py-1",
              onIssuers
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Issuers
          </Link>
          <span
            className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-border/80 px-2 py-1 font-mono text-[11px] tracking-wide text-muted-foreground"
            title={
              source === "live"
                ? "Serving live CoinMarketCap RWA endpoints"
                : "Serving checked-in fixture responses"
            }
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                source === "live" ? "bg-emerald-500" : "bg-muted-foreground/70",
              )}
              aria-hidden
            />
            <span className="uppercase">
              {source === "live" ? "Live" : "Fixture"}
            </span>
          </span>
          <EvidenceDrawer evidence={evidence} />
        </nav>
      </div>
    </header>
  );
}
