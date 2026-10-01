# Revisión técnica de la renovación visual v5

Corte principal: 2026-09-30, 20:52–20:55, America/Santiago.
Informe consolidado: 2026-10-01. Base Git: `e3a244a4`, con cambios de trabajo
concurrentes. Este documento describe una implementación en curso; no certifica
el cierre del plan ni autoriza publicación.

## Alcance e independencia

Spec: [plan aprobado](../backlog/PLAN-renovacion-visual-editorial-2026-09-29.md).
Se revisaron contratos de entrega, consumidores, metadatos, instrumentación,
curación y su integración con los gates. Se inspeccionaron las tres hojas de
contacto del inventario original de 54 portadas. La edición de esta revisión se
limita a este informe: no se cambiaron assets, prompts, artículos ni cálculos.

El agente revisor implementó entrega y analítica: sus pruebas son verificación
del implementador y **no constituyen revisión independiente de esos módulos**.
La inspección de prompt/curación, implementados por otros agentes, sí aporta
una segunda revisión técnica. Este trabajo no es auditoría YMYL, no valida
series financieras y no sustituye la separación de funciones o firma humana.
Se respetan Constitución §§1 y 4.1, `URL.PUBLIC.NO_POST_ID` e
`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.

## Resultado del corte

El código de entrega y medición satisface los casos focalizados verificados.
La ejecución completa todavía no satisface la aceptación: el manifiesto
`src/generated/editorial-images.json` tiene cero entradas y el gate de entrega
reporta 54 artículos pendientes. Hay nueve selecciones aceptadas registradas y
45 portadas todavía conservadas al momento del inventario. El trabajo posterior
puede modificar esas cantidades; no deben interpretarse como estado final.

| Verificación ejecutada | Resultado observado |
| --- | --- |
| Diez archivos Vitest de entrega, curación y analítica | 252 tests aprobados, 12,17 s |
| `pnpm run check:hero-prompts` | 54 artículos, estilo `monedario-editorial-v5`, conforme |
| `pnpm run check:image-curation` | Conforme; corrección de cobertura revalidada el 2026-10-01 |
| `node scripts/check-hero-images.mjs` | 54 artículos publicados conformes con contrato compatible |
| `pnpm exec astro check` | 625 archivos; cero errores, advertencias o hints |
| `pnpm exec tsc --noEmit -p workers/analytics-collector/tsconfig.json` | Sin errores |
| `pnpm run check:image-delivery` | Falla esperada por entrega aún no construida: 54 pendientes |
| Regresión de curación, 2026-10-01 01:16 | Ocho tests aprobados; gate real conforme |
| `pnpm run check:docs` y Prettier del informe | Conformes |
| Build completo, CI completa, rutas/RSS después del build | No ejecutados por esta revisión |

Comando de pruebas reproducible:

```sh
pnpm exec vitest run \
  tests/scripts/image-curation.test.ts \
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

## Contratos contrastados con la implementación

### Fuente y entrega

`delivery.mjs` enumera artículos por slug; no recorre derivados ni genera OG de
`@mobile` o `@tablet`. Para una selección `accepted`, utiliza el WebP lossless
1200×630 de `scripts/hero-images/sources/` y verifica sus bytes y los del canónico
contra el registro. El AVIF resultante debe coincidir con el aprobado. Una fuente
cambiada o un canónico desincronizado bloquean la construcción. Los tests cubren
cambios de bytes aun conservando mtime y una fuente/registro que no reproduce el
hero aceptado. Para imágenes conservadas sin selección, usa el AVIF canónico.

Hero, tablet, móvil y OG proceden de esa misma fuente. Las dimensiones son
1200×630, 800×420 y 600×315; AVIF máximo 81.920 bytes. El OG JPEG es uno por
artículo. El renderer exige encuadre inicial correcto; el build no decide un
nuevo recorte editorial. No hay llamadas generativas o de red en esta entrega.

El manifiesto tiene `schemaVersion: 1`, `recipeVersion: 1` y entradas por slug
con `sourcePath`, `sourceHash` y `assets.hero|tablet|mobile|og`. Cada asset declara
`src`, `hash`, `width`, `height`, `bytes`. Las URLs incorporan SHA-256 completo
de los bytes y los canónicos permanecen. La detección de vigencia compara
contenido; no fechas del filesystem. Se conservan archivos versionados previos
y snapshots anteriores del manifiesto para rollback y HTML cacheado.

`resolveEditorialImage` sirve URL, srcset, OG y versión desde el manifiesto.
La versión expuesta en DOM usa los primeros 16 hex del hero. Sin entrada, el
fallback usa una ruta existente y no inventa derivados; tampoco ofrece versión
medible. Por eso el manifiesto vacío es una condición pendiente real, aunque el
sitio pueda renderizar con el fallback.

### Integración y gates

Los scripts públicos son `images:build-delivery`, `check:image-delivery` y
`check:image-curation`. `og:jpegs` delega en la entrega completa. `build` y
`build:ci` ejecutan prompts y curación antes de crear imágenes/sitio. `check:ci`
y `.github/workflows/ci.yml` incluyen los gates de curación y entrega. La CI
comprueba entrega antes de convertir imágenes, por lo que necesita el manifiesto
y derivados vigentes preparados en el cambio.

`check:images` tiene efectos de escritura: ejecuta conversión y generación.
Para este corte se usó el chequeo directo `check-hero-images.mjs`; no se presentó
esa inspección de canónicos como validación de todos los derivados.

### Presentación y metadatos

Card y relacionados usan el resolvedor, dimensiones reservadas y srcset.
Relacionados pasa a proporción 1200×630. El alt vacío de una miniatura dentro
del enlace que ya incluye el título evita repetir el nombre del artículo.
El hero permite `heroImageAlt` opcional, máximo 500 caracteres; el fallback es
vacío. Ese fallback es apropiado para ilustraciones decorativas, pero no decide
por sí mismo que cualquier gráfico sea decorativo.

Al corte, los 54 frontmatters carecen de `heroImageAlt` y los 54 briefs tienen
alt vacío. El hero de `interes-compuesto-nota-metodologica` es informativo:
requiere alternativa textual específica y datos/descripción accesibles junto
con la corrección coordinada del gráfico. Esta revisión no modifica esa pieza
ni aprueba el candidato financiero. El criterio no debe reducirse a rellenar
los 54 campos con el título; cada portada debe clasificarse por su función.

## Revisión del inventario visual conservado

Los 54 canónicos actuales tienen 1200×630 y cumplen 80 KiB. No se encontraron
heroes idénticos byte a byte. Esto comprueba integridad geométrica y presupuesto,
no diversidad semántica ni ausencia de imágenes visualmente parecidas.

Las hojas de contacto originales inspeccionadas fueron
`/tmp/monedario-image-audit-1.png`, `/tmp/monedario-image-audit-2.jpg` y
`/tmp/monedario-image-audit-3.png`. Son evidencia local del estado anterior;
no representan una galería final de las selecciones nuevas ni se garantizan
como archivo persistente. El cierre debe usar la galería comparativa del plan.

La inspección visual respalda conservar como referencias de pertinencia las
portadas de honorarios, fraude de tarjeta, suplantación y migrantes. Su situación
es reconocible en miniatura. La portada existente de bancos/fintech también
comunica uso de servicios financieros mejor que la anterior clasificación
errónea del prompt como cesantía. Esto no implica copiar sus composiciones.

En el conjunto conservado hay deuda visual a vigilar sin ampliar automáticamente
el lote aprobado:

| Portada | Observación cualitativa | Tratamiento sugerido |
| --- | --- | --- |
| `fondo-emergencia-chile` | Frasco, monedas doradas y pilas ascendentes; el ahorro se entiende, pero conserva clichés que v5 retira. | Revisión futura al evaluar coherencia del conjunto; no requiere cambiar el claim. |
| `como-invertir-en-etfs-desde-chile` | Pantalla y curva verde ascendente dominantes. | Revisar si el encuadre induce expectativa de rendimiento; evitar leer la curva como resultado garantizado. |
| `como-calcular-sueldo-liquido` | Diagrama del mecanismo con figura humana auxiliar. | Puede mantenerse durante la transición; comprobar que un prompt nuevo preserve ese mecanismo sin instrucciones contradictorias. |

La inspección de píxeles detectó bandas negras de aproximadamente 127/128 px a
cada lado en `como-salir-boletin-comercial-chile`,
`indemnizacion-anos-de-servicio-chile` y `primer-empleo-chile-guia-completa`.
Ocupan aproximadamente 21% del ancho y reducen la escena útil. Los dos primeros
están en el lote de renovación; primer empleo tiene reparación explícita.
Hipotecario ya no presenta ese defecto en el canónico nuevo del corte.

Para primer empleo se localizaron canónico AVIF, variantes y OG, pero no un
original lossless con ese slug dentro del repositorio. No se puede describir
la recuperación como un recorte desde un original de mayor calidad disponible.
Debe registrarse con honestidad la fuente que se use para reparar el encuadre.
No se atribuyó obsolescencia por mtime: determinar si una portada está desfasada
exige contrastar el mensaje con el artículo, no su fecha de archivo.

## Hallazgos de segunda revisión técnica

1. **Resuelto antes del corte:** el workspace podía consultar un manifiesto de
   artículo anterior al texto actual al construir el prompt. Se comunicó al
   implementador y se corrigió la reutilización del artículo actual; Astro check
   terminó limpio. El gate de prompts compara los fingerprints actuales.
2. **Resuelto antes del corte:** los registros UF/IPC quedaron desactualizados
   tras ajustes de metadatos editoriales. El gate de curación detectó el drift;
   el integrador registró la nueva revisión y el gate volvió a pasar.
3. **Corregido y revalidado el 2026-10-01 a las 01:16:** el verificador recorría
   solamente las entradas presentes. Una fuente WebP cuya entrada desaparecía
   podía quedar fuera del chequeo y delivery volver al canónico. El integrador
   añadió cobertura inversa desde las fuentes WebP, validación estructural del
   registro y pruebas de regresión. Se revisó el cambio sin editarlo: ocho tests
   de curación y el gate sobre datos reales aprobaron. Las imágenes heredadas
   sin fuente seleccionada siguen admitidas sin inventar procedencia.

Los hashes comprueban correspondencia e integridad. No prueban que el mensaje
visual represente fielmente el artículo: sigue siendo necesaria la curación de
cada imagen y la revisión del lote como conjunto.

## Medición: contrato y límites

Se verificaron `editorial_image_impression` y `editorial_image_click` con
`article_slug`, `image_version`, `image_surface`, `device_class` y el contexto
existente. La impresión exige imagen cargada, pestaña visible y ≥50% del área
visible durante 1.000 ms continuos. Un clic temprano con ≥50% visible registra
primero impresión por interacción; esa excepción forma parte del denominador.
Sin exposición previa o suficiente visibilidad no se cuenta un clic visual.

La deduplicación es en memoria por vista DOM, slug, superficie y versión. Las
navegaciones Astro limpian observadores, timers y listeners. El hero no emite
clics. El dispositivo es una clase de viewport al inicio de la vista, no una
identidad: mobile <768, tablet <1024, desktop ≥1024. La versión analítica
`img-xxxx-xxxx-xxxx-xxxx` representa los mismos 16 hex del hash público y evita
falsos positivos de los filtros anti-PII existentes.

El export conserva `schemaVersion: 2`. Para estos eventos el slug ocupa la
columna histórica `calculator_id`; sus dimensiones permanecen codificadas con
nombres. Agrupar siempre por evento para no confundir artículos con calculadoras.
No se añadieron identificadores persistentes, cookies o una plataforma nueva.

`article_scroll_depth` sigue siendo profundidad del documento, incluyendo áreas
que no son el cuerpo del artículo. No debe llamarse lectura completada, atención
ni retención. Las razones de clics/impresiones son eventos agregados; el transporte
puede perder eventos y no identifica personas o cohortes. La definición de
ventanas equivalentes de 28 días y la ausencia de baseline histórica compatible
están en el [reporte de medición](REPORT-visual-v5-measurement-2026-09-30.md).
Si instrumentación y v5 se publican juntas, los primeros 28 días establecen una
baseline; no demuestran una mejora causal respecto de las imágenes anteriores.

## Condiciones que quedan para el cierre

- Completar curación del lote, reparación de primer empleo y galería final;
  inspeccionar cards de unos 300 px, móvil, escritorio y recorte social.
- Construir la entrega de 54 entradas, pasar `check:image-delivery` e inspeccionar
  srcset, OG y URLs con hash en el sitio construido. Conservar evidencia de rollback.
- Resolver la alternativa accesible del gráfico informativo junto con su flujo
  editorial autorizado; los candidatos numéricos no quedan aprobados aquí.
- Ejecutar los gates completos del plan, build y comprobaciones de rutas/RSS.
- Obtener segunda revisión de spec frente a entrega/analítica por un agente que
  no las implementó. Mantener separada la auditoría YMYL y la firma humana.

El [ADR de entrega](../adr/ADR-20260930-editorial-image-delivery.md) y el
[runbook](../operations/runbooks/hero-images-runbook.md) documentan los contratos
operativos. Este informe registra evidencia acotada, sin marcar gates humanos.
