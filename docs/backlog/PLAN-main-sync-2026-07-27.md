# Plan: synchronize local `main` with `origin/main`

## Scope

- In scope: active merge conflict resolution for `plans/**`, Cloudflare RUM query code, and its tests.
- Out of scope: unrelated staged changes already supplied by the two merge parents.
- Operation: preserve both parent histories in a merge commit; no resets or force pushes.

## Resolution rules

1. Prefer the remote plan indexes where they include newer completed-plan records.
2. Preserve hostname-scoped RUM behavior and the richer request-level test coverage.
3. Validate the resolved Cloudflare test module and repository merge state.

## Change Control Record

1. Scope: four conflicted files plus this plan.
2. Impacted modules: planning indexes and Cloudflare data-signals test boundary.
3. Invariants: no URL identity or domain contracts are changed.
4. Contracts: preserve RUM hostname filter and null-safe group extraction; no breaking public contract.
5. Boundary integrity: script/test-only resolution.
6. Coverage: run the resolved RUM test suite.
7. Rollback: revert the resulting merge commit.
8. Risk: medium due to divergent histories; mitigated by combining both test intents.

## Progress log

- 2026-07-27: merge parent inspection completed; four conflicts identified.
- 2026-07-27: selected the remote plan indexes and RUM query API; retained fetch-level hostname verification.
- 2026-07-27: resolved all four conflicts. `tests/scripts/cloudflare-rum-query.test.ts` passed (3 tests); Prettier and `git diff --check` passed. Ready to commit the merge.
