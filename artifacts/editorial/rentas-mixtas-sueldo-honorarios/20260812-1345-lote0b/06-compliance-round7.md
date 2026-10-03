# Revisión de cumplimiento — rentas mixtas — round 7

Fecha de revisión: 2026-10-02  
Versión revisada: `src/data/blog/rentas-mixtas-sueldo-honorarios.md`, estado posterior a Prettier; comparada con `HEAD` (`4ebfafb42915c23acf1d735248b881009e9ae193`).  
Alcance de edición: únicamente este informe.

**Status: BLOCKED — DEFECTS FOUND**  
**Role: ComplianceAgent (subinstancia independiente de Codex/GPT-6; revisión adversarial).**

## Dictamen

**Veredicto: FAIL.** Las correcciones principales de las rondas anteriores ya
están presentes y se confirman con fuentes primarias actuales: la obligación de
F22 no se presenta como universal; la propuesta del SII se describe como basada
en datos informados y revisable; la base imponible se distingue de los
honorarios brutos; el ejemplo usa el umbral oficial sin calcular un resultado
individual. También se sostienen los cambios del límite APV, la condición de
10 veces las cotizaciones obligatorias, el alcance del convenio TGR, la cifra
IGC y la tasa de 14,5% limitada a boletas emitidas en 2025 para AT2026.

Permanece un defecto material en el alcance de la bonificación APV Régimen A:
el artículo omite que la bonificación se concede cuando el ahorro se destina a
anticipar o incrementar la pensión. Además, la versión inspeccionada del
registro público de correcciones no contiene la entrada material que el
changelog dice haber agregado. Ambos puntos bloquean publicación. No edité el
artículo, el packet, `src/data/correcciones.json` ni gates; no firmé ni marqué
ninguna casilla.

## Método y evidencia

- Leí `docs/editorial/NORMA_YMYL.md` §§1, 2.4, 3, 5, 6 y 7;
  `docs/editorial/DEFINITION_OF_DONE.md` §§1, 2, 5 y 6; y
  `context/EDITORIAL_AI_PIPELINE.md` §§2, 8 (Stage 06) y 9.
- Contrasté el artículo posterior al formato con su diff frente a `HEAD`. Leí
  `01-brief.yaml`, `04-draft.md`, `05-math-audit.md`, el changelog del fix, el
  extracto de Línea 23, la observación TGR, `06-compliance-round6.md` y el
  packet. Round 6 se trató solo como contexto histórico, no como autoridad.
- Refetcheé páginas y documentos oficiales el 2026-10-02. Para el PDF de
  Línea 23 y el acordeón de TGR, además de la consulta web, abrí las páginas en
  Chrome y leí el contenido visible.
- La evidencia del run sobre PDF/TGR se usó para reconstruir el método de
  acceso declarado, no para sustituir una verificación independiente. El
  extracto local del PDF es una transcripción derivada; la observación TGR es
  una nota del autor, no una captura íntegra de la fuente.

## Hallazgos

### DEFECT 1 — [MAYOR] APV Régimen A: falta una condición material de la bonificación

**Ubicación:** sección “APV y cómo puede reducir tu impuesto final”, párrafo
“Régimen A”, y FAQ “¿El APV Régimen A rebaja el impuesto del F22?”. El artículo
explica el 15%, el tope de 6 UTM y la condición de 10 veces las cotizaciones
obligatorias del mismo año, pero no indica que el ahorro debe destinarse a
anticipar o incrementar la pensión.

El [Compendio de la Superintendencia de Pensiones, Capítulo XII, nums. 5–7](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html),
refetcheado el 2026-10-02, condiciona el derecho a la bonificación al destino
previsional del ahorro. El num. 7 confirma también el límite de diez veces el
total de cotizaciones obligatorias efectuadas en ese mismo año. Por tanto, la
condición de 10x que ya añadió el artículo es correcta, pero no cubre por sí
sola todos los requisitos relevantes. Presentar el 15% como beneficio de los
aportes sin esa condición puede inducir a esperar la bonificación aunque los
fondos se retiren para otro fin.

**Resolución:** completar la explicación del Régimen A con el destino exigido
por la fuente oficial y, si se describe el retiro antes de pensionarse, su
tratamiento. Mantener separados el bono A y la rebaja de base del Régimen B.

### DEFECT 2 — [BLOQUEANTE] No consta el registro de la corrección material

El changelog `draft-fix-CHANGELOG.md` afirma que registró las correcciones en
`src/data/correcciones.json`. En la versión del registro inspeccionada no
encontré entrada para `rentas-mixtas-sueldo-honorarios` ni para el id
`rentas-mixtas-apv-y-convenios`. El artículo tiene `draft: false` y el diff
cambia de forma material la regla de obligación F22, el tratamiento de la
propuesta, la base imponible y condiciones APV/TGR. Esto activa el hard stop de
`AGENTS.md` y NORMA_YMYL §5.4.

**Resolución:** registrar la corrección material y validar el registro con el
gate correspondiente. Esta auditoría no modificó ese archivo ni ejecutó el
gate.

## Comprobaciones que sí cerraron

| Claim | Evidencia primaria refetcheada el 2026-10-02 | Evaluación |
|---|---|---|
| Obligación AT2026 y umbral | [SII FAQ 001.140.0972.009](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0972.htm), actualizada 2026-03-27; [Guía Práctica AT2026](https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf); [valores SII AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html). Confirman el umbral 13,5 UTA = $11.265.804, presentación obligatoria sobre el umbral según la regla citada y presentación voluntaria bajo o en el umbral para recuperar retenciones u otros créditos. | Correcto y acotado a AT2026; el artículo conserva la salvedad de otras obligaciones. El ejemplo de exactamente 13,5 UTA no deriva impuesto ni devolución. |
| Propuesta F22 | [SII FAQ 001.140.2772.027](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2772.htm), actualizada 2026-04-10; [guía SII para trabajadores independientes AT2026](https://www.sii.cl/destacados/renta/2026/documents/pr_independiente.pdf). La propuesta usa datos informados, permite revisarla/modificarla; la guía muestra el F22 en blanco para completar y la opción de modificar la propuesta. | Se corrigió la afirmación antigua de omisión automática de honorarios. El artículo actual instruye a revisar la información antes de enviar. |
| Honorarios brutos y base imponible | [Formulario 22 AT2026](https://www.sii.cl/ayudas/formularios/f22_at2026.pdf), Recuadro 1; [Guía Práctica AT2026](https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf), caso práctico de honorarios. El formulario separa ingresos brutos, gastos efectivos/presuntos y total de rentas; la guía explica que se rebajan gastos presuntos cuando corresponde. | El texto actual aplica IGC a la base imponible determinada en F22 y no a la suma bruta de boletas. |
| Umbral y tabla IGC | [SII, Información Personas Naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html) y [Guía Práctica AT2026](https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf). | $11.265.804 / 13,5 UTA y factores anuales citados coinciden con los valores oficiales revisados. |
| APV: límite agregado, prelación y 50 UF | [Instrucciones F22 AT2026, Línea 23](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf), §§23.2 y 23.4. La página 1 fija 50 UF mensuales para descuento mensual por empleador; la página 4 muestra el tope agregado de 600 UF, la prelación APV B mensual por empleador → APV B directo → APV A, y que el exceso no se acoge a esos regímenes. | Los tres cambios están correctamente descritos en el artículo. La herramienta web devolvió error al extraer texto del PDF, pero el PDF oficial cargó en Chrome y se comprobó visualmente. `source-extract-l23-at2026.txt` corroboró el contenido, con la limitación de ser una extracción local derivada. |
| APV: condición 10x | [SPensiones, Capítulo XII, num. 7](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html). | La frase sobre diez veces las cotizaciones obligatorias del mismo año está confirmada; véase el DEFECT 1 por la condición de destino previsional omitida. |
| Convenio TGR | [TGR, convenios de pago](https://tgr.gob.cl/convenios-de-pago/), acordeón “Convenio para deudas vencidas de Impuestos Fiscales y Aduaneros”. Refetch visible el 2026-10-02: hasta 24 cuotas; pie 10%–30% según comportamiento de pago y si hay garantía; mínimo 1 UTM. | El artículo limita correctamente el rango al producto de deudas fiscales y aduaneras. `source-observation-tgr-2026-10-02.txt` daba cuenta de un 403 de WebFetch; la página exacta sí cargó en Chrome y se expandió en esta revisión. |
| Retención de honorarios | [SII, Boletas de Honorarios](https://www.sii.cl/destacados/boletas_honorarios/). | 14,5% corresponde a boletas emitidas en 2025; 15,25% aplica desde 2026. Las menciones del artículo están expresamente acotadas a boletas 2025 / AT2026. |
| Fechas AT2026 y búsqueda AT2027 | [Calendario SII AT2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm); [portal Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/); [índice de noticias SII 2026](https://www.sii.cl/noticias/2026/index.html). | Se verificó el cierre AT2026 citado. En las dos páginas de 2026 no encontré calendario AT2027 al 2026-10-02. La afirmación del artículo está acotada a esa consulta y no prueba que no exista información en otro lugar o publicada después. |

## Separación de funciones y estado del run

| Rol | Evidencia disponible | Evaluación |
|---|---|---|
| DraftAgent | Fue la instancia raíz `/root`. `draft-fix-CHANGELOG.md`, `draft-reaudit-CHANGELOG.md` y el packet indican que retomó edits previos del árbol de trabajo. | No fue una sesión DraftAgent fresca; así queda declarado en los registros. |
| MathAuditAgent | Existe `05-math-audit.md` con estado DRAFT y un hallazgo APV sobre la versión anterior. | No se generó otro `05-*` en esta tarea. Este informe no reemplaza una auditoría matemática actualizada. |
| ComplianceAgent round 7 | Esta revisión proviene de una subinstancia distinta de `/root`, modelo Codex/GPT-6. | Es una instancia separada para revisión adversarial; el playbook Stage 06 prescribe Claude Code, por lo que este informe no se presenta como ejecución literal de ese runtime. |
| HumanEditor | No hay firma humana en la evidencia revisada. | Pendiente. |

`06-compliance-round6.md` se consultó como antecedente histórico. Sus defectos
principales de obligación universal, propuesta incompleta y aplicación del IGC
a ingresos brutos ya no aparecen en la versión actual revisada.

## Scorecard NORMA_YMYL §7

| Dimensión | Puntaje | Motivo |
|---|---:|---|
| Respuesta ancla (35%) | 9/10 | Responde pronto con regla, umbral AT2026 y salvedad de otras obligaciones. |
| Precisión y fuentes (25%) | 8/10 | Fuentes actuales y correcciones principales correctas; falta la condición material de destino del APV A. |
| Vigencia y calendario (15%) | 9,5/10 | Fechas, cifras y tasas limitadas a AT2026 / ingresos 2025; búsqueda AT2027 acotada por fecha y páginas. |
| Excepciones y cobertura (15%) | 7,5/10 | Cubre umbral voluntario y otras obligaciones; omite una condición de elegibilidad del bono A. |
| Claridad y estructura (10%) | 9/10 | Incluye paso a paso, casos, errores, FAQ, fuentes y ejemplo numérico orientativo. |
| **Total ponderado** | **8,6/10** | **No alcanza el mínimo de 9,5/10; hay defectos abiertos.** |

## Limitaciones y cierre

- El texto extraído del PDF de Línea 23 en los artefactos del run no es por sí
  mismo evidencia primaria independiente. La fuente oficial actual sí fue
  abierta en Chrome y se verificaron visualmente las páginas pertinentes.
- La página TGR dio error a la extracción web, pero su acordeón cargó en Chrome
  en esta revisión. El artefacto de observación anterior es una nota de acceso,
  no captura íntegra; se contrastó con la página en vivo.
- No ejecuté tests ni gates; el encargo era una auditoría de contenido y el
  único archivo creado fue este informe. No edité artículo, packet, registro
  público de correcciones ni gates; tampoco creé MathAudit, marqué `[X]` o
  firmé.

**Veredicto final: FAIL — publicación bloqueada por DEFECT 1 y DEFECT 2.**
