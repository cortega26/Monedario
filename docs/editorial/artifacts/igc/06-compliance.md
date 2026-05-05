# Gate 06 — Compliance Review: impuesto-global-complementario-chile

Status: CONDITIONAL — APV Modalidad A/B sin URL art. 42 bis LIR, contribuciones deducción sin instrucción SII específica, score 9,13/10 < 9,5; regulatory_sensitivity=alta requiere sign-off humano obligatorio
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha de revisión: 2026-05-05
Reemplaza: 06-compliance.md del 2026-05-04 (pre-remediación)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/igc.md`
  - `docs/editorial/artifacts/igc/04-draft.md`
  - `docs/editorial/artifacts/igc/05-math-audit.md`
  - `src/data/blog/impuesto-global-complementario-chile.md` (versión post-remediación 2026-05-05)

> **ALERTA regulatory_sensitivity=alta**: El IGC es un impuesto de renta con implicancias directas en el F22 anual del contribuyente. Claims incorrectos sobre tramos, créditos o tasas pueden llevar al contribuyente a calcular mal su impuesto o esperar una devolución que no existe. Sign-off humano obligatorio antes de Gate 07.

---

## Verificación de remediaciones del 2026-05-05

| Punto de atención | Estado |
|---|---|
| BCN URL idNorma=8657 → idNorma=6368 (en frontmatter, cuerpo y footer) | ✓ RESUELTO — URL BCN correcto en las 3 ubicaciones |
| UTA 2026: $834.504 (= 12 × UTM dic 2025 $69.542) | ✓ RESUELTO — verificado por MathAuditAgent (SII) |
| Tramo exento: $11.265.804 (13,5 UTA) | ✓ RESUELTO — verificado por MathAuditAgent |
| Retención honorarios AT 2026: 15,25% | ✓ RESUELTO — insertada y verificada (SII) |
| Tabla progresiva hasta 40%: presente | ✓ RESUELTO — verificada por MathAuditAgent |
| APV "15% benefit" → eliminado; ahora conservador ("beneficio tributario sobre el monto cotizado") | ✓ RESUELTO — no afirma tasa sin verificar |
| Contribuciones deducción → condicional ("según instrucciones SII vigentes") | ✓ RESUELTO — no afirma deducción como regla cerrada |
| TODO:SOURCE visible en blog file eliminado | ✓ RESUELTO — no quedan marcadores de pipeline en el artículo publicable |
| Ganancias de capital excluidas explícitamente (Gate G5) | ✓ RESUELTO — 3 lugares en el artículo (covers.limits, intro, sección dedicada) |
| Gate 05 ejecutado | ✓ RESUELTO — MathAuditAgent ChatGPT sesión 2026-05-05 |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,0/10 | 3,15/3,50 | Tabla progresiva completa (exento a 40%) con UTA 2026 verificada. Tramo exento $11.265.804 presente. Retención honorarios 15,25% AT 2026 presente. Lead explica mecanismo IGC con claridad. Penalización mínima: `articleLead.answer` no incluye el tramo exento en pesos directamente — el lector debe ir a la sección de tramos para obtener el número. |
| Precisión + fuentes | 25% | 9,0/10 | 2,25/2,50 | BCN idNorma=6368 correcto en las 3 ubicaciones. LIR arts. 52–57 citados. UTA verificada por MathAuditAgent. Tabla verificada. Penalización: (1) APV Modalidad A/B — topes en UF no cuantificados; "Modalidad A/B" sin URL art. 42 bis LIR. (2) Contribuciones deducción arrendadores — condicional pero sin instrucción SII ni artículo LIR citado. |
| Vigencia + calendario | 15% | 9,5/10 | 1,43/1,50 | Cut-off 2026-05-03; "AT 2026" explícito; UTA 2026 con valor verificado; nota de reajuste anual presente. |
| Excepciones + cobertura | 15% | 9,0/10 | 1,35/1,50 | 4 perfiles cubiertos; créditos ISC, honorarios, APV, contribuciones tratados. Ganancias de capital excluidas explícitamente en 3 lugares. Penalización: APV Modalidad A/B sin topes cuantificados en UF. |
| Claridad + estructura | 10% | 9,5/10 | 0,95/1,00 | H2s claros; tabla progresiva bien presentada; tono correcto. No quedan TODO:SOURCE visibles. Ganancias de capital excluidas con nota clara. |
| **TOTAL** | 100% | — | **9,13/10** | **Por debajo del umbral 9,5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — MINOR — APV Modalidad A/B: topes en UF no cuantificados y sin URL art. 42 bis LIR

**Severidad:** MINOR
**Ubicación:** Sección "Créditos y beneficios tributarios — APV".
**Descripción:** El artículo menciona "beneficio tributario sobre el monto cotizado, con topes expresados en UF" (conservative post-remediación) pero no cuantifica los topes. Además, la terminología "Modalidad A/B" no está formalmente verificada contra el texto del art. 42 bis LIR — es la denominación de mercado. La remediación fue conservadora y correcta (eliminar el "15%" no verificado), pero el TODO:SOURCE no quedó formalmente cerrado.
**NORMA_YMYL:** MUST #4 (fuente oficial con link para regla crítica) y MUST #5 (excepciones relevantes — los topes son la excepción operativa del beneficio).
**Resolución:** (1) Verificar art. 42 bis LIR en BCN (idNorma=6368) y confirmar que usa el lenguaje "Modalidad A/B". (2) Cuantificar los topes en UF actuales e incluirlos con fecha. (3) Agregar URL al art. 42 bis LIR.

---

### DEFECT #2 — MINOR — Contribuciones deducción para arrendadores: sin instrucción SII ni artículo LIR

**Severidad:** MINOR
**Ubicación:** Sección "Créditos y beneficios tributarios — Contribuciones".
**Descripción:** El artículo dice "las contribuciones pagadas pueden ser consideradas como gasto de la renta de arrendamiento según las instrucciones SII del año tributario correspondiente." El lenguaje condicional es correcto, pero no cita qué instrucción SII ni qué artículo LIR respalda esta regla. Para un contribuyente con inmuebles arrendados, saber si sus contribuciones son gasto en el F22 puede impactar miles de pesos en su impuesto. "Según instrucciones SII" sin citar la instrucción es una orientación incompleta.
**NORMA_YMYL:** MUST #4 (fuente oficial para regla crítica).
**Resolución:** Verificar el artículo LIR aplicable (posiblemente Art. 31 N°2 o Art. 17 para rentas de bienes raíces) e incluir la cita. Si no se puede cerrar la fuente, reencuadrar como: "Consulta con el SII o un contador el tratamiento específico para el año tributario en curso."

---

### DEFECT #3 — PROCESS (OBLIGATORIO) — Regulatory_sensitivity=alta: sign-off humano obligatorio pre-Gate 07

**Severidad:** PROCESS (bloquea Gate 07 independientemente del contenido)
**Descripción:** El artículo tiene `regulatory_sensitivity: alta` per la 04-draft. Por INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES, el sign-off no puede ser marcado por agente en el 07-publish-packet.md — debe ser un revisor humano quien apruebe explícitamente, verificando que los valores del F22 AT 2026 (tramos, UTA, retención) sean vigentes al momento de publicar.
**Resolución:** Un revisor humano debe auditar la tabla de tramos, la UTA 2026 y la retención 15,25% antes de activar `draft: false` y firmar el 07-publish-packet.md.

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

La remediación del 2026-05-05 resolvió los defectos críticos del Gate 06 anterior: URL BCN corregida de idNorma=8657 a idNorma=6368 en las tres ubicaciones; tabla de tramos IGC completa con UTA 2026 ($834.504) verificada; tramo exento $11.265.804 insertado; retención honorarios 15,25% AT 2026 verificada e insertada; APV "15%" eliminado con lenguaje conservador; contribuciones deducción suavizada a condicional; ganancias de capital excluidas explícitamente en 3 lugares; todos los TODO:SOURCE de pipeline eliminados del blog file; Gate 05 ejecutado.

**Razones del CONDITIONAL (no PASS):**
1. DEFECT #1: APV Modalidad A/B sin topes cuantificados en UF ni URL art. 42 bis LIR.
2. DEFECT #2: Contribuciones deducción arrendadores sin instrucción SII ni artículo LIR específico.
3. DEFECT #3 (PROCESS): Sign-off humano obligatorio por regulatory_sensitivity=alta.
4. Score NORMA_YMYL 9,13/10 < 9,5.

Este artículo es el más cercano al PASS del sprint (9,13/10). Los dos defectos menores residuales son específicos y acotados — una ronda DraftAgent enfocada en APV topes + artículo LIR para contribuciones podría alcanzar 9,5+.

**Ruta a PASS:**
- Verificar art. 42 bis LIR y cuantificar topes APV en UF (DEFECT #1).
- Agregar instrucción SII o artículo LIR para contribuciones deducción (DEFECT #2).
- Obtener sign-off humano (DEFECT #3 — obligatorio, no delegable).
- **Nueva ronda de DraftAgent requerida + sign-off humano antes de Gate 07.**

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
