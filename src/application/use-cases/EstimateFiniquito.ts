export type FiniquitoTerminationCause =
  | "necesidad"
  | "mutuo-acuerdo"
  | "renuncia"
  | "disciplinaria"
  | "vencimiento-obra"
  | "judicial";

export interface EstimateFiniquitoInput {
  monthlySalary: number;
  yearsWorked: number;
  additionalMonthsWorked?: number;
  pendingSalaryDays?: number;
  monthsSinceLastVacationCycle?: number;
  additionalVacationDaysWorked?: number;
  terminationCause: FiniquitoTerminationCause;
  noticeGiven?: boolean;
  /** art. 47 CT: empleado tiene gratificación anual (no mensual). Si true,
   * se estima la gratificación proporcional al período fraccionado del año
   * en curso usando `additionalMonthsWorked` como proxy del ciclo parcial. */
  gratificacionAnual?: boolean;
}

export interface EstimateFiniquitoOutput {
  monthlySalary: number;
  serviceYearsCounted: number;
  cappedServiceYears: number;
  pendingSalaryDays: number;
  pendingSalaryAmount: number;
  proportionalVacationDays: number;
  proportionalVacationAmount: number;
  yearsOfServiceIndemnity: number;
  /** art. 168 CT: porcentaje de recargo sobre indemnización por años de servicio
   * cuando el despido es declarado injustificado judicialmente (0 si no aplica). */
  art168SurchargePercent: number;
  /** art. 168 CT: monto del recargo (yearsOfServiceIndemnity × art168SurchargePercent). */
  art168SurchargeAmount: number;
  /** art. 47 CT: gratificación proporcional estimada al período fraccionado del año
   * en curso. Cero cuando gratificacionAnual no es true o additionalMonthsWorked = 0. */
  gratificacionProporcionalAmount: number;
  substituteNoticeIndemnity: number;
  totalEstimate: number;
  compensationProfile: {
    appliesYearsOfService: boolean;
    appliesSubstituteNotice: boolean;
    requiresProfessionalReview: boolean;
  };
  assumptions: string[];
}

import { MONTHS_PER_YEAR } from "./shared/financialConstants";

const MAX_SERVICE_YEARS = 11;
const VACATION_DAYS_PER_YEAR = 15;
const DAYS_PER_MONTH_FOR_SALARY = 30;
const DAYS_PER_YEAR_FOR_VACATION = 360;
const MIN_ADDITIONAL_MONTHS_WORKED = 0;
const MAX_ADDITIONAL_MONTHS_WORKED_EXCLUSIVE = MONTHS_PER_YEAR;
const MIN_PENDING_SALARY_DAYS = 0;
const MAX_PENDING_SALARY_DAYS = DAYS_PER_MONTH_FOR_SALARY;
const MIN_VACATION_CYCLE_MONTHS = 0;
const MAX_VACATION_CYCLE_MONTHS = MONTHS_PER_YEAR;
const MIN_ADDITIONAL_VACATION_DAYS = 0;
const MAX_ADDITIONAL_VACATION_DAYS = DAYS_PER_MONTH_FOR_SALARY;

// Codigo del Trabajo art. 163: regla de fraccion superior a seis meses;
// conserva el umbral operativo previo de la estimacion.
const SERVICE_YEAR_ROUNDING_MONTH_THRESHOLD = 6;

// Codigo del Trabajo art. 168: recargos judiciales sobre indemnizacion por anos de servicio.
const ART_168_SURCHARGE_BANDS = [
  { maxServiceYears: 3, surchargePercent: 0.3 },
  { maxServiceYears: 6, surchargePercent: 0.5 },
  { maxServiceYears: Number.POSITIVE_INFINITY, surchargePercent: 0.8 },
] as const;

function assertPositiveNumber(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a finite number greater than 0.`);
  }
}

function assertRange(
  value: number | undefined,
  field: string,
  min: number,
  max: number
): void {
  if (
    value !== undefined &&
    (!Number.isFinite(value) || value < min || value > max)
  ) {
    throw new Error(
      `${field} must be a finite number between ${min} and ${max}.`
    );
  }
}

function assertInput(input: EstimateFiniquitoInput): void {
  assertPositiveNumber(input.monthlySalary, "monthlySalary");
  if (!Number.isFinite(input.yearsWorked) || input.yearsWorked < 0) {
    throw new Error("yearsWorked must be a finite number >= 0.");
  }
  if (
    input.additionalMonthsWorked !== undefined &&
    (!Number.isFinite(input.additionalMonthsWorked) ||
      input.additionalMonthsWorked < MIN_ADDITIONAL_MONTHS_WORKED ||
      input.additionalMonthsWorked >= MAX_ADDITIONAL_MONTHS_WORKED_EXCLUSIVE)
  ) {
    throw new Error(
      "additionalMonthsWorked must be a finite number between 0 and 11."
    );
  }
  assertRange(
    input.pendingSalaryDays,
    "pendingSalaryDays",
    MIN_PENDING_SALARY_DAYS,
    MAX_PENDING_SALARY_DAYS
  );
  assertRange(
    input.monthsSinceLastVacationCycle,
    "monthsSinceLastVacationCycle",
    MIN_VACATION_CYCLE_MONTHS,
    MAX_VACATION_CYCLE_MONTHS
  );
  assertRange(
    input.additionalVacationDaysWorked,
    "additionalVacationDaysWorked",
    MIN_ADDITIONAL_VACATION_DAYS,
    MAX_ADDITIONAL_VACATION_DAYS
  );
}

function resolveServiceYears(
  yearsWorked: number,
  additionalMonthsWorked: number
) {
  const serviceYearsCounted =
    yearsWorked +
    (additionalMonthsWorked >= SERVICE_YEAR_ROUNDING_MONTH_THRESHOLD ? 1 : 0);

  return {
    serviceYearsCounted,
    cappedServiceYears: Math.min(serviceYearsCounted, MAX_SERVICE_YEARS),
  };
}

function resolveCompensationProfile(
  terminationCause: FiniquitoTerminationCause,
  noticeGiven: boolean | undefined
) {
  const appliesYearsOfService =
    terminationCause === "necesidad" || terminationCause === "judicial";

  return {
    appliesYearsOfService,
    appliesSubstituteNotice: appliesYearsOfService && noticeGiven !== true,
    requiresProfessionalReview: terminationCause === "judicial",
  };
}

function getArt168SurchargePercent(
  terminationCause: FiniquitoTerminationCause,
  serviceYearsCounted: number,
  yearsOfServiceIndemnity: number
) {
  if (terminationCause !== "judicial" || yearsOfServiceIndemnity <= 0) {
    return 0;
  }

  const band = ART_168_SURCHARGE_BANDS.find(
    ({ maxServiceYears }) => serviceYearsCounted <= maxServiceYears
  );
  return band?.surchargePercent ?? 0;
}

export function estimateFiniquito(
  input: EstimateFiniquitoInput
): EstimateFiniquitoOutput {
  assertInput(input);

  const additionalMonthsWorked = input.additionalMonthsWorked ?? 0;
  const pendingSalaryDays = input.pendingSalaryDays ?? 0;
  const monthsSinceLastVacationCycle = input.monthsSinceLastVacationCycle ?? 0;
  const additionalVacationDaysWorked = input.additionalVacationDaysWorked ?? 0;
  const { serviceYearsCounted, cappedServiceYears } = resolveServiceYears(
    input.yearsWorked,
    additionalMonthsWorked
  );
  const compensationProfile = resolveCompensationProfile(
    input.terminationCause,
    input.noticeGiven
  );

  const dailySalary = input.monthlySalary / DAYS_PER_MONTH_FOR_SALARY;
  const proportionalVacationDays =
    monthsSinceLastVacationCycle * (VACATION_DAYS_PER_YEAR / MONTHS_PER_YEAR) +
    additionalVacationDaysWorked *
      (VACATION_DAYS_PER_YEAR / DAYS_PER_YEAR_FOR_VACATION);

  const pendingSalaryAmount = dailySalary * pendingSalaryDays;
  const proportionalVacationAmount = dailySalary * proportionalVacationDays;
  const yearsOfServiceIndemnity = compensationProfile.appliesYearsOfService
    ? cappedServiceYears * input.monthlySalary
    : 0;

  // art. 168 CT: recargo sobre indemnización por años de servicio cuando el
  // despido es declarado injustificado judicialmente. Solo aplica sobre
  // yearsOfServiceIndemnity (no sobre aviso previo ni conceptos adicionales).
  const art168SurchargePercent = getArt168SurchargePercent(
    input.terminationCause,
    serviceYearsCounted,
    yearsOfServiceIndemnity
  );
  const art168SurchargeAmount =
    yearsOfServiceIndemnity * art168SurchargePercent;

  // art. 47 CT: gratificación proporcional estimada usando additionalMonthsWorked
  // como proxy del período fraccionado del año en curso.
  const gratificacionProporcionalAmount =
    input.gratificacionAnual === true
      ? (input.monthlySalary * additionalMonthsWorked) / MONTHS_PER_YEAR
      : 0;

  const substituteNoticeIndemnity = compensationProfile.appliesSubstituteNotice
    ? input.monthlySalary
    : 0;

  const totalEstimate =
    pendingSalaryAmount +
    proportionalVacationAmount +
    yearsOfServiceIndemnity +
    art168SurchargeAmount +
    substituteNoticeIndemnity +
    gratificacionProporcionalAmount;

  return {
    monthlySalary: input.monthlySalary,
    serviceYearsCounted,
    cappedServiceYears,
    pendingSalaryDays,
    pendingSalaryAmount,
    proportionalVacationDays,
    proportionalVacationAmount,
    yearsOfServiceIndemnity,
    art168SurchargePercent,
    art168SurchargeAmount,
    gratificacionProporcionalAmount,
    substituteNoticeIndemnity,
    totalEstimate,
    compensationProfile,
    assumptions: [
      "La indemnización por años de servicio se estima como 30 días por año con tope legal de 11 años.",
      "El año fraccionado superior a 6 meses se cuenta como año completo para esta estimación.",
      "El feriado proporcional usa base de 15 días hábiles por año y valor diario mensual dividido por 30.",
      "Recargo art. 168 CT (30%/50%/80%) estimado solo sobre indemnización por años de servicio; el cálculo exacto lo fija el tribunal.",
      "Gratificación proporcional estimada al 25% del período fraccionado (proxy); el monto real depende de las utilidades del empleador (art. 47 CT).",
      "No incorpora cláusulas pactadas, remuneraciones variables complejas ni descuentos en disputa.",
    ],
  };
}
