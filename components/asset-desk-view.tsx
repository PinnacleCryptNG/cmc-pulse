import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInt, formatPct, formatType, formatUsd } from "@/lib/cmc/format";
import type { AssetDesk } from "@/lib/cmc/types";

export function AssetDeskView({ desk, rwaId }: { desk: AssetDesk; rwaId: string }) {
  const info = desk.info;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm">
        <Link href="/" className="underline">
          Screener
        </Link>
        <span className="text-muted-foreground"> / rwa_id {rwaId}</span>
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {info?.name ?? `RWA ${rwaId}`}
          </h1>
          <Badge variant="outline">{info?.symbol ?? "—"}</Badge>
          <Badge variant="secondary">{formatType(info?.assetType ?? "unknown")}</Badge>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {info?.description ?? "No About block returned for this underlier."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Average tokenized price</CardDescription>
            <CardTitle className="font-mono text-xl">
              {formatUsd(desk.quote.price)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Tokenized market cap</CardDescription>
            <CardTitle className="font-mono text-xl">
              {formatUsd(desk.quote.marketCap, { compact: true })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>24h tokenized volume</CardDescription>
            <CardTitle className="font-mono text-xl">
              {formatUsd(desk.quote.volume24h, { compact: true })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Underlier</CardTitle>
            <CardDescription>
              GET /v5/real-world-assets/info · path {desk.pathUsed}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Row label="rwa_id" value={String(info?.rwaId ?? rwaId)} />
            <Row label="rwa_rank" value={info?.rwaRank ? String(info.rwaRank) : "—"} />
            <Row label="Primary exchange" value={info?.primaryExchange ?? "—"} />
            <Row label="Industry" value={info?.industry ?? "—"} />
            <Row label="Employees" value={formatInt(info?.employees ?? null)} />
            <Row label="Founded" value={info?.founded?.slice(0, 10) ?? "—"} />
            <Row label="SEC CIK" value={info?.cik ?? "—"} />
            <Row
              label="Website"
              value={
                info?.website ? (
                  <a className="underline" href={info.website} rel="noreferrer" target="_blank">
                    {info.website}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TradFi markets</CardTitle>
            <CardDescription>From GET /v5/real-world-assets/quotes/latest</CardDescription>
          </CardHeader>
          <CardContent>
            {desk.tradfiMarkets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No TradFi markets in this payload.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {desk.tradfiMarkets.map((market) => (
                    <TableRow key={`${market.name}-${market.symbol}`}>
                      <TableCell>
                        {market.name}
                        {market.exchange ? (
                          <div className="text-xs text-muted-foreground">{market.exchange}</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono">{market.symbol ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatUsd(market.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>On-chain tokens</CardTitle>
          <CardDescription>
            Issuer join via quotes tokens, then /issuers if the quote omitted issuer_id
          </CardDescription>
        </CardHeader>
        <CardContent>
          {desk.tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This underlier has no linked tokens in CMC. Metadata still stands.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead className="hidden sm:table-cell">crypto_id</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="hidden text-right md:table-cell">24h vol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desk.tokens.map((token) => (
                  <TableRow key={`${token.cryptoId}-${token.symbol}-${token.issuerId}`}>
                    <TableCell>
                      <div className="font-medium">{token.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {token.symbol}
                      </div>
                    </TableCell>
                    <TableCell>
                      {token.issuerId ? (
                        <Link className="underline" href={`/issuer/${token.issuerId}`}>
                          {token.issuerName ?? token.issuerId}
                        </Link>
                      ) : (
                        token.issuerName ?? "—"
                      )}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs sm:table-cell">
                      {token.cryptoId ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatUsd(token.quote.price)}
                      <div className="text-xs text-muted-foreground">
                        {formatPct(token.quote.percentChange24h)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-right font-mono md:table-cell">
                      {formatUsd(token.quote.volume24h, { compact: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market pairs</CardTitle>
          <CardDescription>
            GET /v5/real-world-assets/market-pairs/list
            {desk.numMarketPairs !== null ? ` · ${desk.numMarketPairs} pairs` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {desk.marketPairs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active market pairs returned.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">24h vol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desk.marketPairs.map((pair) => (
                  <TableRow key={`${pair.exchange}-${pair.marketPair}`}>
                    <TableCell>{pair.exchange ?? "—"}</TableCell>
                    <TableCell className="font-mono">{pair.marketPair}</TableCell>
                    <TableCell className="hidden sm:table-cell">{pair.category ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono">{formatUsd(pair.price)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatUsd(pair.volume24h, { compact: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 sm:grid-cols-[10rem_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
