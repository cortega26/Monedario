# ADR-20260411: Competitive Adaptation as Warning-First Governance Policy

Date: 2026-04-11
Status: Accepted

## Context

The repository already had strong rules for YMYL quality, ownership, anti-canibalization, and visible architecture, but it lacked a canonical way to incorporate lessons from external competitors or adjacent products.

That gap created two risks:

- teams could imitate external patterns ad hoc without recording why the pattern worked or how it was adapted locally;
- external benchmarking could accidentally compete with existing ownership, or be misused as a substitute for official sources in YMYL work.

Under `AGENTS.md` Rule 4.3, extending contract-level operational fields and artifact expectations requires a decision record.

## Decision

Adopt a new warning-first governance policy:

- `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`

Extend context-layer governance:

- `context/INVARIANTS.md`
  - `INVARIANT.STRATEGY.EXTERNAL_PATTERNS_NON_AUTHORITATIVE`
  - `INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED`
  - `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`
- `context/CONTRACTS.md`
  - `CONTRACT.STRATEGY.COMPETITIVE_ADAPTATION_BRIEF`
  - extended expectations for:
    - `CONTRACT.EDITORIAL.BRIEF`
    - `CONTRACT.EDITORIAL.DOSSIER`
    - `CONTRACT.EDITORIAL.OUTLINE`
    - `CONTRACT.EDITORIAL.PUBLISH_PACKET`

Activate policy usage in:

- `AGENTS.md`
- `context/EDITORIAL_AI_PIPELINE.md`
- editorial scaffold templates and repo prompt templates

## Consequences

Positive:

- external benchmarking becomes explicit, reviewable, and subordinate to internal authority;
- ownership and anti-canibalization rules apply before new benchmark-inspired surfaces are added;
- YMYL work keeps official sources as the only normative basis while still benefiting from external pattern research.

Trade-offs:

- more process fields must be filled in briefs and PR notes;
- enforcement remains manual/warning-first until a later hardening decision is made.

## Alternatives considered

1. Leave benchmarking informal in prompts only  
Rejected: too easy to drift or disappear from review artifacts.

2. Add CI-blocking checks immediately  
Rejected: too early; likely to create noisy failures without baseline adoption data.

3. Add frontmatter fields for benchmark metadata  
Rejected for v1: unnecessary schema churn for published content.

## Compatibility and Migration

- No runtime routes, RSS, or canonical URL semantics change.
- No frontmatter schema change is introduced.
- No new CI-blocking gate is introduced in this ADR.
- Existing artifact templates are extended additively.

## Verification

This ADR is complete when:

- the new policy exists under `docs/governance/`;
- AGENTS/context/pipeline/templates reference the same benchmark field set;
- no blocking CI semantics are changed in the same decision.
