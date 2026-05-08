# Gate 06 — Compliance Review: contribuciones-bienes-raices-chile

Status: CONDITIONAL → SIGNED OFF (DEFECT #1 DL 3.063 resuelto; DEFECT #2 tasas aceptado por HumanEditor; HumanEditor: Carlos Ortega, 2026-05-08)
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza ciclo anterior (post-remediación DraftAgent ciclo 2, 2026-05-06) + Remediación ciclo 3

---

## Verificación de remediaciones (ciclo 3, 2026-05-06)

| Defecto ciclo 2 | Resolución | Estado |
|---|---|---|
| DEFECT #1 WARNING: DL 3.063 no citado | Sección "¿Qué son las contribuciones?" actualizada: "establecido por la [Ley de Rentas Municipales DL 3.063](https://www.bcn.cl/leychile/navegar?idNorma=7054) (29-DIC-1979, Ministerio del Interior)". BCN agregado a officialSources. idNorma=7054 verificado vía BCN. | ✓ RESUELTO |
| DEFECT #2 INFO: Sin tasa concreta (limitación estructural) | **NO RESUELTO** — Limitación editorial: tasas SII no verificables vía scraping (JS API). Decisión editorial: enfoque procedimental. Score de respuesta ancla permanece 8.5. | ⚠ PENDIENTE (decisión editorial Gate 07) |

**Score revisado: ~9.0 → CONDITIONAL. DEFECT #1 resuelto; DEFECT #2 pendiente por decisión editorial.**

Archivos revisados:
  - docs/editorial/NORMA_YMYL.md
  - docs/editorial/artifacts/briefs/contribuciones-bienes-raices.md
  - docs/editorial/artifacts/contribuciones-bienes-raices/04-draft.md
  - docs/editorial/artifacts/contribuciones-bienes-raices/05-math-audit.md
  - src/data/blog/contribuciones-bienes-raices-chile.md

---

## Verificación de remediaciones (puntos de atención post-2026-05-06, ciclo 2)

| Punto de atención | Estado |
|---|---|
| covers bullet #1: "Qué es el avalúo fiscal y cómo consultar el monto de tus contribuciones en el SII." | ✓ RESUELTO — resuelve DEFECT #1 del ciclo anterior (Opción B): covers ahora coherente con el enfoque procedimental del artículo |
| DFL-2: "conocido popularmente como DFL-2 o vivienda económica, actualmente regido por el Decreto 1101" con URL BCN i=16842 | ✓ RESUELTO — resuelve DEFECT #2 del ciclo anterior; enlace BCN presente |
| F22 habitante principal: reformulado sin calificador vago | ✓ RESUELTO — "habitualmente no son gasto deducible en el F22 — consulta las instrucciones SII del año tributario correspondiente o a un contador." Resuelve DEFECT #3 del ciclo anterior |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 8.5 | 2.975 | Definición clara; calendar 4 cuotas verificado con fechas exactas; covers coherente con cuerpo (deferral a SII para tasas); guía procedimental (aviso TGR, portal SII) concreta. Deducción: sin ninguna tasa publicable, NORMA_YMYL MUST #1 parcialmente cumplido — la query "cómo calcular mis contribuciones" recibe proceso pero no número |
| Precisión + fuentes | 25% | 9.0 | 2.250 | Sin tasas no verificadas (omisión correcta); calendario TGR verificado; DFL-2/Decreto 1101 con URL BCN; F22 correctamente condicional; ERROR apertura resuelto; DL 3.063 no citado (ver DEFECT #1) |
| Vigencia + calendario | 15% | 9.5 | 1.425 | "vigente al 2026-05-03"; fechas exactas TGR 2026 verificadas; disclaimers prominentes en apertura y cierre; articleAdvisory presente |
| Excepciones + cobertura | 15% | 9.0 | 1.350 | Primera vivienda, DFL-2, adultos mayores cubiertos; condiciones diferidas a SII (aceptable dado TODO:SOURCE no cerrado); mora y embargo explicados; reclamo de avalúo cubierto |
| Claridad + estructura | 10% | 9.0 | 0.900 | H2 sigue brief; canales de pago listados; covers coherente con cuerpo; "habitualmente" en F22 es apropiado para YMYL con casos borde |
| **TOTAL** | 100% | — | **8.9** | Por debajo del umbral 9.5 — CONDITIONAL |

Score mejoró de 8.25 (ciclo anterior) a 8.9 (este ciclo).

---

## DEFECTS

**DEFECT #1 — WARNING — DL 3.063 (Ley de Rentas Municipales) no citado (Brief §Fuentes / NORMA_YMYL MUST #4)**

Ubicación: Sección "¿Qué son las contribuciones de bienes raíces?" y officialSources
Descripción: El brief requiere "BCN — DL 3.063 (Ley de Rentas Municipales)" como fuente oficial. El artículo no menciona el DL 3.063 en ninguna sección. La existencia del impuesto y la obligación de pago se respaldan solo con el link al SII, sin citar el instrumento legal que lo establece. officialSources incluye SII y TGR pero no BCN. NORMA_YMYL MUST #4 requiere "al menos 1 fuente oficial" para cada regla crítica YMYL — la regla crítica "el impuesto territorial existe y debe pagarse" carece de cita legal específica.
Resolution: Agregar mención de DL 3.063 en la sección introductoria ("establecido por el DL 3.063, Ley de Rentas Municipales") y agregar BCN como officialSource, o al menos un enlace en el cuerpo. Clasificado WARNING — no bloquea Gate 07 si el humano acepta que el SII link es suficiente como proxy, pero el brief lo requiere explícitamente.

**DEFECT #2 — INFO — NORMA_YMYL MUST #1 parcialmente cumplido: enfoque procedimental por decisión editorial**

Ubicación: Sección "¿Cómo se calcula el monto?"
Descripción: La query ancla "cómo calcular contribuciones" no recibe ninguna tasa concreta — el artículo dirige al SII para obtener el monto determinado. Esta es una decisión editorial deliberada (Opción B del ciclo anterior) dado que las tasas no pudieron verificarse con fuente oficial. El covers ahora es coherente con esta limitación. No es un error factual ni una incoherencia interna, pero el artículo no puede alcanzar el MUST #1 plenamente sin alguna tasa verificada.
Resolution (para alcanzar PASS): verificar la tasa general vigente (1,2% bienes raíces no agrícolas) y la tasa DFL-2 directamente en el portal SII, reincorporarlas con fuente, fecha y advertencia de actualización. Esto elevaría significativamente el score de respuesta ancla. Clasificado INFO — decisión que compete al humano en Gate 07.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE / ERROR del math audit | Resolución en blog file | Estado |
|---|---|---|
| ERROR: "Toda persona con propiedad paga" | Corregido a "puede corresponder el pago"; exenciones destacadas en apertura | ✓ RESUELTO |
| TODO:SOURCE: Tasa general ~1,2% sin verificar | Eliminada — artículo toma enfoque procedimental deferido a SII | ✓ RESUELTO (por omisión deliberada) |
| TODO:SOURCE: Tasa DFL-2 ~1,0% sin verificar | Eliminada — artículo toma enfoque procedimental deferido a SII | ✓ RESUELTO (por omisión deliberada) |
| VERIFIED: Calendario TGR 2026 (30 abril, 30 junio, 30 sept, 30 nov) | Insertado con fechas exactas | ✓ RESUELTO |
| TODO:SOURCE: Exención primera vivienda — topes | Deferida al SII con instrucción al lector | ✓ RESUELTO (por deferral) |
| TODO:SOURCE: Exención adultos mayores — condiciones | Deferida al SII con instrucción al lector | ✓ RESUELTO (por deferral) |
| TODO:SOURCE: Deducibilidad F22 arrendadores | Suavizada a condicional; deferred SII/contador | ✓ RESUELTO |

**TODO:SOURCE activos en el blog file: 0**

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
| Gate 07 Publish Packet | Solo humano | Carlos Ortega, 2026-05-08 | ✓ SIGNED OFF |

---

## Veredicto final

**CONDITIONAL → SIGNED OFF (Carlos Ortega, 2026-05-08)**

Justificación: Los tres defectos del ciclo anterior están resueltos. DEFECT #1 (DL 3.063) citado en blog file (línea 60). DEFECT #2 (tasas) aceptado por HumanEditor como enfoque procedimental. No hay TODO:SOURCE activos.

Score: 8.9 (ciclo 3). DEFECT #2 (INFO) queda como mejora futura si se logra verificar tasa SII.
