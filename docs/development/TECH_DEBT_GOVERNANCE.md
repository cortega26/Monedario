# Technical Debt Governance

Rules for discovering, logging, prioritizing, and resolving technical debt.
Referenced from `AGENTS.md §7`. Debt ledger: `docs/TECH_DEBT_BACKLOG.md`.

## Rule 7.1 - Debt ledger location is fixed
- Rationale: Centralized debt tracking is required for prioritization and audits.
- Enforcement: All debt items must be logged in `/docs/TECH_DEBT_BACKLOG.md`.
- Compliant behavior: Add new debt item with ID, impact, severity, resolution strategy.
- Violation: Mentioning debt only in PR comments.

## Rule 7.2 - Severity scoring is mandatory (1-5)
- Rationale: Consistent severity enables deterministic triage.
- Enforcement: Every new debt item must include severity score:
  - 1: Cosmetic/no behavior risk
  - 2: Maintainability friction
  - 3: Medium regression risk
  - 4: High risk to correctness/performance/security
  - 5: Active production risk
- Compliant behavior: "Severity 4 - boundary checker bypass possibility."
- Violation: Logging debt without severity.

## Rule 7.3 - Debt that blocks feature work
- Rationale: High-severity debt must not compound.
- Enforcement: Severity 4-5 debt in touched area blocks feature delivery unless resolved in same release cycle or explicit waiver ADR is approved.
- Compliant behavior: Resolve severity-4 routing debt before adding new routing feature.
- Violation: Shipping new feature on top of unresolved severity-5 defect.

## Rule 7.4 - Agent obligations on debt discovery
- Rationale: Agents must surface systemic risks, not only task-local fixes.
- Enforcement: When debt is discovered, agent must either fix it in-scope or log it with severity and mitigation; silent ignore is forbidden.
- Compliant behavior: Log missing coverage tooling as debt with mitigation plan.
- Violation: Not reporting repeated fallback failures discovered during change.

## Rule 7.5 - Recurrent entropy management (doc-gardening)
- Rationale: Agent-driven codebases replicate existing patterns — including suboptimal ones. Without active entropy management, quality drift compounds silently until it becomes expensive to reverse. Manual cleanup sessions do not scale.
- Enforcement: A scheduled or periodic doc-gardening pass must be run to: (a) detect stale documentation that no longer matches code behavior, (b) identify repeated anti-patterns introduced by agents, and (c) open targeted cleanup PRs. The cadence target is at minimum once per sprint. Cleanup PRs must be small enough to review in under one minute.
- Compliant behavior: Running `pnpm run check:frontmatter` and `pnpm run lint` as part of a weekly gardening pass, opening a targeted PR for each distinct violation cluster.
- Violation: Accumulating weeks of quality drift without a cleanup pass, then attempting to fix everything in a single large PR.

## Rule 7.6 - Agent-readable error messages in custom lints
- Rationale: When a custom lint or CI script fails, the agent must be able to understand what went wrong and how to fix it without human translation. Generic error messages require human intervention, defeating the purpose of autonomous execution.
- Enforcement: Every custom lint script, CI check, and frontmatter validation must emit error messages that include: (a) the exact file and line, (b) what rule was violated, and (c) a concrete remediation step the agent can execute directly.
- Compliant behavior: `ERROR [check-frontmatter] src/data/blog/foo.md line 5: missing 'description' field. Add: description: "<string of 120-160 chars>"`
- Violation: `Error: frontmatter validation failed` with no file, rule, or fix instruction.
