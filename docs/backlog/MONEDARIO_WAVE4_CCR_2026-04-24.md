# Change Control Record — Wave 4: Hubs and Pillar-Page Pattern

**CCR ID:** WAVE4-2026-04-24  
**Roadmap:** `docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md`  
**Date:** 2026-04-24  
**Status:** APPROVED FOR IMPLEMENTATION

---

## Scope Declaration

This CCR authorises implementation of **Wave 4 only** from the Phase 2 High-Value Roadmap (ticket PH2-009). It does not authorise Wave 5 or any content authorised only by subsequent CCRs.

### In scope

| # | Change | Files affected |
|---|--------|----------------|
| 1 | Hub pillar config utility: exports per-hub related calculator `LinkCard[]` arrays for all 5 hubs (`sueldo-remuneraciones`, `deuda-credito`, `empleo-ingresos`, `impuestos-personas`, `pensiones-afp`) | `src/config/hubPillarConfig.ts` |
| 2 | sueldo-remuneraciones hub: add `data-hub-section="recommended-route"` wrapper around `<StartHere>`, add dedicated `data-hub-section="related-calculators"` section | `src/pages/guias/sueldo-remuneraciones/index.astro` |
| 3 | deuda-credito hub: add `data-hub-section="recommended-route"` wrapper around `<StartHere>`, add `data-hub-section="related-calculators"` to existing "Herramientas para actuar hoy" section | `src/pages/guias/deuda-credito/index.astro` |
| 4 | empleo-ingresos hub: add `data-hub-section="recommended-route"` wrapper around `<StartHere>`, add new `data-hub-section="related-calculators"` section with `empleoIngresosCalcCards` | `src/pages/guias/empleo-ingresos/index.astro` |
| 5 | impuestos-personas hub: add `data-hub-section="recommended-route"` wrapper around `<StartHere>`, add new `data-hub-section="related-calculators"` section with `impuestosPersonasCalcCards` | `src/pages/guias/impuestos-personas/index.astro` |
| 6 | pensiones-afp hub: add `data-hub-section="recommended-route"` wrapper around `<StartHere>`, add new `data-hub-section="related-calculators"` section with `pensionesAfpCalcCards` | `src/pages/guias/pensiones-afp/index.astro` |
| 7 | Unignore Wave 4 CCR in `.gitignore` | `.gitignore` |
| 8 | Add Wave 4 governance tests and structural guards | `tests/e2e/phase2-roadmap.e2e.test.ts`, `tests/integration/homepage-content.test.ts` |

### Calculator slugs used (all pre-verified to exist in `src/pages/calculadoras/`)

| Hub | Calculator slugs |
|-----|-----------------|
| sueldo-remuneraciones | `sueldo-liquido`, `boleta-honorarios-liquido` |
| deuda-credito | `credito-consumo`, `tarjeta-credito`, `prepago-credito`, `simulador-renegociacion` (existing `deudaClusterHubToolCards`) |
| empleo-ingresos | `finiquito-indemnizacion`, `seguro-cesantia` |
| impuestos-personas | `impuesto-segunda-categoria`, `operacion-renta` |
| pensiones-afp | `simulador-jubilacion`, `comisiones-afp`, `apv` |

### Explicitly out of scope

- No new YMYL content created or published
- No new hub slugs added (ROUTES.NO_SILENT_CHANGES preserved)
- No URL removals or restructuring (URL.PUBLIC.NO_POST_ID preserved)
- No RSS changes (RSS.NO_REMOVALS preserved)
- No blog frontmatter changes (FRONTMATTER.VALID preserved)
- No new npm dependencies
- No changes to calculator pages (Waves 1 and 2 unaffected)
- No changes to the glossary layer (Wave 3 unaffected)
- No implementation of Wave 5 (editorial pipeline preparation)
- No modifications to `StartHere.astro` component (wrapper pattern used instead)
- No changes to calculator formulas or results

---

## Authority Check

| Authority document | Constraint relevant to this wave | Status |
|---|---|---|
| `AGENTS.md` | Scope block before any edit; minimal diffs; YMYL requires full editorial pipeline | Complied |
| `context/INVARIANTS.md` | URL.PUBLIC.NO_POST_ID, ROUTES.NO_SILENT_CHANGES, RSS.NO_REMOVALS, FRONTMATTER.VALID | All preserved — no URL, route, RSS, or frontmatter changes |
| `context/CONTRACTS.md` | CONTRACT.EDITORIAL.META_DESCRIPTION (70–155 chars), CONTRACT.YMYL_RESPONSE_STRUCTURE | No new YMYL; no meta description changes in Wave 4 hub edits |
| `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` | Benchmarks are strategic input, not authority | Benchmark used for hub/pillar-page structural pattern only |
| `docs/editorial/NORMA_YMYL.md` | No new YMYL without full editorial pipeline | Wave 4 publishes no new YMYL content |

---

## Competitive Adaptation Appendix

**Required per `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.**

- **benchmarkSet:** `monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input; benchmark source has no editorial authority over this repository.
- **patternHypothesis:** High-authority Chilean finance sites organise content into topic hubs with consistent navigation markers — a recommended reading path and an explicit tools/calculator section. Users arriving at a hub without a clear starting point have higher exit rates. Structural consistency across hubs reduces per-hub editorial overhead.
- **localDelta:** Monedario already has 5 `/guias/` hub pages covering distinct financial clusters. The gap is inconsistent structure: some hubs have an explicit "Herramientas" section while others bury calculators inside reading-path steps. Wave 4 adds consistent `data-hub-section` markers and dedicated calculator sections without restructuring existing content.
- **nonCopyBoundaries:** No competitor copy, structure, or specific claim is reproduced. Hub/pillar-page architecture is a standard content strategy pattern independent of any specific site.
- **ownerTarget:** Measurable internal linking depth improvement; reduced time-to-calculator for users arriving at hub pages; test-verified structural consistency across all 5 hubs.
- **successSignal:** Analytically visible within 30 days of deploy: decreased hub bounce rate; no build regressions; all 5 hub pages pass structural guard tests.

---

## Rollback Strategy

All changes in this wave are individually reversible:

| Change | Rollback action | Risk |
|---|---|---|
| `hubPillarConfig.ts` | Delete `src/config/hubPillarConfig.ts` | Zero: imported only by hub pages edited in this wave |
| sueldo-remuneraciones edits | Remove `data-hub-section` wrapper and new calculator section, remove hubPillarConfig import | Zero: no URL changes, no formula changes |
| deuda-credito edits | Remove `data-hub-section` attributes from wrapper div and "Herramientas" section | Zero: no content removed, only attributes added |
| empleo-ingresos edits | Remove `data-hub-section` wrapper, new section, and hubPillarConfig import | Zero: no URL changes, no content removed |
| impuestos-personas edits | Remove `data-hub-section` wrapper, new section, and hubPillarConfig import | Zero: no URL changes, no content removed |
| pensiones-afp edits | Remove `data-hub-section` wrapper, new section, and hubPillarConfig import | Zero: no URL changes, no content removed |
| `.gitignore` addition | Remove the Wave 4 unignore line | Zero: CCR doc becomes git-untracked |
| Test additions | Revert test file changes | Zero: no production code affected |

Git rollback command: `git revert HEAD~N` (where N is the number of Wave 4 commits).  
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

### Wave 4 focused tests (added in this CCR)

Added to `tests/e2e/phase2-roadmap.e2e.test.ts`:
- Wave 4 CCR file exists and is versioned (unignored in .gitignore)
- Wave 4 CCR contains all required governance sections
- Wave 4 CCR declares YMYL publication remains blocked
- Wave 4 CCR references all required invariants and contracts
- Wave 4 CCR documents all 5 hub slugs

Added to `tests/integration/homepage-content.test.ts`:
- Wave 4 CCR file exists and is unignored
- `hubPillarConfig.ts` exists and has no domain or application imports
- All 5 hub pages carry `data-hub-section="recommended-route"` marker
- All 5 hub pages carry `data-hub-section="related-calculators"` marker

---

## Deterministic Closure Criteria

This CCR is closed (complete) when ALL of the following are true:

1. `pnpm vitest run` exits 0 with all Wave 4 focused tests passing
2. `pnpm run format:check` exits 0 (no formatting violations)
3. `pnpm run lint` exits 0 (no lint errors)
4. `pnpm run check:boundaries` exits 0 (no domain/application imports in new config/hub files)
5. `pnpm run check:no-postid-urls` exits 0
6. `pnpm run check:frontmatter` exits 0
7. `pnpm exec astro check` exits 0 (no TypeScript errors)
8. `pnpm run build` exits 0 (full SSG build succeeds)
9. `docs/backlog/MONEDARIO_WAVE4_CCR_2026-04-24.md` exists and is unignored in `.gitignore`
10. `src/config/hubPillarConfig.ts` exports per-hub calculator cards and contains no imports from `@/domain/` or `@/application/`
11. All 5 hub pages (`sueldo-remuneraciones`, `deuda-credito`, `empleo-ingresos`, `impuestos-personas`, `pensiones-afp`) contain `data-hub-section="recommended-route"` in their source
12. All 5 hub pages contain `data-hub-section="related-calculators"` in their source
13. No new YMYL content has been published
14. Wave 5 implementation has NOT been started in this CCR

### Responsive verification checklist

No new visual components introduced — the added sections use the same card and list patterns already present in the hub pages. The `data-hub-section` attributes are invisible to end users and carry no CSS. No novel CSS breakpoint patterns introduced.

---

## Sign-off

This CCR was generated and reviewed within the same agent session (2026-04-24). No human editorial sign-off required for Wave 4 (no YMYL content published). YMYL publication remains blocked pending `docs/editorial/NORMA_YMYL.md` pipeline completion and human sign-off as documented in the Phase 2 roadmap.
