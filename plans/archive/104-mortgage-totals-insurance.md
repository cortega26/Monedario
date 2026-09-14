# Plan 104: Include insurance in mortgage lifetime totals (or relabel)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5a00858c..HEAD -- src/application/use-cases/CalculateMortgage.ts src/pages/calculadoras/dividendo-hipotecario.astro tests/application/ tests/domain/`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `5a00858c`, 2026-09-14 — in-scope files
  untouched since planning (drift empty); excerpts re-read against live
  code, finding intact; page-state notes inline (the interactive block
  already qualifies labels — the gaps are the engine outputs, the static
  example, the scenario summary, and the MethodologyBlock notes)
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
- `src/pages/calculadoras/dividendo-hipotecario.astro` — display.
  RECONCILIATION NOTE (page state as of `5a00858e`; the interactive results
  block ALREADY qualifies its labels, so Step 2 is harmonization, not a
  redesign — follow the page's own `(sin seguros)` pattern):
  headline `:622` "Dividendo base (sin seguros)" + rows `:661-668` "Total a
  pagar (sin seguros)" / "Total intereses (sin seguros)" (qualified ✓);
  static example `:301-306` "Total intereses" UNQUALIFIED (shows
  `totalInterestPesos`); scenario summary `:773-775` "Total intereses" /
  "Total a pagar" UNQUALIFIED; `MethodologyBlock` `:388-390` notes explain
  insurance optionality but never state which lifetime total includes
  seguros. The amortization table already toggles insurance columns
  (`:686-693` `showDesg`/`showFire`) — mirror that conditional idiom for
  any new con-seguros row (show only when insurance inputs are present, so
  zero-insurance output doesn't duplicate the base row).
- Tests: `tests/application/CalculateMortgage.test.ts` (engine cases +
  `:159+` "ejemplo de metodología — anti-drift" pinning the published
  example — keep green; label-only changes must not move its figures).
  `tests/accessibility/calculator-scenario-consistency.test.ts` touches this
  page but asserts only input-fill/scenario keys (verified: no label
  assertions) — no update needed there; do NOT run the Playwright suite
  (needs a preview server; out of scope).

Excerpts as of `5a00858c` (re-read; in-scope files byte-identical to planning):

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

Follow the page's EXISTING label pattern (no redesign): the interactive
block already uses "Total a pagar (sin seguros)" / "Total intereses (sin
seguros)" (`:661-668`). (a) Add the with-insurance lifetime row alongside
("Total a pagar (con seguros)" + optionally "Total seguros"), shown only
when insurance inputs are present — mirror the table's `showDesg`/`showFire`
conditional idiom (`:686-693`) so zero-insurance output doesn't duplicate
the base row. (b) Harmonize the two unqualified sites to the same pattern:
static example "Total intereses" (`:301-306`) and scenario summary
(`:773-775`). (c) Extend the `MethodologyBlock` `notes` prop (`:390`) with
one sentence: which lifetime total includes seguros, that insurance rates
are user-provided, and the UF source. Spanish, low-hype, no absolute
promises. Do not touch routes/slugs/titles, the `<h2>`/`PrimaryCTA`, or the
worked-example figures (the `:159+` anti-drift test pins them).

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
