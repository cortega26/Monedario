# Gate 06 — Compliance: finanzas-para-migrantes-chile

**Status:** PASS
**Role:** ComplianceAgent (Codex — sesión fresca, independiente y adversarial)
**Fecha de auditoría:** 2026-06-22
**Draft evaluado:** `04-draft.md` — quinta remediación, borrador congelado
**Math audit de referencia:** `05-math-audit.md` — PASS sobre la quinta remediación
**Veredicto:** PASS

## Separación de funciones (SoD)

Esta sesión no produjo el brief, el dossier, el outline, el draft ni la auditoría matemática,
no es continuación de ninguna sesión que los haya producido y auditó los artefactos como
archivos estáticos del repositorio. El encabezado de `04-draft.md` declara en la línea 3
`quinta remediación 2026-06-22; borrador congelado`, que coincide con la versión solicitada.
No se detecta conflicto de SoD para este Gate 06.

| Stage | Rol declarado | Instancia/sesión | Evaluación SoD |
| --- | --- | --- | --- |
| 01 Brief | Brief/DraftAgent | Claude Code, sesión 2026-06-22 | Misma sesión que 02–04; concentración declarada |
| 02 Dossier | ResearchAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/03/04; defecto de proceso declarado |
| 03 Outline | OutlineAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/02/04; defecto de proceso declarado |
| 04 Draft | DraftAgent | Claude Opus 4.8, sesión 2026-06-22 | Misma sesión que 01–03 |
| 05 Math Audit | MathAuditAgent | Claude Opus 4.8, sesión fresca independiente 2026-06-22 | PASS sobre la quinta remediación; independiente del DraftAgent |
| 06 Compliance | ComplianceAgent | Codex, esta sesión fresca 2026-06-22 | **Independencia respecto del DraftAgent acreditada** |
| 07 Publish | HumanEditor | Carlos Ortega | Pendiente; competencia exclusivamente humana |

## Resolución de los defectos del Gate 06 previo

Las referencias se recalcularon sobre la quinta remediación; no se copiaron de la versión
anterior.

| Defecto previo | Severidad | Resultado en quinta remediación | Evidencia actual |
| --- | --- | --- | --- |
| #1 — Condición tributaria omitida en `articleLead` | HIGH | **RESUELTO** | La línea 65 restituye literalmente “causas o puedes causar impuestos en Chile”. La misma condición aparece en cuerpo y FAQ (líneas 120–125 y 274–279). |
| #2 — Síntesis legal sin cita operativa literal previa | HIGH | **RESUELTO** | El bloque de arriendo cita primero la cláusula operativa del art. 2 (líneas 207–210), luego conserva las condiciones legales y niega una prohibición automática (líneas 210–212), con limitador orientativo (líneas 214–215). |
| #3 — Fuentes genéricas en `articleLead.officialSources` | MEDIUM | **RESUELTO** | Las líneas 68–79 contienen seis URLs profundas específicas para RUT, RUN, CuentaRUT y Ley N° 20.609; no quedan portadas institucionales genéricas en ese campo. |
| #4 — Explicación de la UF absoluta y sin trazabilidad | LOW | **RESUELTO** | Las líneas 240–247 describen el reajuste conforme a la metodología del Banco Central, condicionan el equivalente en pesos al contrato y citan el PDF oficial. |

## Reauditoría de claims canónicos

Se aplicó el estado escrito en el dossier vigente después del addendum. C1, C1b, C4, C5 y C6
no se trataron como `TODO:SOURCE`. No existen marcadores `TODO:SOURCE` abiertos en el draft.

| Claim | Estado canónico vigente | Tratamiento en la quinta remediación | Resultado |
| --- | --- | --- | --- |
| C1 | VERIFIED — REFORMULADO | Distingue residentes con cédula y no residentes que causan o pueden causar impuestos; conserva canal en línea, variación documental y URLs SII específicas (líneas 65, 112–128 y 274–279). | **PASS** |
| C1b | VERIFIED — REFORMULADO | Limita el RUN al registro tributario automático del SII y no afirma equivalencia universal (líneas 112–118). | **PASS** |
| C2 | VERIFIED | Conserva cédula vigente, vías App/web, firma presencial y entrega de tarjeta en Chile; cita BancoEstado y ChileAtiende (líneas 148–162). | **PASS** |
| C3 | VERIFIED | Incluye edad mínima, representación y la excepción presencial cuando el menor o su padre/madre son extranjeros (líneas 164–173). | **PASS** |
| C4 | PARTIAL VERIFIED | Limita el contenido al marco oficial verificado, cita leyes y SII, usa “resumen orientativo” y no presenta garantías adicionales como práctica general (líneas 198–231). | **PASS** |
| C5 | VERIFIED AS LIMITED | Atribuye requisitos por entidad, conserva evaluación comercial para Santander/BCI y cédula física para Tenpo, sin prometer elegibilidad universal (líneas 175–192). | **PASS** |
| C6 | CORRECTED | Explica que trabajo, AFP y Fonasa pueden operar con identificaciones alternativas, mientras CuentaRUT exige cédula vigente; conserva el límite migratorio y las fuentes oficiales (líneas 130–142 y 251–259). | **PASS** |

## Scorecard NORMA_YMYL

| Dimensión | Peso | Nota | Aporte ponderado | Justificación adversarial |
| --- | ---: | ---: | ---: | --- |
| Respuesta ancla | 35% | 9.7/10 | 3.40 | El `articleLead` responde de inmediato las tres necesidades, conserva la condición tributaria crítica, declara vigencia, enumera límites y enlaza fuentes profundas. No promete elegibilidad bancaria ni contractual universal. |
| Precisión + fuentes | 25% | 9.7/10 | 2.43 | Los claims C1–C6 se trasladan según sus estados canónicos; las reglas críticas tienen fuente oficial específica. La síntesis del art. 2 cita primero texto operativo, conserva condiciones y añade limitador. La UF queda trazada al Banco Central. |
| Vigencia + calendario | 15% | 9.8/10 | 1.47 | `validAsOf`, aviso visible y referencias operativas usan 2026-06-22 de forma coherente. No se describen reformas futuras que exijan separar aprobación, vigencia e implementación. |
| Excepciones + cobertura | 15% | 9.8/10 | 1.47 | Distingue residencia, obligación tributaria, cédula, menores extranjeros, evaluaciones comerciales, identificación provisoria y límites del análisis legal. Las excepciones materiales del addendum están cubiertas. |
| Claridad + estructura | 10% | 9.7/10 | 0.97 | La secuencia RUT → cuenta → arriendo, las fuentes próximas al claim y las FAQ permiten actuar sin contradicciones. Los avisos de alcance son visibles y el texto permanece en español neutral. |
| **Total ponderado** | **100%** |  | **9.73/10** | **Supera el umbral obligatorio de 9.5/10 y no presenta defectos HIGH.** |

_Cálculo con aportes no redondeados: 9.7×0.35 + 9.7×0.25 + 9.8×0.15 +
9.8×0.15 + 9.7×0.10 = 9.73._

## Defectos y observaciones

**No se encontraron defectos de contenido abiertos ni regresiones introducidas por la quinta
remediación.** Los cuatro defectos del Gate 06 previo están resueltos y los seis criterios de
cierre del suplemento S1–S5 se cumplen.

### INFO #1 — Concentración de stages 01–04

Los stages 01–04 fueron producidos por una misma sesión. Esto concentra investigación,
estructura y redacción y se mantiene declarado como defecto de proceso. No altera por sí solo
el scorecard de contenido. La independencia obligatoria entre `DraftAgent` y
`ComplianceAgent` queda satisfecha por esta sesión fresca; no reemplaza el control humano.

### INFO #2 — Gate 05 y publish packet contienen metadatos históricos que deberá revisar el HumanEditor

`07-publish-packet.md` aún describe estados anteriores de Gate 05/Gate 06. Este Gate 06 no lo
modifica ni marca casillas: la consolidación y el sign-off pertenecen exclusivamente a Carlos
Ortega en Gate 07. Esta observación no afecta la conformidad del borrador auditado.

## Veredicto global

**PASS — 9.73/10.** La quinta remediación cumple los MUST aplicables de `NORMA_YMYL`, supera
el umbral obligatorio de 9.5/10, no contiene `TODO:SOURCE`, no presenta defectos HIGH ni otros
defectos de contenido abiertos y no introduce regresiones detectables respecto del dossier
canónico.

Este veredicto completa únicamente Gate 06. **No autoriza publicación, no habilita Gate 07 por
sí solo y no constituye sign-off humano.** Todas las casillas de `07-publish-packet.md` deben
permanecer sin marcar hasta la revisión y decisión de Carlos Ortega (HumanEditor).

## Escalamiento humano

Carlos Ortega debe revisar el borrador, este informe, la evidencia de Gate 05, la concentración
de roles 01–04 y los prerrequisitos técnicos antes de decidir Gate 07. La decisión final de
publicación es exclusivamente humana.
