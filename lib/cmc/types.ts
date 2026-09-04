export const ASSET_TYPES = [
  "stock",
  "commodity",
  "currency",
  "government_security",
  "etf",
  "real_estate",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export type DataSource = "live" | "fixture";
export type QuotePath = "rwa-quotes" | "assets-list" | "crypto-fallback" | "none";

export type CmcStatus = {
  timestamp?: string;
  error_code?: string | number;
  error_message?: string | null;
  elapsed?: number;
  credit_count?: number;
};

export type CallEvidence = {
  endpoint: string;
  method: "GET";
  query: Record<string, string>;
  ok: boolean;
  httpStatus: number;
  errorCode: string | number | null;
  errorMessage: string | null;
  creditCount: number | null;
  elapsedMs: number;
  fetchedAt: string;
  source: DataSource;
  responsePreview: unknown;
};

export type UsdQuote = {
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  percentChange24h: number | null;
};

export type MappedAsset = {
  rwaId: number;
  name: string;
  symbol: string;
  slug: string;
  assetType: AssetType | string;
  rwaRank: number | null;
  hasTokens: boolean | null;
};

export type ListedAsset = MappedAsset & {
  quote: UsdQuote;
};

export type AssetInfo = MappedAsset & {
  description: string | null;
  website: string | null;
  logo: string | null;
  primaryExchange: string | null;
  industry: string | null;
  employees: number | null;
  founded: string | null;
  cik: string | null;
};

export type UnderlyingToken = {
  cryptoId: number | null;
  name: string;
  symbol: string;
  rwaId: number | null;
  issuerId: string | null;
  issuerName: string | null;
  quote: UsdQuote;
};

export type TradfiMarket = {
  name: string;
  exchange: string | null;
  symbol: string | null;
  price: number | null;
  currency: string | null;
  marketUrl: string | null;
};

export type MarketPair = {
  exchange: string | null;
  marketPair: string;
  category: string | null;
  price: number | null;
  volume24h: number | null;
};

export type IssuerSummary = {
  issuerId: string;
  name: string;
  website: string | null;
  logo: string | null;
  numTokens: number | null;
  active: boolean | null;
};

export type IssuerToken = {
  cryptoId: number | null;
  name: string;
  symbol: string;
  rwaId: number | null;
};

export type IssuerDetail = IssuerSummary & {
  tokens: IssuerToken[];
  totalSize: number | null;
  hasMore: boolean;
};

export type TypeCount = {
  type: AssetType | "all";
  label: string;
  count: number | null;
};

export type ScreenerResult = {
  source: DataSource;
  pathUsed: QuotePath;
  query: string;
  assetType: AssetType | "all";
  sort: string;
  sortDir: "asc" | "desc";
  start: number;
  limit: number;
  totalSize: number;
  hasMore: boolean;
  typeCounts: TypeCount[];
  assets: ListedAsset[];
  evidence: CallEvidence[];
  warning: string | null;
};

export type AssetDesk = {
  source: DataSource;
  pathUsed: QuotePath;
  info: AssetInfo | null;
  quote: UsdQuote;
  tokens: UnderlyingToken[];
  tradfiMarkets: TradfiMarket[];
  marketPairs: MarketPair[];
  numMarketPairs: number | null;
  evidence: CallEvidence[];
  warning: string | null;
};

export type IssuersResult = {
  source: DataSource;
  issuers: IssuerSummary[];
  totalSize: number;
  hasMore: boolean;
  start: number;
  limit: number;
  evidence: CallEvidence[];
  warning: string | null;
};

export type IssuerBook = {
  source: DataSource;
  issuer: IssuerDetail | null;
  evidence: CallEvidence[];
  warning: string | null;
};
