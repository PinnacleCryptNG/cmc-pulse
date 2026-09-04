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
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="h-px bg-mark" aria-hidden />
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link
            href="/"
            className="text-[13px] font-semibold tracking-[0.14em] uppercase focus-visible:outline-none"
          >
            Underlier Desk
          </Link>
          <p className="hidden truncate text-[11px] text-muted-foreground md:block">
            Tokenized RWA research
          </p>
        </div>
        <nav
          className="-mx-1 flex flex-wrap items-center gap-x-0.5 overflow-x-auto text-[13px]"
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
                  "border-b-2 px-2 py-1.5 focus-visible:outline-none",
                  current
                    ? "border-mark text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <span
            className="ml-2 inline-flex items-center gap-1.5 border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase"
            title={
              source === "live"
                ? "Serving live CoinMarketCap RWA endpoints"
                : "Serving checked-in fixture responses"
            }
          >
            <span
              className={cn("size-1.5", source === "live" ? "bg-mark" : "bg-muted-foreground/70")}
              aria-hidden
            />
            {source === "live" ? "Live" : "Fixture"}
          </span>
          {evidence.length > 0 ? <EvidenceDrawer evidence={evidence} /> : null}
        </nav>
      </div>
    </header>
  );
}
