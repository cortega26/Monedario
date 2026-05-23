# Prompt Injection Hardening Plan

Date: 2026-05-23
Status: Completed

## Scope

- In scope: editorial pipeline policy, role prompts, scaffold templates, package check wiring, and focused tests.
- Out of scope: article content, routes, RSS, canonical URLs, frontmatter schema, runtime UI, and new dependencies.

## Authority And Evidence

- Authority: `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` > `context/*.md` > source.
- Preserved contracts: `CONTRACT.EDITORIAL.DOSSIER`, `CONTRACT.EDITORIAL.PUBLISH_PACKET`, `CONTRACT.EDITORIAL.ARTIFACT_GATE`.
- External security intelligence: Google Security Blog, "AI threats in the wild: The current state of prompt injections on the web", published 2026-04-23, https://blog.google/security/prompt-injections-web/

## Implementation Checklist

- [x] Add prompt-injection defense rules to `context/EDITORIAL_AI_PIPELINE.md`.
- [x] Add dossier and publish-packet expectations to `context/CONTRACTS.md`.
- [x] Update `scripts/scaffold-editorial-artifacts.mjs` templates.
- [x] Add `scripts/check-prompt-injection-guardrails.mjs`.
- [x] Wire the new guardrail into `pnpm run check:editorial`.
- [x] Add focused Vitest coverage.
- [x] Run targeted and editorial validation gates.

## Validation Evidence

- `node scripts/check-prompt-injection-guardrails.mjs` passed.
- `pnpm vitest run tests/scripts/check-prompt-injection-guardrails.test.ts` passed: 3 tests.
- `pnpm vitest run tests/scripts` passed: 25 files, 197 tests.
- `pnpm run check:editorial` passed.
- `pnpm run check:docs` passed.
- `pnpm run check` passed.
- `pnpm run format:check` failed on 18 pre-existing files outside this scope; none of the files changed for this plan were listed by Prettier.

## Closure Notes

- Regression risk: low; changes are docs/templates/check tooling only.
- Rollback: revert this plan, pipeline/contracts edits, scaffold template edits, package script wiring, guardrail script, and tests.
