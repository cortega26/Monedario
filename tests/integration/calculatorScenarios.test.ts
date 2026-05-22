import { beforeEach, describe, expect, it } from "vitest";

import {
  MAX_PER_CALCULATOR,
  deleteScenario,
  listScenarios,
  saveScenario,
  scenariosAtCapacity,
} from "@/utils/calculatorScenarios";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

function installLocalStorage(): void {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}

const CALC = "/calculadoras/sueldo-liquido/";

function sampleScenario(name: string) {
  return {
    name,
    inputs: { sueldo: "1500000" },
    summary: [{ label: "Líquido", value: "$1.200.000" }],
  };
}

describe("calculatorScenarios", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("returns an empty list for an unknown calculator", () => {
    expect(listScenarios(CALC)).toEqual([]);
  });

  it("saves a scenario and lists it newest-first", () => {
    saveScenario(CALC, sampleScenario("Primero"));
    saveScenario(CALC, sampleScenario("Segundo"));
    const list = listScenarios(CALC);
    expect(list.map(s => s.name)).toEqual(["Segundo", "Primero"]);
    expect(list[0].id).toBeTruthy();
    expect(list[0].inputs.sueldo).toBe("1500000");
  });

  it("isolates scenarios per calculator", () => {
    saveScenario(CALC, sampleScenario("A"));
    expect(listScenarios("/calculadoras/credito-consumo/")).toEqual([]);
  });

  it("drops the oldest entry once the per-calculator cap is reached", () => {
    for (let i = 1; i <= MAX_PER_CALCULATOR + 2; i += 1) {
      saveScenario(CALC, sampleScenario(`E${i}`));
    }
    const list = listScenarios(CALC);
    expect(list).toHaveLength(MAX_PER_CALCULATOR);
    // Newest kept, two oldest dropped.
    expect(list[0].name).toBe(`E${MAX_PER_CALCULATOR + 2}`);
    expect(list.some(s => s.name === "E1")).toBe(false);
    expect(list.some(s => s.name === "E2")).toBe(false);
  });

  it("reports capacity correctly", () => {
    expect(scenariosAtCapacity(CALC)).toBe(false);
    for (let i = 0; i < MAX_PER_CALCULATOR; i += 1) {
      saveScenario(CALC, sampleScenario(`E${i}`));
    }
    expect(scenariosAtCapacity(CALC)).toBe(true);
  });

  it("deletes a scenario by id", () => {
    const kept = saveScenario(CALC, sampleScenario("Kept"));
    const removed = saveScenario(CALC, sampleScenario("Removed"));
    deleteScenario(CALC, removed.id);
    const list = listScenarios(CALC);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(kept.id);
  });

  it("falls back to a default name when none is given", () => {
    const saved = saveScenario(CALC, {
      name: "   ",
      inputs: {},
      summary: [],
    });
    expect(saved.name).toBe("Escenario sin nombre");
  });
});
