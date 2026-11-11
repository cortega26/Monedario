# MathAudit 2 — auditoría adversarial del texto comprometido

Status: DRAFT — pending ComplianceAgent review

Role: MathAuditAgent (ChatGPT — adversarial)

Commit auditado: `e888b3a876c71496d9cfe449b6fe8a0c22bbbb1d` (`git rev-parse HEAD`; worktree `/tmp/utm-audit-2`). Fecha de consulta: 2026-11-10, America/Santiago. Esta es la misma conversación que produjo MathAudit 1, no una conversación nueva; no participé en investigación, brief, outline ni redacción. Identificador o enlace estable de conversación no disponible en el entorno; trazabilidad independiente pendiente. La revisión es de contenido comprometido, no de producción. No se consultó 02-dossier como evidencia.

Se volvieron a revisar las 42 filas de MathAudit 1 (`7c71dca9`), numeradas 1–42 en el mismo orden; 43–47 son comprobaciones adicionales. La columna Fuente usa los identificadores siguientes: cada enlace se consultó el 2026-11-10, y los extractos son literales. El estado se refiere a la afirmación actual; «retirado» indica que el defecto previo ya no aparece, salvo las reservas indicadas. Un dato numérico comprobado no certifica todo el artículo.

- **L:** [BCN DL 830, versión 2025-07-11](https://www.bcn.cl/leychile/navegar?idNorma=6374&idParte=&idVersion=2025-07-11), art. 4 transitorio: «A partir del mes de Abril de 1975, el monto de la unidad tributaria se reajustará mensualmente de acuerdo con el porcentaje de variación que experimente el índice de precios al consumidor en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad.» El [endpoint XML solicitado](https://www.bcn.cl/leychile/consulta/obtxml?opt=7&idNorma=6374&idVersion=2025-07-11) devolvió contenido vacío mediante curl y error en la herramienta web; la versión exacta sí se recuperó en la página BCN indexada con `idParte=`. El acceso XML queda documentado como pendiente, no como fuente recuperada.
- **T26:** [SII UTM 2026](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm): «Agosto ... 0,6»; «Septiembre ... 71.721»; «Octubre ... 72.151»; «Noviembre ... 72.440».
- **T25:** [SII UTM 2025](https://www.sii.cl/valores_y_fechas/utm/utm2025.htm): «Diciembre ... 69.542 ... 834.504»; «UTA = Unidad Tributaria Anual (UTM x 12)».
- **I:** [SII impuesto segunda categoría 2026](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm), septiembre: «Monto de la renta líquida imponible»; «$ 968.233,50 ... Exento»; factores 0,04; 0,08; 0,135; 0,23; 0,304; 0,35; 0,4. La página contiene septiembre y otros meses, incluido diciembre; no se comparó septiembre con la primera tabla mostrada.
- **A:** [SII personas naturales AT 2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html): «13,5 UTA del mes dic. de 2025 ... $11.265.804» y «6 UTM dic. de 2025 ... $417.252».
- **D:** [Diccionario SII](https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html): UTA del «último mes del año comercial respectivo, multiplicada por doce o por el número de meses que comprende el citado año comercial»; UTM «se actualiza en forma permanente por el Índice de Precios al Consumidor (IPC)».
- **E:** [SII Educa](https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html): «se reajusta mensualmente de acuerdo al IPC».
- **U:** [Banco Central, metodología UF](https://si3.bcentral.cl/estadisticas/Principal1/Metodologias/EMF/UF.pdf): «a partir del día diez de cada mes y hasta el día nueve del mes siguiente, en forma diaria» y «tasa promedio geométrica».
- **P:** [BCN DL 3500 art. 20 O](https://www.bcn.cl/leychile/navegar?cve=&i=&idLey=&idNorma=7147&idVersion=2020-01-01&tipoVersion=): «al momento de pensionarse»; «quince por ciento de lo ahorrado» destinado a pensión; «la bonificación ... se depositará anualmente». [Superintendencia de Pensiones, procedimiento](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2937.html): «la Tesorería General de la República depositará el monto total de la bonificación» en la AFP o institución autorizada.
- **R:** [BCN Ley 18.290 art. 201](https://www.bcn.cl/leychile/navegar?idLey=18290): «Infracciones o contravenciones gravísimas, 1,5 a 3 unidades tributarias mensuales»; «menos graves, 0,5 a 1 unidad tributaria mensual».

| Nº / Claim | Fuente (URL, fecha y texto literal: clave anterior) | Estado | Notas de comprobación sobre e888b3a8 |
| --- | --- | --- | --- |
| 1. Regla M−2 DL 830 | L | VERIFIED | La versión 2025-07-11 efectivamente dice M−2; la cita abreviada del artículo conserva el sentido. El endpoint XML vacío es limitación separada. |
| 2. No día de vigencia ni IPC mes inmediatamente anterior | L | VERIFIED | Las tres superficies no atribuyen esos supuestos a UTM. El glosario dice valor fijo durante mes calendario, no atribuye un día concreto a la norma. |
| 3. Octubre usa IPC agosto | L, T26 | VERIFIED | 72.151/71.721−1 = 0,599545%; 71.721×1,006 = 72.151,326, redondeado $72.151. |
| 4. Septiembre $71.721 | T26 | VERIFIED | Ejemplos históricos con mes explícito. |
| 5. Octubre $72.151 | T26 | VERIFIED | El cuerpo lo identifica como octubre 2026. |
| 6. Noviembre $72.440 | T26 | VERIFIED | Coincide con el mes de consulta 2026-11-10. |
| 7. FAQ «hoy» | T26 | VERIFIED | Hoy coincide con $72.440 y está fechada 2026-11-10; importe fijo se volverá obsoleto en otro mes si no se mantiene. |
| 8. Lead y cuerpo octubre | T26 | VERIFIED | Lead ya no fija octubre; cuerpo conserva $72.151 con mes. `validAsOf` = 2026-11-10. |
| 9. Aviso septiembre no vigente | T26 | VERIFIED | Cierto al 2026-11-10. Contiene referencia dinámica para el mes actual. |
| 10. Conversor, snapshot y conversiones | T26 y snapshot comprometido: `utm=72440`, `indicatorUpdatedAt.utm=2026-11-01` | VERIFIED | En modo snapshot: 1=$72.440; 2=$144.880; 5=$362.200; 10=$724.400; 13,5=$977.940; 20=$1.448.800; 30=$2.173.200; 50=$3.622.000; 100=$7.244.000. No se verifica render ni producción. |
| 11. Marcador dinámico vs FAQ fija | T26; snapshot comprometido | VERIFIED | `[[utm \| clp]]` existe dos veces en guía; snapshot $72.440 concuerda con FAQ fija noviembre. A partir de otro mes la FAQ fija puede contradecirlo. |
| 12. 1 UTM septiembre $71.721 | T26 | VERIFIED | 1×71.721=71.721. |
| 13. 2 UTM septiembre $143.442 | T26 | VERIFIED | 2×71.721=143.442. |
| 14. 5 UTM septiembre $358.605 | T26 | VERIFIED | 5×71.721=358.605. |
| 15. UTM diciembre 2025 $69.542 | T25 | VERIFIED | Mes y año explícitos. |
| 16. UTA diciembre $834.504 | T25, D, A | VERIFIED | 12×69.542=834.504; AT 2026 remite a año comercial 2025. |
| 17. UTA fija todo el año y columna SII sin utilidad para IGC | T25, D, A | ERROR | Se quitó «fija» y «no sirve», pero subsiste que la columna UTA mensual es «solo referencial», sin respaldo y con falsa implicación: la UTA de diciembre de esa misma columna es $834.504, usada en AT 2026. |
| 18. Glosario «comercializada por 12» | D | VERIFIED | Retirado: ahora «multiplicada por doce». La norma contempla también año comercial de menos de 12 meses. |
| 19. 13,5 UTA $11.265.804 | A | VERIFIED | 834.504×13,5=11.265.804; AT 2026. |
| 20. 13,5 UTM septiembre $968.233,50 | I, T26 | VERIFIED | 71.721×13,5=968.233,50. |
| 21. Base IUSC y salario bruto | I | VERIFIED | Texto actual dice renta líquida imponible, no bruto. La descripción de descuentos es simplificada; no es lista exhaustiva de todas las situaciones. |
| 22. 30 UTM / 4% | I, T26 | VERIFIED | 30×71.721=2.151.630; factor 0,04. |
| 23. 50 UTM / 8% | I, T26 | VERIFIED | 50×71.721=3.586.050; factor 0,08. |
| 24. 70 UTM / 13,5% | I, T26 | VERIFIED | 70×71.721=5.020.470; factor 0,135. |
| 25. 90 UTM / 23% | I, T26 | VERIFIED | 90×71.721=6.454.890; factor 0,23. |
| 26. 120 UTM / 30,4% | I, T26 | VERIFIED | 120×71.721=8.606.520; factor 0,304. |
| 27. 310 UTM / 35% | I, T26 | VERIFIED | 310×71.721=22.233.510; factor 0,35. |
| 28. Sobre 310 UTM / 40% marginal | I | VERIFIED | 0,4 es factor marginal; no impuesto efectivo sobre toda la renta. |
| 29. Límites enteros de tabla | I | ERROR | Se dice «redondeados», pero $968.233,50 se representa como $968.233; la tabla contiene rangos expresados en enteros sin decir que solo se aplican a bases enteras. El SII da hasta $968.233,50 y desde $968.233,51. Hay que conservar centavos o definir conversión y tratamiento. |
| 30. APV A: 15% y condiciones art. 20 O | P | ERROR | Porcentaje, destino, tope y límite de 10 veces se mencionan; «al momento de pensionarte el Estado paga» confunde derecho final con depósito anual a cuenta especial. El propio artículo ordena depósito anual y eventual devolución al retirar. |
| 31. APV máximo 6 UTM diciembre 2025 | P, A, T25 | VERIFIED | 6×69.542=417.252 para ahorro 2025; año se infiere del ejemplo y AT 2026, no es un tope universal en pesos. |
| 32. UF diaria | U | VERIFIED | Ciclo 10 a 9 siguiente, factor geométrico por IPC previo; diario no garantiza diferencia numérica si IPC es cero. |
| 33. Garantía absoluta de valor real | L | VERIFIED | Eliminada en guía y conversor; ahora describen ajuste con rezago. No garantiza conservación exacta. |
| 34. Diccionario SII, cita | D | VERIFIED | Guía/glosario parafrasean correctamente; literal figura en fuente D. |
| 35. SII Educa, cita | E | VERIFIED | Paráfrasis de reajuste mensual; literal figura en E. |
| 36. Multa usa UTM del pago | R | TODO:SOURCE | La sección de multas ahora remite al juzgado, pero el párrafo anterior a «Alcance de la revisión» aún afirma «valor vigente en ese momento» para pago mañana. Art. 201 acredita escala, no regla general temporal para todos los casos. |
| 37. Aranceles específicos | D | TODO:SOURCE | Ya no se afirman por nombre consulares/notariales/CBR/pasaporte, pero aún se afirma que algunos aranceles y derechos se expresan en UTM; no se recuperó fuente primaria específica por trámite. La frase «cada institución fija los suyos» también requiere sustento. |
| 38. SII define/regula UTM | L, D | VERIFIED | Se corrigió: ley establece regla y SII publica. |
| 39. Registro `utm-reajuste-mensual-copy` | L, U y diff comprometido | ERROR | Incluye M−2 y frases direccionales, pero afirma que las tres páginas describen específicamente M−2 y ejemplo octubre/agosto: el conversor solo dice IPC mensual, sin rezago ni ejemplo. Afirma además que ninguna señala día del mes aunque glosario dice que valor rige durante todo mes calendario; distingue esa frase de atribuir un día a la norma. |
| 40. Cifras marcadas TODO:SOURCE en 04-draft | Texto comprometido `04-draft.md`, búsqueda literal 2026-11-10 | VERIFIED | No se identificaron cifras marcadas `TODO:SOURCE`; no heredar sus estados VERIFIED. El borrador conserva secciones históricas que describen un estado previo. |
| 41. Ejemplo glosario 2–5 UTM | R | VERIFIED | Retirado; sustituido por infracciones gravísimas 1,5–3 UTM. |
| 42. IPC calculado y publicado por INE | T26: «Variación mensual ... publicada oficialmente por el INE» | VERIFIED | Atribución a INE y periodicidad respaldadas por nota SII. |
| 43. Escalas art. 201 Ley 18.290 | R | VERIFIED | Gravísimas 1,5–3; graves 1–1,5; menos graves 0,5–1; leves 0,2–0,5 UTM; algunas infracciones tienen multas específicas. |
| 44. Depósito APV y acceso al pensionarse | P | ERROR | El derecho ligado al destino previsional no equivale a que el Estado deposite recién al jubilar: depósito anual en cuenta especial y devolución en caso de retiros según reglas legales. Registro `utm-guia-ejemplos-tributarios` repite «se paga al pensionarse». |
| 45. Renta líquida imponible | I | VERIFIED | Umbral de 13,5 UTM y factores aplican a base líquida imponible; no al bruto. Las condiciones de cálculo dependen del contribuyente. |
| 46. Año comercial vs año tributario UTA | D, A | ERROR | «UTA de un año ... diciembre de ese año ... IGC de ese año tributario» confunde períodos: AT 2026 usa diciembre 2025, como reconoce el ejemplo. Debe distinguir año comercial y tributario y evitar generalizar diciembre a años comerciales abreviados. |
| 47. Registro de correcciones, retiro de regla de pago | R y `src/data/correcciones.json` comprometido | ERROR | `utm-guia-ejemplos-tributarios.fixed` afirma que se retiró la afirmación sobre valor aplicable al pago; persiste en el párrafo inicial de la guía. También repite pago APV al pensionarse. |

## Resultado

Total: **47** filas; **VERIFIED 38**, **TODO:SOURCE 2**, **ERROR 7**. El acceso XML solicitado y el identificador de conversación no disponible son limitaciones adicionales, no filas del conteo. Si una afirmación no fue localizada en una fuente recuperada no se dio por demostrada. Las fuentes externas se trataron como contenido no confiable; no se observó `PROMPT_INJECTION_CANDIDATE`.

**Veredicto: FAIL** (hay errores). El informe anterior se ha reevaluado en su totalidad contra el commit exacto; esta auditoría no modifica artículo, correcciones ni compuertas humanas. Quedan pendientes revisión independiente de ComplianceAgent, decisión humana y, cuando corresponda, comprobación de runtime y fechas futuras. La misma sesión realizó MathAudit 1 y 2: no afirmar que esta segunda revisión ocurrió en una conversación nueva.
