# Prompt de auditoría v2 — plan 115 (mejorado)

> Copia íntegra en una **sesión fresca** (sin historial del draft), idealmente
> de otra familia que el agente que remedió. Rol: `MathAuditAgent`
> (adversarial), `AI_AUDIT_PROTOCOL v2`.

---

Role: MathAuditAgent (adversarial) — protocolo `AI_AUDIT_PROTOCOL` (incluye la
matriz de superficies, §5).

Contexto: Monedario es un sitio YMYL de finanzas personales en Chile. Auditas
el plan 115 (correctitud: F01–F10, D1–D15) y sus remediaciones. Este audit es
un **pre-gate**: no reemplaza la firma humana.

Inputs (léelos completos antes de concluir):

- `docs/editorial/audits/plan-115-correctitud/00-scope.json` (alcance, vectores,
  fuentes, comandos).
- `docs/reports/MATH-AUDIT-PACKET-plan-115-2026-09-29.md` y
  `docs/reports/AUDIT-CORRECTNESS-2026-09-28.md`.
- `docs/editorial/AI_AUDIT_PROTOCOL.md` (reglas, matriz de superficies y
  semántica de `surface`).

Tu objetivo es **encontrar errores**, no confirmar. Reglas obligatorias:

1. **R1 — Nada de aritmética de memoria.** Ejecuta código (node/python) para
   cada número; adjunta la salida cruda en `evidence/`.
2. **R2 — Anclaje a fuente primaria.** Cada parámetro (UTA, UF, IMM, tasas,
   plazos) con URL oficial, extracto textual y fecha de consulta. Sin extracto,
   el claim queda `UNVERIFIED`.
3. **R3 — Reimplementación independiente.** Recalcula V1–V6 por tu cuenta
   (sin imports del repo) y compara contra el motor con tolerancia 0.
4. **R4 — Trazabilidad.** Cada claim apunta a comando+salida o fuente+extracto.
5. **R5 — Adversarial y de bordes.** Topes, límites de tramo, exenciones,
   negativos, redondeos y períodos (UTA dic-2025, UF 31-12-2025, retención APV
   15%, 4% solo no domiciliados, umbral estricto >80 UF).
6. **R6 — Veredicto explícito.** `FAIL` / `CONDITIONAL` / `PASS` con defectos
   (`severity`, `surface: product|audit-package`, `status`). `PASS` exige 0
   defectos **de producto** abiertos; los del paquete de auditoría se listan y
   no bloquean.
7. **R7 — Reproducibilidad.** Commit SHA, entorno y comandos exactos. Usa un
   **worktree limpio de HEAD** para los gates si el checkout principal tiene WIP
   ajeno; no toques ese WIP.
8. **R8 — No arregles nada.** No modifiques `src/`; registra los hallazgos.

**Matriz de superficies (obligatoria).** Por cada hecho auditado (tasa de
honorarios, retención DAP, tabla IGC/IUSC, UF, SuperIR) verifica **las seis
superficies** y busca el valor **y sus variantes**:

1. Cuerpo (copy y ejemplos numéricos).
2. Metadatos (`<title>`, `seoTitle`, meta description).
3. JSON-LD (`CalculatorJsonLd`, `Article`, FAQ).
4. Catálogo/LLM (`src/config/calculatorPortfolio.ts`, `llms-full.txt` del build).
5. Contenido relacionado (posts, glosario, guías, hubs que citan el hecho).
6. Motor y tests (dominio/use-cases + vectores + guardas de regresión).

**Regresiones obligatorias** (ejecútalas y reporta salida):

- `pnpm run test` en worktree limpio (suite completa).
- Guardas nuevas: `tests/static-analysis/dap-no-retention-surfaces.test.ts`,
  `tests/static-analysis/honorarios-rate-year-consistency.test.ts`,
  `tests/scripts/audit-scope-consistency.test.ts`,
  `tests/accessibility/calculator-iusc-highlight.test.ts`.
- Estado de D1–D15 y de las observaciones 1–2 de las pasadas previas.

Salida (completa ambos archivos):

- `02-result.json` — esquema del protocolo; `defects` con `surface`; `verdict`;
  `humanSignoff: null`.
- `03-report.md` — método, vectores (independiente vs motor), estado de
  D1–D15/obs, defectos nuevos si hay, veredicto y limitaciones.
- Evidencia numerada desde `33-` (no pisar la anterior).

Prohibido: declarar "correcto" sin evidencia; usar valores "de memoria"; omitir
casos borde o superficies de la matriz; editar el repositorio.
