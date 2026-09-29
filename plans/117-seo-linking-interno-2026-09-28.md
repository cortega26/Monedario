# Plan 117: Linking interno por prioridad de producto (SEO-02)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW-MED (solo enlaces internos; no toca copy YMYL)
- **Depends on**: decisión del mantenedor (paso 1)
- **Category**: SEO interno / prioridad de producto
- **Planned at**: commit `da8e72da`, 2026-09-29
- **Status**: TODO — requiere selección del mantenedor (Fase 2 SEO)
- **Evidence**: `docs/reports/AUDIT-SEO-2026-09-28.md` (SEO-02 + Grafo interno)

## Why this matters

El informe muestra autoridad concentrada en 4 calculadoras sitewide (sueldo,
APV, crédito de consumo, conversor UF) mientras estratégicas declaradas quedan
con in-degree editorial 2–6 (gratificación 2, actualizador IPC 3, IVA 3, guía
Operación Renta 3, hipotecario 4). Casi todas están a ≤2 clics: no es un
problema de descubrimiento, sino de **señal relativa**. El fix es que el linker
refleje la prioridad de producto, no el accidente de un componente.

## Scope

**In scope**

- `src/config/calculatorPortfolio.ts` — ranks/shortcuts globales.
- `src/components/Footer.astro` — bloque sitewide de herramientas.
- Guías, hubs y posts **existentes** — enlaces contextuales por cluster.
- `scripts/audit-calculator-interlinks.mjs` + tests — floor por prioridad.
- `plans/README.md`.

**Out of scope**

- URLs nuevas (FOCO ESTRICTO / VALIDACIÓN UTILITY-LED hasta 2026-11-02).
- Copy YMYL: este plan solo agrega enlaces, no reescribe contenido.
- SEO-05 (canibalización) y SEO-06/08: planes 119/118/120.

## Verificación previa (2026-09-29)

- 4 globales actuales vía `footerShortcutRank`: `sueldo-liquido` (1), `apv`
  (2), `credito-consumo` (3), `conversor-uf` (4) —
  `src/config/calculatorPortfolio.ts:90,243,319,436`; `CALCULATOR_FOOTER_SHORTCUTS`
  los filtra y ordena (`:676-683`) y `Footer.astro:14-17` los renderiza en
  todas las páginas.
- `scripts/audit-calculator-interlinks.mjs` ya separa in-degree editorial de
  estructural y soporta `--json`, `--strict`, `--min=<n>` (floor default 3).
- Estratégicas sub-enlazadas según el informe: gratificación (2), IPC (3),
  IVA (3), guía Operación Renta (3), hipotecario (4), depósito (5), seguro
  cesantía (5), boletas (6), comisiones AFP (6), impuesto 2ª (6),
  renegociación (6), tarjeta (6).

## Steps

1. **Baseline**: `node scripts/audit-calculator-interlinks.mjs --json` y
   guardar en `output/validation/seo/interlinks-before.json`.
2. **Decisión del mantenedor**: cuántas y cuáles herramientas quedan globales.
   Recomendación: 2 (`sueldo-liquido` + `conversor-uf`). Criterio: demanda en
   `output/operations/data-signals/gsc/2026-W39-pages.json` + JTBD del
   portfolio. Documentar la decisión en este plan y en un comentario del
   registry.
3. Reducir el bloque sitewide: quitar `footerShortcutRank` a las no elegidas
   (el resto del portfolio sigue accesible vía `/calculadoras/` y familias).
4. Linking contextual por cluster: añadir 1–2 enlaces desde guías/hubs/posts
   existentes hacia las estratégicas sub-enlazadas, priorizando las 12 del
   grafo. Sin páginas nuevas.
5. Extender `audit-calculator-interlinks.mjs`: leer la prioridad por producto
   (campo nuevo en `calculatorPortfolio.ts`, p. ej. `editorialLinkFloor`, o un
   mapa en config) y fallar con `--strict` cuando una estratégica quede bajo el
   floor. Añadir script npm `check:calculator-interlinks`.
6. Tests unitarios con fixture del cálculo de in-degree y del floor.

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Baseline | `node scripts/audit-calculator-interlinks.mjs` | 4 globales; estratégicas < 3 |
| Post-cambio | idem | ≤ 2 globales; estratégicas ≥ 3 |
| Unit | `pnpm run test` | verde |
| Build + guardas | `pnpm run build` | 12 checks |
| CI mirror | `pnpm run check:ci` | exit 0 |

## Done criteria

- [ ] ≤ 2 herramientas en el bloque sitewide (decisión documentada).
- [ ] Las 12 estratégicas del grafo con ≥ 3 enlaces editoriales.
- [ ] Auditor extendido con floor por prioridad + tests.
- [ ] 0 URLs nuevas; gates en verde.

## STOP conditions

- La decisión del paso 2 no está tomada (no improvisar prioridades).
- Quitar un global degrada métricas de la página (no verificable sin deploy:
  monitorear GSC W+2 y revertir si cae).
- Duplicación con bloques existentes (`NextSteps.astro`, `IndicadoresHoy.astro`,
  `ProblemCards.astro`) que ya enlacen la misma herramienta: ajustar, no sumar.

## Rollback

Restaurar ranks y enlaces (revert por paso). Sin migración de datos ni cambios
de URL.
