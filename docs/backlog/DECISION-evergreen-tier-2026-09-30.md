# DECISIÓN — Tier evergreen y datasets IMM/PGU (TD-0095 / TD-0096)

- **Status:** propuesta para confirmación editorial. **No aplicada.**
- **Fecha:** 2026-09-30. **Propuesta:** agente. **Confirmación:** Carlos Ortega
  (pendiente, ver firma al final).
- **Insumos:** `docs/adr/ADR-20260701-editorial-evergreen-tier.md`, TD-0095,
  TD-0096, `src/config/editorial-timeliness-policy.json`, frontmatter y cuerpo
  de los 31 slugs (verificado 2026-09-30).
- **Reglas del ADR:** `evergreen` = sin cifras, leyes ni términos de producto
  que puedan cambiar; incompatible con `volatileData`; decisión humana explícita
  slug por slug; un falso evergreen deja de recibir señales de vencimiento
  indefinidamente (riesgo YMYL asimétrico → ante duda, mantener cadencia).

## 0. Filtro mecánico actualizado (la lista de 2026-07-01 quedó parcialmente stale)

Durante las remediaciones, 2 slugs de los 21 ganaron `volatileData` y quedan
**excluidos por diseño** (el gate falla si un evergreen lo declara):

| Slug | volatileData hoy |
| --- | --- |
| `liquidacion-de-sueldo` | `pensions.afp.worker_mandatory_contribution` |
| `como-leer-cartola-afp-chile` | `pensions.afp.worker_mandatory_contribution` |

De los "dudosos" (TD-0095), `credito-hipotecario-chile-guia-completa` también
tiene `volatileData` (`economic.uf.value`) y `que-es-la-cuenta-2-afp` idem
(AFP). Además el TD-0095 lista `credito-hipotecario-chile-guia-completa` **dos
veces** (duplicado): quedan **10 dudosos únicos**.

## A. TD-0096 — propuesta para los 21 candidatos

### A1. Evergreen recomendado (atemporal claro, sin cifras/leyes volátiles)

| Slug | Evidencia |
| --- | --- |
| `el-poder-del-interes-compuesto` | Solo ejemplos matemáticos propios; sin leyes ni cifras externas. |
| `interes-compuesto-nota-metodologica` | Nota metodológica: fórmulas y ejemplos. |
| `como-hacer-presupuesto-mensual-chile` | Regla 50/30/20 y ejemplo propio. |
| `donde-ver-si-estoy-en-dicom-gratis` | Procedimiento; cero montos, cero leyes. |
| `suplantacion-identidad-creditos-no-reconocidos` | Procedimiento; cero montos, cero leyes. |
| `estafas-financieras-chile-vishing-smishing-marketplace` | Patrones de fraude; los % son promesas de estafadores (ejemplos). |
| `fondo-emergencia-chile` | Heurística 3–6 meses; única cita legal definicional (art. 59, estable). |

### A2. Evergreen condicionado (estructura atemporal; referencias legales estables — confirmar que no dependen de montos reformables)

| Slug | Referencias detectadas |
| --- | --- |
| `como-elegir-inversion-segun-plazo-riesgo-objetivos` | Arts. 20/108/109 LIR, definicionales. |
| `como-salir-boletin-comercial-chile` | Arts. Ley 19.496; sin montos. |
| `informe-deudas-cmf-vs-dicom` | Arts.; sin montos. |
| `prepago-credito-cuando-conviene-chile` | Art. 10 Ley 18.010; derecho estable. |
| `finiquito-e-indemnizaciones-en-chile` | Arts. 159–161/168 + ejemplo $900.000. |
| `indemnizacion-anos-de-servicio-chile` | Art. 168 y topes estatutarios (90 UF). |
| `seguro-de-cesantia` | Tasas legales (0,6/1,6/3 %). |
| `seguro-cesantia-cuenta-individual-vs-fondo-solidario` | Ídem. |
| `licencia-medica-desde-que-dia-pagan` | Fórmula; no hardcodea el tope SUSESO. |

### A3. No evergreen — mantener cadencia (dependen de cifras/productos vigentes)

| Slug | Motivo |
| --- | --- |
| `tarjeta-credito-costo-real-chile` | CAE/tasas de producto. |
| `primer-empleo-chile-guia-completa` | Tramos Fonasa «referencia 2026, sujeto a actualización». |
| `fraude-tarjeta-que-hacer` | Topes de 35 UF (Ley 20.009, reformable). |

## B. TD-0095 — propuesta para los 10 dudosos únicos

| Slug | Propuesta | Razón |
| --- | --- | --- |
| `renegociacion-superir` | Evergreen condicionado | 80/200 UF y arts. 260/264 son estatutarios estables. |
| `como-invertir-en-etfs-desde-chile` | Evergreen condicionado | Sin cifras ni leyes; confirmar que no dependa de términos de producto. |
| `finanzas-para-migrantes-chile` | Evergreen condicionado | Procedimental (art. 2 definicional); confirmar remesas/cuentas. |
| `fondos-afp-a-b-c-d-e` | Mantener cadencia (explícito) | Rentabilidades ilustrativas; ya tiene override `manual_review_with_official_sources`. |
| `bancos-y-fintech-chile` | Mantener cadencia | Giros «30 UF» y términos de producto. |
| `fonasa-vs-isapre-comparativa` | Mantener cadencia | Tramos Fonasa + 7 % + IMM. |
| `cae-costo-real-credito-chile` | Mantener cadencia | Ejemplos CAE y 5.000 UF de producto. |
| `fondos-mutuos-comisiones-rescate-impuestos` | Mantener cadencia | Comisiones de producto. |
| `que-es-la-cuenta-2-afp` | Excluido (volatileData AFP) | Incompatible por diseño. |
| `credito-hipotecario-chile-guia-completa` | Excluido (volatileData UF) | Incompatible por diseño. |

Criterio TD-0095: **todos** los dudosos deben quedar con override explícito
(aunque sea «mantener cadencia»), para que ninguno dependa del default implícito.

## C. IMM y PGU como `volatileData`

- **IMM — recomendado SÍ.** El snapshot económico ya trae `imm` (553.553,
  `immEffectiveDate`) y al menos 4 artículos lo citan (`gratificacion-legal-chile`,
  `boleta-honorarios-2026-retencion-cobertura`, `cotizacion-voluntaria-afp-independiente`,
  `fonasa-vs-isapre-comparativa`). Propuesta: registrar `economic.imm.value` en
  el registry + 1 línea de mapping en `refresh-editorial-volatile-data.mjs`;
  `gratificacion-legal-chile` puede declararlo con `expectedValue` y ganar
  detección de drift automática.
- **PGU — recomendado mantener cadencia 90d (hoy).** No está en el snapshot y
  `official_page_extract` está implementado por dataset (hoy solo `pensions.afp.*`):
  un dataset nuevo exige un extractor propio (M, frágil) para 2–3 artículos.
  Alternativa si lo quieres: `pensions.pgu.monthly_amount` con extractor de
  ChileAtiende/IPS.

## D. Qué se aplica si confirmas

1. `slugOverrides` en `editorial-timeliness-policy.json`: `evergreen` para
   A1/A2 (y B) confirmados; overrides explícitos para los «mantener cadencia».
2. `economic.imm.value` en registry + mapping + tests (si apruebas C).
3. Verificación: `check:editorial-timeliness` verde, suite completa y build.

## Firma (humano — sin esto no se aplica nada)

- [ ] **A1**: confirmo los 7 tal cual / con cambios: ____
- [ ] **A2**: confirmo los 9 / solo: ____
- [ ] **A3**: confirmo mantener cadencia en los 3
- [ ] **B**: confirmo la propuesta / cambios: ____
- [ ] **C**: IMM como dataset: sí / no. PGU: cadencia 90d / dataset.

**Carlos Ortega — fecha: ____**
