# Plan 139: `/archives/` a `noindex,follow` vía contrato (opción B aprobada)

> **Executor instructions**: cambio acotado de contrato de indexabilidad + ADR.
> No toca la página, sus enlaces ni robots.txt (la ruta sigue existiendo y
> crawlable para que los bots lean el `noindex`). **Gate temporal: no iniciar
> antes de 2026-10-05 (post-W40)**. Decisión del owner: opción B del briefing
> `docs/backlog/DECISION-archives-indexabilidad-2026-09-30.md`.

## Status

- **Priority**: P2 (higiene de índice; no urgente)
- **Effort**: S
- **Risk**: LOW (sin cambio de ruta ni de contenido)
- **Depends on**: decisión del owner (tomada 2026-09-30) + gate post-W40
- **Category**: SEO / contrato de indexabilidad (plan 120)
- **Planned at**: commit `13c2248e`, 2026-10-01
- **Status**: TODO — gate temporal post-W40 (2026-10-05)

## Contexto

`/archives/` acumula 0 impresiones / 0 clics en 8 semanas y coverage
«Crawled - currently not indexed» (plan 128 §8); el plan 116 (SEO-03) decidió
mantenerla y enlazarla. Con la evidencia nueva, el owner eligió la opción B:
declarar `noindex,follow` en el contrato (plan 120) para que la exclusión sea
intencional y los reportes de coverage dejen de mostrar ambigüedad. Sin
impacto para usuarios y con `follow` para conservar el flujo interno.

## Scope

**In scope**

- `src/config/indexability.ts` — regla para `/archives/`.
- Test del contrato (nuevo `tests/unit/indexability.test.ts`, o el archivo
  unitario que corresponda).
- `docs/adr/ADR-20261001-archives-noindex.md` (nuevo) + `docs/adr/README.md`.
- Baseline de `scripts/check-indexable-url-freeze.mjs` si el gate lo exige
  (cambio intencional registrado con snapshot antes/después).
- `docs/backlog/DECISION-archives-indexabilidad-2026-09-30.md` (estado),
  `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` (§2/§4 fila 8),
  `plans/README.md`.

**Out of scope**

- Redirección/consolidación (opción C), borrado de la página o de sus enlaces.
- `robots.txt` (Disallow impediría leer el `noindex`).
- RSS, contenido y demás rutas.

## Steps

1. Snapshots antes: rutas (`check:routes`), RSS (`check:rss` sobre build) y
   conteo de URLs del sitemap; guardarlos como evidencia del cambio.
2. Regla en `indexability.ts`: `pathname === "/archives/"` →
   `noindexFollow("archivo de navegación interno (decisión owner 2026-09-30, plan 139)")`.
3. Test unitario: `/archives/` → `indexable=false`, `inSitemap=false`,
   `robotsMeta="noindex,follow"`; resto del contrato sin cambios.
4. ADR: cambio de contrato, evidencia GSC, alternativas (A/C/D), decisión y
   consecuencias; actualizar el índice de ADR.
5. Gates: `pnpm run check:ci`; build completo con `check:indexable-url-freeze`
   (si exige excepción, registrarla según `scripts/lib/url-freeze-exceptions.mjs`
   con la decisión del owner), `check:rss`, `check:routes`, `check:postbuild`
   (sitemap-noindex-free), `prettier` y `check:docs`.
6. Cerrar: briefing actualizado a «ejecutada (opción B)», fila 8 del artifact,
   plan archivado con commit + índices.

## Verificación

| Comprobación | Criterio |
|---|---|
| Contrato | Test del caso `/archives/` verde; sin regresiones en otros paths |
| Sitemap | `/archives/` ausente; resto de URLs indexables intactas |
| HTML | `<meta name="robots" content="noindex,follow">` en `dist/archives/index.html` |
| Rutas/RSS | Sin cambios (`check:routes`, `check:rss`) |
| Gates | `check:ci` + build + postbuild verdes; ADR indexado |

## STOP / HALT

- Si `check:indexable-url-freeze` bloquea la remoción sin excepción formal →
  registrar la excepción aprobada por el owner en el esquema existente; no
  forzar el baseline a mano.
- Si el build muestra que la página perdía enlaces internos al aplicarse
  `noindex` (no debería: `follow`), detener y reportar.
- No iniciar antes de 2026-10-05.

## Rollback

- Revertir el commit de la regla + ADR + baseline; el contrato vuelve a
  indexable por defecto y Google re-decide por sí solo (sin garantía de timing).

## Progress log

- 2026-10-01 — Plan creado tras aceptación del owner (opción B). No ejecutado
  (gate post-W40).