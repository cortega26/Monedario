# ADR-20260906: CI coverage enforcement

Date: 2026-09-06
Status: Accepted

## Context

La Constitución §5.3 exige un umbral mínimo de cobertura definido en CI y que
una caída de cobertura bloquee merge. `vitest.config.ts` ya define
`thresholds: { lines: 80 }` con exclusiones deliberadas (plan 073: páginas,
componentes, runtime de cliente, Workers), pero el job `lint-and-test` de
`.github/workflows/ci.yml` ejecuta `pnpm run test` (`vitest run` sin
`--coverage`), de modo que el umbral nunca se evalúa y el control no opera.
La auditoría 2026-09-06 midió 91,81% de líneas, por encima del 80%: no hace
falta una campaña de tests ni rebajar el umbral.

## Decision

1. El paso de tests del job bloqueante `lint-and-test` ejecuta
   `pnpm run test:coverage` (`vitest run --coverage`) una sola vez por job,
   sin `continue-on-error` ni `|| true`: un fallo de tests o del umbral hace
   fallar el job y bloquea merge (Constitución §5.3/§6).
2. `check:ci` (espejo local, sin build) invoca `test:coverage` una sola vez
   en lugar de `test`, sin duplicar la suite.
3. `test` se conserva como comando rápido independiente, sin coverage.
4. Sin cambios a qué se mide: umbral, inclusiones/exclusiones de
   `vitest.config.ts` y ausencia de build en el espejo quedan intactos. Sin
   jobs, suites ni uploads nuevos.

## Consequences

- Se recupera un control constitucional existente con un cambio mínimo; una
  caída bajo el 80% bloquea merge en CI y es reproducible en local con
  `pnpm run check:ci`.
- La corrida de tests en CI/local genera el reporte de coverage (sobrecosto
  menor, una sola ejecución por job).
- Un test de contrato (`tests/static-analysis/ci-coverage-contract.test.ts`)
  fija el wiring: volver a `test` sin coverage hace fallar el test.

## Alternatives considered

- Job dedicado de coverage: descartado, duplica la ejecución de Vitest sin
  beneficio.
- Subir artefactos de coverage a un servicio externo: descartado, fuera de
  alcance; el umbral local de Vitest ya bloquea.
- Rebajar el umbral o sumar exclusiones: descartado, la medición real
  (91,81%) supera el 80% vigente.

## Verification

- `pnpm run test:coverage` → exit 0 y líneas >= 80%.
- `pnpm exec vitest run tests/static-analysis/ci-coverage-contract.test.ts`
  → exit 0; revertir la activación solo en una fixture hace fallar la
  aserción, sin tocar el workflow real.
- `pnpm run check:ci`, `pnpm run lint`, `pnpm run format:check`,
  `pnpm run check:policy-registry`, `pnpm run check:context`,
  `pnpm run check:docs` → exit 0; diff de `vitest.config.ts` vacío.
