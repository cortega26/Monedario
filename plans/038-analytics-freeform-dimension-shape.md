# Plan 038: Restringir la forma de las dimensiones libres de analytics (evitar cardinalidad ilimitada y envenenamiento del scorecard)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 520a8685..HEAD -- workers/analytics-collector/src/index.ts src/utils/analytics.ts`
> If either changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition. **This plan shares `index.ts` with plans 036 and 037 — do not
> run those three in parallel.**

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (but see the parallelism note above)
- **Category**: security
- **Planned at**: commit `520a8685`, 2026-07-10

## Why this matters

The analytics ingestion worker validates events against a strict schema, but four
dimensions are **free-form**: `calculator_slug`, `rule_id`, `action_id`,
`item_id`. They are length-capped (200 chars) and PII-key-filtered, but their
*value* is otherwise unconstrained — any string passes. Two consequences:

1. **Scorecard poisoning**: the weekly export keys counters by these values and
   the scorecard drives editorial refresh decisions. A client (or a bot within
   the 30 req/min rate limit) can submit arbitrary `calculator_slug` values that
   pass `validateExportArtifact` and pollute the aggregates.
2. **Unbounded KV cardinality**: each distinct value mints a distinct KV counter
   key with a 35-day TTL, inflating KV storage and the export's key-listing pass.

The project's ADR (`docs/adr/ADR-20260628-first-party-analytics.md`) explicitly
accepts *volume* abuse (mitigated by the rate limit) and KV eventual consistency
— but it does **not** address the *shape/integrity* of these free-form values.
This plan constrains their character set.

**Honest scope**: this kills garbage, oversized, and unbounded-cardinality
injection (random/binary/unicode values). It does **not** stop an attacker from
inflating the count of a *valid-looking* slug (e.g. spamming
`calculator_slug=sueldo-liquido`) — that is volume abuse, already bounded by the
accepted rate limit. A full slug allowlist would stop that too but couples the
worker to the calculator catalog (a new calculator's events would be dropped
until the worker redeploys); the format constraint is the lower-maintenance fix
for the actual new gap. Layering a slug allowlist later is a maintainer decision,
not part of this plan.

## Current state

Real values (verified in the codebase) are lowercase kebab tokens:
`calculator_slug` e.g. `"sueldo-liquido"`, `"impuesto-segunda-categoria"`;
`rule_id` e.g. `"sl-to-apv-midhigh"`; `item_id` is a calculator id or a blog/guide
slug (longest observed **62 chars**:
`ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`); `position` is
numeric. **No real value contains an uppercase letter** — so a lowercase-only
charset is safe, and it also prevents `Sueldo` vs `sueldo` becoming two keys. The
existing 200-char cap already bounds length (62 < 200), so this plan constrains
**charset only**.

**`workers/analytics-collector/src/index.ts`** — the per-param validation loop in
`validateEventPayload` (around lines 188-215). This is the security trust
boundary (server-side re-validation):

```ts
  // Validate each param
  const clean: Record<string, string | number | boolean> = {};
  for (const key of allowedKeys) {
    const value = rawParams[key];
    if (value === undefined) continue;

    const t = typeof value;
    if (t !== "string" && t !== "number" && t !== "boolean") return { valid: false };

    if (t === "string") {
      const s = value as string;
      if (s.length > MAX_STRING_LENGTH) return { valid: false };
      if (s.length === 0) continue; // skip empty strings
      clean[key] = s;
    } else {
      clean[key] = value as number | boolean;
    }

    // Enum validation
    const allowedEnums = ENUM_VALUES[key];
    if (allowedEnums) {
      const strVal = String(clean[key]);
      if (!allowedEnums.has(strVal)) return { valid: false };
    }
  }
```

**`src/utils/analytics.ts`** — the client-side `sanitizeAnalyticsEvent` mirrors
the worker (dual enforcement; the client *drops* bad values rather than rejecting
the whole event), around lines 174-200:

```ts
  for (const [key, value] of Object.entries(params)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (!allowedKeys.has(key)) continue;
    if (value === undefined || value === null) continue;
    const t = typeof value;
    if (t !== "string" && t !== "number" && t !== "boolean") continue;

    let finalValue: string | number | boolean;
    if (t === "string") {
      finalValue = (value as string).slice(0, MAX_STRING_LENGTH);
    } else {
      finalValue = value as number | boolean;
    }

    if (ENUM_VALUES[key]) {
      if (!ENUM_VALUES[key].has(String(finalValue))) continue;
    }

    clean[key] = finalValue;
  }
```

**Convention to match**: the worker is the trust boundary → an invalid value
**rejects** the whole payload (`return { valid: false }`). The client is
convenience → an invalid value is **dropped** (`continue`). Preserve each file's
existing behavior. `position` is numeric and is **not** constrained by this plan.

## Commands you will need

| Purpose          | Command                                                              | Expected                 |
|------------------|---------------------------------------------------------------------|--------------------------|
| Worker tests     | `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` | all pass, incl. new     |
| Client san. test | `pnpm exec vitest run tests/integration/analytics-sanitizer.test.ts` | all pass, incl. new     |
| Full unit tests  | `pnpm test`                                                         | exit 0                   |
| Typecheck worker | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json`     | exit 0, 0 errors         |
| Typecheck client | `astro check`                                                       | 0 errors                 |
| Lint (scoped)    | `pnpm exec eslint workers/analytics-collector/src/index.ts src/utils/analytics.ts` | exit 0    |

> **Two typecheck gates**: this plan changes both the worker (`index.ts`) and a
> `src/` file (`analytics.ts`). `astro check` (root `tsconfig.json`) covers
> `src/**` but **excludes `workers/**`**, so the worker change needs the worker's
> own tsconfig. Run both.
| Format           | `pnpm run format:check`                                             | exit 0                   |

## Scope

**In scope** (the only files you should modify):
- `workers/analytics-collector/src/index.ts` (`validateEventPayload` only)
- `src/utils/analytics.ts` (`sanitizeAnalyticsEvent` only)
- `tests/workers/analytics-collector/schema.test.ts` (add cases)
- `tests/integration/analytics-sanitizer.test.ts` (add cases)

**Out of scope** (do NOT touch):
- `sanitizeCollectorEvent` (the lenient cron-path helper) — it does not gate
  ingestion; values reaching the export were already validated at ingest.
- `ENUM_VALUES`, `FORBIDDEN_KEYS`, `EVENT_ALLOWLIST` — unchanged.
- `position` handling — numeric, not a free-form token.
- The rate limiter and CORS — unrelated to this gap.

## Git workflow

- Branch: `advisor/038-analytics-freeform-dimension-shape`
- Conventional commits, e.g.
  `fix(security): validar la forma de dimensiones libres de analytics`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the shared constants and the check to the worker

In `workers/analytics-collector/src/index.ts`, add near the other constants (e.g.
just below `FORBIDDEN_KEYS` / `ENUM_VALUES`):

```ts
/** Free-form dimensions (no enum) — constrained to safe lowercase tokens. */
const FREE_FORM_TOKEN_KEYS = new Set([
  "calculator_slug",
  "rule_id",
  "action_id",
  "item_id",
]);
/** Lowercase alnum start, then kebab/snake. Bounds cardinality; blocks garbage. */
const SAFE_TOKEN_RE = /^[a-z0-9][a-z0-9_-]*$/;
```

Then in the `validateEventPayload` loop, **after** the enum-validation block, add:

```ts
    // Free-form token dimensions must match a safe shape (reject the payload).
    if (
      FREE_FORM_TOKEN_KEYS.has(key) &&
      typeof clean[key] === "string" &&
      !SAFE_TOKEN_RE.test(clean[key] as string)
    ) {
      return { valid: false };
    }
```

**Verify**: `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0
(the worker's own tsconfig — `astro check` does not typecheck `workers/**`).

### Step 2: Mirror the check in the client sanitizer (drop, don't reject)

In `src/utils/analytics.ts`, add the same two constants near the top-level
constants (`MAX_STRING_LENGTH`, `EVENT_ALLOWLIST`, …). Then in
`sanitizeAnalyticsEvent`, **after** the enum-validation block and **before**
`clean[key] = finalValue;`, add:

```ts
    if (
      FREE_FORM_TOKEN_KEYS.has(key) &&
      typeof finalValue === "string" &&
      !SAFE_TOKEN_RE.test(finalValue)
    ) {
      continue; // drop the invalid value; keep the event
    }
```

Keep the constants identical to the worker's (they are intentionally duplicated —
the worker cannot import from `src/`).

**Verify**: `pnpm exec eslint src/utils/analytics.ts` → exit 0.

### Step 3: Add worker tests

In `tests/workers/analytics-collector/schema.test.ts`, add `validateEventPayload`
cases (model on the existing `validateEventPayload` tests in that file):

- Valid short slug → `valid === true`:
  `{ event: "calculator_view", params: { page_type: "calculator", calculator_slug: "sueldo-liquido" } }`.
- Valid **62-char** slug for `item_id` → `valid === true`:
  `{ event: "resume_click", params: { item_type: "post", item_id: "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026" } }`.
- Garbage slug with a space → `valid === false`:
  `calculator_slug: "sueldo liquido"`.
- Slug with path/punctuation → `valid === false`: `calculator_slug: "../etc"`.
- Uppercase slug → `valid === false`: `calculator_slug: "Sueldo"`.
- Unicode slug → `valid === false`: `calculator_slug: "café☕"`.

### Step 4: Add client sanitizer tests

In `tests/integration/analytics-sanitizer.test.ts`, add `sanitizeAnalyticsEvent`
cases (model on the existing tests there):

- A valid slug is preserved in `result.params.calculator_slug`.
- An invalid slug (e.g. `"sueldo liquido"`) is **dropped** — the returned event
  is non-null and `result.params.calculator_slug` is `undefined`.

**Verify**: both test files pass —
`pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts tests/integration/analytics-sanitizer.test.ts`.

## Test plan

- Worker: the six `validateEventPayload` cases above; the 62-char case is the
  regression guard against the "length bound drops real long slugs" trap.
- Client: valid-preserved + invalid-dropped.
- Verification: `pnpm test` → exit 0 with new tests passing; `astro check` → 0.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "SAFE_TOKEN_RE" workers/analytics-collector/src/index.ts src/utils/analytics.ts` shows it defined and used in both files.
- [ ] `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts tests/integration/analytics-sanitizer.test.ts` passes, including the 62-char-slug-accepted and garbage-slug-rejected cases.
- [ ] `pnpm test` exits 0.
- [ ] `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0 (worker) **and** `astro check` → 0 errors (client `analytics.ts`); scoped eslint exits 0; `pnpm run format:check` exits 0.
- [ ] `git status` shows only the four in-scope files modified.
- [ ] `plans/README.md` status row for 038 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `validateEventPayload` or `sanitizeAnalyticsEvent` no longer matches the
  "Current state" excerpts.
- A real event in the codebase uses one of the four free-form keys with a value
  that `SAFE_TOKEN_RE` would reject (grep the client call sites:
  `grep -rn "calculator_slug\|rule_id\|action_id\|item_id" src/ --include=*.ts --include=*.astro`).
  If you find an uppercase or non-token real value, STOP — the regex would drop
  real data (the exact bug class this plan avoids); report it.
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- The two constant definitions are intentionally duplicated across the worker and
  `src/utils/analytics.ts` (separate build targets; the worker cannot import from
  `src/`). If the token rules change, update **both** — a divergence means the
  client sends values the worker rejects (silent analytics loss).
- This does not stop volume-inflation of a valid slug (rate-limit's job, accepted
  in the ADR). If scorecard integrity later needs a hard guarantee, a slug
  allowlist derived from `src/pages/calculadoras/*` is the next lever — but weigh
  the catalog-drift maintenance cost first.
- A reviewer should confirm `position` (numeric) and the enum dimensions are
  untouched, and that the worker *rejects* while the client *drops*.
