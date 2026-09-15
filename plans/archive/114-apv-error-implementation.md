# Plan 114: Implement APV error-signal emissions E1–E4 (112 handoff)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ab44d813..HEAD -- src/pages/calculadoras/apv.astro src/utils/apvErrorTelemetry.ts src/contracts/analytics-events.ts tests/unit/apv-error-telemetry.test.ts tests/unit/apv-error-wiring.test.ts docs/backlog/APV-ERROR-INSTRUMENTATION-2026-09-14.md`
> On mismatch with "Current state", STOP. (The spike doc and contract are
> read-only references here, not edited.)

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (YMYL-adjacent page; analytics-only change, no math/copy/route)
- **Depends on**: plans/archive/112-apv-error-spike.md (DONE 2026-09-14 —
  the design; this plan implements E1–E4 exactly as specified there)
- **Category**: bug
- **Planned at**: commit `ab44d813`, 2026-09-15
- **Issue**: —

## Why this matters

Plan 112 proved Gate B reads "zero errors = healthy" over a blind spot
(`calculator_error` allowlisted, zero emitters) and designed the minimal
aggregate-only signal (E1–E4) with emit table, taxonomy, privacy checklist
and handoff tests. This plan builds exactly that design: APV failures become
distinguishable from voluntary abandonment, and Gate B starts measuring
reality. No math, copy, route, or title change; no new event names.

## Current state

Facts, inlined (verified by reading live code at `ab44d813`):

- Emit points in `src/pages/calculadoras/apv.astro` (client `<script>`):
  E1 validation early-return `:688-693` (`bruto <= 0 || ...` →
  `showFormError(...)` + `return`); E2 calc try/catch `:721-740`
  (`catch → showFormError(...) + return`); E3 unguarded
  `readEconomicParameters()` def `:638-646`, call `:648` (top-level —
  a throw today kills the whole script before any listener attaches);
  E4 render block `:742-991` (`buildCard`, `replaceChildren`,
  `dispatchEvent("calculator:result")`, `showCalculatorNextActions?.()`,
  `trackAnalyticsEvent("calculator_complete", ...)` at `:987-991`).
  Click handler starts `:664` (`clearFormError()` first).
  `trackAnalyticsEvent` imported at `:606`.
- Transport chain (verified): `trackAnalyticsEvent` →
  `window.monedarioAnalytics?.track` → `track()` in
  `src/scripts/analytics.ts` (dataLayer + first-party `sendAnalyticsEvent`
  with `page_type`/`app_version` enrichment and `isTransmissibleEvent`
  gate). New emissions flow through it with NO helper-side enrichment
  needed beyond `calculator_id` + `error_category`.
- Contract: `calculator_error: [calculator_id, page_type, cluster,
  error_category, app_version]` + `error_category` enum
  (`validation/calculation/network/timeout/stale_source`); both
  data-signals Sets already contain the event (verified in spike —
  re-confirm via the sync test staying green; NO contract/worker/Sets
  change in this plan).
- Design authority: `docs/backlog/APV-ERROR-INSTRUMENTATION-2026-09-14.md`
  (E1–E5 table, taxonomy, dedupe rule, privacy checklist, handoff tests).
  E5 needs no work (no fetch on APV). The progress event stays an
  UNDECIDED proposal — this plan does NOT create it (new event names need
  taxonomy review + privacy sign-off; explicitly deferred).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/unit/apv-error-telemetry.test.ts tests/unit/apv-error-wiring.test.ts tests/application/CalculateApvComparison.test.ts` | declared | all pass |
| Full unit tests | `pnpm run test` | declared | all pass |
| Typecheck | `pnpm run astro check` | declared | exit 0 |
| Lint (scoped) | `pnpm exec eslint src/utils/apvErrorTelemetry.ts src/pages/calculadoras/apv.astro tests/unit/apv-error-telemetry.test.ts tests/unit/apv-error-wiring.test.ts` | declared | exit 0 |

## Scope

**In scope**:

- NEW `src/utils/apvErrorTelemetry.ts` — `emitApvError(error_category)`
  (`calculator_id: "apv"` fixed; page_type/app_version enriched centrally,
  do NOT add them) + `resetApvErrorDedupe()` + per-category since-reset
  Set (double same-category emit → one; two categories → two; reset →
  re-emit). Types only from the contract union; no runtime enum import
  needed (downstream sanitizer fail-closes on unknown).
- `src/pages/calculadoras/apv.astro` — emitter wiring ONLY: E1 emit
  `validation` before `return`; E2 emit `calculation` in the existing
  `catch` (never forward `error.message`); E3 wrap the `:648` call in
  try/catch → on throw emit `stale_source` + show the ALREADY-EXISTING
  message text ("No se pudieron cargar los parámetros económicos.") via
  `showFormError`, then return early (page stays inert BUT visible +
  instrumented — the honest degraded state); E4 wrap the render block in
  try/catch → generic `showFormError` (reuse E2's generic string) +
  emit `calculation`, skipping `calculator_complete` on that path;
  call `resetApvErrorDedupe()` at click-handler start (after
  `clearFormError()`).
- NEW `tests/unit/apv-error-telemetry.test.ts` (happy-dom; stub
  `window.monedarioAnalytics = { track: vi.fn() }`): per-category
  forwarding (name + `{calculator_id: "apv", error_category}`), dedupe
  matrix, reset, plus a strict-sanitizer roundtrip of the forwarded
  params (pattern: plan-100 roundtrips).
- NEW `tests/unit/apv-error-wiring.test.ts` (static, NO DOM — pattern:
  plan-107 anti-refork pin): assert the four emit sites exist with exact
  categories, `resetApvErrorDedupe()` is called in the click handler, and
  no `error.message` flows into any emit call.

**Out of scope**:

- The progress event (stays undecided), any contract/worker/Sets change,
  calculator math, input-type/placeholder change, routes/titles/copy
  beyond reusing the two existing error strings, E5, generalization
  beyond APV, Playwright tests (preview server required).

## Git workflow

- Branch: `advisor/114-apv-error-implementation`
- Commits: helper+tests → wiring (e.g. `feat(apv): aggregate-only error telemetry helper`,
  `feat(apv): wire E1-E4 error emissions`)
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + focused tests (the two new files don't exist yet — run the
engine suite `tests/application/CalculateApvComparison.test.ts` as the
baseline) + `astro check` unmodified. `declared` failure → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Helper + unit tests

Create `src/utils/apvErrorTelemetry.ts` per Scope. Tests: forwarding per
category (4), dedupe (same-category double → 1 call; two categories → 2;
post-reset → re-emits), strict roundtrip of forwarded params through
`sanitizeAnalyticsPayload` with `rejectUnknown: true` AND through worker
`validateEventPayload` (import from `workers/analytics-collector/src/index`,
pattern: plan-100 CTA test).

**Verify**: focused command green including ≥6 new tests.

### Step 2: Wire E1–E4 + static pin

Wire the four points per Scope (E3/E4 try/catch as specified; reuse
existing user-facing strings only). Add the static wiring test. Keep the
MANTENER-irrelevant UI identical otherwise.

**Verify**: focused + full `pnpm run test` green; `astro check` exit 0.

## Test plan

- Helper unit (happy-dom, stubbed bridge): forwarding, dedupe matrix,
  reset, dual-sanitizer roundtrip.
- Wiring pin (static file assertions, 107 pattern).
- Engine suite stays green (no math touched).
- Verification: focused + full suite green.

## Done criteria

- [ ] `emitApvError` + dedupe + reset exist and are test-pinned (≥6 unit)
- [ ] E1–E4 wired with exact categories; static pin green (≥3 assertions)
- [ ] No `error.message`/input values flow to any emit (grep-pinned)
- [ ] No new event names; no math/copy/route change; engine suite green
- [ ] Full `pnpm run test` + `astro check` + scoped lint green; diff
  in-scope only

## STOP conditions

- Drift; double verification failure; any wiring needs math/copy change
  beyond reusing the two existing strings (STOP); a capture of values or
  messages looks required (STOP — privacy violation, redesign); taxonomy
  conflict (STOP — single taxonomy); `declared` baseline broken.

## Maintenance notes

- Gate-B reads must split pre/post-emission periods — never average
  across this instrumentation change (spike rule).
- If `calculator_error` generalizes, keep APV categories stable.
- Reviewer: confirm the E3 early-return leaves a VISIBLE error (not a
  silently dead button) and E4 never emits `complete` on its failure path.
