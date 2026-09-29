# Auditoría adversarial de SEO técnico y arquitectura de descubrimiento — monedario.cl

Actúa como un **Technical SEO Lead, Information Retrieval Engineer y crawler adversarial**.

Tu objetivo es encontrar defectos observables desde producción que limiten crawling, indexación, canonicalización, distribución de autoridad interna, descubrimiento de páginas, comprensión temática por buscadores y mantenimiento de una arquitectura escalable.

No hagas una auditoría SEO genérica ni repitas UX/UI. Concéntrate en problemas técnicos y estructurales verificables desde `https://monedario.cl`.

## 1. Crawl e inventario

Descubre tantas URLs públicas como sea razonablemente posible mediante:

- home;
- navegación;
- footer;
- enlaces internos;
- sitemap;
- robots.txt;
- hubs;
- categorías;
- artículos;
- calculadoras;
- páginas relacionadas;
- feeds o índices visibles.

Para cada URL registra cuando sea posible:

- status HTTP;
- URL final;
- redirect chain;
- canonical;
- robots meta;
- title;
- meta description;
- H1;
- enlaces entrantes/salientes internos;
- profundidad desde home;
- tipo/template;
- indexabilidad aparente.

Normaliza variantes de URL para detectar duplicados.

## 2. Indexabilidad

Busca:

- páginas valiosas bloqueadas;
- páginas irrelevantes indexables;
- `noindex` inesperados;
- canonicals incorrectos;
- canonical hacia URL no equivalente;
- canonical chains;
- canonical a página no indexable;
- conflictos entre robots.txt y meta robots;
- URLs parametrizadas duplicadas;
- variantes slash/no-slash;
- HTTP/HTTPS;
- mayúsculas/minúsculas;
- redirects evitables.

Verifica, cuando corresponda:

`URL estratégica → 200 → canonical válida → indexable`

## 3. Sitemap y robots

Audita sitemap(s):

- URLs inválidas;
- redirects;
- 404/5xx;
- páginas no indexables incluidas;
- páginas indexables relevantes ausentes;
- `lastmod` sospechoso;
- cobertura por tipo.

Compara:

`URLs crawlables ∩ URLs sitemap`

Audita `robots.txt` buscando bloqueos accidentales, rutas relevantes, referencia a sitemap y contradicciones con los objetivos aparentes del sitio.

## 4. Arquitectura de enlaces internos

Construye un grafo dirigido:

`página A → página B`

Calcula aproximadamente:

- in-degree;
- out-degree;
- profundidad;
- componentes débiles;
- páginas huérfanas;
- páginas casi huérfanas;
- nodos excesivamente dominantes;
- páginas estratégicas con poca autoridad interna.

Si es viable, calcula PageRank interno aproximado.

Pregunta:

> ¿La arquitectura real refleja las prioridades del producto?

Busca páginas de alto valor que:

- requieran demasiados clics;
- reciban pocos enlaces;
- solo sean accesibles por sitemap;
- dependan de rutas profundas.

## 5. Anchors

Analiza:

- anchors vacíos;
- “aquí”, “ver más” y similares;
- anchors ambiguos;
- anchors inconsistentes para la misma página;
- enlaces fuera de contexto;
- páginas relevantes sin enlaces contextuales.

Distingue navegación estructural de linking editorial.

## 6. Metadata

Audita:

- titles duplicados o casi duplicados;
- titles/H1 vacíos;
- mismatch title/H1/contenido;
- meta descriptions duplicadas;
- OpenGraph;
- metadata social;
- canonicals;
- fechas publicadas/modificadas cuando apliquen.

No penalices mecánicamente longitudes. Evalúa impacto real.

## 7. Datos estructurados

Descubre y valida JSON-LD/schema:

- sintaxis;
- tipos;
- coherencia con contenido visible;
- breadcrumbs;
- Article;
- FAQ;
- WebSite;
- Organization;
- otros tipos relevantes.

Busca markup inválido, inconsistente, heredado donde no corresponde o que describa contenido inexistente.

## 8. HTTP, redirects y errores

Busca:

- chains;
- loops;
- 404 internas;
- soft 404;
- 5xx;
- URLs inexistentes con 200;
- trailing slash inconsistente;
- enlaces internos a redirects.

Idealmente, los enlaces internos deben apuntar a la URL final.

## 9. Duplicación y canibalización observable

Detecta páginas con:

- títulos casi idénticos;
- H1 similares;
- contenido sustancialmente solapado;
- intención aparente equivalente;
- variantes innecesarias.

No concluyas “canibalización” solo por similitud: separa hecho observable de interpretación.

## 10. Hubs y clusters

Para cada cluster temático:

- identifica hub;
- identifica páginas hoja;
- comprueba hub → hoja;
- hoja → hub;
- relaciones laterales relevantes;
- orphan leaves;
- consistencia semántica de anchors.

Busca clusters que existan editorialmente pero no estructuralmente.

## 11. Severidad

- **P0:** pérdida masiva de indexabilidad/crawling de páginas críticas.
- **P1:** canonicalización, redirects, estructura o linking con impacto significativo.
- **P2:** defecto técnico real de alcance limitado.
- **P3:** hygiene u optimización menor.

Estado: `CONFIRMED`, `PROBABLE`, `HYPOTHESIS`.

## 12. Entregable

### Executive summary

### Cobertura
URLs descubiertas/crawladas, indexables, no indexables, redirects, errores y templates.

### Findings

| ID | Severidad | Estado | URL/patrón | Problema | Evidencia | Impacto SEO | Causa probable | Fix | Validación |
|---|---|---|---|---|---|---|---|---|---|

### Grafo interno
Incluye páginas con mayor in-degree, páginas estratégicas con bajo in-degree, páginas profundas, huérfanas y subgrafos débiles.

### Sitemap vs crawl

### Canonical/indexability matrix

### Quick wins

### Fixes sistémicos

### Regression checks
Convierte findings importantes en checks automatizables.

## 13. Reglas

- No uses scores SEO genéricos como sustituto de evidencia.
- No penalices por supersticiones SEO.
- Distingue requisito técnico de preferencia.
- No confundas correlación con causalidad.
- Busca primero problemas sistémicos.
- Reporta URLs exactas.
- Prioriza aquello que pueda impedir descubrimiento o indexación real.

Pregunta final:

> **¿Existe contenido valioso en Monedario que los buscadores tengan razones técnicas o estructurales para descubrir, comprender o priorizar peor de lo necesario?**
