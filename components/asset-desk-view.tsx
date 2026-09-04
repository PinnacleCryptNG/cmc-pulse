import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WatchlistButton } from "@/components/watchlist-button";
import {
  DeskLogo,
  EmptyState,
  IdentityRow,
  QuoteBar,
  QuoteStat,
  SectionHead,
  TextLink,
} from "@/components/desk-chrome";
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
import { hostLabel } from "@/lib/safe-url";
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
  const name = info?.name ?? `RWA ${rwaId}`;

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="text-[12px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Underlier universe
        </Link>
        {info?.symbol ? (
          <>
            <span className="text-muted-foreground"> / </span>
            <Link
              href={`/?q=${encodeURIComponent(info.symbol)}`}
              className="font-mono hover:text-mark"
            >
              {info.symbol}
            </Link>
          </>
        ) : null}
        <span className="text-muted-foreground"> / rwa_id {rwaId}</span>
      </nav>

      <header className="flex flex-col gap-3 border-b border-border pb-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Underlier
            </p>
            <h1 className="text-[1.35rem] font-semibold tracking-tight">{name}</h1>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {info?.symbol ? (
                <span className="font-mono text-foreground">{info.symbol}</span>
              ) : null}
              {identityBits.length > 0 ? (
                <>
                  {info?.symbol ? " · " : null}
                  {identityBits.join(" · ")}
                </>
              ) : null}
            </p>
          </div>
          <DeskLogo src={info?.logo} name={name} />
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

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(16rem,18rem)_minmax(0,1fr)_minmax(15rem,17rem)] lg:items-start">
        <div className="order-2 lg:order-1">
          <UnderlierIdentity info={info} rwaId={rwaId} />
          {info?.assetType ? (
            <p className="mt-3 text-[12px] text-muted-foreground">
              <TextLink href={`/?type=${encodeURIComponent(String(info.assetType))}`}>
                More {formatType(String(info.assetType))} underliers
              </TextLink>
            </p>
          ) : null}
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <TokenizedExposure
            tokens={tokens}
            underlierPrice={desk.quote.price}
            underlierName={name}
            closestId={closestId}
            mostVolumeId={mostVolumeId}
            showMcap={showTokenMcap}
            showChange={showTokenChange}
          />
        </div>

        <aside className="order-3 flex flex-col gap-6">
          <TradfiSection
            underlierName={name}
            underlierSymbol={info?.symbol ?? null}
            markets={desk.tradfiMarkets}
          />
          <IssuersSection issuers={issuers} underlierName={name} />
          <EvidenceSection evidence={desk.evidence} pathUsed={desk.pathUsed} />
        </aside>
      </div>

      <ComparisonSection
        underlierName={name}
        underlierSymbol={info?.symbol ?? null}
        underlierPrice={desk.quote.price}
        summary={summary}
        tokens={tokens}
      />
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
        <ExternalLink className="text-mark hover:underline" href={info.website}>
          {hostLabel(info.website)}
        </ExternalLink>
      ),
    });
  }
  const about = shortAbout(info?.description);

  return (
    <DeskSection
      id="underlier"
      kicker="About the underlier"
      title="Underlier"
      description="The instrument being tokenized — not the on-chain wrapper."
    >
      {about ? (
        <p className="text-[13px] text-muted-foreground">{about}</p>
      ) : (
        <p className="text-[13px] text-muted-foreground">No About block returned for this underlier.</p>
      )}
      <dl className="mt-2 grid gap-y-1.5">
        {rows.map((row) => (
          <IdentityRow key={row.label} label={row.label} value={row.value} />
        ))}
      </dl>
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
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Token</TableHead>
              <TableHead className="hidden sm:table-cell">Issuer</TableHead>
              <TableHead className="text-right">Price</TableHead>
              {showChange ? (
                <TableHead className="hidden text-right md:table-cell">24h</TableHead>
              ) : null}
              <TableHead className="hidden text-right md:table-cell">24h vol</TableHead>
              {showMcap ? (
                <TableHead className="hidden text-right lg:table-cell">Mkt cap</TableHead>
              ) : null}
              <TableHead className="text-right">Research</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => {
              const isClosest =
                closestId !== null && closestId !== undefined && token.cryptoId === closestId;
              const isMostVolume =
                mostVolumeId !== null &&
                mostVolumeId !== undefined &&
                token.cryptoId === mostVolumeId;
              const spread = spreadVsUnderlier(token.quote.price, underlierPrice);
              return (
                <TableRow
                  key={`${token.cryptoId}-${token.symbol}-${token.issuerId}`}
                  className="focus-within:bg-muted/60"
                >
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{token.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {token.symbol}
                      {token.cryptoId ? ` · crypto_id ${token.cryptoId}` : ""}
                    </div>
                    <div className="mt-0.5 text-[11px] sm:hidden">
                      {token.issuerId ? (
                        <TextLink href={`/issuer/${token.issuerId}`}>
                          {token.issuerName ?? "View issuer"}
                        </TextLink>
                      ) : (
                        (token.issuerName ?? "Issuer not named")
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal sm:table-cell">
                    {token.issuerId ? (
                      <Link
                        className="font-medium text-foreground hover:text-mark"
                        href={`/issuer/${token.issuerId}`}
                      >
                        {token.issuerName ?? token.issuerId}
                      </Link>
                    ) : (
                      (token.issuerName ?? "—")
                    )}
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {[isClosest ? "Closest" : null, isMostVolume ? "Most volume" : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatUsd(token.quote.price)}
                    <div className={cn("text-[11px]", spreadClass(spread))}>{formatPct(spread)}</div>
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
                  <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                    {formatUsd(token.quote.volume24h, { compact: true })}
                  </TableCell>
                  {showMcap ? (
                    <TableCell className="hidden text-right font-mono tabular-nums lg:table-cell">
                      {formatUsd(token.quote.marketCap, { compact: true })}
                    </TableCell>
                  ) : null}
                  <TableCell className="text-right">
                    {token.issuerId ? (
                      <TextLink href={`/issuer/${token.issuerId}`} className="text-[12px]">
                        View issuer
                      </TextLink>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
        kicker="How it compares"
        title="Tokenized vs underlier"
        description="Spread versus the average tokenized price of the underlier."
      >
        <EmptyState title="No wrappers to compare">
          No wrappers to compare against this underlier.
        </EmptyState>
      </DeskSection>
    );
  }

  const closestToken = tokens.find((token) => token.cryptoId === summary.closest?.cryptoId);
  const volumeToken = tokens.find((token) => token.cryptoId === summary.mostVolume?.cryptoId);

  return (
    <DeskSection
      id="comparison"
      kicker="How it compares"
      title="Tokenized vs underlier (average)"
      description="Existing spread versus the average tokenized underlier price. Not a cash-market premium."
    >
      <div className="grid grid-cols-1 divide-y divide-border border border-border md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Average tokenized price
          </p>
          <p className="mt-1 font-mono text-[15px] tabular-nums">{formatUsd(underlierPrice)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {underlierName}
            {underlierSymbol ? ` · ${underlierSymbol}` : ""}
          </p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Closest price
          </p>
          <p className="mt-1 font-mono text-[15px] tabular-nums">
            {formatUsd(closestToken?.quote.price ?? null)}
            <span className={cn("ml-2 text-[12px]", spreadClass(summary.closest?.spreadPct ?? null))}>
              {formatPct(summary.closest?.spreadPct ?? null)}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {summary.closest
              ? `${summary.closest.symbol}${summary.closest.issuerName ? ` · ${summary.closest.issuerName}` : ""}`
              : "—"}
          </p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Most volume
          </p>
          <p className="mt-1 font-mono text-[15px] tabular-nums">
            {formatUsd(volumeToken?.quote.volume24h ?? summary.mostVolume?.volume24h ?? null, {
              compact: true,
            })}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {summary.mostVolume
              ? `${summary.mostVolume.symbol}${summary.mostVolume.issuerName ? ` · ${summary.mostVolume.issuerName}` : ""}`
              : "—"}
          </p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
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
      kicker="Venue identity"
      title="CMC-reported venue"
      description="Venue identity from this CMC payload. Not a cash-market last, and not necessarily a traditional listing."
    >
      <p className="text-[12px] text-muted-foreground">
        <span className="text-foreground">{underlierName}</span>
        {underlierSymbol ? (
          <>
            {" "}
            <span className="font-mono text-[11px]">{underlierSymbol}</span>
          </>
        ) : null}
      </p>
      {markets.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No venue identity in this payload.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Exchange</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Research</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow
                key={`${market.exchange}-${market.name}-${market.symbol}`}
                className="focus-within:bg-muted/60"
              >
                <TableCell className="whitespace-normal">
                  {market.exchange ?? market.name}
                </TableCell>
                <TableCell className="font-mono">{market.symbol ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {market.marketUrl ? (
                    <ExternalLink className="text-[12px] text-mark hover:underline" href={market.marketUrl}>
                      Open venue
                    </ExternalLink>
                  ) : (
                    <span className="text-muted-foreground">—</span>
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
      description={`${underlierName} → issuer → tokenized representation.`}
    >
      {issuers.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          No issuers attached to wrappers in this payload.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border border border-border">
          {issuers.map((group) => (
            <li key={group.key} className="flex items-baseline justify-between gap-3 px-3 py-2">
              <div className="min-w-0">
                {group.issuerId ? (
                  <Link
                    className="font-medium text-foreground hover:text-mark"
                    href={`/issuer/${group.issuerId}`}
                  >
                    {group.name}
                  </Link>
                ) : (
                  <span className="font-medium">{group.name}</span>
                )}
                <p className="font-mono text-[11px] text-muted-foreground">
                  {group.tokens.map((token) => token.symbol).join(" · ")}
                </p>
              </div>
              {group.issuerId ? (
                <TextLink href={`/issuer/${group.issuerId}`} className="shrink-0 text-[12px]">
                  View issuer
                </TextLink>
              ) : (
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {group.tokens.length}
                </span>
              )}
            </li>
          ))}
        </ul>
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
      title="Evidence"
      description="Named CoinMarketCap RWA calls on this page load."
    >
      <p className="text-[11px] text-muted-foreground">
        Quotes path: <span className="font-mono">{pathUsed}</span>
      </p>
      {evidence.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No CMC call evidence on this page load.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {evidence.map((item, index) => (
            <li key={`${item.endpoint}-${index}`} className="text-[11px]">
              <span className="font-mono">{item.endpoint}</span>
              <span className="ml-2 text-muted-foreground">
                {item.ok ? `HTTP ${item.httpStatus}` : `error ${item.httpStatus}`}
                {` · ${item.elapsedMs}ms`}
              </span>
            </li>
          ))}
        </ul>
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
