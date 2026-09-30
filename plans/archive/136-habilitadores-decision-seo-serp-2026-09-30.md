# Plan 136: Habilitadores de decisión SEO/SERP (N1, N4, N7 y briefing `/archives/`)

> **Executor instructions**: trabajo docs-only; no toca `src/`, contenido,
> rutas, sitemap ni indexabilidad. Registra experimentos (N4), define la
> cadencia mensual (N1), prepara el briefing de decisión de `/archives/` y la
> verificación de la vista Generative AI (N7). Actualiza
> `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` §4 y `plans/README.md`.

## Status

- **Priority**: P1–P2 (dirección; habilita ejecución futura)
- **Effort**: S–M
- **Risk**: LOW (docs; sin cambios de comportamiento)
- **Depends on**: plan 128 (DONE, §8) y artifact `SEO-SERP-STRATEGY`
- **Category**: medición SEO / gobernanza de decisiones
- **Planned at**: commit `11f0a26d`, 2026-09-30
- **Status**: DONE (2026-09-30) — N4 registrado (4 experimentos), N1 con
  cadencia mensual en el ritual, briefing de `/archives/` y verificación N7
  documentados. Cierre atómico: commit + archivo en `plans/archive/`. Sin
  ejecución de cambios ni push (no solicitado).

## Scope

**In scope**

- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` — sección nueva
  "Experimentos SEO/SERP" (N4).
- `docs/operations/runbooks/weekly-search-performance-ritual.md` — anexos:
  cadencia mensual de la matriz query×page (N1) y verificación de la vista
  Generative AI de GSC (N7).
- `docs/backlog/DECISION-archives-indexabilidad-2026-09-30.md` (nuevo) —
  briefing de decisión del owner con evidencia y opciones (contrato plan 120).
- `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` §4 y progress log.
- `plans/README.md` (filas 135–136) y este plan.

**Out of scope**

- Ejecutar experimentos (post-freeze ~2026-10-14 y post panel F4), cambiar
  títulos/descriptions en ventana, o tocar `indexability.ts`.
- `noindex` o consolidación de `/archives/`: la decisión es del owner; la
  ejecución (si se aprueba) va en plan propio con ADR + snapshots de rutas/RSS.
- Verificar la cuenta GSC: es acción del owner; aquí solo se documenta el
  procedimiento y dónde registrar el resultado.
- Cualquier cambio en `src/` o en el sitio.

## Steps

1. **N4 — Registro de experimentos** (`UTILITY_LED_EXPERIMENT_REGISTRY.md`):
   sección con los candidatos priorizados por §8, cada uno con baseline,
   métrica, umbral GREEN/WATCH/HALT, denominador, `n_min` (misma fórmula
   `ceil(ln(0,05)/ln(1−p))`) y guardarraíl de posición:
   - UTM: CTR en banda 8–20 (`valor utm`: 116.695i, pos 8,35, CTR 0,34%);
     dentro de F5 activo → no ejecutar durante la ventana.
   - Seguro de cesantía: hueco de intención «simular» (pos 8,6–10,8) frente a
     «calcular» (506i/28c, pos 4,74, CTR 5,5%).
   - Prepago: `conviene prepagar un credito de consumo` (97i/0c, pos 14,8).
   - Impuesto 2ª: queries «2026» (pos 9–10, CTR 0–0,5%; página 5.107i/50c).
   - Sueldo y APV: excluidos hasta resolver posición/authority (§8).
   Regla explícita: **registro ahora, ejecución post-freeze** y post panel F4.
2. **N1 — Cadencia mensual**: anexo en el ritual semanal con dueño
   (operador del ritual), frecuencia (primera corrida semanal de cada mes),
   comandos (`data-signals:gsc:aggregate --weeks=8`, `audit:striking-distance`,
   `audit:cannibalization`), regla de decisión (1–3 candidatos → registry o
   plan numerado) y ubicación de salidas. Sin automatización nueva.
3. **Briefing `/archives/`**: documento de decisión con evidencia GSC (0i/0c en
   8 semanas; «Crawled - currently not indexed»), estado vigente (indexable,
   enlazado desde `/posts/` por plan 116 SEO-03), opciones A–D, mecanismo del
   contrato 120 (regla en `src/config/indexability.ts` + ADR + snapshot
   rutas/RSS + guardas) y riesgos. La recomendación operativa no rompe FOCO:
   decidir sin ejecutar antes de la ventana definida.
4. **N7 — Vista Generative AI**: procedimiento de verificación en la cuenta
   (Search Console → Performance → filtro de tipo de búsqueda/IA), dónde
   registrar la lectura mensual (scorecard/bundle) y la regla de no inferir
   AIO por búsquedas manuales. Estado inicial: "disponibilidad no verificada".
5. **Índices y artifact**: §4 N1/N2/N4/N7 con estado nuevo y enlaces;
   progress log del artifact; filas 135–136 en `plans/README.md`.

## Resultados

- **N4:** sección «Experimentos SEO/SERP (registro 2026-09-30)» con 4
  experimentos (UTM banda 8–20, «simular» seguro de cesantía, prepago,
  impuesto 2ª «2026»), cada uno con baseline, GREEN/WATCH/HALT y `n_min`;
  ejecución post-freeze + panel F4.
- **N1:** anexo de cadencia mensual en el ritual semanal (owner = operador,
  primera corrida de cada mes, comandos y regla de decisión 1–3 candidatos).
- **`/archives/`:** `docs/backlog/DECISION-archives-indexabilidad-2026-09-30.md`
  con opciones A–D, mecanismo del contrato 120 + ADR y recomendación operativa
  de diferir; decisión abierta del owner.
- **N7:** procedimiento de verificación de la vista Generative AI en el ritual;
  disponibilidad no verificada (acción del owner).

## Verificación

| Comprobación | Criterio |
|---|---|
| N4 | Cada experimento con baseline, umbral y `n_min`; regla de no-ejecución en ventana |
| N1 | Dueño, frecuencia, comandos y regla de decisión explícitos |
| `/archives/` | Opciones con costo/riesgo y mecanismo 120 citado; decisión abierta |
| N7 | Procedimiento ejecutable por el owner + lugar de registro |
| Cero mutaciones | `git status` sin cambios en `src/`, contenido ni rutas |
| Docs | `pnpm exec prettier --check` + `pnpm run check:docs` verdes |

## STOP / HALT

- No ejecutar experimentos ni cambios de indexabilidad en esta sesión.
- No escribir en `/archives/` ni en el glosario sin decisión del owner +
  contrato 120 + ADR.
- No prometer efecto causal durante el spam update en rollout.
- Si el registry y el artifact se contradicen, gana el registry tras
  reconciliar en el mismo cambio.

## Rollback

- Revertir la sección nueva del registry, los anexos del runbook, el briefing
  y las filas/§4 actualizados. Sin efectos en runtime.

## Progress log

- 2026-09-30 — Plan creado tras aprobación del owner (N1/N4/N7 y briefing
  `/archives/` seleccionados).
- 2026-09-30 — Ejecutado: registry (N4), anexos del ritual (N1/N7), briefing
  de `/archives/` y §4 del artifact actualizados. `prettier` + `check:docs`
  verdes; sin cambios en `src/`. Cierre atómico en el commit
  `docs(seo): ejecuta planes 135–136 (glosario, experimentos, cadencia,
  /archives/, N7)`.