# Change Control Record — Wave 5: Editorial Pipeline Preparation

**CCR ID:** WAVE5-2026-04-24  
**Roadmap:** `docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md`  
**Date:** 2026-04-24  
**Status:** APPROVED FOR IMPLEMENTATION

---

## Scope Declaration

This CCR authorises implementation of **Wave 5 only** from the Phase 2 High-Value Roadmap (tickets PH2-010 through PH2-015). It does not authorise Wave 6 or any subsequent work. Wave 5 is exclusively a documentation and pipeline scaffolding wave — no new public URLs, no new calculators, no new components, no new YMYL content published.

### In scope

| # | Change | Files affected |
|---|--------|----------------|
| 1 | `docs/editorial/artifacts/dicom-salida/` — strategy artifact and publish-packet gate scaffold | `docs/editorial/artifacts/dicom-salida/01-artifact.md`, `docs/editorial/artifacts/dicom-salida/07-publish-packet.md` |
| 2 | `docs/editorial/artifacts/cotizaciones-impagas/` — strategy artifact and publish-packet gate scaffold | `docs/editorial/artifacts/cotizaciones-impagas/01-artifact.md`, `docs/editorial/artifacts/cotizaciones-impagas/07-publish-packet.md` |
| 3 | `docs/editorial/artifacts/licencia-medica-wizard/` — strategy artifact and publish-packet gate scaffold | `docs/editorial/artifacts/licencia-medica-wizard/01-artifact.md`, `docs/editorial/artifacts/licencia-medica-wizard/07-publish-packet.md` |
| 4 | `docs/editorial/artifacts/operacion-renta-centro/` — strategy artifact and publish-packet gate scaffold | `docs/editorial/artifacts/operacion-renta-centro/01-artifact.md`, `docs/editorial/artifacts/operacion-renta-centro/07-publish-packet.md` |
| 5 | `docs/editorial/artifacts/afp-comparador-ampliado/` — strategy artifact and publish-packet gate scaffold | `docs/editorial/artifacts/afp-comparador-ampliado/01-artifact.md`, `docs/editorial/artifacts/afp-comparador-ampliado/07-publish-packet.md` |
| 6 | `docs/editorial/artifacts/fraude-cargo-no-reconocido/` — strategy artifact and publish-packet gate scaffold | `docs/editorial/artifacts/fraude-cargo-no-reconocido/01-artifact.md`, `docs/editorial/artifacts/fraude-cargo-no-reconocido/07-publish-packet.md` |
| 7 | Unignore Wave 5 CCR and artifact folders in `.gitignore` | `.gitignore` |
| 8 | Add Wave 5 governance tests and structural guards | `tests/e2e/phase2-roadmap.e2e.test.ts`, `tests/integration/homepage-content.test.ts` |
| 9 | Update roadmap status header and ticket completion marks | `docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md` |

### Artifact slugs and host hubs

| Artifact slug | Host hub cluster | Official sources |
|--------------|-----------------|-----------------|
| `dicom-salida` | `/guias/deuda-credito/` | CMF, ChileAtiende, Equifax/Boletín issuer (process facts only), BCN consumer law |
| `cotizaciones-impagas` | `/guias/pensiones-afp/` | Superintendencia de Pensiones, AFC, ChileAtiende, Dirección del Trabajo |
| `licencia-medica-wizard` | `/guias/empleo-ingresos/` | SUSESO, COMPIN/ChileAtiende, Fonasa |
| `operacion-renta-centro` | `/guias/impuestos-personas/` | SII, TGR |
| `afp-comparador-ampliado` | `/guias/pensiones-afp/` | Superintendencia de Pensiones, official AFP fee data |
| `fraude-cargo-no-reconocido` | `/guias/deuda-credito/` | CMF, SERNAC, Ley 20.009/BCN, institutional emergency channels |

### Explicitly out of scope

- No new YMYL content created or published — all `07-publish-packet.md` files are `BLOCKED — pending human sign-off`
- No new public URLs added (URL.PUBLIC.NO_POST_ID preserved)
- No new routes or route changes (ROUTES.NO_SILENT_CHANGES preserved)
- No RSS changes (RSS.NO_REMOVALS preserved)
- No blog frontmatter changes (FRONTMATTER.VALID preserved)
- No new npm dependencies
- No changes to calculator pages, hub pages, or components
- No changes to the glossary layer (Wave 3 unaffected)
- No changes to hub pillar structure (Wave 4 unaffected)
- No `.astro` or `.ts` source files in `docs/editorial/artifacts/` (docs-only wave)

---

## Authority Check

| Authority document | Constraint relevant to this wave | Status |
|---|---|---|
| `AGENTS.md` | Scope block before any edit; minimal diffs; YMYL requires full editorial pipeline | Complied — Wave 5 is scaffold-only; no YMYL content published |
| `context/INVARIANTS.md` | URL.PUBLIC.NO_POST_ID, ROUTES.NO_SILENT_CHANGES, RSS.NO_REMOVALS, FRONTMATTER.VALID | All preserved — no URL, route, RSS, or frontmatter changes |
| `context/CONTRACTS.md` | CONTRACT.EDITORIAL.META_DESCRIPTION (70–155 chars), CONTRACT.YMYL_RESPONSE_STRUCTURE | Not triggered in Wave 5 — no new pages created; contracts will apply at publish time |
| `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` | Benchmarks are strategic input, not authority | Benchmark used for opportunity identification only; all six `01-artifact.md` files declare non-copy boundaries |
| `docs/editorial/NORMA_YMYL.md` | No new YMYL without full editorial pipeline and human sign-off | Wave 5 explicitly does not publish YMYL content; all publish-packets are BLOCKED |
| `context/EDITORIAL_AI_PIPELINE.md` | Canonical artifact pipeline (01–07); role separation rule | Wave 5 creates 01-artifact.md and 07-publish-packet.md per the canonical pipeline; remaining stages (02–06) are deferred to future editorial sessions |

---

## Competitive Adaptation Appendix

**Required per `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.**

- **benchmarkSet:** `monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input; benchmark source has no editorial authority over this repository.
- **patternHypothesis:** High-authority Chilean finance sites hold dominant positions on six high-intent YMYL query clusters that Monedario does not currently serve: credit record repair (DICOM), unpaid pension contributions, medical leave procedures, income tax filing (centro Operación Renta), AFP comparison, and card fraud response. All six are amenable to structured, source-cited editorial content. The pipeline preparation pattern (scaffold the artifact and publish-gate before drafting) reduces the risk of publishing under-reviewed YMYL content by separating the strategic design step from the editorial production step.
- **localDelta:** Monedario has calculators and hubs in four of the five relevant clusters but has zero editorial YMYL content for any of these six specific topics. Wave 5 scaffolds the editorial pipeline for all six without publishing any content, allowing future drafting sessions to proceed with governance already in place.
- **nonCopyBoundaries:** No competitor copy, specific claims, structures, or phrasing reproduced in any artifact file. Each `01-artifact.md` derives its source family list from official Chilean government sources, not from competitor pages. The six artifact slugs are topic identifiers, not URLs copied from competitors.
- **ownerTarget:** All six `01-artifact.md` files have declared `ownerTarget` slugs within existing hub clusters. Internal linking plans are documented per artifact. No new hub-level pages created in Wave 5.
- **successSignal:** Wave 5 itself is a documentation wave — success is that all 12 artifact files exist, pass structural guard tests, are correctly git-tracked, and that no public URL was added. Editorial success (organic traffic) is measured after each individual artifact is published in a future wave following human sign-off.

---

## Rollback Strategy

All changes in this wave are individually reversible:

| Change | Rollback action | Risk |
|---|---|---|
| `docs/editorial/artifacts/dicom-salida/` | Delete folder | Zero: no public URL, no build dependency |
| `docs/editorial/artifacts/cotizaciones-impagas/` | Delete folder | Zero: no public URL, no build dependency |
| `docs/editorial/artifacts/licencia-medica-wizard/` | Delete folder | Zero: no public URL, no build dependency |
| `docs/editorial/artifacts/operacion-renta-centro/` | Delete folder | Zero: no public URL, no build dependency |
| `docs/editorial/artifacts/afp-comparador-ampliado/` | Delete folder | Zero: no public URL, no build dependency |
| `docs/editorial/artifacts/fraude-cargo-no-reconocido/` | Delete folder | Zero: no public URL, no build dependency |
| `.gitignore` additions | Remove the Wave 5 unignore lines | Zero: artifact docs become git-untracked |
| Test additions | Revert test file changes | Zero: no production code affected |
| Roadmap status update | Revert the status line change | Zero: documentation only |

Git rollback command: `git revert HEAD~N` (where N is the number of Wave 5 commits).  
No database, no CDN cache, no third-party integration affected. No public URL added in Wave 5.

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

### Wave 5 focused tests (added in this CCR)

Added to `tests/e2e/phase2-roadmap.e2e.test.ts`:
- Wave 5 CCR file exists and is unignored in .gitignore
- Wave 5 CCR contains all required governance sections
- Wave 5 CCR declares YMYL publication remains blocked
- Wave 5 CCR references all required invariants and contracts
- Wave 5 CCR documents all 6 artifact slugs

Added to `tests/integration/homepage-content.test.ts`:
- Wave 5 CCR file exists and is unignored
- All 6 artifact folders contain `01-artifact.md` with `Status: UNPUBLISHED`
- All 6 artifact folders contain `07-publish-packet.md` with `Status: BLOCKED — pending human sign-off`
- No `.astro` or `.ts` source files exist in any artifact folder (docs-only verification)

---

## Deterministic Closure Criteria

This CCR is closed (complete) when ALL of the following are true:

1. `pnpm vitest run` exits 0 with all Wave 5 focused tests passing
2. `pnpm run format:check` exits 0 (no formatting violations)
3. `pnpm run lint` exits 0 (no lint errors)
4. `pnpm run check:boundaries` exits 0 (no domain/application imports in new files)
5. `pnpm run check:no-postid-urls` exits 0
6. `pnpm run check:frontmatter` exits 0
7. `pnpm exec astro check` exits 0 (no TypeScript errors)
8. `pnpm run build` exits 0 (full SSG build succeeds)
9. `docs/backlog/MONEDARIO_WAVE5_CCR_2026-04-24.md` exists and is unignored in `.gitignore`
10. All 6 artifact folders exist under `docs/editorial/artifacts/`
11. Each artifact folder contains `01-artifact.md` with `Status: UNPUBLISHED` at the top
12. Each artifact folder contains `07-publish-packet.md` with `Status: BLOCKED — pending human sign-off`
13. No `.astro` or `.ts` source files exist in any artifact folder
14. `docs/editorial/artifacts/` is unignored in `.gitignore` (despite the `artifacts/` ignore rule)
15. No new public URL has been added to the site
16. No YMYL content has been published
17. Roadmap status header updated to "Waves 1–5 complete (2026-04-24) — roadmap complete"
18. Tickets PH2-010 through PH2-015 marked `✅ done 2026-04-24` in the roadmap

### Responsive verification checklist

No new visual components, CSS, or JavaScript introduced. All Wave 5 deliverables are Markdown documentation files. No novel CSS breakpoint patterns. No changes to any public-facing page.

---

## Sign-off

This CCR was generated and reviewed within the same agent session (2026-04-24). No human editorial sign-off required for Wave 5 infrastructure (no YMYL content published). YMYL publication remains blocked for all six artifacts pending `docs/editorial/NORMA_YMYL.md` pipeline completion and human sign-off as documented in the Phase 2 roadmap and in each individual `07-publish-packet.md` file.
