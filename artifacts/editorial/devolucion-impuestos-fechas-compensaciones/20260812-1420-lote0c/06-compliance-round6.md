# Compliance Review — RONDA 6 — devolucion-impuestos-fechas-compensaciones

Status: CONDITIONAL — la contradicción interna real detectada por el revisor automático (bot Codex, PR #423) — la línea 56 afirmaba en tono absoluto que "el SII terminó de pagar las devoluciones de ese año tributario el 29 de mayo de 2026", mientras el mismo artículo (rectificatoria, regularización tardía) describe pagos posteriores a esa fecha — **queda verificada como resuelta** en esta ronda: la reformulación de la línea 56 y de `articleLead.answer` distingue correctamente entre "calendario ordinario" (cerrado el 29 de mayo de 2026) y la posibilidad de un pago posterior por rectificatoria o regularización tardía, y esa distinción es coherente con el resto del cuerpo (líneas 74, 76). No se detectó ningún MUST de NORMA §1.1 incumplido en esta ronda. El veredicto no alcanza `PASS` puro porque el score total (9,450/10) permanece bajo el umbral de 9,5/10 de NORMA §7 — la misma brecha de arrastre (dos notas SHOULD) que documentaron rondas 3, 4 y 5, sin cambio en esta ronda. Se identifica además un hallazgo de proceso, recurrente por segunda vez consecutiva: el fix auditado existe solo en el árbol de trabajo, no está comprometido en un commit.

Role: ComplianceAgent (Claude Code — fresh session, adversarial), ronda 6, sin exposición a ninguna sesión de draft ni a ninguna sesión de compliance previa más allá de la lectura de contexto explícitamente autorizada por el encargo (`06-compliance-round5.md`, como contexto histórico — no autoridad). Tarea específica de esta ronda: verificar de forma independiente que la reformulación de línea 56 y `articleLead.answer` (motivada por el hallazgo del bot Codex en PR #423) resuelve la contradicción sin introducir imprecisión nueva, confirmar que la tabla de fechas y el umbral de $3.000.000 permanecen intactos, ejecutar un grep exhaustivo propio de toda fecha del archivo, y buscar cualquier otra contradicción interna que las 5 rondas previas (incluyendo esta relectura) pudieran haber pasado por alto.

## 0. Alcance de esta revisión

Se leyeron, en este orden: `docs/editorial/NORMA_YMYL.md` §1.1 MUST #8 (coherencia interna) y contexto general de la norma; `06-compliance-round5.md` (contexto histórico — no autoridad; documenta el cierre `CONDITIONAL 9,450/10` de la ronda anterior, centrada en un defecto de fecha distinto — "12" vs "13" de agosto en línea 56, ya resuelto y comprometido en el commit `2837802d`); y el archivo publicado real `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` completo (fuente de verdad, tal como existe en el árbol de trabajo actual), incluyendo una lectura íntegra del cuerpo, no solo de las líneas señaladas por el encargo.

Para contextualizar el alcance exacto de la reformulación, se ejecutó `git diff HEAD -- src/data/blog/devolucion-impuestos-fechas-compensaciones.md`, que muestra exactamente tres hunks: (1) `articleLead.answer`, (2) el párrafo de apertura del cuerpo (línea 56), y (3) una línea nueva agregada al changelog de "Información de vigencia" (línea 168). Ningún otro carácter del archivo cambió frente a `HEAD` (commit `2837802d`, la versión que auditó ronda 5). Esto confirma mecánicamente — no solo por lectura — que la tabla de fechas (líneas 88-90) y el umbral de $3.000.000 (línea 92) no fueron tocados por este fix.

También se leyó `06-compliance-round4.md` para dirimir una posible confusión de numeración: el changelog del artículo (línea 168) etiqueta esta corrección como "ronda 4", mientras que `ComplianceAgent` ya lleva cinco rondas completadas (`06-compliance.md` a `06-compliance-round5.md`). Verificado: la convención de numeración del changelog interno del artículo ("Corrección (ronda 2...)", "Investigación (ronda 3...)", ahora "Corrección (ronda 4...)") cuenta sesiones de `DraftAgent` que modificaron contenido — no rondas de `ComplianceAgent` — y es consistente con la tabla de separación de funciones de rondas anteriores (`DraftAgent ronda 1/2/3` documentadas en `06-compliance-round4.md` §5 y `06-compliance-round5.md` §8). Esta reformulación es, bajo esa misma convención, la cuarta sesión de `DraftAgent` que toca el cuerpo del artículo. **No se trata de un error de etiquetado** — es ambiguo para un lector externo que no conozca la doble numeración (DraftAgent vs. ComplianceAgent), pero no es una inexactitud objetiva; se registra como observación menor de trazabilidad en §5, no como defecto.

No se detectó contenido con instrucciones embebidas dirigidas al agente en ninguna de las fuentes consultadas; no aplica `PROMPT_INJECTION_CANDIDATE`.

**Nota de estado de repositorio (hallazgo de proceso, no de contenido):** `git status --short` muestra `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` como **modificado sin commit**. El fix que motiva esta ronda existe en el árbol de trabajo (correctamente auditado, por ser la fuente de verdad indicada en el encargo) pero no en `HEAD` (`2837802d`), que todavía contiene la versión con la afirmación absoluta ("El SII terminó de pagar las devoluciones..."). Es la **segunda vez consecutiva** (tras la misma observación de ronda 5 sobre el fix de fecha de línea 56) que un fix auditado por esta serie de rondas queda sin comprometer al momento de la auditoría. Ver §6 para la recomendación operativa reforzada.

## 1. Verificación de la corrección de la contradicción (punto central de esta ronda)

### 1.1 Texto anterior (contradicción original, según `git diff HEAD`)

> "**Estado del ciclo AT2026 (revisado el 13 de agosto de 2026): ya cerró.** El SII terminó de pagar las devoluciones de ese año tributario el 29 de mayo de 2026 (última fecha del calendario de depósito y cheque)."

Esta redacción afirmaba, en la primera pantalla, un cierre absoluto ("terminó de pagar las devoluciones de ese año tributario"), mientras el mismo artículo explica, más abajo:

- Línea 74: "Si la rectificatoria genera devolución, esta se paga aproximadamente tres semanas **después** de que el SII autoriza el monto a TGR." — un pago que, por definición, puede ocurrir después del 29 de mayo si la rectificatoria se presenta o se resuelve después de esa fecha.
- Línea 76: "aún puedes regularizar en sii.cl" (declaración no presentada) — un mecanismo que, si genera devolución, tampoco está atado a la fecha del 29 de mayo.

Esa es exactamente la contradicción MUST #8 (NORMA §1.1: "No puede haber contradicciones entre secciones, FAQ y resúmenes") que el bot Codex del PR #423 detectó y que las 5 rondas previas de `ComplianceAgent` no atraparon.

### 1.2 Texto actual (reformulado)

> "**Estado del ciclo AT2026 (revisado el 13 de agosto de 2026): el calendario ordinario ya cerró.** El 29 de mayo de 2026 fue la última fecha del calendario ordinario de depósito y cheque para quienes declararon dentro de la ventana AT2026 (1 de abril al 8 de mayo). Esa fecha no es el fin de todo pago posible de devolución de este año tributario: si rectificas tu declaración o regularizas una declaración no presentada, el pago que resulte se procesa después, fuera de ese calendario (detalle más abajo)."

Y en `articleLead.answer`:

> "El calendario ordinario del ciclo AT2026 ya cerró: el depósito fue 29 de abril, 15 de mayo o 27 de mayo de 2026 según cuándo declaraste, y los cheques se emitieron el 29 de mayo. Esa fecha no cierra toda posibilidad de devolución de este año tributario: un pago por rectificatoria o por regularización tardía puede ocurrir después, fuera de ese calendario."

**Verificación de coherencia cruzada:**

| Afirmación de la reformulación | Sección que la respalda | ¿Coherente? |
|---|---|---|
| "El calendario **ordinario** ya cerró" (no "toda posibilidad de devolución") | Título de la sección 2: "Fechas de referencia y ventanas de pago (calendario del ciclo AT2026, **ya ejecutado**)" (línea 82); tabla líneas 88-90 | Sí — el calificador "ordinario" se aplica de forma consistente al mismo objeto (el calendario de depósito/cheque de la tabla), no a un concepto nuevo sin anclaje |
| "si rectificas... el pago que resulte se procesa después, fuera de ese calendario" | Línea 74: rectificatoria paga "~3 semanas después de que el SII autoriza el monto a TGR" | Sí — coherente, sin conflicto de plazos |
| "o regularizas una declaración no presentada, el pago... se procesa después" | Línea 76: mecanismo de regularización tardía vía sii.cl, con fuentes 001_140_0595 y p7renta.htm | Sí — coherente; la reformulación no inventa un plazo nuevo para este caso, correctamente remite solo al mecanismo ya descrito |
| "(detalle más abajo)" | Líneas 74 y 76 sí desarrollan el detalle prometido | Sí — no es un "rodeo" de MUST #2 (referencia hacia adelante permitida por NORMA §2.3, "se admite contexto después de la regla") |

**Confirmado: la contradicción queda resuelta.** La reformulación no elimina el hecho concreto (29 de mayo de 2026, cierre del calendario ordinario) sino que lo acota correctamente a "calendario ordinario", dejando espacio explícito y coherente para los dos mecanismos de pago posterior (rectificatoria, regularización) que el resto del artículo ya documentaba. No queda ninguna oración en el archivo que reafirme, en términos absolutos, que "no hay más devoluciones posibles" o equivalente — verificado con grep dedicado (ver §3).

### 1.3 ¿La reformulación introduce imprecisión nueva?

- **¿"Calendario ordinario" está bien definido?** Sí. El término se usa tres veces (articleLead.answer, dos veces en línea 56) siempre en referencia al mismo objeto concreto: el calendario de depósito/cheque publicado por el SII el 31 de marzo de 2026 y detallado en la tabla de la sección 2. No se introduce como término jurídico propio del SII (el artículo no le atribuye esa etiqueta a una fuente oficial), sino como recurso editorial para distinguir "el calendario publicado" de "pagos que ocurren por fuera de ese calendario" — uso consistente con MUST #7 (no legitimarlo como categoría normativa, solo como recurso de claridad) y sin atribución falsa a SII.
- **¿El lector entiende cuándo aplica cada caso?** Sí, con una lectura secuencial: párrafo de apertura (línea 56) plantea la distinción general; la sección "Ciclo AT2026 cerrado: qué hacer hoy" (línea 58 en adelante) resuelve en detalle los tres escenarios (declaraste y no llegó depósito → línea 62 y siguientes, incluida la vía de rectificatoria en línea 74; no alcanzaste a declarar → línea 76). No hay salto lógico sin resolver.
- **¿"29 de mayo... última fecha del calendario ordinario de depósito y cheque"** es precisa frente a la tabla? La tabla (líneas 88-90) muestra depósitos en 29 de abril, 15 de mayo o 27 de mayo según ventana, y cheque uniformemente el 29 de mayo para las tres ventanas. "29 de mayo" es, en efecto, la fecha más tardía de todo el calendario (ningún depósito ni cheque ocurre después de esa fecha) — la frase es correcta leída como "la fecha más tardía del conjunto depósito+cheque", no como "todos los depósitos y cheques ocurrieron el 29 de mayo". Esta imprecisión potencial de lectura ya existía en el texto original (pre-fix) con la misma construcción ("última fecha del calendario de depósito y cheque") y no es nueva de esta reformulación; se registra como observación menor preexistente, no como defecto nuevo de esta ronda (ver §4).

No se encontró imprecisión nueva introducida por la reformulación.

## 2. Tabla de fechas y umbral de $3.000.000

Confirmado mecánicamente vía `git diff HEAD` (§0): el diff tiene exactamente 3 hunks (articleLead.answer, línea 56, línea 168 nueva). Ninguno toca las líneas 88-92.

- **Tabla (líneas 88-90):** intacta — 29 de abril / 15 de mayo / 27 de mayo (depósito) y 29 de mayo (cheque, las tres filas), sin cambios de cifra.
- **Umbral $3.000.000 (línea 92):** intacto — "Cheques sobre $3.000.000 se envían al domicilio registrado en el SII; los de menor monto se retiran en BancoEstado." Sin cambio de cifra ni de dirección, consistente con lo dirimido en ronda 3 y reverificado con fetch propio en ronda 4.

**Confirmado: ambos permanecen intactos.**

## 3. Grep exhaustivo propio de fechas

Ejecutado de forma independiente sobre el archivo completo:

- `grep -n "2026-08-1[0-9]"` → líneas 8, 24, 164, 167. Sin cambios respecto al patrón ya verificado en ronda 5.
- `grep -n "de agosto de 2026"` → líneas 56, 165, 166, 167, **168 (nueva)**.
- `grep -n "12 de agosto"` → **cero coincidencias** (el bullet histórico de línea 164 usa el formato ISO "2026-08-12", no "12 de agosto", y describe correctamente un evento pasado que no debe cambiar).
- `grep -ni "revisad"` → líneas 56, 164. Sin nuevas ocurrencias.
- `grep -ni "actualizad"` → línea 169 (bullet de "puede quedar desactualizado cuando"). Sin cambios.
- `grep -n "validAsOf"` → líneas 24, 167. Sin cambios.
- `grep -n "updatedDate"` → líneas 8, 167. Sin cambios.
- `grep -n "TODO:SOURCE"` → **cero coincidencias.**
- `grep -n "ordinario"` → líneas 23, 56 (x2), 168 — todas las ocurrencias del término nuevo, usadas de forma consistente (ver §1.3).
- Grep adicional de cobertura amplia `grep -n "terminó de pagar\|todas las devoluciones\|toda devolución\|no habrá más\|cierre total"` sobre el archivo actual → **cero coincidencias**: la frase absoluta original ("El SII terminó de pagar las devoluciones...") ya no existe en el archivo en ninguna forma.

**Resultado: limpio.** `updatedDate` (2026-08-13), `articleLead.validAsOf` (2026-08-13), la primera oración del cuerpo ("revisado el 13 de agosto de 2026") y el registro histórico (líneas 164-168) permanecen mutuamente coherentes tras este cambio. El bullet de línea 164 sigue correctamente fechado 2026-08-12 (evento histórico, no debe cambiar); los bullets 165-168 están fechados 13 de agosto de 2026, consistente con cuándo ocurrió cada evento, incluyendo el nuevo bullet 168 que documenta esta corrección.

## 4. Búsqueda de otras contradicciones internas no detectadas por rondas previas

Se releyó el cuerpo completo (no solo las líneas señaladas por el encargo) buscando específicamente el mismo patrón que produjo el defecto del PR #423: afirmaciones de cierre/finalización en una sección que pudieran chocar con excepciones descritas en otra.

- **H2 "Ciclo AT2026 cerrado: qué hacer hoy" (línea 58) vs. cuerpo de esa misma sección:** el encabezado usa "cerrado" sin calificador ("ordinario"), lo que en aislamiento podría leerse con la misma ambigüedad que motivó el defecto original. Sin embargo, la primera oración bajo ese encabezado (línea 60) acota inmediatamente el alcance: "El calendario de depósito y cheque de AT2026... ya se ejecutó por completo. Esas fechas quedan como referencia..." — es decir, el encabezado se refiere al calendario, no a "toda posibilidad de devolución", y el propio párrafo de apertura (línea 56, ya reformulado) establece esa distinción dos párrafos antes. **No constituye una contradicción MUST #8** (no hay dos afirmaciones incompatibles sobre el mismo hecho), pero es una tensión de redacción menor — el encabezado por sí solo, sin el contexto inmediatamente anterior, es menos preciso que el resto del artículo tras el fix. Se registra como observación menor en §7 (no bloqueante, no defecto).
- **Sección "Si te pasa X, haz Y" (líneas 96-102):** ninguna de las cinco entradas afirma o implica un cierre absoluto de la posibilidad de devolución; todas describen acciones ("revisa", "corrige"), consistentes con el reencuadre.
- **FAQ (líneas 113-148):** ninguna de las cinco preguntas reintroduce la afirmación absoluta. La pregunta "¿Debo rectificar si no me depositaron?" (línea 143) es consistente con línea 74 (rectificatoria puede generar pago posterior).
- **`articleLead.limits` (líneas 40-42) y `covers` (líneas 36-39):** no contienen afirmaciones de cierre; sin conflicto.
- **Sección "Próximo ciclo (AT2027)" (línea 78):** declara correctamente que el SII "todavía no publica el calendario de la Operación Renta AT2027" — no hay fecha inventada, sin conflicto con la reformulación de línea 56.
- **`reviewPolicy.computedAt` (2026-05-06) y `pubDate` (2026-02-28):** campos de naturaleza distinta (cómputo de política de revisión y fecha de publicación original, respectivamente), sin relación con la afirmación "revisado el" del cuerpo ni con `updatedDate`/`validAsOf`. No generan contradicción de señal de frescura — mismo análisis que ronda 5, sin cambios.

**No se encontró ninguna otra contradicción interna de tipo MUST #8** además de la ya identificada y resuelta por el fix auditado en esta ronda. La única observación nueva de esta ronda es la tensión menor de redacción en el encabezado H2 de línea 58 (§7), que no alcanza el nivel de defecto.

**Observación de proceso (no defecto de contenido):** el hecho de que la contradicción original haya sobrevivido cinco rondas completas de `ComplianceAgent` — incluyendo rondas que le asignaron 9,5/10 a la dimensión "Respuesta ancla" sin detectarla — evidencia un punto ciego real en la metodología de estas rondas: la revisión de coherencia interna (MUST #8) no tuvo, hasta ahora, un paso de verificación explícito y sistemático equivalente al grep exhaustivo de fechas que sí se institucionalizó desde ronda 4. Se recomienda que futuras rondas de compliance incorporen, además del grep de fechas, un grep/lectura dirigida a lenguaje de cierre absoluto ("terminó", "ya no", "no hay más", "definitiv-") contrastado explícitamente contra las secciones de excepciones — el patrón que esta ronda usó en §4 y que el bot externo detectó donde cinco rondas humanas-simuladas no lo hicieron.

## 5. Trazabilidad del changelog (línea 168)

El bullet nuevo agregado en línea 168 documenta correctamente, per NORMA §5.3: qué cambió (reformulación de línea 56 y `articleLead.answer`), por qué (hallazgo del bot Codex en PR #423, MUST #8), y el alcance exacto (sin tocar tabla ni umbral). Es honesto y completo, en la misma línea que los bullets 165-167 evaluados por rondas anteriores.

La única observación es de forma, no de exactitud: la etiqueta "(ronda 4, ...)" es ambigua para un lector que no conozca que el changelog del artículo numera sesiones de `DraftAgent`, no rondas de `ComplianceAgent` (que ya lleva seis). Verificado contra `06-compliance-round4.md` y `06-compliance-round5.md` que esta es la convención ya establecida en los bullets anteriores del mismo changelog (línea 165 "ronda 2", línea 166 "ronda 3" también refieren a sesiones de `DraftAgent`, no de compliance) — por lo tanto **no es una inexactitud nueva de esta corrección**, sino una ambigüedad de nomenclatura preexistente en el propio formato del artículo. No se recomienda una corrección obligatoria (no es MUST), pero sí se sugiere, como mejora SHOULD para una futura sesión con permiso de edición, prefijar estas entradas como "DraftAgent ronda N" para evitar confusión con la numeración de `ComplianceAgent`.

## 6. Gates mecánicos

**`node scripts/check-frontmatter.mjs`:**

```
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

**`node scripts/check-editorial-timeliness.mjs`:**

```
[check-editorial-timeliness] published=53 stale=1 drift=0 report=output/validation/editorial-timeliness/report.json
[check-editorial-timeliness] FAIL:
- src/data/blog/impuesto-global-complementario-chile.md: review SLA expired on 2026-08-12 (90d cadence, sourceMode=manual_review).
```

El fallo no corresponde al artículo bajo auditoría (`devolucion-impuestos-fechas-compensaciones.md` no aparece en la lista de `stale`); es el mismo hallazgo preexistente y fuera de alcance que documentaron rondas 4 y 5.

## 7. Scorecard NORMA §7

| Dimensión | Peso | Nota | Justificación | Ponderado |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,5/10 | La contradicción MUST #8 que afectaba directamente la Respuesta Ancla (articleLead.answer y primera oración del cuerpo) queda resuelta y verificada en §1. Nota igual a la de rondas anteriores (9,5) porque el fix corrige el defecto sin alcanzar una redacción perfecta: la frase queda algo más densa (dos oraciones de matiz antes de "qué hacer hoy") y depende de una referencia hacia adelante ("detalle más abajo") que, aunque permitida por NORMA §2.3, añade una capa de lectura. No hay penalización adicional por el hecho de que la contradicción existiera sin detectarse en rondas anteriores — eso es una observación de proceso (§4), no una propiedad del texto actual. | 3,325 |
| Precisión + fuentes | 25% | 9,5/10 | Sin cambios respecto a ronda 5: umbral $3.000.000 y mecanismo de fuera de plazo permanecen intactos (§2); la reformulación no introduce ninguna cifra o afirmación nueva sin fuente — remite a contenido ya sourced (líneas 74, 76). | 2,375 |
| Vigencia + calendario | 15% | 10,0/10 | MUST #9 sigue cumplido: `updatedDate`, `validAsOf`, "revisado el" del cuerpo y changelog permanecen mutuamente coherentes tras el fix (§3, grep exhaustivo propio sin hallazgos). **MUST #8 (coherencia interna), foco central de esta ronda, ahora también verificado como cumplido** — no quedó ninguna afirmación de cierre absoluto en conflicto con las secciones de rectificatoria/regularización (§1, §4). | 1,500 |
| Excepciones + cobertura | 15% | 9,0/10 | Sin cambios: misma observación SHOULD de rondas 3-5 (deferral legítimo de multa/interés sin rango orientativo), no resuelta en esta ronda por no ser el foco del encargo. | 1,350 |
| Claridad + estructura | 10% | 9,0/10 | Sin cambios respecto a rondas anteriores en la nota; se agrega una observación menor nueva (§4): el encabezado H2 "Ciclo AT2026 cerrado: qué hacer hoy" (línea 58), leído de forma aislada, es menos preciso que el resto del artículo tras el fix — no constituye contradicción (el párrafo siguiente lo acota correctamente) pero es una tensión de redacción que una futura sesión podría suavizar (p.ej. "Calendario AT2026 cerrado: qué hacer hoy"). No se penaliza adicionalmente la nota porque no es un defecto nuevo de fondo, solo una precisión de forma ya cubierta por el contexto inmediato. | 0,900 |
| **Total** | | | | **9,450/10** |

**Relación score↔MUST:** con la contradicción de línea 56/`articleLead.answer` resuelta y verificada, no se detecta ningún MUST de NORMA §1.1 incumplido en esta ronda (MUST #8 y MUST #9 ambos cumplidos), y cero `TODO:SOURCE` remanentes (§3). El score total (9,450/10) permanece, sin embargo, bajo el umbral de 9,5/10 exigido por NORMA §7 para `PASS` puro — exactamente la misma cifra que ronda 5, porque las dos notas SHOULD que generan la brecha (Excepciones+cobertura 9,0; Claridad+estructura 9,0) no eran objeto del encargo de esta ronda y no cambiaron.

## 8. DEFECTS

- **Contradicción MUST #8 detectada por el bot Codex (PR #423):** RESUELTA — verificada en §1 con comparación línea por línea contra las secciones de rectificatoria (línea 74) y regularización (línea 76); sin residuo de lenguaje absoluto en todo el archivo (§3, §4).
- **DEFECT #1, #2 (ronda 1), DEFECT-NUEVO #1 (ronda 2), DEFECT #3 (ronda 3), DEFECT #4 (ronda 4):** sin evidencia de regresión; no fueron objeto de re-verificación exhaustiva en esta ronda (fuera del foco del encargo), pero la lectura completa del cuerpo (§1, §4) no encontró indicios de que alguno se haya reabierto.
- **Defectos nuevos de contenido encontrados en esta ronda:** ninguno.
- **Observaciones menores (no bloqueantes, no defectos NORMA):**
  1. Tensión de redacción en el encabezado H2 de línea 58 ("Ciclo AT2026 cerrado" sin calificador "ordinario"), leído de forma aislada — ver §4 y §7.
  2. Ambigüedad de nomenclatura preexistente en el changelog ("ronda N" = sesión de DraftAgent, no de ComplianceAgent) — ver §5. No es una inexactitud, mismo patrón que bullets anteriores del propio changelog.
  3. Imprecisión de lectura potencial preexistente (no nueva de esta ronda) en "última fecha del calendario ordinario de depósito y cheque" — ver §1.3.
- **Hallazgo de proceso — recurrente por segunda vez consecutiva:** el fix auditado por esta ronda existe solo en el árbol de trabajo, no está comprometido en un commit (`HEAD` = `2837802d` todavía contiene la afirmación absoluta pre-fix). Ronda 5 ya señaló esta misma condición para un fix anterior (que sí terminó comprometiéndose, según confirma esta ronda). Recomendación operativa reforzada: comprometer este fix específico antes de la firma humana, e idealmente antes de cualquier otra sesión que pueda tocar el árbol de trabajo.
- **Hallazgo de proceso — punto ciego metodológico:** ver nota al final de §4. La contradicción resuelta en esta ronda sobrevivió cinco rondas completas de compliance sin detectarse, incluidas rondas que calificaron "Respuesta ancla" en 9,5/10. Se recomienda incorporar a futuras rondas un paso explícito de grep/lectura dirigida a lenguaje de cierre absoluto contrastado contra las secciones de excepciones, no solo el grep de fechas ya institucionalizado desde ronda 4.

## 9. Separación de funciones (mapea las 6 rondas + etapas previas)

| Etapa | Agente / sesión |
|---|---|
| Auditoría original (ficha, TriageAgent) | ComplianceAgent adversarial, sesión previa 2026-08-12, `output/audits/corpus-2026-08-12/fichas/` |
| DraftAgent ronda 1 | DraftAgent, sesión `20260812-1420-lote0c` |
| ComplianceAgent ronda 1 (`06-compliance.md`, FAIL 8,75/10) | ComplianceAgent, sesión fresca, sin exposición al draft |
| DraftAgent ronda 2 (remediación DEFECT #1-2) | DraftAgent, sesión nueva, sin exposición a rondas previas |
| ComplianceAgent ronda 2 (`06-compliance-round2.md`, FAIL 8,875/10) | ComplianceAgent, sesión fresca |
| DraftAgent ronda 3 (investigación dedicada, umbral $3.000.000) | DraftAgent, sesión nueva, sin exposición a rondas previas |
| ComplianceAgent ronda 3 (`06-compliance-round3.md`, FAIL 9,075/10) | ComplianceAgent, sesión fresca |
| Remediación mecánica del fix de fechas #1 (post-ronda 3, Bucket C) | Sesión de orquestación/edición puntual, sin agente de draft dedicado |
| ComplianceAgent ronda 4 (`06-compliance-round4.md`, FAIL 9,000/10, DEFECT #4 fecha línea 56) | ComplianceAgent, sesión fresca |
| Remediación mecánica del fix de línea 56 (post-ronda 4, Bucket C) | Sesión de orquestación/edición puntual |
| ComplianceAgent ronda 5 (`06-compliance-round5.md`, CONDITIONAL 9,450/10) | ComplianceAgent, sesión fresca |
| Hallazgo del bot Codex (PR #423): contradicción MUST #8 en línea 56 | Revisor automático externo, no forma parte de la cadena DraftAgent/ComplianceAgent |
| DraftAgent ronda 4 (reformulación de línea 56 y `articleLead.answer`, motivada por el hallazgo del bot) | DraftAgent, sesión nueva, sin exposición a esta ronda de compliance |
| ComplianceAgent ronda 6 — este documento | ComplianceAgent, sesión fresca, sin exposición a ninguna sesión de draft ni a ninguna ronda de compliance previa más allá de la lectura de contexto de ronda 5 explícitamente autorizada |
| Firma de publicación | HumanEditor — pendiente |

**Sin violación de separación de funciones detectada.** Catorce etapas/sesiones distintas declaradas y consistentes entre sí (incluyendo el hallazgo del revisor automático externo, que no es ni DraftAgent ni ComplianceAgent), conforme a `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`. Esta sesión (ronda 6) no redactó ni editó el contenido del artículo, solo lo auditó — cumpliendo la prohibición de "draft y audit/comply en la misma sesión" para YMYL.

## 10. Veredicto final

**Status: CONDITIONAL**
**Veredicto: CONDITIONAL (9,450/10 — bajo el umbral NORMA §7 de 9,5/10 para `PASS` puro, pero sin ningún MUST de §1.1 incumplido, incluyendo MUST #8, foco central de esta ronda, y sin `TODO:SOURCE` remanente, confirmado con grep propio)**

Justificación: la contradicción interna real detectada por el bot Codex del PR #423 — la afirmación absoluta "el SII terminó de pagar las devoluciones de ese año tributario el 29 de mayo de 2026" en conflicto con las secciones de rectificatoria y regularización tardía del mismo artículo — **queda resuelta** por la reformulación de la línea 56 y de `articleLead.answer`. La verificación línea por línea (§1) confirma que la nueva redacción distingue correctamente "calendario ordinario" (cerrado) de "posibilidad de devolución de este año tributario" (no cerrada, vía rectificatoria o regularización), y que esa distinción es coherente con el resto del cuerpo, sin introducir imprecisión nueva de fondo. La tabla de fechas y el umbral de $3.000.000 permanecen intactos, confirmado mecánicamente vía `git diff HEAD` (§2). El grep exhaustivo propio de todas las fechas del archivo (§3) no encontró ninguna inconsistencia. La búsqueda dirigida de otras contradicciones internas similares (§4) no encontró ningún otro caso de lenguaje de cierre absoluto en conflicto con las excepciones documentadas; se identificó solo una tensión de redacción menor en un encabezado H2, no bloqueante.

No se alcanza `PASS` puro porque NORMA §7 exige ≥9,5/10 y el score total de esta ronda (9,450/10) —idéntico al de ronda 5— queda por debajo de ese umbral, por el arrastre de las mismas dos notas SHOULD no resueltas desde rondas anteriores (rango orientativo de multa/interés; ahora también la tensión de redacción del encabezado H2). Ninguna de las dos es un MUST bloqueante.

Quedan dos hallazgos de proceso fuera del scorecard: (1) el fix auditado en esta ronda existe en el árbol de trabajo pero no está comprometido en un commit — condición recurrente por segunda vez consecutiva, que debe resolverse antes de la firma humana; (2) la contradicción resuelta hoy sobrevivió cinco rondas completas de compliance sin ser detectada por ninguna de ellas, lo que evidencia un punto ciego metodológico (falta de un paso sistemático de verificación de lenguaje de cierre absoluto) que se recomienda incorporar a futuras rondas.

No se marcó ningún gate de `07-publish-packet.md`. No se editó `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` ni ningún archivo de contenido ni `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`. No se declara la pieza publicable — el veredicto de compliance no sustituye la firma humana, que sigue pendiente y separada.

Pendiente: (1) comprometer en un commit el fix de línea 56/`articleLead.answer` (ya presente en el árbol de trabajo, verificado en esta ronda); (2) decisión editorial sobre si las notas SHOULD pendientes ameritan una iteración adicional para alcanzar el umbral formal de 9,5/10, o si se acepta el `CONDITIONAL` actual como suficiente para pasar a firma humana, dado que ningún MUST bloqueante permanece abierto; (3) considerar, como mejora de proceso no bloqueante, incorporar a la metodología de compliance un paso de grep/lectura dirigida a lenguaje de cierre absoluto para prevenir que un defecto del mismo tipo vuelva a pasar cinco rondas sin detectarse; (4) firma humana.
