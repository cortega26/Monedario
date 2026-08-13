# Dossier — devolucion-impuestos-fechas-compensaciones (remediacion Fase B, lote 0)

- Source article: `src/data/blog/devolucion-impuestos-fechas-compensaciones.md`
- Run id: `20260812-1420-lote0c`
- Origen: ficha de auditoria `output/audits/corpus-2026-08-12/fichas/devolucion-impuestos-fechas-compensaciones.md`
- Fecha de corte de este run: 2026-08-12

## Intencion principal

Query ancla real: "¿cuando depositan mi devolucion?" / "ya paso la fecha y no
me han depositado, ¿que hago?". La decision que necesita tomar el lector
cambia segun su situacion:

- Ya declaro dentro de AT2026 y espera (o esperaba) el deposito: necesita
  saber que el calendario mostrado ya cerro y que hacer si nunca le llego.
- No alcanzo a declarar dentro de AT2026: necesita saber que opciones tiene
  hoy, fuera de esa ventana.
- Llega buscando el proximo ciclo (AT2027): necesita saber que ese calendario
  aun no existe, sin que se le muestre una fecha inventada.

## Riesgo YMYL

- Sensibilidad regulatoria: `alta` (materia tributaria, Operacion Renta,
  devoluciones y compensaciones TGR).
- Requiere calculo: `no`. El reencuadre es temporal (vigencia de un
  calendario ya cerrado); no introduce ni modifica ninguna cifra.

## Hallazgo que origina este run (carry-forward desde la ficha de auditoria)

- R1 respuesta ancla — FAIL: no existe `articleLead`. La primera seccion util
  ("Qué hacer ahora (3 pasos)") es un proceso generico sin la fecha/regla
  concreta que responde la query ancla; el calendario con fechas aparece
  recien en la segunda seccion, fuera de la plantilla "Respuesta rapida" que
  exige NORMA §2.3.
- R2 vigencia — FAIL (hallazgo principal): el articulo completo esta
  construido alrededor del ciclo AT2026, cuyo calendario de pago cerro el
  27-29 de mayo de 2026 (deposito) / 29 de mayo (cheques). Hoy es 2026-08-12.
  La intro y "Qué hacer ahora" estan en presente/futuro inmediato, sin nota de
  que el calendario ya cerro.
- R3 fuentes oficiales — PASS (se conserva): 6 fuentes oficiales en el cuerpo
  (SII x5, ChileAtiende x1) frente al minimo DoD de 2.
- R4 deferral §2.4 — PASS/N-A (se conserva sin cambios): las instrucciones de
  "revisa en SII / revisa en TGR" apuntan a consultar el estado de la cuenta
  propia del contribuyente (dato individual no fetcheable de forma generica),
  deferral legitimo por §2.4 condicion 2. No se tocan.
- R5 exactitud — PASS (se conserva sin cambios): el calendario de fechas
  citado coincide exactamente con la fuente oficial: presentacion 1-8 abril
  -> deposito 29 abril; 9-23 abril -> 15 mayo; 24 abril-8 mayo -> 27 mayo;
  cheques 29 mayo; cheques >$3.000.000 a domicilio. Verificado contra SII,
  comunicado 31-03-2026. Estas cifras no se tocan.
- R6 reformas — N/A: no hay reforma legal pendiente de implementacion en este
  articulo; es un calendario operativo anual.
- R7b estructura DoD — observacion no bloqueante (sin H2 literal "Qué
  cambia"/"Fuentes y vigencia normativa"); no se fuerza renombre de H2 fuera
  del alcance del reencuadre temporal.
- R9 prosa — sin patrones prohibidos de §2.2; el defecto es de vigencia, no de
  redaccion; no se reescribe prosa no afectada.

## Fuentes oficiales — ya citadas en el articulo publicado, se conservan

- SII, comunicado 31 de marzo de 2026 — calendario AT 2026 y novedades:
  <https://www.sii.cl/noticias/2026/310326noti01pcr.htm> — fetch previo
  2026-08-12 (ficha de auditoria). Confirma el calendario de deposito/cheque
  citado arriba, verbatim.
- SII FAQ, fechas de devolucion AT 2026:
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8951.htm>
- SII FAQ, consulta de estado y observaciones en "Consulta y seguimiento":
  <https://www.sii.cl/servicios_online/1044-2696.html>
- SII noticia Operacion Renta 2025 (autorizacion, pagos y compensaciones por
  TGR): <https://www.sii.cl/noticias/2025/150425noti01msf.htm>
- ChileAtiende, Operacion Renta (calendario de referencia y canales de pago):
  <https://www.chileatiende.gob.cl/fichas/3178-declaracion-de-renta>

## Fuentes oficiales — refetcheadas/reverificadas para este run (reencuadre temporal)

- SII FAQ, consulta de estado y observaciones / rectificatoria por Internet:
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8954.htm>
  — reverificada 2026-08-12 (misma fuente ya fetcheada el mismo dia para el
  run de `operacion-renta-f22-checklist`). Cita literal: "A partir de la
  segunda semana de junio del ano en curso. El contribuyente podra verificar
  el detalle de las observaciones a su declaracion y el motivo de la
  compensacion, si estas existieren, y podra rectificar por internet." No fija
  fecha de cierre — tramite abierto desde junio y vigente hoy (agosto 2026).
  Uso: fuente para la seccion nueva "declaraste y nunca te llego el deposito".
  No estaba citada en la version publicada de este articulo; se agrega porque
  sustenta directamente la nueva guia de accion.
- SII FAQ, rectificatoria que origina devolucion (autorizacion y pago via
  TGR):
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm>
  — reverificada 2026-08-12. Cita literal: "Los contribuyentes que efectuen
  rectificatorias a su Declaracion de Impuesto a la Renta, recibiran su
  devolucion correspondiente alrededor de tres semanas despues de que el
  Servicio de Impuestos Internos autorice los montos a la Tesoreria General de
  la Republica." Uso: plazo de pago tras rectificatoria, para el lector que
  declaro y nunca recibio deposito o que rectifica.

## AT2027 — verificacion de que NO existe calendario publicado aun

- WebSearch dirigida ("SII calendario Operacion Renta AT2027 fecha
  publicacion", 2026-08-12): ningun resultado oficial menciona un calendario
  AT2027 publicado; todos los resultados relevantes (SII, TGR, ChileAtiende,
  prensa) cubren exclusivamente AT2026 (calendario publicado 2026-03-31).
- Consistente con la verificacion ya realizada el mismo dia para el run de
  `operacion-renta-f22-checklist` (ver
  `artifacts/editorial/operacion-renta-f22-checklist/20260812-1312-lote0b/02-dossier.md`),
  que tampoco encontro fuente oficial con fecha AT2027.
- Patron historico observable: el comunicado de apertura de Operacion Renta se
  publica a fines de marzo del ano de declaracion (AT2026 se publico
  2026-03-31). No hay fuente oficial que fije la fecha exacta para AT2027; el
  articulo declara explicitamente que el SII "aun no publica el calendario
  AT2027", sin inventar una fecha.

## Ronda 2 — fuentes fetcheadas para remediar DEFECT #1 y #2 (compliance FAIL 8,75/10)

Contexto: `06-compliance.md` (sesion fresca, `06-compliance-fresh-20260812`) bloqueo el run
con dos defectos. DEFECT #1 (MAJOR): la afirmacion "aun puedes declarar fuera de plazo
en sii.cl -> Servicios online -> Renta" (`articleLead.answer` + cuerpo) no tenia fuente
citada. DEFECT #2 (menor, preexistente): la FAQ SII 001_140_8951 aparecia dos veces en
"Fuentes y referencias primarias" con una etiqueta ("causas de no recepcion / retenciones
/ datos bancarios") que su contenido real no respalda.

### DEFECT #1 — candidatos evaluados y decision

Se refetchearon en vivo (2026-08-13) los tres candidatos senalados en el brief de esta
sesion, sin confiar en la recomendacion literal de `06-compliance.md` (que sugeria
`001_140_2444.htm`):

- `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2444.htm` —
  **descartada**. Pregunta literal: "¿Que debe hacer un contribuyente que no declaro sus
  boletas de honorarios en Formulario 22 en rentas de los tres anos anteriores?". Es
  especifica de boletas de honorarios de los 3 anos anteriores — demasiado estrecha para
  la afirmacion general del articulo (que no trata de boletas de honorarios ni de anos
  anteriores especificamente).
- `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0595.htm` —
  **usada**. Cita literal: "Los contribuyentes que no han presentado Declaraciones de
  Renta de anos anteriores pueden regularizar su situacion y determinar los impuestos
  correspondientes, a traves de la seccion Servicios online, Declaracion de renta, opcion
  Declarar renta (F22), donde debera autenticarse." Coincide casi verbatim con la ruta de
  navegacion ya escrita en el articulo ("Servicios online -> Renta"), pero su texto se
  limita literalmente a "anos anteriores" — no a la ventana AT2026 en curso. Se cita para
  respaldar el **mecanismo/ruta**, no para afirmar que cubre explicitamente el ano en
  curso.
- `https://www.sii.cl/contribuyentes/p7renta.htm` — **usada**. Texto literal: "Si no
  declaro rentas y estaba obligado a hacerlo, sera citado a las unidades del SII" /
  recibira la anotacion "No declarante F22", que le impedira realizar algunos tramites
  importantes con el Servicio; instruye presentar la declaracion "a traves de Internet"
  usando la opcion "Declarar Renta (F22)". A diferencia de 001_140_0595, esta fuente usa
  lenguaje general de "no declarante" **sin restringirse a "anos anteriores"**, por lo que
  cubre mejor el caso general de quien no alcanzo a declarar (incluida, sin necesidad de
  forzar la lectura, la ventana en curso). Este mismo patron de refuerzo (0595 + p7renta)
  fue el que la compliance de ronda 2 del run hermano `operacion-renta-f22-checklist`
  identifico independientemente como la combinacion mas solida para esta misma
  afirmacion (ver `artifacts/editorial/operacion-renta-f22-checklist/20260812-1312-lote0b/06-compliance-round2.md`,
  DEFECT-NUEVO #1).

**Limitacion reconocida explicitamente:** ninguna de las dos fuentes usadas dice de forma
literal "esto aplica a declaraciones del ano en curso, no solo a anos anteriores". El
articulo remediado evita esa afirmacion explicita (no dice "incluida la del ano en
curso") y solo transcribe lo que las fuentes sí dicen: el mecanismo/ruta (0595) y la
aplicabilidad general condicionada a "si estabas obligado a declarar" (p7renta, que exige
esa condicion literalmente). No se importaron los porcentajes de multa (10%/2%/30%, 1
UTM-1 UTA) que usa el run hermano — esa cifra requeriria fetchear `001_140_3095.htm`, fuera
de alcance de este run (el dossier original ya declaraba el monto de multa como deferral
legitimo por NORMA §2.4 condicion 2, decision que se mantiene sin cambio).

### DEFECT #2 — fuente correcta encontrada

Refetch en vivo (2026-08-13) de `001_140_8951.htm` confirma lo que ya establecio
`06-compliance.md`: la pagina trata unicamente el calendario de fechas de devolucion por
tramo de presentacion; no contiene ninguna mencion a causas de no recepcion, retenciones
ni datos bancarios. Se busco una fuente real (WebSearch dirigida, 2026-08-13:
"SII preguntas frecuentes por que no me han pagado la devolucion de impuestos si mi
declaracion fue aceptada") y se encontro y confirmo por fetch:

- `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8366.htm` — pregunta
  literal: "¿Por que no he recibido mi devolucion de impuestos, si mi declaracion de renta
  fue aceptada?". Contenido confirmado por fetch verbatim (curl directo, no solo resumen
  de WebFetch): describe datos bancarios faltantes o erroneos, Cuenta RUT no activada, y
  una lista de retenciones (judiciales, previsionales, credito universitario, salud,
  mandatos) que explican por que una declaracion aceptada puede no generar deposito. Esta
  fuente sí respalda literalmente la etiqueta "causas de no recepcion pese a declaracion
  aceptada (retenciones y datos bancarios)". Reemplaza la entrada duplicada/mal etiquetada
  de 001_140_8951 en "Fuentes y referencias primarias".

### Discrepancia entre fuentes SII detectada durante la verificacion (fuera de alcance de este run — NO se modifica el articulo)

Al fetchear `001_140_8366.htm` para el punto anterior, su texto literal sobre el umbral de
$3.000.000 es el **inverso** del que ya esta en el cuerpo del articulo (linea ~86, cifra
verificada R5, fuera del alcance de este run de remediacion):

- Comunicado SII 31-03-2026 (`https://www.sii.cl/noticias/2026/310326noti01pcr.htm`, ya
  citado y verificado R5) — verbatim (confirmado por curl directo): "Si el monto de la
  devolucion es superior a $3 millones, el cheque se enviara al domicilio del
  contribuyente. Si es inferior a $3 millones, el cheque quedara disponible para pago en
  las cajas de BancoEstado." Esto coincide exactamente con la linea publicada del
  articulo: "Cheques sobre $3.000.000 se envian al domicilio... los de menor monto se
  retiran en BancoEstado."
- FAQ SII `001_140_8366.htm` (fuente nueva de este run, citada solo para su contenido
  sobre retenciones/datos bancarios) — verbatim (confirmado por curl directo): "Si el
  monto de la devolucion es menor a $3 millones, el cheque se enviara al domicilio del
  contribuyente. Si el monto de la devolucion es superior a $3 millones, el cheque
  quedara disponible para pago en las cajas de BancoEstado." Esto es lo **opuesto** al
  comunicado.

Dos fuentes oficiales del SII se contradicen entre si sobre el mismo dato (que cheques van
a domicilio vs. BancoEstado segun monto). Este run **no modifica la linea 86 del
articulo** porque: (a) esa cifra esta fuera del alcance declarado de esta remediacion (el
brief solo autoriza tocar DEFECT #1 y #2, no la tabla/parrafo de calendario ya verificado
R5), y (b) la fuente ya citada para esa linea (el comunicado) sigue siendo consistente con
lo publicado — no hay evidencia de que el comunicado este equivocado, solo de que la FAQ
8366 usa el criterio invertido (posiblemente un error de redaccion de esa FAQ especifica,
o una actualizacion no sincronizada entre paginas del SII). Se cita 8366 unicamente para
su contenido sobre causas de no recepcion/retenciones/datos bancarios, no para el umbral
de $3.000.000. **Queda como observacion abierta para el proximo ciclo de revision de
contenido o para que ComplianceAgent de ronda 2 la evalue**; no se resuelve en este run.

## Ronda 3 — investigación y resolución de discrepancia SII umbral $3.000.000

Contexto: `06-compliance-round2.md` (sesión fresca `06-compliance-round2`, sin
exposición al draft) bloqueó el run con **DEFECT-NUEVO #1 (MAYOR)** — dos
fuentes oficiales del SII se contradicen sobre el umbral de $3.000.000 que
determina si el cheque de devolución se envía al domicilio del contribuyente
o se retira en cajas de BancoEstado. Esa ronda no pudo dirimir cuál fuente es
correcta y recomendó un run de investigación dedicado (Bucket B) antes de la
firma humana. Esta sección documenta esa investigación, hecha en sesión
nueva de DraftAgent (fecha de corte 2026-08-13), sin confiar en el juicio de
ronda 2 ni en el de compliance ronda 2 — refetch propio de todo lo citado
abajo.

### Paso 1 — refetch completo de ambas fuentes en conflicto

**Comunicado SII, 31 de marzo de 2026**
(`https://www.sii.cl/noticias/2026/310326noti01pcr.htm`) — refetch propio vía
`curl` directo sobre el HTML crudo (no resumen de modelo), 2026-08-13.
Encabezado de la página: "Santiago, 31 de Marzo de 2026". Párrafo literal
completo, en el contexto de "Primera emisión solo devolución para personas
naturales":

> "Si el monto de la devolución es superior a $3 millones, el cheque se
> enviará al domicilio del contribuyente. Si es inferior a $3 millones, el
> cheque quedará disponible para pago en las cajas de BancoEstado."

**FAQ SII `001_140_8366.htm`**
(`https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8366.htm`)
— refetch propio vía `curl` directo, 2026-08-13. Metadatos exactos extraídos
del HTML crudo: `ID: 001.140.8366.009`, `Fecha de creación: 01/02/2023`,
`Fecha de actualización: 14/04/2026`. Párrafo literal completo:

> "Si el monto de la devolución es menor a $3 millones, el cheque se
> enviará al domicilio del contribuyente. Si el monto de la devolución es
> superior a $3 millones, el cheque quedará disponible para pago en las
> cajas de BancoEstado."

Confirmado: la contradicción es real, literal y exacta — invertida en ambos
sentidos de la regla (qué monto va a domicilio y qué monto se retira en
BancoEstado). No es error de transcripción de ninguna ronda anterior; ambos
textos vienen del HTML servido en vivo por sii.cl el 2026-08-13.

### Paso 2 — tercera fuente: TGR (tesorería que paga efectivamente)

Se investigó si tgr.cl publica el umbral de forma independiente, dado que es
la Tesorería (no el SII) quien materializa el pago:

- `WebSearch` dirigida a `tgr.cl`/`ayuda.tgr.cl` (2026-08-13): el motor de
  búsqueda devolvió un resumen que citaba `tgr.cl/2025/04/21/que-pasa-con-la-
  devolucion-de-impuestos-si-digito-mal-la-cuenta-del-banco/` con contenido
  aparentemente alineado con la dirección del comunicado. **Ese resumen no
  se pudo verificar**: el fetch directo de esa URL (tanto `WebFetch` como
  `curl` con user-agent de navegador) devuelve la página 404 propia de TGR
  ("Ups! Lo sentimos. La página que buscabas no existe") — el artículo fue
  dado de baja o movido. El subdominio `ayuda.tgr.cl` (donde vive el centro
  de ayuda de TGR con artículos como "¿Qué pasa si el depósito de devolución
  de renta sale rechazado?") no resuelve por DNS desde este entorno de
  ejecución (`curl`: "Could not resolve host"; `WebFetch`: `ENOTFOUND`), por
  lo que tampoco pudo confirmarse por fetch propio.
- **Conclusión sobre TGR: no encontrada como fuente verificable en esta
  sesión.** El resumen del buscador que coincidía con el comunicado se
  descarta como evidencia — no se pudo confirmar con fetch propio y no se le
  da ningún peso en la resolución de abajo, pese a que su dirección
  coincidía con la que finalmente se adoptó. Esto se documenta explícitamente
  para que quede claro que la resolución NO se apoya en esa fuente
  descartada.

### Paso 3 — fuente que sí permite dirimir: la página SII del mecanismo legal de pago por caja

Buscando una circular o instructivo formal del SII sobre "formas de pago de
devoluciones" (no solo FAQ/comunicado), se encontró y refetcheó vía `curl`
directo (2026-08-13):

`https://www.sii.cl/portales/renta/2016/pagodevimpxcaja.html` — "Pago de
devolución de impuesto a la renta por Caja Banco Estado". Página
institucional (no FAQ) que describe el mecanismo legal (Ley 20.780, que
modifica el artículo 97 de la Ley de la Renta) por el cual, cuando el
contribuyente no tiene cuenta bancaria válida informada, la devolución se
paga por vale vista o caja en banco. Cita literal completa (HTML crudo):

> "Requisitos para devolución pago por Caja en Banco: No indicar cuenta
> corriente, de ahorro a plazo a la vista o cuenta Rut. Tener una devolución
> igual o inferior a $3.000.000."
>
> "Lugares de cobro de devoluciones y montos: Sucursales Serviestado Hasta
> $1.500.000.- Sucursales BancoEstado Hasta $3.000.000.-"

**Advertencia sobre la vigencia de esta página, declarada explícitamente:**
la URL y el contenido están fechados para "Renta 2016" (AT2016) — es una
página de casi una década de antigüedad, sin fecha de actualización visible
para AT2026. **No se usa aquí como autoridad del ciclo vigente** (no se cita
en el blog file por esa misma razón: envejecería mal en una pieza YMYL), sino
únicamente como corroboración independiente de la estructura del mecanismo
de tope de pago por caja, con la misma cifra de $3.000.000 que usa el
comunicado AT2026 — coincidencia de cifra que sugiere que el tope es un
parámetro administrativo estable en el tiempo, no algo que cambie cada ciclo.

**Por qué esta página sí dirime, con evidencia mecánica y no solo con conteo
de fuentes:** describe un tope operativo real de pago en efectivo: las cajas
de BancoEstado **no pueden pagar más de $3.000.000** por esta vía (y
Serviestado, hasta $1.500.000). Bajo la lectura de la FAQ 8366 ("superior a
$3 millones → cheque disponible en cajas de BancoEstado"), se estaría
pidiendo a una caja pagar un monto que excede su propio tope — mecánicamente
imposible contra el límite documentado. Bajo la lectura del comunicado
("inferior a $3 millones → caja BancoEstado; superior → cheque a
domicilio"), el monto que va a caja siempre está dentro del tope de
$3.000.000, y el monto que excede el tope se resuelve por la vía alternativa
(cheque enviado al domicilio) — internamente coherente con el propio tope
que el SII documenta. Solo una de las dos direcciones es compatible con el
mecanismo de pago que el propio SII describe; la otra es operativamente
inconsistente.

### Paso 4 — fechas de actualización comparadas

- Comunicado 31-03-2026: fecha de publicación única (nota de prensa fechada
  para el ciclo AT2026, sin campo de "actualización" separado — es un
  artículo de noticia, no una FAQ).
- FAQ `001_140_8366.htm`: `Fecha de creación: 01/02/2023`, `Fecha de
  actualización: 14/04/2026`. El contenido original del FAQ es de tres años
  antes de este ciclo; el sello de "actualización" de abril 2026 no permite
  saber, por sí solo, si esa actualización incluyó una revisión de contenido
  de este párrafo específico o fue un republicado administrativo sin cambio
  de texto — **esto se deja como observación, no como evidencia de peso**;
  no se usa para dirimir la dirección del umbral, solo para contextualizar
  que la FAQ predata el ciclo AT2026 mientras el comunicado fue redactado
  específicamente para él.
- La comparación de fechas por sí sola **no dirime** (ambas páginas llevan
  sello 2026). Lo que sí dirime es el argumento mecánico del Paso 3.

### Resolución

**Dirimida a favor del comunicado SII 31-03-2026** ("superior a $3 millones
→ domicilio; inferior → BancoEstado"), que es exactamente lo que ya está
publicado en el cuerpo del artículo (línea del calendario AT2026, cifra R5).
**No se modifica ninguna cifra ni dirección en el artículo** — el texto
publicado ya era correcto. La corrección aplicada es de citación, no de
contenido: se limitó explícitamente el alcance de la cita a
`001_140_8366.htm` en "Fuentes y referencias primarias" (y se documentó en
"Información de vigencia") para que quede claro que esa fuente se usa
únicamente por su contenido sobre retenciones/datos bancarios (ya verificado
en ronda 2), no como respaldo del umbral — dado que en esa dimensión
específica esa misma página contiene un error verificado.

**Hallazgo interno para el SII (no se publica en el blog):** la FAQ
`001_140_8366.htm` del propio SII contiene, a la fecha de esta verificación
(2026-08-13), una inversión del criterio de umbral de $3.000.000 respecto de
su propio comunicado oficial de apertura de la Operación Renta AT2026 y
respecto del mecanismo de tope de pago por caja que el SII documenta en
`pagodevimpxcaja.html`. Es una inconsistencia real dentro del propio sitio
del SII que el Servicio debería corregir en su FAQ; no corresponde a
Monedario declararlo públicamente ni enlazar la contradicción, solo
registrarlo como observación verificada para no propagar el error.

### `updatedDate` / `validAsOf` / "Revisado el" — no se mueven

`06-compliance-round2.md` §4bis condicionó explícitamente el movimiento de
estas fechas a que la investigación de Bucket B terminara **corrigiendo** el
umbral. Esta ronda 3 lo **confirma** (no lo corrige): la cifra y dirección
publicadas ya eran correctas, y el único cambio es una nota de alcance en la
citación de una fuente que no altera ningún dato mostrado al lector. Por lo
tanto no aplica el disparador de NORMA §5.1 "corrección de error importante"
y se mantiene el mismo patrón que ronda 2: la investigación queda registrada
como bullet en "Información de vigencia" (fechado 13 de agosto de 2026) sin
mover `updatedDate` (`2026-08-12T00:00:00Z`), `articleLead.validAsOf`
(`2026-08-12`) ni "Revisado el" (`2026-08-12`) en el cuerpo. El punto §4bis
que ronda 2 dejó abierto sobre si la corrección de ronda 2 (DEFECT #1) debía
mover esas fechas **sigue abierto**; esta ronda no lo cierra porque no le
corresponde (es un tema distinto, ya señalado por compliance ronda 2 como
ambiguo y sin resolver unilateralmente).

## Decisiones editoriales

- La pieza permanece PERENNE. Sigue siendo `topicRole: owner` de
  `canonicalTopic: devolucion-impuestos`.
- El calendario AT2026 se mantiene integro en el cuerpo como referencia
  fechada explicita, con nota de cierre, no como instruccion vigente.
- Ninguna cifra verificada por R5 se modifica; solo se reencuadra su marco
  temporal.
- Los deferrals legitimos existentes ("revisa en SII/TGR" para datos de
  cuenta individual, R4 PASS/N-A) se conservan sin cambio de contenido.
- No se introduce ninguna cifra nueva de multas/intereses por declaracion
  fuera de plazo para quien no alcanzo a declarar: seria expansion sustantiva
  fuera de alcance (ademas el monto depende de si hay pago o devolucion y de
  elegibilidad de condonacion — caso por caso). Se deriva a sii.cl sin cifra,
  deferral legitimo por NORMA §2.4 condicion 2, igual que en
  `operacion-renta-f22-checklist`.
