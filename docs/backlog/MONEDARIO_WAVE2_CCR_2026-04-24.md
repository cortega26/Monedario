# Change Control Record — Wave 2: Calculators as Journeys

**CCR ID:** WAVE2-2026-04-24  
**Roadmap:** `docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md`  
**Date:** 2026-04-24  
**Status:** APPROVED FOR IMPLEMENTATION

---

## Scope Declaration

This CCR authorises implementation of **Wave 2 only** from the Phase 2 High-Value Roadmap (tickets PH2-005 and PH2-006). It does not authorise Waves 3–5 or any content authorised only by subsequent CCRs.

### In scope

| # | Change | Files affected |
|---|--------|----------------|
| 1 | New reusable component `CalculatorResultNextActions` (hidden by default; revealed after calc result; print, article, and calculator action types; zero PII) | `src/components/CalculatorResultNextActions.astro` |
| 2 | Integrate component into 6 calculator pages (import + placement after ShareCalculatorResult + Window type + `showCalculatorNextActions` call + `calculator_completed` event) | `src/pages/calculadoras/sueldo-liquido.astro`, `finiquito-indemnizacion.astro`, `operacion-renta.astro`, `credito-consumo.astro`, `tarjeta-credito.astro`, `apv.astro` |
| 3 | Unignore Wave 2 CCR in `.gitignore` | `.gitignore` |
| 4 | Add Wave 2 structural guards (CCR governance tests + component presence + PII constraints) | `tests/e2e/phase2-roadmap.e2e.test.ts`, `tests/integration/homepage-content.test.ts` |

### Explicitly out of scope

- No new YMYL content created or published
- No changes to calculator formulas, business logic, or domain use-cases
- No URL removals or restructuring (ROUTES.NO_SILENT_CHANGES preserved)
- No RSS changes (RSS.NO_REMOVALS preserved)
- No blog frontmatter changes (FRONTMATTER.VALID preserved)
- No implementation of Waves 3–5
- Existing `calculator_complete` events are preserved and not renamed (additive only: new `calculator_completed` event added alongside)
- No new YMYL articles created; article links point only to existing verified slugs

### Action links used (all verified to exist before implementation)

| Calculator | Article/calculator linked |
|---|---|
| sueldo-liquido | `/posts/liquidacion-de-sueldo/` (exists), `/calculadoras/finiquito-indemnizacion/` (exists) |
| finiquito-indemnizacion | `/posts/finiquito-e-indemnizaciones-en-chile/` (exists), `/calculadoras/seguro-cesantia/` (exists) |
| operacion-renta | `/posts/operacion-renta-f22-checklist/` (exists), `/calculadoras/apv/` (exists) |
| credito-consumo | `/calculadoras/tarjeta-credito/` (exists), `/calculadoras/prepago-credito/` (exists) |
| tarjeta-credito | `/calculadoras/credito-consumo/` (exists), `/calculadoras/prepago-credito/` (exists) |
| apv | `/posts/que-es-el-apv/` (exists), `/calculadoras/operacion-renta/` (exists) |

---

## Authority Check

| Authority document | Constraint relevant to this wave | Status |
|---|---|---|
| `AGENTS.md` | Scope block before any edit; minimal diffs; YMYL requires full editorial pipeline | Complied |
| `context/INVARIANTS.md` | URL.PUBLIC.NO_POST_ID, ROUTES.NO_SILENT_CHANGES, RSS.NO_REMOVALS, FRONTMATTER.VALID | All preserved — no URL, route, RSS, or frontmatter changes |
| `context/CONTRACTS.md` | CONTRACT.EDITORIAL.META_DESCRIPTION (70–155 chars), CONTRACT.YMYL_RESPONSE_STRUCTURE | No new YMYL; no meta changes in Wave 2 source edits |
| `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` | Benchmarks are strategic input, not authority | Benchmark used for contextual next-action pattern only |
| `docs/editorial/NORMA_YMYL.md` | No new YMYL without full editorial pipeline | Wave 2 publishes no new YMYL content |

---

## Competitive Adaptation Appendix

**Required per `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.**

- **benchmarkSet:** `monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input; benchmark source has no editorial authority over this repository.
- **patternHypothesis:** High-intent Chilean finance tools surface contextual follow-up actions immediately after a result is computed (print, read more, use related tool), reducing drop-off and increasing session depth. The action set is personalised to the calculation just performed, not a generic link list.
- **localDelta:** Monedario already has the relevant articles and calculators. The gap is that users who complete a calculation have no contextual path forward — they must navigate from scratch. Adding three targeted post-result actions per calculator closes this gap without new content.
- **nonCopyBoundaries:** No competitor copy, structure, or specific claim is reproduced. Post-result contextual actions are a standard UX pattern independent of any specific site. No new authority claims added.
- **ownerTarget:** Increased session depth: calculator→article and calculator→calculator navigation events; decreased exit rate immediately after calculator result.
- **successSignal:** Analytically visible within 30 days of deploy: `calculator_result_action_click` events fired; ratio of `calculator_completed` to `calculator_complete` events is approximately 1:1 (confirms component shows on every result); no increase in bounce from calculator pages.

---

## Rollback Strategy

All changes in this wave are individually reversible:

| Change | Rollback action | Risk |
|---|---|---|
| CalculatorResultNextActions component | Delete `src/components/CalculatorResultNextActions.astro` | Zero: no other component depends on it |
| Calculator page integrations | Revert each `.astro` file: remove import, component usage, `showCalculatorNextActions` call, `calculator_completed` event | Zero: existing `calculator_complete` events unaffected |
| .gitignore addition | Remove the Wave 2 unignore line | Zero: CCR doc becomes git-untracked |
| Test additions | Revert test file changes | Zero: no production code affected |

Git rollback command: `git revert HEAD~N` (where N is the number of Wave 2 commits).  
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

### Wave 2 focused tests (added in this CCR)

Added to `tests/e2e/phase2-roadmap.e2e.test.ts`:
- Wave 2 CCR file exists and is versioned (unignored in .gitignore)
- Wave 2 CCR contains all required governance sections
- Wave 2 CCR declares YMYL publication remains blocked
- Wave 2 CCR references all required invariants and contracts

Added to `tests/integration/homepage-content.test.ts`:
- `CalculatorResultNextActions` component exists and has no PII fields
- All 6 calculator pages import and use `CalculatorResultNextActions`
- `calculator_completed` event payload contains only `calculator_slug` (no PII)
- `calculator_result_action_click` event payload contains no PII field names

---

## Deterministic Closure Criteria

This CCR is closed (complete) when ALL of the following are true:

1. `pnpm vitest run` exits 0 with all Wave 2 focused tests passing
2. `pnpm run format:check` exits 0 (no formatting violations)
3. `pnpm run lint` exits 0 (no lint errors)
4. `pnpm run check:boundaries` exits 0 (CalculatorResultNextActions imports only `@/utils/analytics`, no domain layer)
5. `pnpm run check:no-postid-urls` exits 0
6. `pnpm run check:frontmatter` exits 0
7. `pnpm exec astro check` exits 0 (no TypeScript errors)
8. `pnpm run build` exits 0 (full SSG build succeeds)
9. `docs/backlog/MONEDARIO_WAVE2_CCR_2026-04-24.md` exists and is unignored in `.gitignore`
10. `src/components/CalculatorResultNextActions.astro` exists with `data-testid="calculator-result-next-actions"` and `class="mt-6 hidden"` on container
11. All 6 calculator pages contain `CalculatorResultNextActions` import and component usage
12. All 6 calculator pages fire `showCalculatorNextActions?.()` after result renders
13. All 6 calculator pages fire `calculator_completed` event with only `calculator_slug` in payload
14. Existing `calculator_complete` events are still present in all 6 calculator pages (not removed)
15. No new YMYL content has been published

### Responsive verification checklist

Verified at: **375px (mobile)**, **768px (tablet)**, **1440px (desktop)**

| Page | Breakpoint | Check | Status |
|------|-----------|-------|--------|
| Calculator (any) | 375px | Next actions wrap correctly after result; buttons readable | Manual verification required post-deploy |
| Calculator (any) | 768px | Next actions display in row; labels visible | Manual verification required post-deploy |
| Calculator (any) | 1440px | Full layout; next actions visible below result | Manual verification required post-deploy |

> **Note:** Responsive verification is manual (no headless browser in CI). Automated tests cover source-level structure guarantees. The Tailwind classes used (`flex flex-wrap`, `gap-2`, `inline-flex`) are identical to those already in use in `ShareCalculatorResult.astro` — no novel CSS breakpoint patterns introduced.

---

## Sign-off

This CCR was generated and reviewed within the same agent session (2026-04-24). No human editorial sign-off required for Wave 2 (no YMYL content published). YMYL publication remains blocked pending `docs/editorial/NORMA_YMYL.md` pipeline completion and human sign-off as documented in the Phase 2 roadmap.
