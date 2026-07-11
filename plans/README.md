# Implementation Plans

Auditoría inicial: `/improve deep` el 2026-06-11 (commit `8256c9d2`) → planes 001–019.
Re-auditoría: `/improve deep` el 2026-06-15 (commit `57ad5261`) → planes 020–023.
Follow-through de auditorías externas: `/improve` el 2026-06-17 (commit `fd2b5dff`) → planes 024–026.
Tercera auditoría profunda: `/improve deep` el 2026-06-19 (commit `9a4eb37d`) → planes 027–030.
Cuarta auditoría profunda: `/improve deep` el 2026-06-26 (commit `a7bb8b2e`) → planes 032–034.
Quinta auditoría profunda: `/improve deep` el 2026-07-10 (commit `520a8685`) → planes 035–038.
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

Los planes abajo vienen de la quinta auditoría profunda (035–038) y de la
revisión de datos de tráfico que le siguió (039–041, mismo commit `520a8685`,
2026-07-10, a pedido del usuario tras la quinta auditoría; origen: los
scorecards y exports reales en `output/operations/`). Originalmente siete;
**035, 037 y 039 ya están DONE y archivados** (ver arriba — 039 parcialmente,
con su typo residual desglosado en el plan 042, añadido a esta tabla). El plan
043 se sumó el 2026-07-11 como *carve-out* de 038 (ver nota de bloqueo abajo).
Se listan en **un único orden de ejecución recomendado** — no dos lotes
separados — con una excepción dura: 036 y 038 editan el mismo archivo
(`workers/analytics-collector/src/index.ts`) y deben correr en serie; 043
depende de que 038 esté mergeado primero (extiende su mismo scaffolding); todo
lo demás es paralelizable entre sí.

> **Recordatorio de cierre**: en cuanto un plan de esta tabla pase a `DONE`,
> deja de aparecer aquí — su archivo se mueve a
> [`plans/archive/`](archive/README.md) de forma automática, en la misma
> unidad de cambio que lo cierra (ver "Política obligatoria de cierre y
> archivo" arriba). Esta tabla nunca debe mostrar una fila en estado `DONE`.

| Orden | Plan | Título | Prioridad | Esfuerzo | Riesgo | Paralelizable con | Estado |
|---|------|--------|-----------|----------|--------|--------------------|--------|
| 1 | [038](038-analytics-freeform-dimension-shape.md) | Restringir la forma de dimensiones libres de analytics (cardinalidad/poisoning) — **alcance revisado: 3 de 4 claves** | P3 | S | LOW | 041, 040, 042 — no 036 (mismo archivo) | **IN PROGRESS** (aprobado, pendiente de merge) |
| 2 | [036](036-analytics-export-failure-detection.md) | Hacer detectable un export de analytics ausente/fallido (clase de fallo OBS-01) | P2 | M | MED | 041, 040, 042 — no 038 (mismo archivo) | TODO |
| 3 | [041](041-impuesto-cls-load-shift.md) | Corregir CLS de carga en `impuesto-segunda-categoria` (swap de resultado por prefill) | P2 | S–M | LOW | todos | TODO |
| 4 | [040](040-seo-title-snippet-refresh-brief.md) | Brief SEO title/snippet (evidencia + candidatos + firma humana) — valor esperado degradado con honestidad | P3 | S | LOW | todos | TODO |
| 5 | [042](042-remove-calculator-completed-typo-event.md) | Quitar el evento typo `calculator_completed` de 8 archivos + 2 tests que lo fijan (código muerto, cero impacto en métricas) | P3 | S | LOW | todos | TODO |
| 6 | [043](043-analytics-item-id-shape-decision.md) | Decidir y aplicar la forma segura de `item_id` (carve-out de 038; requiere firma humana en Step 1) | P3 | S | LOW–MED | ninguno — depende de 038 mergeado | TODO |

> **035 y 037 archivados** (ver [`Completados — archivados`](#completados--archivados) abajo) — ya no aparecen en esta tabla.

**Por qué este orden:**
- **035, 039 y 037 ya ejecutados** (ver notas abajo): máxima prioridad/mayor
  confianza primero, e independientes de todo lo demás — no había razón para
  esperar.
- **1–2 (038 → 036) van juntos y en ese orden**: ambos tocan
  `workers/analytics-collector/src/index.ts`, así que no son paralelizables
  entre sí. El drift-check de cada plan importa más aquí porque se apilan
  sobre el mismo archivo (recordar: 037 ya mergeado, re-correr el drift-check
  de 038/036 contra el `index.ts` actual, no contra el commit `520a8685`
  original).
- **3 (041)** es independiente y de riesgo bajo; puede adelantarse en
  paralelo con cualquiera de los anteriores sin conflicto.
- **4 (040) va último a propósito**: es un *brief de decisión*, no un fix de
  código — se detiene en la compuerta de firma humana del copy (Step 4) y no
  debe bloquear el resto del trabajo técnico.
- **6 (043) va último**: depende de que 038 esté mergeado (extiende su mismo
  scaffolding de constantes) y es en sí mismo un *brief de decisión* — se
  detiene en una compuerta de firma humana (Step 1) antes de tocar código.

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
> **Segundo despacho (038 revisado) — APROBADO, pendiente de merge:**
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
> positivos y negativos reales. **No mergeado a `main`** — por política de
> este repo (`plans/README.md`, sección de cierre) un plan no se considera
> terminado hasta estar integrado en `main`; fusionar es decisión del
> operador. Rama y worktree quedan disponibles para revisión/merge manual.

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

Movidos a [`plans/archive/`](archive/README.md). Todos DONE y mergeados en `main`.

### Quinta auditoría profunda 2026-07-10

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [035](archive/035-gsc-inspect-abort-on-mass-failure.md) | Abortar `gsc-inspect` antes de escribir cuando la mayoría de inspecciones fallan (no sobrescribir con 0% indexado) | P1 | S | DONE (commit `a86f88eb`) |
| [039](archive/039-calculator-funnel-instrumentation.md) | Reparar instrumentación del embudo (views=0, completes sobre-contados, evento typo) | P1 | M | DONE parcial (commit `a661e61a`) — typo residual desglosado en [042](042-remove-calculator-completed-typo-event.md) |

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
