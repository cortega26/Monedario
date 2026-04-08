import { describe, expect, it } from "vitest";
import {
  calculateIpcRentAdjustment,
  calculateUfRentAdjustment,
} from "@/application/use-cases/CalculateRentAdjustment";

describe("calculateUfRentAdjustment", () => {
  it("computes UF-indexed rent adjustment with a typical monthly UF increase", () => {
    // Rent of 10 UF; UF rose from 38,000 to 39,300 (typical 2026 variation)
    const result = calculateUfRentAdjustment({
      rentUf: 10,
      previousUfValue: 38_000,
      currentUfValue: 39_300,
    });

    expect(result.previousRentClp).toBe(380_000);
    expect(result.currentRentClp).toBe(393_000);
    expect(result.differenceClp).toBe(13_000);
    // Variation: (39300 - 38000) / 38000 × 100 ≈ 3.421%
    expect(result.ufVariationPercent).toBeCloseTo(3.421, 2);
  });

  it("returns zero difference when UF value is unchanged", () => {
    const result = calculateUfRentAdjustment({
      rentUf: 5,
      previousUfValue: 39_300,
      currentUfValue: 39_300,
    });

    expect(result.differenceClp).toBe(0);
    expect(result.ufVariationPercent).toBe(0);
  });

  it("reflects a decrease in UF value correctly", () => {
    const result = calculateUfRentAdjustment({
      rentUf: 8,
      previousUfValue: 40_000,
      currentUfValue: 39_000,
    });

    expect(result.currentRentClp).toBe(312_000);
    expect(result.previousRentClp).toBe(320_000);
    expect(result.differenceClp).toBe(-8_000);
    expect(result.ufVariationPercent).toBeCloseTo(-2.5, 4);
  });

  it("throws when rentUf is zero", () => {
    expect(() =>
      calculateUfRentAdjustment({
        rentUf: 0,
        previousUfValue: 39_000,
        currentUfValue: 40_000,
      })
    ).toThrow("rentUf");
  });
});

describe("calculateIpcRentAdjustment", () => {
  it("applies a positive IPC adjustment correctly", () => {
    // Monthly rent 500,000; IPC 4.2%
    const result = calculateIpcRentAdjustment({
      currentRentClp: 500_000,
      ipcVariationPercent: 4.2,
    });

    expect(result.appliedFactor).toBeCloseTo(1.042, 6);
    expect(result.adjustedRentClp).toBeCloseTo(521_000, 0);
    expect(result.differenceClp).toBeCloseTo(21_000, 0);
  });

  it("returns same rent when IPC is zero (zero-inflation edge case)", () => {
    const result = calculateIpcRentAdjustment({
      currentRentClp: 600_000,
      ipcVariationPercent: 0,
    });

    expect(result.appliedFactor).toBe(1);
    expect(result.adjustedRentClp).toBe(600_000);
    expect(result.differenceClp).toBe(0);
  });

  it("handles negative IPC (deflation scenario)", () => {
    const result = calculateIpcRentAdjustment({
      currentRentClp: 400_000,
      ipcVariationPercent: -2,
    });

    expect(result.appliedFactor).toBeCloseTo(0.98, 6);
    expect(result.adjustedRentClp).toBeCloseTo(392_000, 0);
    expect(result.differenceClp).toBeCloseTo(-8_000, 0);
  });

  it("throws when currentRentClp is zero", () => {
    expect(() =>
      calculateIpcRentAdjustment({
        currentRentClp: 0,
        ipcVariationPercent: 3,
      })
    ).toThrow("currentRentClp");
  });

  it("throws when ipcVariationPercent is non-finite", () => {
    expect(() =>
      calculateIpcRentAdjustment({
        currentRentClp: 500_000,
        ipcVariationPercent: NaN,
      })
    ).toThrow("ipcVariationPercent");
  });
});
