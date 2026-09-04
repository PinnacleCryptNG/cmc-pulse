import type { UnderlyingToken } from "./types";

export function spreadVsUnderlier(
  tokenPrice: number | null,
  underlierPrice: number | null,
): number | null {
  if (
    tokenPrice === null ||
    underlierPrice === null ||
    !Number.isFinite(tokenPrice) ||
    !Number.isFinite(underlierPrice) ||
    underlierPrice === 0
  ) {
    return null;
  }
  return ((tokenPrice - underlierPrice) / underlierPrice) * 100;
}

export type WrapperPick = {
  cryptoId: number | null;
  symbol: string;
  issuerName: string | null;
  spreadPct: number | null;
  volume24h: number | null;
};

export type WrapperSummary = {
  tokenCount: number;
  pricedCount: number;
  closest: WrapperPick | null;
  mostVolume: WrapperPick | null;
};

export function summarizeWrappers(
  tokens: UnderlyingToken[],
  underlierPrice: number | null,
): WrapperSummary {
  const priced = tokens.filter((token) => token.quote.price !== null);
  let closest: WrapperPick | null = null;
  for (const token of priced) {
    const spreadPct = spreadVsUnderlier(token.quote.price, underlierPrice);
    if (spreadPct === null) continue;
    if (!closest || Math.abs(spreadPct) < Math.abs(closest.spreadPct ?? Infinity)) {
      closest = {
        cryptoId: token.cryptoId,
        symbol: token.symbol,
        issuerName: token.issuerName,
        spreadPct,
        volume24h: token.quote.volume24h,
      };
    }
  }
  const withVolume = tokens.filter((token) => token.quote.volume24h !== null);
  const top = [...withVolume].sort(
    (a, b) => (b.quote.volume24h ?? 0) - (a.quote.volume24h ?? 0),
  )[0];
  return {
    tokenCount: tokens.length,
    pricedCount: priced.length,
    closest,
    mostVolume: top
      ? {
          symbol: top.symbol,
          cryptoId: top.cryptoId,
          issuerName: top.issuerName,
          spreadPct: spreadVsUnderlier(top.quote.price, underlierPrice),
          volume24h: top.quote.volume24h,
        }
      : null,
  };
}

export function sortTokensByVolume(tokens: UnderlyingToken[]): UnderlyingToken[] {
  return [...tokens].sort((a, b) => (b.quote.volume24h ?? -1) - (a.quote.volume24h ?? -1));
}
