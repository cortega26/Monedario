# Handoff — correcciones editoriales pendientes (2026-11)

Este documento es para una **sesión de redacción distinta** de la que hizo la
auditoría. No se debe usar para redactar y auditar el mismo artículo en la
misma sesión: `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.

## Estado del registro

- Registro real: `src/data/correcciones.json` (**22 entradas** al 2026-11-20).
- Ninguna de las ocho correcciones con entrada propuesta en
  `proposed-corrections.json` está registrada.
- Las cuatro entradas de `contribuciones-bienes-raices-chile` se agregaron el
  2026-11-20; el artículo no se editó.
- `proposed-corrections.json` (este directorio) es una **propuesta**, no el
  registro. Copiar cada objeto a `.corrections` **solo cuando el arreglo del
  artículo esté publicado en el mismo PR**.
- Registrar antes de corregir dejaría una página `/correcciones/` que afirma
  un arreglo inexistente.

## Orden recomendado

| # | Artículo | Hallazgo | Registro propuesto | Prioridad |
| --- | --- | --- | --- | --- |
| 1 | `pgu-pension-garantizada-universal` | Monto ampliado desde los **75**, no 82 | `pgu-monto-ampliado-75-anos` | Alta |
| 2 | `como-leer-cartola-afp-chile` | **Cuatrimestral**, no trimestral; fuente 404 | `cartola-afp-cuatrimestral` | Alta |
| 3 | `operacion-renta-centro` | Campaña 2026 vencida; **Ley 21.850** publicada | `operacion-renta-2026-ley-21850` | Alta |
| 4 | `gratificacion-legal-chile` | **Pérdidas** y base «imponibles» | `gratificacion-25-utilidades-base` | Alta |
| 5 | `sueldo-imponible-chile` | Pin UTM 72.151 → **72.440** | Sin entrada (metadato) | Media |
| 6 | `boleta-honorarios-2026-retencion-cobertura` | Cuatro precisiones | Sin entrada (sin error) | Media |
| 7 | `impuesto-global-complementario-chile` | Sin error; AT 2027 | Sin entrada (sin error) | Baja |
| 8 | `contribuciones-bienes-raices-chile` | Tasas 1,23 % y 0,4 % mal atribuidas al Decreto 437/2022; falta la sobretasa del 100 % | `contribuciones-tasas-origen-sobretasa` | Alta |
| 9 | `contribuciones-bienes-raices-chile` | Adultos mayores: 65+ para todos; mujeres 60+; faltan umbrales y la exención 2027 | `contribuciones-adulto-mayor-umbrales` | Alta |
| 10 | `contribuciones-bienes-raices-chile` | DFL-2: «tasas diferenciadas» en vez de exenciones | `contribuciones-dfl2-exenciones` | Media |
| 11 | `contribuciones-bienes-raices-chile` | F22: contribuciones como gasto, no como crédito | `contribuciones-f22-credito-no-gasto` | Alta |

## Qué cambiar en cada artículo

Los detalles y las citas están en el paquete de cada artículo, en este mismo
directorio. Resumen de ubicaciones:

- **PGU:** `articleLead.answer`, párrafo de apertura y sección «¿Cuánto se
  paga?». Cambiar «82» por «75» y «65–81» por «65–74» donde corresponda.
  Confirmar la fecha de vigencia del monto ampliado.
- **Cartola:** título, `articleLead.answer`, FAQ, cuerpo y cierre. Cambiar
  «trimestral» por «cuatrimestral»; quitar la lista enero/abril/julio/octubre;
  reemplazar la fuente 404; precisar que el SIS es aporte del empleador;
  unificar `validAsOf` con la fecha del texto.
- **Operación Renta:** nota del art. 107; decidir el banner de campaña 2026
  cerrada; no renovar `validAsOf` sin resolver la temporada.
- **Gratificación:** lead, cuerpo, ejemplo y cierre. Distinguir modalidad del
  25 % de anticipo convenido; cambiar «remuneraciones imponibles» por
  «remuneraciones mensuales devengadas»; anclar el tope al IMM del 31-12.
- **Sueldo imponible:** `volatileData.expectedValue` 72151 → **72440** y
  `articleLead.validAsOf` a la fecha real (≥ 2026-11-01).
- **Boleta:** ventana 01-07-2026 a 30-06-2027; «igual o superior a 5 IMM»;
  umbral $2.767.765; exenciones 55/50 y régimen distinto a AFP.
- **IGC:** sin cambios de fondo; actualizar `validAsOf` y dejar la próxima
  revisión después de la UTA de diciembre 2026.
- **Contribuciones:** en la tabla de tasas, separar el Decreto 437/2022
  (0,893 % y 1,042 %) de los decretos 102/2024 (0,4 % agrícola) y 213/2025
  (1,23 % sitios no edificados) y agregar la sobretasa del 100 %; en «Adultos
  mayores», corregir la edad (hombres 65+, mujeres 60+), publicar los umbrales
  y agregar la exención de la Ley 21.850 con su plazo; en «DFL-2», reemplazar
  «tasas diferenciadas» por las exenciones de los arts. 14 y 15; en «F22»,
  explicar que las contribuciones son crédito y no gasto.

## Checklist por artículo

- [ ] Aplicar el cambio de texto en una sesión de redacción.
- [ ] Agregar el objeto de `proposed-corrections.json` a
  `src/data/correcciones.json` en el **mismo PR**.
- [ ] Ajustar `date` a la fecha real de publicación del arreglo.
- [ ] Actualizar `articleLead.validAsOf` a la fecha real de la revisión.
- [ ] Correr:

  ```bash
  pnpm run check:correcciones
  pnpm run check:editorial-timeliness
  pnpm run check:economic-source-consistency
  pnpm run check:docs
  pnpm run format:check
  ```

- [ ] Abrir el PR con el diff del artículo + la entrada del registro; el
  gate `Docs standards` corre solo.

## Nota sobre el pin UTM

El cambio `expectedValue: 72151 → 72440` no requiere entrada en
`correcciones.json`: no cambia la prosa, solo alinea el metadato con el
snapshot. Pero **sí** requiere mover `articleLead.validAsOf` a la fecha real
de revisión (≥ 2026-11-01) para cerrar el drift.
