# Spec: SEO Redirect Fix — Pages with Links to 3xx URLs

**Date:** 2026-04-16  
**Source:** Ahrefs "Pages with links to redirect" report (CSV, 2026-04-15)

## Objective

Fix all outgoing links (internal and external) from monedario.cl that resolve via HTTP redirects (301/302) instead of pointing directly to their final URLs, eliminating the Ahrefs SEO signal and improving link-equity pass-through.

## Is This a Real SEO Issue?

**Yes — for most entries.** Linking to redirecting URLs:
- Passes link equity through an extra hop, potentially diluting PageRank
- Increases crawl budget waste for Googlebot
- Creates stale references that may degrade over time (e.g., government sites that move content)

**Exception (not fixable):** WhatsApp share URLs (`wa.me/?text=...`) always return 302 by design. Ahrefs flags them, but there is no actionable fix.

## Scope

### In Scope
- Fix every link in the monedario.cl source that resolves via a redirect (301/302) according to live HTTP checks done 2026-04-16
- Update internal link `/cambios` to `/cambios/` (trailing-slash normalization, Astro default)
- Update external links to their verified final URLs
- Update the `analytics.ts` trusted-domain set to reflect the `suseso.gob.cl` domain change

### Out of Scope
- WhatsApp `wa.me/?text=...` share links (302 by design)
- URLs that currently return 200 directly (e.g., `https://www.bcentral.cl/`, `https://www.afc.cl/...`, ChileAtiende ficha URLs — all 200 as of 2026-04-16)
- Redirects happening *to* monedario.cl (not our links)
- Link-building or adding new external references

## Verified Final URL Map (from live HTTP checks, 2026-04-16)

| Old (redirecting) URL | Final URL (verified 200) | Status |
|---|---|---|
| `/cambios` | `/cambios/` | Internal 301 |
| `https://www.bcn.cl/leychile` | `https://www.bcn.cl/leychile/` | 301 → HTTPS + slash |
| `https://www.cmfchile.cl` | `https://www.cmfchile.cl/portal/principal/613/w3-channel.html` | 301 |
| `https://www.dt.gob.cl` | `https://www.dt.gob.cl/portal/1626/w3-channel.html` | 302 → 301 |
| `https://www.suseso.cl` | `https://www.suseso.gob.cl/601/w3-channel.html` | 301 domain change |
| `https://www.csirt.gob.cl/` | `https://csirt.gob.cl/` | 301 www → no-www |
| `https://www.cmfeduca.cl/` | `https://www.cmfeduca.cl/educa/` | 301 |
| `https://conocetudeuda.cmfchile.cl/` | `https://conocetudeuda.cmfchile.cl/informe-deudas/` | 302 |
| `https://www.cmfchile.cl/educa` | `https://www.cmfchile.cl/educa/` | 301 trailing slash |
| `https://www.sernac.cl/app/consumidor` | `https://www.sernac.cl/app/consumidor/` | 301 trailing slash |
| `https://www.sernac.cl/proteccion-al-consumidor/consumidor-financiero` | `https://www.sernac.cl/portal/618/w3-propertyname-688.html` | 302 → moved |
| `https://www.spensiones.cl/portal/institucional/594/w3-article-17026.html` | `https://www.spensiones.cl` | 302 → page removed |
| `https://www.spensiones.cl/portal/institucional/594/w3-article-16969.html` | `https://www.spensiones.cl` | 302 → page removed |
| `https://www.bcn.cl/leyfacil/recurso/reforma-de-pensiones-de-2025` | `https://www.bcn.cl/leychile/navegar?idNorma=1212060` | 301 → BCN moved |
| `https://www.cmfchile.cl/educa/600/w3-propertyvalue-988.html` | `https://www.cmfchile.cl/educa/621/w3-propertyvalue-988.html` | 302 |
| `https://www.cmfchile.cl/mascerca/601/w3-article-1264.html` | `https://www.cmfchile.cl/portal/principal/613/w3-article-1264` | 302 |
| `https://www.ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion/indice-de-precios-al-consumidor` | `https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor` | 301 |
| `https://www.suseso.cl/608/w3-propertyvalue-22799.html` | `https://www.suseso.gob.cl/601/w3-channel.html` | 301+404 → use homepage |

## Files to Change (26 edits across 18 files)

### Components
- `src/components/HeroHomepage.astro`: `"/cambios"` → `"/cambios/"`

### Pages
- `src/pages/about.astro` (5 changes):
  - `https://www.bcn.cl/leychile` → `https://www.bcn.cl/leychile/`
  - `https://www.cmfchile.cl` (×2) → `https://www.cmfchile.cl/portal/principal/613/w3-channel.html`
  - `https://www.dt.gob.cl` → `https://www.dt.gob.cl/portal/1626/w3-channel.html`
  - `https://www.suseso.cl` → `https://www.suseso.gob.cl/601/w3-channel.html`
- `src/pages/calculadoras/simulador-renegociacion.astro` (×2): bare CMF → portal
- `src/pages/calculadoras/credito-consumo.astro`: bare CMF → portal
- `src/pages/calculadoras/tarjeta-credito.astro` (×2): bare CMF → portal
- `src/pages/calculadoras/prepago-credito.astro`: bare CMF → portal
- `src/pages/calculadoras/seguro-cesantia.astro`: bare DT → portal
- `src/pages/guias/empleo-ingresos/licencia-medica-wizard.astro` (×4): suseso.cl path → suseso.gob.cl homepage

### Data — Laws
- `src/data/laws/ley-20555-sernac-financiero.md`: SERNAC old → portal URL
- `src/data/laws/proyecto-reforma-previsional-2025.md` (×3): leyfacil + spensiones old → canonical

### Data — Blog
- `src/data/blog/licencia-medica-desde-que-dia-pagan.md`: suseso.cl → suseso.gob.cl
- `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md`: spensiones old → homepage
- `src/data/blog/como-leer-cartola-afp-chile.md`: spensiones old → homepage
- `src/data/blog/reforma-previsional-2025-que-cambia-y-como-te-afecta.md`: leyfacil → leychile
- `src/data/blog/fondos-mutuos-comisiones-rescate-impuestos.md`: CMF educa 600 → 621
- `src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md` (×2): CMF educa 600→621, mascerca→portal
- `src/data/blog/como-invertir-en-etfs-desde-chile.md`: CMF mascerca → portal
- `src/data/blog/utm-chile-que-es-como-funciona.md`: INE old path → new path
- `src/data/blog/que-es-el-ipc-chile-como-se-calcula.md` (×2): INE old path → new path
- `src/data/blog/prepago-credito-cuando-conviene-chile.md`: cmfeduca no-slash → slash
- `src/data/blog/fraude-tarjeta-que-hacer.md`: SERNAC no-slash → slash
- `src/data/blog/estafas-financieras-chile-vishing-smishing-marketplace.md`: csirt www → no-www
- `src/data/blog/como-hacer-presupuesto-mensual-chile.md`: cmfeduca bare → /educa/
- `src/data/blog/descuentos-de-sueldo.md`: dt.gob.cl bare → portal

### Utils
- `src/utils/analytics.ts`: `"suseso.cl"` → `"suseso.gob.cl"` (trusted-domain set)

## Verification Plan

| ID | Verification | Method |
|---|---|---|
| V1 | No instance of any old redirecting URL exists in src/ | `grep -r` in test |
| V2 | Internal `/cambios` link has trailing slash in HeroHomepage | grep test |
| V3 | `analytics.ts` contains `"suseso.gob.cl"` not `"suseso.cl"` | grep test |
| V4 | Each new URL returns HTTP 200 (live check, opt-in) | Node fetch in test |
| V5 | No wa.me links were modified (should be unchanged) | grep count test |
| V6 | Test suite (`pnpm test`) still passes after all edits | CI |

## Periodic Review Loop Rule
Every ~20 implementation iterations, invoke a sub-agent with: _"review spec.md and the current implementation for gaps"_ and incorporate feedback before continuing.

## Scope
In scope:
- Create `spec.md` with goals, implementation details, and verification.
- Create `todo.md` as a mutable checklist used while working.
- Create `tests/e2e` and add end-to-end tests that verify these artifacts.
- Run tests and iterate until they all pass.

Out of scope:
- Product feature implementation not requested in this task.
- Architectural refactors unrelated to workflow artifact setup.

## Goals
G1. `spec.md` exists and contains actionable implementation and verification details.
G2. `todo.md` exists and is structured into verifiable sub-tasks.
G3. End-to-end test coverage exists under `tests/e2e` and validates core workflow invariants.
G4. Tests can be executed with the existing test runner and pass.
G5. The workflow enforces continuous alignment via periodic spec-review loops.

## Implementation Plan

### Phase 1 - Authoring baseline artifacts
- Create `spec.md` with explicit objective, scope, goals, implementation plan, and a verification matrix.
- Create `todo.md` with sections for Artifact Setup, End-to-End Coverage Tasks, Validation Loop, Review Loop Tracking, and Evidence.

### Phase 2 - End-to-end validation setup
- Create `tests/e2e` directory.
- Add a Vitest end-to-end suite that verifies:
  - Required files exist.
  - `spec.md` contains mandatory sections.
  - `todo.md` contains verifiable checkbox tasks.
  - A periodic review requirement is documented in `spec.md`.

### Phase 3 - Validation loop
- Run `pnpm test`.
- If failing, fix tests or artifact content until all pass.
- Record pass status in `todo.md`.

## Ongoing Execution Rules
R1. Before any code/content change, read `spec.md` and validate that the change maps to one defined goal or plan step.
R2. Update `todo.md` immediately after completing each sub-task.
R3. Run the relevant tests after meaningful change sets.
R4. Approximately every 20 implementation iterations, run an independent review step: "review spec.md and the current implementation for gaps".

## Verification Matrix

| ID | Requirement | Proof Method | Pass Criteria |
| --- | --- | --- | --- |
| V1 | `spec.md` exists | E2E test file existence check | File exists at repository root |
| V2 | `spec.md` has complete structure | E2E content assertions on section headings | Required headings present |
| V3 | `todo.md` exists with checkboxes | E2E content assertions for Markdown task list syntax | At least one unchecked and one checked item pattern supported |
| V4 | `tests/e2e` exists with executable test suite | E2E test + Vitest discovery | Suite discovered and executed by `pnpm test` |
| V5 | Periodic review loop is documented | E2E assertion for review-loop rule text in `spec.md` | Rule is present and unambiguous |
| V6 | All tests pass | `pnpm test` exit code | Exit code 0 |
| V7 | Commands section documented | E2E assertion on spec heading | `## Commands` heading present |

## Commands
- Run all tests: `pnpm test`
- Run only e2e suite once created: `pnpm vitest run tests/e2e`

## Definition of Done
- `spec.md` and `todo.md` are created and aligned to goals.
- `tests/e2e` includes end-to-end tests that enforce the workflow invariants.
- `pnpm test` passes with the new suite included.
- `todo.md` is updated to reflect completed work and remaining items.
