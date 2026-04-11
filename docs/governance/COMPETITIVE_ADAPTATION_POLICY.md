# Competitive Adaptation Policy

Date: 2026-04-11
Status: Active
Mode: Warning-first

Authority order:
1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/INVARIANTS.md`
4. `context/CONTRACTS.md`
5. This document
6. Source code/comments

Related canonical sources:
- `docs/editorial/NORMA_YMYL.md`
- `context/EDITORIAL_AI_PIPELINE.md`
- `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`
- `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`
- `docs/editorial/SEO_ARCHITECTURE.md`

## 1. Purpose

This policy formalizes a repository-wide strategy:

- observe successful external patterns;
- identify the user need those patterns solve;
- adapt the pattern locally only when the local result is clearer, more useful, or better differentiated.

The governing principle is:

**External benchmarks are strategic input, never final authority.**

## 2. Non-negotiable rules

1. Competitors are evidence of product/editorial demand, not normative authority.
2. In YMYL work, no critical claim may be justified by competitor content. Official or primary sources remain mandatory.
3. External patterns may inspire structure, UX, content packaging, or feature framing, but not copy text, claims, URL strategy, or ownership logic verbatim.
4. A new visible surface must not be introduced if it collides with an existing `owner` without an explicit ownership decision.
5. “Better than the benchmark” must be explicit. If the local improvement cannot be stated, the adaptation is incomplete.

## 3. Required declaration fields

Any substantive adaptation of an external pattern must declare:

- `benchmarkSet`: products, URLs, or examples reviewed
- `patternHypothesis`: what appears to work externally and why
- `localDelta`: what we improve, simplify, or reorder locally
- `nonCopyBoundaries`: what we explicitly will not copy
- `ownerTarget`: internal owner, cluster, hub, feature surface, or canonical topic affected
- `successSignal`: observable signal that would show the adaptation worked

These fields are mandatory in:

- editorial artifact briefs/dossiers/outlines/publish packets when a new piece or substantive refresh uses external benchmarking;
- repo Task Briefs and PR/process notes for visible product, UX, calculators, hubs, navigation, and similar work.

## 4. Editorial and YMYL policy

For editorial work:

- benchmark observations must be separated from official sources;
- benchmark observations may influence framing, structure, or UX of the answer;
- official sources remain the only valid basis for legal, tax, pension, labor, debt, or financial claims;
- if a benchmark-informed piece competes with an existing owner, the change must stop until ownership is clarified.

For YMYL specifically:

- benchmark-backed language cannot replace `docs/editorial/NORMA_YMYL.md`;
- every benchmark-informed refresh must still satisfy `CONTRACT.YMYL_RESPONSE_STRUCTURE`;
- publish packets must confirm that benchmark input did not introduce unsourced claims or ownership conflicts.

## 5. Product, UX, calculators, hubs, and visible IA

For visible product work:

- the benchmark must be translated into the site's current ownership and navigation model;
- visible IA must preserve `owner/support/reference/tool` distinctions;
- hubs and indices must not inflate outbound choices just because a benchmark used a denser layout;
- benchmark adoption must respect the site's output budget and avoid duplicating destinations already dominant on the page.

## 6. Prohibited uses

The following are forbidden:

- copying reader-facing text or claims from a competitor;
- treating competitor language as evidence for YMYL correctness;
- copying public URL patterns that conflict with repo invariants;
- creating a second owner-like surface without redefining canonical ownership;
- claiming differentiation without naming the local improvement.

## 7. Warning-first enforcement

This v1 is process-enforced, not CI-blocking by default.

Expected enforcement points:

- `AGENTS.md` task brief and change control appendix
- `context/INVARIANTS.md` and `context/CONTRACTS.md`
- editorial scaffold artifacts
- PR review and publish packet review

Escalation path:

1. warning-first adoption in templates and process;
2. evidence gathering on false positives and compliance;
3. future ADR if any script or CI gate is hardened.

## 8. Operational review questions

Before implementation or publication, answer all:

1. What user need did the benchmark solve?
2. Why did it likely work there?
3. What is the local improvement?
4. What do we refuse to copy?
5. Which owner/surface is affected internally?
6. Does this create duplication or ownership conflict?
7. If YMYL, are official sources still fully authoritative?

If any answer is missing and the work is substantive, halt and resolve the gap before proceeding.
