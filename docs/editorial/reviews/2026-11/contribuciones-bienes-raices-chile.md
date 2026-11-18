# Revisión editorial asistida — `contribuciones-bienes-raices-chile`

- **Fecha del paquete:** 2026-11-18
- **SLA:** 90 días · venció 2026-11-01 (`articleLead.validAsOf: 2026-08-03`)
- **Estado:** valores cuantitativos confirmados contra el SII; **firma humana pendiente**
- **Alcance:** investigación y checklist. No se editó el artículo ni se movió ninguna fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/contribuciones-bienes-raices-chile.md` |
| Cadencia | `quarterly` · 90 días |
| `validAsOf` | 2026-08-03 |
| Fuentes declaradas | SII, TGR, BCN (DL 3.063, DFL-1/1998) |
| Gate | `check:editorial-timeliness` (usa `articleLead.validAsOf`) |

## Confirmado contra el SII (2026-11-18)

Fuente: [Reajustes y exenciones de Impuesto Territorial](https://www.sii.cl/ayudas/ayudas_por_servicios/2242-reajustes_exenciones-2468.html)

| Dato del artículo | Valor SII al 01.07.2026 | Estado |
| --- | --- | --- |
| Exención habitacional | **$61.711.570** | Coincide |
| Umbral cambio de tasa | **$220.398.431** | Coincide |
| Tasa tramo inferior | **0,893%** | Coincide |
| Tasa tramo superior / no habitacional | **1,042%** | Coincide |
| Reajuste semestral | factor 1,028 el 2.º semestre 2026; próximo **01.01.2027** | Coincide con el texto |

El artículo declara estos montos como vigentes desde el 01.07.2026 y advierte el reajuste semestral. La revisión de hoy cae dentro del mismo semestre, así que **no hay un valor numérico desactualizado**.

## Pendiente de verificación humana

1. **Tasas 1,23% (sitios no edificados) y 0,4% (agrícola)**: confirmar que siguen en el Decreto 437/2022 y que no hubo modificación para 2026.
2. **Calendario de cuotas 2026** (30/04, 30/06, 30/09, 30/11): contrastar con el calendario publicado por la TGR.
3. **Reducción para adultos mayores (65+)**: el artículo no explicita el umbral de avalúo ni la condición socioeconómica. Decidir si se mantiene la remisión al SII o se agrega el dato vigente.
4. **DFL-2 / Decreto 1101**: confirmar 140 m², uso habitacional, personas naturales y máximo dos propiedades.
5. **Deducción en F22 para arrendadores**: contrastar con las instrucciones SII del año tributario vigente.
6. **Ley 21.806**: confirmar en la noticia SII la postergación del reavalúo a 2027 y que los avalúos 2022 siguen vigentes hasta el 31.12.2026.

## Cierre

- [ ] Confirmar los seis puntos anteriores con las fuentes oficiales.
- [ ] Si el contenido sigue correcto, actualizar **`articleLead.validAsOf`** (no `pubDate`) a la fecha real de la revisión.
- [ ] `pnpm run check:editorial-timeliness` y `pnpm run check:economic-source-consistency`.
- [ ] PR solo con la fecha (y el texto si algún punto requiere un ajuste), con la evidencia de las fuentes.

La próxima revisión natural cae después del **01.01.2027**, cuando cambian los montos por el reajuste semestral.
