// Browser-like fetch helper for Chilean government data sources.
//
// Why this exists: government sites occasionally return 403 to bare HTTP clients
// (e.g. `python-requests/2.x` or the default `curl/N.NN` UA). Cloudflare Workers
// outbound `fetch` already gets favorable treatment at the network layer
// (datacenter IP, Cloudflare TLS fingerprint), so a simple set of browser-like
// headers covers the "L1 defense" tier described in ADR-20260516.
//
// If we ever observe systematic 403s from a specific source despite these
// headers, the next escalation is rotating UA strings (L2) and after that,
// invoking Cloudflare Browser Rendering for a real headless Chromium (L3).
// See ADR for criteria.

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent": DEFAULT_USER_AGENT,
  "Accept-Language": "es-CL,es;q=0.9,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
};

export interface GovFetchOptions {
  /** Override the default Chrome-like User-Agent. */
  userAgent?: string;
  /** Send Referer header (typically the site's homepage). */
  referer?: string;
  /** Override Accept (defaults differ per call site: HTML vs JSON). */
  accept?: string;
  /** Network timeout in ms. */
  timeoutMs?: number;
  /** Additional headers to merge in. */
  headers?: Record<string, string>;
}

export async function govFetch(
  url: string,
  options: GovFetchOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(options.userAgent ? { "User-Agent": options.userAgent } : {}),
    ...(options.referer ? { Referer: options.referer } : {}),
    ...(options.accept ? { Accept: options.accept } : {}),
    ...(options.headers ?? {}),
  };

  const timeoutMs = options.timeoutMs ?? 15_000;
  return fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers,
    redirect: "follow",
  });
}

/** Read response body as Latin-1 (ISO-8859-1). BCCh's SiETE API returns its
 *  JSON in Latin-1, mixing raw bytes (0xf3 for ó) with JSON \u escapes. Using
 *  the default UTF-8 decode produces "invalid continuation byte" errors. */
export async function readLatin1(response: Response): Promise<string> {
  const buffer = await response.arrayBuffer();
  return new TextDecoder("iso-8859-1").decode(buffer);
}
