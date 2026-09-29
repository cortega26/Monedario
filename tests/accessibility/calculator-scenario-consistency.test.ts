import { expect, test, type Page } from "@playwright/test";

/**
 * Plan 089: saving a scenario must persist the last successfully completed
 * calculation together with the inputs that produced it.
 *
 * For each calculator: calculate with inputs A, save A, edit the form to B
 * WITHOUT recalculating, save again — the second save must still hold A/A.
 * Recalculating and saving must then hold B/B. An invalid attempt after A
 * must not enable saving a mixed pair, and restoring A must refill A and
 * recalculate the same summary.
 *
 * localStorage is only read as evidence of real clicks; scenarios are never
 * prefabricated. No arbitrary sleeps: calculator handlers run synchronously,
 * and the sueldo auto-calc debounce is bypassed by setting #sueldo without
 * firing input events.
 */

const STORAGE_KEY = "monedario_scenarios";

interface StoredScenario {
  id: string;
  name: string;
  ts: number;
  inputs: Record<string, string>;
  summary: Array<{ label: string; value: string }>;
}

async function scenariosFor(
  page: Page,
  calculatorId: string
): Promise<StoredScenario[]> {
  return page.evaluate(
    ({ key, calc }) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const store = JSON.parse(raw) as Record<string, StoredScenario[]>;
      return store[calc] ?? [];
    },
    { key: STORAGE_KEY, calc: calculatorId }
  );
}

async function saveScenarioAs(page: Page, name: string): Promise<void> {
  await page.locator("#scenario-save").click();
  await expect(page.locator("#scenario-name-form")).toBeVisible();
  await page.locator("#scenario-name-input").fill(name);
  await page.locator("#scenario-name-form button[type='submit']").click();
  await expect(page.locator("#scenario-feedback")).toContainText(
    "Escenario guardado"
  );
}

async function calculate(page: Page, errorSelector: string): Promise<void> {
  await page.locator("#calcBtn").click();
  await expect(page.locator(errorSelector)).toBeHidden();
}

interface CalcConfig {
  slug: string;
  fillA: (page: Page) => Promise<void>;
  editId: string;
  valueB: string;
  editToB?: (page: Page) => Promise<void>;
  errorSelector: string;
  expectKeys?: Record<string, string>;
}

const CALCULATORS: CalcConfig[] = [
  {
    slug: "credito-consumo",
    fillA: async page => {
      await page.locator("#monto").fill("2000000");
    },
    editId: "monto",
    valueB: "3000000",
    errorSelector: "#calc-error",
    expectKeys: { "r:tasa-tipo": "mensual" },
  },
  {
    slug: "deposito-a-plazo",
    fillA: async page => {
      await page.locator("#monto-dap").fill("1000000");
      await page.locator("#plazo-dias").fill("180");
      await page.locator("#tasa-tir").fill("5");
    },
    editId: "monto-dap",
    valueB: "2000000",
    errorSelector: "#calc-error",
  },
  {
    slug: "dividendo-hipotecario",
    fillA: async page => {
      await page.locator("#propertyValue").fill("3000");
      await page.locator("#annualRate").fill("4.5");
    },
    editId: "propertyValue",
    valueB: "4000",
    errorSelector: "#calc-error",
    expectKeys: {
      "r:currency": "uf",
      "r:downPayment": "20",
      "r:termYears": "20",
    },
  },
  {
    slug: "interes-compuesto",
    fillA: async page => {
      await page.locator("#capital-inicial").fill("1000000");
      await page.locator("#tasa-anual").fill("8");
    },
    editId: "capital-inicial",
    valueB: "2000000",
    errorSelector: "#calc-error",
    expectKeys: { frecuencia: "12" },
  },
  {
    slug: "simulador-jubilacion",
    fillA: async page => {
      await page.locator("#sueldo").fill("1200000");
    },
    editId: "sueldo",
    valueB: "2000000",
    errorSelector: "#jubilacion-error",
    expectKeys: { rentabilidad: "5", lagunas: "10" },
  },
  {
    slug: "tarjeta-credito",
    fillA: async page => {
      await page.locator("#deuda").fill("500000");
    },
    editId: "deuda",
    valueB: "800000",
    errorSelector: "#calc-error",
  },
];

async function runConsistencyFlow(page: Page, cfg: CalcConfig): Promise<void> {
  const calculatorId = `/calculadoras/${cfg.slug}/`;
  const tag = cfg.slug.replace(/-/g, "");
  const nameA = `A-${tag}`;
  const nameB = `B-${tag}`;
  const nameC = `C-${tag}`;
  const nameD = `D-${tag}`;

  await page.goto(calculatorId);
  await page.evaluate(key => window.localStorage.removeItem(key), STORAGE_KEY);

  // Saving before any valid calculation stores nothing.
  await page.locator("#scenario-save").click();
  await expect(page.locator("#scenario-feedback")).toContainText(
    "Primero realiza"
  );
  expect(await scenariosFor(page, calculatorId)).toEqual([]);

  // Calculate with inputs A and save.
  await cfg.fillA(page);
  await calculate(page, cfg.errorSelector);
  await saveScenarioAs(page, nameA);
  const afterA = await scenariosFor(page, calculatorId);
  expect(afterA).toHaveLength(1);
  const savedA = afterA[0];
  expect(savedA.name).toBe(nameA);
  if (cfg.expectKeys) {
    for (const [key, value] of Object.entries(cfg.expectKeys)) {
      expect(savedA.inputs[key]).toBe(value);
    }
  }

  // Edit without recalculating and save: must still hold A/A.
  if (cfg.editToB) await cfg.editToB(page);
  else await page.locator(`#${cfg.editId}`).fill(cfg.valueB);
  await saveScenarioAs(page, nameB);
  const afterB = await scenariosFor(page, calculatorId);
  expect(afterB).toHaveLength(2);
  const savedB = afterB.find(s => s.name === nameB);
  expect(savedB).toBeDefined();
  expect(savedB?.inputs).toEqual(savedA.inputs);
  expect(savedB?.summary).toEqual(savedA.summary);

  // Recalculate with the edited inputs and save: must hold B/B.
  await calculate(page, cfg.errorSelector);
  await saveScenarioAs(page, nameC);
  const afterC = await scenariosFor(page, calculatorId);
  expect(afterC).toHaveLength(3);
  const savedC = afterC.find(s => s.name === nameC);
  expect(savedC).toBeDefined();
  expect(savedC?.inputs).not.toEqual(savedA.inputs);
  expect(savedC?.summary).not.toEqual(savedA.summary);
  expect(savedC?.inputs[cfg.editId]).toBe(cfg.valueB);

  // An invalid attempt invalidates saving until a new success.
  await page.locator(`#${cfg.editId}`).fill("0");
  await page.locator("#calcBtn").click();
  await expect(page.locator(cfg.errorSelector)).toBeVisible();
  await page.locator("#scenario-save").click();
  await expect(page.locator("#scenario-feedback")).toContainText(
    "Primero realiza"
  );
  expect(await scenariosFor(page, calculatorId)).toHaveLength(3);

  // Restoring A refills A and recalculates the same summary.
  await page
    .locator("#scenario-list li", { hasText: nameA })
    .getByRole("button", { name: "Cargar" })
    .click();
  await expect(page.locator("#scenario-feedback")).toContainText("cargado");
  await expect(page.locator(`#${cfg.editId}`)).toHaveValue(
    savedA.inputs[cfg.editId] ?? ""
  );
  await saveScenarioAs(page, nameD);
  const afterD = await scenariosFor(page, calculatorId);
  const savedD = afterD.find(s => s.name === nameD);
  expect(savedD).toBeDefined();
  expect(savedD?.inputs).toEqual(savedA.inputs);
  expect(savedD?.summary).toEqual(savedA.summary);
}

test.describe("Calculator scenario consistency (Plan 089)", () => {
  for (const cfg of CALCULATORS) {
    test(`${cfg.slug}: edit-without-recalc keeps A/A, recalc stores B/B`, async ({
      page,
    }) => {
      await runConsistencyFlow(page, cfg);
    });
  }

  test("sueldo-liquido bruto→líquido con otros descuentos se corresponde", async ({
    page,
  }) => {
    const calculatorId = "/calculadoras/sueldo-liquido/";
    await page.goto(calculatorId);
    await page.evaluate(
      key => window.localStorage.removeItem(key),
      STORAGE_KEY
    );

    await page.locator("#scenario-save").click();
    await expect(page.locator("#scenario-feedback")).toContainText(
      "Primero realiza"
    );
    expect(await scenariosFor(page, calculatorId)).toEqual([]);

    // Set the amount without firing input events so the 600 ms auto-calc
    // debounce never schedules a recalculation mid-flow.
    await page
      .locator("#sueldo")
      .evaluate((el, v) => {
        (el as HTMLInputElement).value = v;
      }, "1200000");
    await calculate(page, "#calc-error");
    await saveScenarioAs(page, "A-sueldobruto");
    const afterA = await scenariosFor(page, calculatorId);
    expect(afterA).toHaveLength(1);
    const savedA = afterA[0];
    expect(savedA.inputs["r:modo-calculo"]).toBe("bruto-a-liquido");

    // Editing otros descuentos fires no recalculation on its own.
    await page.locator("#advanced-toggle").click();
    await page.locator("#otros-descuentos").fill("50000");
    await saveScenarioAs(page, "B-sueldobruto");
    const afterB = await scenariosFor(page, calculatorId);
    const savedB = afterB.find(s => s.name === "B-sueldobruto");
    expect(savedB?.inputs).toEqual(savedA.inputs);
    expect(savedB?.summary).toEqual(savedA.summary);

    await calculate(page, "#calc-error");
    await saveScenarioAs(page, "C-sueldobruto");
    const afterC = await scenariosFor(page, calculatorId);
    const savedC = afterC.find(s => s.name === "C-sueldobruto");
    expect(savedC?.inputs["otros-descuentos"]).toBe("50000");
    expect(savedC?.inputs).not.toEqual(savedA.inputs);
    expect(savedC?.summary).not.toEqual(savedA.summary);

    await page
      .locator("#sueldo")
      .evaluate((el, v) => {
        (el as HTMLInputElement).value = v;
      }, "0");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#calc-error")).toBeVisible();
    await page.locator("#scenario-save").click();
    await expect(page.locator("#scenario-feedback")).toContainText(
      "Primero realiza"
    );
    expect(await scenariosFor(page, calculatorId)).toHaveLength(3);

    await page
      .locator("#scenario-list li", { hasText: "A-sueldobruto" })
      .getByRole("button", { name: "Cargar" })
      .click();
    await expect(page.locator("#scenario-feedback")).toContainText("cargado");
    await expect(page.locator("#sueldo")).toHaveValue("1200000");
    await saveScenarioAs(page, "D-sueldobruto");
    const afterD = await scenariosFor(page, calculatorId);
    const savedD = afterD.find(s => s.name === "D-sueldobruto");
    expect(savedD?.inputs).toEqual(savedA.inputs);
    expect(savedD?.summary).toEqual(savedA.summary);
  });

  test("sueldo-liquido líquido→bruto conserva radio y select", async ({
    page,
  }) => {
    const calculatorId = "/calculadoras/sueldo-liquido/";
    await page.goto(calculatorId);
    await page.evaluate(
      key => window.localStorage.removeItem(key),
      STORAGE_KEY
    );

    // The radio input itself is sr-only and covered by its label, so click
    // the label like a user would.
    await page
      .locator('label:has(input[name="modo-calculo"][value="liquido-a-bruto"])')
      .click();
    await page
      .locator("#sueldo")
      .evaluate((el, v) => {
        (el as HTMLInputElement).value = v;
      }, "900000");
    await calculate(page, "#calc-error");
    await saveScenarioAs(page, "A-sueldoinverso");
    const afterA = await scenariosFor(page, calculatorId);
    expect(afterA).toHaveLength(1);
    const savedA = afterA[0];
    expect(savedA.inputs["r:modo-calculo"]).toBe("liquido-a-bruto");
    expect(savedA.inputs["afp-tasa"]).toBeTruthy();

    const afpBefore = savedA.inputs["afp-tasa"];
    const afpAfter = await page.locator("#afp-tasa").evaluate(el => {
      const select = el as HTMLSelectElement;
      const next = select.options[1]?.value ?? select.options[0]?.value ?? "";
      select.value = next;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return next;
    });
    expect(afpAfter).not.toBe(afpBefore);

    await saveScenarioAs(page, "B-sueldoinverso");
    const afterB = await scenariosFor(page, calculatorId);
    const savedB = afterB.find(s => s.name === "B-sueldoinverso");
    expect(savedB?.inputs).toEqual(savedA.inputs);
    expect(savedB?.summary).toEqual(savedA.summary);

    await calculate(page, "#calc-error");
    await saveScenarioAs(page, "C-sueldoinverso");
    const afterC = await scenariosFor(page, calculatorId);
    const savedC = afterC.find(s => s.name === "C-sueldoinverso");
    expect(savedC?.inputs["afp-tasa"]).toBe(afpAfter);
    expect(savedC?.inputs).not.toEqual(savedA.inputs);
    expect(savedC?.summary).not.toEqual(savedA.summary);

    await page
      .locator("#scenario-list li", { hasText: "A-sueldoinverso" })
      .getByRole("button", { name: "Cargar" })
      .click();
    await expect(page.locator("#scenario-feedback")).toContainText("cargado");
    await expect(
      page.locator('input[name="modo-calculo"][value="liquido-a-bruto"]')
    ).toBeChecked();
    await expect(page.locator("#sueldo")).toHaveValue("900000");
    await saveScenarioAs(page, "D-sueldoinverso");
    const afterD = await scenariosFor(page, calculatorId);
    const savedD = afterD.find(s => s.name === "D-sueldoinverso");
    expect(savedD?.inputs).toEqual(savedA.inputs);
    expect(savedD?.summary).toEqual(savedA.summary);
  });
});
