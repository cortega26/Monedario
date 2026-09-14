# Plan 098: Harden worker-v2 config and input validation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 79877da6..HEAD -- workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/wrangler.toml docs/adr/ADR-20260628-first-party-analytics.md tests/workers/analytics-collector/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/archive/097-worker-v2-bounded-body.md (DONE 2026-09-14, merge `67487da9`; same file; run after 097 to avoid merge conflicts)
- **Category**: security
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `79877da6`, 2026-09-14 — plan 097 landed (merge
  `67487da9`); excerpts below re-read against live code, all four findings
  intact (only line numbers shifted)
- **Issue**: —

## Why this matters

Four small validation gaps share one file and one incident story. `wrangler.toml`
declares `MAX_BODY_SIZE`/`ALLOWED_ORIGIN` vars that no code reads (operators
editing them during an incident see no effect). `SCHEMA_VERSION` is parsed
without NaN/range checks, so a typo silently flips the export taxonomy to the
v1 legacy branch. The manual-export week regex accepts `W99`, letting an
authenticated caller create arbitrary R2 keys. Rate-limit keys trust
`X-Forwarded-For` fallback, letting a client rotate identity past the 30/min
guard. Each fix is a few lines; together they remove a class of
misconfiguration-driven incidents.

## Current state

Files and roles:

- `workers/analytics-collector/src/worker-v2.ts` — live worker (Env, export, fetch)
- `workers/analytics-collector/wrangler.toml` — bindings, crons, vars
- `docs/adr/ADR-20260628-first-party-analytics.md` — architecture (still
  describes KV counters; stale after DO migration)
- `tests/workers/analytics-collector/root-cause.test.ts` — v2 tests (9: 4
  root-cause + 5 byte-limit guards added by 097)

Excerpts as of `79877da6` (re-read after 097 landed; 097 added the
`readBoundedBodyText` import at line 13 and converted `DurableCounterRow` to a
type alias — neither touches the regions below):

`worker-v2.ts:3-18` imports constants instead of env vars:

```ts
import {
  aggregateWindow,
  ALLOWED_ORIGIN,
  ...
  MAX_BODY_SIZE,
  ...
} from "./index";
```
(`readBoundedBodyText` is also imported since 097 — unrelated to this plan; do
not touch the body-reader call.)

`worker-v2.ts:37-48` `Env` has no `MAX_BODY_SIZE`/`ALLOWED_ORIGIN` fields:

```ts
export interface Env {
  ANALYTICS_TELEMETRY: KVNamespace;
  ANALYTICS_COUNTERS: CounterNamespace;
  ANALYTICS_RATE_LIMITER: RateLimitBinding;
  ANALYTICS_EXPORTS: R2Bucket;
  ANALYTICS_DISABLED?: string;
  SCHEMA_VERSION?: string;
  EXPORT_TIMEZONE?: string;
  COUNTER_KEY_CUTOVER_AT?: string;
  EXPORT_SECRET?: string;
}
```

`wrangler.toml:54-63`:

```toml
[vars]
SCHEMA_VERSION = "2"
EXPORT_TIMEZONE = "America/Santiago"
COUNTER_KEY_CUTOVER_AT = "2026-07-20T04:00:00Z"

MAX_BODY_SIZE = "2048"
ALLOWED_ORIGIN = "https://monedario.cl"
```

`worker-v2.ts:318`: `const schemaVersion = parseInt(env.SCHEMA_VERSION ?? "2", 10);`
then `worker-v2.ts:336-341` branches on it (NaN → legacy v1 branch silently).

`worker-v2.ts:388`: `if (!/^\d{4}-W\d{2}$/.test(week))` — no 01–53 range check.

`worker-v2.ts:392-395` and `:469-472`:

```ts
const ip =
  request.headers.get("CF-Connecting-IP") ??
  request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
  "unknown";
```

Conventions: fail-closed validation with generic `jsonResponse({error})`
codes (`missing_secret`/`invalid_secret`/`invalid_week` pattern); worker
typecheck via `npx tsc --noEmit -p
workers/analytics-collector/tsconfig.json`; conventional commits.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Worker typecheck | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/workers/analytics-collector/root-cause.test.ts` | declared | all pass |
| Lint (scoped) | `pnpm exec eslint workers/analytics-collector/src/worker-v2.ts` | declared | exit 0 |
| Format check (scoped) | `pnpm exec prettier --check workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/wrangler.toml docs/adr/ADR-20260628-first-party-analytics.md` | declared | exit 0 |

## Scope

**In scope**:

- `workers/analytics-collector/src/worker-v2.ts`
- `workers/analytics-collector/wrangler.toml`
- `docs/adr/ADR-20260628-first-party-analytics.md` (short amendment/supersede note only)
- `tests/workers/analytics-collector/root-cause.test.ts` (validation tests)

**Out of scope**:

- Body-reader logic (plan 097 owns it; do not re-touch).
- Export pagination/sunset/compact (plan 099).
- Allowlist/taxonomy content (plan 100).
- Any behavior change to rate-limit values (30/60) or CORS origins.

## Git workflow

- Branch: `advisor/098-worker-v2-config-validation`
- Commits: e.g. `fix(analytics-collector): validate schema version, week range, and rate-limit identity`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 0: Establish a green baseline

Run Install, typecheck, focused tests unmodified. On any `declared` failure
on clean tree: STOP + report exact output.

**Verify**: all table commands pass unmodified (record it).

### Step 1: Single source of truth for body size and origin

Choose one (preferred: read-and-validate env vars with constant fallback, so
`wrangler.toml` stays operative): add `MAX_BODY_SIZE?: string` and
`ALLOWED_ORIGIN?: string` to `Env`, parse/validate at request start
(positive int; valid origin), fall back to imported constants, and use the
resolved values everywhere. Alternative (acceptable): delete the two vars
from `wrangler.toml` and document constants as source of truth. Either way,
no dead config may remain.

**Verify**: typecheck exit 0; `grep -n "MAX_BODY_SIZE\|ALLOWED_ORIGIN" workers/analytics-collector/wrangler.toml workers/analytics-collector/src/worker-v2.ts` shows a consistent story (both wired or vars removed + comment).

### Step 2: Fail-closed SCHEMA_VERSION and week validation

Validate `SCHEMA_VERSION`: `Number.isInteger` + allowlist
`[1, ANALYTICS_SCHEMA_VERSION]` (import the constant); throw/fail before any
listing on invalid. Validate week range 01–53 and that the Monday belongs to
the claimed ISO year before R2 write (reject `W00`/`W54`/`W99` with
`invalid_week` 400).

**Verify**: focused tests pass; add tests: `SCHEMA_VERSION=abc` → throws/400
path (no silent v1 branch); `?week=2026-W99` → 400; `?week=2026-W00` → 400.

### Step 3: Trust only CF-Connecting-IP for limiter keys

Prefer `CF-Connecting-IP` when present; treat missing as single `unknown`
bucket; never use `X-Forwarded-For`. Apply in both fetch and manual-export
key derivations. Document in a code comment that XFF is never trusted behind
Cloudflare.

**Verify**: tests pass; add test with spoofed `X-Forwarded-For` variants
sharing one `CF-Connecting-IP` → single limiter key (assert via MockRateLimiter calls).

### Step 4: Amend the stale analytics ADR

Add a dated amendment section to `ADR-20260628-first-party-analytics.md`:
hot path is now SQLite Durable Object + native rate limiting, KV read-only
with TTL, export mixes both; link plan 097 (byte limit) and this plan;
restate quota rationale and verification gates. Docs-only; no design change.

**Verify**: prettier check on touched files exit 0; `grep -in "durable\|worker-v2" docs/adr/ADR-20260628-first-party-analytics.md` ≥1 match.

## Test plan

- Extend `tests/workers/analytics-collector/root-cause.test.ts`: invalid
  schema version, `W99`/`W00` weeks, XFF-spoof key stability, env-var
  override of body size/origin (whichever Step-1 option chosen).
- Pattern: existing MockKV/MockCounterStub/MockRateLimiter harness.
- Verification: focused-tests command → all pass.

## Done criteria

- [ ] Typecheck exits 0
- [ ] Focused tests exit 0 with ≥3 new validation tests
- [ ] No dead vars: vars either wired through `Env` or removed with comment
- [ ] `SCHEMA_VERSION=abc` cannot silently select legacy branch (test-pinned)
- [ ] `W99`/`W00` rejected 400 (test-pinned)
- [ ] XFF never used as limiter key (`grep -n "X-Forwarded-For" worker-v2.ts` → 0 matches, or comment + no key use)
- [ ] ADR amendment present
- [ ] Diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift in "Current state" excerpts; verification fails twice; out-of-scope
  touch required; assumption false (e.g. dashboard routes already expose DO
  endpoints — then stop: threat model changes, needs new plan); `declared`
  baseline broken.

## Maintenance notes

- If new env vars are added to this worker, follow the Step-1 pattern (Env +
  validate + fallback) — never add unread vars.
- Reviewer: check fail-closed behavior has tests for each new branch.
- **Deferred:** DO endpoint auth/allowlist parity inside the DO (needs
  dashboard-route confirmation) — revisit if a public route to the DO appears.
- **Deferred:** export pagination/sunset (plan 099); taxonomy/tests (plan 100).
