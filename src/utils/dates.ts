/**
 * Date utilities — thin wrappers over date-fns with UTC semantics.
 *
 * Financial calculations (UTM monthly, UF daily, tax deadlines, retirement
 * projections) MUST be timezone-independent. All month-boundary operations
 * use Date.UTC to guarantee the same result in Santiago, CI runners, or
 * Cloudflare Workers.
 */

import {
  differenceInDays,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";

/** Parse an ISO date string (YYYY-MM-DD) into a UTC Date. */
export function isoToDate(dateString: string): Date {
  return parseISO(`${dateString}T00:00:00.000Z`);
}

/**
 * Format a Date as YYYY-MM-DD using UTC fields.
 *
 * date-fns `format` uses local timezone, which would shift dates by up to
 * a day depending on the runner's TZ. UTC accessors are deterministic.
 */
export function toIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Start of the month for the given ISO date string.
 * Returns a UTC Date set to 00:00:00.000 on the first day of the month.
 */
export function startOfMonthFromIso(dateString: string): Date {
  const d = isoToDate(dateString);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/**
 * Add `months` to a date and return the first day of the resulting month (UTC).
 *
 * Preserves the exact UTC-month-boundary semantics of the original hand-rolled
 * `addUtcMonths` while using `parseISO` for safe string→Date conversion.
 */
export function addMonthsToFirstDay(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  );
}

/** Current date as YYYY-MM-DD (UTC). */
export function todayIso(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

/** Fiscal year start in Chile: July 1 of the relevant year (UTC). */
export function getChileanFiscalYearStart(date: Date): Date {
  const year = getYear(date);
  const month = getMonth(date) + 1; // getMonth is 0-based
  const startYear = month >= 7 ? year : year - 1;
  return new Date(Date.UTC(startYear, 6, 1)); // July = month 6 in UTC
}

// Re-export commonly needed date-fns functions
export { differenceInDays, isAfter, isBefore, parseISO };
