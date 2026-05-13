# GitHub Workflow Hardening Plan

Status: phase-1-complete
Owner: GitHub Copilot
Started: 2026-05-13

## Scope

- In scope:
  - `.github/workflows/**`
  - `.github/actions/bootstrap-pnpm/action.yml`
  - `docs/backlog/PLAN-github-workflow-hardening-2026-05-13.md`
- Out of scope:
  - Runtime application code under `src/**`
  - Editorial artifacts and publishable content
  - New external services or deployment targets

## Authority And Constraints

- Authority order: `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` > `context/*.md` > source code.
- Relevant execution rules:
  - `docs/development/AGENT_EXECUTION_PROTOCOL.md` Rule 2.1 requires explicit scope before edits.
  - `docs/development/AGENT_EXECUTION_PROTOCOL.md` Rule 2.13 requires a plan artifact for multi-file work.
  - `docs/development/REGRESSION_PREVENTION.md` Rule 5.1 defines the mandatory CI gate set.

## Objectives

1. Reduce workflow race conditions with explicit concurrency controls.
2. Tighten permissions to least privilege where write access is not required.
3. Remove dead or misleading workflow configuration that adds maintenance cost.
4. Preserve existing repo guardrails and validation commands.

## Work Phases

### Phase 1 - Safety metadata

- Add `concurrency` to PR, scheduled, and branch-writing workflows.
- Reduce broad write permissions in workflows that only read the repo.
- Remove the unused `workflow_call` entry and the single-value Node matrix from `ci.yml`.

### Phase 2 - Automation correctness

- Review direct-merge fallbacks in auto-merge workflows.
- Close stale alert issues when scheduled audits recover.
- Reassess whether `rebase-dependabot.yml` still provides net value beyond Dependabot auto-rebase.

### Phase 3 - Deduplication and efficiency

- Refactor the shared pnpm bootstrap action for deterministic setup.
- Reduce duplicate build and validation work inside `ci.yml`.
- Extract repeated issue-management logic used by scheduled audit workflows.

## Validation

1. Run a focused YAML/format validation after each workflow edit slice.
2. Run governance checks before closure: `pnpm run check:context`, `pnpm run check:policy-registry`, `pnpm run check:docs`.
3. Run targeted repository validation for touched workflow behavior when feasible.

## Progress Log

- 2026-05-13: Created plan artifact and started Phase 1 safety hardening.
- 2026-05-13: Added explicit concurrency controls to the workflow fleet, with cancel-in-progress for PR review/validation flows and serialized execution for scheduled or branch-writing automations.
- 2026-05-13: Tightened least-privilege access in `ci.yml` and `claude-code-review.yml`, and removed the unused `workflow_call` entry plus the single-value Node matrix from `ci.yml`.
- 2026-05-13: Extended the AFP and editorial timeliness audit workflows to close stale alert issues after a passing run and tolerate missing report artifacts.
- 2026-05-13: Refactored `.github/actions/bootstrap-pnpm/action.yml` to use a Node-first Corepack activation path for pnpm 10.30.2 instead of a global npm install.
- 2026-05-13: Validation evidence: targeted Prettier checks passed for all edited YAML/Markdown files, Corepack activation succeeded locally (`pnpm 10.30.2`), and `pnpm run check:context`, `pnpm run check:policy-registry`, and `pnpm run check:docs` all passed.