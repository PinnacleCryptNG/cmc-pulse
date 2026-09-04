import Link from "next/link";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { WatchlistButton } from "@/components/watchlist-button";
import { EmptyState, Pager, TextLink } from "@/components/desk-chrome";
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
import { SCREENER_SORTS, screenerHref } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const SUGGESTED = ["NVDA", "GOLD", "SPCX", "TLT"] as const;

const SORT_LABEL: Record<(typeof SCREENER_SORTS)[number], string> = {
  rwa_rank: "Rank",
  average_tokenized_price: "Tokenized px",
  tokenized_market_cap: "Mkt cap",
  tokenized_volume_24h: "24h vol",
};

const SORT_DEFAULT_DIR: Record<(typeof SCREENER_SORTS)[number], "asc" | "desc"> = {
  rwa_rank: "asc",
  average_tokenized_price: "desc",
  tokenized_market_cap: "desc",
  tokenized_volume_24h: "desc",
};

export function MarketDeskView({ data }: { data: ScreenerResult }) {
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
  const typeLabel =
    data.assetType === "all"
      ? "All types"
      : (data.typeCounts.find((item) => item.type === data.assetType)?.label ?? data.assetType);

  return (
    <div className="flex flex-col gap-4">
      <MarketSummary
        universe={universe}
        categories={categories}
        listed={data.assets.length}
        tokenizedOnPage={tokenizedOnPage}
        current={current}
      />

      <section className="flex flex-col gap-2.5" aria-labelledby="universe-heading">
        <div className="flex flex-col gap-0.5 border-b border-border pb-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Market desk
            </p>
            <h1 id="universe-heading" className="text-[1.35rem] font-semibold tracking-tight">
              Underlier universe
            </h1>
          </div>
          <p className="max-w-lg text-[11px] text-muted-foreground sm:text-right">
            Lookup is ticker, slug, or <span className="font-mono">rwa_id</span> — not a
            company-name search.
          </p>
        </div>

        <form
          className="flex flex-col gap-2 border border-border bg-surface/40 px-2 py-2 sm:flex-row sm:items-center"
          action="/"
          method="get"
        >
          {data.assetType !== "all" ? (
            <input type="hidden" name="type" value={data.assetType} />
          ) : null}
          {data.sort !== "rwa_rank" ? (
            <input type="hidden" name="sort" value={data.sort} />
          ) : null}
          {data.sortDir !== "asc" ? (
            <input type="hidden" name="dir" value={data.sortDir} />
          ) : null}
          <label
            className="shrink-0 px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
            htmlFor="underlier-lookup"
          >
            Lookup
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="underlier-lookup"
              name="q"
              defaultValue={data.query}
              placeholder="NVDA, GOLD, SPCX, TLT, or an rwa_id"
              aria-label="Search underliers"
              className="border-0 bg-transparent pl-7 focus-visible:ring-0"
            />
          </div>
          <Button type="submit" variant="outline" className="h-7 shrink-0">
            Find
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Examples</span>
          {SUGGESTED.map((ticker) => (
            <Link
              key={ticker}
              href={screenerHref({}, { q: ticker })}
              className={cn(
                "font-mono hover:text-mark",
                data.query.toUpperCase() === ticker ? "text-mark" : "text-muted-foreground",
              )}
            >
              {ticker}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Type
            </p>
            <div className="flex flex-wrap gap-x-0 border-b border-border">
              {visibleTypes.map((item) => {
                const selected = data.assetType === item.type;
                return (
                  <Link
                    key={item.type}
                    href={screenerHref(current, { type: item.type, start: "1" })}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 border-b-2 px-2 py-1.5 text-[13px]",
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
          </div>
          <div className="shrink-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Sort
            </p>
            <div className="flex flex-wrap gap-x-0 border-b border-border">
              {SCREENER_SORTS.map((field) => {
                const active = data.sort === field;
                const nextDir = active
                  ? data.sortDir === "asc"
                    ? "desc"
                    : "asc"
                  : SORT_DEFAULT_DIR[field];
                return (
                  <Link
                    key={field}
                    href={screenerHref(current, { sort: field, dir: nextDir, start: "1" })}
                    className={cn(
                      "inline-flex items-center gap-0.5 border-b-2 px-2 py-1.5 text-[13px]",
                      active
                        ? "border-mark text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {SORT_LABEL[field]}
                    {active ? (
                      data.sortDir === "asc" ? (
                        <ArrowUp className="size-3" aria-hidden />
                      ) : (
                        <ArrowDown className="size-3" aria-hidden />
                      )
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {data.assets.length === 0 ? (
          <EmptyUniverse
            query={data.query}
            typeLabel={typeLabel}
            typeActive={data.assetType !== "all"}
            resetHref={screenerHref({}, {})}
          />
        ) : (
          <>
            <Table sticky>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Underlier</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Tokenized exposure</TableHead>
                  <TableHead className="text-right">Market data</TableHead>
                  <TableHead className="text-right">Research</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.assets.map((asset) => (
                  <TableRow key={asset.rwaId} className="focus-within:bg-muted/60">
                    <TableCell className="whitespace-normal">
                      <Link
                        href={`/asset/${asset.rwaId}`}
                        className="font-medium text-foreground hover:text-mark"
                      >
                        {asset.name}
                      </Link>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {asset.symbol}
                        {asset.rwaRank != null ? ` · #${asset.rwaRank}` : ""}
                        <span className="sm:hidden">
                          {" · "}
                          {formatType(asset.assetType)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] md:hidden">
                        {asset.hasTokens
                          ? "Tokenized"
                          : asset.hasTokens === false
                            ? "Not tokenized"
                            : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-[12px] text-muted-foreground sm:table-cell">
                      {formatType(asset.assetType)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {asset.hasTokens ? (
                        <span>Tokenized</span>
                      ) : asset.hasTokens === false ? (
                        <span className="text-muted-foreground">Not tokenized</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[12px] tabular-nums leading-tight">
                      <div>{formatUsd(asset.quote.price)}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatUsd(asset.quote.marketCap, { compact: true })}
                        <span className="ml-1 font-sans">mcap</span>
                        <span className="mx-1 text-border">·</span>
                        {formatUsd(asset.quote.volume24h, { compact: true })}
                        <span className="ml-1 font-sans">vol</span>
                      </div>
                      {showChange ? (
                        <div className={cn("text-[11px]", changeClass(asset.quote.percentChange24h))}>
                          {formatPct(asset.quote.percentChange24h)}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        <Link
                          href={`/asset/${asset.rwaId}`}
                          className="text-[12px] text-mark hover:underline"
                        >
                          Open desk
                        </Link>
                        <WatchlistButton
                          rwaId={asset.rwaId}
                          name={asset.name}
                          symbol={asset.symbol}
                          assetType={String(asset.assetType)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
              <p className="text-[11px] text-muted-foreground">
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
                ) : (
                  <>
                    {" · "}
                    {typeLabel}
                    {data.query ? (
                      <>
                        {" · "}
                        <span className="font-mono">{data.query}</span>
                      </>
                    ) : null}
                  </>
                )}
              </p>
              <Pager
                className="justify-end"
                prevHref={
                  data.start > 1 ? screenerHref(current, { start: String(prevStart) }) : null
                }
                nextHref={data.hasMore ? screenerHref(current, { start: String(nextStart) }) : null}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function MarketSummary({
  universe,
  categories,
  listed,
  tokenizedOnPage,
  current,
}: {
  universe: TypeCount | undefined;
  categories: TypeCount[];
  listed: number;
  tokenizedOnPage: number;
  current: {
    q?: string;
    type: string;
    sort: string;
    dir: string;
    start: string;
  };
}) {
  const mixTotal = categories.reduce((sum, item) => sum + (item.count ?? 0), 0) || 1;

  return (
    <section aria-labelledby="summary-heading" className="border-b border-border pb-3">
      <h2 id="summary-heading" className="sr-only">
        Market summary
      </h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[auto_auto_1fr] lg:items-end lg:gap-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tracked universe
          </p>
          <p className="font-mono text-[15px] tabular-nums tracking-tight">
            {universe?.count == null ? "—" : universe.count.toLocaleString("en-US")}
            <span className="ml-1.5 font-sans text-[11px] text-muted-foreground">
              map underliers
            </span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tokenized in this view
          </p>
          <p className="font-mono text-[15px] tabular-nums tracking-tight">
            {listed === 0 ? "—" : tokenizedOnPage.toLocaleString("en-US")}
            <span className="ml-1.5 font-sans text-[11px] text-muted-foreground">
              {listed === 0 ? "no rows" : `of ${listed.toLocaleString("en-US")} listed`}
            </span>
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Category mix
          </p>
          {categories.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No category mix returned.</p>
          ) : (
            <>
              <div
                className="mt-1.5 flex h-1 overflow-hidden bg-muted"
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
                  />
                ))}
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                {categories.map((item) => (
                  <li key={item.type}>
                    <Link
                      href={screenerHref(current, { type: item.type, start: "1" })}
                      className="inline-flex items-baseline gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                      <span className="font-mono tabular-nums text-foreground">
                        {(item.count ?? 0).toLocaleString("en-US")}
                      </span>
                    </Link>
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

function EmptyUniverse({
  query,
  typeLabel,
  typeActive,
  resetHref,
}: {
  query: string;
  typeLabel: string;
  typeActive: boolean;
  resetHref: string;
}) {
  const context = [
    query ? `Lookup ${query}` : null,
    typeActive ? `Type ${typeLabel}` : null,
  ].filter(Boolean);

  return (
    <EmptyState title="No underliers found" actions={<TextLink href={resetHref}>Clear lookup</TextLink>}>
      {context.length > 0 ? <p className="font-mono text-[12px] text-foreground">{context.join(" · ")}</p> : null}
      <p className="mt-1">
        No rows matched this lookup. CMC search is ticker, slug, or{" "}
        <span className="font-mono">rwa_id</span>
        {typeActive ? ", within the selected type" : ""}.
      </p>
    </EmptyState>
  );
}

function changeClass(value: number | null) {
  if (value === null || !Number.isFinite(value) || value === 0) {
    return "text-muted-foreground";
  }
  return value > 0 ? "text-up" : "text-down";
}
