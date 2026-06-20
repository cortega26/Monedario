import type { AfpCommission } from "@/config/afpCommissions";
import type { WorkedExample } from "@/domain/methodology/workedExample";

/**
 * Ejemplo resuelto del comparador de comisiones AFP, atado a
 * `compareAfpCommissions`. Usa un set de comisiones de referencia (los extremos
 * vigentes: Uno 0,46% y ProVida 1,45%); el test verifica que el ahorro
 * documentado siga coincidiendo con la función real (anti-drift).
 */
export const afpWorkedExample: {
  input: { taxableSalary: number; commissions: AfpCommission[] };
  expected: { maxExtraMonthlyCost: number; maxExtraAnnualCost: number };
  example: WorkedExample;
} = {
  input: {
    taxableSalary: 1_200_000,
    commissions: [
      { name: "Uno", commission: 0.46, total: 10.46 },
      { name: "ProVida", commission: 1.45, total: 11.45 },
    ],
  },
  expected: { maxExtraMonthlyCost: 11_880, maxExtraAnnualCost: 142_560 },
  example: {
    scenario:
      "Tienes un sueldo imponible de $1.200.000 y comparas la AFP más barata (0,46%) con la más cara (1,45%).",
    steps: [
      {
        label: "Comisión mensual de la AFP más cara (1,45%).",
        expression: "$1.200.000 × 1,45%",
        result: "$17.400",
      },
      {
        label: "Comisión mensual de la AFP más barata (0,46%).",
        expression: "$1.200.000 × 0,46%",
        result: "$5.520",
      },
      {
        label: "Diferencia mensual.",
        expression: "$17.400 − $5.520",
        result: "$11.880",
      },
      {
        label: "Diferencia en un año.",
        expression: "$11.880 × 12",
        result: "$142.560",
      },
    ],
    conclusion:
      "Elegir la AFP más barata ahorra $11.880 al mes — $142.560 al año — sin afectar el 10% que va íntegro a tu fondo personal.",
  },
};
