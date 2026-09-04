import Link from "next/link";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import type { CallEvidence, DataSource } from "@/lib/cmc/types";

export function SiteHeader({
  evidence,
  source,
}: {
  evidence: CallEvidence[];
  source: DataSource;
}) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Underlier
          </Link>
          <p className="text-sm text-muted-foreground">
            The real asset behind every tokenized stock, treasury, and commodity.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="rounded-md px-2 py-1 hover:bg-muted">
            Screener
          </Link>
          <Link href="/issuers" className="rounded-md px-2 py-1 hover:bg-muted">
            Issuers
          </Link>
          <span className="rounded-md border px-2 py-1 font-mono text-xs">
            {source === "live" ? "Live CMC" : "Fixture data"}
          </span>
          <EvidenceDrawer evidence={evidence} />
        </nav>
      </div>
    </header>
  );
}
