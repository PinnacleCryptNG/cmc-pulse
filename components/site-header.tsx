"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import type { CallEvidence, DataSource } from "@/lib/cmc/types";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Overview", match: (path: string) => path === "/" },
  { href: "/explore", label: "Explorer", match: (path: string) => path.startsWith("/explore") },
  { href: "/classes", label: "Classes", match: (path: string) => path.startsWith("/classes") },
  { href: "/watchlist", label: "Watchlist", match: (path: string) => path.startsWith("/watchlist") },
  { href: "/issuers", label: "Issuers", match: (path: string) => path.startsWith("/issuer") },
] as const;

export function SiteHeader({
  evidence,
  source,
}: {
  evidence: CallEvidence[];
  source: DataSource;
}) {
  const pathname = usePathname();

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
            The real asset behind every tokenized stock, treasury, and commodity.
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-1 text-sm"
          aria-label="Primary"
        >
          {LINKS.map((link) => {
            const current = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-1",
                  current
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
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
          {evidence.length > 0 ? <EvidenceDrawer evidence={evidence} /> : null}
        </nav>
      </div>
    </header>
  );
}
