# Plan 126: Barrido del paquete de auditoría plan 115 (D13 + residuales de scope)

> **Executor instructions**: Follow this plan step by step. Update the status
> row for this plan in `plans/README.md`.

## Status

- **Priority**: P3 (paquete de auditoría; sin efecto en producto)
- **Effort**: S
- **Risk**: LOW (solo artefactos de auditoría + un test)
- **Depends on**: re-auditoría `audit-plan115-2026-09-29` (Muse Spark, CONDITIONAL por D13)
- **Category**: higiene de artefactos / gobernanza de auditoría
- **Planned at**: commit `dd1e8f63`, 2026-09-29
- **Status**: DONE

## Contexto

La re-auditoría de Muse Spark verificó D1–D12 resueltos y dejó **D13** (baja):
`00-scope.json` V6 citaba la UF del 1-dic ($39.643,59) en vez de la del
31-dic ($39.727,96). El barrido de cierre encontró **dos residuales de la
misma clase que el informe no marcó como defecto**:

- **S2** (fuente del scope): "Art. 59 N°4 LIR" (derogado en D5, corregido en
  el copy pero no en el paquete).
- **V4**: "tasa marginal × 1,1" (el informe lo menciona como imprecisión de
  redacción, pero no lo abre como defecto; la ley y el motor usan tasa media
  ΔIGC/retiro).

## Cambios

- `00-scope.json`: V6 → UF 31-12-2025 $39.727,96; V4 → tasa media del retiro;
  S2 → art. 59 inciso 2° N°1 letras a) y g).
- `02-result.json`: D13 → `resolved`.
- **Guarda** `tests/scripts/audit-scope-consistency.test.ts`: valida que los
  claims del alcance citen los valores vigentes del motor (`AT2026.ufDecember`,
  UTA), que V4 diga "tasa media", y que V3/S2 no conserven "N°4"/citas
  derogadas. Evita la cadena D11→D13→… en próximas remediaciones.

## Evidencia

- `pnpm exec vitest run tests/scripts/audit-scope-consistency.test.ts` → 3/3.
- `pnpm run check:audit-artifacts` → OK.

## Observación de proceso (para decisión del mantenedor)

D10, D11 y D13 son defectos del **paquete de auditoría** (scope/evidencia), no
del producto. El protocolo actual exige `PASS` solo con 0 defectos abiertos,
sin distinguir superficie, lo que convierte typos del alcance en rondas
CONDITIONAL adicionales. Propuesta: campo `surface: "product" | "audit-package"`
en `defects[]`; `PASS` exige 0 abiertos de producto; los del paquete se
corrigen y se listan, sin bloquear la publicación.
