import type {
  GratificacionInput,
  GratificacionResult,
} from "./CalculateGratificacion";

/**
 * Ejemplo Modalidad A:
 * Remuneración $900.000, IMM $553.553
 * Tope mensual = round((4.75/12) × 553.553) = round(219.114,729) = 219.115
 * 25% de $900.000 = $225.000 > tope → gratificación = $219.115 (tope aplicado)
 */
export const gratificacionWorkedExampleA: {
  input: GratificacionInput;
  expected: Partial<GratificacionResult>;
} = {
  input: {
    modalidad: "A",
    remuneracionMensual: 900_000,
    imm: 553_553,
  },
  expected: {
    ok: true,
    modalidad: "A",
    gratificacionMensual: 219_115,
    topeAplicado: true,
  },
};

/**
 * Ejemplo Modalidad A (sin tope):
 * Remuneración $600.000, 25% = $150.000 < tope $219.032 → gratificación = $150.000
 */
export const gratificacionWorkedExampleANoTope: {
  input: GratificacionInput;
  expected: Partial<GratificacionResult>;
} = {
  input: {
    modalidad: "A",
    remuneracionMensual: 600_000,
    imm: 553_553,
  },
  expected: {
    ok: true,
    modalidad: "A",
    gratificacionMensual: 150_000,
    topeAplicado: false,
  },
};
