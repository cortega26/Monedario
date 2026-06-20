import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { NetSalaryInput } from "./CalculateNetSalary";

/**
 * Ejemplo resuelto de la calculadora de sueldo líquido, atado a
 * `calculateNetSalary`. Usa parámetros económicos de referencia explícitos
 * (UF/UTM ilustrativos); la calculadora en producción aplica los valores
 * vigentes del mes. El test verifica que las cifras documentadas sigan
 * coincidiendo con la función real (anti-drift).
 */
export const netSalaryWorkedExample: {
  input: NetSalaryInput;
  expected: {
    netSalary: number;
    deductions: {
      afp: number;
      health: number;
      unemploymentInsurance: number;
      tax: number;
    };
  };
  example: WorkedExample;
} = {
  input: {
    grossSalary: 1_000_000,
    afpRatePercent: 11.44,
    healthSystem: "fonasa",
    contractType: "indefinido",
    economicParameters: {
      uf: 40_000,
      utm: 68_923,
      afcTopes: { monthlyTaxableCapUf: 135.2 },
      previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 87.8 },
    },
  },
  expected: {
    netSalary: 809_600,
    deductions: {
      afp: 114_400,
      health: 70_000,
      unemploymentInsurance: 6_000,
      tax: 0,
    },
  },
  example: {
    scenario:
      "Un trabajador con contrato indefinido y sueldo bruto de $1.000.000, afiliado a una AFP con tasa total de 11,44% y a Fonasa (7%).",
    steps: [
      {
        label: "Descuenta la AFP (11,44% del imponible).",
        expression: "$1.000.000 × 11,44%",
        result: "$114.400",
      },
      {
        label: "Descuenta la salud (7% en Fonasa).",
        expression: "$1.000.000 × 7%",
        result: "$70.000",
      },
      {
        label:
          "Descuenta el seguro de cesantía del trabajador (0,6% en contrato indefinido).",
        expression: "$1.000.000 × 0,6%",
        result: "$6.000",
      },
      {
        label:
          "Calcula el impuesto único: la base ($809.600) queda bajo el tramo exento, así que no paga impuesto.",
        result: "$0",
      },
      {
        label: "Resta todos los descuentos al bruto.",
        expression: "$1.000.000 − $114.400 − $70.000 − $6.000",
        result: "$809.600",
      },
    ],
    conclusion:
      "El sueldo líquido es $809.600. Con un bruto de $1.000.000 los descuentos previsionales suman $190.400 y el impuesto único es cero.",
  },
};
