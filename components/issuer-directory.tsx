import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInt } from "@/lib/cmc/format";
import type { IssuersResult } from "@/lib/cmc/types";
import { hostLabel } from "@/lib/safe-url";

export function IssuerDirectory({ data }: { data: IssuersResult }) {
  const rangeStart = data.issuers.length === 0 ? 0 : data.start;
  const rangeEnd =
    data.issuers.length === 0 ? 0 : data.start + data.issuers.length - 1;
  const prevStart = Math.max(1, data.start - data.limit);
  const nextStart = data.start + data.limit;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Research
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Issuer directory</h1>
        </div>
        <p className="max-w-xl text-xs text-muted-foreground sm:text-right">
          Explore the entities issuing tokenized representations of real-world
          assets.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-border/80 pb-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Tracked issuers
          </p>
          <p className="font-mono text-lg tabular-nums">
            {formatInt(data.totalSize)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            This page
          </p>
          <p className="font-mono text-lg tabular-nums">
            {data.issuers.length === 0
              ? "—"
              : `${rangeStart.toLocaleString("en-US")}–${rangeEnd.toLocaleString("en-US")}`}
          </p>
        </div>
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Relationship
          </p>
          <p className="text-sm text-muted-foreground">
            Issuer → tokenized representation → underlier
          </p>
        </div>
      </div>

      {data.issuers.length === 0 ? (
        <div className="border border-dashed border-border/80 px-4 py-12 text-center">
          <p className="text-sm font-medium">No issuers in this view</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.start > 1
              ? "This page is past the end of the CMC issuer list. Go back to the previous page."
              : "The CMC issuer list returned an empty page."}
          </p>
        </div>
      ) : (
        <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Issuer</TableHead>
                <TableHead className="text-right">Tokenized assets</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Website</TableHead>
                <TableHead className="text-right">Book</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.issuers.map((issuer) => (
                <TableRow key={issuer.issuerId}>
                  <TableCell className="whitespace-normal">
                    <Link
                      className="font-medium underline-offset-4 hover:underline"
                      href={`/issuer/${issuer.issuerId}`}
                    >
                      {issuer.name}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">
                      {issuer.issuerId}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                      {issuer.active === true
                        ? "Active"
                        : issuer.active === false
                          ? "Inactive"
                          : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatInt(issuer.numTokens)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {issuer.active === true
                      ? "Active"
                      : issuer.active === false
                        ? "Inactive"
                        : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {issuer.website ? (
                      <ExternalLink
                        className="underline underline-offset-4"
                        href={issuer.website}
                      >
                        {hostLabel(issuer.website)}
                      </ExternalLink>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      className="inline-flex items-center gap-1 underline underline-offset-4"
                      href={`/issuer/${issuer.issuerId}`}
                    >
                      View issuer
                      <ArrowRight className="size-3" aria-hidden />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}
      {data.start > 1 || data.hasMore ? (
          <div className="flex items-center justify-between text-sm">
            {data.start > 1 ? (
              <Link
                href={data.start - data.limit > 1 ? `/issuers?start=${prevStart}` : "/issuers"}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-border/80 px-2.5 hover:bg-muted"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Previous
              </Link>
            ) : (
              <span />
            )}
            {data.hasMore ? (
              <Link
                href={`/issuers?start=${nextStart}`}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-border/80 px-2.5 hover:bg-muted"
              >
                Next
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </div>
      ) : null}
    </div>
  );
}
