import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
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
    <div className="flex min-h-full flex-col">
      <SiteHeader evidence={book.evidence} source={book.source} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        <StatusBanner source={book.source} warning={book.warning} />
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
          GET /v5/real-world-assets/issuers · {issuer.numTokens ?? issuer.tokens.length} tokens
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
                      <Link className="underline" href={`/asset/${token.rwaId}`}>
                        rwa_id {token.rwaId}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs sm:table-cell">
                    {token.cryptoId ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}
