# Plan 032: Calculadoras accesibles — gestión de foco, asociación de hints/errores y foco visible en radios

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` (and follow the repo's atomic-close/archive policy in
> that README) — unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat a7bb8b2e..HEAD -- src/components/calculator/CalculatorField.astro src/components/calculator/CalculatorRadioGroup.astro src/pages/calculadoras/sueldo-liquido.astro src/utils/sueldo-liquido/formController.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: tests / a11y (correctness of accessible semantics)
- **Planned at**: commit `a7bb8b2e`, 2026-06-26

## Why this matters

The calculators are the product's core surface, and their **accessibility
semantics** (focus management, label/error association, visible keyboard focus)
were never audited by the three prior `/improve` passes — those only ran the
automated axe/Playwright sweep, which structurally cannot detect missing focus
management or unassociated hints. Four concrete WCAG 2.2 AA gaps live in
**shared leaf components**, so fixing them once repairs many calculator pages at
once:

1. After computing on `sueldo-liquido` (the highest-traffic calculator), focus
   is never moved to the result. `focusResultado()` targets `#resultado-heading`,
   but that id only exists on the two calculators that pass `headingId` to
   `CalculatorResultPanel`; `sueldo-liquido` doesn't, so the call is a silent
   no-op. Keyboard/screen-reader users get no cue that a result appeared
   (WCAG 2.4.3 / 4.1.3).
2. `CalculatorField` renders hint text that is **not** linked to its input via
   `aria-describedby`, so the guidance is visual-only on every field that has a
   hint, across 16 calculator pages (WCAG 1.3.1 / 3.3.2).
3. `CalculatorRadioGroup` hides the real `<input>` (`peer sr-only`) and styles a
   `<span>`; there is **no** `peer-focus-visible` styling, so keyboard focus on a
   radio is invisible, and the group uses a `<p>` instead of `<fieldset>/<legend>`
   so it isn't announced as a group (WCAG 2.4.7 / 1.3.1).
4. The validation error box (`#calc-error`, `role="alert"`) is announced on show
   but is not associated to the input that caused it, and the input isn't marked
   `aria-invalid` (WCAG 3.3.1). This is the smallest of the four.

## Current state

Files and their roles:

- `src/components/calculator/CalculatorField.astro` — shared number/text field
  used by 16 calculator pages; renders `<label>`, the `<input>`, and an optional
  hint `<p>`. The hint is **not** associated to the input.
- `src/components/calculator/CalculatorRadioGroup.astro` — shared radio group
  used by 4 calculators (`deposito-a-plazo`, `iva`, `finiquito-indemnizacion`,
  `sueldo-liquido`).
- `src/components/calculator/CalculatorResultPanel.astro` — renders
  `<h2 id={headingId} tabindex="-1">{title}</h2>` then a slot. The `tabindex="-1"`
  heading is the intended focus target.
- `src/pages/calculadoras/sueldo-liquido.astro` — flagship calculator; renders
  `<CalculatorResultPanel>` **without** `headingId`, and owns the `#calc-error`
  box and the primary `#sueldo` input.
- `src/utils/sueldo-liquido/formController.ts` — client controller; contains
  `focusResultado()`, `showError()`, `hideError()`.

Key excerpts (verify they still match before editing):

`CalculatorField.astro:41-75`:
```astro
<div id={wrapperId} class:list={["mb-4", extraClass]} {...rest}>
  <label for={id} class="mb-1 block text-sm font-medium text-secondary">
    {label}
  </label>
  {
    hasSlot ? (
      <slot />
    ) : (
      <input
        type={ /* ...union... */ }
        id={id}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        value={value}
        required={required}
        class="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        {...(inputAttrs ?? {})}
      />
    )
  }
  {hint && <p class="mt-1 text-xs text-muted">{hint}</p>}
</div>
```

`CalculatorRadioGroup.astro:21-43`:
```astro
<div class:list={["mb-5", extraClass]} {...rest}>
  <p class="mb-2 text-sm font-medium text-secondary">{legend}</p>
  <div class="flex gap-2">
    {
      options.map(opt => (
        <label class="flex-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            id={opt.id}
            value={opt.value}
            checked={opt.checked}
            class="peer sr-only"
          />
          <span class="block rounded-lg border border-border px-3 py-3 text-center text-sm font-medium transition-all peer-checked:border-accent peer-checked:text-accent">
            {opt.label}
          </span>
        </label>
      ))
    }
  </div>
  {hint && <p class="mt-1 text-xs text-muted">{hint}</p>}
</div>
```

`sueldo-liquido.astro:532` (note: no `headingId`):
```astro
      <CalculatorResultPanel>
```

`formController.ts:65-85`:
```ts
function showError(message: string) {
  const el = document.getElementById("calc-error");
  // ...shows #calc-error...
}
function hideError() {
  const el = document.getElementById("calc-error");
  if (!el) return;
  el.classList.add("hidden");
  el.textContent = "";
}
function focusResultado() {
  const heading = document.getElementById("resultado-heading");
  if (heading) {
    heading.focus();
    heading.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}
```

Repo conventions to follow:
- Styling is Tailwind v4 utility classes inline on elements (see the existing
  `peer-checked:` classes). Use Tailwind variants, not a new stylesheet.
- Components are Astro `.astro` with a typed `Props` interface in frontmatter.
- A11y tests are Playwright + axe in `tests/accessibility/pages.test.ts` with the
  helper `tests/accessibility/axe-helper.ts`. Match that structure for new tests.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm exec astro check` | 0 errors |
| Lint | `pnpm exec eslint src/components/calculator src/pages/calculadoras/sueldo-liquido.astro src/utils/sueldo-liquido/formController.ts` | exit 0 |
| Format check | `pnpm exec prettier --check src/components/calculator src/pages/calculadoras/sueldo-liquido.astro` | exit 0 |
| Unit tests | `pnpm test` | all pass |
| A11y tests (optional, heavy) | `pnpm exec playwright test tests/accessibility` | all pass (needs a built/preview site; see Test plan) |

> NOTE: `pnpm run lint` over the whole repo may report thousands of errors from
> pre-existing nested worktrees under `.claude/worktrees/**` — that noise is not
> yours. Scope eslint to the in-scope paths as shown above.

## Scope

**In scope** (the only files you should modify):
- `src/components/calculator/CalculatorField.astro`
- `src/components/calculator/CalculatorRadioGroup.astro`
- `src/pages/calculadoras/sueldo-liquido.astro` (one prop add + error wiring)
- `src/utils/sueldo-liquido/formController.ts` (error association only)
- `tests/accessibility/pages.test.ts` (add assertions) — or a new
  `tests/accessibility/calculator-semantics.test.ts` (create)

**Out of scope** (do NOT touch, even though they look related):
- The calculation math (`src/application/use-cases/**`, `src/domain/**`) — audited
  clean three times; this plan changes only markup/ARIA/focus.
- The other 15 calculator pages' result panels — they already pass `headingId`
  where they manage focus, or don't call `focusResultado()`. Do not add focus
  wiring to pages that don't already import `formController`.
- Visible layout/design. Every change here must be visually neutral (the
  "Resultado" heading already renders; radios look identical until focused).

## Git workflow

- Branch: `advisor/032-calculator-a11y`
- Conventional commits, e.g.
  `fix(a11y): asociar hints y errores y exponer foco en componentes de calculadora`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Move focus to the result on `sueldo-liquido`

In `src/pages/calculadoras/sueldo-liquido.astro`, change the result panel open
tag at line ~532 from:
```astro
      <CalculatorResultPanel>
```
to:
```astro
      <CalculatorResultPanel headingId="resultado-heading">
```
This gives the existing "Resultado" `<h2>` the id + `tabindex="-1"` that
`focusResultado()` already looks for. No other change — the heading text and
styling are unchanged.

**Verify**: `grep -n 'headingId="resultado-heading"' src/pages/calculadoras/sueldo-liquido.astro` → one match. Then `pnpm exec astro check` → 0 errors.

### Step 2: Associate the hint to the input in `CalculatorField`

In `src/components/calculator/CalculatorField.astro`:
- In frontmatter, after the destructure, add:
  `const hintId = hint && !hasSlot ? `${id}-hint` : undefined;`
- On the `<input>`, add the attribute `aria-describedby={hintId}` (Astro omits
  the attribute when the value is `undefined`).
- Change the hint paragraph to carry the id:
  `{hint && <p id={hintId} class="mt-1 text-xs text-muted">{hint}</p>}`

The hint is only associated when the component renders its own input (not the
slot case), which is correct because slot consumers provide their own input.

**Verify**: `pnpm exec astro check` → 0 errors. `grep -n 'aria-describedby={hintId}' src/components/calculator/CalculatorField.astro` → one match.

### Step 3: Make radio focus visible and group radios semantically

In `src/components/calculator/CalculatorRadioGroup.astro`:
- Replace the outer `<div class:list={["mb-5", extraClass]} {...rest}>` with a
  `<fieldset class:list={["mb-5 border-0 p-0", extraClass]} {...rest}>` and its
  closing `</div>` with `</fieldset>` (reset default fieldset border/padding).
- Replace the `<p class="mb-2 text-sm font-medium text-secondary">{legend}</p>`
  legend with `<legend class="mb-2 text-sm font-medium text-secondary">{legend}</legend>`.
- On the styled `<span>`, append focus-visible classes so the span reflects
  keyboard focus on its `peer` input:
  `peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2`
  (append to the existing class string, keep all current classes).

**Verify**: `pnpm exec astro check` → 0 errors. `grep -n 'peer-focus-visible:ring' src/components/calculator/CalculatorRadioGroup.astro` → one match; `grep -n '<legend' src/components/calculator/CalculatorRadioGroup.astro` → one match.

### Step 4: Associate the validation error to the primary input

In `src/utils/sueldo-liquido/formController.ts`, in `showError(message)`, after
the error element is shown, also mark the primary amount input:
```ts
  const input = document.getElementById("sueldo");
  if (input) {
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", "calc-error");
  }
```
And in `hideError()`, after clearing the box, remove them:
```ts
  const input = document.getElementById("sueldo");
  if (input) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
```
(`#sueldo` is the primary salary input on this page; the shared `#calc-error`
box is what `role="alert"` already announces.)

**Verify**: `grep -n 'aria-invalid' src/utils/sueldo-liquido/formController.ts` → two matches (set + remove). `pnpm exec astro check` → 0 errors.

### Step 5: Two more `sueldo-liquido` a11y nits (same file, low risk)

Both are in `src/pages/calculadoras/sueldo-liquido.astro`:

- **Visible focus on the "Modo avanzado" toggle.** The button at line ~341 has
  `class="flex w-full items-center justify-between text-sm font-medium text-secondary hover:text-foreground"`
  — append focus-visible classes so keyboard focus is visible:
  `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none`
  (keep all existing classes; append).
- **Label the AFP comparison region.** The `#afp-comparison` section (open tag
  near line ~706, with `aria-live="polite"`) has a heading
  `#afp-comparison-heading` but no region role. Add
  `role="region" aria-labelledby="afp-comparison-heading"` to that section's
  opening tag, so screen readers announce it as a labeled region when it appears.

Do NOT touch the stacked-bar `title=` tooltips (lines ~553-571) — the legend
below already exposes the same values as text, so those are redundant, not a gap.

**Verify**: `pnpm exec astro check` → 0 errors.
`grep -n 'focus-visible:ring-accent' src/pages/calculadoras/sueldo-liquido.astro` → at least one match (the toggle).
`grep -n 'role="region" aria-labelledby="afp-comparison-heading"' src/pages/calculadoras/sueldo-liquido.astro` → one match.

### Step 6: Lint + format the touched files

**Verify**:
`pnpm exec eslint src/components/calculator src/pages/calculadoras/sueldo-liquido.astro src/utils/sueldo-liquido/formController.ts` → exit 0
`pnpm exec prettier --check src/components/calculator src/pages/calculadoras/sueldo-liquido.astro src/utils/sueldo-liquido/formController.ts` → exit 0 (run `prettier --write` on these paths if it reports drift, then re-check).

## Test plan

Two layers:

1. **Static-structure assertions (preferred, cheap).** The existing
   `tests/accessibility/pages.test.ts` is a Playwright suite that needs the site
   built. If running it is feasible in the executor environment, add a new test
   block (or new file `tests/accessibility/calculator-semantics.test.ts`,
   modeled on `pages.test.ts`) that loads `/calculadoras/sueldo-liquido/` and
   asserts:
   - the radio inputs are inside a `<fieldset>` with a `<legend>`;
   - at least one `CalculatorField` input exposes `aria-describedby` resolving to
     a visible hint element;
   - `#resultado-heading` exists and has `tabindex="-1"`.
   Run: `pnpm exec playwright test tests/accessibility` → all pass.

2. **If Playwright cannot run** (no browser/build in environment): STOP and
   report that the structural assertions could not be executed; do NOT mark the
   plan done. The four code changes are still verifiable via the `grep` checks in
   each step, but the regression guard must exist and pass before close.

Verification: `pnpm test` → existing unit suite still green (these changes are
markup/ARIA only and must not break any unit test).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec astro check` exits 0
- [ ] `grep -n 'headingId="resultado-heading"' src/pages/calculadoras/sueldo-liquido.astro` → one match
- [ ] `grep -n 'aria-describedby={hintId}' src/components/calculator/CalculatorField.astro` → one match
- [ ] `grep -n '<legend' src/components/calculator/CalculatorRadioGroup.astro` → one match AND `grep -n 'peer-focus-visible:ring' ...` → one match
- [ ] `grep -c 'aria-invalid' src/utils/sueldo-liquido/formController.ts` → 2
- [ ] `grep -c 'focus-visible:ring-accent' src/pages/calculadoras/sueldo-liquido.astro` → ≥1 AND `grep -c 'role="region" aria-labelledby="afp-comparison-heading"' src/pages/calculadoras/sueldo-liquido.astro` → 1
- [ ] eslint + prettier on the in-scope paths exit 0
- [ ] `pnpm test` exits 0
- [ ] New a11y structural test exists and passes (or STOP per Test plan step 2)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated (and archive policy followed)

## STOP conditions

Stop and report back (do not improvise) if:
- Any "Current state" excerpt doesn't match the live code (drift since planning).
- `CalculatorResultPanel.astro` no longer renders `<h2 id={headingId} tabindex="-1">`
  (Step 1's assumption is then false).
- Converting the radio wrapper to `<fieldset>` changes the visual layout in a
  way `astro check`/prettier can't absorb (e.g. a parent selector relied on the
  `<div>`). Report instead of restyling broadly.
- The Playwright a11y suite cannot be executed in your environment (see Test plan).
- A change would require touching any of the other 15 calculator pages.

## Maintenance notes

- If a new calculator manages its own result focus, it must pass
  `headingId="resultado-heading"` to `CalculatorResultPanel` and import
  `formController`'s focus call — consider promoting `headingId` to a required
  prop in a future change so this can't be forgotten.
- The `aria-describedby`/`aria-invalid` error wiring in `formController.ts` is
  specific to `#sueldo`; other calculators using their own controllers don't get
  it. If the controller is generalized (the CalculatorShell direction in
  plans 017–019), fold this association into the shared controller.
- Reviewer should scrutinize: that no visible layout shifted (diff the rendered
  calculator before/after), and that the `<fieldset>` reset classes fully
  neutralize the browser default border/margin.
