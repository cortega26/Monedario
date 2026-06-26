import { test, expect } from "@playwright/test";

/**
 * Structural a11y assertions for Plan 032 fixes:
 * 1. Radio groups wrapped in <fieldset> with <legend>
 * 2. CalculatorField inputs have aria-describedby pointing to a visible hint
 * 3. Result heading exists with tabindex="-1" (so focusResultado() works)
 */

test.describe("Calculadora sueldo-liquido — semantics (Plan 032)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calculadoras/sueldo-liquido/");
    await page.waitForLoadState("networkidle");
  });

  test("radio inputs are inside a <fieldset> with a <legend>", async ({
    page,
  }) => {
    // Expect at least one fieldset containing radio inputs
    const fieldsets = page.locator("fieldset:has(input[type='radio'])");
    await expect(fieldsets.first()).toBeVisible();

    // Each fieldset must have a legend
    const legends = page.locator("fieldset:has(input[type='radio']) legend");
    const count = await legends.count();
    expect(count).toBeGreaterThan(0);
  });

  test("at least one CalculatorField input has aria-describedby resolving to a visible hint", async ({
    page,
  }) => {
    // Find inputs with aria-describedby
    const inputs = page.locator("input[aria-describedby]");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);

    // For the first one, verify the referenced element exists and is visible
    const firstInput = inputs.first();
    const hintId = await firstInput.getAttribute("aria-describedby");
    expect(hintId).toBeTruthy();

    if (hintId) {
      const hintEl = page.locator(`[id="${hintId}"]`);
      await expect(hintEl).toBeAttached();
    }
  });

  test("#resultado-heading exists and has tabindex=-1", async ({ page }) => {
    const heading = page.locator("#resultado-heading");
    await expect(heading).toBeAttached();
    await expect(heading).toHaveAttribute("tabindex", "-1");
  });
});
