# Planes archivados (completados)

Planes de implementación cuyo trabajo ya está **hecho, verificado y mergeado en
`main`**. Se conservan como registro de auditoría; no son trabajo pendiente.

No uses material archivado como política vigente: si un plan archivado describe
un estado del código, verifica contra el código actual antes de actuar.

La política de cierre canónica está en [`../README.md`](../README.md): todo plan
DONE y mergeado debe moverse aquí en la misma unidad de cambio, con ambos índices
actualizados y sin enlaces residuales a su ubicación anterior.

## Contenido

| Plan | Título | Auditoría | Mergeado en `main` |
|------|--------|-----------|--------------------|
| [001](001-csp-kofi-domain.md) | Agregar `storage.ko-fi.com` al CSP | 2026-06-11 | sí |
| [002](002-pin-setup-node-sha.md) | Pinear `actions/setup-node` por SHA | 2026-06-11 | sí |
| [003](003-page-lastmod-pr-gate.md) | Convertir `page-lastmod.yml` a PR-gate | 2026-06-11 | sí |
| [020](020-afp-comparison-cheapest-name.md) | Corregir nombre de AFP cableado en la nota de comparación | 2026-06-15 | sí (commits `e7e3aa72`, `439583e5`) |
| [021](021-economic-snapshot-hardening.md) | Endurecer worker de snapshot económico | 2026-06-15 | sí (commit `95f028ef`) |
| [022](022-consolidate-clp-formatter.md) | Consolidar formateador CLP en módulo leaf | 2026-06-15 | sí (PR #243, squash `2e3c1e4a`) |
| [023](023-gate-floor-and-reddit-alert-atomicity.md) | Guardas de baseline y alerta Reddit atómica | 2026-06-15 | sí (PR #244, squash `e65c6ebc`) |
| [024](024-calculator-data-freshness-component.md) | Estandarizar vigencia de datos de calculadoras en componente compartido | 2026-06-17 | sí (PR #239, commit `b924b5dc`) |
| [025](025-iva-calculator-engine.md) | Motor y página de calculadora de IVA | 2026-06-17 | sí (commits `c4f6945a`, `64644fa6`) |
| [026](026-glossary-thematic-index.md) | Índice temático del glosario | 2026-06-17 | sí (`47ce4221`) |
| [027](027-afp-refresh-effective-date-parser.md) | Extraer fecha AFP con parser genérico | 2026-06-19 | sí (PR #240, squash `369ff01b`) |
| [028](028-imm-shared-constant.md) | Consolidar IMM en módulo leaf | 2026-06-19 | sí (commit `13a3d390`) |
| [029](029-calculator-controller-tests.md) | Caracterizar controladores de calculadoras | 2026-06-19 | sí (commit `8d69b79c`) |
| [030](030-economic-snapshot-freshness-gate.md) | Gate de frescura del snapshot económico | 2026-06-19 | sí (commit `c9d72ed4`) |
| [031](031-iva-calculator-backlinks.md) | Backlinks internos a la calculadora de IVA (glosario + post) | 2026-06-19 | sí (commit `fcdf551c`) |
| [032](032-calculator-accessibility-semantics.md) | A11y de calculadoras: foco al resultado, asociación hint/error, foco visible en radios | 2026-06-26 | sí (commit `702b7cc2`) |
| [033](033-calculator-datemodified-from-lastmod-index.md) | `dateModified` de calculadoras desde `page-lastmod-index.json` | 2026-06-26 | sí (commit `2ff547eb`) |
| [034](034-conversor-uf-historic-fetch-error-state.md) | Error real (no «Cargando…» eterno) al fallar la carga del histórico UF | 2026-06-26 | sí (commit `7c290c1c`) |
| [035](035-gsc-inspect-abort-on-mass-failure.md) | Abortar `gsc-inspect` antes de escribir cuando la mayoría de inspecciones fallan (no sobrescribir con 0% indexado) | 2026-07-10 | sí (commit `a86f88eb`) |

## Planes 004–019 (completados, sin archivo en el árbol)

Los planes 004–019 de la auditoría 2026-06-11 también están **DONE e integrados**
(vía las ramas `advisor/0NN-*` → `advisor/integration-2026-06-15`). Sus archivos
nunca se conservaron en el árbol de trabajo; viven solo en el historial git de sus
ramas. Ver el detalle en `plans/README.md`.
