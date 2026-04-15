# Change Control Protocol

Rules and templates for declaring, reviewing, and merging changes.
Referenced from `AGENTS.md §3`. Constitutional precedence applies — see `docs/AI_ENGINEERING_CONSTITUTION.md`.

## Rule 3.1 - Eight-step change declaration is required
- Rationale: Standardized review data prevents omissions.
- Enforcement: Every change must include all eight items below; omission blocks merge.
- Compliant behavior: PR description includes all eight confirmations.
- Violation: Merging without rollback strategy or regression risk statement.

## Rule 3.2 - Mandatory route-impact verification commands
- Rationale: Public URL regressions must be blocked before merge.
- Enforcement: Any change touching routes/canonical/RSS/sitemap, or URL helpers, must run:
  - `pnpm run check:no-postid-urls`
  - `pnpm run check:routes`
  - `pnpm run check:rss`
- Violation: Routing-affecting PR without the three command results.

## Reusable template (mandatory)

```md
## Change Control Record

1. Scope declaration
- In scope:
- Out of scope:

2. Impacted modules
- Paths:
- Reason for each path:

3. Invariant preservation
- Referenced invariants:
- Preservation proof:

4. Contract preservation
- Referenced contracts:
- Breaking changes: yes/no

5. Boundary integrity
- Layer boundary check (`pnpm run check:boundaries`): pass/fail
- Unauthorized cross-layer imports introduced: yes/no

6. Test coverage impact
- Changed runtime layers:
- Related tests added/updated:
- Coverage threshold status (see REGRESSION_PREVENTION.md §5): pass/fail

7. Rollback strategy
- Revert unit:
- Data/content rollback needed: yes/no

8. Regression risk
- Risk level: low/medium/high
- Primary regression vectors:
- Mitigations:

## Competitive Adaptation Appendix

- benchmarkSet:
- patternHypothesis:
- localDelta:
- nonCopyBoundaries:
- ownerTarget:
- successSignal:
- ownership conflict check: pass/fail
```
