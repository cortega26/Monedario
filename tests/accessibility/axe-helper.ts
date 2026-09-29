import { type Page } from "@playwright/test";

/**
 * Inject axe-core and run accessibility analysis on the current page.
 * Returns violations grouped by impact level.
 */
export async function runAxe(page: Page) {
  const AxeBuilder = (await import("@axe-core/playwright")).default;
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    inapplicable: results.inapplicable,
  };
}

/**
 * Filter violations by impact level.
 */
export function violationsByImpact(
  violations: Array<{ impact?: string }>,
  impact: "critical" | "serious" | "moderate" | "minor"
) {
  return violations.filter(v => v.impact === impact);
}

/**
 * Log a readable report for the given violations (no-op when empty).
 */
export function reportViolations(
  context: string,
  violations: Array<{
    impact?: string | null;
    id: string;
    help: string;
    helpUrl: string;
    nodes: Array<{ target: unknown; html: string }>;
  }>
) {
  if (violations.length === 0) return;
  // eslint-disable-next-line no-console
  console.log(`\n=== ${context} — ${violations.length} violations ===`);
  for (const v of violations) {
    // eslint-disable-next-line no-console
    console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
    // eslint-disable-next-line no-console
    console.log(`  Help: ${v.helpUrl}`);
    // eslint-disable-next-line no-console
    console.log(
      `  Elements: ${v.nodes.map(n => n.html.slice(0, 200)).join(" || ")}`
    );
  }
}
