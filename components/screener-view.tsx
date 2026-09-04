import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import type { ScreenerResult, TypeCount } from "@/lib/cmc/types";
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
  const universe = data.typeCounts.find((item) => item.type === "all");
  const categories = data.typeCounts.filter(
    (item) => item.type !== "all" && (item.count ?? 0) > 0,
  );
  const tokenizedOnPage = data.assets.filter((asset) => asset.hasTokens).length;
  const rangeStart = data.assets.length === 0 ? 0 : data.start;
  const rangeEnd = data.assets.length === 0 ? 0 : data.start + data.assets.length - 1;
  const showChange = data.assets.some((asset) => asset.quote.percentChange24h !== null);

  return (
    <div className="flex flex-col gap-8">
      <MarketOverview
        universe={universe}
        categories={categories}
        listed={data.assets.length}
        tokenizedOnPage={tokenizedOnPage}
      />

      <section className="flex flex-col gap-3" aria-labelledby="universe-heading">
        <div className="flex flex-col gap-1 border-b border-border/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Underlier explorer
            </p>
            <h2 id="universe-heading" className="text-lg font-semibold tracking-tight">
              {data.query ? `Results for ${data.query}` : "Underlier Universe"}
            </h2>
          </div>
          <p className="max-w-lg text-xs text-muted-foreground sm:text-right">
            Search the real asset, not the wrapper. CMC lookup is ticker, slug, or{" "}
            <span className="font-mono">rwa_id</span> — not a company-name search.
          </p>
        </div>

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

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-muted-foreground">Examples</span>
          {SUGGESTED.map((ticker) => (
            <Link
              key={ticker}
              href={`/?q=${ticker}`}
              className={cn(
                "font-mono hover:text-foreground",
                data.query.toUpperCase() === ticker
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {ticker}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 border-y border-border/80 py-2">
          {visibleTypes.map((item) => {
            const selected = data.assetType === item.type;
            return (
              <Link
                key={item.type}
                href={screenerHref(current, { type: item.type, start: "1" })}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm",
                  selected
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
                {item.count !== null ? (
                  <span className="font-mono text-[11px] tabular-nums opacity-70">
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
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <p>
                <span className="tabular-nums text-foreground">
                  {rangeStart.toLocaleString("en-US")}–{rangeEnd.toLocaleString("en-US")}
                </span>
                {" of "}
                <span className="tabular-nums">
                  {data.totalSize.toLocaleString("en-US")}
                </span>
                {" matching underliers"}
              </p>
              <p>Click a column to sort.</p>
            </div>
            <Table className="text-[13px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-muted-foreground">
                    <SortLink current={current} field="rwa_rank" label="#" defaultDir="asc" />
                  </TableHead>
                  <TableHead>Underlier</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Tokenized</TableHead>
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
                  <TableHead className="hidden text-right md:table-cell">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.assets.map((asset) => (
                  <TableRow key={asset.rwaId} className="relative">
                    <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
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
                      <div className="font-mono text-xs text-muted-foreground">
                        {asset.symbol}
                        <span className="sm:hidden">
                          {" · "}
                          {formatType(asset.assetType)}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground md:hidden">
                        {formatUsd(asset.quote.volume24h, { compact: true })} vol
                        {asset.hasTokens ? " · Tokenized" : asset.hasTokens === false ? " · Not tokenized" : ""}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="font-normal capitalize">
                        {formatType(asset.assetType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">
                      {asset.hasTokens ? (
                        <span>Tokenized</span>
                      ) : asset.hasTokens === false ? (
                        <span className="text-muted-foreground">Not tokenized</span>
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
                    <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                      {formatUsd(asset.quote.marketCap, { compact: true })}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono tabular-nums lg:table-cell">
                      {formatUsd(asset.quote.volume24h, { compact: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between text-sm">
              {data.start > 1 ? (
                <Link
                  href={screenerHref(current, { start: String(prevStart) })}
                  className="inline-flex h-7 items-center rounded-md border border-border/80 px-2.5 hover:bg-muted"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {data.hasMore ? (
                <Link
                  href={screenerHref(current, { start: String(nextStart) })}
                  className="inline-flex h-7 items-center rounded-md border border-border/80 px-2.5 hover:bg-muted"
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function MarketOverview({
  universe,
  categories,
  listed,
  tokenizedOnPage,
}: {
  universe: TypeCount | undefined;
  categories: TypeCount[];
  listed: number;
  tokenizedOnPage: number;
}) {
  const total = universe?.count ?? null;
  const mixTotal = categories.reduce((sum, item) => sum + (item.count ?? 0), 0) || 1;

  return (
    <section aria-labelledby="market-heading">
      <div className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Market desk
          </p>
          <h1 id="market-heading" className="text-xl font-semibold tracking-tight">
            RWA Market
          </h1>
        </div>
        <p className="max-w-xl text-xs text-muted-foreground sm:text-right">
          What real-world asset is being tokenized, who is tokenizing it, and where
          it can be accessed.
        </p>
      </div>

      <div className="grid grid-cols-2 border-b border-border/80 md:grid-cols-4">
        <OverviewStat label="Tracked universe" className="border-b border-border/80 md:border-r md:border-b-0">
          <span className="font-mono text-lg tabular-nums tracking-tight">
            {total === null ? "—" : total.toLocaleString("en-US")}
          </span>
          <span className="text-xs text-muted-foreground">underliers</span>
        </OverviewStat>
        <OverviewStat label="Tokenized on this page" className="border-b border-border/80 md:border-r md:border-b-0">
          <span className="font-mono text-lg tabular-nums tracking-tight">
            {listed === 0 ? "—" : `${tokenizedOnPage.toLocaleString("en-US")}`}
          </span>
          <span className="text-xs text-muted-foreground">
            {listed === 0 ? "no rows" : `of ${listed.toLocaleString("en-US")} listed`}
          </span>
        </OverviewStat>
        <div className="col-span-2 flex flex-col gap-2 py-3 md:px-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Asset categories
          </p>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No category mix returned.</p>
          ) : (
            <>
              <div
                className="flex h-1.5 overflow-hidden rounded-sm bg-muted"
                role="img"
                aria-label="Asset category distribution"
              >
                {categories.map((item, index) => (
                  <div
                    key={item.type}
                    className={cn(
                      "h-full",
                      index === 0
                        ? "bg-foreground/80"
                        : index === 1
                          ? "bg-foreground/45"
                          : index === 2
                            ? "bg-foreground/25"
                            : "bg-foreground/12",
                    )}
                    style={{ width: `${((item.count ?? 0) / mixTotal) * 100}%` }}
                    title={`${item.label} ${(item.count ?? 0).toLocaleString("en-US")}`}
                  />
                ))}
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {categories.map((item) => (
                  <li key={item.type} className="flex items-baseline gap-1.5">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-mono tabular-nums">
                      {(item.count ?? 0).toLocaleString("en-US")}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function OverviewStat({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 py-3 md:px-4", className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-baseline gap-2">{children}</div>
    </div>
  );
}

function EmptyUniverse({ query }: { query: string }) {
  return (
    <div className="border border-dashed border-border/80 px-4 py-12 text-center">
      <p className="text-sm font-medium">No underliers in this view</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {query ? (
          <>
            Nothing matched <span className="font-mono text-foreground">{query}</span>.
            Try a ticker such as NVDA, GOLD, or SPCX.
          </>
        ) : (
          <>
            This filter returned an empty book. Clear it, or try NVDA, GOLD, or SPCX.
          </>
        )}
      </p>
      <div className="mt-4 flex justify-center gap-3 text-sm">
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">
          Reset universe
        </Link>
        <Link href="/?q=NVDA" className="underline underline-offset-4 hover:text-foreground">
          Open NVDA
        </Link>
      </div>
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
  return (
    <Link
      href={screenerHref(current, { sort: field, dir: nextDir, start: "1" })}
      className={cn(
        "inline-flex items-center gap-0.5",
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
  return value > 0 ? "text-emerald-500/90" : "text-red-400/90";
}
