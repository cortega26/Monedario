import {
  PERCENT_DENOMINATOR,
  MONTHS_PER_YEAR,
} from "./shared/financialConstants";

const DEFAULT_WITHHOLDING_RATE_PERCENT = 15.25;
const DEFAULT_COVERAGE_BASE_PERCENT = 80;

export interface HonorariosNetInput {
  grossFee: number;
  withholdingRatePercent?: number;
  issuedMonthsPerYear?: number;
  annualGrossFees?: number;
  currentDate?: string;
}

export interface HonorariosNetOutput {
  grossFee: number;
  withholdingRatePercent: number;
  withholdingAmount: number;
  netFeeReceived: number;
  annualGrossFees: number;
  annualWithholdingAmount: number;
  coverageBaseRatePercent: number;
  annualCoverageBase: number;
  monthlyCoverageBaseEquivalent: number;
  annualCoverageWindow: {
    startsOn: string;
    endsOn: string;
  };
  assumptions: string[];
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const asDate = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(asDate.getTime()) &&
    asDate.toISOString().slice(0, 10) === value
  );
}

function computeFiscalYearWindow(currentDate?: string): {
  startsOn: string;
  endsOn: string;
} {
  if (currentDate !== undefined && !isIsoDate(currentDate)) {
    throw new Error("currentDate must be an ISO date in YYYY-MM-DD format.");
  }
  const d = currentDate ? new Date(`${currentDate}T00:00:00.000Z`) : new Date();
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1; // 1–12
  const startYear = month >= 7 ? year : year - 1;
  return {
    startsOn: `${startYear}-07-01`,
    endsOn: `${startYear + 1}-06-30`,
  };
}

function assertInput(input: HonorariosNetInput): void {
  if (!Number.isFinite(input.grossFee) || input.grossFee <= 0) {
    throw new Error("grossFee must be a finite number greater than 0.");
  }
  if (
    input.withholdingRatePercent !== undefined &&
    (!Number.isFinite(input.withholdingRatePercent) ||
      input.withholdingRatePercent <= 0 ||
      input.withholdingRatePercent >= 100)
  ) {
    throw new Error(
      "withholdingRatePercent must be a finite number between 0 and 100."
    );
  }
  if (
    input.issuedMonthsPerYear !== undefined &&
    (!Number.isFinite(input.issuedMonthsPerYear) ||
      input.issuedMonthsPerYear <= 0 ||
      input.issuedMonthsPerYear > 12)
  ) {
    throw new Error(
      "issuedMonthsPerYear must be a finite number between 1 and 12."
    );
  }
  if (
    input.annualGrossFees !== undefined &&
    (!Number.isFinite(input.annualGrossFees) || input.annualGrossFees <= 0)
  ) {
    throw new Error(
      "annualGrossFees must be a finite number greater than 0 when provided."
    );
  }
}

export function calculateHonorariosNet(
  input: HonorariosNetInput
): HonorariosNetOutput {
  assertInput(input);

  const withholdingRatePercent =
    input.withholdingRatePercent ?? DEFAULT_WITHHOLDING_RATE_PERCENT;
  const issuedMonthsPerYear = input.issuedMonthsPerYear ?? 12;
  const withholdingAmount =
    input.grossFee * (withholdingRatePercent / PERCENT_DENOMINATOR);
  const netFeeReceived = input.grossFee - withholdingAmount;
  const annualGrossFees =
    input.annualGrossFees ?? input.grossFee * issuedMonthsPerYear;
  const annualWithholdingAmount =
    annualGrossFees * (withholdingRatePercent / PERCENT_DENOMINATOR);
  const annualCoverageBase =
    annualGrossFees * (DEFAULT_COVERAGE_BASE_PERCENT / PERCENT_DENOMINATOR);
  const monthlyCoverageBaseEquivalent = annualCoverageBase / MONTHS_PER_YEAR;

  return {
    grossFee: input.grossFee,
    withholdingRatePercent,
    withholdingAmount,
    netFeeReceived,
    annualGrossFees,
    annualWithholdingAmount,
    coverageBaseRatePercent: DEFAULT_COVERAGE_BASE_PERCENT,
    annualCoverageBase,
    monthlyCoverageBaseEquivalent,
    annualCoverageWindow: computeFiscalYearWindow(input.currentDate),
    assumptions: [
      "El líquido mensual se calcula como bruto menos retención al emitir la boleta.",
      "La base de cobertura anual se estima como 80% del total bruto anual boleteado.",
      "La calculadora no determina por sí sola si quedas eximido por monto anual, causal legal específica o afiliación previsional.",
      "La regularización final ocurre en Operación Renta y puede terminar con devolución o cobro de diferencia.",
    ],
  };
}
