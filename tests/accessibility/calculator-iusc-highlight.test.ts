import { expect, test } from "@playwright/test";

/**
 * Re-auditoría 2026-09-29 (D12): el resaltado del tramo activo debe seguir la
 * tabla general (35% hasta 310 UTM), no la estructura del art. 52 bis (150).
 */
test("resalta el tramo correcto según la tabla general de IUSC", async ({
  page,
}) => {
  await page.goto("/calculadoras/impuesto-segunda-categoria/");
  const utm = await page.evaluate(() => {
    const element = document.getElementById(
      "economic-parameters"
    ) as HTMLElement | null;
    return Number(element?.dataset?.utm);
  });
  expect(utm).toBeGreaterThan(0);

  // 200 UTM: tramo 35% (120–310), no el 40% (310+).
  await page.locator("#imponible").fill(String(Math.round(200 * utm)));
  await page.locator("#calcBtn").click();
  await expect(page.locator("#tramo-6")).toHaveClass(/bg-accent\/10/);
  await expect(page.locator("#tramo-7")).not.toHaveClass(/bg-accent\/10/);

  // 320 UTM: tramo 40%.
  await page.locator("#imponible").fill(String(Math.round(320 * utm)));
  await page.locator("#calcBtn").click();
  await expect(page.locator("#tramo-7")).toHaveClass(/bg-accent\/10/);
  await expect(page.locator("#tramo-6")).not.toHaveClass(/bg-accent\/10/);

  // 100 UTM: tramo 30,4% (90–120).
  await page.locator("#imponible").fill(String(Math.round(100 * utm)));
  await page.locator("#calcBtn").click();
  await expect(page.locator("#tramo-5")).toHaveClass(/bg-accent\/10/);
});
