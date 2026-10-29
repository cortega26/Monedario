# Re-auditoría delta — causa 2, fase 4

- **Fecha:** 2026-10-28 (America/Santiago)
- **Veredicto:** `CONDITIONAL`
- **Checkout:** `fix/causa2-phase4-cluster-remediation` @ `3286ea59c2000ee37ef86324e1ec8a9c98d02eb0`
- **Base:** `main@32ac7dc76c06c71ac2de68533efdd417a43d825f`
- **Remediación de producto:** `a5b9dbf298362a225d3ff1e15a4a50d424def3b3`
- **Registro de auditoría:** `ca47a67b384a86e0b5936840ca1917b87468c0fe`
- **Gate de CI:** `3286ea59c2000ee37ef86324e1ec8a9c98d02eb0`

## Auditor e independencia

Auditor: **ComplianceAgent (adversarial), GPT-6 Luna (`gpt-6-luna`), OpenAI/Codex**, Codex CLI `0.164.0-alpha.11.1`, sesión `01a18236-b22c-7122-aac9-239563794c14`, esfuerzo `xhigh`.

La redacción original fue hecha por DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`). Esta revisión pertenece a la misma familia auditora OpenAI/Codex que la auditoría FAIL original, lo cual el encargo autoriza para una re-auditoría delta. No se hereda el PASS de ninguna otra revisión. La pasada original FAIL, sus 15 claims y su informe se conservan; esta pasada se añade al historial de `02-result.json`.

## Alcance y método

Primero se verificó `git rev-parse HEAD`; coincidió exactamente con el SHA solicitado. La rama era la esperada. Se revisaron los diffs `7a001163..a5b9dbf2` (producto), `7a001163..3286ea59` (paquete completo), y los commits intermedios para separar producto, artefactos de auditoría y CI. El cuerpo del PR se trató únicamente como índice de afirmaciones.

Se revisó cada cierre original contra el texto del artículo en el checkout y las fuentes primarias indicadas abajo. Los cálculos propios se reprodujeron con `Decimal` desde `reaudit-recompute-20261028.py`; no se aceptaron etiquetas o porcentajes sin comprobar sus bases. Se solicitó la API BCN LeyChile con User-Agent de navegador para las normas 7147, 184979 y 207436: las tres respuestas fueron HTTP 200. Se conservaron huellas SHA-256 y extractos acotados, no el cuerpo completo de las normas. Los extractos nuevos están en [BCN API](evidence/reaudit-bcn-api-extracts-20261028.txt) y las respuestas de cálculo en [recalculo](evidence/reaudit-recompute-output-20261028.txt).

Fuentes primarias actuales consultadas:

- [Superintendencia de Pensiones — SIS](https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9917.html), [Sistema de AFP](https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9897.html) y [traspaso a otra AFP](https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9915.html).
- [SII — tabla IUSC 2026](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm), [base imponible del IUSC](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3545.htm) y [UTM 2026](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm).
- [AFC Chile — cotizaciones](https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/) y [Superintendencia de Salud — cotización legal](https://www.superdesalud.gob.cl/tax-materias-isapres/cotizaciones-de-salud-3465/).
- API BCN LeyChile: [DL 3.500, norma 7147](https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=7147), [Ley 19.728, norma 184979](https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=184979) y [Código del Trabajo, norma 207436](https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=207436).

Una petición HTTP directa a SP SIS expiró a los 20 segundos; el lector de navegador sí abrió la página oficial vigente y devolvió el texto. No se necesitó ni se usó Wayback. Detalle y extractos en [fuentes web](evidence/reaudit-primary-web-extracts-20261028.txt).

## Claims y defectos

| ID | Resultado | Verificación independiente |
|---|---|---|
| P-D2-ROW-SUM | **Resuelto** | El artículo distingue bruto total `$1.500.000`, colación no imponible `$150.000` e imponible `$1.350.000`. Cada porcentaje de descuento usa `$1.350.000`; no hay fila de ingresos no imponibles ni segundo `+$150.000`. Cotizaciones: `$135.000 + $19.440 + $94.500 + $8.100 = $257.040`. RLI: `$1.350.000 − $257.040 = $1.092.960`. Para abril 2026, el SII da factor 4% y rebaja `$37.740,06`: impuesto exacto `$5.978,34`, mostrado `$5.978`. Líquido desde bruto: `$1.500.000 − $257.040 − $5.978 = $1.236.982`; las deducciones visibles suman al mismo resultado sin duplicar colación. |
| P-D4-STALE-SIS-CLUSTER | **Resuelto** | La SP confirma SIS 1,78% desde agosto de 2026 para empleadores, independientes y voluntarios; `1,78% × $560.000 = $9.968`. La tabla comparativa dice `1,78% (desde agosto 2026)`, la adjudicataria es AFP Uno, y `validAsOf`, `updatedDate` y fecha visible son `2026-10-28`. Barrido recursivo de `src/data/blog` y `src/data/laws`: cero coincidencias `1,62%`. El claim original separado `D4-1.62-HISTORY` permanece `UNVERIFIED` solo respecto del intervalo histórico exacto de la tasa anterior; no contradice el valor actual verificado. |
| P-D6-STALE-10_5 | **Resuelto** | La SP separa ahorro obligatorio de 10% y comisión AFP de 0,46%–1,45%. El artículo muestra el 10% por separado de la comisión, presenta RLI antes del ISC y distingue AFC para indefinido, plazo fijo y casa particular. Barrido de `src/data/blog` y `src/data/laws`: cero coincidencias `10,5%` o `10.5%`. |
| P-D8-ELIGIBILITY-WORDING | **Resuelto** | La SP limita los 24 meses a primera entrada al sistema de capitalización individual obligatoria. El artículo indica la ventana AFP Uno `2025-10-01` a `2027-09-30`, permanencia de 24 meses y excepciones por alza de comisión o AFP más barata; después no hay límite anual. DL 3.500, art. 160, confirma 30 días corridos para optar por no integrar el grupo licitado. “Primer empleo formal” aparece como contexto habitual, no como criterio de elegibilidad. |
| P-D13-LINKED-TAX-BASE | **Resuelto** | Con imponible `$1.200.000`: AFP 10% `$120.000`, comisión Capital 1,44% `$17.280`, salud 7% `$84.000`, AFC 0,6% `$7.200`, total `$228.480`; RLI `$971.520`. UTM snapshot `$72.151`; 13,5 UTM `$974.038,50`, por tanto la RLI de Capital queda exenta. Con comisión mínima 0,46%: comisión `$5.520`, total descuentos `$216.720`, RLI `$983.280`, ISC exacto `0,04 × $983.280 − 0,54 × $72.151 = $369,66`, líquido `$982.910,34`. El artículo aplica ISC sobre RLI, no sobre bruto. El snapshot resuelve `[[utm * 13.5 | clp]]` a `$974.038,50` y `[[983280 * 0.04 - utm * 0.54 | clp]]` a `$369,66`; el HTML recién construido muestra los redondeos a peso `$974.039`, `$370` y `$982.910`. |
| P-D13-AFC-AND-CREDIT-CAVEATS | **Resuelto** | La fila AFC excluye el 0,6% del trabajador para plazo fijo y casa particular; BCN Ley 19.728, art. 5, acota el 0,6% a contrato indefinido. La deducción del 30% de vivienda/educación incluye pago directo al acreedor/proveedor. La fila mantiene tope de 135,2 UF y 11 años por relación laboral, cotejados con AFC y BCN, Ley 19.728 art. 9. |
| Gate | **OK** | `check:payroll-consistency` está en `package.json` como parte de `check:ci` y en `.github/workflows/ci.yml` dentro de `lint-and-test`. Baseline: exit 0, 128 artículos/archivos y 7 AFP. En una copia temporal, mutar Capital `1,44/11,44` a `0,58/10,58` produce exit 1 y exactamente dos divergencias: comisión y total AFP. La copia se eliminó al terminar. La cabecera declara alcance parcial: solo comisiones AFP; excluye SIS, ventana de afiliación/traspaso, bases e impuesto. No se interpreta como cobertura total. |
| Invariantes / paquete | **Divergencia abierta** | No cambian `slug`, canonical ni `topicRole`; `descuentos-de-sueldo.md` y el paquete de publicación no aparecen en el diff; no se marca `[X]`; las portadas mantienen hashes/revisiones y no hay AVIF en el diff. `check:no-postid-urls`, `check:routes` y `check:rss` pasan; RSS se ejecutó tras el build fresco del SHA objetivo y sus salidas nuevas están en `evidence/`. Hay una ruta agregada respecto del snapshot base, `/posts/cotizacion-voluntaria-afp-independiente/`, y el comparador de rutas/RSS la acepta. La condición expresa del encargo de que `output/validation/rss_snapshot_after.json` ya no exista **no se cumple**: sigue presente e ignorado por Git. No abrí su contenido, no lo usé como evidencia y lo preservé. |

Los resultados por claim, fuentes y referencias se agregaron a `02-result.json`; los seis defectos `P-*` originales figuran `resolved`. Se conserva abierto `A-R8-OUTSIDE-DIRECTORY` de la pasada original y se añadió `A-R8-RSS-SNAPSHOT-PRESENT` para registrar la presencia actual observada. No se borró ni reescribió la pasada FAIL.

## Gates ejecutados

Evidencia completa en [log de gates](evidence/reaudit-target-gates-20261028.log), con `failures=0`; el [log crudo de la última ejecución de check:ci](evidence/reaudit-check-ci-final-20261028.log) registra la validación posterior de estos artefactos:

- `node scripts/check-payroll-consistency.mjs`
- `pnpm run check:audit-artifacts` (repetido después de actualizar el resultado; aceptado)
- `pnpm run check:correcciones`, `check:frontmatter`, `check:legal-citations`
- `EDITORIAL_ENFORCE=1 EDITORIAL_SCOPE=changed EDITORIAL_DIFF_BASE_REF=main pnpm run check:editorial`
- `pnpm run build`, seguido por `pnpm run check:rss`, `check:routes`, `check:no-postid-urls` y `check:urls:ci`
- `pnpm run check:ci`

El build fue exitoso. RSS actual: 53 elementos, uno más que el baseline; rutas: 54, una más que el baseline. Ambos comparadores pasan sin eliminaciones; `check:urls:ci` escaneó 9.545 URLs internas, 0 rotas y 0 fallas externas. `check:ci` terminó exit 0. Los gates warn-only registraron dos advertencias de `check:small-details` y dos avisos editoriales no relacionados con las superficies corregidas.

La comparación `git diff --check 7a001163..3286ea59` reportó whitespace en archivos de evidencia histórica incluidos en el paquete original; no se modificaron esos artefactos. No afecta el resultado de los gates anteriores.

## Veredicto y límite

**CONDITIONAL.** No queda ningún defecto de producto de los seis auditados abierto. Los cálculos, fuentes actuales, gate y pruebas de ruta/RSS sobre un build fresco pasan. Se mantiene el veredicto condicionado por la invariante del paquete: el snapshot fuera de `evidence/` continúa en el workspace aunque se había afirmado que ya no estaba. No se inspeccionó ni se usó como evidencia. No se modificaron fuentes de producto, `package.json`, scripts, tests, metadatos ni `correcciones.json`; no se marcó ninguna puerta `[X]`, no se completó `humanSignoff` y no se fusionó el PR. `humanSignoff` permanece `null`.
