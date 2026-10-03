# Compliance follow-up — ronda 8

Status: BLOCKED — DEFECTS FOUND  
Role: ComplianceAgent (Codex / OpenAI GPT-6 — instancia independiente, revisión adversarial)

## Alcance y material revisado

Esta revisión cubre el artículo actual y su `git diff HEAD`, el Addendum y la
Evidencia de roles de `07-publish-packet.md`, `draft-fix-CHANGELOG.md`, la
entrada `devolucion-impuestos-plazo-y-multas` de `src/data/correcciones.json` y
`06-compliance-round8.md` únicamente para identificar el hallazgo anterior.
También apliqué NORMA_YMYL §§1.1, 5.1–5.4 y 7, Definition of Done §2 y
EDITORIAL_AI_PIPELINE §§2, 4 y Stage 06. No modifiqué el artículo, el packet,
el changelog, el registro, los gates ni el informe de la ronda anterior.

## Revisión de fuentes y afirmaciones

Fuentes oficiales refetchadas el **2026-10-02**:

| Fuente | Comprobación | Resultado |
|---|---|---|
| [SII FAQ 001.140.0516.011](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm) | La página identifica el ID `001.140.0516.011`, indica actualización al 13-04-2026 y señala que una devolución originada por rectificatoria se recibe alrededor de tres semanas después de que el SII autoriza los montos a TGR. | Coincide con el artículo; la FAQ específica y su fecha de actualización aparecen junto a la regla. Sin defecto de fuente. |
| [SII FAQ 001.140.3095.025](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm) | La página identifica el ID `001.140.3095.025` y actualización al 03-07-2025. Para declaraciones con pago: impuestos reajustados, multa de 10% si el atraso no supera cinco meses; luego aumenta 2% por mes o fracción, con tope de 30%, más interés penal. Para declaraciones con devolución: multa de 1 UTM a 1 UTA. Para declaraciones sin movimiento o calzadas, sin pago ni devolución: multa de 1 UTM a 1 UTA. | El cuerpo del artículo incluye los rangos y la base de impuestos reajustados; distingue con pago de devolución/sin pago, no calcula un monto individual y dice con precisión que esas dos subsecciones no enumeran interés penal. No reproduce la tasa de interés indicada para un semestre de 2025. Sin defecto material de fuente. |
| [SII — Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/) y [índice de noticias 2026](https://www.sii.cl/noticias/2026/index.html) | Se abrieron ambas páginas el 02-10-2026; la extracción actual de la landing no mostró texto y el índice expuso solo sus controles de navegación. La búsqueda restringida a `sii.cl` por “Operación Renta 2027” y “AT2027” no devolvió un calendario oficial de AT2027; los resultados pertinentes encontrados eran material de AT2026. | El artículo afirma que no encontró calendario **en la consulta de esas páginas y en esa fecha**, no que sea imposible que exista una publicación en cualquier sección del SII. Esa formulación queda debidamente acotada; la búsqueda no es prueba exhaustiva de todo el sitio. |
| [Comunicado SII de apertura AT2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) | Refetch el 02-10-2026: está fechado 31-03-2026. | Apoya la fecha histórica citada; el artículo aclara que ese antecedente único no fija cuándo abrirá AT2027. |

El `git diff HEAD` confirma que el cambio de la tabla de fechas AT2026 y del
umbral `$3.000.000` es nulo; no los vuelvo a certificar en este seguimiento.
Los tres campos de frescura (`updatedDate`, `articleLead.validAsOf` y fecha
visible de revisión) sí quedan alineados a 2026-10-02, consistente con la
revisión sustantiva de fuentes. La entrada del registro público existe con
fecha 2026-10-02, página y fuentes correspondientes, y describe los dos
cambios materiales verificados.

**Resultado de contenido/fuentes:** no queda un defecto bloqueante de afirmación
o cita en los cambios auditados. El estado AT2027 se informa con el límite de
las páginas consultadas. Las URLs y fechas de recuperación quedan registradas
en este informe.

## Separación de funciones y hallazgo anterior

| Fase | Evidencia y evaluación |
|---|---|
| DraftAgent del cambio 2026-10-02 | Codex (OpenAI GPT-6), instancia raíz `/root`. El changelog y el Addendum dicen que continuó con ediciones ya presentes en el worktree y revisó el artículo y `git diff HEAD`; expresamente no afirman cero exposición previa. |
| MathAuditAgent | No se añadió para este cambio: `requires_calculation=false`; no se derivó un monto individual. Los rangos se transcribieron de la FAQ. |
| ComplianceAgent | Esta revisión la realiza una instancia independiente de Codex, `/root/compliance_refund_round8_followup`, sin historial de conversación forked. Recibió la tarea de auditoría y examinó el artículo como objeto de revisión; no produjo el borrador. |
| HumanEditor | Firma pendiente; no se marca ningún gate. |

El hallazgo de la ronda 8 sobre autoría/sesión incompleta **queda resuelto**: el
Addendum identifica quién hizo el cambio actual, cómo se retomó y quién realizó
la auditoría. La evidencia identifica instancias distintas para DraftAgent y
ComplianceAgent. Aunque ambas pertenecen a la familia GPT-6, esta revisión es
una instancia separada sin conversación previa forked; no hay evidencia de que
el agente redactor también haya realizado esta auditoría. La nota honesta de
continuación del worktree no demuestra por sí misma una colisión de roles.

Sin embargo, la instrucción explícita del usuario para esta actualización
exigía un **DraftAgent en una sesión fresca, que no hubiera visto ni producido
ningún borrador de esta pieza**. La evidencia actual dice que `/root` continuó
con ediciones presentes en el worktree y revisó el artículo y su diff. Por lo
tanto, no se cumplió esa instrucción de sesión fresca para DraftAgent. Esta es
una desviación independiente del hallazgo de SoD DraftAgent/ComplianceAgent; no
la describo como si ambos roles fueran la misma instancia.

## DEFECTS

### DEFECT #1 — MAYOR — No se cumplió la instrucción de usar un DraftAgent sin exposición previa

El Addendum atribuye correctamente la actualización al Codex raíz `/root`, pero
registra que esa instancia retomó ediciones existentes del artículo y revisó
el `git diff HEAD`. Eso no satisface la instrucción de que el DraftAgent no
hubiera visto ni producido ningún borrador de esta pieza. Esta evidencia no
indica que ese DraftAgent sea la misma instancia que ComplianceAgent; la
separación entre ambas instancias está acreditada.

**Resolución:** repetir la actualización sustantiva desde una sesión DraftAgent
que cumpla la instrucción de cero exposición previa y documentar esa sesión en
el packet/changelog; luego volver a revisar el artículo y sus fuentes. Ruta de
seguimiento: `07-publish-packet.md` y `draft-fix-CHANGELOG.md`.

## Scorecard NORMA_YMYL §7

| Dimensión | Peso | Nota | Ponderado | Justificación |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9,5 | 3,325 | Da fechas, condiciones y orientación concreta dentro de la primera sección útil. |
| Precisión + fuentes | 25% | 9,5 | 2,375 | Las dos FAQ refetchadas identifican los plazos y rangos citados; no queda una cita faltante en los cambios. |
| Vigencia + calendario | 15% | 9,5 | 1,425 | Fecha de revisión alineada; AT2027 se limita a las páginas efectivamente consultadas. |
| Excepciones + cobertura | 15% | 9,5 | 1,425 | Distingue pago, devolución y ausencia de pago; no promete un resultado individual. |
| Claridad + estructura | 10% | 9,5 | 0,950 | Las secciones separan el calendario cerrado, los pasos actuales, las multas, las preguntas y las fuentes. |
| **Total** | **100%** |  | **9,500/10** | |

## Veredicto

**FAIL.** El contenido y las fuentes de la actualización pasan esta re-verificación
y la omisión de atribución de la ronda 8 está corregida. La publicación sigue
bloqueada por la instrucción expresa de sesión fresca para DraftAgent, que no
se cumplió. Este veredicto no atribuye una violación de separación de funciones
entre DraftAgent y ComplianceAgent: el packet identifica instancias distintas
y esta ComplianceAgent no heredó el historial de conversación del DraftAgent.
Ningún gate está marcado `[X]`; HumanEditor conserva la decisión de publicación.
