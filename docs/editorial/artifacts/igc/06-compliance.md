# Gate 06 — Compliance Review: impuesto-global-complementario-chile

Status: CONDITIONAL
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza ciclo anterior (post-remediación DraftAgent ciclo 2, 2026-05-06)

> **ALERTA regulatory_sensitivity=alta**: Artículo sobre impuesto de renta con implicancias directas en el F22 anual del contribuyente. Claims incorrectos sobre tramos, créditos o tasas pueden llevar al contribuyente a calcular mal su impuesto o esperar una devolución que no existe. Sign-off humano obligatorio antes de activar draft:false.

Archivos revisados:
  - docs/editorial/NORMA_YMYL.md
  - docs/editorial/artifacts/briefs/igc.md
  - docs/editorial/artifacts/igc/04-draft.md
  - docs/editorial/artifacts/igc/05-math-audit.md
  - src/data/blog/impuesto-global-complementario-chile.md

---

## Verificación de remediaciones (puntos de atención post-2026-05-06, ciclo 1)

| Punto de atención | Estado |
|---|---|
| DEFECT #1 ciclo anterior: cotización previsional independiente sin norma citada | ✓ RESUELTO — "según la Ley 21.242 (entrada en vigor progresiva desde 2019) — revisa el F22 del SII o consulta a un contador para el monto aplicable a tu año tributario." |
| DEFECT #2 ciclo anterior: APV Modalidad A/B sin URL art. 42 bis LIR | ✓ PARCIALMENTE RESUELTO — URL BCN idNorma=6368 presente en dos ubicaciones en la sección APV; topes en UF siguen deferidos al SII (ver DEFECT #1 de este ciclo) |
| DEFECT #3 ciclo anterior: contribuciones deducción sin instrucción SII | ✓ PARCIALMENTE RESUELTO — "Consulta las instrucciones del F22 del SII o a un contador para confirmar si aplica a tu situación"; sin artículo LIR específico (ver DEFECT #2 de este ciclo) |
| BCN idNorma=6368 en frontmatter, cuerpo y footer | ✓ RESUELTO — corregido desde ciclo anterior |
| UTA 2026 $834.504 y tramo exento $11.265.804 | ✓ RESUELTO — verificados por MathAuditAgent |
| Retención honorarios 15,25% AT 2026 | ✓ RESUELTO — verificada e insertada |
| APV "15% crédito directo" eliminado | ✓ RESUELTO — "beneficio tributario sobre el monto cotizado" (conservador) |
| TODO:SOURCE visibles en blog file | ✓ RESUELTO — ninguno activo |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9.0 | 3.150 | articleLead.answer concreto; covers claramente delimitados (ganancias de capital explícitamente excluidas); UTA 2026 $834.504 y tramo exento $11.265.804 presentes; retención 15,25% presente; 4 perfiles contribuyentes cubren el espacio del query. Deducción: tramos completos deferidos al SII — el lector obtiene el primer tramo exento y el UTA pero debe salir al SII para los 7 tramos |
| Precisión + fuentes | 25% | 9.0 | 2.250 | BCN idNorma=6368 correcto en 3 ubicaciones; LIR arts. 52–57 citados; UTA verificada; retención verificada; Ley 21.242 añadida para cotización independiente; URL art. 42 bis BCN presente en APV. Deducción menor: APV topes en UF sin valor numérico (deferidos); contribuciones sin artículo LIR |
| Vigencia + calendario | 15% | 9.5 | 1.425 | "vigente al 2026-05-03" en apertura y cierre; "AT 2026" explícito en múltiples secciones; nota de reajuste anual UTA prominente; links SII y BCN vigentes |
| Excepciones + cobertura | 15% | 9.0 | 1.350 | 4 perfiles cubiertos; ISC/honorarios/APV/contribuciones como créditos; ganancias de capital excluidas en 3 lugares; cotización independiente Ley 21.242 citada con instrucción F22; APV Modalidad A/B distinguidas con URL art. 42 bis. Deducción: topes APV en UF no cuantificados |
| Claridad + estructura | 10% | 9.5 | 0.950 | H2 sigue brief; leads claros; ganancias de capital excluidas con nota de scope; TODO:SOURCE eliminados; flujo artículo→calculadora coherente |
| **TOTAL** | 100% | — | **9.175** | Por debajo del umbral 9.5 — CONDITIONAL |

Score mejoró de 8.93 (ciclo anterior) a 9.175 (este ciclo).

---

## DEFECTS

**DEFECT #1 — WARNING — APV Modalidad A/B: topes en UF no cuantificados (NORMA_YMYL MUST #5)**

Ubicación: Sección "Créditos y deducciones disponibles — APV Modalidad A vs Modalidad B"
Descripción: El ciclo 2 agrega la URL al art. 42 bis BCN (idNorma=6368) en dos ubicaciones dentro de la sección APV — mejora significativa respecto al ciclo anterior. Sin embargo, los topes operativos (50 UF mensuales / 600 UF anuales, confirmados por MathAuditAgent como vigentes según art. 42 bis) siguen sin cuantificarse en el artículo. La sección dice "con topes establecidos en el art. 42 bis de la LIR — verifica los topes vigentes en el SII". Para un contribuyente que evalúa el APV como herramienta tributaria, los topes son la excepción operativa más relevante del beneficio. NORMA_YMYL MUST #5 exige cubrir excepciones relevantes. El MathAuditAgent los verificó — no es un TODO:SOURCE sin cerrar, sino un valor auditable.
Resolution: El revisor humano en Gate 07 puede resolver con una línea: "hasta 50 UF mensuales o 600 UF anuales (art. 42 bis LIR — verifica actualizaciones en SII para el año tributario correspondiente)." Si se confirma que 50 UF/600 UF son los topes vigentes AT 2026, incluirlos elevaría el score de precisión y cobertura.

**DEFECT #2 — NOTE — Contribuciones deducción arrendadores: sin artículo LIR (NORMA_YMYL MUST #4)**

Ubicación: Sección "Créditos y deducciones disponibles — Contribuciones de bienes raíces"
Descripción: El ciclo 2 mejora el lenguaje: "las condiciones exactas dependen del régimen tributario y del año tributario. Consulta las instrucciones del F22 del SII o a un contador para confirmar si aplica a tu situación." Esta formulación es más accionable que el ciclo anterior. Sin embargo, sigue sin citar el artículo LIR que establece la deducibilidad (posiblemente Art. 31 o régimen específico de bienes raíces). Para regulatory_sensitivity=alta, un claim sobre gastos tributarios deducibles en el IGC sin fuente legal trazable es una limitación menor pero documentable. El lenguaje actual protege al lector de confiar en el artículo sin consultar a un experto — esto es correcto para YMYL.
Resolution (para Gate 07, a criterio del equipo editorial): Verificar el artículo LIR aplicable e incorporarlo si la fuente se cierra. De lo contrario, el lenguaje actual con deferral explícito al F22/contador es aceptable como política editorial para este artículo.

**DEFECT #3 — PROCESS (OBLIGATORIO) — Regulatory_sensitivity=alta: sign-off humano obligatorio pre-publicación**

Ubicación: Pipeline — Gate 07
Descripción: `regulatory_sensitivity: alta` (04-draft). El IGC es el artículo de mayor complejidad tributaria del sprint — tramos progresivos, múltiples créditos, F22. Por INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES, Gate 07 no puede ejecutarse sin aprobación humana explícita. Los valores auditados por MathAuditAgent (UTA $834.504, tramo exento $11.265.804, retención 15,25%) fueron verificados al 2026-05-05 — el humano debe re-verificar vigencia al momento de activar draft:false.
Resolution: Revisor humano: (1) verifica UTA 2026 y tabla de tramos en SII, (2) verifica retención honorarios 15,25% AT 2026 en SII, (3) resuelve DEFECT #1 (topes APV en UF — una línea de edición si confirma 50 UF/600 UF), (4) firma 07-publish-packet.md.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE / ERROR del math audit | Resolución en blog file | Estado |
|---|---|---|
| ERROR: BCN URL idNorma=8657 (LIR incorrecta) | Corregido a idNorma=6368 en frontmatter, cuerpo y footer | ✓ RESUELTO |
| VERIFIED: UTA 2026 $834.504 | Presente con valor verificado | ✓ RESUELTO |
| VERIFIED: Tramo exento $11.265.804 (13,5 UTA) | Presente con valor verificado | ✓ RESUELTO |
| VERIFIED: Tabla 7 tramos hasta 40% | Presente con fuente SII ✓ | ✓ RESUELTO |
| VERIFIED: Retención honorarios 15,25% AT 2026 | Presente con fuente SII ✓ | ✓ RESUELTO |
| TODO:SOURCE: APV "15%" Modalidad A sin fuente | Eliminado — "beneficio tributario directo" + URL art. 42 bis | ✓ RESUELTO |
| TODO:SOURCE: APV topes en UF no cuantificados | Deferidos al SII; URL art. 42 bis presente | ✓ ACEPTABLE (editorial: deferral) → DEFECT #1 |
| TODO:SOURCE: Contribuciones deducción sin instrucción SII | Deferido a F22 del SII y contador | ✓ ACEPTABLE (editorial: deferral) → DEFECT #2 |
| DEFECT #1 ciclo anterior: cotización previsional independiente sin norma | Ley 21.242 + instrucción F22/contador agregadas | ✓ RESUELTO |

**TODO:SOURCE activos en blog file: 0**

---

## Declaración de Separación de Deberes (SoD)

| Stage | Rol | Agente / Sesión | Estado |
|---|---|---|---|
| Gate 01 Brief | Autor | Humano | ✓ |
| Gate 02–03 Research / Outline | DraftAgent | Claude Code — Sprint 2B | ✓ |
| Gate 04 Draft | DraftAgent | Claude Code — Sprint 2B | ✓ |
| Remediación (ciclo 1) | DraftAgent | Claude Code — sesión fresca 2026-05-05 | ✓ |
| Remediación (ciclo 2) | DraftAgent | Claude Code — sesión fresca 2026-05-06 | ✓ |
| Gate 05 Math Audit | MathAuditAgent | ChatGPT — sesión fresca 2026-05-05 | ✓ |
| Gate 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-06 (esta sesión) | ✓ SoD cumplido |
| Gate 07 Publish Packet | **Solo humano** | — | ⬜ **OBLIGATORIO — regulatory_sensitivity=alta** |

---

## Veredicto final

**CONDITIONAL**

Justificación: El defecto bloqueante del ciclo anterior (cotización previsional independiente sin norma) está resuelto — Ley 21.242 citada con instrucción F22/contador. La URL del art. 42 bis BCN está ahora presente en la sección APV. El lenguaje de contribuciones deducción es más accionable. No hay TODO:SOURCE activos ni afirmaciones incorrectas. Todos los valores MathAuditAgent verificados están presentes.

Score mejoró de 8.93 (ciclo anterior) a 9.175 (este ciclo).

Defectos pendientes antes de Gate 07:
1. **DEFECT #1** (WARNING): APV topes en UF no cuantificados (50 UF/600 UF verificados por MathAuditAgent). Una línea de edición que el revisor humano puede resolver al confirmar vigencia AT 2026 en SII.
2. **DEFECT #2** (NOTE): Contribuciones deducción arrendadores sin artículo LIR — deferral al F22/contador aceptable como política editorial; a criterio del equipo.
3. **DEFECT #3** (PROCESS, OBLIGATORIO): Sign-off humano con re-verificación de UTA, tramos y retención en SII al momento de publicar. No negociable para regulatory_sensitivity=alta.

El artículo puede avanzar a Gate 07 con el entendido de que DEFECT #1 debe resolverse como parte del proceso de sign-off humano — el valor auditable (50 UF/600 UF) está disponible de la auditoría Gate 05. No requiere nueva ronda de ComplianceAgent ni DraftAgent.
