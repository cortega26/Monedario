import { describe, expect, it } from "vitest";
import { calculateIva } from "@/application/use-cases/CalculateIva";

describe("calculateIva", () => {
  describe("neto-a-bruto", () => {
    it("calcula IVA y bruto para un monto neto redondo", () => {
      const result = calculateIva({ amount: 1_000_000, direction: "neto-a-bruto" });
      expect(result.neto).toBe(1_000_000);
      expect(result.iva).toBe(190_000);
      expect(result.bruto).toBe(1_190_000);
    });

    it("redondea correctamente para monto con IVA fraccionario", () => {
      // 999 × 0.19 = 189.81 → round → 190
      const result = calculateIva({ amount: 999, direction: "neto-a-bruto" });
      expect(result.iva).toBe(190);
      expect(result.bruto).toBe(1_189);
    });

    it("expone ivaRatePercent = 19", () => {
      const result = calculateIva({ amount: 50_000, direction: "neto-a-bruto" });
      expect(result.ivaRatePercent).toBe(19);
    });
  });

  describe("bruto-a-neto", () => {
    it("desglosa neto e IVA desde el bruto", () => {
      const result = calculateIva({ amount: 1_190_000, direction: "bruto-a-neto" });
      expect(result.neto).toBe(1_000_000);
      expect(result.iva).toBe(190_000);
      expect(result.bruto).toBe(1_190_000);
    });

    it("garantiza que neto + iva = bruto siempre", () => {
      const amounts = [999, 1_000, 7_777, 50_000, 1_000_000];
      for (const amount of amounts) {
        const result = calculateIva({ amount, direction: "bruto-a-neto" });
        expect(result.neto + result.iva).toBe(result.bruto);
      }
    });

    it("expone ivaRatePercent = 19", () => {
      const result = calculateIva({ amount: 1_190_000, direction: "bruto-a-neto" });
      expect(result.ivaRatePercent).toBe(19);
    });
  });

  describe("assertInput — entradas inválidas", () => {
    it("lanza para amount = 0", () => {
      expect(() => calculateIva({ amount: 0, direction: "neto-a-bruto" })).toThrow(
        "amount"
      );
    });

    it("lanza para amount negativo", () => {
      expect(() => calculateIva({ amount: -100, direction: "neto-a-bruto" })).toThrow(
        "amount"
      );
    });

    it("lanza para amount = NaN", () => {
      expect(() => calculateIva({ amount: NaN, direction: "neto-a-bruto" })).toThrow(
        "amount"
      );
    });
  });
});
