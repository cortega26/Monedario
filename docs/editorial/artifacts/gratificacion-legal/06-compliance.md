# Gate 06 — Compliance Review: gratificacion-legal-chile

Status: CONDITIONAL
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza ciclo anterior (post-remediación DraftAgent ciclo 2, 2026-05-06)

Archivos revisados:
  - docs/editorial/NORMA_YMYL.md
  - docs/editorial/artifacts/briefs/gratificacion-legal.md
  - docs/editorial/artifacts/gratificacion-legal/04-draft.md
  - docs/editorial/artifacts/gratificacion-legal/05-math-audit.md
  - src/data/blog/gratificacion-legal-chile.md

---

## Verificación de remediaciones (puntos de atención post-2026-05-06, ciclo 2)

| Punto de atención | Estado |
|---|---|
| Apertura distingue art. 47 (30%, condicional a utilidades) y art. 50 (25%, independiente del resultado) | ✓ RESUELTO — "Sin embargo, la modalidad más habitual... art. 50 CT... se paga independientemente de si la empresa tuvo utilidades o pérdidas." Resuelve DEFECT #1 MEDIUM del ciclo anterior |
| "Quiénes tienen derecho": cita arts. 47 y 50, no solo art. 47 | ✓ RESUELTO — "(artículos 47 y 50)" en la sección |
| Pago anual: cita "(artículo 48 CT)" | ✓ RESUELTO — resuelve DEFECT #2 MINOR del ciclo anterior |
| FAQ imponibilidad: provisión mensual vs cuota anual explicadas | ✓ RESUELTO — "La provisión mensual es imponible mes a mes; el pago en cuota anual puede tener un tratamiento distinto." Resuelve DEFECT #3 MINOR del ciclo anterior |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9.5 | 3.325 | articleLead.answer concreto; covers correctos; distinción art. 47/50 desde el primer párrafo; fórmula code block; ejemplo numérico verificado |
| Precisión + fuentes | 25% | 9.0 | 2.250 | IMM $539.000 (Ley 21.751) verificado; tope $2.560.250 verificado; arts. 47, 48, 50, 52 CT citados; "puede distribuir" en art. 47 es ambiguo (ver DEFECT #1) |
| Vigencia + calendario | 15% | 9.5 | 1.425 | "vigente al 2026-05-03"; Ley 21.751 correctamente identificada; footer con IMM y tope explícitos; links Mintrab y BCN |
| Excepciones + cobertura | 15% | 9.5 | 1.425 | Pérdidas/utilidades: ambas modalidades correctamente explicadas; proporcional art. 52; FAQ imponibilidad resuelto con distinción mensual/anual; personas jurídicas sin fines de lucro mencionadas |
| Claridad + estructura | 10% | 9.5 | 0.950 | H2 sigue brief; fórmula code block; ejemplo numérico con todos los pasos; FAQ claros; disclaimers presentes |
| **TOTAL** | 100% | — | **9.375** | Por debajo del umbral 9.5 — CONDITIONAL |

---

## DEFECTS

**DEFECT #1 — WARNING — "puede distribuir" en descripción art. 47: ambigüedad de obligatoriedad (NORMA_YMYL MUST #2)**

Ubicación: Sección "Las dos modalidades", subsección "Modalidad 1 — 30 % de utilidades netas (art. 47 CT)"
Descripción: El artículo dice "Cuando la empresa obtuvo utilidades líquidas en el ejercicio, **puede distribuir** el 30% de esas utilidades entre todos los trabajadores". El art. 47 CT dice "tendrán la **obligación** de gratificar anualmente" cuando hay utilidades. "Puede distribuir" sugiere opcionalidad en el pago una vez elegida la modalidad, cuando en realidad el pago es obligatorio si la empresa obtuvo utilidades y usa esta modalidad. En el contexto del artículo ("La elección es del empleador") el "puede" se refiere a la elección de modalidad, pero un lector puede interpretarlo como que el pago bajo art. 47 es discrecional, lo cual es incorrecto y YMYL-sensible.
Resolution: Reemplazar "puede distribuir" por "debe distribuir" o "está obligado a distribuir". Esto mantiene la precisión normativa sin alterar el argumento del artículo.

**DEFECT #2 — INFO — Ministerio del Trabajo ausente de articleLead.officialSources**

Ubicación: frontmatter `articleLead.officialSources`
Descripción: El brief requiere "Ministerio del Trabajo — IMM vigente para el año en curso" como fuente oficial. El Ministerio del Trabajo aparece enlazado en el cuerpo y el footer, pero no en `articleLead.officialSources`. Solo BCN y DT figuran como fuentes oficiales en el encabezado.
Resolution (opcional): Agregar `{ label: "Ministerio del Trabajo — IMM vigente", href: "https://www.mintrab.gob.cl/" }` a `officialSources`. Clasificado INFO — no bloquea Gate 07, pero alinea el frontmatter con el brief.

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE del math audit | Resolución en blog file | Estado |
|---|---|---|
| ERROR: "decreto supremo" → Ley 21.751 | Corregido a "por ley (actualmente Ley 21.751, Ministerio del Trabajo)" | ✓ RESUELTO |
| TODO:SOURCE: provisión mensual 1/12 (ordinario DT pendiente) | "práctica más extendida" — descriptivo, no normativo | ✓ RESUELTO (softening aceptable) |
| TODO:SOURCE: umbral "30 días" de elegibilidad | Eliminado del artículo | ✓ RESUELTO |
| TODO:SOURCE: presunción modalidad 25% sin comunicación formal | Eliminado del artículo | ✓ RESUELTO |

**TODO:SOURCE activos en el blog file: 0**

---

## Verificación aritmética independiente (ComplianceAgent)

Ejemplo $800.000 mensual, año completo:
- Imponibles anuales: $800.000 × 12 = **$9.600.000** ✓
- Gratificación bruta (25%): $9.600.000 × 0,25 = **$2.400.000** ✓
- IMM $539.000: Ley 21.751, verificado por MathAuditAgent ✓
- Tope anual: $539.000 × 4,75 = **$2.560.250** ✓
- Gratificación efectiva: min($2.400.000, $2.560.250) = **$2.400.000** ✓ (bruta < tope → paga bruta completa)
- Provisión mensual: $2.400.000 ÷ 12 = **$200.000** ✓
- Tope mensual referencia: $2.560.250 ÷ 12 = **$213.354,17** → blog dice "$213.354" ✓ (redondeado)

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
| Gate 07 Publish Packet | Solo humano | — | ⬜ Pendiente |

---

## Veredicto final

**CONDITIONAL**

Justificación: Los tres defectos del ciclo anterior están resueltos — la apertura ahora distingue art. 47/50 correctamente desde el primer párrafo, el pago anual cita el art. 48 CT, y la FAQ de imponibilidad explica la distinción mensual/anual. Todos los TODO:SOURCE del math audit cerrados. Aritmética íntegra.

Score mejoró de 8.65 (ciclo anterior) a 9.375 (este ciclo).

Defecto pendiente antes de Gate 07:
- **DEFECT #1** (WARNING, debe resolverse): "puede distribuir" → "debe distribuir" en descripción art. 47. Corrección de una palabra; puede hacerla el revisor humano directamente en Gate 07 sin nueva ronda DraftAgent.

DEFECT #2 (INFO) queda a criterio del equipo editorial.
