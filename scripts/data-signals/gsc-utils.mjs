/**
 * Pure utility functions for GSC data signals.
 * No I/O, no side effects — safe to import in tests.
 */

/**
 * Returns the ISO week string (YYYY-Www) for a given Date (uses the date's Monday).
 * @param {Date} date
 * @returns {string}
 */
export function dateToISOWeek(date) {
  const year = date.getUTCFullYear();

  // Check if date belongs to next year's W01
  const nextJan4 = new Date(Date.UTC(year + 1, 0, 4));
  const nextDow = (nextJan4.getUTCDay() + 6) % 7;
  const nextWeek1Mon = new Date(nextJan4.getTime() - nextDow * 86_400_000);
  if (date >= nextWeek1Mon) return `${year + 1}-W01`;

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = (jan4.getUTCDay() + 6) % 7; // 0=Mon, 6=Sun
  const week1Mon = new Date(jan4.getTime() - dow * 86_400_000);
  const diff = date.getTime() - week1Mon.getTime();
  const week = Math.floor(diff / (7 * 86_400_000)) + 1;

  if (week < 1) {
    // Belongs to the last week of the previous year
    return dateToISOWeek(new Date(Date.UTC(year - 1, 11, 28)));
  }

  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Converts a YYYY-Www string to the Monday–Sunday date range of that week.
 * @param {string} week  e.g. "2026-W17"
 * @returns {{ from: string, to: string }}  ISO date strings "YYYY-MM-DD"
 */
export function isoWeekToDateRange(week) {
  if (!/^\d{4}-W\d{2}$/.test(week)) {
    throw new Error(
      `Invalid ISO week: "${week}". Expected YYYY-Www (e.g. 2026-W17).`
    );
  }
  const year = parseInt(week.slice(0, 4), 10);
  const w = parseInt(week.slice(6), 10);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = (jan4.getUTCDay() + 6) % 7; // 0=Mon
  const week1Mon = new Date(jan4.getTime() - dow * 86_400_000);
  const weekMon = new Date(week1Mon.getTime() + (w - 1) * 7 * 86_400_000);
  const weekSun = new Date(weekMon.getTime() + 6 * 86_400_000);

  return {
    from: weekMon.toISOString().slice(0, 10),
    to: weekSun.toISOString().slice(0, 10),
  };
}

/**
 * True when the export for an ISO week is overdue: past a grace window after the
 * Monday on which the worker cron produces it. Pure — the caller decides what to
 * do. With graceDays=2: Monday/Tuesday after the week ends = pending (false);
 * Wednesday onward = overdue (true).
 *
 * @param {string} week   ISO week "YYYY-Www"
 * @param {Date}   [now]  defaults to new Date()
 * @param {number} [graceDays=2]
 * @returns {boolean}
 */
export function isExportOverdue(week, now = new Date(), graceDays = 2) {
  const { to } = isoWeekToDateRange(week); // Sunday (week end), YYYY-MM-DD
  const weekEndUtc = Date.parse(`${to}T00:00:00Z`);
  const nowMidnightUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const overdueThresholdUtc = weekEndUtc + graceDays * 86_400_000;
  return nowMidnightUtc > overdueThresholdUtc;
}

/**
 * Semanas ISO continuas entre la semana objetivo y `lookbackWeeks` semanas
 * atrás (ambas inclusive) que NO están en `availableWeeks`.
 * @param {string[]} availableWeeks - etiquetas YYYY-Www presentes, p.ej. ["2026-W30"]
 * @param {string} targetWeek - etiqueta YYYY-Www de la semana objetivo
 * @param {number} [lookbackWeeks=12] - cuántas semanas hacia atrás mirar
 * @returns {string[]} etiquetas faltantes en orden cronológico (la más antigua primero)
 */
export function missingExportWeeks(availableWeeks, targetWeek, lookbackWeeks = 12) {
  const { from } = isoWeekToDateRange(targetWeek); // throws on invalid format
  const present = new Set(availableWeeks ?? []);
  const missing = [];
  for (let i = 0; i < lookbackWeeks; i++) {
    const weekStart = new Date(Date.parse(`${from}T00:00:00Z`) - i * 7 * 86_400_000);
    const label = dateToISOWeek(weekStart);
    if (!present.has(label)) missing.push(label);
  }
  return missing.reverse(); // oldest first
}

/**
 * Returns the YYYY-Www of the last fully elapsed ISO week
 * (the week whose Sunday has already passed).
 * @returns {string}
 */
export function previousCompleteISOWeek() {
  const now = new Date();
  const dow = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Days back to the most-recently-completed Sunday
  const daysBack = dow === 0 ? 7 : dow;
  const lastSunday = new Date(now.getTime() - daysBack * 86_400_000);
  const weekMon = new Date(lastSunday.getTime() - 6 * 86_400_000);
  return dateToISOWeek(weekMon);
}

/**
 * Builds the required schema header for all data-signal JSON files.
 * Keys are sorted alphabetically (diff-friendly).
 * @param {string} source
 * @param {string} week   e.g. "2026-W17"
 * @param {string} from   "YYYY-MM-DD"
 * @param {string} to     "YYYY-MM-DD"
 */
export function buildSchemaHeader(source, week, from, to) {
  return {
    fetchedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    schemaVersion: 1,
    source,
    week,
    window: { from, to },
  };
}

/** @param {number} n @param {number} decimals */
function roundTo(n, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

/**
 * Normalizes a GSC search-analytics row keyed by "query" dimension.
 * Output keys are sorted alphabetically.
 * @param {{ keys: string[], clicks: number, impressions: number, ctr: number, position: number }} row
 */
export function normalizeQueryRow(row) {
  return {
    clicks: row.clicks,
    ctr: roundTo(row.ctr, 4),
    impressions: row.impressions,
    position: roundTo(row.position, 2),
    query: row.keys[0],
  };
}

/**
 * Normalizes a GSC search-analytics row keyed by "page" dimension.
 * Output keys are sorted alphabetically.
 * @param {{ keys: string[], clicks: number, impressions: number, ctr: number, position: number }} row
 */
export function normalizePageRow(row) {
  return {
    clicks: row.clicks,
    ctr: roundTo(row.ctr, 4),
    impressions: row.impressions,
    page: row.keys[0],
    position: roundTo(row.position, 2),
  };
}

/**
 * Normalizes a GSC search-analytics row keyed by ["query","page"] dimensions.
 * Output keys are sorted alphabetically.
 * @param {{ keys: string[], clicks: number, impressions: number, ctr: number, position: number }} row
 */
export function normalizeQueryPageRow(row) {
  return {
    clicks: row.clicks,
    ctr: roundTo(row.ctr, 4),
    impressions: row.impressions,
    page: row.keys[1],
    position: roundTo(row.position, 2),
    query: row.keys[0],
  };
}

/**
 * Normalizes a GSC search-analytics row keyed by "country" dimension.
 * GSC returns ISO country codes in lowercase, e.g. "chl".
 * Output keys are sorted alphabetically; missing values default to "" / 0.
 * @param {{ keys?: string[], clicks?: number, impressions?: number, ctr?: number, position?: number }} row
 */
export function normalizeCountryRow(row) {
  return {
    clicks: row.clicks ?? 0,
    ctr: roundTo(row.ctr ?? 0, 4),
    impressions: row.impressions ?? 0,
    key: row.keys?.[0] ?? "",
    position: roundTo(row.position ?? 0, 2),
  };
}

/**
 * Normalizes a GSC search-analytics row keyed by "device" dimension.
 * GSC returns "MOBILE" | "DESKTOP" | "TABLET".
 * Output keys are sorted alphabetically; missing values default to "" / 0.
 * @param {{ keys?: string[], clicks?: number, impressions?: number, ctr?: number, position?: number }} row
 */
export function normalizeDeviceRow(row) {
  return {
    clicks: row.clicks ?? 0,
    ctr: roundTo(row.ctr ?? 0, 4),
    impressions: row.impressions ?? 0,
    key: row.keys?.[0] ?? "",
    position: roundTo(row.position ?? 0, 2),
  };
}

/**
 * Detects search-query cannibalization: queries for which two or more of the
 * site's own pages accumulate impressions in the same window. This is the only
 * signal that reveals real cannibalization — internal canonicalTopic labels do
 * not tell us what actually competes in the SERP.
 *
 * Pure function (no I/O). Rows must already be normalized query-page rows.
 *
 * @param {Array<{query:string,page:string,impressions:number,clicks:number,position:number,ctr:number}>} rows
 * @param {{ minImpressions?: number, minUrls?: number }} [opts]
 *   minImpressions — per-URL impression floor to count as "competing" (default 5)
 *   minUrls        — minimum distinct competing URLs to flag a query (default 2)
 * @returns {Array<{query:string,urls:Array<{page:string,impressions:number,clicks:number,position:(number|null),ctr:(number|null)}>,totalImpressions:number,totalClicks:number,urlCount:number}>}
 *   sorted by totalImpressions desc, then query asc.
 */
export function findCannibalizationGroups(rows, opts = {}) {
  const minImpressions = opts.minImpressions ?? 5;
  const minUrls = opts.minUrls ?? 2;

  const byQuery = new Map();
  for (const row of rows) {
    if (!row || typeof row.query !== "string" || typeof row.page !== "string") continue;
    if ((row.impressions ?? 0) < minImpressions) continue;
    if (!byQuery.has(row.query)) byQuery.set(row.query, new Map());
    // Collapse duplicate (query,page) rows by keeping the max-impression sample.
    const pages = byQuery.get(row.query);
    const existing = pages.get(row.page);
    if (!existing || row.impressions > existing.impressions) {
      pages.set(row.page, {
        page: row.page,
        impressions: row.impressions,
        clicks: row.clicks ?? 0,
        position: row.position ?? null,
        ctr: row.ctr ?? null,
      });
    }
  }

  const groups = [];
  for (const [query, pagesMap] of byQuery) {
    if (pagesMap.size < minUrls) continue;
    const urls = [...pagesMap.values()].sort(
      (a, b) => b.impressions - a.impressions || a.page.localeCompare(b.page)
    );
    groups.push({
      query,
      urls,
      urlCount: urls.length,
      totalImpressions: urls.reduce((s, u) => s + u.impressions, 0),
      totalClicks: urls.reduce((s, u) => s + u.clicks, 0),
    });
  }

  return groups.sort(
    (a, b) => b.totalImpressions - a.totalImpressions || a.query.localeCompare(b.query)
  );
}

/**
 * Aggregates multiple weekly query×page documents into a single, more stable row
 * set. Impressions and clicks are summed; position is the impression-weighted mean
 * across weeks; ctr is recomputed as clicks/impressions. The output rows share the
 * normalized query-page shape, so they feed directly into findCannibalizationGroups
 * and findStrikingDistance. Pure function (no I/O).
 *
 * @param {(Array<{data?: Array<{query:string,page:string,impressions:number,clicks:number,position:number,ctr:number}>}>|null|undefined)} docs
 * @returns {Array<{query:string,page:string,impressions:number,clicks:number,position:(number|null),ctr:number}>}
 *   sorted by impressions desc, then query asc, then page asc.
 */
export function aggregateQueryPageRows(docs) {
  const acc = new Map();
  for (const doc of docs ?? []) {
    for (const row of doc?.data ?? []) {
      if (!row || typeof row.query !== "string" || typeof row.page !== "string") continue;
      const impressions = row.impressions ?? 0;
      const key = `${row.query}\n${row.page}`;
      const cur =
        acc.get(key) ??
        { query: row.query, page: row.page, impressions: 0, clicks: 0, posWeighted: 0 };
      cur.impressions += impressions;
      cur.clicks += row.clicks ?? 0;
      cur.posWeighted += (typeof row.position === "number" ? row.position : 0) * impressions;
      acc.set(key, cur);
    }
  }

  const out = [];
  for (const v of acc.values()) {
    out.push({
      query: v.query,
      page: v.page,
      impressions: v.impressions,
      clicks: v.clicks,
      position: v.impressions > 0 ? roundTo(v.posWeighted / v.impressions, 2) : null,
      ctr: v.impressions > 0 ? roundTo(v.clicks / v.impressions, 4) : 0,
    });
  }

  return out.sort(
    (a, b) =>
      b.impressions - a.impressions ||
      a.query.localeCompare(b.query) ||
      a.page.localeCompare(b.page)
  );
}

/**
 * Detects "striking distance" opportunities: (query, page) pairs that already
 * earn impressions but rank just off the top — typically positions 8–20. A small
 * on-page improvement can lift these into the top results where clicks happen,
 * making them the highest-ROI growth lever once cannibalization is ruled out.
 *
 * Pure function (no I/O). Rows must already be normalized query-page rows.
 *
 * @param {Array<{query:string,page:string,impressions:number,clicks:number,position:number,ctr:number}>} rows
 * @param {{ minPosition?: number, maxPosition?: number, minImpressions?: number, maxClicks?: number }} [opts]
 *   minPosition   — inclusive lower bound of the striking band (default 8)
 *   maxPosition   — inclusive upper bound (default 20)
 *   minImpressions— demand floor to count as an opportunity (default 10)
 *   maxClicks     — only surface under-converting pairs at/below this click count
 *                   (default Infinity = no filter)
 * @returns {Array<{query:string,page:string,impressions:number,clicks:number,position:number,ctr:number,score:number}>}
 *   sorted by score desc (impressions weighted by closeness to page 1), then query asc.
 */
export function findStrikingDistance(rows, opts = {}) {
  const minPosition = opts.minPosition ?? 8;
  const maxPosition = opts.maxPosition ?? 20;
  const minImpressions = opts.minImpressions ?? 10;
  const maxClicks = opts.maxClicks ?? Infinity;

  const out = [];
  for (const row of rows) {
    if (!row || typeof row.query !== "string" || typeof row.page !== "string") continue;
    const position = row.position;
    if (typeof position !== "number") continue;
    if (position < minPosition || position > maxPosition) continue;
    if ((row.impressions ?? 0) < minImpressions) continue;
    if ((row.clicks ?? 0) > maxClicks) continue;

    // Opportunity score: more impressions and closer to page 1 rank higher.
    const proximity = (maxPosition - position + 1) / (maxPosition - minPosition + 1);
    const score = roundTo(row.impressions * proximity, 2);
    out.push({
      query: row.query,
      page: row.page,
      impressions: row.impressions,
      clicks: row.clicks ?? 0,
      position,
      ctr: row.ctr ?? null,
      score,
    });
  }

  return out.sort(
    (a, b) => b.score - a.score || a.query.localeCompare(b.query)
  );
}

/**
 * Normalizes a GSC sitemap entry.
 * Timestamps are truncated to date (no time component).
 * Output keys are sorted alphabetically.
 * @param {object} entry
 */
export function normalizeSitemapEntry(entry) {
  const contents = (entry.contents ?? [])
    .map((c) => ({
      indexed: Number(c.indexed ?? 0),
      submitted: Number(c.submitted ?? 0),
      type: c.type ?? "",
    }))
    .sort((a, b) => a.type.localeCompare(b.type));

  return {
    contents,
    errors: entry.errors ?? 0,
    isPending: entry.isPending ?? false,
    isSitemapsIndex: entry.isSitemapsIndex ?? false,
    lastDownloaded: entry.lastDownloaded?.split("T")[0] ?? null,
    lastSubmitted: entry.lastSubmitted?.split("T")[0] ?? null,
    path: entry.path ?? "",
    warnings: entry.warnings ?? 0,
  };
}

/**
 * Extracts the `<loc>` URLs from a sitemap or sitemap-index XML string.
 * Works for both `<urlset>` (page URLs) and `<sitemapindex>` (child sitemaps).
 * Pure function (no I/O). Returns URLs in document order, de-duplicated.
 * @param {string} xml
 * @returns {string[]}
 */
export function extractSitemapLocs(xml) {
  if (typeof xml !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
    const url = m[1].trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

/**
 * Normalizes a GSC URL Inspection `indexStatusResult` into a compact, diff-friendly
 * row. Timestamps are truncated to date. Output keys are sorted alphabetically.
 * @param {string} url  the inspected URL
 * @param {object} [result]  inspectionResult.indexStatusResult (or {} / error marker)
 */
export function normalizeUrlInspectionRow(url, result = {}) {
  return {
    coverageState: result.coverageState ?? null,
    indexingState: result.indexingState ?? null,
    lastCrawl: result.lastCrawlTime?.split("T")[0] ?? null,
    robotsTxtState: result.robotsTxtState ?? null,
    url,
    verdict: result.verdict ?? null,
  };
}

/** GSC coverageState string for a URL that is submitted and indexed. */
export const COVERAGE_INDEXED = "Submitted and indexed";
/** GSC coverageState string for a URL crawled but withheld from the index. */
export const COVERAGE_CRAWLED_NOT_INDEXED = "Crawled - currently not indexed";

/**
 * Summarizes an array of normalized URL-inspection rows into indexation health
 * counts. Pure function (no I/O). `indexedPct` is a whole-number percentage.
 * @param {Array<{coverageState: (string|null)}>} rows
 * @returns {{ total:number, indexed:number, notIndexed:number, other:number, indexedPct:(number|null), byCoverage:Record<string,number> }}
 */
export function summarizeIndexation(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const byCoverage = {};
  let indexed = 0;
  let notIndexed = 0;
  for (const row of list) {
    const state = row?.coverageState ?? "unknown";
    byCoverage[state] = (byCoverage[state] || 0) + 1;
    if (state === COVERAGE_INDEXED) indexed++;
    else if (state === COVERAGE_CRAWLED_NOT_INDEXED) notIndexed++;
  }
  const total = list.length;
  return {
    total,
    indexed,
    notIndexed,
    other: total - indexed - notIndexed,
    indexedPct: total > 0 ? Math.round((indexed / total) * 100) : null,
    byCoverage,
  };
}

/**
 * Decides whether an inspection run failed badly enough that its snapshot must
 * NOT be written (it would overwrite good data with a misleading 0%-indexed
 * summary). Pure — the caller performs the exit.
 *
 * @param {number} errors  count of per-URL inspection failures
 * @param {number} total   count of URLs the run attempted (urls.length)
 * @param {number} [maxErrorRatio=0.5]  abort if errors are at/above this share
 * @returns {{ abort: boolean, reason: string|null }}
 */
export function shouldAbortIndexationRun(errors, total, maxErrorRatio = 0.5) {
  if (total === 0) {
    return { abort: true, reason: "no URLs inspected (empty or failed sitemap)" };
  }
  if (errors >= total * maxErrorRatio) {
    return {
      abort: true,
      reason: `${errors}/${total} URL inspections failed (>= ${maxErrorRatio * 100}%); refusing to overwrite snapshot`,
    };
  }
  return { abort: false, reason: null };
}

/**
 * Site route inventory — allowlist of known path prefixes for monedario.cl.
 * RUM may include routes from other hostnames if the Cloudflare account has
 * multiple zones. We keep only routes that match the site's known URL space.
 *
 * This is a shared constant used by both cloudflare-fetch.mjs (RUM sanitization)
 * and tests.
 */
export const SITE_ROUTE_ALLOWLIST = [
  "/",                    // home
  "/calculadoras/",       // calculator tools
  "/guias/",              // hub/guide pages
  "/posts/",              // editorial posts
  "/privacidad/",         // privacy policy
  "/cookies/",            // cookies policy
  "/apoyar/",             // support page
  "/metodologia/",        // methodology
  "/buscar/",             // search
  "/sitemap-index.xml",   // sitemap
  "/api/",                // API endpoints (internal)
  "/favicon.ico",
  "/robots.txt",
  "/rss.xml",
  "/llms.txt",
];

/**
 * Returns true if the requestPath belongs to the site's known route inventory.
 * @param {string} requestPath
 * @returns {boolean}
 */
export function isKnownSiteRoute(requestPath) {
  if (!requestPath) return false;
  for (const prefix of SITE_ROUTE_ALLOWLIST) {
    // The root "/" must match exactly; other prefixes match by startsWith.
    if (prefix === "/") {
      if (requestPath === "/") return true;
    } else if (requestPath === prefix || requestPath.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

/**
 * Sanitizes an array of RUM rows by filtering to only known site routes.
 * Returns { kept, discarded } where discarded includes the reason.
 *
 * Pure function — no I/O.
 *
 * @param {Array<{path: string, count: number, [key: string]: unknown}>} rumRows
 * @returns {{ kept: Array<object>, discarded: Array<{path: string, count: number, reason: string}> }}
 */
export function sanitizeRumRoutes(rumRows) {
  const kept = [];
  const discarded = [];

  for (const row of rumRows) {
    if (isKnownSiteRoute(row.path)) {
      kept.push(row);
    } else {
      discarded.push({
        path: row.path,
        count: row.count,
        reason: "route_not_in_site_inventory",
      });
    }
  }

  return { kept, discarded };
}
