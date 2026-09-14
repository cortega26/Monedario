# Plan 100: Close the analytics taxonomy gap and pin worker-v2 with tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- src/contracts/analytics-events.ts src/scripts/analytics.ts src/utils/sueldo-liquido/formController.ts workers/analytics-collector/src/ tests/workers/analytics-collector/ tests/integration/analytics-sanitizer.test.ts vitest.config.ts .github/workflows/deploy-analytics-root-fix.yml`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/archive/097-worker-v2-bounded-body.md (DONE 2026-09-14), plans/098-worker-v2-config-validation.md, plans/099-analytics-export-hardening.md (tests pin their behavior; run last among the worker bundle)
- **Category**: tests
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

Two gaps combine into silent telemetry loss. The client emits events/params
the allowlist never defined (`calculator_mode_toggle`, `calculator_copy_link`,
`calculator_copy_result`, `article_scroll_depth`, CTA names), so they are
pushed to `dataLayer` and then sanitized to `null`/stripped before transport —
product decisions read telemetry that never arrives. Meanwhile the coverage
gate (`vitest.config.ts` excludes `workers/**`) stays green at ~91% while the
deployed `worker-v2.ts` hot path, its 10+ guard branches, and its export
surface are gate-invisible, and the only v2 test file has 4 happy-path tests
with single-page mocks. Closing the taxonomy and pinning the surface with
tests restores trust in every downstream scorecard.

## Current state

Files and roles:

- `src/contracts/analytics-events.ts:3-82` — `ANALYTICS_EVENT_ALLOWLIST`
  (14 events; no `calculator_mode_toggle`/`calculator_copy_link`/
  `calculator_copy_result`/`article_scroll_depth`/`cta_click`)
- `src/scripts/analytics.ts:156-162,195-199` — emits CTA names +
  `article_scroll_depth` with `article_slug/article_title/scroll_depth_percent`
- `src/utils/sueldo-liquido/formController.ts:304-309,415-419,433-436,504-506,564-566` —
  emits the calculator_* trio with `calculator_slug/calculator_name/outcome/mode`
- `vitest.config.ts:21-45` — coverage `include: ["src/**/*.ts"]`, excludes
  `workers/**` (plus pages/components/scripts/config); threshold lines 80
- `workers/analytics-collector/src/worker-v2.ts:416-495` — v2 fetch branches
  (OPTIONS/503/405/403/415/413/400/422/429/503+Retry-After, export
  503/401/403/400/429/500) + `scheduled()` cron
- `tests/workers/analytics-collector/root-cause.test.ts:160-235` — 4 v2 tests
  (valid-202, 429, DO-fail 503, one mixed export); mocks: `MockKV.list`
  always `list_complete: true`, `MockR2.put` ignores metadata, `MockCounterStub`
  is a `Map`, not SQLite UPSERT
- `tests/integration/analytics-sanitizer.test.ts:12-47` — asserts exact key
  order (brittle)
- `.github/workflows/deploy-analytics-root-fix.yml:63-105` — validate runs 5
  greps + only `root-cause.test.ts` + dry-run; skips `schema.test.ts` matrix;
  trigger is branch + manual `main` deploy

Excerpts as of `0e506a8b` (verified by reading):

```ts
// src/contracts/analytics-events.ts:3-4
export const ANALYTICS_EVENT_ALLOWLIST = {
  calculator_view: ["calculator_id", "page_type", "cluster", "app_version"],
```

```ts
// src/utils/sueldo-liquido/formController.ts:433
trackAnalyticsEvent("calculator_mode_toggle", {
```

```ts
// src/scripts/analytics.ts:195
track("article_scroll_depth", {
```

```ts
// vitest.config.ts:44
"workers/**",
```

```ts
// root-cause.test.ts:160 — describe("root-cause fix: ingestion") — 3 tests;
// describe("root-cause fix: weekly export") — 1 test (total 4)
```

Conventions: allowlist additions are additive; contract duplicates in worker
(`validateEventPayload`/`sanitizeCollectorEvent`) with sync test
`tests/static-analysis/data-signals-allowed-events-sync.test.ts` (names only);
conventional commits.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Typecheck (site) | `pnpm run astro check` | declared | exit 0, no errors |
| Worker typecheck | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` | declared | exit 0 |
| Full unit tests | `pnpm run test` | declared | all pass |
| Coverage | `pnpm run test:coverage` | declared | exit 0, lines ≥80 |
| Lint (scoped) | `pnpm exec eslint src/contracts/analytics-events.ts src/scripts/analytics.ts src/utils/sueldo-liquido/formController.ts workers/analytics-collector/src/worker-v2.ts` | declared | exit 0 |

## Scope

**In scope**:

- `src/contracts/analytics-events.ts`
- `src/scripts/analytics.ts` (only if an emission must be removed/renamed per taxonomy decision; prefer allowlist additions)
- `src/utils/sueldo-liquido/formController.ts` (same — emissions only)
- `workers/analytics-collector/src/index.ts` + `worker-v2.ts` (only to mirror the same allowlist constants — no logic change beyond constant reuse)
- `vitest.config.ts` (narrow the `workers/**` exclude for the collector entry or add an independent worker floor — config-only)
- `tests/workers/analytics-collector/root-cause.test.ts`, `tests/integration/analytics-sanitizer.test.ts`, `tests/static-analysis/data-signals-allowed-events-sync.test.ts` (tests)
- `.github/workflows/deploy-analytics-root-fix.yml` (validate step: run both collector suites + paginated fixture)

**Out of scope**:

- Body-reader/export/pagination behavior (097/099 own it; this plan only tests it).
- New event design beyond the emitted-but-undefined set (no new telemetry).
- `dataLayer` removal question (record as deferred, do not delete pushes here).
- Changing coverage threshold value or plan-073 page/component excludes.

## Git workflow

- Branch: `advisor/100-analytics-taxonomy-tests`
- Commits: e.g. `fix(analytics): allowlist emitted events; pin worker-v2 surface with tests`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install, both typechecks, full `pnpm run test`, coverage unmodified. Record.
`declared` failure on clean tree → STOP + report.

**Verify**: all pass unmodified (note coverage % for comparison).

### Step 1: Reconcile the taxonomy (additive)

For each emitted-but-undefined event/param, decide allowlist-add vs
emit-remove (default: add — the emitters look intentional; document any
intentionally client-only field instead of allowlisting it). Add missing
events/params to `ANALYTICS_EVENT_ALLOWLIST` with enums where the worker
validates shape; mirror the same constants in the worker validators (reuse,
don't fork). Update the sync test if it asserts names. Relax the exact-order
assertion in `analytics-sanitizer.test.ts:12-47` to set-membership (order is
not a contract) plus keep one strict roundtrip case per event through both
sanitizers.

**Verify**: `pnpm run test` → all pass; `grep -rn "calculator_mode_toggle" src/contracts/analytics-events.ts` → match (or emitter removed with comment).

### Step 2: Count the deployed worker in the gate

Narrow the `workers/**` exclude so the collector entry counts (or add a
separate worker line floor + CI assertion). Keep plan-073
pages/components/scripts/config excludes untouched. Do not lower the 80
threshold. Expect the first coverage run to surface untested v2 lines — that
is the point; Step 3 covers them.

**Verify**: `pnpm run test:coverage` → exit reflects the new scope (record %;
if below threshold, proceed to Step 3 — do not lower the gate).

### Step 3: Pin the v2 surface + harden the mocks

Port the `schema.test.ts` guard matrix to v2: one test per fetch branch
(405/403-prefix/415/400/422/429/503+Retry-After) and export auth/week/
rate-limit/failure paths; DO `/health`/`/increment`/`/list` edge inputs
(bounds 80/80/1024, `invalid_window`, `not_found`, corrupt artifact). Extend
mocks: multi-page KV (>50 keys + cursor), null/out-of-window rows, R2
metadata assertion. Keep changes test-only except the Step-1 constants.

**Verify**: `pnpm exec vitest run tests/workers/analytics-collector/` → all pass with ≥10 new cases total.

### Step 4: Widen the deploy-validate lane

In `deploy-analytics-root-fix.yml` validate: run both collector suites
(`root-cause` + `schema`) plus the paginated mixed-export fixture before
dry-run. CI-only change; slightly longer job is expected.

**Verify**: workflow YAML parses (`node --check` equivalent or
`prettier --check` on the file); no other job semantics changed
(`git diff` shows only the validate step).

## Test plan

- Taxonomy: set-membership assertions + strict roundtrip per allowlisted
  event (client → worker), modeled on `analytics-sanitizer.test.ts:160-258`
  CTA/article cases.
- Worker: per-branch v2 tests + DO unit tests + paginated/poisoned export
  fixtures (Step 3).
- Gate: coverage run before/after the exclude narrowing (record both %).
- Verification: full `pnpm run test` + `test:coverage` green at the end.

## Done criteria

- [ ] `pnpm run test` exits 0
- [ ] `pnpm run test:coverage` exits 0 with worker entry counted (no blanket `workers/**` exclude)
- [ ] Every event emitted in `src/` exists in the allowlist or its emitter was removed (grep-clean)
- [ ] v2 branch matrix + DO edges + paginated/poisoned export cases exist and pass (≥10 new)
- [ ] Deploy workflow runs both suites; diff confined to validate step
- [ ] Both typechecks + scoped lint exit 0; diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; taxonomy decision requires product
  input beyond add-vs-remove (e.g. PII-carrying param — STOP, needs privacy
  review); coverage narrowing forces a threshold change to stay green (STOP —
  add tests instead, never lower the bar here); `declared` baseline broken.

## Maintenance notes

- New telemetry must update contract + worker + sync test + roundtrip case
  together — the relaxed order assertion still enforces set equality.
- Reviewer: check no `dataLayer`-only event remains allowlisted-but-untransported.
- **Deferred:** `dataLayer` push removal (post-GA dead store?) — investigate
  consumers first, separate plan.
- **Deferred:** full sueldo-líquido money-path characterization (L, needs SII
  review before freezing) — Step-3-adjacent follow-up, not here.
