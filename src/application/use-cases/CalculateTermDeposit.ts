import { PERCENT_DENOMINATOR, DAYS_PER_YEAR } from "./shared/financialConstants";

// LIR art. 59 N 4: retencion de 4% sobre intereses en el caso cubierto por la UI.
const INTEREST_WITHHOLDING_RATE = 0.04;

export interface TermDepositInput {
  amount: number;
  termDays: number;
  annualRatePercent: number;
  applyWithholding: boolean;
}

export interface TermDepositOutput {
  amount: number;
  termDays: number;
  annualRatePercent: number;
  applyWithholding: boolean;
  grossInterest: number;
  withholdingTax: number;
  netInterest: number;
  finalAmount: number;
  netEffectiveAnnualRatePercent: number;
}

function assertInput(input: TermDepositInput): void {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("amount must be a finite number greater than 0.");
  }
  if (
    !Number.isFinite(input.termDays) ||
    !Number.isInteger(input.termDays) ||
    input.termDays <= 0
  ) {
    throw new Error("termDays must be a positive integer.");
  }
  if (
    !Number.isFinite(input.annualRatePercent) ||
    input.annualRatePercent <= 0
  ) {
    throw new Error(
      "annualRatePercent must be a finite number greater than 0."
    );
  }
}

export function calculateTermDeposit(
  input: TermDepositInput
): TermDepositOutput {
  assertInput(input);

  const annualRateDecimal = input.annualRatePercent / PERCENT_DENOMINATOR;
  const grossInterest =
    input.amount * annualRateDecimal * (input.termDays / DAYS_PER_YEAR);
  const withholdingTax = input.applyWithholding
    ? grossInterest * INTEREST_WITHHOLDING_RATE
    : 0;
  const netInterest = grossInterest - withholdingTax;
  const finalAmount = input.amount + netInterest;
  const netEffectiveAnnualRatePercent =
    (netInterest / input.amount) *
    (DAYS_PER_YEAR / input.termDays) *
    PERCENT_DENOMINATOR;

  return {
    amount: input.amount,
    termDays: input.termDays,
    annualRatePercent: input.annualRatePercent,
    applyWithholding: input.applyWithholding,
    grossInterest,
    withholdingTax,
    netInterest,
    finalAmount,
    netEffectiveAnnualRatePercent,
  };
}
