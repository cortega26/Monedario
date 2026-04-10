# Calculator Portfolio Audit — April 2026

**Date:** 2026-04-10  
**Auditor:** Claude Opus 4.6 (automated audit program)  
**Scope:** Full portfolio audit of 16 public calculator routes  

---

## 1. Audit scope and methodology

### Scope
- 16 public calculator routes in `src/pages/calculadoras/*.astro`
- 17 engine files in `src/application/use-cases/` and `src/domain/taxation/`
- 1 portfolio registry (`src/config/calculatorPortfolio.ts`)
- 1 calculator index page
- 43 test files (218 tests)
- Article-to-calculator entry flows for each calculator

### Methodology
- **Baseline commands:** `pnpm run test`, `pnpm run astro check`, `pnpm run check:boundaries`, `pnpm run build`
- **Engine audit:** Read every use-case file, verified formulas against legal sources, traced data flow
- **Benchmark execution:** Worked cases computed against engine logic and existing test assertions
- **Edge-case verification:** Zero, negative, boundary, cap, and extreme values tested per engine
- **UI audit:** Page structure, inputs, validation, error handling, result rendering, methodology blocks
- **Accessibility:** role="alert", aria-live, focus handling, keyboard completion, semantic structure
- **Trust:** Source citations, methodology notes, disclaimers, "what this doesn't cover" sections
- **Maintainability:** Code duplication, shared modules, test coverage, source-of-truth drift

### Limitations
- **No browser rendering verification** — responsive behavior assessed from code, not visual testing
- **No Lighthouse runs** — performance assessed qualitatively from architecture (static build, client-only calculations)
- **No assistive technology verification** — accessibility assessed from markup and ARIA attributes
- **Production verification not performed** — all findings are local-only verified

---

## 2. Authoritative portfolio inventory

### Route files (16 calculators + 1 index)
| # | Slug | Route | In registry | In index | Tier |
|---|------|-------|-------------|----------|------|
| 1 | sueldo-liquido | `/calculadoras/sueldo-liquido/` | ✅ | ✅ | A |
| 2 | boleta-honorarios-liquido | `/calculadoras/boleta-honorarios-liquido/` | ✅ | ✅ | A |
| 3 | impuesto-segunda-categoria | `/calculadoras/impuesto-segunda-categoria/` | ✅ | ✅ | A |
| 4 | operacion-renta | `/calculadoras/operacion-renta/` | ✅ | ✅ | A |
| 5 | finiquito-indemnizacion | `/calculadoras/finiquito-indemnizacion/` | ✅ | ✅ | A |
| 6 | seguro-cesantia | `/calculadoras/seguro-cesantia/` | ✅ | ✅ | A |
| 7 | apv | `/calculadoras/apv/` | ✅ | ✅ | A |
| 8 | simulador-jubilacion | `/calculadoras/simulador-jubilacion/` | ✅ | ✅ | A |
| 9 | credito-consumo | `/calculadoras/credito-consumo/` | ✅ | ✅ | B |
| 10 | tarjeta-credito | `/calculadoras/tarjeta-credito/` | ✅ | ✅ | B |
| 11 | prepago-credito | `/calculadoras/prepago-credito/` | ✅ | ✅ | B |
| 12 | **dividendo-hipotecario** | `/calculadoras/dividendo-hipotecario/` | **❌ MISSING** | **❌** | B |
| 13 | reajuste-arriendo | `/calculadoras/reajuste-arriendo/` | ✅ | ✅ | B |
| 14 | simulador-renegociacion | `/calculadoras/simulador-renegociacion/` | ✅ | ✅ | B |
| 15 | conversor-uf | `/calculadoras/conversor-uf/` | ✅ | ✅ | C |
| 16 | comisiones-afp | `/calculadoras/comisiones-afp/` | ✅ | ✅ | C |

**Registry count:** 15 entries in `CALCULATOR_PORTFOLIO` (portfolio says "15 calculadoras" but 16 exist).

---

## 3. Baseline contradictions found

| Baseline claim | Audit finding | Status |
|---------------|---------------|--------|
| `astro check` passes | Confirmed: 0 errors, 0 warnings, 0 hints | ✅ Matches |
| Boundary checks pass | Confirmed: 4 domain files scanned, passed | ✅ Matches |
| One known failing test in `EstimateFiniquito.test.ts` | Confirmed: `expects 3000000, got 2000000` at line 60 | ✅ Matches |
| `dividendo-hipotecario` missing from portfolio | Confirmed: route exists, not in registry | ✅ Matches |
| Build passes | Confirmed: complete with all post-build checks OK | ✅ Matches |
| Older APV/finiquito audit artifacts | Found: `auditoria-calculadora-apv.md` (MON-216) and `auditoria-calculadora-finiquito.md` (MON-215), both dated 2026-04-08 | ✅ Stale — superseded by this audit |

**New contradiction found:** The boleta-honorarios MethodologyBlock text says "13,75%" but the engine uses 15.25%. This was not in the provided baseline.

---

## 4. Systemic findings

### SF-01: No `aria-live` on any calculator result region (P2)
All 16 calculators replace result content dynamically via `replaceChildren()` but none has `aria-live="polite"` on the result container. Screen readers do not announce calculation results. All calculators DO correctly use `role="alert"` for error messages.

**Ticket:** MON-501

### SF-02: AFP commission rates hardcoded in 3+ locations (P2)
AFP rates appear as independent literals in `sueldo-liquido.astro`, `apv.astro`, and `comisiones-afp.astro`. No shared constant file. When SP publishes new rates, all must be updated manually.

**Ticket:** MON-511

### SF-03: Six Tier B calculators lack owner articles (P3)
`credito-consumo`, `tarjeta-credito`, `prepago-credito`, `dividendo-hipotecario`, `reajuste-arriendo`, `simulador-renegociacion` have no dedicated editorial article providing context or entry flow.

**Ticket:** MON-510

### SF-04: Consistent architectural strengths
- All calculators have `CalculatorJsonLd` schema
- All calculators have `ShareCalculatorResult` component
- All calculators have `MethodologyBlock` with sources
- All calculators have `Breadcrumb`
- Economic parameters injected at build with live/fallback labeling
- Shared `creditAmortization.ts` module reused across 4 calculators
- Engine/UI separation is clean for all calculators except `comisiones-afp`

---

## 5. Top risks by severity

### P1 — Major (3 findings)

| ID | Calculator | Type | Description |
|----|-----------|------|-------------|
| MON-507 | finiquito-indemnizacion | logic-defect | `> 6` should be `>= 6` in resolveServiceYears — wrong money outcome |
| MON-503 | boleta-honorarios-liquido | trust-transparency | MethodologyBlock says "13,75%" but engine uses 15.25% |
| MON-509 | dividendo-hipotecario | content-integration | Calculator exists but missing from portfolio registry — undiscoverable |

### P2 — Moderate (5 findings)

| ID | Calculator | Type | Description |
|----|-----------|------|-------------|
| MON-501 | systemic | a11y | No aria-live on calculator result regions |
| MON-505 | impuesto-segunda-categoria | a11y | Uses alert() instead of inline error |
| MON-506 | impuesto-segunda-categoria | maintainability | Duplicated bracket deduction computation |
| MON-508 | simulador-jubilacion | rendering | CSS typo `focus:invoke-none` |
| MON-511 | systemic | maintainability | AFP rates hardcoded in 3+ locations |

### P3 — Polish (2 findings)

| ID | Calculator | Type | Description |
|----|-----------|------|-------------|
| MON-510 | systemic | content-integration | 6 Tier B calculators lack owner articles |
| MON-512 | simulador-renegociacion | maintainability | Duplicated annuity formula |

---

## 6. Tier-by-tier portfolio health summary

### Tier A (8 calculators) — YMYL / highest risk

| Calculator | Verdict | Weighted Score | Top Issue |
|-----------|---------|---------------|-----------|
| sueldo-liquido | **pass** | 26/28 | aria-live, AFP rates hardcoded |
| boleta-honorarios-liquido | **partial** | 21/28 | **Methodology rate mismatch (P1)** |
| impuesto-segunda-categoria | **pass** | 25/28 | alert() pattern, duplicated deductions |
| operacion-renta | **pass** | 27/28 | aria-live only |
| finiquito-indemnizacion | **partial** | 22/28 | **6-month rounding bug (P1)** |
| seguro-cesantia | **pass** | 27/28 | minimal issues |
| apv | **pass** | 27/28 | minimal issues |
| simulador-jubilacion | **pass** | 25/28 | CSS typo, aria-live |

**Tier A health: 6/8 pass, 2/8 partial, 0/8 fail**

### Tier B (6 calculators) — medium risk

| Calculator | Verdict | Score | Top Issue |
|-----------|---------|-------|-----------|
| credito-consumo | **pass** | 18/20 | No owner article |
| tarjeta-credito | **pass** | 19/20 | No owner article |
| prepago-credito | **pass** | 19/20 | No owner article |
| dividendo-hipotecario | **partial** | 18/20 | **Missing from registry (P1)** |
| reajuste-arriendo | **pass** | 19/20 | No owner article |
| simulador-renegociacion | **pass** | 18/20 | Duplicated annuity formula |

**Tier B health: 5/6 pass, 1/6 partial, 0/6 fail**

### Tier C (2 calculators) — reference tools

| Calculator | Verdict | Score | Top Issue |
|-----------|---------|-------|-----------|
| conversor-uf | **pass** | 19/20 | aria-live only |
| comisiones-afp | **pass** | 18/20 | Inline calc, hardcoded rates |

**Tier C health: 2/2 pass**

---

## 7. Cross-calculator patterns

### Positive patterns
1. **Clean engine/UI separation** — 15 of 16 calculators have dedicated engine files with pure functions
2. **Consistent component architecture** — CalculatorJsonLd, MethodologyBlock, PrimaryCTA, ShareCalculatorResult, Breadcrumb used uniformly
3. **Economic parameter injection** — live/fallback pattern with source labeling across all calculators needing UF/UTM
4. **Shared amortization module** — `creditAmortization.ts` reused by 4 credit calculators
5. **Comprehensive test suites** — 217/218 tests pass; every engine has dedicated test file
6. **Input validation** — every engine has `assertInput()` guarding all public functions

### Negative patterns
1. **No aria-live anywhere** — consistent omission suggests template-level fix needed
2. **AFP rates scattered** — same data in 3+ files without shared constant
3. **No owner articles for Tier B** — editorial coverage stops at Tier A

---

## 8. Trust/transparency risks

| Risk | Severity | Impact |
|------|----------|--------|
| Methodology text contradicts engine (boleta-honorarios 13.75% vs 15.25%) | **P1** | User reads wrong rate in the "how it works" section |
| AFP rates may go stale across 3 files | P2 | Incorrect commission comparison until manually synced |
| Solidarity Fund reference expires 2027-02 | P3 | After that date, the AFC table link may go stale |
| Employer contribution schedule needs periodic refresh | P3 | Retirement projections use a manually maintained schedule |

All other calculators have accurate, well-sourced methodology blocks with appropriate disclaimers.

---

## 9. Accessibility risk summary

### Confirmed defects
- No `aria-live` on result regions (all 16 calculators) — WCAG 4.1.3
- `alert()` instead of inline error (impuesto-segunda-categoria) — inconsistent pattern
- CSS typo affecting focus styling (simulador-jubilacion)

### Probable risks
- Radio inputs with `sr-only` + styled spans — keyboard focus visible via `peer-checked` but native focus ring may be insufficient on some browsers

### Unverified
- Full keyboard-only completion of all paths (assessed from code, not tested)
- Screen reader behavior of dynamic result replacement
- Touch target adequacy on mobile (assessed from Tailwind classes, not measured)

---

## 10. Maintainability/regression risk summary

| Risk area | Severity | Description |
|-----------|----------|-------------|
| AFP rates in 3+ files | P2 | Manual sync required when SP updates |
| Tax bracket deductions duplicated | P2 | TaxEngine + astro page frontmatter |
| Annuity formula duplicated | P3 | SimulateDebtRenegotiation has local copy |
| comisiones-afp has no engine file | P3 | Inline script, lower testability |
| Known failing test (finiquito) | **P1** | Test suite reports 1 failure — test is correct, code is wrong |

**Regression risk concentration:** The TaxEngine is a critical shared dependency used by 4 Tier A calculators (sueldo-liquido, impuesto-segunda-categoria, operacion-renta, apv). Any change to bracket logic propagates to all four. This is well-tested (10+ dedicated tests + continuity assertions).

---

## 11. Remediation matrix

Ordered by user harm × traffic intent, then fix effort.

| Priority | Ticket | Severity | Calculator | Fix effort | Description |
|----------|--------|----------|-----------|------------|-------------|
| 1 | MON-507 | P1 | finiquito | **trivial** (1 char) | Fix `> 6` → `>= 6` — wrong money output |
| 2 | MON-503 | P1 | boleta-honorarios | **trivial** (text edit) | Fix methodology rate 13.75% → 15.25% |
| 3 | MON-509 | P1 | dividendo-hipotecario | **small** (~30 lines) | Add to portfolio registry |
| 4 | MON-501 | P2 | systemic | **small** (16 files × 1 attr) | Add aria-live to result containers |
| 5 | MON-508 | P2 | simulador-jubilacion | **trivial** (1 class) | Fix CSS typo |
| 6 | MON-505 | P2 | impuesto-segunda-cat. | **small** (add error div) | Replace alert() with inline error |
| 7 | MON-511 | P2 | systemic | **medium** (new file + 3 imports) | Centralize AFP rates |
| 8 | MON-506 | P2 | impuesto-segunda-cat. | **small** (export + import) | Deduplicate bracket computation |
| 9 | MON-512 | P3 | simulador-renegociacion | **trivial** (import swap) | Deduplicate annuity formula |
| 10 | MON-510 | P3 | systemic | **large** (editorial) | Create owner articles for 6 calculators |

---

## 12. Top 10 recommended priorities

1. **MON-507** — Fix finiquito 6-month rounding bug (P1, trivial, fixes known failing test)
2. **MON-503** — Fix boleta-honorarios methodology rate text (P1, trivial)
3. **MON-509** — Add dividendo-hipotecario to portfolio registry (P1, small)
4. **MON-501** — Add aria-live to all calculator result regions (P2, systemic)
5. **MON-508** — Fix CSS typo in simulador-jubilacion (P2, trivial)
6. **MON-505** — Replace alert() with inline error in impuesto-segunda-categoría (P2)
7. **MON-511** — Centralize AFP commission rates (P2, prevents drift)
8. **MON-506** — Deduplicate tax bracket deduction computation (P2)
9. **MON-512** — Deduplicate annuity formula in renegociación (P3, trivial)
10. **MON-510** — Plan owner articles for Tier B calculators (P3, editorial effort)

---

## 13. Recommended execution sequence

Sprint 1 completed 2026-04-10

### Sprint 1 — Immediate (P1 blockers + trivial P2 fixes)
- [x] MON-507: Fix `>= 6` in EstimateFiniquito.ts (1 character change, test passes)
- [x] MON-503: Update methodology text in boleta-honorarios (text edit)
- [x] MON-508: Fix CSS typo in simulador-jubilacion (class name fix)
- [x] MON-509: Add dividendo-hipotecario to calculatorPortfolio.ts

**Expected outcome:** 0 failing tests, all P1 findings resolved, portfolio complete.

### Sprint 2 — Accessibility + maintainability (P2 systemic)
- [x] MON-501: Add aria-live="polite" to all 16 result containers
- [x] MON-505: Replace alert() with inline error in impuesto-segunda-categoria
- [x] MON-511: Create shared AFP rates constant file
- [x] MON-506: Export bracket deductions from TaxEngine, import in astro page

Sprint 2 completed 2026-04-10

### Sprint 3 — Polish + editorial (P3)
- [x] MON-512: Import shared annuity in SimulateDebtRenegotiation
- [x] MON-510: Prioritize and create owner articles for Tier B calculators

Sprint 3 completed 2026-04-10

---

## Executive summary

**Portfolio health at audit close: strong with 3 actionable P1 issues.**
**Remediation status (2026-04-10): all 10 findings resolved across 3 sprints.**

### Audit findings (baseline)
- **13/16 calculators pass** the full audit
- **3/16 were partial** (finiquito: logic bug; boleta-honorarios: methodology mismatch; dividendo-hipotecario: undiscoverable)
- **0/16 fail**

### Post-remediation state
- **16/16 calculators pass** — all partial verdicts resolved
- All 218 tests pass (0 failures; finiquito rounding bug fixed; portfolio count assertion updated)
- aria-live added to all 16 result containers (WCAG 4.1.3)
- AFP commission rates centralized in `src/config/afpCommissions.ts`
- 6 Tier B owner articles created with bidirectional calculator links
- No open findings remain from this audit cycle

### Architecture assessment (unchanged)
- The architecture is solid: clean engine/UI separation, comprehensive tests, consistent component patterns, proper source attribution
- No accuracy defects were found in any engine's core math beyond the finiquito boundary condition (now fixed)

Audit remediation completed 2026-04-10 — all 10 findings resolved.
