import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/watchlist-button";
import { EmptyState, IdentityRow, QuoteBar, QuoteStat, SectionHead } from "@/components/desk-chrome";
import { ExternalLink } from "@/components/external-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInt, formatPct, formatType, formatUsd } from "@/lib/cmc/format";
import type {
  AssetDesk,
  AssetInfo,
  CallEvidence,
  TradfiMarket,
  UnderlyingToken,
} from "@/lib/cmc/types";
import {
  sortTokensByVolume,
  spreadVsUnderlier,
  summarizeWrappers,
} from "@/lib/cmc/wrappers";
import { isHttpsUrl, hostLabel } from "@/lib/safe-url";
import { cn } from "@/lib/utils";

export function AssetDeskView({ desk, rwaId }: { desk: AssetDesk; rwaId: string }) {
  const info = desk.info;
  const tokens = sortTokensByVolume(desk.tokens);
  const summary = summarizeWrappers(tokens, desk.quote.price);
  const closestId = summary.closest?.cryptoId;
  const mostVolumeId = summary.mostVolume?.cryptoId;
  const issuers = groupIssuers(tokens);
  const showTokenMcap = tokens.some((token) => token.quote.marketCap !== null);
  const showTokenChange = tokens.some((token) => token.quote.percentChange24h !== null);
  const identityBits = identityLine(info);

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="text-[12px]">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Explorer
        </Link>
        {info?.symbol ? (
          <>
            <span className="text-muted-foreground"> / </span>
            <Link href={`/explore?q=${encodeURIComponent(info.symbol)}`} className="font-mono hover:text-mark">
              {info.symbol}
            </Link>
          </>
        ) : null}
        <span className="text-muted-foreground"> / rwa_id {rwaId}</span>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <SafeLogo src={info?.logo} name={info?.name ?? `RWA ${rwaId}`} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Underlier
            </p>
            <h1 className="font-mono text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              {info?.symbol ?? `RWA ${rwaId}`}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <span className="text-foreground">{info?.name ?? `RWA ${rwaId}`}</span>
              {identityBits.length > 0 ? ` · ${identityBits.join(" · ")}` : null}
            </p>
          </div>
          {info ? (
            <WatchlistButton
              rwaId={info.rwaId}
              name={info.name}
              symbol={info.symbol}
              assetType={String(info.assetType)}
            />
          ) : null}
        </div>

        <QuoteBar>
          <QuoteStat label="Tokenized price">
            <span className="text-xl md:text-2xl">{formatUsd(desk.quote.price)}</span>
          </QuoteStat>
          <QuoteStat label="Tokenized market cap">
            {formatUsd(desk.quote.marketCap, { compact: true })}
          </QuoteStat>
          <QuoteStat label="24h tokenized volume">
            {formatUsd(desk.quote.volume24h, { compact: true })}
          </QuoteStat>
          <QuoteStat label="Tokenized exposure">
            {summary.tokenCount}
            <span className="font-sans text-[11px] text-muted-foreground">
              {summary.tokenCount === 1 ? "wrapper" : "wrappers"}
            </span>
          </QuoteStat>
        </QuoteBar>
        <p className="text-[11px] text-muted-foreground">
          Tokenized market data — average across issuer wrappers, not a cash-market last.
        </p>
      </header>

      <UnderlierIdentity info={info} rwaId={rwaId} />
      {info?.assetType ? (
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/explore?type=${encodeURIComponent(String(info.assetType))}`}
            className="underline underline-offset-4"
          >
            More {formatType(String(info.assetType))} underliers
          </Link>
        </p>
      ) : null}

      <TokenizedExposure
        tokens={tokens}
        underlierPrice={desk.quote.price}
        underlierName={info?.name ?? `RWA ${rwaId}`}
        closestId={closestId}
        mostVolumeId={mostVolumeId}
        showMcap={showTokenMcap}
        showChange={showTokenChange}
      />

      <ComparisonSection
        underlierName={info?.name ?? `RWA ${rwaId}`}
        underlierSymbol={info?.symbol ?? null}
        underlierPrice={desk.quote.price}
        summary={summary}
        tokens={tokens}
      />

      <TradfiSection
        underlierName={info?.name ?? `RWA ${rwaId}`}
        underlierSymbol={info?.symbol ?? null}
        markets={desk.tradfiMarkets}
      />

      <IssuersSection issuers={issuers} underlierName={info?.name ?? `RWA ${rwaId}`} />

      <EvidenceSection evidence={desk.evidence} pathUsed={desk.pathUsed} />
    </div>
  );
}

function UnderlierIdentity({ info, rwaId }: { info: AssetInfo | null; rwaId: string }) {
  const rows: { label: string; value: ReactNode }[] = [];
  rows.push({ label: "rwa_id", value: <span className="font-mono">{info?.rwaId ?? rwaId}</span> });
  if (info?.rwaRank != null) {
    rows.push({ label: "Rank", value: <span className="font-mono tabular-nums">{info.rwaRank}</span> });
  }
  if (info?.assetType) {
    rows.push({ label: "Asset type", value: typeLabel(info.assetType) });
  }
  if (info?.primaryExchange) {
    rows.push({ label: "Primary exchange", value: info.primaryExchange });
  }
  if (info?.industry) {
    rows.push({ label: "Industry", value: info.industry });
  }
  if (info?.founded) {
    rows.push({ label: "Founded", value: info.founded.slice(0, 10) });
  }
  if (info?.employees != null) {
    rows.push({ label: "Employees", value: formatInt(info.employees) });
  }
  if (info?.cik) {
    rows.push({
      label: "SEC CIK",
      value: <span className="font-mono">{info.cik}</span>,
    });
  }
  if (info?.website) {
    rows.push({
      label: "Website",
      value: (
        <ExternalLink className="underline underline-offset-4" href={info.website}>
          {hostLabel(info.website)}
        </ExternalLink>
      ),
    });
  }
  const about = shortAbout(info?.description);

  return (
    <DeskSection
      id="underlier"
      kicker="Real-world asset"
      title="Underlier"
      description="The instrument being tokenized — not the on-chain wrapper."
    >
      <dl className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
        {rows.map((row) => (
          <IdentityRow key={row.label} label={row.label} value={row.value} />
        ))}
      </dl>
      {about ? (
        <p className="max-w-3xl text-sm text-muted-foreground">{about}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No About block returned for this underlier.</p>
      )}
    </DeskSection>
  );
}

function TokenizedExposure({
  tokens,
  underlierPrice,
  underlierName,
  closestId,
  mostVolumeId,
  showMcap,
  showChange,
}: {
  tokens: UnderlyingToken[];
  underlierPrice: number | null;
  underlierName: string;
  closestId: number | null | undefined;
  mostVolumeId: number | null | undefined;
  showMcap: boolean;
  showChange: boolean;
}) {
  return (
    <DeskSection
      id="tokenized-exposure"
      kicker="On-chain wrappers"
      title="Tokenized exposure"
      description={
        <>
          Each row is a tokenized representation of {underlierName}, not a standalone
          cryptocurrency.
        </>
      }
    >
      {tokens.length === 0 ? (
        <EmptyState title="No tokenized exposure">
          No tokenized exposure in this CMC payload. Underlier metadata still stands.
        </EmptyState>
      ) : (
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Wrapper</TableHead>
              <TableHead className="hidden sm:table-cell">Issuer</TableHead>
              <TableHead className="text-right">Price</TableHead>
              {showChange ? (
                <TableHead className="hidden text-right md:table-cell">24h</TableHead>
              ) : null}
              {showMcap ? (
                <TableHead className="hidden text-right md:table-cell">Mkt cap</TableHead>
              ) : null}
              <TableHead className="hidden text-right md:table-cell">24h vol</TableHead>
              <TableHead className="text-right">Vs underlier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => {
              const spread = spreadVsUnderlier(token.quote.price, underlierPrice);
              const isClosest =
                closestId !== null &&
                closestId !== undefined &&
                token.cryptoId === closestId;
              const isMostVolume =
                mostVolumeId !== null &&
                mostVolumeId !== undefined &&
                token.cryptoId === mostVolumeId;
              return (
                <TableRow key={`${token.cryptoId}-${token.symbol}-${token.issuerId}`}>
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{token.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {token.symbol}
                      {token.cryptoId ? ` · crypto_id ${token.cryptoId}` : ""}
                    </div>
                    <div className="mt-1 text-xs sm:hidden">
                      {token.issuerId ? (
                        <Link
                          className="underline underline-offset-4"
                          href={`/issuer/${token.issuerId}`}
                        >
                          {token.issuerName ?? "Issuer book"}
                        </Link>
                      ) : (
                        (token.issuerName ?? "Issuer not named")
                      )}
                      {" · "}
                      {formatUsd(token.quote.volume24h, { compact: true })} vol
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal sm:table-cell">
                    {token.issuerId ? (
                      <Link
                        className="underline underline-offset-4"
                        href={`/issuer/${token.issuerId}`}
                      >
                        {token.issuerName ?? token.issuerId}
                      </Link>
                    ) : (
                      (token.issuerName ?? "—")
                    )}
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {isClosest ? (
                        <Badge variant="outline" className="font-normal">
                          Closest
                        </Badge>
                      ) : null}
                      {isMostVolume ? (
                        <Badge variant="secondary" className="font-normal">
                          Most volume
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatUsd(token.quote.price)}
                  </TableCell>
                  {showChange ? (
                    <TableCell
                      className={cn(
                        "hidden text-right font-mono tabular-nums md:table-cell",
                        changeClass(token.quote.percentChange24h),
                      )}
                    >
                      {formatPct(token.quote.percentChange24h)}
                    </TableCell>
                  ) : null}
                  {showMcap ? (
                    <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                      {formatUsd(token.quote.marketCap, { compact: true })}
                    </TableCell>
                  ) : null}
                  <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                    {formatUsd(token.quote.volume24h, { compact: true })}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono tabular-nums",
                      spreadClass(spread),
                    )}
                  >
                    {formatPct(spread)}
                    <div className="text-[11px] font-sans font-normal text-muted-foreground sm:hidden">
                      {isClosest ? "Closest" : isMostVolume ? "Most volume" : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DeskSection>
  );
}

function ComparisonSection({
  underlierName,
  underlierSymbol,
  underlierPrice,
  summary,
  tokens,
}: {
  underlierName: string;
  underlierSymbol: string | null;
  underlierPrice: number | null;
  summary: ReturnType<typeof summarizeWrappers>;
  tokens: UnderlyingToken[];
}) {
  if (tokens.length === 0) {
    return (
      <DeskSection
        id="comparison"
        kicker="Underlier ↔ token"
        title="Comparison"
        description="Spread versus the average tokenized price of the underlier."
      >
        <EmptyState title="No wrappers to compare">
          No wrappers to compare against this underlier.
        </EmptyState>
      </DeskSection>
    );
  }

  return (
    <DeskSection
      id="comparison"
      kicker="Underlier ↔ token"
      title="Comparison"
      description="Existing spread versus the average tokenized underlier price. Not a cash-market premium."
    >
      <Table className="text-[13px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Leg</TableHead>
            <TableHead>Instrument</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Spread</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-muted-foreground">Underlier</TableCell>
            <TableCell className="whitespace-normal">
              <span className="font-medium">{underlierName}</span>
              {underlierSymbol ? (
                <div className="font-mono text-xs text-muted-foreground">{underlierSymbol}</div>
              ) : null}
              <div className="text-xs text-muted-foreground">Average tokenized price</div>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatUsd(underlierPrice)}
            </TableCell>
            <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
          </TableRow>
          {summary.closest ? (
            <TableRow>
              <TableCell className="text-muted-foreground">Closest</TableCell>
              <TableCell className="whitespace-normal">
                <span className="font-mono font-medium">{summary.closest.symbol}</span>
                {summary.closest.issuerName ? (
                  <div className="text-xs text-muted-foreground">{summary.closest.issuerName}</div>
                ) : null}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatUsd(
                  tokens.find((token) => token.cryptoId === summary.closest?.cryptoId)?.quote
                    .price ?? null,
                )}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono tabular-nums",
                  spreadClass(summary.closest.spreadPct),
                )}
              >
                {formatPct(summary.closest.spreadPct)}
              </TableCell>
            </TableRow>
          ) : null}
          {summary.mostVolume &&
          summary.mostVolume.cryptoId !== summary.closest?.cryptoId ? (
            <TableRow>
              <TableCell className="text-muted-foreground">Most volume</TableCell>
              <TableCell className="whitespace-normal">
                <span className="font-mono font-medium">{summary.mostVolume.symbol}</span>
                {summary.mostVolume.issuerName ? (
                  <div className="text-xs text-muted-foreground">
                    {summary.mostVolume.issuerName}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatUsd(
                  tokens.find((token) => token.cryptoId === summary.mostVolume?.cryptoId)
                    ?.quote.price ?? null,
                )}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono tabular-nums",
                  spreadClass(summary.mostVolume.spreadPct),
                )}
              >
                {formatPct(summary.mostVolume.spreadPct)}
              </TableCell>
            </TableRow>
          ) : summary.mostVolume ? (
            <TableRow>
              <TableCell className="text-muted-foreground">Most volume</TableCell>
              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                Same wrapper as closest
                {summary.mostVolume.volume24h != null
                  ? ` · ${formatUsd(summary.mostVolume.volume24h, { compact: true })} 24h vol`
                  : ""}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">
        {summary.pricedCount} of {summary.tokenCount} wrappers have a tokenized price in this
        payload.
      </p>
    </DeskSection>
  );
}

function TradfiSection({
  underlierName,
  underlierSymbol,
  markets,
}: {
  underlierName: string;
  underlierSymbol: string | null;
  markets: TradfiMarket[];
}) {
  return (
    <DeskSection
      id="tradfi"
      kicker="CMC-reported venue"
      title="TradFi market"
      description="Venue reported by CMC; not a cash last."
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span className="text-foreground">{underlierName}</span>
        {underlierSymbol ? (
          <span className="font-mono text-xs">{underlierSymbol}</span>
        ) : null}
        <ArrowDown className="size-3.5" aria-hidden />
        <span>CMC-reported venue</span>
      </p>

      {markets.length === 0 ? (
        <EmptyState title="No TradFi venues">No TradFi venues in this payload.</EmptyState>
      ) : (
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Exchange</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Market</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow key={`${market.exchange}-${market.name}-${market.symbol}`}>
                <TableCell className="whitespace-normal">
                  {market.exchange ?? market.name}
                  {market.exchange && market.name && market.name !== market.exchange ? (
                    <div className="text-xs text-muted-foreground">{market.name}</div>
                  ) : null}
                </TableCell>
                <TableCell className="font-mono">{market.symbol ?? "—"}</TableCell>
                <TableCell>
                  {market.marketUrl ? (
                    <ExternalLink
                      className="inline-flex items-center gap-1 underline underline-offset-4"
                      href={market.marketUrl}
                    >
                      Open {market.exchange ?? "market"}
                      <ArrowRight className="size-3" aria-hidden />
                    </ExternalLink>
                  ) : (
                    <span className="text-muted-foreground">No market URL</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DeskSection>
  );
}

function IssuersSection({
  issuers,
  underlierName,
}: {
  issuers: IssuerGroup[];
  underlierName: string;
}) {
  return (
    <DeskSection
      id="issuers"
      kicker="Who wrapped it"
      title="Issuers"
      description={`${underlierName} → issuer → tokenized representation → issuer book.`}
    >
      {issuers.length === 0 ? (
        <EmptyState title="No issuers attached">
          No issuers attached to wrappers in this payload.
        </EmptyState>
      ) : (
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Issuer</TableHead>
              <TableHead>Tokenized representation</TableHead>
              <TableHead className="hidden sm:table-cell">Issuer book</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issuers.map((group) => (
              <TableRow key={group.key}>
                <TableCell className="whitespace-normal font-medium">
                  {group.issuerId ? (
                    <Link
                      className="underline underline-offset-4"
                      href={`/issuer/${group.issuerId}`}
                    >
                      {group.name}
                    </Link>
                  ) : (
                    group.name
                  )}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <ul className="flex flex-col gap-1">
                    {group.tokens.map((token) => (
                      <li key={`${token.cryptoId}-${token.symbol}`} className="font-mono text-xs">
                        {token.symbol}
                        <span className="ml-1.5 font-sans text-muted-foreground">{token.name}</span>
                      </li>
                    ))}
                  </ul>
                  {group.issuerId ? (
                    <Link
                      className="mt-1 inline-flex text-xs underline underline-offset-4 sm:hidden"
                      href={`/issuer/${group.issuerId}`}
                    >
                      View issuer
                    </Link>
                  ) : null}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {group.issuerId ? (
                    <Link
                      className="inline-flex items-center gap-1 underline underline-offset-4"
                      href={`/issuer/${group.issuerId}`}
                    >
                      View issuer
                      <ArrowRight className="size-3" aria-hidden />
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">No issuer id</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DeskSection>
  );
}

function EvidenceSection({
  evidence,
  pathUsed,
}: {
  evidence: CallEvidence[];
  pathUsed: AssetDesk["pathUsed"];
}) {
  return (
    <DeskSection
      id="evidence"
      kicker="Data provenance"
      title="Data & Evidence"
      description="These relationships come from named CoinMarketCap RWA calls on this page load. Secrets are never included."
    >
      <p className="text-xs text-muted-foreground">
        Tokenized quotes path: <span className="font-mono">{pathUsed}</span>
      </p>
      {evidence.length === 0 ? (
        <EmptyState title="No call evidence">No CMC call evidence on this page load.</EmptyState>
      ) : (
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Endpoint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead className="hidden text-right md:table-cell">Latency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evidence.map((item, index) => (
              <TableRow key={`${item.endpoint}-${index}`}>
                <TableCell className="whitespace-normal font-mono text-xs">
                  {item.endpoint}
                  {item.errorMessage ? (
                    <div className="font-sans text-xs text-destructive">{item.errorMessage}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  {item.ok ? (
                    <span>HTTP {item.httpStatus}</span>
                  ) : (
                    <span className="text-destructive">HTTP {item.httpStatus}</span>
                  )}
                </TableCell>
                <TableCell className="hidden capitalize sm:table-cell">{item.source}</TableCell>
                <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                  {item.elapsedMs}ms
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DeskSection>
  );
}

function DeskSection({
  id,
  kicker,
  title,
  description,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5" aria-labelledby={id}>
      <SectionHead id={id} kicker={kicker} title={title} description={description} />
      {children}
    </section>
  );
}

function SafeLogo({ src, name }: { src: string | null | undefined; name: string }) {
  if (!isHttpsUrl(src)) return null;
  return (
    // CMC host is not in next/image remotePatterns; native img keeps this presentation-only.
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

type IssuerGroup = {
  key: string;
  issuerId: string | null;
  name: string;
  tokens: UnderlyingToken[];
};

function groupIssuers(tokens: UnderlyingToken[]): IssuerGroup[] {
  const groups = new Map<string, IssuerGroup>();
  for (const token of tokens) {
    const key = token.issuerId ?? token.issuerName ?? `token:${token.cryptoId ?? token.symbol}`;
    const existing = groups.get(key);
    if (existing) {
      existing.tokens.push(token);
      continue;
    }
    groups.set(key, {
      key,
      issuerId: token.issuerId,
      name: token.issuerName ?? token.issuerId ?? "Unnamed issuer",
      tokens: [token],
    });
  }
  return [...groups.values()];
}

function identityLine(info: AssetInfo | null): string[] {
  if (!info) return [];
  const bits: string[] = [];
  if (info.assetType) bits.push(typeLabel(info.assetType));
  if (info.industry) bits.push(info.industry);
  if (info.primaryExchange) bits.push(info.primaryExchange);
  return bits;
}

function typeLabel(value: string): string {
  if (value === "etf") return "ETF";
  if (value === "government_security") return "Treasury";
  if (value === "real_estate") return "Real estate";
  if (value === "currency") return "FX";
  const formatted = formatType(value);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function shortAbout(text: string | null | undefined): string | null {
  if (!text) return null;
  const cleaned = text.replace(/^#+\s+/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  if (cleaned.length <= 420) return cleaned;
  return `${cleaned.slice(0, 420).replace(/\s+\S*$/, "")}…`;
}

function spreadClass(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value === 0) return "text-muted-foreground";
  if (value > 0) return "text-down";
  return "text-up";
}

function changeClass(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value === 0) return "text-muted-foreground";
  return value > 0 ? "text-up" : "text-down";
}
