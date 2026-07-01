/**
 * Calculadora de gratificación legal (Código del Trabajo art. 47–50).
 *
 * Modalidad A — Art. 50: 25% de la remuneración mensual, tope 4,75 IMM ÷ 12 al mes.
 * Modalidad B — Art. 47: porcentaje de las utilidades líquidas del empleador,
 *   tope 4,75 IMM anual por trabajador.
 *
 * El IMM es una constante legal gestionada (no la entrega mindicador.cl).
 * Fuente de referencia: DEFAULT_IMM en @/domain/economic/immConstants.
 */

export interface GratificacionInputModalidadA {
  modalidad: "A";
  /** Remuneración mensual imponible en CLP */
  remuneracionMensual: number;
  /** IMM vigente en CLP (inyectado para evitar acoplamiento directo) */
  imm: number;
}

export interface GratificacionInputModalidadB {
  modalidad: "B";
  /** Utilidades líquidas del empleador del ejercicio en CLP */
  utilidadesLiquidasEjercicio: number;
  /** Remuneraciones anuales imponibles del trabajador en CLP */
  remuneracionAnualTrabajador: number;
  /** Remuneraciones imponibles anuales totales de la empresa en CLP */
  remuneracionAnualEmpresa: number;
  /** IMM vigente en CLP */
  imm: number;
}

export type GratificacionInput =
  GratificacionInputModalidadA | GratificacionInputModalidadB;

export interface GratificacionResultModalidadA {
  modalidad: "A";
  remuneracionMensual: number;
  gratificacionMensual: number;
  topeAplicado: boolean;
  topeMensual: number;
  gratificacionAnualEstimada: number;
  topeAnual: number;
  imm: number;
}

export interface GratificacionResultModalidadB {
  modalidad: "B";
  baseCalculo: number; // 25% de utilidades como base de reparto
  gratificacionBruta: number; // proporcional al trabajador antes de tope
  topeAplicado: boolean;
  topeAnual: number;
  gratificacionAnual: number;
  imm: number;
}

export type GratificacionResult =
  | ({ ok: true } & GratificacionResultModalidadA)
  | ({ ok: true } & GratificacionResultModalidadB)
  | { ok: false; reason: "invalid_input" };

function assertPositive(n: number, label: string): void {
  if (!Number.isFinite(n) || n <= 0)
    throw new Error(`${label} debe ser mayor que cero.`);
}

export function calculateGratificacion(
  input: GratificacionInput
): GratificacionResult {
  try {
    if (input.modalidad === "A") {
      assertPositive(input.remuneracionMensual, "remuneracionMensual");
      assertPositive(input.imm, "imm");

      const topeMensual = Math.round((4.75 / 12) * input.imm);
      const gratuBruta = Math.round(input.remuneracionMensual * 0.25);
      const gratificacionMensual = Math.min(gratuBruta, topeMensual);
      const topeAnual = Math.round(4.75 * input.imm);

      return {
        ok: true,
        modalidad: "A",
        remuneracionMensual: input.remuneracionMensual,
        gratificacionMensual,
        topeAplicado: gratuBruta > topeMensual,
        topeMensual,
        gratificacionAnualEstimada: gratificacionMensual * 12,
        topeAnual,
        imm: input.imm,
      };
    }

    // Modalidad B
    assertPositive(
      input.utilidadesLiquidasEjercicio,
      "utilidadesLiquidasEjercicio"
    );
    assertPositive(
      input.remuneracionAnualTrabajador,
      "remuneracionAnualTrabajador"
    );
    assertPositive(input.remuneracionAnualEmpresa, "remuneracionAnualEmpresa");
    assertPositive(input.imm, "imm");

    // El empleador debe destinar el 30% de las utilidades; de ese 30%, el trabajador
    // recibe proporcional a sus remuneraciones (art. 47 CT).
    const baseCalculo = Math.round(input.utilidadesLiquidasEjercicio * 0.3);
    const proporcion =
      input.remuneracionAnualTrabajador / input.remuneracionAnualEmpresa;
    const gratificacionBruta = Math.round(baseCalculo * proporcion);
    const topeAnual = Math.round(4.75 * input.imm);
    const gratificacionAnual = Math.min(gratificacionBruta, topeAnual);

    return {
      ok: true,
      modalidad: "B",
      baseCalculo,
      gratificacionBruta,
      topeAplicado: gratificacionBruta > topeAnual,
      topeAnual,
      gratificacionAnual,
      imm: input.imm,
    };
  } catch {
    return { ok: false, reason: "invalid_input" };
  }
}
