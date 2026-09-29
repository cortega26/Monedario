import { expect, test } from "@playwright/test";
import { hasHorizontalOverflow } from "./helpers";

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
];

for (const viewport of VIEWPORTS) {
  test(`RES-040/041/042: sin overflow horizontal a ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    expect(await hasHorizontalOverflow(page)).toBe(false);
    await page.goto("/calculadoras/sueldo-liquido/");
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
}

test("RES-045/046: el botón flotante no cubre contenido en viewport estrecho", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/posts/operacion-renta-centro/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  const narrowDisplay = await page
    .locator("#btt-btn-container")
    .evaluate(element => getComputedStyle(element).display);
  expect(narrowDisplay).toBe("none");

  await page.setViewportSize({ width: 390, height: 844 });
  const wideDisplay = await page
    .locator("#btt-btn-container")
    .evaluate(element => getComputedStyle(element).display);
  expect(wideDisplay).not.toBe("none");
});
