import type { EconomicParameters } from "@/domain/economic/EconomicParameters";
import { calculateSecondCategoryTax } from "@/domain/taxation/TaxEngine";

export interface OperacionRentaInput {
  sueldosBrutos: number;
  honorariosBrutos: number;
  arriendos: number;
  impuestoUnicoRetenido: number;
  ppmHonorarios: number;
  apvRegimenB: number;
  interesesHipotecarios: number;
  economicParameters: Pick<EconomicParameters, "utm" | "uf">;
}

export interface OperacionRentaOutput {
  sueldosBrutos: number;
  rentaNetaHonorarios: number;
  gastosPresuntos: number;
  arriendos: number;
  rentaBrutaGlobal: number;
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
  if (!Number.isFinite(input.sueldosBrutos) || input.sueldosBrutos < 0) {
    throw new Error("sueldosBrutos debe ser un número mayor o igual a 0.");
  }
  if (!Number.isFinite(input.honorariosBrutos) || input.honorariosBrutos < 0) {
    throw new Error("honorariosBrutos debe ser un número mayor o igual a 0.");
  }
  if (!Number.isFinite(input.arriendos) || input.arriendos < 0) {
    throw new Error("arriendos debe ser un número mayor o igual a 0.");
  }
  if (input.sueldosBrutos + input.honorariosBrutos + input.arriendos <= 0) {
    throw new Error("Debes ingresar al menos una fuente de ingreso.");
  }
  if (
    !Number.isFinite(input.economicParameters.utm) ||
    input.economicParameters.utm <= 0
  ) {
    throw new Error("Parámetro UTM inválido.");
  }
  if (
    !Number.isFinite(input.economicParameters.uf) ||
    input.economicParameters.uf <= 0
  ) {
    throw new Error("Parámetro UF inválido.");
  }
}

export function simulateOperacionRenta(
  input: OperacionRentaInput
): OperacionRentaOutput {
  assertInput(input);

  const { utm, uf } = input.economicParameters;
  // UTA (Unidad Tributaria Anual) = UTM × 12. The annual IGC table uses the
  // same progressive brackets as the monthly impuesto único but expressed in
  // UTAs instead of UTMs, so passing (utm * 12) to calculateSecondCategoryTax
  // reuses the existing engine for annual income.
  const uta = utm * 12;

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

  const rentaBrutaGlobal =
    input.sueldosBrutos + rentaNetaHonorarios + input.arriendos;

  // APV Régimen B: reduce la base imponible, tope 600 UF (DL 824 art. 42 bis)
  const apvCap = 600 * uf;
  const apvAplicado = Math.min(Math.max(0, input.apvRegimenB), apvCap);

  // Intereses hipotecarios: tope 8 UTA (DL 824 art. 55 bis)
  const interesesCap = 8 * uta;
  const interesesAplicados = Math.min(
    Math.max(0, input.interesesHipotecarios),
    interesesCap
  );

  const totalDeducciones = apvAplicado + interesesAplicados;
  const baseImponibleIGC = Math.max(0, rentaBrutaGlobal - totalDeducciones);

  const igcResult = calculateSecondCategoryTax({
    taxableIncome: baseImponibleIGC,
    utm: uta,
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
    sueldosBrutos: input.sueldosBrutos,
    rentaNetaHonorarios,
    gastosPresuntos,
    arriendos: input.arriendos,
    rentaBrutaGlobal,
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
