"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { WatchlistButton } from "@/components/watchlist-button";
import { EmptyState, PageHeader, TextLink } from "@/components/desk-chrome";
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
    <div className="flex flex-col gap-3">
      <PageHeader
        kicker="Saved locally"
        title="Watchlist"
        description="Names only, in this browser. Open an asset desk for tokenized quotes."
      />

      {items.length === 0 ? (
        <EmptyState
          title="No saved underliers"
          actions={<TextLink href="/explore">Open explorer</TextLink>}
        >
          Star a row in Explorer or on an asset desk.
        </EmptyState>
      ) : (
        <Table>
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
                  <div className="font-mono text-[11px] text-muted-foreground">{item.symbol}</div>
                </TableCell>
                <TableCell className="hidden text-[11px] uppercase tracking-[0.08em] text-muted-foreground sm:table-cell">
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
