# Plan 050: Restore a weekly search loop and remove obsolete scale assumptions

> **Executor instructions**: This is an operational-semantics change. Read the
> cited ADRs and run every static/workflow gate. Keep the August 1 review explicit.
>
> **Drift check**: `git diff --stat efe021c7..HEAD -- .github/workflows/weekly-search-ops.yml docs/operations/runbooks/weekly-search-performance-ritual.md docs/editorial/TOPIC_INTAKE_POLICY.md docs/editorial/templates/00-topic-intake.md context/CURRENT_STATE.md context/MODULE_INDEX.md docs/backlog/README.md tests/static-analysis/ docs/adr/`

## Status

- **Closure**: DONE — implementation `e01d4a93` independently reviewed and
  integrated by the final Issue #315 change
- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: PR #330 deployed and one valid W28 first-party export
- **Category**: docs / CI semantics / direction
- **Planned at**: commit `efe021c7`, 2026-07-16
- **Origin**: Issue #315 and `/improve deep`

## Why this matters

The workflow and canonical runbook still describe about 1.4k impressions and
single-digit clicks per week, defer analytics until more than 100 clicks, and
skip odd ISO weeks. W28 measured 498 clicks and 94,443 impressions; the first-
party export was missing because of an automation incident, not insufficient
sample size. Through August 1 the repository also has a no-hosted-minutes,
serial self-hosted bridge. The operating system must describe current evidence,
run weekly for this time-bounded period, and force an explicit post-bridge review.

## Current state

- `.github/workflows/weekly-search-ops.yml:1-6,42-58` contains the even-week gate.
- Its issue payload around lines 142-155 says analytics is deferred until
  `>~100 clicks/week`.
- `docs/operations/runbooks/weekly-search-performance-ritual.md:28-34` repeats
  the low-volume rationale and calls analytics deferral deliberate.
- `docs/editorial/TOPIC_INTAKE_POLICY.md:71-77` and the Gate 00 template still
  say GSC is confirmatory-only at roughly 1,374 impressions / 2 clicks.
- `context/CURRENT_STATE.md` and `context/MODULE_INDEX.md` predate July analytics,
  search scale, and the Actions bridge; `docs/backlog/README.md` describes an
  already-shipped measurement phase as next.
- `docs/adr/ADR-20260716-temporary-self-hosted-actions-bridge.md` retires the
  bridge on or after 2026-08-01 and preserves hosted fallback.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Workflow/static tests | `pnpm exec vitest run tests/static-analysis` | all pass |
| YAML parse | `ruby -e 'require "yaml"; Dir[".github/workflows/*.{yml,yaml}"].each { |f| YAML.load_file(f, aliases: true) }'` | exit 0 |
| Docs | `pnpm run check:docs` | exit 0 |
| Context | `pnpm run check:context` | exit 0 |
| Policy | `pnpm run check:policy-registry` | exit 0 |
| Full tests | `pnpm test` | 0 failures |
| Lint/format | `pnpm run lint && pnpm run format:check` | exit 0 |
| Boundaries | `pnpm run check:boundaries` | exit 0 |

## Scope

**In scope**:

- `.github/workflows/weekly-search-ops.yml`
- `docs/operations/runbooks/weekly-search-performance-ritual.md`
- `docs/editorial/TOPIC_INTAKE_POLICY.md`
- `docs/editorial/templates/00-topic-intake.md`
- `context/CURRENT_STATE.md`
- `context/MODULE_INDEX.md`
- `docs/backlog/README.md`
- one focused test under `tests/static-analysis/`
- `docs/adr/ADR-20260716-weekly-search-ops-at-current-scale.md` (create)

**Out of scope**:

- New pages, metadata, YMYL copy, route/canonical/RSS behavior.
- Permanent self-hosting after August 1.
- Claiming Bing coverage without a trustworthy Bing export.
- Changing the data collection/export implementation.

## Git workflow

- Branch: `advisor/050-weekly-search-ops-current-scale`
- Commit: `chore(search-ops): restore weekly review at current scale`
- Do not push/open a PR unless instructed.

## Steps

### 1. Record the time-bounded cadence decision

Create the ADR because removing a workflow gate changes CI/automation semantics.
Use W28 facts, make analytics recovery a prerequisite, run weekly through July,
and require an August 1 decision: retain weekly, collect weekly/review biweekly,
or return to biweekly. Preserve the runner-label fallback and serial constraints.

**Verify**: `pnpm run check:docs` exits 0.

### 2. Remove the odd-week gate and correct issue wording

Delete only the cadence short-circuit; keep schedule/manual dispatch, week
resolution, permissions, and action pinning intact. The generated issue must
distinguish `available`, `missing/incident`, and `invalid` analytics. Require no
more than three decisions and include the August 1 cadence review in the final
July issue or the runbook checklist.

**Verify**: focused static test asserts no parity gate, weekly cron remains, the
runner variable fallback remains, and stale `>~100 clicks` text is absent.

### 3. Recalibrate canonical operating docs

Replace absolute “current scale” statements with dated W28 calibration and
objective multi-week evidence criteria. GSC may be primary evidence when a
candidate has adequate coverage/impressions; it is not universally confirmatory-
only. Mark first-party JSON as active and missing exports as incidents. Refresh
current state/module/backlog summaries without rewriting historical reports.

Do not loosen `CANONICAL_TOPIC_REGISTRY`, non-cannibalization, viability, or YMYL
gates. Traffic volume is evidence, not automatic authorization to publish.

**Verify**: `rg -n "1\.4k|1\.374|2 clic|single-digit|>~100|diferido hasta"` on the
in-scope current-policy files returns no obsolete operational claim.

### 4. Run all gates and inspect scope

Run Commands. Confirm the workflow permissions and triggers changed only as
declared and no generated output/source route changed.

## Done criteria

- [x] Scheduled workflow no longer skips odd ISO weeks.
- [x] Analytics missing/invalid is never described as deliberate low-volume deferral.
- [x] Gate 00 keeps governance but uses current, dated evidence calibration.
- [x] Canonical context and backlog reflect shipped July architecture.
- [x] August 1 review/retirement decision is durable and explicit.
- [x] ADR and all workflow/docs/test gates pass.

Implementation evidence: static analysis passed 101/101 and the full suite passed
1,040/1,040. YAML parsing, docs, context, policy registry, lint, format, domain
boundaries, and the stale-scale scan all passed. The final Issue #315 change
closes and archives this plan atomically.

## STOP conditions

- The W28 export remains unrecovered or invalid.
- Removing parity would exceed the one-runner queue window under current job load.
- A required change would loosen editorial/YMYL/ownership gates.
- A workflow trigger/permission change beyond cadence becomes necessary.

## Maintenance notes

Weekly collection and weekly human review are separable after August 1. Prefer a
measured cadence decision over reinstating an obsolete traffic threshold.
