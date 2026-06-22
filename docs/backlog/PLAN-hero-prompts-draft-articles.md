# Plan: hero prompts for draft articles

## Scope

- Include valid draft articles in the internal hero prompt manifest and generated prompts.
- Keep `context/published-articles-index.json` restricted to publishable articles.
- Add regression coverage for the separation between prompt planning and publication.

## Progress

- [x] Baseline: `pnpm run test` (111 files, 838 tests).
- [x] Update scanner semantics.
- [x] Regenerate manifest, published index, and prompts (51 prompt candidates, 50 published).
- [x] Verify the new `finanzas-para-migrantes-chile` prompt and replace the SII false-positive with a slug override.
- [x] Run focused and required validation gates.

## Constraints

- No article content or public route changes.
- No automatic image generation.
- Published visibility remains governed by `draft !== true`.

## Closure evidence

- `pnpm run test`: 112 files, 840 tests passed.
- `pnpm run check:hero-prompts`: passed for 51 entries.
- `pnpm run check:hero-images`: passed for 50 published articles.
- `pnpm run build`: passed, including URL checks.
- `pnpm run check:boundaries`, `pnpm run format:check`, `pnpm run check:frontmatter`,
  `pnpm run check:routes`, and `astro check`: passed.
- Global `pnpm run lint` is blocked by unrelated `.claude/worktrees/**` parser-root collisions;
  targeted ESLint for all files changed by this plan passed.
- Manual hero image integrated from `/home/carlos/Imágenes/migrante-finanzas-chile.png` with
  1200×630, 800×420, and 600×315 AVIF outputs; article frontmatter and hero status updated.

## Rollback and risk

- Rollback unit: revert this plan's scanner, prompt-plan, generated JSON, and test changes together.
- Risk: low. Drafts enter only the internal prompt artifacts; the published index and hero-image gate
  continue filtering on `draft !== true`.
