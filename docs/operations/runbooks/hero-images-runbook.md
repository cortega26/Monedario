# Hero Images Runbook

Actualizado: 2026-09-30. Sistema: `monedario-editorial-v5`.

La operación sigue [Editorial Image System](../../../context/EDITORIAL_IMAGE_SYSTEM.md)
y el [ADR de entrega](../../adr/ADR-20260930-editorial-image-delivery.md).
Generación y selección son acciones explícitas; build/CI solo transforman assets
locales y verifican contratos. La curación puede delegarse a un agente autorizado.
Los gráficos YMYL conservan auditoría independiente y firma humana.

## Artefactos y responsabilidades

| Artefacto | Función |
| --- | --- |
| `scripts/hero-images/manifest.json` | Texto editorial y huellas de los inputs. |
| `scripts/hero-images/briefs.json` | Necesidad, promesa, mensaje, escena y revisión por slug. |
| `scripts/hero-images/prompts.json` | Prompt final único y hashes de fuente/brief/prompt. |
| `scripts/hero-images/sources/<slug>.webp` | Fuente seleccionada lossless, preparada a 1200 × 630. |
| `scripts/hero-images/asset-reviews.json` | Procedencia, selección e historial de revisión. |
| `public/images/hero/<slug>.avif` | Canónico de compatibilidad y validación. |
| `src/generated/editorial-images.json` | Mapa de entrega por slug, hashes, dimensiones y bytes. |
| `public/images/editorial/<slug>/<hash>.*` | Assets servidos con nombre derivado de sus bytes. |

`status.json` solo describe operación; no certifica procedencia ni calidad.
No editar manualmente manifiestos generados para ocultar diferencias.

## 1. Actualizar y revisar el brief

```bash
node scripts/hero-images/scan-articles.mjs
```

Para refrescar únicamente el input de prompts, usar `--manifest-only`. Revisar el
artículo completo, título, bajada y `articleLead`. Actualizar el brief con
`readerNeed`, `editorialPromise`, `visualMessage`, `scene`, `requiredElements`,
`avoidInterpretations`, `alt`, `promptTrack`, `styleVersion` y revisión. El
`sourceContentHash` debe corresponder al texto actual; aprobarlo requiere lectura,
no copiar una huella nueva sobre un brief viejo sin comprobar su significado.

Un brief ausente, sin revisar o desfasado bloquea la siguiente etapa. Los catálogos
A/B/C antiguos sirven al pool histórico, no al routing de artículos v5.

```bash
node scripts/hero-images/build-prompts.mjs
node scripts/check-hero-prompts.mjs
```

El workspace `/dev/hero-images/` muestra y copia exactamente `entries[].prompt`.
Las notas P0, objetivos de revisión e historial no se concatenan al texto. Si se
necesita cambiar la escena, editar el brief y regenerar el prompt primero.

## 2. Generar, comparar y seleccionar

1. Usar el prompt final con la herramienta de generación autorizada; conservar
   el original de la respuesta y su referencia. No ejecutar generadores en CI.
2. Revisar el candidato con el artículo, la promesa y las portadas vecinas.
   Comprobar miniatura de 300 px, anatomía, objetos, recortes y ausencia de falsas
   implicaciones. Registrar por qué se acepta o rechaza.
3. Preparar el recorte seleccionado a 1200 × 630 y conservarlo como WebP lossless
   en `scripts/hero-images/sources/`. Archivar el PNG original en
   `output/hero-images/visual-v5/`; no sobrescribir la evidencia de un rechazo.
4. Registrar en `asset-reviews.json` estilo, fuente editorial, prompt final y hash,
   fuente raster y hash, canónico seleccionado y hash, fecha/responsable/criterios
   de revisión e historial de candidatos rechazados.
5. Producir el canónico AVIF dentro de 81.920 bytes. Conservar `heroImage` por slug
   y añadir `heroImageAlt` solo cuando la ilustración aporta información útil.

Los prompts únicos no garantizan imágenes distintas: comparar también los assets.
Una cara no es obligatoria; un avatar decorativo no resuelve un brief débil.
Las entradas `data-render` siguen un renderer de datos y su revisión independiente.

Para `image-edit`, conservar la referencia bajo `scripts/hero-images/references/`
y registrar `referenceImagePath`/`referenceImageHash`. Inspeccionar la referencia
y ejecutar sólo la modificación delimitada en el prompt de preservación; no
aplicar por defecto el estilo de las ilustraciones nuevas. Comparar antes/después
para comprobar que los elementos protegidos mantienen forma, posición y mensaje.

La corrección autorizada de primer empleo preserva su ilustración plana y elimina
únicamente bandas laterales. Su vía determinista usa `sharp`; registrar esa
operación real y sus parámetros en la procedencia/preparación, sin presentarla
como salida de Imagegen porque el plan mencione ese modelo. Mantener los hashes
de referencia, fuente resultante y canónico, y revisar también a 300 px. Los
controles técnicos no autorizan ampliar la edición a rediseño de la escena.

## 3. Construir y comprobar la entrega

```bash
pnpm run check:image-curation
node scripts/hero-images/build-delivery.mjs --dry-run
node scripts/hero-images/build-delivery.mjs
pnpm run check:image-delivery
pnpm run check:hero-images
```

La fuente WebP de una revisión `accepted` se usa cuando sus hashes concuerdan
con el registro y el canónico. Una discrepancia bloquea; los assets heredados sin
fuente usan su canónico AVIF.
Cada conjunto contiene hero 1200 × 630, tablet 800 × 420, móvil 600 × 315 y un
JPEG social 1200 × 630, todos de la misma fuente seleccionada. El `sourceHash`
del manifiesto de entrega identifica esa fuente raster; no el texto editorial.

`--dry-run` informa diferencias. `--check` verifica sin mutar manifiesto ni assets.
`--force` fuerza el render determinístico. `generate-og-jpegs.mjs` delega en esta
misma entrega; no genera OG de `@mobile`/`@tablet` como si fueran artículos.
No usar mtime para decidir si una imagen sigue vigente.

Los componentes leen el manifiesto y sirven URLs con hash bajo
`/images/editorial/`; las rutas canónicas siguen disponibles. Conservar versiones
anteriores: HTML cacheado puede seguir refiriéndolas. Los manifiestos anteriores
se guardan en `output/hero-images/delivery-manifests/<sha>.json`.

Las tarjetas con título dentro del enlace usan alt vacío. Los gráficos deben
mantener una descripción y tabla accesible en el artículo. Verificar hero, cards,
relacionados y metadata OG en el sitio renderizado, incluyendo móvil.

## 4. Validación para integrar

Ejecutar tests focalizados de prompts/entrega, `check:hero-prompts`,
`check:image-curation`, `check:image-delivery`, `check:hero-images` y
`check:frontmatter`. Los gates de prompts y curación preceden al build; CI y
`check:ci` comprueban también la entrega. Para cerrar el cambio completo, seguir
`check:ci`, build y comprobaciones de rutas/RSS del plan.
Revisar la galería antes/después. Un gate técnico verde no es una aprobación
semántica ni una auditoría financiera.

Los candidatos de interés compuesto viven en
`output/hero-images/compound-review/`; su
[paquete pendiente](../../editorial/audits/visual-interest-compound-20260929/00-scope.json)
no autoriza reemplazar `public/`. La leyenda publicada describe una curva y
aportes mensuales: debe revisarse junto con la gráfica cuando se complete el
ciclo independiente. No marcar gates humanos ni `PASS` desde la sesión autora.

## 5. Medición proporcional

Definición y lectura: [medición v5](../../reports/REPORT-visual-v5-measurement-2026-09-30.md).

Reutilizar el recolector first-party, su sanitización y exportes semanales R2.
Contrato canónico de eventos: `src/contracts/analytics-events.ts`.

- `editorial_image_impression`: imagen cargada, pestaña visible y al menos 50%
  de su área en viewport durante 1 segundo continuo. Un clic temprano con 50%
  visible registra primero una impresión por interacción explícita; por tanto,
  el denominador incluye esa excepción y no implica siempre 1 segundo.
- `editorial_image_click`: activación de tarjeta/relacionado tras una impresión
  registrada o esa interacción temprana. El hero sin enlace no emite clic.
- Dimensiones: `article_slug`, `image_surface`, `image_version`, `device_class`,
  más `page_type`/`app_version`. Superficies: `article_card`, `related_posts`,
  `article_hero`. La versión usa `img-xxxx-xxxx-xxxx-xxxx` derivada de 16 hex del
  hash del hero, compatible con el filtro anti-PII.
- Clase de viewport fijada al iniciar la vista: móvil <768 px, tablet 768–1023,
  desktop ≥1024. No es identificación del dispositivo físico.
- Deduplicación en memoria por vista DOM, slug, superficie y versión. Sin
  cookies, identificador persistente ni unión entre visitas.

Comparar 28 días completos por artículo/superficie/clase/versión/tipo de página.
Mostrar los conteos y `clics / impresiones` como razón de eventos; separar hero,
que no tiene numerador de clics. Los exportes conservan el esquema compatible:
para estos eventos, la columna histórica `calculator_id` contiene el slug del
artículo; interpretar siempre junto con `event_name`.

`article_scroll_depth` mantiene hitos 25/50/75/100 y añade versión/contexto del
hero; mide progreso del documento entero, no comprensión, tiempo activo ni
retención de usuarios. Los datos anteriores sin denominador/versionado no se
convierten retrospectivamente en una tasa comparable. Iniciar baseline válido
con la instrumentación, indicar cambios simultáneos y no atribuir causalidad a
un antes/después. Con poco tráfico, declarar evidencia insuficiente y conservar
la revisión cualitativa. No introducir otra plataforma de analítica.

## 6. Diagnóstico y rollback

| Síntoma | Acción |
| --- | --- |
| Brief desfasado | Leer cambios del artículo, revisar decisión y actualizar evidencia. |
| Prompt copiado distinto | Corregir builder/workspace; no añadir un segundo prompt a notas. |
| Imagen intercambiable o mensaje incorrecto | Revisar escena/elementos/interpretaciones del brief y generar otro candidato. |
| Fuente o canónico no coinciden con revisión | Restaurar la selección trazada o registrar una revisión real; no silenciar el hash. |
| OG o responsive viejo | Reconstruir entrega desde la fuente seleccionada y comprobar bytes/hashes. |
| AVIF >80 KiB | Ajustar compresión conservando legibilidad; revisar el resultado. |
| Variante sin registro | Usar fallback existente; no inventar un srcset. |
| Gráfico sin serie trazable | Mantener candidato pendiente; no interpolar ni certificar el ejercicio. |

Para revertir una selección, restaurar su fuente, canónico y registro de revisión
concretos desde Git/copia previa, reconstruir entrega y ejecutar los checks. No
revertir cambios ajenos ni borrar assets versionados aún referenciables. No hacer
rollback global de `status.json` como sustituto de restaurar las imágenes.
