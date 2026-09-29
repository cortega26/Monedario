# Auditoría matemática adversarial — plan 115 (correctitud)

- **Rol:** `MathAuditAgent` (adversarial) — `AI_AUDIT_PROTOCOL` v1
- **Auditor:** opencode / deepseek-v4.1-flash (sesión `audit-plan115-2026-09-29`)
- **Fecha:** 2026-09-29 (UTC)
- **Commit auditado:** `d1b1237444bb234535f6b140ac4fe76ab10ed4c3`
  (contiene los commits del alcance: `beb0401e`, `95c82807`, `854105cc`,
  `ae28d6d3`, `a616dc53`, `61b8a0ae`, `48b84eba`, `186cdc13`)
- **Veredicto:** **CONDITIONAL** — bloquea publicación hasta resolver
  D1–D4 (y decidir D5–D8). `humanSignoff: null`.
- **Naturaleza:** pre-gate de IA; no reemplaza la firma humana.

Este informe no modifica `src/`. Todos los números se obtuvieron ejecutando
código (harness Vitest propio + suites del repositorio + build). Los parámetros
se anclaron a fuente primaria con extracto (ver `evidence/08-sources.md`).

## 1. Método y reproducibilidad

Entorno (R7): Node v24.19.0, pnpm 11.7.0, Linux x86_64; commit y fecha en
`evidence/00-env.txt`.

| Comando | Resultado | Evidencia |
|---|---|---|
| `pnpm exec vitest run --config docs/editorial/audits/plan-115-correctitud/evidence/vitest.audit.config.ts` | 38/38 checks propios OK | `evidence/01-recalc-independent.txt` |
| `pnpm run test` | 182 archivos, 1767 passed / 1 skipped | `evidence/02-repo-tests.txt` |
| `pnpm exec vitest run` (11 suites de vectores) | 133 passed | `evidence/03-vector-tests.txt` |
| `pnpm run build` | 23 checks postbuild, 332 HTML, URL check OK | `evidence/06-build.txt` |
| `pnpm run check:economic-snapshot-freshness` | OK (capturedAt 0.0 d; IPC alineado) | `evidence/04-freshness-gate.txt` |
| `SMALL_DETAILS_ENFORCE=1 pnpm run check:small-details` | 0 blocking / 2 warnings | `evidence/05-small-details.txt` |
| Playwright paridad sueldo-líquido | 1 passed | `evidence/07-a11y-parity.txt` |
| Fuentes primarias (SII, BCN/LeyChile API, SuperIR, D.O., MDSF) | extractos con URL y fecha | `evidence/08-sources.md` |

El harness independiente (`evidence/recalc.audit.test.ts`) reimplementa desde
cero tabla IGC/IUSC, sueldo líquido, interés simple, anualidad y elegibilidad
SuperIR, y compara contra el motor real con tolerancia 0 documentada
(`toBeCloseTo(..., 9)`; display redondeado se distingue).

### Casos borde ejecutados (R5)

- Fronteras IGC/IUSC 13,5 / 30 / 50 / 70 / 90 / 120 / 150 / 200 / 310 / 320
  UTM y UTA; frontera exenta exacta 13,5 UTA ⇒ $0 y +$1 ⇒ $0,04.
- Sueldo: base exactamente 13,5 UTM ⇒ impuesto 0; tope previsional 90 UF;
  AFC trabajador 0% en plazo fijo; sueldo 0/negativo ⇒ throw.
- DAP: 180 y 365 días; negativos; reproducción del 4% eliminado.
- SuperIR: 90 vs 91 días; exactamente 80 UF vs 80 UF + $1; mismo acreedor con
  distinto case/espacios; monto negativo; acreedor vacío.
- IPC: acumulado ene–ago 2026; freshness fresh/stale; effective-dated con
  `effectiveTo` exclusivo (no fuga dic-2025 → ene-2026).

## 2. Vectores: valor independiente vs motor

| Vector | Claim | Independiente | Motor | Estado |
|---|---|---|---|---|
| V1 | $18.000.000 renta neta ⇒ IGC $269.367,84 (AT2026) | 269.367,8399… | 269.367,8399… | **OK** (tasa 4%) |
| V1-bug | $255.247,92 con UTM sep-2026 ×12 | 255.247,92 | — (aislado) | **OK**: la regresión ya no ocurre |
| V2 | Bruto $1.200.000 ⇒ líquido $973.347 / IUSC $213 | 973.346,94 / 213,06 | 973.346,94 / 213,06 | **OK** |
| V3 | DAP $5M/180d/5% sin retención | 123.287,6712 | 123.287,6712 | **OK** (4% no aplicado: neto viejo 118.356,16) |
| V4 | APV art. 42 bis N°3: ×1,1 + 3 pp; retención 15%; pensionados | fórmula legal confirmada | sin motor (copy) | **OK** con salvedades D8 |
| V5 | SuperIR art. 260 | regresión 101,78 UF / cuota 110.110,21 | idéntico | **OK** en el caso; D3/D4 en bordes |
| V6 | IPC 2026 + UTA dic-2025 + UF dic-2025 | IPC y UTA exactos; UF oficial 39.727,96 | dataset IPC ok; UF 39.643,59 | IPC/UTA **OK**, UF **DIVERGENT** (D2) |
| F02 | PPM honorarios 2025 = 14,5% | 14,5% | 0,145 | **OK** |
| F04 | Freshness IPC fresh/stale + gate | fresh/stale | fresh/stale; gate OK | **OK** |
| F08 | Ejemplo estático = runtime | Playwright pasa | — | **OK** |
| F09 | UTA etiquetada con período | “diciembre de 2025” | — | **OK** |
| F10 | “Prepago sin costo” eliminado | sustancia correcta | — | **OK** con salvedad D6 |

## 3. Defectos (todos abiertos)

### D1 — media — Tabla IUSC/IGC usa el tramo del art. 52 bis (150 UTM/UTA) y no la tabla general (310 UTM/UTA)

`TaxEngine.buildSecondCategoryTaxBrackets` cierra el tramo 35% en 150 UTM/UTA
y aplica 40% desde ahí (rebaja 30,82). La tabla SII vigente (art. 43 N°1 para
el IUSC y art. 52 para el IGC) mantiene 35% hasta **310** UTM/UTA y aplica 40%
sobre ese tope (rebaja **38,82**). La estructura de 150 es la del art. 52 bis
(Presidente, ministros, subsecretarios, senadores y diputados).

Evidencia numérica (Sep-2026, UTM $71.721; AT2026, UTA $834.504):

| Base | Motor | Oficial | Diferencia |
|---|---:|---:|---:|
| 200 UTM ($14.344.200) | $3.527.238,78 | $3.347.936,28 | **+$179.302,50** (2,5 UTM) |
| 320 UTM ($22.950.720) | $6.969.846,78 | $6.396.078,78 | **+$573.768** (8 UTM) |
| 200 UTA ($166.900.800) | $41.040.906,72 | $38.954.646,72 | **+$2.086.260** |
| 320 UTA ($267.041.280) | $81.097.098,72 | $74.421.066,72 | **+$6.676.032** |

La tabla errónea se **renderiza al usuario** en
`/calculadoras/impuesto-segunda-categoria/` (`bracketRows`, filas 120–150 →
35% y 150→∞ → 40%, `impuesto-segunda-categoria.astro:82-95`), afecta a
`CalculateNetSalary` y `SimulateOperacionRenta` (y a todo consumidor de
`calculateAnnualIncomeTax`), y el test `tests/domain/TaxEngine.test.ts:39-47`
fija el valor del tramo equivocado (180 UTM ⇒ $2.771.166,92). Evidencia:
`evidence/01-recalc-independent.txt` (`D1.annual-igc`, `D1.monthly-iusc`);
fuentes `evidence/08-sources.md` S-A/S-B/S-C.

### D2 — media — UF de diciembre congelada es la del 01-12-2025 ($39.643,59), no la del 31-12-2025 ($39.727,96)

El art. 42 bis LIR exige valorar el tope de 600 UF “al 31 de diciembre del año
respectivo”; el SII publica la UF del 31.12.2025 = $39.727,96 (8.000 UF =
$317.823.680) y la propia serie del repo (`uf-historico.json`) registra
2025-12-31 = 39.727,96 (2025-12-01 = 39.643,59). Efecto en el tope APV
Régimen B: 600 × 39.643,59 = **$23.786.154** vs 600 × 39.727,96 =
**$23.836.776** (−$50.622). El fixture `EffectiveDatedParameters.test.ts:21`
también rotula 39.643,59 como “2025-12”. Evidencia:
`evidence/01-recalc-independent.txt` (`D2.*`), `evidence/06-uf-dataset-check.txt`,
fuentes S-F/S-H.

### D3 — media — SuperIR: el motor exige ≥2 acreedores distintos; la ley exige ≥2 obligaciones diversas

`hasTwoOrMoreDistinctCreditors` deduplica por acreedor
(`SimulateDebtRenegotiation.ts:111-115`). El art. 260 habla de “dos o más
obligaciones … provenientes de obligaciones diversas” y la SuperIR de
“obligaciones distintas”; ninguna fuente dice “acreedores distintos”. Dos
obligaciones diferentes con el mismo acreedor quedarían bloqueadas (falso
negativo). Requiere decisión legal/editorial antes de cambiar el filtro.
Evidencia: `V5.same-creditor` en `evidence/01-recalc-independent.txt`;
fuentes S-J/S-K.

### D4 — baja — El umbral de 80 UF se aplica de forma inclusiva

`reachesMinimumUf` usa `>= 80`; la ley y la SuperIR dicen “más de 80 UF”.
Con exactamente 80 UF el motor declara elegible (falso positivo de borde).
Evidencia: `V5.exactly-80uf`; fuentes S-J/S-K.

### D5 — baja — Cita errónea “art. 59 N°4 LIR” para la retención del 4%

El 4% aplicable a intereses de no domiciliados/no residentes está en el art. 59
inciso segundo **N°1** (letras a) y g), que cubre instrumentos en moneda
nacional); el **N°4** regula fletes marítimos con tasa 5%. La sustancia del
copy (no retención para residentes; 4% solo Impuesto Adicional) es correcta.
Ubicaciones: `deposito-a-plazo.astro:207/265/333/341`,
`CalculateTermDeposit.ts:6-13`. Evidencia: fuente S-I.

### D6 — baja — Fuente de prepago: se cita Ley 21.236 en vez de Ley 18.010 art. 10

Los topes de comisión de prepago (1 mes no reajustable / 1,5 meses reajustable,
operaciones ≤5.000 UF; consentimiento bajo 20%) están en la Ley 18.010 art. 10.
La Ley 21.236 regula la portabilidad y no fija esos topes.
`dividendo-hipotecario.astro:418`. Evidencia: fuente S-O.

### D7 — baja — `00-scope.json` S6 apunta a idNorma equivocado

S6 usa `idNorma=1211138` (decreto 2024 de comisión de servicio del MINVU). La
Ley 21.830 es `idNorma=1225354` (D.O. 22-06-2026). El valor IMM $553.553 y la
vigencia retroactiva 01-05-2026 usados por el sitio son correctos.
Evidencia: fuente S-M.

### D8 — baja — V4 sin cobertura ejecutable y definición imprecisa de la tasa

El vector V4 cita `tests/domain/TaxEngine.test.ts`, que no prueba la fórmula de
retiro APV. El copy dice “tasa marginal del retiro”; la ley define el cociente
ΔIGC/retiro reajustado × 1,1 + 3 pp (tasa media del tramo retirado cuando este
cruza tramos). Evidencia: `V4.copy-checks`; fuente S-H.

## 4. Observaciones y limitaciones

1. **No auditado / fuera de alcance:** fuzzing completo de las 22
   calculadoras; comisiones AFP por fecha (la tasa 11,27% de Habitat es un
   supuesto declarado del ejemplo, no verificado contra CMF en este audit);
   supuestos actuariales; CAE/TMC; exenciones completas de Operación Renta.
2. **DAP no domiciliados:** el motor no expone entrada de residencia; modela
   solo el caso residente. Un no residente que use la calculadora obtendría el
   interés bruto sin la retención del 4% (la FAQ de la página sí explica el
   caso). Limitación de alcance, no defecto del cambio auditado.
3. **SuperIR:** el motor no modela “actualmente exigibles” ni las exclusiones
   legales (alimentos, delitos, multas) del art. 260; el copy lo advierte como
   filtro básico.
4. **PPM de honorarios:** el input del simulador pide el PPM efectivamente
   pagado; la tasa 14,5% se muestra como referencia (correcta para 2025).
5. La verificación de fuentes se hizo el 2026-09-29; toda divulgación pública
   debe usar la plantilla del protocolo y no afirmar más de lo verificado.

## 5. Conclusión

Los seis vectores del alcance se reproducen de forma independiente, con una
excepción: la UF de diciembre congelada (D2) y el tratamiento de bordes
SuperIR (D3/D4). Además, el arreglo F01 introdujo un consumidor nuevo
(`calculateAnnualIncomeTax`) sobre una tabla que no corresponde a la del IGC
general (D1), visible al usuario en la calculadora de IUSC. Por ello el
veredicto es **CONDITIONAL**: no publicar hasta corregir D1–D4 (mínimo) y
resolver o aceptar formalmente D5–D8, con re-auditoría del alcance corregido.
