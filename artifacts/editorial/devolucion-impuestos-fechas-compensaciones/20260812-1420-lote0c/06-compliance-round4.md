# Compliance Review — RONDA 4 — devolucion-impuestos-fechas-compensaciones

Status: BLOCKED — el fix de fechas que motivó esta ronda quedó **parcialmente aplicado**: `updatedDate`/`articleLead.validAsOf`/registro de vigencia sí se movieron a 2026-08-13, pero el cuerpo del artículo conserva una fecha de "revisado el" distinta (12 de agosto) en su primera oración, la cual además queda visualmente contradicha en la página publicada por el badge "Revisado el {updatedDate}" que el layout renderiza a partir del frontmatter. MUST 9 (NORMA §1.1) sigue incumplido — en una ubicación nueva y más visible que la que cerró ronda 3.

Role: ComplianceAgent (Claude Code — fresh session, adversarial), ronda 4, sin exposición a ninguna sesión de draft (rondas 1-3) ni a ninguna sesión de compliance previa (`06-compliance.md`, `06-compliance-round2.md`, `06-compliance-round3.md`). Tarea específica de esta ronda: verificar de forma independiente que el fix de fechas descrito en `06-compliance-round3.md` §3/§7 (mover `updatedDate` y `articleLead.validAsOf` de 2026-08-12 a 2026-08-13, aplicado fuera de una ronda de compliance dedicada) se ejecutó correctamente, re-verificar brevemente los hallazgos cerrados en rondas 1-3, y buscar defectos nuevos no cubiertos antes.

## 0. Alcance de esta revisión

Se leyeron, en este orden: `docs/editorial/NORMA_YMYL.md`, `06-compliance-round3.md` (contexto — no autoridad, específicamente el DEFECT #3 de desfase de fechas), y el archivo publicado real `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` completo (fuente de verdad).

Adicionalmente, para la re-verificación independiente exigida en el encargo (no limitarse a leer reportes previos), se refetchearon en vivo vía `WebFetch`: `https://www.sii.cl/noticias/2026/310326noti01pcr.htm` (umbral $3.000.000), `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0595.htm` y `https://www.sii.cl/contribuyentes/p7renta.htm` (mecanismo de declarar fuera de plazo). Se inspeccionó también `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md` (solo lectura, sin editar — la prohibición de esta ronda es explícita) para confirmar que el registro NORMA §5.3 del fix de fechas existe también en el backlog, y se leyó el código fuente de los gates mecánicos (`scripts/check-frontmatter.mjs`, `scripts/check-editorial-timeliness.mjs`) y del layout de renderizado (`src/layouts/PostDetails.astro`) para entender qué cubren y qué no.

Ningún contenido fetcheado contenía instrucciones embebidas dirigidas al agente; no se encontró texto que ameritara la etiqueta `PROMPT_INJECTION_CANDIDATE`.

## 1. Verificación del fix de fechas (punto central de esta ronda)

### 1.1 Frontmatter y `articleLead`

- Línea 8: `updatedDate: 2026-08-13T00:00:00Z` — **confirmado, 2026-08-13.**
- Línea 24: `articleLead.validAsOf: 2026-08-13` — **confirmado, 2026-08-13.**

Ambos campos quedaron correctamente movidos desde 2026-08-12. Esta parte del fix reportado por ronda 3 está bien ejecutada.

### 1.2 Bullet NORMA §5.3 en "Información de vigencia"

Línea 167:

> "Registro NORMA §5.3 (actualización de fechas de vigencia, 13 de agosto de 2026): `updatedDate` y `articleLead.validAsOf` se movieron de 2026-08-12 a 2026-08-13 porque la corrección de ronda 2 (se agregó fuente oficial — SII FAQ 001_140_0595 y https://www.sii.cl/contribuyentes/p7renta.htm — para la afirmación 'aún puedes declarar fuera de plazo', que antes no tenía cita) resolvió un defecto MUST #4 (afirmación sin fuente en la Respuesta Ancla) encontrado por ComplianceAgent adversarial, lo que constituye 'corrección de error importante' bajo NORMA §5.1; la investigación posterior de ronda 3 confirmó además que el umbral de $3.000.000 ya publicado es correcto frente a una fuente SII contradictoria (FAQ 001_140_8366), sin cambio de esa cifra."

Evaluación de honestidad y completitud contra NORMA §5.3 ("qué cambió, por qué, fuente(s) que justifican"):

- **Qué cambió:** explícito — los dos campos de fecha, con valores origen/destino.
- **Por qué:** explícito — remite a la corrección sustantiva de ronda 2 (agregado de fuente a una afirmación sin cita) y la encuadra correctamente bajo NORMA §5.1 ("corrección de error importante"), no bajo ninguna de las exclusiones de §5.2.
- **Fuente(s):** cita las dos URLs agregadas en ronda 2 (001_140_0595, p7renta.htm) que motivaron el bump.
- No hay lenguaje evasivo ni se atribuye el cambio a otra causa distinta de la real. **El bullet es honesto y completo.**

Este bullet, leído junto con los tres bullets anteriores de la sección (líneas 164-166, cada uno fechado con la fecha real en que ocurrió el evento que describe: 12/08 para la revisión original, 13/08 para ronda 2 y ronda 3), forma un changelog internamente coherente: cada entrada del log está fechada correctamente según cuándo ocurrió el evento que documenta, y la entrada final (línea 167) explica por qué las fechas "ancla" del frontmatter se movieron. **Este objetivo puntual de la ronda 3 — resolver la incoherencia dentro de la sección "Información de vigencia" — está correctamente resuelto.**

### 1.3 Registro en el backlog (verificación cruzada, solo lectura)

`docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`, líneas 551-566, documenta el mismo fix ("**Fix de fechas (2026-08-13):** compliance de ronda 3 encontró que el fix de ronda 2 ... nunca movió `updatedDate` ni `articleLead.validAsOf` de 2026-08-12 — se corrigieron a 2026-08-13 con bullet de registro en 'Información de vigencia'") y declara que fue verificado por gates directos (`check:frontmatter` OK, `check:editorial-timeliness` ya no lista el artículo como stale, `format:check` OK), sin ronda de compliance dedicada. **Confirmado: el registro existe en ambos lugares (blog file y backlog) y es consistente entre sí.** No se editó este archivo.

### 1.4 DEFECTO NUEVO encontrado en esta ronda — el fix quedó incompleto

El fix descrito arriba movió los **campos de metadata** (`updatedDate`, `articleLead.validAsOf`) y el **changelog** ("Información de vigencia"), pero no tocó una tercera ubicación donde el artículo declara su propia fecha de revisión: la **primera oración del cuerpo**, línea 56:

> "**Estado del ciclo AT2026 (revisado el 12 de agosto de 2026): ya cerró.**"

Esta frase sigue en **12 de agosto**, sin actualizar. Verificado con `grep` sobre el archivo completo (no queda ninguna otra ocurrencia de "12 de agosto" salvo esta y el bullet histórico de línea 164, que es correcto porque describe un evento que sí ocurrió el 12 de agosto).

**Por qué esto es un defecto real y no un tecnicismo:**

1. **Es la primera pantalla.** MUST 1 (Respuesta Ancla en ≤ 2 pantallas) exige que la respuesta concreta esté en la sección clave inicial; esta frase es literalmente la primera oración del cuerpo, antes del primer H2. Cualquier señal de frescura inconsistente aquí es más visible para el lector que una inconsistencia en un changelog al final del artículo (el defecto que cerró ronda 3).
2. **Se contradice con algo que el lector efectivamente ve en la misma página.** `src/layouts/PostDetails.astro` líneas 462-468 renderiza, en la barra de autor: `{article.updatedDate && <span>Revisado el {formatMetadataDate(article.updatedDate, "long")}</span>}`. Con `updatedDate` ya en 2026-08-13, la página publicada mostrará **"Revisado el 13 de agosto de 2026"** en esa barra, mientras el primer párrafo del artículo dice **"revisado el 12 de agosto de 2026"**. Es una contradicción de fechas visible en la misma página renderizada al lector — exactamente el patrón que NORMA MUST 8 ("no puede haber contradicciones entre secciones") y MUST 9 ("`updatedDate` ... coincide con 'Última revisión'") buscan prevenir. No hay una sección con el título literal "Última revisión", pero el badge renderizado desde `updatedDate` cumple esa función, y el cuerpo lo contradice.
3. **No es una regresión de un hallazgo ya cerrado — es un punto ciego nuevo del propio fix de esta ronda.** Antes del fix (cuando `updatedDate` era 2026-08-12), esta frase era consistente con el frontmatter; se volvió stale precisamente *porque* el fix bump la fecha ancla sin propagar el cambio a esta ocurrencia del cuerpo. Ninguna ronda anterior señaló esta línea porque, en su momento, era correcta.
4. **Las gates mecánicas invocadas para "verificar" el fix no podían haberlo detectado.** Se inspeccionó el código de `scripts/check-frontmatter.mjs` y `scripts/check-editorial-timeliness.mjs`: ambos operan exclusivamente sobre campos de frontmatter (`updatedDate`, `articleLead.validAsOf`, `pubDate`); ninguno lee ni compara contra el `body` markdown. El backlog (línea 561-563) documenta que el fix se dio por verificado únicamente por estas gates ("no ameritaba una ronda adversarial adicional"). Esta ronda demuestra exactamente por qué esa conclusión fue prematura: hay una clase de defecto (coherencia entre metadata y prosa) que solo una revisión de lectura completa puede atrapar. Esto confirma la necesidad de la ronda 4 tal como fue encargada, en vez de cerrar el punto solo con gates.

**DEFECT #4 (ronda 4 compliance) — MENOR-MODERADO — Fecha "revisado el" en la primera oración del cuerpo (línea 56) desalineada con `updatedDate`/`articleLead.validAsOf`/badge "Revisado el" renderizado, tras el fix que corrigió las otras tres ubicaciones.**

- Naturaleza: incoherencia de señal de frescura (MUST 9, MUST 8), no error de contenido tributario. No cambia ningún dato mostrado al lector sobre plazos, montos o mecanismos — el calendario AT2026 y el umbral $3.000.000 permanecen correctos y sin tocar.
- Severidad relativa a DEFECT #3 (ronda 3, ya resuelto): comparable en naturaleza, pero en una ubicación más visible (primera oración del cuerpo vs. sección de changelog al final) y con una contradicción ahora confirmada contra un elemento efectivamente renderizado en la página (`PostDetails.astro`), no solo entre campos internos del frontmatter.
- Por qué es Bucket C: corrección mecánica de una fecha en una frase (cambiar "12" por "13" en la línea 56), sin investigación externa nueva. Resoluble por cualquier sesión futura con autorización para tocar el blog file — esta sesión de compliance tiene prohibido editarlo.
- Recomendación operativa: cambiar línea 56 de "(revisado el 12 de agosto de 2026)" a "(revisado el 13 de agosto de 2026)", y registrar el cambio en la sección "Información de vigencia" (bullet adicional o nota en el bullet existente de línea 167) per NORMA §5.3. Dado que este es ya el segundo fix incompleto de fechas en dos rondas consecutivas, se recomienda además que la próxima corrección incluya un `grep` de todas las ocurrencias de fecha en el archivo completo (frontmatter + cuerpo + changelog) antes de darse por cerrada, no solo los tres campos que motivaron el hallazgo anterior.

## 2. Re-verificación independiente de hallazgos cerrados en rondas 1-3

Se releyó el cuerpo publicado completo (no solo los reportes de rondas anteriores) y se refetchearon en vivo las fuentes SII decisivas.

- **Reencuadre de vigencia (R2, cerrado ronda 1) — sigue cerrado.** La primera pantalla declara el cierre del ciclo AT2026 sin fecha inventada para AT2027 ("El próximo ciclo (AT2027): a la fecha de esta revisión (agosto de 2026), el SII todavía no publica el calendario de la Operación Renta AT2027", línea 78). No se detectó regresión a lenguaje de presente/futuro inmediato en ninguna sección.
- **Cita del mecanismo de declarar fuera de plazo (001_140_0595.htm + p7renta.htm) — sigue cerrado, reverificado con fetch propio.** Refetch de `001_140_0595.htm`: *"Los contribuyentes que no han presentado Declaraciones de Renta de años anteriores **pueden** regularizar su situación... Servicios online... Declarar Renta (F22)"* — verbo permisivo confirmado ("pueden"), canal F22 confirmado. Refetch de `p7renta.htm`: *"Si usted no declaró rentas y **estaba obligado** a hacerlo, será citado... El hecho de no haber presentado su declaración dentro del plazo legal, generará multas e intereses"* — condición de obligatoriedad confirmada, mención de multas/intereses confirmada. Línea 76 del blog file condiciona correctamente la afirmación ("si estabas obligado a declarar... Si corresponde multa o interés, y su monto, depende de si tu declaración determina pago o devolución y de si aplica condonación — revisa tu caso específico al declarar") — coherente con ambas fuentes, sin sobre-extender ninguna. **Confirmado, sin cambios.**
- **Umbral $3.000.000 (dirimido ronda 3) — sigue cerrado, reverificado con fetch propio.** Refetch del comunicado SII 31-03-2026: *"Si el monto de la devolución es superior a $3 millones, el cheque se enviará al domicilio del contribuyente... Si es inferior a $3 millones, el cheque quedará disponible para pago en las cajas de BancoEstado."* Línea 92 del blog file ("Cheques sobre $3.000.000 se envían al domicilio registrado en el SII; los de menor monto se retiran en BancoEstado") coincide exactamente con esta dirección. Línea 155 mantiene la cita de FAQ 001_140_8366 acotada explícitamente a "retenciones y datos bancarios", no al umbral — sin ambigüedad. **Confirmado, sin cambios ni regresión respecto a lo verificado por ronda 3.**
- **DEFECT #1 y #2 originales (ronda 1) — no se reabrieron; no se encontró evidencia de regresión** en la lectura completa del archivo (cita del mecanismo de fuera de plazo sigue con fuente; no hay entradas duplicadas de "8951" en "Fuentes y referencias primarias" — verificado, aparece una sola vez en línea 153).

Ningún hallazgo previamente cerrado se reabrió.

## 3. Scorecard NORMA §7

| Dimensión | Peso | Nota | Justificación | Ponderado |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,5/10 | Sin cambios respecto a ronda 3: respuesta concreta en primera pantalla, sin meta-proceso, condicionada correctamente. El defecto de esta ronda (§1.4) es de coherencia de fecha, no de contenido de la respuesta ancla en sí. | 3,325 |
| Precisión + fuentes | 25% | 9,5/10 | Sin cambios: umbral $3.000.000 y mecanismo de fuera de plazo reverificados con fetch propio en esta ronda, ambos coherentes con el cuerpo publicado. | 2,375 |
| Vigencia + calendario | 15% | 7,0/10 | MUST 9 sigue incumplido (DEFECT #4, §1.4): la primera oración del cuerpo (línea 56) queda con fecha "revisado el 12 de agosto" desalineada de `updatedDate`/`validAsOf`/badge renderizado (13 de agosto). Es el mismo tipo de defecto que motivó esta ronda, resuelto en las tres ubicaciones que se buscaban corregir pero no en una cuarta que quedó fuera de foco. Nota ligeramente inferior a la de ronda 3 (7,5) porque la contradicción ahora es visible en la primera pantalla y contra un elemento efectivamente renderizado en la página, no solo entre campos de metadata. | 1,050 |
| Excepciones + cobertura | 15% | 9,0/10 | Sin cambios respecto a ronda 3: cobertura amplia (3 escenarios en "qué hacer hoy", 5 en "si te pasa X", 6 en "errores que retrasan el pago", 5 FAQ); deferral de multa/interés legítimo por §2.4 pero sin rango orientativo. | 1,350 |
| Claridad + estructura | 10% | 9,0/10 | Sin cambios: jerarquía H2 lógica; encabezado genérico "Si te pasa X, haz Y" sigue siendo la única observación menor de forma. | 0,900 |
| **Total** | | | | **9,000/10** |

**Relación score↔MUST:** el score cae por debajo de 9,5 por el MUST 9 incumplido (§1.4) — no arbitrario, nombrado, con fix mecánico concreto y de alcance mínimo. NORMA §1.1 exige "TODOS los MUST" cumplidos para calificar como "9,5/10"; eso no ocurre hoy. La caída de nota respecto a ronda 3 (9,075 → 9,000) es consistente con que el defecto persiste en una ubicación de mayor visibilidad (primera pantalla + contradicción contra un elemento renderizado), no una simple repetición del mismo hallazgo.

## 4. DEFECTS

- **DEFECT #1 (ronda 1):** RESUELTO — reverificado independientemente en §2.
- **DEFECT #2 (ronda 1):** RESUELTO — reverificado independientemente en §2.
- **DEFECT-NUEVO #1 (ronda 2, umbral $3.000.000):** RESUELTO — reverificado independientemente en §2 con fetch propio.
- **DEFECT #3 (ronda 3, desfase de fechas en "Información de vigencia"):** RESUELTO — verificado en §1.1-§1.2. `updatedDate`, `articleLead.validAsOf` y el changelog quedaron correctamente alineados a 2026-08-13.
- **DEFECT #4 (nuevo, esta ronda) — MENOR-MODERADO — Fecha "revisado el" en la primera oración del cuerpo (línea 56) sin actualizar tras el fix de fechas:** ver §1.4. Recomendación: cambiar "12" por "13" en línea 56 y registrar el ajuste en "Información de vigencia" per NORMA §5.3. Resoluble en Bucket C (edición mecánica de una fecha, sin investigación externa nueva).

## 5. Separación de funciones (mapea las rondas previas + esta sesión)

| Etapa | Agente / sesión |
|---|---|
| Auditoría original (ficha, TriageAgent) | ComplianceAgent adversarial, sesión previa 2026-08-12, `output/audits/corpus-2026-08-12/fichas/` |
| DraftAgent ronda 1 | DraftAgent, sesión `20260812-1420-lote0c` |
| ComplianceAgent ronda 1 (`06-compliance.md`, FAIL 8,75/10) | ComplianceAgent, sesión fresca, sin exposición al draft |
| DraftAgent ronda 2 (remediación DEFECT #1-2) | DraftAgent, sesión nueva 2026-08-13, sin exposición a rondas previas |
| ComplianceAgent ronda 2 (`06-compliance-round2.md`, FAIL 8,875/10, encuentra DEFECT-NUEVO #1) | ComplianceAgent, sesión fresca |
| DraftAgent ronda 3 (investigación dedicada, dirime umbral $3.000.000) | DraftAgent, sesión nueva 2026-08-13, sin exposición a rondas previas |
| ComplianceAgent ronda 3 (`06-compliance-round3.md`, FAIL 9,075/10, encuentra DEFECT #3 de fechas) | ComplianceAgent, sesión fresca |
| Remediación mecánica del fix de fechas (Bucket C, post-ronda 3) | Sesión de orquestación/edición puntual, sin agente de draft dedicado ni ronda de compliance dedicada — verificada solo por gates directos (`check:frontmatter`, `check:editorial-timeliness`, `format:check`), según `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md` líneas 551-566 |
| ComplianceAgent ronda 4 (este documento) | ComplianceAgent, sesión fresca, sin exposición a ninguna sesión de draft ni de compliance previa |
| Firma de publicación | HumanEditor — pendiente |

**Sin violación de separación de funciones detectada.** Nueve etapas/sesiones distintas declaradas y consistentes entre sí, conforme a `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`. Nota operativa (no una violación de separación de funciones, sino un hallazgo de proceso): la remediación mecánica del fix de fechas se dio por cerrada solo con gates automatizados, sin una ronda de compliance dedicada — esta ronda 4 demuestra que esa decisión fue prematura, porque las gates invocadas no tienen cobertura sobre coherencia de fechas en prosa del cuerpo (§1.4, punto 4). Esto no es un defecto de separación de funciones per se, pero sí una lección de proceso: un fix de fechas que toca múltiples ubicaciones del mismo archivo debería verificarse con lectura completa, no solo con gates de frontmatter, antes de declararse cerrado.

## 6. Veredicto final

**Status: BLOCKED**
**Veredicto: FAIL (9,000/10 — bajo el umbral NORMA §7 "< 9,5 no se publica"; MUST 9 incumplido según §1.4)**

Justificación: el fix de fechas que motivó esta ronda 4 se ejecutó **correctamente en tres de las cuatro ubicaciones** donde el artículo declara su fecha de revisión: `updatedDate` (frontmatter), `articleLead.validAsOf`, y el registro en la sección "Información de vigencia" (bullet NORMA §5.3, honesto y completo). Esta parte del encargo queda **verificada de forma independiente y confirmada**. Los tres hallazgos cerrados en rondas anteriores (cita del mecanismo de declarar fuera de plazo, reencuadre de vigencia R2, umbral de $3.000.000) fueron reverificados con fetch propio en vivo sobre las fuentes SII y siguen intactos, sin regresión.

Sin embargo, el fix dejó sin actualizar una **cuarta ubicación**: la primera oración del cuerpo del artículo (línea 56, "Estado del ciclo AT2026 (revisado el 12 de agosto de 2026): ya cerró"), que sigue fechada en 12 de agosto. Esto genera una contradicción visible en la página publicada, porque el layout (`src/layouts/PostDetails.astro`) renderiza un badge "Revisado el {updatedDate}" que ahora mostrará 13 de agosto, en la misma página donde el primer párrafo del cuerpo dice 12 de agosto. Es el mismo tipo de defecto que cerró ronda 3 (MUST 9, coherencia de señal de frescura), en una ubicación distinta que quedó fuera del alcance del fix aplicado, y en una posición más visible (primera pantalla) que la anterior. Las gates mecánicas que se usaron para dar por cerrado el fix (`check:frontmatter`, `check:editorial-timeliness`, `format:check`) no cubren coherencia entre metadata y prosa del cuerpo, por lo que no podían haber detectado este punto — de ahí el valor de esta ronda de compliance dedicada.

El defecto es menor-moderado en impacto (no afecta ningún dato tributario mostrado al lector: calendario AT2026 y umbral $3.000.000 permanecen correctos y sin tocar) y resoluble mecánicamente con un cambio de una fecha en una frase, sin requerir investigación externa adicional — Bucket C, no amerita otra ronda de investigación tipo Bucket B.

No se marcó ningún gate de `07-publish-packet.md`. No se editó `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` ni `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`. No se declara la pieza publicable ni se cierra ningún SLA.

Pendiente: (1) corrección mecánica de la fecha en línea 56 del blog file (DEFECT #4, Bucket C) — recomendado hacerlo junto con un `grep` de todas las ocurrencias de fecha en el archivo completo para evitar un quinto ciclo de fix parcial; (2) ronda de compliance de cierre (ronda 5) o verificación equivalente que confirme la corrección de línea 56 antes de considerar el punto cerrado, dado que dos rondas consecutivas de "fix mecánico sin ronda dedicada" han dejado defectos residuales; (3) firma humana.
