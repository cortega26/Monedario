import { readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * Plan 114 / audit F-03: every form control in the calculator templates must
 * have a programmatic accessible name from an associated <label>, aria-label
 * or aria-labelledby. Placeholders and title alone do not count (axe accepts
 * placeholder as a naming method, which hid these gaps).
 */

const CALCULATOR_SLUGS = readdirSync("src/pages/calculadoras")
  .filter(file => file.endsWith(".astro") && file !== "index.astro")
  .map(file => file.replace(/\.astro$/, ""));

async function unnamedControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return [];
    return Array.from(
      main.querySelectorAll<HTMLElement>("input, select, textarea")
    )
      .filter(element => {
        if (element.getAttribute("type") === "hidden") return false;
        if (element.getAttribute("aria-hidden") === "true") return false;
        const hasAria =
          element.hasAttribute("aria-label") ||
          element.hasAttribute("aria-labelledby");
        const control = element as HTMLInputElement;
        const hasAssociatedLabel = (control.labels?.length ?? 0) > 0;
        return !hasAria && !hasAssociatedLabel;
      })
      .map(element => element.outerHTML.slice(0, 160));
  });
}

test.describe("Calculator form controls have accessible names (Plan 114)", () => {
  for (const slug of CALCULATOR_SLUGS) {
    test(`${slug}: every control has a label or aria name`, async ({ page }) => {
      await page.goto(`/calculadoras/${slug}/`);
      await page.waitForLoadState("networkidle");
      expect(await unnamedControls(page)).toEqual([]);
    });
  }

  test("simulador-renegociacion: dynamically added debt rows also have names", async ({
    page,
  }) => {
    await page.goto("/calculadoras/simulador-renegociacion/");
    await page.waitForLoadState("networkidle");
    await page.locator("#agregar-deuda").click();
    expect(await unnamedControls(page)).toEqual([]);
  });
});