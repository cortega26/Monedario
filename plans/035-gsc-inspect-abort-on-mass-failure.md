# Plan 035: Abortar `gsc-inspect` antes de escribir cuando la mayoría de las inspecciones fallan (no sobrescribir el snapshot con 0% indexado)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 520a8685..HEAD -- scripts/data-signals/gsc-inspect.mjs scripts/data-signals/gsc-utils.mjs tests/scripts/gsc-inspect.test.ts .github/workflows/data-signals.yml`
> If any of those changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `520a8685`, 2026-07-10

## Why this matters

`scripts/data-signals/gsc-inspect.mjs` is the standing signal for "how much of
the site is actually indexed" (via the GSC URL Inspection API). It runs weekly in
CI and commits `output/operations/data-signals/gsc/<week>-url-inspection.json`.

The loop tolerates per-URL failures (good), but `main()` **always** writes the
snapshot afterward. When failures are *systemic* — an expired/invalid service
account token mid-run, GSC URL-Inspection quota exhaustion (a real daily limit),
or a GSC outage — every `inspectUrl` returns an error marker, every row
normalizes to `coverageState: null`, and `summarizeIndexation` reports
`indexed: 0, indexedPct: 0`. That garbage snapshot is then written and committed
(the CI step runs with `continue-on-error: true` and commits everything under
`output/operations/data-signals/`), so the weekly scorecard renders **"Indexación
real 0%"** as if the entire site fell out of Google's index. This corrupts
exactly the signal the project uses to track its real crawled-not-indexed gap.

The fix: if the run failed for all (or a majority of) URLs, treat it as a fetch
failure and exit non-zero **before writing**, so the previous week's good
snapshot stands.

## Current state

**`scripts/data-signals/gsc-inspect.mjs`** — the inspection loop and write
(`main()`, around lines 235-268):

```js
  const rows = [];
  let errors = 0;
  let done = 0;
  for (const url of urls) {
    const result = await inspectUrl(url, site, token);
    if (result.__error) errors++;
    rows.push(normalizeUrlInspectionRow(url, result.__error ? {} : result));
    if (++done % 25 === 0) console.error(`[gsc-inspect]   ...${done}/${urls.length}`);
    await sleep(PACE_MS);
  }

  rows.sort((a, b) => a.url.localeCompare(b.url));
  const summary = summarizeIndexation(rows);
  const { from, to } = isoWeekToDateRange(week);
  const header = buildSchemaHeader("gsc-url-inspection", week, from, to);
  const doc = { ...header, summary, errors, data: rows };

  console.error(
    `[gsc-inspect] indexed=${summary.indexed}/${summary.total} (${summary.indexedPct}%)  ` +
      `notIndexed=${summary.notIndexed}  other=${summary.other}  errors=${errors}`
  );

  if (args.dryRun) {
    process.stdout.write(JSON.stringify(doc, null, 2) + "\n");
    console.error("[gsc-inspect] dry-run — no files written");
    return;
  }

  const dir = path.resolve(OUTPUT_BASE);
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${week}-url-inspection.json`);
  writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
  console.error(`[gsc-inspect] wrote ${filePath}  (${rows.length} rows)`);
  console.error("[gsc-inspect] done");
```

The top of the file imports its pure helpers from `./gsc-utils.mjs`:

```js
import {
  buildSchemaHeader,
  extractSitemapLocs,
  isoWeekToDateRange,
  normalizeUrlInspectionRow,
  previousCompleteISOWeek,
  summarizeIndexation,
} from "./gsc-utils.mjs";
```

**`scripts/data-signals/gsc-utils.mjs`** — why a fully-failed run yields `0%`
(not `null`): a normalized error row has `coverageState: null`, and
`summarizeIndexation` computes `indexedPct` from `total > 0`, so N failed URLs →
`indexed: 0, total: N, indexedPct: 0` (lines ~357-399):

```js
export function normalizeUrlInspectionRow(url, result = {}) {
  return {
    coverageState: result.coverageState ?? null,
    // ...
  };
}

export function summarizeIndexation(rows) {
  const list = Array.isArray(rows) ? rows : [];
  // ... counts indexed / notIndexed ...
  const total = list.length;
  return {
    total,
    indexed,
    notIndexed,
    other: total - indexed - notIndexed,
    indexedPct: total > 0 ? Math.round((indexed / total) * 100) : null,
    byCoverage,
  };
}
```

**`.github/workflows/data-signals.yml`** — the step runs with
`continue-on-error: true` (line ~126) and a later step commits the whole output
tree (lines ~221-226: `git add output/operations/data-signals/` → `git commit` →
`git push`). So a non-zero exit here **prevents the bad file from being written
and therefore committed**; the previous week's snapshot remains. It does *not*
redden the overall run (that is `continue-on-error`'s intended behavior and is
out of scope — see Maintenance notes).

**Repo convention**: pure, side-effect-free logic lives in `gsc-utils.mjs` and is
unit-tested in `tests/scripts/gsc-inspect.test.ts` (which imports helpers
directly and also runs the script via `spawnSync`). Match it: add the decision as
a pure helper in `gsc-utils.mjs`, unit-test the helper, and keep `main()` thin.

## Commands you will need

| Purpose        | Command                                             | Expected on success        |
|----------------|-----------------------------------------------------|----------------------------|
| Run this test  | `pnpm exec vitest run tests/scripts/gsc-inspect.test.ts` | all pass, incl. new tests |
| Full unit test | `pnpm test`                                         | exit 0                     |
| Lint           | `pnpm run lint`                                     | exit 0 (see STOP note)     |
| Format         | `pnpm run format:check`                             | exit 0                     |

> Note on lint: `pnpm run lint` runs `eslint .` over the whole repo and may emit
> pre-existing errors from nested worktrees under `.claude/worktrees/**` that are
> unrelated to your change. Confirm your two files are clean with
> `pnpm exec eslint scripts/data-signals/gsc-utils.mjs scripts/data-signals/gsc-inspect.mjs`.

## Scope

**In scope** (the only files you should modify):
- `scripts/data-signals/gsc-utils.mjs` (add one pure helper)
- `scripts/data-signals/gsc-inspect.mjs` (wire the helper into `main()`)
- `tests/scripts/gsc-inspect.test.ts` (add unit tests for the helper)

**Out of scope** (do NOT touch, even though they look related):
- `.github/workflows/data-signals.yml` — the `continue-on-error` / alerting
  behavior is deliberately unchanged (see Maintenance notes).
- `scripts/data-signals/gsc-fetch.mjs` and every other data-signals script — a
  different signal, not this bug.
- The `summarizeIndexation` return shape — other consumers read it; do not change
  its fields.

## Git workflow

- Branch: `advisor/035-gsc-inspect-abort-on-mass-failure`
- Conventional commits (repo style), e.g.
  `fix(data-signals): abortar gsc-inspect antes de escribir en fallo masivo`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the pure decision helper to `gsc-utils.mjs`

Add near `summarizeIndexation` (keep it exported and pure — no I/O, no
`process.exit`):

```js
/**
 * Decides whether an inspection run failed badly enough that its snapshot must
 * NOT be written (it would overwrite good data with a misleading 0%-indexed
 * summary). Pure — the caller performs the exit.
 *
 * @param {number} errors  count of per-URL inspection failures
 * @param {number} total   count of URLs the run attempted (urls.length)
 * @param {number} [maxErrorRatio=0.5]  abort if errors are at/above this share
 * @returns {{ abort: boolean, reason: string|null }}
 */
export function shouldAbortIndexationRun(errors, total, maxErrorRatio = 0.5) {
  if (total === 0) {
    return { abort: true, reason: "no URLs inspected (empty or failed sitemap)" };
  }
  if (errors >= total * maxErrorRatio) {
    return {
      abort: true,
      reason: `${errors}/${total} URL inspections failed (>= ${maxErrorRatio * 100}%); refusing to overwrite snapshot`,
    };
  }
  return { abort: false, reason: null };
}
```

**Verify**: `pnpm exec vitest run tests/scripts/gsc-inspect.test.ts` still passes
(no behavior change yet; you add tests in Step 3).

### Step 2: Wire it into `main()` before the write

Import the helper (add `shouldAbortIndexationRun` to the existing
`from "./gsc-utils.mjs"` import block, keeping the list alphabetically sorted to
match the current ordering). Then, in `main()`, insert the guard **immediately
after** the `console.error("[gsc-inspect] indexed=...")` line and **before** the
`if (args.dryRun)` block, so both dry-run and real runs abort loudly on mass
failure:

```js
  const abort = shouldAbortIndexationRun(errors, urls.length);
  if (abort.abort) {
    console.error(`[gsc-inspect] FATAL: ${abort.reason}. Not writing ${week}-url-inspection.json.`);
    process.exit(1);
  }
```

Do not change anything below the `if (args.dryRun)` block.

**Verify**: `pnpm exec eslint scripts/data-signals/gsc-inspect.mjs scripts/data-signals/gsc-utils.mjs` → exit 0.

### Step 3: Add unit tests for the helper

In `tests/scripts/gsc-inspect.test.ts`, add `shouldAbortIndexationRun` to the
import from `../../scripts/data-signals/gsc-utils.mjs`, and add a `describe`
block (model its structure on the existing `describe("summarizeIndexation", ...)`
/ `describe("extractSitemapLocs", ...)` blocks). Cover exactly these cases:

- All failed → abort true: `shouldAbortIndexationRun(250, 250)` → `abort === true`.
- Majority failed → abort true: `shouldAbortIndexationRun(130, 250)` → `abort === true`.
- Exactly at the 50% threshold → abort true: `shouldAbortIndexationRun(125, 250)` → `abort === true`.
- Empty run (no URLs) → abort true with the "no URLs" reason:
  `shouldAbortIndexationRun(0, 0)` → `abort === true` and `reason` contains `"no URLs"`.
- Healthy run (few errors) → abort false: `shouldAbortIndexationRun(3, 250)` → `abort === false`.
- A fully-indexed healthy run → abort false: `shouldAbortIndexationRun(0, 250)` → `abort === false`.

**Verify**: `pnpm exec vitest run tests/scripts/gsc-inspect.test.ts` → all pass,
including the 6 new assertions.

## Test plan

- New tests: the `shouldAbortIndexationRun` cases above, in
  `tests/scripts/gsc-inspect.test.ts`, modeled on the existing pure-helper
  `describe` blocks in that file.
- The regression this fixes: a systemic-failure run must NOT produce a writable
  snapshot. The unit test for `shouldAbortIndexationRun(250, 250) → abort` is the
  direct guard against the 0%-overwrite bug.
- Verification: `pnpm test` → exit 0, with the new tests passing.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec vitest run tests/scripts/gsc-inspect.test.ts` passes with the 6 new assertions.
- [ ] `pnpm test` exits 0.
- [ ] `grep -n "shouldAbortIndexationRun" scripts/data-signals/gsc-inspect.mjs` shows it imported and called before the `if (args.dryRun)` block.
- [ ] `pnpm exec eslint scripts/data-signals/gsc-inspect.mjs scripts/data-signals/gsc-utils.mjs` exits 0.
- [ ] `pnpm run format:check` exits 0.
- [ ] `git status` shows only the three in-scope files modified.
- [ ] `plans/README.md` status row for 035 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- The `main()` loop or `summarizeIndexation` no longer matches the "Current
  state" excerpts (the code drifted since 2026-07-10).
- `inspectUrl` no longer sets `result.__error` on failure (the error signal this
  plan counts has changed).
- A verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file.

## Maintenance notes

- **Scope is corruption-prevention, not alerting.** Because the CI step runs with
  `continue-on-error: true`, a non-zero exit here prevents the bad write/commit
  but the overall workflow stays green. That is intended: it stops garbage data
  without failing unrelated weekly ops. If the maintainer later wants a *visible*
  alert when the indexation run mass-fails, that is a separate change (drop the
  `continue-on-error` on this step, or emit a tracking issue) and should be its
  own plan.
- The 50% threshold lives in `shouldAbortIndexationRun`'s `maxErrorRatio`
  default. If legitimate partial failures (a handful of slow URLs) ever approach
  that, raise it — but keep it well below 1.0 so quota-exhaustion still trips it.
- A reviewer should confirm the guard sits *before* the write and that no other
  consumer of `summarizeIndexation` was touched.
