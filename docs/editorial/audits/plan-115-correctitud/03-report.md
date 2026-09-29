# Auditoría matemática adversarial — plan 115 (correctitud), commit dd1e8f63

- **Rol:** `MathAuditAgent` (adversarial) — `AI_AUDIT_PROTOCOL` v1
- **Auditor:** Muse Spark (sesión `audit-plan115-2026-09-29`, fresca, sin
  historial del draft)
- **Fecha:** 2026-09-29 (UTC)
- **Commit auditado:** `dd1e8f6389e02b4274b3d655e02f6e625e03b81f` (incluye
  remediaciones #589 D1–D8, #590 D9–D12 + obs. 2, #591 obs. 1)
- **Naturaleza:** pre-gate. No reemplaza la firma humana (`humanSignoff: null`).
- **Veredicto:** **CONDITIONAL** — los 6 vectores pasan exactos y D1–D12 quedan
  verificados resueltos, pero hay **1 defecto abierto de severidad baja (D13)**:
  `00-scope.json` V6 cita la UF "dic-2025" derogada ($39.643,59, valor del día
  1) en vez de la vigente ($39.727,96 del 31-12). `CONDITIONAL` bloquea
  publicación hasta corregirlo (regla de cierre del protocolo: `PASS` solo sin
  defectos abiertos).

No se modificó `src/` (R8). Todos los números salieron de ejecutar código; cada
parámetro se ancló a fuente primaria consultada hoy (R1/R2).

## 1. Método y reproducibilidad (R1, R4, R7)

Entorno: Node v24.19.0, pnpm 11.7.0, Python 3.13.12, Linux x86_64
(`evidence/25-env.txt`). El checkout principal tiene WIP ajeno (hero-images),
así que la suite completa corrió en un **worktree limpio de HEAD** (eliminado
al cerrar). La reimplementación independiente es un script Python propio que usa
la **tabla publicada por el SII** (factores + rebajas + topes en pesos), no la
fórmula recursiva del motor — si ambos coinciden, la coincidencia es
significativa.

| Comando | Resultado | Evidencia |
|---|---|---|
| `python3 mathaudit_independent.py` (tabla SII, sin imports del repo) | V1–V6 + fronteras + bordes | `21-recalc-independent.txt` |
| `curl` SII (5 URLs) + SuperIR + LeyChile JSON (6 normas), SHA-256 + extracción propia | 5/5 SII y 5/5 BCN idénticos a la sesión previa; SuperIR mismo texto | `22-sources.md` |
| `vitest run … reaudit.independent` (harness motor vs independiente) | **29/29 OK**, 8/8 tests | `23-engine-tests.txt` |
| `vitest run` 11 archivos de vectores del alcance | **124/124 passed** | `23-engine-tests.txt` |
| Harness temporal V2 (`calculateNetSalary` con snapshot) | base/tax/net exactos (eliminado tras correr) | `23-engine-tests.txt` |
| `check:economic-snapshot-freshness`, `check:audit-artifacts`, `check:small-details` (enforce) | OK / OK / 0 blocking (2 warnings preexistentes) | `23-engine-tests.txt` |
| `vitest run` completo en worktree limpio (×3) | 1 corrida flaky (7 failed, no reproducida) + **2 verdes 182/182** (1773 passed / 1 skipped) | `23-engine-tests.txt` |
| `node -e highlightBracket` + barridos grep de copy | D12 corregido; 0 residuos user-facing | `24-residuals.txt` |

## 2. Vectores: valor independiente vs motor

| Vector | Claim | Independiente | Motor | Estado |
|---|---|---|---|---|
| V1 | $18.000.000 renta neta ⇒ IGC $269.367,84 | 269.367,8399… | 269.367,8399… | **OK** |
| V1-bug | $255.247,92 con UTM sep-2026 ×12 | 255.247,92 | no reproducido (test lo prohíbe) | **OK** |
| V2 | bruto $1.200.000 ⇒ líquido $973.346,94 / IUSC $213,06 | 973.346,94 / 213,06 | 973.346,94 / 213,06 (display $973.347 / $213) | **OK** |
| V3 | DAP $5M/180d/5% ⇒ $123.287,67 sin retención | 123.287,6712 | 123.287,6712 | **OK** |
| V4 | APV (ΔIGC/retiro) ×1,1 + 3 pp | 90U/50U: 38,464%; 200U/10U: 41,5%; base 0: 3% | idénticos (<1e-6) | **OK** |
| V5 | SuperIR: 101,7812 UF / cuota $110.110,21 | 101,78117048346056 | idénticos | **OK** |
| V6 | IPC 8 meses / UTA 834.504 / UF 39.727,96 | 8/8 = SII; UTA 834.504; UF 39.727,96 | dataset y AT2026 idénticos | **OK** |

Bordes ejecutados (R5): fronteras 13,5/30/50/70/90/120/310 en UTA y UTM (tope
y +$1, continuidad); 180/200/310/320 UTM-UTA contra la tabla general;
exento exacto; tope previsional 90 UF; AFC 0%; DAP 180/365 + modelo 4%
rechazado; APV intra-tramo, cruce, base 0; SuperIR 90/91 días, 80 UF exactas
vs +$1, mismo acreedor; acumulado IPC 3,6488% vs 3,6 publicado; topes 15 UTA /
8 UTA / 600 UF; snapshot vs SII.

## 3. Estado de D1–D12 y observaciones (todos verificados resueltos)

D1 tabla 310/38,82, D2 UF 39.727,96, D3 mismo acreedor califica, D4 `> 80`
estricto, D5 art. 59 N°1 a)/g), D6 Ley 18.010 art. 10, D7 idNorma 1225354, D8
`calculateApvWithdrawalRate`, D9 mensaje "de origen distinto (art. 260)", D10
`audit-1/` versionado histórico, D11 V3/V5 del scope, D12 highlight
`[…, 120, 310, ∞]` (200 UTM ⇒ fila 35%, verificado en node + test dedicado),
obs. 1 (blog SuperIR corregido) y obs. 2 (`uf-historico.json` al
2026-09-29/2026-10-09 + assertion del gate). Detalle y comandos en
`evidence/24-residuals.txt`. Barrido adversarial: 0 "prepago sin costo", 0
"art. 59 N°4 LIR" (solo art. 159 del Código del Trabajo, ajeno), "acreedores
distintos" solo en comentarios que lo niegan.

## 4. Defecto abierto

### D13 — baja — `00-scope.json` V6 cita la UF derogada de D2

V6 dice "UF dic-2025 $39.643,59". Ese es el valor del **1 de diciembre**; la
UF que exige el art. 42 bis ("al 31 de diciembre"), publica el SII (8.000 UF =
$317.823.680), usa el motor (`AT2026.ufDecember = 39727.96`) y trae el dataset
(2025-12-31) es **$39.727,96** (delta en el tope APV: $50.622). Es solo un
artefacto de alcance —sin efecto en código ni UI—, pero guía al próximo auditor
hacia el criterio derogado, igual que D11. Evidencia: `24-residuals.txt`.

## 5. Observaciones y limitaciones (no defectos)

1. **Tasa AFP 11,27% (claim UNVERIFIED):** supuesto de entrada del ejemplo V2
   (`afpCommissions.ts`, "Previred abril 2026"); la página SP consultada es un
   FAQ sin tabla. La aritmética bajo ese supuesto es exacta al último dígito.
2. **UTM de octubre ya publicada (72.151):** el snapshot fija septiembre
   (71.721, vigente todo el mes); al 29-sep no hay rezago efectivo.
3. **APV "reajustado":** el motor usa el retiro nominal; la ley habla del monto
   reajustado (simplificación documentada, el llamador provee el monto).
4. **Scope V4 abrevia "tasa marginal × 1,1":** el motor implementa
   correctamente la media (ΔIGC/retiro); la redacción solo coincide dentro de
   un tramo. Sin efecto en código/tests.
5. **Flakiness transitoria:** 1 de 3 corridas full en worktree limpio dio 7
   fallos no reproducidos (arranque en frío); las 2 siguientes, 182/182.
6. **Alcance no cubierto:** fuzzing de las 22 calculadoras, comisiones AFP por
   fecha, supuestos actuariales, CAE/TMC, exenciones completas de Operación
   Renta, Playwright en navegador (paridad V2 cubierta a nivel motor + test
   `calculator-states` existente), contenido editorial fuera del alcance.

## 6. Conclusión

El motor calcula bien: los seis vectores se reproducen de forma exacta e
independiente con fuentes primarias consultadas hoy, y D1–D12 están verificados
como resueltos en código, copy, tests y gates. El único freno es D13 (baja,
artefacto): corregir "UF dic-2025 $39.643,59" → "$39.727,96 (31-12-2025)" en
`00-scope.json` V6, y registrar la firma humana. Hasta entonces:
**CONDITIONAL — no publicar**.
