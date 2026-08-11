# AGENTS.md

**Precedence (fixed):** `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` > `context/*.md` > source code.
Constitution wins on conflict. If a change violates the Constitution or an invariant, stop and report — no workarounds.

Rules live in `docs/development/`. This file is the entry map, not the manual.

## Hard Stops

- Never derive a public URL from `post.id` (`URL.PUBLIC.NO_POST_ID`).
- Never mark a gate `[X]` in `07-publish-packet.md` — only humans sign off publication gates.
- Never draft and audit/comply a YMYL piece in the same agent session (`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`).
- Never change a public slug without a route/RSS snapshot before/after + ADR.
- No new indexable URL without approved exception (strategic focus: `FOCO ESTRICTO / VALIDACIÓN UTILITY-LED` through 2026-11-02).
- `no-console: "error"` in `src/` — use proper logging or none. Scripts (`scripts/*.mjs`) and workers are exempt.

## Quickstart — Commands

| What | Command |
|---|---|
| Install (deterministic) | `pnpm install --frozen-lockfile` (_pnpm only_; `preinstall` blocks npm/yarn) |
| Dev server | `pnpm run dev` |
| Local CI mirror | `pnpm run check:ci` — gates only, **no build, no URL/RSS checks**. Mirrors CI: lint, format, test, boundaries, context, editorial, routes, astro check, consistency gates |
| Build (full) | `pnpm run build` — image checks → astro check → astro build → pagefind → URL check. Post-build gates (`check:rss`, `check:urls:ci`, `check:indexable-url-freeze`, `check:toc-i18n`, `check:editorial-guard`, `check:economic-snapshot-freshness`) require a build first and are NOT in `check:ci` |
| Tests (Vitest) | `pnpm run test` |
| Single test file | `pnpm exec vitest run tests/path/to/file.test.ts` |
| A11y tests (Playwright) | `pnpm exec playwright test` (needs `pnpm exec astro preview --port 4321` running) |
| Lint | `pnpm run lint` |
| Format check | `pnpm run format:check` |
| Python deps (uv) | `uv sync` |
| Python lint | `uv run ruff check scripts/ tests/ --fix` |
| Python tests | `uv run pytest` |

## Architecture & Toolchain

- **Runtime:** Node 22 (`.nvmrc`). Package manager: pnpm only (enforced at `preinstall`).
- **Framework:** Astro 7 + TypeScript 6 + React 19. TailwindCSS v4 (Vite plugin, not PostCSS).
- **`trailingSlash: "always"`** — every internal link must end with `/`. Use `BASE_URL` normalized with `/` suffix.
- **Prettier:** double quotes, no arrow parens, es5 trailing commas, 80-column line width, LF endings. `pnpm run format:check` / `pnpm run format`.
- **eslint:** typescript-eslint recommended + eslint-plugin-astro. `no-console: error` (except `scripts/` and `workers/`).
- **`@` alias** → `./src/` (both TypeScript and Vitest).
- **Economic parameter provider default:** `snapshot` (reads `src/infrastructure/economic/economic-parameters.snapshot.json` — deterministic, no network). Set `TPI_ECONOMIC_PROVIDER_MODE=live` to fetch from `mindicador.cl`. Always use `getEconomicParameters()` in calculators — never fetch economic data directly.
- **Search:** Pagefind (`pnpm run build` generates `dist/pagefind/`). Static search index, no backend.
- **Editorial gates are warn-only locally:** `check:editorial` fails CI (runs with `EDITORIAL_ENFORCE=1`) but only warns in `check:ci`. Same for `check:small-details` (`SMALL_DETAILS_ENFORCE=1`). Green local `check:ci` does not guarantee these pass in CI.
- **OG images:** generated at build via `src/utils/generateOgImages.ts` (Satori + resvg-js). The `ogImage` property in `SITE` is extensionless to avoid Cloudflare Hotlink Protection blocks.
- **Workers:** Cloudflare Workers (`workers/`) — `analytics-collector`, `economic-snapshot-refresh`, `reddit-mention-monitor` — deploy independently via `pnpm run worker:*:deploy` (wrangler, per-worker `wrangler.toml`), not as part of the Astro build.
- **Deployment:** Cloudflare Pages (static build). No deploy workflow in repo CI; CI is gate-only.
- **License:** AGPL-3.0 for code (`LICENSE.md`), CC BY-NC 4.0 for editorial content (`LICENSE-CONTENT.md`).
- **Pre-commit:** husky + lint-staged runs `prettier --check` + `eslint` on staged files.

## Python Tooling

The `scripts/` and `tests/` directories contain Python tools managed with `uv` (not pip).

- **`tests/` is shared by both toolchains:** Vitest runs `tests/**/*.test.ts` (excluding `tests/accessibility/**`); pytest runs the root-level `test_*.py` files + `conftest.py`. Don't run `uv run pytest` expecting TS tests (or vice versa).
- **Config:** `pyproject.toml` (deps + ruff + pytest + coverage). Lockfile: `uv.lock`.
- **Requires Python ≥ 3.13.**
- CI gates: `python-ci.yml` (ruff + pytest on PR), `python-deps-autoupdate.yml` (monthly lockfile bump), `security-scans.yml` → `python-audit` (weekly pip-audit).

## Layer Map

| Path | What | Rules |
|---|---|---|
| `src/domain/` | Business logic, pure functions | No I/O, no `fetch`, no framework imports |
| `src/application/` | Use cases orchestrating domain | No direct I/O beyond infrastructure calls |
| `src/infrastructure/` | External boundaries (network, file reads) | Runtime validation with Zod |
| `src/pages/` | Astro pages/routes | Do not put business logic here |
| `src/components/` | UI components (Astro + React) | Stateless where possible |
| `src/content.config.ts` | Astro content collection schema | Changing fields affects frontmatter checks |
| `src/data/` | Editorial content (MDX/MD) | Out of scope unless explicit content task |

## Key Process — Editorial Pipeline

Before editing or creating YMYL/editorial content, read the workflow:

- `context/EDITORIAL_AI_PIPELINE.md` — full pipeline with role playbooks
- `context/EDITORIAL_AI_PIPELINE.md` §9 — Blocked Pipeline Protocol (read this when `06-compliance.md` shows `BLOCKED`)
- `docs/editorial/NORMA_YMYL.md` — YMYL quality standard

## Key Process — URL/Route/RSS Changes

Route-affecting changes must pass: `check:no-postid-urls`, `check:routes`, `check:rss`. Note `check:rss` reads `dist/rss.xml` — it only runs after a build.

Snapshots live in `docs/reports/` (baselines) and `output/validation/` (generated). Update baselines after intentional route changes.

## Agent Execution Rules

- Declare scope (in-scope/out-of-scope paths) before any edit.
- Spec-driven execution loop for coding tasks: `docs/development/AGENT_EXECUTION_PROTOCOL.md` §2.14 (root `spec.md` / `todo.md` are allowlisted by `check:docs`; plan-driven tasks use the plan as the spec).
- Minimal diffs only; full rewrites are exceptional.
- Halt conditions are non-negotiable — do not work around them.
- Failed tasks require capability gap diagnosis, not retries.
- Multi-session tasks need a plan artifact in `docs/backlog/`.
- New articles require a manually placed hero image.
- Architectural edits require constitutional citation. ADRs required for layer/contract/URL/CI changes. Refactors forbidden during bugfix tasks.
- Conventional commits (`feat|fix|refactor|chore|test|perf|docs`). PR requires change control record + test evidence. Breaking changes need `BREAKING CHANGE:` block + ADR.
- Technical debt logged in `docs/TECH_DEBT_BACKLOG.md` (severity 1–5). Severity 4–5 blocks feature work.

## Closure Conditions

A change is done only when: scope stayed bounded, Constitution + AGENTS checks pass, CI gates pass, change control record is complete, relevant tracking artifacts updated, and regression risk + rollback are documented. Otherwise: `HALT`.

## Context Layer

Session warm-up: `context/AGENT_PREFLIGHT.md` (hard stops, gate map, invariant IDs, env vars).
Before route/RSS edits: `context/INVARIANTS.md` + `context/CONTRACTS.md`.
Before new URLs/surfaces: `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.
Module map: `context/MODULE_INDEX.md`.
