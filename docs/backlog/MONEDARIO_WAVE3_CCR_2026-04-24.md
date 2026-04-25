# Change Control Record — Wave 3: Glossary and Interlinking Layer

**CCR ID:** WAVE3-2026-04-24  
**Roadmap:** `docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md`  
**Date:** 2026-04-24  
**Status:** APPROVED FOR IMPLEMENTATION

---

## Scope Declaration

This CCR authorises implementation of **Wave 3 only** from the Phase 2 High-Value Roadmap (tickets PH2-007 and PH2-008). It does not authorise Waves 4–5 or any content authorised only by subsequent CCRs.

### In scope

| # | Change | Files affected |
|---|--------|----------------|
| 1 | Glossary allowlist utility: exports `GLOSSARY_ALLOWLIST` (11 terms: AFP, AFC, UF, UTM, CAE, DICOM, Finiquito, APV, IPC, SII, CMF) and `resolveGlossarySlug(term)` | `src/utils/glossaryAllowlist.ts` |
| 2 | `GlossaryInlineLink` component: props `{ slug, term, shortDefinition }`, renders `<a>` with analytics attributes, ARIA tooltip via `aria-describedby`, CSS-only hover/focus/tap show-hide | `src/components/GlossaryInlineLink.astro` |
| 3 | `injectGlossaryLinks(html)` pure function: no DOM parser, regex/string scan, overlinking policy (1 per term, max 5 total, no headings, no code/pre/table/a), pre-scans for existing `data-glossary-term` links | `src/utils/injectGlossaryLinks.ts` |
| 4 | `GlossaryContentWrapper` component: captures `<Content />` via `Astro.slots.render("default")`, applies `injectGlossaryLinks`, emits via `<Fragment set:html>` | `src/components/GlossaryContentWrapper.astro` |
| 5 | Wire wrapper into article layout: import + wrap `<Content />` | `src/layouts/PostDetails.astro` |
| 6 | Unignore Wave 3 CCR in `.gitignore` | `.gitignore` |
| 7 | Add Wave 3 governance tests and structural guards | `tests/e2e/phase2-roadmap.e2e.test.ts`, `tests/integration/homepage-content.test.ts`, `tests/unit/injectGlossaryLinks.test.ts` |

### Explicitly out of scope

- No new YMYL content created or published
- No new glossary terms added beyond the 11-term allowlist
- No changes to existing glossary page slugs (ROUTES.NO_SILENT_CHANGES preserved)
- No URL removals or restructuring
- No RSS changes (RSS.NO_REMOVALS preserved)
- No blog frontmatter changes (FRONTMATTER.VALID preserved)
- No new npm dependencies (pure regex, no DOM parser, no external lib)
- No changes to calculator pages (Waves 1 and 2 unaffected)
- No implementation of Waves 4–5

### 11-term allowlist

| Term | Slug | Glossary page |
|------|------|---------------|
| AFP | afp | `/glosario/afp/` |
| AFC | afc | `/glosario/afc/` |
| UF | uf | `/glosario/uf/` |
| UTM | utm | `/glosario/utm/` |
| CAE | cae | `/glosario/cae/` |
| DICOM | dicom | `/glosario/dicom/` |
| Finiquito | finiquito | `/glosario/finiquito/` |
| APV | apv | `/glosario/apv/` |
| IPC | ipc | `/glosario/ipc/` |
| SII | sii | `/glosario/sii/` |
| CMF | cmf | `/glosario/cmf/` |

All 11 glossary slugs confirmed to exist in `src/data/glossary/` before implementation.

### Overlinking policy

- Maximum 1 injected link per term per article (first document-order occurrence only)
- Maximum 5 auto-injected links per article across all terms
- No injection inside: `<h1>`–`<h6>`, `<code>`, `<pre>`, `<table>`, `<a>`
- Pre-existing `<a data-glossary-term="{slug}">` links suppress auto-injection for that slug

---

## Authority Check

| Authority document | Constraint relevant to this wave | Status |
|---|---|---|
| `AGENTS.md` | Scope block before any edit; minimal diffs; YMYL requires full editorial pipeline | Complied |
| `context/INVARIANTS.md` | URL.PUBLIC.NO_POST_ID, ROUTES.NO_SILENT_CHANGES, RSS.NO_REMOVALS, FRONTMATTER.VALID | All preserved — no URL, route, RSS, or frontmatter changes |
| `context/CONTRACTS.md` | CONTRACT.EDITORIAL.META_DESCRIPTION (70–155 chars), CONTRACT.YMYL_RESPONSE_STRUCTURE | No new YMYL; no meta changes in Wave 3 source edits |
| `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` | Benchmarks are strategic input, not authority | Benchmark used for contextual interlinking pattern only |
| `docs/editorial/NORMA_YMYL.md` | No new YMYL without full editorial pipeline | Wave 3 publishes no new YMYL content |

---

## Competitive Adaptation Appendix

**Required per `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.**

- **benchmarkSet:** `monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input; benchmark source has no editorial authority over this repository.
- **patternHypothesis:** High-authority Chilean finance sites provide inline definitions for acronyms and technical terms (AFP, UF, SII, etc.), reducing cognitive friction for users unfamiliar with the Chilean financial system. Contextual glossary links allow readers to understand terms without leaving the current article.
- **localDelta:** Monedario already has a `/glosario/` section with verified definitions. The gap is that article bodies do not link to these definitions. Adding auto-injected inline links at SSG time (no runtime JS, no DOM parser) closes this gap without editorial effort per article.
- **nonCopyBoundaries:** No competitor copy, structure, or specific claim is reproduced. Inline glossary linking is a standard editorial pattern independent of any specific site. No new authority claims added.
- **ownerTarget:** Reduced exit rate from glossary-relevant articles; increased `glossary-inline-link` click events; improved internal link graph depth for SEO.
- **successSignal:** Analytically visible within 30 days of deploy: `data-analytics-cta="glossary-inline-link"` click events appear in analytics; no build regressions; no increase in 404s from injected links.

---

## Rollback Strategy

All changes in this wave are individually reversible:

| Change | Rollback action | Risk |
|---|---|---|
| glossaryAllowlist.ts | Delete `src/utils/glossaryAllowlist.ts` | Zero: no production page depends on it independently |
| injectGlossaryLinks.ts | Delete `src/utils/injectGlossaryLinks.ts` | Zero: only used by GlossaryContentWrapper |
| GlossaryInlineLink.astro | Delete `src/components/GlossaryInlineLink.astro` | Zero: not imported by any page currently |
| GlossaryContentWrapper.astro | Revert to passthrough (remove injectGlossaryLinks import and call) | Zero: rendered HTML is structurally unchanged for articles with no allowlist terms |
| PostDetails.astro change | Replace `<GlossaryContentWrapper><Content /></GlossaryContentWrapper>` with `<Content />` | Zero: article content is unchanged; only injected links disappear |
| .gitignore addition | Remove the Wave 3 unignore line | Zero: CCR doc becomes git-untracked |
| Test additions | Revert test file changes | Zero: no production code affected |

Git rollback command: `git revert HEAD~N` (where N is the number of Wave 3 commits).  
No database, no CDN cache, no third-party integration affected.

---

## Test Plan

### Automated gates (run in order — cheap first)

```
pnpm vitest run
pnpm run format:check
pnpm run lint
pnpm run check:boundaries
pnpm run check:no-postid-urls
pnpm run check:links
pnpm run check:frontmatter
pnpm exec astro check
pnpm run build
```

### Wave 3 focused tests (added in this CCR)

Added to `tests/e2e/phase2-roadmap.e2e.test.ts`:
- Wave 3 CCR file exists and is versioned (unignored in .gitignore)
- Wave 3 CCR contains all required governance sections
- Wave 3 CCR declares YMYL publication remains blocked
- Wave 3 CCR references all required invariants and contracts
- Wave 3 CCR documents the 11-term allowlist

Added to `tests/integration/homepage-content.test.ts`:
- Wave 3 CCR file exists and is unignored
- glossaryAllowlist.ts has exactly 11 terms
- GlossaryInlineLink.astro has required analytics attributes and no PII fields
- PostDetails.astro imports and uses GlossaryContentWrapper
- injectGlossaryLinks utility has no imports from domain or application layers

Added as `tests/unit/injectGlossaryLinks.test.ts`:
- Injects link for a known term in plain text
- Does not inject in headings
- Does not inject in code blocks
- Does not inject in pre blocks
- Does not inject inside existing links
- Does not inject inside table cells
- Only injects first occurrence of each term
- Caps at 5 total links
- Does not re-inject a pre-existing data-glossary-term link
- Matches terms case-insensitively
- Returns input unchanged when no terms found
- Injects links for multiple different terms in document order

---

## Deterministic Closure Criteria

This CCR is closed (complete) when ALL of the following are true:

1. `pnpm vitest run` exits 0 with all Wave 3 focused tests passing
2. `pnpm run format:check` exits 0 (no formatting violations)
3. `pnpm run lint` exits 0 (no lint errors)
4. `pnpm run check:boundaries` exits 0 (no domain/application imports in new utils/components)
5. `pnpm run check:no-postid-urls` exits 0
6. `pnpm run check:frontmatter` exits 0
7. `pnpm exec astro check` exits 0 (no TypeScript errors)
8. `pnpm run build` exits 0 (full SSG build succeeds, injected links valid)
9. `docs/backlog/MONEDARIO_WAVE3_CCR_2026-04-24.md` exists and is unignored in `.gitignore`
10. `src/utils/glossaryAllowlist.ts` exports exactly 11 terms
11. `src/components/GlossaryInlineLink.astro` exists with `data-analytics-cta="glossary-inline-link"` and `data-analytics-location="article_body"`
12. `src/utils/injectGlossaryLinks.ts` contains no imports from `@/domain/` or `@/application/`
13. `src/layouts/PostDetails.astro` imports `GlossaryContentWrapper` and wraps `<Content />`
14. `pnpm run build` produces article HTML with at least one `data-glossary-term` attribute in articles that contain allowlist terms
15. No new YMYL content has been published

### Responsive verification checklist

No new visual components are rendered in the critical path by default (injected `<a>` tags use existing `app-prose` link styles). `GlossaryInlineLink.astro` is available for explicit use but not used in article bodies via auto-injection.

> **Note:** Injected links use `class="glossary-inline-link"` and inherit `app-prose` link styles. No novel CSS breakpoint patterns introduced. Tooltip in `GlossaryInlineLink.astro` uses Tailwind `group-hover:opacity-100 group-focus-within:opacity-100` — identical pattern to existing components.

---

## Sign-off

This CCR was generated and reviewed within the same agent session (2026-04-24). No human editorial sign-off required for Wave 3 (no YMYL content published). YMYL publication remains blocked pending `docs/editorial/NORMA_YMYL.md` pipeline completion and human sign-off as documented in the Phase 2 roadmap.
