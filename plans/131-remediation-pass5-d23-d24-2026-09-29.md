# Plan 131 — Remediación pass5 (D23–D24) del plan 115

- **Status**: IN PROGRESS
- **Fecha**: 2026-09-29
- **Owner**: Carlos Ortega (revisión editorial) / agente (implementación)
- **Scope in**: `src/pages/guias/ahorro-e-inversion/index.astro`,
  `src/data/glossary/sueldo-bruto.md`,
  `tests/static-analysis/dap-no-retention-surfaces.test.ts`,
  `tests/static-analysis/at-taxonomy-consistency.test.ts`, `plans/README.md`.
- **Scope out**: artefacto de auditoría (lo actualiza el auditor en pass6);
  WIP de otras sesiones.

## Defectos pass5 (abiertos, nuevos)

| ID | Sev | Fix |
|----|-----|-----|
| D23 | baja | Guía de ahorro describe la calculadora DAP como «interés bruto, retención e interés neto»; la calculadora no produce retención (residentes). Descripción alineada con el output real: interés bruto + monto neto al vencimiento. Guarda DAP extendida a `src/pages/guias/**` y `src/pages/calculadoras/**`. |
| D24 | baja | Glosario `sueldo-bruto.md`: umbral IUSC «~$943.000» sin mes → 13,5 UTM con interpolación `[[utm * 13.5 \| clp]]` + `reviewedDate`. Guarda: glosario sin CLP aproximado hardcodeado para tramos. |

D17–D21 verificados resueltos en pass5 (evidencia 46–50); D16 sin regresión
(evidencia 52/53).

## Criterios de cierre

- [ ] D23–D24 corregidos con guardas extendidas.
- [ ] `check:ci`, build, suite y a11y verdes.
- [ ] Verificación final = re-auditoría pass6 (sesión independiente).
