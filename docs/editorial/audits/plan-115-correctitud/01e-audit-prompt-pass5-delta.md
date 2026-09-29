# Prompt pass5 delta — plan 115 (verificación de D17–D21)

> Copia íntegra en una **sesión fresca** (sin historial de la remediación),
> de otra familia que el agente que corrigió. Rol: `MathAuditAgent`
> (adversarial), `AI_AUDIT_PROTOCOL` (incluye matriz de superficies, §5).

---

Role: MathAuditAgent (adversarial) — protocolo `AI_AUDIT_PROTOCOL`.

Contexto: la pasada 4 de la auditoría del plan 115 (correctitud, F01–F10,
D1–D22) devolvió `CONDITIONAL` con **D17–D21 abiertos**. La remediación se
aterrizó en `c1701ad5` (PR #599). Esta pasada es una **verificación delta**:
confirma o refuta cada fix sobre `c1701ad5`, busca regresiones, y actualiza el
artefacto. No confíes en las afirmaciones del remediador: re-deriva desde
fuente primaria.

Inputs (léelos completos):

- `docs/editorial/audits/plan-115-correctitud/02-result.json` y `03-report.md`
  (estado pass4, D17–D21 abiertos).
- `evidence/42-findings-pass4.txt` y `evidence/43-delta-head-pass4.txt`.
- `docs/editorial/AI_AUDIT_PROTOCOL.md` (reglas, semántica de `surface`, §5).
- Diff de la remediación: `git show --stat c1701ad5` y los archivos que toca.

Verifica cada defecto contra **fuente primaria + render construido**:

- **D17** — `src/data/blog/fondo-emergencia-chile.md` (FAQ): los intereses DAP
  de residentes no tienen retención del banco (van al IGC y se declaran en
  Operación Renta); el 4% del art. 59 inc. 2° N°1 a)/g) es Impuesto Adicional
  de **no residentes**. Barre todo `src/data/blog` y el `llms-full.txt` del
  build por el patrón residual (retención junto a DAP sin aclarar no
  residentes) y corre la guarda extendida
  `tests/static-analysis/dap-no-retention-surfaces.test.ts`.
- **D18** — `operacion-renta-centro.md`: cero «año tributario 2025»; las rentas
  de 2025 se declaran en el **AT2026** (campaña 2026); la UTA del umbral es la
  de diciembre de 2025. `impuesto-global-complementario-chile.md`: UTA = 12 ×
  UTM de diciembre del **año comercial**. Corre
  `tests/static-analysis/at-taxonomy-consistency.test.ts`.
- **D19** — `isPeriodId("2025-13")` y `isPeriodId("2025-00")` deben ser
  `false`; `resolveEffectiveValue` debe fallar cerrado con ellos; el test de
  `tests/domain/EffectiveDatedParameters.test.ts` ya no puede afirmar lo
  contrario.
- **D20** — `boleta-honorarios-liquido.astro`: el 15,25% se rotula por **año
  comercial 2026** (boletas 2026 ⇒ AT2027), no «año tributario 2026»; hint y
  fuente alineados; verifica el render en `dist/`.
- **D21** — glosario `impuesto-unico.md`: tramos IUSC en UTM consistentes con
  el motor (`TaxEngine.buildSecondCategoryTaxBrackets`: 13,5/30/50/70/90/120/
  310 UTM y 40% sobre 310) y con la tabla general del art. 43 N°1; la
  interpolación `[[utm * X | clp]]` debe renderizar la UTM vigente del
  snapshot (no CLP hardcodeado viejo); `reviewedDate` presente.

**Regresiones obligatorias** (worktree limpio de `c1701ad5`; no toques WIP
ajeno):

- `pnpm run test` (suite completa) y `pnpm run check:ci`.
- `SMALL_DETAILS_ENFORCE=1 pnpm run check:small-details` (D16 no puede volver).
- `pnpm run build` + `node scripts/check-postbuild.mjs dist` (23 checks).
- Guardas: `dap-no-retention-surfaces`, `at-taxonomy-consistency`,
  `honorarios-rate-year-consistency`, `audit-scope-consistency`.

Salida (actualiza, no reescribas historia):

- `02-result.json` — D17–D21 con `status` y evidencia verificada; `verdict`
  (`PASS` exige 0 defectos **de producto** abiertos; los de `audit-package`
  se listan y no bloquean); `humanSignoff: null`; nota de que PASS es
  pre-gate y no reemplaza la firma humana.
- `03-report.md` — sección «Pass5 delta»: método, verificación por defecto
  (comando + salida), regresiones, residuales nuevos si hay, veredicto y
  limitaciones.
- Evidencia numerada desde `44-` (no pises 01–43).

Reglas R1–R8 del protocolo vigentes: nada de aritmética de memoria (ejecuta
código), anclaje a fuente primaria con extracto, trazabilidad comando+salida,
adversarial en bordes, veredicto explícito, reproducibilidad (SHA + entorno),
y **no modifiques `src/`** — registra hallazgos, no arregles.
