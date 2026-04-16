# Working Todo — SEO Redirect Fix (2026-04-16)

## Phase 0 — Analysis (complete)
- [x] Parse Ahrefs CSV and identify redirect categories
- [x] Live-check all redirecting external URLs via HTTP (`node fetch`)
- [x] Follow redirect chains to final destinations
- [x] Build verified URL map (see spec.md)
- [x] Write spec.md with goals, URL map, and verification plan
- [x] Write e2e tests under `tests/e2e/redirect-links/`

## Phase 1 — Internal Redirect
- [x] `src/components/HeroHomepage.astro`: `"/cambios"` → `"/cambios/"`

## Phase 2 — About Page (about.astro)
- [x] `href="https://www.bcn.cl/leychile"` → `https://www.bcn.cl/leychile/`
- [x] `href="https://www.cmfchile.cl"` (line 290) → CMF portal URL
- [x] `href="https://www.cmfchile.cl"` (line 475) → CMF portal URL
- [x] `href="https://www.dt.gob.cl"` → DT portal URL
- [x] `href="https://www.suseso.cl"` → SUSESO .gob.cl URL

## Phase 3 — Calculator Pages
- [x] `simulador-renegociacion.astro` (×2): bare CMF → portal
- [x] `credito-consumo.astro`: bare CMF → portal
- [x] `tarjeta-credito.astro` (×2): bare CMF → portal
- [x] `prepago-credito.astro`: bare CMF → portal
- [x] `seguro-cesantia.astro`: bare DT → portal

## Phase 4 — Guide Pages
- [x] `licencia-medica-wizard.astro` (×4): suseso.cl path → suseso.gob.cl

## Phase 5 — Laws Data Files
- [x] `ley-20555-sernac-financiero.md`: SERNAC old → portal URL
- [x] `proyecto-reforma-previsional-2025.md`: leyfacil → leychile (×2) + spensiones old → homepage

## Phase 6 — Blog Posts (15 files)
- [x] `licencia-medica-desde-que-dia-pagan.md`: suseso.cl → suseso.gob.cl
- [x] `cuanto-descuenta-la-afp-de-tu-sueldo.md`: spensiones article-17026 → homepage
- [x] `como-leer-cartola-afp-chile.md`: spensiones article-17026 → homepage
- [x] `reforma-previsional-2025-que-cambia-y-como-te-afecta.md`: leyfacil → leychile
- [x] `fondos-mutuos-comisiones-rescate-impuestos.md`: CMF educa 600 → 621
- [x] `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md` (×2): CMF educa + mascerca
- [x] `como-invertir-en-etfs-desde-chile.md`: CMF mascerca → portal
- [x] `utm-chile-que-es-como-funciona.md`: INE old path → new
- [x] `que-es-el-ipc-chile-como-se-calcula.md` (×2): INE old path → new
- [x] `prepago-credito-cuando-conviene-chile.md`: CMF educa no-slash → slash
- [x] `fraude-tarjeta-que-hacer.md`: SERNAC no-slash → slash
- [x] `estafas-financieras-chile-vishing-smishing-marketplace.md`: csirt www → no-www
- [x] `como-hacer-presupuesto-mensual-chile.md`: cmfeduca bare → /educa/
- [x] `descuentos-de-sueldo.md`: dt.gob.cl bare → portal
- [x] `informe-deudas-cmf-vs-dicom.md` (×3): conocetudeuda bare → /informe-deudas/
- [x] `donde-ver-si-estoy-en-dicom-gratis.md` (×3): conocetudeuda bare → /informe-deudas/
- [x] `renegociacion-superir.md`: conocetudeuda bare → /informe-deudas/

## Phase 7 — Utils
- [x] `analytics.ts`: `"suseso.cl"` → `"suseso.gob.cl"`

## Phase 8 — Validation
- [x] Run e2e test suite: `pnpm test tests/e2e/redirect-links/` — 38/38 ✅
- [x] Run full test suite: `pnpm test` — 346/346 ✅

## Review Loop Tracking
- [ ] Iteration review #1 (after Phase 6): sub-agent gap check

## End-to-End Coverage Tasks
- [x] Add test: required workflow files exist (`spec.md`, `todo.md`).
- [x] Add test: `spec.md` contains required sections.
- [x] Add test: `spec.md` includes periodic review loop rule (~20 iterations).
- [x] Add test: `todo.md` contains granular task list checkboxes.
- [x] Add test: at least one TODO item remains open for active tracking.

## Validation Loop
- [x] Run full test suite via `pnpm test`.
- [x] Fix failing tests/artifacts until suite is green.
- [x] Update this file with completion evidence (last run + status).

## Review Loop Tracking
- [x] Iteration review #1: review `spec.md` and current implementation for gaps.
- [x] Iteration review #2: review `spec.md` and the next implementation batch for gaps.
- [ ] Iteration review #3: review `spec.md` and the next implementation batch for gaps.

## Evidence
- Last test run: `pnpm test` (2026-04-15)
- Result: `PASS` (48 files, 308 tests, 7 e2e tests)
- All requirements (V1–V7) verified: YES
