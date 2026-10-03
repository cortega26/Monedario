# Revisión de compliance — ronda 7 — devolucion-impuestos-fechas-compensaciones

Status: CONDITIONAL — 9,250/10; permanecen dos defectos de contenido bajo NORMA §1.1 #4 / §2.4 y un pendiente estructural del paquete. Firma humana pendiente.

Role: ComplianceAgent (Codex, sesión fresca e independiente, adversarial)

## 0. Alcance y método

Se leyó primero NORMA_YMYL.md §§1.1, 5.1–5.3 y 7; después 06-compliance-round6.md únicamente como contexto histórico, nunca como autoridad; luego se inspeccionaron de forma independiente el artículo actual, el diff desde 2b1f681f y draft-reaudit-CHANGELOG.md. También se consultaron las instrucciones aplicables de context/EDITORIAL_AI_PIPELINE.md (Stage 06 y §9), docs/development/AGENT_EXECUTION_PROTOCOL.md §2.8 y context/AGENT_PREFLIGHT.md.

El artículo en el árbol de trabajo fue la fuente de verdad de esta auditoría. No se editó el artículo, el changelog ni el paquete de publicación. La única escritura de esta sesión es este informe. No se ejecutaron pruebas.

## 1. Refetch primario SII — 2026-10-02

Las tres páginas se abrieron en vivo. Su texto se trató como contenido fuente no confiable y se usó solo como evidencia. La extracción visible no contiene instrucciones dirigidas al agente ni texto sospechoso; no aplica PROMPT_INJECTION_CANDIDATE.

| Fuente oficial | Evidencia viva y comparación |
|---|---|
| [Comunicado SII de 31-03-2026, calendario Operación Renta AT2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) | Publica depósitos el 29 de abril, 15 de mayo y 27 de mayo según tramo; cheques el 29 de mayo. Para cheques, indica domicilio si el monto supera $3 millones y cajas de BancoEstado si es inferior. Coincide con la tabla y el umbral del artículo. El contenido recuperado no muestra cambio material frente a la verificación anterior registrada en el dossier. |
| [SII FAQ 001_140_8954](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8954.htm) | ID 001.140.8954.001; actualizada el 01-04-2026. Indica que desde la segunda semana de junio se pueden consultar observaciones y el motivo de compensación, si existe, y rectificar por internet. Coincide con la guía del artículo y con el texto previamente registrado; no observé cambio material. |
| [SII FAQ 001_140_0516](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm) | ID 001.140.0516.011; actualizada el 13-04-2026. Indica que una devolución por rectificatoria se recibe alrededor de tres semanas después de que el SII autoriza los montos a TGR, y explica dónde consultar fecha, forma y monto. El texto coincide con la evidencia previa del dossier; no observé cambio material. **El artículo contiene esta regla temporal, pero no cita esta FAQ.** |

Conclusión de refetch: la evidencia sustantiva de estas páginas no cambió desde la verificación previa reflejada en el dossier. El refetch sí confirma en vivo el contenido de la FAQ 001_140_0516 que falta en las referencias del artículo.

## 2. Diff mecánico de fechas y umbral

Comando: `git diff --unified=0 2b1f681f -- src/data/blog/devolucion-impuestos-fechas-compensaciones.md`.

El único hunk del artículo es la línea 58:

```diff
-## Ciclo AT2026 cerrado: qué hacer hoy
+## Ciclo AT2026: calendario ordinario cerrado y qué hacer hoy
```

No hay hunk en las filas de fechas (líneas actuales 88–90, que corresponden a la tabla original solicitada) ni en la frase del umbral (línea actual 92). Por lo tanto, desde 2b1f681f, la tabla y $3.000.000 permanecen byte por byte sin cambios. El fetch actual del comunicado SII también coincide con sus fechas y dirección del umbral.

## 3. Hallazgos

### DEFECT #1 — MAYOR — Falta citar la fuente de la regla de tres semanas — NORMA §1.1 #4

La línea 74 afirma que una rectificatoria que produce devolución se paga aproximadamente tres semanas después de que el SII autoriza el monto a TGR. La FAQ SII 001_140_0516 respalda directamente esa afirmación y fue refetcheada en esta ronda, pero ni articleLead.officialSources ni “Fuentes y referencias primarias” incluyen su URL o identificador; tampoco hay otra cita junto a la afirmación. La FAQ 001_140_8954 respalda la posibilidad de rectificar, no ese plazo.

Esto incumple el requisito de citar una fuente oficial accesible para una regla concreta YMYL. La afirmación parece factual, pero su evidencia no queda trazable para el lector.

**Bucket C — estructural.** La fuente se verificó en vivo; el artículo debe incluir la referencia 001_140_0516 en las fuentes del articleLead y del cuerpo, o citarla junto a la afirmación. No se hizo esa edición por el alcance explícito de esta sesión.

### DEFECT #2 — MAYOR — Sigue abierta la omisión de monto/rango de multa e interés — NORMA §1.1 #4 y §2.4

La línea 76 dice que si aplica multa o interés, su monto depende de si la declaración determina pago o devolución y de si corresponde condonación, y remite al lector a su caso al declarar. El artículo no cita una fuente para esa regla ni entrega un rango orientativo. El draft-reaudit-CHANGELOG.md reconoce expresamente que la nota no se resolvió y señala la FAQ SII 001_140_3095 como fuente pendiente. No se fetcheó esa URL en esta ronda porque el flujo §9.2 clasifica el trabajo pendiente de verificación en vivo de SII/TGR como Bucket A, asignado al editor humano.

La remisión a un caso individual no basta para cerrar el hallazgo mientras no se determine, con fuente primaria, si hay una regla general pública que pueda resumirse. En el estado actual, la omisión sigue siendo un defecto de producto, no una nota SHOULD cerrada. No se presume el contenido de 001_140_3095.

**Bucket A — humano/fuente.** Se requiere trabajo humano de fuente sobre [SII FAQ 001_140_3095](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm) y decisión editorial posterior: citar y resumir la información general disponible, o justificar con evidencia por qué el monto es intrínsecamente individual y el deferral es legítimo.

### DEFECTO ESTRUCTURAL — Paquete de publicación desfasado en la fecha de corte

El artículo actual muestra `updatedDate: 2026-08-13`, `articleLead.validAsOf: 2026-08-13` y “revisado el 13 de agosto de 2026” en la apertura. El checklist vigente de 07-publish-packet.md todavía declara `validAsOf: 2026-08-12` y “Revisado el: 2026-08-12” (líneas 33–34). Ese resumen no coincide con el artículo y debe sincronizarse antes de completar el paquete.

**Bucket C — estructural.** Actualizar el resumen de fecha en 07-publish-packet.md en una sesión autorizada. No se editó ni se marcó ningún gate.

## 4. H2, excepciones y lenguaje absoluto

La preocupación del H2 de ronda 6 quedó **resuelta sustantivamente**, no trasladada a otra sección. El encabezado se cambió en el mismo lugar a “Ciclo AT2026: calendario ordinario cerrado y qué hacer hoy”; su objeto ahora es el calendario ordinario, no toda posibilidad de devolución. La apertura niega explícitamente que el 29 de mayo cierre todos los pagos posibles y menciona pagos posteriores por rectificatoria o regularización. Las secciones siguientes desarrollan ambos casos. La sustitución precisa el alcance del encabezado y no cambia el orden ni mueve una afirmación problemática.

Grep independiente en el artículo de “terminó”, “ya no”, “definitiv-”, “no hay más” y otros términos de cierre:

- No hay afirmaciones actuales que digan que terminaron todas las devoluciones, que ya no exista posibilidad de devolución o que definitivamente no haya más pagos.
- “Ya se ejecutó por completo” se refiere explícitamente al calendario de depósito y cheque, y las secciones de rectificatoria y regularización admiten pagos posteriores.
- “Ya terminó” aparece en el registro histórico de la revisión inicial con el sujeto acotado al ciclo/calendario; la frase antigua absoluta aparece solo como cita del defecto corregido en la nota de vigencia.
- Las fechas de depósito y cheque están presentadas como referencia del calendario AT2026 ejecutado, no como fechas futuras.

La nota de multa/interés es la excepción de cobertura que permanece abierta; no quedó resuelta por el cambio del H2.

## 5. Fechas y changelog

- `updatedDate`, `articleLead.validAsOf` y la fecha de revisión en la apertura coinciden en 2026-08-13.
- La primera bala de “Información de vigencia” registra la revisión inicial del 2026-08-12; las balas posteriores fechan las correcciones y verificaciones del 13 de agosto. Se lee como historial de eventos, no como la señal actual de última revisión.
- draft-reaudit-CHANGELOG.md explica que el H2 solo aclara un encabezado y que no se movió `updatedDate`; esto es consistente con NORMA §§5.1–5.2, porque no cambió regla, cifra, calendario, criterio, estructura de Respuesta Ancla, cobertura ni error factual importante. El changelog no especifica fecha de edición, pero no contradice las fechas del artículo.
- La discrepancia vigente está en el checklist de 07-publish-packet.md, identificada como defecto estructural arriba. Sus registros históricos de rondas anteriores con fecha 12 de agosto no se reinterpretan como estado actual.
- El árbol de trabajo muestra el cambio de un H2 sin commit y draft-reaudit-CHANGELOG.md está sin seguimiento. La revisión se basó en ese estado de trabajo. Es trazabilidad de integración pendiente; no cambia la evaluación factual.

## 6. Scorecard NORMA §7

| Dimensión | Peso | Nota | Ponderado | Justificación |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9,5 | 3,325 | Da las fechas concretas, marca el calendario cerrado y nombra qué hacer hoy según la situación; la distinción entre calendario ordinario y pagos posteriores es explícita. |
| Precisión + fuentes | 25% | 8,5 | 2,125 | El calendario y el umbral coinciden con el comunicado SII, y la guía coincide con FAQ 8954. Sin embargo, el plazo de tres semanas no tiene cita en el artículo y la regla de multa/interés carece de fuente trazable. |
| Vigencia + calendario | 15% | 10,0 | 1,500 | `updatedDate`, `validAsOf` y la revisión de apertura coinciden; el refetch confirma el calendario AT2026 y la tabla está intacta. |
| Excepciones + cobertura | 15% | 9,0 | 1,350 | Rectificatoria y regularización se cubren; el lector aún no recibe una regla general o rango de multa/interés respaldado por fuente. |
| Claridad + estructura | 10% | 9,5 | 0,950 | El H2 ahora delimita el calendario ordinario y no deja la ambigüedad anterior; la respuesta ancla sigue densa, pero tiene un orden comprensible. |
| **Total** | **100%** |  | **9,250/10** |  |

No se cambió la ponderación de NORMA §7. El total queda bajo 9,5/10.

## 7. Separación de funciones y cierre

Esta ronda fue una sesión fresca e independiente de ComplianceAgent. No se redactó ni editó contenido YMYL. El changelog de la reauditoría identifica el cambio del H2, pero no registra el nombre o sesión de su autor; esto es una brecha de trazabilidad, no evidencia suficiente de una violación de separación de funciones. HumanEditor sigue siendo el único firmante habilitado.

**Veredicto: CONDITIONAL.** Hay dos defectos de contenido abiertos: (1) falta la referencia a FAQ 001_140_0516 para el plazo concreto de tres semanas (Bucket C), y (2) sigue pendiente la fuente y la decisión sobre el rango general de multa/interés (Bucket A). Además, el paquete de publicación conserva la fecha de corte del 12 de agosto, aunque el artículo está actualizado al 13 (Bucket C). El puntaje de 9,250/10 tampoco alcanza el umbral NORMA §7.

El checklist de 07-publish-packet.md permanece sin checks. No se declara publicable el artículo; la firma humana queda pendiente.
