# Plan 105: Small input-contract hardening (prepayment bound, storage shape, reddit count)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- src/application/use-cases/SimulateCreditPrepayment.ts src/application/use-cases/shared/creditAmortization.ts src/utils/calculatorScenarios.ts src/utils/userProfile.ts src/utils/resumeState.ts workers/reddit-mention-monitor/src/index.ts tests/`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

Three independent S/LOW fixes share one theme: unvalidated inputs become
wrong outputs instead of errors. An unbounded `remainingMonths` (e.g. pasted
`1e12`) freezes the calculator tab in a near-infinite amortization loop.
Corrupted `localStorage` (cross-version store, non-array where an array is
assumed) throws on spread or renders attacker-shaped strings. The reddit
monitor returns `alerted: matches.length` (attempted) while only `delivered`
were marked seen — partial Discord failures log success counts that hide
delivery gaps. Each fix is validation-only with existing fallback semantics.

## Current state

Files and roles:

- `src/application/use-cases/SimulateCreditPrepayment.ts:51-53,89` + `shared/creditAmortization.ts:45`
- `src/utils/calculatorScenarios.ts:27-36`, `src/utils/userProfile.ts:53-64,99-101`, `src/utils/resumeState.ts:21-29,22-61`
- `workers/reddit-mention-monitor/src/index.ts:119-136`
- Tests: unit/integration/worker suites per area

Excerpts as of `0e506a8b` (verified by reading):

```ts
// SimulateCreditPrepayment.ts:51-53
if (!Number.isFinite(input.remainingMonths) || input.remainingMonths <= 0) {
  throw new Error("remainingMonths must be a finite number greater than 0.");
}
// :89
const maxMonths = input.remainingMonths + 12;
```

(`creditAmortization.ts:45` loops `while (balance > threshold && months <
maxMonths)` — unbounded input = near-infinite loop. Whether page-level forms
cap this first is unverified; the use-case must defend itself regardless.)

```ts
// calculatorScenarios.ts:27-36
function loadStore(): ScenarioStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ScenarioStore;
    return parsed && typeof parsed === "object" ? parsed : {};
```

(`userProfile.ts:53-64` spreads `...parsed` without allowlisting;
`resumeState.ts:21-29` casts to `ResumeData`; downstream
`calculatorScenariosUI.ts:142-144,170-177` assumes arrays/strings.)

```ts
// reddit index.ts:131-136
log("info", "run.complete", {
  keywordGroups: KEYWORD_GROUPS.length,
  found: totalFound,
  alerted: matches.length,
});
return { found: totalFound, alerted: matches.length };
```

(Only `delivered` are marked seen at `:121`; `error` is logged at `:122-128`
but the return still reports attempted as alerted.)

Conventions: use-cases throw `Error` with Spanish messages on invalid input;
storage helpers fail-open to empty store on parse error (extend, don't
replace); worker uses structured `log(level,event,fields)`; conventional
commits.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/application/ tests/unit/ tests/integration/ tests/workers/reddit-mention-monitor/` | declared | all pass |
| Typecheck | `pnpm run astro check` | declared | exit 0 |
| Lint (scoped) | `pnpm exec eslint src/application/use-cases/SimulateCreditPrepayment.ts src/utils/calculatorScenarios.ts src/utils/userProfile.ts src/utils/resumeState.ts workers/reddit-mention-monitor/src/index.ts` | declared | exit 0 |

## Scope

**In scope** (only these):

- `src/application/use-cases/SimulateCreditPrepayment.ts`
- `src/utils/calculatorScenarios.ts`, `src/utils/userProfile.ts`, `src/utils/resumeState.ts`
- `workers/reddit-mention-monitor/src/index.ts`
- Corresponding tests (new cases in existing files)

**Out of scope**:

- Amortization math, storage schema migration, Discord embed content
  (SEC-06 markdown — explicitly deferred, low leverage), Reddit search
  parallelism (investigate-only), any UI copy change, any new telemetry.

## Git workflow

- Branch: `advisor/105-input-contract-hardening`
- Three commits (one per fix), e.g. `fix(credit): bound remainingMonths`,
  `fix(storage): validate persisted shapes`, `fix(reddit-monitor): report delivered count`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + focused tests + `astro check` unmodified. `declared` failure on
clean tree → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Bound remainingMonths + non-amortizing guard

Assert `remainingMonths <= 600` (50 years — rejects nonsense, accepts every
real Chilean credit) in `assertInput`; keep the existing Spanish error style.
Also throw early when the payment can't amortize (the `withoutPrepayment.months
>= maxMonths` check at `:97` already exists — add the symmetric early guard
for non-finite/negative `paymentStrategy` results per the shared helper's
contract). No loop change.

**Verify**: focused application tests pass; add tests: `remainingMonths: 1e12`
→ throws; `600` → passes; `601` → throws.

### Step 2: Validate persisted shapes at load

Add narrow guards at the three load sites (hand-rolled or Zod — match the
file's existing style, no new dependency): `ScenarioStore` values must be
arrays of `{id,name,ts,inputs,summary}`-shaped objects; `UserProfileV1`
spread must allowlist known keys; `ResumeData` must match its interface.
On mismatch: fall back to the same empty default as the parse-error path
(never throw, never migrate silently). Existing quota-ignore `catch`
behavior unchanged.

**Verify**: unit/integration tests pass; add tests: corrupted store
(`"{\"a\": 1}"`, `"[]"`, non-array entry, unknown-key profile) → empty
default, no throw.

### Step 3: Report delivered, not attempted

Return `{ found, alerted: delivered.length, attempted: matches.length }`
and keep the `alert.partial_failure` warn log as-is. Update any caller/test
that destructures the return (grep `runMonitor` consumers first).

**Verify**: reddit-monitor tests pass; add test: partial Discord failure
(1 of 2 delivered) → `alerted: 1, attempted: 2`.

## Test plan

- Prepayment: bound + non-amortizing cases (Step 1).
- Storage: corrupted/cross-version fixtures per helper (Step 2).
- Reddit: partial-delivery count case (Step 3).
- Model on existing per-area suites; verification is the focused-tests
  command → all pass.

## Done criteria

- [ ] `remainingMonths > 600` throws; loop is unreachable with absurd input
- [ ] Corrupted stores fall back to empty defaults without throw (test-pinned)
- [ ] Monitor return distinguishes `alerted` (delivered) from `attempted`
- [ ] Focused tests + `astro check` + scoped lint green
- [ ] Diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; a page-level cap already rejects the
  bound test input in a way that makes the use-case bound untestable
  (document the cap and keep the use-case guard anyway — do not remove it);
  storage validation requires schema migration (STOP — this plan is
  validate-and-fallback only); monitor return type is consumed by an
  out-of-scope dashboard (STOP instead of breaking it); `declared` baseline
  broken.

## Maintenance notes

- If credit products beyond 50y ever appear, raise the 600 bound with a
  product justification — never remove it.
- If storage schemas version up, add explicit `version` field + migrator;
  the guards added here are the place to branch.
- Reviewer: confirm Step-2 guards reject without logging PII (shapes only,
  never values).
- **Deferred:** Discord markdown/mention neutralization, vendor query-cred
  log audit, editorial href scheme allowlist (all MED/LOW-confidence or
  low-prod-impact; revisit only when those workers/templates are touched).
