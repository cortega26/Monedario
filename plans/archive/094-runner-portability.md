# Plan 094: Devolver los workflows de emergencia al runner portable del repo

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ece35800..HEAD -- .github/workflows/deploy-analytics-root-fix.yml .github/workflows/emergency-disable-analytics-collector.yml tests/static-analysis/actions-runner-portability.e2e.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/096-*.md MERGED (this plan's executor needs a working `pnpm install` to run vitest and to commit through the husky hook; without 096 the toolchain fails before any step — see STOP conditions)
- **Category**: tests / CI
- **Planned at**: commit `ece35800`, 2026-09-12
- **Origen:** breakage preexistente detectado al cerrar el plan 087 (suite 1441/1442 en main mergeado; el fallo se reproduce en `origin/main` prístino)

## Why this matters

The repo's runner-portability contract requires every in-scope workflow job
to run on `${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}` so CI can
move to self-hosted runners without editing dozens of files. Two workflows
added during the 2026-09-11 KV-quota incident hardcode `runs-on:
ubuntu-latest` in 3 jobs, so `tests/static-analysis/actions-runner-portability.e2e.test.ts`
fails and the whole vitest suite is red (1441/1442). The variable pattern
already falls back to `ubuntu-latest` when the repository variable is
unset, so switching loses nothing — not even for emergency paths. Small
diff, gate restored, zero behavior change on default runners.

## Current state

The contract test (`tests/static-analysis/actions-runner-portability.e2e.test.ts:8-24`):

```ts
const expectedRunner = "${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}";

// Files created entirely after the bridge retirement (2026-08-01). Every job
// in them is outside the documented ADR-20260716 bridge scope, so the whole
// file stays on hardcoded ubuntu-latest.
const fullyOutOfScopeFiles = new Set([
  "deploy-analytics-collector.yml",
  "validate-committed-artifacts.yml",
]);

// Files that mix bridge jobs with post-retirement jobs. Exceptions are keyed
// by job name so a regression in any bridge job still fails the test.
const perJobExceptions: Record<string, Record<string, string>> = {
  "security-scans.yml": {
    "gitleaks-pr": "ubuntu-latest",
  },
};
```

The test globs every `.github/workflows/*.yml` (except `fullyOutOfScopeFiles`)
and asserts each job's `runs-on` equals `expectedRunner` (or its keyed
exception). There is NO exclusion mechanism covering the two incident
workflows — they are simply non-compliant.

The three offending declarations (all `runs-on: ubuntu-latest`):

- `.github/workflows/deploy-analytics-root-fix.yml:26` — job `validate`
- `.github/workflows/deploy-analytics-root-fix.yml:71` — job `deploy`
- `.github/workflows/emergency-disable-analytics-collector.yml:29` — job `deploy`

Repo convention (exemplar — `.github/workflows/ci.yml:54`, identical in every
other in-scope workflow):

```yaml
    runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}
```

Evidence this is incident haste, not design: the emergency workflow's own
header (`emergency-disable-analytics-collector.yml:3-5`) explains it bypasses
the workspace install because of the minimumReleaseAge blockage (plan 096's
defect) — the files were written fast under incident pressure, and no ADR or
test comment documents a rationale for hardcoded runners. The `|| 'ubuntu-latest'`
fallback means the variable pattern behaves identically to hardcoded
`ubuntu-latest` whenever the repository variable is unset.

## Commands you will need

| Purpose   | Command                  | Provenance | Expected on success |
|-----------|--------------------------|------------|---------------------|
| Toolchain | `node --version`, `pnpm --version` | executed | Node 22 per `.nvmrc` (auditor saw 24.19.0 / pnpm 11.7.0; use the repo's Node 22) |
| Deps      | `pnpm install --frozen-lockfile` | executed | exit 0, lockfile byte-identical (requires plan 096 merged; on the advisor's tree at `ece35800` this FAILED with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` — if it still fails, 096 is not merged: STOP) |
| Focal     | `pnpm exec vitest run tests/static-analysis/actions-runner-portability.e2e.test.ts` | executed | 3/3 pass (advisor saw 1 failed / 2 passed pre-fix) |
| Suite     | `pnpm run test` | executed | 1442/1442 in 163 files (advisor saw 1441/1442 with this test as the sole failure) |
| Format    | `pnpm run format:check` | executed | exit 0 |
| Docs idx  | `pnpm run check:docs` | executed | exit 0 |

`executed` = advisor ran it on 2026-09-12 against `ece35800` (+087 merged).
`pnpm run test` excludes nothing; `tests/accessibility/**` runs only under Playwright.

## Scope

**In scope** (the only files you may modify):

- `.github/workflows/deploy-analytics-root-fix.yml` (2 lines: `runs-on`)
- `.github/workflows/emergency-disable-analytics-collector.yml` (1 line: `runs-on`)

**Out of scope** (do NOT touch, even though they look related):

- `tests/static-analysis/actions-runner-portability.e2e.test.ts` — the test is correct; adding an exception would weaken a decided gate. If you believe an exception is warranted, STOP and report instead.
- `.github/actions/bootstrap-pnpm/action.yml`, any other workflow — they already comply.
- `pnpm-workspace.yaml`, `pnpm-lock.yaml` — plan 096's territory.
- `src/data/**` — plan 095's territory.
- Deleting the incident workflows — the operator decides whether these one-off files stay; this plan only restores their compliance.

## Git workflow

- Branch: `advisor/094-runner-portability`
- Conventional commits, e.g. `fix(ci): route incident workflows through portable runner variable`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Establish a green-except-known-red baseline

Run the drift check first. Then `pnpm install --frozen-lockfile` on the
unmodified checkout.

- If install fails with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`: plan 096
  is not merged yet. **STOP and report** ("blocked on 096") — do not bypass,
  do not use `--no-verify`, do not edit policy files.
- If install passes: run the focal test and confirm it FAILS exactly as
  documented (1 failed / 2 passed, failing assertion names the hardcoded
  `ubuntu-latest` declarations). Record the output.

**Verify**: install exit 0; focal shows the known-red 1/2 split.

### Step 1: Switch the three jobs to the portable runner variable

In each of the three locations, replace exactly:

```yaml
    runs-on: ubuntu-latest
```

with:

```yaml
    runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}
```

Match the surrounding 4-space job-level indentation (`    runs-on:`).
Change nothing else — not timeouts, not `npx --yes` invocations, not the
emergency guards, not comments.

**Verify**: `grep -rn "runs-on: ubuntu-latest" .github/workflows/deploy-analytics-root-fix.yml .github/workflows/emergency-disable-analytics-collector.yml` returns no matches; `grep -rn "ACTIONS_RUNNER_LABEL" <both files>` returns 3 matches.

### Step 2: Prove the gate is green and nothing else moved

Run the focal test, then the full suite, then format check:

1. `pnpm exec vitest run tests/static-analysis/actions-runner-portability.e2e.test.ts` → 3/3 pass.
2. `pnpm run test` → 1442/1442 (163 files). The ONLY acceptable delta vs the
   advisor baseline (1441/1442) is this test flipping to pass. Any other
   failure is a STOP condition (drift or regression — investigate, don't fix
   out of scope).
3. `pnpm run format:check` → exit 0 (the two files are YAML; lint-staged
   covers them with prettier only).
4. `git diff --name-only` lists exactly the two in-scope files (plus the
   allowed `plans/README.md` row update / `todo.md` if you use them).

**Verify**: all four checks hold with recorded outputs.

## Test plan

- No new tests: the existing contract test IS the regression test — it failed
  pre-fix (proven on pristine `origin/main`) and passes post-fix. That
  fail→pass pair is the discrimination evidence; record both outputs.
- Structural pattern already in repo: `tests/static-analysis/security-supply-chain-config.e2e.test.ts`
  (config-as-data assertions) — no new pattern needed.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec vitest run tests/static-analysis/actions-runner-portability.e2e.test.ts` exits 0, 3/3 pass
- [ ] `pnpm run test` exits 0: 1442/1442 across 163 files
- [ ] `pnpm run format:check` exits 0
- [ ] `grep -rn "runs-on: ubuntu-latest" .github/workflows/deploy-analytics-root-fix.yml .github/workflows/emergency-disable-analytics-collector.yml` returns no matches
- [ ] `git diff --name-only <base>...HEAD` lists only the two in-scope files
      (three dots — merge-base comparison). Committed work keeps `git status` clean of source changes.
- [ ] `plans/README.md` status row updated (unless reviewer maintains the index)

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows in-scope files changed since `ece35800` and the
  excerpts above don't match (e.g. someone already fixed or deleted these workflows).
- `pnpm install --frozen-lockfile` fails on the unmodified checkout (096 not
  merged, or a NEW age violation appeared — record the exact package list).
- The focal failure names MORE than the 3 documented declarations (another
  workflow regressed — out of scope).
- Any step's verification fails twice after a reasonable fix attempt.
- A fix would require touching an out-of-scope file (especially the test's
  exception lists).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- Future incident workflows must use the variable pattern from day one — the
  portability test globs the whole directory, so any new file with a hardcoded
  runner fails the suite immediately.
- If an emergency path ever genuinely needs a pinned runner (e.g. must avoid a
  misconfigured self-hosted label), that needs a documented exception in the
  test like `perJobExceptions`, decided by the operator — not a silent hardcode.
- **Deferred:** nothing. (Deletion of these one-off incident files, if desired,
  is the operator's call, not follow-up work.)

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
