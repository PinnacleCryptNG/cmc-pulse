import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  PageHeader,
  QuoteBar,
  QuoteStat,
  SectionHead,
  TextLink,
} from "@/components/desk-chrome";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUsd } from "@/lib/cmc/format";
import type { ListedAsset, ScreenerResult, TypeCount } from "@/lib/cmc/types";
import { cn } from "@/lib/utils";

export function OverviewView({ ranked }: { ranked: ScreenerResult }) {
  const universe = ranked.typeCounts.find((item) => item.type === "all");
  const categories = ranked.typeCounts.filter(
    (item) => item.type !== "all" && (item.count ?? 0) > 0,
  );
  const pageMcap = sumQuote(ranked.assets, "marketCap");
  const pageVolume = sumQuote(ranked.assets, "volume24h");
  const tokenized = ranked.assets.filter((asset) => asset.hasTokens).length;
  const byMcap = topBy(ranked.assets, "marketCap", 10);
  const byVolume = topBy(ranked.assets, "volume24h", 10);

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="overview-heading">
        <PageHeader
          id="overview-heading"
          kicker="Ranked book"
          title="Overview"
          description={
            <>
              Tokenized figures are from this ranked book of{" "}
              {ranked.assets.length.toLocaleString("en-US")} underliers — not a sum of
              the full map universe.
            </>
          }
          action={
            <TextLink href="/explore" className="inline-flex items-center gap-1 text-xs">
              Open explorer
              <ArrowRight className="size-3" aria-hidden />
            </TextLink>
          }
        />
        <QuoteBar>
          <QuoteStat label="Tracked assets">
            {universe?.count == null ? "—" : universe.count.toLocaleString("en-US")}
            <span className="font-sans text-[11px] text-muted-foreground">map underliers</span>
          </QuoteStat>
          <QuoteStat label="Tokenized mcap">
            {formatUsd(pageMcap, { compact: true })}
            <span className="font-sans text-[11px] text-muted-foreground">this book</span>
          </QuoteStat>
          <QuoteStat label="24h tokenized volume">
            {formatUsd(pageVolume, { compact: true })}
            <span className="font-sans text-[11px] text-muted-foreground">this book</span>
          </QuoteStat>
          <QuoteStat label="Tokenized here">
            {tokenized.toLocaleString("en-US")}
            <span className="font-sans text-[11px] text-muted-foreground">
              of {ranked.assets.length.toLocaleString("en-US")} listed
            </span>
          </QuoteStat>
        </QuoteBar>
      </section>

      <ClassBreakdown categories={categories} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AssetList
          kicker="Largest tokenized books"
          title="By tokenized market cap"
          description="Top of this ranked book by CMC tokenized_market_cap — not a cash-market ranking."
          assets={byMcap}
          value="marketCap"
        />
        <AssetList
          kicker="Market activity"
          title="By 24h tokenized volume"
          description="CMC does not ship RWA 24h percent change. Volume among this book, not movers."
          assets={byVolume}
          value="volume24h"
        />
      </div>
    </div>
  );
}

function ClassBreakdown({ categories }: { categories: TypeCount[] }) {
  const mixTotal = categories.reduce((sum, item) => sum + (item.count ?? 0), 0) || 1;
  return (
    <section className="flex flex-col gap-2.5" aria-labelledby="classes-heading">
      <SectionHead
        id="classes-heading"
        kicker="Asset-class mix"
        title="Map by type"
        action={
          <TextLink href="/classes" className="inline-flex items-center gap-1 text-xs">
            All classes
            <ArrowRight className="size-3" aria-hidden />
          </TextLink>
        }
      />
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No category mix returned.</p>
      ) : (
        <>
          <div
            className="flex h-1 overflow-hidden bg-muted"
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
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {categories.map((item) => (
              <li key={item.type}>
                <Link
                  href={`/explore?type=${item.type}`}
                  className="flex items-baseline gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <span>{item.label}</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {(item.count ?? 0).toLocaleString("en-US")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function AssetList({
  kicker,
  title,
  description,
  assets,
  value,
}: {
  kicker: string;
  title: string;
  description: string;
  assets: ListedAsset[];
  value: "marketCap" | "volume24h";
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionHead kicker={kicker} title={title} description={description} />
      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rows in this book.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Underlier</TableHead>
              <TableHead className="text-right">
                {value === "marketCap" ? "Tokenized mcap" : "24h vol"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.rwaId} className="relative">
                <TableCell className="whitespace-normal">
                  <Link href={`/asset/${asset.rwaId}`} className="after:absolute after:inset-0">
                    <span className="font-medium">{asset.name}</span>
                  </Link>
                  <div className="font-mono text-[11px] text-muted-foreground">{asset.symbol}</div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatUsd(asset.quote[value], { compact: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

function sumQuote(assets: ListedAsset[], field: "marketCap" | "volume24h"): number | null {
  let total = 0;
  let any = false;
  for (const asset of assets) {
    const value = asset.quote[field];
    if (value == null || !Number.isFinite(value)) continue;
    total += value;
    any = true;
  }
  return any ? total : null;
}

function topBy(
  assets: ListedAsset[],
  field: "marketCap" | "volume24h",
  n: number,
): ListedAsset[] {
  return [...assets]
    .filter((asset) => {
      const value = asset.quote[field];
      return value != null && Number.isFinite(value);
    })
    .sort((a, b) => (b.quote[field] ?? 0) - (a.quote[field] ?? 0))
    .slice(0, n);
}
