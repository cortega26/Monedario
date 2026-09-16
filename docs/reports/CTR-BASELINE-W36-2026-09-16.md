# CTR Baseline W36 — UTM/UF (registrado F0, pendiente sign-off owner)

**Plan:** `docs/backlog/PLAN-growth-utm-ctr-2026-09-16.md` (fase F0)
**Estado:** FIRMADO por el owner 2026-09-16. W36 congela como única
semana de comparación para F5.
**Fecha de registro:** 2026-09-16

> W37 llegó truncada (5 días: 09-07→09-11) y NO se usa como baseline.
> Este documento congela W36 como única semana de comparación.

## 1. Fuentes y ventana

Semana ISO **2026-W36 — 2026-08-31 → 2026-09-06 (7 días completos)**.
Integridad verificada: analytics contiene los 7 días
(08-31, 09-01, 09-02, 09-03, 09-04, 09-05, 09-06).

| Archivo fuente | `week` | Ventana | `fetchedAt` / filas |
|---|---|---|---|
| `output/operations/data-signals/gsc/2026-W36-pages.json` | 2026-W36 | 2026-08-31 → 2026-09-06 | 2026-09-10T10:33:08Z · 157 filas |
| `output/operations/data-signals/gsc/2026-W36-queries.json` | 2026-W36 | 2026-08-31 → 2026-09-06 | 2026-09-10T10:33:08Z · 6.139 filas |
| `output/operations/data-signals/gsc/2026-W36-query-page.json` | 2026-W36 | 2026-08-31 → 2026-09-06 | 2026-09-10T10:33:08Z · 6.341 filas |
| `output/operations/data-signals/analytics/2026-W36.json` | 2026-W36 | 2026-08-31 → 2026-09-06 | schema v2 · 357 filas |

Excluido: `2026-W37-*` (GSC + analytics). Analytics W37 solo trae
5 fechas (09-07→09-11) contra ventana declarada 09-07→09-13:
semana <7 días → no decidir (STOP del plan, precedente plan 111).

## 2. Baseline por URL (GSC pages)

| URL | Clics | Impresiones | CTR | Posición |
|---|---|---:|---:|---:|
| `https://monedario.cl/calculadoras/conversor-utm/` | 1.484 | 170.074 | 0,87% | 7,25 |
| `https://monedario.cl/calculadoras/conversor-uf/` | 6 | 24.831 | 0,02% | 9,69 |

Contexto sitio (suma `pages.json`, 157 filas):
**1.686 clics · 217.791 impresiones · CTR 0,77% · posición media
ponderada por impresiones 7,81.**
(Suma `queries.json`: 1.387 clics · 160.593 impresiones · CTR 0,86%;
la diferencia pages↔queries es agregación/anonimización propia de GSC,
no error de extracción.)

Nota query-page: `conversor-utm` atribuye 2.121 queries
(1.336 clics / 145.918 impr; el resto son queries anonimizadas por GSC).
`conversor-uf` atribuye 2.642 queries (6 clics / ~24,8k impr).
Las queries top UTM resuelven casi íntegramente a `conversor-utm`.

## 3. Baseline por query (GSC queries, top 10 con `utm`/`uf` por impresiones)

| # | Query | Clics | Impresiones | CTR | Posición |
|---:|---|---:|---:|---:|---:|
| 1 | `utm hoy` | 253 | 26.681 | 0,95% | 6,66 |
| 2 | `utm` | 368 | 20.658 | 1,78% | 6,73 |
| 3 | `valor utm` | 101 | 19.420 | 0,52% | 8,59 |
| 4 | `valor utm hoy` | 124 | 17.283 | 0,72% | 7,61 |
| 5 | `utm a peso chileno` | 67 | 6.991 | 0,96% | 7,59 |
| 6 | `utm a peso` | 26 | 2.998 | 0,87% | 7,74 |
| 7 | `1 utm` | 2 | 2.597 | 0,08% | 7,40 |
| 8 | `valor utm hoy chile` | 20 | 2.307 | 0,87% | 7,19 |
| 9 | `valor de la utm` | 8 | 2.097 | 0,38% | 8,73 |
| 10 | `utm valor` | 6 | 1.461 | 0,41% | 8,93 |

Las referencias del plan (`~2,2%` CTR, `~5,9` pos `utm hoy`,
`738/sem` UTM) son del W37 parcial y quedan sustituidas por estos
valores W36 verificados: **`utm` 1,78% @ 6,73 · `utm hoy` 0,95% @ 6,66**.

### Anexo UF (top queries `uf`, query-page de `conversor-uf`)

La demanda UF es dos órdenes menor y con CTR ~0% en W36:

| Query | Clics | Impresiones | CTR | Posición |
|---|---:|---:|---:|---:|
| `600 uf a pesos chilenos` | 0 | 237 | 0,00% | 9,24 |
| `600 uf` | 0 | 185 | 0,00% | 5,28 |
| `500 uf a pesos chilenos` | 0 | 148 | 0,00% | 12,11 |
| `80 uf` | 0 | 136 | 0,00% | 11,35 |
| `100 uf a pesos chilenos` | 0 | 113 | 0,00% | 10,59 |
| `uf hoy` | 0 | 102 | 0,00% | 9,51 |
| `cuanto son 10 uf` | 0 | 82 | 0,00% | 10,77 |
| `convertidor uf` | 0 | 63 | 0,00% | 9,41 |

## 4. Funnel first-party W36 (analytics)

Suma semanal por `calculator_id` (`calculator_view` / `start` / `complete`):

| Calculadora | `calculator_view` | `calculator_start` | `calculator_complete` | `complete/start` |
|---|---:|---:|---:|---:|
| `conversor-utm` | 1.280 | 856 | 842 | 98,4% |
| `conversor-uf` | 169 | 144 | 141 | 97,9% |

(`start/view`: UTM 66,9% · UF 85,2%. GSC-clics ≠ funnel:
miden instrumentos distintos —clic en buscador vs uso on-page— y no se mezclan.)

## 5. Superficies congeladas (solo-lectura durante la medición)

- **Ventana utility-led activa 2026-08-02 → 2026-11-02**
  (`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`):
  gobernanza de expansión vigente a nivel sitio; no es un freeze
  de títulos por URL, pero toda expansión sigue gated.
- **Sin ventana OBS/PR activa sobre UTM/UF detectada:**
  OBS-01 está cerrado (freeze del cohorte levantado);
  los cinco planes 2026-09-16
  (`PLAN-growth-utm-ctr`, `PLAN-result-panel-conversion`,
  `PLAN-content-refresh-consolidation`, `PLAN-ux-evolution-cta`,
  `PLAN-monetization-reevaluation`)
  están todos en TODO — ninguno mide hoy.
- **Medición futura declarada (coordinar, no congela hoy):**
  `PLAN-result-panel-conversion-2026-09-16` F4 prevé 2 semanas de
  medición del panel post-resultado con piloto en UTM y réplica en UF.
  Variable distinta (componente UI, no título/snippet); secuenciar para
  no mezclar efectos con F1/F2 de este plan.
- **Durante la ventana F5 (14–28 días):** títulos/meta/H1 de UTM y UF
  congelados salvo los edits secuenciados del propio plan
  (F1 snippet UTM, luego F2 snippet UF — nunca en paralelo);
  **todos los demás títulos quedan congelados** (mitigación § Change
  Control Record 8: una URL por vez).

## 6. Umbrales de éxito (del plan, a 28 días vs este baseline)

| Métrica | Baseline W36 registrado | Umbral éxito |
|---|---|---|
| Clics UTM (GSC pages) | 1.484/sem | +25% (≥1.855/sem) |
| CTR `utm` / `utm hoy` | 1,78% / 0,95% | ≥4% |
| Posición `utm hoy` | 6,66 | ≤4 y no peor que base |
| Clics UF — GSC pages | 6/sem | +15% (≥7/sem) |
| Completitudes UF — funnel | 141/sem | +15% (≥163/sem)¹ |
| RUM LCP p75 UTM/UF | ~900 ms (ref. plan) | sin regresión (>1.700 ms = revert) |

¹ El plan referencia `295 eventos calc` (W37 parcial). Instrumento a
confirmar en el sign-off: se congelan ambos (GSC 6/sem y funnel 141/sem).

Guardrails / STOP vigentes: caída de posición >2 puestos → `HALT` y
revertir; `check:routes` con added/removed inesperado → `HALT`;
semana incompleta (<7 días) → no decidir; afirmación YMYL numérica
sin fuente → `HALT`.
