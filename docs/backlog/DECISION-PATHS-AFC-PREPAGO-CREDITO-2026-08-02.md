# Decision Paths AFC/Prepagado/Crédito — Diseño de siguientes pasos por cluster

Fecha: 2026-08-02 (entregable del spike 056; datos re-verificados 2026-08-11)
Estado: **spike de diseño — read-only, sin tocar código de producto**
Fuente de los recorridos: memo de viabilidad estratégica 2026-08-02
(`output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`, untracked)

---

## 1. Recorridos del memo contra las superficies existentes

### 1.1 AFC/cesantía y salida laboral

Recorrido literal del memo: **"cobertura CIC → causal/FCS → finiquito → trámite oficial → reempleo"**.
Éxito: ≥250 clics/mes, complete/start ≥70%, internal CTR ≥10%, cero errores críticos.

| Paso del recorrido | Superficie existente | Tipo | Hueco |
|---|---|---|---|
| Cobertura CIC | `/calculadoras/seguro-cesantia/` (calculadora CIC + FCS) | calculadora | — |
| Causal/FCS | FAQ en `seguro-cesantia.astro:61-72` (causal, mínimo 10 cotizaciones, 3 continuas) + `/posts/seguro-cesantia-cuenta-individual-vs-fondo-solidario/` + glosario `/glosario/cic/`, `/glosario/seguro-cesantia/` | contenido + glosario | — |
| Finiquito | `/calculadoras/finiquito-indemnizacion/` + `/posts/finiquito-e-indemnizaciones-en-chile/` + `/posts/indemnizacion-anos-de-servicio-chile/` + glosario `/glosario/finiquito/` | calculadora + contenido | — |
| Trámite oficial | Enlace externo `https://personas.afc.cl/` (citado en `seguro-cesantia.astro:347`) | enlace oficial existente | No hay página de trámite interna ni se crea (congelar expansión de URLs) — el trámite se cubre con el enlace que el repo ya cita |
| Reempleo | **Ninguna** | — | **Hueco real**: no existe contenido ni CTA de reempleo. Opciones (decidir, no ejecutar): (a) dejar sin CTA (el memo no exige una URL nueva), (b) CTA externo solo si el repo ya cita la fuente, (c) contenido futuro fuera del congelamiento |

### 1.2 Crédito, prepago y renegociación

Recorrido literal del memo: **"costo → prepago → ahorro → renegociación → fuente CMF/SERNAC"**.
Éxito: ≥250 clics/mes combinados, complete/start ≥65%, ≥10% siguiente paso.

| Paso del recorrido | Superficie existente | Tipo | Hueco |
|---|---|---|---|
| Costo | `/calculadoras/credito-consumo/` + `/calculadoras/tarjeta-credito/` + `/posts/tarjeta-credito-costo-real-chile/` + `/posts/credito-hipotecario-chile-guia-completa/` + glosario `/glosario/credito-hipotecario/` | calculadora + contenido | — |
| Prepago | `/calculadoras/prepago-credito/` + `/posts/prepago-credito-cuando-conviene-chile/` | calculadora + contenido | — |
| Ahorro | `/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/` + hub `/guias/ahorro-e-inversion/` | contenido + hub | — |
| Renegociación | `/calculadoras/simulador-renegociacion/` + `/posts/renegociacion-superir/` + ley `ley-20555-sernac-financiero.md` | calculadora + contenido | — |
| Fuente CMF/SERNAC | `/posts/informe-deudas-cmf-vs-dicom/` + glosario `/glosario/cmf/` + ley `ley-20555-sernac-financiero.md` | contenido + glosario | — |

**El recorrido de crédito está completo** (sin huecos de superficie). El de AFC tiene un solo hueco: **reempleo**.

---

## 2. Conjuntos de siguientes pasos por página

### 2.1 Baseline actual

- `seguro-cesantia.astro`: `NextSteps` en línea 403 con 1 ítem derivado
  (`calculatorRelatedItems` = sueldo-liquido) + fallback "Ver todas las calculadoras".
- `prepago-credito.astro`: `NextSteps` en línea 386 con 2 ítems (credito-consumo,
  simulador-renegociacion).
- `conversor-utm.astro`: patrón post-resultado completo (`UtmPostResultActions`,
  línea 340) + `NextSteps` (línea 375) — el único con post-result hoy.

### 2.2 Conjunto objetivo — `seguro-cesantia`

3 ítems (orden = recorrido del memo, no parrilla):

| Orden | `next_step_id` | href | Título | Descripción | CTA | Superficie |
|---|---|---|---|---|---|---|
| 1 | `finiquito` | `/calculadoras/finiquito-indemnizacion/` | "Calcular tu finiquito" | "Si ya terminó la relación laboral, revisa qué te corresponde por años de servicio." | Calcular → | existente |
| 2 | `fcs-condiciones` | `/posts/seguro-cesantia-cuenta-individual-vs-fondo-solidario/` | "Cuenta individual vs. Fondo Solidario" | "Cuándo el FCS complementa tu CIC y qué requisitos exige." | Leer guía → | existente |
| 3 | `tramite-afc` | `https://personas.afc.cl/` | "Trámite oficial en la AFC" | "Consulta tu saldo CIC real y la tabla del FCS con tu ClaveÚnica." | Continuar → | enlace oficial ya citado en la página |

Notas de diseño:
- `finiquito` y `fcs-condiciones` son reutilización de superficies existentes; no
  requieren contenido nuevo.
- `tramite-afc` es un **enlace externo**: el componente `NextSteps.astro` acepta
  cualquier href (el CTA por defecto cae en "Continuar →"), pero es la **primera
  vez que un NextSteps apuntaría fuera del sitio**. Decisión de implementación
  futura: mantener el enlace oficial en el post-result (patrón
  `UtmPostResultActions`) en vez de en NextSteps, o permitir externos con
  `rel`/`target` explícitos. El memo pide "trámite oficial" en el recorrido; no
  exige que sea interno.
- `reempleo` queda **fuera del set** hasta que el operador decida su superficie
  (hueco §1.1). No inventar URL.

### 2.3 Conjunto objetivo — `prepago-credito`

3 ítems (el recorrido completo ya existe; se ajusta el orden y se añade el 3º):

| Orden | `next_step_id` | href | Título | Descripción | CTA | Superficie |
|---|---|---|---|---|---|---|
| 1 | `costo-credito` | `/calculadoras/credito-consumo/` | "Costo real del crédito" | "Compara el costo antes de decidir el abono: seguro, comisiones y CAE." | Calcular → | existente (ya en baseline) |
| 2 | `ahorro-meta` | `/guias/ahorro-e-inversion/` | "Ahorro: qué hago con la cuota liberada" | "Dónde colocar el monto que dejas de pagar, según tu horizonte." | Explorar sección → | existente |
| 3 | `renegociacion` | `/calculadoras/simulador-renegociacion/` | "Simulador de renegociación" | "Si el problema ya es de pago, revisa la salida formal de deudas." | Calcular → | existente (ya en baseline) |

Notas de diseño:
- `fuente-cmf` (glosario CMF / informe deudas CMF vs DICOM) queda como 4º
  candidato: el recorrido del memo lo pone al final ("fuente CMF/SERNAC") y el
  componente muestra máximo 3 ítems — se prefiere el ahorro (paso intermedio)
  sobre la fuente final. Alternativa: sustituir `ahorro-meta` por `fuente-cmf`
  si los datos de clics posteriores muestran más demanda de verificación que de
  siguiente paso (decisión del operador, ver §5).

---

## 3. Extensión del patrón post-resultado a seguro-cesantia y prepago

### 3.1 Mecanismos actuales de `UtmPostResultActions.astro` (verificado completo)

- **Reveal**: sección `hidden` (línea 3) que se muestra al escuchar
  `calculator:result` (líneas 174-178). Ambos destinos **ya emiten ese evento**:
  `seguro-cesantia.astro:812` y `prepago-credito.astro:724`. El reveal
  post-completitud ya funciona sin cambios en las páginas.
- **BASE** (líneas 78-82): `calculator_id: "conversor-utm"`,
  `interaction_variant: "contextual_v1"` — **hardcodeado**.
- **ATTRIBUTION** (líneas 83-87): `utm_source: "conversor-utm"`,
  `utm_medium: "post-result"`, `utm_campaign: "utility-led-v1"` —
  **hardcodeado**.
- **Bloques**: 2 links de siguiente paso (`data-next-step-id`), bloque de
  interés (`data-alert-interest` + botón `data-alert-interest-submit`), bloque
  de apoyo (`data-support-block` + link `/apoyar/`).
- **Observación**: IntersectionObserver `threshold: 0.25`, una sola emisión por
  bloque (`recordShown`), `next_step_click` con UTM, `alert_interest_submit`
  una vez y deshabilita el botón, `support_click` con `support_location:
  "post_result"`.

### 3.2 Propuesta de generalización (solo diseño)

1. **Parametrizar `calculator_id` y `utm_source`**: convertir `BASE`/`ATTRIBUTION`
   en props del componente (`calculatorId`, `utmSource`) con default
   `"conversor-utm"` — cero cambio de comportamiento para el caso actual.
2. **Bloques por página según el registry**:
   - Apoyo (`support_shown`/`support_click`): aplica a ambas páginas si
     `support_click / support_shown ≥ 0,5%` (registry línea 12); sin superar el
     umbral, el bloque no se despliega (la sección `hidden` no se muestra).
   - Siguientes pasos: los sets de §2 (2-3 ítems), con `next_step_id` por ítem.
   - Aviso de interés (`alert_interest_shown`): solo donde el recorrido lo
     justifica. Candidato AFC: "aviso de cambio regulatorio de cesantía" (el
     memo lista "alerta de cambio regulatorio del cluster" como relación
     directa). En prepago, sin alerta candidata hoy (la UTM/UF ya cubre el
     aviso de valor en el conversor) → el bloque de interés NO se despliega en
     prepago en el piloto.
3. **Regla de colocación del memo**: "tras completar UTM, AFC o prepago; nunca
   antes ni en modal" — el patrón ya la cumple (reveal en `calculator:result`);
   la generalización no cambia ese mecanismo.
4. **Decisión de implementación futura (anotada, no decidida aquí)**:
   componente nuevo parametrizado vs. extensión del existente. La evaluación:
   - Extensión: 1 componente, pero `BASE`/`ATTRIBUTION` hardcodeados hoy exigen
     refactor de los 3 bloques; riesgo bajo-medio de regresión en conversor-utm.
   - Componente nuevo: duplica markup/scripts, pero aísla el riesgo y permite
     variantes por cluster (p. ej. sin bloque de interés en prepago). El plan de
     implementación futuro elegirá; esta evaluación recomienda **extensión
     parametrizada** por tamaño del repo (1 solo consumidor hoy).

---

## 4. Medición de cada paso

Denominadores y umbrales citados del
`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` (líneas 8-15):

| Señal | Denominador | GREEN | WATCH | Decisión al umbral |
|---|---|---|---|---|
| Resultado / inicio | `calculator_start` | ≥70% | 50–69,9% | <50% por 2 semanas: HALT |
| Siguiente paso / mostrado | `next_step_shown` | ≥8% inicial / ≥10% fuerte | 3–7,9% | <3%: no ampliar CTA |
| Interés aviso / mostrado | `alert_interest_shown` | ≥2% | 1–1,9% | <1%: no construir alertas |
| Apoyo click / mostrado | `support_shown` | ≥0,5% | 0,1–0,49% | nunca condiciona continuidad |

Regla de decisión (línea 15): no se decide con <2 semanas comparables ni con
integridad <95%; `support_confirmed` permanece sin datos hasta confirmación
fiable.

### Datos de partida (exports first-party W30–W32, re-verificados 2026-08-11)

| Calculadora | W30 v/s/c (c/s) | W31 v/s/c (c/s) | W32 v/s/c (c/s) |
|---|---|---|---|
| seguro-cesantia | 65/40/28 (**70%**) | 54/36/35 (**97%**) | 60/42/27 (**64%**) |
| prepago-credito | 55/40/21 (**53%**) | 35/22/9 (**41%**) | 40/26/17 (**65%**) |
| credito-consumo | 25/17/13 (76%) | 22/12/11 (92%) | 27/17/13 (76%) |
| simulador-renegociacion | 16/5/4 (80%) | 19/7/5 (71%) | 15/6/5 (83%) |
| conversor-utm (control) | 797/511/499 (98%) | 1215/694/675 (97%) | 1329/781/764 (98%) |

Lectura honesta (no fabricar señales):
- **seguro-cesantia**: complete/start GREEN (70/97/64; promedio ~77%). Volátil
  por muestra pequeña (40-42 starts/semana) — cualquier lectura necesita 2
  semanas comparables (registry línea 15).
- **prepago-credito**: WATCH→GREEN (53→41→65%); el memo exige ≥65%: solo la
  última semana lo cruza. No es un green establecido.
- **conversor-utm ya mide el patrón** desde W31: `next_step_shown`
  (convert-uf/adjust-inflation: 1-8 por día), `alert_interest_shown` (1-7/día),
  `support_shown` (2-7/día). Señales reales pero **bajo los umbrales de
  expansión** (next_step ~<8% de completes; alert <2%) — coherente con "medir
  antes de construir".

### Métricas objetivo por página (piloto)

- **seguro-cesantia**: denominador `calculator_start`; objetivo
  `next_step_click / next_step_shown ≥ 8%` (registry línea 10) y
  `calculator_complete / calculator_start ≥ 70%` (línea 8); soporte
  `support_click / support_shown ≥ 0,5%` (línea 12).
- **prepago-credito**: denominador `calculator_start`; objetivo
  `calculator_complete / calculator_start ≥ 65%` (memo, alineado con línea 8
  WATCH) y `next_step_click / next_step_shown ≥ 10%` (memo "≥10% siguiente
  paso"; línea 10).

### Verificación de colisiones

- `next_step_id` existentes en `src/` (grep `data-next-step-id`): solo
  `convert-uf` y `adjust-inflation` (conversor-utm). Los propuestos
  (`finiquito`, `fcs-condiciones`, `tramite-afc`, `costo-credito`,
  `ahorro-meta`, `renegociacion`) **no colisionan** y todos pasan
  `SAFE_TOKEN = /^[a-z0-9][a-z0-9._-]{0,79}$/` (analytics-events.ts:131).
- Interlinks (audit `audit-calculator-interlinks.mjs`, corrido 2026-08-11):
  seguro-cesantia 5 editorial/8 total, prepago 9/11, finiquito 8/11,
  credito-consumo 7/9, simulador-renegociacion 3/5 — **todos sobre el floor de
  3**; el diseño no duplica interlinks nuevos fuera de NextSteps/post-result.

---

## 5. Compuerta de decisión del operador

**Ningún ítem de este diseño se implementa sin firma del operador.**

1. **Recomendación preliminar de piloto — `prepago-credito` primero**:
   - Recorrido completo sin huecos (§1.2); 2 de 3 ítems ya existen en baseline.
   - Complete/start cruza el umbral del memo (≥65%) en W32 y el experimento
     "Utility-led en prepago" del memo es explícito (complete ≥65%, siguiente
     ≥10%, share ≥1%).
   - seguro-cesantia como **segundo** piloto: requiere decidir el hueco de
     reempleo y el enlace externo de trámite (§2.2), y su muestra semanal es
     menor (40-42 starts).
2. **Decisiones que solo el operador puede tomar**:
   - Aprobación del copy de cada CTA (§2.2/§2.3) — superficie YMYL, firma
     humana según NORMA_YMYL.
   - Elección del piloto y orden de despliegue (recomendación: prepago primero).
   - Hueco de reempleo (AFC): ¿sin CTA, CTA externo a fuente ya citada, o
     contenido futuro fuera del congelamiento?
   - Enlace externo en NextSteps (`tramite-afc`): ¿permitido o solo en
     post-result?
   - `ahorro-meta` vs `fuente-cmf` como 3º ítem de prepago.
   - Si la alerta de interés (AFC, cambio regulatorio) debe construirse tras
     superar su umbral — hoy es medición solamente (registry línea 11).
3. **Evidencia que cambiaría la recomendación**: 2 semanas comparables de
   `next_step_*` en conversor-utm (ya midiendo) y de complete/start en
   prepago/cesantia con integridad ≥95% (plan 053 como fuente de integridad).
