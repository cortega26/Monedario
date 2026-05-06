# Gate 06 — Compliance Review: gratificacion-legal-chile

Status: CONDITIONAL — score NORMA_YMYL 8.63/10 < 9.5 bloquea PASS; 3 defectos documentados
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza 06-compliance.md del 2026-05-05 (post-remediación anterior)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/gratificacion-legal.md`
  - `docs/editorial/artifacts/gratificacion-legal/04-draft.md`
  - `docs/editorial/artifacts/gratificacion-legal/05-math-audit.md`
  - `src/data/blog/gratificacion-legal-chile.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones (puntos de atención post-2026-05-05)

| Punto de atención | Estado |
|---|---|
| Umbral "30 días" de elegibilidad eliminado | ✓ RESUELTO — no aparece en el blog file |
| IMM $539.000 insertado (Ley 21.751, Mintrab) | ✓ RESUELTO — verificado por MathAuditAgent; presente en cuerpo y footer |
| Tope $2.560.250 (539.000 × 4,75) insertado | ✓ RESUELTO — verificado por MathAuditAgent |
| Ejemplo $2.400.000 completo | ✓ RESUELTO — verificado (800.000 × 12 × 0,25 = 2.400.000 < 2.560.250) |
| Presunción modalidad 25% eliminada | ✓ RESUELTO — sección "sin utilidades" correcta sin presunción |
| ERROR "decreto supremo" → Ley 21.751 | ✓ RESUELTO — corregido en cuerpo y footer |
| TODO:SOURCE de provisión mensual 1/12 | ✓ PARCIALMENTE RESUELTO — suavizado a "práctica más extendida" (descriptivo, no normativo); aceptable para publicación condicional |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 8.5/10 | 2.975 | `articleLead.answer` declara 25% y tope 4,75 IMM. Fórmula caja clara. Ejemplo numérico verificado. Deducción: definición de apertura ("cuando el establecimiento obtiene utilidades, artículo 47") vincula gratificación exclusivamente a la condición de utilidades, contradiciendo implícitamente la sección posterior donde modalidad 25% subsiste sin utilidades. |
| Precisión + fuentes | 25% | 8.5/10 | 2.125 | IMM $539.000 y tope $2.560.250 verificados. Arts. 47–52 CT citados. Ley 21.751 correctamente identificada. Deducción: (1) afirmación "la ley permite pago anual dentro del ejercicio correspondiente o el siguiente" sin citar art. 48 CT. (2) FAQ "puede ser base imponible... según la forma de pago" introduce condición no explicada. |
| Vigencia + calendario | 15% | 9.5/10 | 1.425 | `validAsOf: 2026-05-03` presente. Ley 21.751 correctamente referenciada. Footer con IMM y tope explícitos con links. |
| Excepciones + cobertura | 15% | 8.5/10 | 1.275 | Dos modalidades cubiertas. Proporcional art. 52 CT cubierto. Escenario de pérdidas correcto. PJSL mencionadas. Deducción: sin requisito mínimo de duración de empleo tras eliminar "30 días" — el artículo dice "todo trabajador" sin condición temporal, lo que puede sobreestimar elegibilidad; art. 52 CT cubre la proporcionalidad pero no aclara si existe mínimo de días. |
| Claridad + estructura | 10% | 8.5/10 | 0.850 | Estructura H2 coherente. FAQ presente. Disclaimers correctos. Deducción menor: apertura definitoria crea framing potencialmente misleading. |
| **TOTAL** | 100% | — | **8.65/10** | **Por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

**DEFECT #1 — MEDIUM — Coherencia interna: definición de apertura contradice modalidad art. 50 (NORMA_YMYL MUST #8)**

Ubicación: Sección "¿Qué es la gratificación legal y a quiénes aplica?", primer párrafo.

El artículo define la gratificación legal como "la parte de las remuneraciones que el empleador debe compartir con los trabajadores cuando el establecimiento donde prestan servicios **obtiene utilidades** en el ejercicio comercial (artículo 47)." La condición "cuando obtiene utilidades" es propia del art. 47 (modalidad 30%). La modalidad del art. 50 (25%, la más común en Chile) subsiste sin importar si hubo utilidades. Un lector que lea solo la definición de apertura y no continúe al cuerpo concluirá que no tiene derecho a gratificación si su empresa tuvo pérdidas — exactamente lo contrario de lo que el artículo establece en la sección "¿Qué pasa si la empresa no tuvo utilidades?".

Esto es una contradicción entre secciones: NORMA_YMYL MUST #8 (Coherencia interna — "No puede haber contradicciones entre secciones").

Resolution: Ampliar la definición de apertura para distinguir desde el inicio: la gratificación puede corresponder bajo el art. 47 (30% de utilidades, condicional al resultado) O bajo el art. 50 (25% de remuneraciones imponibles, independiente del resultado). Alternativamente, remover la condición "cuando el establecimiento obtiene utilidades" del primer párrafo y reservarla para la sección de modalidades.

---

**DEFECT #2 — MINOR — "La ley permite pago anual" sin citar artículo CT específico (NORMA_YMYL MUST #4)**

Ubicación: Sección "¿Cuándo y cómo se paga?", párrafo "Pago anual".

El artículo afirma "la ley permite pagar la gratificación en una sola cuota, dentro del ejercicio correspondiente o el siguiente" sin citar el artículo del Código del Trabajo que lo sustenta. El art. 48 CT regula el pago anual (30 días post-balance). La omisión del artículo específico es un defecto de trazabilidad para contenido YMYL con implicancias laborales.

Resolution: Agregar "(artículo 48 CT)" a la afirmación de pago anual.

---

**DEFECT #3 — MINOR — FAQ "según la forma de pago" introduce condición no explicada (NORMA_YMYL MUST #2 + §2.2)**

Ubicación: FAQ "¿La gratificación es parte del sueldo imponible?".

El FAQ concluye: "puede ser base imponible para descuentos previsionales y tributarios, **según la forma de pago**." Esta cualificación condicional no explica qué forma de pago la hace imponible y cuál no. NORMA_YMYL §2.2 prohíbe el patrón "Depende..." sin listar de qué depende. El lector queda con una advertencia sin contenido accionable.

Resolution: Explicar brevemente cuándo aplica la excepción de imponibilidad (p.ej., gratificación pagada en cuota anual vs. provisión mensual) o eliminar la cualificación y redirigir directamente a la guía de descuentos sin crear una expectativa de excepción sin contenido.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE del math audit | Resolución en blog file | Estado |
|---|---|---|
| Provisión mensual 1/12 — sin ordinario DT para periodicidad | Reformulado a "práctica más extendida" (claim descriptivo, no normativo) | RESUELTO (aceptable para publicación condicional) |
| Umbral "30 días" de elegibilidad — sin fuente | Eliminado del artículo | RESUELTO |
| Presunción modalidad 25% sin comunicación formal — sin fuente | Eliminado del artículo | RESUELTO |
| ERROR: "decreto supremo" → Ley 21.751 | Corregido en cuerpo y footer | RESUELTO |

**TODO:SOURCE activos en el blog file: 0**

---

## Declaración de Separación de Deberes (SoD)

| Stage | Rol | Agente / Sesión | Estado |
|---|---|---|---|
| Gate 01 Brief | Autor | Humano | ✓ |
| Gate 02–03 Research / Outline | DraftAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| Gate 04 Draft | DraftAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| Remediación | DraftAgent | Claude Code — sesión fresca 2026-05-05 | ✓ |
| Gate 05 Math Audit | MathAuditAgent | ChatGPT — sesión fresca 2026-05-05 | ✓ Ejecutado — Veredicto FAIL (resuelto) |
| Gate 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-06 (esta sesión) | ✓ SoD cumplido |
| Gate 07 Publish Packet | Solo humano | — | ⬜ Pendiente |

SoD: CONFORME. DraftAgent, MathAuditAgent y ComplianceAgent son sesiones y modelos separados. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido.

---

## Veredicto final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió todos los errores materiales del ciclo anterior: IMM y tope verificados e insertados, error "decreto supremo" corregido a Ley 21.751, presunción y umbral de 30 días eliminados, ejemplo numérico completo y verificado. No quedan TODO:SOURCE activos ni errores de datos en el blog file.

El artículo no puede alcanzar PASS por tres razones:
1. **DEFECT #1 (MEDIUM)**: La definición de apertura vincula gratificación a "obtener utilidades" contradiciendo la sección de modalidad 25% — incoherencia interna NORMA_YMYL MUST #8.
2. **DEFECT #2 (MINOR)**: Pago anual sin citar art. 48 CT — defecto de trazabilidad MUST #4.
3. **DEFECT #3 (MINOR)**: FAQ con condición de imponibilidad no explicada — patrón prohibido §2.2.

Score NORMA_YMYL: 8.65/10. **Artículo no autorizado para Gate 07 hasta que DraftAgent resuelva los 3 defectos.**
