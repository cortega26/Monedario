# Commit & PR Standards

Rules for commit messages and pull request structure.
Referenced from `AGENTS.md §8`. Constitutional precedence applies — see `docs/AI_ENGINEERING_CONSTITUTION.md`.

## Rule 8.1 - Commit message format is mandatory
- Rationale: Structured history improves traceability and release automation.
- Enforcement: Use `type(scope): description` with allowed types from Constitution: `feat|fix|refactor|chore|test|perf|docs`.
- Compliant behavior: `fix(frontmatter): block deprecated canonicalURL field`.
- Violation: `misc updates`.

## Rule 8.2 - PR structure requirements
- Rationale: Review quality depends on predictable evidence structure.
- Enforcement: PR must include: summary, scope boundaries, change control record, test evidence, risk/rollback, related issue.
- Compliant behavior: PR body follows template and includes all mandatory sections.
- Violation: PR with only a one-line description and no verification evidence.

## Rule 8.3 - Verification checklist is blocking
- Rationale: Prevents partial validation merges.
- Enforcement: PR checkbox list must confirm completion of Section 5 gates (see `REGRESSION_PREVENTION.md`) and Section 3 change control (see `CHANGE_CONTROL_PROTOCOL.md`).
- Compliant behavior: All checks marked with linked evidence.
- Violation: Unchecked validation items at merge time.

## Rule 8.4 - Breaking change protocol
- Rationale: Contract/routing breaks require explicit migration path.
- Enforcement: If breaking change exists, PR must include `BREAKING CHANGE:` block with impacted consumers, migration steps, rollback, and ADR reference.
- Compliant behavior: Breaking slug policy change with migration + redirects + ADR.
- Violation: Removing contract field used by runtime without migration plan.
