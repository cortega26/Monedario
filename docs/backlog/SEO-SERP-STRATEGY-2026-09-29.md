# Estrategia SEO/SERP — investigación externa 2026-09-29 y secuencia

**Estado:** evaluación completada (docs-only). No es una orden de ejecución:
cada candidato se activa con el gate indicado.
**Fecha:** 2026-09-29 · **Owner de decisión:** Carlos Ortega
**Base de verificación:** commit `9e195743`
**Fuente:** informe externo «Investigación avanzada de SEO y SERP — monedario.cl»
(2026-09-29), aportado por el mantenedor. Snapshot SERP de Google Chile del
mismo día, muestra AIO n=10, sin crawl de backlinks. Este documento mapea el
informe contra los planes y datos vigentes y conserva solo lo que cambia una
decisión; el informe original no se reemplaza, se referencia.

---

## 1. Qué cambia (síntesis)

1. La conclusión central coincide con la evidencia propia: **la base técnica no
   es el cuello de botella**. `docs/reports/AUDIT-SEO-2026-09-28.md` no encontró
   P0; el defecto real (tags indexables) ya fue remediado por el plan 116.
2. El patrón ganador observado —**norma oficial + aplicación al caso concreto**
   (puestos #2 detrás de AFC y SII, #3 detrás de SuperIR/CMF)— ya es la tesis de
   `PLAN-calculator-led-growth-2026-06-28.md` y de la ventana utility-led. El
   informe la refuerza con evidencia SERP externa; no cambia la dirección, la
   confirma.
3. La matriz de oportunidad query×page **ya existe, se alimenta cada semana y ya
   tiene audits**: `output/operations/data-signals/gsc/2026-W39-query-page.json`
   (generado por `scripts/build-weekly-search-report.mjs`),
   `scripts/data-signals/aggregate-gsc-query-page.mjs` (rolling multi-semana) y
   `audit:striking-distance` / `audit:cannibalization`. La validación del plan
   128 los corrió sobre W32–W39 (§8). La brecha no es construir nada: es
   cadencia de decisión (N1).
4. Las dos recomendaciones de snippet del informe **ya están implementadas en
   los títulos live**:
   - `src/pages/calculadoras/sueldo-liquido.astro:161` → «Calculadora de Sueldo
     Líquido y Bruto Chile 2026» (H1 en `:183`).
   - `src/pages/calculadoras/apv.astro:99` → «Simulador APV Chile 2026:
     ¿cuánto ahorras en Régimen A o B?».
     Lo pendiente es más fino (modo inverso visible en el primer viewport,
     description/bloque de decisión APV, anchors entrantes) y está congelado
     por la ventana de títulos hasta ~2026-10-14.
5. `/archives/`: el plan 116 (SEO-03) decidió mantenerlo y enlazarlo desde
   `/posts/` para sacarlo de orphan. La validación (§8) encontró **0
   impresiones y 0 clics en 8 semanas** y coverage «Crawled - currently not
   indexed»: la decisión queda reabierta para el owner, con cualquier cambio
   vía contrato del plan 120.
6. El glosario (54 entradas; 55 URLs con el índice) es el candidato de auditoría
   más fuerte, y la validación (§8) lo confirma con datos: 55/55 indexadas, pero
   **37 entradas sin ninguna impresión en 8 semanas**, 15 de las 17 visibles con
   0 clics y canibalización real casi nula. No es un problema de canibalización:
   es demanda inexistente sobre índice indexado. Cualquier noindex o
   consolidación pasa por el contrato de indexabilidad + ADR del plan 120; hoy
   procede auditoría read-only (N2), no cambios.
7. La «deuda de distribución de autoridad» sigue siendo **hipótesis, no
   hallazgo** (no hubo crawl de backlinks), pero la validación la hace más
   plausible: head terms de sueldo y APV quedan en posiciones 45–71 pese a
   títulos ya diferenciados (§8). No se lanza campaña nueva; se ejecuta lo ya
   planificado (`PLAN-distribution-citations-2026-09-25.md`,
   `PLAN-zero-cost-distribution-2026-09-25.md`).
8. AIO no cambia la estrategia: en la muestra, 1/10 consultas activó AI
   Overview, contra la narrativa «todo es AI-first». La infraestructura de
   citación ya existe (`llms.txt`, tracking mensual en
   `docs/reports/AI-CITATION-TRACKING.md`). El único hueco operativo nuevo es
   incorporar la vista Generative AI de GSC **si está disponible en la cuenta**
   (verificar antes de documentar; N7).

---

## 2. Estado real vs. recomendación

| # | Recomendación del informe | Estado verificado en el repo | Artefacto destino | Momento |
|---|---|---|---|---|
| 1 | Matriz GSC query×page con cohortes | **Parcial**: export semanal ya existe (W39); falta vista de decisión por cohortes/ROI y cruce con ventanas | N1 | Ahora (ops, sin código de producto) |
| 2 | Congelar creación de URLs por keyword | **Vigente**: FOCO ESTRICTO hasta 2026-11-02 + `UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md` | política | Vigente |
| 3 | Defender posiciones #2/#3 (cesantía, impuesto único, SuperIR, prepago) | **Parcial**: cubiertas por planes de crecimiento/utility-led; sin alarmas de pérdida de posición/CTR en el scorecard | N3 | Post-W40 |
| 4 | Sueldo: diferenciar bruto↔líquido en SERP | **Title/H1 ya implementados**; validación §8: head terms en posición media 57,9–71,3 con 0 clics → el snippet no es la palanca | N4 re-scoped: solo tras resolver distribución/authority | Freeze ~2026-10-14; sin urgencia |
| 5 | APV: promesa A vs B sin incentivo comercial | **Title ya posiciona A/B**; validación §8: `simulador apv` pos 45,5 y `simulador apv habitat` pos 23,1 → snippet no mueve posición | N4 re-scoped; coordinar con plan 086 y `DIAGNOSTICO-apv-completion-2026-09-04.md` | Post-freeze; depende de distribución |
| 6 | Prepago: escenarios cuota vs. plazo / prepagar vs. invertir | Superficie completa (spike `DECISION-PATHS-AFC-PREPAGO-CREDITO-2026-08-02.md`); validación §8: `conviene prepagar` 97i/0c pos 14,8 | N4 (candidato de producto, requiere registro) | Post panel F4 |
| 7 | Auditar glosario antes de expandirlo | **Validado con datos** (§8): 37/54 sin impresiones, 15 de 17 visibles con 0 clics, 55/55 indexadas, canibalización mínima; gap audit 2026-05-25 y plan 119 como antecedentes | N2 | Auditoría ahora; cambios después |
| 8 | `/archives/` fuera del índice | **Evidencia recibida** (§8): 0i/0c en 8 semanas y «Crawled - currently not indexed»; el plan 116 SEO-03 lo mantuvo y enlazó | Decisión del owner vía contrato plan 120 | Post-W40 (no urgente) |
| 9 | Retirar `priority`/`changefreq` del sitemap | **Siguen emitiéndose** (`astro.config.ts:185-245`); Google los ignora | N6 | Higiene P3, oportunista |
| 10 | Dataset citable (AFP/tributario) + `Dataset` schema | Alineado con `EEAT-STRATEGY-2026-09-28.md` #4; URLs nuevas bloqueadas por FOCO | N5 | Post-2026-11-02 o excepción |
| 11 | Link earning por activos, no outreach vacío | **Parcial**: planes de distribución vigentes (citación F5, community seeding, zero-cost); sin datos de backlinks | Ejecutar esos planes, no uno nuevo | Continuo |
| 12 | Incorporar Generative AI de GSC y multimodal al reporting | **Ausente** en docs; disponibilidad en la cuenta no verificada | N7 | Ahora (verificación); luego cadencia mensual |
| 13 | Tabla de experimentos | Debe registrarse en `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` con umbrales y denominadores pre-declarados; el informe no reemplaza el registry | N4 | Antes de ejecutar cada experimento |
| 14 | Complementariedad con IA, sin «GEO hacks» | Alineado con `PLAN-distribution-citations-2026-09-25.md` y con la decisión de no agregar `llms`/schema antes de medir | política | Vigente |
| 15 | No crear página `/eeat/` ni «optimizar E-E-A-T» como checklist | Ya mapeado en `EEAT-STRATEGY-2026-09-28.md` (#1 revisor externo, #2 bloque de verificación, #7 `/correcciones/`) | — | Secuencia existente |

---

## 3. Restricciones de calendario (no negociables)

| Ventana | Hasta | Efecto sobre este backlog |
|---|---|---|
| September 2026 spam update (inicio 2026-09-24) | ~2026-10-08 (rollout) | No atribuir causalidad a cambios hechos ahora |
| F5 UTM/UF (`PLAN-growth-utm-ctr-2026-09-16.md`) | Lectura primaria 2026-09-30 | No tocar conversores UTM/UF |
| Panel post-resultado F4 (W39–W40) | 2 semanas comparables desde 2026-09-16 | No ampliar UTM; no tocar `result-panel` |
| Freeze de títulos (28 días desde deploy 2026-09-16) | ~2026-10-14 | Prohibido cambiar title/description de superficies en medición |
| FOCO ESTRICTO / utility-led | 2026-11-02 | Sin URLs indexables nuevas (dataset, `/correcciones/`, etc.) |
| Contrato de indexabilidad (plan 120 + ADR) | Vigente | Todo `noindex`/consolidación pasa por el contrato y su gate |
| `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` | Permanente | Ningún cambio YMYL se redacta y audita en la misma sesión |

---

## 4. Candidatos net-new (backlog propuesto)

Ninguno se ejecuta en ventana de medición ni crea URLs. Los cambios de
indexabilidad requieren además el contrato del plan 120; los de contenido YMYL,
pipeline editorial completo.

| ID | Candidato | Prioridad | Esfuerzo | Depende de | Gate de activación |
|---|---|---|---|---|---|
| N1 | **Cadencia de decisión** sobre la matriz y los audits existentes del repo (`audit:striking-distance` / `audit:cannibalization`, ya corridos en plan 128 §8): bandas 8–20, CTR-gap, canibalización, cruce con ventanas activas | P1 | S | — | En curso: solo falta cadencia/owner (el tooling ya existe) |
| N2 | **Auditoría del glosario** (54 entradas): la señal GSC ya está (§8); completar con enlaces internos, backlinks (GSC Links), fuentes y cobertura; salida = recomendación por URL (mantener/enriquecer/consolidar/noindex) | P1 | M | datos §8 | Inmediato en lectura; cambios solo post-W40 y bajo plan 120 + ADR + firma |
| N3 | **Cohortes de alarma de defensa** en el scorecard semanal para páginas en posiciones 1–3 (caída de posición/CTR) y 4–10 (potencial), con umbrales pre-declarados | P1 | S–M | N1 | Post-W40 |
| N4 | **Registro de experimentos** en `UTILITY_LED_EXPERIMENT_REGISTRY.md`; priorizar por datos §8: CTR de conversores UTM en banda 8–20, intención «simular» en seguro de cesantía (pos 8,6–10,8), «conviene prepagar» (pos 14,8), tabla 2026 en impuesto 2ª (pos 9–10); sueldo/APV quedan fuera hasta resolver posición | P1/P2 | S registro / M–L implementación | registry + freeze | Registro ahora; ejecución post-2026-10-14 y post panel F4 |
| N5 | **Primer dataset citable** (AFP/tributario) con metadata, CSV/JSON, documentación y `Dataset` schema, conectado a una calculadora que ya funciona | P2 | M | FOCO + `EEAT-STRATEGY` #4 | Post-2026-11-02 o excepción aprobada |
| N6 | **Higiene de sitemap**: retirar `changefreq`/`priority` (`astro.config.ts:185-245`) cuando se toque el sitemap por otra razón | P3 | S | — | Oportunista |
| N7 | **Vista Generative AI de GSC**: verificar disponibilidad en la cuenta, y si existe, fijar método de lectura mensual y registrarla junto al scorecard (sin inferir presencia en AIO por búsquedas manuales) | P2 | S | verificación en GSC del owner | Inmediato (verificación) |

### Regla de promoción a `plans/`

Al seleccionarse ejecución, el candidato se convierte en plan numerado en
`plans/` (con scope, verificación por paso, STOP y rollback), siguiendo la
convención vigente (último: plan 127). Este documento no autoriza
implementación por sí solo.

---

## 5. Lo que NO se hace (rechazos y hard stops)

- **No páginas programáticas** (`/100-uf-a-pesos/`, variantes de conversión):
  la calculadora ya resuelve; el riesgo de *scaled content abuse* es real.
- **No URL por sinónimo** (bruto→líquido ≠ líquido→bruto ≠ neto): una sola
  superficie gana todas las variantes.
- **No FAQ SEO** (FAQ reales sí; perseguir rich results, no).
- **No `/eeat/`** ni teatro E-E-A-T; va por `EEAT-STRATEGY-2026-09-28.md`.
- **No schema inventado** de calculadora; no hay rich result genérico.
- **No `llms.txt` nuevo** con expectativa de ranking (ya existe; Google lo
  ignora para Search).
- **No red de enlaces** chile-hub/Tooltician; solo colaboración editorial con
  contexto.
- **No perseguir head terms oficiales** (UF hoy, seguro de cesantía
  informativo, impuesto): el objetivo es la siguiente intención.
- **No cambiar fechas cosméticamente**; `lastmod` = cambio sustantivo (ya
  gobernado por plan 116, SEO-04).
- **No tocar títulos/descriptions en ventana** de medición.
- **No borrar ni noindexar glosario** sin contrato de indexabilidad y firma.
- **No cambiar `/archives/`** sin contrato (plan 120) + decisión del owner; la
  evidencia GSC ya existe (§8).
- **No concluir causalidad** mientras el spam update siga en rollout.
- **No obsesionarse con Lighthouse 100**: CWV de campo PASS (LCP 1,2 s / INP
  93 ms / CLS 0, `AUDIT-RESILIENCE-2026-09-29.md`); corregir solo regresiones
  reales.

---

## 6. Límites de la evidencia del informe

- Snapshot SERP de un solo día y muestra: posición y módulos varían por
  dispositivo, personalización y momento. No es una medición estable.
- Muestra AIO n=10: no permite extrapolar prevalencia de AI Overviews al
  mercado chileno.
- Sin crawl de backlinks: la tesis de «déficit de distribución de autoridad» es
  inferencia; los planes de citación/distribución existentes son el vehículo
  correcto para obtener esos datos.
- Evidencia conductual externa (Pew 2025, Ahrefs 2026, juicio antimonopolio)
  es estadounidense/observacional; útil como dirección, no como medición local.
- Los anuncios de Google citados por el informe (GSC Generative AI, multimodal,
  Discover 2026) no se verificaron contra la cuenta de GSC del proyecto: se
  registran como atribuidos a la fuente hasta la verificación de N7.

---

## 7. Verificación ejecutada en repo (2026-09-29)

| Comprobación | Resultado |
|---|---|
| Conteo de glosario | 54 archivos en `src/data/glossary/` (55 URLs con índice) |
| Conteo de posts / calculadoras | 54 en `src/data/blog/`; 23 en `src/pages/calculadoras/` |
| `/archives/` | Existe (`src/pages/archives/index.astro`); plan 116 SEO-03 decidió mantenerlo |
| Sitemap `priority`/`changefreq` | Presentes en `astro.config.ts:185-245` |
| Título sueldo | «Calculadora de Sueldo Líquido y Bruto Chile 2026» (`sueldo-liquido.astro:161`; H1 `:183`) |
| Título APV | «Simulador APV Chile 2026: ¿cuánto ahorras en Régimen A o B?» (`apv.astro:99`) |
| Export query×page | `output/operations/data-signals/gsc/2026-W39-query-page.json` (fetch 2026-09-29) |
| Registry de experimentos | `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` |
| `llms.txt` | Ya existe (`src/pages/llms.txt.ts`, `llms-full.txt.ts`) |

---

## 8. Validación con datos GSC (plan 128, 2026-09-29)

Corrida read-only sobre los exports W32–W39 (ventana 2026-08-03–2026-09-27;
14.880 filas query×page) con las herramientas ya existentes del repo:
`data-signals:gsc:aggregate --weeks=8`, `audit:striking-distance` (2.802
oportunidades en banda 8–20) y `audit:cannibalization` (122 queries; solo 3
grupos fuertes, todos UTM calculadora vs. post). Detalle y comandos en
`plans/archive/128-seo-serp-report-validation-2026-09-29.md`.

| Dato validado | Resultado | Efecto en el backlog |
|---|---|---|
| UTM: `valor utm` 116.695i, pos 8,35, CTR 0,34% | Mayor oportunidad medible del sitio | N4 (CTR), dentro de F5 activo |
| UF: 83.104i y 12 clics en W39; `uf a peso` 3.300i/0c pos 10,7 | Commodity confirmado | Mantener como infraestructura, no growth |
| Sueldo: head terms pos 57,9–71,3 con 0 clics | Peor que «fuera del top 8–10» | QW3 del informe pierde prioridad; el problema es autoridad |
| APV: `simulador apv` pos 45,5; `simulador apv habitat` pos 23,1 | Peor que «fuera del top 10» | QW4 re-scoped; sin palanca on-page viable |
| Seguro cesantía: `calcular seguro de cesantia` 506i/28c pos 4,74 CTR 5,5% | Mejor activo de conversión | Defender (N3); «simular» pos 8,6–10,8 es el hueco |
| Impuesto 2ª: 5.107i/50c; queries «2026» pos 9–10 con CTR 0–0,5% | Intención calculadora convierte; informacional no | N4 (snippet/tabla) con datos |
| Prepago: 557i/45c; `conviene prepagar un credito de consumo` 97i/0c pos 14,8 | Confirma la intención de decisión | N4 (escenarios) |
| Renegociación: página 31–73i/semana | Demanda pequeña | Expectativas acotadas |
| Glosario: 55/55 indexadas; 37/54 sin impresiones; 15 de 17 visibles con 0 clics | Sin canibalización; demanda inexistente | N2 con alcance definido |
| `/archives/`: 0i/0c; «Crawled - currently not indexed» | Evidencia para revisar plan 116 SEO-03 | Decisión del owner vía plan 120 |
| Chile 98,7% de impresiones; móvil 65% con CTR 0,12% vs 0,22% escritorio | Brecha móvil no tratada por el informe | Candidato de snippet/UX post-ventana |
| Canibalización real: 3 grupos, todos UTM | El glosario NO canibaliza | Reduce urgencia de consolidación por esa causa |

Límites de la validación: la posición media de GSC no equivale al snapshot SERP
del informe (promedia sobre todas las impresiones); AIO no es medible con los
exports actuales (dimensiones query/page/country/device); W39 está completa
(ventana cerrada 2026-09-27).

---

## Progress log

- 2026-09-29 — Artefacto creado a partir del informe externo y verificación
  contra `9e195743`. Sin cambios de código, contenido ni rutas. N1–N7 quedan
  propuestos con gates; ninguno iniciado.
- 2026-09-29 — Validación con datos GSC (plan 128): agregado W32–W39, audits de
  striking distance y canibalización, análisis de glosario, `/archives/`,
  país/dispositivo e indexación. Resultados en §8; N1–N4 re-scopados.
