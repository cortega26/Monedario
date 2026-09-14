# Plan 101: Purge the stale committed Pagefind index before copy-back

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0e506a8b..HEAD -- package.json scripts/check-postbuild.mjs`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Issue**: —

## Why this matters

Every build regenerates a clean ~1.3 MB Pagefind index into `dist/pagefind`
(plan 057's fix holds), then copies it over `public/pagefind/` without
cleaning the destination first. Measured at audit time: `dist/pagefind`
1.3 MB / 72 files vs `public/pagefind` 3.6 MB / 233 files with 8 stale
`pagefind.es_*.pf_meta` fragments (ago-10…sep-05) shadowing the 1 current
index. ~2.3 MB of stale search fragments are shipped and committed on every
build — the exact 057 regrowth recurring through a different door.

## Current state

Files and roles:

- `package.json:10` (`build`) and `:11` (`build:ci`) — index + copy chain
- `scripts/check-postbuild.mjs:248` — budgets only `dist/pagefind`
- `public/pagefind/` — committed copy-back destination (stale)
- `dist/pagefind/` — fresh build output (clean)

Excerpts as of `0e506a8b`:

`package.json:10`:

```
"build": "pnpm run check:images && ... && astro build && ... && rm -rf dist/pagefind && pagefind --site dist && node -e \"require('fs').appendFileSync('dist/pagefind/pagefind-worker.js','/* _headers-csp-v2 */\\n')\" && cp -r dist/pagefind public/ && pnpm run check:urls && ..."
```

No `rm -rf public/pagefind` precedes the `cp -r`. `check-postbuild.mjs:248`
asserts the `dist` budget only. Verified live: `du -sh dist/pagefind
public/pagefind` → `1,3M dist/pagefind`, `3,6M public/pagefind`.

Conventions: build chain is `package.json` scripts; post-build gates read
`dist/`; conventional commits (`perf(...)`/`fix(...)`).

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Post-build check (scoped) | `node scripts/check-postbuild.mjs dist` | declared | exit 0 (after a build) |
| Diff check | `git diff --check` | declared | exit 0, no output |

## Scope

**In scope**:

- `package.json` (both `build` and `build:ci` copy-back lines only)
- `scripts/check-postbuild.mjs` (extend the pagefind budget to assert
  `public/pagefind` file count ≈ `dist/pagefind`; tolerate absence pre-build)

**Out of scope**:

- Pagefind relevance/recall, `data-pagefind-body` coverage, index tuning.
- `check:urls`, CSP/shield hashing of `pagefind-worker.js` (separate
  investigate; do not reorder the `appendFileSync` line).
- Deleting search UI or changing the search route.

## Git workflow

- Branch: `advisor/101-pagefind-public-purge`
- Commits: e.g. `perf(build): purge stale committed pagefind before copy-back`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline (no build)

Confirm the chain reads as cited (`grep -n "cp -r dist/pagefind public" package.json`)
and the size gap reproduces (`du -sh dist/pagefind public/pagefind` if both
exist; if `dist/` is absent, record that and proceed — do not run a full
build for baselining).

**Verify**: cited lines match; gap recorded or `dist/` absence recorded.

### Step 1: Purge before copy-back in both build scripts

Insert `rm -rf public/pagefind` immediately before each
`cp -r dist/pagefind public/` in `build` and `build:ci`. Keep the
`appendFileSync` line exactly where it is (post-hash ordering question is
explicitly out of scope).

**Verify**: `grep -n "rm -rf public/pagefind" package.json` → 2 matches
(or 1 if the two scripts share a sub-script after your edit — document it).

### Step 2: Extend the post-build budget to the committed copy

In `scripts/check-postbuild.mjs`, after the existing `dist/pagefind` budget
check, assert `public/pagefind` (when present) has file count within a small
tolerance of `dist/pagefind` and fails on stale `pf_meta` multiplicity
(>1 `pagefind.*.pf_meta` besides the entry manifest). The check must pass
when `public/pagefind` is absent (pre-copy local state) — warn, don't fail.

**Verify**: `node scripts/check-postbuild.mjs dist` → exit 0 on current tree
(post-edit, pre-build tolerance path).

## Test plan

- No new vitest file required (build-chain + script gate). If the repo has a
  `tests/scripts/check-postbuild*` pattern, add cases: stale-multi-`pf_meta`
  fixture → fail; absent-`public/pagefind` → pass-with-warning; equal trees →
  pass. Otherwise assert via the script run in Step 2.
- Verification: Step-2 command → exit 0.

## Done criteria

- [ ] Both build scripts purge `public/pagefind` before copy-back
- [ ] Post-build gate covers the committed copy (or warns-only when absent)
- [ ] `git diff --check` clean; `git diff --name-only 0e506a8b...HEAD` lists only in-scope files
- [ ] `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; the purge breaks `pagefind-entry.json`
  resolution (verify entry exists after copy — if the build globs change,
  STOP); `public/pagefind` turns out gitignored on this tree (then the stale
  weight is local-only — STOP and report instead of editing build scripts).

## Maintenance notes

- If Pagefind output layout changes upstream, update both the purge line and
  the count assertion together.
- Reviewer: confirm no other script writes into `public/pagefind` between
  purge and copy.
- **Deferred:** Pagefind relevance/recall tuning — never part of this plan.
