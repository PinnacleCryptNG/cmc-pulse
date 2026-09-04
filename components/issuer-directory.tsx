import { ArrowRight } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import {
  EmptyState,
  PageHeader,
  Pager,
  QuoteBar,
  QuoteStat,
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
    <div className="flex flex-col gap-3">
      <PageHeader
        kicker="Who wraps it"
        title="Issuer directory"
        description={
          <>
            Who mints wrappers for CMC underliers. Token counts come from{" "}
            <span className="font-mono">/issuers/list</span>.
          </>
        }
      />

      <QuoteBar className="md:grid-cols-2">
        <QuoteStat label="Tracked issuers">{formatInt(data.totalSize)}</QuoteStat>
        <QuoteStat label="This page">
          {data.issuers.length === 0
            ? "—"
            : `${rangeStart.toLocaleString("en-US")}–${rangeEnd.toLocaleString("en-US")}`}
        </QuoteStat>
      </QuoteBar>

      {data.issuers.length === 0 ? (
        <EmptyState title="No issuers in this view">
          {data.start > 1
            ? "This page is past the end of the CMC issuer list. Go back to the previous page."
            : "The CMC issuer list returned an empty page."}
        </EmptyState>
      ) : (
        <Table sticky>
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
              <TableRow key={issuer.issuerId} className="relative">
                <TableCell className="whitespace-normal">
                  <TextLink
                    href={`/issuer/${issuer.issuerId}`}
                    className="after:absolute after:inset-0 font-medium text-foreground no-underline hover:underline"
                  >
                    {issuer.name}
                  </TextLink>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {issuer.issuerId}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground sm:hidden">
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
                <TableCell className="hidden text-[12px] text-muted-foreground sm:table-cell">
                  {issuer.active === true
                    ? "Active"
                    : issuer.active === false
                      ? "Inactive"
                      : "—"}
                </TableCell>
                <TableCell className="relative z-10 hidden md:table-cell">
                  {issuer.website ? (
                    <ExternalLink className="text-mark hover:underline" href={issuer.website}>
                      {hostLabel(issuer.website)}
                    </ExternalLink>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="relative z-10 text-right">
                  <TextLink
                    href={`/issuer/${issuer.issuerId}`}
                    className="inline-flex items-center justify-end gap-1 text-[12px]"
                  >
                    View
                    <ArrowRight className="size-3" aria-hidden />
                  </TextLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pager
        prevHref={
          data.start > 1
            ? data.start - data.limit > 1
              ? `/issuers?start=${prevStart}`
              : "/issuers"
            : null
        }
        nextHref={data.hasMore ? `/issuers?start=${nextStart}` : null}
      />
    </div>
  );
}
