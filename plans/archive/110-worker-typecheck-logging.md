# Plan 110: Add worker typecheck gates and unify analytics logging

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 206016cb..HEAD -- package.json tsconfig.json workers/analytics-collector/ workers/economic-snapshot-refresh/src/index.ts workers/reddit-mention-monitor/src/index.ts .github/workflows/ci.yml AGENTS.md`
> On mismatch with "Current state", STOP. (Reconciled base: the `0e506a8b`
> check showed only `index.ts`, `worker-v2.ts` (plans 097–099 landed work)
> and reddit `index.ts` (plan 105 return shape) — all assessed below. The
> 097–100 series is DONE, so no concurrent-edit sequencing remains.)

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW (typecheck wiring) / MED (log-shape change — see Steps)
- **Depends on**: none (sequence after 097–100 if run together — same worker files, different lines; re-run drift check)
- **Category**: dx
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `206016cb`, 2026-09-14 — 097–100 DONE (no
  sequencing constraint left); worker drift is their landed work, fully
  inventoried below (16 ad-hoc sites, was ~6); exemplar logger, scripts,
  CI job, README-allowlist and log-asserting tests all re-read
- **Issue**: —

## Why this matters

Worker type errors bypass every normal lane: root `tsconfig.json:3`
excludes `workers/**`, so `astro check` never sees them; `package.json`
has `worker:*:dev/deploy/tail` but no `worker:*:typecheck` or scoped
`worker:*:test`; the only documented path is a tribal one-liner in
`plans/archive/037-analytics-export-secret-header.md:100-104`. In the same
worker, observability diverges: `economic-snapshot-refresh` and
`reddit-mention-monitor` log JSON envelopes (`log(level,event,fields)` with
timestamp + worker name) while `analytics-collector` (`worker-v2.ts:209-214`,
`index.ts:330,358,790,816,891`) uses ad-hoc `console.error/log` strings —
analytics incidents can't be filtered or correlated like the other two.

## Current state

Files and roles:

- `workers/economic-snapshot-refresh/src/index.ts:33-49` — JSON logger
  exemplar (`log(level,event,fields)` → `{level,event,timestamp,
  worker,...fields}`, routed error→`console.error`/warn→`console.warn`/
  else→`console.log`)
- `workers/reddit-mention-monitor/src/index.ts:27-38` — same envelope
  (inline returns, same routing)
- `workers/analytics-collector/src/worker-v2.ts` — 7 ad-hoc sites:
  `:396-400` (native rate-limit fail, IP-safe by 098), `:551` (poison-row
  skip), `:648-650` (`legacy_skipped`), `:685-687` (export summary),
  `:742-744` (manual export failed), `:818-820` (ingest fail), `:834`
  (cron trigger)
- `workers/analytics-collector/src/index.ts` — 9 ad-hoc sites: `:330-334`
  (KV rate-limit fail, minute-suffix only — deliberate, see comment),
  `:358-362` (ingest fail, logs FULL counter key), `:790`/:`812`/:`816`/
  `:834` (export progress), `:891-895` (manual fail), `:1074` (cron
  trigger), `:1080` (export failed)
- Log-asserting tests that MUST stay green (assert on `String(call[0])`
  substrings — the verbatim-message rule in Step 2 keeps them passing):
  `root-cause.test.ts:798+` ("legacy_skipped"),
  `schema.test.ts:907+` ("descartados=…sin taxonomía v2"),
  `schema.test.ts:1075+` (counter key), `schema.test.ts:1106+`
  ("rate-limit")
- `package.json:78-86` — `worker:*:dev/deploy/tail` per worker, no
  typecheck shortcuts; `check:ci` (`:34`) runs lint … `astro check`
  (worker-blind: root `tsconfig.json:3` excludes `workers/**`)
- `.github/workflows/ci.yml:52+` — `lint-and-test` job (lint, format,
  test:coverage, boundaries, context, policy-registry, legal-constants,
  docs — NO astro-check step; add a workers-gate step here)
- `workers/analytics-collector/README.md` — path-allowlisted for
  `check:docs` (edits safe); has `worker:analytics:tail` row (`:51`).
  (Its "Precisión de contadores" section still describes KV
  read-modify-write — stale since the DO migration, but OUT OF SCOPE:
  do not touch it here.)

Excerpts as of `206016cb` (re-read; the `:209-214`-era refs from planning
predate 097–099 — the 16-site inventory above supersedes them):

```json
// tsconfig.json (root) — workers excluded (line ~3)
"exclude": [ ... "workers/**" ... ]
```

```ts
// economic-snapshot-refresh/src/index.ts:33-48 — winner pattern
function log(level, event, fields) { /* JSON envelope with timestamp + worker */ }
```

```ts
// analytics-collector/src/worker-v2.ts:209-214 — ad-hoc strings to replace
console.error("[analytics-collector] ...", ...);
```

Conventions: keep legacy message text as one envelope field (alerts/tail
queries match current strings); per-worker `tsconfig.json`; conventional
commits; `check:docs` must still pass (worker README allowlist).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| New gate | `pnpm run check:workers` (to be created) | declared (post-Step-1) | exit 0 |
| Docs gate | `pnpm run check:docs` | declared | exit 0 |
| Lint (scoped) | `pnpm exec eslint workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/src/index.ts` | declared | exit 0 |

## Scope

**In scope**:

- `package.json` (new `worker:*:typecheck` + aggregate `check:workers`; wire into `check:ci`)
- `.github/workflows/ci.yml` (run the new gate in the lint-and-test job)
- `AGENTS.md` (one-line gate documentation; check:docs-clean)
- `workers/analytics-collector/src/worker-v2.ts` + `src/index.ts` (adopt the
  JSON envelope, preserving legacy text as a field)
- Worker READMEs only if the gate references them (allowlist-safe edits)

**Out of scope**:

- Worker behavior, log levels' semantics beyond envelope, correlation-ID
  propagation (separate M — deferred), emergency-lane rewrites
  (`deploy-analytics-root-fix.yml` bespoke TOOL_ROOT — deferred, incident
  lane), install-pattern consolidation, cache design, self-heal scope.

## Git workflow

- Branch: `advisor/110-worker-typecheck-logging`
- Commits: gate wiring → logging envelope (e.g. `chore(workers): gate typecheck in CI`,
  `refactor(analytics-collector): structured log envelope`)
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + `check:docs` + tribal worker typecheck
(`npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` and the
other two workers' tsconfigs if present) unmodified. Record. `declared`
failure on clean tree → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Checked-in typecheck gate

Add per-worker scripts following each worker's existing prefix
(`worker:analytics:typecheck`, `worker:economic-snapshot:typecheck`,
`worker:reddit-monitor:typecheck`, each `npx tsc --noEmit -p
workers/<name>/tsconfig.json` — all three tsconfigs verified present) +
aggregate `check:workers` running all three. Wire `check:workers` into
`check:ci` (position: next to `astro check`) and as a new step in `ci.yml`
`lint-and-test` (append after the docs step; no other job edits).
Document the split (root excludes workers) in `AGENTS.md` one-liner.

**Verify**: `pnpm run check:workers` → exit 0; `pnpm run check:docs` → exit 0.

### Step 2: Structured envelope in analytics-collector (legacy text preserved VERBATIM)

Define the shared `log(level,event,fields)` ONCE — export it from
`workers/analytics-collector/src/index.ts` (mirroring the economic
`:33-49` shape with `worker: "analytics-collector"`) and import it in
`worker-v2.ts`. Do NOT duplicate the helper per file; do NOT touch the
economic/reddit loggers. Convert all 16 ad-hoc sites (7 in `worker-v2.ts`,
9 in `index.ts` per the Current-state inventory) with two hard rules:
(a) each legacy message string moves VERBATIM into one field (e.g.
`message`) — four existing tests assert on `String(call[0])` substrings
("legacy_skipped", "descartados=…", counter key, "rate-limit") and must
keep passing UNCHANGED; (b) add NO new sensitive fields — in particular,
do not "improve" the full-counter-key log at `index.ts:358-362` or the
minute-suffix truncation at `:330-334` (privacy posture changes are out
of scope; the 098 IP-safety stays as-is). Document two tail-filter
examples in `workers/analytics-collector/README.md` (path-allowlisted).

**Verify**: scoped eslint exit 0; `grep -n "console\.\(error\|log\|warn\)(" workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/src/index.ts` → only the shared helper's three routing lines remain; the four log-asserting tests pass unmodified; existing alert strings still present as field values (grep the text).

## Test plan

- No vitest changes required (gate + logging). If worker tests assert log
  strings, update assertions to the envelope field (document each).
- Verification: new gate + `check:docs` + scoped lint green; worker suites
  (`tests/workers/analytics-collector/`) green via `pnpm exec vitest run`
  (record — behavior must be unchanged).

## Done criteria

- [ ] `pnpm run check:workers` exists, runs in `check:ci` and CI, green
- [ ] Analytics logs use the shared envelope with legacy text preserved
- [ ] `check:docs` + scoped lint green; no behavior change (worker suites green)
- [ ] Diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; an existing alert/tail query depends
  on exact string formatting beyond the message field (STOP — keep the old
  line and document the consumer); CI job edit requires schema beyond adding
  the step (STOP); `declared` baseline broken.

## Maintenance notes

- New workers must add their `typecheck` script + envelope from day one.
- Reviewer: diff every log line — field rename is fine, dropped context is not.
- **Deferred:** correlation IDs + log-level override env; emergency-lane
  extraction to versioned scripts; install-pattern consolidation; knip
  promotion; pre-commit fixing mode — all separate, explicitly not here.
