# Gate 06 — Compliance Review: contribuciones-bienes-raices-chile

Status: CONDITIONAL — artículo reformulado como guía procedimental (tasas eliminadas); score NORMA_YMYL < 9,5 y gap en promesa de `articleLead.covers` bloquean PASS
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha de revisión: 2026-05-05
Reemplaza: 06-compliance.md del 2026-05-04 (pre-remediación)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/contribuciones-bienes-raices.md`
  - `docs/editorial/artifacts/contribuciones-bienes-raices/04-draft.md`
  - `docs/editorial/artifacts/contribuciones-bienes-raices/05-math-audit.md`
  - `src/data/blog/contribuciones-bienes-raices-chile.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones del 2026-05-05

| Punto de atención | Estado |
|---|---|
| Tasas 1,2%/1,0% eliminadas (sin fuente SII cerrada) | ✓ RESUELTO — no aparecen en el artículo publicable |
| Calendario TGR 2026: "30 abril, 30 junio, 30 sept, 30 nov" | ✓ RESUELTO — verificado por MathAuditAgent (TGR) |
| DFL-2 → Decreto 1101: 140 m², personas naturales, máx 2 propiedades | ✓ RESUELTO — condiciones presentes; math audit verificó Decreto 1101 |
| F22 deducibilidad → condicional ("pueden ser consideradas gasto") | ✓ RESUELTO — no afirma deducción como regla cerrada |
| Apertura reformulada ("puede corresponder el pago") | ✓ RESUELTO — ERROR del math audit corregido |
| Gate 05 ejecutado | ✓ RESUELTO — MathAuditAgent ChatGPT sesión 2026-05-05 |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 7,5/10 | 2,63/3,50 | Calendario TGR verificado y presente; guía procedimental (canales de pago, reclamo) útil. Penalización material: el artículo ya no proporciona ninguna tasa concreta ni ejemplo de cálculo — solo "la tasa exacta que aplica depende de la clasificación, consulta en SII." Esto viola parcialmente NORMA_YMYL MUST #1 (respuesta concreta a la query "cómo calcular mis contribuciones"). |
| Precisión + fuentes | 25% | 9,5/10 | 2,38/2,50 | Sin tasas no verificadas. DFL-2 Decreto 1101 correcto y verificado. Calendario TGR verificado. F22 condicional. Aperturas correctas. No hay claims falsos. Penalización mínima: DFL-2 art. específico sin URL BCN. |
| Vigencia + calendario | 15% | 9,5/10 | 1,43/1,50 | Fechas exactas TGR 2026 verificadas. Cut-off 2026-05-03. Disclaimers de actualización presentes. |
| Excepciones + cobertura | 15% | 8,5/10 | 1,28/1,50 | Exenciones primera vivienda, DFL-2 (Decreto 1101) y adultos mayores mencionadas con nota de verificación en SII. Mora y reclamo de avalúo cubiertos. Penalización: topes de avalúo para exenciones no provistos (no verificados). |
| Claridad + estructura | 10% | 8,5/10 | 0,85/1,00 | Estructura H2 clara; canales de pago listados; tono educativo. Penalización: `articleLead.covers` ítem 1 promete "Cómo se calcula el monto según el avalúo fiscal y la tasa legal" pero el artículo no provee la tasa (dice "consulta en SII"). Existe gap promesa-entrega. |
| **TOTAL** | 100% | — | **8,57/10** | **Por debajo del umbral 9,5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — MINOR — NORMA_YMYL MUST #1 parcialmente incumplido: artículo no da respuesta concreta al cálculo

**Severidad:** MINOR — consecuencia de la decisión editorial de eliminar tasas no verificadas (correcta), no de un error factual
**Ubicación:** Sección "¿Cómo se calcula el monto?".
**Descripción:** La query ancla del artículo es "cómo calcular las contribuciones de bienes raíces". Post-remediación, la sección de cálculo dice: "La tasa exacta que aplica depende de la clasificación de tu propiedad y del régimen tributario correspondiente. La tasa vigente se consulta directamente en el SII." Este es un redirect sin respuesta concreta. NORMA_YMYL MUST #1 exige "una respuesta concreta (número/regla/criterio) en la primera sección útil." La ausencia total de la tasa, aunque motivada por rigor (la fuente SII cerrada no estaba disponible en el artefacto), crea un artículo que no puede responder la query principal sin que el lector salga a verificar en el SII.
**NORMA_YMYL:** MUST #1 (Respuesta Ancla — respuesta concreta) y §2.2 (patrones prohibidos: "Depende..." sin listar de qué depende).
**Resolución:** Verificar las tasas vigentes directamente en el portal SII y reincorporarlas con fuente, fecha y la advertencia "sujeto a actualización — verifica en SII antes de calcular." Esta es la única forma de pasar a PASS en esta dimensión.

---

### DEFECT #2 — MINOR — articleLead.covers ítem 1: promesa de cálculo no cumplida en el cuerpo

**Severidad:** MINOR
**Ubicación:** Frontmatter `articleLead.covers` ítem 1 vs. sección "¿Cómo se calcula el monto?".
**Descripción:** El frontmatter promete "Cómo se calcula el monto según el avalúo fiscal y la tasa legal." El cuerpo del artículo explica qué es el avalúo fiscal pero no provee la tasa legal — contradice la promesa del covers. Un usuario que llega al artículo por el snippet esperando la tasa verá un redirect al SII.
**NORMA_YMYL:** MUST #8 (Coherencia interna — no puede haber contradicciones entre secciones/frontmatter y cuerpo).
**Resolución (Opción A):** Verificar tasas SII y completar el artículo con la información prometida (mismo que DEFECT #1).
**Resolución (Opción B — conservadora):** Actualizar `articleLead.covers` ítem 1 a "Qué es el avalúo fiscal y cómo consultar la tasa en el SII" para alinear la promesa con el contenido real. Esto es editorialmente inferior pero elimina la incoherencia.

---

### DEFECT #3 — MINOR — DFL-2 (Decreto 1101): sin URL BCN ni número de artículo

**Severidad:** MINOR
**Ubicación:** Sección "Exenciones — DFL-2 — Vivienda Económica".
**Descripción:** El artículo referencia correctamente "Decreto 1101" como el instrumento jurídico del DFL-2 y provee las condiciones verificadas (140 m², personas naturales, máx dos propiedades). Sin embargo, no incluye un URL a BCN para este decreto (el math audit confirmó `decreto 1101, i=16842` en BCN). La cita es precisa pero no trazable sin URL.
**NORMA_YMYL:** MUST #4 (fuentes con link verificable).
**Resolución:** Agregar "(Decreto 1101)" como enlace a BCN con el `i=16842` correspondiente.

---

### DEFECT #4 — NOTE — Exenciones primera vivienda y adultos mayores sin topes de avalúo

**Severidad:** NOTE (no bloquea)
**Descripción:** Las exenciones de primera vivienda y adultos mayores se describen sin los topes de avalúo fiscal que definen la elegibilidad. El artículo redirige al SII, lo cual es defensivamente correcto dado que los topes son TODO:SOURCE no verificados. Pero el lector no puede estimar si califica antes de entrar al SII.
**Resolución (opcional):** Verificar topes vigentes en SII e incorporarlos con fecha. No bloqueante para publicación condicional.

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

**SoD verdict:** ✓ Sin violación de roles. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido.

---

## Veredicto Final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió los defectos de alta severidad del Gate 06 anterior: tasas no verificadas eliminadas, calendario TGR confirmado con fechas exactas (30 abril, 30 junio, 30 septiembre, 30 noviembre), DFL-2 referenciado correctamente al Decreto 1101 con condiciones verificadas, F22 deducibilidad suavizada a condicional, apertura reformulada. No quedan claims falsos ni marcadores TODO:SOURCE visibles en el artículo publicable.

**Razones del CONDITIONAL (no PASS):**
1. DEFECT #1: Artículo no provee ninguna tasa de cálculo — NORMA_YMYL MUST #1 parcialmente incumplido.
2. DEFECT #2: `articleLead.covers` ítem 1 promete cálculo con tasa que el artículo no provee.
3. DEFECT #3: Decreto 1101 sin URL BCN.
4. Score NORMA_YMYL 8,57/10 < 9,5.

**Observación sobre la decisión editorial**: La eliminación de las tasas fue correcta dado que la fuente SII cerrada no estaba disponible en el artefacto, y publicar tasas incorrectas en un artículo de impuestos es el riesgo más alto. Sin embargo, esta decisión hace que el artículo no pueda alcanzar el umbral 9,5 de NORMA_YMYL sin reincorporar las tasas verificadas. El artículo está atrapado entre dos requisitos del pipeline: no publicar tasas sin fuente oficial (correcto) y proveer respuesta concreta a la query de cálculo (también requerido).

**Ruta a PASS:**
- Verificar tasas SII directamente y reincorporarlas con fuente y fecha (resuelve DEFECT #1 y #2).
- Agregar URL BCN al Decreto 1101 (DEFECT #3).
- **Nueva ronda de DraftAgent requerida antes de Gate 07.**

> **Alerta `regulatory_sensitivity: media-alta`**: Este artículo trata tasas impositivas legales y deducibilidad fiscal. El umbral de verificación es más alto que para artículos educativos generales. Los valores aproximados ("~") son insuficientes para publicar sin verificación explícita de fuente y fecha.

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 8.5/10 | 2.98/3.50 | Lead directo y correcto. Fórmula clara con ejemplo numérico. Penalización: el ejemplo usa tasas "~" no verificadas; el resultado orientativo puede inducir error si la tasa cambió. |
| Precisión + fuentes | 25% | 6.5/10 | 1.63/2.50 | SII y TGR linkeados. Tasas (~1,2%, ~1,0%) sin verificar. Calendario cuotas sin verificar. Deducibilidad F22 sin artículo LIR ni instrucción SII. Exenciones sin valores de tope. |
| Vigencia + calendario | 15% | 9.0/10 | 1.35/1.50 | Cut-off presente; disclaimers de actualización explícitos. Penalización: fechas TGR 2026 marcadas como "aproximadas" — en un artículo de impuestos, fechas de vencimiento aproximadas pueden costar intereses al lector. |
| Excepciones + cobertura | 15% | 8.5/10 | 1.28/1.50 | Primera vivienda, DFL-2 y adultos mayores cubiertos. Mora y reclamo de avalúo cubiertos. F22 deducibilidad cubierta. Penalización leve: exenciones sin topes de avalúo (C4/C5). |
| Claridad + estructura | 10% | 9.0/10 | 0.90/1.00 | Estructura H2 clara; pseudocódigo de fórmula útil; canales de pago listados; tono educativo. |
| **TOTAL** | 100% | — | **8.14/10** | **Por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — CONDITIONAL — Tasas impositivas "~1,2%" y "~1,0%" no verificadas

**Severidad:** CONDITIONAL (bloquea publicación — claim fiscal de media-alta sensibilidad)
**Ubicación:** Blog file líneas 62–63; ejemplo orientativo línea 65; `articleLead.answer`
**Descripción:** Las tasas legales de contribuciones ("~1,2%" general y "~1,0%" DFL-2) son valores aproximados no verificados contra el SII. A diferencia de guidelines educativos, estas son tasas impositivas legales. Si el SII actualizó las tasas y el artículo publica valores incorrectos, el lector puede calcular montos erróneos y subestimar o sobreestimar su carga tributaria. El "~" y el redirect a SII mitigan pero no eliminan el riesgo de uso sin verificación.
**El ejemplo numérico** ($80M × 1,2% = $960k; cuota $240k) es aritméticamente correcto dado el valor de tasa usado, pero su exactitud depende de que la tasa sea correcta.
**NORMA_YMYL:** MUST #4 (fuente oficial con vigencia para reglas críticas) y `regulatory_sensitivity: media-alta`.
**Resolución (Bucket A — human + MathAuditAgent):**
- Verificar tasas vigentes en SII (sección Bienes Raíces) al momento de publicar.
- Reemplazar "~1,2%" y "~1,0%" con valores verificados + "vigente a [fecha], según SII".
- Actualizar el ejemplo con los valores confirmados.

---

### DEFECT #2 — CONDITIONAL — Calendario cuotas TGR 2026 sin verificar

**Severidad:** CONDITIONAL (bloquea publicación — fechas de vencimiento fiscal)
**Ubicación:** Blog file línea 71
**Descripción:** El artículo indica que las cuotas vencen "con vencimientos aproximados en abril, junio, septiembre y noviembre." Esta descripción es consistente con el patrón histórico de la TGR, pero las fechas exactas de 2026 no están verificadas contra el portal TGR. En un artículo de impuestos, publicar fechas de vencimiento incorrectas puede causar que el lector pague tarde y genere intereses y reajuste.
**NORMA_YMYL:** MUST #3 (vigencia explícita para reglas con consecuencias económicas).
**Resolución (Bucket A — human):**
- Verificar el calendario 2026 de cuotas de contribuciones en https://www.tgr.cl/.
- Si están publicadas: reemplazar "aproximados en abril, junio, septiembre y noviembre" por las fechas exactas de 2026 con fuente y cut-off.
- Si no están publicadas aún: mantener el lenguaje de "patrón habitual" con "consulta el calendario vigente en TGR antes de la primera cuota de 2026."

---

### DEFECT #3 — CONDITIONAL — Deducibilidad F22 sin cita de norma legal específica

**Severidad:** CONDITIONAL (bloquea publicación — interpretación legal fiscal sin respaldo explícito)
**Ubicación:** Blog file líneas 104–106
**Descripción:** El artículo afirma: "Las contribuciones de bienes raíces son gasto tributable deducible en el F22 únicamente para propietarios que arriendan el bien raíz" y "Si habitas tu propiedad como vivienda principal, no puedes deducir las contribuciones como gasto en tu F22." Son claims de deducibilidad fiscal específicos y afirmativos, sin citar el artículo de la Ley de Renta (LIR) ni una instrucción SII que los respalde.
**NORMA_YMYL:** MUST #4 (fuente oficial para regla crítica) y §3 (inferencias jurídicas requieren respaldo y etiqueta "orientativo").
**Resolución (Bucket A — human):**
- Verificar en Ley de Impuesto a la Renta (Art. 31 No. 2 LIR, o la instrucción SII aplicable) si la deducción aplica solo a arrendadores.
- Si confirma: agregar "(Art. 31 N°2 LIR y/o instrucción SII sobre arrendamiento de bienes raíces)" como fuente.
- Agregar nota "resumen orientativo" según §3.2 NORMA_YMYL: "Esta síntesis simplifica la norma; el tratamiento tributario puede variar según tu situación. Revisa con el SII o un contador."

---

### DEFECT #4 — NOTE (no bloquea CONDITIONAL) — Exenciones sin topes de avalúo

**Severidad:** NOTE
**Ubicación:** Blog file líneas 84–88
**Descripción:** Las exenciones de primera vivienda y adultos mayores se describen conceptualmente sin dar los topes de avalúo fiscal que definen la elegibilidad. El artículo redirige al SII para verificar, lo cual es defensivamente correcto. Sin embargo, el `articleLead.covers` dice "Exenciones para primera vivienda, DFL-2 y adultos mayores" — la cobertura real es parcial.
**Resolución (Opción A):** Verificar topes de exención vigentes en SII y agregarlos con fecha y fuente.
**Resolución (Opción B, Bucket C):** Ajustar `articleLead.covers` ítem 3 a "Quiénes pueden calificar para exenciones (primera vivienda, DFL-2, adultos mayores)" para reflejar el scope real del artículo sin prometer valores concretos.

---

### DEFECT #5 — NOTE — Gate 05 obligatorio no ejecutado

**Severidad:** NOTE de proceso
**Descripción:** `requires_calculation: true`. El ejemplo numérico (avalúo × tasa ÷ 4 cuotas) requiere verificación adversarial por MathAuditAgent. También se debe verificar la coherencia interna entre la tasa usada en el ejemplo y la declarada en el texto.
**Resolución (Bucket A — human):** Ejecutar Gate 05 en ChatGPT, preferentemente luego de verificar las tasas SII reales (D1), para que el math audit trabaje con valores correctos.

---

## Separation of Duties Declaration

| Stage | Role | Tool / Session | SoD Status |
|---|---|---|---|
| 04 Draft | DraftAgent | Claude Code — Sprint 2B session | ✓ |
| 05 Math audit | MathAuditAgent | ChatGPT — PENDIENTE (OBLIGATORIO) | ⬜ |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-04 | ✓ SoD cumplido |

---

## Overall Verdict

**CONDITIONAL**

El artículo tiene estructura sólida y cobertura temática completa (cálculo, calendario, exenciones, mora, reclamo, F22). No hay claims falsos detectados, pero `regulatory_sensitivity: media-alta` eleva el estándar de verificación requerido. Las tasas "~" y el calendario "aproximado" son insuficientes para publicar en un artículo de impuestos.

**Bloqueantes para pasar a PASS:**
1. D1: Verificar tasas SII (1,2%/1,0%) y actualizar con fecha de vigencia.
2. D2: Verificar calendario TGR 2026 y actualizar o ajustar lenguaje.
3. D3: Agregar cita normativa (LIR Art. 31 o instrucción SII) para deducibilidad F22 + nota "orientativo".
4. Gate 05 obligatorio (D5) — idealmente ejecutar con tasas verificadas de D1.
5. Opcionalmente: D4 Opción A (agregar topes exenciones) o Opción B (ajustar covers — Bucket C, disponible esta sesión).
6. Re-evaluar Gate 06 en sesión fresca.

**Acción Bucket C disponible esta sesión:** Si el humano autoriza, D4 Opción B (ajuste de `articleLead.covers` línea 35) puede ejecutarse sin esperar datos externos.
