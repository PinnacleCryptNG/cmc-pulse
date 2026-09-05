import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import {
  ActionLink,
  DeskLogo,
  EmptyState,
  Panel,
  SectionHead,
  StatusFlag,
} from "@/components/desk-chrome";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInt, formatType } from "@/lib/cmc/format";
import type { IssuerBook, IssuerToken } from "@/lib/cmc/types";
import { hostLabel, isHttpsUrl } from "@/lib/safe-url";

export function IssuerBookView({ book }: { book: IssuerBook }) {
  const issuer = book.issuer;
  if (!issuer) return null;

  const tokens = sortTokens(issuer.tokens);
  const shown = tokens.length;
  const indexed = issuer.numTokens ?? issuer.totalSize;
  const truncated = issuer.hasMore || (indexed !== null && shown < indexed);
  const website = issuer.website && isHttpsUrl(issuer.website) ? issuer.website : null;

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="text-[12px]">
        <Link
          href="/issuers"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to Issuers
        </Link>
        <span className="text-muted-foreground"> / </span>
        <span className="text-foreground">{issuer.name}</span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <DeskLogo src={issuer.logo} name={issuer.name} />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Issuer book
            </p>
            <h1 className="text-[1.35rem] font-semibold tracking-tight">{issuer.name}</h1>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              issuer_id {issuer.issuerId}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 border border-border bg-surface sm:grid-cols-3">
          {website ? (
            <div className="border-border px-3 py-2.5 sm:border-r">
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Website
              </dt>
              <dd className="mt-1">
                <ExternalLink className="text-mark hover:underline" href={website}>
                  {hostLabel(website)}
                </ExternalLink>
              </dd>
            </div>
          ) : (
            <div className="border-border px-3 py-2.5 text-muted-foreground sm:border-r">
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em]">Website</dt>
              <dd className="mt-1 text-[12px]">—</dd>
            </div>
          )}
          <div className="border-border px-3 py-2.5 max-sm:border-l sm:border-r">
            <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <StatusFlag active={issuer.active} />
            </dd>
          </div>
          <div className="border-border px-3 py-2.5 max-sm:col-span-2 max-sm:border-t">
            <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Indexed by CMC
            </dt>
            <dd className="mt-1 font-mono text-[22px] leading-none font-medium tabular-nums tracking-tight">
              {formatInt(indexed)}
              <span className="ml-1.5 font-sans text-[11px] font-normal text-muted-foreground">
                tokenized assets
              </span>
            </dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="tokenization-heading">
        <Panel>
          <div className="border-b border-border px-3 pt-3">
            <SectionHead
              id="tokenization-heading"
              kicker="Underlier → tokenized representation"
              title="Real-world assets tokenized by this issuer"
              className="border-b-0 pb-3"
              description={
                truncated
                  ? `Showing ${shown.toLocaleString("en-US")} of ${(indexed ?? shown).toLocaleString("en-US")} indexed tokens.`
                  : `${shown.toLocaleString("en-US")} tokenized representation${shown === 1 ? "" : "s"} in this payload.`
              }
            />
          </div>

          {tokens.length === 0 ? (
            <div className="p-3">
              <EmptyState title="No tokenized underliers">
                This issuer has no linked tokens in the current CMC payload.
              </EmptyState>
            </div>
          ) : (
            <Table sticky bare>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Underlier</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="text-right">Research</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TokenRow key={`${token.cryptoId}-${token.symbol}-${token.rwaId}`} token={token} />
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      </section>
    </div>
  );
}

function TokenRow({ token }: { token: IssuerToken }) {
  const underlierLabel = token.underlierName ?? (token.rwaId !== null ? `rwa_id ${token.rwaId}` : null);
  const typeLabel = token.underlierType ? formatType(token.underlierType) : null;

  return (
    <TableRow className="focus-within:bg-muted/60">
      <TableCell className="whitespace-normal">
        {token.rwaId !== null && underlierLabel ? (
          <Link
            href={`/asset/${token.rwaId}`}
            className="font-medium text-foreground hover:text-mark"
          >
            {underlierLabel}
          </Link>
        ) : (
          <span className="text-muted-foreground">Underlier not linked</span>
        )}
        {token.underlierSymbol ? (
          <div className="font-mono text-[11px] text-muted-foreground">{token.underlierSymbol}</div>
        ) : token.rwaId !== null ? (
          <div className="font-mono text-[11px] text-muted-foreground">rwa_id {token.rwaId}</div>
        ) : null}
        <div className="mt-0.5 text-[11px] text-muted-foreground sm:hidden">
          {typeLabel ?? "—"}
        </div>
      </TableCell>
      <TableCell className="hidden text-[12px] text-muted-foreground sm:table-cell">
        {typeLabel ?? "—"}
      </TableCell>
      <TableCell className="font-mono">{token.symbol}</TableCell>
      <TableCell className="hidden max-w-md whitespace-normal text-[12px] text-muted-foreground md:table-cell">
        {token.name}
      </TableCell>
      <TableCell className="text-right">
        {token.rwaId !== null ? (
          <ActionLink href={`/asset/${token.rwaId}`}>View underlier</ActionLink>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function sortTokens(tokens: IssuerToken[]): IssuerToken[] {
  return [...tokens].sort((a, b) => {
    const aLinked = a.rwaId !== null ? 0 : 1;
    const bLinked = b.rwaId !== null ? 0 : 1;
    if (aLinked !== bLinked) return aLinked - bLinked;
    const byName = (a.underlierName ?? "").localeCompare(b.underlierName ?? "");
    if (byName !== 0) return byName;
    return a.symbol.localeCompare(b.symbol);
  });
}
