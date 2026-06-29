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
