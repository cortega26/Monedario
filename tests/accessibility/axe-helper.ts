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
