"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { WatchlistButton } from "@/components/watchlist-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatType } from "@/lib/cmc/format";
import { readWatchlist, subscribeWatchlist, type WatchlistItem } from "@/lib/watchlist";

const EMPTY: WatchlistItem[] = [];

export function WatchlistView() {
  const items = useSyncExternalStore(subscribeWatchlist, readWatchlist, () => EMPTY);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Saved locally
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Watchlist</h1>
        </div>
        <p className="max-w-xl text-xs text-muted-foreground sm:text-right">
          Names only, in this browser. Open an asset desk for tokenized quotes.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="border border-dashed border-border/80 px-4 py-12 text-center">
          <p className="text-sm font-medium">No saved underliers</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Star a row in Explorer or on an asset desk.
          </p>
          <Link href="/explore" className="mt-4 inline-block text-sm underline underline-offset-4">
            Open explorer
          </Link>
        </div>
      ) : (
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Underlier</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="w-10 text-right">
                <span className="sr-only">Save</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.rwaId} className="relative">
                <TableCell className="whitespace-normal">
                  <Link
                    href={`/asset/${item.rwaId}`}
                    className="after:absolute after:inset-0 font-medium"
                  >
                    {item.name}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">{item.symbol}</div>
                </TableCell>
                <TableCell className="hidden capitalize sm:table-cell text-muted-foreground">
                  {formatType(item.assetType)}
                </TableCell>
                <TableCell className="relative z-10 w-10 text-right">
                  <WatchlistButton
                    rwaId={item.rwaId}
                    name={item.name}
                    symbol={item.symbol}
                    assetType={item.assetType}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
