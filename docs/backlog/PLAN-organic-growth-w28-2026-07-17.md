# Plan de crecimiento orgánico y SEO — activación W28

> **Instrucciones para la sesión ejecutora:** lee este documento completo antes
> de tocar archivos. Este plan **no reemplaza** a
> `PLAN-calculator-led-growth-2026-06-28.md` (el plan maestro): lo **activa** con
> la evidencia de la semana ISO 2026-W28. La gobernanza, los invariantes, los
> gates y las condiciones de `STOP` del plan maestro siguen vigentes y mandan
> sobre este documento en caso de conflicto. Si una premisa de W28 quedó
> invalidada por datos posteriores, registra el drift y detente antes de ejecutar.

## Estado

- **Estado general:** TODO — pendiente de sign-off del owner
- **Prioridad:** P0/P1 estratégica (orgánico/SEO)
- **Esfuerzo:** M, dividido en workstreams independientes y pequeños
- **Riesgo:** MED — YMYL, contrato de URL y congelamiento OBS-01 activo
- **Categoría:** SEO / GEO / performance / indexación
- **Planned at:** 2026-07-17
- **Informe fuente:** `output/operations/weekly-search-performance/2026-W28/traffic-seo-geo-report/report.html`
  (ventana 2026-07-06 → 2026-07-12)
- **Plan maestro:** `docs/backlog/PLAN-calculator-led-growth-2026-06-28.md`
- **Owner de decisión:** Carlos Ortega

---

## 0. Relación con el plan maestro (leer primero)

Este plan es la **capa de ejecución SEO/GEO** de la evidencia W28. No abre una
pista de gobernanza paralela. Cada workstream aterriza en una fase ya definida
del plan maestro:

| Workstream de este plan | Fase del plan maestro | Estado del gate |
|---|---|---|
| WS-1 Experimento de intención UTM | `PR-04` striking-distance | Superficie **fuera** del cohorte congelado → habilitable |
| WS-2 Triage de 27 URLs no indexadas | `PR-04` frescura / indexación | Habilitable (read-only + selección) |
| WS-3 Diagnóstico de `seguro-cesantia` | `PR-04` losers | **Solo lectura** durante OBS-01 (tool congelada) |
| WS-4 Incidente LCP/CLS `impuesto-segunda-categoria` | Guardrails CWV §9 del maestro | Habilitable (performance, no journey) |
| WS-5 Baseline GEO | `OPS-01` | Habilitable (medición, sin construir) |

**Restricción dura heredada del maestro:** OBS-01 quedó `INCONCLUSIVE` el
2026-07-12 (instrumento de funnel roto toda la ventana; congelamiento violado
sobre `seguro-cesantia`). El reloj limpio reinició el 2026-07-12; primera
reevaluación estimada **2026-07-26**. Hasta cerrar OBS-01 con baseline válido,
**ninguna edición de journey/title/meta/formulario/CTA** sobre las cuatro tools
del cohorte (`seguro-cesantia`, `operacion-renta`, `prepago-credito`,
`credito-consumo`). Este plan respeta ese congelamiento por construcción: todas
las intervenciones editables caen en superficies **fuera** del cohorte.

---

## 1. Lectura de la evidencia W28

| Señal | W27 | W28 | Lectura |
|---|---:|---:|---|
| Clics orgánicos (Google) | 497 | **498** (+1) | Plateau de captura |
| Impresiones | 82.740 | **94.443** (+14,1%) | La demanda sigue creciendo |
| CTR agregado | 0,601% | **0,527%** | Compresión de CTR, no caída de demanda |
| Indexación (URL Inspection) | — | **157/184 (85,3%)** | Sano; 27 crawled-not-indexed |
| Pageviews (Cloudflare) | 16.383 | 14.919 | CDN, no equivale a sesiones |

**El plateau está concentrado, no es sistémico.** `/calculadoras/conversor-utm/`
generó **77.088 impresiones (≈82% del total) y 268 clics (≈54% del total)**, con
un CTR de **≈0,35%**. El resto del portafolio **ganó** clics:

- `/calculadoras/credito-consumo/`: 20 clics (**+13**) — *congelada*
- `/calculadoras/prepago-credito/`: 32 clics (**+8**) — *congelada*
- `/calculadoras/deposito-a-plazo/`: 8 clics (**+8**) — *editable*
- `/guias/impuestos-personas/operacion-renta/`: 20 clics (**+5**) — *congelada*
- `/calculadoras/seguro-cesantia/`: 89 clics (**−36**) — *congelada, mayor pérdida*

**Incidente de rendimiento:** `/calculadoras/impuesto-segunda-categoria/` con
p75 LCP **4,779 s** y CLS **0,119** (30 muestras RUM). La hipótesis especulativa
de CLS quedó **refutada** en el informe; falta causa medida.

**Conclusión operativa:** el problema no es falta de inventario ni "SEO caído".
Es (a) una superficie de altísimo volumen y bajísima captura cuyo intent hay que
clasificar antes de tocar, y (b) higiene de cola larga (indexación, un loser, un
incidente CWV, baseline GEO). La respuesta correcta es **experimentación
gobernada y medición**, no reescritura masiva.

---

## 2. Tesis y principios

1. **No reescribir en bloque.** El informe lo dice explícitamente. Una variable y
   una URL por vez.
2. **Clasificar intención antes de editar.** Especialmente en UTM: buena parte de
   su demanda puede ser *valor-actual / zero-click* ("valor UTM hoy") que Google
   resuelve en el snippet. Subir CTR ahí no siempre es posible ni deseable.
3. **Medir antes de construir.** GEO no recibe URLs, schema ni `llms.txt` nuevos
   hasta que un baseline muestre una brecha real.
4. **El éxito SEO se mide con GSC, no con el funnel.** El instrumento de eventos
   first-party está en reparación (OBS-01). Métrica primaria de este plan:
   clics, CTR y posición de GSC por URL. El funnel es señal de priorización, no
   KPI de conversión.
5. **Respetar el congelamiento OBS-01.** Sobre las tools congeladas solo se
   diagnostica; no se edita.

---

## 3. Restricciones e invariantes a preservar

- `URL.PUBLIC.NO_POST_ID` — nunca derivar URL pública desde `post.id`.
- `ROUTES.NO_SILENT_CHANGES` — ningún cambio de slug sin snapshot de ruta/RSS + ADR.
- `RSS.NO_REMOVALS`.
- `FRONTMATTER.VALID`.
- `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` — nadie redacta y audita/cumple la
  misma pieza YMYL en la misma sesión; los gates de `07-publish-packet.md` no se
  marcan por IA.
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION` — no crear superficie nueva.
- `CONTRACT.YMYL_RESPONSE_STRUCTURE` — todo copy YMYL pasa por el pipeline editorial.
- **Cohorte congelado OBS-01:** `seguro-cesantia`, `operacion-renta`,
  `prepago-credito`, `credito-consumo` — solo lectura hasta cierre de OBS-01.

Ninguna acción de este plan crea una URL pública nueva, cambia una fórmula
financiera ni personaliza recomendaciones.

---

## 4. Workstreams

### WS-1 — Experimento gobernado de intención en el conversor UTM

**Por qué es la palanca mayor:** 82% de las impresiones y 54% de los clics del
sitio, con CTR ≈0,35%. Es la única superficie donde un cambio de captura mueve el
agregado. **No está en el cohorte congelado**, por lo que es el lugar limpio para
el "único experimento UTM gobernado de 28 días" que recomienda el informe.

**Gate de entrada:** baseline GSC de ≥4 semanas por URL (existe: W25–W28).

**Superficie:** `/calculadoras/conversor-utm/` (y, si aplica, su artículo/owner
UTM). **No** tocar las tools del cohorte.

**Pasos:**

1. **Clasificar el query set** del conversor en cuatro clases y ponderar por
   impresiones:
   - *valor-actual / zero-click* ("valor UTM hoy", "UTM julio 2026");
   - *cálculo / conversión click-worthy* ("cuánto es X UTM en pesos");
   - *oficial / navegacional* ("UTM SII");
   - *informacional / explicativo* ("qué es la UTM").
   ```bash
   pnpm run data-signals:gsc:local -- --week=2026-W28
   pnpm run audit:striking-distance
   ```
2. **Cuantificar el techo real de captura.** Si la mayoría del volumen es
   zero-click, el objetivo NO es CTR: es (a) asegurar que el valor vigente
   aparezca correcto en el snippet y (b) capturar la fracción click-worthy con
   un título/meta que prometa el cálculo, no solo el dato.
3. **Diseñar un solo experimento**, una variable y una URL:
   - hipótesis, clase de intención objetivo, métrica primaria por clase,
     guardrail y fecha;
   - registrar baseline de 28 días **antes** de editar;
   - cambiar title/meta/apertura **o** internal linking — no todo a la vez.
4. **Frescura sin mentir "hoy":** el valor vigente debe venir del snapshot o ser
   texto evergreen que remita a la tool; ejemplos históricos claramente
   etiquetados; `validAsOf`/`updatedDate` vía pipeline.

**Métrica primaria (GSC, a 28 días):** clics y CTR de la clase *click-worthy*;
para la clase zero-click, corrección del snippet, no CTR.

**Guardrails:** revertir si los clics caen >20% con impresiones estables sin
explicación; posición no empeora más de 2 puestos; sin regresión CWV/a11y.

**STOP:** si el copy es YMYL y no puede pasar pipeline + separación de deberes;
si el cambio exige tocar una tool congelada o una URL nueva.

---

### WS-2 — Triage de las 27 URLs crawled-not-indexed (portafolio, no bloque)

**Gate de entrada:** ninguno; es lectura + clasificación.

**Pasos:**

1. Extraer las 27 URLs del artefacto de inspección W28
   (`output/operations/data-signals/gsc/2026-W28-url-inspection.json`).
2. **Clasificar cada una** en exactamente una categoría:
   - **estratégica** — owner de un JTBD con demanda; merece intervención;
   - **utility-complete** — cumple su función, thin por naturaleza (zero-click);
     no requiere acción, solo registro;
   - **insuficiente** — thin/redundante/canibaliza; candidata a consolidación o
     `noindex` deliberado, nunca borrado silencioso de ruta.
3. **Seleccionar como máximo 1–3 intervenciones** sobre las estratégicas. Sin
   reescritura masiva y **sin solicitudes de indexación en lote**.
4. Antes de cualquier consolidación de URL, correr los gates de contrato:
   ```bash
   pnpm run audit:cannibalization
   pnpm run audit:topic-overlap
   pnpm run check:routes
   pnpm run check:rss
   ```

**Métrica primaria:** de las 1–3 seleccionadas, transición a *Indexed* en URL
Inspection dentro de 2–4 semanas.

**STOP:** si una intervención implica cambiar/retirar una ruta pública →
requiere snapshot de ruta/RSS + ADR (`ROUTES.NO_SILENT_CHANGES`).

---

### WS-3 — Diagnóstico read-only de `seguro-cesantia` (−36 clics)

**Es la mayor pérdida y está congelada.** No se edita. Se diagnostica y se
escala.

**Pasos:**

1. Comparar W27 vs W28: query pulse, posición media, CTR y mix de SERP de la URL.
2. **Aislar la causa candidata:** el cambio de title/description del plan 040
   (`d6003846`, desplegado 2026-07-12, violación de congelamiento registrada en
   OBS-01) cae al final de la ventana W28; su efecto real se verá en **W29**.
   Confirmar en el corte W29 si el nuevo title degradó CTR/posición.
3. Distinguir pérdida por **demanda** (estacionalidad/query volume ↓) vs pérdida
   por **captura** (posición/CTR ↓ con impresiones estables).

**Salida:** nota de diagnóstico en el corte W29 + una **pregunta de decisión**
para Carlos (ver §6): ¿el baseline reiniciado acepta el nuevo title como punto de
partida o se revierte al title previo antes de cerrar OBS-01?

**STOP inmediato:** cualquier edición sobre la tool antes del cierre de OBS-01.

---

### WS-4 — Incidente de rendimiento LCP/CLS en `impuesto-segunda-categoria`

**Gate de entrada:** ninguno; performance no toca journey ni copy YMYL.

Campo (30 muestras RUM): p75 LCP **4,779 s** (Google: *poor* > 4,0 s) y CLS
**0,119** (*needs improvement*). El guardrail sintético interno del maestro es
LCP ≤ 1,7 s y CLS = 0, así que hay una **divergencia lab↔campo** que hay que
explicar antes de tocar nada.

**Pasos:**

1. **Reproducir en laboratorio** (no asumir causa; la hipótesis CLS previa fue
   refutada):
   ```bash
   pnpm run perf:ci
   ```
   Correr Lighthouse/trace sobre la ruta en móvil emulado + throttling; capturar
   el recurso o la fase de render que domina el LCP y el nodo que aporta el CLS.
2. Si lab reproduce → corregir la causa **medida** (p. ej. imagen/hero sin
   dimensiones, fuente bloqueante, hidratación tardía). Si lab **no** reproduce
   con solo 30 muestras → marcar como *ruido de muestra pequeña* y observar otra
   semana; no intervenir a ciegas.
3. Revalidar con `perf:ci` y RUM de la semana siguiente.

**Métrica primaria:** p75 LCP de campo hacia ≤ 2,5 s; CLS ≤ 0,1; guardrails
sintéticos del maestro preservados.

**STOP:** si la corrección arrastra cambio de copy YMYL (entonces pasa por
pipeline) o toca una tool congelada.

---

### WS-5 — Baseline de citación GEO (medir antes de construir)

**Gate de entrada:** ninguno; es medición. Mapea a `OPS-01` del maestro.

Ejecutar exactamente `docs/reports/AI-CITATION-TRACKING.md`, **sin cambiar el set
durante tres meses**:

- 4 motores × 12 queries = 48 combinaciones por corrida;
- por combinación: citado sí/no, prominencia, URL, observación, fecha, entorno
  **no personalizado**;
- repetir mensual por **3 cortes** antes de proponer cualquier página, schema o
  `llms.txt` nuevo.

**Métrica primaria:** ¿las citas se concentran en pocas superficies autoritativas
o hay un problema de descubribilidad más amplio? (Requiere 2 corridas con patrón
repetido antes de concluir.)

**STOP:** no cambiar `llms.txt`, schema ni contenido por una única respuesta de un
motor.

---

## 5. Secuenciación y prioridad

```text
Semana W29 (corte 2026-07-14 → 07-20)
  P0  WS-1 paso 1–2  clasificación de intención UTM (solo análisis)
  P0  WS-2 paso 1–3  triage de las 27 URLs + selección de 1–3
  P0  WS-5 corrida 1 baseline GEO
  P0  WS-4 paso 1    reproducción lab del LCP
  P1  WS-3           diagnóstico read-only de seguro-cesantia con datos W29

Semana W30–W31
  P0  WS-1 paso 3    lanzar UN experimento UTM (baseline 28d ya corriendo)
  P0  WS-4 paso 2    corregir causa medida de LCP si lab reprodujo
  P1  WS-2           ejecutar 1–3 intervenciones de indexación seleccionadas

Semana W32+
  WS-1 leer resultado del experimento a 28 días (OBS-02 SEO)
  WS-5 corrida 2 GEO
  Reevaluar cohorte congelado solo si OBS-01 cerró con baseline válido (~07-26)
```

Nada bloquea a nada excepto: cualquier edición de tool congelada espera cierre de
OBS-01; cualquier cambio de ruta espera ADR.

---

## 6. Preguntas de decisión para el owner (Carlos)

1. **UTM zero-click.** Si la clasificación confirma que la mayoría del volumen del
   conversor es valor-actual zero-click, ¿aceptamos que el techo de CTR es
   estructural y medimos éxito como "snippet correcto + captura de la fracción
   click-worthy", en vez de CTR agregado?
2. **`seguro-cesantia` congelada vs title del plan 040.** El nuevo title ya está
   vivo y contamina el baseline. ¿El baseline reiniciado de OBS-01 lo acepta como
   punto de partida, o se revierte al title previo antes de cerrar OBS-01?
3. **Enforcement del congelamiento.** PR-04 (SEO) gatea sobre OBS-01 completo.
   ¿Cómo garantizamos que ninguna otra sesión edite las 4 tools durante la
   extensión (el congelamiento ya se rompió una vez)?
4. **Indexación.** De las 27 URLs no indexadas, ¿cuáles son estratégicas
   (intervenir) y cuáles utility-complete (registrar y dejar)?

---

## 7. Gates de verificación

Antes de cerrar cualquier workstream que toque archivos:

```bash
pnpm run lint
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm run check
pnpm run build
git status --short
```

Si el workstream toca rutas/canonicals/RSS/sitemap/helpers de URL:

```bash
pnpm run check:no-postid-urls
pnpm run check:routes
pnpm run check:rss
```

Si toca copy con vigencia o frescura (WS-1):

```bash
pnpm run check:frontmatter
pnpm run check:editorial
pnpm run check:editorial-timeliness
pnpm run check:economic-source-consistency
pnpm run audit:cannibalization
pnpm run audit:topic-overlap
```

Si toca UI/performance (WS-4):

```bash
pnpm run test:a11y
pnpm run perf:ci
```

**Guardrails:** Mobile Performance ≥ 99 · LCP sintético ≤ 1,7 s · CLS = 0 · sin
regresión visible a 375/768/1440 px · resultados numéricos idénticos para
fixtures existentes.

---

## 8. Cómo se mide el éxito del plan

**Métrica de programa (GSC, no funnel):**

- **UTM (WS-1):** clics de la clase click-worthy +X% o CTR ×2 / +0,5 pp a 28 días,
  sin caída de posición >2 puestos.
- **Indexación (WS-2):** 1–3 URLs seleccionadas pasan a *Indexed* en 2–4 semanas.
- **Loser (WS-3):** causa de `seguro-cesantia` explicada y decisión de owner
  tomada; sin edición durante congelamiento.
- **CWV (WS-4):** p75 LCP de campo ≤ 2,5 s y CLS ≤ 0,1, o descarte justificado por
  muestra pequeña.
- **GEO (WS-5):** ≥2 corridas con patrón repetido antes de cualquier propuesta de
  construcción.

Si una muestra no alcanza, se marca `INCONCLUSIVE`, nunca `SUCCESS` ni `FAILED`,
y no se bajan umbrales retroactivamente.

---

## 9. Registro de experimentos y Progress Log

| ID | URL | Hipótesis | Cambio | Baseline | Inicio | Fin | Primaria | Guardrail | Resultado | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|
| SEO-W28-01 | `/calculadoras/conversor-utm/` | El pocket CONVERT/TOOL (42,5% de impr, pos ~6, CTR 0,17%) es capturable por **posición**, no por título; reforzar targeting on-page de conversión + internal linking sube posición y clics (ver Anexo §11) | Targeting on-page para "N UTM a peso(s) chilenos" + "calculadora UTM" **o** internal linking — una variable | W25–W28 | TBD | TBD | Clics + posición del clúster CONVERT/TOOL | clics −20% con impr estables | TODO | Pendiente sign-off |

| Fecha | Workstream | Estado | Evidencia | Decisión/bloqueo |
|---|---|---|---|---|
| 2026-07-17 | Planificación | DONE | Plan creado desde el informe W28 | Pendiente sign-off de Carlos; registrar en `docs/backlog/README.md` |
| 2026-07-17 | WS-1/WS-2/WS-3 análisis | DONE | Anexo §11 (intención UTM, triage 27 URLs, diagnóstico rename cesantía) | Lectura pura, sin cambios en producción |
| 2026-07-17 | WS-2 internal linking `reajuste-arriendo` | DONE | 3 enlaces entrantes nuevos desde `uf-hoy.astro`, guía `indicadores-economicos.astro` e `ipc.md` (**7→10**); build: 1.538 enlaces, **0 internos rotos**; prettier OK | Sin cambio de URL ni copy YMYL. Monitorear recrawl→indexación en W29–W31; resto del triage (20 posts) espera `audit:cannibalization` |

Estados permitidos: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED`, `INCONCLUSIVE`,
`REJECTED`.

---

## 10. Condiciones de STOP (además de las del plan maestro §13)

Detener y reportar si:

1. una acción exige editar una tool del cohorte congelado antes del cierre de OBS-01;
2. una acción exige crear/cambiar/retirar una ruta pública sin ADR + snapshot;
3. un cambio de copy YMYL no puede pasar pipeline + separación de deberes;
4. el experimento UTM requiere prometer un valor "hoy" que sea histórico o inexacto;
5. la corrección de LCP cambia una fórmula o resultado financiero;
6. los datos W29+ contradicen la tesis de este plan y no se actualiza el documento.

---

## 11. Anexo — Análisis ejecutado 2026-07-17 (WS-1 y WS-2)

> Fuente: `output/operations/data-signals/gsc/2026-W28-{query-page,url-inspection,pages}.json`
> del bundle de deploy. Lectura pura, sin cambios en producción.

### 11.1 WS-1 — Clasificación de intención del conversor UTM

Cobertura: 57.920 impresiones atribuidas a query (≈75% de las 77.088 del informe;
el 25% restante son queries anonimizadas por GSC). CTR query-página 0,33%.

| Clase de intención | Impresiones | % | Clics | CTR | Pos. pond. |
|---|---:|---:|---:|---:|---:|
| **VALUE — valor-actual / zero-click** | 28.702 | **49,6%** | 138 | 0,48% | 5,20 |
| **CONVERT — cálculo click-worthy** | 24.545 | **42,4%** | 42 | 0,17% | 6,27 |
| TOOL — navegacional / producto | 2.174 | 3,8% | 9 | 0,41% | 6,60 |
| OTHER — sin clasificar | 2.464 | 4,3% | 2 | 0,08% | 6,79 |
| INFO — explicativo | 35 | 0,1% | 0 | 0,00% | 3,34 |

**Conclusión (confirma y precisa la tesis del informe):**

1. **~50% del volumen es zero-click estructural** ("valor utm", "utm hoy", "valor
   utm hoy"…). Google resuelve el valor en el snippet; el CTR a posición 5 ya es
   el techo. **Aquí la acción NO es CTR sino corrección/frescura del snippet.** No
   se experimenta con título contra esta clase.
2. **~42% es intención de conversión (el JTBD real de la tool) rankeando en
   posición ~6 con CTR 0,17%** — es un **problema de posición, no de título**. La
   bolsa capturable (TOOL+CONVERT en pos 3,5–12) suma **24.627 impr (42,5%) con
   solo 42 clics**. Ejemplos: `utm a peso chileno` (3.721 impr, pos 6,9),
   `utm a peso` (2.211, pos 7,4), `calculadora utm` (683, pos 7,1 — intención de
   producto pura, somos la tool y rankeamos 7º), `N utm a pesos chilenos` (varias,
   pos 5–8, 0% CTR). Google muestra "1 UTM = $X" en el snippet, pero **no**
   convierte montos arbitrarios → esos clics son capturables si subimos de pos ~6
   a top-3.

**Hipótesis del experimento (SEO-W28-01):** reforzar el targeting on-page para el
fraseo de conversión y "calculadora UTM" + internal linking mueve la posición del
clúster CONVERT/TOOL y captura clics que el snippet no puede satisfacer. Una
variable, baseline 28 días, primaria = clics + posición del clúster.

### 11.2 WS-2 — Triage de las 27 URLs crawled-not-indexed

Ninguna tiene clics y casi ninguna tiene impresiones → **no hay incendio**; es
higiene de portafolio. Clasificación:

**A) ESTRATÉGICA — intervenir ahora (1):**

- **`/calculadoras/reajuste-arriendo/`** — calculadora **activa** del portafolio
  (familia `vivienda-uf`, en `src/config/calculatorPortfolio.ts`) que Google no
  indexa. Enlaces internos entrantes: **7 archivos** vs **14** de su hermana
  indexada `conversor-uf`; además varios de sus enlazadores (`que-es-la-uf`,
  `que-es-el-ipc-chile…`) **también están no indexados** → clúster UF/IPC
  sub-indexado que le pasa poca equity. **Acción segura (sin cambio de URL, sin
  YMYL):** reforzar internal linking desde el hub `/calculadoras/`, la guía
  `uf-costo-de-vida` y la hermana `conversor-uf`; verificar que no sea thin.

**B) UTILITY-COMPLETE / bloqueada aguas arriba — registrar, sin acción (6):**

- `/archives/` (índice de archivo, `noindex` por diseño);
- `/glosario/cmf/`, `/glosario/tmc/` (definiciones thin/zero-click);
- `/leyes/dl-824-impuesto-renta/`, `/leyes/proyecto-reforma-previsional-2025/`
  (páginas de cita legal para E-E-A-T, no para rankear);
- `/posts/operacion-renta-centro/` — **BLOCKED** (verificación SII/TGR + sign-off
  pendiente, ver `docs/backlog/README.md`); no indexar es el estado esperado.

**C) COLA SIN DEMANDA PROBADA — clasificar con auditoría, cero edición en bloque (20 posts):**

Explainers que probablemente **compiten con la calculadora/glosario owner**
(`que-es-el-apv` vs `/calculadoras/apv/`; `que-es-la-uf` vs `conversor-uf` +
glosario; `como-calcular-sueldo-liquido` vs `/calculadoras/sueldo-liquido/`;
`fondos-afp-a-b-c-d-e`, `cuanto-descuenta-la-afp`, `que-es-el-ipc-chile`,
`que-es-la-cuenta-2-afp`…) y guías genuinas sin duplicado obvio
(`credito-hipotecario-chile-guia-completa`, `estafas-financieras-chile`,
`licencia-medica-desde-que-dia-pagan`, `fondo-emergencia-chile`…). **No se
prejuzga ninguna:** el bucket final se asigna con `pnpm run audit:cannibalization`
+ `pnpm run audit:topic-overlap`. Cualquier consolidación de URL requeriría ADR +
snapshot de ruta (`ROUTES.NO_SILENT_CHANGES`).

### 11.3 WS-3 — Rename "Calculadora" → "Simulador" de seguro-cesantía

**Qué cambió.** Commit `d6003846` (2026-07-12 08:29, plan 040) reescribió el
`<title>` y la meta description de `seguro-cesantia.astro`:

- antes: `Calculadora de Seguro de Cesantía | CIC y Fondo Solidario`
- después: `Simulador de Seguro de Cesantía: calcula tu cobertura (AFC y Fondo Solidario)`

**Defecto introducido — rename incompleto e incoherente.** Solo el title tag y la
meta pasaron a "Simulador". El **H1/encabezado visible, el `name` del schema
`WebApplication` y el `calculator_name` de analytics siguen diciendo
"Calculadora"** (`seguro-cesantia.astro` líneas 103, 100, 646, 820). La página
emite una señal de entidad mixta.

**Qué dice la demanda real (query-page W28, página seguro-cesantia).** Los clics
vienen de la familia **"calcular/cálculo"** en buena posición, no de "simulador":

| Query | Impr | Clics | Posición |
|---|---:|---:|---:|
| `calcular seguro de cesantia` | 77 | **18** | 2,97 |
| `calculo seguro cesantia` | 22 | **8** | 3,14 |
| `calculo de seguro de cesantia` | 14 | **5** | 3,14 |
| `simulador seguro cesantia` | 79 | **0** | 6,96 |
| `simular seguro de cesantía solidario` | 41 | **0** | 8,90 |
| `simular cobro seguro cesantia` | 25 | **0** | 6,96 |

Token "simulador": 163 impr / 3 clics. Token "calculadora": 4 impr / 3 clics. La
familia **verbal** "calcular/cálculo" es la que convierte (≈31 clics), rankeando
en pos ~3; la familia "simular/simulador" tiene más impresiones pero **~0% CTR y
peor posición (pos 7–9)**.

**Lectura SEO — apuesta cuestionable.** El rename alinea el título con el clúster
"simulador" (alto volumen pero donde rankeamos 7º y capturamos 0 clics) y
**desenfatiza el clúster "calcular"** (donde rankeamos 3º y están los clics
reales). Apostar por un término en el que rankeamos 7º sobre uno en el que
rankeamos 3º es contraintuitivo. La nueva description sí es más rica (mejor para
CTR informacional-transaccional).

**Causalidad de la pérdida −36 de W28.** El cambio se desplegó el **último día de
W28** (07-12), así que **no explica** la caída de 125→89 clics de la semana; ese
−36 es anterior al efecto del título (demanda/estacionalidad/SERP). El efecto real
del rename se verá en **W29**.

**Gobernanza.** El cambio **violó el congelamiento OBS-01** (seguro-cesantia es
tool del cohorte) y contamina la única tool con muestra suficiente. Ya está
registrado como violación en el Progress Log del plan maestro.

**Recomendación (no ejecutar bajo congelamiento; decisión del owner):**

1. Tratar el rename como un **experimento vivo no planificado**: medir clics/CTR/
   posición de las familias "calcular" vs "simulador" en W29 como before/after.
2. **Reconciliar la incoherencia** H1/schema/analytics vs title — es un defecto
   objetivo con independencia del debate Calculadora/Simulador (requiere pasar por
   el gate de congelamiento o esperar cierre de OBS-01).
3. Preguntas de decisión #2 y #3 (§6) aplican: ¿revertir al title previo para un
   baseline limpio, o aceptar "Simulador" como nuevo punto de partida? El título
   óptimo probablemente **conserva el término que convierte** ("calcular") en
   lugar de sustituirlo.

### 11.4 WS-2 — Ejecución del refuerzo de enlaces + automatización

**Ejecutado hoy (2026-07-17).** `reajuste-arriendo` no es thin (667 líneas > 627 de
`conversor-uf`); el problema era puramente de enlaces internos. Se añadieron 3
enlaces entrantes desde superficies indexadas y topicalmente idóneas (**7→10**):

- `src/pages/uf-hoy.astro` — segundo CTA en la tarjeta "Arriendo y dividendo en UF".
- `src/pages/guias/uf-costo-de-vida/indicadores-economicos.astro` — nueva tarjeta
  "Herramienta: Reajuste de arriendo" en la grilla.
- `src/data/glossary/ipc.md` — `reajuste-arriendo` en `relatedCalculators`.

Sin cambio de URL ni copy YMYL. Build: 1.538 enlaces, 0 rotos; prettier limpio.

**Ahora (opcional, humano):** una única "Solicitar indexación" en GSC URL
Inspection **solo para `reajuste-arriendo`** es legítima para acelerar el recrawl
(no es una solicitud en lote, que sí está prohibida).

**Luego (seguimiento):** verificar en W29–W31 si `reajuste-arriendo` pasa a
*Indexed* en el artefacto de URL Inspection. La indexación es señal rezagada
(Google debe recrawlear).

**Automatización propuesta (evitar que se repita el punto ciego):**

- **AUT-1 (guardrail build-time, determinista, recomendado):** un `check:*` que
  cruce los slugs de calculadoras **activas** de `src/config/calculatorPortfolio.ts`
  con el conteo de enlaces internos entrantes y **falle/avise** si una tool activa
  cae por debajo de un umbral (habría cazado `reajuste-arriendo` con 7). No depende
  de datos externos; encaja con el patrón `check:*` + test en `tests/static-analysis/`.
- **AUT-2 (enriquecimiento del ritual semanal):** cruzar esos mismos slugs contra
  el último `*-url-inspection.json` y elevar `action_needed` cuando una calculadora
  activa esté *Crawled - currently not indexed*. Se engancha en el pipeline de
  data-signals/scorecard que ya baja URL Inspection.

Ambas son cambios enfocados y con test; **no se implementan en el mismo cambio que
el linking** (disciplina de un concern por PR).
