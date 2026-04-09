import { calculateAnnuityPayment } from "@/application/use-cases/shared/creditAmortization";

export interface MortgageInput {
  /** Property value (in UF or pesos — see `currency`) */
  propertyValue: number;
  /** Currency of the input property value and loan */
  currency: "uf" | "pesos";
  /** Down payment as a percentage of property value (e.g. 20 = 20%) */
  downPaymentPercent: number;
  /** Annual interest rate as a percentage (e.g. 4.5 = 4.5% annual) */
  annualRatePercent: number;
  /** Loan term in years */
  termYears: number;
  /** Current UF value in pesos (injected from getEconomicParameters) */
  ufValuePesos: number;
  /** Optional: monthly desgravamen rate as % of outstanding balance (e.g. 0.025) */
  monthlyDesgravamenRatePercent?: number;
  /** Optional: monthly fire+earthquake insurance in UF (fixed amount) */
  monthlyFireInsuranceUF?: number;
}

export interface AmortizationRow {
  month: number;
  paymentUF: number;
  interestUF: number;
  capitalUF: number;
  desgravamenUF: number;
  fireInsuranceUF: number;
  totalMonthlyUF: number;
  balanceUF: number;
}

export interface MortgageOutput {
  loanAmountUF: number;
  loanAmountPesos: number;
  downPaymentAmountUF: number;
  downPaymentAmountPesos: number;
  monthlyRateDecimal: number;
  basePaymentUF: number;
  basePaymentPesos: number;
  /** Insurance for month 1 (desgravamen is variable, fire is fixed) */
  insuranceMonth1UF: number;
  insuranceMonth1Pesos: number;
  totalPaymentMonth1UF: number;
  totalPaymentMonth1Pesos: number;
  /** Sum of all base payments (no insurance, conservative) */
  totalPaidPesos: number;
  totalInterestPesos: number;
  amortizationSchedule: AmortizationRow[];
}

function assertFinitePositive(value: number, message: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message);
  }
}

function assertFiniteRange(
  value: number,
  min: number,
  max: number,
  message: string
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(message);
  }
}

function assertInput(input: MortgageInput): void {
  assertFinitePositive(
    input.propertyValue,
    "El valor de la propiedad debe ser mayor que cero."
  );
  assertFiniteRange(
    input.downPaymentPercent,
    5,
    99,
    "El pie debe ser entre 5% y 99% del valor de la propiedad."
  );
  assertFiniteRange(
    input.annualRatePercent,
    0.001,
    29.999,
    "La tasa de interés anual debe ser mayor que 0% y menor que 30%."
  );
  assertFiniteRange(
    input.termYears,
    5,
    30,
    "El plazo debe ser entre 5 y 30 años."
  );
  assertFinitePositive(
    input.ufValuePesos,
    "El valor de la UF debe ser mayor que cero."
  );
}

function deriveLoanInUF(
  propertyValue: number,
  currency: "uf" | "pesos",
  downPaymentPercent: number,
  ufValuePesos: number
): { loanAmountUF: number; propertyValueUF: number } {
  if (currency === "uf") {
    return {
      propertyValueUF: propertyValue,
      loanAmountUF: propertyValue * (1 - downPaymentPercent / 100),
    };
  }
  return {
    propertyValueUF: propertyValue / ufValuePesos,
    loanAmountUF:
      (propertyValue * (1 - downPaymentPercent / 100)) / ufValuePesos,
  };
}

function buildAmortizationSchedule(
  loanAmountUF: number,
  basePaymentUF: number,
  monthlyRateDecimal: number,
  termMonths: number,
  monthlyDesgravamenRatePercent: number,
  monthlyFireInsuranceUF: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  let balance = loanAmountUF;

  for (let month = 1; month <= termMonths; month++) {
    const interestUF = balance * monthlyRateDecimal;
    const capitalUF = basePaymentUF - interestUF;
    const desgravamenUF = balance * (monthlyDesgravamenRatePercent / 100);
    const totalMonthlyUF =
      basePaymentUF + desgravamenUF + monthlyFireInsuranceUF;
    const newBalance = Math.max(0, balance - capitalUF);

    schedule.push({
      month,
      paymentUF: basePaymentUF,
      interestUF,
      capitalUF,
      desgravamenUF,
      fireInsuranceUF: monthlyFireInsuranceUF,
      totalMonthlyUF,
      balanceUF: newBalance,
    });

    balance = newBalance;
  }
  return schedule;
}

export function calculateMortgage(input: MortgageInput): MortgageOutput {
  assertInput(input);

  const desgravamenRatePercent = input.monthlyDesgravamenRatePercent ?? 0;
  const fireInsuranceUF = input.monthlyFireInsuranceUF ?? 0;

  const { loanAmountUF, propertyValueUF } = deriveLoanInUF(
    input.propertyValue,
    input.currency,
    input.downPaymentPercent,
    input.ufValuePesos
  );
  const downPaymentAmountUF =
    propertyValueUF * (input.downPaymentPercent / 100);
  const downPaymentAmountPesos = downPaymentAmountUF * input.ufValuePesos;
  const loanAmountPesos = loanAmountUF * input.ufValuePesos;

  const monthlyRateDecimal =
    Math.pow(1 + input.annualRatePercent / 100, 1 / 12) - 1;
  const termMonths = input.termYears * 12;
  const basePaymentUF = calculateAnnuityPayment(
    loanAmountUF,
    monthlyRateDecimal,
    termMonths
  );
  const basePaymentPesos = basePaymentUF * input.ufValuePesos;

  const amortizationSchedule = buildAmortizationSchedule(
    loanAmountUF,
    basePaymentUF,
    monthlyRateDecimal,
    termMonths,
    desgravamenRatePercent,
    fireInsuranceUF
  );

  const insuranceMonth1UF =
    amortizationSchedule[0].desgravamenUF + fireInsuranceUF;
  const totalPaymentMonth1UF = basePaymentUF + insuranceMonth1UF;
  const totalPaidPesos = basePaymentUF * termMonths * input.ufValuePesos;

  return {
    loanAmountUF,
    loanAmountPesos,
    downPaymentAmountUF,
    downPaymentAmountPesos,
    monthlyRateDecimal,
    basePaymentUF,
    basePaymentPesos,
    insuranceMonth1UF,
    insuranceMonth1Pesos: insuranceMonth1UF * input.ufValuePesos,
    totalPaymentMonth1UF,
    totalPaymentMonth1Pesos: totalPaymentMonth1UF * input.ufValuePesos,
    totalPaidPesos,
    totalInterestPesos: totalPaidPesos - loanAmountPesos,
    amortizationSchedule,
  };
}
