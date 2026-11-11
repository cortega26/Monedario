# MathAudit 4 — auditoría adversarial

Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)
Commit auditado: `0ff3c4e176db1a803cbe9f5e1b26d8b281aaadba`
Fecha: 2026-11-10, America/Santiago. Conversación nueva; el entorno no proporciona un ID ni enlace de conversación verificable. No participé en investigación, brief, outline ni borrador.

Alcance: tres superficies completas, dos entradas del registro y 04-draft del commit indicado, en worktree aislado. 02-dossier no se utilizó. Informes previos solo para comparar hallazgos, no como prueba. No se auditó producción ni se comprobó el render o el snapshot fuera de los archivos solicitados. No se inspeccionaron versiones anteriores de las superficies: los `wrong` históricos no se pueden certificar con este alcance. Fuentes externas tratadas como datos no confiables; no se identificó `PROMPT_INJECTION_CANDIDATE`.

## Fuentes recuperadas independientemente

Todas consultadas el 2026-11-10. En cada fila las claves remiten aquí a URL, fecha y literal recuperado. XML BCN `obtxml?opt=7` para 6374, 1007469 y 7147 devolvió archivos de cero bytes; se usó HTML indexado. Las versiones históricas no prueban por sí solas vigencia en 2026. Los extractos son literales breves; no se transcriben normas completas.

- **L** — [SII, texto DL 830, art. cuarto transitorio](https://www.sii.cl/pagina/jurisprudencia/dl830_3.htm): «el segundo mes que anteceda al correspondiente a la actualización». El literal corresponde al fragmento omitido de la cita del artículo. La versión BCN 2026-10-17 no abrió: TODO:SOURCE para esa versión y su vigencia específica.
- **C** — [BCN, DL 830 versión 2010](https://www.bcn.cl/leychile/navegar?idNorma=6374&idVersion=2010-02-19): «último mes del año comercial respectivo»; «multiplicada por doce o por el número de meses»; para sanciones UTM al aplicarse × doce; «despreciándose las cifras inferiores a cincuenta centavos». Versión histórica: no prueba actualización 2026.
- **N** — [BCN DL 830 texto indexado histórico](https://www.bcn.cl/leychile/navegar?cve=&i=&idLey=&idNorma=6374&idVersion=1997-07-30&tipoVersion=): «multa de una unidad tributaria mensual a una unidad tributaria anual». No acredita texto vigente de 2026 por sí solo.
- **T** — [SII UTM 2026](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm): «Agosto | 71.649 | 859.788 | 113,15 | 0,6»; «Septiembre | 71.721»; «Octubre | 72.151»; «Noviembre | 72.440».
- **T25** — [SII UTM 2025](https://www.sii.cl/valores_y_fechas/utm/utm2025.htm): «Diciembre | 69.542 | 834.504».
- **I** — [SII, Impuesto Único 2026, septiembre](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm): «Monto de la renta líquida imponible»; «$ 968.233,50 | Exento»; tabla mensual con factores 0,04; 0,08; 0,135; 0,23; 0,304; 0,35; 0,4 y límites reproducidos abajo.
- **A** — [SII, Personas Naturales AT 2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html): «13,5 UTA del mes dic. de 2025 | $11.265.804»; «6 UTM dic. de 2025 | $417.252».
- **D** — [SII, Diccionario](https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html): UTA «último mes del año comercial respectivo, multiplicada por doce o por el número de meses»; UTM «determinado por ley» y actualizado por IPC.
- **E** — [SII Educa](https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html): «se reajusta mensualmente de acuerdo al IPC».
- **U** — [Banco Central, metodología UF](https://si3.bcentral.cl/estadisticas/Principal1/Metodologias/EMF/UF.pdf): «día diez de cada mes y hasta el día nueve del mes siguiente, en forma diaria»; según variación del IPC.
- **P** — [BCN, DL 3500 art. 20 O, versión 2022](https://www.bcn.cl/leychile/navegar?idNorma=7147&idVersion=2022-06-13): «al momento de pensionarse»; «quince por ciento de lo ahorrado» destinado a pensión; «se depositará anualmente»; giro «al 15% de aquel retiro o al saldo remanente si éste fuese inferior»; máximo seis UTM al 31 de diciembre; límite de diez veces cotizaciones del art. 17. La versión 2025-09-01 no abrió: TODO:SOURCE sobre vigencia actual.
- **R** — [BCN, DFL 1, versión 2026-10-16, art. 204](https://www.bcn.cl/leychile/navegar?idNorma=1007469&idVersion=2026-10-16): «gravísimas, 1,5 a 3», «graves, 1 a 1,5», «menos graves, 0,5 a 1», «leves, 0,2 a 0,5» UTM; la anotación «LEY Nº18.290 Art. 201» refiere al origen histórico.
- **B** — los archivos del commit auditado y 04-draft; evidencia interna de texto, no fuente jurídica. El informe ronda 3 se usa únicamente para comparar estados.

## Tabla de verificación

«Corregido» indica que el defecto anterior ya no se observa en el texto revisado; no acredita otras partes de la fila. `TODO:SOURCE` incluye falta de acceso a la versión pertinente o prueba histórica fuera del alcance.

| Claim | Fuente (URL + fecha + literal: claves anteriores) | Estado | Notas | vs. ronda 3 |
| --- | --- | --- | --- | --- |
| 1. Reajuste M−2 | L | VERIFIED | La cita abreviada coincide con el texto recuperado; octubre usa agosto. | persiste |
| 2. Versión DL 830 2026-10-17 | L | TODO:SOURCE | XML vacío y HTML de esa versión inaccesible; no certifico identidad ni vigencia. | nuevo |
| 3. IPC agosto 0,6 % y cálculo octubre | T | VERIFIED | 71.721 × 1,006 = 72.151,326; publicado 72.151. Diferencia compatible con redondeo del valor unitario, no demuestra regla para toda obligación. | persiste |
| 4. UTM septiembre | T | VERIFIED | $71.721, fechada como ejemplo histórico. | persiste |
| 5. UTM octubre | T | VERIFIED | $72.151, identificada como octubre 2026. | persiste |
| 6. UTM noviembre | T | VERIFIED | $72.440 para noviembre. | persiste |
| 7. FAQ «hoy» | T, B | VERIFIED | Se retiró el importe fijo; remite a tabla y valor dinámico. No verifica render ni frescura real. | corregido |
| 8. Lead sin valor fijo | B | VERIFIED | Remite al valor dinámico; no prueba que esté actualizado. | persiste |
| 9. Ejemplo septiembre histórico | T, B | VERIFIED | Identificado como tal al corte declarado. | persiste |
| 10. Cálculos con noviembre | T | VERIFIED | 1=72.440; 2=144.880; 5=362.200; 10=724.400; 13,5=977.940; 20=1.448.800; 30=2.173.200; 50=3.622.000; 100=7.244.000. Solo aritmética, no valor mostrado. | persiste |
| 11. Valor dinámico efectivamente vigente | B, T | TODO:SOURCE | Marcador y proveedor existen en superficies, pero no se inspeccionó snapshot ni render por límite de alcance. | precisión nueva |
| 12. Ejemplo 1 UTM | T | VERIFIED | 1 × 71.721 = 71.721. | persiste |
| 13. Ejemplo 2 UTM | T | VERIFIED | 2 × 71.721 = 143.442. | persiste |
| 14. Ejemplo 5 UTM | T | VERIFIED | 5 × 71.721 = 358.605; no se atribuye como escala. | persiste |
| 15. UTM diciembre 2025 | T25 | VERIFIED | $69.542. | persiste |
| 16. UTA diciembre 2025 | T25 | VERIFIED | 12 × 69.542 = 834.504. | persiste |
| 17. Columna UTA SII y AT 2026 | T25, A | VERIFIED | El SII publica UTA mensual; el ejemplo AT 2026 usa diciembre 2025. | persiste |
| 18. Glosario UTA y año corto | D, B | VERIFIED | Multiplica por meses cuando son menos de doce; no dice «comercializada». | corregido |
| 19. Umbral 13,5 UTA | A, T25 | VERIFIED | 13,5 × 834.504 = 11.265.804. | persiste |
| 20. Umbral 13,5 UTM | T, I | VERIFIED | 13,5 × 71.721 = 968.233,50. | persiste |
| 21. Base líquida imponible | I, B | VERIFIED | El SII nombra renta líquida imponible; no remuneración bruta. Definición del texto es simplificada y no cubre todas las situaciones. | persiste |
| 22. 30 UTM / 4 % | T, I | VERIFIED | 30 × 71.721 = 2.151.630,00; desde 968.233,51, factor 0,04. | persiste |
| 23. 50 UTM / 8 % | T, I | VERIFIED | 50 × 71.721 = 3.586.050,00; desde 2.151.630,01. | persiste |
| 24. 70 UTM / 13,5 % | T, I | VERIFIED | 70 × 71.721 = 5.020.470,00; desde 3.586.050,01. | persiste |
| 25. 90 UTM / 23 % | T, I | VERIFIED | 90 × 71.721 = 6.454.890,00; desde 5.020.470,01. | persiste |
| 26. 120 UTM / 30,4 % | T, I | VERIFIED | 120 × 71.721 = 8.606.520,00; desde 6.454.890,01. | persiste |
| 27. 310 UTM / 35 % | T, I | VERIFIED | 310 × 71.721 = 22.233.510,00; desde 8.606.520,01. | persiste |
| 28. Sobre 310 UTM / 40 % | I | VERIFIED | Desde 22.233.510,01; factor marginal, no tasa efectiva sobre renta total. | persiste |
| 29. Centavos tabla | I, B | VERIFIED | Límites de la guía coinciden con sección mensual septiembre del SII. | persiste |
| 30. APV giro y saldo | P, B | VERIFIED | Guía y registro incluyen alternativa del saldo remanente menor en texto histórico recuperado; vigencia en fila 52. | corregido |
| 31. APV 6 UTM | T25, A | VERIFIED | 6 × 69.542 = 417.252 para ahorro 2025; no es máximo universal en pesos. | persiste |
| 32. UF diaria | U | VERIFIED | Ciclo 10 al 9; diario no garantiza un valor distinto cada día. | persiste |
| 33. «mismo valor real» | L, B | VERIFIED | Retirado de superficies; sigue como cita histórica del registro y del draft, no como afirmación actual. | persiste |
| 34. Diccionario SII | D, B | VERIFIED | La paráfrasis de UTM y UTA concuerda; fuente literal localizada arriba. | persiste |
| 35. SII Educa | E, B | VERIFIED | Fuente dice explícitamente reajuste mensual conforme al IPC. | persiste |
| 36. UTM aplicable a multa | B | VERIFIED | Superficies no fijan un momento legal; remiten a valor aplicable y juzgado. | persiste |
| 37. Aranceles, derechos y trámites en UTM | B | VERIFIED | No se identifican afirmaciones actuales de esos usos en las tres superficies. Citas históricas en registro/draft son correcciones, no afirmaciones vigentes. | corregido |
| 38. Ley y SII | L, D, B | VERIFIED | Atribuye regla a ley y publicación al SII; revisión de versión vigente en fila 2. | persiste |
| 39. Registro reajuste | B | ERROR | `fixed[0]` dice que glosario indica que valor rige durante mes calendario; ahora solo dice que hay un valor para cada mes. `fixed[2]` promete valor vigente «con fecha de consulta», pero marcador no incorpora fecha de consulta en el texto fuente; no se comprobó render. | defecto distinto; anterior corregido |
| 40. Draft como prueba | B | ERROR | 04-draft conserva afirmaciones históricas de corrección que ya no describen el estado final; no deben presentarse como evidencia actual sin calificar. Véanse filas 49 y 54. | nuevo |
| 41. Glosario escala gravísimas | R, B | VERIFIED | Dice 1,5–3 UTM y art. 204. | persiste |
| 42. IPC publicado por INE | T | VERIFIED | Nota SII identifica variación mensual como publicada oficialmente por INE. | persiste |
| 43. Escalas tránsito | R | VERIFIED | 1,5–3 / 1–1,5 / 0,5–1 / 0,2–0,5 UTM, con otras multas específicas. | persiste |
| 44. APV depósito, derecho y giro | P, B | VERIFIED | Depósito anual, derecho al pensionarse y alternativa de saldo figuran; vigencia de versión queda en fila 52. | corregido |
| 45. Base de impuesto | I | VERIFIED | Fuente llama a la base renta líquida imponible. | persiste |
| 46. UTA en guía y glosario | D, B | VERIFIED | Tabla, FAQ, cuerpo, resumen y glosario incorporan alternativa de meses para año corto. | corregido |
| 47. Registro APV | P, B | VERIFIED | `fixed[1]` incorpora el saldo remanente menor; derecho y depósito se distinguen. Vigencia en fila 52. | corregido |
| 48. Métrica diaria prorrateada | B | VERIFIED | Retirada del glosario; aparece solo como referencia histórica en registro/draft. | corregido |
| 49. Draft y estado final | B | ERROR | Cuarta pasada dice corregir FAQ y resumen pero quinta reconoce que faltaban; es historia calificada. Sin embargo, quinta dice `fixed[3]` coincide con glosario y no advierte contradicción de `utm-reajuste-mensual-copy.fixed[0]`; véase fila 39. | parcialmente corregido |
| 50. Artículo de tránsito | R, B | VERIFIED | Referencia actual es art. 204 del DFL refundido, no art. 201 como numeración vigente. | corregido |
| 51. Redondeo general | C, B | VERIFIED | Superficies ya no afirman redondeo general de obligaciones; art. 8 N.º 10 regula expresión de unidad en pesos, no prueba regla universal de todo producto. | corregido |
| 52. APV versión vigente | P | TODO:SOURCE | BCN solo entregó versión 2022; 2025-09-01 no abrió. No certifico ausencia de modificaciones posteriores. | nuevo |
| 53. UTA conversor línea visible | D, B | ERROR | FAQ incluye año corto, pero línea visible dice «12 × UTM ... cierre del año comercial» sin excepción y lo presenta según SII. La nota de metodología admite aproximación desde serie; no demuestra que el valor mostrado corresponda al cierre. | corrección incompleta |
| 54. Registros se contradicen | B | ERROR | `utm-reajuste-mensual-copy.fixed[0]` afirma que glosario indica valor durante mes calendario; `utm-guia-ejemplos-tributarios.fixed[3]` dice que ese valor fijo se retiró. El glosario confirma lo segundo. | nuevo |
| 55. Histórico de `wrong` | B | TODO:SOURCE | Se leyeron ambas entradas completas; sin versiones históricas dentro del alcance autorizado no se puede comprobar cada atribución histórica a cada superficie. | límite nuevo |
| 56. Conversor y regla M−2 | B | VERIFIED | Conversor habla de reajuste mensual según IPC y no declara M−2 ni día específico. | persiste |
| 57. Frases prohibidas actuales | B | VERIFIED | Primer día hábil, IPC mes inmediatamente anterior, «sube o baja», «bruto/mes», «mismo valor real», métrica diaria y redondeo general no se afirman en superficies; aparecen como citas históricas en artefactos/registro. Valor fijo de octubre está claramente fechado. | persiste |
| 58. Definición legal y sanciones | C, N, D | TODO:SOURCE | Recuperadas definiciones, sanción ×12, redondeo <50/≥50 centavos y rango art. 97 N.º 1 solo en textos BCN históricos; falta contraste con versión 2026-10-17. | nuevo |
| 59. Regla UTM Estado / UF privado | U, B | ERROR | Guía dice «Si la obligación es con el Estado → UTM» y resume UF para privado; glosario llama UTM estándar de relaciones monetarias con Estado. Generalización absoluta no demostrada por fuentes y susceptible de inducir a error. | nuevo |
| 60. Cita textual abreviada | L, B | ERROR | «se reajustará mensualmente […] en el segundo mes» al eliminar «de acuerdo con el porcentaje de variación que experimente el índice ...» hace que gramaticalmente parezca que el reajuste ocurre en ese segundo mes, no que usa su IPC. Se recupera el sentido en la paráfrasis; la elipsis induce lectura falsa. | nuevo |
| 61. Registro `fixed[3]` UTA | D, B | ERROR | Afirma que glosario define UTA «multiplicada por doce» sin mencionar año corto; glosario sí contiene la alternativa. Descripción incompleta de una corrección cuya excepción era hallazgo de ronda 3. | nuevo |
| 62. Draft tabla septiembre antigua | I, B | ERROR | La sección de primera pasada del draft llama «OK, aproximado» al truncamiento $968.233 y refiere tabla vigente de diciembre; son afirmaciones históricas de esa pasada, no tabla actual. Deben distinguirse explícitamente de evidencia final y del corte 10 noviembre. | nuevo |
| 63. APV límites y destino | P | VERIFIED | Texto histórico exige destino a pensión, seis UTM al 31 diciembre y hasta diez veces cotizaciones art. 17; 15 % se calcula sobre ahorro elegible. Vigencia actual no probada: fila 52. | persiste |
| 64. Promesa de auditoría en registro | B | ERROR | `prevention` afirma que auditoría independiente revisó «todas» las cifras y afirmaciones normativas; no queda acreditado al commit auditado y esta auditoría deja TODO de vigencia y registro histórico. | nuevo |

## Resumen y límites

Hallazgos materiales: contradicción entre entradas de correcciones; línea de UTA del conversor sin excepción de año comercial corto; elipsis legal que cambia la lectura; regla absoluta UTM/Estado–UF/privados sin respaldo suficiente; y afirmación excesiva de auditoría completa. La regla de reajuste, cuatro escalas de tránsito y aritmética de ejemplos recuperados sí concuerdan con las fuentes indicadas, con las reservas de vigencia explícitas. Las filas sobre contenido de versiones anteriores del draft son históricas: no deben confundirse con el texto final. No se recuperaron las versiones legales exactas necesarias para certificar vigencia del DL 830 y DL 3500; no se inspeccionó la historia anterior ni el valor dinámico de producción.

**Veredicto: FAIL.** Bloquea publicación hasta resolver errores y fuentes pendientes; requiere revisión independiente de ComplianceAgent y decisión humana. No se firma ninguna puerta editorial.
