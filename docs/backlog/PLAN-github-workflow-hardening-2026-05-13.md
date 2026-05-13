# GitHub Workflow Hardening Plan

Status: phase-3-advanced
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
- 2026-05-13: Removed the direct squash-merge fallback from `dependency-automerge.yml` and `refresh-economic-snapshot.yml`; both workflows now attempt auto-merge only and leave the PR open for manual review when safe automation cannot be enabled.
- 2026-05-13: Added focused Vitest coverage for the safer workflow merge contract in `tests/e2e/refresh-snapshot-workflow.e2e.test.ts` and `tests/e2e/dependency-automerge-workflow.e2e.test.ts`.
- 2026-05-13: Removed `.github/workflows/rebase-dependabot.yml` because `.github/dependabot.yml` already declares `rebase-strategy: auto` for both package ecosystems, making the extra push-triggered rebase job redundant operational surface.
- 2026-05-13: Extracted the shared safe auto-merge behavior into `.github/actions/enable-safe-automerge/action.yml` and rewired both merge-oriented workflows to use it instead of duplicating shell logic.
- 2026-05-13: Narrowed `.github/workflows/claude-code-review.yml` to code and automation paths only, reducing expensive review runs on docs-only or editorial-only pull requests.
- 2026-05-13: Added `build:ci` in `package.json` and switched `.github/workflows/ci.yml` to use it so the CI build stage no longer reruns frontmatter, hero image, Astro, and URL checks that were already executed earlier in the same job.
- 2026-05-13: Additional validation evidence: focused Vitest workflow/action suites passed for refresh auto-merge, Dependabot auto-merge, the shared safe auto-merge action, and the Claude review trigger scope; `pnpm run build:ci` succeeded locally.
- 2026-05-13: Extracted the repeated issue lifecycle boilerplate from `doc-gardening.yml`, `guardrail-drift-audit.yml`, `check-afp-commissions.yml`, `editorial-timeliness-audit.yml`, `weekly-search-ops.yml`, and `check-ts7-readiness.yml` into `.github/actions/upsert-issue-by-title/action.yml`.
- 2026-05-13: Added focused Vitest coverage for the shared issue action delegation in `tests/e2e/upsert-issue-by-title-workflows.e2e.test.ts`.
- 2026-05-13: Updated `.github/workflows/ci.yml` to upload a pinned `site-dist` artifact from the main build job and made `external-url-check-pr` plus `a11y-audit` download that artifact instead of rebuilding `dist` independently.
- 2026-05-13: Added focused Vitest coverage for CI build artifact reuse in `tests/e2e/ci-build-artifact-reuse.e2e.test.ts`.
- 2026-05-13: Extracted the repeated urlcheck placeholder artifact shell blocks from `.github/workflows/ci.yml` into `.github/actions/ensure-urlcheck-artifacts/action.yml` with `internal` and `external` scopes.
- 2026-05-13: Added focused Vitest coverage for the shared urlcheck helper delegation in `tests/e2e/ensure-urlcheck-artifacts-action.e2e.test.ts`.
- 2026-05-13: Extracted the repeated urlcheck artifact upload wiring from `.github/workflows/ci.yml` into `.github/actions/upload-urlcheck-artifacts/action.yml`, leaving the workflow to declare only artifact name, retention, and scope.
- 2026-05-13: Added focused Vitest coverage for the shared urlcheck upload helper delegation in `tests/e2e/upload-urlcheck-artifacts-action.e2e.test.ts`.
- 2026-05-13: Extracted the remaining direct workflow artifact uploads into `.github/actions/upload-workflow-artifact/action.yml`, so workflows now declare only artifact metadata and keep the pinned upload action in one place.
- 2026-05-13: Added fleet-level Vitest coverage for the shared generic artifact upload helper delegation in `tests/e2e/upload-workflow-artifact-action.e2e.test.ts`.
- 2026-05-13: Hardened `.github/workflows/data-signals.yml` with a fail-fast provider configuration preflight and centralized external data-source env wiring so missing secrets or repository variables fail before any API fetch step runs.
- 2026-05-13: Added focused Vitest coverage for the data-signals configuration preflight in `tests/e2e/data-signals-workflow.e2e.test.ts` and documented the required GitHub Actions variables in the data-signals maintenance runbook.