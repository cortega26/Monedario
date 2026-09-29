# Plan 130 — Remediación pass4 (D17–D21) del plan 115

- **Status**: IN PROGRESS
- **Fecha**: 2026-09-29
- **Owner**: Carlos Ortega (revisión editorial) / agente (implementación)
- **Scope in**: `src/data/blog/fondo-emergencia-chile.md`,
  `src/data/blog/operacion-renta-centro.md`,
  `src/data/blog/impuesto-global-complementario-chile.md`,
  `src/data/glossary/impuesto-unico.md`,
  `src/pages/calculadoras/boleta-honorarios-liquido.astro`,
  `src/domain/economic/EffectiveDatedParameters.ts`,
  `tests/domain/EffectiveDatedParameters.test.ts`,
  `tests/static-analysis/dap-no-retention-surfaces.test.ts`,
  `tests/static-analysis/at-taxonomy-consistency.test.ts` (nuevo),
  `plans/README.md`.
- **Scope out**: `02-result.json`/`03-report.md`/evidencia (los escribe el
  auditor en sesión independiente); WIP de otras sesiones.

## Defectos pass4 (abiertos)

| ID | Sev | Fix |
|----|-----|-----|
| D17 | media | FAQ de fondo de emergencia: intereses DAP son IGC para residentes (sin retención del banco); el 4% del art. 59 es solo no residentes. Guarda DAP extendida a contenido relacionado. |
| D18 | media | `operacion-renta-centro.md`: 5 pasajes «año tributario 2025» → AT2026 (rentas de 2025); UTA del umbral = dic-2025. `impuesto-global-complementario-chile.md`: UTA = 12 × UTM de diciembre del **año comercial**. |
| D19 | baja | `isPeriodId` valida mes `01–12`; test actualizado (hoy afirma `2025-13` = true). |
| D20 | baja | `boleta-honorarios-liquido.astro`: 15,25% = año comercial 2026 (boletas 2026 ⇒ AT2027), no «año tributario 2026». |
| D21 | baja | Glosario `impuesto-unico.md`: tramos IUSC en UTM (tabla general art. 43 N°1) con interpolación `[[utm * X \| clp]]`, sin CLP hardcodeado desactualizado. |

## Guardas nuevas/extendidas

- `dap-no-retention-surfaces.test.ts`: además de las superficies DAP, barrido de
  contenido relacionado (`fondo-emergencia-chile.md`) sin retención a residentes.
- `at-taxonomy-consistency.test.ts`: superficies AT2026 sin «año tributario
  2025»; definición de UTA sobre año comercial; nota del 15,25% sin «año
  tributario 2026».

## Criterios de cierre

- [ ] D17–D21 corregidos con guardas de regresión.
- [ ] `check:ci`, build, suite y a11y verdes.
- [ ] Artefacto intacto: la verificación final es la re-auditoría pass5
      (sesión independiente) + firma humana.
