# Plan 124: Remediación de la auditoría IA del plan 115 (veredicto CONDITIONAL)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Update the status row for this plan in `plans/README.md`.

## Status

- **Priority**: P1 (bloquea publicación YMYL; D1–D4 obligatorios)
- **Effort**: M–L
- **Risk**: MED-ALTO (cambia tablas y montos; fuentes primarias citadas)
- **Depends on**: auditoría `docs/editorial/audits/plan-115-correctitud/` (CONDITIONAL)
- **Category**: correctitud YMYL / auditoría IA
- **Planned at**: commit `3e5e8428`, 2026-09-29
- **Status**: DONE (remediado) — D1–D8 corregidos con tests y artefactos de
  auditoría commiteados (defectos marcados `resolved`). Pendiente: **re-auditoría
  en sesión fresca** (actualiza el veredicto en `02-result.json`) y firma humana.
- **Evidence**: `03-report.md` + `evidence/08-sources.md` del piloto

## Defectos y fixes (D1–D8)

| ID | Sev | Fix |
|---|---|---|
| D1 | media | `buildSecondCategoryTaxBrackets`: tramo 35% hasta **310** UTM/UTA y 40% sobre ese tope (rebaja **38,82** UTM/UTA); tabla renderizada y tests actualizados. Fuente SII S-A/S-B/S-C |
| D2 | media | `AT2026.ufDecember` = **39.727,96** (UF 31-12-2025, art. 42 bis); fixtures y comentario; tope APV 600 UF queda $23.836.776 |
| D3 | media | SuperIR: elegibilidad por **≥2 obligaciones calificadas** (no acreedores distintos); `creditor` se mantiene como dato, sin dedup. Copy y tests |
| D4 | baja | Umbral **estricto**: `qualifiedDebtUf > 80` (exactamente 80 UF no califica) |
| D5 | baja | Cita correcta: art. 59 **inciso 2° N°1 letras a) y g)** (no N°4) en DAP |
| D6 | baja | Cita correcta: **Ley 18.010 art. 10** para prepago (no Ley 21.236) |
| D7 | baja | `00-scope.json` S6: idNorma **1225354** (Ley 21.830) |
| D8 | baja | `calculateApvWithdrawalRate` ejecutable (ΔIGC/retiro reajustado × 1,1 + 3 pp) + copy corregido (tasa media, no marginal) |

## Scope

- `src/domain/taxation/TaxEngine.ts`, `TaxYearParameters.ts`.
- `src/application/use-cases/SimulateDebtRenegotiation.ts`.
- `src/pages/calculadoras/{impuesto-segunda-categoria,simulador-renegociacion,deposito-a-plazo,apv,dividendo-hipotecario}.astro`.
- `src/application/use-cases/CalculateTermDeposit.ts` (JSDoc).
- Tests afectados + nuevos vectores.
- `docs/editorial/audits/plan-115-correctitud/{00-scope.json,02-result.json}` (defectos → resolved) y commit de `03-report.md` + `evidence/`.
- `docs/TECH_DEBT_BACKLOG.md` si emerge deuda, `plans/README.md`.

**Out of scope**: re-auditoría (sesión fresca) y firma humana; fuzzing completo
de las 22 calculadoras (limitación declarada del informe).

## Done criteria

- [ ] D1–D8 corregidos con tests (incluye caso mismo acreedor/dos
      obligaciones y 80 UF exactas).
- [ ] `02-result.json` con defectos en `resolved`; artefactos del piloto
      commiteados.
- [ ] `pnpm run test`, `pnpm run build`, `pnpm run check:ci` en verde.
- [ ] Re-auditoría en sesión fresca + firma humana registradas como pendientes.

## STOP conditions

- Un valor oficial no coincide con la fuente SII → detener y reportar.
- Cambios de tabla rompen vectores dorados sin explicación legal → detener.

## Rollback

Revert por paso; los montos vuelven al comportamiento auditado (CONDITIONAL).
