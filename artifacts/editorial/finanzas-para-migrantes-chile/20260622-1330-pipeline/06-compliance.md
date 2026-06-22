# Gate 06 — Compliance: finanzas-para-migrantes-chile

**Status:** BLOCKED — DEFECTS FOUND
**Role:** ComplianceAgent (Codex — sesión fresca, independiente y adversarial)
**Fecha de auditoría:** 2026-06-22
**Draft evaluado:** `04-draft.md` — segunda remediación 2026-06-22
**Veredicto:** FAIL

## Separación de Funciones (SoD)

| Stage | Rol declarado | Instancia/sesión | Evaluación SoD |
|---|---|---|---|
| 01 Brief | Brief/DraftAgent | Claude Code, sesión 2026-06-22 | Misma sesión que 02–04; concentración declarada |
| 02 Dossier | ResearchAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/03/04; concentración declarada |
| 03 Outline | OutlineAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/02/04; concentración declarada |
| 04 Draft y segunda remediación | DraftAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01–03 |
| 05 Math Audit | MathAuditAgent | Misma sesión que la segunda remediación de 04 | **No independiente del DraftAgent; defecto bloqueante** |
| 06 Compliance | ComplianceAgent | Codex, sesión fresca; no produjo 01–05 | Independencia respecto de 04 acreditada |

La concentración de 01–04 es un defecto de proceso declarado. Esta auditoría en una sesión
fresca y sin participación en esos artefactos resuelve estructuralmente la separación entre
`DraftAgent` y `ComplianceAgent`. No resuelve la separación entre `DraftAgent` y
`MathAuditAgent`: `05-math-audit.md` declara que ambos actuaron en la misma sesión.

## Scorecard NORMA_YMYL

| Dimensión | Peso | Nota | Aporte ponderado | Justificación adversarial |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 8.0/10 | 2.80 | Entrega pronto la secuencia RUT → cuenta → arriendo y muestra fecha de corte, pero afirma que con el RUT se puede abrir CuentaRUT cuando C2 exige cédula vigente. |
| Precisión + fuentes | 25% | 6.5/10 | 1.63 | C2/C3 se trasladan en gran parte con precisión, pero no tienen URL oficial profunda ni evidencia literal accesible al lector. Persisten afirmaciones categóricas provenientes de C1, C4 y C6. |
| Vigencia + calendario | 15% | 9.0/10 | 1.35 | La vigencia 2026-06-22 es visible y coherente; no hay reformas futuras que exijan calendario. La fecha no compensa la falta de trazabilidad de reglas individuales. |
| Excepciones + cobertura | 15% | 8.0/10 | 1.20 | Declara límites de alcance y variación por situación, pero generaliza prácticas de arriendo y no separa con suficiente rigor lo verificado de lo orientativo. |
| Claridad + estructura | 10% | 9.0/10 | 0.90 | La estructura por pasos y FAQ es clara. Esa claridad vuelve especialmente riesgosas las afirmaciones no verificadas que parecen instrucciones firmes. |
| **Total ponderado** | **100%** |  | **7.88/10** | **No alcanza el umbral obligatorio de 9.5/10.** |

## Auditoría de claims C1–C6

| Claim | Estado del dossier | Tratamiento en el draft | Resultado |
|---|---|---|---|
| C1 | TODO:SOURCE | El cuerpo usa “proceso habitual” y remite al SII, lo que es orientación legítima; la FAQ vuelve a afirmar presencialidad en Chile como hecho. | **PARCIAL:** el deferral del cuerpo es aceptable, pero la FAQ excede el estado disponible. |
| C1b | TODO:SOURCE | Usa “funciona habitualmente” y remite al Registro Civil para alcance y documentos. | **ACEPTABLE COMO ORIENTATIVO:** no se trata como equivalencia universal verificada. |
| C2 | VERIFIED, 2026-06-17 | Reproduce cédula vigente, App, web con firma presencial y entrega de tarjeta en Chile. El lead, sin embargo, dice “con el RUT puedes abrir” antes de exigir cédula. | **DEFECTO DE PRECISIÓN Y CITA:** carryover mayormente correcto, pero el lead induce una condición insuficiente y no hay URL profunda. |
| C3 | VERIFIED, 2026-06-17 | Incluye 12 años, representante legal y alternativa App con padre/madre cliente. | **PRESENTE Y PRECISO**, pero la fuente no es verificable por URL desde el artículo. |
| C4 | TODO:SOURCE parcial | Incluye caveats, pero afirma prácticas habituales, documentos comunes, discrecionalidad del propietario, aceptación mayoritaria con garantías y reajuste automático en UF. | **DEFECTO:** no todo el bloque permanece orientativo; varias afirmaciones se presentan como hechos. |
| C5 | TODO:SOURCE | Se limita a decir que existen otras entidades y remite a cada una sin fijar requisitos. | **ACEPTABLE COMO ORIENTATIVO:** este deferral no causa el FAIL. |
| C6 | TODO:SOURCE | Mantiene que el RUT suele ser necesario para formalizar contratos y que permite avanzar en formalización laboral. | **DEFECTO PARCIAL:** son consecuencias concretas sin fuente, aunque el primer pasaje sí pide verificar con cada entidad. |

Los claims `TODO:SOURCE` que permanecen como orientación prudente y remiten a la fuente
oficial no fallan por ese solo estado. C1b y C5 cumplen ese tratamiento; C1, C4 y C6 lo
abandonan en pasajes concretos. C2 y C3 sí aparecen, pero su cita no permite trazabilidad
directa al FAQ oficial.

## Defectos

### DEFECT #1 — HIGH — Gate 05 no cumple Separación de Funciones

`05-math-audit.md` declara que MathAuditAgent actuó en la misma sesión que produjo la segunda
remediación de `04-draft.md`. La exención por ausencia de cálculos no elimina la regla
`DraftAgent != MathAuditAgent`.

**Resolución:** repetir o validar formalmente Gate 05 con una instancia independiente, sin
exposición al contexto del DraftAgent, y registrar esa evidencia.

### DEFECT #2 — HIGH — La respuesta ancla confunde RUT con requisito suficiente para CuentaRUT

El lead afirma “Con el RUT puedes abrir una CuentaRUT”, mientras C2 verifica apertura con
**cédula de identidad vigente**. Un RUT provisorio no queda acreditado como sustituto.

**Resolución:** reemplazar esa oración por la condición exacta verificada en C2.

### DEFECT #3 — HIGH — C1, C4 y C6 contienen afirmaciones no verificadas fuera del deferral

La FAQ afirma que el RUT del SII se tramita presencialmente en Chile; el bloque de arriendo
afirma prácticas, documentos, aceptación mayoritaria y efectos de la UF; el cierre atribuye
al RUT un efecto en la formalización laboral. Esos pasajes no están formulados solo como
posibilidades sujetas a verificación.

**Resolución:** retirar las afirmaciones o convertirlas en orientación inequívoca con remisión
oficial; si se mantienen como reglas, incorporar fuente primaria verificable.

### DEFECT #4 — MEDIUM — C2 y C3 carecen de cita oficial verificable por el lector

El texto cita “BancoEstado, Centro de Ayuda — FAQ CuentaRUT” y una recuperación vía Scrapling,
pero no incluye URL profunda ni extracto operativo. El dossier conserva una URL abreviada con
`...`, insuficiente para reproducir la verificación.

**Resolución:** añadir URL oficial exacta, fecha de recuperación y evidencia concreta para C2
y C3, sin ampliar el alcance de los claims.

### DEFECT #5 — MEDIUM — La síntesis sobre arriendo no está rotulada como resumen orientativo

Aunque el texto usa algunos caveats, el bloque reúne conclusiones legales y prácticas sin la
etiqueta y el limitador exigidos por `NORMA_YMYL.md §3.2` y
`CONTRACT.YMYL_RESPONSE_STRUCTURE`.

**Resolución:** incorporar la etiqueta canónica de “resumen orientativo” con limitador de
alcance, además de resolver o retirar las afirmaciones del DEFECT #3.

### DEFECT #6 — INFO — Deferrals correctamente conservados

C1b y C5, y parte de C1, se presentan como orientación con verificación en la fuente oficial.
No se consideran defectos por permanecer `TODO:SOURCE` en este artefacto previo a publicación.

**Resolución:** ninguna para Gate 06; Gate 07 debe mantenerlos abiertos hasta la decisión
humana o su resolución antes de publicar.

## Veredicto y condiciones para Gate 07

**FAIL.** El total ponderado es **7.88/10**, inferior al umbral de **9.5/10**, y existen
defectos HIGH de SoD y precisión YMYL. Gate 07 permanece bloqueado.

Condiciones mínimas para una nueva evaluación:

1. Acreditar Gate 05 independiente o resolver su exención mediante decisión humana explícita.
2. Corregir la respuesta ancla para exigir cédula vigente en CuentaRUT.
3. Retirar, orientar inequívocamente o respaldar C1, C4 y C6 donde aún se afirman como hechos.
4. Incorporar URL oficial profunda y evidencia reproducible para C2 y C3.
5. Rotular la síntesis de arriendo como “resumen orientativo” con limitador de alcance.
6. Repetir Gate 06 en otra sesión fresca después de la remediación.
7. No marcar ninguna casilla de `07-publish-packet.md`; solo Carlos Ortega puede aprobarlas.

## Escalamiento humano

Carlos Ortega debe resolver o aceptar las fuentes pendientes, decidir el tratamiento de la
exención de Gate 05 y efectuar cualquier sign-off de Gate 07. Esta auditoría no autoriza la
publicación ni altera scorecards automatizados.
