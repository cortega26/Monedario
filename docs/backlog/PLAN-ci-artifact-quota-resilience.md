# Plan: CI artifact quota resilience

## Scope

- In scope: `.github/workflows/ci.yml`, `.github/workflows/security-scans.yml`, and their static workflow tests.
- Out of scope: application code, routes, content, dependencies, and GitHub account storage administration.
- Operation: CI workflow resilience fix.

## Authority and invariants

- `docs/AI_ENGINEERING_CONSTITUTION.md` §6 requires security scanning; the scan remains enabled and its findings remain visible.
- No domain, URL, or public API contract is affected.

## Plan

1. Remove `site-dist` artifact handoff so downstream jobs do not fail when Actions artifact storage is unavailable.
2. Build `dist` in each consuming job before it runs its own validation.
3. Make the explicitly informational Trivy baseline non-blocking at the failing step, rather than leaving the job check red.
4. Update the workflow contract tests and run focused verification.

## Change Control Record

1. Scope declaration
   - In scope: CI workflow artifact handoff and Trivy status semantics.
   - Out of scope: application behavior and storage quota administration.
2. Impacted modules
   - `.github/workflows/ci.yml`: removes unavailable artifact prerequisite.
   - `.github/workflows/security-scans.yml`: aligns baseline scan behavior with its documented informational policy.
3. Invariant preservation
   - Security scanning stays enabled; Trivy still produces its summary and diagnostic artifact when storage permits.
4. Contract preservation
   - No public contract changes; breaking changes: no.
5. Boundary integrity
   - Not applicable; workflow-only change.
6. Test coverage impact
   - Static workflow tests updated alongside workflow behavior.
7. Rollback strategy
   - Revert this plan's workflow and test changes as one unit; no data rollback needed.
8. Regression risk
   - Risk: low. Consumers build independently, increasing CI time; this removes their dependence on quota-limited storage.

## Progress log

- 2026-07-27: Identified GitHub Actions artifact-storage quota as the root cause of missing `site-dist`; local Trivy v0.70.0 scan completed cleanly with the workflow flags.
- 2026-07-27: Replaced the quota-dependent site artifact handoff with job-local builds; moved Trivy's informational baseline handling to the scan step; made the a11y diagnostic upload non-blocking under the same quota condition.
- 2026-07-27: Verified focused static workflow tests (6 assertions), Prettier formatting, and whitespace checks. CI must run on GitHub to verify the workflow execution path.
- 2026-07-27: Completed. Full static workflow suite passed (21 files, 100 tests). Rollback is a single revert of the listed workflow, test, and plan changes.
