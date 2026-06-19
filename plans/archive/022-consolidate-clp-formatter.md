# Plan 022: Consolidar el formateador de pesos (CLP) en un módulo único

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 57ad5261..HEAD -- src/utils/indicadores.ts src/utils/sueldo-liquido/resultRenderer.ts`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `57ad5261`, 2026-06-15

## Why this matters

The Chilean-peso currency formatter exists in two places with identical bodies:
`formatCLP` in `src/utils/indicadores.ts` and `fmt` in
`src/utils/sueldo-liquido/resultRenderer.ts`. `indicadores.ts` even ships a
`@deprecated` `fmt` alias pointing at its `formatCLP`, signalling the team
already intends one canonical formatter — but the sueldo-liquido refactor (Plan
014) reintroduced a second copy. Two implementations under two names means a
future change to the format (locale, the leading `"$"`, rounding) must be made
twice or silently drift. This consolidates them into one pure leaf module.

**Critical constraint:** `indicadores.ts` imports from `@/domain`,
`@/infrastructure`, and `@/application`, so it is **not safe to import into
client-side code**. `resultRenderer.ts` runs in the browser (it is imported by
`formController.ts`, the sueldo-liquido client module). Therefore the fix must
NOT make `resultRenderer.ts` import `indicadores.ts` — that would pull the
economic provider into the client bundle. The consolidation goes through a new
**dependency-free leaf module** that both files import.

## Current state

`src/utils/sueldo-liquido/resultRenderer.ts` (lines ~5–11) — client-side:

```ts
export function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

export function fmtPct(n: number): string {
  return n.toFixed(2) + "%";
}
```

`src/utils/indicadores.ts` (lines ~51–57) — server/build-side, imports domain
and infrastructure at the top of the file:

```ts
/** Formatea un número como pesos chilenos: "$" + valor redondeado + separadores de miles. */
export function formatCLP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

/** @deprecated Usa `formatCLP` en su lugar. */
export const fmt = formatCLP;
```

Consumers that must keep working unchanged:
- `src/utils/sueldo-liquido/formController.ts:17` —
  `import { updateResultDisplay, fmt, fmtPct } from "./resultRenderer";`
- Any module importing `formatCLP` (or the deprecated `fmt`) from
  `@/utils/indicadores` — these must continue to resolve.

The repo uses the `@/` path alias for `src/` (e.g. `afpComparison.ts` imports
`@/application/...`). `fmtPct` is **not** duplicated; leave it in
`resultRenderer.ts` as-is.

## Commands you will need

| Purpose       | Command                                            | Expected on success |
|---------------|----------------------------------------------------|---------------------|
| Typecheck     | `pnpm exec astro check`                            | 0 errors            |
| Lint / format | `pnpm run lint` ; `pnpm run format:check`          | exit 0              |
| Tests         | `pnpm test`                                        | all pass            |
| Dead code     | `pnpm run check:dead-code`                         | no new unused exports (warning-first, clean baseline) |

## Scope

**In scope**:
- `src/utils/formatCLP.ts` (create — the new leaf module)
- `src/utils/indicadores.ts`
- `src/utils/sueldo-liquido/resultRenderer.ts`

**Out of scope** (do NOT touch):
- `formController.ts` and any other consumer — their imports must keep working
  without edits (that is the success condition).
- `fmtPct` — not duplicated, leave it.
- Do NOT delete the `@deprecated fmt` alias from `indicadores.ts`; keep it for
  backward compatibility (it just re-points to the shared impl).
- Do NOT import `indicadores.ts` into `resultRenderer.ts` (bundle-safety rule).

## Git workflow

- Branch: `advisor/022-consolidate-clp-formatter`
- Single commit; conventional-commit style:
  `refactor: unificar formateador CLP en módulo leaf compartido (Plan 022)`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create the pure leaf module

Create `src/utils/formatCLP.ts` with **zero imports**:

```ts
/** Formatea un número como pesos chilenos: "$" + valor redondeado + separadores de miles. */
export function formatCLP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}
```

**Verify**: `pnpm exec astro check` → 0 errors.

### Step 2: Point `indicadores.ts` at the leaf module

In `src/utils/indicadores.ts`, replace the inline `formatCLP` definition with a
re-export from the leaf module, keeping the deprecated alias:

```ts
import { formatCLP } from "./formatCLP";

export { formatCLP };

/** @deprecated Usa `formatCLP` en su lugar. */
export const fmt = formatCLP;
```

(Add the `import` near the other top-of-file imports. The public exports
`formatCLP` and `fmt` stay available to existing consumers.)

**Verify**: `pnpm exec astro check` → 0 errors.

### Step 3: Point `resultRenderer.ts` at the leaf module

In `src/utils/sueldo-liquido/resultRenderer.ts`, replace the inline `fmt`
definition with an import + re-export, keeping the named export `fmt` so
`formController.ts` needs no change. Leave `fmtPct` untouched.

```ts
import { formatCLP } from "@/utils/formatCLP";

export const fmt = formatCLP;

export function fmtPct(n: number): string {
  return n.toFixed(2) + "%";
}
```

**Verify** (scope the grep to the two de-duplicated files — the literal
`toLocaleString("es-CL")` also appears in several calculator `.astro` pages with
their own inline `fmtClp`, which are **out of scope** for this plan):
- `grep -n 'toLocaleString("es-CL")' src/utils/indicadores.ts src/utils/sueldo-liquido/resultRenderer.ts`
  → **no** matches (both now import the leaf module).
- `grep -c 'toLocaleString' src/utils/formatCLP.ts` → 1.
- `pnpm exec astro check` → 0 errors.

### Step 4: Full verification

**Verify**:
- `pnpm test` → all pass
- `pnpm run lint` → exit 0
- `pnpm run format:check` → exit 0 (run `pnpm run format` then re-check if needed)
- `pnpm run check:dead-code` → no new unused-export warnings introduced

## Test plan

No new test is required: this is a behavior-preserving refactor of a pure
function, and the existing suite exercises both consumers (sueldo-liquido and
indicadores paths). The grep in Step 3 (single implementation) plus the green
suite is the regression gate. If `check:dead-code` flags `src/utils/formatCLP.ts`
as unused, an import wiring is wrong — fix it before proceeding.

## Done criteria

ALL must hold:

- [ ] `src/utils/formatCLP.ts` exists with no imports
- [ ] `grep -n 'toLocaleString("es-CL")' src/utils/indicadores.ts src/utils/sueldo-liquido/resultRenderer.ts` returns no matches (both import the leaf module). NOTE: inline copies in calculator `.astro` pages are out of scope and may still match elsewhere.
- [ ] `resultRenderer.ts` does NOT import from `indicadores.ts`
- [ ] `indicadores.ts` still exports `formatCLP` and the `@deprecated fmt` alias
- [ ] `formController.ts` is unmodified and still imports `fmt`/`fmtPct` from `./resultRenderer`
- [ ] `pnpm exec astro check`, `pnpm test`, `pnpm run lint`, `pnpm run format:check` all exit 0
- [ ] Only the three in-scope files are created/modified (`git status`)
- [ ] `plans/README.md` status row for 022 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The "Current state" excerpts don't match the live files (drift).
- Removing the inline `formatCLP` from `indicadores.ts` breaks a consumer that
  imported something other than `formatCLP`/`fmt` from it.
- `pnpm run check:dead-code` or `astro check` reports the new leaf module as
  unreachable after wiring (indicates a wrong import path).
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- For the reviewer: the only load-bearing subtlety is bundle safety —
  `resultRenderer.ts` (client) must import the leaf module, never `indicadores.ts`
  (which drags in the economic provider). Confirm the import path in
  `resultRenderer.ts` is `@/utils/formatCLP`.
- Future: `fmtPct` is the next candidate for the same leaf module if a second
  copy ever appears; today it is single-source, so leave it.
- Deferred (out of scope): several calculator `.astro` pages (e.g.
  `reajuste-arriendo.astro`, `conversor-utm.astro`, `boleta-honorarios-liquido.astro`,
  `simulador-renegociacion.astro`) define their own inline `fmtClp` with the same
  body. Migrating those to `@/utils/formatCLP` is a larger, separate cleanup —
  this plan only consolidates the two named `formatCLP`/`fmt` exports.
