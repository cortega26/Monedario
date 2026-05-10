# Plan — HeroImage Prompt Repair

Date: 2026-05-01
Status: In progress
Owner: Codex session

## Scope

- In scope:
  - `context/EDITORIAL_IMAGE_SYSTEM.md`
  - `docs/operations/runbooks/hero-images-runbook.md`
  - `scripts/hero-images/config.mjs`
  - `scripts/hero-images/prompt-plan.mjs`
  - `scripts/hero-images/build-prompts.mjs`
  - generated `scripts/hero-images/prompts.json`
  - targeted tests under `tests/scripts/**`
- Out of scope:
  - image asset generation or replacement
  - `public/images/hero/**`
  - `src/assets/images/blog/**`
  - article frontmatter/body changes
  - route/canonical/RSS changes

## Authority

- Constitution: `docs/AI_ENGINEERING_CONSTITUTION.md`
- Execution protocol: `AGENTS.md`, `docs/development/AGENT_EXECUTION_PROTOCOL.md`
- Canonical visual policy: `context/EDITORIAL_IMAGE_SYSTEM.md`
- Audit basis: `docs/operations/reports/visual/HEROIMAGE_PROMPT_REGRESSION_AUDIT.md`

## Invariants / contracts referenced

- `INVARIANT.EDITORIAL.HERO_IMAGE_TEXT_MATCH_REQUIRED`
- `INVARIANT.EDITORIAL.HERO_IMAGE_PUBLISHED_REQUIRED` (non-targeted guardrail preserved)
- Rule 2.10: manual hero-image workflow; prompts are guidance artifacts, not automated final assets

## Problem statement

The latest prompt-generation direction drifted from human/editorial scenes toward mechanism-first diagrams. The planner still produces semantically valid prompts, but they systematically underperform on human appeal, editorial warmth, and grid distinctiveness.

## Repair goals

1. Restore a human-first prompt hierarchy for reader-facing articles.
2. Introduce an explicit three-track prompt taxonomy:
   - Track A: Human Editorial Scene
   - Track B: Hybrid Scene + Mechanism
   - Track C: Editorial Mechanism
3. Relax over-applied anti-AI prompt constraints without allowing photorealism, fake text, logos, clutter, or finance-guru aesthetics.
4. Update the runbook rubric so prompts can fail on low human appeal.
5. Regenerate prompt artifacts and verify with targeted checks/tests only.

## Planned changes

1. Update doctrine in `context/EDITORIAL_IMAGE_SYSTEM.md`
2. Update prompt builders in `scripts/hero-images/config.mjs`
3. Repair planner / overrides in `scripts/hero-images/prompt-plan.mjs`
4. Expose track metadata in generated prompts if helpful
5. Update runbook rubric and manual review checklist
6. Regenerate `scripts/hero-images/prompts.json`
7. Update tests and run prompt-system checks

## Validation

- `pnpm run check:hero-prompts`
- targeted Vitest files for hero prompt planning / prompt checks

## Rollback

- Revert the above file set together plus regenerated `prompts.json`.
