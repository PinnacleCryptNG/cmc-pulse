import Link from "next/link";
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
import { getIssuers } from "@/lib/cmc/service";

export const dynamic = "force-dynamic";

export default async function IssuersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const start = Number((Array.isArray(params.start) ? params.start[0] : params.start) || "1");
  const data = await getIssuers({
    start: Number.isFinite(start) ? start : 1,
    limit: 50,
  });

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader evidence={data.evidence} source={data.source} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        <StatusBanner source={data.source} warning={data.warning} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Issuers</h1>
          <p className="text-sm text-muted-foreground">
            GET /v5/real-world-assets/issuers/list · {data.totalSize} tracked
          </p>
        </div>
        {data.issuers.length === 0 ? (
          <p className="rounded-xl border p-8 text-sm text-muted-foreground">
            No issuers returned.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issuer</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="hidden sm:table-cell">Website</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.issuers.map((issuer) => (
                <TableRow key={issuer.issuerId}>
                  <TableCell>
                    <Link className="font-medium hover:underline" href={`/issuer/${issuer.issuerId}`}>
                      {issuer.name}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">{issuer.issuerId}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{issuer.numTokens ?? "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {issuer.website ? (
                      <a className="underline" href={issuer.website} rel="noreferrer" target="_blank">
                        {issuer.website}
                      </a>
                    ) : (
                      "—"
                    )}
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
