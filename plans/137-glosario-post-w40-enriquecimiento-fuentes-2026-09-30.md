# Plan 137: Glosario post-W40 — enriquecimiento (8 entradas) y backfill de fuentes

> **Executor instructions**: ejecutar en **sesión fresca, de familia distinta**
> a la que auditó el glosario (auditoría: sesión 2026-09-30; ver
> `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`). No ejecutar antes del
> **2026-10-05** (post-W40) ni durante el freeze de títulos (~2026-10-14) sobre
> superficies en medición. Este plan NO toca indexabilidad, rutas ni esquema.
> Base: `docs/reports/AUDIT-GLOSSARY-2026-09-30.md`.

## Status

- **Priority**: P1 (dirección; ejecuta las recomendaciones N2)
- **Effort**: Fase A M · Fase B M–L
- **Risk**: MED (contenido editorial con fuentes verificables)
- **Depends on**: plan 135 (auditoría, DONE) + decisión del owner de ejecutar
- **Category**: contenido editorial / SEO on-page
- **Planned at**: commit `135afc62`, 2026-09-30
- **Status**: TODO — **gate temporal**: no iniciar antes de 2026-10-05; sesión
  de ejecución ≠ sesión de auditoría

## Contexto

La auditoría N2 dejó 45 `MANTENER`, 8 `ENRIQUECER`, 1 `CONSOLIDAR` candidato
(`sbif`, fuera de este plan: requiere contrato 120 + ADR + decisión) y 0
noindex. Brechas transversales: 49/54 entradas sin `sources`, 47/54 sin
`reviewedDate`, 34/54 sin enlaces entrantes desde contenido no-glosario.

## Scope

**In scope**

- `src/data/glossary/**` — solo las entradas trabajadas en cada fase.
- Enlaces internos entrantes desde contenido existente (`src/data/blog/**`,
  `src/pages/calculadoras/**`, etc.).
- `sources` y `reviewedDate` del frontmatter; `shortDefinition`/primer párrafo
  de las 8 entradas de Fase A (solo donde la auditoría lo propone).
- `docs/reports/AUDIT-GLOSSARY-2026-09-30.md` (anotar ejecución) y
  `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` §4 N2.

**Out of scope**

- `noindex`, consolidación, fusión (`sbif`), redirecciones, rutas, sitemap,
  `src/config/indexability.ts`.
- Entradas nuevas o URLs nuevas (FOCO hasta 2026-11-02).
- Títulos/descriptions de superficies en medición (freeze).
- Medición nueva o eventos de analytics.

## Fase A — Enriquecer las 8 entradas (orden de prioridad)

Acciones por entrada (detalle y evidencia en el reporte, tabla
«Recomendaciones — ENRIQUECER»):

| # | Entrada | Palancas |
|---|---|---|
| A1 | `renta-imponible` | Snippet/definición de apertura; fuentes SII/SP; enlaces desde `como-calcular-sueldo-liquido` y `sueldo-bruto`; evaluar solape con el post de sueldo líquido (no consolidar: solo redacción que cierre el clic) |
| A2 | `cuenta-rut` | Snippet/definición; fuentes BancoEstado/CMF; enlaces desde posts de bancos/fintech |
| A3 | `corredor-bolsa` | Ampliar definición (hoy 672 caracteres); fuentes CMF; `relatedCalculators`; enlaces desde contenido de inversión |
| A4 | `cic` | Ampliar (CIC vs FCS); fuentes SP/AFC; enlaces desde `seguro-cesantia` |
| A5 | `rescate` | Ampliar reglas por producto (fondo mutuo, APV); fuentes CMF; enlaces desde `fondo-mutuo`/`apv` |
| A6 | `credito-aval-estado` | Fuentes (INGRESA/Comisión Ingresa); enlaces desde contenido CAE |
| A7 | `cuenta-2` | Fuentes SP; enlaces desde `apv`/`multifondo`; revisar `relatedTerms` |
| A8 | `lpc` | Fuentes BCN; enlaces desde contenido de consumo/SERNAC |

Reglas de Fase A:

- No cambiar `term` ni la ruta. `seoTitle` solo si el beneficio es claro y la
  página no está en medición (el glosario no lo está; aun así, mínimo cambio).
- Cada `source` debe ser primaria/oficial y responder 200 antes de publicarse
  (verificación con `curl -sI`); 1–2 fuentes por entrada.
- Los enlaces entrantes respetan la política de enlazado vigente y no rompen
  `check:calculator-interlinks`.
- Actualizar `reviewedDate` a la fecha de revisión real.
- Sin promesas de CTR: el efecto se mide con GSC query×page contra ventana
  comparable (≥4 semanas), posición como guardarraíl.

## Fase B — Backfill de fuentes y revisión (transversal)

1. Prioridad 1: las 13 entradas visibles sin `sources` (`renta-imponible`,
   `ctc`, `cuenta-rut`, `tmc`, `corredor-bolsa`, `cic`, `cmf`, `rescate`,
   `credito-aval-estado`, `apv`, `cuenta-2`, `global-complementario`, `sbif`).
2. Prioridad 2: las 36 restantes sin `sources`, en orden alfabético, una por
   una; si una entrada no tiene fuente oficial razonable, se reporta y se deja
   sin inventar.
3. `reviewedDate`: se actualiza solo cuando hay revisión sustantiva de la
   entrada (no por el solo agregado de fuentes si el cuerpo no se revisó).
4. Salida: reporte de avance en `docs/reports/` (nuevo, p. ej.
   `AUDIT-GLOSSARY-SOURCES-<fecha>.md`) con tabla entrada→fuentes→fecha.

## Verificación

| Comprobación | Criterio |
|---|---|
| Fuentes | Cada URL citada responde 200 (`curl -sI`) y es primaria/oficial |
| Frontmatter | `pnpm run check:frontmatter` verde; `check:docs` y `prettier` verdes |
| Enlaces | `check:calculator-interlinks` / `check:routes` sin nuevos fallos |
| Contenido | `pnpm run check:ci` verde; build solo si se toca algo renderizado |
| Mediciones | Sin cambios en superficies en ventana; nada de `noindex`/rutas |
| Cero URLs nuevas | FOCO 2026-11-02 respetado (`check:indexable-url-freeze`) |

## STOP / HALT

- Si una fuente oficial no existe para una entrada → dejarla sin fuente y
  reportar; no inventar ni citar fuentes secundarias dudosas.
- Si el cambio exige tocar indexabilidad/consolidación → detener y abrir plan
  aparte con contrato 120 + ADR.
- Si el ejecutor participó de la auditoría (misma sesión/familia) → HALT por
  `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.
- Si el gate temporal no se cumple (antes de 2026-10-05) → HALT.

## Rollback

- Revertir los archivos tocados por entrada (git); los enlaces entrantes y
  `sources` son aditivos y reversibles sin efectos en rutas ni RSS.

## Progress log

- 2026-09-30 — Plan creado tras aprobación del owner; no ejecutado (gate
  temporal post-W40).