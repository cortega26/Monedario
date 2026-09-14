# Plan 100: Close the analytics taxonomy gap and pin worker-v2 with tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 40e3958e..HEAD -- src/contracts/analytics-events.ts src/scripts/analytics.ts src/utils/sueldo-liquido/formController.ts src/utils/analytics.ts workers/analytics-collector/src/ tests/workers/analytics-collector/ tests/integration/analytics-sanitizer.test.ts vitest.config.ts .github/workflows/deploy-analytics-root-fix.yml`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/archive/097-worker-v2-bounded-body.md (DONE 2026-09-14), plans/archive/098-worker-v2-config-validation.md (DONE 2026-09-14), plans/archive/099-analytics-export-hardening.md (DONE 2026-09-14; tests pin their behavior; run last among the worker bundle)
- **Category**: tests
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `40e3958e`, 2026-09-14 — plans 097 (merge
  `67487da9`), 098 (merge `7366f12d`) and 099 (merge `fe935119`) landed;
  excerpts below re-read against live code. Findings intact and EXPANDED:
  the emitter inventory is ~3x the original list (full verified inventory
  inline), and two plan errata were corrected (event count 14→15; Step 2
  coverage mechanics — see inline `RECONCILIATION NOTE`s)
- **Issue**: —

## Why this matters

Two gaps combine into silent telemetry loss. The client emits events/params
the allowlist never defined, so they are pushed to `dataLayer` and then
dropped at the transport gate (`isTransmissibleEvent` in
`src/utils/analytics.ts:37-40`) or rejected by the worker (`rejectUnknown:
true`) before transport — product decisions read telemetry that never
arrives. The loss has TWO shapes (both verified): wholly undefined events
(listed in Current state) AND a defined event sent with the wrong params
(`calculator_complete` is allowlisted with v2 params but sueldo-líquido
emits it with legacy `calculator_slug/calculator_name/outcome/mode`, so the
worker's strict sanitizer rejects every completion). Meanwhile the coverage
gate stays green at ~91% while the deployed `worker-v2.ts` hot path, its
guard branches, and its export surface are gate-invisible — and the v2 test
file's 32 tests (up from 4 via 097–099) still leave the fetch-branch matrix
and DO-class edges unpinned (gap inventory in Step 3). Closing the taxonomy
and pinning the surface with tests restores trust in every downstream
scorecard.

## Current state

Files and roles:

- `src/contracts/analytics-events.ts:1-82` — `ANALYTICS_EVENT_ALLOWLIST`
  (15 events, verified by count — not 14; exact-name assertion lives in
  `tests/integration/analytics-sanitizer.test.ts:12-28`)
- `src/utils/analytics.ts:37-55` — transport gate (`isTransmissibleEvent`)
  and CTA name mapping (`CTA_EVENT_NAMES`: `article-calculator-cta` →
  `article_calculator_cta_click` (allowlisted), `calculator-trust-link` →
  `calculator_trust_link_click`, `hub-route` → `hub_route_click`,
  `next-step` → `next_step_click` (allowlisted), `related-post` →
  `related_content_click`, `search-chip` → `search_chip_click`, missing/
  unknown → `cta_click` — the last FIVE names are NOT allowlisted)
- `src/scripts/analytics.ts:142-209` — global CTA tracking (`:156-162`,
  sends `cta_type/cta_label/cta_location/destination_url`; note `cta_label`
  is sent but allowlisted NOWHERE) + `article_scroll_depth` (`:195-199`,
  sends `article_slug/article_title/scroll_depth_percent` where the percent
  is a NUMBER milestone, but the sanitizer only accepts strings)
- `src/utils/sueldo-liquido/formController.ts` — `calculator_complete`
  with legacy params at `:304-309` (`calculator_slug/calculator_name/
  outcome/mode: liquido-a-bruto`) and `:415-420` (same shape,
  `mode: bruto-a-liquido`) — the event IS allowlisted (`analytics-events.ts:12`)
  but with v2 params `["calculator_id", "page_type", "cluster",
  "app_version"]`, so both emissions are rejected; plus the undefined trio
  `calculator_mode_toggle` (`:433-436`, params `calculator_slug/mode`),
  `calculator_copy_link` (`:504-506`, param `calculator_slug`),
  `calculator_copy_result` (`:564-566`, param `calculator_slug`)
- Out-of-scope emitters (DO NOT EDIT these files — allowlist-add decisions
  need no emitter edits; emit-remove would, so it is NOT available for
  these — defer instead): `src/pages/buscar.astro:297,309,325`
  (`search_submit` with `search_term`, `search_result_click` with
  `result_url/search_term` — FREE-TEXT user input, see Tier B),
  `src/components/ResumeWidget.astro:128,156,176` (`resume_click` with
  `item_type/item_id/item_url`, `resume_cleared` with `{}`),
  `src/components/CalculatorResultNextActions.astro:87,95,102`
  (`calculator_print_click` / `calculator_share_click` with
  `calculator_slug`; `calculator_result_action_click` with
  `calculator_slug/action_label/action_type/destination_href`)
- Allowlisted-but-never-emitted (keep for contract stability, no action):
  `calculator_error` (no emitters in `src/`, known from plan 086),
  `support_confirmed` (no emitters found)
- `vitest.config.ts:17-49` — coverage `include: ["src/**/*.ts"]`, excludes
  incl. `workers/**` (`:44`); threshold lines 80 (`:46-48`).
  RECONCILIATION NOTE (erratum): narrowing the `workers/**` exclude alone
  can NEVER count the worker, because `include` is `src/`-only — Step 2
  below is rewritten to extend `include` instead.
- `workers/analytics-collector/src/worker-v2.ts` — v2 fetch handler
  `:751-831` (OPTIONS 204 / disabled-503 / 405 / 403-origin / 415 /
  413-length+body / 400 / 422 / 429 / 503+Retry-After / 202), manual-export
  handler `:695-749` (503-not-configured / 401 / 403 / 400-invalid_week /
  429 / 500), DO class `:157-260` (204-increment / 400-invalid_window /
  400-invalid_limit / 400-invalid_cursor / 422-invalid_counter /
  404-not_found / GET-health) + `scheduled()` cron (`:831+`)
- `tests/workers/analytics-collector/root-cause.test.ts` — 32 v2 tests
  (describes at `:221,263,301,441,662`: ingestion 3, export 1, 097
  byte-limits 5, 098 validation 15, 099 hardening 8); mocks are paginated
  since 099 (`MockKV` 50/page, `MockCounterStub` limit/cursor) — the
  "single-page mocks" line below is superseded; remaining gap is the
  fetch-branch matrix + export auth paths + direct DO-class edges (Step 3
  inventory)
- `tests/integration/analytics-sanitizer.test.ts:12-46` — asserts the EXACT
  allowlist key order (`:12-28`) and property order (`:29-46`) via `toEqual`
  (brittle: any additive taxonomy change breaks it — Step 1 relaxes this)
- `tests/static-analysis/data-signals-allowed-events-sync.test.ts` — asserts
  the weekly-pipeline script copies cover EVERY contract event name.
  RECONCILIATION NOTE (erratum): the mechanism is script Sets, not test
  names — adding a contract event WITHOUT updating
  `scripts/data-signals/fetch-analytics-export.mjs` (`ALLOWED_EVENTS`) and
  `scripts/build-weekly-search-report.mjs` (`ANALYTICS_EVENT_NAMES`) turns
  `pnpm run test` red. Both scripts are ADDED to scope for Set-literal-only
  edits (Step 1).
- `.github/workflows/deploy-analytics-root-fix.yml:63-105` — validate runs
  wrangler-config greps (`:67-77`) + ONLY `root-cause.test.ts` (`:79-99`,
  with its tsconfig swap) + dry-run (`:101-105`); skips the `schema.test.ts`
  matrix; trigger is pushes to `fix/analytics-kv-root-cause` + manual
  `workflow_dispatch` (`:8-12`)

Excerpts as of `40e3958e` (verified by reading; supersede the `0e506a8b` excerpts from planning):

```ts
// src/contracts/analytics-events.ts:4
calculator_view: ["calculator_id", "page_type", "cluster", "app_version"],
// (15 events total through line 82; Tier-A/B names absent — verified by grep)
```

```ts
// src/utils/analytics.ts:37-40 — the silent-loss gate
export function isTransmissibleEvent(eventName: string): boolean {
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
// vitest.config.ts:21 + :44 — include is src-only, so the workers/** exclude is vacuous
include: ["src/**/*.ts"],
"workers/**",
```

```ts
// root-cause.test.ts describes at :221,263,301,441,662 — 32 tests total
// (ingestion 3, export 1, 097 byte-limits 5, 098 validation 15, 099 hardening 8)
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
| Lint (scoped) | `pnpm exec eslint src/contracts/analytics-events.ts src/scripts/analytics.ts src/utils/analytics.ts src/utils/sueldo-liquido/formController.ts workers/analytics-collector/src/worker-v2.ts` | declared | exit 0 |

## Scope

**In scope**:

- `src/contracts/analytics-events.ts`
- `src/scripts/analytics.ts` (only if an emission must be removed/renamed per taxonomy decision; prefer allowlist additions)
- `src/utils/sueldo-liquido/formController.ts` (same — emissions only)
- `src/utils/analytics.ts` (ONLY to extend `CTA_EVENT_NAMES`/types if a Tier-A decision requires it; do not redesign the gate)
- `workers/analytics-collector/src/index.ts` + `worker-v2.ts` (only to mirror the same allowlist constants — no logic change beyond constant reuse)
- `scripts/data-signals/fetch-analytics-export.mjs` + `scripts/build-weekly-search-report.mjs` (ONLY the `ALLOWED_EVENTS` / `ANALYTICS_EVENT_NAMES` Set literals: add each newly-allowlisted event name; no logic change — required by the sync test, which reads these Sets)
- `vitest.config.ts` (extend coverage `include` to the collector entry as specified in Step 2 — config-only)
- `tests/workers/analytics-collector/root-cause.test.ts`, `tests/integration/analytics-sanitizer.test.ts`, `tests/static-analysis/data-signals-allowed-events-sync.test.ts` (tests)
- `.github/workflows/deploy-analytics-root-fix.yml` (validate step: run both collector suites — the 099 paginated fixture already lives in `root-cause.test.ts`)

**Out of scope**:

- Body-reader/export/pagination behavior (097/099 own it; this plan only tests it).
- New event design beyond the Tier-A/Tier-B inventory below (no new telemetry).
- `src/pages/buscar.astro`, `src/components/ResumeWidget.astro`,
  `src/components/CalculatorResultNextActions.astro` (emitters live here but
  the files are out of scope — allowlist-add decisions need no emitter
  edits; anything requiring an emitter edit here is DEFERRED, not removed).
- `dataLayer` removal question (record as deferred, do not delete pushes here).
- Changing coverage threshold value or plan-073 page/component excludes.
- Touching `validateExportArtifact`'s 80-char piece check or 099's `v2:`
  dimensions format (099 owns it; roundtrip tests must pass THROUGH it,
  not around it).

## Git workflow

- Branch: `advisor/100-analytics-taxonomy-tests`
- Commits: e.g. `fix(analytics): allowlist emitted events; pin worker-v2 surface with tests`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install, both typechecks, full `pnpm run test`, coverage unmodified. Record.
`declared` failure on clean tree → STOP + report.

**Verify**: all pass unmodified (note coverage % for comparison).

### Step 1: Reconcile the taxonomy (additive, tiered)

Work in two tiers so a privacy question on one event cannot block the rest.
Default per event/param is allowlist-add (the emitters look intentional);
document any intentionally client-only field instead of allowlisting it.

TIER A — must complete (all in-scope files; no privacy risk):
(a) the undefined quartet `calculator_mode_toggle` / `calculator_copy_link`
/ `calculator_copy_result` / `article_scroll_depth` with their emitted
params (`calculator_slug/mode`, `calculator_slug`,
`article_slug/article_title/scroll_depth_percent` — note the percent arrives
as a NUMBER milestone while the sanitizer accepts only strings: decide
stringify-at-emitter (`analytics.ts`, in scope) vs numeric-accepting
validator, and pin the choice with a test);
(b) the CTA-mapped names `cta_click` (fallback), `calculator_trust_link_click`,
`hub_route_click`, `related_content_click`, `search_chip_click` — decide:
allowlist each with the params actually sent (`cta_type/cta_label/
cta_location/destination_url`; note `cta_label` is sent but allowlisted
nowhere) or remove the mapping entry in `CTA_EVENT_NAMES` so it falls back
to a single allowlisted name (do NOT leave a name that resolves to a
non-transmissible event);
(c) the `calculator_complete` param mismatch: the event stays, but BOTH
emissions (`formController.ts:304-309,415-420`) send legacy
`calculator_slug/calculator_name/outcome/mode` while the allowlist demands
v2 `calculator_id/page_type/cluster/app_version`. Decide: widen the
allowlisted params (additive, keeps out-of-scope `.astro` emitters working
if they send slug-shaped params) or migrate the two in-scope emissions to
v2 params. Either way both call sites must produce 202s afterwards (pin
with a test per call site — mode liquido-a-bruto AND bruto-a-liquido).
`calculator_error` and `support_confirmed` are allowlisted but have no
emitters: keep (contract stability), no test required.

TIER B — investigate only (emitters in OUT-OF-SCOPE files; free-text or
history-shaped params): `search_submit` / `search_result_click`
(`search_term` is raw user input, `result_url` absolute hrefs),
`resume_click` (`item_type/item_id/item_url` — browsing-history shaped),
`resume_cleared`, `calculator_print_click` / `calculator_share_click` /
`calculator_result_action_click` (`calculator_slug/action_label/action_type/
destination_href` — no free text; lowest risk). Rule: add a Tier-B event
ONLY if its params are provably PII-free; otherwise DO NOT add it, DO NOT
edit its emitter, and instead pin it NON-transmissible (a test asserting
`isTransmissibleEvent(name) === false`) + record it in Maintenance notes as
a deferred privacy-reviewed follow-up. If a Tier-A item turns out
PII-carrying, STOP per STOP conditions (do not improvise).

Mirror the Tier-A additions in the worker validators (reuse the contract
constants via the existing `../../../src/contracts/analytics-events`
import pattern in `index.ts:24` — don't fork). Update the TWO
data-signals script Sets with every newly-allowlisted event name
(`fetch-analytics-export.mjs` `ALLOWED_EVENTS`,
`build-weekly-search-report.mjs` `ANALYTICS_EVENT_NAMES` — Set literals
only). Update the sync test ONLY if its mechanism changed (it reads those
Sets; normally no test edit needed). Relax the exact-order assertions in
`analytics-sanitizer.test.ts:12-46` to set-membership (order is not a
contract) plus keep one strict roundtrip case per allowlisted event through
both sanitizers (`sanitizeAnalyticsPayload` lenient + `rejectUnknown: true`
strict — the 099 `v2:`-format CTA case in `root-cause.test.ts:888-901`
already pins the worker side of `article_calculator_cta_click`; reuse that
pattern, don't duplicate it).

**Verify**: `pnpm run test` → all pass (this now includes the sync test
over the updated script Sets); `grep -rn "calculator_mode_toggle" src/contracts/analytics-events.ts` → match (or emitter removed with comment).

### Step 2: Count the deployed worker in the gate

RECONCILIATION NOTE: the original Step 2 ("narrow the `workers/**`
exclude") cannot work — coverage `include` is `src/**/*.ts`, so worker
files are never candidates and the exclude is vacuous for them. Do this
instead: add `"workers/analytics-collector/src/worker-v2.ts"` to coverage
`include`, AND narrow the `"workers/**"` exclude entry so it no longer
covers that file (exclude wins over include — e.g. replace `"workers/**"`
with `"workers/analytics-collector/src/index.ts"` plus any other worker
paths that must stay out; the legacy `index.ts` entry is NOT the deployed
worker and stays excluded). Keep plan-073 pages/components/scripts/config
excludes untouched. Do not lower the 80 threshold. Expect the first
coverage run to surface untested v2 lines — that is the point; Step 3
covers them. `coverage/` output is NOT gitignored — `rm -rf coverage`
before any commit (verify `git status --short` shows no `coverage/`).

**Verify**: `pnpm run test:coverage` → exit reflects the new scope (record %;
if below threshold, proceed to Step 3 — do not lower the gate).

### Step 3: Pin the v2 surface (fetch branches + export auth + DO edges)

First inventory what 097–099 already pinned in `root-cause.test.ts` (32
tests: 202/429/503-ingest-fail, 5 byte-limits, 15 validation, 8 export
hardening) and add ONLY the missing cases — do not duplicate. Missing as
of `40e3958e` (verify each is still missing before writing it):
fetch branches 405 (non-POST), 403 (bad Origin), 415 (non-JSON),
400 (malformed JSON — distinct from 097's split-multibyte 422 case),
422 (schema-invalid), 503+Retry-After via `ANALYTICS_DISABLED=1`
(the existing 503 covers DO-write failure, not the disabled gate);
export paths 503-not-configured (no `EXPORT_SECRET`), 401-missing_secret,
403-invalid_secret, 429-export-rate-limit; DO-class edges via direct
`AnalyticsCounters` instantiation with a fake state object
(`{ storage: { sql: <stub> } }` — the class only uses `state.storage.sql`
and was shaped for Node-test importability, `worker-v2.ts:150-156`; a stub
`exec` returning `{ toArray: () => [] }` suffices for edge paths that
return early): `invalid_window`, `invalid_limit`, `invalid_cursor`,
`invalid_json`/`invalid_counter` on `/increment`, `not_found` route,
`/health` shape. Bounds pinned by 099 (`decodeListCursor`/
`isIncrementPayload` 80/80/1024) need no new tests unless Tier-A params
change the shape. DO NOT re-test pagination/poison/skip/compact/`v2:`
serialization (099 owns those; the CTA roundtrip in Step 1 passes through
the `v2:` writer — assert the artifact outcome, never the writer's
internals). Keep changes test-only except the Step-1 constants.

**Verify**: `pnpm exec vitest run tests/workers/analytics-collector/` → all pass with ≥10 new cases total.

### Step 4: Widen the deploy-validate lane

In `deploy-analytics-root-fix.yml` validate step: extend the
`"$TOOL_ROOT/node_modules/.bin/vitest" run
tests/workers/analytics-collector/root-cause.test.ts` line (`:97`) to also
run `tests/workers/analytics-collector/schema.test.ts` (the 099 paginated
fixture already lives inside `root-cause.test.ts`, so no separate fixture
step is needed). CI-only change; slightly longer job is expected.

**Verify**: workflow YAML parses (`node --check` equivalent or
`prettier --check` on the file); no other job semantics changed
(`git diff` shows only the validate step).

## Test plan

- Taxonomy: set-membership assertions + strict roundtrip per Tier-A
  allowlisted event (client → worker), modeled on
  `analytics-sanitizer.test.ts:201-259` CTA/article cases and the 099
  `v2:`-format CTA test (`root-cause.test.ts:888-901`, reused not duplicated).
- Worker: Step-3 gap inventory (fetch branches, export auth, direct DO
  edges via fake-state instantiation) — ≥10 new, none duplicating 097–099.
- Gate: coverage run before/after the Step-2 include change (record both %);
  `rm -rf coverage` before committing (output is untracked, not ignored).
- Verification: full `pnpm run test` + `test:coverage` green at the end.

## Done criteria

- [ ] `pnpm run test` exits 0 (includes the data-signals sync test over
  the updated script Sets)
- [ ] `pnpm run test:coverage` exits 0 with the collector entry counted
  (`worker-v2.ts` in coverage `include`, `workers/**` exclude narrowed so it
  no longer covers that file)
- [ ] Every Tier-A event/param emitted in `src/` exists in the allowlist
  (grep-clean); every Tier-B event is either allowlisted (PII-free) or
  pinned non-transmissible with a deferral note
- [ ] Both data-signals script Sets cover every contract event (sync test
  green — no third copy of the taxonomy drifts again)
- [ ] v2 branch matrix + export auth + direct DO edges exist and pass
  (≥10 new, none duplicating 097–099)
- [ ] Deploy workflow runs both suites; diff confined to validate step
- [ ] Both typechecks + scoped lint exit 0; diff lists only in-scope files;
  no `coverage/` artifact committed

## STOP conditions

- Drift; double verification failure; taxonomy decision requires product
  input beyond add-vs-remove (e.g. PII-carrying param — STOP, needs privacy
  review); coverage narrowing forces a threshold change to stay green (STOP —
  add tests instead, never lower the bar here); `declared` baseline broken.

## Maintenance notes

- New telemetry must update contract + worker + BOTH data-signals script
  Sets + sync test + roundtrip case together — the relaxed order assertion
  still enforces set equality, and the sync test enforces the script copies.
- Reviewer: check no `dataLayer`-only event remains allowlisted-but-untransported.
- Plan 112 (APV error spike) coordinates names with THIS plan's Tier-A
  outcome: 112 must reuse the event/param names defined here, not invent new
  ones.
- **Deferred — Tier-B outcome recorded at close (DONE 2026-09-14, merge
  `29856700`, commit `2a560702`):** ADDED as PII-free:
  `calculator_print_click`, `calculator_share_click`, `resume_cleared`
  (constants/empty payload + page_type/app_version). PINNED
  non-transmissible (test-gated `isTransmissibleEvent === false`) +
  DEFERRED to a privacy-reviewed follow-up: `search_submit` /
  `search_result_click` (`search_term` raw user input), `resume_click`
  (`item_url` history URLs with query), `calculator_result_action_click`
  (`action_label` free text, `destination_href`), plus the
  execution-discovered DecisionWizard set (`wizard_start` / `wizard_step` /
  `wizard_complete` / `wizard_cta_click`, `option_label` free text,
  emitter out of scope). `calculator_error` / `support_confirmed` stay
  allowlisted-but-unemitted (contract stability). Final gate state at
  close: full suite 166 files / 1576 tests green, coverage lines 91.56%
  (worker-v2.ts 89.96%), threshold 80 untouched, `check:ci` exit 0
  pre-merge.
- **Deferred:** `dataLayer` push removal (post-GA dead store?) — investigate
  consumers first, separate plan.
- **Deferred:** full sueldo-líquido money-path characterization (L, needs SII
  review before freezing) — Step-3-adjacent follow-up, not here.
