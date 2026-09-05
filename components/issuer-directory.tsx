import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import {
  ActionLink,
  DeskLogo,
  EmptyState,
  PageHeader,
  Pager,
  Panel,
  StatusFlag,
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
import type { IssuerSummary, IssuersResult } from "@/lib/cmc/types";
import { hostLabel } from "@/lib/safe-url";

export function IssuerDirectory({ data }: { data: IssuersResult }) {
  const rangeStart = data.issuers.length === 0 ? 0 : data.start;
  const rangeEnd =
    data.issuers.length === 0 ? 0 : data.start + data.issuers.length - 1;
  const prevStart = Math.max(1, data.start - data.limit);
  const nextStart = data.start + data.limit;
  const prevHref =
    data.start > 1
      ? data.start - data.limit > 1
        ? `/issuers?start=${prevStart}`
        : "/issuers"
      : null;
  const nextHref = data.hasMore ? `/issuers?start=${nextStart}` : null;
  const pastEnd = data.issuers.length === 0 && data.start > 1;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        kicker="Issuer database"
        title="Issuer directory"
        description={
          <>
            Who is tokenizing real-world assets. Counts come from{" "}
            <span className="font-mono">/issuers/list</span>.
          </>
        }
      />

      <Panel>
      {data.issuers.length === 0 ? (
        <>
          <div className="p-3">
            <EmptyState
              title="No issuers found"
              actions={
                pastEnd && prevHref ? <TextLink href={prevHref}>Previous page</TextLink> : undefined
              }
            >
              {pastEnd ? (
                <>
                  This page is past the end of the CMC issuer list.
                  {data.totalSize > 0 ? (
                    <>
                      {" "}
                      Tracked issuers:{" "}
                      <span className="font-mono tabular-nums text-foreground">
                        {data.totalSize.toLocaleString("en-US")}
                      </span>
                      .
                    </>
                  ) : null}
                </>
              ) : (
                "The CMC issuer list returned an empty page."
              )}
            </EmptyState>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              No rows on this page
              {data.start > 1 ? (
                <>
                  {" · start "}
                  <span className="font-mono tabular-nums">{data.start}</span>
                </>
              ) : null}
            </p>
            <Pager className="justify-end" prevHref={prevHref} nextHref={nextHref} />
          </div>
        </>
      ) : (
        <>
          <Table sticky bare>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Issuer</TableHead>
                <TableHead className="text-right">Tokenized assets</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Website</TableHead>
                <TableHead className="text-right">Research</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.issuers.map((issuer) => (
                <IssuerRow key={issuer.issuerId} issuer={issuer} />
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-mono tabular-nums text-foreground">
                {rangeStart.toLocaleString("en-US")}–{rangeEnd.toLocaleString("en-US")}
              </span>
              {data.totalSize > 0 ? (
                <>
                  {" of "}
                  <span className="font-mono tabular-nums">
                    {data.totalSize.toLocaleString("en-US")}
                  </span>
                  {" tracked issuers"}
                </>
              ) : (
                " on this page"
              )}
            </p>
            <Pager className="justify-end" prevHref={prevHref} nextHref={nextHref} />
          </div>
        </>
      )}
      </Panel>
    </div>
  );
}

function IssuerRow({ issuer }: { issuer: IssuerSummary }) {
  return (
    <TableRow className="focus-within:bg-muted/60">
      <TableCell className="whitespace-normal">
        <div className="flex items-center gap-2">
          <DeskLogo src={issuer.logo} name={issuer.name} size="sm" />
          <div className="min-w-0">
            <Link
              href={`/issuer/${issuer.issuerId}`}
              className="font-medium text-foreground hover:text-mark"
            >
              {issuer.name}
            </Link>
            <div className="font-mono text-[11px] text-muted-foreground">{issuer.issuerId}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground sm:hidden">
              <StatusFlag active={issuer.active} />
              {issuer.website ? ` · ${hostLabel(issuer.website)}` : ""}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="font-mono text-[15px] tabular-nums tracking-tight">
          {formatInt(issuer.numTokens)}
        </span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <StatusFlag active={issuer.active} />
      </TableCell>
      <TableCell className="hidden whitespace-normal text-[12px] sm:table-cell">
        {issuer.website ? (
          <ExternalLink className="text-mark hover:underline" href={issuer.website}>
            {hostLabel(issuer.website)}
          </ExternalLink>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <ActionLink href={`/issuer/${issuer.issuerId}`}>View issuer</ActionLink>
      </TableCell>
    </TableRow>
  );
}
