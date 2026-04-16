# Working Todo — Fix GH Actions Auto-Merge (2026-04-16)

## Phase 0 — Analysis (complete)

- [x] Read `.github/workflows/refresh-economic-snapshot.yml`
- [x] Identify failing step: `gh pr merge --auto --squash`
- [x] Confirm root cause: `enablePullRequestAutoMerge` requires branch-protection / required checks
- [x] Write `spec.md` with objectives, goals, implementation plan, and verification matrix

## Phase 1 — Workflow Fix
- [x] Apply `||` fallback in the "Enable auto-merge" step of `refresh-economic-snapshot.yml`

## Phase 2 — Test Coverage

- [x] Create `tests/e2e/refresh-snapshot-workflow.e2e.test.ts`
  - [x] Assert workflow file exists
  - [x] Assert fallback `||` pattern is present
  - [x] Assert old single-command pattern is absent
  - [x] Assert YAML is parseable without errors

## End-to-End Coverage Tasks
- [x] `spec.md` contains required sections (covered by `workflow-artifacts.e2e.test.ts`)
- [x] `todo.md` contains granular checkbox tasks (this file)
- [ ] Iteration review #1 (after implementation): sub-agent gap check

## Validation Loop

- [x] Run full test suite: `pnpm test`
- [x] Confirm exit 0 — 350/350 tests passed (2026-04-16)
- [x] Update this file with completion evidence

## Review Loop Tracking
- [x] Iteration review #1: Codacy CLI analysis — 0 issues on workflow file and test file
