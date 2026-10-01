# ADR-20260930-editorial-image-delivery

Date: 2026-09-30
Status: Accepted

## Context

La revisión visual encontró escenas genéricas, duplicados, gráficos desfasados y
prompts cuyo texto copiado incluía instrucciones distintas del texto validado.
Las URLs estables bajo caché `immutable` podían conservar una imagen anterior;
algunos derivados OG no correspondían al hero seleccionado. El generador
alternativo y la política visual mezclaban reglas incompatibles.

El usuario autorizó cambiar la dirección visual, regenerar y curar imágenes.
El plan `docs/backlog/PLAN-renovacion-visual-editorial-2026-09-29.md` delimita esa
renovación. La curación delegada no sustituye la auditoría independiente o la
firma humana de piezas YMYL.

Base constitucional: §§1 y 4.1 (alcance y contratos explícitos), §2.2
(transformaciones con I/O fuera del dominio), §7 (caché explícita), §9 (ADR para
cambios arquitectónicos). Se preservan `URL.PUBLIC.NO_POST_ID`,
`ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS` y
`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.

## Decision

### Dirección editorial y procedencia

Adoptar `monedario-editorial-v5`: navy/teal, papel cálido, formas naturales,
sombras suaves y personajes opcionales según la necesidad del lector. La
variedad compositiva se decide desde el artículo, no desde una keyword.

Un brief revisado conserva necesidad, promesa, mensaje, escena, elementos,
interpretaciones a evitar y hash del texto. El prompt final es único: mostrado,
copiado y validado byte a byte, con SHA-256 y versión de estilo. Los catálogos
históricos conservan compatibilidad con su pool, sin controlar nuevos briefs.
Build/CI nunca llaman servicios generativos.

La excepción `image-edit` permite preservar una ilustración existente con una
modificación delimitada y una referencia bajo `scripts/hero-images/references/`,
identificada por `referenceImagePath` y `referenceImageHash`. El prompt contiene
la instrucción de preservación y el canvas; no inyecta el estilo nuevo. Esta
excepción conserva la escena y no autoriza cambiar su mensaje editorial.

En primer empleo se conserva persona, puerta, maletín y paleta plana al corregir
las bandas laterales. La ejecución determinista autorizada con `sharp` se registra
como tal, con parámetros y hashes. El prompt y `modelPlan` son intención prevista,
no prueba del proveedor usado. La procedencia distingue esa operación local de
una generación mediante Imagegen.

La curación delegada a un agente registra su identidad y evidencia sin hacerse
pasar por firma humana. Las fuentes seleccionadas nuevas se conservan como WebP
lossless preparado a 1200×630; los PNG originales permanecen en el archivo de
trabajo. `asset-reviews.json` vincula prompt, fuente editorial, fuente raster,
canónico, hashes, revisión e historial de rechazos. No completar retrospectivamente
procedencia desconocida de imágenes heredadas con valores inventados.

### Entrega por contenido

Una revisión `accepted` selecciona la fuente WebP de la entrega. Validar el hash
de esa fuente y del canónico; comprobar que el render del hero corresponde al
asset aprobado antes de escribir. Los assets conservados sin revisión aceptada
usan su AVIF canónico como fuente. Un hash discrepante bloquea, no cae a un
fallback que disimule la inconsistencia.

Generar hero 1200×630, tablet 800×420, móvil 600×315 y un JPEG social 1200×630 por
artículo desde la misma fuente. AVIF máximo 81.920 bytes. No generar un OG por
cada archivo responsive. Conservar canónicos para compatibilidad y gates.

El manifiesto `src/generated/editorial-images.json` usa `schemaVersion: 1` y
`recipeVersion: 1`; cada entrada por slug declara `sourcePath`, `sourceHash` y
`assets.hero|tablet|mobile|og` con `src`, `hash`, `width`, `height`, `bytes`.
`sourceHash` es la huella de la fuente raster efectiva, separada de la del texto.
Las URLs servidas son `/images/editorial/<slug>/<hash>.<ext>`, con SHA-256 de los
bytes. Esa identidad hace explícita la invalidación bajo la caché `immutable`
existente y elimina decisiones de frescura por mtime.

Retener assets versionados antiguos y snapshots de manifiestos para que HTML
cacheado y rollback resuelvan sus referencias. Los consumidores obtienen srcset y
OG del manifiesto; el fallback usa un asset existente sin inventar derivados.
Se preservan slugs, rutas de artículos, canónicos SEO y RSS.

### Accesibilidad y gráficos

Añadir `heroImageAlt` opcional. Una miniatura redundante dentro del mismo enlace
que contiene el título usa alt vacío; la información adicional significativa
necesita texto alternativo. Los gráficos incluyen descripción y datos accesibles.

Los gráficos numéricos se renderizan por código con fuente compartida trazable.
No reconstruir una curva mensual inexistente ni ajustar parámetros para coincidir
con el headline. Los candidatos de interés compuesto permanecen fuera de
`public/` hasta completar auditoría independiente y revisión humana, junto con
la actualización coordinada de leyenda/alternativa textual.

### Medición sin identidad nueva

Ampliar el recolector existente con `editorial_image_impression` y
`editorial_image_click`, sin cookies, IDs persistentes ni cohortes personales.
Impresión normal: imagen cargada, pestaña visible y ≥50% visible durante un
segundo continuo. Un clic temprano con ≥50% visible registra primero impresión
por interacción explícita; ese caso integra el denominador.

Deduplicar en memoria por vista, slug, superficie y versión. Usar viewport
`device_class`, superficies acotadas y versión derivada del hash como
`img-xxxx-xxxx-xxxx-xxxx`. Los clics corresponden a cards/relacionados; el hero
no interactivo no emite clic. El scroll existente conserva semántica de progreso
del documento. El contrato y el runbook precisan los campos/exportes compatibles.

Comparar ventanas de 28 días como razones de eventos, con conteos y límites de
tráfico. No denominar el resultado retención longitudinal, conversión de personas
ni mejora causal atribuible a imágenes.

## Consequences

- La imagen seleccionada y su mensaje quedan revisables desde la fuente editorial
  hasta cada archivo servido. Actualizar texto o imagen exige nueva evidencia.
- La entrega evita derivados mezclados y caché obsoleta sin cambiar URLs de
  artículos. Requiere conservar fuentes, registros y varias versiones de assets.
- La generación sigue siendo variable; la curación explícita es parte del costo.
  Los hashes prueban identidad e integridad, no calidad semántica.
- Los contadores agregados permiten observación proporcional, con límites para
  tráfico bajo, atribución y análisis de personas.
- Reemplazar la especificación v4 completa elimina reglas contradictorias sobre
  rostros, escenas cerradas y formatos. El historial anterior queda en Git.

## Alternatives considered

- Cambiar solo prompts y sobreescribir archivos estables: mantiene la divergencia
  de derivados y el problema de caché.
- Aprobar imágenes mediante presencia humana o keywords: no verifica el mensaje.
- Automatizar generación dentro del build: introduce secretos, costo y variación
  sin revisión en una operación que debe ser determinística.
- Crear una plataforma de experimentación o identidad de usuarios: excede el
  alcance y la política de privacidad; no es necesaria para esta comparación.

## Verification

- Tests focalizados: brief/source drift, igualdad de prompt, integridad de fuente,
  byte hashes, derivados de una selección, fallback y metadatos accesibles.
- Tracker: visibilidad/duración, clic temprano, deduplicación, cambios Astro,
  pestaña oculta, payload permitido y export agregado.
- `check:hero-prompts`, `check:image-curation`, `check:image-delivery`,
  `check:hero-images`, `check:frontmatter`, `check:context`, `check:docs`,
  `check:audit-artifacts`. Prompts y curación se validan antes del build; la
  entrega se comprueba también en CI y `check:ci`.
- Cierre del plan: `check:ci`, build, rutas/RSS e inspección visual en 300 px,
  móvil, desktop y metadata OG. No confundir gates técnicos con firma YMYL.

Rollback: restaurar la selección y sus registros concretos, reconstruir entrega y
verificar; mantener los assets versionados previos. Los gráficos pendientes no
requieren rollback público porque no se integran en este cambio.

## Referencias y adaptación

Fuentes primarias consultadas el 2026-09-30:
[NN/g: Photos as Web Content](https://www.nngroup.com/articles/photos-as-web-content/),
[WAI: imágenes funcionales](https://www.w3.org/WAI/tutorials/images/functional/),
[WAI: imágenes complejas](https://www.w3.org/WAI/tutorials/images/complex/).
NN/g informa la hipótesis de relevancia; WAI informa alternativas textuales.
Ninguna de esas fuentes demuestra uplift de esta renovación.

Los campos obligatorios `benchmarkSet`, `patternHypothesis`, `localDelta`,
`nonCopyBoundaries`, `ownerTarget` y `successSignal` están declarados en
`context/EDITORIAL_IMAGE_SYSTEM.md` §9. La adaptación afecta superficies existentes,
con identidad local y sin copiar texto, imágenes o claims YMYL externos.
