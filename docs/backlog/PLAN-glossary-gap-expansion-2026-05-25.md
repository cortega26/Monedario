# PLAN — Glossary Gap Expansion (2026-05-25)

Status: completed

## Objetivo

Cubrir vacios del glosario para lectores legos en el cluster de ahorro e inversion, priorizando terminos ya usados en articulos owner y guias del tema.

## Alcance

- Agregar nuevas entradas de glosario para terminos frecuentes y no triviales.
- Extender el allowlist de autolinking solo en terminos de alto valor y bajo riesgo.
- Agregar pruebas puntuales para terminos multi-palabra y nuevos acronimos.

## Restricciones

- Sin cambios de rutas publicas.
- Sin reescribir el sistema de glosario.
- Mantener el limite actual de autolinks por documento.

## Progreso

- 2026-05-25: Se agregaron entradas nuevas para `ETF`, `Fondo de Emergencia`, `Liquidez`, `Volatilidad`, `Custodia` y `Renta Variable`.
- 2026-05-25: Se extendio el allowlist de autolinking con terminos de alto valor pedagógico, incluyendo `ETF/ETFs` y un termino compuesto (`Fondo de emergencia`).
- 2026-05-25: Se cubrieron pruebas para multi-word terms y plural de ETF.

## Evidencia

- `pnpm exec vitest run tests/unit/injectGlossaryLinks.test.ts`
- `pnpm exec astro check`
