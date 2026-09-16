# CALCULATOR-REGISTRY — Registro central de calculadoras

**Owner:** PLAN-measurement-integrity-2026-09-16 (F1) · **Fecha:** 2026-09-16
**Fuente:** `src/pages/calculadoras/*.astro` (22 páginas reales + `index.astro`)
**Contrato:** `src/contracts/analytics-events.ts` (taxonomía v2)

## Reglas de estabilidad

1. `calculator_id` es el slug de la ruta (`/calculadoras/<id>/`) y es
   ESTABLE: nunca derivar IDs de strings visibles (títulos, etiquetas CTA).
2. Sin renombrar rutas públicas sin ADR + snapshot de rutas/RSS antes/después
   (`ROUTES.NO_SILENT_CHANGES`, `URL.PUBLIC.NO_POST_ID`).
3. Todo emisor usa su `calculator_id` de esta tabla; `calculator_name`,
   `cta_label` y `article_title` son solo-cliente (dataLayer) y nunca se
   transmiten (`CLIENT_ONLY_PARAMS`).
4. Buckets no-registry esperados en exports (ver § Cross-check W36):
   `calculator` (fallback `page_type` del worker) y `unknown` (eventos sin
   alcance de calculadora). No son calculadoras; no entran a esta tabla.

## Categorías

`income` · `employment` · `pension` · `investment` · `debt` · `credit` ·
`housing` · `taxation` · `indexation`

## Registro (22/22)

| calculator_id | Nombre público (de la página) | Categoría | Ruta |
|---|---|---|---|
| `actualizador-inflacion` | Calculadora IPC Chile — Actualiza pesos por inflación | indexation | `/calculadoras/actualizador-inflacion/` |
| `apv` | Simulador APV Chile 2026: Régimen A o B | pension | `/calculadoras/apv/` |
| `boleta-honorarios-liquido` | Calculadora Boleta de Honorarios 2026 — Líquido y retención | income | `/calculadoras/boleta-honorarios-liquido/` |
| `comisiones-afp` | Comisiones AFP 2026: compara cuál es la más barata | pension | `/calculadoras/comisiones-afp/` |
| `conversor-uf` | Conversor UF a Pesos Chilenos: valor oficial de hoy | indexation | `/calculadoras/conversor-uf/` |
| `conversor-utm` | Conversor UTM a Pesos Chilenos (Valor UTM hoy) | indexation | `/calculadoras/conversor-utm/` |
| `credito-consumo` | Calculadora de CAE y cuota de tu crédito de consumo | credit | `/calculadoras/credito-consumo/` |
| `deposito-a-plazo` | Calculadora Depósito a Plazo Chile 2026 | investment | `/calculadoras/deposito-a-plazo/` |
| `dividendo-hipotecario` | Calculadora de Dividendo Hipotecario Chile 2026 | housing | `/calculadoras/dividendo-hipotecario/` |
| `finiquito-indemnizacion` | Calculadora de Finiquito e Indemnización — Chile | employment | `/calculadoras/finiquito-indemnizacion/` |
| `gratificacion-legal` | Calculadora de Gratificación Legal Chile 2026 | employment | `/calculadoras/gratificacion-legal/` |
| `impuesto-segunda-categoria` | Calcula tu Impuesto Único 2026 — Segunda Categoría | taxation | `/calculadoras/impuesto-segunda-categoria/` |
| `interes-compuesto` | Calculadora de Interés Compuesto | investment | `/calculadoras/interes-compuesto/` |
| `iva` | Calculadora de IVA Chile 19% — Neto y Bruto | taxation | `/calculadoras/iva/` |
| `operacion-renta` | Simulador Operación Renta 2026 Chile | taxation | `/calculadoras/operacion-renta/` |
| `prepago-credito` | ¿Conviene prepagar el crédito? Simulador hipotecario y consumo | debt | `/calculadoras/prepago-credito/` |
| `reajuste-arriendo` | Calculadora de Reajuste de Arriendo — UF, IPC y Pesos | housing | `/calculadoras/reajuste-arriendo/` |
| `seguro-cesantia` | Calculadora de Seguro de Cesantía (AFC y Fondo Solidario) | employment | `/calculadoras/seguro-cesantia/` |
| `simulador-jubilacion` | Simulador de Jubilación Chile — Proyección AFP | pension | `/calculadoras/simulador-jubilacion/` |
| `simulador-renegociacion` | Renegociación de Deudas Chile 2026 — Simulador Superir | debt | `/calculadoras/simulador-renegociacion/` |
| `sueldo-liquido` | Calculadora de Sueldo Líquido y Bruto Chile 2026 | income | `/calculadoras/sueldo-liquido/` |
| `tarjeta-credito` | Costo Real de Tarjeta de Crédito — Pago Mínimo | credit | `/calculadoras/tarjeta-credito/` |

Verificación de emisores 2026-09-16: las 22 páginas declaran
`data-analytics-calculator` y emiten su propio slug como `calculator_id`
(`calculator_slug` legacy normalizado en `sueldo-liquido` vía
`src/utils/sueldo-liquido/formController.ts`). 22/22.

## Cross-check contra export W36 (semana completa 2026-08-31→2026-09-06)

Fuente: `output/operations/data-signals/analytics/2026-W36.json`
(7/7 días; W37 truncada excluida como evidencia por doctrina A2).

- IDs reales distintos en W36: 22 → **resuelven 22/22** en esta tabla.
- Buckets no-calculadora observados (esperados, fuera de tabla):
  - `calculator` (`next_step_click`, `source_click` sin `calculator_id`;
    el worker usa `params.page_type` como slug,
    `workers/analytics-collector/src/worker-v2.ts:457`).
  - `unknown` (`article_calculator_cta_click`, `source_click` de páginas
    de artículo; ni `calculator_id` ni `page_type` presentes).
- Gap conocido (NO corregido aquí, owned por
  `PLAN-result-panel-conversion-2026-09-16.md` F1):
  `src/components/NextSteps.astro:61,143-146,172-179` omite
  `calculator_id` fuera de `/calculadoras/<slug>/` por diseño
  (`deriveCalculatorId` retorna `undefined`), lo que alimenta parte del
  bucket `calculator`/`unknown` en `next_step_*`.
