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
| [039](039-calculator-funnel-instrumentation.md) | Reparar instrumentación del embudo de calculadoras (dedupe `calculator_complete` por page-view) — parcial, típo `calculator_completed` desglosado al plan 042 | 2026-07-10 | sí (merge commit `a661e61a`) |
| [037](037-analytics-export-secret-header.md) | Recibir el secreto del export manual por `Authorization` header, no por query string (rotación de `EXPORT_SECRET` pendiente, paso humano) | 2026-07-10 | sí (merge commit `9d722ac6`) |
| [038](038-analytics-freeform-dimension-shape.md) | Restringir la forma de `calculator_slug`/`rule_id`/`action_id` en analytics (cardinalidad/poisoning) — alcance revisado a 3 de 4 claves tras bloqueo inicial; `item_id` separado al plan 043 | 2026-07-10 | sí (fast-forward `5ebda2e0`) |
| [036](036-analytics-export-failure-detection.md) | Hacer detectable un export de analytics ausente/fallido: re-throw en el worker `scheduled` + detección de semana vencida en el consumidor (cierra la clase de fallo OBS-01) | 2026-07-10 | sí (fast-forward `9049cb76`) |
| [044](044-calculator-prefill-hint-cls.md) | Convertir el aviso de prellenado en toast `fixed` para eliminar su CLS (0.0125) — carve-out del diagnóstico de 041 (BLOCKED); no cierra el CLS de campo (p75 1.008) | 2026-07-12 | sí (merge commit `d737d7df`) |
| [040](040-seo-title-snippet-refresh-brief.md) | Brief SEO title/snippet de seguro-cesantia (Título A aprobado por el operador); apv y conversor-uf sin tocar por bajo valor esperado | 2026-07-12 | sí (merge commit `013b59b0`) |
| [042](042-remove-calculator-completed-typo-event.md) | Quitar el evento typo `calculator_completed` de 8 archivos + el test que lo fijaba (código muerto, cero impacto en métricas) — cierra el ítem residual de 039 | 2026-07-12 | sí (merge commit `afeb9203`) |
| [043](043-analytics-item-id-shape-decision.md) | Restringir la forma de `item_id` en analytics vía `SAFE_ITEM_ID_RE` (Opción 2 elegida por el operador; carve-out de 038) | 2026-07-12 | sí (merge commit `66fd6a3c`) |
| [045](045-measurement-resequence-two-lanes.md) | Spike de dirección: re-secuenciar el crecimiento en dos carriles (SEO/GSC desbloqueado vs. journeys tras baseline); entregable `docs/reports/GROWTH-DIRECTION-DELTA-2026-W27.md`; follow-up de implementación desglosado al plan 047 (GROWTH-005) | 2026-07-13 | sí (fast-forward `f34210ff`) |
| [047](047-growth-005-rum-hostname-filter.md) | Filtrar el RUM de Cloudflare por `requestHost = monedario.cl` y conservar la allowlist defensiva | 2026-07-16 | sí (commit `a3ac9504`; final Issue #315 change) |
| [048](048-search-signal-integrity.md) | Restaurar comparaciones WoW, estados de fuente explícitos y auditoría CTR acotada | 2026-07-16 | sí (commit `e472ea43`; final Issue #315 change) |
| [049](049-analytics-calendar-and-funnel-semantics.md) | Alinear semanas a Chile con cutover v1→v2 y reportar ratios de eventos sin llamarlos conversión | 2026-07-16 | sí (PR #331, squash `ac0c4a17`; deploy `dbc273e9-4f89-48f8-b572-fff6e536ff81`) |
| [050](050-weekly-search-ops-current-scale.md) | Restaurar el loop semanal con revisión de cadencia el 2026-08-01 | 2026-07-16 | sí (commit `e01d4a93`; final Issue #315 change) |
| [051](051-analytics-deployment-parity.md) | Deploy reproducible y verificable del Worker de analytics: workflow manual + verifier de paridad (versión activa, cron `57 7 * * MON`, auth header-only, frescura R2) + ADR/runbook; auditoría post-entrega integrada (timeout 30, margen R2 2 s, tests CLI, semana 01-53, TZ) | 2026-08-02 | sí (fast-forward `79d78372`) — smoke de producción (Step 5) pendiente del operador |
| [053](053-gsc-measurement-baseline.md) | Completar el baseline de medición GSC: gate de semanas faltantes (estricto en CI tras revisión de auditoría) + exports de país/dispositivo; backfill de 2026-W29 pendiente como paso operativo | 2026-08-02 | sí (fast-forward `f1e37560` + `bc979708`) |
| [054](054-editorial-evidence-ledger-spike.md) | Spike de dirección: ledger de evidencia del pipeline editorial (inventario 3/53, reproducción del checker, veredicto claim vs. evidencia — gap real = 19); entregable `docs/reports/EDITORIAL-EVIDENCE-LEDGER-2026-08-02.md`; compuerta humana abierta | 2026-08-02 | sí (fast-forward `673ad8dc`) |
| [057](057-pagefind-prune.md) | Purgar el índice pagefind en cada build (`rm -rf dist/pagefind` antes de re-indexar; 33 MB acumulado → 1.3 MB) | 2026-08-10 | sí (fast-forward `70f6a1d9`) |
| [058](058-sw-volatile-money-paths.md) | SW network-first para conversor-uf/utm y uf-hoy: 6 rutas nuevas en `VOLATILE_HTML_PATHS` (valores monetarios del día dejan de servirse stale) | 2026-08-10 | sí (fast-forward `7d5c4910`) |
| [059](059-kv-counter-integrity.md) | Superficializar fallos KV de contadores: `console.error` en `ingestEvent`/`checkRateLimit` (clave truncada sin IP), documentación de la aproximación, 3 tests; auditoría adversarial integrada (regla CDN `/uf-hoy/`, log preciso, guard de privacidad, test de sincronía SW↔`_headers`) | 2026-08-10 | sí (fast-forward `1e99a772`) |
| [060](060-uta-honest-fallback.md) | UTA honesta: fallback mindicador → SII diciembre (`parseSiiUtm`) → null + warn al anualizar UTM×12; headers browser-like para SII; guard `value > 0`; auditoría adversarial integrada (verificado contra HTML real del SII) | 2026-08-10 | sí (fast-forward `da9e1ee5`) — deploy del worker pendiente |
| [061](061-calculator-cta-event.md) | Reactivar `article_calculator_cta_click`: onclick inline eliminado (CSP-safe), mapeo `CTA_EVENT_NAMES`, allowlist compartida cliente+worker, regex `INTERNAL_URL` en la frontera de seguridad; auditoría adversarial integrada (8 guards del regex) | 2026-08-10 | sí (fast-forward `9245604a`) — deploy del collector pendiente |
| [062](062-inline-link-spacing-tokenizer.md) | Tokenizer robusto para `<` literales y stacks de exclusión: `(<[a-zA-Z\/!][^<>]*>)|([^<]+)|(.)`; auditoría adversarial integrada (bug vivo confirmado en 54 archivos del dist; 8 guards de regresión) | 2026-08-10 | sí (fast-forward `15b880e2`) |
| [063](063-chile-calendar-tz.md) | Calendario chileno (`America/Santiago`) en fetcher SII y gates de frescura UTM: `calendarPartsInTz`/`chileCalendarParts`/`chileMonthKeyAndDay`; test de frontera verificado OLD stale → NEW grace | 2026-08-10 | sí (fast-forward `5b0f0b46`) — deploy del worker pendiente |
| [064](064-no-fabricated-indicator-dates.md) | No fabricar fecha "hoy": `toRealIsoDate` y `indicatorUpdatedAt` solo con fechas observadas; tipo aflojado (`uf?/utm?/uta?`), `mergePrev` con `?.`; 3 tests nuevos | 2026-08-10 | sí (fast-forward `efd03dcc`) — deploy del worker pendiente |
| [065](065-jsonld-escape.md) | Escapar `<` en JSON-LD: `serializeJsonLd` leaf (`\u003c`) en 29 sitios; guard de input no-stringificable; flake de la suite registrado como TD-0103 | 2026-08-10 | sí (fast-forward `7523c0c3`) |
| [066](066-secret-scan-pr.md) | Scan gitleaks bloqueante por PR (diff-scoped, sin `--stdin` en 8.30.1 — verificado) + quitar allowlist de `.env`; pipeline validado con secreto en `.env` → exit 1 | 2026-08-10 | sí (merge `dccebfb9`) |
| [067](067-seotitle-tests.md) | Presupuesto seoTitle 65 en schema + gate + tests; regla "| Monedario" del plan descartada en mérito (38/41 posts reales la contradecían); guard de sincronía schema↔gate | 2026-08-10 | sí (fast-forward `3f073c99`) |
| [068](068-frontmatter-characterization.md) | Caracterización de check-frontmatter.mjs (9 casos por clase de regla con severidad real); `frontmatter-schema.test.ts` renombrado a `yaml-parser.test.ts`; clase articleAdvisory añadida en auditoría | 2026-08-10 | sí (fast-forward `47414be0`) |
| [069](069-legal-constants-check.md) | Check de consistencia de constantes legales espejadas (4 constantes/16 mirrors, inventario declarativo); auditoría: comentarios `//` filtrados (ocultaban drift), test de integración real | 2026-08-10 | sí (fast-forward `c83ad352`) |

## Planes 004–019 (completados, sin archivo en el árbol)

Los planes 004–019 de la auditoría 2026-06-11 también están **DONE e integrados**
(vía las ramas `advisor/0NN-*` → `advisor/integration-2026-06-15`). Sus archivos
nunca se conservaron en el árbol de trabajo; viven solo en el historial git de sus
ramas. Ver el detalle en `plans/README.md`.
