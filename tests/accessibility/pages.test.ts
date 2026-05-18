import { test, expect } from "@playwright/test";
import { runAxe } from "./axe-helper";

const TEST_PAGES = [
  { name: "Homepage", url: "/" },
  { name: "Article", url: "/posts/como-calcular-sueldo-liquido/" },
  { name: "Calculator (sueldo)", url: "/calculadoras/sueldo-liquido/" },
  { name: "Calculator (UTM)", url: "/calculadoras/conversor-utm/" },
  { name: "Calculator index", url: "/calculadoras/" },
  { name: "Search", url: "/buscar/" },
  { name: "404", url: "/nonexistent/" },
  { name: "Glossary entry", url: "/glosario/cae/" },
  { name: "Law page", url: "/leyes/ley-18010-credito-dinero/" },
  { name: "About", url: "/about/" },
  { name: "Accessibility statement", url: "/accessibilidad/" },
  { name: "Tag page", url: "/tags/afp/" },
  { name: "Guides hub", url: "/guias/" },
] as const;

function reportViolations(
  context: string,
  violations: Array<{
    impact?: string | null;
    id: string;
    help: string;
    helpUrl: string;
    nodes: Array<{ target: Array<string>; html: string }>;
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

test.describe("WCAG 2.2 AA — automated scan (light desktop)", () => {
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
      reportViolations(pageDef.name, criticalAndSerious);
      expect(criticalAndSerious).toEqual([]);
    });
  }
});

test.describe("WCAG 2.2 AA — dark mode coverage", () => {
  for (const pageDef of TEST_PAGES) {
    test(`${pageDef.name} (dark) should have no critical or serious violations`, async ({
      page,
    }) => {
      await page.goto(pageDef.url);
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });
      await page.waitForLoadState("networkidle");

      const { violations } = await runAxe(page);
      const criticalAndSerious = violations.filter(
        v => v.impact === "critical" || v.impact === "serious"
      );
      reportViolations(`${pageDef.name} (dark)`, criticalAndSerious);
      expect(criticalAndSerious).toEqual([]);
    });
  }
});

test.describe("WCAG 2.2 AA — mobile viewport coverage", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const pageDef of TEST_PAGES) {
    test(`${pageDef.name} (mobile) should have no critical or serious violations`, async ({
      page,
    }) => {
      await page.goto(pageDef.url);
      await page.waitForLoadState("networkidle");

      const { violations } = await runAxe(page);
      const criticalAndSerious = violations.filter(
        v => v.impact === "critical" || v.impact === "serious"
      );
      reportViolations(`${pageDef.name} (mobile)`, criticalAndSerious);
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
