import assert from "node:assert/strict";
import test from "node:test";
import {
  applyCryptoQuotes,
  invertIssuerTokens,
  mergeTokens,
  parseAssetInfo,
  parseCryptoQuotes,
  parseListPayload,
  parseMapPayload,
  parseMarketPairsPayload,
  parseQuotesPayload,
  parseTradfiMarket,
  parseUsdQuote,
} from "./parse.ts";
import { fixtureAssetList, fixtureCryptoQuotes, fixtureMap, fixtureQuotes } from "./fixtures.ts";

test("map payload keeps rwa_id separate from crypto ids", () => {
  const parsed = parseMapPayload(fixtureMap({ symbol: "SPCX" }));
  assert.equal(parsed.assets.length, 1);
  assert.equal(parsed.assets[0].rwaId, 9);
  assert.equal(parsed.assets[0].symbol, "SPCX");
  assert.equal(parsed.assets[0].assetType, "stock");
});

test("list payload reads tokenized aggregates from quote.USD and top-level fields", () => {
  const parsed = parseListPayload(fixtureAssetList({ symbol: "NVDA" }));
  assert.equal(parsed.assets[0].quote.price, 178.42);
  assert.ok((parsed.assets[0].quote.marketCap ?? 0) > 1e12);
});

test("quotes payload returns issuer tokens and tradfi markets for one underlier", () => {
  const parsed = parseQuotesPayload(fixtureQuotes({ rwa_id: "2" }));
  const tokens = parsed.tokensByRwaId.get(2) ?? [];
  assert.equal(tokens.length, 2);
  assert.deepEqual(
    tokens.map((token) => token.issuerName).sort(),
    ["Ondo", "xStock"],
  );
  assert.equal(parsed.tradfiByRwaId.get(2)?.[0]?.exchange, "NASDAQ");
});

test("market pairs parser accepts the crypto-style nested quote envelope", () => {
  const payload = {
    data: {
      rwa_id: 1,
      name: "Gold",
      symbol: "GOLD",
      num_market_pairs: 1,
      market_pairs: [
        {
          exchange: { name: "Binance" },
          market_pair: "PAXG/USDT",
          quote: { USD: { price: 10, volume_24h: 20 } },
        },
      ],
      total_size: 1,
      has_more: false,
    },
    status: { error_code: "0" },
  };
  const parsed = parseMarketPairsPayload(payload);
  assert.equal(parsed.pairs[0].exchange, "Binance");
  assert.equal(parsed.pairs[0].volume24h, 20);
});

test("info parser reads about + company fields without treating null as zero", () => {
  const info = parseAssetInfo({
    rwa_id: 1,
    name: "Gold",
    symbol: "GOLD",
    slug: "gold",
    asset_type: "commodity",
    about: { description: "Metal", website: "https://example.com" },
    company: { employees: null, cik: null, primary_exchange: null },
  });
  assert.equal(info?.employees, null);
  assert.equal(info?.cik, null);
  assert.equal(info?.description, "Metal");
});

test("issuer inversion joins tokens back to an rwa_id", () => {
  const byRwa = invertIssuerTokens([
    {
      issuerId: "abc",
      name: "Backpack",
      website: null,
      logo: null,
      numTokens: 1,
      active: true,
      totalSize: 1,
      hasMore: false,
      tokens: [
        { cryptoId: 40238, name: "SPCX token", symbol: "SPCX", rwaId: 9 },
      ],
    },
  ]);
  assert.equal(byRwa.get(9)?.[0]?.cryptoId, 40238);
  assert.equal(byRwa.get(9)?.[0]?.issuerName, "Backpack");
});

test("mergeTokens prefers quote prices from the RWA quotes payload", () => {
  const merged = mergeTokens(
    [
      {
        cryptoId: 40238,
        name: "SPCX token",
        symbol: "SPCX",
        rwaId: 9,
        issuerId: null,
        issuerName: null,
        quote: { price: 225, marketCap: 1, volume24h: 2, percentChange24h: null },
      },
    ],
    [
      {
        cryptoId: 40238,
        name: "SPCX token",
        symbol: "SPCX",
        rwaId: 9,
        issuerId: "6a2d54b697c45356b1a634f4",
        issuerName: "Backpack",
        quote: { price: null, marketCap: null, volume24h: null, percentChange24h: null },
      },
    ],
  );
  assert.equal(merged[0].quote.price, 225);
  assert.equal(merged[0].issuerName, "Backpack");
});

test("quotes array convert payload is read when quote.USD is absent", () => {
  const parsed = parseUsdQuote({
    rwa_id: 2,
    name: "Nvidia Corp",
    symbol: "NVDA",
    quotes: [
      {
        symbol: "USD",
        crypto_id: 2781,
        average_tokenized_price: 230.81,
        tokenized_market_cap: 112844289.48,
        tokenized_volume_24h: 137496753.78,
      },
    ],
  });
  assert.equal(parsed.price, 230.81);
  assert.equal(parsed.marketCap, 112844289.48);
});

test("tradfi venue payload uses nested exchange, ticker, and market_url", () => {
  const market = parseTradfiMarket({
    exchange: { slug: "binance", name: "Binance", exchange_id: 270 },
    ticker: "NVDA",
    market_url: "https://www.binance.com/en/stocks/EQ_NVDA",
  });
  assert.equal(market?.name, "Binance");
  assert.equal(market?.symbol, "NVDA");
  assert.equal(market?.marketUrl, "https://www.binance.com/en/stocks/EQ_NVDA");
  assert.equal(market?.price, null);
});

test("crypto quotes fallback fills missing token prices by crypto_id", () => {
  const quotes = parseCryptoQuotes(fixtureCryptoQuotes({ id: "40238" }));
  const tokens = applyCryptoQuotes(
    [
      {
        cryptoId: 40238,
        name: "SPCX token",
        symbol: "SPCX",
        rwaId: 9,
        issuerId: "6a2d54b697c45356b1a634f4",
        issuerName: "Backpack",
        quote: { price: null, marketCap: null, volume24h: null, percentChange24h: null },
      },
    ],
    quotes,
  );
  assert.equal(tokens[0].quote.price, 225.37);
});
