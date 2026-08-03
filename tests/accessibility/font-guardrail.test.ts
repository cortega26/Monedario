import { test, expect } from "@playwright/test";

/**
 * Guardrail de rendimiento TD-0101 (LCP móvil de /calculadoras/):
 * - Las páginas de calculadoras NO deben descargar la fuente display (Fraunces):
 *   solo la arrastraban los h2 del footer compartido (regla base), bajo el fold.
 *   El fix en global.css (body:has(main[data-layout="calculator"])) y el preload
 *   condicional en Layout.astro deben permanecer, o el LCP vuelve a superar 1,7 s.
 * - sueldo-liquido conserva Fraunces únicamente para su figura opt-in
 *   (utility `font-display`) — la exclusión no debe expandirse ni revertirse.
 * - Las páginas editoriales (posts) deben seguir precargando Fraunces.
 */

test.describe("Display font loading guardrail (TD-0101)", () => {
  test("calculator pages do not fetch the display font and render footer headings in the body typeface", async ({
    page,
  }) => {
    const fontRequests: string[] = [];
    page.on("request", req => {
      if (req.url().includes("/fonts/fraunces-")) fontRequests.push(req.url());
    });

    await page.goto("/calculadoras/conversor-utm/");
    await page.waitForLoadState("networkidle");

    expect(fontRequests).toHaveLength(0);
    await expect(
      page.locator('link[rel="preload"][as="font"][href*="fraunces"]')
    ).toHaveCount(0);

    const footerFonts = await page.evaluate(() =>
      [...document.querySelectorAll("footer h2")].map(
        h => getComputedStyle(h).fontFamily
      )
    );
    expect(footerFonts.length).toBeGreaterThan(0);
    for (const font of footerFonts) {
      expect(font).toContain("Source Sans 3");
    }
  });

  test("sueldo-liquido keeps the display font only for its opt-in figure", async ({
    page,
  }) => {
    const fontRequests: string[] = [];
    page.on("request", req => {
      if (req.url().includes("/fonts/fraunces-")) fontRequests.push(req.url());
    });

    await page.goto("/calculadoras/sueldo-liquido/");
    await page.waitForLoadState("networkidle");

    expect(fontRequests).toHaveLength(1);

    const figureFont = await page.evaluate(() => {
      const el = document.querySelector(".font-display");
      return el ? getComputedStyle(el).fontFamily : null;
    });
    expect(figureFont).toContain("Fraunces");

    const footerFont = await page.evaluate(
      () => getComputedStyle(document.querySelector("footer h2")!).fontFamily
    );
    expect(footerFont).toContain("Source Sans 3");
  });

  test("editorial pages keep the display font preload", async ({ page }) => {
    await page.goto("/posts/como-calcular-sueldo-liquido/");
    await expect(
      page.locator('link[rel="preload"][as="font"][href*="fraunces"]')
    ).toHaveCount(1);
    const headingFont = await page.evaluate(
      () => getComputedStyle(document.querySelector("main h1")!).fontFamily
    );
    expect(headingFont).toContain("Fraunces");
  });
});
