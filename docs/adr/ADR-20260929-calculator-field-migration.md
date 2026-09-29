# ADR-20260929-calculator-field-migration

Date: 2026-09-29
Status: Accepted

## Context

La auditoría UX/UI 2026-09-28 y `TD-0111` detectaron ~32 inputs numéricos
inline en 14 calculadoras (`type="number"` sueltos, con labels y estilos
replicados a mano). `src/components/calculator/CalculatorField.astro` ya
existe y cubre label asociado, hint con `aria-describedby`, min/max/step,
`inputAttrs` y wrapper; las guardas de nombres accesibles ya están en verde,
pero la deriva de estilos/atributos obliga a replicar cada mejora de campo en
14 páginas. Es deuda de mantenimiento (severidad 2), no un defecto visible.

## Decision

Migrar por lotes todos los inputs de calculadora a `CalculatorField`,
preservando `id`, comportamiento JS y layout. Criterios:

- lotes de 2–3 páginas con captura visual antes/después en
  `output/validation/td-0111/`;
- `pnpm exec playwright test tests/accessibility/` y `pnpm run test` en verde
  por lote;
- excepciones justificadas y comentadas (p. ej. controles no numéricos
  complejos) quedan documentadas en el código.

## Consequences

- Positivas: un solo lugar para estilos, hints y atributos accesibles; menor
  costo de mantenimiento; consistencia visual entre calculadoras.
- Trade-offs: riesgo de regresión de layout (mitigado con capturas y revisión
  por lotes); el refactor toca 14 páginas en varias PRs.
- Sin cambios de contrato público (ids y `name` se preservan).

## Alternatives considered

- Dejar los inputs inline: descartado; la deriva ya obligó a guardas manuales.
- Big-bang en una sola PR: descartado por riesgo de layout y tamaño de revisión.
- Crear un componente nuevo (`FinancialField`): descartado; `CalculatorField`
  ya cubre el caso y duplicaría mantenimiento.

## Verification

- 0 inputs `type="number"` inline fuera de `CalculatorField` (salvo
  excepciones comentadas).
- `pnpm run test`, `pnpm exec playwright test tests/accessibility/` y
  `pnpm run check:ci` en verde.
- Capturas antes/después por página en `output/validation/td-0111/`.
- `TD-0111` actualizado a Resuelto con evidencia.
