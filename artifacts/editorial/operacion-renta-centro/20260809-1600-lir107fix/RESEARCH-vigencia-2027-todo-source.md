# Research: vigencia 01-01-2027 del art. 107 LIR restituido (Boletín 18.216-05)

Fecha de investigación: 2026-08-09
Investigador: subagente fresco, sin exposición a la sesión que produjo el draft/audit.

## Resultado

SIGUE TODO:SOURCE

No se logró el fetch del texto oficial/primario (Cámara, Senado, BCN/LeyChile, Diario Oficial) que contenga el artículo transitorio específico del Boletín 18.216-05 que fija la vigencia 01-01-2027 para la restitución del art. 107 LIR a ingreso no constitutivo de renta. Sí se obtuvo corroboración adicional independiente de KPMG (ver abajo), pero sigue siendo fuente profesional secundaria, no el texto legal.

## Evidencia

### Intentos de fuente oficial/primaria (en orden de prioridad indicado)

1. **BCN/LeyChile** (`bcn.cl/leychile/consulta/portada_hl?tipo_norma=XX1&nro_ley=18216-05`) — WebFetch devolvió error de timeout de la propia aplicación de LeyChile ("Este proceso demora demasiado..."). Búsquedas adicionales en bcn.cl solo devolvieron resultados de la Ley N° 18.216 (indulto/penas sustitutivas, 1983), un número de ley distinto que coincide por casualidad con el boletín. No se encontró "Historia de la Ley" indexada para el Boletín 18.216-05, consistente con que el proyecto aún no es ley promulgada.

2. **camara.cl** (`ProyectosDeLey/tramitacion.aspx?prmID=18872&prmBOLETIN=18216-05`, URL confirmada correcta vía búsqueda) — WebFetch devolvió **HTTP 403 Forbidden**. Se confirmó el bloqueo también con `curl` directo (user-agent de navegador incluido) desde bash: **403** confirmado, no es limitación solo de WebFetch — camara.cl bloquea el fetch automatizado de esa ruta.

3. **tramitacion.senado.cl** (`appsenado/templates/tramitacion/index.php?boletin_ini=18216-05`) — Fetch exitoso (HTTP 200) pero la página es una shell renderizada por JavaScript; el contenido devuelto son solo tablas vacías de navegación ("Proyectos Iniciados 2026", "Proyectos de Ley Despachados"), sin datos sustantivos del boletín. Mismo resultado documentado ya en Ronda 1/2 del dossier — confirmado que sigue así.

4. **diariooficial.interior.gob.cl** — la ruta de búsqueda probada (`/busqueda-avanzada/?search=18216-05`) devolvió **HTTP 404**. No se identificó otra ruta de búsqueda funcional en el tiempo disponible. Consistente con la expectativa del dossier: el proyecto seguía en control de constitucionalidad ante el TC al 2026-08-09 y no debería estar promulgado ni publicado.

5. **web.archive.org** (intento de snapshot archivado de camara.cl) — la herramienta de fetch de este entorno tiene bloqueado explícitamente `web.archive.org` ("Claude Code is unable to fetch from web.archive.org"). No se pudo usar como vía alternativa.

### Documento cuasi-primario encontrado: requerimiento de inconstitucionalidad ante el TC

Se fetcheó y procesó con `pdftotext` el PDF del requerimiento de inconstitucionalidad presentado ante el Tribunal Constitucional (`static.emol.cl/emol50/documentos/archivos/2026/07/21/20260721171245.pdf`, 6 MB, fechado 21-07-2026). Este documento es un escrito legal genuino que **cita literalmente** el texto del proyecto tal como fue aprobado por el Senado en segundo trámite constitucional. Contiene, por ejemplo, la cita literal del artículo 29 del proyecto:

> "Artículo 29.- Créase, a contar del 1 de enero de 2027 o de la entrada en vigencia de la presente ley, si ocurriere en una fecha posterior, el estatuto de invariabilidad tributaria para inversionistas..."

Sin embargo, el requerimiento **no impugna ni menciona en ningún punto el art. 107 LIR ni la restitución del ingreso no renta** (se verificó con búsqueda de texto completo del PDF: cero coincidencias para "ingreso no renta", "ingreso no constitutivo", "impuesto único", "bursátil"). Sus fundamentos de inconstitucionalidad son sobre otras materias (compensación municipal, estatuto de invariabilidad tributaria del art. 29, permisos, acuicultura — consistente con lo ya documentado en el dossier). Este hallazgo es útil solo como **evidencia indirecta**: confirma que "01-01-2027 (o entrada en vigencia si fuere posterior)" es un patrón de vigencia real y verificado, literalmente citado del texto aprobado, usado por el propio proyecto en al menos una disposición tributaria distinta (invariabilidad tributaria). No prueba la fecha para el art. 107 específicamente.

### Segunda fuente profesional (no KPMG) que corrobora la fecha para el art. 107

Se fetcheó el PDF **"Tax Pop-Up: Medidas Tributarias PDL para la Reconstrucción Nacional y el Desarrollo Económico y Social" (23-04-2026)**, publicado por el estudio **Torretti Abogados** (marca de agua `www.torretti.cl` en cada página) y alojado en el sitio de la Cámara Nacional de Comercio: `https://cnc.cl/wp-content/uploads/2026/04/Tax-Pop-Up-Medidas-Tributarias-PDL-para-la-Reconstruccion-Nacional-y-el-Desarrollo-Economico-y-Social-23-04-2026.pdf`. WebFetch no logró leer el texto (lo interpretó como binario), así que se extrajo con `pdftotext -layout` localmente y se buscó "107"/"2027" en el texto plano.

Cita literal (sección "Impuesto a las Ganancias de Capital"):

> "El Proyecto modifica el actual artículo 107 de la LIR, estableciendo que el mayor valor o ganancia de capital obtenido en la enajenación de acciones de S.A. abiertas, cuotas de fondos de inversión y cuotas de fondos mutuos, todos con presencia bursátil, será considerado como un ingreso no renta. En consecuencia, se eliminaría el Impuesto Único que grava con tasa de 10% dichas ganancias de capital.
>
> ¿Cuándo entraría en vigencia?
> Entraría en vigencia a contar del 1° de enero de 2027."

Recuperado: 2026-08-09 (fetch directo del PDF + extracción local con `pdftotext`).

Limitaciones de esta fuente:
- Es un documento de análisis de un estudio de abogados (fuente profesional secundaria), igual que KPMG — no es el texto legal.
- Está fechado 23-04-2026, es decir, analiza el proyecto **tal como fue ingresado/mensaje presidencial**, no el texto final aprobado el 04-08-2026 tras Comisión Mixta. No se puede descartar que la fecha de vigencia haya cambiado durante la tramitación (aunque el patrón "01-01-2027" confirmado independientemente en el art. 29 del texto aprobado — ver arriba — hace plausible que se mantuviera).
- No cita el número de artículo transitorio específico (el documento es una síntesis en formato "slide", sin numeración de artículos transitorios en ninguna de sus secciones).

Otras fuentes profesionales adicionales consultadas para corroboración de la **sustancia** (no de la fecha):
- **Deloitte Chile** (`deloitte.com/cl/es/services/tax/perspectives/proyecto-de-ley-para-la-reconstruccion-nacional.html`) — confirma "eliminación del impuesto único del 10% a ganancias bursátiles" y que "restituye el carácter de ingreso no renta", pero no menciona fecha de vigencia.
- **Barros & Errázuriz** (`bye.cl/bill-for-national-reconstruction-and-economic-and-social-development-key-measures-everyone-should-know/?lang=en`, 17-04-2026) — confirma la restitución de ingreso no renta bajo art. 107 y eliminación del 10%, pero tampoco cita fecha de vigencia ni artículo transitorio.
- **PwC Chile** — el PDF del newsletter (`pwc.com/cl/.../PwC-Newsletter-Proyecto-de-reconstruccion-nacional.pdf`) devolvió HTTP 403 en WebFetch, no se pudo revisar.
- **EY Chile** — la URL encontrada por búsqueda correspondía a un alert de una reforma tributaria distinta (2022), no al proyecto de Reconstrucción Nacional; descartada por no ser la fuente correcta.
- **CNC** (`cnc.cl`, el mismo host que aloja el Tax Pop-Up de Torretti) — no se encontró un análisis propio adicional distinto del documento de Torretti ya citado.

### Conclusión de esta ronda de investigación

No se pudo verificar contra texto legal oficial (BCN/LeyChile, Cámara, Senado o Diario Oficial) el número exacto del artículo transitorio del Boletín 18.216-05 que restituye el art. 107 LIR y fija su vigencia en 01-01-2027. Las tres rutas oficiales candidatas fallaron por razones técnicas distintas y verificadas (timeout de aplicación en BCN, bloqueo HTTP 403 confirmado también por curl en camara.cl, renderizado JS sin datos en senado.cl) — no por falta de intento. El Diario Oficial no registra publicación, consistente con que el proyecto seguía en control de constitucionalidad al 2026-08-09.

Sí se logró una segunda fuente profesional independiente de KPMG (Torretti Abogados, vía CNC) que cita literalmente la misma fecha 01-01-2027 para la restitución del art. 107, más una confirmación indirecta pero verificada por fetch directo de un documento cuasi-legal (requerimiento TC que cita literalmente el texto aprobado del proyecto) de que "01 de enero de 2027 (o entrada en vigencia si fuere posterior)" es un patrón de vigencia real usado en al menos una disposición tributaria de este mismo proyecto tal como fue aprobado por el Congreso.

## Recomendación para el draft

Mantener la redacción actual del artículo, que ya explicita la condicionalidad ("si se publica sin cambios") y no afirma la fecha 01-01-2027 como definitiva ni la presenta como ley vigente. Esa redacción sigue siendo la correcta dado que:

1. El texto legal oficial no es fetcheable ni está publicado a la fecha de corte (2026-08-09) — no existe una fuente primaria disponible para citar, y no la habrá hasta que se resuelva el control de constitucionalidad y se promulgue/publique la ley.
2. La fecha 01-01-2027 ahora cuenta con corroboración de **dos** fuentes profesionales independientes (KPMG y Torretti Abogados), no solo una — esto puede mencionarse en el dossier/auditoría como refuerzo de la fiabilidad de la fecha citada como "según fuentes profesionales", pero no cambia su naturaleza de fuente secundaria.
3. Si se desea reforzar la redacción sin violar `NORMA_YMYL.md`, se sugiere (a decisión de ComplianceAgent/humano, no de este research) una fórmula explícita del tipo: "Distintas firmas de asesoría tributaria (KPMG, Torretti Abogados) han señalado que la vigencia propuesta es a contar del 1 de enero de 2027, sujeto a que el proyecto se apruebe y publique sin cambios en esa disposición" — dejando explícito que la fecha proviene de fuentes profesionales y no de texto legal verificado, sin inventar un número de artículo transitorio no confirmado.
4. El `TODO:SOURCE` del audit (05-math-audit-r3.md) debería permanecer **abierto** hasta que alguien logre el fetch del texto oficial (recomendado: reintentar camara.cl con un método no bloqueado —por ejemplo un fetch autenticado o herramienta MCP especializada si existe alguna disponible en el futuro— o esperar a que BCN/LeyChile indexe la "Historia de la Ley" del Boletín 18.216-05 una vez la ley se promulgue).
