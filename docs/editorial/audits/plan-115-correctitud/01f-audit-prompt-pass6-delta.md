# Prompt pass6 delta — plan 115 (D23–D24 + barrido de clase completo)

> Copia íntegra en una **sesión fresca**, de otra familia que el agente que
> remedió. Rol: `MathAuditAgent` (adversarial), `AI_AUDIT_PROTOCOL` (matriz de
> superficies, §5).

---

Role: MathAuditAgent (adversarial) — protocolo `AI_AUDIT_PROTOCOL`.

Contexto: la pasada 5 devolvió `CONDITIONAL` con **D23–D24 abiertos** (D16–D22
verificados resueltos). La remediación se aterrizó en `02b878a7` (PR #601).
Esta pasada es una **verificación delta + barrido de clase completo**: las
pasadas 4 y 5 encontraron residuales en superficies que los barridos previos
no cubrían (guías/hubs, glosario). No confíes en el remediador: re-deriva
desde fuente primaria.

Inputs: `02-result.json`, `03-report.md`, `evidence/54-surface-sweep-pass5.txt`
(§54.4/§54.5), `evidence/46-d17-verification.txt`, `AI_AUDIT_PROTOCOL.md`,
`git show --stat 02b878a7`.

**Parte 1 — verifica D23 y D24**

- **D23** — `src/pages/guias/ahorro-e-inversion/index.astro`: la ficha de la
  calculadora DAP no puede prometer retención; debe describir el output real
  (interés bruto + monto neto al vencimiento). Verifica el render en `dist/` y
  corre la guarda extendida `tests/static-analysis/dap-no-retention-surfaces.test.ts`.
- **D24** — `src/data/glossary/sueldo-bruto.md`: umbral IUSC en UTM (13,5)
  con equivalencia interpolada en párrafo (no en celda de tabla: el `|` rompe
  la interpolación), `reviewedDate` presente, render sin `[[utm` crudo.
  Corre `tests/static-analysis/at-taxonomy-consistency.test.ts`.

**Parte 2 — barrido de clase completo (obligatorio, una sola vez y exhaustivo)**

Clase A (D14/D17: retención DAP atribuida a residentes) — barre **todas** las
superficies, no solo blog: `src/data/blog/**`, `src/data/glossary/**`,
`src/pages/guias/**`, `src/pages/calculadoras/**`, `src/config/calculatorPortfolio.ts`,
`src/components/**`, y el `llms-full.txt` del build. Criterio: toda mención de
retención junto a DAP/depósito a plazo debe aclarar no residentes/Impuesto
Adicional (art. 59 inc. 2° N°1 a)/g)).

Clase B (D21/D24: umbrales de impuesto en CLP hardcodeado/desactualizado) —
barre `src/data/**` y `src/pages/**` por montos CLP de tramos IUSC/IGC/UTA sin
mes ni UTM de referencia. Criterio: los tramos deben expresarse en UTM/UTA con
equivalencia interpolada `[[...]]` o con mes explícito; ejemplos fechados
legítimos («en marzo de 2026 …») se aceptan como observación, no defecto.

Si el barrido encuentra residuales nuevos, son defectos (`surface: product`,
`status: open`) — no observaciones. Si no encuentra ninguno, decláralo con la
evidencia del barrido (comandos + salida).

**Regresiones obligatorias** (worktree limpio de `02b878a7`; no toques WIP ajeno):

- `pnpm run test` y `pnpm run check:ci`.
- `SMALL_DETAILS_ENFORCE=1 pnpm run check:small-details` (D16 no puede volver).
- `pnpm run build` + `node scripts/check-postbuild.mjs dist` (23 checks).
- Guardas: `dap-no-retention-surfaces`, `at-taxonomy-consistency`,
  `honorarios-rate-year-consistency`, `audit-scope-consistency`.

**Salida** (actualiza, no reescribas historia):

- `02-result.json` — D23–D24 con `status` y evidencia; `verdict` (`PASS` exige
  0 defectos de producto abiertos); `humanSignoff: null`; PASS es pre-gate y no
  reemplaza la firma humana.
- `03-report.md` — sección «Pass6 delta»: verificación D23–D24, barrido de
  clase A y B (alcance y resultado), regresiones, veredicto y limitaciones.
- Evidencia numerada desde `55-` (no pises 01–54).

Reglas R1–R8 vigentes: nada de aritmética de memoria, anclaje a fuente primaria
con extracto, trazabilidad comando+salida, adversarial en bordes, veredicto
explícito, reproducibilidad (SHA + entorno), y **no modifiques `src/`**.
