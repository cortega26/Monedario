# Plan: Legal Citation Registry Fix

Date: 2026-05-25
Status: Completed

## Scope

- In scope: `scripts/legal-citations/registry.mjs`, `scripts/legal-citations/core.mjs`, this plan artifact.
- Out of scope: article content, law-page copy edits, public routes, RSS, wizard/glossary work.

## Authority And Invariants

- Constitution: preserve existing public behavior and fix the blocking validation gate without weakening YMYL controls.
- `AGENTS.md` Rule 2.2: minimal diff only.
- `AGENTS.md` Rule 2.6: halt if the fix requires changing unrelated law-page content or route behavior.

## Problem Statement

- Cloudflare Pages production builds for commits `7bf75f7a0e57...` and `3e7e594e9c3...` fail at `pnpm run check:legal-citations`.
- The failure is caused by law files that already exist under `src/data/laws/` but are missing from `LEGAL_CITATION_REGISTRY`.

## Targeted Fix

- Register the seven missing laws with canonical `slug`, `numero`, and `canonicalIdNorma`.
- Preserve live BCN verification semantics for entries that already have confirmed `historyPageId`.
- Handle newly added entries with missing `historyPageId` explicitly in `--verify-bcn` mode rather than fabricating IDs.

## Verification Plan

- `pnpm run check:legal-citations`
- `pnpm exec astro check`

## Rollback

- Revert the registry/core edits and this plan artifact.

## Progress Log

- 2026-05-25: Build failure traced to missing BCN registry entries, not cache or deploy configuration.
- 2026-05-25: Added the seven missing law pages to `LEGAL_CITATION_REGISTRY`.
- 2026-05-25: Removed now-obsolete `KNOWN_IDS_WITHOUT_LAW_PAGES` entries for laws that already have dedicated pages.
- 2026-05-25: Added explicit live-check handling for registry entries whose `historyPageId` still needs manual confirmation.
- 2026-05-25: Canonicalized stale BCN references in `src/data/blog/fonasa-vs-isapre-comparativa.md` to internal law pages.
- 2026-05-25: Verification passed:
  - `pnpm run check:legal-citations`
  - `pnpm exec astro check`
  - `pnpm run build`

## Closure Notes

- Root cause: `check:legal-citations` blocked the build because seven law files existed in `src/data/laws/` but were not registered in the BCN verification registry.
- Secondary blocker: one published article still linked to non-canonical BCN alias IDs for Fonasa/Isapres.
- Follow-up note: `check:legal-citations:live` will now surface any registry entry still missing a confirmed `historyPageId` instead of silently building an invalid BCN history URL.
