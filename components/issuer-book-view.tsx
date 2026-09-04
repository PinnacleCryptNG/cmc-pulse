import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import {
  EmptyState,
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
import { formatInt } from "@/lib/cmc/format";
import type { IssuerBook, IssuerToken } from "@/lib/cmc/types";
import { hostLabel, isHttpsUrl } from "@/lib/safe-url";

export function IssuerBookView({ book }: { book: IssuerBook }) {
  const issuer = book.issuer;
  if (!issuer) return null;

  const tokens = sortTokens(issuer.tokens);
  const shown = tokens.length;
  const indexed = issuer.numTokens ?? issuer.totalSize;
  const truncated = issuer.hasMore || (indexed !== null && shown < indexed);
  const uniqueUnderliers = new Set(
    tokens.map((token) => token.rwaId).filter((id): id is number => id !== null),
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
        <Link
          href="/issuers"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Issuers
        </Link>
        <span className="text-muted-foreground">/</span>
        <TextLink href="/" className="text-muted-foreground no-underline hover:text-foreground">
          Desk
        </TextLink>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <SafeLogo src={issuer.logo} name={issuer.name} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Issuer
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{issuer.name}</h1>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{issuer.issuerId}</p>
          </div>
        </div>
        <QuoteBar>
          <QuoteStat label="Indexed tokens">{formatInt(indexed ?? shown)}</QuoteStat>
          <QuoteStat label="Status">
            {issuer.active === true ? "Active" : issuer.active === false ? "Inactive" : "—"}
          </QuoteStat>
          <QuoteStat label="Underliers here">
            {uniqueUnderliers > 0 ? uniqueUnderliers.toLocaleString("en-US") : "—"}
          </QuoteStat>
          <QuoteStat label="Website">
            {issuer.website ? (
              <ExternalLink className="font-sans text-[12px] text-mark hover:underline" href={issuer.website}>
                {hostLabel(issuer.website)}
              </ExternalLink>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </QuoteStat>
        </QuoteBar>
      </header>

      <section className="flex flex-col gap-2.5" aria-labelledby="what-they-wrap">
        <SectionHead
          id="what-they-wrap"
          kicker="What they wrap"
          title="Tokenized underliers"
          description={
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Issuer</span>
              <ArrowDown className="size-3" aria-hidden />
              <span>Token</span>
              <ArrowDown className="size-3" aria-hidden />
              <span>Underlier</span>
            </span>
          }
        />

        <p className="text-[12px] text-muted-foreground">
          {truncated
            ? `Showing ${shown.toLocaleString("en-US")} of ${(indexed ?? shown).toLocaleString("en-US")} indexed tokens.`
            : `${shown.toLocaleString("en-US")} tokenized representation${shown === 1 ? "" : "s"} in this payload.`}
        </p>

        {tokens.length === 0 ? (
          <EmptyState title="No linked tokens">
            This issuer has no linked tokens in the current CMC payload.
          </EmptyState>
        ) : (
          <Table sticky>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Underlier</TableHead>
                <TableHead>Token</TableHead>
                <TableHead className="hidden sm:table-cell">crypto_id</TableHead>
                <TableHead className="text-right">Asset desk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={`${token.cryptoId}-${token.symbol}-${token.rwaId}`}>
                  <TableCell className="whitespace-normal">
                    {token.rwaId !== null ? (
                      <TextLink href={`/asset/${token.rwaId}`} className="font-medium text-foreground">
                        {token.underlierName ?? `rwa_id ${token.rwaId}`}
                      </TextLink>
                    ) : (
                      <span className="text-muted-foreground">Underlier not linked</span>
                    )}
                    {token.underlierSymbol ? (
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {token.underlierSymbol}
                      </div>
                    ) : token.rwaId !== null ? (
                      <div className="font-mono text-[11px] text-muted-foreground">
                        rwa_id {token.rwaId}
                      </div>
                    ) : null}
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground sm:hidden">
                      {token.symbol}
                      {token.cryptoId != null ? ` · ${token.cryptoId}` : ""}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{token.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{token.symbol}</div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-[11px] tabular-nums sm:table-cell">
                    {token.cryptoId ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.rwaId !== null ? (
                      <TextLink
                        href={`/asset/${token.rwaId}`}
                        className="inline-flex items-center justify-end gap-1 text-[12px]"
                      >
                        View
                        <ArrowRight className="size-3" aria-hidden />
                      </TextLink>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
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

function SafeLogo({ src, name }: { src: string | null; name: string }) {
  if (!isHttpsUrl(src)) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      title={name}
      width={36}
      height={36}
      className="mt-0.5 size-9 shrink-0 border border-border bg-surface object-contain p-0.5"
    />
  );
}
