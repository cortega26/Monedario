import { expect, test, type Page } from "@playwright/test";
import { reportViolations, runAxe } from "./axe-helper";

/**
 * Plan 114: axe over calculator result states. The template sweep only sees
 * the illustrative example, so dynamic result rows (semantic success/danger
 * colors) need their own pass. Each case must render a real result
 * (`data-result-state="result"`) before scanning.
 */

interface ResultConfig {
  slug: string;
  fill: (page: Page) => Promise<void>;
  submit?: boolean;
}

const CALCULATORS: ResultConfig[] = [
  {
    slug: "sueldo-liquido",
    fill: async page => {
      await page.locator("#sueldo").fill("1500000");
    },
  },
  {
    slug: "reajuste-arriendo",
    fill: async page => {
      await page.locator("#arriendo-uf").fill("20");
      await page.locator("#uf-antes").fill("37000");
      await page.locator("#uf-hoy").fill("38000");
    },
  },
  {
    slug: "deposito-a-plazo",
    fill: async page => {
      await page.locator("#monto-dap").fill("1000000");
      await page.locator("#plazo-dias").fill("180");
      await page.locator("#tasa-tir").fill("5");
    },
  },
  {
    slug: "boleta-honorarios-liquido",
    fill: async page => {
      await page.locator("#gross-fee").fill("500000");
    },
  },
  {
    slug: "dividendo-hipotecario",
    fill: async page => {
      await page.locator("#propertyValue").fill("3000");
      await page.locator("#annualRate").fill("4.5");
    },
  },
  {
    slug: "operacion-renta",
    fill: async page => {
      await page.locator("#sueldos-brutos").fill("12000000");
    },
  },
  {
    slug: "simulador-renegociacion",
    fill: async page => {
      await page.locator(".deuda-monto").first().fill("2000000");
      await page.locator("#ingreso").fill("700000");
      await page.locator("#primera-categoria").selectOption("no");
      await page.locator("#juicio-ejecutivo").selectOption("no");
      await page.locator("#documentos-completos").selectOption("si");
    },
  },
  {
    slug: "seguro-cesantia",
    fill: async page => {
      await page.locator("#sueldo").fill("800000");
      await page.locator("#saldo-actual").fill("1000000");
    },
  },
  {
    slug: "impuesto-segunda-categoria",
    fill: async page => {
      await page.locator("#imponible").fill("1200000");
    },
  },
  {
    slug: "credito-consumo",
    fill: async page => {
      await page.locator("#monto").fill("2000000");
    },
  },
  {
    slug: "simulador-jubilacion",
    fill: async page => {
      await page.locator("#sueldo").fill("1200000");
    },
  },
  {
    slug: "iva",
    fill: async page => {
      await page.locator("#monto-input").fill("1000000");
    },
    submit: false,
  },
  {
    slug: "tarjeta-credito",
    fill: async page => {
      await page.locator("#deuda").fill("500000");
    },
  },
  {
    slug: "interes-compuesto",
    fill: async page => {
      await page.locator("#capital-inicial").fill("1000000");
      await page.locator("#tasa-anual").fill("8");
    },
  },
  {
    slug: "apv",
    fill: async page => {
      await page.locator("#sueldo").fill("1500000");
      await page.locator("#ahorro").fill("100000");
    },
  },
  {
    slug: "prepago-credito",
    fill: async page => {
      await page.locator("#saldo").fill("5000000");
      await page.locator("#cuota").fill("150000");
      await page.locator("#monto-prepago").fill("1000000");
      await page.locator("#meses-restantes").fill("36");
    },
  },
  {
    slug: "finiquito-indemnizacion",
    fill: async page => {
      await page.locator("#monthly-salary").fill("900000");
    },
  },
];

test.describe("WCAG 2.2 AA — calculated result states", () => {
  for (const cfg of CALCULATORS) {
    test(`${cfg.slug}: result after a valid calculation has no critical or serious violations`, async ({
      page,
    }) => {
      await page.goto(`/calculadoras/${cfg.slug}/`);
      await page.waitForLoadState("networkidle");

      await cfg.fill(page);
      if (cfg.submit !== false) {
        await page.locator("#calcBtn").click();
      }

      await expect(
        page.locator("[data-result-state='result']").first()
      ).toBeAttached();

      const { violations } = await runAxe(page);
      const criticalAndSerious = violations.filter(
        v => v.impact === "critical" || v.impact === "serious"
      );
      reportViolations(`${cfg.slug} (result)`, criticalAndSerious);
      expect(criticalAndSerious).toEqual([]);
    });
  }
});
