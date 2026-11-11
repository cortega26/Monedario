Status: DRAFT — pending ComplianceAgent review
Role: DraftAgent (Claude Code, sesión nueva, separada del auditor)

# Draft — corrección acotada del reajuste UTM

- Run id: `20261029-1500-utm-audit`
- Slug: `utm-chile-que-es-como-funciona`
- Plan: `docs/backlog/PLAN-utm-reajuste-copy-correction-2026-10-29.md`

> **Nota de lectura (añadida en la sexta pasada).** Este archivo es un registro histórico por pasadas. Las secciones anteriores a la «Quinta pasada» describen estados que ya fueron superados (por ejemplo, la tabla de septiembre «aproximada» de la primera pasada o afirmaciones que una pasada posterior corrigió) y **no son evidencia del texto actual**. La evidencia del estado final es el texto del commit auditado más las tablas de disposición de las pasadas quinta y sexta.
- Base: `d7418fc2d6cea9d7d4dfeab99c37e9f947d1f6ae` (sin commit)

## Archivos modificados

1. `src/data/blog/utm-chile-que-es-como-funciona.md`
2. `src/pages/calculadoras/conversor-utm.astro`
3. `src/data/glossary/utm.md`
4. `src/data/correcciones.json` (nueva entrada `utm-reajuste-mensual-copy`, 2026-10-29, primera de la lista; registros previos intactos)

## Formulación única aplicada

"La UTM se reajusta mensualmente de acuerdo con el IPC y el SII publica su valor para cada mes."

Respaldo (dossier, VERIFIED):
- SII, Diccionario básico tributario contable, entrada UTM — https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html — respalda la actualización de la UTM según el IPC (parafraseado en las páginas, sin cita literal).
- SII Educa, Tipos de impuestos en Chile — https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html — respalda el reajuste mensual según el IPC (parafraseado, sin cita literal).
- SII, UTM–UTA–IPC 2026 — https://www.sii.cl/valores_y_fechas/utm/utm2026.htm — tabla de valor por mes.

No se afirma día de vigencia (calendario/hábil) ni regla M−1/M−2. La Circular N.º 39 no se cita en las páginas (evidencia contextual, no regla). No se cita fuente SEO.

## Cambios por superficie

### Guía (`src/data/blog/utm-chile-que-es-como-funciona.md`)
- `updatedDate` 2026-09-18 → 2026-10-29; `articleLead.validAsOf` 2026-09-18 → 2026-10-29.
- `articleLead.answer`: "primer día hábil… IPC del mes anterior" → formulación única.
- `officialSources`: se agregan SII Diccionario y SII Educa.
- FAQ "¿Cuánto vale la UTM hoy?": "cambia el primer día hábil" → "cambia cada mes"; $71.721 rotulado "ejemplo histórico de septiembre 2026".
- FAQ "¿Cómo afecta el IPC…?": se retira "del mes anterior" y las subafirmaciones direccionales (IPC positivo/negativo); la respuesta queda como "La UTM se reajusta mensualmente de acuerdo con el IPC y el SII publica su valor para cada mes en su tabla oficial: sii.cl/valores_y_fechas/utm/utm2026.htm."
- Párrafo inicial, respuesta rápida ("Cómo cambia", "Valor de ejemplo (histórico, septiembre 2026)", "Vigencia: … no es el valor actual").
- Aviso "Información vigente al 2026-04-09" → "Contenido revisado el 2026-10-29. Los montos en pesos… son ejemplos históricos de septiembre 2026 (salvo los que indican otro período) y no se actualizaron en esta revisión."
- "¿Qué es la UTM?": "actualiza su valor el primer día hábil" → publica su valor cada mes + paráfrasis enlazada de SII Diccionario (actualización según IPC) y SII Educa (reajuste mensual); sin citas literales.
- "Cómo se reajusta la UTM": retirado "al comienzo de cada mes / mes anterior / mes pasado / al mes siguiente"; se remite a la tabla mensual SII. Se retiró la lista de subafirmaciones direccionales (IPC positivo/negativo/0%).
- Tabla UTM/UTA: "Primer día hábil de cada mes" → "Mensual, según el IPC".
- Tabla UTM/UF: "IPC del mes anterior" → "reajuste mensual según IPC".
- "Dónde ver el valor" y aviso: retirado "primer día hábil"; $71.721 "correspondiente a septiembre 2026".
- Resumen: retirado "primer día hábil" y "IPC del mes anterior"; la viñeta del IPC queda como "Se reajusta mensualmente de acuerdo con el IPC y el SII publica su valor para cada mes." (sin "sube con inflación, puede bajar con deflación").
- Fuentes: se agregan SII Diccionario y SII Educa.

### Conversor (`src/pages/calculadoras/conversor-utm.astro`)
- FAQ "¿Cuánto vale 1 UTM…?" y "¿Por qué cambia…?": formulación única.
- Explicación visible/sin JS y aviso ⚠️: retirado "primer día hábil" e "IPC del mes anterior".
- `MethodologyBlock.notes`: formulación única con referencia a SII Diccionario y SII Educa; `sources` agrega ambas URL (date "2026-10-29" = fecha de consulta).

### Glosario (`src/data/glossary/utm.md`)
- "¿Cómo se calcula?": formulación única, respaldada con enlaces al Diccionario básico tributario contable del SII y a SII Educa (sin citas literales), y enlace a la tabla SII.

### Registro (`src/data/correcciones.json`)
- `wrong[0]` precisado: el "primer día hábil" se atribuye solo a la guía y al conversor; la referencia al IPC del mes inmediatamente anterior, a las tres superficies.

## Pasada residual — frases direccionales (hallazgo de 05-math-audit)

Nueva sesión DraftAgent, posterior a 05-math-audit. Solo se retiran dos frases direccionales preexistentes que las fuentes del cambio no acreditan como regla general:

- Guía, sección "¿Qué es la UTM?": "un número de referencia que sube o baja con la inflación" → "un número de referencia que se reajusta mensualmente de acuerdo con el IPC y cuyo valor para cada mes publica el SII".
- Conversor, FAQ "¿Por qué cambia…?": "aunque su equivalente en pesos suba mes a mes" → "aunque su equivalente en pesos cambie con cada reajuste mensual".

Búsqueda de equivalentes en las tres superficies (sube/baja/aumenta/crece/disminuye/inflación/deflación/mes a mes): no se encontraron otras afirmaciones direccionales. Las menciones restantes ("reajustable mensualmente por inflación" en el glosario, "siguen la inflación" en la tabla UTM/UF) no indican dirección y se dejan sin cambios; el glosario no se modificó en esta pasada.

Sin cifras, fórmulas, reglas legales, citas literales, mes IPC específico ni día de vigencia añadidos. Esta pasada requiere nueva revisión MathAudit (diff) y ComplianceAgent. No se ejecutaron pruebas ni verificaciones automáticas en esta pasada.

## Sin cambios (para verificación MathAudit)
Fórmulas, cálculos, $71.721, $834.504, $69.542, tramos ISC, $11.265.804, $417.252, slugs, rutas, canonical, título/description SEO, snapshot y worker.

## Limitaciones
- No se ejecutaron tests ni `pnpm run check:correcciones` (fuera de alcance de esta sesión). Solo se validó que `correcciones.json` parsea como JSON.
- El tipo del campo `date` en `sources` de `MethodologyBlock` no se verificó; se usó string literal.
- `docs/backlog/README.md` ya aparecía modificado antes de esta sesión; no lo toqué.
- No se marcaron gates ni se editó 05/06/07. Sin autocertificación de cumplimiento.

## Pasada de corrección 2026-11-10 (DraftAgent) — respuesta a 06-compliance (FAIL)

Rol: DraftAgent. Claude Code, sesión nueva, `5781f981-67ac-4656-beba-a357f2001bc9` (ID registrado para trazabilidad de separación de funciones). Esta sesión no redactó el borrador original ni ejecutó MathAudit ni ComplianceAgent sobre esta pieza, y no lo hará. Fecha de consulta de todas las fuentes de abajo: 2026-11-10.

Nota de estado: 06-compliance.md (2026-10-29) es anterior a la remediación posterior (referencia al DL 830 y valor de octubre) y a esta pasada; evaluó un texto que ya no existe. No se editó 05, 06 ni 07 y no se marcó ninguna puerta.

### Evidencia recuperada (texto literal, URL y fecha de consulta 2026-11-10)

- **BCN, DL 830, art. cuarto transitorio** (`https://www.bcn.cl/leychile/consulta/obtxml?opt=7&idNorma=6374&idVersion=2025-07-11`): «A partir del mes de Abril de 1975, el monto de la unidad tributaria se reajustará mensualmente de acuerdo con el porcentaje de variación que experimente el índice de precios al consumidor en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad.»
- **SII, Diccionario básico tributario contable** (`https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html`): «Unidad Tributaria Mensual (UTM): Unidad definida en Chile que corresponde a un monto de dinero expresado en pesos y determinado por ley, el cual se actualiza en forma permanente por el Índice de Precios al Consumidor (IPC) y se utiliza como medida tributaria.»
- **SII Educa** (`https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html`): «La Unidad Tributaria Mensual (UTM) es una unidad económica que se utiliza para fines tributarios y se reajusta mensualmente de acuerdo al IPC.»
- **SII, tabla UTM–UTA–IPC 2026** (`https://www.sii.cl/valores_y_fechas/utm/utm2026.htm`): UTM de septiembre $71.721 (IPC de agosto 0,6 %), octubre $72.151, noviembre $72.440, diciembre $72.802. La razón octubre/septiembre (72.151 / 71.721 = 1,0060) coincide con el IPC de agosto de 0,6 %.
- **SII, tabla UTM–UTA–IPC 2025** (`https://www.sii.cl/valores_y_fechas/utm/utm2025.htm`): UTM de diciembre de 2025 $69.542; UTA $834.504.
- **SII, Impuesto Único de Segunda Categoría 2026** (`https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm`): la tabla mensual vigente en la página (UTM de diciembre, $72.802) tiene tramos de 13,5; 30; 50; 70; 90; 120 y 310 UTM (982.827; 2.184.060; 3.640.100; 5.096.140; 6.552.180; 8.736.240; 22.568.620) y tasas 4 %; 8 %; 13,5 %; 23 %; 30,4 %; 35 % y 40 %.
- **Banco Central de Chile, metodología de la UF** (`https://si3.bcentral.cl/estadisticas/Principal1/Metodologias/EMF/UF.pdf`): «el valor de la UF se reajusta a partir del día diez de cada mes y hasta el día nueve del mes siguiente, en forma diaria, de acuerdo a la variación experimentada por el Índice de Precios al Consumidor (IPC)».

### Verificación aritmética de los montos preexistentes (insumo para el MathAudit independiente)

| Monto en el artículo | Cálculo | Resultado |
|---|---|---|
| UTA $834.504 | 12 × $69.542 (UTM dic 2025); coincide con la tabla SII 2025 | OK |
| 13,5 UTA $11.265.804 | 13,5 × $834.504 | OK |
| APV 6 UTM $417.252 | 6 × $69.542 | OK |
| Umbral 13,5 UTM sept 2026 $968.233 | 13,5 × $71.721 = 968.233,5 (truncado en el texto) | OK, aproximado |
| Tramos sept 2026: 2.151.630; 3.586.050; 5.020.470; 6.454.890; 8.606.520; 22.233.510 | 30; 50; 70; 90; 120; 310 × $71.721 | OK |
| Tasas 4 / 8 / 13,5 / 23 / 30,4 / 35 / 40 % | coinciden con la tabla SII vigente | OK |
| Múltiplos de UTM de los tramos | coinciden con la tabla SII vigente (÷ 72.802) | OK |

Salvedad: la página del SII muestra solo el mes vigente de la tabla del impuesto, no septiembre; los montos de septiembre de la guía son múltiplos verificados × la UTM de septiembre verificada, no una copia de una fila del SII.

### Disposición de los defectos de 06-compliance

| # | Sev. | Disposición en esta pasada |
|---|---|---|
| 1 | BLOQUEANTE | **No resuelto (requiere re-auditoría).** Separación de funciones Research/MathAudit y IDs de sesión de Research, brief/outline, MathAudit y pasada residual: no recuperables desde esta sesión. Solo se registra el ID de esta pasada. |
| 2 | BLOQUEANTE | **Evidencia aportada**: textos literales de SII Diccionario, SII Educa y del DL 830 (arriba). La guía, el glosario y el conversor citan la norma; falta que el dossier 02 y el MathAudit independiente la incorporen. |
| 3 | BLOQUEANTE | **No resuelto (requiere re-auditoría).** Corresponde a una instancia independiente agregar a 05 la fila de la regla con su fuente literal. |
| 4 | MAYOR | **Corregido.** La FAQ «¿Cuánto vale la UTM hoy?» da la UTM de noviembre de 2026 ($72.440) con URL y fecha de consulta; el cuerpo muestra el valor del mes vigente con `[[utm \| clp]]` (snapshot, UTM con proveniencia SII) para que no se desactualice. Septiembre queda solo como ejemplo de cálculo. |
| 5 | MAYOR | **Verificado** (tabla anterior) y alcance explicitado: el aviso «Alcance de la revisión del 2026-11-10» dice qué se verificó y que los ejemplos conservan su período. Pendiente la certificación independiente en 05. |
| 6 | MAYOR | **Corregido.** `validAsOf` = 2026-11-10 = fecha del valor citado (UTM de noviembre) y de la consulta de fuentes; los ejemplos de septiembre están rotulados históricos. Se retiró el valor fijo del `articleLead.answer` (referencia al valor del mes vigente más abajo). |
| 7 | MENOR | **Corregido.** «siguen la inflación» → «se reajustan según el IPC, con mecanismos distintos»; la fila de la UF describe su mecanismo con la fuente del Banco Central (día 10 al 9, diario, según el IPC); glosario: «reajustable mensualmente por inflación» → «se reajusta mensualmente de acuerdo con el IPC». |
| 8 | MAYOR | **Corregido.** La entrada `utm-reajuste-mensual-copy` de `correcciones.json` cubre ahora las afirmaciones direccionales retiradas («sube o baja», «puede bajar o mantenerse», «suba mes a mes»), la contradicción del «mes anterior» con el DL 830 y la regla vigente. Verificado contra la versión de `main`. |
| 9 | BLOQUEANTE | **Parcialmente atendido; requiere nueva revisión.** Esta pasada ejecutó `check:correcciones`, build completo y tests (resultados en el PR) y deja el diff completo en el PR; la revisión de ComplianceAgent con acceso a ellos sigue pendiente. |
| 10 | MENOR | **Corregido.** Se añadió a `limits` la línea de que el artículo no fija el día del mes en que cambia el valor y que el SII publica el valor de cada mes; el cuerpo ya lo decía junto a la regla del DL 830. |

### Lo que sigue (no se hace en esta sesión)

1. MathAuditAgent independiente (sesión distinta de Research/brief): auditar el diff de esta pasada, la regla del DL 830 con su cita literal y la tabla de verificación anterior; registrar IDs de sesión.
2. ComplianceAgent en sesión limpia con acceso al diff completo, `check:correcciones` y el build.
3. HumanEditor: sign-off de `07-publish-packet.md`.

## Segunda pasada de corrección 2026-11-10 (DraftAgent) — respuesta al MathAudit 1 (FAIL)

Misma sesión DraftAgent de la pasada anterior (`5781f981-67ac-4656-beba-a357f2001bc9`). No audité ni evalué compliance de esta pieza.

**Aviso de alcance del MathAudit 1.** El informe `05-math-audit.md` (commit `7c71dca9`, guardado sin modificar) auditó el checkout local `2911b184` más archivos sin commit, es decir, el texto anterior a la primera pasada de hoy. Por eso tres de sus ocho ERROR describen texto que ya no existe en esta rama: la FAQ «hoy» con el valor de octubre, el marcador `[[utm | clp]]` «inexistente» y la entrada de correcciones desfasada. Hace falta un MathAudit 2 sobre el commit final de esta rama.

### Disposición de los 8 ERROR y 5 TODO:SOURCE

| Hallazgo | Estado | Qué se hizo |
|---|---|---|
| ERROR FAQ «hoy» responde octubre | Ya corregido (pasada 1) | FAQ con la UTM de noviembre ($72.440), URL y fecha de consulta. |
| ERROR UTA «una vez al año» / columna mensual «no sirve para el IGC» | Corregido | Tabla: «12 × la UTM del último mes del año comercial»; la columna mensual del SII se describe como referencial y los tramos del IGC se expresan en la UTA que fija el SII para el año tributario. |
| ERROR glosario «comercializada por 12 meses» | Corregido | «multiplicada por doce» con cita del Diccionario del SII. |
| ERROR umbral «bruto/mes» | Corregido | Se expresa sobre la renta líquida imponible y se aclara que no es la remuneración bruta; también en la frase de retención. |
| ERROR APV «15% del ahorro anual» | Corregido | Redactado con el art. 20 O del DL 3.500 (texto literal recuperado de la BCN, versión 2025-09-01): bonificación al pensionarse, 15 % de lo ahorrado que se destine a adelantar o incrementar la pensión, tope anual de 6 UTM (UTM al 31 de diciembre del año del ahorro) y aportes del año de hasta diez veces las cotizaciones obligatorias. |
| ERROR «mismo valor real» | Corregido | Guía y conversor: «se ajusta con la inflación» con rezago de dos meses y redondeo al peso. |
| ERROR «SII regula/define la UTM» | Corregido | La ley (DL 830) establece el reajuste y el SII publica el valor; también la fila «Quién la define» de la comparación con la UF. |
| ERROR entrada de correcciones desfasada | Corregido | La entrada `utm-reajuste-mensual-copy` ya se había ampliado (pasada 1); se añade `utm-guia-ejemplos-tributarios` con los cambios de significado de esta pasada. |
| TODO:SOURCE versión BCN 2025-07-11 | Evidencia aportada | El enlace de navegación de la BCN mostró una pantalla de espera al auditor; la versión 2025-07-11 se recuperó el 2026-11-10 por el endpoint `consulta/obtxml?opt=7&idNorma=6374&idVersion=2025-07-11` y contiene el texto literal citado. Falta que el MathAudit 2 la confirme. |
| TODO:SOURCE límites en pesos enteros vs. centavos | Corregido | El umbral se da como $968.233,50 y la nota de la tabla dice que los límites están redondeados a pesos enteros. |
| TODO:SOURCE Ley 18.290 | Evidencia aportada | Texto literal del art. 201 (BCN, `idNorma=29708`, 2026-11-10): escala 1,5–3 (gravísimas), 1–1,5 (graves), 0,5–1 (menos graves) y 0,2–0,5 UTM (leves). Se citan la escala y la fuente; se retiró la afirmación sobre el valor «al momento del pago». |
| TODO:SOURCE aranceles consulares, notariales, CBR y pasaportes | Afirmación retirada | Sin fuente primaria recuperada: se eliminó la tabla y las menciones específicas; queda una frase genérica que remite a cada institución. |
| TODO:SOURCE «2 a 5 UTM» del glosario | Corregido | Reemplazado por la escala del art. 201. |

### Observaciones que NO corregí (para ComplianceAgent)

- Glosario, sección «UTA e Índice Diario»: «Ocasionalmente se ve referenciada su métrica prorrateada diaria por el SII» no tiene fuente y no figura en el MathAudit 1. Candidata a retirarse.
- La guía sigue enlazando la versión BCN `idVersion=2025-07-11` con la página de navegación, que a veces muestra una pantalla de espera; la cita literal se verificó por el endpoint XML.
- No se tocó `sueldo-imponible-chile` ni los artículos con la ventana de revisión vencida.

## Tercera pasada de corrección 2026-11-10 (DraftAgent) — respuesta al MathAudit 2 (FAIL)

Misma sesión DraftAgent (`5781f981-67ac-4656-beba-a357f2001bc9`). No audité ni evalué compliance. El MathAudit 2 (commit `4f1025c3`, sin modificar) auditó el commit `e888b3a8` en un worktree limpio; el auditor declara que lo hizo en la misma conversación que el MathAudit 1 (independiente de Research, brief y redacción, pero no una conversación nueva).

| Hallazgo | Estado | Qué se hizo |
|---|---|---|
| ERROR 17: columna UTA mensual «solo referencial» | Corregido | Se retiró «referencial»: la tabla del SII muestra una UTA para cada mes (UTM × 12) y la del AT 2026 es la de diciembre de 2025. |
| ERROR 29: límites enteros vs. centavos | Corregido | La tabla conserva los centavos del SII ($968.233,50; $968.233,51 – $2.151.630,00; etc.) y se eliminó la nota de redondeo. |
| ERROR 30 y 44: bono APV «se paga al pensionarse» | Corregido | Texto del art. 20 O (BCN, versión 2025-09-01): el derecho se tiene al pensionarse, pero la bonificación se deposita anualmente en una cuenta individual especial, con la misma rentabilidad y comisiones, y por cada retiro se gira a la Tesorería el 15 % del retiro (o el saldo remanente si es menor). Tope de 6 UTM y límite de diez veces las cotizaciones obligatorias, sin cambios. |
| TODO:SOURCE 36: valor de la UTM aplicable al pago de una multa | Corregido | Se reescribió el párrafo inicial de la guía: el monto resulta de multiplicar las UTM por el valor de la UTM «que se aplique a tu pago». No queda ninguna afirmación sobre «valor vigente en ese momento». |
| TODO:SOURCE 37: aranceles y derechos «en UTM» | Afirmaciones retiradas | Sin fuente primaria recuperada para ningún arancel, se eliminó la sección «Aranceles y trámites del Estado», la viñeta del glosario y la del conversor, y las menciones genéricas de «aranceles de trámites» / «trámites» en la descripción, el lead, la respuesta rápida, las FAQ, las tablas y el resumen. Los usos que quedan están respaldados: multas (Ley 18.290, art. 201) y tramos de impuestos (SII). |
| ERROR 39: entrada `utm-reajuste-mensual-copy` | Corregido | La entrada dice ahora que la guía y el glosario describen M−2 y que el conversor solo habla de reajuste mensual según el IPC; precisa que ya ninguna página afirma un día de cambio dentro del mes y que el glosario dice que el valor de cada mes rige durante ese mes calendario. |
| ERROR 46: año comercial vs. año tributario de la UTA | Corregido | UTA = UTM del último mes del año comercial × 12 (SII); los tramos del IGC de un año tributario usan la UTA del año comercial anterior (AT 2026 → diciembre de 2025). Se corrigió también la fila «Definición» de la tabla UTM/UTA y la FAQ UTM vs. UTA. |
| ERROR 47: la entrada `utm-guia-ejemplos-tributarios` | Corregido | Su `fixed` y `wrong` ahora coinciden con el texto (sin afirmación sobre el pago de multas; APV con el depósito anual; aranceles retirados). |

Pendiente para ComplianceAgent (sin cambios): frase sin fuente del glosario sobre una «métrica prorrateada diaria» de la UTM; enlace BCN `idVersion=2025-07-11` (el auditor la confirmó en la página indexada con `idParte=`; el endpoint XML que usé yo devolvió contenido vacío para él).

## Cuarta pasada de corrección 2026-11-10 (DraftAgent) — respuesta al MathAudit 3 (FAIL)

Misma sesión DraftAgent (`5781f981-67ac-4656-beba-a357f2001bc9`). No audité ni evalué compliance. El MathAudit 3 (commit `5671d6b1`, sin modificar) auditó `8dcb68bf` en un worktree limpio y no pudo determinar si su conversación es nueva o la misma de las rondas 1 y 2.

**Corrección de un registro anterior de este draft:** la tercera pasada decía que la guía incluía la alternativa del saldo remanente del giro del APV; no la incluía (hallazgo 49). Se agrega ahora, y también a la entrada del registro. Esa misma pasada decía haber retirado todas las menciones de «trámites»; quedaban dos usos genéricos en el conversor, que se retiran ahora.

| Hallazgo | Estado | Qué se hizo |
|---|---|---|
| ERROR 30, 44, 47: giro del 15 % sin la alternativa del saldo | Corregido | Guía y registro: «el 15 % del retiro, o el saldo remanente de la cuenta si éste fuese inferior» (art. 20 O DL 3.500, texto literal de la BCN versión 2025-09-01). |
| ERROR 39: «montos, fórmulas y cálculos no cambiaron» | Corregido | La entrada ya no afirma que no hubo cambios y remite a la entrada `utm-guia-ejemplos-tributarios`. |
| ERROR 46: UTA «× 12» universal | Corregido | Guía (tabla, FAQ, cuerpo, resumen), glosario y FAQ del conversor: UTM del último mes del año comercial × 12, o × el número de meses del año comercial si son menos de doce (SII, Diccionario). El resumen ya no dice «diciembre» sin calificar. |
| ERROR 49: draft y registro inconsistentes | Corregido | Ver el aviso de arriba; los dos usos de «trámites» del conversor se retiraron. |
| ERROR 50: numeración art. 201 de la Ley de Tránsito | Mitigado, no resuelto | El auditor afirma que en el texto refundido (DFL 1/2007) la escala está en el art. 204. No pude verificarlo: el texto que recupero en la BCN (`idNorma=29708`, 2026-11-10) la numera como art. 201. Para no afirmar un número que no verifiqué, se quitó el número de artículo del cuerpo, las FAQ, el glosario, el conversor y el registro; la lista de fuentes dice que en el texto de la BCN consultado es el art. 201 y que el refundido puede numerarla distinto. Pendiente que ComplianceAgent o el HumanEditor confirmen la numeración vigente. |
| TODO:SOURCE 48: «métrica prorrateada diaria» del glosario | Afirmación retirada | Sin fuente, se eliminó la viñeta y se renombró la sección «UTA e Índice Diario» a «UTA». |
| TODO:SOURCE 51: «redondeada al peso» como regla general | Afirmación retirada | Se quitó de la guía y del registro; queda «con un rezago de dos meses». |

## Quinta pasada de corrección 2026-11-10 (DraftAgent) — respuesta al ComplianceAgent 2 (FAIL, 8,20/10)

Misma sesión DraftAgent (`5781f981-67ac-4656-beba-a357f2001bc9`). No audité ni evalué compliance. El informe `06-compliance.md` (commit `a290f6d8`, sin modificar) evaluó `9df66c6f` con la sesión `2eafee49-faae-4b5a-8e7d-1b91f20967c7`; declara que el hook de claude-mem inyectó títulos de observaciones y el estado de trabajo de las pasadas de corrección en su contexto (no usados como evidencia). Decide el HumanEditor si eso cumple el requisito de cero exposición.

**Corrección de un registro anterior de este draft:** la cuarta pasada decía haber añadido la excepción de los años comerciales cortos al FAQ del conversor y al resumen de la guía; no estaba. Ahora sí (hallazgo 7), igual que en la línea visible de la UTA del conversor.

Verificaciones propias de esta pasada (2026-11-10, BCN y SII recuperados por mí): DFL 1/2007 (`idNorma=1007469`), art. 204: escala 1,5–3 / 1–1,5 / 0,5–1 / 0,2–0,5 UTM, anotada «LEY Nº18.290 Art. 201»; Código Tributario art. 8 N.º 10 (definición de «unidad tributaria» y «unidad tributaria anual», regla de sanciones y redondeo) y art. 97 N.º 1 (multa de una UTM a una UTA); versión vigente del DL 830 `fechaVersion="2026-10-17"`, con el art. cuarto transitorio y el art. 8 N.º 10 idénticos a la versión 2025-07-11; `renta/2026/personas_naturales.html` contiene $11.265.804 y $417.252.

| # | Sev. | Estado | Qué se hizo |
|---|---|---|---|
| 1 | BLOQUEANTE | **Sin resolver (requiere otra sesión)** | Falta el MathAudit ronda 4 sobre el HEAD de esta pasada, en conversación nueva con ID anotado. Debe re-evaluar las filas 30, 39, 44, 46–51 y los puntos de esta pasada. |
| 2 | MAYOR | Corregido | La guía y la entrada del registro citan «DFL 1/2007 (texto refundido), art. 204» con enlace a `idNorma=1007469` y fecha de consulta; se eliminó el aviso de duda; el glosario y la FAQ de multas dicen «art. 204 del texto refundido»; `idNorma 1007469` registrado en el gate de citas legales. |
| 3 | MAYOR | Corregido | La FAQ «¿Cuánto vale la UTM hoy?» ya no fija un valor: remite a la tabla del SII y al valor dinámico de la «Respuesta rápida». «UTA anual vigente» → «UTA del año tributario 2026». No hay valor fijo «de hoy» en el frontmatter, por lo que no se agregó `expectedValue`. |
| 4 | MAYOR | **No tocado (Bucket A/B)** | `02-dossier.md`, `sources.yaml`, `01-brief.yaml` y `metadata.yaml` siguen en el corte 2026-10-29 y sin las fuentes de las pasadas posteriores; los actualiza ResearchAgent o el dueño del brief, o el HumanEditor documenta la desviación. |
| 5 | MAYOR | Corregido | (a) «Multas tributarias»: cita art. 97 N.º 1 con su texto y la regla de sanciones del art. 8 N.º 10. (b) IGC: se eliminó el deferral de los tramos; queda el umbral con su fuente y una nota. Los tramos del IGC no se incorporan al artículo: decisión de alcance, a confirmar por el HumanEditor. (c) Los enlaces apuntan a `renta/2026/personas_naturales.html`. |
| 6 | MAYOR | **Humano** | Mapa de identidad con IDs de sesión en `07-publish-packet.md`. |
| 7 | MENOR | Corregido | Excepción de los años comerciales cortos en el FAQ del conversor, en el resumen de la guía y «según la definición del SII» en la línea visible de la UTA del conversor. |
| 8 | MENOR | Corregido | `fixed[3]` coincide con el glosario; se registra el retiro de «cotizaciones»; `wrong[1]` distingue lo que decía cada página («sube o baja», «la UTM subirá», «suba mes a mes»). |
| 9 | MENOR | Corregido | Los enlaces al DL 830 apuntan a `idNorma=6374` sin `idVersion`, con fecha de consulta y la versión vigente del 2026-10-17. |
| 10 | MENOR | Corregido | La «Respuesta rápida» añade «Vigencia de la regla» con la fecha de consulta y la versión de la norma. |
| 11 | MENOR | Corregido | Glosario: «tiene un valor para cada mes, que publica el SII»; conversor: «2 UTM (ejemplo)» y «un monto de 5 UTM». |
| 12 | MENOR | Corregido | El aviso dice «Fecha de corte de la información: 2026-11-10. Cubre…» y ya no afirma que la revisión «verificó» nada. |
| 13 | MENOR | Corregido | Base legal: art. 8 N.º 10 del Código Tributario (definición de unidad tributaria, de UTA y regla de sanciones); la definición de UTA del glosario y la guía lo citan además del SII. |

Fuera de alcance (anotado por ComplianceAgent, no tocado): `sueldo-imponible-chile` con `expectedValue` de UTM desfasado y seis artículos con la ventana de revisión vencida.

## Sexta pasada de corrección 2026-11-10 (DraftAgent) — respuesta al MathAudit 4 (FAIL, 64 filas)

Misma sesión DraftAgent (`5781f981-67ac-4656-beba-a357f2001bc9`). No audité ni evalué compliance. El MathAudit 4 (commit `9b1206b8`, sin modificar) auditó `0ff3c4e1` en una conversación nueva; el entorno no le dio un ID verificable.

| Fila | Estado | Qué se hizo |
|---|---|---|
| ERROR 39 y 54: `utm-reajuste-mensual-copy.fixed[0]` decía que el glosario indica que el valor «rige durante todo el mes calendario» (frase ya retirada) y `fixed[2]` prometía «fecha de consulta» que el marcador dinámico no tiene | Corregido | `fixed[0]`: el glosario dice que la UTM «tiene un valor para cada mes, que publica el SII». `fixed[2]`: «dato dinámico del snapshot de Monedario». |
| ERROR 53: línea visible de la UTA del conversor | Corregido | Ya no dice «según la definición del SII»: «12 × UTM de {período}, cierre de un año comercial de doce meses», que es lo que calcula el valor mostrado. El FAQ del conversor conserva la excepción de los años cortos. |
| ERROR 59: «con el Estado → UTM; con un banco o arrendador → UF» | Corregido | Generalización absoluta retirada en la guía (FAQ, tabla comparativa, «Para recordar») y en el glosario («estándar en las relaciones monetarias con el Estado»): la UTM «aparece en las multas y en los tramos de impuestos»; la UF, en contratos privados. |
| ERROR 60: cita del art. cuarto transitorio con elipsis que cambia el sentido | Corregido | Cita completa en guía (recuadro y FAQ) y glosario: «se reajustará mensualmente de acuerdo con el porcentaje de variación que experimente el índice de precios al consumidor en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad». |
| ERROR 61: `fixed[3]` omite el año comercial corto | Corregido | La entrada incluye «o por el número de meses del año comercial si son menos de doce». |
| ERROR 64: `prevention` afirmaba que una auditoría independiente revisó «todas» las cifras | Corregido | Se eliminó esa promesa. |
| ERROR 40, 49, 62: afirmaciones históricas del draft presentadas como evidencia | Corregido | Nota de lectura al inicio: las pasadas anteriores a la quinta son registro histórico, no evidencia del texto actual. |
| TODO:SOURCE 2 y 58: versión vigente del DL 830 | Evidencia aportada | Recuperé `consulta/obtxml?opt=7&idNorma=6374` el 2026-11-10: `fechaVersion="2026-10-17"`; el art. cuarto transitorio y el art. 8 N.º 10 coinciden con la versión 2025-07-11 (texto literal en la pasada quinta). Límite de acceso del auditor, no discrepancia de contenido. |
| TODO:SOURCE 52: DL 3.500 vigente | **No cerrado** | Recuperé el art. 20 O de la versión 2025-09-01 de la BCN. Al intentar la versión vigente, la BCN devolvió una pantalla de espera (3 intentos); no pude comparar. El texto no afirma «versión vigente» del DL 3.500. Pendiente de confirmación humana. |
| TODO:SOURCE 11: valor dinámico vigente | Evidencia aportada | En el HTML generado de la guía aparece $72.440, igual al snapshot y a la tabla SII de noviembre. El auditor no tenía render ni snapshot en su alcance. |
| TODO:SOURCE 55: atribuciones históricas de `wrong` | Evidencia aportada | Verificadas contra las versiones de `main` (frases «sube o baja», «puede bajar o mantenerse», «la UTM subirá», «suba mes a mes», «primer día hábil», «mes anterior»); el auditor no tenía acceso a versiones anteriores. |
