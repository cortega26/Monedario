# Plan 135: Auditoría read-only del glosario (N2 del informe SEO/SERP)

> **Executor instructions**: solo lectura sobre `src/data/glossary/**` y exports
> GSC; el único artefacto nuevo es el reporte en `docs/reports/`. No se edita
> contenido, `relatedTerms`, fuentes, enlaces, `noindex`, rutas ni sitemap.
> Cualquier cambio recomendado queda sujeto al contrato del plan 120, ADR y
> ventana post-W40. Actualiza `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` §4
> (fila N2) con el enlace al reporte.

## Status

- **Priority**: P1 (dirección; evita expandir/consolidar a ciegas)
- **Effort**: M
- **Risk**: LOW (read-only + docs)
- **Depends on**: plan 128 (validación GSC, DONE) §8
- **Category**: medición SEO / auditoría de contenido
- **Planned at**: commit `11f0a26d`, 2026-09-30
- **Status**: DONE (2026-09-30) — auditoría ejecutada; reporte en
  `docs/reports/AUDIT-GLOSSARY-2026-09-30.md`. Cierre atómico: commit + archivo
  en `plans/archive/`; índices actualizados. Sin cambios en `src/` ni contenido,
  sin push (no solicitado).
- **Evidence**: `output/operations/data-signals/gsc/` (W32–W39 + agregado),
  `output/validation/striking-distance/`, `output/validation/cannibalization/`
  (gitignored, regenerables).

## Contexto (datos ya validados en plan 128 §8)

- 54 entradas en `src/data/glossary/` (55 URLs con `/glosario/`), **55/55
  indexadas** (URL Inspection W39).
- **37/54 sin ninguna impresión en 8 semanas**; de las 17 visibles, 15 con 0
  clics; canibalización real casi nula (solo `dicom` débil).
- Conclusión vigente: no es un problema de canibalización ni de indexación; es
  demanda inexistente sobre un índice ya indexado. N2 define qué hacer por URL.

## Scope

**In scope (lectura)**

- `src/data/glossary/**` (54 entradas): frontmatter (`term`, `shortDefinition`,
  `relatedTerms`, `relatedCalculators`, `relatedGuides`, `relatedLaws`,
  `sources`, fechas) y cuerpo.
- `src/pages/glosario/index.astro` y `[slug].astro` (cómo se emiten enlaces
  internos; sin editar).
- `src/config/indexability.ts` (estado vigente; el glosario es indexable).
- Exports GSC: `aggregate-query-page.json` (14.880 filas W32–W39),
  `2026-W39-url-inspection.json`, `2026-W39-pages.json`,
  `aggregate-8w-cannibalization.json`, `aggregate-8w-striking-distance.json`.
- Enlaces internos: grep de `/glosario/<slug>/` y `relatedTerms` en
  `src/data/**` y `src/pages/**`.
- Reporte nuevo: `docs/reports/AUDIT-GLOSSARY-2026-09-30.md`.
- `plans/README.md`, `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` §4 N2.

**Out of scope**

- Cualquier edición a entradas, enlaces, `relatedTerms`, fuentes, títulos o
  `noindex`. Las recomendaciones se ejecutarían en un plan posterior bajo el
  contrato 120 + ADR + ventana post-W40.
- Backlinks: no hay crawl de GSC Links/Ahrefs en el repo; la columna de
  backlinks se declara como limitación, no se estima.
- AIO/multimodal: los exports no traen esa dimensión.
- Medición nueva o fetch de red.

## Steps

1. **Universo y cobertura**: listar las 54 entradas + índice; cruzar cada URL
   con el estado de indexación W39 (PASS/otro).
2. **Señal GSC 8w por URL**: para cada `/glosario/<slug>/` extraer
   impresiones, clics, CTR y posición media del agregado, más top queries con
   impresiones (para separar "sin demanda" de "demanda mal atendida").
3. **Enlaces internos**: por entrada, contar enlaces entrantes (desde posts,
   calculadoras, índice, otras entradas) y salientes
   (`relatedTerms`/`relatedCalculators`/`relatedGuides`/`relatedLaws`); marcar
   huérfanas (solo índice), sin salidas y con `relatedTerms` inexistentes.
4. **Fuentes y frescura**: número de `sources`, `publishedDate`,
   `reviewedDate`; marcar entradas sin fuentes o con revisión >12 meses.
5. **Canibalización**: revisar los grupos del anexo de canibalización que
   toquen `/glosario/` (esperado: solo `dicom` débil).
6. **Clasificación por URL** con criterio explícito:
   - `mantener` (señal razonable o infraestructura interna);
   - `enriquecer` (demanda existe pero 0 clics/enlaces/fuentes insuficientes);
   - `consolidar` (candidato a fusionar con otra entrada, con par propuesto);
   - `noindex candidato` (solo con demanda 0 sostenida, sin backlinks ni uso
     interno; nunca ejecutable en este plan).
   Señal insuficiente se reporta como tal; **0 impresiones ≠ eliminar**.
7. **Reporte** `docs/reports/AUDIT-GLOSSARY-2026-09-30.md`: resumen,
   tabla de 54 filas con evidencia, recomendaciones agregadas y limitaciones.
8. **Índices**: fila en `plans/README.md`; actualizar §4 N2 del artifact de
   estrategia con enlace al reporte.

## Resultados (reporte completo en `docs/reports/AUDIT-GLOSSARY-2026-09-30.md`)

- 55/55 URLs indexadas (W39); 17/54 con impresiones en 8 semanas, solo 2 con
  clics (CTC y TMC, 1 c/u); 37/54 sin impresiones.
- Clasificación: 45 `MANTENER`, 8 `ENRIQUECER` (`renta-imponible`,
  `cuenta-rut`, `corredor-bolsa`, `rescate`, `cic`, `credito-aval-estado`,
  `cuenta-2`, `lpc`), 1 `CONSOLIDAR` candidato (`sbif`), **0 noindex**.
- Brecha transversal: solo 5/54 con `sources`, 7/54 con `reviewedDate`;
  34/54 sin enlaces entrantes desde contenido no-glosario.
- Canibalización: 15 grupos tocan `/glosario/`, todos débiles (≤84i); sin
  consolidación justificada por esa causa.

## Verificación

| Comprobación | Criterio |
|---|---|
| Reporte | 54/54 entradas clasificadas con evidencia numérica |
| Datos | ventana W32–W39, misma fuente que plan 128 |
| Cero mutaciones | `git status` sin cambios en `src/` ni contenido |
| Docs | `pnpm exec prettier --check` + `pnpm run check:docs` verdes |
| Enlaces | sin enlaces al path anterior tras el cierre |

## STOP / HALT

- Export GSC ausente o ventana incompleta → declarar limitación, no estimar.
- No ejecutar ninguna recomendación (ni `noindex`, ni consolidación, ni
  ediciones) en esta sesión: este plan solo audita.
- No usar posición media de GSC como SERP puntual (promedia impresiones).
- No interpretar el spam update en curso como causa de caídas.

## Rollback

- Revertir el reporte nuevo, la fila del índice y la edición del artifact.
- Exports y reportes de `output/validation/` son regenerables y gitignored.

## Progress log

- 2026-09-30 — Plan creado tras aprobación del owner (N2 seleccionado).
- 2026-09-30 — Auditoría ejecutada sobre W32–W39 + URL Inspection W39; reporte
  con tabla de 54 entradas y recomendaciones por URL. Ningún archivo de `src/`
  ni contenido fue modificado (`git status` verificado). Cierre atómico en el
  commit `docs(seo): ejecuta planes 135–136 (glosario, experimentos, cadencia,
  /archives/, N7)`.