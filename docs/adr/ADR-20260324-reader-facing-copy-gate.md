# ADR-20260324 Reader-Facing Copy Gate

- Status: Accepted
- Date: 2026-03-24

## Context

The repository already had editorial checks for structure, dialect, and artifact contracts, but we still needed a deterministic gate for two recurring UX/content risks:

1. Internal metamessages leaking into reader-facing copy.
2. FAQ sections growing without a hard limit, increasing cognitive load.

This is a CI gate semantics change because it adds new blocking conditions to `check:editorial`.

## Decision

Add a new blocking script:

- `scripts/check-reader-facing-copy.mjs`

And include it in:

- `pnpm run check:editorial`

## Contract

The new gate enforces:

1. Blocking internal-copy patterns in reader-facing files (`src/data/blog/**/*.md(x)` and `src/pages/**/*.astro`, excluding calculators):
   - `prompt`
   - `pipeline`
   - `gatilla actualización`
   - `fuentes base declaradas por el ejercicio`
2. Maximum FAQ density in blog posts:
   - In `## Preguntas frecuentes...`, maximum `5` `<details>` items.

## Scope semantics

The gate supports:

- `EDITORIAL_SCOPE=all` (default): scan all reader-facing targets.
- `EDITORIAL_SCOPE=changed`: scan only changed reader-facing files based on git diff range (`EDITORIAL_DIFF_BASE_REF` when available).

This keeps PR enforcement strict for touched content while preventing unrelated legacy debt from blocking.

## Consequences

Positive:

- Prevents internal process language from reaching production copy.
- Enforces a concrete FAQ complexity ceiling for decision-focused pages.
- Provides deterministic and auditable output in CI/local checks.

Tradeoffs:

- New hard failures can occur when wording accidentally matches blocked terms.
- Legacy pages with oversized FAQ must be normalized when edited under changed-scope enforcement.

## Enforcement

- `pnpm run check:reader-facing-copy`
- `pnpm run check:editorial` (now includes this gate)
- CI step `Check editorial invariants` (already runs `check:editorial`)
