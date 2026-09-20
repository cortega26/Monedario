# PLAN — reddit-monitor hardening + completion (Waves 0–5)

**Estado:** EN CURSO (Wave 0) · **Fecha:** 2026-09-19 · **Owner:** Carlos Ortega
**Roadmap:** `ROADMAP-reddit-monitor-2026-09-19.md` (scoreboard, backlog RM-001–037, waves).
**Decisiones firmadas:** delineación worker↔Python · secretos solo-código sin rotación · hardening + features.

## Objetivo y límites

Endurecer `reddit-monitor/` (Python, untracked) y `workers/reddit-mention-monitor/`
(tracked) en sad paths, seguridad operativa, refactors, tests y features a medio
construir, sin cambiar superficies públicas ni semántica de alertas sin ADR.

En alcance: archivos bajo `reddit-monitor/`, `workers/reddit-mention-monitor/`,
`tests/workers/reddit-mention-monitor/`, ADRs/docs que los gobiernan.

Fuera de alcance (BLOCKED): pipeline editorial, calculadoras, rutas/canonical/RSS,
monetización, auto-posteo a Reddit (listen-only es hard stop), tracking
persistente/user-level, exposición pública nueva sin Access-equivalente.

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` → `context/*.md` → código.
- Invariantes aplicables: separación de deberes NO aplica (no hay contenido YMYL aquí);
  `ROUTES.NO_SILENT_CHANGES` / `RSS.NO_REMOVALS` intactos (no se tocan rutas);
  exfiltración mínima y `no-console` (workers exentos) se respetan.
- Supuestos: A1 `reddit-monitor/` sigue untracked durante el programa (su gitificación
  es decisión owner separada); A2 la VM Oracle sigue siendo el host prod de Python;
  A3 ntfy sin auth se mantiene por decisión firmada (runbook de rotación, sin rotación).

## Change Control Record

1. Scope: ver arriba.
2. Impacted modules: `reddit-monitor/*.py`, `*.sh`, `*.service/*.timer`, `schema.sql`,
   `workers/reddit-mention-monitor/src/*.ts`, `tests/workers/reddit-mention-monitor/*`,
   `docs/adr/ADR-2026*-reddit-*.md`, este roadmap/plan.
3. Invariant preservation: sin URLs públicas nuevas; sin tracking nuevo; listen-only.
4. Contract preservation: contrato worker↔Python solo vía ADR Wave 1; `cite`-like fail-closed
   donde aplique (bcn-cite no se toca).
5. Boundary integrity: `pnpm run check:boundaries` no afectado (Python fuera de src/);
   `check:workers` debe seguir verde.
6. Test coverage: pytest (Python) + vitest (worker) por wave; sad paths con matriz chaos.
7. Rollback: por wave (ver roadmap).
8. Regression risk: MED — doble sistema de alertas + credenciales + systemd. Mitigación:
   waves ordenadas, remediate→verify por cluster, commits pequeños, Wave 4 tras flags.

## Competitive Adaptation Appendix

- benchmarkSet: N/A (trabajo interno, no benchmark-driven).
- patternHypothesis: N/A.
- localDelta: contrato explícito alerta-vs-research, backoff con Retry-After, backup offsite
  de 92 KB, schema versionado, content_gaps cerrable, calibración mensual.
- nonCopyBoundaries: N/A.
- ownerTarget: superficies reddit existentes (sin superficie nueva).
- successSignal: scoreboard del roadmap en verde por wave.
- ownership conflict check: pass.

## Fases y gates

Ver roadmap Waves 0–5. Gate global por wave + STOP permanentes del roadmap.
MEDICIÓN: scoreboard antes/después por wave en el Progress log de aquí.

## Progress log

- 2026-09-19 — Plan + roadmap creados. Wave 0 despachada.
- 2026-09-19 — Wave 2 CERRADA (veredicto LIFT REJECT tras fixes): retries con Retry-After + split 401/403, token refresh once, degraded-status, dead-letter ntfy, rotación logs, backup offsite doc + RESTORE.md + integrity_check, worker config validation + markSeen tolerante + chunkEmbeds + batch policy doc. Tests: pytest 33 + RM-008 4/4, vitest 39, tsc 0. Abierto no-bloqueante: 8 fallos preexistentes test_fase06 (spacy + schema drift → RM-016 Wave 3); NextSteps.astro ajeno sin revertir.
- 2026-09-19 — Wave 3 VERIFICADA in place (trabajo preexistente en dir untracked: split collect_items, normalize.py, entries.py, schema v3 + assertion, dead-code sweep, queue paginada + TZ, archive/ en KPIs, --check; suite 89/89 menos 5 spacy-env). CSRF pendiente decisión owner. Wave 4 ACEPTADA (content_gaps default-off idempotente, calibrate.py report-only con 0 labels fabricados, pins + MemoryMax 1536M consistente).
- 2026-09-19 — RECONCILIACIÓN con sesión paralela (PRs #499–#509, Claude Sonnet 5): Wave-1 ADR scope-contract SUPERSEDED por ADR-20260919-reddit-single-monitor (el Worker nunca funcionó: sin secrets, KV vacío, subs muertos; verificado read-only contra Cloudflare/Reddit). Worker eliminado del árbol con mi Wave-2 (discord.ts/index.ts/tests) — sin acción requerida, historial preservado. Keyword→calculadora portado como resource_map (#508). Wave 3/4 de este programa siguen válidas (árbol Python). Teardown manual Cloudflare pendiente del owner (borrar worker + KV). Trabajo ajeno en curso en esta checkout (gaps-pilot: catalog.json, spike_gaps.py, export-reddit-catalog; NextSteps.astro; package.json) — no tocado.
- 2026-09-19 — Teardown Cloudflare ejecutado por owner (worker + KV eliminados, verificado `KV gone`; ADR single-monitor actualizado). Programa reddit: Waves 0–4 cerradas; CSRF + gaps-pilot + checklists humanos quedan fuera de este programa.
