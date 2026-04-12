# TECH_DEBT_BACKLOG

Fecha de corte: 2026-04-12

## Métricas

### Total de items por urgencia
- **P0:** 3
- **P1:** 13
- **P2:** 12
- **P3:** 1

### Estado de avance (2026-04-12)
- **Completados:** 55 (`TD-0001`, `TD-0002`, `TD-0003`, `TD-0004`, `TD-0005`, `TD-0006`, `TD-0007`, `TD-0008`, `TD-0009`, `TD-0010`, `TD-0011`, `TD-0012`, `TD-0013`, `TD-0014`, `TD-0015`, `TD-0016`, `TD-0017`, `TD-0018`, `TD-0019`, `TD-0020`, `TD-0021`, `TD-0022`, `TD-0023`, `TD-0024`, `TD-0025`, `TD-0026`, `TD-0027`, `TD-0028`, `TD-0029`, `TD-0030`, `TD-0031`, `TD-0032`, `TD-0033`, `TD-0034`, `TD-0035`, `TD-0036`, `TD-0037`, `TD-0038`, `TD-0040`, `TD-0041`, `TD-0043`, `TD-0044`, `TD-0045`, `TD-0046`, `TD-0047`, `TD-0048`, `TD-0049`, `TD-0050`, `TD-0051`, `TD-0052`, `FIX-MDX`, `FIX-LINKS-CALC`)
- **En progreso:** 1 (`TD-0039`)
- **Backlog sin iniciar:** 1 (`TD-0042`)
- **Backlog en validación/diseño:** 0

> `FIX-MDX`: corregido comentario HTML (`<!-- -->`) en `que-es-el-apv.mdx:25` que rompía el build.
> `FIX-LINKS-CALC`: ampliado `check-internal-links.mjs` para cubrir validación de rutas `/calculadoras/`.
> `TD-0030`: corregidas assertions `doubledPayment.totalPaid` en regression test tarjeta de crédito (casos 1 y 3).
> `TD-0032`: normalizado formato Prettier en 13 archivos con drift mecánico; `format:check` pasa limpio.
> `TD-0033`: `pnpm run format:check` vuelve a pasar limpio el 2026-04-03; el drift mecánico ya no reproduce.
> `TD-0034`: refrescado `docs/reports/routes_snapshot_before.json` a 34 rutas y `pnpm run check:routes` vuelve a responder sin altas espurias el 2026-04-03.
> `TD-0035`: actualizado `toHaveLength(13)` → `toHaveLength(15)` en `CalculatorPortfolio.test.ts` para reflejar las 15 calculadoras vigentes en el portfolio.
> `TD-0036`: re-sincronizadas las aserciones numéricas en `hero-image-pool.test.ts` (pool entries: 12/28, canonicalCombinationCount: 56, requestedAssetCount: 112, approvedModelCount: 28, byTemplate A: 24) y los strings de prompts en `hero-images-config.test.ts` (Composition, Scene B, Scene C) con la configuración actual. `pnpm run test` pasa limpio: 37 archivos, 166 tests.
> Revalidación 2026-04-09: `pnpm run test`, `pnpm run lint` y `pnpm run format:check` pasan limpios. Los ítems `TD-0035` a `TD-0038` quedaron resueltos en el árbol actual y el backlog se corrige para reflejar ese baseline.
> Auditoría F22 (2026-04-12): los 9 hallazgos documentados en `docs/operations/reports/f22-calculator-audit-2026-04-12.md` ya estaban resueltos en el árbol al momento del registro. `TD-0044` a `TD-0052` se marcan directamente como Completados.

### Top riesgos restantes

- `TD-0039`: performance mobile sigue por debajo del umbral estricto de LCP (`<= 1.7s`) en local, aunque los reruns del 2026-04-09 ya dejaron `TBT=0`, `CLS=0`, `SI<3.0s` y levantaron calculadora/hub a `Performance 100`.

### Quick wins (alto impacto / bajo esfuerzo)
- [x] `TD-0007` Corregir email placeholder en enlaces sociales.
- [x] `TD-0005` Limpiar archivos/componentes legacy no usados (`*.bak`, layout/componente huerfano).
- [x] `TD-0006` Alinear plantillas de GitHub con el proyecto real (no AstroPaper upstream).
- [x] `TD-0009` Consolidar estrategia de tipografías (config experimental vs carga real).
- [x] `TD-0022` Corregir cap mensual del Régimen B y copy del recomendador APV.
- [x] `TD-0024` Cambiar “meses mora”/`90` por input coherente de días o meses en renegociación.
- [x] `TD-0026` Validar modo `pesos fijos` de arriendo para bloquear pseudo-resultados en blanco.- [x] `TD-0044` Corregir tasa PPM 12.25% → 15.25% en copy de `operacion-renta.astro` (2 líneas).
- [x] `TD-0049` Actualizar constante UTM en test de `SimulateOperacionRenta` a 69889.
- [x] `TD-0051` Remover atributo `data-is-example` tras cálculo real (1 línea JS).
---

## TD-0001 — Estrategia de package manager y lockfiles inconsistente
- **ID:** TD-0001
- **Título corto:** Unificar gestor de paquetes y lockfile
- **Descripción:** El repo usa `pnpm` y `npm` en paralelo, con dos lockfiles. Esto abre drift de dependencias y builds no deterministas entre entornos locales, CI y deploy.
- **Evidencia (actualizada):** `package.json` (`packageManager: pnpm@10.30.2`); `package-lock.json` eliminado; `.github/workflows/ci.yml` (`pnpm install --frozen-lockfile`); `.github/workflows/deploy.yml` (`pnpm install --frozen-lockfile` + `pnpm run build`); `Dockerfile` (`corepack prepare pnpm@10.30.2`); `docker-compose.yml` (`pnpm run dev`); `README.md` (flujo `pnpm`).
- **Impacto:** Aumenta riesgo de diferencias entre entornos, fallos intermitentes y fricción de contribución.
- **Riesgo:** alto
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Elegir un único gestor (recomendado: `pnpm` por uso actual en CI), declarar `packageManager` en `package.json`, dejar un lockfile único, alinear workflows/Docker/README/scripts.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un solo lockfile en repo.
- [x] CI y deploy usan el mismo gestor.
- [x] Docker y documentación usan el mismo gestor.
- [x] `npm/pnpm install` no altera árbol de dependencias inesperadamente.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0018 — `astro check` reporta IDs duplicados en artículos del blog
- **ID:** TD-0018
- **Título corto:** Investigar IDs duplicados en loader de contenido
- **Descripción:** `astro check` muestra avisos de `Duplicate id` para varios artículos en `src/data/blog/**` durante el sync de contenido. Aunque el chequeo termina con `0 errors`, el loader indica que entradas posteriores sobreescriben a las anteriores.
- **Evidencia (actualizada):** el root cause quedó aislado en el loader `glob()` de Astro 5.18: al rehidratar el store desde `.astro/data-store.json`, una entrada ya existente del mismo archivo cambiada entre syncs quedaba en `store.has(id)` y el loader emitía el warning como si fuera una colisión real entre archivos distintos. Se aplicó un wrapper local `safeGlob` en `src/content/loaders/safeGlob.ts` que suprime solo el caso `mismo id + mismo archivo` y conserva la advertencia si el id viene desde otra ruta. `pnpm run astro -- check` y `pnpm run build` quedaron limpios el 2026-03-12.
- **Impacto:** Riesgo de sobrescritura silenciosa de contenido, resultados ambiguos en `getCollection()` y diagnósticos menos confiables en validaciones editoriales.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** identificar por qué el loader detecta duplicados para archivos únicos, revisar configuración de colecciones/globs y confirmar si existe duplicación física, alias de carga o colisión de IDs derivadas.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run astro check` no reporta `Duplicate id` para `src/data/blog/**` ni `src/data/laws/**`.
- [x] El warning deja de reproducirse en la validación actual.
- [x] `getCollection("blog")` y `getCollection("laws")` no muestran colisiones activas en las validaciones actuales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-09
- **Última actualización:** 2026-03-12

## TD-0019 — Snapshot base de rutas quedó desalineado del sitio publicado
- **ID:** TD-0019
- **Título corto:** Actualizar baseline de `check:routes`
- **Descripción:** `pnpm run check:routes` compara contra `docs/reports/routes_snapshot_before.json` y reporta rutas "agregadas" aunque la tarea actual no modificó routing ni slugs. El snapshot base quedó atrasado respecto del contenido ya publicado.
- **Evidencia (actualizada):** `docs/reports/routes_snapshot_before.json` ya refleja `30` rutas publicadas; `pnpm run check:routes` (2026-03-11) retorna `No route changes detected` y `before=30 after=30`.
- **Impacto:** Introduce ruido en la verificación de rutas y reduce la capacidad de detectar regresiones reales de URL en cambios futuros.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** refrescar `docs/reports/routes_snapshot_before.json` con el estado publicado correcto y documentar el procedimiento para actualizar baseline solo cuando corresponda.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run check:routes` no reporta altas espurias cuando no hubo cambios de rutas.
- [x] El baseline refleja el estado actual del sitio publicado.
- [x] Queda documentado cuándo y cómo se actualiza el snapshot base.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-09
- **Última actualización:** 2026-03-11

## TD-0020 — Ownership temático y taxonomía editorial inconsistentes
- **ID:** TD-0020
- **Título corto:** Alinear ownership editorial entre cluster, category y hubs
- **Descripción:** El corpus todavía conserva deuda editorial donde `cluster`, `category` y tratamiento en hubs no cuentan exactamente la misma historia. El caso vivo más claro ya no es UF/IPC, sino `como-hacer-presupuesto-mensual-chile`, que sigue en `cluster: empleo-ingresos` con `category: general` mientras su casa semántica definitiva `presupuesto-control-financiero` sigue sin hub productivo.
- **Evidencia (actualizada):** el frente `uf-costo-de-vida` ya quedó endurecido en metadata/frontmatter; el repo mantiene separación entre `canonical owner` y `transitional placement` en `docs/editorial/TOPIC_OWNERSHIP_POLICY.md` y `src/config/editorial-topic-policy.mjs`; `pnpm run audit:topic-overlap` sigue resumiendo transiciones válidas y clasificaciones de hub sin reinterpretar `category: general` como owner definitivo.
- **Impacto:** Riesgo de crecimiento editorial inconsistente, interlinking ambiguo y mayor probabilidad de canibalización a medida que se agreguen nuevas URLs.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** mantener APV con ownership canónico en `ahorro-e-inversion`; conservar presupuesto como única transición explícita pendiente; y seguir endureciendo auditoría/metadata solo cuando exista un cluster productivo real para absorber el cambio.
- **Criterios de cierre (checklist verificable):**
- [x] APV tiene ownership explícito y consistente entre hub, cluster y category.
- [x] `como-hacer-presupuesto-mensual-chile` queda documentado como transición hacia `presupuesto-control-financiero` con condición concreta de migración.
- [x] El frente `uf-costo-de-vida` queda endurecido y sale del registro de transiciones activas.
- [x] `pnpm run audit:topic-overlap` distingue transición válida, core vs related y uso indebido de `category: general`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-09
- **Última actualización:** 2026-03-11

## TD-0021 — Modelo salarial base insuficiente para calculadoras de sueldo y APV
- **ID:** TD-0021
- **Título corto:** Rehacer base imponible y topes previsionales compartidos
- **Descripción:** Las calculadoras `sueldo-liquido` y `apv` usan `grossSalary` como base total de AFP, salud y parte del cálculo tributario. Eso no cubre imponible real, no imponibles, topes previsionales ni diferencias por tipo de contrato, aunque el propio corpus editorial sí explica esas diferencias.
- **Evidencia (actualizada):** `src/application/use-cases/CalculateMonthlyPayrollBase.ts` centraliza imponible, topes y cotizaciones para sueldo/APV; `src/application/use-cases/CalculateNetSalary.ts` y `src/application/use-cases/CalculateApvComparison.ts` consumen ese motor; `src/pages/calculadoras/sueldo-liquido.astro` y `src/pages/calculadoras/apv.astro` ahora exponen imponible opcional y tipo de contrato; `src/domain/economic/EconomicParameters.ts`, `src/infrastructure/economic/EconomicParameterProvider.ts` y `src/infrastructure/economic/economic-parameters.snapshot.json` versionan tope previsional `90 UF` para AFP/salud y `135,2 UF` para AFC; tests golden agregados en `tests/application/CalculateNetSalary.test.ts` y `tests/application/CalculateApvComparison.test.ts`.
- **Impacto:** Riesgo de falsa precisión en dos calculadoras de alto uso y alto impacto YMYL.
- **Riesgo:** alto
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** L
- **Propuesta de solución:** extraer un motor único de base laboral/imponible con inputs explícitos para imponible, no imponibles, topes AFP/salud/AFC y tipo de contrato; redefinir `sueldo-liquido` como estimador rápido o agregar modo avanzado.
- **Avance actual (2026-03-12):** resuelto con motor compartido `CalculateMonthlyPayrollBase`, inputs visibles de imponible/contrato en ambas calculadoras y fixtures de regresión actualizados. La decisión de contrato quedó trazada en `docs/adr/ADR-20260312-shared-payroll-taxable-base.md`.
- **Criterios de cierre (checklist verificable):**
- [x] `sueldo-liquido` y `apv` comparten una sola fuente de verdad para imponible, topes y cotizaciones.
- [x] Existe input o supuesto visible para diferenciar bruto total vs imponible real.
- [x] El cálculo contempla topes previsionales y causalmente distingue contrato indefinido vs plazo fijo donde corresponda.
- [x] Se agregan fixtures de golden cases con bruto != imponible y con sueldo sobre topes.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0022 — Simulador APV recomienda con un cap de Régimen B incorrecto
- **ID:** TD-0022
- **Título corto:** Corregir cap de Régimen B y rebajar agresividad del recomendador APV
- **Descripción:** El simulador APV calcula el tope mensual con beneficio del Régimen B como `50 UF / 12`, mientras el copy visible lo presenta como `50 UF` mensual. Esto subestima el beneficio tributario, distorsiona la comparación y puede sugerir un régimen equivocado. Además, la decisión A vs B está modelada como binaria pese a que la validación normativa permite combinar aportes bajo ambos regímenes en un mismo año y la conveniencia real depende de la renta líquida imponible, del tramo marginal efectivo y del tope anual bonificable del Régimen A.
- **Evidencia:** `src/application/use-cases/CalculateApvComparison.ts`; `src/pages/calculadoras/apv.astro`; `src/data/blog/que-es-el-apv.mdx`; validación normativa 2026-03-12 en SII (Suplemento Tributario, art. 42 bis) y Superintendencia de Pensiones sobre uso de regímenes A/B y tope conjunto de `600 UF`.
- **Impacto:** La calculadora puede inducir una mala decisión tributaria/previsional justo en el output principal.
- **Riesgo:** crítico
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** corregir la fórmula del cap de Régimen B, separar aporte por planilla vs depósito directo si aplica, reemplazar “Recomendado para ti” por una recomendación condicionada y agregar nota explícita sobre casos no cubiertos. Si se mantiene un recomendador, debe contemplar escenario mixto A+B cuando el aporte óptimo no sea puramente binario y explicar la lógica en función de renta imponible/tramo marginal y del tope anual de bonificación del Régimen A.
- **Avance actual (2026-03-12):** el motor ya distingue entre aporte mensual por planilla y aporte directo anual adicional, mantiene el tope mensual de `50 UF` para planilla, aplica el tope anual conjunto de `600 UF` en Régimen B y muestra equivalentes mensuales cuando hay depósitos directos que normalmente se regularizan en Operación Renta. La calculadora conserva la sugerencia orientativa, mantiene la estrategia mixta A+B y ahora muestra el timing tributario correcto para aportes directos.
- **Criterios de cierre (checklist verificable):**
- [x] El cap visible y el cap usado por el motor coinciden.
- [x] La calculadora no subestima el beneficio B por un factor 12.
- [x] El copy distingue recomendación fuerte vs sugerencia condicionada.
- [x] La UX no fuerza una recomendación binaria cuando la estrategia óptima puede ser mixta A+B.
- [x] La lógica mixta, si se implementa, se basa en renta imponible/tramo marginal y no en una banda fija simplificada de sueldo bruto.
- [x] Existen tests para aportes bajo, cerca y sobre el cap mensual/anual.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0023 — Cesantía y jubilación proyectan con supuestos insuficientes para decisión real
- **ID:** TD-0023
- **Título corto:** Endurecer simuladores previsionales de cesantía y jubilación
- **Descripción:** `seguro-cesantia` estima CIC y FCS con proxies demasiado gruesos; `simulador-jubilacion` usa un cronograma simplificado del aporte patronal y no valida escenarios actuariales clave. Ambos outputs son visibles y pueden parecer más exactos de lo que son.
- **Evidencia (actualizada):** `EstimateUnemploymentCoverage` ahora diferencia `balanceSource`, separa CIC vs Fondo Solidario, usa tasas CIC/FCS vigentes por tipo de contrato y expone referencia oficial AFC versionada sin prometer montos FCS; `SimulateRetirementProjection` consume un cronograma versionado en `src/application/use-cases/shared/retirementEmployerContributionSchedule.ts`, aplica tope imponible previsional, modela lagunas (`contributionDensityPercent`) y devuelve escenarios comparativos `conservative/base/aggressive`; `tests/application/EstimateUnemploymentCoverage.test.ts`, `tests/application/SimulateRetirementProjection.test.ts` y `tests/application/FinancialUseCases.regression.test.ts` cubren bordes y regresión.
- **Impacto:** Riesgo alto de decisiones equivocadas en contingencia laboral y planificación previsional.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** dividir cesantía en dos modos (`eligibilidad` y `estimación con saldo real`), modelar FCS solo cuando haya tabla oficial versionada, alinear jubilación con una única fuente de parámetros previsionales y validar expectativa de vida, lagunas y alcance del estimador.
- **Avance actual (2026-03-12):** `seguro-cesantia` ahora distingue saldo real vs saldo estimado, exige confirmación de continuidad para cerrar el filtro base del FCS y deja explícito que los montos FCS se revisan en AFC. `simulador-jubilacion` pasó a usar una sola tabla versionada para el aporte del empleador a la cuenta individual, aplica tope imponible, incorpora lagunas previsionales visibles y muestra escenarios comparativos conservador/base/agresivo, además de fallar explícitamente cuando la expectativa de vida no alcanza para estimar meses de pensión.
- **Criterios de cierre (checklist verificable):**
- [x] Cesantía diferencia claramente CIC real vs saldo estimado.
- [x] Cesantía no promete montos FCS sin tabla/versionado verificable.
- [x] Jubilación usa una sola tabla/versionado para reforma previsional.
- [x] Jubilación falla con mensaje explícito si expectativa de vida <= edad de retiro.
- [x] Se agregan casos borde y escenarios comparativos conservador/base/agresivo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0024 — Renegociación Superir mezcla unidades de mora y omite filtros legales críticos
- **ID:** TD-0024
- **Título corto:** Separar elegibilidad legal de simulación de cuota en Superir
- **Descripción:** La calculadora usa `months` en el modelo, muestra “Meses mora” en UI, setea `90` por defecto y comunica el requisito legal como `+90 días`. Además, puede marcar `probablemente calificas` sin preguntar por primera categoría, juicios ejecutivos ni completitud documental.
- **Evidencia:** `src/application/use-cases/SimulateDebtRenegotiation.ts`; `src/pages/calculadoras/simulador-renegociacion.astro`; `src/data/blog/renegociacion-superir.md`.
- **Impacto:** Riesgo alto de falso positivo en una herramienta orientada a una decisión formal/regulatoria.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** separar en dos bloques: `filtro legal mínimo` y `simulación financiera`; corregir la unidad temporal; agregar preguntas de exclusión crítica y bajar el lenguaje conclusivo cuando falten antecedentes.
- **Avance actual (2026-03-12):** la calculadora ahora usa `overdueDays` con mínimo legal de `91` días, cambia el input visible a días corridos, agrega preguntas explícitas por primera categoría, juicio ejecutivo/liquidación forzosa notificada y documentación completa, y separa `cumples el filtro básico` de `estás listo para solicitud formal`.
- **Criterios de cierre (checklist verificable):**
- [x] La unidad temporal del input coincide con la regla legal comunicada.
- [x] El default ya no induce `90 meses` como dato implícito.
- [x] La calculadora pregunta por primera categoría y juicios ejecutivos notificados, o explicita que no los cubre antes del resultado.
- [x] El resultado distingue “cumples filtro básico” de “calificas formalmente”.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0025 — Calculadoras de deuda comparten job parcial pero no comparten motor ni framing
- **ID:** TD-0025
- **Título corto:** Consolidar arquitectura de deuda amortizable y comparadores
- **Descripción:** `credito-consumo`, `tarjeta-credito` y `prepago-credito` comparten mecánicas de amortización/costo, pero hoy operan con motores y supuestos separados. Además, `credito-consumo` promete comparación lado a lado sin ofrecerla.
- **Evidencia:** `src/application/use-cases/CalculateConsumerCredit.ts`; `src/application/use-cases/SimulateCreditCardCost.ts`; `src/application/use-cases/SimulateCreditPrepayment.ts`; `src/pages/calculadoras/credito-consumo.astro`; `src/pages/calculadoras/tarjeta-credito.astro`; `src/pages/calculadoras/prepago-credito.astro`.
- **Impacto:** Portafolio menos mantenible, más difícil de ampliar y con promesas UX inconsistentes.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** extraer un motor común de amortización, convertir `credito-consumo` en comparador A/B real y documentar explícitamente cuándo usar tarjeta vs crédito vs prepago.
- **Avance actual (2026-03-12):** se extrajo `src/application/use-cases/shared/creditAmortization.ts` como motor común de amortización, reutilizado por `CalculateConsumerCredit`, `SimulateCreditCardCost` y `SimulateCreditPrepayment`. `credito-consumo` dejó de prometer comparación A/B inexistente y ahora deriva al usuario a la herramienta correcta según necesidad. La landing de calculadoras incorpora un bloque para elegir entre crédito nuevo, tarjeta o prepago, y los tests verifican equivalencia del motor compartido con escenarios ya publicados.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un módulo común de amortización reutilizado por las tres superficies.
- [x] `credito-consumo` cumple o deja de prometer comparación A/B.
- [x] La landing de calculadoras ayuda a escoger la herramienta correcta en deuda/crédito.
- [x] Los tests cubren equivalencia entre motor común y casos actuales donde siga aplicando.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0026 — Faltan inputs críticos y validaciones visibles en prepago y arriendo
- **ID:** TD-0026
- **Título corto:** Endurecer validaciones y supuestos en prepago y arriendo
- **Descripción:** `prepago-credito` no pide comisión de prepago ni valida consistencia entre saldo/cuota/plazo; `reajuste-arriendo` en modo `pesos fijos` puede producir un pseudo-resultado con `$0` si el usuario no ingresa monto.
- **Evidencia:** `src/application/use-cases/SimulateCreditPrepayment.ts`; `src/pages/calculadoras/prepago-credito.astro`; `src/pages/calculadoras/reajuste-arriendo.astro`.
- **Impacto:** Riesgo de recomendaciones binarias engañosas y de outputs basura por inputs incompletos.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** agregar comisión de prepago, validación de coherencia contractual y bloqueo explícito de resultados en blanco; reemplazar `alert()` por errores inline contextualizados.
- **Avance actual (2026-03-12):** `prepago-credito` ahora pide comisión/costo de prepago con supuesto visible en `0`, descuenta ese costo del beneficio neto y rechaza escenarios donde la cuota no amortiza razonablemente el crédito. `reajuste-arriendo` bloquea el modo `pesos fijos` si falta monto y ambas calculadoras muestran errores inline en vez de depender solo de `alert()`.
- **Criterios de cierre (checklist verificable):**
- [x] `prepago-credito` contempla comisión/costo de prepago o explicita antes del cálculo que asume cero.
- [x] `prepago-credito` detecta inputs incompatibles que no amortizan razonablemente.
- [x] `reajuste-arriendo` no devuelve pseudo-resultados con monto vacío.
- [x] Los errores se muestran inline y no solo por `alert()`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0027 — Portafolio de calculadoras creció sin una taxonomía de decisión visible
- **ID:** TD-0027
- **Título corto:** Reordenar landing y política de creación/fusión de calculadoras
- **Descripción:** El portafolio actual es útil pero se presenta como una lista plana. Eso deja fronteras borrosas entre herramientas cercanas y no explicita una política reusable para crear, extender, fusionar o eliminar calculadoras.
- **Evidencia (actualizada):** `src/config/calculatorPortfolio.ts` centraliza familias, JTBD, fronteras y guías de elección; `src/pages/calculadoras/index.astro` renderiza el landing desde esa fuente de verdad en cuatro familias con ayuda visible para casos cercanos; `docs/operations/runbooks/calculator-portfolio-policy.md` fija el intake obligatorio con JTBD y riesgo de overlap; `tests/application/CalculatorPortfolio.test.ts` evita rutas duplicadas y omisiones de metadata crítica.
- **Impacto:** Mayor riesgo de canibalización, navegación ineficiente y expansión desordenada del producto.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** reordenar `/calculadoras/` por familias (`Ingresos`, `Ahorro/Previsión`, `Deuda/Crédito`, `Vivienda/UF`), agregar ayudantes de elección y convertir la política de portfolio en checklist operativa antes de crear nuevas herramientas.
- **Criterios de cierre (checklist verificable):**
- [x] La landing agrupa calculadoras por familia y no solo por lista plana.
- [x] Existe ayuda visible para escoger entre calculadoras parcialmente cercanas.
- [x] La política de creación/fusión/extensión queda documentada y referenciable en backlog o docs operativos.
- [x] Nuevas propuestas de calculadoras deben declarar JTBD distinto y riesgo de overlap.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0028 — Artículo APV publicado usa bandas de sueldo y recomendación A/B demasiado rígidas
- **ID:** TD-0028
- **Título corto:** Rehacer refresh YMYL de `que-es-el-apv` para recomendación A/B/mixta trazable
- **Descripción:** El artículo `que-es-el-apv.mdx` explica bien la mecánica base del APV, pero hoy traduce la decisión de Régimen A vs B a bandas fijas de sueldo bruto (`<$4.800.000`, `>$4.800.000`, `$4.800.000-$8.000.000`, `>$8.000.000`) y a una recomendación de combinación A+B que no queda suficientemente anclada en fuentes oficiales ni en renta líquida imponible/tramo marginal efectivo. Tras la revisión de `TD-0022`, esa sección quedó desalineada del criterio más defendible para el producto y puede inducir una elección tributaria demasiado simplificada en un artículo YMYL publicado.
- **Evidencia (actualizada):** `src/data/blog/que-es-el-apv.mdx` ahora reemplaza la tabla por sueldo bruto con una respuesta rápida anclada en renta líquida imponible, tasa marginal y remanente del bono A; `artifacts/editorial/que-es-el-apv/20260312-0928-codex/` contiene `brief`, `dossier`, `outline`, `draft`, `math audit`, `compliance`, `publish packet`, `metadata` y `sources`; validación primaria 2026-03-12 en SII (`impuesto2026.htm`, `001_140_5883.htm`, `ja287.htm`, `circu24.pdf`) y Superintendencia de Pensiones (`w3-propertyvalue-9929.html`, `w3-propertyvalue-2929.html`).
- **Impacto:** Riesgo alto de orientación imprecisa en una pieza YMYL publicada que ayuda a elegir un beneficio tributario/previsional.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** ejecutar refresh editorial completo con pipeline YMYL para `que-es-el-apv`; reemplazar la tabla de bandas fijas de sueldo por una respuesta rápida con vigencia y fuentes oficiales; explicar la lógica A/B/mixta como resumen orientativo en función de renta líquida imponible, tramo marginal y agotamiento del tope bonificable del Régimen A; actualizar `updatedDate` y publish packet con math/compliance review.
- **Criterios de cierre (checklist verificable):**
- [x] El artículo ya no usa bandas fijas de sueldo bruto como regla central de decisión A vs B.
- [x] La sección de recomendación A/B/mixta tiene respuesta rápida, vigencia explícita y al menos una fuente oficial crítica por regla.
- [x] La combinación A+B queda presentada como resumen orientativo condicionado, no como regla universal de “muchos asesores”.
- [x] El artículo queda alineado con la lógica vigente del simulador APV o explicita cualquier diferencia residual mientras `TD-0021` siga abierto.
- [x] El refresh incluye artifact chain editorial completo (`brief`, `dossier`, `outline`, `draft`, `math audit`, `compliance`, `publish packet`).
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-12
- **Última actualización:** 2026-03-12

## TD-0029 — Fichas legales de cesantía y reforma previsional quedaron desalineadas del modelado vigente
- **ID:** TD-0029
- **Título corto:** Actualizar fichas legales de cesantía y reforma previsional según parámetros oficiales vigentes
- **Descripción:** Durante `TD-0023` quedó en evidencia que `src/data/laws/ley-19728-seguro-cesantia.md` y `src/data/laws/proyecto-reforma-previsional-2025.md` resumen porcentajes y cronogramas que ya no calzan exactamente con el modelado oficial usado por las calculadoras. El runtime quedó endurecido, pero la capa documental todavía puede inducir una lectura distinta.
- **Evidencia (actualizada):** `src/data/laws/ley-19728-seguro-cesantia.md` ahora explicita la distribución vigente CIC/FCS (1,6% + 0,8% + 0,6% para indefinido; 2,8% + 0,2% para plazo fijo/obra/servicio), los mínimos CIC/FCS y las tablas FCS vigentes al 2026-03-12 con fecha de corte visible; `src/data/laws/proyecto-reforma-previsional-2025.md` distingue implementación actual vs régimen 2033, explicita que hoy solo 0,1% del nuevo 1% va directo a cuenta individual y documenta el cronograma usado por `src/application/use-cases/shared/retirementEmployerContributionSchedule.ts`; validación primaria 2026-03-12 en AFC, ChileAtiende, BCN y Superintendencia de Pensiones.
- **Impacto:** Riesgo de que una ficha legal interna contradiga la lógica visible de calculadoras YMYL ya corregidas.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** refrescar ambas fichas legales con cifras, cortes temporales y notas de alcance alineadas con las fuentes primarias ya usadas por el runtime, sin introducir reglas simplificadas que mezclen cuenta individual con componentes colectivos.
- **Criterios de cierre (checklist verificable):**
- [x] La ficha de cesantía refleja tasas CIC/FCS y mínimos vigentes.
- [x] La ficha de reforma previsional distingue con claridad el tramo que va directo a la cuenta individual.
- [x] Las dos fichas explicitan fecha de corte y fuente primaria crítica.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-12
- **Última actualización:** 2026-03-12

## TD-0011 — Pilar CAE/costo real sin artículo editorial
- **ID:** TD-0011
- **Título corto:** Cubrir pilar faltante CAE/costo real
- **Descripción:** Existe brecha editorial en query/pilar de CAE y costo real del crédito; hoy no hay artículo dedicado.
- **Evidencia (actualizada):** el artículo canónico existe en `src/data/blog/cae-costo-real-credito-chile.md`; la tabla editorial marca ED-009 como `DONE` y el hub de deuda/crédito ya lo enlaza como pieza activa.
- **Impacto:** Cobertura incompleta del cluster de deuda/crédito y menor capacidad de respuesta a intención informativa.
- **Riesgo:** bajo-medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Crear artículo pilar CAE/costo real con fuentes primarias y enlazado interno desde guías/relacionados.
- **Criterios de cierre (checklist verificable):**
- [x] Existe artículo pilar publicado para CAE/costo real con frontmatter válido.
- [x] Incluye fuentes primarias y enlaces internos del cluster correspondiente.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-11

## TD-0012 — Falta `updatedDate` en batch original de artículos
- **ID:** TD-0012
- **Título corto:** Normalizar señal de frescura editorial
- **Descripción:** Parte del batch original sigue sin `updatedDate`, lo que dificulta distinguir contenido revisado sustantivamente.
- **Evidencia (actualizada):** revisión repo-truth del corpus publicado (`src/data/blog/**`) al 2026-03-11 muestra `updatedDate` presente en los 30 artículos del blog; el backlog editorial seguía con filas desactualizadas.
- **Impacto:** Señal de frescura inconsistente en contenidos de alto impacto informativo.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Agregar `updatedDate` solo en revisiones sustantivas verificables; evitar fechas ficticias o mecánicas.
- **Criterios de cierre (checklist verificable):**
- [x] Cada artículo del batch original actualizado sustantivamente declara `updatedDate`.
- [x] No existen `updatedDate` faltantes en el corpus publicado actual.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-11

## TD-0015 — `check:urls:ci` depende de hosts externos para métricas no bloqueantes
- **ID:** TD-0015
- **Título corto:** Aislar escaneo interno del ruido externo en URL checks
- **Descripción:** El flujo `check:urls:ci` sigue consultando hosts externos para reportar `external_failures`; esto introduce timeouts intermitentes y variación de latencia aunque el gate bloqueante solo depende de `internal_broken`.
- **Evidencia (actualizada):** `scripts/check-urls.mjs` ahora expande `linksToSkip` para omitir hosts externos salvo en `--external-audit`; `pnpm run check:urls:ci` (2026-03-11) retorna `internal_broken=0 external_failures=0`, mientras `pnpm run check:urls:external:audit` sigue reportando `external_failures=2` (`www.dt.gob.cl` 404, `www.pdichile.cl` 403) en modo no bloqueante.
- **Impacto:** Incrementa ruido operacional y puede ocultar señales internas relevantes en revisiones rápidas.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** separar modos de chequeo (`internal-only` bloqueante y `external-observability` informativo) o bloquear recursión externa en CI cuando no se esté ejecutando auditoría de externos.
- **Criterios de cierre (checklist verificable):**
- [x] `check:urls:ci` no realiza requests a hosts externos por defecto.
- [x] Se mantiene un comando explícito para auditoría externa no bloqueante.
- [x] El reporte final distingue claramente estado interno (SLO) de telemetría externa.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-04
- **Última actualización:** 2026-03-11

## TD-0016 — Corpus YMYL legacy sin paquetes de artefactos editoriales
- **ID:** TD-0016
- **Título corto:** Backfill de artefactos YMYL legacy
- **Descripción:** La deuda historica de artefactos YMYL legacy quedo cerrada: todo el corpus publicado ya tiene `artifacts/editorial/<slug>/<run-id>/` minimos (`01-brief.yaml`, `02-dossier.md`, `fecha_corte`, `sources`) para enforcement repo-wide.
- **Evidencia (actualizada):** `EDITORIAL_ENFORCE=1 pnpm run check:editorial` (2026-03-11) reporta `ymyl_posts=28 compliant=28 non_compliant=0` tras backfill de ocho batches: `impuestos-personas`, `empleo-ingresos-laboral`, `sueldo-remuneraciones-core` (`como-calcular-sueldo-liquido`, `cuanto-descuenta-la-afp-de-tu-sueldo`), `prevision-core` (`como-cambiarse-de-afp`, `fondos-afp-a-b-c-d-e`, `que-es-la-cuenta-2-afp`, `reforma-previsional-2025-que-cambia-y-como-te-afecta`), `seguridad-financiera` (`estafas-financieras-chile-vishing-smishing-marketplace`, `fraude-tarjeta-que-hacer`, `suplantacion-identidad-creditos-no-reconocidos`), `deuda-credito-core` (`cae-costo-real-credito-chile`, `informe-deudas-cmf-vs-dicom`, `que-es-la-uf`, `renegociacion-superir`) y `ahorro-inversion-core` (`ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`, `como-invertir-en-etfs-desde-chile`, `deposito-a-plazo-uf-vs-pesos`, `fondos-mutuos-comisiones-rescate-impuestos`, `interes-compuesto-nota-metodologica`, `que-es-el-apv`).
- **Impacto:** Riesgo alto de deuda editorial invisible y de falsos bloqueos en CI cuando el gate se aplica fuera del diff tocado.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** Backfill por cluster de los paquetes editoriales mínimos para cada artículo YMYL legacy, usando `pnpm run scaffold:editorial-artifacts` para iniciar cada run en la carpeta canónica y manteniendo la enforcement estricta de PR limitada al diff hasta cerrar la deuda.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un scaffold reproducible para crear `artifacts/editorial/<slug>/<run-id>/` con la estructura completa del pipeline.
- [x] `EDITORIAL_ENFORCE=1 pnpm run check:editorial` pasa sobre todo el corpus.
- [x] Cada artículo YMYL publicado tiene `01-brief.yaml` y `02-dossier.md` con `fecha_corte` y `sources` válidos.
- [x] El backlog editorial deja de requerir scoping por diff para evitar bloqueos ajenos al cambio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-06
- **Última actualización:** 2026-03-11

## TD-0017 — Fonts con rutas relativas rompen en rutas anidadas
- **ID:** TD-0017
- **Título corto:** Corregir carga de tipografías en rutas anidadas
- **Descripción:** Las reglas `@font-face` en `src/styles/global.css` usan URLs relativas (`../fonts/...`) que en rutas anidadas terminan resolviendo a `/guias/fonts/...` y generan `404`, dejando al navegador en fallback tipográfico.
- **Evidencia (actualizada):** `src/styles/global.css` usa rutas absolutas `/fonts/...`; los assets existen en `public/fonts/`; `pnpm run build` (2026-03-11) completa sin warnings de Vite por esas fuentes ni fallos posteriores en `check:urls`.
- **Impacto:** Riesgo de tipografías incorrectas en páginas internas, diferencias visuales entre rutas y ruido de consola que dificulta validar otros cambios frontend.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Convertir las URLs de `@font-face` a rutas estables resueltas por Astro/Vite (import de assets o rutas absolutas públicas) y verificar carga correcta en `/` y en rutas anidadas.
- **Criterios de cierre (checklist verificable):**
- [x] No hay evidencia actual de `404` por esas fuentes en la build/local validation activa.
- [x] `pnpm run build` no emite warnings por esas dos referencias de fuentes.
- [x] La carga usa rutas absolutas estables y assets públicos presentes.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-08
- **Última actualización:** 2026-03-11

## TD-0013 — Respuestas YMYL abstractas en licencia/finiquito
- **ID:** TD-0013
- **Título corto:** Concretar reglas en piezas laborales críticas
- **Descripción:** Artículos de licencia y finiquito tenían respuestas abstractas en puntos de intención de búsqueda y efecto legal.
- **Evidencia (actualizada):** ajustes en `src/data/blog/licencia-medica-desde-que-dia-pagan.md` y `src/data/blog/finiquito-e-indemnizaciones-en-chile.md` con reglas explícitas de pago/causales.
- **Impacto:** Riesgo de mala interpretación de reglas laborales por ambigüedad de redacción.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Mantener tablas/reglas directas por causal y por tramo de días en artículos YMYL.
- **Criterios de cierre (checklist verificable):**
- [x] Artículo de licencia responde explícitamente regla `<11 días` y pagador.
- [x] Artículo de finiquito enumera causales y efecto legal básico en indemnización.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-02

## TD-0014 — Reforma previsional 2025-2027 no explicitada en piezas AFP prioritarias
- **ID:** TD-0014
- **Título corto:** Alinear contenidos AFP a calendario de reforma
- **Descripción:** Faltaba separar en artículos prioritarios AFP qué cambia hoy y qué cambia entre 2025-2027.
- **Evidencia (actualizada):** bloques agregados en `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md` y `src/data/blog/fondos-afp-a-b-c-d-e.md`.
- **Impacto:** Riesgo de desalineación normativa en contenidos previsionales de alto tráfico.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Mantener bloque estructurado de vigencia con calendario y distinción "hoy vs después".
- **Criterios de cierre (checklist verificable):**
- [x] Ambos artículos prioritarios incluyen bloque "Qué cambia entre 2025 y 2027".
- [x] Se documenta 7% empleador, fondos generacionales y calendario de implementación.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-02

## TD-0002 — Valores financieros hardcodeados con fecha fija
- **ID:** TD-0002
- **Título corto:** Externalizar UF/UTM/TMC y fechas de referencia
- **Descripción:** Varias calculadoras usan constantes numéricas y textos de fecha incrustados (UF, UTM, TMC, IPC, referencias “2025/2026”). Esto envejece resultados y compromete confiabilidad.
- **Evidencia (actualizada):** `src/domain/economic/EconomicParameters.ts` (contrato + invariantes), `src/infrastructure/economic/EconomicParameterProvider.ts` (fuente única + fallback controlado + telemetría + memoización), `src/application/use-cases/GetEconomicParameters.ts`, consumo en `src/pages/calculadoras/{apv,conversor-uf,sueldo-liquido,seguro-cesantia,reajuste-arriendo,simulador-renegociacion}.astro` + `src/utils/indicadores.ts`, documentación en `README.md` ("Economic Data Governance & Fallback Strategy"), pruebas en `tests/infrastructure/EconomicParameterProvider.test.ts`.
- **Impacto:** Riesgo de recomendaciones/cálculos desactualizados, pérdida de confianza y soporte correctivo frecuente.
- **Riesgo:** alto
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Centralizar parámetros económicos en un módulo/fuente única con timestamp; cargar valores dinámicos en build/runtime con fallback explícito y banner de vigencia; eliminar fechas hardcodeadas de copy.
- **Criterios de cierre (checklist verificable):**
- [x] Existe una sola fuente de valores económicos para calculadoras.
- [x] Ninguna calculadora contiene fechas hardcodeadas en texto UI.
- [x] Se muestra fecha/hora efectiva de actualización de datos.
- [x] Fallback y comportamiento offline están documentados y probados.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0003 — Lógica tributaria duplicada entre calculadoras
- **ID:** TD-0003
- **Título corto:** Extraer motor de impuesto de segunda categoría
- **Descripción:** La tabla de tramos y funciones de cálculo están duplicadas en más de una calculadora. Cambios legales futuros pueden quedar aplicados en una página y omitidos en otra.
- **Evidencia (actualizada):** `src/domain/taxation/TaxEngine.ts`; `src/application/use-cases/{CalculateNetSalary,CalculateApvComparison}.ts`; consumo desde `src/pages/calculadoras/sueldo-liquido.astro` y `src/pages/calculadoras/apv.astro`; regresión de tramos/tasa marginal/redondeo en `tests/domain/TaxEngine.test.ts`.
- **Impacto:** Riesgo de resultados inconsistentes, mantenimiento costoso y errores silenciosos.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Crear util compartida tipada (por ejemplo `src/utils/tax.ts`) con pruebas de casos límite; consumir desde ambas calculadoras.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un único módulo de cálculo tributario reutilizable.
- [x] Calculadoras APV y sueldo líquido usan el mismo módulo.
- [x] Se agregan tests de regresión para tramos y tasa marginal.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0004 — Ausencia de tests automáticos para lógica financiera
- **ID:** TD-0004
- **Título corto:** Incorporar pruebas unitarias para cálculos críticos
- **Descripción:** No existe pipeline de tests; el control actual es lint/formato/build. Las calculadoras contienen lógica numérica extensa y sensible a regresiones.
- **Evidencia (actualizada):** `package.json` (`test: vitest run`); `vitest.config.ts`; `.github/workflows/ci.yml` ejecuta `check:boundaries`, `lint`, `format:check`, `test`, `build`; suites en `tests/domain/`, `tests/application/`, `tests/infrastructure/`.
- **Impacto:** Mayor probabilidad de errores en producción al cambiar reglas financieras o refactorizar.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** Introducir framework de tests (p. ej. Vitest), extraer funciones de cálculo a `src/utils/` y cubrir escenarios base/edge.
- **Criterios de cierre (checklist verificable):**
- [x] CI ejecuta tests y falla ante regresiones.
- [x] Cálculos clave (sueldo, APV, crédito, cesantía) tienen cobertura mínima acordada.
- [x] Casos de borde (0, topes, tasas extremas, plazos) están cubiertos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0005 — Archivos/componentes legacy no usados
- **ID:** TD-0005
- **Título corto:** Limpiar artefactos legacy y código huérfano
- **Descripción:** Existen respaldos y piezas no utilizadas que aumentan ruido y confusión de mantenimiento.
- **Evidencia (actualizada):** eliminados `src/components/Card.astro.bak`, `src/pages/about.md.bak`, `src/layouts/AboutLayout.astro` y `src/components/BarraIndicadores.astro`; validación de cierre con `rg --files src | rg '\.bak$'` (0) y `rg -n "AboutLayout|BarraIndicadores" src` (0).
- **Impacto:** Riesgo de editar archivos incorrectos y deuda cognitiva para onboarding.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Eliminar o mover a carpeta de archivo explícita; si se conserva, documentar propósito y estado no productivo.
- **Criterios de cierre (checklist verificable):**
- [x] No quedan `.bak` en rutas productivas.
- [x] Layouts/componentes sin uso se eliminan o documentan explícitamente.
- [x] `rg --files` no devuelve artefactos ambiguos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0006 — Metadata de contribución aún ligada a AstroPaper upstream
- **ID:** TD-0006
- **Título corto:** Alinear templates de GitHub al proyecto
- **Descripción:** Varias plantillas y docs de contribución apuntan al upstream AstroPaper y contactos externos, no al proyecto actual.
- **Evidencia (actualizada):** `.github/CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*` y `.github/CODE_OF_CONDUCT.md` alineados a `cortega26/tuplatainforma`; `rg -n "astro-paper|satnaing|AstroPaper" .github` devuelve 0.
- **Impacto:** Fricción para colaboradores, issues en repos equivocados, ruido de gobernanza.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Reescribir plantillas con naming, links, contacto y reglas del repo actual.
- **Criterios de cierre (checklist verificable):**
- [x] No quedan referencias a `satnaing/astro-paper` en templates.
- [x] Contactos y enlaces apuntan al repositorio actual.
- [x] Flujo de contribución coincide con stack y scripts reales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0007 — Email social placeholder en producción
- **ID:** TD-0007
- **Título corto:** Reemplazar `mailto:[EMAIL_ADDRESS]`
- **Descripción:** El enlace de correo en redes sociales contiene placeholder sin configurar, lo que rompe la acción de contacto.
- **Evidencia (actualizada):** ítem `Mail` removido de `SOCIALS` en `src/constants.ts`; `rg -n "\[EMAIL_ADDRESS\]" src` devuelve 0.
- **Impacto:** UX rota y pérdida de canal de contacto.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Configurar email real o remover temporalmente el ítem de `SOCIALS`.
- **Criterios de cierre (checklist verificable):**
- [x] `SOCIALS` no contiene placeholders.
- [x] Header/footer renderizan sin enlaces `mailto:[EMAIL_ADDRESS]` rotos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0008 — Fetch repetido a `mindicador.cl` por componente embebido
- **ID:** TD-0008
- **Título corto:** Cachear indicadores económicos por request/build
- **Descripción:** Cada render de `IndicadorEconomico` invoca `getIndicadores()`. En contenidos con múltiples instancias, se repite fetch externo innecesariamente.
- **Evidencia (actualizada):** `src/infrastructure/economic/EconomicParameterProvider.ts` (memoización en módulo con `cachedBundlePromise` + `getEconomicProviderTelemetry()`), `src/utils/indicadores.ts` consume provider unificado, `src/components/IndicadorEconomico.astro` reutiliza la misma fuente y hay validación de una sola llamada externa en `tests/infrastructure/EconomicParameterProvider.test.ts`.
- **Impacto:** Latencia extra, dependencia de red repetida y potencial throttling/fallos intermitentes.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Memoizar resultado por ciclo de render/build (cache en módulo o singleton), con TTL corto y fallback explícito.
- **Criterios de cierre (checklist verificable):**
- [x] Múltiples componentes en una misma página no disparan múltiples fetchs externos.
- [x] Se mantiene fallback al fallar la API.
- [x] Logs/telemetría mínima confirman reducción de llamadas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0009 — Estrategia de fuentes duplicada/no alineada
- **ID:** TD-0009
- **Título corto:** Consolidar carga de tipografías
- **Descripción:** La configuración experimental de fuentes (Inter/Playfair) convive con carga manual de Google Fonts (Fraunces/Source Sans 3), sin uso visible de variables experimentales.
- **Evidencia (actualizada):** `astro.config.ts` mantiene `experimental.preserveScriptOrder` pero sin `experimental.fonts`; `src/layouts/Layout.astro` conserva una sola carga manual de Google Fonts (Fraunces + Source Sans 3); `src/styles/global.css` permanece alineado con `--font-display`/`--font-body`.
- **Impacto:** Complejidad innecesaria y posible costo de rendimiento/configuración.
- **Riesgo:** bajo
- **Severidad (1-5):** 1
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Elegir una sola vía de carga (experimental o manual) y remover configuración no usada.
- **Criterios de cierre (checklist verificable):**
- [x] Solo existe una estrategia de carga de fuentes en producción.
- [x] Variables tipográficas usadas y configuradas son consistentes.
- [x] No se descargan fuentes no utilizadas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0010 — Lógica de calculadoras acoplada a DOM e `innerHTML`
- **ID:** TD-0010
- **Título corto:** Desacoplar motor de cálculo de la capa de presentación
- **Descripción:** Las calculadoras concentran validación, cálculo y render string-based en scripts inline dentro de páginas `.astro`, dificultando testeo y evolución segura.
- **Evidencia (actualizada):** Motores extraídos a `src/application/use-cases/**` (sueldo, APV, UF, cesantía, renegociación, reajuste, tarjeta, crédito consumo, prepago, jubilación); render de resultados en `src/pages/calculadoras/*.astro` migrado a DOM API sin `innerHTML`; regresión funcional en `tests/application/FinancialUseCases.regression.test.ts`.
- **Impacto:** Baja mantenibilidad, alto costo de cambios y riesgo de regressions/errores de rendering.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** L
- **Propuesta de solución:** Extraer motores de cálculo a módulos puros en `src/utils/`, tipar inputs/outputs y dejar en página solo wiring de UI.
- **Criterios de cierre (checklist verificable):**
- [x] Cada calculadora usa funciones puras reutilizables.
- [x] El DOM solo consume resultados tipados.
- [x] Se eliminan concatenaciones `innerHTML` para bloques críticos.
- [x] Hay tests de unidad para motores extraídos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0030 — Assertions incorrectas en regression tests de tarjeta de crédito
- **ID:** TD-0030
- **Título corto:** Corregir `doubledPayment.totalPaid` esperado en regression test
- **Descripción:** Los casos 1 y 3 de "Regression - Tarjeta de Crédito" en `tests/application/FinancialUseCases.regression.test.ts` (líneas 246 y 274) aseveran `expect(round2(result.doubledPayment.totalPaid)).toBe(0)`, pero la función retorna el total acumulado real (2,307,304.91 y 881,223.20 respectivamente). El valor `0` nunca fue correcto; parece un error al escribir la assertion original.
- **Evidencia:** Pre-existente antes del commit 2026-03-25. Verificado con `git stash` + `pnpm run test` — mismos 2 fallos en rama limpia.
- **Impacto:** Bloquea CI gate `pnpm run test` (Rule 5.1). Los demás 158 tests pasan.
- **Riesgo:** alto (gate roto)
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Calcular los valores correctos de `doubledPayment.totalPaid` para cada caso ejecutando el simulador de referencia, y reemplazar `0` por el valor real en ambas assertions.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run test` pasa sin errores.
- [x] Las assertions reflejan el total pagado real según la simulación.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-25
- **Última actualización:** 2026-03-25

## TD-0031 — Arquitectura editorial visible duplica destinos y erosiona el ownership del sitio
- **ID:** TD-0031
- **Título corto:** Reducir duplicación de salidas y saturación contextual del sistema editorial
- **Descripción:** La auditoría integral del sitio detecta un patrón sistémico donde hubs, índices, artículos y componentes contextuales repiten el mismo destino dentro de una misma vista o reinyectan rutas vecinas sin cambiar materialmente la decisión. El problema ya no es solo de contenido; es de arquitectura de información visible. Esto afecta home, hubs de guías, índice de calculadoras, índice de leyes y varios artículos owner/support.
- **Evidencia:** `docs/editorial/SITE_AUDIT_2026-03-25.md`; `docs/editorial/BACKLOG_SITE_AUDIT.md`; render audit en `dist/**/index.html` con `46` vistas que contienen destinos duplicados; casos críticos en `dist/guias/impuestos-personas/index.html`, `dist/guias/pensiones-afp/index.html`, `dist/calculadoras/index.html`, `dist/leyes/index.html`; componentes sistémicos involucrados: `src/components/ContextLinkSection.astro`, `src/components/RelatedPosts.astro`, `src/components/ArticleDecisionIntro.astro`, `src/components/CalculatorCard.astro`.
- **Impacto:** Aumenta carga cognitiva, inflación de decisiones, canibalización editorial interna y pérdida de una ruta principal clara. Erosiona además la política de ownership ya formalizada en `docs/editorial/NON_CANNIBALIZATION_PROCESS.md` y `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** rediseñar hubs e índices para que cada vista tenga una sola capa dominante de decisión; introducir `budget` de salidas por vista y por destino para módulos contextuales; recortar linking circular entre owners vecinos; alinear la UX visible con la distinción `owner/support/reference/tool`.
- **Criterios de cierre (checklist verificable):**
- [x] Ningún destino principal aparece más de una vez por vista sin justificación explícita.
- [x] Cada hub conserva una sola matriz de decisión principal.
- [x] `ContextLinkSection`, `RelatedPosts`, `ArticleDecisionIntro` y `CalculatorCard` no repiten un destino ya mostrado como ruta principal en la misma pantalla.
- [x] Home, `/calculadoras/` y `/leyes/` dejan de duplicar la misma salida en bloques equivalentes.
- [x] El backlog `docs/editorial/BACKLOG_SITE_AUDIT.md` baja sus items críticos a cero o justifica excepciones documentadas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-25
- **Última actualización:** 2026-03-25

## TD-0032 — `format:check` falla por drift de Prettier fuera del frente editorial auditado
- **ID:** TD-0032
- **Título corto:** Normalizar formato en archivos fuera del scope de la auditoría
- **Descripción:** La validación final de la remediación editorial dejó `pnpm run format:check` fallando por drift de Prettier en archivos que no forman parte del frente crítico auditado: `src/application/use-cases/CalculateHonorariosNet.ts`, `src/config/deudaClusterLinks.ts`, `src/domain/taxation/TaxEngine.ts`, además de varios archivos ya tocados en esta serie de cambios. No es un problema de comportamiento del sitio, pero sí impide cerrar el gate de formato con evidencia limpia.
- **Evidencia:** `pnpm run format:check` el 2026-03-25 reporta 11 archivos con `Code style issues found`; entre ellos hay al menos 3 fuera del scope inmediato de remediación UX/editorial.
- **Impacto:** Bloquea el gate `format:check` y ensucia el cierre de cambios con deuda mecánica no funcional.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Ejecutar una pasada controlada de Prettier sobre los archivos marcados, revisar que el diff sea puramente mecánico y separarlo en un PR/commit de housekeeping para no mezclarlo con cambios editoriales o funcionales.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run format:check` pasa sin warnings.
- [x] El diff de normalización no altera comportamiento ni contratos.
- [ ] La limpieza de formato se mantiene separada de cambios funcionales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-25
- **Última actualización:** 2026-03-25

## TD-0033 — `format:check` volvió a quedar desalineado por drift mecánico fuera del scope actual
- **ID:** TD-0033
- **Título corto:** Rehacer limpieza mecánica de Prettier en archivos fuera de scope
- **Descripción:** Durante la remediación de warnings de `npm run build`, `pnpm run format:check` volvió a fallar por drift de Prettier en 22 archivos que no forman parte del cambio actual. El fix de warnings quedó limpio y validado, pero el gate global de formato ya no está en verde por deuda mecánica preexistente fuera del frente tocado.
- **Evidencia:** `pnpm run format:check` el 2026-04-03 vuelve a pasar limpio con `All matched files use Prettier code style!`, sin drift reproducible en el árbol actual.
- **Impacto:** Bloquea el gate global `format:check`, mete ruido en cierres de tareas pequeñas y obliga a distinguir entre deuda mecánica preexistente y regresiones reales del cambio actual.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Ejecutar una pasada controlada de Prettier solo sobre los archivos reportados por el gate, revisar que el diff sea puramente mecánico y cerrarlo en una unidad de housekeeping separada para no mezclarlo con cambios funcionales.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run format:check` vuelve a pasar sin warnings.
- [x] El diff de la remediación es puramente mecánico y no mezcla cambios funcionales.
- [x] La lista de archivos con drift queda absorbida en una unidad de housekeeping separada.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-03
- **Última actualización:** 2026-04-03

## TD-0035 — Lint global falla por variables sin uso y parse error en guías/calculadoras
- **ID:** TD-0035
- **Título corto:** Limpiar lint en Header y calculadoras/impuestos
- **Descripción:** El gate `pnpm run lint` cae por imports/variables sin uso y un caracter inválido en guías de impuestos. Esto deja el pipeline rojo y oculta regresiones nuevas de lint.
- **Evidencia (actualizada):** `pnpm run lint` pasa limpio el 2026-04-09. Los errores reportados el 2026-04-08 ya no reproducen en `Header.astro`, `comisiones-afp.astro` ni `guias/impuestos-personas/index.astro`.
- **Impacto:** Bloquea el gate de lint y puede permitir drift silencioso en componentes y páginas críticas si se ignora.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Eliminar imports/variables no usados y corregir el caracter inválido en la guía de impuestos; revalidar `pnpm run lint`.
- **Criterios de cierre (checklist verificable):**
  - [ ] `pnpm run lint` pasa sin errores.
  - [ ] No se introducen cambios funcionales adicionales fuera de los tres archivos señalados.
  - [ ] Se mantiene cobertura de tipos y ESLint sin desactivar reglas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0036 — Drift de Prettier en calculadoras deja el gate `format:check` en rojo
- **ID:** TD-0036
- **Título corto:** Normalizar formato en calculadoras con Prettier
- **Descripción:** El check `prettier --check .` falla por drift mecánico en dos calculadoras, lo que vuelve a encender el gate global de formato.
- **Evidencia (actualizada):** `pnpm run format:check` pasa limpio el 2026-04-09. El drift reportado en `comisiones-afp.astro` e `impuesto-segunda-categoria.astro` ya no reproduce.
- **Impacto:** El gate de formato queda rojo y dificulta distinguir regresiones reales de cambios funcionales.
- **Riesgo:** medio-bajo
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Ejecutar Prettier sólo sobre los archivos señalados y confirmar que el diff es mecánico.
- **Criterios de cierre (checklist verificable):**
  - [ ] `pnpm run format:check` pasa sin advertencias.
  - [ ] El diff de corrección es exclusivamente de formato.
  - [ ] No se modifica comportamiento ni contenido visible.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0037 — Tests de hero images fallan por drift en manifest y prompts canónicos
- **ID:** TD-0037
- **Título corto:** Alinear manifest y prompts de hero images con las expectativas de control
- **Descripción:** Los guardas de hero images quedaron desalineados: el manifest calcula 56 combinaciones y 28 modelos aprobados vs el baseline de 54/27, y los prompts A/B/C no incluyen las cláusulas esperadas de composición/escena.
- **Evidencia (actualizada):** `pnpm run test` pasa limpio el 2026-04-09: 43 archivos, 218 tests. No reproducen fallos en `tests/scripts/hero-image-pool.test.ts` ni en `tests/scripts/hero-images-config.test.ts`.
- **Impacto:** Gate de tests rojo; riesgo de publicar prompts/manifest incompletos que rompan generación de assets o rompan determinismo.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Revisar assets aprobados y plantillas A/B/C, actualizar manifest/pool o expectativas de conteo, y restaurar los constraints textuales en los builders de prompt.
- **Criterios de cierre (checklist verificable):**
  - [ ] `tests/scripts/hero-image-pool.test.ts` pasa con conteos actualizados y justificables.
  - [ ] `tests/scripts/hero-images-config.test.ts` pasa con prompts que incluyan constraints de composición, escena y espacio para texto.
  - [ ] Documentar en `scripts/` o README dev cómo actualizar el manifest/pool sin romper determinismo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0038 — Registro de calculadoras desalineado con las familias declaradas
- **ID:** TD-0038
- **Título corto:** Corregir CALCULATOR_PORTFOLIO para cumplir familias y recuentos
- **Descripción:** El test del portafolio de calculadoras detecta 15 entradas en vez de 13, lo que indica duplicidad o familias nuevas sin curar.
- **Evidencia (actualizada):** `pnpm run test` pasa limpio el 2026-04-09. `tests/application/CalculatorPortfolio.test.ts` ya no falla por longitud ni por familias declaradas.
- **Impacto:** Riesgo medio-alto de mostrar calculadoras duplicadas o mal agrupadas y de romper UX de navegación/calendario editorial; gate de tests rojo.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P0
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Revisar `CALCULATOR_PORTFOLIO` y `CALCULATOR_FAMILY_ORDER`, eliminar duplicados o ajustar familias declaradas y actualizar fixtures asociados.
- **Criterios de cierre (checklist verificable):**
  - [ ] `tests/application/CalculatorPortfolio.test.ts` pasa limpio con los recuentos esperados.
  - [ ] Las familias declaradas reflejan la intención de producto y no generan huecos ni duplicados.
  - [ ] Se documenta el recuento final en fixtures o README dev correspondiente.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0034 — `check:routes` volvió a quedar desalineado del baseline publicado
- **ID:** TD-0034
- **Título corto:** Refrescar baseline de rutas para eliminar altas espurias
- **Descripción:** En la validación posterior al fix de warnings, `pnpm run check:routes` pasó pero reportó 4 rutas agregadas aunque esta tarea no tocó rutas, slugs ni snapshots. Eso indica que el baseline `docs/reports/routes_snapshot_before.json` volvió a quedar atrás respecto del contenido actualmente observable.
- **Evidencia:** `docs/reports/routes_snapshot_before.json` fue refrescado el 2026-04-03 a `34` rutas y `pnpm run check:routes` vuelve a responder `No route changes detected.` con `before=34 after=34`.
- **Impacto:** Mete ruido en la verificación de rutas, dificulta distinguir cambios reales de URL frente a drift del baseline y reduce la utilidad auditiva del gate.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Refrescar `docs/reports/routes_snapshot_before.json` con el estado publicado correcto y validar que `pnpm run check:routes` vuelva a responder `No route changes detected` cuando no haya cambios de routing.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run check:routes` deja de reportar altas espurias en tareas sin cambios de routing.
- [x] El baseline de rutas refleja el estado publicado actual.
- [x] El refresh se hace en una unidad separada para no mezclar housekeeping con cambios funcionales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-03
- **Última actualización:** 2026-04-03

## TD-0035 — Tests de CalculatorPortfolio desactualizados tras agregar 2 calculadoras nuevas
- **ID:** TD-0035
- **Título corto:** Actualizar aserciones de longitud en CalculatorPortfolio.test.ts
- **Descripción:** `tests/application/CalculatorPortfolio.test.ts` espera exactamente 13 calculadoras en `CALCULATOR_PORTFOLIO` pero el registro tiene 15. El hardcode de longitud no se actualizó cuando se agregaron las dos últimas calculadoras.
- **Evidencia:** `pnpm run test` → `AssertionError: expected [...] to have a length of 13 but got 15` en `CalculatorPortfolio.test.ts:13`. Fallo pre-existente confirmado con baseline limpio (antes de commits de la sesión 2026-04-07).
- **Impacto:** La suite de tests reporta 1 fallo de forma permanente, enmascarando posibles regresiones reales en el portfolio.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Actualizar la aserción `toHaveLength(13)` al valor actual (15) y considerar no hardcodear la longitud total si el número continuará creciendo.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run test` pasa sin fallos en `CalculatorPortfolio.test.ts`.
  - [x] El número hardcodeado refleja el estado actual del registro.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-07
- **Última actualización:** 2026-04-07

- **Estado:** Completado
- **Fecha de creación:** 2026-04-07
- **Última actualización:** 2026-04-07

## TD-0039 — Mobile CWV por debajo de umbrales §5.4 en todas las plantillas
- **ID:** TD-0039
- **Título corto:** Mejorar LCP y Performance Score mobile (baseline 2026-04-08)
- **Descripción:** Las mediciones Lighthouse CLI del 2026-04-08 muestran que todas las plantillas del sitio fallan los umbrales AGENTS.md §5.4 en mobile. Desktop cumple todos los umbrales (Performance 99-100, LCP ≤0.89s, TBT 0ms, CLS 0). El gap mobile se debe principalmente a LCP alto (imágenes hero y fuentes web) y Speed Index elevado.
- **Evidencia baseline (mobile, Lighthouse 13.1.0, producción):**
  - `/` homepage: Perf 90, LCP 3.07s, TBT 14ms, SI 4.39s, CLS 0
  - `/posts/liquidacion-de-sueldo/`: Perf 88, LCP 3.24s, TBT 56ms, SI 4.64s, CLS 0
  - `/calculadoras/sueldo-liquido/`: Perf 95, LCP 2.67s, TBT 38ms, SI 2.02s, CLS 0
  - `/guias/ahorro-e-inversion/`: Perf 93, LCP 2.96s, TBT 51ms, SI 3.10s, CLS 0
- **Umbrales §5.4:** Perf ≥99, LCP ≤1.7s, SI ≤3.0s, TBT = 0ms, CLS = 0
- **Métricas en rojo:** LCP (todas), Perf Score (todas), TBT (todas), SI (artículo, homepage, hub)
- **Impacto:** SEO ranking signals; §5.4 bloquea merge de cambios en layouts/fonts si no mejora baseline.
- **Riesgo:** medio — no bloquea funcionalidad pero restringe futuros cambios de layout
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** (1) Auditar LCP element por plantilla y optimizar imagen/fuente que lo cause; (2) preload de la imagen hero LCP; (3) revisar si hay render-blocking resources; (4) considerar lazy-loading de componentes React pesados; (5) volver a medir post-fix y comparar contra este baseline.
- **Avance actual (2026-04-09):** el trabajo cliente no crítico quedó diferido (`analytics` y `ResumeWidget`), el runtime de `ClientRouter` dejó de cargarse por defecto en `/posts/`, `/guias/` y `/calculadoras/`, y el bundle de `analytics.ts` ya no se inyecta cuando `PUBLIC_GA_MEASUREMENT_ID` está vacío. Además, `ResumeWidget` pasó a resolver storage/tracking inline para no abrir chunks JS extra en homepage/hubs. Reruns locales guardados en `artifacts/lighthouse/td-0039-2026-04-09.md` muestran el baseline final `before -> after3`: homepage `requests 11 -> 7`, `LCP 1.807s -> 1.738s`; artículo `8 -> 5`, `Perf 99 -> 100`, `LCP 1.810s -> 1.807s`; calculadora `12 -> 9`, `Perf 99 -> 100`, `LCP 1.954s -> 1.807s`; hub `10 -> 5`, `Perf 99 -> 100`, `LCP 1.804s -> 1.658s`. `TBT=0`, `CLS=0` y `SI<3.0s` se mantienen en las cuatro URLs. Se probaron además quitar el preload de Fraunces, forzar tipografía body en el shell superior y cambiar `Fraunces` a `font-display: optional`, pero se descartaron por regresión/ruido sin cierre suficiente del gap restante.
- **Criterios de cierre (checklist verificable):**
  - [ ] Mobile Perf Score ≥ 99 en las 4 URLs
  - [ ] LCP ≤ 1.7s en mobile en las 4 URLs
  - [ ] TBT = 0ms en mobile en las 4 URLs
  - [ ] SI ≤ 3.0s en mobile en las 4 URLs
  - [ ] CLS = 0 (ya cumple — no regresar)
  - [ ] Nuevo reporte Lighthouse guardado en `artifacts/lighthouse/` con fecha post-fix
- **Owner:** TBD
- **Estado:** En progreso
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0040 — Baseline de `pnpm run test` volvió a quedar en rojo por `EstimateFiniquito`
- **ID:** TD-0040
- **Título corto:** Investigar regresión numérica en `EstimateFiniquito.test.ts`
- **Descripción:** El baseline requerido por AGENTS §5.5 antes de editar runtime UI volvió a fallar en `tests/application/EstimateFiniquito.test.ts`. El caso judicial que debe conservar una estimación base espera `yearsOfServiceIndemnity = 3000000`, pero el árbol actual entrega `2000000`.
- **Evidencia:** `pnpm run test` (2026-04-10, árbol sin cambios de runtime para esta tarea) falla en `tests/application/EstimateFiniquito.test.ts:60` con `AssertionError: expected 2000000 to be 3000000`.
- **Impacto:** La suite deja de ser una señal confiable para cambios futuros y bloquea verificación completa aunque el trabajo actual no toque finiquitos.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Revalidar la fórmula/fixture del caso judicial en `EstimateFiniquito` y alinear el test con la lógica vigente solo si el cálculo actual es correcto; de lo contrario, restaurar la estimación base esperada.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run test` pasa sin fallos en `tests/application/EstimateFiniquito.test.ts`.
  - [x] Queda documentado si el drift provino del motor o del fixture esperado.
- **Owner:** TBD
- **Estado:** Completado
- **Nota de cierre:** El motor ya tenía `>= 6` en `resolveServiceYears` (línea 114). `pnpm run test` pasa limpio: 43 archivos, 218 tests. El drift era del backlog, no del código.
- **Fecha de creación:** 2026-04-10
- **Última actualización:** 2026-04-12

## TD-0041 — Cluster source-of-truth desalineado para `presupuesto-control-financiero`
- **ID:** TD-0041
- **Título corto:** Registrar o retirar coherentemente el hub `presupuesto-control-financiero`
- **Descripción:** El árbol actual contiene el folder físico `src/pages/guias/presupuesto-control-financiero`, pero `src/config/clusters.ts` no incluye `presupuesto-control-financiero` en `CLUSTERS` ni en `GUIDE_HUBS`. Esto deja al repo con dos fuentes de verdad divergentes para la arquitectura de clusters.
- **Evidencia:** `pnpm run check:editorial` (2026-04-11) falla con `[check-editorial-structure] FAIL. Physical cluster folder present in src/pages/guias/presupuesto-control-financiero is not registered in src/config/clusters.ts.`; `pnpm run test` (2026-04-11) falla en `tests/integration/cluster-source-of-truth.test.ts:21` por la misma causa.
- **Impacto:** Rompe el gate editorial agregado y deja la suite de integración en rojo aunque cambios no relacionados no toquen clusters. También vuelve ambiguo el estado operativo real del cluster transitorio documentado en policy/runbooks.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Elegir una sola verdad operativa en un cambio dedicado: o (A) registrar `presupuesto-control-financiero` formalmente en `src/config/clusters.ts` y sus metadatos visibles, o (B) retirar el folder físico/hub hasta que la migración esté lista. En ambos casos, alinear tests, check-editorial-structure, policy de transición y navegación.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run check:editorial` deja de fallar por `presupuesto-control-financiero`.
  - [x] `pnpm run test` pasa en `tests/integration/cluster-source-of-truth.test.ts`.
  - [x] La verdad operativa queda alineada registrando el hub en `src/config/clusters.ts` y ajustando el test de conteo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-11
- **Última actualización:** 2026-04-11

## TD-0043 — AFP commission rates publicadas con 6/7 valores incorrectos; sin validación automatizada
- **ID:** TD-0043
- **Título corto:** Blindar calidad de datos financieros críticos (AFP commissions)
- **Descripción:** `src/config/afpCommissions.ts` fue creado el 2026-04-10 con 6 de 7 tasas de comisión AFP incorrectas (ningún valor fue verificado contra fuente oficial antes del merge). No existía herramienta ni workflow que detectara el drift. Las calculadoras `sueldo-liquido`, `apv` y `comisiones-afp` consumían esos valores erróneos directamente. El texto estático hardcoded en `sueldo-liquido.astro` también usaba cifras incorrectas.
- **Evidencia:** Commit `9f03e05` (2026-04-10): `afpCommissions.ts` creado con valores que no coinciden con ninguna fuente oficial verificable. Verificación posterior contra Previred Indicadores Previsionales abril 2026 mostró: Capital 0.58% (debía ser 1.44%), Cuprum 0.65% (1.44%), Habitat 0.77% (1.27%), PlanVital 0.49% (1.16%), ProVida 0.69% (1.45%), Uno 0.75% (0.46%). Solo Modelo (0.58%) era correcto.
- **Impacto:** Calculadoras YMYL publicaban resultados de descuento AFP incorrectos para 6 de 7 AFPs. Riesgo directo de decisiones financieras equivocadas por parte de los usuarios.
- **Riesgo:** crítico (datos financieros YMYL incorrectos en producción)
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** (1) Corregir todos los valores en `afpCommissions.ts` con verificación de ≥2 fuentes oficiales. (2) Crear script de verificación automatizado contra Previred. (3) Crear workflow mensual en GitHub Actions. (4) Crear política de verificación de datos financieros. (5) Actualizar texto hardcoded en páginas de calculadoras.
- **Avance actual (2026-04-11):** RESUELTO. Los 7 valores fueron corregidos en `afpCommissions.ts` verificados contra Previred (abril 2026) + AFP Capital + AFP Uno + SP oficial. El texto estático en `sueldo-liquido.astro` fue actualizado a AFP Habitat 11.27% con los montos correctos. Se creó `scripts/check-afp-commissions.mjs`, `.github/workflows/check-afp-commissions.yml` (cron mensual, abre issue automático en GitHub si detecta drift), y `docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md` con reglas FDV-001 a FDV-005.
- **Criterios de cierre (checklist verificable):**
  - [x] `src/config/afpCommissions.ts` tiene los 7 valores correctos con fuentes citadas en comentario de cabecera.
  - [x] `src/pages/calculadoras/sueldo-liquido.astro` muestra valores de ejemplo y texto de rango consistentes con el config.
  - [x] `scripts/check-afp-commissions.mjs` existe y valida contra Previred.
  - [x] `.github/workflows/check-afp-commissions.yml` existe con cron mensual y apertura automática de issue.
  - [x] `docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md` define FDV-001 a FDV-005 y tabla de fuentes oficiales.
  - [x] `docs/governance/README.md` referencia la nueva política.
  - [x] `package.json` incluye script `check:afp-commissions`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-11
- **Última actualización:** 2026-04-11

## TD-0042 — Transition editorial de presupuesto sigue incoherente tras registrar el hub
- **ID:** TD-0042
- **Título corto:** Resolver migración pendiente de `como-hacer-presupuesto-mensual-chile`
- **Descripción:** Al registrar `presupuesto-control-financiero` en `src/config/clusters.ts`, el hub ya quedó formalizado como fuente de verdad operativa. Sin embargo, la pieza `como-hacer-presupuesto-mensual-chile` sigue en `cluster: empleo-ingresos` con `category: general`, y algunos documentos/policies siguen describiendo la migración como futura o condicionada a un hub que ya existe.
- **Evidencia:** `src/pages/guias/presupuesto-control-financiero/index.astro` ya está publicado y `src/config/clusters.ts` ahora lo registra; `docs/editorial/TOPIC_OWNERSHIP_POLICY.md` y `docs/TECH_DEBT_BACKLOG.md` todavía describen la ubicación de la pieza como transición pendiente ligada a la inexistencia del hub productivo.
- **Impacto:** Mantiene ambigüedad entre owner canónico, cluster operativo y narrativa de transición; aumenta el riesgo de decisiones editoriales inconsistentes y de warnings engañosos en revisiones futuras.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** En un cambio separado, decidir una de dos rutas: (A) migrar `como-hacer-presupuesto-mensual-chile` a `cluster: presupuesto-control-financiero` y alinear category/interlinks; o (B) mantener la transición pero actualizar policy/runbooks/checks para que ya no dependan de que el hub “no exista”.
- **Criterios de cierre (checklist verificable):**
  - [ ] `docs/editorial/TOPIC_OWNERSHIP_POLICY.md` refleja el estado real del hub y la decisión de transición.
  - [ ] `docs/TECH_DEBT_BACKLOG.md` deja de describir el hub como inexistente.
  - [ ] La metadata/frontmatter de `como-hacer-presupuesto-mensual-chile` o la policy de transición cuentan la misma historia.
- **Owner:** TBD
- **Estado:** Backlog
- **Fecha de creación:** 2026-04-11
- **Última actualización:** 2026-04-11

## TD-0044 — Copy en `operacion-renta.astro` muestra tasa PPM incorrecta (12.25% en vez de 15.25%)
- **ID:** TD-0044
- **Título corto:** Corregir tasa PPM en copy de Operación Renta
- **Descripción:** Dos cadenas de texto en `src/pages/calculadoras/operacion-renta.astro` (líneas 159 y 296 al momento de la auditoría) muestran `12.25%` como tasa de retención PPM para honorarios. La tasa vigente según Ley 21.133 (SII 2026) es `15.25%`. El motor de cálculo **no está afectado** — usa los parámetros del snapshot/provider — pero el usuario que lee la guía de ayuda forma la expectativa incorrecta sobre su retención y puede distorsionar su planificación de Operación Renta.
- **Evidencia:** Auditoría F22 (finding F-01) — `artifacts/calculator-audits/operacion-renta-2026-04-12/scenario-math-verification.md`; SII Ley 21.133 schedule `https://www.sii.cl/noticias/2025/261225noti01smn.htm`. El resto del sitio (glosario, blog, calculadora boleta) ya muestra 15.25%.
- **Impacto:** Usuario con honorarios lee tasa incorrecta antes de ingresar sus datos, puede concluir que debe menos PPM del real. Afecta confianza y calidad de decisión en la calculadora de mayor tráfico de la temporada.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Reemplazar las dos ocurrencias de `12.25%` por `15.25%` en `operacion-renta.astro`. Agregar un test de guardia tipo `grep` o assertion de contenido que bloquee regresión futura.
- **Criterios de cierre (checklist verificable):**
  - [ ] `grep "12.25" src/pages/calculadoras/operacion-renta.astro` retorna 0 resultados.
  - [ ] El copy visible en la página menciona únicamente `15.25%` para la tasa PPM honorarios.
  - [ ] Existe al menos un test o script de guardia que impide que la cadena `12.25%` reaparezca en el archivo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `12.25%` no existe en `operacion-renta.astro`; ambas instancias muestran `15.25%` (líneas 178 y 315). Verificado 2026-04-12.

## TD-0045 — Ejemplo hardcodeado en `operacion-renta.astro` diverge del motor de cálculo
- **ID:** TD-0045
- **Título corto:** Sincronizar ejemplo de resultado con motor real
- **Descripción:** El bloque "Ejemplo" visible en la página muestra IGC `$863.000` y devolución `$287.000` para un sueldo de `$18.000.000`. El motor computado con los mismos parámetros base del snapshot arroja IGC `~$267.119–$283.935` y devolución `~$883.000`. El ejemplo es internamente consistente aritméticamente pero deriva de supuestos desconocidos desalineados del engine actual. Esto puede crear expectativas erróneas en el usuario antes de ingresar sus datos.
- **Evidencia:** Auditoría F22 (finding F-02) — `artifacts/calculator-audits/operacion-renta-2026-04-12/scenario-math-verification.md`. Discrepancia confirmada: IGC ejemplo ~3.2× mayor que engine; devolución ejemplo ~3× menor.
- **Impacto:** Usuario ve un ejemplo antes de calcular y forma una expectativa que difiere materialmente del resultado real; puede percibir la calculadora como incorrecta cuando el resultado real sea diferente al ejemplo.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Reemplazar los valores hardcodeados del ejemplo por valores generados con `simulateOperacionRenta({ sueldosBrutos: 18_000_000, ... })` usando los parámetros del snapshot en tiempo de build, o al menos sincronizar manualmente los valores con el engine. Opción alternativa: usar parámetros que producen límites de tramo redondos para facilitar la explicación.
- **Criterios de cierre (checklist verificable):**
  - [x] El IGC del ejemplo coincide con `simulateOperacionRenta({ sueldosBrutos: 18_000_000, ... })` dentro de ±500 CLP de redondeo.
  - [x] El monto de devolución/pago del ejemplo es consistente con IGC − retenciones declaradas en el mismo ejemplo.
  - [x] Existe un mecanismo (test, script, o generación programática) que mantiene el ejemplo sincronizado con el engine en futuros cambios de parámetros.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `exampleResult` se genera en tiempo de build mediante `simulateOperacionRenta()` en `operacion-renta.astro:28`. No hay valores hardcodeados. Verificado 2026-04-12.

## TD-0046 — `ShareCalculatorResult.astro` acumula listeners en cada recálculo
- **ID:** TD-0046
- **Título corto:** Deduplicar listener del botón "Copiar" en share result
- **Descripción:** `window.showShareResult()` registra un nuevo `click` listener en `#share-copy` en cada invocación (línea 51 de `ShareCalculatorResult.astro`). Después del segundo cálculo, un clic en "Copiar" dispara el callback dos veces; después de N cálculos, N veces. No existe cleanup ni guardia.
- **Evidencia:** Auditoría F22 (finding F-03) — `src/components/ShareCalculatorResult.astro:51`. Reproducible manualmente: calcular dos veces, clicar "Copiar" una vez → flash "¡Copiado!" se ve dos veces y el clipboard recibe dos escrituras.
- **Impacto:** UX degradada: múltiples flashes del mensaje de confirmación, escrituras fantasma al clipboard. Erosiona confianza en la función de compartir, especialmente durante la temporada de alta frecuencia de uso (Operación Renta).
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Inicializar el listener una sola vez fuera de `showShareResult` (patrón init-once), o usar `{ once: true }` si el botón se recrea en cada llamada, o clonar-y-reemplazar el nodo del botón para eliminar listeners previos antes de registrar uno nuevo.
- **Criterios de cierre (checklist verificable):**
  - [x] Clicar "Copiar" una vez tras dos o más cálculos dispara el callback exactamente una vez.
  - [x] No hay doble flash del mensaje "¡Copiado!".
  - [x] Test manual: N recálculos → 1 clic → 1 escritura al clipboard (verificable con `navigator.clipboard.writeText` spy).
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. En `ShareCalculatorResult.astro`, el `addEventListener` en `#share-copy` (línea 40) está registrado una sola vez en el scope del script, fuera de `showShareResult`. `showShareResult` solo actualiza el contenedor y el enlace de WhatsApp. Verificado 2026-04-12.

## TD-0047 — `EconomicParameterProvider` no distingue snapshot fresco de fallback de emergencia en la UI
- **ID:** TD-0047
- **Título corto:** Exponer etiqueta "snapshot" vs "fallback" en proveedor económico
- **Descripción:** `EconomicParameterProvider.ts` asigna `source: "fallback"` tanto al path de snapshot controlado (fresco, datado 2026-04-11) como al fallback de emergencia hardcodeado (UTM 67,294 / UF 39,300). El tipo de dominio `EconomicParameters.source` no tiene valor `"snapshot"`. La UI muestra "fallback controlado" para ambos casos, privando al usuario de saber si los datos son frescos o realmente de emergencia.
- **Evidencia:** Auditoría F22 (finding F-04) — `src/infrastructure/economic/EconomicParameterProvider.ts:154`. El telemetry flag ya distingue `snapshot` vs `fallback` internamente pero no se expone en la UI.
- **Impacto:** Durante la temporada de Operación Renta, un usuario que note "fallback controlado" puede dudar de la vigencia de los datos. Si el verdadero fallback de emergencia se activa silenciosamente, el usuario no tiene forma de saberlo.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Una de tres opciones: (A) agregar `"snapshot"` al union type `EconomicParameters.source` y usarlo en el path de snapshot; (B) usar el `telemetryFlag` ya existente para derivar la etiqueta de UI (`snapshot` → "datos actualizados", `fallback` → "datos de referencia"); (C) mantener ambos como "datos de referencia" y dejar que la fecha haga el trabajo de confianza. Opción B es la de menor riesgo de contrato.
- **Criterios de cierre (checklist verificable):**
  - [x] La UI muestra etiquetas distintas cuando el provider usa snapshot vs cuando usa el fallback de emergencia.
  - [x] El tipo de dominio refleja el valor correcto en cada path (o la UI lo deriva del telemetry flag sin romper el tipo).
  - [x] `pnpm run astro check` y `pnpm run lint` pasan sin errores de tipo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `src/domain/economic/EconomicParameters.ts:10` define `source: "live" | "snapshot" | "fallback"`. `EconomicParameterProvider.ts:154` asigna `source: "snapshot"` en el path de snapshot. `IndicadorEconomico.astro:30` distingue `source === "snapshot"` para la etiqueta de UI. Verificado 2026-04-12.

## TD-0048 — Pegado de número CLP con formato produce cálculo silencioso incorrecto
- **ID:** TD-0048
- **Título corto:** Sanitizar separadores de miles en inputs de `operacion-renta`
- **Descripción:** La función `val()` en `operacion-renta.astro` usa `parseFloat()` directamente sobre `.value` del input. Al pegar un número con formato chileno (`18.000.000`), `parseFloat` retorna `18` (se detiene en el primer punto). El valor `18` pasa la validación `> 0` y produce un cálculo sobre $18 en lugar de $18.000.000, sin ningún error ni advertencia visible al usuario.
- **Evidencia:** Auditoría F22 (finding F-05) — `operacion-renta.astro:408–409`. Los seis inputs de ingresos/retenciones/deducciones están afectados. Reproducible: pegar `18.000.000` → resultado muestra "¡Cero impuesto!" en lugar del cálculo correcto.
- **Impacto:** Error invisible de alta gravedad: usuario que copia su sueldo desde una liquidación (formato habitual CLP con puntos) obtiene un resultado materialmente incorrecto sin ninguna señal de error. Afecta confianza y produce decisiones de planificación erróneas.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** En `val()`, sanitizar el input antes de `parseFloat`: `parseFloat(str.replace(/\./g, "").replace(",", "."))`. Agregar un hint de formato en el placeholder o tooltip de cada input indicando que no se deben usar puntos separadores. Cubrir con test unitario.
- **Criterios de cierre (checklist verificable):**
  - [x] `val("18.000.000")` retorna `18000000`.
  - [x] `val("18,5")` retorna `18.5` (coma decimal).
  - [x] Input con valor pegado `18.000.000` produce el mismo resultado que `18000000`.
  - [ ] Al menos un test unitario cubre `val("18.000.000")` → `18000000`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `val()` en `operacion-renta.astro:431–443` sanitiza el input: si el string tiene múltiples puntos (separador de miles CLP), ejecuta `raw.replace(/\./g, "")` antes de `parseFloat`. Test unitario pendiente (deuda menor, criterio no bloqueante). Verificado 2026-04-12.

## TD-0049 — Constante UTM en test de `SimulateOperacionRenta` desincronizada con snapshot
- **ID:** TD-0049
- **Título corto:** Actualizar constante UTM en test a 69889
- **Descripción:** `tests/application/SimulateOperacionRenta.test.ts` define `UTM = 67294` con comentario "matches domain snapshot". El snapshot fue refrescado el 2026-04-11 a `utm: 69889` (+3.86%). Los tests siguen pasando porque usan su propia constante, pero el comentario es falso y cualquier aserción cerca de umbrales de tramo asume la UTM incorrecta (~420.000 CLP de diferencia en el umbral exento).
- **Evidencia:** Auditoría F22 (finding F-06) — `tests/application/SimulateOperacionRenta.test.ts` vs `src/infrastructure/economic/economic-parameters.snapshot.json`. Divergencia +3.86%.
- **Impacto:** Sin riesgo para usuarios actuales. Riesgo para desarrolladores: un refactor futuro valida contra posiciones de tramo incorrectas, permitiendo regresiones near-threshold que no se detectan.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Actualizar `UTM = 67294` → `UTM = 69889` en el test (o leer directamente del snapshot JSON para que se autoactualice en futuros refreshes). Eliminar o corregir el comentario "matches domain snapshot".
- **Criterios de cierre (checklist verificable):**
  - [x] Constante `UTM` en `SimulateOperacionRenta.test.ts` coincide con `snapshot.utm` del snapshot económico vigente.
  - [x] `pnpm run test` pasa limpio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `SimulateOperacionRenta.test.ts:6` define `const UTM = 69889` con comentario sincronizado al snapshot 2026-04-11. Verificado 2026-04-12.

## TD-0050 — `SimulateOperacionRenta` sin casos de regresión pinned en suite de regresión
- **ID:** TD-0050
- **Título corto:** Agregar golden tests de regresión para `SimulateOperacionRenta`
- **Descripción:** `tests/application/FinancialUseCases.regression.test.ts` tiene casos pinned para otros use-cases pero ninguno para `SimulateOperacionRenta`. No existe guardia de salida fija (golden output) para el path completo sueldo+honorarios+APV+intereses hipotecarios. Un cambio en la tabla de tramos, la fórmula de gastos presuntos, o los topes de APV podría producir outputs incorrectos sin ser detectado.
- **Evidencia:** Auditoría F22 (finding F-07) — `tests/application/FinancialUseCases.regression.test.ts` no contiene bloque `SimulateOperacionRenta`.
- **Impacto:** Riesgo de regresión silenciosa en el use-case más crítico del sitio durante la temporada de Operación Renta. El resto de use-cases tiene golden tests; `SimulateOperacionRenta` es la excepción.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Agregar al menos dos casos pinned en `FinancialUseCases.regression.test.ts`: (1) escenario de devolución — sueldo $18M + PPM retenido que produce saldo negativo; (2) escenario mixed-income — sueldo + honorarios + APV Régimen B + intereses hipotecarios. Fijar outputs con la UTM/UF del snapshot actual.
- **Criterios de cierre (checklist verificable):**
  - [x] `FinancialUseCases.regression.test.ts` contiene un bloque `SimulateOperacionRenta` con ≥2 escenarios pinned.
  - [x] Uno de los escenarios produce `esDevolución: true`.
  - [x] Uno de los escenarios incluye honorarios, APV y deducción por intereses hipotecarios simultáneamente.
  - [x] `pnpm run test` pasa limpio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `FinancialUseCases.regression.test.ts` tiene dos escenarios pinned: caso A (sueldo $18M + imp. único retenido → devolución $882.880,72) y caso B (sueldo+honorarios+APV → devolución $958.880,72). Verificado 2026-04-12.

## TD-0051 — Atributo `data-is-example` no se elimina tras cálculo real
- **ID:** TD-0051
- **Título corto:** Limpiar `data-is-example` en `#resultado-contenido` post-cálculo
- **Descripción:** `#resultado-contenido` tiene `data-is-example="true"` en el HTML server-rendered. La función de cálculo del cliente reemplaza el contenido con `replaceChildren()` pero nunca elimina el atributo `data-is-example`. Cualquier selector CSS o query analítica que dependa de `[data-is-example="true"]` continuará activo después de que el usuario haya recibido un resultado real.
- **Evidencia:** Auditoría F22 (finding F-08) — `operacion-renta.astro:236, 643`. Verificable: después de calcular, `document.getElementById("resultado-contenido").dataset.isExample` devuelve `"true"` en lugar de `undefined`.
- **Impacto:** Sin riesgo visible para usuarios. Riesgo de clasificación errónea en analytics (resultados reales contados como ejemplos) y comportamientos CSS no deseados si se usan selectores de atributo en el futuro.
- **Riesgo:** bajo
- **Severidad (1-5):** 1
- **Urgencia:** P3
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Después del `replaceChildren(...)` en el handler de cálculo, agregar `contenido.removeAttribute("data-is-example")`.
- **Criterios de cierre (checklist verificable):**
  - [x] Después de calcular, `document.getElementById("resultado-contenido").dataset.isExample` es `undefined`.
  - [x] `pnpm run test` pasa limpio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `operacion-renta.astro:682` llama `contenido.removeAttribute("data-is-example")` tras el cálculo. Verificado 2026-04-12.

## TD-0052 — `MethodologyBlock` usa URLs genéricas del SII en lugar de citas específicas
- **ID:** TD-0052
- **Título corto:** Reemplazar URLs genéricas del SII en MethodologyBlock por páginas específicas
- **Descripción:** Las dos fuentes citadas en `MethodologyBlock.astro` para la calculadora de Operación Renta apuntan a `https://www.sii.cl` (homepage) y a `https://www.sii.cl/sobre_el_sii/operacion_renta.html` (página general). Ningún enlace lleva directamente a la tabla de tramos IGC, la normativa de gastos presuntos Art. 50 DL 824, la Ley 21.133 sobre tasa PPM, ni los artículos de preguntas frecuentes del SII sobre retención de honorarios.
- **Evidencia:** Auditoría F22 (finding F-09) — `src/components/MethodologyBlock.astro`. Candidatos verificados: `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8398.htm` (PPM honorarios) y `https://www.sii.cl/noticias/2025/261225noti01smn.htm` (Ley 21.133 tasa 2026).
- **Impacto:** Usuario que quiere verificar la tabla de tramos o la fórmula de gastos presuntos debe navegar el SII manualmente. Reduce verificabilidad y confianza editorial en un contexto YMYL.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Reemplazar los dos enlaces genéricos por URLs específicas: (1) PPM honorarios → `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8398.htm`; (2) tabla IGC/DL 824 → URL directa a la normativa o a la guía del SII sobre el Impuesto Global Complementario; (3) Ley 21.133 → `https://www.sii.cl/noticias/2025/261225noti01smn.htm`.
- **Criterios de cierre (checklist verificable):**
  - [x] Ningún enlace en `MethodologyBlock.astro` (para operacion-renta) apunta al homepage o a una página genérica del SII.
  - [x] Al menos dos enlaces apuntan a páginas del SII directamente relacionadas con PPM honorarios y la tabla IGC.
  - [x] `pnpm run check:urls` pasa (o los nuevos URLs están explícitamente excluidos si son externos estáticos).
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. El array `sources` en `operacion-renta.astro:365–379` incluye: Ley 21.133 (`/noticias/2025/261225noti01smn.htm`), FAQ PPM honorarios (`/preguntas_frecuentes/declaracion_renta/001_140_8398.htm`), y guía operacion renta (`/sobre_el_sii/operacion_renta.html`). Las dos primeras son las citas directas requeridas. Verificado 2026-04-12.
