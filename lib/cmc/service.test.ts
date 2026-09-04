import assert from "node:assert/strict";
import test from "node:test";
import { getAssetDesk, getIssuerBook, getScreener } from "./service.ts";

process.env.CMC_USE_FIXTURES = "1";

test("screener returns fixture underliers and type counts without a live key", async () => {
  const result = await getScreener({ sort: "rwa_rank", sortDir: "asc" });
  assert.equal(result.source, "fixture");
  assert.ok(result.assets.length >= 5);
  assert.equal(result.assets[0].symbol, "GOLD");
  const stocks = result.typeCounts.find((row) => row.type === "stock");
  assert.equal(stocks?.count, 2);
  assert.ok(result.evidence.some((item) => item.endpoint.includes("/v5/real-world-assets/map")));
  assert.ok(result.evidence.some((item) => item.endpoint.includes("/v5/real-world-assets/assets/list")));
});

test("screener search resolves NVDA by ticker", async () => {
  const result = await getScreener({ q: "NVDA" });
  assert.equal(result.assets.length, 1);
  assert.equal(result.assets[0].name, "NVIDIA");
});

test("asset desk joins NVDA underlier to Ondo and xStock tokens", async () => {
  const desk = await getAssetDesk("2");
  assert.equal(desk.source, "fixture");
  assert.equal(desk.info?.symbol, "NVDA");
  assert.equal(desk.info?.cik, "0001045810");
  assert.equal(desk.tokens.length, 2);
  assert.ok(desk.tokens.some((token) => token.issuerName === "Ondo"));
  assert.ok(desk.marketPairs.length >= 1);
  assert.ok(desk.tradfiMarkets.length >= 1);
  assert.ok(desk.evidence.some((item) => item.endpoint.includes("/quotes/latest")));
});

test("asset desk keeps metadata when an underlier has no tokens", async () => {
  const desk = await getAssetDesk("40");
  assert.equal(desk.info?.symbol, "TOWER");
  assert.equal(desk.tokens.length, 0);
  assert.equal(desk.marketPairs.length, 0);
});

test("issuer book lists every token Backpack minted", async () => {
  const book = await getIssuerBook("6a2d54b697c45356b1a634f4");
  assert.equal(book.issuer?.name, "Backpack");
  assert.equal(book.issuer?.tokens[0]?.rwaId, 9);
  assert.equal(book.issuer?.tokens[0]?.underlierName, "SpaceX");
});
