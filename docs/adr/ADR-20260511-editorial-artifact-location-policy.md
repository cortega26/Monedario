# ADR-20260511: Editorial Artifact Location Policy

Status: Accepted  
Date: 2026-05-11

## Context

The repository currently has two artifact families:

- `artifacts/editorial/<slug>/<run-id>/` — the canonical full editorial pipeline location defined by `context/EDITORIAL_AI_PIPELINE.md` and `context/CONTRACTS.md`.
- `docs/editorial/artifacts/**` — legacy and SEO sprint planning/sign-off evidence created by earlier roadmap waves.

This drift created ambiguity. `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts` correctly reports the published corpus as missing canonical artifact bundles, while separate tests and sprint docs still reference `docs/editorial/artifacts/**`.

Automatically migrating or fabricating 46 YMYL artifact bundles would be misleading because full YMYL compliance requires source traceability, separation of duties, math audit, compliance review, and human sign-off. Placeholder artifacts would weaken the editorial safety model.

## Decision

Keep one canonical full-pipeline location:

- `artifacts/editorial/<slug>/<run-id>/`

Classify `docs/editorial/artifacts/**` as legacy/SEO sprint evidence:

- It may remain versioned as historical planning, strategy, or human sign-off evidence.
- It is not accepted as a substitute for canonical full-pipeline artifacts by `check-editorial-artifacts`.
- New YMYL content and substantive YMYL refreshes must create canonical run folders under `artifacts/editorial/<slug>/<run-id>/`.

Remove the older temporary read fallback for `context/editorial/artifacts/<slug>/` from `check-editorial-artifacts`; no active files exist there, and keeping a silent fallback would preserve contract ambiguity.

Keep repo-wide strict artifact checking as a debt inventory tool, not as proof that the legacy corpus is already fully backfilled.

Keep PR enforcement scoped to changed YMYL targets per `ADR-20260306-editorial-artifacts-pr-diff-scope.md`.

## Consequences

- The repository has a single source of truth for full editorial pipeline runs.
- Legacy SEO sprint artifacts remain readable without being misrepresented as complete YMYL pipeline evidence.
- `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts` can still fail in repo-wide `scope=all` until true backfill work is performed.
- Backfilling canonical artifacts remains real editorial work, not a mechanical migration.

## Alternatives considered

1. Accept `docs/editorial/artifacts/**` as a second canonical path.  
   Rejected: it would create two live policies and make future agents uncertain about where to add new runs.

2. Move legacy files into `artifacts/editorial/**`.  
   Rejected for this pass: the file names, artifact semantics, and completion evidence do not match the canonical contract.

3. Generate placeholder canonical artifacts for all 46 YMYL posts.  
   Rejected: this would create false compliance evidence and could violate separation-of-duties and source-traceability expectations.

## Verification

- `context/EDITORIAL_AI_PIPELINE.md` points operational playbooks to `artifacts/editorial/<slug>/<run-id>/`.
- `context/CONTRACTS.md` documents the legacy docs path as noncanonical evidence.
- `scripts/check-editorial-artifacts.mjs` diagnostics explicitly identify the canonical root and do not suggest `docs/editorial/artifacts/**` as a fallback.
- `TD-0057` is updated from ambiguous path drift to canonical artifact backfill debt.
