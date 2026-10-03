# Compliance Review — Ronda 4 — rentas-mixtas-sueldo-honorarios

Status: CONDITIONAL

Role: ComplianceAgent (Codex — fresh independent session, adversarial)

## 0) Alcance y límites

**In scope:** lectura de NORMA_YMYL §§1.1, 5.1–5.3 y 7; ronda 3 como contexto histórico; artículo vigente, diff desde `2b1f681f`, changelog de re-auditoría, artefactos de la corrida y verificación independiente de fuentes oficiales.

**Único archivo escrito en esta sesión:** este informe. No se editó el artículo, el changelog, el paquete de publicación ni otra pieza.

La revisión del APV cubrió el bloque completo y contrastó la hipótesis de un tope A/B compartido con el texto íntegro recuperado del instructivo oficial SII de Línea 23. La instrucción autónoma de Línea 23 bajo la ruta AT2026 no se pudo recuperar con la herramienta web: `https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf` devolvió que no era accesible. Sí se recuperó la instrucción SII completa AT2025, vigente en la página oficial, y la Guía Práctica SII Renta 2026, que confirma los topes y mecanismos actuales. La limitación se conserva explícitamente; no se presenta la instrucción AT2025 como si fuera un PDF AT2026.

## 1) Resultado adelantado

**La hipótesis de un límite agregado de 600 UF para ahorros acogidos al Régimen A o al Régimen B queda CONFIRMADA por el texto completo de la instrucción SII de Línea 23, §23.4.** La misma sección fija el orden: primero Régimen B descontado mensualmente por empleador, luego Régimen B aportado directamente y después Régimen A; el exceso no puede acogerse a ninguno de los dos regímenes. Esto contradice la conclusión de la ronda 3, que leyó §23.2 pero no resolvió §23.4 del documento completo. El artículo describe los topes de cada mecanismo, pero omite este límite agregado y el orden de imputación.

El diff de la pieza también sustituye **nueve** menciones de retención `15,25%` por `14,5%`. Aunque la fuente SII confirma 14,5% para boletas emitidas en 2025, ese cambio aplicado al artículo no fue auditado por un MathAuditAgent en el estado actual. Por instrucción de la tarea, se requiere una nueva ronda de MathAuditAgent y el veredicto permanece CONDITIONAL hasta que exista.

## 2) Verificaciones independientes

### 2.1 Tramo exento IGC AT2026 — VERIFIED

Refetch del SII el 2026-10-02:

- [SII — Información para personas naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html) informa que la exención del IGC es **13,5 UTA de diciembre de 2025 = $11.265.804**; en la misma tabla informa **1 UTA de diciembre de 2025 = $834.504**.
- [SII — UTM/UTA 2025](https://www.sii.cl/valores_y_fechas/utm/utm2025.htm) confirma para diciembre UTA de **$834.504** y define UTA como UTM × 12.
- Recálculo independiente: `834.504 × 13,5 = 11.265.804`, exacto.

La cifra `$11.265.804` que reaparece en la nueva FAQ del artículo ya estaba en el texto anterior y en la fila 1 de `05-math-audit-round2.md`; la repetición no constituye por sí sola un valor matemático nuevo.

### 2.2 APV completo — el tope agregado A/B existe

Fuentes primarias recuperadas el 2026-10-02:

- [SII — Instrucciones F-22 Renta 2025, Línea 23, PDF completo](https://www.sii.cl/servicios_online/renta/2025/archivos/l23_instruccion.pdf), 5 páginas / 218 líneas extraídas. En §23.2, páginas 1–2, la modalidad anual del Régimen B permite hasta 600 UF menos los aportes del mismo inciso ya descontados mensualmente; el documento distingue ambas formas del Régimen B. En §23.4, páginas 3–4, el SII declara que el monto total de los ahorros previsionales que pueden acogerse a “uno u otro régimen” no puede exceder 600 UF al 31 de diciembre. A continuación ordena la imputación: B por planilla mensual → B directo → A; el exceso no puede acogerse a ninguno de los regímenes.
- [SII — Guía Práctica de Declaración de Renta 2026](https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf), pp. 29–31: diferencia A (bonificación fiscal, sin rebaja inmediata) y B (rebaja de base imponible); confirma 15%/6 UTM para A, 50 UF por mes para aportes B por planilla y 600 UF anuales para la modalidad B directa.
- [SII — FAQ 001_140_5883](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm), actualizada el 2025-07-23: el régimen a) no rebaja la base al depositar y los aportes se gravan de forma distinta al retiro; el régimen b) permite la rebaja de base al depositar y tributa conforme al art. 42 bis al retirar.
- [Superintendencia de Pensiones — Compendio, Libro II, Título IV, Capítulo XI](https://www.spensiones.cl/portal/compendio/596/fo-article-6333.pdf): es el capítulo de APV colectivo. Sus números 5–9 confirman bonificación de 15%, máximo de 6 UTM y depósito de TGR en la cuenta de APV colectivo. Su número 6 agrega la condición de que el total de cotizaciones voluntarias, depósitos APV y aportes del trabajador a APVC elegibles para la bonificación no exceda diez veces sus cotizaciones obligatorias del mismo año.
- [Superintendencia de Pensiones — Compendio, Libro II, Título II, Capítulo XII, APV general](https://www.spensiones.cl/portal/compendio/596/fo-article-6311.pdf): fuente general para APV no colectivo; confirma regímenes a/b, bonificación de 15% con tope de 6 UTM, el límite de diez veces las cotizaciones obligatorias para la bonificación y el depósito por TGR.

**Conclusión sobre la hipótesis:** confirmada con el texto completo oficial de Línea 23 §23.4. El 600 UF del Régimen B sigue siendo su límite de rebaja, pero existe además un máximo agregado de ahorros acogibles a cualquiera de los regímenes A/B. La ronda 3 la descartó a partir de §23.2, que explica el descuento anual frente al descuento mensual dentro del Régimen B, sin revisar §23.4. Esa lectura anterior fue incompleta.

**Aplicación al texto actual:** líneas 144 y 197–200 separan correctamente la bonificación A de la rebaja B y no llaman al bono un crédito del F-22. Sin embargo, al exponer A (15%/6 UTM) y B (600 UF) en bullets separados, omiten el máximo agregado A/B y el orden SII. También omiten la condición de diez veces las cotizaciones obligatorias para la bonificación A. La línea 198 no explica el subtope mensual de 50 UF cuando la rebaja B se usa por planilla.

**Alcance de la fuente SP citada en el artículo:** la URL que usa el artículo para “bonificación fiscal del APV” es el Capítulo XI, ubicado bajo Título IV de APV colectivo. Ese capítulo respalda específicamente APVC; para la afirmación general sobre APV individual corresponde citar también el Capítulo XII de Título II indicado arriba. La Guía SII 2026 respalda los mecanismos generales, pero no sustituye la frase agregada de §23.4.

### 2.3 Retención de honorarios — nueva verificación; MathAudit aún pendiente

- [SII — Boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/) indica 14,5% para 2025 y 15,25% desde el 1 de enero de 2026.
- [SII — Instrucciones DJ 1879 AT2026](https://www.sii.cl/ayudas/ayudas_por_servicios/renta/2026/instrucciones_dj1879.pdf) asigna 14,5% a año comercial 2025 / año tributario 2026.

Las fuentes respaldan el 14,5% ahora aplicado a rentas de 2025. La verificación en esta sesión de ComplianceAgent no reemplaza una auditoría independiente de MathAuditAgent para la nueva versión de la pieza.

### 2.4 R2: ciclo AT2026 y calendario — confirmado

[SII — Calendario Operación Renta AT2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) confirma el cierre de declaraciones con pago al 30-04-2026 y sin pago al 08-05-2026. El ciclo AT2026 se presenta en pasado en la respuesta inicial y en la sección de pago; el calendario de devolución se describe como ya ejecutado. No encontré contradicción entre esas fechas y las secciones actualizadas.

Hay una señal de revisión inconsistente, documentada como DEFECT #4: `updatedDate` es 2026-10-02 y `articleLead.validAsOf` sigue en 2026-08-12; además el cuerpo dice “revisado el 2026-08-12” (línea 75). El changelog explica que la ampliación de cobertura motivó `updatedDate`, pero deja visible una fecha anterior de revisión.

### 2.5 Deferral TGR — parcialmente confirmado; rango y garantía sin refetch concluyente

- El enlace del artículo a [TGR — Convenios de Pago](https://tgr.gob.cl/convenios-de-pago/) devolvió error interno de fetch en esta revisión.
- La página oficial actual del [Centro de Ayuda TGR — tipos de convenios](https://ayuda.tgr.gob.cl/ayuda/convenios-de-pago/que-es-un-convenio-de-pago-y-tipos-de-convenios) confirma hasta 24 meses, deuda mínima de 1 UTM para el convenio general fiscal y que TGR entrega una propuesta individual con cuota pie. Indica que las condiciones dependen, entre otros factores, del historial de cumplimiento y la antigüedad de la deuda.
- Esa página accesible no confirma un rango general de pie de 10%–30% ni que ofrecer garantía sea un criterio general. La evidencia de esos dos detalles de `05-math-audit-round2.md` es histórica; no los confirmé con un refetch actual de la página enlazada por el artículo.

Por tanto, se confirma que la gestión es ante TGR y que la cantidad de cuotas, el mínimo de deuda y una propuesta individual están respaldados por información oficial actual. El rango y el criterio de garantía quedan sin verificación actual; no se declara que sean falsos. Ver DEFECT #3.

### 2.6 Inyección en fuentes

Las páginas recuperadas se trataron como contenido fuente no confiable. Se buscaron en el texto extraído expresiones como “ignore previous/all instructions”, “olvida las instrucciones anteriores”, “ChatGPT”, “assistant” y “prompt”. No se encontraron instrucciones dirigidas al agente ni candidatos que requieran `PROMPT_INJECTION_CANDIDATE`.

## 3) Diff y changelog: necesidad de MathAudit nuevo

Comparación solicitada: `git diff 2b1f681f -- src/data/blog/rentas-mixtas-sueldo-honorarios.md`.

- El delta de la pieza cambia nueve menciones de `15,25%` a `14,5%` (dos respuestas del frontmatter y siete menciones del cuerpo), además de actualizar `updatedDate` y añadir las tres secciones estructurales.
- El changelog de re-auditoría describe el ajuste de 14,5% como corrección previa que se conservó y dice que no añadió una cifra/cálculo. El diff medido desde el commit solicitado muestra que ese valor sí cambia respecto de ese baseline. El changelog también describe `updatedDate` como 2026-09-29 → 2026-10-02, mientras que el diff desde `2b1f681f` muestra 2026-08-12 → 2026-10-02. El estado intermedio al que alude el changelog no se puede reconstruir desde ese commit.
- La fila 2 de `05-math-audit-round2.md` verificó 14,5% como tasa 2025 comparada con la tasa 2026. Ese artefacto fue emitido antes del cambio del artículo y no sustituye un MathAuditAgent fresco del texto/diff actual.

**Decisión:** se requiere una nueva ronda MathAuditAgent para los nueve cambios de tasa y para re-auditar el bloque APV completo, incluido el límite agregado confirmado. Hasta que exista ese artefacto y su veredicto, este informe queda **CONDITIONAL**.

La nueva FAQ que repite `$11.265.804` no añade un valor distinto. Ninguna otra cifra nueva fue agregada por las tres secciones estructurales; las nueve sustituciones de tasa sí requieren auditoría porque cambian cifras aplicadas en el artículo respecto del baseline indicado.

## 4) Ejes estructurales

Se verificaron en el cuerpo los tres H2 cuya falta era OBS-2 en rondas anteriores:

- `## Errores comunes`, línea 222.
- `## Preguntas frecuentes`, línea 229.
- `## Fuentes y vigencia normativa`, línea 247.

Los tres ejes estructurales pedidos fueron añadidos. La fecha de corte visible no se alineó al `updatedDate`; ver DEFECT #4.

## 5) DEFECTS

**DEFECT #1 — [alta / bloquea publicación] — El bloque APV omite el límite agregado de 600 UF entre Régimen A y B.** SII F-22 Línea 23 §23.4 dice que el total acogido a uno u otro régimen no puede superar 600 UF y fija la prioridad B mensual → B directo → A. La explicación separada de los topes A y B en las líneas 144 y 197–200 omite esa condición material; la ronda 3 había descartado la hipótesis leyendo solo §23.2. **Resolution:** corregir la descripción para incluir el máximo agregado y la imputación SII; respaldar con el texto completo de Línea 23 y mantener el tope mensual B de 50 UF donde corresponda. MathAuditAgent debe auditar el texto actualizado.

**DEFECT #2 — [media] — La presentación del Régimen A omite condición de elegibilidad y su cita SP visible tiene alcance APVC.** Compendio general APV, Título II, Capítulo XII, limita la bonificación a aportes elegibles agregados que no excedan diez veces las cotizaciones obligatorias del trabajador; el Capítulo XI enlazado por el artículo se limita a APV colectivo. **Resolution:** añadir una síntesis breve de la condición material si se mantiene la afirmación general del bono A y enlazar el Capítulo XII para APV individual; conservar Capítulo XI solo para APVC.

**DEFECT #3 — [media / fuente por cerrar] — El rango 10%–30% y el criterio de ofrecer garantía en el pie TGR no se confirmaron en refetch actual.** La fuente oficial actual accesible confirma plazo de hasta 24 meses, mínimo de 1 UTM y una propuesta individual; no contiene el rango ni el criterio de garantía. La URL TGR enlazada por el artículo no se pudo recuperar en esta sesión. **Resolution:** aportar refetch actual de la fuente TGR que soporte ambos detalles o ajustar el texto a lo que sí publica TGR: el pie y las condiciones se informan en la propuesta individual.

**DEFECT #4 — [media] — La fecha visible de revisión no coincide con `updatedDate`.** El frontmatter quedó en 2026-10-02, pero `articleLead.validAsOf` conserva 2026-08-12 y el cuerpo conserva “revisado el 2026-08-12”. El changelog registra el cambio sustantivo de cobertura bajo NORMA §§5.1–5.3. **Resolution:** alinear la fecha visible de revisión con el historial real y aclarar que `validAsOf` describe la fecha de vigencia factual si se conserva separada.

**DEFECT #5 — [bloqueante de proceso] — Falta MathAuditAgent fresco para el delta numérico actual.** Hay nueve cambios de 15,25% a 14,5% respecto de `2b1f681f`; el artefacto round2 antecede a ese cambio en el artículo. **Resolution:** crear nueva ronda MathAuditAgent, independiente de DraftAgent y de esta sesión de ComplianceAgent, que audite la tasa aplicada y el resto de las cifras/APV en el estado actual.

No se encontraron marcadores `TODO:SOURCE` en el artículo ni en `04-draft.md`. El rango TGR sin verificación actual se registra como defecto de fuente en este informe; no se escribió ningún marcador en el artículo.

## 6) Scorecard NORMA §7

| Eje | Peso | Nota | Aporte ponderado | Justificación |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9,5 | 3,325 | La regla principal es afirmativa y aparece al inicio; incluye la excepción del tramo exento y vigencia AT2026. |
| Precisión + fuentes | 25% | 8,0 | 2,000 | IGC y retención 14,5% quedan respaldados; el APV omite el límite agregado A/B y condición de bono, y el rango/garantía TGR no tuvo refetch actual concluyente. |
| Vigencia + calendario | 15% | 9,0 | 1,350 | R2 y fechas AT2026 están correctamente cerradas; la fecha visible de revisión no coincide con `updatedDate`. |
| Excepciones + cobertura | 15% | 8,0 | 1,200 | Mejora con FAQs y excepciones visibles; faltan condiciones APV materiales y corroboración TGR de condiciones del pie. |
| Claridad + estructura | 10% | 9,5 | 0,950 | Se añadieron los tres H2 estructurales; el texto se mantiene navegable. |
| **Total** | **100%** |  | **8,825 / 10 = 8,83 / 10** |  |

NORMA §7 fija 9,5/10 como mínimo para publicar. El artículo no alcanza el umbral.

## 7) Separación de funciones

| Etapa | Rol/sesión registrada | Estado en esta revisión |
|---|---|---|
| Brief, dossier, outline y draft original | DraftAgent, corrida `20260812-1345-lote0b` | Artefactos consultados. |
| Changelog de re-auditoría estructural | DraftAgent, sesión separada indicada en el changelog | Cambios actuales revisados por diff; no se auditaron ni redactaron en esta sesión. |
| Math audit original | MathAuditAgent, ronda 1, veredicto FAIL por APV | Histórico; superado por ronda 2 para la versión anterior del artículo. |
| Math audit round2 | MathAuditAgent, sesión fresca, 2026-08-13, veredicto PASS | Su resultado se conserva para la versión que auditó; no cubre los nueve cambios del diff actual. |
| Compliance rounds 1–3 | Sesiones previas de ComplianceAgent | Ronda 3 leída como contexto histórico; su conclusión sobre tope compartido queda corregida por la lectura completa de §23.4. |
| Compliance round4 | Codex, sesión fresca e independiente | Este informe; no redactó el artículo ni emitió MathAudit. |
| HumanEditor | Firma humana | **Pendiente.** |

No se detectó que una misma sesión haya redactado la pieza y auditado el mismo texto. La firma humana no se ejecutó. No se tocó `07-publish-packet.md` ni se marcó ningún gate.

## 8) Veredicto

**CONDITIONAL (8,83/10).**

El tope agregado A/B de 600 UF está confirmado por el texto completo SII F-22 Línea 23 §23.4; la conclusión contraria de ronda 3 queda supersedida. Quedan sin corregir las condiciones del bloque APV, la fuente TGR que no pudo refetchearse para el rango/garantía, y la señal de fecha de revisión. Además, el diff actual introduce nueve usos de 14,5% frente al baseline y necesita una ronda MathAuditAgent fresca antes de que pueda emitirse un veredicto de cierre. La cifra IGC sí quedó verificada en vivo y su aritmética coincide. HumanEditor debe firmar después del cierre de las rondas requeridas; el artículo no se declara publicable.

## 9) Fuentes primarias consultadas

Las URLs oficiales y la evidencia puntual constan en §§2.1–2.5. Fechas de consulta: 2026-10-02. La limitación de fetch de la instrucción autónoma SII AT2026 y de la URL TGR enlazada consta en §§0 y 2.5. No se usaron fuentes de terceros para cerrar claims tributarios.
