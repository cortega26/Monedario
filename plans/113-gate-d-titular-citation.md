# Plan 113: Define the Gate-D capture routine, titular semantics, and refresh the APV citation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md docs/operations/templates/utility-led-weekly-ops.json scripts/build-weekly-search-report.mjs docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md plans/archive/084-utility-led-decision-readiness.md`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (docs/wording + test-covered mapping; do not reopen 084 implementation)
- **Category**: docs
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

Sustainability — not revenue — governs continuity to 2026-11-02, yet every
scorecard prints Gate D `SIN REGISTRO` (the last local ops file, W35, has
`weeklyHours`/`weeklyCostClp`/`burnoutLevel1To5` in `null` with no W36
scorecard to verify capture; 084 implemented the warning, not the values —
those are the operator's to fill). Meanwhile the headline
`scripts/build-weekly-search-report.mjs:1839-1847` collapses
`utilityOps.status === "INPUT_REQUIRED"` into the same `WATCH` as an
error-rate breach (verified, out-of-scope, left pending by 084) — one
headline, two unrelated obligations. And the canonical APV dossier still
justifies MANTENER on a W30–W32 ascent (37v/17s/14c, 82%) that W34/W35 HALT
readings void as evidence (the verdict stands; its cited argument does not).
Three docs-only corrections unblock the final weeks' stop/expand calls.

## Current state

Facts, inlined (verified by reading):

- Registry: `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md:34-43,63-67`
  (Gate-D thresholds + `Gate D: SIN REGISTRO` on nulls).
- Template: `docs/operations/templates/utility-led-weekly-ops.json:4` +
  generator `scripts/build-weekly-search-report.mjs:248,1435` (null defaults).
- Reconciliation (`plans/RECONCILIATION-2026-09-12.md:62-67`): last local ops
  file W35, all three null, no W36 scorecard.
- Titular: `scripts/build-weekly-search-report.mjs:1839-1847` maps
  `INPUT_REQUIRED` → `WATCH`; `plans/archive/084-utility-led-decision-readiness.md:373`
  records the collapse as verified and out-of-scope.
- APV dossier: `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md:20,62,69,153-157`
  (MANTENER on W32 ascent); `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md:262-276`
  (ascent no longer representative; W34 19.0% / W35 14.3% under HALT);
  `docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md:454-468,528-533` Q6 (rewrite
  the citation to W34/W35 + 086, not a decision change); `plans/README.md:139`
  (055 DONE — re-cite, don't re-litigate).

Vocabulary: Gate D, `SIN REGISTRO`, `INPUT_REQUIRED` vs `WATCH`,
`utilityStatus`, HALT, `n_min`. Rule: never invent retroactive hours/costs —
nulls stay null historically.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Docs gate | `pnpm run check:docs` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/scripts/utility-led-sufficiency.test.ts` | declared | all pass |
| Format check (scoped) | `pnpm exec prettier --check docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md scripts/build-weekly-search-report.mjs docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md` | declared | exit 0 |

## Scope

**In scope**:

- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` and/or ops template
  docs (Gate-D capture routine: who fills `utility-led-ops.json` weekly,
  cadence, what each null obliges; titular taxonomy:
  `INPUT_REQUIRED` vs `WATCH` vs `SIN REGISTRO` + reader obligations)
- `scripts/build-weekly-search-report.mjs:1839-1847` (status mapping only +
  regression tests; no scoring change)
- `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md` (APV citation
  rewrite to W34/W35 HALT + 086 cause-unknown pointer; verdict untouched)
- `tests/scripts/utility-led-sufficiency.test.ts` (mapping regression tests)

**Out of scope**:

- Backfilling any hours/costs (forbidden); changing Gate-D thresholds;
  reopening 084 implementation; vehicle choice (111); APV instrumentation
  (112); any code beyond the status mapping; window extension.

## Git workflow

- Branch: `advisor/113-gate-d-titular-citation`
- Commits: e.g. `docs(utility-led): gate-d routine, titular semantics, APV citation refresh`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Baseline

Confirm the registry/threshold text, the `:1839-1847` collapse, the W35-null
state, and the APV ascent-vs-HALT paragraphs match live. Focused sufficiency
tests green unmodified. `declared` failure on clean tree → STOP + report.

**Verify**: excerpts match; tests pass unmodified.

### Step 1: Capture routine + titular taxonomy (docs + mapping)

Document: owner/cadence for weekly `utility-led-ops.json`; what
`INPUT_REQUIRED` vs `WATCH` vs `SIN REGISTRO` each obliges the reader to do
and who consumes each; then implement the titular split in the generator
(mapping only) with regression tests in `utility-led-sufficiency.test.ts`
(nulls → `SIN REGISTRO` path; `INPUT_REQUIRED` distinct from breach-`WATCH`).

**Verify**: focused tests pass with ≥2 new mapping cases; `check:docs` green.

### Step 2: Refresh the APV citation (verdict intact)

Replace the dossier's ascent sentence with W34/W35 HALT figures, cite 086
cause-unknown, restate that any future keep/consolidate call requires
post-W35 data. Keep the MANTENER verdict byte-identical in meaning; word the
edit as citation refresh, not reversal.

**Verify**: `grep -n "2→8→14\|ascenso real" docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md` → no stale-ascent claims remain (or only in explicitly historical context); `check:docs` + prettier green.

## Test plan

- Mapping regression tests in `tests/scripts/utility-led-sufficiency.test.ts`:
  null-ops → `SIN REGISTRO`; `INPUT_REQUIRED` titular distinct from
  breach titular. Model on existing render/calc tests in that file.
- Verification: focused-tests command → all pass.

## Done criteria

- [ ] Gate-D routine documented (owner/cadence/obligations); no backfilled values
- [ ] Titular taxonomy implemented + test-pinned (INPUT_REQUIRED ≠ breach-WATCH; SIN REGISTRO path)
- [ ] APV dossier cites W34/W35 HALT + 086 with verdict intact
- [ ] Focused tests + `check:docs` + prettier green; diff in-scope only; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; the desired titular verdict/consumers
  need an operator call not present in reconciliation follow-up #2 (STOP —
  flag the choice, don't invent it); APV edit risks reading as reversal
  (STOP — reword to citation-only); any threshold/weight change looks needed
  (STOP — needs registry ADR, not this plan); `declared` baseline broken.

## Maintenance notes

- If Gate-D fields change shape, update template + registry + mapping tests
  together.
- Reviewer: confirm zero invented historical values (`git log -p` on the ops
  JSON must show no retroactive fills in this diff — this plan must not touch
  data files at all).
- **Deferred:** vehicle implementation (post-111); error-signal build
  (post-112).
