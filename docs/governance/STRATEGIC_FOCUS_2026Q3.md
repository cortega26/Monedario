# Foco estratégico: validación utility-led

**Estado:** `FOCO ESTRICTO / VALIDACIÓN UTILITY-LED`
**Vigencia:** 2026-08-02 a 2026-11-02
**Autoridad operativa:** este documento implementa el criterio obligatorio de `docs/development/CRITERIO_VIABILIDAD.md`; no altera la Constitución ni los invariantes.

## Decisión

Hasta la revisión del 2026-11-02, Monedario prioriza demostrar que una utilidad existente puede adquirir usuarios, completar una tarea y producir una siguiente acción medible sin capturar datos financieros personales. La superficie principal de validación es el conversor UTM existente.

El objetivo de esta etapa es construir utilidad, confianza, hábito y reputación de manera sostenida. Los ingresos son una posibilidad futura y una señal útil, pero no son el único criterio de viabilidad ni una exigencia de corto plazo. La ausencia de ingresos no ordena cerrar, reducir ni desnaturalizar el proyecto.

No se crearán URLs indexables, clusters, calculadoras, artículos, leyes, entradas de glosario, SEO programático, API pública, afiliación, publicidad, cuentas, alertas con correo ni producto B2B. Investigación, instrumentación agregada, correcciones de integridad y documentos de descubrimiento B2B sí están dentro del foco.

## Gate de excepción

Una excepción solo es ejecutable cuando existe una entrada activa en `url-freeze-exceptions.json` con todos estos campos: problema, evidencia, hipótesis, costo, mantenimiento, métrica, umbral, decisión `APPROVED`, aprobador y fechas de aprobación/vencimiento. Una idea, recomendación o ticket sin esa evidencia permanece `BLOCKED_PENDING_EVIDENCE`.

El gate compara el inventario aprobado con el sitemap generado, falla ante altas o bajas no autorizadas y falla si una página `noindex` aparece en el sitemap. La identidad de URL conserva `URL.PUBLIC.NO_POST_ID`.

## Criterio de revisión del 2026-11-02

La revisión considera, como mínimo, calidad de adquisición GSC, `calculator_complete / calculator_start`, interacción contextual, interés agregado en avisos, apoyo postresultado, integridad de datos y carga operativa. No se interpreta una salida a un enlace etiquetado como retorno de una persona; solo como señal agregada del enlace.

### Gate de sostenibilidad

Monedario puede continuar sin ingresos mientras, en conjunto:

- la dedicación del responsable no sea desproporcionada;
- los costos permanezcan bajos y asumibles;
- no produzca agotamiento sostenido;
- mantenga información correcta y controles de calidad;
- muestre alguna señal verificable de crecimiento o aprendizaje; y
- siga aportando confianza pública o reputación profesional.

La revisión debe registrar horas y costos operativos semanales, una autoevaluación simple de carga/agotamiento, incidentes de calidad, señales de crecimiento/aprendizaje y valor reputacional. Un resultado sostenible autoriza perseverar y aprender aunque el ingreso sea cero. Solo una carga persistentemente insostenible, pérdida de calidad o ausencia prolongada de aprendizaje obliga a reducir alcance o pausar; nunca a fabricar monetización.

Una expansión requiere evidencia reproducible, umbral declarado antes de medir y capacidad de mantenimiento. Si los datos son insuficientes o no comparables, el resultado de una decisión de expansión es `HALT`, no una inferencia optimista; esto no equivale a cerrar el proyecto.
