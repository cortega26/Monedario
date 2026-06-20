import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { ApvComparisonInput } from "./CalculateApvComparison";

/**
 * Ejemplo resuelto del comparador de APV, atado a `calculateApvComparison`.
 * Usa parámetros económicos de referencia explícitos (UF/UTM ilustrativos); la
 * calculadora en producción aplica los valores vigentes del mes. El test
 * verifica que la bonificación documentada siga coincidiendo con la función
 * real (anti-drift). El ejemplo se centra en el Régimen A (bono estatal).
 */
export const apvWorkedExample: {
  input: ApvComparisonInput;
  expected: {
    regimeA: { annualBonus: number; monthlyBenefit: number };
  };
  example: WorkedExample;
} = {
  input: {
    grossSalary: 1_500_000,
    afpRatePercent: 11.44,
    healthSystem: "fonasa",
    contractType: "indefinido",
    monthlyApvContribution: 50_000,
    economicParameters: {
      uf: 40_000,
      utm: 68_923,
      afcTopes: { monthlyTaxableCapUf: 135.2 },
      previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 87.8 },
    },
  },
  expected: {
    regimeA: { annualBonus: 90_000, monthlyBenefit: 7_500 },
  },
  example: {
    scenario:
      "Un trabajador aporta $50.000 al mes en APV bajo el Régimen A (con bonificación estatal).",
    steps: [
      {
        label: "Calcula el ahorro anual en APV.",
        expression: "$50.000 × 12",
        result: "$600.000",
      },
      {
        label:
          "Aplica la bonificación estatal del 15% (con tope anual de 6 UTM, que no se alcanza aquí).",
        expression: "$600.000 × 15%",
        result: "$90.000",
      },
      {
        label: "Expresa el beneficio como aporte mensual equivalente.",
        expression: "$90.000 ÷ 12",
        result: "$7.500/mes",
      },
    ],
    conclusion:
      "El Estado aporta $90.000 al año (≈ $7.500 al mes) sobre tu ahorro. El Régimen A conviene en rentas más bajas; el Régimen B rebaja impuestos y conviene en rentas más altas — la calculadora compara ambos.",
  },
};
