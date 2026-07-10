# Plan 037: Recibir el secreto del export manual por header, no por query string (evitar fuga en logs)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 520a8685..HEAD -- workers/analytics-collector/src/index.ts workers/analytics-collector/wrangler.toml`
> If either changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition. **This plan shares `index.ts` with plans 036 and 038 — do not
> run those three in parallel.**

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (but see the parallelism note above)
- **Category**: security
- **Planned at**: commit `520a8685`, 2026-07-10

## Why this matters

The analytics worker exposes an operator-only manual export trigger:
`GET /api/analytics/export`. It authenticates by reading a secret **from the URL
query string** (`?secret=…`). The comparison itself is done well (presence
required, constant-time, rate-limited, `Access-Control-Allow-Origin` pinned to
monedario.cl) — the weakness is purely **transport**: secrets in URLs leak
through channels that request bodies and headers do not — Cloudflare request logs
/ Logpush, any intermediary proxy, browser history, and the `Referer` header on
any outbound link from the response. The secret gates an on-demand full-KV → R2
export, so disclosure lets a third party trigger arbitrary-week exports.

Moving the secret to an `Authorization: Bearer` header removes it from the URL.
Because the value may already have transited Cloudflare with logging enabled,
this change is only complete once `EXPORT_SECRET` is **rotated** (see Step 4).

## Current state

**`workers/analytics-collector/src/index.ts`** — `handleManualExport` reads the
secret from the query string (around lines 716-734):

```ts
async function handleManualExport(request: Request, env: Env): Promise<Response> {
  if (!env.EXPORT_SECRET) {
    return jsonResponse({ error: "export_not_configured" }, 503);
  }

  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  if (!providedSecret) {
    return jsonResponse({ error: "missing_secret" }, 401);
  }
  if (!constantTimeEqual(providedSecret, env.EXPORT_SECRET)) {
    return jsonResponse({ error: "invalid_secret" }, 403);
  }

  const requestedWeek = url.searchParams.get("week");
  const week = requestedWeek ?? previousCompleteISOWeekInTz();
  // ... unchanged below ...
```

The route is dispatched in the default `fetch` handler (around line 774):

```ts
    if (request.method === "GET" && url.pathname === "/api/analytics/export") {
      return handleManualExport(request, env);
    }
```

`constantTimeEqual` (same file, ~644) and `jsonResponse` (~655) already exist —
reuse them unchanged. `week` is **not** sensitive and stays a query param.

**`workers/analytics-collector/wrangler.toml`** — documents the query-param form
(around lines 75-76):

```
#   EXPORT_SECRET         — String arbitrario que protege el endpoint manual
#                           de export (GET /api/analytics/export?secret=...).
```

**No automated caller passes `?secret=`** — verified: the only invocation is a
manual operator `curl`, documented in
`docs/backlog/PLAN-analytics-export-manual-trigger-2026-06-30.md`. So changing
the auth mechanism breaks no committed script or workflow.

**`EXPORT_SECRET` is a Worker secret** set via
`wrangler secret put EXPORT_SECRET --config workers/analytics-collector/wrangler.toml`.
Never print or commit its value; this plan references it by name only.

## Commands you will need

| Purpose        | Command                                                              | Expected                 |
|----------------|---------------------------------------------------------------------|--------------------------|
| Worker tests   | `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` | all pass, incl. updated |
| Typecheck (worker) | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` | exit 0, 0 errors        |
| Lint (scoped)  | `pnpm exec eslint workers/analytics-collector/src/index.ts`         | exit 0                   |

> **Typecheck note**: `astro check` (root `tsconfig.json`) **excludes
> `workers/**`** and is not a sound typecheck for worker changes. Use the worker's
> own tsconfig above; confirm it exits 0 on the unmodified repo first.
| Format         | `pnpm run format:check`                                             | exit 0                   |

## Scope

**In scope** (the only files you should modify):
- `workers/analytics-collector/src/index.ts` (`handleManualExport` only)
- `workers/analytics-collector/wrangler.toml` (doc comment)
- `docs/backlog/PLAN-analytics-export-manual-trigger-2026-06-30.md` (curl example)
- `tests/workers/analytics-collector/schema.test.ts` (update/add auth tests)

**Out of scope** (do NOT touch):
- The ingestion path, `runExport`, rate limiting, CORS — unchanged.
- The `scheduled` cron handler — that is plan 036.
- Any real secret value — never appears in code, tests, docs, or commit messages.

## Git workflow

- Branch: `advisor/037-analytics-export-secret-header`
- Conventional commits, e.g.
  `fix(security): leer el secreto del export por Authorization header`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Read the secret from the `Authorization` header

In `handleManualExport`, keep the `if (!env.EXPORT_SECRET)` guard and the
`const url = new URL(request.url);` line (still needed for `week`). Replace the
query-string secret read with a Bearer-header read:

```ts
  const authHeader = request.headers.get("Authorization");
  const providedSecret =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : null;
  if (!providedSecret) {
    return jsonResponse({ error: "missing_secret" }, 401);
  }
  if (!constantTimeEqual(providedSecret, env.EXPORT_SECRET)) {
    return jsonResponse({ error: "invalid_secret" }, 403);
  }
```

Leave the `requestedWeek` / `week` logic and everything below unchanged.

**Verify**: `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0;
`grep -n "searchParams.get(\"secret\")" workers/analytics-collector/src/index.ts`
→ **no matches**.

### Step 2: Update the wrangler.toml doc comment

Change the `?secret=...` example to the header form, e.g.:

```
#   EXPORT_SECRET         — String arbitrario que protege el endpoint manual
#                           de export. Se envía por header:
#                           Authorization: Bearer <EXPORT_SECRET>
#                           (GET /api/analytics/export?week=YYYY-Www).
```

### Step 3: Update the operator curl example in the plan doc

In `docs/backlog/PLAN-analytics-export-manual-trigger-2026-06-30.md`, find the
`curl` example(s) that pass `?secret=` and change them to send the header
instead, e.g.:

```
curl -H "Authorization: Bearer $EXPORT_SECRET" \
  "https://<worker-host>/api/analytics/export?week=2026-W28"
```

Use a placeholder (`$EXPORT_SECRET` / `<...>`) — never a real value.
`grep -rn "secret=" docs/backlog/PLAN-analytics-export-manual-trigger-2026-06-30.md`
should return no `?secret=` auth examples afterward.

### Step 4: Update the worker tests (change, don't only add)

In `tests/workers/analytics-collector/schema.test.ts`, locate any existing test
that calls `/api/analytics/export` with `?secret=` and **update** it to send
`Authorization: Bearer <secret>` (so it tests the new behavior, not removed
behavior). Then ensure these cases exist:

- Valid secret via header → `200` (successful export path with a mock KV/R2).
- Missing `Authorization` header → `401` (`missing_secret`).
- Wrong secret via header → `403` (`invalid_secret`).
- `?secret=<correct>` in the query string with **no** header → `401` (the old
  channel no longer authenticates).

Model request construction on the existing tests in that file (they already build
`Request` objects and call `analyticsCollector.fetch`). If no export-auth test
exists yet, add the four cases above.

**Verify**: `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` → all pass.

## Test plan

- Updated/added auth tests as in Step 4 — the `?secret=` → `401` case is the
  regression guard that the old transport is truly gone.
- Verification: `pnpm test` → exit 0;
  `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "searchParams.get(\"secret\")" workers/analytics-collector/src/index.ts` → no matches.
- [ ] `grep -n "Authorization" workers/analytics-collector/src/index.ts` shows the Bearer read in `handleManualExport`.
- [ ] `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` passes, including a test asserting `?secret=` no longer authenticates.
- [ ] `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0 (`astro check` does NOT cover `workers/**`); scoped eslint exits 0; `pnpm run format:check` exits 0.
- [ ] No real secret value appears in any changed file (`git diff` shows placeholders only).
- [ ] `git status` shows only the four in-scope files modified.
- [ ] `plans/README.md` status row for 037 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `handleManualExport` no longer matches the "Current state" excerpt.
- You find an automated caller (script/workflow) that passes `?secret=` to this
  endpoint — changing the mechanism would break it; report it instead of editing
  that caller.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- **Rotation is part of the fix, not optional**: after this lands, the operator
  must rotate `EXPORT_SECRET`
  (`wrangler secret put EXPORT_SECRET --config workers/analytics-collector/wrangler.toml`)
  because the previous value may have been logged while it was a query param.
  Flag this explicitly in the PR description so it is not forgotten. (An executor
  agent cannot rotate a Worker secret — this is a human step.)
- A reviewer should scrutinize that `week` remained a query param (non-sensitive)
  and that the constant-time compare and rate limiting are unchanged.
- If a future automated trigger is added, it must send the header, not the query
  param.
