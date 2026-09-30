# Plan 132 — Remediación pass6 (D25: interpolación cruda en llms-full.txt)

- **Status**: IN PROGRESS
- **Fecha**: 2026-09-29
- **Owner**: Carlos Ortega (revisión editorial) / agente (implementación)
- **Scope in**: `src/utils/economicInterpolation.ts` (nuevo),
  `src/remark-economic-variables.ts`, `src/pages/llms-full.txt.ts`,
  `scripts/check-postbuild.mjs`, `tests/unit/economicInterpolation.test.ts`
  (nuevo), `tests/unit/remarkEconomicVariables.test.ts` (sin cambios, regresión),
  `tests/scripts/check-postbuild.test.ts`, `plans/README.md`.
- **Scope out**: artefacto de auditoría (lo actualiza el auditor en pass7);
  WIP de otras sesiones.

## Defecto pass6 (abierto)

| ID | Sev | Fix |
|----|-----|-----|
| D25 | baja | `dist/llms-full.txt` publicaba 7 líneas con `[[...]]` sin interpolar: `src/pages/llms-full.txt.ts` concatena `post.body` crudo sin pasar por el plugin remark. Se extrae la interpolación a `src/utils/economicInterpolation.ts` (compartida con el plugin) y se aplica en la ruta; check postbuild nuevo `llms-full-no-raw-interpolation` (24 checks). |

D23–D24 verificados resueltos en pass6 (evidencia 57/58).

## Criterios de cierre

- [ ] D25 corregido: `llms-full.txt` del build sin `[[`; plugin remark sin
      regresión (tests existentes verdes); check postbuild en verde.
- [ ] `check:ci`, build, suite verdes.
- [ ] Verificación final = re-auditoría pass7 (sesión independiente).
