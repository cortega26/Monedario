# ADR-20260919-reddit-scope-contract

Date: 2026-09-19
Status: Superseded by ADR-20260919-reddit-single-monitor

## Context

Hay dos sistemas escuchando Reddit para Monedario y su particion era
implicita: el Worker `workers/reddit-mention-monitor/` (tracked, Cloudflare)
y el sistema Python `reddit-monitor/` (untracked, VM Oracle). Sin un contrato
explicito, cualquier cambio en keywords, cadencia o semantica de alertas en
un lado podia interpretarse como bug del otro (doble aviso del mismo hilo,
divergencia silenciosa de cobertura).

Este ADR fija la delineacion worker↔Python decidida en
`docs/backlog/ROADMAP-reddit-monitor-2026-09-19.md` (Wave 1, RM-004/RM-005):
contrato alerta-vs-research, regla de overlap y particion de keywords.
Requiere ADR por `docs/AI_ENGINEERING_CONSTITUTION.md` §9
("Architectural changes require ADR") y por el STOP permanente del roadmap
(cambio de semantica de alertas sin update ADR).

Antecedentes: `docs/adr/ADR-20260601-reddit-mention-monitor.md` (Worker:
listen-only, 15 min, Discord), `docs/operations/reddit-monitor/PLAYBOOK.md` (ciclo
Pendiente→Atendido), `docs/operations/COMMUNITY_SEEDING_KIT.md` (targets y
respuestas-tipo A–E).

## Decision

**El Worker es ALERTING. Python es RESEARCH.** No se consolidan.

### Scope table

| Dimension | Worker (alerting) | Python (research) |
|---|---|---|
| `runtime` | Cloudflare Workers + Cron Trigger (tracked en repo) | VM Oracle, cron/systemd (untracked, `reddit-monitor/`) |
| `cadence` | Cada 15 min | Scan horario + reporte semanal (lunes 09:00) |
| `access-pattern` | OAuth app-only, endpoint `/search` con `restrict_sr` — **posts-only por construccion** | OAuth script, polling `/r/{sub}/new` + `/r/{sub}/comments` — **posts y comments** |
| `keywords` | 5 grupos calculator-bound en `src/keywords.ts` | Lexicon amplio (29 keywords) + `intent_phrases` + `interrogative_starters` + `related_terms` + prototipos ML, todo en `config.json` |
| `intent-model` | keyword→calculadora + descarte NSFW + umbral `MIN_SCORE` | Heuristico `intent_score` (Alta/Media/Baja) + desambiguacion + capa semantica en observacion |
| `subs` | `TARGET_SUBREDDITS` (chile, RepublicaIndependiente, merval, Bolsa, EstoyBienChile) | `subreddits` de `config.json` (chile, Santiago, RepublicadeChile, FinanzasChile, AskChile, BolsaChile) |
| `state` | KV `REDDIT_SEEN`, key = post id, TTL 7 dias; marca-visto tras alerta exitosa | `digest-*.md` (Pendiente/Atendido) + espejo SQLite + `*.jsonl` |
| `alerts` | Webhook Discord, solo posts | ntfy + digests diarios + reporte semanal + triage UI (`index.md`) |

### Keyword mutual-exclusion list (RM-005)

La exclusion es por **access-pattern × canal**, no por string:

1. **Exclusivo Python (comments):** toda cobertura de *comments* —
   incluyendo terminos calculator-bound (comisiones/afp, operacion renta,
   uf, finiquito, sueldo liquido) cuando aparecen en comentarios — pertenece
   solo a Python. El Worker no debe agregar polling de `/comments` nunca.
2. **Exclusivo Worker (posts → Discord):** los 5 query strings de
   `KEYWORD_GROUPS` para busqueda de posts y alerta por Discord. Python no
   debe postear a Discord nunca (su canal es ntfy + digest).
3. **Overlap lexico intencional (NO es violacion):** strings como "afp",
   "sueldo", "uf", "declaracion de renta" aparecen en ambos lados y esta
   bien — la particion no es por palabra sino por patron de acceso y canal.

### Overlap rule

Un mismo hilo **puede** surfear dos veces: una como alerta Discord (Worker,
match de post) y otra en el digest (Python, match de post o comment). Es
inofensivo: el humano triagea una vez moviendo a Atendido
(`PLAYBOOK.md` § ciclo diario). **Esto explicitamente NO es un bug** —
no "arreglar" con dedup cruzado (no hay estado compartido entre Cloudflare
y la VM por diseño).

## Consequences

### Positive

- Cero intents sin dueño: cada keyword/canal tiene un responsable.
- Cada sistema evoluciona independiente (thresholds, lexicon, subs) sin
  romper el contrato del otro mientras respete su columna de la tabla.
- El doble-aviso queda documentado como comportamiento esperado, no como
  incidente.

### Trade-offs / Risks

- Dos listas de keywords que mantener (drift posible). Mitigacion: este ADR
  + comentarios cruzados en `keywords.ts` y `_scope_notes` en `config.json`
  (RM-005); revision lado a lado como gate de Wave 1.
- Ruido de doble-aviso en hilos calientes. Mitigacion: triage unico via
  Atendido; el costo lo absorbe el humano, no el codigo.

## Alternatives considered

- **Consolidar en un solo sistema:** descartado — decision firmada del
  roadmap (delineacion, no consolidacion). Perderia alertas ≤15 min
  autonomas (Worker) o la profundidad de research semanal (Python).
- **Dedup cruzado via store compartido:** descartado — acoplaria
  Cloudflare↔VM y crearia una superficie nueva de exfiltracion/estado por
  un beneficio (evitar un aviso doble ocasional) que el triage humano ya
  absorbe gratis.
- **Particion por keyword string (listas disjuntas):** descartado —
  fragil (un sinonimo la rompe) y empobrece ambos lados; la particion por
  patron de acceso es estructural y no requiere sincronizar strings.

## Rollback

Revert docs-only: borrar este ADR + revertir los comentarios de
`keywords.ts` y la clave `_scope_notes` de `config.json`. No hay cambio
runtime que revertir (Wave 1 no altera comportamiento). Rollback de wave
segun roadmap: `revert config`.

## NEVER-list (hard stops de este contrato)

- No auto-posting a Reddit (listen-only) — ni Worker ni Python.
- No nuevo tracking persistente/user-level mas alla del estado declarado
  (KV post-ids con TTL; digests/jsonl/SQLite locales).
- No nueva superficie publica/indexable.
- No estado compartido entre Worker y Python sin un ADR nuevo.
- No cambio de semantica de alertas sin update a este ADR (STOP del roadmap).

## Verification

- Gate Wave 1: este ADR + revision keyword lado a lado
  (worker `KEYWORD_GROUPS` vs Python `keywords`/`intent_phrases`).
- Comandos (sin cambio de comportamiento):
  `pnpm exec tsc --noEmit -p workers/reddit-mention-monitor/tsconfig.json`,
  `python3 -c "import json;json.load(open('reddit-monitor/config.json'))"`,
  `pnpm exec prettier --check` sobre archivos tocados, `git diff --check`.
- `_scope_notes` en `config.json` es no-behavioral: `load_config`
  (`monitor.py`) solo lee claves conocidas por nombre y tolera claves
  extra; el archivo solo se reescribe en primera corrida.
