# MathAudit 3 — auditoría adversarial

Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)
Commit auditado: `8dcb68bf92881c805813bf6e6ff7cd54640e6ba6`. Fecha de consulta: 2026-11-10, America/Santiago. No sé si esta conversación es nueva o la misma de las rondas 1 y 2; no tengo un identificador que permita comprobarlo. No participé en investigación, brief, outline ni borrador en el contexto disponible.

Se revisaron los tres archivos completos, las dos entradas del registro y `04-draft.md`, sin utilizar `02-dossier.md`. Las secciones históricas del draft son contexto, no evidencia del texto actual. Se revisa el commit, no el sitio público. La columna «vs. ronda 2» usa «persiste» para afirmaciones que siguen vigentes o defectos no resueltos, «corregido» para cambios que resuelven el hallazgo anterior y «nuevo» para verificaciones añadidas; no implica que una afirmación verdadera sea un defecto. Fuentes externas consideradas datos no confiables; no se identificó `PROMPT_INJECTION_CANDIDATE`.

## Fuentes recuperadas directamente

Todas consultadas el 2026-11-10. Las claves en la tabla incluyen URL, fecha y literal mediante esta lista; los cálculos son propios. Los extractos legales se limitan a fragmentos pertinentes; la formulación íntegra se puede consultar en la fuente.

- **L** — [BCN DL 830, versión 2025-07-11, art. cuarto transitorio](https://www.bcn.cl/leychile/navegar?idNorma=6374&idParte=&idVersion=2025-07-11): «se reajustará mensualmente de acuerdo con el porcentaje de variación» del IPC «en el segundo mes que anteceda» a la actualización. Método: página HTML indexada de BCN con `idParte=`; se recuperó efectivamente esa versión. No se usó el XML como prueba.
- **T26** — [SII, UTM–UTA–IPC 2026](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm): «Agosto | 71.649 | 859.788 | 113,15 | 0,6»; «Septiembre | 71.721»; «Octubre | 72.151»; «Noviembre | 72.440»; «UTA = Unidad Tributaria Anual (UTM x 12)»; variación mensual «publicada oficialmente por el INE en cada mes».
- **T25** — [SII, UTM–UTA–IPC 2025](https://www.sii.cl/valores_y_fechas/utm/utm2025.htm): «Diciembre | 69.542 | 834.504».
- **I** — [SII, Impuesto Único de Segunda Categoría 2026, sección septiembre](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm): «Monto de la renta líquida imponible»; mensual hasta «$ 968.233,50 | Exento»; «$ 968.233,51 | $ 2.151.630,00 | 0,04»; rangos siguientes hasta $3.586.050,00, $5.020.470,00, $6.454.890,00, $8.606.520,00 y $22.233.510,00, factores 0,08; 0,135; 0,23; 0,304; 0,35; desde $22.233.510,01, 0,4.
- **A** — [SII, personas naturales AT 2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html): «13,5 UTA del mes dic. de 2025 | $11.265.804» y «6 UTM dic. de 2025 | $417.252».
- **D** — [SII, diccionario UTA y UTM](https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html): UTA: UTM del «último mes del año comercial respectivo, multiplicada por doce o por el número de meses que comprende el citado año comercial». UTM: monto «determinado por ley» que se actualiza por IPC.
- **E** — [SII Educa](https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html): «se reajusta mensualmente de acuerdo al IPC».
- **U** — [Banco Central, metodología UF](https://si3.bcentral.cl/estadisticas/Principal1/Metodologias/EMF/UF.pdf): «a partir del día diez de cada mes y hasta el día nueve del mes siguiente, en forma diaria», según IPC.
- **P** — [BCN, DL 3500 art. 20 O, versión 2025-09-01](https://www.bcn.cl/leychile/navegar?cve=&i=&idLey=&idNorma=7147&idVersion=2025-09-01&tipoVersion=): «al momento de pensionarse»; «quince por ciento de lo ahorrado» destinado a pensión; límite de «seis unidades tributarias mensuales» al 31 de diciembre del año del ahorro; aportes que «no superen en su conjunto» diez veces cotizaciones art. 17; «se depositará anualmente en una cuenta individual especial» con iguales condiciones de rentabilidad y comisiones; giro «al 15% de aquel retiro o al saldo remanente si éste fuese inferior».
- **R** — [BCN, Ley 18.290 art. 201, texto histórico accesible](https://www.bcn.cl/leychile/navegar?idLey=18290): «gravísimas, 1,5 a 3»; «graves, 1 a 1,5»; «menos graves, 0,5 a 1»; «leves, 0,2 a 0,5» UTM. El enlace `idNorma=29708` entregó pantalla de espera. Se constató además que el [documento de la BCN sobre el texto refundido DFL 1](https://www.bcn.cl/laborparlamentaria/documento?id=685801) identifica «el artículo 204» para la escala, mientras la [ficha BCN del DFL 1](https://www.bcn.cl/leychile/Navegar?idNorma=1007469&idParte=9651333&idVersion=) identifica «Artículo 201» como infracciones menos graves; ver fila 50. Las fichas del texto refundido devolvieron pantalla de espera al abrirse, pero sus fragmentos indexados fueron recuperados mediante búsqueda.
- **B** — Base histórica `d7418fc2d6cea9d7d4dfeab99c37e9f947d1f6ae` obtenida con `git show`; archivo de auditoría anterior comprometido, y textos y `correcciones.json` del commit auditado. No son fuentes jurídicas. La comparación histórica no implica que el estado de producción sea igual al de esa base.

## Revisión de las 47 filas anteriores y adicionales

| Claim | Fuente (URL + fecha + literal: claves anteriores) | Estado | vs. ronda 2 | Notas |
| --- | --- | --- | --- | --- |
| 1. Regla M−2 DL 830 | L | VERIFIED | persiste | El texto abreviado concuerda con la norma. |
| 2. Día y mes IPC anterior | L, B | VERIFIED | persiste | No se atribuye a la norma día específico ni IPC del mes inmediatamente anterior. El glosario sostiene vigencia durante el mes calendario. |
| 3. Octubre con IPC agosto | L, T26 | VERIFIED | persiste | 72.151/71.721−1 = 0,599545%; 71.721×1,006 = 72.151,326, que redondea a 72.151. |
| 4. Septiembre $71.721 | T26 | VERIFIED | persiste | Fecha identificada en los ejemplos. |
| 5. Octubre $72.151 | T26 | VERIFIED | persiste | Cuerpo identifica mes y año. |
| 6. Noviembre $72.440 | T26 | VERIFIED | persiste | Valor para el mes de consulta. |
| 7. FAQ «hoy» | T26, B | VERIFIED | persiste | Noviembre 2026 y fecha explícitos; requiere mantenimiento al cambiar de mes. |
| 8. Lead y cuerpo octubre | T26, B | VERIFIED | persiste | Lead no fija octubre; cuerpo lo identifica históricamente; validAsOf 2026-11-10. |
| 9. Septiembre no vigente | T26 | VERIFIED | persiste | Correcto a la fecha de consulta. |
| 10. Conversor y snapshot | T26, B | VERIFIED | persiste | Snapshot comprometido `utm=72440`, fecha 2026-11-01. Multiplicando: 1=72.440; 2=144.880; 5=362.200; 10=724.400; 13,5=977.940; 20=1.448.800; 30=2.173.200; 50=3.622.000; 100=7.244.000. No se verificó render ni producción. |
| 11. Marcador dinámico y FAQ fija | T26, B | VERIFIED | persiste | Dos marcadores en guía y snapshot de noviembre coinciden con FAQ fija; puede desfasarse en otro mes. |
| 12. Multa ejemplo 1 UTM | T26 | VERIFIED | persiste | 1×71.721=71.721. |
| 13. Multa ejemplo 2 UTM | T26 | VERIFIED | persiste | 2×71.721=143.442. |
| 14. Multa ejemplo 5 UTM | T26 | VERIFIED | persiste | 5×71.721=358.605; no se presenta como escala legal. |
| 15. UTM diciembre 2025 | T25 | VERIFIED | persiste | $69.542. |
| 16. UTA diciembre 2025 | T25, A | VERIFIED | persiste | 12×69.542=834.504; AT 2026. |
| 17. UTA fija y columna referencial | T25, D, A, B | VERIFIED | corregido | No afirma que la columna sea solo referencial ni que no sirva para IGC; identifica diciembre 2025 para AT 2026. Véase fila 46 para excepción de año abreviado. |
| 18. «comercializada por 12» | D, B | VERIFIED | persiste | Expresión retirada; dice multiplicada por doce. Excepción de D se trata en fila 46. |
| 19. 13,5 UTA | A, T25 | VERIFIED | persiste | 13,5×834.504=11.265.804. |
| 20. 13,5 UTM septiembre | I, T26 | VERIFIED | persiste | 13,5×71.721=968.233,50. |
| 21. Base imponible y bruto | I, B | VERIFIED | persiste | Base es renta líquida imponible, no remuneración bruta; definición simplificada no cubre todas las situaciones. |
| 22. 30 UTM / 4% | I, T26 | VERIFIED | persiste | 30×71.721=2.151.630; factor 0,04. |
| 23. 50 UTM / 8% | I, T26 | VERIFIED | persiste | 50×71.721=3.586.050; factor 0,08. |
| 24. 70 UTM / 13,5% | I, T26 | VERIFIED | persiste | 70×71.721=5.020.470; factor 0,135. |
| 25. 90 UTM / 23% | I, T26 | VERIFIED | persiste | 90×71.721=6.454.890; factor 0,23. |
| 26. 120 UTM / 30,4% | I, T26 | VERIFIED | persiste | 120×71.721=8.606.520; factor 0,304. |
| 27. 310 UTM / 35% | I, T26 | VERIFIED | persiste | 310×71.721=22.233.510; factor 0,35. |
| 28. Sobre 310 UTM / 40% | I | VERIFIED | persiste | Tasa marginal, no efectiva sobre el total. |
| 29. Límites enteros y centavos | I, B | VERIFIED | corregido | Todos los límites reproducen centavos de la sección mensual de septiembre; retirada nota de redondeo de tramos. |
| 30. APV A, condiciones | P, B | ERROR | persiste | Derecho al pensionarse, destino, depósito anual, cuenta, comisiones, 6 UTM y 10 veces están descritos. Sin embargo, la guía afirma sin excepción que se gira 15% de cada retiro: falta «o el saldo remanente si éste fuese inferior». El draft sí lo menciona, pero la guía no. |
| 31. Máximo APV 6 UTM | P, A, T25 | VERIFIED | persiste | 6×69.542=417.252 para ahorro de 2025; no es máximo universal en pesos. |
| 32. UF diaria | U | VERIFIED | persiste | Ciclo 10 al 9 siguiente según IPC; actualización diaria no asegura una cifra distinta cada día. |
| 33. Garantía de valor real | L, B | VERIFIED | persiste | Se retiró garantía absoluta; se señala rezago. El fundamento general del redondeo queda separado en fila 51. |
| 34. Diccionario SII | D | VERIFIED | persiste | Paráfrasis de IPC y atribución del monto a la ley; véase fila 46. |
| 35. SII Educa | E | VERIFIED | persiste | Paráfrasis de reajuste mensual. |
| 36. UTM aplicable al pago | R, B | VERIFIED | corregido | Guía y conversor remiten al juzgado y al valor que corresponda; no afirman valor vigente al momento del pago. El conversor actual usa valor presente para estimaciones, no determina la regla legal de una multa. |
| 37. Aranceles y trámites expresados en UTM | B | VERIFIED | corregido | Sin afirmaciones sobre aranceles, derechos notariales, consulares o pasaporte expresados en UTM. Aún aparecen «un trámite» y «trámites» en conversor líneas 127 y 402, sin afirmar que sus derechos se expresen en UTM. Por tanto el draft exagera al afirmar que retiró todas las menciones. |
| 38. SII define/regula UTM | L, D, B | VERIFIED | persiste | Guía y glosario atribuyen ley y publicación al SII; tabla UTM/UF dice ley DL 830 para UTM. |
| 39. Registro reajuste mensual | L, U, B | ERROR | persiste | Correctamente distingue guía/glosario M−2 del conversor mensual sin M−2 ni día. Pero `fixed[2]` dice que montos y cálculos no cambiaron: frente a B la guía modificó umbral y límites de la tabla, y otra entrada registra esos cambios. Afirmación absoluta contradictoria. |
| 40. TODO:SOURCE en 04-draft | B | VERIFIED | persiste | No se encontraron cifras etiquetadas TODO:SOURCE; declaraciones de pasadas históricas no acreditan el texto actual. |
| 41. Glosario 2–5 UTM | R, B | VERIFIED | persiste | Se sustituyó por gravísimas 1,5–3; sobre numeración vigente, fila 50. |
| 42. IPC publicado por INE | T26 | VERIFIED | persiste | Nota de tabla atribuye publicación mensual al INE. |
| 43. Escalas Ley 18.290 | R | VERIFIED | persiste | Cuatro rangos coinciden con art. 201 histórico recuperado; para numeración refundida vigente véase fila 50. |
| 44. APV depósito y acceso | P, B | ERROR | persiste | Depósito anual y derecho al pensionarse corregidos, pero guía y registro `fixed[1]` aún omiten el límite por saldo remanente en el giro. |
| 45. Renta líquida imponible | I | VERIFIED | persiste | Tabla y umbral emplean base líquida imponible. |
| 46. Año comercial y tributario UTA | D, A, B | ERROR | persiste | AT 2026 = diciembre 2025 está respaldado, pero tabla, FAQ, cuerpo y glosario presentan como universal ×12; D contempla también multiplicar por el número de meses del año comercial. Resumen dice diciembre sin calificar el año. La distinción entre años fue corregida parcialmente. |
| 47. Registro, multa y APV | P, B | ERROR | persiste | Retirada la regla temporal de multa; `fixed[1]` aún afirma giro del 15% sin la alternativa de saldo menor y por tanto presenta incompleto el mecanismo legal. |
| 48. Métrica diaria prorrateada del glosario | D, T26 | TODO:SOURCE | nuevo | Ninguna fuente recuperada acredita una «métrica prorrateada diaria» de la UTM referenciada por el SII. Búsqueda de fuente oficial sin resultado concluyente: falta fuente exacta, significado y contexto; no se asume falsa por falta de prueba. |
| 49. Texto del draft y registro | B | ERROR | nuevo | `04-draft` afirma que la guía incluye la alternativa de saldo remanente, pero no la incluye. También afirma retirar menciones de «trámites», aunque siguen dos usos genéricos en conversor. El registro `fixed` repite la omisión del APV. |
| 50. Numeración vigente de multas | R | ERROR | nuevo | La guía y glosario citan art. 201 de la Ley 18.290 sin indicar que es numeración histórica. En texto refundido DFL 1 vigente se usa art. 204 para la escala; el art. 201 trata infracciones menos graves. La escala numérica no cambia. Corregir referencia a versión aplicable y fecha. |
| 51. Redondeo al peso como regla general | L, T26 | TODO:SOURCE | nuevo | Guía y registro afirman que la obligación se reajusta «redondeada al peso». El ejemplo octubre redondea correctamente, pero L y T26 no establecen una regla general de redondeo para toda obligación o producto en UTM; se necesita fuente específica o acotar la afirmación. |

## Resultado

Total **51** filas: **VERIFIED 42**, **TODO:SOURCE 2**, **ERROR 7**. El recuento cuenta filas, no defectos únicos: 30, 44 y 47 comparten parcialmente el problema del giro APV. Las limitaciones de identidad de conversación, acceso XML y consulta del runtime son independientes de la tabla.

**Veredicto: FAIL** (al menos un ERROR). La auditoría no autoriza publicación ni sustituye ComplianceAgent o la decisión humana. No se modifican el borrador, las superficies, el registro ni las compuertas de `07-publish-packet.md`.
