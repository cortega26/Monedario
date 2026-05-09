import { test, expect } from "@playwright/test";
import { runAxe } from "./axe-helper";

const TEST_PAGES = [
  { name: "Homepage", url: "/" },
  { name: "Article", url: "/posts/como-calcular-sueldo-liquido/" },
  { name: "Calculator", url: "/calculadoras/sueldo-liquido/" },
  { name: "Search", url: "/buscar/" },
  { name: "404", url: "/nonexistent/" },
] as const;

test.describe("WCAG 2.2 AA — automated scan", () => {
  for (const pageDef of TEST_PAGES) {
    test(`${pageDef.name} should have no critical or serious violations`, async ({
      page,
    }) => {
      await page.goto(pageDef.url);
      await page.waitForLoadState("networkidle");

      const { violations } = await runAxe(page);

      const criticalAndSerious = violations.filter(
        v => v.impact === "critical" || v.impact === "serious"
      );

      if (criticalAndSerious.length > 0) {
        console.log(
          `\n=== ${pageDef.name} — ${criticalAndSerious.length} critical/serious violations ===`
        );
        for (const v of criticalAndSerious) {
          console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
          console.log(`  Help: ${v.helpUrl}`);
          console.log(
            `  Elements: ${v.nodes.map(n => n.target.join(", ")).join(" | ")}`
          );
        }
      }

      expect(criticalAndSerious).toEqual([]);
    });
  }
});

test.describe("Accessibility element presence", () => {
  test("skip link is present on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#skip-to-content")).toBeVisible();
  });

  test("dropdown menu uses ul (not role=menu) with aria-expanded", async ({
    page,
  }) => {
    await page.goto("/");
    // The dropdown button should have aria-expanded="false" initially
    await expect(page.locator("#guias-dropdown-button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    // The menu should be a <ul> (not a <div role="menu">)
    await expect(page.locator("#guias-dropdown-menu")).not.toHaveAttribute(
      "role",
      "menu"
    );
  });

  test("search form has role=search", async ({ page }) => {
    await page.goto("/buscar/");
    await page.waitForLoadState("networkidle");

    // The custom search form has role="search" and id="search-form"
    const searchForm = page.locator("#search-form");
    await expect(searchForm).toHaveAttribute("role", "search");
  });

  test("back-to-top button has aria-label after scrolling", async ({
    page,
  }) => {
    await page.goto("/posts/como-calcular-sueldo-liquido/");
    await page.waitForLoadState("networkidle");

    // Scroll down to make back-to-top visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const backToTop = page.locator('[data-button="back-to-top"]');
    await expect(backToTop).toHaveAttribute("aria-label", "Volver arriba");
  });
});
