# Revisión de cumplimiento — rentas mixtas — round 12

Status: **BLOCKED — DEFECTS FOUND**  
Role: ComplianceAgent (OpenAI GPT-6 — sesión independiente, adversarial)  
Fecha: 2026-10-03 (America/Santiago)  
Artículo revisado: `src/data/blog/rentas-mixtas-sueldo-honorarios.md`  
Veredicto: **FAIL — 9,40/10**

## Alcance y método

**En alcance:** artículo vigente y `git diff HEAD`; NORMA_YMYL §§1.1, 5.1–5.3 y 7; Definition of Done §2; Math Audit histórico y round 4; packet, changelog, Compliance R10/R11 follow-up; fuentes oficiales indicadas abajo y el registro actual `src/data/correcciones.json`.

**Fuera de alcance:** modificar artículo, packet, changelog, registro, gates o cualquier otro archivo. Solo se creó este informe. No ejecuté tests ni gates y no marqué, firmé ni declaré publicable.

El artículo no difiere de `HEAD`. Leí `05-math-audit.md` como antecedente de una versión previa, no como autoridad del contenido actual. También traté R10/R11 como contexto y volví a comprobar en vivo los hechos principales.

## Evidencia actual

- La página anual de [SII — Información para Personas Naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html) publica la exención de 13,5 UTA de diciembre de 2025 por **$11.265.804**, además de la tabla anual IGC y sus factores. El artículo usa ese monto y los tramos/tasas marginales correspondientes; no confunde esa tabla anual con la tabla mensual IUSC.
- La [FAQ SII 001.140.0972.009](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0972.htm), actualizada el 27-03-2026, dice que la obligación por honorarios aplica cuando las rentas imponibles antes de deducciones superan 13,5 UTA y que bajo el umbral se puede presentar para recuperar retenciones. La tabla anual confirma que el límite, incluida la igualdad, es tramo exento. El artículo limita su explicación a AT2026 y conserva la salvedad de otras obligaciones.
- La página vigente de [SII — Boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/) muestra 14,5% para 2025, 15,25% para 2026 y 16% para 2027. El artículo acota 14,5% a boletas emitidas en 2025 para AT2026; 15,25% aparece solo en el título del enlace a una guía de 2026.
- La [FAQ SII sobre regímenes APV](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm) distingue los regímenes: A no obtiene la rebaja de base al depositar; B sí la obtiene, con tributación al retirar.
- El texto íntegro del [PDF SII Línea 23 AT2026](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf) fue descargado en vivo por el orquestador el 2026-10-03: 5 páginas, 274 líneas y 3.228 palabras. Revisé la extracción completa `/tmp/l23-instruccion-at2026-fulltext-2026-10-03.txt`; tiene el mismo SHA-256 y es byte a byte idéntica a `source-extract-l23-at2026.txt` del run. No atribuyo esa descarga a esta subinstancia. §23.2 limita a 50 UF mensuales el descuento por empleador y describe la reliquidación anual de aportes directos; §23.4 fija el tope agregado de 600 UF entre regímenes, la prelación B mensual vía empleador → B directo → A y la exclusión del exceso; §23.5 trata la reliquidación cuando existen otras rentas afectas al IGC; §23.7 dice que quien ya usó el beneficio mensual no registra de nuevo esos ahorros en el código 765 porque el beneficio ya se aplicó al IUSC.
- La página viva de [SPensiones, Capítulo XII](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html), nums. 5–7, confirma la bonificación A de 15%, el destino de anticipar o incrementar pensión, el tope anual de 6 UTM y la condición de diez veces las cotizaciones obligatorias del mismo año. La [página del Capítulo XI](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html) trata APVC; el artículo la usa solo para ese contexto.
- La página exacta [TGR — Convenios de pago](https://tgr.gob.cl/convenios-de-pago/) cargó en Chrome. El panel del producto “Convenio para deudas vencidas de Impuestos Fiscales y Aduaneros” muestra hasta 24 cuotas, pie de 10%–30% según comportamiento de pago y existencia de garantía, y mínimo de 1 UTM. El artículo asigna esas condiciones a ese producto y no las generaliza.
- El [comunicado SII del calendario AT2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) muestra los depósitos 1–8 abril → 29 abril, 9–23 abril → 15 mayo y 24 abril–8 mayo → 27 mayo, además del período de declaraciones con pago hasta el 30 de abril. La tabla fija el último período de devoluciones en el 8 de mayo. En el [portal Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/) y el [índice de noticias SII 2026](https://www.sii.cl/noticias/2026/index.html), refetchados en vivo el 2026-10-03, no encontré un calendario AT2027 en esas páginas. El índice incluye una noticia del 1 de septiembre sobre DJ 1965 desde Operación Renta 2027. La oración del artículo queda correctamente limitada a los dos recursos revisados y a la fecha 2026-10-02.

**Límites de lectura:** el extractor web devolvió error interno para el PDF de Línea 23 y para TGR; el primero se cotejó con la extracción íntegra viva recién descargada y el segundo se leyó renderizado en Chrome. El portal e índice SII se leyeron renderizados en Chrome. No afirmo haber inspeccionado directamente el visor del PDF desde esta subinstancia.

## MathAudit y cobertura de la versión

`05-math-audit-round4.md` afirma auditar el artículo vigente y el `git diff HEAD`; confirmé que el diff está vacío. Su tabla cubre **25 grupos de claims** y concluye 25 VERIFIED, 0 TODO:SOURCE y 0 ERROR. En este informe reconfirmé los valores, alcance y condiciones principales arriba: umbral IGC, tramos y tasas, 14,5% para 2025/AT2026, ejemplo en el umbral sin resultado tributario derivado, límites y condiciones APV, calendario, y rango/producto TGR.

La extracción íntegra de Línea 23 respalda el límite agregado, prelación y sublímite citados. La fila histórica APV ERROR en `05-math-audit.md` corresponde a una redacción anterior; las ubicaciones actuales tienen A/B correctamente identificados. **El HOLD matemático de contenido queda resuelto por la auditoría vigente R4.** El archivo histórico no se reescribe ni se sustituye en esta tarea.

El packet aún conserva el reconcile anterior a R4, que afirma que no existe auditoría fresca y que el HOLD sigue pendiente. Por alcance no actualicé ese estado: es una etiqueta obsoleta frente a R4, no evidencia de un ERROR matemático vigente. El resto de la publicación sigue bloqueado por los defectos y el sign-off humano pendiente.

## Hallazgos

### DEFECT #1 — [HIGH] Instrucción general sobre declarar por APV B

En la línea 227, el artículo dice: “Para el Régimen B, debes declarar (no sirve solo aceptar la propuesta) para que la rebaja se refleje en el impuesto determinado del F22”. La afirmación no distingue el APV B directo, cuya rebaja anual puede requerir reliquidación, del descuento mensual por empleador. Línea 23 §§23.2 y 23.7 confirma que el segundo reduce el IUSC durante el año y que no se vuelve a registrar en el código 765 del F22. La frase general puede llevar a creer que toda persona con APV B debe presentar F22 para obtener ese beneficio; además, “no sirve solo aceptar la propuesta” no explica qué dato faltaría si la propuesta ya incluye la rebaja.

**Resolución:** precisar que la presentación/reliquidación corresponde al uso anual de aportes directos que deban incorporarse al F22; aclarar que el descuento mensual por empleador opera en el IUSC durante el año; instruir revisar la propuesta y modificarla solo si falta el dato. Mantener la salvedad de obligaciones F22 que surjan por otras razones.

### DEFECT #2 — [HIGH] Registro público incompleto para el cambio material de calendario

El artículo previo afirmaba de forma general que AT2027 aún no tenía calendario publicado por el SII; la versión actual limita la observación a dos páginas y fecha la búsqueda al 2026-10-02. Es una corrección material de alcance y vigencia sobre un calendario, categorías materiales según NORMA §5.4. El registro vigente contiene la entrada `rentas-mixtas-apv-y-convenios` (2026-10-02) y enlaza la página correcta, pero sus campos `wrong` y `fixed` cubren umbral/F22, APV, tasa y TGR; no registran la afirmación AT2027 anterior ni su acotación a páginas/fecha. La entrada existe, pero no registra esta parte de la corrección.

**Resolución:** ampliar esa entrada existente para identificar la afirmación anterior y el alcance factual corregido, con las fuentes/páginas consultadas y fecha de revisión. No crear ni modificar registros en esta pasada. La diferencia se comprobó directamente en el JSON vigente; el diff actual contra HEAD agrega una entrada de otro artículo y no modifica la entrada de rentas mixtas.

### DEFECT #3 — [CRITICAL] Packet contiene un sign-off marcado pese a declarar firma pendiente

En `07-publish-packet.md:83` figura `[x] HumanEditor sign-off`, mientras las líneas 73–77 dicen que HumanEditor tiene firma pendiente y las notas de rounds 10/11 indican que no se firmó. El reconcile final del packet también sostiene el HOLD por falta de MathAudit, aunque R4 ahora existe y pasó para el artículo actual. La casilla de sign-off es un estado contradictorio y una firma marcada en un artefacto compartido que solo el editor humano puede corregir. No la marqué ni firmé.

**Resolución:** HumanEditor debe aclarar el sign-off y el responsable del packet debe reconciliar el HOLD con R4 después de resolver los defectos de este informe. No se puede tratar la casilla marcada como aprobación verificada.

## DoD §2 y separación de funciones

El artículo satisface la estructura mínima: un H1; H2 para “Qué es y qué cambia”, “Paso a paso”, “Casos frecuentes”, “Errores comunes”, “Preguntas frecuentes” y “Fuentes y vigencia normativa”; e incluye el ejemplo orientativo AT2026 sin calcular impuesto, devolución ni saldo individual.

| Etapa | Procedencia registrada | Evaluación de separación |
|---|---|---|
| Draft | Changelog atribuye la edición al agente raíz, que continuó trabajo previo; no se presenta como sesión de exposición cero. | Separada de esta revisión y de R4. |
| MathAudit actual | `05-math-audit-round4.md`, agente MathAudit OpenAI GPT-6 declarado fresco y adversarial. | Revisa el artículo actual; su PASS matemático no firma compliance. |
| Compliance | Este informe, subagente independiente `/root/compliance_rentas_round12`. | No es la instancia Draft ni la MathAudit. |
| HumanEditor | Pendiente según el texto narrativo del packet; casilla marcada en conflicto, véase DEFECT #3. | No atribuyo ni valido firma. |

## Scorecard — NORMA_YMYL §7

| Dimensión | Puntaje | Peso | Ponderado |
|---|---:|---:|---:|
| Respuesta ancla | 9,7 | 35% | 3,395 |
| Precisión y fuentes | 9,2 | 25% | 2,300 |
| Vigencia y calendario | 9,2 | 15% | 1,380 |
| Excepciones y cobertura | 9,5 | 15% | 1,425 |
| Claridad y estructura | 9,0 | 10% | 0,900 |
| **Total** |  | **100%** | **9,40/10** |

La respuesta inicial da el umbral y su marco AT2026; las cifras principales y calendario quedaron refetchados. El descuento en precisión/claridad responde a la generalización sobre APV B; el de vigencia al registro incompleto de la acotación AT2027. Aunque se cumpla la estructura DoD §2 y el scorecard esté completo, los defectos abiertos impiden PASS y publicación.

## Veredicto

**FAIL — BLOCKED.** R4 cubre la versión actual y resuelve el HOLD matemático: no queda ERROR numérico identificado. R10/R11 quedan corroborados en sus claims centrales por los refetches independientes; no se hereda su PASS. Persisten dos defectos de cumplimiento (instrucción APV B insuficientemente acotada y registro público incompleto) y un estado crítico contradictorio del packet respecto del sign-off. Requieren resolución antes de cualquier aprobación humana. Este informe no actualiza el packet ni declara la pieza publicable.
