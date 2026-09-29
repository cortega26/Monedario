# Re-auditoría matemática adversarial — plan 115 (correctitud), commit 8b73793

- **Rol:** `MathAuditAgent` (adversarial) — `AI_AUDIT_PROTOCOL` v1
- **Auditor:** opencode / deepseek-v4.1-flash (sesión `reaudit-plan115-2026-09-29`)
- **Fecha:** 2026-09-29 (UTC)
- **Commit auditado:** `8b73793f4d62ee79aa01ff3ff42f90623a92c237`
  (remediación de D1–D8, #589). Auditoría previa: `d1b1237444bb234535f6b140ac4fe76ab10ed4c3`.
- **Naturaleza:** re-auditoría en sesión fresca de una remediación redactada por
  otro agente (OpenAI Codex, #589). Es un **pre-gate**: no reemplaza la firma
  humana (`humanSignoff: null`).
- **Veredicto:** **CONDITIONAL** — D1–D8 verificados resueltos, pero quedan
  **D9 (baja), D10 (baja), D11 (baja) y D12 (media)** abiertos. `CONDITIONAL`
  bloquea publicación hasta resolverlos.

Este informe no modifica `src/`. Todos los números se obtuvieron ejecutando
código (Python independiente + harness Vitest contra el motor + Chrome DevTools
sobre el build limpio). Cada parámetro se ancló a fuente primaria con extracto
(`evidence/19-sources-reaudit.md`).

## 1. Método y reproducibilidad (R1, R4, R7)

Entorno: Node v24.19.0, pnpm 11.7.0, Python 3.13.12, Linux x86_64
(`evidence/10-env-reaudit.txt`). El árbol de trabajo principal tiene WIP local
de hero-images (ajeno al alcance): para los gates se usó un **worktree limpio
de HEAD** (`git worktree add --detach /tmp/opencode/monedario-head HEAD`), sin
tocar el checkout del usuario ([1]).

| Comando | Resultado | Evidencia |
|---|---|---|
| `python3 reaudit_independent.py` (reimplementación Python, sin imports del repo) | V1–V6 + bordes | `11-recalc-independent-reaudit.txt` |
| `vitest run … --reporter=verbose reaudit.independent` (harness propio vs motor) | **29/29 comparaciones OK**, 8/8 tests | `12-engine-vs-independent.txt` |
| `vitest run … recalc.audit` (harness de la auditoría previa) | **9/38 fallan** (aserciones pre-fix, D10) | `13-prior-harness-at-head.txt` |
| `pnpm run test` en checkout sucio | 1764 passed / 7 failed (solo hero-images WIP) | `14-repo-tests-reaudit.txt` |
| `vitest run` en worktree limpio HEAD | **182 files, 1771 passed / 1 skipped** | `15-repo-tests-clean-head.txt` |
| `CI=true pnpm run build` en worktree limpio | **23 checks postbuild, 332 HTML, URL check 0 roto** | `16-build-clean-head.txt` |
| `check:economic-snapshot-freshness`, `SMALL_DETAILS_ENFORCE=1 check:small-details`, `check:audit-artifacts` | OK / 0 blocking / OK | `17-gates-clean-head.txt` |
| Chrome DevTools sobre `astro preview` del build limpio | IUSC 200 UTM, UTA dic-2025, sueldo-líquido, dividendo | `18-residual-highlight.txt` |
| `curl` SII/BCN/SuperIR/SUSESO + extracción Python (SHA-256 por archivo) | quotes con URL y fecha | `19-sources-reaudit.md` |

La reimplementación independiente usa la tabla publicada del SII (rebajas por
tramo 0,54 / 1,74 / 4,49 / 11,14 / 17,80 / 23,32 / 38,82 UTM-UTA), no la
fórmula recursiva del motor. Los vectores del build limpio se sirvieron con
`astro preview` local; el servidor se detuvo al terminar.

## 2. Vectores: valor independiente vs motor

| Vector | Claim | Independiente | Motor | Estado |
|---|---|---|---|---|
| V1 | $18.000.000 renta neta ⇒ IGC $269.367,84 | 269.367,8399… | 269.367,8399… | **OK** |
| V1-bug | $255.247,92 con UTM sep-2026 ×12 | 255.247,92 | no reproducido | **OK** (regresión aislada) |
| V2 | bruto $1.200.000 ⇒ líquido $973.346,94 / IUSC $213,06 | 973.346,94 / 213,06 | 973.346,94 / 213,06 | **OK** (display $973.347 / $213) |
| V3 | DAP $5M/180d/5% ⇒ $123.287,67 sin retención | 123.287,6712 | 123.287,6712 | **OK** |
| V4 | APV art. 42 bis N°3: ΔIGC/retiro ×1,1 + 3 pp | 90U/50U: 38,464%; 200U/10U: 41,5%; base 0: 3% | idénticos | **OK** |
| V5 | SuperIR art. 260: 101,7812 UF / cuota $110.110,21 | 101,78117048346056 / 110.110,2077 | idénticos | **OK** |
| V6 | IPC 2026 (8 meses) / UTA dic-2025 / UF dic-2025 | 8/8 = SII; UTA 834.504; UF 39.727,96 | dataset y AT2026 idénticos | **OK** |

Datos completos de la tabla en `12-engine-vs-independent.txt`. La tabla
general 310 UTM/UTA del art. 43 N°1 / art. 52 (D1) coincide con el SII en
180/200/310/320 UTM y 200/310/320 UTA; el contraste con la estructura del
art. 52 bis (150 / 30,82) daría −$6.676.032 a 320 UTA, confirmando que el
motor usa la tabla correcta.

### Bordes ejecutados (R5)

Fronteras 13,5 / 30 / 50 / 70 / 90 / 120 / 310 UTM-UTA (tope exacto y +$1);
rebajas publicadas vs calculadas; base exenta exacta 13,5 UTM ⇒ $0; tope
previsional 90 UF; AFC 0% plazo fijo; DAP 180/365 días e inválidos; APV con
retiro dentro de tramo, cruce de tramo, base 0 y retiro 0 (throw); SuperIR
90 vs 91 días, 80 UF exactas vs +$1, mismo acreedor, acreedor vacío; IPC
acumulado; freshness fresh/stale/unknown; `effectiveTo` exclusivo (no fuga
dic-2025 → ene-2026).

## 3. Estado de D1–D8 (verificados resueltos)

| Defecto previo | Verificación de la re-auditoría | Evidencia |
|---|---|---|
| D1 tabla 150 vs 310 | Tabla general 310/38,82 en motor, página y tests; SII S3/S5 | `12`, `18` |
| D2 UF 39.643,59 vs 39.727,96 | `AT2026.ufDecember = 39727.96`; cap APV $23.836.776 = SII (8.000 UF) | `11`, `12` |
| D3 ≥2 acreedores distintos | Motor exige ≥2 obligaciones calificadas; mismo acreedor califica | `12` |
| D4 umbral ≥ 80 | Estricto `> 80`: 80 exactas false, +$1 true | `12` |
| D5 art. 59 N°4 | Copy corregido a inciso 2° N°1 letras a) y g); N°4 = fletes 5% | `19` (S10) |
| D6 Ley 21.236 | Fuente de prepago = Ley 18.010 art. 10 (1 mes / 1,5 meses; ≤5.000 UF) | `19` (S14) |
| D7 idNorma 1211138 | `00-scope.json` S6 apunta a idNorma 1225354 | `00-scope.json` |
| D8 APV sin cobertura | `calculateApvWithdrawalRate` ejecutable + tests + copy "tasa media" | `12`; `TaxEngine.test.ts` |

## 4. Defectos abiertos

### D12 — media — El resaltado de tramo de IUSC sigue con la estructura de 150 UTM

`src/pages/calculadoras/impuesto-segunda-categoria.astro:423`:
`BRACKET_UPPER_LIMITS_UTM = [13.5, 30, 50, 70, 90, 120, 150, Infinity]`.

`bracketRows` y el motor ya usan 120–310 al 35% y 310+ al 40% (D1), pero
`highlightBracket()` no. Reproducido en navegador sobre el build limpio: para
**200 UTM ($14.344.200)** el resultado muestra **"Tasa marginal 35.0%"** y
**$3.347.936**, pero se resalta la fila `tramo-7` (**310–∞, 40%, rebaja
$2.784.209**); la fila correcta es `tramo-6` (120–310, 35%). Evidencia:
`18-residual-highlight.txt` (node + extracto DOM).

### D9 — baja — Mensaje del simulador SuperIR conserva "acreedores distintos"

`simulador-renegociacion.astro:645` (y JSDoc de `DebtItemInput.creditor`). El
art. 260 verificado exige "obligaciones … provenientes de obligaciones
diversas"; el motor corregido tampoco deduplica por acreedor. El mensaje
aparece en el bundle construido. Evidencia:
`20-residual-copy-artifacts.txt` (D9).

### D10 — baja — El harness de la auditoría previa quedó obsoleto

`evidence/recalc.audit.test.ts` (commiteado en #589) fija los valores
pre-remediación: **9/38 checks fallan en HEAD** (v.gr.
`expect(AT2026.ufDecember).toBe(39_643.59)`). Evidencia:
`13-prior-harness-at-head.txt`.

### D11 — baja — Claims V3/V5 de `00-scope.json` sin actualizar

V3 cita "art. 59 N°4" (corregido en D5) y V5 afirma "≥2 acreedores distintos"
(corregido en D3). Evidencia: `20-residual-copy-artifacts.txt` (D11).

## 5. Observaciones y limitaciones

1. **Fuera de alcance / editorial:** `src/data/blog/renegociacion-superir.md:202`
   ("La ley exige mínimo dos acreedores distintos…") contradice el art. 260 y el
   motor corregido; se publica en `dist/posts/renegociacion-superir/` y
   `dist/llms-full.txt`. Requiere decisión editorial aparte.
2. **UF histórica rezagada:** `uf-historico.json` termina el 2026-07-09
   (`actualizadoEl 2026-06-21`); el conversor UF histórico falla cerrado avisando
   el rango, pero el dataset queda ~2,5 meses atrás. No es cambio del plan 115 y
   `check:economic-snapshot-freshness` no cubre esa serie (sí IPC y snapshot).
3. **APV "reajustado":** `calculateApvWithdrawalRate` usa el retiro nominal; la
   ley habla del monto reajustado. Es una simplificación documentada (el
   llamador debe proveer el monto), no un error de cálculo.
4. **Tasa AFP 11,27% (Habitat):** proviene de `src/config/afpCommissions.ts`
   ("Previred … abril 2026"); no se localizó extracto oficial CMF/Previred en
   esta sesión ⇒ claim C6 `UNVERIFIED`. No afecta la aritmética de V2 bajo el
   supuesto declarado.
5. **Alcance no cubierto:** fuzzing completo de las 22 calculadoras, comisiones
   AFP por fecha, supuestos actuariales, CAE/TMC, exenciones completas de
   Operación Renta y contenido editorial (`src/data/`).
6. **`check:small-details` (enforce):** 0 blocking, 2 warnings preexistentes.
7. **Independencia:** la remediación la redactó OpenAI Codex (#589); esta sesión
   auditora corre en deepseek-v4.1-flash, familia distinta. La auditoría previa
   fue del mismo modelo que esta re-auditoría (limitación de variedad de
   familias, documentada en `02-result.json`).

## 6. Conclusión

Los seis vectores del alcance se reproducen de forma exacta e independiente en
`8b73793`, y **D1–D8 quedan verificados como resueltos** con fuente primaria.
Sin embargo, la remediación dejó tres residuales de copy/artefacto (D9–D11) y
una contradicción visible en la UI de la calculadora de IUSC (D12, media: el
resaltado de tramo usa 150 en vez de 310). Por la regla de cierre del protocolo
(`PASS` solo sin defectos abiertos), el veredicto es **CONDITIONAL**: no
publicar hasta corregir D12 y los residuales, y registrar la firma humana
(`humanSignoff` sigue `null`).

---

[1] El worktree se eliminó al cerrar la sesión (`git worktree remove`). El
checkout principal nunca se modificó por esta auditoría (solo se añadieron los
artefactos de salida en `docs/editorial/audits/plan-115-correctitud/`).
