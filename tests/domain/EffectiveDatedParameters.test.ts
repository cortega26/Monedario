import { describe, expect, it } from "vitest";
import {
  isPeriodId,
  resolveEffectiveValue,
  type EffectiveDatedEntry,
} from "@/domain/economic/EffectiveDatedParameters";

const ENTRIES: EffectiveDatedEntry[] = [
  {
    indicator: "uta",
    periodId: "2025-12",
    value: 834_504,
    effectiveFrom: "2025-12-01",
    effectiveTo: "2026-01-01",
    source: "SII",
  },
  {
    indicator: "uf",
    periodId: "2025-12",
    value: 39_643.59,
    effectiveFrom: "2025-12-01",
    effectiveTo: "2026-01-01",
    source: "BCCh",
  },
  {
    indicator: "uf",
    periodId: "2026-01",
    value: 39_731.79,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-02-01",
    source: "BCCh",
  },
];

describe("isPeriodId", () => {
  it("accepts YYYY-MM and rejects other shapes", () => {
    expect(isPeriodId("2025-12")).toBe(true);
    expect(isPeriodId("2025-13")).toBe(true); // el resolver no valida mes
    expect(isPeriodId("2025-1")).toBe(false);
    expect(isPeriodId("2025-12-01")).toBe(false);
    expect(isPeriodId("")).toBe(false);
  });
});

describe("resolveEffectiveValue", () => {
  it("returns the exact period entry", () => {
    const entry = resolveEffectiveValue(ENTRIES, "uta", "2025-12");
    expect(entry?.value).toBe(834_504);
    expect(entry?.periodId).toBe("2025-12");
  });

  it("returns the entry covering the period start", () => {
    const entry = resolveEffectiveValue(ENTRIES, "uf", "2026-01");
    expect(entry?.value).toBe(39_731.79);
  });

  it("does not leak a later period into an earlier query", () => {
    expect(resolveEffectiveValue(ENTRIES, "uf", "2025-11")).toBeUndefined();
  });

  it("treats effectiveTo as exclusive", () => {
    // La UTA de dic-2025 no cubre enero 2026 (effectiveTo = 2026-01-01).
    expect(resolveEffectiveValue(ENTRIES, "uta", "2026-01")).toBeUndefined();
  });

  it("returns undefined for an unknown indicator or invalid period", () => {
    expect(resolveEffectiveValue(ENTRIES, "tmc", "2025-12")).toBeUndefined();
    expect(resolveEffectiveValue(ENTRIES, "uf", "2025/12")).toBeUndefined();
  });

  it("prefers the exact period over an open-ended older entry", () => {
    const overlapping: EffectiveDatedEntry[] = [
      {
        indicator: "uf",
        periodId: "2025-06",
        value: 100,
        effectiveFrom: "2025-06-01",
        source: "test",
      },
      {
        indicator: "uf",
        periodId: "2026-01",
        value: 200,
        effectiveFrom: "2026-01-01",
        source: "test",
      },
    ];
    expect(resolveEffectiveValue(overlapping, "uf", "2026-01")?.value).toBe(200);
  });

  it("uses the latest effectiveFrom when no exact period matches", () => {
    const openEnded: EffectiveDatedEntry[] = [
      {
        indicator: "uf",
        periodId: "2025-06",
        value: 100,
        effectiveFrom: "2025-06-01",
        source: "test",
      },
      {
        indicator: "uf",
        periodId: "2025-12",
        value: 200,
        effectiveFrom: "2025-12-01",
        source: "test",
      },
    ];
    expect(resolveEffectiveValue(openEnded, "uf", "2026-03")?.value).toBe(200);
  });
});
