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
import { sortTokensByVolume, spreadVsUnderlier, summarizeWrappers } from "@/lib/cmc/wrappers";

export function AssetDeskView({ desk, rwaId }: { desk: AssetDesk; rwaId: string }) {
  const info = desk.info;
  const tokens = sortTokensByVolume(desk.tokens);
  const summary = summarizeWrappers(tokens, desk.quote.price);
  const closestId = summary.closest?.cryptoId;
  const pairsBlocked = (desk.warning || "").toLowerCase().includes("not on this cmc plan");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm">
        <Link href="/" className="underline">
          Screener
        </Link>
        {info?.symbol ? (
          <>
            <span className="text-muted-foreground"> / </span>
            <Link href={`/?q=${info.symbol}`} className="underline">
              {info.symbol}
            </Link>
          </>
        ) : null}
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
          {shortAbout(info?.description) ?? "No About block returned for this underlier."}
        </p>
        {summary.tokenCount > 0 ? (
          <p className="text-sm">
            {summary.tokenCount} wrapper{summary.tokenCount === 1 ? "" : "s"}
            {summary.closest ? (
              <>
                . Closest to the underlier:{" "}
                <span className="font-mono">{summary.closest.symbol}</span>
                {summary.closest.issuerName ? ` (${summary.closest.issuerName})` : ""} at{" "}
                <span className={spreadClass(summary.closest.spreadPct)}>
                  {formatPct(summary.closest.spreadPct)}
                </span>
              </>
            ) : null}
            {summary.mostVolume?.volume24h ? (
              <>
                . Most 24h volume:{" "}
                <span className="font-mono">{summary.mostVolume.symbol}</span>{" "}
                {formatUsd(summary.mostVolume.volume24h, { compact: true })}.
              </>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No on-chain wrappers in this CMC payload. Metadata still stands.
          </p>
        )}
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
            <CardDescription>GET /v5/real-world-assets/info</CardDescription>
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
            <CardTitle>TradFi venues</CardTitle>
            <CardDescription>
              Venue identity from quotes/latest — CMC does not send a cash last here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {desk.tradfiMarkets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No TradFi venues in this payload.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venue</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {desk.tradfiMarkets.map((market) => (
                    <TableRow key={`${market.name}-${market.symbol}`}>
                      <TableCell>{market.name}</TableCell>
                      <TableCell className="font-mono">{market.symbol ?? "—"}</TableCell>
                      <TableCell>
                        {market.marketUrl ? (
                          <a className="underline" href={market.marketUrl} rel="noreferrer" target="_blank">
                            Open
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>On-chain wrappers</CardTitle>
          <CardDescription>
            Vs the average tokenized price. That gap is the reason this desk exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This underlier has no linked tokens in CMC.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Vs underlier</TableHead>
                  <TableHead className="hidden text-right md:table-cell">24h vol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => {
                  const spread = spreadVsUnderlier(token.quote.price, desk.quote.price);
                  const isClosest =
                    closestId !== null &&
                    closestId !== undefined &&
                    token.cryptoId === closestId;
                  return (
                    <TableRow key={`${token.cryptoId}-${token.symbol}-${token.issuerId}`}>
                      <TableCell>
                        <div className="font-medium">{token.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {token.symbol}
                          {token.cryptoId ? ` · ${token.cryptoId}` : ""}
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
                        {isClosest ? (
                          <div className="text-xs text-muted-foreground">Closest</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatUsd(token.quote.price)}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${spreadClass(spread)}`}>
                        {formatPct(spread)}
                      </TableCell>
                      <TableCell className="hidden text-right font-mono md:table-cell">
                        {formatUsd(token.quote.volume24h, { compact: true })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {desk.marketPairs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Market pairs</CardTitle>
            <CardDescription>
              GET /v5/real-world-assets/market-pairs/list
              {desk.numMarketPairs !== null ? ` · ${desk.numMarketPairs} pairs` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      ) : pairsBlocked ? (
        <p className="text-xs text-muted-foreground">
          Market pairs are omitted: this CMC plan does not include{" "}
          <span className="font-mono">/v5/real-world-assets/market-pairs/list</span>.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">No active market pairs returned.</p>
      )}
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

function shortAbout(text: string | null | undefined): string | null {
  if (!text) return null;
  const cleaned = text.replace(/^#+\s+/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  if (cleaned.length <= 420) return cleaned;
  return `${cleaned.slice(0, 420).replace(/\s+\S*$/, "")}…`;
}

function spreadClass(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value > 0) return "text-amber-500";
  if (value < 0) return "text-emerald-500";
  return "";
}
