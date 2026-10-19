# Auditoría matemática — ronda 4

Status: DRAFT — pending ComplianceAgent review  
Role: MathAuditAgent (OpenAI GPT-6 — fresh, adversarial subagent)  
Fecha de auditoría: 2026-10-03 (America/Santiago)  
Verdict: **PASS**

## Alcance y criterio

Audité la versión actual de `src/data/blog/rentas-mixtas-sueldo-honorarios.md`,
incluidos sus umbrales, tasas, tramos, topes, condiciones porcentuales, plazos,
fechas, ejemplo y cifras incluidas en el enlace descriptivo a la guía de
honorarios 2026. La extracción del artículo contra `HEAD` no muestra cambios;
la auditoría se refiere al contenido actual del archivo.

`05-math-audit.md` se leyó como registro histórico de hallazgos, no como
autoridad para la versión actual. El resultado de esta ronda no sustituye la
revisión de Compliance ni la decisión de HumanEditor. No se editaron el
artículo, el informe histórico, el changelog, el packet ni el registro de
correcciones.

## Evidencia y procedencia de refetch

Las fuentes oficiales listadas abajo se consultaron en vivo el 2026-10-03,
salvo donde se especifica otra fecha. Para el calendario SII y el producto
TGR se usó Chrome, que permitió leer las páginas que el extractor web no
devolvió como texto legible.

El orquestador descargó el [PDF SII de instrucciones F22 AT2026, Línea 23](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf)
el 2026-10-03 y ejecutó `pdfinfo` y `pdftotext -layout`: 5 páginas, 274 líneas
y 3.228 palabras extraídas. La extracción viva está en
`/tmp/l23-instruccion-at2026-fulltext-2026-10-03.txt`; se informó que coincide
byte a byte con el extracto completo del 2026-10-02 guardado en
[`source-extract-l23-at2026.txt`](./source-extract-l23-at2026.txt). No atribuyo
esa descarga o extracción a esta subinstancia. Revisé el contenido extraído
para los límites, prelación y exceso de APV.

| Fuente primaria refetchada | Uso en esta auditoría |
| --- | --- |
| [SII — Personas Naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html), fetch 2026-10-03 | UTA de diciembre de 2025, exención y tabla anual IGC en pesos y factores. |
| [SII — FAQ honorarios 001.140.0972.009](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0972.htm), fetch 2026-10-03 | Umbral de obligación por honorarios y opción de declaración voluntaria bajo el umbral para recuperar retenciones. |
| [SII — tabla IUSC 2026](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm), fetch 2026-10-03 | Confirmación de que esa página es la tabla mensual del IUSC; no se usó para reemplazar la fuente anual IGC. |
| [SII — Boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/), fetch 2026-10-03; [FAQ tasa 2026, 001.140.8398.009](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8398.htm), fetch 2026-10-03 | Tasa 14,5% de 2025 para el artículo AT2026; tasa 15,25% solo en el título del enlace que remite a la guía de 2026. |
| [SII — calendario Operación Renta AT2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm), fetch 2026-10-03, leído en Chrome | Fechas de cierre y calendario de depósitos. |
| [SII — formularios y plazos 2026](https://www.sii.cl/ayudas/ayudas_por_servicios/2120-formularios_y_plazos_2026-2171.html), fetch 2026-10-03 | Certificado asociado a F1887, n.º 6, con fecha anterior al cierre de marzo. |
| [SII — FAQ APV 001.140.5883.011](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm), fetch 2026-10-03 | Diferencia entre rebaja de base del régimen B y tratamiento del régimen A. |
| [Superintendencia de Pensiones — Compendio, Capítulo XII, APV general](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html), fetch 2026-10-03 | Bonificación A, destino previsional, tope y condición de cotizaciones obligatorias. |
| [Superintendencia de Pensiones — Compendio, Capítulo XI, APVC](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html), fetch 2026-10-03 | Alcance colectivo (APVC) del Capítulo XI. |
| [TGR — convenios de pago](https://tgr.gob.cl/convenios-de-pago/), fetch 2026-10-03, producto desplegado en Chrome | Rango de pie y cuotas del producto para deudas vencidas de Impuestos Fiscales y Aduaneros. |

## Auditoría claim por claim

Se auditaron **25 grupos de afirmaciones numéricas**. `VERIFIED` significa que
la cifra, el contexto temporal y la formulación comprobable coinciden con la
fuente primaria; no es un juicio de cumplimiento legal integral.

| N.º | Claim actual (ubicación aproximada) | Fuente primaria | Estado | Comprobación adversarial |
| ---: | --- | --- | --- | --- |
| 1 | Exención/umbral IGC AT2026: 13,5 UTA = $11.265.804; 1 UTA dic-2025 = $834.504 (líneas 24, 76, 94, 98, 260) | SII Personas Naturales AT2026; FAQ honorarios | VERIFIED | La tabla SII da ambos valores. Cálculo independiente: 13,5 × $834.504 = $11.265.804 exactamente. |
| 2 | Ejemplo con renta imponible exactamente $11.265.804: queda en el tramo exento y permite declaración voluntaria para solicitar devolución (línea 100) | SII Personas Naturales AT2026; FAQ 001.140.0972.009 | VERIFIED | El valor coincide con el límite superior exento; la FAQ permite declaración voluntaria bajo el umbral para recuperar retenciones. No se calcula una devolución individual. |
| 3 | Tramo 0–13,5 UTA: exento (tabla IGC) | SII Personas Naturales AT2026 | VERIFIED | Coincide con el tramo exento oficial. |
| 4 | Más de 13,5 a 30 UTA: 4% marginal | SII Personas Naturales AT2026 | VERIFIED | Límites y factor 0,04 coinciden. |
| 5 | Más de 30 a 50 UTA: 8% marginal | SII Personas Naturales AT2026 | VERIFIED | Límites y factor 0,08 coinciden. |
| 6 | Más de 50 a 70 UTA: 13,5% marginal | SII Personas Naturales AT2026 | VERIFIED | Límites y factor 0,135 coinciden. |
| 7 | Más de 70 a 90 UTA: 23% marginal | SII Personas Naturales AT2026 | VERIFIED | Límites y factor 0,23 coinciden. |
| 8 | Más de 90 a 120 UTA: 30,4% marginal | SII Personas Naturales AT2026 | VERIFIED | Límites y factor 0,304 coinciden. |
| 9 | Más de 120 a 310 UTA: 35% marginal | SII Personas Naturales AT2026 | VERIFIED | Límites y factor 0,35 coinciden. |
| 10 | Más de 310 UTA: 40% marginal | SII Personas Naturales AT2026 | VERIFIED | Límite y factor 0,40 coinciden. |
| 11 | Retención de 14,5% para boletas emitidas en 2025, aplicada al contexto AT2026 (repetida en FAQ, tabla y cuerpo) | SII — Boletas de honorarios; Personas Naturales AT2026 | VERIFIED | La fuente temporaliza 14,5% al año comercial 2025. El artículo no usa esa tasa como tasa de boletas de 2026 ni como cálculo del IGC final. |
| 12 | Declaraciones AT2026 con pago: plazo hasta 30-04-2026 (líneas 96, 245) | Comunicado calendario SII AT2026 | VERIFIED | Coincide con el calendario oficial para declaraciones con pago. |
| 13 | Declaraciones AT2026 sin pago/con devolución: plazo hasta 08-05-2026 (líneas 96, 104) | Comunicado calendario SII AT2026 | VERIFIED | Coincide con el calendario oficial para declaraciones sin pago. |
| 14 | Depósitos del calendario AT2026: presentadas 1–8 abril → 29 abril; 9–23 abril → 15 mayo; 24 abril–8 mayo → 27 mayo (líneas 233–239) | Comunicado calendario SII AT2026 | VERIFIED | Las tres bandas y fechas de depósito coinciden con la tabla oficial. |
| 15 | Certificado de remuneraciones y retenciones disponible/entregado antes de fin de marzo (línea 180) | SII — formularios y plazos 2026, fila F1887 y Certificado n.º 6 | VERIFIED | La tabla oficial asocia el certificado n.º 6 al F1887 y publica un plazo anterior al cierre de marzo; “antes de fin de marzo” es una descripción menos precisa, no una fecha posterior. |
| 16 | Régimen A: bonificación estatal de 15% destinada a ahorro para anticipar o incrementar pensión; depósito TGR en cuenta previsional; no rebaja base ni es crédito F22 (líneas 171, 224, 268) | SPensiones, Capítulo XII, nums. 5–7; SII FAQ APV | VERIFIED | La norma fuente confirma bonificación, destino previsional y depósito en cuenta APV. La distinción de base/crédito es consistente con la FAQ SII. |
| 17 | Tope bonificación A: 6 UTM anuales (líneas 171, 224) | SPensiones, Capítulo XII | VERIFIED | El Compendio expresa el límite anual en esos términos. |
| 18 | Aportes elegibles para bonificación A limitados a 10 veces las cotizaciones obligatorias del mismo año (línea 224) | SPensiones, Capítulo XII | VERIFIED | El límite y el mismo año calendario coinciden con los nums. 5–7; no se extrapola una cifra a otro año. |
| 19 | Régimen B reduce la base imponible del IGC (líneas 171, 225, 253, 268) | SII FAQ APV; instrucciones F22 AT2026, Línea 23 | VERIFIED | Las fuentes mantienen la identificación correcta: rebaja de base en B; el beneficio A es la bonificación previsional. |
| 20 | APV B por descuento mensual del empleador: sublímite de 50 UF por mes (línea 225) | Instrucciones F22 AT2026, Línea 23, §§23.2 y 23.4 | VERIFIED | El texto íntegro del PDF confirma el sublímite mensual en ese mecanismo. No se extiende a la aportación directa. |
| 21 | Tope agregado de 600 UF para aportes acogidos a A o B (líneas 171, 225) | Instrucciones F22 AT2026, Línea 23, §§23.2–23.4 | VERIFIED | La instrucción confirma el límite agregado entre regímenes. |
| 22 | Orden de imputación: B mensual vía empleador, luego B directo, luego A; exceso no se acoge a ninguno (línea 225) | Instrucciones F22 AT2026, Línea 23, §23.4 | VERIFIED | Coinciden prelación y tratamiento del exceso en la extracción completa. |
| 23 | Convenio TGR del producto específico: hasta 24 cuotas mensuales (línea 247) | Página exacta TGR, producto “Convenio para deudas vencidas de Impuestos Fiscales y Aduaneros” | VERIFIED | El producto desplegado dice “hasta 24 cuotas”; el artículo conserva el límite bajo ese producto. |
| 24 | Pie de 10%–30%, según comportamiento de pago y existencia/presentación de garantía, solo para ese producto TGR (líneas 247, 272) | Página exacta TGR, mismo producto | VERIFIED | El producto asocia el intervalo al comportamiento de pago y a si hay garantía. El artículo limita expresamente la regla al convenio descrito. |
| 25 | El título del enlace “Boleta de honorarios 2026” anuncia 15,25% (línea 214) | SII FAQ 001.140.8398.009, actualizada 2026-08-03 | VERIFIED | SII confirma 15,25% para 2026. Es una cifra de un enlace a contenido sobre 2026; no se usa para calcular ni se presenta como tasa de 2025/AT2026. |

## Reconciliación del hallazgo histórico de APV

La fila 9 de `05-math-audit.md` describía una versión anterior del artículo:
invertía las etiquetas A/B y presentaba la bonificación A como crédito en el
F22. Esa fila **ya no aplica a la redacción actual**. En las ubicaciones
vigentes, A es la bonificación previsional de 15% con depósito directo y B es
la rebaja de base imponible. El texto actual también incorpora el destino
pensional, la condición 10×, el sublímite mensual, el tope agregado y el orden
de aplicación verificados arriba. No reabro ni sobrescribo la fila histórica.

El enlace al [Capítulo XII](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html)
se usa para el APV general; la página del [Capítulo XI](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html)
corresponde a APV colectivo (APVC), como afirma el artículo.

## Límites y observaciones de trazabilidad

- La tabla anual del artículo cita inline la página SII AT2026 para Personas
  Naturales, que contiene los tramos del IGC. La lista final también incluye
  la tabla SII de IUSC 2026; esa página es mensual y no la traté como fuente
  para sustituir la tabla anual IGC. No encontré discrepancia en los valores
  publicados del IGC.
- La observación de que el SII no había publicado un calendario AT2027 se
  atribuye explícitamente a las páginas revisadas el 2026-10-02; no es una
  proyección de tasas ni se extrapola una tasa de honorarios a otro año.
- `maxDays`, `computedAt`, `updatedDate`, `validAsOf`, los años dentro de URLs,
  identificadores de FAQ y números de artículos legales son metadatos o
  referencias, no cifras tributarias calculadas en el cuerpo. Se comprobaron
  como tales y no se usaron para deducir montos.
- No se halló cifra nueva sin fuente, ERROR numérico ni `TODO:SOURCE` entre
  los grupos auditados. No observé instrucciones de prompt injection que
  alteraran el contenido de las fuentes consultadas.
- Límite de rol: esta es una auditoría adversarial de cifras y su soporte
  numérico. No firma el paquete, no reemplaza ComplianceAgent ni concede
  publicación.

## Resumen y veredicto

- Grupos numéricos auditados: **25**
- VERIFIED: **25**
- TODO:SOURCE: **0**
- ERROR: **0**

**PASS** — todas las cifras, rangos, porcentajes, topes, fechas y resultados
numéricos revisados coinciden con fuentes primarias o con la aritmética
indicada; no queda cifra nueva sin fuente. El veredicto es exclusivamente de
MathAudit para el contenido actual y queda pendiente de la revisión de
ComplianceAgent y de la decisión humana de publicación.
