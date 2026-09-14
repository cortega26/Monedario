# ADR-20260628-first-party-analytics

Date: 2026-06-28
Status: Accepted

## Context

### Situación actual

Monedario opera 22 calculadoras que concentran el 89,3 % de los clics orgánicos
(333/373 en snapshots GSC W16–W25). El sitio emite eventos client-side a
`window.dataLayer` (`calculator_start`, `calculator_complete`, `next_best_step_shown`,
clicks de CTA, scroll editorial, share, resume), pero el transporte está deshabilitado
por decisión de `TD-0084`: Cloudflare-only, sin Google Analytics ni terceros.

El runbook pospuso la activación de `analytics-events.csv` hasta superar
aproximadamente 100 clics semanales. W25 llegó a 136. Sin embargo, el sitio no puede
distinguir adquisición de uso: no sabe si una visita inicia o completa un cálculo, qué
siguiente paso funciona ni qué feature genera retorno.

El plan canónico `docs/backlog/PLAN-calculator-led-growth-2026-06-28.md` designa la
medición first-party agregada como primer habilitador del crecimiento liderado por
calculadoras.

### Restricciones de diseño

El diseño debe satisfacer simultáneamente:

1. **Promesa pública actual**: la home afirma "sin recolección de datos" y la política
   de privacidad declara Cloudflare Web Analytics como única analítica, sin cookies,
   sin identificadores persistentes y sin perfilamiento individual.
2. **Contratos editoriales e invariantes**: `URL.PUBLIC.NO_POST_ID`,
   `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`,
   `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.
3. **Criterio de viabilidad**: `docs/development/CRITERIO_VIABILIDAD.md` exige
   evaluación realista de acceso a datos, restricciones legales, factibilidad técnica
   y contexto de negocio.
4. **Ley chilena de protección de datos**: Ley N° 21.719 (protección de datos
   personales) y Ley N° 19.628 (protección de la vida privada). La información
   agregada y anónima no constituye "dato personal", pero el tratamiento debe ser
   proporcionado, transparente y con base de licitud clara.
5. **Stop conditions del plan** (§13): la arquitectura no puede requerir PII,
   cookies, fingerprint, user ID, raw event logs, ni recomendación personalizada.

## Decision

### Arquitectura elegida

**Cloudflare Workers + KV para recolección first-party de eventos agregados.**

El Worker:

1. Recibe `POST` en endpoint same-origin (`https://monedario.cl/api/analytics/event`)
   con `Content-Type: application/json`.
2. Valida el payload contra un schema estricto por evento (allowlist de keys, enums,
   límites de string).
3. Rechaza keys desconocidas, payloads >2 KB, origins ajenos y métodos no-POST.
4. Incrementa contadores en KV con clave compuesta:
   `telemetry:v1:{date}:{event_name}:{calculator_slug}:{dimension}`.
5. Responde `202 Accepted` sin eco del payload.
6. Un cron trigger semanal agrega los contadores KV, genera un JSON con schema
   `{source, schemaVersion, week, window, data: [...]}` y lo persiste en R2 o en el
   repositorio vía GitHub API.
7. Los contadores KV se mantienen con TTL de 35 días (5 semanas) para permitir
   recálculo y auditoría, tras lo cual caducan automáticamente.

### Contrato de eventos congelado

Se adopta el contrato definido en el plan §7.1 y §7.2. Eventos permitidos:

| Evento | Dimensiones permitidas |
|---|---|
| `calculator_view` | `page_type`, `calculator_slug` |
| `calculator_start` | `calculator_slug`, `interaction_type` |
| `calculator_complete` | `calculator_slug`, `outcome_class` (enum no financiero) |
| `calculator_error` | `calculator_slug`, `error_code` (allowlist) |
| `next_best_step_shown` | `calculator_slug`, `rule_id`, `position` |
| `next_best_step_click` | `calculator_slug`, `rule_id`, `position` |
| `result_action_click` | `calculator_slug`, `action_id` |
| `share_result_click` | `calculator_slug`, `channel` |
| `scenario_action` | `calculator_slug`, `action` (save/load/compare/delete) |
| `resume_click` | `item_type`, `item_id` (allowlist) |
| `support_page_click` | `page_type`, `source_context` |
| `official_source_click` | `page_type`, `source_domain` (allowlist) |

### Campos prohibidos (validados en el Worker)

- Valores de input (sueldo, deuda, pensión, AFP, montos, impuestos).
- Resultados financieros de cualquier tipo.
- Query strings.
- Destination URL completa.
- Texto de labels, errores o reglas.
- `profile_signal`, `rationale` o contenido de reglas.
- Email, RUT, nombre, teléfono.
- IP, user-agent persistido.
- Cookie ID, fingerprint, session ID, user ID.
- Referrer completo cuando pueda contener query string.
- Timestamps de precisión inferior a día en el artefacto operativo.

### Modelo de amenazas

#### Activos a proteger

1. **Identidad del visitante**: que un evento aislado o agregado permita
   reidentificar a una persona natural.
2. **Resultados financieros**: que un evento revele el salario, deuda, pensión,
   impuesto o resultado de un cálculo.
3. **Integridad de la métrica**: que un tercero pueda inflar contadores y distorsionar
   decisiones de producto.
4. **Coherencia de la promesa pública**: que el comportamiento real del sitio
   contradiga lo declarado en `/privacidad/`, `/cookies/` y `/`.

#### Actores de amenaza

| Actor | Capacidad | Mitigación primaria |
|---|---|---|
| Visitante curioso | Inspeccionar payload en DevTools | Schema no incluye campos sensibles; el payload solo transporta allowlist |
| Bot oportunista | POST masivo a `/api/analytics/event` | Rate limit Cloudflare + origin check + schema estricto |
| Atacante con acceso a KV | Leer contadores acumulados | Los contadores no contienen PII por construcción; el valor es `count: N` |
| Atacante con acceso al repo | Leer export semanal | El JSON agregado no contiene eventos individuales ni dimensiones no allowlist |
| Error de implementación | `profile_signal` o input se cuela en el payload | Sanitizer client-side + validación server-side con rechazo de keys desconocidas |

#### Superficie de ataque

1. **POST endpoint**: única superficie expuesta. Defensa: origin check, schema
   estricto, rate limit Cloudflare, body máximo 2 KB, sin eco.
2. **Cliente (bundle JS)**: el sanitizer se ejecuta en el navegador. Defensa: el
   Worker revalida todo server-side; el cliente no es la frontera de confianza.
3. **KV**: los contadores son numéricos y no contienen PII. Defensa: la clave es
   determinista y no incluye IP, cookie ni identificador.
4. **Export semanal**: artefacto JSON en el repo. Defensa: solo contiene agregados con
   dimensiones allowlist; sin timestamps finos ni eventos individuales.

#### Análisis de privacidad diferencial informal

Con el esquema propuesto, un contador KV tiene la forma:

```
telemetry:v1:2026-06-28:calculator_complete:seguro-cesantia:success → count: 15
```

Un atacante con acceso a KV podría saber que 15 personas completaron el cálculo de
seguro de cesantía el 28 de junio de 2026. Esto no revela quiénes, con qué salario, ni
con qué resultado. No existe link entre eventos de una misma persona (sin session ID,
sin cookie, sin fingerprint). La agregación diaria por calculadora + outcome_class es
el nivel de granularidad mínimo necesario para calcular rates de funnel, y es
comparable a la granularidad de Cloudflare Web Analytics que ya se declara en la
política de privacidad.

#### Riesgos residuales aceptados

1. **Burst de un mismo evento por una misma persona**: si un visitante completa el
   cálculo 5 veces en un día, el contador se incrementa 5 veces. Esto es aceptable: el
   rate se calcula sobre denominadores reales y no distorsiona decisiones agregadas.
2. **Replay de payload**: un atacante que capture un payload válido puede reenviarlo.
   Como los contadores son numéricos y no hay estado de sesión, el replay solo
   incrementa el contador. Esto es aceptable para métricas de producto; se mitiga
   parcialmente con rate limiting.
3. **Correlación temporal**: en teoría, un adversario con acceso a logs HTTP de
   Cloudflare (que incluyen IP y timestamp) y acceso a KV (que incluye date y event)
   podría correlacionar timestamps para asociar IPs a eventos. Este riesgo se mitiga
   porque: (a) Cloudflare Web Analytics ya expone page views por ruta, que es una
   señal comparable; (b) Monedario no tiene acceso a IPs individuales; (c) los
   contadores KV no incluyen hora ni minuto.

## Consequences

### Impacto positivo

1. **Señal operativa**: por primera vez, el sitio podrá medir start rate, completion
   rate, error rate, next-step CTR y share rate por calculadora.
2. **Decisiones basadas en evidencia**: cada optimización de journey tendrá baseline
   pre y post.
3. **Independencia de terceros**: sin dependencia de Google Analytics, GSC, o
   proveedores externos de analytics.
4. **Coherencia con la promesa**: la implementación respeta el espíritu y la letra de
   la política de privacidad actual (sin cookies, sin identificadores persistentes,
   sin perfilamiento, sin PII).
5. **Costo near-zero en la escala actual**: ~136 clics semanales generan
   aproximadamente 500–1000 eventos, muy por debajo de los límites gratuitos de
   Workers (100 k requests/día) y KV (100 k lecturas/día, 1 k escrituras/día).

### Trade-offs

1. **Sin atribución de sesión**: no se puede medir "cuántas personas que empezaron el
   cálculo de seguro de cesantía luego usaron Operación Renta". Esto es deliberado: la
   atribución entre calculadoras requeriría un identificador persistente.
2. **Agregación diaria mínima**: el día es la granularidad más fina. No se puede
   medir hora pico ni dayparting. Esto es aceptable para las decisiones actuales
   (funnel, CTR, error rate semanal).
3. **Consistencia eventual de KV**: los contadores pueden tener un desfase de hasta
   60 segundos. Esto es irrelevante para export semanal, pero significa que dos
   escrituras concurrentes al mismo contador pueden perder una si no se usa
   `metadata` con `etag`. Se usará `KV.get` + `KV.put` con verificación para mitigar.
4. **Sin dashboard en tiempo real**: el export es semanal. Esto es suficiente para el
   ciclo de decisión del plan.

### Costo operativo mensual estimado

| Recurso | Volumen estimado (escala actual) | Límite gratuito | ¿Paga? |
|---|---|---|---|
| Worker requests | ~4 000/mes | 100 k/día (3 M/mes) | No |
| KV reads | ~4 000/mes (export) | 100 k/día | No |
| KV writes | ~4 000/mes (eventos) | 1 k/día | Posible (4 000 > 30 k/mes gratis) |
| KV storage | ~500 keys × 100 B = 50 KB | 1 GB | No |
| R2 storage (export) | ~100 KB/mes | 10 GB | No |

Incluso en el límite superior de writes (4 000/mes ≈ 133/día), el costo mensual sería
<$0.01 con la tarifa de KV ($0.50/millón de escrituras). No se requiere aprobación de
presupuesto.

### Actualización de privacidad/cookies requerida antes de activación

Antes de habilitar el transporte (PR-01), las páginas `/privacidad/` y `/cookies/`
deben actualizarse para reflejar:

1. La existencia de un endpoint first-party que recibe eventos de uso agregados.
2. La naturaleza de los datos transmitidos (eventos allowlist, sin PII, sin cookies,
   sin identificadores).
3. La base de licitud (interés legítimo para medición agregada y anónima de un
   servicio público).
4. La retención (contadores agregados, no eventos individuales; export semanal al
   repositorio; caducidad de contadores a 35 días).

Esta actualización es **prerrequisito bloqueante** para PR-01.

## Alternatives considered

### Alternativa A — Cloudflare Analytics Engine (Workers Analytics Engine)

API: `env.ANALYTICS.writeDataPoint({blobs: [...], doubles: [...], indexes: [...]})`.

- **Ventajas**: agregación automática, consulta SQL-like, retención 90 días, sin
  administrar KV.
- **Desventajas**: producto en beta (sin SLA, API puede cambiar); export
  programático limitado (no hay API REST documentada para extraer datos agregados
  fuera del dashboard); dependencia de un producto que Cloudflare podría modificar o
  deprecar; el modelo de `blobs`/`doubles`/`indexes` es menos explícito sobre qué se
  almacena.
- **Descarte**: la falta de export programático confiable rompe el requisito de
  "export semanal repo-local". La beta introduce riesgo de breaking change sin aviso.

### Alternativa B — Cloudflare Workers + D1 (SQLite)

- **Ventajas**: consistencia transaccional, queries agregadas potentes, schema
  explícito.
- **Desventajas**: D1 requiere migraciones, esquema y mantenimiento; costo base mayor
  ($5/mes mínimo por base); la complejidad es desproporcionada para ~500
  eventos/semana.
- **Descarte**: sobre-ingeniería para el volumen actual. Podría reconsiderarse si el
  volumen crece 100×.

### Alternativa C — Cloudflare Workers + Durable Objects

- **Ventajas**: consistencia fuerte, exact-once semantics, ideal para contadores.
- **Desventajas**: costo más alto ($0.15/millón de requests + storage); complejidad
  de implementación; curva de aprendizaje.
- **Descarte**: la consistencia eventual de KV es aceptable para métricas agregadas
  semanales; DO no se justifica a esta escala.

### Alternativa D — Google Analytics 4 / Plausible / Fathom / Umami

- **Ventajas**: dashboards existentes, zero-code.
- **Desventajas**: requieren cookies o fingerprint (GA4, Plausible, Fathom); envían
  datos a un tercero (todos); Umami self-hosted requiere servidor; contradicen la
  decisión Cloudflare-only de TD-0084.
- **Descarte**: incumplen la promesa de privacidad y la arquitectura Cloudflare-only.

### Alternativa E — No hacer nada (status quo)

- **Ventajas**: sin riesgo de implementación ni privacidad.
- **Desventajas**: el sitio sigue ciego a completion, navegación y recurrencia; las
  decisiones de producto se toman sin evidencia; el plan de crecimiento queda
  bloqueado en su primer habilitador.
- **Descarte**: el umbral de 100 clics semanales ya se superó; la condición de
  reapertura de analytics se cumplió. No medir es la decisión más riesgosa para el
  crecimiento sostenible del proyecto.

## Verification

### Gates pre-implementación (PR-00)

```bash
pnpm run check:docs        # Exit 0 — el ADR pasa validación estructural
pnpm run check:context     # Exit 0 — invariantes y contratos intactos
pnpm run check:boundaries  # Exit 0 — sin imports cruzados
pnpm run format:check      # Exit 0 sobre los archivos modificados
```

### Gates pre-activación (PR-01, no ejecutar ahora)

```bash
# Schema y sanitizer
pnpm exec vitest run tests/integration/analytics-utils.test.ts tests/workers

# Verificación estática de campos prohibidos
rg -n 'profile_signal|sueldo|deuda|monto|resultado|email|rut|user_id|session_id' \
  src/scripts/analytics.ts src/utils/analytics.ts src/scripts/next-best-step.ts workers

# Smoke test funcional con inspección de payload
```

### Criterios de revisión de esta decisión

Esta arquitectura debe reabrirse si ocurre cualquiera de estas condiciones:

1. El volumen supera 50 000 eventos/semana (KV writes podrían exceder el free tier).
2. Se necesita atribución entre calculadoras (requiere identificador de sesión, lo que
   exige un nuevo ADR y actualización de privacidad).
3. Cloudflare Analytics Engine sale de beta con export programático documentado.
4. La Ley N° 21.719 o normativa de la Agencia de Protección de Datos Personales
   introduce requisitos adicionales para datos agregados.
5. Un incidente de seguridad o privacidad revela un vector no anticipado en este
   modelo de amenazas.
6. La tesis de crecimiento liderado por calculadoras se invalida según la regla de
   reinterpretación futura del informe de auditoría (§11 de
   `docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md`).

## Rollback

1. **Feature flag a `off`**: el cliente deja de enviar eventos (sin cambios en
   `dataLayer`).
2. **Revertir Worker**: eliminar el worker o deshabilitar su ruta.
3. **Limpiar KV**: ejecutar `wrangler kv:bulk delete` sobre el prefijo `telemetry:`.
4. **Revertir privacidad/cookies**: restaurar la versión anterior si ya se había
   actualizado.
5. **Artefactos de export**: conservar los JSON generados para auditoría; no
   reinterpretar su ausencia como cero eventos.

## Sign-offs requeridos

| Sign-off | Tipo | Estado | Responsable |
|---|---|---|---|
| Aprobación de la arquitectura de analytics | Producto/técnica | **Aprobado** (2026-06-28) | Carlos Ortega |
| Conformidad con ley chilena de protección de datos | Legal | **Aprobado** (2026-06-28, Carlos Ortega revisa y aprueba el ADR) | Carlos Ortega |
| Actualización de privacidad/cookies | Editorial/legal | Bloquea PR-01 | PR-01 (sesión futura) |
| Credenciales Cloudflare (token+KVID+R2) | Infraestructura | Bloquea PR-01 | Carlos Ortega |

**Los primeros dos sign-offs están completos. PR-01 puede comenzar una vez que se disponga de las credenciales Cloudflare.**

### Decisiones que NO puede tomar esta sesión

- Aprobar la arquitectura en nombre del responsable legal.
- Determinar que la base de "interés legítimo" es suficiente bajo la Ley N° 21.719
  sin revisión de un abogado chileno.
- Crear o rotar credenciales Cloudflare.
- Actualizar las páginas de privacidad y cookies (eso corresponde al PR-01, que debe
  ejecutarse en una sesión separada con los sign-offs ya obtenidos).

## Amendment 2026-09-14 — worker-v2 hardening (plans 097/098)

Date: 2026-09-14. Docs-only note; no design change to the decision above.

The hot ingestion path from "Arquitectura elegida" has since migrated: new
events write only to the SQLite-backed Durable Object (`AnalyticsCounters`
in `workers/analytics-collector/src/worker-v2.ts`) and rate limiting uses
the native Workers Rate Limiting binding (`ANALYTICS_RATE_LIMITER`, 30/min).
The legacy KV namespace (`ANALYTICS_TELEMETRY`) is read-only with its
35-day TTL until historic counters expire; new ingestion never writes to KV.
The weekly export (`runExportV2`) mixes both sources — legacy KV rows plus
Durable Object rows — so a mid-week cutover is preserved without
double-writing.

- Plan 097 added the bounded streaming body reader (byte-counted 2 KB cap,
  413 on overflow) without changing the quota rationale: ~4 000
  requests/month stays far below the Workers free tier, and KV writes left
  the hot path entirely.
- Plan 098 hardened `worker-v2` config and input validation:
  `MAX_BODY_SIZE` / `ALLOWED_ORIGIN` resolve from env with
  compiled-constant fallback (no dead `wrangler.toml` vars),
  `SCHEMA_VERSION` fails closed on NaN/range, manual-export weeks validate
  01–53 with an ISO round-trip check, and limiter keys trust only
  `CF-Connecting-IP`.

Verification gates for this note: `npx tsc --noEmit -p
workers/analytics-collector/tsconfig.json` and `pnpm exec vitest run
tests/workers/analytics-collector/root-cause.test.ts` (root-cause,
byte-limit, and validation guards, all passing).
