# Contrato de inteligencia externa (Semrush / Ahrefs / control-plane)

Fecha: 2026-10-01 · Estado: pendiente de licencia
(`MON-ENV-DATA3a`, bloqueado desde 2026-04-25) · Consumidor:
Growth Engine (`docs/operations/GROWTH-ENGINE.md`)

Los detectores de GSC solo ven queries donde Monedario **ya aparece**. La
inteligencia externa aporta la dimensión que falta: demanda no cubierta,
competencia, features de SERP y autoridad. Este documento define qué pedir,
cómo llega y qué restricciones aplican.

## 1. Estado y canal

- La suscripción Ahrefs con API quedó **bloqueada por licencia**
  (`ADR-20260416-external-data-signals.md`, `PHASE_2_DATA_SIGNALS.md`).
- Intento verificado 2026-10-01: Semrush responde `no_api_units` (sin
  unidades API) y Ahrefs responde `Insufficient plan`. No hay extracción
  pagada disponible por ahora (registrado en el control-plane:
  `action_monedario_external_intelligence`, revisión 2).
- **Vía libre (Fase 0.1, activa):** `source: "free"` con
  `competitorPages` obtenidas de sitemaps públicos de competidores
  (`pnpm run growth:collect:competitors`). Sin volumen ni dificultad: sirve
  para descubrir gaps de cobertura, no para priorizar por demanda.
- **Vía libre, SERP (manual, desde 2026-11-25):** `pnpm run growth:collect:serp`
  captura el SERP de Google Chile con el plan gratuito de SerpApi (250
  búsquedas por ciclo mensual; reserva de 30). Corridas fijas lunes y jueves y
  cierre del ciclo, con lote adaptativo (`--auto --run`). Escribe
  `serpFeatures` (volumen y CTR propios desde GSC en ventana de 28 días,
  funciones del SERP) con `freeSources: ["serpapi-google-cl"]`, que consume el
  detector `serp_feature_risk`. Con el excedente repite las consultas clave en
  móvil. Ejecución **local** (manual o con el timer `systemd --user` de
  `ops/serp/`), nunca desde CI. Detalle,
  viabilidad y criterio de salida: `runbooks/serp-snapshot.md`.
- Si el owner habilita Semrush y/o Ahrefs, el **control-plane** (operador
  automatizado del portafolio) es el canal preferido: recolecta y entrega el
  archivo semanal normalizado. Monedario no llama a las APIs pagadas desde
  CI.
- Sin archivo, los detectores externos se omiten con
  `external_data_unavailable`; el motor sigue operando con GSC + first-party.

## 2. Almacenamiento y licencia

- Ruta: `output/external-intelligence/<YYYY-Www>.json` (**gitignoreado**,
  nunca se commitea crudo).
- `license: "internal-only"`: uso interno de decisión; no se publica, no se
  redistribuye y no entra a prompts de terceros.
- Los reportes derivados (`output/validation/growth-opportunities/`) también
  son ignorados por git; solo las decisiones aprobadas se documentan en el
  repo.

## 3. Esquema mínimo (normalizado)

```json
{
  "source": "semrush | ahrefs | control-plane",
  "week": "2026-W39",
  "retrievedAt": "2026-10-01T12:00:00Z",
  "license": "internal-only",
  "keywordGaps": [
    {
      "query": "cuanto es la multa por no pagar patente",
      "volume": 1200,
      "difficulty": 35,
      "cpc": 0.8,
      "intent": "informational | transactional | navigational",
      "competitors": ["sii.cl", "contable.app"],
      "serpFeatures": ["ai_overview", "featured_snippet"]
    }
  ],
  "competitorGaps": [
    {
      "query": "reajuste arriendo ipc",
      "volume": 900,
      "difficulty": 40,
      "ourUrl": "https://monedario.cl/posts/reajuste-arriendo-uf-ipc-chile/",
      "ourPosition": 12.5,
      "competitor": "competidor.cl",
      "competitorPosition": 2,
      "serpFeatures": ["ai_overview"]
    }
  ],
  "serpFeatures": [
    {
      "query": "valor utm hoy",
      "volume": 800,
      "ourCtr": 0.004,
      "features": ["ai_overview"]
    }
  ]
}
```

Reglas del esquema: agregados ES-CL; ventana de 28 días; sin datos de
usuario; `volume` y `difficulty` en la escala nativa del proveedor
(documentarla en `source`); listas ordenadas por volumen; máximo 200 filas
por lista.

### Fuente libre (`source: "free"`)

Además de las listas de proveedor, el archivo puede traer la cobertura de
competidores obtenida de sitemaps públicos:

```json
{
  "source": "free",
  "freeSources": ["competitor-sitemaps"],
  "competitorPages": [
    { "domain": "valor-utm.cl", "url": "https://valor-utm.cl/valor-utm-hoy" }
  ],
  "engineQueries": [
    {
      "engine": "bing",
      "query": "reajuste anual uf",
      "clicks": 1,
      "impressions": 1,
      "ctr": 1.0,
      "position": 5
    }
  ]
}
```

- `engineQueries`: estadísticas de queries del sitio en otro motor (Bing
  Webmaster Tools, `pnpm run growth:collect:bing`). Sirven para detectar
  demanda visible en Bing/Copilot que GSC no muestra.
- `volume`/`difficulty` pueden ser `null` o estar ausentes en modo libre; los
  detectores `competitor_sitemap_gap` y `cross_engine_query` no los requieren.
- Los competidores se configuran en `src/config/competitors.json` (editable
  por el owner). Solo se leen sitemaps públicos (`<loc>`), sin scraping de
  páginas.
- Si conviven proveedor y fuentes libres, se preservan las listas del
  proveedor y `freeSources` acumula las fuentes usadas.

## 4. Solicitud concreta al control-plane

> Necesito, para el proyecto Monedario.cl, un archivo semanal normalizado
> al esquema de `docs/operations/EXTERNAL-INTELLIGENCE-CONTRACT.md` con
> prioridad en:
>
> 1. **Keyword gaps ES-CL** (Semrush/Ahrefs): queries con volumen ≥300,
>    dificultad ≤60 y sin URL propia de Monedario; incluir competidores
>    top-3 y features de SERP.
> 2. **Competitor gaps**: queries donde un competidor está en top-3 y
>    Monedario tiene URL propia en posición >8; incluir `ourUrl`.
> 3. **SERP features / AI Overview** en queries con impresiones o volumen
>    relevante (riesgo zero-click y oportunidad GEO).
> 4. **Backlinks / referring domains**: dominios de referencia del
>    competidor que no enlazan a Monedario (proxy de autoridad), si el plan
>    lo permite.
> 5. **Visibilidad de marca en IA** (GEO): menciones/citas de Monedario en
>    respuestas de IA y en AI Overviews, si el plan lo expone.
>
> Restricciones: uso interno; no publicar URLs de competidores en el sitio;
> el archivo es insumo de decisión, no autoridad (ver §5). Si la licencia
> no cubre algún punto (p. ej. API de backlinks), entregar los puntos
> disponibles y marcarlo en el archivo.

## 5. Guardrails de uso

- `INVARIANT.STRATEGY.EXTERNAL_PATTERNS_NON_AUTHORITATIVE`: los patrones
  externos jamás reemplazan fuentes oficiales, contratos públicos ni
  políticas canónicas. Monedario no copia contenido de competidores.
- `COMPETITIVE_ADAPTATION_POLICY`: toda adaptación debe declarar la mejora
  local y el límite de no-copia.
- Los datos externos priorizan; la fuente de verdad de una afirmación sigue
  siendo la fuente primaria (SII, BCN, DT, etc.).
- FOCO ESTRICTO: un `content_gap_query` no autoriza publicar; requiere
  excepción de URL aprobada por el owner.
- Uso interno: nada de datos pagados en issues públicos, PRs o reportes
  versionados.

## 6. Detectores que consume

| Detector | Insume | Tier |
|---|---|---|
| `content_gap_query` | `keywordGaps` | A3 |
| `competitor_gap_query` | `competitorGaps` | A3 |
| `serp_feature_risk` | `serpFeatures` | A0 (observación) |
| `competitor_sitemap_gap` | `competitorPages` (fuente libre) | A0 (observación) |
| `cross_engine_query` | `engineQueries` (Bing Webmaster, fuente libre) | A0 (observación) |

Umbrales en `src/config/growth-opportunity-registry.json`.
