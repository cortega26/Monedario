import {
  PAYROLL_CONTRACT_TYPES,
  type PayrollContractType,
} from "@/domain/payroll/PayrollRules";

/**
 * Normaliza el valor de un selector de contrato al tipo que entiende el motor.
 *
 * Existe para que la conversión viva en un solo lugar y sea testeable: la
 * auditoría R5 demostró que un `if` inline por página puede coaccionar
 * `casa-particular` a `indefinido` y descontar 0,6% a quien no corresponde,
 * sin que ninguna guarda de texto lo note.
 */
export function parseContractType(
  value: string | null | undefined
): PayrollContractType {
  if (PAYROLL_CONTRACT_TYPES.includes(value as PayrollContractType)) {
    return value as PayrollContractType;
  }
  return "indefinido";
}
