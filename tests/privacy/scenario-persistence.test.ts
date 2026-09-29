import { expect, test } from "@playwright/test";
import { requestsContaining, startRequestCapture } from "./helpers";

/**
 * Plan 121 (PRIV-02/012/013): "Guardar escenario" persiste solo en
 * localStorage (`monedario_scenarios`), no genera requests de red con el
 * monto y sobrevive a un reload.
 */

const STORAGE_KEY = "monedario_scenarios";
const CANARY = "1500000";

test("guardar escenario persiste localmente, sin red y sobrevive al reload", async ({
  page,
}) => {
  const requests = startRequestCapture(page);
  await page.goto("/calculadoras/sueldo-liquido/");
  await page.locator("#sueldo").fill(CANARY);
  await page.locator("#calcBtn").click();
  await expect(page.locator("#scenario-panel")).toBeVisible();

  await page.locator("#scenario-save").click();
  await page.locator("#scenario-name-input").fill("Escenario canario");
  const beforeSave = requests.length;
  await page.locator("#scenario-name-form button[type='submit']").click();
  await expect(page.locator("#scenario-feedback")).toContainText(
    "Escenario guardado"
  );

  // El guardado no transmite el monto ni genera red con datos financieros.
  const saveRequests = requests.slice(beforeSave);
  expect(requestsContaining(saveRequests, CANARY)).toEqual([]);
  expect(
    saveRequests.filter(r => r.method === "POST" && r.body)
  ).toEqual([]);

  // Persistencia local con la key documentada.
  const stored = await page.evaluate(
    key => window.localStorage.getItem(key),
    STORAGE_KEY
  );
  expect(stored).toContain("Escenario canario");
  expect(stored).toContain(CANARY);

  // Sobrevive al reload sin red.
  const beforeReload = requests.length;
  await page.reload();
  await expect(page.locator("#scenario-panel")).toBeVisible();
  await expect(page.locator("#scenario-list")).toContainText(
    "Escenario canario"
  );
  const reloadRequests = requests.slice(beforeReload);
  expect(requestsContaining(reloadRequests, CANARY)).toEqual([]);
});
