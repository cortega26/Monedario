# Plan 118: Structured data consistente por template (SEO-06)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW (JSON-LD; no cambia copy visible)
- **Depends on**: none (no requiere decisión de producto)
- **Category**: SEO técnico / datos estructurados
- **Planned at**: commit `da8e72da`, 2026-09-29
- **Status**: TODO — requiere selección del mantenedor (Fase 2 SEO)
- **Evidence**: `docs/reports/AUDIT-SEO-2026-09-28.md` (SEO-06)

## Why this matters

El informe describe structured data inconsistente: Article+Breadcrumb OK,
hubs con breadcrumbs, calculadora "solo WebPage", glosario con breadcrumb que
terminaría en "Glosario" y ley sin JSON-LD. La verificación en repo
(2026-09-29) contradice parte del informe: `Breadcrumb.astro` ya emite
`BreadcrumbList` con el último ítem apuntando a la URL canónica actual y lo
usan las 23 páginas de calculadoras y `leyes/[slug].astro` ya emite
`Legislation`+FAQ. **Primero re-verificar cada claim; luego cerrar solo los
gaps reales** y fijarlos con guardas.

## Scope

**In scope**

- `src/components/Breadcrumb.astro` — extraer generador común de
  `BreadcrumbList`.
- `src/components/CalculatorJsonLd.astro`, `GlossaryJsonLd.astro`,
  `ArticleJsonLd.astro`, `src/pages/leyes/[slug].astro` — gaps confirmados.
- `scripts/check-postbuild.mjs` + tests — guardas de parseo y breadcrumb.
- `plans/README.md`.

**Out of scope**

- SEO-02/05/08 y el contrato de indexabilidad (planes 117/119/120).
- `FAQPage` sitewide o `priority`/`changefreq` (informe: no defecto).

## Verificación previa (2026-09-29)

- `Breadcrumb.astro:98-129` emite `BreadcrumbList` cuando hay >1 crumb; el
  último `ListItem` usa la URL de la página actual (canónica).
- `CalculatorJsonLd.astro:33-53` emite `WebApplication` (+`FAQPage` opcional)
  y lo usan 22 calculadoras; no referencia el breadcrumb.
- `GlossaryJsonLd.astro` emite `DefinedTerm`; el breadcrumb lo emite
  `Breadcrumb.astro` desde el path (`glosario/[slug].astro:73`).
- `leyes/[slug].astro:103-114` emite `Legislation` + FAQ desde 2026-08-10.
- `Layout.astro:242-250` serializa `structuredData` opcional del caller.

## Steps

1. **Re-verificación de claims** contra código y un build local
   (`dist/**`): (a) calculadora "solo WebPage", (b) glosario breadcrumb
   termina en hub, (c) ley sin JSON-LD, (d) hubs, (e) Article+Breadcrumb.
   Documentar el resultado; los claims que resulten staleness del informe se
   registran como "no defecto" en el PR (no se "arregla" lo que ya está bien).
2. Extraer `src/utils/schema/breadcrumbs.ts` con el builder de
   `BreadcrumbList` (pathname → items → URL canónica final) y hacer que
   `Breadcrumb.astro` lo consuma; tests unitarios de labels/URLs/hub.
3. Cerrar gaps confirmados, típicamente: `WebApplication.breadcrumb` /
   `isPartOf` en `CalculatorJsonLd.astro`; breadcrumb del glosario terminando
   en la canónica del término; completar `Legislation` si le falta
   breadcrumb/`isPartOf`.
4. Guardas en `check-postbuild.mjs` (con tests):
   - `jsonld-parse`: todo bloque `application/ld+json` parsea con `JSON.parse`.
   - `jsonld-breadcrumb-final-canonical`: si hay `BreadcrumbList`, su último
     `ListItem.item` == canonical de la página.
5. Validación manual con Rich Results Test sobre 5 plantillas (calculadora,
   post, glosario, ley, hub) y pegar evidencia en el PR.

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Unit | `pnpm run test` | verde |
| Build + guardas | `pnpm run build` | 14 checks (12 + 2) |
| JSON-LD inválido | idem | 0 bloques |
| Breadcrumb final | idem | 100% == canonical |
| CI mirror | `pnpm run check:ci` | exit 0 |

## Done criteria

- [ ] Claims SEO-06 re-verificados y documentados (real vs staleness).
- [ ] Gaps confirmados cerrados; 0 bloques JSON-LD inválidos.
- [ ] Breadcrumb final == canonical en toda página con `BreadcrumbList`.
- [ ] Guardas con tests; gates en verde.

## STOP conditions

- Cambiar el schema altera el render o rompe el build.
- Un guard produce falsos positivos sobre JSON-LD legítimo (ajustar allowlist,
  no desactivar).
- Un "gap" del informe resulta staleness: no tocarlo, documentarlo.

## Rollback

Revertir por paso (componentes y guardas independientes). Sin migración de
datos ni cambios de URL.
