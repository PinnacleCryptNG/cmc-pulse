import { ArrowRight } from "lucide-react";
import { PageHeader, TextLink } from "@/components/desk-chrome";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ASSET_TYPES } from "@/lib/cmc/types";
import { TYPE_LABELS } from "@/lib/cmc/parse";
import type { TypeCount } from "@/lib/cmc/types";
import { formatInt } from "@/lib/cmc/format";

const CLASS_BLURB: Record<(typeof ASSET_TYPES)[number], string> = {
  stock: "Public equities CMC lists as underliers.",
  commodity: "Metals and other commodities with tokenized wrappers.",
  currency: "FX underliers when CMC assigns type currency.",
  government_security: "Treasuries and government paper. Many show up as ETFs instead.",
  etf: "Funds and ETF underliers, including some treasury products.",
  real_estate: "Property underliers when CMC assigns type real_estate.",
};

export function ClassesView({ counts }: { counts: TypeCount[] }) {
  const byType = new Map(counts.map((row) => [row.type, row]));

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        kicker="Taxonomy"
        title="Asset classes"
        description={
          <>
            CoinMarketCap RWA types from <span className="font-mono">/map</span>. Private
            credit and infrastructure are not in this API.
          </>
        }
      />

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Class</TableHead>
            <TableHead className="text-right">Underliers</TableHead>
            <TableHead className="hidden sm:table-cell">Notes</TableHead>
            <TableHead className="text-right">Universe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ASSET_TYPES.map((type) => {
            const row = byType.get(type);
            const count = row?.count ?? null;
            const empty = count === 0;
            return (
              <TableRow key={type}>
                <TableCell className="whitespace-normal font-medium">
                  {TYPE_LABELS[type]}
                  <p className="mt-0.5 max-w-sm text-[12px] font-normal text-muted-foreground sm:hidden">
                    {CLASS_BLURB[type]}
                  </p>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatInt(count)}
                </TableCell>
                <TableCell className="hidden max-w-md whitespace-normal text-[12px] text-muted-foreground sm:table-cell">
                  {CLASS_BLURB[type]}
                </TableCell>
                <TableCell className="text-right">
                  {empty ? (
                    <span className="text-[12px] text-muted-foreground">None in map</span>
                  ) : (
                    <TextLink
                      href={`/?type=${type}`}
                      className="inline-flex items-center justify-end gap-1 text-[12px]"
                    >
                      Open
                      <ArrowRight className="size-3" aria-hidden />
                    </TextLink>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
