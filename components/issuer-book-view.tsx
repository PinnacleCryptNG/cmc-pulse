import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
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

export function IssuerBookView({ book }: { book: IssuerBook }) {
  const issuer = book.issuer;
  if (!issuer) return null;

  const tokens = sortTokens(issuer.tokens);
  const shown = tokens.length;
  const indexed = issuer.numTokens ?? issuer.totalSize;
  const truncated =
    issuer.hasMore || (indexed !== null && shown < indexed);
  const uniqueUnderliers = new Set(
    tokens.map((token) => token.rwaId).filter((id): id is number => id !== null),
  ).size;

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <Link
          href="/issuers"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to issuers
        </Link>
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Underlier Universe
        </Link>
      </nav>

      <header className="flex flex-col gap-4 border-b border-border/80 pb-5">
        <div className="flex items-start gap-3">
          <SafeLogo src={issuer.logo} name={issuer.name} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Who
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{issuer.name}</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{issuer.issuerId}</p>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This issuer mints tokenized representations of real-world underliers.
        </p>
        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <IdentityRow label="Indexed tokens" value={formatInt(indexed ?? shown)} />
          {issuer.active !== null ? (
            <IdentityRow label="Status" value={issuer.active ? "Active" : "Inactive"} />
          ) : null}
          {uniqueUnderliers > 0 ? (
            <IdentityRow
              label="Underliers on this page"
              value={<span className="font-mono tabular-nums">{uniqueUnderliers}</span>}
            />
          ) : null}
          {issuer.website ? (
            <IdentityRow
              label="Website"
              value={
                <a
                  className="underline underline-offset-4"
                  href={issuer.website}
                  rel="noreferrer"
                  target="_blank"
                >
                  {hostLabel(issuer.website)}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              }
            />
          ) : null}
        </dl>
      </header>

      <section className="flex flex-col gap-3" aria-labelledby="what-they-wrap">
        <div className="flex flex-col gap-1 border-b border-border/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              What they wrap
            </p>
            <h2 id="what-they-wrap" className="text-lg font-semibold tracking-tight">
              Tokenized underliers
            </h2>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:justify-end">
            <span>Issuer</span>
            <ArrowDown className="size-3" aria-hidden />
            <span>Token</span>
            <ArrowDown className="size-3" aria-hidden />
            <span>Underlier</span>
          </p>
        </div>

        {truncated ? (
          <p className="text-sm text-muted-foreground">
            Showing {shown.toLocaleString("en-US")} of{" "}
            {(indexed ?? shown).toLocaleString("en-US")} indexed tokens.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {shown.toLocaleString("en-US")} tokenized representation
            {shown === 1 ? "" : "s"} in this payload.
          </p>
        )}

        {tokens.length === 0 ? (
          <div className="border border-dashed border-border/80 px-4 py-12 text-center text-sm text-muted-foreground">
            This issuer has no linked tokens in the current CMC payload.
          </div>
        ) : (
          <Table className="text-[13px]">
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
                      <Link
                        className="font-medium underline-offset-4 hover:underline"
                        href={`/asset/${token.rwaId}`}
                      >
                        {token.underlierName ?? `rwa_id ${token.rwaId}`}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Underlier not linked</span>
                    )}
                    {token.underlierSymbol ? (
                      <div className="font-mono text-xs text-muted-foreground">
                        {token.underlierSymbol}
                      </div>
                    ) : token.rwaId !== null ? (
                      <div className="font-mono text-xs text-muted-foreground">
                        rwa_id {token.rwaId}
                      </div>
                    ) : null}
                    <div className="mt-1 font-mono text-xs text-muted-foreground sm:hidden">
                      {token.symbol}
                      {token.cryptoId != null ? ` · ${token.cryptoId}` : ""}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{token.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{token.symbol}</div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs tabular-nums sm:table-cell">
                    {token.cryptoId ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.rwaId !== null ? (
                      <Link
                        className="inline-flex items-center justify-end gap-1 underline underline-offset-4"
                        href={`/asset/${token.rwaId}`}
                      >
                        View underlier
                        <ArrowRight className="size-3" aria-hidden />
                      </Link>
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

function IdentityRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 sm:grid-cols-[11rem_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
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
      width={40}
      height={40}
      className="mt-1 size-10 shrink-0 rounded-md border border-border/80 bg-muted object-contain p-0.5"
    />
  );
}

function hostLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function isHttpsUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
