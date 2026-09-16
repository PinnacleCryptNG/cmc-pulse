import { parseSortDir, parseSortParam } from "../search-params";
import { cmcGet, hasLiveKey, type CmcCall } from "./client";
import {
  applyCryptoQuotes,
  parseCryptoQuotes,
  parseInfoPayload,
  parseIssuerPayload,
  parseIssuersListPayload,
  parseListPayload,
  parseMapPayload,
  parseQuotesPayload,
} from "./parse";
import { ASSET_TYPES, TYPE_LABELS, type AssetDesk, type AssetType, type CallEvidence, type IssuerBook, type IssuersResult, type QuotePath, type ScreenerResult, type TypeCount } from "./types";

const MAP = "/v5/real-world-assets/map";
const INFO = "/v5/real-world-assets/info";
const LIST = "/v5/real-world-assets/assets/list";
const QUOTES = "/v5/real-world-assets/quotes/latest";
const ISSUERS = "/v5/real-world-assets/issuers/list";
const ISSUER = "/v5/real-world-assets/issuers";
const CRYPTO_QUOTES = "/v2/cryptocurrency/quotes/latest";

const COUNTS_TTL_MS = 5 * 60 * 1000;

let typeCountsMemo: { at: number; counts: TypeCount[]; evidence: CallEvidence[] } | null =
  null;

function isMissLookup(call: CmcCall) {
  const message = (call.evidence.errorMessage || "").toLowerCase();
  return (
    !call.ok &&
    (call.evidence.httpStatus === 400 ||
      message.includes("invalid parameter") ||
      message.includes("invalid value"))
  );
}

function listHasNoRows(call: CmcCall) {
  return isMissLookup(call) || (call.ok && parseListPayload(call.payload).assets.length === 0);
}

function pushEvidence(bucket: CallEvidence[], call: CmcCall) {
  bucket.push(call.evidence);
}

function warningFrom(calls: CmcCall[], extra?: string | null) {
  const failed = calls.filter((call) => !call.ok);
  const parts = failed.map((call) => {
    const detail = call.evidence.errorMessage ? `: ${call.evidence.errorMessage}` : "";
    return `${call.endpoint} failed${detail}`;
  });
  if (extra) parts.push(extra);
  return parts.length ? parts.join(" · ") : null;
}

async function typeCounts(): Promise<{ counts: TypeCount[]; evidence: CallEvidence[] }> {
  if (typeCountsMemo && Date.now() - typeCountsMemo.at < COUNTS_TTL_MS) {
    return { counts: typeCountsMemo.counts, evidence: typeCountsMemo.evidence };
  }

  const evidence: CallEvidence[] = [];
  const [allCall, ...typeCalls] = await Promise.all([
    cmcGet(MAP, { start: 1, limit: 1, sort: "rwa_id" }),
    ...ASSET_TYPES.map((type) =>
      cmcGet(MAP, {
        asset_type: type,
        start: 1,
        limit: 1,
        sort: "rwa_id",
      }),
    ),
  ]);

  evidence.push(allCall.evidence, ...typeCalls.map((call) => call.evidence));
  const allParsed = parseMapPayload(allCall.payload);
  const perType = typeCalls.map((call, index) => ({
    type: ASSET_TYPES[index],
    label: TYPE_LABELS[ASSET_TYPES[index]],
    count: call.ok ? parseMapPayload(call.payload).totalSize : null,
  }) satisfies TypeCount);

  const result: { counts: TypeCount[]; evidence: CallEvidence[] } = {
    counts: [
      { type: "all", label: TYPE_LABELS.all, count: allCall.ok ? allParsed.totalSize : null },
      ...perType,
    ],
    evidence,
  };
  typeCountsMemo = { at: Date.now(), ...result };
  return result;
}

export async function getScreener(input: {
  q?: string;
  assetType?: string;
  sort?: string;
  sortDir?: string;
  start?: number;
  limit?: number;
}): Promise<ScreenerResult> {
  const query = (input.q ?? "").trim().slice(0, 80);
  const assetType = (
    ASSET_TYPES.includes(input.assetType as AssetType) ? input.assetType : "all"
  ) as AssetType | "all";
  const sort = parseSortParam(input.sort);
  const sortDir = parseSortDir(input.sortDir);
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
      if (listHasNoRows(listCall)) {
        const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slugCall = await cmcGet(LIST, {
          ...listQuery,
          rwa_slug: slug,
          skip_invalid: "true",
        });
        evidence.push(listCall.evidence);
        listCall = slugCall;
      }
      if (listHasNoRows(listCall)) {
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
    if (query) {
      return {
        source: listCall.source,
        pathUsed: "none",
        query,
        assetType,
        sort,
        sortDir,
        start,
        limit,
        totalSize: 0,
        hasMore: false,
        typeCounts: counts.counts,
        assets: [],
        evidence,
        warning: isMissLookup(listCall)
          ? hint ??
            "CMC has no name-search parameter. Underlier tries symbol, slug, then rwa_id."
          : warningFrom([listCall]),
      };
    }
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
  const [infoCall, quotesCall] = await Promise.all([
    cmcGet(INFO, { rwa_id: rwaId, skip_invalid: "true" }),
    cmcGet(QUOTES, { rwa_id: rwaId, convert: "USD", skip_invalid: "true" }),
  ]);
  pushEvidence(evidence, infoCall);
  pushEvidence(evidence, quotesCall);

  const info = parseInfoPayload(infoCall.payload)[0] ?? null;
  const quotes = parseQuotesPayload(quotesCall.payload);
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

  const missingIssuerRelationship =
    tokens.length === 0 || tokens.some((token) => !token.issuerId || !token.issuerName);

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
      if (pathUsed === "none") pathUsed = "crypto-fallback";
    }
  }

  const source = [infoCall, quotesCall].some((call) => call.source === "live")
    ? "live"
    : "fixture";

  return {
    source,
    pathUsed,
    info,
    quote,
    tokens,
    tradfiMarkets: tradfi,
    marketPairs: [],
    numMarketPairs: null,
    evidence,
    warning: warningFrom(
      [infoCall, quotesCall],
      !info
        ? `No metadata for rwa_id ${rwaId}.`
        : missingIssuerRelationship
          ? "CMC did not return a complete issuer relationship for this asset; Underlier did not perform an unbounded issuer crawl."
          : null,
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
  const issuer = parseIssuerPayload(call.payload);
  const evidence: CallEvidence[] = [call.evidence];
  if (issuer) {
    const ids = [
      ...new Set(
        issuer.tokens
          .map((token) => token.rwaId)
          .filter((id): id is number => id !== null),
      ),
    ];
    for (let i = 0; i < ids.length; i += 120) {
      const chunk = ids.slice(i, i + 120);
      const infoCall = await cmcGet(INFO, {
        rwa_id: chunk.join(","),
        skip_invalid: "true",
      });
      evidence.push(infoCall.evidence);
      if (!infoCall.ok) continue;
      const infos = parseInfoPayload(infoCall.payload);
      const byId = new Map(infos.map((info) => [info.rwaId, info]));
      issuer.tokens = issuer.tokens.map((token) => {
        if (token.rwaId === null) return token;
        const info = byId.get(token.rwaId);
        if (!info) return token;
        return {
          ...token,
          underlierName: info.name,
          underlierSymbol: info.symbol,
          underlierType: String(info.assetType),
        };
      });
    }
  }
  return {
    source: call.source,
    issuer,
    evidence,
    warning: warningFrom(
      [call],
      call.ok && !issuer ? "Issuer payload did not include an issuer_id." : null,
    ),
  };
}

export { hasLiveKey, liveKeyConfigured } from "./client";
