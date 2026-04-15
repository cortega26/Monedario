# Context Engineering Discipline

Rules for efficient, structured, and deterministic context management in agent execution.
Referenced from `AGENTS.md §6`. Constitutional precedence applies — see `docs/AI_ENGINEERING_CONSTITUTION.md`.

## Rule 6.1 - Minimal relevant context extraction
- Rationale: Token and attention efficiency increase correctness.
- Enforcement: Load only files required for declared scope; cap initial discovery to directly relevant docs/modules; expand only on blocker.
- Compliant behavior: Read Constitution + affected contract docs before editing frontmatter checks.
- Violation: Dumping entire repository contents into analysis for a single script fix.

## Rule 6.2 - No raw file dumps unless requested
- Rationale: Large dumps obscure decisions and waste context budget.
- Enforcement: Summarize findings; quote only necessary lines/paths; full dumps allowed only if explicitly requested by reviewer.
- Compliant behavior: Provide invariant IDs and impacted paths instead of pasting full files.
- Violation: Posting full 300-line script when a 5-line diff summary is enough.

## Rule 6.3 - Structured prompt/request format required
- Rationale: Deterministic execution depends on stable input schema.
- Enforcement: Each execution request must include this block:

```md
## Task Brief
- Objective:
- In scope:
- Out of scope:
- Invariants/Contracts to preserve:
- Required gates:
- Deliverable:
- Benchmark observed:
- Why it worked externally:
- Proposed local delta:
- What will not be copied:
- Owner/surface affected:
- Success signal:
```

- Compliant behavior: Request includes objective, scope, invariants, and gates before implementation.
- Violation: "Fix SEO quickly" with no scope or constraints.

## Rule 6.4 - Explicit scope boundary in every response
- Rationale: Prevents silent scope creep across turns.
- Enforcement: Agent response must include "Implemented" and "Not implemented" path-level lists.
- Compliant behavior: "Implemented: scripts/check-frontmatter.mjs; Not implemented: runtime routing files."
- Violation: Hidden edits outside declared scope.

## Rule 6.5 - External knowledge must be codified before it can guide agent work
- Rationale: Any knowledge that lives outside the repository — chat messages, Google Docs, verbal agreements, mental models — is effectively invisible to the agent. From the agent's perspective, if it cannot find it in context while running, it does not exist.
- Enforcement: Architectural decisions, team conventions, patterns, and rationale that originate in any external medium (Slack, email, meetings) must be committed to the repository as markdown artifacts (`docs/`, `context/`, or inline comments) before they can be referenced in rules, reviews, or task briefs.
- Compliant behavior: After a team discussion about a new naming convention, adding it to `docs/codebase/` before the next agent task.
- Violation: Referencing "the pattern we discussed last week" in a task brief without a repo-local document to back it up.
