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
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 leading-tight">
          <DeskMark />
          <span>
            <span className="block text-[13px] font-semibold tracking-[0.16em] uppercase">
              Underlier Desk
            </span>
            <span className="hidden text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:block">
              RWA research
            </span>
          </span>
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
                    ? "border-up text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden
      className="shrink-0 text-foreground"
    >
      <path
        fill="currentColor"
        fillOpacity="0.92"
        d="M9 1.4 16.1 5.1v7.8L9 16.6 1.9 12.9V5.1L9 1.4Z"
      />
      <path fill="var(--background)" fillOpacity="0.45" d="M9 1.4 16.1 5.1 9 8.8 1.9 5.1 9 1.4Z" />
      <path
        fill="none"
        stroke="var(--background)"
        strokeOpacity="0.55"
        strokeWidth="0.7"
        d="M9 8.8V16.6M1.9 5.1 9 8.8l7.1-3.7"
      />
    </svg>
  );
}
