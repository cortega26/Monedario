export interface InflationAdjustmentInput {
  /** Monto original en CLP */
  monto: number;
  /** Año de origen (ej. 2010) */
  fromYear: number;
  /** Mes de origen 1–12 (ej. 1 = enero) */
  fromMonth: number;
  /**
   * Serie IPC mensual: array de { fecha: "YYYY-MM-DD", valor: number (variación % del período) }
   * ordenado de más antiguo a más reciente.
   */
  serie: ReadonlyArray<{ fecha: string; valor: number }>;
}

export interface InflationAdjustmentOutput {
  montoOriginal: number;
  montoActualizado: number;
  factorAcumulado: number;
  /** Porcentaje acumulado de inflación (ej. 152.3 = +152.3%) */
  pctAcumulado: number;
  fromKey: string; // "YYYY-MM"
  toKey: string; // "YYYY-MM" de la última entrada
  mesesEncadenados: number;
}

export type InflationAdjustmentResult =
  | ({ ok: true } & InflationAdjustmentOutput)
  | {
      ok: false;
      reason: "before_range" | "after_range" | "invalid_input" | "no_data";
    };

/**
 * Actualiza un monto a pesos de hoy encadenando las variaciones mensuales del IPC.
 *
 * Convención de empalme: se incluyen las variaciones de todos los meses desde
 * fromYear/fromMonth hasta la última entrada disponible (inclusive en ambos extremos).
 * Cada variación mensual `r` representa el cambio de precios durante ese mes;
 * incluir el mes de origen equivale a traer el monto al final de ese mes y luego
 * seguir encadenando. Ver nota metodológica de la calculadora.
 */
export function calculateInflationAdjustment(
  input: InflationAdjustmentInput
): InflationAdjustmentResult {
  const { monto, fromYear, fromMonth, serie } = input;

  if (!Number.isFinite(monto) || monto <= 0)
    return { ok: false, reason: "invalid_input" };
  if (!Number.isInteger(fromYear) || !Number.isInteger(fromMonth))
    return { ok: false, reason: "invalid_input" };
  if (fromMonth < 1 || fromMonth > 12)
    return { ok: false, reason: "invalid_input" };
  if (serie.length === 0) return { ok: false, reason: "no_data" };

  const fromKey = `${fromYear}-${String(fromMonth).padStart(2, "0")}`;
  const firstKey = serie[0].fecha.slice(0, 7);
  const lastKey = serie[serie.length - 1].fecha.slice(0, 7);

  if (fromKey < firstKey) return { ok: false, reason: "before_range" };
  if (fromKey >= lastKey) return { ok: false, reason: "after_range" };

  let factor = 1;
  let count = 0;

  for (const entry of serie) {
    const key = entry.fecha.slice(0, 7);
    if (key < fromKey) continue;
    factor *= 1 + entry.valor / 100;
    count++;
  }

  const montoActualizado = monto * factor;
  const pctAcumulado = (factor - 1) * 100;

  return {
    ok: true,
    montoOriginal: monto,
    montoActualizado,
    factorAcumulado: factor,
    pctAcumulado,
    fromKey,
    toKey: lastKey,
    mesesEncadenados: count,
  };
}
