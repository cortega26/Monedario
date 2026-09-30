import { expect, test } from "@playwright/test";
import {
  readWebStorage,
  requestsContaining,
  startRequestCapture,
} from "./helpers";

test("Monedario Privado keeps imported financial data local", async ({ page }) => {
  const requests = startRequestCapture(page);
  await page.goto("/privado/");
  await page.waitForLoadState("networkidle");

  const requestsBeforeImport = requests.length;
  const canary = "91827364";
  const csv = [
    "Fecha;Descripción;Cargo;Abono",
    `2026-09-01;SUELDO;;${canary}`,
    "2026-09-02;LIDER MACUL;12345;",
  ].join("\n");

  await page.locator("#private-file").setInputFiles({
    name: "cartola-canario.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf8"),
  });

  await expect(page.locator("#private-results")).toBeVisible();
  await expect(page.locator("#private-row-count")).toContainText("2 movimientos");

  expect(requestsContaining(requests, canary)).toEqual([]);
  expect(page.url()).not.toContain(canary);
  expect(JSON.stringify(await page.context().cookies())).not.toContain(canary);
  expect(await readWebStorage(page)).not.toContain(canary);
  expect(requests).toHaveLength(requestsBeforeImport);

  await expect(page.locator('script[src*="analytics"]')).toHaveCount(0);
  await expect(page.locator('script[src="/sw-register.js"]')).toHaveCount(0);
});

test("fictional demo produces a useful local summary", async ({ page }) => {
  await page.goto("/privado/");
  await page.locator("#private-demo").click();

  await expect(page.locator("#private-results")).toBeVisible();
  await expect(page.locator("#private-row-count")).toContainText("8 movimientos");
  await expect(page.locator("#private-income")).not.toHaveText("");
  await expect(page.locator("#private-expenses")).not.toHaveText("");
  await expect(page.locator("#private-categories tr")).toHaveCount(7);
});
