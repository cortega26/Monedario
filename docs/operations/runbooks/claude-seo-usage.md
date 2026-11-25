# Uso de claude-seo en Monedario

Fecha de corte: 2026-11-25

## Objetivo

Definir cómo se usa el plugin [claude-seo](https://github.com/AgriciDaniel/claude-seo) (v2.5.0) como **capa de análisis bajo demanda** sobre el flujo SEO existente. No reemplaza ningún workflow ni gate del repo.

## Qué NO cambia

- `data-signals`, `weekly-search-ops`, Growth Engine (nivel A0, solo reporte), `repo-doctor`, el postbuild, el freeze de URLs y el pipeline editorial YMYL siguen siendo la fuente de verdad.
- claude-seo corre dentro de una sesión de Claude. No es un motor de cron y no se ejecuta desde CI (`EXTERNAL-INTELLIGENCE-CONTRACT.md`: sin APIs de pago desde CI; `CRITERIO_VIABILIDAD.md`).
- Toda salida del plugin es un **hallazgo heurístico**, no una autorización para editar ni publicar.

## Comandos permitidos

| Comando | Cuándo | Notas |
|---|---|---|
| `/seo drift baseline\|compare <url>` | Antes y después de un deploy que toque SEO, schema, robots o sitemap; revisión semanal de páginas dueñas | Ver "Páginas con valores dinámicos" |
| `/seo google` (GSC, URL Inspection, CrUX) | Contraste de datos GSC frescos; CWV de campo | Requiere credenciales (ver abajo) |
| `/seo agentic <url>` | Revisión mensual GEO (junto con `geo-files-review`) | El puntaje Lighthouse X/N necesita API key de PSI |
| `/seo geo <url>` | Revisión mensual GEO; reemplaza al CLI ad hoc `geo-opt` | Audita la página renderizada, no los `.md` fuente |
| `/seo sxo <url> <keyword>` | Contexto SERP en revisiones de experimentos CTR | Solo lectura; la búsqueda web es US-only (ver limitaciones) |
| `/seo page` / `/seo technical` | Revisión puntual de una URL | Sustituye a las skills genéricas `seo`, `web-quality-audit` y `marketing:seo-audit` para análisis de una página |
| `/seo audit` | Solo puntual y con justificación | Lanza hasta 17 agentes: es lo más caro en tokens |

## Excluidos (y por qué)

- `/seo cluster execute`, `/seo programmatic`, `/seo competitor-pages generate`: crean contenido o URLs a escala y chocan con el freeze de URLs y el pipeline YMYL. `cluster plan` y `content-brief` solo como insumo.
- `humanize` (limpieza de borradores): reescribe prosa regulada.
- `image-gen`, `images optimize`, `local`, `maps`, `ecommerce`: sin caso de uso en Monedario.
- `hreflang`: el sitio es monolingüe `es_CL`.
- DataForSEO, Ahrefs, Firecrawl, SE Ranking, Profound: de pago y sin brecha de datos registrada. Primero se documenta una brecha concreta que el flujo del repo no pueda responder.
- Indexing API: solo aplica a JobPosting/BroadcastEvent. Se usan URL Inspection y sitemaps.
- GA4: el repo usa analítica first-party.
- `llms.txt` como palanca: ya existe y el propio plugin le asigna peso 0; Google indica que no lo necesita.

## Cómo entran los hallazgos

1. Un hallazgo del plugin entra solo como candidato en la revisión semanal / Growth Engine, con su evidencia.
2. Si implica texto YMYL: pipeline editorial completo, con sesiones separadas y firma humana.
3. Si implica una URL indexable nueva: excepción en `docs/governance/url-freeze-exceptions.json`. Mientras no haya decisión registrada tras la revisión del 2026-11-02, el freeze se trata como vigente.
4. Si implica un cambio material en contenido publicado: registro en `src/data/correcciones.json`.

## Credenciales (fuera del repo)

- Configuración local en `~/.config/claude-seo/` con permisos 0600: `google-api.json` (`service_account_path`, `default_property`) y la clave de la service account.
- Propiedad GSC: `sc-domain:monedario.cl` (la misma de `scripts/data-signals/gsc-inspect.mjs`). Scope: `webmasters.readonly`, que cubre Search Analytics, Sitemaps y URL Inspection.
- La clave de la service account sale de `GOOGLE_APPLICATION_CREDENTIALS_JSON` (`.env.local`). Nunca se copia al repo ni a CI.
- API key de GCP `claude-seo-local` (proyecto `monedario-494500`), restringida a PageSpeed Insights y Chrome UX Report, guardada como `api_key` en `google-api.json`. Sin ella, PSI devuelve 429 por cuota anónima. Para rotarla: crear una nueva con las mismas restricciones, reemplazar el campo y borrar la anterior en la consola.
- Para auditar `astro preview` local: `CLAUDE_SEO_LOCAL_TARGETS=localhost:4321`.

## Higiene de salidas

- Ejecutar los comandos que escriben archivos (`/seo audit`, `cluster`, `google report`) desde el scratchpad de la sesión o desde `output/external-intelligence/` (gitignoreado, `internal-only`). Nunca commitear salida cruda.
- Los reportes del plugin añaden un pie promocional: quitarlo antes de compartir.
- Los baselines de drift viven en `~/.cache/claude-seo/drift/baselines.db` (global por usuario, no por proyecto).

## Páginas con valores dinámicos

En páginas con valores diarios o mensuales (UTM, UF, dólar), `/seo drift compare` marcará `title_changed`, `meta_description_changed`, `schema_modified` y `content_hash_changed` en cada cambio de valor. No es una regresión: se interpreta contra el valor oficial, o se toma un baseline nuevo tras cada actualización.

## Limitaciones conocidas

- `WebSearch` es US-only: el contexto SERP de `/seo sxo` no es el de Google Chile. No sustituye una revisión SERP manual en es-CL.
- Sin API key de PSI no hay fracción Lighthouse Agentic Browsing.
- El ledger de actualizaciones de Google del plugin (`seo_updates.py`) puede estar desactualizado: el reporte indica `stale`.

## Piloto 2026-11-25 (resumen)

| Prueba | Resultado |
|---|---|
| Drift `conversor-utm` | 0 críticos, 3 advertencias, 1 informativo; todos atribuibles al cambio mensual de la UTM |
| Valor UTM noviembre 2026 | Producción = tabla SII ($72.440) |
| GSC vía plugin | Autentica con la service account; lista `sitemap-index.xml` (186 URLs enviadas, 0 errores) |
| `/seo agentic` en la home | Sin P0 en falla; Lighthouse Agentic Browsing 3/3 (móvil y escritorio); Agent-UX 100/100; Content-Signal y Markdown ausentes (informativos) |
| CrUX del origen (25 semanas) | Móvil: LCP p75 1.156 ms, INP 112 ms, CLS 0. Escritorio: LCP 1.105 ms, INP 60 ms, CLS 0. Todo dentro de "bueno" |
| Hallazgo para triage | `data-signals.yml` falló en el paso "Commit data signals" los días 12, 19 y 23 de noviembre: `main` rechaza el push directo (GH006, requiere PR) |

## Revisión de continuidad

Decisión mantener / desactivar el plugin tras dos ciclos semanales, con el criterio del work-state `claude-seo-monedario`: al menos un hallazgo nuevo, reproducible y aceptado frente a Growth Engine y data-signals, y coste de tokens medido (always-on estimado 4.666 tokens por sesión).
