# Plan 097: Enforce byte-accurate bounded body read on worker-v2 ingestion

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/src/index.ts tests/workers/analytics-collector/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

The new hot ingestion path (`worker-v2.ts`, live via `wrangler.toml` `main`)
buffers the full request body with `await request.text()` and checks
`text.length > MAX_BODY_SIZE`. `string.length` counts UTF-16 units, not bytes,
and the whole body is materialized before any rejection — reintroducing the
memory-retention issue that ADR-20260906-analytics-body-byte-limit closed on
the legacy path. A multibyte payload under the char count but over 2048 bytes
passes; oversized streams are fully buffered. Restoring the byte-exact bounded
reader on the live path closes the regression with no contract change.

## Current state

Relevant files and roles:

- `workers/analytics-collector/src/worker-v2.ts` — live ingestion (lines 444–458)
- `workers/analytics-collector/src/index.ts` — legacy bounded reader (lines ~924–965)
- `tests/workers/analytics-collector/root-cause.test.ts` — 4 v2 tests, none on size/unicode
- `docs/adr/ADR-20260906-analytics-body-byte-limit.md` — byte-limit decision (stale: describes legacy path only)

Excerpts as of `0e506a8b`:

`worker-v2.ts:1-17` imports the constant but not the reader:

```ts
import {
  aggregateWindow,
  ALLOWED_ORIGIN,
  buildExportArtifact,
  calendarDateInTimeZone,
  counterPrefixForExportWeek,
  isoWeekToDateRangeUTC,
  MAX_BODY_SIZE,
  ...
} from "./index";
```

`worker-v2.ts:444-458` (vulnerable shape):

```ts
const contentLength = request.headers.get("Content-Length");
if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
  return new Response(null, { status: 413, headers: corsHeaders() });
}

let body: unknown;
try {
  const text = await request.text();
  if (text.length > MAX_BODY_SIZE) {
    return new Response(null, { status: 413, headers: corsHeaders() });
  }
  body = JSON.parse(text);
} catch {
  return new Response(null, { status: 400, headers: corsHeaders() });
}
```

Legacy byte-exact reader in `index.ts:924-965` counts `Uint8Array.byteLength`,
drops over-limit chunks, cancels the stream, decodes once, and preserves the
400/413/422 split asserted in `tests/workers/analytics-collector/schema.test.ts`.

Repo conventions: worker code is TypeScript with per-worker `tsconfig.json`
(root `tsconfig.json` excludes `workers/**`, so `astro check` does not cover
workers); ad-hoc worker typecheck is `npx tsc --noEmit -p
workers/analytics-collector/tsconfig.json`. No `console` restriction issue
(workers exempt from `no-console`). Conventional commits (e.g.
`fix(analytics-collector): ...`).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Worker typecheck | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` | declared | exit 0, no errors |
| Focused tests | `pnpm exec vitest run tests/workers/analytics-collector/root-cause.test.ts tests/workers/analytics-collector/schema.test.ts` | declared | all pass |
| Lint (scoped) | `pnpm exec eslint workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/src/index.ts` | declared | exit 0 |
| Format check (scoped) | `pnpm exec prettier --check workers/analytics-collector/src/worker-v2.ts tests/workers/analytics-collector/root-cause.test.ts` | declared | exit 0 |

## Suggested executor toolkit

- None required beyond repo toolchain.

## Scope

**In scope** (the only files you should modify):

- `workers/analytics-collector/src/worker-v2.ts`
- `workers/analytics-collector/src/index.ts` (only to export/share the bounded reader if not already exported; no behavior change to legacy path)
- `tests/workers/analytics-collector/root-cause.test.ts` (new guard tests)

**Out of scope** (do NOT touch, even though they look related):

- `workers/analytics-collector/wrangler.toml` — dead-var cleanup is plan 098.
- `workers/analytics-collector/src/index.ts` fetch/export/rate-limit logic — plan 098/099 territory.
- `docs/adr/ADR-20260906-analytics-body-byte-limit.md` — ADR amendment is plan 098.
- Any change to 400/413/422 status semantics or `MAX_BODY_SIZE` value (2048).

## Git workflow

- Branch: `advisor/097-worker-v2-bounded-body`
- Commit per logical unit; message style: conventional commits, e.g. `fix(analytics-collector): byte-accurate bounded body read in worker-v2`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a green baseline

Run the Install row, then worker typecheck and focused tests on the unmodified
checkout.

- If all pass: record that, proceed to Step 1.
- If a `declared` command does not exist or fails on the unmodified checkout:
  **STOP and report** with command + exact output. Do not "fix" the build to
  get moving.

**Verify**: every command in the table matches its expected result on the
unmodified checkout.

### Step 1: Share the bounded byte reader with worker-v2

In `workers/analytics-collector/src/index.ts`, confirm the bounded reader
helper name and export it (export-only change; do not alter its logic). In
`worker-v2.ts`, replace the `await request.text()` + `text.length` block with
a call to that helper, keeping the surrounding contract identical:
Content-Length pre-check → bounded read → 413 on over-limit → `JSON.parse` →
400 on malformed → existing 422 validation unchanged.

**Verify**: `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0.

### Step 2: Add byte-limit guard tests to root-cause.test.ts

Model after `tests/workers/analytics-collector/schema.test.ts` size/unicode
matrix. Add cases against the v2 fetch handler: exactly MAX bytes → 202;
MAX+1 bytes → 413; multibyte payload over 2048 bytes but under 2048 chars
(e.g. repeated `é`) → 413; lying Content-Length (small header, large body) →
413 via stream accounting; split-multibyte across chunks decodes (no 400
regression). Keep existing 4 tests green.

**Verify**: `pnpm exec vitest run tests/workers/analytics-collector/root-cause.test.ts` → all pass, including ≥4 new tests.

### Step 3: Run full gates for touched area

Run worker typecheck, both collector test files, scoped eslint, scoped
prettier check.

**Verify**: all commands in the table → expected results.

## Test plan

- New tests in `tests/workers/analytics-collector/root-cause.test.ts`: exact
  MAX/MAX+1 bytes, unicode-bytes, split-multibyte decode, early-cancel/lying
  length. Pattern: existing `root-cause.test.ts:160-235` MockKV/MockCounterStub/
  MockRateLimiter harness + `schema.test.ts:1518-1573` size matrix.
- Verification: focused-tests command → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` exits 0
- [ ] Focused vitest command exits 0; ≥4 new byte-limit tests exist and pass
- [ ] `grep -n "await request.text()" workers/analytics-collector/src/worker-v2.ts` returns no matches
- [ ] `grep -n "byteLength\|receivedBytes" workers/analytics-collector/src/worker-v2.ts` returns ≥1 match (shared reader in use)
- [ ] `git diff --name-only 0e506a8b...HEAD` lists only the in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at "Current state" doesn't match live code (drift).
- A step's verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file.
- The shared reader cannot be reused without changing legacy-path behavior
  (assumption false).
- A `declared` command does not exist or fails on the unmodified checkout.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- If `MAX_BODY_SIZE` is ever raised, the new tests pin the boundary — update
  MAX and MAX+1 cases together.
- What a reviewer should scrutinize: that the 400 (malformed) vs 413
  (over-limit) vs 422 (schema-invalid) split is preserved exactly.
- **Deferred:** DO-list pagination, legacy-KV sunset skip, and R2 compact
  writes are plan 099, same export file, intentionally separate.
- **Deferred:** dead `wrangler.toml` vars and ADR amendment are plan 098.
