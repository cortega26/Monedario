# ADR-20260929-effective-dated-economic-parameters

Date: 2026-09-29
Status: Accepted

## Context

La auditoría de correctitud 2026-09-28 (F01/F02/F09) demostró que un cálculo
tributario podía usar parámetros "vigentes al build" en lugar de los del
período que correspondía: Operación Renta AT2026 derivaba `UTA = UTM vigente ×
12`, produciendo un IGC distinto al de la tabla SII ($255.248 vs $269.368 para
$18M). El modelo anterior no distinguía "dato vigente hoy", "dato publicado
hoy" y "dato aplicable al período calculado".

## Decision

1. Los parámetros fiscales se congelan por año tributario en
   `TaxYearParameters` y se acceden solo vía `TaxYearRegistry`
   (`getTaxYearParameters`, `getTaxYearForCommercialYear`); un año no
   registrado falla cerrado.
2. La capa tributaria (`src/domain/taxation/**` y `SimulateOperacionRenta*`) no
   puede leer parámetros económicos "vigentes" (`GetEconomicParameters`,
   `infrastructure/economic`, snapshot).
3. Se introduce el modelo effective-dated (`EffectiveDatedEntry` +
   `resolveEffectiveValue`) con período explícito (`YYYY-MM`), vigencia
   `[effectiveFrom, effectiveTo)` y `publicationDate` separada; `undefined` =
   sin cobertura y el llamador debe fallar cerrado, nunca asumir el valor
   vigente.
4. Las pantallas de "hoy" (UF/UTM/indicadores) siguen usando el indicador
   vigente; los cálculos históricos o tributarios usan el registro por período.

## Consequences

- Los cálculos tributarios quedan aislados de la actualización mensual de
  indicadores (test de aislamiento temporal y guarda de imports).
- Cada nuevo año tributario requiere registrar su bundle con fuente citada.
- El modelo effective-dated queda disponible para migrar las series históricas
  (UF/UTM/IPC) cuando una calculadora necesite un período pasado; hasta
  entonces no se duplica el dataset.

## Alternatives considered

- **Parchear el valor** (`$255.248 → $269.368`): no corrige el contrato; el
  error reaparece al cambiar la UTM vigente.
- **Seguir derivando `UTA = UTM × 12`**: falso para años tributarios cerrados.
- **Un registry completo de todas las series históricas ahora**: mayor alcance
  sin consumidor; se migra cuando exista necesidad (paso 4 del plan 115).

## Verification

- `pnpm exec vitest run tests/domain/EffectiveDatedParameters.test.ts
  tests/domain/TaxYearRegistry.test.ts
  tests/static-analysis/tax-current-params-guard.test.ts`
- `pnpm run test` (vector dorado $18M ⇒ $269.367,84 y aislamiento temporal).
- `pnpm run check:boundaries` y `pnpm run check:ci`.
