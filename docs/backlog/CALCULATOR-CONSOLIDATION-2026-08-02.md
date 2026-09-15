# Dossier de Consolidación de Calculadoras — 5 URLs candidatas

Fecha de corte de datos: 2026-08-11 (GSC W32, analytics W30–W32)
Entregable del spike 055 — **read-only: no mueve rutas, no decide nada**
Fuente de la clasificación: memo de viabilidad estratégica 2026-08-02
(`output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`, untracked)

---

## Resumen ejecutivo

El memo clasifica 5 calculadoras como **"Consolidar"**: APV, Comisiones AFP,
Boleta de honorarios, Gratificación legal y Tarjeta de crédito. Este dossier
cruza esa clasificación con datos reales por URL (GSC W32 + analytics
first-party W30–W32) y el inventario funcional de cada página.

**Hallazgo principal:** los datos W32 **matizan** la clasificación del memo:

- **APV** — a W32 era la única de las 5 con actividad real: 3 clics GSC, 37
  views / 17 starts / 14 completes (W32), en ascenso entonces (2→8→14
  completes en 3 semanas). Esa serie W30–W32 es histórica y ya no representa el estado
  actual: W34/W35 cayeron a 19,0%/14,3% de completitud, bajo el piso HALT
  de 50% ("Resultado / inicio"), con causa no identificada según el
  diagnóstico 086
  (`docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md`). La
  clasificación "activación baja" era cierta para W30 pero **no se
  sostenía en W32**. Recomendación preliminar: **mantener** (re-evaluar),
  no consolidar — el veredicto no cambia, solo su cita (ver §3.1).
- **Comisiones AFP, Boleta de honorarios, Gratificación legal, Tarjeta de
  crédito** — datos consistentes con "activación baja": ≤1 click GSC W32,
  ≤10 views y ≤5 completes por semana. Recomendación preliminar: consolidar o
  noindex según URL (ver §5).

Datos clave: de las 22 calculadoras, conversor-utm concentra el tráfico
(1093 clics W32); las 5 candidatas suman **5 clics GSC en W32** (4% del total de
calculadoras no-UTM). Ninguna de las 5 aparece en el top-10 de páginas GSC.

---

## 1. Datos por URL

### 1.1 GSC W32 (páginas)

| URL | clicks | impresiones | CTR | pos. |
|---|---|---|---|---|
| `/calculadoras/apv/` | 3 | 250 | 1.2% | 8.56 |
| `/calculadoras/comisiones-afp/` | 1 | 968 | 0.1% | 9.31 |
| `/calculadoras/boleta-honorarios-liquido/` | 0 | 25 | 0% | 10.4 |
| `/calculadoras/gratificacion-legal/` | 0 | 37 | 0% | 6.84 |
| `/calculadoras/tarjeta-credito/` | 0 | 50 | 0% | 7.96 |
| **Suma 5 candidatas** | **4** | **1330** | — | — |

Fuente: `output/operations/data-signals/gsc/2026-W32-pages.json`.
Posts hermanos también sin clics (gratificacion-legal-chile 0, que-es-el-apv 0,
tarjeta-credito-costo-real-chile 0).

### 1.2 GSC W32 (query-page)

145 rows query-page tocando las 5 URLs: **0 rows con clicks > 0**.
Las queries de APV son informativas/definitorias ("apv qué es", "apv régimen a",
"beneficios apv") con 1–5 impresiones cada una — no hay demanda transaccional
demostrada vía GSC en W32.

### 1.3 Analytics first-party (eventos agregados)

| Calculadora | W30 v/s/c | W31 v/s/c | W32 v/s/c | Tendencia |
|---|---|---|---|---|
| apv | 35/9/2 | 27/12/8 | 37/17/14 | 2→8→14 en W30–W32 (serie histórica; estado actual en §3.1) |
| comisiones-afp | 6/0/0 | 10/3/3 | 8/1/1 | marginal |
| boleta-honorarios-liquido | 1/0/0 | 3/0/0 | 4/2/2 | marginal |
| gratificacion-legal | 14/4/3 | 4/3/3 | 6/5/3 | marginal |
| tarjeta-credito | 2/1/1 | 2/1/1 | 5/1/1 | marginal |

Fuente: `output/operations/data-signals/analytics/{W30,W31,W32}.json`
(0 errores en las 5; complete/start: APV 82% en W32).

### 1.4 Limitaciones

- W29 sin export GSC (plan 053); W30–W32 disponibles y usados. W32 es la
  semana más reciente completa.
- Muestras pequeñas: APV ~37 views/semana; las otras 4 < 10 views. Una sola
  semana no basta para decidir (el registry del repo exige 2 semanas
  comparables para experimentos).

---

## 2. Inventario funcional por página

### 2.1 APV — `/calculadoras/apv/`

- **Propósito declarado**: "Simulador APV Chile 2026: ¿cuánto ahorras en
  Régimen A o B?" — compara régimen A/B con foco en ahorro tributario.
- **Motor**: `CalculateApvComparison` (use-case en `src/domain/` + metodología).
- **Parámetros**: UTM del snapshot económico (`monthlyRegimeATarget = 40·utm/12`,
  `annualRegimeABonusCap = 6·utm`), `AFP_COMMISSIONS_PERCENT`.
- **Destino natural del memo**: `simulador-jubilacion` (pensiones) — existe
  (`src/pages/calculadoras/simulador-jubilacion.astro`). Validación: la
  comparación A/B es un pre-requisito de decisión previsional distinta de la
  proyección de pensión; integrarla diluiría el JTBD.
- **Enlaces entrantes**: 16 superficies (glosario global-complementario/apv/
  operacion-renta, posts que-es-el-apv/reforma-previsional/operacion-renta-f22,
  calculadoras operacion-renta/simulador-jubilacion, hub ahorro-e-inversion,
  buscar, calendario, uf-hoy, 4 configs).

### 2.2 Comisiones AFP — `/calculadoras/comisiones-afp/`

- **Propósito**: "Comisiones AFP 2026: compara cuál es la más barata".
- **Motor**: `CompareAfpCommissions` + `AFP_COMMISSIONS_PERCENT` (constantes
  legales, 8 AFPs).
- **Parámetros**: solo `AFP_COMMISSIONS_PERCENT` — **sin dependencias
  económicas dinámicas** (no usa snapshot). Es el más barato de mantener.
- **Destino natural del memo**: "dato comparativo, no calculadora" — candidatos:
  post `como-leer-cartola-afp-chile.md`, hub `guias/pensiones-afp/`. El
  comparador de 8 AFPs es una tabla, no un cálculo.
- **Enlaces entrantes**: 7 (glosario afp, post como-leer-cartola-afp,
  glosario index, hub pensiones-afp, calendario, 2 configs).

### 2.3 Boleta de honorarios líquido — `/calculadoras/boleta-honorarios-liquido/`

- **Propósito**: "Calculadora Boleta de Honorarios 2026 | Líquido y retención".
- **Motor**: `CalculateHonorariosNet` (honorarios brutos → neto con retención).
- **Parámetros**: retención fija (constante legal); no usa snapshot económico.
- **Destino natural del memo**: "integrar en impuesto/renta" — candidatos:
  `operacion-renta`, `impuesto-segunda-categoria` (ambos existen). Ojo:
  `boleta-honorarios-liquido` calcula **líquido mensual** (flujo de caja), no
  impuesto anual — solape parcial con operacion-renta, no duplicado exacto.
- **Enlaces entrantes**: 6 (glosario boleta-honorarios, post
  boleta-honorarios-2026-retencion-cobertura, hub sueldo-remuneraciones,
  3 configs).

### 2.4 Gratificación legal — `/calculadoras/gratificacion-legal/`

- **Propósito**: "Calculadora de Gratificación Legal Chile 2026 | Tope 4,75 IMM".
- **Motor**: cálculo directo en página + constantes `DEFAULT_IMM`,
  `DEFAULT_IMM_EFFECTIVE_DATE` (constantes legales gestionadas) y
  `economicParameters.imm` del snapshot.
- **Parámetros**: IMM del snapshot + tope 4.75 (constante legal).
- **Destino natural del memo**: "integrar en sueldo/finiquito" — candidatos:
  `sueldo-liquido` (7 menciones de gratificación/finiquito ya presentes en esa
  página), `finiquito-indemnizacion`. El cálculo es una sección de liquidación
  de sueldo clásica — encaja en `sueldo-liquido` sin duplicar motor.
- **Enlaces entrantes**: 2 (glosario gratificacion, calculatorPortfolio) — la
  **más aislada** de las 5.

### 2.5 Tarjeta de crédito — `/calculadoras/tarjeta-credito/`

- **Propósito**: "Costo Real de Tarjeta de Crédito | Pago Mínimo".
- **Motor**: `SimulateCreditCardCost`.
- **Parámetros**: sin dependencias económicas dinámicas.
- **Destino natural del memo**: "integrar en costo de crédito" — candidato:
  `credito-consumo` (existe, ya enlaza a tarjeta-credito vía portfolio).
- **Enlaces entrantes**: 6 (posts tarjeta-credito-costo-real/cae-costo-real,
  credito-consumo, hub deuda-credito, 2 configs).

---

## 3. Opciones por URL (con trade-offs)

### 3.1 APV — recomendación: **MANTENER (re-evaluar)**

| Opción | Esfuerzo | Riesgo | Trade-off |
|---|---|---|---|
| Mantener tal cual | — | LOW | A W32 los datos contradecían "activación baja": 14 completes/semana (82% complete/start) y 16 superficies que enlazan. Esa serie es histórica (ver Dato decisivo). Costo de mantenimiento real: UTM del snapshot + comisiones AFP. |
| Integrar en simulador-jubilacion + redirigir | M | MED | Diluye un JTBD distinto (comparación A/B vs. proyección de pensión); pierde 16 enlaces entrantes y el momentum W32. |
| Noindex + mantener | S | LOW | Esconde una página con uso real creciente. |
| Convertir en dato comparativo | M | MED | Regresión del único caso de uso con completes reales. |

**Dato decisivo (cita actualizada 2026-09-15 — no es un cambio de
decisión)**: a W32, APV era la única de las 5 que **no** cumplía el criterio
de consolidación del memo ("activación baja"): 14 completes/semana (82%
complete/start). Esa serie W30–W32 ya no representa el estado actual:
W34/W35 muestran 19,0%/14,3% de completitud, bajo el piso HALT de 50% de
"Resultado / inicio", con causa no identificada según el diagnóstico 086
(`docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md`). El veredicto
MANTENER sigue vigente como decisión de no consolidar — el diagnóstico no
encontró defecto de producto que justifique retirar la calculadora — pero
su argumento citado pasa a ser W34/W35 + 086, no el ascenso W30–W32.
Cualquier decisión futura de mantener/consolidar APV requiere datos
posteriores a W35.

### 3.2 Comisiones AFP — recomendación: **CONVERTIR EN DATO COMPARATIVO**

| Opción | Esfuerzo | Riesgo | Trade-off |
|---|---|---|---|
| Mantener tal cual | — | LOW | 1 click GSC/semana, 1 complete; costo: tabla de 8 AFPs que se actualiza sola (sin snapshot) — bajo, pero 0 uso. |
| Convertir en sección comparativa (post/hub pensiones-afp) + redirigir | M | MED | El dato (8 comisiones) ya existe en `AFP_COMMISSIONS_PERCENT`; la intención "comisión más barata" es informativa, no transaccional. Hace falta contenido nuevo (YMYL, firma humana). |
| Noindex + mantener | S | LOW | La URL se mantiene viva pero fuera del índice; preserva el enlace del hub sin pagar el costo de indexación. |
| Integrar en como-leer-cartola-afp | M | MED | Encaja temáticamente; requiere mover la tabla + redirect. |

### 3.3 Boleta de honorarios — recomendación: **CONSOLIDAR en operacion-renta (o noindex)**

| Opción | Esfuerzo | Riesgo | Trade-off |
|---|---|---|---|
| Mantener tal cual | — | LOW | 0 clicks GSC, ≤4 views, 2 completes/semana; el único uso real es el post hermano. |
| Integrar líquido mensual en operacion-renta + redirigir | M | MED | Solape parcial (líquido mensual vs. impuesto anual); el cálculo de líquido mensual puede vivir como sección. Requiere ADR + copy firmado. |
| Noindex + mantener | S | LOW | Costo de mantenimiento casi nulo (sin snapshot); la URL queda para quien llegue por el post. |
| Integrar en impuesto-segunda-categoria | M | MED | Menos natural: esa página es anual, no mensual. |

### 3.4 Gratificación legal — recomendación: **CONSOLIDAR en sueldo-liquido**

| Opción | Esfuerzo | Riesgo | Trade-off |
|---|---|---|---|
| Mantener tal cual | — | LOW | 0 clicks GSC, 6 views, 3 completes; solo 2 enlaces entrantes (la más aislada); mantiene el tope 4,75 IMM como constante espejada. |
| Integrar en sueldo-liquido + redirigir | M | MED | El cálculo es una sección de liquidación clásica; sueldo-liquido ya menciona gratificación (7 veces). Ganancia: menos superficie YMYL que mantener. |
| Noindex + mantener | S | LOW | Menor riesgo, pero deja el costo de la constante espejada sin uso indexable. |
| Integrar en finiquito-indemnizacion | M | MED | Encaja (gratificación en finiquito), pero sueldo-liquido es el destino más visitado. |

### 3.5 Tarjeta de crédito — recomendación: **CONSOLIDAR en credito-consumo**

| Opción | Esfuerzo | Riesgo | Trade-off |
|---|---|---|---|
| Mantener tal cual | — | LOW | 0 clicks GSC, 5 views, 1 complete; la fórmula (pago mínimo) "no diferencia" según el memo. |
| Integrar en credito-consumo + redirigir | M | MED | credito-consumo ya enlaza a tarjeta-credito (portfolio); el costo de tarjeta es un modo del costo de crédito. Requiere ADR + copy. |
| Noindex + mantener | S | LOW | El dato sigue vivo para el post hermano; fuera del índice. |
| Convertir en dato (post tarjeta-credito-costo-real-chile) | M | MED | El post ya existe y cubre la intención; la calculadora duplicaría el contenido. |

---

## 4. Protocolo de ejecución (para cuando se decida, NO ejecutar ahora)

Cualquier opción que toque una ruta pública (redirigir/noindex) debe pasar por
este protocolo, citando los invariantes `ROUTES.NO_SILENT_CHANGES` y
`RSS.NO_REMOVALS` (`context/INVARIANTS.md:51-52`):

1. **ADR previo por URL**: `docs/adr/ADR-YYYYMMDD-consolidar-<slug>.md` con
   `docs/adr/_TEMPLATE.md` (Context/Decision/Consequences/Alternatives), citando
   la evidencia de este dossier.
2. **Snapshot de rutas**:
   `pnpm run routes:snapshot` (baseline) → `pnpm run check:routes` (el diff
   debe ser el esperado, aprobado y no silencioso).
3. **RSS**: `pnpm run rss:snapshot` + `pnpm run check:rss`. **Una URL en RSS no
   se puede quitar** (`RSS.NO_REMOVALS`): la opción de redirigir debe prever
   mantener/mover la entrada; la de noindex no toca RSS.
4. **Freeze de indexables**: `pnpm run check:indexable-url-freeze` — el set
   indexable (184 URLs) cambia → requiere actualización deliberada del freeze
   vía `scripts/lib/url-freeze-exceptions.mjs` (esquema `isCompleteException`,
   refactor del plan 070), no silenciosa.
5. **Canónicos/redirects**: destino canónico explícito, manejo de `canonical`
   y verificación post-deploy con URL Inspection (gate `check:indexable` +
   GSC).
6. **YMYL**: el contenido financiero nuevo requiere el pipeline editorial y
   firma humana (`NORMA_YMYL`); las opciones "convertir en dato" son las que
   más copy nuevo exigen.

Nota: la ejecución de cualquier opción es un **plan futuro separado** con su
propio despacho; este dossier es el insumo, no la orden.

---

## 5. Recomendaciones preliminares y compuerta de decisión

| URL | Datos W32 | Recomendación preliminar | Evidencia que la cambiaría |
|---|---|---|---|
| APV | W34 19,0% / W35 14,3% (HALT; antes: 37v/17s/14c en W32) | **MANTENER** (cita actualizada, ver §3.1) | Solo con datos posteriores a W35 |
| Comisiones AFP | 1 click, 8v/1s/1c | **Convertir en dato comparativo** (post/hub) o noindex | Si la query "comisión más barata" sube |
| Boleta honorarios | 0 clics, 4v/2s/2c | **Consolidar en operacion-renta** o noindex | Si la intención mensual se demuestra en queries |
| Gratificación legal | 0 clics, 6v/5s/3c | **Consolidar en sueldo-liquido** | Si el post hermano gana tráfico |
| Tarjeta de crédito | 0 clics, 5v/1s/1c | **Consolidar en credito-consumo** | Si la intención "pago mínimo" aparece en GSC |

### Compuerta de decisión humana (no ejecutar nada sin esto)

Preguntas por URL para el operador:

1. **APV**: ¿aceptas re-evaluar en 2 semanas (W33–W34) antes de decidir, dado
   que los datos W32 contradicen la clasificación del memo?
2. **Comisiones AFP**: ¿prefieres la vía "dato comparativo" (contenido nuevo,
   más copy YMYL) o "noindex" (más barata, sin contenido nuevo)?
3. **Boleta de honorarios**: ¿integrar en operacion-renta (solape parcial) o
   solo noindex?
4. **Gratificación legal**: ¿integrar en sueldo-liquido (destino más visitado)
   o en finiquito-indemnizacion (encaje temático)?
5. **Tarjeta de crédito**: ¿integrar en credito-consumo o noindex?
6. Cada consolidación con redirección requiere ADR + snapshot de rutas/RSS +
   actualización deliberada del freeze — ¿se ejecutan en lote (un plan por
   URL) o de una?

Regla del memo: **"Ninguna retirada debe ejecutarse sin evidencia por URL y
plan de migración"** — este dossier es la evidencia por URL; el plan de
migración es el plan futuro por URL.
