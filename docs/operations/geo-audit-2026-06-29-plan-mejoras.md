# Plan de mejoras SEO/GEO — monedario.cl

**Fecha**: 2026-06-29
**Herramienta**: geo-opt v2.0.0
**Alcance**: homepage live + 54 archivos de glosario + robots.txt + sitemap

---

## Resumen ejecutivo

La infraestructura técnica del sitio está en buena forma. La homepage aprueba todos los
controles fundamentales (title, canonical, headings, enlaces internos, texto visible). El
robots.txt tiene una separación limpia entre crawlers de búsqueda (permitidos) y de
entrenamiento (bloqueados). Las oportunidades de mejora se concentran en:
1. Consistencia de datos estructurados en la homepage
2. Contenido del glosario (los archivos fuente `.md` no reflejan la calidad de las
   páginas renderizadas)
3. Verificación de extremo a extremo sobre URLs renderizadas reales

---

## Quick wins (bajo esfuerzo, impacto visible)

### QW-1: Unificar descripciones JSON-LD en homepage

- **Hallazgo**: La homepage emite 2 descripciones distintas en bloques JSON-LD:
  - `"Decisiones financieras en Chile basadas en matemáticas y la ley vigente: calculadoras con fórmulas verificables y guías citadas a la fuente legal."`
  - `"Finanzas personales para chilenos. Guías sobre AFP, APV, impuestos, inversiones y calculadoras prácticas."`
  - Ninguna coincide exactamente con el texto visible de la página.
- **Impacto**: Google y otros motores pueden considerar esto inconsistente. La
  herramienta marcó 2 mismatches de `structured_data_text_consistency`.
- **Acción**: Elegir UNA descripción canónica y usarla en todos los bloques
  `Organization`/`WebSite`. Idealmente que coincida con el H1 o subtitle visible.
- **Archivos**: `src/components/` — buscar bloques `@type: Organization` o `WebSite`
  que inyecten `description`.
- **Verificación**: `geo-opt technical --url https://monedario.cl --format json |
  jq '.findings[] | select(.ruleId == "technical.structured_data_text_consistency")'`

### QW-2: Agregar `datePublished` y `dateModified` al JSON-LD de homepage

- **Hallazgo**: El schema de tipo `Article` generado para la homepage no incluye
  fechas. La herramienta no las inventa (correcto), pero el contenido real de la
  homepage sí tiene fechas de actualización visibles ("Actualizado abr 2026", etc.).
- **Acción**: Si la homepage tiene un bloque `Article` o `WebSite`, agregar
  `dateModified` con la fecha del último cambio visible.
- **Verificación**: `geo-opt schema <file> article | jq '.["@graph"][-1]'`

---

## Mejoras de contenido (esfuerzo medio)

### CM-1: Verificar la calidad renderizada de las páginas de glosario

- **Contexto**: Los archivos fuente `.md` del glosario obtuvieron scores GEO bajos
  (31–35/100, banda "At Risk"). Esto es esperable: son archivos de datos con
  frontmatter YAML, no el HTML final que ve un crawler.
- **Lo que falta en el fuente** (y probablemente sí está en la página renderizada):
  - H1 con el término del glosario
  - Enlaces externos a fuentes oficiales (leyes, CMF, SBIF, etc.)
  - Fechas de publicación/revisión
  - Expansión de siglas en primera ocurrencia
- **Acción**: Ejecutar auditoría sobre 3–5 URLs renderizadas de glosario:
  ```bash
  geo-opt technical --url https://monedario.cl/glosario/uf/ \
    --url https://monedario.cl/glosario/afp/ \
    --url https://monedario.cl/glosario/dicom/ \
    --format json
  ```
- **Decisión**: Si las páginas renderizadas tienen score >50, no es necesario modificar
  los fuentes `.md`. Si están <50, priorizar agregar H1, enlaces a fuentes y fechas.

### CM-2: Agregar sección de fuentes en páginas de glosario

- **Hallazgo**: 0 enlaces externos en los 54 archivos de glosario. Esto penaliza
  fuertemente en las dimensiones `citations` (0/20) y `statistics` (2/20).
- **Acción**: Para cada entrada de glosario, agregar 1–3 enlaces a fuentes oficiales
  chilenas:
  - Leyes: `https://bcn.cl/...`
  - CMF: `https://cmfchile.cl/...`
  - SBIF: `https://sbif.cl/...`
  - SII: `https://sii.cl/...`
  - IPS: `https://ips.gob.cl/...`
- **Formato sugerido en el frontmatter**:
  ```yaml
  sources:
    - label: "Ley Nº 19.728"
      url: "https://bcn.cl/..."
    - label: "Superintendencia de Pensiones"
      url: "https://spensiones.cl/..."
  ```
- **Impacto estimado**: +10–15 puntos en dimensión `citations`.

### CM-3: Expandir siglas en el contenido del glosario

- **Hallazgo**: Siglas como AFC, AFP, IPC, FCS, CIC, CAEC aparecen sin expandir en
  varios archivos. La herramienta lo penaliza en la dimensión `clarity` (-2 a -5 pts).
- **Acción**: Asegurar que cada sigla se expanda en su primera ocurrencia dentro del
  cuerpo del texto (no solo en el frontmatter), incluso si el `shortDefinition` ya lo hace.
- **Verificación**: Revisar que `geo-opt audit` no reporte `content.acronym_clarity` en
  los archivos modificados.

### CM-4: Agregar fechas explícitas a los archivos de glosario

- **Hallazgo**: `contentFreshness` muestra `publishedDate: null, reviewedDate: null` en
  todos los archivos.
- **Acción**: Agregar al frontmatter:
  ```yaml
  published: 2026-04-01
  reviewed: 2026-06-15
  ```
- **Impacto**: La herramienta actualmente no asigna puntuación directa a fechas, pero
  habilita el finding `v2.observations.freshness` que contribuye a la evaluación
  general del perfil.

---

## Mejoras técnicas (esfuerzo mayor)

### TM-1: Auditar todo el sitio con URLs renderizadas

- **Contexto**: `geo-opt technical --sitemap` tiene un bug conocido (no recorre
  sitemap indexes). Para auditar el sitio completo, hay que usar `--url` por página.
- **Acción**: Generar una lista de URLs representativas (~20) y ejecutar auditoría:
  ```bash
  # 1 homepage
  # 3 calculadoras emblemáticas
  # 5 artículos de blog
  # 3 guías hub
  # 3 glosario
  # 2 leyes
  # 3 páginas estáticas (metodología, acerca-de, autor)
  ```
- **Producto**: Un JSON agregado con hallazgos por tipo de página.

### TM-2: Verificar hreflang (solo si hay planes de multilenguaje)

- **Hallazgo**: La herramienta reporta `missing_self_reference` en hreflang. Para un
  sitio monolingüe esto es un falso positivo — no requiere acción.
- **Acción**: Solo si en el futuro se agrega contenido en otros idiomas (inglés,
  portugués), implementar hreflang con auto-referencia.

---

## Verificación de cierre

Al completar las mejoras, ejecutar:

```bash
# Homepage
geo-opt technical --url https://monedario.cl --format json | jq '.findings[] | select(.status == "warn")'

# Robots.txt
geo-opt robots audit <(curl -s https://monedario.cl/robots.txt) --format json

# Glosario renderizado (spot check)
geo-opt technical --url https://monedario.cl/glosario/uf/ \
  --url https://monedario.cl/glosario/afp/ \
  --url https://monedario.cl/glosario/dicom/ --format json

# Score agregado del contenido local
geo-opt audit src/data/glossary/ --recursive --summary --format json
```

### Criterios de éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Structured data mismatches en homepage | 2 | 0 |
| Score promedio glosario (v2) | 33.9 | >45 |
| Enlaces externos por entrada de glosario | 0 | ≥2 |
| Siglas sin expandir por archivo | 2–3 | 0 |
| Fechas de contenido en glosario | 0% | 100% |

---

## Notas

- Este plan se basa en auditoría con `geo-opt` v2.0.0 ejecutada el 2026-06-29.
- Los scores del glosario reflejan archivos fuente `.md`, no las páginas renderizadas
  por Astro. Las páginas reales probablemente obtengan mejor puntuación.
- El bug del sitemap index en geo-opt impide usar `--sitemap` directamente contra
  `sitemap-index.xml`. Se reportó por separado al equipo de la herramienta.
