import { isPrivateHostname } from "./host-registry.mjs";

/**
 * Maximum bytes to read from the response body for soft-404 / title analysis.
 * Large enough to capture <title>, first <h1>, and initial body text.
 */
const BODY_READ_LIMIT = 65_536; // 64 KiB

/** Browsers-style User-Agent so well-behaved servers don't block the checker. */
const UA =
  "Mozilla/5.0 (compatible; MonedarioLinkChecker/1.0; +https://monedario.cl)";

/**
 * @typedef {Object} ProbeResult
 * @property {string} url            – original URL
 * @property {string} finalUrl       – URL after all redirects
 * @property {number|null} status    – final HTTP status code, or null on error
 * @property {string} contentType    – value of Content-Type header (lowercased)
 * @property {string|null} title     – extracted <title> content, or null
 * @property {string|null} h1        – first <h1> content, or null
 * @property {string|null} bodySnippet – first 2 KiB of text-node content, or null
 * @property {string|null} error     – error code string, or null
 */

/**
 * Probes a single external URL following redirects.
 *
 * Security constraints:
 *   – Only http: and https: schemes are allowed.
 *   – Final URL hostname is checked against private/loopback ranges.
 *   – No credentials are sent.
 *   – Body read is bounded to BODY_READ_LIMIT bytes.
 *
 * @param {string} url
 * @param {{ timeoutMs: number }} opts
 * @returns {Promise<ProbeResult>}
 */
export async function probeUrl(url, { timeoutMs = 12_000 } = {}) {
  // Validate scheme before any network I/O
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return errorResult(url, "invalid_url");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return errorResult(url, "unsupported_scheme");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // External URLs are extracted from our own built HTML and only http/https schemes
    // are accepted. Final URL is checked for private IP addresses after the request.
    // nosemgrep: javascript.lang.security.audit.ssrf.node-fetch-ssrf, codacy.tools-configs.rules_lgpl_javascript_ssrf_rule-node-ssrf
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
      },
    });

    const finalUrl = response.url || url;

    // SSRF guard: reject if a redirect landed on a private/loopback address
    let finalParsed;
    try {
      finalParsed = new URL(finalUrl);
    } catch {
      return errorResult(url, "invalid_final_url");
    }

    if (isPrivateHostname(finalParsed.hostname)) {
      return {
        url,
        finalUrl,
        status: null,
        contentType: "",
        title: null,
        h1: null,
        bodySnippet: null,
        error: "ssrf_guard_private_redirect",
      };
    }

    const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
    const status = response.status;

    let title = null;
    let h1 = null;
    let bodySnippet = null;

    if (contentType.includes("text/html") || contentType.includes("application/xhtml")) {
      const snippetResult = await readBoundedBody(response, BODY_READ_LIMIT);
      if (snippetResult) {
        title = extractTitle(snippetResult);
        h1 = extractH1(snippetResult);
        bodySnippet = extractBodyText(snippetResult);
      }
    } else {
      // Drain body to free connection
      await response.body?.cancel();
    }

    return { url, finalUrl, status, contentType, title, h1, bodySnippet, error: null };
  } catch (err) {
    return errorResult(url, classifyNetworkError(err));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Probes a batch of URLs with bounded concurrency.
 *
 * @param {string[]} urls
 * @param {{ concurrency?: number, timeoutMs?: number }} opts
 * @returns {Promise<Map<string, ProbeResult>>}
 */
export async function runProbePool(urls, { concurrency = 6, timeoutMs = 12_000 } = {}) {
  const results = new Map();
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      const result = await probeUrl(url, { timeoutMs });
      results.set(url, result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, urls.length || 1) }, worker);
  await Promise.all(workers);
  return results;
}

// ---- Private helpers ----

function errorResult(url, error) {
  return {
    url,
    finalUrl: url,
    status: null,
    contentType: "",
    title: null,
    h1: null,
    bodySnippet: null,
    error,
  };
}

async function readBoundedBody(response, limit) {
  const reader = response.body?.getReader();
  if (!reader) return null;

  const chunks = [];
  let totalRead = 0;

  try {
    while (totalRead < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalRead += value.byteLength;
    }
  } finally {
    await reader.cancel();
  }

  if (chunks.length === 0) return null;
  const merged = new Uint8Array(totalRead);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const H1_RE = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
const BODY_RE = /<body[^>]*>([\s\S]*?)<\/body>/i;

function extractTitle(html) {
  const m = TITLE_RE.exec(html);
  if (!m) return null;
  return stripTags(m[1]).trim() || null;
}

function extractH1(html) {
  const m = H1_RE.exec(html);
  if (!m) return null;
  return stripTags(m[1]).trim() || null;
}

function extractBodyText(html) {
  const bodyMatch = BODY_RE.exec(html);
  const body = bodyMatch ? bodyMatch[1] : html;
  const text = stripTags(body).replace(/\s+/g, " ").trim();
  return text.slice(0, 2048) || null;
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

/** Signals used to classify a caught network error into a short code. */
const NETWORK_ERROR_SIGNALS = /** @type {const} */ ([
  { patterns: ["enotfound", "dns"], result: "dns" },
  { patterns: ["econnreset", "tls", "certificate"], result: "network" },
  { patterns: ["timeout", "etimedout"], result: "timeout" },
  { patterns: ["socket", "connect"], result: "network" },
]);

function errorMessage(err) {
  if (!err) return "";
  return String(err.message || "").toLowerCase();
}

function msgContainsAny(msg, patterns) {
  for (const p of patterns) {
    if (msg.includes(p)) return true;
  }
  return false;
}

function classifyNetworkError(err) {
  if (err?.name === "AbortError") return "timeout";
  const msg = errorMessage(err);
  for (const { patterns, result } of NETWORK_ERROR_SIGNALS) {
    if (msgContainsAny(msg, patterns)) return result;
  }
  return "network";
}
