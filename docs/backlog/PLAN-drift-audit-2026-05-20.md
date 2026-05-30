# Plan: auditoria de drift Monedario 2026-05-20

Estado: Vigente
Fuente: auditoria repo + build local ejecutada entre 2026-05-19 y 2026-05-20.

## Proposito

Documentar y ejecutar la remediacion controlada de los findings de drift detectados en Monedario: inconsistencias entre contenido publicado, codigo, politicas internas, fuentes canonicas, superficies de descubrimiento, paginas legales, datos YMYL, SEO y guardrails.

Este plan es deliberadamente correctivo y preventivo. No autoriza refactors esteticos, sustitucion de criterio editorial por automatizacion ni cambios automaticos en contenido YMYL/legal.

## Alcance

In scope:

- Registrar y resolver los items `TD-0084` a `TD-0094` en `docs/TECH_DEBT_BACKLOG.md`.
- Crear guardrails automaticos para drift mecanico o repetible.
- Abrir revisiones editoriales humanas para contenido YMYL, legal y fuentes oficiales.
- Mantener evidencia de verificacion por cada cierre.

Out of scope:

- Cambios de rutas publicas, RSS, canonical URLs o slugs sin plan especifico y gates dedicados.
- Completar montos, tasas, umbrales o interpretaciones legales por intuicion.
- Activar Google Analytics, cambiar politica de cookies o modificar consentimiento sin decision humana/legal.
- Fusionar articulos por overlap sin decision editorial de ownership.

## Autoridad, invariantes y contratos

- `URL.PUBLIC.NO_POST_ID`: ningun cierre puede derivar URLs publicas desde `post.id`.
- `ROUTES.NO_SILENT_CHANGES`: cualquier cambio de rutas requiere snapshot y explicacion.
- `RSS.NO_REMOVALS`: no remover items RSS como efecto colateral.
- `FRONTMATTER.VALID`: cualquier ajuste editorial debe preservar esquema y frontmatter.
- `CONTRACT.YMYL_RESPONSE_STRUCTURE`: contenido YMYL debe declarar alcance, fecha, fuentes y supuestos cuando corresponda.
- `INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA`: datos sensibles al tiempo requieren revision dentro de SLA editorial.
- `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY`: enlaces externos deben ser tecnicamente validos y semanticamente adecuados.
- `docs/editorial/NORMA_YMYL.md`: prevalece para refrescos de contenido financiero, previsional, tributario, laboral, salud o beneficios estatales.

## Evidencia de auditoria

Checks ejecutados:

- `pnpm run check`: pass. Incluyo `check:no-postid-urls`, `check:frontmatter`, `check:legal-citations`, `check:internal-links`, `check-editorial-timeliness` y `astro check`.
- `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts`: pass; 46 articulos YMYL cumplen estructura de artifacts.
- `pnpm run build`: pass; 282 paginas generadas; `check:urls` local sin fallas bloqueantes.
- `pnpm run check:routes`: pass; no removals, 11 rutas agregadas ya presentes contra snapshot base.
- `pnpm run check:rss`: pass; no removals, 35 additions permitidas.
- `pnpm run check:urls:external:audit`: pass no bloqueante; 2 no OK detectados.
- `pnpm run audit:topic-overlap`: pass no bloqueante; 1 par alto y varios pares medios.
- `pnpm run audit:reader-copy`: pass no bloqueante; 16 warnings.
- `pnpm run check:afp-commissions`: pass; comisiones coinciden con Previred.

Observaciones positivas:

- `CALCULATOR_PORTFOLIO` y paginas reales de calculadoras estan alineados 19/19.
- `GUIDE_HUB_ORDER` y directorios de hubs estan alineados 9/9.
- Footer deriva de `CALCULATOR_FOOTER_SHORTCUTS` y `GUIDE_HUB_ORDER`.
- No se detectaron violaciones de `URL.PUBLIC.NO_POST_ID`.
- No se detectaron rutas/RSS removidos.

## Findings y tickets

### TD-0084 — Claims legales de analytics no cubren capacidad GA/GTM

- Severidad: 4. Urgencia: P1.
- Evidencia: `src/layouts/Layout.astro` inyecta `gtag/js` con `PUBLIC_GA_MEASUREMENT_ID`; `src/scripts/analytics.ts` configura `window.gtag`; `public/_headers` permite Google Analytics/Tag Manager; `src/pages/privacidad.astro` y `src/pages/cookies.astro` describen Cloudflare-only.
- Riesgo: una variable de entorno podria activar transferencia a Google sin que paginas legales, consentimiento y politica de cookies lo cubran.
- Cierre esperado: decision explicita Cloudflare-only o GA permitido con actualizacion legal/consentimiento; guardrail `check:legal-privacy-claims`.

### TD-0085 — Placeholder YMYL visible en Fonasa vs Isapre

- Severidad: 4. Urgencia: P1.
- Evidencia: `src/data/blog/fonasa-vs-isapre-comparativa.md` contiene `[umbral vigente]` en tabla de comparacion.
- Riesgo: contenido de salud/finanzas muestra un dato ausente en una decision sensible.
- Cierre esperado: refresh editorial con fuente oficial vigente y fecha; guardrail que bloquee placeholders editoriales publicados.

### TD-0086 — PGU delega monto vigente sin registrar dato central

- Severidad: 4. Urgencia: P1.
- Evidencia: `src/data/blog/pgu-pension-garantizada-universal.md` instruye verificar monto vigente en IPS en vez de registrar monto, fecha y fuente.
- Riesgo: beneficio estatal YMYL sin dato central verificable dentro de la pagina.
- Cierre esperado: revision editorial con monto vigente, `validAsOf`, fuente oficial y nota de reajuste.

### TD-0087 — Registro de datos economicos no alinea fuente primaria con ADR/Worker

- **Cerrado 2026-05-30.** Modelo de emisor canónico: registry migrado a `canonicalSource`/`fallbackSources` (UF/USD→BCCh, IPC→INE, UTM/UTA→SII, topes→SP), `refresh-editorial-volatile-data.mjs` emite la fuente canónica, nuevo `check:economic-source-consistency` en `pnpm run check`, y citas UI UF/dólar corregidas. mindicador.cl queda como fallback. Ver nota de cierre en `docs/TECH_DEBT_BACKLOG.md`.
- Severidad: 3. Urgencia: P2.
- Evidencia: `docs/adr/ADR-20260516-economic-snapshot-cloudflare-worker.md` define BCCh/INE como fuentes primarias para UF/USD/IPC; `src/config/editorial-volatile-data-registry.json` y `scripts/refresh-editorial-volatile-data.mjs` siguen emitiendo `mindicador.cl/api` como fuente principal en varios derivados.
- Riesgo: el sitio puede mostrar una fuente tecnica heredada en vez de la fuente oficial/canonica.
- Cierre esperado: fuente canonica unica por indicador y check `check:economic-source-consistency`.

### TD-0088 — Breadcrumbs dependen de `tagHubMap` manual incompleto

- **Cerrado 2026-05-30.** Helper canónico `getHubFromCluster` (clusters.ts) derivado de `GUIDE_HUBS`; `Breadcrumb.astro` prefiere hub por cluster (tagHubMap = fallback); se eliminó el mapa divergente `clusterHubNames` de `PostDetails.astro`; nuevo `check:catalog-drift` valida 49/49 posts → hub real. PGU ahora muestra `Inicio > Pensiones y AFP > …`. Ver nota de cierre en `docs/TECH_DEBT_BACKLOG.md`.
- Severidad: 3. Urgencia: P2.
- Evidencia: `src/components/Breadcrumb.astro` usa `tagHubMap`; `pgu-pension-garantizada-universal` tiene cluster pensiones pero no tag mapeado, por lo que el breadcrumb generado cae en `Articulos`.
- Riesgo: jerarquia SEO y descubrimiento interno divergen de `cluster`/hub canonico.
- Cierre esperado: derivar desde `cluster`/`canonicalTopic` o validar toda pagina clusterizada contra breadcrumb.

### TD-0089 — Home contiene tarjetas y fechas manuales con riesgo de frescura falsa

- Severidad: 3. Urgencia: P2.
- Evidencia: `src/components/ProblemCards.astro` declara fechas manuales y valores fijos como `2026-01-15` para superficies no derivadas.
- Riesgo: la home puede comunicar frescura que no coincide con calculadoras, hubs o contenido enlazado.
- Cierre esperado: derivar fechas o crear `check:homepage-surface-freshness`.

### TD-0090 — Header duplica manualmente el catalogo de hubs

- Severidad: 2. Urgencia: P3.
- Evidencia: `src/components/Header.astro` hardcodea `guiasDropdown`; `src/config/clusters.ts` ya declara `GUIDE_HUB_ORDER` y `GUIDE_HUBS`. Hoy coinciden 9/9, pero no existe guardrail.
- Riesgo: proximo hub puede quedar fuera de navegacion principal.
- Cierre esperado: generar dropdown desde `GUIDE_HUB_ORDER` o validar equivalencia en CI.

### TD-0091 — Enlaces externos con fallas o redirects semanticos

- Severidad: 3. Urgencia: P2.
- Evidencia: `check:urls:external:audit` detecto 404 en el enlace GitHub del reporte de accesibilidad y redirect mismatch `www.supersalud.gob.cl` -> `www.superdesalud.gob.cl`.
- Riesgo: perdida de confianza y fuentes oficiales menos precisas.
- Cierre esperado: verificar destino oficial/permanente, corregir URLs y agregar `check:external-semantic-official-hosts`.

### TD-0092 — Overlap editorial con riesgo de canibalizacion

- Severidad: 3. Urgencia: P2.
- Evidencia: `audit:topic-overlap` marco overlap alto entre inversion general 2026 y ETFs desde Chile; pares medios en operacion renta, seguro de cesantia, sueldo/descuentos, UF/IPC.
- Riesgo: multiples paginas compiten por misma intencion sin ownership claro.
- Cierre esperado: decision editorial de owner, soporte, enlaces jerarquicos y umbrales CI.

### TD-0093 — Meta descriptions largas no bloqueantes

- Severidad: 2. Urgencia: P3.
- Evidencia: `check-editorial-structure` reporto 13 meta descriptions sobre 155 caracteres.
- Riesgo: degradacion menor de snippets y consistencia editorial.
- Cierre esperado: batch editorial acotado o presupuesto gradual; no bloquear cambios no relacionados hasta decidir politica.

### TD-0094 — Taxonomia de fuentes oficiales dispersa e incompleta

- Severidad: 3. Urgencia: P2.
- Evidencia: hosts oficiales viven en `scripts/legal-citations/registry.mjs`, `scripts/urlcheck/host-registry.mjs` y `src/utils/analytics.ts`. La lista de analytics no cubre todos los hosts usados como oficiales o semi-oficiales en contenido reciente.
- Riesgo: medicion, validacion legal-citation y urlcheck pueden discrepar sobre que cuenta como fuente oficial.
- Cierre esperado: registro canonico de official hosts usado por analytics, legal citations y external link checks.

## Orden recomendado

1. `TD-0084`, `TD-0085`, `TD-0086`: requieren decision humana/legal/editorial antes de tocar contenido o configuracion.
2. `TD-0091`: corregir 404/redirects tras verificar destino oficial.
3. `TD-0088`, `TD-0090`: cerrar drift mecanico de navegacion y breadcrumbs.
4. `TD-0087`, `TD-0094`: unificar fuentes canonicas y hosts oficiales.
5. `TD-0089`: derivar o validar home problem cards.
6. `TD-0092`: ownership editorial de canibalizacion.
7. `TD-0093`: limpieza editorial de baja urgencia.

## Guardrails a implementar

- `check:legal-privacy-claims`: compara paginas legales contra scripts externos, CSP, env vars publicas, storage keys y terceros.
- `check:ymyl-freshness-claims`: detecta placeholders, anos vigentes, UF/UTM/AFP/PGU/AFC, montos y porcentajes sin fecha/fuente.
- `check:economic-source-consistency`: valida Worker, ADR, snapshot, registry y UI para fuente primaria por indicador.
- `check:catalog-drift`: compara hubs, calculadoras, header, footer, home, breadcrumbs y rutas reales.
- `check:homepage-surface-freshness`: impide fechas manuales obsoletas en superficies de descubrimiento.
- `check:external-semantic-official-hosts`: eleva 404, redirect mismatch y hosts oficiales migrados.
- `check:topic-ownership-drift`: convierte overlaps altos sin owner en fallo o warning accionable.
- `check:meta-description-budget`: presupuesto configurable para meta descriptions largas.

## No hacer

- No activar GA/GTM ni modificar texto legal sin revision humana.
- No completar montos PGU, umbrales Fonasa, impuestos, AFP, UF/UTM ni topes por inferencia.
- No cambiar rutas, RSS, canonical, slugs o estructura publica sin gates completos.
- No fusionar articulos por overlap automaticamente.
- No marcar gates editoriales humanos como aprobados por agente.

## Verificacion requerida para cerrar el plan

- Cada TD asociado queda `Completado`, `Bloqueado` con razon vigente o transferido a decision editorial documentada.
- `pnpm run check`, `pnpm run build`, `pnpm run check:routes`, `pnpm run check:rss` pasan tras remediaciones tecnicas.
- Para contenido YMYL/legal, existe evidencia de revision humana y fuentes oficiales.
- No hay cambios silenciosos de URL, RSS, canonical ni frontmatter.
