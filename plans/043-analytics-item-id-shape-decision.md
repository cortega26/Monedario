# Plan 043: Decidir y aplicar la forma segura de `item_id` en analytics (carve-out de 038)

> **Executor / maintainer instructions**: This is a **decision brief**, not a
> blind executor task. Step 1 requires a human (the repo maintainer) to pick
> one of three options before any code changes. An executor agent may prepare
> the evidence and draft the diff for the chosen option, but must **not**
> pick the option itself — that is a data-modeling/analytics-semantics call,
> not a pure security-hardening one. If no decision is recorded, STOP after
> Step 1 and report back; do not guess.
>
> **Drift check (run first)**:
> `git diff --stat 0e1a2a7a..HEAD -- workers/analytics-collector/src/index.ts src/utils/analytics.ts src/components/ResumeWidget.astro src/utils/resumeState.ts`
> If any changed, re-verify the "Current state" evidence below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.
> **This plan touches the same `index.ts`/`analytics.ts` regions as plan
> 038 — run 038 first (it should already be DONE and merged) and re-run this
> drift check against the post-038 code, not the original `520a8685`.**

## Status

- **Priority**: P3
- **Effort**: S (once the option is chosen — the code change itself is small)
- **Risk**: LOW–MED (LOW for options 1/2; option 3 changes existing analytics
  data semantics for `item_id`, see below)
- **Depends on**: [plan 038](038-analytics-freeform-dimension-shape.md) — merge
  038 first so `FREE_FORM_TOKEN_KEYS` / `SAFE_TOKEN_RE` already exist in both
  files; this plan extends that scaffolding rather than re-inventing it.
- **Category**: security / direction (the fix is security-flavored but the
  choice of fix is a product decision)
- **Origin**: carved out of [plan 038](038-analytics-freeform-dimension-shape.md)
  during its `execute` review, 2026-07-11 (commit `0e1a2a7a`), after an
  executor correctly refused to apply 038's original regex to `item_id`
  (see 038's "Revision history" for the full trace).

## Why this matters

Plan 038 constrains three free-form analytics dimensions
(`calculator_slug`, `rule_id`, `action_id`) to a strict lowercase-token
shape, closing a scorecard-poisoning / unbounded-KV-cardinality gap. A
fourth dimension, `item_id`, was deliberately left out of 038 because the
same strict regex would silently break real production data (see "Current
state"). `item_id` today remains **fully unconstrained** — any string of up
to 200 chars passes both the worker and the client — so the original
poisoning/cardinality gap 038 set out to close is still open for this one
dimension.

## Current state (verified 2026-07-11, re-confirm via the drift check above)

`item_id` is allowlisted for one event: `resume_click`
(`EVENT_ALLOWLIST["resume_click"] = new Set(["item_type", "item_id"])` in
both `workers/analytics-collector/src/index.ts` and `src/utils/analytics.ts`).

The **only** live emitter is `src/components/ResumeWidget.astro:126-132`:

```ts
calcLink.addEventListener("click", () => {
  trackAnalyticsEvent("resume_click", {
    item_type: "calculator",
    item_id: data.calculator.id,
  });
});
```

`data.calculator.id` is populated by `saveCalculatorResult(id, label)` in
`src/utils/resumeState.ts:48-50`:

```ts
export function saveCalculatorResult(id: string, label: string): void {
  const data = getResumeData();
  data.calculator = { id, label, ts: Date.now() };
  // ...persisted to localStorage...
}
```

Every call site passes **`window.location.pathname`** as `id` — not a slug:

- `src/utils/sueldo-liquido/formController.ts:287-290` and `:399-402`
- `src/pages/calculadoras/deposito-a-plazo.astro:554-557`
- `src/pages/calculadoras/interes-compuesto.astro:608-611`

So a real `item_id` value looks like `/calculadoras/sueldo-liquido/` — a
site-relative path with a leading and trailing slash — not a bare kebab
token. There is a second branch in `ResumeWidget.astro:154-160`
(`item_type: "page"`) that sends `item_url` instead of `item_id`; `item_url`
isn't in the `resume_click` allowlist, so it's already silently dropped by
the existing allowlist filter, independent of this plan (leave that alone —
out of scope here; if it's intentional dead code, that's a separate,
lower-priority cleanup, not this plan's concern).

**No other call site produces `item_id`** — there is currently no "post" or
"guide" `item_id` emitter anywhere in `src/`, despite that being the
scenario 038's original text described.

## The three options

### Option 1 — Exclude `item_id` from `FREE_FORM_TOKEN_KEYS` permanently

Leave it unconstrained (as it is today). Simplest, zero risk of breaking
data, but the poisoning/cardinality concern stays open for this dimension —
a bot could still submit arbitrary garbage as `item_id`.

### Option 2 — Accept the path shape in validation (recommended)

Add a **second** regex, applied only to `item_id`, that accepts both a bare
kebab token *and* a site-relative path:

```ts
/** item_id may be a bare kebab token OR a site-relative path
 *  (e.g. "/calculadoras/sueldo-liquido/") — the ResumeWidget calculator
 *  case stores window.location.pathname, not a slug. See plan 043. */
const SAFE_ITEM_ID_RE = /^\/?[a-z0-9]+(?:[-_/][a-z0-9]+)*\/?$/;
```

This still rejects garbage, unicode, uppercase, spaces, and path-traversal
characters (`.` is not in the character class, so `../etc` and `//..//` are
both rejected), while accepting the real pathname shape in production
today. It bounds cardinality by the site's actual route structure (finite),
not truly unbounded input. Trade-off: it means codifying "item_id is
sometimes a URL path" as an accepted, permanent data shape — future
`item_id` emitters (e.g. a real "post"/"guide" resume feature) would need to
either match this same pattern or get their own carve-out.

### Option 3 — Fix the source: emit a calculator slug instead of a pathname

Change `ResumeWidget.astro` / the four `saveCalculatorResult(...)` call
sites to pass a stable calculator slug (e.g. derived from the page's own
`calculator_slug` constant already used elsewhere on each page — grep
`calculator_slug =` in each of the four files) instead of
`window.location.pathname`. Then `item_id` can use the same strict
`SAFE_TOKEN_RE` as the other three dimensions in plan 038 — no second regex
needed.

This is arguably the "correct" fix (an identifier dimension shouldn't be a
full URL), but:
- Touches `ResumeWidget.astro` and `resumeState.ts`, which plan 038
  explicitly scoped out.
- Changes `item_id`'s semantics going forward — any dashboard, export, or
  ad-hoc query that currently expects `item_id` to be a pathname for
  `item_type: "calculator"` events will see a discontinuity at the
  deploy boundary (old data = paths, new data = slugs). Check whether
  `workers/analytics-collector/src/index.ts`'s export/aggregation logic (the
  weekly scorecard) keys anything by `item_id` for `item_type: "calculator"`
  before choosing this option — if it does, the discontinuity needs a note
  in the scorecard's changelog, not just the code diff.
- `calcLink.href = data.calculator.id;` (`ResumeWidget.astro:121`) **also
  uses this value as the link target** — if `id` becomes a slug instead of a
  pathname, this line must change too (e.g. build the href from a
  slug→path map, or keep a separate `href` field distinct from the
  analytics `id`). This is the detail most likely to make Option 3 larger
  than it first looks; budget for it if this option is chosen.

## Recommendation

**Option 2** is the lower-maintenance fix, consistent with 038's own
philosophy ("the format constraint is the lower-maintenance fix... a full
slug allowlist would stop that too but couples the worker to the calculator
catalog"). It closes the actual security/cardinality gap without touching
files outside the analytics validation boundary or risking the
`calcLink.href` regression called out under Option 3. Option 3 is the more
"correct" long-term fix if the maintainer independently wants `item_id` to
mean "identifier", not "path" — but that's a broader product call this plan
doesn't make unilaterally.

## Steps

### Step 1: Record the decision (human gate — do not skip)

The repo maintainer picks Option 1, 2, or 3 above and records it here (edit
this file, replace this paragraph with "**Decision: Option N**, recorded by
<name>, <date>"). An executor agent must STOP here and report back if this
line has not been filled in — do not infer or guess the choice.

**Decision:** _(not yet recorded)_

### Step 2: Implement the chosen option

- **If Option 1**: no code change needed beyond leaving `item_id` out of
  `FREE_FORM_TOKEN_KEYS` (already the state after 038). Close this plan as
  "resolved — no-op" and record the reasoning in Done criteria.
- **If Option 2**: add `SAFE_ITEM_ID_RE` (as drafted above) next to the
  existing `FREE_FORM_TOKEN_KEYS` / `SAFE_TOKEN_RE` constants in both
  `workers/analytics-collector/src/index.ts` and `src/utils/analytics.ts`.
  In the worker's `validateEventPayload`, after the existing
  `FREE_FORM_TOKEN_KEYS` check (which now still excludes `item_id`), add an
  `item_id`-specific check using `SAFE_ITEM_ID_RE` with the same
  reject-the-payload convention. Mirror it in `sanitizeAnalyticsEvent` with
  the drop convention. Do not add `item_id` to `FREE_FORM_TOKEN_KEYS` itself
  — keep it as a separate, explicit check so the two regexes stay visually
  distinct in a code review.
- **If Option 3**: change the four `saveCalculatorResult(...)` call sites to
  pass a slug instead of `window.location.pathname`, fix
  `calcLink.href` in `ResumeWidget.astro` to still resolve to a working
  link (see the warning under Option 3 above), then apply `item_id` to the
  existing `SAFE_TOKEN_RE`/`FREE_FORM_TOKEN_KEYS` from plan 038 exactly like
  the other three keys. **Conflicting test warning**: plan 038 added a
  regression test asserting a path-shaped `item_id`
  (`/calculadoras/sueldo-liquido/`) is `valid === true` / preserved — under
  Option 3 that value would no longer be produced and the assertion should
  flip to `valid === false` (or be replaced with a slug-shaped positive
  case). Update that test in the same commit; do not leave both assertions
  in place.

### Step 3: Tests

Model on plan 038's Step 3/4 pattern (`tests/workers/analytics-collector/schema.test.ts`,
`tests/integration/analytics-sanitizer.test.ts`). Minimum cases regardless of
option chosen:
- The real production shape for `item_id` (pathname, e.g.
  `/calculadoras/sueldo-liquido/`) — valid or invalid per the chosen option,
  asserted explicitly (don't just assert the happy path; assert the
  documented boundary).
- A garbage/unicode/uppercase `item_id` → rejected/dropped (same negative
  cases as 038's other three keys), unless Option 1 was chosen (nothing to
  test — document the no-op instead).

**Verify**:
`pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts tests/integration/analytics-sanitizer.test.ts`

### Step 4: Full verification gates

Same as plan 038's Commands table:
- `pnpm test` → exit 0
- `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0
- `astro check` → 0 errors
- `pnpm exec eslint workers/analytics-collector/src/index.ts src/utils/analytics.ts` (and `src/components/ResumeWidget.astro`, `src/utils/resumeState.ts` if Option 3) → exit 0
- `pnpm run format:check` → exit 0

## Scope

**In scope**:
- `workers/analytics-collector/src/index.ts`, `src/utils/analytics.ts`
  (all options)
- `tests/workers/analytics-collector/schema.test.ts`,
  `tests/integration/analytics-sanitizer.test.ts` (all options)
- `src/components/ResumeWidget.astro`, `src/utils/resumeState.ts`
  (Option 3 **only**)

**Out of scope regardless of option**:
- `calculator_slug`, `rule_id`, `action_id` — already handled by plan 038;
  do not re-touch.
- The `item_url` / `item_type: "page"` branch in `ResumeWidget.astro` — its
  pre-existing silent-drop behavior is unrelated to this plan.
- The rate limiter, CORS, `ENUM_VALUES`, `FORBIDDEN_KEYS`,
  `EVENT_ALLOWLIST` shape.

## Git workflow

- Branch: `advisor/043-analytics-item-id-shape-decision`
- Conventional commits, e.g.
  `fix(security): validar la forma de item_id en analytics (opción N)`
- Do NOT push or open a PR unless the operator instructed it.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Step 1's decision line is filled in with a recorded option and date.
- [ ] The implementation matches the chosen option exactly (see Step 2 per-option criteria above).
- [ ] New tests cover the real production `item_id` shape and at least one garbage case (or Option 1's no-op is documented instead).
- [ ] `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts tests/integration/analytics-sanitizer.test.ts` passes.
- [ ] `pnpm test` exits 0.
- [ ] `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0; `astro check` → 0 errors; scoped eslint exits 0; `pnpm run format:check` exits 0.
- [ ] `git status` shows only in-scope files modified (per the chosen option).
- [ ] If Option 3: `calcLink.href` on the calculator resume link still resolves to a working URL — verify manually or via an integration test that clicking the resume-calculator link navigates correctly.
- [ ] `plans/README.md` status row for 043 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1's decision line is empty when an executor reaches Step 2.
- The `item_id` emitter(s) found in a fresh grep
  (`grep -rn "item_id" src/ --include=*.ts --include=*.astro`) no longer
  match "Current state" above (e.g. a new emitter appeared with yet another
  shape) — re-verify before implementing any option.
- Option 3 is chosen and the weekly scorecard/export logic in
  `workers/analytics-collector/src/index.ts` keys aggregates by `item_id`
  for `item_type: "calculator"` in a way that would silently merge or split
  historical data across the pathname→slug transition — flag this to the
  maintainer before proceeding; it may need a scorecard changelog note or a
  migration window, not just a code change.
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Whichever option is chosen, update plan 038's "Maintenance notes" to
  cross-reference the resolution (038 currently says "item_id remains fully
  unconstrained after this plan — see plan 043").
- If Option 2, the two-regex scheme (`SAFE_TOKEN_RE` for three keys,
  `SAFE_ITEM_ID_RE` for `item_id`) is intentional and should stay
  documented inline — a future maintainer collapsing them into one regex
  would silently loosen `calculator_slug`/`rule_id`/`action_id` to also
  accept paths, which is not desired (those three are confirmed pure
  tokens; keep them maximally strict).
- If Option 3, watch for any other place `data.calculator.id` /
  `getResumeData().calculator.id` is read besides `ResumeWidget.astro`
  (grep `resumeState` importers) before assuming the href fix is the only
  consumer.
