# ADR-20260423 Blog Article Advisory Frontmatter

- Status: Accepted
- Date: 2026-04-23

## Context

The repository already centralized the visual rendering of blog closing advisories in `src/components/ArticleAdvisory.astro`, but the content source remained a technical registry keyed by `slug` in `src/config/blogAdvisory.ts`.

That created three medium-term problems:

1. Editorial text lived outside the article it describes.
2. Advisory overrides mixed short disclaimers with dates, links, and richer notes that belong elsewhere.
3. The runtime still accepted HTML via `set:html`, which weakened auditability and made drift harder to control.

This ADR is required because it changes the blog frontmatter contract by adding a new field lifecycle.

## Decision

Introduce a new optional frontmatter field for blog articles:

```yaml
articleAdvisory: "Contenido educativo; no reemplaza ..."
```

Architecture rules:

1. `src/components/ArticleAdvisory.astro` remains the single visual renderer.
2. Advisory content is resolved from `post.data.articleAdvisory` when present.
3. A central default fallback remains in `src/config/blogAdvisory.ts`.
4. The permanent design no longer uses a per-`slug` advisory registry.
5. Advisory content is plain-text only:
   - no HTML
   - no markdown links
   - no URLs
   - no multiline rich blocks
6. Advisory content must stay brief and reader-facing:
   - optional
   - max length `220`
7. Inline hardcoded closing advisories in markdown are blocked by editorial checks.

We deliberately use a scalar string instead of an object like `articleAdvisory.variant/text`.

Reason:

- absence already means "use the default fallback"
- the editorial job is simpler
- the schema is smaller
- review overhead is lower
- the contract avoids frontmatter bloat for a single short sentence

## Alternatives considered

### 1. Keep the `slug` registry as the primary source

Rejected.

It keeps editorial truth outside the article, scales poorly, and preserves the exact coupling this change is meant to remove.

### 2. Use `articleAdvisory.variant` + `articleAdvisory.text`

Rejected.

It is workable, but the explicit variant adds ceremony without adding meaningful governance. Optional string semantics already distinguish default vs custom safely.

### 3. Allow rich HTML or markdown in advisory metadata

Rejected.

That would reintroduce visual drift, links, and audit complexity, and it would blur the line between a closing advisory and richer editorial content.

## Consequences

Positive:

- article-specific advisory copy now lives beside the article
- the visual treatment stays centralized
- the default advisory remains editable in one place
- the runtime no longer injects advisory HTML
- CI can block advisory drift deterministically

Tradeoffs:

- article files that previously depended on registry overrides must now carry short advisory text in frontmatter
- advisory copy must stay intentionally constrained; richer notes need to remain in article body sections or existing metadata such as `articleLead`

## Migration plan

1. Create this ADR and formalize the new contract.
2. Extend `src/content.config.ts` to support `articleAdvisory`.
3. Replace the `slug` registry runtime with frontmatter resolution plus default fallback.
4. Migrate the existing advisory overrides from `src/config/blogAdvisory.ts` into article frontmatter as brief plain-text copy.
5. Remove the per-`slug` registry dependency.
6. Add blocking checks for:
   - HTML in `articleAdvisory`
   - URLs/links in `articleAdvisory`
   - excessive length
   - trailing inline hardcoded advisories in markdown
7. Update operational frontmatter documentation.

## Verification

- `pnpm run check:frontmatter`
- `pnpm run check:editorial`
- `pnpm exec astro check`
