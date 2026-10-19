# HANDOFF — Auditoría independiente de la portada data-render de interés compuesto

**Estado:** DEL EGADO a la sesión abierta de ChatGPT (opción 2).
**No modificar la imagen ni el registro en este repositorio hasta recibir el veredicto.**
**Artículo:** `src/data/blog/interes-compuesto-nota-metodologica.md`
**Portada actual:** `public/images/hero/interes-compuesto-nota-metodologica.avif`
**Assets de delivery:** `public/images/editorial/interes-compuesto-nota-metodologica/`

## Por qué es una excepción

Es la única de las 54 portadas sin entrada en `scripts/hero-images/asset-reviews.json`.
El brief exige `generationMethod: data-render` y prohíbe Imagegen. La imagen debe
ser un gráfico reproducible derivado de la serie verificada, no una ilustración.
El `PLAN-renovacion-visual-editorial-2026-09-29.md` la deja explícitamente en
espera de auditoría independiente (53/54 aceptadas).

## Contexto del artículo

- Período: enero 1990 – diciembre 2025; corte **2025-12-31**.
- 432 meses; 408 con aporte; 24 lagunas con semilla fija `numpy.random.seed(42)`.
- Aporte: 10% del sueldo mínimo bruto; descuentos 17,6% (AFP 10%, salud 7%, AFC 0,6%).
- Serie: NASDAQ-100; resultado final del ejercicio: **USD 129.495 / CLP 118,0 millones**
  (actualización 2026-03-07).
- El artículo incluye tablas de sueldo mínimo, descuentos, series y una tabla
  accesible con los valores del gráfico.

## Qué debe revisar ChatGPT

1. Leer el artículo completo y el brief/prompt `data-render`.
2. Verificar que el gráfico coincide con la serie, los aportes, las lagunas, el
   corte 2025-12-31 y los valores de la tabla accesible.
3. Revisar ejes, etiquetas, unidades (CLP/USD), fecha de corte y separación de
   series (aportes vs portafolio).
4. Confirmar que no hay valores, fechas o retornos fabricados; que no parece una
   ilustración Imagegen; y que es legible a 1200×630, 800×420, 600×315 y 300 px.
5. Revisar que el texto alternativo (`heroImageAlt`) describe el gráfico.

## Entregable esperado

- **PASS/FAIL** con hallazgos concretos y, si aplica, la corrección exacta.
- Si es **FAIL**: el render/instrucciones corregidas usando el script
  `data-render` reproducible (no Imagegen), con la serie y la tabla accesible
  actualizadas si cambian.
- Si es **PASS**: los metadatos para agregar a `asset-reviews.json`:
  ```json
  {
    "status": "accepted",
    "reviewedAt": "YYYY-MM-DD",
    "reviewedBy": "chatgpt/data-render-review",
    "method": "Data-render verification against the article series and accessible table; not an Imagegen illustration.",
    "note": "Hallazgos y alcance de la revisión."
  }
  ```

## Restricciones

- No usar Imagegen.
- No cambiar el artículo, la ruta, el slug ni el `heroImageAlt` sin una corrección
  editorial separada.
- No mergear ni registrar `asset-reviews.json` hasta que el veredicto vuelva.
- Si el gráfico actual no coincide, la corrección se genera en la sesión de
  ChatGPT y luego se integra en un PR de imágenes.
