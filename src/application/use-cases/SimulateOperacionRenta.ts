import { calculateAnnualIncomeTax } from "@/domain/taxation/TaxEngine";
import type { TaxYearParameters } from "@/domain/taxation/TaxYearParameters";

export type SueldosBaseMode = "declarada" | "estimada";

export interface OperacionRentaInput {
  /**
   * Renta Total Neta Pagada por sueldos (certificado de rentas del empleador o
   * F22 precargado): remuneraciones imponibles menos cotizaciones
   * previsionales. Nunca el sueldo bruto.
   */
  sueldosRentaNeta: number;
  /** Trazabilidad: si la base de sueldos es declarada o estimada desde bruto. */
  sueldosBaseMode: SueldosBaseMode;
  honorariosBrutos: number;
  arriendos: number;
  impuestoUnicoRetenido: number;
  ppmHonorarios: number;
  apvRegimenB: number;
  interesesHipotecarios: number;
  /** Parámetros fiscales congelados del año tributario. */
  taxYear: TaxYearParameters;
}

export interface OperacionRentaOutput {
  sueldosRentaNeta: number;
  sueldosBaseMode: SueldosBaseMode;
  taxYear: number;
  commercialYear: number;
  rentaNetaHonorarios: number;
  gastosPresuntos: number;
  arriendos: number;
  rentaNetaGlobal: number;
  apvAplicado: number;
  apvCap: number;
  interesesAplicados: number;
  interesesCap: number;
  totalDeducciones: number;
  baseImponibleIGC: number;
  igcCalculado: number;
  tasaMarginal: number;
  impuestoUnicoRetenido: number;
  ppmHonorarios: number;
  totalCreditosRetenciones: number;
  saldoFinal: number;
  esDevolución: boolean;
  montoDevolución: number;
  montoPago: number;
}

function assertInput(input: OperacionRentaInput): void {
  if (!Number.isFinite(input.sueldosRentaNeta) || input.sueldosRentaNeta < 0) {
    throw new Error("sueldosRentaNeta debe ser un número mayor o igual a 0.");
  }
  if (!Number.isFinite(input.honorariosBrutos) || input.honorariosBrutos < 0) {
    throw new Error("honorariosBrutos debe ser un número mayor o igual a 0.");
  }
  if (!Number.isFinite(input.arriendos) || input.arriendos < 0) {
    throw new Error("arriendos debe ser un número mayor o igual a 0.");
  }
  if (input.sueldosRentaNeta + input.honorariosBrutos + input.arriendos <= 0) {
    throw new Error("Debes ingresar al menos una fuente de ingreso.");
  }
  if (
    input.sueldosBaseMode !== "declarada" &&
    input.sueldosBaseMode !== "estimada"
  ) {
    throw new Error("sueldosBaseMode debe ser 'declarada' o 'estimada'.");
  }
  if (!Number.isFinite(input.taxYear.uta) || input.taxYear.uta <= 0) {
    throw new Error("Parámetro UTA inválido.");
  }
  if (
    !Number.isFinite(input.taxYear.ufDecember) ||
    input.taxYear.ufDecember <= 0
  ) {
    throw new Error("Parámetro UF de diciembre inválido.");
  }
}

export function simulateOperacionRenta(
  input: OperacionRentaInput
): OperacionRentaOutput {
  assertInput(input);

  // UTA congelada del año tributario (cierre del año comercial). La tabla IGC
  // usa la misma estructura progresiva del impuesto único mensual pero en UTA.
  const { uta, ufDecember } = input.taxYear;

  // Gastos presuntos de honorarios: 30% del bruto, tope 15 UTA (DL 824 art. 50)
  const topeGastosPresuntos = 15 * uta;
  const gastosPresuntos = Math.min(
    input.honorariosBrutos * 0.3,
    topeGastosPresuntos
  );
  const rentaNetaHonorarios = Math.max(
    0,
    input.honorariosBrutos - gastosPresuntos
  );

  const rentaNetaGlobal =
    input.sueldosRentaNeta + rentaNetaHonorarios + input.arriendos;

  // APV Régimen B: reduce la base imponible, tope 600 UF de diciembre del año
  // comercial (DL 824 art. 42 bis)
  const apvCap = 600 * ufDecember;
  const apvAplicado = Math.min(Math.max(0, input.apvRegimenB), apvCap);

  // Intereses hipotecarios: tope 8 UTA (DL 824 art. 55 bis)
  const interesesCap = 8 * uta;
  const interesesAplicados = Math.min(
    Math.max(0, input.interesesHipotecarios),
    interesesCap
  );

  const totalDeducciones = apvAplicado + interesesAplicados;
  const baseImponibleIGC = Math.max(0, rentaNetaGlobal - totalDeducciones);

  const igcResult = calculateAnnualIncomeTax({
    taxableIncome: baseImponibleIGC,
    uta,
  });

  const igcCalculado = igcResult.taxAmount;
  const tasaMarginal = igcResult.marginalRate;

  const impuestoUnicoRetenido = Math.max(0, input.impuestoUnicoRetenido);
  const ppmHonorarios = Math.max(0, input.ppmHonorarios);
  const totalCreditosRetenciones = impuestoUnicoRetenido + ppmHonorarios;

  // Saldo positivo = pago adicional; negativo = devolución
  const saldoFinal = igcCalculado - totalCreditosRetenciones;
  const esDevolución = saldoFinal < 0;

  return {
    sueldosRentaNeta: input.sueldosRentaNeta,
    sueldosBaseMode: input.sueldosBaseMode,
    taxYear: input.taxYear.taxYear,
    commercialYear: input.taxYear.commercialYear,
    rentaNetaHonorarios,
    gastosPresuntos,
    arriendos: input.arriendos,
    rentaNetaGlobal,
    apvAplicado,
    apvCap,
    interesesAplicados,
    interesesCap,
    totalDeducciones,
    baseImponibleIGC,
    igcCalculado,
    tasaMarginal,
    impuestoUnicoRetenido,
    ppmHonorarios,
    totalCreditosRetenciones,
    saldoFinal,
    esDevolución,
    montoDevolución: esDevolución ? Math.abs(saldoFinal) : 0,
    montoPago: !esDevolución ? saldoFinal : 0,
  };
}
