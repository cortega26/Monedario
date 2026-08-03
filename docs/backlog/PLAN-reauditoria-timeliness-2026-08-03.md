# PLAN — Re-auditoría de vigencia editorial (timeliness)

**Estado:** COMPLETADO 2026-08-03 — `check:editorial-timeliness` → `stale=0` · `drift=0`
**Inicio:** 2026-08-03
**Fuente:** issue #386 (triage) · `editorial-timeliness-report` (run 30804908326)
**Gate de salida:** los 9 artículos con `reviewDate` actualizado y el gate `check:editorial-timeliness` en verde

## Contexto

El audit diario detectó 9 artículos con ventana de revisión vencida. El snapshot
económico estaba fresco (2026-08-03) con `driftCount=0`. La deuda era la
**revisión editorial de vigencia** (YMYL): confirmar que el contenido sigue
siendo exacto y vigente tras el refresh de datos.

La resolución involucró tres líneas de trabajo del mismo día, que se integraron
en esta historia única:

1. **Bucket C (estructural, sesión previa — commit `64e3ffab` / PR #391):** la
   clasificación original de los 5 artículos de cadencia 30 días como Bucket B
   era incorrecta. Para `sourceMode: runtime_snapshot_plus_editorial_review`,
   el checker trata un snapshot volátil fresco como chequeo editorial efectivo —
   no requiere re-auditoría de contenido. El staleness real venía de un defecto
   de automatización: el workflow `Refresh Volatile Data Snapshots` fallaba
   semanalmente desde 2026-07-05 (`prettier --check` del hook pre-commit
   rechazaba el frontmatter inyectado por `compute-review-policies.mjs`, que usa
   comillas simples vía `js-yaml dump()` en vez de las dobles que exige el
   repo), por lo que el snapshot quedó congelado en 2026-07-01. Se corrigió
   formateando la salida del generador con Prettier y se refrescó el snapshot
   (última actualización: 2026-08-03).
2. **Re-auditoría ComplianceAgent (sesión fresca, subagentes — commit
   `a6576bd4`):** el runbook original del plan pedía la re-auditoría de los 5 de
   cadencia 30 días. Se ejecutó de todos modos con 5 ComplianceAgents
   adversariales: 4 con vigencia confirmada (`validAsOf`/`updatedDate`
   2026-08-03) y **1 con defecto real de contenido** — `que-es-la-uf` afirmaba
   "Hoy la UF vale $44.500" cuando la UF al 2026-08-03 era $40.844,79 (−8,2%).
   El mecanismo de snapshot resuelve el SLA pero no verifica el contenido; el
   defecto existía aunque el SLA estuviera verde. Se corrigió con sign-off del
   editor: valor, fecha de corte y fuente, conversor y tabla de reajuste
   recalculados.
3. **Bucket A (verificación de fuentes — PR #392):** los 4 artículos de cadencia
   90 días (`manual_review`) pasaron verificación de fuentes oficiales del
   editor con corrección de deriva de cifras reales (exención primera vivienda,
   IMM, umbrales) — no solo bump de fechas.

## Artículos

### Cadencia 30 días — runtime_snapshot_plus_editorial_review (RESUELTO)

| Slug | reviewDate (frontmatter) | Resolución |
|---|---|---|
| `que-es-la-uf` | updatedDate 2026-08-03 | re-auditoría: **defecto real corregido** (UF $44.500 → $40.844,79) |
| `que-es-el-ipc-chile-como-se-calcula` | updatedDate 2026-08-03 | re-auditoría PASS |
| `deposito-a-plazo-uf-vs-pesos` | validAsOf 2026-08-03 | re-auditoría PASS (fetch vivo CMF/SII) |
| `reajuste-arriendo-uf-ipc-chile` | updatedDate 2026-08-03 | re-auditoría PASS |
| `que-es-el-apv` | validAsOf 2026-08-03 | re-auditoría PASS (fetch vivo SII) |

El SLA de los 5 se resolvió por el mecanismo de diseño (snapshot volátil
refrescado — causa raíz del SLA vencido); las fechas de frontmatter se
actualizaron en la re-auditoría, y en `que-es-la-uf` además se corrigió el
defecto de contenido (ver arriba). `driftCount=0`; ningún `expectedValue`
desincronizado.

### Cadencia 90 días — manual_review (RESUELTO)

| Slug | reviewDate | Resolución |
|---|---|---|
| `contribuciones-bienes-raices-chile` | validAsOf 2026-08-03 | cifras corregidas (PR #392) |
| `gratificacion-legal-chile` | validAsOf 2026-08-03 | cifras corregidas (PR #392) |
| `operacion-renta-centro` | updatedDate 2026-08-03 | cifras corregidas (PR #392) |
| `pgu-pension-garantizada-universal` | validAsOf 2026-08-03 | cifras corregidas (PR #392) |

Verificación de fuentes oficiales + sign-off del editor completados en el PR
#392 (exención primera vivienda $47.360.490 → $61.711.570; IMM $539.000 →
$553.553, Ley 21.830; entre otros).

## Criterio de cierre (cumplido 2026-08-03)

- `pnpm run check:editorial-timeliness` → `stale=0` · `drift=0` ✓
- Issues #386 (timeliness audit) y #384 (CI gate) → se cierran automáticamente
  vía el upsert del workflow con el próximo run del audit/CI scheduled; no
  cerrar a mano.
- Re-auditoría registrada en frontmatters y en este plan.

## Notas

- Causa raíz del snapshot congelado: defecto de formato Prettier en
  `compute-review-policies.mjs` que rompía el hook pre-commit dentro de
  `create-pull-request`, revirtiendo el commit automático cada semana desde
  2026-07-05 sin señal visible en el resumen del job. Corregido y snapshot
  refrescado a 2026-08-03 (PR #391).
- Observaciones menores de los ComplianceAgents resueltas el 2026-08-03
  (commit `7e0ecdf8`): redondeo del escenario 2 en `deposito-a-plazo-uf-vs-pesos`
  (3,95 % = 8 %×180/365; compuesto 4,97 %; $1.049.700), URL frágil de BCentral
  (`asset_publisher`) reemplazada por indicadores diarios + metodología oficial,
  y hedge de pensiones en `que-es-el-ipc-chile-como-se-calcula` (PGU + reforma
  previsional 2025 en lugar de "Pilar Solidario").
- La exclusión `brace-expansion@1.1.17` de la política de 7 días es removible
  desde 2026-08-05 (sin relación con este plan).
