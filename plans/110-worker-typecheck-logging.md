# Plan 110: Add worker typecheck gates and unify analytics logging

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- package.json tsconfig.json workers/analytics-collector/ workers/economic-snapshot-refresh/src/index.ts workers/reddit-mention-monitor/src/index.ts .github/workflows/ci.yml AGENTS.md`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW (typecheck wiring) / MED (log-shape change — see Steps)
- **Depends on**: none (sequence after 097–100 if run together — same worker files, different lines; re-run drift check)
- **Category**: dx
- **Planned at**: commit `0e506a8b`, 2026-09-14
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

- `tsconfig.json:3` — excludes `workers/**`
- `package.json:7-116,78-86` — scripts; `worker:*:dev --test-scheduled`,
  `deploy`, `tail`; no typecheck/test shortcuts
- `plans/archive/037-*.md:100-104` — tribal `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json`
- `workers/economic-snapshot-refresh/src/index.ts:33-48` — JSON logger (exemplar)
- `workers/reddit-mention-monitor/src/index.ts:27-38` — same envelope
- `workers/analytics-collector/src/worker-v2.ts:209-214` + `index.ts` ad-hoc sites — strings
- `.github/workflows/ci.yml` — where the gate wires in; `AGENTS.md` — where it is documented

Excerpts as of `0e506a8b` (verified by reading the worker files and configs;
tribal line per archive reference):

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

Add per-worker `worker:<name>:typecheck` scripts + aggregate
`check:workers`; wire `check:workers` into `check:ci` (position: next to
`astro check`) and into `ci.yml` lint-and-test. Document the split (root
excludes workers) in `AGENTS.md` one-liner.

**Verify**: `pnpm run check:workers` → exit 0; `pnpm run check:docs` → exit 0.

### Step 2: Structured envelope in analytics-collector (legacy text preserved)

Adopt the shared JSON envelope in both analytics-collector files, keeping
each legacy message string verbatim as one field (e.g. `message`). Document
two tail-filter examples in the worker README (allowlist-safe).

**Verify**: scoped eslint exit 0; `grep -c "console.error(\"[analytics" workers/analytics-collector/src/worker-v2.ts` → 0 bare-string sites (all enveloped); existing alert strings still present as field values (grep the text).

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
