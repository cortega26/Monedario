# Plan 099: Harden the analytics weekly export (pagination, KV sunset, compact artifact)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a55d5344..HEAD -- workers/analytics-collector/src/worker-v2.ts workers/analytics-collector/src/index.ts tests/workers/analytics-collector/`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/archive/097-worker-v2-bounded-body.md (DONE 2026-09-14), plans/archive/098-worker-v2-config-validation.md (DONE 2026-09-14; same files; sequence strictly after both)
- **Category**: perf
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `a55d5344`, 2026-09-14 — plans 097 (merge
  `67487da9`) and 098 (merge `7366f12d`) landed; excerpts below re-read
  against live code, all three findings intact (only line numbers shifted;
  notes on 098 interactions inline)
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
- `tests/workers/analytics-collector/root-cause.test.ts` — 24 v2 tests;
  `MockKV.list` still always returns `list_complete: true` (line 36);
  mixed-export test at lines 203-236

Excerpts as of `a55d5344` (re-read after 097/098 landed; 097 added the
`readBoundedBodyText` ingestion call, 098 added `resolveSchemaVersion`,
`isValidExportWeek`, `rateLimitIdentity` and env resolvers — none touch the
export-listing regions below except `runExportV2`'s new fail-closed preamble,
noted inline):

`worker-v2.ts:149-167` — DO `/list`: unbounded `SELECT ... ORDER BY`, no
`LIMIT`. `worker-v2.ts:346-362` (`listDurableCounters`) — exporter consumes
the whole window in one `response.json()`. Contrast KV path
`worker-v2.ts:381-400` batched at 50 (`KV_EXPORT_READ_BATCH_SIZE = 50`,
`worker-v2.ts:23`).

`worker-v2.ts:420-423`:

```ts
const [legacyCounters, durableCounters] = await Promise.all([
  listLegacyKvCounters(env.ANALYTICS_TELEMETRY, legacyPrefix, window),
  listDurableCounters(env, window),
]);
```

`runExportV2` (`worker-v2.ts:404-411`) now starts with 098's fail-closed
preamble (`isValidExportWeek` throw + `resolveSchemaVersion` throw) before
any listing — place the Step-2 legacy-skip gate after these lines, and keep
the manual `?week=` override path (`worker-v2.ts:479-481`,
`requestedWeek ?? previousCompleteISOWeekInTz(...)`) working for old-week
re-exports.

`workers/analytics-collector/src/index.ts:41`:
`KV_TTL_SECONDS = 60 * 60 * 24 * 35` (35 days). `wrangler.toml:60`:
`COUNTER_KEY_CUTOVER_AT = "2026-07-20T04:00:00Z"`. Cron unchanged:
`wrangler.toml:17` `crons = ["30 5 * * MON"]`.

`worker-v2.ts:442` (identical in `index.ts:828`):
`const body = JSON.stringify(artifact, null, 2) + "\n";`

Downstream still parses with plain `JSON.parse`
(`scripts/data-signals/fetch-analytics-export.mjs:249`), which is
whitespace-insensitive — compact JSON needs no consumer change (executor:
confirm read-only, do not edit).

Dimensions serialization `worker-v2.ts:314-318` (`durableCounterFromEvent`)
joins only values with `":"` (keys dropped); reparsed via `split(":")` in
`index.ts:515-537` (`parseCounterKey`, `dimensions = parts.slice(5).join(":")`).
Concrete lead for the Step-3 investigation (verified, not just suspected):
`destination_url` IS in event allowlists
(`src/contracts/analytics-events.ts:78,104`), its validator `INTERNAL_URL`
(`analytics-events.ts:140`) permits `https://...` (contains `:`), and
`SAFE_TOKEN` (`analytics-events.ts:136`, `/^[a-z0-9][a-z0-9._-]{0,79}$/`)
permits no colon — so enumerate whether any ingested event actually carries
`destination_url` into `dimensions`.

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
cutover-week + 35 days, skip the KV scan (log `legacy_skipped`), keeping the
manual `?week=` override path (`worker-v2.ts:479-481`) for old-week
re-exports. Place the gate after 098's fail-closed preamble
(`isValidExportWeek`/`resolveSchemaVersion` throws at `runExportV2` start) —
do not move or weaken those throws. Change
`JSON.stringify(artifact, null, 2)` → `JSON.stringify(artifact)` on the R2
write only (both `worker-v2.ts:442` and the mirrored `index.ts:828` line —
that line in `index.ts` is in scope for this step despite the Scope list;
if it diverges, STOP). Confirm `scripts/data-signals/` parses compact JSON
(read-only check — `fetch-analytics-export.mjs:249` uses plain `JSON.parse`;
no edit).

**Verify**: typecheck exit 0; `grep -n "null, 2" workers/analytics-collector/src/worker-v2.ts` → no matches on the export write.

### Step 3: Rule out (or fix) the dimensions separator collision

Investigate: enumerate allowlisted dimension values for `":"`. Start from
the verified lead in "Current state": `destination_url` is allowlisted
(`analytics-events.ts:78,104`) with `INTERNAL_URL` permitting `https://`,
and every non-excluded param value flows into DO `dimensions` via
`durableCounterFromEvent`. If unreachable in practice, add a code comment +
a unit test pinning a `":"`-bearing value as rejected by validation. If
reachable, serialize as escaped `key=value` pairs with a versioned prefix
and migration note (keep old keys readable). Do not split the historical
series silently.

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
  (`root-cause.test.ts:203-236`) with multi-page MockKV (current mock always
  returns `list_complete: true` at line 36 — extend the mock, test-only change).
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
