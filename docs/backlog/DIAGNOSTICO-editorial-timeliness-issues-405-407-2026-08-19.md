# Diagnóstico: estado editorial/CI de main — issues #405 y #407

- Fecha del diagnóstico: 2026-08-19
- Base verificada: `main` @ `352395b5` (2026-08-19)
- Modo: READ-ONLY (sin modificaciones, sin commits, sin PRs, sin cierres de issues)
- Reproducción local: `pnpm run check:editorial-timeliness`, `pnpm run check:ci` (mirror), gates estrictos con `EDITORIAL_ENFORCE=1`/`EDITORIAL_SCOPE=all`, `check-economic-snapshot-freshness`

## Contexto

- Issue #405 (abierto): "CI: scheduled gate failing on main" — creado 2026-08-10 por el run scheduled `31358865799`.
- Issue #407 (abierto): "Editorial timeliness audit: stale review window" — creado 2026-08-10 listando 4 slugs.
- PR #427 (merged 2026-08-19): el check:ci local falló únicamente por editorial-timeliness, señalando `impuesto-global-complementario-chile.md` con SLA vencido 2026-08-12.

## 1. Artículos stale hoy (2026-08-19)

**1 solo:** `impuesto-global-complementario-chile.md`

## 2. Fechas de revisión y SLA por artículo

| Artículo | validAsOf / última revisión | updatedDate | Due (SLA) | Estado |
|---|---|---|---|---|
| `impuesto-global-complementario-chile` | **2026-05-14** | 2026-08-09 (bot snapshot, no es revisión real) | **2026-08-12** (90d, impuestos) | **STALE** (−7 días) |
| `boleta-honorarios-2026-retencion-cobertura` | 2026-08-12 | 2026-08-12 | 2026-11-10 | OK |
| `devolucion-impuestos-fechas-compensaciones` | 2026-08-13 | 2026-08-13 | 2026-11-11 | OK |
| `operacion-renta-f22-checklist` | 2026-08-13 | 2026-08-13 | 2026-11-11 | OK |
| `rentas-mixtas-sueldo-honorarios` | 2026-08-12 | 2026-08-12 | 2026-11-10 | OK |

Reporte local (`output/validation/editorial-timeliness/report.json`): `published=53 stale=1 drift=0`; snapshot económico fresco (0.3d, `check-economic-snapshot-freshness` OK); UTA 834.504 verificado contra snapshot volátil (sin drift, `reviewTriggerDate` 2025-12-01 < `reviewDate`).

## 3. Los 4 artículos de #407: resueltos indirectamente

Los 4 fueron remediados por el commit `2b1f681f` (2026-08-13) — "auditoría de conformidad y remediación del lote 0 (impuestos-personas)": Fases A/B/C del `PLAN-auditoria-corpus-publicado-2026-08-12.md`, compliance rounds 1–6 documentados, registro NORMA §5.3, firma del editor humano. Ninguno está stale hoy. El cuerpo de #407 (fechado 2026-08-10) ya no describe la realidad de main.

## 4. Por qué `impuesto-global-complementario-chile` es el blocker ahora

- SLA de 90 días (categoría `impuestos`, sourceMode `manual_review`) desde `validAsOf` 2026-05-14 → venció el **2026-08-12**, un día después del remedio de #407.
- No apareció en la auditoría del 2026-08-10 porque entonces faltaban 2 días para vencer.
- El `updatedDate` del 2026-08-09 proviene del bot de refresh de snapshots (#402, `22d67869`) y **no** reinicia el SLA: el check usa `articleLead.validAsOf ?? updatedDate ?? pubDate`.
- El run scheduled del 2026-08-17 murió al arrancar (0 steps, ~4–5s) por el bloqueo de billing de GitHub Actions; ningún gate lo capturó hasta el check local de #427.
- El check es scope-agnostic (escanea todo el corpus): cualquier PR/local que corra `check:editorial-timeliness` sobre main lo verá rojo.

## 5. #405 vs #407: mismo problema operativo, trackers distintos

- El run scheduled `31358865799` (referenciado en #405) falló **solo** en el paso 21 "Check editorial timeliness SLA"; el resto del job (typecheck, build, URL, RSS) pasó. La causa raíz del 08-10 es la misma: las 4 ventanas stale de #407.
- #405 es el tracker genérico del scheduled gate (ci.yml → upsert-issue-by-title). #407 es el tracker especializado de la auditoría de timeliness (editorial-timeliness-audit.yml).
- Ninguno se auto-cerró: los runs scheduled del 2026-08-17 (CI `31998171416` y auditoría `32015789485`) murieron en bootstrap (0 steps, billing) y los pasos de upsert nunca corrieron.

## 6. Checks de CI: qué pasa / qué falla hoy

**Falla (local, `pnpm run check:ci`):** `check-editorial-timeliness` — 1 stale (`impuesto-global-complementario-chile.md`). La cadena `&&` corta ahí, por eso #427 solo reportó esta falla.

**Falla adicional en modo estricto (CI scheduled: `EDITORIAL_ENFORCE=1`, `EDITORIAL_SCOPE=all`):** `check-editorial-artifacts` — 3 posts non-compliant:
- `devolucion-impuestos-fechas-compensaciones`
- `operacion-renta-f22-checklist`
- `rentas-mixtas-sueldo-honorarios`

Causa: los run dirs nuevos `20260812-*` (lote0b/lote0c) **no contienen `sources.yaml` ni `metadata.yaml`** (los backfill `20260511-1000-backfill` sí). El checker resuelve el run más nuevo y cae al fallback de extracción de URLs del dossier → entradas sin title/date → inválidas. Regresión introducida por `2b1f681f`, nunca vista por CI (billing). En PR el gate es `scope=changed`, por eso #427 no lo vio.

**Falla en `check:official-host-registry`** (parte de `check:ci`, detrás de timeliness en la cadena): `tgr.gob.cl` sin registrar en `src/config/official-hosts.json` (solo existe `tgr.cl`) — también introducido por `2b1f681f` (nuevo enlace en `rentas-mixtas-sueldo-honorarios.md`).

**Pasan:** lint, format:check, test, check:boundaries, check:context, check:policy-registry, check:legal-constants, check:docs, check:frontmatter, check:legal-citations, check:hero-images, check:hero-prompts, check:no-postid-urls, check:routes, astro check, check:economic-source-consistency, check:catalog-drift, check:article-registration, check:homepage-surface-freshness, check:small-details, check:economic-snapshot-freshness.

## 7. Clasificación por artículo

- **`impuesto-global-complementario-chile`** → **requiere revisión factual real** (YMYL impuestos; tramos UTA/AT2026 y créditos: ISC, honorarios, APV). La cifra UTA está machine-verificada vía snapshot, pero la prosa/tramos no. No renovar `validAsOf` sin verificar.
- **Los 4 de #407** → ya revisados de verdad (auditoría documentada, compliance rounds). El issue **obsoleto** en cuanto a su lista de slugs.
- **`devolucion-impuestos`, `operacion-renta-f22-checklist`, `rentas-mixtas-sueldo-honorarios`** → pendiente **solo metadata**: agregar `sources.yaml`/`metadata.yaml` a los run dirs `20260812-*` para pasar el gate estricto. Sin cambio de contenido.
- **`rentas-mixtas-sueldo-honorarios`** → además registrar `tgr.gob.cl` en `official-hosts.json` (fix de config, no de contenido).

## 8. Cambio mínimo recomendado para dejar main sano

1. Revisión factual de `impuesto-global-complementario-chile.md` (UTA/tramos AT2026 + créditos) y bump de `validAsOf`/`updatedDate` con registro NORMA §5.3.
2. Agregar `sources.yaml` (+ `metadata.yaml`) a los 3 run dirs `20260812-*` faltantes.
3. Registrar `tgr.gob.cl` (tipo `oficial`) en `src/config/official-hosts.json`.
4. **Fuera del repo (bloqueante):** restaurar el billing de GitHub Actions — sin eso los gates scheduled no corren y los issues no se auto-sincronizan.

## 9. Issues cerrables tras la corrección

- **#407** → se auto-cierra solo: `editorial-timeliness-audit.yml` hace upsert a `closed` cuando el check pasa. Tras (1), el próximo run exitoso lo cierra.
- **#405** → se auto-cierra solo cuando el scheduled CI corre verde (upsert `closed` en ci.yml). Requiere (1)+(2)+(3) **y** billing restaurado. Si corriera hoy, se re-abriría con el slug nuevo.

Ambos issues están abiertos "por inercia": su contenido (2026-08-10) es obsoleto, pero la condición que trackean (ventana stale + gate rojo) persiste en otro artículo — no son cerrables sin el fix.

## Evidencia

- `gh run view 31358865799` (run de #405): solo falló el paso 21 (timeliness).
- Runs `31998171416` (CI, 08-17) y `32015789485` (auditoría, 08-17): 0 steps, murieron en bootstrap (billing).
- PR #427: CI runs también muertos en 5s (billing); `check-runs` del head solo con Cloudflare Pages success.
- `git log`: `2b1f681f` (08-13) bump de `validAsOf` de los 4 a 08-12/08-13 + artifacts lote0b/lote0c sin sources.yaml/metadata.yaml + enlace `tgr.gob.cl`.

## Registro (NORMA §5.3)

- 2026-08-19 — Revisión factual de `impuesto-global-complementario-chile.md` (run local, sin run dir de pipeline; corrección mínima de la corrección pendiente del corpus). Qué cambió: (a) corrección de error importante — la retención de boletas de honorarios y las cotizaciones previsionales obligatorias de trabajadores independientes se atribuían a "Ley 21.242"; la fuente oficial y el corpus (SII — aumento gradual retención; `boleta-honorarios-2026-retencion-cobertura`, auditada en `2b1f681f`) la atribuyen a **Ley 21.133** (entrada en vigor progresiva desde 2019); (b) corrección de error importante — el bloque APV describía las Modalidades A y B del art. 42 bis LIR invertidas: Modalidad A **no** es un crédito tributario en el F22 sino bonificación estatal del 15% del ahorro anual con tope de 6 UTM anuales depositada por la TGR en la cuenta previsional, y el tope de 50 UF mensuales/600 UF anuales corresponde a la Modalidad B (rebaja de base imponible); mismo error ya corregido en `rentas-mixtas-sueldo-honorarios` el 2026-08-13 (registro §17 de `PLAN-auditoria-corpus-publicado-2026-08-12.md`); (c) `articleLead.validAsOf` 2026-05-14 → 2026-08-19 y `updatedDate` 2026-08-09 → 2026-08-19 por cambio sustantivo (NORMA §5.1, "corrección de error importante"). Por qué: hallazgos de la revisión factual de esta sesión (2026-08-19), artículo era el único stale de main (SLA 90 días vencido el 2026-08-12) y bloqueaba el gate editorial de CI (#405). Fuentes: SII — Datos informativos AT2026 personas naturales (tramos IGC y UTA verificados, fetch 2026-08-19); SII — boletas de honorarios, aumento gradual de retención (Ley 21.133, 15,25% en 2026, fetch 2026-08-19); SII — FAQ 001_140_5883 (regímenes tributarios APV, art. 42 bis, fetch 2026-08-19); Superintendencia de Pensiones — Compendio, cap. XI bonificación fiscal APV/APVC (fetch 2026-08-19); CMF Educa — beneficios tributarios APV/APVC (fetch 2026-08-19). No se tocó: tramos IGC (100% verificados contra SII), UTA/volatileData, SEO, TTL/Cloudflare, otros artículos, issues.