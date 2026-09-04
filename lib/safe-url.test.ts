import assert from "node:assert/strict";
import test from "node:test";
import { hostLabel, isHttpsUrl, safeHttpsUrl } from "./safe-url.ts";

test("safeHttpsUrl keeps ordinary https links", () => {
  assert.equal(safeHttpsUrl("https://www.nvidia.com"), "https://www.nvidia.com");
});

test("safeHttpsUrl rejects javascript, http, and credentialed URLs", () => {
  assert.equal(safeHttpsUrl("javascript:alert(1)"), null);
  assert.equal(safeHttpsUrl("http://example.com"), null);
  assert.equal(safeHttpsUrl("https://user:pass@evil.example/"), null);
  assert.equal(safeHttpsUrl("/relative"), null);
  assert.equal(safeHttpsUrl(""), null);
});

test("hostLabel reads the host and isHttpsUrl matches the sanitizer", () => {
  assert.equal(hostLabel("https://paxos.com/gold"), "paxos.com");
  assert.equal(isHttpsUrl("https://ondo.finance"), true);
  assert.equal(isHttpsUrl("javascript:void(0)"), false);
});
