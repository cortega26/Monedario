# Evaluación SEO: valor UTM del mes siguiente

**Estado:** investigación terminada; no implementar en este ciclo  
**Fecha:** 2026-10-29  
**Superficie evaluada:** `/calculadoras/conversor-utm/`

## Decisión

Mantener la página en su forma actual y verificar el cambio mensual normal del
valor UTM. La oportunidad de mostrar por adelantado el valor publicado para el
mes siguiente queda como hipótesis de producto; no está justificada todavía
como experimento de snippet.

Si Monedario decide añadir esa información, el cambio es **A3**: incorpora una
cifra tributaria y un período económico nuevo en una superficie pública. Exige
fuente oficial, revisión YMYL y decisión humana antes de publicar. No tratarlo
como un cambio A2 autónomo de título/meta.

## Alcance de esta evaluación

- Solo lectura de GSC/Growth Engine, el código que alimenta los metadatos y el
  valor actual, las páginas públicas y fuentes oficiales/competidoras.
- No se modificaron contenido, metadatos, fórmula, snapshot económico, worker,
  rutas ni artefactos de la corrección YMYL en curso.
- Google Chile no entregó resultados: las consultas directas devolvieron un
  desafío CAPTCHA. Los resultados de búsqueda pública y las páginas
  competidoras sirven como observación cualitativa, no como prueba de posición
  en Google.

## Evidencia

### Rendimiento orgánico propio

GSC Web, página exacta, 2026-09-30 a 2026-10-27. La captura fue interactiva;
no se creó un nuevo export local de esos 28 días.

| Consulta | Impresiones | CTR | Posición media |
|---|---:|---:|---:|
| `valor utm` | 65.057 | 0,2% | 8,3 |
| `utm hoy` | 56.260 | 0,3% | 8,2 |
| `valor utm hoy` | 47.640 | 0,3% | 7,3 |
| `conversor utm` | 745 | 3,0% | 4,7 |

La página completa registró 522 mil impresiones, 1,73 mil clics, CTR de 0,3% y
posición media 7,5. El Growth Engine W43 ya detectó consultas de UTM en distancia
de CTR; su salida fue report-only y no incorporó datos de SERP/competidores
(`external=0`). Ninguna de las consultas UTM entre sus 18 candidatos contiene
`noviembre`. Esto no demuestra que no exista demanda: solo que no aparece en ese
conjunto priorizado.

El título ya responde a `valor utm hoy` e incluye la cifra actual. El contenido
visible incluye conversión y tabla de montos; la guía y el glosario ya enlazan a
esta calculadora. No hay evidencia para añadir más términos al título.

### Metadatos y actualización existentes

El código de la página construye título y descripción con `utmDisplay` y
`utmDateDisplay`, derivados de `getEconomicParameters()`. El valor que aparece
en el snippet acompaña al valor de la calculadora. La implementación está en
`src/pages/calculadoras/conversor-utm.astro`.

El recolector SII escoge el mes calendario de `America/Santiago` y lee ese mes
de la tabla oficial. Su implementación documenta que el SII publica por
adelantado el mes siguiente; la selección local evita adoptarlo antes de que
corresponda. Por tanto, el cambio de título a la UTM del nuevo mes ya está
automatizado por el flujo mensual, sujeto a que el snapshot se refresque.
La selección del mes está en
`workers/economic-snapshot-refresh/src/sources/siiUtm.ts`.

### SII y competencia

La tabla oficial del SII y la Circular N.º 39 del 13 de octubre registran
$72.151 para octubre y $72.440 para noviembre; la Circular también presenta
el IPC de septiembre. La ley establece que el reajuste mensual considera el
IPC del segundo mes anterior. La fuente respalda el valor mensual publicado,
pero la UI no debe atribuir un día exacto de vigencia que la fuente no exprese.

Observaciones de páginas públicas al 2026-10-29:

- `indicadores.cl` destacaba octubre como vigente y ofrecía selector histórico.
- `valor-utm.cl` separaba explícitamente octubre vigente de noviembre publicado
  próximo. Es un patrón de presentación útil, no evidencia de que ese patrón
  cause mejores posiciones.
- Una consulta pública también devolvió `1g.cl` con el monto de noviembre. No
  fue una medición de Google Chile.

La prueba de laboratorio de Chrome y los datos CrUX de Monedario no apuntan a
rendimiento como limitante: la URL UTM mostró LCP de campo de 1.390 ms, INP de
62 ms y CLS de 0,01; Chrome estimó 0 ms de ahorro de LCP al cambiar los recursos
bloqueantes examinados.

## Evaluación de la hipótesis

Mostrar el próximo valor podría responder consultas de mes futuro y distinguir
el período vigente del publicado. El beneficio orgánico aún es incierto porque:

1. Las consultas de mayor volumen ya están cubiertas por el título y la página.
2. No se identificó una señal de consultas de noviembre en el conjunto GSC W43
   priorizado.
3. El título se actualiza con el valor del mes seleccionado por la fuente; no
   necesita anticipar el próximo valor para seguir siendo actual.
4. La cifra próxima exige una ruta de datos adicional o un cambio en el
   proveedor/snapshot. Es más superficie de frescura y mantenimiento, además
   del riesgo de confundir valor vigente y valor publicado.
5. Las muestras SERP de esta revisión no permiten atribuir cambios de CTR o
   posición al patrón visual del competidor.

El objetivo primario de una eventual ampliación debe ser la claridad para las
personas. No se debe estimar como hecho el aumento de clics sugerido por un
modelo del Growth Engine ni cambiar el título junto con la presentación de un
segundo valor.

## Hipótesis y sugerencias para una decisión futura

Estas hipótesis no autorizan cambios. Deben reconsiderarse después de cerrar la
corrección YMYL actual y la revisión del foco estratégico.

### H1 — Claridad entre valor vigente y valor próximo

**Hipótesis:** mostrar el valor oficial ya publicado para el mes siguiente,
separado del valor que usa actualmente la calculadora, podría ayudar a las
personas que llegan anticipadamente buscando el dato del próximo mes.

**Evidencia disponible:** un competidor distingue ambos períodos; la tabla del
SII ya publica noviembre. **Evidencia pendiente:** demanda GSC de consultas del
mes futuro, SERP localizada verificable y prueba de que la distinción aporta
utilidad a Monedario. El conjunto W43 no contiene consultas de noviembre entre
sus 18 candidatos, pero no es una exportación completa de consultas.

### H2 — Cambiar el snippet

**Hipótesis:** mencionar el próximo valor en título o descripción podría elevar
el CTR para búsquedas del próximo mes. La página ya genera ambos metadatos desde
el valor vigente del snapshot y ya cubre las consultas generales con mayor
volumen. No cambiar el snippet mientras el período futuro sea distinto del
vigente; si el título se evalúa más adelante, aislarlo de cualquier cambio de
interfaz o fuente de datos.

### H3 — Rendimiento

No se prioriza una optimización de rendimiento para esta oportunidad. Los datos
CrUX observados y la traza de Chrome no identificaron una mejora concreta con
ahorro de LCP. Repetir medición solo si GSC/CrUX detecta regresión o aparece una
causa técnica nueva.

### Propuesta si la evidencia justifica avanzar

1. Abrir una issue/spec **A3** aprobada por una persona responsable. Registrar
   query objetivo, período de referencia, fuente oficial, métrica principal,
   guardrails y criterio de reversión.
2. Mantener la URL actual y el valor usado por la calculadora como valor
   vigente. Una futura interfaz podría mostrar el próximo valor en un bloque
   separado, con mes, etiqueta de estado y enlace al SII. No atribuir un día
   exacto de vigencia sin fuente primaria que lo sustente.
3. Revisar el contrato de datos antes de implementarlo: el valor futuro debe
   proceder del flujo oficial de datos y tener controles de frescura y
   fallback. No agregar una consulta SII directa desde la página ni reemplazar
   anticipadamente el valor vigente.
4. Aprobar por separado cualquier cambio de title/meta. No mezclarlo con la
   presentación del segundo valor en el mismo cambio.
5. Tras una aprobación y publicación humanas, observar al menos 28 días de
   GSC por query, dispositivo, posición, impresiones y CTR. Este antes/después
   es observacional y no prueba causalidad por sí solo.

**Seguir:** solo si GSC aporta evidencia de demanda para el mes próximo o la
persona responsable confirma una mejora de utilidad, y existe una ruta de datos
oficial que mantenga ambos períodos inequívocos.

**Descartar o revertir:** si no aparece demanda incremental, el segundo valor
confunde cuál usa la calculadora, el dato no puede mantenerse fresco o la
medición no muestra una mejora útil. No crear otra URL para esta hipótesis.

## Siguiente acción y gates

1. **Rollover de noviembre, solo lectura:** después de que se ejecute la
   actualización mensual del snapshot en horario de Chile, comprobar en la
   página pública que título, descripción, cifra de calculadora, fecha y
   conversiones pasan juntos a noviembre y coinciden con el SII. Esta
   observación no autoriza cambios de contenido ni acredita un despliegue del
   checkout local.
2. **Revisión de foco:** después del 2026-11-02, volver a consultar GSC para
   búsquedas de valor UTM por query/dispositivo/posición; determinar si aparece
   demanda de mes futuro y si cambia la oportunidad.
3. **Decisión A3:** si se propone mostrar el próximo valor, abrir una issue/spec
   con fuente oficial, período rotulado, responsable de actualización,
   comportamiento ante snapshot atrasado, revisión YMYL humana y reversión.
   Mantener una única URL y no cambiar la fórmula. No redactar ni publicar ese
   contenido dentro de la corrección actual.
4. **Medición posterior:** si una persona aprueba y publica el A3, comparar al
   menos 28 días de GSC y revisar CTR junto con posición, consulta y dispositivo.
   Tratar el resultado como medición observacional y separar cualquier cambio de
   título/meta para no mezclar variables.

No crear una URL nueva, no cambiar ahora el snippet y no introducir el valor de
noviembre en el campo que representa la UTM vigente.

## Fuentes

- SII, [UTM–UTA–IPC 2026](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm).
- SII, [Circular N.º 39 de 2026](https://www.sii.cl/normativa_legislacion/circulares/2026/circu39.pdf).
- BCN, [DL 830, artículo cuarto transitorio](https://www.bcn.cl/leychile/Navegar?idNorma=6374&idParte=8573509&idVersion=2025-01-01).
- Monedario, [conversor UTM](https://monedario.cl/calculadoras/conversor-utm/).
- Competencia, [Indicadores.cl](https://indicadores.cl/conversores/utm/),
  [Valor UTM](https://valor-utm.cl/utm-historico/) y
  [UTM Hoy](https://www.utmhoy.cl/valor-utm-2026.html), más la muestra de
  [1g.cl](https://www.1g.cl/indicadores/utm).
- Proyecto, [Growth Engine](../operations/GROWTH-ENGINE.md) y
  [foco estratégico 2026Q3](../governance/STRATEGIC_FOCUS_2026Q3.md).
- Datos priorizados del reporte W43:
  [`2026-W43.json`](</tmp/monedario-growth-review-2026-W43/2026-W43.json>).
- Observación exploratoria previa, [Claude SEO findings Monedario
  2026-10-29](/tmp/claude-seo-findings-monedario-2026-10-29.md).
