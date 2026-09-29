# Auditoría matemática adversarial — plan 115 (correctitud), pass 3

- **Rol:** `MathAuditAgent` (adversarial) — `AI_AUDIT_PROTOCOL` v1
- **Auditor:** deepseek-v4.1-flash (sesión `mathaudit-plan115-pass3-2026-09-29`,
  fresca, sin historial del draft)
- **Fecha:** 2026-09-29 (UTC)
- **Commit auditado:** `9e19574367ecacebac70f9d834cf8ddcc1c32653` (HEAD; cadena de
  remediación #589–#591, scope #593, reporte #594, protocolo #595)
- **Naturaleza:** pre-gate. No reemplaza la firma humana (`humanSignoff: null`).
- **Veredicto:** **CONDITIONAL** — los 6 vectores pasan exactos, los 97 checks del
  harness motor-vs-independiente pasan y D1–D13 quedan verificados resueltos,
  pero hay **2 defectos abiertos de `product`**: D14 (metadata del DAP promete un
  "impuesto 4%" que el motor ya no aplica) y D15 (residual F02 en tres artículos
  editoriales: 15,25% para boletas de 2025, cuando el año comercial 2025 es
  14,50%). `CONDITIONAL` bloquea publicación hasta corregirlos y re-auditar.

No se modificó `src/` (R8). Todos los números salieron de ejecutar código; cada
parámetro se ancló a fuente primaria consultada hoy (R1/R2).

## 1. Método y reproducibilidad (R1, R4, R7)

Entorno: Node v24.19.0, pnpm 11.7.0, Python 3.13.12, Linux x86_64
(`evidence/26-env.txt`). El checkout principal tiene WIP ajeno (hero-images);
la suite completa corrió en un **worktree limpio de HEAD** (eliminado al
cerrar). La reimplementación independiente es un script Python propio
(`evidence/27-recalc-independent.py`) que usa las tablas publicadas del SII y
`Decimal` de 50 dígitos, más un harness TS propio (`pass3.independent.audit.test.ts`)
que compara motor vs recálculo con 97 checks.

Dato clave de trazabilidad: `git diff dd1e8f63..HEAD -- <archivos del scope>`
está **vacío**. Ningún archivo fuente auditado cambió desde la re-auditoría
previa (Muse Spark); esta pasada los re-verifica sobre bytes idénticos y añade
hallazgos que esa pasada no cubrió (D14/D15).

| Comando | Resultado | Evidencia |
|---|---|---|
| `python3 evidence/27-recalc-independent.py` | V1–V6 + bordes, 0 divergencias internas | `27-recalc-independent.txt` |
| `curl` SII (6 URLs) + SuperIR + Previred + LeyChile JSON (5 normas) con SHA-256 | HTTP 200; extractos y hashes propios | `28-sources.md` |
| `vitest run --config evidence/vitest.pass3.config.ts` | **97/97 checks OK**, 9/9 tests | `29-engine-vs-independent.txt` |
| `vitest run` (11 archivos de vectores) | **137/137 passed** | `29-engine-vs-independent.txt` |
| `vitest run` completo en worktree limpio de HEAD | **183 archivos, 1778 passed / 1 skipped, exit 0** | `30-repo-tests.txt` |
| `check:economic-snapshot-freshness` / `check:audit-artifacts` / `SMALL_DETAILS_ENFORCE=1 check:small-details` / editorial enforce | todos exit 0 (small-details: 0 blocking, 2 warnings preexistentes) | `31-residuals-gates.txt` |
| `check:afp-commissions` (Previred en vivo) | ✓ 7/7 AFP coinciden (Habitat 11,27%) | `31-residuals-gates.txt` §6 |
| Barrido `rg` de residuales | ver §5 | `31-residuals-gates.txt`, `32-d14-d15-findings.txt` |

Nota de estabilidad: los JSON de LeyChile no son byte-estables entre sesiones.
El `idNorma=6368` cambió de SHA-256 respecto de la sesión previa; el texto de
los arts. 42 bis y 59 extraído y citado es idéntico. La comparación válida es de
texto, no de hash.

## 2. Vectores: valor independiente vs motor

| Vector | Claim | Independiente | Motor | Estado |
|---|---|---|---|---|
| V1 | $18.000.000 renta neta ⇒ IGC $269.367,84 | 269.367,8399… (Decimal exacto) | 269.367,8399… | **OK** |
| V1-bug | $255.247,92 con UTM sep-2026 ×12 | 255.247,92 | no reproducido (test lo prohíbe) | **OK** |
| V2 | bruto $1.200.000 ⇒ base $973.560 / IUSC $213,06 / líquido $973.346,94 | idénticos (display $973.347 / $213) | idénticos | **OK** |
| V2-topes | 90 UF / 135,2 UF con bruto $6M | $3.694.410,90 / $5.549.826,152 / base $5.291.732,171658 | idénticos | **OK** |
| V3 | DAP $5M/180d/5% ⇒ $123.287,67 sin retención | 123.287,6712 | 123.287,6712 | **OK** |
| V4 | APV (ΔIGC/retiro) ×1,1 + 3 pp | 8 vectores: 3% / 4,32% / 9,6% / 11,8% / 38,464% / 41,5% / 47% | idénticos (≤1e-6) | **OK** |
| V5 | SuperIR: 101,78117 UF / cuota $110.110,21 / total $5.285.289,97 | idénticos | idénticos | **OK** |
| V6 | IPC 8/8, UTA 834.504, UF 39.727,96, cap 600 UF $23.836.776 | idénticos | dataset y AT2026 idénticos | **OK** |

## 3. Bordes ejecutados (R5)

Fronteras exactas y +$1 en 13,5/30/50/70/90/120/310 UTA-UTM con salto igual al
de la tabla publicada; 13,5–400 UTA y 13,5–320 UTM contra tabla; contraste con
el tramo 150 del art. 52 bis (diferencia $6.676.032 en 320 UTA); base exenta
exacta; topes 90 UF y 135,2 UF; AFC 0% (plazo fijo) vs 0,6%; plazos DAP
1/90/180/365/366; variante 4% rechazada; APV base 0 y cruces de tramo; SuperIR
80 UF exactas vs +$1, 90 vs 91 días, mismo acreedor, deuda $0, una sola deuda,
documentos, 1ª categoría, juicio notificado; frescura fresh/stale/unknown y
gracia de 7 días con calendario Chile; effective-dated sin cobertura ⇒
`undefined` (fail-closed).

## 4. Estado de D1–D13 (todos verificados resueltos en HEAD)

D1 tabla 310/38,82; D2 UF 39.727,96; D3 mismo acreedor califica (art. 260 dice
«obligaciones diversas»); D4 `> 80` estricto; D5 art. 59 inc. 2° N°1 a)/g) (N°4
= fletes 5%); D6 Ley 18.010 art. 10; D7 idNorma 1225354 (IMM $553.553 desde
01-05-2026); D8 `calculateApvWithdrawalRate`; D9 mensaje "de origen distinto
(art. 260)"; D10 `audit-1/` histórico; D11 V3/V5 del scope; D12 highlight
`[…,120,310,∞]`; **D13 corregido en HEAD**: `00-scope.json` V6 ya cita
"UF 31-12-2025 $39.727,96" y no queda "39.643" en el artefacto. Detalle y
comandos en `evidence/31-residuals-gates.txt`.

## 5. Defectos abiertos (bloquean PASS)

### D14 — media — `product` — el DAP promete un "impuesto 4%" que ya no existe

El motor no aplica retención alguna (F03, art. 59 inc. 2° N°1 a)/g) = Impuesto
Adicional de no residentes), pero siguen publicando "impuesto 4%":

- `src/pages/calculadoras/deposito-a-plazo.astro:73` — meta description.
- `src/pages/calculadoras/deposito-a-plazo.astro:77` — JSON-LD
  (`CalculatorJsonLd` → `WebApplication.description`).
- `src/config/calculatorPortfolio.ts:654` — ficha del catálogo (hub de
  calculadoras, related tools y `llms.txt`); líneas 659/661 añaden "después de
  impuesto/retensión".

Evidencia: `evidence/32-d14-d15-findings.txt` (D14) y
`evidence/31-residuals-gates.txt` (5.8/5.9). Residual directo de F03: la
calculadora y el FAQ se corrigieron; las superficies de metadata/SEO/catálogo no.

### D15 — media — `product` — residual F02 en contenido editorial (15,25% por 14,50%)

Tres artículos afirman 15,25% de retención para boletas emitidas en 2025
(AT2026), cuando la tasa del año comercial 2025 es **14,50%**:

- `src/data/blog/operacion-renta-centro.md:66,174,205,213` (incluye el ejemplo
  $1.000.000 → $152.500, que con la tasa correcta es $145.000).
- `src/data/blog/impuesto-global-complementario-chile.md:126`.
- `src/data/blog/rentas-mixtas-sueldo-honorarios.md:51,53,94,106,135,145,155,163,177`
  (el artículo se declara para el ciclo AT2026, ingresos de 2025).

Fuente: SII FAQ 001.140.7297.004 (actualizada 01-04-2026): 14,50% (2025), 15,25%
(2026); SII noticia 26-12-2025: el alza rige desde el 1-1-2026. El motor
congelado fija `AT2026.honorariosPpmRate = 0,145`. Evidencia:
`evidence/32-d14-d15-findings.txt` (D15), `evidence/28-sources.md` (S5b/S5c).
Queda fuera de la lista `files` del `00-scope.json` (contenido editorial), pero
es el mismo hallazgo F02 del informe 2026-09-28 y contradice el parámetro
congelado por el plan 115; se registra como defecto de producto.

## 6. Observaciones y limitaciones (no defectos)

1. **AFP 11,27%**: ya no queda `UNVERIFIED`. Verificado en vivo contra Previred
   (Habitat 11,27%) y con el gate `check:afp-commissions` (7/7). Previred es la
   fuente sectorial que usa el propio repo; no se recuperó tabla directa
   CMF/SP en esta pasada.
2. **D12 a nivel DOM**: el test Playwright
   `tests/accessibility/calculator-iusc-highlight.test.ts` no se re-ejecutó en
   esta pasada (requiere build + preview, no ejecutado). La constante y el
   algoritmo se verificaron por lectura + réplica independiente y el archivo
   `.astro` no cambió desde la pasada previa, donde el test pasó. Riesgo
   residual declarado.
3. **APV "reajustado"**: el motor usa el retiro nominal; la ley habla del monto
   reajustado. Simplificación documentada (el llamador provee el monto).
4. **Tope APV 600 UF en `apv.astro`**: usa la UF del día como aproximación del
   valor al 31-dic del año en curso (aún no publicado); en AT2026 el motor usa
   la UF congelada 39.727,96. Sin efecto en V1–V6.
5. **IPC**: la serie se ancla a la columna mensual del SII (variación INE) y al
   snapshot; no se consultó la API BCCh directamente (requiere credenciales).
   La ingesta BCCh está cubierta por tests unitarios.
6. **Cobertura no agotada**: fuzzing de las 22 calculadoras, comisiones AFP por
   fecha, supuestos actuariales, CAE/TMC, exenciones completas de Operación
   Renta y contenido editorial fuera de los tres artículos de D15.
7. **Entradas negativas** en deudas del simulador no están guardadas en la capa
   de dominio (la UI usa `min="0"`); robustez, no correctitud del cálculo.

## 7. Conclusión

El núcleo del plan 115 está correcto: los seis vectores se reproducen de forma
exacta e independiente con fuentes primarias consultadas hoy, la suite completa
pasa en un worktree limpio y D1–D13 están resueltos y re-verificados. Sin
embargo, la revisión adversarial encontró dos residuales de producto del mismo
patrón que el plan venía a corregir: **D14** (metadata/JSON-LD/catálogo del DAP
prometiendo "impuesto 4%") y **D15** (tres artículos editoriales con 15,25% para
boletas de 2025). Hasta corregirlos y re-auditar, el veredicto es
**CONDITIONAL — no publicar**. La firma humana sigue pendiente
(`humanSignoff: null`).
