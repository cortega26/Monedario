import { expect, test } from "@playwright/test";
import { blockWebStorage, calculateSueldo, sueldoResultText } from "./helpers";

test.describe("estado de sesión y storage (RES-030..037)", () => {
  test("RES-030: reload no deja estado stale (resultado viejo con input vacío)", async ({
    page,
  }) => {
    await page.goto("/calculadoras/sueldo-liquido/");
    await calculateSueldo(page, "1200000");
    await expect(page.locator("#resultado-contenido")).not.toHaveAttribute(
      "data-is-example",
      "true"
    );

    await page.reload();
    // El draft es efímero: si el input vuelve vacío, el resultado no puede
    // seguir mostrando un cálculo real de otro input (sin stale state).
    const inputValue = await page.locator("#sueldo").inputValue();
    if (inputValue === "") {
      await expect(page.locator("#resultado-contenido")).toHaveAttribute(
        "data-is-example",
        "true"
      );
    } else {
      await expect(page.locator("#resultado-contenido")).not.toHaveAttribute(
        "data-is-example",
        "true"
      );
    }
  });

  test("RES-031: back/forward no mezcla estados", async ({ page }) => {
    await page.goto("/calculadoras/sueldo-liquido/");
    await calculateSueldo(page, "1200000");
    await page.goto("/glosario/");
    await page.goBack();
    await expect(page.locator("#sueldo")).toHaveValue("1200000");
  });

  test("RES-032: sesión nueva no restaura el draft", async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto("/calculadoras/sueldo-liquido/");
    await calculateSueldo(pageA, "1200000");
    await contextA.close();

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto("/calculadoras/sueldo-liquido/");
    await expect(pageB.locator("#sueldo")).toHaveValue("");
    await contextB.close();
  });

  test("RES-033/034: escenario guardado persiste y es local", async ({
    page,
  }) => {
    await page.goto("/calculadoras/sueldo-liquido/");
    await calculateSueldo(page, "1500000");
    await page.locator("#scenario-save").click();
    await page.locator("#scenario-name-input").fill("Resiliencia");
    await page.locator("#scenario-name-form button[type='submit']").click();
    await expect(page.locator("#scenario-feedback")).toContainText(
      "Escenario guardado"
    );

    await page.reload();
    await expect(page.locator("#scenario-list")).toContainText("Resiliencia");
  });

  test("RES-035/036: storage bloqueado no rompe el cálculo", async ({
    page,
  }) => {
    await blockWebStorage(page);
    await page.goto("/calculadoras/sueldo-liquido/");
    await page.locator("#sueldo").fill("1200000");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#calc-error")).toBeHidden();
    expect(await sueldoResultText(page)).toMatch(/\$/);
  });

  test("RES-037: cookies bloqueadas no rompen el cálculo", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {},
      });
    });
    await page.goto("/calculadoras/sueldo-liquido/");
    await page.locator("#sueldo").fill("1200000");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#calc-error")).toBeHidden();
    expect(await sueldoResultText(page)).toMatch(/\$/);
  });
});
