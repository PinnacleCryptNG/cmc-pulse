import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ASSET_TYPES } from "@/lib/cmc/types";
import { TYPE_LABELS } from "@/lib/cmc/parse";
import type { TypeCount } from "@/lib/cmc/types";
import { formatInt } from "@/lib/cmc/format";

const CLASS_BLURB: Record<(typeof ASSET_TYPES)[number], string> = {
  stock: "Public equities CMC lists as underliers.",
  commodity: "Metals and other commodities with tokenized wrappers.",
  currency: "FX underliers when CMC assigns type currency.",
  government_security: "Treasuries and government paper. Many show up as ETFs instead.",
  etf: "Funds and ETF underliers, including some treasury products.",
  real_estate: "Property underliers when CMC assigns type real_estate.",
};

export function ClassesView({ counts }: { counts: TypeCount[] }) {
  const byType = new Map(counts.map((row) => [row.type, row]));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Taxonomy
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Asset classes</h1>
        </div>
        <p className="max-w-xl text-xs text-muted-foreground sm:text-right">
          CoinMarketCap RWA types from{" "}
          <span className="font-mono">/map</span>. Private credit and infrastructure
          are not in this API.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {ASSET_TYPES.map((type) => {
          const row = byType.get(type);
          const count = row?.count ?? null;
          const empty = count === 0;
          return (
            <li key={type} className="border border-border/80 p-4">
              <h2 className="text-lg font-semibold tracking-tight">{TYPE_LABELS[type]}</h2>
              <p className="mt-1 font-mono text-sm tabular-nums">
                {formatInt(count)} underliers
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{CLASS_BLURB[type]}</p>
              {empty ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  None in the current map pull.
                </p>
              ) : (
                <Link
                  href={`/explore?type=${type}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm underline underline-offset-4"
                >
                  Open in explorer
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
