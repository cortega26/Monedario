# Gate 06 — Compliance Review: impuesto-global-complementario-chile

Status: CONDITIONAL — cotización previsional independiente vaga sin fuente; APV sin topes UF ni URL art. 42 bis LIR; contribuciones deducción sin instrucción SII; score 8,93/10 < 9,5; regulatory_sensitivity=alta requiere sign-off humano obligatorio
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza 06-compliance.md del 2026-05-05 (post-remediación anterior)

> **ALERTA regulatory_sensitivity=alta**: El IGC es un impuesto de renta con implicancias directas en el F22 anual del contribuyente. Claims incorrectos sobre tramos, créditos o tasas pueden llevar al contribuyente a calcular mal su impuesto o esperar una devolución que no existe. Sign-off humano obligatorio antes de Gate 07.

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/igc.md`
  - `docs/editorial/artifacts/igc/04-draft.md`
  - `docs/editorial/artifacts/igc/05-math-audit.md`
  - `src/data/blog/impuesto-global-complementario-chile.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones (puntos de atención post-2026-05-05)

| Punto de atención | Estado |
|---|---|
| BCN URL idNorma=8657 → idNorma=6368 (en frontmatter, cuerpo y footer) | ✓ RESUELTO — URL BCN correcto en las 3 ubicaciones |
| UTA 2026: $834.504 (= 12 × UTM dic 2025 $69.542) | ✓ RESUELTO — verificado por MathAuditAgent (SII) |
| Tramo exento: $11.265.804 (13,5 UTA) | ✓ RESUELTO — verificado por MathAuditAgent |
| Retención honorarios AT 2026: 15,25% | ✓ RESUELTO — insertada y verificada (SII) |
| Tabla progresiva hasta 40%: presente | ✓ RESUELTO — 7 tramos verificados por MathAuditAgent |
| APV "15% benefit" → eliminado; ahora conservador ("beneficio tributario sobre el monto cotizado") | ✓ RESUELTO — no afirma tasa sin verificar |
| Contribuciones deducción → condicional ("según instrucciones SII vigentes") | ✓ RESUELTO — no afirma deducción como regla cerrada |
| TODO:SOURCE visible en blog file eliminado | ✓ RESUELTO — no quedan marcadores de pipeline en el artículo publicable |
| Ganancias de capital excluidas explícitamente | ✓ RESUELTO — 3 lugares en el artículo (covers.limits, intro, sección dedicada) |
| Gate 05 ejecutado | ✓ RESUELTO — MathAuditAgent ChatGPT sesión fresca 2026-05-05 |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,0/10 | 3,150 | Tabla progresiva completa (exento a 40%) con UTA 2026 verificada. Tramo exento $11.265.804 presente. Retención honorarios 15,25% AT 2026 presente. Lead explica mecanismo IGC con claridad. Deducción: `articleLead.answer` no incluye el tramo exento en pesos directamente — el lector debe ir a la sección de tramos para obtener el número concreto. |
| Precisión + fuentes | 25% | 8,5/10 | 2,125 | BCN idNorma=6368 correcto en las 3 ubicaciones. LIR arts. 52–57 citados. UTA verificada. Tabla verificada. Penalización: (1) APV Modalidad A/B — topes en UF no cuantificados; sin URL específica al art. 42 bis LIR. (2) Contribuciones deducción arrendadores — condicional pero sin instrucción SII ni artículo LIR específico. (3) "Si cotizaste independiente, también aplica la cotización previsional" — claim vago sin norma citada. |
| Vigencia + calendario | 15% | 9,5/10 | 1,425 | Cut-off 2026-05-03; "AT 2026" explícito en múltiples secciones; UTA 2026 con valor verificado; nota de reajuste anual prominente; links SII y BCN vigentes. |
| Excepciones + cobertura | 15% | 8,5/10 | 1,275 | 4 perfiles cubiertos (asalariado, honorarios, mixto, pensionado). Créditos ISC, honorarios, APV, contribuciones tratados. Ganancias de capital excluidas explícitamente en 3 lugares. Penalización: (1) APV Modalidad A/B sin topes cuantificados en UF (la excepción operativa del beneficio, MUST #5). (2) Cotización previsional independiente sin condiciones ni base de cálculo. |
| Claridad + estructura | 10% | 9,5/10 | 0,950 | H2s claros; tabla progresiva bien presentada; tono correcto; ganancias de capital excluidas con nota clara. No quedan TODO:SOURCE visibles. Flujo artículo→sección coherente. |
| **TOTAL** | 100% | — | **8,93/10** | **Por debajo del umbral 9,5 — no PASS** |

---

## DEFECTS

**DEFECT #1 — MINOR — "Cotización previsional independiente" en sección honorarios: claim vago sin norma (NORMA_YMYL MUST #4)**

Ubicación: Sección "Rentas de honorarios y retención — crédito contra el IGC", párrafo referente a independientes.

El artículo incluye la afirmación "Si cotizaste independiente, también aplica la cotización previsional" sin especificar: (a) qué norma establece esta obligación (Ley 21.242 que instauró cotización progresiva obligatoria para independientes), (b) sobre qué base se calcula, (c) qué impacto tiene en el cálculo del IGC. En un artículo de `regulatory_sensitivity=alta` sobre el F22, una referencia a "cotización previsional" sin fuente ni cuantificación genera una expectativa que el lector no puede resolver con el contenido del artículo. NORMA_YMYL §2.2 prohíbe el patrón "Depende..." sin listar condiciones — análogo aquí: "también aplica" sin explicar a qué situaciones exactamente, en qué proporción y desde qué año tributario.

Resolution: Citar la Ley 21.242 (entrada en vigor progresiva de cotizaciones para independientes) e indicar brevemente la relación con el F22 AT 2026. O reformular como: "Los trabajadores independientes también están sujetos a cotizaciones previsionales sobre sus honorarios según la Ley 21.242 — consulta las instrucciones del F22 del año tributario correspondiente para el monto aplicable a tu situación."

---

**DEFECT #2 — MINOR — APV Modalidad A/B: topes en UF no cuantificados y sin URL art. 42 bis LIR (NORMA_YMYL MUST #4 + MUST #5)**

Ubicación: Sección "Créditos y beneficios tributarios — APV".

El artículo menciona el beneficio tributario del APV con lenguaje conservador post-remediación ("beneficio tributario sobre el monto cotizado, con topes expresados en UF") sin cuantificar los topes. La terminología "Modalidad A/B" es la denominación de mercado — el art. 42 bis LIR no necesariamente usa ese lenguaje. Sin la URL BCN del artículo citado, el lector no puede verificar la fuente legal del beneficio en el año tributario en curso. Los topes del APV son la excepción operativa más relevante del beneficio: NORMA_YMYL MUST #5 exige cubrir excepciones relevantes. El BCN idNorma=6368 ya está en `officialSources` (referencia al art. 52 de la LIR) — el art. 42 bis está en el mismo instrumento y puede ser enlazado directamente.

Resolution: (1) Verificar art. 42 bis LIR en BCN (idNorma=6368) y confirmar que usa el lenguaje "Modalidad A/B". (2) Cuantificar los topes en UF vigentes para AT 2026 con fecha de vigencia. (3) Agregar referencia explícita al art. 42 bis LIR (mismo idNorma=6368 ya presente, añadir número de artículo).

---

**DEFECT #3 — MINOR — Contribuciones deducción para arrendadores: sin instrucción SII ni artículo LIR (NORMA_YMYL MUST #4)**

Ubicación: Sección "Créditos y beneficios tributarios — Contribuciones de bienes raíces".

El artículo dice "las contribuciones pagadas pueden ser consideradas como gasto de la renta de arrendamiento según las instrucciones SII del año tributario correspondiente." El lenguaje condicional es correcto, pero "según instrucciones SII" sin citar la instrucción específica o el artículo LIR aplicable es orientación incompleta para un contribuyente con inmuebles arrendados. La deducibilidad de contribuciones como gasto puede impactar materialmente el IGC de un contribuyente con rentas de capital. Para contenido de `regulatory_sensitivity=alta`, un claim sobre gastos tributarios requiere fuente trazable.

Resolution: Verificar el artículo LIR aplicable (posiblemente Art. 31 N°2 para gastos en rentas de primera categoría, o el régimen específico de bienes raíces) e incluir la cita. Si no se puede cerrar la fuente específica, reformular como: "Las contribuciones pagadas pueden ser deducibles como gasto en rentas de arrendamiento — consulta las instrucciones del F22 del año tributario correspondiente con un contador para tu situación específica."

---

**DEFECT #4 — PROCESS (OBLIGATORIO) — Regulatory_sensitivity=alta: sign-off humano obligatorio pre-Gate 07**

Ubicación: Pipeline — Gate 07.

El artículo tiene `regulatory_sensitivity: alta` per la 04-draft. Por INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES, el sign-off no puede ser marcado por agente — debe ser un revisor humano quien verifique que los tramos IGC, la UTA 2026 ($834.504), la tasa de retención 15,25% y los créditos documentados son vigentes al momento de activar `draft: false` y firme el 07-publish-packet.md.

Resolution: Un revisor humano debe: (1) verificar que la tabla de tramos IGC y la UTA 2026 ($834.504) son vigentes en SII, (2) verificar que la retención de honorarios 15,25% es la tasa AT 2026 vigente, (3) firmar el 07-publish-packet.md.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE / ERROR del math audit | Resolución en blog file | Estado |
|---|---|---|
| VERIFIED: UTA 2026 $834.504 | Presente con valor verificado ✓ | RESUELTO |
| VERIFIED: Tramo exento $11.265.804 (13,5 UTA) | Presente con valor verificado ✓ | RESUELTO |
| VERIFIED: Tabla progresiva hasta 40% — 7 tramos | Presente con fuente SII ✓ | RESUELTO |
| VERIFIED: Retención honorarios 15,25% AT 2026 | Presente con fuente SII ✓ | RESUELTO |
| ERROR: BCN URL idNorma=8657 → idNorma=6368 | Corregido en frontmatter, cuerpo y footer | RESUELTO |
| TODO:SOURCE: APV "15%" Modalidad A | Eliminado — "beneficio tributario directo" (conservador) | RESUELTO EN CUERPO |
| TODO:SOURCE: APV topes en UF sin cuantificar | No cuantificados — topes siguen sin valor | PENDIENTE → DEFECT #2 |
| TODO:SOURCE: Contribuciones deducción sin instrucción SII | Sin cita específica — sigue sin fuente | PENDIENTE → DEFECT #3 |
| NUEVO: Cotización previsional independiente | No detectado en math audit — identificado esta auditoría | NUEVO → DEFECT #1 |

**TODO:SOURCE activos en blog file: 0 (pero 3 claims sin fuente específica permanecen en cuerpo)**

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
| Gate 07 Publish Packet | **Solo humano** | — | ⬜ **Pendiente — regulatory_sensitivity=alta: sign-off humano obligatorio** |

SoD: CONFORME. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido. Sign-off humano obligatorio en Gate 07 documentado.

---

## Veredicto final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió los defectos críticos del ciclo anterior: URL BCN corregida de idNorma=8657 a idNorma=6368 en las tres ubicaciones; tabla de tramos IGC completa con UTA 2026 ($834.504) verificada por MathAuditAgent; tramo exento $11.265.804 insertado; retención honorarios 15,25% AT 2026 verificada e insertada; APV "15%" eliminado con lenguaje conservador; contribuciones deducción suavizada a condicional; ganancias de capital excluidas explícitamente en 3 lugares; todos los TODO:SOURCE de pipeline eliminados del blog file; Gate 05 ejecutado.

Este artículo es el de mayor score del sprint (8,93/10). No quedan TODO:SOURCE activos ni errores de datos en el blog file.

El artículo no puede alcanzar PASS por:
1. **DEFECT #1 (MINOR)**: "Si cotizaste independiente, también aplica la cotización previsional" — claim vago sin norma citada ni cuantificación; detectado esta sesión (MUST #4).
2. **DEFECT #2 (MINOR)**: APV Modalidad A/B sin topes cuantificados en UF ni URL específica al art. 42 bis LIR (MUST #4 + MUST #5).
3. **DEFECT #3 (MINOR)**: Contribuciones deducción arrendadores sin instrucción SII ni artículo LIR (MUST #4).
4. **DEFECT #4 (PROCESS)**: Sign-off humano obligatorio por regulatory_sensitivity=alta.
5. Score NORMA_YMYL 8,93/10 < 9,5.

**Ruta a PASS:**
1. DraftAgent: citar Ley 21.242 o reformular para cotización previsional independiente (DEFECT #1).
2. DraftAgent: verificar art. 42 bis LIR y cuantificar topes APV en UF (DEFECT #2).
3. DraftAgent: agregar instrucción SII o artículo LIR para contribuciones deducción (DEFECT #3).
4. Nueva ronda Gate 06 en sesión fresca (DEFECTS #1–#3 requieren re-auditoría).
5. Sign-off humano en Gate 07 (DEFECT #4 — obligatorio, no delegable a agente).

> **Alerta `regulatory_sensitivity: alta`**: El IGC es un impuesto de renta con implicancias directas en el F22. Claims incorrectos sobre tramos, créditos o tasas pueden llevar al contribuyente a calcular mal su impuesto o esperar una devolución que no existe.
