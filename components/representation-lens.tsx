import type { AssetDesk, TradfiMarket } from "@/lib/cmc/types";
import { formatPct, formatUsd } from "@/lib/cmc/format";
import { cn } from "@/lib/utils";

type LensState = "aligned" | "watch" | "divergent" | "unavailable";

type Props = {
  desk: AssetDesk;
  underlierName: string;
};

/**
 * UnderScope's derived comparison layer.
 * It does not score issuers or claim that a representation is safe.
 * It only compares the CMC-reported TradFi reference, tokenized aggregate,
 * and issuer-level wrapper prices when those values are available.
 */
export function RepresentationLens({ desk, underlierName }: Props) {
  const reference = findReferenceMarket(desk.tradfiMarkets);
  const tokenizedPrice = desk.quote.price;
  const tokenPrices = desk.tokens
    .map((token) => token.quote.price)
    .filter((price): price is number => price !== null && Number.isFinite(price));

  const referenceSpread = percentDifference(tokenizedPrice, reference?.price ?? null);
  const wrapperSpread = wrapperDispersion(tokenPrices);
  const state = lensState(referenceSpread);
  const hasReference = reference?.price != null && tokenizedPrice != null;
  const hasWrappers = tokenPrices.length > 0;

  return (
    <section aria-labelledby="representation-lens" className="border border-border bg-surface">
      <div className="border-b border-border px-3 py-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-mark">
              UnderScope Lens
            </p>
            <h2 id="representation-lens" className="mt-0.5 text-[15px] font-semibold tracking-tight">
              Representation check
            </h2>
            <p className="mt-0.5 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
              A compact comparison of {underlierName} across the reported market reference, tokenized aggregate, and issuer wrappers.
            </p>
          </div>
          <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", stateClass(state))}>
            {stateLabel(state)}
          </span>
        </div>
      </div>

      <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
        <LensCell
          label="Market reference"
          value={formatUsd(reference?.price ?? null)}
          detail={reference ? marketLabel(reference) : "No priced CMC venue reference"}
          tone={reference?.price != null ? "neutral" : "muted"}
        />
        <LensCell
          label="Tokenized aggregate"
          value={formatUsd(tokenizedPrice)}
          detail={hasReference ? `${formatSignedPct(referenceSpread)} vs reference` : "Aggregate wrapper price"}
          tone={state === "divergent" ? "attention" : "neutral"}
        />
        <LensCell
          label="Wrapper dispersion"
          value={wrapperSpread === null ? "—" : formatPct(wrapperSpread)}
          detail={
            hasWrappers
              ? `${tokenPrices.length} priced wrapper${tokenPrices.length === 1 ? "" : "s"} · ${dispersionLabel(wrapperSpread)}`
              : "No priced wrappers returned"
          }
          tone={wrapperSpread !== null && wrapperSpread > 2 ? "attention" : "neutral"}
        />
      </div>

      <div className="border-t border-border px-3 py-2.5">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {buildObservation({ reference, referenceSpread, wrapperSpread, tokenizedPrice, tokenPrices, underlierName })}
        </p>
      </div>
    </section>
  );
}

function LensCell({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "attention" | "muted";
}) {
  return (
    <div className="px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-[17px] tabular-nums", tone === "attention" ? "text-down" : tone === "muted" ? "text-muted-foreground" : "text-foreground")}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function findReferenceMarket(markets: TradfiMarket[]): TradfiMarket | null {
  return markets.find((market) => market.price != null && market.currency?.toUpperCase() === "USD")
    ?? markets.find((market) => market.price != null)
    ?? null;
}

function percentDifference(value: number | null, reference: number | null): number | null {
  if (value === null || reference === null || !Number.isFinite(value) || !Number.isFinite(reference) || reference === 0) return null;
  return ((value - reference) / reference) * 100;
}

function wrapperDispersion(prices: number[]): number | null {
  if (prices.length < 2) return null;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const midpoint = (low + high) / 2;
  if (!Number.isFinite(midpoint) || midpoint === 0) return null;
  return ((high - low) / midpoint) * 100;
}

function lensState(spread: number | null): LensState {
  if (spread === null || !Number.isFinite(spread)) return "unavailable";
  const distance = Math.abs(spread);
  if (distance <= 0.5) return "aligned";
  if (distance <= 2) return "watch";
  return "divergent";
}

function stateLabel(state: LensState): string {
  if (state === "aligned") return "Near reference";
  if (state === "watch") return "Spread detected";
  if (state === "divergent") return "Large spread";
  return "Reference unavailable";
}

function stateClass(state: LensState): string {
  if (state === "aligned") return "text-up";
  if (state === "divergent") return "text-down";
  return "text-muted-foreground";
}

function dispersionLabel(value: number | null): string {
  if (value === null) return "single wrapper";
  if (value <= 0.5) return "tight range";
  if (value <= 2) return "mixed range";
  return "wide range";
}

function formatSignedPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "reference unavailable";
  return `${value >= 0 ? "+" : ""}${formatPct(value)}`;
}

function marketLabel(market: TradfiMarket): string {
  const parts = [market.exchange, market.symbol].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "CMC-reported market reference";
}

function buildObservation({
  reference,
  referenceSpread,
  wrapperSpread,
  tokenizedPrice,
  tokenPrices,
  underlierName,
}: {
  reference: TradfiMarket | null;
  referenceSpread: number | null;
  wrapperSpread: number | null;
  tokenizedPrice: number | null;
  tokenPrices: number[];
  underlierName: string;
}): string {
  if (reference && referenceSpread !== null && tokenizedPrice !== null) {
    const direction = referenceSpread > 0 ? "above" : referenceSpread < 0 ? "below" : "at";
    const wrapperNote = wrapperSpread !== null
      ? ` Issuer wrappers span ${formatPct(wrapperSpread)} from low to high.`
      : "";
    return `${underlierName} is ${formatPct(Math.abs(referenceSpread))} ${direction} the CMC-reported market reference.${wrapperNote} This is a market comparison, not a quality or risk score.`;
  }
  if (tokenPrices.length > 1 && wrapperSpread !== null) {
    return `${underlierName} has ${tokenPrices.length} priced issuer wrappers spanning ${formatPct(wrapperSpread)} from low to high. No priced CMC market reference was available for this check.`;
  }
  return "The Lens needs both a priced tokenized representation and a priced CMC market reference to compare parity.";
}
