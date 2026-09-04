/** Only allow https URLs from CMC (or fixtures) to be used as href/src. */
export function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return value.trim();
  } catch {
    return null;
  }
}

export function hostLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function isHttpsUrl(value: string | null | undefined): value is string {
  return safeHttpsUrl(value) !== null;
}
