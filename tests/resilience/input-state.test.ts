import { expect, test } from "@playwright/test";
import {
  calculateSueldo,
  collectConsoleErrors,
  sueldoResultText,
} from "./helpers";

test.describe("validación y coherencia de inputs (RES-010..025, RES-043)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calculadoras/sueldo-liquido/");
  });

  test("RES-010/011: vacío o espacios no produce resultado", async ({
    page,
  }) => {
    for (const value of ["", "   "]) {
      await page.locator("#sueldo").fill(value);
      await page.press("#sueldo", "Enter");
      await expect(page.locator("#calc-error")).toBeVisible();
      await expect(page.locator("#sueldo")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
      const result = await sueldoResultText(page);
      expect(result.toLowerCase()).toContain("corrige");
    }
  });

  test("RES-013: 0 explícito se invalida (documentado)", async ({ page }) => {
    await page.locator("#sueldo").fill("0");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#calc-error")).toBeVisible();
    await expect(page.locator("#sueldo")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  test("RES-020/022/025: el resultado corresponde al último input", async ({
    page,
  }) => {
    await calculateSueldo(page, "1200000");
    const resultA = await sueldoResultText(page);

    await calculateSueldo(page, "850000");
    const resultB = await sueldoResultText(page);
    expect(resultB).not.toBe(resultA);

    await calculateSueldo(page, "1200000");
    expect(await sueldoResultText(page)).toBe(resultA);
  });

  test("RES-021: doble click no duplica estado ni rompe", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.locator("#sueldo").fill("1200000");
    await page.locator("#calcBtn").dblclick();
    await expect(page.locator("#calc-error")).toBeHidden();
    expect(await page.locator("#resultado-contenido").count()).toBe(1);
    expect(errors).toEqual([]);
  });

  test("RES-023: cambiar AFP recalcula al enviar", async ({ page }) => {
    await calculateSueldo(page, "1200000");
    const before = await sueldoResultText(page);
    await page.locator("#afp-tasa").selectOption("Uno");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#calc-error")).toBeHidden();
    const after = await sueldoResultText(page);
    expect(after).not.toBe(before);
  });

  test("RES-024: Enter equivale a click", async ({ page }) => {
    await page.locator("#sueldo").fill("1200000");
    await page.press("#sueldo", "Enter");
    await expect(page.locator("#calc-error")).toBeHidden();
    expect(await sueldoResultText(page)).toMatch(/\$/);
  });

  test("RES-043: ningún elemento tapa el input a 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await calculateSueldo(page, "1200000");
    await page.locator("#sueldo").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -80));
    const inputReceivesPoint = await page.evaluate(() => {
      const input = document.getElementById("sueldo")!;
      const rect = input.getBoundingClientRect();
      const element = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      return element === input || input.contains(element);
    });
    expect(inputReceivesPoint).toBe(true);
  });
});
