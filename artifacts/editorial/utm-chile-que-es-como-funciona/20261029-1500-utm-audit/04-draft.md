Status: DRAFT — pending ComplianceAgent review
Role: DraftAgent (Claude Code, sesión nueva, separada del auditor)

# Draft — corrección acotada del reajuste UTM

- Run id: `20261029-1500-utm-audit`
- Slug: `utm-chile-que-es-como-funciona`
- Plan: `docs/backlog/PLAN-utm-reajuste-copy-correction-2026-10-29.md`
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
