# VERIFY — `cae-costo-real-credito-chile` (2026-09-18)

- **Archivo verificado:** `src/data/blog/cae-costo-real-credito-chile.md`
  (diff workdir UNCOMMITTED vs `HEAD`, 20 inserciones / 20 supresiones,
  solo ese archivo para este pase).
- **Auditoría base:**
  `docs/reports/AUDIT-cae-costo-real-credito-chile-2026-09-18.md`
  (veredicto FINDINGS — 1 HIGH · 2 MEDIUM · 7 LOW · 7 NHV).
- **Modo:** solo lectura adversarial sobre el artículo. No se editó el
  artículo ni ningún otro archivo. No se tocó el artículo de
  tarjeta-crédito ni calculadoras. Sin contexto previo: todo lo afirmado
  aquí se recomputó o re-fetcheó en esta sesión.
- **Veredicto: CONDITIONAL PASS — 7/7 hunks ACCEPT, 5 residuales
  (1 MEDIUM, 2 LOW, 2 INFO). Ningún hunk rechazado; R1 y R2 deberían
  corregirse antes de publicar.**

## 1. Método aritmético (calibración propia)

Cuota francesa `C = P·i / (1 − (1+i)^−n)` con `i` mensual directa.
CAE por TIR mensual `P_recibido = Σ C_t/(1+r)^t` (bisección, 200
iteraciones), anualizada `(1+r)^12 − 1`. Supuesto: gastos/comisiones
iniciales se pagan al contado (descuentan el monto recibido); seguros
mensuales se suman a la cuota. Chequeo de calibración: TIR sin cargos
para 1,80% mensual da 23,872053% = `(1,018)^12 − 1` exacto a 1e-12, y
para 1,50% da 19,561817% = `(1,015)^12 − 1`. El método está calibrado;
cualquier desvío sería del artículo, no del método.

Fuente prepago/seguros re-fetcheada en esta sesión:
`https://www.cmfchile.cl/educa/621/w3-propertyvalue-43579.html`
(CMF Educa, "Crédito de Consumo", fetch 2026-09-18).

## 2. Disposición por hunk (ACCEPT/REJECT + aritmética completa)

### H1 — frontmatter `updatedDate: 2026-04-12 → 2026-09-18` → ACCEPT

Cambio declarado exacto en el diff. Valor nuevo bien formado ISO-8601.
Limitado a `updatedDate`; ningún otro campo de frontmatter tocado
(ver §4). Razón: corresponde a un refresh fuera de ciclo justificado
por H1/M1 del audit. Ver residual R2 (deriva de cuerpo L252).

### H2 — frontmatter `validAsOf: 2026-04-12 → 2026-09-18` → ACCEPT

Cambio declarado exacto en el diff, consistente con H1
(`updatedDate = validAsOf`, coherencia interna de frontmatter OK).
Ver residual R2.

### H3 — L74: "Lo establece la CMF" → "Lo establece el SERNAC Financiero" → ACCEPT

Swap institucional de una palabra tal como declarado. Dirección
correcta: el propio audit (L1) documenta con fuente SERNAC que la CAE
es el indicador SERNAC-Financiero y que la página CMF citada enlaza la
hoja resumen a SERNAC. No se inventa número de artículo legal (ver §3:
grep de artículos da cero positivos reales). Alcance parcial
deliberado: L141/L215/FAQ conservan la atribución CMF — fuera de este
hunk, registrado como residual diferido R3 (puerta NHV-2 del audit).

### H4 — L88: "Seguros asociados obligatorios" → "Seguros asociados voluntarios" → ACCEPT

Swap de una palabra tal como declarado. Dirección correcta contra
fuente primaria re-fetcheada en esta sesión: CMF Educa dice literal
"Se pueden contratar seguros asociados al crédito de consumo. Dichos
seguros son voluntarios." y los rige el artículo 8 de la Ley 20.448
con libre elección de aseguradora. Cobertura incompleta: L214 conserva
"seguros obligatorios" — fuera de este hunk, registrado como
residual R1 (MEDIUM).

### H5 — Tabla 1 (L106–117): cuotas, totales, CAE ~29,2%, brecha $164.000 → ACCEPT

Recomputación propia desde inputs declarados (P=2.000.000, i=1,5%,
n=24, comisión $80.000 al contado, seguro $3.500/mes):

| Concepto | Artículo (nuevo) | Recomputado propio | Estado |
|---|---|---|---|
| Cuota A | $99.848 | $99.848,20 | ✓ redondeo a peso |
| Total A | $2.396.352 | 99.848×24 = $2.396.352 exacto (preciso $2.396.356,89, Δ $4,89) | ✓ internamente exacto |
| Cuota B | $103.348 | $103.348,20 (= A + $3.500) | ✓ |
| Total cuotas B | $2.480.352 | 103.348×24 = $2.480.352 exacto | ✓ |
| Total B + comisión | $2.560.352 | $2.480.352 + $80.000 exacto | ✓ |
| Brecha total | $164.000 | (103.348−99.848)×24 + 80.000 = 3.500×24 + 80.000 = $164.000 exacto | ✓ |
| CAE B (recibe $1.920.000, paga 103.348,20×24) | ~29,2% | TIR mensual 2,15883672% → CAE 29,2145% → ~29,2% | ✓ |
| CAE A (control) | ~19,6% | 19,5618% → ~19,6% | ✓ |

La presentación nueva transparenta el tratamiento de la comisión
("$2.480.352 + $80.000 = $2.560.352"), resolviendo el problema de
presentación M1 del audit (el "Total pagado" viejo excluía los
$80.000 y la brecha real era ~$164.000, no $84.000). Cada cifra del
artículo coincide con mi aritmética al peso. Desvíos de truncamiento
< $5, irrelevantes bajo el rótulo "aprox.".

### H6 — Tabla 2 (L147–156): cuotas, totales, CAE 29,1%, conclusión corregida → ACCEPT

Recomputación propia desde inputs declarados (P=3.000.000 nominal;
A: 1,80%, n=36; B: 1,50% + $9.500/mes, neto $2.935.000, +$65.000):

| Concepto | Artículo (nuevo) | Recomputado propio | Estado |
|---|---|---|---|
| Cuota A | $113.951 | $113.951,50 | ✓ |
| Total A | $4.102.236 | 113.951×36 = $4.102.236 exacto (preciso $4.102.253,84, Δ ~$18) | ✓ internamente exacto |
| Cuota B (cap+int) | implícito $108.457 | $108.457,19 | ✓ vía suma con seguro |
| Cuota B con seguro | $117.957 | $108.457,19 + $9.500 = $117.957,19 | ✓ |
| Subtotal cuotas B | $4.246.452 | 117.957×36 = $4.246.452 exacto (preciso $4.246.458,72, Δ ~$7) | ✓ |
| Total B + gastos | $4.311.452 | $4.246.452 + $65.000 exacto | ✓ |
| CAE A (control) | 23,9% | 23,8721% → 23,9% | ✓ |
| CAE B (recibe $2.935.000) | 29,1% | TIR mensual 2,15089061% → CAE 29,0939% → 29,1% | ✓ |
| Ranking | 117.957 > 113.951, "B tiene tasa más baja pero cuota más alta y costo total mayor" | 117.957,19 > 113.951,50 ✓ | ✓ conclusión un-invertida |

Prueba de consistencia interna del audit confirmada por mí:
`101.400×36 = 3.650.400 ≠ 3.715.400` (el subtotal viejo difería
exactamente en los $65.000 → doble conteo). En el texto nuevo
`117.957×36 = 4.246.452` exacto y `+ $65.000 = $4.311.452` exacto:
el doble conteo está resuelto y la narrativa invertida ("cuota más
baja") quedó correctamente invertida a "cuota más alta".

### H7 — Prepago L173: excepciones 10% / 5.000 UF + topes 1 mes / 1,5 meses → ACCEPT

Texto nuevo verificado palabra por palabra contra CMF Educa
re-fetcheado en esta sesión: "Sólo se necesita el consentimiento del
acreedor si paga menos del 10% del valor del capital adeudado, o si
el crédito es superior al equivalente de 5.000 UF" ✓ (artículo:
"menos del 10% del capital adeudado o si el crédito supera las 5.000
UF"); "una comisión de prepago cuyo valor corresponde a un mes de
intereses para las operaciones no reajustables (préstamo en pesos), o
de mes y medio de intereses para las operaciones reajustables
(créditos en UF), en ambos casos el cálculo se realiza considerando
el capital que se prepaga" ✓ (artículo: "tope legal de un mes de
intereses en operaciones no reajustables (en pesos) o de un mes y
medio en operaciones reajustables (en UF), calculada sobre el capital
prepagado"). Calificación "en la gran mayoría de los casos" reproduce
el "gran mayoría de los créditos siempre que se cumplan ciertas
condiciones" de la fuente. Número de artículo de Ley 18.010:
correctamente AUSENTE (el audit lo dejó como NHV-1 con LeyChile
bot-bloqueado; no se inventó nada — ver §3).

## 3. Remanentes BANEADOS (grep propio, esta sesión)

| Patrón | Resultado | Estado |
|---|---|---|
| `98.900`, `102.400`, `108.800`, `101.400` | 0 hits | ✓ eliminados |
| `26,8`, `24,2`, `84.000` | 0 hits | ✓ eliminados |
| "cuota más baja" (conclusión invertida) | 0 hits | ✓ eliminada |
| "en cualquier momento" (prepago sin calificar) | 0 hits | ✓ eliminado |
| N° de artículo inventado Ley 18.010 | 0 positivos reales (solo menciones "Ley N° 18.010" sin número de artículo, L173/L256) | ✓ ausente como exige el encargo |
| "seguros obligatorios" (case-insensitive) | **1 hit: L214** "Los seguros obligatorios deben aparecer en el contrato y en la CAE." | ✗ REMANENTE → residual R1 |

Nota: el match de "cualquier crédito" en el header L199
("Checklist antes de firmar cualquier crédito") es un falso positivo
del tallo — no es la afirmación de prepago proscrita, que sí fue
calificada en L173.

## 4. Alcance (scope)

- El diff bajo revisión toca **solo**
  `src/data/blog/cae-costo-real-credito-chile.md` (20+/20−).
- Sin cambios de `slug`, `canonicalTopic`, `topicRole`, `cluster`,
  `title`, `seoTitle`, `description`, `heroImage` (grep sobre el diff:
  0 hits).
- Frontmatter limitado a `updatedDate` + `validAsOf` (H1/H2).
- Sin etiquetas ni ítems NHV introducidos al cuerpo (grep NHV: 0 hits).
- Artículo tarjeta-crédito sin diff; rutas de calculadoras/código de
  dominio (`src/pages/calculadoras`, `src/components/calculators`,
  `src/domain`, `src/application`, `src/infrastructure`) sin diff. El
  único match de "calculadora|tarjeta-credito" en el workdir es un
  archivo borrado de `output/` (ajeno a este pase).
- Se constata workdir con otras modificaciones no relacionadas
  (NextSteps.astro, 3 artículos hermanos, `output/`, untracked) —
  fuera del alcance de este VERIFY; no atribuibles a este pase.

## 5. Residuales (no bloquean los hunks, deben tratarse)

- **R1 (MEDIUM):** L214 conserva "Los seguros obligatorios deben
  aparecer en el contrato y en la CAE" — contradice el nuevo L88
  ("voluntarios") y a CMF Educa ("Dichos seguros son voluntarios",
  Ley 20.448 art. 8). Línea fuera del diff; fix de una línea
  pendiente. Es el único remanente baneado real.
- **R2 (LOW, regresión leve):** L252 "vigente a marzo de 2026" vs
  `validAsOf: 2026-09-18` — la deriva cuerpo/frontmatter pasó de ~1
  mes a ~6 meses porque el pase subió el frontmatter sin unificar el
  cuerpo (requisito #7 del audit). Fix de una línea.
- **R3 (LOW, diferido con puerta):** L141/L215 ("La CMF exige/obliga
  … Hoja de Información Precontractual") y FAQ L235–236 (alcance solo
  reguladas CMF) conservan la atribución que el audit (L2/L4) observó;
  corrección bloqueada en NHV-2 (artículos Ley 19.496). No intentado
  en este pase — aceptable como diferido, no como error nuevo.
- **R4 (INFO):** Tabla 1 sigue sin el descargo "valores ilustrativos"
  que la Tabla 2 sí tiene (nota agravante de M1). Sugerido.
- **R5 (INFO):** Cuotas exibidas truncadas al peso; totales =
  cuota-exhibida × n exactos; desvíos vs precisión infinita < $20
  (< 0,001%). Práctica estándar bajo rótulo "aprox." — aceptado.

## 6. Gates de este reporte

- `pnpm exec prettier --check` sobre este archivo: PASS (ver mensaje
  final).
- `git diff --check`: PASS (ver mensaje final; este reporte es
  untracked, sin marcadores de whitespace).

## 7. STOP triggers

Ninguno activado: no se firmó ninguna puerta de publicación, no se
cambió slug/ruta/RSS/canonical, no se redactó ni auditó pieza YMYL
nueva en esta sesión (solo verificación), y no se violó la
Constitución ni los hard stops (tarjeta y calculadoras intactos).
