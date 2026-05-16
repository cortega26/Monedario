const PERCENT_DENOMINATOR = 100;
const FIRST_YEAR = 1;

export interface CompoundInterestInput {
  principal: number;
  annualRatePercent: number;
  years: number;
  compoundsPerYear: number;
}

export interface CompoundInterestOutput {
  principal: number;
  annualRatePercent: number;
  years: number;
  compoundsPerYear: number;
  finalAmount: number;
  generatedInterest: number;
  totalReturnPercent: number;
  yearlyEvolution: {
    year: number;
    balance: number;
    yearInterest: number;
    accumulatedInterest: number;
  }[];
}

function assertInput(input: CompoundInterestInput): void {
  if (!Number.isFinite(input.principal) || input.principal <= 0) {
    throw new Error("principal must be a finite number greater than 0.");
  }
  if (
    !Number.isFinite(input.annualRatePercent) ||
    input.annualRatePercent <= 0
  ) {
    throw new Error(
      "annualRatePercent must be a finite number greater than 0."
    );
  }
  if (
    !Number.isFinite(input.years) ||
    !Number.isInteger(input.years) ||
    input.years <= 0
  ) {
    throw new Error("years must be a positive integer.");
  }
  if (
    !Number.isFinite(input.compoundsPerYear) ||
    !Number.isInteger(input.compoundsPerYear) ||
    input.compoundsPerYear <= 0
  ) {
    throw new Error("compoundsPerYear must be a positive integer.");
  }
}

function compoundBalance(
  principal: number,
  annualRateDecimal: number,
  compoundsPerYear: number,
  years: number
): number {
  return (
    principal *
    Math.pow(1 + annualRateDecimal / compoundsPerYear, compoundsPerYear * years)
  );
}

export function calculateCompoundInterest(
  input: CompoundInterestInput
): CompoundInterestOutput {
  assertInput(input);

  const annualRateDecimal = input.annualRatePercent / PERCENT_DENOMINATOR;
  const finalAmount = compoundBalance(
    input.principal,
    annualRateDecimal,
    input.compoundsPerYear,
    input.years
  );
  const generatedInterest = finalAmount - input.principal;
  const totalReturnPercent =
    (generatedInterest / input.principal) * PERCENT_DENOMINATOR;

  const yearlyEvolution = [];
  let accumulatedInterest = 0;
  for (let year = FIRST_YEAR; year <= input.years; year++) {
    const previousBalance = compoundBalance(
      input.principal,
      annualRateDecimal,
      input.compoundsPerYear,
      year - 1
    );
    const balance = compoundBalance(
      input.principal,
      annualRateDecimal,
      input.compoundsPerYear,
      year
    );
    const yearInterest = balance - previousBalance;
    accumulatedInterest += yearInterest;
    yearlyEvolution.push({
      year,
      balance,
      yearInterest,
      accumulatedInterest,
    });
  }

  return {
    principal: input.principal,
    annualRatePercent: input.annualRatePercent,
    years: input.years,
    compoundsPerYear: input.compoundsPerYear,
    finalAmount,
    generatedInterest,
    totalReturnPercent,
    yearlyEvolution,
  };
}
