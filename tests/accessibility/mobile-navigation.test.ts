import { test, expect } from "@playwright/test";

test.describe("Navegación móvil compacta", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("alinea categorías y agrupa las utilidades en la misma fila", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#menu-btn").click();

    const menu = page.locator("#menu-items");
    await expect(menu).toBeVisible();
    await expect(page.locator("#menu-btn")).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    const mainItems = [
      page.locator("#guias-dropdown-button"),
      page.locator('[data-analytics-label="Calculadoras"]'),
      page.locator('[data-analytics-label="Glosario"]'),
      page.locator('[data-analytics-label="Metodología"]'),
    ];
    const rectangles = await Promise.all(
      mainItems.map(item => item.boundingBox())
    );
    expect(rectangles.every(Boolean)).toBe(true);

    const positions = rectangles.map(rect => rect!);
    for (let index = 1; index < positions.length; index++) {
      expect(Math.abs(positions[index].x - positions[0].x)).toBeLessThan(2);
      expect(positions[index].y).toBeGreaterThan(
        positions[index - 1].y + 40
      );
      expect(positions[index].width).toBeGreaterThan(300);
    }

    const search = await page.locator('#menu-items a[aria-label="Buscar"]').boundingBox();
    const theme = await page.locator("#theme-btn").boundingBox();
    expect(search).not.toBeNull();
    expect(theme).not.toBeNull();
    expect(search!.x).toBeLessThan(theme!.x);
    expect(Math.abs(search!.y - theme!.y)).toBeLessThan(15);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow).toBe(false);
  });

  test("mantiene el desplegable de Guías y cierra con Escape", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#menu-btn").click();
    await page.locator("#guias-dropdown-button").click();

    await expect(page.locator("#guias-dropdown-button")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(page.locator("#guias-dropdown-menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#menu-items")).toBeHidden();
    await expect(page.locator("#menu-btn")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });
});

test.describe("Navegación en escritorio", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("conserva las opciones en una fila horizontal", async ({ page }) => {
    await page.goto("/");
    const guides = await page.locator("#guias-dropdown-button").boundingBox();
    const calculators = await page
      .locator('[data-analytics-label="Calculadoras"]')
      .boundingBox();
    expect(guides).not.toBeNull();
    expect(calculators).not.toBeNull();
    expect(Math.abs(guides!.y - calculators!.y)).toBeLessThan(12);
    expect(calculators!.x).toBeGreaterThan(guides!.x);
  });
});
