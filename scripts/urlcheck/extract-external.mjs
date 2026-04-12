import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { isSelfOrigin } from "./host-registry.mjs";

/**
 * Regex to extract `<a href="...">` tags along with optional `target` and `rel` attributes.
 * Captures: group 1 = href value (double-quoted), group 2 = href (single-quoted),
 *           group 3 = full tag attributes (for target/rel detection),
 *           group 4 = anchor text content.
 *
 * Non-capturing lookaheads keep it ES2018-safe.
 */
const ANCHOR_REGEX = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
const HREF_ATTR_RE = /\bhref\s*=\s*(?:"([^"]*)")|(?:'([^']*)')/i;

/** URL schemes that can carry external links worth checking. */
const VALID_SCHEMES = new Set(["http:", "https:"]);

/**
 * Recursively yields absolute paths for all *.html files under `dir`.
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
async function* walkHtmlFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkHtmlFiles(full);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      yield full;
    }
  }
}

/**
 * Returns true when the anchor tag attributes string indicates a deliberate
 * external reference (target="_blank" rel="noopener …").
 * These links come from MethodologyBlock and ArticleDecisionIntro components.
 *
 * @param {string} attrString – the raw attribute string of the <a> tag
 */
function isStructuredLink(attrString) {
  const lower = attrString.toLowerCase();
  return lower.includes('target="_blank"') || lower.includes("target='_blank'") || lower.includes("noopener");
}

/**
 * Extracts all `<a>` anchors from an HTML string, returns those that point to
 * external URLs (non-self, non-fragment, valid scheme).
 *
 * @param {string} html
 * @param {string} pageUrl – absolute URL of the page (used to resolve relative hrefs)
 * @param {Set<string>} selfOrigins – hostnames considered self-origin
 * @returns {Array<{href: string, anchorText: string, linkType: 'structured'|'inline'}>}
 */
export function extractAnchorsFromHtml(html, pageUrl, selfOrigins) {
  const results = [];
  ANCHOR_REGEX.lastIndex = 0;

  let match = ANCHOR_REGEX.exec(html);
  while (match !== null) {
    const attribs = match[1] ?? "";
    const innerHtml = match[2] ?? "";

    const hrefMatch = HREF_ATTR_RE.exec(attribs);
    const rawHref = hrefMatch ? (hrefMatch[1] ?? hrefMatch[2] ?? "") : "";
    const href = decodeBasicEntities(rawHref).trim();

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("data:") ||
      href.startsWith("vbscript:")
    ) {
      match = ANCHOR_REGEX.exec(html);
      continue;
    }

    // Resolve to absolute URL
    let resolved;
    try {
      resolved = new URL(href, pageUrl);
    } catch {
      match = ANCHOR_REGEX.exec(html);
      continue;
    }

    if (!VALID_SCHEMES.has(resolved.protocol)) {
      match = ANCHOR_REGEX.exec(html);
      continue;
    }

    if (isSelfOrigin(resolved.hostname) || selfOrigins.has(resolved.hostname)) {
      match = ANCHOR_REGEX.exec(html);
      continue;
    }

    const anchorText = cleanText(innerHtml);
    const linkType = isStructuredLink(attribs) ? "structured" : "inline";

    // Normalise: strip trailing fragment
    resolved.hash = "";
    results.push({ href: resolved.href, anchorText, linkType });

    match = ANCHOR_REGEX.exec(html);
  }

  return results;
}

/**
 * Walks all HTML files in `distDir`, extracts external anchors, and
 * returns a deduplicated map of external URL → link metadata.
 *
 * The map key is the normalised URL string.
 * The value records all referrer pages and selects the highest-trust linkType
 * seen across all referrers (structured > inline).
 *
 * @param {string} distDir – path to the built site output (e.g. "dist/")
 * @param {Set<string>} extraSelfOrigins – additional hostnames to treat as self-origin
 * @returns {Promise<Map<string, {referrers: string[], linkType: 'structured'|'inline', anchorText: string}>>}
 */
export async function extractExternalLinks(distDir, extraSelfOrigins = new Set()) {
  const combined = new Set([...extraSelfOrigins]);
  /** @type {Map<string, {referrers: string[], linkType: 'structured'|'inline', anchorText: string}>} */
  const linkMap = new Map();

  for await (const filePath of walkHtmlFiles(distDir)) {
    let html;
    try {
      html = await readFile(filePath, "utf8");
    } catch {
      continue;
    }

    // Derive a page URL from the file path for relative-href resolution
    const pageUrl = filePathToPageUrl(filePath, distDir);

    const anchors = extractAnchorsFromHtml(html, pageUrl, combined);

    for (const { href, anchorText, linkType } of anchors) {
      const existing = linkMap.get(href);
      if (existing) {
        if (!existing.referrers.includes(pageUrl)) {
          existing.referrers.push(pageUrl);
        }
        // Upgrade linkType if this occurrence is more structured
        if (linkType === "structured" && existing.linkType !== "structured") {
          existing.linkType = "structured";
        }
      } else {
        linkMap.set(href, { referrers: [pageUrl], linkType, anchorText });
      }
    }
  }

  return linkMap;
}

// ---- Helpers ----

function filePathToPageUrl(filePath, distDir) {
  const rel = path.relative(distDir, filePath);
  const posix = rel.split(path.sep).join("/");
  // index.html → /  ;  posts/foo/index.html → /posts/foo/
  const withoutIndex = posix.replace(/(?:^|\/)index\.html$/, "/");
  const noLeadingSlash = withoutIndex.startsWith("/") ? withoutIndex : `/${withoutIndex}`;
  return `https://monedario.cl${noLeadingSlash}`;
}

function decodeBasicEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

function cleanText(value) {
  const withoutTags = value.replace(/<[^>]+>/g, " ");
  return decodeBasicEntities(withoutTags).replace(/\s+/g, " ").trim();
}
