import assert from "node:assert/strict";
import test from "node:test";
import { redactSecrets } from "./client.ts";

test("redactSecrets strips the configured CMC key from evidence text", () => {
  const previous = process.env.CMC_API_KEY;
  process.env.CMC_API_KEY = "secretkeysecretkey";
  try {
    const redacted = redactSecrets(
      JSON.stringify({
        note: "secretkeysecretkey",
        header: "X-CMC_PRO_API_KEY: other-value",
      }),
    );
    assert.equal(redacted.includes("secretkeysecretkey"), false);
    assert.ok(redacted.includes("[redacted-cmc-key]"));
    assert.equal(redacted.includes("other-value"), false);
  } finally {
    if (previous === undefined) delete process.env.CMC_API_KEY;
    else process.env.CMC_API_KEY = previous;
  }
});
