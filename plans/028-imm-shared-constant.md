# Plan 028: Consolidar el IMM (constante legal) en un módulo leaf único para la app

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 9a4eb37d..HEAD -- src/infrastructure/economic/EconomicParameterProvider.ts src/utils/sueldo-liquido/formController.ts src/pages/calculadoras/sueldo-liquido.astro`
> If any of those changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `9a4eb37d`, 2026-06-19

## Why this matters

The Ingreso Mínimo Mensual (IMM) is a **managed legal constant**: `mindicador.cl`
does not provide it, so the project maintains it by hand. Its canonical home is
`EconomicParameterProvider.ts` (`DEFAULT_IMM = 553_553`,
`DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01"`). But the **same value is re-typed as
a bare literal in three UI-layer fallback sites**:

- `src/utils/sueldo-liquido/formController.ts:51` → `... ? imm : 553_553`
- `src/pages/calculadoras/sueldo-liquido.astro:32` → `economicParameters.imm ?? 553_553`
- `src/pages/calculadoras/sueldo-liquido.astro:633` → `String(economicParameters.imm ?? 553553)` (note: **no digit separator** — does not grep with the others)

These are fallbacks used when the injected economic parameter is missing/invalid.
When the IMM next changes (it just did — the $539.000 → $553.553 reajuste), whoever
updates it must remember these three scattered literals. A missed one silently
serves a **stale minimum-wage floor in the live salary calculator** — the exact
stale-data failure the managed-constant pattern was created to prevent. This
consolidates the app-runtime sources onto one dependency-free leaf module so
there is a single number to change.

**Why a leaf module and not "import from the provider":** `formController.ts`
runs in the **browser** (it is imported by the sueldo-liquido client bundle).
`EconomicParameterProvider.ts` uses `node:fs` to read the snapshot — importing it
into client code would pull Node APIs into the browser bundle. So, exactly as
Plan 022 did for the CLP formatter, the constant goes into a **pure,
dependency-free leaf module** that both the provider and the client code import.

## Current state

Canonical definition — `src/infrastructure/economic/EconomicParameterProvider.ts:64–73`:

```ts
const DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;
const DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;
// Managed legal constant — Ingreso Mínimo Mensual. ...
const DEFAULT_IMM = 553_553;
const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";
```

`DEFAULT_IMM` / `DEFAULT_IMM_EFFECTIVE_DATE` are **not exported**; they are used
locally in `FALLBACK_PARAMETERS` (lines 87–88) and the snapshot-load path
(lines 205–206, 275–276).

Three UI fallback literals:

```ts
// src/utils/sueldo-liquido/formController.ts:51
imm: Number.isFinite(imm) && imm > 0 ? imm : 553_553,
```
```astro
// src/pages/calculadoras/sueldo-liquido.astro:32
const IMM_MENSUAL_SERVER = economicParameters.imm ?? 553_553;
// src/pages/calculadoras/sueldo-liquido.astro:633
data-imm={String(economicParameters.imm ?? 553553)}
```

**Sibling exemplar — `src/domain/economic/economicSourcePresentation.ts`** already
lives in `src/domain/economic/` and is imported by `sueldo-liquido.astro:28`
(`import { formatEconomicDate } from "@/domain/economic/economicSourcePresentation"`),
proving a pure `src/domain/economic/` module is safe to import from both the Astro
page and (being dependency-free) client code.

**Deliberate mirrors that STAY (do NOT consolidate):**

- `scripts/refresh-economic-snapshot.mjs:34` (`DEFAULT_IMM = 553_553`) — a `.mjs`
  script run by `node`; it cannot import a `.ts` leaf without a build step.
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts:7` — a separate
  Cloudflare Worker bundle/tsconfig; keep it self-contained.
- `tests/infrastructure/EconomicParameterProvider.test.ts:117` (`IMM_LEGAL_FLOOR = 553_553`)
  — a regression *floor* that must stay independent of the value it guards (a test
  asserting a value must not import that value, or it becomes circular).

These three are intentional cross-runtime / independent copies. This plan only
unifies the **app runtime** (provider + the three UI fallbacks). You will add a
one-line comment to the two generator mirrors pointing at the canonical leaf so a
future updater knows the full set.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Tests | `pnpm run test` | exit 0, no new failures |
| Typecheck | `pnpm run astro check` | exit 0, 0 errors |
| Domain boundaries | `pnpm run check:boundaries` | exit 0 |
| Lint | `pnpm run lint` | exit 0 |
| Format check | `pnpm run format:check` | exit 0 |

## Scope

**In scope** (the only files you should create or modify):

- `src/domain/economic/immConstants.ts` (create — the leaf module)
- `src/infrastructure/economic/EconomicParameterProvider.ts` (modify — import from leaf, drop the two local `const`s)
- `src/utils/sueldo-liquido/formController.ts` (modify — line 51)
- `src/pages/calculadoras/sueldo-liquido.astro` (modify — lines 32 and 633)
- `scripts/refresh-economic-snapshot.mjs` (modify — add a pointer comment only, line ~34)
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts` (modify — add a pointer comment only, line ~7)

**Out of scope** (do NOT touch):

- `tests/infrastructure/EconomicParameterProvider.test.ts` — its `IMM_LEGAL_FLOOR`
  is a deliberate independent literal; leave it.
- The numeric value itself — this is a pure refactor; `553553`/`553_553` and
  `"2026-05-01"` stay numerically identical everywhere.
- Any other calculator page or use-case.

## Git workflow

- Branch: `advisor/028-imm-shared-constant`
- Conventional commits, e.g. `refactor(economic): centralizar IMM en módulo leaf de dominio`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the leaf constant module

Create `src/domain/economic/immConstants.ts` with **no imports** (pure):

```ts
/**
 * Ingreso Mínimo Mensual (IMM) — managed legal constant.
 *
 * mindicador.cl does NOT publish the IMM, so it is maintained by hand. This is
 * the single source of truth for the APP RUNTIME (the economic provider and the
 * client-side salary calculator fallbacks). It is dependency-free on purpose so
 * it can be imported into client bundles without pulling Node APIs (see Plan
 * 022 for the same leaf-module constraint).
 *
 * NOTE: two generators keep their own mirrors for runtime reasons and must be
 * updated in lockstep when a new ley reajusta el IMM:
 *   - scripts/refresh-economic-snapshot.mjs (Node script, cannot import .ts)
 *   - workers/economic-snapshot-refresh/src/buildSnapshot.ts (separate Worker bundle)
 * The provider test (tests/infrastructure/EconomicParameterProvider.test.ts) also
 * keeps an independent IMM_LEGAL_FLOOR regression guard.
 */

/** IMM en pesos. Reajuste despachado a ley 2026-06-16, vigente desde 2026-05-01. */
export const DEFAULT_IMM = 553_553;

/** Fecha de vigencia legal del IMM (ISO YYYY-MM-DD). */
export const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";
```

**Verify**: `pnpm run check:boundaries` → exit 0 (a pure domain module imports
nothing forbidden).

### Step 2: Point the provider at the leaf

In `src/infrastructure/economic/EconomicParameterProvider.ts`:

1. Add to the import block at the top (it already imports from `@/domain/economic/EconomicParameters`):
   ```ts
   import { DEFAULT_IMM, DEFAULT_IMM_EFFECTIVE_DATE } from "@/domain/economic/immConstants";
   ```
2. **Delete** the two local declarations at lines ~72–73:
   ```ts
   const DEFAULT_IMM = 553_553;
   const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";
   ```
   Keep the explanatory comment block above them (lines 66–71) but trim it to one
   line that points at the leaf, e.g.:
   `// IMM (managed legal constant) now lives in @/domain/economic/immConstants.`
   Leave `DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF` and
   `DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF` untouched. All existing
   *uses* of `DEFAULT_IMM` / `DEFAULT_IMM_EFFECTIVE_DATE` in the file (lines
   ~87–88, ~205–206, ~275–276) stay exactly as-is — they now resolve to the
   imported values.

**Verify**: `pnpm run astro check` → 0 errors. `pnpm test -- EconomicParameterProvider` → all pass (the IMM floor/tripwire tests stay green because the value is unchanged).

### Step 3: Replace the three UI fallback literals

`src/utils/sueldo-liquido/formController.ts` — add to the import block at the top:
```ts
import { DEFAULT_IMM } from "@/domain/economic/immConstants";
```
and change line 51 from `... ? imm : 553_553,` to `... ? imm : DEFAULT_IMM,`.

`src/pages/calculadoras/sueldo-liquido.astro` — in the frontmatter import block
(near line 28 where `economicSourcePresentation` is imported) add:
```ts
import { DEFAULT_IMM } from "@/domain/economic/immConstants";
```
- Line 32: `const IMM_MENSUAL_SERVER = economicParameters.imm ?? 553_553;` →
  `const IMM_MENSUAL_SERVER = economicParameters.imm ?? DEFAULT_IMM;`
- Line 633: `data-imm={String(economicParameters.imm ?? 553553)}` →
  `data-imm={String(economicParameters.imm ?? DEFAULT_IMM)}`

**Verify**: `grep -rn "553_553\|553553" src/utils src/pages` → **no matches**
(all UI literals replaced). `grep -rn "553" src/domain/economic/immConstants.ts`
→ one match (the canonical definition).

### Step 4: Add pointer comments to the two generator mirrors

These two keep their literal (different runtimes), but add a one-line comment
above each so the next IMM update touches all sites:

- `scripts/refresh-economic-snapshot.mjs` (above the `DEFAULT_IMM = 553_553;` line ~34):
  `// Mirror of src/domain/economic/immConstants.ts DEFAULT_IMM (Node script cannot import the .ts leaf). Keep in sync.`
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts` (above the `DEFAULT_IMM = 553_553;` line ~7):
  `// Mirror of src/domain/economic/immConstants.ts DEFAULT_IMM (separate Worker bundle). Keep in sync.`

Do NOT change the values.

**Verify**: `pnpm run lint` → exit 0; `pnpm run format:check` → exit 0 (run
`pnpm run format` scoped to the changed files first if needed, then re-check).

### Step 5: Full verification

**Verify**: `pnpm run test` → exit 0, no new failures.
**Verify**: `pnpm run astro check` → 0 errors.
**Verify**: `pnpm run check:boundaries` → exit 0.

## Test plan

No new test is required — this is a value-preserving refactor and the existing
`tests/infrastructure/EconomicParameterProvider.test.ts` already pins the IMM
(floor ≥ 553_553, effective-date format, presence in snapshot + live modes). Its
green status after the change is the proof the consolidation preserved behavior.

Optional (nice-to-have, not required): add one assertion to a suitable existing
suite that `DEFAULT_IMM` from the leaf equals the snapshot's `imm`
(`src/infrastructure/economic/economic-parameters.snapshot.json` → `553553`), to
catch future drift between the leaf and the committed snapshot. If you add it,
put it in a new `tests/domain/immConstants.test.ts` and keep it tiny.

## Done criteria

ALL must hold:

- [ ] `src/domain/economic/immConstants.ts` exists, exports `DEFAULT_IMM` and `DEFAULT_IMM_EFFECTIVE_DATE`, imports nothing.
- [ ] `grep -rn "553_553\|553553" src/utils src/pages` returns **no matches**.
- [ ] `grep -rn "DEFAULT_IMM = 553" src/infrastructure` returns **no matches** (provider now imports it).
- [ ] `pnpm run test` exits 0; the IMM provider tests pass unchanged.
- [ ] `pnpm run astro check`, `pnpm run check:boundaries`, `pnpm run lint`, `pnpm run format:check` all exit 0.
- [ ] The two generator mirrors still hold `553_553` **with** a new sync-pointer comment.
- [ ] Only the in-scope files changed (`git status`).
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `check:boundaries` fails after Step 1 — a domain module must not import infra;
  the leaf must stay import-free.
- Importing `@/domain/economic/immConstants` into `formController.ts` causes a
  build/typecheck error about Node modules in the client bundle — that means the
  leaf accidentally pulled a non-pure import; re-check Step 1.
- The IMM provider tests fail — the value must be byte-identical; do not adjust
  the test's `IMM_LEGAL_FLOOR`.
- You discover a *fourth* IMM literal not listed here (search `grep -rn "553553\|553_553" .` excluding `node_modules`, `dist`, `.git`) — report it rather than silently changing it.

## Maintenance notes

- After this lands, updating the IMM means: bump the value + effective date in
  `src/domain/economic/immConstants.ts`, then the two generator mirrors
  (`scripts/refresh-economic-snapshot.mjs`, `buildSnapshot.ts`), the committed
  snapshot JSON, and the test's `IMM_LEGAL_FLOOR` + `IMM_REVIEW_BY`. The leaf's
  doc-comment and the provider test message both enumerate this set.
- Reviewer should confirm the diff is purely mechanical (no number changed) and
  that no Node import leaked into the client path via the new leaf.
- This is the same leaf-module pattern as Plan 022 (CLP formatter); if both land,
  consider whether `src/domain/economic/` is becoming the natural home for
  client-safe economic constants and presentation helpers.
