# Implementation Plans

## Auditoría UX externa 2026-09-28 — plan 114 (Fase 1)

Selección del mantenedor: «Todas las net-positive». La auditoría adversarial
completa quedó como evidencia en `docs/reports/AUDIT-UX-2026-09-28.md`; el
plan 114 implementa la Fase 1 (F-01 a F-04 + guardas) y difiere F-05 a F-10 a
Fase 2/3.

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|-------|----------|--------|------------|--------|
| 114 | [ux-audit-remediation-2026-09-28.md](114-ux-audit-remediation-2026-09-28.md) | P1 | L | — | DONE (F-01 a F-10 y `TD-0111` resuelto; remanente: pasada manual NVDA/VoiceOver) |
| 115 | [correctness-remediation-2026-09-28.md](115-correctness-remediation-2026-09-28.md) | P0 | L | — | DONE (F04 cerrado con extensión IPC oficial BCCh/INE; `TD-0112` resuelto; falta math audit/compliance humano) |
| 116 | [seo-remediation-2026-09-28.md](116-seo-remediation-2026-09-28.md) | P1 | M | — | DONE (SEO-01/03/04/07 + guardas; Fase 2: SEO-02/05/06/08) |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) | REJECTED (with one-line rationale)

## Auditoría SEO 2026-09-28 — Fase 2 (planes 117–120)

Derivados del informe `docs/reports/AUDIT-SEO-2026-09-28.md`; el plan 116 cerró
la Fase 1 (SEO-01/03/04/07 + guardas). Los cuatro planes de Fase 2 quedaron
implementados con las decisiones recomendadas: 2 herramientas globales (117),
guardas JSON-LD (118), piloto de gobernanza de intención — queda dedupe de
contenido YMYL con revisión humana (119) y contrato de indexabilidad + ADR con
SEO-08 opción A (120).

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|-------|----------|--------|------------|--------|
| 117 | [linking interno por prioridad de producto](117-seo-linking-interno-2026-09-28.md) | P2 | M | decisión del mantenedor | DONE (2 globales; 12 estratégicas ≥ 3; `check:calculator-interlinks`) |
| 118 | [structured data por template](118-seo-structured-data-2026-09-28.md) | P3 | M | — | DONE (claims stale; guardas `jsonld-parse` + `jsonld-breadcrumb-final-canonical`) |
| 119 | [gobernanza de intención: Operación Renta](119-seo-intencion-operacion-renta-2026-09-28.md) | P2 | M | decisión del mantenedor + revisión editorial | DONE (piloto opción A: guía como hub + guarda `guide-intent-registry`; dedupe de contenido YMYL remanente) |
| 120 | [contrato de indexabilidad declarativo](120-seo-contrato-indexabilidad-2026-09-28.md) | P2 | L | decisión del mantenedor (SEO-08) + ADR | DONE (contrato + 5 guardas + ADR + invariante; SEO-08 opción A) |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) | REJECTED (with one-line rationale)

## Auditoría de privacidad y seguridad pasiva 2026-09-29 — plan 121

Informe: `docs/reports/AUDIT-PRIVACY-2026-09-29.md`. Resultado: PASS fuerte en
canarios (4/4 LOCAL_ONLY); sin P0/P1. PRIV-03 (headers) quedó resuelto con
evidencia live en la verificación del agente; PRIV-01/02 son P3 de
observabilidad/persistencia. Hardening central: convertir la propiedad
"input/resultado financiero ∩ payload saliente = ∅" en invariante con E2E.

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|-------|----------|--------|------------|--------|
| 121 | [privacy-remediation-2026-09-29.md](121-privacy-remediation-2026-09-29.md) | P3 + hardening | M | decisión del mantenedor (F1) | DONE (PRIV-01/02/03 resueltos; `test:privacy` 8 tests + invariante + CI) |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) | REJECTED (with one-line rationale)

## Deuda técnica 2026-09-29 — plan 123 (TD-0109)

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|-------|----------|--------|------------|--------|
| 123 | [finiquito-audit-remediation-2026-09-29.md](123-finiquito-audit-remediation-2026-09-29.md) | P2 (YMYL) | M | — | DONE (6 defectos corregidos con vectores dorados; pendiente auditoría IA del fix + firma humana) |
| 124 | [audit-ai-remediation-2026-09-29.md](124-audit-ai-remediation-2026-09-29.md) | P1 (YMYL) | M–L | auditoría IA plan 115 (CONDITIONAL) | DONE (D1–D8 corregidos; pendiente re-auditoría en sesión fresca + firma humana) |
| 125 | [reaudit-remediation-2026-09-29.md](125-reaudit-remediation-2026-09-29.md) | P1 (YMYL) | M | re-auditoría IA (CONDITIONAL) | DONE (D9–D12 + obs. 1/2 corregidos; pendiente re-auditoría final + firma humana) |
| 126 | [audit-scope-sweep-2026-09-29.md](126-audit-scope-sweep-2026-09-29.md) | P3 | S | re-auditoría Muse Spark (D13) | DONE (V6/V4/S2 del scope + guarda de consistencia; propuesta de `surface` en el protocolo) |
| 127 | [surfaces-sweep-d14-d15-2026-09-29.md](127-surfaces-sweep-d14-d15-2026-09-29.md) | P1 (YMYL) | M | re-auditoría pass3 (D14/D15) | DONE (superficies DAP y tasa de honorarios por año + 2 guardas + matriz de superficies + prompt v2; revisión editorial humana pendiente) |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) | REJECTED (with one-line rationale)

## Auditoría de resiliencia y performance 2026-09-29 — plan 122

Informe: `docs/reports/AUDIT-RESILIENCE-2026-09-29.md`. Resultado: sin P0/P1;
CWV de campo PASS (LCP 1,2 s / INP 93 ms / CLS 0). Verificación del agente:
RES-01 (input vacío → $0) y RES-02 (header sticky) **no reproducidos** en local
ni producción; RES-03 (botón "Volver arriba" a zoom 400%) y RES-04 (fallback
sin JS) accionables. Brecha de perf: PERF-005 (regresión móvil vs baseline).

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|-------|----------|--------|------------|--------|
| 122 | [resilience-remediation-2026-09-29.md](122-resilience-remediation-2026-09-29.md) | P2/P3 + hardening | M | — | DONE (RES-01/02 no-defecto con regresión; RES-03/04 corregidos; `test:resilience` 21 tests + invariantes + CI) |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) | REJECTED (with one-line rationale)

## Auditoría profunda 2026-09-14 — planes 097–113 (completa salvo 111 BLOCKED)

Sobre `0e506a8b`, selección del mantenedor: **«All the net-positive ones»**.
17 planes bundled (cada uno cubre 1–4 hallazgos co-ubicados del mismo área para
evitar conflictos de merge; la correspondencia hallazgo→plan está en la tabla).
Base: `0e506a8b`. Verificación de esta fase: solo escritura en `plans/`
(17 archivos nuevos + este índice); `git diff --check` sin errores. Ningún
criterio de aceptación ejecutado (son planes, no implementaciones).
QA de planificación: scopes, paths, SHA `0e506a8b`, secciones de aceptación/
STOP/rollback y enlaces del índice verificados por lectura directa del código
citado (los extractos vienen de lecturas propias, no de reportes delegados).

### Orden de ejecución y estado

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|-------|----------|--------|------------|--------|
| 111 | [vehicle decision spike](111-vehicle-decision-spike.md) | P2 | S | — | BLOCKED (no complete post-083 week yet — W37 export truncated to 5 dates; re-run on a complete 7-day week) |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) | REJECTED (with one-line rationale)

Recomendación operativa: 097→098→099→100 en serie estricta (mismo archivo
worker); 108 antes que 107 (el helper de guardado precede al adaptador);
101/102/103/104/105/106 en paralelo entre sí una vez 097–100 van en serie;
109/110 docs/DX en paralelo en cualquier momento (110 re-chequea drift si
coincide con 097–100); 111/112/113 spikes en paralelo (112 coordina
taxonomía con 100, sin dependencia de código).

### Notas de dependencia (2026-09-14)

- **098 tras 097**: mismo `worker-v2.ts` (reader vs validación); el drift check
  de 098 lo exige.
- **099 tras 097+098**: export + validación tocan las mismas regiones; los
  tests de 099 asumen el reader y la validación nuevos.
- **100 tras 097+098+099**: sus tests pinean el comportamiento nuevo; correrlo
  antes daría falsos rojos/verdes.
- **107 tras 108**: el adaptador compartido se construye sobre el helper de
  guardado extraído en 108.
- **110 tras 097–100 si coinciden en el tiempo**: líneas distintas del mismo
  worker; el drift check manda.
- **112 coordina con 100**: una sola taxonomía (nombres de eventos); sin
  dependencia de código.

### Hallazgos considerados y rechazados (2026-09-14)

- **Unificación CLP (TECHDEBT-08 standalone)**: hecho — plan 080 DONE y
  archivado (2026-08-11). No se re-planifica; el plan 107 lo respeta como borde.
- **Colapso de walks post-build en un pase (PERF-04)**: diferido — el script
  `check-postbuild.mjs` es del plan 081 DONE; re-arquitecturarlo sin medida de
  build es riesgo sin retorno. Reabrir solo con perfil de tiempos.
- **Caracterización completa sueldo-líquido (TEST-05 full)**: diferido — L,
  congela comportamiento que debe revisarse contra SII/tabla antes; el slice
  útil (save-adapter) va en 108.
- **Split god-module formController / regroup utils / page splits (TECHDEBT-05/10/18)**:
  no net-positive ahora (M, churn de imports, freeze de títulos) — reabrir con
  diseño de seams.
- **Reemplazo LHCI, promoción knip a bloqueante, paralelización check:ci,
  scope self-heal, hooks con --fix, consolidación installs, cachés CI,
  checker de excludes**: gobierno/M o necesidades de diseño — no planes de
  código ahora; constan como diferidos.
- **Investiga-solamente LOW (sufijo official-host, timer flakes, shield hash
  vs pagefind-worker append, ClientRouter/defer, OG JPEG dual pipeline, TTFs
  en /fonts/, reddit fan-out paralelo, sanitize rename, inline-style survey,
  PERF-12–18, SEC-11, TEST-12/13, CORR-19 scope, DO single-shard, waitUntil,
  ventana UTC vs America/Santiago)**: olor sin medida o con decisión ADR
  pendiente — no se venden como fixes; el plan que los roza los deja como
  assert/investigate acotado (099 §3) o los cita como diferidos.
- **Discord markdown, creds BCCH en query, error-reflection post-auth,
  hrefs editoriales (SEC-06/07/08/09)**: MED/LOW con bajo impacto productivo
  (canal ops, diseño de vendor, solo-autenticado, solo-editorial) — revisitar
  solo si esos workers/templates se tocan por otra razón.
- **zod 4.4.3 vs 4.5.4 / astro 7.2.9→7.3.1 float**: solo-transitivo / flotación
  `^` intencional — track en 106, sin plan propio.
- **Dimensiones con `:` (CORR-16 standalone)**: plegado como §3 del plan 099
  (assert-or-fix con migración versionada), no plan propio.
- **Purge de `public/pagefind` (plan 101, REJECTED 2026-09-14 sin despachar)**:
  la premisa era falsa en este árbol — `public/pagefind` está gitignored
  (`.gitignore:66`, cero archivos trackeados, cero historial), así que el peso
  stale (3,6 MB local vs 1,3 MB en `dist/`, verificado) nunca se commitea ni
  llega a producción (cada build hace `rm -rf dist/pagefind` antes de
  regenerar). Se disparó la condición STOP del propio plan
  («`public/pagefind` turns out gitignored»). Archivo movido a
  `archive/101-pagefind-public-purge.md`. Reabrir solo si `public/pagefind`
  vuelve a trackearse.

## Estado vigente — reconciliación 2026-09-12

**No quedan planes numerados pendientes de implementación.** Los últimos cuatro
(083–086) ya estaban integrados en `main`; se verificaron y archivaron.
087–096 también están integrados y archivados. Base revisada: `13c939ed`.

El [informe de reconciliación](RECONCILIATION-2026-09-12.md) contiene los commits,
59 tests focalizados pasando, evidencia W36 y límites de la verificación.
Siguen abiertos la captura del Gate D, la decisión sobre el titular
`INPUT_REQUIRED`/`WATCH`, la elección de vehículo del 085 y la instrumentación
diagnóstica del 086. Los deploys de 091/092 siguen registrados como pendientes;
esta revisión local no verifica el estado de producción.

Las secciones fechadas de auditoría y revisión conservadas abajo son históricas;
no constituyen una cola de ejecución. Para próximos pasos, usar el informe de
reconciliación y sus seguimientos, sin duplicar los planes cerrados.

## Selección completada — auditoría profunda 2026-09-06

Sobre `db9d07c8`, el mantenedor seleccionó **«Todos los net-positive»** del
[informe de auditoría](AUDIT-2026-09-06.md). Los siete hallazgos justifican un
arreglo acotado y dieron origen a **087–093**, ahora implementados y archivados.
La selección no autoriza por sí sola la publicación.

Sin pendientes en esta selección: los siete planes (087–093) están mergeados y archivados (ver Completados abajo).

**Completados de esta selección:** [087](archive/087-ci-coverage-enforcement.md) — CI y espejo local ejecutan el umbral de cobertura (mergeado 2026-09-12, merge `f111752b`, test `df8cc14e`; deriva UTM preexistente resuelta posteriormente por 095); [088](archive/088-profile-numeric-roundtrip.md) — perfil conserva decimales nativos y montos (mergeado 2026-09-12, fast-forward `4bb17a7d`); [089](archive/089-scenario-calculation-consistency.md) — escenarios guardan entradas y resultado del mismo cálculo (mergeado 2026-09-12, fast-forward `da033cb4`); [090](archive/090-python-audit-summary-integrity.md) — reporte Python distingue limpio, hallazgos e incompleto (mergeado 2026-09-12, fast-forward `218be569`); [091](archive/091-economic-refresh-idempotency.md) — refrescos sin cambios de datos no producen commits (mergeado 2026-09-12, fast-forward `b5805eed`; deploy del worker pendiente); [092](archive/092-analytics-bounded-body-read.md) — collector lee el body con límite de bytes (mergeado 2026-09-12, fast-forward `0ca87cda`; deploy del collector pendiente); [093](archive/093-git-audit-commit-summary.md) — exportador muestra el commit solicitado (mergeado 2026-09-12, fast-forward `4e7c22ae`).

**Orden histórico:** 087 recuperó la red de cobertura antes de los demás fixes;
era recomendación operativa, no dependencia funcional. La secuencia está
completa. No se autoriza despliegue por el solo hecho de seleccionar un plan.

**Criterio net-positive:** 089 ya mergeado (corregía resultados inconsistentes;
088, también mergeado, corregía entradas);
087/090/091/092/093 ya mergeados (controles/evidencia, idempotencia, límite del
endpoint y fix menor del exportador Git).

**No crear planes adicionales ahora:** las opciones de dirección siguen en sus
entregables 084–086. Cambiar clasificación de evidencia insuficiente, elegir el
vehículo postresultado o ampliar instrumentación requiere especificar esas
preguntas existentes, no duplicarlas como bugs nuevos. No hay nuevas superficies,
refactors generales, migraciones de framework ni cambios de parámetros financieros.
Los demás candidatos descartados/diferidos constan en el informe de auditoría.

**Numeración:** las menciones históricas a un posible «087» en los resultados de
084/086 eran propuestas sin archivo. No reservaban número: esos dos asuntos
siguen sin plan numerado y 087 corresponde ahora al gate de cobertura.
083–086 se reconciliaron y archivaron el 2026-09-12 (ver estado vigente).

**QA histórico de planificación (2026-09-06):** `pnpm run check:docs` exit 0; siete documentos con
scopes, paths, SHA, secciones de aceptación/STOP/rollback y enlaces del índice
verificados; `git diff --check` sin errores. No se reejecutaron tests de runtime
porque este encargo solo modificó planes. La suite y cobertura de la auditoría
son baseline, no evidencia de implementación de estos arreglos.

**Entrega histórica:** la planificación no hizo commit, push, PR, merge ni
deploy. Los planes se versionaron e implementaron en sesiones posteriores.

## Seguimiento 2026-09-12 — breakage preexistente detectado al cerrar 087 (094–096)

Sobre `ece35800` (087 ya mergeado y archivado), el cierre dejó tres gates en
rojo por causas ajenas a 087, verificadas en árbol prístino. El usuario pidió
fijarlas todas («dig into that and fix them»). Los tres planes ya se completaron.

**Completados de este seguimiento (nada pendiente):**
- [096](archive/096-lockfile-release-age-excludes.md) — installs/hooks/CI desbloqueados (mergeado 2026-09-12, merge `2e0fe2e0`, test `fdaf7cfa`).
- [094](archive/094-runner-portability.md) — runner portable en workflows de emergencia (fast-forward `59457be1`).
- [095](archive/095-sueldo-imponible-utm-refresh.md) — `check:editorial-timeliness` en verde, UTM septiembre 71721 (merge `edac4a33`, test `b4ce4a63`).

**Cierre:** los tres aterrizaron; `pnpm run check:ci` debe salir 0 completo (verificado al cerrar — ver fila de merge).


Auditoría inicial: `/improve deep` el 2026-06-11 (commit `8256c9d2`) → planes 001–019.
Re-auditoría: `/improve deep` el 2026-06-15 (commit `57ad5261`) → planes 020–023.
Follow-through de auditorías externas: `/improve` el 2026-06-17 (commit `fd2b5dff`) → planes 024–026.
Tercera auditoría profunda: `/improve deep` el 2026-06-19 (commit `9a4eb37d`) → planes 027–030.
Cuarta auditoría profunda: `/improve deep` el 2026-06-26 (commit `a7bb8b2e`) → planes 032–034.
Quinta auditoría profunda: `/improve deep` el 2026-07-10 (commit `520a8685`) → planes 035–038.
Auditoría de dirección: `/improve next` el 2026-07-12 (commit `0102b11a`) → spikes de dirección 045–046 (delta W27 sobre la auditoría canónica `GROWTH-DIRECTION-AUDIT-2026-06-28.md`, corte W25).
Auditoría de dirección: `/improve next` el 2026-08-02 (commit `0bd51540`) → planes 053–056 (delta sobre el memo de viabilidad estratégica `output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`, untracked; ventana de experimentos 2026-08-02 → 2026-11-02).
Séptima auditoría profunda: `/improve deep` el 2026-08-10 (commit `90370b4e`) → planes 057–081 (ver sección "Pendientes — séptima auditoría" más abajo).
Auditoría de dirección: `/improve next` el 2026-09-04 (commit `08a6b5b4`) → planes 083–086 (tercera pasada de dirección; delta sobre la ventana utility-led 2026-08-02 → 2026-11-02, con datos reales W31–W35 de `output/operations/data-signals/`).
Sexta auditoría profunda: `/improve deep` el 2026-07-16 (commit `efe021c7`) →
planes 048–052, basada en el bundle W28, el incidente del export first-party y
una revisión read-only de correctness, security, performance, architecture,
tests, DX, docs y direction. El plan 047 también quedó con su viabilidad externa
confirmada en vivo: Cloudflare RUM soporta `requestHost` como filtro/dimensión.
Foco de la quinta pasada: el delta desde la cuarta pasada (72 commits) y los módulos
nunca auditados. El núcleo maduro (matemática de calculadoras, engines, provider
económico) sigue limpio — reverificado. **Todos los hallazgos reales están en la
superficie nueva de analytics first-party + data-signals** (construida después del
2026-06-26), y comparten un olor: **jobs de datos que fallan en silencio escribiendo
vacío/cero en vez de errorar** (035, 036). Verificado limpio y NO reauditar: la
lógica de merge del snapshot económico (`383e93f3`, el `.slice()` sin guard es
inalcanzable porque `fetchLiveParameters` siempre puebla las fechas), los dos remark
plugins (el evaluador de variables económicas es un parser propio seguro, no `eval`),
i18n, `loadGoogleFont`, el `mergePrev` del worker (espeja al script correctamente).
**js-yaml v5**: `js-yaml@5.2.0` es release pública legítima (integrity del lockfile =
`npm view` de registry.npmjs.org, mismo maintainer); el commit de migración `979924a0`
está limpio; NO es problema de supply-chain. `pnpm audit --prod` limpio.
Foco de la cuarta pasada: terreno aún sin auditar — **semántica de accesibilidad**
de las calculadoras (gestión de foco, asociación de hints/errores, foco visible),
los dos endpoints JSON de runtime, la config de seguridad/CSP de Astro y la
corrección de datos estructurados (JSON-LD). Resultado clave: el único hallazgo de
alta palanca es el clúster de a11y en componentes compartidos de calculadora (032);
la matemática, los engines y la plomería de datos siguen limpios. La auditoría axe/
Playwright existente no detecta gestión de foco ni asociación de labels — de ahí el
hueco. Heads-up operativo (no es cambio de código): `.env:1` contiene una clave
OpenAI viva, correctamente gitignored y fuera del historial git (verificado); rotar
solo si esa máquina/.env se comparte — no se reproduce el valor.
Foco de la tercera pasada: terreno no auditado antes (los 57 scripts de build/CI,
el runtime cliente de las calculadoras, los 13 use-cases + módulos `shared` no
cubiertos el 2026-06-15, ambos workers + el provider económico, y tech-debt/deps/
tests/DX). Resultado clave: los motores de cálculo siguen limpios (0 bugs de
aritmética); los hallazgos reales están en la **plomería de frescura de datos**
alrededor de las calculadoras, no en la matemática.
Fuente: las dos auditorías en `docs/latest_audits/` (`deep-research-report (8).md`,
la precisa con muestreo de 50 URLs; y `Auditoría SEO Monedario Chile.md`, la
heurística sin acceso al sitio). Ya implementado fuera de plan: el bug del IMM
obsoleto (sueldo mínimo corregido a $553.553 como constante legal gestionada con
guard de regresión, commit `fd2b5dff`).

Séptima auditoría profunda: `/improve deep` el 2026-08-10 (commit `90370b4e`) → planes 057–081 (25), sobre el delta de 140 commits desde `efe021c7` (2026-07-16) + terreno nunca auditado (integraciones post-build, endpoints JSON, SW, gates nuevos). Revertido como **política, no bug**: los títulos live UF/UTM (`e0317d86`/`539cd5dc`, reverts `a5796fa7`/`00180e56`) se revirtieron porque el `fix(seo)` cambiaba el `<title>`/description de las dos páginas de dinero más medidas (conversor-uf/utm, ~73% de las impresiones orgánicas según GSC W28–W31) DENTRO de la ventana de medición OBS-01 (PR #354): cualquier cambio de título habría contaminado el baseline de CTR. Decisión: no tocar titles/descriptions de superficies en medición hasta el cierre de ventana; re-evaluar tras OBS-01 (los valores live pueden reintroducirse vía el mecanismo seoTitle del plan 067, que ahora tiene gate propio). Foco de esta pasada (todos los hallazgos reales, veteados leyendo el código): **pagefind 33 MB acumulado** (PERF, fix de 1 línea), **SW sirviendo UF/UTM stale en las páginas de dinero**, **contadores KV no atómicos con fallos tragados en silencio**, **UTA fabricada con UTM corriente cuando mindicador falla**, **`onclick` inline bloqueado por la CSP propia**, **tokenizer de inline-link-spacing que elimina `<`**, **timezone UTC en vez de Chile**, **fechas fabricadas "hoy" que anulan el gate de frescura**, **JSON-LD sin escapar `<`**, **security-scans fantasma en PRs**, **seoTitle con cero tests**, **3 espejos de constantes legales**, y la capa de tests/verificación post-build inexistente. Precios reverificados limpios: matemática de calculadoras, TaxEngine, provider económico, remark plugins, js-yaml v5, auth del collector (header-only, plan 037 intacto), regexes de shape (038/043 intactos).

Ejecutar en el orden de la tabla salvo que las dependencias indiquen lo contrario.
Cada ejecutor debe leer el plan completo y honrar sus condiciones de STOP.

## Pendientes — séptima auditoría (2026-08-10, `90370b4e`)

**Completada el 2026-08-11** — los 4 planes restantes (078–081) fueron
ejecutados y archivados (PRs #415, #416, #419). Sin pendientes de esta
auditoría.

## Orden global de ejecución

No hay una secuencia pendiente a fecha 2026-09-12. 057–081 y 082 ya estaban
archivados; 041 fue REJECTED, 046 SUPERSEDED y 055 DONE el 2026-09-04.
083–096 también están cerrados. Los estados BLOCKED/TODO de las revisiones
antiguas no deben usarse para despachar trabajo de nuevo.

Los seguimientos de operación y decisión están en el
[informe vigente](RECONCILIATION-2026-09-12.md#seguimientos-conservados-y-orden-útil).

## Dependency notes (séptima auditoría)

- **057 antes que cualquier crecimiento de pagefind**: el índice limpio (~1.3 MB) es la base; 081 check `pagefind-bounded` lo protege (activo solo si 057 está en main).
- **073 después de 067/068/071/072**: ampliar el gate de cobertura antes de cubrir los archivos nuevos haría fallar CI de inmediato; el orden evita el dolor.
- **072 opcionalmente después de 059**: los tests de fallo KV se adaptan a la versión logueada (los casos 429/guards no dependen).
- **081 es el destino de las aserciones de artefacto**: 057 (tamaño), 062 (spacing), 065 (JSON-LD), 067 (título/H1) activan sus checks solo cuando su plan aterrice en main; el script debe tolerar la ausencia.
- **068 y 067 tocan el mismo script** (`check-frontmatter.mjs`): si se ejecutan en paralelo, 068 reconcilia con la regla seotitle de 067 (el plan lo dice explícitamente).
- **063 y 060 tocan `siiUtm.ts`/`buildSnapshot.ts`**: zonas distintas (timezone vs fallback UTA); sin conflicto si se secuencian, verificar drift si van en paralelo.

## Hallazgos considerados y rechazados (2026-08-10)

- **Trigger `?secret=` del worker económico (SEC-01/CORRECTNESS-07)**: resuelto — plan 052 DONE (PR #420, desplegado; forma legacy 401 en producción). No se re-propone.
- **Spoofabilidad del analytics (SEC-07)**: tradeoff de diseño aceptado (endpoint público sin proof-of-origin); se recomienda documentar en ADR, no cambiar código. Revisitarlo si el scorecard pasa de ranking relativo a valores absolutos.
- **Fuga de strings de error en triggers manuales (SEC-05)**: post-auth, bajo valor; si se toca 052 en el futuro, devolver `{"error":"trigger_failed"}` genérico en el mismo cambio.
- **zod@3.25.76 coexistente via LHCI (DEPS-03)**: inevitable (chromium-bidi pinnea zod@3); anotar en `docs/TECH_DEBT_BACKLOG.md` como aceptado, desaparece si se reemplaza LHCI.
- **Dev majors atrasados (DEPS-04)**: eslint-plugin-astro 3.x se intentó y revirtió (`c0fc2439`); TS7 ya tiene workflow de readiness `.disabled`; sin costo de seguridad. No planificar.
- **`check:images` borra PNGs (DX-03)**: PNGs son untracked (solo AVIFs commiteados); el impacto es solo local en el pipeline de generación de imágenes — no justifica plan.
- **guardrail-drift-audit sin try/catch (DX-07)**: marginal (MED confianza, fallo poco probable); si se toca `guardrail-drift-audit.yml` por otra razón, copiar el patrón de `check-afp-commissions.yml:60-65`.
- **Consolidación de las 3 integraciones post-build (ARCH-07)**: los 3 globs independientes sobre dist son reales, pero el conflicto con astro-shield es inferencia; se pospone — el plan 081 agrega las aserciones de integridad que harían seguro ese refactor futuro.
- **Payload UF histórico 207 KB (PERF-03)**: interacción lazy + cacheada (`max-age=86400`); revisitarlo cuando se agreguen series ipc/utm históricas (mismo patrón ×3).
- **Conversión de bots a PRs (DX-01, parte governance)**: NO es un plan de código — el 079 valida post-push como mitigación; la conversión a PR+automerge rompería la SLA de frescura 3×/día y es decisión del operador.
- **Rejects menores**: `fmt` deprecated en `indicadores.ts` (knip lo cubre); error leak `?secret=` documentado en docs históricas (037 ya lo verificó); Dependabot automerge (verificado sano).

## Auditoría de dirección `/improve next` — 2026-09-04 (commit `08a6b5b4`)

> Estado previo a 083–086, conservado como evidencia histórica. La falta de
> instrumentación y de mínimos ya está resuelta. La inferencia de independencia
> de los 108 eventos fue corregida por 085; ver la reconciliación vigente.

Tercera pasada de dirección. **Delta sobre la ventana utility-led** (2026-08-02 →
2026-11-02) usando los datos reales que el repo ya genera: exports first-party
W31–W35 (`output/operations/data-signals/analytics/`), GSC W35
(`output/operations/data-signals/gsc/`) y el scorecard del 2026-09-04.

**Hallazgo espinal (verificado leyendo el código y los exports, no inferido):** el
programa utility-led decide en noviembre sobre tres señales, y las tres superficies
que las producen tienen entregas incompatibles entre sí:

| Vehículo | Dónde | Entrega (impresiones/completitudes) | CTR |
|---|---|---|---|
| Tarjeta en flujo (`src/scripts/next-best-step.ts`) | impuesto-2ª, APV | 140–630% | 2,6–18,8% |
| Panel post-resultado (`UtmPostResultActions.astro`) | solo conversor-utm | 6,7–12,9% | 0% (0 de 108) |
| `NextSteps.astro` estático | 10+ calculadoras | **no emite impresiones** | no computable |

`NextSteps.astro` (108 líneas, **sin `<script>`**) es la superficie que desplegó el
plan 082: sus clics se emiten por el manejador genérico de `data-analytics-cta`
**sin `calculator_id`**, así que caen en buckets fantasma (`calculator`/`unknown`)
— 8, 2 y 7 clics por semana en W33/W34/W35, cerca de la mitad del total.

**Poder estadístico (la corrección más importante de esta pasada):** el registry
tiene piso de tiempo e integridad pero **no de denominador**. Con P(0)=(1−p)^n:

- `next_step_click` 0/108 → P(0)=0,037 al umbral HALT de 3% → **decidible, real**.
- `alert_interest_submit` 0/79 → P(0)=**0,203** al GREEN de 2% → **indecidible**.
- `support_click` 0/62 → P(0)=**0,733** al GREEN de 0,5% → **sin información**.

Se necesitan n≈149 y n≈598. **No debe escribirse "0% → no construir alertas"** en
ningún documento de decisión: ese es exactamente el error que el plan 084 previene.

**Gate D sin datos:** `utility-led-ops.json` de W35 tiene `weeklyHours`,
`weeklyCostClp` y `burnoutLevel1To5` en `null`, pese a que el registry declara la
sostenibilidad —no el ingreso— como gate de continuidad.

**Concentración:** GSC W35 = 773 clics; `/calculadoras/conversor-utm/` se lleva 571
(74%) y 121.300 de 150.899 impresiones (80%), CTR 0,47% en posición 7,8. Los
conversores completan al 99% y no generan siguiente paso: son consultas de un dato.

## Hallazgos considerados y rechazados (2026-09-04)

- **Salud de indexación**: *verificado limpio, no planificar.* La memoria de
  sesiones previas hablaba de ~42% "Crawled - currently not indexed" (corte
  2026-07-03). Con URL Inspection W35 la realidad es **173/184 indexadas (94%)** y
  solo 11 sin confirmar. El problema se resolvió; no se re-audita.
- **Placeholders de `indexation-summary.json`** (`"Replace this text with what
  Google Search Console actually shows this week."`): cosmético — la sección
  "Indexación real (URL Inspection)" del scorecard ya trae el dato verdadero desde
  la API. No justifica un plan.
- **`support_click` y `alert_interest_submit` en cero como señal de producto**:
  **rechazado como hallazgo**. Se verificó empíricamente que ambos eventos pasan el
  sanitizador del cliente y la re-validación del worker (`rejectUnknown: true`), así
  que el cero no es un defecto de transporte; pero los denominadores (62 y 79) no
  alcanzan para concluir nada. No es hallazgo ni evidencia: es ausencia de poder.
- **Hipótesis descartadas durante el veteo** (se documentan para no reintentarlas):
  (1) que `ATTRIBUTION` sobrescribiera `calculator_id` en `UtmPostResultActions` —
  falso, `ATTRIBUTION` no contiene esa clave; (2) que el worker rechazara los
  eventos con `interaction_variant` fuera de allowlist — falso, el cliente los
  descarta antes y el worker acepta. Ambas se probaron ejecutando el sanitizador
  real contra los payloads reales.
- **`article_calculator_cta_click` sin `calculator_id`**: real pero menor — su
  allowlist no incluye esa clave por diseño y el destino sí es recuperable desde
  `dimensions` (`…:https://monedario.cl/calculadoras/apv/`). Volumen ~1/semana.
  Anotar si se toca el contrato por otra razón; no justifica plan propio.
- **`calculator_error` en cero en todo el sitio y todas las semanas**: sospechoso
  (o nada falla nunca, o el evento no se emite), pero sin evidencia de cuál. Queda
  como pregunta abierta dentro del plan 086, no como plan propio.
- **UTM zero-click, GEO, autoridad del clúster "sueldo líquido", calculadoras
  nuevas, comparadores, donaciones, copy de privacidad, CSP**: *owned* por pasadas
  anteriores (ver las secciones de 2026-07-12 y 2026-08-02 más abajo). No se
  re-derivan.
- **Recurrencia / return-hook (plan 046)**: **no se abre un spike nuevo.** El plan
  085 responde su pregunta reconciliada ("evaluar lo construido") con datos y deja
  046 listo para cerrarse o reorientarse.
- **Extender el patrón post-resultado a más calculadoras**: deliberadamente **no**
  se planifica ahora. El plan 082 lo difirió hasta cruzar umbrales, y esta auditoría
  muestra que el vehículo post-resultado es el que peor entrega — ampliarlo antes
  del 085 sería replicar el problema.

## Notas de dependencia (auditoría de dirección 2026-09-04)

- **083 antes de leer cualquier razón de siguiente paso como definitiva**: hasta que
  `NextSteps.astro` emita impresiones y sus clics tengan identidad, las razones
  publicadas mezclan superficies medidas con superficies mudas.
- **084 es independiente de 083** y puede ir en paralelo: uno arregla el numerador y
  el denominador; el otro arregla la regla con que se leen.
- **085 se ejecuta mejor después de 084** (usa la regla de denominador mínimo para
  dimensionar sus opciones), pero no lo requiere: trae los `n_min` inlineados.
- **086 es independiente de los tres** y no comparte archivos con ninguno.
- **Ninguno de los cuatro toca rutas, slugs, RSS, títulos SEO de superficies en
  medición ni contenido YMYL.** El freeze de URLs hasta 2026-11-02 se respeta.

## Cierre de planes heredados (2026-09-04)

Los tres planes que sobrevivían de auditorías anteriores se cerraron y archivaron
el 2026-09-04, verificando cada premisa contra los datos vigentes (RUM/GSC/
analytics W35) antes de decidir. **No se re-proponen.**

### 041 — REJECTED: la premisa de campo desapareció

El plan perseguía un `CLS p75 = 1,008` en `/calculadoras/impuesto-segunda-categoria/`
(RUM 2026-W27). Ese número provenía de la consulta RUM **anterior** al plan 047,
que agregaba por `accountTag` **sin** dimensión de hostname — la contaminación
GROWTH-005 (tráfico de otras propiedades de la misma cuenta Cloudflare).

Hoy `scripts/data-signals/cloudflare-fetch.mjs:154` filtra `requestHost: $host`.
Con datos limpios (`output/operations/data-signals/cloudflare/2026-W35-rum.json`):

| Ruta | CLS p75 | n |
|---|---:|---:|
| `/calculadoras/impuesto-segunda-categoria/` | **0,014** | 30 |
| `/posts/sueldo-imponible-chile/` | 0,012 | 10 |
| todo el resto del sitio | 0 | — |

El umbral "Good" de CLS es <0,1: el **peor** valor del sitio entero es 0,014. Y
coincide con lo que el ejecutor de 041 ya había medido en laboratorio — la barra de
`ensureHint()` producía un shift de **0,0125** —, así que ese residuo mínimo es el
hint bar y es inofensivo (el plan 044, archivado, ya lo trató).

No es que faltara encontrar la causa de campo: **no hay problema de campo**. Pasa de
`BLOCKED` a `REJECTED`.

### 046 — SUPERSEDED: su pregunta ya está instrumentada

046 proponía investigar si existe recurrencia real sobre los conversores y, solo si
la había, **diseñar** un return-hook privacy-safe. Ese diseño ya está vivo en
producción: `src/components/UtmPostResultActions.astro:43` pregunta literalmente
*"¿Le serviría recibir un aviso cuando cambie la UTM?"*, con el descargo *"Esto solo
mide interés agregado; no activa avisos ni solicita su correo."* — agregado, sin PII,
sin correo. Es exactamente el hook que 046 iba a diseñar.

Lo que falta no es diseño sino **entrega**: 79 impresiones en cinco semanas, cuando
hacen falta n≈149 para poder decidir (ver la auditoría del 2026-09-04 más arriba).

Además hay un límite estructural: 046 pregunta por *recurrencia*, y medir retorno
individual está explícitamente prohibido en
`docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md` ("cuentas, historial,
personalización, perfilamiento, cohortes o retorno individual — fuera de alcance; no
autorizado"). Ningún spike puede responderla de frente; solo por proxy agregado, que
es lo que ya está montado.

Su base de evidencia también envejeció: partía de 310 visitas RUM en W27; en W35
`conversor-utm` va en 640. La dirección no cambia, los extractos sí.

**Sucesores**: plan 085 (evalúa el vehículo con datos) + plan 083 (arregla la
entrega). No escribir otro spike de recurrencia.

### 055 — DONE y archivado, con una premisa anotada

055 se ejecutó y aprobó en revisión el 2026-08-11; su entregable
(`docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md`) está en el árbol y solo
faltaba el cierre. Se archiva ahora.

**Anotación obligatoria antes de actuar sobre su §5**: su hallazgo titular
—"APV contradice la clasificación del memo → recomendación **MANTENER**"— se apoyaba
en W32 (37v/17s/14c, ascenso 2→8→14). Con W34/W35 la completitud de APV cayó a
**19%** y **14%**. Eso no invierte la recomendación (una calculadora que se empieza y
no se termina es argumento para arreglarla, no para consolidarla), pero **la
evidencia que la sostenía ya no es la vigente**: queda supeditada al plan 086.
Las otras cuatro clasificaciones ("activación baja") siguen en pie — en GSC W35
ninguna supera 3 clics.

La compuerta humana del dossier (6 preguntas, §5) **sigue abierta**: archivar el plan
no la resuelve.

## Política obligatoria de cierre y archivo

El cierre de un plan es atómico. En la misma unidad de cambio que lo marca DONE,
el ejecutor debe mover su archivo de `plans/` a `plans/archive/`, quitarlo de
"Pendientes", añadirlo a los índices de completados de este README y de
`archive/README.md`, y verificar que no queden enlaces al path anterior. Un plan
no se considera terminado si su archivo sigue en `plans/` o si no está integrado
en `main`; en ese caso permanece `IN PROGRESS` o `BLOCKED`. Esta regla forma parte
del DoD y no requiere una solicitud adicional del usuario.

Los planes **completados, verificados y mergeados** se mueven a
[`plans/archive/`](archive/README.md). En este README solo quedan en detalle los
planes **pendientes**; los cerrados se listan abajo con enlace al archivo.

## Pendientes (trabajo abierto)

**Ningún plan numerado pendiente.** Los 083–086 se movieron al archivo con
su registro de revisión y evidencia de merge. Los seguimientos que permanecen
abiertos están en el [informe de reconciliación](RECONCILIATION-2026-09-12.md).

### Notas históricas de ejecución (no son pendientes vigentes)

> **035–040, 042–055 archivados** (ver [`Completados — archivados`](#completados--archivados) abajo) — ya no aparecen en esta tabla.
>
> **Cierre del 2026-09-04**: los tres últimos planes heredados (**041**, **046**,
> **055**) se archivaron en esta fecha por decisión del operador ("todo lo que ya
> NO corresponda a planes pendientes no debería estar en `plans/`"). Ninguno queda
> vivo. Justificación de cada uno en
> [Cierre de planes heredados](#cierre-de-planes-heredados-2026-09-04). En ese corte
> quedaron 083–086; también se archivaron en la reconciliación del 2026-09-12.
>
> **053 CERRADO (mergeado y archivado 2026-08-02); 054–056 son los planes
> de la auditoría de dirección (`/improve next`, 2026-08-02)**,
> basados en el memo de viabilidad estratégica del mismo día
> (`output/audits/strategic-viability-2026-08-02/`, untracked — veredicto
> "continuar con foco estricto", ventana de experimentos 2026-08-02 → 2026-11-02).
> Los tres eran spikes de diseño/evidencia read-only con compuertas
> humanas. 054 y 056 archivados; 055 pendiente (dossier por URL). El 056 se
> ejecutó el 2026-08-11 y derivó el plan **082** (paso 1 de implementación).
> El commit `e17013b7` (#382, el mismo día) ya implementó parte de la
> fundación utility-led que el memo pide (contrato de analytics v2 con
> `alert_interest_*`/`support_*`/`next_step_*`, copy de privacidad corregido en
> `HeroHomepage.astro:93`, `UtmPostResultActions` en conversor-utm, registry de
> umbrales en `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`) — ver
> "Considerados y reconciliados" abajo para lo que NO se re-propone.
>
> **051 EJECUTADO Y APROBADO EN REVISIÓN (2026-08-02, vía `/improve execute
> 051`):** ejecutor en worktree aislado
> (`.claude/worktrees/agent-af4805f8364715cb4`, rama
> `advisor/051-analytics-deployment-parity`, commit `8a182486`,
> `ci(analytics): verify Worker deployment parity`). Entregable: 9 archivos
> (+1825 líneas) — workflow `deploy-analytics-collector.yml` (dispatch manual
> solo, `contents: read`, acciones pineadas, concurrency serializado, dry-run
> antes del deploy, verifier post-deploy), verifier
> `scripts/data-signals/verify-analytics-worker-deployment.mjs` (5 chequeos:
> versión activa con `--deployed-not-before`, cron exacto `57 7 * * MON` con
> polling acotado ≤15 min, rechazo de auth por query-string, smoke de export
> por header solo-metadatos, frescura R2 vía `If-Modified-Since` sin descargar
> body), 25 tests del verifier + 11 aserciones estáticas del workflow, ADR
> `ADR-20260716-analytics-worker-deployment-parity`, runbook
> `docs/operations/runbooks/analytics-worker-deployment.md`, README del worker
> y trio `worker:analytics:dev/deploy/tail` en package.json. **Revisión
> (tech-lead) APROBADA** — gates re-corridos de forma independiente en el
> worktree: suite completa 1128/1128, vitest acotado 136/136, wrangler
> dry-run exit 0, `check:docs`/`check:boundaries`/`lint`/`format:check` exit 0
> (parse YAML con ruby sustituido por js-yaml del repo — ruby no está instalado
> en el entorno, misma cobertura, documentado). Compatibilidad del smoke
> verificada contra la forma real del endpoint (`index.ts:817-821` devuelve
> solo week/window/rows/totalEvents; key R2 `analytics-exports/{week}.json`
> coincide con la línea 752). Sin secretos ni IDs externos commiteados
> (escaneado; solo `${{ secrets.* }}`/env en el workflow y docs). Sin runner
> label (retiro del 01-08 respetado; el test estático lo exige).
> **Desviaciones documentadas y aprobadas en mérito:** (1)
> `scripts/check-docs-structure.mjs` +4 líneas fuera del alcance literal —
> allowlist del README del worker, requerida para que `check:docs` pase, mismo
> patrón que los otros dos README de workers; (2) Step 5 (smoke de producción)
> **diferido al operador** — sin credenciales Cloudflare en el worktree
> (condición de STOP del propio plan); checklist de evidencia no secreta en el
> runbook §2. **Merge + deploy de producción pendientes de decisión del
> operador** (igual que 052: requiere emitir token mínimamente scoped y
> configurar secrets/vars de GitHub). **Auditoría post-entrega (2026-08-02, a
> pedido del operador): 5 hallazgos corregidos** en commit adicional
> `e5efcc66` (+126/−6, 4 archivos): (1) timeout del job 15→30 min (el peor
> caso del verifier — deploy ~5 min + polling de propagación ≤15 min —
> excedía el tope; el run habría fallado por timeout en vez de por paridad);
> (2) margen `R2_REFERENCE_SKEW_MS = 2 s` en la referencia del smoke (los
> HTTP dates se truncan a segundos → 304 falso si PUT y GET caían en el mismo
> segundo); (3) `parseArgs` exportada + 7 tests de CLI (antes sin cobertura);
> (4) regex de semana reforzada a 01-53 (W99 escribía artefacto R2 basura);
> (5) `TZ: America/Santiago` en el step "Resolver semana" (alinea con
> `EXPORT_TIMEZONE` del worker en el borde lunes 00:00-04:00 UTC). Gates
> reverificados: suite completa 1136/1136 (8 tests nuevos), vitest acotado
> 144/144, format/lint/docs exit 0. Sin push ni PR.
> **Segundo pase de auditoría (2026-08-02, señalado por el operador al crear
> el token):** el permiso "Worker Routes:Edit" es de **ZONA**, no de cuenta —
> corregidas las 4 menciones (workflow header + mensaje del step de validación,
> ADR punto 4, runbook §1) en commit `79d78372` con la nota del modo de falla
> (`workers.api.error.unauthorized` al sincronizar la ruta). Permisos del
> token verificados en vivo (read-only): Workers Scripts PASS (deployments +
> schedules), Zone Worker Routes PASS (ruta `monedario.cl/api/analytics/*`),
> R2 Storage:Read PASS (GET artefacto 2026-W30), y paridad global OK
> (query-string 401).
> **Cierre (2026-08-02, a pedido del operador):** merge por fast-forward
> `1974e3be..79d78372`, cierre atómico en el mismo turno (`051-*.md` movido a
> [`plans/archive/`](archive/051-analytics-deployment-parity.md), tabla
> renumerada, índices actualizados), push a `origin/main` y limpieza de
> worktree/rama. **Pendiente del operador:** primer deploy vía
> `gh workflow run deploy-analytics-collector.yml --ref main` con el token ya
> verificado, y registrar la evidencia del runbook §2.
>
> **054 EJECUTADO Y APROBADO EN REVISIÓN (2026-08-02, vía `/improve execute
> 054`):** ejecutor en worktree aislado
> (`.claude/worktrees/agent-aa7c1665be7df0105`, rama
> `advisor/054-editorial-evidence-ledger`, commit `673ad8dc`,
> `docs(reports): ledger de evidencia del pipeline editorial (spike 054)`).
> Entregable: `docs/reports/EDITORIAL-EVIDENCE-LEDGER-2026-08-02.md` (263
> líneas, 1 solo archivo en el commit, worktree limpio). **Revisión
> (tech-lead) APROBADA** — reverificada de forma independiente, no solo el
> reporte del ejecutor: conteo de posts recalculado (53; pubDate ≥ 2026-04-25 →
> 10, updatedDate → 15, en_alcance 22), `find` de packets (3×06 + 3×07, los
> mismos 3 pares citados), los tres modos del checker re-ejecutados (warn exit
> 0 con 47/47, CI exit 1, estricto exit 0), y cada cita de archivo:línea del
> ledger verificada contra el archivo real (content.config.ts:43-44,
> MIN_SOURCES:20, loadAllowlist:285-286, detectYmyStatus:295, evaluatePost:481,
> run:636; metodologia.astro:115-135 y acerca-de.astro:106-116 verbatim).
> **Hallazgos clave del ledger:** el número 47/47 del memo SÍ coincide con la
> salida real, pero el modo advertencia NO lo explica (el modo estricto también
> pasa) — el conteo refleja la definición propia del checker (brief+dossier+
> fecha_corte+≥1 fuente, `MIN_SOURCES=1`); el checker nunca referencia
> 06/07/firma/siete etapas (grep = 0); la allowlist YMYL
> (`context/EDITORIAL_YMYL_ALLOWLIST.txt`) **no existe** (allowlist_entries=0) —
> los 47 YMYL salen de `category` (45) + tags (2); solo 1 de los 47 YMYL tiene
> packet 06/07, y los otros 2 packets son posts `category: general` que el
> checker ni evalúa. Veredicto: "el gap real es 19" (de 22 posts en alcance del
> claim, 19 sin cadena de siete registros; el corpus histórico queda
> correctamente fuera por el aside de metodologia.astro:128-134).
> **Desviaciones documentadas y aprobadas en mérito:** correcciones de líneas
> citadas por el plan (content.config.ts 17,19 → 43-44; evaluatePost ~290 →
> 481) y precisión de "50 carpetas temáticas" → 49 + `_intake` (50 dirs);
> `pnpm install --frozen-lockfile` requerido en el worktree (esperado, node_modules
> ausente). Sin STOP activado (mapeos 0 ambiguos; ninguna evidencia contradice
> el disclaimer público). **Merge pendiente de decisión del operador** — spike
> read-only con compuerta humana en la sección "Decisión del operador" del
> ledger (5 preguntas: opción A/B/C, alcance del backfill, semántica del
> checker, governance, evidencia que cambiaría el veredicto).
> **Cierre (2026-08-02, a pedido del operador — "2"):** la rama
> `advisor/054-editorial-evidence-ledger` se integró a `main` local por
> **fast-forward** (`3c343e00..673ad8dc`); worktree y rama eliminados tras el
> merge. Cierre atómico en el mismo turno: `054-*.md` movido a
> [`plans/archive/`](archive/054-editorial-evidence-ledger-spike.md), esta
> tabla renumerada, índice de archivados actualizado. **No empujado a
> `origin/main`** (el operador no lo pidió). La compuerta humana del ledger
> ("Decisión del operador": opciones A/B/C) sigue abierta para el operador.

### Decisiones y rechazos de la auditoría 2026-07-16

- **No crear otra URL UTM ni un hub “UTM hoy”**: el conversor existente concentra
  la demanda y ya hay ownership explícito para intención explicativa.
- **No aplicar 3,5% CTR como forecast universal**: búsquedas de valor actual y
  conversión son parcialmente zero-click; el número solo sirve como heurística.
- **No reescribir ni pedir indexación masiva de las 27 URLs**: el cohort mezcla
  superficies y `crawled, currently not indexed` no identifica una causa común.
- **No agregar más `llms`, schema o crawler directives antes de medir GEO**: la
  infraestructura ya existe; corresponde ejecutar el baseline fijo de 48
  combinaciones durante al menos tres cortes comparables.
- **No reabrir la carrera KV por intuición**: ADR-20260628 acepta consistencia
  eventual a la escala actual; solo se revisa al cruzar su umbral operativo.
- **No parchear LCP/CLS a ciegas**: W28 sí alerta LCP p75 4.779 ms con 30 muestras,
  pero la causa de campo sigue sin reproducirse. 041 permanece BLOCKED y el
  siguiente paso es traza mobile field-to-lab, no CSS especulativo.

> **045 EJECUTADO, APROBADO EN REVISIÓN, MERGEADO (local) Y ARCHIVADO
> (2026-07-13, vía `/improve execute 045`).** Ejecutor `general-purpose` en
> worktree aislado (`.claude/worktrees/agent-ae6c38d724e20dc29`, rama
> `advisor/045-measurement-resequence-two-lanes`, commit `f34210ff`,
> `docs(reports): brief de re-secuencia de medición en dos carriles (spike 045)`).
> Entregable: `docs/reports/GROWTH-DIRECTION-DELTA-2026-W27.md` (260 líneas, 1
> solo archivo en el commit). **Adaptaciones de despacho documentadas:** (1) todo
> `output/operations/weekly-search-performance/` está **gitignored** — un worktree
> limpio solo trae el `2026-W19` (force-added), así que el reviewer verificó la
> evidencia de scorecard (W27 `0 views · 568 starts · 916 completes`) contra el
> árbol principal y la inlineó; el ejecutor NO pudo re-verificarla y así lo
> declara en el brief. (2) Etiqueta de archivo corregida a **W27** (no el `-W28`
> literal del plan) porque no existe W28+; autorizado por el propio plan ("usa el
> label real"). (3) El plan 045 es **untracked** en `main`, así que se inlineó su
> texto completo en el despacho; se instruyó OMITIR la edición de `plans/README.md`
> (la mantiene el reviewer). **Revisión (tech-lead) APROBADA** — reverificada de
> forma independiente, no solo el reporte del ejecutor: `check-docs-structure.mjs`
> exit 0 re-corrido en el worktree; el commit toca **1 solo archivo** en scope
> (`docs/reports/`), worktree limpio, sin tocar `scripts/`/`src/`/`workers/` ni el
> plan maestro. Cada cita de archivo *tracked* verificada contra el archivo real:
> la inconsistencia diagrama-vs-gate del plan maestro (§5 serializa PR-04 bajo
> OBS-01 pero su "Gate de entrada" línea 760 solo pide "baseline GSC de 4 semanas
> por URL", no el baseline first-party de OBS-01 que es el gate de PR-03 en línea
> 708) es **real** y es el dato más fuerte del brief; el Progress Log del plan
> maestro (2026-07-07) corrobora el embudo (`seguro-cesantia 112 starts/186
> completes`, `calculator_view` en 0) de forma independiente al scorecard
> gitignored; `SITE_ROUTE_ALLOWLIST` (mitigación parcial de GROWTH-005) y la
> deprioritización de apv/conversor-uf por el plan 040 ("bajo valor esperado")
> también confirmadas. **Tono honesto verificado:** el hallazgo central se
> clasifica como **"sin-datos"** (W27 es pre-fix; 039/042/043 se mergearon después
> de su ventana), NO como "los fixes fallaron"; GROWTH-005 como "parcialmente
> mitigado", no "abierto sin más"; carril A con caveat explícito de zero-click.
> **Desviaciones aprobadas en mérito:** el ejecutor añadió dos hallazgos más allá
> del plan (la inconsistencia diagrama-vs-gate y la deprioritización previa de
> 040), ambos verificados verdaderos y que fortalecen el brief. **Cierre
> (2026-07-13, a pedido del operador — "acepto tu sugerencia, adelante"):** la rama
> `advisor/045-measurement-resequence-two-lanes` se integró a `main` local por
> **fast-forward** (`0102b11a..f34210ff`); ese ff también puso `main` local al día
> con `origin/main`, que estaba 2 commits de bots adelante (refresh de snapshot
> económico `b8406e55` y de `page-lastmod` `52fe278a`, ambos ya en `origin/main`,
> verificados no relacionados con este trabajo). Cierre atómico en el mismo turno:
> `045-*.md` movido a [`plans/archive/`](archive/045-measurement-resequence-two-lanes.md),
> esta tabla renumerada, índice de archivados actualizado. **No empujado a
> `origin/main`** (el operador no lo pidió). En la misma unidad de trabajo se
> escribió el plan **047** (follow-up de implementación de GROWTH-005 que el brief
> especifica) y se trackeó **046** (antes untracked). **Nota menor (no bloqueante),
> pendiente para el futuro:** el brief incluye una línea de procedencia ("la cita
> viene verificada por el reviewer de este plan") que filtra proceso de review a un
> doc permanente de `docs/reports/`; defendible como procedencia, candidato a
> limpieza futura.

**Por qué este orden:** *(bloque histórico de la tabla de la quinta/sexta
auditoría — los planes que cita (040, 042, 043, 035–038) están archivados y
ya no aplican a la tabla vigente; el orden actual de este lote es: 041
BLOCKED, y los spikes 046/055 solo a pedido del
operador (reconciliados 2026-08-11). La secuencia ejecutable pendiente es la
de la séptima auditoría 057–081, ya completa — 052 fue cerrado con PR #420.)*
- **035, 038, 039, 037 y 036 ya ejecutados** (ver notas abajo): máxima
  prioridad/mayor confianza primero, e independientes de todo lo demás — no
  había razón para esperar.
- **1 (041)** es independiente y de riesgo bajo; puede adelantarse en
  paralelo con cualquiera de los anteriores sin conflicto.
- **2 (040) va después a propósito**: es un *brief de decisión*, no un fix de
  código — se detiene en la compuerta de firma humana del copy (Step 4) y no
  debe bloquear el resto del trabajo técnico.
- **4 (043) va último**: extiende el mismo scaffolding de constantes que 038
  (ya mergeado, así que no hay bloqueo real) y es en sí mismo un *brief de
  decisión* — se detiene en una compuerta de firma humana (Step 1) antes de
  tocar código.

> **040, 042 y 043 EJECUTADOS EN PARALELO, APROBADOS EN REVISIÓN Y MERGEADOS
> (2026-07-12, a pedido del operador — "Execute plans 040, 042 and 043 in
> parallel", luego "commit, push, merge and clean").**
> Los tres tenían compuertas de decisión humana explícitas en el propio plan
> (040 Step 4: firma de copy; 043 Step 1: elección de opción); ambas se
> resolvieron con el operador en esta misma sesión antes de despachar, para
> que cada ejecutor pudiera completar el plan entero en un solo despacho en
> vez de detenerse en la compuerta. 042 no tenía compuerta y se despachó de
> inmediato. Los tres corrieron en worktrees aislados independientes
> (ninguno depende de los otros dos, sin solape de archivos entre sí).
>
> **040 (worktree `agent-a73f792f882ea7980`, rama
> `advisor/040-seo-title-snippet-refresh-brief`, commit `d6003846`,
> `feat(seo): refrescar title/description de seguro-cesantia (plan 040)`):**
> el operador aprobó el **Título A** (`Simulador de Seguro de Cesantía:
> calcula tu cobertura (AFC y Fondo Solidario)`) tras reverificar en vivo que
> `2026-W27-query-page.json` sigue siendo el export GSC más reciente (no
> existe `2026-W28`) y que las queries "simulador"/"simular" de
> seguro-cesantia siguen en posición 4–9 con CTR débil pese a impresiones
> reales. Diff acotado a **1 archivo**
> (`src/pages/calculadoras/seguro-cesantia.astro`, 4 líneas cambiadas): título
> y descripción actualizados en `<Layout>` y en `<CalculatorJsonLd>` (única
> otra copia del string viejo en el archivo); `apv.astro` y
> `conversor-uf.astro` **intactos**. **Revisión (tech-lead) APROBADA** —
> reverificado de forma independiente en el worktree, no solo el reporte del
> ejecutor: `check-reader-facing-copy.mjs` → 0 issues; `check-dialect.mjs` →
> OK, 53 archivos; `astro check` → 0 errores (mismo hint preexistente ajeno de
> `content.config.ts`); `format:check` → OK; `git status` limpio, solo el
> archivo en alcance. **Judgment call documentado por el ejecutor, sin
> decidir por su cuenta:** el `<CalculatorHero>` de la página (H1 "Calculadora
> de Seguro de Cesantía" + su propia descripción) quedó sin tocar — no era una
> copia del string viejo y no había copy H1 aprobado — así que hoy el
> `<title>`/meta llevan "Simulador" pero el H1 visible sigue diciendo
> "Calculadora". Queda abierto para el operador decidir si el H1 debe
> converger con el nuevo framing en un follow-up, no es parte de este plan.
> **Seguimiento de medición (no ejecutable por agente):** a las 2–4 semanas de
> desplegado, comparar CTR/posición de seguro-cesantia en las queries
> "simulador"/"solidario" contra el baseline W27 documentado en el plan.
> **MERGEADO a `main` el 2026-07-12** (merge commit `013b59b0`, `--no-ff`
> sobre `advisor/040-seo-title-snippet-refresh-brief`).
>
> **042 (worktree `agent-ab78ff238c8155b9c`, rama
> `advisor/042-remove-calculator-completed-typo-event`, commit `1de64e2a`,
> `fix(analytics): quitar evento typo calculator_completed`):** sin compuerta
> humana, limpieza mecánica. Diff acotado a los **9 archivos** en alcance
> (8 fuente + 1 test), **52 líneas eliminadas, 0 insertadas** — confirmado
> leyendo el diff completo, cada bloque removido es exactamente el
> `trackAnalyticsEvent("calculator_completed", ...)` que seguía al evento real
> `calculator_complete`, sin tocar este último. **Revisión (tech-lead)
> APROBADA** — reverificado de forma independiente: `grep -rn
> "calculator_completed" src/` → sin matches; mismo grep sobre
> `homepage-content.test.ts` → sin matches; `grep -c '"calculator_complete"'
> formController.ts` → `2` (ambas llamadas reales intactas); suite completa
> `pnpm test` → **1028/1028** (una menos que el baseline de 1029, exactamente
> el test eliminado); `astro check` → 0 errores; eslint acotado a los 8
> archivos → exit 0; `format:check` → exit 0; `git status` limpio, solo los 9
> archivos del plan. El test hermano que exige que `calculator_complete`
> siga disparándose quedó intacto, verificado en el diff.
> **MERGEADO a `main` el 2026-07-12** (merge commit `afeb9203`, `--no-ff`
> sobre `advisor/042-remove-calculator-completed-typo-event`).
>
> **043 (worktree `agent-a2c620fed1cf2b13a`, rama
> `advisor/043-analytics-item-id-shape-decision`, commit `7c5fe277`,
> `fix(security): validar la forma de item_id en analytics (opción 2)`):** el
> operador eligió **Opción 2** (aceptar path o token vía `SAFE_ITEM_ID_RE`
> además de `SAFE_TOKEN_RE`), reforzada por un hallazgo del reviewer antes de
> preguntar: `buildCounterKey` en
> `workers/analytics-collector/src/index.ts:293` ya usa `item_id` como slug
> de la clave de agregación KV para `resume_click` — confirmando que la
> Opción 3 (cambiar `item_id` de pathname a slug) habría partido/fusionado en
> silencio los agregados históricos del scorecard semanal en el borde del
> deploy, exactamente la advertencia del plan. Diff acotado a los 4 archivos
> en alcance más la actualización de una línea en el archivo (ya archivado) de
> 038 que el propio plan pide actualizar como referencia cruzada: `+117/-7`.
> **Revisión (tech-lead) APROBADA** — reverificada de forma independiente en
> el worktree: diff línea por línea confirma `SAFE_ITEM_ID_RE` añadido junto a
> `FREE_FORM_TOKEN_KEYS`/`SAFE_TOKEN_RE` en ambos archivos, aplicado como
> chequeo separado (rechazo en el worker, drop en el cliente), `item_id`
> **no** agregado a `FREE_FORM_TOKEN_KEYS`; `pnpm exec vitest run` de los 2
> archivos de test objetivo → 104/104; suite completa `pnpm test` →
> **1035/1035** (1029 + 6 tests nuevos); `npx tsc --noEmit` del worker → exit
> 0; `astro check` → 0 errores; eslint acotado → exit 0; `format:check` →
> exit 0; `git status` limpio. Tests nuevos auditados — no vacíos: cubren
> forma real de producción (pathname) y token kebab simple como casos
> positivos, mayúsculas/unicode y path-traversal (`../etc/passwd`, `//..//`)
> como casos negativos, en ambos archivos de test (worker + cliente).
> Confirmado por grep que `sanitizeCollectorEvent` (ruta de export) sigue sin
> tocar los tres constantes de forma, igual que el precedente de 038.
> **Desviaciones documentadas y aprobadas en mérito:** el ejecutor actualizó
> los comentarios inline preexistentes que decían "item_id is intentionally
> excluded" para reflejar que ahora tiene su propio chequeo (no una exclusión
> simple), y renombró dos títulos de test que decían "(item_id queda fuera de
> este plan)" — ambas ediciones son de documentación, no de comportamiento, y
> mantienen la instrucción explícita del plan de que los dos regexes queden
> "visualmente distintos" en una revisión de código.
> **MERGEADO a `main` el 2026-07-12** (merge commit `66fd6a3c`, `--no-ff`
> sobre `advisor/043-analytics-item-id-shape-decision`). Con este merge, el
> hallazgo original de 037/038 sobre `item_id` queda completamente cerrado.
>
> **Reverificado en el árbol principal tras los tres merges** (040 →
> `013b59b0`, 042 → `afeb9203`, 043 → `66fd6a3c`, aplicados en ese orden sin
> conflictos por no compartir archivos): `pnpm test` → **1034/1034** (124
> archivos; 1029 base − 1 test eliminado por 042 + 6 tests nuevos de 043);
> `astro check` → 0 errores (mismo hint preexistente ajeno); `npx tsc --noEmit`
> del worker → exit 0; `eslint` sobre los 11 archivos fuente tocados → exit 0;
> `format:check` → exit 0; `git status` limpio salvo este archivo. Empujado a
> `origin/main`. Worktrees y ramas locales de los tres ejecutores eliminados
> tras el merge.
>
> **041 BLOQUEADO (2026-07-11, vía `/improve execute 041`):** ejecutor
> despachado en worktree aislado, sin drift previo. **Step 1 (compuerta de
> diagnóstico) descartó la hipótesis del plan antes de escribir código** — se
> detuvo correctamente en su propia condición de STOP, `git status` limpio, la
> rama resultante idéntica a `main` (borrada tras verificar). Reviewer
> reverificó cada afirmación leyendo el código, no solo el reporte del
> ejecutor: el cálculo/swap de `#resultado-contenido` está enganchado
> únicamente al evento `click` de `#calcBtn` — no hay listener `input`/`change`
> en los campos, así que los eventos sintéticos que `calculator-prefill.ts`
> despacha en carga no tienen a quién notificar; el swap solo puede ocurrir
> dentro de un gesto de usuario, lo que lo excluye de CLS por diseño, no por
> casualidad de medición. Medición empírica (Playwright +
> `PerformanceObserver` sobre build de producción, viewport móvil) confirmó:
> `#resultado-contenido` nunca cambió (`data-is-example` siguió `"true"`); el
> único shift de carga real fue el bloque "Pre-rellenado de tu última
> simulación" que `ensureHint()` en `calculator-prefill.ts` inserta con
> `host.prepend()` en la columna del formulario — **valor 0.0125, ~80× menor**
> que el p75 de campo reportado (1.008, RUM 2026-W27). Sospechoso secundario
> (Fraunces) también descartado por lectura directa (`Layout.astro:28-30`
> desactiva el preload en `/calculadoras/*` porque su `<h1>` no usa Fraunces).
>
> **BLOCKED, no REJECTED ni DONE:** el problema de campo (CLS 1.008 en esta
> ruta) sigue sin causa identificada — cae la hipótesis, no el hallazgo RUM. No
> se archivó (la política de archivado es solo para planes DONE); el plan
> queda en `plans/` con su diagnóstico completo documentado para quien decida
> el siguiente paso. **Abierto, no decidido por este agente:** (1) el hint bar
> de `ensureHint()` sí tiene un shift real de bajo impacto (0.0125) y es un
> patrón compartido por toda calculadora con `data-profile-prefill-host` —
> candidato de limpieza de bajo riesgo si se decide seguir, pero
> `calculator-prefill.ts` es explícitamente out-of-scope de 041; (2) la causa
> real del 1.008 de campo no se investigó más allá de esta página — un
> seguimiento debería ampliar la búsqueda del Step 1 en vez de asumir que el
> hint bar es "el bug", porque la brecha de magnitud lo descarta. La muestra
> RUM es de solo 20 visitas, así que tampoco está descartado que sea una
> sesión atípica.
>
> **044 EJECUTADO, APROBADO Y MERGEADO (2026-07-12, vía `/improve execute
> 044`):** ejecutor en worktree aislado
> (`.claude/worktrees/agent-a14e6c16a1c1a1cc9`, rama
> `advisor/044-calculator-prefill-hint-cls`, commit `9da2ce6b`,
> `fix(perf): convertir el aviso de prellenado en toast fixed para eliminar su CLS`).
> Sin drift antes de despachar. **Revisión (tech-lead) APROBADA** —
> reverificada de forma independiente en el worktree: diff acotado a los 2
> archivos en alcance; suite completa `pnpm test` 1029/1029 (124 archivos);
> `astro check` 0 errores; `eslint`/`format:check` de los archivos en alcance
> exit 0; los 3 tests nuevos auditados leyendo sus aserciones (no vacíos —
> caso 1 verifica `hint.parentElement === document.body`, la aserción
> estructural que prueba el fix). **Desviación documentada y aprobada en
> mérito:** el plan marcaba `top-4` como punto de partida no vinculante; el
> ejecutor midió con Playwright una colisión visual real con el header (81px
> mobile, 93px desktop) y ajustó a `top-28` — confirmado por el revisor
> directamente en las capturas de pantalla (`toast_mobile.png`/
> `toast_desktop.png`), sin superposición con `BackToTopButton`. CLS
> re-medido por el ejecutor con `PerformanceObserver`: cero entradas con y sin
> perfil prellenado — consistente con la garantía estructural de que un
> elemento `fixed` anclado a `document.body` no puede desplazar otros
> elementos.
>
> **MERGEADO a `main` el 2026-07-12** (merge commit `d737d7df`, `--no-ff`
> sobre `advisor/044-calculator-prefill-hint-cls`, a pedido del operador —
> "commit, push and merge to main"). `main` local se sincronizó primero por
> fast-forward con `origin/main` (`08b36350`, refresh automático ajeno del
> snapshot económico). Reverificado en el árbol principal tras el merge:
> `pnpm test` 1029/1029, `astro check` 0 errores, `eslint`/`format:check`
> limpios, `git status` limpio. Empujado a `origin/main`. **Archivado por
> política de cierre atómico** — el archivo del plan vive ahora en
> [`archive/044-calculator-prefill-hint-cls.md`](archive/044-calculator-prefill-hint-cls.md).
>
> **Plan 044 escrito el mismo día como carve-out de bajo riesgo de este
> diagnóstico** (a pedido del operador, tras indicarle esperar los próximos
> scorecards RUM antes de investigar más el 1.008): el shift real de 0.0125
> que sí se confirmó (el aviso "Pre-rellenado..." insertándose en flujo normal
> vía `host.prepend()`) tiene una corrección barata e independiente —
> convertirlo en un toast `fixed` (mismo patrón que `BackToTopButton.astro`),
> que por construcción no puede producir CLS. No cierra el 1.008 de campo;
> es una limpieza de bajo riesgo sobre el único hallazgo real y ya diagnosticado.
>
> **036 EJECUTADO, APROBADO Y MERGEADO (2026-07-11, vía `/improve execute
> 036`):** ejecutor en worktree aislado (`.claude/worktrees/agent-a5081695d39b9c24f`,
> rama `advisor/036-analytics-export-failure-detection`, commit original `c6a1ac88`,
> `fix(analytics): surface failed exports and detect overdue weekly export`).
> Drift check corrido primero: los 2 archivos que mostraban cambios desde
> `520a8685` (`index.ts`, `gsc-utils.mjs`) solo llevaban adiciones no
> relacionadas de 037/038 ya mergeadas — el `scheduled` handler, `runExport` e
> `isoWeekToDateRange` seguían byte-idénticos al excerpt del plan. Diff acotado
> a los 5 archivos en alcance (`+80/-6`): re-throw en `scheduled` con label
> corregido, helper puro `isExportOverdue(week, now, graceDays=2)` en
> `gsc-utils.mjs`, uso en la rama 404 del consumidor
> (`fetch-analytics-export.mjs`), y los 2 archivos de test nuevos/ampliados.
> **Revisión (tech-lead) APROBADA** — reverificada de forma independiente en
> el worktree: greps de los 3 done-criteria (`VALIDATION FAILED` ausente,
> `throw` presente en `scheduled`, `isExportOverdue` definido y usado);
> `vitest run` de los 2 archivos objetivo → 55/55; suite completa `pnpm test`
> → 123 archivos/1016 tests; `tsc --noEmit` del worker → exit 0; `eslint` de
> los 3 archivos fuente en alcance → exit 0; `format:check` → exit 0; `git
> status` limpio, solo los 5 archivos del plan (sin `.yml`). Tests nuevos
> auditados — no vacíos: los 4 casos límite de `isExportOverdue` derivan la
> fecha del propio helper (no hardcoded) y el test del worker fuerza un fallo
> real de infraestructura (KV que lanza) para verificar el rechazo de
> `scheduled()`.
>
> **Hallazgo de revisión — rama base desactualizada:** el worktree del
> ejecutor partió de `0e1a2a7a`, 3 commits detrás de `main` (`7edce163`) porque
> el plan 038 se ejecutó y mergeó mientras este agente corría en background
> (`git merge-base --is-ancestor` confirmó que NO era ancestro; `grep
> FREE_FORM_TOKEN_KEYS` ausente en el worktree original). Un fast-forward
> directo habría revertido 038. Corregido rebaseando la rama sobre el `main`
> actual **dentro del propio worktree descartable** (operación de solo
> verificación, no tocó el árbol principal): aplicó limpio, sin conflictos —
> 036 toca `scheduled`, 038 toca `validateEventPayload`/`FREE_FORM_TOKEN_KEYS`,
> zonas distintas del mismo archivo. Reverificado post-rebase: suite completa
> 1026/1026 (los 10 extra son los tests de 038), `tsc --noEmit` exit 0. Commit
> final post-rebase: `9049cb76`.
>
> **MERGEADO a `main` el 2026-07-11** (fast-forward `7edce163..9049cb76`, a
> pedido del operador — "merge and clean"). Reverificado en el árbol principal
> tras el merge: `pnpm test` 1026/1026, `tsc --noEmit` del worker exit 0,
> `eslint` exit 0, `format:check` exit 0, `git status` limpio. No empujado a
> `origin/main` (el operador no lo pidió). **Archivado por política de cierre
> atómico** — el archivo del plan vive ahora en
> [`archive/036-analytics-export-failure-detection.md`](archive/036-analytics-export-failure-detection.md).

> **038 BLOQUEADO, RE-ALCANCEADO Y RE-EJECUTADO (2026-07-11, vía `/improve
> execute 038`):** primer despacho bloqueado — el ejecutor corrió el grep de
> STOP-condition obligatorio antes de escribir código y se detuvo
> correctamente, sin tocar ningún archivo (`git status` limpio en el
> worktree). El reviewer reverificó cada afirmación leyendo el código
> directamente (no confió en el reporte). Hallazgo: la premisa de `item_id`
> en la sección "Current state" original del plan era **incorrecta** — el
> único emisor real (`ResumeWidget.astro:130`, vía `resumeState.ts`) envía
> `window.location.pathname` (p. ej. `/calculadoras/sueldo-liquido/`), no un
> slug kebab; aplicar el regex original tal cual habría **roto datos de
> producción en silencio**. `calculator_slug` y `rule_id` sí quedaron
> verificados como seguros (literales kebab estáticos en cada call site
> real); `action_id` no tiene ningún emisor real todavía (seguro de
> constreñir, sin riesgo). **Decisión del operador: dividir el plan.** 038
> se reescribió para cubrir solo las 3 claves verificadas seguras
> (`calculator_slug`, `rule_id`, `action_id`). `item_id` se separó al
> **plan 043** (nuevo), que no elige la opción de arreglo por sí mismo — trae
> tres alternativas con evidencia y trade-offs, y se detiene en una compuerta
> de firma humana antes de implementar cualquiera.
>
> **Segundo despacho (038 revisado) — EJECUTADO, APROBADO Y MERGEADO:**
> ejecutor en worktree aislado (`.claude/worktrees/agent-a1a3d6125d7804444`,
> rama `advisor/038-analytics-freeform-dimension-shape`, commit `5ebda2e0`,
> `fix(security): validar la forma de dimensiones libres de analytics`). Diff
> acotado a los 4 archivos en alcance (`+134` líneas, sin tocar `item_id`).
> **Revisión (tech-lead) APROBADA** — reverificada de forma independiente en
> el worktree, no solo confiando en el reporte del ejecutor: `grep` confirma
> `FREE_FORM_TOKEN_KEYS` con exactamente `calculator_slug`/`rule_id`/
> `action_id` (sin `item_id`) en ambos archivos; `pnpm exec vitest run` de
> los dos archivos de test → 97/97; suite completa `pnpm test` → 1021/1021
> (122 archivos); `tsc --noEmit` del worker → exit 0; `eslint` de los
> archivos en alcance → exit 0; `format:check` → exit 0; diff leído completo
> línea por línea (coincide con el plan, incluida la convención
> reject-vs-drop). Tests nuevos auditados — no son vacíos, cubren casos
> positivos y negativos reales. **MERGEADO a `main` el 2026-07-11** (fast-forward
> `0e1a2a7a..5ebda2e0`, a pedido explícito del operador — "merge"). Reverificado
> en el árbol principal tras el merge: `pnpm test` 1021/1021, `tsc --noEmit`
> del worker exit 0, `eslint` exit 0, `format:check` exit 0, sin conflictos,
> solo los 4 archivos del diff. No empujado a `origin/main` (el operador no lo
> pidió). **Archivado por política de cierre atómico** — el archivo del plan
> vive ahora en
> [`archive/038-analytics-freeform-dimension-shape.md`](archive/038-analytics-freeform-dimension-shape.md).
> `item_id` sigue sin protección — ver plan 043, aún `TODO` con compuerta de
> firma humana pendiente.

> **037 EJECUTADO, APROBADO Y MERGEADO (2026-07-11, vía `/improve execute
> 037`):** ejecutor en worktree aislado (`.claude/worktrees/agent-a5e7db02ea0226501`,
> rama `advisor/037-analytics-export-secret-header`, commit `e050d54b`,
> `fix(security): leer el secreto del export por Authorization header`).
> Sin drift (`git diff --stat 520a8685..HEAD -- workers/analytics-collector/src/index.ts
> workers/analytics-collector/wrangler.toml` vacío antes de despachar). Diff
> acotado a 3 de los 4 archivos listados en alcance: `index.ts`
> (`handleManualExport` ahora lee `Authorization: Bearer <secret>`, `?secret=`
> ya no autentica), `wrangler.toml` (comentario actualizado) y
> `tests/workers/analytics-collector/schema.test.ts` (casos existentes
> migrados a header + caso nuevo: `?secret=` sin header → 401). **Revisión
> (tech-lead) APROBADA** — reverificado de forma independiente en el
> worktree, no solo confiando en el reporte del ejecutor: `grep` confirma cero
> ocurrencias de `searchParams.get("secret")` y la lectura por header presente;
> `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` →
> 50/50; suite completa `pnpm test` → 1011/1011 (122 archivos); `tsc --noEmit`
> del worker → exit 0; `eslint` del archivo en alcance → exit 0;
> `format:check` → exit 0; `git status` limpio (ya commiteado); ningún valor
> real de secreto en el diff (solo fixtures `"manual-secret"`/`"wrong"` y el
> placeholder `<EXPORT_SECRET>`).
>
> **Desviación documentada y aprobada en mérito:** el Step 3 del plan (cambiar
> un ejemplo `curl` en `docs/backlog/PLAN-analytics-export-manual-trigger-2026-06-30.md`)
> no aplicaba — verificado independientemente que ese archivo no contiene
> ningún `curl` copiable; las dos apariciones de `?secret=` son prosa
> histórica de Diagnóstico/Diseño de un plan ya cerrado (`Completado
> 2026-07-07`). Editarlas falsificaría el registro histórico en vez de
> corregir un comando operativo real. El ejecutor lo dejó intacto y lo
> reportó explícitamente en vez de editarlo sin justificación — juicio
> correcto, no una desviación de alcance. Por esto el criterio "solo 4
> archivos modificados" del plan no se cumple literalmente (son 3); se
> considera satisfecho en espíritu.
>
> **Seguimiento identificado, no en alcance de este plan:** la forma vieja
> `?secret=` sigue documentada como histórica en
> `docs/operations/logs/progress_log.md` (líneas ~207, 221) y
> `docs/backlog/README.md` (línea 38) — ambos son bitácoras/índices de hechos
> pasados, no instrucciones operativas activas; no requieren cambio.
>
> **Verificación ampliada del STOP condition ("ningún caller automatizado
> pasa `?secret=`"):** el plan solo había verificado `docs/`; se amplió el
> grep a `scripts/`, `workers/`, tests y YAML de todo el repo. Únicos hits de
> código real fuera de `docs/` y del propio archivo tocado:
> `scripts/refresh-economic-snapshot.mjs:14`,
> `workers/economic-snapshot-refresh/src/index.ts:203` y
> `workers/reddit-mention-monitor/src/index.ts:133` — los tres son triggers
> manuales de **otros Workers** (`__refresh` con `GITHUB_TOKEN`/PAT, `__check`
> con `CHECK_SECRET`), sin relación con `EXPORT_SECRET` ni con
> `/api/analytics/export`. No existe ningún caller automatizado de este
> endpoint. STOP condition no se activa.
>
> **MERGEADO a `main` el 2026-07-11** (merge commit `9d722ac6`, `--no-ff`
> sobre `advisor/037-analytics-export-secret-header`, a pedido del operador —
> "commit, push, merge and clean"). Reverificado en el árbol principal tras
> el merge: `pnpm test` 1011/1011 (122 archivos), `tsc --noEmit` del worker
> exit 0, `astro check` 0 errores (mismo hint preexistente no relacionado en
> `content.config.ts`), sin conflictos, solo los 3 archivos del diff. Empujado
> a `origin/main`. **Archivado por política de cierre atómico** — el archivo
> del plan vive ahora en
> [`archive/037-analytics-export-secret-header.md`](archive/037-analytics-export-secret-header.md).
>
> **Pendiente humano, no ejecutable por agente — orden de despliegue
> importa:** (1) desplegar (`wrangler deploy`) — recién ahí `?secret=`
> empieza a devolver 401 en producción y el operador debe pasar a usar
> `Authorization: Bearer` en cualquier invocación manual; (2) rotar
> `EXPORT_SECRET`
> (`wrangler secret put EXPORT_SECRET --config workers/analytics-collector/wrangler.toml`)
> porque el valor anterior pudo haber quedado en logs de Cloudflare mientras
> viajaba por query string. Sin el paso (2) el fix de transporte queda
> incompleto según el propio plan ("solo se completa una vez rotado"). Ninguno
> de los dos es ejecutable por un agente.

**Hallazgos clave de la revisión de datos (para contexto de quien ejecute):**
- El embudo first-party NO es confiable hoy: `calculator_view`=0 en 21 calculadoras
  por 2 semanas y `completes > starts` en todas (tasa de conversión >100%). Plan 039
  lo arregla. **Hasta entonces, no decidir producto con esas tasas** — solo el ranking
  relativo de uso por calculadora es fiable (conversor-utm y seguro-cesantia lideran).
- La indexación real es **85%** (URL-inspection W26, 156/184), sana — no la crisis del
  ~42% que sugería una memoria vieja. El plan 035 protege justo ese 85%.
- El techo de tráfico real NO es el CTR de títulos sino el clúster estrella "sueldo
  líquido" enterrado en posición 73–95 (problema de autoridad/contenido → pipeline
  editorial, no metadata). El plan 040 lo dice explícitamente y NO intenta resolverlo
  con títulos.

> **039 EJECUTADO PARCIALMENTE, APROBADO Y MERGEADO (2026-07-10, vía
> `/improve execute 039`):** ejecutor en worktree aislado (`.claude/worktrees/agent-039-funnel`,
> rama `advisor/039-calculator-funnel-instrumentation`, commit `9031429d`,
> `fix(analytics): dedupe calculator_complete por page-view`). **Steps 1, 2 y 4
> completos y reverificados de forma independiente** en el worktree: suite
> completa `pnpm test` 1010/1010 (122 archivos); `astro check` 0 errores (1 hint
> preexistente no relacionado, deprecación de zod en `content.config.ts`);
> `eslint` sobre los 2 archivos en alcance exit 0; `format:check` exit 0; sin
> `console.*` residual. Diff limpio y acotado a `src/scripts/analytics.ts`
> (dedup `ONCE_PER_VIEW_EVENTS` + reset en `astro:page-load`/`astro:after-swap`,
> tal como especifica el plan) y `tests/integration/analytics-script.test.ts`
> (3 casos nuevos que sí verifican el payload real del `fetch` mockeado, no solo
> que la suite pase).
>
> **Step 1 (spike `calculator_view`=0): resuelto sin cambio de código** —
> diagnóstico verificado con Playwright contra `pnpm run dev` (navegación dura y
> soft-nav vía ClientRouter): el evento llega hoy correctamente a
> `POST /api/analytics/event` en ambos casos. `git log -S` + `merge-base`
> confirman que el commit `9e83a517` ("restore calculator views", 2026-07-07) ya
> arregló el tracking y es ancestro del commit base del plan (`520a8685`,
> 2026-07-09); la ventana del export `2026-W27.json` (2026-06-29 a 2026-07-05) es
> **anterior** a ese fix. El "views=0" que motivó el plan era un dato ya
> obsoleto al momento de escribir el plan, no un bug vigente.
>
> **Step 3 (typo `calculator_completed`): BLOQUEADO por conflicto de alcance
> real, no evitable.** El plan acota el fix a `formController.ts` y prohíbe
> tocar los controladores de las 22 páginas. Verificado independientemente: el
> mismo typo existe en **8 archivos**, no 1 —
> `formController.ts` + 7 `.astro` (`tarjeta-credito`, `operacion-renta`,
> `deposito-a-plazo`, `apv`, `finiquito-indemnizacion` [×2 ocurrencias],
> `credito-consumo`, `interes-compuesto`). Además
> `tests/integration/homepage-content.test.ts:361` (*"all 6 calculator pages
> fire calculator_completed with only calculator_slug"*) **fija por contrato**
> que `sueldo-liquido` debe seguir emitiendo el typo — el ejecutor lo intentó,
> `pnpm test` falló ahí, revirtió el cambio (confirmado `git diff --stat` vacío
> sobre `formController.ts`) y reportó en vez de expandir alcance sin
> autorización. Impacto real en métricas: **cero** — `calculator_completed` no
> está en `EVENT_ALLOWLIST` (verificado en `src/utils/analytics.ts` y en
> `workers/analytics-collector/src/index.ts`), así que el transporte lo
> descarta en la Gate 2 y nunca llega a KV ni al export; es código muerto, no
> una fuga de métricas.
>
> **Decisión del operador sobre el typo (2026-07-10): plan de seguimiento.**
> Se escribió el **plan 042** (ver tabla arriba), que quita el typo de los 8
> archivos (no 9 — recuento corregido: 7 `.astro` + `formController.ts`) y
> elimina la única aserción de `homepage-content.test.ts` que hoy lo exige, sin
> tocar la aserción hermana que sigue verificando `calculator_complete`. El fix
> de dedup (Step 2 de 039, el que soluciona `completes > starts`) es
> independiente y **no depende de 042**.
>
> **MERGEADO a `main` el 2026-07-10** (merge commit `a661e61a`, `--no-ff` sobre
> `advisor/039-calculator-funnel-instrumentation`, a pedido del operador —
> "commit, push and merge"). Reverificado en el árbol principal tras el merge:
> `pnpm test` 1010/1010, sin conflictos, solo `src/scripts/analytics.ts` y
> `tests/integration/analytics-script.test.ts` tocados. Empujado a
> `origin/main`. **Archivado por política de cierre atómico** — el archivo del
> plan vive ahora en [`archive/039-calculator-funnel-instrumentation.md`](archive/039-calculator-funnel-instrumentation.md);
> el ítem restante (typo `calculator_completed`) continúa como plan 042, TODO.
>
> **035 EJECUTADO Y APROBADO EN REVISIÓN (2026-07-10, vía `/improve execute 035`):**
> ejecutor en worktree aislado (`agent-a8d0acadc7efadffe`, commit `7dee7edc`,
> `fix(data-signals): abortar gsc-inspect antes de escribir en fallo masivo`). Diff
> limpio, exactamente los 3 archivos en alcance: `gsc-utils.mjs` (nuevo helper puro
> `shouldAbortIndexationRun(errors, total, maxErrorRatio = 0.5)`), `gsc-inspect.mjs`
> (import alfabético + guard justo antes del bloque `if (args.dryRun)`) y
> `tests/scripts/gsc-inspect.test.ts` (6 casos nuevos). **Revisión (tech-lead)
> APROBADA:** los 6 criterios de "Done" reverificados de forma independiente en el
> worktree — `vitest run` del archivo objetivo 20/20 (14 previos + 6 nuevos);
> **suite completa 1007/1007** (122 archivos), exit 0; `eslint` sobre los 2 archivos
> en alcance exit 0; `format:check` exit 0; grep confirma el helper importado y
> llamado antes del bloque dry-run; `git status` limpio, solo los 3 archivos del
> plan. El caso límite exacto (`shouldAbortIndexationRun(125, 250) → abort === true`,
> el que distingue `>=` de `>` en el umbral) está presente tanto en la implementación
> como en su test — verificado leyendo el diff, no solo el resultado en verde. Los
> tests preexistentes de CLI (`spawnSync`) no interactúan con el nuevo guard: todos
> retornan antes del loop de inspección (credenciales ausentes/malformadas, args
> inválidos). **Desviación de proceso detectada y verificada inofensiva:** el
> worktree del ejecutor partió de `origin/main` (`e173de58`) y no de la rama de
> trabajo actual (`dependabot/npm_and_yarn/js-yaml-5.1.0`, HEAD `0fcda7f6`) — ambas
> líneas divergen después de `a23a3a65`. Confirmado que los 3 archivos en alcance
> (más `.github/workflows/data-signals.yml`) son **byte-idénticos** entre ambas
> bases, así que el diff es correcto independientemente de la base; pero implica que
> la rama resultante `advisor/035-gsc-inspect-abort-on-mass-failure` no hace
> fast-forward limpio sobre la rama dependabot actual — el operador deberá decidir
> el destino del merge (main vía `origin/main`, o la rama dependabot). El ejecutor
> también renombró la rama generada por el harness
> (`worktree-agent-a8d0acadc7efadffe` → `advisor/035-gsc-inspect-abort-on-mass-failure`)
> para seguir la convención del plan; documentado en sus NOTES.
>
> **Update (mismo día, a pedido del operador — "commit, push, merge and clean
> branches"):** el commit `7dee7edc` se integró a la rama de trabajo actual
> (`dependabot/npm_and_yarn/js-yaml-5.1.0`) vía **cherry-pick** (SHA original
> `fcee34e5`, luego reescrito a `a86f88eb` por el rebase descrito abajo), no
> `git merge`, a propósito: un primer intento con `git merge --no-ff` trajo de forma
> incidental un archivo fuera de alcance
> (`src/infrastructure/economic/economic-parameters.snapshot.json`, un refresh de
> datos económicos automático heredado de la ascendencia `origin/main` de la rama
> `advisor/035`) porque esa rama partió de una base distinta a la actual (ver nota
> de deriva de rama arriba). Se deshizo ese merge (`git reset --hard`, nada se había
> pusheado todavía) y se reemplazó por un cherry-pick que trae únicamente los 3
> archivos revisados — mismo estándar de alcance que se le exigió al ejecutor.
> Reverificado tras el cherry-pick: `vitest run` del archivo objetivo 20/20 en el
> árbol principal. Push hecho a `origin/dependabot/npm_and_yarn/js-yaml-5.1.0`.
> Limpieza: rama local `advisor/035-gsc-inspect-abort-on-mass-failure` borrada y
> worktree `agent-a8d0acadc7efadffe` removido.
>
> **Reconciliación con `origin/main` (mismo día, "your call" del operador):** el PR
> #305 original de esta rama (bump de js-yaml) ya estaba **MERGED** en GitHub desde
> 2026-07-01, así que el push anterior no se adjuntaba a ningún PR abierto y la rama
> estaba 6 commits detrás / 6 adelante de `origin/main`. Investigado: de los 6
> commits propios, `979924a0` ("fix(deps): support js-yaml v5...") resultó ser
> contenido ya integrado a `main` — mismo árbol exacto que el commit squash-merge
> `94cc0f5a` (PR #305), confirmado con `git diff 979924a0 94cc0f5a --stat` vacío.
> Probado primero en una rama descartable: `git rebase origin/main` completa limpio,
> sin conflictos, y descarta automáticamente `979924a0` por ya-aplicado. Ejecutado
> en la rama real tras confirmar por `git fetch` que el remoto no había cambiado
> desde el push anterior: rebase limpio (5 commits, 0 detrás de `origin/main`),
> `vitest run` del archivo objetivo reverificado 20/20 post-rebase, y
> force-push (`git push --force-with-lease`) a
> `origin/dependabot/npm_and_yarn/js-yaml-5.1.0`. SHA final del fix de 035:
> `a86f88eb`. La rama sigue sin PR abierto ni mergeada a `main` — **archivar 035
> formalmente sigue pendiente de que el operador abra un PR (o decida un push
> directo a `main`)**; no se tomó esa decisión unilateralmente.
>
> **MERGEADO a `main` (mismo día, "your call" del operador):** sin protección de
> rama en `main` (repo privado, plan gratuito de GitHub — verificado con
> `gh api .../branches/main/protection` → 403 "upgrade required", no un bloqueo
> deliberado) y con la rama en fast-forward limpio confirmado justo antes del push
> (`git merge-base --is-ancestor origin/main HEAD`), se optó por push directo en
> vez de abrir PR — mismo patrón que 027/032/033/034. Nota: `ci.yml` (lint/test/
> build) dispara solo en `pull_request` + cron semanal, **no en push a `main`**;
> un push directo se salta ese CI. Mitigado corriendo el equivalente en local antes
> del push: suite completa 1007/1007, `eslint`/`format:check` limpios. El cierre
> incluye el archivado atómico de este plan en el mismo commit: `plans/035-*.md` →
> `plans/archive/`, tabla de pendientes renumerada, índice de `archive/README.md`
> actualizado. Fix principal: commit `a86f88eb`
> (`fix(data-signals): abortar gsc-inspect antes de escribir en fallo masivo`).
> **Backlog de la quinta pasada: 036–041 siguen TODO.**
>
> Verificado el 2026-06-15: 022 y 023 siguen sin implementar en el código
> (no existe `src/utils/formatCLP.ts`; los gates `compare-*.mjs` no tienen
> floor-guard de baseline vacío; el worker reddit no devuelve `PostAlertResult`).
>
> **022 EJECUTADO (2026-06-19, vía `/improve execute 022`):** commit
> `8f125212` (`refactor: unificar formateador CLP en módulo leaf compartido
> (Plan 022)`). Diff limitado a los 3 archivos en alcance: nuevo módulo puro
> `src/utils/formatCLP.ts`, re-export compatible desde `indicadores.ts` y alias
> cliente `fmt` desde `resultRenderer.ts`. **Revisión APROBADA:** `astro check`
> 0 errores; 105 archivos/770 tests verdes; ESLint limpio sobre los archivos
> cambiados y sobre el repositorio excluyendo únicamente los worktrees anidados
> preexistentes de `.claude/worktrees/**`; `format:check` verde; `knip` exit 0,
> con las 31 advertencias preexistentes y ninguna para el módulo nuevo. El
> comando literal `pnpm run lint` queda contaminado por esos worktrees anidados
> (1.512 errores de parser), no por este diff.
>
> 024–026 (2026-06-17): los tres son técnica/infra ejecutable sin nuevo visto
> bueno YMYL. 025 entrega motor + página pero **se detiene en la compuerta
> editorial** (no registra la calculadora en el portafolio; eso lo hace un humano
> tras aprobar el copy). El contenido financiero nuevo (clústeres, comparadores,
> definiciones de glosario nuevas) NO se planificó: requiere el pipeline editorial
> + firma humana — ver "Dirección" abajo.
>
> **024 RE-ESCALADO (2026-06-18):** al ejecutar se halló que la premisa del plan
> no calzaba con el código. El componente original presuponía un banner uniforme
> con `bannerText`, que solo existía en 1 de 11 páginas (`conversor-utm`); las
> otras 10 incrustaban solo `economicSourceLabel` en prosa propia y 8 mostraban la
> fecha en ISO cruda. Migrar literalmente habría violado las condiciones de STOP
> #2/#4 del plan (cambio de salida visible en superficie YMYL). El mantenedor
> (Carlos Ortega, autoridad de sign-off) optó por **estandarizar deliberadamente
> el banner** y firmó el copy: formato sobrio `Datos al {fecha larga} · {etiqueta}`
> (mapeo de fuente verbatim del helper), aplicado a las 11. Implementado:
> `resolveEconomicSourceLabel` + `formatEconomicDate`
> (`src/domain/economic/economicSourcePresentation.ts`, +5 tests),
> `CalculatorDataFreshness.astro`, y migración de las 11 páginas. Excepción
> deliberada: `conversor-utm` conserva `economicSourceMeta` (alimenta el hero y el
> `MethodologyBlock`), pero su etiqueta ahora deriva del helper. Extra firmado:
> `sueldo-liquido` muestra la vigencia del IMM (`immEffectiveDate`, sin cita de ley
> hardcodeada para evitar obsolescencia) en una línea persistente junto al footer
> — NO en el box `min-wage-warning`, cuyo texto reescribe `formController.ts` en
> runtime.
>
> **Follow-ups de balance positivo (2026-06-18):** (1) banner añadido a
> `dividendo-hipotecario` — única de las 8 calculadoras sin banner que consume un
> valor volátil (UF); las otras 7 no leen `economicParameters`, así que un banner
> ahí sería ruido. (2) Verificación en vivo (`astro dev`) de las superficies
> sensibles: las líneas de vigencia, el IMM y el slot "Valor usado" renderizan
> legibles y persistentes. (3) Cita de ley del IMM vía modelo de datos: **NO
> ejecutado** — el comentario en `EconomicParameterProvider.ts:66-73` revela que
> "Ley 21.751" fijó el valor ANTERIOR ($539.000); el IMM vigente ($553.553) viene
> de un reajuste despachado el 2026-06-16 cuyo número de ley el repo no registra.
> Insertar la cita habría puesto un error factual en superficie YMYL. La línea
> queda solo con fecha (data-driven, correcta). Investigado el 2026-06-18 (BCN/
> Diario Oficial): Ley 21.751 (DO 28.06.2025) fijó el valor ANTERIOR ($539.000);
> el reajuste a $553.553 fue despachado a ley el 2026-06-16 pero **aún no está
> promulgado/publicado**, así que su número de ley no existe públicamente todavía.
> DIFERIDO: cuando la ley se publique en el Diario Oficial, agregar campo `immLaw`
> en `EconomicParameterProvider.ts` + snapshot y mostrarlo en la línea del IMM de
> `sueldo-liquido`.
> `astro check` 0 errores; 733 tests pasando (la única falla, `cluster-source-of-truth`,
> es preexistente en `main` y ajena a este cambio).
>
> **034 EJECUTADO, APROBADO Y MERGEADO (2026-06-26, vía `/improve execute 034`):**
> ejecutor en worktree aislado (`agent-afa53c254ad5c9a0f`, commit `7c290c1c`,
> `fix(calc): mostrar error real cuando falla la carga del histórico UF`). Diff
> limpio, un solo archivo en alcance (`src/pages/calculadoras/conversor-uf.astro`,
> +5/-2): `loadHistoricData` ahora trata respuesta no-OK como fallo (`if (!res.ok)
> throw`) y resetea `historicData`/`historicFetchPromise` en el catch (permite
> reintento), y la rama de datos vacíos de `buscarUfHistorica` muestra un error real
> en vez del falso «Cargando datos históricos…» eterno. **Revisión (tech-lead)
> APROBADA:** greps 0/1 (literal viejo fuera, mensaje nuevo presente); `astro check`
> 0 errores; eslint/prettier/`check:reader-facing-copy` exit 0; alcance limpio (1
> archivo). **Verificación de runtime hecha por el revisor con Playwright** (el
> ejecutor no podía manejar navegador): contra `astro preview`, abortando el endpoint
> `/api/uf-historico-lookup.json` la UI muestra el mensaje honesto y NO un spinner;
> al restaurar el endpoint y reintentar, el box de error se oculta y se renderiza un
> valor (la ruta de reintento funciona porque `historicFetchPromise` se resetea).
> **MERGEADO a `main`** por fast-forward (`63c3121f..7c290c1c`, instruido por el
> operador) y empujado a `origin/main`. Archivado por cierre atómico. **Backlog de
> planes vacío: 001–034 todos DONE.**
>
> **033 EJECUTADO, APROBADO Y MERGEADO (2026-06-26, vía `/improve execute 033`):**
> ejecutor en worktree aislado (`agent-ad5fdfb2e33f80d29`, commit `2ff547eb`,
> `fix(seo): derivar dateModified de calculadoras desde page-lastmod-index`). Diff
> limpio, exactamente los 21 archivos en alcance: nuevo helper `src/utils/pageLastmod.ts`
> (lee `context/page-lastmod-index.json` con caché, normaliza barra final),
> `CalculatorJsonLd.astro` (deriva `dateModified` del índice como default; el prop
> explícito sigue ganando), las 18 páginas con el literal `dateModified="2026-06-01"`
> eliminado, y `tests/utils/pageLastmod.test.ts` (3 tests). **Revisión (tech-lead)
> APROBADA:** 0 literales en fuente; las 4 páginas data-driven (uf/utm/inflación/
> gratificación) intactas; `astro check` 0 errores; eslint/prettier exit 0;
> **853/853 unit** (3 nuevos, significativos). **Prueba a nivel de build** (que el
> ejecutor saltó por red): `pnpm run build` exit 0 y el HTML emite la fecha por-página
> del índice (`"dateModified":"2026-06-21"` en sueldo-liquido/iva/apv/comisiones-afp)
> mientras las data-driven mantienen su fecha de dato (`conversor-uf` → `2026-06-26`;
> `conversor-utm` → `2026-06-01` porque `utmLastUpdated` es la fecha de la UTM de junio,
> NO un literal residual — confirmado: la fuente no tiene literal). **MERGEADO a `main`**
> por fast-forward (`29450e08..2ff547eb`, instruido por el operador) y empujado a
> `origin/main`. Archivado por cierre atómico.
>
> **032 EJECUTADO Y APROBADO EN REVISIÓN (2026-06-26, vía `/improve execute 032`):**
> ejecutor en worktree aislado (`agent-a78822f079be8c7eb`, rama
> `worktree-agent-a78822f079be8c7eb`, commit `702b7cc2`,
> `fix(a11y): asociar hints y errores y exponer foco en componentes de calculadora`).
> Diff limpio, exactamente los 5 archivos en alcance: `CalculatorField.astro`
> (`aria-describedby`/`hintId`), `CalculatorRadioGroup.astro` (`<fieldset>/<legend>`
> + `peer-focus-visible:ring`), `sueldo-liquido.astro` (`headingId` al panel +
> `focus-visible` en el toggle + `role="region"`/`aria-labelledby` en
> `#afp-comparison`), `formController.ts` (`aria-invalid`/`aria-describedby` en
> show/hideError) y el test nuevo `tests/accessibility/calculator-semantics.test.ts`.
> **Revisión (tech-lead) APROBADA:** todos los criterios reverificados de forma
> independiente en el worktree — los 8 greps con su conteo exacto; `astro check` 0
> errores; eslint/prettier exit 0 sobre las rutas en alcance; **850/850 unit**;
> **suite a11y completa 46/46** (43 existentes + 3 nuevos, sin regresión axe en las
> 19 superficies). Desviación documentada y aceptada por mérito: Prettier separó
> `role="region"` y `aria-labelledby` en líneas adyacentes, así que el grep de una
> sola línea del criterio devuelve 0 — ambos atributos están presentes (verificado
> por greps separados); forzar una línea violaría el gate de formato.
> **MERGEADO a `main` el 2026-06-26** (fast-forward `a7bb8b2e..702b7cc2`, instruido
> por el operador) y empujado a `origin/main`. Archivado por política de cierre atómico.
>
> **031 RECONCILIADO COMO DONE (2026-06-26, vía `/improve execute 031`):** al
> correr el chequeo de deriva se halló que el plan **ya estaba ejecutado y
> mergeado en `main`** — nunca se había reconciliado en el índice. El commit
> `fcdf551c` (`content(iva): glosario IVA y backlinks internos desde posts`)
> lleva el mensaje de commit exacto del flujo git del plan: crea
> `src/data/glossary/iva.md` (cuerpo de 190 palabras, frontmatter válido, CTA a
> `/calculadoras/iva/`), agrega la CTA blockquote al post `ahorro-e-inversion`
> (línea 106, verbatim el texto del Paso 2) y registra la categoría del término
> nuevo en `glossaryCategories.ts`. El post `como-hacer-presupuesto-mensual`
> quedó **correctamente descartado** (Paso 3 condicional / STOP #2): su prosa
> trata ingresos, no precios de compra — la única mención de "Supermercado" es
> una celda de tabla, no un gancho para CTA. Un pase posterior de interlinking
> (`a04ac131`, OPP-01–04) enriqueció `iva.md` con `relatedCalculators` y
> `relatedLaws`. **No se despachó ejecutor** (el diff habría sido vacío);
> criterios de hecho verificados sobre HEAD `a7bb8b2e` (2 referencias a la
> calculadora en el glosario, 1 en el post; árbol limpio). Archivado.
>
> **027 EJECUTADO (2026-06-19, vía `/improve execute 027`):** ejecutor en worktree
> aislado (`worktree-agent-ae65a67166468bfd0`, commit `15fdef6b`,
> `fix(scripts): extraer fecha de vigencia AFP con parser genérico`). Diff limpio,
> exactamente los 3 archivos en alcance: `scripts/lib/spanish-date.mjs` (nuevo,
> helper puro `parseSpanishLongDate` + `extractEffectiveDateFromHtml`),
> `scripts/refresh-editorial-volatile-data.mjs` (solo la lógica de fecha de
> `extractAfpUnoDataset` + import), `tests/scripts/spanish-date.test.ts` (11 tests).
> **Revisión (tech-lead) APROBADA:** todos los done-criteria verificados de forma
> independiente en el worktree — grep sin matches del literal/regex viejos; 11 tests
> nuevos verdes; test de snapshot AFP out-of-scope sigue verde; `lint`/`format:check`/
> `astro check` exit 0. Las 2 fallas del suite (`EconomicParameterProvider` IMM en
> modo snapshot y `cluster-source-of-truth`) son **preexistentes** — confirmado
> corriéndolas en el commit padre `9a4eb37d` (fallan idénticas); heredadas de la rama
> `advisor/024`, ajenas a 027. Nota del ejecutor (correcta): el ejemplo de verificación
> manual del Step 1 del plan (`<b>lunes 3</b> de noviembre`) devuelve `null` porque la
> etiqueta `</b>` parte el dígito del día de "de mes"; es un fallo del *ejemplo* del
> plan, no del código — los tests de regresión usan formas realistas (tags alrededor
> de la frase, no partiendo dígito-de-"de") y pasan. Código enviado verbatim, sin
> improvisar. El commit `15fdef6b` se basaba directamente en `origin/main`
> (`2b238da5`), independiente de 024. **MERGEADO a `main` el 2026-06-19** vía PR
> #240 (squash `369ff01b`), rama remota eliminada.

## Completados — archivados

### Auditoría profunda 2026-09-14 — planes 097–100 (bundle worker 097–100 DONE; resto TODO)

| Plan | Título | Cierre |
| --- | --- | --- |
| [097](archive/097-worker-v2-bounded-body.md) | Enforce byte-accurate bounded body read on worker-v2 ingestion | **DONE 2026-09-14**; merge `67487da9` (commits `c34a8241` + `570a1679`; `check:ci` exit 0 pre-merge, tsc + 118 tests verdes post-merge). Desviación autorizada: reparación de baseline type-only (`DurableCounterRow` interface→type, TS2344 preexistente en árbol limpio). Criterio grep literal documentado como intent-met (byte accounting vive en el reader compartido de `index.ts`; pinneado por test unicode-bytes→413 en path v2) |
| [098](archive/098-worker-v2-config-validation.md) | Harden worker-v2 config and input validation | **DONE 2026-09-14**; merge `7366f12d` (commit `bfa39a9d`; `check:ci` exit 0 pre-merge, tsc + 133 tests verdes post-merge). Ejecución delegada + revisión adversarial del asesor (veredicto APPROVE). Desviaciones aceptadas en mérito: `wrangler.toml` intacto (vars ya presentes, ahora leídas/validadas); `SCHEMA_VERSION=abc` en export manual → 500 `export_failed` (fail-closed, sin rama v1 silenciosa); override laxo de `MAX_BODY_SIZE` no eleva el cap del reader 097 (fail-closed, comentado en código). Excerpts reconciliados a `79877da6` antes del despacho |
| [099](archive/099-analytics-export-hardening.md) | Harden the analytics weekly export (pagination, KV sunset, compact artifact) | **DONE 2026-09-14**; merge `fe935119` (commits `28c43ef4` + `d43112da`; `check:ci` exit 0 pre-merge, tsc + 141 tests verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE tras 1 ronda REVISE comment-only). Decisiones en mérito: paginación keyset sobre la tupla ORDER BY completa (retry-safe); sunset usa `window.from` (straddling escanea); formato escapado `v2:` solo en filas con `:;/=\` (serie legado intacta); `wrangler.toml` y `scripts/data-signals/` intactos (compact verificado read-only vía `JSON.parse`). Nota de revisión: scoring del boundary 80-char corregido por el ejecutor (el `split(":")` ingenuo del validador parte también el `\:` escapado; pieza más larga hoy 55 chars, con headroom). Excerpts reconciliados a `a55d5344` antes del despacho |
| [100](archive/100-analytics-taxonomy-tests.md) | Close the analytics taxonomy gap and pin worker-v2 with tests | **DONE 2026-09-14**; merge `29856700` (commit `2a560702`; `check:ci` exit 0 pre-merge, suite 166/1576 + cobertura 91.56% verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Hallazgo de reconciliación: inventario real ~3x el planeado (forma-2: `calculator_complete` con params legado; 5 nombres CTA sin allowlist; 7 eventos search/resume/clicks + set DecisionWizard). Decisiones en mérito: CTA se allowlistan (remover rompía 2 tests fuera de alcance + renombraba dataLayer); cero ediciones en formController/worker/`.astro` (mapeo slug→id + enriquecimiento central + CLIENT_ONLY stripping componen la cura); Tier-B/search+resume+wizard pineado no-transmisible + diferido a revisión de privacidad (detalle en el plan). Erratas del plan corregidas en reconciliación: conteo 14→15, Step-2 coverage (include, no solo exclude), Sets de data-signals añadidos a scope (el sync test los exige). Excerpts reconciliados a `40e3958e` antes del despacho |
| [103](archive/103-economic-date-honesty.md) | Stop fabricating indicator dates and flag estimated UTA | **DONE 2026-09-14**; merge `153c596c` (commit `8da83704`; `check:ci` exit 0 pre-merge, 49 + 88 tests verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Sin drift (in-scope intacto desde planificación). Decisiones en mérito: regex ISO en vez de slice (mapea basura→`undefined`, espeja `toRealIsoDate` del worker); `provenance.uta` solo-valores-estables (sin `verifiedAt` — preserva idempotencia 091); paridad UTM write-only (verificado: ningún consumidor lee `provenance.utm.status`). Excerpts reconciliados a `4234805c` antes del despacho |
| [104](archive/104-mortgage-totals-insurance.md) | Include insurance in mortgage lifetime totals (or relabel) | **DONE 2026-09-14**; merge `1ad6efce` (commit `a43cf808`; `check:ci` exit 0 pre-merge, 33/261 + `astro check` verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Sin drift. Decisiones en mérito: totales aditivos desde filas del schedule (base intacta); UI sigue el patrón `(sin seguros)` propio de la página (ejemplo estático + scenario summary armonizados, fila con-seguros condicional a `hasInsurance` preexistente); frase metodológica con tasas de usuario + fuente UF. Excerpts reconciliados a `5a00858c` antes del despacho |
| [102](archive/102-uf-history-payload.md) | Serve UF history by range and stop importing 638 KB for two dates | **DONE 2026-09-14**; merge `64cb1f88` (commit `1591c20e`; `check:ci` exit 0 pre-merge, 169/1618 + `astro check` verdes post-merge — fast-forward sobre bot `8ceeb83a` sin conflictos). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Sin drift en fuentes (tests/ ajeno de 097–104 excluido del drift check en reconciliación). Decisiones en mérito: helper `FetchHistoricalUf.ts` nuevo (no listado en scope — exigido por el test plan, misma capa que `LookupHistoricalUf` intacto); sidecar mensual adicional para uf-hoy (frontmatter SSG no puede self-fetch); 404-con-metadatos y slice-bounds documentados; sidecars generados sin red (datasets grandes intactos). Nuance registrado: punto-boundary del gráfico puede diferir en valor (cobertura de meses idéntica, solo display). Sin cambios title/meta/H1/route. Excerpts reconciliados a `cee0b53f` antes del despacho |
| [105](archive/105-input-contract-hardening.md) | Small input-contract hardening (prepayment bound, storage shape, reddit count) | **DONE 2026-09-14**; merge `14a0455c` (3 commits `a1c04b3d`/`4ca3b974`/`9e50b5cd`; `check:ci` exit 0 pre-merge, 63/566 + `astro check` verdes post-merge — fast-forward sobre bot `c85aef26` sin conflictos; delta +1 archivo/+10 tests vs worktree explicado: son los tests `FetchHistoricalUf` del merge 102, ajenos a 105). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Sin drift en fuentes. Decisiones en mérito: guard no-amortizante en español junto a sus pares (bound en inglés del bloque `assertInput` intacto); log `run.complete` corregido junto al return (misma cuenta engañosa, sin consumidores de forma); filtrado por-entrada en stores (idéntico en fixtures totalmente corruptas, preserva lo sano); `isKnownProfileField` reutilizado. Excerpts reconciliados a `cee0b53f` antes del despacho |
| [106](archive/106-supply-chain-hygiene.md) | Supply-chain hygiene (release-age retirements, override triggers, audit scoping) | **DONE 2026-09-14**; merge `25bd5b65` (4 commits, uno por cohorte + docs; `check:ci` exit 0 pre-merge, frozen + audit + prettier verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Sin drift. Retirado solo lo madurado (huérfanos 2026-08 + `qs@6.16.0` vencida 09-05; cohortes futuras intactas — verificado línea por línea); lockfile solo 2 líneas de selectores (regen no-frozen forzada por pnpm, probada limpia); pins parent-aware con `remove-when`; excepción extract-zip acotada dev-only + invocación venv documentadas; TD-0097 actualizado. Excerpts reconciliados a `6d80d32b` antes del despacho |
| [108](archive/108-scenario-save-extraction.md) | Extract the scenario-save snapshot helper under test | **DONE 2026-09-14**; merge `6b512348` (3 commits helper→rewire→tests; `check:ci` exit 0 pre-merge, 171/1636 + cobertura + `astro check` verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Drift post-102/104 evaluado archivo por archivo (disjunto de la forma del adapter). Decisiones en mérito: `getLastResult` aceptado-sin-leer (leerlo cambiaría semántica 089 = STOP; absorbe varianza de nombres y estabiliza firma para 107); 107 desbloqueado (su Depends apunta al archivo). Excerpts reconciliados a `37276dc4` antes del despacho |
| [107](archive/107-calculator-client-helpers.md) | Unify calculator client helpers (scenario adapter, CL parser, glossary regex) | **DONE 2026-09-14**; merge `06d3ba3e` (3 commits pin→parser→glossary; `check:ci` exit 0 pre-merge, 14/140 + `astro check` verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Reconciliación mayor: Step 1 rescopeado a verify-only (108 ya unificó como `createScenarioSaveAdapter` — segundo wrapper rechazado como churn); operacion-renta excluido (semántica condicional-strip distinta). Decisiones en mérito: multi-coma ahora rechaza (antes partial-parse, documentado); hoist con rebuild por tamaño de set (sound: solo crece) probado byte-idéntico en 8 goldens + 19 corpus. Excerpts reconciliados a `dcd381d9` antes del despacho |
| [109](archive/109-onboarding-env-docs.md) | Fix onboarding versions and document the env + bootstrap contract | **DONE 2026-09-14**; merge `acb0f331` (commits `d9350b14` + `c52ddfde`; `check:ci` exit 0 pre-merge, `check:docs` + prettier + stale-grep verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE tras 1 ronda REVISE de una palabra). Sin drift. Hallazgo de ejecución: 4º sitio stale (`PROJECT_CONTEXT_MASTER.md:180`) incluido; `AGENT_ENTRYPOINTS.md` verificado sin versiones (intacto). Sin valores de secretos (revisado: solo nombres). Excerpts reconciliados a `7d82ccbf` antes del despacho |
| [110](archive/110-worker-typecheck-logging.md) | Add worker typecheck gates and unify analytics logging | **DONE 2026-09-14**; merge `e78b02b8` (2 commits gate→envelope; `check:ci` exit 0 pre-merge —incluye el nuevo gate—, `check:workers` + 159 tests verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Drift = trabajo landed 097–105, inventariado (16 sitios ad-hoc). Decisiones en mérito: helper `log()` único exportado de `index.ts` (no duplicado); mensajes legado verbatim como `message` (4 tests de logs sin tocar); postura de privacidad intacta (IP/key logging sin cambios); README con ejemplos verificados. Excerpts reconciliados a `206016cb` antes del despacho |
| [112](archive/112-apv-error-spike.md) | Spike APV error instrumentation + annotate the event dictionary | **DONE 2026-09-14**; merge `6e45e750` (commit `fb4450ae`, spike + dictionary row; `check:ci` exit 0 pre-merge, `check:docs` + prettier verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Sin drift salvo contrato vía 100 (entrada `calculator_error` intacta, cero emisores re-verificado). Decisiones en mérito: progreso como propuesta no-decidida (no bifurca taxonomía); quiebre de medición pre/post-100 nombrado; fila diccionario una sola; doc con `git add -f` (backlog gitignored, sin excepción `APV-*` — follow-up sugerido). Excerpts reconciliados a `ab44d813` antes del despacho |
| [113](archive/113-gate-d-titular-citation.md) | Define the Gate-D capture routine, titular semantics, and refresh the APV citation | **DONE 2026-09-14**; merge `04ccef30` (commit `d4d5e273`, docs + mapping + 2 tests; `check:ci` exit 0 pre-merge, 11/11 + `check:docs` verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Sin drift salvo Sets del plan 100 (mapeo titular intacto, shift +14). Decisiones en mérito: split titular en tres vías del propio plan (sin operator call pendiente); SIN REGISTRO sin código nuevo (derivación preexistente); cita APV solo-cita con veredicto intacto; runbook stale-line intacta (out of scope, flagged). Excerpts reconciliados a `ef734707` antes del despacho |
| [114](archive/114-apv-error-implementation.md) | Implement APV error-signal emissions E1–E4 (112 handoff) | **DONE 2026-09-15**; merge `d4981b2c` (helper+tests → wiring; `check:ci` exit 0 pre-merge, 175/1673 + `astro check` verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). NOTA DE PROCESO: despacho sobre base stale `ab44d813` (no se re-verificó HEAD; verificado inocuo — cero solape con 112/113/bots, merges limpios). Decisiones en mérito: E3 movido dentro del handler (return top-level imposible; alternativa del propio spike; degradado visible honesto); enum espejo citado al contrato; progreso NO creado (propuesta sin decidir). Excerpts verificados a `ab44d813` + solape-cero contra `093f44d0` antes del merge |
| [115](archive/115-conformance-sweep.md) | Conformance sweep — runbook titular line + backlog gitignore exception | **DONE 2026-09-15**; merge `c908edad` (1 commit, 2 líneas; `check:ci` exit 0 pre-merge, `check:docs` + prettier verdes post-merge). Ejecución delegada + revisión adversarial (APPROVE sin rondas REVISE). Diff exacto de 2 líneas, cero comportamiento. Misma NOTA DE PROCESO sobre base stale que 114. |

Movido a [`plans/archive/`](archive/README.md).

### Auditoría de dirección 083–086 — reconciliados 2026-09-12

| Plan | Título | Cierre |
| --- | --- | --- |
| [083](archive/083-next-step-instrumentation-parity.md) | Dar paridad de instrumentación a las tres superficies de "siguiente paso" y cerrar el drift del enum `page_type` | **DONE verificado 2026-09-12**; merge `e3bd14b3` |
| [084](archive/084-utility-led-decision-readiness.md) | Hacer decidible la ventana utility-led — regla de denominador mínimo y captura del Gate D | **DONE verificado 2026-09-12**; merge `b02f0c70` |
| [085](archive/085-journey-thesis-vehicle-spike.md) | Spike de dirección — qué vehículo y qué superficie pueden probar la tesis del recorrido antes del 2026-11-02 | **DONE verificado 2026-09-12**; merge `2935878f` |
| [086](archive/086-apv-completion-drop-diagnosis.md) | Diagnosticar la caída de completitud de la calculadora APV (58% → 14% en tres semanas) | **DONE verificado 2026-09-12**; merge `d412aa57` |

Movidos a [`plans/archive/`](archive/README.md). Todos DONE y mergeados en `main`,
salvo las dos excepciones cerradas sin implementar que se indican abajo.

### Planes heredados cerrados 2026-09-04 (041, 046, 055)

| Plan | Título | Cierre | Estado |
|------|--------|--------|--------|
| [041](archive/041-impuesto-cls-load-shift.md) | Corregir CLS de carga en `impuesto-segunda-categoria` | 2026-09-04 | **REJECTED** — premisa desaparecida: el `CLS p75 1,008` era contaminación RUM pre-047; con `requestHost` el peor CLS del sitio es 0,014. No implementado (no correspondía) |
| [046](archive/046-converter-recurrence-return-hook-spike.md) | Spike: recurrencia en conversores y return-hook privacy-safe | 2026-09-04 | **SUPERSEDED** por 085 + 083 — el hook ya existe y está instrumentado (`UtmPostResultActions.astro:43`); falta entrega, no diseño. No implementado (no correspondía) |
| [055](archive/055-calculator-consolidation-spike.md) | Spike: consolidación por URL de 5 calculadoras | 2026-09-04 | **DONE** (ejecutado y aprobado 2026-08-11; entregable `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md`). Premisa APV anotada como vencida → plan 086; compuerta §5 sigue abierta |

Justificación completa en [Cierre de planes heredados](#cierre-de-planes-heredados-2026-09-04).

### Séptima auditoría profunda 2026-08-10 (plans 057–081; todos archivados)

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [078](archive/078-lhci-mobile-wiring.md) | Ejecutar config Lighthouse mobile (warn-only, scheduled) | P3 | S | DONE (squash `76373cd8`, PR #415, 2026-08-11) — `perf:ci:mobile` cableado en `lighthouse-ci.yml` scheduled con `if: always` (la telemetría mobile no se pierde), timeout 30, artifacts untracked; desviación documentada en el plan: `cancel-in-progress` del workflow reutilizado sin cambios |
| [079](archive/079-push-validation.md) | Validar snapshot/artefactos al llegar a main (push + validador) | P2 | M | DONE (squash `76373cd8`, PR #415, 2026-08-11) — `scripts/validate-committed-artifacts.mjs` (parseo snapshot + finitos uf/utm/opcionales + fecha indicatorUpdatedAt.utm + parseo recursivo JSON de data-signals, reporta TODOS los fallos, `VALIDATE_ARTIFACTS_ROOT`); workflow `validate-committed-artifacts.yml` (push a main, paths filtrados, `contents: read`, setup-node SHA-pineado); `[skip ci]` removido de data-signals (verificado: el worker de snapshot commitea con COMMIT_MESSAGE sin `[skip ci]` en wrangler.toml:20 — el push del bot dispara el validador); `check:committed-artifacts`; 8 tests; suite 1322/1322, format + lint verdes; 119 JSON de data-signals parsean |
| [080](archive/080-clp-formatter-unify.md) | Unificar formateadores CLP en formatCLP + guard de estilo | P3 | S–M | DONE (squash `32bd56ce`, PR #416, 2026-08-11) — 20 sitios en 18 calculadoras migrados a `formatCLP` (incl. `function fmt` y `formatPeso` que el grep del plan no capturaba); 3 sitios divergentes corregidos (iva ×2, gratificacion-legal — ahora redondean); guard `check-no-inline-clp-formatters.mjs` cableado en `check`; STOP condición 3 ejercitada: conversor-uf:611 (histórico UF con options explícitas) → regex de la regla 2 ajustada a calls sin options + test de regresión; `fmtCurrency` (Intl) NO migrado (familia distinta, reportado); 5 tests; suite 1327/1327, astro check 0 errores, format + lint verdes |
| [081](archive/081-postbuild-verification.md) | Capa de verificación post-build (aserciones sobre dist/) | P2 | L | DONE (squash `33e04b30`, PR #419, 2026-08-11) — `scripts/check-postbuild.mjs` con 6 checks activos (csp-hashes-injected, sitemap-noindex-free, seoTitle-rendered, pagefind-bounded, jsonld-no-script-breakout, spacing-sanity) + check 2 waivado por el propio plan; paso final de `build`/`build:ci` + `check:postbuild`; desviación en mérito: breakout JSON-LD detectado por balance `<script>`/`</script>` (la extracción naive trunca en el cierre inyectado); fix de CI: runner solo en ejecución directa (import por vitest disparaba checks contra dist inexistente); 13 tests; build:ci completo exit 0 (0.3s/327 páginas); suite verde, format + lint verdes |
| [057](archive/057-pagefind-prune.md) | Purgar el índice pagefind en cada build (33 MB acumulado → 1.3 MB) | P1 | S | DONE (fast-forward `70f6a1d9`, 2026-08-10) — `rm -rf dist/pagefind` en `build`/`build:ci`; `public/pagefind` resultó ser gitignored (sin eliminaciones tracked); build exit 0, índice 1.3 MB/72 archivos, suite 1187/1187 |
| [058](archive/058-sw-volatile-money-paths.md) | SW network-first para conversor-uf/utm y uf-hoy (valores stale hoy) | P1 | S | DONE (fast-forward `7d5c4910`, 2026-08-10) — 6 rutas nuevas en `VOLATILE_HTML_PATHS` (con y sin `/index.html`); rama network-first existente cubre las 3 páginas; build exit 0, `dist/sw.js` verificado, suite 1187/1187 |
| [059](archive/059-kv-counter-integrity.md) | Superficializar fallos KV de contadores + documentar aproximación | P1 | S–M | DONE (fast-forward `1e99a772`, 2026-08-10) — `console.error` en `ingestEvent`/`checkRateLimit` (clave truncada sin IP), README + wrangler.toml documentan la aproximación, 3 tests nuevos; **auditoría adversarial post-implementación integrada en el mismo branch** (commit `1e99a772`): regla CDN `max-age=300` para `/uf-hoy/` que el plan 058 había asumido, mensaje de log preciso get/put, comentario fail-open corregido, guard de no-fuga de IP, y `tests/integration/sw-volatile-paths.test.ts` (rutas vivas + presencia de las 3 páginas + sincronía SW↔`_headers`); suite 1193/1193 |
| [060](archive/060-uta-honest-fallback.md) | UTA: fallback a diciembre SII + warn si se anualiza UTM×12 | P1 | S | DONE (fast-forward `da9e1ee5`, 2026-08-10) — `fetchDecemberUtmWithSiiFallback` (mindicador → SII vía `parseSiiUtm` → null + warn), headers browser-like para SII (403 de sitios gov), **auditoría adversarial integrada** (commit `da9e1ee5`): guard `value > 0` en branch mindicador, `siiUtmPageUrl` compartida (DRY), 5 tests nuevos de sad paths + guard de headers; verificado contra HTML real de SII (Diciembre 2025 = 69.542, UTA oficial 834.504 cruz-valida `×12`); suite 1201/1201; **deploy del worker pendiente (compuerta humana)** |
| [061](archive/061-calculator-cta-event.md) | Reactivar `article_calculator_cta_click` (onclick CSP-bloqueado) | P2 | S | DONE (fast-forward `9245604a`, 2026-08-10) — onclick inline eliminado, mapeo en `CTA_EVENT_NAMES`, evento añadido al contrato compartido cliente+worker (sin copia separada en el worker — verificado), `INTERNAL_URL` regex en la frontera de seguridad, `cta_label` excluido por diseño (texto libre), excepción del e2e estático removida; **auditoría adversarial integrada** (commit `9245604a`): sin doble `source_click` (monedario.cl no es host oficial), otros CTAs v2 confirmados muertos por diseño (poda taxonómica), 8 guards del regex y frontera estricta; suite 1212/1212; **deploy del collector pendiente (compuerta humana — desplegar junto al sitio)** |
| [062](archive/062-inline-link-spacing-tokenizer.md) | Tokenizer spacing: preservar `<` literal y stacks | P2 | S | DONE (fast-forward `15b880e2`, 2026-08-10) — regex `(<[a-zA-Z\/!][^<>]*>)|([^<]+)|(.)` con desviación en mérito (`[^<>]` en vez del `[^>]` del plan: `<b && c` tragaba `</script>` — verificado empíricamente; los tags válidos nunca contienen `<`); **auditoría adversarial integrada** (commit `15b880e2`): bug confirmado vivo en el dist (54 archivos con `<` stray, 326 con JSON-LD), 8 tests de regresión (JSON-LD `a<b`, comentarios con `>`, `<` dígito, idempotencia), transparencia verificada en 327 HTML reales (0 diffs); suite 1220/1220 |
| [063](archive/063-chile-calendar-tz.md) | Calendario America/Santiago en fetcher SII y gates de frescura | P2 | S | DONE (fast-forward `5b0f0b46`, 2026-08-10) — `calendarPartsInTz` en `siiUtm.ts`, `chileCalendarParts` en `economicFreshness.ts` y `chileMonthKeyAndDay` en el gate script (patrón `Intl` + `America/Santiago`, nunca `getUTC*`); test existente corregido a semántica chilena (`T00:00Z` era día 7 en Chile); test de frontera verificado OLD stale → NEW grace (`2026-09-08T00:30Z`); script exit 0 contra snapshot real (sin cambio de veredicto); suite 1224/1224; **deploy del snapshot worker pendiente (compuerta humana)** |
| [064](archive/064-no-fabricated-indicator-dates.md) | No fabricar fecha "hoy" por indicador (gate de frescura real) | P2 | S | DONE (fast-forward `efd03dcc`, 2026-08-10) — `toRealIsoDate` + `indicatorUpdatedAt` solo con fechas observadas; desviaciones en mérito: tipo aflojado a `uf?/utm?/uta?` (el plan afirmaba `uta` ya opcional — no lo era; consumidores verificados: provider propio todo-opcional, `mergePrev` corregido a `?.` por TS18048), `toIsoDate` muerto eliminado; 3 tests nuevos (fecha faltante omitida, happy path, `lastUpdated` = hoy requiere `decemberUtm: null` — el UTA del 060 siempre aporta fecha real); suite 1227/1227; **deploy del snapshot worker pendiente (compuerta humana)** |
| [065](archive/065-jsonld-escape.md) | Escapar `<` en toda serialización JSON-LD | P2 | S | DONE (fast-forward `7523c0c3`, 2026-08-10) — `serializeJsonLd` leaf (`\u003c`) migrado en 29 sitios/25 archivos (completitud verificada 29/29, 0 emisores fuera de `set:html`); **auditoría adversarial integrada** (commit `7523c0c3`): guard de input no-stringificable (undefined/function/symbol → `""`, antes TypeError en build), 5 tests; flake intermitente de la suite registrado como TD-0103 (18 corridas sin reproducir, preexistente); suite 1232/1232 |
| [066](archive/066-secret-scan-pr.md) | Gitleaks bloqueante por PR + quitar allowlist de `.env` | P1 | S | DONE (merge `dccebfb9`, 2026-08-10) — job `gitleaks-pr` bloqueante (sin `continue-on-error`, `fetch-depth: 0`); desviación en mérito: `--stdin` no existe en 8.30.1 (verificado contra el binario) → scan diff-scoped materializando los archivos ACMR del PR (`git diff -z --name-only` + `gitleaks dir`); allowlist `.env`/`.env.local` eliminada; pipeline validado end-to-end (secreto en `.env` → exit 1, antes oculto); suite 1232/1232; integrado con el refresh page-lastmod del bot (#404) vía merge ort |
| [067](archive/067-seotitle-tests.md) | seoTitle: presupuesto 65 en schema + gate + tests de resolución | P1 | M | DONE (fast-forward `3f073c99`, 2026-08-10) — `.max(65)` en posts+glosario, `SEO_TITLE_MAX` en el gate con hook `FRONTMATTER_REPO_ROOT`, `resolvePageTitle` compartido; **hallazgo del audit en la implementación**: la regla "| Monedario" del plan era incompatible (38/41 posts reales llevan el sufijo de marca dentro del seoTitle — el Layout usa verbatim, sin duplicación posible; aplicada rompía CI con 41 errores) → eliminada en mérito y convertida en test de aceptación; longitud máxima real 61 ≤ 65; **auditoría adversarial integrada** (commit `3f073c99`): fixture robusto (primer post real vía readdir), guard de sincronía schema↔gate (ambos 65), H1 verificada en PostDetails:296, gate confirmado en ci.yml:124; suite 1240/1240 |
| [068](archive/068-frontmatter-characterization.md) | Caracterización de `check-frontmatter.mjs` (7+ casos) | P2 | M | DONE (fast-forward `47414be0`, 2026-08-10) — 9 casos de caracterización (canario, deprecated, categoría, lang, título warning, description warning, advisory válido/corto/HTML) reconciliados en el archivo de 067; severidad REAL leída del script (title/description = warnings, no bloqueantes como asumía el plan); `frontmatter-schema.test.ts` renombrado a `yaml-parser.test.ts` y repuntado; hook `FRONTMATTER_REPO_ROOT` reutilizado; **auditoría adversarial integrada** (commit `47414be0`): clase articleAdvisory añadida (3 casos) + bug del fixture atrapado (inserción tras el `---` de cierre dejaba el campo fuera del frontmatter — los negativos lo detectaron); suite 1249/1249 |
| [069](archive/069-legal-constants-check.md) | Check de consistencia de constantes legales espejadas | P2 | S–M | DONE (fast-forward `c83ad352`, 2026-08-10) — `check-legal-constants.mjs` con inventario declarativo 4 constantes/16 mirrors (IMM, fecha, topes 135.2/90 con los nombres reales de cada bundle — el tope 135.2 vive en 5 archivos con 3 nombres distintos); cableado en `check` + ci.yml; **auditoría adversarial integrada** (commit `c83ad352`): bug real confirmado y corregido (un mirror comentado ocultaba drift — las líneas `//` se filtran antes de matchear), test de integración contra el repo real (inventario stale = falso verde), test de pattern drift; suite 1255/1255 |
| [070](archive/070-url-freeze-exceptions-module.md) | Módulo único de excepciones URL-freeze (esquema compartido) | P2 | M | DONE (fast-forward `c21e93d9`, 2026-08-10) — `scripts/lib/url-freeze-exceptions.mjs` (12 campos + `isCompleteException`/`loadApprovedExceptionUrls`/`validateExceptionSchema`); STOP del plan verificado: los gates tenían criterios de validación distintos (indexable estricto con approvedAt + mensajes; routes silencioso) — el módulo unifica solo el esquema y preserva ambos comportamientos; premisa del plan ("indexable filtra en silencio") corregida en la cabecera del módulo; **auditoría adversarial integrada** (commit `c21e93d9`): equivalencia byte-idéntica viejo vs nuevo probada empíricamente, gate migrado a `isCompleteException`, borde `expiresAt == now` testeado; suite 1262/1262 |
| [071](archive/071-indicadores-hoy-tests.md) | Tests del endpoint indicadores-hoy + formateadores | P2 | S–M | DONE (fast-forward `de865e59`, 2026-08-10) — exports del endpoint, `getIndicadoresWith(loader)` factory aditivo, 9 tests (formateadores con formatos reales verificados, deltas, buildTitle, fechas con índice seguro, dolar presente/ausente/prev); shape real documentado (key `dolar` presente con undefined — consumidores guardan con `!== undefined`); **auditoría adversarial integrada** (commit `de865e59`): formateadores duplicados byte-idénticos de `IndicadoresHoy.astro` consolidados en `@/utils/indicadores` (fuente única), types reales corregidos en tests (`telemetryFlag`/`source` — `astro check` venía fallando enmascarado por un pipe desde el plan); suite 1271/1271, astro check exit 0 |
| [072](archive/072-analytics-fetch-branches.md) | Tests de las ~12 ramas del fetch handler del collector | P2 | M | DONE (fast-forward `a619461b`, 2026-08-10) — 10 guards HTTP nuevos (OPTIONS 204, disabled 503, PUT 405, Origin 403, CT 415, CL 413, body 413, JSON 400, payload 422, 202+CORS) sin duplicar los ya cubiertos (429/fail-open/export); `RATE_LIMIT_MAX`/`ALLOWED_ORIGIN` exportadas (aditivo); ningún guard sorprendió (sin bugs); **auditoría adversarial integrada** (commit `a619461b`): guard 413-de-stream explícito (el body string dependía de que Node no setee CL — frágil), ataques de prefijo de Origin (match exacto: `monedario.cl.evil.com`/www/puerto → 403), CORS en 403; suite 1282/1282 |
| [073](archive/073-coverage-widen.md) | Ampliar gate de cobertura a `src/**` (con caracterización) | P2 | S+M | DONE (fast-forward `6a658057`, 2026-08-10) — `include: ["src/**/*.ts"]` con exclusions documentadas (STOP >8 activado: pages/components/scripts/config/content, utils DOM, `constants.ts`, `content.config.ts`, remark parsers — auditados limpios — y `workers/**` — hallazgo: el glob matcheaba `workers/*/src/*.ts`); 25 tests de caracterización (csp-hashes internals+hook, sw-version hook, getPath BASE_URL, articleView, tag-helpers, i18n, readingTime, slugify); global **91.02%** lines; objetivos: contracts 100%, csp-hashes 100%, sw-version 100%, inline-link-spacing 81.5%, indicadores 80%; residual único preexistente: SimulateDebtRenegotiation 78.4%; **auditoría adversarial integrada** (commit `6a658057`): getUniqueTags default cubierto, exclusiones verificadas como principios; flake TD-0103 identificado (timeout 5000ms en verify-analytics-worker-deployment bajo carga); suite 1306/1306 |
| [074](archive/074-stale-overrides.md) | Limpiar overrides/exclusiones de maduración vencidos | P2 | S | DONE (fast-forward `59e72a98`, 2026-08-10) — overrides removidos (nanoid/brace-expansion/fast-uri, verificados redundantes con `pnpm why` post-cambio: la resolución natural produce exactamente las mismas versiones), 61 exclusiones muertas eliminadas (escaneo preciso contra claves reales del lockfile con formato mixto), 4 vivas conservadas (napi-rs, eslint-plugin-astro, js-yaml@5.2.3, postcss@8.5.25 — el plan las daba por muertas, discrepancia reportada); lockfile byte-idéntico (el diff transitorio del primer install era solo el espejo de metadata de overrides — 0 cambios de versión); `pnpm audit --prod` 0 vulns; **auditoría adversarial integrada** (commit `59e72a98`): prueba decisiva `pnpm why` sin overrides, sin downgrade silencioso (snapshots intactos), metadata stale del lockfile documentada (informativa, se sincroniza sola), TD-0104 registrado (guard CI para exclusiones muertas — causa raíz de la pudrición, diferido por el plan); suite 1306/1306 |
| [075](archive/075-iso-week-module.md) | Módulo compartido de semana ISO (Jan-4) para scripts | P2 | S | DONE (fast-forward `4915bd47`, 2026-08-10) — `scripts/lib/iso-week.mjs` (4 funciones) migrado en audit-ctr + build-weekly-search-report sin tocar expectativas (15 tests existentes pasan sin cambios); 8 tests de año-límite con valores reales (discrepancia del plan documentada: 2026 SÍ tiene W53 — 31-dic es jueves; quirk W99 caracterizado, benigno por el guard `!expectedWindow` del caller); `toIsoDateString` muerto eliminado; **auditoría adversarial** (sin cambios): equivalencia viejo-vs-nuevo probada con **358 casos, 0 diffs** (W01–W53 × 6 años × 2 funciones + 27 fechas de borde + malformados); suite 1314/1314 |
| [076](archive/076-pyproject-prune.md) | Podar stack Python no usado (scraping/MCP) | P2 | M | DONE (fast-forward `56bf32d7`, 2026-08-10) — 22 deps podadas (inventario real de imports verificado: solo googleapiclient/google-auth + fonttools/brotli — hallazgo: subset-fonts.py usa stdlib + subprocess, las deps pip se quedan para el runtime); descripción corregida; `uv.lock` −891 líneas (70 de 116 paquetes), `uv lock --check` en sync; pytest 38/38, ruff limpio, pip-audit exit 0; sin doc-drift en la policy de adaptación; **auditoría adversarial** (sin cambios): venv podado sin cruft (verificado), imports runtime OK, los 3 skips de pip-audit local son paquetes ambientales del operador (proyecto polla — fuera del repo; CI corre limpio), workflows sin referencias a podadas; suite Node 1314/1314 |
| [077](archive/077-check-ci-aggregate.md) | `check:ci` — un comando que reproduce el CI localmente | P2 | S–M | DONE (fast-forward `450b258b`, 2026-08-10) — `check:ci` con 23 gates (espejo del CI verificado contra ci.yml + 6 huérfanos rápidos, todos <1.4s medidos); texto del issue automático y README/START_HERE corregidos; **hallazgo preexistente reportado (STOP)**: `check:editorial-timeliness` falla por 4 posts con SLA vencido el 2026-08-09 (el scheduled CI en main falla hoy igual; deuda editorial, no se tocó); **auditoría adversarial integrada** (commit `450b258b`): `check:legal-citations` y los 2 checks de hero añadidos (huecos del espejo), `check:images` excluido con razón (borra PNGs — DX-03), divergencias documentadas (editorial sin ENFORCE, hero validación-solo, timeliness modo estricto); lockfile sync de metadata de 074 materializado (benigno) |

### Auditoría de dirección 2026-08-02 (plans 053–056; todos archivados)

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [053](archive/053-gsc-measurement-baseline.md) | Completar el baseline de medición GSC (gate de semanas faltantes estricto en CI + exports de país/dispositivo) | P1 | M | DONE (fast-forward `f1e37560`+`bc979708`, 2026-08-02) — incluye ronda de auditoría que corrigió el gate estricto en CI; backfill de 2026-W29 pendiente como paso operativo |
| [054](archive/054-editorial-evidence-ledger-spike.md) | **Spike de dirección**: ledger de evidencia del pipeline editorial (inventario 3/53, reproducción del checker, veredicto claim vs. evidencia) | P1 | M | DONE (fast-forward `673ad8dc`, 2026-08-02) — entregable `docs/reports/EDITORIAL-EVIDENCE-LEDGER-2026-08-02.md`; gap real = 19 (22 en alcance, 19 sin cadena 06/07); compuerta humana abierta (opciones A/B/C en el ledger); merge local, sin push |
| [056](archive/056-decision-paths-afc-prepago-credito-spike.md) | **Spike de dirección**: rutas de decisión contextuales AFC/prepago/crédito (diseño de NextSteps + extensión del patrón post-resultado) | P2 | M | DONE (2026-08-11, commit `f2c64ce7`) — entregable `docs/backlog/DECISION-PATHS-AFC-PREPAGO-CREDITO-2026-08-02.md` (recorridos mapeados, hueco único = reempleo AFC; sets de 3 NextSteps con `next_step_id` verificados contra `SAFE_TOKEN`; generalización parametrizada de `UtmPostResultActions`; medición con umbrales del registry y datos W30–W32; piloto recomendado = prepago-credito). Ejecutado reconciliado (drift re-corrido 2026-08-11). **Desviación aprobada en mérito**: `.gitignore` +1 línea (`!docs/backlog/DECISION-PATHS-*.md`) para commiteable. Derivó el plan **082** (implementación paso 1); compuertas humanas resueltas en sesión (copy aprobado) o diferidas (§5: hueco reempleo, enlace externo, alerta AFC — fuera de alcance del 082) |
| [082](archive/082-next-steps-decision-paths.md) | Implementar los NextSteps contextuales AFC/prepago del diseño 056 (paso 1, sin post-result) | P2 | S | DONE (commit `04e61411`, 2026-08-11) — 3 ítems en `related` de seguro-cesantia (finiquito, CIC vs FCS) y prepago-credito (ahorro, entre costo y renegociación) con copy aprobado por el operador; **desviación aprobada en mérito**: guard de `CalculatorPortfolio.test.ts` relajado (antes exigía `related` solo → calculadoras; ahora verifica existencia de cualquier superficie interna: posts/guias/glosario) + 2 tests nuevos de orden/copy; suite 1358/1358, astro check 0 errores, `check:routes` sin diffs, interlinks sin under-linked nuevos. Paso 2 (post-result parametrizado) diferido hasta 2 semanas comparables del registry |

### Sexta auditoría profunda / Issue #315 — 2026-07-16

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [047](archive/047-growth-005-rum-hostname-filter.md) | Filtrar RUM por `requestHost = monedario.cl` y conservar allowlist defensiva | P2 | M | DONE (commit `a3ac9504`; final Issue #315 change) |
| [048](archive/048-search-signal-integrity.md) | Deltas WoW reales, estados de fuente explícitos y CTR acotado | P1 | M | DONE (commit `e472ea43`; final Issue #315 change) |
| [049](archive/049-analytics-calendar-and-funnel-semantics.md) | Alinear semanas a Chile con cutover versionado y reportar ratios de eventos honestamente | P1 | M | DONE (PR #331, squash `ac0c4a17`; Worker `dbc273e9-4f89-48f8-b572-fff6e536ff81`) |
| [050](archive/050-weekly-search-ops-current-scale.md) | Restaurar revisión semanal con decisión explícita el 2026-08-01 | P1 | S | DONE (commit `e01d4a93`; final Issue #315 change) |
| [051](archive/051-analytics-deployment-parity.md) | Hacer reproducible y verificable el deploy del Worker de analytics (workflow manual + verifier de paridad + ADR/runbook) | P1 | M | DONE (fast-forward `79d78372`, 2026-08-02) — auditoría post-entrega integrada (`e5efcc66`, `79d78372`); **smoke de producción (Step 5) pendiente del operador** |
| [052](archive/052-worker-manual-trigger-auth.md) | Sacar secretos de URLs y separar el PAT del trigger manual | P1 | S | DONE (squash `8bc8a0a2`, PR #420, 2026-08-11) — **re-implementado** (la rama original con `ae9246bd` se perdió; TD-0105): ambos workers autentican por `Authorization: Bearer` (TRIGGER_SECRET dedicado / CHECK_SECRET), comparación en tiempo constante, forma legacy `?secret=` rechazada (401 verificado en producción); 17 tests; ADR-20260716. Secrets desplegados y workers deployed (`93e040ba` / `c0e5ed1d`); **pendientes del operador**: smoke positivo por header y rotación del PAT (autoridad de cuenta GitHub) |

### Quinta auditoría profunda 2026-07-10

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [035](archive/035-gsc-inspect-abort-on-mass-failure.md) | Abortar `gsc-inspect` antes de escribir cuando la mayoría de inspecciones fallan (no sobrescribir con 0% indexado) | P1 | S | DONE (commit `a86f88eb`) |
| [036](archive/036-analytics-export-failure-detection.md) | Hacer detectable un export de analytics ausente/fallido (clase de fallo OBS-01) | P2 | M | DONE (fast-forward `9049cb76`) |
| [037](archive/037-analytics-export-secret-header.md) | Recibir el secreto del export manual por `Authorization` header, no por query string | P2 | S | DONE (merge commit `9d722ac6`) — rotación de `EXPORT_SECRET` pendiente, paso humano |
| [038](archive/038-analytics-freeform-dimension-shape.md) | Restringir la forma de `calculator_slug`/`rule_id`/`action_id` en analytics | P2 | S | DONE (fast-forward `5ebda2e0`) — `item_id` separado al plan 043 |
| [039](archive/039-calculator-funnel-instrumentation.md) | Reparar instrumentación del embudo (views=0, completes sobre-contados, evento typo) | P1 | M | DONE parcial (commit `a661e61a`) — typo residual desglosado en [042](archive/042-remove-calculator-completed-typo-event.md) |
| [044](archive/044-calculator-prefill-hint-cls.md) | Convertir el aviso de prellenado en toast `fixed` para eliminar su CLS (0.0125) | P3 | S | DONE (merge commit `d737d7df`) — carve-out del diagnóstico de 041 (BLOCKED, ver nota arriba); no cierra el CLS de campo (p75 1.008), aún sin causa identificada |
| [040](archive/040-seo-title-snippet-refresh-brief.md) | Brief SEO title/snippet de seguro-cesantia — Título A aprobado por el operador | P3 | S | DONE (merge commit `013b59b0`) — apv y conversor-uf sin tocar (bajo valor esperado); seguimiento de medición pendiente a 2–4 semanas |
| [042](archive/042-remove-calculator-completed-typo-event.md) | Quitar el evento typo `calculator_completed` de 8 archivos + el test que lo fijaba | P3 | S | DONE (merge commit `afeb9203`) — código muerto, cero impacto en métricas; cierra el ítem residual de 039 |
| [043](archive/043-analytics-item-id-shape-decision.md) | Restringir la forma de `item_id` en analytics (carve-out de 038) — Opción 2 elegida por el operador | P3 | S | DONE (merge commit `66fd6a3c`) — cierra el hallazgo original de 037/038 sobre `item_id` |
| [045](archive/045-measurement-resequence-two-lanes.md) | **Spike de dirección** (`/improve next` 2026-07-12): re-secuenciar el crecimiento en dos carriles + checklist de baseline; entregable `docs/reports/GROWTH-DIRECTION-DELTA-2026-W27.md` | P1 | S | DONE (fast-forward `f34210ff`) — brief read-only; follow-up de implementación desglosado en el plan 047 (GROWTH-005); adopción de la re-secuencia = decisión del owner |

### Auditorías 2026-06-15 a 2026-06-19

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [031](archive/031-iva-calculator-backlinks.md) | Backlinks internos a la calculadora de IVA (glosario + post) | P3 | S | DONE (commit `fcdf551c`) |
| [032](archive/032-calculator-accessibility-semantics.md) | A11y de calculadoras: foco al resultado, asociación hint/error, foco visible en radios | P2 | M | DONE (commit `702b7cc2`) |
| [033](archive/033-calculator-datemodified-from-lastmod-index.md) | `dateModified` de calculadoras desde `page-lastmod-index.json` | P3 | S | DONE (commit `2ff547eb`) |
| [034](archive/034-conversor-uf-historic-fetch-error-state.md) | Error real (no «Cargando…» eterno) al fallar la carga del histórico UF | P3 | S | DONE (commit `7c290c1c`) |
| [022](archive/022-consolidate-clp-formatter.md) | Consolidar formateador CLP en módulo leaf único | P3 | S | DONE (PR #243, squash `2e3c1e4a`) |
| [023](archive/023-gate-floor-and-reddit-alert-atomicity.md) | Guardas anti-paso-vacío en gates rutas/RSS + alerta Reddit atómica | P3 | S | DONE (PR #244, squash `e65c6ebc`) |
| [024](archive/024-calculator-data-freshness-component.md) | Estandarizar vigencia de datos de calculadoras | P1 | M | DONE (PR #239, commit `b924b5dc`) |
| [025](archive/025-iva-calculator-engine.md) | Motor + página de calculadora de IVA | P2 | M | DONE (commits `c4f6945a`, `64644fa6`) |
| [026](archive/026-glossary-thematic-index.md) | Índice temático del glosario junto al alfabético | P3 | M | DONE (`47ce4221`) |
| [027](archive/027-afp-refresh-effective-date-parser.md) | Extraer fecha de vigencia AFP con parser genérico | P1 | M | DONE (PR #240, squash `369ff01b`) |
| [028](archive/028-imm-shared-constant.md) | Consolidar IMM en módulo leaf único | P2 | S | DONE (commit `13a3d390`) |
| [029](archive/029-calculator-controller-tests.md) | Tests de caracterización de controladores | P2 | M | DONE (commit `8d69b79c`) |
| [030](archive/030-economic-snapshot-freshness-gate.md) | Gate de frescura del snapshot económico | P2 | S | DONE (commit `c9d72ed4`) |

### Re-auditoría 2026-06-15

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [020](archive/020-afp-comparison-cheapest-name.md) | Corregir nombre de AFP cableado ("AFP Uno") en la nota de comparación | P2 | S | DONE (commits `e7e3aa72`, `439583e5`) |
| [021](archive/021-economic-snapshot-hardening.md) | Endurecer worker de snapshot económico (IPC ausente, deriva, timeouts) | P2 | M | DONE (commit `95f028ef`) |

### Auditoría 2026-06-11

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [001](archive/001-csp-kofi-domain.md) | Agregar `storage.ko-fi.com` al CSP | P1 | S | DONE |
| [002](archive/002-pin-setup-node-sha.md) | Pinear `actions/setup-node` por SHA | P2 | S | DONE |
| [003](archive/003-page-lastmod-pr-gate.md) | Convertir `page-lastmod.yml` a PR-gate | P2 | M | DONE |
| 004 | Higiene de dependencias (5 correcciones) | P1 | S | DONE |
| 005 | Limpieza de duplicación de código (6 correcciones) | P1 | S | DONE |
| 006 | Correcciones de rendimiento (O(n²), re-sorting, ArticleView) | P1 | S | DONE |
| 007 | Fundación de DX (pre-commit, editorconfig, knip, CI timeout) | P1 | S | DONE |
| 008 | Infraestructura de testing + cobertura crítica | P1 | M | DONE |
| 009 | Endurecer CSP a hash-based | P2 | M | DONE |
| 010 | Cache poisoning del proveedor económico + null assertions | P2 | S | DONE |
| 011 | Reemplazar `innerHTML` con DOM safe APIs + try/catch AFP | P2 | M | DONE |
| 012 | Docs | P2 | S | DONE |
| 013 | Paralelizar CI + caching de build | P2 | M | DONE |
| 014 | Refactor `sueldo-liquido.astro` (god file 2318 LOC) | P2 | M | DONE |
| 015 | Expandir paneles de escenarios | P2 | M | DONE |
| 016 | Centralizar share-result | P2 | M | DONE |
| 017 | Diseño: calculator shell (prototipo, sin activar) | P2 | M | DONE |
| 018 | Diseño: activación MDX (DecisionTree/InlineCalculator, sin activar) | P2 | M | DONE |
| 019 | Diseño: dashboard AFP (sin activar) | P2 | M | DONE |

> **Nota de reconciliación (2026-06-15):** los planes 004–019 se generaron el
> 2026-06-11 y se ejecutaron vía ramas `advisor/0NN-*` integradas en
> `advisor/integration-2026-06-15` (ver git log: "apply Plan 015", "Plan 011,
> 014, 016", etc.). Los archivos 001–003 (más 020–021) están en
> [`plans/archive/`](archive/README.md); los archivos 004–019 nunca se
> conservaron en el árbol y viven solo en el historial git de sus ramas.
> Numeración monotónica continúa en 022.

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED (razón)` · `REJECTED (razón)`

## Notas de dependencia

- **053 EJECUTADO, MERGEADO Y ARCHIVADO (2026-08-02, fast-forward
  `f1e37560`+`bc979708`)** — su gate de semanas faltantes y los exports de
  país/dispositivo son prerequisito informativo para 055 y 056: el registry
  (`UTILITY_LED_EXPERIMENT_REGISTRY.md`) exige integridad ≥95% antes de decidir
  con datos. El backfill de 2026-W29 sigue pendiente como paso operativo del
  operador (workflow_dispatch con `week=2026-W29`).
- **056 se relaciona con 046** (mismo embudo de conversores): 046 diseña el
  return-hook de recurrencia; 056 diseña los siguientes pasos contextuales. Si
  046 se ejecuta antes de 056, el ejecutor de 056 debe reconciliar ambos
  diseños (condición de STOP explícita en el plan).
- **022 y 023 son independientes entre sí** y de los planes previos; pueden
  ejecutarse en paralelo o en cualquier orden. Ambos son defensa-en-profundidad
  de bajo riesgo (P3).
- 023 toca el worker `reddit-mention-monitor` y dos scripts `compare-*`; 022
  toca `src/utils/indicadores.ts`, `resultRenderer.ts` y un módulo leaf nuevo.
  No se solapan.
- **024, 025 y 026 son independientes** entre sí y de 022/023; ejecútalos en
  cualquier orden. Orden recomendado por prioridad (024 → 025 → 026): 024 es el de
  mayor leverage, menor riesgo y totalmente técnico, y extiende el fix del IMM ya
  mergeado. 025 y 026 terminan en compuerta humana (025: registro en portafolio
  tras firma de copy; 026: revisión de categorías).
- **027, 028, 029 y 030 son independientes** entre sí y de todo lo anterior;
  ejecútalos en cualquier orden. Los cuatro son técnica pura, sin compuerta
  editorial. Orden recomendado por leverage: 027 (P1, bug real de dato stale) →
  028 (S, DRY de constante legal) → 030 (S, gate de monitoreo) → 029 (M, infra de
  tests). Nota: 028 usa el mismo patrón de módulo leaf que 022; si ambos aterrizan,
  `src/domain/economic/` queda como hogar natural de constantes/presentación
  client-safe. 029 desbloquea con red de seguridad la futura migración a
  CalculatorShell (dirección 017/018/019).

## Hallazgos considerados y rechazados

*(Para que auditorías futuras no re-investiguen lo mismo.)*

Auditoría 2026-06-11:
- **SEC-001 (Cloudflare IDs hardcodeados)**: resuelto; requiere env vars. No abierto.
- **SEC-002 (security headers ausentes)**: resuelto; `public/_headers` con CSP, HSTS, XFO, nosniff. No abierto.
- **SEC-003 (.env en historial git)**: trackeado pero vacío/template; sin secretos en el diff. No abierto.
- **uuid vulnerable via @lhci/cli**: moderate en dep de dev tool (LHCI), no en producción. Se resolverá al actualizar LHCI.
- **innerHTML con datos calculados**: los valores interpolados son números calculados por el use-case (no input raw). Patrón seguro.

Re-auditoría 2026-06-15:
- **Math de las calculadoras (todos los use-cases)**: auditoría dedicada de
  CalculateNetSalary, SimulateRetirementProjection, CalculateApvComparison,
  EstimateFiniquito, CalculateMortgage, EstimateUnemploymentCoverage y dominio
  tributario/económico — **0 bugs de cálculo**. Topes, tramos, redondeo y
  continuidad en bordes verificados contra los tests. No abierto.
- **Escape de embeds Discord (reddit-monitor)**: `JSON.stringify` ya escapa todos
  los campos del embed; el markdown de Discord es intencional y no ejecuta script.
  No abierto.
- **Secreto `/__refresh` reusa `GITHUB_TOKEN` (economic worker)**: el endpoint no
  está ruteado y el token se compara (no se expone); higiene menor reconocida en
  el propio comentario del código. No abierto (bajo valor).
- **CalculatorShell / DecisionTree / InlineCalculator sin importar**: NO es código
  muerto — son prototipos de los planes de diseño 017/018/019, pendientes de un
  plan de activación. Ver "Dirección" abajo. No abierto como bug.

Follow-through auditorías externas 2026-06-17:
- **Casi todo el "construyan estas calculadoras" de `Auditoría SEO Monedario
  Chile.md`**: ya están en producción (sueldo líquido, APV, IUSC, honorarios,
  prepago, conversor UF/UTM, DAP, …). El doc no tuvo acceso al sitio. Verificar
  contra `src/pages/calculadoras/` (19 entradas) antes de actuar sobre cualquier
  ítem de ese documento. No reauditar ítem por ítem.
- **"Agregar panel de metodología/fórmulas a la calculadora de sueldo"** (Doc 1):
  ya presente — las calculadoras importan `MethodologyBlock` y
  `CalculatorTrustBadge`. No abierto.
- **"Agregar página de autor/E-E-A-T"** (Doc 1): metodología editorial y
  superficies de confianza ya existen (confirmado por la auditoría precisa). No es
  brecha de código.

Tercera auditoría profunda 2026-06-19:
- **SEC: `scripts/credentials/gsc-service-account.json` "trackeado en git"**: FALSO.
  Verificado (`git ls-files` vacío, `git check-ignore` confirma que `.gitignore:54`
  lo ignora). El archivo está correctamente no-trackeado e ignorado; la protección
  está activa. Era una alucinación del subagente. No reauditar.
- **Math de los 13 use-cases + módulos `shared` no cubiertos el 2026-06-15**
  (CalculateTermDeposit, CompareAfpCommissions, ConvertUf/Utm, RentAdjustment,
  CreditPrepayment, MonthlyPayrollBase, DebtRenegotiation, ConsumerCredit,
  CompoundInterest, OperacionRenta, HonorariosNet, CreditCardCost, creditAmortization,
  retirementEmployerContributionSchedule, financialConstants): **0 bugs materiales**.
  Trazada la aritmética contra los tests (incl. `FinancialUseCases.regression`). Sin
  topes/tramos errados, sin error de conversión de tasa, sin off-by-one, ningún test
  fija un valor incorrecto. Hallazgos menores cosméticos descartados (cota 200% del
  bisección CAE en `CalculateConsumerCredit` — inalcanzable en rango real;
  `issuedMonthsPerYear` no-entero en `CalculateHonorariosNet` — supuesto defendible;
  mensaje de validación de `total` en `CompareAfpCommissions` — `total` no se usa en
  cálculo). No abrir.
- **Worker `economic-snapshot-refresh`: respuesta de error reflejada al caller /
  fetches de override secuenciales**: endpoint secret-gated (blast bajo); el worker
  es cron (latencia irrelevante). Bajo valor. No abierto.
- **`EconomicParameterProvider` memoiza el bundle fallback permanentemente**: real,
  pero **impacto bajo** porque producción es build estático (proceso fresco por
  build); el fallback además solo se gatilla si falla la lectura del snapshot LOCAL.
  Down-weighted. No planificado.
- **DEBT: 5.164 LOC de lógica cliente inline duplicada en 19 páginas de calculadora**:
  real, pero ya es la dirección documentada de CalculatorShell (017/018/019).
  Evidencia, no hallazgo nuevo. Ver "Dirección" abajo.
- **DEPS: advisories HIGH de `undici`**: solo vía dev-tooling (`linkinator`,
  `wrangler`); `pnpm audit --prod` limpio. Informativo, se limpia al bumpear esas
  dev-deps. No urgente.

## Hallazgos menores registrados (no planificados — defensa en profundidad de bajo valor)

*(De la tercera pasada. Registrados para que no se re-auditen; abrir un plan solo si el costo cambia.)*

- **Parsers `JSON.parse` sin guard en scripts operativos**: `aggregate-gsc-query-page.mjs:54`
  (+ `--weeks=NaN` → salida vacía silenciosa, `:30,53`), `compare-routes.mjs:25-26`,
  `compare-rss.mjs:27-28` (gates de invariante — fallan cerrado pero con stack opaco),
  `audit-cannibalization.mjs:86`, `audit-striking-distance.mjs:93`. S c/u. Mejora de
  mensajes de error / robustez, no fallo de corrección.
- **`simulador-renegociacion.astro:541-544`**: `tasaMensual` sin `|| 0` ni guard (única
  de las calculadoras); rate vacío → `NaN` al motor. S, consistencia.
- **`check:boundaries` solo escanea `src/domain/`** (`check-domain-boundaries.mjs:70-71,169`):
  nada impide que `application`/`components`/`pages` importen internals de infra. Latente
  (código hoy limpio). S, correr en report-only primero.
- **`operacion-renta.astro:524-530`**: sanitizador de miles solo dispara con 2+ puntos y
  los inputs son `type="number"` → rama muerta hoy; bug latente si se cambia a
  `type="text"`. S.
- **Worker `assertPlausibleDelta` se salta el dólar en transiciones de presencia**
  (`buildSnapshot.ts:370-377`); credenciales BCCh en query string con `redirect:"follow"`
  (`bcchSiete.ts:57-70`, considerar `redirect:"manual"`). S c/u, by-design parcial.

*(De la cuarta pasada 2026-06-26.)*

- **`leyes/[slug].astro` arma el FAQ schema solo desde frontmatter**, no extrae del
  cuerpo markdown como hace `ArticleJsonLd` con `extractFaqItems()`. Asimetría real,
  pero impacto bajo: Google restringió los rich results de FAQ a sitios gov/health
  en 2023, y solo importa si una ley tiene `## Preguntas frecuentes` en el cuerpo sin
  `faqs` en frontmatter. S. No abierto.
- **`ArticleJsonLd.astro:124` trunca respuestas FAQ a 1000 chars** (`substring(0,1000)`)
  → posible desajuste schema/contenido visible. Mismo caveat de deprecación de FAQ
  rich results; ninguna respuesta publicada supera hoy el límite. S. No abierto.

## Considerados y rechazados — cuarta pasada 2026-06-26 (para no re-auditar)

- **«Las páginas de calculadora no tienen `<h1>`»** (subagente a11y): FALSO.
  `CalculatorHero.astro:16` renderiza `<h1>` y todas las calculadoras usan el hero.
- **Endpoints `src/pages/api/*.json.ts` «sin validación de input»**: son JSON
  prerenderizado estático (`output: static`), sin inputs en runtime. By-design.
- **CSP `style-src 'unsafe-inline'`** (`public/_headers`): conocido; `script-src` está
  endurecido con hashes sha256 vía `csp-hashes`. Territorio de ADR, palanca muy baja.
- **`escapeHtml` sin escape de comilla simple en `InversionReadinessChecklist.astro`**:
  los `href` son hardcodeados y el atributo usa comillas dobles → no alcanzable. By-design.
- **Smells «latentes si se refactoriza»** (aserciones non-null, `innerHTML` con strings
  estáticos en `formController.ts`/`afpComparison.ts`): defensa en profundidad de bajo
  valor, tratada igual que en las pasadas previas. No abierto.

## Considerados y rechazados / verificados limpios — quinta pasada 2026-07-10 (para no re-auditar)

- **Matemática/engines de calculadoras y provider económico**: reverificados
  limpios por quinta vez. No reauditar.
- **Merge del snapshot económico (`383e93f3`, `mergePreviousIndicatorValues`)**: la
  lógica es correcta y el acceso sin optional-chaining a
  `newSnapshot.indicatorUpdatedAt.uf/.utm` es **inalcanzable** —
  `fetchLiveParameters` siempre puebla esas fechas vía `?? lastUpdated`
  (`refresh-economic-snapshot.mjs:170-171`). El `mergePrev` del worker
  (`buildSnapshot.ts`) espeja al script. No abierto.
- **remark plugins, i18n, loadGoogleFont**: limpios. El evaluador de
  `remark-economic-variables.ts` valida charset antes de parsear (parser propio,
  no `eval`). No abierto.
- **js-yaml v5**: `js-yaml@5.2.0` es release pública legítima (integrity del
  lockfile coincide con `npm view` de registry.npmjs.org, mismo maintainer
  `vitaly@rcopen.com`). Migración `979924a0` limpia. No es supply-chain. No abierto.
- **KV eventual-consistency / pérdida de escrituras concurrentes en el worker de
  analytics**: aceptado explícitamente en `ADR-20260628` (líneas 191-193). No abrir.
- **OWASP SEC-001..009**: adjudicados (8 cerrados 2026-06-28; SEC-004 = accept-risk
  de `set:html` sobre markdown de editor de confianza). No reauditar.

**Menores registrados (no planificados — defensa en profundidad de bajo valor):**
- **`EXPORT_TIMEZONE` muerto** en el worker de analytics
  (`index.ts:859` lee `tz`, solo lo loguea; `previousCompleteISOWeekInTz()` es UTC
  puro). Cosmético: UTC es de hecho correcto porque la ingesta se llavea en UTC; solo
  el comentario «timezone-aware» confunde. S, no abierto.
- **`injectGlossaryLinks` usa `\b...\b` ASCII** (`injectGlossaryLinks.ts:100`): los
  términos de glosario que empiezan/terminan en carácter acentuado no auto-enlazan.
  Baja frecuencia (allowlist curada, la mayoría son kebab sin acento inicial/final).
  S, no abierto.

## Considerados y reconciliados — auditoría de dirección `/improve next` 2026-07-12 (para no re-derivar)

Esta pasada fue de **dirección** (delta W27 sobre la auditoría canónica
`GROWTH-DIRECTION-AUDIT-2026-06-28.md`, corte W25). La densidad del roadmap
existente es tal que casi toda dirección "obvia" ya está evaluada y es propiedad
del mantenedor. Solo dos hallazgos resultaron **aditivos** (spikes 045 y 046). Lo
demás se verificó como **ya owned** — no re-proponer sin evidencia nueva:

- **UTM zero-click / captura de CTR sobre el clúster UTM**: owned. GROWTH-003 lo
  acepta como apuesta secundaria; la tabla de rechazados difiere las páginas
  programáticas UF/UTM ("alto zero-click"); y §8.2 clasifica "impresiones UF/UTM sin
  click" como **métrica de vanidad**. El instinto inicial de esta pasada (los ~15k
  impresiones/semana de `utm*` en posición 6–9 con CTR 0.1–0.5%) ya estaba resuelto.
- **GEO / citación en motores generativos**: owned. En este repo "GEO" = Generative
  Engine Optimization (no geográfico). GROWTH-006 lo mantiene como disciplina de
  medición; `llms.txt`/`llms-full.txt` existen, la métrica "GEO citation rate"
  (`combinaciones citadas / 48`) está planificada, y hay docs GEO del 2026-06-29
  (`docs/operations/geo-*`). No re-auditar.
- **Autoridad del clúster "sueldo líquido" (pos 73–95)**: owned. Ya identificado
  arriba en "Hallazgos clave de la revisión de datos" y en GROWTH-004; es pipeline
  editorial, no metadata.
- **Calculadoras nuevas** (inflación ya shipeó como `actualizador-inflacion`;
  CAE/rentabilidad real diferidas), **clústeres bancos/fintech y migrantes** (hubs
  ya existen en `src/pages/guias/`), **comparadores** (HOLD por neutralidad),
  **CalculatorShell 017/018/019**, **donaciones** (GROWTH-008), **merchandising
  home vs. realidad** (GROWTH-010): todos en la sección "Dirección" de abajo o en
  los findings GROWTH-*. No re-derivar.

**Nota sobre GROWTH-005 (contaminación de RUM por hostname)**: verificado **aún sin
implementar** al commit `0102b11a` — `scripts/data-signals/cloudflare-fetch.mjs`
función `fetchRumWebVitals` (≈líneas 140-162) sigue consultando el RUM por
`accountTag` sin dimensión de hostname. El plan 045 lo diagnostica y especifica el
follow-up; no lo arregla (spike documental).

## Considerados y reconciliados — auditoría de dirección `/improve next` 2026-08-02 (para no re-derivar)

Delta sobre el memo de viabilidad estratégica 2026-08-02. Los ítems del memo
que ya están resueltos o en curso en el repo se verificaron y NO se
re-proponen (evidencia de cada uno abajo):

- **Promesa de privacidad ("sin recolección de datos")**: corregida.
  `HeroHomepage.astro:93` dice "Sin publicidad. Sin registro requerido.
  Métricas agregadas, sin datos financieros personales. Fuentes oficiales." y
  `/privacidad.astro` describe la telemetría agregada sin identificadores. La
  fundación #382 (`e17013b7`, 2026-08-02) consolidó el copy. No abrir.
- **Error CSP de Cloudflare / validación CSP en producción**: en curso, fuera
  de planes. TD-0099 (commit `09dc219d`, "no-transform en toda regla
  Cache-Control") y TD-0102 (incidente documentado en `docs/operations/`,
  commit `b7e94fec`) con runbook; la validación en producción es paso
  operativo pendiente, no un plan de código. No abrir.
- **Instrumentación de alerta / apoyo / siguiente paso**: ya construida.
  Contrato v2 en `src/contracts/analytics-events.ts` (`alert_interest_shown/
  submit`, `support_shown/click/confirmed`, `next_step_shown/click`),
  `UtmPostResultActions.astro` vivo en conversor-utm, umbrales GREEN/WATCH/
  HALT en `UTILITY_LED_EXPERIMENT_REGISTRY.md` (ventana 2026-08-02 → 2026-11-02).
  Lo que falta (diseño de rutas por cluster, extensión a AFC/prepago) es el
  plan 056. No abrir duplicados.
- **Alerta UTM/UF recurrente**: correctamente **gateada** — el registry exige
  `alert_interest_shown ≥2%` antes de construirla; hoy el botón solo mide
  interés agregado (copy explícito en `UtmPostResultActions.astro`). Construir
  solo si el umbral cruza. No abrir ahora.
- **Ejemplo UTM desactualizado** (ítem "hacer ahora" del memo): mitigado —
  `src/data/blog/utm-chile-que-es-como-funciona.md` usa valores fechados
  ("abril 2026: $69.889") con cajas de advertencia explícitas, y existe
  `check:editorial-timeliness` para la caducidad. Es ítem de contenido del
  proceso editorial, no de código. No abrir.
- **Recurrencia / retorno etiquetado**: ya planificado — spike 046 (TODO,
  mismo embudo). El plan 056 lo referencia en vez de duplicarlo. No escribir
  otro spike de recurrencia.
- **Apoyo voluntario (memo sección L)**: instrumentado y live (link a
  `/apoyar.astro` en el bloque post-resultado); la medición de umbrales es del
  registry. La extensión a AFC/prepago cae dentro del diseño del plan 056.
  No abrir como plan separado.
- **Costo de mantenimiento / inventario de 184 URLs**: el memo propone un
  objetivo de ~80 URLs activas; el único camino de código es la consolidación
  por URL → plan 055. La gobernanza del inventario (congelar URLs nuevas) es
  decisión del mantenedor, no un plan.

## Dirección (decisión del mantenedor — no planificado aún)

### Follow-through auditorías externas 2026-06-17 (gestionar vía pipeline editorial)

Oportunidades reales de `deep-research-report (8).md`, pero son superficies YMYL
nuevas o con costo de mantención continuo. Necesitan que un humano las comisione
por `context/EDITORIAL_AI_PIPELINE.md`, no un ejecutor.

- **Calculadoras nuevas con dependencia de datos**: inflación acumulada y
  rentabilidad real necesitan una serie histórica de IPC (fuente + job de
  refresh); CAE hipotecario necesita supuestos de seguros/gastos con riesgo de
  interpretación normativa. Alto valor, pero cada una es un proyecto de
  data-pipeline + metodología, no un one-off de tasa fija como el IVA (plan 025).
- **`fondo de emergencia` y `meta de ahorro`**: matemática simple, pero
  `fondo-emergencia` **ya está en el pipeline editorial** (ver
  `docs/editorial/artifacts/fondo-emergencia/` y su brief). No duplicar; cerrarlo
  por el pipeline. `meta de ahorro` es un plan de motor futuro cuando se priorice.
- **Clústeres de contenido nuevos**: bancos/fintechs (la ausencia más costosa hoy),
  impuestos para independientes, finanzas para jóvenes/migrantes. Alto valor
  temático, pero cada uno es redacción YMYL + interlinking sustancial. Editorial.
- **Comparadores** (cuentas remuneradas, instrumentos conservadores): demanda
  alta, pero la propia auditoría marca el riesgo de mantención/neutralidad de
  comparar productos en vivo; necesita política de monetización/transparencia y un
  modelo de datos antes de construir. La mayor cautela de tradeoff del set.
- **Términos de glosario nuevos** (cuenta remunerada, TIR, money market, carga
  financiera, portabilidad financiera, PGU, SIS…): definiciones nuevas = contenido
  YMYL. El plan 026 construye la *estructura* temática que las alojará; las
  definiciones van por el pipeline.

### Prototipos de diseño previos

- **Activar los prototipos de diseño (017/018/019).** `CalculatorShell.astro`,
  `DecisionTree.astro` e `InlineCalculator.astro` fueron entregados por planes de
  diseño pero no se importan en ninguna página. Mientras tanto ~19 páginas de
  calculadora repiten la derivación de "próximos pasos" que `CalculatorShell` fue
  diseñado para absorber. El trabajo adyacente es un plan de migración que cablea
  el shell y elimina la duplicación (M–L, toca muchas páginas). Decisión de
  producto/esfuerzo: planificar sólo si se decide comprometer la migración.

## Backlog confirmado vigente (no en estos planes — ya en TECH_DEBT_BACKLOG.md)

| TD ID | Título | Severidad |
|-------|--------|-----------|
| TD-0067 | Refactor use-cases >200 LOC (SimulateRetirementProjection, CalculateApvComparison, EstimateFiniquito) | P2 |
| TD-0081 | Paralelizar checks pre-build en `package.json` | P3 |
| TD-0075 | Evaluar `inlineStylesheets: "auto"` vs `"never"` con medición LCP | P2 |
| TD-0077 | ADR sobre Astro features: prefetch, viewTransitions | P2 |

Confirmados vigentes en la re-auditoría 2026-06-15. Gestionar en
`TECH_DEBT_BACKLOG.md` directamente.
