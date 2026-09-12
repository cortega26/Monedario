# Plan 096: Excepciones transitorias de minimumReleaseAge para desbloquear installs, hooks y CI

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ece35800..HEAD -- pnpm-workspace.yaml pnpm-lock.yaml package.json .github/actions/bootstrap-pnpm/action.yml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED (touches a supply-chain gate — transitional and version-pinned by design, but the reviewer and merger must eyeball every excluded version)
- **Depends on**: none — this plan is the unblocker; plans 094 and 095 are blocked on THIS plan being merged
- **Category**: dx / security (supply-chain policy maintenance)
- **Planned at**: commit `ece35800`, 2026-09-12
- **Origen:** bloqueo detectado al cerrar el plan 087 (el hook pre-commit falla `pnpm install` con `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`; reproducido también con `--frozen-lockfile`, el comando exacto del bootstrap de CI)

## Why this matters

Every `pnpm install` in the repo currently fails — including
`pnpm install --frozen-lockfile`, the exact command CI's bootstrap runs
(`.github/actions/bootstrap-pnpm/action.yml:34`), and the auto-install that
the husky pre-commit hook triggers before `lint-staged`. Consequences, all
verified by the advisor on 2026-09-12: CI's `lint-and-test` job cannot pass
bootstrap on any PR, no local commit can land (hook fails first), and no
fresh checkout can install dependencies. The cause is NOT a bad dependency:
upstream PRs #472 (sharp 0.35.3→0.35.4) and the 2026-09-11 runtime-group bump
legitimately pulled 19 transitive versions published 2026-09-07/09/10, which
sit inside the repo's 7-day `minimumReleaseAge` window (cutoff = now minus 7
days). The repo already owns the remedy for exactly this situation:
time-boxed, version-pinned `minimumReleaseAgeExclude` entries (see the four
precedents in `pnpm-workspace.yaml`, all annotated with expiry). Adding the
19 entries in that same style unfreezes installs, hooks and CI without
changing a single resolved version — and they age out on their own within
days. Alternatives considered and rejected: reverting the sharp/runtime bumps
(larger blast radius, discards legitimate updates); waiting ~5 days for
maturation (leaves CI red and commits blocked that whole time); rebuilding
the lockfile (re-resolution today yields the same young versions, plus churn).

## Current state

The policy (`pnpm-workspace.yaml:18-34`):

```yaml
minimumReleaseAge: 10080
# Transitional, version-pinned exceptions for packages already trusted in the
# lockfile before the seven-day policy was enabled. Future releases remain
# subject to minimumReleaseAge and these entries can be removed after aging out.
minimumReleaseAgeExclude:
  # Seguridad (2026-08-09): nanoid 3.3.17 corrige GHSA-2v37-7h3g-55p8. Esta
  # excepción vence al cumplir los siete días de maduración (2026-08-10).
  # Seguridad (2026-08-03): fast-uri 3.1.5 (parche forzado por override),
  # transitoria — removible desde 2026-08-07 junto con el override.
  # Seguridad (2026-09-04): qs 6.16.0 corrige GHSA (array-limit bypass,
  # alertas Dependabot #104). Publicado 2026-08-29; excepción transitoria
  # hasta madurar los siete días — removible desde 2026-09-05.
  - '@napi-rs/wasm-runtime@1.2.2'
  - 'eslint-plugin-astro@2.1.1'
  - 'js-yaml@5.2.3'
  - 'postcss@8.5.25'
  - 'qs@6.16.0'
```

The failure (advisor-reproduced 2026-09-12, `pnpm install --frozen-lockfile`
→ exit 1, `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, 19 entries). Shape of
each line (derive the LIVE list from your own run — do not trust a
transcription; entries age out with time, so your list may be shorter):

```
@rolldown/binding-linux-x64-gnu@1.2.8 was published at 2026-09-09T09:44:30.000Z, within the minimumReleaseAge cutoff (...)
nanoid@3.3.19 was published at 2026-09-10T17:53:16.000Z, within the minimumReleaseAge cutoff (...)
```

The 19 entries fall into three families: `rolldown@1.2.8` + its
`@rolldown/binding-*@1.2.8` natives, `@oxc-project/types@0.149.0`,
`@napi-rs/wasm-runtime@1.2.4`, `nanoid@3.3.19` (note: the existing exclude
pins `wasm-runtime@1.2.2` and an older nanoid — versions, not ranges, so the
new versions need their own lines).

CI impact (inlined so the executor understands the blast radius): the
bootstrap composite action installs pnpm from `packageManager`, sets up Node,
then runs `pnpm install --frozen-lockfile` — the failing command. Until this
plan lands, every PR's first job fails at bootstrap.

Known context, not to be "fixed" here: `.github/workflows/emergency-disable-analytics-collector.yml:3-5`
documents that the operator already worked around this blockage for the KV
incident by bypassing the workspace install (`npx wrangler` directly). That
workaround stays; this plan restores the normal path.

## Commands you will need

| Purpose   | Command | Provenance | Resultado esperado |
| --- | --- | --- | --- |
| Toolchain | `node --version`, `pnpm --version` | executed | Node 22 per `.nvmrc` (advisor saw 24.19.0 / pnpm 11.7.0; use repo's Node 22) |
| Repro | `pnpm install --frozen-lockfile` | executed | PRE-fix: exit 1 with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` (record full list). POST-fix: exit 0 |
| Lockfile intact | `git diff --stat -- pnpm-lock.yaml` | executed | empty before AND after (you must never modify the lockfile) |
| Suite | `pnpm run test` | executed | 1441/1442 with the SOLE failure in `tests/static-analysis/actions-runner-portability.e2e.test.ts` (plan 094's scope, not yet merged — record it, do not fix it here) |
| Format | `pnpm run format:check` | executed | exit 0 |
| Docs idx | `pnpm run check:docs` | executed | exit 0 |

`executed` = advisor ran it on 2026-09-12 (main at/after `ece35800`).

## Scope

**In scope** (the only file you may modify):

- `pnpm-workspace.yaml` (append transitional entries + dated comments under `minimumReleaseAgeExclude` only)

**Out of scope** (do NOT touch):

- `pnpm-lock.yaml` — must remain byte-identical. Never run bare `pnpm install`
  (re-resolves), `pnpm update`, `pnpm clean --lockfile`, or any command that
  rewrites it. Only `--frozen-lockfile`.
- `package.json` version ranges, `overrides`, `minimumReleaseAge` itself (the
  7-day rule stays).
- Existing exclude entries: do not delete a pinned version and do not
  "consolidate" distinct packages. EXCEPTION (added 2026-09-12 from executor
  evidence on pnpm 11.7.0): pnpm evaluates `minimumReleaseAgeExclude`
  first-match-wins PER PACKAGE NAME — a second same-name line is dead code
  (proven: appending all 19 entries left exactly 1 residual,
  `@napi-rs/wasm-runtime@1.2.4`, shadowed by the pre-existing
  `'@napi-rs/wasm-runtime@1.2.2'` line; the 1.2.2 version is no longer even in
  the lockfile). So when an excluded name repeats, MERGE the versions into ONE
  union line using pnpm-native `||` syntax: `'@napi-rs/wasm-runtime@1.2.2 || 1.2.4'`.
  Exact versions only, no ranges; keep every version named; comment the line
  with the first-match-wins rationale.
- Workflows (094), `src/data/**` (095), anything else. If the fix seems to
  require another file, STOP.

## Git workflow

- Branch: `advisor/096-lockfile-release-age-excludes`
- Conventional commits, e.g. `chore(deps): transitional minimumReleaseAge excludes for 2026-09-11 bumps`
- Do NOT push or open a PR unless the operator instructed it.
- NOTE: your commits will exercise the husky pre-commit hook (`pnpm exec
  lint-staged` → pnpm auto-install). Pre-fix the hook fails (expected — it is
  the same defect); once your fix is STAGED, the hook evaluates the staged
  tree and should pass. If the hook still fails after your edit is staged,
  the fix is incomplete: STOP and report, do not `--no-verify`.

## Steps

### Step 0: Reproduce and derive the authoritative entry list

Run the drift check first. Then on the unmodified checkout:

1. `pnpm install --frozen-lockfile` → expect exit 1. Record the COMPLETE
   `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` list (every `name@version was
   published at ...` line). This live list — not the plan's 19-entry
   description — is your source of truth.
2. `git diff --stat -- pnpm-lock.yaml` → empty (baseline: lockfile untouched).
3. For EACH violating entry, confirm `grep -F "<name>@<version>" pnpm-lock.yaml`
   matches (the version is already locked upstream — you are excluding what is
   committed, blessing nothing new).

**Verify**: exit-1 output recorded; lockfile diff empty; every entry greps in the lockfile.

### Step 1: Add transitional, version-pinned excludes

Append to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`, following the
file's existing style (single-quoted `'name@version'`, one per line), preceded
by a dated comment group in the same voice as the existing ones, e.g.:

```yaml
  # Transitoria (2026-09-12): arrastre de los bumps 2026-09-11 (sharp #472 y
  # grupo runtime) — publicados <7 días (ver pnpm install). Removible cuando
  # maduren (~2026-09-18); ver plan 096.
```

Rules: exact versions only, no ranges, no wildcards. One line per violating
entry from Step 0 — EXCEPT same-name repeats, which must be merged into the
existing line as a `'name@a || b'` union (see Scope exception; a standalone
second line is silently dead). Touch NOTHING else in the file (indentation 2
spaces, existing entries and comments otherwise verbatim).

Self-correcting property: if you mistype an entry, the Step-2 install still
fails naming the correctly-spelled package — fix the spelling, don't improvise.

**Verify**: `git diff --stat` shows only `pnpm-workspace.yaml`; `git diff` shows
only added lines under `minimumReleaseAgeExclude` plus the comment, EXCEPT at most
one modified line for a same-name version union (see Scope exception).

### Step 2: Prove installs, hooks and scope

1. `pnpm install --frozen-lockfile` → exit 0. (First green install.)
2. `git diff --stat -- pnpm-lock.yaml` → still empty. (No resolution churn.)
3. `pnpm run test` → 1441/1442 with the SOLE failure in
   `actions-runner-portability` (094 pending). Any other failure = STOP.
4. `pnpm run format:check` and `pnpm run check:docs` → exit 0.
5. Commit on your branch NORMALLY (no `--no-verify`, no env overrides). The
   pre-commit hook must pass — that is the end-to-end proof the unblock works.
   If the hook fails: STOP, do not bypass, report the hook output.

**Verify**: all five with recorded outputs; commit hash exists on
`advisor/096-lockfile-release-age-excludes` with hook passed.

## Test plan

No new tests: the install command itself is the acceptance test (red→green
pair recorded in Steps 0/2), and the hook-passing commit is the end-to-end
proof. Existing supply-chain config tests (`security-supply-chain-config.e2e.test.ts`)
must keep passing inside the Step-2 suite run.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm install --frozen-lockfile` exits 0 on the modified tree (was exit 1 with the age violation pre-fix, both outputs recorded)
- [ ] `git diff <base>...HEAD -- pnpm-lock.yaml` is empty (zero version/hash churn)
- [ ] Every added exclude line matches a `name@version` present in `pnpm-lock.yaml`
- [ ] `pnpm run test` shows 1441/1442 with the only failure in `actions-runner-portability`
- [ ] `pnpm run format:check`, `pnpm run check:docs` exit 0
- [ ] The worktree commit landed WITHOUT `--no-verify` (hook passed)
- [ ] `git diff --name-only <base>...HEAD` lists only `pnpm-workspace.yaml`
- [ ] `plans/README.md` status row updated (unless reviewer maintains the index)

## STOP conditions

Stop and report back (do not improvise) if:

- The live violation list contains packages NOT traceable to the committed
  lockfile (`grep` miss) — possible tamper or re-resolution; never exclude
  what isn't locked.
- The fix requires modifying `pnpm-lock.yaml`, version ranges, overrides, or
  the `minimumReleaseAge` value itself.
- `pnpm install --frozen-lockfile` still fails after your edit (incomplete
  coverage — report the remaining entries, don't loosen anything else).
- The pre-commit hook fails on your commit for any reason (report output;
  never `--no-verify` — that flag is the reviewer's/operator's call only).
- Any gate in Step 2 fails twice after a reasonable attempt.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- These excludes are TRANSITIONAL. Each expires by maturation (~7 days after
  the package's publish date; latest here ~2026-09-10 → removable ~2026-09-17/18).
  Removal is safe to attempt any time after: delete the lines, run
  `pnpm install --frozen-lockfile`, keep the deletion iff exit 0.
- **Deferred:** retirar las excepciones transitorias del plan 096 cuando maduren los paquetes (~2026-09-18) — quitar las líneas, correr `pnpm install --frozen-lockfile`, conservar el borrado solo si sale 0.
- If a FUTURE bump re-triggers the violation, that is the policy working as
  designed (forcing a human look at fresh transitive code) — repeat this
  pattern, don't raise the threshold or widen excludes to ranges.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
