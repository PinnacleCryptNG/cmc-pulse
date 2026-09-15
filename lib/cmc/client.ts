import { fixtureForPath } from "./fixtures";
import { asNumber, asString, extractStatus, isCmcOk } from "./parse";
import type { CallEvidence, DataSource } from "./types";

const CMC_BASE = "https://pro-api.coinmarketcap.com";
const PREVIEW_LIMIT = 4000;
const REQUEST_TIMEOUT_MS = 8000;

export type CmcCall = {
  path: string;
  endpoint: string;
  query: Record<string, string>;
  ok: boolean;
  source: DataSource;
  payload: unknown;
  evidence: CallEvidence;
};

export function hasLiveKey(): boolean {
  if (process.env.CMC_USE_FIXTURES === "1") return false;
  return Boolean(process.env.CMC_API_KEY?.trim());
}

export function liveKeyConfigured(): boolean {
  return Boolean(process.env.CMC_API_KEY?.trim());
}

function compactQuery(query: Record<string, string | number | boolean | undefined>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    out[key] = String(value);
  }
  return out;
}

export function redactSecrets(text: string): string {
  let out = text;
  const key = process.env.CMC_API_KEY?.trim();
  if (key && key.length >= 8) {
    out = out.split(key).join("[redacted-cmc-key]");
  }
  return out.replace(
    /(?:X-CMC_PRO_API_KEY|CMC_API_KEY)\s*[:=]\s*["']?[^"'\s,}]+/gi,
    "[redacted-cmc-key]",
  );
}

function preview(payload: unknown) {
  let text: string;
  try {
    text = JSON.stringify(payload);
  } catch {
    return { error: "unserializable_payload" };
  }
  if (!text) return payload;
  text = redactSecrets(text);
  if (text.length <= PREVIEW_LIMIT) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { preview: text };
    }
  }
  return {
    truncated: true,
    preview: text.slice(0, PREVIEW_LIMIT),
  };
}

function endpointName(path: string) {
  return `GET ${path}`;
}

export async function cmcGet(
  path: string,
  query: Record<string, string | number | boolean | undefined> = {},
): Promise<CmcCall> {
  const cleanQuery = compactQuery(query);
  const fetchedAt = new Date().toISOString();
  const started = Date.now();

  if (!hasLiveKey()) {
    const payload = fixtureForPath(path, cleanQuery);
    const status = extractStatus(payload);
    const ok = isCmcOk(status);
    const elapsedMs = Date.now() - started;
    const evidence: CallEvidence = {
      endpoint: endpointName(path),
      method: "GET",
      query: cleanQuery,
      ok,
      httpStatus: ok ? 200 : 400,
      errorCode: asString(status?.error_code) ?? asNumber(status?.error_code),
      errorMessage: asString(status?.error_message),
      creditCount: asNumber(status?.credit_count),
      elapsedMs,
      fetchedAt,
      source: "fixture",
      responsePreview: preview(payload),
    };
    return {
      path,
      endpoint: evidence.endpoint,
      query: cleanQuery,
      ok,
      source: "fixture",
      payload,
      evidence,
    };
  }

  const url = new URL(path, CMC_BASE);
  for (const [key, value] of Object.entries(cleanQuery)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY!.trim(),
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const payload: unknown = await response.json().catch(() => null);
    const status = extractStatus(payload);
    const ok = response.ok && isCmcOk(status);
    const evidence: CallEvidence = {
      endpoint: endpointName(path),
      method: "GET",
      query: cleanQuery,
      ok,
      httpStatus: response.status,
      errorCode:
        asString(status?.error_code) ??
        asNumber(status?.error_code) ??
        (ok ? 0 : response.status),
      errorMessage:
        asString(status?.error_message) ??
        (ok ? null : `HTTP ${response.status}`),
      creditCount: asNumber(status?.credit_count),
      elapsedMs: Date.now() - started,
      fetchedAt,
      source: "live",
      responsePreview: preview(payload ?? { httpStatus: response.status }),
    };
    return {
      path,
      endpoint: evidence.endpoint,
      query: cleanQuery,
      ok,
      source: "live",
      payload,
      evidence,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    const evidence: CallEvidence = {
      endpoint: endpointName(path),
      method: "GET",
      query: cleanQuery,
      ok: false,
      httpStatus: 0,
      errorCode: "network",
      errorMessage: message,
      creditCount: null,
      elapsedMs: Date.now() - started,
      fetchedAt,
      source: "live",
      responsePreview: { error: message },
    };
    return {
      path,
      endpoint: evidence.endpoint,
      query: cleanQuery,
      ok: false,
      source: "live",
      payload: null,
      evidence,
    };
  }
}
