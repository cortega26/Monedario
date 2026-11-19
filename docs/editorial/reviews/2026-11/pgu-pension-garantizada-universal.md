# Revisión editorial asistida — `pgu-pension-garantizada-universal`

- **Fecha del paquete:** 2026-11-18
- **SLA:** 90 días · venció 2026-11-01 (`articleLead.validAsOf: 2026-08-03`)
- **Estado:** **una corrección material** (edad del monto ampliado);
  firma humana pendiente
- **Alcance:** investigación y checklist. No se editó el artículo ni se
  movió ninguna fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/pgu-pension-garantizada-universal.md` |
| Cadencia | `prevision`: 90 días, `manual_review` |
| `validAsOf` | 2026-08-03 |
| Fuentes declaradas | IPS, ChileAtiende, BCN (Ley 21.419) |
| Gate | `check:editorial-timeliness` |

## Confirmado contra ChileAtiende (2026-11-18)

Fuente: [ChileAtiende — Pensión Garantizada Universal
(PGU)](https://www.chileatiende.gob.cl/fichas/102077-pension-garantizada-universal-pgu).

| Dato del artículo | Valor oficial | Estado |
| --- | --- | --- |
| PGU base | **$231.732** | Coincide |
| Monto máximo 75+ | **$250.275** (con la Reforma de Pensiones) | Monto coincide; **la edad no** |
| Pensión base ≤ $789.139 | PGU completa de $231.732 | Coincide |
| Pensión base $789.140–$1.252.602 | monto variable | Límites del artículo imprecisos |
| Pensión base ≥ $1.252.603 | sin derecho a PGU | Límite del artículo impreciso |
| edad de acceso | 65 años cumplidos | Coincide |
| solicitud anticipada | desde los 64 años y 9 meses | El artículo no lo menciona |
| focalización | no pertenecer al 10 % más rico (90 % de menores ingresos) | Coincide |
| residencia | 20 años desde los 20 + 4 de los últimos 5 | Coincide |

## Corrección material — el monto ampliado rige desde los 75, no desde los 82

El artículo afirma en tres lugares que el monto de **$250.275** corresponde a
personas de **82 años o más**:

- `articleLead.answer`: «$250.275 mensuales (82 años o más, desde febrero
  2026)».
- Párrafo de apertura: «$250.275 mensuales (82 años o más, desde febrero
  2026)».
- Sección «¿Cuánto se paga?»: «personas de **82 años o más** acceden al
  monto ampliado».

La ficha oficial dice: «Si tienes **75 años o más**, el monto máximo de la PGU
es de **$250.275** con la Reforma de Pensiones». La diferencia no es menor:
deja fuera a las personas de 75 a 81 años, que sí acceden al monto ampliado.

**Corrección candidata:** reemplazar «82 años o más» por «75 años o más» en
los tres lugares y ajustar el tramo base de «65–81» a «65–74» (o «menores de
75»). Confirmar además la fecha de entrada en vigencia del monto ampliado
(«desde febrero 2026»): la ficha oficial no la explicita y debe contrastarse
con la reforma previsional o el IPS.

## Corrección menor — límites de la pensión base

La ficha oficial usa límites excluyentes:

- **Hasta $789.139**: $231.732.
- **Desde $789.140 hasta $1.252.602**: monto variable.
- **A partir de $1.252.603**: no corresponde PGU.

El artículo dice «entre $789.139 y $1.252.602» y «desde $1.252.602», lo que
traslapa el primer peso de cada tramo. Ajustar a los límites oficiales evita
que un lector con pensión base exactamente $789.139 o $1.252.602 quede en el
tramo equivocado.

## Pendiente de verificación humana

1. **Fecha del monto ampliado.** Confirmar si rige desde febrero de 2026 y si
   el tramo 75+ depende de la reforma o de un decreto posterior.
2. **Reajuste.** El artículo dice «se reajusta por decreto» en un párrafo y
   «por ley» en otro; unificar con la norma vigente.
3. **Solicitud desde los 64 años y 9 meses.** Agregar el dato oficial o
   dejarlo fuera de alcance; hoy el artículo solo menciona los 65.
4. **Tramitación automática.** La nota sobre el cruce de datos del IPS no
   tiene fuente enlazada; verificar o suavizar.
5. **Atribución de los umbrales.** El artículo los atribuye a la
   Superintendencia de Pensiones; la ficha de ChileAtiende los publica. Citar
   la fuente exacta que se usó.
6. **Compatibilidad con pensión de invalidez.** La respuesta actual es
   deliberadamente genérica; confirmar que no contradice la ficha del IPS.

## Entrada propuesta para `correcciones.json`

```json
{
  "id": "pgu-monto-ampliado-75-anos",
  "date": "2026-11-18",
  "title": "PGU: el monto ampliado rige desde los 75 años, no desde los 82",
  "pages": [
    {
      "href": "/posts/pgu-pension-garantizada-universal/",
      "label": "PGU en Chile"
    }
  ],
  "wrong": [
    "La guía afirmaba que el monto ampliado de $250.275 correspondía a personas de 82 años o más, desde febrero de 2026."
  ],
  "fixed": [
    "El monto máximo de $250.275 corresponde a personas de 75 años o más, según la ficha de ChileAtiende; el tramo base de $231.732 cubre a los menores de 75 con pensión base hasta $789.139."
  ],
  "affected": "Personas de 75 a 81 años que podrían acceder al monto ampliado de la PGU y creían que solo aplicaba desde los 82.",
  "sources": "ChileAtiende, Pensión Garantizada Universal (https://www.chileatiende.gob.cl/fichas/102077-pension-garantizada-universal-pgu); IPS (https://www.ips.gob.cl/); BCN, Ley 21.419 (https://www.bcn.cl/leychile/navegar?idNorma=1171923).",
  "prevention": "Verificar la edad de cada tramo en la ficha oficial antes de publicar; no inferir edades desde el calendario de la reforma."
}
```

## Cierre

- [ ] Corregir «82» por «75» en los tres lugares y ajustar «65–81».
- [ ] Confirmar la fecha de vigencia del monto ampliado.
- [ ] Ajustar los límites de la pensión base a $789.139 / $789.140 /
  $1.252.602 / $1.252.603.
- [ ] Registrar la corrección en `correcciones.json` si se publica el cambio.
- [ ] `pnpm run check:editorial-timeliness`, `check:correcciones` y
  `check:economic-source-consistency`.
- [ ] Actualizar `articleLead.validAsOf` solo con la fecha real de la
  revisión.

La próxima revisión natural cae en **febrero de 2027**.
