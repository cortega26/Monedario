# Compliance Review — RONDA 3 — devolucion-impuestos-fechas-compensaciones

Status: BLOCKED — nuevo defecto de coherencia interna encontrado (defecto de contenido de ronda 2 queda resuelto de forma defendible)
Role: ComplianceAgent (Claude Code — fresh session, adversarial), ronda 3, sin exposición a ninguna sesión de draft (ronda 1, ronda 2 ni ronda 3) ni a ninguna sesión de compliance previa (`06-compliance.md`, `06-compliance-round2.md`). Verifica específicamente la investigación de ronda 3 (DraftAgent) que intentó dirimir DEFECT-NUEVO #1 de `06-compliance-round2.md`.

## 0. Alcance de esta revisión

Se leyeron, en este orden: `docs/editorial/NORMA_YMYL.md`, `06-compliance-round2.md` (contexto — no autoridad), `02-dossier.md` completo (incluye secciones "Ronda 2" y "Ronda 3"), `04-draft.md` completo (incluye secciones "Ronda 2" y "Ronda 3"), `07-publish-packet.md` (sección "Ronda 3"), y el archivo publicado real `src/data/blog/devolucion-impuestos-fechas-compensaciones.md`.

**Todas las fuentes relevantes se refetchearon en vivo por este agente vía `curl` directo con user-agent de navegador sobre el HTML crudo** (no se confió en los resúmenes de `WebFetch` de ninguna ronda anterior): `https://www.sii.cl/portales/renta/2016/pagodevimpxcaja.html`, `https://www.sii.cl/noticias/2026/310326noti01pcr.htm`, `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8366.htm`, `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0595.htm`, `https://www.sii.cl/contribuyentes/p7renta.htm`, `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8951.htm`.

Ningún contenido fetcheado contenía instrucciones embebidas dirigidas al agente; no se encontró texto que ameritara la etiqueta `PROMPT_INJECTION_CANDIDATE`.

## 1. Verificación independiente de la resolución del umbral $3.000.000 (punto central de esta ronda)

### 1.1 Confirmación literal de las tres fuentes en conflicto/dirimentes

**Comunicado SII 31-03-2026** (refetch propio, HTML crudo):
> "Primera emisión solo devolución para personas naturales. Si el monto de la devolución es superior a $3 millones, el cheque se enviará al domicilio del contribuyente. Si es inferior a $3 millones, el cheque quedará disponible para pago en las cajas de BancoEstado."

**FAQ SII `001_140_8366.htm`** (refetch propio, HTML crudo; `ID: 001.140.8366.009`, creada 01/02/2023, actualizada 14/04/2026):
> "1. No ingresó una cuenta bancaria, los datos fueron ingresados erróneamente o ingresó una Cuenta Rut que no ha sido activada en el Banco. Ante esta situación, si es persona natural y corresponde a la primera emisión, debe corroborar el monto de su devolución... Si el monto de la devolución es menor a $3 millones, el cheque se enviará al domicilio del contribuyente. Si el monto de la devolución es superior a $3 millones, el cheque quedará disponible para pago en las cajas de BancoEstado."

Confirmado: la contradicción es real, literal y exacta, invertida en ambos sentidos — coincide con lo reportado por ronda 2 y ronda 3.

**Página SII `pagodevimpxcaja.html` (AT2016)**, citada por ronda 3 como fuente dirimente (refetch propio, HTML crudo):
> "Requisitos para devolución pago por Caja en Banco: No indicar cuenta corriente, de ahorro a plazo a la vista o cuenta Rut. Tener una devolución igual o inferior a $3.000.000."
> "Lugares de cobro de devoluciones y montos: Sucursales Serviestado Hasta $1.500.000.- Sucursales BancoEstado Hasta $3.000.000.-"

Confirmado verbatim lo que ronda 3 reportó.

### 1.2 Hallazgo propio que refuerza la resolución de ronda 3 (no estaba en su dossier)

Ronda 3 justificó el uso de la página 2016 solo por "coincidencia de cifra" ($3.000.000 en ambas). Mi refetch encuentra algo más fuerte: la condición que abre el párrafo del umbral en la FAQ 8366 — *"No ingresó una cuenta bancaria, los datos fueron ingresados erróneamente o ingresó una Cuenta Rut que no ha sido activada... si es persona natural y corresponde a la primera emisión"* — es **la misma población, literalmente**, que el requisito de la página 2016: *"No indicar cuenta corriente, de ahorro a plazo a la vista o cuenta Rut"*. No es una analogía de cifra suelta: la página de 2016 describe la versión anterior de la **misma regla** que ambas fuentes de AT2026 (comunicado y FAQ 8366) están describiendo — mismo colectivo de contribuyentes (sin cuenta bancaria válida), mismo umbral de $3.000.000, mismo mecanismo de "caja BancoEstado vs. otra vía". Esto es evidencia más sólida que la que ronda 3 documentó, y refuerza su conclusión.

### 1.3 Lectura alternativa considerada y descartada

Se evaluó explícitamente si la dirección de la FAQ 8366 podría reflejar una política real distinta: que montos **mayores** requieran retiro presencial en sucursal por verificación de identidad/antifraude (control razonable para pagos grandes), mientras que montos menores se envían por correo sin riesgo. Esta lectura queda descartada por el propio texto de la página 2016: *"Lugares de cobro de devoluciones y montos: ... Sucursales BancoEstado Hasta $3.000.000."* Esa frase está fraseada como **techo de desembolso de la sucursal** (un límite operativo de cuánto puede pagar la caja), no como un piso de verificación de identidad. Bajo la lectura de la FAQ 8366, se le pediría a la caja pagar montos que superan su propio techo declarado — mecánicamente inconsistente. La lectura del comunicado es la única compatible con un techo de desembolso declarado explícitamente por el propio SII, en dos fuentes (2016 y, indirectamente, en el mismo umbral repetido en 2026).

### 1.4 Evaluación de sesgo de confirmación

Se buscó explícitamente evidencia de que ronda 3 hubiera "buscado hasta encontrar algo que confirmara lo ya publicado" sin rigor. **No se encontró ese patrón — al contrario:** ronda 3 encontró un resumen de búsqueda sobre tgr.cl cuya dirección **coincidía con el comunicado** (la conclusión que ronda 3 terminaría adoptando), y **lo descartó explícitamente** por no poder verificarlo con fetch propio (la URL da 404, el subdominio `ayuda.tgr.cl` no resuelve por DNS). Un investigador motivado por confirmar lo ya publicado se habría quedado con esa cita, que jugaba a su favor. Descartarla es el comportamiento opuesto al sesgo de confirmación. Combinado con el hecho de que el argumento decisivo (el tope operativo de $3.000.000 de la caja BancoEstado) es una restricción estructural independiente — no circular, no elegida porque "ya sabíamos la respuesta" — concluyo que la resolución de ronda 3 es honesta y metodológicamente defendible, reforzada por mi verificación independiente y por el hallazgo adicional de §1.2.

**Veredicto de este punto: la resolución del umbral $3.000.000 queda confirmada independientemente.** No se declara como DEFECT (no se exige reformulación sin dirección numérica) porque la evidencia mecánica, verificada dos veces de forma independiente, es sólida — con la reserva honesta, ya reconocida también por ronda 3, de que la fuente decisiva (`pagodevimpxcaja.html`) es de 2016 y no existe una tercera fuente vigente para AT2026 que confirme con certeza absoluta. Esa reserva se refleja en el scorecard (§4), no como bloqueo del punto.

### 1.5 Verificación de coherencia del artículo publicado con la resolución

Línea 92 del blog file: *"Cheques sobre $3.000.000 se envían al domicilio registrado en el SII; los de menor monto se retiran en BancoEstado."* — coincide exactamente con la dirección del comunicado (superior → domicilio, inferior → BancoEstado), la fuente que ronda 3 concluyó correcta. **Coherente.**

Línea 155 ("Fuentes y referencias primarias"): *"SII FAQ, por qué no llegó la devolución con declaración aceptada (retenciones y datos bancarios; se cita solo para ese contenido, no para el umbral de $3.000.000 domicilio/BancoEstado, ver nota de vigencia)"* — la nota de alcance es explícita e inequívoca; no queda ambigüedad de que 8366 respalde el umbral. Ítem de `articleLead.officialSources` (línea 34) usa el mismo criterio: la etiqueta ("retenciones y datos bancarios") nunca menciona el umbral, por lo que tampoco genera ambigüedad ahí. **Verificado: correctamente acotada.**

## 2. Re-verificación de hallazgos ya cerrados en rondas anteriores

- **R5 (exactitud del calendario) — no aplica reauditoría, `requires_calculation: false` confirmado directamente en `01-brief.yaml` línea 4.** Consistente con la ausencia de `05-math-audit.md`. Las cifras del calendario (29 abril / 15 mayo / 27 mayo, cheques 29 mayo) no fueron tocadas por ninguna ronda; el único punto en duda era la dirección del umbral $3.000.000, resuelto en §1.
- **R2 (vigencia, cerrado en ronda 1) — sigue cerrado.** El cuerpo publicado declara el cierre del ciclo AT2026 en la primera pantalla ("Estado del ciclo AT2026... ya cerró") y en `articleLead.answer`; no se detectó regresión a lenguaje de presente/futuro inmediato en ninguna sección.
- **DEFECT #1 original (ronda 1, mecanismo de declarar fuera de plazo sin fuente) — sigue resuelto.** Refetch propio de `001_140_0595.htm` y `p7renta.htm` reproduce exactamente las citas literales que ronda 2 y `06-compliance-round2.md` reportaron: *"Los contribuyentes que no han presentado Declaraciones de Renta de años anteriores pueden regularizar su situación... opción Declarar renta (F22)"* (0595) y *"Si usted no declaró rentas y estaba obligado a hacerlo, será citado... Para regularizar esta situación, debe presentar su declaración... Declarar Renta (F22)... generará multas e intereses"* (p7renta). El cuerpo del artículo (línea 76) condiciona correctamente la afirmación a "si estabas obligado a declarar" y no extiende ninguna fuente más allá de lo que dice literalmente. **Confirmado.**
- **DEFECT #2 original (ronda 1, cita duplicada mal etiquetada) — sigue resuelto.** Refetch propio de `001_140_8951.htm` confirma que su contenido es exclusivamente el calendario de fechas (sin mención a retenciones/datos bancarios). `grep` sobre el blog file confirma una única ocurrencia de "8951" en "Fuentes y referencias primarias" (línea 153), correctamente etiquetada. No hay duplicado. **Confirmado.**

## 3. Defecto nuevo encontrado en esta ronda: coherencia interna de fechas de vigencia (NORMA MUST 9 / §6.5)

`06-compliance-round2.md` §4bis dejó abierta, sin resolver, la pregunta de si la remediación de ronda 2 (que corrigió un defecto MAJOR bloqueante: una afirmación sin fuente en la propia Respuesta Ancla) debía disparar el movimiento de `updatedDate`/`validAsOf`/"Revisado el" bajo NORMA §5.1 ("corrección de error importante"). Ronda 3 declinó explícitamente cerrar ese punto (`02-dossier.md`, sección "Ronda 3": *"esta ronda no lo cierra porque no le corresponde"*). Esta sería la tercera ronda consecutiva en dejarlo abierto si también lo defiero — lo resuelvo aquí en lugar de repetir el patrón.

**Análisis:** el blog file publicado muestra, en "Información de vigencia":

- `updatedDate` (frontmatter): `2026-08-12T00:00:00Z`
- `articleLead.validAsOf`: `2026-08-12`
- "Revisado el: 2026-08-12" (primera línea de la sección, cuerpo)
- seguido inmediatamente por dos bullets fechados explícitamente "13 de agosto de 2026" (correcciones de ronda 2 y ronda 3)

NORMA §5.1 lista como disparador de `updatedDate` la "corrección de error importante". La remediación de ronda 2 no corrigió un dato numérico, pero sí corrigió un **MUST 4 incumplido** (una afirmación en `articleLead.answer` — el texto que NORMA exige como respuesta concreta de primera pantalla — sin ninguna fuente oficial citada, defecto que bloqueó la publicación en ronda 1 con FAIL 8,75/10). Eso no encaja en la lista de exclusión de §5.2 ("cambios de estilo... ajustes de interlinks... reordenamiento sin contenido nuevo... para que se vea fresco") bajo ninguna lectura razonable: es contenido nuevo (dos fuentes nuevas) que resuelve un incumplimiento de un MUST bloqueante en la sección más visible del artículo. Mi juicio, aplicado de forma independiente en esta ronda: **sí calza como "corrección de error importante"** y debió mover las tres fechas a 2026-08-13.

El resultado visible para el lector es una inconsistencia interna: la línea que declara "Revisado el: 2026-08-12" convive, en la misma sección, con dos entradas fechadas un día después que documentan cambios reales al contenido. Esto es exactamente el tipo de incoherencia que NORMA MUST 8 ("no puede haber contradicciones entre secciones") y el checklist §6.5 ("'Ultima revisión' y `updatedDate` coherentes") buscan prevenir — aquí no hay contradicción de datos tributarios, pero sí una señal de frescura que no coincide con su propio registro de cambios, visible en la misma pantalla.

**DEFECT #3 (ronda 3 compliance) — MENOR — Fecha "Revisado el"/`updatedDate`/`validAsOf` desalineada con los bullets de corrección fechados un día después, dentro de la misma sección "Información de vigencia".**

- Naturaleza: incoherencia de señal de frescura (MUST 9 / checklist §6.5), no error de contenido tributario. No cambia ningún dato mostrado al lector sobre plazos, montos o mecanismos.
- Por qué no es Bucket B: no requiere investigación externa nueva — es una corrección mecánica de tres campos de fecha (o, alternativamente, un ajuste de redacción de la sección para no tener una fecha "ancla" que compita con el registro de cambios). Resoluble en Bucket C por cualquier sesión futura con autorización para tocar el blog file (esta sesión de compliance tiene prohibido editarlo).
- Recomendación operativa: mover `updatedDate` y `articleLead.validAsOf` a `2026-08-13`, y "Revisado el" a `13 de agosto de 2026` — o, si se prefiere no mover la fecha "ancla" original, reestructurar la sección para que no presente un "Revisado el" único que aparente ser la fecha de la última acción, cuando el propio log de bullets contradice esa lectura. Registrar el cambio en backlog per NORMA §5.3.

## 4. Scorecard NORMA §7

Aplicado con juicio propio (no se copian mecánicamente los números de rondas anteriores; donde coincido con el juicio previo lo digo explícitamente y por qué).

| Dimensión | Peso | Nota | Justificación | Ponderado |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,5/10 | Coincido con rondas 1-2 tras lectura propia del cuerpo: respuesta concreta en primera pantalla (`articleLead.answer` + primer párrafo), sin meta-proceso, condicionada correctamente donde corresponde. Sin cambios de ronda 3. | 3,325 |
| Precisión + fuentes | 25% | 9,5/10 | DEFECT-NUEVO #1 (ronda 2) queda resuelto de forma defendible y verificado de forma independiente en §1, con evidencia adicional propia (§1.2) y una lectura alternativa explícitamente descartada (§1.3). Cita de 8366 correctamente acotada (§1.5). No sube a 10 porque la fuente decisiva es de 2016 (sin confirmación de una tercera fuente vigente AT2026 que dirima con certeza absoluta) — reserva honesta, no un defecto bloqueante. | 2,375 |
| Vigencia + calendario | 15% | 7,5/10 | MUST 9 incumplido (DEFECT #3, §3): "Revisado el"/`updatedDate`/`validAsOf` (12 de agosto) desalineados con dos bullets de corrección real fechados 13 de agosto en la misma sección. Es una incoherencia de señal de frescura, no un error de contenido tributario — de ahí que no baje más. | 1,125 |
| Excepciones + cobertura | 15% | 9,0/10 | Lectura propia confirma cobertura amplia: 3 escenarios en "qué hacer hoy", 5 en "si te pasa X", 6 en "errores que retrasan el pago", 5 FAQ. No llega a 10 porque el deferral de multa/interés por fuera de plazo (legítimo por §2.4) deja al lector sin ningún rango orientativo, y no hay un árbol de decisión visual formal. | 1,350 |
| Claridad + estructura | 10% | 9,0/10 | Jerarquía H2 lógica y completa. Resta puntos el encabezado genérico "Si te pasa X, haz Y" (no descriptivo, desentona con el resto de headings) — observación de forma menor. | 0,900 |
| **Total** | | | | **9,075/10** |

**Relación score↔MUST:** el score cae por debajo de 9,5 por dos causas distintas: (a) el MUST 9 incumplido identificado en §3 (no arbitrario — nombrado, con fix mecánico concreto), y (b) que ninguna ronda ha llevado "Excepciones + cobertura" ni "Claridad + estructura" a 9,5, algo que esta ronda confirma con lectura propia (no arrastrado sin verificar) en vez de reabrir sin base. NORMA §1.1 exige "TODOS los MUST" cumplidos — el MUST 9 no se cumple hoy, por lo que el artículo no califica como "9,5/10" incluso antes de mirar la aritmética de §7; la aritmética (9,075/10) es consistente con esa conclusión, no contradictoria.

## 5. DEFECTS

- **DEFECT #1 (ronda 1):** RESUELTO — reverificado independientemente en §2.
- **DEFECT #2 (ronda 1):** RESUELTO — reverificado independientemente en §2.
- **DEFECT-NUEVO #1 (ronda 2, umbral $3.000.000):** RESUELTO de forma defendible — verificado independientemente en §1, con evidencia adicional propia y lectura alternativa descartada explícitamente. No requiere otra ronda de investigación.
- **DEFECT #3 (nuevo, esta ronda) — MENOR — Incoherencia de fechas de vigencia (MUST 9 / §6.5):** ver §3. Recomendación: mover `updatedDate`/`validAsOf`/"Revisado el" a 2026-08-13, o reestructurar la sección "Información de vigencia" para eliminar la aparente contradicción entre la fecha ancla y el log de bullets. Resoluble en Bucket C (edición mecánica, sin investigación externa nueva).

## 6. Separación de funciones (mapea las 4 rondas + esta sesión)

| Etapa | Agente / sesión |
|---|---|
| Auditoría original (ficha, TriageAgent) | ComplianceAgent adversarial, sesión previa 2026-08-12, `output/audits/corpus-2026-08-12/fichas/` |
| DraftAgent ronda 1 (`01-brief.yaml` … `04-draft.md`, blog file, `07-publish-packet.md` v1) | DraftAgent, sesión `20260812-1420-lote0c` |
| ComplianceAgent ronda 1 (`06-compliance.md`, FAIL 8,75/10) | ComplianceAgent, sesión fresca `06-compliance-fresh-20260812`, sin exposición al draft |
| DraftAgent ronda 2 (remediación DEFECT #1-2) | DraftAgent, sesión nueva 2026-08-13, sin exposición al draft de ronda 1 ni a `06-compliance.md` |
| ComplianceAgent ronda 2 (`06-compliance-round2.md`, FAIL 8,875/10, encuentra DEFECT-NUEVO #1) | ComplianceAgent, sesión fresca `06-compliance-round2`, sin exposición a ninguna sesión de draft ni a `06-compliance.md` |
| DraftAgent ronda 3 (investigación dedicada, dirime umbral $3.000.000, sin cambio de contenido) | DraftAgent, sesión nueva 2026-08-13, sin exposición a rondas de draft/compliance previas |
| ComplianceAgent ronda 3 (este documento) | ComplianceAgent, sesión fresca, sin exposición a ninguna sesión de draft ni de compliance previa |
| Firma de publicación | HumanEditor — pendiente |

**Sin violación de separación de funciones detectada.** Ocho roles/sesiones distintos declarados y consistentes entre sí, conforme a `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.

## 7. Veredicto final

**Status: BLOCKED**
**Veredicto: FAIL (9,075/10 — bajo el umbral NORMA §7 "< 9,5 no se publica"; MUST 9 incumplido según §3)**

Justificación: la investigación de ronda 3 sobre el umbral de $3.000.000 (DEFECT-NUEVO #1 de `06-compliance-round2.md`) es honesta, metodológicamente rigurosa y queda **confirmada de forma independiente** por este agente, con evidencia adicional propia que refuerza la conclusión (mismo colectivo de contribuyentes descrito en la página 2016 y en la FAQ 8366) y con una lectura alternativa explícitamente considerada y descartada. No hay indicios de sesgo de confirmación — al contrario, ronda 3 descartó una fuente (tgr.cl) que coincidía con su propia conclusión precisamente porque no pudo verificarla, comportamiento opuesto al de un investigador motivado a confirmar lo ya publicado. Los tres hallazgos previamente cerrados (DEFECT #1, DEFECT #2 de ronda 1; R2 vigencia) siguen cerrados, reverificados con refetch propio.

Sin embargo, esta ronda identifica un defecto nuevo y nombrado: la sección "Información de vigencia" del blog file muestra `updatedDate`/`validAsOf`/"Revisado el" fijados en 12 de agosto de 2026 mientras dos bullets en la misma sección documentan correcciones reales fechadas 13 de agosto de 2026 — incluida la corrección de ronda 2, que resolvió un incumplimiento de MUST 4 (afirmación sin fuente) en la propia Respuesta Ancla del artículo. Bajo NORMA §5.1 ("corrección de error importante"), esa remediación debió mover las tres fechas; no haberlo hecho deja una incoherencia interna visible al lector en la misma pantalla (MUST 9 / checklist §6.5). Esta pregunta quedó abierta por `06-compliance-round2.md` §4bis y declinada explícitamente por ronda 3; esta ronda la resuelve en lugar de diferirla una tercera vez.

El score ponderado (9,075/10) queda por debajo del umbral NORMA §7, consistente con el MUST 9 incumplido. El defecto es menor en impacto (no afecta ningún dato tributario mostrado al lector) y resoluble mecánicamente (mover tres fechas o reestructurar la sección), sin requerir investigación externa adicional — no amerita otro run de Bucket B como el de ronda 3, sino una edición puntual de Bucket C.

No se marcó ningún gate de `07-publish-packet.md`. No se editó `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` ni `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`. No se declara la pieza publicable ni se cierra ningún SLA.

Pendiente: (1) corrección mecánica de las fechas de vigencia (DEFECT #3, Bucket C); (2) firma humana.
