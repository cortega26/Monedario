Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)

# Math audit — revisión del diff

- Run id: 20261029-1500-utm-audit
- Slug: utm-chile-que-es-como-funciona
- Base revisada: d7418fc2d6cea9d7d4dfeab99c37e9f947d1f6ae
- Alcance: cambios de copy, fechas editoriales, fuentes y registro de correcciones
  en las tres superficies declaradas; no es una reauditoría completa de los
  cálculos preexistentes del artículo.

## Tabla de auditoría

| Claim | Source in 02-dossier | Status | Notes |
|---|---|---|---|
| El ejemplo de UTM para septiembre de 2026 es $71.721. | SII, UTM–UTA–IPC 2026, fila septiembre: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm | VERIFIED | La tabla publica UTM $71.721 para septiembre. El texto ahora lo identifica como histórico y no como valor vigente. |
| La tabla del SII publica un valor UTM por mes. | SII, UTM–UTA–IPC 2026, filas mensuales: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm | VERIFIED | El valor mensual de cada fila coincide con el límite de copy elegido. |
| La revisión editorial tiene fecha 2026-10-29. | Metadata del run y diff contra la base | VERIFIED | Es fecha de revisión, no una fecha de vigencia normativa. Guía: updatedDate y validAsOf; conversor: fecha de consulta de nuevas fuentes. |
| Los valores, fórmulas, tasas y resultados numéricos preexistentes no cambiaron en el diff. | Diff contra d7418fc2d6cea9d7d4dfeab99c37e9f947d1f6ae | VERIFIED | El único monto numérico visible que cambia de contexto es $71.721: permanece igual y ahora se rotula como ejemplo histórico. No se modificaron tablas de cálculo, constantes ni resultados. |
| La pasada residual de autoría no introdujo cifras ni cálculos nuevos. | Diff posterior de guía y conversor; 04-draft.md, sección “Pasada residual” | VERIFIED | Las dos frases reemplazadas solo describen el reajuste mensual y la variación del equivalente en pesos; no hay nueva operación aritmética. |

## Resumen

- Claims revisados en el alcance del diff: 5
- VERIFIED: 5
- TODO:SOURCE: 0
- ERROR: 0

## Límites y hallazgos fuera de la revisión aritmética

- Este resultado verifica el delta de esta corrección; no certifica nuevamente
  todos los ejemplos históricos y cálculos que ya existían en la guía.
- No se afirma día hábil/calendario ni relación exacta entre el mes de IPC y
  el mes de UTM.
- La fuente SII Educa respalda el reajuste mensual según IPC; la tabla anual
  respalda los valores por mes. La circular SII N.º 39 se mantiene como
  contexto y no se usa para deducir una fórmula.
- Después de la pasada residual de DraftAgent, una búsqueda de las tres
  superficies no encontró afirmaciones que digan que la UTM sube o baja según
  la inflación. El resultado de ComplianceAgent sigue pendiente.

## Veredicto

PASS — dentro del alcance declarado del diff, no hay errores aritméticos ni
cambios numéricos sin fuente. El resultado no reemplaza la revisión de
ComplianceAgent ni la aprobación humana de publicación.
