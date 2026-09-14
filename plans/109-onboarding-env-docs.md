# Plan 109: Fix onboarding versions and document the env + bootstrap contract

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- START_HERE.md README.md docs/operations/runbooks/bootstrap-checklist.md context/AGENT_ENTRYPOINTS.json context/AGENT_ENTRYPOINTS.md context/AGENT_PREFLIGHT.md .env.example`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

Onboarding docs disagree with the toolchain by a full major: `package.json`
pins `pnpm@11.7.0` and `astro ^7.2.9`, but `START_HERE.md:7` and
`bootstrap-checklist.md:8` say pnpm 10, `AGENT_ENTRYPOINTS.json:15` says
pnpm 10, and `README.md:17` says Astro 6. New checkouts follow the docs, then
diverge from CI on the first command. In the same pass, gate-affecting env
vars (`SMALL_DETAILS_ENFORCE`, `URLCHECK_MODE`, `BUILD_DEV_PAGES`, worker
secrets) are discoverable only by grepping scripts/workflows, and the
bootstrap checklist tells clean checkouts to run networked/destructive gates
(`check:images` deletes local PNGs per `README.md:85`; `check:links` crawls
the network) before `pnpm run dev`. Docs-only fix, first-boot experience win.

## Current state

Files and roles:

- `START_HERE.md:7` — "Usa Node 22 y pnpm 10."
- `docs/operations/runbooks/bootstrap-checklist.md:8` — pnpm 10.30.2
- `context/AGENT_ENTRYPOINTS.json:15` — pnpm 10
- `README.md:17` — "Astro 6 + TypeScript 6"; `package.json:127` — `astro ^7.2.9`; `AGENTS.md:37` — Astro 7
- `.env.example:1-50` — documents provider/hero/editorial/boundary vars;
  omits `SMALL_DETAILS_ENFORCE` (`package.json:51`), `URLCHECK_MODE`
  (`scripts/check-urls.mjs:16`), `BUILD_DEV_PAGES` (`astro.config.ts:94`,
  `README.md:67`), worker secrets (`workers/*/src/index.ts` Env)
- `context/AGENT_PREFLIGHT.md:82-91` — env table lists 4 vars only
- `package.json:15` (`check`) — includes `check:images` + `check:links`

Excerpts as of `0e506a8b` (verified by reading):

```md
<!-- START_HERE.md:7 -->
1. Usa Node 22 y pnpm 10.
```

```md
<!-- README.md:17 -->
- Astro 6 + TypeScript 6
```

```bash
# .env.example ends at line 50 with DOMAIN_BOUNDARY_* — no SMALL_DETAILS_ENFORCE,
# URLCHECK_MODE, BUILD_DEV_PAGES, or worker-env pointer section
```

Conventions: Node 22 (`.nvmrc` = `22`); pnpm-only (`preinstall` blocks
npm/yarn); docs gates via `check:docs`; prettier double-quotes/80-col.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Docs gate | `pnpm run check:docs` | declared | exit 0 |
| Format check (scoped) | `pnpm exec prettier --check START_HERE.md README.md docs/operations/runbooks/bootstrap-checklist.md context/AGENT_ENTRYPOINTS.json context/AGENT_ENTRYPOINTS.md context/AGENT_PREFLIGHT.md .env.example` | declared | exit 0 |

## Scope

**In scope** (docs only):

- `START_HERE.md`, `README.md`, `docs/operations/runbooks/bootstrap-checklist.md`,
  `context/AGENT_ENTRYPOINTS.json`, `context/AGENT_ENTRYPOINTS.md`,
  `context/PROJECT_CONTEXT_MASTER.md` (if it repeats the versions)
- `.env.example`, `context/AGENT_PREFLIGHT.md` (env tables)
- Canonical pip-audit invocation note (project venv — one paragraph, from
  plan 106 evidence; no behavior change)

**Out of scope**:

- Any code, workflow, threshold, or default-value change; version bumps;
  worker secrets values (names only, never values); `check`/`check:ci`
  script semantics (document, don't rewire).

## Git workflow

- Branch: `advisor/109-onboarding-env-docs`
- Commits: e.g. `docs(onboarding): align toolchain versions; document env and bootstrap stages`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Baseline

`check:docs` + scoped prettier unmodified. `declared` failure on clean tree
→ STOP + report.

**Verify**: both pass unmodified.

### Step 1: Align versions to the manifests

Set every onboarding reference to Node 22 / pnpm 11.7.0 / Astro 7 from
`package.json` (`packageManager`, `astro` range) and `.nvmrc`. Files at
minimum: `START_HERE.md`, `bootstrap-checklist.md`, `README.md`,
`AGENT_ENTRYPOINTS.json` (+ `.md` if mirrored), `PROJECT_CONTEXT_MASTER.md`
if it repeats them. Add one source-of-truth sentence ("versions follow
`package.json#packageManager` and `.nvmrc`; docs must not pin competing
majors").

**Verify**: `grep -rn "pnpm 10\|Astro 6" START_HERE.md README.md docs/operations/runbooks/bootstrap-checklist.md context/AGENT_ENTRYPOINTS.json` → no matches (excluding historical changelogs).

### Step 2: Complete the env tables + two-stage bootstrap

Add to `.env.example` (commented defaults + CI-vs-local behavior):
`SMALL_DETAILS_ENFORCE`, `URLCHECK_MODE`, `BUILD_DEV_PAGES`, and a
worker-env pointer section (names + where secrets are set, e.g. `wrangler
secret put` per worker README — names only). Mirror the table in
`AGENT_PREFLIGHT.md`. Rewrite bootstrap first-boot as two stages: stage 1
offline/non-destructive (`install --frozen-lockfile`, `test`, minimal gate
subset, `dev`); stage 2 explicitly networked (`check`/`check:images`/
`check:links`, Python `uv sync` + ruff/pytest smoke per `AGENTS.md:30-32`).
Add the canonical venv-pinned pip-audit invocation paragraph.

**Verify**: `check:docs` + scoped prettier → exit 0.

## Test plan

- Docs-gate verification only (`check:docs` green + prettier green). No
  vitest changes.
- Manual proof in the commit message: before/after version strings per file.

## Done criteria

- [ ] No `pnpm 10` / `Astro 6` in onboarding paths (grep-clean)
- [ ] `.env.example` + preflight document all gate-affecting switches with defaults and CI-vs-local behavior
- [ ] Bootstrap checklist is two-stage (offline first, networked second) with Python setup included
- [ ] `check:docs` + scoped prettier green; diff docs-only; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; a version reference turns out
  load-bearing for a pinned CI image (STOP — align the image, don't keep the
  doc wrong; needs operator call); worker secret names differ per worker in
  a way that needs code change to unify (STOP — document as-is); `declared`
  baseline broken.

## Maintenance notes

- On the next toolchain major bump, update manifests first, then re-run the
  Step-1 grep — add it to the release checklist if one exists.
- Reviewer: confirm no secret *value* was added (names only).
- **Deferred:** `check:ci`-vs-`ci.yml` job mirror and fast-lane/parallel
  sharding (needs ordering/caching design); pre-commit fixing mode +
  Python-aware hooks; knip promotion; self-heal scoping — all separate,
  explicitly not here.
