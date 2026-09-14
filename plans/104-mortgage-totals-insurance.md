# Plan 104: Include insurance in mortgage lifetime totals (or relabel)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- src/application/use-cases/CalculateMortgage.ts src/pages/calculadoras/dividendo-hipotecario.astro tests/application/ tests/domain/`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

The mortgage engine adds `desgravamen + incendio` to every monthly row
(`totalMonthlyUF`) but computes lifetime `totalPaidPesos = basePaymentUF ×
termMonths × uf` and `totalInterestPesos = totalPaidPesos − loanAmountPesos`
from the *base* payment only. Borrowers comparing total cost underestimate
lifetime outlay by years of monthly premiums — the opposite of the code's
"conservative" claim. This is YMYL-facing money math on a flagship
calculator; the fix adds explicit with-insurance outputs and clarifies which
total the UI displays, without removing the existing fields (no silent
contract break).

## Current state

Files and roles:

- `src/application/use-cases/CalculateMortgage.ts:140-231` — engine
- `src/pages/calculadoras/dividendo-hipotecario.astro` — display (incl.
  methodology block)
- Tests: `tests/application/*mortgage*`, `tests/domain/*` (tax/invariants)

Excerpts as of `0e506a8b` (verified by reading):

```ts
// CalculateMortgage.ts:146-152
for (let month = FIRST_AMORTIZATION_MONTH; month <= termMonths; month++) {
  const interestUF = balance * monthlyRateDecimal;
  const capitalUF = basePaymentUF - interestUF;
  const desgravamenUF =
    balance * (monthlyDesgravamenRatePercent / PERCENT_DENOMINATOR);
  const totalMonthlyUF =
    basePaymentUF + desgravamenUF + monthlyFireInsuranceUF;
```

```ts
// CalculateMortgage.ts:213,227-228
const totalPaidPesos = basePaymentUF * termMonths * input.ufValuePesos;
...
  totalPaidPesos,
  totalInterestPesos: totalPaidPesos - loanAmountPesos,
```

So the schedule rows know about insurance; the headline totals do not.

Conventions: use-cases return pure numbers; formatting lives in pages
(`formatCLP`); economic values via `getEconomicParameters()` (never fetch
directly); methodology block explains assumptions; Spanish reader-facing
copy; conventional commits. Freeze: no route/slug/title change (none needed
here). YMYL: numbers need source traceability — insurance inputs are
user-provided rates, methodology note must say so.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/application/ tests/domain/` | declared | all pass |
| Typecheck | `pnpm run astro check` | declared | exit 0 |
| Lint (scoped) | `pnpm exec eslint src/application/use-cases/CalculateMortgage.ts src/pages/calculadoras/dividendo-hipotecario.astro` | declared | exit 0 |

## Scope

**In scope**:

- `src/application/use-cases/CalculateMortgage.ts` (additive outputs only)
- `src/pages/calculadoras/dividendo-hipotecario.astro` (display + methodology note)
- Mortgage tests (new cases + updated snapshots if the UI total changes)

**Out of scope**:

- Annuity formula, rate conversion, schedule shape, UF sourcing, any other
  calculator, routes/slugs/titles/RSS, editorial content beyond the page's
  methodology note.

## Git workflow

- Branch: `advisor/104-mortgage-totals-insurance`
- Commits: e.g. `fix(mortgage): expose lifetime totals with insurance`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + focused tests + `astro check` unmodified. `declared` failure on
clean tree → STOP + report.

**Verify**: all pass unmodified; record one current headline figure as the
pre-change pin (from tests or a scratch run — do not commit the scratch).

### Step 1: Add with-insurance outputs (additive, no rename)

Add `totalInsurancePesos` (sum of `desgravamenUF + fireInsuranceUF` over the
schedule × UF) and `totalPaidWithInsurancePesos`
(`totalPaidPesos + totalInsurancePesos`) to `MortgageOutput`. Keep
`totalPaidPesos`/`totalInterestPesos` byte-identical for backward compat.
Unit-test: zero-insurance input → with-insurance equals base; positive
insurance → difference equals summed schedule insurance.

**Verify**: focused tests pass including 2 new cases.

### Step 2: Display the honest total + methodology note

In `dividendo-hipotecario.astro`, display the with-insurance total as the
headline lifetime figure (or alongside with unambiguous labels — pick the
page's existing label pattern, e.g. "Costo total" vs "Total intereses", and
keep both visible so no reader loses the old number). Add one methodology
sentence: which total includes seguros, that rates are user-provided, and
the effective-date/UF source. Spanish, low-hype, no absolute promises.

**Verify**: `astro check` exit 0; page renders the new labels (scoped test or
manual preview excerpt in the commit message — no screenshot required).

## Test plan

- Engine: zero-insurance identity, positive-insurance sum equality,
  schedule-sum vs headline consistency. Model on existing mortgage tests.
- Page: existing regression/golden coverage must reflect the new headline
  (update snapshots deliberately, one commit, documented).
- Verification: focused-tests command → all pass.

## Done criteria

- [ ] `totalPaidWithInsurancePesos` + `totalInsurancePesos` exist and are test-pinned
- [ ] Old `totalPaidPesos`/`totalInterestPesos` unchanged in value (backward compat)
- [ ] UI shows the with-insurance total with unambiguous labels + methodology sentence
- [ ] Focused tests + `astro check` + scoped lint green
- [ ] No route/slug/title/RSS change; diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; the schedule insurance sum turns out
  non-additive (e.g. decreasing-balance nuance beyond simple sum — STOP, needs
  actuarial review, do not average); UI label change requires copy sign-off
  beyond the methodology sentence (STOP and ask); `declared` baseline broken.

## Maintenance notes

- If payment schedule logic changes, both totals must be re-derived from the
  schedule — never hardcode the delta.
- Reviewer: check the methodology note names the UF value/date source and
  that zero-insurance still displays sensibly.
- **Deferred:** nothing — this plan fully closes the finding.
