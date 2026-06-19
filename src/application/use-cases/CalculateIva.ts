/** Tasa de IVA vigente en Chile, fijada por ley (19%). Constante gestionada. */
const IVA_RATE_PERCENT = 19;

export interface CalculateIvaInput {
  /** Monto en pesos chilenos enteros (neto o bruto según `direction`). */
  amount: number;
  /** "neto-a-bruto": el monto ingresado es neto (sin IVA).
   *  "bruto-a-neto": el monto ingresado es bruto (con IVA incluido). */
  direction: "neto-a-bruto" | "bruto-a-neto";
}

export interface CalculateIvaOutput {
  /** Monto neto (sin IVA), en pesos enteros. */
  neto: number;
  /** Monto de IVA, en pesos enteros. */
  iva: number;
  /** Monto bruto (con IVA), en pesos enteros. */
  bruto: number;
  /** Tasa de IVA aplicada (siempre 19 para Chile). */
  ivaRatePercent: number;
}

function assertInput(input: CalculateIvaInput): void {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("amount must be a finite number greater than 0.");
  }
}

/**
 * Calcula IVA chileno (19%) en ambas direcciones.
 *
 * - neto → bruto: iva = round(neto × 0.19); bruto = neto + iva
 * - bruto → neto: neto = round(bruto / 1.19); iva = bruto - neto
 *
 * El CLP no tiene decimales; todos los montos se redondean a pesos enteros.
 */
export function calculateIva(input: CalculateIvaInput): CalculateIvaOutput {
  assertInput(input);

  const rate = IVA_RATE_PERCENT / 100;

  let neto: number;
  let iva: number;
  let bruto: number;

  if (input.direction === "neto-a-bruto") {
    neto = Math.round(input.amount);
    iva = Math.round(neto * rate);
    bruto = neto + iva;
  } else {
    bruto = Math.round(input.amount);
    neto = Math.round(bruto / (1 + rate));
    iva = bruto - neto;
  }

  return { neto, iva, bruto, ivaRatePercent: IVA_RATE_PERCENT };
}
