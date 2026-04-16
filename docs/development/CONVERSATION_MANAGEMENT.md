# Conversation Management Rules

Rules for managing conversation scope, continuity, and state across agent sessions.
Referenced from `AGENTS.md §9`. Constitutional precedence applies — see `docs/AI_ENGINEERING_CONSTITUTION.md`.

## Rule 9.1 - Start a new conversation when architectural context changes
- Rationale: Separates decision domains and limits cross-contamination.
- Enforcement: New conversation required when scope crosses bounded contexts, introduces ADR-level decisions, or exceeds one primary objective.
- Compliant behavior: Separate conversation for "taxonomy contract redesign" after finishing "frontmatter lint fix".
- Violation: Mixing architecture redesign into a bugfix thread.

## Rule 9.2 - Continue conversation for same bounded objective
- Rationale: Maintains momentum and avoids repeated context loading.
- Enforcement: Continue existing thread when objective, scope boundaries, and invariants remain unchanged.
- Compliant behavior: Follow-up edits on same route-check script in same thread.
- Violation: Opening new thread for minor iteration of same fix.

## Rule 9.3 - Checkpoint architectural state explicitly
- Rationale: Durable checkpoints prevent loss of rationale between sessions.
- Enforcement: When architecture-affecting work completes, update checkpoint in `context/PROJECT_CONTEXT_MASTER.md` or add `context/PHASE*_CLOSURE_REPORT.md` entry referencing ADR/PR.
- Compliant behavior: Add decision note summarizing preserved invariants and changed contracts.
- Violation: Finishing architecture change with no persistent checkpoint.

## Rule 9.4 - Token bloat prevention

- Rationale: Excessive context inflates error rate and latency.
- Enforcement: Keep active context to relevant files only; replace repeated long content with path+summary references.
- Compliant behavior: "See docs/domain/CONTENT/INVARIANTS.md INV-001..INV-014" instead of repeated full text.
- Violation: Re-pasting unchanged docs in every turn.

## Rule 9.5 - Separate structural tasks from content tasks
- Rationale: Different risk profiles require different validation gates.
- Enforcement: Do not combine architecture/runtime refactors with bulk editorial content updates in one PR.
- Compliant behavior: PR A for runtime contract change, PR B for article updates.
- Violation: Single PR modifies routing architecture and 20 article bodies.
