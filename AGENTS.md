# AGENTS.md

Operational protocol for AI/human agents in this repository.

Binding document: `docs/AI_ENGINEERING_CONSTITUTION.md`.

Non-override clause: this file defines execution procedure only. It never overrides constitutional constraints, invariants, or prohibitions.

Constitutional precedence is absolute: when AGENTS.md conflicts with Constitution, Constitution wins.

**Design principle — índice, no enciclopedia:** Este archivo es el mapa de entrada, no el manual exhaustivo. Las reglas detalladas viven en `docs/development/`. Si sientes la necesidad de agregar más de 5 líneas aquí, crea o actualiza un documento en `docs/development/` y enlázalo desde la sección correspondiente.

## Canonical Context

- Canonical context layer for agent execution:
  - `context/INVARIANTS.md`
  - `context/CONTRACTS.md`
  - `context/EDITORIAL_AI_PIPELINE.md`
  - `CONTRACT.YMYL_RESPONSE_STRUCTURE` (ver `context/CONTRACTS.md`)
  - `context/MODULE_INDEX.md`
  - `context/CURRENT_STATE.md`
- Canonical editorial policy for YMYL execution: `docs/editorial/NORMA_YMYL.md`
- Canonical strategy policy for benchmark-driven work: `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`
- Before changes touching routes/RSS/canonical/guard gates → read `context/INVARIANTS.md` + `context/CONTRACTS.md`.
- Before new YMYL content or refresh → read `docs/editorial/NORMA_YMYL.md` + `context/EDITORIAL_AI_PIPELINE.md`.
- Before new URL/calculator/hub/surface → read `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`, `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`, `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`.

## 1. Authority Hierarchy

**Precedence order (fixed):** `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` > `context/*.md` > source code.

- If any requested change conflicts with the Constitution or domain invariants, stop and return a conflict report — no workarounds.
- Architectural invariants must be quoted by ID/name from `context/INVARIANTS.md`, `context/CONTRACTS.md`, or `docs/architecture/DOMAIN_CONTRACT_BOUNDARIES.md` before modification.
- Mandatory citation for URL identity work: `URL.PUBLIC.NO_POST_ID`.

## 2. Agent Execution Model → [`docs/development/AGENT_EXECUTION_PROTOCOL.md`](docs/development/AGENT_EXECUTION_PROTOCOL.md)

Rules 2.1–2.13 + execution checklist. Key rules at a glance:

- Scope block required before any edit (Rule 2.1).
- Minimal diffs only; full rewrites are exceptional (Rules 2.2–2.3).
- Halt conditions are enumerated and non-negotiable (Rule 2.6).
- `post.id` must never derive public URLs (Rule 2.7).
- YMYL content requires full editorial pipeline (Rule 2.8).
- New articles require a manually placed hero image (Rule 2.10).
- Failed tasks require capability gap diagnosis, not retries (Rule 2.12).
- Multi-session tasks require a plan artifact in `docs/backlog/` (Rule 2.13).

## 3. Change Control Protocol → [`docs/development/CHANGE_CONTROL_PROTOCOL.md`](docs/development/CHANGE_CONTROL_PROTOCOL.md)

Eight-step change declaration template + Competitive Adaptation Appendix. Route-affecting changes must also pass `check:no-postid-urls`, `check:routes`, `check:rss`.

## 4. Constitution Binding Rules → [`docs/development/CONSTITUTION_BINDING_RULES.md`](docs/development/CONSTITUTION_BINDING_RULES.md)

Architectural edits require constitutional citation. ADRs required for layer/contract/URL/CI changes. Refactors forbidden during bugfix tasks.

## 5. Regression Prevention → [`docs/development/REGRESSION_PREVENTION.md`](docs/development/REGRESSION_PREVENTION.md)

Mandatory CI gate set (`lint`, `check:boundaries`, `format:check`, `test`, `check:frontmatter`, `check:routes`, `astro check`, `build`). Domain/application/infrastructure changes require co-located test updates. Performance guardrails for hot paths (Mobile Perf ≥ 99, LCP ≤ 1.7s, CLS = 0).

## 6. Context Engineering Discipline → [`docs/development/CONTEXT_ENGINEERING.md`](docs/development/CONTEXT_ENGINEERING.md)

Minimal context extraction; no raw file dumps; Task Brief template required; explicit scope boundary in every response; external knowledge must be committed to repo before it can guide agent work.

## 7. Technical Debt Governance → [`docs/development/TECH_DEBT_GOVERNANCE.md`](docs/development/TECH_DEBT_GOVERNANCE.md)

All debt logged in `docs/TECH_DEBT_BACKLOG.md` with severity 1–5. Severity 4–5 blocks feature work. Periodic doc-gardening required. Custom lint scripts must emit file+rule+remediation in error messages.

## 8. Commit & PR Standards → [`docs/development/COMMIT_PR_STANDARDS.md`](docs/development/COMMIT_PR_STANDARDS.md)

Conventional commits (`feat|fix|refactor|chore|test|perf|docs`). PR requires change control record + test evidence. Breaking changes require `BREAKING CHANGE:` block + ADR.

## 9. Conversation Management → [`docs/development/CONVERSATION_MANAGEMENT.md`](docs/development/CONVERSATION_MANAGEMENT.md)

New conversation on context/domain change. Checkpoint architectural state in `context/PROJECT_CONTEXT_MASTER.md`. Structural tasks and content tasks in separate PRs.

## Deterministic Closure Conditions

A change is complete only if all are true:
- Scope remained bounded to declared in-scope paths.
- Constitution and AGENTS checks are satisfied with no unresolved conflict.
- Required CI gates passed.
- Change control record is complete.
- Regression risk and rollback are explicitly documented.

If any condition fails, task status is `HALT` until resolved.



<claude-mem-context>
# Memory Context

# [tuplatainforma] recent context, 2026-04-22 6:08pm GMT-4

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 14 obs (6,051t read) | 80,276t work | 92% savings

### Apr 22, 2026
176 5:16p 🔵 tuplatainforma — Ahrefs Broken Link Audit Initiated on Astro Project
177 5:17p 🔵 tuplatainforma — Content Directory Contains No Markdown Pages
178 " 🔵 tuplatainforma — One Broken Internal Post Link Found: /posts/que-es-el-apv
179 5:18p 🔵 tuplatainforma — que-es-el-apv Is a False Positive: File Exists as .mdx, Not .md
180 " 🔵 tuplatainforma — Broken Link Audit via Ahrefs: No Broken Internal /posts/ Links Found
181 5:19p 🔵 tuplatainforma — Full Internal Link Inventory: Glossary, Laws, and Source Files All Clean
182 5:24p 🔵 tuplatainforma Blog — Full Inventory of SII and Fonasa External Links
183 5:25p 🔴 Broken SII FAQ URLs Replaced in operacion-renta-f22-checklist.md
S42 Broken SII FAQ URLs Replaced in operacion-renta-f22-checklist.md (Apr 22, 5:25 PM)
184 5:48p 🔵 FONASA MLE Deep-Link URLs Confirmed for tuplatainforma
185 5:59p 🔵 tuplatainforma — pnpm Not in PATH Blocks lint and check:editorial
186 6:00p 🔵 tuplatainforma — Lint Error Root Cause: Unused globSync Import in redirect-links.e2e.test.ts
189 6:01p 🔴 Lint Error Fixed — Removed Unused globSync Import from redirect-links.e2e.test.ts
190 6:02p 🔵 tuplatainforma — `npm run check:editorial` Fails Because pnpm Is Not Installed
191 " 🔵 tuplatainforma — Project Is pnpm-Only; npm Run Fails for Most Scripts

Access 80k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>