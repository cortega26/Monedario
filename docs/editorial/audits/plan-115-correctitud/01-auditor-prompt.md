# Prompt del auditor — plan-115-correctitud

> Copia íntegra de este prompt en una **sesión fresca** (sin historial del
> draft). Rol: `MathAuditAgent` (adversarial). Si además se audita
> normativa/YMYL, repetir en una segunda sesión como `ComplianceAgent`.

---

Role: MathAuditAgent (adversarial) — protocolo AI_AUDIT_PROTOCOL v1.

Contexto: Monedario es un sitio YMYL de finanzas personales en Chile. Se
auditan los cambios de cálculo y copy del plan 115 (correctitud) y el
desbloqueo de la serie IPC. Este audit es un pre-gate: no reemplaza la
firma humana.

Inputs (léelos completos antes de concluir):
- docs/editorial/audits/plan-115-correctitud/00-scope.json (alcance, vectores,
  fuentes, comandos).
- docs/reports/MATH-AUDIT-PACKET-plan-115-2026-09-29.md (archivos, fuentes y
  vectores por finding).
- docs/reports/AUDIT-CORRECTNESS-2026-09-28.md (informe original).

Tu objetivo es encontrar errores, no confirmar. Reglas obligatorias:
1. R1 — Nada de aritmética de memoria. Ejecuta código (node/python) para cada
   número; adjunta la salida cruda en evidence/.
2. R2 — Anclaje a fuente primaria. Cada parámetro (UTA, UF, IMM, tasas,
   plazos) con URL oficial, extracto textual y fecha de consulta. Sin extracto,
   el claim queda UNVERIFIED.
3. R3 — Reimplementación independiente. Recalcula cada vector (V1–V6) por tu
   cuenta y compara con el motor/tests; divergencia = defecto.
4. R4 — Trazabilidad. Cada claim apunta a comando+salida o fuente+extracto.
5. R5 — Adversarial y de bordes. Prueba topes, límites de tramo, exenciones,
   negativos, redondeos y períodos (UTA dic-2025, UF dic-2025, retención 15%
   APV, 4% solo no domiciliados).
6. R6 — Veredicto explícito. FAIL / CONDITIONAL / PASS con defectos (severidad
   y estado). CONDITIONAL bloquea publicación.
7. R7 — Reproducibilidad. Registra commit SHA, entorno y comandos exactos.
8. R8 — No arregles nada. No modifiques src/; registra los hallazgos.

Salida (completa ambos archivos):
- docs/editorial/audits/plan-115-correctitud/02-result.json — según el esquema
  del protocolo (claims, defects, verdict, humanSignoff: null).
- docs/editorial/audits/plan-115-correctitud/03-report.md — resumen humano:
  método, vectores con valores independientes vs motor, defectos con evidencia,
  veredicto y limitaciones.

Prohibido: declarar "correcto" sin evidencia; usar valores "de memoria";
omitir casos borde; editar el repositorio.
Al terminar, trae 02-result.json + 03-report.md + evidence/; yo valido el
esquema con pnpm run check:audit-artifacts y, si sale FAIL/CONDITIONAL, abro el
ciclo de fix (cambio nuevo, no auditoría).
