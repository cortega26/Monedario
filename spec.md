# Project Working Spec

## Objective
Establish a deterministic execution workflow before implementation work begins, with:
1. A complete written spec for goals, implementation details, and verification.
2. A living to-do tracker updated during execution.
3. End-to-end tests that validate the workflow artifacts and keep the implementation aligned.

## Scope
In scope:
- Create `spec.md` with goals, implementation details, and verification.
- Create `todo.md` as a mutable checklist used while working.
- Create `tests/e2e` and add end-to-end tests that verify these artifacts.
- Run tests and iterate until they all pass.

Out of scope:
- Product feature implementation not requested in this task.
- Architectural refactors unrelated to workflow artifact setup.

## Goals
G1. `spec.md` exists and contains actionable implementation and verification details.
G2. `todo.md` exists and is structured into verifiable sub-tasks.
G3. End-to-end test coverage exists under `tests/e2e` and validates core workflow invariants.
G4. Tests can be executed with the existing test runner and pass.
G5. The workflow enforces continuous alignment via periodic spec-review loops.

## Implementation Plan

### Phase 1 - Authoring baseline artifacts
- Create `spec.md` with explicit objective, scope, goals, implementation plan, and a verification matrix.
- Create `todo.md` with sections for Artifact Setup, End-to-End Coverage Tasks, Validation Loop, Review Loop Tracking, and Evidence.

### Phase 2 - End-to-end validation setup
- Create `tests/e2e` directory.
- Add a Vitest end-to-end suite that verifies:
  - Required files exist.
  - `spec.md` contains mandatory sections.
  - `todo.md` contains verifiable checkbox tasks.
  - A periodic review requirement is documented in `spec.md`.

### Phase 3 - Validation loop
- Run `pnpm test`.
- If failing, fix tests or artifact content until all pass.
- Record pass status in `todo.md`.

## Ongoing Execution Rules
R1. Before any code/content change, read `spec.md` and validate that the change maps to one defined goal or plan step.
R2. Update `todo.md` immediately after completing each sub-task.
R3. Run the relevant tests after meaningful change sets.
R4. Approximately every 20 implementation iterations, run an independent review step: "review spec.md and the current implementation for gaps".

## Verification Matrix

| ID | Requirement | Proof Method | Pass Criteria |
| --- | --- | --- | --- |
| V1 | `spec.md` exists | E2E test file existence check | File exists at repository root |
| V2 | `spec.md` has complete structure | E2E content assertions on section headings | Required headings present |
| V3 | `todo.md` exists with checkboxes | E2E content assertions for Markdown task list syntax | At least one unchecked and one checked item pattern supported |
| V4 | `tests/e2e` exists with executable test suite | E2E test + Vitest discovery | Suite discovered and executed by `pnpm test` |
| V5 | Periodic review loop is documented | E2E assertion for review-loop rule text in `spec.md` | Rule is present and unambiguous |
| V6 | All tests pass | `pnpm test` exit code | Exit code 0 |
| V7 | Commands section documented | E2E assertion on spec heading | `## Commands` heading present |

## Commands
- Run all tests: `pnpm test`
- Run only e2e suite once created: `pnpm vitest run tests/e2e`

## Definition of Done
- `spec.md` and `todo.md` are created and aligned to goals.
- `tests/e2e` includes end-to-end tests that enforce the workflow invariants.
- `pnpm test` passes with the new suite included.
- `todo.md` is updated to reflect completed work and remaining items.
