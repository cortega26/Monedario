# Gate 06 — Compliance Review: contribuciones-bienes-raices-chile

Status: CONDITIONAL — score NORMA_YMYL 8.23/10 < 9.5; gap entre promesa editorial y contenido disponible; no hay errores factuales activos
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza 06-compliance.md del 2026-05-05 (post-remediación anterior)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/contribuciones-bienes-raices.md`
  - `docs/editorial/artifacts/contribuciones-bienes-raices/04-draft.md`
  - `docs/editorial/artifacts/contribuciones-bienes-raices/05-math-audit.md`
  - `src/data/blog/contribuciones-bienes-raices-chile.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones (puntos de atención post-2026-05-05)

| Punto de atención | Estado |
|---|---|
| ERROR: Apertura "toda persona con propiedad paga" → suavizado | ✓ RESUELTO — "Si tienes una propiedad en Chile, **puede** corresponder el pago... muchos propietarios de primera vivienda tienen exención total o parcial sin saberlo — conviene verificar en el SII" |
| Tasas 1,2%/1,0% eliminadas (sin fuente SII cerrada) | ✓ RESUELTO — no aparecen en el blog file; artículo reformulado como guía procedimental |
| Calendario TGR 2026 actualizado a fechas exactas | ✓ RESUELTO — "30 de abril, 30 de junio, 30 de septiembre y 30 de noviembre" verificado por MathAuditAgent |
| DFL-2 → Decreto 1101: 140 m², personas naturales, máx 2 propiedades | ✓ RESUELTO — condiciones verificadas presentes en el cuerpo |
| Deducibilidad F22 suavizada a condicional | ✓ RESUELTO — "pueden ser consideradas gasto tributario... Las condiciones exactas dependen de las instrucciones SII vigentes" |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 7.5/10 | 2.625 | Apertura corregida. Calendario TGR verificado y útil. Guía procedimental (canales de pago, reclamo de avalúo, documentos) valiosa. Deducción MATERIAL: la query ancla "cómo calcular contribuciones" no tiene respuesta concreta — ninguna tasa. NORMA_YMYL MUST #1 parcialmente incumplido. El artículo dirige al SII sin dar ningún valor. |
| Precisión + fuentes | 25% | 8.5/10 | 2.125 | Sin tasas no verificadas (eliminadas correctamente). Calendario TGR verificado. Decreto 1101 correcto. F22 deducibilidad condicional. Apertura correcta. Deducción: (1) DFL-2 (Decreto 1101) sin URL BCN (i=16842). (2) "En general no corresponde deducir" para habitante principal — vago y no citado. |
| Vigencia + calendario | 15% | 9.5/10 | 1.425 | Fechas exactas TGR 2026 verificadas. `validAsOf: 2026-05-03`. Disclaimers de actualización prominentes en header y footer. |
| Excepciones + cobertura | 15% | 8.5/10 | 1.275 | Primera vivienda, DFL-2 (Decreto 1101), adultos mayores mencionados con deferred a SII. Mora y consecuencias cubiertos. Reclamo de avalúo cubierto. Deducción: topes de avalúo para exenciones no provistos (no verificados — deferrido a SII). |
| Claridad + estructura | 10% | 8.0/10 | 0.800 | H2 clara. Canales de pago listados. Tono educativo. Deducción: `articleLead.covers` ítem 1 "Cómo se calcula el monto según el avalúo fiscal y la tasa legal" promete cálculo con tasa — el artículo no provee ninguna tasa; coherencia covers↔cuerpo rota. |
| **TOTAL** | 100% | — | **8.25/10** | **Por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

**DEFECT #1 — MEDIUM — NORMA_YMYL MUST #1 parcialmente incumplido + covers incoherente (MUST #2 + MUST #8)**

Ubicación: (a) Sección "¿Cómo se calcula el monto?"; (b) Frontmatter `articleLead.covers` ítem 1.

(a) La sección de cálculo dice: "La tasa exacta que aplica depende de la clasificación de tu propiedad y del régimen tributario correspondiente. La tasa vigente se consulta directamente en el SII." Esto es un redirect sin respuesta concreta. NORMA_YMYL MUST #1 exige "una respuesta concreta (número/regla/criterio) en la primera sección útil." Para la query "¿cómo calcular mis contribuciones?" el lector recibe zero. NORMA_YMYL §2.2 también prohíbe "Depende..." sin listar condiciones (la sección dice "depende de la clasificación" sin explicar las clasificaciones relevantes).

(b) El covers ítem 1 promete "Cómo se calcula el monto según el avalúo fiscal y la tasa legal" — pero el artículo no provee la tasa legal. El covers crea una expectativa que el cuerpo no cumple: NORMA_YMYL MUST #8 (Coherencia interna).

Nota: La decisión de eliminar las tasas no verificadas fue CORRECTA (publicar tasas incorrectas en un artículo de impuestos es el riesgo más alto). El defecto no es la decisión editorial — es que el artículo y su covers no fueron alineados a la nueva promesa reducida.

Resolution — Opción A (preferida): Verificar las tasas vigentes directamente en el portal SII, reincorporarlas con fuente, fecha de vigencia y advertencia "sujeto a actualización — verifica en SII antes de calcular." Esto resuelve simultáneamente covers y cuerpo.

Resolution — Opción B (conservadora): Actualizar `articleLead.covers` ítem 1 a "Qué es el avalúo fiscal y cómo consultar tu monto en el SII" para alinear la promesa con el contenido real. El artículo sigue siendo inferior en utilidad pero elimina la incoherencia.

---

**DEFECT #2 — MINOR — Decreto 1101 (DFL-2) sin URL BCN (NORMA_YMYL MUST #4)**

Ubicación: Sección "Exenciones — DFL-2 — Vivienda económica".

El artículo referencia "Decreto 1101" con las condiciones verificadas (140 m², personas naturales, máx dos propiedades) pero sin enlazar al texto legal en BCN. El math audit confirmó `decreto 1101, i=16842` en BCN. Adicionalmente, el header de la sección usa el término "DFL-2" (nombre histórico) sin explicar que el instrumento legal vigente es el Decreto 1101 — esto puede confundir a lectores que busquen la fuente legal.

Resolution: (1) Convertir "Decreto 1101" en enlace BCN con el `i=16842` correspondiente. (2) Aclarar brevemente la relación: "conocido como DFL-2 o vivienda económica, actualmente regido por el Decreto 1101."

---

**DEFECT #3 — MINOR — "En general no corresponde deducir" para habitante principal: vago y sin fuente (NORMA_YMYL MUST #4)**

Ubicación: Sección "Contribuciones y F22 — cuándo son gasto deducible", segundo párrafo.

El artículo afirma: "Si habitas tu propiedad como vivienda principal, en general no corresponde deducir las contribuciones como gasto en el F22." El calificador "en general" introduce una excepción sin explicarla. La deducibilidad para arrendadores es condicional (correctamente softened), pero la no-deducibilidad para habitante principal se presenta como "en general" sin citar la norma SII que lo sustenta.

Resolution: Eliminar "en general" y citar la instrucción SII o artículo LIR aplicable, o bien reformular: "Si habitas tu propiedad como vivienda principal, las contribuciones habitualmente no son gasto deducible en el F22 — consulta las instrucciones SII del año tributario correspondiente para tu situación específica."

---

**DEFECT #4 — NOTE — Exenciones primera vivienda y adultos mayores sin topes de avalúo**

Ubicación: Sección "Exenciones".

Las exenciones se describen sin los topes de avalúo que definen la elegibilidad, deferidas al SII. Esto es editorialmente correcto dado que los topes son TODO:SOURCE no verificados, pero el lector no puede estimar si califica antes de ingresar al SII. No bloquea publicación condicional.

Resolution (opcional): Verificar los topes de avalúo vigentes en SII e incluirlos con fecha y fuente. Aumentaría significativamente el score de respuesta ancla.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE / ERROR del math audit | Resolución en blog file | Estado |
|---|---|---|
| ERROR: "Toda persona con propiedad paga" | Corregido a "puede corresponder el pago" | RESUELTO |
| TODO:SOURCE: Tasa general ~1,2% sin verificar | Eliminada — artículo no menciona ninguna tasa | RESUELTO (por omisión) |
| TODO:SOURCE: Tasa DFL-2 ~1,0% sin verificar | Eliminada — artículo no menciona ninguna tasa | RESUELTO (por omisión) |
| VERIFIED: Calendario TGR 2026 (30 abril, 30 junio, 30 sept, 30 nov) | Insertado con fechas exactas | RESUELTO |
| TODO:SOURCE: Exención primera vivienda — topes | Deferida al SII | ACEPTABLE PARA PUBLICACIÓN CONDICIONAL |
| TODO:SOURCE: Exención adultos mayores — condiciones | Deferida al SII | ACEPTABLE PARA PUBLICACIÓN CONDICIONAL |
| TODO:SOURCE: Deducibilidad F22 arrendadores | Suavizada a condicional con deferred al SII | ACEPTABLE PARA PUBLICACIÓN CONDICIONAL |

**TODO:SOURCE activos en blog file: 0**

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

SoD: CONFORME. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido.

---

## Veredicto final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió los defectos de alta severidad del ciclo anterior: tasas no verificadas eliminadas, calendario TGR 2026 confirmado con fechas exactas, DFL-2 referenciado correctamente al Decreto 1101 con condiciones verificadas, F22 deducibilidad suavizada a condicional, apertura reformulada. No quedan claims falsos ni marcadores TODO:SOURCE en el blog file.

El artículo no puede alcanzar PASS por:
1. **DEFECT #1 (MEDIUM)**: La sección de cálculo no provee ninguna tasa y el covers promete calcular "según el avalúo fiscal y la tasa legal" — incoherencia covers↔cuerpo + MUST #1 parcialmente incumplido.
2. **DEFECT #2 (MINOR)**: Decreto 1101 sin URL BCN y sin aclaración de relación con "DFL-2".
3. **DEFECT #3 (MINOR)**: "En general no corresponde deducir" para habitante principal — vago y sin fuente.
4. Score NORMA_YMYL 8.25/10 < 9.5.

**Observación sobre la decisión editorial**: El artículo está atrapado entre dos requisitos del pipeline: no publicar tasas sin fuente oficial (correcto) y proveer respuesta concreta a la query de cálculo (también requerido). La única ruta a PASS es verificar las tasas SII directamente (Opción A de DEFECT #1). La Opción B reduce la incoherencia pero no alcanza 9.5.

**Artículo no autorizado para Gate 07 hasta que DraftAgent resuelva DEFECTS #1–#3.**
