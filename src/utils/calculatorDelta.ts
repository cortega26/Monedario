/**
 * Inline "what changed" deltas for calculators.
 *
 * Tracks the previous headline value of a calculator (in-memory, per page load)
 * and builds a small badge showing how the result moved since the last run.
 * The arrow reflects only the numeric direction — it does not imply good/bad,
 * since "lower" is desirable for cost calculators and "higher" for savings ones.
 */

export type DeltaDirection = "up" | "down" | "same";

const previousValues = new Map<string, number>();

/** Records the latest headline value and returns the prior one, if any. */
function recordHeadlineValue(key: string, value: number): number | null {
  const prev = previousValues.has(key) ? previousValues.get(key)! : null;
  previousValues.set(key, value);
  return prev;
}

/**
 * Builds a delta badge comparing the current headline value to the previous run.
 * Returns null on the first calculation (no prior value to compare against).
 *
 * @param key       Stable identifier for the calculator (e.g. its pathname).
 * @param current   Current headline numeric value.
 * @param format    Formats the absolute difference for display (currency, %, etc.).
 */
export function renderHeadlineDelta(
  key: string,
  current: number,
  format: (abs: number) => string
): HTMLElement | null {
  const previous = recordHeadlineValue(key, current);
  if (
    previous === null ||
    !Number.isFinite(previous) ||
    !Number.isFinite(current)
  ) {
    return null;
  }

  const diff = current - previous;
  const direction: DeltaDirection =
    diff > 0 ? "up" : diff < 0 ? "down" : "same";

  const badge = document.createElement("p");
  badge.className =
    "mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted/60 px-2.5 py-0.5 text-xs font-medium text-secondary";
  badge.dataset.deltaDirection = direction;

  if (direction === "same") {
    badge.textContent = "Sin cambios vs. cálculo anterior";
    return badge;
  }

  const arrow = direction === "up" ? "▲" : "▼";
  const sign = direction === "up" ? "+" : "−";
  badge.textContent = `${arrow} ${sign}${format(Math.abs(diff))} vs. cálculo anterior`;
  return badge;
}
