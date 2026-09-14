# Plan 107: Unify calculator client helpers (scenario adapter, CL parser, glossary regex)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dcd381d9..HEAD -- src/utils/calculatorScenarioSave.ts src/pages/calculadoras/credito-consumo.astro src/pages/calculadoras/deposito-a-plazo.astro src/pages/calculadoras/dividendo-hipotecario.astro src/pages/calculadoras/interes-compuesto.astro src/pages/calculadoras/simulador-jubilacion.astro src/pages/calculadoras/tarjeta-credito.astro src/utils/sueldo-liquido/formController.ts src/scripts/calculator-prefill.ts src/pages/calculadoras/operacion-renta.astro src/pages/calculadoras/conversor-utm.astro src/pages/calculadoras/iva.astro src/utils/formatCLP.ts src/utils/injectGlossaryLinks.ts tests/unit/injectGlossaryLinks.test.ts tests/integration/calculator-prefill.test.ts tests/unit/calculator-controllers-scenario-io.test.ts`
> On mismatch with "Current state", STOP. (Reconciled from the original
> broad paths: `src/pages/calculadoras/` + `tests/` moved under plans
> 102/104/108 and unrelated suites since planning — all assessed below.)

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/archive/108-scenario-save-extraction.md (DONE 2026-09-14, merge `6b512348` — extract the save-snapshot helper first; this plan reuses it for the adapter. Note the helper's `getLastResult` option: accepted-but-unread by the shared body (save semantics belong to 089); use it when `makeStandardScenarioAdapter` needs the result getter.)
- **Category**: tech-debt
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `dcd381d9`, 2026-09-14 — post-102/104/108 drift
  assessed file-by-file; Step 1 RESCOPED (see inline) because plan 108
  already unified the adapters under a different name; Steps 2–3 excerpts
  re-read against live code, both findings intact
- **Issue**: —

## Why this matters

Three copy-paste clusters force every locale/bug fix to be hand-edited in
N places. Seven calculator pages carried near-identical scenario-panel
adapter blocks — plan 108 (DONE 2026-09-14, merge `6b512348`) already
unified them as `createScenarioSaveAdapter` in
`src/utils/calculatorScenarioSave.ts`, so Step 1 below is verify-and-pin
only (no second wrapper). Four sites re-implement Chilean-number parsing
(`.` thousands, `,` decimal) with divergent edge behavior; the glossary
injector rebuilds one regex per text node (`O(nodes × terms)` compilations
per page × ~327 pages). One shared helper each collapses the remaining two
clusters with no behavior change on healthy inputs. CLP formatting itself
is explicitly excluded — plan 080 already unified it (archived 2026-08-11);
do not re-touch `formatCLP` call sites here.

## Current state

Files and roles:

- Scenario adapters (UNIFIED by 108 — Step 1 is verify-only):
  `src/utils/calculatorScenarioSave.ts` exports `createScenarioSaveAdapter`;
  all seven call sites (six pages + `formController.ts`) call it; zero
  remaining `restoreInputs(scenarioFormCard` call sites (verified by grep
  over `src/pages/calculadoras/*.astro` + `formController.ts`). Do NOT add
  a `makeStandardScenarioAdapter` wrapper — it would be pure indirection
  over the landed helper.
- Parsers (verified live): `src/scripts/calculator-prefill.ts:30-40`
  (two-replace idiom; native-number path `:42-55` preserved by 088),
  `src/utils/sueldo-liquido/formController.ts` TWO text sites (both
  `.replace(/\./g, "").replace(",", ".")` — note the second replace is a
  STRING `","`, i.e. first-comma-only, unlike prefill's global `/,/g`;
  the unified helper standardizes on global handling — healthy inputs
  identical, multi-comma garbage → `undefined` either way; document it),
  `src/pages/calculadoras/operacion-renta.astro:525-535` (DISTINCT
  conditional-strip + `parseFloat(...) || 0` semantics — NOT the two-replace
  idiom, EXCLUDED by the plan's own rule below),
  `conversor-utm.astro:424-427` + `iva.astro:312-315` digit-only (`/\D/g` →
  `NaN` on empty — distinct, excluded)
- Glossary (verified live): `src/utils/injectGlossaryLinks.ts` —
  `injectIntoText` rebuilds `GLOSSARY_ALLOWLIST.filter` + `new RegExp` per
  call; `MAX_AUTO_LINKS` gate; 19-test corpus in
  `tests/unit/injectGlossaryLinks.test.ts` (the byte-identical proof lives
  here)
- Canonical format: `src/utils/formatCLP.ts:2` (hands off — plan 080 done;
  file untouched since planning)

Excerpts as of `dcd381d9` (re-read; Step-1 target state already holds via 108, Steps 2–3 findings intact):

```html
<!-- deposito-a-plazo.astro:589-610 (POST-089 shape) -->
const scenarioFormCard = document.getElementById("calculator-form-card");
if (scenarioFormCard) {
  initScenarioPanel({
    calculatorId: window.location.pathname,
    readInputs: () => (scenarioLastInputs ? { ...scenarioLastInputs } : null),
    applyInputs: inputs => {
      restoreInputs(scenarioFormCard, inputs);
      (document.getElementById("calcBtn") as HTMLButtonElement | null)?.click();
    },
```

```ts
// calculator-prefill.ts:30-40 (text-field path; native-number path at :42-55 preserved by 088)
function toStoredValue(raw: string, field: UserProfileField): ... {
  if (raw === "") return undefined;
  if (NUMERIC_FIELDS.has(field)) {
    const parsed = Number(raw.replace(/\./g, "").replace(/,/g, "."));
```

```ts
// formatCLP.ts:2 — DO NOT TOUCH (080 owns it)
export function formatCLP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}
```

```ts
// injectGlossaryLinks.ts:95-101 — per-call rebuild
GLOSSARY_ALLOWLIST.filter + new RegExp(pattern,"gi") // rebuilt per injectIntoText call
```

Conventions: pages are Astro with inline client `<script>`; shared logic
lives in `src/utils/`; `formatCLP` is the canonical currency formatter;
`initScenarioPanel`/`snapshotInputs`/`restoreInputs` contracts from plan 089
must be preserved; conventional commits.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/unit/calculator-controllers-scenario-io.test.ts tests/integration/calculator-prefill.test.ts tests/unit/ tests/integration/homepage-content.test.ts` | declared | all pass |
| Typecheck | `pnpm run astro check` | declared | exit 0 |
| Lint (scoped) | `pnpm exec eslint src/utils/calculatorScenariosUI.ts src/scripts/calculator-prefill.ts src/utils/sueldo-liquido/formController.ts src/utils/injectGlossaryLinks.ts src/pages/calculadoras/` | declared | exit 0 |

## Scope

**In scope**:

- Step-1 pin test only (no source change — the unification already landed
  via 108)
- New `parseCLNumber(raw): number | undefined` helper (location: next to `formatCLP`, e.g. `src/utils/formatCLP.ts` or `src/utils/parseCLNumber.ts` — one file only) + 3 text-parser adoptions (prefill text path, 2 formController text paths; operacion-renta + UTM/IVA digit-only sites documented untouched — no semantic merge)
- `src/utils/injectGlossaryLinks.ts` (hoist one compiled `RegExp` + `Map` per page; byte-identical output)
- Tests for the pin + parser + glossary

**Out of scope**:

- Anything `formatCLP`/currency-display (080 DONE — grep must stay clean of
  new `Intl.NumberFormat("es-CL")` instances; reuse, don't reformat).
- Scenario save/snapshot semantics (089 owns; 108 extracts — reuse its helper).
- Native `type="number"` handling (088 owns — `readScalarField`/`valueAsNumber`
  path stays first; the new parser is text-fields-only).
- Page splits, `CalculatorShell` refactor, titles/routes/slugs (freeze).

## Git workflow

- Branch: `advisor/107-calculator-client-helpers`
- Commits: one per helper (adapter, parser, glossary), e.g. `refactor(calculators): share scenario adapter across seven pages`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + focused tests + `astro check` unmodified. Record. `declared`
failure on clean tree → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Scenario adapter — VERIFY ONLY (unified by 108, do not re-wrap)

Plan 108 landed the unification this step wanted, as
`createScenarioSaveAdapter` in `src/utils/calculatorScenarioSave.ts` (NOT
`makeStandardScenarioAdapter` in `calculatorScenariosUI.ts`). Do NOT create
a second wrapper — pure indirection churn. Instead: (a) verify all seven
call sites still call the single helper (`grep -c
"restoreInputs(scenarioFormCard" src/pages/calculadoras/*.astro
src/utils/sueldo-liquido/formController.ts` → all zeros) and `buildSummary`
stayed per-page; (b) pin it with a static test (new or in the 108 suite)
asserting exactly the seven known call sites import
`createScenarioSaveAdapter` and no page calls `restoreInputs` directly, so
the cluster cannot re-fork silently.

**Verify**: grep all-zeros; new pin test passes.

### Step 2: Shared Chilean parser (text paths only)

Add `parseCLNumber`: strips `.` thousands, `,`→`.`, trims, `""`→`undefined`,
non-finite→`undefined`. Adopt at the THREE true two-replace sites
(`calculator-prefill.ts` text path, the TWO `formController.ts` text sites —
note their second replace is string-`","` first-comma-only; the helper uses
global handling, identical on healthy inputs, `undefined` on multi-comma
garbage either way — document this per site). EXCLUDED (document, don't
merge semantics): `operacion-renta.astro:525-535` (conditional-strip +
`|| 0` — distinct semantics), the native-number `valueAsNumber` branches
(088 owns), and the UTM/IVA digit-only (`/\D/g`) sites.

**Verify**: prefill roundtrip tests pass; add parser unit tests (thousands,
decimal-comma, empty, garbage, `1.500.000` → `1500000`).

### Step 3: Hoisted glossary regex (byte-identical)

Build one `RegExp` + `Map<lowerTerm, entry>` per page, pass into
`injectIntoText`; keep `MAX_AUTO_LINKS=5` semantics. Prove byte-identical
output on the existing glossary test corpus before/after (add a golden test
if none pins it).

**Verify**: glossary-related tests pass; timing note (not a gate) in the commit.

## Test plan

- Adapter: existing `calculator-controllers-scenario-io` suite stays green
  + anti-refork pin test (seven call sites, one helper import, no direct
  `restoreInputs`).
- Parser: unit matrix (above) modeled on prefill roundtrip tests.
- Glossary: golden output test pre/post hoist.
- Verification: focused-tests command → all pass.

## Done criteria

- [ ] Adapter unification verified as landed (grep all-zeros) + anti-refork pin test (no new wrapper)
- [ ] 3 text-parser sites share `parseCLNumber` (operacion-renta documented untouched); native/digit-only paths documented untouched
- [ ] Glossary output byte-identical with hoisted regex (test-pinned)
- [ ] No new `Intl.NumberFormat("es-CL")` instances (080 boundary respected)
- [ ] Focused tests + `astro check` + scoped lint green; diff in-scope only; `plans/README.md` updated

## STOP conditions

- Drift (especially POST-089 adapter shape change — compare live blocks to
  the excerpt before replacing); double verification failure; a site needs
  semantic (not mechanical) parser change (STOP — different plan);
  byte-identical glossary proof fails (STOP — keep old code); `declared`
  baseline broken.

## Maintenance notes

- New calculators must use all three helpers from day one — link them in the
  calculator authoring checklist if one exists.
- Reviewer: check digit-only sites were deliberately excluded from the
  comma-decimal path.
- **Deferred:** `sueldo-liquido/formController.ts` god-module split (M/MED —
  needs seam design around shared mutable state); `src/utils/` folder
  regrouping (M — import churn); error-handling idiom consolidation (needs
  loud-logging decision per surface).
