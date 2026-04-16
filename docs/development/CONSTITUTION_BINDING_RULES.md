# Constitution Binding Rules

Rules that bind agent actions to constitutional constraints and architectural invariants.
Referenced from `AGENTS.md §4`. Source of truth: `docs/AI_ENGINEERING_CONSTITUTION.md`.

## Rule 4.1 - Constitution reference before architectural edits
- Rationale: Architectural edits without constitutional mapping are non-deterministic.
- Enforcement: Any change in `src/domain/**`, `src/application/**`, `src/infrastructure/**`, routing model, or content contract must cite relevant constitutional sections in change record.
- Compliant behavior: "Constitution §2.1 dependency direction preserved; §2.2 side-effects remain in infrastructure."
- Violation: Altering layer dependencies without constitutional citation.

## Rule 4.2 - Conflict surfacing protocol

- Rationale: Conflicts must be auditable, not implicit.
- Enforcement: Conflict report must contain: requested action, conflicting rule, affected paths, reason change is blocked, accepted alternatives (if any).
- Compliant behavior: Structured conflict report posted instead of code workaround.
- Violation: Silent reinterpretation of invariant to satisfy task.

## Rule 4.3 - ADR trigger conditions
- Rationale: Architectural decisions need durable traceability.
- Enforcement: ADR required when any of these occur: layer dependency rule change, contract field lifecycle change (add/remove/deprecate), URL/canonical strategy change, CI gate semantics change, performance SLO threshold change.
- Compliant behavior: Add `docs/adr/ADR-YYYYMMDD-<topic>.md` in same PR as architectural change.
- Violation: Changing slug identity strategy without ADR.

## Rule 4.4 - Forbidden refactor windows

- Rationale: Opportunistic refactors increase risk during focused tasks.
- Enforcement: Refactors are forbidden during bugfix/content-only tasks unless directly required for invariant or contract preservation and declared in scope.
- Compliant behavior: Keep refactor out of an editorial typo fix PR.
- Violation: Restructuring use-case folders while fixing one article frontmatter issue.

## Rule 4.5 - Halt on `post.id` URL requirement
- Rationale: Workarounds would violate constitutional invariant `URL.PUBLIC.NO_POST_ID`.
- Enforcement: If a requested implementation requires deriving public URL identity from `post.id`, stop immediately, document conflict, and do not implement workaround.
- Compliant behavior: Halt + conflict report with alternative slug-based path.
- Violation: Introducing temporary helper that maps `post.id` to public route.
