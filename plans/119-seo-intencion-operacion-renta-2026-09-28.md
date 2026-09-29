# Plan 119: Gobernanza de intención — cluster Operación Renta (SEO-05)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED-HIGH (YMYL + posible cambio de URL si se consolida)
- **Depends on**: decisión del mantenedor (paso 1) + revisión editorial humana
  si hay consolidación
- **Category**: SEO de intención / gobernanza editorial
- **Planned at**: commit `da8e72da`, 2026-09-29
- **Status**: TODO — requiere selección del mantenedor (Fase 2 SEO)
- **Evidence**: `docs/reports/AUDIT-SEO-2026-09-28.md` (SEO-05)

## Why this matters

El informe marca dos landings que cubren la misma intención primaria:
`/guias/impuestos-personas/operacion-renta/` y `/posts/operacion-renta-centro/`
(obligación, F22, plazos y devolución). Datos GSC W39:
`/calculadoras/operacion-renta/` rinde (33 clicks / 254 impr, pos 4,9),
mientras la guía tiene 0 clicks / 82 impr (pos 11,5) y
`/posts/operacion-renta-f22-checklist/` (owner declarado) 0/8 (pos 15,3).
Además, las landings `.astro` de guías **no pasan por el registry de
intención** (`topicRole`/`canonicalTopic` solo aplican a colecciones), así que
su rol no está gobernado. El informe pide resolverlo antes de AT2027.

## Scope

**In scope**

- `src/config/editorial-topic-policy.mjs` — registry de intención para
  landings de guías.
- `src/pages/guias/impuestos-personas/operacion-renta/index.astro` y
  `src/data/blog/operacion-renta-centro.md` — diferenciación o consolidación.
- `scripts/check-frontmatter.mjs` o guarda postbuild — validación del registry.
- `docs/adr/` + snapshots de rutas/RSS **solo si** hay consolidación.
- `plans/README.md`.

**Out of scope**

- Otros clusters (este plan es el piloto; el patrón se replica después).
- SEO-02/06/08 (planes 117/118/120).

## Verificación previa (2026-09-29)

- Registry existente: `CANONICAL_TOPIC_REGISTRY` en
  `src/config/editorial-topic-policy.mjs:21-241`; roles `owner|support|reference`
  (`:1`); clusters endurecidos: sueldo-remuneraciones, pensiones-afp,
  ahorro-e-inversion, uf-costo-de-vida (`:3-8`). `impuestos-personas` no está
  endurecido.
- `impuestos-personas` → `f22-revisar-enviar` → owner
  `operacion-renta-f22-checklist`; `operacion-renta-centro` es `support` del
  mismo topic (`src/data/blog/operacion-renta-centro.md:14-16`).
- La guía es `.astro` estático: fuera de `content.config.ts` y del registry.
- GSC W39 en `output/operations/data-signals/gsc/2026-W39-{pages,queries}.json`.

## Steps

1. **Decisión del mantenedor** (no improvisar). Opciones:
   - **A (recomendada)**: diferenciar. La guía queda como hub de orientación
     del cluster (checklist y ruta de páginas) y el owner sigue siendo
     `operacion-renta-f22-checklist`; se elimina la duplicación de
     obligación/F22/plazos/devolución de la guía.
   - **B**: consolidar `operacion-renta-centro` → guía (redirect 301, snapshots
     de rutas/RSS, ADR, actualizar sitemap/lastmod).
   - **C**: consolidar la guía → owner (mismo protocolo que B).
2. Incorporar las landings de guías al registry: mapa
   `GUIDE_INTENT_REGISTRY` (o props declaradas) en
   `editorial-topic-policy.mjs` con `topicRole`/`canonicalTopic`, validado en
   `check:frontmatter` o guarda postbuild.
3. Ejecutar la opción elegida (contenido solo si A; redirects + ADR si B/C).
   Si A: ajustar H1/title/intro de la guía para intención de hub, enlazar
   owner y soportes, y quitar solapamiento.
4. Guarda SEO-018: cada `canonicalTopic` tiene ≤1 `owner` y toda landing de
   cluster declara su rol. Tests con fixtures.
5. Si hubo consolidación: revisión editorial humana (separación de funciones
   YMYL) + monitoreo GSC W+2/W+4 documentado en el PR.

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Frontmatter/registry | `pnpm run check:frontmatter` | verde |
| Unit | `pnpm run test` | verde |
| Build | `pnpm run build` | guardas verdes |
| Rutas/RSS (solo B/C) | `pnpm run check:routes` + `check:rss` | snapshots before/after |
| CI mirror | `pnpm run check:ci` | exit 0 |
| Negocio (post-deploy) | GSC W+2/W+4 | owner no degrada; guía sin canibalizar |

## Done criteria

- [ ] Opción A/B/C elegida por el mantenedor y documentada.
- [ ] Guías cubiertas por el registry de intención con rol declarado.
- [ ] ≤1 owner por `canonicalTopic` en `impuestos-personas` (guarda activa).
- [ ] Sin solapamiento de intención detectable en title/H1/description.
- [ ] Si hubo consolidación: snapshots + ADR + revisión editorial humana.

## STOP conditions

- La decisión del paso 1 no está tomada → detener.
- Consolidar implica cambiar un slug público → obligatorio snapshot
  rutas/RSS antes-después + ADR; sin eso, no ejecutar.
- Cambios de contenido YMYL sin revisión editorial humana → no publicar.

## Rollback

Opción A: revertir contenido de la guía. Opciones B/C: restaurar la URL
original desde el snapshot y revertir el redirect; el owner no cambia.
