# Plan 120: Contrato de indexabilidad declarativo + tracking params (SEO-08, sistémico 1/4)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED (toca Layout/sitemap/robots; requiere ADR)
- **Depends on**: decisión del mantenedor solo para el paso 4 (SEO-08)
- **Category**: arquitectura SEO / gobernanza de indexabilidad
- **Planned at**: commit `da8e72da`, 2026-09-29
- **Status**: DONE — contrato en `src/config/indexability.ts` consumido por
  `Layout.astro`, `astro.config.ts` y `search.astro`; metas inline eliminadas
  (excepciones documentadas: posts `unlisted` y rutas og). SEO-08 opción A:
  se mantiene `?src=` con canonical limpia (verificada) y guarda
  `no-tracking-params`. 5 guardas nuevas → build con 19 checks (14 + 5; el
  plan estimaba 17 porque no contaba las 2 guardas del plan 118). ADR
  `ADR-20260929-declarative-indexability-contract` + invariante
  `INVARIANT.SEO.INDEXABILITY.CONTRACT`.
- **Evidence**: `docs/reports/AUDIT-SEO-2026-09-28.md` (SEO-08, Fixes
  sistémicos 1 y 4, Regression checks SEO-001..013/021..023)

## Why this matters

La conclusión central del informe: la indexabilidad, la intención y el linking
deben dejar de ser consecuencias de los templates y pasar a ser **contratos
verificables**. Hoy la indexabilidad vive dispersa: filtros del sitemap en
`astro.config.ts`, comentarios y reglas en `robots.txt.ts`, metas `noindex`
inline en 5+ páginas y guardas parciales en `check-postbuild.mjs`. Eso ya
produjo el defecto SEO-01 (tags indexables) y hace imposible razonar el
sitemap como `canonical ∩ indexable ∩ successful`.

## Scope

**In scope**

- `src/config/indexability.ts` (nuevo) — contrato por patrón.
- `src/layouts/Layout.astro`, `astro.config.ts`, `src/pages/robots.txt.ts` —
  consumir el contrato.
- Páginas con `noindex` inline: `tags/index.astro`,
  `tags/[tag]/[...page].astro`, `posts/[...page].astro`, `buscar.astro`,
  `search.astro` — migrar al contrato.
- `scripts/check-postbuild.mjs` + tests — guardas derivadas.
- `docs/adr/` — ADR obligatorio (arquitectura + CI).
- `plans/README.md`.

**Out of scope**

- Cambios de URLs/slugs (requieren snapshots + ADR propios).
- SEO-02/05/06 (planes 117/119/118).

## Verificación previa (2026-09-29)

- Sitemap: filtros `SITEMAP_EXCLUDED_PATHS`, `SEARCH_PATH`, `BUSCAR_PATH`,
  `DEV_TOOLS_PATH`, `TAGS_ROOT_PATH` (`astro.config.ts:182-194`) + serializer
  lastmod (`:200-270`).
- `robots.txt.ts`: `Allow: /`, `Disallow: /pagefind/`, bots de IA; comentario
  "crawlables para que los bots vean el noindex" para `/buscar/`, `/search/`,
  `/tags/`.
- `noindex` inline: `tags/index.astro`, `tags/[tag]/[...page].astro`,
  `posts/[...page].astro` (paginación), `buscar.astro`, `search.astro`,
  `PostDetails.astro` (caso especial), rutas og (X-Robots-Tag).
- Guardas existentes: `tags-noindex`, `internal-links-trailing-slash`,
  `sitemap-lastmod-complete` (plan 116).
- `/apoyar/?src=…` sitewide desde `Footer.astro:29` y
  `SupportCallout.astro:37`, con `data-analytics-*` ya presentes; el canonical
  limpia el query.

## Steps

1. **ADR**: registrar el contrato como fuente única de verdad de
   indexabilidad (contexto, decisión, consecuencias, migración).
2. Diseñar `src/config/indexability.ts`: reglas por patrón
   `{match, indexable, inSitemap, crawl, robotsMeta, reason}` con helpers
   `isIndexable(pathname)`, `isInSitemap(pathname)`,
   `robotsMetaFor(pathname)`; tabla de casos documentada.
3. Migrar consumidores: `Layout.astro` (meta robots desde el contrato),
   filtro del sitemap en `astro.config.ts`, `robots.txt.ts` y las páginas con
   `noindex` inline (las metas dejan de estar hardcodeadas).
4. **Decisión del mantenedor (SEO-08)**: (A) mantener `?src=` con canonical
   limpia + fuera de sitemap (estado actual) y añadir allowlist en guarda; o
   (B) eliminar el query y quedarse solo con `data-analytics` (requiere
   confirmar que `/apoyar/` no pierde atribución necesaria).
5. Sitemap derivado: verificar/emitir `canonical ∩ indexable ∩ successful`;
   snapshot antes/después en `output/validation/`.
6. Guardas nuevas en `check-postbuild.mjs` (+tests), primero como warnings
   hasta acumular evidencia (hard gates propuestos: contrato + enlaces
   internos): `sitemap-indexable-only` (SEO-004), `sitemap-canonical-match`
   (SEO-003), `utilitarias-noindex` (SEO-007), `no-tracking-params` con
   allowlist (SEO-009), `no-future-lastmod` (SEO-013).
7. Documentar el contrato en `context/INVARIANTS.md` / `context/CONTRACTS.md`
   si aplica (nuevo invariante de indexabilidad).

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Unit contrato | `pnpm run test` | tabla de casos verde |
| Build + guardas | `pnpm run build` | 19 checks (14 + 5) |
| Sitemap | comparar snapshot | sin URLs no indexables ni no-canónicas |
| robots.txt | `dist/robots.txt` | coherente con el contrato |
| CI mirror | `pnpm run check:ci` | exit 0 |
| ADR | revisión | mergeado con el plan |

## Done criteria

- [x] Contrato único consumido por Layout, sitemap y páginas utilitarias
      (robots.txt gobierna crawl y queda fuera, según el ADR).
- [x] 0 `noindex` inline fuera del contrato (excepciones documentadas: posts
      `unlisted` y rutas og).
- [x] Sitemap == `canonical ∩ indexable ∩ successful`.
- [x] SEO-08 decidido e implementado (opción A) con guarda.
- [x] Guardas con tests; ADR mergeado; gates en verde.

## STOP conditions

- El contrato diverge del comportamiento observado en un build → detener y
  reportar (no forzar el contrato para "hacer pasar" el gate).
- Cualquier cambio que altere URLs públicas o RSS → snapshot + ADR propios
  antes de continuar.
- La decisión SEO-08 no está tomada → no ejecutar el paso 4.

## Rollback

Revertir por pasos. El contrato puede convivir temporalmente con las metas
inline si la migración se hace por páginas (cada paso deja el sitio
funcionando).
