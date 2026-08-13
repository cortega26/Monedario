# Draft — devolucion-impuestos-fechas-compensaciones (remediacion Fase B, lote 0)

Fecha de corte de este draft: **2026-08-12**.

## Respuesta rapida (regla general)

El ciclo AT2026 ya cerro: el calendario de deposito fue 29 de abril, 15 de
mayo o 27 de mayo de 2026 segun cuando declaraste, y los cheques se emitieron
el 29 de mayo. Si declaraste dentro de esa ventana y nunca te llego el
deposito, revisa el estado de tu declaracion y una eventual
retencion/compensacion en "Consulta y seguimiento" de sii.cl; si la causa es
un error o una observacion, corrige con una rectificatoria. Si no alcanzaste
a declarar dentro de AT2026, aun puedes hacerlo fuera de plazo en sii.cl. El
proximo ciclo, AT2027, todavia no tiene calendario publicado por el SII.

- **Excepcion/variante:** una rectificatoria con devolucion se paga
  aproximadamente tres semanas despues de que el SII autoriza el monto a TGR
  (no es instantanea).
- **Vigencia:** revision 2026-08-12.
- **Fuentes:** SII, comunicado 31-03-2026 (calendario AT2026); SII FAQ
  001_140_8954 (consulta de estado / rectificatoria).

Este texto es la base de `articleLead.answer` en el frontmatter del blog
file.

## Cambios aplicados al blog file (diff conceptual)

1. **Frontmatter — `updatedDate`:** `2026-05-11T00:00:00Z` ->
   `2026-08-12T00:00:00Z`.
2. **Frontmatter — `articleLead` (nuevo bloque, no existia):** `answer`
   (arriba), `validAsOf: 2026-08-12`, dos `officialSources` (comunicado
   AT2026 + FAQ consulta/rectificatoria), `covers` (3 items), `limits` (2
   items), `calculatorHref`/`calculatorLabel` apuntando al simulador
   Operacion Renta, `nextStepHref`/`nextStepLabel` apuntando al post F22 ya
   remediado.
3. **Cuerpo — parrafo de apertura (reemplazado):** el parrafo original
   ("Ya enviaste tu declaracion... la fecha paso... ¿cuando depositan?")
   asumia al lector dentro de un ciclo vigente. Se reemplaza por un parrafo
   que declara primero el estado del ciclo ("El ciclo AT2026 ya cerro...")
   y mantiene la pregunta que motiva la busqueda, ahora respondida en
   contexto.
4. **Cuerpo — `## Qué hacer ahora (3 pasos)` renombrada a `## Ciclo AT2026
   cerrado: qué hacer hoy`.** Se conserva integro el contenido de los 3 pasos
   originales (revisar SII, revisar TGR, validar cuenta) y la lista "Datos
   minimos", pero se antepone la declaracion de cierre del ciclo y se
   divide explicitamente en los casos que pide el brief:
   - Declaraste dentro de AT2026 y nunca te llego el deposito (los 3 pasos
     originales + datos minimos + nota de rectificatoria con plazo TGR,
     fuente FAQ 001_140_0516 ya citada en el articulo original).
   - No alcanzaste a declarar dentro de AT2026 (deferral legitimo: aun puedes
     declarar fuera de plazo en sii.cl; monto de multa/interes depende del
     caso — no se inventa cifra).
   - Proximo ciclo AT2027 (SII aun no publica calendario; se cita el patron
     historico de publicacion a fines de marzo, sin inventar fecha).
   Los enlaces a F22 checklist y al simulador se conservan.
5. **Cuerpo — encabezado y frase inicial de `## Fechas de referencia y
   ventanas de pago`:** encabezado ampliado a "(calendario del ciclo AT2026,
   ya ejecutado)" y se antepone una frase que marca la tabla como calendario
   ya ejecutado, no como fecha futura. La tabla en si (fechas de deposito y
   cheque) no se modifico — cifra verificada R5, se conserva igual. La frase
   final ("Usa siempre el calendario oficial que publique SII/TGR para el
   año tributario vigente...") se conserva sin cambio.
6. **Cuerpo — `## Si te pasa X, haz Y` y `## Errores que retrasan el pago`:**
   sin cambio de contenido. Los deferrals legitimos existentes hacia SII/TGR
   para datos de cuenta individual se conservan (R4 PASS/N-A).
7. **Cuerpo — `## Preguntas frecuentes (rápidas)`:** sin cambio de
   contenido; ya son atemporales.
8. **Cuerpo — `## Fuentes y referencias primarias`:** se agrega una fuente
   nueva (SII FAQ 001_140_8954, consulta de estado/rectificatoria) que
   sustenta la nueva guia de accion.
9. **Cuerpo — `## Información de vigencia`:** `Revisado el` actualizado a
   2026-08-12 con nota de que cambio y por que (alineado a NORMA §5.3); se
   deja explicito que el calendario AT2026 no cambio de valor, solo de
   encuadre. Segunda bala ampliada para incluir "el SII publique el
   calendario AT2027".

## Elementos NO tocados (confirmacion)

- `title`, `seoTitle`, `slug`, H1 (frontmatter.title), rutas, canonical: sin
  cambios.
- Cifras verificadas R5: calendario de deposito 29 abril / 15 mayo / 27 mayo,
  cheques 29 mayo, umbral $3.000.000: sin cambios de valor, solo
  reencuadradas como dato del ciclo AT2026 ya cerrado.
- Deferrals legitimos existentes (R4 PASS/N-A): "revisa en SII / revisa en
  TGR" para datos de cuenta individual — sin cambio de contenido.
- Resto de secciones (`Si te pasa X, haz Y`, `Errores que retrasan el pago`,
  `Preguntas frecuentes`): sin cambios de contenido.
- Los otros articulos del corpus, incluido `operacion-renta-f22-checklist`
  (ya remediado en run previo): no tocados en este run.

## VERIFIED carry-forward (no aplica math-audit previo)

No existe `05-math-audit.md` previo para este run porque `requires_calculation
= false` (ver `01-brief.yaml`) — el reencuadre no introduce ni modifica
ninguna cifra calculada. Las cifras que se conservan (R5) ya estaban en el
articulo publicado y provienen de la ficha de auditoria, no de un math audit
de este pipeline.

## TODO:SOURCE (si los hay)

Ninguno. Todas las afirmaciones nuevas o reencuadradas citan una fuente ya
verificada (ver `02-dossier.md`).

## Ronda 2 — remediacion DEFECT #1-2 (compliance FAIL 8,75/10)

Fecha de corte de esta remediacion: **2026-08-13**. Sesion nueva de
DraftAgent, sin exposicion al draft original de ronda 1 ni a la sesion de
`06-compliance.md`. Contexto y decisiones completas en `02-dossier.md`
(seccion "Ronda 2 — fuentes fetcheadas para remediar DEFECT #1 y #2").

1. **DEFECT #1 (MAJOR) resuelto — afirmacion procedural sin fuente.**
   `articleLead.answer` y el cuerpo (seccion "Si no alcanzaste a declarar
   dentro de AT2026") afirmaban "aun puedes declarar fuera de plazo en
   sii.cl -> Servicios online -> Renta" sin cita. Se refetchearon en vivo
   (2026-08-13) los tres candidatos senalados por el brief: `001_140_2444`
   (descartada, especifica de boletas de honorarios de 3 anos anteriores),
   `001_140_0595` (usada, mecanismo/ruta "Servicios online -> Declaracion de
   renta -> Declarar renta (F22)", pero limitada literalmente a "anos
   anteriores") y `p7renta.htm` (usada, aplicabilidad general sin esa
   restriccion, mismo patron que valido independientemente la compliance
   ronda 2 del run hermano `operacion-renta-f22-checklist`). Se agregaron
   ambas a `articleLead.officialSources` y a "Fuentes y referencias
   primarias". El cuerpo se reformulo para: (a) condicionar la frase a "si
   estabas obligado a declarar" (asi lo exige literalmente `p7renta.htm`),
   (b) usar el verbo permisivo "aun puedes regularizar" (no "debes"; asi lo
   dice `001_140_0595`, "pueden regularizar"), (c) no afirmar explicitamente
   que el mecanismo cubre "el ano en curso" — ninguna fuente lo dice de
   forma literal, y forzar esa lectura habria reproducido el mismo problema
   de inferencia no trivial que la compliance de ronda 2 senalo en el run
   hermano (DEFECT-NUEVO #1) — y (d) no importar los porcentajes de multa
   del run hermano (requeririan fetchear `001_140_3095.htm`, fuera de
   alcance; el deferral del monto de multa/interes, ya justificado por
   NORMA §2.4 condicion 2, se mantiene sin cambio).

2. **DEFECT #2 (menor, preexistente) resuelto — cita duplicada mal
   etiquetada.** La FAQ `001_140_8951` aparecia dos veces en "Fuentes y
   referencias primarias": una vez correctamente (fechas de devolucion) y
   otra con una etiqueta ("causas de no recepcion / retenciones / datos
   bancarios") que su contenido real no respalda (confirmado por refetch,
   consistente con lo que ya establecio `06-compliance.md`). Se busco y
   confirmo por fetch una fuente real que sí trata ese tema —
   `001_140_8366.htm`, "¿Por que no he recibido mi devolucion de impuestos,
   si mi declaracion de renta fue aceptada?" (datos bancarios/Cuenta RUT
   erroneos, y lista de retenciones judiciales/previsionales/credito
   universitario/salud) — y se reemplazo la entrada incorrecta por esta URL
   correcta. No se elimino la afirmacion; se corrigio la cita.

3. **Observacion fuera de alcance detectada durante la verificacion (NO
   resuelta en este run):** al fetchear `001_140_8366.htm` se encontro que
   su texto sobre el umbral de $3.000.000 (que cheques van a domicilio vs.
   BancoEstado) es el inverso del que ya esta publicado en el cuerpo del
   articulo (linea del calendario AT2026, cifra R5, verificada contra el
   comunicado SII del 31-03-2026, que sí coincide con lo publicado). Es una
   discrepancia entre dos fuentes oficiales del SII, no un error introducido
   por este run. No se modifico la linea del calendario (fuera del alcance
   declarado de esta remediacion). Documentado en `02-dossier.md` como
   observacion abierta para el proximo ciclo de revision o para
   ComplianceAgent de ronda 2.

4. **Elementos NO tocados en esta ronda:** el reencuadre de vigencia del
   ciclo AT2026 (primera pantalla), el calendario de fechas AT2026 en sí
   (incluida la linea del umbral $3.000.000, ver punto 3), slug/title/
   seoTitle/H1/canonical, `updatedDate` (se mantiene en
   `2026-08-12T00:00:00Z`) y `articleLead.validAsOf` (se mantiene en
   `2026-08-12`) — la correccion se documenta como bullet adicional en
   "Informacion de vigencia" del blog file, siguiendo el mismo patron que
   uso el run hermano para su propia ronda 2.

## Ronda 3 — investigacion y resolucion de discrepancia SII umbral $3.000.000

Fecha de corte de esta remediacion: **2026-08-13**. Sesion nueva de
DraftAgent. Origen: `06-compliance-round2.md`, DEFECT-NUEVO #1 (MAYOR) —
contradiccion entre el comunicado SII 31-03-2026 y la FAQ `001_140_8366.htm`
sobre el umbral de $3.000.000 (domicilio vs. BancoEstado), Bucket B
(investigacion dedicada antes de firma humana). Investigacion completa,
citas literales de ambas fuentes en conflicto, tercera fuente investigada
(TGR, no verificable) y fuente que dirime (pagina SII del mecanismo legal de
pago por caja, `pagodevimpxcaja.html`) en `02-dossier.md`, seccion "Ronda 3".

**Resolucion: dirimida a favor del comunicado SII 31-03-2026** ("superior a
$3 millones -> domicilio; inferior -> BancoEstado"). El texto publicado en
el cuerpo del articulo (linea del calendario AT2026, cifra R5) **ya era
correcto y no se modifico**. El argumento que dirime no es conteo de
fuentes: la pagina `pagodevimpxcaja.html` documenta un tope operativo real
de pago en caja BancoEstado ($3.000.000); bajo la lectura de la FAQ 8366
("superior a $3M -> caja BancoEstado") se le pediria a una caja pagar mas
de su propio tope, mecanicamente imposible; bajo la lectura del comunicado,
el monto que va a caja siempre esta dentro del tope y el excedente se paga
por la via alternativa (cheque a domicilio) — coherente con el mecanismo que
el propio SII describe.

**Cambio aplicado al blog file (solo citacion, no contenido):**

1. "Fuentes y referencias primarias" — la entrada de `001_140_8366.htm` se
   amplio con una nota de alcance explicita: se cita solo por su contenido
   sobre retenciones/datos bancarios (ya verificado en ronda 2), no como
   fuente del umbral de $3.000.000 (esa pagina especifica contiene un error
   verificado en esa dimension).
2. "Informacion de vigencia" — se agrego un bullet nuevo, fechado 13 de
   agosto de 2026, documentando la investigacion, su resolucion y el hecho
   de que ninguna cifra del calendario se modifico.

**No se toco:** el parrafo del calendario AT2026 con el umbral (linea R5,
sin cambio de valor ni de direccion), `updatedDate` (`2026-08-12T00:00:00Z`),
`articleLead.validAsOf` (`2026-08-12`), "Revisado el" en el cuerpo
(`2026-08-12`) — la investigacion confirmo el dato existente, no lo
corrigio, por lo que no aplica el disparador de NORMA §5.1 de "correccion de
error importante". Tampoco se toco `06-compliance.md` ni
`06-compliance-round2.md` (registro historico preservado), ni el resto del
articulo, ni ningun otro articulo del corpus.

**Hallazgo interno (no publicado en el blog):** la FAQ SII `001_140_8366.htm`
contiene, a la fecha de esta verificacion, una inversion del criterio de
umbral respecto de su propio comunicado AT2026 y del mecanismo de tope de
pago por caja documentado en `pagodevimpxcaja.html`. Se registra como
observacion verificada para que el SII pueda corregir su propia FAQ; no se
declara en el articulo publico.

**TGR investigada, no verificable:** un resumen de busqueda que citaba un
articulo de tgr.cl aparentemente alineado con el comunicado no pudo
confirmarse — el fetch directo de esa URL devuelve 404 y el subdominio
`ayuda.tgr.cl` no resuelve por DNS desde este entorno. Se descarta como
evidencia; no se le da ningun peso en la resolucion (ver detalle completo en
`02-dossier.md`).
