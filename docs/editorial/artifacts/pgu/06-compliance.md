# Gate 06 — Compliance Review: pgu-pension-garantizada-universal

Status: CONDITIONAL — residual TODO:SOURCE (fórmula complemento, extranjeros) y score NORMA_YMYL < 9,5 bloquean PASS; regulatory_sensitivity=alta requiere sign-off humano obligatorio
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha de revisión: 2026-05-05
Reemplaza: 06-compliance.md del 2026-05-04 (pre-remediación)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/pgu.md`
  - `docs/editorial/artifacts/pgu/04-draft.md`
  - `docs/editorial/artifacts/pgu/05-math-audit.md`
  - `src/data/blog/pgu-pension-garantizada-universal.md` (versión post-remediación 2026-05-05)

> **ALERTA regulatory_sensitivity=alta**: Este artículo trata un beneficio estatal de pensión cuyos errores pueden afectar decisiones de jubilación de personas vulnerables. Sign-off humano obligatorio antes de Gate 07. Gate 07 no puede ejecutarse sin aprobación explícita de un revisor humano.

---

## Verificación de remediaciones del 2026-05-05

| Punto de atención | Estado |
|---|---|
| Requisito residencia: "20 años + 4 años últimos 5" (Ley 21.419) | ✓ RESUELTO — presente en sección de requisitos, cita Ley 21.419 |
| Montos PGU: $231.732 (65–81 años) y $250.275 (82+, feb 2026) | ✓ RESUELTO — ambos montos presentes con fuente ChileAtiende |
| Umbrales PGU+AFP ($789.139 / $1.252.602) | ✓ RESUELTO — verificados por MathAuditAgent (ChileAtiende) |
| TODO:SOURCE visible en blog file eliminado | ✓ RESUELTO — no quedan marcadores de pipeline en el artículo publicable |
| Gate 05 ejecutado | ✓ RESUELTO — MathAuditAgent ChatGPT sesión 2026-05-05 |
| Monto PGU $231.732 sin valor → completado | ✓ RESUELTO |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,0/10 | 3,15/3,50 | Montos $231.732 y $250.275 presentes. Requisito de residencia completo (20 años + 4 años últimos 5). Umbrales complemento AFP verificados. Penalización: `articleLead.answer` no da el monto — solo dice "el monto se reajusta periódicamente — verifica en IPS". El lector tiene que leer hasta la sección "¿Cuánto se paga?" para obtener el número. |
| Precisión + fuentes | 25% | 8,5/10 | 2,13/2,50 | Montos atribuidos a ChileAtiende; umbrales AFP a Superintendencia de Pensiones. Penalización: (1) Ley 21.419 citada para residencia pero sin URL BCN. (2) Fórmula exacta de reducción dentro del tramo variable ($789.139–$1.252.602) no provista — solo dice "El IPS calcula". (3) Condiciones exactas para extranjeros no verificadas (TODO:SOURCE no cerrado). |
| Vigencia + calendario | 15% | 9,5/10 | 1,43/1,50 | Cut-off 2026-05-03; referencia a "desde febrero 2026" para $250.275; nota de reajuste periódico prominente. |
| Excepciones + cobertura | 15% | 8,5/10 | 1,28/1,50 | Sin cotizaciones AFP, extranjeros, APV, invalidez mencionados. Penalización: extranjeros section dice "pueden existir condiciones adicionales" sin precisarlas; percentil 90% operacionalizado como "Puntaje de Focalización Previsional" no mencionado (solo verificado en math audit). |
| Claridad + estructura | 10% | 9,0/10 | 0,90/1,00 | No quedan TODO:SOURCE visibles. H2 claros. Umbrales PGU+AFP presentados en tabla narrativa clara. |
| **TOTAL** | 100% | — | **8,89/10** | **Por debajo del umbral 9,5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — MINOR — articleLead.answer no incluye el monto PGU

**Severidad:** MINOR
**Ubicación:** Frontmatter, `articleLead.answer`.
**Descripción:** El `articleLead.answer` dice "El monto se reajusta periódicamente — verifica el valor actualizado en el IPS." El cuerpo del artículo sí provee el monto ($231.732 / $250.275), pero la respuesta ancla en la vista de lead no da el número. Para un artículo con `regulatory_sensitivity=alta`, la respuesta ancla debería incluir el monto verificado con la misma advertencia de reajuste.
**NORMA_YMYL:** MUST #1 (Respuesta Ancla ≤ 2 pantallas — debe incluir el número concreto).
**Resolución:** Actualizar `articleLead.answer` para incluir "$231.732 mensuales (65–81 años), $250.275 mensuales (82+ desde febrero 2026) según ChileAtiende — sujeto a reajuste periódico; verifica en el IPS."

---

### DEFECT #2 — MINOR — Ley 21.419 citada sin URL BCN

**Severidad:** MINOR
**Ubicación:** Sección "¿Quiénes pueden recibirla?", requisito de residencia.
**Descripción:** El artículo cita "(Ley 21.419)" para el requisito de residencia ampliado ("20 años + 4 años en los últimos 5"), pero no enlaza al texto legal en BCN. El math audit confirmó que la ley correcta es Ley 21.419 (BCN `idNorma=1171923`). La cita legal sin URL reduce la trazabilidad.
**NORMA_YMYL:** MUST #4 (fuentes oficiales con link verificable).
**Resolución:** Convertir "(Ley 21.419)" en un enlace: "(Ley 21.419 — texto en BCN)".

---

### DEFECT #3 — MINOR — TODO:SOURCE residual: fórmula exacta del tramo variable PGU/AFP

**Severidad:** MINOR (el artículo aborda esto defensivamente pero no cierra el TODO:SOURCE)
**Ubicación:** Sección "PGU y pensión AFP: ¿se complementan o se restan?".
**Descripción:** Para pensiones base entre $789.139 y $1.252.602, el artículo dice "corresponde un monto variable de PGU. El IPS calcula el aporte aplicable a tu caso." El math audit (Gate 05) confirmó que no se recuperó una fórmula matemática explícita y trazable desde fuente oficial. La omisión de la fórmula es editorial y defensivamente correcta, pero el TODO:SOURCE no está formalmente cerrado — la fórmula de cálculo del tramo variable existe en la regulación y podría obtenerse.
**NORMA_YMYL:** MUST #4 (fuente oficial para regla crítica). El claim sobre el monto variable es un claim operativo sin fórmula que lo sustente.
**Resolución:** Obtener la fórmula oficial de complemento del tramo variable desde la Superintendencia de Pensiones e incluirla, o documentar explícitamente que la fórmula no está disponible en fuentes públicas consultables.

---

### DEFECT #4 — MINOR — TODO:SOURCE residual: condiciones exactas para extranjeros

**Severidad:** MINOR
**Ubicación:** Sección "Casos frecuentes — Extranjeros residentes".
**Descripción:** El artículo dice "Verifica las condiciones exactas en el IPS, ya que pueden existir condiciones adicionales según tu situación migratoria." El math audit marcó este claim como TODO:SOURCE. El artículo maneja esto defensivamente (no afirma elegibilidad automática) pero tampoco provee información suficiente para que un extranjero residente evalúe su situación antes de contactar al IPS.
**NORMA_YMYL:** MUST #5 (excepciones relevantes deben enumerarse aunque sea brevemente).
**Resolución:** Verificar en IPS si existen condiciones migratorias adicionales (ej. tipo de visa, permanencia definitiva) e incluirlas brevemente. Si no hay condiciones adicionales más allá del requisito de residencia, explicitarlo.

---

### DEFECT #5 — PROCESS — Regulatory_sensitivity=alta: sign-off humano obligatorio pre-Gate 07

**Severidad:** PROCESS (bloquea Gate 07 independientemente del contenido)
**Descripción:** El artículo tiene `regulatory_sensitivity: alta` per la 04-draft. El brief confirma "alto riesgo YMYL requiere sign-off explícito" en Gate 07. Por INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES, el sign-off no puede ser marcado por agente en el 07-publish-packet.md — debe ser un revisor humano quien apruebe explícitamente.
**Resolución:** Un revisor humano debe auditar el contenido, verificar que los montos y requisitos sean vigentes al momento de publicar, y firmar el 07-publish-packet.md. El agente no puede marcar este gate.

---

## Separation of Duties Declaration

| Stage | Role | Agente / Sesión | Estado |
|---|---|---|---|
| 02 Research | ResearchAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| 03 Outline | OutlineAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| 04 Draft | DraftAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| Remediation | DraftAgent | Claude Code — sesión 2026-05-05 | ✓ |
| 05 Math audit | MathAuditAgent | ChatGPT — sesión fresca 2026-05-05 | ✓ Ejecutado |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-05 (esta sesión) | ✓ SoD cumplido |
| 07 Publish packet | **Solo humano** | — | ⬜ **Pendiente — regulatory_sensitivity=alta** |

**SoD verdict:** ✓ Sin violación de roles. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido. Sign-off humano obligatorio en Gate 07 documentado.

---

## Veredicto Final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió los defectos críticos del Gate 06 anterior: monto PGU completado ($231.732 / $250.275 con fuentes), requisito de residencia corregido (Ley 21.419, condición "4 años en los últimos 5" incluida), umbrales AFP verificados ($789.139 / $1.252.602), TODO:SOURCE de pipeline eliminado del blog file, Gate 05 ejecutado.

**Razones del CONDITIONAL (no PASS):**
1. DEFECT #1: `articleLead.answer` no incluye el monto verificado (debería mencionarlo con advertencia de reajuste).
2. DEFECT #2: Ley 21.419 sin URL BCN.
3. DEFECT #3: Fórmula del tramo variable ($789.139–$1.252.602) no provista — solo "IPS calcula".
4. DEFECT #4: Condiciones exactas para extranjeros no verificadas.
5. DEFECT #5 (PROCESS): Sign-off humano obligatorio por regulatory_sensitivity=alta.
6. Score NORMA_YMYL 8,89/10 < 9,5.

**Ruta a PASS:**
- Actualizar `articleLead.answer` con el monto (DEFECT #1).
- Agregar URL BCN para Ley 21.419 (DEFECT #2).
- Obtener o documentar la fórmula del tramo variable (DEFECT #3).
- Verificar condiciones migratorias en IPS (DEFECT #4).
- Obtener sign-off humano (DEFECT #5 — obligatorio, no delegable).
- **Nueva ronda de DraftAgent requerida + sign-off humano antes de Gate 07.**
