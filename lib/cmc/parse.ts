import { safeHttpsUrl } from "../safe-url";
import { ASSET_TYPES, type AssetType, type AssetInfo, type IssuerDetail, type IssuerSummary, type IssuerToken, type ListedAsset, type MappedAsset, type MarketPair, type TradfiMarket, type UnderlyingToken, type UsdQuote } from "./types";

export const TYPE_LABELS: Record<AssetType | "all", string> = {
  all: "All",
  stock: "Stocks",
  commodity: "Commodities",
  currency: "FX",
  government_security: "Treasuries",
  etf: "ETFs",
  real_estate: "Real Estate",
};

function asHttps(value: unknown): string | null {
  return safeHttpsUrl(asString(value));
}

function websiteLogo(value: string | null): string | null {
  if (!value) return null;
  try {
    const hostname = new URL(value).hostname;
    return hostname
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`
      : null;
  } catch {
    return null;
  }
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return null;
}

export function asArray(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }

export function asString(value: unknown): string | null {
  if (typeof value === "string") { const trimmed = value.trim(); return trimmed.length ? trimmed : null; }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }
  return null;
}

export function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function pick(record: Record<string, unknown> | null, ...keys: string[]): unknown {
  if (!record) return undefined;
  for (const key of keys) if (key in record && record[key] !== undefined && record[key] !== null) return record[key];
  return undefined;
}

export function isCmcOk(status: unknown): boolean {
  const record = asRecord(status); if (!record) return true;
  const code = record.error_code; return code === 0 || code === "0" || code === undefined || code === null;
}

export function extractStatus(payload: unknown): Record<string, unknown> | null { return asRecord(asRecord(payload)?.status); }

export function extractData(payload: unknown): unknown {
  const record = asRecord(payload); return !record ? payload : "data" in record ? record.data : payload;
}

function extractNamedArray(data: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data); if (!record) return [];
  for (const key of keys) { const value = record[key]; if (Array.isArray(value)) return value; }
  const values = Object.values(record);
  return values.length > 0 && values.every((item) => item && typeof item === "object" && !Array.isArray(item)) ? values : [];
}

export function parseAssetType(value: unknown): AssetType | string {
  const raw = asString(value)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!raw) return "stock";
  return (ASSET_TYPES as readonly string[]).includes(raw) ? raw as AssetType : raw;
}

function usdFromQuoteBag(bag: unknown): UsdQuote {
  const record = asRecord(bag); const usd = asRecord(record?.USD) ?? asRecord(record?.usd) ?? record;
  return {
    price: asNumber(pick(usd, "average_tokenized_price", "tokenized_price", "price")),
    marketCap: asNumber(pick(usd, "tokenized_market_cap", "market_cap", "tokenizedMarketCap")),
    volume24h: asNumber(pick(usd, "tokenized_volume_24h", "volume_24h", "volume24h")),
    percentChange24h: asNumber(pick(usd, "percent_change_24h", "percentChange24h")),
  };
}

export function parseUsdQuote(asset: unknown): UsdQuote {
  const record = asRecord(asset); const fromQuote = usdFromQuoteBag(record?.quote);
  const fromQuotesArray = (() => { const rows = asArray(record?.quotes).map(asRecord).filter(Boolean) as Record<string, unknown>[]; const usd = rows.find((row) => asString(row.symbol)?.toUpperCase() === "USD") ?? rows[0]; return usdFromQuoteBag(usd); })();
  const direct: UsdQuote = { price: asNumber(pick(record, "average_tokenized_price", "tokenized_price", "price")), marketCap: asNumber(pick(record, "tokenized_market_cap", "market_cap")), volume24h: asNumber(pick(record, "tokenized_volume_24h", "volume_24h")), percentChange24h: asNumber(pick(record, "percent_change_24h")) };
  return { price: fromQuote.price ?? fromQuotesArray.price ?? direct.price, marketCap: fromQuote.marketCap ?? fromQuotesArray.marketCap ?? direct.marketCap, volume24h: fromQuote.volume24h ?? fromQuotesArray.volume24h ?? direct.volume24h, percentChange24h: fromQuote.percentChange24h ?? fromQuotesArray.percentChange24h ?? direct.percentChange24h };
}

export function parseMappedAsset(asset: unknown): MappedAsset | null {
  const record = asRecord(asset); const rwaId = asNumber(pick(record, "rwa_id", "rwaId", "id")); const name = asString(pick(record, "name")); const symbol = asString(pick(record, "symbol"));
  if (rwaId === null || !name || !symbol) return null;
  return { rwaId, name, symbol, slug: asString(pick(record, "slug", "rwa_slug")) ?? symbol.toLowerCase(), assetType: parseAssetType(pick(record, "asset_type", "assetType", "type")), rwaRank: asNumber(pick(record, "rwa_rank", "rwaRank", "rank")), hasTokens: asBoolean(pick(record, "has_tokens", "hasTokens")) };
}

export function parseListedAsset(asset: unknown): ListedAsset | null { const mapped = parseMappedAsset(asset); return mapped ? { ...mapped, quote: parseUsdQuote(asset) } : null; }

export function parseAssetInfo(asset: unknown): AssetInfo | null {
  const mapped = parseMappedAsset(asset); if (!mapped) return null; const record = asRecord(asset); const about = asRecord(record?.about) ?? asRecord(record?.urls) ?? {}; const company = asRecord(record?.company) ?? record;
  const website = asHttps(pick(about, "website")) ?? asHttps(pick(record, "website")) ?? asHttps(asArray(about.website)[0]);
  const logo = asHttps(pick(about, "logo")) ?? asHttps(pick(record, "logo", "logo_url")) ?? websiteLogo(website);
  return { ...mapped, description: asString(pick(about, "description")) ?? asString(pick(record, "description")), website, logo, primaryExchange: asString(pick(company, "primary_exchange", "primaryExchange", "exchange")), industry: asString(pick(company, "industry", "sector")), employees: asNumber(pick(company, "employees", "employee_count")), founded: asString(pick(company, "founded", "date_founded", "founding_date")), cik: asString(pick(company, "cik", "sec_cik")) };
}

export function parseUnderlyingToken(token: unknown): UnderlyingToken | null {
  const record = asRecord(token); if (!record) return null; const issuer = asRecord(record.issuer); const name = asString(pick(record, "name")); const symbol = asString(pick(record, "symbol")); if (!name && !symbol) return null;
  return { cryptoId: asNumber(pick(record, "crypto_id", "cryptoId", "id")), name: name ?? symbol ?? "Token", symbol: symbol ?? "—", rwaId: asNumber(pick(record, "rwa_id", "rwaId")), issuerId: asString(pick(record, "issuer_id", "issuerId")) ?? asString(pick(issuer, "issuer_id", "id")), issuerName: asString(pick(record, "issuer_name", "issuerName")) ?? asString(pick(issuer, "name")), quote: parseUsdQuote(token) };
}

export function parseTradfiMarket(market: unknown): TradfiMarket | null {
  const record = asRecord(market); if (!record) return null; const exchangeRecord = asRecord(record.exchange); const name = asString(pick(record, "name", "market", "venue")) ?? asString(pick(exchangeRecord, "name")) ?? asString(pick(record, "ticker", "symbol")); if (!name) return null; const quote = parseUsdQuote(market);
  return { name, exchange: asString(pick(exchangeRecord, "name")) ?? asString(pick(record, "exchange")), symbol: asString(pick(record, "symbol", "ticker")), price: quote.price ?? asNumber(pick(record, "last", "close")), currency: asString(pick(record, "currency", "quote_currency")) ?? "USD", marketUrl: asHttps(pick(record, "market_url", "url", "website")) };
}

export function parseMarketPair(pair: unknown): MarketPair | null {
  const record = asRecord(pair); if (!record) return null; const exchange = asString(pick(asRecord(record.exchange), "name")) ?? asString(pick(record, "exchange_name", "exchange")); const marketPair = asString(pick(record, "market_pair", "pair", "name")) ?? [asString(pick(record, "base")), asString(pick(record, "quote"))].filter(Boolean).join("/"); if (!marketPair) return null; const quote = parseUsdQuote(pair);
  return { exchange, marketPair, category: asString(pick(record, "category", "market_pair_category")), price: quote.price, volume24h: quote.volume24h };
}

export function parseIssuerSummary(issuer: unknown): IssuerSummary | null {
  const record = asRecord(issuer); const issuerId = asString(pick(record, "issuer_id", "issuerId", "id")); const name = asString(pick(record, "name")); if (!issuerId || !name) return null;
  return { issuerId, name, website: asHttps(pick(record, "website")), logo: asHttps(pick(record, "logo")), numTokens: asNumber(pick(record, "num_tokens", "numTokens", "token_count")), active: asBoolean(pick(record, "active", "is_active")) };
}

export function parseIssuerToken(token: unknown): IssuerToken | null {
  const record = asRecord(token); const name = asString(pick(record, "name")); const symbol = asString(pick(record, "symbol")); if (!name && !symbol) return null;
  return { cryptoId: asNumber(pick(record, "crypto_id", "cryptoId", "id")), name: name ?? symbol ?? "Token", symbol: symbol ?? "—", rwaId: asNumber(pick(record, "rwa_id", "rwaId")), underlierName: asString(pick(record, "underlier_name", "underlierName")), underlierSymbol: asString(pick(record, "underlier_symbol", "underlierSymbol")), underlierType: asString(pick(record, "underlier_type", "underlierType", "asset_type")) };
}

export function parseMapPayload(payload: unknown): { assets: MappedAsset[]; totalSize: number; hasMore: boolean } {
  const data = extractData(payload); const record = asRecord(data); const assets = extractNamedArray(data, "rwa_assets", "assets").map(parseMappedAsset).filter((item): item is MappedAsset => item !== null); return { assets, totalSize: asNumber(record?.total_size) ?? assets.length, hasMore: asBoolean(record?.has_more) ?? false };
}

export function parseListPayload(payload: unknown): { assets: ListedAsset[]; totalSize: number; hasMore: boolean } {
  const data = extractData(payload); const record = asRecord(data); const assets = extractNamedArray(data, "rwa_assets", "assets").map(parseListedAsset).filter((item): item is ListedAsset => item !== null); return { assets, totalSize: asNumber(record?.total_size) ?? assets.length, hasMore: asBoolean(record?.has_more) ?? false };
}

export function parseInfoPayload(payload: unknown): AssetInfo[] { const data = extractData(payload); return extractNamedArray(data, "rwa_assets", "assets").map(parseAssetInfo).filter((item): item is AssetInfo => item !== null); }

export function parseQuotesPayload(payload: unknown): { assets: ListedAsset[]; tokensByRwaId: Map<number, UnderlyingToken[]>; tradfiByRwaId: Map<number, TradfiMarket[]> } {
  const data = extractData(payload); const rawAssets = extractNamedArray(data, "rwa_assets", "assets"); const tokensByRwaId = new Map<number, UnderlyingToken[]>(); const tradfiByRwaId = new Map<number, TradfiMarket[]>(); const assets: ListedAsset[] = [];
  for (const raw of rawAssets) { const listed = parseListedAsset(raw); if (!listed) continue; assets.push(listed); const record = asRecord(raw); const tokens = extractNamedArray(record, "tokens", "underlying_tokens", "onchain_tokens").map(parseUnderlyingToken).filter((item): item is UnderlyingToken => item !== null).map((token) => ({ ...token, rwaId: token.rwaId ?? listed.rwaId })); tokensByRwaId.set(listed.rwaId, tokens); const tradfi = extractNamedArray(record, "tradfi_markets", "tradfi", "traditional_markets").map(parseTradfiMarket).filter((item): item is TradfiMarket => item !== null); tradfiByRwaId.set(listed.rwaId, tradfi); }
  return { assets, tokensByRwaId, tradfiByRwaId };
}

export function parseMarketPairsPayload(payload: unknown): { rwaId: number | null; name: string | null; symbol: string | null; numMarketPairs: number | null; pairs: MarketPair[]; totalSize: number; hasMore: boolean } {
  const data = extractData(payload); const record = asRecord(data); const pairs = extractNamedArray(record?.market_pairs ?? record, "market_pairs", "pairs").map(parseMarketPair).filter((item): item is MarketPair => item !== null);
  return { rwaId: asNumber(pick(record, "rwa_id", "rwaId")), name: asString(pick(record, "name")), symbol: asString(pick(record, "symbol")), numMarketPairs: asNumber(pick(record, "num_market_pairs", "numMarketPairs")), pairs, totalSize: asNumber(pick(record, "total_size")) ?? pairs.length, hasMore: asBoolean(pick(record, "has_more")) ?? false };
}

export function parseIssuerPayload(payload: unknown): IssuerDetail | null {
  const data = extractData(payload); const record = asRecord(data); if (!record) return null; const issuerId = asString(pick(record, "issuer_id", "issuerId", "id")); const name = asString(pick(record, "name")); if (!issuerId || !name) return null; const tokens = extractNamedArray(record, "tokens").map(parseIssuerToken).filter((item): item is IssuerToken => item !== null);
  return { issuerId, name, website: asHttps(pick(record, "website")), logo: asHttps(pick(record, "logo")), numTokens: asNumber(pick(record, "num_tokens", "numTokens", "token_count")), active: asBoolean(pick(record, "active", "is_active")), tokens, totalSize: asNumber(pick(record, "total_size")) ?? tokens.length, hasMore: asBoolean(pick(record, "has_more")) ?? false };
}

export function parseIssuersListPayload(payload: unknown): { issuers: IssuerSummary[]; totalSize: number; hasMore: boolean } {
  const data = extractData(payload); const record = asRecord(data); const issuers = extractNamedArray(data, "issuers").map(parseIssuerSummary).filter((item): item is IssuerSummary => item !== null); return { issuers, totalSize: asNumber(record?.total_size) ?? issuers.length, hasMore: asBoolean(record?.has_more) ?? false };
}

export function parseCryptoQuotes(payload: unknown): Map<number, UsdQuote> {
  const data = extractData(payload); const record = asRecord(data); const result = new Map<number, UsdQuote>();
  for (const [key, value] of Object.entries(record ?? {})) { const item = asRecord(value); const id = asNumber(pick(item, "id")) ?? asNumber(key); if (id !== null) result.set(id, parseUsdQuote(item)); }
  return result;
}

export function applyCryptoQuotes(tokens: UnderlyingToken[], quotes: Map<number, UsdQuote>): UnderlyingToken[] { return tokens.map((token) => token.cryptoId !== null && quotes.has(token.cryptoId) ? { ...token, quote: quotes.get(token.cryptoId)! } : token); }
