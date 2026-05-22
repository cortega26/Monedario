# Audit Small Details - Editorial Trust Details - 2026-05-22

Source plan: `docs/backlog/PLAN-audit-small-details-2026-05-22.md`

## Scope

Audit article and reference trust details without editing content. This lane checks for the kinds of small mismatches that make YMYL content feel less reliable: answer anchors, vigencia, source labels, legal disclaimers, freshness signals, FAQ consistency, and glossary clarity.

## Evidence

- `pnpm run check:editorial`: pass.
- `pnpm run check:editorial-timeliness`: pass, `published=50 stale=0 drift=0`.
- `pnpm run check:legal-citations`: pass, `laws=15 blog=50 pages=54 registry=14`.
- `pnpm run audit:reader-copy`: pass non-blocking, `warnings=16`.
- Existing drift plan keeps `TD-0085` and `TD-0086` open for substantive YMYL issues.

## Findings

| ASD | Priority | Severity | Finding | Disposition |
|---|---:|---:|---|---|
| ASD-001 | P0 | 4 | Structural editorial gates pass, but top YMYL articles still need manual/substantive review for concrete first answers, vigencia, and source traceability. | `needs-editorial-pipeline`; maps to `TD-0085`, `TD-0086`. |
| ASD-002 | P0 | 4 | Law/reference pages pass legal citation structure, but external URL audit shows non-blocking source issues that can affect trust. | `needs-human-review`; maps to `TD-0091`, `TD-0094`. |
| ASD-003 | P1 | 3 | FAQ/body/methodology contradiction detection is not automated. | `batch-later`; manual review required before any remediation. |
| ASD-004 | P1 | 2 | Glossary freshness and usefulness are not covered by current gates beyond general content validity. | `batch-later`. |

## Reader-Copy Detail

`pnpm run audit:reader-copy` reported 16 non-blocking warnings for reader-visible use of `widget`:

- `src/pages/apoyar.astro`: 14 occurrences.
- `src/pages/cookies.astro`: 1 occurrence.
- `src/pages/privacidad.astro`: 1 occurrence.

These are not corrected in this audit-only pass. They are suitable for a low-risk copy batch if the product voice decision is to avoid implementation terms in reader-facing legal/support copy.

## Required Remediation Rules

- Do not edit substantive YMYL claims without `context/EDITORIAL_AI_PIPELINE.md` artifacts.
- Do not mark publish-packet gates as approved by an agent.
- Do not update `updatedDate` for copy-only or audit-only work.
- Any official-source correction must cite the primary/official source and preserve `CONTRACT.YMYL_RESPONSE_STRUCTURE`.
