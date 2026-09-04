import assert from "node:assert/strict";
import test from "node:test";
import { spreadVsUnderlier, sortTokensByVolume, summarizeWrappers } from "./wrappers.ts";
import type { UnderlyingToken } from "./types.ts";

function token(
  symbol: string,
  price: number | null,
  volume: number | null,
  issuer = "Ondo",
): UnderlyingToken {
  return {
    cryptoId: 1,
    name: symbol,
    symbol,
    rwaId: 2,
    issuerId: "x",
    issuerName: issuer,
    quote: {
      price,
      marketCap: null,
      volume24h: volume,
      percentChange24h: null,
    },
  };
}

test("spreadVsUnderlier is percent difference versus the average tokenized price", () => {
  assert.equal(spreadVsUnderlier(101, 100), 1);
  assert.equal(spreadVsUnderlier(99, 100), -1);
  assert.equal(spreadVsUnderlier(null, 100), null);
  assert.equal(spreadVsUnderlier(100, 0), null);
});

test("summarizeWrappers picks the closest priced token and the highest volume", () => {
  const summary = summarizeWrappers(
    [
      token("FAR", 110, 1_000, "Far"),
      token("NEAR", 100.2, 500, "Ondo"),
      token("LOUD", 100.5, 9_000, "xStock"),
    ],
    100,
  );
  assert.equal(summary.tokenCount, 3);
  assert.equal(summary.closest?.symbol, "NEAR");
  assert.equal(summary.mostVolume?.symbol, "LOUD");
});

test("sortTokensByVolume puts missing volume last", () => {
  const sorted = sortTokensByVolume([
    token("A", 1, null),
    token("B", 1, 50),
    token("C", 1, 10),
  ]);
  assert.deepEqual(
    sorted.map((row) => row.symbol),
    ["B", "C", "A"],
  );
});
