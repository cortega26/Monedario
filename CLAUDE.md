# CLAUDE.md — Claude Code entry point

This file is read automatically by Claude Code at session start. For the full authority hierarchy, execution model, and operational protocol, read `AGENTS.md` next.

## Hard stops — never do these

| What | Source |
|---|---|
| Derive a public URL from `post.id` | `URL.PUBLIC.NO_POST_ID` |
| Publish YMYL content without completed pipeline + human sign-off | `AGENTS.md` §2.8, `NORMA_YMYL.md` |
| Mark a gate `[X]` in `07-publish-packet.md` | `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` |
| Draft and audit/comply the same YMYL piece in one session | `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` |
| Change a public slug without route/RSS snapshot + ADR | `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS` |

## Criterio obligatorio de viabilidad

Antes de recomendar o ejecutar cualquier desarrollo, automatización o producto que dependa de fuentes externas, revisar y cumplir el criterio de viabilidad en [`docs/development/CRITERIO_VIABILIDAD.md`](docs/development/CRITERIO_VIABILIDAD.md). La viabilidad debe analizarse de forma realista y fundamentada, no solo técnica.

Full hard-stop list: `context/AGENT_PREFLIGHT.md`

## Blocked pipeline — what to do

If `06-compliance.md` shows `BLOCKED` or `07-publish-packet.md` has unchecked gates:

1. Read `06-compliance.md` and `07-publish-packet.md` for the slug.
2. Classify every open item: **A** = human-only · **B** = fresh-session re-audit · **C** = this session.
3. Emit a Triage Report (format in `context/EDITORIAL_AI_PIPELINE.md` §9.4).
4. Resolve only Bucket C items. Do not touch Bucket A or B.

Full protocol: `context/EDITORIAL_AI_PIPELINE.md` §9

## Python tooling (scripts/ + tests/)

| What | Command |
|---|---|
| Install deps (deterministic) | `uv sync` |
| Add a dependency | `uv add <pkg>` (prod) / `uv add --dev <pkg>` (dev) |
| Lint + auto-fix | `uv run ruff check scripts/ tests/ --fix` |
| Format | `uv run ruff format scripts/ tests/` |
| Run tests + coverage | `uv run pytest` |
| Audit CVEs | `uv run pip-audit` |
| Upgrade all deps (manual) | `uv lock --upgrade` then `uv sync` |

- **Config files:** `pyproject.toml` (deps + ruff + pytest + coverage), `uv.lock` (hash-pinned lockfile).
- **Coverage report:** `coverage-html/index.html` (gitignored).
- **CI gates:** `python-ci.yml` (ruff + pytest on PR, paths-filtered), `python-deps-autoupdate.yml` (monthly lockfile bump → PR, manual review), `security-scans.yml` → `python-audit` job (weekly pip-audit).

## Node utilities (src/utils/)

| Utility | What it does |
|---|---|
| `src/utils/dates.ts` | UTC-safe date helpers wrapping `date-fns` — use instead of raw `new Date()` in calculators |
| `zod` (standalone) | Runtime validation at external boundaries — currently guarding `mindicador.cl` responses in `EconomicParameterProvider` |

## Key file map

| What you need | Where to look |
|---|---|
| Invariants and prohibitions | `context/INVARIANTS.md` |
| Contracts and schemas | `context/CONTRACTS.md` |
| Editorial pipeline + role playbooks | `context/EDITORIAL_AI_PIPELINE.md` |
| Blocked pipeline protocol | `context/EDITORIAL_AI_PIPELINE.md` §9 |
| YMYL quality standard | `docs/editorial/NORMA_YMYL.md` |
| Competitive adaptation rules | `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` |
| Pre-flight checklist + gate map | `context/AGENT_PREFLIGHT.md` |
| Module index | `context/MODULE_INDEX.md` |
