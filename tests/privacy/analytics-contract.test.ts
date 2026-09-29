import { expect, test } from "@playwright/test";
import { ANALYTICS_EVENT_ALLOWLIST } from "../../src/contracts/analytics-events";
import { startRequestCapture } from "./helpers";

/**
 * Plan 121 (PRIV-01): con el transporte habilitado (opt-in explícito, mismo
 * mecanismo que los tests de integración), un cálculo completo debe emitir
 * exactamente 1 POST a /api/analytics/event con payload allowlisted, sin
 * texto libre, sin identificadores y sin el monto introducido.
 */

const CANARY = "7319421";

test("calculator_complete se transmite una vez con payload allowlisted", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__monedarioAnalyticsTransport =
      true;
  });
  const requests = startRequestCapture(page);
  await page.goto("/calculadoras/sueldo-liquido/");

  const [request] = await Promise.all([
    page.waitForRequest(
      r =>
        r.url().includes("/api/analytics/event") &&
        (r.postData() ?? "").includes("calculator_complete"),
      { timeout: 10000 }
    ),
    (async () => {
      await page.locator("#sueldo").fill(CANARY);
      await page.locator("#calcBtn").click();
    })(),
  ]);

  const payload = JSON.parse(request.postData() ?? "{}");
  expect(payload.event).toBe("calculator_complete");

  const allowed = new Set(ANALYTICS_EVENT_ALLOWLIST.calculator_complete);
  for (const key of Object.keys(payload.params ?? {})) {
    expect(allowed.has(key as never), `clave no allowlisted: ${key}`).toBe(true);
  }

  const serialized = JSON.stringify(payload);
  expect(serialized).not.toContain(CANARY);
  const forbiddenKey = /rut|email|phone|nombre|user|session|fingerprint/i;
  for (const key of Object.keys(payload.params ?? {})) {
    expect(forbiddenKey.test(key), `clave prohibida: ${key}`).toBe(false);
  }

  // Dedup once-per-view: un segundo cálculo no vuelve a transmitir
  // calculator_complete (calculator_start puede repetirse por interacción).
  await page.locator("#sueldo").fill("1500000");
  await page.locator("#calcBtn").click();
  await page.waitForTimeout(400);
  const completePosts = requests.filter(
    r =>
      r.url.includes("/api/analytics/event") &&
      (r.body ?? "").includes("calculator_complete")
  );
  expect(completePosts).toHaveLength(1);
});

test("el cálculo no crea cookies ni identificadores persistentes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__monedarioAnalyticsTransport =
      true;
  });
  await page.goto("/calculadoras/sueldo-liquido/");
  await page.locator("#sueldo").fill(CANARY);
  await page.locator("#calcBtn").click();
  await page.waitForTimeout(400);

  expect(await page.context().cookies()).toEqual([]);
  const storage = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }));
  const trackingLike = [...storage.local, ...storage.session].filter(key =>
    /user|visitor|fingerprint|track|analytics|uid/i.test(key)
  );
  expect(trackingLike).toEqual([]);
});
