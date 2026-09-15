// @vitest-environment happy-dom
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createScenarioSaveAdapter } from "@/utils/calculatorScenarioSave";
import { listScenarios } from "@/utils/calculatorScenarios";
import {
  initScenarioPanel,
  snapshotInputs,
} from "@/utils/calculatorScenariosUI";

/**
 * Pins the 089 invariant (entries + result from the same calculation) under
 * the blocking gate through the shared `createScenarioSaveAdapter` helper.
 *
 * The harness is a miniature calculator wired exactly like the six page
 * scripts + `formController.ts`: calculate nulls the pair first, snapshots a
 * candidate, validates, and only then publishes inputs + result together.
 */

interface MiniCalc {
  formCard: HTMLElement;
  amount: HTMLInputElement;
  calcBtn: HTMLButtonElement;
  result: HTMLElement;
  saveBtn: HTMLButtonElement;
  nameForm: HTMLFormElement;
  nameInput: HTMLInputElement;
  feedback: HTMLElement;
  list: HTMLUListElement;
  getLastInputs: () => Record<string, string> | null;
  getLastResult: () => { total: number } | null;
  calculate: () => void;
}

function mountMiniCalc(): MiniCalc {
  document.body.innerHTML = `
    <div id="calculator-form-card">
      <input id="monto" type="number" value="" />
    </div>
    <button id="calcBtn" type="button">Calcular</button>
    <p id="resultado"></p>
    <section id="scenario-panel" hidden>
      <button id="scenario-save" type="button">Guardar escenario</button>
      <form id="scenario-name-form" class="hidden">
        <input id="scenario-name-input" />
        <button id="scenario-name-cancel" type="button">Cancelar</button>
      </form>
      <p id="scenario-feedback" class="hidden"></p>
      <p id="scenario-empty">Sin escenarios</p>
      <ul id="scenario-list" class="hidden"></ul>
      <button id="scenario-compare-toggle" type="button" class="hidden">
        Comparar escenarios
      </button>
      <div id="scenario-compare" class="hidden"></div>
    </section>
  `;

  const formCard = document.getElementById("calculator-form-card")!;
  const amount = document.getElementById("monto") as HTMLInputElement;
  const calcBtn = document.getElementById("calcBtn") as HTMLButtonElement;

  let lastInputs: Record<string, string> | null = null;
  let lastResult: { total: number } | null = null;

  const calculate = (): void => {
    lastInputs = null;
    const candidate = snapshotInputs(formCard);
    const value = parseFloat(amount.value) || 0;
    if (value <= 0) return;
    lastInputs = candidate;
    lastResult = { total: value * 2 };
    document.getElementById("resultado")!.textContent = String(
      lastResult.total
    );
  };
  calcBtn.addEventListener("click", calculate);

  initScenarioPanel({
    ...createScenarioSaveAdapter({
      getLastInputs: () => lastInputs,
      getLastResult: () => lastResult,
      formCard,
    }),
    buildSummary: () => {
      if (!lastInputs || !lastResult) return null;
      return [{ label: "Total", value: String(lastResult.total) }];
    },
  });

  const byId = <T extends HTMLElement>(id: string): T =>
    document.getElementById(id) as T;
  return {
    formCard,
    amount,
    calcBtn,
    result: byId("resultado"),
    saveBtn: byId<HTMLButtonElement>("scenario-save"),
    nameForm: byId<HTMLFormElement>("scenario-name-form"),
    nameInput: byId<HTMLInputElement>("scenario-name-input"),
    feedback: byId("scenario-feedback"),
    list: byId<HTMLUListElement>("scenario-list"),
    getLastInputs: () => lastInputs,
    getLastResult: () => lastResult,
    calculate,
  };
}

function calculatorId(): string {
  return window.location.pathname;
}

function saveAs(calc: MiniCalc, name: string): void {
  calc.saveBtn.click();
  calc.nameInput.value = name;
  calc.nameForm.dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
}

function clickLoadFirst(calc: MiniCalc): void {
  const loadBtn = calc.list.querySelector("li button");
  if (!loadBtn) throw new Error("no saved scenario to load");
  (loadBtn as HTMLButtonElement).click();
}

beforeEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

describe("createScenarioSaveAdapter", () => {
  it("reads null before any calculation and uses the pathname as id", () => {
    const calc = mountMiniCalc();
    const adapter = createScenarioSaveAdapter({
      getLastInputs: calc.getLastInputs,
      getLastResult: calc.getLastResult,
      formCard: calc.formCard,
    });
    expect(adapter.calculatorId).toBe(window.location.pathname);
    expect(adapter.readInputs()).toBeNull();
  });

  it("returns a defensive copy so callers cannot mutate the live pair", () => {
    const calc = mountMiniCalc();
    calc.amount.value = "1000";
    calc.calcBtn.click();
    const adapter = createScenarioSaveAdapter({
      getLastInputs: calc.getLastInputs,
      getLastResult: calc.getLastResult,
      formCard: calc.formCard,
    });
    const first = adapter.readInputs();
    expect(first).toEqual({ monto: "1000" });
    first!.monto = "9999";
    expect(adapter.readInputs()).toEqual({ monto: "1000" });
  });

  it("honours a custom recalculate button id", () => {
    mountMiniCalc();
    const alt = document.createElement("button");
    alt.id = "altCalc";
    alt.type = "button";
    let clicks = 0;
    alt.addEventListener("click", () => (clicks += 1));
    document.body.appendChild(alt);
    const adapter = createScenarioSaveAdapter({
      getLastInputs: () => null,
      getLastResult: () => null,
      formCard: document.getElementById("calculator-form-card")!,
      calcBtnId: "altCalc",
    });
    adapter.applyInputs({ monto: "1000" });
    expect(clicks).toBe(1);
    expect(
      (document.getElementById("monto") as HTMLInputElement).value
    ).toBe("1000");
  });
});

describe("scenario adapter unification pin (plan 107 step 1)", () => {
  // The seven call sites unified by plan 108. If a new calculator is added,
  // extend this list — and wire it through the same helper.
  const CALL_SITES = [
    "src/pages/calculadoras/credito-consumo.astro",
    "src/pages/calculadoras/deposito-a-plazo.astro",
    "src/pages/calculadoras/dividendo-hipotecario.astro",
    "src/pages/calculadoras/interes-compuesto.astro",
    "src/pages/calculadoras/simulador-jubilacion.astro",
    "src/pages/calculadoras/tarjeta-credito.astro",
    "src/utils/sueldo-liquido/formController.ts",
  ];

  const read = (rel: string): string =>
    readFileSync(path.resolve(rel), "utf8");

  it("all seven call sites import the single shared helper", () => {
    for (const rel of CALL_SITES) {
      const source = read(rel);
      expect(
        source.includes("createScenarioSaveAdapter"),
        `${rel} must use createScenarioSaveAdapter`
      ).toBe(true);
    }
  });

  it("no calculator page or formController calls restoreInputs directly", () => {
    const pagesDir = path.resolve("src/pages/calculadoras");
    const astroFiles = readdirSync(pagesDir)
      .filter(f => f.endsWith(".astro"))
      .map(f => path.join(pagesDir, f));
    const checked = [
      ...astroFiles,
      path.resolve("src/utils/sueldo-liquido/formController.ts"),
    ];
    for (const file of checked) {
      const source = readFileSync(file, "utf8");
      expect(
        source.includes("restoreInputs"),
        `${file} must not call restoreInputs directly`
      ).toBe(false);
    }
    // The helper itself remains the single owner of restoreInputs.
    expect(read("src/utils/calculatorScenarioSave.ts")).toContain(
      "restoreInputs"
    );
  });

  it("no second adapter wrapper exists alongside the shared helper", () => {
    // Pin on the call/definition form (`name(`/ `name<`), not a bare mention:
    // the helper's own doc comment references the rejected wrapper name.
    for (const rel of CALL_SITES) {
      expect(read(rel)).not.toContain("makeStandardScenarioAdapter(");
      expect(read(rel)).not.toContain("makeStandardScenarioAdapter<");
    }
    const helper = read("src/utils/calculatorScenarioSave.ts");
    expect(helper).not.toContain("makeStandardScenarioAdapter(");
    expect(helper).not.toContain("makeStandardScenarioAdapter<");
  });

  it("buildSummary stays per-page at every call site", () => {
    for (const rel of CALL_SITES) {
      expect(
        read(rel).includes("buildSummary"),
        `${rel} must keep its per-page buildSummary`
      ).toBe(true);
    }
  });
});

describe("scenario-save temporal coherence (089 invariant)", () => {
  it("calculate→edit→save persists the calculating pair, not the edits", () => {
    const calc = mountMiniCalc();
    calc.amount.value = "1000";
    calc.calcBtn.click();
    expect(calc.result.textContent).toBe("2000");

    // Edit after calculating, without recalculating.
    calc.amount.value = "5000";
    saveAs(calc, "Base");

    const saved = listScenarios(calculatorId());
    expect(saved).toHaveLength(1);
    expect(saved[0].inputs).toEqual({ monto: "1000" });
    expect(saved[0].summary).toEqual([{ label: "Total", value: "2000" }]);
  });

  it("an invalid later attempt does not corrupt the saved snapshot", () => {
    const calc = mountMiniCalc();
    calc.amount.value = "1000";
    calc.calcBtn.click();
    saveAs(calc, "Base");
    expect(listScenarios(calculatorId())).toHaveLength(1);

    // Invalid attempt: the pair is nulled, the store must stay intact.
    calc.amount.value = "";
    calc.calcBtn.click();
    expect(calc.getLastInputs()).toBeNull();

    calc.saveBtn.click();
    expect(calc.feedback.textContent).toMatch(/Primero realiza un cálculo/);
    // Even a forced submit cannot persist without a valid pair.
    calc.nameInput.value = "Corrupt";
    calc.nameForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    const saved = listScenarios(calculatorId());
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Base");
    expect(saved[0].inputs).toEqual({ monto: "1000" });
    expect(saved[0].summary).toEqual([{ label: "Total", value: "2000" }]);
  });

  it("restore→recalculate reproduces the saved result", () => {
    const calc = mountMiniCalc();
    calc.amount.value = "1000";
    calc.calcBtn.click();
    saveAs(calc, "Base");

    // Diverge, then load the saved scenario: inputs restore + recalc runs.
    calc.amount.value = "7000";
    calc.calcBtn.click();
    expect(calc.result.textContent).toBe("14000");

    clickLoadFirst(calc);
    expect(calc.amount.value).toBe("1000");
    expect(calc.result.textContent).toBe("2000");
    expect(calc.getLastResult()).toEqual({ total: 2000 });
  });
});
