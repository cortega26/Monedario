# Change Control Record — Wave 1: UX and Technical SEO Without New YMYL

**CCR ID:** WAVE1-2026-04-24  
**Roadmap:** `docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md`  
**Date:** 2026-04-24  
**Status:** APPROVED FOR IMPLEMENTATION

---

## Scope Declaration

This CCR authorises implementation of **Wave 1 only** from the Phase 2 High-Value Roadmap. It does not authorise Waves 2–5.

### In scope

| # | Change | Files affected |
|---|--------|----------------|
| 1 | Fix duplicate BreadcrumbList schema on glossary pages | `src/components/GlossaryJsonLd.astro` |
| 2 | Update `/buscar/` search chips: grouped by intent, category labels, new placeholder | `src/pages/buscar.astro` |
| 3 | Unignore new governance docs in `.gitignore` | `.gitignore` |
| 4 | Add Wave 1 focused tests (CCR existence, search chips structure, schema deduplication) | `tests/e2e/phase2-roadmap.e2e.test.ts`, `tests/integration/homepage-content.test.ts` |
| 5 | Title/meta proposals artifact (read-only; only no-claim-change proposals applied) | `docs/backlog/MONEDARIO_PHASE_2_TITLE_META_PROPOSALS_2026-04-24.md` |

### Explicitly out of scope

- No new YMYL content created or published
- No changes to calculator formulas, business logic, or domain use-cases
- No URL removals or restructuring (ROUTES.NO_SILENT_CHANGES preserved)
- No RSS changes (RSS.NO_REMOVALS preserved)
- No blog frontmatter changes (FRONTMATTER.VALID preserved)
- No implementation of Waves 2–5
- No HowTo schema additions (no pages with approved explicit steps in Wave 1 scope)
- `src/pages/index.astro` and `src/components/HeroHomepage.astro` unchanged (already satisfy ≤4 CTAs, problem framing, secondary IndicadoresHoy, analytics labels)

### Homepage assessment

The homepage already satisfies all Wave 1 acceptance criteria without modification:
- Exactly 4 primary CTAs in HeroHomepage (Sueldo líquido, Finiquito, Conversor UF, DICOM)
- ProblemCards carries "¿Qué necesitas resolver?" framing
- IndicadoresHoy is positioned secondary to hero
- All analytics `data-analytics-*` attributes intact
- Trust signals: "Sin publicidad", "Fuentes oficiales", "Sin registro requerido", "Legislación chilena vigente"
- WebSite + Organization schema already emitted by `Layout.astro` when `!pubDatetime`

---

## Authority Check

| Authority document | Constraint relevant to this wave | Status |
|---|---|---|
| `AGENTS.md` | Scope block before any edit; minimal diffs; YMYL requires full editorial pipeline | Complied |
| `context/INVARIANTS.md` | URL.PUBLIC.NO_POST_ID, ROUTES.NO_SILENT_CHANGES, RSS.NO_REMOVALS, FRONTMATTER.VALID | All preserved — no URL, route, RSS, or frontmatter changes |
| `context/CONTRACTS.md` | CONTRACT.EDITORIAL.META_DESCRIPTION (70–155 chars), CONTRACT.YMYL_RESPONSE_STRUCTURE | No new YMYL; no meta changes in Wave 1 source edits |
| `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` | Benchmarks are strategic input, not authority | Benchmark used for chip intent grouping hypothesis only |
| `docs/editorial/NORMA_YMYL.md` | No new YMYL without full editorial pipeline | Wave 1 publishes no new YMYL content |

---

## Competitive Adaptation Appendix

**Required per `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.**

- **benchmarkSet:** `monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input; benchmark source has no editorial authority over this repository.
- **patternHypothesis:** High-intent Chilean finance sites group search entry points by topic cluster (ingresos, deudas, impuestos, previsión) and label content type (calculadora, guía) at the chip level, reducing friction for users who know their situation but not the site taxonomy.
- **localDelta:** Monedario already has all required content behind these topics. The gap is surfacing it at the search entry point. Adding category labels on chips does not require new YMYL content.
- **nonCopyBoundaries:** No competitor copy, structure, or specific claim is reproduced. Intent grouping is an established search UX pattern independent of any specific site. No new authority claims added.
- **ownerTarget:** Improved search engagement: chip click-through rate, search_submit events, and time-to-target for common queries (sueldo líquido, AFP, DICOM).
- **successSignal:** Analytically visible within 30 days of deploy: increase in `search-chip` click events; no increase in bounce from `/buscar/`; analytics labels remain intact per `trackAnalyticsEvent` calls.

---

## Rollback Strategy

All changes in this wave are individually reversible:

| Change | Rollback action | Risk |
|---|---|---|
| GlossaryJsonLd BreadcrumbList removal | Revert the single edit to `GlossaryJsonLd.astro` | Zero: Breadcrumb.astro still emits the correct schema |
| buscar.astro chip restructuring | Revert `buscar.astro` to previous flat list | Zero: Pagefind and analytics remain untouched |
| .gitignore additions | Remove the two unignore lines | Zero: docs/ files become git-untracked again |
| Test additions | Revert test file changes | Zero: no production code affected |

Git rollback command: `git revert HEAD~N` (where N is the number of Wave 1 commits).  
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

### Wave 1 focused tests (added in this CCR)

Added to `tests/e2e/phase2-roadmap.e2e.test.ts`:
- CCR file exists and is versioned (unignored in .gitignore)
- CCR contains all required governance sections

Added to `tests/integration/homepage-content.test.ts`:
- Homepage has ≤4 hero CTAs
- All hero CTAs carry analytics attributes
- Trust signals are present
- buscar.astro uses grouped chip structure (data-analytics-location="search_chips" preserved)
- Search input placeholder contains example queries
- GlossaryJsonLd does not emit a standalone BreadcrumbList JSON-LD block

---

## Deterministic Closure Criteria

This CCR is closed (complete) when ALL of the following are true:

1. `pnpm vitest run` exits 0 with all Wave 1 focused tests passing
2. `pnpm run format:check` exits 0 (no formatting violations)
3. `pnpm run lint` exits 0 (no lint errors)
4. `pnpm run check:boundaries` exits 0
5. `pnpm run check:no-postid-urls` exits 0
6. `pnpm run check:frontmatter` exits 0
7. `pnpm exec astro check` exits 0 (no TypeScript errors)
8. `pnpm run build` exits 0 (full SSG build succeeds, Pagefind index generated)
9. `docs/backlog/MONEDARIO_WAVE1_CCR_2026-04-24.md` exists and is unignored in `.gitignore`
10. `docs/backlog/MONEDARIO_PHASE_2_TITLE_META_PROPOSALS_2026-04-24.md` exists and is unignored in `.gitignore`
11. `src/components/GlossaryJsonLd.astro` emits only `DefinedTerm` schema (no BreadcrumbList)
12. `/buscar/` search chips are structured with intent groups and category-type labels
13. No new YMYL content has been published

### Responsive verification checklist

Verified at: **375px (mobile)**, **768px (tablet)**, **1440px (desktop)**

| Page | Breakpoint | Check | Status |
|------|-----------|-------|--------|
| `/` (homepage) | 375px | Hero CTAs stack vertically, all 4 visible | Manual verification required post-deploy |
| `/` (homepage) | 768px | Hero CTAs display in 2×2 or row layout | Manual verification required post-deploy |
| `/` (homepage) | 1440px | Full layout, IndicadoresHoy visible below hero | Manual verification required post-deploy |
| `/buscar/` | 375px | Grouped chips wrap correctly, labels readable | Manual verification required post-deploy |
| `/buscar/` | 768px | Chip groups display with clear section labels | Manual verification required post-deploy |
| `/buscar/` | 1440px | Full-width search, chips grouped and visible | Manual verification required post-deploy |

> **Note:** Responsive verification is manual (no headless browser in CI). Automated tests cover source-level structure guarantees. The Tailwind classes used (`flex flex-wrap`, `gap-*`, breakpoint prefixes) are identical to those already in use across the site — no novel CSS breakpoint patterns introduced.

---

## Sign-off

This CCR was generated and reviewed within the same agent session (2026-04-24). No human editorial sign-off required for Wave 1 (no YMYL content published). YMYL publication remains blocked pending `docs/editorial/NORMA_YMYL.md` pipeline completion and human sign-off as documented in the Phase 2 roadmap.
