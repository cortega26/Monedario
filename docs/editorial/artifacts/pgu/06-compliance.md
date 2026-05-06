# Gate 06 — Compliance Review: pgu-pension-garantizada-universal

Status: CONDITIONAL
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza ciclo anterior (post-remediación DraftAgent ciclo 2, 2026-05-06)

> **ALERTA regulatory_sensitivity=alta**: Artículo sobre beneficio estatal de pensión. Sign-off humano obligatorio antes de activar draft:false. El humano debe verificar montos y umbrales vigentes en IPS al momento de publicar.

Archivos revisados:
  - docs/editorial/NORMA_YMYL.md
  - docs/editorial/artifacts/briefs/pgu.md
  - docs/editorial/artifacts/pgu/04-draft.md
  - docs/editorial/artifacts/pgu/05-math-audit.md
  - src/data/blog/pgu-pension-garantizada-universal.md

---

## Verificación de remediaciones (puntos de atención post-2026-05-06, ciclo 2)

| Punto de atención | Estado |
|---|---|
| articleLead.answer: "$231.732 mensuales (65–81 años), $250.275 mensuales (82 años o más, desde febrero 2026)" | ✓ RESUELTO — resuelve DEFECT #1 del ciclo anterior |
| Sección "¿Qué es la PGU?": "establecida por ley y está administrada por el IPS — consulta el texto legal vigente en BCN." (número de ley no identificado con certeza) | ⚠ PARCIAL — agrega BCN genérico; ley específica no nombrada (esperado: incertidumbre reconocida); ver DEFECT #1 de este ciclo |
| Ley 21.419: enlace BCN con idNorma=1171923 | ✓ RESUELTO — resuelve DEFECT #3 del ciclo anterior |
| FAQ invalidez: "depende del tipo de pensión" + instrucción IPS con número de caso | ✓ RESUELTO — resuelve DEFECT #4 del ciclo anterior |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9.5 | 3.325 | articleLead.answer ahora incluye $231.732/$250.275 con fuente ChileAtiende; tres requisitos claramente numerados; umbrales AFP-PGU en bullets; covers correctos; disclaimer de reajuste prominente |
| Precisión + fuentes | 25% | 8.5 | 2.125 | Montos verificados (ChileAtiende); umbrales $789.139/$1.252.602 verificados (SP); Ley 21.419 con URL BCN ✓; "establecida por ley" genérico (ley creadora sin número — ver DEFECT #1); Ley 21.015 del brief no encontrada en artículo (posible error en brief — ver DEFECT #2) |
| Vigencia + calendario | 15% | 9.5 | 1.425 | validAsOf: 2026-05-03; "desde febrero 2026" para $250.275; nota de reajuste periódico en apertura, cuerpo y cierre; links IPS y ChileAtiende |
| Excepciones + cobertura | 15% | 9.0 | 1.350 | Sin cotizaciones AFP, extranjeros (deferido IPS), APV cubiertos; FAQ invalidez resuelto; tramo variable deferred a IPS (aceptable dado TODO:SOURCE no cerrado); percentil 90% operacionalizado |
| Claridad + estructura | 10% | 9.5 | 0.950 | H2 sigue brief; requisitos numerados; thresholds AFP-PGU en bullets; FAQ activos; no quedan TODO:SOURCE visibles |
| **TOTAL** | 100% | — | **9.175** | Por debajo del umbral 9.5 — CONDITIONAL |

Score mejoró de 8.50 (ciclo anterior) a 9.175 (este ciclo).

---

## DEFECTS

**DEFECT #1 — WARNING — Ley creadora de la PGU no especificada en sección introductoria (NORMA_YMYL MUST #4)**

Ubicación: Sección "¿Qué es la PGU?", primer párrafo
Descripción: El artículo dice "La PGU fue establecida por ley y está administrada por el IPS — consulta el texto legal vigente en BCN." sin especificar cuál ley. El math audit confirmó Ley 21.419 (idNorma=1171923) para el requisito de residencia — la misma ley que reformó el sistema y creó la PGU como se conoce hoy. La 04-draft flagea explícitamente "(número de ley no identificado con certeza)" como razón de la omisión deliberada. Si Ley 21.419 es efectivamente la ley creadora (consistent con su uso en el requisito de residencia), el artículo debería citarla en la intro. NORMA_YMYL MUST #4 requiere fuente oficial para cada regla crítica YMYL — la existencia del beneficio es la regla más crítica del artículo.
Resolution: El revisor humano en Gate 07 debe confirmar si Ley 21.419 (idNorma=1171923) establece la PGU o si existe una ley distinta. Si Ley 21.419 es la ley creadora, reemplazar "establecida por ley" por "establecida por Ley 21.419". Este es el único cambio que elevaría el score a ≥9.5.

**DEFECT #2 — NOTE — Brief cita "Ley 21.015 (PGU)" pero el artículo usa Ley 21.419; discrepancia sin cerrar**

Ubicación: Brief §Fuentes vs. blog file
Descripción: El brief requería "BCN — Ley 21.015 (PGU) — texto vigente vía BCN" como fuente. El artículo usa Ley 21.419, confirmada por el math audit como el instrumento BCN correcto para el requisito de residencia. Ley 21.015 (2017) aparentemente no establece la PGU (la PGU fue creada por reforma posterior). Esta discrepancia implica que el brief puede contener un error de citación. No bloquea Gate 07 pero debe documentarse: si Ley 21.015 es irrelevante para la PGU, el brief contiene un dato incorrecto que podría confundir auditorías futuras.
Resolution (solo Gate 07): El revisor humano verifica en BCN si Ley 21.015 es relevante para el marco PGU. Si no lo es, documenta la corrección en el publish-packet.

**DEFECT #3 — PROCESS (OBLIGATORIO) — Regulatory_sensitivity=alta: sign-off humano obligatorio pre-publicación**

Ubicación: Pipeline — Gate 07
Descripción: `regulatory_sensitivity: alta` (04-draft). El brief confirma "alto riesgo YMYL requiere sign-off explícito". Por INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES, Gate 07 no puede ejecutarse sin aprobación humana explícita. Los montos $231.732/$250.275 y umbrales $789.139/$1.252.602 fueron verificados al 2026-05-03 — el humano debe re-verificar que siguen vigentes al momento de activar draft:false.
Resolution: Revisor humano: (1) verifica montos en IPS al momento de publicar, (2) verifica umbrales en Superintendencia de Pensiones, (3) resuelve DEFECT #1 (ley creadora), (4) firma 07-publish-packet.md.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE / ERROR del math audit | Resolución en blog file | Estado |
|---|---|---|
| VERIFIED: Edad 65 años | Presente ✓ | ✓ RESUELTO |
| ERROR: Residencia incompleta → "20 años + 4 años en últimos 5" | Corregido; Ley 21.419 con URL BCN | ✓ RESUELTO |
| VERIFIED: Percentil 90% (no pertenecer al 10% más rico) | Presente ✓ | ✓ RESUELTO |
| VERIFIED: Montos $231.732/$250.275 y umbrales $789.139/$1.252.602 | Verificados e insertados con fuentes | ✓ RESUELTO |
| TODO:SOURCE: Fórmula complemento AFP tramo variable | Deferido al IPS ("monto variable; el IPS calcula") | ✓ ACEPTABLE |
| TODO:SOURCE: Condiciones exactas extranjeros | Deferido al IPS con advertencia de condiciones adicionales | ✓ ACEPTABLE |

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

Justificación: Los cuatro defectos de datos del ciclo anterior están resueltos. articleLead.answer ahora incluye montos concretos verificados. Ley 21.419 tiene URL BCN. FAQ invalidez resuelto con instrucción IPS. No hay TODO:SOURCE activos ni claims incorrectos.

Score mejoró de 8.50 (ciclo anterior) a 9.175 (este ciclo).

Defectos pendientes antes de Gate 07:
1. **DEFECT #1** (WARNING): Resolver qué ley establece la PGU — si es Ley 21.419 (confirmado para residencia), citarla en intro. Una línea de cambio que requiere verificación humana.
2. **DEFECT #2** (NOTE): Discrepancia Ley 21.015 (brief) vs. Ley 21.419 (artículo) — documentar en publish-packet.
3. **DEFECT #3** (PROCESS, OBLIGATORIO): Sign-off humano con re-verificación de montos en IPS al momento de publicar. No negociable para regulatory_sensitivity=alta.

El artículo puede avanzar a Gate 07 con el entendido de que DEFECT #1 debe resolverse como parte del proceso de sign-off humano. No requiere nueva ronda de ComplianceAgent — los cambios son de una línea y verificables directamente por el revisor.
