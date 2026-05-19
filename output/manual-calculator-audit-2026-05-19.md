# Manual Calculator Audit — 2026-05-19

Scope: headed Playwright manual run against local preview at `http://localhost:4321`, with 3 scenarios per public calculator route.

Coverage note: the live public calculator surface currently includes 17 routes because `interes-compuesto` is also public under `src/pages/calculadoras/`.

## Summary

- Total calculator routes tested: `17`
- Total manual scenarios executed: `51`
- Math/status verdict:
  - `16/17` calculators were numerically consistent with independent checks at displayed precision
  - `1/17` calculator showed a UI defect in part of the result rendering
- Confirmed defect:
  - `prepago-credito`: the investment-alternative block renders `NaN%`, `Valor futuro $NaN`, and `Ganancia estimada $NaN` while the prepayment-savings block still computes

Screenshot evidence for the defect:
- [prepago_nan.png](/home/carlos/VS_Code_Projects/Monedario/output/playwright/prepago_nan.png)

## Calculator Matrix

| Calculator | Cases | Browser result | Hand-check | Verdict | Notes |
|---|---|---|---|---|---|
| `sueldo-liquido` | `900k / 1.5m / 4.5m` | `$736.380 / $1.177.590 / $3.615.050` | Case 1: `900000 × (1 - 10.58% - 7% - 0.6%) = 736380`; case 2 tax delta `≈ $9.360`; case 3 totals reconcile to displayed deductions | Consistent | Used real UI AFP/health selections |
| `boleta-honorarios-liquido` | `500k×10 / 500k×12 / 250k@16%` | `$423.750 / $423.750 / $210.000` | `500000 × 15.25% = 76250`; `5000000 × 80% = 4000000`; `3600000 × 16% = 576000` | Consistent | Annual coverage and monthly equivalent matched |
| `operacion-renta` | `18m sueldo / mixto+APV / honorarios+arriendo` | `devol. $887.410 / $963.410 / $1.525.000` | Visible bases, credits, and net refund direction were internally coherent | Consistent | Values differ from older regression constants because UI uses newer snapshot values |
| `finiquito-indemnizacion` | `4a7m necesidad / 14a2m renuncia / 2a6m judicial` | `$6.078.750 / $150.000 / $3.900.000` | Case 1: pending `$360000`, vacation `10.625 días`, vacation amount `$318750`, total `$6078750`; case 3: 3 years counted, 30% surcharge on `$3000000` = `$900000` | Consistent | The 6-month judicial rounding branch now behaved correctly in the UI |
| `impuesto-segunda-categoria` | `900k / 1.2m / 4.5m` | `$0 / $9.882 / $290.560` | Case 2: `(1200000 - 952938) × 4% = 9882.48`; case 1 exento; case 3 effective rate matches displayed tiering | Consistent | Annual estimate equals monthly × 12 within rounding |
| `seguro-cesantia` | `1.2m/24 / 800k/4 / 3m/8` | CIC `$622.172`; 2 ineligible messages | Case 1: monthly CIC contribution and 1-month coverage were internally coherent; cases 2-3 matched minimum cotization rules shown in UI | Consistent | UI clearly separated CIC estimate vs eligibility gating |
| `apv` | `1.4m+100k / 2.4m+250k / 6m+900k` | Regime outputs and mixed suggestions rendered as expected | Case 1: `100000 × 12 × 15% = 180000`, monthly equiv. `$15000`; regime B saving `100000 × 4% = $4000`; case 2 mixed remainder `176480`, monthly tax benefit `≈ $588` | Consistent | Strategy recommendation changed across scenarios |
| `comisiones-afp` | `1m / 1.5m / 3m` imponible | Table rows scaled linearly | Example: Uno commission `1,000,000 × 0.46% = $4.600`; Habitat `1,500,000 × 1.27% = $19.050`; ProVida `3,000,000 × 1.45% = $43.500` | Consistent | Delta-vs-cheapest rows matched row arithmetic |
| `simulador-jubilacion` | `30/65 / 40/65 / 28/60` | `$265.0m / $197.8m / $173.9m` highlighted balances | Pension-vs-balance identity held: `$883328 × 25 × 12 ≈ $265.0m`; `$610642 × 27 × 12 ≈ $197.8m`; `$536703 × 27 × 12 ≈ $173.9m` | Consistent | Selected scenario changed correctly once valid option values were used |
| `credito-consumo` | `5m/36 / 12m/60 / 2.5m/18` | Cuotas `$251.567 / $491.237 / $169.702` | Case 1 annuity formula gives `~$246066.68` base + `$5500` insurance = `$251566.68`; total with costs `~$9176400.56` | Consistent | CAE / TAE presentation coherent with displayed rate conversions |
| `tarjeta-credito` | `1.5m / 2.8m / 650k` | Totals `$4.992.339 / $3.777.036 / $1.367.022` | Baseline totals, interest totals, and doubled-payment deltas matched simulation outputs and prior regression expectations | Consistent | Months and savings-to-double-payment were coherent |
| `prepago-credito` | `20m / 15m / 5m` | Savings block rendered; investment block rendered `NaN` | Savings side matched prior expectations (`$1.525.805`, `-$4.675.828`, `$136.552`) | Partial / defect | UI defect in investment-alternative section; not a pure arithmetic disagreement |
| `simulador-renegociacion` | `4m / 1.4m / 9.7m` debt sets | Cuotas `$110.110 / $49.775 / $212.842` | Case 1: debt in UF `4000000 / 40391.32 = 99.03 UF`; monthly annuity `~$110110.21`; total `~$5285289.97`; case 3 monthly `~$212841.65` | Consistent | Eligibility checklist and financial simulation matched inputs |
| `conversor-uf` | `10 UF / 1,000,000 CLP / 2500.5 UF` | `403913 / 24.7578 / 100998496` | UI implied UF `≈ 40391.3`; `10 × 40391.3 = 403913`; `1000000 / 40391.3 = 24.7578`; `2500.5 × 40391.3 ≈ 100998445.65` | Consistent | Final CLP rounded to displayed peso precision |
| `conversor-utm` | `5 UTM / 1,000,000 CLP / 13.5 UTM` | `352940 / 14.1667 / 952938` | UI UTM value `70588`; `5 × 70588 = 352940`; `1000000 / 70588 = 14.1667`; `13.5 × 70588 = 952938` | Consistent | Reference quick-values matched converter state |
| `reajuste-arriendo` | `UF / IPC / pesos fijos` | `$471.600 / $573.100 / no reajuste` | UF case: `12×38500 = 462000`, `12×39300 = 471600`, diff `9600`; IPC case: `550000 × 1.042 = 573100` | Consistent | Peso-fixed branch copy matched expectation |
| `dividendo-hipotecario` | `5000 UF / 200m CLP / 4000 UF + seguros` | `25.1116 UF / 24.8683 UF / 20.0893 UF base` | Monthly rate `((1.045)^(1/12)-1) ≈ 0.3675%`; case 1 payment `~25.1116 UF`; case 2 financed `160m / 40391.32 ≈ 3961.25 UF`, payment `~24.8683 UF`; case 3 month-1 total adds desgravamen + fire insurance | Consistent | Base mortgage annuity and CLP conversions matched |
| `interes-compuesto` | `1m@10%/10y mth / 1m@8%/5y annual / 2.5m@12%/15y qtr` | `$2.707.041 / $1.469.328 / $14.729.008` | Formula `FV = PV × (1 + r/n)^(n×t)` gives `2707041.49`, `1469328.08`, `14729007.76` | Consistent | Total return and generated interest matched display rounding |

## Findings

### Confirmed

1. `prepago-credito` has a rendering defect in the investment-comparison block.
   - The core prepayment math still produced numeric outputs.
   - The alternative investment section rendered `NAN%`, `Valor futuro $NaN`, and `Ganancia estimada $NaN`.

### Not defects

1. `simulador-jubilacion` initially appeared stuck during the audit, but that was caused by invalid automation inputs (`4` and `6.5`) for a select that only exposes `3`, `5`, and `7`.
   - After rerunning with valid option values, the UI responded correctly.

## Temporary Artifacts

- Screenshot:
  - [prepago_nan.png](/home/carlos/VS_Code_Projects/Monedario/output/playwright/prepago_nan.png)
- This audit note:
  - [manual-calculator-audit-2026-05-19.md](/home/carlos/VS_Code_Projects/Monedario/output/manual-calculator-audit-2026-05-19.md)
