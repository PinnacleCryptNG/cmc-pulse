import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIssuerBook } from "@/lib/cmc/service";

export const dynamic = "force-dynamic";

export default async function IssuerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getIssuerBook(id);
  if (!book.issuer) notFound();
  const issuer = book.issuer;

  return (
    <AppFrame evidence={book.evidence} source={book.source} warning={book.warning}>
      <p className="text-sm">
        <Link href="/issuers" className="underline">
          Issuers
        </Link>
        <span className="text-muted-foreground"> / {issuer.name}</span>
      </p>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{issuer.name}</h1>
        <p className="font-mono text-xs text-muted-foreground">{issuer.issuerId}</p>
        {issuer.website ? (
          <a className="text-sm underline" href={issuer.website} rel="noreferrer" target="_blank">
            {issuer.website}
          </a>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">
        {issuer.numTokens ?? issuer.tokens.length} tokens · each row is a wrapper; the
        underlier is the real asset.
      </p>
      {issuer.tokens.length === 0 ? (
        <p className="rounded-xl border p-8 text-sm text-muted-foreground">
          This issuer has no linked tokens in the payload.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Underlier</TableHead>
              <TableHead className="hidden sm:table-cell">crypto_id</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issuer.tokens.map((token) => (
              <TableRow key={`${token.cryptoId}-${token.symbol}`}>
                <TableCell>
                  <div className="font-medium">{token.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{token.symbol}</div>
                </TableCell>
                <TableCell>
                  {token.rwaId !== null ? (
                    <Link className="font-medium hover:underline" href={`/asset/${token.rwaId}`}>
                      {token.underlierName ?? `rwa_id ${token.rwaId}`}
                    </Link>
                  ) : (
                    "—"
                  )}
                  {token.underlierSymbol ? (
                    <div className="font-mono text-xs text-muted-foreground">
                      {token.underlierSymbol}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="hidden font-mono text-xs sm:table-cell">
                  {token.cryptoId ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AppFrame>
  );
}
