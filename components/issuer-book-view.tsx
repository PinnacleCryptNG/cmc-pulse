import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { EmptyState, SectionHead, TextLink } from "@/components/desk-chrome";
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
  const status =
    issuer.active === true ? "Active" : issuer.active === false ? "Inactive" : null;
  const website = issuer.website && isHttpsUrl(issuer.website) ? issuer.website : null;
  const identity = [
    status,
    indexed != null ? `${formatInt(indexed)} indexed tokens` : null,
  ].filter((bit): bit is string => Boolean(bit));

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="text-[12px]">
        <Link
          href="/issuers"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Issuers
        </Link>
        <span className="text-muted-foreground"> / </span>
        <span className="text-foreground">{issuer.name}</span>
      </nav>

      <header className="border-b border-border pb-3">
        <div className="flex items-start gap-3">
          <SafeLogo src={issuer.logo} name={issuer.name} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Issuer book
            </p>
            <h1 className="text-[1.35rem] font-semibold tracking-tight">
              {issuer.name}
            </h1>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              issuer_id {issuer.issuerId}
            </p>
            {identity.length > 0 || website ? (
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {identity.join(" · ")}
                {website ? (
                  <>
                    {identity.length > 0 ? " · " : null}
                    <ExternalLink className="text-mark hover:underline" href={website}>
                      {hostLabel(website)}
                    </ExternalLink>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-2.5" aria-labelledby="tokenization-heading">
        <SectionHead
          id="tokenization-heading"
          kicker="Underlier → tokenized representation"
          title="What real-world assets does this issuer tokenize?"
          description={
            truncated
              ? `Showing ${shown.toLocaleString("en-US")} of ${(indexed ?? shown).toLocaleString("en-US")} indexed tokens.`
              : `${shown.toLocaleString("en-US")} tokenized representation${shown === 1 ? "" : "s"} in this payload.`
          }
        />

        {tokens.length === 0 ? (
          <EmptyState title="No tokenized underliers">
            This issuer has no linked tokens in the current CMC payload.
          </EmptyState>
        ) : (
          <Table sticky>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Underlier</TableHead>
                <TableHead>Token</TableHead>
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
      </section>
    </div>
  );
}

function TokenRow({ token }: { token: IssuerToken }) {
  const underlierLabel = token.underlierName ?? (token.rwaId !== null ? `rwa_id ${token.rwaId}` : null);

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
      </TableCell>
      <TableCell className="whitespace-normal">
        <div className="font-medium">{token.name}</div>
        <div className="font-mono text-[11px] text-muted-foreground">
          {token.symbol}
          {token.cryptoId != null ? ` · crypto_id ${token.cryptoId}` : ""}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {token.rwaId !== null ? (
          <TextLink href={`/asset/${token.rwaId}`} className="text-[12px]">
            View underlier
          </TextLink>
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
