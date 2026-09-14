# Plan 099: Harden the analytics weekly export (pagination, KV sunset, compact artifact)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/src/index.ts tests/workers/analytics-collector/`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/archive/097-worker-v2-bounded-body.md (DONE 2026-09-14), plans/098-worker-v2-config-validation.md (same files; sequence strictly after both)
- **Category**: perf
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

The Monday export path has three latent scale failures. The DO `/list` runs
an unbounded `SELECT ... ORDER BY` with no `LIMIT` while the exporter fetches
the whole window in one `response.json()` — one cardinality spike in
`dimensions` fails the entire week atomically. Every export also scans legacy
KV (`Promise.all` with 7 days of `kv.list` + per-key `kv.get` in batches of
50) forever, even after the 35-day TTL expires those keys. And the R2 artifact
is pretty-printed (`JSON.stringify(artifact, null, 2)`), inflating every
weekly write and every Monday 05:30→06:00 downstream read. Fixing all three in
one export-focused change keeps the weekly signal alive as cardinality grows.

## Current state

Files:

- `workers/analytics-collector/src/worker-v2.ts` — `runExportV2`, `listLegacyKvCounters`, `listDurableCounters`, DO class
- `workers/analytics-collector/src/index.ts` — shared aggregation/artifact builders, `KV_TTL_SECONDS`, `KV_EXPORT_READ_BATCH_SIZE`
- `tests/workers/analytics-collector/root-cause.test.ts` — single-page mocks

Excerpts as of `0e506a8b`:

`worker-v2.ts:141-159` — DO `/list`: unbounded `SELECT ... ORDER BY`, no
`LIMIT`. `worker-v2.ts:255-271` — exporter consumes the whole window in one
`response.json()`. Contrast KV path `worker-v2.ts:295-306` batched at 50
(`KV_EXPORT_READ_BATCH_SIZE = 50`, `worker-v2.ts:20`).

`worker-v2.ts:326-329`:

```ts
const [legacyCounters, durableCounters] = await Promise.all([
  listLegacyKvCounters(env.ANALYTICS_TELEMETRY, legacyPrefix, window),
  listDurableCounters(env, window),
]);
```

`workers/analytics-collector/src/index.ts:41`:
`KV_TTL_SECONDS = 3_024_000` (35 days). `wrangler.toml:60`:
`COUNTER_KEY_CUTOVER_AT = "2026-07-20T04:00:00Z"`.

`worker-v2.ts:348` (identical in `index.ts:828`):
`const body = JSON.stringify(artifact, null, 2) + "\n";`

Dimensions serialization `worker-v2.ts:223-227` joins only values with `":"`
(keys dropped); reparsed via `split(":")` in `index.ts:515-537` — potential
collision if any allowlisted value contains `":"` (investigate inside this
plan; `SAFE_TOKEN` permits `. _ -`, so confirm first).

Conventions: export errors throw (`Export artifact validation failed`);
cron `30 5 * * MON`; conventional commits; worker typecheck per plan 097.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Worker typecheck | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` | declared | exit 0 |
| Focused tests | `pnpm exec vitest run tests/workers/analytics-collector/root-cause.test.ts tests/workers/analytics-collector/schema.test.ts` | declared | all pass |
| Lint (scoped) | `pnpm exec eslint workers/analytics-collector/src/worker-v2.ts` | declared | exit 0 |
| Format check (scoped) | `pnpm exec prettier --check workers/analytics-collector/src/worker-v2.ts tests/workers/analytics-collector/root-cause.test.ts` | declared | exit 0 |

## Scope

**In scope**:

- `workers/analytics-collector/src/worker-v2.ts`
- `tests/workers/analytics-collector/root-cause.test.ts`

**Out of scope**:

- Ingestion/body-limit (097), config/validation (098), taxonomy content
  (100), wrangler bindings/cron values, downstream `scripts/data-signals/`
  consumers (must keep parsing compact JSON — verify, don't modify), R2
  bucket policy, historical re-exports/backfills.

## Git workflow

- Branch: `advisor/099-analytics-export-hardening`
- Commits: e.g. `perf(analytics-collector): paginate DO export, sunset legacy KV scan, compact R2 artifact`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install + typecheck + focused tests unmodified. `declared` failure on clean
tree → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Paginate the DO export list

Add `limit`/`cursor` to the DO `/list` endpoint and loop in
`listDurableCounters` until exhausted (keep the 50-row batch idiom for
symmetry). Preserve ordering and the existing response shape for the first
page so old readers still parse.

**Verify**: typecheck exit 0.

### Step 2: Skip the legacy KV scan past TTL + compact the artifact

Gate `listLegacyKvCounters` on the export window: if `window.from` exceeds
cutover-week + 35 days, skip the KV scan (log `legacy_skipped`), keeping a
manual `--week`/query override path for old-week re-exports. Change
`JSON.stringify(artifact, null, 2)` → `JSON.stringify(artifact)` on the R2
write only (both `worker-v2.ts:348` and the mirrored `index.ts:828` line —
that line in `index.ts` is in scope for this step despite the Scope list;
if it diverges, STOP). Confirm `scripts/data-signals/` parses compact JSON
(read-only check, no edit).

**Verify**: typecheck exit 0; `grep -n "null, 2" workers/analytics-collector/src/worker-v2.ts` → no matches on the export write.

### Step 3: Rule out (or fix) the dimensions separator collision

Investigate: enumerate allowlisted dimension values for `":"`. If unreachable,
add a code comment + a unit test pinning a `":"`-bearing value as rejected by
validation. If reachable, serialize as escaped `key=value` pairs with a
versioned prefix and migration note (keep old keys readable). Do not split the
historical series silently.

**Verify**: focused tests pass; either a pinning test or the escaped format
with migration comment exists.

### Step 4: Paginated + poisoned export tests

Add fixtures: >50 legacy keys with cursor pagination; null/out-of-window
rows; invalid artifact path; empty week. Assert totals, no double-count on
cursor retry, poisoned rows excluded, R2 metadata content-type preserved.

**Verify**: focused-tests command → all pass including ≥3 new export tests.

## Test plan

- New tests in `root-cause.test.ts`: multi-page KV (>50 keys + cursor),
  DO pagination loop, poisoned-row exclusion, legacy-skip past TTL,
  compact-write parse roundtrip. Model on existing mixed-export test
  (`root-cause.test.ts:202-235`) with multi-page MockKV (current mock always
  returns `list_complete: true` — extend the mock, test-only change).
- Verification: focused-tests command → all pass.

## Done criteria

- [ ] Typecheck exits 0
- [ ] Focused tests exit 0 with ≥3 new export tests
- [ ] DO `/list` accepts `limit`/`cursor`; exporter loops to exhaustion
- [ ] Legacy KV scan skipped when window is past cutover + TTL (log-pinned)
- [ ] No pretty-printed export write remains
- [ ] Dimensions `":"` risk resolved (pinned-rejected or escaped+migrated)
- [ ] Diff lists only in-scope files (+ the one mirrored `index.ts:828` line if touched, documented); `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; out-of-scope touch needed (especially
  downstream `data-signals` requiring code change for compact JSON — STOP,
  do not refactor the consumer); assumption false (TTL/cutover dates differ
  from cited values — confirm cutover with operator first); `declared`
  baseline broken.

## Maintenance notes

- If cardinality grows again, raise DO page size before widening cron memory.
- Reviewer: check pagination cursors can't double-count on retry; check the
  legacy-skip gate uses `window.from` (not `to`) and keeps manual old-week
  override working.
- **Deferred:** single-DO sharding + hot-path `waitUntil` (needs load
  measurement + loss-budget ADR) — explicitly not in this plan.
- **Deferred:** export-window timezone alignment (UTC window vs
  America/Santiago counter dates) — needs ADR + backfill decision; candidate
  follow-up, do not sneak in here.
