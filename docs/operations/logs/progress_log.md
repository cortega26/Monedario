# Monedario Progress Log

Backlog completions recorded below.

## Logging Rules

- Add one entry per completed backlog task.
- Always reference the backlog task ID exactly as written in `docs/development/backlog.md`.
- If a task is partially advanced but not finished, update its status in `docs/development/backlog.md` instead of adding a completion entry here.
- Record measurable impact only when there is observable evidence.

2026-04-11
MB-019
Cluster navigation fortalecida: 9 hubs con StartHere, 8 con calculadora enlazada (seguridad-financiera sin calculadora en portfolio — TODO comment added), CTA primario en 4 artículos refresh (ArticleDecisionIntro con calculatorHref + nextStepHref activo en boleta-honorarios, sueldo-liquido, finiquito, seguro-cesantia). Breadcrumb auto-generado desde URL en los 9 hubs.
Observed impact: pathway discovery → herramienta en 1-2 clics desde cada hub; estructura StartHere consistente en los 9 clusters.

2026-04-11
MB-020
Cadencia de refresh definida en docs/operations/runbooks/content-refresh-cadence.md.
Observed impact: 9 clusters con frecuencia y fuentes documentadas; 5 triggers de refresh obligatorio identificados (tasas AFP, UF/UTM, legislación, retención honorarios, Operación Renta) con fuentes oficiales enlazadas.


## Entry Template

```md
YYYY-MM-DD
MB-###
Short description of result
Observed impact (if any)
```

## Entries

2026-03-08
MB-001
Baseline snapshot documented from the public sitemap, live crawl, and repository-visible configuration.
Observed impact: 166 submitted URLs inventoried; search KPI fields remain unavailable pending search-platform access.

2026-03-08
MB-025
Full technical SEO crawl completed with prioritized findings across sitemap hygiene, metadata, canonical rendering, and broken links.
Observed impact: 166 live sitemap URLs crawled; 81 low-value sitemap URLs, 88 duplicate descriptions, 11 broken external targets, and 1 broken internal-link pattern identified.

2026-03-08
MB-027
Structured data audit completed across homepage, articles, calculators, glossary, legal explainers, and guide hubs.
Observed impact: 27 article pages found with duplicate BlogPosting output; 32 key non-article URLs reviewed with only generic WebSite schema.

2026-03-08
MB-007
Canonical, Open Graph, Twitter, and template metadata outputs were normalized so article identity fields render as absolute URLs and archive/tag/search descriptions no longer default to the same generic snippet.
Observed impact: sample article build output now emits absolute canonical, `og:url`, and `twitter:url`; low-value listing templates now ship differentiated metadata.

2026-03-08
MB-008
Explicit noindex and sitemap-exclusion policy was implemented for `/search/`, `/tags/`, tag detail pages, and paginated post archives beyond page 1.
Observed impact: build sitemap excludes `/search/`, `/tags/`, `/tags/**`, and `/posts/2+/`; affected templates now emit `noindex,follow`.

2026-03-08
MB-029
Broken official-source links from Sprint 1A were replaced with live official equivalents, and the article share-widget mail link that triggered the `/cdn-cgi/l/email-protection` broken-link pattern was removed.
Observed impact: external audit no longer reports official-source 404s; remaining non-blocking external failures are host-side responses (`pdichile.cl` 403 and LinkedIn 999).

2026-03-08
MB-030
Duplicate article `BlogPosting` schema was removed, article/schema URL fields were normalized to absolute values, and breadcrumb/DefinedTerm schema coverage was extended across supported glossary, calculator, and hub templates.
Observed impact: sampled article build output now contains exactly one `BlogPosting` and one `BreadcrumbList`; glossary detail pages emit `DefinedTerm`.

2026-03-08
MB-004
Keyword universe and keyword-to-URL map completed for Monedario's priority Chile finance clusters, with current URL ownership, gaps, and cannibalization risks documented.
Observed impact: semantic coverage is now mapped across sueldo, AFP/APV, deuda, cesantia, UF/IPC, impuestos, and presupuesto using the cleaned post/calculator/guide inventory.

2026-03-08
MB-028
Live SERP intent analysis completed for priority clusters, including dominant page types, calculator viability, official-source pressure, and explicit architectural decisions per cluster.
Observed impact: the next sprint can now prioritize sueldo liquido/remuneraciones first and avoid broad cluster builds where official results dominate or intent is structurally split.

2026-03-08
MB-031
Founder-confirmed manual ownership verification for Google Search Console and Bing Webmaster was recorded as satisfying the prerequisite-validation step; remaining agent-side authenticated access needs were split into a separate follow-up.
Observed impact: stale blocker logic was removed from the backlog, allowing MB-002 to move out of prerequisite blockage without falsely claiming direct platform access in this environment.

2026-03-08
MB-033
Canonical cluster taxonomy and hub URL strategy were resolved by preserving the `/guias/<cluster>/` pattern, creating the dedicated `sueldo-remuneraciones` cluster, and separating it from `empleo-ingresos` and `pensiones-afp`.
Observed impact: new sueldo/remuneraciones hub shipped without changing the public guide URL strategy or violating the slug-based URL invariant.

2026-03-08
MB-009
The first production cluster was built around sueldo líquido/remuneraciones with a live hub, connected calculator path, supporting salary articles, and contextual glossary/legal support.
Observed impact: `/guias/sueldo-remuneraciones/` now provides a coherent navigation path from explanation to calculation to support assets.

2026-03-08
MB-016
Reusable article-to-calculator modules were implemented for sueldo/remuneraciones pages and connected to the live sueldo líquido calculator.
Observed impact: the sueldo article surfaces now expose structured calculator CTAs instead of relying only on inline links.

2026-03-08
MB-017
Reusable glossary/legal support blocks were implemented for sueldo/remuneraciones pages using glossary and legal explainer assets already published in the repository.
Observed impact: sueldo-cluster pages now route readers to AFP/AFC definitions and payroll-relevant legal explainers without adding noisy sitewide blocks.

2026-03-08
MB-034
Dedicated descuentos de sueldo satellite published and connected to the sueldo hub, calculator, pilar guide, liquidación explainer, and glossary/legal support assets.
Observed impact: the sueldo cluster now answers the broader `descuentos sueldo` intent without forcing readers through an AFP-only article.

2026-03-08
MB-035
Dedicated liquidación de sueldo explainer published with field-by-field reading guidance and wired into the sueldo hub, calculator, and related salary articles.
Observed impact: the sueldo cluster now covers the document-reading intent directly instead of treating liquidación only as a subsection inside the pilar guide.

2026-03-08
MB-032
Reusable authenticated automation was restored through the dedicated search-platform profile and a saved authenticated storage-state file that reopened both Google Search Console and Bing Webmaster in a fresh session.
Observed impact: a fresh browser session reached `sc-domain:monedario.cl` in Google Search Console and `https://monedario.cl/` in Bing Webmaster without manual re-login.

2026-03-08
MB-036
Google Search Console validation was executed for `sc-domain:monedario.cl` and `https://monedario.cl/sitemap-index.xml` was submitted from the authenticated Sitemaps screen.
Observed impact: Search Console now lists `https://monedario.cl/sitemap-index.xml` as submitted on `8 mar 2026`; indexation reports are still processing and the sitemap row currently shows `No se ha podido obtener`.

2026-03-08
MB-037
Bing Webmaster validation was executed for `https://monedario.cl/` and `https://monedario.cl/sitemap-index.xml` was submitted from the authenticated Sitemaps screen.
Observed impact: Bing Webmaster now lists `https://monedario.cl/sitemap-index.xml` as submitted on `3/8/2026` with status `Processing`.

2026-03-08
MB-002
The search-platform umbrella closed after the reusable authenticated automation path was restored and both Google Search Console and Bing Webmaster execution tasks were completed with real dashboard access.
Observed impact: both search platforms now have authenticated execution evidence and a submitted Monedario sitemap entry.

2026-03-09
MB-006
Homepage entry flow was restructured around problem-based paths and the final homepage-only performance recovery pass removed Astro view-transition runtime from `/`.
Observed impact: binding Lighthouse mobile rerun improved homepage metrics from Performance `99` / LCP `1.8s` / Speed Index `1.5s` to Performance `100` / LCP `1.2s` / Speed Index `0.8s`, while request count dropped from `5` to `4`.

2026-03-08
MB-005
Homepage metadata and hero positioning rewrite closed after a homepage-only font/LCP cleanup removed the remaining display-font dependency from the mobile render path.
Observed impact: binding local mobile Lighthouse now passes at Performance 100, LCP 1.5s, Speed Index 0.9s, CLS 0, and TBT 0ms.

2026-03-09
MB-003
Optional GA4-ready analytics instrumentation was added for article scroll depth, official-source outbound clicks, calculator starts/completions, and primary CTA clicks across homepage, article, and calculator journeys.
Observed impact: build now ships a dedicated analytics client bundle, 10 calculator detail pages emit start/completion hooks, and all required repo validation gates passed with no route removals or internal-link regressions.

2026-03-09
MB-026
Canonical internal-link architecture mapping was documented for the live and future Phase 2 clusters, including hub ownership, article/tool/support inventories, cross-cluster exits, and unresolved taxonomy splits that must constrain later hub work.
Observed impact: the repo now has one source-of-truth map for sueldo, pensiones/APV, deuda, cesantia, UF/costo de vida, impuestos, and presupuesto linking patterns, which narrows the next hub sprint to `MB-010` without widening runtime scope.

2026-04-10
MB-015
Hub /guias/presupuesto-control-financiero/ creado con artículo pilar (como-hacer-presupuesto-mensual-chile) y calculadora de sueldo líquido. Artículo pilar actualizado para enlazar al hub padre. Hub agregado al dropdown de Guías en navegación global (Header.astro).
Observed impact: cluster presupuesto ahora es navegable desde el sitio; condición de migración de placement transitional satisfecha.

2026-04-10
MB-018
Refresh batch: boleta-honorarios-2026-retencion-cobertura, como-calcular-sueldo-liquido, finiquito-e-indemnizaciones-en-chile, seguro-de-cesantia. operacion-renta-f22-checklist confirmado actualizado (updatedDate 2026-04-04, 5 FAQs). Corrección material: comisión Capital AFP en ejemplo de como-calcular-sueldo-liquido (1,44% → 0,58%, recálculo de tabla). updatedDate y validAsOf de 4 artículos actualizados a 2026-04-10.
Observed impact: 4 artículos actualizados con cifras 2026 verificadas. Registro de revisiones en docs/development/BACKLOG_EDITORIAL.md.

2026-04-10
SPRINT Phase2-A
MB-015, MB-018, SA-014, SA-015 completados.
Observed impact: hub presupuesto navegable, refresh de 4 artículos con cifras 2026 y validación de FAQs, ownership UX visible en artículos support (bloque "Guía de referencia" en PostDetails.astro), microcopy de las tres superficies de soporte (/tags/, /glosario/, /buscar/) actualizado con propósito explícito.

2026-06-28
OBS-01 — Verificación de deploy y primer export semanal (W26)
Site deploy verificado: `data-analytics-transport="enabled"` confirmado en producción (https://monedario.cl/). Pipeline end-to-end validado: 12 eventos sintéticos enviados al worker → 202 Accepted → confirmados en KV vía REST API. Primer export semanal generado manualmente (cron mañana 07:57 UTC): `output/operations/data-signals/analytics/2026-W26.json` con 33 filas, 34 eventos totales, 10 tipos de evento, 13 slugs de calculadora. Schema validado: `schemaVersion=1`, `source="first-party-events"`, counts ≥ 0, enums correctos, 0 PII. KV confirmado con 33 contadores para 2026-06-28 (días 22-27 sin datos — baseline de 1 día).
Observed impact: worker recibe tráfico real de usuarias (calculadoras UF, IPC, crédito-consumo, seguro-cesantia, conversor-UTM, operación-renta). Funnel visible: views → starts → completes para UF (1→2→1) e IPC (1→1→1). Eventos de engagement: NBS shown/click, official_source_click (bcentral.cl, sii.cl), share_result_click (whatsapp). Scorecard pendiente de GSC data para W26 (workflow `weekly-search-ops.yml`). W26 es baseline inicial con 1 día de datos; W27 será la primera semana completa para evaluación formal.

2026-06-28
OBS-01 — Scorecard W26 ejecutado con datos first-party + GSC
GSC W26 obtenido vía `gsc-fetch.mjs`: 2259 queries, 104 pages, 2268 query-page, 180 clicks totales, 36053 impresiones. Scorecard generado con `build-weekly-search-report.mjs --input output/operations/weekly-search-performance/2026-W26`: fuentes diferenciadas (GSC JSON + first-party analytics JSON), 13 calculadoras con datos de funnel, watchlist estratégica actualizada con 20 assets. First-party: 5 views · 8 starts · 7 completes · 2 errors · 2 shares · 3 NBS shown · 2 NBS clicks · 1 support click · 2 official source clicks · 2 resume clicks. Top queries GSC: "utm a peso" (2 clicks, 1874 impresiones, pos 8.7), "utm a peso chileno" (2 clicks, 1573 impresiones, pos 8.0). 4 calculadoras candidatas a refresh (sueldo-liquido, APV, conversor-UF, credito-consumo) con impresiones en posición 4-15 y CTR débil. R2 export automático pendiente: cron dispara lunes 29-jun 07:57 UTC (~11h from now). Comparación R2 vs manual se ejecutará tras el disparo del cron.
Observed impact: primer scorecard híbrido GSC + first-party completado.

2026-06-28
SEC-003 — Verificación de exposición histórica de .env
Verificación ejecutada: `git log --diff-filter=A --all -- .env .env.local .env.*`. Resultado: `.env` y `.env.local` nunca fueron commiteados. `.env.example` contiene solo valores públicos (TPI_ECONOMIC_PROVIDER_MODE=snapshot, placeholders comentados). `.gitignore` bloquea `.env`, `.env.local`, `.env.production`. Sin exposición histórica — no se requiere rotación de credenciales ni BFG.
Observed impact: SEC-003 cerrado. Los 8 hallazgos restantes del OWASP audit (SEC-001, SEC-002, SEC-004..SEC-009) quedan liberados de bloqueo. El orden de ejecución recomendado ahora empieza en SEC-002 (security headers).

2026-06-28
SEC-001 + SEC-002 — Security headers e IDs Cloudflare
SEC-002 (security headers): ya implementado en `public/_headers` — CSP con hashes sha256 (Astro build), X-Frame-Options DENY, X-Content-Type-Options nosniff, HSTS max-age=31536000 preload, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy restrictiva. SEC-001 (Cloudflare IDs): `cloudflare-fetch.mjs` ya usaba `getRequiredEnv()` para los 3 valores; `fetch-analytics-export.mjs` tenía fallback hardcodeado `?? "7e153214690ac7430fde021f1f2b2916"` → eliminado, ahora requiere `CLOUDFLARE_ACCOUNT_ID` vía `getRequiredEnv()`. Barrido final: 0 IDs hardcodeados en el repo.
Observed impact: 2 hallazgos 🔴CRITICAL cerrados en 5 min. SEC-003 ya cerrado antes. Quedan 6 hallazgos (SEC-004..SEC-009), todos 🟠HIGH o 🟡MEDIUM. Próximo: backlog de alineamiento editorial o calculadoras (plan de crecimiento).

2026-06-28
SEC-006 — Validación de formato OPENAI_API_KEY
Dos archivos corregidos: `generate-images.mjs` (guard `!apiKey.startsWith("sk-")` tras verificación de existencia) y `pipeline.mjs` (validación extraída antes de instanciar `new OpenAI()`). Ambos fallan temprano con mensaje claro si la key no tiene el prefijo esperado.
Observed impact: 4/9 hallazgos OWASP cerrados. Quedan SEC-005 (SW versionado), SEC-007 (sanitización PII search_term), SEC-008 (validación dominio canonical), SEC-009 (restricción OG image).

2026-06-28
OWASP batch final — SEC-005, SEC-007, SEC-008, SEC-009
SEC-005: ya implementado con integración Astro `sw-version.ts` que inyecta `GITHUB_SHA` (CI) o `Date.now().toString(36)` (local) en el SW cache key. SEC-007: función `sanitizeSearchTerm()` en `buscar.astro` que reemplaza RUT→[RUT], email→[email], tel→[tel] en los 3 puntos de emisión de analytics. SEC-008: `refine()` de dominio en `content.config.ts` — canonical solo acepta `monedario.cl`. SEC-009: allowlist `ALLOWED_OG_IMAGE_DOMAINS` en `PostDetails.astro` — URLs remotas no permitidas caen al fallback con `console.warn`. `astro check`: 0 errors, 0 warnings, 0 hints.
Observed impact: OWASP audit cerrado (8/9 implementados, SEC-004 en monitoreo preventivo). 3🔴CRITICAL, 2🟠HIGH, 3🟡MEDIUM resueltos en ~25 min acumulados. Funnel visible con tasas por calculadora (start rate, completion rate, error rate, NBS CTR). W26 confirma baseline de 1 día de datos first-party (solo 28-jun); W27 (30-jun a 05-jul) será la primera semana completa para evaluación formal con significancia estadística. Deltas GSC en 0 porque W26 es la primera semana con JSON de analytics first-party y la comparación inter-semanal requiere datos de dos semanas completas en el nuevo formato.

2026-06-30
OBS-01 — Verificación de export automático R2 (W26): export ausente en R2
Verificación ejecutada tras el disparo del cron del worker `analytics-collector` (lunes 2026-06-29 07:57 UTC). `node scripts/data-signals/fetch-analytics-export.mjs --week=2026-W26` devuelve "Export not yet available in R2 for 2026-W26" (HTTP 404 en `analytics-exports/2026-W26.json`). Diagnóstico vía REST API: el bucket `monedario-analytics-exports` existe (creado 2026-06-28T17:30 UTC) pero está **vacío** — 0 objetos con y sin prefijo `analytics-exports/`. El export automático no se persistió en R2. Nota operativa: el comando de la tarea programada solo exportaba `CLOUDFLARE_API_TOKEN`, pero el script ahora también requiere `CLOUDFLARE_ACCOUNT_ID` (fallback hardcodeado eliminado en SEC-001); ambas vars deben exportarse desde `.env.local`. El paso de comparación automático-vs-manual no pudo ejecutarse por ausencia del artefacto automático; el export manual `output/operations/data-signals/analytics/2026-W26.json` (33 filas, 34 eventos) sigue siendo el único artefacto válido para W26.
Observed impact: confirmado que el worker `analytics-collector` no escribió el export semanal en R2 para W26 pese al disparo del cron. Requiere investigar el binding R2 del worker, el handler del cron y/o sus logs (`wrangler tail`) antes de confiar en el export automático. Hasta resolverlo, el scorecard semanal depende del export manual. Comparación automático-vs-manual reagendable una vez que el worker persista un objeto en R2.

2026-06-30
OBS-01 — Diagnóstico de causa raíz + comparación automático-vs-manual (W26)
Diagnóstico (solo lectura): el worker `monedario-analytics-collector` SÍ está desplegado (último deploy 2026-06-28 19:07 UTC) y el cron `57 7 * * 1` SÍ está registrado (Cloudflare API). Bindings correctos (R2 `ANALYTICS_EXPORTS`→`monedario-analytics-exports`, KV `ANALYTICS_TELEMETRY`). Handler `scheduled` correcto: para el disparo del lun 2026-06-29 07:57 UTC, `previousCompleteISOWeekInTz()` resuelve a W26 (ventana 2026-06-22→28); la KV conserva 92 contadores (40 en la ventana W26) y la validación pasaría (los 10 event_name están en `EVENT_ALLOWLIST`). Es decir: si el cron hubiera ejecutado el handler completo, habría escrito a R2. Causa raíz NO determinada entre (A) el scheduled trigger no se ejecutó —probable: fue el primer lunes ~13 h tras desplegar el cron— y (B) ejecutó sin escribir —improbable: validación pasa y GraphQL `workersInvocationsAdaptive` muestra 0 errores. No se pudo distinguir A/B porque el `CLOUDFLARE_API_TOKEN` carece de scope Observability:Read (la query de logs devolvió Authentication error). Prueba vía `wrangler dev` descartada: la v4.105 solo ofrece `--remote` (recursos prod, pero `/__scheduled` da 404) o `--local` (`/__scheduled` ok, pero recursos locales vacíos); no hay remote-bindings + scheduled juntos. Comparación (paso 3 OBS-01) ejecutada reconstruyendo el artefacto automático con las PROPIAS funciones exportadas del worker (`aggregateWindow`, `isoWeekToDateRangeUTC`, `buildExportArtifact`, `validateExportArtifact`) sobre la KV de producción (REST): 40 filas, 60 eventos, 10 tipos. Veredicto: **el automático es superset estricto del manual** (33 filas/34 eventos) — 0 filas del manual ausentes, 0 con conteo menor; 7 filas nuevas + 2 con mayor conteo, todas del 2026-06-28 (eventos llegados tras el snapshot manual de las 16:22). Metadata idéntica (week, window, source, schemaVersion=1).
Observed impact: paso 3 de OBS-01 satisfecho (automático ⊇ manual). Backfill del objeto W26 a R2 NO ejecutado: bloqueado por el clasificador de permisos del harness (escritura a storage de producción requiere regla de permiso explícita, no autorización verbal). Hallazgos de deuda para backlog: (1) el endpoint manual `GET /api/analytics/export?secret=...` documentado en `wrangler.toml` NO existe en el código desplegado (el handler `fetch` solo acepta POST de eventos) → no hay forma de re-disparar el export por HTTP si el cron falla; (2) el export no es parametrizable por semana → sin capacidad de backfill nativa. Recomendaciones: dar a un token Cloudflare el scope Observability:Read para diagnosticar el cron del próximo lunes; implementar el endpoint manual + parámetro de semana; monitorear el cron del 2026-07-06 (W27).

2026-06-30
OBS-01 — Causa raíz CONFIRMADA vía logs de observabilidad: el cron no disparó
Tras añadir al token el scope Workers Observability:Read, query a `/workers/observability/telemetry/query` filtrando `$metadata.service = monedario-analytics-collector` en la ventana 2026-06-29→30 (cubre las 07:57 UTC del lunes): 30 eventos capturados, **los 30 son invocaciones `fetch`** (POST de eventos), **0 invocaciones `scheduled`/cron**, **0 líneas `[analytics-export]`** (el handler scheduled siempre loguea `[analytics-export] week=...` como primera línea). Span de eventos capturados: 2026-06-29T04:28 → 2026-06-30T16:25. Conclusión: el handler `scheduled` **nunca se ejecutó** el lunes → **hipótesis A confirmada, B descartada**: no es bug de validación ni de escritura, el cron simplemente no disparó. Patrón probable: el cron `57 7 * * 1` se registró/desplegó el dom 2026-06-28 ~18:05–19:07 UTC y Cloudflare se saltó la PRIMERA ocurrencia del cron recién creado (~13 h después).
Observed impact: causa raíz cerrada. El código/config del worker son correctos; el fallo fue de scheduling en la primera ocurrencia. Acción: monitorear el cron del lun 2026-07-06 07:57 UTC (W27) con los logs de observabilidad ya accesibles; si tampoco dispara, escalar (redeploy / soporte Cloudflare) porque dejaría de ser un evento de primera-ocurrencia. Deuda de resiliencia sigue vigente: implementar endpoint manual de export + parámetro de semana para poder re-disparar/backfillear sin depender del cron.

2026-06-30
OBS-01 — Backfill W26 a R2 ejecutado y verificación end-to-end
Con aprobación puntual del usuario (permiso interactivo, sin regla permanente) se escribió a R2 el artefacto W26 reconstruido con las funciones del worker: `analytics-exports/2026-W26.json` (6876 bytes, 40 filas, 60 eventos, 10 tipos). Verificación independiente: objeto descargado de R2 con metadata correcta (week=2026-W26, source=first-party-events, schemaVersion=1, window 2026-06-22→28) y confirmado superset del export manual previo (0 filas faltantes, 0 conteos menores). Prueba end-to-end del consumidor oficial: `node scripts/data-signals/fetch-analytics-export.mjs --week=2026-W26` ahora devuelve HTTP 200 (antes 404), valida 40 filas y reescribe `output/operations/data-signals/analytics/2026-W26.json` con la versión de R2 (superset; pasó de 33 a 40 filas — el artefacto versionado quedó modificado y debe commitearse). Seguimiento del cron W27 programado para 2026-07-06 (tarea `2c128ad2`). Plan de resiliencia abierto: `docs/backlog/PLAN-analytics-export-manual-trigger-2026-06-30.md`.
Observed impact: OBS-01 cerrado end-to-end para W26 — R2 poblado, consumidor funcionando, dato consolidado como superset. Único remanente es la verificación automática del cron del próximo lunes (W27) y la deuda de resiliencia (endpoint manual).

2026-07-07
OBS-01 — Endpoint manual de export analytics implementado y verificado
Plan `docs/backlog/PLAN-analytics-export-manual-trigger-2026-06-30.md` cerrado. El worker `monedario-analytics-collector` ahora expone `GET /api/analytics/export?secret=&week=YYYY-Www`, protegido por `EXPORT_SECRET`, con comparación en tiempo constante, validación de semana, rate limit y respuesta limitada a metadatos (`week`, `window`, `rows`, `totalEvents`). `scheduled()` y el endpoint manual reutilizan `runExport(env, week)`, que lista solo los prefijos KV de la semana solicitada y lee contadores en lotes de 50 antes de validar y escribir `analytics-exports/YYYY-Www.json` en R2. `EXPORT_SECRET` quedó cargado en Cloudflare y guardado localmente en `.env.local` gitignored. Tras agregar `Zone → Workers Routes → Edit` al token, `wrangler deploy` completó limpio y publicó worker, ruta `monedario.cl/api/analytics/*` y cron; Version ID `ad553162-1c7e-47c4-97b7-256db7ac3ecf`.
Observed impact: backfill/re-disparo ya no depende del cron ni del script local de reconstrucción. Verificación real: `workers.dev` W26 respondió 200 con 40 filas/60 eventos; `monedario.cl/api/analytics/export` W27 respondió 200 con 218 filas/1.577 eventos; `fetch-analytics-export.mjs --week=2026-W26` y `--week=2026-W27` descargaron desde R2 y validaron schema. Gates focalizados: worker tests 49/49, worker TypeScript OK, Prettier focalizado OK.

2026-07-07
OBS-01 — W27 primera semana completa y corrección de `calculator_view`
Se generaron las señales W27 del plan de crecimiento liderado por calculadoras: GSC (`2026-W27-queries/pages/query-page/sitemaps.json`) con 497 clicks y 82.740 impresiones; Cloudflare (`2026-W27-traffic/rum.json`) con 16.383 pageviews, 64.390 requests, cache 23,6%, 19 rutas RUM válidas y 6 rutas ajenas descartadas; analytics first-party (`2026-W27.json`) con 218 filas y 1.577 eventos. Scorecard W27 generado en `output/operations/weekly-search-performance/2026-W27/weekly-search-scorecard.md`. Cohorte prioritaria: seguro-cesantia 125 clicks / 1.672 impressions / 112 starts / 186 completes; operacion-renta 15 / 197 / 12 / 16 y NBS 1/1; prepago-credito 24 / 207 / 31 / 100; credito-consumo 7 / 312 / 6 / 19.
Observed impact: W27 es baseline parcial útil para GSC, RUM, starts, completes y NBS, pero no permite evaluar start rate porque `calculator_view` fue 0 en el artefacto. Se corrigió la instrumentación en `src/scripts/analytics.ts`: ahora cada página de calculadora emite un `calculator_view` por carga con bandera DOM anti-duplicado. Test agregado: `tests/integration/analytics-script.test.ts`. Gates: focal analytics 58 tests, `pnpm run test` 122 files/1001 tests, `pnpm run check`, `pnpm run build`, `check:boundaries`, `check:docs`, `git diff --check` pasan. Decisión: no iniciar PR-03 ni cambiar journeys hasta tener una semana completa posterior al deploy del fix de `calculator_view`.
