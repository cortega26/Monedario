# Draft — operacion-renta-f22-checklist (remediacion Fase B, lote 0)

Fecha de corte de este draft: **2026-08-12**.

## Respuesta rapida (regla general) — actualizada en ronda 2 (2026-08-12)

La Operacion Renta AT2026 ya cerro: el plazo con pago vencio el 30 de abril de
2026 y el plazo sin pago (con devolucion), el 8 de mayo de 2026. Si ya
declaraste, revisa observaciones o rectifica en "Consulta y seguimiento" de
sii.cl. Si no alcanzaste a declarar, igual debes hacerlo: el SII habilita
"Declarar renta (F22)" en Servicios online para regularizar declaraciones no
presentadas, y la presentacion fuera de plazo genera multa e interes. El
proximo ciclo, AT2027, todavia no tiene calendario publicado por el SII.

- **Excepcion/variante:** la rectificatoria con devolucion se paga ~3 semanas
  despues de que el SII autoriza el monto a TGR (no es instantanea). El monto
  exacto de multa/interes y la elegibilidad de condonacion (Formulario 2667)
  dependen del caso — deferral legitimo, NORMA §2.4 condicion 2.
- **Vigencia:** revision 2026-08-12.
- **Fuentes:** SII, comunicado 31-03-2026 (calendario AT2026); SII FAQ
  001_140_8954 (consulta de estado / rectificatoria); SII FAQ 001_140_0516
  (rectificatoria que origina devolucion); SII FAQ 001_140_0595
  (regularizacion de declaraciones no presentadas — fuente nueva, ronda 2);
  SII FAQ 001_140_3095 (multas por declaracion fuera de plazo — fuente nueva,
  ronda 2).

Este texto (version ronda 2) es la base de `articleLead.answer` en el
frontmatter del blog file. La version ronda 1 de este texto contenia la
frase "no puedes usar el flujo normal AT2026", que contradecia el cuerpo del
articulo (DEFECT #1 del compliance report) y no estaba respaldada por fuente
(DEFECT #2). Ver seccion "Ronda 2" abajo.

## Cambios aplicados al blog file (diff conceptual)

1. **Frontmatter — `updatedDate`:** `2026-05-11T00:00:00Z` →
   `2026-08-12T00:00:00Z`.
2. **Frontmatter — `articleLead` (nuevo bloque, no existia):** `answer`
   (arriba), `validAsOf: 2026-08-12`, dos `officialSources` (comunicado AT2026
   + FAQ consulta/rectificatoria), `covers` (3 items), `limits` (2 items),
   `calculatorHref`/`calculatorLabel` apuntando al simulador Operacion Renta,
   `nextStepHref`/`nextStepLabel` apuntando al post de devolucion de
   impuestos.
3. **Cuerpo — parrafo de apertura (2do parrafo, antes en presente
   indicativo):** reemplazado por un bloque que declara explicitamente
   "**Estado del ciclo AT2026... ya cerro**" en la primera pantalla, conserva
   las mismas fechas (1 abril - 8 mayo; con pago 8-30 abril; sin pago hasta 8
   mayo) como referencia fechada explicita ("quedan como referencia de como
   funciono el ciclo, no como plazo vigente hoy"), y remite a la nueva
   seccion.
4. **Cuerpo — nueva seccion `## Fuera de la ventana AT2026: qué puedes hacer
   hoy`** (insertada despues del bloque de apertura, antes de "¿Tienes que
   declarar o solo aceptar la propuesta?"). Cubre, en este orden: declaracion
   observada (con tramite y fuente), consulta de estado de devolucion (link
   interno existente), rectificatoria (con nota de plazo de pago via TGR),
   que hacer si no se alcanzo a declarar (version ronda 1: deferral
   legitimo, sin cifra de multa — ver justificacion en 02-dossier.md), y
   cuando abre AT2027 (sin fecha inventada, con la fuente de que aun no
   esta publicado). **Actualizado en ronda 2:** el bullet de "no alcanzaste
   a declarar" ahora cita los porcentajes de multa publicados por el SII
   (10% / +2% por mes / tope 30% para declaraciones con pago; 1 UTM a 1 UTA
   para declaraciones con devolucion o sin pago) en vez del deferral total
   de ronda 1; el deferral se limita al monto exacto del lector y a la
   elegibilidad de condonacion. Ver seccion "Ronda 2" mas abajo.
5. **Cuerpo — encabezado y frase inicial de `### Cuándo llega la devolución`:**
   encabezado ampliado a "(calendario del ciclo AT2026, ya ejecutado)" y frase
   inicial reemplazada para marcar la tabla como referencia de un ciclo
   cerrado, no como fecha futura. La tabla en si (fechas de deposito y
   cheque) no se modifico — cifra verificada R5, se conserva igual.
6. **Cuerpo — `## Información de vigencia`:** `Revisado el` actualizado a
   2026-08-12 con nota de que cambio y por que (alineado a NORMA §5.3); se
   deja explicito que las cifras de credito por educacion, calendario de
   deposito y Prestamo Solidario COVID-19 no cambiaron. Segunda bala
   (`Puede quedar desactualizado cuando`) ampliada para incluir "el SII
   publique el calendario AT2027".

## Elementos NO tocados (confirmacion)

- `title`, `seoTitle`, `slug`, H1 (frontmatter.title), rutas, canonical: sin
  cambios.
- Cifras verificadas R5: $174.803 credito educacion, calendario de deposito
  29/15/27 (deposito) y 29 (cheques), Prestamo Solidario 30%/tope 5%: sin
  cambios de valor, solo reencuadradas como dato del ciclo AT2026.
- Resto de secciones (`¿Tienes que declarar...`, `¿Te van a devolver...`,
  `Qué hacer ahora`, `Escenarios frecuentes`, `Errores que más atrasan`,
  `Preguntas frecuentes`, `Fuentes y referencias primarias`): sin cambios de
  contenido.
- Los otros 3 articulos del lote 0: no tocados en este run.

## VERIFIED carry-forward (no aplica math-audit previo)

No existe `05-math-audit.md` previo para este run porque `requires_calculation
= false` (ver `01-brief.yaml`) — el reencuadre no introduce ni modifica
ninguna cifra calculada. No hay items `VERIFIED` que trasladar desde un math
audit; las cifras que se conservan (R5) ya estaban en el articulo publicado y
provienen de la ficha de auditoria, no de un math audit de este pipeline.

## TODO:SOURCE (si los hay)

Ninguno de estos bloquea el blog file (ninguna afirmacion publicada depende
de un fetch no resuelto). Se documenta aqui, ademas de en `02-dossier.md`,
por consistencia con NORMA §2.4 (el marcador debe aparecer en el artifact
04-draft.md):

```
TODO:SOURCE: https://www.sii.cl/destacados/renta/2026/personas/ — fetch result:
pagina SPA (SvelteKit) sin markup con texto util, tanto via WebFetch como via
`scrapling extract get --impersonate chrome`. No se pudo confirmar ni
desmentir nada desde esta URL. No bloquea el reencuadre porque el estado de
cierre de ventana AT2026 ya esta confirmado por el comunicado del 31-03-2026
mas la fecha de hoy (2026-08-12).
```

Todas las afirmaciones nuevas o reencuadradas del blog file citan una fuente
fetcheada y confirmada (ver `02-dossier.md`).

## Ronda 2 — remediacion de DEFECT #1, #2, #3 (compliance FAIL 6,05/10)

`06-compliance.md` (ComplianceAgent, sesion fresca adversarial) encontro tres
defectos bloqueantes en la seccion "Fuera de la ventana AT2026: que puedes
hacer hoy" creada por la ronda 1 de este mismo run:

- **DEFECT #1 (contradiccion interna):** `articleLead.answer` decia "no
  puedes usar el flujo normal de Operacion Renta AT2026" mientras el cuerpo
  decia "igual puedes hacerlo, fuera de plazo, en sii.cl -> Servicios online
  -> Renta". Investigacion con fuentes SII en vivo (ver `02-dossier.md`,
  seccion "Fuentes oficiales — refetcheadas para ronda 2") confirmo que el
  cuerpo tenia razon en el fondo: SII FAQ 001_140_0595 confirma literalmente
  que "los contribuyentes que no han presentado Declaraciones de Renta de
  años anteriores pueden regularizar su situacion... a traves de la seccion
  Servicios online, Declaracion de renta, opcion Declarar renta (F22)". Se
  corrigio `articleLead.answer` para que diga lo mismo que el cuerpo, ambos
  ahora citando esta fuente.
- **DEFECT #2 (afirmacion procedural sin fuente):** resuelto con la misma
  fuente (FAQ 001_140_0595) para el mecanismo, mas FAQ 001_140_3095 para los
  porcentajes de multa (10% hasta 5 meses de atraso + 2%/mes adicional,
  tope 30%, para declaraciones con pago; 1 UTM a 1 UTA para declaraciones
  con devolucion o sin pago). El interes penal se menciona sin calificarlo
  de "mensual" ni citar el numero exacto: la fuente reporta una tasa diaria
  fechada al segundo semestre de 2025, no verificada como vigente a agosto
  de 2026 (ver nota de auto-revision en `02-dossier.md`). El monto exacto
  para el lector y la elegibilidad de condonacion (Formulario 2667) se
  mantienen como deferral legitimo (NORMA §2.4 condicion 2 — caso por
  caso). Nota adicional de auto-revision: la fuente 0595 dice literalmente
  "años anteriores", no "AT2026"; `02-dossier.md` documenta la cadena de
  tres fuentes (0504 + 0595 + 3095) que sostiene la aplicacion a AT2026 en
  curso, para que una re-revision adversarial no la encuentre como cita
  fuera de alcance.
- **DEFECT #3 ("sigue abierto" sin fuente):** no se encontro una fuente que
  confirme explicitamente la ausencia de fecha de cierre del tramite de
  consulta/rectificatoria (FAQ 001_140_8954 solo confirma apertura). Se
  reformulo la frase para no inferir de la ausencia de fecha de cierre: la
  fecha de apertura (segunda semana de junio, despues del cierre de la
  ventana abril-mayo) es lo que sostiene "no depende de esa ventana"; la
  ausencia de fecha de cierre solo sostiene el llamado a confirmar en
  sii.cl, no una afirmacion de vigencia permanente. La frase final remite a
  confirmar en sii.cl.
- **DEFECT #4 (Bucket C, resuelto en esta sesion):** la frase sobre AT2027
  ("suele publicarse a fines de marzo") se reformulo para calificarla como
  observacion de un unico precedente (AT2026), sin generalizar un patron de
  varios años.
- **DEFECT #5 (Bucket C, resuelto en esta sesion):** el marcador
  `TODO:SOURCE` para el fetch fallido de
  `sii.cl/destacados/renta/2026/personas/` se duplico en este archivo (ver
  seccion arriba), ademas de en `02-dossier.md`, por consistencia literal
  con NORMA §2.4.

Archivos actualizados en esta ronda: `src/data/blog/operacion-renta-f22-checklist.md`
(articleLead + 3 bullets del cuerpo + fuentes + nota de vigencia),
`02-dossier.md` (fuentes nuevas + actualizacion de decision editorial),
`04-draft.md` (este archivo), `07-publish-packet.md` (nota de ronda 2 al
final, ningun gate marcado).

No se genera `06-compliance-round2.md` en esta sesion (le corresponde a
ComplianceAgent en sesion fresca). No se marca ningun gate en
`07-publish-packet.md`. No se edito `06-compliance.md` (se preserva como
registro historico del veredicto FAIL de ronda 1).
