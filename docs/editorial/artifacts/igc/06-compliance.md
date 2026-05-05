# Gate 06 — Compliance Review: impuesto-global-complementario-chile

Status: CONDITIONAL — tabla de tramos IGC ausente, TODO:SOURCE visible en blog file, tasa retención honorarios y UTA 2026 sin verificar
Role: ComplianceAgent (Claude Code — fresh session, adversarial)
Fecha de revisión: 2026-05-04
Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/igc/04-draft.md`
  - `src/data/blog/impuesto-global-complementario-chile.md` (blog file — versión publicable)
  - `docs/editorial/artifacts/igc/05-math-audit.md` — AUSENTE (Gate 05 obligatorio por `requires_calculation: true`)

> **Alerta `regulatory_sensitivity: alta`**: El IGC es un impuesto de renta con implicancias directas en el F22. Claims incorrectos sobre tramos, créditos o tasas pueden llevar al contribuyente a calcular mal su impuesto o esperar una devolución que no existe.

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 7.5/10 | 2.63/3.50 | Lead explica el mecanismo IGC claramente (global + complementario). `covers` promete "tramos vigentes" — la sección de tramos no los da. TODO:SOURCE visible en el cuerpo. |
| Precisión + fuentes | 25% | 6.5/10 | 1.63/2.50 | BCN (arts. 52–57 LIR) y SII linkeados en frontmatter y cuerpo. Tramos IGC en UTA sin verificar. UTA 2026 sin valor. Tasa honorarios sin verificar. APV 15% posiblemente correcto pero no verificado formalmente. |
| Vigencia + calendario | 15% | 9.0/10 | 1.35/1.50 | Cut-off presente; nota UTA varía cada año presente al inicio y al final. |
| Excepciones + cobertura | 15% | 8.0/10 | 1.20/1.50 | 4 perfiles bien identificados; créditos ISC, honorarios, APV y contribuciones cubiertos; ganancias de capital explícitamente excluidas (decisión editorial documentada). Penalización: sección de tramos vacía. |
| Claridad + estructura | 10% | 7.5/10 | 0.75/1.00 | H2s útiles; explicación "global + complementario" es la mayor fortaleza. Penalización: TODO:SOURCE visible en cuerpo; sección de tramos no tiene ningún valor de referencia. |
| **TOTAL** | 100% | — | **7.56/10** | **Significativamente por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — CONDITIONAL CRÍTICO — TODO:SOURCE visible en blog file publicable

**Severidad:** CONDITIONAL CRÍTICO — bloqueo absoluto de publicación
**Ubicación:** `src/data/blog/impuesto-global-complementario-chile.md` línea 86
**Descripción:** El blog file contiene el siguiente bloque visible al lector:
```
> **TODO:SOURCE**: la tabla completa de tramos en UTA y el valor de la UTA 2026 deben verificarse
> en el SII antes de publicar. Los valores que aparezcan en la versión publicada de este artículo
> serán verificados por el MathAuditAgent.
```
Texto de pipeline visible en el artículo editorial. Si se activa `draft: false` con esta línea, el lector verá el proceso interno del pipeline y sabrá que los datos no fueron verificados. Mismo patrón identificado en `pgu-pension-garantizada-universal.md`.
**NORMA_YMYL:** Gate G6 del publish packet.
**Resolución (Bucket C — esta sesión, autorización humana):**
Eliminar el bloque `> TODO:SOURCE` y reemplazar por nota editorial apropiada sin revelar el proceso interno. Propuesta al final de este documento.

---

### DEFECT #2 — CONDITIONAL CRÍTICO — Tabla de tramos IGC ausente: promesa central del artículo incumplida

**Severidad:** CONDITIONAL CRÍTICO — bloquea publicación
**Ubicación:** Blog file líneas 83–88; `articleLead.covers` ítem 3
**Descripción:** La sección "Tramos y tasas vigentes" explica correctamente la mecánica de la UTA y la progresividad, pero no incluye ningún valor:
- Sin tabla de tramos (ni siquiera los 7 rangos en UTA).
- Sin el valor de la UTA 2026.
- Sin las tasas por tramo.
El `covers` promete "Los tramos vigentes y cómo funciona la progresividad". La progresividad se explica; los tramos vigentes no se dan.
Un lector que llega al artículo buscando "tramos impuesto global complementario Chile" se irá sin lo que buscaba.
**NORMA_YMYL:** MUST #1 (respuesta concreta para la query principal) y MUST #4 (fuente oficial para regla crítica).
**Resolución (Bucket A — human + MathAuditAgent):**
1. Gate 05 (ChatGPT): verificar tabla de 7 tramos IGC en UTA vigente para el año tributario 2026, el valor de la UTA 2026 y la equivalencia en pesos.
2. Incluir la tabla completa en el artículo con fuente SII y fecha de vigencia.

---

### DEFECT #3 — CONDITIONAL — Tasa retención honorarios sin valor verificado

**Severidad:** CONDITIONAL (bloquea publicación)
**Ubicación:** Blog file líneas 97–98
**Descripción:** El artículo dice "la retención aplicada a tus boletas (tasa vigente a verificar en el SII para el año tributario correspondiente) es un crédito". No da ninguna tasa. Para un contribuyente con rentas mixtas (el perfil central del artículo), saber cuánto se retuvo en las boletas es parte del cálculo del crédito contra el IGC. La ausencia de la tasa deja la sección de créditos incompleta.
**Resolución (Bucket A — human):** Verificar la tasa de retención de honorarios vigente para el AT 2026 en el SII e incluirla en el artículo con fecha de vigencia.

---

### DEFECT #4 — CONDITIONAL — APV Modalidad A "15%": claim no verificado formalmente

**Severidad:** CONDITIONAL (bloquea publicación — claim tributario específico, regulatory_sensitivity=alta)
**Ubicación:** Blog file línea 102
**Descripción:** El artículo afirma que la Modalidad A de APV "genera un crédito directo del 15% sobre el monto cotizado". Este claim es probablemente correcto (Art. 42 bis LIR), pero está marcado como TODO:SOURCE C7 en el draft y no cita el artículo legal específico ni la instrucción SII del F22. Para un claim tributario en un artículo de `regulatory_sensitivity: alta`, "probablemente correcto" no es suficiente.
**NORMA_YMYL:** MUST #4 — fuente oficial explícita para cada regla crítica YMYL.
**Resolución (Bucket A — human):** Verificar en Art. 42 bis LIR (BCN) o en las instrucciones del F22 del SII que la tasa de crédito Modalidad A es efectivamente 15%. Agregar cita "(Art. 42 bis LIR)".

---

### DEFECT #5 — NOTE — UTA 2026 sin valor de referencia

**Severidad:** NOTE (subsumida en D2)
**Descripción:** El artículo explica que la UTA = 12 × UTM dic. del año tributario, sin dar el valor concreto para 2026. Correcto defensivamente pero incomplete junto con D2.
**Resolución:** Parte de la resolución de D2 (Gate 05 debe verificar UTA 2026 e incluirla en la tabla de tramos).

---

### DEFECT #6 — NOTE — Gate 05 obligatorio no ejecutado

**Severidad:** NOTE de proceso
**Descripción:** `requires_calculation: true`. Gate 05 (MathAuditAgent — ChatGPT) es obligatorio. Este artículo en particular requiere que Gate 05 complete prácticamente toda la sección de tramos (D2). Gate 05 es el prerequisito real para resolver D2, D3 y D5.

---

## Bucket C — Acción disponible esta sesión (D1)

**D1 puede resolverse esta sesión** (autorización humana requerida):

```
ANTES (línea 86 del blog file):
> **TODO:SOURCE**: la tabla completa de tramos en UTA y el valor de la UTA 2026 deben verificarse
> en el [SII](https://www.sii.cl/) antes de publicar. Los valores que aparezcan en la versión
> publicada de este artículo serán verificados por el MathAuditAgent.

DESPUÉS (reemplazar por):
> La tabla completa de tramos con los valores UTA vigentes para el año tributario en curso se
> encuentra en el [SII](https://www.sii.cl/). Verifica los valores antes de tu Operación Renta —
> la UTA cambia cada año tributario.
```

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

El artículo tiene la estructura conceptual correcta y la diferenciación IGC vs ISC bien explicada. La decisión editorial de excluir ganancias de capital está documentada. Las citas legales (BCN arts. 52–57 LIR) están presentes. No hay claims falsos detectados — la estrategia de no incluir valores no verificados es defensivamente correcta, pero deja la promesa central del artículo sin cumplir.

**Este artículo requiere el mayor trabajo de Gate 05 del sprint**: sin la tabla de tramos IGC en UTA, la tasa de retención de honorarios y el valor de la UTA 2026, el artículo no puede cumplir su promesa editorial. Gate 05 (ChatGPT) debe ser la primera acción antes de cualquier edición del blog file.

**Bloqueantes para pasar a PASS:**
1. D1 (Bucket C, esta sesión si autorizado): eliminar TODO:SOURCE del blog file.
2. Gate 05 (obligatorio): verificar tabla tramos IGC, UTA 2026, tasa honorarios, APV 15%.
3. D2 (Bucket A): incluir tabla de tramos completa con UTA 2026 y equivalencia en pesos.
4. D3 (Bucket A): incluir tasa de retención honorarios vigente.
5. D4 (Bucket A): citar Art. 42 bis LIR para el 15% APV Modalidad A.
6. Re-evaluar Gate 06 en sesión fresca.
