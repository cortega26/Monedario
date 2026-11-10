# Dossier de investigación — explicación de reajuste UTM

- Source article: `src/data/blog/utm-chile-que-es-como-funciona.md`
- Páginas adicionales: `src/pages/calculadoras/conversor-utm.astro`, `src/data/glossary/utm.md`
- Fecha de consulta: 2026-10-29
- Run id: `20261029-1500-utm-audit`
- Rol: `ResearchAgent (ChatGPT)`
- Riesgo: `YMYL / regulatory_sensitivity=alta`; se corrigen afirmaciones tributarias publicadas.

## Intención principal

Resolver una pregunta informativa sobre qué es y cómo cambia la UTM, y llevar al lector al valor oficial del mes que necesita. La tarea no modifica el cálculo UTM→CLP ni las cifras históricas del artículo.

## Fuentes oficiales

1. SII, Diccionario básico tributario contable, entrada UTM: <https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html> — consultada 2026-10-29. Texto relevante: “se actualiza en forma permanente por el Índice de Precios al Consumidor (IPC)”.
2. SII Educa, Tipos de impuestos: <https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html> — consultada 2026-10-29, línea visible 106. Texto relevante: “se reajusta mensualmente de acuerdo al IPC”; indica consultar Valores y Fechas del SII para su valor.
3. SII, UTM–UTA–IPC 2026: <https://www.sii.cl/valores_y_fechas/utm/utm2026.htm> — consultada 2026-10-29. Tabla mensual: septiembre UTM $71.721 / IPC 0,4%; octubre UTM $72.151; noviembre UTM $72.440.
4. SII, Circular N.º 39, 13-10-2026: <https://www.sii.cl/normativa_legislacion/circulares/2026/circu39.pdf> — consultada 2026-10-29. La circular informa UTM de noviembre de 2026 $72.440 y, en la sección siguiente, variación IPC de septiembre de 2026 0,4% (líneas 15–45 del PDF).
5. BCN/LeyChile, Decreto Ley 830, artículo cuarto transitorio, última versión 11-07-2025: <https://www.bcn.cl/leychile/navegar?idNorma=6374&idVersion=2025-07-11> — consultado 2026-10-29. La consulta directa a la aplicación tuvo una respuesta de carga incompleta; el buscador oficial de LeyChile devolvió el texto de la disposición. Extracto literal breve: “en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad”. La regla establece el mes del IPC aplicable; el fragmento no señala un día concreto del mes.
5. BCN/LeyChile, Decreto Ley 830, artículo cuarto transitorio, última versión 11-07-2025: <https://www.bcn.cl/leychile/navegar?idNorma=6374&idVersion=2025-07-11> — consultado 2026-10-29. El resultado de búsqueda oficial de la versión vigente devuelve el texto completo del artículo cuarto transitorio y la regla M−2. La apertura directa de la aplicación LeyChile tuvo una respuesta de carga incompleta. El mismo texto se recuperó directamente del PDF oficial del SII, fuente 6.
6. SII, Código Tributario (DL 830), artículo cuarto transitorio, texto consolidado en PDF actualizado a 24-02-2020: <https://www.sii.cl/normativa_legislacion/codigo_tributario.pdf> — consultado 2026-10-29, PDF p. 98 (líneas 4027–4029 del texto extraído). Extracto literal: “se reajustará mensualmente […] en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad”. La consulta de la versión BCN/LeyChile cuya última modificación es 11-07-2025 confirma el texto vigente en su resultado de búsqueda; su aplicación no cargó el artículo en la lectura directa. La cita combinada contiene 17 palabras literales.

## Catálogo de afirmaciones

| Claim | Fuente | Estado | Límite |
|---|---|---|---|
| La UTM es una unidad en pesos para fines tributarios y se actualiza por IPC. | SII, Diccionario UTM | VERIFIED | El diccionario no indica el mes de IPC que corresponde a cada UTM mensual. |
| El SII publica valores de UTM por mes. | SII, UTM–UTA–IPC 2026 | VERIFIED | La fila de octubre 2026 informa $72.151; consultado 2026-10-29. |
| Para cada mes de UTM, el artículo cuarto transitorio del DL 830 fija el reajuste con la variación IPC del segundo mes que antecede al mes de actualización. | DL 830, artículo cuarto transitorio, BCN/LeyChile y SII, fuentes anteriores | VERIFIED | Extracto literal: “se reajustará mensualmente […] en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad”. No especifica un día exacto dentro del mes. |
| La afirmación del primer día hábil y la atribución al IPC del mes inmediatamente anterior son inexactas. | DL 830, art. cuarto transitorio | ERROR / corregir | El período IPC es M−2; el texto legal citado no establece el día concreto de vigencia. |

## Benchmark observations

N/A. No se usó benchmark ni dato de Claude SEO como fuente factual tributaria.

## Source Trust / Prompt Injection Notes

Las fuentes se trataron como material de consulta, no como instrucciones. No se observó texto de prompt injection en las páginas oficiales consultadas. SII Educa entrega contexto general, pero el mismo artículo advierte que sus valores corresponden a marzo de 2014; no se usa para valores actuales ni como fundamento legal del mecanismo. El rastreo público de Monedario es evidencia del contenido observado, no fuente normativa ni prueba de producción actual.

## Gap / oportunidad

El mismo claim temporal aparece repetido en lead, FAQ, cuerpo, tabla comparativa, avisos y resumen de la guía, en la calculadora (incluido su texto sin JavaScript) y en el glosario. La guía además muestra corte informativo 2026-04-09 pese a `updatedDate` 2026-09-18 y cifra explícita de septiembre; esta discrepancia de fecha debe quedar aclarada sin cambiar los valores históricos.

## Decisiones y exclusiones

- Explicar M−2 conforme al texto legal literal y citar el artículo cuarto transitorio del DL 830.
- No inferir ni afirmar un día hábil/calendario de publicación o vigencia: la disposición consultada fija el período de IPC, pero no ese día.
- No recalcular ni modificar los demás montos, tramos ni fórmulas de la guía en esta corrección; su certificación independiente permanece abierta en el bucket B.
- Actualizar fecha de revisión del artículo y distinguirla de la fecha histórica de sus ejemplos.
- No crear ni modificar URLs.

## Preguntas de investigación

No quedan preguntas de fuente abiertas para la regla de reajuste y el valor de octubre. La norma consultada no señala un día exacto del mes; no debe inferirse uno. Los demás montos y cálculos requieren MathAudit independiente.
