import { expect, test, type Page } from "@playwright/test";
import {
  disallowedThirdPartyRequests,
  readWebStorage,
  requestsContaining,
  startRequestCapture,
} from "./helpers";

/**
 * Plan 121 (auditoría de privacidad 2026-09-29, PRIV-001..005/011/014):
 * un canario financiero introducido en una calculadora no puede aparecer en
 * URL, requests observables, terceros no declarados, cookies ni storage
 * (salvo que el usuario guarde un escenario, que se cubre en su propio spec).
 */

const CASES: Array<{
  name: string;
  canary: string;
  interact: (page: Page) => Promise<void>;
}> = [
  {
    name: "sueldo-liquido",
    canary: "7319421",
    interact: async page => {
      await page.locator("#sueldo").fill("7319421");
      await page.locator("#calcBtn").click();
    },
  },
  {
    name: "credito-consumo",
    canary: "8627139",
    interact: async page => {
      await page.locator("#monto").fill("8627139");
      await page.locator("#plazo").fill("37");
      await page.locator("#tasa").fill("1.73");
      await page.locator("#calcBtn").click();
    },
  },
  {
    name: "simulador-renegociacion",
    canary: "5942681",
    interact: async page => {
      await page.locator(".deuda-monto").first().fill("5942681");
      await page.locator(".deuda-acreedor").first().fill("Banco Canario");
      await page.locator("#calcBtn").click();
    },
  },
  {
    name: "simulador-jubilacion",
    canary: "4173829",
    interact: async page => {
      await page.locator("#sueldo").fill("1200000");
      await page.locator("#saldo-actual").fill("4173829");
      await page.locator("#calcBtn").click();
    },
  },
];

for (const testCase of CASES) {
  test(`canario financiero permanece local: ${testCase.name}`, async ({
    page,
  }) => {
    const requests = startRequestCapture(page);
    await page.goto(`/calculadoras/${testCase.name}/`);
    await testCase.interact(page);
    await expect(page.locator("#resultado-contenido")).toBeVisible();

    expect(requestsContaining(requests, testCase.canary)).toEqual([]);
    expect(page.url()).not.toContain(testCase.canary);

    const pageHost = new URL(page.url()).hostname;
    expect(disallowedThirdPartyRequests(requests, pageHost)).toEqual([]);

    const cookies = JSON.stringify(await page.context().cookies());
    expect(cookies).not.toContain(testCase.canary);
    expect(await readWebStorage(page)).not.toContain(testCase.canary);
  });
}
