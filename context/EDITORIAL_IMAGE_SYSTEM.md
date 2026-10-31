# Editorial Image System

Last updated: 2026-09-30\
Status: Active\
Version: 5.0 — `monedario-editorial-v5`

## 1. Objetivo y autoridad

Cada imagen debe ayudar a reconocer la situación del artículo, distinguirlo de
los artículos vecinos y acompañar una lectura clara y confiable. Engagement,
continuidad y comprensión son objetivos que se evalúan; una dirección de arte no
prueba por sí sola que hayan mejorado.

Aplica a portadas, miniaturas, imágenes sociales y gráficos de artículos. La
fuente editorial es el texto completo. La autoridad sigue siendo Constitución >
AGENTS > context > código. Esta versión sustituye las reglas visuales de v2–v4;
el historial se conserva en Git, no como un segundo catálogo obligatorio.

Decisión técnica: [ADR de entrega editorial](../docs/adr/ADR-20260930-editorial-image-delivery.md).
Operación: [Hero Images Runbook](../docs/operations/runbooks/hero-images-runbook.md).
Plan de renovación: [2026-09-29](../docs/backlog/PLAN-renovacion-visual-editorial-2026-09-29.md).

## 2. Dirección visual v5

Ilustración editorial con formas claras, proporciones naturales, papel cálido,
profundidad moderada por superposición y sombras suaves. Las caras simplificadas
y la textura sutil son opcionales. Una persona solo pertenece a la imagen cuando
su acción aporta significado: manos, objetos, comparaciones y mecanismos pueden
resolver mejor algunos artículos.

| Función | Color base |
| --- | --- |
| Estructura y contraste | Navy `#16324f` |
| Acción y relación | Teal `#0d9488` |
| Fondo claro | Papel `#f5f1e8` |
| Acento contenido | Terracota `#c77b55` |

Los tonos de piel pueden variar. La paleta une el conjunto; no obliga a pintar
cada fondo con el color de una categoría. Una misma familia de artículos debe
conservar parentesco visual y permitir escenas distintas.

Reglas de composición:

- Una acción o relación principal. Los objetos de apoyo explican esa relación.
- Siluetas distinguibles, espacio libre y una jerarquía que funciona a 300 px.
- Sujeto esencial dentro del 85% central; revisar los recortes reales.
- Alternar escenas, manos/objetos, comparaciones y mecanismos según el brief.
- La portada acompaña título y bajada; no tiene que explicar sola una norma o
  distinción financiera precisa sin palabras.

Rechazar anatomía deformada, objetos imposibles, UI ilegible, sellos oficiales
inventados, logos, marcas de agua, marcos negros, alarmismo y promesas visuales de
riqueza garantizada. Las ilustraciones generativas no llevan cifras ni texto.
Datos, fórmulas y rótulos informativos se componen por código con fuentes
verificables (§7).

## 3. Alineamiento editorial → texto → imagen → mensaje

Antes de aprobar un brief, leer el artículo completo o una extracción estructurada
que abarque todo su cuerpo. Identificar la necesidad del lector, la promesa
concreta del artículo y la interpretación equivocada que conviene evitar.

El flujo vigente es:

```text
artículo completo → brief revisado → prompt final → candidato
→ revisión de imagen y mensaje → asset seleccionado → derivados
```

`scripts/hero-images/briefs.json` conserva por slug:

- `readerNeed`, `editorialPromise`, `visualMessage` y `scene`;
- `requiredElements` y `avoidInterpretations`;
- `alt`, `promptTrack`, `styleVersion` y `generationMethod` cuando corresponde;
- `sourceContentHash` y `review` con estado, fecha, responsable y método.

El hash editorial cubre título, descripción, `articleLead` y cuerpo completo, con
normalización de saltos de línea y extremos. Un cambio en esos inputs requiere
nueva revisión; cambiar solo la fecha no constituye una revisión semántica.
Los briefs ausentes, sin revisar o desfasados bloquean la construcción y el gate
de prompts, también para los borradores incluidos en el manifiesto.

Los tracks A/B/C describen el recurso compositivo: escena, híbrido y mecanismo.
No obligan a incluir una persona ni restringen escenas a un catálogo cerrado.
Los modelos antiguos en `config.mjs` conservan compatibilidad con el pool
histórico; no deciden la imagen de un artículo nuevo o renovado. Metadatos y
keywords pueden ayudar a explorar, pero nunca aprueban una selección.

## 4. Prompt único y generación explícita

El prompt operativo es `entries[].prompt` de `scripts/hero-images/prompts.json`.
Su hash SHA-256 identifica exactamente el texto mostrado, copiado y validado.
Las notas de revisión y prioridades del workspace no se añaden al copiar.

El artefacto conserva `briefHash`, `sourceContentHash`, `styleVersion` y el método
de generación. Una edición creativa del prompt vuelve al brief y al builder antes
de generar; no se mantiene un prompt alternativo oculto en notas o clipboard.

La generación puede ser manual o realizada por un agente cuando el usuario la ha
autorizado. En esta renovación autorizó también la curación. Cada candidato se
inspecciona antes de seleccionarlo; un prompt válido no certifica su resultado.
Build, CI y trabajos programados solo ejecutan transformaciones determinísticas
y controles: no llaman generadores ni requieren secretos de generación.

El workspace `/dev/hero-images/` es una herramienta de desarrollo. Las entradas
`generationMethod: data-render` siguen el renderer correspondiente, no una llamada
a Imagegen. Los antiguos comandos automáticos de generación no son una vía
alternativa para saltarse revisión.

La vía `generationMethod: image-edit` conserva una ilustración existente mediante
una edición delimitada. Exige `referenceImagePath` bajo
`scripts/hero-images/references/` y `referenceImageHash` SHA-256; builder, gate y
workspace validan la referencia. Su prompt contiene la instrucción de preservación
y el canvas, sin añadir el estilo generativo v5. La referencia original permanece
separada de la nueva fuente seleccionada.

En primer empleo, el alcance es eliminar las bandas laterales extendiendo el
fondo teal, conservando persona, puerta, maletín, proporciones y paleta plana.
Una corrección mecánica autorizada puede ejecutarse con una transformación
determinista. El registro debe declarar la herramienta realmente usada —`sharp`
en esta corrección—, sus parámetros y hashes de entrada/salida. El prompt y
`modelPlan` describen lo previsto; no prueban una ejecución de Imagegen ni deben
usarse para atribuirle una transformación local.

## 5. Curación y trazabilidad

Revisar el candidato con su artículo, título/bajada, brief y portadas vecinas.
La revisión debe registrar una razón concreta para aceptar o rechazar:

| Criterio | Evidencia de aceptación |
| --- | --- |
| Relevancia | Representa la necesidad y promesa dominante del artículo. |
| Interpretación | No sugiere un beneficio, obligación o resultado incorrecto. |
| Claridad | La acción y el foco se reconocen en miniatura. |
| Diferenciación | No es intercambiable con una portada vecina. |
| Ejecución | Anatomía, documentos, perspectiva y recortes son coherentes. |
| Identidad | Paleta y tratamiento pertenecen al conjunto v5. |

Conservar las fuentes seleccionadas nuevas en `scripts/hero-images/sources/<slug>.webp`,
a 1200 × 630 con codificación lossless; el PNG original de generación se
archiva en `output/hero-images/visual-v5/`. `scripts/hero-images/asset-reviews.json` registra
prompt final y hash, hash de la fuente editorial, estilo, archivo fuente y su
hash, hash del asset seleccionado, revisión e historial de candidatos rechazados.
No inventar procedencia para imágenes heredadas: identificarlas como conservadas
con procedencia histórica incompleta cuando corresponda.

El estado operativo de `status.json` no sustituye esa evidencia. La existencia de
un archivo ni la ausencia de errores en CI significan aprobación semántica.
Una aprobación delegada de arte por un agente tampoco equivale a firma humana
para publicación YMYL.

## 6. Entrega, caché y formatos

| Uso | Dimensiones | Formato |
| --- | --- | --- |
| Hero canónico | 1200 × 630 | AVIF |
| Variante tablet | 800 × 420 | AVIF |
| Variante móvil | 600 × 315 | AVIF |
| Imagen social por slug | 1200 × 630 | JPEG |
| Fuente seleccionada de nuevas ilustraciones | 1200 × 630 | WebP lossless |

Cada AVIF final debe pesar como máximo 81.920 bytes. Conservar la relación 40:21;
no aplicar por norma un recorte 16:9 que los componentes no usan. Los originales
y los JPEG sociales tienen funciones distintas del AVIF de entrega.

No existe un endpoint dinámico de OG por post (`/posts/<slug>/index.png`): la
imagen social es siempre un asset estático del manifiesto o `/images/og/`.

El frontmatter mantiene `heroImage: /images/hero/<slug>.avif`. La entrega
usa la fuente WebP lossless de una revisión `accepted` en
`asset-reviews.json`, validando su hash y el del canónico; una discrepancia bloquea
la entrega, sin fallback silencioso. Hero, tablet, móvil y OG salen de esa misma
fuente. Para imágenes conservadas sin ese original, usa el AVIF canónico.
`src/generated/editorial-images.json` resuelve assets para los componentes, con
dimensiones, bytes y hashes. Su `sourceHash` identifica los bytes de la fuente
realmente usada; no es el `sourceContentHash` editorial.

Los nombres servidos incorporan el hash de sus bytes. Los cambios de contenido
producen nuevas URLs compatibles con caché `immutable`; no se decide vigencia por
mtime. Las rutas canónicas permanecen por compatibilidad y validación. No derivar
URLs desde `post.id` ni construir variantes por sustitución de extensiones si no
existen en el manifiesto.

La fuente raster seleccionada permanece separada del canónico comprimido. Una
revisión futura parte de la fuente lossless cuando está disponible, evitando
acumular recodificaciones de AVIF.

## 7. Gráficos y accesibilidad

Una ilustración puede ser decorativa. Un gráfico que expresa información
financiera necesita datos trazables, unidades, fecha, límites y un renderer
reproducible. No pedir a un generador que dibuje cifras exactas ni completar una
serie desconocida para alcanzar un resultado deseado.

Para interés compuesto, los candidatos en
`output/hero-images/compound-review/` muestran solo hitos documentados. La
transcripción y la conversión de moneda no certifican la simulación original.
Su [paquete independiente](../docs/editorial/audits/visual-interest-compound-20260929/00-scope.json)
permanece pendiente. No reemplazar la gráfica pública ni su leyenda antes de
completar el ciclo de auditoría y revisión humana.

`heroImageAlt` es opcional y describe información relevante que aporta el hero.
Cuando la imagen es decorativa, el alt es vacío. En una tarjeta cuyo enlace ya
contiene el título, la miniatura redundante lleva `alt=""`. Un enlace compuesto
solo por imagen requiere un nombre accesible. Esta distinción sigue la guía
[WAI sobre imágenes funcionales](https://www.w3.org/WAI/tutorials/images/functional/).

Los gráficos incluyen descripción breve y explicación/tabla accesible con sus
datos esenciales en el artículo, siguiendo
[WAI sobre imágenes complejas](https://www.w3.org/WAI/tutorials/images/complex/).
Actualizar imagen, leyenda, datos y alternativa textual como una misma revisión.

## 8. Verificación y medición

El runbook contiene comandos y diagnóstico. `check:hero-prompts` y
`check:image-curation` preceden al build; CI y `check:ci` incluyen además
`check:image-delivery`. Los controles técnicos deben cubrir
briefs y hashes vigentes, igualdad del prompt final, assets presentes, dimensiones,
presupuesto, coherencia de derivados y resolución de URLs. La revisión visual
completa esos controles; no la sustituye un score automático de presencia humana.

El [protocolo de medición](../docs/reports/REPORT-visual-v5-measurement-2026-09-30.md)
define denominadores, baseline y tráfico bajo. La medición usa el recolector
propio y contadores agregados. Comparar ventanas
observacionales de 28 días, con versiones y superficies compatibles. Impresiones
cualificadas y clics son eventos; no son personas ni retención longitudinal.
No introducir cookies, IDs persistentes, fingerprint ni seguimiento entre visitas.

Registrar volúmenes y cambios simultáneos de texto, posición, tráfico o temporada.
Con tráfico escaso, informar evidencia insuficiente, mantener la comparación
cualitativa y evitar declarar una mejora causal. Claridad se evalúa también por
correspondencia texto-imagen y lectura en miniatura; no se infiere de clics solos.

## 9. Referencias y adaptación explícita

Fuentes consultadas el 2026-09-30. NN/g observa atención a imágenes relevantes
para la tarea frente a relleno visual. Aplicarlo a ilustración financiera es una
hipótesis local, no una demostración de uplift para Monedario.
[Photos as Web Content](https://www.nngroup.com/articles/photos-as-web-content/).

Declaración conforme a la política de adaptación competitiva:

- `benchmarkSet`: NN/g citado; guías WAI de imágenes funcionales y complejas.
- `patternHypothesis`: la relevancia de la imagen y una alternativa textual
  adecuada ayudan a reconocer y comprender el contenido.
- `localDelta`: escenas ligadas a necesidades financieras chilenas, variedad
  compositiva, gráficos trazables y derivados coherentes desde un único asset.
- `nonCopyBoundaries`: no copiar ilustraciones, copy, identidad de terceros ni
  usar benchmarks como fuente de afirmaciones YMYL.
- `ownerTarget`: artículos existentes y sus cards/hero/OG; ninguna URL indexable
  nueva ni cambio de ownership editorial.
- `successSignal`: mejor comprensión en revisión cualitativa y evolución
  observacional favorable de eventos comparables, sin degradar accesibilidad,
  rendimiento ni exactitud.
