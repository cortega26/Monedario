# Spec: Fix GitHub Actions Auto-Merge Failure — Refresh Volatile Data Snapshots

**Date:** 2026-04-16

## Objective

The scheduled workflow `refresh-economic-snapshot.yml` ("Refresh Volatile Data Snapshots") fails
when it tries to enable auto-merge on the automatically created PR:

```
GraphQL: Pull request Pull request is in clean status (enablePullRequestAutoMerge)
Error: Process completed with exit code 1.
```

Root cause: `gh pr merge --auto --squash <number>` calls GitHub's
`enablePullRequestAutoMerge` GraphQL mutation. That mutation **requires** the repository to
have branch-protection rules with required status checks, OR the "Allow auto-merge" setting
enabled at the repository level. When no pending required checks exist the PR is already in a
"clean" (immediately mergeable) state and GitHub rejects the mutation.

Fix: use a shell `||` fallback — try auto-merge first (works when required checks exist),
fall back to a direct squash-merge when the PR is already clean.

## Scope

### In Scope
- Modify `.github/workflows/refresh-economic-snapshot.yml`: replace the bare
  `gh pr merge --auto --squash` command with an auto-merge-then-direct-merge fallback.
- Create `tests/e2e/refresh-snapshot-workflow.e2e.test.ts` to verify the fix is present and
  the workflow YAML is structurally correct.
- Update `spec.md` and `todo.md` to document this task.

### Out of Scope
- Changing branch-protection rules or repository settings.
- Modifying any data-refresh scripts (`pnpm run economic:snapshot:refresh`, etc.).
- Other workflows.

## Goals

G1. The "Enable auto-merge" step never exits with code 1 due to the "clean status" error.
G2. The fix is backward-compatible: if required checks exist, auto-merge is still used.
G3. The workflow YAML remains valid and parseable.
G4. A Vitest e2e test asserts the fallback pattern is present in the workflow file.
G5. `pnpm test` passes (full suite, exit 0).

## Implementation Plan

### Phase 1 — Diagnose and confirm root cause
- Read `.github/workflows/refresh-economic-snapshot.yml`.
- Confirm the failing step uses `gh pr merge --auto --squash` without error handling.
- Confirm no branch-protection / required-check configuration guards the merge.

### Phase 2 — Apply the fix
- In the "🔀 Enable auto-merge" step, replace:
  ```bash
  gh pr merge --auto --squash ${{ steps.create-pr.outputs.pull-request-number }}
  ```
  with the fallback pattern:
  ```bash
  gh pr merge --auto --squash ${{ steps.create-pr.outputs.pull-request-number }} || \
    gh pr merge --squash ${{ steps.create-pr.outputs.pull-request-number }}
  ```
- This ensures: auto-merge when checks are required, direct merge when the PR is already clean.

### Phase 3 — Verify with tests
- Add `tests/e2e/refresh-snapshot-workflow.e2e.test.ts` with assertions that:
  - The workflow file exists.
  - The "Enable auto-merge" step contains the `||` fallback pattern.
  - The workflow YAML does not contain the old single-command pattern.
- Run `pnpm test` and confirm exit 0.

## Ongoing Execution Rules

R1. Before any code change, re-read `spec.md` and confirm the change maps to a defined goal.
R2. Update `todo.md` immediately after each sub-task completes.
R3. Run `pnpm test` after the workflow change to confirm nothing else regressed.
R4. Approximately every 20 implementation iterations, run an independent review step:
    "review spec.md and the current implementation for gaps" and incorporate feedback.

## Verification Matrix

| ID  | Requirement | Proof Method | Pass Criteria |
|-----|-------------|--------------|---------------|
| V1  | Workflow file exists | fs.existsSync in test | true |
| V2  | Fallback `\|\|` pattern present in step | string search in test | match found |
| V3  | Old single-command pattern absent | negative string search | no match |
| V4  | Workflow YAML is valid (parseable) | yaml.parse in test | no parse error |
| V5  | `spec.md` has required sections | workflow-artifacts e2e test | all headings present |
| V6  | `todo.md` has checklist structure | workflow-artifacts e2e test | checkbox syntax present |
| V7  | Full test suite passes | `pnpm test` exit code | exit 0 |

## Commands

```bash
# Run the full test suite
pnpm test

# Run only the workflow e2e suite
pnpm vitest run tests/e2e/refresh-snapshot-workflow.e2e.test.ts

# Validate workflow YAML locally (requires actionlint or python-yaml)
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/refresh-economic-snapshot.yml'))"
```

## Definition of Done

- `.github/workflows/refresh-economic-snapshot.yml` uses the `||` fallback pattern in the
  "Enable auto-merge" step.
- `tests/e2e/refresh-snapshot-workflow.e2e.test.ts` exists and all its assertions pass.
- `pnpm test` exits 0 (no regressions).
- `todo.md` is updated with all tasks checked off.
