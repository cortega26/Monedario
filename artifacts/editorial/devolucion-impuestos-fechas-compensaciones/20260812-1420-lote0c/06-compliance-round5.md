# Compliance Review — RONDA 5 (cierre) — devolucion-impuestos-fechas-compensaciones

Status: CONDITIONAL — el fix de la línea 56 (DEFECT #4, ronda 4) quedó verificado y correcto: la primera oración del cuerpo dice ahora "revisado el 13 de agosto de 2026", coherente con `updatedDate`, `articleLead.validAsOf` y el badge "Revisado el" que renderiza `PostDetails.astro`. El grep exhaustivo de todas las fechas del archivo, realizado en esta ronda de forma independiente (no limitado a la línea que reportó ronda 4), no encontró ninguna otra inconsistencia. No hay ningún MUST de NORMA §1.1 incumplido detectado en esta ronda; tampoco hay ningún `TODO:SOURCE` remanente (confirmado con grep propio, cero coincidencias — ver §4). El veredicto no alcanza `PASS` puro porque el score total (9,450/10) queda bajo el umbral de 9,5/10 exigido por NORMA §7 — no por un defecto nuevo ni por ningún MUST incumplido, sino por el arrastre de una nota SHOULD ("Excepciones + cobertura", 9,0/10) ya señalada sin cambios desde ronda 3-4.

Role: ComplianceAgent (Claude Code — fresh session, adversarial), ronda 5, sin exposición a ninguna sesión de draft (rondas 1-3) ni a ninguna sesión de compliance previa (`06-compliance.md`, `06-compliance-round2.md`, `06-compliance-round3.md`, `06-compliance-round4.md`) más allá de la lectura de contexto explícitamente autorizada por el encargo (round4, como contexto — no autoridad). Tarea específica de esta ronda: verificar de forma independiente el fix mecánico de línea 56 (12→13 de agosto) que motivó y cerró el DEFECT #4 de ronda 4, hacer un grep exhaustivo propio de toda fecha del archivo (no solo la línea reportada), confirmar la coherencia del registro histórico en "Información de vigencia", re-confirmar brevemente los hallazgos ya cerrados en rondas 1-4, y ejecutar los gates mecánicos.

## 0. Alcance de esta revisión

Se leyeron, en este orden: `docs/editorial/NORMA_YMYL.md`, `06-compliance-round4.md` (contexto — no autoridad, específicamente el DEFECT #4 de fecha desalineada en línea 56), y el archivo publicado real `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` completo (fuente de verdad, tal como existe en el árbol de trabajo actual).

No se re-fetchearon las fuentes SII externas en esta ronda: el encargo pide explícitamente "re-verifica brevemente (sin re-auditar a fondo)" los hallazgos ya cerrados (reencuadre de vigencia R2, mecanismo de declarar fuera de plazo, umbral $3.000.000), y esos tres puntos ya fueron reverificados con fetch propio en vivo en ronda 4 (§2 de `06-compliance-round4.md`) sin encontrarse regresión. Releer el cuerpo completo del archivo en esta ronda no mostró ningún cambio de texto en esas tres secciones respecto de lo que ronda 4 verificó, salvo la corrección puntual de línea 56. No se detectó contenido con instrucciones embebidas dirigidas al agente en ninguna de las fuentes consultadas; no aplica `PROMPT_INJECTION_CANDIDATE`.

Nota de estado de repositorio (hallazgo de proceso, no de contenido): `git status` muestra el archivo `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` como **modificado sin commit** — el fix de línea 56 (12→13) existe en el árbol de trabajo (el archivo que esta ronda audita, correctamente, por ser la fuente de verdad indicada en el encargo) pero no en `HEAD` (commit `2837802d`), que todavía contiene "revisado el 12 de agosto de 2026" en esa línea. Esto no es un defecto de contenido editorial ni afecta el veredicto de esta ronda — el encargo instruye auditar el archivo publicado real, y así se hizo — pero es una condición operativa que debe resolverse antes de considerar el ciclo cerrado: el fix debe quedar comprometido (commit) para que la corrección persista más allá de esta sesión de trabajo.

## 1. Verificación del fix de línea 56 (punto central de esta ronda)

Línea 56 actual:

> "**Estado del ciclo AT2026 (revisado el 13 de agosto de 2026): ya cerró.**"

**Confirmado: dice "13 de agosto de 2026".** Coherente con:
- `updatedDate: 2026-08-13T00:00:00Z` (línea 8).
- `articleLead.validAsOf: 2026-08-13` (línea 24).
- El badge "Revisado el {formatMetadataDate(article.updatedDate, "long")}" que `PostDetails.astro` (líneas 462-468, según lo documentado por ronda 4) renderiza a partir de `updatedDate` — con este último en 2026-08-13, el badge mostrará "Revisado el 13 de agosto de 2026", ahora en concordancia exacta con la primera oración del cuerpo.

El fix descrito en el encargo (edición de una palabra, "12"→"13", en línea 56) se ejecutó exactamente como se especificó, sin efectos colaterales visibles en el resto del párrafo o de la sección.

## 2. Grep exhaustivo propio de toda fecha del archivo

Se ejecutaron, de forma independiente (no derivadas de lo reportado por rondas anteriores), las siguientes búsquedas sobre el archivo completo:

- `grep -n "2026-08-1[0-9]"` — coincidencias en líneas 8, 24, 164, 167 (frontmatter, `validAsOf`, changelog).
- `grep -n "de agosto de 2026"` — coincidencias en líneas 56, 165, 166, 167.
- `grep -ni "revisad"` — coincidencias en líneas 56, 164.
- `grep -ni "actualizad"` — coincidencia en línea 168.
- `grep -n "validAsOf"` — coincidencias en líneas 24, 167.
- `grep -n "12 de agosto"` — **cero coincidencias.**
- `grep -n "13 de agosto"` — coincidencias en líneas 56, 165, 166, 167.
- Grep adicional de cobertura amplia `grep -n "2026-08\|08/2026\|08-2026\|agosto"` — mismo conjunto de líneas ya listado, más línea 78 ("a la fecha de esta revisión (agosto de 2026)", sin día específico, sin conflicto posible con ninguna fecha puntual).

**Resultado: limpio.** No se encontró ninguna fecha de "revisado"/"actualizado"/vigencia inconsistente con 2026-08-13 fuera de la línea 164, que documenta correctamente un evento histórico (la revisión de ronda 1, ocurrida el 2026-08-12) y no debe cambiar — ver §3. No se encontraron formatos alternativos de fecha (DD/MM, DD-MM, etc.) que pudieran ocultar una inconsistencia al grep de patrones "2026-08-1[0-9]" o "de agosto de 2026". `pubDate` (línea 7, 2026-02-28) y `reviewPolicy.computedAt` (línea 53, 2026-05-06) son campos de naturaleza distinta (fecha de publicación original y fecha de cómputo de política de revisión, respectivamente) sin relación con la afirmación "revisado el" del cuerpo ni con `updatedDate`/`validAsOf`; no generan contradicción de señal de frescura.

No se encontró ningún defecto nuevo en este grep exhaustivo.

## 3. Coherencia del registro histórico — "Información de vigencia" (líneas 164-167)

| Línea | Fecha declarada | Evento que documenta | ¿Correcta? |
|---|---|---|---|
| 164 | 2026-08-12 | Revisión original (ronda 1): reencuadre de vigencia R2, primera pantalla | **Sí — debe permanecer en 08-12** porque documenta cuándo ocurrió esa ronda específica, no el estado actual del artículo. Cambiarla a 08-13 sería falsificar el registro histórico. |
| 165 | 2026-08-13 | Corrección ronda 2 (fuente para "aún puedes declarar fuera de plazo" + fix de entrada duplicada en fuentes) | Sí — ocurrió el 13-08. |
| 166 | 2026-08-13 | Investigación ronda 3 (dirime umbral $3.000.000) | Sí — ocurrió el 13-08. |
| 167 | 2026-08-13 | Registro NORMA §5.3 del bump de `updatedDate`/`validAsOf` de 08-12 a 08-13 | Sí — el bump en sí ocurrió el 13-08, y el bullet documenta correctamente los valores origen (08-12) y destino (08-13) del campo que describe, sin que eso implique que el bullet mismo deba fecharse distinto. |

**Confirmado: coherente.** El bullet de línea 164 conserva correctamente 2026-08-12 (no fue alterado para simular que todo el trabajo ocurrió el mismo día); los bullets de líneas 165-167 están fechados 2026-08-13, consistente con cuándo ocurrió cada evento. El changelog se lee como un registro honesto y verificable de cuatro eventos distintos en dos fechas distintas, exactamente como exige NORMA §5.3 ("qué cambió, por qué, fuente(s) que justifican"). No hay ningún indicio de que se haya intentado unificar artificialmente las fechas del changelog para ocultar que el trabajo se hizo en múltiples sesiones.

No se identificó ningún defecto en esta sección.

## 4. Re-confirmación breve de hallazgos previos (rondas 1-4)

Se releyó el cuerpo completo del archivo (no solo los reportes previos) para confirmar que ningún hallazgo cerrado se regresionó entre ronda 4 y esta ronda. Adicionalmente, se corrió `git diff HEAD -- src/data/blog/devolucion-impuestos-fechas-compensaciones.md` para verificar mecánicamente (no solo por lectura) que el árbol de trabajo no difiere de `HEAD` (commit `2837802d`, la versión que ronda 4 auditó) más que en esa única línea. El diff confirma exactamente un hunk, en la línea 56, cambiando "12 de agosto" por "13 de agosto de 2026" — ningún otro carácter del archivo cambió desde que ronda 4 lo auditó:

- **Reencuadre de vigencia R2 (cerrado ronda 1):** sigue cerrado. Línea 56 declara el cierre del ciclo AT2026 en la primera pantalla; línea 78 no inventa fecha para AT2027 ("el SII todavía no publica el calendario de la Operación Renta AT2027"). Sin regresión.
- **Mecanismo de declarar fuera de plazo (líneas 76, 155, 158, 165):** sigue cerrado. Cita condicionada correctamente ("si estabas obligado a declarar"), fuentes SII 001_140_0595 y p7renta.htm presentes en frontmatter (líneas 30-33) y en "Fuentes y referencias primarias" (líneas 157-158). Reverificado con fetch propio en ronda 4 (§2 de `06-compliance-round4.md`); esta ronda no repite el fetch por instrucción explícita del encargo, solo confirma que el texto no cambió.
- **Umbral $3.000.000 (dirimido ronda 3, línea 92, 155, 166):** sigue cerrado, sin cambio de cifra. La cita de FAQ 001_140_8366 permanece acotada a "retenciones y datos bancarios", no al umbral, evitando la ambigüedad que motivó la investigación de ronda 3.
- **DEFECT #1 y #2 (ronda 1) y DEFECT-NUEVO #1 (ronda 2, duplicado de fuente 8951):** sin evidencia de regresión; "Fuentes y referencias primarias" (líneas 152-160) no tiene entradas duplicadas.
- **DEFECT #3 (ronda 3, desfase de fechas en changelog) y DEFECT #4 (ronda 4, desfase en línea 56):** ambos verificados como resueltos en §1-§3 de este documento.

Ningún hallazgo previamente cerrado se reabrió en esta ronda.

### Verificación del requisito "cero `TODO:SOURCE`" (NORMA §7)

Se ejecutó `grep -n "TODO:SOURCE" src/data/blog/devolucion-impuestos-fechas-compensaciones.md` sobre el blog file: **cero coincidencias** (exit code 1, sin salida). El requisito de NORMA §7 para `PASS` puro ("cero `TODO:SOURCE` remanentes") **se cumple**. La brecha frente a 9,5/10 es exclusivamente de score (§6), no de `TODO:SOURCE` pendiente.

### Pendiente de proceso detectado (no es un defecto de contenido ni de NORMA §7)

El fix de línea 56 existe solo en el árbol de trabajo, no en un commit: `git diff HEAD` (arriba) confirma que `HEAD` (commit `2837802d`) todavía contiene "12 de agosto de 2026" en esa línea, mientras que el archivo que esta ronda audita (el árbol de trabajo, correctamente indicado como fuente de verdad por el encargo) ya tiene "13 de agosto de 2026". Esto no es un `TODO:SOURCE` ni un defecto NORMA en el sentido estricto del artículo —es una condición de higiene de repositorio, no de calidad editorial— pero es una condición que debería resolverse (comprometer el cambio) antes de la firma humana, para evitar que una sesión futura audite `HEAD` y reabra el mismo defecto que esta ronda ya verificó como corregido sobre el árbol de trabajo.

## 5. Gates mecánicos

**`pnpm run check:frontmatter`:**

```
$ node scripts/check-frontmatter.mjs
[check-frontmatter] Scanned 53 articles.
[check-frontmatter] Deprecation counters:
- pubDatetime: 0
- modDatetime: 0
- canonicalURL: 0
- ogImage: 0
[check-frontmatter] Transition defaults:
- slug_missing: 0
- category_missing: 0
[check-frontmatter] Quality warnings (Level 2):
- title_range: 0
- description_range: 0
[check-frontmatter] OK (no blocking errors).
```

**`pnpm run check:editorial-timeliness`:**

```
$ node scripts/check-editorial-timeliness.mjs
[check-editorial-timeliness] published=53 stale=1 drift=0 report=output/validation/editorial-timeliness/report.json
[check-editorial-timeliness] FAIL:
- src/data/blog/impuesto-global-complementario-chile.md: review SLA expired on 2026-08-12 (90d cadence, sourceMode=manual_review).
[ELIFECYCLE] Command failed with exit code 1.
```

El fallo de `check:editorial-timeliness` **no corresponde al artículo bajo auditoría** — `devolucion-impuestos-fechas-compensaciones.md` no aparece en la lista de artículos `stale`; el SLA expirado es de `impuesto-global-complementario-chile.md`, un artículo fuera del alcance de este run (ya documentado como preexistente y fuera de alcance en el commit `2837802d`, según `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md` §18.4, según el propio mensaje de commit). Se reporta la salida literal tal como se pidió, sin interpretarla como un defecto de este artículo.

## 6. Scorecard NORMA §7

| Dimensión | Peso | Nota | Justificación | Ponderado |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,5/10 | Sin cambios respecto a ronda 4: respuesta concreta en primera pantalla, sin meta-proceso, condicionada correctamente. La corrección de línea 56 no altera el contenido de la respuesta ancla, solo su marca de fecha. | 3,325 |
| Precisión + fuentes | 25% | 9,5/10 | Sin cambios: umbral $3.000.000 y mecanismo de fuera de plazo, reverificados con fetch propio en ronda 4, siguen coherentes con el cuerpo publicado en esta ronda. | 2,375 |
| Vigencia + calendario | 15% | 10,0/10 | **MUST 9 (NORMA §1.1) ahora cumplido, sin reserva.** El grep exhaustivo de esta ronda (§2) no encontró ninguna fecha "revisado"/"actualizado" desalineada de `updatedDate`/`validAsOf`/badge renderizado, y `git diff HEAD` (§4) confirma mecánicamente que el único cambio frente a lo que ronda 4 auditó es esa corrección. El registro histórico (líneas 164-167) es coherente y honesto. No se aplica penalización por la condición de proceso de §4 (commit pendiente): NORMA §7 califica la calidad editorial del contenido, no la higiene de control de versiones — esa condición queda registrada como pendiente operativo en §4 y §9, no como deducción de nota. | 1,500 |
| Excepciones + cobertura | 15% | 9,0/10 | Sin cambios respecto a rondas 3-4: cobertura amplia (3 escenarios en "qué hacer hoy", 5 en "si te pasa X", 6 en "errores que retrasan el pago", 5 FAQ); deferral de multa/interés legítimo por §2.4 pero sin rango orientativo — misma observación menor no resuelta en ninguna ronda anterior, no es un defecto nuevo de esta ronda. | 1,350 |
| Claridad + estructura | 10% | 9,0/10 | Sin cambios: jerarquía H2 lógica; encabezado genérico "Si te pasa X, haz Y" sigue siendo la única observación menor de forma, sin cambios desde ronda 3. | 0,900 |
| **Total** | | | | **9,450/10** |

**Relación score↔MUST:** con el fix de línea 56 verificado, no se detecta ningún MUST de NORMA §1.1 incumplido en esta ronda, y "Vigencia + calendario" alcanza 10,0/10. El score total (9,450/10) queda, sin embargo, **bajo el umbral de 9,5/10** que NORMA §7 exige para calificar como `PASS` puro. La brecha no proviene de ningún MUST fallido ni de ningún `TODO:SOURCE` remanente (§4), sino del arrastre de dos notas SHOULD ya identificadas en rondas anteriores (Excepciones+cobertura 9,0; Claridad+estructura 9,0) que ninguna ronda de compliance está mandatada a resolver por sí misma (son observaciones menores de forma/profundidad, no defectos bloqueantes).

## 7. DEFECTS

- **DEFECT #1 (ronda 1):** RESUELTO — reconfirmado sin regresión en §4.
- **DEFECT #2 (ronda 1):** RESUELTO — reconfirmado sin regresión en §4.
- **DEFECT-NUEVO #1 (ronda 2, umbral $3.000.000):** RESUELTO — reconfirmado sin regresión en §4.
- **DEFECT #3 (ronda 3, desfase de fechas en "Información de vigencia"):** RESUELTO — reconfirmado en §3.
- **DEFECT #4 (ronda 4, fecha "revisado el" en línea 56):** RESUELTO — verificado en §1-§2 con grep exhaustivo propio; sin regresión ni defecto residual.
- **Defectos nuevos encontrados en esta ronda:** ninguno.
- **Hallazgo de proceso (no es un DEFECT de contenido NORMA):** el fix de línea 56 existe en el árbol de trabajo pero no está comprometido en un commit (`HEAD` = `2837802d` todavía contiene "12 de agosto"). Recomendación operativa: comprometer el cambio antes de la firma humana, para que el estado que esta ronda certificó como correcto persista de forma durable y no dependa de que el árbol de trabajo se mantenga sin `git checkout`/`reset` sobre ese archivo.

## 8. Separación de funciones (mapea las 5 rondas + etapas previas)

| Etapa | Agente / sesión |
|---|---|
| Auditoría original (ficha, TriageAgent) | ComplianceAgent adversarial, sesión previa 2026-08-12, `output/audits/corpus-2026-08-12/fichas/` |
| DraftAgent ronda 1 | DraftAgent, sesión `20260812-1420-lote0c` |
| ComplianceAgent ronda 1 (`06-compliance.md`, FAIL 8,75/10) | ComplianceAgent, sesión fresca, sin exposición al draft |
| DraftAgent ronda 2 (remediación DEFECT #1-2) | DraftAgent, sesión nueva 2026-08-13, sin exposición a rondas previas |
| ComplianceAgent ronda 2 (`06-compliance-round2.md`, FAIL 8,875/10, encuentra DEFECT-NUEVO #1) | ComplianceAgent, sesión fresca |
| DraftAgent ronda 3 (investigación dedicada, dirime umbral $3.000.000) | DraftAgent, sesión nueva 2026-08-13, sin exposición a rondas previas |
| ComplianceAgent ronda 3 (`06-compliance-round3.md`, FAIL 9,075/10, encuentra DEFECT #3 de fechas) | ComplianceAgent, sesión fresca |
| Remediación mecánica del fix de fechas #1 (post-ronda 3, Bucket C) | Sesión de orquestación/edición puntual, sin agente de draft dedicado ni ronda de compliance dedicada — verificada solo por gates directos |
| ComplianceAgent ronda 4 (`06-compliance-round4.md`, FAIL 9,000/10, encuentra DEFECT #4 de fecha en línea 56) | ComplianceAgent, sesión fresca, sin exposición a ninguna sesión de draft ni de compliance previa |
| Remediación mecánica del fix de línea 56 (post-ronda 4, Bucket C) | Sesión de orquestación/edición puntual, sin agente de draft dedicado ni ronda de compliance dedicada — descrita en el encargo de esta ronda como "edición directa de una palabra, verificada con grep exhaustivo" |
| ComplianceAgent ronda 5 — cierre (este documento) | ComplianceAgent, sesión fresca, sin exposición a ninguna sesión de draft ni de compliance previa, salvo lectura de contexto de ronda 4 explícitamente autorizada |
| Firma de publicación | HumanEditor — pendiente |

**Sin violación de separación de funciones detectada.** Doce etapas/sesiones distintas declaradas y consistentes entre sí, conforme a `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`. Esta sesión (ronda 5) no redactó ni editó el contenido del artículo, solo lo auditó — cumpliendo la prohibición de "draft y audit/comply en la misma sesión" para YMYL.

## 9. Veredicto final

**Status: CONDITIONAL**
**Veredicto: CONDITIONAL (9,450/10 — bajo el umbral NORMA §7 de 9,5/10 para `PASS` puro, pero sin ningún MUST de §1.1 incumplido y sin `TODO:SOURCE` remanente en el blog file, confirmado con grep propio)**

Justificación: el fix mecánico de línea 56 que motivó esta ronda 5 se ejecutó correctamente — la primera oración del cuerpo dice ahora "revisado el 13 de agosto de 2026", en concordancia con `updatedDate`, `articleLead.validAsOf` y el badge "Revisado el" renderizado por `PostDetails.astro`. El grep exhaustivo de todas las fechas del archivo, realizado de forma independiente en esta ronda (no limitado a la línea que reportó ronda 4), confirma que no queda ninguna otra inconsistencia: el bullet histórico de línea 164 conserva correctamente 2026-08-12 (documenta un evento pasado, no debe cambiar) y los bullets de líneas 165-167 están correctamente fechados 2026-08-13. `git diff HEAD` confirma mecánicamente que el único cambio en el árbol de trabajo frente a lo que ronda 4 auditó es esa línea. No se encontró ningún defecto nuevo. Los hallazgos cerrados en rondas 1-4 se re-confirmaron sin regresión mediante lectura completa del cuerpo publicado.

No se alcanza `PASS` puro porque NORMA §7 exige ≥9,5/10, y el score total de esta ronda (9,450/10) queda por debajo de ese umbral — no por un MUST incumplido ni por un `TODO:SOURCE` pendiente, sino por el arrastre de dos notas SHOULD ya señaladas y no resueltas en rondas anteriores (falta de rango orientativo de multa/interés en el deferral legítimo de §2.4; encabezado genérico "Si te pasa X, haz Y"). Independientemente del score, queda un pendiente operativo fuera de NORMA: el fix de línea 56 existe en el árbol de trabajo auditado (correctamente, según el encargo, que indica el archivo publicado real como fuente de verdad) pero no está comprometido en un commit — `HEAD` (`2837802d`) todavía contiene la versión con "12 de agosto". Esta condición no afectó el scorecard (es higiene de repositorio, no calidad editorial) pero debe resolverse antes de la firma humana, para que el estado verificado por esta ronda persista de forma durable y no dependa de que nadie ejecute `git checkout`/`reset` sobre ese archivo.

No se marcó ningún gate de `07-publish-packet.md`. No se editó `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` ni ningún archivo de contenido ni `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`. No se declara la pieza publicable — el veredicto de compliance no sustituye la firma humana, que sigue pendiente y separada.

Pendiente: (1) comprometer en un commit el fix de línea 56 (ya presente en el árbol de trabajo, verificado en esta ronda); (2) decisión editorial sobre si las dos notas SHOULD pendientes (rango orientativo de multa/interés; encabezado genérico de sección) ameritan una iteración adicional para alcanzar el umbral formal de 9,5/10, o si se acepta el `CONDITIONAL` actual como suficiente para pasar a firma humana, dado que ningún MUST bloqueante permanece abierto; (3) firma humana.
