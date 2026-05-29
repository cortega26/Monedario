/**
 * Saved calculator scenarios — lets a user name and store the inputs + result
 * summary of a calculation, reload it later, and compare several side by side.
 *
 * Stored in localStorage, scoped per calculator. No personal data leaves the
 * browser; this is the same privacy posture as the rest of the calculators.
 */

const STORAGE_KEY = "monedario_scenarios";
const MAX_PER_CALCULATOR = 6;

export interface ScenarioSummaryRow {
  label: string;
  value: string;
}

export interface CalculatorScenario {
  id: string;
  name: string;
  ts: number;
  inputs: Record<string, string>;
  summary: ScenarioSummaryRow[];
}

type ScenarioStore = Record<string, CalculatorScenario[]>;

function loadStore(): ScenarioStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ScenarioStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveStore(store: ScenarioStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors (private mode, quota exceeded).
  }
}

function newId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Scenarios for a calculator, newest first. */
export function listScenarios(calculatorId: string): CalculatorScenario[] {
  return loadStore()[calculatorId] ?? [];
}

/**
 * Persists a new scenario. The oldest is dropped once the per-calculator cap
 * is reached. Returns the stored scenario (with its generated id).
 */
export function saveScenario(
  calculatorId: string,
  scenario: {
    name: string;
    inputs: Record<string, string>;
    summary: ScenarioSummaryRow[];
  }
): CalculatorScenario {
  const store = loadStore();
  const entry: CalculatorScenario = {
    id: newId(),
    name: scenario.name.trim() || "Escenario sin nombre",
    ts: Date.now(),
    inputs: scenario.inputs,
    summary: scenario.summary,
  };
  const existing = store[calculatorId] ?? [];
  store[calculatorId] = [entry, ...existing].slice(0, MAX_PER_CALCULATOR);
  saveStore(store);
  return entry;
}

export function deleteScenario(calculatorId: string, id: string): void {
  const store = loadStore();
  const existing = store[calculatorId];
  if (!existing) return;
  store[calculatorId] = existing.filter(s => s.id !== id);
  saveStore(store);
}

/** True once the per-calculator cap is reached. */
export function scenariosAtCapacity(calculatorId: string): boolean {
  return listScenarios(calculatorId).length >= MAX_PER_CALCULATOR;
}

export { MAX_PER_CALCULATOR };
