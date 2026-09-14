# Plan 107: Unify calculator client helpers (scenario adapter, CL parser, glossary regex)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- src/pages/calculadoras/ src/utils/sueldo-liquido/formController.ts src/scripts/calculator-prefill.ts src/utils/formatCLP.ts src/utils/injectGlossaryLinks.ts tests/`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/archive/108-scenario-save-extraction.md (DONE 2026-09-14, merge `6b512348` — extract the save-snapshot helper first; this plan reuses it for the adapter. Note the helper's `getLastResult` option: accepted-but-unread by the shared body (save semantics belong to 089); use it when `makeStandardScenarioAdapter` needs the result getter.)
- **Category**: tech-debt
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

Three copy-paste clusters force every locale/bug fix to be hand-edited in
N places. Seven calculator pages carry near-identical scenario-panel adapter
blocks; four sites re-implement Chilean-number parsing (`.` thousands, `,`
decimal) with divergent edge behavior; the glossary injector rebuilds one
regex per text node (`O(nodes × terms)` compilations per page × ~327 pages).
One shared helper each collapses the clusters with no behavior change on
healthy inputs. CLP formatting itself is explicitly excluded — plan 080
already unified it (archived 2026-08-11); do not re-touch `formatCLP`
call sites here.

## Current state

Files and roles:

- Scenario adapters (POST-089 shape): `src/pages/calculadoras/deposito-a-plazo.astro:589-610`,
  plus `credito-consumo`, `dividendo-hipotecario`, `interes-compuesto`,
  `simulador-jubilacion`, `tarjeta-credito`, `src/utils/sueldo-liquido/formController.ts:707-715`
- Parsers: `src/scripts/calculator-prefill.ts:30-55`,
  `src/utils/sueldo-liquido/formController.ts:634,646`,
  `src/pages/calculadoras/operacion-renta.astro:531-535`,
  `conversor-utm.astro:417`, `iva.astro:306`
- Glossary: `src/utils/injectGlossaryLinks.ts:80,95-113` (`MAX_AUTO_LINKS=5`)
- Canonical format: `src/utils/formatCLP.ts:2` (hands off — plan 080 done)

Excerpts as of `0e506a8b` (verified by reading):

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

- `src/utils/calculatorScenariosUI.ts` (new `makeStandardScenarioAdapter` next to `snapshotInputs`/`restoreInputs`)
- 7 adapter call sites (one-line replacements, behavior-identical)
- New `parseCLNumber(raw): number | undefined` helper (location: next to `formatCLP`, e.g. `src/utils/formatCLP.ts` or `src/utils/parseCLNumber.ts` — one file only) + 4 text-parser adoptions (prefill text path, formController text paths, operacion-renta, UTM/IVA digit-only sites keep digit-only semantics — document, don't merge semantics)
- `src/utils/injectGlossaryLinks.ts` (hoist one compiled `RegExp` + `Map` per page; byte-identical output)
- Tests for all three helpers

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

### Step 1: Shared scenario adapter (uses plan 108's helper)

Add `makeStandardScenarioAdapter(getLastInputs, formCard, calcBtnId)` next to
`snapshotInputs`/`restoreInputs`, built on the extracted save-snapshot helper
from plan 108. Replace each 7-line adapter block with one call. Byte-identical
behavior: same `calculatorId` (`window.location.pathname`), same null-when-empty
read, same restore+click apply.

**Verify**: scenario-IO tests + prefill integration pass; `grep -c "restoreInputs(scenarioFormCard" src/pages/calculadoras/*.astro` drops to ≤1 (inside the helper).

### Step 2: Shared Chilean parser (text paths only)

Add `parseCLNumber`: strips `.` thousands, `,`→`.`, trims, `""`→`undefined`,
non-finite→`undefined`. Adopt in the 4 text sites; leave the native-number
`valueAsNumber` branches and the UTM/IVA digit-only (`/\D/g`) semantics
intact (call the helper only where the two-replace idiom already exists —
document each site's choice in a comment).

**Verify**: prefill roundtrip tests pass; add parser unit tests (thousands,
decimal-comma, empty, garbage, `1.500.000` → `1500000`).

### Step 3: Hoisted glossary regex (byte-identical)

Build one `RegExp` + `Map<lowerTerm, entry>` per page, pass into
`injectIntoText`; keep `MAX_AUTO_LINKS=5` semantics. Prove byte-identical
output on the existing glossary test corpus before/after (add a golden test
if none pins it).

**Verify**: glossary-related tests pass; timing note (not a gate) in the commit.

## Test plan

- Adapter: existing `calculator-controllers-scenario-io` suite + one
  per-page wiring test (panel initializes with the shared adapter).
- Parser: unit matrix (above) modeled on prefill roundtrip tests.
- Glossary: golden output test pre/post hoist.
- Verification: focused-tests command → all pass.

## Done criteria

- [ ] 7 adapter blocks replaced by one helper (grep-clean per Step 1)
- [ ] 4 text-parser sites share `parseCLNumber`; native/digit-only paths documented untouched
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
