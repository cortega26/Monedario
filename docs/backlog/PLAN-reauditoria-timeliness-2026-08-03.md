# PLAN — Re-auditoría de vigencia editorial (timeliness)

**Estado:** BLOCKED — requiere sesión fresca (ComplianceAgent) + sign-off humano
**Inicio:** 2026-08-03
**Fuente:** issue #386 (triage) · `editorial-timeliness-report` (run 30804908326)
**Gate de salida:** los 9 artículos con `reviewDate` actualizado y el gate `check:editorial-timeliness` en verde

## Contexto

El audit diario detectó 9 artículos con ventana de revisión vencida. El snapshot
económico está fresco (2026-08-03) y `driftCount=0` (los valores sincronizados
coinciden). La deuda es la **revisión editorial de vigencia** (YMYL): confirmar que
el contenido sigue siendo exacto y vigente tras el refresh de datos.

Clasificación (protocolo `EDITORIAL_AI_PIPELINE.md` §9.2):

- **Bucket A (humano):** verificación de fuentes oficiales + sign-off de vigencia.
- **Bucket B (sesión fresca):** re-auditoría ComplianceAgent (pipeline §8, Stage 06)
  de los artículos con cadencia vencida.
- **Bucket C:** ninguno (no hay defectos estructurales; frontmatters válidos).

## Artículos

### Cadencia 30 días — runtime_snapshot_plus_editorial_review (Bucket A+B)

| Slug | reviewDate | dueDate |
|---|---|---|
| `que-es-la-uf` | 2026-04-04 | 2026-07-31 |
| `que-es-el-ipc-chile-como-se-calcula` | 2026-03-11 | 2026-07-31 |
| `deposito-a-plazo-uf-vs-pesos` | 2026-03-30 | 2026-07-31 |
| `reajuste-arriendo-uf-ipc-chile` | 2026-03-12 | 2026-07-31 |
| `que-es-el-apv` | 2026-03-12 | 2026-07-31 |

Verificar contra el snapshot económico actual (UF/IPC sincronizados; `validSyncMode=True`).

### Cadencia 90 días — manual_review (Bucket A)

| Slug | reviewDate | dueDate |
|---|---|---|
| `contribuciones-bienes-raices-chile` | 2026-05-03 | 2026-08-01 |
| `gratificacion-legal-chile` | 2026-05-03 | 2026-08-01 |
| `operacion-renta-centro` | 2026-04-29 | 2026-07-28 |
| `pgu-pension-garantizada-universal` | 2026-05-03 | 2026-08-01 |

## Runbook para la sesión fresca (Bucket B)

1. Sesión **nueva** de Claude Code; pegar el Stage 06 playbook de
   `context/EDITORIAL_AI_PIPELINE.md` §8.
2. Por cada slug: leer `src/data/blog/<slug>.md` + `01-brief.yaml` /
   `06-compliance.md` del artefacto editorial más reciente
   (`artifacts/editorial/<slug>/`).
3. Actualizar en frontmatter la fecha de vigencia confirmada
   (el checker usa `validAsOf ?? updatedDate ?? pubDate` como `reviewDate`).
4. No marcar gates de `07-publish-packet.md` (invariante de separación de
   duties; el sign-off de vigencia lo hace el editor humano — Bucket A).

## Criterio de cierre

- `pnpm run check:editorial-timeliness` → `staleCount=0`.
- El CI scheduled y el audit diario vuelven a verde; el issue #386 y el #384
  se cierran automáticamente (upsert).
- Registrar la re-auditoría en el artefacto editorial de cada slug.

## Notas

- Observación del triage: `volatileSnapshotLastUpdated: 2026-07-01` — verificar
  la cadencia del refresh del snapshot volátil (posible fallo del worker
  `Refresh Volatile Data Snapshots`).
- La exclusión `brace-expansion@1.1.17` de la política de 7 días es removible
  desde 2026-08-05 (sin relación con este plan).
