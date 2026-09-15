/**
 * Parses a Chilean-formatted number: `.` thousands separators are stripped,
 * `,` becomes the decimal point. Trims whitespace; empty or non-finite
 * input yields `undefined` instead of `NaN`.
 *
 * Unifies the three text-path two-replace sites (plan 107 step 2):
 * `src/scripts/calculator-prefill.ts` (`toStoredValue`) and the two URL
 * pre-fill sites in `src/utils/sueldo-liquido/formController.ts`.
 * Deliberately NOT used by: operacion-renta's conditional-strip + `|| 0`
 * parser, native `type="number"` `valueAsNumber` branches (plan 088), and
 * the digit-only UTM/IVA sites (`/\D/g` → `NaN` on empty).
 */
export function parseCLNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed.replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}
