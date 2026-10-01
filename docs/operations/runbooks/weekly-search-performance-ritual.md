# Weekly Search Performance Ritual

Fecha de corte: 2026-07-16

## Objetivo

Convertir el acceso ya restaurado a Google Search Console, Bing Webmaster y los eventos analíticos del sitio en un loop semanal corto, repo-driven y accionable.

Este ritual no busca construir un BI paralelo. Busca responder todas las semanas:

- qué keywords o landings ganaron o perdieron;
- qué hubs, artículos o calculadoras merecen refresh;
- dónde falta empujar mejor el siguiente paso;
- qué alertas de indexación/cobertura necesitan seguimiento;
- qué cambios editoriales o de packaging conviene hacer primero.

## Modo operativo actual

El ritual ahora es **híbrido e issue-driven**:

- workflow programado: `.github/workflows/weekly-search-ops.yml`
- bundle estándar: `output/operations/weekly-search-performance/<week>/`
- scorecard por script: `scripts/build-weekly-search-report.mjs`
- soporte apps/MCP: `docs/operations/runbooks/apps-mcp-operations.md`

Si no existen exports para la semana, el workflow igual deja issue + checklist + bundle inicializado. El workflow usa la **última semana ISO completa** (la misma referencia que `data-signals.yml`) y, si ya existen JSON repo-locales de GSC para esa semana, genera un scorecard inicial automáticamente aunque después igual haya que completar indexación/Bing o analytics.

### Cadencia semanal acotada (2026-07-16)

El workflow corre **todos los lunes** sobre la última semana ISO completa, tanto en
semanas pares como impares. Esta cadencia queda vigente hasta terminar julio de
2026. La calibración W28 ya no corresponde al supuesto de bajo volumen que motivó
la pausa quincenal: GSC registró **498 clics y 94.443 impresiones**, suficiente para
usar la señal como input primario cuando el export tiene cobertura adecuada. Una
semana aislada no define dirección: las decisiones deben contrastarse contra
varias semanas comparables.

El **2026-08-01** se revisará la evidencia operativa y se elegirá explícitamente
una de tres opciones: mantener colección y revisión semanales; recolectar cada
semana pero revisar con personas cada dos semanas; o volver a colección y revisión
quincenal. La decisión se basa en señal útil, carga real y tiempo de cola, no en el
umbral histórico. La colección automática y la revisión humana son separables.

### Analytics first-party activo

El input principal de comportamiento on-site es el JSON agregado en
`output/operations/data-signals/analytics/<week>.json`. El pipeline first-party ya
está activo y el export W28 fue validado con **310 filas agregadas, 2.044 eventos y
6 tipos de evento**. `analytics-events.csv` se conserva como fallback compatible
del scorecard, no como fuente pendiente de activación.

Un JSON ausente después de la ventana de export es un **incidente de
colección/export**, no una razón para diferir analytics ni un cero de eventos. Un
JSON presente pero inválido es un **incidente de calidad de datos** y no debe
usarse para decidir hasta repararlo o regenerarlo. El issue semanal registra uno
de tres estados: `available`, `missing` o `invalid`.

### Growth Engine (report-only)

Desde 2026-10-01, el workflow `growth-opportunities.yml` publica cada lunes el
issue `🌱 Growth opportunities (report-only)` con los candidatos priorizados
(striking distance, CTR gap, decay, canibalización, funnel y gaps de cobertura
de competidores). Es **insumo** del ritual: los candidatos se revisan aquí, se
promueven a experimento vía issue con spec, o se suprimen con
`src/config/growth-opportunity-feedback.json`. No ejecuta cambios por sí solo;
ver `docs/operations/GROWTH-ENGINE.md`.

## Fuentes de verdad

- Watchlist estratégica: `docs/operations/runbooks/weekly-search-performance-watchlist.json`
- Script de scorecard: `scripts/build-weekly-search-report.mjs`
- Workflow híbrido semanal: `.github/workflows/weekly-search-ops.yml`
- Baseline operacional Phase 1: `docs/operations/reports/phase1_measurement_baseline.md`
- SLA de refresh: `docs/operations/runbooks/phase1-refresh-policy.md`
- Ownership y anti-canibalización: `docs/research/seo/strategy/topic_ownership_matrix.md`
- Keyword targeting: `docs/research/seo/strategy/keyword_url_map.md`
- Acceso autenticado restaurado en Sprint 2E:
  - `output/playwright/search-platform-profile-2e`
  - `output/playwright/search-platform-state-2e-authenticated.json`

## Carpeta semanal

Usar una carpeta por semana:

```bash
node scripts/build-weekly-search-report.mjs \
  --input output/operations/weekly-search-performance/2026-W11 \
  --init
```

Eso crea el bundle mínimo:

- `README.md`
- `indexation-summary.json`

El workflow semanal usa la misma convención y, si no encuentra exports, deja el bundle listo para completar sin depender de memoria humana.

Luego se dejan en esa misma carpeta:

- `gsc-pages.csv`
- `gsc-queries.csv`
- `analytics-events.csv` opcional como fallback manual

El JSON first-party no se copia al bundle: el scorecard lo busca por semana en
`output/operations/data-signals/analytics/`.

## Inputs requeridos

### 1. Google Search Console

Exportar dos vistas con comparación `últimos 7 días vs 7 días previos`:

- `Search results > Pages` -> `gsc-pages.csv`
- `Search results > Queries` -> `gsc-queries.csv`

Campos esperados:

- página o query
- clicks + delta
- impressions + delta
- CTR + delta
- average position + delta

Notas:

- El script soporta headers en español o inglés.
- Si una URL estratégica no aparece, la scorecard la marcará como `watch` para obligar revisión manual.

### 2. Google + Bing indexación

Completar `indexation-summary.json` con lo que realmente muestran esa semana:

- estado del sitemap;
- indexed / excluded si existe;
- alertas o coverage notes;
- manual actions o enhancement issues si aplican.

No hace falta una API para esto. El objetivo es dejar el estado semanal fijado en un artefacto repo-local y comparable.

### 3. Analytics / eventos del sitio

Confirmar primero el JSON agregado de la misma semana:

```text
output/operations/data-signals/analytics/<week>.json
```

Debe declarar `source: first-party-events`, `schemaVersion: 1` o `2`, la semana correcta
y filas agregadas con conteos no negativos. Si falta o no valida, abrir y resolver
el incidente indicado arriba antes de interpretar el funnel.

Como fallback manual, se puede exportar un CSV simple con esta forma:

```csv
page_path,event_name,event_count,event_count_previous
/calculadoras/sueldo-liquido/,calculator_start,42,31
/calculadoras/sueldo-liquido/,calculator_complete,18,16
/posts/como-calcular-sueldo-liquido/,cta_click,27,29
```

Eventos que más importan hoy:

- `calculator_view`
- `calculator_start`
- `calculator_complete`
- `calculator_error`
- `next_step_shown` / `next_step_click`
- `share_success`
- `alert_interest_shown` / `alert_interest_submit`
- `support_shown` / `support_click` / `support_confirmed`

El scorecard acepta nombres históricos del schema v1 para continuidad, pero los
payloads nuevos usan el contrato v2. `support_confirmed` solo puede aparecer con
confirmación fiable; un click de salida no es un pago.

### 4. Operación y sostenibilidad

Completar `utility-led-ops.json` en el bundle semanal con horas, costo directo,
tokens, agotamiento, incidentes, mantenimiento, bloqueos, aprendizaje y señal
reputacional. Si falta, el estado utility-led queda `INPUT_REQUIRED` (titular) con `Gate D: SIN REGISTRO` y
no se decide expansión. Ingresos cero son compatibles con continuidad mientras
la carga, el costo, la calidad y el aprendizaje sean sostenibles.

Si no se exporta `analytics-events.csv`, la scorecard sigue funcionando, pero pierde lectura de packaging/CTA y tool completion.

## Generación del scorecard

Con los archivos en la carpeta semanal:

```bash
node scripts/build-weekly-search-report.mjs \
  --input output/operations/weekly-search-performance/2026-W11
```

Salidas:

- `weekly-search-scorecard.md`
- `weekly-search-scorecard.json`

## Cómo leer la scorecard

### `winner`

Señal útil que merece protección o amplificación.

Reglas principales:

- clicks suben fuerte semana contra semana; o
- mejora posición/CTR con impresiones suficientes.

Qué hacer:

- no tocar de más el owner ganador;
- reforzar enlaces desde home/hub/support si el win todavía no derrama al siguiente paso;
- revisar si el query set ganador abre espacio para una pieza support adicional.

### `loser`

La landing cayó de forma relevante.

Reglas principales:

- clicks bajan fuerte; o
- cae CTR y empeora posición con impresiones suficientes.

Qué hacer:

- revisar title, snippet y primer scroll;
- comparar contra el `query pulse`;
- si la demanda sube pero la landing cae, priorizar refresh inmediato.

### `watch`

No es crisis, pero ya hay señales de oportunidad o riesgo.

Reglas típicas:

- posición entre `4` y `15`;
- CTR débil con impresiones suficientes;
- la URL estratégica no apareció en el export semanal.

Qué hacer:

- decidir si el siguiente empuje es refresh, internal linking o esperar otra semana.

### `action_needed`

Hay una desalineación entre adquisición y journey.

Casos que hoy elevan este estado:

- la demanda del query set sube, pero la landing cae;
- una página gana tráfico, pero `cta_click` no acompaña;
- una calculadora tiene `calculator_start` suficiente y `completion rate` bajo.

Qué hacer:

- `refresh`: title, intro, snippet, vigencia, secciones altas.
- `internal_linking`: empujar mejor hacia owner/tool/hub definido en la watchlist.
- `tool_ux`: reducir fricción de formulario, validaciones o copy del resultado.

## Decisiones semanales obligatorias

Cada corrida debe cerrar con **1 a 3 decisiones totales**, distribuidas según la
evidencia entre estas categorías:

1. `Refresh ahora`.
2. `Internal linking / packaging`.
3. `Seguimiento de indexación`.

Si la scorecard no produce decisiones, el ritual se está volviendo ceremonial y hay que simplificarlo más.

## Cadencia recomendada

### Lunes o martes

1. Abrir GSC y Bing usando el estado autenticado de Sprint 2E si sigue vigente.
2. Exportar GSC pages/queries.
3. Anotar estado de sitemap/indexación en `indexation-summary.json`.
4. Confirmar que el JSON first-party de la semana está disponible y válido; usar
   el CSV solo como fallback manual.
5. Ejecutar el script.

Alternativa programada:

1. Dejar que `weekly-search-ops.yml` abra o actualice el issue de la **última semana completa**.
2. Revisar el scorecard inicial si el workflow ya encontró JSON repo-locales; completar el bundle estándar con exports reales cuando falten señales manuales.
3. Re-ejecutar el workflow o correr localmente `build-weekly-search-report.mjs`.

### Mismo bloque de trabajo

1. Leer primero `Top Losers` y `Strategic Watchlist`.
2. Decidir refreshes antes de mirar ideas nuevas.
3. Revisar `Internal Linking / Packaging / Tool UX`.
4. Si algo requiere trabajo mayor, moverlo al backlog; si es un ajuste menor, ejecutarlo en el sprint activo.

## Regla de mantenimiento de la watchlist

`weekly-search-performance-watchlist.json` no se toca cada semana.

Solo se actualiza cuando cambia una de estas cosas:

- abre un hub nuevo;
- una URL cambia de owner a support o viceversa;
- una calculadora entra o sale del portafolio prioritario;
- el plan de refresh cambia la prioridad real del sitio.

## Criterio de salida del ritual

La semana queda cerrada solo si existen:

- el bundle semanal bajo `output/operations/weekly-search-performance/<week>/`;
- una scorecard generada por script;
- 1 a 3 acciones decididas;
- el estado de analytics documentado y cualquier ausencia/invalidez tratada como
  incidente;
- una nota clara de indexación/cobertura para Google y Bing.

## Anexos SEO/SERP (plan 136, 2026-09-30)

### Cadencia mensual de decisión sobre la matriz query×page (N1)

El tooling ya existe (plan 128); lo que faltaba era la cadencia. Regla:

- **Responsable:** el operador del ritual semanal.
- **Frecuencia:** primera corrida semanal de cada mes (los demás lunes se
  mantiene el scorecard normal). Los datos se leen en ventanas multi-semana, no
  semana a semana.
- **Comandos** (desde `main`; salidas en `output/validation/`, regenerables):

  ```bash
  pnpm run data-signals:gsc:aggregate -- --weeks=8
  pnpm run audit:striking-distance -- --file=output/operations/data-signals/gsc/aggregate-query-page.json --top=30 --json
  pnpm run audit:cannibalization -- --file=output/operations/data-signals/gsc/aggregate-query-page.json --top=25 --json
  ```

- **Regla de decisión:** elegir 1–3 candidatos (banda 8–20 con ≥10
  impresiones, CTR-gap, canibalización nueva) y llevarlos al
  `UTILITY_LED_EXPERIMENT_REGISTRY.md` (si es experimento) o a `plans/` (si es
  ejecución). Nada se ejecuta dentro de ventanas de medición activas ni durante
  el freeze de títulos.
- **Salida:** reportes JSON en `output/validation/striking-distance/` y
  `output/validation/cannibalization/`, más una nota con las decisiones en el
  issue/bundle semanal.
- **Referencia:** plan 128 §8 y `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md`
  §4 (N1/N3).

### Vista Generative AI de GSC (N7 — disponible; captura mensual)

Disponibilidad **verificada por el owner (2026-09-30): la vista existe** en la
propiedad. No hay soporte en `gsc-fetch`; la captura es manual.

- **Captura:** Search Console → Performance → Search results → filtro de tipo
  de búsqueda → Generative AI; guardar el export en el bundle semanal como
  `output/operations/weekly-search-performance/<semana>/gsc-generative-ai.csv`.
- **Cadencia:** mensual, en la primera corrida del mes (junto a la revisión N1).
  Anotar fecha y estado en la nota de indexación/cobertura.
- **Lectura:** impresiones, clics, CTR y posición de las queries con presencia
  IA; sin inferir AIO por búsquedas manuales y sin declarar causalidad.
- Sin automatización ni identificadores nuevos.
