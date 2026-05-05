# Gate 06 — Compliance Review: gratificacion-legal-chile

Status: CONDITIONAL — residual TODO:SOURCE y score NORMA_YMYL < 9,5 bloquean PASS
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha de revisión: 2026-05-05
Reemplaza: 06-compliance.md del 2026-05-04 (pre-remediación)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/gratificacion-legal.md`
  - `docs/editorial/artifacts/gratificacion-legal/04-draft.md`
  - `docs/editorial/artifacts/gratificacion-legal/05-math-audit.md`
  - `src/data/blog/gratificacion-legal-chile.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones del 2026-05-05

| Punto de atención | Estado |
|---|---|
| Umbral "30 días" eliminado | ✓ RESUELTO — no aparece en el artículo publicable |
| IMM $539.000 insertado | ✓ RESUELTO — presente y verificado por MathAuditAgent |
| Tope $2.560.250 calculado e insertado | ✓ RESUELTO — verificado (`539.000 × 4,75 = 2.560.250`) |
| Ejemplo $2.400.000 completo | ✓ RESUELTO — verificado (`800.000 × 12 × 0,25 = 2.400.000`) |
| Presunción modalidad 25% eliminada | ✓ RESUELTO — sección "sin utilidades" correcta sin presunción |
| "Decreto supremo" → Ley 21.751 | ✓ RESUELTO — corregido en cuerpo y footer del artículo |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,5/10 | 3,33/3,50 | `articleLead.answer` declara 25% y tope 4,75 IMM. Ejemplo completo y verificado ($2.400.000 < $2.560.250). Fuentes BCN y DT presentes. Fecha de corte prominente. |
| Precisión + fuentes | 25% | 8,5/10 | 2,13/2,50 | Penalización: (1) apertura define gratificación solo desde art. 47 ("cuando obtiene utilidades"), creando framing parcial vs. obligación del art. 50 que no requiere utilidades. (2) "la ley permite pago anual" sin artículo CT citado. (3) provisión mensual 1/12 phrased como "práctica", DT ordinario no obtenido formalmente. |
| Vigencia + calendario | 15% | 9,5/10 | 1,43/1,50 | "Vigente al 2026-05-03" al inicio; footer con IMM y tope explícitos; Ley 21.751 correctamente identificada en lugar de "decreto supremo". |
| Excepciones + cobertura | 15% | 9,0/10 | 1,35/1,50 | Ambas modalidades cubiertas; escenario de pérdidas correcto; proporcional art. 52 CT tratado; FAQ completo. Leve gap: sin requisito mínimo de duración de empleo (30 días eliminado sin alternativa). |
| Claridad + estructura | 10% | 9,0/10 | 0,90/1,00 | Flujo H2 claro. Leve penalización: apertura de definición ("cuando el establecimiento obtiene utilidades") contradice implícitamente el mensaje de la sección de sin-utilidades. |
| **TOTAL** | 100% | — | **9,14/10** | **Por debajo del umbral 9,5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — MINOR — Apertura de definición incompleta: framing de art. 47 contradice modalidad art. 50

**Severidad:** MINOR (contribuye al score < 9,5)
**Ubicación:** Cuerpo del artículo, sección "¿Qué es la gratificación legal y a quiénes aplica?", primer párrafo.
**Descripción:** El artículo define la gratificación como "la parte de las remuneraciones que el empleador debe compartir con los trabajadores cuando el establecimiento donde prestan servicios obtiene utilidades en el ejercicio comercial (artículo 47 del Código del Trabajo)." La condición "cuando obtiene utilidades" es propia del marco del art. 47, pero la modalidad 25% del art. 50 — presentada más adelante como la más habitual — subsiste sin utilidades. Un lector que lea solo la apertura concluirá que la gratificación requiere utilidades, lo que es opuesto al mensaje central del artículo.
**NORMA_YMYL:** MUST #8 (Coherencia interna — no puede haber contradicciones entre secciones).
**Resolución:** Ampliar la apertura para distinguir: "El art. 47 CT establece el derecho general; la modalidad 25% (art. 50 CT) opera independientemente de si la empresa tuvo utilidades."

---

### DEFECT #2 — MINOR — "La ley permite pago anual" sin artículo CT específico

**Severidad:** MINOR
**Ubicación:** Sección "¿Cuándo y cómo se paga?", párrafo "Pago anual".
**Descripción:** El artículo afirma "la ley permite pagar la gratificación en una sola cuota, dentro del ejercicio correspondiente o el siguiente" sin citar el artículo del Código del Trabajo que sustenta esta afirmación. El brief referencia arts. 47–52 CT; el artículo debe identificar cuál de ellos permite el pago anual.
**NORMA_YMYL:** MUST #4 (Fuentes oficiales mínimas para cada regla crítica YMYL).
**Resolución:** Agregar referencia al artículo CT específico (ej. "según el art. 47 CT").

---

### DEFECT #3 — MINOR — TODO:SOURCE residual: provisión mensual 1/12 sin ordinario DT

**Severidad:** MINOR
**Ubicación:** Sección "¿Cuándo y cómo se paga?", párrafo "Provisión mensual".
**Descripción:** El math audit marcó este claim como TODO:SOURCE por ausencia de ordinario DT sobre periodicidad. La remediación suavizó el claim a "práctica más extendida" — mitigación válida pero que no cierra formalmente el TODO:SOURCE. La frase no se presenta como norma legal, lo que es aceptable para publicación condicional, pero la fuente de respaldo sigue sin obtenerse.
**NORMA_YMYL:** §3.1 (inferencias solo si respaldadas por artículos citados o etiquetadas como orientativas).
**Resolución:** Obtener ordinario DT sobre periodicidad, o reformular explícitamente: "La ley no impone una periodicidad mensual obligatoria; la provisión mensual es práctica empresarial extendida, no un requisito legal."

---

### DEFECT #4 — NOTE — Gap de elegibilidad: sin requisito mínimo de duración de empleo

**Severidad:** NOTE (no bloquea)
**Descripción:** El umbral de "30 días" fue eliminado correctamente (no tenía fuente verificada). El artículo dice "Todo trabajador que preste servicios... tiene derecho a gratificación legal" sin indicar ningún requisito mínimo de tiempo de servicio. Esto puede sobrestimar elegibilidad para contratos muy breves dentro del ejercicio.
**Resolución:** Si el texto del art. 47 CT no establece mínimo, dejar como está. Alternativamente, señalar que el derecho es proporcional al tiempo trabajado (art. 52 CT), lo que de hecho implica que cualquier período genera derecho proporcional.

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
| 07 Publish packet | Solo humano | — | ⬜ Pendiente |

**SoD verdict:** ✓ Sin violación de roles. DraftAgent (Sprint 2B + sesión 2026-05-05) y ComplianceAgent (sesión fresca sin acceso al historial de draft) son sesiones separadas. MathAuditAgent es ChatGPT (modelo diferente). INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido.

---

## Veredicto Final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió todos los defectos bloqueantes del Gate 06 anterior: IMM y tope insertados y verificados ($539.000 / $2.560.250), ejemplo completo, error de "decreto supremo" corregido a Ley 21.751, presunción de modalidad 25% eliminada, umbral de 30 días eliminado. No quedan errores factuales materiales ni marcadores TODO:SOURCE visibles en el artículo publicable.

**Razones del CONDITIONAL (no PASS):**
1. DEFECT #1: apertura define gratificación solo desde el art. 47, generando framing incompleto para la modalidad más común (art. 50).
2. DEFECT #3: TODO:SOURCE de provisión mensual 1/12 no cerrado con ordinario DT, aunque el claim fue suavizado aceptablemente.
3. Score NORMA_YMYL 9,14/10 < 9,5 — umbral de PASS no alcanzado.

**Ruta a PASS:**
- Resolver DEFECT #1 (ampliar apertura de definición).
- Resolver o documentar DEFECT #2 (citar artículo CT para pago anual).
- Cierre de DEFECT #3 (ordinario DT o reformulación explícita de "práctica no obligatoria").
- **Nueva ronda de DraftAgent requerida antes de Gate 07.**
