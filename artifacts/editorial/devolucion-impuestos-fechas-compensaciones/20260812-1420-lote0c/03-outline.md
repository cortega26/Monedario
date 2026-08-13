# Outline — devolucion-impuestos-fechas-compensaciones (remediacion Fase B)

## Respuesta ancla (articleLead.answer)

El ciclo AT2026 ya cerro: el calendario de deposito fue 29 de abril, 15 de
mayo o 27 de mayo de 2026 segun cuando declaraste, y los cheques se emitieron
el 29 de mayo. Si declaraste dentro de esa ventana y nunca te llego el
deposito, revisa el estado de tu declaracion y una eventual
retencion/compensacion en "Consulta y seguimiento" de sii.cl; si la causa es
un error o una observacion, corrige con una rectificatoria. Si no alcanzaste
a declarar dentro de AT2026, aun puedes hacerlo fuera de plazo en sii.cl. El
proximo ciclo, AT2027, todavia no tiene calendario publicado por el SII.
Vigencia: revision 2026-08-12. Fuentes: SII (comunicado AT2026, FAQ
consulta/rectificatoria).

## Linea de diferenciacion visible (reencuadre, no adaptacion competitiva)

Este run no es una adaptacion competitiva (no hay benchmark), por lo que no
aplica `localDelta` de diferenciacion frente a terceros. La diferenciacion es
frente a la version anterior del propio articulo: pasa de presentar el ciclo
AT2026 como vigente (falso desde el 29 de mayo de 2026) a declarar
explicitamente su cierre en la primera pantalla, sin perder el calendario
como referencia. Mismo patron aplicado a `operacion-renta-f22-checklist` en
este mismo lote.

## Secciones (cambios respecto de la version publicada)

1. **Intro (reemplazada).** El parrafo de apertura actual asume al lector
   dentro del ciclo vigente ("la fecha paso... ¿cuando depositan?"). Se
   reemplaza por un parrafo que declara el estado del ciclo primero y
   mantiene la pregunta que motiva la busqueda.
2. **"Qué hacer ahora (3 pasos)" -> renombrada y reencuadrada como bloque de
   estado + accion.** Se conserva el contenido de los 3 pasos (son
   atemporales: revisar SII, revisar TGR, validar cuenta), pero se antepone
   la declaracion de cierre del ciclo AT2026 y se separan explicitamente los
   dos casos que pide el brief: (a) declaraste y nunca te llego el deposito,
   (b) no alcanzaste a declarar dentro de AT2026. Se agrega el caso (c)
   cuando abre AT2027, sin inventar fecha.
3. **"Fechas de referencia y ventanas de pago" -> se agrega nota de cierre.**
   La tabla se conserva integra (dato verificado R5), pero se antepone una
   frase que la marca como calendario ya ejecutado del ciclo AT2026, no como
   fecha futura. Frase final existente ("Usa siempre el calendario oficial
   que publique SII/TGR para el año tributario vigente...") se mantiene: ya
   apuntaba correctamente a que el lector confirme vigencia, se refuerza con
   la nota de cierre.
4. **"Si te pasa X, haz Y" — sin cambio de contenido.** Los deferrals
   legitimos existentes (SII/TGR para datos de cuenta individual) se
   conservan tal cual (R4 PASS/N-A).
5. **"Errores que retrasan el pago" — sin cambio.** Contenido atemporal.
6. **"Preguntas frecuentes" — sin cambio de contenido.** Ya son atemporales
   (no asumen un ciclo especifico vigente).
7. **"Fuentes y referencias primarias" — se agrega 1 fuente nueva** (FAQ SII
   001_140_8954, consulta de estado/rectificatoria) que sustenta la nueva
   guia de accion para quien declaro y no recibio deposito.
8. **"Información de vigencia" (footer) — se actualiza** la fecha de
   revision a 2026-08-12 con la razon del cambio (NORMA §5.3).
9. **Frontmatter — se agrega `articleLead`** (ausente en la version
   publicada) siguiendo el esquema de `src/content.config.ts` y la forma de
   `operacion-renta-f22-checklist.md`.

## Elementos que NO cambian

- Slug, title, seoTitle, H1, rutas, canonical.
- Cifras R5 (calendario de deposito/cheque AT2026: 29 abril, 15 mayo, 27
  mayo, cheques 29 mayo, umbral $3.000.000).
- Deferrals legitimos existentes hacia SII/TGR para consulta de cuenta
  individual (R4 PASS/N-A).
- Estructura de encabezados existente (no se reordena; el renombre de la
  seccion 2 conserva su posicion).
