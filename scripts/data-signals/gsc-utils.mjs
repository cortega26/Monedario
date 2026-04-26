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
