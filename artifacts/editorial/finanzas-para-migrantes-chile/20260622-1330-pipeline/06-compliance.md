# Gate 06 — Compliance: finanzas-para-migrantes-chile

**Status:** BLOCKED — DEFECTS FOUND
**Role:** ComplianceAgent (Codex — sesión fresca, independiente y adversarial)
**Fecha de auditoría:** 2026-06-22
**Draft evaluado:** `04-draft.md` — cuarta remediación, borrador congelado
**Veredicto:** FAIL

## Separación de Funciones (SoD)

| Stage | Rol declarado | Instancia/sesión | Evaluación SoD |
|---|---|---|---|
| 01 Brief | Brief/DraftAgent | Claude Code, sesión 2026-06-22 | Misma sesión que 02–04; concentración declarada |
| 02 Dossier | ResearchAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/03/04; defecto de proceso declarado |
| 03 Outline | OutlineAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/02/04; defecto de proceso declarado |
| 04 Draft | DraftAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01–03 |
| 05 Math Audit | MathAuditAgent | Claude (DeepSeek v4 Pro), sesión fresca independiente 2026-06-22 | Independencia declarada; PASS sobre el borrador congelado |
| 06 Compliance | ComplianceAgent | Codex, sesión fresca 2026-06-22; no produjo 01–05 | **Independencia respecto del DraftAgent acreditada** |

Los stages 01–04 fueron producidos por la misma sesión. Esto concentra investigación,
estructura y redacción y se registra como defecto de proceso. La presente auditoría se ejecutó
en una sesión fresca, sin participación en esos artefactos, y resuelve estructuralmente la
separación exigida entre `DraftAgent` y `ComplianceAgent`. No corrige por sí misma los defectos
sustantivos que se detallan abajo.

## Scorecard NORMA_YMYL

| Dimensión | Peso | Nota | Aporte ponderado | Justificación adversarial |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 8.8/10 | 3.08 | Responde los tres trámites y declara vigencia, pero la rama para no residentes omite en el `articleLead` la condición de tener obligaciones tributarias en Chile. Las fuentes del ancla son portadas genéricas, no las URLs específicas usadas en el cuerpo. |
| Precisión + fuentes | 25% | 8.2/10 | 2.05 | C2 y C3 se trasladan con precisión y fuentes directas. C1 pierde una condición esencial en el ancla. La síntesis de la Ley N° 20.609 afirma una obligación sin citar primero la cláusula operativa literal. La afirmación sobre la UF carece de fuente en el dossier. |
| Vigencia + calendario | 15% | 9.7/10 | 1.46 | La fecha de corte 2026-06-22 aparece de forma visible y consistente. No hay una reforma futura que requiera separar aprobación, vigencia e implementación. |
| Excepciones + cobertura | 15% | 9.0/10 | 1.35 | Distingue residentes/no residentes, limita el alcance migratorio y cubre alternativas bancarias y arriendo. La excepción tributaria omitida en el ancla puede inducir a una persona sin obligación tributaria a interpretar que puede solicitar el RUT por esa vía. |
| Claridad + estructura | 10% | 9.2/10 | 0.92 | La guía por pasos, el bloque orientativo y las FAQ son legibles. La diferencia de precisión entre el ancla y el cuerpo reduce la coherencia operativa. |
| **Total ponderado** | **100%** |  | **8.86/10** | **No alcanza el umbral obligatorio de 9.5/10.** |

## Auditoría de claims C1–C6

La instrucción de auditoría describe C1, C1b, C4, C5 y C6 como `TODO:SOURCE`. Ese estado no
coincide con el dossier vigente: `02-dossier.md` incorpora un addendum humano del 2026-06-22 y
los registra como verificados, parcialmente verificados, limitados o corregidos. Se aplica el
estado canónico que está escrito en el dossier actual. Un `TODO:SOURCE` tratado como orientación
y remitido legítimamente a una fuente oficial no habría fallado por ese solo motivo; en el
catálogo vigente no quedan claims con ese estado.

| Claim | Estado vigente en dossier | Tratamiento en el draft | Resultado |
|---|---|---|---|
| C1 | VERIFIED — REFORMULADO | El cuerpo distingue residentes con cédula de no residentes con obligaciones tributarias y cita URLs SII. El `articleLead` elimina la condición de obligaciones tributarias para la segunda vía. | **FAIL PARCIAL:** la fuente está presente, pero el ancla amplía indebidamente la elegibilidad. |
| C1b | VERIFIED — REFORMULADO | Limita el efecto del RUN al registro tributario automático de residentes y cita SII. | **PASS:** no afirma equivalencia universal RUN/RUT. |
| C2 | VERIFIED (carryover 2026-06-17; URLs profundas 2026-06-22) | Incluye cédula vigente, apertura por App, solicitud web con firma presencial y entrega de tarjeta en Chile. Cita BancoEstado y ChileAtiende. | **PASS:** traslado preciso y trazable. |
| C3 | VERIFIED (carryover 2026-06-17; URLs profundas 2026-06-22) | Incluye edad mínima, intervención de representante legal y alternativa App; cita BancoEstado y ChileAtiende. | **PASS:** traslado preciso y trazable. |
| C4 | PARTIAL VERIFIED | Presenta las leyes bajo “Resumen orientativo”, con limitador y enlaces BCN. Identifica el art. 2 de la Ley N° 20.609, pero no cita primero su cláusula operativa literal. | **FAIL PARCIAL:** el contenido está limitado, pero incumple el estándar de cita legal de Stage 04. |
| C5 | VERIFIED AS LIMITED | Separa Santander, BCI y Tenpo, atribuye requisitos por entidad y no garantiza elegibilidad universal. | **PASS:** conserva los límites del dossier y cita cada entidad. |
| C6 | CORRECTED | Explica que trabajo y cotizaciones pueden operar con identificación provisoria, mientras CuentaRUT exige cédula vigente; cita DT, SP y ChileAtiende. | **PASS:** refleja la corrección y mantiene el límite de alcance. |

## Defectos

### DEFECT #1 — HIGH — El ancla amplía indebidamente la vía de RUT para no residentes

El `articleLead` afirma: “Si no tienes residencia, puedes inscribirte en el RUT por internet
en sii.cl”. C1 solo respalda esa vía para una persona sin residencia que deba cumplir
obligaciones tributarias en Chile. El cuerpo sí conserva la condición, pero el ancla —la
respuesta que el lector verá primero— la elimina.

**Resolución:** incorporar en `articleLead.answer` la condición “y debes cumplir obligaciones
tributarias en Chile”, manteniendo la misma distinción en cuerpo y FAQ.

### DEFECT #2 — HIGH — La conclusión legal no cita primero la cláusula operativa literal

El bloque de arriendo afirma que la Ley N° 20.609, art. 2, prohíbe discriminación arbitraria
por nacionalidad incluso entre particulares. Aunque identifica artículo y fuente, presenta
solo una paráfrasis. El playbook de Stage 04 exige, para una obligación legal, citar primero
la cláusula operativa literal y luego explicarla.

**Resolución:** añadir un extracto breve y literal del art. 2 antes de la síntesis, seguido
del comentario orientativo y su limitador. Mantener la cita directa a BCN.

### DEFECT #3 — MEDIUM — Las fuentes del `articleLead` no son las URLs específicas auditadas

El frontmatter propuesto enlaza las portadas de SII, Registro Civil y BancoEstado, mientras
el cuerpo usa páginas profundas para las reglas críticas. La respuesta ancla debe permitir
trazar la regla concreta a la fuente concreta, no obligar al lector a volver a buscarla.

**Resolución:** sustituir las tres portadas genéricas por las URLs oficiales profundas que
respaldan C1/C1b y C2; añadir la fuente legal específica de C4 si el esquema lo permite.

### DEFECT #4 — LOW — La explicación de la UF es absoluta y no está trazada al dossier

La frase “La UF sube con la inflación” simplifica en exceso el mecanismo de reajuste y no
tiene fuente en el dossier. No es el claim central del artículo, pero aparece como orientación
financiera afirmativa.

**Resolución:** enlazar una fuente oficial que explique el reajuste de la UF y describirlo
con precisión, o retirar la explicación y limitarse a que el pago en pesos depende del valor
vigente y de lo pactado en el contrato.

### INFO #1 — Concentración de stages 01–04 declarada; Gate 06 independiente

La concentración de stages 01–04 queda registrada. Esta sesión fresca no produjo esos
artefactos y acredita la independencia de `ComplianceAgent`. No se marcó ninguna gate de
publicación ni se alteró ningún scorecard automatizado.

### INFO #2 — Divergencia entre la premisa recibida y el dossier vigente

La premisa recibida conserva estados `TODO:SOURCE` anteriores al addendum. El dossier vigente
los reemplazó por estados canónicos respaldados por investigación humana. Conviene que futuras
órdenes de auditoría indiquen expresamente si deben evaluar el estado histórico o el archivo
vigente para evitar dos marcos de verdad simultáneos.

## Veredicto y condiciones para Gate 07

**FAIL.** El total ponderado es **8.86/10**, inferior al umbral obligatorio de **9.5/10**.
Además, existen dos defectos HIGH: una ampliación de elegibilidad en la respuesta ancla y el
incumplimiento del estándar de cita operativa para una obligación legal. Gate 07 permanece
bloqueado.

Condiciones mínimas antes de repetir Gate 06 o habilitar Gate 07:

1. Restituir en el `articleLead` la condición tributaria exacta de C1.
2. Citar brevemente la cláusula operativa del art. 2 de la Ley N° 20.609 antes de explicarla.
3. Reemplazar las fuentes genéricas del ancla por URLs oficiales profundas.
4. Respaldar o retirar la explicación no trazada sobre la UF.
5. Repetir Gate 06 en otra sesión fresca si cambia `04-draft.md`.
6. Mantener sin marcar todas las casillas de publicación; solo Carlos Ortega puede aprobarlas.

## Escalamiento humano

Carlos Ortega debe revisar la evidencia, decidir la remediación editorial y efectuar el
sign-off de Gate 07. Este informe no autoriza publicación.
