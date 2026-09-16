# Registro de experimentos utility-led

**Ventana inicial:** 2026-08-02 a 2026-11-02
**Principio:** utilidad y confianza primero; ingresos cero no implican fracaso mientras el proyecto sea sostenible y produzca aprendizaje.

| Señal | Denominador | GREEN | WATCH | HALT de expansión |
|---|---|---:|---:|---:|
| Resultado / inicio | `calculator_start` | ≥70% | 50–69,9% | <50% por 2 semanas comparables |
| Error / inicio | `calculator_start` | <5% | 5–10% | >10% |
| Siguiente paso / mostrado | `next_step_shown` | ≥8% señal inicial; ≥10% fuerte | 3–7,9% | <3%: no ampliar CTA |
| Interés aviso / mostrado | `alert_interest_shown` | ≥2% | 1–1,9% | <1%: no construir alertas |
| Apoyo click / mostrado | `support_shown` | ≥0,5% | 0,1–0,49% | nunca condiciona continuidad |
| Apoyo confirmado / completitud | `calculator_complete` | ≥0,1% | señal insuficiente | retirar tras 2.000 completitudes sin confirmación |

No se decide con menos de dos semanas comparables o con integridad <95%. `support_confirmed` permanece sin datos hasta una confirmación fiable. No se interpreta click como aporte ni UTM como retorno individual. El experimento de apoyo también se retira si `calculator_complete / calculator_start` cae más de 5 puntos porcentuales respecto del baseline comparable.

### Regla de denominador mínimo

Ninguna señal se declara GREEN, WATCH o HALT si su denominador acumulado en la
ventana comparable no alcanza el mínimo que permita descartar el umbral con 95%
de confianza. La fórmula, para que sea reproducible sin este documento:

`n_min = ceil( ln(0,05) / ln(1 − p_umbral) )`, donde `p_umbral` es el umbral
GREEN de la fila (o el umbral HALT cuando la fila lo define en esos términos).

| Señal | Umbral de referencia | `n_min` | Denominador acumulado W31–W35 |
|---|---:|---:|---:|
| Siguiente paso / mostrado | 3% (HALT) | 99 | 108 — **suficiente** |
| Interés aviso / mostrado | 2% (GREEN) | 149 | 79 — insuficiente |
| Apoyo click / mostrado | 0,5% (GREEN) | 598 | 62 — insuficiente |

**Consecuencia**: denominador insuficiente se reporta como `SIN DATOS SUFICIENTES`, nunca como HALT ni como 0%. Un cero con denominador chico no es evidencia de ausencia de demanda.

### Umbrales F0 — panel post-resultado (plan 2026-09-16, FIRMADO 2026-09-16)

`P(0) = (1 − p)^n`; `n_min = ceil( ln(0,05) / ln(1 − p) )` al 95% de
confianza. Sin veredicto bajo `n_min`: `SIN DATOS SUFICIENTES`, nunca
HALT ni 0%.

| Señal | p de decisión | `n_min` | n semanal W36 (2026-08-31→09-06) | Semanas estimadas |
|---|---|---:|---:|---:|
| `next_step_click` / `next_step_shown` | 3% (HALT: no ampliar CTA) | 99 | 117 | ~1 |
| `alert_interest_submit` / `alert_interest_shown` | 2% (GREEN) | 149 | 22 | ~7 |
| `support_click` / `support_shown` | 0,5% (GREEN) | 598 | 18 | ~34¹ |
| `share_success` / `calculator_complete` | 1% (supuesto F0, sin base) | 299 | 1091 `complete`; 0 eventos share | ~1 tras instrumentar (F2) |
| `source_click` / `calculator_complete` | direccional, sin umbral | — | 8/1091 | intervalo Wilson 95% semanal² |

¹ ~34 semanas excede la ventana (cierra 2026-11-02): sin subida de
`support_shown` no hay veredicto en ventana; subir la entrega es el
objetivo F2. ² Éxito = subida sostenida 4 semanas comparables, sin
veredicto puntual. W36: 0,73% Wilson 95% [0,37%, 1,44%] (referencia, no
veredicto).

Supuesto share: p = 1% aceptado como interino el 2026-09-16 (cero
eventos share en W36); la regla +50% vs base rige solo tras medir base
con n ≥ `n_min`.
W37 (2026-09-07→09-13) truncada a 5 días: no usar como denominador.
Discrepancia resuelta 2026-09-16 (sign-off owner): el plan pedía
`next_step` ≥3% con n≥149, pero la fórmula da `n_min` = 99 al 3%
(149 corresponde al 2%); **vale el cálculo (99)**.

## Gate de sostenibilidad semanal

- Horas: ≤6 GREEN; 6–10 WATCH; >10 durante tres semanas detiene expansión y obliga a reducir alcance.
- Costos directos: ≤$25.000 CLP/mes GREEN; sobre ese nivel requiere decisión explícita de presupuesto.
- Agotamiento (autoevaluación 1–5): 1–2 GREEN; 3 WATCH; 4–5 durante dos semanas detiene expansión.
- Calidad: cero incidentes críticos; un incidente crítico pone el estado en HALT hasta corregirlo.
- Aprendizaje/crecimiento: al menos una señal verificable mensual.
- Reputación: evidencia cualitativa permitida (menciones, feedback profesional, uso demostrable), sin inventar equivalencia monetaria.

Estos umbrales gobiernan carga y expansión, no ordenan cerrar Monedario. Perseverar con costo bajo y aprendizaje real es una decisión válida.

### Dónde se registran estos números

Estos valores se registran cada semana en
`output/operations/weekly-search-performance/<semana>/utility-led-ops.json`
(por ejemplo, `output/operations/weekly-search-performance/2026-W35/utility-led-ops.json`).
El generador semanal (`scripts/build-weekly-search-report.mjs`, función
`readUtilityOps`) lee ese archivo y lo agrega en la sección
`## Utility-led operating gate` del scorecard. Correspondencia campo → viñeta:

| Viñeta del gate | Campo en `utility-led-ops.json` |
|---|---|
| Horas | `weeklyHours` |
| Costos directos | `weeklyCostClp` |
| Agotamiento | `burnoutLevel1To5` |
| Calidad | `qualityIncidents` (severidad `critical` fuerza HALT) |
| Aprendizaje/crecimiento | `learningSignal` |
| Reputación | `reputationSignal` |

Si `weeklyHours`, `weeklyCostClp` o `burnoutLevel1To5` llegan en `null`, el
scorecard imprime `Gate D: SIN REGISTRO` en vez de omitir la sección en
silencio o de mostrar un estado que se confunda con GREEN/WATCH/HALT. No se
deben inventar valores retroactivos para semanas pasadas: dejar `null` y
reportarlo es el comportamiento correcto.

### Rutina de captura semanal (Gate D)

- Responsable: el operador que corre el ritual semanal
  (`docs/operations/runbooks/weekly-search-performance-ritual.md`, inputs
  §4). El workflow programado solo inicializa el bundle; los valores los
  completa una persona.
- Cadencia: cada semana, en el mismo bloque de trabajo que los exports de
  GSC/analytics y antes de decidir expansión. El archivo vive en el bundle
  semanal (`output/operations/weekly-search-performance/<semana>/`) y nace
  con los tres campos en `null` desde la plantilla
  (`docs/operations/templates/utility-led-weekly-ops.json`, vía `--init`).
- Qué obliga cada `null`: cualquiera de los tres en `null` deja el Gate D
  en `SIN REGISTRO` y bloquea la decisión de expansión hasta completarlo.
  Los `null` históricos se conservan: jamás se rellenan semanas pasadas.

### Taxonomía del titular (`utilityLed.status`)

El titular distingue tres situaciones que antes colapsaban en un solo
`WATCH`; cada una obliga algo distinto y la consume el operador en la
llamada semanal de parar/expandir (ventana hasta 2026-11-02):

| Titular | Cuándo | Qué obliga al lector |
|---|---|---|
| `INPUT_REQUIRED` | falta el archivo o alguno de los tres campos sigue en `null` | completar `utility-led-ops.json` antes de decidir expansión; no es una brecha, es un dato pendiente |
| `WATCH` (brecha) | valores presentes pero sobre umbral (horas, costo, agotamiento) o tasa de error >10% | revisar carga/presupuesto/funnel antes de expandir |
| `HALT` / `GREEN` | incidente crítico o analytics ausente / todo dentro de umbral | sin cambios: detener expansión / seguir igual |

`SIN REGISTRO` no es un valor del titular: es la línea del Gate D que se
imprime en la sección operativa cuando el estado de operaciones es
`INPUT_REQUIRED`, y el titular muestra `INPUT_REQUIRED` en ese caso.
