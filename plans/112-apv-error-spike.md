# Plan 112: Spike APV error instrumentation + annotate the event dictionary

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md src/contracts/analytics-events.ts docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md src/pages/calculadoras/apv.astro plans/archive/086-apv-completion-drop-diagnosis.md`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (design spike; implementation ships separately. Informational: plan 100's taxonomy work is DONE (2026-09-14, merge `29856700`) — reuse its Tier-A event/param names, don't duplicate or fork)
- **Category**: direction
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

APV sits in HALT (<50% two comparable weeks; W35 3/21 = 14.3%, W36 6/18 =
33.3%, still <50%, no recovery demonstrated) with cause unknown per the 086
diagnostic — and `calculator_error` is declared in the contract with zero
`trackAnalyticsEvent("calculator_error",…)` emitters in `src/`, while the
event dictionary documents it as emitted ("una vez por intento/categoría en
el emisor"). Gate B (error/start <5% GREEN) therefore reads "zero errors =
healthy" over a blind spot, and the next reader of APV data inherits the
same trap. This plan designs the minimal aggregate-only error signal (plus a
progress event separating "never tried" from "tried and failed") and
immediately corrects the dictionary row — no calculator math or route change.

## Current state

Facts, inlined (verified by reading):

- Diagnostic: `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md:58-62`
  (APV 3/21 W35 vs global 844/775 = 91.8%, site-stable); `:206-215` (grep over
  `src/**/*.astro` + `src/**/*.ts` finds zero `calculator_error` invocations);
  `:244-252` (recommended follow-up: emit from existing catch blocks + new
  try/catch around `src/pages/calculadoras/apv.astro:742-991` render block);
  `:126-143` (number-input placeholder friction reproduced but present in 19
  calculators including best-completing sueldo-líquido — non-causal for APV).
- Reconciliation (`plans/RECONCILIATION-2026-09-12.md:51,84-86`): W36 6/18
  (33.3%) still <50%; 088 persistence fix did not change APV; placeholder
  issue persists as documented independent problem.
- Contract: `src/contracts/analytics-events.ts:13-19` declares
  `calculator_error` with `error_category`; dictionary
  (`docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md:12`) documents
  it as emitted — the contradiction to fix.
- 086 review (`plans/archive/086-apv-completion-drop-diagnosis.md:262`):
  unguarded `readEconomicParameters()` at `apv.astro:648` re-verified.
- Privacy: aggregate-only, no amounts/results/free-text/PII/persistent IDs
  (dictionary header); number-input failure telemetry (if any) must stay
  aggregate counts, never pasted values.

Vocabulary: `calculator_error`, `error_category`, Gate B (error/start),
HALT (<50%), `n_min`, "tried and failed" vs "never tried".

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Docs gate | `pnpm run check:docs` | declared | exit 0 |
| Format check (scoped) | `pnpm exec prettier --check docs/backlog/APV-ERROR-INSTRUMENTATION-2026-09-14.md docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md` | declared | exit 0 |

## Scope

**In scope**:

- `docs/backlog/APV-ERROR-INSTRUMENTATION-2026-09-14.md` (create — design spike)
- `docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md` (one-row
  annotation: contract-defined but currently unemitted sitewide + date +
  pointer to DIAGNOSTICO §"Qué NO se descartó")

**Out of scope**:

- Any emitter code, allowlist change (plan 100 owns taxonomy mechanics),
  calculator math, input-type/placeholder change (freeze-adjacent — needs
  plan-113-style incidence evidence first), routes/titles/copy, window
  extension, 055/046 re-litigation.

## Git workflow

- Branch: `advisor/112-apv-error-spike`
- Commits: e.g. `docs(direction): APV error-instrumentation design + dictionary caveat`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Baseline

Confirm the zero-emitter grep still holds
(`grep -rn 'trackAnalyticsEvent("calculator_error"' src/ | wc -l` → 0),
the dictionary row text matches, and the `apv.astro:648` unguarded read +
`:742-991` render block refs match live. `declared` failure → STOP.

**Verify**: grep count recorded; excerpts match.

### Step 1: Annotate the dictionary (ship the caveat now)

Edit the `calculator_error` row: append status "contract-defined, unemitted
sitewide as of 2026-09-14 — zero values do not imply healthy; see
DIAGNOSTICO §Qué NO se descartó and the spike doc". No other row changes.

**Verify**: `grep -n "unemitted" docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md` → match.

### Step 2: Design the minimal signal (spike doc)

Specify: emit points (existing catch blocks + new try/catch around the
apv render block + validation/calc/red/stale-source categories as
`error_category` taxonomy — APV-first, generalization as option); a
progress event separating "never tried" from "tried and failed"; dedupe
(one per attempt/category, per dictionary); volume estimate vs rate-limit
(30/min) and export cardinality; allowlist/contract additions required
(coordinate names with plan 100 — do not fork the taxonomy); privacy
review checklist (no inputs/messages with financial data); what the
subsequent implementation plan must test (per-category emission + Gate-B
readout split pre/post). Explicitly: no input-value capture, ever.

**Verify**: `check:docs` + scoped prettier → exit 0; spike doc has emit
table + taxonomy + privacy checklist + implementation-plan handoff section.

## Test plan

- Docs-spike: no vitest changes. Verification is the Step-0 grep pin, the
  dictionary annotation grep, and `check:docs` green. The handoff section
  lists the tests the *implementation* plan must add (per-category emission,
  dedupe, Gate-B split).

## Done criteria

- [ ] Zero-emitter state re-pinned at planning time (grep count in the spike doc)
- [ ] Dictionary row carries the unemitted caveat with date + pointers
- [ ] Spike doc specifies emit points, taxonomy, progress event, volume, privacy checklist, handoff tests
- [ ] No code/math/route/copy change; `check:docs` + prettier green; `plans/README.md` updated

## STOP conditions

- Drift; emitters already exist now (finding gone — STOP and re-scope as
  verification, don't design); any proposed capture includes input values or
  messages (STOP — privacy violation, redesign aggregate-only); taxonomy
  conflicts with plan 100's in-flight names (STOP — reconcile names first,
  single taxonomy); `declared` baseline broken.

## Maintenance notes

- The implementation plan follows separately and must split pre/post
  emission periods — never pool Gate-B across the instrumentation change.
- If `calculator_error` generalizes beyond APV, keep the APV-first categories
  stable; additions are additive enum values.
- **Deferred:** placeholder/text-input friction measurement (needs
  incidence telemetry design first — freeze-adjacent, not here).
