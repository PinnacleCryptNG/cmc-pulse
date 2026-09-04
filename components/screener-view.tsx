import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatType, formatUsd } from "@/lib/cmc/format";
import type { ScreenerResult } from "@/lib/cmc/types";
import { screenerHref } from "@/lib/search-params";

const SUGGESTED = ["NVDA", "GOLD", "SPCX", "TLT"] as const;

export function ScreenerView({ data }: { data: ScreenerResult }) {
  const current = {
    q: data.query || undefined,
    type: data.assetType,
    sort: data.sort,
    dir: data.sortDir,
    start: String(data.start),
  };
  const nextStart = data.start + data.limit;
  const prevStart = Math.max(1, data.start - data.limit);
  const visibleTypes = data.typeCounts.filter(
    (item) => item.type === "all" || item.count !== 0 || data.assetType === item.type,
  );

  return (
    <div className="flex flex-col gap-4">
      {!data.query ? (
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">Underlier desk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search a ticker. Open the underlier. Compare every issuer token to the
            average tokenized price. That is the product.
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Results for {data.query}
          </h1>
          <p className="text-sm text-muted-foreground">
            CMC lookup is ticker, slug, or rwa_id — not a company-name search.
          </p>
        </div>
      )}

      <form className="flex flex-col gap-2 sm:flex-row" action="/" method="get">
        {data.assetType !== "all" ? (
          <input type="hidden" name="type" value={data.assetType} />
        ) : null}
        {data.sort !== "rwa_rank" ? (
          <input type="hidden" name="sort" value={data.sort} />
        ) : null}
        {data.sortDir !== "asc" ? (
          <input type="hidden" name="dir" value={data.sortDir} />
        ) : null}
        <input
          name="q"
          defaultValue={data.query}
          placeholder="NVDA, GOLD, SPCX, TLT, or an rwa_id"
          aria-label="Search underliers"
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          className="inline-flex h-8 shrink-0 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Try</span>
        {SUGGESTED.map((ticker) => (
          <Link
            key={ticker}
            href={`/?q=${ticker}`}
            className={`rounded-full border px-2.5 py-0.5 font-mono text-xs hover:bg-muted ${
              data.query.toUpperCase() === ticker ? "bg-foreground text-background" : ""
            }`}
          >
            {ticker}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTypes.map((item) => {
          const selected = data.assetType === item.type;
          return (
            <Link
              key={item.type}
              href={screenerHref(current, { type: item.type, start: "1" })}
              className={`rounded-full border px-3 py-1 text-sm ${
                selected ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              {item.label}
              {item.count !== null ? (
                <span className="ml-1 font-mono text-xs opacity-70">
                  {item.count.toLocaleString("en-US")}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {data.assets.length === 0 ? (
        <div className="rounded-xl border p-8 text-sm text-muted-foreground">
          No underliers matched <span className="font-mono">{data.query || "this filter"}</span>.
          Try NVDA, GOLD, or SPCX.
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {data.totalSize.toLocaleString("en-US")} matching · click a column to sort ·{" "}
            GET /v5/real-world-assets/assets/list
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortLink current={current} field="rwa_rank" label="#" defaultDir="asc" />
                </TableHead>
                <TableHead>Underlier</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="text-right">
                  <SortLink
                    current={current}
                    field="average_tokenized_price"
                    label="Tokenized price"
                    defaultDir="desc"
                  />
                </TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  <SortLink
                    current={current}
                    field="tokenized_market_cap"
                    label="Mcap"
                    defaultDir="desc"
                  />
                </TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  <SortLink
                    current={current}
                    field="tokenized_volume_24h"
                    label="24h vol"
                    defaultDir="desc"
                  />
                </TableHead>
                <TableHead className="hidden sm:table-cell">Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.assets.map((asset) => (
                <TableRow key={asset.rwaId}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {asset.rwaRank ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/asset/${asset.rwaId}`} className="font-medium hover:underline">
                      {asset.name}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">
                      {asset.symbol}
                      <span className="hidden sm:inline"> · rwa_id {asset.rwaId}</span>
                    </div>
                    <div className="mt-1 font-mono text-xs md:hidden">
                      {formatUsd(asset.quote.volume24h, { compact: true })} vol
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{formatType(asset.assetType)}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatUsd(asset.quote.price)}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono md:table-cell">
                    {formatUsd(asset.quote.marketCap, { compact: true })}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono md:table-cell">
                    {formatUsd(asset.quote.volume24h, { compact: true })}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {asset.hasTokens ? "Yes" : asset.hasTokens === false ? "None" : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between">
            {data.start > 1 ? (
              <Link
                href={screenerHref(current, { start: String(prevStart) })}
                className="inline-flex h-7 items-center rounded-lg border px-2.5 text-sm hover:bg-muted"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            {data.hasMore ? (
              <Link
                href={screenerHref(current, { start: String(nextStart) })}
                className="inline-flex h-7 items-center rounded-lg border px-2.5 text-sm hover:bg-muted"
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SortLink({
  current,
  field,
  label,
  defaultDir,
}: {
  current: {
    q?: string;
    type: string;
    sort: string;
    dir: string;
    start: string;
  };
  field: string;
  label: string;
  defaultDir: "asc" | "desc";
}) {
  const active = current.sort === field;
  const nextDir = active ? (current.dir === "asc" ? "desc" : "asc") : defaultDir;
  const marker = active ? (current.dir === "asc" ? " ↑" : " ↓") : "";
  return (
    <Link
      href={screenerHref(current, { sort: field, dir: nextDir, start: "1" })}
      className={active ? "text-foreground" : "hover:text-foreground"}
    >
      {label}
      {marker}
    </Link>
  );
}
