import { expect, test } from "@playwright/test";
import { collectConsoleErrors } from "./helpers";

test("RES-050/051: flujo principal sin errores de consola ni requests esenciales fallidos", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  const failedEssential: string[] = [];
  page.on("response", response => {
    const url = new URL(response.url());
    const sameOrigin =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (sameOrigin && response.status() >= 400) {
      failedEssential.push(`${response.status()} ${url.pathname}`);
    }
  });

  await page.goto("/");
  await page.goto("/calculadoras/sueldo-liquido/");
  await page.locator("#sueldo").fill("1200000");
  await page.locator("#calcBtn").click();
  await expect(page.locator("#calc-error")).toBeHidden();

  expect(errors).toEqual([]);
  expect(failedEssential).toEqual([]);
});
