# Plan 042: Eliminar el evento typo `calculator_completed` de las 8 calculadoras y de los tests que lo fijan

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 9d4df3aa..HEAD -- src/utils/sueldo-liquido/formController.ts src/pages/calculadoras/tarjeta-credito.astro src/pages/calculadoras/operacion-renta.astro src/pages/calculadoras/deposito-a-plazo.astro src/pages/calculadoras/apv.astro src/pages/calculadoras/finiquito-indemnizacion.astro src/pages/calculadoras/credito-consumo.astro src/pages/calculadoras/interes-compuesto.astro tests/integration/homepage-content.test.ts`
> If any changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (independent of plan 039's dedup fix, which already landed separately)
- **Category**: tech-debt
- **Planned at**: commit `9d4df3aa`, 2026-07-10

## Why this matters

Plan 039 fixed the calculator funnel's two live metrics bugs (missing views,
over-counted completes) but hit a scope boundary on a third, purely cosmetic
defect: a typo'd event name `calculator_completed` (past tense) is emitted
alongside every real `calculator_complete` across **8 files** — 7 calculator
`.astro` pages plus `src/utils/sueldo-liquido/formController.ts`. The typo is
**not** in `EVENT_ALLOWLIST` (verified in `src/utils/analytics.ts` and
`workers/analytics-collector/src/index.ts`), so `sanitizeAnalyticsEvent`
returns `null` and the event is silently dropped before it ever reaches the
Worker or the weekly export — it has **zero effect on any metric today**. This
plan is pure cleanup: fewer dead network calls per completion, and one less
event name for a future reader to wonder about. It carries no urgency and no
risk to real data.

The reason plan 039 could not simply delete these calls: **two existing tests
in `tests/integration/homepage-content.test.ts` assert the typo's presence**
as if it were required behavior (they were written when the typo first
shipped and nobody caught it as a bug). Removing the emissions without
updating those tests breaks `pnpm test`. This plan removes both the dead
emissions and the tests that wrongly pin them.

## Current state

**The emission sites — 10 call pairs across 8 files, all with the identical
shape** (`trackAnalyticsEvent("calculator_complete", {...})` immediately
followed by `trackAnalyticsEvent("calculator_completed", { calculator_slug:
"<slug>" })`):

- `src/utils/sueldo-liquido/formController.ts:297-305` and `:410-418` (two
  branches, `liquido-a-bruto` and `bruto-a-liquido` modes):
  ```ts
      trackAnalyticsEvent("calculator_complete", {
        calculator_slug: "sueldo-liquido",
        calculator_name: "Calculadora de Sueldo Liquido",
        outcome: "success",
        mode: "liquido-a-bruto", // or "bruto-a-liquido" in the second occurrence
      });
      trackAnalyticsEvent("calculator_completed", {
        calculator_slug: "sueldo-liquido",
      });
  ```
- `src/pages/calculadoras/tarjeta-credito.astro:464-471`:
  ```ts
      trackAnalyticsEvent("calculator_complete", {
        calculator_slug: "tarjeta-credito",
        calculator_name: "Costo Real Tarjeta de Credito",
        outcome: "success",
      });
      trackAnalyticsEvent("calculator_completed", {
        calculator_slug: "tarjeta-credito",
      });
  ```
- `src/pages/calculadoras/operacion-renta.astro:788-795`: same shape,
  `calculator_slug: "operacion-renta"`.
- `src/pages/calculadoras/deposito-a-plazo.astro:567-574`: same shape,
  `calculator_slug: "deposito-a-plazo"`.
- `src/pages/calculadoras/apv.astro:987-994`: same shape,
  `calculator_slug: "apv"`.
- `src/pages/calculadoras/finiquito-indemnizacion.astro:621-629` (mode
  `vacaciones-proporcionales`) **and** `:808-816` (mode
  `finiquito-completo`) — two occurrences, same file.
- `src/pages/calculadoras/credito-consumo.astro:561-568`: same shape,
  `calculator_slug: "credito-consumo"`.
- `src/pages/calculadoras/interes-compuesto.astro:621-628`: same shape,
  `calculator_slug: "interes-compuesto"`.

**The tests that currently require the typo** —
`tests/integration/homepage-content.test.ts`, inside `describe("Wave 2
structural guards", ...)`, `calculatorPages` list at line 292 (6 slugs;
`deposito-a-plazo` and `interes-compuesto` are NOT in this list, so they have
no test coverage of the typo either way):

```ts
  const calculatorPages = [
    "sueldo-liquido",
    "finiquito-indemnizacion",
    "operacion-renta",
    "credito-consumo",
    "tarjeta-credito",
    "apv",
  ];
```

Two tests assert the typo (lines 361-381 and 383-399 respectively):

```ts
  it("all 6 calculator pages fire calculator_completed with only calculator_slug", () => {
    for (const slug of calculatorPages) {
      const source = readFileSync(
        `src/pages/calculadoras/${slug}.astro`,
        "utf8"
      );
      if (slug === "sueldo-liquido") {
        const moduleSource = readFileSync(
          "src/utils/sueldo-liquido/formController.ts",
          "utf8"
        );
        expect(source + moduleSource).toContain('"calculator_completed"');
        expect(source + moduleSource).toContain(
          `calculator_slug: "${slug}"`
        );
      } else {
        expect(source).toContain('"calculator_completed"');
        expect(source).toContain(`calculator_slug: "${slug}"`);
      }
    }
  });

  it("all 6 calculator pages still fire the original calculator_complete event", () => {
    for (const slug of calculatorPages) {
      const source = readFileSync(
        `src/pages/calculadoras/${slug}.astro`,
        "utf8"
      );
      if (slug === "sueldo-liquido") {
        const moduleSource = readFileSync(
          "src/utils/sueldo-liquido/formController.ts",
          "utf8"
        );
        expect(source + moduleSource).toContain('"calculator_complete"');
      } else {
        expect(source).toContain('"calculator_complete"');
      }
    }
  });
```

The **first** test (`"...fire calculator_completed with only
calculator_slug"`) exists solely to pin down the typo — it must be deleted,
not weakened, once the emission itself is gone (an assertion that a removed
string is absent is trivial and adds no value; the meaningful regression guard
is the second test, which stays as-is since `calculator_complete` — the real
event — must keep firing).

**Repo convention**: browser analytics event names live in
`src/utils/analytics.ts`'s `EVENT_ALLOWLIST`; calculator pages call
`trackAnalyticsEvent` directly (no per-page wrapper) — see any of the 8 files
above for the exact call shape to remove. Integration/structural tests for
calculator pages live in `tests/integration/homepage-content.test.ts` under
`describe("Wave 2 structural guards", ...)`.

## Commands you will need

| Purpose            | Command                                                   | Expected              |
|--------------------|-----------------------------------------------------------|-----------------------|
| Targeted tests     | `pnpm exec vitest run tests/integration/homepage-content.test.ts` | all pass, minus the deleted test |
| Full unit tests    | `pnpm test`                                               | exit 0                |
| Typecheck          | `astro check`                                             | 0 errors              |
| Lint (scoped)      | `pnpm exec eslint src/utils/sueldo-liquido/formController.ts src/pages/calculadoras/tarjeta-credito.astro src/pages/calculadoras/operacion-renta.astro src/pages/calculadoras/deposito-a-plazo.astro src/pages/calculadoras/apv.astro src/pages/calculadoras/finiquito-indemnizacion.astro src/pages/calculadoras/credito-consumo.astro src/pages/calculadoras/interes-compuesto.astro` | exit 0 |
| Format             | `pnpm run format:check`                                   | exit 0                |

## Scope

**In scope**:
- `src/utils/sueldo-liquido/formController.ts` (remove 2 `calculator_completed` calls)
- `src/pages/calculadoras/tarjeta-credito.astro` (remove 1)
- `src/pages/calculadoras/operacion-renta.astro` (remove 1)
- `src/pages/calculadoras/deposito-a-plazo.astro` (remove 1)
- `src/pages/calculadoras/apv.astro` (remove 1)
- `src/pages/calculadoras/finiquito-indemnizacion.astro` (remove 2)
- `src/pages/calculadoras/credito-consumo.astro` (remove 1)
- `src/pages/calculadoras/interes-compuesto.astro` (remove 1)
- `tests/integration/homepage-content.test.ts` (delete the test that pins the
  typo; leave everything else, including the sibling test that asserts
  `calculator_complete` still fires, untouched)

**Out of scope**:
- `src/utils/analytics.ts` / `EVENT_ALLOWLIST` — do not add `calculator_completed`
  to the allowlist; the goal is removal, not legitimizing the typo.
- `workers/analytics-collector/` — no server-side change; the event never
  reached the Worker.
- The real `calculator_complete` emissions — leave every one of them exactly as
  is, including their `mode`/`outcome`/`calculator_name` params.
- Plan 039's dedup logic in `src/scripts/analytics.ts` — already landed
  separately, not part of this plan.

## Git workflow

- Branch: `advisor/042-remove-calculator-completed-typo-event`
- Conventional commits, e.g. `fix(analytics): quitar evento typo calculator_completed`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove the 10 `calculator_completed` call sites across the 8 files

In each of the 8 in-scope source files, delete the
`trackAnalyticsEvent("calculator_completed", { calculator_slug: "<slug>" });`
block that immediately follows the real `calculator_complete` call. Do not
touch the `calculator_complete` call itself, any surrounding logic, or
blank-line style beyond removing the deleted lines.

`formController.ts` and `finiquito-indemnizacion.astro` each have **two** call
sites (see "Current state" for exact line numbers) — remove both in each file.

**Verify**: `grep -rn "calculator_completed" src/` → no matches.

### Step 2: Remove the test that pins the typo

In `tests/integration/homepage-content.test.ts`, delete the entire `it("all 6
calculator pages fire calculator_completed with only calculator_slug", ...)`
block (lines 361-381 in the current file — confirm by content, not just line
number, since Step 1 does not touch this file and line numbers here are
unaffected by it). Leave the `calculatorPages` array, the two neighboring
tests (`"...call showCalculatorNextActions..."` and `"...still fire the
original calculator_complete event"`), and everything else in the file
untouched.

**Verify**: `grep -n "calculator_completed" tests/integration/homepage-content.test.ts` → no matches.

## Test plan

- No new tests are added — this plan removes dead code and an assertion that
  wrongly required it. The regression guard that matters (`calculator_complete`
  must keep firing) already exists in the sibling test at line 383 and is left
  untouched.
- Verification: `pnpm test` → exit 0, with one fewer test than before (the
  deleted one), and no failures.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "calculator_completed" src/` → no matches.
- [ ] `grep -n "calculator_completed" tests/integration/homepage-content.test.ts` → no matches.
- [ ] `grep -c '"calculator_complete"' src/utils/sueldo-liquido/formController.ts` → `2` (both real calls still present).
- [ ] `pnpm test` exits 0.
- [ ] `astro check` → 0 errors; scoped eslint exits 0; `pnpm run format:check` exits 0.
- [ ] `git status` shows only the 8 source files + the 1 test file modified.
- [ ] `plans/README.md` status row for 042 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- Any of the 8 files' `calculator_completed` call sites don't match the
  "Current state" excerpts (params differ, or the call appears in a shape not
  described here).
- The test file's structure around the two `calculator_completed`-related
  `it()` blocks has changed (e.g. merged into one test, or `calculatorPages`
  no longer lists exactly these 6 slugs) — compare before deleting.
- Deleting the test causes an unexpected drop in overall test count beyond
  the one test removed (would indicate the delete touched more than intended).
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- This closes the last open item from plan 039's funnel-instrumentation audit.
  After this lands, `calculator_completed` should not appear anywhere in the
  codebase; if it resurfaces in a future PR, it is very likely a copy-paste of
  the old pattern and should be rejected in review.
- If a genuine need for a "completed" signal distinct from `calculator_complete`
  ever arises (e.g. to distinguish first-completion from recalculation), add a
  new, deliberately-named event through `EVENT_ALLOWLIST` rather than reviving
  this one — see plan 039's maintenance notes for the same guidance on
  `calculator_recalculate`.
