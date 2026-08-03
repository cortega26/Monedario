# PLAN — Re-auditoría de vigencia editorial (timeliness)

**Estado:** PARCIALMENTE RESUELTO — 5/9 cerrados por automatización (Bucket C);
4/9 siguen BLOCKED, requieren sign-off humano (Bucket A)
**Inicio:** 2026-08-03
**Fuente:** issue #386 (triage) · `editorial-timeliness-report` (run 30804908326)
**Gate de salida:** los 9 artículos con `reviewDate` actualizado y el gate `check:editorial-timeliness` en verde

## Contexto

El audit diario detectó 9 artículos con ventana de revisión vencida. El snapshot
económico está fresco (2026-08-03) y `driftCount=0` (los valores sincronizados
coinciden). La deuda es la **revisión editorial de vigencia** (YMYL): confirmar que
el contenido sigue siendo exacto y vigente tras el refresh de datos.

**Corrección post-investigación (2026-08-03):** la clasificación original de los 5
artículos de cadencia 30 días como Bucket B (re-auditoría ComplianceAgent) era
incorrecta. Para `sourceMode: runtime_snapshot_plus_editorial_review`, el propio
checker (`check-editorial-timeliness.mjs`, ver comentario junto a
`effectiveReviewDate`) trata un snapshot volátil fresco como chequeo editorial
efectivo — no requiere re-auditoría de contenido. El staleness real venía de un
defecto de automatización: el workflow `Refresh Volatile Data Snapshots` fallaba
semanalmente desde 2026-07-05 (`prettier --check` del hook pre-commit rechazaba
el frontmatter inyectado por `compute-review-policies.mjs`, que usa comillas
simples vía `js-yaml dump()` en vez de las dobles que exige el repo), por lo que
el snapshot quedó congelado en 2026-07-01. Ese defecto es Bucket C (estructural,
de esta sesión) — se corrigió formateando la salida del generador con Prettier
antes de escribir, y se refrescó el snapshot. El SLA de los 5 artículos se
resolvió por el mecanismo de diseño, sin re-auditoría de contenido ni cambios en
el cuerpo de los artículos. Ver commit `64e3ffab` / PR de esta corrección.

Clasificación revisada (protocolo `EDITORIAL_AI_PIPELINE.md` §9.2):

- **Bucket A (humano) — sigue BLOCKED:** verificación de fuentes oficiales +
  sign-off de vigencia de los 4 artículos de cadencia 90 días.
- **Bucket B:** ninguno. La re-auditoría ComplianceAgent no aplicaba a los 5
  artículos de cadencia 30 días — ver corrección arriba.
- **Bucket C — RESUELTO esta sesión (2026-08-03):** defecto de automatización en
  `compute-review-policies.mjs` (formato Prettier) que bloqueaba el refresh
  semanal del snapshot volátil; snapshot re-generado.

## Artículos

### Cadencia 30 días — runtime_snapshot_plus_editorial_review (RESUELTO — Bucket C)

| Slug | reviewDate (frontmatter) | dueDate original |
|---|---|---|
| `que-es-la-uf` | 2026-04-04 | 2026-07-31 |
| `que-es-el-ipc-chile-como-se-calcula` | 2026-03-11 | 2026-07-31 |
| `deposito-a-plazo-uf-vs-pesos` | 2026-03-30 | 2026-07-31 |
| `reajuste-arriendo-uf-ipc-chile` | 2026-03-12 | 2026-07-31 |
| `que-es-el-apv` | 2026-03-12 | 2026-07-31 |

Resuelto 2026-08-03: snapshot volátil refrescado (era la causa raíz del SLA
vencido, no el `reviewDate` del frontmatter — ese campo no se tocó). `driftCount=0`
tras el refresh; ningún `expectedValue` quedó desincronizado.

### Cadencia 90 días — manual_review (sigue BLOCKED — Bucket A)

| Slug | reviewDate | dueDate |
|---|---|---|
| `contribuciones-bienes-raices-chile` | 2026-05-03 | 2026-08-01 |
| `gratificacion-legal-chile` | 2026-05-03 | 2026-08-01 |
| `operacion-renta-centro` | 2026-04-29 | 2026-07-28 |
| `pgu-pension-garantizada-universal` | 2026-05-03 | 2026-08-01 |

## Pendiente — Bucket A (humano, no tocar)

Los 4 artículos de cadencia 90 días requieren verificación de fuentes oficiales
(SII/BPS) y sign-off de vigencia por un editor humano. Ningún agente debe:

- Editar `reviewDate`/`updatedDate`/`validAsOf` de estos 4 slugs para "limpiar" el SLA.
- Marcar gates en `07-publish-packet.md`.
- Asumir que el patrón de esta sesión (refresh de snapshot) aplica — su
  `sourceMode` es `manual_review` / `manual_review_with_official_sources`, no
  `runtime_snapshot_plus_editorial_review`; no tienen mecanismo de extensión
  automática.

## Criterio de cierre

- `pnpm run check:editorial-timeliness` → `staleCount=0`. Estado actual (post
  Bucket C, 2026-08-03): `staleCount=4` (solo los Bucket A pendientes).
- El issue #386 se cierra automáticamente cuando el sign-off humano de los 4
  artículos restantes actualice su `reviewDate` y el checker vuelva a verde.
- El CI scheduled y el audit diario reflejarán `staleCount=4` hasta ese sign-off.

## Notas

- Resuelto: `volatileSnapshotLastUpdated` congelado en 2026-07-01 — causa raíz
  identificada (defecto de formato Prettier en `compute-review-policies.mjs`
  rompía el hook pre-commit dentro de `create-pull-request`, revirtiendo el
  commit automático cada semana desde 2026-07-05 sin señal visible de fallo en
  el resumen del job). Corregido y snapshot refrescado a 2026-08-03.
- La exclusión `brace-expansion@1.1.17` de la política de 7 días es removible
  desde 2026-08-05 (sin relación con este plan).
