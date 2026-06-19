import { describe, expect, it } from "vitest";
import {
  formatEconomicDate,
  resolveEconomicSourceLabel,
} from "@/domain/economic/economicSourcePresentation";

describe("resolveEconomicSourceLabel", () => {
  it("mapea source 'live' a 'dato en línea'", () => {
    expect(resolveEconomicSourceLabel("live")).toBe("dato en línea");
  });

  it("mapea source 'snapshot' a 'dato de referencia'", () => {
    expect(resolveEconomicSourceLabel("snapshot")).toBe("dato de referencia");
  });

  it("mapea source 'fallback' a 'fallback de emergencia'", () => {
    expect(resolveEconomicSourceLabel("fallback")).toBe(
      "fallback de emergencia"
    );
  });
});

describe("formatEconomicDate", () => {
  it("formatea una fecha ISO como fecha larga chilena estable en UTC", () => {
    const formatted = formatEconomicDate("2026-05-01");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("mayo");
  });

  it("no se desplaza por zona horaria (fija UTC)", () => {
    // 1 de enero a medianoche UTC no debe retroceder a 31 de diciembre.
    expect(formatEconomicDate("2026-01-01")).toContain("enero");
    expect(formatEconomicDate("2026-01-01")).toContain("2026");
  });
});
