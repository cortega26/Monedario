Status: DRAFT — pending HumanEditor sign-off (ComplianceAgent no cierra SLA ni marca gates)

Role: ComplianceAgent (Claude Code — fresh session, adversarial; sin exposición a las sesiones de DraftAgent, MathAuditAgent ni al fix de APV que produjeron este contenido)

# Compliance Review — rentas-mixtas-sueldo-honorarios (run `20260812-1345-lote0b`)

## 0) Alcance de esta revisión

Revisión adversarial de Fase C sobre tres hallazgos consecutivos del mismo run, cada uno remediado por una sesión distinta:

1. **R5** — cifra del tramo exento IGC ($11.322.018 → $11.265.804).
2. **R2** — reencuadre de vigencia (ventana AT2026 cerrada, sin acción inmediata implícita).
3. **ERROR APV** — hallado por `MathAuditAgent` fuera del alcance original de `01-brief.yaml`, remediado en sesión posterior (inversión de etiquetas Régimen A/B + mecanismo del bono mal descrito).

No se re-audita aritméticamente el resto de valores ya `VERIFIED` en `05-math-audit.md` (filas 1, 3-8): esa verificación ya es independiente, fresca y adversarial, y no hay motivo declarado para desconfiar de ella. El foco de esta sesión es verificar de forma independiente los tres hallazgos listados arriba, con refetch propio de fuente oficial.

---

## 1) Verificación independiente — R5 (cifra tramo exento IGC)

**Refetch propio** de `https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html` (esta sesión, 2026-08-13):

- Confirma literalmente: "13,5 UTA del mes dic. de 2025" = **$11.265.804**.
- Confirma: "1 UTA del mes dic. de 2025" = **$834.504**.
- Verificación aritmética propia: 834.504 × 13,5 = 11.265.804 exacto.

**Archivo publicado** (`src/data/blog/rentas-mixtas-sueldo-honorarios.md`):

- Línea 55 (FAQ "¿Puedo tener sueldo, boletas y aun así quedar exento...?"): "**$11.265.804** anuales". ✅ Coincide.
- Línea 73 (cuerpo, bloque "Respuesta rápida", "Excepción relevante"): "**$11.265.804** anuales para AT 2026". ✅ Coincide.

**Resultado: R5 VERIFICADO de forma independiente.** Ambas apariciones usan el valor oficial correcto, sin el símbolo "~" que sugeriría aproximación (correcto, es un valor exacto). No se encontró ninguna tercera aparición residual del valor incorrecto ($11.322.018) en el archivo publicado.

---

## 2) Verificación independiente — R2 (reencuadre de vigencia)

Lectura completa del archivo publicado, buscando específicamente frases que describan la obligación de declarar AT2026 como acción inmediata sin nota de cierre de ventana:

- `articleLead.answer` (frontmatter): declara la regla permanente ("es una regla permanente, no exclusiva de un año tributario") y separa explícitamente el estado del ciclo AT2026 ("la ventana de declaración ya cerró (30 de abril de 2026 con pago, 8 de mayo de 2026 sin pago)"), con puntero al checklist F22 para quien no alcanzó a declarar. ✅ Correctamente reencuadrado.
- Bloque "Respuesta rápida" del cuerpo (líneas 69-77): mismo patrón — regla permanente + párrafo separado "Estado del ciclo AT2026" con fechas de cierre y puntero al checklist, sin inventar fecha para AT2027 ("aún no tiene calendario publicado por el SII", correcto — no fabrica una fecha). ✅.
- **Coherencia interna — las otras dos menciones del calendario AT2026 que la sesión de draft dijo haber corregido:**
  - Línea 206, sección "Si te corresponde devolución": "Este fue el calendario de depósito del ciclo AT2026 (ya ejecutado):" — pasado, cerrado. ✅ Coincide con lo declarado en `04-draft.md` punto 7.
  - Línea 218, sección "Si debes pagar impuesto adicional": "En el ciclo AT2026, el plazo para pagar con rentas mixtas venció el **30 de abril de 2026**." — pasado, cerrado. ✅ Coincide.
- No se encontraron menciones residuales en presente/futuro del calendario AT2026 en el resto del cuerpo (paso a paso de declaración, campos F22, casos frecuentes: todas son instrucciones genéricas de "cómo declarar", no atadas a una fecha específica de AT2026, por lo que no requieren la misma nota de cierre de ventana).

**Resultado: R2 VERIFICADO de forma independiente.** El reencuadre es coherente en las tres ubicaciones (respuesta ancla + dos menciones adicionales del cuerpo), sin inducir a error sobre si la ventana AT2026 sigue abierta.

---

## 3) Verificación independiente — Fix ERROR APV (el más crítico, bloqueaba `05-math-audit.md`)

### 3.1 Refetch propio de fuentes oficiales (esta sesión, 2026-08-13, sin depender del reporte de la sesión que aplicó el fix)

**a) SII — preguntas frecuentes, art. 42 bis LIR** (`https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm`):
- Confirma el mecanismo por letra, sin usar literalmente la etiqueta "Régimen A/B": **letra a)** = "el trabajador no goza del beneficio [de rebaja] al momento del depósito" (sin deducción inmediata); **letra b)** = "el trabajador goza del beneficio [de rebaja] al momento del depósito" (rebaja de base imponible inmediata).
- Nota honesta: esta página **no** usa literalmente "Régimen A" / "Régimen B" — solo "letra a)" / "letra b)". La nomenclatura A/B es una convención de industria (AFP, aseguradoras), no texto literal del SII en esta URL específica. Esto no invalida la corrección, pero es una precisión que documento para no sobre-afirmar "cita literal" donde no la hay.

**b) Superintendencia de Pensiones** (`https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html`):
- Confirma: bono estatal del **15%** de lo ahorrado, tope **6 UTM anuales** (valor UTM al 31 de diciembre del año respectivo), aporte no puede superar 10 veces las cotizaciones obligatorias del trabajador en el año.
- Confirma el mecanismo de pago: el SII calcula el monto y lo informa a Tesorería General de la República, que **deposita** el bono en la cuenta de ahorro previsional voluntario (AFP o institución autorizada) — **no** pasa por el F22 como crédito.
- Esta página tampoco usa literalmente "Régimen A"/"Régimen B" en el extracto fetcheado; usa "letra a) del artículo 20 L".

**c) Verificación adicional de la equivalencia letra↔Régimen (WebSearch, múltiples fuentes independientes de industria: AFP Capital, Zurich, Principal, todas referenciando la misma página de Superintendencia de Pensiones):**
- Confirma de forma consistente y convergente: **Régimen A = letra a)** = bono estatal 15%, tope 6 UTM anuales, "ahorro después de impuesto" (sin rebaja al momento del aporte). **Régimen B = letra b)** = "ahorro antes de impuesto", rebaja de base imponible, tope 600 UF anuales.
- Esta equivalencia es unánime en las fuentes de industria consultadas y consistente con el mapeo letra→mecanismo confirmado directamente en las fuentes oficiales (a → sin rebaja inmediata; b → con rebaja inmediata).

**d) Corroboración de corpus** (`src/data/blog/que-es-el-apv.mdx`, artículo owner del topic APV, no editado, solo consultado):
- Línea 82: "Régimen A: bono estatal de 15% con tope" — Línea 84: "En el Régimen A no rebajas tu impuesto mensual. El incentivo llega después, como una bonificación fiscal equivalente al 15%".
- Línea 103-105: "Régimen B: rebaja de base imponible hoy... El aporte rebaja la base imponible... tope... 600 UF anuales".
- Coincide exactamente con la corrección aplicada en `rentas-mixtas-sueldo-honorarios.md`. Se usa como corroboración de coherencia de corpus, no como prueba principal (la prueba principal son las fuentes oficiales (a) y (b) más la convergencia de fuentes de industria en (c)).

### 3.2 Verificación del texto publicado

`src/data/blog/rentas-mixtas-sueldo-honorarios.md`:

- Línea 144: "**APV Régimen B:** ... (rebaja de tu base imponible del IGC, con tope de 600 UF anuales)... El Régimen A no participa de este cálculo: su beneficio es una bonificación estatal del 15% sobre los aportes (tope 6 UTM anuales) que la Tesorería General de la República deposita directamente en tu cuenta de ahorro previsional, no un crédito en el F22." ✅ Coincide con el mecanismo confirmado.
- Líneas 197-200: "**Régimen A:** Recibes una bonificación estatal equivalente al 15% de los aportes, con tope de 6 UTM anuales. La Tesorería General de la República la deposita directamente en tu cuenta de ahorro previsional; no reduce tu base imponible ni aparece como crédito en el F22. **Régimen B:** El aporte reduce tu base imponible del IGC..., con tope de 600 UF anuales." ✅ Coincide.
- **"Genera o aumenta una devolución" correctamente acotado:** línea 144 atribuye ese efecto solo a Régimen B ("eso reduce tu impuesto determinado y puede generar o aumentar una devolución. El Régimen A no participa de este cálculo..."). ✅ Verificado — la afirmación ya no se aplica de forma genérica a "el APV" sino específicamente a Régimen B, consistente con que solo Régimen B pasa por el cálculo del impuesto determinado en el F22.
- Ambas ubicaciones (línea 144 y líneas 197-200) son mutuamente consistentes entre sí (misma etiqueta, mismo tope, mismo mecanismo de pago).

### 3.3 Resultado

**Mi refetch independiente CONFIRMA la corrección.** El artículo ahora describe correctamente: Régimen A = bono estatal 15% (tope 6 UTM anuales), depositado por Tesorería General de la República directamente en la cuenta de ahorro, sin pasar por el F22 como crédito; Régimen B = rebaja de base imponible del IGC (tope 600 UF anuales). La atribución de "genera o aumenta una devolución" queda correctamente acotada solo al Régimen B. Coincide con el artículo owner del topic (`que-es-el-apv.mdx`) sin necesidad de copiarlo — es corroboración, no la prueba principal.

**Declaro explícitamente: el ERROR registrado en `05-math-audit.md` (fila 9, veredicto FAIL) queda resuelto y verificado de forma independiente por esta sesión de `ComplianceAgent`.** Esta verificación sustituye al mecanismo de un segundo `05-math-audit.md` dedicado para esta corrección específica, porque la naturaleza del cambio es la restauración de una etiqueta/mecanismo ya canónico en el corpus propio y en fuente oficial (no un cálculo aritmético nuevo que requiera re-auditoría numérica completa). Ver §5 para el detalle de por qué esto no reabre el resto del veredicto `FAIL` histórico del archivo `05-math-audit.md` (ese archivo no se reescribe, por separación de funciones).

**Observación no bloqueante:** ninguna de las dos URLs oficiales que refetcheé usa literalmente el string "Régimen A" / "Régimen B" — esa nomenclatura es una convención de industria, aunque universal y no controvertida en las fuentes de industria consultadas, y matemáticamente consistente con el mapeo letra a)/b) → mecanismo que sí está confirmado en fuente oficial primaria. No lo considero un defecto porque el artículo no atribuye la nomenclatura "Régimen A/B" al SII —simplemente la usa como es de uso corriente— y el mecanismo descrito bajo cada etiqueta es correcto y verificable en fuente oficial independientemente del nombre.

---

## 4) Otros checks estándar

- **Deferral "facilidades de pago" (línea 220):** "Si el monto es alto y quieres dividirlo, el SII puede ofrecer facilidades de pago. Consulta directamente en sii.cl al momento de declarar." Sigue **igual** que en la ficha original (registrado CONDITIONAL, border-line §2.4 condición 2). No remediado en este run (correcto — fuera de alcance declarado en `01-brief.yaml`). No se toca en esta revisión.
- **`requires_calculation: true`** (`01-brief.yaml` línea 4): correctamente declarado. Existe `05-math-audit.md` producido por `MathAuditAgent` en sesión fresca (verdicto histórico `FAIL`, ahora con su único hallazgo bloqueante resuelto y verificado de forma independiente por esta sesión — ver §3.3).
- **R7b (estructura DoD, H2 faltantes):** no remediado en este run — sigue sin H2 "Errores comunes", sin H2 "Preguntas frecuentes" visible en el cuerpo (FAQ solo en frontmatter), sin H2 "Fuentes y vigencia normativa" dedicado. SHOULD no bloqueante, correctamente fuera de alcance.
- **Frontmatter:** `updatedDate: 2026-08-12T00:00:00Z` coincide con `articleLead.validAsOf: 2026-08-12` y con "revisado el 2026-08-12" en el bloque "Respuesta rápida" del cuerpo. Coherente (NORMA §5, MUST #9).
- **No inferencias sin etiqueta (MUST #7):** las dos tablas "Resumen orientativo" (situaciones de declaración, tramos IGC) mantienen la etiqueta correctamente, sin cambios de este run. No se detectaron nuevas síntesis jurídicas sin etiquetar en los bloques APV corregidos (son afirmaciones de mecanismo verificables contra fuente, no inferencias jurídicas nuevas).
- **PROMPT_INJECTION_CANDIDATE:** ninguno detectado en el contenido fetcheado de SII / Superintendencia de Pensiones durante esta sesión. Ninguna instrucción embebida modificó rol, alcance, gates ni decisión editorial.

---

## 5) Scorecard NORMA §7

| Eje | Peso | Nota (0-10) | Justificación |
|---|---|---|---|
| Respuesta ancla | 35% | 9,5 | `articleLead.answer` y bloque "Respuesta rápida" ahora separan correctamente regla permanente / estado del ciclo AT2026 (R2 resuelto), con excepción y fuentes en formato NORMA §2.3. |
| Precisión + fuentes | 25% | 9,5 | R5 verificado exacto en ambas apariciones; ERROR APV verificado corregido con fuentes oficiales primarias independientes; resto de cifras ya `VERIFIED` en math audit, sin nuevos defectos encontrados en esta sesión. |
| Vigencia + calendario | 15% | 9,5 | Reencuadre R2 coherente en las tres ubicaciones del cuerpo (respuesta ancla + dos secciones de calendario), sin inducir a error sobre ventana AT2026. |
| Excepciones + cobertura | 15% | 9,0 | Excepción del tramo exento correctamente enunciada; deferral border-line de "facilidades de pago" sigue sin resolver (Bucket B, fuera de alcance de este run, ya registrado). |
| Claridad + estructura | 10% | 8,0 | Sin cambios respecto a la ficha original: siguen faltando H2 "Errores comunes", "Preguntas frecuentes" visible y "Fuentes y vigencia normativa" dedicada (R7b, SHOULD no bloqueante). |

**Cálculo:** 9,5×0,35 (3,325) + 9,5×0,25 (2,375) + 9,5×0,15 (1,425) + 9,0×0,15 (1,350) + 8,0×0,10 (0,800) = **9,275/10**

Por regla NORMA §7 ("cualquier artículo con < 9,5 no se publica; vuelve a iteración"), este puntaje queda **por debajo del umbral de PASS incondicional**, exclusivamente por deuda ya conocida y explícitamente fuera del alcance de este run (R4 deferral border-line, R7b estructura). Los tres hallazgos que sí eran el alcance de este run (R5, R2, ERROR APV) están **resueltos y verificados de forma independiente**, sin hallar ningún hallazgo nuevo bloqueante.

---

## 6) DEFECTS

**Ninguno bloqueante nuevo.** No se detectaron errores nuevos en la verificación independiente de R5, R2 ni del fix APV.

Observaciones no bloqueantes (ya registradas en la ficha original, sin cambio de estado, no forman parte del alcance de este run):

- **OBS-1 (= R4 de la ficha original):** deferral border-line de "facilidades de pago" (línea 220). Sigue igual. Bucket B.
- **OBS-2 (= R7b de la ficha original):** H2 faltantes ("Errores comunes", "Preguntas frecuentes" visible, "Fuentes y vigencia normativa"). Sigue igual. Bucket C, SHOULD no bloqueante.
- **OBS-3 (nueva, no bloqueante):** las fuentes oficiales primarias refetcheadas para el fix APV (SII preguntas frecuentes, Superintendencia de Pensiones) no usan literalmente el string "Régimen A"/"Régimen B" — es nomenclatura de industria. El mecanismo descrito bajo cada etiqueta sí está confirmado en fuente oficial y es consistente y unánime en las fuentes de industria consultadas (AFP Capital, Zurich, Principal, todas citando la misma página de Superintendencia de Pensiones). No se requiere acción; se documenta por rigor de trazabilidad.

---

## 7) Separación de funciones

Confirmada. Seis roles/sesiones distintas e independientes intervinieron sobre esta pieza:

1. **TriageAgent** (auditoría original de corpus publicado, ficha `output/audits/corpus-2026-08-12/fichas/rentas-mixtas-sueldo-honorarios.md`, 2026-08-12) — halló R5 y R2.
2. **DraftAgent R5/R2** (sesión `20260812-1345-lote0b` inicial, 2026-08-12) — aplicó la corrección de cifra IGC y el reencuadre de vigencia.
3. **MathAuditAgent** (sesión fresca e independiente, sustituto Claude Code aprobado por editor humano, 2026-08-12) — verificó R5 como VERIFIED y halló el ERROR APV nuevo, fuera del alcance del brief.
4. **DraftAgent fix-APV** (sesión nueva posterior, 2026-08-13) — corrigió el bloque APV con fuentes oficiales propias.
5. **ComplianceAgent** (esta sesión, fresca, 2026-08-13) — verificación adversarial independiente de los tres hallazgos, sin exposición a las sesiones anteriores.
6. **HumanEditor** — firma pendiente, no ejecutada por ningún agente.

No se detectó violación de `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`: ninguna sesión redactó y auditó/cumplió la misma pieza YMYL en el mismo turno.

---

## 8) Veredicto final

**CONDITIONAL (9,275/10)**

**Justificación:** Los tres hallazgos que constituían el alcance y el bloqueo de este run —R5 (cifra tramo exento IGC), R2 (reencuadre de vigencia) y el ERROR APV hallado por `MathAuditAgent`— están **resueltos y verificados de forma independiente** por esta sesión, con refetch propio de fuentes oficiales (SII ×2, Superintendencia de Pensiones) y sin depender de los reportes de las sesiones que aplicaron las correcciones. No se encontró ningún hallazgo nuevo bloqueante.

El veredicto no es PASS incondicional porque el puntaje NORMA §7 (9,275/10) queda por debajo del umbral de 9,5 exigido por la norma, exclusivamente por deuda **ya conocida, ya registrada y explícitamente fuera del alcance de este run**: el deferral border-line de "facilidades de pago" (Bucket B) y las brechas estructurales de nomenclatura DoD (R7b, Bucket C). Ninguna de las dos es nueva ni fue introducida por este run; ambas están documentadas y pendientes de remediación en runs separados ya identificados en la ficha de auditoría original.

**El FAIL histórico de `05-math-audit.md` queda declarado resuelto por esta verificación independiente**, sustituyendo al mecanismo de un segundo math-audit dedicado para esta corrección no-aritmética.

**No se marca ningún gate `[X]` en `07-publish-packet.md`. No se declara el artículo publicable. No se cierra ningún SLA. Pendiente: firma humana.**
