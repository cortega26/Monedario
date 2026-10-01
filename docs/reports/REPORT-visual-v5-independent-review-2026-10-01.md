# Revisión independiente de entrega y analítica visual v5

Fecha de verificación: 2026-10-01, 12:49, America/Santiago.
Base Git: `c07166be418fb72bebd78beabd3b73e21f5d8e08`, con cambios de trabajo concurrentes.
Estado: revisión técnica acotada; integración pendiente. No autoriza publicación.

## Alcance e independencia

Contraste del [plan aprobado](../backlog/PLAN-renovacion-visual-editorial-2026-09-29.md)
y del [ADR de entrega](../adr/ADR-20260930-editorial-image-delivery.md) con:

- Entrega local por contenido, selección de originales, variantes, OG y caché.
- Resolución de URLs y metadatos de presentación en artículos y tarjetas.
- Exposición visible, clics, deduplicación, límites del payload y conservación de dimensiones en el recolector.

El revisor implementó el generador de prompts y sus briefs, pero **no implementó
los módulos de entrega y analítica aquí revisados**. Para este corte inspeccionó
estructura con CodeGraph, diffs y pruebas, sin modificar código, imágenes,
prompts ni artículos. La única escritura de esta revisión es este informe.
La revisión del generador propio no se presenta como independiente.

Esta es una revisión técnica de spec frente a implementación, no una auditoría
YMYL ni una validación de datos financieros. No sustituye la auditoría separada
de gráficos ni los gates humanos de publicación. Se mantienen Constitución
§§1 y 4.1, `URL.PUBLIC.NO_POST_ID` e
`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.

## Resultado y hallazgo material

No se identificó un nuevo fallo material de código en el alcance inspeccionado.
Las pruebas focalizadas cubren los contratos principales y pasan. **No se
recomienda cerrar todavía el plan completo**, porque la entrega real está pendiente:

| Hallazgo | Evidencia observada | Efecto | Remedio y aceptación |
| --- | --- | --- | --- |
| Integración pendiente: manifiesto sin entradas | `src/generated/editorial-images.json` contiene cero imágenes; `build-delivery.mjs --check` reporta los 54 artículos pendientes. | El resolvedor usa el fallback canónico, sin srcset, OG versionado ni `image.version`. Las superficies no emiten eventos visuales válidos con ese fallback. | Tras cerrar la curación, ejecutar `pnpm run images:build-delivery`; conservar manifiesto y derivados; repetir `check:image-delivery`, build e inspección de URLs/OG. La aceptación requiere 54 entradas vigentes y cero pendientes. |

Es un trabajo aún no integrado, no una regresión oculta ni una razón para
regenerar las imágenes automáticamente. Al corte hay 15 selecciones aceptadas
en `asset-reviews.json`; esa cantidad puede cambiar durante la ejecución del lote.

La omisión de registros en el gate de curación fue comunicada previamente al
integrador. Este corte ejecutó el gate real corregido y obtuvo conformidad.
La revisión y sus pruebas de regresión están detalladas en el
[informe técnico complementario](REPORT-visual-v5-technical-review-2026-09-30.md).
No se mantiene ese hallazgo anterior como abierto.

## Contratos comprobados

La entrega enumera artículos por slug, selecciona la fuente WebP aceptada o el
canónico conservado y rechaza hashes incompatibles. Todos los derivados parten
de la misma fuente. El render conserva dimensiones 1200×630, 800×420 y 600×315,
y aplica el presupuesto de 81.920 bytes al AVIF. Genera un JPEG social por
artículo; no usa las variantes como nuevas entradas OG. Los tests comprueban
fuentes modificadas con mtime intacto, archivos corruptos y un canónico que no
puede reproducirse desde su supuesto original aceptado.

Las URLs contienen el hash de los bytes. La entrega no borra versiones anteriores
y guarda el manifiesto previo cuando cambia. Los tests verifican esa retención
en el workspace. Para una entrega portable se deben incluir las versiones
necesarias y conservar los snapshots del lote: `output/hero-images/` está ignorado
por Git y no debe asumirse archivado o desplegado automáticamente. La existencia
de un snapshot local no demuestra por sí sola que otro checkout pueda restaurarlo.

El resolvedor devuelve hero, srcset, OG y versión desde el mismo manifiesto.
Card y relacionados reservan proporción 1200×630; el alt vacío evita repetir el
título que ya integra el enlace. El hero permite `heroImageAlt` opcional y no
inventa una descripción a partir del título. La clasificación de un gráfico
como informativo y su descripción/datos accesibles siguen siendo obligaciones
editoriales, no se deducen del fallback vacío.

La analítica observa el elemento imagen, exige carga y pestaña visible, aplica
≥50% de exposición durante un segundo continuo y reinicia el tiempo al ocultarse.
El clic temprano suficientemente visible registra primero una impresión por
interacción explícita, conforme al ADR. Deduplica por vista DOM, artículo,
superficie y versión; limpia listeners y timers antes del reemplazo Astro.
No incorpora identificadores persistentes. La versión corresponde al asset,
y la clase de dispositivo es una clasificación del viewport al iniciar la vista.

Los eventos de imagen exigen artículo, versión, superficie y clase de viewport
válidos. El recolector conserva esas dimensiones mediante el formato escapado,
reutilizando la columna histórica `calculator_id` para la identidad pública del
artículo. Los tests del contrato y export cubren esa compatibilidad. Debe
interpretarse siempre junto al nombre del evento, como documenta el ADR.

La comparación de ventanas de 28 días es observacional. Al desplegar a la vez
instrumentación e imágenes nuevas no existe un denominador previo equivalente:
la primera ventana establece baseline v5. No se infieren usuarios, retención
longitudinal, lectura atenta ni causalidad desde estos conteos.

## Evidencia ejecutada por este revisor

| Comprobación | Resultado |
| --- | --- |
| Nueve archivos Vitest de entrega, resolvedor, tracker, sanitización, transporte y recolector | 248 tests aprobados; 10,34 s |
| `node scripts/hero-images/build-delivery.mjs --check` | No conforme: 54 pendientes, manifiesto vacío |
| `node scripts/check-image-curation.mjs` | Conforme en los registros actuales |
| `pnpm exec tsc --noEmit -p workers/analytics-collector/tsconfig.json` | Cero errores |
| Build completo, CI completa y verificación visual en navegador | No ejecutados por esta revisión; corresponden al cierre de integración |

Comando reproducible de las pruebas:

```sh
pnpm exec vitest run \
  tests/scripts/image-delivery.test.ts \
  tests/utils/editorialImages.test.ts \
  tests/integration/analytics-images.test.ts \
  tests/integration/analytics-sanitizer.test.ts \
  tests/integration/analytics-utils.test.ts \
  tests/integration/analytics-script.test.ts \
  tests/workers/analytics-collector/root-cause.test.ts \
  tests/workers/analytics-collector/schema.test.ts \
  tests/static-analysis/analytics-emitters.e2e.test.ts
```

El tracker se verificó en happy-dom con IntersectionObserver controlado. Esa
prueba cubre transiciones lógicas, no sustituye la comprobación visual de recortes
y carga real en móvil/desktop. La revisión se mantuvo acotada a los contratos
modificados; no constituye una auditoría exhaustiva del sistema analítico.

Huellas SHA-256 de los módulos revisados en este corte:

| Archivo | SHA-256 |
| --- | --- |
| `scripts/hero-images/delivery.mjs` | `781f0638e9f02b8a49f0510d3c280d1d861946316abcba00d17b8d711438216e` |
| `src/utils/editorialImages.ts` | `417590204b4354dc4b5fb9959280d868e369b10e1121b1488d3e3500524cfe71` |
| `src/scripts/analytics.ts` | `5c3ce30a3680003ea56dad65760934b1b916590b5e02605248f4582d7aa7f5c1` |
| `src/contracts/analytics-events.ts` | `ae5f59e8200daac17be8db59b5787956783f5741bb85035aa85b9537a501fb42` |
| `workers/analytics-collector/src/worker-v2.ts` | `cb78a5a72581e29f93cdb48a5121616c9b6845088c6cb68402e5174541f592c0` |

## Recomendación de cierre

Aceptar esta revisión técnica acotada como segunda revisión de entrega y
analítica, manteniendo abierto el cierre del plan hasta:

1. Terminar curación y construir la entrega real; verificar correspondencia de originales, canónicos, variantes y OG.
2. Completar galería comparativa y revisión de tarjetas de 300 px, móvil, escritorio y vista social; comprobar textos alternativos de imágenes informativas.
3. Ejecutar CI/build completos y gates de rutas/RSS sin cambios públicos, y conservar evidencia de rollback reproducible por lote.
4. Mantener separado el paquete de gráficos financieros y su auditoría/firma humana. Este informe no autoriza publicar esos candidatos.

El recolector Worker se despliega por separado del sitio. La ventana de medición
empieza cuando el contrato compatible y la instrumentación estén efectivamente
activos; aprobar tests locales no demuestra recepción en producción. No se
realizó despliegue ni se midió uplift en esta revisión.
