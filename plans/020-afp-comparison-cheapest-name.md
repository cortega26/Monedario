# Plan 020: Corregir nombre de AFP cableado ("AFP Uno") en la nota de comparación

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 57ad5261..HEAD -- src/utils/sueldo-liquido/afpComparison.ts`
> If the file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as
> a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `57ad5261`, 2026-06-15

## Why this matters

The "sueldo líquido" calculator has an inverse mode ("¿Qué bruto necesitarías
con cada AFP?") that compares the 7 Chilean AFPs and shows a closing note
telling the user how much less gross salary the **cheapest** AFP requires. The
cheapest AFP is computed dynamically (the list is sorted by required gross), but
the note text **hardcodes the literal string "AFP Uno"**. Today AFP Uno happens
to have the lowest commission, so the text is accidentally correct — but AFP
commissions in Chile re-bid periodically (the repo even ships a
`check:afp-commissions` gate because they change), and the commission values
live in editable config (`src/config/afpCommissions.ts`). The moment another AFP
becomes cheapest, the calculator will display a confidently wrong statement on a
YMYL (money) page, with no test or type error to catch it. The fix is to print
the name of the AFP the code actually computed as cheapest.

## Current state

- `src/utils/sueldo-liquido/afpComparison.ts` — client-side DOM module for the
  sueldo-liquido calculator. It exports two functions; the relevant one is the
  inverse-mode renderer (the second function in the file, around lines 154–256).
  It runs in the browser and manipulates the DOM directly (no framework). There
  is **no unit-test harness** for this module (the existing AFP tests cover
  config and the use-case, not this DOM renderer), so verification is by
  typecheck + grep, not a new unit test.

The comparisons are sorted ascending by required gross, so `comparisons[0]` is
the cheapest (`afpComparison.ts`, around lines 193–201):

```ts
    // Lower gross needed = better: sort ascending
    comparisons.sort((a, b) => a.gross - b.gross);

    const currentGross =
      comparisons.find(c => Math.abs(c.rate - currentAfpRate) < 0.01)?.gross ??
      comparisons[0].gross;
    const bestGross = comparisons[0].gross;
    const worstGross = comparisons[comparisons.length - 1].gross;
    const maxDiff = worstGross - bestGross;
```

The buggy note (`afpComparison.ts`, around lines 251–256):

```ts
    if (maxDiff > 500) {
      const note = document.createElement("p");
      note.className = "mt-3 text-xs text-muted";
      note.textContent = `Con AFP Uno necesitarías ${formatCLP(maxDiff)} menos de bruto que con la AFP más cara para recibir el mismo líquido.`;
      container.appendChild(note);
    }
```

Each entry in `comparisons` has the shape `{ name, rate, gross }` (built around
line 181–192: `afpOptions.map(({ name, rate }) => { ... return { name, rate, gross } })`),
so `comparisons[0].name` is the cheapest AFP's display name.

The codebase writes in **español neutral** (no voseo) — match the existing copy
style; "necesitarías" (tú) is the established tone in this file, keep it.

## Commands you will need

| Purpose   | Command                                              | Expected on success |
|-----------|------------------------------------------------------|---------------------|
| Typecheck | `pnpm exec astro check`                              | 0 errors, 0 warnings |
| Lint      | `pnpm run lint`                                      | exit 0              |
| Format    | `pnpm run format:check`                              | exit 0              |
| Tests     | `pnpm test`                                          | all pass (baseline 721) |
| Grep gone | `grep -n "AFP Uno" src/utils/sueldo-liquido/afpComparison.ts` | no matches (exit 1) |

## Scope

**In scope** (the only file you should modify):
- `src/utils/sueldo-liquido/afpComparison.ts`

**Out of scope** (do NOT touch):
- `src/config/afpCommissions.ts` — the commission data is correct; do not change
  it. The whole point is that the text must follow the data, not the reverse.
- The first (bruto→líquido) renderer function and its headings — only the
  inverse-mode closing note has the hardcoded name.
- Any AFP display name strings — use whatever `name` the config provides.

## Git workflow

- Branch: `advisor/020-afp-comparison-cheapest-name`
- Single commit; conventional-commit style (see `git log`): e.g.
  `fix: usar AFP más barata calculada en nota de comparación (Plan 020)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Capture the cheapest AFP name and use it in the note

In `src/utils/sueldo-liquido/afpComparison.ts`, the inverse-mode function already
computes `bestGross = comparisons[0].gross`. Add a sibling that captures the
cheapest AFP's name near that block, e.g. right after the sort:

```ts
    const cheapestAfpName = comparisons[0].name;
```

Then replace the hardcoded note text so it interpolates that name:

```ts
      note.textContent = `Con ${cheapestAfpName} necesitarías ${formatCLP(maxDiff)} menos de bruto que con la AFP más cara para recibir el mismo líquido.`;
```

Do not change any other behavior, class names, or the `maxDiff > 500` guard.

**Verify**: `grep -n "AFP Uno" src/utils/sueldo-liquido/afpComparison.ts` → no
matches; `grep -n "cheapestAfpName" src/utils/sueldo-liquido/afpComparison.ts` →
two matches (declaration + use).

### Step 2: Typecheck, lint, format, and run the suite

**Verify**:
- `pnpm exec astro check` → 0 errors
- `pnpm run lint` → exit 0
- `pnpm run format:check` → exit 0 (if it flags this file, run `pnpm run format` and re-check)
- `pnpm test` → all pass

## Test plan

This module is browser DOM code with no existing unit-test harness, so no new
unit test is added (introducing a jsdom harness for one string is out of scope
and out of proportion). Regression protection is the grep gate in "Done
criteria": the literal `"AFP Uno"` must not reappear. If you believe a test is
warranted, STOP and report rather than scaffolding a new test infrastructure.

## Done criteria

ALL must hold:

- [ ] `grep -n "AFP Uno" src/utils/sueldo-liquido/afpComparison.ts` returns no matches (exit 1). NOTE: a repo-wide `grep -rn "AFP Uno" src/` WILL still find legitimate matches (editorial blog prose, `comisiones-afp.astro` FAQ/comment, `sueldo-liquido.astro` prose, config JSON labels) — those are factual references where AFP Uno is the currently-cheapest AFP, NOT this dynamic-comparison bug. Do not touch them. Only the in-scope file must be free of the literal.
- [ ] The note uses `comparisons[0].name` (captured as `cheapestAfpName`)
- [ ] `pnpm exec astro check` exits 0
- [ ] `pnpm run lint` exits 0 and `pnpm run format:check` exits 0
- [ ] `pnpm test` exits 0 (no regressions; baseline 721 pass)
- [ ] Only `src/utils/sueldo-liquido/afpComparison.ts` is modified (`git status`)
- [ ] `plans/README.md` status row for 020 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The "Current state" excerpts don't match the live file (drift).
- The `comparisons` array does not actually carry a `name` field, or it is not
  sorted ascending by `gross` before the note is built (the assumption "the
  cheapest AFP is `comparisons[0]`" is false).
- `grep -n "AFP Uno" src/utils/sueldo-liquido/afpComparison.ts` finds the literal
  in MORE than one place inside THIS file — there may be a second dynamic-comparison
  hardcode that needs the same treatment; report all locations. (Matches in OTHER
  src/ files — blog prose, `comisiones-afp.astro`, `sueldo-liquido.astro`, config
  JSON — are intentional editorial/config references and are out of scope; ignore
  them.)
- Any verification command fails twice after a reasonable fix attempt.

## Maintenance notes

- For the reviewer: confirm the note now reads from `comparisons[0].name` and
  that the ascending sort still precedes the note. If the sort direction is ever
  changed to descending, `comparisons[0]` would become the *worst* AFP and this
  note (and the per-row diff coloring) would invert — revisit together.
- Follow-up deliberately deferred: there is no DOM-level test for this renderer.
  If a jsdom/Playwright harness for the sueldo-liquido client modules is ever
  added, add a case asserting the note names the computed-cheapest AFP.
