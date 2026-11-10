Status: BLOCKED — DEFECTS FOUND
Role: ComplianceAgent (Claude Code — fresh session, adversarial)

# Compliance — revisión YMYL adversarial

- Run id: `20261029-1500-utm-audit`
- Slug: `utm-chile-que-es-como-funciona`
- Superficies en alcance (según 04-draft): guía `src/data/blog/utm-chile-que-es-como-funciona.md`, conversor `src/pages/calculadoras/conversor-utm.astro`, glosario `src/data/glossary/utm.md`, registro `src/data/correcciones.json`.
- Fecha de revisión: 2026-10-29

## Evidencia de revisión (insumos leídos)

Se leyeron completos, en este orden, con la herramienta Read:

1. `docs/editorial/NORMA_YMYL.md` (284 líneas)
2. `.../01-brief.yaml` (15 líneas)
3. `.../04-draft.md` (77 líneas)
4. `.../05-math-audit.md` (48 líneas)

Por instrucción de la sesión no se leyeron otros archivos: ni `02-dossier`, ni el texto real de las tres superficies, ni `correcciones.json`, ni el plan. Por eso, toda afirmación del draft sobre el contenido de las páginas y sobre el estado "VERIFIED" del dossier es **declarativa y no la verificó esta sesión** (ver DEFECT #9). No se accedió a fuentes web.

**Revisión prompt-injection:** no se detectó texto con instrucciones dirigidas al agente dentro de los insumos. No hay ningún PROMPT_INJECTION_CANDIDATE.

## Scorecard NORMA_YMYL (§7)

| Dimensión | Peso | Puntuación | Justificación |
|---|---|---|---|
| Respuesta ancla | 35 % | 8.0 | La regla es afirmativa ("se reajusta mensualmente de acuerdo con el IPC"), pero la FAQ "¿Cuánto vale la UTM hoy?" responde con un valor histórico de septiembre y no da el valor vigente, que es público y se puede obtener por fetch (DEFECT #4). |
| Precisión + fuentes | 25 % | 6.0 | La regla crítica se apoya en fuentes SII solo parafraseadas, sin cita literal (DEFECT #2). 05 no audita la regla cualitativa (DEFECT #3). Los montos y tramos ISC preexistentes no tienen certificación (DEFECT #5). |
| Vigencia + calendario | 15 % | 7.0 | `validAsOf` 2026-10-29 sobre una respuesta ancla con valor de septiembre 2026 (DEFECT #6). |
| Excepciones + cobertura | 15 % | 8.0 | Se retiraron las subafirmaciones de IPC negativo/0 % sin un reemplazo acotado. Quedan "por inflación" y "siguen la inflación" (DEFECT #7). |
| Claridad + estructura | 10 % | 9.0 | La formulación única es coherente entre superficies, según la descripción del draft. |
| **Total ponderado** | 100 % | **7.45 / 10** | Por debajo del umbral de 9.5: no se publica (§7). |

## DEFECTS

DEFECT #1 — [BLOCKING] — Separación de funciones incompleta. MathAuditAgent comparte instancia (ChatGPT/Codex, sesión raíz continuada) con ResearchAgent y con la preparación del brief y del outline. Así, el mismo agente que construyó el dossier verifica los claims "contra el dossier" (columna "Source in 02-dossier" de 05). Eso no es una verificación independiente de las fuentes. Además, no se conservaron los IDs de sesión de Research, del brief/outline ni de MathAudit, ni el de la pasada residual de DraftAgent, por lo que la trazabilidad de la separación no se puede demostrar. — Resolution: repetir el math audit (o, como mínimo, la verificación de fuentes del dossier) en una sesión distinta de la de Research/brief, registrar los IDs de sesión de cada rol en el run y documentar en 04-draft el ID de la pasada residual (o declarar formalmente que es irrecuperable y que ese diff fue reauditado por una instancia independiente).

DEFECT #2 — [BLOCKING] — La regla crítica "La UTM se reajusta mensualmente de acuerdo con el IPC y el SII publica su valor para cada mes" se sostiene en SII Diccionario (`https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html`) y SII Educa (`https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html`), y el draft declara de forma expresa "parafraseado, sin cita literal". NORMA §1.1.4 exige, para fuentes públicas que se pueden obtener por fetch, citar el texto literal o el valor concreto con URL y fecha de recuperación. Ninguno de los insumos que leí contiene el texto literal de esas fuentes que acredite "mensualmente" y "de acuerdo con el IPC". Además, ninguna de las dos URL es una norma (ley o decreto) que fije el mecanismo de reajuste. Son páginas de divulgación del SII. — Resolution: agregar al dossier (y citar en 04-draft) el texto literal recuperado de cada URL con su fecha de consulta. Evaluar si existe base normativa específica (por ejemplo, la norma legal que establece la UTM en BCN) y citarla, o declarar en el dossier por qué no se usa.

DEFECT #3 — [BLOCKING] — 05-math-audit no audita la regla cualitativa central. Sus 5 filas cubren $71.721, la existencia de la tabla mensual, la fecha editorial, la ausencia de cambios numéricos y la pasada residual. "Reajuste mensual según IPC" aparece solo en "Límites", no como claim VERIFIED. La NORMA §6.2 exige que los valores VERIFIED de 05 estén en el artículo con fuente. El claim más crítico del cambio no tiene ese estado. — Resolution: que una instancia independiente agregue a 05 una fila con la regla, su fuente literal y su estado.

DEFECT #4 — [MAJOR] — Deferral injustificado en la respuesta ancla de la FAQ "¿Cuánto vale la UTM hoy?". Se responde con $71.721 rotulado como ejemplo histórico de septiembre 2026 y se remite a la tabla del SII, pese a que el valor del mes vigente (octubre 2026, a la fecha de revisión) es público en `https://www.sii.cl/valores_y_fechas/utm/utm2026.htm`. Ninguna condición de §2.4 justifica el deferral. — Resolution: citar en la FAQ el valor del mes vigente con fecha de recuperación (o mostrar el valor dinámico del snapshot, si existe en esa superficie) y dejar septiembre solo como ejemplo de cálculo. Si se decide no hacerlo, documentar `TODO:SOURCE` en 04-draft con la razón.

DEFECT #5 — [MAJOR] — Claims numéricos y tributarios preexistentes sin certificar y sin fuente oficial demostrada en los insumos: $834.504, $69.542, tramos ISC, $11.265.804 y $417.252. 05 declara expresamente que "no certifica nuevamente todos los ejemplos históricos y cálculos". Con todo, la guía sube `updatedDate` y `validAsOf` a 2026-10-29, lo que indica al lector que todo el contenido se revisó en esa fecha. El aviso nuevo afirma además que los montos "son ejemplos históricos de septiembre 2026 (salvo los que indican otro período)", y nadie verificó a qué período corresponde cada monto (por ejemplo, $69.542 no coincide con septiembre). — Resolution: verificar cada monto y tramo contra la tabla SII y el período rotulado, con una fila en 05 para cada uno, o acotar el aviso y `validAsOf` para que no los cubran.

DEFECT #6 — [MAJOR] — Incoherencia temporal. `articleLead.validAsOf` = 2026-10-29 acompaña una respuesta cuyo valor de ejemplo es de septiembre 2026 y que el propio texto describe como "no es el valor actual". `validAsOf` comunica vigencia a esa fecha, no una simple fecha de revisión. 05 lo trata como "fecha de revisión, no vigencia normativa", pero el campo publicado no hace esa distinción. — Resolution: alinear la semántica. O `validAsOf` refleja la fecha del valor citado, o el valor citado corresponde al período vigente al 2026-10-29 (enlaza con DEFECT #4).

DEFECT #7 — [MINOR] — Quedan formulaciones imprecisas que el draft dejó sin cambios a propósito: "reajustable mensualmente por inflación" (glosario) y "siguen la inflación" (tabla UTM/UF de la guía). Con IPC negativo la UTM no "sigue la inflación" en sentido estricto, y la UF se reajusta diariamente, no por mes. La fila de la tabla UTM/UF podría inducir a error si su redacción no separa ambos mecanismos. Esta sesión no puede verificarlo sin leer la superficie. — Resolution: unificar con la formulación "de acuerdo con el IPC" y comprobar que la fila de la UF describa su propio mecanismo de reajuste con fuente.

DEFECT #8 — [MAJOR] — Posible falta de registro de una corrección material. La pasada residual reemplaza "sube o baja con la inflación" y "aunque su equivalente en pesos suba mes a mes", y la pasada principal retira las subafirmaciones de IPC positivo/negativo/0 %. Son cambios de significado (§5.4: lo material se registra). La sección de la pasada residual en 04-draft no indica que la entrada `utm-reajuste-mensual-copy` de `correcciones.json` se haya ampliado para cubrirlos. — Resolution: confirmar o actualizar la entrada para que `wrong`/`right` incluyan las afirmaciones direccionales retiradas.

DEFECT #9 — [BLOCKING] — Evidencia insuficiente para certificar las superficies. Esta revisión solo pudo leer la descripción del cambio (04), no el texto publicado de la guía, el conversor ni el glosario, ni el dossier 02. 04 declara que no se ejecutaron tests ni `pnpm run check:correcciones`, y que el tipo de `MethodologyBlock.sources[].date` no se verificó. No hay forma de comprobar desde esta sesión la ausencia de "primer día hábil", "mes anterior" u otras frases. — Resolution: incorporar al run el diff completo de las tres superficies y de `correcciones.json`, junto con la salida de `check:correcciones` y del build, y someterlos a una nueva revisión de ComplianceAgent que tenga acceso a ellos.

DEFECT #10 — [MINOR] — Al eliminar el día de vigencia y el mes de IPC (decisión del brief, aceptada), la respuesta a "cómo funciona" ya no dice cuándo cambia el valor dentro del mes ni qué IPC se usa. La norma tolera esa omisión solo si se acompaña de una remisión explícita. 04 indica que se remite a la tabla SII, lo que es aceptable, pero no se declara como limitación conocida en una nota visible. — Resolution: añadir una línea que diga que el SII publica el valor aplicable a cada mes en su tabla y que el artículo no fija una regla de fecha, con la fuente.

Observación (no defecto): la Circular SII N.º 39 no se cita en las páginas ni se usa para deducir una fórmula de IPC (consta en 04 y 05). Esta revisión no la interpreta como fórmula.

## Separation of Duties

| Etapa | Agente / instancia | ID de sesión | ¿Comparte instancia? |
|---|---|---|---|
| Research (02-dossier) | ChatGPT/Codex, sesión raíz continuada | **Falta** | Sí, con brief/outline y MathAudit |
| Brief / outline (01, 03) | ChatGPT/Codex, sesión raíz continuada | **Falta** | Sí, con Research y MathAudit |
| DraftAgent (04) | Claude Code 2.1.312, sesiones nuevas | fa77c584-d098-4452-b2c5-edd03985bc4f, 203cab69-a498-41f7-ab50-e4bdef4ad31d, dd46ffd5-df19-4d89-a795-7f3f60fb6055 | No |
| DraftAgent, pasada residual | Claude Code, invocación nueva | **Falta** | Se desconoce (no verificable) |
| MathAuditAgent (05) | ChatGPT/Codex, sesión raíz continuada | **Falta** | Sí, con Research y brief/outline |
| ComplianceAgent (06) | Claude Code, sesión nueva y adversarial (esta) | No registrado por esta sesión | No (declarada distinta de las sesiones DraftAgent) |
| HumanEditor (07) | Pendiente | — | — |

**Evaluación:**
- Autoría frente a math audit: separadas en cuanto a DraftAgent.
- Autoría frente a compliance: separadas.
- Research frente a math audit: no hay separación. MathAudit verifica un dossier preparado por la misma instancia (DEFECT #1).
- Faltan los IDs de Research, brief/outline, MathAudit y la pasada residual.
- Conclusión: la separación exigida entre autoría, math audit y compliance **no se cumple de forma demostrable**.

## Veredicto final

**FAIL.**

Hay defectos bloqueantes:
- SoD con instancia compartida entre Research y MathAudit, e IDs faltantes (#1).
- Regla crítica sin cita literal de fuente oficial (#2).
- Regla central sin auditar en 05 (#3).
- Imposibilidad de verificar las superficies reales (#9).

Además hay defectos mayores: deferral del valor vigente, montos preexistentes sin certificar bajo una fecha de revisión nueva, incoherencia de `validAsOf` y una posible corrección material sin registrar. El puntaje es 7.45/10, por debajo de 9.5. No hay TODO:SOURCE declarados, pero DEFECT #2 y #4 equivalen a TODO:SOURCE sin resolver según §1.1.4 y §2.4.

Este documento no marca puertas en 07-publish-packet.md, no completa `humanSignoff` y no constituye aprobación.
