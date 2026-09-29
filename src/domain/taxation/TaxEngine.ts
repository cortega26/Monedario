export interface TaxInput {
  taxableIncome: number;
  utm: number;
}

export interface TaxResult {
  taxAmount: number;
  marginalRate: number;
}

interface TaxBracket {
  upperLimit: number;
  rate: number;
  deduction: number;
}

function assertTaxInput(input: TaxInput): void {
  if (!Number.isFinite(input.taxableIncome) || input.taxableIncome < 0) {
    throw new Error("taxableIncome must be a finite number >= 0.");
  }

  if (!Number.isFinite(input.utm) || input.utm <= 0) {
    throw new Error("utm must be a finite number > 0.");
  }
}

export function buildSecondCategoryTaxBrackets(
  utm: number
): readonly TaxBracket[] {
  // Recursive formula: d_i = upperLimit_{i-1} × (rate_i − rate_{i-1}) + d_{i-1}
  // Ensures tax is continuous at every bracket boundary (matches tabla SII).
  const d2 = 13.5 * utm * 0.04; // 0.54 UTM
  const d3 = 30 * utm * (0.08 - 0.04) + d2; // 1.74 UTM
  const d4 = 50 * utm * (0.135 - 0.08) + d3; // 4.49 UTM
  const d5 = 70 * utm * (0.23 - 0.135) + d4; // 11.14 UTM
  const d6 = 90 * utm * (0.304 - 0.23) + d5; // 17.80 UTM
  const d7 = 120 * utm * (0.35 - 0.304) + d6; // 23.32 UTM
  // Tabla general (art. 43 N°1 IUSC / art. 52 IGC, SII): el 35% llega hasta
  // 310 UTM/UTA y el 40% aplica sobre ese tope con rebaja de 38,82 UTM/UTA.
  // (El tramo 150 con rebaja 30,82 es el art. 52 bis, solo para Presidente,
  // ministros, subsecretarios, senadores y diputados.)
  const d8 = 310 * utm * (0.4 - 0.35) + d7; // 38.82 UTM

  return [
    { upperLimit: 13.5 * utm, rate: 0, deduction: 0 },
    { upperLimit: 30 * utm, rate: 0.04, deduction: d2 },
    { upperLimit: 50 * utm, rate: 0.08, deduction: d3 },
    { upperLimit: 70 * utm, rate: 0.135, deduction: d4 },
    { upperLimit: 90 * utm, rate: 0.23, deduction: d5 },
    { upperLimit: 120 * utm, rate: 0.304, deduction: d6 },
    { upperLimit: 310 * utm, rate: 0.35, deduction: d7 },
    { upperLimit: Number.POSITIVE_INFINITY, rate: 0.4, deduction: d8 },
  ] as const;
}

export function calculateSecondCategoryTax(input: TaxInput): TaxResult {
  assertTaxInput(input);

  const brackets = buildSecondCategoryTaxBrackets(input.utm);
  const bracket =
    brackets.find(candidate => input.taxableIncome <= candidate.upperLimit) ??
    brackets[brackets.length - 1];

  const taxAmount = Math.max(
    0,
    input.taxableIncome * bracket.rate - bracket.deduction
  );

  return {
    taxAmount,
    marginalRate: bracket.rate,
  };
}

/**
 * IGC anual: la tabla del Impuesto Global Complementario usa la misma
 * estructura progresiva que el impuesto único mensual pero expresada en UTA
 * (Unidad Tributaria Anual). Recibe la UTA congelada del año tributario
 * (`TaxYearParameters`), nunca la UTM vigente.
 */
export function calculateAnnualIncomeTax(input: {
  taxableIncome: number;
  uta: number;
}): TaxResult {
  return calculateSecondCategoryTax({
    taxableIncome: input.taxableIncome,
    utm: input.uta,
  });
}

/**
 * art. 42 bis N°3 LIR — tasa del impuesto único por retiro APV no destinado a
 * pensión: `(ΔIGC / monto reajustado del retiro) × 1,1 + 3 pp`, donde ΔIGC es
 * la diferencia entre el IGC determinado con el retiro y sin él. Equivale a
 * la tasa marginal solo si el retiro no cruza tramos (tasa media del retiro).
 * La exención para pensionados/requisitos de edad se aplica fuera de esta
 * función.
 */
export function calculateApvWithdrawalRate(input: {
  baseIncome: number;
  withdrawal: number;
  uta: number;
}): { rate: number; igcDelta: number } {
  if (!Number.isFinite(input.withdrawal) || input.withdrawal <= 0) {
    throw new Error("withdrawal must be a finite number > 0.");
  }
  const igcWithout = calculateAnnualIncomeTax({
    taxableIncome: input.baseIncome,
    uta: input.uta,
  }).taxAmount;
  const igcWith = calculateAnnualIncomeTax({
    taxableIncome: input.baseIncome + input.withdrawal,
    uta: input.uta,
  }).taxAmount;
  const igcDelta = igcWith - igcWithout;
  const rate = (igcDelta / input.withdrawal) * 1.1 + 0.03;
  return { rate, igcDelta };
}
