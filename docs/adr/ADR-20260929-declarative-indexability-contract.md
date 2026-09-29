# ADR-20260929-declarative-indexability-contract

Date: 2026-09-29
Status: Accepted

## Context

La indexabilidad vivía dispersa: filtros del sitemap en `astro.config.ts`,
metas `noindex` inline en varias páginas, comentarios en `robots.txt.ts` y
guardas parciales en `check-postbuild.mjs`. Esa dispersión produjo el defecto
SEO-01 (taxonomía de tags accidentalmente indexable) y hacía imposible razonar
el sitemap como `canonical ∩ indexable ∩ successful`. La auditoría SEO
2026-09-28 concluye que la indexabilidad debe ser un contrato verificable y no
una consecuencia de los templates.

## Decision

`src/config/indexability.ts` es la fuente única de verdad para la indexabilidad
direccionable por path (meta robots, inclusión en sitemap y razón). Lo
consumen:

- `src/layouts/Layout.astro` para el meta robots;
- `astro.config.ts` para el filtro del sitemap;
- `src/pages/search.astro` (página utilitaria fuera de Layout).

Excepciones dependientes de datos quedan fuera del contrato y documentadas:
posts `unlisted` (`PostDetails.astro` emite `noindex,follow` y el sitemap los
excluye vía `SITEMAP_EXCLUDED_PATHS`) y rutas de imagen social (`X-Robots-Tag`
en headers). `robots.txt` gobierna crawl y no se deriva del contrato: las
páginas no indexables siguen siendo crawlables para que los bots lean el
`noindex`.

## Consequences

- Positivas: un solo lugar para cambiar reglas; guardas postbuild derivadas;
  sitemap consistente con canonical y noindex; sin metas duplicadas.
- Trade-offs: el contrato asume deploy en raíz (paths site-local); las
  excepciones de datos siguen requiriendo `SITEMAP_EXCLUDED_PATHS` y el meta de
  `PostDetails`.
- Costo operativo: mantener la tabla de reglas y sus tests.

## Alternatives considered

- Registry con canonical por página (más ambicioso): descartado por ahora;
  requiere migrar canonical y sitemap completos.
- Mantener la lógica inline y agregar solo guardas: descartado; no elimina la
  deriva que ya produjo SEO-01.
- Derivar `robots.txt` del contrato: descartado; crawl e indexación son
  decisiones distintas.

## Verification

- `pnpm run test` — tests del contrato y de las guardas.
- `pnpm run build` — guardas `sitemap-indexable-only`,
  `sitemap-canonical-match`, `utilitarias-noindex`, `no-tracking-params`,
  `no-future-lastmod`.
- `pnpm run check:ci` — exit 0.
