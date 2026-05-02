# Agent Execution Protocol

Rules governing how agents scope, execute, and close tasks in this repository.
Referenced from `AGENTS.md §2`. Constitutional precedence applies — see `docs/AI_ENGINEERING_CONSTITUTION.md`.

## Rule 2.1 - Scope declaration is mandatory before editing

- Rationale: Full repo visibility does not permit unconstrained changes.
- Enforcement: Every task starts with a scope block listing in-scope paths, out-of-scope paths, and allowed operation type.
- Compliant behavior: In-scope `src/data/blog/**`, `scripts/check-frontmatter.mjs`; out-of-scope `src/domain/**`.
- Violation: Editing `src/layouts/Layout.astro` during a frontmatter-only task.

## Rule 2.2 - Diff-first modification strategy
- Rationale: Minimizes regression surface and review complexity.
- Enforcement: Prefer minimal hunks; each changed file must map to one declared objective in change control template.
- Compliant behavior: Editing 8 lines in `check-frontmatter.mjs` to enforce one invariant.
- Violation: Reformatting entire files unrelated to the requested behavior.

## Rule 2.3 - Full-file rewrites are exceptional

- Rationale: Rewrites obscure intent and increase accidental breakage.
- Enforcement: Full rewrite allowed only if one condition is true: generated artifact refresh, file is <200 LOC and structurally replaced, or user explicitly requested rewrite. Condition must be declared in PR notes.
- Compliant behavior: Regenerating route snapshot JSON via script.
- Violation: Rewriting `src/pages/index.astro` for minor text change.

## Rule 2.4 - Prohibited execution behaviors
- Rationale: These patterns violate Constitution §1 and §11.
- Enforcement: Reject actions that: modify undeclared scope, refactor unrelated modules, add dependencies without justification, remove tests to pass CI, weaken types, or hide errors.
- Compliant behavior: Add targeted fix plus tests without altering unrelated modules.
- Violation: Deleting failing test cases to make `pnpm run test` pass.

## Rule 2.5 - Uncertainty handling is explicit

- Rationale: Silent assumptions cause contract violations.
- Enforcement: If requirement ambiguity affects contracts/invariants, stop and request clarification; if low-risk and local, proceed with labeled assumption.
- Compliant behavior: "Assumption A1: no URL slug migration requested; preserving current public routes."
- Violation: Renaming canonical fields without stating assumptions.

## Rule 2.6 - Mandatory halt conditions
- Rationale: Certain conditions make safe progress impossible.
- Enforcement: Halt immediately on any of: constitutional conflict, missing invariant source for required change, unresolved contract ambiguity, inability to verify critical gate, unexpected non-user edits in touched files, unresolved ownership conflict for a new visible/indexable surface, or benchmark-driven work with no explicit differentiation.
- Compliant behavior: Stop when route comparison baseline file is missing.
- Violation: Shipping routing change without route diff verification.

## Rule 2.7 - Forbidden public URL derivation from `post.id`
- Rationale: Preserves invariant `URL.PUBLIC.NO_POST_ID` and prevents SEO/runtime coupling to technical IDs.
- Enforcement: Any construction of public paths/canonical/RSS URLs from `post.id` is forbidden.
- Compliant behavior: `getCanonicalPathFromSlug(article.slug)`.
- Violation: `` `/posts/${post.id}/` `` or `params.slug = post.id`.

## Rule 2.8 - Mandatory editorial AI pipeline for YMYL/refresh

- Rationale: High-risk editorial quality requires deterministic multi-stage controls, not ad-hoc drafting.
- Enforcement: For every new YMYL piece or substantive YMYL refresh, the full artifact chain in `context/EDITORIAL_AI_PIPELINE.md` is mandatory (`brief`, `dossier`, `outline`, `draft`, `math audit`, `compliance`, `publish packet`).
- Compliant behavior: PR includes pipeline artifacts (or references) and gate evidence before publication.
- Violation: Publishing YMYL content from a single-step draft without artifact-level verification.

## Rule 2.9 - Separation of duties in editorial verification

- Rationale: Self-auditing degrades reliability in YMYL content.
- Enforcement: `DraftAgent` cannot be the same role identity as `MathAuditAgent` or `ComplianceAgent` in one run; evidence must be recorded in publish packet.
- Compliant behavior: Distinct role identities across draft/audit/compliance stages.
- Violation: Same role signs draft and math/compliance verification.

## Rule 2.10 - Every new article requires a manually created hero image

- Rationale: Hero images are created manually — the pipeline (`scripts/hero-images/`) generates guidance artifacts only, it does NOT call image APIs automatically. Automatic generation is intentionally disabled because AI APIs produce inconsistent results. Every image file must be manually created/curated and placed in the repo before the build can pass.
- CI gate: `pnpm run check:hero-images` (wired into `build` and `check`) blocks the build if `public/images/hero/{slug}.avif` is absent for any published article.
- Enforcement: When a new article is added to `src/data/blog/`:
  1. Run `node scripts/hero-images/scan-articles.mjs` to update `manifest.json` and `context/published-articles-index.json`.
  2. Run `node scripts/hero-images/build-prompts.mjs` to (re)generate `scripts/hero-images/prompts.json`.
  3. Inspect the generated entry for the new slug in `prompts.json`. Verify `approvedModelId`, `sceneId`, `palette.hex`, and `prompt` are semantically correct for the article topic.
  4. If the auto-selected scene is wrong (keyword false-positive from body text), add a `SLUG_OVERRIDES` entry in `scripts/hero-images/prompt-plan.mjs` with the correct `id`, `recipeId`, `colorKey`, and `overrideEvidence`, then re-run step 2.
  5. Create or curate the hero image manually (without relying on automated API generation).
  6. Convert the output to `.avif` and place it at `public/images/hero/{slug}.avif` (max 80 KB).
  7. Set the slug in `scripts/hero-images/status.json` to `{ "state": "done" }`.
  8. Run `pnpm run check:hero-images` to confirm the image passes all constraints before committing.
- Compliant behavior: PR includes updated `manifest.json`, `prompts.json`, `status.json` (`state: done`), and `public/images/hero/{slug}.avif`.
- Violation: Merging a new article without its `.avif` image — `pnpm run build` will fail at the `check:hero-images` gate.

## Rule 2.11 - Competitive adaptation must be explicit
- Rationale: Benchmarking is useful only when it produces differentiated local value without breaking ownership or source authority.
- Enforcement: Any substantive benchmark-driven work must declare `benchmarkSet`, `patternHypothesis`, `localDelta`, `nonCopyBoundaries`, `ownerTarget`, and `successSignal` in the Task Brief or equivalent artifact.
- Compliant behavior: "Pattern observed in 3 competitor flows; local delta is fewer branches and clearer Chile-specific thresholds; we will not copy copywriting or URL structure."
- Violation: "Implement what competitor X shipped" with no local delta or ownership decision.

## Rule 2.12 - Capability gap protocol on agent failure
- Rationale: When an agent struggles, the root cause is almost always a missing tool, missing documentation, or missing structure — not insufficient effort. Retrying the same approach without addressing the gap compounds waste.
- Enforcement: When an agent task fails or stalls, the agent must identify the missing capability and either: (a) create or update the relevant doc/tool in the repo as part of the same task, or (b) log the gap as a `docs/TECH_DEBT_BACKLOG.md` entry with severity and a concrete mitigation plan before proceeding.
- Compliant behavior: "Task blocked: no script exists to validate X. Creating `scripts/check-x.mjs` before retrying."
- Violation: Retrying the same failed approach three times without diagnosing the structural gap.

## Rule 2.13 - Execution plans as first-class artifacts
- Rationale: Plans stored only in conversation context are lost between sessions. Versioned plans allow agents to resume complex work without re-deriving intent.
- Enforcement: For tasks that span more than one editing session or touch more than three files: create a lightweight plan document in `docs/backlog/` before starting. For complex multi-PR work, use a full exec-plan in `docs/backlog/` with a progress log that is updated as work advances. For any task executed from a plan, backlog item, roadmap, or equivalent tracking artifact, the agent must update that artifact as part of the DoD work whenever status, scope, decisions, blockers, or completion evidence changed. The final response must cite the updated artifact path. If the artifact cannot be updated, task status is `HALT` until the documentation gap is resolved.
- Compliant behavior: Creating `docs/backlog/PLAN-slug-migration.md` with phases, decisions, and progress log before executing a multi-step migration, then updating it before closure with status, evidence, and any decisions made.
- Violation: Starting a multi-file refactor with no plan artifact, reconstructing intent from conversation history on every new session, or closing a plan-driven task without updating the source tracking artifact.

## Execution checklist (required before code edits)
- [ ] Scope declared (in-scope/out-of-scope).
- [ ] Authority check recorded.
- [ ] Invariants/contracts referenced by document path.
- [ ] Competitive adaptation refs reviewed when work is benchmark-driven or creates a new visible surface.
- [ ] Risky assumptions listed or task halted.
