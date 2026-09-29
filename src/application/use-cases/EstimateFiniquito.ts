export type FiniquitoTerminationCause =
  | "necesidad"
  | "mutuo-acuerdo"
  | "renuncia"
  | "disciplinaria"
  | "vencimiento-obra"
  | "judicial";

/**
 * art. 168 CT (texto vigente, Ley 19.759): el recargo por despido declarado
 * injustificado depende de la causal de la declaración, no de la antigüedad:
 * - improcedente art. 161 → 30%;
 * - injustificada art. 159 o sin causal invocada → 50%;
 * - indebida art. 160 → 80%.
 */
export type JudicialDeclarationType =
  "improcedente-161" | "injustificada-159" | "indebida-160";

export interface EstimateFiniquitoInput {
  monthlySalary: number;
  /** UF del último día del mes anterior al pago (art. 172 inc. final: la base
   * de cálculo no puede superar 90 UF). Sin este valor no se aplica el tope. */
  ufValue?: number;
  yearsWorked: number;
  additionalMonthsWorked?: number;
  pendingSalaryDays?: number;
  monthsSinceLastVacationCycle?: number;
  additionalVacationDaysWorked?: number;
  terminationCause: FiniquitoTerminationCause;
  noticeGiven?: boolean;
  /** Tipo de declaración judicial (solo aplica con causa "judicial"). */
  judicialDeclarationType?: JudicialDeclarationType;
  /** art. 47 CT: empleado tiene gratificación anual (no mensual). Si true,
   * se estima la gratificación proporcional al período fraccionado del año
   * en curso usando `additionalMonthsWorked` como proxy del ciclo parcial. */
  gratificacionAnual?: boolean;
}

export interface EstimateFiniquitoOutput {
  monthlySalary: number;
  /** Base de cálculo art. 172: remuneración con tope de 90 UF cuando aplica. */
  cappedSalaryBase: number;
  baseSalaryCappedByUf: boolean;
  serviceYearsCounted: number;
  cappedServiceYears: number;
  pendingSalaryDays: number;
  pendingSalaryAmount: number;
  proportionalVacationDays: number;
  proportionalVacationAmount: number;
  yearsOfServiceIndemnity: number;
  /** art. 163 inc. 3: 2,5 días de remuneración por mes trabajado en contratos
   * por obra o faena vigentes ≥1 mes terminados por art. 159 N°5. */
  obraFaenaIndemnity: number;
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

// Codigo del Trabajo art. 163 inc. 1: la fraccion cuenta solo si es
// SUPERIOR a seis meses (exactamente 6 no suma un ano).
const SERVICE_YEAR_ROUNDING_MONTH_THRESHOLD = 6;

// Codigo del Trabajo art. 172 inc. final: la base de las indemnizaciones no
// puede superar 90 UF del ultimo dia del mes anterior al pago.
const UF_BASE_CAP = 90;

// Codigo del Trabajo art. 163 inc. 3: obra o faena vigente >=1 mes.
const OBRA_FAENA_DAYS_PER_MONTH = 2.5;
const MIN_OBRA_FAENA_MONTHS = 1;

// Codigo del Trabajo art. 168 (texto vigente): recargo segun la causal
// declarada judicialmente, no segun la antiguedad.
const ART_168_SURCHARGE_BY_DECLARATION: Record<
  JudicialDeclarationType,
  number
> = {
  "improcedente-161": 0.3,
  "injustificada-159": 0.5,
  "indebida-160": 0.8,
};

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
  if (
    input.ufValue !== undefined &&
    (!Number.isFinite(input.ufValue) || input.ufValue <= 0)
  ) {
    throw new Error("ufValue must be a finite number greater than 0.");
  }
  if (
    input.judicialDeclarationType !== undefined &&
    !Object.hasOwn(
      ART_168_SURCHARGE_BY_DECLARATION,
      input.judicialDeclarationType
    )
  ) {
    throw new Error(
      "judicialDeclarationType must be one of improcedente-161, injustificada-159, indebida-160."
    );
  }
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
    (additionalMonthsWorked > SERVICE_YEAR_ROUNDING_MONTH_THRESHOLD ? 1 : 0);

  return {
    serviceYearsCounted,
    cappedServiceYears: Math.min(serviceYearsCounted, MAX_SERVICE_YEARS),
  };
}

function resolveCompensationProfile(
  terminationCause: FiniquitoTerminationCause,
  noticeGiven: boolean | undefined,
  yearsWorked: number
) {
  const isArt161Termination =
    terminationCause === "necesidad" || terminationCause === "judicial";
  // art. 163 inc. 1: la indemnizacion por anos de servicio exige contrato
  // vigente "un ano o mas". El aviso previo (art. 162 inc. 4) no depende de
  // la antiguedad.
  const appliesYearsOfService = isArt161Termination && yearsWorked >= 1;

  return {
    appliesYearsOfService,
    appliesSubstituteNotice: isArt161Termination && noticeGiven !== true,
    requiresProfessionalReview: terminationCause === "judicial",
  };
}

function getArt168SurchargePercent(
  terminationCause: FiniquitoTerminationCause,
  declarationType: JudicialDeclarationType | undefined,
  yearsOfServiceIndemnity: number
) {
  if (terminationCause !== "judicial" || yearsOfServiceIndemnity <= 0) {
    return 0;
  }
  if (!declarationType) {
    // Sin tipo de declaracion no se estima recargo: lo fija el tribunal.
    return 0;
  }
  return ART_168_SURCHARGE_BY_DECLARATION[declarationType] ?? 0;
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
    input.noticeGiven,
    input.yearsWorked
  );

  // art. 172 inc. final: base de las indemnizaciones con tope de 90 UF.
  const baseSalaryCappedByUf =
    input.ufValue !== undefined &&
    input.ufValue > 0 &&
    input.monthlySalary > UF_BASE_CAP * input.ufValue;
  const cappedSalaryBase = baseSalaryCappedByUf
    ? UF_BASE_CAP * (input.ufValue as number)
    : input.monthlySalary;

  const dailySalary = input.monthlySalary / DAYS_PER_MONTH_FOR_SALARY;
  const dailySalaryCapped = cappedSalaryBase / DAYS_PER_MONTH_FOR_SALARY;
  const proportionalVacationDays =
    monthsSinceLastVacationCycle * (VACATION_DAYS_PER_YEAR / MONTHS_PER_YEAR) +
    additionalVacationDaysWorked *
      (VACATION_DAYS_PER_YEAR / DAYS_PER_YEAR_FOR_VACATION);

  const pendingSalaryAmount = dailySalary * pendingSalaryDays;
  const proportionalVacationAmount = dailySalary * proportionalVacationDays;
  const yearsOfServiceIndemnity = compensationProfile.appliesYearsOfService
    ? cappedServiceYears * cappedSalaryBase
    : 0;

  // art. 163 inc. 3: contrato por obra o faena vigente >=1 mes terminado por
  // art. 159 N°5 → 2,5 días de remuneración por mes trabajado.
  const obraFaenaMonths =
    input.yearsWorked * MONTHS_PER_YEAR + additionalMonthsWorked;
  const obraFaenaIndemnity =
    input.terminationCause === "vencimiento-obra" &&
    obraFaenaMonths >= MIN_OBRA_FAENA_MONTHS
      ? OBRA_FAENA_DAYS_PER_MONTH * dailySalaryCapped * obraFaenaMonths
      : 0;

  // art. 168 CT (texto vigente): recargo según la causal declarada
  // judicialmente, solo sobre la indemnización por años de servicio.
  const art168SurchargePercent = getArt168SurchargePercent(
    input.terminationCause,
    input.judicialDeclarationType,
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
    ? cappedSalaryBase
    : 0;

  const totalEstimate =
    pendingSalaryAmount +
    proportionalVacationAmount +
    yearsOfServiceIndemnity +
    obraFaenaIndemnity +
    art168SurchargeAmount +
    substituteNoticeIndemnity +
    gratificacionProporcionalAmount;

  return {
    monthlySalary: input.monthlySalary,
    cappedSalaryBase,
    baseSalaryCappedByUf,
    serviceYearsCounted,
    cappedServiceYears,
    pendingSalaryDays,
    pendingSalaryAmount,
    proportionalVacationDays,
    proportionalVacationAmount,
    yearsOfServiceIndemnity,
    obraFaenaIndemnity,
    art168SurchargePercent,
    art168SurchargeAmount,
    gratificacionProporcionalAmount,
    substituteNoticeIndemnity,
    totalEstimate,
    compensationProfile,
    assumptions: [
      "La indemnización por años de servicio se estima como 30 días de la última remuneración por año, con tope legal de 330 días (art. 163).",
      "El derecho a la indemnización por años de servicio exige contrato vigente un año o más (art. 163 inc. 1).",
      "La fracción de año cuenta solo si es superior a 6 meses (art. 163 inc. 1).",
      "La base de cálculo excluye horas extra, asignación familiar y bonos anuales (art. 172); si tu remuneración tiene variables, el promedio de los últimos 3 meses puede diferir.",
      "La base de las indemnizaciones se topa a 90 UF del último día del mes anterior al pago (art. 172 inc. final); se usa la UF vigente del snapshot.",
      "El aviso previo sustitutivo (1 mes) aplica cuando la causal es del art. 161 y no se dio aviso; no depende de la antigüedad (art. 162 inc. 4).",
      "Recargo art. 168 según la causal declarada: 30% improcedente art. 161, 50% injustificada art. 159 o sin causal, 80% indebida art. 160; sin tipo declarado no se estima.",
      "Contrato por obra o faena (art. 163 inc. 3): 2,5 días de remuneración por mes trabajado si el contrato duró un mes o más; la fracción superior a 15 días no se modela.",
      "El feriado proporcional usa base de 15 días hábiles por año y valor diario mensual dividido por 30.",
      "Gratificación proporcional estimada al 25% del período fraccionado (proxy); el monto real depende de las utilidades del empleador (art. 47 CT).",
      "No incorpora cláusulas pactadas, remuneraciones variables complejas, recargo del 100% (art. 160 N°1/5/6) ni descuentos en disputa.",
    ],
  };
}
