# Dossier — operacion-renta-f22-checklist (remediacion Fase B, lote 0)

- Source article: `src/data/blog/operacion-renta-f22-checklist.md`
- Run id: `20260812-1312-lote0b`
- Origen: ficha de auditoria `output/audits/corpus-2026-08-12/fichas/operacion-renta-f22-checklist.md`
- Fecha de corte de este run: 2026-08-12

## Intencion principal

Query ancla: "operacion renta f22 checklist" / "como reviso y envio mi F22". La
decision que necesita tomar el lector cambia segun cuando llega:

- Si llega durante una ventana AT abierta: que revisar antes de enviar.
- Si llega fuera de ventana (el caso de hoy, agosto 2026): que puede hacer con
  una declaracion ya enviada (observaciones, rectificatoria, estado de
  devolucion) y cuando vuelve a abrir el proceso.

## Riesgo YMYL

- Sensibilidad regulatoria: `alta` (materia tributaria, Operacion Renta).
- Requiere calculo: `no`. El reencuadre es temporal (vigencia de una ventana ya
  cerrada), no introduce ni modifica ninguna cifra calculada.

## Hallazgo que origina este run (carry-forward desde la ficha de auditoria)

- R2 vigencia — FAIL: el articulo usa presente indicativo ("la plataforma del
  SII **esta** abierta desde el 1 de abril... hasta el 8 de mayo de 2026")
  para describir una ventana que cerro: con pago, el 2026-04-30; sin pago
  (con devolucion), el 2026-05-08. Hoy es 2026-08-12. `updatedDate` estaba en
  2026-05-11, SLA vencido desde 2026-08-09.
- La tabla "Cuando llega la devolucion" repite el mismo defecto: calendario
  cerrado sin nota de cierre.
- Ausencia de `articleLead` en pieza `featured`/`homepagePriority: 200`.
- R5 exactitud (ya PASS en la auditoria, se conserva sin cambios): credito por
  gastos en educacion $174.803 (4,4 UF), calendario de deposito
  (29 abril / 15 mayo / 27 mayo; cheques 29 mayo), Prestamo Solidario
  COVID-19 (30% del monto, tope 5% de ingresos anuales). Estas cifras no se
  tocan; solo se reencuadran como dato del ciclo AT2026 ya cerrado.

## Fuentes oficiales — ya verificadas por la auditoria (2026-08-12), se conservan

- SII, comunicado 31 de marzo de 2026 — calendario AT2026 y novedades:
  <https://www.sii.cl/noticias/2026/310326noti01pcr.htm> — fetch previo
  2026-08-12 (ficha de auditoria). Confirma: con pago 8-30 abril; sin pago
  hasta 8 de mayo; calendario de deposito 29 abril / 15 mayo / 27 mayo,
  cheques 29 mayo.
- SII, "Rebaja de impuestos por gastos en educacion" / comunicados AT2026 —
  fetch previo 2026-08-12. Confirma $174.803 (4,4 UF al 31-12-2025) por hijo.
- SII/prensa, Prestamo Solidario COVID-19 4a cuota — fetch previo 2026-08-12.
  Confirma 30% del monto solicitado, tope 5% de ingresos anuales.

## Fuentes oficiales — refetcheadas para este run (reencuadre temporal)

- SII FAQ, reemplazo de declaracion enviada por Internet:
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8950.htm>
  — fetch 2026-08-12. Cita literal: "La declaracion de renta enviada por un
  medio electronico (Internet) sin pago, puede ser reemplazada tantas veces
  como se desee, hasta el 24 de abril [de 2026]. Los contribuyentes que
  declaren en forma posterior a esa fecha, no podran reemplazar la
  declaracion presentada." Uso: confirma que la ventana de reemplazo tambien
  cerro; no se incorpora la fecha exacta al cuerpo del articulo porque la
  linea existente en "Escenarios frecuentes" ya defiere correctamente al
  "plazo informado por SII para ese ano tributario" (deferral legitimo, no
  requeria correccion).
- SII FAQ, consulta de estado y observaciones / rectificatoria por Internet:
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8954.htm>
  — fetch 2026-08-12. Cita literal: "A partir de la segunda semana de junio
  del ano en curso. El contribuyente podra verificar el detalle de las
  observaciones a su declaracion y el motivo de la compensacion, si estas
  existieren, y podra rectificar por internet." No fija fecha de cierre —
  tramite abierto desde junio y vigente hoy (agosto 2026). Uso: fuente para
  la nueva seccion "que hacer hoy fuera de ventana".
- SII FAQ, rectificatoria que origina devolucion (autorizacion y pago via
  TGR):
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm>
  — fetch 2026-08-12. Cita literal: "Los contribuyentes que efectuen
  rectificatorias a su Declaracion de Impuesto a la Renta, recibiran su
  devolucion correspondiente alrededor de tres semanas despues de que el
  Servicio de Impuestos Internos autorice los montos a la Tesoreria General
  de la Republica." Uso: ya citada en el articulo original (nota TGR); se
  conserva sin cambio de contenido.
- Intento de fetch: `https://www.sii.cl/destacados/renta/2026/personas/` vía
  WebFetch (contenido vacio — pagina SvelteKit renderizada por JS, sin markup
  fetcheable) y vía `scrapling extract get --impersonate chrome` (200 OK, pero
  el HTML devuelto es solo el shell de la SPA — 1340 bytes, sin contenido de
  texto). No se cito texto de esta URL. `TODO:SOURCE: https://www.sii.cl/destacados/renta/2026/personas/ — fetch result: pagina SPA, sin markup con texto util; no se pudo confirmar ni desmentir nada desde esta URL. No bloquea el reencuadre porque el estado de cierre de ventana ya esta confirmado por el comunicado del 31-03-2026 mas la fecha de hoy (2026-08-12).`

## Fuentes oficiales — refetcheadas para ronda 2 (remediacion DEFECT #1-3, 2026-08-12)

Contexto: `06-compliance.md` (verdicto FAIL, 6,05/10) encontro que la seccion
nueva "Fuera de la ventana AT2026: que puedes hacer hoy" introducia (a) una
contradiccion interna entre `articleLead.answer` ("no puedes usar el flujo
normal") y el cuerpo ("igual puedes hacerlo... en sii.cl -> Servicios online
-> Renta"), (b) una afirmacion procedural sin fuente sobre el mecanismo de
declarar fuera de plazo, y (c) una afirmacion de vigencia permanente
("sigue abierto") sin fuente que la respalde. Se investigo con fuentes
oficiales en vivo para reconciliar ambas.

- SII FAQ, "¿Como se regulariza la situacion de contribuyentes que no han
  presentado sus Declaraciones del Impuesto a la Renta?":
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0595.htm>
  — fetch 2026-08-12. Cita literal: "Los contribuyentes que no han
  presentado Declaraciones de Renta de años anteriores pueden regularizar su
  situacion y determinar los impuestos correspondientes, a traves de la
  seccion Servicios online, Declaracion de renta, opcion Declarar renta
  (F22), donde debera autenticarse." Uso: **fuente primaria que resuelve
  DEFECT #1 y #2** — confirma que el mecanismo de declarar fuera de plazo SI
  es el mismo portal en linea (Servicios online -> Declaracion de renta ->
  Declarar renta (F22)), y que declarar es lo correcto/posible, no solo
  "consultar tu caso". Con esta fuente, `articleLead.answer` (que decia "no
  puedes usar el flujo normal") era la afirmacion incorrecta, no el cuerpo;
  se corrigio el lead para alinearlo con el cuerpo y con esta fuente.

  **Nota sobre el alcance literal de esta fuente (auto-revision, actualizada
  y simplificada en ronda 3, 2026-08-13):** el texto citado dice "años
  anteriores", no "AT2026". En ronda 2 esto se sostenia con una cadena de
  tres fuentes (0504 + 0595 + 3095) que la propia ronda 2 reconocia como no
  trivial. En ronda 3 se encontro y refetcheo una fuente directa que hace
  innecesaria esa cadena: `https://www.sii.cl/contribuyentes/p7renta.htm`
  ("¿Que pasa si no declare Renta...?") confirma el mismo mecanismo
  ("Declarar Renta F22" vía menu Ayuda → "¿Como se hace para...?") con
  lenguaje general de "no declarante" — sin la restriccion "años
  anteriores" y sin necesidad de inferencia. Ver seccion "Ronda 3" abajo
  para la cita literal completa. La cadena de tres fuentes de ronda 2 se
  conserva como respaldo secundario (no se retracta, sigue siendo correcta),
  pero ya no es el unico sosten de la afirmacion.
- SII FAQ, "¿Cuales son las multas asociadas a la presentacion de una
  Declaracion de Renta fuera de plazo?":
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm>
  — fetch 2026-08-12. Cita literal (resumen del fetch, contenido HTML no
  copiable integramente): declaraciones "con pago" — multa de 10% de los
  impuestos reajustados si el atraso no supera 5 meses, sube 2% por mes
  adicional con tope de 30%, mas interes penal (el fetch reporta una tasa
  diaria de 0,0222222222%, fechada al segundo semestre de 2025; no se
  verifico si es la tasa vigente a agosto de 2026, ya que el SII publica y
  actualiza esta tasa por semestre); declaraciones "con devolucion" o "sin
  pago" — multa entre 1 UTM y 1 UTA. Uso: fuente para los porcentajes
  especificos citados en la seccion "Si no alcanzaste a declarar dentro de
  la ventana AT2026". Se cruzo con un fetch independiente de
  `001_112_3095.htm` (arbol de FAQ distinto, mismo contenido sustantivo)
  para verificar consistencia antes de citar.

  **Nota sobre el alcance de esta cifra (auto-revision):** por lo anterior,
  el cuerpo del articulo dice solo "mas interes penal", sin calificarlo de
  "mensual" ni citar el numero exacto de la tasa — evita afirmar un
  periodo o una tasa que esta fuente no confirma como vigente hoy. Si se
  quisiera citar el numero exacto en una iteracion futura, corresponde
  refetchear esta FAQ (o la pagina de tasas de interes moratorio del SII)
  en la fecha de esa revision, no reusar el valor de este run.
- SII FAQ, "¿Cuando es considerada fuera de plazo una Declaracion de Renta?":
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0504.htm>
  — fetch 2026-08-12. Cita literal: "Se considera que una Declaracion de
  Renta esta fuera de plazo cuando es presentada despues del plazo
  establecido del periodo de presentacion del Formulario 22." Uso:
  confirma la definicion base, no se cito directamente en el cuerpo (ya
  implicita en el reencuadre de cierre de ventana).
- ChileAtiende, ficha 3178 (Declaracion de Renta) — ya listada en "Fuentes y
  referencias primarias" del articulo desde antes de este run; refetch
  2026-08-12 confirma ademas: "Si no presentas tu declaracion dentro del
  plazo legal, generaras multas e intereses en tu declaracion" y que queda
  la anotacion "No declarante F22" (bloquea otros tramites ante el SII)
  hasta regularizar. Uso: respalda la mencion de "No declarante F22" que se
  agrego al bullet reformulado.
- Reconfirmacion de DEFECT #3 (vigencia "sigue abierto"): refetch de
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8954.htm>
  (ya citada) confirma unicamente la fecha de apertura ("a partir de la
  segunda semana de junio del ano en curso"); no menciona fecha de cierre
  ni afirma disponibilidad permanente. Se intento localizar una fuente que
  confirmara explicitamente la ausencia de fecha de cierre (busqueda
  dirigida en el arbol de FAQ de declaracion de renta del SII); no se
  encontro ninguna FAQ que trate el cierre de ese tramite especifico. Se
  reformulo la frase en el cuerpo para no afirmar "sigue abierto" como
  hecho permanente, y en su lugar declarar que la ficha no publica fecha de
  cierre y remitir al lector a confirmar en sii.cl.

## AT2027 — verificacion de que NO existe calendario publicado aun

- Busqueda dirigida (`SII calendario Operacion Renta AT2027 fecha
  publicacion`, 2026-08-12): ningun resultado oficial menciona un calendario
  AT2027 publicado. Los resultados solo cubren AT2026 (calendario publicado
  el 2026-03-31, ver comunicado citado arriba).
- Patron historico observable en las fuentes: el comunicado de apertura de
  Operacion Renta se publica a fines de marzo del ano de declaracion (AT2026
  se publico 2026-03-31). No hay fuente oficial que fije la fecha exacta para
  AT2027; se declara explicitamente en el articulo que el SII "aun no publica
  el calendario AT2027" sin inventar una fecha, cumpliendo la instruccion del
  brief.

## Decisiones editoriales

- La pieza permanece PERENNE. No se archiva ni se le quita el status
  `featured`/`homepagePriority`.
- El calendario AT2026 se mantiene en el cuerpo (tabla de devolucion incluida)
  como referencia fechada explicita, con nota de cierre, no como instruccion
  vigente.
- Ninguna cifra verificada por R5 se modifica; solo se reencuadra su marco
  temporal.
- **Actualizado en ronda 2 (2026-08-12):** la decision original de no
  introducir cifras de multa/interes causo DEFECT #1/#2 (compliance FAIL) —
  el cuerpo afirmaba un mecanismo concreto ("igual puedes hacerlo... en
  sii.cl") sin fuente, y el lead lo contradecia. La resolucion no fue omitir
  la cifra sino **citar la regla general publicada por el SII** (porcentajes
  de multa/interes de FAQ 001_140_3095), que es un valor tabular publico y
  fetcheable — no un calculo derivado para un caso individual, por lo que no
  dispara `requires_calculation`. Lo que sigue como deferral legitimo (NORMA
  §2.4 condicion 2) es el **monto exacto** para el lector y la
  **elegibilidad de condonacion**, que si dependen del caso concreto
  (Formulario 2667). Este ajuste es consistente con el ejemplo de NORMA
  §2.4: "Tramos ISC (tabla publica en SII)" es deferral ilegitimo si se evita
  citar la tabla; aqui la tabla de multas SI se cita, y solo se defiere el
  monto final especifico del lector.

## Fuentes oficiales — refetcheadas para ronda 3 (cierre Bucket C, 2026-08-13)

Contexto: `06-compliance-round2.md` (ComplianceAgent, sesion fresca, ronda 2)
emitio veredicto CONDITIONAL (8,73/10) y dejo 3 items Bucket C en su seccion
"Ruta de resolucion": (1) resolver o descartar formalmente el `TODO:SOURCE`
de `sii.cl/destacados/renta/2026/personas/`, (2) agregar
`sii.cl/contribuyentes/p7renta.htm` como fuente adicional (DEFECT-NUEVO #1),
(3) acotar "igual debes hacerlo" a los contribuyentes obligados a declarar
(DEFECT-NUEVO #2).

- SII, "Operación Renta Personas AT 2026" (landing con preguntas frecuentes
  de elegibilidad): <https://www.sii.cl/destacados/renta/2026/personas/> —
  reintento de fetch 2026-08-13 con Playwright (`chromium.launch()` +
  `page.goto(..., wait_until="networkidle")` + `page.inner_text("body")`),
  tecnica distinta de WebFetch y de `scrapling extract get` (ambas hacen un
  GET estatico y solo devuelven el shell SvelteKit de 1340 bytes sin
  contenido, confirmado de nuevo en esta ronda antes de probar Playwright).
  Esta vez si se obtuvo el contenido renderizado (2692 caracteres): menu de
  navegacion, preguntas frecuentes de la landing, y el criterio general de
  obligacion de declarar ("En 2025 tuviste ingresos anuales mayores a
  $11.265.804. Si estos ingresos corresponden a sueldos pagados por un solo
  empleador, no estas obligado a presentar tu declaracion..."). Uso: el
  `TODO:SOURCE` queda **RESUELTO** (ver `04-draft.md`). El contenido no
  contradice ninguna afirmacion publicada del articulo ni introduce un dato
  que el cuerpo necesite citar (el articulo usa criterios cualitativos en la
  tabla de obligacion de declarar, no el umbral en pesos); por eso no se
  modifico el blog file a partir de este fetch especifico.
- SII, "¿Que pasa si no declare Renta o la informacion de mi declaracion no
  cuadra con la del SII?": <https://www.sii.cl/contribuyentes/p7renta.htm> —
  fetch 2026-08-13 (Playwright, misma tecnica). Cita literal completa del
  parrafo relevante: *"Si usted no declaro rentas y estaba obligado a
  hacerlo, sera citado a las unidades del SII. Ademas, usted presentara en
  los registros del SII la anotacion tributaria, No declarante F22, la cual,
  le impedira realizar algunos tramites importantes con el Servicio. Para
  regularizar esta situacion, debe presentar su declaracion anual de
  impuesto a la renta a traves de Internet. ¿Como hacerlo?. Puede seguir las
  instrucciones presentes en el sitio web del SII, menu Ayuda, opcion ¿Como
  se hace para...?, opcion Declaracion, pago, devolucion de impuestos y
  condonacion de intereses y multas, opcion Declarar Renta (F22). El hecho
  de no haber presentado su declaracion dentro del plazo legal, generara
  multas e intereses a su declaracion."* Uso doble:
  1. **DEFECT-NUEVO #1:** confirma el mismo mecanismo (portal SII, opcion
     "Declarar Renta F22") que `001_140_0595.htm`, pero con lenguaje general
     de "no declarante" — sin la restriccion "años anteriores" que obligaba
     a la cadena de tres fuentes de ronda 2. Se agrego como fuente adicional
     en `articleLead.officialSources` y en "Fuentes y referencias primarias"
     del blog file.
  2. **DEFECT-NUEVO #2:** el propio texto de esta fuente condiciona la
     obligacion de regularizar a "si usted... estaba obligado a hacerlo" —
     confirma exactamente el matiz que el compliance de ronda 2 senalo como
     faltante en `articleLead.answer` y el cuerpo. Se uso este texto como
     base para acotar "igual debes hacerlo" a "si estabas obligado a
     declarar y no alcanzaste a hacerlo, igual debes regularizar".
  Tambien confirma, de forma consistente con la fuente ChileAtiende ya
  citada, la anotacion "No declarante F22" y que la presentacion fuera de
  plazo genera multas e intereses — sin introducir cifras nuevas ni
  contradecir los porcentajes ya citados de `001_140_3095.htm`.

Archivos actualizados en esta ronda: `src/data/blog/operacion-renta-f22-checklist.md`,
`02-dossier.md` (este archivo), `04-draft.md`, `07-publish-packet.md`. No se
genero `06-compliance-round3.md` (corresponde a ComplianceAgent en sesion
fresca). No se edito `06-compliance.md` ni `06-compliance-round2.md` (se
preservan como registro historico). No se edito
`docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`.
