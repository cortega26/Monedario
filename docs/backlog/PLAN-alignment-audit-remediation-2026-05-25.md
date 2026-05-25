# Plan de remediacion - auditoria de alineamiento 2026-05-25

Status: active
Created: 2026-05-25
Source audit: [`docs/reports/AUDIT-ALIGNMENT-2026-05-25.md`](../reports/AUDIT-ALIGNMENT-2026-05-25.md)

## Scope block

- In scope for this plan: remediar hallazgos de alineamiento editorial, canibalizacion, backlinks internos, owner/support boundaries, hub model y guardrails warning-first.
- Out of scope for this plan unless a later task explicitly authorizes it: cambios de slug, redirects, route baseline updates, RSS baseline updates, nuevas superficies indexables, refresh YMYL sustantivo sin pipeline, cambios de calculo o cambios de policy registry que alteren contratos publicos.
- Default execution mode: batches pequenos, con change control por batch.

## Authority guardrails

Preservar:

- `URL.PUBLIC.NO_POST_ID`
- `FRONTMATTER.VALID`
- `ROUTES.NO_SILENT_CHANGES`
- `RSS.NO_REMOVALS`
- `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`
- `INVARIANT.EDITORIAL.CLUSTER_INTERNAL_LINK_MIN`
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`
- `CONTRACT.PUBLIC_URLS`
- `CONTRACT.FRONTMATTER_POLICY`
- `CONTRACT.ARTICLE_STRUCTURE`
- `CONTRACT.YMYL_RESPONSE_STRUCTURE`

Si una remediacion toca contenido YMYL de forma sustantiva, aplicar `docs/editorial/NORMA_YMYL.md` y `context/EDITORIAL_AI_PIPELINE.md`. Si solo ajusta enlaces internos, title/meta menor o copy de orientacion sin nuevas claims, registrar como editorial maintenance y ejecutar gates.

## Priorizacion

| ID | Prioridad | Esfuerzo | Estado | Paths esperados | Criterio de cierre |
|---|---|---:|---|---|---|
| ALIGN-001 | P1 | S | Done | `src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md`, `src/data/blog/como-invertir-en-etfs-desde-chile.md` | Owner general y ETF muestran boundaries visibles en title/meta/intro/H2 o bloque "si tu duda es otra"; `audit:topic-overlap` puede seguir warning pero queda decision documentada. |
| ALIGN-002 | P1 | S | Done | `src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md`, `src/data/blog/fondos-mutuos-comisiones-rescate-impuestos.md` | Fondos mutuos queda enfocado en costos/rescate/impuestos; owner general conserva comparacion de instrumentos. |
| ALIGN-003 | P2 | XS | Done | `src/data/blog/operacion-renta-centro.md`, `src/data/blog/operacion-renta-f22-checklist.md` | Centro queda claro como entrada/hub estacional; F22 queda como owner checklist. |
| ALIGN-004 | P2 | XS | Done | `src/data/blog/seguro-cesantia-cuenta-individual-vs-fondo-solidario.md`, `src/data/blog/seguro-de-cesantia.md` | Soporte CIC/FCS reduce competencia por head term y refuerza enlace al owner. |
| ALIGN-005 | P2 | S | Done | `src/data/blog/como-calcular-sueldo-liquido.md`, `src/data/blog/sueldo-imponible-chile.md`, `src/data/blog/descuentos-de-sueldo.md`, `src/data/blog/liquidacion-de-sueldo.md` | Piezas de sueldo tienen decision-routing visible y backlinks cruzados coherentes. |
| ALIGN-006 | P2 | S | Done | `src/data/blog/como-cambiarse-de-afp.md`, `src/data/blog/fondos-afp-a-b-c-d-e.md`, `src/data/blog/que-es-la-cuenta-2-afp.md`, `src/data/blog/como-leer-cartola-afp-chile.md` | Pensiones AFP diferencia cambio de AFP, fondos, cuenta 2 y cartola sin competir por la misma accion. |
| ALIGN-007 | P2 | XS | Done | `src/data/blog/que-es-el-ipc-chile-como-se-calcula.md`, `src/data/blog/reajuste-arriendo-uf-ipc-chile.md` | IPC queda conceptual; reajuste arriendo queda caso contractual/tool-led. |
| ALIGN-008 | P2 | M | Pending | Articulos con inbound `<=1`, hubs y calculadoras relacionadas | Cada owner prioritario recibe al menos un backlink contextual nuevo desde una pieza/hub/tool naturalmente relacionada. |
| ALIGN-009 | P2 | M | Pending | `src/config/editorial-hub-model.mjs`, hubs `src/pages/guias/**`, docs policy si aplica | Decision documentada: ampliar hub model o mantener control manual; si se amplia, hacerlo warning-first con tests/checks. |
| ALIGN-010 | P3 | S | Pending | `scripts/audit-topic-overlap.mjs`, tests si existen o se agregan | Script soporta `--all` o salida JSON para auditorias completas sin cambiar comportamiento default. |

## Orden de ejecucion recomendado

1. Batch A - `ahorro-e-inversion` P1: ejecutar `ALIGN-001` y `ALIGN-002` juntos. Es el unico bloque con riesgo de canibalizacion fuerte.
2. Batch B - Boundaries P2 por cluster: ejecutar `ALIGN-003`, `ALIGN-004`, `ALIGN-005`, `ALIGN-006`, `ALIGN-007` en PRs pequenos por cluster.
3. Batch C - Backlinks internos: ejecutar `ALIGN-008` con cambios de enlaces solamente, maximo 2 inter-cluster links nuevos por articulo segun `context/INTER_CLUSTER_LINKING.md`.
4. Batch D - Guardrails warning-first: ejecutar `ALIGN-009` y `ALIGN-010` solo despues de cerrar los ajustes editoriales, para no automatizar una politica todavia inestable.

## Verification commands

Para cualquier batch editorial:

```bash
pnpm run check:frontmatter
pnpm run check:links
pnpm run check:editorial
pnpm run check:editorial-timeliness
pnpm run audit:topic-overlap
```

Si el batch toca rutas, canonical, RSS, helpers URL o baselines:

```bash
pnpm run check:no-postid-urls
pnpm run check:routes
pnpm run check:rss
```

Si el batch toca scripts/config:

```bash
pnpm run check:context
pnpm run check:policy-registry
pnpm run test
```

## Acceptance criteria

- No P0 nuevo.
- No owner duplicado por `cluster + canonicalTopic`.
- No ruta removida y no RSS item removido.
- No nuevo articulo o superficie indexable sin ownership decision.
- No claims YMYL nuevas sin pipeline correspondiente.
- `pnpm run check:links` sigue en 0 links rotos.
- `audit:topic-overlap` puede seguir reportando candidatos, pero cada P1/P2 remanente debe tener decision explicita `keep`, `support`, `retarget`, `rename`, `merge`, `redirect` o `needs-policy-update`.

## Rollback

- Para batches documentales: revertir el archivo documental o la seccion agregada.
- Para cambios editoriales menores: revertir el commit del batch; no requiere migracion de datos.
- Para cambios de route/RSS baseline: revertir baseline y cambio de ruta juntos; si hay remocion accidental, estado `HALT`.
- Para guardrails nuevos: mantener modo warning-first en el primer PR; rollback debe ser revertir script/config sin tocar contenido.

## Progress log

- 2026-05-25: Auditoria creada. No se aplicaron remediaciones de contenido. Estado general: `PASS with editorial remediation backlog`; `HALT: none`.
- 2026-05-25: **Batch A cerrado.** ALIGN-001 y ALIGN-002 aplicados al owner general (`ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md`): title y description re-enfocados a "guia de seleccion/comparacion"; dos bloques de routing convertidos a preguntas explicitas tipo "¿Tu duda es X?"; ETF y fondos mutuos sin cambios (ya diferenciados). `check:frontmatter`, `check:links`, `check:editorial` y `audit:topic-overlap` sin errores nuevos. Decision: `keep` para ambos pares — no fusionar, no redirigir.
- 2026-05-25: **Batch B cerrado.** ALIGN-003..ALIGN-007 completados. ALIGN-003: centro title quitó "guia completa", description quitó "qué hacer si debes pagar" — F22 sin cambios. ALIGN-004: soporte CIC/FCS title cambiado a "CIC vs Fondo Solidario: cómo funciona cada capa…" para no competir por head term. ALIGN-005: routing añadido en intros de sueldo-imponible, descuentos-de-sueldo y liquidacion-de-sueldo (como-calcular ya tenia routing). ALIGN-006: routing añadido en como-cambiarse-de-afp y como-leer-cartola-afp-chile (fondos-afp y cuenta-2 ya tenian routing). ALIGN-007: links reciprocos IPC↔reajuste-arriendo añadidos en intros. 234 internal links — 0 rotos. Todos los checks OK.

