# Gate 06 — Compliance Review: pgu-pension-garantizada-universal

Status: CONDITIONAL — score NORMA_YMYL 8.50/10 < 9.5; regulatory_sensitivity=alta requiere sign-off humano obligatorio
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza 06-compliance.md del 2026-05-05 (post-remediación anterior)

> **ALERTA regulatory_sensitivity=alta**: Este artículo trata un beneficio estatal de pensión cuyos errores pueden afectar decisiones de jubilación de personas vulnerables. Sign-off humano obligatorio antes de Gate 07. Gate 07 no puede ejecutarse sin aprobación explícita de un revisor humano.

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/pgu.md`
  - `docs/editorial/artifacts/pgu/04-draft.md`
  - `docs/editorial/artifacts/pgu/05-math-audit.md`
  - `src/data/blog/pgu-pension-garantizada-universal.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones (puntos de atención post-2026-05-05)

| Punto de atención | Estado |
|---|---|
| ERROR: Residencia "20 años desde los 20" incompleto → + "4 años en últimos 5 (Ley 21.419)" | ✓ RESUELTO — texto completo presente: "mínimo 20 años en Chile a partir de los 20 años de edad, más 4 años de residencia en los últimos 5 años anteriores a la solicitud (Ley 21.419)" |
| Monto PGU $231.732 (65–81 años) insertado | ✓ RESUELTO — presente con fuente ChileAtiende |
| Monto PGU $250.275 (82+, desde febrero 2026) insertado | ✓ RESUELTO — presente con fuente ChileAtiende |
| Umbrales AFP-PGU ($789.139 / $1.252.602) insertados | ✓ RESUELTO — verificados por MathAuditAgent (ChileAtiende / Superintendencia de Pensiones) |
| TODO:SOURCE visible en blog file eliminado | ✓ RESUELTO — no quedan marcadores de pipeline |
| TODO:SOURCE: fórmula exacta complemento AFP (tramo variable) | ✓ PARCIALMENTE RESUELTO — artículo dice "monto variable; el IPS calcula el aporte aplicable a tu caso" (defensivamente correcto; fórmula oficial no obtenida) |
| TODO:SOURCE: condiciones exactas extranjeros | ✓ PARCIALMENTE RESUELTO — artículo dice "Verifica las condiciones exactas en el IPS, ya que pueden existir condiciones adicionales según tu situación migratoria" |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 8.5/10 | 2.975 | Montos $231.732 / $250.275 presentes en el cuerpo con fuente ChileAtiende. Requisito de residencia completo. Umbrales AFP verificados. Deducción: `articleLead.answer` no incluye el monto PGU — solo dice "verifica en el IPS". El lector debe llegar a la sección "¿Cuánto se paga?" para obtener el número concreto, violando NORMA_YMYL MUST #1. |
| Precisión + fuentes | 25% | 8.0/10 | 2.000 | Montos atribuidos a ChileAtiende. Umbrales a Superintendencia de Pensiones. Residencia cita Ley 21.419. Deducción: (1) Ley 21.015 (ley creadora de la PGU) no está citada en el artículo ni en officialSources — la ley base del beneficio no tiene referencia. (2) Ley 21.419 citada sin URL BCN (idNorma=1171923). (3) Fórmula del tramo variable no obtenida — solo "IPS calcula". |
| Vigencia + calendario | 15% | 9.0/10 | 1.350 | `validAsOf: 2026-05-03` presente. "Desde febrero 2026" para $250.275. Nota de reajuste periódico prominente. Link IPS y ChileAtiende. |
| Excepciones + cobertura | 15% | 8.5/10 | 1.275 | Sin cotizaciones AFP, extranjeros, APV, invalidez cubiertos. Tres requisitos (edad, residencia, percentil) claros. Deducción: invalidez FAQ responde "Depende del tipo de pensión de invalidez y sus condiciones" sin listar condiciones — patrón prohibido NORMA_YMYL §2.2. Percentil operacionalizado como "Puntaje de Focalización Previsional" en math audit pero no mencionado en el artículo. |
| Claridad + estructura | 10% | 9.0/10 | 0.900 | No quedan TODO:SOURCE visibles. H2 claros. Tabla AFP-PGU presentada con umbrales específicos. Canales de trámite listados. |
| **TOTAL** | 100% | — | **8.50/10** | **Por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

**DEFECT #1 — MINOR — `articleLead.answer` no incluye el monto PGU verificado (NORMA_YMYL MUST #1)**

Ubicación: Frontmatter `articleLead.answer`.

El `articleLead.answer` dice "El monto se reajusta periódicamente — verifica el valor actualizado en el IPS." El cuerpo del artículo sí provee los montos verificados ($231.732 y $250.275), pero la respuesta ancla user-facing no los incluye. Para un artículo con `regulatory_sensitivity=alta`, la respuesta ancla debe entregar el número concreto con la advertencia de reajuste, no un redirect sin dato. NORMA_YMYL MUST #1 exige una respuesta concreta en la primera sección útil.

Resolution: Actualizar `articleLead.answer` para incluir los montos verificados: "$231.732 mensuales (65–81 años), $250.275 mensuales (82 años o más, desde febrero 2026) según ChileAtiende — sujeto a reajuste periódico; verifica el valor actualizado en el IPS."

---

**DEFECT #2 — MINOR — Ley 21.015 (ley creadora de la PGU) no citada (NORMA_YMYL MUST #4)**

Ubicación: Sección "¿Qué es la PGU?" y `officialSources`.

El artículo describe un beneficio estatal de pensión sin citar la ley que lo creó. La Ley 21.015 creó la pensión básica solidaria (precursora) y la PGU fue establecida posteriormente; la ley de referencia debe identificarse. El brief requería explícitamente "BCN — Ley 21.015 (PGU) o modificaciones posteriores." La ausencia de esta cita es un defecto de trazabilidad para YMYL de alta sensibilidad.

Resolution: Identificar y citar la ley BCN que establece la PGU en su versión vigente. Agregar el enlace BCN correspondiente en `officialSources` y en la sección "¿Qué es la PGU?".

---

**DEFECT #3 — MINOR — Ley 21.419 citada sin URL BCN (NORMA_YMYL MUST #4)**

Ubicación: Sección "¿Quiénes pueden recibirla?", requisito de residencia.

El artículo cita "(Ley 21.419)" para el requisito de residencia ampliado sin enlazar al texto legal en BCN. El math audit confirmó la ley correcta (idNorma=1171923 en BCN). La cita sin URL reduce la trazabilidad del claim de eligibilidad más sensible del artículo.

Resolution: Convertir "(Ley 21.419)" en enlace: `[Ley 21.419](https://www.bcn.cl/leychile/navegar?idNorma=1171923)`.

---

**DEFECT #4 — MINOR — FAQ invalidez: "Depende del tipo de pensión" sin listar condiciones (NORMA_YMYL §2.2)**

Ubicación: FAQ "¿Puede coexistir con pensión de invalidez?".

El artículo responde "Depende del tipo de pensión de invalidez y sus condiciones." NORMA_YMYL §2.2 prohíbe el patrón "Depende... sin listar de qué depende." El artículo lista "del tipo de pensión de invalidez y sus condiciones" pero sin especificar cuáles tipos permiten coexistencia y cuáles no. Para un artículo de `regulatory_sensitivity=alta`, esta vaguedad deja al lector sin información accionable.

Resolution: Verificar en IPS/SUSESO los tipos de pensión de invalidez y su compatibilidad con la PGU, o reformular como: "La compatibilidad depende del tipo de pensión de invalidez. Consulta directamente en el IPS con tu número de caso — las reglas de compatibilidad varían."

---

**DEFECT #5 — PROCESS (OBLIGATORIO) — Regulatory_sensitivity=alta: sign-off humano obligatorio pre-Gate 07**

Ubicación: Pipeline — Gate 07.

El artículo tiene `regulatory_sensitivity: alta` per la 04-draft. El brief confirma "alto riesgo YMYL requiere sign-off explícito" en Gate 07. Por INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES, el sign-off no puede ser marcado por agente — debe ser un revisor humano quien verifique que montos, requisitos y umbrales son vigentes al momento de publicar y firme el 07-publish-packet.md.

Resolution: Un revisor humano debe: (1) verificar que $231.732/$250.275 son los montos vigentes en IPS al momento de activar `draft: false`, (2) verificar que los umbrales AFP-PGU ($789.139/$1.252.602) son vigentes, (3) firmar el 07-publish-packet.md.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE / ERROR del math audit | Resolución en blog file | Estado |
|---|---|---|
| VERIFIED: Edad 65 años | Presente ✓ | RESUELTO |
| ERROR: Residencia incompleta (faltaba "4 años en últimos 5") | Corregido con Ley 21.419 | RESUELTO |
| VERIFIED: Percentil 90% | Presente ✓ | RESUELTO |
| VERIFIED: Montos $231.732/$250.275 y umbrales $789.139/$1.252.602 | Verificados e insertados | RESUELTO |
| TODO:SOURCE: Fórmula complemento AFP tramo variable | Deferrido a IPS (defensivamente correcto) | ACEPTABLE PARA PUBLICACIÓN CONDICIONAL |
| TODO:SOURCE: Condiciones exactas extranjeros | Deferrido a IPS con advertencia de condiciones adicionales | ACEPTABLE PARA PUBLICACIÓN CONDICIONAL |

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
| Gate 07 Publish Packet | **Solo humano** | — | ⬜ **Pendiente — regulatory_sensitivity=alta: sign-off humano obligatorio** |

SoD: CONFORME. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido. Sign-off humano obligatorio en Gate 07 documentado.

---

## Veredicto final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió los defectos críticos del ciclo anterior: requisito de residencia corregido con Ley 21.419 (condición "4 años en últimos 5" incluida), montos PGU completados ($231.732/$250.275 con fuente ChileAtiende), umbrales AFP-PGU verificados ($789.139/$1.252.602), TODO:SOURCE de pipeline eliminados del blog file, Gate 05 ejecutado. No quedan errores de datos ni marcadores de pipeline.

El artículo no puede alcanzar PASS por:
1. **DEFECT #1**: `articleLead.answer` no incluye los montos verificados (MUST #1).
2. **DEFECT #2**: Ley creadora de PGU no citada (MUST #4).
3. **DEFECT #3**: Ley 21.419 sin URL BCN (MUST #4).
4. **DEFECT #4**: FAQ invalidez sin condiciones específicas (§2.2).
5. **DEFECT #5 (PROCESS)**: Sign-off humano obligatorio por regulatory_sensitivity=alta.
6. Score NORMA_YMYL 8.50/10 < 9.5.

**Artículo no autorizado para Gate 07 hasta que DraftAgent resuelva DEFECTS #1–#4 y un revisor humano firme Gate 07 (DEFECT #5).**
