/**
 * Central host registry for external link classification.
 *
 * Categories:
 *   official_source        – Chilean government/regulatory institutions; hard-fail is blocking.
 *   trusted_reference      – Reputable reference sites; hard-fail is blocking.
 *   brand_profile          – Monedario social media profiles; non-blocking, audited only.
 *   share_endpoint         – Social/messaging share URLs; non-blocking, audited only.
 *   known_soft_nonblocking – Sites that aggressively block bots (403/429); non-blocking.
 *   unknown                – Unclassified hosts; non-blocking.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Self-origin hostnames treated as internal-equivalent and excluded from external checks. */
export const SELF_ORIGINS = new Set(["monedario.cl", "www.monedario.cl"]);

// ---- Canonical official-host registry (TD-0094) ----
// Single source of truth shared with src/utils/analytics.ts. Each canonical host
// is registered as official_source for both its bare and www. forms.
const OFFICIAL_HOSTS_PATH = fileURLToPath(
  new URL("../../src/config/official-hosts.json", import.meta.url)
);
export const OFFICIAL_HOSTS_REGISTRY = JSON.parse(
  readFileSync(OFFICIAL_HOSTS_PATH, "utf8")
);

// ---- Host classification map (hostname → category) ----

const HOST_MAP = new Map();

function registerHosts(category, hosts) {
  for (const host of hosts) {
    HOST_MAP.set(host, category);
  }
}

registerHosts(
  "official_source",
  OFFICIAL_HOSTS_REGISTRY.hosts.flatMap(({ host }) =>
    host.startsWith("www.") ? [host] : [host, `www.${host}`]
  )
);

registerHosts("trusted_reference", [
  "es.wikipedia.org",
  "en.wikipedia.org",
  "www.wikipedia.org",
  "www.imf.org",
  "imf.org",
  "www.oecd.org",
  "oecd.org",
  "www.worldbank.org",
  "worldbank.org",
  "www.bis.org",
  "bis.org",
]);

registerHosts("brand_profile", [
  "www.instagram.com",
  "instagram.com",
  "www.facebook.com",
  "facebook.com",
  "www.youtube.com",
  "youtube.com",
  "www.linkedin.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "www.tiktok.com",
  "tiktok.com",
]);

registerHosts("share_endpoint", [
  // WhatsApp share
  "api.whatsapp.com",
  "wa.me",
]);

registerHosts("known_soft_nonblocking", [
  "www.google.com",
  "google.com",
  "www.google.cl",
  "google.cl",
]);

// ---- Allowed redirect families ----
// Define which final hosts are acceptable for a given original host.
// Handles www ↔ non-www and http → https normalizations.

const FAMILY_MAP = new Map([
  ["www.bcentral.cl", new Set(["www.bcentral.cl", "bcentral.cl"])],
  ["bcentral.cl", new Set(["www.bcentral.cl", "bcentral.cl"])],
  ["www.cmfchile.cl", new Set(["www.cmfchile.cl", "cmfchile.cl"])],
  ["cmfchile.cl", new Set(["www.cmfchile.cl", "cmfchile.cl"])],
  ["conocetudeuda.cmfchile.cl", new Set(["conocetudeuda.cmfchile.cl"])],
  ["www.sii.cl", new Set(["www.sii.cl", "sii.cl"])],
  ["sii.cl", new Set(["www.sii.cl", "sii.cl"])],
  ["www.spensiones.cl", new Set(["www.spensiones.cl", "spensiones.cl"])],
  ["spensiones.cl", new Set(["www.spensiones.cl", "spensiones.cl"])],
  ["www.bcn.cl", new Set(["www.bcn.cl", "bcn.cl"])],
  ["bcn.cl", new Set(["www.bcn.cl", "bcn.cl"])],
  ["www.ine.cl", new Set(["www.ine.cl", "ine.cl"])],
  ["ine.cl", new Set(["www.ine.cl", "ine.cl"])],
  ["www.dicrep.cl", new Set(["www.dicrep.cl", "dicrep.cl"])],
  ["dicrep.cl", new Set(["www.dicrep.cl", "dicrep.cl"])],
  ["www.prevision.cl", new Set(["www.prevision.cl", "prevision.cl"])],
  ["prevision.cl", new Set(["www.prevision.cl", "prevision.cl"])],
  ["www.economia.gob.cl", new Set(["www.economia.gob.cl", "economia.gob.cl", "www.gob.cl", "gob.cl"])],
  ["economia.gob.cl", new Set(["www.economia.gob.cl", "economia.gob.cl", "www.gob.cl", "gob.cl"])],
  ["www.chileatiende.gob.cl", new Set(["www.chileatiende.gob.cl", "chileatiende.gob.cl"])],
  ["chileatiende.gob.cl", new Set(["www.chileatiende.gob.cl", "chileatiende.gob.cl"])],
  ["www.dt.gob.cl", new Set(["www.dt.gob.cl", "dt.gob.cl"])],
  ["dt.gob.cl", new Set(["www.dt.gob.cl", "dt.gob.cl"])],
  ["www.afc.cl", new Set(["www.afc.cl", "afc.cl", "www.afcchile.cl", "afcchile.cl"])],
  ["afc.cl", new Set(["www.afc.cl", "afc.cl", "www.afcchile.cl", "afcchile.cl"])],
  ["www.afcchile.cl", new Set(["www.afc.cl", "afc.cl", "www.afcchile.cl", "afcchile.cl"])],
  ["afcchile.cl", new Set(["www.afc.cl", "afc.cl", "www.afcchile.cl", "afcchile.cl"])],
  ["www.tesoreria.cl", new Set(["www.tesoreria.cl", "tesoreria.cl", "www.tgr.cl", "tgr.cl"])],
  ["tesoreria.cl", new Set(["www.tesoreria.cl", "tesoreria.cl", "www.tgr.cl", "tgr.cl"])],
  ["www.tgr.cl", new Set(["www.tesoreria.cl", "tesoreria.cl", "www.tgr.cl", "tgr.cl"])],
  ["tgr.cl", new Set(["www.tesoreria.cl", "tesoreria.cl", "www.tgr.cl", "tgr.cl"])],
  ["es.wikipedia.org", new Set(["es.wikipedia.org", "en.wikipedia.org", "www.wikipedia.org"])],
  ["en.wikipedia.org", new Set(["es.wikipedia.org", "en.wikipedia.org", "www.wikipedia.org"])],
]);

// ---- Host-specific soft-404 markers ----
// Phrases found on custom 404 pages for specific hosts (in addition to the common set).

const HOST_SOFT_404_MARKERS = new Map([
  ["www.bcn.cl", ["página no encontrada", "no encontramos"]],
  ["bcn.cl", ["página no encontrada", "no encontramos"]],
  ["www.bcentral.cl", ["no encontrada", "page not found"]],
  ["bcentral.cl", ["no encontrada", "page not found"]],
  ["www.sii.cl", ["page not found", "no encontrado"]],
  ["sii.cl", ["page not found", "no encontrado"]],
]);

/**
 * Hosts exempt from the global SOFT_404_TITLE_PHRASES / SOFT_404_BODY_PHRASES check.
 * These are official sources whose valid pages (e.g. homepages) can contain generic
 * "not found" phrases in navigation, footers, or JavaScript bundles, causing false
 * positives when probed from CI runner IP ranges. Host-specific markers in
 * HOST_SOFT_404_MARKERS still apply for these hosts.
 */
const SOFT_404_PHRASE_EXEMPT_HOSTS = new Set([
  "www.tgr.cl",
  "tgr.cl",
  "www.tesoreria.cl",
  "tesoreria.cl",
]);

/**
 * Bilingual soft-404 phrase set checked against title + H1.
 * Body text uses only the most discriminating phrases to reduce false-positives.
 */
export const SOFT_404_TITLE_PHRASES = [
  "página no encontrada",
  "no encontramos la página",
  "page not found",
  "not found",
  "page does not exist",
  "no se encontró la página",
  "recurso no encontrado",
  "this page does not exist",
  "404",
];

export const SOFT_404_BODY_PHRASES = [
  "página no encontrada",
  "no encontramos la página",
  "page does not exist",
  "no se encontró la página",
  "recurso no encontrado",
  "this page does not exist",
];

const BINARY_CONTENT_TYPE_PREFIXES = [
  "application/pdf",
  "image/",
  "video/",
  "audio/",
  "application/octet-stream",
  "application/zip",
  "application/gzip",
];

// ---- Private/loopback IP ranges for SSRF guard ----

const PRIVATE_HOSTNAME_RE =
  // Covers: loopback (127/::1), RFC-1918 private (10, 172.16-31, 192.168),
  // link-local / cloud metadata (169.254, fe80::/10), IPv6 unique-local (fc00::/7),
  // IPv4-mapped loopback (::ffff:127.), and INADDR_ANY.
  /^(?:localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1$|(?:fc|fd)[0-9a-f]{2}:|fe[89ab][0-9a-f]:|::ffff:127\.)/i;

// ---- Exported pure functions ----

/** Returns the classification category for a given hostname. */
export function classifyHost(hostname) {
  return HOST_MAP.get(hostname) ?? "unknown";
}

/** Returns true when the hostname belongs to the site's own origins. */
export function isSelfOrigin(hostname) {
  return SELF_ORIGINS.has(hostname);
}

/**
 * Returns true when the category triggers blocking failure behaviour.
 * Only official_source and trusted_reference are blocking.
 */
export function isBlockingCategory(category) {
  return category === "official_source" || category === "trusted_reference";
}

/**
 * Returns the set of hostnames that are acceptable redirect destinations
 * for a given original hostname.
 */
export function getAllowedFamily(hostname) {
  return FAMILY_MAP.get(hostname) ?? new Set([hostname]);
}

/** Returns true for content-types that represent binary/non-HTML assets. */
export function isBinaryContentType(contentType) {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return BINARY_CONTENT_TYPE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

/** Returns host-specific soft-404 markers for the given hostname. */
export function getHostSoft404Markers(hostname) {
  return HOST_SOFT_404_MARKERS.get(hostname) ?? [];
}

/** Returns true when hostname looks like a private or loopback address. */
export function isPrivateHostname(hostname) {
  return PRIVATE_HOSTNAME_RE.test(hostname);
}

/** @param {string} text @param {readonly string[]} phrases @returns {string|null} */
function matchPhraseSet(text, phrases) {
  const ordered = [...phrases].sort((a, b) => b.length - a.length);
  for (const phrase of ordered) {
    if (text.includes(phrase.toLowerCase())) return phrase;
  }
  return null;
}

/** @param {string} hostname @param {string} titleAndH1 @param {string} body @returns {string|null} */
function matchHostMarkers(hostname, titleAndH1, body) {
  for (const marker of getHostSoft404Markers(hostname)) {
    const lm = marker.toLowerCase();
    if (titleAndH1.includes(lm) || body.includes(lm)) return marker;
  }
  return null;
}

/** Converts null/undefined to empty string; returns the value unchanged otherwise. */
function coerce(v) { return v === null || v === undefined ? "" : v; }

/**
 * Extracts lowercased text fields from content; returns null for binary/absent content.
 * @param {{ title: string|null, h1: string|null, bodySnippet: string|null }|null} content
 * @param {string} contentType
 * @returns {{ titleAndH1: string, body: string }|null}
 */
function extractTextFields(content, contentType) {
  if (!content) return null;
  if (isBinaryContentType(contentType)) return null;
  return {
    titleAndH1: `${coerce(content.title)} ${coerce(content.h1)}`.toLowerCase(),
    body: coerce(content.bodySnippet).toLowerCase(),
  };
}

/**
 * Detects soft-404 by comparing title, H1, and body snippet content against
 * the bilingual phrase set and host-specific markers.
 *
 * Binary content types are skipped; rely on HTTP status only for those.
 *
 * @param {{ title: string|null, h1: string|null, bodySnippet: string|null }} content
 * @param {{ hostname: string, contentType: string }} opts
 * @returns {{ detected: boolean, matchedPhrase: string|null }}
 */
export function detectSoft404(content, { hostname, contentType }) {
  const fields = extractTextFields(content, contentType);
  if (!fields) return { detected: false, matchedPhrase: null };

  const phraseExempt = SOFT_404_PHRASE_EXEMPT_HOSTS.has(hostname);
  const globalMatch =
    !phraseExempt &&
    (matchPhraseSet(fields.titleAndH1, SOFT_404_TITLE_PHRASES) ||
      matchPhraseSet(fields.body, SOFT_404_BODY_PHRASES));
  const matched =
    globalMatch || matchHostMarkers(hostname, fields.titleAndH1, fields.body);

  return matched
    ? { detected: true, matchedPhrase: matched }
    : { detected: false, matchedPhrase: null };
}
