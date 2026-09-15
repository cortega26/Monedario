# Plan 106: Supply-chain hygiene (release-age retirements, override triggers, audit scoping)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 6d80d32b..HEAD -- pnpm-workspace.yaml pnpm-lock.yaml package.json docs/TECH_DEBT_BACKLOG.md .github/workflows/security-scans.yml`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `6d80d32b`, 2026-09-14 — in-scope files
  untouched since planning (drift empty); full file re-read, excerpts and
  line numbers confirmed; maturity table precomputed below for today
  (2026-09-14) — executor still runs Step 0 to verify it independently
- **Issue**: —

## Why this matters

Three supply-chain nits share one root cause: time-bombed policy without a
retirement trigger. ~30 `minimumReleaseAgeExclude` lines carry dated removal
notes (~2026-09-17/18, ~2026-09-19/20, js-yaml `|| 5.4.2` ~2026-09-20) that
rot silently — precedent `plans/archive/074-stale-overrides.md` shows 61 dead
excludes accumulated before because nothing fails when an entry goes stale.
The `fflate@0.7.3`/`sharp@0.35.2` exact-version pins drop their CVE fix the
moment a parent minor bumps. And `pnpm audit` stays red on unpatchable
`extract-zip@2.0.1` (no `>=2.0.2` published; max is `2.0.1` from 2020-06-10),
masking new regressions, while bare `pip-audit` runs audit the wrong
interpreter (151 unrelated vulns) instead of the project venv (0 vulns).
One config/docs pass restores all three signals.

## Current state

Files and roles:

- `pnpm-workspace.yaml:5-86` — overrides + `minimumReleaseAge: 10080` + excludes
- `pnpm-lock.yaml` — resolution proof
- `docs/TECH_DEBT_BACKLOG.md:5-23` — TD-0097 (release-age blocks)
- `.github/workflows/security-scans.yml` — pip-audit summary (plan 090 fixed
  clean/findings/incomplete distinction)

Excerpts as of `6d80d32b` (full file re-read; line numbers confirmed, comments quoted verbatim):

```yaml
# pnpm-workspace.yaml:28-29
fflate@0.7.3: 0.7.5
sharp@0.35.2: 0.35.4
# minimumReleaseAgeExclude:30+ dated lines, e.g.
- '@napi-rs/wasm-runtime@1.2.2 || 1.2.4'   # first-match-wins union (NOTA 2026-09-12)
- 'js-yaml@5.2.3 || 5.4.2'                  # removible desde ~2026-09-20
- 'rolldown@1.2.8' (+15 bindings)           # removible ~2026-09-17/18
- 'vite@8.3.0', '@clack/*', ...             # removible ~2026-09-19/20
```

Stale comments for `nanoid 3.3.17` (vence 2026-08-10) and `fast-uri 3.1.5`
(removible 2026-08-07) have no matching live entries — orphaned text.
`zod` resolves 3 ways (`3.25.76` via chromium-bidi = accepted LHCI path;
`4.5.4` root+astro+openai; `4.4.3` via @astrojs/rss+sitemap+knip) — transitive
only, no action beyond tracking. `astro ^7.2.9` resolves `7.3.1` (float
within `^`; last reviewed bump tested `7.2.9`).

RECONCILIATION NOTE — maturity table for today (2026-09-14), still subject
to Step-0 verification. REMOVE now: the two orphaned 2026-08 comment blocks
(`:35-38`, no live entries) and `- 'qs@6.16.0'` (`:53` with its `:39-41`
comment — matured 2026-09-05). LEAVE (future-dated or undated): napi union
`:45` (~09-18), `eslint-plugin-astro@2.1.1` `:46` (no removal date —
leave), js-yaml union `:51` (~09-20), `postcss@8.5.25` `:52` (no removal
date — leave), rolldown cohort `:58-75` (~09-17/18), clack/vite cohort
`:80-86` (~09-19/20). Note `fast-uri: '>=3.1.6'` override (`:10`) already
supersedes the orphaned 3.1.5 comment. The fflate/sharp pins (`:28-29`)
already carry remove-when guidance (`:20-27`); Step 2 converts that prose
into per-line `remove-when:` triggers + range form. TD-0097 lives at
`docs/TECH_DEBT_BACKLOG.md:5-23`; the pip-audit wrong-interpreter call is
`security-scans.yml:282` (`uv run pip-audit`); no `check-workspace-*`
script pattern exists (do not create CI scripts).

Conventions: `pnpm install --frozen-lockfile` is the verification for every
exclude removal (per the file's own comments); `first-match-wins` per-name
unions; conventional commits; Dependabot groups runtime/dev.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install (frozen) | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Audit (read-only) | `pnpm audit --audit-level=high` | declared | see Done criteria (scoped) |
| Format check (scoped) | `pnpm exec prettier --check pnpm-workspace.yaml docs/TECH_DEBT_BACKLOG.md` | declared | exit 0 |

## Scope

**In scope**:

- `pnpm-workspace.yaml` (retire matured excludes; widen two exact pins to
  ranges with `remove-when` triggers; delete orphaned 2026-08 comments)
- `docs/TECH_DEBT_BACKLOG.md` (TD-0097 update + per-pin removal checklist)
- `.github/workflows/security-scans.yml` or audit runbook docs (scope the
  extract-zip exception to dev-only LHCI paths; record canonical venv-pinned
  pip-audit invocation)
- `pnpm-lock.yaml` (only as the generated result of a successful frozen
  install — never hand-edit)

**Out of scope**:

- Version bumps, lockfile rewrites beyond the frozen-install result, LHCI
  replacement (M — deferred, needs release-cadence investigation), TS7
  re-arm beyond a calendar/docs note, any `src/` change, zod unification
  (transitive-only — track, don't touch).

## Git workflow

- Branch: `advisor/106-supply-chain-hygiene`
- Commits: one per cohort (e.g. `chore(deps): retire matured minimumReleaseAge excludes (rolldown cohort)`), plus docs commit
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Baseline (read-only)

Record `pnpm audit --audit-level=high` output (expect the 2 extract-zip
HIGHs) and confirm which exclude cohorts have matured by comparing today
(≥2026-09-14; some cohorts mature ~09-17/18/19/20 — future-dated ones are
NOT removable yet; only remove matured lines, leave the rest with their
dates). Do not install yet.

**Verify**: cohort maturity table recorded in the commit message or plan
working notes (which lines are due vs pending).

### Step 1: Retire only matured excludes + delete orphan comments

Delete the two orphaned 2026-08 comments, then remove ONLY the matured
exclude lines, one cohort per commit, running
`pnpm install --frozen-lockfile` after each. Non-zero exit → restore that
cohort's lines (still needed) and continue with the next cohort.

**Verify**: frozen install exits 0 after each cohort removal.

### Step 2: Make the two CVE pins parent-aware

Widen `fflate@0.7.3: 0.7.5`-style exact pins to range form (e.g.
`fflate@<0.7.5: 0.7.5`) with an explicit `remove-when: <parent> resolves
patched` comment per line, and add a lockfile assertion note (resolved
versions must stay patched). Verify with frozen install (resolution must
still be `0.7.5`/`0.35.4` today).

**Verify**: frozen install exit 0; `pnpm why fflate sharp` still shows the
patched versions.

### Step 3: Scope the unpatchable + pin the Python invocation (docs)

Document the `extract-zip@2.0.1` exception as dev-only LHCI-chain
(`@lhci/cli → lighthouse → puppeteer`) with monthly registry re-check for a
real `2.0.2`; gate wording must not mask runtime advisories. Record the
canonical read-only Python invocation (project venv:
`.venv/bin/python -m pip_audit`, or `uv run --project . --frozen`) wherever
the audit runbook lives; note that bare `uv run pip-audit` audits the wrong
interpreter. Update TD-0097 status accordingly. Also record: zod `4.4.3` vs
`4.5.4` split (track @astrojs/rss+sitemap+knip releases, no action), astro
`7.2.9→7.3.1` float (changelog check on next bump; rollback = manifest +
lockfile only), TS7 probe (dispatch-only monthly notify — docs note only).

**Verify**: prettier check on touched docs/yaml exit 0.

## Test plan

- No vitest changes. Verification is: frozen install per cohort, `pnpm audit`
  output comparison (only the scoped extract-zip HIGHs remain), `pnpm why`
  pin proof, prettier check.
- If a `check-workspace-*` script pattern exists, follow it; otherwise do not
  create new CI scripts in this plan (a lockfile-vs-workspace checker is a
  separate deferred item).

## Done criteria

- [ ] Only matured excludes removed (each verified by frozen install exit 0)
- [ ] Orphan 2026-08 comments deleted
- [ ] CVE pins parent-aware with `remove-when` triggers; resolved versions still patched
- [ ] extract-zip exception scoped dev-only with re-check note; no runtime advisory masked
- [ ] Canonical pip-audit invocation documented; TD-0097 updated
- [ ] `git diff --check` clean; diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift; frozen install fails and the cohort cannot be restored cleanly
  (STOP — restore `git checkout -- pnpm-workspace.yaml pnpm-lock.yaml` and
  report); a removal changes resolved versions beyond the cohort (STOP);
  registry shows a real `extract-zip 2.0.2` (STOP — prefer the real patch
  over the exception doc); `declared` baseline broken.

## Maintenance notes

- On every Dependabot bump, trial-remove the pin whose parent moved (the
  `remove-when` comments say which).
- Reviewer: confirm no future-dated cohort was removed early.
- **Deferred:** LHCI replacement (needs upstream patch-state + cadence
  investigation); workspace-exclusion staleness checker script; zod
  unification (track only).
