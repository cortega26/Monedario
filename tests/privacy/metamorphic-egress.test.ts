import { expect, test } from "@playwright/test";
import { randomAmount } from "./helpers";

/**
 * Plan 121 (PRIV-004/008/020, test metamórfico del auditor): la misma
 * calculadora con 20 montos aleatorios distintos debe producir exactamente el
 * mismo payload saliente. Si el tráfico cambia cuando cambia el monto, hay
 * egreso financiero.
 */

const ITERATIONS = 20;

test("20 montos aleatorios producen un payload saliente idéntico", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__monedarioAnalyticsTransport =
      true;
  });

  const amounts = Array.from({ length: ITERATIONS }, () => randomAmount());
  const payloads: string[] = [];

  for (const amount of amounts) {
    // Navegación fresca por iteración: resetea el dedup once-per-view.
    await page.goto("/calculadoras/sueldo-liquido/");
    const [request] = await Promise.all([
      page.waitForRequest(
        r =>
          r.url().includes("/api/analytics/event") &&
          (r.postData() ?? "").includes("calculator_complete"),
        { timeout: 10000 }
      ),
      (async () => {
        await page.locator("#sueldo").fill(amount);
        await page.locator("#calcBtn").click();
      })(),
    ]);
    payloads.push(request.postData() ?? "");
  }

  expect(new Set(payloads).size).toBe(1);
  for (const amount of amounts) {
    for (const payload of payloads) {
      expect(payload).not.toContain(amount);
    }
  }
});
