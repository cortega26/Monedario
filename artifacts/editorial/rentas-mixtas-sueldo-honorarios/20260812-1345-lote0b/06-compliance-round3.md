Status: DRAFT — pending HumanEditor sign-off (ComplianceAgent no cierra SLA ni marca gates)

Role: ComplianceAgent (Claude Code — fresh session, adversarial; sin exposición a las sesiones previas de DraftAgent, MathAuditAgent ronda 2, ni a las rondas 1-2 de ComplianceAgent más allá de leer sus artefactos ya publicados como insumo declarado por la tarea; ronda 3, motivada por hallazgo de proceso de un bot revisor en PR #423)

# Compliance Review — Ronda 3 — rentas-mixtas-sueldo-honorarios (run `20260812-1345-lote0b`)

## 0) Alcance de esta revisión

Un revisor automático (bot Codex) en el PR #423 señaló un defecto de proceso: `05-math-audit.md` (ronda 1) terminó en `FAIL` por el error APV, y ninguna sesión de `MathAuditAgent` fresca había emitido un veredicto nuevo que lo superara — la ronda 2 de `ComplianceAgent` había verificado la corrección APV por su cuenta, pero `ComplianceAgent` no tiene autoridad para convertir un `FAIL` de math audit en un veredicto cerrado (`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`). Esa brecha ya se corrigió: `05-math-audit-round2.md` (`MathAuditAgent`, sesión fresca, 2026-08-13) re-auditó de forma independiente **todo** el artículo publicado y produjo veredicto `PASS` (12/12 claims `VERIFIED`, 0 `ERROR`, 0 `TODO:SOURCE`).

Esta ronda 3 de compliance:

1. **No da por bueno el `PASS` de `05-math-audit-round2.md` solo por leerlo.** Verifica de forma independiente, con refetch propio en esta sesión, la cifra IGC ($11.265.804) y el bloque APV completo (mecanismo Régimen A/B, topes 6 UTM / 600 UF).
2. Confirma que R2 (vigencia) y el deferral TGR (facilidades de pago) siguen intactos desde la ronda 2.
3. Evalúa si, con el math audit ahora en `PASS`, el artículo alcanza `PASS` de compliance según NORMA §7, o si algo (aunque sea menor) lo mantiene en `CONDITIONAL`.

**Resultado adelantado:** el `PASS` del math audit ronda 2 se sostiene en mi verificación independiente para los 12 claims que cubre. Esta ronda investigó adicionalmente una hipótesis propia sobre el tope de 600 UF de Régimen B (posible cupo conjunto con Régimen A) y la **descartó** tras contrastarla con la fuente primaria oficial (instrucción SII línea 23, texto completo extraído con `pdftotext`) — ver §2.3. No se encontró ningún defecto nuevo, bloqueante o no bloqueante, en el bloque APV ni en la cifra IGC. El artículo permanece en `CONDITIONAL`, no por un hallazgo nuevo de esta ronda, sino por la deuda estructural ya conocida y sin cambios desde la ronda 2 (H2 faltantes).

---

## 1) Verificación independiente del math audit ronda 2 — cifra IGC

Refetch propio en esta sesión (`WebFetch`, 2026-08-13) de `https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html`:

- Confirma literalmente: "1 UTA del mes dic. de 2025 = $834.504" y "13,5 UTA del mes dic. de 2025" = **$11.265.804** para la exención del Impuesto Global Complementario (art. 52 y 52 bis LIR).
- Recálculo aritmético propio: 834.504 × 13,5 = 11.265.804 exacto, sin redondeo.
- Coincide con las dos apariciones en el artículo publicado (línea 55, FAQ; línea 73, cuerpo) y con la fila 1 de `05-math-audit-round2.md`.

**Resultado: `VERIFIED` confirmado de forma independiente.** Sin discrepancias.

---

## 2) Verificación independiente del math audit ronda 2 — bloque APV

### 2.1 Mecanismo Régimen A vs. Régimen B (letra a / letra b, art. 20 L DL 3.500)

Refetch propio (`WebFetch`, esta sesión) de `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm`:

- Confirma textualmente que bajo la letra a) (Régimen A) "el trabajador no obtiene rebaja en la base imponible al depositar, pero los retiros no se gravan con el Impuesto Único de segunda categoría", y bajo la letra b) (Régimen B) "el trabajador sí obtiene rebaja en la base imponible al depositar, pero los retiros se gravan según lo previsto en el artículo 42 bis".
- Esto coincide exactamente con la etiquetación del texto publicado: Régimen A = no reduce base imponible (línea 197); Régimen B = sí reduce base imponible (línea 198).

### 2.2 Bono estatal 15% / tope 6 UTM / depósito TGR (Régimen A)

Refetch propio (`WebFetch`, esta sesión) de `https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html`:

- Confirma textualmente: bonificación "el equivalente al quince por ciento de lo ahorrado por el trabajador", tope "seis unidades tributarias mensuales... vigente el 31 de diciembre del año", y que "la Tesorería General de la República realiza el depósito en la cuenta individual de ahorro previsional voluntario colectivo".
- Coincide exactamente con el texto publicado (línea 197: "bonificación estatal equivalente al 15%... tope de 6 UTM anuales. La Tesorería General de la República la deposita directamente...").

**Resultado de 2.1 y 2.2: `VERIFIED` confirmado de forma independiente, sin discrepancias.** El defecto que causó el `FAIL` original (etiquetas invertidas + bono descrito como crédito F22) sigue corregido.

### 2.3 Tope 600 UF anuales (Régimen B) — hipótesis investigada y descartada

El texto publicado (línea 198) dice: *"Régimen B: El aporte reduce tu base imponible del IGC..., con tope de 600 UF anuales."* `05-math-audit-round2.md` (fila 9) valida este número como `VERIFIED` y agrega que el tope "se aplica de forma conjunta a todos los APV de la persona", concluyendo que la única omisión relevante es el sub-tope de 50 UF mensuales por planilla, calificado como "omisión de detalle adicional, no un error".

Inicialmente sospeché algo más fuerte: a partir de una lectura del art. 42 bis vía `leyes-cl.com` (agregador de terceros, resumido por un modelo intermedio de `WebFetch`), interpreté que la cláusula "menos el monto total del ahorro voluntario... acogidos al número 1 anterior" indicaba un cupo de 600 UF **compartido entre Régimen A (bono estatal) y Régimen B (rebaja de base imponible)**, no advertido en el artículo. Antes de asentar esto como defecto, lo contrasté con la fuente primaria oficial: la instrucción del SII para la línea 23 del F-22 (`sii.cl/servicios_online/renta/2025/archivos/l23_instruccion.pdf`), cuyo binario ya había quedado descargado de un intento previo de `WebFetch` en esta misma sesión; la extraje con `pdftotext` (texto completo, no resumen de modelo intermedio).

El texto oficial **descarta la hipótesis**. El art. 42 bis inciso 1° regula una sola rebaja de base imponible del IUSC (lo que el artículo llama "Régimen B"), con dos modalidades de aplicación:

- **Letra a) — mensual:** descuento vía planilla, hasta 50 UF/mes.
- **Letra b) — anual (reliquidación):** hasta 600 UF al 31 de diciembre, **menos** lo ya descontado mensualmente bajo la letra a) del mismo inciso.

Cita literal del instructivo SII: *"la cantidad máxima a descontar será equivalente a la diferencia existente entre el valor de 600 UF... y el monto total de los ahorros previsionales voluntarios por los mismos conceptos que el contribuyente haya descontado en cada mes bajo la modalidad referida en dicha letra a)"*. El "número 1 anterior"/"letra a)" al que se resta se refiere a la modalidad **mensual de la misma rebaja de base imponible** (Régimen B), no al bono estatal de Régimen A — ese bono se rige por el art. 20 L y 20 O del DL 3.500 (norma distinta) y no aparece mencionado en el art. 42 bis en absoluto. No existe, por tanto, un cupo compartido entre Régimen A y Régimen B: la resta es una regla de no-doble-conteo entre la modalidad mensual y la modalidad anual **dentro** de Régimen B.

**Conclusión: la hipótesis es incorrecta y se descarta.** El tope de 600 UF sí es, en la práctica, el tope propio de Régimen B (con el matiz ya señalado correctamente por `05-math-audit-round2.md`: se descuenta lo ya usado mensualmente vía planilla, no un cupo compartido con Régimen A). El texto publicado no tiene error aquí. Se documenta esta investigación explícitamente — incluyendo el paso en falso inicial — para dejar registro de que la hipótesis fue verificada contra fuente primaria oficial completa antes de descartarla, evitando registrar un defecto falso que habría llevado a una futura sesión de `DraftAgent` a introducir una corrección incorrecta en una pieza YMYL publicada. Nota de proceso: la fuente inicial que motivó la hipótesis (`leyes-cl.com`, agregador) no debía usarse como base para un hallazgo YMYL sin corroborar contra SII/BCN — mismo estándar que NORMA §1.1 MUST #4 exige del propio artículo.

---

## 3) Confirmación de que R2 y el deferral TGR siguen intactos

Lectura directa de `src/data/blog/rentas-mixtas-sueldo-honorarios.md` en su estado actual (commit `27db4af3`, working tree limpio para este archivo — `git status --short` no muestra cambios pendientes sobre esta pieza; el único archivo modificado en el working tree es `devolucion-impuestos-fechas-compensaciones.md`, de otra pieza del mismo lote, fuera de alcance):

- **R2 (vigencia AT2026):** líneas 67-77 mantienen el reencuadre "regla permanente" vs. "ciclo AT2026 ya cerrado" (30-04-2026 con pago, 08-05-2026 sin pago), consistente con `articleLead.answer`, `articleLead.validAsOf: 2026-08-12` y `updatedDate: 2026-08-12T00:00:00Z` del frontmatter. Sin contradicciones internas detectadas.
- **Deferral TGR (línea 220):** texto idéntico al verificado en `06-compliance-round2.md` §1-3 — atribución correcta a TGR (no SII), regla pública (24 cuotas, pie 10%-30%, mínimo 1 UTM), deferral residual limitado al porcentaje exacto del pie (legítimo por NORMA §2.4 condición 2). No fue tocado desde la ronda 2.
- **Fix APV (líneas 144, 197-200):** confirmado íntegro y correcto en §2 de este documento.
- Frontmatter, slug, `title`, `seoTitle`, H1, `canonical`: sin cambios.
- `git log --oneline -5 -- src/data/blog/rentas-mixtas-sueldo-honorarios.md` confirma que el último commit que tocó este archivo es `27db4af3` ("cierre de papeleo del lote 0"), que corresponde exactamente al fix del deferral ya verificado en ronda 2. No hay commits posteriores no revisados.

**Resultado: R2 y el deferral TGR están intactos.** Adicionalmente, esto cierra la observación **OBS-4** de `06-compliance-round2.md` (cambio sin commitear al momento de esa ronda): el archivo ya está commiteado en el estado exacto que ronda 2 revisó.

---

## 4) Prompt injection

Se revisó el contenido HTML crudo de las tres fuentes fetcheadas en esta sesión (SII x2, Superintendencia de Pensiones, texto de ley vía `leyes-cl.com`) en busca de instrucciones embebidas dirigidas a un agente ("ignore previous instructions", "you are now", "olvida las instrucciones anteriores", etc.). **Ninguna encontrada.** No se etiqueta `PROMPT_INJECTION_CANDIDATE`.

---

## 5) Scorecard NORMA §7

| Eje | Peso | Nota (0-10) | Justificación |
|---|---|---|---|
| Respuesta ancla | 35% | 9,5 | Sin cambios respecto a la ronda 2. No afectada por el math audit ni por la hipótesis investigada y descartada de esta ronda. |
| Precisión + fuentes | 25% | 9,5 | Math audit ronda 2 (`PASS`, 12/12 `VERIFIED`) confirmado de forma independiente en esta sesión para cifra IGC y mecanismo APV completo (§1-2). Sin cambios respecto a ronda 2: la precisión de los valores citados en sí no está en duda. |
| Vigencia + calendario | 15% | 9,5 | Sin cambios. R2 confirmado intacto (§3). |
| Excepciones + cobertura | 15% | 9,5 | Sin cambios respecto a ronda 2. Se investigó una hipótesis adicional (posible cupo conjunto de 600 UF entre Régimen A y Régimen B) y se descartó tras contrastarla con la fuente primaria oficial completa (instrucción SII línea 23, vía `pdftotext`) — ver §2.3. No es un defecto real; el texto publicado está correcto tal como está. |
| Claridad + estructura | 10% | 8,0 | Sin cambios. Confirmado por lectura directa del artículo publicado: siguen faltando los H2 "Errores comunes", "Preguntas frecuentes" visible y "Fuentes y vigencia normativa" dedicada (OBS-2/R7b, heredado, Bucket C, fuera del alcance de esta ronda). |

**Cálculo:** 9,5×0,35 (3,325) + 9,5×0,25 (2,375) + 9,5×0,15 (1,425) + 9,5×0,15 (1,425) + 8,0×0,10 (0,800) = **9,350/10**

Nota: el puntaje **no cambia** respecto al 9,350/10 de la ronda 2. El math audit `PASS` cierra una brecha de **proceso** (existencia de un veredicto fresco de `MathAuditAgent` que supera el `FAIL` original), verificada de forma independiente en esta sesión, pero no eleva el puntaje de compliance porque la precisión ya estaba evaluada en 9,5 desde la ronda 2 mediante verificación propia de `ComplianceAgent`. La única hipótesis adversarial nueva que esta ronda planteó (§2.3) no se sostuvo al contrastarla con fuente primaria oficial completa, por lo que no hay ajuste de puntaje que aplicar por ese lado. El único factor que sigue impidiendo `PASS` es la deuda estructural ya conocida (Claridad + estructura, 8,0), sin cambios desde la ronda 1.

Por regla NORMA §7 ("cualquier artículo con < 9,5 no se publica; vuelve a iteración"), el artículo **sigue por debajo del umbral de `PASS`**.

---

## 6) DEFECTS

**Ninguno bloqueante ni no bloqueante nuevo confirmado.** Se investigó una hipótesis (posible cupo conjunto de 600 UF entre Régimen A y Régimen B) que inicialmente parecía un defecto real, pero se descartó tras verificación contra la fuente primaria oficial completa (instrucción SII línea 23, texto extraído con `pdftotext`, ver §2.3). Se documenta la investigación explícitamente, incluido el paso en falso inicial basado en un agregador de terceros, para que quede registro de la debida diligencia sin dejar un hallazgo falso en el corpus.

**Heredados, sin cambio de estado:**

- **OBS-2 (= R7b de la ficha original):** H2 faltantes ("Errores comunes", "Preguntas frecuentes" visible, "Fuentes y vigencia normativa"). Sigue igual desde ronda 1. Bucket C, SHOULD no bloqueante.

**Cerrados en esta ronda:**

- **Brecha de proceso (hallazgo del bot Codex, PR #423): CERRADA.** `05-math-audit-round2.md` existe, es de una sesión fresca de `MathAuditAgent`, y su veredicto `PASS` fue verificado de forma independiente en esta sesión para los dos bloques centrales (IGC, APV). El `FAIL` de `05-math-audit.md` (ronda 1) queda formalmente superado por un artefacto de la misma etapa del pipeline, no por una declaración de `ComplianceAgent` sin autoridad para ello.
- **OBS-4 (= working tree sin commitear, ronda 2): CERRADA.** El archivo está commiteado (`27db4af3`) en el estado exacto revisado.

---

## 7) Separación de funciones

Confirmada. Los roles/sesiones que intervinieron sobre esta pieza, en orden:

1. **TriageAgent** (auditoría de corpus publicado, 2026-08-12) — halló R5 y R2.
2. **DraftAgent R5/R2** (sesión inicial, 2026-08-12) — corrigió cifra IGC y reencuadre de vigencia.
3. **MathAuditAgent** (sesión fresca, 2026-08-12) — produjo `05-math-audit.md`, veredicto **FAIL** (error APV).
4. **DraftAgent fix-APV** (sesión nueva, 2026-08-13) — corrigió bloque APV.
5. **ComplianceAgent ronda 1** (sesión fresca, 2026-08-13) — produjo `06-compliance.md`, verificación adversarial de R5/R2/fix-APV, veredicto **CONDITIONAL (9,275/10)**; dejó registrado el deferral TGR como Bucket B.
6. **DraftAgent fix-deferral** (sesión nueva, 2026-08-13) — reformuló el deferral de "facilidades de pago" con fuente TGR.
7. **ComplianceAgent ronda 2** (sesión fresca, 2026-08-13) — produjo `06-compliance-round2.md`, verificación adversarial del fix del deferral, veredicto **CONDITIONAL (9,350/10)**.
8. **MathAuditAgent ronda 2** (sesión fresca, 2026-08-13, sustituto Claude aprobado por editor humano) — produjo `05-math-audit-round2.md`, re-auditoría completa e independiente, veredicto **PASS** (cierra el `FAIL` de la sesión 3, corrige la brecha de proceso señalada por el bot revisor en PR #423).
9. **ComplianceAgent ronda 3** (esta sesión, fresca, 2026-08-13) — verificación adversarial independiente del `PASS` de la sesión 8 (cifra IGC + bloque APV completo, con refetch propio, incluida la fuente legal primaria art. 42 bis LIR vía instrucción SII línea 23), confirmación de que R2/deferral TGR siguen intactos, una hipótesis adversarial investigada y descartada tras verificación con fuente primaria (§2.3).

Pendiente: **HumanEditor** — firma no ejecutada por ningún agente.

No se detectó violación de `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`: ninguna sesión redactó y auditó/cumplió la misma pieza YMYL en el mismo turno. Esta sesión (9) no tuvo exposición al transcript de la sesión 8 (`MathAuditAgent` ronda 2) ni a ninguna sesión de `DraftAgent`; solo leyó sus artefactos ya publicados, tal como corresponde a una revisión de compliance en cascada.

---

## 8) Veredicto final

**CONDITIONAL (9,350/10)**

**Justificación:**

1. **El `PASS` de `05-math-audit-round2.md` se sostiene.** Verificación independiente propia, con refetch en esta sesión, confirma sin discrepancias los dos bloques centrales que motivaron esta ronda: la cifra del tramo exento IGC ($11.265.804, refetch exacto de SII) y el mecanismo APV Régimen A/B (letras a/b del art. 20 L DL 3.500, bono 15%/tope 6 UTM/depósito TGR para Régimen A, rebaja de base imponible para Régimen B — refetch exacto de SII y Superintendencia de Pensiones). El defecto que causó el `FAIL` original (etiquetas invertidas, bono descrito como crédito F22) está confirmado como corregido, de forma independiente, por dos sesiones distintas de verificación (`MathAuditAgent` ronda 2 y esta sesión).
2. **R2 y el deferral TGR siguen intactos**, confirmado por lectura directa del archivo commiteado y por `git log`/`git status`.
3. **Se investigó una hipótesis adversarial adicional y se descartó (§2.3):** sospeché inicialmente que el tope de 600 UF de Régimen B era un cupo compartido con Régimen A, a partir de una lectura de un agregador de terceros. Al contrastarla con la fuente primaria oficial completa (instrucción SII línea 23, extraída con `pdftotext`), la hipótesis resultó incorrecta: la resta "menos lo acogido al número 1 anterior" es una regla de no-doble-conteo entre las dos modalidades (mensual/anual) de la misma rebaja de base imponible (Régimen B), no una interacción entre Régimen A y Régimen B. El texto publicado no tiene error en este punto. Se documenta la investigación para dejar registro de la debida diligencia sin introducir un hallazgo falso.
4. El artículo **no alcanza `PASS`** según NORMA §7 (9,350/10 < 9,5), exclusivamente por la deuda estructural ya conocida y sin cambios desde la ronda 1 (H2 faltantes, Claridad + estructura = 8,0). No es un error factual ni un `TODO:SOURCE` sin resolver; es Bucket C (mejora de estructura, no bloqueo urgente), pero NORMA §7 no hace excepciones de umbral por severidad de la brecha.

**Cierre del hallazgo de proceso del bot Codex (PR #423):** confirmado cerrado. Existe un `05-math-audit-round2.md` de sesión fresca de `MathAuditAgent` con veredicto `PASS`, y ese veredicto fue verificado de forma independiente por esta sesión de `ComplianceAgent`, no solo asumido.

**No se marca ningún gate `[X]` en `07-publish-packet.md`. No se declara el artículo publicable. No se cierra ningún SLA. No se edita `src/data/blog/rentas-mixtas-sueldo-honorarios.md`. Pendiente: firma humana (y, opcionalmente, una futura ronda de `DraftAgent` para OBS-2, en sesión fresca distinta a esta).**
