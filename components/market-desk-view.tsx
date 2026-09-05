import Link from "next/link";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { WatchlistButton } from "@/components/watchlist-button";
import {
  ActionLink,
  EmptyState,
  PageHeader,
  Pager,
  Panel,
  TextLink,
} from "@/components/desk-chrome";
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
import { formatType, formatUsd } from "@/lib/cmc/format";
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
  const pageVolume = data.assets.reduce((sum, asset) => sum + (asset.quote.volume24h ?? 0), 0);
  const hasPageVolume = data.assets.some((asset) => asset.quote.volume24h !== null);
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
        pageVolume={hasPageVolume ? pageVolume : null}
        current={current}
      />

      <Panel>
        <div className="px-3 pt-3">
          <PageHeader
            id="universe-heading"
            kicker="Underlier map"
            title="Underlier universe"
            className="border-b-0 pb-2"
            description={
              <>
                Lookup is ticker, slug, or <span className="font-mono">rwa_id</span> — not a
                company-name search.
              </>
            }
          />
        </div>

        <form
          className="mx-3 mb-2 flex flex-col gap-2 border border-border bg-background px-2 py-2 sm:flex-row sm:items-center"
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
              className="h-7 border-0 bg-transparent pl-7 focus-visible:ring-0"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-7 shrink-0 rounded-sm">
            Find
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 pb-2 text-[11px]">
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Examples</span>
          {SUGGESTED.map((ticker) => (
            <Link
              key={ticker}
              href={screenerHref({}, { q: ticker })}
              className={cn(
                "font-mono hover:text-foreground",
                data.query.toUpperCase() === ticker ? "text-up" : "text-muted-foreground",
              )}
            >
              {ticker}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-3 py-2 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Type
            </p>
            <div className="flex flex-wrap gap-x-0">
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
                        ? "border-up text-foreground"
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
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Sort
            </p>
            <div className="flex flex-wrap gap-x-0">
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
                        ? "border-up text-foreground"
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
          <div className="px-3 pb-3">
            <EmptyUniverse
              query={data.query}
              typeLabel={typeLabel}
              typeActive={data.assetType !== "all"}
              resetHref={screenerHref({}, {})}
            />
          </div>
        ) : (
          <>
            <Table sticky bare>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Underlier</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Tokenized</TableHead>
                  <TableHead className="text-right">24h vol</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Mkt cap</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Rank</TableHead>
                  <TableHead className="text-right">Research</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.assets.map((asset) => (
                  <TableRow key={asset.rwaId} className="focus-within:bg-muted/60">
                    <TableCell className="whitespace-normal">
                      <Link
                        href={`/asset/${asset.rwaId}`}
                        className="font-medium text-foreground hover:text-foreground/80"
                      >
                        {asset.name}
                      </Link>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {asset.symbol}
                        <span className="sm:hidden">
                          {" · "}
                          {formatType(asset.assetType)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-[12px] text-muted-foreground sm:table-cell">
                      {formatType(asset.assetType)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {asset.hasTokens ? (
                        <span className="text-[11px] font-medium text-up">Tokenized</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[12px] tabular-nums">
                      {formatUsd(asset.quote.volume24h, { compact: true })}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-[12px] tabular-nums text-muted-foreground md:table-cell">
                      {formatUsd(asset.quote.marketCap, { compact: true })}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-[12px] tabular-nums text-muted-foreground lg:table-cell">
                      {asset.rwaRank != null ? `#${asset.rwaRank}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <ActionLink href={`/asset/${asset.rwaId}`}>View desk</ActionLink>
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

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
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
      </Panel>
    </div>
  );
}

function MarketSummary({
  universe,
  categories,
  listed,
  tokenizedOnPage,
  pageVolume,
  current,
}: {
  universe: TypeCount | undefined;
  categories: TypeCount[];
  listed: number;
  tokenizedOnPage: number;
  pageVolume: number | null;
  current: {
    q?: string;
    type: string;
    sort: string;
    dir: string;
    start: string;
  };
}) {
  const mixTotal = categories.reduce((sum, item) => sum + (item.count ?? 0), 0) || 1;
  const ringStops: string[] = [];
  let acc = 0;
  const shades = [80, 50, 32, 18, 10];
  categories.forEach((item, index) => {
    const start = (acc / mixTotal) * 100;
    acc += item.count ?? 0;
    const end = (acc / mixTotal) * 100;
    const shade = shades[Math.min(index, shades.length - 1)];
    ringStops.push(
      `color-mix(in oklch, var(--foreground) ${shade}%, transparent) ${start}% ${end}%`,
    );
  });

  return (
    <section aria-labelledby="summary-heading">
      <p
        id="summary-heading"
        className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        RWA market
      </p>
      <div className="grid grid-cols-2 border border-border bg-surface md:grid-cols-4">
        <MetricCell
          label="Tracked universe"
          value={universe?.count == null ? "—" : universe.count.toLocaleString("en-US")}
          hint="Underliers"
        />
        <MetricCell
          label="Tokenized in this view"
          value={listed === 0 ? "—" : tokenizedOnPage.toLocaleString("en-US")}
          hint={listed === 0 ? "No rows" : `of ${listed.toLocaleString("en-US")} listed`}
        />
        <MetricCell
          label="24h tokenized volume"
          value={formatUsd(pageVolume, { compact: true })}
          hint="In this view"
        />
        <div className="flex flex-col gap-1.5 border-border px-3.5 py-3 max-md:border-t md:border-l">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            By asset type
          </p>
          {categories.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No mix returned.</p>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="size-11 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(${ringStops.join(", ")})`,
                  boxShadow: "inset 0 0 0 3px var(--surface)",
                }}
                role="img"
                aria-label="Asset category distribution"
              />
              <ul className="flex min-w-0 flex-wrap gap-x-2.5 gap-y-0.5 text-[11px]">
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MetricCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="border-border px-3.5 py-3 max-md:[&:nth-child(odd)]:border-r max-md:[&:nth-child(-n+2)]:border-b md:not-last:border-r">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-[26px] leading-none font-medium tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
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
