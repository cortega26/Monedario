# Plan 044: Eliminar el CLS del aviso de prellenado convirtiéndolo en toast `fixed`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1be689b3..HEAD -- src/scripts/calculator-prefill.ts`
> If this file changed since this plan was written, compare the "Current
> state" excerpt below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (independent follow-up carved out of plan 041, archived — see `plans/041-impuesto-cls-load-shift.md` "Resultado de ejecución" section for the diagnosis that found this)
- **Category**: perf
- **Planned at**: commit `1be689b3`, 2026-07-11

## Why this matters

Plan 041 diagnosed a **load-time layout shift of 0.0125** on
`/calculadoras/impuesto-segunda-categoria/` for returning users whose saved
profile prefills the form (Playwright + a real `PerformanceObserver({type:
'layout-shift'})` on a production build, mobile viewport). Root cause,
confirmed by reading the code: `ensureHint()` in
`src/scripts/calculator-prefill.ts` inserts a "✓ Pre-rellenado de tu última
simulación" notice via `host.prepend(hint)` — a normal-flow DOM insertion that
happens ~100–1200ms after page load (`requestIdleCallback`/`setTimeout`, see
`schedule()`), after the browser has already painted and laid out the page.
Because the insertion happens post-paint, it pushes every sibling below it
down by the hint's height, and that displacement counts as a Cumulative
Layout Shift.

This script is **shared by every calculator page that opts into profile
prefill** (grep confirms `data-profile-prefill-host` or the calculator
page-type marker on ~21 pages under `src/pages/calculadoras/`), so this same
small shift likely fires on any of them whenever a real user has a matching
saved profile. 0.0125 is individually within Google's "good" CLS threshold
(< 0.1), but it is a real, reproducible, avoidable shift on a shared code
path — worth fixing once, centrally, rather than leaving it latent across ~21
pages.

**Explicitly not this plan's job**: this fix does not explain or address the
much larger field CLS (p75 = 1.008) that plan 041 measured for
`impuesto-segunda-categoria` — that gap is ~80× larger than this shift and
remains unidentified (see plan 041's diagnosis). Do not describe this plan as
fixing that number.

## Current state

`src/scripts/calculator-prefill.ts` (single file, no other files involved):

```ts
function ensureHint(host: HTMLElement): HTMLElement {
  const existing = host.querySelector<HTMLElement>(`#${HINT_ID}`);
  if (existing) return existing;

  const hint = document.createElement("div");
  hint.id = HINT_ID;
  hint.className =
    "mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-secondary";
  hint.setAttribute("role", "note");

  const label = document.createElement("span");
  label.textContent = "✓ Pre-rellenado de tu última simulación";

  const button = document.createElement("button");
  button.type = "button";
  button.id = "profile-prefill-clear";
  button.className =
    "text-xs font-medium text-accent underline underline-offset-4 hover:opacity-80";
  button.textContent = "Limpiar";

  hint.appendChild(label);
  hint.appendChild(button);
  host.prepend(hint);

  return hint;
}
```

The only call site is in `init()` (same file):

```ts
  if (prefillCount > 0) {
    const hostSelector = root.dataset.profilePrefillHost ?? "form, .grid";
    const host =
      root.querySelector<HTMLElement>(hostSelector) ??
      (root.firstElementChild as HTMLElement | null) ??
      root;
    const hint = ensureHint(host);
    hint
      .querySelector<HTMLButtonElement>("#profile-prefill-clear")
      ?.addEventListener("click", () => {
        clearProfile();
        clearPrefilled(prefilledInputs);
        hint.remove();
      });
  }
```

**Repo convention to match**: `src/components/BackToTopButton.astro:6-12` is
the existing exemplar of a floating, `position: fixed` UI element in this
codebase that never participates in document flow and is shown/hidden purely
via class toggles (opacity/transform), not DOM insertion — that pattern is
exactly why it produces zero CLS today, and is the model to follow here:

```astro
<div
  id="btt-btn-container"
  class:list={[
    "fixed end-4 bottom-8 z-50",
    "md:sticky md:end-auto md:float-end md:me-1",
    "translate-y-14 opacity-0 transition duration-500",
  ]}
>
```

For status/live-region markup, the repo's convention is plain `role="status"`
with no explicit `aria-live` (implicit in the role) — see
`src/pages/calculadoras/sueldo-liquido.astro:203-205`
(`<div id="min-wage-warning" ... role="status">`). Match this instead of the
current `role="note"` (which is not a live region and was never announced to
screen readers).

## Commands you will need

| Purpose      | Command                                                                 | Expected               |
|--------------|--------------------------------------------------------------------------|------------------------|
| Install      | `pnpm install`                                                          | exit 0                 |
| Typecheck    | `astro check`                                                           | 0 errors                |
| Unit tests   | `pnpm exec vitest run tests/integration/calculator-prefill.test.ts`     | all pass               |
| Full suite   | `pnpm test`                                                             | all pass, no regressions|
| Lint (scoped)| `pnpm exec eslint src/scripts/calculator-prefill.ts tests/integration/calculator-prefill.test.ts` | exit 0 |
| Format       | `pnpm run format:check`                                                 | exit 0                  |

Do not run the repo-wide `pnpm run lint` — it is known to be contaminated by
unrelated nested worktrees under `.claude/worktrees/**` (documented in
`plans/README.md`'s note on plan 022); the scoped eslint command above is the
real gate for this diff.

## Scope

**In scope**:
- `src/scripts/calculator-prefill.ts` — `ensureHint()` and its one call site
  in `init()`.
- `tests/integration/calculator-prefill.test.ts` (new file).

**Out of scope**:
- Any `.astro` page under `src/pages/calculadoras/`. The
  `data-profile-prefill-host` attribute on those pages will become unused by
  this change (see Step 1) — **do not remove it from the pages**; it is
  harmless dead markup and touching 21 pages is out of proportion to this
  fix. If a future cleanup wants it gone, that is a separate plan.
- `src/utils/userProfile.ts` — prefill data storage is not the problem here.
- Any change to *which* fields get prefilled or when `init()` runs — only the
  hint's placement/markup changes.

## Git workflow

- Branch: `advisor/044-calculator-prefill-hint-cls`
- Conventional commit, e.g. `fix(perf): convertir el aviso de prellenado en toast fixed para eliminar su CLS`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Convert `ensureHint()` to a fixed, out-of-flow toast

Rewrite `ensureHint()` to no longer take a `host` parameter and to append to
`document.body` instead of prepending into the host:

```ts
function ensureHint(): HTMLElement {
  const existing = document.querySelector<HTMLElement>(`#${HINT_ID}`);
  if (existing) return existing;

  const hint = document.createElement("div");
  hint.id = HINT_ID;
  hint.className =
    "fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-xs text-secondary shadow-lg sm:inset-x-auto sm:end-4";
  hint.setAttribute("role", "status");

  const label = document.createElement("span");
  label.textContent = "✓ Pre-rellenado de tu última simulación";

  const button = document.createElement("button");
  button.type = "button";
  button.id = "profile-prefill-clear";
  button.className =
    "text-xs font-medium text-accent underline underline-offset-4 hover:opacity-80";
  button.textContent = "Limpiar";

  hint.appendChild(label);
  hint.appendChild(button);
  document.body.appendChild(hint);

  return hint;
}
```

Update the call site in `init()` to drop the now-unused `host`/`hostSelector`
computation:

```ts
  if (prefillCount > 0) {
    const hint = ensureHint();
    hint
      .querySelector<HTMLButtonElement>("#profile-prefill-clear")
      ?.addEventListener("click", () => {
        clearProfile();
        clearPrefilled(prefilledInputs);
        hint.remove();
      });
  }
```

Notes on the exact class list above: it is a starting point modeled on
`BackToTopButton.astro`'s `fixed`/`end-4`/`z-50` convention, positioned at
`top-4` (not `bottom`, to avoid the vertical space `BackToTopButton` occupies
at `end-4 bottom-8`). If, when you visually check it in Step 2, it overlaps
the site header, another fixed element, or looks wrong on mobile vs. desktop,
adjust the Tailwind utilities — the exact pixels are not load-bearing, only
that the element (a) uses `fixed` positioning so it is out of normal flow,
and (b) doesn't visually collide with `BackToTopButton` or the header.

**Verify**: `astro check` → 0 errors.

### Step 2: Visual check (no automated substitute)

Run `pnpm run build && pnpm run preview`. Open a calculator page that has
`data-profile-prefill-host` (e.g. `/calculadoras/impuesto-segunda-categoria/`)
with a matching seeded profile in `localStorage` (same technique plan 041
used: set the `monedario_profile` key the way `getProfile()`/`userProfile.ts`
reads it, with a value for at least one bound field on that page, e.g.
`sueldoImponible`). Confirm:

- The toast appears without visibly overlapping the header or the
  back-to-top button.
- Clicking "Limpiar" removes the toast and clears the prefilled inputs (same
  behavior as before — `clearPrefilled`/`clearProfile` are unchanged).
- On a page/viewport without a matching profile (empty `localStorage`), no
  toast appears and nothing shifts.

**STOP and report** if you cannot seed a profile that triggers the toast —
don't guess at the visual result blind.

### Step 3: Re-measure CLS

Repeat plan 041's measurement technique: Chrome DevTools Performance panel
(or a `PerformanceObserver({type: 'layout-shift'})` script) on the prefilled
load of `/calculadoras/impuesto-segunda-categoria/`, production build via
`pnpm run preview`.

**Verify**: zero layout-shift entries attributable to the hint/toast
insertion (a `position: fixed` element being appended to `document.body`
should produce none, by construction — confirm this holds in practice, not
just in theory).

### Step 4: Add the regression test

Create `tests/integration/calculator-prefill.test.ts`, modeled directly on
the existing pattern in `tests/integration/analytics-script.test.ts`
(`@vitest-environment happy-dom`, fake timers, mocked
`window.requestIdleCallback`, fresh `await import(...)` of the script under
test per test via `vi.resetModules()`).

Cover:
1. **Happy path**: seed `localStorage` with a profile matching a
   `data-profile-bind` field present in a minimal DOM fixture (a `<main
   data-analytics-page-type="calculator">` containing an `<input
   data-profile-bind="sueldoImponible">`), import the script, run pending
   timers, and assert:
   - `document.getElementById("profile-prefill-hint")` exists.
   - Its **parent is `document.body`**, not the input's container — this is
     the structural assertion that actually verifies the CLS fix (the old
     code's parent would have been the host element inside `<main>`).
   - Its class list contains `"fixed"` (positioned out of flow) and its
     `role` attribute is `"status"`.
2. **Clear button**: click `#profile-prefill-clear` and assert the hint is
   removed from the document (`document.getElementById("profile-prefill-hint")`
   is `null` afterward) and the previously-prefilled input's
   `dataset.profilePrefilled` is cleared.
3. **No-prefill path**: with empty `localStorage`, run `init()` and assert no
   `#profile-prefill-hint` element is created at all.

**Verify**: `pnpm exec vitest run tests/integration/calculator-prefill.test.ts`
→ all new tests pass.

### Step 5: Full regression pass

**Verify**: `pnpm test` → all pass, no unrelated failures. `astro check` → 0
errors. `pnpm exec eslint src/scripts/calculator-prefill.ts
tests/integration/calculator-prefill.test.ts` → exit 0. `pnpm run
format:check` → exit 0.

## Test plan

- New file `tests/integration/calculator-prefill.test.ts`, three cases as
  described in Step 4 (happy path/structural placement, clear button,
  no-prefill path). Model the harness setup line-for-line on
  `tests/integration/analytics-script.test.ts`.
- No existing tests reference `calculator-prefill.ts` today (confirmed: no
  file under `tests/` matches `*prefill*` before this plan) — this is new
  coverage, not a modification of existing tests.

## Done criteria

- [ ] `ensureHint()` takes no `host` parameter, appends to `document.body`,
      and the element's class list includes `fixed`; `grep -n "host.prepend"
      src/scripts/calculator-prefill.ts` returns no matches.
- [ ] `role="status"` is set on the hint element (`grep -n 'setAttribute("role"'
      src/scripts/calculator-prefill.ts` shows `"status"`, not `"note"`).
- [ ] Step 2's visual check performed and described in the report (no blind
      "should work").
- [ ] Step 3's re-measurement shows zero layout-shift entries from the toast.
- [ ] `tests/integration/calculator-prefill.test.ts` exists with the 3 cases
      above, all passing, and asserts the structural placement (`parentNode
      === document.body`), not just that the code runs without throwing.
- [ ] `pnpm test` full suite passes.
- [ ] `astro check` → 0 errors; scoped `eslint` → exit 0; `format:check` →
      exit 0.
- [ ] `git status` shows only the 2 files above modified/added.
- [ ] `plans/README.md` status row for 044 updated.

## STOP conditions

- The code in "Current state" doesn't match what you find in
  `calculator-prefill.ts` (drift) — stop, compare, report.
- You cannot seed a profile/localStorage value that actually triggers the
  hint in a real browser (Step 2) — report instead of shipping an unverified
  visual change.
- Removing the `host` parameter breaks something else that reads it (it
  shouldn't — it has exactly one call site, verified while writing this plan
  — but if you find another caller, STOP and report before changing the
  signature).

## Resultado de ejecución (APROBADO en revisión, pendiente de merge, 2026-07-12, vía `/improve execute 044`)

Ejecutor despachado en worktree aislado
(`.claude/worktrees/agent-a14e6c16a1c1a1cc9`, rama
`advisor/044-calculator-prefill-hint-cls`, commit `9da2ce6b`,
`fix(perf): convertir el aviso de prellenado en toast fixed para eliminar su CLS`).
Sin drift (`git diff --stat 1be689b3..HEAD -- src/scripts/calculator-prefill.ts`
vacío antes de despachar).

**Revisión (tech-lead) APROBADA** — reverificada de forma independiente en el
worktree, no solo confiando en el reporte del ejecutor:
- Diff acotado exactamente a los 2 archivos en alcance
  (`src/scripts/calculator-prefill.ts` +6/-11, `tests/integration/calculator-prefill.test.ts`
  nuevo, +91): `ensureHint()` sin parámetro `host`, `document.body.appendChild(hint)`
  en vez de `host.prepend(hint)`, `role="status"` en vez de `"note"`; llamada en
  `init()` simplificada a `ensureHint()`. `git diff --stat` confirmado — sin
  archivos fuera de alcance.
- `pnpm exec vitest run tests/integration/calculator-prefill.test.ts` → 3/3;
  suite completa `pnpm test` → **1029/1029** (124 archivos); `astro check` → 0
  errores (1 hint preexistente no relacionado en `content.config.ts`); `eslint`
  de los 2 archivos en alcance → exit 0; `format:check` → exit 0.
- Tests auditados leyendo las aserciones, no solo el resultado en verde: el
  caso 1 verifica `hint.parentElement === document.body` (la aserción
  estructural que realmente prueba el fix de CLS — con el código viejo el
  padre habría sido un elemento dentro de `<main>`), `classList.contains("fixed")`
  y `role === "status"`; caso 2 verifica que "Limpiar" remueve el toast y
  limpia `dataset.profilePrefilled`; caso 3 verifica que sin perfil guardado no
  se crea ningún toast. Ningún caso es vacío.
- **Desviación documentada y aprobada en mérito**: el plan marcó `top-4` como
  punto de partida no vinculante ("not load-bearing... adjust if it collides").
  El ejecutor midió con Playwright que el header real mide 81px (mobile/tablet)
  y 93px (desktop) de alto, confirmó colisión visual real con `top-4` (capturas
  de pantalla), y ajustó a `top-28` (112px). Verificado por el revisor
  directamente en las capturas (`toast_mobile.png`, `toast_desktop.png`): el
  toast queda debajo del header en ambos viewports, sin superponerse con
  `BackToTopButton` (que usa `bottom-8`, geométricamente disjunto de `top-28`).
- CLS re-medido por el ejecutor con `PerformanceObserver({type:'layout-shift'})`
  sobre build de producción (`pnpm run preview`): cero entradas tanto con
  perfil prellenado como sin perfil — consistente con la garantía estructural
  de que un elemento `fixed` anclado a `document.body` no puede desplazar a
  otros elementos (no reverificado en persona por el revisor más allá de la
  evidencia visual de las capturas y el argumento estructural, que es
  suficiente dado que "fixed" saca al elemento del flujo normal por
  construcción de CSS).
- Confirmado por grep en el árbol principal (no solo en el reporte): único
  call site de `ensureHint()` en todo el repo era el de `init()` — el STOP
  condition sobre "otro caller" no aplicaba, tal como anticipaba el plan.
- `git branch -vv` confirma que la rama no tiene upstream — no se pusheó, no
  se abrió PR, tal como instruye el plan.

**Nota de sincronización, sin impacto en el diff:** el worktree del ejecutor
partió de `origin/main` (`08b36350`, un refresh automático del snapshot
económico por el bot `monedario-snapshot-bot`), una rama por delante de la
`main` local en ese momento (`1be689b3`). Confirmado `git merge-base
--is-ancestor` — `main` local es ancestro limpio de `origin/main`; es solo un
gap de sincronización local/remoto, no un problema de alcance. El commit
`08b36350` no toca ningún archivo de este plan.

**No mergeado a `main` todavía** — según la política de cierre atómico de este
repo, el plan no se considera terminado ni se archiva hasta que su commit esté
integrado en `main`. Queda `APROBADO, pendiente de merge` a decisión del
operador (branch `advisor/044-calculator-prefill-hint-cls`, worktree
`.claude/worktrees/agent-a14e6c16a1c1a1cc9`).

## Maintenance notes

- `data-profile-prefill-host` attributes left in the 21 `.astro` pages are
  now dead markup (not read by any code after this change). Harmless; flagged
  here so a future contributor doesn't wonder why it exists. Not cleaned up
  in this plan — see Scope.
- This fix does not address the unexplained field CLS gap from plan 041
  (measured local shift was 0.0125; field p75 was 1.008, ~80× larger). If a
  future investigation into that gap is funded, it should not assume this fix
  resolves it.
- If the visual position (`top-4`/`end-4`) ever collides with a new fixed
  element added elsewhere in the layout (header, cookie banner, etc.), that's
  a simple Tailwind class adjustment in this same function — no structural
  change needed.
