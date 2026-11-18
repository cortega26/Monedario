# Revisión editorial asistida — `gratificacion-legal-chile`

- **Fecha del paquete:** 2026-11-18
- **SLA:** 90 días · venció 2026-11-01 (`articleLead.validAsOf: 2026-08-03`)
- **Estado:** cifras confirmadas contra la Dirección del Trabajo; **dos afirmaciones legales requieren revisión**; firma humana pendiente
- **Alcance:** investigación y checklist. No se editó el artículo ni se movió ninguna fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/gratificacion-legal-chile.md` |
| Cadencia | `quarterly` · 90 días |
| `validAsOf` | 2026-08-03 |
| Pin volátil | `economic.imm.value` = **553.553** (`strict`) — coincide con el snapshot, sin drift |
| Fuentes declaradas | BCN (Código del Trabajo, arts. 47–52), DT, Mintrab |
| Gate | `check:editorial-timeliness` (usa `articleLead.validAsOf`) |

## Confirmado contra la Dirección del Trabajo (2026-11-18)

| Dato del artículo | Valor oficial | Fuente | Estado |
| --- | --- | --- | --- |
| IMM vigente | **$553.553** desde el 01-05-2026; menores de 18 y mayores de 65: $412.938; no remuneracional: $356.815 | [DT — ¿Cuál es el valor del ingreso mínimo mensual?](https://www.dt.gob.cl/portal/1628/w3-article-60141.html) | Coincide |
| Ley que fija el IMM | **Ley 21.830**, Diario Oficial 22-06-2026, con efecto desde el 01-05-2026 | DT, misma página | Coincide con «retroactiva al 01-05-2026» |
| Tope anual | 4,75 IMM = **$2.629.377** (553.553 × 4,75 = 2.629.376,75) | [DT — anticipos del 25 %](https://www.dt.gob.cl/portal/1628/w3-article-60162.html) | Coincide |
| Tope mensual de referencia | $2.629.377 ÷ 12 = **$219.115** | aritmética | Coincide |
| Ejemplo ($800.000 × 12) | bruto $2.400.000 < tope $2.629.377 | aritmética | Coincide |

**Conclusión:** ningún valor numérico del artículo está desactualizado al 18-11-2026. El IMM no cambia desde mayo y no hay ley nueva publicada. **Pero** las afirmaciones sobre pérdidas (punto 2) y sobre la base «imponible» (punto 5) no coinciden con la doctrina de la DT y deberían corregirse antes de renovar `validAsOf`.

## Pendiente de verificación humana

1. **El tope se calcula con el IMM vigente al 31 de diciembre del año respectivo**, no con el IMM de la fecha de pago. La DT lo dice expresamente: «el monto correspondiente a los 4,75 Ingresos Mínimos Mensuales equivalente al Ingreso Mínimo Mensual **vigente al 31 de diciembre del respectivo año**» ([DT 60162](https://www.dt.gob.cl/portal/1628/w3-article-60162.html)). El artículo dice «IMM mensual vigente × 4,75» sin anclar la fecha; para liquidaciones de 2026 el valor a usar se conoce al cierre del año. **Corrección candidata:** añadir «vigente al 31 de diciembre del año que se liquida».
2. **La afirmación «se paga aunque la empresa tenga pérdidas» es la más delicada.** El artículo dice que la modalidad del 25 % «subsiste aunque la empresa haya tenido pérdidas» y que «se paga independientemente de si la empresa tuvo utilidades o pérdidas». La DT sostiene lo contrario en dos consultas: si hubo pérdida «no se encontraría en la obligación de pagar el beneficio por cuanto no se da uno de los requisitos esenciales… utilidades líquidas», y los anticipos pagados pueden recuperarse al finiquito ([DT 60172](https://www.dt.gob.cl/portal/1628/w3-article-60172.html)). El matiz que sí protege al trabajador: si los **anticipos están convenidos en el contrato**, el empleador no puede dejar de pagarlos aunque estime pérdidas ([DT 60171](https://www.dt.gob.cl/portal/1628/w3-article-60171.html)). **Corrección candidata:** distinguir «modalidad elegida» de «anticipo convenido» y no afirmar que el 25 % es incondicional. La DT 60150 confirma que el 25 % también exige los cuatro requisitos, incluido obtener utilidades (punto 4).
3. **Oportunidad de pago.** La DT: «la gratificación es un beneficio anual, debiendo pagarse al trabajador en el **mes de abril** de cada año» ([DT 60164](https://www.dt.gob.cl/portal/1628/w3-article-60164.html)); el pago mensual es un **anticipo acordado**, no una obligación legal, y los anticipos se reajustan por IPC y se liquidan en abril. El artículo dice «la ley permite pagar la gratificación en una sola cuota, dentro del ejercicio correspondiente o el siguiente (artículo 48 CT)». Verificar el texto del art. 48: la formulación puede inducir a error sobre el mes de abril.
4. **Quiénes tienen derecho: la regla del art. 47 exige cuatro condiciones simultáneas** — establecimiento industrial/comercial/minero/agrícola (o cooperativa), fin de lucro, obligación de llevar contabilidad y **utilidades líquidas** ([DT 60150](https://www.dt.gob.cl/portal/1628/w3-article-60150.html)). El art. 50 es la modalidad sustitutiva del 30 %. El artículo afirma que «todo trabajador que preste servicios en un establecimiento… tiene derecho», lo que omite las condiciones; las entidades sin fines de lucro quedan fuera porque no persiguen utilidades, no por una excepción discrecional. A falta de pacto, el empleador elige entre el 30 % y el 25 % (DT 60150), pero solo si se cumplen los cuatro requisitos.
5. **Base del 25 %: «remuneraciones mensuales devengadas», no «imponibles».** El art. 50 y la DT hablan de «lo devengado… por concepto de remuneraciones mensuales» ([DT 60162](https://www.dt.gob.cl/portal/1628/w3-article-60162.html)). «Imponible» es una categoría previsional/tributaria distinta: excluye asignaciones no imponibles que igual son remuneración. Confirmar si el artículo debe cambiar «remuneraciones imponibles» por «remuneraciones mensuales» (afecta al ejemplo y a la calculadora).
6. **Reparto del 30 % (art. 47).** La DT indica que el 30 % se distribuye **incluyendo en el cálculo a trabajadores que no tienen derecho** (contratados por 30 días o menos, con gratificación convenida, con gratificación del art. 50, etc.), para luego prorratear ([DT 60160](https://www.dt.gob.cl/portal/1628/w3-article-60160.html)). El artículo no lo menciona; decidir si se agrega una frase o se deja fuera de alcance.
7. **Proporcionalidad (art. 52).** «Mes» es un período de días consecutivos (p. ej. 15 a 15), no el mes calendario, y no se computan los días que no completan un mes ([DT 60158](https://www.dt.gob.cl/portal/1628/w3-article-60158.html)). El artículo dice solo «proporcional al tiempo trabajado».
8. **Ley 21.751.** El artículo la menciona como la ley que fijó el monto inicialmente. Confirmar el número y el estado de esa ley antes de mantener la referencia.

## Efecto en la calculadora

`src/pages/calculadoras/gratificacion-legal.astro` usa el IMM del snapshot (`economicParameters.imm`) y deriva el tope mensual/anual de ese valor. Tres puntos a revisar junto con el artículo:

- Si se acepta el punto 1 (IMM al 31-DIC), agregar una nota de alcance («IMM vigente; para cerrar un año, usa el IMM al 31-DIC»), no cambiar la fórmula.
- El FAQ dice que el art. 47 también tiene «el tope de 4,75 IMM»; el tope está en el art. 50, no en el reparto del 30 %. Precisar la redacción.
- El «tope mensual» es una referencia de provisión: el límite legal es anual (4,75 IMM) y se compara con lo devengado en el año. Rotularlo como referencia, no como tope legal mensual.
- La base del 25 % aparece como «remuneración» genérica; alinear con la decisión del punto 5.

**No** se tocó la calculadora en este paquete.

## Cierre

- [ ] Resolver los puntos 1–7 con las fuentes oficiales (BCN para el texto de los arts. 47–52).
- [ ] Si el contenido sigue correcto, actualizar **`articleLead.validAsOf`** (no `pubDate`) a la fecha real de la revisión.
- [ ] Si se corrige «imponibles» o el tope, actualizar también la calculadora y su pin.
- [ ] `pnpm run check:editorial-timeliness` y `pnpm run check:economic-source-consistency`.
- [ ] PR con la fecha y los ajustes de texto, con la evidencia de las fuentes.

La próxima revisión natural cae en **febrero de 2027** (90 días desde la firma).
