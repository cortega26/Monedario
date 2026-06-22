import { describe, expect, it } from "vitest";
import {
  calculateInflationAdjustment,
} from "@/application/use-cases/CalculateInflationAdjustment";
import { inflacionWorkedExample } from "@/application/use-cases/CalculateInflationAdjustment.methodology";

const SERIE_3: Parameters<typeof calculateInflationAdjustment>[0]["serie"] = [
  { fecha: "2022-01-01", valor: 1.3 },
  { fecha: "2022-02-01", valor: 1.0 },
  { fecha: "2022-03-01", valor: 1.9 },
];

describe("calculateInflationAdjustment — cálculo básico", () => {
  it("encadena 3 variaciones correctamente", () => {
    const result = calculateInflationAdjustment({
      monto: 100_000,
      fromYear: 2022,
      fromMonth: 1,
      serie: SERIE_3,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const expectedFactor = 1.013 * 1.01 * 1.019;
    expect(result.factorAcumulado).toBeCloseTo(expectedFactor, 6);
    expect(result.montoActualizado).toBeCloseTo(100_000 * expectedFactor, 0);
    expect(result.mesesEncadenados).toBe(3);
    expect(result.fromKey).toBe("2022-01");
    expect(result.toKey).toBe("2022-03");
  });

  it("monto desde el mes final retorna after_range", () => {
    const result = calculateInflationAdjustment({
      monto: 100_000,
      fromYear: 2022,
      fromMonth: 3,
      serie: SERIE_3,
    });
    expect(result).toMatchObject({ ok: false, reason: "after_range" });
  });

  it("monto antes del inicio retorna before_range", () => {
    const result = calculateInflationAdjustment({
      monto: 100_000,
      fromYear: 2021,
      fromMonth: 12,
      serie: SERIE_3,
    });
    expect(result).toMatchObject({ ok: false, reason: "before_range" });
  });

  it("monto no positivo retorna invalid_input", () => {
    const result = calculateInflationAdjustment({
      monto: 0,
      fromYear: 2022,
      fromMonth: 1,
      serie: SERIE_3,
    });
    expect(result).toMatchObject({ ok: false, reason: "invalid_input" });
  });

  it("mes fuera de rango retorna invalid_input", () => {
    const result = calculateInflationAdjustment({
      monto: 100_000,
      fromYear: 2022,
      fromMonth: 13,
      serie: SERIE_3,
    });
    expect(result).toMatchObject({ ok: false, reason: "invalid_input" });
  });
});

describe("calculateInflationAdjustment — variación negativa (deflación)", () => {
  it("maneja variaciones negativas en la serie", () => {
    const serieConDeflacion = [
      { fecha: "2020-01-01", valor: -0.5 },
      { fecha: "2020-02-01", valor: 0.3 },
    ];
    const result = calculateInflationAdjustment({
      monto: 100_000,
      fromYear: 2020,
      fromMonth: 1,
      serie: serieConDeflacion,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const expectedFactor = 0.995 * 1.003;
    expect(result.factorAcumulado).toBeCloseTo(expectedFactor, 6);
  });
});

describe("calculateInflationAdjustment — anti-drift (ejemplo de metodología)", () => {
  it("los campos base coinciden con el ejemplo publicado", () => {
    const result = calculateInflationAdjustment(inflacionWorkedExample.input);
    expect(result).toMatchObject(inflacionWorkedExample.expected);
  });
});
