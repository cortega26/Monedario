Status: BLOCKED — DEFECTS FOUND
Role: ComplianceAgent (Claude Code — fresh session, adversarial)

# Compliance — revisión YMYL adversarial (segunda ronda, sobre el texto real)

Declaración: esta es una sesión nueva, sin historial de las etapas 02–05 ni de las pasadas de corrección. No redacté ni audité matemáticamente esta pieza.

- Run id: `20261029-1500-utm-audit`
- Slug: `utm-chile-que-es-como-funciona`
- PR: #774 (rama `fix/utm-reajuste-copy-correction`, borrador, DO NOT MERGE)
- **Hash auditado (`git rev-parse HEAD`):** `9df66c6f0762dec243b4e7c17c6b6ca2cc510b56` (árbol limpio al inicio y al final)
- **ID de sesión (esta revisión):** `2eafee49-faae-4b5a-8e7d-1b91f20967c7`
- Fecha de revisión y de consulta de todas las fuentes externas de este informe: 2026-11-10 (America/Santiago)
- Superficies reales revisadas: guía `src/data/blog/utm-chile-que-es-como-funciona.md`, conversor `src/pages/calculadoras/conversor-utm.astro`, glosario `src/data/glossary/utm.md`, registro `src/data/correcciones.json` (entradas `utm-reajuste-mensual-copy` y `utm-guia-ejemplos-tributarios`).

Transparencia sobre la independencia: el hook de inicio de sesión inyectó en mi contexto títulos de observaciones de claude-mem de sesiones anteriores (incluidos resúmenes de las pasadas de corrección). No los usé como evidencia; todo lo afirmado abajo sale de los archivos del HEAD y de fuentes que recuperé yo. El worktree `/tmp/utm-compliance` ya existía al iniciar, en el HEAD `9df66c6f` (el 05 auditó `8dcb68bf`, un commit anterior; ver DEFECT #1).

## Evidencia de revisión

### Archivos leídos completos (herramienta Read), en este orden

1. `docs/editorial/NORMA_YMYL.md` (283 líneas)
2. `.../01-brief.yaml` (14)
3. `.../04-draft.md` (190, con las cuatro pasadas de corrección)
4. `.../05-math-audit.md` (85; MathAudit 3, commit auditado `8dcb68bf`)
5. `.../06-compliance.md` anterior (90; FAIL del 2026-10-29, línea base de 10 defectos)
6. Superficies reales: guía (259), glosario (33), conversor (573) y `src/data/correcciones.json` líneas 1–72 (las dos entradas `utm-reajuste-mensual-copy` y `utm-guia-ejemplos-tributarios`), todos con Read; más `git diff origin/main...HEAD` para contrastar con `main`.
7. Diff contra `origin/main` de las cuatro superficies (`--stat`: 4 archivos, +174/−99) y diff `8dcb68bf..HEAD` de `src/` (la cuarta pasada).
8. Adicionales, para decidir los defectos de separación de funciones y trazabilidad: `02-dossier.md`, `sources.yaml`, `metadata.yaml`, `07-publish-packet.md` (solo lectura), `context/INVARIANTS.md` (invariante `SEPARATION_OF_DUTIES`) y `context/EDITORIAL_AI_PIPELINE.md` (§2 y playbooks 05/06).

### Salida de los comandos (HEAD `9df66c6f`)

| Comando | Resultado |
|---|---|
| `pnpm run check:correcciones` | `[check-correcciones] OK. 22 entradas válidas en el registro.` (exit 0) |
| `pnpm run check:legal-citations` | `OK. laws=23 blog=54 pages=65 registry=21` (exit 0) |
| `pnpm run check:frontmatter` | `Scanned 54 articles … OK (no blocking errors).` (exit 0) |
| `pnpm run check:hero-prompts` | `Checked entries: 54; style: monedario-editorial-v5 … OK` (exit 0) |
| `pnpm run check:image-curation` | `Reviewed prompts, article fingerprints and asset bytes match.` (exit 0) |
| `pnpm run build` | exit 0: 334 páginas; `check-urls OK. scanned=9583 internal_broken=0 external_failures=0`; `check-postbuild OK. 25 checks passed over 334 HTML pages`. La página renderizada de la guía muestra `$72.440` en el marcador `[[utm \| clp]]`. |
| `pnpm run check:editorial-timeliness` (extra) | FAIL por artículos **fuera de alcance** (ver sección final). La guía UTM no aparece entre los fallos. |

Los gates verdes no certifican veracidad (el propio gate lo dice): no cubren el contenido de las afirmaciones.

### Búsquedas sobre el texto real (guía + glosario + conversor)

| Término | Resultado en las superficies |
|---|---|
| «primer día hábil» | 0 coincidencias (solo se cita en `correcciones.json` como texto corregido). |
| «mes anterior» | Solo «segundo mes anterior» (M−2), correcto con la norma; ningún «mes anterior» suelto. |
| «sube o baja», «suba mes a mes», «puede bajar» | 0. |
| «sigue(n) la inflación», «por inflación» | 0. |
| «arancel», «trámite» | 0 (MathAudit 3 vio dos «trámites» en el conversor; ya no están). |
| «al momento del pago», «mismo valor real», «bruto/mes», «redonde», «prorrateada» | 0. |
| «referencial» | 0. |
| Valores «vigente/hoy/actual» escritos a mano | FAQ «¿Cuánto vale la UTM hoy?» con `$72.440` fijo (DEFECT #3); «UTA anual vigente (año tributario 2026): $834.504» (con período rotulado); `$72.151` (octubre, fechado, ejemplo de M−2); `$71.721` (septiembre, rotulado histórico). Dinámicos (snapshot): `[[utm \| clp]]` ×2 en la guía y todo el conversor. |

### Fuentes recuperadas por esta sesión (2026-11-10)

- **SII UTM–UTA–IPC 2026** (`utm2026.htm`): jul 71.649 / ago 71.649 (IPC 0,6) / sep 71.721 (IPC 0,4) / oct 72.151 (IPC 0,5) / nov 72.440 / dic 72.802. Verificación independiente de M−2: 72.151/71.721−1 = 0,5995 % (IPC de agosto 0,6); 72.440/72.151−1 = 0,4005 % (IPC de septiembre 0,4); 72.802/72.440−1 = 0,4997 % (IPC de octubre 0,5). La tabla de hechos confirma M−2 sin depender de la redacción de la ley. Nota al pie del SII: «UTA = Unidad Tributaria Anual (UTM x 12)».
- **BCN DL 830, art. 4.º transitorio** (`consulta/obtxml?opt=7&idNorma=6374&idVersion=2025-07-11`, `fechaVersion="2025-07-11"`): «A partir del mes de Abril de 1975, el monto de la unidad tributaria se reajustará mensualmente de acuerdo con el porcentaje de variación que experimente el índice de precios al consumidor en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad». La misma cita aparece en la versión vigente (`fechaVersion="2026-10-17"`).
- **SII Diccionario** (`4669-u.html`): UTM «… determinado por ley, el cual se actualiza en forma permanente por el Índice de Precios al Consumidor (IPC) …»; UTA «… vigente en el último mes del año comercial respectivo, multiplicada por doce o por el número de meses que comprende el citado año comercial».
- **SII Educa**: «… se reajusta mensualmente de acuerdo al IPC».
- **SII UTM 2025**: «Diciembre 69.542 834.504». **SII renta 2026 personas naturales**: «6 UTM dic. de 2025 $417.252», exento IGC hasta $11.265.804,00. **SII IUSC 2026**: sección septiembre con $968.233,50 exento; $2.151.630,00 (4 %); $3.586.050,00; $5.020.470,00; $6.454.890,00; $8.606.520,00; $22.233.510,00. Recálculo propio: 13,5×71.721 = 968.233,50; 30/50/70/90/120/310 × 71.721 coinciden; 12×69.542 = 834.504; 13,5×834.504 = 11.265.804; 6×69.542 = 417.252.
- **BCN DL 3.500**: art. 20 L letra a) y art. 20 O. Coincide con el texto de la guía (derecho al pensionarse; 15 % de lo ahorrado destinado a adelantar o incrementar la pensión; tope anual de 6 UTM con la UTM vigente al 31 de diciembre del año del ahorro; aportes del año hasta diez veces las cotizaciones del art. 17; depósito anual en cuenta individual especial; mismas condiciones de rentabilidad y comisiones; por cada retiro «un monto equivalente al 15% de aquel retiro o al saldo remanente si éste fuese inferior»). Limitación: el endpoint XML devolvió para `idVersion=2025-09-01` el mismo archivo (`fechaVersion="2027-04-01"`, hash idéntico del art. 20 O), así que no pude fijar yo la versión 2025-09-01; el texto es idéntico al que citó el MathAudit.
- **BCN Ley 18.290 (`idNorma=29708`)**: `fechaVersion="2009-11-07"`, `derogado="no derogado"`; el art. 201 trae la escala (1,5–3; 1–1,5; 0,5–1; 0,2–0,5 UTM). **BCN DFL 1/2007, texto refundido (`idNorma=1007469`)**: la misma escala está en el **art. 204**, anotado «LEY Nº18.290 Art. 201 D.O 07.02.1984»; en el refundido el art. 201 define las infracciones menos graves. Confirma el hallazgo 50 del MathAudit 3 con evidencia propia (ver DEFECT #2).
- **BCN Código Tributario art. 97 N.º 1**: «con multa de una unidad tributaria mensual a una unidad tributaria anual» (ver DEFECT #5).
- **SII `datos_informativos_2026.html`**: HTTP 200, 2,9 KB; es una página índice que enlaza a `2026/personas_naturales.html`; no contiene $11.265.804 ni $417.252 (ver DEFECT #5).

## Scorecard NORMA_YMYL (§7)

| Dimensión | Peso | Puntuación | Justificación |
|---|---|---|---|
| Respuesta ancla | 35 % | 9.0 | La regla se declara de forma afirmativa y primero (M−2, cita literal del art. 4.º transitorio, ejemplo octubre↔agosto) y coincide con la tabla del SII. Descuentos: el recuadro «Vigencia» se refiere al valor de ejemplo, no a la regla (DEFECT #10); no hay línea de excepciones/límites en el recuadro. |
| Precisión + fuentes | 25 % | 7.0 | Regla, montos, tramos, UTA y APV verificados contra primarias. Descuentos: cita de la Ley de Tránsito a un texto congelado con numeración que el propio artículo declara dudosa (#2); afirmación sin fuente sobre multas tributarias y deferral de tramos del IGC (#5); enlace a página índice (#5); dossier y `sources.yaml` sin las fuentes usadas (#4); cuarta pasada sin auditoría independiente (#1). |
| Vigencia + calendario | 15 % | 7.5 | `validAsOf` = `updatedDate` = fecha de consulta = 2026-11-10, coherente entre sí. Descuentos: valor «hoy» fijo que caduca el 2026-12-01 (#3); brief/dossier con corte 2026-10-29 y octubre como valor «vigente» (#4); versión BCN fijada en una no vigente (#9). |
| Excepciones + cobertura | 15 % | 8.5 | APV con todas las condiciones y el giro alternativo; UTA con excepción de año comercial corto en tabla, FAQ de la guía, cuerpo y glosario. Descuento: la excepción falta en el FAQ del conversor y en el resumen de la guía (#7). |
| Claridad + estructura | 10 % | 9.0 | Formulación única y coherente entre superficies; M−2 explicado sin afirmar día. |
| **Total ponderado** | 100 % | **8.20 / 10** | 0,35×9,0 + 0,25×7,0 + 0,15×7,5 + 0,15×8,5 + 0,10×9,0 = 8,20. Bajo el umbral de 9.5: no se publica (§7). |

## DEFECTS

DEFECT #1 — [BLOQUEANTE] — Ninguna auditoría independiente cubre el texto actual y la última (05) es FAIL. `05-math-audit.md` (MathAudit 3) auditó el commit `8dcb68bf` y concluyó FAIL con 7 ERROR y 2 TODO:SOURCE. El HEAD `9df66c6f` incluye una cuarta pasada (guía −/+28 líneas, glosario, conversor, registro) que modifica precisamente las filas en ERROR (30, 39, 44, 46, 47, 48, 49, 51; la 50 sigue abierta). Esa cuarta pasada no fue auditada por nadie distinto del DraftAgent; el borrador solo declara que corrigió. NORMA §6.2 y la invariante `MATH_AUDIT_REQUIRED_WHEN_CALC` exigen la auditoría sobre el texto que se publicaría. — Resolution: MathAudit ronda 4, en una conversación nueva con ID registrado, sobre el HEAD que resulte tras corregir este informe; reemplazar `05-math-audit.md`. Debe re-evaluar las filas 30, 39, 44, 46, 47, 48, 49, 50, 51 y los puntos #2, #3, #5, #7, #8, #11 y #13 de este informe.

DEFECT #2 — [MAYOR] — Cita de la Ley de Tránsito a un texto congelado y con hedging sobre información fetcheable. La guía enlaza `idNorma=29708` (versión 2009-11-07 de la ley original) y su lista de fuentes dice «en esa versión la escala es el artículo 201 y el texto refundido puede numerarla distinto». Recuperé el refundido vigente (DFL 1/2007, `idNorma=1007469`): la escala es el **art. 204** (anotado «LEY Nº18.290 Art. 201»), y el art. 201 del refundido trata otra materia. Los rangos del cuerpo (1,5–3; 1–1,5; 0,5–1; 0,2–0,5 UTM) son correctos; el defecto es la fuente y el aviso de duda: NORMA §2.4 no admite dejar sin resolver un dato publicado por la BCN, y esta es la fila 50 (ERROR) del MathAudit 3. El draft la declara «mitigada, no resuelta» y delega la confirmación en ComplianceAgent/HumanEditor: queda confirmada aquí. — Resolution: DraftAgent cita «DFL 1/2007 (texto refundido de la Ley de Tránsito N.º 18.290), art. 204» con enlace a `idNorma=1007469` y fecha de consulta; elimina el aviso de duda de la lista de fuentes; ajusta la fuente de la entrada `utm-guia-ejemplos-tributarios` y, si `check:legal-citations` lo exige, el registro de IDs conocidos.

DEFECT #3 — [MAYOR] — Valor fijo «de hoy» que caduca. La FAQ «¿Cuánto vale la UTM hoy?» fija «la UTM de noviembre de 2026 es $72.440 (consultada el 2026-11-10)» y se emite también como dato estructurado de FAQ. El SII ya publica diciembre ($72.802): el 2026-12-01 la pregunta «hoy» responderá un valor vencido y ningún gate lo detecta (el `volatileData` de la guía no tiene `expectedValue`; en cambio el gate sí marca `sueldo-imponible-chile` por el mismo motivo). También la guía rotula «UTA anual vigente (año tributario 2026)» a mano. NORMA §2.2/§2.4 y el criterio de la propia entrada de registro («no escribir en texto fijo un valor “vigente” o “de hoy”…») lo prohíben. — Resolution: reformular la FAQ sin valor fijo de «hoy» (regla + fila del mes en la tabla del SII, y el valor dinámico en el cuerpo) o conectar el valor al snapshot; registrar el valor en `volatileData` con `expectedValue` para que `check:editorial-timeliness` falle al cambiar de mes.

DEFECT #4 — [MAYOR] — Trazabilidad del run desactualizada respecto del texto publicado. (a) `02-dossier.md` sigue fechado 2026-10-29, afirma que la versión BCN `2025-07-11` es la «última» (BCN publica la `2026-10-17`), no incluye los textos literales del Diccionario/Educa/DL 830 recuperados el 2026-11-10 (solo están en 04) y no contiene entradas para la Ley de Tránsito, DL 3.500 arts. 20 L/20 O, la tabla IUSC, las tablas UTA 2025/AT 2026 ni la metodología de la UF del Banco Central. (b) `sources.yaml` lista 6 fuentes; ninguna de esas 6 categorías de fuentes nuevas figura. (c) `01-brief.yaml` y `metadata.yaml` fijan `cut_off_date: 2026-10-29` y el `successSignal` exige mostrar «el valor SII de octubre de 2026 con corte explícito», pero el texto publicado muestra noviembre con corte 2026-11-10 (y octubre solo como ejemplo de M−2). (d) Ni `metadata.yaml` ni el dossier registran IDs de sesión (ver #6). Impide marcar «Fuentes completas» y «Fecha de corte visible» en 07 y reabre la parte del defecto #2 anterior que pedía llevar los textos al dossier. — Resolution: Bucket A/B (no lo edito yo): ResearchAgent/dueño del brief actualiza 02, `sources.yaml`, 01 y `metadata.yaml` (o el HumanEditor documenta la desviación del corte) y registra IDs.

DEFECT #5 — [MAYOR] — Afirmaciones sin fuente y deferrals no justificados que siguen en la guía (§2.4). (a) «Multas tributarias del SII»: afirma sin fuente que el SII expresa multas «en UTM o UTA según el tipo de infracción y los artículos del Código Tributario» y remite a SII.cl; el texto está en BCN (p. ej. art. 97 N.º 1: «multa de una unidad tributaria mensual a una unidad tributaria anual»). (b) IGC: «Los tramos exactos y tasas vigentes para el año tributario 2026 están publicados en [SII …]» es un deferral de una tabla pública (el §2.4 lo enumera como ejemplo ilegítimo). (c) Los cuatro enlaces a `renta/datos_informativos_2026.html` (guía, líneas 146 y 211 rotulados «SII — Datos informativos AT 2026», línea 217 «tabla SII AT 2026» y línea 254 en Fuentes) apuntan a una página índice (2,9 KB, enlaza a `2026/personas_naturales.html`) que no contiene $11.265.804 ni $417.252; las cifras están en `renta/2026/personas_naturales.html`. Es contenido preexistente, pero el artículo se re-fecha y la revisión declara haber verificado esas cifras. — Resolution: DraftAgent cita la fuente primaria con artículo para (a) o retira la frase; para (b) incorpora la tabla del año tributario con fuente o documenta `TODO:SOURCE: <URL> — resultado: …` en 04 (no en el blog); para (c) enlaza `https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html`.

DEFECT #6 — [MAYOR] — Declaración de separación de funciones incompleta (pendiente humano). La invariante `SEPARATION_OF_DUTIES` exige un mapa de identidad con herramienta y sesión por etapa en 07 y la declaración de sesión fresca para auditores de la misma familia. Faltan los IDs de Research, brief/outline y MathAudit 1–3 (el MathAudit 3 declara que no puede saber si su conversación es nueva); `metadata.yaml` dice «current audit session». **Decisión sobre si es bloqueante** (ver tabla de separación): (i) que ResearchAgent y MathAudit sean la misma herramienta/instancia, y que las rondas 2–3 sigan en la conversación de la ronda 1, NO viola la regla canónica (la tabla de roles asigna ChatGPT a ambos; la regla dura exige solo DraftAgent ≠ MathAudit ≠ Compliance por instancia y sesión fresca para la misma familia); además el MathAudit 3 declara no haber usado `02-dossier.md` y haber recuperado las fuentes primarias, lo que reduce el sesgo de auto-verificación. Por eso lo anterior ya no es un defecto bloqueante (reclasifica el defecto #1 de la ronda anterior). (ii) La ausencia del mapa con IDs sí impide el sign-off y no puede completarla un agente. — Resolution: HumanEditor declara en 07 (sin que yo lo edite) los IDs irrecuperables como tales y registra los de esta sesión y los de la ronda 4; la ronda 4 debe ser una conversación nueva con ID anotado, lo que además elimina el riesgo de anclaje. Independencia de esta sesión: el hook de SessionStart de claude-mem me inyectó títulos de observaciones y el work_state de las pasadas de corrección (no los usé como evidencia, pero estuvieron en mi contexto). El HumanEditor decide si eso cumple el requisito de «cero exposición» de `SEPARATION_OF_DUTIES`; la próxima sesión ComplianceAgent debe iniciarse con esa inyección desactivada para este proyecto, o declarar expresamente que no lo estuvo.

DEFECT #7 — [MENOR] — UTA «× 12» sin la excepción en dos superficies. El Diccionario del SII admite multiplicar «por el número de meses que comprende el año comercial». La guía (tabla, FAQ, cuerpo) y el glosario la incluyen; el FAQ del conversor («multiplicada por 12») y el resumen de la guía («multiplicada por doce») no. Tampoco la línea visible del conversor (líneas 318–319: «UTA de referencia anual … (12 × UTM de {período}, cierre del año comercial)»), que es correcta para el valor mostrado pero fija «12 ×» sin la excepción. La cuarta pasada del 04 afirma haber corregido el FAQ del conversor con la excepción: el texto no lo refleja (mismo tipo de inconsistencia que la fila 49 del MathAudit 3). — Resolution: añadir la excepción o redactar «según la definición del SII» en esas tres frases, y corregir la afirmación del 04.

DEFECT #8 — [MENOR] — El registro de correcciones describe el glosario de forma inexacta. `utm-guia-ejemplos-tributarios.fixed[3]` dice que el glosario «cita la escala de multas de la Ley de Tránsito (de 0,2 a 3 UTM)»; el glosario solo dice «por ejemplo, de 1,5 a 3 UTM para las infracciones gravísimas». Además, el cambio «Multas, cotizaciones, trámites» → «Multas y tramos de impuestos» (se retiró «cotizaciones») no figura en ninguna entrada; y `utm-reajuste-mensual-copy.wrong[1]` atribuye por igual a guía y glosario frases direccionales que en `main` eran distintas en cada una (el glosario decía «la UTM subirá»). Son cambios de significado/alcance (§5.4: en duda, se registra). `check:correcciones` pasa porque no valida el contenido. — Resolution: corregir `fixed[3]` («escala de 1,5 a 3 UTM para las gravísimas» o ampliar el glosario), añadir la retirada de «cotizaciones» y precisar `wrong[1]`, como nueva redacción de la entrada del mismo día (no hay historial publicado que reescribir; ya está en esta rama). Otra inexactitud del mismo tipo: `utm-guia-ejemplos-tributarios.fixed[2]` afirma que la UTA se describe con la excepción de los años comerciales cortos, y la entrada lista el conversor entre las páginas corregidas, cuyo FAQ y línea visible de la UTA no la muestran (ver #7).

DEFECT #9 — [MENOR] — Versiones BCN fijadas en una versión no vigente. La guía, el glosario, el registro y `sources.yaml` enlazan `idNorma=6374&idVersion=2025-07-11` y la lista de fuentes la rotula «versión del 2025-07-11»; BCN publica la `2026-10-17` (texto del art. 4.º transitorio idéntico). La literal citada coincide con la norma (respuesta a la pregunta del encargo), pero el artículo la presenta como la vigente. Además la página `navegar` de BCN es una aplicación de carga dinámica (devuelve pantalla de espera a clientes simples); el enlace sirve en navegador, no verificable por fetch. — Resolution: enlazar la versión vigente o sin `idVersion` y fechar la consulta; mantener el dato de que el texto es idéntico en ambas versiones solo si se documenta en 02.

DEFECT #10 — [MENOR] — NORMA §1.1.3 / §2.3: la «Respuesta rápida» no declara la vigencia de la regla. La línea «Vigencia» habla del valor de ejemplo de septiembre («no es el valor actual»), no del marco temporal de la regla M−2 (por ejemplo «vigente a 2026-11-10, versión BCN …»); la regla solo queda fechada por el aviso «Alcance de la revisión» más abajo. — Resolution: añadir la vigencia de la regla (fecha y versión de la norma) a la plantilla del recuadro.

DEFECT #11 — [MENOR] — Residuos sin fuente. (a) Glosario: «tiene un valor fijo que rige durante todo un mes calendario» implica un inicio de vigencia dentro del mes que el resto del texto evita afirmar (la entrada de registro lo reconoce); la tabla del SII acredita un valor por mes, no los límites del mes. (b) Conversor: la etiqueta «2 UTM (multa de tránsito común)» caracteriza como «común» un monto sin fuente (cae en la banda de las gravísimas). (c) Conversor, FAQ: «un derecho de 5 UTM» deja implícita la afirmación (retirada del resto) de que hay derechos expresados en UTM. — Resolution: retirar o acotar esas tres expresiones (por ejemplo, «2 UTM (ejemplo)»).

DEFECT #12 — [MENOR] — Aviso de revisión que afirma una verificación aún no certificada. El recuadro «Alcance de la revisión del 2026-11-10» dice que «esta revisión verificó contra el SII y el BCN» regla, valores y aritmética; la única auditoría independiente vigente es FAIL. Hoy es coherente con las verificaciones del DraftAgent y las mías, pero el aviso se publicaría como sello de verificación. — Resolution: tras el PASS del MathAudit, mantener el aviso solo si describe literalmente lo auditado; si no, acotar el texto.

DEFECT #13 — [MENOR] — Definiciones legales atribuidas al Código Tributario sin artículo, y regla propia de sanciones omitida (§1.1.4, regla de «según la ley» sin artículo). La guía dice que la UTM «está definida en el Código Tributario (DL 830/1974)» (línea 123) sin artículo, y sustenta la UTA solo en el Diccionario del SII (línea 140, glosario línea 31). Recuperé el art. 8.º N.º 10 del Código Tributario (BCN, `fechaVersion="2026-10-17"`): define «unidad tributaria» («la cantidad de dinero cuyo monto, determinado por ley y permanentemente actualizado, sirve como medida o como punto de referencia tributario») y «unidad tributaria anual» («aquélla vigente en el último mes del año comercial respectivo, multiplicada por doce o por el número de meses que comprenda el citado año comercial»), y agrega: «Para los efectos de la aplicación de las sanciones expresadas en unidades tributarias, se entenderá por “unidad tributaria anual” aquella que resulte de multiplicar por doce la unidad tributaria mensual vigente al momento de aplicarse la sanción», y que la UTM o UTA «se expresará siempre en pesos» con redondeo del medio peso al entero superior. El texto publicado dice que el SII expresa multas «en UTM o UTA» (ver #5a) y presenta una sola definición de la UTA, sin esta regla para sanciones (con ella, la UTA mensual de la tabla del SII sí es la que rige en una sanción tributaria). — Resolution: citar el art. 8.º N.º 10 en la guía y el glosario como fuente primaria de las definiciones y, si se mantiene la mención a multas tributarias, la regla de sanciones; incorporarlo al dossier. Nota para la ronda 4: este mismo artículo es una base legal para el redondeo a peso entero de la UTM/UTA, de modo que la fila 51 (TODO:SOURCE) puede cerrarse citándolo si el texto vuelve a afirmar el redondeo.

TODO:SOURCE abiertos: ninguno declarado en 04 con el marcador. Los dos del 05 (48 «métrica prorrateada diaria»; 51 «redondeada al peso») están retirados del texto (0 coincidencias) y quedan por cerrar en la ronda 4. Los deferrals de #5 equivalen a TODO:SOURCE sin documentar.

## Estado de cada defecto del informe anterior (2026-10-29)

| # | Sev. anterior | Estado | Evidencia en el texto actual / acción |
|---|---|---|---|
| 1 | BLOQUEANTE (SoD) | **Reclasificado; reabierto solo como documentación** (→ #6) | La regla canónica exige Draft ≠ MathAudit ≠ Compliance por instancia y sesión fresca; Research=MathAudit y la conversación compartida de las rondas 1–3 no la violan. Siguen sin existir los IDs y el mapa. |
| 2 | BLOQUEANTE (regla sin cita literal) | **Corregido en el texto; residuo en dossier** (→ #4) | La guía cita la norma con literal: «se reajustará mensualmente […] en el segundo mes que anteceda…»; la verifiqué en BCN (v2025-07-11 y vigente). Diccionario y Educa verificados literalmente. El dossier 02 no incorpora los literales. |
| 3 | BLOQUEANTE (regla sin fila en 05) | **Corregido** | 05 filas 1–3, 34–35 verifican la regla y las fuentes; el texto de la regla no cambió en la cuarta pasada (`git diff 8dcb68bf..HEAD` no la toca). |
| 4 | MAYOR (deferral valor vigente) | **Corregido, con efecto secundario** (→ #3) | FAQ da noviembre con URL y fecha; el cuerpo usa `[[utm \| clp]]` (render `$72.440`). Ahora caduca el 2026-12-01. |
| 5 | MAYOR (montos sin certificar) | **Corregido** | 05 filas 15–31 VERIFIED; recalculé: $834.504, $69.542, $11.265.804, $417.252, $968.233,50 y los seis límites, todos coinciden con las tablas del SII. |
| 6 | MAYOR (`validAsOf` incoherente) | **Corregido en la guía; reabierto en el run** (→ #4) | `validAsOf` 2026-11-10 = `updatedDate` = fecha de la fila de noviembre citada = consulta. Brief/metadata siguen en 2026-10-29. |
| 7 | MENOR («siguen la inflación», «por inflación») | **Corregido** | 0 coincidencias; la fila de la UF describe su mecanismo con fuente (BCCh: día 10 al 9, diario, según IPC). |
| 8 | MAYOR (registro) | **Corregido en lo sustancial; residuos** (→ #8) | Dos entradas cubren las frases direccionales, M−2, «primer día hábil», valor «al momento del pago», aranceles, APV, UTA, base del IUSC. Inexactitudes menores. |
| 9 | BLOQUEANTE (evidencia insuficiente) | **Corregido por esta revisión** | Leí las superficies reales, el diff y ejecuté los comandos (arriba). |
| 10 | MENOR (limitación visible) | **Corregido** | `limits[1]`: «Este artículo no fija el día del mes en que cambia el valor…»; el cuerpo dice «no señala un día específico del mes». |

## Estado de las filas ERROR/TODO:SOURCE del último 05 (MathAudit 3, commit `8dcb68bf`) frente al HEAD

| Fila 05 | Estado en el texto del HEAD (verificado por mí) | ¿Cierra? |
|---|---|---|
| 30, 44, 47 (giro APV sin saldo remanente) | La guía (APV Régimen A) y `fixed[1]` incluyen «o el saldo remanente de la cuenta si éste fuese inferior»; coincide con el art. 20 O. | Corregido; falta ronda 4 |
| 39 (registro: «montos no cambiaron») | `fixed[2]` ya no lo afirma y remite a la otra entrada. | Corregido; falta ronda 4 |
| 46 (UTA × 12 universal) | Corregido en tabla, FAQ, cuerpo y glosario; persiste en FAQ del conversor y resumen (#7). | Parcial |
| 48 («métrica prorrateada diaria») | Viñeta y sección «Índice Diario» eliminadas; sin fuente que la respalde (ninguna fuente recuperada por mí la acredita). 0 coincidencias. | Retirada; falta ronda 4 |
| 49 (04/registro inconsistentes) | Corregido el registro del APV y retirados los «trámites»; surge una nueva inconsistencia 04↔texto (#7). | Parcial |
| 50 (numeración Ley de Tránsito) | Abierta (#2). | **No** |
| 51 («redondeada al peso») | 0 coincidencias. | Retirada; falta ronda 4 |

## Preguntas específicas del encargo

- **«Métrica prorrateada diaria por el SII» (glosario):** no tiene fuente (ni en las páginas del SII que recuperé ni en el MathAudit); fue retirada en la cuarta pasada. No queda en el HEAD.
- **Enlace BCN `idVersion=2025-07-11`:** el texto literal citado en guía, glosario y FAQ coincide con la norma (verificado por el endpoint XML con `fechaVersion="2025-07-11"`, y también en la versión vigente `2026-10-17`). Defecto menor de vigencia de versión y de verificabilidad del enlace (#9).
- **Coherencia `validAsOf` / `updatedDate` / consulta / valores citados:** coherentes en la guía (2026-11-10, fila de noviembre, `$72.440`). Incoherente con brief/dossier/metadata (corte 2026-10-29, octubre «vigente») (#4). El conversor muestra la fecha del snapshot; `dateModified` del esquema usa `utmLastUpdated`.
- **Separación de funciones:** ver tabla y decisión (#6).

## Separación de funciones (tabla etapa → agente/sesión)

| Etapa | Agente / instancia | ID de sesión | ¿Comparte instancia? |
|---|---|---|---|
| Research (02-dossier) | ChatGPT/Codex | **No registrado** | Según los artefactos, misma herramienta que MathAudit; instancia no demostrable |
| Brief / outline (01, 03) | ChatGPT/Codex (según el 06 anterior) | **No registrado** | No demostrable |
| DraftAgent (04) — redacción original | Claude Code 2.1.312 | `fa77c584-d098-4452-b2c5-edd03985bc4f`, `203cab69-a498-41f7-ab50-e4bdef4ad31d`, `dd46ffd5-df19-4d89-a795-7f3f60fb6055` | No con MathAudit ni Compliance |
| DraftAgent — pasada residual | Claude Code | **No registrado** | No demostrable |
| DraftAgent — pasadas de corrección 1–4 (2026-11-10) | Claude Code, sesión nueva | `5781f981-67ac-4656-beba-a357f2001bc9` (misma en las cuatro pasadas) | No con MathAudit ni Compliance (declara no haber auditado) |
| MathAuditAgent ronda 1 (05) | ChatGPT/Codex | **No registrado** («current audit session») | Con rondas 2 y 3 (declarado) |
| MathAuditAgent ronda 2 | ChatGPT | **No registrado** | Misma conversación que la ronda 1 (declarado en el 04) |
| MathAuditAgent ronda 3 (commit `5671d6b1`) | ChatGPT | **No registrado** | No determinable (declarado por el auditor) |
| ComplianceAgent, ronda anterior (2026-10-29) | Claude Code, sesión nueva | No registrado | Distinta de las de DraftAgent (declarado) |
| **ComplianceAgent, esta revisión** | Claude Code, sesión nueva, adversarial | `2eafee49-faae-4b5a-8e7d-1b91f20967c7` | No: no redacté ni audité; sin historial de 02–05 (salvo los títulos de claude-mem indicados arriba, no usados como evidencia) |
| HumanEditor (07) | Pendiente | — | — |

**Decisión:** la regla canónica (`INVARIANTS` y `EDITORIAL_AI_PIPELINE` §2) exige DraftAgent ≠ MathAuditAgent ≠ ComplianceAgent por instancia y sesión fresca para la misma familia. Esa regla se cumple: el redactor es Claude Code en sesiones identificadas; los MathAudit son ChatGPT; esta revisión es una sesión nueva. Que Research y MathAudit sean la misma herramienta, o que las rondas 2–3 continúen la conversación de la ronda 1, no es una violación de esa regla y **no es bloqueante por sí mismo**; el auditor, además, recuperó las fuentes primarias sin usar el dossier. Lo que sí queda pendiente antes del sign-off es el mapa de identidad con IDs en 07 (#6). Recomiendo que la ronda 4 sea una conversación nueva con ID registrado para cerrarlo y evitar anclaje.

## Fuera de alcance (solo se anota; no se tocó)

- `sueldo-imponible-chile`: `volatileData "economic.utm.value" expectedValue=72151` no coincide con el snapshot (72440) y su `reviewDate` (2026-10-28) está detrás del cambio de UTM del 2026-11-01 (salida de `check:editorial-timeliness`).
- Artículos con ventana de revisión vencida según el gate hoy: seis, no cinco (el sexto, `boleta-honorarios-2026-retencion-cobertura`, venció hoy 2026-11-10): `boleta-honorarios-2026-retencion-cobertura`, `como-leer-cartola-afp-chile`, `contribuciones-bienes-raices-chile`, `gratificacion-legal-chile`, `operacion-renta-centro`, `pgu-pension-garantizada-universal`.

## Veredicto final

**FAIL.**

Justificación:
- Hay un defecto bloqueante (#1): la última auditoría matemática es FAIL y no existe ninguna auditoría independiente del HEAD que contiene las correcciones de la cuarta pasada; con ello el §6.2 no puede darse por cumplido.
- Hay cinco defectos mayores (#2 a #6) y siete menores (#7 a #13). El puntaje (8.20/10) está por debajo de 9.5.
- Lo corregido de verdad, y comprobado por mí contra fuentes primarias: la regla M−2 (norma citada y confirmada por la tabla del SII), los montos y tramos, el mecanismo del APV, la UTA con su excepción en cuatro de seis lugares, la ausencia de «primer día hábil», «mes anterior» suelto, direccionalidad, aranceles, redondeo y «métrica prorrateada». Los cinco `check:*` y el build pasan.
- Para pasar a CONDITIONAL/PASS: resolver #2 a #5 y #7 a #13, completar el mapa de #6, ejecutar la ronda 4 del MathAudit sobre el HEAD resultante y repetir esta revisión en otra sesión nueva.

## Triage por bucket (`EDITORIAL_AI_PIPELINE.md` §9.2 / §9.4)

```
TRIAGE REPORT — utm-chile-que-es-como-funciona — 2026-11-10

Artifact folder: artifacts/editorial/utm-chile-que-es-como-funciona/20261029-1500-utm-audit/
Compliance status (06-compliance.md): Status: BLOCKED — DEFECTS FOUND
Publish packet status (07-publish-packet.md): sin línea "Status"; todas las casillas sin marcar

BUCKET A — Human-only (do not touch):
  - #6 mapa de identidad con IDs en 07 y declaración de irrecuperables; decisión sobre la exposición a claude-mem
  - #4(c) decisión de corte (2026-10-29 vs 2026-11-10) si se documenta una desviación en vez de rehacer el brief
  - #5(b) deferral del IGC si se decide no incorporar la tabla (requiere TODO:SOURCE documentado y juicio humano)
  - Sign-off de 07 y autorización de publicación

BUCKET B — Fresh-session re-audit required:
  - #1 MathAudit ronda 4 (ChatGPT, conversación nueva, ID registrado) sobre el HEAD corregido
  - Nueva revisión ComplianceAgent (Claude Code, sesión nueva) después de #2–#5 y #7–#13
  - #4(a)(b) dossier 02 y sources.yaml: ResearchAgent (ChatGPT) los actualiza; el MathAudit ronda 4 los contrasta

BUCKET C — Resolvable by a DraftAgent session (no por esta revisión):
  - #2, #3, #5(a)(c), #7, #8, #9, #10, #11, #12, #13 (ediciones de guía, glosario, conversor y correcciones.json)
  - #4(c) actualización de 01-brief.yaml y metadata.yaml, si el HumanEditor decide rehacerlos

Action this session: No action — este encargo solo permite informar; esta sesión no resolvió ningún ítem.
```

Este documento no marca casillas en `07-publish-packet.md`, no completa `humanSignoff` y no constituye aprobación. No edité el artículo, el glosario, el conversor ni `correcciones.json`; no hice commit ni merge. (Efectos de la ejecución local: `pnpm run build` generó `dist/` y `output/`, no versionados; el árbol de git quedó limpio salvo este archivo.)
