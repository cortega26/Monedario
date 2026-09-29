# Plan 125: Remediación de la re-auditoría IA (D9–D12 + observaciones)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Update the status row for this plan in `plans/README.md`.

## Status

- **Priority**: P1 (D12 media bloquea el PASS) + residuales
- **Effort**: M
- **Risk**: MED (toca UI, evidencia y dataset; el artículo es YMYL editorial)
- **Depends on**: re-auditoría `reaudit-plan115-2026-09-29` (CONDITIONAL)
- **Category**: correctitud YMYL / higiene de artefactos / datos
- **Planned at**: commit `8b73793f`, 2026-09-29
- **Status**: DONE (remediado) — D9–D12 corregidos (resaltado con regresión
  Playwright, mensaje/JSDoc SuperIR, evidencia versionada `audit-1/`, scope
  V3/V5), artículo de SuperIR corregido con art. 260 (revisión editorial humana
  pendiente), serie UF refrescada (2026-10-09) + assertion de rezago con tests.
  Pendiente: re-auditoría final en sesión fresca + firma humana.

## Defectos y fixes

| ID | Sev | Fix |
|---|---|---|
| D12 | media | `impuesto-segunda-categoria.astro:423`: `BRACKET_UPPER_LIMITS_UTM` → `[…, 120, 310, Infinity]`; regression Playwright del resaltado (200 UTM → `tramo-6`; 320 → `tramo-7`) |
| D9 | baja | Mensaje de validación SuperIR (`:645`) sin "acreedores distintos"; JSDoc de `DebtItemInput.creditor` alineado (elegibilidad por obligaciones) |
| D10 | baja | Versionar la evidencia del primer audit: `evidence/audit-1/` para `recalc.audit.test.ts` + `vitest.audit.config.ts` (históricos, commit `d1b12374`), README de evidencia con la distinción |
| D11 | baja | `00-scope.json` V3 → "art. 59 inciso 2° N°1 letras a) y g)"; V5 → "≥2 obligaciones vencidas (no acreedores distintos)" |
| Obs-1 | editorial | `src/data/blog/renegociacion-superir.md:202`: corregir el claim con art. 260; `updatedDate` al día. Revisión editorial humana pendiente (YMYL) |
| Obs-2 | datos | Refrescar `uf-historico.json` (`--solo=uf`) + assertion de rezago UF (≤14 días vs snapshot) en `check:economic-snapshot-freshness` con tests |

## Scope

- `src/pages/calculadoras/impuesto-segunda-categoria.astro`, `simulador-renegociacion.astro`.
- `src/application/use-cases/SimulateDebtRenegotiation.ts` (JSDoc).
- `tests/accessibility/calculator-iusc-highlight.test.ts` (nuevo).
- `docs/editorial/audits/plan-115-correctitud/` (evidencia versionada, scope, result).
- `src/data/blog/renegociacion-superir.md`.
- `src/data/economic-history/uf-*.json` + `scripts/check-economic-snapshot-freshness.mjs` + tests.
- `plans/README.md`.

**Out of scope**: nueva re-auditoría (sesión fresca) y firma humana.

## Done criteria

- [ ] D9–D12 corregidos con regresión (resaltado) y evidencia versionada.
- [ ] Artículo corregido con fuente y `updatedDate`; compliance humano pendiente.
- [ ] UF al día + assertion de rezago con tests.
- [ ] `02-result.json` con D9–D12 `resolved`; gates en verde.

## Rollback

Revert por paso; el dataset UF se regenera desde la fuente.
