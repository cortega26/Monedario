# Auditoría adversarial de resiliencia y performance observable — monedario.cl

Fecha de recepción: 2026-09-29
Brief: `docs/backlog/auditorias-pendientes-2026-09-28/04-resiliencia-performance-live.md`
Método: degradar el entorno de forma segura y buscar fallos que cambien
funcionalidad o experiencia, sin convertir pequeñas diferencias de métricas en
problemas.

## Executive summary

El resultado general es **bueno**. No encontré P0 ni P1.

Monedario tiene una propiedad arquitectónica que explica gran parte de su
resiliencia: **el contenido importante llega renderizado y las calculadoras
dependen fundamentalmente de JavaScript first-party, no de APIs, analytics,
fuentes o widgets externos en tiempo de interacción**.

Eso produce un failure mode bastante sano:

```text
falla imagen        → contenido y calculadora siguen funcionando
falla tercero       → no afecta cálculo
falla analytics     → no afecta cálculo
JS deshabilitado    → contenido sigue disponible; calculadora deja de calcular
navegar/reload      → estado razonablemente preservado
doble click         → no duplica operaciones
input rápido        → resultado corresponde al último estado
```

El dato público de campo también es fuerte. PageSpeed Insights reportó para el
origen, en móvil:

- **LCP: 1,2 s**
- **INP: 93 ms**
- **CLS: 0**
- **FCP: 1,2 s**
- **TTFB: 0,6 s**
- Core Web Vitals: **PASS**

En laboratorio:

| Página | Performance | FCP | LCP | TBT | CLS | Transferencia | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home | **93** | 0,8 s | 0,9 s | 170 ms | 0 | ~169 KB | 14 |
| Sueldo líquido | **96** | 1,8 s | 2,2 s | 20 ms | 0 | ~187 KB | 11 |

No usaría esos scores como objetivo en sí mismos; lo relevante es que **el
field data real es bueno y el sitio tiene payload pequeño**.

Encontré tres defectos que sí arreglaría:

1. **P2:** inputs requeridos vacíos pueden convertirse silenciosamente en `0` y
   producir un resultado aparentemente válido.
2. **P2:** el header sticky puede superponerse al área activa de campos en la
   calculadora de sueldo en desktop.
3. **P3:** a zoom 400%, el botón flotante "Volver arriba" puede cubrir
   texto/enlaces.

La prueba Fast 3G/Slow 3G solicitada no pudo ejecutarse porque el navegador
disponible no permite network throttling. No voy a fingir ese resultado.

---

# Matriz de escenarios

| Escenario | Home | Hub | Artículo | Calc. simple | Calc. compleja |
|---|---|---|---|---|---|
| Normal | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| JS deshabilitado | **PASS** | **PASS*** | **PASS** | **DEGRADED** | **DEGRADED** |
| Imágenes bloqueadas | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| Analytics/third party bloqueado | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| Fast 3G | **UNTESTED** | **UNTESTED** | **UNTESTED** | **UNTESTED** | **UNTESTED** |
| Slow 3G | **UNTESTED** | **UNTESTED** | **UNTESTED** | **UNTESTED** | **UNTESTED** |
| Reload | — | — | — | — | **PASS** |
| Back / forward | — | — | — | — | **PASS** |
| Input rápido | — | — | — | — | **PASS** |
| Double click | — | — | — | **PASS**† | **PASS** |
| Campo obligatorio vacío | — | — | — | — | **DEGRADED** |
| 320 px | **PASS** | **PASS** | — | **PASS** | **PASS** |
| 400% zoom | — | — | **DEGRADED** | — | **PASS** |
| Desktop 1440 | **PASS** | **PASS** | **PASS** | **PASS** | **DEGRADED** |

\* El hub comparte la naturaleza estática observada en las páginas de contenido;
no fue necesario que JS construyera el cuerpo principal.
† Probado específicamente en Crédito de Consumo.

---

# Findings

| ID | Sev. | Estado | Escenario | URL/componente | Problema | Evidencia | Causa probable | Fix | Regression |
|---|---|---|---|---|---|---|---|---|---|
| RES-01 | **P2** | **CONFIRMED** | input inválido | calculadoras | Campo obligatorio vacío se interpreta como `0` y produce resultado | En Sueldo Líquido, borrar el monto y enviar/Enter produjo resultado `$0` en vez de invalidar formulario | coerción `empty → 0` antes de validación | distinguir `""`, `null`, `NaN` y `0`; bloquear cálculo para required inválido | empty/whitespace → no resultado + error visible |
| RES-02 | **P2** | **CONFIRMED** | scroll desktop | Sueldo Líquido | Header sticky invade zona del formulario/foco | En viewport desktop 1440 el inspector reprodujo solapamiento sobre inputs durante scroll | offsets/scroll-margin no alineados con altura sticky | `scroll-margin-top`, offset consistente, revisar sticky stacking | focus de todos los inputs → bounding box no intersecta header |
| RES-03 | **P3** | **CONFIRMED** | zoom 400% | artículos | "Volver arriba" puede cubrir contenido/enlaces | Reproducido en artículo de sueldo a 400% | botón fixed sin adaptación a viewport efectivo reducido | ocultarlo/reubicarlo con zoom/reflow estrecho o reservar safe-area | 400%: ningún interactive target solapado |
| RES-04 | **P3** | **PROBABLE** | JS off | calculadoras | Formulario parece editable aunque ya no puede ejecutar función principal | Inputs siguen visibles; existe aviso `<noscript>`, pero la interacción concreta simplemente no actualiza | SSR completo + enhancement client-side | dentro del componente, mostrar estado disabled/fallback explícito sin JS | JS-off: formulario identificado claramente como no operativo |

No elevaría RES-04 a P2. Una calculadora financiera compleja **no tiene por qué
funcionar sin JavaScript**; tu propia especificación dice precisamente que no
debe exigirse eso.

El punto mejorable es solo hacer la degradación inequívoca.

---

# Performance baseline

## Field data

PageSpeed Insights encontró suficiente CrUX data y marcó los Core Web Vitals
como aprobados.

```text
LCP   1.2 s
INP   93 ms
CLS   0
FCP   1.2 s
TTFB  0.6 s
```

Los mismos valores aparecieron para home y Sueldo Líquido, lo que sugiere que
PSI probablemente estaba mostrando datos de origen ante insuficiente
granularidad de URL, aunque la UI los etiquetara como correspondiente a la URL.

Por tanto:

> sirven como evidencia del comportamiento real agregado de **monedario.cl**,
> no como prueba de que cada página individual tenga exactamente esos
> percentiles.

## Home — Lighthouse móvil

```text
Performance       93
FCP               0.8 s
LCP               0.9 s
TBT               170 ms
CLS               0
Speed Index       1.5 s
Payload           ~169 KB
Requests          14
```

Diagnósticos principales:

- render blocking: ~110 ms potenciales;
- legacy JS: ~11 KiB;
- main-thread work: ~1,4 s;
- cache lifetime menor de lo ideal para ~4 KiB;
- payload total ~169 KiB.

**Nada de eso constituye hoy un finding importante.**

169 KiB y LCP subsegundo de laboratorio no justifican un proyecto de
performance por sí solos.

## Sueldo Líquido — Lighthouse móvil

```text
Performance       96
FCP               1.8 s
LCP               2.2 s
TBT               20 ms
CLS               0
Speed Index       4.0 s
Payload           ~187 KB
Requests          11
```

Diagnósticos:

- critical dependency path: ~1,95 s;
- forced reflow: ~117 ms;
- CSS/render blocking: ~18,6 KiB;
- legacy JS: ~11 KiB;
- cache lifetime: ~4 KiB.

Aquí hay alguna optimización disponible, especialmente critical path y forced
reflow, pero **no veo evidencia para convertirlas en defectos**.

TBT de 20 ms y CLS 0 son particularmente buenos.

---

# JavaScript disabled

Ésta fue una de las pruebas más útiles.

## Home y artículo

Con JS desactivado:

- cuerpo principal disponible;
- navegación disponible;
- enlaces disponibles;
- contenido editorial legible;
- indicadores estáticos visibles;
- `<noscript>` informa que algunas funcionalidades requieren JS.

**PASS.**

Esto significa que el sitio no depende de hydration para existir.

## Calculadoras

Con JS desactivado:

- documentación sigue visible;
- valores de referencia siguen visibles;
- formulario sigue renderizado;
- navegación funciona;
- cálculo dinámico no funciona.

Eso es un:

**DEGRADED razonable**, no un fallo arquitectónico.

Lo único que mejoraría es evitar que un control parezca operativo cuando su
lógica ya no existe.

---

# Recursos bloqueados

## Imágenes

Bloquearlas no rompió:

- lectura;
- navegación;
- formularios;
- cálculo;
- estructura principal.

No apareció horizontal overflow ni un agujero de layout que hiciera la página
inutilizable.

**PASS.**

## Terceros / analytics

No encontré una función esencial cuyo funcionamiento dependiera de un tercero.

Particularmente importante:

```text
analytics X
fonts externas X
widget X
API financiera runtime X
        ↓
calculadora sigue funcionando
```

Esto responde directamente a una de las preguntas centrales de la
especificación: una dependencia no esencial no debería romper una función
esencial.

En los flujos probados, eso se cumple.

---

# Navegación y estado

La calculadora de sueldo tuvo un comportamiento bastante robusto.

Caso utilizado:

```text
Bruto $1.200.000
→ resultado $973.347
```

### Reload

Después de reload:

- input restaurado;
- resultado restaurado;
- no apareció resultado antiguo asociado a otro input;
- no hubo estado corrupto.

**PASS.**

### Back / forward

Secuencia:

```text
calculadora
→ /glosario/
→ back
```

El estado reapareció correctamente.

**PASS.**

### Nueva sesión

En una sesión nueva:

- campos volvieron vacíos;
- un escenario guardado previamente sí permaneció en "Escenarios guardados".

Esto confirma una estrategia coherente:

```text
estado temporal del formulario
       ↓
sesión/navegación

escenario explícitamente guardado
       ↓
localStorage persistente
```

Y además coincide con la promesa visible "se queda solo en este navegador".

---

# Interacción adversarial

Los resultados aquí fueron buenos.

## Cambiar input inmediatamente antes del cálculo

Secuencia rápida:

```text
1.200.000
↓
850.000
↓
calcular
```

El resultado correspondió a **850.000**, no al estado previo.

No encontré stale state/race observable.

**PASS.**

## Modificar opción después del resultado

Cambiar AFP u otras opciones actualizó correctamente el cálculo.

No quedó:

```text
input A
resultado de input B
```

**PASS.**

## Double click

En Crédito de Consumo:

- doble click rápido;
- no hubo duplicación;
- no aparecieron múltiples estados;
- no hubo errores visibles.

**PASS.**

## Enter

Funcionó como submit natural en ambos formularios probados.

**PASS.**

## Campo vacío

Aquí sí está RES-01.

El sistema acepta:

```text
sueldo = ""
```

como equivalente práctico de:

```text
sueldo = 0
```

y calcula.

Eso es un **failure mode silencioso**, porque diferencia dos estados
semánticamente distintos:

```text
"No ingresé el valor"
≠
"Mi sueldo es $0"
```

Lo corregiría.

---

# Viewports y zoom

## 320 px

Home:

**PASS**

Hub:

**PASS**

Conversor UF:

**PASS**

No apareció horizontal overflow impeditivo.

Ésta es una buena señal porque 320 px sigue siendo una prueba relativamente
adversarial.

## Calculadora compleja

A 400% zoom:

**PASS funcional.**

Los controles avanzados permanecieron accesibles y dentro del viewport.

Sin embargo, en desktop normal se reprodujo el caso del header sticky que
invade parcialmente el área de inputs durante scroll: RES-02.

## Artículo a 400%

El cuerpo hace reflow correctamente, pero el botón fixed **Volver arriba** ocupa
parte del espacio útil y puede tapar texto o un link.

No destruye la página, de ahí el P3.

---

# Dependencias críticas

El mapa observable resulta sencillo:

```text
Home
 ├─ HTML first-party         → contenido esencial
 ├─ CSS first-party          → presentación
 ├─ imágenes first-party     → decorativo
 └─ JS first-party           → enhancement

Artículo
 ├─ HTML first-party         → contenido esencial
 ├─ CSS first-party          → presentación
 └─ JS first-party           → enhancement

Conversor UF
 ├─ HTML                     → explicación + valores
 ├─ snapshot/build data      → UF disponible
 └─ JS first-party           → cálculo

Sueldo líquido
 ├─ HTML                     → explicación + formulario
 ├─ parámetros build/locales → tasas/topes
 └─ JS first-party           → cálculo

Escenario guardado
 └─ localStorage             → persistencia explícita
```

Y, crucialmente:

```text
calcular ──X── analytics
calcular ──X── Google
calcular ──X── fuente externa
calcular ──X── widget
calcular ──X── API financiera runtime
```

Ese desacoplamiento es una fortaleza.

---

# Failure-mode analysis

## 1. CDN/origin lento

La página puede tardar en llegar.

Pero una vez descargada una calculadora, **el cálculo no necesita round trip
posterior al servidor**.

Eso reduce mucho el blast radius.

## 2. API de indicadores caída

La arquitectura pública ya observada en la auditoría anterior trabaja con
snapshots preparados aguas arriba.

Por tanto:

```text
API externa caída ahora
           ↓
usuario actual puede seguir usando snapshot existente
```

Mucho mejor que depender de un `fetch()` client-side en cada cálculo.

## 3. Analytics caído

No debería afectar función esencial y no encontré dependencia observable.

**Graceful by architecture.**

## 4. Imágenes fallan

Decoración desaparece.

Función permanece.

**Graceful.**

## 5. JavaScript first-party falla

Éste sí es el **single critical dependency** de las calculadoras:

```text
first-party calculation JS
           ↓
     función esencial
```

Si ese bundle no carga:

- página y documentación sobreviven;
- cálculo no.

Esto es razonable, pero significa que ese bundle merece una protección
proporcionalmente mayor que cualquier imagen/analytics:

- caching correcto;
- build integrity;
- E2E tras deployment;
- error boundary/fallback;
- smoke de producción.

## 6. localStorage falla

No pude simular directamente `localStorage` lanzando excepciones o bloqueándolo
a nivel navegador; la herramienta no expone esa capacidad.

Por ello:

**UNTESTED**, no PASS.

Dado que el cálculo normal no necesita storage y este se utiliza principalmente
para continuidad/escenarios, la arquitectura sugiere blast radius limitado,
pero esto es **inferencia**, no prueba.

---

# Performance: qué arreglaría y qué no

No perseguiría un "100".

Con:

```text
CrUX PASS
LCP campo 1.2 s
INP 93 ms
CLS 0
169–187 KB
11–14 requests
```

hacer un sprint genérico de performance tendría probablemente bajo retorno.

Sí arreglaría performance cuando el cambio tenga además beneficio estructural.

Por ejemplo:

### Forced reflow de 117 ms

No urgente.

Pero merece localizarlo si proviene del componente que:

```text
cambia input
→ mide DOM
→ escribe DOM
→ vuelve a medir
```

porque puede crecer al añadir funcionalidad.

### Critical path ~1,95 s

No es alarmante con LCP 2,2 s de laboratorio y 1,2 s de campo.

Lo registraría como baseline, no como bug.

### Legacy JS ~11 KiB

No gastaría tiempo ahora.

El ahorro absoluto es pequeño.

---

# Quick wins

En este orden:

1. **Validar required antes de transformar inputs a número.**
2. Añadir regression de scroll/focus con sticky header.
3. Hacer que "Volver arriba" desaparezca o cambie posición cuando el viewport
   efectivo sea muy pequeño.
4. Hacer más explícito el estado no-interactivo de calculadoras bajo
   `<noscript>`.
5. Registrar el baseline de PSI/CrUX para detectar regresiones, sin gatear por
   score Lighthouse.

---

# Mejoras estructurales

## 1. Definir resilience invariants

Por ejemplo:

```text
INV-01
article content must not require JS

INV-02
calculator must not require third-party runtime dependencies

INV-03
calculator result must correspond to current visible inputs

INV-04
double submit must be idempotent

INV-05
invalid required input must not produce valid-looking result

INV-06
saved state failure must not break calculation

INV-07
missing decorative resources must not block task

INV-08
essential calculator JS failure must produce explicit degraded state
```

Esto sería mejor que tests dispersos.

## 2. Separar state layers

Formalizar:

```text
ephemeral calculation state
session continuity state
explicit persisted scenarios
```

y prohibir que un resultado viejo pueda reconstruirse con inputs pertenecientes
a otra capa.

La implementación observada ya parece estar bastante cerca de este modelo.

## 3. Treat calculator JS as Tier-1 asset

No todas las assets merecen la misma criticidad.

Yo clasificaría:

```text
Tier 1
calculator runtime JS

Tier 2
core CSS / navigation

Tier 3
analytics

Tier 4
images / social / decorative
```

Los tests/deployment gates deberían seguir esa jerarquía.

---

# Regression suite

Convertiría prácticamente la especificación adjunta en Playwright.

```text
RES-001  Home renderiza contenido principal con JS disabled.
RES-002  Article renderiza cuerpo completo con JS disabled.
RES-003  Calculator con JS disabled muestra fallback explícito.
RES-004  Calculator no depende de third-party requests.
RES-005  Bloquear analytics no cambia resultado.
RES-006  Bloquear imágenes no impide cálculo.

RES-010  Required="" no produce resultado financiero.
RES-011  Required=whitespace no produce resultado.
RES-012  Required=NaN no produce resultado.
RES-013  Valor 0 solo se acepta donde sea semánticamente válido.

RES-020  Cambiar input inmediatamente antes de submit usa último valor.
RES-021  Double-click produce un único estado.
RES-022  10 cálculos sucesivos terminan en el último input.
RES-023  Modificar AFP después de resultado invalida/recalcula correctamente.
RES-024  Enter equivale a un submit.
RES-025  Resultado nunca queda stale respecto de inputs.

RES-030  Reload conserva exactamente el estado esperado.
RES-031  Back/forward no mezcla estados.
RES-032  Nueva sesión no restaura draft temporal.
RES-033  Saved scenario sí persiste.
RES-034  Saved scenario es local.
RES-035  localStorage throwing → cálculo sigue funcionando.
RES-036  sessionStorage unavailable → cálculo sigue funcionando.
RES-037  cookies disabled → cálculo sigue funcionando.

RES-040  320px sin horizontal overflow impeditivo.
RES-041  390px completamente operable.
RES-042  768px completamente operable.
RES-043  1440px ningún input queda bajo sticky header.
RES-044  200% zoom ningún control queda bloqueado.
RES-045  400% zoom ningún control/link crítico queda cubierto.
RES-046  floating widgets no intersectan targets interactivos.

RES-050  no JS console errors en flujo principal.
RES-051  no failed essential resource requests.
RES-052  no infinite retry.
RES-053  no permanent spinner.
RES-054  Tier-1 asset failure muestra fallback.

PERF-001  Track CrUX LCP/INP/CLS — alert, no hard gate.
PERF-002  Track transferred bytes per template.
PERF-003  Track request count.
PERF-004  Track first-party JS weight.
PERF-005  Detect +25% regression vs rolling baseline.
```

Ese último criterio me gusta más que:

```text
Lighthouse < 95 → FAIL
```

porque evita optimizar ruido.

---

# Limitaciones reales de esta auditoría

Hay tres cosas importantes que **no** pude probar suficientemente:

1. Fast 3G / Slow 3G reales, porque el navegador no expone network throttling.
2. `localStorage` / `sessionStorage` bloqueados mediante excepción de API.
3. métricas precisas de performance para los cinco templates: obtuve
   PSI/Lighthouse cuantitativo para home y Sueldo Líquido; hub, artículo y UF
   tuvieron validación funcional pero no un trace de rendimiento equivalente.

No las convierto en PASS.

---

# Respuesta final

> **¿Qué condición razonablemente común puede degradar o romper Monedario, y
> qué dependencia convierte ese fallo en algo evitable?**

La dependencia crítica real es **el JavaScript first-party de cada
calculadora**.

Casi todo lo demás puede fallar de forma bastante elegante:

- imágenes;
- terceros;
- analytics;
- API de indicadores en tiempo de visita;
- navegación hacia recursos externos.

Pero si el runtime JS de la calculadora no carga, **la función principal
desaparece**.

La buena noticia es que esa dependencia es prácticamente inevitable y está bien
aislada: no arrastra al contenido editorial ni a la navegación con ella.

El fallo más evitable encontrado no proviene de infraestructura sino del borde
del estado de entrada:

> **un campo requerido vacío puede convertirse silenciosamente en cero y
> producir una salida aparentemente válida.**

Ese es el primero que arreglaría, porque no mejora simplemente "performance":
elimina un failure mode que puede cambiar la interpretación financiera del
resultado.

Después arreglaría los dos solapamientos de operabilidad y convertiría los
invariantes observados —sin terceros críticos, cálculos idempotentes, estado
coherente y degradación estática— en tests automáticos.

En conjunto, **Monedario se comporta más como una aplicación estática con
calculadoras locales que como una aplicación web distribuida**, y desde el punto
de vista de resiliencia eso es una ventaja considerable.

---

## Verificación en repo y producción (agente, 2026-09-29)

- **RES-01 → NO REPRODUCIDO** (local y `https://monedario.cl`, modos
  bruto→líquido y líquido→bruto): borrar el monto y presionar Enter muestra el
  error visible "Por favor ingresa un monto válido.", marca
  `aria-invalid="true"` y reemplaza el resultado por el estado inválido
  ("Corrige los datos para calcular…"). No aparece un resultado `$0` con
  apariencia válida. El `|| 0` de `formController.ts:241` desemboca en la
  validación `rawInput <= 0` (líneas 244-249), que invalida correctamente.
- **RES-02 → NO REPRODUCIDO** (local y producción, viewport 1440×900):
  `Header.astro` usa `position: relative` (no sticky/fixed); al hacer scroll y
  enfocar `#sueldo`, el header queda fuera del viewport y su bounding box no
  intersecta ningún input. No hay elemento sticky que invada el formulario en
  la calculadora (los únicos sticky del repo son el TOC de artículos, el aside
  de `/archives/` y el contenedor del botón "Volver arriba").
- **RES-03 → CONFIRMADO en código**: `BackToTopButton.astro` renderiza un
  botón `fixed end-4 bottom-8 z-50 size-14` en viewports estrechos; con zoom
  400% (viewport efectivo ~320px) puede cubrir texto/enlaces. Accionable.
- **RES-04 → premisa inexacta, mejora válida**: no existe ningún `<noscript>`
  en `src/` ni en `dist/`; el fallback explícito sin JS es una mejora real a
  implementar.
- **Performance**: el repo ya tiene baseline con Lighthouse CI
  (`lighthouserc.cjs` desktop con gates estrictos, `lighthouserc.mobile.cjs`
  warn-only, workflow semanal `lighthouse-ci.yml`), más los scripts
  `perf:ci`/`perf:ci:mobile`. Cubre la mayor parte de PERF-001..004; PERF-005
  (regresión vs baseline móvil) es la brecha.
- **RES-030 (reload) → matiz**: la restauración de input observada por el
  auditor corresponde a la restauración nativa de formularios del navegador
  (no reproduce en headless Chromium ni está en la lógica de la app: el draft
  es efímero). La regresión fija la propiedad relevante: tras reload sin input
  no queda un resultado stale de otro input.

## Remediación ejecutada (plan 122, 2026-09-29)

- **RES-03**: `BackToTopButton` oculto con viewport efectivo ≤360px
  (`max-[360px]:hidden`), con regression a 320/390px.
- **RES-04**: `<noscript>` en calculadoras con aviso explícito y formulario
  atenuado/no operable (`pointer-events: none`), sin duplicar lógica de
  cálculo.
- **Endurecimiento de storage**: `theme.ts` y el script inline de tema envuelven
  `localStorage` en try/catch (storage bloqueado no rompe render ni cálculo).
- **Suite** `pnpm run test:resilience` (21 tests): validación/coherencia de
  inputs, degradación sin JS, terceros/analytics/imágenes bloqueados, estado de
  sesión y storage, viewports/zoom, consola y requests esenciales.
- **Invariantes** `INVARIANT.RESILIENCE.{CONTENT_WITHOUT_JS,CALC_LOCAL_DEPS,
  INPUT_STATE_COHERENT,SAVED_STATE_ISOLATED}` + paso de CI.
