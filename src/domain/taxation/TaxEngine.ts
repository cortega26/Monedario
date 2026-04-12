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
  const d8 = 150 * utm * (0.4 - 0.35) + d7; // 30.82 UTM

  return [
    { upperLimit: 13.5 * utm, rate: 0, deduction: 0 },
    { upperLimit: 30 * utm, rate: 0.04, deduction: d2 },
    { upperLimit: 50 * utm, rate: 0.08, deduction: d3 },
    { upperLimit: 70 * utm, rate: 0.135, deduction: d4 },
    { upperLimit: 90 * utm, rate: 0.23, deduction: d5 },
    { upperLimit: 120 * utm, rate: 0.304, deduction: d6 },
    { upperLimit: 150 * utm, rate: 0.35, deduction: d7 },
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
