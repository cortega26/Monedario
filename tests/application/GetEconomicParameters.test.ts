import { describe, expect, it, beforeEach } from "vitest";
import { getEconomicParameters } from "@/application/use-cases/GetEconomicParameters";
import { __resetEconomicParameterProviderForTests } from "@/infrastructure/economic/EconomicParameterProvider";

describe("GetEconomicParameters use case", () => {
  beforeEach(() => {
    __resetEconomicParameterProviderForTests();
  });

  it("returns parameters, telemetryFlag, and fallbackReason", async () => {
    const result = await getEconomicParameters();

    expect(result).toHaveProperty("parameters");
    expect(result).toHaveProperty("telemetryFlag");
    expect(result.parameters).toBeDefined();
    expect(typeof result.parameters).toBe("object");
  });

  it("returns parameters with UF > 0", async () => {
    const result = await getEconomicParameters();

    expect(result.parameters.uf).toBeGreaterThan(0);
  });

  it("returns parameters with UTM > 0", async () => {
    const result = await getEconomicParameters();

    expect(result.parameters.utm).toBeGreaterThan(0);
  });

  it("returns a valid telemetryFlag (snapshot, live, or fallback)", async () => {
    const result = await getEconomicParameters();

    const validFlags = [
      "economic_parameters_snapshot",
      "economic_parameters_live",
      "economic_parameters_fallback",
    ] as const;
    expect(validFlags).toContain(result.telemetryFlag);
  });

  it("memoizes the bundle across calls (same source)", async () => {
    const first = await getEconomicParameters();
    const second = await getEconomicParameters();

    expect(second.telemetryFlag).toBe(first.telemetryFlag);
    expect(second.parameters.uf).toBe(first.parameters.uf);
  });

  it("fallbackReason is a string when present or undefined when not", async () => {
    const result = await getEconomicParameters();

    if (result.fallbackReason !== undefined) {
      expect(typeof result.fallbackReason).toBe("string");
      expect(result.fallbackReason.trim().length).toBeGreaterThan(0);
    }
  });
});
