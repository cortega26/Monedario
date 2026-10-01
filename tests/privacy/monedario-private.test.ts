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
  await expect(page.locator("#private-category-bars > div")).toHaveCount(7);
  await expect(page.locator("#private-insight")).toContainText(
    "Vivienda concentra 72% de los egresos"
  );
  await expect(page.locator("#private-categories tr")).toHaveCount(7);
});

test("malicious file metadata and parser errors are rendered as text, not markup", async ({
  page,
}) => {
  await page.goto("/privado/");
  await page.waitForLoadState("networkidle");

  const payload = "<img src=x onerror=document.body.dataset.pwned=1>";
  const validCsv = [
    "Fecha;Descripción;Cargo;Abono",
    "2026-09-01;Compra;12345;",
  ].join("\n");

  await page.locator("#private-file").setInputFiles({
    name: `${payload}.csv`,
    mimeType: "text/csv",
    buffer: Buffer.from(validCsv, "utf8"),
  });

  await expect(page.locator("#private-results")).toBeVisible();
  await expect(page.locator("#private-file-name")).toContainText(payload);
  await expect(page.locator("#private-file-name img")).toHaveCount(0);

  const invalidCsv = [
    "Fecha;Descripción;Monto;Tipo",
    `2026-09-02;Ataque;12345;${payload}`,
  ].join("\n");

  await page.locator("#private-file").setInputFiles({
    name: "error-malicioso.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(invalidCsv, "utf8"),
  });

  await expect(page.locator("#private-error")).toContainText(payload);
  await expect(page.locator("#private-error img")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.body.dataset.pwned ?? null))
    .toBeNull();
});

test("roadmap distinguishes shipped capability from future intent", async ({
  page,
}) => {
  await page.goto("/privado/");

  await expect(page.locator('[data-roadmap-status="available"]')).toHaveCount(1);
  await expect(page.locator('[data-roadmap-status="planned"]')).toHaveCount(2);
  await expect(page.locator('[data-roadmap-status="evaluating"]')).toHaveCount(
    1
  );
});
