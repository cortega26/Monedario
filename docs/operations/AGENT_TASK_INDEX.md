# Agent Task Index

Front door operativo para contributors y agentes. Si una tarea cae en una de estas categorias, parte aqui antes de buscar documentos mas especificos.

## Uso

1. Identifica la intencion principal de la tarea.
2. Lee primero la columna `Read first`.
3. Limita el cambio a la columna `Likely touch points` salvo que el scope explicito diga otra cosa.
4. Ejecuta los `Required gates` antes de cerrar la tarea.

## Index por intencion

| Intent | Read first | Likely touch points | Required gates |
|---|---|---|---|
| Bootstrap local | `START_HERE.md` | `.env`, tooling local, install flow | `pnpm run test`, `pnpm run check` |
| Add or refresh article | `docs/operations/runbooks/task-cookbook.md` | `src/data/blog/`, `public/images/hero/`, `artifacts/editorial/` | `pnpm run check:frontmatter`, `pnpm run check:hero-images`, `pnpm run check:hero-prompts`, `pnpm run check:editorial`, `pnpm run check:editorial-timeliness` |
| Change calculator logic | `context/MODULE_INDEX.md` | `src/domain/`, `src/application/`, `src/pages/calculadoras/`, matching `tests/` layer | `pnpm run test`, `pnpm run check:boundaries`, `pnpm run lint` |
| Change public URL or slug | `context/INVARIANTS.md` | frontmatter, route helpers, route snapshots, RSS snapshots | `pnpm run check:no-postid-urls`, `pnpm run check:routes`, `pnpm run check:rss` |
| Investigate CI or validation failure | `docs/codebase/TESTING.md` | `tests/`, `scripts/`, `.github/workflows/` | reproduce failing command locally |
| Update docs or governance | `docs/README.md` | `docs/`, `context/`, `docs/adr/` | `pnpm run check:docs` |
| Change CI / guardrails / agent ops | `context/AGENT_ENTRYPOINTS.md` | `.github/workflows/`, `scripts/`, `docs/operations/`, `context/` | `pnpm run check:policy-registry`, `pnpm run check:docs`, `pnpm run check:context` |

## Scope defaults

- Default to minimal diffs.
- If a task touches routes, canonical URLs, RSS, or guard gates, reread `context/CONTRACTS.md` and `context/INVARIANTS.md`.
- If a task changes architecture or CI semantics, create or update an ADR in `docs/adr/`.

## Companion template

Usa `docs/operations/templates/TASK_BRIEF.md` para abrir una tarea nueva con scope, invariants y gates claros.
Usa `context/AGENT_ENTRYPOINTS.md` si necesitas elegir el camino mínimo por intención antes de leer más contexto.

## References

- `START_HERE.md`
- `context/AGENT_PREFLIGHT.md` ← single-file session warm-up (hard stops, gate map, env vars)
- `context/AGENT_ENTRYPOINTS.md` ← minimal intent map to reduce cold-start token cost
- `docs/operations/GATE_MANIFEST.json` ← machine-readable gate definitions with scope and known failures
- `docs/operations/POLICY_REGISTRY.json` ← machine-readable guardrail registry and workflow ownership
- `docs/operations/runbooks/task-cookbook.md`
- `docs/codebase/TESTING.md`
- `docs/README.md`
- `context/INVARIANTS.md`
- `context/CONTRACTS.md`
- `AGENTS.md`
