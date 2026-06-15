# Plan 021: Endurecer el worker de snapshot económico contra datos upstream corruptos

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 57ad5261..HEAD -- workers/economic-snapshot-refresh/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug (correctness / data integrity)
- **Planned at**: commit `57ad5261`, 2026-06-15

## Why this matters

A deployed Cloudflare Worker (`monedario-snapshot-bot`) refreshes the economic
snapshot **daily** and commits it to the repo. That snapshot (`uf`, `utm`,
`uta`, `ipc`, `tmc`, `dolar`) is the single source of truth read at build time
by `src/infrastructure/economic/EconomicParameterProvider.ts` and feeds **every**
YMYL calculator (net salary, tax, severance, mortgage, pension). Two gaps let
corrupt-but-numeric upstream data silently poison it:

1. **Absent IPC becomes `0`.** `buildSnapshot` reads
   `Number(payload?.ipc?.valor ?? 0)`. If both mindicador.cl and the INE override
   omit IPC, the snapshot publishes "0% inflation" instead of failing — masking a
   data outage and publishing a wrong macro figure on a finance site.
2. **No plausibility floor on UF/UTM/dolar.** `assertFinitePositive` only rejects
   `NaN`/`0`/negative. A mindicador.cl response with `uf: 4035` (a real value
   off by 10×, e.g. a decimal/parse glitch) passes validation and corrupts every
   calculation. There is no comparison against the previous snapshot.

Separately, the GitHub Contents API calls in `githubClient.ts` are the only
worker fetches **without** a network timeout (every data-source fetch has one),
so a slow GitHub can hang the run.

The fix makes the refresh **fail closed**: on missing IPC or an implausible
day-over-day jump, the worker throws (the cron run logs an error and the last
known-good snapshot stays in place) rather than committing bad data.

## Current state

Files:
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts` — builds + validates
  the snapshot; exports `buildSnapshot`, `mergePrev`, `serializeSnapshot`.
- `workers/economic-snapshot-refresh/src/index.ts` — `runRefresh` orchestrates
  fetch → build → read current → merge → commit.
- `workers/economic-snapshot-refresh/src/githubClient.ts` — `getCurrentFile` /
  `putFile` against the GitHub Contents API.

**IPC default-to-zero** (`buildSnapshot.ts`, around line 137):

```ts
  let ipc = Number(payload?.ipc?.valor ?? 0);
```

The existing validation block already rejects non-finite IPC (`buildSnapshot.ts`,
around lines 190–198) — note IPC may legitimately be `0` or negative
(deflation), so only *absent* IPC must fail:

```ts
  assertFinitePositive(uf, "UF");
  assertFinitePositive(utm, "UTM");
  if (!Number.isFinite(ipc)) {
    throw new Error("IPC must be a finite number.");
  }
  assertFinitePositive(tmc, "TMC");
  if (dolar !== undefined) {
    assertFinitePositive(dolar, "Dolar");
  }
  assertFinitePositive(uta, "UTA");
```

`assertFinitePositive` (lines ~99–103):

```ts
function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite number greater than 0.`);
  }
}
```

**runRefresh orchestration** (`index.ts`, around lines 152–162) — `current` holds
the previous snapshot JSON, which is the reference for a deviation guard:

```ts
  const rawSnapshot = await buildSnapshot({ /* ...fetchers... */ });

  const current = await getCurrentFile(config);
  const snapshot = mergePrev(current.content, rawSnapshot);
  const serialized = serializeSnapshot(snapshot);
```

**githubClient fetches without timeout** (`githubClient.ts`, lines ~63 and ~97):

```ts
  const response = await fetch(url, { headers: authHeaders(config.token) });   // getCurrentFile
  // ...
  const response = await fetch(url, {                                          // putFile
    method: "PUT",
    headers: { ...authHeaders(config.token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
```

For reference, every data-source fetch in this worker uses
`signal: AbortSignal.timeout(timeoutMs)` (see `buildSnapshot.ts` fetchers,
`bcchSiete.ts`, `ineIpc.ts`, `redditClient.ts`). Match that convention.

**Tests** live in `tests/workers/economic-snapshot-refresh/` — model new tests
after `buildSnapshot.test.ts` (it constructs `buildSnapshot` deps with stubbed
fetchers and asserts on the resulting snapshot).

## Commands you will need

| Purpose       | Command                                                    | Expected on success |
|---------------|------------------------------------------------------------|---------------------|
| Typecheck     | `pnpm exec astro check`                                    | 0 errors            |
| Worker tests  | `pnpm test -- tests/workers/economic-snapshot-refresh`     | all pass (incl. new)|
| Full suite    | `pnpm test`                                                | all pass            |
| Lint / format | `pnpm run lint` ; `pnpm run format:check`                  | exit 0              |

## Scope

**In scope**:
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts`
- `workers/economic-snapshot-refresh/src/index.ts`
- `workers/economic-snapshot-refresh/src/githubClient.ts`
- `tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts` (extend)

**Out of scope** (do NOT touch):
- `src/infrastructure/economic/EconomicParameterProvider.ts` and any site code —
  the consumer is fine; this plan only hardens the producer.
- `mergePrev` behavior / the snapshot JSON shape — do not add or rename snapshot
  fields. The deviation guard reads the previous JSON but must not change the
  output schema.
- `wrangler.toml` / secrets / deployment — no infra changes here.
- The reddit-mention-monitor worker.

## Git workflow

- Branch: `advisor/021-economic-snapshot-hardening`
- Commit per logical unit (IPC fix; deviation guard; timeouts) or one commit;
  conventional-commit style: `fix(worker): endurecer validación de snapshot económico (Plan 021)`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Fail on absent IPC instead of defaulting to 0

In `buildSnapshot.ts`, replace the `?? 0` default with an **explicit type check**
so that an absent IPC becomes `NaN` (caught by the existing `Number.isFinite`
guard). Do NOT use a bare `Number(payload?.ipc?.valor)` — `Number(null)` is `0`,
which would silently reintroduce the masking bug if the upstream sends `ipc:
{ valor: null }`. Use:

```ts
  const ipcRaw = payload?.ipc?.valor;
  let ipc = typeof ipcRaw === "number" ? ipcRaw : NaN;
```

Leave the override block and the `if (!Number.isFinite(ipc)) throw ...` check
exactly as they are — together they now reject only the *absent/null* case while
still allowing a legitimate `0` or negative IPC that arrives from a source.

**Verify**: `pnpm test -- tests/workers/economic-snapshot-refresh` still passes.
Note: the shared `makeDeps()` helper in `buildSnapshot.test.ts` already supplies
`ipc: { valor: -0.2 }` in its stub `api` and passes **no** `fetchIpcOverride` by
default, so this change breaks **zero** existing tests. If any existing test does
break, STOP and report — it would mean the test relied on the old `0` default,
which is the bug; do not re-add `?? 0`.

### Step 2: Add a plausibility deviation guard against the previous snapshot

In `buildSnapshot.ts`, add an exported pure function that compares the new
snapshot's fast-moving indicators against the previously committed JSON and
throws if any moved more than a generous threshold. UF is an indexed unit that
moves <0.1%/day, UTM is a monthly step (<2% month-over-month), and the USD
observed rate rarely moves >10%/day — so these thresholds catch a 10× glitch
while never tripping on real movement. First run (no parseable previous value)
skips the check.

```ts
/**
 * Rechaza saltos implausibles respecto al snapshot anterior. Una UF/UTM/dólar
 * que cambia 10× (típico de un glitch de parseo upstream) supera estos umbrales
 * generosos; el movimiento real diario/mensual nunca lo hace. Si no hay valor
 * previo parseable (primera ejecución), no valida ese indicador.
 */
export function assertPlausibleDelta(
  previousJson: string,
  snapshot: EconomicSnapshot
): void {
  let prev: Partial<EconomicSnapshot>;
  try {
    prev = JSON.parse(previousJson) as Partial<EconomicSnapshot>;
  } catch {
    return; // no previous snapshot to compare against
  }

  const checks: Array<[string, number | undefined, number | undefined, number]> = [
    ["UF", prev.uf, snapshot.uf, 0.05],
    ["UTM", prev.utm, snapshot.utm, 0.2],
    ["Dolar", prev.dolar, snapshot.dolar, 0.15],
  ];

  for (const [label, before, after, maxRelChange] of checks) {
    if (
      typeof before !== "number" ||
      typeof after !== "number" ||
      before <= 0
    ) {
      continue;
    }
    const relChange = Math.abs(after - before) / before;
    if (relChange > maxRelChange) {
      throw new Error(
        `${label} deviation ${(relChange * 100).toFixed(1)}% exceeds ${(
          maxRelChange * 100
        ).toFixed(0)}% (prev=${before}, new=${after}); refusing to publish.`
      );
    }
  }
}
```

Then call it in `index.ts` `runRefresh`, immediately after `getCurrentFile` and
before `mergePrev`:

```ts
  const current = await getCurrentFile(config);
  assertPlausibleDelta(current.content, rawSnapshot);
  const snapshot = mergePrev(current.content, rawSnapshot);
```

Add `assertPlausibleDelta` to the existing import from `./buildSnapshot` at the
top of `index.ts`.

**Verify**: `pnpm exec astro check` → 0 errors.

### Step 3: Add network timeouts to the GitHub Contents fetches

In `githubClient.ts`, add `signal: AbortSignal.timeout(15_000)` to both fetch
calls (`getCurrentFile` and `putFile`), matching the timeout convention used by
every other fetch in this worker:

```ts
  const response = await fetch(url, {
    headers: authHeaders(config.token),
    signal: AbortSignal.timeout(15_000),
  });
```

```ts
  const response = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(config.token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
```

The existing `if (!response.ok)` error handling already covers the failure path;
a timeout rejects the fetch and aborts the run, which is the intended behavior.

**Verify**: `pnpm exec astro check` → 0 errors.

## Test plan

Extend `tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts`. That file
has a `makeDeps(overrides?)` helper (its stub `api` includes
`ipc: { valor: -0.2 }` and supplies no override by default) and an established
"throws if X not finite" pattern, e.g.:

```ts
  it("throws if UF is not a positive finite number", async () => {
    const broken = { ...api, uf: { valor: 0, fecha: "..." } };
    await expect(buildSnapshot(makeDeps({ api: broken }))).rejects.toThrow(/UF/);
  });
```

and a destructure-to-omit pattern (`const { dolar, ...rest } = api;` then
`makeDeps({ api: rest })`). Model the new cases on those:

- **IPC absent throws**: `const { ipc, ...rest } = api;` then
  `await expect(buildSnapshot(makeDeps({ api: rest }))).rejects.toThrow(/IPC/)`
  (no override supplied, so absent → `NaN` → throws).
- **IPC = 0 is accepted**: `makeDeps({ api: { ...api, ipc: { valor: 0, fecha: api.ipc.fecha } } })`
  → resolves, snapshot `ipc === 0`.
- **`assertPlausibleDelta` rejects a 10× UF jump**: `previousJson` with
  `uf: 40350`, snapshot with `uf: 4035` → throws.
- **`assertPlausibleDelta` accepts normal movement**: prev `uf: 40350`, new
  `uf: 40360` → does not throw.
- **`assertPlausibleDelta` no-ops without a previous value**: `previousJson` =
  `"{}"` or `"not json"` → does not throw.

Verification: `pnpm test -- tests/workers/economic-snapshot-refresh` → all pass,
including the 5 new cases; then `pnpm test` → full suite green.

## Done criteria

ALL must hold:

- [ ] `buildSnapshot.ts` no longer contains `?? 0` for IPC (`grep -n "ipc?.valor" workers/economic-snapshot-refresh/src/buildSnapshot.ts` shows no `?? 0`)
- [ ] `assertPlausibleDelta` is exported from `buildSnapshot.ts` and called in `runRefresh` before `mergePrev`
- [ ] Both `githubClient.ts` fetches pass `signal: AbortSignal.timeout(...)`
- [ ] `pnpm exec astro check` exits 0
- [ ] `pnpm test -- tests/workers/economic-snapshot-refresh` passes with 5 new cases
- [ ] `pnpm test` exits 0 (no regressions)
- [ ] `pnpm run lint` and `pnpm run format:check` exit 0
- [ ] Only in-scope files modified (`git status`)
- [ ] `plans/README.md` status row for 021 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The "Current state" excerpts don't match the live files (drift).
- `EconomicSnapshot` does not actually expose `uf`/`utm`/`dolar` as the snapshot
  type used by `mergePrev` (the deviation guard assumption is false).
- The IPC change breaks **any** existing test (the shared `makeDeps()` supplies
  IPC, so it should break none) — report rather than editing test expectations,
  since a break would mean a test depended on the old `0` default.
- A real economic event would plausibly exceed a threshold (e.g. evidence in the
  repo that the USD rate legitimately moves >15%/day) — report so thresholds can
  be reconsidered rather than guessing.
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- For the reviewer: the change is fail-closed by design — a missing IPC or a big
  jump now aborts the daily refresh and keeps the last good snapshot. Confirm
  that's acceptable operationally (a genuinely huge-but-real move would require a
  manual refresh or a threshold bump). The thresholds (UF 5%, UTM 20%, USD 15%)
  are intentionally generous; tighten only with data.
- If a new fast-moving indicator is ever added to the snapshot, add it to the
  `assertPlausibleDelta` `checks` array with an appropriate threshold.
- Deferred out of scope: alerting when the refresh aborts (today it only logs).
  Consider wiring a failure notification if silent cron failures become a problem.
