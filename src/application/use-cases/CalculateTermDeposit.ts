import {
  PERCENT_DENOMINATOR,
  DAYS_PER_YEAR,
} from "./shared/financialConstants";

/**
 * Interés de un depósito a plazo a interés simple proporcional al plazo.
 *
 * Los intereses de un DAP de una persona natural residente NO están sujetos a
 * retención del banco: tributan en el Impuesto Global Complementario anual
 * (SII, FAQ 001.140.2738, actualizada 2026-03-31). La retención del 4% del
 * art. 59 inciso 2° N°1 letras a) y g) LIR es Impuesto Adicional para personas sin domicilio ni
 * residencia en Chile y no aplica a este caso.
 */
export interface TermDepositInput {
  amount: number;
  termDays: number;
  annualRatePercent: number;
}

export interface TermDepositOutput {
  amount: number;
  termDays: number;
  annualRatePercent: number;
  grossInterest: number;
  finalAmount: number;
  effectiveAnnualRatePercent: number;
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
  const finalAmount = input.amount + grossInterest;
  const effectiveAnnualRatePercent =
    (grossInterest / input.amount) *
    (DAYS_PER_YEAR / input.termDays) *
    PERCENT_DENOMINATOR;

  return {
    amount: input.amount,
    termDays: input.termDays,
    annualRatePercent: input.annualRatePercent,
    grossInterest,
    finalAmount,
    effectiveAnnualRatePercent,
  };
}
