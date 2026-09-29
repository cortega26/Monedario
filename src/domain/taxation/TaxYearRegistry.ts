import { AT2026, type TaxYearParameters } from "./TaxYearParameters";

/**
 * Registro de parámetros fiscales congelados por año tributario.
 *
 * Es el único punto de acceso para cálculos tributarios: no se leen
 * indicadores "vigentes" (`GetEconomicParameters`) desde la capa tributaria.
 * Ver `docs/adr/ADR-20260929-effective-dated-economic-parameters.md`.
 */
export const TAX_YEAR_PARAMETERS: readonly TaxYearParameters[] = [AT2026];

export function getTaxYearParameters(taxYear: number): TaxYearParameters {
  const found = TAX_YEAR_PARAMETERS.find(
    parameters => parameters.taxYear === taxYear
  );
  if (!found) {
    throw new Error(
      `No hay parámetros fiscales registrados para el año tributario ${taxYear}.`
    );
  }
  return found;
}

export function getTaxYearForCommercialYear(
  commercialYear: number
): TaxYearParameters {
  const found = TAX_YEAR_PARAMETERS.find(
    parameters => parameters.commercialYear === commercialYear
  );
  if (!found) {
    throw new Error(
      `No hay parámetros fiscales registrados para el año comercial ${commercialYear}.`
    );
  }
  return found;
}
