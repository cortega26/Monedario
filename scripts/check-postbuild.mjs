// check-postbuild
//
// Declarative verification of the final `dist/` artifact, run as the LAST
// step of `build` / `build:ci`. Catches the silent-failure class that pure
// function tests cannot: an integration hook that stopped matching, a regex
// that stopped rewriting, a `_headers` without hashes — a broken site with
// green CI.
//
// This is the canonical home for artifact assertions (plan 081): future
// plans that touch the build must add their check here, not in Playwright.
//
// Usage: node scripts/check-postbuild.mjs [distDir]   (default: dist)
// Exit 0 = artifact valid; exit 1 = violations (reports ALL of them).
//
// Deterministic: no network, no clock. Pure helpers are exported for tests.

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  CANONICAL_TOPIC_REGISTRY,
  GUIDE_INTENT_REGISTRY,
} from "../src/config/editorial-topic-policy.mjs";

const PAGE_BYTE_BUDGET = 5 * 1024 * 1024; // pagefind regression guard (plan 057)

// Orígenes externos permitidos en connect-src (PRIV-018): analytics edge de
// Cloudflare y formulario de contacto. Cualquier otro origen es un hallazgo.
const CSP_CONNECT_SRC_ALLOWLIST = [
  "https://static.cloudflareinsights.com",
  "https://api.web3forms.com",
];

// Hardcoded slugs per plan 081 (maintenance note: if these posts change or
// die, update this constant — the check will fail loudly otherwise).
const SEO_TITLE_CASES = [
  {
    slug: "operacion-renta-f22-checklist",
    seoTitle: "Operación Renta: Checklist del Formulario 22 | Monedario",
  },
  {
    slug: "tarjeta-credito-costo-real-chile",
    seoTitle: "Costo Real de una Tarjeta de Crédito en Chile | Monedario",
  },
  {
    slug: "informe-deudas-cmf-vs-dicom",
    seoTitle: "Informe de Deudas CMF: Por Qué no es DICOM | Monedario",
  },
];

const NO_SEO_TITLE_CASE = {
  slug: "deposito-a-plazo-uf-vs-pesos",
  title: "Depósito a plazo: UF vs pesos — qué conviene y cuándo",
};

// ─── Pure helpers (exported for tests) ───────────────────────────────────────

/** Collect sitemap <loc> URLs (only urlset locs; image/video locs use namespaced tags and don't match). */
export function collectSitemapLocs(sitemapXml) {
  const locs = [];
  for (const match of sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    locs.push(match[1]);
  }
  return locs;
}

/** Map a sitemap URL to its dist HTML path (absolute URLs only). Returns null if not mappable. */
export function sitemapUrlToDistPath(url, distDir) {
  const urlObj = new URL(url);
  let pathname = urlObj.pathname.replace(/\/$/, "");
  if (pathname === "") {
    pathname = "/index.html";
  } else {
    pathname += "/index.html";
  }
  return path.join(distDir, pathname);
}

/** Extract the <title> content; returns null when absent, trimmed otherwise. */
export function readTitleFromHtml(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

/** Extract the first <h1> text content (inner tags stripped); null when absent. */
export function readH1FromHtml(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) return null;
  return match[1].replace(/<[^>]+>/g, "").trim();
}

/**
 * Collect duplicated `id` attributes in a page. Ignores <script>/<style>
 * bodies so embedded JSON or CSS strings cannot create false positives.
 * Returns [{ id, count }] sorted by id.
 */
export function findDuplicateIds(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const counts = new Map();
  for (const match of stripped.matchAll(/\sid=["']([^"']+)["']/g)) {
    counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Detect heading level jumps greater than one inside the first <main>.
 * Returns one entry per offending heading with its level, the previous level
 * and a short text label for the error message.
 */
export function findHeadingLevelJumps(html) {
  const mainMatch = html.match(/<main(?:\s[^>]*)?>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return [];
  const content = mainMatch[1];
  const jumps = [];
  let previous = 0;
  for (const match of content.matchAll(
    /<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi
  )) {
    const level = Number(match[1]);
    if (previous > 0 && level > previous + 1) {
      jumps.push({
        from: previous,
        to: level,
        text: match[2]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 80),
      });
    }
    previous = level;
  }
  return jumps;
}

/** Count opening/closing tag occurrences in a page (uses `<p\s|>` to avoid matching <pre> etc.). */
export function countTags(html, tag) {
  const open = tag === "p" ? /<p(?:\s|>)/g : new RegExp(`<${tag}(?:\\s|>)`, "g");
  const close = new RegExp(`</${tag}>`, "g");
  return {
    open: (html.match(open) ?? []).length,
    close: (html.match(close) ?? []).length,
  };
}

/**
 * Parse the CSP script-src directive from `_headers` content.
 * Returns { hasHashes: boolean, hasUnsafeInline: boolean, hasStrictDynamic: boolean }.
 */
export function parseScriptSrc(headersText) {
  const cspLine = headersText
    .split("\n")
    .find(line => line.includes("Content-Security-Policy"));
  const scriptSrcMatch = cspLine?.match(/script-src\s+([^;]+)/);
  const scriptSrc = scriptSrcMatch ? scriptSrcMatch[1] : "";
  return {
    hasHashes: scriptSrc.includes("sha256-"),
    hasUnsafeInline: /unsafe-inline/.test(scriptSrc),
    hasStrictDynamic: /strict-dynamic/.test(scriptSrc),
  };
}

/** Extract inline <script type="application/ld+json"> blocks (content only). */
export function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(re)) {
    blocks.push(match[1]);
  }
  return blocks;
}

/**
 * Validate the author entity graph on /autor/: a ProfilePage linked to a
 * Person via mainEntity / mainEntityOfPage (E-E-A-T, plan 115).
 * Returns human-readable issues ([] when valid).
 */
export function findAuthorProfileSchemaIssues(html) {
  const issues = [];
  let profilePage = null;
  let person = null;

  for (const block of extractJsonLdBlocks(html)) {
    let data;
    try {
      data = JSON.parse(block);
    } catch {
      continue;
    }
    const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
    for (const node of nodes) {
      if (node && node["@type"] === "ProfilePage") profilePage = node;
      if (node && node["@type"] === "Person") person = node;
    }
  }

  if (!profilePage) issues.push("missing ProfilePage node");
  if (!person) issues.push("missing Person node");

  if (profilePage && person) {
    const pageId = profilePage["@id"];
    const personId = person["@id"];
    if (!profilePage.mainEntity?.["@id"] || profilePage.mainEntity["@id"] !== personId) {
      issues.push("ProfilePage.mainEntity must reference the Person @id");
    }
    if (!person.mainEntityOfPage?.["@id"] || person.mainEntityOfPage["@id"] !== pageId) {
      issues.push("Person.mainEntityOfPage must reference the ProfilePage @id");
    }
  }

  return issues;
}

function robotsMetaContent(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/g)) {
    const tag = match[0];
    if (!/name=["']robots["']/.test(tag)) continue;
    return tag.match(/content=["']([^"']*)["']/)?.[1] ?? "";
  }
  return null;
}

/** True when the page declares noindex,follow for robots. */
export function hasNoindexFollow(html) {
  const content = robotsMetaContent(html);
  return content !== null && content.includes("noindex") && content.includes("follow");
}

/** True when the page declares noindex (with or without follow). */
export function hasNoindex(html) {
  const content = robotsMetaContent(html);
  return content !== null && content.includes("noindex");
}

/**
 * Guide landing intent registry issues (plan 119, SEO-018): declared path must
 * be a /guias/ landing present in dist, with a registered canonical topic and
 * a non-owner role (the topic owner is the registered post).
 */
export function findGuideIntentIssues(registry, canonicalRegistry, distDir) {
  const issues = [];
  for (const [pathname, entry] of Object.entries(registry)) {
    if (!pathname.startsWith("/guias/")) {
      issues.push(`${pathname}: no es una landing /guias/`);
      continue;
    }
    const topic = canonicalRegistry[entry.cluster]?.[entry.canonicalTopic];
    if (!topic) {
      issues.push(
        `${pathname}: canonicalTopic "${entry.canonicalTopic}" no registrado en ${entry.cluster}`
      );
    }
    if (entry.role === "owner") {
      issues.push(`${pathname}: una landing de guía no puede declararse owner`);
    }
    const htmlPath = path.join(distDir, pathname, "index.html");
    if (!statSync(htmlPath, { throwIfNoEntry: false })) {
      issues.push(`${pathname}: página no encontrada en dist`);
    }
  }
  return issues;
}

/** Sitemap locs with tracking params or fragments (SEO-009). */
export function findTrackingParamLocs(sitemapXml) {
  return collectSitemapLocs(sitemapXml).filter(loc => /[?#]/.test(loc));
}

/** Canonical links carrying query or fragment (SEO-009/SEO-010). */
export function findParametrizedCanonicals(html) {
  const canonical = readCanonicalFromHtml(html);
  return canonical && /[?#]/.test(canonical) ? [canonical] : [];
}

/** Lastmod dates in the future (SEO-013). */
export function findFutureLastmods(sitemapXml, today = new Date()) {
  const todayIso = today.toISOString().slice(0, 10);
  const issues = [];
  for (const block of sitemapXml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "(sin loc)";
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (
      lastmod &&
      /^\d{4}-\d{2}-\d{2}/.test(lastmod) &&
      lastmod.slice(0, 10) > todayIso
    ) {
      issues.push(`${loc} (${lastmod.slice(0, 10)})`);
    }
  }
  return issues;
}

/**
 * Internal hrefs that do not use the canonical trailing slash (SEO-07).
 * File links (with an extension) are allowed; query/hash are ignored.
 */
export function findNonCanonicalInternalHrefs(html) {
  const issues = [];
  const seen = new Set();
  for (const match of html.matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
    const href = match[1];
    if (href.endsWith("/")) continue;
    const last = href.split("/").pop() ?? "";
    if (last.includes(".")) continue;
    if (!seen.has(href)) {
      seen.add(href);
      issues.push(href);
    }
  }
  return issues;
}

/** Sitemap URLs without a valid ISO lastmod (SEO-04). */
export function findSitemapLastmodIssues(xml) {
  const issues = [];
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "(sin loc)";
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (!lastmod || !/^\d{4}-\d{2}-\d{2}/.test(lastmod)) {
      issues.push(loc);
    }
  }
  return issues;
}

/** Invalid JSON-LD blocks (SEO-019). */
export function findInvalidJsonLd(html) {
  const issues = [];
  extractJsonLdBlocks(html).forEach((block, index) => {
    try {
      JSON.parse(block);
    } catch (error) {
      issues.push(`bloque ${index}: ${error.message}`);
    }
  });
  return issues;
}

/** Canonical URL declared in the page head. */
export function readCanonicalFromHtml(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = match[0];
    if (!/rel=["']canonical["']/.test(tag)) continue;
    const href = tag.match(/href=["']([^"']+)["']/)?.[1];
    if (href) return href;
  }
  return null;
}

function normalizeUrlForCompare(url) {
  return url.replace(/\/+$/, "");
}

/**
 * BreadcrumbList issues: missing final item or final item != canonical
 * (SEO-020).
 */
export function findBreadcrumbIssues(html) {
  const issues = [];
  const canonical = readCanonicalFromHtml(html);
  for (const block of extractJsonLdBlocks(html)) {
    let data;
    try {
      data = JSON.parse(block);
    } catch {
      continue; // jsonld-parse reports invalid blocks
    }
    const breadcrumbs = [];
    const collect = node => {
      if (Array.isArray(node)) {
        node.forEach(collect);
        return;
      }
      if (!node || typeof node !== "object") return;
      if (node["@type"] === "BreadcrumbList") breadcrumbs.push(node);
      if (node["@graph"]) collect(node["@graph"]);
    };
    collect(data);
    for (const breadcrumb of breadcrumbs) {
      const items = Array.isArray(breadcrumb.itemListElement)
        ? breadcrumb.itemListElement
        : [];
      const finalItem = items[items.length - 1]?.item;
      if (!finalItem) {
        issues.push("BreadcrumbList sin item final");
      } else if (
        canonical &&
        normalizeUrlForCompare(finalItem) !== normalizeUrlForCompare(canonical)
      ) {
        issues.push(`breadcrumb final ${finalItem} != canonical ${canonical}`);
      }
    }
  }
  return issues;
}

/** Referencias http:// en atributos de recurso (PRIV-015). */
export function findMixedContent(html) {
  const issues = [];
  for (const match of html.matchAll(
    /(?:src|href|srcset)=["'](http:\/\/[^"'\s]+)["']/g
  )) {
    issues.push(match[1]);
  }
  return issues;
}

/** Archivos .map o referencias sourceMappingURL en assets (PRIV-016). */
export function findPublicSourcemaps(distDir) {
  const issues = [];
  const stack = [distDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      const rel = path.relative(distDir, full).replace(/\\/g, "/");
      if (entry.name.endsWith(".map")) {
        issues.push(`${rel} (.map)`);
        continue;
      }
      if (entry.name.endsWith(".js") || entry.name.endsWith(".css")) {
        if (readFileSync(full, "utf8").includes("sourceMappingURL")) {
          issues.push(`${rel} (sourceMappingURL)`);
        }
      }
    }
  }
  return issues;
}

/** Tokens de connect-src fuera del allowlist (PRIV-018). */
export function findCspConnectSrcViolations(headersText, allowedOrigins) {
  const cspLine = headersText
    .split("\n")
    .find(line => line.includes("Content-Security-Policy"));
  const connectSrc = cspLine?.match(/connect-src\s+([^;]+)/)?.[1] ?? "";
  const allowed = new Set(["'self'", ...allowedOrigins]);
  return connectSrc
    .split(/\s+/)
    .filter(Boolean)
    .filter(token => !allowed.has(token));
}

/** Total bytes of a directory tree. */
export function totalDirBytes(dir) {
  let total = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else {
        total += statSync(full).size;
      }
    }
  }
  return total;
}

/** Collect every *.html file under dist (relative paths, sorted). */
export function listHtmlPages(distDir) {
  const files = [];
  const stack = [distDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.name.endsWith(".html")) {
        files.push(path.relative(distDir, full).replace(/\\/g, "/"));
      }
    }
  }
  return files.sort();
}

// ─── Declarative checks ──────────────────────────────────────────────────────
//
// Each check returns an array of "file:rule message" violations. Checks whose
// plan dependency is not in main must self-disable (they are all in main as of
// plan 081 execution).

/** Raw `[[expr | fmt]]` economic interpolation left un-resolved in a plain-text surface (D25, plan 132). */
export function findRawEconomicInterpolations(text) {
  const matches = [];
  for (const match of text.matchAll(/\[\[[^\]\n|]+\|[^\]\n]+\]\]/g)) {
    matches.push(match[0]);
  }
  return matches;
}

const CHECKS = [
  {
    id: "csp-hashes-injected",
    message: "dist/_headers CSP script-src must carry sha256 hashes (no unsafe-inline/strict-dynamic).",
    run(distDir) {
      const headersPath = path.join(distDir, "_headers");
      if (!statSync(headersPath, { throwIfNoEntry: false })) {
        return ["dist/_headers:csp-hashes-injected missing _headers file"];
      }
      const { hasHashes, hasUnsafeInline, hasStrictDynamic } = parseScriptSrc(
        readFileSync(headersPath, "utf8")
      );
      const errors = [];
      if (!hasHashes) errors.push("dist/_headers:csp-hashes-injected script-src has no sha256- hash");
      if (hasUnsafeInline) errors.push("dist/_headers:csp-hashes-injected script-src contains unsafe-inline");
      if (hasStrictDynamic) errors.push("dist/_headers:csp-hashes-injected script-src contains strict-dynamic");
      return errors;
    },
  },
  // csp-hashes-dist-consistency: waived by plan 081 (check 1 alone validates
  // the CSP posture; the 065 integration is covered by jsonld-no-script-breakout).
  {
    id: "sitemap-pages-render-noindex-free",
    message: "Every sitemap page must exist in dist and must not render content=noindex.",
    run(distDir) {
      const sitemapPath = path.join(distDir, "sitemap-0.xml");
      if (!statSync(sitemapPath, { throwIfNoEntry: false })) {
        return ["dist/sitemap-0.xml:sitemap-pages-render-noindex-free sitemap missing"];
      }
      const errors = [];
      for (const loc of collectSitemapLocs(readFileSync(sitemapPath, "utf8"))) {
        let htmlPath;
        try {
          htmlPath = sitemapUrlToDistPath(loc, distDir);
        } catch {
          errors.push(`dist/sitemap-0.xml:sitemap-pages-render-noindex-free unparseable loc ${loc}`);
          continue;
        }
        if (!statSync(htmlPath, { throwIfNoEntry: false })) {
          errors.push(`${path.relative(distDir, htmlPath)}:sitemap-pages-render-noindex-free sitemap page missing`);
          continue;
        }
        const html = readFileSync(htmlPath, "utf8");
        if (/content="noindex"/.test(html)) {
          errors.push(`${path.relative(distDir, htmlPath)}:sitemap-pages-render-noindex-free sitemap page renders noindex`);
        }
      }
      return errors;
    },
  },
  {
    id: "seoTitle-rendered",
    message: "Rendered <title>/<h1> must match the frontmatter contract (plan 067).",
    run(distDir) {
      const errors = [];
      for (const { slug, seoTitle } of SEO_TITLE_CASES) {
        const htmlPath = path.join(distDir, "posts", slug, "index.html");
        if (!statSync(htmlPath, { throwIfNoEntry: false })) {
          errors.push(`dist/posts/${slug}/index.html:seoTitle-rendered page missing`);
          continue;
        }
        const title = readTitleFromHtml(readFileSync(htmlPath, "utf8"));
        if (title !== seoTitle) {
          errors.push(
            `dist/posts/${slug}/index.html:seoTitle-rendered expected "${seoTitle}", got ${JSON.stringify(title)}`
          );
        }
      }
      const plainPath = path.join(distDir, "posts", NO_SEO_TITLE_CASE.slug, "index.html");
      const html = readFileSync(plainPath, "utf8");
      const title = readTitleFromHtml(html);
      if (!title?.endsWith("| Monedario")) {
        errors.push(
          `dist/posts/${NO_SEO_TITLE_CASE.slug}/index.html:seoTitle-rendered title must end with "| Monedario", got ${JSON.stringify(title)}`
        );
      }
      const h1 = readH1FromHtml(html);
      if (h1 !== NO_SEO_TITLE_CASE.title) {
        errors.push(
          `dist/posts/${NO_SEO_TITLE_CASE.slug}/index.html:seoTitle-rendered expected h1 "${NO_SEO_TITLE_CASE.title}", got ${JSON.stringify(h1)}`
        );
      }
      return errors;
    },
  },
  {
    id: "pagefind-bounded",
    message: "dist/pagefind must stay under the 5 MB budget with its entry file (plan 057 regression).",
    run(distDir) {
      const pagefindDir = path.join(distDir, "pagefind");
      if (!statSync(pagefindDir, { throwIfNoEntry: false })) {
        return [];
      }
      const errors = [];
      if (!statSync(path.join(pagefindDir, "pagefind-entry.json"), { throwIfNoEntry: false })) {
        errors.push("dist/pagefind:pagefind-bounded pagefind-entry.json missing");
      }
      const bytes = totalDirBytes(pagefindDir);
      if (bytes >= PAGE_BYTE_BUDGET) {
        errors.push(
          `dist/pagefind:pagefind-bounded total size ${Math.round(bytes / 1024)} KB exceeds ${Math.round(PAGE_BYTE_BUDGET / 1024)} KB budget`
        );
      }
      return errors;
    },
  },
  {
    id: "jsonld-no-script-breakout",
    message: "Script tags must balance per page: a literal </script> inside a block (plan 065 regression) leaves a stray closer.",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        const { open, close } = countTags(html, "script");
        if (open !== close) {
          errors.push(`${file}:jsonld-no-script-breakout unbalanced <script> count (${open} open vs ${close} close)`);
        }
      }
      return errors;
    },
  },
  {
    id: "spacing-sanity",
    message: "Every page must have balanced <p>/</p> counts (plan 062 tokenizer regression).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        const { open, close } = countTags(html, "p");
        if (open !== close) {
          errors.push(`${file}:spacing-sanity unbalanced <p> count (${open} open vs ${close} close)`);
        }
      }
      return errors;
    },
  },
  {
    id: "heading-hierarchy",
    message: "Heading levels inside <main> must not skip more than one level (plan 114).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        for (const jump of findHeadingLevelJumps(html)) {
          errors.push(
            `${file}:heading-hierarchy h${jump.from} → h${jump.to} near "${jump.text}"`
          );
        }
      }
      return errors;
    },
  },
  {
    id: "tags-noindex",
    message: "All /tags/** pages must be noindex,follow and absent from the sitemap (SEO-01).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        if (!file.startsWith("tags/")) continue;
        const html = readFileSync(path.join(distDir, file), "utf8");
        if (!hasNoindexFollow(html)) {
          errors.push(`${file}:tags-noindex missing noindex,follow`);
        }
      }
      const sitemapPath = path.join(distDir, "sitemap-0.xml");
      if (statSync(sitemapPath, { throwIfNoEntry: false })) {
        const xml = readFileSync(sitemapPath, "utf8");
        if (/<loc>[^<]*\/tags\//.test(xml)) {
          errors.push("dist/sitemap-0.xml:tags-noindex contains /tags/ URL");
        }
      }
      return errors;
    },
  },
  {
    id: "internal-links-trailing-slash",
    message: "Internal links must use the canonical trailing slash (SEO-07).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        for (const href of findNonCanonicalInternalHrefs(html)) {
          errors.push(`${file}:internal-links-trailing-slash href="${href}"`);
        }
      }
      return errors;
    },
  },
  {
    id: "sitemap-lastmod-complete",
    message: "Every sitemap URL must declare a valid lastmod (SEO-04).",
    run(distDir) {
      const sitemapPath = path.join(distDir, "sitemap-0.xml");
      if (!statSync(sitemapPath, { throwIfNoEntry: false })) return [];
      const xml = readFileSync(sitemapPath, "utf8");
      return findSitemapLastmodIssues(xml).map(
        url => `dist/sitemap-0.xml:sitemap-lastmod-complete missing lastmod for ${url}`
      );
    },
  },
  {
    id: "jsonld-parse",
    message: "Every application/ld+json block must parse (SEO-019).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        for (const issue of findInvalidJsonLd(html)) {
          errors.push(`${file}:jsonld-parse ${issue}`);
        }
      }
      return errors;
    },
  },
  {
    id: "jsonld-breadcrumb-final-canonical",
    message: "BreadcrumbList must end at the page canonical (SEO-020).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        for (const issue of findBreadcrumbIssues(html)) {
          errors.push(`${file}:jsonld-breadcrumb-final-canonical ${issue}`);
        }
      }
      return errors;
    },
  },
  {
    id: "no-mixed-content",
    message: "No http:// resource references in dist HTML (PRIV-015).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        for (const url of findMixedContent(html)) {
          errors.push(`${file}:no-mixed-content ${url}`);
        }
      }
      return errors;
    },
  },
  {
    id: "no-public-sourcemaps",
    message: "No sourceMappingURL references or .map files in dist (PRIV-016).",
    run(distDir) {
      return findPublicSourcemaps(distDir).map(
        entry => `dist/${entry}:no-public-sourcemaps`
      );
    },
  },
  {
    id: "llms-full-no-raw-interpolation",
    message:
      "dist/llms-full.txt must not expose raw [[expr | fmt]] interpolation syntax (D25).",
    run(distDir) {
      const llmsPath = path.join(distDir, "llms-full.txt");
      if (!statSync(llmsPath, { throwIfNoEntry: false })) {
        return [
          "dist/llms-full.txt:llms-full-no-raw-interpolation missing llms-full.txt",
        ];
      }
      return findRawEconomicInterpolations(readFileSync(llmsPath, "utf8")).map(
        raw => `dist/llms-full.txt:llms-full-no-raw-interpolation raw ${raw}`
      );
    },
  },
  {
    id: "csp-connect-src-allowlist",
    message: "CSP connect-src must match the declared allowlist (PRIV-018).",
    run(distDir) {
      const headersPath = path.join(distDir, "_headers");
      if (!statSync(headersPath, { throwIfNoEntry: false })) return [];
      const headers = readFileSync(headersPath, "utf8");
      return findCspConnectSrcViolations(
        headers,
        CSP_CONNECT_SRC_ALLOWLIST
      ).map(
        token => `dist/_headers:csp-connect-src-allowlist unexpected ${token}`
      );
    },
  },
  {
    id: "guide-intent-registry",
    message: "Guide landings must declare a registered intent (plan 119, SEO-018).",
    run(distDir) {
      return findGuideIntentIssues(
        GUIDE_INTENT_REGISTRY,
        CANONICAL_TOPIC_REGISTRY,
        distDir
      ).map(issue => `${issue}:guide-intent-registry`);
    },
  },
  {
    id: "sitemap-indexable-only",
    message: "Sitemap URLs must exist and be indexable (SEO-001/SEO-004).",
    run(distDir) {
      const errors = [];
      const sitemapPath = path.join(distDir, "sitemap-0.xml");
      if (!statSync(sitemapPath, { throwIfNoEntry: false })) return [];
      const xml = readFileSync(sitemapPath, "utf8");
      for (const loc of collectSitemapLocs(xml)) {
        const filePath = sitemapUrlToDistPath(loc, distDir);
        if (!statSync(filePath, { throwIfNoEntry: false })) {
          errors.push(`${loc}:sitemap-indexable-only missing dist file`);
          continue;
        }
        const html = readFileSync(filePath, "utf8");
        if (hasNoindex(html)) {
          errors.push(`${loc}:sitemap-indexable-only page is noindex`);
        }
      }
      return errors;
    },
  },
  {
    id: "sitemap-canonical-match",
    message: "Sitemap URL must equal the page canonical (SEO-003).",
    run(distDir) {
      const errors = [];
      const sitemapPath = path.join(distDir, "sitemap-0.xml");
      if (!statSync(sitemapPath, { throwIfNoEntry: false })) return [];
      const xml = readFileSync(sitemapPath, "utf8");
      for (const loc of collectSitemapLocs(xml)) {
        const filePath = sitemapUrlToDistPath(loc, distDir);
        if (!statSync(filePath, { throwIfNoEntry: false })) continue;
        const html = readFileSync(filePath, "utf8");
        const canonical = readCanonicalFromHtml(html);
        if (!canonical) {
          errors.push(`${loc}:sitemap-canonical-match missing canonical`);
        } else if (
          normalizeUrlForCompare(canonical) !== normalizeUrlForCompare(loc)
        ) {
          errors.push(`${loc}:sitemap-canonical-match canonical is ${canonical}`);
        }
      }
      return errors;
    },
  },
  {
    id: "utilitarias-noindex",
    message: "Utility and paginated pages must be noindex (SEO-007).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const isUtility =
          file === "buscar/index.html" || file === "search/index.html";
        const isPagination = /^posts\/\d+\/index\.html$/.test(file);
        if (!isUtility && !isPagination) continue;
        const html = readFileSync(path.join(distDir, file), "utf8");
        if (!hasNoindex(html)) {
          errors.push(`${file}:utilitarias-noindex missing noindex`);
        }
      }
      return errors;
    },
  },
  {
    id: "no-tracking-params",
    message: "Sitemap and canonicals must not carry tracking params (SEO-009).",
    run(distDir) {
      const errors = [];
      const sitemapPath = path.join(distDir, "sitemap-0.xml");
      if (statSync(sitemapPath, { throwIfNoEntry: false })) {
        const xml = readFileSync(sitemapPath, "utf8");
        for (const loc of findTrackingParamLocs(xml)) {
          errors.push(`dist/sitemap-0.xml:no-tracking-params ${loc}`);
        }
      }
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        for (const canonical of findParametrizedCanonicals(html)) {
          errors.push(`${file}:no-tracking-params canonical ${canonical}`);
        }
      }
      return errors;
    },
  },
  {
    id: "no-future-lastmod",
    message: "Sitemap lastmod must not be in the future (SEO-013).",
    run(distDir) {
      const sitemapPath = path.join(distDir, "sitemap-0.xml");
      if (!statSync(sitemapPath, { throwIfNoEntry: false })) return [];
      const xml = readFileSync(sitemapPath, "utf8");
      return findFutureLastmods(xml).map(
        entry => `dist/sitemap-0.xml:no-future-lastmod ${entry}`
      );
    },
  },
  {
    id: "author-profile-schema",
    message: "dist/autor must publish a ProfilePage linked to its Person node (E-E-A-T, plan 115).",
    run(distDir) {
      const htmlPath = path.join(distDir, "autor", "index.html");
      if (!statSync(htmlPath, { throwIfNoEntry: false })) return [];
      const html = readFileSync(htmlPath, "utf8");
      return findAuthorProfileSchemaIssues(html).map(
        issue => `dist/autor/index.html:author-profile-schema ${issue}`
      );
    },
  },
  {
    id: "unique-element-ids",
    message: "Every id attribute must be unique per page (plan 114 regression: duplicated #resultado).",
    run(distDir) {
      const errors = [];
      for (const file of listHtmlPages(distDir)) {
        const html = readFileSync(path.join(distDir, file), "utf8");
        for (const { id, count } of findDuplicateIds(html)) {
          errors.push(
            `${file}:unique-element-ids id="${id}" appears ${count} times`
          );
        }
      }
      return errors;
    },
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────
//
// Only runs when executed directly (`node scripts/check-postbuild.mjs`), never
// when imported by tests for the pure helpers (vitest imports the module, and
// the default dist dir does not exist in CI).

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const distArg = process.argv[2];
  const distDir = path.resolve(distArg ?? "dist");

  const violations = [];
  for (const check of CHECKS) {
    violations.push(...check.run(distDir));
  }

  if (violations.length > 0) {
    console.error(`[check-postbuild] Found ${violations.length} violation(s) in ${distDir}:`);
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  const pageCount = listHtmlPages(distDir).length;
  console.log(
    `[check-postbuild] OK. ${CHECKS.length} checks passed over ${pageCount} HTML pages.`
  );
}
