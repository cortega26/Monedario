# Plan 108: Extract the scenario-save snapshot helper under test

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- src/pages/calculadoras/ src/utils/sueldo-liquido/formController.ts src/utils/calculatorScenariosUI.ts vitest.config.ts tests/accessibility/calculator-scenario-consistency.test.ts package.json .github/workflows/ci.yml`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (plan 107 depends on THIS plan — run first among the calculator pair)
- **Category**: tests
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

Commit `44da116a` (plan 089 follow-through) saves the last completed snapshot
with its inputs in six calculator pages plus `formController.ts` — but all
six pages are `src/pages/**` (coverage-excluded) and the only verifier is
`tests/accessibility/calculator-scenario-consistency.test.ts`, which lives
under `tests/accessibility/**` (vitest-excluded) and runs in a Playwright
lane that is `continue-on-error` in CI and absent from `check:ci`. A
scenario-save regression in any touched calculator passes `test`,
`test:coverage`, `check:ci`, and merge gates. Extracting the adapter into an
importable helper with happy-dom unit tests puts the 089 invariant
(entries + result from the same calculation) under the blocking gate while
keeping the Playwright test as integration.

## Current state

Files and roles:

- `44da116a` touched: `src/pages/calculadoras/credito-consumo.astro`,
  `deposito-a-plazo.astro` (`:589-610`), `dividendo-hipotecario.astro`,
  `interes-compuesto.astro`, `simulador-jubilacion.astro`,
  `tarjeta-credito.astro`, `src/utils/sueldo-liquido/formController.ts`
- `src/utils/calculatorScenariosUI.ts:318` — `initScenarioPanel` flow
- `vitest.config.ts:15,29` — excludes `tests/accessibility/**` and `src/pages/**`
- `tests/accessibility/calculator-scenario-consistency.test.ts:178-328` — only verifier (needs `astro preview :4321`)
- `package.json:34` (`check:ci`) — runs `test:coverage`, never `test:a11y`
- `ci.yml:338-344` — `a11y-audit` is `continue-on-error: true`

Excerpt as of `0e506a8b` (verified by reading `deposito-a-plazo.astro:589-610`):

```html
const scenarioFormCard = document.getElementById("calculator-form-card");
if (scenarioFormCard) {
  initScenarioPanel({
    calculatorId: window.location.pathname,
    readInputs: () => (scenarioLastInputs ? { ...scenarioLastInputs } : null),
    applyInputs: inputs => {
      restoreInputs(scenarioFormCard, inputs);
      (document.getElementById("calcBtn") as HTMLButtonElement | null)?.click();
    },
    buildSummary: () => {
      if (!scenarioLastInputs || !scenarioLastResult) return null;
      ...
```

(`scenarioLastInputs`/`scenarioLastResult` are the 089 same-calculation pair;
`snapshotInputs`/`restoreInputs` inverse-ness is already covered by
`tests/unit/calculator-controllers-scenario-io.test.ts:19-74` — temporal
coherence is what is missing under the gate.)

Conventions: pages stay thin; logic in `src/utils/`; happy-dom for DOM unit
tests (see `tests/integration/calculator-prefill.test.ts` pattern);
`calculatorId: window.location.pathname` identity; conventional commits.
Freeze: no route/slug/title/content change.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/unit/calculator-controllers-scenario-io.test.ts tests/integration/calculator-prefill.test.ts` | declared | all pass |
| Full unit tests | `pnpm run test` | declared | all pass |
| Typecheck | `pnpm run astro check` | declared | exit 0 |
| Lint (scoped) | `pnpm exec eslint src/utils/calculatorScenariosUI.ts src/pages/calculadoras/ src/utils/sueldo-liquido/formController.ts` | declared | exit 0 |

## Scope

**In scope**:

- New `src/utils/calculatorScenarioSave.ts` (or equivalent single home —
  one file; exact name in the first commit, documented in README row)
- Six page scripts + `formController.ts` (thin-caller rewiring only,
  behavior-identical)
- New `tests/unit/calculator-scenario-save.test.ts` (happy-dom)
- (Optional, same plan) make the consistency Playwright test blocking OR
  document why it stays non-blocking — one line in the README row either way

**Out of scope**:

- Changing save/snapshot semantics (089 owns — calculate→edit→save,
  invalid-attempt, restore→recalculate cases already defined there).
- Adapter dedup across pages (plan 107, runs after this one).
- Sueldo money-path characterization (L — needs SII review; separate future).
- Coverage-threshold or CI `continue-on-error` policy changes beyond the one
  documented line (needs ADR if blocking is chosen — prefer the unit-helper
  route, keep policy untouched).

## Git workflow

- Branch: `advisor/108-scenario-save-extraction`
- Commits: extract helper → rewire callers → tests (e.g.
  `refactor(calculators): extract scenario-save snapshot helper`,
  `test(calculators): pin same-calculation save under gate`)
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + focused + full unit tests + `astro check` unmodified. Record.
`declared` failure on clean tree → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Extract the helper (no behavior change)

Create the helper exporting `createScenarioSaveAdapter({ getLastInputs,
getLastResult, formCard, calcBtnId })` returning the
`{calculatorId, readInputs, applyInputs, buildSummary}` shape (keep
`buildSummary` per-page — it differs in labels; only the snapshot-pair
handling is shared). Rewire all six pages + `formController.ts` as thin
callers. Pages must shrink, not grow.

**Verify**: `astro check` exit 0; `git diff --stat` shows +1 util file and
deletions in each page script.

### Step 2: Pin the 089 invariant under the gate

Happy-dom tests for: calculate→edit→save persists the *calculating*
inputs+result pair (not the edited inputs with the old result);
invalid-later-attempt does not corrupt the saved snapshot;
restore→recalculate reproduces the saved result. Model structure on
`tests/unit/calculator-controllers-scenario-io.test.ts`, DOM harness on
`tests/integration/calculator-prefill.test.ts`.

**Verify**: focused tests + full `pnpm run test` → all pass with ≥3 new tests.

## Test plan

- New `tests/unit/calculator-scenario-save.test.ts` (happy-dom): the three
  temporal-coherence cases above.
- Existing scenario-IO + prefill suites stay green (no semantic drift).
- Playwright consistency suite left as integration (optionally document its
  non-blocking status; do not rewire CI here).
- Verification: full `pnpm run test` → all pass.

## Done criteria

- [ ] Helper exists; six pages + controller call it (page scripts net-negative lines)
- [ ] ≥3 new happy-dom tests pin calculate→edit→save / invalid / restore→recalculate
- [ ] Full `pnpm run test` + `astro check` + scoped lint green
- [ ] No semantic, route, title, or copy change; diff in-scope only; `plans/README.md` updated

## STOP conditions

- Drift (adapter shape differs from excerpt — 089 follow-ups may have moved
  it; compare live before extracting); double verification failure;
  extraction requires changing save semantics (STOP — semantics belong to
  089); happy-dom cannot host the adapter without page-specific globals
  (STOP — document which global blocks and keep Playwright-only, do not mock
  the world); `declared` baseline broken.

## Maintenance notes

- Plan 107 builds `makeStandardScenarioAdapter` on top of this helper — keep
  the helper's signature stable.
- Reviewer: check `buildSummary` stayed per-page (labels differ) and only the
  pair-handling is shared.
- **Deferred:** full sueldo-líquido characterization (L) — needs expected
  values reviewed against SII/tabla before freezing; do not gold-plate here.
- **Deferred:** making the Playwright suite blocking (needs ADR + preview
  infrastructure decision).
