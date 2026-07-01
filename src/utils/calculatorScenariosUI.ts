/**
 * Wires the static CalculatorScenarios.astro panel to the scenario store.
 *
 * Each calculator calls initScenarioPanel() from its own client script,
 * supplying three small adapters so this module stays calculator-agnostic.
 */

import {
  deleteScenario,
  listScenarios,
  saveScenario,
  scenariosAtCapacity,
  type CalculatorScenario,
  type ScenarioSummaryRow,
} from "./calculatorScenarios";

export interface ScenarioPanelOptions {
  /** Stable id for this calculator (its pathname works well). */
  calculatorId: string;
  /** Reads the current form values; null when nothing has been calculated. */
  readInputs: () => Record<string, string> | null;
  /** Writes saved values back into the form and recalculates. */
  applyInputs: (inputs: Record<string, string>) => void;
  /** Builds the result summary; null when there is no current result. */
  buildSummary: () => ScenarioSummaryRow[] | null;
}

const MAX_COMPARE_COLUMNS = 3;

function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Reads every input/select inside a container into a plain record so a
 * calculator's `readInputs` adapter is a one-liner. Radio groups are keyed
 * by `r:<name>`, checkboxes by `c:<id>`, everything else by element id.
 */
export function snapshotInputs(container: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {};
  const fields = container.querySelectorAll<
    HTMLInputElement | HTMLSelectElement
  >("input, select");
  for (const field of fields) {
    if (field instanceof HTMLInputElement && field.type === "radio") {
      if (field.checked && field.name) out[`r:${field.name}`] = field.value;
    } else if (field instanceof HTMLInputElement && field.type === "checkbox") {
      if (field.id) out[`c:${field.id}`] = field.checked ? "1" : "0";
    } else if (field.id) {
      out[field.id] = field.value;
    }
  }
  return out;
}

/** Writes a snapshot back into the form, dispatching events so listeners react. */
export function restoreInputs(
  container: HTMLElement,
  data: Record<string, string>
): void {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("r:")) {
      const radio = container.querySelector<HTMLInputElement>(
        `input[type="radio"][name="${CSS.escape(key.slice(2))}"][value="${CSS.escape(value)}"]`
      );
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else if (key.startsWith("c:")) {
      const checkbox = document.getElementById(
        key.slice(2)
      ) as HTMLInputElement | null;
      if (checkbox) {
        checkbox.checked = value === "1";
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else {
      const field = document.getElementById(key) as
        HTMLInputElement | HTMLSelectElement | null;
      if (field) {
        field.value = value;
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }
}

export function initScenarioPanel(options: ScenarioPanelOptions): void {
  const panel = el("scenario-panel");
  const saveBtn = el<HTMLButtonElement>("scenario-save");
  const nameForm = el<HTMLFormElement>("scenario-name-form");
  const nameInput = el<HTMLInputElement>("scenario-name-input");
  const nameCancel = el<HTMLButtonElement>("scenario-name-cancel");
  const feedback = el("scenario-feedback");
  const emptyMsg = el("scenario-empty");
  const list = el<HTMLUListElement>("scenario-list");
  const compareToggle = el<HTMLButtonElement>("scenario-compare-toggle");
  const compare = el("scenario-compare");

  if (
    !panel ||
    !saveBtn ||
    !nameForm ||
    !nameInput ||
    !nameCancel ||
    !feedback ||
    !emptyMsg ||
    !list ||
    !compareToggle ||
    !compare
  ) {
    return;
  }

  panel.hidden = false;

  const { calculatorId } = options;

  const showFeedback = (message: string): void => {
    feedback.textContent = message;
    feedback.classList.remove("hidden");
  };

  const renderList = (): void => {
    const scenarios = listScenarios(calculatorId);
    list.replaceChildren();

    if (scenarios.length === 0) {
      emptyMsg.classList.remove("hidden");
      list.classList.add("hidden");
      compareToggle.classList.add("hidden");
      compare.classList.add("hidden");
      compare.replaceChildren();
      return;
    }

    emptyMsg.classList.add("hidden");
    list.classList.remove("hidden");

    for (const scenario of scenarios) {
      list.appendChild(renderItem(scenario));
    }

    // Keep the comparison view in sync with the (possibly changed) list.
    if (scenarios.length < 2) {
      compareToggle.classList.add("hidden");
      compare.classList.add("hidden");
      compare.replaceChildren();
      compareToggle.textContent = "Comparar escenarios";
    } else {
      compareToggle.classList.remove("hidden");
      if (!compare.classList.contains("hidden")) renderCompare();
    }
  };

  const renderItem = (scenario: CalculatorScenario): HTMLLIElement => {
    const item = document.createElement("li");
    item.className =
      "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2";

    const info = document.createElement("div");
    info.className = "min-w-0";
    const name = document.createElement("p");
    name.className = "truncate text-sm font-semibold";
    name.textContent = scenario.name;
    const headline = document.createElement("p");
    headline.className = "text-xs text-muted";
    const firstRow = scenario.summary[0];
    const date = new Date(scenario.ts).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
    });
    headline.textContent = firstRow
      ? `${firstRow.label}: ${firstRow.value} · ${date}`
      : date;
    info.append(name, headline);

    const actions = document.createElement("div");
    actions.className = "flex shrink-0 gap-2";

    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className =
      "rounded-md border border-accent/40 px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/10";
    loadBtn.textContent = "Cargar";
    loadBtn.addEventListener("click", () => {
      options.applyInputs(scenario.inputs);
      showFeedback(`Escenario "${scenario.name}" cargado.`);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className =
      "rounded-md border border-border px-2.5 py-1 text-xs text-secondary transition-colors hover:text-foreground";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.setAttribute("aria-label", `Eliminar escenario ${scenario.name}`);
    deleteBtn.addEventListener("click", () => {
      deleteScenario(calculatorId, scenario.id);
      renderList();
      showFeedback("Escenario eliminado.");
    });

    actions.append(loadBtn, deleteBtn);
    item.append(info, actions);
    return item;
  };

  const renderCompare = (): void => {
    const scenarios = listScenarios(calculatorId).slice(0, MAX_COMPARE_COLUMNS);
    compare.replaceChildren();
    if (scenarios.length < 2) return;

    // Row labels: union of summary labels, in first-seen order.
    const labels: string[] = [];
    const seen = new Set<string>();
    for (const scenario of scenarios) {
      for (const row of scenario.summary) {
        if (!seen.has(row.label)) {
          seen.add(row.label);
          labels.push(row.label);
        }
      }
    }

    const table = document.createElement("table");
    table.className = "w-full border-collapse text-sm";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const corner = document.createElement("th");
    corner.className = "p-2 text-left text-xs font-semibold text-muted";
    corner.textContent = "Concepto";
    headRow.appendChild(corner);
    for (const scenario of scenarios) {
      const th = document.createElement("th");
      th.className =
        "border-b border-border p-2 text-left text-xs font-semibold";
      th.textContent = scenario.name;
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const label of labels) {
      const tr = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.className = "border-b border-border/60 p-2 text-secondary";
      labelCell.textContent = label;
      tr.appendChild(labelCell);
      for (const scenario of scenarios) {
        const td = document.createElement("td");
        td.className = "border-b border-border/60 p-2 font-mono font-semibold";
        const row = scenario.summary.find(r => r.label === label);
        td.textContent = row ? row.value : "—";
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    compare.appendChild(table);
  };

  const closeNameForm = (): void => {
    nameForm.classList.add("hidden");
    nameInput.value = "";
    saveBtn.classList.remove("hidden");
  };

  saveBtn.addEventListener("click", () => {
    const summary = options.buildSummary();
    if (!summary || summary.length === 0) {
      showFeedback("Primero realiza un cálculo para guardarlo.");
      return;
    }
    feedback.classList.add("hidden");
    saveBtn.classList.add("hidden");
    nameForm.classList.remove("hidden");
    nameInput.value = `Escenario ${listScenarios(calculatorId).length + 1}`;
    nameInput.focus();
    nameInput.select();
  });

  nameCancel.addEventListener("click", closeNameForm);

  nameForm.addEventListener("submit", event => {
    event.preventDefault();
    const inputs = options.readInputs();
    const summary = options.buildSummary();
    if (!inputs || !summary || summary.length === 0) {
      showFeedback("No se pudo guardar: realiza un cálculo válido primero.");
      closeNameForm();
      return;
    }
    const atCapacity = scenariosAtCapacity(calculatorId);
    saveScenario(calculatorId, { name: nameInput.value, inputs, summary });
    closeNameForm();
    renderList();
    showFeedback(
      atCapacity
        ? "Escenario guardado. Se eliminó el más antiguo (límite alcanzado)."
        : "Escenario guardado."
    );
  });

  compareToggle.addEventListener("click", () => {
    const willShow = compare.classList.contains("hidden");
    if (willShow) renderCompare();
    compare.classList.toggle("hidden", !willShow);
    compareToggle.textContent = willShow
      ? "Ocultar comparación"
      : "Comparar escenarios";
  });

  renderList();
}
