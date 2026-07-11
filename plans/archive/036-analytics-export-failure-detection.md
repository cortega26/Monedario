# Plan 036: Hacer detectable un export de analytics ausente o fallido (cerrar la clase de fallo OBS-01)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 520a8685..HEAD -- workers/analytics-collector/src/index.ts scripts/data-signals/fetch-analytics-export.mjs scripts/data-signals/gsc-utils.mjs`
> If any of those changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition. **This plan shares `index.ts` with plans 037 and 038 —
> the drift check matters. Do not run those three in parallel.**

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (but see the parallelism note above)
- **Category**: bug
- **Planned at**: commit `520a8685`, 2026-07-10

## Why this matters

The first-party analytics worker exports aggregated counters to R2 each Monday;
a data-signals CI job then downloads that export for the weekly scorecard. The
incident OBS-01 was a week where the export never landed. After the fixes, the
**class** of "export silently missing/failed" is still invisible end-to-end:

1. **Worker (`scheduled`)**: `runExport` throws on *both* artifact-validation
   failure *and* infrastructure failure (KV list / R2 put rejecting). The cron
   handler catches everything, logs it as `VALIDATION FAILED`, and returns
   normally — so a real KV/R2 outage is (a) mislabeled and (b) reported as a
   **successful** invocation.
2. **Consumer (`fetch-analytics-export.mjs`)**: on an R2 `404` it prints an info
   line and `process.exit(0)`. There is no notion of "this week's export is
   overdue" — a week that never landed looks identical to a week that is merely
   pending.

Net effect: an export that never gets produced never reddens anything. The
**consumer overdue-check is the real detection** for "the cron never fired"
(OBS-01's actual root cause); the worker re-throw is hygiene (a thrown cron only
marks the invocation failed in the Cloudflare dashboard, which may not be
watched). This plan adds both.

## Current state

**`workers/analytics-collector/src/index.ts`** — the cron handler swallows and
mislabels (around lines 858-874):

```ts
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const tz = env.EXPORT_TIMEZONE ?? "America/Santiago";

    // Compute the previous complete ISO week.
    const week = previousCompleteISOWeekInTz();
    console.log(`[analytics-export] trigger=cron week=${week} tz=${tz}`);

    try {
      await runExport(env, week);
    } catch (error) {
      console.error(
        `[analytics-export] VALIDATION FAILED: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  },
```

`runExport` (same file, ~676-714) throws `Export artifact validation failed: …`
for a validation error, and propagates infra errors from
`await listTelemetryCounters(...)` and `await env.ANALYTICS_EXPORTS.put(...)`.

**`scripts/data-signals/fetch-analytics-export.mjs`** — the consumer treats every
missing export as "pending" (around lines 213-221):

```js
  const { found, body } = await fetchFromR2(token, objectKey);

  if (!found) {
    console.error(
      `[fetch-analytics-export] Export not yet available in R2 for ${week}. ` +
      `The worker cron runs Monday 07:57 UTC. If today is Monday, the export may still be pending.`
    );
    process.exit(0);
  }
```

Its ISO-week helpers come from `./gsc-utils.mjs`:

```js
import {
  isoWeekToDateRange,
  previousCompleteISOWeek,
} from "./gsc-utils.mjs";
```

**`scripts/data-signals/gsc-utils.mjs`** — `isoWeekToDateRange(week)` returns
`{ from, to }` where **`to` is that ISO week's Sunday** (UTC, `YYYY-MM-DD`),
lines ~39-58:

```js
export function isoWeekToDateRange(week) {
  // ... validates YYYY-Www ...
  const weekMon = new Date(week1Mon.getTime() + (w - 1) * 7 * 86_400_000);
  const weekSun = new Date(weekMon.getTime() + 6 * 86_400_000);
  return {
    from: weekMon.toISOString().slice(0, 10),
    to: weekSun.toISOString().slice(0, 10),
  };
}
```

**CI wiring (context — NOT modified by this plan)**: in
`.github/workflows/data-signals.yml`, the step "Fetch analytics export from R2"
(~line 153) runs the consumer and is **not** `continue-on-error`. So when the
consumer exits non-zero, that step fails, the job goes red, and the later
"Validate analytics export" step (which has its own `if [ ! -f ] … exit 0`
tolerance for the *pending* case) is skipped. The consumer fix therefore gives
correct end-to-end detection **without** editing the workflow's bash — see
Maintenance notes for why the YAML is deliberately left alone.

**Repo convention**: pure date/util logic lives in `gsc-utils.mjs`; the consumer
script (`fetch-analytics-export.mjs`) calls `getRequiredEnv(...)` at module load
(line 31), so put the new pure helper in `gsc-utils.mjs` (import-side-effect
free) and unit-test it there, not in the consumer.

## Commands you will need

| Purpose            | Command                                                              | Expected                  |
|--------------------|---------------------------------------------------------------------|---------------------------|
| Worker tests       | `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` | all pass, incl. new test |
| Staleness test     | `pnpm exec vitest run tests/scripts/analytics-export-staleness.test.ts` | all pass (new file)      |
| Full unit tests    | `pnpm test`                                                         | exit 0                    |
| Typecheck (worker) | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json`     | exit 0, 0 errors          |
| Lint (scoped)      | `pnpm exec eslint workers/analytics-collector/src/index.ts scripts/data-signals/fetch-analytics-export.mjs scripts/data-signals/gsc-utils.mjs` | exit 0 |

> **Typecheck note**: `astro check` runs against the root `tsconfig.json`, which
> **excludes `workers/**`** — it does NOT typecheck the worker. Use the worker's
> own tsconfig (command above); it loads `@cloudflare/workers-types` so
> `ScheduledEvent`/`KVNamespace`/`R2Bucket` resolve. Confirm it exits 0 on the
> unmodified repo first.
| Format             | `pnpm run format:check`                                             | exit 0                    |

## Scope

**In scope** (the only files you should modify):
- `workers/analytics-collector/src/index.ts` (fix the `scheduled` handler only)
- `scripts/data-signals/gsc-utils.mjs` (add one pure helper `isExportOverdue`)
- `scripts/data-signals/fetch-analytics-export.mjs` (use the helper in `main()`)
- `tests/workers/analytics-collector/schema.test.ts` (add worker re-throw test)
- `tests/scripts/analytics-export-staleness.test.ts` (create)

**Out of scope** (do NOT touch):
- `.github/workflows/data-signals.yml` — intentionally unchanged (the consumer
  exit code already reddens the run; editing the validate step's bash date math
  is unnecessary and risky). Explain this in the PR description.
- `runExport`, `validateExportArtifact`, and every other worker function — only
  `scheduled` changes.
- The manual export path (`handleManualExport`) — that is plan 037's territory.

## Git workflow

- Branch: `advisor/036-analytics-export-failure-detection`
- Conventional commits, e.g.
  `fix(analytics): surface failed exports and detect overdue weekly export`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the worker `scheduled` handler surface failures accurately

Replace the `try/catch` body so that (a) the log label is accurate, and (b) the
error is **re-thrown** so Cloudflare marks the invocation failed:

```ts
    try {
      await runExport(env, week);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[analytics-export] export failed for week=${week}: ${message}`);
      throw error instanceof Error ? error : new Error(message);
    }
```

Do not change `runExport` or anything else in the file.

**Verify**: `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0.

### Step 2: Add the pure `isExportOverdue` helper to `gsc-utils.mjs`

Add near `isoWeekToDateRange` (pure, no I/O). The worker produces week *W*'s
export on the Monday after *W*'s Sunday; give it a 2-day grace window so a run on
Monday/Tuesday is "pending" and Wednesday-or-later is "overdue":

```js
/**
 * True when the export for an ISO week is overdue: past a grace window after the
 * Monday on which the worker cron produces it. Pure — the caller decides what to
 * do. With graceDays=2: Monday/Tuesday after the week ends = pending (false);
 * Wednesday onward = overdue (true).
 *
 * @param {string} week   ISO week "YYYY-Www"
 * @param {Date}   [now]  defaults to new Date()
 * @param {number} [graceDays=2]
 * @returns {boolean}
 */
export function isExportOverdue(week, now = new Date(), graceDays = 2) {
  const { to } = isoWeekToDateRange(week); // Sunday (week end), YYYY-MM-DD
  const weekEndUtc = Date.parse(`${to}T00:00:00Z`);
  const nowMidnightUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const overdueThresholdUtc = weekEndUtc + graceDays * 86_400_000;
  return nowMidnightUtc > overdueThresholdUtc;
}
```

**Verify**: `pnpm exec eslint scripts/data-signals/gsc-utils.mjs` → exit 0.

### Step 3: Use the helper in the consumer's 404 branch

In `scripts/data-signals/fetch-analytics-export.mjs`, add `isExportOverdue` to
the existing `from "./gsc-utils.mjs"` import, then replace the `if (!found)`
block so an overdue week fails loudly while a pending week still exits 0:

```js
  if (!found) {
    if (isExportOverdue(week)) {
      console.error(
        `[fetch-analytics-export] OVERDUE: no export in R2 for ${week} past the grace window. ` +
        `The worker cron (Monday 07:57 UTC) likely did not run or failed. Investigate the worker.`
      );
      process.exit(1);
    }
    console.error(
      `[fetch-analytics-export] Export not yet available in R2 for ${week}. ` +
      `The worker cron runs Monday 07:57 UTC. If today is Monday/Tuesday, the export may still be pending.`
    );
    process.exit(0);
  }
```

**Verify**: `pnpm exec eslint scripts/data-signals/fetch-analytics-export.mjs` → exit 0.

### Step 4: Add the staleness unit tests

Create `tests/scripts/analytics-export-staleness.test.ts`, importing
`isExportOverdue` and `isoWeekToDateRange` from
`../../scripts/data-signals/gsc-utils.mjs`. Derive the boundary dates from the
function itself so the test is not tied to a hand-computed calendar:

```ts
import { describe, expect, it } from "vitest";
import {
  isExportOverdue,
  isoWeekToDateRange,
} from "../../scripts/data-signals/gsc-utils.mjs";

describe("isExportOverdue", () => {
  const week = "2026-W17";
  const day = 86_400_000;
  const sundayUtc = Date.parse(`${isoWeekToDateRange(week).to}T00:00:00Z`);

  it("is pending (false) on the Monday after the week ends", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 1 * day))).toBe(false);
  });
  it("is pending (false) on the Tuesday after the week ends", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 2 * day))).toBe(false);
  });
  it("is overdue (true) on the Wednesday after the week ends", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 3 * day))).toBe(true);
  });
  it("is overdue (true) a week later", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 10 * day))).toBe(true);
  });
});
```

### Step 5: Add the worker re-throw test

In `tests/workers/analytics-collector/schema.test.ts`, add a test that the
`scheduled` handler **rejects** when the export path hits an infrastructure
error. That file already imports the default export as `analyticsCollector` and
the `Env` type from the worker index — reuse those imports (do not add new ones).
There is an existing `MockKV`; make its `list` throw (or inline a minimal mock
whose `list` throws) and assert rejection. **Do not import `ScheduledEvent`** — it
is an ambient global from `@cloudflare/workers-types` and is *not* exported by
`index.ts`; cast the event argument as `{} as never` instead. Sketch (the `it`
block goes inside the existing `describe`, using the file's existing imports):

```ts
it("scheduled() re-throws infrastructure failures so the invocation is marked failed", async () => {
  const env = {
    ANALYTICS_TELEMETRY: {
      async list() { throw new Error("KV unreachable"); },
      async get() { return null; },
      async put() {},
    },
    ANALYTICS_EXPORTS: { async put() {} },
  } as unknown as Env;

  await expect(
    analyticsCollector.scheduled({} as never, env),
  ).rejects.toThrow();
});
```

**Verify**: `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` → all pass.

## Test plan

- New file `tests/scripts/analytics-export-staleness.test.ts`: the four
  boundary cases above (Mon pending, Tue pending, Wed overdue, +7d overdue).
- New test in `tests/workers/analytics-collector/schema.test.ts`: `scheduled()`
  rejects on infra failure (the regression against the silent-swallow bug).
- Verification: `pnpm test` → exit 0 with the new tests passing;
  `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "VALIDATION FAILED" workers/analytics-collector/src/index.ts` returns **no matches** (the mislabel is gone).
- [ ] `grep -n "throw" workers/analytics-collector/src/index.ts` shows the re-throw inside `scheduled`.
- [ ] `grep -n "isExportOverdue" scripts/data-signals/fetch-analytics-export.mjs scripts/data-signals/gsc-utils.mjs` shows it defined and used.
- [ ] `pnpm test` exits 0; the new staleness and worker tests pass.
- [ ] `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0 (worker typecheck; `astro check` does NOT cover `workers/**`).
- [ ] scoped eslint (command above) exits 0; `pnpm run format:check` exits 0.
- [ ] `git status` shows only the five in-scope files modified (no `.yml`).
- [ ] `plans/README.md` status row for 036 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `isoWeekToDateRange` does not return `{ from, to }` with `to` = the week's
  Sunday as excerpted (the date math this plan relies on has changed).
- `runExport` no longer throws on validation/infra failure (Step 1's re-throw
  assumption is void).
- The worker test cannot make `scheduled` reject without importing runtime-only
  Cloudflare types that don't resolve under the worker's `tsconfig` — report the
  exact type error instead of stubbing around it.
- Any verification fails twice after a reasonable fix attempt.
- The change appears to require touching an out-of-scope file (especially the
  workflow YAML — if you think you need it, STOP and explain why).

## Maintenance notes

- **Division of responsibility**: the consumer overdue-check is the real
  detection (it reddens CI when the cron never fires — OBS-01's actual cause);
  the worker re-throw only surfaces failures that occur *while the cron runs*.
  Keep both.
- **Why the workflow YAML is untouched**: the "Fetch analytics export from R2"
  step is not `continue-on-error`, so the consumer's `exit 1` fails the job and
  skips the downstream validate step. Re-implementing the grace-window date math
  in bash would duplicate `isExportOverdue` and add false-positive risk.
- **Grace window**: `graceDays=2` assumes the consumer cron runs no earlier than
  the worker cron's Monday. If the data-signals schedule moves earlier/later
  relative to the worker's Monday 07:57 UTC, revisit the default.
- A reviewer should confirm the worker still returns `void` on success (only the
  failure path changed) and that no non-cron caller depends on `scheduled`
  swallowing errors.
