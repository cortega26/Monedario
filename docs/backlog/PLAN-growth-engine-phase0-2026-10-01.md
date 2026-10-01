# Plan Fase 0 — Growth Engine (report-only)

Fecha: 2026-10-01 · Rama: `feat/growth-engine-phase0` · Estado: implementado

## Objetivo

Convertir los datos de tráfico que el repo ya commitea (GSC, analytics
first-party) en oportunidades priorizadas con hipótesis y umbral
pre-declarado, **sin ejecutar cambios**. Además, un `doctor` que clasifica
fallos de gate por tipo de acción (mecánica, dato, editorial, contrato).

Es la Fase 0 del sistema descrito en `docs/operations/GROWTH-ENGINE.md`:
observar y calibrar ruido durante ~2 semanas antes de habilitar cualquier
acción automática (Fase 1+).

## Alcance

En alcance:

- Detectores report-only: `striking_distance_query`, `ctr_gap_page`,
  `decay_page`, `cannibalization_query`, `calculator_funnel`.
- Registro configurable `src/config/growth-opportunity-registry.json`
  (umbrales, curva de CTR esperada, política de autonomía, experimentos).
- `scripts/doctor.mjs`: triage de gates con clasificación por categoría.
- Workflows semanales: `growth-opportunities.yml` y `repo-doctor.yml`
  (solo reporte/issue; sin PRs ni contenido).
- Tests unitarios de detectores y clasificador.

Fuera de alcance:

- Cualquier cambio automático de contenido, title/meta, links o URLs.
- Experimentos A2/A3, auto-rollback y source-watch (Fases 1–3).
- Nuevas URLs o superficies indexables (FOCO ESTRICTO vigente).

## Decisiones

- Sin dependencias nuevas: los detectores y el doctor son Node puro.
- Umbrales en el registro, no en el código; el reporte es determinista para
  una misma semana de datos.
- `n_min` se calcula con la fórmula ya usada por el registro de experimentos
  utility-led (`ceil(ln(0,05)/ln(1−p))`).
- El registro no acumula candidatos: los candidatos viven en el reporte
  (`output/validation/growth-opportunities/<semana>.json`); el registro solo
  define política/umbrales y albergará experimentos formales en Fase 2.

## Criterio de cierre

- `pnpm run growth:detect` produce JSON + Markdown sobre W39 sin errores.
- `pnpm run doctor` produce reporte con clasificación por categoría.
- Tests en verde; `check:ci` en verde.
- Workflows válidos (YAML) y en modo report-only.

## Rollback

Borrar los scripts/workflows/registro y sus referencias en `package.json` y
docs. No toca contenido ni rutas.

## Fase 0.1 — fuente libre (2026-10-01)

- Intento pagado bloqueado y verificado: Semrush `no_api_units`, Ahrefs
  `Insufficient plan`. Registrado en el control-plane como
  `action_monedario_external_intelligence` (revisión 2, draft).
- `pnpm run growth:collect:competitors` lee sitemaps públicos de
  `src/config/competitors.json` y escribe
  `output/external-intelligence/<semana>.json` con
  `source: "free"` y `competitorPages` (sin volumen ni dificultad).
- Nuevo detector `competitor_sitemap_gap` (A0): compara los tokens de las
  páginas de competidores contra el vocabulario de queries GSC + rutas
  propias; emite gaps de cobertura sin volumen para revisión editorial.
- Tope por tipo (`maxCandidatesPerType: 10`) además del global (60) para que
  los detectores de baja señal no queden fuera del reporte.
- Resultado de prueba W39: 31 candidatos (10 sitemap gaps, 2 decay, 8 CTR
  gap, 10 striking, 1 funnel); sitemaps: 5/7 dominios OK (2 fallos HTTP
  reportados sin romper).

## Fase 0.2 — calibración y memoria (2026-10-01)

- `src/config/growth-opportunity-feedback.json` (owner vía PR):
  `dismissed` (IDs exactos), `dismissedPatterns` (dominio + regex de path) y
  `promoted` (traza de experimentos).
- `applyFeedback` filtra antes de los topes por tipo; el reporte indica
  cuántos candidatos se suprimieron sin borrar la evidencia semanal.
- Documentado en `GROWTH-ENGINE.md` §2c; el reporte semanal deja de repetir
  ruido ya revisado.
