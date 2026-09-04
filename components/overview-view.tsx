import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

export function OverviewView({
  ranked,
  byVolume,
  byMcap,
}: {
  ranked: ScreenerResult;
  byVolume: ScreenerResult;
  byMcap: ScreenerResult;
}) {
  const universe = ranked.typeCounts.find((item) => item.type === "all");
  const categories = ranked.typeCounts.filter(
    (item) => item.type !== "all" && (item.count ?? 0) > 0,
  );
  const pageMcap = sumQuote(ranked.assets, "marketCap");
  const pageVolume = sumQuote(ranked.assets, "volume24h");

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="overview-heading">
        <div className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Overview
            </p>
            <h1 id="overview-heading" className="text-xl font-semibold tracking-tight">
              Desk
            </h1>
          </div>
          <p className="max-w-xl text-xs text-muted-foreground sm:text-right">
            Tokenized market figures below are from this ranked book of{" "}
            {ranked.assets.length.toLocaleString("en-US")} underliers — not a sum of
            the full map universe.
          </p>
        </div>

        <div className="grid grid-cols-2 border-b border-border/80 md:grid-cols-4">
          <Stat
            label="Tracked assets"
            className="border-b border-border/80 md:border-r md:border-b-0"
          >
            <span className="font-mono text-lg tabular-nums">
              {universe?.count == null ? "—" : universe.count.toLocaleString("en-US")}
            </span>
            <span className="text-xs text-muted-foreground">map underliers</span>
          </Stat>
          <Stat
            label="Tokenized mcap"
            className="border-b border-border/80 md:border-r md:border-b-0"
          >
            <span className="font-mono text-lg tabular-nums">
              {formatUsd(pageMcap, { compact: true })}
            </span>
            <span className="text-xs text-muted-foreground">this book</span>
          </Stat>
          <Stat label="24h tokenized volume" className="border-b border-border/80 md:border-b-0 md:border-r">
            <span className="font-mono text-lg tabular-nums">
              {formatUsd(pageVolume, { compact: true })}
            </span>
            <span className="text-xs text-muted-foreground">this book</span>
          </Stat>
          <Stat label="Research">
            <Link href="/explore" className="text-sm underline underline-offset-4">
              Open explorer
            </Link>
          </Stat>
        </div>
      </section>

      <ClassBreakdown categories={categories} />

      <AssetList
        kicker="Largest tokenized books"
        title="By tokenized market cap"
        description="Sorted by CMC tokenized_market_cap. Not a cash-market ranking."
        assets={byMcap.assets}
        value="marketCap"
      />

      <AssetList
        kicker="Market activity"
        title="By 24h tokenized volume"
        description="CMC does not ship RWA 24h percent change, so this is volume — not movers."
        assets={byVolume.assets}
        value="volume24h"
      />
    </div>
  );
}

function ClassBreakdown({ categories }: { categories: TypeCount[] }) {
  const mixTotal = categories.reduce((sum, item) => sum + (item.count ?? 0), 0) || 1;
  return (
    <section className="flex flex-col gap-3" aria-labelledby="classes-heading">
      <div className="flex flex-col gap-1 border-b border-border/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Asset-class breakdown
          </p>
          <h2 id="classes-heading" className="text-lg font-semibold tracking-tight">
            CMC taxonomy
          </h2>
        </div>
        <Link
          href="/classes"
          className="inline-flex items-center gap-1 text-xs underline underline-offset-4"
        >
          All classes
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
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
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {categories.map((item) => (
              <li key={item.type}>
                <Link
                  href={`/explore?type=${item.type}`}
                  className="flex items-baseline gap-1.5 hover:underline"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono tabular-nums">
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
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 border-b border-border/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {kicker}
          </p>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        <p className="max-w-xl text-xs text-muted-foreground sm:text-right">{description}</p>
      </div>
      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rows in this book.</p>
      ) : (
        <Table className="text-[13px]">
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
                  <div className="font-mono text-xs text-muted-foreground">{asset.symbol}</div>
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

function Stat({
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
      <div className="flex flex-wrap items-baseline gap-2">{children}</div>
    </div>
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
