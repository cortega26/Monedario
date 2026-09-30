# Auditoría matemática adversarial — plan 115 (correctitud), pass 4

> **Actualización pass5 (delta, `c1701ad5` #599):** D17–D21 quedaron
> **verificados resueltos** contra fuente primaria, render construido y guardas;
> sin regresiones (suite 187/1.796, `check:ci`, small-details enforce, build
> 332 páginas/23 checks). El barrido de superficies encontró **2 residuales
> nuevos de producto** (D23/D24, severidad baja) → el veredicto pass5 sigue
> **CONDITIONAL** (pre-gate, no reemplaza la firma humana). Detalle completo en
> **§8 — Pass5 delta**.

- **Rol:** `MathAuditAgent` (adversarial) — `AI_AUDIT_PROTOCOL` v1
- **Auditor:** deepseek-v4.1-flash (sesión `mathaudit-plan115-pass4-2026-09-29`,
  fresca, sin historial del draft; familia distinta a los agentes que
  implementaron/remediaron)
- **Fecha:** 2026-09-29 (UTC)
- **Commit auditado:** `30d6e39ad44d7102f730f8b0f6aed866e2c0fc51` (HEAD al
  cierre; la auditoría arrancó en `72d14e66` y HEAD avanzó a `30d6e39a` durante
  la sesión — ver §1)
- **Naturaleza:** pre-gate. No reemplaza la firma humana (`humanSignoff: null`).
- **Veredicto:** **CONDITIONAL** — los 6 vectores V1–V6 se reproducen de forma
  exacta e independiente, D1–D16 quedan resueltos y la suite/guardas/build/
  Playwright pasan en worktree limpio de `30d6e39a`; pero hay **5 defectos
  abiertos de producto**: D17 (residual de retención DAP en contenido
  relacionado + LLM), D18 (residual de taxonomía año comercial/año
  tributario), D19 (meses imposibles en `isPeriodId`), D20 (etiqueta de
  período de la tasa 15,25%) y D21 (umbrales IUSC desactualizados en el
  glosario). `CONDITIONAL` bloquea publicación hasta corregir y re-auditar.

No se modificó `src/` (R8). Todos los números salieron de ejecutar código
(Python `Decimal` de 50 dígitos + harness TS propio) y cada parámetro se ancló
a fuente primaria consultada hoy (R1/R2).

## 1. Método y reproducibilidad (R1, R4, R7)

Entorno: Node v24.19.0, pnpm 11.7.0, Python 3.13.12, Linux x86_64
(`evidence/33-env.txt`). El checkout principal tenía WIP ajeno (hero-images);
todas las gates corrieron en **worktrees limpios**:

- `wt-head` (detached `72d14e66`): suite 185/1784, guardas, build, barridos —
  `evidence/37–42`.
- `wt-head2` (detached `30d6e39a`): suite 186/1792, guardas, build, Playwright
  — `evidence/43`.

**HEAD se movió durante la sesión.** Al iniciar, HEAD era `72d14e66` (pasada 3
registrada en #597). Mientras se ejecutaba esta auditoría aterrizó #598
(`30d6e39a`, «veracidad timeliness»), que incluyó un fix del bold-glue D16
(`4081072a`) y formato prettier (`0f11e5c4`). Por rigor, **todo el checklist
obligatorio se re-ejecutó en `30d6e39a`** y el veredicto aplica a ese commit;
el estado intermedio en `72d14e66` queda registrado como evidencia del
hallazgo D16. Un tercero puede repetir la auditoría con:

```bash
git worktree add --detach /tmp/wt 30d6e39a && cd /tmp/wt
pnpm install --frozen-lockfile
python3 docs/editorial/audits/plan-115-correctitud/evidence/34-recalc-independent.py
cp docs/editorial/audits/plan-115-correctitud/evidence/pass4.independent.audit.test.ts \
   docs/editorial/audits/plan-115-correctitud/evidence/vitest.pass4.config.ts evidence/
pnpm exec vitest run --config docs/editorial/audits/plan-115-correctitud/evidence/vitest.pass4.config.ts
./node_modules/.bin/vitest run
pnpm run build
SMALL_DETAILS_ENFORCE=1 node scripts/check-small-details.mjs
node scripts/check-economic-snapshot-freshness.mjs
```

La reimplementación independiente es un script Python propio
(`evidence/34-recalc-independent.py`) que usa las tablas publicadas del SII
(AT2026 e IUSC sep-2026) y `Decimal` de 50 dígitos, más un harness TS propio
(`pass4.independent.audit.test.ts`, 73 checks) que compara motor vs recálculo
en el mismo proceso. Las únicas diferencias son de representación IEEE-754
(delta máximo 3,8e-9 en montos >$100 millones; las tasas delta ≤1,1e-16); la
exactitud decimal se verifica en el script Python.

## 2. Vectores: valor independiente vs motor

| Vector | Claim | Independiente | Motor | Estado |
|---|---|---|---|---|
| V1 | $18.000.000 renta neta ⇒ IGC $269.367,84 | 269.367,84 (Decimal) | 269.367,83999999997 | **OK** |
| V1-bug | $255.247,92 con UTM sep-2026 ×12 | 255.247,92 | no reproducido | **OK** |
| V2 | bruto $1.200.000 ⇒ base $973.560 / IUSC $213,06 / líquido $973.346,94 | idénticos | idénticos (display $973.347 / $213 en DOM real) | **OK** |
| V2-topes | 90 UF / 135,2 UF con bruto $6M | $3.694.410,90 / $5.549.826,152 / base $5.291.732,171658 | idénticos | **OK** |
| V3 | DAP $5M/180d/5% ⇒ $123.287,67 sin retención | 123.287,6712 | 123.287,6712 | **OK** |
| V4 | APV (ΔIGC/retiro) × 1,1 + 3 pp | 0,03 / 0,074 / 0,03157 / 0,38464 / 0,415 / 0,47 | idénticos | **OK** |
| V5 | SuperIR 101,78117 UF; cuota $110.110,21; total $5.285.289,97 | idénticos | idénticos | **OK** |
| V6 | IPC 8/8; acumulado 3,6488%; $1M→$1.036.488,08; UTA 834.504; UF 39.727,96; cap 600 UF $23.836.776 | idénticos | dataset y AT2026 idénticos | **OK** |

Regresiones obligatorias en `30d6e39a` (`evidence/43`):

| Comando | Resultado |
|---|---|
| `vitest run` (worktree limpio) | **186 archivos, 1.792 passed / 1 skipped, exit 0** |
| 3 guardas vitest (`dap-no-retention-surfaces`, `honorarios-rate-year-consistency`, `audit-scope-consistency`) | **9/9 passed** |
| Playwright `calculator-iusc-highlight` + `calculator-states` (puerto aislado 4400) | **42/42 passed** |
| Playwright `calculator-scenario-consistency` + `calculator-semantics` | 11/11 passed (ejecutado en `72d14e66`; #598 no toca las calculadoras que cubre) |
| `pnpm run build` | 332 páginas, **23 checks postbuild OK** |
| `SMALL_DETAILS_ENFORCE=1`, freshness, audit-artifacts, reader-facing-copy, afp-commissions | **exit 0** (small-details 0 blocking; 2 warnings preexistentes) |

Nota de entorno: el puerto 4321 (config Playwright del repo) estaba ocupado por
un **dev server de otro proyecto** (`noticiencias_news_collector`). La primera
corrida de Playwright reutilizó ese servidor y falló en 42/42 por 404; se
re-ejecutó en puertos aislados (4399/4400) con un config temporal en el
worktree desechable, sin tocar el servidor ajeno. Los 42/42 pasan contra el
build correcto.

## 3. Estado de D1–D15 y observaciones 1–2

| ID | Estado en `30d6e39a` | Verificación |
|---|---|---|
| D1 tabla 310/38,82 vs 150/30,82 | resuelto | C2/C25; harness y contraste $6.676.032 |
| D2 UF 39.727,96 | resuelto | C12; 317.823.680/8.000 |
| D3 obligaciones diversas (mismo acreedor) | resuelto | C9; art. 260 |
| D4 umbral estricto >80 UF | resuelto | C9; 80 exactas false |
| D5 art. 59 inc. 2° N°1 a)/g) | resuelto | C6; texto LeyChile |
| D6 Ley 18.010 art. 10 (prepago) | resuelto | C24; texto legal |
| D7 idNorma 1225354 (IMM) | resuelto | C22; Ley 21.830 |
| D8 APV ejecutable | resuelto | C7/C8; 8 vectores |
| D9 mensaje «origen distinto» | resuelto | C9; barrido §5 |
| D10 harness histórico | resuelto | C26 |
| D11 scope V3/V5 | resuelto | guarda audit-scope-consistency |
| D12 highlight IUSC | resuelto | **Playwright ejecutado**: 200⇒fila 6, 320⇒fila 7, 100⇒fila 5 |
| D13 scope UF 31-12-2025 | resuelto | guarda audit-scope-consistency |
| D14 metadata/JSON-LD/catálogo DAP | resuelto | C14; barrido src+dist+llms y guarda |
| D15 15,25% en ciclo AT2026 | resuelto en la tasa | C15; guarda 5/5 y barrido 14,5/15,25 |

**Observaciones 1–2 de pasadas previas:**

1. **AFP 11,27%**: sigue verificado en vivo contra Previred y por el gate del
   repo (`✓ All AFP commission rates match Previred official figures`),
   `evidence/38`.
2. **D12 a nivel DOM**: la reserva de la pasada 3 («no re-ejecutado por
   requerir build+preview») queda **levantada**: el test Playwright del
   highlight se ejecutó en ambos commits y pasa (42/42 con `calculator-states`).

Observaciones 3–7 de la pasada 3 siguen vigentes como limitaciones (§6).

## 4. Defectos nuevos (pass 4)

### D16 — media — `product` — REGRESIÓN de la remediación D15 — **resuelto en `30d6e39a`**

En `72d14e66`, la guía `guias/impuestos-personas/operacion-renta/index.astro`
(reescrita por #596) dejó dos `bold-glue`: el HTML construido renderizaba
`...2025 es<strong>14,5%</strong>` y `...sube a<strong>15,25%</strong>` sin
espacio (visible en pantalla como «es14,5%» / «a15,25%»), y
`SMALL_DETAILS_ENFORCE=1 node scripts/check-small-details.mjs` fallaba con
**2 errores blocking** (ASD-004, líneas 449/450). En `9e195743` (pre-#596) el
mismo gate pasaba con 0 errores. #598 (`30d6e39a`) lo corrigió con separadores
explícitos `{" "}`; el render ya muestra el espacio y el gate vuelve a 0
errores. Evidencia: `evidence/42` (§D16), `evidence/43` (§43.1/§43.7),
`evidence/39`.

### D17 — media — `product` — **abierto**: residual de retención DAP en contenido relacionado

`src/data/blog/fondo-emergencia-chile.md:151` responde «¿El fondo de
emergencia paga impuestos?» afirmando que los intereses DAP están sujetos a
«impuesto a los intereses (retención para personas naturales en Chile…)».
Contradice F03/art. 59 inc. 2° N°1 (el 4% es Impuesto Adicional de no
domiciliados; el banco no retiene a residentes) y el propio motor
(`CalculateTermDeposit` no retiene). La frase viaja al `llms-full.txt` del
build (línea 6011) y a snippets. Es el mismo patrón de D14, en la superficie
«contenido relacionado / LLM» que el barrido de #596 no cubrió.

### D18 — media — `product` — **abierto**: residual de taxonomía año comercial/año tributario (F02)

`src/data/blog/operacion-renta-centro.md` usa «año tributario 2025» en 5
pasajes (líneas 50, 66, 70, 98, 102) para la campaña 2026 / ingresos 2025,
incluido «el umbral … para el año tributario 2025 es de $11.265.804 …
usando la UTA de diciembre de 2025», que es imposible (AT2025 usa UTA
dic-2024). La línea 215 del propio artículo dice «año tributario 2026 (rentas
de 2025)». Además `impuesto-global-complementario-chile.md:99` define la UTA
como «12 × UTM del mes de diciembre del año tributario» cuando es la de
diciembre del **año comercial**. La remediación D15 corrigió la tasa pero no
estos rótulos.

### D19 — baja — `product` — **abierto**: `isPeriodId` acepta meses imposibles

`src/domain/economic/EffectiveDatedParameters.ts`: `isPeriodId("2025-13")`
devuelve `true` y `resolveEffectiveValue(entries, "uf", "2025-13")` resuelve la
entrada de `2025-12`. El contrato del tipo es `YYYY-MM` (mes 01–12) y la
garantía declarada es fail-closed; solo el formato está validado. Hoy no hay
llamador de producto (el registry se consume por tests y aún no reemplaza a
`AT2026`), por eso severidad baja; se registra porque la pasada 3 afirmó
«período malformado ⇒ `undefined`», lo que no se cumple para el rango.

### D20 — baja — `product` — **abierto**: etiqueta de período de la tasa 15,25%

`src/pages/calculadoras/boleta-honorarios-liquido.astro:231` dice que el
15,25% es la «tasa transitoria vigente para el año tributario 2026». El SII
fija la tasa **por año comercial** (boletas emitidas en 2026 ⇒ AT2027); para
AT2026 la tasa es 14,5%. El campo de la página sí está bien («En 2026 la
referencia vigente es 15,25%») y el cálculo es correcto para boletas 2026;
el error es de rótulo. No cubierto por la guarda D15 (que exige solo «2026»
cerca de «15,25»).

### D21 — baja — `product` — **abierto**: umbrales IUSC desactualizados en el glosario

`src/data/glossary/impuesto-unico.md:12` afirma «En 2026 ese umbral es
aproximadamente $943.501 mensuales» y la tabla usa ~$2.094.000 / ~$3.490.000 /
~$4.886.000 (UTM ≈ 69.800–69.889 de comienzos de 2026, sin mes). Con la UTM
vigente al cierre (sep 71.721 / oct 72.151) los umbrales son $968.233,50 /
$974.038,50 y superiores. El propio glosario advierte que el SII actualiza la
tabla cada mes, pero el número presentado queda 2,6–3,2% bajo y sin fecha.

### D22 — baja — `audit-package` — resuelto por esta pasada

El artefacto previo era internamente inconsistente (el `02-result.json` de
`72d14e66` marcaba D14/D15 `resolved` mientras el `03-report.md` los declaraba
abiertos y encabezaba `CONDITIONAL` con «2 defectos abiertos»), y su claim
«small-details: 0 blocking, 2 warnings preexistentes» no reproducía en
`72d14e66` (2 errores blocking, D16). Esta pasada reescribe ambos artefactos
con estado verificable. No bloquea publicación.

## 5. Matriz de superficies (cierre por hecho)

Barrido de las seis superficies por cada hecho auditado
(`evidence/40`): cuerpo, metadatos, JSON-LD, catálogo/LLM (`calculatorPortfolio`,
`hubPillarConfig`, `llms-full.txt` del build), contenido relacionado y
motor/tests.

| Hecho | Cuerpo | Metadata | JSON-LD | Catálogo/LLM | Relacionado | Motor/tests | Residual |
|---|---|---|---|---|---|---|---|
| Retención DAP (4%) | limpio | limpio | limpio | limpio | **D17** | OK | D17 abierto |
| Honorarios 14,5/15,25 | limpio (D15) | limpio | limpio | limpio | **D18/D20** | OK | D18/D20 abiertos |
| Tabla IGC/IUSC 310/38,82 | limpio | limpio | limpio | n/a | **D21** | OK (Playwright) | D21 abierto |
| UF 31-12-2025 | limpio | limpio | limpio | n/a | limpio | OK | — |
| SuperIR >80 UF / obligaciones diversas | limpio | limpio | limpio | limpio | limpio | OK | — |
| APV 1,1 + 3 pp / 15% / pensionados | limpio | limpio | limpio | limpio | limpio | OK | — |

## 6. Observaciones y limitaciones (no defectos)

1. **Topes AFP/AFC**: Previred publica el tope en CLP con UF 41.057,20; el
   motor aplica la UF del snapshot (41.049,01). Diferencia ~0,02% en bases
   topadas (bruto $6M), documentada y sin efecto en V2.
2. **APV 600 UF**: `apv.astro` usa la UF del día como aproximación del valor
   al 31-dic del año en curso (aún no publicado); el motor AT2026 usa la UF
   congelada 39.727,96. Documentado en la página.
3. **APV «monto reajustado»**: el motor usa el retiro nominal; la ley habla
   del monto reajustado. Simplificación documentada (el llamador provee el
   monto).
4. **SuperIR**: no se modelan todas las exclusiones del art. 260 (alimentos,
   delitos/cuasidelitos, multas) ni la exigibilidad caso a caso; el copy
   declara el alcance del filtro.
5. **IPC**: la serie se ancla a la columna mensual del SII (variación INE) y
   al snapshot; no se consultó la API Siete del BCCh (requiere credenciales).
6. **`utm-historico.json`** termina en 2026-07 y el SII ya publicó ago/sep; no
   es consumido por páginas del producto (solo script/tests), se registra como
   higiene de datos.
7. **Tipografía**: `simulador-renegociacion.astro` (~línea 382) dice
   «acredores» (por «acreedores»); error ortográfico menor, no altera el
   significado, no se clasifica como defecto.
8. **Cobertura no agotada**: fuzzing de las 22 calculadoras, comisiones AFP
   por fecha, supuestos actuariales, CAE/TMC, exenciones completas de
   Operación Renta y contenido editorial fuera de los hechos barridos.

## 7. Conclusión

El núcleo del plan 115 está correcto y ahora con verificación DOM real: los
seis vectores se reproducen de forma exacta e independiente con fuentes
primarias consultadas hoy, D1–D16 están resueltos y re-verificados, y la suite
completa (186 archivos/1.792 tests), las guardas (incluida la de highlight
IUSC), el build (23 checks) y los gates pasan en worktree limpio de
`30d6e39a`. Sin embargo, la revisión adversarial encontró **5 defectos de
producto abiertos** que siguen el patrón de los hallazgos originales: un
residual de retención DAP en contenido relacionado/LLM (D17), residuales de
taxonomía año comercial/año tributario (D18), y tres defectos menores de
robustez/rótulo/glosario (D19–D21). Hasta corregirlos y re-auditar, el
veredicto es **CONDITIONAL — no publicar**. La firma humana sigue pendiente
(`humanSignoff: null`).

---

## 8. Pass5 delta — verificación de la remediación `c1701ad5` (D17–D21)

- **Rol:** `MathAuditAgent` (adversarial), sesión `mathaudit-plan115-pass5-2026-09-29`,
  fresca y sin historial de la remediación; no modificó `src/` (R8). Veredicto
  **pre-gate** (`humanSignoff: null`).
- **Alcance:** delta sobre `c1701ad5` (#599). La remediación tocó 11 archivos
  (`evidence/55` §55.1); en dominio solo `EffectiveDatedParameters.ts` (1 línea,
  regex de período); el resto del motor no cambió desde `30d6e39a`, por lo que
  V1–V6 no se recalcularon, pero sí se re-ejecutó la suite completa.
- **Entorno:** Node v24.19.0, pnpm 11.7.0, Python 3.13.12, Linux x86_64; worktree
  limpio de `c1701ad5` (`evidence/44`). Reproducción:
  `bash evidence/pass5.generate-evidence.sh "$PWD" evidence/` + comandos de §8.2.
- **Fuentes primarias re-consultadas** (2026-09-29 UTC; sha256 y extractos en
  `evidence/45`): SII FAQ DAP `001.140.2738` (actualizada 31-03-2026), SII FAQ
  honorarios `001.140.7297`, tabla IUSC 2026 (sep/oct), AT2026 personas naturales,
  UTM 2026 y LeyChile `idNorma=6368` (art. 59 inc. 2° N°1 a)/g)).

### 8.1 Verificación por defecto (comando + salida)

| Defecto | Comando(s) | Salida verificada | Estado |
|---|---|---|---|
| D17 | `rg -n 'impuesto a los intereses' src/data/blog dist/llms-full.txt`; `python3 pass5.dap-retention-sweep.py src\|dist`; vitest `dap-no-retention-surfaces` | frase vieja **0**; FAQ nueva en `fondo-emergencia-chile.md:152` y `llms-full.txt:130`; guarda **2/2**; sin residuales en blog/llms (`evidence/46`) | **resuelto** |
| D18 | `rg -n 'año tributario 2025\|AT2025\|…' src/data src/pages src/config src/application`; vitest `at-taxonomy-consistency`; render `dist/posts/operacion-renta-centro` | **0** ocurrencias de AT2025; 5 pasajes → «AT2026 (rentas de 2025)»; UTA dic-2025; guarda **3/3**; render AT2026 presente / AT2025 ausente (`evidence/47`) | **resuelto** |
| D19 | `node --input-type=module -e "…isPeriodId…"`; vitest `tests/domain/EffectiveDatedParameters.test.ts` | `2025-13`/`2025-00` ⇒ **false** y `resolve = undefined` (fail-closed); bordes (`2025-1`, `2025-12-01`, `''`, `2025-012`, unicode, ISO datetime) ⇒ false; el test ya no afirma lo contrario (`evidence/48`) | **resuelto** |
| D20 | `rg` en `boleta-honorarios-liquido.astro`; render `dist/calculadoras/boleta-honorarios-liquido`; guarda | `notes` y `hint` rotulan **año comercial 2026** (boletas 2026 ⇒ AT2027); página sin «año tributario 2026»; guarda **3/3** (`evidence/49`) | **resuelto** |
| D21 | `node pass5.d21-compare.mjs`; render `dist/glosario/impuesto-unico` | motor vs tabla SII sep/oct-2026: **100% MATCH** (exento + 6 filas + 40% sobre 310 con rebaja 38,82 UTM); glosario vs motor **8/8**; render `≈ $968.234` con la UTM del snapshot (71.721); `reviewedDate: 2026-09-29`; 0 CLP viejos (`evidence/50`) | **resuelto** |

### 8.2 Regresiones (worktree limpio de `c1701ad5`)

| Comando | Resultado |
|---|---|
| `pnpm run test` | **187 archivos, 1.796 passed / 1 skipped**, exit 0 (`evidence/51`) |
| `pnpm run check:ci` | **exit 0** (lint, format, coverage, boundaries, context, policy, docs, audit-artifacts, frontmatter, legal, hero, editorial, timeliness, routes, astro check, workers, catálogo, registro, hosts, homepage, small-details) |
| `SMALL_DETAILS_ENFORCE=1 node scripts/check-small-details.mjs` | **exit 0**, 0 errors / 0 blocking (2 warnings preexistentes) — D16 no volvió |
| `pnpm run build` + `node scripts/check-postbuild.mjs dist` | **exit 0**, 332 páginas, **23 checks** (`evidence/52`) |
| Guardas (`dap-no-retention-surfaces`, `at-taxonomy-consistency`, `honorarios-rate-year-consistency`, `audit-scope-consistency`) + test de dominio | **5 archivos / 21 tests passed** (`evidence/53`) |
| `EDITORIAL_ENFORCE=1 check-reader-facing-copy`, freshness, audit-artifacts | **exit 0** (`evidence/51`) |

### 8.3 Residuales nuevos (pass5)

**D23 — baja — `product` — abierto — «retención» en la guía que describe la
calculadora DAP.** `src/pages/guias/ahorro-e-inversion/index.astro:208` (paso 5):
«Estima interés bruto, retención e interés neto con tu monto y plazo». La calculadora
no estima retención alguna: su resultado son capital + interés + nota «el banco no
aplica retención» (`dist/calculadoras/deposito-a-plazo/index.html`). Se renderiza en
`dist/guias/ahorro-e-inversion/index.html`; no aparece en `llms.txt`/`llms-full.txt`.
Es el patrón D14/D17 en la superficie «contenido relacionado», que la guarda extendida
no cubre porque solo barre `src/data/blog`. Evidencia: `evidence/54` (§54.4),
`evidence/46` (§46.4).

**D24 — baja — `product` — abierto — umbral IUSC sin mes en el glosario
`sueldo-bruto`.** `src/data/glossary/sueldo-bruto.md:27`: «Progresivo desde ~$943.000»
(UTM temprana 2026, sin mes, sin `reviewedDate`). Con la UTM del snapshot (sep-2026,
71.721) el umbral es $968.233,50 (oct-2026: $974.038,50). El fix de D21 tocó solo
`impuesto-unico.md`; este glosario relacionado quedó fuera del barrido. Evidencia:
`evidence/54` (§54.5).

### 8.4 Matriz de superficies (pass5)

| Hecho | Cuerpo | Metadata/JSON-LD | Catálogo/LLM | Relacionado | Motor/tests | Residual |
|---|---|---|---|---|---|---|
| Retención DAP (no residentes) | OK | OK (JSON-LD FAQ) | OK (llms-full) | **D23** (guía) | OK | D23 |
| Umbral IUSC (13,5 UTM / tabla art. 43 N°1) | OK (`impuesto-unico`) | n/a | OK | **D24** (`sueldo-bruto`) | OK | D24 |
| Honorarios por año comercial | OK | OK | OK | OK | OK | — |
| Taxonomía AT2026 (rentas 2025) | OK | OK | OK | OK | OK | — |

### 8.5 Veredicto y limitaciones

**Veredicto pass5: `CONDITIONAL`** — D17–D21 resueltos y sin regresiones, pero PASS
exige 0 defectos **de producto** abiertos y quedan D23/D24 (severidad baja). Los
`audit-package` (D7/D10/D11/D13/D22) están resueltos y no bloquean. Veredicto
**pre-gate**: no reemplaza la firma humana (`humanSignoff: null`).

Limitaciones: (1) el sweep DAP↔retención es heurístico por proximidad; los falsos
positivos de `dist` están listados y clasificados en `evidence/46`/`54` (copy correcto
a <600 chars de la aclaración, listas temáticas, tarjetas contiguas de posts
distintos); (2) no se re-ejecutó Playwright en pass5: `c1701ad5` solo cambia copy/notas
en `boleta-honorarios-liquido.astro` y contenido markdown (sin lógica de
calculadoras), y el build+postbuild cubrieron el render; (3) el extracto de LeyChile
del art. 59 tiene anotaciones de modificaciones intercaladas (documentado en
`evidence/45`); (4) fuera del hecho auditado quedan observaciones no clasificadas:
`cotizacion-voluntaria-afp-independiente.md:171` («1,49% (año tributario 2026)» para
SIS, tasa no auditada en plan 115) y ejemplos fechados en
`como-calcular-sueldo-liquido.md:158/233` y `descuentos-de-sueldo.md:84` (correctos
para el mes que citan —marzo/abril 2026— pero envejecen; el gate de timeliness los
cubre); (5) la cobertura no agotada de pass4 (§6.8) sigue vigente.

---

## 9. Pass6 delta — verificación de la remediación `02b878a7` (D23–D24) + barrido de clase completo

- **Rol:** `MathAuditAgent` (adversarial), sesión `mathaudit-plan115-pass6-2026-09-30`
  (muse-spark-1.3), fresca y sin historial de la remediación; no modificó `src/`
  (R8). Veredicto **pre-gate** (`humanSignoff: null`).
- **Alcance:** delta sobre `02b878a7` (#601: 2 líneas en `src/` + 2 guardas
  extendidas). El motor no cambió desde `c1701ad5`, por lo que V1–V6 no se
  recalcularon, pero sí se re-ejecutó la suite completa. Además, barrido de clase
  A (retención DAP) y clase B (umbrales CLP) **obligatorio, una sola vez y
  exhaustivo** — las pasadas 4 y 5 hallaron residuales en superficies no cubiertas
  (guías/hubs, glosario), así que nada se dio por bueno del remediador.
- **Entorno:** Node v24.19.0, pnpm 11.7.0, Python 3.13.12; worktree limpio de
  `02b878a7` (`evidence/56`). Evidencia numerada desde `56` porque
  `55-artifact-validation-pass5.txt` ya existía.
- **Fuentes primarias:** se reutilizan las anclas de pass5 (`evidence/45`: SII FAQ
  DAP `001.140.2738`, tabla IUSC sep/oct-2026, LeyChile `idNorma=6368` art. 59)
  más el snapshot del repo (`utm: 71721`, sep-2026) y el plugin
  `src/remark-economic-variables.ts` como mecanismo de interpolación.

### 9.1 Verificación por defecto (comando + salida)

| Defecto | Comando(s) | Salida verificada | Estado |
|---|---|---|---|
| D23 | `rg` ficha en `guias/ahorro-e-inversion/index.astro`; `rg -c 'retención e interés neto'` en src+dist; `rg` outputs en `deposito-a-plazo.astro`; extracción Python del render; vitest `dap-no-retention-surfaces` | ficha = «Estima el interés bruto y el monto neto al vencimiento»; frase vieja **0**; **0** `retenc` en la página renderizada; outputs reales «Interés pagado al vencimiento» + «Monto al vencimiento»; guarda **3/3** (`evidence/57`) | **resuelto** |
| D24 | `sed` frontmatter + `rg` celda/párrafo en `sueldo-bruto.md`; Python `Decimal(13.5)*71721`; extracción Python de `dist/glosario/sueldo-bruto`; vitest `at-taxonomy-consistency` | celda «Progresivo desde 13,5 UTM» + párrafo `[[utm * 13.5 \| clp]]` fuera de tabla + `reviewedDate: 2026-09-29`; **13,5×71.721=968.233,5→$968.234** renderizado (= SII sep-2026 $968.233,50); **0** `[[` crudo y 0 CLP viejos; guarda **4/4** (`evidence/58`) | **resuelto** |

### 9.2 Barrido de clase A — retención DAP en todas las superficies (resultado: 0 residuales)

Método (`evidence/59` §§59.1–59.3): sweep de proximidad DAP↔`retenc*` (±400,
`pass5.dap-retention-sweep.py`) sobre `src` (410 archivos: 14 proximidades, 11
aclaradas, 3 sin aclarar) y `dist` (342 archivos: 13/8/5), más adjudicación manual
propia con ventana ±800 en las 9 superficies mandatadas (`src/data/blog/**`,
`src/data/glossary/**`, `src/pages/guias/**`, `src/pages/calculadoras/**`,
`src/config/calculatorPortfolio.ts`, `src/components/**`,
`src/pages/terminos.astro`, políticas editoriales) y en `llms-full.txt`/`llms.txt`.

- **Aclaradas en el propio copy:** `deposito-a-plazo.astro` (7 menciones: «el banco
  no aplica/no practica retención» + «4% … solo … no domiciliados/no residentes,
  Impuesto Adicional art. 59»), `fondo-emergencia-chile.md` (FAQ D17),
  `calculatorPortfolio.ts` (DAP = «interés bruto y monto neto … cómo tributa»),
  `editorial-timeliness-policy.json` (`dap.retention.non_resident_4pct`: «solo para
  no domiciliados (art. 59…)`), `dist` equivalentes y FAQ D17 en `llms-full.txt`.
- **Falsos positivos adjudicados (no defectos):** `llmsTxt.ts` y `llms*.txt`
  (ítems distintos de una lista temática: «boletas … y retención» vs «depósitos a
  plazo»); `archives/index.html` (tarjetas contiguas de posts distintos);
  `que-es-el-apv.mdx` («si el depósito es directo» = aporte APV, no DAP; el DAP
  aparece 8 líneas después como link comparativo; la retención del 15% citada es
  APV Régimen B, art. 42 bis — correcta); `src/components/` sin `retenc` en ningún
  archivo.
- **Cierre D23:** la guía renderizada ya no contiene `retenc` en absoluto.

### 9.3 Barrido de clase B — umbrales CLP en `src/data/**` + `src/pages/**` (resultado: 0 defectos)

Método (`evidence/59` §§59.4–59.5): `rg` de montos candidatos + 12 verificaciones
`Decimal` ejecutadas (nada de aritmética de memoria). Cierran exacto: UTM
abr/mar-2026 = 69.889 (943.501,50÷13,5; 2.096.670÷30); sep-2026 13,5/30/50/70/90/
120/310 × 71.721 = 968.233,5 / 2.151.630 / 3.586.050 / 5.020.470 / 6.454.890 /
8.606.520 / 22.233.510; AT2026 13,5×834.504 = 11.265.804, 310 UTA = 258.696.240.

- **Observaciones legítimas (mes explícito o UTM/UTA+AT):** `como-calcular-sueldo-
  liquido.md:158/171/233` y `descuentos-de-sueldo.md:84` (marzo/abril 2026);
  `utm-chile-que-es-como-funciona.md:135/183/187-189/202` (tabla «orientativa,
  septiembre 2026» con cita SII); `operacion-renta-centro.md:66/74/102/215`,
  `rentas-mixtas:55/73`, `guias/…/operacion-renta:227` ($11.265.804 con 13,5 UTA /
  UTA dic-2025). Glosario: IVA/APV/Fonasa/CTC/boletas/dividendo son ejemplos o
  tasas ajenas a IUSC/IGC/UTA — fuera de clase.
- **Observación borde (documentada, no defecto):** `primer-empleo-chile-guia-
  completa.md:227` («referencia ~$950.000 brutos mensuales en 2026»): aproximada
  (`~`, «referencia»), acotada al año y dentro del rango 2026 ($941.638–$974.038);
  no es un umbral operativo preciso como los de D21/D24.
- **HTML:** 0/332 páginas con `[[` crudo.

### 9.4 Residual nuevo: D25 — baja — `product` — abierto

`dist/llms-full.txt` publica **7 líneas con `[[...]]` sin interpolar** (umbrales
IUSC/IGC de `impuesto-global-complementario-chile.md` y `sueldo-imponible-
chile.md`: `[[uta | clp]]`, `[[uta * 13.5|30|0.54|…]]`, `[[utm | clp]]`,
`[[utm * 13.5|30|0.54|…]]`, `[[1200000 * 0.04 - utm * 0.54 | clp]]`,
`[[934800 + utm * 0.54 | clp]]`), porque `src/pages/llms-full.txt.ts` concatena
`post.body` crudo vía `bodyToPlainMarkdown` (no-op sobre `.md`) **sin pasar por
el plugin `remark-economic-variables`**. El HTML de los mismos posts sí interpola
($834.504/$11.265.804; $71.721/$968.234). Ningún barrido previo lo cubría
(buscaban CLP hardcodeado o retención, nunca `[[` crudo). El glosario no se
concatena en `llms-full` (0 ocurrencias), así que D24 no fuga por esta vía.
Preexistente a `02b878a7`. Superficie Catálogo/LLM de la matriz §5: es defecto,
no observación. Evidencia: `evidence/60`.

### 9.5 Regresiones (worktree limpio de `02b878a7`)

| Comando | Resultado |
|---|---|
| `pnpm run test` | **187 archivos, 1.798 passed / 1 skipped**, exit 0 (+2 tests vs pass5: las guardas extendidas de `02b878a7`) |
| `pnpm run check:ci` | **exit 0** |
| `SMALL_DETAILS_ENFORCE=1 node scripts/check-small-details.mjs` | **exit 0**, 0 errors / 0 blocking (2 warnings preexistentes) — D16 no volvió |
| `pnpm run build` + `node scripts/check-postbuild.mjs dist` (explícito) | **exit 0**, 332 páginas, **23 checks** |
| Guardas (`dap-no-retention-surfaces`, `at-taxonomy-consistency`, `honorarios-rate-year-consistency`, `audit-scope-consistency`) | **4 archivos / 15 tests passed** |

Evidencia: `evidence/56` (entorno), `evidence/61` (regresiones).

### 9.6 Veredicto y limitaciones

**Veredicto pass6: `CONDITIONAL`** — D23–D24 verificados resueltos y sin
regresiones, barrido de clase sin residuales A ni B, pero PASS exige 0 defectos
**de producto** abiertos y queda **D25** (severidad baja, LLM-facing, valores
recuperables por fórmula + URL origen). Veredicto **pre-gate**: no reemplaza la
firma humana (`humanSignoff: null`).

Limitaciones: (1) el sweep DAP↔retención sigue siendo heurístico por proximidad;
todos los FLAG se adjudicaron manualmente en `evidence/59`; (2) no se re-ejecutó
Playwright: `02b878a7` solo cambia copy markdown/astro y 2 tests (sin lógica de
calculadoras), y build+postbuild cubrieron el render; (3) no se re-consultó SII/
LeyChile por red: se reutilizan las anclas sha256 de `evidence/45` (2026-09-29)
más el snapshot versionado del repo; (4) la observación borde de §9.3
(`primer-empleo:227`) queda a criterio del remediador: si se endurece el criterio
de clase B a «año no basta», pasaría a defecto; (5) D25 admite dos fixes (interpolar
al generar `llms-full` o excluir la sintaxis), decisión del remediador con su ADR
si toca el pipeline.

---

## 10. Pass7 delta — verificación de la remediación `bdf26fe7` (D25)

- **Rol:** `MathAuditAgent` (adversarial), sesión `mathaudit-plan115-pass7-2026-09-30`
  (muse-spark-1.3), fresca y sin historial de la remediación; no modificó `src/`
  (R8). Veredicto **pre-gate** (`humanSignoff: null`).
- **Alcance:** delta sobre `bdf26fe7` (#603: interpolación extraída a
  `src/utils/economicInterpolation.ts`, aplicada en `llms-full.txt.ts`, + check
  postbuild `llms-full-no-raw-interpolation`). El motor no cambió, por lo que
  V1–V6 no se recalcularon; D25 se re-derivó desde el artefacto construido, sin
  confiar en el remediador.
- **Entorno:** Node v24.19.0, pnpm 11.7.0, Python 3.13.12; worktree limpio de
  `bdf26fe7` (`evidence/62`). Evidencia numerada desde `62` porque
  `61-regressions-pass6.txt` ya existía.

### 10.1 Verificación de D25 (comando + salida)

| Aspecto | Comando(s) | Salida verificada |
|---|---|---|
| `llms-full.txt` sin `[[` | `rg -c '\[\[' dist/llms-full.txt` | **0 ocurrencias** (pass6: 7 líneas) |
| Valores resueltos | `rg` de `$968.234/$71.721/$834.504/$11.265.804/$2.151.630` + Python `Decimal` 9 expresiones | 7 líneas resueltas (`:189/204/2175/2190/2192/2215/2216`); 13,5×71.721=968.233,5→$968.234; 1.200.000×0,04−utm×0,54=9.270,66→$9.271; 934.800+utm×0,54=973.529,34→$973.529 (`evidence/63`) |
| HTML 2 posts | `rg -l '\[\[' dist/posts/impuesto-global-complementario-chile/ dist/posts/sueldo-imponible-chile/` | **0** en ambas; valores presentes (sueldo-imponible: 2×$71.721, 4×$968.234; IGC: 2×$834.504, 2×$11.265.804) |
| Check postbuild | `node scripts/check-postbuild.mjs dist` | **24 checks OK** sobre 332 páginas (23 en pass6 + el nuevo) |
| Caso sintético | vitest `tests/scripts/check-postbuild.test.ts` | **49/49**, incluye fallo con `[[utm * 13.5 \| clp]]` (`llms-full-no-raw-interpolation` en stderr) |
| Contrato plugin | vitest `remarkEconomicVariables` + `economicInterpolation` | **7/7** (mensajes exactos, snapshot ausente una sola vez, trailing garbage; `SKIP_TYPES` intacto; irresolubles fail-visible) |
| Dist total | `rg` de plantillas en `dist/` (html/txt/rss/sitemap) | **0** en todo el dist; `llms.txt` limpio |

**Estado: D25 resuelto** (C39).

### 10.2 Borde de code spans/blocks

El plugin remark salta `code`/`inlineCode`/`html` pero la interpolación de texto
plano de llms-full no distingue: si un artículo usara `[[…|…]]` en código, las
superficies divergirían (defecto `product`). Scan fence-aware propio sobre
**131 archivos** de `src/data`: **0 ocurrencias en código** (las 9 líneas con
plantillas —2 posts + 2 glosarios— están todas en prosa). No es defecto; queda
como riesgo residual para autores futuros, parcialmente mitigado por el check
de artefacto (`evidence/65`).

### 10.3 Regresiones (worktree limpio de `bdf26fe7`)

| Comando | Resultado |
|---|---|
| `pnpm run test` | **188 archivos, 1.804 passed / 1 skipped**, exit 0 (+6 tests del propio fix) |
| `pnpm run check:ci` | **exit 0** |
| `SMALL_DETAILS_ENFORCE=1 pnpm run check:small-details` | **exit 0**, 0 blocking (2 warnings preexistentes) — D16 no volvió |
| `pnpm run build` + `node scripts/check-postbuild.mjs dist` | **exit 0**, 332 páginas, **24 checks** |
| Guardas (`dap-no-retention-surfaces`, `at-taxonomy-consistency`, `honorarios-rate-year-consistency`, `audit-scope-consistency`) | **4 archivos / 15 tests passed** |

No se re-ejecutó Playwright (mismo criterio que pass6: sin lógica de
calculadoras afectada). Evidencia: `evidence/66`.

### 10.4 Veredicto y limitaciones

**Veredicto pass7: `PASS`** — D25 verificado resuelto y 0 defectos **de producto**
abiertos (D1–D6, D8–D9, D12, D14–D25 resolved; D7/D10/D11/D13/D22 `audit-package`
resolved y no bloquean). **PASS es pre-gate: no sustituye la firma humana; la
firma de Carlos Ortega se registra después (`humanSignoff: null`).**

Limitaciones: (1) V1–V6 no se recalcularon (motor intacto; el refactor solo
extrae el evaluador — cubierto por los 7 tests de contrato); (2) no se
re-consultó SII/LeyChile por red: se reutiliza el snapshot versionado
(utm=71721/uta=834504) más el recálculo Decimal propio; (3) el sweep de
plantillas crudas es sintáctico (`[[…|…]]`); una expresión futura que falle en
evaluación quedaría visible como `[[…]]` crudo y el check la detectaría
(fail-visible por diseño); (4) sin Playwright (ver §10.3).
