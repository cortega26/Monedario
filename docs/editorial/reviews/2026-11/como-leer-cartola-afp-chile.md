# Revisión editorial asistida — `como-leer-cartola-afp-chile`

- **Fecha del paquete:** 2026-11-19
- **SLA:** 180 días · venció 2026-11-07 (`articleLead.validAsOf: 2026-05-11`)
- **Estado:** **dos hallazgos materiales** (frecuencia y fuente rota);
  firma humana pendiente
- **Alcance:** investigación y checklist. No se editó el artículo ni se
  movió ninguna fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/como-leer-cartola-afp-chile.md` |
| Cadencia | `prevision`: 180 días, `manual_review` |
| `validAsOf` | 2026-05-11 |
| Texto del artículo | «Vigente a 2026-04-09» (lead, FAQ y cierre) |
| `updatedDate` | 2026-10-04 |
| Pin volátil | `pensions.afp.worker_mandatory_contribution` = 10 (`strict`) |
| Gate | `check:editorial-timeliness` |

## Hallazgo 1 — la cartola es cuatrimestral, no trimestral

El artículo afirma en el título, el lead, la FAQ y el cuerpo que la cartola
llega **cuatro veces al año** (enero, abril, julio y octubre). La fuente
oficial la llama **«Cartola cuatrimestral»** y el DL 3.500 (art. 31) exige
enviarla **a lo menos cada cuatro meses**, no cada tres.

- [SP — Cartola cuatrimestral](https://www.spensiones.cl/portal/institucional/594/w3-article-3007.html).
- [SP — NCG N° 363 (29-04-2026)](https://www.spensiones.cl/portal/institucional/594/w3-article-17028.html):
  «cada cuatro meses debe enviarles una cartola».
- La misma NCG fija la cartola del **tercer cuatrimestre
  (septiembre–diciembre 2026)**, que se pondrá a disposición en la **segunda
  quincena de febrero de 2027**.

**Corrección candidata:** reemplazar «trimestral» por «cuatrimestral» y
eliminar la lista fija enero/abril/julio/octubre. No inventar los meses de
entrega: confirmarlos con la AFP o la SP antes de publicarlos. Como mínimo,
la cartola sep–dic 2026 se entrega en febrero de 2027.

## Hallazgo 2 — la fuente oficial enlazada está rota

`articleLead.officialSources` y el cuerpo enlazan a
`https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-6200.html`,
que hoy responde **404**. Reemplazar por fuentes vigentes:

- [Cartola cuatrimestral](https://www.spensiones.cl/portal/institucional/594/w3-article-3007.html).
- [NCG N° 363 y Cotización con Rentabilidad Protegida](https://www.spensiones.cl/portal/institucional/594/w3-article-17028.html).
- [Compendio de Pensiones, Capítulo III — Cartolas](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-5814.html).
- [Mi portal SP](https://miportal.spensiones.gob.cl/).

## Hallazgo 3 — la cartola de 2027 cambia de contenido

La NCG N° 363 (vigente desde el **1 de enero de 2027**) incorpora a la
cartola:

- la **Cotización con Rentabilidad Protegida** del Seguro Social Previsional
  (FAPP, Bono de Seguridad Previsional y Bono Amortizable);
- las **comisiones implícitas** de los fondos.

El artículo no menciona ninguno de los dos cambios. La primera cartola que
los mostrará es la de **sep–dic 2026**, disponible en **febrero de 2027**. Si
la revisión se hace antes de esa fecha, conviene agregar una nota de
«próximo cambio» para que el lector no interprete los nuevos campos como un
error.

## Hallazgo 4 — el SIS es un costo del empleador

La tabla de «Cotizaciones del período» lista «cotización obligatoria (10 %),
comisión AFP, **SIS**…». El SIS (Seguro de Invalidez y Sobrevivencia) es un
aporte **del empleador**, no un descuento de la renta imponible del
trabajador. La nota posterior lo llama «cargo separado», lo que puede
leerse como una deducción más. Precisar que aparece en la cartola como
aporte del empleador y que no se descuenta del sueldo.

## Hallazgo 5 — fechas de vigencia inconsistentes

El frontmatter declara `validAsOf: 2026-05-11`, pero el lead, la FAQ y el
cierre dicen «Vigente a 2026-04-09». Unificar en una sola fecha real de
revisión. El `updatedDate` es 2026-10-04; si esa actualización fue de
contenido, `validAsOf` debería reflejarla (y el gate dejaría de marcarlo
vencido).

## Pendiente de verificación humana

1. **Meses exactos de entrega** de las cartolas cuatrimestrales. La norma
   fija «cada cuatro meses»; no una lista de meses. Confirmar con la SP o la
   AFP antes de publicar un calendario.
2. **Plazo de respuesta de la AFP**: el artículo dice 15 días hábiles.
   Contrastar con la normativa SP o el contrato; no se encontró una fuente
   oficial directa en esta revisión.
3. **Plazo de 4 años para reclamar ante la SP**: confirmar la norma y desde
   cuándo corre.
4. **Aporte adicional del empleador**: la reforma (Ley 21.735) introdujo
   cotizaciones de cargo del empleador; confirmar la tasa vigente en 2026 y
   si ya aparece en la cartola.
5. **«Fondos generacionales (abril 2027)»**: la fuente enlazada es la home
   de la SP, no una página específica. Confirmar el cambio y adelantar que
   la cartola dejará de mostrar los fondos A–E.
6. **Vigencia del pin del 10 %**: confirmar que la cotización obligatoria
   del trabajador sigue en 10 % después de la reforma.

## Entrada propuesta para `correcciones.json`

```json
{
  "id": "cartola-afp-cuatrimestral",
  "date": "2026-11-19",
  "title": "La cartola AFP es cuatrimestral, no trimestral",
  "pages": [
    {
      "href": "/posts/como-leer-cartola-afp-chile/",
      "label": "Cómo leer la cartola AFP"
    }
  ],
  "wrong": [
    "La guía afirmaba que la cartola AFP llega cuatro veces al año (enero, abril, julio y octubre).",
    "La guía enlazaba como fuente oficial una página de la SP que hoy responde 404."
  ],
  "fixed": [
    "La cartola es cuatrimestral: el DL 3.500 exige enviarla a lo menos cada cuatro meses y la SP la denomina 'Cartola cuatrimestral'. La cartola sep-dic 2026 se entrega en la segunda quincena de febrero de 2027.",
    "Las fuentes vigentes son la ficha 'Cartola cuatrimestral' y la NCG N° 363 de la SP."
  ],
  "affected": "Personas afiliadas a una AFP que esperan su cartola cada tres meses o que no encuentran la fuente oficial enlazada.",
  "sources": "SP, Cartola cuatrimestral (https://www.spensiones.cl/portal/institucional/594/w3-article-3007.html); SP, NCG N° 363 (https://www.spensiones.cl/portal/institucional/594/w3-article-17028.html); BCN, DL 3.500, art. 31 (https://www.bcn.cl/leychile/navegar?idNorma=7147).",
  "prevention": "Verificar la periodicidad y el enlace de la fuente oficial en cada revisión; no confundir la frecuencia de la cartola con la de la liquidación de sueldo."
}
```

## Cierre

- [ ] Reemplazar «trimestral» por «cuatrimestral» en título, lead, FAQ y
  cuerpo.
- [ ] Quitar la lista enero/abril/julio/octubre y confirmar los meses reales.
- [ ] Reemplazar la fuente 404 por las URLs vigentes.
- [ ] Agregar la nota de los cambios de 2027 (rentabilidad protegida y
  comisiones implícitas).
- [ ] Precisar que el SIS es un aporte del empleador.
- [ ] Unificar `validAsOf` y la fecha del texto.
- [ ] Registrar la corrección en `correcciones.json` si se publica el
  cambio.
- [ ] `pnpm run check:editorial-timeliness`, `check:correcciones` y
  `check:economic-source-consistency`.
- [ ] Actualizar `articleLead.validAsOf` solo con la fecha real de la
  revisión.

La próxima revisión natural cae en **mayo de 2027**.
