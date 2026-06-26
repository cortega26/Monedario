# Implementation Plans

Auditoría inicial: `/improve deep` el 2026-06-11 (commit `8256c9d2`) → planes 001–019.
Re-auditoría: `/improve deep` el 2026-06-15 (commit `57ad5261`) → planes 020–023.
Follow-through de auditorías externas: `/improve` el 2026-06-17 (commit `fd2b5dff`) → planes 024–026.
Tercera auditoría profunda: `/improve deep` el 2026-06-19 (commit `9a4eb37d`) → planes 027–030.
Cuarta auditoría profunda: `/improve deep` el 2026-06-26 (commit `a7bb8b2e`) → planes 032–034.
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

Ejecutar en el orden de la tabla salvo que las dependencias indiquen lo contrario.
Cada ejecutor debe leer el plan completo y honrar sus condiciones de STOP.

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

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|--------|-----------|----------|------------|--------|
| [033](033-calculator-datemodified-from-lastmod-index.md) | `dateModified` de calculadoras desde `page-lastmod-index.json` (quitar literal congelado) | P3 | S | — | TODO |
| [034](034-conversor-uf-historic-fetch-error-state.md) | Error real (no «Cargando…» eterno) al fallar la carga del histórico UF | P3 | S | — | TODO |

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

Movidos a [`plans/archive/`](archive/README.md). Todos DONE y mergeados en `main`.

### Auditorías 2026-06-15 a 2026-06-19

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [031](archive/031-iva-calculator-backlinks.md) | Backlinks internos a la calculadora de IVA (glosario + post) | P3 | S | DONE (commit `fcdf551c`) |
| [032](archive/032-calculator-accessibility-semantics.md) | A11y de calculadoras: foco al resultado, asociación hint/error, foco visible en radios | P2 | M | DONE (commit `702b7cc2`) |
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
