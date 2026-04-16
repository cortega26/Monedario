# F22 Calculator Audit — `/calculadoras/operacion-renta/`
**Date:** 2026-04-12  
**Auditor:** Claude Sonnet 4.6 (automated audit program)  
**Authority:** `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` → `context/*.md`  
**Scope:** `/calculadoras/operacion-renta/` + adjacent trust surfaces that directly affect calculator correctness or user trust  
**Baseline:** 43 test files · 218 tests passing · economic snapshot dated 2026-04-11  
**Type:** Discovery-only. No code, content, config, or test mutations were made.

---

## 1. Findings table

| ID | Severity | Surface | Category | Evidence | User Risk | Source of Truth | Fix Direction | Verification |
|----|----------|---------|----------|----------|-----------|-----------------|---------------|--------------|
| **F-01** | **P1** | Page copy (lines 159, 296) | Source-of-truth / copy drift | Two UI strings say "12.25%"; SII 2026 rate is 15.25%. Other site content (glossary, blog, boleta calculator) all say 15.25%. Use-case engine is unaffected. | User reads help text, concludes their PPM is 12.25%, under-counts already-withheld PPM, and may believe they owe more (or receive less refund) than reality. Affects trust and decision quality on a high-traffic April page. | [SII Ley 21.133 schedule](https://www.sii.cl/noticias/2025/261225noti01smn.htm) | Update lines 159 and 296 in `operacion-renta.astro`: change both instances of `12.25%` to `15.25%`. Add a copy-formula guard test. | Grep for `12.25` in `operacion-renta.astro` returns 0 hits; site content consistent at `15.25%`. |
| **F-02** | **P2** | Page — hardcoded example state | UX / trust | IGC shown in example ($863,000) is ~3.2× higher than engine output for stated sueldo $18M (actual: $267,119 with UTM 69,889; $283,935 with UTM 67,294). Refund shown ($287,000) would actually be ~$883,000. Example is internally self-consistent (arithmetic checks out) but derived from unknown figures, not from the live engine. | User reads example before entering data and forms an expectation about their own tax that is significantly off. They may conclude the calculator is wrong when their real result is lower, or they may not notice because the example is labeled "(Ejemplo)". | Engine math verified in `artifacts/calculator-audits/operacion-renta-2026-04-12/scenario-math-verification.md` | Replace hardcoded example values with engine-computed values using snapshot parameters at build time, or generate example via the use case. | Example IGC matches `simulateOperacionRenta({ sueldosBrutos: 18_000_000, ... })` within rounding tolerance. |
| **F-03** | **P2** | `ShareCalculatorResult.astro` — copy button | UX / interaction bug | `window.showShareResult()` adds a new `click` listener to `#share-copy` on every invocation (line 51). After a second calculation, a single click fires the copy callback twice; after N calculations, N times. No cleanup or guard exists. | User who recalculates gets phantom clipboard writes and possibly multiple "¡Copiado!" flashes, eroding trust in the share feature. | Code: `src/components/ShareCalculatorResult.astro:51` | Replace `addEventListener` with a one-time setup (`{ once: true }` or clone-and-replace pattern); initialize the listener once outside `showShareResult`. | Manual test: calculate twice, click Copy once, callback fires exactly once. |
| **F-04** | **P2** | Page footer — "Fuente económica" label | Provider / trust labeling | Snapshot-sourced parameters (fresh, dated 2026-04-11) show as "fallback controlado" because `EconomicParameterProvider` sets `source: "fallback"` for both the snapshot path and the emergency hardcoded fallback. The domain type has no "snapshot" value. Users have no way to distinguish a fresh controlled snapshot from a stale emergency fallback. | Users may distrust the calculator if they notice "fallback" during April's peak season, or may not realize the data is stale when the true emergency fallback (UTM 67,294 / UF 39,300) activates. | `src/infrastructure/economic/EconomicParameterProvider.ts:154` (snapshot path sets `source: "fallback"`) | Either (a) add `"snapshot"` to `EconomicParameters.source` and expose it in the UI label, or (b) change the UI label logic to use `telemetryFlag` (already distinguishes `snapshot` vs `fallback`), or (c) label both as "datos de referencia" with the date doing the freshness work. | UI shows distinct labels for snapshot vs emergency fallback. |
| **F-05** | **P2** | Browser — pasted formatted numbers | UX / robustness | `val()` uses `parseFloat()` on the raw input `.value`. On `type="number"` inputs, browsers typically enforce numeric input on keyboard, but **clipboard paste may bypass this** on some browsers/OSes. `parseFloat("18.000.000")` returns `18` (stops at first dot), silently producing a calculation on $18 instead of $18,000,000. `type="number"` also doesn't visually warn users who paste formatted figures. | User who copies their salary from a payslip (common CLP format "18.000.000") and pastes into the field gets a result computed on $18, which passes validation (>0) and returns a "¡Cero impuesto!" result with no error. Invisible mistake. | Code: `operacion-renta.astro:408–409` (val function); browser paste behavior | Add input sanitization in `val()`: strip thousand-separator dots before `parseFloat`, or add a format hint that the expected format has no dots. All six income/retention/deduction inputs are affected. | `parseFloat("18.000.000".replace(/\./g, ""))` → 18000000. |
| **F-06** | **P3** | `tests/application/SimulateOperacionRenta.test.ts` | Test freshness | Test file constant `UTM = 67294` with comment "matches domain snapshot" was accurate when written (2026-04-08) but the snapshot was refreshed to `utm: 69889` on 2026-04-11. Divergence: +3.86%; bracket exempt threshold now off by ~420,000 CLP. Tests still pass (they use their own constant) but the comment is stale and any near-threshold assertion assumes the wrong UTM. | No user-facing risk; developer risk that a future refactor could be validated against wrong bracket positions. | `src/infrastructure/economic/economic-parameters.snapshot.json` | Update `UTM` constant in test to `69889` (or read from snapshot file directly) and remove or correct the stale comment. | Test constant matches `snapshot.utm`. |
| **F-07** | **P3** | `tests/application/FinancialUseCases.regression.test.ts` | Test gap | `SimulateOperacionRenta` has no pinned regression scenarios in the regression test file, unlike other use cases. No golden-output guard exists for the complete sueldo+honorarios+APV+intereses path. | No user-facing risk; developer risk that a bracket or cap change silently produces wrong outputs. | Pattern of existing regression tests in same file | Add at least two pinned regression cases to `FinancialUseCases.regression.test.ts`: one refund scenario (sueldo+PPM) and one mixed-income scenario (sueldo+honorarios+APV). | `SimulateOperacionRenta` block present in regression test file. |
| **F-08** | **P3** | Page HTML — `data-is-example` attribute | Data hygiene | `#resultado-contenido` has `data-is-example="true"` set in server-rendered HTML. The client `replaceChildren()` call replaces DOM content but never removes this attribute. Any analytics or CSS selector targeting `data-is-example` would continue matching after real calculation. | No user-visible risk. Analytics queries relying on this attribute would misclassify real results. | Code: `operacion-renta.astro:236, 643` | After `replaceChildren`, call `contenido.removeAttribute("data-is-example")`. | `document.getElementById("resultado-contenido").dataset.isExample` is undefined after calculation. |
| **F-09** | **P3** | `MethodologyBlock.astro` — source URLs | Trust surface | Both MethodologyBlock sources use generic `"https://www.sii.cl"` and `"https://www.sii.cl/sobre_el_sii/operacion_renta.html"` as citations. Neither links to the specific IGC table page, the Ley 21.133 honorarios schedule, or the DL 824 articles cited in the explanatory text. | A user who wants to verify the bracket table or the gastos presuntos formula has to navigate SII manually rather than follow a direct citation. Reduces verifiability/trust. | Audit spec source links | Replace generic SII homepage with specific sources: the honorarios PPM guidance page and the DL 824/IGC reference. Candidates: `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8398.htm` (PPM honorarios) and `https://www.sii.cl/noticias/2025/261225noti01smn.htm` (Ley 21.133 2026 rate). | Links in methodology block resolve to SII pages directly about honorarios retention and IGC. |

---

## 2. Confirmed passes

The following were verified and found correct. They should not be re-investigated in follow-up work without new evidence.

### Math and logic
- **IGC bracket formula:** `tax = base × rate − deduction` where deduction is derived recursively at each boundary to ensure continuity. All 7 bracket boundaries are continuous (gap < 1 peso). ✓
- **Gastos presuntos honorarios:** 30% of bruto, capped at 15 UTA (= $12,580,020 with snapshot). Cap threshold at honorarios ≥ 50 UTA = $41,933,400. Formula matches Art. 50 DL 824. ✓
- **APV Régimen B cap:** 600 UF = $23,920,896 with snapshot. Values above cap are silently clamped to cap; values below cap are applied exactly. ✓
- **Intereses hipotecarios cap:** 8 UTA = $6,709,344 with snapshot. Same clamping behavior. ✓
- **Credit ordering:** `saldoFinal = igcCalculado − impuestoUnicoRetenido − ppmHonorarios`. Both credits subtracted before sign determination. ✓
- **Refund/payment sign:** `esDevolución = saldoFinal < 0`. `montoDevolución = |saldo|` when negative; `montoPago = saldo` when positive. ✓
- **Zero-difference case:** `saldoFinal === 0` falls into payment branch (not refund), renders "Sin diferencia" with neutral styling and "$0". ✓
- **All-zero income guard:** Use-case `assertInput` throws; click handler pre-validates and shows `role="alert"` form error. ✓
- **Negative input guard:** `assertInput` rejects negative income. Negative retenciones/APV/intereses are clamped to 0 via `Math.max(0, ...)`. ✓
- **Decimal inputs:** `parseFloat` handles fractional pesos; `Math.round` in `fmt()` ensures peso-level display. ✓

### Architecture and contracts
- Dependency direction: domain → application → infrastructure → route. No violations. ✓
- `URL.PUBLIC.NO_POST_ID`: calculator route uses static slug, no `post.id` in URL construction. ✓
- Side-effect isolation: `TaxEngine.ts` and `EconomicParameters.ts` are pure. All IO in infrastructure. ✓

### Accessibility

- All 7 inputs have matching `<label for="...">` / `id="..."` pairs. ✓
- `#form-error` has `role="alert"` — announced immediately on error injection. ✓
- `#resultado-contenido` has `aria-live="polite"` — result announced after `replaceChildren`. ✓
- `<button id="calcBtn">` is keyboard-accessible (native button element, no `tabindex` needed). ✓
- `#skip-to-content` link in Header targets `#main-content` which matches `<main id="main-content">`. ✓
- Breadcrumb `<nav aria-label="Migas de pan">` provides landmark navigation. ✓
- `MethodologyBlock` uses native `<details>`/`<summary>` — correct implicit ARIA semantics for disclosure. ✓

### Provider resilience
- Live → snapshot fallback on network failure: verified by test. ✓
- Snapshot → hardcoded fallback on snapshot parse failure: code path present. ✓
- Memoization: single fetch per build, documented telemetry counters. ✓
- Economic parameters read from `data-uf`/`data-utm` attributes at runtime; failure throws with explicit error. ✓

### APV Régimen B explanation consistency

- `operacion-renta.astro` calls it "Solo Régimen B rebaja la base imponible del IGC. Tope: 600 UF." — consistent with `apv.astro` and the use case. ✓
- No contradiction between the APV calculator and the operacion-renta calculator on Régimen B semantics. ✓

### CalculatorJsonLd schema
- `@type: "WebApplication"`, `applicationCategory: "FinanceApplication"`, `offers.price: "0"` — standard pattern. ✓
- `url` uses `canonicalUrl` from `Astro.url.pathname` + `Astro.site` — no post.id. ✓

---

## 3. System baseline

| Item | Value |
|------|-------|
| Test files | 43 |
| Tests passing | 218 |
| Economic snapshot date | 2026-04-11 |
| UTM (snapshot) | 69,889 |
| UF (snapshot) | 39,868.16 |
| Default provider mode | snapshot |
| UI source label (snapshot) | "fallback controlado" |
| PPM rate in page copy | **12.25%** (wrong) |
| PPM rate per SII 2026 | **15.25%** (correct) |
| Bracket continuity | PASS (all 7 boundaries) |
| IGC formula | PASS |
| APV / intereses caps | PASS |
| Share button listener | accumulates on recalculation (F-03) |

---

## 4. Evidence artifacts

All located at `artifacts/calculator-audits/operacion-renta-2026-04-12/`:

- `system-map.md` — data flow diagrams, file inventory, dependency direction
- `scenario-math-verification.md` — bracket table, continuity proof, 7 scenario walkthroughs, example inconsistency, PPM rate table
- `test-gap-inventory.md` — what is covered vs missing, UTM drift analysis

---

## 5. Workstream results

### System map and baseline

Complete. See `artifacts/calculator-audits/operacion-renta-2026-04-12/system-map.md`. The flow from UI to `SimulateOperacionRenta` → `calculateSecondCategoryTax` → economic provider is documented. Baseline (43 files, 218 tests, snapshot 2026-04-11) confirmed.

### Front-end and rendering audit
Complete. UI uses static server-rendered inputs with client-side calculation. Result container replaces children on calculate. Example state is labeled but contains stale/inconsistent figures (F-02). No overflow or spacing issues identified from markup review. `type="number"` inputs with `min="0"` are consistently applied. Font preload is suppressed on `/calculadoras` to optimize performance.

### Accessibility and interaction audit
Complete. Heading order: H1 → H2 (form sections) → H2 (result) → H2 (explainer) → H3 (subsections). JS-injected H3s inside result cards continue the hierarchy. Form labels all matched. Skip link present. `aria-live="polite"` on result container. `role="alert"` on error container. One gap: no form element wrapping inputs (by design — avoids native form submission). Share copy button accumulates listeners (F-03). No other interaction issues.

### Math and logic audit
Complete. IGC bracket formula verified via independent arithmetic at all 8 brackets. All 7 boundaries are continuous. Honorarios gastos presuntos cap verified. APV 600 UF cap verified. Intereses 8 UTA cap verified. Credit subtraction order verified. Refund/payment/zero-difference sign logic verified. All happy-path and cap scenarios passed.

### Source-of-truth and trust audit
Complete. **Primary finding: F-01 (P1).** Page copy says `12.25%` PPM in two places; SII's 2026 rate is `15.25%` per Ley 21.133 (link: `https://www.sii.cl/noticias/2025/261225noti01smn.htm`). All other site content (3 blog posts, glossary, boleta calculator) already use 15.25%. The use-case engine does not hardcode this rate — it is copy-only. No APV regime contradictions found. Limitations section is accurate and complete (two-employer, dividends, primera categoría credit all disclosed).

### Provider and fallback audit
Complete. Three-tier fallback is operational: live → snapshot → hardcoded. The source label issue (F-04) is real but P2. Snapshot dated 2026-04-11 with UTM 69,889 / UF 39,868.16. Hardcoded fallback uses UTM 67,294 / UF 39,300 (labeled with today's date via `new Date()` which is incorrect for a stale value — minor secondary issue within F-04). Provider memoizes correctly.

### Test-gap audit
Complete. See `artifacts/calculator-audits/operacion-renta-2026-04-12/test-gap-inventory.md`. Coverage is solid at domain/application level but zero at route/UI level. No regression pins for SimulateOperacionRenta. UTM constant stale in test file. No copy-formula consistency tests.

---

## 6. Pre-seeded finding: PPM rate copy drift (F-01 detail)

Per audit spec, this finding was pre-seeded based on known state as of 2026-04-12:

**Confirmed at lines 159 and 296 of `src/pages/calculadoras/operacion-renta.astro`:**

```
line 159: Retención del 12.25% que hizo cada pagador de tus boletas.
line 296: el PPM de boletas de honorarios (12.25%) se descuentan directamente del IGC calculado.
```

**SII primary source:** [Noticias SII, diciembre 2025](https://www.sii.cl/noticias/2025/261225noti01smn.htm) — Ley 21.133 retención schedule for 2026: **15.25%**.

**Scope of impact:** Copy-only. `SimulateOperacionRenta` accepts `ppmHonorarios` as a user-provided figure, so the engine itself is not wrong. Users who read the help text as guidance (e.g., "I should enter 12.25% × my honorarios") will under-report their withheld PPM, making the calculator compute a higher payment obligation or lower refund than their actual situation.

**Classification: P1** — High-trust copy/formula mismatch. The help text explicitly says "Retención del 12.25%" next to the PPM input field, and the explainer text confirms it as a formula factor. A user relying on this to fill in the field rather than looking up their actual PPM total will get a directionally wrong result.

---

## 7. Severity key

| Level | Definition |
|-------|-----------|
| P0 | Incorrect tax outcome or regulatory misinformation (engine produces wrong number) |
| P1 | High-trust copy/formula mismatch or undisclosed unsupported scenario |
| P2 | UX/a11y/robustness issue with workaround available |
| P3 | Polish/maintainability/test hygiene |

---

## 8. Fix priority order

1. **F-01 (P1):** Update `12.25%` → `15.25%` in two lines of `operacion-renta.astro`. Add lint/test guard. Fast, low-risk, high-trust-impact.
2. **F-02 (P2):** Replace hardcoded example figures with engine-computed values at build time.
3. **F-05 (P2):** Add thousand-separator stripping in `val()` for CLP paste compatibility.
4. **F-03 (P2):** Fix copy button listener accumulation in `ShareCalculatorResult.astro`.
5. **F-04 (P2):** Clarify "fallback controlado" label to distinguish snapshot from emergency fallback.
6. **F-06–F-09 (P3):** Test hygiene, regression pins, data-is-example cleanup, methodology URLs.

---

## 9. Commands to run before merging any fix

```sh
pnpm run lint
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm run astro check
```

Route/RSS guards (`pnpm run check:routes`, `pnpm run check:rss`) only if a fix changes public URL behavior — F-01 through F-09 do not.
