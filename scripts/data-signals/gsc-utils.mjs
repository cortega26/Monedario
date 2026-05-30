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
