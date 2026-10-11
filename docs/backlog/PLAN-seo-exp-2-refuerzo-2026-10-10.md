# PLAN — SEO-EXP-2 refuerzo: sección «cómo simular» + anclas internas (2026-10-10)

- **Estado:** DONE — verificado en worktree limpio (cambios en working tree, sin commit)
- **Origen:** continuación de SEO-EXP-2 tras #665 (`d7e94543`). El owner pidió
  los levers adicionales propuestos: sección paso a paso en la página y
  enlaces internos con anchor «simular seguro de cesantía».
- **Segunda opinión:** advisor GLM 5.3 — `APPROVE_WITH_CHANGES`; cambios
  requeridos incorporados (flujo hero-brief para las guías, ventana/rollback,
  cap de anchors, bold-glue).

## Scope

**In-scope:**
- `src/pages/calculadoras/seguro-cesantia.astro` — sección «Cómo simular tu
  seguro de cesantía» (4 pasos).
- `src/pages/calculadoras/finiquito-indemnizacion.astro` — label de acción
  siguiente → «Simular seguro de cesantía».
- `src/data/glossary/seguro-cesantia.md` — label → «Simular seguro de
  cesantía».
- `src/data/blog/seguro-de-cesantia.md` y
  `src/data/blog/seguro-cesantia-cuenta-individual-vs-fondo-solidario.md` —
  anchors reescritos a «simular tu seguro de cesantía» (sin claims nuevos).
- `scripts/hero-images/{manifest,briefs,prompts,asset-reviews}.json` — refresh
  revisado del brief visual y del asset review de las dos guías (flujo
  scan-articles + review + build-prompts; la imagen no se regenera).
- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` — enmienda: levers,
  ventana y rollback.

**Out-of-scope:** motor de cálculo, metadata (title/description/JSON-LD/H1),
nombres de analytics, hub StartHere (descartado por advisor), otras páginas.

## Decisiones

- H1/title intactos (ver #665): el anchor «simular» va en H2, labels y
  enlaces; el query que convierte («calcular») conserva sus señales.
- Cap de anchors exactos = 2 (glosario + finiquito) + 2 variantes (guías),
  para no perfilar sobre-optimización durante el rollout del spam update.
- Sin `updatedDate` bump: §5.2 exceptúa ajustes de interlinks.
- Hub StartHere step 5 descartado (crea dos nombres del mismo tool en una
  página y convierte el último anchor «calculadora de…» del hub).

## Verificación

| # | Comando | Esperado |
|---|---------|----------|
| 1 | `node scripts/check-hero-prompts.mjs` | OK en worktree limpio (en el árbol principal persisten 4 alertas ajenas de la otra sesión) |
| 2 | `pnpm run test` | verde — 1947 tests / 200 archivos |
| 3 | `pnpm run check:image-curation` + `check:image-delivery` + `check:hero-images` | verde (asset review refrescado con historial archivado) |
| 4 | `pnpm run check:editorial` + `check:frontmatter` + `check:small-details` + `check:risk-tiers` | verde |
| 5 | `pnpm run build` en worktree limpio | verde (334 páginas, 9744 URLs 0 roto, postbuild 24 checks) |
| 6 | Dist: H2 «Cómo simular tu seguro de cesantía», anchors «Simular seguro de cesantía» (glosario/finiquito) y «simular tu seguro de cesantía» (guías), title intacto | verificado |
| 7 | Gates CI restantes en worktree limpio (lint, format, boundaries, context, policy, docs, audit, correcciones, postid, routes, workers, source-consistency, catalog, registration, hosts, homepage) | todos OK |

`check:editorial-timeliness` no se re-ejecutó: sus fallos son de fecha y
preexistentes (idénticos en HEAD limpio, ver tarea #663).

## Rollback

Revertir todo el paquete (sección, labels, anchors, briefs/asset reviews) si
«calcular seguro de cesantia» sale del top ~5–6 o degrada >2 posiciones por 2
semanas consecutivas; la ventana de 4 semanas se mantiene (misma semana GSC).
