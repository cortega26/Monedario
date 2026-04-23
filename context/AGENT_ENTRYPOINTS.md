# Agent Entrypoints

Mapa mínimo para arrancar tareas sin reconstruir el repo desde cero. Úsalo junto con `context/AGENT_PREFLIGHT.md` y `docs/operations/AGENT_TASK_INDEX.md`.

## Intent map

| `id` | Intent | Read first | Required gates |
|---|---|---|---|
| `bootstrap` | Bootstrap / local setup | `START_HERE.md`, `context/AGENT_PREFLIGHT.md`, `docs/operations/runbooks/bootstrap-checklist.md` | `pnpm run test`, `pnpm run check` |
| `bugfix` | Bugfix / targeted repair | `context/AGENT_PREFLIGHT.md`, `docs/operations/AGENT_TASK_INDEX.md`, `docs/codebase/TESTING.md` | `pnpm run test`, `pnpm run lint` |
| `calculator-logic` | Calculator / domain logic change | `context/MODULE_INDEX.md`, `context/AGENT_PREFLIGHT.md`, `docs/operations/AGENT_TASK_INDEX.md` | `pnpm run test`, `pnpm run check:boundaries`, `pnpm run lint`, `pnpm run check:context` |
| `guardrails-docs` | Governance / docs / CI / guardrail work | `context/AGENT_PREFLIGHT.md`, `docs/operations/AGENT_TASK_INDEX.md`, `docs/operations/POLICY_REGISTRY.json`, `docs/operations/GATE_MANIFEST.json` | `pnpm run check:policy-registry`, `pnpm run check:docs`, `pnpm run check:context` |
| `article-refresh` | Editorial refresh / article maintenance | `context/AGENT_PREFLIGHT.md`, `context/EDITORIAL_AI_PIPELINE.md`, `docs/operations/runbooks/task-cookbook.md`, `docs/operations/runbooks/content-refresh-cadence.md` | `pnpm run check:frontmatter`, `pnpm run check:hero-images`, `pnpm run check:hero-prompts`, `pnpm run check:editorial`, `pnpm run check:editorial-timeliness` |
| `route-work` | Route / slug / canonical work | `context/INVARIANTS.md`, `context/CONTRACTS.md`, `context/AGENT_PREFLIGHT.md` | `pnpm run check:no-postid-urls`, `pnpm run check:routes`, `pnpm run check:rss` |
| `ops-audit` | Operational audit / weekly ops / external platforms | `context/AGENT_PREFLIGHT.md`, `docs/operations/runbooks/weekly-search-performance-ritual.md`, `docs/operations/runbooks/apps-mcp-operations.md`, `docs/operations/POLICY_REGISTRY.json` | `pnpm run check:policy-registry`, `pnpm run check:docs` |

## Usage rule

1. Elige un `id`.
2. Lee solo los archivos de `Read first`.
3. Declara scope antes de editar.
4. Si la tarea toca contratos/invariantes especializados, agrega solo ese documento extra.

## Design goal

Un agente nuevo debería poder empezar la mayoría de las tareas leyendo:

- `context/AGENT_PREFLIGHT.md`
- `docs/operations/AGENT_TASK_INDEX.md`
- un runbook específico
- y, solo si aplica, un contrato o invariante especializado
