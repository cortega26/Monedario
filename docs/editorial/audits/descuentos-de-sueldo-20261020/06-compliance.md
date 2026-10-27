# Auditoría adversarial de compliance — descuentos-de-sueldo

**Fecha:** 2026-10-27  
**Protocolo:** AI_AUDIT_PROTOCOL v1  
**Rol:** ComplianceAgent (adversarial)  
**Modelo:** OpenAI GPT-6 (Codex runtime; identificador exacto expuesto: GPT-6; no se expone un identificador separado de build/revisión)  
**Sesión:** codex-20261027-compliance  
**Veredicto:** **CONDITIONAL — bloquea publicación mientras haya defectos product abiertos.**

## Independencia y método

La independencia se cumple por familia de modelo. Los registros del paquete identifican a la redacción como Claude Sonnet 5.5 (Claude Code, sesión 20261020-1517-handoff1), la pasada matemática como DeepSeek V4.1 Flash (opencode/deepseek-v4.1-flash-free, sesión descuentos-de-sueldo-20261020-math-audit) y esta pasada como OpenAI GPT-6. Son tres familias distintas. No heredo el veredicto matemático como evidencia normativa.

Releí completos los inputs indicados en 00-scope.json, 02-result.json, el informe matemático, los dos planes, el artículo, las tres páginas relacionadas, las dos fichas legales, la corrección registrada, el dossier, sources.yaml, NORMA_YMYL.md y este protocolo. Los extractos normativos incluidos en evidence/02-* no se usaron como prueba: abrí las fuentes oficiales y guardé citas recién verificadas con URL y fecha en [evidence/11-compliance-primary-sources-2026-10-27.txt](evidence/11-compliance-primary-sources-2026-10-27.txt). El barrido local, las citas de contenido y el mapa de superficies están en [evidence/12-compliance-local-surfaces-2026-10-27.txt](evidence/12-compliance-local-surfaces-2026-10-27.txt); los defectos están desarrollados en [evidence/14-compliance-defects-2026-10-27.txt](evidence/14-compliance-defects-2026-10-27.txt).

Base auditada: 1444958a7604510495481b6caa39e86e1d7161d7, rama fix/descuentos-de-sueldo-art58-2026-10-20, Linux x86_64, Node v24.19.0, pnpm 11.7.0 y Python 3.13.12. El worktree estaba limpio al inicio y la rama estaba un commit detrás de su referencia remota; no hice pull ni rebase. No recalculé la aritmética ni modifiqué fuentes, tests, metadatos editoriales o correcciones.json.

Verificación ejecutada:

- pnpm exec vitest run tests/static-analysis/descuentos-clasificacion-guard.test.ts — 1 archivo y 8 tests aprobados.
- pnpm run check:audit-artifacts — exit 0; los 3 artefactos examinados son válidos, incluido el resultado con verdict=CONDITIONAL.
- git diff --check — exit 0.

No ejecuté build, Playwright, accesibilidad, rutas ni RSS. La reproducción completa está en [evidence/13-compliance-reproducibility-2026-10-27.txt](evidence/13-compliance-reproducibility-2026-10-27.txt).

## Reclasificación independiente del artículo 58

La clasificación que resulta del texto legal y las fuentes consultadas es:

| Clase | Regla verificada | Lectura para la liquidación |
|---|---|---|
| Legal y obligatoria | El art. 58 inc. 1 ordena deducir impuestos, cotizaciones, cuotas sindicales según su legislación y obligaciones previsionales u organismos públicos. La cuota sindical requiere el presupuesto legal aplicable; el crédito social CCAF se retiene conforme al art. 22 de la Ley 18.833. | No depende de una autorización mensual revocable simple. El fundamento y las condiciones legales varían por concepto. |
| Convencional | Los incisos 2 y 3 exigen acuerdo escrito entre empleador y trabajador. Inc. 2 regula vivienda/ahorro vivienda/educación; el inc. 3 cubre sumas determinadas para pagos de cualquier naturaleza. | El acuerdo no elimina los topes ni convierte el descuento en una cotización legal. |
| Prohibida o limitada por ley | El art. 58 prohíbe descuentos específicos en especie y multas no autorizadas por reglamento, entre otros supuestos. El art. 57 permite ciertos embargos judiciales. | No se puede afirmar que toda deducción no enumerada por la guía sea ilícita: un embargo decretado judicialmente tiene base legal distinta y excepciones expresas. |

El texto directo del [Código del Trabajo, arts. 57–58 y 154–157](https://www.bcn.cl/leychile/navegar?idNorma=207436) respalda esta clasificación. Entre los extractos verificados: art. 58 inc. 1 dice “El empleador deberá deducir de las remuneraciones…”; el inc. 3 exige acuerdo escrito y limita esas deducciones al “quince por ciento de la remuneración total”; el inc. 4 establece un máximo conjunto de “45% de la remuneración total”. El art. 57 permite embargo sobre el exceso de 56 UF y, en casos enumerados —incluidas pensiones alimenticias decretadas judicialmente—, hasta el 50% de la remuneración. Citas literales completas y contexto: evidencia S1.

## Claims F01–F08

| Claim | Veredicto independiente y extracto fuente | Resultado frente al texto publicado |
|---|---|---|
| **F01** Tiempo no trabajado frente a multa | **Sustancialmente confirmado, con defecto de salvaguarda.** DT ORD. 1578 señala: “no autoriza al empleador para proceder de inmediato al descuento” y exige verificar al término de la semana si hubo incumplimiento imputable. ORD. 2423 permite descontar el tiempo no trabajado por causa atribuible al trabajador. [ORD. 1578](https://www.dt.gob.cl/legislacion/1624/w3-article-115035.html), 27-03-2018; [ORD. 2423](https://www.dt.gob.cl/legislacion/1624/w3-article-112152.html), 05-06-2017. | La distinción entre remuneración no devengada y multa disciplinaria es correcta. Falta la verificación de fin de semana de ORD. 1578. Ese dictamen cita el límite semanal antiguo de 45 horas; DT confirma que desde el 26-04-2026 rigen 42 horas. **D12, media.** |
| **F02** Cuota sindical | **Confirmado con excepciones omitidas.** Art. 262 y DT ORD. 4184/70: “Una vez requerido por la respectiva organización sindical… el empleador se encuentra obligado” a descontar la cuota ordinaria. ORD. 443/2026 dice que una renuncia comunicada al empleador no basta por sí sola para cesar un requerimiento vigente. [ORD. 4184/70](https://www.dt.gob.cl/legislacion/1624/w3-article-98369.html), 23-09-2010; [ORD. 443/2026](https://www.dt.gob.cl/legislacion/1624/w3-propertyvalue-137126.html), 24-09-2026. | Correcta la obligatoriedad después del requerimiento aplicable. No es una autorización mensual simple. La pieza reduce el supuesto a “si estás afiliado” y omite extensión de beneficios aceptada por no afiliados (art. 322) y la obligación del exafiliado mientras siga afecto al instrumento colectivo vigente (art. 323). **D9, media.** |
| **F03** Crédito social CCAF | **Confirmado, con condición de deuda constituida.** Art. 22 de la [Ley 18.833](https://www.bcn.cl/leychile/navegar?idNorma=30209): lo adeudado “deberá ser deducido de la remuneración”. DT ORD. 262/4 lo clasifica obligatorio del art. 58 inc. 1; ORD. 4527/93 confirma que la formalización con un empleador anterior afiliado permite la retención por el empleador actual. Consulta: 27-10-2026. | No es autorización que se renueva cada mes. La formulación de la pieza coincide con ley y DT en el alcance auditado. |
| **F04** Bases de cálculo distintas | **Confirmado.** SII define la base del IUSC como remuneraciones brutas menos cotizaciones previsionales y de salud retenidas. El art. 58 y DT fijan el 15% convencional sobre remuneración total bruta; topes de cotización varían por sistema. [SII, base IUSC](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3545.htm); [DT, base del 15%](https://www.dt.gob.cl/portal/1628/w3-article-60214.html), consultados 27-10-2026. | La tabla de bases del artículo evita presentar un único imponible para todos los descuentos. Se conserva contradicción en la guía de sueldo líquido, **D13, media**. |
| **F05** Procedencia de ORD. 680 | **Confirmado para el source principal.** La ficha oficial identifica ORD. N°680, 08-02-2017, con materia “Remuneraciones; Descuentos; Legalidad; Poder sancionatorio; Reglamento interno…”. [Ficha DT ORD. 680](https://www.dt.gob.cl/legislacion/1624/w3-article-111170.html), consultada 27-10-2026. | La entrada correspondiente de officialSources[] es pertinente y no es la consulta sobre indemnización por años de servicio. Hay una cita inline distinta, ORD. 2453/187, puesta junto a la lista de prohibiciones; el dictamen trata un descuento permitido por consumo de agua con pacto escrito y tope de 15%. **D15, baja.** |
| **F06** Seguro de cesantía | **Confirmado con excepciones materiales.** Ley 19.728 art. 5: 0,6% a cargo del trabajador indefinido, “con excepción de los trabajadores de casa particular”; art. 2 excluye aprendices, menores de 18 y pensionados, con excepciones legales. DT confirma máximo de 11 años por relación laboral y continuidad patronal del 0,8% al FCS; AFC verifica cotización N°133. [Ley 19.728](https://www.bcn.cl/leychile/navegar?idNorma=184979); [DT, período de cotización](https://www.dt.gob.cl/portal/1628/w3-article-95311.html); [AFC, cotizaciones](https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/), consultadas 27-10-2026. | 0,6%, 11 años y 0,8% posterior quedan confirmados para las personas cubiertas. Falta nombrar a trabajadores de casa particular —el empleador paga 3% independientemente del plazo—; las páginas del radio también generalizan la cobertura. En pluriempleo, el art. 7 exige cotizar sobre cada remuneración, cada una hasta su tope y con registros separados por empleador; la pieza sí expresa el límite de 11 años “por cada relación laboral”. **D10, media.** |
| **F07** Salud 7% y 90 UF | **Confirmado.** Superintendencia de Salud: “La cotización legal para salud corresponde al 7% de la remuneración o renta imponible”. SP establece tope de salud de 90 UF para 2026, desde remuneraciones de febrero. La diferencia del plan Isapre sobre la cotización legal es un “costo adicional”. [Superintendencia de Salud](https://www.superdesalud.gob.cl/tax-materias-isapres/cotizaciones-de-salud-3465/); [SP, topes 2026](https://www.spensiones.cl/portal/institucional/594/w3-article-16921.html); consulta 27-10-2026. | Valor y tope correctos. La fuente citada por la pieza respalda 90 UF, no la tasa de 7%; falta en officialSources[] la fuente de Salud. En la guía relacionada se vuelve a afirmar 7% del imponible sin límite en ese párrafo. **D14 y D17, baja.** |
| **F08** Topes convencionales | **Confirmado con supuesto específico.** Art. 58 inc. 3: 15% de remuneración total; inc. 2 permite hasta 30% para los fines y bajo la forma de pago que especifica la norma; inc. 4 y DT ORD. 3456/37: máximo conjunto 45% para deducciones convencionales. [DT ORD. 3456/37](https://dt.gob.cl/legislacion/1624/w3-article-102449.html), 05-09-2013. | 15/30/45% son correctos en la pieza. El 30% no es un tope general para cualquier descuento: aplica al supuesto especial de vivienda/educación y pago directo especificado en la ley. La guía lo acota correctamente. |

Otras cifras normativas comprobadas directamente: IUSC de octubre 2026 exento hasta $974.038,50; 4,75 IMM para gratificación legal según art. 50; 135,2 UF para AFC desde febrero 2026; comisión AFP Capital 1,44% y Uno 0,46%; SIS 1,78% desde agosto 2026; permanencia de 24 meses para ciertos nuevos afiliados. Se conservan sin edición los defectos aritméticos/documentales D1–D8 heredados. Las citas y fechas están en S8 y S10.

## Excepciones y defectos adicionales

La revisión adversarial confirma como relevantes: no afiliados que aceptan una extensión sindical; exafiliados aún sujetos a instrumento colectivo; trabajadores de casa particular; aprendices, menores de 18 años y pensionados con las excepciones legales; empleo con más de un empleador; embargos judiciales; atrasos no imputables y la comprobación al cierre semanal. También comprobé límites propios de AFC y salud. La regla de cuota sindical depende de los requisitos de la legislación sindical, no de una autorización individual simple en todos los casos.

No encontré en las páginas proporcionadas una afirmación que clasifique de manera incorrecta por sí misma a trabajador parcial, gratificación o semana corrida. La inclusión concreta de esas partidas en bases previsionales, tributarias o de deducciones convencionales no se extrapola aquí: solo se valida cada base contra la fuente específica arriba citada. La pieza no promete que sea asesoría legal; mantiene un encuadre informativo y deriva consultas a la Dirección del Trabajo.

Hallazgos nuevos de compliance, todos abiertos:

| ID | Severidad | Superficie | Defecto |
|---|---|---|---|
| D9 | Media | product | Cobertura sindical reducida a afiliados; omite arts. 322–323. |
| D10 | Media | product | Excepción AFC de casa particular y exclusiones legales insuficientemente explicadas en pieza/radio. |
| D11 | Media | product | Llama prohibido a todo descuento fuera de sus categorías, sin distinguir embargos del art. 57. |
| D12 | Media | product | Omite verificación de fin de semana y no actualiza el contexto de jornada de 45 a 42 horas. |
| D13 | Media | product | La guía de sueldo líquido afirma una base imponible única, en conflicto con el 15% sobre remuneración total. |
| D14 | Baja | product | La guía relacionada omite el tope de salud en el párrafo de Fonasa y denomina “copago” al costo adicional Isapre. |
| D15 | Baja | product | ORD. 2453/187 no respalda la lista de prohibiciones junto a la cual se cita. |
| D16 | Baja | product | Registro de correcciones omite el estrechamiento de la afirmación sobre pérdida de caja/herramientas/mercadería. |
| D17 | Baja | product | Falta fuente primaria de Superintendencia de Salud para el 7% en officialSources[]. |
| D18 | Baja | product | computedAt 04-10-2026 no coincide con la fecha visible 20-10-2026; JSON-LD lo presenta como lastReviewed y asigna reviewedBy Person “Equipo Monedario”. |

D18 es una inconsistencia de trazabilidad, no una afirmación de que no hubo revisión humana: este paquete no permite identificar ni verificar a una persona revisora. No declaro una revisión humana que no está documentada en el paquete; humanSignoff permanece null.

La entrada descuentos-sueldo-clasificacion-bases-atrasos de correcciones.json recoge otros cambios materiales, pero no registra que se eliminó una afirmación anterior absoluta sobre pérdidas de caja, herramientas y mercadería. El artículo actual cita el texto del Código y acota ORD. 4229 a trabajadores sin asignación por pérdida de caja. Esa omisión minimiza el cambio registrado (**D16, baja**).

## Barrido de seis superficies

1. **Cuerpo:** artículo principal y tres páginas del radio inspeccionados; discrepancias D9–D17 registradas.
2. **Metadatos:** validAsOf=2026-10-20, updatedDate=2026-10-20, computedAt=2026-10-04; las dos fichas legales indican lastVerified=2026-05-25. Hallazgo D18.
3. **Datos estructurados:** inspección de ArticleJsonLd.astro; computedAt alimenta lastReviewed, author se emite como reviewedBy tipo Person. El FAQ está redactado como párrafos en negrita, no como H3 bajo encabezado FAQ ni faqs de frontmatter; el código fuente predice que no se genera FAQPage. No inspeccioné HTML construido.
4. **Catálogo/LLM:** calculatorPortfolio.ts no contiene estos hechos de art. 58/AFC; llms.txt.ts enumera el catálogo y llms-full.txt.ts concatena el cuerpo completo, por lo que sus afirmaciones también llegarían a esa salida. No generé llms-full.txt.
5. **Contenido relacionado:** cotejadas las tres páginas pedidas y las dos fichas legales. Se encontraron D10, D13 y D14; las otras menciones pertinentes constan en evidencia 12.
6. **Motor y tests:** no hay motor propio para art. 58 en el catálogo revisado. El test estático existente pasó 8/8 y guarda un subconjunto de categorías y topes; no cubre los bordes D9–D18.

## Defectos matemáticos previos y disposición

Se mantienen intactos C1–C17 y D1–D8 del math audit. Las siete incidencias de producto **D1, D2, D3, D4, D6, D7 y D8** se difirieron con razón escrita al plan existente [PLAN-descuentos-postaudit-closure-2026-10-20.md](../../../../backlog/PLAN-descuentos-postaudit-closure-2026-10-20.md). Requieren reparación de contenido y verificación en su ciclo propio; no se corrigieron dentro de esta auditoría. D5 permanece identificado como defecto audit-package. El plan deja expresamente abiertos los siete defectos de producto.

El veredicto vigente en 02-result.json es **CONDITIONAL**, el peor de las dos pasadas: MathAuditAgent CONDITIONAL y esta pasada CONDITIONAL. Hay defectos de producto abiertos en ambas pasadas, lo cual bloquea publicación bajo AI_AUDIT_PROTOCOL v1. Este resultado no declara la pieza publicable, no firma gates y deja humanSignoff=null.

## Limitaciones

La inspección de JSON-LD fue de código fuente; no comprobé salida de build. No volví a auditar la aritmética ni hice una afirmación sobre pruebas de integración, accesibilidad, publicación o comportamiento en producción. No verifiqué las disposiciones específicas de cada caso laboral individual; el informe comprueba la clasificación general y los supuestos normativos enumerados con sus fuentes.
