import type {
  InflationAdjustmentInput,
  InflationAdjustmentResult,
} from "./CalculateInflationAdjustment";

/** Serie mínima para el ejemplo: 3 meses a partir de enero 2022 */
const seriePrueba: InflationAdjustmentInput["serie"] = [
  { fecha: "2022-01-01", valor: 1.3 },
  { fecha: "2022-02-01", valor: 1.0 },
  { fecha: "2022-03-01", valor: 1.9 },
];

/**
 * Ejemplo: $100.000 de enero 2022 actualizados a marzo 2022.
 * Factor = (1+0.013) × (1+0.010) × (1+0.019) = 1.043366...
 * Monto actualizado ≈ $104.337
 */
export const inflacionWorkedExample: {
  input: InflationAdjustmentInput;
  expected: Partial<InflationAdjustmentResult>;
} = {
  input: {
    monto: 100_000,
    fromYear: 2022,
    fromMonth: 1,
    serie: seriePrueba,
  },
  expected: {
    ok: true,
    fromKey: "2022-01",
    toKey: "2022-03",
    mesesEncadenados: 3,
  },
};
