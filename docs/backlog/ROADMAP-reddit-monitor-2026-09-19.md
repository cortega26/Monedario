# ROADMAP — reddit-monitor hardening + completion

**Estado:** EN CURSO (Wave 0) · **Fecha:** 2026-09-19 · **Owner:** Carlos Ortega
**Alcance:** `reddit-monitor/` + `workers/reddit-mention-monitor/` + sus tests/docs. Nada más.
**Decisiones firmadas:** delineación worker↔Python (no consolidación) · secretos solo-código sin rotación · hardening + features.

## Scoreboard (actualizar por wave; baseline = pre-Wave-0)

| Métrica | Baseline | Objetivo | Wave |
|---|---|---|---|
| `credentials.json` perms | 664 | 600 + `verify.sh` §4 verde | 0 |
| Vectores de fuga (`set -x`, echo URL, historial) | 5 sitios | 0 | 0 |
| Cobertura de contrato worker vs Python | overlap indocumentado | ADR firmado, cero intents sin dueño | 1 |
| 429 con `Retry-After` respetado | no (retry ciego) | sí, ambos sistemas | 2 |
| Estados de divergencia silenciosa | 2 abiertos | 0 (degraded o abort) | 2 |
| Restore de backup probado | nunca | `integrity_check` + RESTORE.md verde | 2 |
| Código muerto / bloques duplicados | ~10 sitios | 0 | 3 |
| Drift de schema posible (DB fresca sin columnas) | sí | assertion de versión, fail-fast | 3 |
| Tests de sad paths nuevos | 0 | 15+ verdes | 2+5 |
| Filas `content_gaps` por ciclo semanal | 0 (tabla muerta) | >0 con disposición | 4 |
| Reporte de calibración sobre `human_reviews` | ojo humano | mensual automatizado | 4 |
| `requirements-ml.txt` pineado | no | sí + paso spacy doc'd | 4 |

## Backlog

| ID | Ítem | Wave | Esfuerzo | Riesgo |
|---|---|---|---|---|
| RM-001 | `chmod 600 credentials.json` (+VM) | 0 | XS | none |
| RM-002 | `set +x` + no-echo en `WEB_PASSWORD`/`NTFY_TOPIC` (4 scripts) | 0 | S | low |
| RM-003 | Runbook de rotación registrado (sin rotación ejecutada) | 0 | XS | none |
| RM-004 | ADR de contrato de alcance (alerta vs research, regla overlap, partición) | 1 | S | low |
| RM-005 | Exclusión mutua de keywords (worker posts-only ↔ Python comments) | 1 | S | low |
| RM-006 | `Retry-After` + split 429/5xx-vs-401/403, ambos sistemas | 2 | M | med |
| RM-007 | Refresh de token mid-run (Python) | 2 | S | low |
| RM-008 | Propagación `degraded` (Markdown↔DB, Discord↔KV) | 2 | S | med |
| RM-009 | Dead-letter ntfy (jsonl capado) | 2 | XS | low |
| RM-010 | Rotación de logs (`runs.log`, `*.jsonl`, archivo digests 90d) | 2 | S | low |
| RM-011 | Validación `MIN_SCORE`/`SEARCH_LIMIT` + tolerancia KV + `chunkEmbeds` + política batches (worker) | 2 | S | low |
| RM-012 | Copia offsite DB + RESTORE.md + `integrity_check` en verify | 2 | S | low |
| RM-013 | Split god-function `collect_items` | 3 | M | med |
| RM-014 | Módulo normalize único + regex compiladas a startup | 3 | S | low |
| RM-015 | Fuente única `ENTRY_RE` | 3 | XS | low |
| RM-016 | Assertion de schema + modo `config --check` + defaults completos | 3 | S | low |
| RM-017 | Sweep código muerto (imports, `StaticFiles`, leaks tests) | 3 | XS | low |
| RM-018 | `app.py`: paginación, fix TZ, decisión CSRF registrada | 3 | S | low |
| RM-019 | `review_sampling.py`: `try/finally` + RNG con seed | 3 | XS | low |
| RM-020 | Writer `content_gaps` desde ranking semanal | 4 | M | med |
| RM-021 | `calibrate.py` mensual (umbrales + prototipos vs `human_reviews`) | 4 | M | med |
| RM-022 | Pinear `requirements-ml.txt` + paso spacy + fix MemoryMax | 4 | S | low |
| RM-023–RM-037 | Tests sad-path (15 ítems, 1:1 con lista Fase-2/5) | 2+5 | M | low |

## Waves

- **Wave 0 — Secretos (RM-001–003).** Solo, primero. Gate: `verify.sh` §4 + `stat`.
- **Wave 1 — Contrato (RM-004–005).** ADR antes de código en alert-paths. Gate: ADR + revisión keyword lado a lado.
- **Wave 2 — Confiabilidad (RM-006–012 + primer batch tests).** Gate: chaos tests + `verify*.sh` + drill restore.
- **Wave 3 — Mantenibilidad (RM-013–019).** Refactor puro, behavior-preserving. Gate: `pytest` + `tsc`/`vitest` + diff-review por hunk.
- **Wave 4 — Completitud (RM-020–022).** Features tras flags env (default off). Gate: un ciclo semanal vivo con filas + reporte calibración.
- **Wave 5 — Tests (RM-023–037).** Intercalados con Waves 2–3, cierre aquí. Gate: cobertura en cada sad path.

## Contrato de convergencia gaps-pilot (2026-09-19, arquitecto)

`catalog.json` = snapshot INPUT de lo publicado (generado por
`export:reddit-catalog`, con `--check` + lint-staged; la VM no tiene el repo).
`content_gaps` (SQLite) = único store de DISPOSICIÓN de brechas. La Fase 3
(`gap_analysis.py`) debe escribir sus brechas por similitud en `content_gaps`
con el mismo vocabulario (`detectado/en_backlog/publicado/descartado`) y las
mismas transiciones human-only del writer RM-020 — nunca un JSON paralelo.
Verificado 2026-09-19: export `--check` OK (163 entradas), 8 tests verdes.

STOP: cambio de semántica de alertas sin update ADR · nuevo tracking persistente/user-level · auto-posteo (listen-only) · exposición pública más allá de la superficie actual sin Access-equivalente. Rollback por wave (0: chmod revert; 1: revert config; 2: `monitor.py.bak`/wrangler rollback; 3: git revert por commit; 4: env-flag off). Fuera de alcance: pipeline editorial, calculadoras, rutas, monetización.

## Progress log

- 2026-09-19 — Roadmap + plan creados. Auditoría previa (3 briefs, 2026-09-19) archivada en historial de sesión.
- 2026-09-19 — Wave 0 CERRADA (600 + set +x + runbook, sin rotación). Wave 1 CERRADA (ADR contrato + partición). Wave 2 CERRADA (LIFT REJECT; ver arriba).
