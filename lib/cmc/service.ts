import { cmcGet, hasLiveKey, type CmcCall } from "./client";
import {
  applyCryptoQuotes,
  invertIssuerTokens,
  mergeTokens,
  parseCryptoQuotes,
  parseInfoPayload,
  parseIssuerPayload,
  parseIssuersListPayload,
  parseListPayload,
  parseMapPayload,
  parseMarketPairsPayload,
  parseQuotesPayload,
  TYPE_LABELS,
} from "./parse";
import { ASSET_TYPES, type AssetDesk, type AssetType, type CallEvidence, type IssuerBook, type IssuerDetail, type IssuersResult, type QuotePath, type ScreenerResult, type TypeCount, type UnderlyingToken } from "./types";

const MAP = "/v5/real-world-assets/map";
const INFO = "/v5/real-world-assets/info";
const LIST = "/v5/real-world-assets/assets/list";
const QUOTES = "/v5/real-world-assets/quotes/latest";
const PAIRS = "/v5/real-world-assets/market-pairs/list";
const ISSUERS = "/v5/real-world-assets/issuers/list";
const ISSUER = "/v5/real-world-assets/issuers";
const CRYPTO_QUOTES = "/v2/cryptocurrency/quotes/latest";

type IssuerIndex = {
  at: number;
  issuers: IssuerDetail[];
  tokensByRwa: Map<number, UnderlyingToken[]>;
};

let issuerIndexMemo: IssuerIndex | null = null;
const INDEX_TTL_MS = 5 * 60 * 1000;

function pushEvidence(bucket: CallEvidence[], call: CmcCall) {
  bucket.push(call.evidence);
}

function warningFrom(calls: CmcCall[], extra?: string | null) {
  const failed = calls.filter((call) => !call.ok);
  const parts = failed.map(
    (call) =>
      `${call.endpoint} failed${call.evidence.errorMessage ? `: ${call.evidence.errorMessage}` : ""}`,
  );
  if (extra) parts.push(extra);
  return parts.length ? parts.join(" · ") : null;
}

async function typeCounts(): Promise<{ counts: TypeCount[]; evidence: CallEvidence[] }> {
  const evidence: CallEvidence[] = [];
  const allCall = await cmcGet(MAP, { start: 1, limit: 1, sort: "rwa_id" });
  evidence.push(allCall.evidence);
  const allParsed = parseMapPayload(allCall.payload);

  const perType = await Promise.all(
    ASSET_TYPES.map(async (type) => {
      const call = await cmcGet(MAP, {
        asset_type: type,
        start: 1,
        limit: 1,
        sort: "rwa_id",
      });
      evidence.push(call.evidence);
      const parsed = parseMapPayload(call.payload);
      return {
        type,
        label: TYPE_LABELS[type],
        count: call.ok ? parsed.totalSize : null,
      } satisfies TypeCount;
    }),
  );

  return {
    counts: [
      { type: "all", label: TYPE_LABELS.all, count: allCall.ok ? allParsed.totalSize : null },
      ...perType,
    ],
    evidence,
  };
}

async function poolMap<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await fn(items[index]);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function loadIssuerIndex(evidence: CallEvidence[]) {
  if (issuerIndexMemo && Date.now() - issuerIndexMemo.at < INDEX_TTL_MS) {
    return issuerIndexMemo;
  }
  const collected: IssuerDetail[] = [];
  let start = 1;
  const limit = 250;
  for (let page = 0; page < 4; page += 1) {
    const listCall = await cmcGet(ISSUERS, { start, limit });
    evidence.push(listCall.evidence);
    if (!listCall.ok) break;
    const parsed = parseIssuersListPayload(listCall.payload);
    const details = await poolMap(parsed.issuers, 5, async (summary) => {
      const detailCall = await cmcGet(ISSUER, { issuer_id: summary.issuerId, limit: 250 });
      evidence.push(detailCall.evidence);
      return parseIssuerPayload(detailCall.payload);
    });
    for (const detail of details) {
      if (detail) collected.push(detail);
    }
    if (!parsed.hasMore) break;
    start += limit;
  }
  issuerIndexMemo = {
    at: Date.now(),
    issuers: collected,
    tokensByRwa: invertIssuerTokens(collected),
  };
  return issuerIndexMemo;
}

export async function getScreener(input: {
  q?: string;
  assetType?: string;
  sort?: string;
  sortDir?: string;
  start?: number;
  limit?: number;
}): Promise<ScreenerResult> {
  const query = (input.q ?? "").trim();
  const assetType = (
    ASSET_TYPES.includes(input.assetType as AssetType) ? input.assetType : "all"
  ) as AssetType | "all";
  const sort = input.sort || "rwa_rank";
  const sortDir = input.sortDir === "desc" ? "desc" : "asc";
  const start = input.start && input.start > 0 ? input.start : 1;
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);
  const evidence: CallEvidence[] = [];
  const counts = await typeCounts();
  evidence.push(...counts.evidence);

  const listQuery: Record<string, string | number> = {
    start,
    limit,
    sort,
    sort_dir: sortDir,
    convert: "USD",
  };
  if (assetType !== "all") listQuery.asset_type = assetType;

  const pathUsed: QuotePath = "assets-list";
  let listCall: CmcCall;
  let hint: string | null = null;

  if (query) {
    if (/^\d+$/.test(query)) {
      listCall = await cmcGet(LIST, { ...listQuery, rwa_id: query, skip_invalid: "true" });
    } else {
      listCall = await cmcGet(LIST, {
        ...listQuery,
        symbol: query.toUpperCase(),
        skip_invalid: "true",
      });
      if (listCall.ok && parseListPayload(listCall.payload).assets.length === 0) {
        const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slugCall = await cmcGet(LIST, {
          ...listQuery,
          rwa_slug: slug,
          skip_invalid: "true",
        });
        evidence.push(listCall.evidence);
        listCall = slugCall;
      }
      if (listCall.ok && parseListPayload(listCall.payload).assets.length === 0) {
        const mapCall = await cmcGet(MAP, { symbol: query.toUpperCase() });
        evidence.push(mapCall.evidence);
        const mapped = parseMapPayload(mapCall.payload).assets;
        if (mapped.length) {
          const byId = await cmcGet(LIST, {
            ...listQuery,
            rwa_id: mapped.map((asset) => asset.rwaId).join(","),
            skip_invalid: "true",
          });
          evidence.push(listCall.evidence);
          listCall = byId;
        } else {
          hint =
            "CMC has no name-search parameter. Underlier tries symbol, slug, then rwa_id.";
        }
      }
    }
  } else {
    listCall = await cmcGet(LIST, listQuery);
  }

  evidence.push(listCall.evidence);
  const parsed = parseListPayload(listCall.payload);

  if (!listCall.ok) {
    const mapFallback = await cmcGet(MAP, {
      start,
      limit,
      sort: "rwa_rank",
      ...(assetType !== "all" ? { asset_type: assetType } : {}),
    });
    evidence.push(mapFallback.evidence);
    const mapped = parseMapPayload(mapFallback.payload);
    return {
      source: listCall.source,
      pathUsed: "none",
      query,
      assetType,
      sort,
      sortDir,
      start,
      limit,
      totalSize: mapped.totalSize,
      hasMore: mapped.hasMore,
      typeCounts: counts.counts,
      assets: mapped.assets.map((asset) => ({
        ...asset,
        quote: { price: null, marketCap: null, volume24h: null, percentChange24h: null },
      })),
      evidence,
      warning: warningFrom([listCall], "Showing ID map without tokenized quotes."),
    };
  }

  let assets = parsed.assets;
  if (query && hasLiveKey() === false) {
    const needle = query.toLowerCase();
    assets = assets.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(needle) ||
        asset.name.toLowerCase().includes(needle) ||
        String(asset.rwaId) === needle,
    );
  }

  return {
    source: listCall.source,
    pathUsed,
    query,
    assetType,
    sort,
    sortDir,
    start,
    limit,
    totalSize: parsed.totalSize,
    hasMore: parsed.hasMore,
    typeCounts: counts.counts,
    assets,
    evidence,
    warning: warningFrom([], hint),
  };
}

export async function getAssetDesk(rwaId: string): Promise<AssetDesk> {
  const evidence: CallEvidence[] = [];
  const [infoCall, quotesCall, pairsCall] = await Promise.all([
    cmcGet(INFO, { rwa_id: rwaId, skip_invalid: "true" }),
    cmcGet(QUOTES, { rwa_id: rwaId, convert: "USD", skip_invalid: "true" }),
    cmcGet(PAIRS, { rwa_id: rwaId, convert: "USD", sort: "volume_24h", sort_dir: "desc" }),
  ]);
  pushEvidence(evidence, infoCall);
  pushEvidence(evidence, quotesCall);
  pushEvidence(evidence, pairsCall);

  const info = parseInfoPayload(infoCall.payload)[0] ?? null;
  const quotes = parseQuotesPayload(quotesCall.payload);
  const pairs = parseMarketPairsPayload(pairsCall.payload);
  let quote = quotes.assets[0]?.quote ?? {
    price: null,
    marketCap: null,
    volume24h: null,
    percentChange24h: null,
  };
  let tokens = quotes.tokensByRwaId.get(Number(rwaId)) ?? [];
  const tradfi = quotes.tradfiByRwaId.get(Number(rwaId)) ?? [];
  let pathUsed: QuotePath = quotesCall.ok ? "rwa-quotes" : "none";

  if (!quotesCall.ok || (!quote.price && !quote.marketCap)) {
    const listCall = await cmcGet(LIST, { rwa_id: rwaId, convert: "USD", skip_invalid: "true" });
    evidence.push(listCall.evidence);
    const listed = parseListPayload(listCall.payload).assets[0];
    if (listed) {
      quote = listed.quote;
      pathUsed = "assets-list";
    }
  }

  const needsIssuerJoin =
    tokens.length === 0 || tokens.some((token) => !token.issuerId || !token.issuerName);
  if (needsIssuerJoin) {
    const index = await loadIssuerIndex(evidence);
    const fromIssuers = index.tokensByRwa.get(Number(rwaId)) ?? [];
    tokens = mergeTokens(tokens, fromIssuers);
  }

  const missingPrices = tokens.filter((token) => token.cryptoId && token.quote.price === null);
  if (missingPrices.length) {
    const ids = missingPrices
      .map((token) => token.cryptoId)
      .filter((id): id is number => id !== null);
    const cryptoCall = await cmcGet(CRYPTO_QUOTES, {
      id: ids.join(","),
      convert: "USD",
    });
    evidence.push(cryptoCall.evidence);
    if (cryptoCall.ok) {
      tokens = applyCryptoQuotes(tokens, parseCryptoQuotes(cryptoCall.payload));
      pathUsed = "crypto-fallback";
    }
  }

  const source = [infoCall, quotesCall, pairsCall].some((call) => call.source === "live")
    ? "live"
    : "fixture";

  return {
    source,
    pathUsed,
    info,
    quote,
    tokens,
    tradfiMarkets: tradfi,
    marketPairs: pairs.pairs,
    numMarketPairs: pairs.numMarketPairs,
    evidence,
    warning: warningFrom(
      [infoCall, quotesCall, pairsCall],
      !info ? `No metadata for rwa_id ${rwaId}.` : null,
    ),
  };
}

export async function getIssuers(input: {
  start?: number;
  limit?: number;
}): Promise<IssuersResult> {
  const start = input.start && input.start > 0 ? input.start : 1;
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 250);
  const call = await cmcGet(ISSUERS, { start, limit });
  const parsed = parseIssuersListPayload(call.payload);
  return {
    source: call.source,
    issuers: parsed.issuers,
    totalSize: parsed.totalSize,
    hasMore: parsed.hasMore,
    start,
    limit,
    evidence: [call.evidence],
    warning: warningFrom([call]),
  };
}

export async function getIssuerBook(issuerId: string): Promise<IssuerBook> {
  const call = await cmcGet(ISSUER, { issuer_id: issuerId, limit: 250 });
  return {
    source: call.source,
    issuer: parseIssuerPayload(call.payload),
    evidence: [call.evidence],
    warning: warningFrom(
      [call],
      call.ok && !parseIssuerPayload(call.payload)
        ? "Issuer payload did not include an issuer_id."
        : null,
    ),
  };
}

export { hasLiveKey, liveKeyConfigured } from "./client";
