import { expect, test } from "@playwright/test";

test.describe("degradación controlada (RES-001..006, RES-054)", () => {
  test("RES-001/002: contenido principal sin JS", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page.locator("main")).toContainText(/financ|Monedario/i);

    await page.goto("/posts/operacion-renta-centro/");
    await expect(page.locator("article")).toContainText(/Operación Renta/i);

    await context.close();
  });

  test("RES-003/054: calculadora sin JS muestra fallback explícito", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/calculadoras/sueldo-liquido/");

    const fallback = page.locator("noscript div");
    await expect(fallback).toBeVisible();
    await expect(fallback).toContainText(
      "Esta calculadora necesita JavaScript"
    );
    const pointerEvents = await page
      .locator("#sueldo")
      .evaluate(element => getComputedStyle(element).pointerEvents);
    expect(pointerEvents).toBe("none");

    await context.close();
  });

  test("RES-004/005/006: terceros, analytics e imágenes bloqueados no impiden el cálculo", async ({
    page,
  }) => {
    await page.route("**/*", route => {
      const url = new URL(route.request().url());
      const isThirdParty =
        url.hostname !== "localhost" && url.hostname !== "127.0.0.1";
      const isAnalytics = url.pathname.includes("/api/analytics/");
      const isImage = /\.(png|jpe?g|avif|webp|svg|gif)$/i.test(url.pathname);
      if (isThirdParty || isAnalytics || isImage) {
        return route.abort();
      }
      return route.continue();
    });

    await page.goto("/calculadoras/sueldo-liquido/");
    await page.locator("#sueldo").fill("1200000");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#calc-error")).toBeHidden();
    await expect(page.locator("#resultado-contenido")).toContainText("$");
  });
});
