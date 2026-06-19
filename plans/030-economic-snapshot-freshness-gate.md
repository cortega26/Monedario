# Plan 030: Gate de frescura del snapshot económico (detecta worker silenciosamente caído)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 9a4eb37d..HEAD -- src/infrastructure/economic/economic-parameters.snapshot.json package.json .github/workflows/ci.yml`
> If any of those changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `9a4eb37d`, 2026-06-19

## Why this matters

The site serves UF/UTM/dólar from a committed snapshot
(`src/infrastructure/economic/economic-parameters.snapshot.json`), refreshed by a
scheduled Cloudflare Worker that commits updates (which trigger a rebuild). The
calculators now display a visible "Datos al {fecha}" line (Plan 024). But **no
check verifies the snapshot is actually being refreshed.** If the worker silently
stops committing (cron disabled, token expired, all upstreams degrade to the
no-op path), the static build freezes the data and the site keeps serving
increasingly stale UF/UTM with an old date — and **nothing alerts the
maintainer.** `assertEconomicParameters` validates finiteness and ISO *format*
but never compares dates against "now"; `check:homepage-surface-freshness` is
about homepage card dates, not economic parameters. For a YMYL finance site,
silently serving a month-old UF is the highest-impact silent-failure mode.

This adds a small freshness gate, wired into the **daily scheduled CI** (not the
PR gate), so worker death surfaces as a tracking issue within ~24h without
blocking unrelated contributor PRs.

## Current state

The snapshot shape (`src/infrastructure/economic/economic-parameters.snapshot.json`):

```json
{
  "uf": 40784.98,
  "utm": 71506,
  "uta": 834504,
  "ipc": 0.2,
  "tmc": 3.49,
  "dolar": 886.53,
  "imm": 553553,
  "immEffectiveDate": "2026-05-01",
  "afcTopes": { "monthlyTaxableCapUf": 135.2 },
  "previsionalTopes": { "pensionAndHealthMonthlyTaxableCapUf": 90 },
  "indicatorUpdatedAt": {
    "uf": "2026-06-17",
    "utm": "2026-06-01",
    "uta": "2025-12-01",
    "ipc": "2026-05-01",
    "dolar": "2026-06-17"
  },
  "lastUpdated": "2026-06-17",
  "capturedAt": "2026-06-17T10:15:54.895Z",
  "source": "mindicador.cl/api",
  "prev": { ... }
}
```

`capturedAt` is the regeneration timestamp (the "is the pipeline alive?" signal —
it freezes if the worker stops). `indicatorUpdatedAt.{uf,utm,dolar}` are the data
provenance dates. `imm` is a managed legal constant (no `indicatorUpdatedAt`
entry — must NOT be age-checked). `uta` is yearly and `ipc` monthly with long
publication lag.

**Exemplar check script (model the structure on this):**
`scripts/check-economic-source-consistency.mjs` — a `node:fs` check that resolves
its root from an env override and exits 0/1:

```js
const REPO_ROOT = path.resolve(
  process.env.ECONOMIC_SOURCE_ROOT || path.resolve(__dirname, "..")
);
// ... reads JSON, validates, process.exit(0 | 1)
```

**Exemplar test (model the test on this):**
`tests/scripts/check-domain-boundaries.test.ts` — uses `mkdtempSync` temp roots,
`writeFileSync` to craft input, and `spawnSync("node", [SCRIPT], { env: { ...process.env, DOMAIN_BOUNDARY_ROOT: rootDir } })`, asserting `.status` and `.stderr`.

**CI wiring exemplar:** `.github/workflows/ci.yml` — the `build` job already runs
on both PR and `schedule`, and has a step `"🚨 Open issue on scheduled main
failure"` guarded by `if: failure() && github.event_name == 'schedule'`. A
scheduled-only step that fails will be surfaced by that existing mechanism.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Run the gate against the live snapshot | `pnpm run check:economic-snapshot-freshness` | exit 0 (snapshot is fresh today) |
| Run the new test | `pnpm test -- economic-snapshot-freshness` | all pass |
| Full test suite | `pnpm run test` | exit 0 |
| Lint | `pnpm run lint` | exit 0 |
| Format check | `pnpm run format:check` | exit 0 |

## Scope

**In scope** (the only files you should create or modify):

- `scripts/check-economic-snapshot-freshness.mjs` (create)
- `tests/scripts/check-economic-snapshot-freshness.test.ts` (create)
- `package.json` (modify — add ONE script entry)
- `.github/workflows/ci.yml` (modify — add ONE scheduled-only step to the `build` job)

**Out of scope** (do NOT touch):

- The snapshot JSON itself, the provider, the worker — this plan only *observes*.
- The blocking `check` / `build` / `build:ci` aggregate scripts — do NOT add the
  gate there (that would block unrelated PRs when the worker is merely behind).
  The gate runs **only** on the daily schedule + on demand.
- Any threshold change to other freshness checks.

## Git workflow

- Branch: `advisor/030-economic-snapshot-freshness-gate`
- Conventional commits, e.g. `feat(ci): gate de frescura del snapshot económico (scheduled)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the freshness check script

Create `scripts/check-economic-snapshot-freshness.mjs`. Target implementation:

```js
// check:economic-snapshot-freshness
//
// Fails (exit 1) when the committed economic snapshot has gone stale, which
// signals the refresh Worker has silently stopped committing. Wired into the
// DAILY SCHEDULED CI (not the PR gate) so worker death surfaces within ~24h.
//
// Roots/clock are env-overridable for tests:
//   ECONOMIC_SNAPSHOT_ROOT  — repo root override (default: repo root)
//   ECONOMIC_SNAPSHOT_NOW   — ISO datetime "now" override (default: new Date())
//
// Exit 0 = fresh, exit 1 = stale or unreadable.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.ECONOMIC_SNAPSHOT_ROOT || path.resolve(__dirname, "..")
);
const SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src/infrastructure/economic/economic-parameters.snapshot.json"
);

// Generous thresholds (days). The point is to catch a DEAD pipeline, not to
// chase every publication lag. UF/dólar are ~daily; UTM is monthly.
const CAPTURE_MAX_DAYS = 10; // capturedAt: is the snapshot being regenerated at all?
const INDICATOR_MAX_DAYS = {
  uf: 10,
  utm: 45,
  dolar: 10,
};

function now() {
  const override = process.env.ECONOMIC_SNAPSHOT_NOW;
  const d = override ? new Date(override) : new Date();
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ECONOMIC_SNAPSHOT_NOW: ${override}`);
  }
  return d;
}

function ageInDays(isoOrDate, ref) {
  const then = new Date(isoOrDate);
  if (Number.isNaN(then.getTime())) return null;
  return (ref.getTime() - then.getTime()) / 86_400_000;
}

function main() {
  let snapshot;
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch (err) {
    console.error(
      `[check-economic-snapshot-freshness] FAIL: cannot read/parse ${SNAPSHOT_PATH}: ${err.message}`
    );
    process.exit(1);
  }

  const ref = now();
  const errors = [];

  const captureAge = ageInDays(snapshot.capturedAt, ref);
  if (captureAge === null) {
    errors.push(`capturedAt missing or unparseable: ${snapshot.capturedAt}`);
  } else if (captureAge > CAPTURE_MAX_DAYS) {
    errors.push(
      `capturedAt is ${captureAge.toFixed(1)}d old (max ${CAPTURE_MAX_DAYS}d) — refresh Worker may have stopped. capturedAt=${snapshot.capturedAt}`
    );
  }

  for (const [indicator, maxDays] of Object.entries(INDICATOR_MAX_DAYS)) {
    const date = snapshot.indicatorUpdatedAt?.[indicator];
    const age = date ? ageInDays(date, ref) : null;
    if (age === null) {
      errors.push(`indicatorUpdatedAt.${indicator} missing or unparseable: ${date}`);
    } else if (age > maxDays) {
      errors.push(
        `${indicator} last updated ${age.toFixed(1)}d ago (max ${maxDays}d). date=${date}`
      );
    }
  }

  if (errors.length > 0) {
    console.error(
      `[check-economic-snapshot-freshness] FAIL: ${errors.length} stale signal(s):`
    );
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "Reproduce: run `pnpm run economic:snapshot:refresh` and confirm the Worker (refresh-economic-snapshot.yml) is green."
    );
    process.exit(1);
  }

  console.log(
    `[check-economic-snapshot-freshness] OK. capturedAt ${captureAge.toFixed(1)}d old; uf/utm/dólar within thresholds.`
  );
}

main();
```

**Verify**: `pnpm run check:economic-snapshot-freshness` is not yet wired; run
directly: `node scripts/check-economic-snapshot-freshness.mjs` → exits 0 and
prints the OK line (today's committed snapshot is fresh). If it exits 1 today,
STOP and report — that means the committed snapshot is *already* stale (a real
finding, not a plan bug).

### Step 2: Add the package.json script

In `package.json` `scripts`, add (next to the other `check:*` entries, e.g. after
`check:economic-source-consistency`):

```json
"check:economic-snapshot-freshness": "node scripts/check-economic-snapshot-freshness.mjs",
```

Do NOT add it to the `check`, `build`, or `build:ci` aggregate strings.

**Verify**: `pnpm run check:economic-snapshot-freshness` → exit 0, prints OK.
**Verify**: `pnpm run lint` → exit 0; `pnpm run format:check` → exit 0 (run
`pnpm run format` on the new `.mjs` first if needed).

### Step 3: Add the unit test

Create `tests/scripts/check-economic-snapshot-freshness.test.ts`, modeled on
`tests/scripts/check-domain-boundaries.test.ts`:

```ts
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/check-economic-snapshot-freshness.mjs");
const tempRoots: string[] = [];

function writeSnapshot(snapshot: unknown): string {
  const root = mkdtempSync(path.join(tmpdir(), "econ-fresh-"));
  tempRoots.push(root);
  const dir = path.join(root, "src", "infrastructure", "economic");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, "economic-parameters.snapshot.json"),
    JSON.stringify(snapshot)
  );
  return root;
}

function run(root: string, now: string) {
  return spawnSync("node", [SCRIPT], {
    env: {
      ...process.env,
      ECONOMIC_SNAPSHOT_ROOT: root,
      ECONOMIC_SNAPSHOT_NOW: now,
    },
    encoding: "utf8",
  });
}

const fresh = {
  capturedAt: "2026-06-17T10:15:54.895Z",
  indicatorUpdatedAt: { uf: "2026-06-17", utm: "2026-06-01", dolar: "2026-06-17" },
};

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("check-economic-snapshot-freshness", () => {
  it("passes when capturedAt and indicators are within thresholds", () => {
    const r = run(writeSnapshot(fresh), "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("fails when capturedAt is older than CAPTURE_MAX_DAYS (worker stopped)", () => {
    const r = run(writeSnapshot(fresh), "2026-07-05T00:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("capturedAt");
  });

  it("fails when a daily indicator (uf) is stale", () => {
    const stale = {
      capturedAt: "2026-06-17T10:15:54.895Z",
      indicatorUpdatedAt: { uf: "2026-05-20", utm: "2026-06-01", dolar: "2026-06-17" },
    };
    // NOW close to capturedAt so only uf trips:
    const r = run(writeSnapshot(stale), "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("uf");
  });

  it("does not age-check the managed IMM (no indicatorUpdatedAt.imm required)", () => {
    const r = run(writeSnapshot(fresh), "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(0); // fresh snapshot has no imm date and still passes
  });

  it("fails clearly when the snapshot file is missing", () => {
    const root = mkdtempSync(path.join(tmpdir(), "econ-fresh-missing-"));
    tempRoots.push(root);
    const r = run(root, "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("cannot read/parse");
  });
});
```

**Verify**: `pnpm test -- economic-snapshot-freshness` → all pass (5 tests).

### Step 4: Wire the scheduled-only CI step

In `.github/workflows/ci.yml`, inside the **`build`** job's `steps`, add a step
**guarded by the schedule event** so it never blocks a PR. Place it right after
the `"🚀 Build the project"` step (or anywhere among the build-job steps, but
before the scheduled issue-open step). Use exactly this:

```yaml
      - name: "🕰️ Economic snapshot freshness (scheduled only)"
        if: github.event_name == 'schedule'
        run: pnpm run check:economic-snapshot-freshness
```

This runs on the daily `cron: "0 5 * * *"` against `main`. On failure, the
existing `"🚨 Open issue on scheduled main failure"` step (already in this job,
`if: failure() && github.event_name == 'schedule'`) opens the tracking issue.

**Verify**: `node -e "const y=require('node:fs').readFileSync('.github/workflows/ci.yml','utf8'); if(!y.includes('check:economic-snapshot-freshness')) process.exit(1); console.log('wired')"` → prints `wired`.
**Verify** the workflow is still valid YAML: `pnpm run format:check` includes
`.yml` (it is in `lint-staged` for `*.yml`); run `pnpm exec prettier --check .github/workflows/ci.yml` → no error.

### Step 5: Full verification

**Verify**: `pnpm run test` → exit 0, no other suite affected.
**Verify**: `pnpm run lint`, `pnpm run format:check` → exit 0.

## Test plan

- `tests/scripts/check-economic-snapshot-freshness.test.ts`: fresh→pass; stale
  `capturedAt`→fail (worker stopped); stale daily indicator (uf)→fail; managed
  IMM not age-checked; missing file→clear failure.
- Structural pattern: `tests/scripts/check-domain-boundaries.test.ts` (temp root +
  `spawnSync` + env override).
- Verification: `pnpm test -- economic-snapshot-freshness` → all pass.

## Done criteria

ALL must hold:

- [ ] `scripts/check-economic-snapshot-freshness.mjs` exists; `pnpm run check:economic-snapshot-freshness` exits 0 today.
- [ ] `package.json` has the `check:economic-snapshot-freshness` script and it is **not** added to `check`/`build`/`build:ci`.
- [ ] `pnpm test -- economic-snapshot-freshness` passes (5 tests).
- [ ] `.github/workflows/ci.yml` `build` job has the scheduled-only step (`if: github.event_name == 'schedule'`).
- [ ] `pnpm run test`, `pnpm run lint`, `pnpm run format:check` exit 0.
- [ ] Only the four in-scope files changed (`git status`).
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `node scripts/check-economic-snapshot-freshness.mjs` exits 1 against the
  **committed** snapshot today — the snapshot is already stale; that is a live
  finding to escalate, not something to fix by loosening thresholds.
- The snapshot JSON shape differs from the "Current state" excerpt (no
  `capturedAt` or `indicatorUpdatedAt`) — the drift check should have caught it.
- Adding the CI step changes PR behavior in any way (it must be scheduled-only).

## Maintenance notes

- Thresholds (`CAPTURE_MAX_DAYS=10`, uf/utm/dólar) are deliberately generous to
  avoid false alarms over weekends/holidays where upstreams don't publish. If the
  worker cadence changes, revisit them. Do NOT add `uta`/`ipc`/`imm` to the
  indicator check — `uta` is yearly, `ipc` monthly with long lag, `imm` is a
  managed constant with no refresh date.
- This is a **monitoring** gate, intentionally outside the blocking PR pipeline.
  If the team later wants a hard guarantee on every build, promoting it to the
  `build` job unconditionally is a separate decision (it would block PRs whenever
  the worker is behind).
- Reviewer should confirm the `if: github.event_name == 'schedule'` guard is
  present so contributor PRs are never blocked by upstream data staleness.
- Complementary to Plan 021 (which guards against bad *values*/sudden jumps);
  this guards against *absence of updates* — the slow-staleness blind spot.
