---
name: remove-meta-statements
description: "Detect and remove AI/editorial meta-information that has leaked into reader-facing content. Use when: meta-statements appear in published articles or pages, editorial pipeline phrases are visible to end users, audit:reader-copy reports violations, internal notes or process language surfaces in blog posts or page copy."
argument-hint: "Optional: a specific file path or slug to scope the audit"
---

# Remove Meta-Statements from Reader-Facing Content

## Purpose

Removes internal editorial/AI pipeline language that has leaked into **any text visible to the end user**: article body, headings, frontmatter fields rendered to the reader (`title`, `description`, `summary`, `answer`, SEO fields), page copy, and UI strings in `.astro` files.

## What Counts as a Meta-Statement

A piece of text is a meta-statement if **any** of these conditions is true:

- It is internal editorial or AI pipeline language not intended for readers.
- It increases cognitive friction for the end user (unclear, abstract, or confusing).
- It is not clear or meaningful to someone reading the article.

| Category                                       | Examples                                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Editorial pipeline terms                       | "apertura editorial", "taxonomía de monedario", "esta capa", "alineado con la taxonomía"                            |
| AI process phrases                             | "corrección aplicada en esta revisión", "refuerzo editorial aplicado en esta revisión", "ajustado en esta revisión" |
| First-person editor notes                      | "lo dejé", "lo deje"                                                                                                |
| Methodology artifacts                          | "fuentes base declaradas por el ejercicio", "gatilla actualización"                                                 |
| AI tooling terms                               | "prompt", "pipeline" (when used as nouns in article prose)                                                          |
| Competitive positioning notes                  | "no compita con la apertura editorial", "para abrir la portada con más amplitud"                                    |
| Any text that is opaque or friction-generating | Jargon, internal abbreviations, or abstract structural labels with no reader meaning                                |

## Procedure

### 1. Run the Audit

```bash
pnpm run audit:reader-copy
```

Review severity in the output:

- **error** → must fix before publishing; also fails `pnpm run check:reader-facing-copy`
- **warn** → must fix if the phrase is meta-information, increases cognitive friction, or is not clear to the end user; only keep if the phrase is unambiguously appropriate for readers and adds value

If scoping to a specific file or slug, inspect it directly alongside the audit output.

### 2. Run the CI Gate Check

```bash
pnpm run check:reader-facing-copy
```

The BLOCKING_PATTERNS in `scripts/check-reader-facing-copy.mjs` cover additional terms ("prompt", "pipeline", "gatilla actualización", "fuentes base declaradas por el ejercicio") not listed in `editorial-copy-rules.mjs`. Fix all blocking findings before any file is merged.

### 3. Fix Each Finding

For every violation, apply the surgical edit strategy:

| Finding context                                                                                                            | Correct action                                                            |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Sentence is **entirely** internal (no reader value)                                                                        | Delete the sentence                                                       |
| Sentence is partially reader-appropriate                                                                                   | Rewrite removing only the meta-phrase; keep the reader-facing meaning     |
| Heading contains a meta-phrase                                                                                             | Rewrite the heading; never leave an orphaned or empty section             |
| Meta-phrase is inside a frontmatter field rendered to readers (`title`, `description`, `summary`, `answer`, OG/SEO fields) | Remove or rewrite only that field value; preserve field key and structure |
| Text causes cognitive friction even without explicit meta-language                                                         | Rewrite for clarity from the reader's perspective; remove or simplify     |

**Do not** leave blank lines or empty sections after removal. Ensure prose flows naturally from the surrounding copy.

### 4. Handle New (Uncatalogued) Patterns

If you find a meta-phrase that is **not yet** in the detection rules, add it to `scripts/editorial-copy-rules.mjs`:

```js
{
  id: "descriptive-id",          // kebab-case, unique
  severity: "error",             // "error" if it must block CI; "warn" if suspicious
  reason: "Internal/editorial-facing visible copy",
  regex: /\byour regex here\b/gi,
},
```

Place new rules inside the `INTERNAL_EDITORIAL_VISIBLE_RULES` export array. Keep regex patterns anchored with `\b` word boundaries and use the `gi` flags. If the pattern is acceptable on specific allowlisted paths (e.g., `src/pages/about.astro`), add an `allowedPaths` property referencing `READER_FACING_ALLOWLIST_PATHS`.

Then add a matching `BLOCKING_PATTERNS` entry in `scripts/check-reader-facing-copy.mjs` if the violation must fail CI.

### 5. Verify

```bash
pnpm run check:reader-facing-copy
```

Must exit 0 with no issues. Then run the full editorial suite:

```bash
pnpm run check:editorial
```

If touches routes or frontmatter:

```bash
pnpm run check:frontmatter
```

## Scope Boundaries

**In scope:** All text visible to the end user:

- `src/data/blog/**/*.{md,mdx}` — article body and all frontmatter fields rendered to readers (`title`, `description`, `summary`, `answer`, tags, OG/SEO fields)
- `src/pages/**/*.astro` (excluding `src/pages/calculadoras/**`) — page copy and UI strings
- `scripts/editorial-copy-rules.mjs`, `scripts/check-reader-facing-copy.mjs` — pattern registry updates

**Out of scope:** `artifacts/editorial/**` (pipeline artifacts are intentionally internal), `context/**`, `docs/**`, frontmatter `draft: true` files (unpublished), frontmatter fields that are never rendered to readers (e.g., `draft`, internal build flags).

## Completion Criteria

- `pnpm run check:reader-facing-copy` exits 0
- `pnpm run audit:reader-copy` shows 0 errors; all warns are either fixed or explicitly confirmed as reader-appropriate
- No text visible to the end user reads as internal editorial or AI process language
- No text visible to the end user causes cognitive friction, is unclear, or is not meaningful to the reader
- Any newly discovered pattern is registered in `scripts/editorial-copy-rules.mjs`
