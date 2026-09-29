# Plan 116: Remediación SEO técnica (auditoría 2026-09-28)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Update the status row for this plan in `plans/README.md`.

## Status

- **Priority**: P1 (SEO-01) / P2–P3 resto
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: SEO técnico / gobernanza de indexabilidad
- **Planned at**: commit `61b8a0ae`, 2026-09-29
- **Status**: DONE — SEO-01/03/04/07 + guardas implementados y verificados:
  build 12 checks, 185/185 URLs con lastmod, 137/137 tags `noindex,follow`,
  196 Playwright a11y, `check:ci` exit 0. Fase 2 (SEO-02/05/06/08) fuera de
  alcance.
- **Evidence**: `docs/reports/AUDIT-SEO-2026-09-28.md`

## Scope

**In scope (Fase 1, este plan)**

- `src/pages/tags/[tag]/[...page].astro` — SEO-01
- `src/components/MethodologyBlock.astro` — SEO-07
- `scripts/build-page-lastmod.mjs` + `astro.config.ts` — SEO-04
- `src/pages/posts/[...page].astro` — SEO-03 (enlazar `/archives/`)
- `scripts/check-postbuild.mjs` + tests — guardas SEO-01/04/07
- `plans/README.md`

**Out of scope (Fase 2+, requiere decisiones editoriales/IR)**

- SEO-02 (linking sitewide por cluster), SEO-05 (canibalización Operación
  Renta), SEO-06 (schema por template), SEO-08 (tracking params) y el registry
  declarativo de indexabilidad.

## Verificación previa en el repo (2026-09-29)

- **SEO-01 confirmado**: `tags/[tag]/[...page].astro` solo pone `noindex` en
  página > 1; `dist/tags/**` tiene 0 páginas con noindex. El sitemap ya excluye
  `/tags/`.
- **SEO-07 confirmado**: 22 `href="/metodologia"` en dist; el default de
  `MethodologyBlock` se renderiza sin `getPath()`.
- **SEO-04 confirmado**: 97/185 URLs con `lastmod`; faltan glosario, leyes y
  10 posts sin `updatedDate` en el índice.

## Steps

1. **SEO-01**: `noindex,follow` en todas las páginas de tag (no solo
   paginación). Mantener crawl permitido y exclusión de sitemap.
2. **SEO-07**: `href={getPath(methodologyHref)}` en `MethodologyBlock`.
3. **SEO-04**: extender `build-page-lastmod.mjs` para indexar también
   `src/data/blog/*` → `/posts/<slug>/`, `src/data/glossary/*` →
   `/glosario/<slug>/` y `src/data/laws/*` → `/leyes/<slug>/` (fecha de último
   commit). En `astro.config.ts`, usar el índice de páginas como fallback del
   `updatedDate` de posts.
4. **SEO-03**: enlazar `/archives/` desde `/posts/` (mantiene su valor y deja
   de ser orphan).
5. **Guardas** en `check-postbuild`: `tags-noindex` (noindex,follow en todo
   `/tags/**` + ausencia en sitemap), `internal-links-trailing-slash` (sin
   hrefs internos de un segmento sin slash) y `sitemap-lastmod-complete`
   (toda URL del sitemap con `lastmod` válido).

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Unit | `pnpm run test` | verde |
| Build + guardas | `pnpm run build` | 12 checks, 185/185 con lastmod |
| A11y | `pnpm exec playwright test tests/accessibility/` | verde |
| CI mirror | `pnpm run check:ci` | exit 0 |

## Done criteria

- [x] 100% de `/tags/**` con `noindex,follow`; 0 tags en sitemap.
- [x] 0 hrefs internos de un segmento sin trailing slash.
- [x] 185/185 URLs del sitemap con `lastmod`.
- [x] `/archives/` recibe al menos un enlace interno desde `/posts/`.
- [x] Guardas con tests; gates en verde.

## STOP conditions

- Cambiar el noindex de tags altera su paginación o el build.
- El índice de lastmod requiere historial git no disponible en el entorno.
- Un guard produce falsos positivos sobre hrefs legítimos (ajustar allowlist,
  no desactivar).

## Rollback

Revertir por paso; son cambios de template/config sin migración de datos.
