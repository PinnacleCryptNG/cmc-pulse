"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import type { CallEvidence, DataSource } from "@/lib/cmc/types";
import { cn } from "@/lib/utils";

const LINKS = [
  {
    href: "/",
    label: "Desk",
    match: (path: string) =>
      path === "/" || path.startsWith("/explore") || path.startsWith("/asset/"),
  },
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
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
        <Link
          href="/"
          className="shrink-0 text-[13px] font-semibold tracking-[0.16em] uppercase"
        >
          Underlier Desk
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 text-[13px]" aria-label="Primary">
          {LINKS.map((link) => {
            const current = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "border-b-2 px-2 py-1.5",
                  current
                    ? "border-mark text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
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
