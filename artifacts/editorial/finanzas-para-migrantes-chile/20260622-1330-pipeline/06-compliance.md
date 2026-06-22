# Gate 06 — Compliance: finanzas-para-migrantes-chile

**Status:** BLOCKED — DEFECTS FOUND
**Role:** ComplianceAgent (Codex — sesión fresca, independiente y adversarial)
**Fecha de auditoría:** 2026-06-22
**Draft evaluado:** `04-draft.md` — remediación vigente al 2026-06-22
**Veredicto:** FAIL

## Separación de Funciones (SoD)

| Stage | Rol declarado | Instancia/sesión | Evaluación SoD |
|---|---|---|---|
| 01 Brief | Brief/DraftAgent | Claude Code, sesión 2026-06-22 | Misma sesión que 02–04; concentración declarada |
| 02 Dossier | ResearchAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/03/04; defecto de proceso declarado |
| 03 Outline | OutlineAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/02/04; defecto de proceso declarado |
| 04 Draft y remediaciones | DraftAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01–03 |
| 05 Math Audit | MathAuditAgent | Claude Code (DeepSeek V4 Pro), sesión fresca 2026-06-22 | Independencia declarada, pero el informe quedó desalineado con los artefactos vigentes |
| 06 Compliance | ComplianceAgent | Codex, sesión fresca 2026-06-22; no produjo 01–05 | **Independencia respecto del DraftAgent acreditada** |

Los stages 01–04 fueron producidos por una misma sesión. Esa concentración es un defecto de
proceso y queda declarada. La presente auditoría, ejecutada en una sesión fresca que no produjo
ninguno de esos artefactos, resuelve estructuralmente la separación exigida entre
`DraftAgent` y `ComplianceAgent`. No subsana por sí sola defectos sustantivos del contenido ni
la desalineación temporal de Gate 05.

## Scorecard NORMA_YMYL

| Dimensión | Peso | Nota | Aporte ponderado | Justificación adversarial |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9.0/10 | 3.15 | El `articleLead` propuesto responde RUT, CuentaRUT y arriendo con fecha de corte. Pierde precisión porque el cuerpo no contiene el bloque canónico visible y la FAQ contradice la vía online del RUT. |
| Precisión + fuentes | 25% | 6.5/10 | 1.63 | C2 y C3 están bien trasladados y citados. Persisten una contradicción procedimental, síntesis legales sin cláusula operativa ni artículo y extensiones de C4/C5 no trazadas con precisión al dossier. |
| Vigencia + calendario | 15% | 9.5/10 | 1.43 | La fecha de corte 2026-06-22 es visible y no hay reforma futura que exija calendario aprobado/vigencia/implementación. |
| Excepciones + cobertura | 15% | 8.0/10 | 1.20 | Distingue residentes/no residentes, declara límites y cubre alternativas. La síntesis jurídica de arriendo no está rotulada como resumen orientativo y mezcla reglas con prácticas no verificadas. |
| Claridad + estructura | 10% | 8.5/10 | 0.85 | La guía por pasos y FAQ es legible, pero la contradicción sobre presencialidad y la inconsistencia entre artefactos reducen su fiabilidad operativa. |
| **Total ponderado** | **100%** |  | **8.25/10** | **No alcanza el umbral obligatorio de 9.5/10.** |

## Auditoría de claims C1–C6

La premisa de que C1, C1b, C4, C5 y C6 siguen en `TODO:SOURCE` no coincide con el dossier
vigente: `02-dossier.md` fue actualizado mediante addendum humano. Esta auditoría aplica los
estados canónicos escritos en ese archivo y registra la divergencia con `03-outline.md` y
`05-math-audit.md`.

| Claim | Estado vigente en dossier | Tratamiento en el draft | Resultado |
|---|---|---|---|
| C1 | VERIFIED — REFORMULADO | El cuerpo distingue auto-registro para residentes con cédula e inscripción online para no residentes, con URLs SII. La FAQ afirma luego que el trámite es presencial. | **FAIL:** cita adecuada en el cuerpo, pero contradicción crítica en FAQ. |
| C1b | VERIFIED — REFORMULADO | Limita la relación RUN/RUT al registro tributario automático de residentes y cita SII. | **PASS:** no afirma equivalencia universal. |
| C2 | VERIFIED (carryover 2026-06-17; URLs profundas 2026-06-22) | Reproduce cédula vigente, vía App, vía web con firma en sucursal y entrega de tarjeta en Chile; cita BancoEstado y ChileAtiende. | **PASS:** traslado preciso y fuente directa. |
| C3 | VERIFIED (carryover 2026-06-17; URLs profundas 2026-06-22) | Incluye edad mínima de 12 años, representante legal, alternativa App y solicitud directa por adultos; cita BancoEstado y ChileAtiende. | **PASS:** traslado preciso y fuente directa. |
| C4 | PARTIAL VERIFIED | Cita el marco legal y retira cifras de garantía, pero añade documentos/efectos tributarios y afirma habitualidad y reajuste automático en UF sin fuente específica. | **FAIL PARCIAL:** excede la parte verificada y la síntesis legal incumple el estándar de cita. |
| C5 | VERIFIED AS LIMITED | Distingue evaluación comercial y falta de garantía de elegibilidad, pero agrupa Santander y BCI bajo requisitos de RUT e ingresos que no están atribuidos individualmente con precisión en el catálogo. | **FAIL PARCIAL:** requiere citas por entidad o formulación limitada al alcance exacto verificado. |
| C6 | CORRECTED | Explica que contrato laboral y cotizaciones pueden avanzar con pasaporte/identificación provisoria y que CuentaRUT exige cédula; cita DT, SP y ChileAtiende. | **PASS:** refleja la corrección y conserva el límite de alcance. |

No quedan claims `TODO:SOURCE` en el catálogo vigente de `02-dossier.md`. Por tanto, el
deferral legítimo no es la causa del veredicto. Gate 05 todavía los reporta como abiertos,
lo que constituye desalineación del pipeline.

## Defectos

### DEFECT #1 — HIGH — Contradicción sobre la vía de inscripción en el RUT

El cuerpo afirma, de acuerdo con C1 reformulado, que una persona sin residencia y con
obligaciones tributarias puede solicitar la inscripción por internet. La FAQ afirma después:
“El RUT del SII se tramita presencialmente en Chile”. Ambas reglas no pueden ser ciertas a la
vez y la segunda contradice expresamente el dossier vigente.

**Resolución:** corregir la FAQ para repetir la distinción exacta de C1 y eliminar la regla
presencial categórica.

### DEFECT #2 — HIGH — Gate 05 no audita la versión vigente de dossier y draft

`05-math-audit.md` mantiene C1/C1b/C4/C5/C6 como `TODO:SOURCE`, analiza pasajes que ya no
existen en el draft actual y registra cuantificadores retirados. Su veredicto `CONDITIONAL`
no constituye evidencia válida sobre la versión sometida a este Gate 06.

**Resolución:** repetir Gate 05 en sesión independiente sobre las versiones vigentes de
`02-dossier.md` y `04-draft.md`, conservando evidencia de SoD.

### DEFECT #3 — HIGH — Las conclusiones legales no cumplen el estándar de cita operativa

El draft concluye efectos de las leyes N° 18.101, N° 21.461 y N° 20.609 mediante paráfrasis,
sin citar primero la cláusula operativa literal ni identificar el artículo aplicable. Esto
incumple el playbook de Stage 04 para obligaciones legales y debilita la trazabilidad de C4.

**Resolución:** citar el artículo y un extracto operativo breve de cada regla legal antes de
explicarla; mantener un limitador de alcance.

### DEFECT #4 — MEDIUM — C4 incorpora afirmaciones no respaldadas por su alcance verificado

El bloque de arriendo afirma que puede pedirse RUT para emitir boleta/factura o consultar
antecedentes comerciales, que denominar un arriendo en UF es habitual y que ello produce
reajuste automático. El dossier no respalda esas extensiones; además, el reajuste depende de
lo pactado en el contrato.

**Resolución:** retirar las afirmaciones o aportar fuente primaria específica; sustituir la
automaticidad por una formulación condicionada al contrato.

### DEFECT #5 — MEDIUM — C5 agrupa requisitos bancarios sin atribución precisa

El draft atribuye conjuntamente a Santander y BCI “cédula vigente, RUT y evaluación comercial
o acreditación de ingresos”. El catálogo vigente solo autoriza una descripción limitada y
las condiciones no son idénticas ni están atribuidas por entidad en el texto.

**Resolución:** separar cada entidad y trasladar únicamente el requisito que su fuente
respectiva acredita, o eliminar el detalle y conservar una remisión orientativa.

### DEFECT #6 — MEDIUM — Falta etiqueta visible de resumen orientativo en la síntesis jurídica

El bloque de arriendo combina conclusiones de tres leyes, documentos y condiciones
contractuales sin la etiqueta visible “resumen orientativo” y su limitador, exigidos por
`NORMA_YMYL` y `CONTRACT.YMYL_RESPONSE_STRUCTURE`.

**Resolución:** añadir la etiqueta y el limitador después de resolver los defectos de fuente;
la etiqueta no sustituye evidencia.

### DEFECT #7 — LOW — La cadena de artefactos conserva estados incompatibles

`02-dossier.md` registra el addendum y cierra/reformula claims, mientras `03-outline.md` y
`05-math-audit.md` todavía los describen como `TODO:SOURCE`. El encabezado de `04-draft.md`
también dice “segunda remediación” mientras sus notas hablan de una tercera.

**Resolución:** sincronizar los estados y versiones de los artefactos sin borrar la historia
de remediación.

### INFO #1 — Separación DraftAgent–ComplianceAgent resuelta

Esta auditoría fue ejecutada en una sesión fresca que no produjo 01–05. La independencia de
Gate 06 queda acreditada; no se requiere otra sesión para validar este reporte mientras el
draft no sea modificado.

## Veredicto y condiciones para Gate 07

**FAIL.** El total ponderado es **8.25/10**, inferior al umbral obligatorio de **9.5/10**, y
existen defectos HIGH de coherencia, trazabilidad legal y validez temporal de Gate 05. Gate 07
permanece bloqueado.

Condiciones mínimas antes de volver a evaluar Gate 06 o habilitar Gate 07:

1. Corregir la contradicción de C1 en la FAQ.
2. Citar artículos y cláusulas operativas para las conclusiones legales de C4.
3. Retirar o respaldar las extensiones no trazadas de C4 y C5.
4. Rotular la síntesis jurídica como “resumen orientativo” con limitador de alcance.
5. Repetir Gate 05 en sesión independiente sobre dossier y draft vigentes.
6. Sincronizar los estados de los artefactos y repetir Gate 06 si cambia `04-draft.md`.
7. Mantener todas las casillas de publicación sin marcar; solo Carlos Ortega puede aprobarlas.

## Escalamiento humano

Carlos Ortega debe revisar la evidencia, resolver cualquier decisión editorial residual y
efectuar el sign-off de Gate 07. Este reporte no autoriza publicación ni modifica scorecards
automatizados.
