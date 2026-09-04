import Link from "next/link";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { WatchlistButton } from "@/components/watchlist-button";
import { EmptyState, PageHeader, Pager, TextLink } from "@/components/desk-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

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
  const rangeStart = data.assets.length === 0 ? 0 : data.start;
  const rangeEnd = data.assets.length === 0 ? 0 : data.start + data.assets.length - 1;
  const showChange = data.assets.some((asset) => asset.quote.percentChange24h !== null);

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-3" aria-labelledby="universe-heading">
        <PageHeader
          id="universe-heading"
          kicker="RWA Explorer"
          title={data.query ? `Results for ${data.query}` : "Underlier universe"}
          description={
            <>
              Search the real asset, not the wrapper. CMC lookup is ticker, slug, or{" "}
              <span className="font-mono">rwa_id</span> — not a company-name search.
            </>
          }
        />

        <form className="flex flex-col gap-2 sm:flex-row" action="/explore" method="get">
          {data.assetType !== "all" ? (
            <input type="hidden" name="type" value={data.assetType} />
          ) : null}
          {data.sort !== "rwa_rank" ? (
            <input type="hidden" name="sort" value={data.sort} />
          ) : null}
          {data.sortDir !== "asc" ? (
            <input type="hidden" name="dir" value={data.sortDir} />
          ) : null}
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              name="q"
              defaultValue={data.query}
              placeholder="NVDA, GOLD, SPCX, TLT, or an rwa_id"
              aria-label="Search underliers"
              className="pl-8"
            />
          </div>
          <Button type="submit">Look up</Button>
        </form>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="uppercase tracking-[0.12em] text-muted-foreground">Examples</span>
          {SUGGESTED.map((ticker) => (
            <Link
              key={ticker}
              href={`/explore?q=${ticker}`}
              className={cn(
                "font-mono hover:text-mark",
                data.query.toUpperCase() === ticker ? "text-mark" : "text-muted-foreground",
              )}
            >
              {ticker}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-1 border-b border-border">
          {visibleTypes.map((item) => {
            const selected = data.assetType === item.type;
            return (
              <Link
                key={item.type}
                href={screenerHref(current, { type: item.type, start: "1" })}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-2.5 py-1.5 text-[13px]",
                  selected
                    ? "border-mark text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {item.count !== null ? (
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {item.count.toLocaleString("en-US")}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {data.assets.length === 0 ? (
          <EmptyUniverse query={data.query} />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-[11px] text-muted-foreground">
              <p>
                Showing{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {rangeStart.toLocaleString("en-US")}–{rangeEnd.toLocaleString("en-US")}
                </span>
                {data.query || data.assetType !== "all" ? (
                  <>
                    {" of "}
                    <span className="font-mono tabular-nums">
                      {data.totalSize.toLocaleString("en-US")}
                    </span>
                    {" matching this lookup"}
                  </>
                ) : null}
              </p>
              <p className="hidden sm:block">Click a column to sort.</p>
            </div>
            <Table sticky>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <SortLink current={current} field="rwa_rank" label="#" defaultDir="asc" />
                  </TableHead>
                  <TableHead>Underlier</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Tokenized</TableHead>
                  <TableHead className="text-right">
                    <SortLink
                      current={current}
                      field="average_tokenized_price"
                      label="Tokenized px"
                      defaultDir="desc"
                    />
                  </TableHead>
                  {showChange ? (
                    <TableHead className="hidden text-right md:table-cell">24h</TableHead>
                  ) : null}
                  <TableHead className="hidden text-right lg:table-cell">
                    <SortLink
                      current={current}
                      field="tokenized_market_cap"
                      label="Mkt cap"
                      defaultDir="desc"
                    />
                  </TableHead>
                  <TableHead className="hidden text-right lg:table-cell">
                    <SortLink
                      current={current}
                      field="tokenized_volume_24h"
                      label="24h vol"
                      defaultDir="desc"
                    />
                  </TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Watchlist</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.assets.map((asset) => (
                  <TableRow key={asset.rwaId} className="relative">
                    <TableCell className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {asset.rwaRank ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <Link
                        href={`/asset/${asset.rwaId}`}
                        className="after:absolute after:inset-0"
                      >
                        <span className="font-medium">{asset.name}</span>
                        <span className="sr-only"> Open asset desk</span>
                      </Link>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {asset.symbol}
                        <span className="sm:hidden">
                          {" · "}
                          {formatType(asset.assetType)}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground md:hidden">
                        {formatUsd(asset.quote.volume24h, { compact: true })} vol
                        {asset.hasTokens
                          ? " · Tokenized"
                          : asset.hasTokens === false
                            ? " · Not tokenized"
                            : ""}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-[11px] uppercase tracking-[0.08em] text-muted-foreground sm:table-cell">
                      {formatType(asset.assetType)}
                    </TableCell>
                    <TableCell className="hidden text-[12px] md:table-cell">
                      {asset.hasTokens ? (
                        <span>Yes</span>
                      ) : asset.hasTokens === false ? (
                        <span className="text-muted-foreground">No</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatUsd(asset.quote.price)}
                    </TableCell>
                    {showChange ? (
                      <TableCell
                        className={cn(
                          "hidden text-right font-mono tabular-nums md:table-cell",
                          changeClass(asset.quote.percentChange24h),
                        )}
                      >
                        {formatPct(asset.quote.percentChange24h)}
                      </TableCell>
                    ) : null}
                    <TableCell className="hidden text-right font-mono tabular-nums lg:table-cell">
                      {formatUsd(asset.quote.marketCap, { compact: true })}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono tabular-nums lg:table-cell">
                      {formatUsd(asset.quote.volume24h, { compact: true })}
                    </TableCell>
                    <TableCell className="relative z-10 w-10 text-right">
                      <WatchlistButton
                        rwaId={asset.rwaId}
                        name={asset.name}
                        symbol={asset.symbol}
                        assetType={String(asset.assetType)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pager
              prevHref={data.start > 1 ? screenerHref(current, { start: String(prevStart) }) : null}
              nextHref={data.hasMore ? screenerHref(current, { start: String(nextStart) }) : null}
            />
          </>
        )}
      </section>
    </div>
  );
}

function EmptyUniverse({ query }: { query: string }) {
  return (
    <EmptyState
      title="No underliers in this view"
      actions={
        <>
          <TextLink href="/explore">Reset universe</TextLink>
          <TextLink href="/explore?q=NVDA">Open NVDA</TextLink>
        </>
      }
    >
      {query ? (
        <>
          Nothing matched <span className="font-mono text-foreground">{query}</span>. Try a
          ticker such as NVDA, GOLD, or SPCX.
        </>
      ) : (
        <>This filter returned an empty book. Clear it, or try NVDA, GOLD, or SPCX.</>
      )}
    </EmptyState>
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
  return (
    <Link
      href={screenerHref(current, { sort: field, dir: nextDir, start: "1" })}
      className={cn(
        "inline-flex items-center gap-0.5 uppercase",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {active ? (
        current.dir === "asc" ? (
          <ArrowUp className="size-3" aria-hidden />
        ) : (
          <ArrowDown className="size-3" aria-hidden />
        )
      ) : null}
    </Link>
  );
}

function changeClass(value: number | null) {
  if (value === null || !Number.isFinite(value) || value === 0) {
    return "text-muted-foreground";
  }
  return value > 0 ? "text-up" : "text-down";
}
