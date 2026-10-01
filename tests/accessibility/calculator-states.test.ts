import { expect, test, type Page } from "@playwright/test";

/**
 * Plan 114 / audit F-01 + F-06: an invalid attempt must never leave the
 * illustrative example (or a stale result) visible as if it belonged to the
 * user's input. Contract: the result container carries
 * `data-result-state="invalid"` after a rejected attempt and
 * `data-result-state="result"` after a successful calculation.
 */

interface CalculatorStateConfig {
  slug: string;
  invalidate: (page: Page) => Promise<void>;
  errorSelector: string;
}

const CALCULATORS: CalculatorStateConfig[] = [
  {
    slug: "sueldo-liquido",
    invalidate: async page => {
      await page.locator("#sueldo").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#calc-error",
  },
  {
    slug: "reajuste-arriendo",
    invalidate: async page => {
      await page.locator("#arriendo-uf").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#reajuste-error",
  },
  {
    slug: "deposito-a-plazo",
    invalidate: async page => {
      await page.locator("#monto-dap").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#calc-error",
  },
  {
    slug: "boleta-honorarios-liquido",
    invalidate: async page => {
      await page.locator("#gross-fee").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#honorarios-error",
  },
  {
    slug: "dividendo-hipotecario",
    invalidate: async page => {
      await page.locator("#propertyValue").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#calc-error",
  },
  {
    slug: "operacion-renta",
    invalidate: async page => {
      await page.locator("#renta-neta-sueldos").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#form-error",
  },
  {
    slug: "simulador-renegociacion",
    invalidate: async page => {
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#calc-error",
  },
  {
    slug: "seguro-cesantia",
    invalidate: async page => {
      await page.locator("#sueldo").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#cesantia-error",
  },
  {
    slug: "impuesto-segunda-categoria",
    invalidate: async page => {
      await page.locator("#imponible").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#segunda-categoria-error",
  },
  {
    slug: "credito-consumo",
    invalidate: async page => {
      await page.locator("#monto").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#calc-error",
  },
  {
    slug: "simulador-jubilacion",
    invalidate: async page => {
      await page.locator("#sueldo").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#jubilacion-error",
  },
  {
    slug: "iva",
    invalidate: async page => {
      await page.locator("#monto-input").fill("0");
    },
    errorSelector: "#monto-error",
  },
  {
    slug: "tarjeta-credito",
    invalidate: async page => {
      await page.locator("#deuda").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#calc-error",
  },
  {
    slug: "interes-compuesto",
    invalidate: async page => {
      await page.locator("#capital-inicial").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#calc-error",
  },
  {
    slug: "apv",
    invalidate: async page => {
      await page.locator("#sueldo").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#form-error",
  },
  {
    slug: "prepago-credito",
    invalidate: async page => {
      await page.locator("#saldo").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#prepago-error",
  },
  {
    slug: "finiquito-indemnizacion",
    invalidate: async page => {
      await page.locator("#monthly-salary").fill("0");
      await page.locator("#calcBtn").click();
    },
    errorSelector: "#finiquito-error",
  },
];

const exampleLocator = (page: Page) =>
  page.locator("[data-is-example='true']").first();

test.describe("Calculator result states (Plan 114)", () => {
  for (const cfg of CALCULATORS) {
    test(`${cfg.slug}: invalid attempt replaces the example with a corrective state`, async ({
      page,
    }) => {
      await page.goto(`/calculadoras/${cfg.slug}/`);
      await page.waitForLoadState("networkidle");

      await expect(exampleLocator(page)).toBeAttached();

      await cfg.invalidate(page);
      await expect(page.locator(cfg.errorSelector)).toBeVisible();

      const resultContainer = page
        .locator("[data-result-state='invalid']")
        .first();
      await expect(resultContainer).toBeAttached();
      await expect(resultContainer).toContainText("Corrige los datos");
      await expect(page.locator("[data-is-example='true']")).toHaveCount(0);
    });
  }

  test("sueldo-liquido: el ejemplo ilustrativo coincide con el cálculo real", async ({
    page,
  }) => {
    await page.goto("/calculadoras/sueldo-liquido/");
    await page.waitForLoadState("networkidle");

    const exampleText = await page
      .locator("#resultado-contenido")
      .innerText();

    await page.locator("#sueldo").fill("1200000");
    await page.locator("#calcBtn").click();
    const resultText = await page
      .locator("#resultado-contenido")
      .innerText();

    // Montos independientes de los parámetros mensuales (auditoría F08).
    for (const amount of ["$1.200.000", "$135.240", "$84.000", "$7.200"]) {
      expect(exampleText).toContain(amount);
      expect(resultText).toContain(amount);
    }

    // El impuesto de 2ª categoría y el líquido dependen de la UTM/UF vigente
    // (el tramo exento se cruza con el refresh económico mensual; ver #631),
    // así que el invariante es que todo monto del ejemplo provenga del mismo
    // motor que el cálculo real, no un valor congelado que queda obsoleto con
    // cada refresh. El resultado agrega montos auxiliares propios.
    const amountsIn = (text: string) =>
      new Set(text.match(/\$[\d.]+/g) ?? []);
    const exampleAmounts = amountsIn(exampleText);
    const resultAmounts = amountsIn(resultText);
    expect(exampleAmounts.size).toBeGreaterThan(0);
    for (const amount of exampleAmounts) {
      expect(resultAmounts.has(amount), `falta ${amount} en el resultado`).toBe(
        true
      );
    }
  });

  test("operacion-renta: la estimación desde sueldo bruto marca la base como estimada", async ({
    page,
  }) => {
    await page.goto("/calculadoras/operacion-renta/");
    await page.waitForLoadState("networkidle");

    await page.locator("#sueldos-estimacion summary").click();
    await page.locator("#est-sueldo-bruto").fill("1500000");
    await page.locator("#est-aplicar").click();

    // Habitat 11,27% + Fonasa 7% + AFC 0,6% sobre $1.500.000 × 12.
    await expect(page.locator("#renta-neta-sueldos")).toHaveValue("14603400");

    await page.locator("#calcBtn").click();
    await expect(page.locator("#resultado-contenido")).toContainText(
      "renta neta estimada"
    );
  });

  test.describe("result trust block (F-08)", () => {
    for (const cfg of CALCULATORS) {
      test(`${cfg.slug}: result states the estimate is referential`, async ({
        page,
      }) => {
        await page.goto(`/calculadoras/${cfg.slug}/`);
        await page.waitForLoadState("networkidle");
        await expect(page.locator("main")).toContainText(
          "Estimación referencial"
        );
      });
    }
  });

  test.describe("sueldo-liquido boundary inputs", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/calculadoras/sueldo-liquido/");
      await page.waitForLoadState("networkidle");
    });

    for (const value of ["", "0", "-1"]) {
      test(`invalid input ${JSON.stringify(value)} does not keep the example`, async ({
        page,
      }) => {
        await page.locator("#sueldo").fill(value);
        await page.locator("#calcBtn").click();
        await expect(page.locator("#calc-error")).toBeVisible();
        await expect(page.locator("[data-result-state='invalid']")).toContainText(
          "Corrige los datos"
        );
        await expect(page.locator("[data-is-example='true']")).toHaveCount(0);
        await expect(page.locator("#result-actions")).toBeHidden();
      });
    }

    test("a decimal amount renders a real result and clears the example flag", async ({
      page,
    }) => {
      await page.locator("#sueldo").fill("1234.56");
      await page.locator("#calcBtn").click();
      await expect(page.locator("#calc-error")).toBeHidden();
      const container = page.locator("#resultado-contenido");
      await expect(container).toHaveAttribute("data-result-state", "result");
      await expect(page.locator("[data-is-example='true']")).toHaveCount(0);
      await expect(container).toContainText("$");
    });

    test("a very high amount renders a real result", async ({ page }) => {
      await page.locator("#sueldo").fill("999999999");
      await page.locator("#calcBtn").click();
      await expect(page.locator("#calc-error")).toBeHidden();
      await expect(page.locator("#resultado-contenido")).toHaveAttribute(
        "data-result-state",
        "result"
      );
    });
  });
});