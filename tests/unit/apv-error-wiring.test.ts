import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Plan 114 paso 2 (patrón anti-refork del plan 107): pin estático del
// cableado E1–E4 en apv.astro. Si alguien mueve o duplica un emisor, este
// test lo detecta sin necesidad de navegador.
const APV_PATH = fileURLToPath(
  new URL("../../src/pages/calculadoras/apv.astro", import.meta.url)
);
const source = readFileSync(APV_PATH, "utf8");

function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe("apv error wiring (E1–E4)", () => {
  it("wires the four emit sites with exact categories", () => {
    expect(occurrences(source, 'emitApvError("validation")')).toBe(1);
    expect(occurrences(source, 'emitApvError("calculation")')).toBe(2);
    expect(occurrences(source, 'emitApvError("stale_source")')).toBe(1);
  });

  it("resets the per-attempt dedupe at the start of the click handler", () => {
    const clickStart = source.indexOf('addEventListener("click"');
    const clearError = source.indexOf("clearFormError();", clickStart);
    const reset = source.indexOf("resetApvErrorDedupe();", clickStart);
    expect(clickStart).toBeGreaterThan(-1);
    expect(clearError).toBeGreaterThan(clickStart);
    expect(reset).toBeGreaterThan(clearError);
  });

  it("never forwards error.message or values into any emit call", () => {
    const calls = source.match(/emitApvError\([^)]*\)/g) ?? [];
    expect(calls).toHaveLength(4);
    for (const call of calls) {
      expect(call).toMatch(/^emitApvError\("[a-z_]+"\)$/);
    }
    expect(source).not.toMatch(/emitApvError\([^)]*message/);
    expect(source).not.toMatch(/emitApvError\([^)]*\berror\b/);
  });

  it("reuses only the two pre-existing user-facing strings", () => {
    expect(
      occurrences(
        source,
        "No se pudieron cargar los parámetros económicos."
      )
    ).toBe(2);
    expect(
      occurrences(source, "No se pudo calcular la comparación APV.")
    ).toBe(2);
  });

  it("adds no new event names: all error telemetry flows via the helper", () => {
    expect(occurrences(source, "calculator_error")).toBe(0);
    expect(occurrences(source, "trackAnalyticsEvent(")).toBe(1);
  });
});
