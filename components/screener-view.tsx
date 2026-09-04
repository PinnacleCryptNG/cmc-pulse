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
import { formatPct, formatType, formatUsd } from "@/lib/cmc/format";
import type { ScreenerResult } from "@/lib/cmc/types";
import { screenerHref } from "@/lib/search-params";

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

  return (
    <div className="flex flex-col gap-4">
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
          placeholder="Search ticker, slug, or rwa_id — NVDA, GOLD, SPCX"
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

      <div className="flex flex-wrap gap-2">
        {data.typeCounts.map((item) => {
          const href = screenerHref(current, {
            type: item.type,
            start: "1",
          });
          const selected = data.assetType === item.type;
          return (
            <Link
              key={item.type}
              href={href}
              className={`rounded-full border px-3 py-1 text-sm ${
                selected ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              {item.label}
              {item.count !== null ? (
                <span className="ml-1 font-mono text-xs opacity-70">{item.count}</span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {data.assets.length === 0 ? (
        <div className="rounded-xl border p-8 text-sm text-muted-foreground">
          No underliers matched. CMC search is ticker, slug, or rwa_id — not free
          text company names.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              {data.totalSize} matching · sort{" "}
              <Link className="underline" href={screenerHref(current, { sort: "rwa_rank", start: "1" })}>
                rank
              </Link>
              {" · "}
              <Link
                className="underline"
                href={screenerHref(current, {
                  sort: "tokenized_market_cap",
                  dir: "desc",
                  start: "1",
                })}
              >
                tokenized mcap
              </Link>
              {" · "}
              <Link
                className="underline"
                href={screenerHref(current, {
                  sort: "tokenized_volume_24h",
                  dir: "desc",
                  start: "1",
                })}
              >
                24h volume
              </Link>
            </p>
            <p>
              {data.pathUsed === "assets-list"
                ? "GET /v5/real-world-assets/assets/list"
                : data.pathUsed}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Underlier</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="text-right">Tokenized price</TableHead>
                <TableHead className="hidden text-right md:table-cell">Mcap</TableHead>
                <TableHead className="hidden text-right md:table-cell">24h vol</TableHead>
                <TableHead className="text-right">24h</TableHead>
                <TableHead>Tokens</TableHead>
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
                      {asset.symbol} · rwa_id {asset.rwaId}
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
                  <TableCell
                    className={`text-right font-mono ${
                      (asset.quote.percentChange24h ?? 0) < 0
                        ? "text-destructive"
                        : (asset.quote.percentChange24h ?? 0) > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : ""
                    }`}
                  >
                    {formatPct(asset.quote.percentChange24h)}
                  </TableCell>
                  <TableCell>
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
