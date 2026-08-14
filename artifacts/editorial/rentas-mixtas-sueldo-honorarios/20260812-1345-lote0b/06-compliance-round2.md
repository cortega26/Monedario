Status: DRAFT — pending HumanEditor sign-off (ComplianceAgent no cierra SLA ni marca gates)

Role: ComplianceAgent (Claude Code — fresh session, adversarial; sin exposición a la sesión de DraftAgent que investigó y reformuló el deferral de "facilidades de pago" ni a las sesiones previas de R5/R2/fix-APV)

# Compliance Review — Ronda 2 — rentas-mixtas-sueldo-honorarios (run `20260812-1345-lote0b`)

## 0) Alcance de esta revisión

Ronda 2 de compliance sobre el único ítem Bucket B pendiente al cierre de `06-compliance.md` (veredicto `CONDITIONAL`, 9,275/10): el deferral border-line de "facilidades de pago" del SII en línea 220 de `src/data/blog/rentas-mixtas-sueldo-honorarios.md`, reformulado por una sesión de DraftAgent (2026-08-13) con una regla pública concreta administrada por la Tesorería General de la República (TGR).

Esta ronda **no re-audita** R5, R2 ni el fix APV a fondo — ya verificados de forma independiente en `06-compliance.md` §1-3 — pero confirma mediante `git diff` que no fueron tocados por este cambio. El foco es: (a) refetch propio de las tres fuentes que el fix reporta haber usado, (b) verificación de la corrección de atribución TGR vs. SII, (c) verificación de que el deferral residual sigue siendo legítimo por NORMA §2.4 condición 2 sin números inventados, (d) confirmación de que el resto del artículo sigue intacto.

**Nota de estado del working tree:** el cambio de línea 220 está **sin commitear** al momento de esta revisión (`git status` lo muestra como modificación local de `src/data/blog/rentas-mixtas-sueldo-honorarios.md`, junto con cambios no relacionados en otros artículos del mismo lote, fuera del alcance de esta ronda).

---

## 1) Verificación independiente de las 3 fuentes del fix del deferral

### 1.1 SII — Preguntas frecuentes, giros F22 y convenio de pago

URL: `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2870.htm`

Refetch propio (esta sesión, 2026-08-13, `WebFetch`): confirma literalmente que "los giros originados por el Formulario 22 de Impuesto a la Renta, pueden acogerse a convenio de pago en la Tesorería General de la República", con base legal en el **art. 192° del Código Tributario**. La página **no** atribuye la administración del trámite al SII — apunta explícitamente a TGR.

**Resultado: confirmado de forma independiente.** Coincide exactamente con lo reportado en `07-publish-packet.md` §"Ronda — resolución deferral facilidades de pago", punto 2.

### 1.2 TGR — Convenios de pago (condiciones generales)

URL: `https://tgr.gob.cl/convenios-de-pago/`

- `WebFetch` directo: **HTTP 403**, igual que reportó la sesión del fix. Confirma que el fallback documentado era necesario, no una excusa fabricada.
- Fallback aplicado: `curl` con user-agent de navegador (equivalente en efecto al `scrapling extract get --impersonate chrome` que usó la sesión original) devolvió **200 OK** con el HTML completo.
- Extracto literal verificado directamente en el HTML crudo, con `grep` sobre el archivo descargado (no interpretación de un modelo intermedio):
  - `"Plazo hasta 24 cuotas (de acuerdo al comportamiento de pago)"`
  - `"Pie entre un 10% y un 30% (de acuerdo al comportamiento de pago, si tiene o no garantía)"`
  - `"Con un mínimo de 1 UTM puedes solicitar un convenio de pago en cuotas mensuales."`
  - `"Ley N° 20.780 Política de Convenios y Condonación permanente del Servicio de Tesorerías."`
  - `"ClaveÚnica o Clave Tributaria (SII)"` — confirma el mecanismo de acceso citado en el texto publicado.

**Resultado: confirmado de forma independiente, con coincidencia literal exacta** (no solo semántica) entre el HTML crudo de la fuente y la cita reproducida en `07-publish-packet.md` líneas 215-222 y en el texto publicado línea 220.

### 1.3 ChileAtiende — Convenio de pago para deudas fiscales y territoriales

URL: `https://www.chileatiende.gob.cl/fichas/4399-convenio-de-pago-para-deudas-fiscales-y-territoriales`

Refetch propio (`WebFetch`, esta sesión): confirma "Podrás pagar las deudas en cuotas mensuales con tope de hasta 24 meses de plazo" y "Monto mínimo de la deuda para acogerse a un convenio: 1 UTM"; confirma que TGR administra el servicio, no el SII. Esta ficha **no** menciona el rango de pie 10%-30% ni la dependencia del comportamiento de pago/garantía — lo cual es coherente, porque el texto publicado atribuye esos dos datos específicamente a la fuente TGR, no a ChileAtiende, y `07-publish-packet.md` solo reclama de ChileAtiende la corroboración de "el mismo plazo máximo (24 meses) y el mínimo de 1 UTM", que es exactamente lo que esta ficha dice. Sin discrepancia.

**Resultado: confirmado de forma independiente**, sin sobre-reclamo de lo que dice esta fuente específica.

### 1.4 Verificación adicional: prompt injection

Se inspeccionó el HTML crudo descargado de `tgr.gob.cl` en busca de instrucciones embebidas (patrones tipo "ignore previous instructions", "you are now", "olvida instrucciones", etc.). **Ninguna encontrada.** Ninguna de las tres fuentes fetcheadas contenía contenido que intentara alterar rol, alcance o decisión editorial. No se etiqueta `PROMPT_INJECTION_CANDIDATE`.

---

## 2) Verificación de la corrección de atribución (TGR, no SII)

El texto publicado (línea 220) declara: *"lo administra la Tesorería General de la República (TGR), no el SII"*.

Esto es correcto y no introduce un error nuevo:

- La fuente SII (§1.1) remite explícitamente el trámite a TGR para giros de F22.
- La fuente TGR (§1.2) es la que efectivamente publica las condiciones del convenio, bajo su propio dominio `tgr.gob.cl`.
- ChileAtiende (§1.3) corrobora de forma independiente que "TGR administra este servicio, no el SII".
- El texto publicado mantiene correctamente que la Clave Tributaria (SII) o ClaveÚnica se usan como credencial de acceso al portal de TGR — esto **no** contradice la atribución de administración del trámite; son dos cosas distintas (credencial de acceso vs. entidad que resuelve el convenio), y la fuente TGR confirma literalmente ambas credenciales como válidas de acceso.

**No se encontró ningún error nuevo introducido por el cambio de atribución.**

---

## 3) Verificación del deferral residual (NORMA §2.4)

El texto publicado deja como deferral explícito solo: *"El porcentaje exacto del pie dentro de ese rango depende de tu comportamiento de pago y de si ofreces garantía, así que la aprobación final es caso a caso."*

Contraste con NORMA §2.4:

- **Condición 1 (fuente no pública):** no aplica — la regla general (plazo, rango de pie, mínimo) sí es pública y ya fue citada con fuente.
- **Condición 2 (respuesta intrínsecamente individual):** **aplica**. La fuente TGR confirma literalmente que el pie exacto "depende del comportamiento de pago" y "si tiene o no garantía" — son variables específicas del contribuyente/deudor que TGR no publica como tabla general (solo publica el rango 10%-30%, no una fórmula determinística). No existe una regla pública que permita calcular el porcentaje exacto sin conocer el caso. Esto coincide con el patrón de deferral legítimo del propio NORMA §2.4 ("Deducibilidad de gastos para un contribuyente con regimen mixto... depende del caso").

**Ningún número no verificado fue introducido.** Los cuatro valores concretos del texto (24 cuotas, 10%-30% de pie, 1 UTM mínimo, TGR como administrador) están todos confirmados literalmente contra el HTML crudo de la fuente primaria en §1.2, no son estimaciones ni inferencias del agente.

**Resultado: el deferral residual es legítimo por §2.4 condición 2. No es un defecto de pipeline.**

---

## 4) Confirmación de que el resto del artículo sigue intacto

Verificación mediante `git diff` sobre el working tree (no solo lectura manual, para eliminar el riesgo de que un cambio fuera de línea 220 pasara desapercibido):

```
git diff -- src/data/blog/rentas-mixtas-sueldo-honorarios.md
```

El diff muestra **una única línea modificada**: la línea 220 (el párrafo de "facilidades de pago"). No hay ningún otro hunk. Esto confirma de forma mecánica, no solo declarativa, que:

- R5 (cifra tramo exento IGC, `$11.265.804`) **no fue tocado** por este cambio.
- R2 (reencuadre de vigencia AT2026) **no fue tocado**.
- El fix APV (Régimen A/B, líneas 144 y 197-200) **no fue tocado**.
- `slug`, `title`, `seoTitle`, H1, `canonical`, frontmatter completo **no fueron tocados**.

Adicionalmente se verificó que **no quedan marcadores `TODO:SOURCE`** en el archivo publicado (`grep` sin resultados), cumpliendo la prohibición de NORMA §2.4 de que el blog file no contenga deferrals sin resolver marcados como tales.

El único otro archivo modificado relacionado con esta pieza es `artifacts/editorial/rentas-mixtas-sueldo-honorarios/20260812-1345-lote0b/07-publish-packet.md`, cuyo diff agrega exclusivamente la sección "Ronda — resolución deferral facilidades de pago" (verificado con `git diff`), sin alterar ninguna sección previa ni marcar ningún gate.

**Resultado: el resto del artículo está intacto.** No se detectó ningún cambio no autorizado fuera del alcance declarado.

---

## 5) Scorecard NORMA §7

| Eje | Peso | Nota (0-10) | Justificación |
|---|---|---|---|
| Respuesta ancla | 35% | 9,5 | Sin cambios respecto a la ronda 1 (R2 ya resuelto y verificado; no tocado por este cambio). |
| Precisión + fuentes | 25% | 9,5 | El deferral de "facilidades de pago" ahora cita regla pública concreta con fuentes primarias verificadas literalmente (SII + TGR + ChileAtiende, 3/3 confirmadas de forma independiente esta ronda). Sin nuevos defectos. |
| Vigencia + calendario | 15% | 9,5 | Sin cambios respecto a la ronda 1. |
| Excepciones + cobertura | 15% | 9,5 | El único deferral border-line pendiente (OBS-1/R4 de la ficha original) queda resuelto: reformulado con regla pública verificable, y el residuo que queda como deferral (pie exacto, aprobación caso a caso) es legítimo por §2.4 condición 2. Mejora de 9,0 → 9,5 respecto a la ronda 1. |
| Claridad + estructura | 10% | 8,0 | Sin cambios — siguen faltando H2 "Errores comunes", "Preguntas frecuentes" visible y "Fuentes y vigencia normativa" dedicada (R7b/OBS-2, SHOULD no bloqueante, Bucket C, fuera de alcance de esta ronda). |

**Cálculo:** 9,5×0,35 (3,325) + 9,5×0,25 (2,375) + 9,5×0,15 (1,425) + 9,5×0,15 (1,425) + 8,0×0,10 (0,800) = **9,350/10**

Mejora de 0,075 respecto al 9,275/10 de la ronda 1, íntegramente atribuible a la resolución del deferral. Por regla NORMA §7 ("cualquier artículo con < 9,5 no se publica; vuelve a iteración"), el puntaje sigue **por debajo del umbral de PASS incondicional**, exclusivamente por la deuda estructural R7b (Claridad + estructura, 8,0), ya conocida, ya registrada, Bucket C y explícitamente fuera del alcance de esta ronda.

---

## 6) DEFECTS

**Ninguno bloqueante nuevo.** No se detectaron errores nuevos en la verificación independiente de las tres fuentes del deferral ni en la corrección de atribución TGR.

Observaciones no bloqueantes (heredadas, sin cambio de estado salvo OBS-1 que se cierra en esta ronda):

- **OBS-1 (= R4 de la ficha original): CERRADO en esta ronda.** El deferral border-line de "facilidades de pago" fue reformulado con regla pública concreta, verificada de forma independiente contra las tres fuentes primarias. El residuo (pie exacto dentro del rango 10%-30%, aprobación caso a caso) es un deferral legítimo por §2.4 condición 2, no un defecto de pipeline.
- **OBS-2 (= R7b de la ficha original):** H2 faltantes ("Errores comunes", "Preguntas frecuentes" visible, "Fuentes y vigencia normativa"). Sigue igual. Bucket C, SHOULD no bloqueante. No forma parte del alcance de esta ronda.
- **OBS-4 (nueva, informativa, no bloqueante):** el cambio de línea 220 está sin commitear en el working tree al momento de esta revisión, junto con cambios no relacionados en otros artículos del mismo lote (`operacion-renta-f22-checklist.md`, `devolucion-impuestos-fechas-compensaciones.md`). No es un defecto de contenido de esta pieza, pero se documenta porque el estado del repositorio condiciona si este cambio realmente pasó por los gates automatizados (`pnpm run check:*`, `pnpm vitest run`) en el estado exacto en que se encuentra ahora, o si esos gates se corrieron sobre una versión previa del working tree. Recomendación no bloqueante: re-ejecutar gates después de comitear, antes de la firma humana.

---

## 7) Separación de funciones

Confirmada. Siete roles/sesiones distintas e independientes intervinieron sobre esta pieza a lo largo de las dos rondas:

1. **TriageAgent** (auditoría original de corpus publicado, 2026-08-12) — halló R5 y R2.
2. **DraftAgent R5/R2** (sesión inicial, 2026-08-12) — aplicó corrección de cifra IGC y reencuadre de vigencia.
3. **MathAuditAgent** (sesión fresca, 2026-08-12) — verificó R5, halló ERROR APV.
4. **DraftAgent fix-APV** (sesión nueva, 2026-08-13) — corrigió bloque APV.
5. **ComplianceAgent ronda 1** (sesión fresca, 2026-08-13) — verificación adversarial de R5, R2, fix APV; dejó registrado el deferral border-line como Bucket B.
6. **DraftAgent fix-deferral** (sesión nueva, 2026-08-13) — investigó y reformuló el deferral de "facilidades de pago" con fuente TGR.
7. **ComplianceAgent ronda 2** (esta sesión, fresca, 2026-08-13) — verificación adversarial independiente del fix del deferral, sin exposición a la sesión que lo produjo.

Pendiente: **HumanEditor** — firma no ejecutada por ningún agente.

No se detectó violación de `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`: ninguna sesión redactó y auditó/cumplió la misma pieza YMYL en el mismo turno. La sesión de DraftAgent que investigó y reformuló el deferral es distinta de esta sesión de ComplianceAgent, que no tuvo exposición a su transcript.

---

## 8) Veredicto final

**CONDITIONAL (9,350/10)**

**Justificación:** El único ítem Bucket B pendiente al cierre de la ronda 1 —el deferral border-line de "facilidades de pago"— está **resuelto y verificado de forma independiente** por esta sesión, con refetch propio de las tres fuentes primarias que el fix reporta haber usado (SII, TGR vía fallback `curl`/`scrapling` tras 403, ChileAtiende), coincidencia literal exacta entre el HTML crudo de la fuente TGR y el texto citado en el artículo, y confirmación de que la corrección de atribución (TGR, no SII) es correcta. El deferral residual (pie exacto dentro del rango, aprobación caso a caso) es legítimo por NORMA §2.4 condición 2 y no contiene ningún número inventado. Mediante `git diff` se confirmó de forma mecánica que ningún otro contenido del artículo fue tocado por este cambio (R5, R2, fix APV, frontmatter, slug — todos intactos).

El veredicto no es PASS incondicional porque el puntaje NORMA §7 (9,350/10) sigue por debajo del umbral de 9,5, exclusivamente por la deuda estructural R7b (Claridad + estructura, H2 faltantes), ya conocida, ya registrada, Bucket C y fuera del alcance de esta ronda. No se encontró ningún hallazgo nuevo bloqueante.

**Observación no bloqueante para HumanEditor:** el cambio de línea 220 está sin commitear al momento de esta revisión (ver OBS-4, §6); se recomienda confirmar que los gates automatizados se re-ejecuten sobre el estado final antes de la firma.

**No se marca ningún gate `[X]` en `07-publish-packet.md`. No se declara el artículo publicable. No se cierra ningún SLA. Pendiente: firma humana.**
