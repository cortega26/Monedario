# PLAN — Saneamiento de CI, billing y freshness editorial (2026-10-19)

**Estado:** En ejecución
**Base:** `main@fd6ceb17`
**Rama:** `ops/ci-runner-billing-20261019`
**Alcance:** workflows de CI, test de portabilidad/supply chain, generador de
review policies, clasificación de URLs externas y documentación operativa.
**Fuera de alcance:** contenido editorial YMYL, URLs públicas, slugs, capas de
dominio y el WIP editorial local (91 archivos sin commitear).

## Diagnóstico

- GitHub Actions bloqueó jobs programados por billing/spending limit. Cuatro
  jobs seguían hardcodeados a `ubuntu-latest` y el test de portabilidad los
  excluía.
- `scripts/compute-review-policies.mjs` avanzaba `updatedDate` y `computedAt`
  en cada refresh para todo artículo con data trigger, aunque el valor no
  hubiera cambiado. `computedAt` alimenta `lastReviewed`/`reviewedBy` en JSON-LD:
  era una afirmación pública de revisión humana no respaldada.
- El check externo de URLs bloqueaba PRs por 5xx transitorios (p. ej.
  `spensiones.cl/infoydec` 503) y clasificaba 429 como `ok` en hosts oficiales.
- 24 alertas Dependabot abiertas; la mayoría se resuelve con Astro 7.3.8,
  Wrangler 4.149 y overrides acotados.

## Decisiones

1. **#687 no se mergea tal cual.** Se cherry-pickea solo el snapshot editorial.
   El generador se corrige para bumpear `updatedDate` solo cuando cambia el
   valor del dataset que consume el artículo, y `computedAt` no avanza
   automáticamente. El auto-merge del refresh queda desactivado.
2. **URLs externas:** 404/410/soft-404/host mismatch siguen blocking. 5xx/429
   se reintentan y pasan a `transient_http` non-blocking, con artefacto
   `external-transient.json` para envejecimiento en el audit programado.
3. **`basic-ftp`:** probar override v6 en rama descartable; si pasa, adoptar;
   si no, excepción dev-only con fecha de revisión.
4. **Satori 0.51 y TypeScript 7:** diferidos a un ciclo separado, con fecha y
   golden test de OG images / readiness workflow.
5. **Dependabot:** #664 se cierra por superseded; #669/#670 se mantienen hasta
   que D1/D2 demuestren que resuelven las alertas; #654 y #668 se rebasan.

## Cambios de este PR

- `.github/workflows/*.yml`: todos los jobs usan
  `${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}`; se eliminan los cuatro
  hardcodeos; `validate-committed-artifacts` gana `workflow_dispatch`;
  `ops-reminders` pinnea `actions/checkout` y agrega timeout.
- `tests/static-analysis/actions-runner-portability.e2e.test.ts`: sin allowlist;
  exige el runner variable en todos los jobs.
- `tests/static-analysis/security-supply-chain-config.e2e.test.ts`: detecta
  también `- uses:`.
- `scripts/lib/editorial-volatile-changes.mjs` + tests: comparación por valor.
- `scripts/compute-review-policies.mjs`: bump value-based; `computedAt`
  preservado; `COMPUTE_REVIEW_POLICIES_ROOT` y
  `EDITORIAL_PREVIOUS_VOLATILE_SNAPSHOT` para pruebas.
- `src/infrastructure/editorial/editorial-volatile-data.snapshot.json`:
  cherry-pick de #687.
- `scripts/urlcheck/{probe-external,classify-external,external-artifacts}.mjs`
  y `scripts/check-urls-external.mjs`: retries, `transient_http` y artefacto.
- ADR-20261019, runbooks de quota bridge y URL check.

## Verificación

- [x] `vitest` de portabilidad y supply chain.
- [x] `vitest` de cambio de datasets y review policies.
- [x] `vitest` de clasificación/retries/artefactos de URL.
- [x] `node scripts/compute-review-policies.mjs` no modifica artículos con el
  snapshot actualizado.
- [x] `pnpm run format:check` y `pnpm run lint`.
- [x] `astro check` (0 errores / 0 warnings).
- [ ] `pnpm run check:ci` (el gate editorial seguirá rojo por los 2 stale y el
  drift de `sueldo-imponible`, que requieren revisión editorial humana).
- [ ] CI del PR en GitHub con el runner self-hosted.

## Dependencias

Los upgrades mayores y riesgos dev-only se registran en
`PLAN-deferred-deps-2026-10-19.md` (Satori 0.51, TS7, extract-zip,
astro-shield peer). El PR de parches runtime es `#691`.

## Rollback

- Workflows/test: revert único del PR; el fallback `ubuntu-24.04` mantiene
  continuidad si el runner cae.
- Generador: revert del PR; el snapshot puede quedar actualizado sin daño.
- URL: revertir `classify-external.mjs` devuelve 5xx a blocking.
- El WIP editorial no se toca.

## Registro

- 2026-10-19: diagnóstico y decisiones 1–5.
- 2026-10-19: implementados runner routing, tests, generador value-based,
  cherry-pick del snapshot y clasificación transitoria de URLs.
