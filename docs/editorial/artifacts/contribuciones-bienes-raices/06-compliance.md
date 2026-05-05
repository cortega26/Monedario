# Gate 06 — Compliance Review: contribuciones-bienes-raices-chile

Status: CONDITIONAL — tasas impositivas sin verificar, calendario TGR 2026 sin confirmar, F22 deducibilidad sin cita normativa
Role: ComplianceAgent (Claude Code — fresh session, adversarial)
Fecha de revisión: 2026-05-04
Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/contribuciones-bienes-raices/04-draft.md`
  - `src/data/blog/contribuciones-bienes-raices-chile.md` (blog file — versión publicable)
  - `docs/editorial/artifacts/contribuciones-bienes-raices/05-math-audit.md` — AUSENTE (Gate 05 obligatorio por `requires_calculation: true`)

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
