import { describe, expect, it } from "vitest";
import { getIndicadoresWith } from "@/utils/indicadores";
import type { EconomicParameters } from "@/domain/economic/EconomicParameters";

function loaderWith(
  overrides: Partial<EconomicParameters> = {}
): () => Promise<{
  parameters: EconomicParameters;
  telemetryFlag: "none";
}> {
  return async () => ({
    parameters: {
      uf: 40357.67,
      utm: 70588,
      dolar: 891,
      ipc: -0.2,
      tmc: 3.49,
      imm: 553553,
      immEffectiveDate: "2026-05-01",
      afcTopes: { monthlyTaxableCapUf: 135.2 },
      previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      lastUpdated: "2026-08-10",
      source: "primary",
      indicatorUpdatedAt: {
        uf: "2026-08-10",
        utm: "2026-08-01",
        uta: "2025-12-01",
      },
      ...overrides,
    },
    telemetryFlag: "none",
  });
}

describe("getIndicadoresWith", () => {
  it("propaga dolar y su prev cuando existen", async () => {
    const result = await getIndicadoresWith(
      loaderWith({
        prev: {
          uf: { valor: 40000, fecha: "2026-08-09" },
          dolar: { valor: 880, fecha: "2026-08-09" },
        },
      })
    );
    expect(result.dolar).toBe(891);
    expect(result.fechas.dolar).toBe("2026-08-10");
    expect(result.prev?.dolar).toEqual({ valor: 880, fecha: "2026-08-09" });
    expect(result.prev?.uf).toEqual({ valor: 40000, fecha: "2026-08-09" });
  });

  it("deja dolar en undefined cuando el parámetro no existe (los consumidores usan !== undefined)", async () => {
    const result = await getIndicadoresWith(
      loaderWith({ dolar: undefined, prev: {} })
    );
    // Nota (plan 071): el literal del objeto crea la key con valor undefined
    // (shape real); `fechas.dolar` sí se omite vía spread. El endpoint y los
    // componentes guardan con `!== undefined`, así que ambos shapes son seguros.
    expect(result.dolar).toBeUndefined();
    expect(result.fechas).not.toHaveProperty("dolar");
  });

  it("no crashea ni inventa prev cuando está ausente", async () => {
    const result = await getIndicadoresWith(loaderWith());
    expect(result).not.toHaveProperty("prev");
    expect(result.source).toBe("primary");
    expect(result.telemetryFlag).toBe("none");
  });
});
