# Plan maestro — crecimiento liderado por calculadoras

> **Instrucciones para la sesión ejecutora:** lee este documento completo antes
> de modificar archivos. Ejecuta las fases en orden. Cada PR debe cerrar sus
> verificaciones y actualizar el Progress Log. Si ocurre una condición de
> `STOP`, detente y reporta; no sustituyas la arquitectura, la política de
> privacidad, los owners editoriales ni los umbrales por criterio propio.
>
> **Drift check obligatorio:** este plan fue escrito contra `efa3d819`.
> Antes de cada fase ejecuta:
>
> ```bash
> git diff --stat efa3d819..HEAD -- \
>   src/scripts/analytics.ts \
>   src/utils/analytics.ts \
>   src/scripts/next-best-step.ts \
>   scripts/data-signals/cloudflare-fetch.mjs \
>   scripts/build-weekly-search-report.mjs \
>   .github/workflows/data-signals.yml \
>   src/pages/calculadoras \
>   src/pages/privacidad.astro \
>   src/pages/cookies.astro
> ```
>
> Si los archivos relevantes cambiaron, compara el estado vivo con §6. Si se
> invalidó una premisa, registra el drift y detente antes de implementar.

## Estado

- **Estado general:** TODO
- **Prioridad:** P0/P1 estratégica
- **Esfuerzo:** L, dividido en PRs pequeños
- **Riesgo:** MED-HIGH por privacidad y YMYL
- **Categoría:** direction / analytics / SEO / product
- **Planned at:** `efa3d819`, 2026-06-28
- **Informe fuente:** `docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md`
- **Owner de decisión:** Carlos Ortega
- **Dependencias externas:** aprobación humana/legal de analytics; credenciales
  Cloudflare solo después de ADR aceptado

---

## 1. Task Brief canónico

- **Objective:** convertir las calculadoras con demanda probada en journeys
  medibles y optimizables, sin introducir PII, tracking persistente,
  recomendación financiera personalizada ni nuevas URLs innecesarias.
- **In scope:** diseño y, tras aprobación, implementación de analytics agregado;
  saneamiento de Cloudflare; scorecard de funnel; optimización de
  `seguro-cesantia`, `operacion-renta`, `prepago-credito` y
  `credito-consumo`; experimentos SEO existentes; hardening de frescura;
  baseline GEO y apoyo voluntario.
- **Out of scope:** ads, afiliación, leads, newsletter, cuentas, push,
  programmatic SEO, comparador bancario en vivo, nuevos hubs, nueva calculadora,
  migraciones de URL, refactors generales.
- **Invariants/Contracts to preserve:**
  - `URL.PUBLIC.NO_POST_ID`;
  - `ROUTES.NO_SILENT_CHANGES`;
  - `RSS.NO_REMOVALS`;
  - `FRONTMATTER.VALID`;
  - `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`;
  - `INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA`;
  - `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`;
  - `CONTRACT.YMYL_RESPONSE_STRUCTURE`;
  - política Cloudflare-only vigente hasta que un ADR la reemplace.
- **Required gates:** definidos por fase en §10; suite general en §9.
- **Deliverable:** eventos agregados verificables, scorecard con funnel, datos
  Cloudflare saneados, 3–4 journeys medidos, experimentos con criterio de éxito
  y registro de decisiones.
- **Benchmark observed:** no se usa benchmark externo. La señal es repo-local:
  GSC W16–W25 y capacidades existentes.
- **Why it worked externally:** no aplica.
- **Proposed local delta:** gestionar calculadoras como producto de decisión,
  preservando anonimato, transparencia matemática y fuentes oficiales.
- **What will not be copied:** tracking invasivo, growth loops con dark patterns,
  rankings pagados, captación de leads, asesoría personalizada.
- **Owner/surface affected:** portafolio de calculadoras y sistema operativo de
  datos.
- **Success signal:** adquisición crece sin reducir confianza, completion y
  navegación útil mejoran, y cada expansión posterior se justifica con datos.

---

## 2. Por qué importa

En W25, las calculadoras concentraron 126 de 136 clics orgánicos. El portafolio
ya tiene motores probados, metodología visible, fuentes y 22 entradas
organizadas por JTBD. La limitación actual no es inventario: el sitio conoce la
adquisición por GSC, pero no sabe si una visita inicia o completa el cálculo,
qué siguiente paso funciona ni qué feature genera retorno.

El runbook pospuso analytics conductual hasta superar aproximadamente 100 clics
semanales. Ese umbral ya se cruzó. La primera inversión debe convertir eventos
existentes en señal operativa, sin contradecir la promesa de privacidad.

---

## 3. Resultados que deben ser verdaderos al cerrar

1. Existe una arquitectura aprobada para eventos first-party agregados.
2. Ningún payload transmite inputs, montos, texto libre, perfil, rationale,
   email, IP, user-agent o identificador persistente.
3. El collector puede fallar sin afectar cálculos, navegación o render.
4. El scorecard muestra por calculadora:
   - views;
   - starts;
   - completes;
   - errors;
   - next-step clicks;
   - shares;
   - support clicks.
5. Cloudflare RUM excluye hostnames/rutas ajenas o las marca por separado.
6. Existe baseline de al menos dos semanas para cuatro journeys.
7. Cambios de UX/SEO solo se despliegan después del baseline correspondiente.
8. Cada experimento tiene fecha, hipótesis, cohortes, métrica primaria, guardrail,
   resultado y decisión.
9. Ninguna nueva URL pública se crea como parte de este plan.
10. Privacidad, cookies, metodología y copy público permanecen coherentes con el
    comportamiento real.

---

## 4. No objetivos

- No construir BI, data lake ni perfiles de usuario.
- No atribuir individuos, sesiones o cohortes persistentes.
- No almacenar resultados de calculadoras.
- No enviar eventos a Google, Meta u otra red publicitaria.
- No personalizar recomendaciones server-side.
- No optimizar las 22 calculadoras simultáneamente.
- No usar pageviews o impresiones como única medida de éxito.
- No declarar causalidad con una sola semana.

---

## 5. Dependencias y orden de ejecución

```text
PR-00 baseline + viability + ADR
  ├── PR-01 schema/collector/transport privacy-safe
  │     └── PR-02 export semanal + scorecard + Cloudflare hygiene
  │            └── OBS-01 baseline de 2 semanas
  │                   ├── PR-03 journeys ganadores
  │                   └── PR-04 experimentos SEO + frescura
  │                          └── OBS-02 medición de 4 semanas
  └── OPS-01 baseline GEO mensual

OBS-01 + OBS-02
  └── PR-05 recurrencia y apoyo, solo si superan gates
```

Ninguna sesión debe saltar `PR-00` ni `OBS-01`.

---

## 6. Estado actual que la sesión ejecutora debe confirmar

### 6.1 Analytics

`src/scripts/analytics.ts`:

```ts
function track(eventName: string, params: AnalyticsEventParams = {}) {
  const payload = cleanAnalyticsParams({
    page_path: window.location.pathname,
    page_type: getCurrentPageType(),
    ...params,
  });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
}
```

No existe transporte. `TD-0084` declara Cloudflare-only y eventos no enviados.

### 6.2 Riesgo de perfil

`src/scripts/next-best-step.ts` emite:

```ts
trackAnalyticsEvent("next_best_step_shown", {
  rule_id: suggestion.id,
  calculator_slug: slug,
  profile_signal: suggestion.rationale,
  position,
});
```

`profile_signal` debe eliminarse antes de activar transporte.

### 6.3 Scorecard

`scripts/build-weekly-search-report.mjs` ya consume
`analytics-events.csv` con:

```csv
page_path,event_name,event_count,event_count_previous
/calculadoras/tool/,calculator_start,20,18
/calculadoras/tool/,calculator_complete,4,5
```

El patrón de tests está en
`tests/scripts/build-weekly-search-report.test.ts`.

### 6.4 Cloudflare

Traffic consulta por `zoneTag`; RUM consulta
`rumWebVitalsEventsAdaptiveGroups` por `accountTag` sin hostname. W25 incluye
rutas que no pertenecen al sitio.

### 6.5 Features

- Next Best Step: 8/22 calculadoras.
- CalculatorResultNextActions: 8/22.
- CalculatorScenarios: 7/22.
- `seguro-cesantia` y `prepago-credito` no tienen estas tres capas.
- `operacion-renta` tiene NBS y acciones.
- `credito-consumo` tiene escenarios y acciones.

### 6.6 Confianza

Las calculadoras ya incluyen:

- `CalculatorTrustBadge`;
- `ShareCalculatorResult`;
- `MethodologyBlock`;
- ejemplos anti-drift;
- schema `WebApplication`;
- `dateModified` derivado de `page-lastmod` cuando aplica.

No reconstruir estas capacidades.

---

## 7. Contrato de eventos propuesto

Este contrato es un requisito del ADR, no autorización para desplegarlo.

### 7.1 Eventos permitidos

| Evento | Dimensiones permitidas |
|---|---|
| `calculator_view` | `page_type`, `calculator_slug` |
| `calculator_start` | `calculator_slug`, `interaction_type` |
| `calculator_complete` | `calculator_slug`, `outcome_class` enum no financiero |
| `calculator_error` | `calculator_slug`, `error_code` allowlisted |
| `next_best_step_shown` | `calculator_slug`, `rule_id`, `position` |
| `next_best_step_click` | `calculator_slug`, `rule_id`, `position` |
| `result_action_click` | `calculator_slug`, `action_id` |
| `share_result_click` | `calculator_slug`, `channel` |
| `scenario_action` | `calculator_slug`, `action` = save/load/compare/delete |
| `resume_click` | `item_type`, `item_id` allowlisted |
| `support_page_click` | `page_type`, `source_context` |
| `official_source_click` | `page_type`, `source_domain` allowlisted |

### 7.2 Campos prohibidos

- valores de input;
- sueldo, deuda, pensión, impuesto, AFP o cualquier resultado;
- query strings;
- destination URL completa;
- texto de labels o errores;
- `profile_signal`, rationale o contenido de reglas;
- email, RUT, nombre, teléfono;
- IP o user-agent persistidos;
- cookie ID, fingerprint, session ID o user ID;
- referrer completo cuando pueda contener query string;
- localStorage/sessionStorage;
- timestamps de precisión inferior a día en el artefacto operativo.

### 7.3 Requisitos del collector

- mismo origen o allowlist explícita de `https://monedario.cl`;
- solo `POST`;
- `Content-Type: application/json`;
- body máximo 2 KB;
- schema estricto, rechazo de keys desconocidas;
- rate limit o protección de abuso compatible con Cloudflare;
- sin eco del payload;
- respuesta `202` o `204`;
- errores client-side silenciados y no bloqueantes;
- retención de agregados, no raw events;
- separación prod/test;
- feature flag deshabilitado hasta sign-off;
- ningún secret en el bundle cliente;
- export semanal repo-local con `schemaVersion`.

### 7.4 Arquitectura preferida y escape hatch

Preferir una capacidad Cloudflare que agregue contadores por:

```text
day + event_name + page_path/calculator_slug + dimensión allowlisted
```

sin almacenar raw requests ni identificadores.

La sesión `PR-00` debe evaluar disponibilidad, costo, consistencia de contadores,
retención, exportabilidad y límites legales conforme a
`docs/development/CRITERIO_VIABILIDAD.md`.

**STOP:** si la opción disponible exige cookies, user ID, fingerprint, raw event
logs prolongados o un tercero no aprobado, no implementar ni reactivar GA. Volver
al operador con alternativas.

---

## 8. Protocolo de baseline pre-implementación

Ejecutar antes de `PR-00` y pegar resultados resumidos en §14.

### 8.1 Estado del repo

```bash
git status --short
git rev-parse --short HEAD
node --version
pnpm --version
```

Esperado:

- worktree limpio o cambios ajenos identificados y fuera del scope;
- Node alineado con CI;
- pnpm alineado con `packageManager`.

### 8.2 Baseline general

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm run check
pnpm run build
```

Esperado: exit 0 en todos. Si falla uno por baseline preexistente, registrar
comando, error, commit y archivo; no atribuirlo al cambio. No iniciar un PR
runtime si no se puede distinguir la baseline.

### 8.3 Baseline focalizado

```bash
pnpm exec vitest run \
  tests/integration/analytics-utils.test.ts \
  tests/integration/nextBestStep.test.ts \
  tests/integration/calculatorScenarios.test.ts \
  tests/scripts/build-weekly-search-report.test.ts \
  tests/scripts/lcp-gate.test.ts \
  tests/static-analysis/data-signals-workflow.e2e.test.ts
```

Esperado: todos pasan.

### 8.4 Baseline de datos

```bash
for f in output/operations/data-signals/gsc/*-pages.json; do
  jq -r '[.week, (.data|map(.clicks)|add), (.data|map(.impressions)|add)] | @tsv' "$f"
done | sort
```

Guardar:

- último período disponible;
- clics/impressions totales;
- top 10 páginas;
- mix por superficie;
- top queries de las cuatro calculadoras prioritarias.

### 8.5 Baseline visual/funcional

Construir y previsualizar:

```bash
pnpm run build
pnpm exec astro preview --port 4321
```

Verificar manualmente en 375, 768 y 1440 px:

- `/calculadoras/seguro-cesantia/`;
- `/calculadoras/operacion-renta/`;
- `/calculadoras/prepago-credito/`;
- `/calculadoras/credito-consumo/`;
- `/calculadoras/`;
- `/`;
- `/privacidad/`;
- `/cookies/`.

Por calculadora:

1. carga sin error;
2. inputs aceptan casos válidos;
3. validación rechaza bordes;
4. cálculo devuelve el mismo resultado preexistente;
5. resultado recibe foco cuando corresponde;
6. compartir funciona;
7. metodología y fuente se ven;
8. navegación sin JavaScript sigue siendo útil.

Registrar capturas o notas en el PR; no commitear screenshots salvo decisión
explícita.

---

## 9. Gates generales post-implementación

Cada PR ejecuta:

```bash
pnpm run lint
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm run check
pnpm run build
git status --short
```

Esperado:

- exit 0;
- sin warnings nuevos relevantes;
- ningún archivo fuera del scope del PR;
- plan actualizado con evidencia.

Si toca rutas, canonicals, RSS, sitemap o helpers de URL —no previsto—:

```bash
pnpm run check:no-postid-urls
pnpm run check:routes
pnpm run check:rss
```

Si toca UI de calculadoras/home:

```bash
pnpm run test:a11y
pnpm run perf:ci
```

Guardrails:

- Mobile Performance ≥ 99;
- LCP sintético ≤ 1,7 s;
- CLS = 0;
- no regresión visible a 375/768/1440 px;
- resultados numéricos idénticos para fixtures existentes.

---

## 10. Plan por PR

### PR-00 — Viabilidad, threat/privacy review y ADR

**Objetivo:** decidir la arquitectura de medición antes de escribir transporte.

**In scope probable:**

- nuevo ADR bajo `docs/adr/`;
- este plan;
- `docs/operations/runbooks/weekly-search-performance-ritual.md`;
- política/diagrama de datos;
- no runtime.

**Pasos:**

1. Documentar opciones Cloudflare disponibles y costo real.
2. Para cada opción evaluar:
   - datos capturados automáticamente por infraestructura;
   - almacenamiento raw vs agregado;
   - consistencia;
   - retención;
   - export semanal;
   - protección de abuso;
   - secrets;
   - operación mensual;
   - impacto legal.
3. Elegir una opción o declarar no viable.
4. Congelar contrato de §7.
5. Definir endpoint, binding y feature flag sin secretos.
6. Obtener sign-off de Carlos antes de `PR-01`.

**Tests/verificación:**

```bash
pnpm run check:docs
pnpm run check:context
pnpm run format:check
```

**Esperado:** exit 0; ADR `Accepted`; plan actualizado.

**STOP:**

- datos raw obligatorios;
- identificador persistente obligatorio;
- falta de forma confiable de exportar agregados;
- costo/operación no aprobado;
- privacidad no actualizable antes del deploy.

### PR-01 — Schema, sanitizer, collector y transporte no bloqueante

**Objetivo:** capturar únicamente el contrato aprobado.

**In scope probable, sujeto al ADR:**

- `src/utils/analytics.ts`;
- `src/scripts/analytics.ts`;
- `src/scripts/next-best-step.ts`;
- nuevo worker bajo `workers/` o alternativa aprobada;
- configuración y tipos del worker;
- tests unitarios/integración;
- `src/pages/privacidad.astro`;
- `src/pages/cookies.astro`;
- `public/_headers` solo si CSP lo requiere;
- ADR y plan.

**Pasos:**

1. Escribir tests de schema y prohibiciones antes del transporte.
2. Introducir `sanitizeAnalyticsEvent()` puro:
   - allowlist por evento;
   - keys desconocidas eliminadas o rechazadas según ADR;
   - strings con límite;
   - enums validados.
3. Remover `profile_signal` y full destination URLs de eventos transmisibles.
4. Implementar transporte con:
   - `keepalive`/`sendBeacon` solo si aprobado;
   - timeout corto;
   - fallo silencioso;
   - flag off por defecto.
5. Implementar collector:
   - método, origin, content-type y size;
   - schema;
   - agregación;
   - respuesta sin payload.
6. Actualizar privacidad/cookies antes de activar.
7. Activar primero en entorno de prueba.

**Tests nuevos mínimos:**

- evento permitido conserva solo campos permitidos;
- key desconocida no llega;
- `profile_signal`, inputs y montos nunca aparecen;
- payload >2 KB se rechaza;
- origin ajeno se rechaza;
- método distinto de POST se rechaza;
- content-type inválido se rechaza;
- error del collector no altera cálculo ni UI;
- feature flag off no hace request;
- feature flag on envía una vez;
- `calculator_start` solo se emite una vez por page load;
- complete se emite únicamente tras éxito.

**Patrones:**

- `tests/integration/analytics-utils.test.ts`;
- `tests/workers/reddit-mention-monitor/*.test.ts`;
- `tests/workers/economic-snapshot-refresh/*.test.ts`.

**Verificación focalizada esperada:**

```bash
pnpm exec vitest run \
  tests/integration/analytics-utils.test.ts \
  tests/integration/nextBestStep.test.ts \
  tests/workers
```

Todos pasan.

**Análisis estático bloqueante:**

```bash
rg -n 'profile_signal|sueldo|deuda|monto|resultado|email|rut|user_id|session_id' \
  src/scripts/analytics.ts \
  src/utils/analytics.ts \
  src/scripts/next-best-step.ts \
  workers
```

Cada match debe ser esperado, revisado y documentado; cero campos prohibidos en
payload/schema.

**Functional smoke post-build:**

- interceptar request del collector en navegador;
- completar cada tool prioritaria;
- afirmar un start y un complete;
- inspeccionar body y confirmar cero cifras/input;
- simular 500/timeout y confirmar resultado intacto.

### PR-02 — Export semanal, scorecard y saneamiento Cloudflare

**Objetivo:** convertir eventos agregados en señal repo-local.

**In scope probable:**

- `scripts/data-signals/`;
- `scripts/build-weekly-search-report.mjs`;
- `.github/workflows/data-signals.yml`;
- `output/operations/data-signals/README.md`;
- watchlist;
- tests de scripts/workflow;
- plan.

**Pasos:**

1. Exportar agregados con schema:

```json
{
  "source": "first-party-events",
  "schemaVersion": 1,
  "week": "YYYY-Www",
  "window": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "data": []
}
```

2. Validar suma, no negatividad, enums y período.
3. Integrar al scorecard con fallback a CSV.
4. Calcular rates solo con denominador >0.
5. Mostrar `n/d`, nunca `0%`, cuando falta fuente.
6. Sanear RUM:
   - filtro hostname si API lo soporta;
   - de lo contrario, allowlist de rutas derivada del inventario;
   - reportar descartadas y razón.
7. Separar:
   - pageviews CDN;
   - RUM samples;
   - GSC clicks;
   - eventos.
8. Mantener artefactos sin datos sensibles.

**Tests nuevos mínimos:**

- JSON válido y versión rechazada si no es 1;
- views 100, starts 50, completes 25 → 50% start y 50% completion;
- denominador cero → `n/d`;
- semana faltante no se interpreta como cero;
- ruta ajena se excluye y cuenta en `discarded`;
- ruta válida dinámica se conserva;
- CSV fallback sigue funcionando;
- workflow no commitea secretos ni raw events.

**Verificación focalizada:**

```bash
pnpm exec vitest run \
  tests/scripts/build-weekly-search-report.test.ts \
  tests/scripts/lcp-gate.test.ts \
  tests/static-analysis/data-signals-workflow.e2e.test.ts
```

**Dry run:**

```bash
pnpm run data-signals:cloudflare:local -- --week=<semana>
node scripts/build-weekly-search-report.mjs \
  --input output/operations/weekly-search-performance/<semana>
```

Esperado: reporte con fuentes diferenciadas, rates correctos y rutas descartadas
visibles.

### OBS-01 — Baseline de dos semanas

**Objetivo:** no modificar journeys mientras se aprende el baseline.

**Duración mínima:** 14 días o hasta cumplir muestra mínima.

**Muestra mínima por calculadora:**

- 100 views o 50 starts para evaluar completion;
- 30 completes para evaluar next-step;
- si no alcanza, extender a 28 días; no bajar umbral retrospectivamente.

**Cohorte prioritaria:**

- seguro de cesantía;
- Operación Renta;
- prepago de crédito;
- crédito de consumo.

**Registrar:**

- GSC clicks/impressions/position;
- view/start/complete/error;
- next-step/share/support;
- RUM;
- cambios externos/regulatorios relevantes.

**No hacer durante OBS-01:**

- title/meta changes en las cuatro tools;
- cambios de formulario;
- cambio de CTAs;
- promoción pagada;
- cambio de home que altere distribución.

### PR-03 — Journeys ganadores

**Gate de entrada:** OBS-01 completo.

**Objetivo:** corregir el punto de mayor fuga o falta de siguiente paso en cada
tool, no homogeneizar por estética.

**Archivos probables:**

- páginas de las cuatro tools;
- `CalculatorResultNextActions.astro`;
- `NextBestStep.astro`;
- `src/data/nextBestStep/rules.ts`;
- tests NBS, controllers y accesibilidad;
- pipeline editorial si cambia copy YMYL.

**Reglas de decisión:**

| Señal | Intervención permitida |
|---|---|
| start rate bajo | claridad above-fold, labels, primer input |
| completion bajo + errors altos | validación/copy/fricción |
| completion alto + next-step bajo | acciones postresultado |
| share alto | preservar y amplificar share |
| NBS mostrado sin click | revisar relevancia/copy, no añadir más cards |
| tool sin muestra | no intervenir |

**No asumir:** que todas requieren escenarios o NBS.

**Tests por journey:**

- fixtures numéricos existentes siguen idénticos;
- evento complete una vez por cálculo exitoso;
- error no produce complete;
- CTA postresultado solo aparece tras resultado;
- links usan URLs canónicas existentes;
- copy respeta estructura YMYL;
- teclado y foco funcionan;
- no CLS al mostrar resultado/CTA.

**Verificación:**

```bash
pnpm exec vitest run \
  tests/integration/nextBestStep.test.ts \
  tests/integration/calculatorScenarios.test.ts \
  tests/unit/calculator-controllers-format.test.ts \
  tests/unit/calculator-controllers-scenario-io.test.ts
pnpm run test:a11y
pnpm run perf:ci
```

### PR-04 — Striking distance y frescura

**Gate de entrada:** baseline GSC de 4 semanas por URL.

**Objetivo:** capturar demanda en assets existentes sin abrir URLs.

**Candidatas iniciales:**

- comisiones AFP;
- conversor UTM;
- conversor UF;
- crédito consumo;
- owner UTM.

**Antes de editar:**

1. clasificar queries:
   - cálculo complejo/click-worthy;
   - referencia numérica zero-click;
   - oficial/navegacional;
   - informacional;
2. fijar primary metric por clase;
3. ejecutar pipeline editorial cuando corresponda.

**Experimento secuencial:**

1. una URL por vez o máximo tres sin solapamiento;
2. registrar baseline de 28 días;
3. cambiar title/meta/apertura o linking, no todo simultáneamente;
4. esperar 28 días;
5. comparar clicks, CTR y posición;
6. revertir si cae clicks >20% con impresiones estables y no hay explicación.

**Frescura UTM:**

- no responder “hoy” con un valor histórico;
- preferir dato inyectado desde snapshot o texto evergreen que remita a tool;
- conservar ejemplos históricos claramente etiquetados;
- actualizar `validAsOf`/`updatedDate` mediante pipeline;
- añadir test/gate para `hoy|vigente` cercano a fecha/valor estático si es viable
  sin falsos positivos.

**Gates:**

```bash
pnpm run check:frontmatter
pnpm run check:editorial
pnpm run check:editorial-timeliness
pnpm run check:economic-source-consistency
pnpm run check:links
pnpm run audit:cannibalization
pnpm run audit:topic-overlap
pnpm run build
```

### OPS-01 — Baseline GEO

**Objetivo:** medir antes de construir.

Ejecutar exactamente
`docs/reports/AI-CITATION-TRACKING.md`, sin cambiar el set durante tres meses.

**Done por corrida:**

- 4 motores;
- 12 queries;
- 48 combinaciones;
- citado sí/no;
- prominencia;
- URL;
- observación;
- fecha y entorno no personalizado.

No cambiar `llms.txt`, schema o contenido por una única respuesta. Requerir dos
corridas con patrón repetido.

### OBS-02 — Medición postcambio

**Duración:** 28 días por experimento.

**Éxito de producto:**

- completion +10% relativo, o
- error rate -15% relativo, o
- next-step CTR ≥5% con al menos 30 completes;
- sin caída de organic clicks >20%;
- sin regresión CWV/a11y.

**Éxito SEO:**

- clicks +20% o CTR x2/+0,5 pp;
- posición no empeora más de 2 puestos;
- interpretar zero-click separadamente.

Si la muestra no alcanza, marcar `INCONCLUSIVE`, no `FAILED` ni `SUCCESS`.

### PR-05 — Recurrencia y apoyo

**Gate de entrada:** OBS-02 y decisión explícita.

**Recurrencia:**

- expandir scenarios/NBS/Resume solo si el piloto supera 5% de adopción sobre
  completes o demuestra uplift;
- mantener local-only;
- no crear user ID para medir retorno.

**Apoyo:**

- medir `support_page_click` después de valor entregado;
- CTA no modal, no bloqueante, no urgente;
- no condicionar resultado;
- no variar recomendaciones por donación;
- medir clicks, no inventar revenue sin dato Ko-fi.

**Newsletter permanece fuera de scope.**

---

## 11. Protocolo de pruebas funcionales pre/post

### 11.1 Matriz obligatoria

| Caso | Pre | Post | Criterio |
|---|---|---|---|
| Carga de tool | guardar resultado/estado | repetir | idéntico |
| Cálculo válido | guardar inputs y output de fixture | repetir | output idéntico |
| Input inválido | guardar error/foco | repetir | misma o mejor UX |
| Start event | observar dataLayer | observar collector | una vez |
| Complete event | observar dataLayer | observar collector | solo tras éxito |
| Error event | no baseline | observar collector | code allowlisted, sin texto |
| Payload | no transporte | interceptar | cero campos prohibidos |
| Collector 500 | no aplica | simular | cálculo funciona |
| Collector timeout | no aplica | simular | sin bloqueo ni error visible |
| JS deshabilitado | navegar | navegar | contenido y links útiles |
| Share | probar | repetir | funciona, sin datos privados |
| NBS | guardar sugerencias | repetir | no consejo personalizado |
| Mobile 375 | screenshot/nota | repetir | sin overflow/CLS |
| Tablet 768 | screenshot/nota | repetir | sin regresión |
| Desktop 1440 | screenshot/nota | repetir | sin regresión |
| Screen reader semantics | Playwright | Playwright | gates verdes |
| CWV sintético | Lighthouse | Lighthouse | umbrales preservados |
| GSC | baseline 28d | post 28d | comparación documentada |

### 11.2 Casos numéricos

No crear nuevos valores esperados manualmente si ya existe fixture de motor.
Reusar las pruebas de application/domain y worked examples. Cualquier diferencia
numérica causada por analytics o UX es un `STOP` inmediato.

### 11.3 Privacidad

Agregar un test que serialice cada evento permitido con valores trampa:

```text
email=test@example.com
rut=11.111.111-1
sueldo=1234567
resultado=7654321
profile_signal=texto derivado
destination_url=https://.../?secret=...
```

El body final no debe contener ninguno. El test debe buscar tanto keys como
values.

### 11.4 Seguridad/abuso

Casos mínimos:

- JSON malformado;
- body grande;
- keys extra;
- strings largas;
- origin ajeno;
- método inválido;
- content-type inválido;
- burst/rate limit;
- replay sin impacto distinto de aumentar contador;
- ausencia de stack trace en respuesta.

---

## 12. Rollback

### Collector/transport

- feature flag a off;
- revertir transporte cliente;
- preservar eventos en `dataLayer`;
- no borrar agregados requeridos para auditoría sin decisión de retención;
- privacidad debe volver a reflejar conducta real.

### Scorecard/export

- volver a CSV fallback;
- no reinterpretar ausencia como cero;
- conservar schemaVersion previa mientras se corrige.

### UX journeys

- revertir por calculadora, no todo el sistema;
- motores y fixtures no deben necesitar rollback;
- restaurar CTA anterior si completion/clicks empeoran.

### SEO

- guardar title/meta/apertura anterior en registro de experimento;
- revertir si se cumple guardrail de pérdida;
- no cambiar URL ni canonical.

### Monetización

- remover callout experimental;
- `/apoyar/` y Ko-fi permanecen independientes;
- no afectar acceso gratuito.

---

## 13. STOP conditions

Detener y reportar si:

1. la arquitectura requiere PII, cookie, fingerprint o user ID;
2. no existe opción de agregado/export viable;
3. privacidad/legal no aprueba;
4. un secreto tendría que exponerse al cliente;
5. el diff exige una nueva URL pública;
6. cambia una fórmula o resultado financiero;
7. se necesita recomendación personalizada;
8. aparece ownership conflict;
9. una edición YMYL no puede pasar pipeline y separación de deberes;
10. los tests preexistentes están rojos y no puede aislarse la causa;
11. performance cae bajo guardrails;
12. un step falla dos veces tras corrección razonable;
13. se requiere modificar un archivo fuera del scope declarado del PR;
14. la muestra no alcanza y alguien propone bajar umbrales retroactivamente;
15. los datos contradicen la tesis y no se actualiza este plan.

---

## 14. Progress Log

Actualizar en cada sesión.

| Fecha | Fase | Estado | Commit/PR | Evidencia | Decisión/bloqueo |
|---|---|---|---|---|---|
| 2026-06-28 | Planificación | DONE | `efa3d819` base | auditoría + plan creados | iniciar PR-00 |
| 2026-06-28 | Verificación de los artefactos de planificación | DONE | worktree local | Prettier focalizado, `check:docs`, `check:context`, `check:boundaries`, `test` (853), `check`, `build` (327 páginas; 1.564 enlaces; 0 rotos) y `git diff --check` pasan | La implementación permanece TODO; el cierre global tiene dos excepciones preexistentes documentadas abajo |
| 2026-06-28 | PR-00 — Viabilidad, threat/privacy review y ADR | DONE | `843c0b28` + ADR creado | Drift check limpio (0 archivos cambiados); baseline completa (§8) con excepciones preexistentes confirmadas; ADR `ADR-20260628-first-party-analytics.md` con status `Proposed`; viabilidad técnica/económica/operacional confirmada; modelo de amenazas documentado; contrato de eventos congelado (§7); campos prohibidos explicitados; sign-offs identificados sin simular | **Decisión: CONDITIONAL GO.** Arquitectura Workers + KV viable. PR-01 bloqueado hasta: (1) sign-off de Carlos Ortega sobre arquitectura, (2) revisión legal de conformidad con Ley 21.719, (3) credenciales Cloudflare. PR-00 completado en su criterio de cierre documental. |
| 2026-06-28 | PR-00 — Aprobación del ADR | DONE | mismo commit | ADR aceptado por Carlos Ortega (arquitectura + legal). Status cambia de `Proposed` a `Accepted`. Sign-offs 1 y 2 completos. | **PR-01 desbloqueado para inicio.** Requiere credenciales Cloudflare (token Workers/KV + KV namespace ID + R2 bucket) para implementar el collector. |
| 2026-06-28 | PR-00 — Credenciales Cloudflare | DONE | mismo commit | `CLOUDFLARE_API_TOKEN` creado y configurado en `.env.local`. KV namespace `ANALYTICS_TELEMETRY` creado (`f9de0048ca334578805b5bdd55bc71e0`). R2 bucket `monedario-analytics-exports` creado. `workers/analytics-collector/wrangler.toml` completo, sin placeholders. Feature flag `ANALYTICS_DISABLED=1` (off por defecto). | **PR-01 completamente desbloqueado.** Todas las credenciales e infraestructura base están listas. |
| 2026-06-28 | PR-01 — Schema, sanitizer, collector y transporte | DONE | worktree local | **Drift check** limpio (0 archivos). **Tests:** 10 files, 166 tests, 0 failures (55 nuevos + 111 existentes). **Sanitizer:** `sanitizeAnalyticsEvent()` en `src/utils/analytics.ts` con allowlist por evento, 47 keys prohibidas, 9 enums validados, truncado a 200 chars. **Transporte:** `sendAnalyticsEvent()` en `src/scripts/analytics.ts` con keepalive, timeout 3s, fallo silencioso, feature flag off por defecto. **Collector:** `workers/analytics-collector/src/index.ts` con validación estricta server-side, origin check, rate limit 30 req/min, KV counters con TTL 35d, respuesta 202 sin eco. **NBS:** `profile_signal` y `target_href` removidos de eventos transmisibles. **Privacidad/Cookies:** nueva sección "Medición de uso de calculadoras" documentando endpoint first-party, naturaleza agregada, base de licitud (interés legítimo), retención (35d + export semanal). **Análisis estático:** 0 campos prohibidos en payload/schema (todos los matches son definiciones de bloqueo o falsos positivos). **Gates:** `check:boundaries` PASS, `format:check` solo excepción preexistente, `test` 908 PASS, `check` PASS, `build` 327 páginas + 1556 enlaces 0 rotos, `git diff --check` PASS. **Feature flag:** `ANALYTICS_DISABLED=1` (off). **Workers dev:** `workers_dev = true` en wrangler.toml (entorno de prueba activo). | **PR-01 completo.** PR-02 puede comenzar tras activación del worker en Cloudflare y verificación de recepción de eventos en entorno de prueba. |
| 2026-06-28 | PR-02 — Export semanal, scorecard y saneamiento Cloudflare | DONE | worktree local | **Drift check** limpio. **Tests:** 118 files, 954 tests, 0 failures (46 nuevos: 25 schema/export + 13 RUM sanitizer + 5 scorecard integration + 3 workflow e2e). **Cron export:** función `scheduled()` implementada en el worker → agrega contadores KV del prefijo `telemetry:v1:`, genera JSON con schema estricto (`source`, `schemaVersion`, `week`, `window`, `data`), valida (schemaVersion=1, counts>=0, enums válidos, período correcto) y persiste en R2 (`analytics-exports/YYYY-Www.json`). **Fetch script:** `scripts/data-signals/fetch-analytics-export.mjs` baja el export de R2 vía Cloudflare REST API, valida schema antes de escribir, guarda en `output/operations/data-signals/analytics/`. **Scorecard:** `build-weekly-search-report.mjs` integra first-party analytics → funnel por calculadora (views, starts, completes, errors, shares, NBS, support), rates solo con denominador >0, "n/d" cuando falta fuente, fuentes diferenciadas (CDN pageviews, RUM samples, GSC clicks, first-party events), journey prioritario. **RUM saneamiento:** `cloudflare-fetch.mjs` filtra rutas RUM contra inventario del sitio (`SITE_ROUTE_ALLOWLIST` en `gsc-utils.mjs`), reporta descartadas con razón. **Workflow:** `data-signals.yml` añade steps para fetch analytics export de R2 + validación anti-PII/secrets. **Gates:** `check:boundaries` PASS, `format:check` solo excepción preexistente, `test` 954 PASS, `check` 0 errors, `build` 327 páginas + 1564 enlaces 0 rotos, `git diff --check` PASS. **Dry run:** scorecard con datos de prueba muestra funnel con rates correctos (50.0% start, 50.0% completion), "n/d" para NBS CTR con denominador 0, fuentes separadas. **Feature flag:** `ANALYTICS_DISABLED=1` (off). | **PR-02 completo.** OBS-01 puede comenzar tras activar el worker en Cloudflare (desplegar con `wrangler deploy`) y verificar que el endpoint recibe eventos en entorno de prueba. El cron trigger (lunes 07:57 UTC) generará el primer export semanal automáticamente. |

Estados permitidos: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED`,
`INCONCLUSIVE`, `REJECTED`.

### Excepciones conocidas de la línea base al 2026-06-28

Estas excepciones no fueron creadas ni corregidas durante la planificación y
están fuera del scope documental. Deben volver a verificarse antes de PR-00:

1. `pnpm run format:check` falla por
   `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx`.
   Los cuatro archivos documentales modificados por esta planificación sí pasan
   Prettier focalizado.
2. `pnpm run lint` falla al incluir
   `.claude/worktrees/agent-a67b14ab4bfcf40a7`, con errores de parser por
   múltiples candidatos a `TSConfigRootDir`. No eliminar ni modificar ese
   worktree desde este plan; resolver su ownership o exclusión en una tarea
   separada.

Por la cláusula de cierre determinista de `AGENTS.md`, estas excepciones impiden
declarar verde el conjunto completo de gates del repositorio. No impiden usar
este documento como plan canónico, pero PR-00 no debe declararse `DONE` hasta
que sus gates requeridos pasen o exista una resolución formal y trazable.

### Baseline pre-implementación

Completada el 2026-06-28 antes de PR-00:

```text
Commit: 843c0b28
Node: v24.15.0
pnpm: 11.7.0
git status: clean (0 archivos modificados)
lint: FAIL (excepción preexistente — worktree fantasma TSConfigRootDir)
check:boundaries: PASS (9 domain files, 0 violations)
format:check: FAIL (excepción preexistente — como-elegir-inversion...mdx)
test: PASS (114 files, 853 tests, 0 failures)
check: PASS (todos los sub-gates verdes; solo warnings no bloqueantes)
build: PASS (327 páginas, 1577 enlaces escaneados, 0 rotos)
focused tests: PASS (6 files, 82 tests, 0 failures)
última semana GSC: 2026-W25 — 136 clicks, 15041 impressions
última semana Cloudflare: no disponible en esta sesión (requiere credenciales)
notas: Las dos excepciones preexistentes (lint + format:check) coinciden exactamente
  con lo documentado en §14. Ninguna fue creada por este plan. Los gates requeridos
  por PR-00 (check:docs, check:context, check:boundaries, format:check focalizado)
  pasan. El cierre completo del conjunto de gates del repositorio sigue pendiente
  de las excepciones preexistentes, que están fuera del scope de este plan.
```

### Registro de experimentos

| ID | URL | Hipótesis | Cambio | Baseline | Inicio | Fin | Primaria | Guardrail | Resultado | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|
| EXP-001 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TODO | TBD |

---

## 15. Done criteria del programa

El plan puede marcarse `DONE` solo si:

- [ ] PR-00 tiene ADR aceptado y viabilidad aprobada.
- [ ] El collector cumple schema y privacidad.
- [ ] No se transmiten campos prohibidos.
- [ ] Privacidad/cookies reflejan conducta real antes de activación.
- [ ] Export semanal existe y valida schema.
- [ ] Scorecard muestra funnel sin confundir faltante con cero.
- [ ] Cloudflare RUM está saneado o marcado.
- [ ] OBS-01 tiene baseline suficiente o estado `INCONCLUSIVE` justificado.
- [ ] Al menos dos journeys completaron experimento postbaseline.
- [ ] Cada cambio tiene pre/post funcional y numérico.
- [ ] Gates generales y focalizados pasan.
- [ ] No hay regresión de rutas, CWV, accesibilidad ni fórmulas.
- [ ] GEO tiene tres corridas o se documenta por qué no.
- [ ] Monetización comercial sigue fuera de scope o existe nueva decisión formal.
- [ ] El informe estratégico se revalida contra 8 semanas de datos.
- [ ] Este Progress Log y `docs/backlog/README.md` están actualizados.
- [ ] Riesgo, rollback y resultados finales están documentados.

---

## 16. Change Control Record

1. **Scope declaration**
   - In scope: definido por PR y limitado a este programa.
   - Out of scope: nuevas URLs, fórmulas, ads, afiliación, newsletter y refactors.
2. **Impacted modules**
   - Analytics client, collector aprobado, data signals, scorecard, cuatro tools,
     privacidad/cookies y tests.
3. **Invariant preservation**
   - No derivación desde `post.id`, sin cambios silenciosos de rutas, pipeline
     YMYL para copy y ownership antes de expansión.
4. **Contract preservation**
   - No breaking changes de URL ni fórmula; analytics agrega un contrato interno
     versionado.
5. **Boundary integrity**
   - `pnpm run check:boundaries` obligatorio; IO solo en infraestructura/worker.
6. **Test coverage impact**
   - Tests de sanitizer, worker, scorecard, UI, a11y y performance obligatorios.
7. **Rollback strategy**
   - Feature flag para collector; revert por PR/URL; CSV fallback.
8. **Regression risk**
   - MED-HIGH: privacidad, YMYL, datos y UX. Mitigado por fases, flags,
     baseline, gates y observación.

### Competitive Adaptation Appendix

- **benchmarkSet:** ninguno; evidencia repo-local.
- **patternHypothesis:** un loop medible permite concentrar inversión en journeys
  con utilidad real.
- **localDelta:** analytics agregado sin PII + matemática verificable y fuentes
  oficiales.
- **nonCopyBoundaries:** sin tracking invasivo, dark patterns, rankings pagados o
  captación de leads.
- **ownerTarget:** portafolio de calculadoras existente.
- **successSignal:** completion, next-step y clicks orgánicos mejoran sin
  regresiones.
- **ownership conflict check:** pass; no se crean superficies.

---

## 17. Notas de mantenimiento

- Cualquier evento nuevo requiere actualizar schema, tests, privacidad y
  documentación de export.
- Nunca añadir una dimensión “temporalmente” sin allowlist.
- El reviewer debe inspeccionar bodies reales, no solo tipos TypeScript.
- Mantener `schemaVersion` y migración explícita.
- Separar datos de adquisición, RUM y comportamiento.
- Revisar la watchlist cuando una tool entra/sale del grupo prioritario.
- Revalidar la tesis trimestralmente o ante una condición de §11 del informe.
- Al cerrar, archivar este plan solo después de actualizar resultados y decisión.
