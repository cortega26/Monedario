import { describe, expect, it } from "vitest";
import { calculateGratificacion } from "@/application/use-cases/CalculateGratificacion";
import {
  gratificacionWorkedExampleA,
  gratificacionWorkedExampleANoTope,
} from "@/application/use-cases/CalculateGratificacion.methodology";

const IMM = 553_553;

describe("CalculateGratificacion — Modalidad A (25% mensualizado)", () => {
  it("aplica el tope cuando el 25% supera 4,75 IMM ÷ 12", () => {
    const result = calculateGratificacion({
      modalidad: "A",
      remuneracionMensual: 900_000,
      imm: IMM,
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.modalidad !== "A") return;
    // tope mensual = round((4.75/12) × 553553) = round(219114.729) = 219115
    expect(result.topeMensual).toBe(219_115);
    expect(result.gratificacionMensual).toBe(219_115);
    expect(result.topeAplicado).toBe(true);
    // anual = 219115 × 12 = 2629380
    expect(result.gratificacionAnualEstimada).toBe(219_115 * 12);
    // tope anual = round(4.75 × 553553) = 2629376 (no exactamente × 12 por el redondeo)
    expect(result.topeAnual).toBe(Math.round(4.75 * IMM));
  });

  it("no aplica tope cuando el 25% está bajo el límite mensual", () => {
    const result = calculateGratificacion({
      modalidad: "A",
      remuneracionMensual: 600_000,
      imm: IMM,
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.modalidad !== "A") return;
    expect(result.gratificacionMensual).toBe(150_000);
    expect(result.topeAplicado).toBe(false);
  });

  it("con remuneración en el límite exacto del tope (sueldo mínimo)", () => {
    // Con IMM ($553.553): tope = 219032; 25% de 553553 = 138388 → sin tope
    const result = calculateGratificacion({
      modalidad: "A",
      remuneracionMensual: IMM,
      imm: IMM,
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.modalidad !== "A") return;
    expect(result.topeAplicado).toBe(false);
    expect(result.gratificacionMensual).toBe(Math.round(IMM * 0.25));
  });
});

describe("CalculateGratificacion — Modalidad B (% utilidades)", () => {
  it("calcula la proporción sobre las utilidades con tope 4,75 IMM", () => {
    // Empresa con $200M de utilidades, nómina total $100M, trabajador $5M
    const result = calculateGratificacion({
      modalidad: "B",
      utilidadesLiquidasEjercicio: 200_000_000,
      remuneracionAnualTrabajador: 5_000_000,
      remuneracionAnualEmpresa: 100_000_000,
      imm: IMM,
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.modalidad !== "B") return;
    // base = 30% × 200M = 60M
    expect(result.baseCalculo).toBe(60_000_000);
    // bruta = 60M × (5M/100M) = 3M
    expect(result.gratificacionBruta).toBe(3_000_000);
    // tope = 4.75 × IMM ≈ 2629377 → tope aplicado
    expect(result.topeAplicado).toBe(true);
    expect(result.gratificacionAnual).toBe(Math.round(4.75 * IMM));
  });

  it("sin tope cuando la proporcional está por debajo de 4,75 IMM", () => {
    // Empresa con $10M utilidades, nómina total $50M, trabajador $1M → bruta=$60.000
    const result = calculateGratificacion({
      modalidad: "B",
      utilidadesLiquidasEjercicio: 10_000_000,
      remuneracionAnualTrabajador: 1_000_000,
      remuneracionAnualEmpresa: 50_000_000,
      imm: IMM,
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.modalidad !== "B") return;
    expect(result.gratificacionBruta).toBe(60_000);
    expect(result.topeAplicado).toBe(false);
    expect(result.gratificacionAnual).toBe(60_000);
  });
});

describe("CalculateGratificacion — validaciones de entrada", () => {
  it("retorna invalid_input para remuneración cero", () => {
    expect(
      calculateGratificacion({ modalidad: "A", remuneracionMensual: 0, imm: IMM })
    ).toMatchObject({ ok: false, reason: "invalid_input" });
  });

  it("retorna invalid_input para IMM cero", () => {
    expect(
      calculateGratificacion({ modalidad: "A", remuneracionMensual: 600_000, imm: 0 })
    ).toMatchObject({ ok: false, reason: "invalid_input" });
  });
});

describe("CalculateGratificacion — anti-drift (ejemplos de metodología)", () => {
  it("ejemplo A con tope coincide con el publicado", () => {
    expect(
      calculateGratificacion(gratificacionWorkedExampleA.input)
    ).toMatchObject(gratificacionWorkedExampleA.expected);
  });

  it("ejemplo A sin tope coincide con el publicado", () => {
    expect(
      calculateGratificacion(gratificacionWorkedExampleANoTope.input)
    ).toMatchObject(gratificacionWorkedExampleANoTope.expected);
  });
});
