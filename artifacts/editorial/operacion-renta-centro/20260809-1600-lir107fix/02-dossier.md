Status: DRAFT — pending MathAuditAgent and ComplianceAgent review
Role: Research realizado ad hoc por Claude Code (WebFetch/WebSearch) en la misma sesión que el DraftAgent — desviación documentada de `context/EDITORIAL_AI_PIPELINE.md` §2 (ResearchAgent debería ser ChatGPT). Todas las fuentes fueron obtenidas por fetch directo, no de memoria.

Fecha de corte: 2026-08-09

## Official Sources

1. **SII, Circular N° 39/2022** (Departamento Emisor Impuestos Directos, GE204576.2022, 31-08-2022).
   URL: https://www.sii.cl/normativa_legislacion/circulares/2022/circu39.pdf
   Recuperado: 2026-08-09 (fetch directo, PDF leído íntegramente).
   Contenido citado: la Ley N° 21.420 modificó el art. 107 LIR; el mayor valor en enajenación/rescate de acciones de S.A. abiertas con presencia bursátil, cuotas de fondos de inversión y cuotas de fondos mutuos "dejará de ser un ingreso no constitutivo de renta, pasando a tributar con un impuesto único a la renta con tasa del 10%", salvo inversionistas institucionales. Vigente para operaciones desde el 2 de septiembre de 2022.

2. **Ley N° 21.420** (publicada en el Diario Oficial el 4 de febrero de 2022).
   Referencia obtenida vía cita legal dentro de la Circular SII N° 39/2022 (fuente 1). No se logró el fetch directo del texto legal en bcn.cl/leychile (dos intentos con timeout de la aplicación de LeyChile). El contenido operativo de la ley usado en este dossier proviene de la paráfrasis oficial del SII, no de la ley en texto plano.
   TODO:SOURCE — reintentar fetch directo a bcn.cl antes de que ComplianceAgent dé por cerrado este punto.

## Claims Catalogue

| Claim | Source URL | Status | Notas |
|---|---|---|---|
| Desde 2022-09-02, la ganancia de capital en venta de acciones/cuotas con presencia bursátil (art. 107 LIR) NO está exenta; paga impuesto único de 10% | Circular SII N° 39/2022, §2 (cita literal) | VERIFIED | Fetch directo, texto literal disponible |
| Excepción: inversionistas institucionales (con o sin domicilio/residencia en Chile) mantienen ingreso no renta | Circular SII N° 39/2022, §2 (cita literal) | VERIFIED | Fetch directo |
| La ley que modificó el art. 107 LIR es la Ley N° 21.420, publicada 04-02-2022 | Circular SII N° 39/2022, encabezado "REF. LEGAL" | VERIFIED | Fetch directo del encabezado de la circular |
| La Ley 21.210 (2020) NO estableció que la ganancia siga exenta — el párrafo publicado atribuye este efecto a la ley equivocada | Circular SII N° 39/2022, nota al pie 7 (Ley 21.210 solo agregó el art. 110 LIR sobre determinación de presencia bursátil vía "market maker", no tocó la exención) | VERIFIED | Fetch directo; es una inferencia directa de lo que la Ley 21.210 sí hizo vs. lo que el párrafo publicado le atribuye |
Fondos mutuos y de inversión sin presencia bursátil se rigen por Art. 108/109 LIR | Circular SII N° 39/2022, §2.2 | **ERROR — CORREGIDO** | Hallazgo del advisor: §2.2 cita los arts. 108/109 para determinar el precio de enajenación/rescate de cuotas **dentro** del régimen del art. 107 (es decir, para instrumentos que SÍ tienen presencia bursátil), no como régimen general de los que NO la tienen. Se retiró la cita a "Art. 108 y 109 LIR" del texto publicado por falta de fuente que confirme ese alcance. El draft final solo afirma que el régimen es distinto y difiere a sii.cl, sin citar artículo específico no verificado. |
| El Congreso aprobó el 2026-08-04 un proyecto (Boletín 18.216-05) que restituye el art. 107 LIR a ingreso no renta desde 2027-01-01 | KPMG Chile, Tax Alert "Ley de Reconstrucción Nacional" (agosto 2026), assets.kpmg.com | VERIFIED | Fetch directo, PDF leído íntegramente |
| A la fecha de corte, ese proyecto NO es ley vigente — está en control de constitucionalidad ante el TC | KPMG Tax Alert (mismo doc) + Emol 06-08-2026 (admisibilidad de 3 requerimientos, audiencia 13-08-2026) | VERIFIED | Ambos con fetch directo |
| Bienes raíces por personas naturales: exención hasta 8.000 UF en la vida del contribuyente (Art. 17 N°8 LIR reformado) | No re-verificado en este run — es contenido preexistente del artículo, fuera del alcance de este refresh (el brief solo cubre el párrafo de ganancias de capital en instrumentos financieros) | NO TOCADO | Si se quiere auditar también esta cifra, requiere un run/brief separado |

## Ronda 2 — hallazgos de `05-math-audit.md` (MathAuditAgent, ChatGPT, verdict FAIL) y su resolución

El math audit (ver `05-math-audit.md`) encontró 3 ERROR y 3 TODO:SOURCE. Se investigó cada uno con fetch/búsqueda adicional el 2026-08-09:

| Hallazgo del audit | Resolución en este dossier |
|---|---|
| ERROR: el draft trataba "presencia bursátil" como única condición del art. 107, omitiendo que la ley exige "los requisitos que la ley establece para cada tipo de valor" (Circular 39 §2, cita ya en el dossier de ronda 1) | Corregido en el texto publicado: se agregó el calificador explícito, sin inventar el detalle numérico completo de cada requisito. |
| ERROR: "fondos mutuos y de inversión sin presencia bursátil quedan fuera del art. 107" — falso. Verificado por WebFetch a `rankia.cl/blog/analisis-ipsa/7324855-...` (2026-08-09) y corroborado por búsqueda adicional: el art. 107 N°2 LIR también alcanza cuotas de fondos de inversión SIN presencia bursátil propia, cuando el reglamento interno del fondo fija que al menos el 90% de la cartera se invierte en acciones con presencia bursátil (o activos calificados equivalentes). Fondos mutuos pueden calificar por la misma vía. | Corregido: el texto publicado ya no afirma una exclusión binaria "con/sin presencia bursátil". Se reformula sin citar el umbral del 90% en el cuerpo público (para no introducir una cifra que solo tiene respaldo secundario, no primario) — el umbral queda documentado aquí para que ComplianceAgent lo confirme contra fuente primaria (BCN) antes de decidir si se publica el número exacto. |
| ERROR/TODO:SOURCE: "Impuesto Único de 10% o Impuesto Global Complementario" como alternativa para fondos fuera del art. 107 — el audit dice que el art. 108 fija Primera Categoría/Global Complementario/Adicional según corresponda, no un impuesto único de 10% | Corregido: se retiró la afirmación de régimen alternativo específico del cuerpo del artículo. El texto publicado ahora solo dice que el régimen "no son las del art. 107" y remite a sii.cl/reglamento interno, sin inventar cuál es exactamente — esto es deferral legítimo, porque el régimen exacto (Primera Categoría vs. Global vs. Adicional) depende del tipo de partícipe y del fondo específico, no de un valor único fetcheable de forma general. Fuente del audit para el régimen del art. 108: LIR vigente, art. 108, BCN/LeyChile — no re-verificada por este dossier con fetch directo; queda como nota para compliance. |
| TODO:SOURCE: aprobación del Congreso el 2026-08-04 (Boletín 18216-05) solo respaldada por prensa/KPMG, no por acta oficial | Se intentó fetch directo a `tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18216-05` (2026-08-09) — la página es renderizada por JS y el fetch no devolvió datos de tabla. No se pudo mejorar la fuente más allá de KPMG Tax Alert + Emol + El América (los tres con fetch directo, ronda 1). Queda como TODO:SOURCE abierto para compliance/humano: verificar acta oficial de Cámara/Senado o Diario Oficial cuando se publique. |
| TODO:SOURCE: fecha de vigencia 2027-01-01 solo respaldada por KPMG, no por texto legal oficial | No resoluble por definición hasta que exista Diario Oficial — la ley no está promulgada. Se mantiene como limitación explícita en el texto publicado ("si se publica sin cambios"), no como TODO:SOURCE oculto. |
| TODO:SOURCE: el deferral "verifica en sii.cl" no tenía URL específica para la parte de fondos sin presencia bursátil | Resuelto por la reformulación: ahora el deferral es explícitamente sobre una pregunta case-dependent (qué régimen aplica a un fondo específico), que es precisamente el tipo de deferral que `NORMA_YMYL.md §2.4(b)` permite. |
| ERROR (bienes raíces, contenido preexistente): "tributa solo por la ganancia que supere 8.000 UF" omite condiciones de plazo entre adquisición y enajenación (más de 1 año, o 4 años en subdivisión/construcción) | **Corregido por acotamiento, no por nueva afirmación.** Se retiró la palabra "solo" y se agregó una advertencia genérica de que existen condiciones adicionales de plazo, sin enunciar cuáles son (no re-verificadas con fuente primaria en este run). Se mantiene el umbral de 8.000 UF, que el audit marcó VERIFIED (Art. 17 N°8 letra b) ii). No se inventó ninguna cifra ni condición nueva — se eliminó la falsedad ("solo") y se convirtió el resto en deferral legítimo. Si se quiere detallar las condiciones exactas de plazo, requiere su propio research con fuente primaria. |

## Ronda 3 — hallazgos de `05-math-audit-r2.md` (MathAuditAgent, ChatGPT, verdict FAIL) y su resolución

`05-math-audit-r2.md` dio FAIL con 2 ERROR y 4 TODO:SOURCE.

### ERROR #1 (aceptado y corregido)

El texto seguía atribuyendo la calificación bajo el art. 107 al **instrumento** ("cuando el instrumento cumple los requisitos"), cuando la ley condiciona la **operación** de enajenación/rescate (modalidades de adquisición y de enajenación), no solo un atributo del activo. Esto es consistente con la propia Circular SII 39/2022 §2, ya citada en este dossier ("el mayor valor obtenido en la enajenación o rescate... siempre que cumplan con los requisitos que la ley establece para cada tipo de valor" — la operación, no el instrumento aislado, es el sujeto de la condición) y con la mención en la misma circular de que ciertas cesiones bajo contrato de retrocompra que no cumplen la letra j) del N°8 del art. 17 LIR quedan excluidas del tratamiento — otra prueba de que la operación específica importa, no solo el tipo de instrumento. Corregido en el texto publicado sin nueva fuente: se reformuló "instrumento" → "operación de venta o rescate".

### ERROR #2 (rechazado — la auditoría está equivocada, se documenta la refutación)

El audit afirmó: *"La tabla oficial del Senado registra para ese boletín [18216-05, en la sesión del 04-08-2026]: 'Aplazamiento de la votación. Acuerdo de Comités'. Esto contradice la aprobación congresal en esa fecha afirmada por el draft."*

Se investigó esta afirmación específicamente el 2026-08-09 con cinco fuentes, todas por fetch/búsqueda directa, que forman una cronología coherente y consistente entre sí:

1. **parlamento.ai, "Reconstrucción nacional... tramitación completa del Boletín 18.216-05"** (fetch directo): registra el aplazamiento de votación del Senado en la fecha **2026-07-22** ("no hubo acuerdo para abrir la votación", "se solicitó su aplazamiento conforme al artículo 135 del reglamento") — **no en agosto**. El mismo documento registra que la Cámara aprobó el informe de comisión mixta por 80 votos ese mismo 22 de julio.
2. **Diario Estrategia, "Cámara despachó proyecto de reconstrucción nacional"** (fetch directo, noticia fechada **2026-07-23**): confirma la votación de la Cámara 80 a favor / 48 en contra / 2 abstenciones sobre el informe de comisión mixta — la pieza que había quedado pendiente tras el aplazamiento del Senado.
3. **El América, "Semana legislativa..."** (fetch directo, ronda 1, fechada **2026-08-04**): confirma que el 4 de agosto la Sala del Senado **retomó** precisamente esa votación aplazada (la del informe de comisión mixta, en su arista de compensación municipal), y que de aprobarse "el proyecto quedaría en condiciones de ser promulgado como ley".
4. **KPMG Chile, Tax Alert** (fetch directo, ronda 1): declaración explícita y fechada de que el 4 de agosto de 2026 la Cámara de Diputados comunicó al Presidente la aprobación del Congreso Nacional al proyecto.
5. **Emol, TC admite requerimientos** (fetch directo, ronda 1, fechada **2026-08-06**): el Tribunal Constitucional admitió a trámite requerimientos de la oposición contra el proyecto — un control de constitucionalidad de este tipo presupone un proyecto ya despachado por el Congreso, no uno todavía en votación.

**Conclusión:** el aplazamiento que cita el audit sí existió, pero ocurrió el **22 de julio**, no el 4 de agosto — es el mismo evento que el 4 de agosto vino a resolver. El audit fechó mal su propia cita ("sesión N° 47 de 04-08-2026") y presentó un hecho real de tres semanas antes como si contradijera la fecha del draft. No se encontró ninguna fuente, oficial o de prensa, que registre un aplazamiento en la sesión del 4 de agosto — se buscó específicamente y no apareció. Se mantiene la fecha 2026-08-04 en el texto publicado.

**Nota para quien audite/revise después:** esta es la segunda vez en este run que una salida adversarial (ChatGPT) produce una cita específica con apariencia de verificada (número de sesión, texto entrecomillado) que no se pudo corroborar con fetch directo. Tratar sus citas específicas de trámites parlamentarios con la misma cautela que las fuentes no confiables — no asumir que "verificación independiente" significa que hubo fetch real.

### TODO:SOURCE (4) — aceptados y declinados, no son errores en lo publicado

| TODO:SOURCE del audit | Decisión | Razón |
|---|---|---|
| Obligación general de declarar F22 según monto/tipo de activo no está fuente-citada | Declinado — fuera de alcance | Esa frase es contenido preexistente de apertura del artículo, no tocado por este refresh (el brief cubre solo la sección de ganancias de capital). |
| Deferral a sii.cl/reglamento interno "no basta sin URL" (dos instancias) | Declinado — deferral deliberado | Determinar el régimen de un fondo específico es intrínsecamente caso a caso (composición de cartera y tipo de partícipe de CADA fondo), no un valor único fetcheable de forma general — cumple `NORMA_YMYL.md §2.4(b)`. Añadir una URL genérica de sii.cl no resolvería la trazabilidad de un caso individual. |
| No se citó fuente primaria para el requisito del 90% de cartera que sustenta la frase sobre fondos | Declinado — decisión deliberada de no publicar esa cifra | Ya documentado en Ronda 2: la única fuente disponible es secundaria (Rankia). Se prefirió no publicar el número antes que publicarlo con respaldo débil. Queda como ítem abierto para quien tenga acceso a fetch exitoso de bcn.cl. |

## Ronda 4 — investigación delegada del TODO:SOURCE restante (subagente fresco)

`05-math-audit-r3.md` dio CONDITIONAL con un único `TODO:SOURCE`: la fecha de vigencia 01-01-2027 de la restitución del art. 107 solo estaba respaldada por el Tax Alert de KPMG, no por texto legal oficial. Se delegó la investigación a un subagente sin exposición a esta sesión (ver informe completo en `RESEARCH-vigencia-2027-todo-source.md`).

**Resultado: sigue TODO:SOURCE — pero ahora con evidencia de que la fuente primaria estructuralmente no existe todavía**, no de que falte buscar mejor:

- Tres rutas oficiales intentadas, las tres fallaron por razones técnicas verificadas y distintas: BCN/LeyChile (timeout de la aplicación, sin "Historia de la Ley" indexada para el Boletín 18.216-05), camara.cl (**HTTP 403 confirmado también con `curl` directo**, no es limitación de la herramienta de fetch), senado.cl (HTML renderizado por JS, sin datos sustantivos). Diario Oficial no registra publicación — consistente con que el proyecto sigue en control de constitucionalidad ante el TC al 2026-08-09 y por tanto **no puede existir todavía** un texto de ley promulgado que citar.
- Se encontró una **segunda fuente profesional independiente de KPMG**: Torretti Abogados (vía cnc.cl), PDF fechado 23-04-2026, que cita literalmente: *"El Proyecto modifica el actual artículo 107 de la LIR... Entraría en vigencia a contar del 1° de enero de 2027."* Limitación: analiza el proyecto tal como fue *ingresado* (mensaje presidencial de abril), no el texto final aprobado en agosto — no se puede descartar que la fecha haya cambiado durante la tramitación.
- Corroboración indirecta: un requerimiento de inconstitucionalidad ante el TC (documento legal genuino, fetcheado y procesado con `pdftotext`) cita literalmente el texto aprobado del proyecto y confirma que el patrón "01 de enero de 2027 (o entrada en vigencia si fuere posterior)" es real y se usa en al menos una disposición tributaria del mismo proyecto (art. 29, invariabilidad tributaria) — pero ese documento no impugna ni menciona el art. 107, así que no prueba la fecha para esa disposición específica.

**Implicación para el pipeline:** este `TODO:SOURCE` no es resoluble por más fetch o mejor búsqueda en este momento — depende de que el proyecto se promulgue y publique en el Diario Oficial, evento que todavía no ocurrió a la fecha de corte. Es distinto de un TODO:SOURCE "perezoso" (fuente existe pero no se buscó bien). Queda como decisión de compliance/humano si la redacción actual del artículo (ya condicional: "restituiría", "no es ley vigente") es aceptable para publicar tal cual, dado que no hay manera de citar mejor una ley que aún no existe.

**Texto del artículo: sin cambios.** Se evaluó agregar "según fuentes profesionales (KPMG, Torretti)" al texto publicado y se decidió no hacerlo — el texto actual ya es apropiadamente condicional y nombrar firmas específicas en una FAQ de consumo no agrega trazabilidad verificable para el lector; la trazabilidad completa queda en este dossier para auditoría.

## Ronda 5 — fuente primaria localizada (2026-08-09, esta sesión)

El `TODO:SOURCE` de la Ronda 4 quedaba genuinamente bloqueado porque `curl` directo y `WebFetch` recibían **HTTP 403** de camara.cl y timeout de bcn.cl. Se probó `scrapling` (dependencia ya declarada en `pyproject.toml`, mencionada como candidata y descartada solo para el runtime de producción en Cloudflare Workers por `docs/adr/ADR-20260516-economic-snapshot-cloudflare-worker.md` — nada impide usarla ad hoc desde este entorno de desarrollo). `scrapling extract get --impersonate chrome` (impersonación de fingerprint TLS/HTTP, no un navegador headless) obtuvo **HTTP 200** en el primer intento contra la misma URL de camara.cl que había dado 403.

Desde ahí se siguió el enlace "Ver" del trámite **"04 Ago. 2026 — Trámite finalización en Cámara de Origen / C. Diputados — Oficio de ley al Ejecutivo"** (registro oficial de tramitación, confirmando independientemente y por fuente primaria que el despacho SÍ ocurrió el 4 de agosto — cierra de forma definitiva, con documento oficial y no solo con prensa, la disputa ya resuelta en Ronda 3 sobre el ERROR #2 del audit). Ese enlace apunta a `camara.cl/verDoc.aspx?prmID=36954&prmTIPO=OFICIOPLEY`, que sirve un `.docx` real (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`, 229.773 bytes) — el **Oficio de ley** con el texto íntegro aprobado por el Congreso el 04-08-2026, previo a observaciones del Ejecutivo y control del TC. Copia guardada en este run: `fuente-primaria-oficio-ley-18216-05.docx`.

**Cita literal del texto oficial** (extraída del XML del docx con `zipfile`/regex, sección de modificaciones a la LIR):

> "Artículo 8.- Introdúcense las siguientes modificaciones en la Ley sobre Impuesto a la Renta, contenida en el artículo 1° del decreto ley N° 824, de 1974, del Ministerio de Hacienda: [...] 4. En el artículo 107°: a) En el primer párrafo del número 1): i. Reemplázase la frase "se afectará con un impuesto con tasa de 10%, que tendrá el carácter de impuesto único a la renta," por la siguiente "no constituirá renta". [...]"

**Cita literal de la vigencia** (Artículo noveno transitorio del proyecto, texto íntegro):

> "Artículo noveno transitorio.- Las modificaciones establecidas en esta ley que no tengan una fecha especial de vigencia entrarán en vigencia a contar del primer día del mes siguiente al de su publicación en el Diario Oficial. Lo anterior es sin perjuicio de las siguientes vigencias especiales: [...] 3. Lo establecido en los números 2 y 4 del artículo 8 de esta ley entrará en vigencia a contar del 1 de enero de 2027."

El número 4 del artículo 8 es exactamente la modificación al art. 107 citada arriba. **Esto confirma con fuente primaria y cita literal, no con resumen de terceros, que la vigencia 01-01-2027 es correcta tal como fue aprobada por el Congreso el 04-08-2026** (antes de observaciones del Ejecutivo del 05-08-2026 y del control de constitucionalidad ante el TC, ambos ya reflejados en el texto publicado del artículo con "a la fecha de esta actualización... no es ley vigente").

**Actualización de status:** el claim "El proyecto restituiría el ingreso no renta desde el 01-01-2027" pasa de `TODO:SOURCE` a **VERIFIED** — fuente primaria: Oficio de ley al Ejecutivo, Boletín 18.216-05, Cámara de Diputados de Chile, `camara.cl/verDoc.aspx?prmID=36954&prmTIPO=OFICIOPLEY`, recuperado 2026-08-09.

**Texto del artículo: sin cambios.** La redacción ya vigente en `src/data/blog/operacion-renta-centro.md` era correcta y apropiadamente condicional; lo que cambia es la calidad de la fuente detrás de esa afirmación (de secundaria/profesional a primaria/legal), no la afirmación en sí.

**Nota metodológica para futuras rondas de este u otros runs:** cuando `WebFetch`/`curl` reciban 403 o timeout en sitios `.gob.cl` o del Congreso, intentar `scrapling extract get --impersonate chrome <url> <archivo>.html` antes de declarar la fuente irrecuperable. Para contenido binario (docx/pdf servido con content-type de Office/PDF), usar la API Python (`from scrapling.fetchers import Fetcher; Fetcher.get(url, impersonate="chrome").body`) en vez del CLI, que solo acepta salida `.md/.html/.txt`.

## Ronda 6 — resolución de defectos Bucket C de `06-compliance.md` (2026-08-09)

`06-compliance.md` (ComplianceAgent, sesión fresca) dio verdict FAIL: scorecard 8.6/10, 9 defectos. Triage: DEFECT #2 y #5 son los dos que sostienen el veredicto FAIL; el resto son ALTO/MEDIO/BAJO no bloqueantes por sí solos, o requieren decisión humana. Resueltos en esta sesión (Bucket C, no requieren re-abrir research ni repetir el patrón de auto-verificación que motivó DEFECT #5):

- **DEFECT #1** (fechas del pie): corregida solo la sub-frase "actualizada el 2026-08-03 con verificación de fuentes" → 2026-08-09 (describe trabajo de contenido ya hecho). La línea "Última revisión editorial: Carlos Ortega — 2026-08-03" se dejó intacta a propósito — es la firma de un revisor humano y el sign-off sigue pendiente; cambiarla ahora falsificaría una revisión que no ocurrió. Coincide con la resolución que el propio ComplianceAgent recomendó.
- **DEFECT #2** (bloqueante): agregada la entrada faltante en `docs/development/BACKLOG_EDITORIAL.md`, sección "Registro de revisiones sustantivas (`updatedDate`)".
- **DEFECT #4**: agregada "Circular SII N° 39 de 2022 y Ley N° 21.420" a la lista de "Fuentes primarias" del pie del artículo.
- **DEFECT #7**: `03-outline.md` sincronizado con el texto final (ya no describe el bloque "Art. 108/109 LIR" retirado en Ronda 2, ni dice "bienes raíces sin cambios" cuando sí se corrigió en Ronda 3).
- **DEFECT #9** (nota de alcance explícita, en vez de decisión de contenido): `articleLead.answer` no menciona ganancias de capital como motivo de declarar. **Decisión de alcance: fuera de este refresh.** El brief (`01-brief.yaml`) limita el cambio al párrafo de ganancias de capital; ampliar `articleLead.answer` es un cambio de contenido distinto (afecta `validAsOf` y la respuesta ancla completa) que merece su propio brief si se decide hacerlo. Queda registrado explícitamente, no implícito, per el pedido del propio ComplianceAgent.
- **DEFECT #6** (nota metodológica, no requiere fetch nuevo): las citas "BCN/LeyChile" sin texto literal del propio MathAuditAgent (ChatGPT) no deben tratarse como equivalentes a fetch directo verificado en futuros runs de este pipeline — ya demostró una vez fabricar/mal-fechar una cita específica (ERROR #2, Ronda 2, retractado en Ronda 3). Documentado aquí para que quien continúe este run o abra uno nuevo no repita la confianza ciega en esas menciones.

**DEFECT #8** (bcn.cl/leychile sigue sin fetch exitoso del texto literal del art. 107): se reintentó con `scrapling extract get --impersonate chrome`. Resultado: **HTTP 200, pero mismo shell de carga JS ya documentado** ("Este proceso demora demasiado...") — a diferencia de camara.cl, el bloqueo de bcn.cl/leychile no es por fingerprint/bot-detection (que la impersonación TLS resuelve) sino por renderizado del lado del cliente que requiere un navegador real. Se intentó `scrapling install` para habilitar el fetcher con navegador (`stealthy-fetch`, vía Playwright/patchright) y falló en `playwright install-deps chromium` por requerir paquetes de sistema — no se procedió a instalar dependencias de sistema sin autorización explícita del usuario, por ser un cambio de entorno y no solo una llamada de red.

**Cierre de DEFECT #8 por la vía alternativa que el propio ComplianceAgent ofreció:** se acepta formalmente que la Circular SII N° 39/2022 (fuente oficial del SII, con cita literal y fetch directo exitoso) es fuente suficiente per `docs/editorial/NORMA_YMYL.md §1.1(4)` para sostener el claim central del refresh (10% desde 2022-09-02). El texto literal codificado del art. 107 LIR en bcn.cl/leychile queda como mejora deseable pero no bloqueante — TODO:SOURCE cerrado explícitamente aquí, no dejado abierto sin resolución.

**DEFECT #3**: no requiere acción — el propio ComplianceAgent concluyó que no es una violación clara de la norma tras revisar su alcance real.

**DEFECT #5 — resuelto por decisión explícita del HumanEditor (2026-08-10).** Se presentaron al usuario las dos vías que propuso `06-compliance.md`: (a) un pase acotado más de MathAuditAgent sobre la Ronda 5, o (b) aceptar la verificación independiente que ComplianceAgent ya hizo (extracción XML propia del `.docx` primario, no solo la narrativa de este dossier) como sustituto documentado del re-audit. El usuario eligió explícitamente la opción (b).

Esto **no es una decisión de DraftAgent ni un intento de saltarse el gate** — es exactamente el mecanismo que `06-compliance.md` dejó abierto para que un humano resolviera, y el propio HumanEditor de este proyecto (mismo patrón usado en runs anteriores, p. ej. `finanzas-para-migrantes-chile/20260622-1330-pipeline/07-publish-packet.md`, "D#3/D#5 escalados a Carlos Ortega" → resuelto por addendum humano) es quien lo resolvió. Con esto, los dos defectos que sostenían el verdict `FAIL` de `06-compliance.md` (DEFECT #2 y DEFECT #5) quedan resueltos: #2 por corrección directa (Ronda 6), #5 por decisión humana explícita. No se generó un nuevo `06-compliance-r2.md` — el verdict `FAIL` original de `06-compliance.md` queda como registro histórico del hallazgo; su resolución se documenta aquí y en `07-publish-packet.md`.

## Source Trust / Prompt Injection Notes

Ninguna fuente consultada contenía instrucciones dirigidas al agente. No se detectó contenido sospechoso de prompt injection en los PDFs oficiales (SII, KPMG) ni en las notas de prensa (Emol, El América) usadas en este dossier.

## Open Research Questions

1. Texto literal del art. 107 LIR en bcn.cl/leychile — pendiente por fallo técnico del fetch, no por falta de intento. Reintentar antes de compliance.
2. La cifra "8.000 UF" de bienes raíces (línea 77 del artículo, no tocada por este refresh) no fue re-verificada en este run — queda fuera de alcance.
