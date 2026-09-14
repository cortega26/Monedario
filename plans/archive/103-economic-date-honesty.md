# Plan 103: Stop fabricating indicator dates and flag estimated UTA

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4234805c..HEAD -- src/infrastructure/economic/EconomicParameterProvider.ts workers/economic-snapshot-refresh/src/buildSnapshot.ts tests/infrastructure/EconomicParameterProvider.test.ts tests/workers/economic-snapshot-refresh/`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `4234805c`, 2026-09-14 — in-scope files
  untouched since planning (drift empty); excerpts re-read against live
  code, both findings intact; three reconciliation notes inline (provider
  callers verified `undefined`-safe; no readers of `provenance.utm.status`
  exist; 091-idempotency guard for the new provenance block)
- **Issue**: —

## Why this matters

Two date paths hide staleness instead of surfacing it. The app provider's
`toIsoDate` stamps a missing upstream `fecha` as *today*, so stale UF/UTM
pass freshness checks and feed calculators with false recency. Separately,
the snapshot worker annualizes `UTA = UTM corriente × 12` when December UTM
is unavailable with only a `console.warn` — downstream annual figures inherit
monthly inflation error with no machine-readable signal that UTA is
estimated. Both fixes are additive provenance/validation; no figure changes
when sources are healthy.

## Current state

Files and roles:

- `src/infrastructure/economic/EconomicParameterProvider.ts:123-141` —
  `toIsoDate`/`getLatestIsoDate`
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts:174-183,218-257` —
  UTA fallback + `rawDates`/`indicatorUpdatedAt`
- Tests: `tests/infrastructure/EconomicParameterProvider.test.ts`
  (snapshot/live/memo/IMM pinning), worker `buildSnapshot` suite

Excerpts as of `4234805c` (re-read; in-scope files byte-identical to planning):

```ts
// EconomicParameterProvider.ts:123-128
function toIsoDate(value: string | undefined): string {
  if (value && value.length >= 10) {
    return value.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}
```

RECONCILIATION NOTE (Step-1 assumption verified): all live callers already
tolerate `undefined` — the internal `.map` filters falsy values
(`:134-140`), the six `indicatorUpdatedAt` assignments are guarded
ternaries (`? toIsoDate(...) : undefined`, `:249-254`), and the final
`getLatestIsoDate` falls back to `FALLBACK_LAST_UPDATED` (`:256-267`). The
type change `string` → `string | undefined` is contained; no caller needs a
behavior change. If you find any other caller, STOP per STOP conditions.

Contrast the worker's honest version (`buildSnapshot.ts:109-114`):
`toRealIsoDate` returns `undefined` so freshness gates fail loudly.

```ts
// buildSnapshot.ts:174-183
const utaRefYear = getUtaReferenceYear(now);
const decUtm = await deps.fetchDecemberUtm(utaRefYear);
const uta = decUtm !== null ? decUtm * 12 : utm * 12;
if (decUtm === null) {
  // Fallback no silencioso: la UTA anualizada con UTM corriente es aproximada
  // y solo debe ocurrir cuando mindicador Y SII fallan.
  console.warn(
    `[economic-snapshot] UTA fallback: UTM de diciembre ${utaRefYear} no disponible; UTA anualizada = UTM corriente × 12`
  );
}
```

`rawDates.uta` (`:221`) reuses `payload?.utm?.fecha` on fallback, and the
snapshot literal (`:259-287`) carries `provenance.utm.{primarySource,
sourceUrl,status,verifiedAt}` (`:279-286`, type at `:70-77`) but no UTA
block.

RECONCILIATION NOTE (Step-2 scoping, verified by grep): NOTHING outside
`buildSnapshot.ts` reads `provenance.utm.status` — no freshness gate, script,
or component consumes it. "The same way UTM fallback is surfaced" therefore
means write-only parity: extend the `EconomicSnapshot` interface (`:70-77`)
and the snapshot literal with a `provenance.uta` block. Do NOT add readers
and do NOT edit any consumer/gate file (out of scope).

RECONCILIATION NOTE (091-idempotency guard, load-bearing): the worker's
idempotency check (`index.ts`, OUT OF SCOPE) ignores ONLY `capturedAt` and
`provenance.utm.verifiedAt` as observation instants — a `status` flip
correctly produces a commit (real change), but any PER-RUN instant you add
inside `provenance.uta` (e.g. a mirrored `verifiedAt: now.toISOString()`)
would break idempotency and commit on every refresh, reintroducing exactly
what plan 091 fixed. Therefore `provenance.uta` MUST contain only stable
values: `status: "primary" | "fallback"` + reference year/date used (e.g.
`referenceYear`, `referenceDate: "${utaRefYear}-12-01"` on primary or the
actually-used date on fallback). NO timestamps. `tests/workers/
economic-snapshot-refresh/idempotency.test.ts` pins this — it must stay
green unmodified in intent (extend only if it asserts the exact provenance
shape; prefer additive assertions).

Conventions: provider callers already handle `undefined` via
`getLatestIsoDate` fallback paths; worker provenance pattern mirrors UTM;
failing loudly on staleness is the established direction (plan 091
idempotency kept provenance changes as real changes); conventional commits.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/infrastructure/EconomicParameterProvider.test.ts tests/application/FinancialUseCases.regression.test.ts` | declared | all pass |
| Worker tests | `pnpm exec vitest run tests/workers/economic-snapshot-refresh/` | declared | all pass |
| Lint (scoped) | `pnpm exec eslint src/infrastructure/economic/EconomicParameterProvider.ts workers/economic-snapshot-refresh/src/buildSnapshot.ts` | declared | exit 0 |

## Scope

**In scope**:

- `src/infrastructure/economic/EconomicParameterProvider.ts`
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts`
- `tests/infrastructure/EconomicParameterProvider.test.ts` + worker
  `buildSnapshot` tests (new cases)

**Out of scope**:

- Any numeric change when sources are healthy; fallback removal; mindicador
  decoupling (explicitly deferred in prior audit — needs completeness
  decision, not a small fix); freshness-gate thresholds; snapshot refresh
  scheduling.

## Git workflow

- Branch: `advisor/103-economic-date-honesty`
- Commits: e.g. `fix(economic): fail-loud missing dates; provenance-flag estimated UTA`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + focused + worker tests unmodified. `declared` failure on clean
tree → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Fail loud on missing dates in the provider

Change `toIsoDate` to return `string | undefined` (`undefined` on
missing/invalid input) and let `getLatestIsoDate`/validation surface
staleness (callers already handle `undefined`). Update internal callers'
types only. No new fallback value anywhere.

**Verify**: focused provider tests pass; add tests: missing/empty/garbage
`fecha` → `undefined` propagates and freshness flags staleness (not today).

### Step 2: Provenance-flag estimated UTA

Add `provenance.uta.status: "primary" | "fallback"` (mirroring the UTM
pattern at `buildSnapshot.ts:279-286`, type at `:70-77`) plus the reference
year/date used; include it in the built snapshot and export validation. HARD
CONSTRAINT (plan 091 idempotency): stable values ONLY — `status` plus
reference year/date; NEVER a per-run instant such as `verifiedAt` (the
out-of-scope idempotency check ignores only `capturedAt` and
`provenance.utm.verifiedAt`; a fresh timestamp per run would commit on every
refresh). Keep the `console.warn` text unchanged. Parity with UTM is
write-only (verified: no consumer reads `provenance.utm.status`) — do not
create readers or edit gate files.

**Verify**: worker tests pass; add tests: December-UTM-missing →
`status: "fallback"` + snapshot still builds; December-present →
`status: "primary"`.

## Test plan

- Provider: missing/empty/invalid `fecha` cases; latest-date selection
  ignoring `undefined`; regression suite green (no numeric change on healthy
  fixtures). Model on `tests/infrastructure/EconomicParameterProvider.test.ts`.
- Worker: UTA primary/fallback provenance cases. Model on existing
  `buildSnapshot` tests.
- Verification: the two focused commands → all pass.

## Done criteria

- [ ] Missing upstream `fecha` never stamps today (`grep -n "new Date().toISOString" src/infrastructure/economic/EconomicParameterProvider.ts` → no matches in `toIsoDate`)
- [ ] UTA fallback is machine-readable in provenance (test-pinned)
- [ ] Both focused suites + regression suite green; scoped lint green
- [ ] No healthy-path numeric change (regression suite is the pin)
- [ ] Diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; a caller cannot handle `undefined`
  without behavior change beyond typing (STOP — needs a wider plan);
  provenance schema change breaks a consumer test that cannot be updated
  within scope (STOP); `declared` baseline broken.

## Maintenance notes

- If new indicators are added, give them `toRealIsoDate`-style honest dates
  from day one — never copy the old `toIsoDate` default.
- Reviewer: confirm no test fixture depended on the today-stamp (a fixture
  with missing `fecha` passing freshness before this fix was the bug).
- **Deferred:** mindicador-first decoupling (needs completeness/fallback
  design) — not in this plan by explicit prior decision.
