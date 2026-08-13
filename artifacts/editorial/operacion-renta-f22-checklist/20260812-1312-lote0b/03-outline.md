# Outline — operacion-renta-f22-checklist (remediacion Fase B)

## Respuesta ancla (articleLead.answer)

La Operacion Renta AT2026 ya cerro (con pago: 30-04-2026; sin pago: 08-05-2026).
Regla concreta para hoy: si ya declaraste, revisa observaciones o rectifica en
"Consulta y seguimiento" de sii.cl; si no alcanzaste a declarar, no puedes usar
el flujo normal AT2026; el proximo ciclo (AT2027) aun no tiene calendario
publicado por el SII. Excepciones/variantes: rectificatoria con devolucion se
paga ~3 semanas despues de que SII autoriza el monto a TGR. Vigencia: revision
2026-08-12. Fuentes: SII (comunicado AT2026, FAQ consulta/rectificatoria).

## Linea de diferenciacion visible (reencuadre, no adaptacion competitiva)

Este run no es una adaptacion competitiva (no hay benchmark), por lo que no
aplica `localDelta` de diferenciacion frente a terceros. La "diferenciacion"
aqui es frente a la version anterior del propio articulo: pasa de presentar el
ciclo AT2026 como abierto (falso a partir de 2026-05-08) a declarar
explicitamente su cierre en la primera pantalla, sin perder el calendario como
referencia. Esa declaracion de estado va en `articleLead.answer` y en el primer
bloque del cuerpo, visible sin scroll.

## Secciones (cambios respecto de la version publicada)

1. **Intro (sin cambio de fondo).** Se mantiene el parrafo de apertura sobre
   revisar la propuesta del SII.
2. **Bloque de estado del ciclo (nuevo, reemplaza el parrafo 2 actual).**
   Declara en presente que la ventana AT2026 cerro, con las mismas fechas que
   ya estaban en el articulo pero en tiempo pasado / marco de "referencia
   cerrada", y linkea a la nueva seccion de que hacer hoy.
3. **Seccion nueva "Fuera de la ventana AT2026: que puedes hacer hoy".**
   Cubre exactamente los tres casos pedidos por el brief: (a) declaracion
   observada / rectificatoria, (b) consulta de estado de devolucion,
   (c) que pasa si no alcanzaste a declarar (deferral legitimo, sin cifra de
   multa). Cierra con cuando abre AT2027 (sin inventar fecha).
4. **"¿Tienes que declarar o solo aceptar la propuesta?" — sin cambio.**
   Contenido atemporal (reglas de obligacion de declarar), no depende de la
   ventana.
5. **"¿Te van a devolver o debes pagar?" — sin cambio de cifras.** Se
   conservan $174.803, tope 5% Prestamo Solidario, etc., tal cual, porque son
   reglas del ciclo AT2026 que siguen siendo la referencia correcta hasta que
   AT2027 publique sus propios valores.
6. **"Cuando llega la devolucion" (tabla) — se agrega nota de cierre.** La
   tabla se conserva integra (dato verificado R5), pero se antepone una
   frase que la marca como calendario ya ejecutado del ciclo AT2026, no como
   fecha futura.
7. **Resto de secciones (Qué hacer ahora, Escenarios frecuentes, Errores,
   FAQ, Fuentes) — sin cambio de contenido.** Son instrucciones atemporales
   (aplican de nuevo cuando abra AT2027) o ya defieren correctamente a "el
   plazo informado por SII para ese ano tributario".
8. **"Informacion de vigencia" (footer) — se actualiza la fecha de revision**
   a 2026-08-12 y se agrega la razon del cambio (alineado con NORMA §5.3).

## Elementos que NO cambian

- Slug, title, seoTitle, H1, rutas, canonical.
- Cifras R5 (credito educacion, calendario de deposito, Prestamo Solidario).
- Estructura de encabezados existente (no se reordena, solo se inserta una
  seccion nueva).
