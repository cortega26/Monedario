Status: CONDITIONAL
Role: ComplianceAgent (Claude Code subagent, sesión fresca sin exposición previa)

Slug: `cotizacion-voluntaria-afp-independiente` · run `20260917-1925-brief01` · corte auditado: 2026-09-17

Objeto de revisión: `src/data/blog/cotizacion-voluntaria-afp-independiente.md` (estado actual, ya con las dos rondas de correcciones de math-audit aplicadas — verificado línea por línea contra `05-math-audit.md` y `05-math-audit-round2.md`, no asumido).

---

## 1) Método

Leí, en el orden exigido por el playbook: `NORMA_YMYL.md`, `01-brief.yaml`, `04-draft.md`, `05-math-audit.md`, `05-math-audit-round2.md`, `02-dossier.md`, `sources.yaml`, y finalmente el blog file publicado. No acepté ningún veredicto previo ("esto ya quedó resuelto") sin comparar yo mismo el texto actual del blog file contra la cita literal que cada auditoría registró. En particular confirmé por lectura directa que las dos correcciones "Bucket C" que `05-math-audit-round2.md` recomendó (línea de "Respuesta rápida" en la sección de cálculo, y el banner de vigencia) **sí están aplicadas** en el archivo actual — el banner ya no menciona el Ingreso Mínimo para Fines No Remuneracionales, y el párrafo de cálculo ya declara explícitamente que la cita de la Superintendencia no distingue entre los dos ingresos mínimos, en vez de atribuirle la palabra "general". Esto es una verificación puntual adicional que ningún artefacto previo había registrado como hecha por un tercero — la doy por hecha aquí, con fecha 2026-09-17.

También leí `context/CONTRACTS.md` → `CONTRACT.YMYL_RESPONSE_STRUCTURE` y las secciones de `EDITORIAL_AI_PIPELINE.md` sobre separación de roles (§2), política de deferral (§4/§6) y buckets de resolución (§9.2), citadas explícitamente por el playbook de este run.

---

## 2) Scorecard NORMA_YMYL (0–10, ponderado)

| Dimensión | Peso | Puntaje | Justificación |
|---|---|---|---|
| Respuesta ancla | 35% | 9.0 | La regla concreta (10% de un monto elegido, mayor al ingreso mínimo general $553.553, con cita literal y ejemplo $560.000→$56.000) aparece en `articleLead.answer` (resumen ejecutivo) y se desarrolla en la 3ª sección del cuerpo. No hay "rodeo" ni meta-proceso antes de dar el número. Se descuenta 1 punto porque el ejemplo numérico no incorpora la tasa SIS que el propio brief exige para este cálculo (ver DEFECT #3) — la "respuesta" de cuánto cuesta realmente cotizar queda incompleta. |
| Precisión + fuentes | 25% | 7.0 | 19/22 claims auditados VERIFIED, 0 ERROR en dos rondas de math-audit independientes, cero cifras inventadas. Pero se descuenta con fuerza por un hallazgo propio que ninguna ronda de math-audit verificó (esas rondas comparan cifra↔fuente en el artefacto, no cita↔artículo publicado): **al menos 4 cifras/afirmaciones VERIFIED en `05-math-audit.md` se citan en el cuerpo como "según la Superintendencia de Pensiones" sin URL específica en la lista "Fuentes oficiales" del blog file** — ver DEFECT #1. Se descuenta además por DEFECT #2 (sobre-atribución en `articleLead.limits`) y por el hedge SIS-aditivo que no encaja limpiamente en las excepciones de deferral de NORMA §2.4 (DEFECT #3). |
| Vigencia + calendario | 15% | 10.0 | Banner de vigencia (2026-09-17), `articleLead.validAsOf`, fechas explícitas por cada cifra (ingreso mínimo desde 01-05-2026, SIS desde abril 2026, PGU desde 01-02-2026), `reviewPolicy` semianual. No hay reforma/calendario en juego (no aplica el bloque "aprobado/vigencia/implementación"). Sin defectos. |
| Excepciones + cobertura | 15% | 9.5 | Desambiguación explícita "cotización voluntaria" (afiliación vs. APV/Cuenta 2) desde el primer H2 — exactamente lo que pedía el brief. Corrección correcta del mito PGU. Salud tratada como trámite aparte. Cobertura SIS condicional bien explicada. FAQ cubre los casos de borde relevantes. |
| Claridad + estructura | 10% | 9.0 | Estructura coherente, sin contradicciones internas detectadas entre cuerpo/tabla/FAQ/frontmatter. Tabla comparativa correctamente etiquetada "resumen orientativo" con limitador de alcance visible (cumple el MUST #7 de NORMA_YMYL y el requisito 4 de `CONTRACT.YMYL_RESPONSE_STRUCTURE`), aunque no reproduce el texto exacto sugerido en NORMA §3.2 (falta enumerar "antigüedad exacta, topes legales, interpretación administrativa/judicial" — ver nota no bloqueante en §3(vi) abajo). |

**Total ponderado: 0.35×9.0 + 0.25×7.0 + 0.15×10.0 + 0.15×9.5 + 0.10×9.0 = 8.725/10**

Por regla de NORMA_YMYL §7 ("cualquier articulo con < 9.5 no se publica"), el puntaje por sí solo ya excluye `PASS`, independientemente de la clasificación de defectos.

---

## 3) Verificación de los tres puntos específicos que el playbook pidió revisar con especial cuidado

**(i) Art. 92 J del DL 3.500 sin texto verbatim — ¿deferral aceptable bajo §2.4?**
Juicio propio (no heredado de math-audit): NORMA_YMYL §2.4 lista como ejemplo explícito de **deferral ilegítimo** "Ley creadora de un beneficio (BCN tiene todos los textos legales chilenos)" — en el sentido estricto de la letra de la norma, tratar a BCN como inaccesible no es, por sí solo, una excusa válida. Sin embargo, este caso es distinguible del ejemplo ilegítimo de la norma en un punto decisivo: el artículo **no defiere al lector la respuesta operativa** (requisitos, tasa, trámite, plazos) — toda esa sustancia está verificada por fetch directo a fuentes oficiales alternativas (Compendio de Normas, spensiones.cl, Dirección del Trabajo). Lo único que no se reproduce es el texto legal crudo del art. 92 J, y esto se declara transparentemente como `limit` en el frontmatter, no se oculta. Además hay evidencia técnica real de intento (3 intentos documentados en `02-dossier.md`, incluyendo inspección del HTML crudo devuelto, confirmando que es un shell JS de SPA, no una negativa perezosa) y el número de artículo sí queda verificado indirectamente vía fuente oficial secundaria (spensiones.cl citando literalmente el artículo). **Conclusión: aceptable bajo una lectura razonable de §2.4, aunque es un caso límite que NO calza en ninguna de las dos categorías textuales de la norma (no es "no público", no es "intrínsecamente individual") — es una tercera categoría no contemplada por la norma: barrera técnica de renderizado verificada con evidencia, sobre una fuente cuyo contenido operativo SÍ está cubierto por vía alternativa oficial.** No lo clasifico como DEFECT, pero señalo el vacío de la norma para que `AGENTS.md`/`NORMA_YMYL.md` lo consideren en una futura revisión de política.

**(ii) Los dos límites declarados (SIS-aditivo, ambigüedad ingreso mínimo) — ¿cumplen el estándar de "resumen orientativo"/límite honesto o son deferrals ilegítimos?**
- **Ambigüedad ingreso mínimo:** RESUELTO adecuadamente en el texto actual (ver §1 arriba) — el artículo declara explícitamente que la cita no distingue entre los dos ingresos mínimos y explica su elección conservadora con razones. Esto cumple NORMA §3.1 (inferencia etiquetada + limitador de alcance). No es un defecto.
- **SIS-aditivo:** NO cumple limpiamente el estándar. Es un límite declarado honestamente (no se inventa una cifra), pero el hedge en el cuerpo ("confirma el costo total con tu AFP") sigue siendo, en sustancia, un deferral — y no encaja en ninguna de las dos excepciones legítimas de §2.4. Ver DEFECT #3.

**(iii) Tabla comparativa — ¿etiqueta visible "Resumen orientativo" con limitador?**
Sí. Encabezado H2 literal "Cotización voluntaria vs. obligatoria por boletas — resumen orientativo" + oración inmediatamente debajo que declara la simplificación y remite a verificación del caso concreto. Cumple requisito 4 de `CONTRACT.YMYL_RESPONSE_STRUCTURE`.

**(iv) Vigencia/marco temporal declarado explícitamente?**
Sí, cumple ampliamente (ver fila "Vigencia + calendario" del scorecard). Cumple requisito 2 de `CONTRACT.YMYL_RESPONSE_STRUCTURE`.

**(v) "AFP adjudicataria" como regla general — ¿presentada con el nivel de certeza que la fuente permite?**
Sí, en cuanto a la generalización misma (numeral 2 del Compendio, aplicable a todo afiliado voluntario y no solo a quien se afilia por boletas): fue verificada de forma independiente dos veces con fetch de HTML crudo (por DraftAgent tras ronda 1, y por MathAuditAgent en ronda 2, sesión fresca, sin repetir el error de sobregeneralización del numeral 15). La afirmación en el blog file no excede lo que el numeral 2 permite. Pero el nombre concreto de la AFP hoy adjudicataria ("hoy, AFP Planvital", línea 112) — verificado por fetch propio en ambas rondas de math-audit vía `w3-article-10098` — **no tiene su URL en la lista "Fuentes oficiales" del blog file**. Es el mismo defecto de citación que DEFECT #1 (abajo), aplicado a este dato puntual.

**(vi) Etiqueta "resumen orientativo" — ¿coincide con el texto obligatorio de NORMA §3.2?**
Parcialmente. El MUST #7 de NORMA_YMYL (§1.1) exige, en su formulación operativa, solo que la síntesis se etiquete como "resumen orientativo" y **señale que puede variar por contrato/caso** — eso sí está cumplido literalmente ("no sustituye la verificación de tu caso concreto"). Pero §3.2 ofrece una nota-modelo más específica que enumera "contrato, antigüedad exacta, topes legales y eventuales reclamaciones o interpretación administrativa/judicial" — el blog file no reproduce esas dimensiones, solo una fórmula genérica. No lo clasifico como DEFECT bloqueante porque el MUST #7 (el requisito realmente bloqueante) sí se satisface, pero señalo el gap frente al texto sugerido de §3.2 como mejora recomendada, no como hallazgo que cambie el veredicto.

---

## 4) DEFECTS

Verificación de comando (no "grep mental"): ejecuté `grep -n "TODO:SOURCE\|Verifica\|confirma con\|consulta\|9917\|9908\|aafp.cl" src/data/blog/cotizacion-voluntaria-afp-independiente.md` y `grep -n "spensiones.cl\|dt.gob.cl\|aafp.cl\|w3-" src/data/blog/cotizacion-voluntaria-afp-independiente.md` sobre el archivo actual. Resultado enumerado abajo, base de DEFECT #1.

**DEFECT #1 — MODERADO (bloquea publicación como TODO:SOURCE, no como FAIL) — Varias cifras VERIFIED en `05-math-audit.md`/`05-math-audit-round2.md` se citan en el cuerpo como "según la Superintendencia de Pensiones" sin que su URL específica aparezca en la lista "Fuentes oficiales" (líneas 166–173) del blog file.**
La lista de fuentes del blog file solo contiene 6 URLs: `w3-article-5947`, `w3-propertyvalue-3628` (Compendio Cap. XVI), `w3-propertyvalue-9913`, `w3-propertyvalue-10531` (PGU), `w3-article-8060` (salud) y la del ingreso mínimo (DT). Confirmado por grep que **no están** en esa lista, pese a sustentar cifras VERIFIED citadas literalmente en el cuerpo:
- **Tasa SIS 1,62%/1,49%** (líneas 127 y 129, "según la Superintendencia de Pensiones") — la fuente que la math-audit verificó es `w3-propertyvalue-9917`; el artículo solo enlaza la portada genérica de spensiones.cl (línea 131), no esa página específica.
- **Tope 50 UF del aporte tipo APV/Cuenta 2** (línea 76) — fuente verificada `w3-propertyvalue-9908`, ausente de la lista.
- **~80% de renta imponible** (tabla comparativa, línea 159) — fuente verificada aafp.cl, ausente de la lista.
- **"hoy, AFP Planvital"** (línea 112) — fuente verificada `w3-article-10098`, ausente de la lista.

Esto es exactamente el escenario que el playbook de esta auditoría pide vigilar de forma expresa ("si el artículo dice 'según la Superintendencia de Pensiones' sin URL específica... eso es un defecto") y que ninguna ronda de math-audit detectó, porque ambas rondas verifican cifra↔fuente en el artefacto, no cita↔lista-de-fuentes-del-artículo-publicado — es un tipo de chequeo distinto, propio de Compliance. Además, la línea 131 ("Verifica siempre la tasa vigente en la Superintendencia de Pensiones") remite al lector a la portada genérica para un valor que el pipeline ya fetcheó y verificó con URL exacta — es el patrón prohibido de NORMA §2.2 ("consulta X" cuando el valor es concreto, público y ya fetcheado), aplicado aquí de forma leve pero real: no se evita dar el número (sí se da, 1,62%), pero se evita dar el enlace correcto que ya existe en el propio artefacto.
**Resolución:** Bucket C — agregar las 4 URLs faltantes a la lista "Fuentes oficiales" (y opcionalmente como enlaces inline en el cuerpo) y reemplazar el enlace de la línea 131 por la URL específica de la tasa SIS. No requiere nueva investigación: las URLs ya están documentadas en `sources.yaml`/`02-dossier.md`.

**DEFECT #2 — MENOR (Bucket C) — `articleLead.limits[2]` sobre-atribuye a la Superintendencia de Pensiones la confirmación del "contenido operativo" del art. 92 J, cuando `sources.yaml` registra explícitamente que ninguna de las dos páginas del Compendio fetcheadas menciona el art. 92 J.**
El texto actual dice: *"No reproduce el texto legal completo del art. 92 J del DL 3.500 (la Superintendencia de Pensiones confirma su contenido operativo; el texto en BCN LeyChile requiere consulta directa...)"*. Lo verificado realmente es: (a) el art. 92 J es la base legal, según `w3-article-6930` (fuente #9 del dossier); (b) el Compendio de Normas describe las condiciones operativas del mecanismo — pero **ambas páginas del Compendio fetcheadas (`w3-propertyvalue-3628`, `w3-propertyvalue-4085`) declaran explícitamente no contener referencia al art. 92 J** (ver `sources.yaml`, notas de retrieval). El enlace entre "la base legal es 92 J" y "el Compendio describe el contenido operativo" es una inferencia del pipeline, no una afirmación de una sola fuente — es la misma familia de defecto que motivó las dos rondas de math-audit (atribuir a una fuente una precisión/cobertura que no declara explícitamente), aplicada aquí a una nota de límites del frontmatter en vez de al cuerpo.
**Resolución:** Bucket C — reformular a algo como "el art. 92 J es la base legal según la Superintendencia de Pensiones (w3-article-6930); las condiciones operativas están descritas en el Compendio de Normas, que no cita el número de artículo directamente."

**DEFECT #3 — MODERADO (bloquea publicación como TODO:SOURCE, no como FAIL) — El ejemplo numérico de cotización mensual no incorpora la tasa SIS, pese a que el brief lo exige explícitamente, y el hedge correspondiente no encaja en ninguna excepción legítima de deferral de NORMA_YMYL §2.4.**
`01-brief.yaml` (`justificacion_requires_calculation`) exige textualmente "la tasa SIS aplicable a afiliados voluntarios, con al menos un ejemplo numerico de cotizacion mensual resultante". El artículo publicado da el ejemplo de la porción de pensión ($56.000 = 10% de $560.000) pero no lo conecta con la tasa SIS (1,62%) en una cifra final — se limita a decir "razonablemente... la prima del SIS si corresponde... confirma el costo total con tu AFP" (línea 100). Esto es, en sustancia, un deferral: se remite al lector a una tercera parte (su AFP) en vez de dar el "monto resultante" que el brief pide como entregable obligatorio del `requires_calculation=true`. Evalué si este deferral es legítimo bajo NORMA_YMYL §2.4 y **no lo es bajo ninguna de las dos categorías textuales**: la fuente no es "no pública" (se fetcheó repetidamente, en tres sesiones distintas, sin éxito en encontrar la regla) ni la respuesta es "intrínsecamente individual" (es una regla general de cómo se compone el costo total, no un caso por caso). Es un vacío genuino de desarrollo normativo — la norma chilena publicada, hasta donde el pipeline pudo verificar con fetch exhaustivo, simplemente no lo aclara en ningún documento oficial fetcheado — pero eso no lo convierte automáticamente en una excepción válida bajo la letra actual de §2.4; simplemente confirma que es un `TODO:SOURCE` genuino, no un caso de negligencia de fetch.
**Resolución:** Bucket A — requiere consulta directa e institucional (oficina de atención de la Superintendencia de Pensiones o de la AFP Planvital) para confirmar si el SIS/comisión se suman al 10% elegido, y luego recalcular el ejemplo numérico para reflejar el costo total real que el brief exige. No es tarea de re-cálculo aritmético (no hay error de matemática) ni de re-fetch adicional dentro del alcance de un agente — es Bucket A humano/institucional.

**DEFECT #4 — MENOR, no bloqueante (informativo/infraestructura) — Los dos valores críticos volátiles de este artículo (Ingreso Mínimo para Fines No Remuneracionales, tasa SIS de independientes/voluntarios) no están registrados en `src/config/editorial-volatile-data-registry.json`.**
El artículo declara vigencia manual correctamente (banner + `articleLead.validAsOf` + `reviewPolicy` semianual/180 días), por lo que esto no es un incumplimiento de NORMA_YMYL en sí. Pero para un artículo `regulatory_sensitivity: alta` con dos cifras que se reajustan periódicamente (confirmado explícitamente en el propio banner del artículo), la falta de registro en el sistema de datos volátiles del repositorio es un riesgo operativo de frescura a mediano plazo que vale la pena señalar, aunque ya está anotado como pendiente de infraestructura en `04-draft.md`.
**Resolución:** Bucket C/infraestructura — registrar ambos ids en el registro de datos volátiles. No bloqueante para este gate.

**Ningún otro DEFECT encontrado.** No hay violación de separación de roles, ningún `TODO:SOURCE` de `04-draft.md`/`05-math-audit*.md` que se haya "escapado" sin quedar señalado en algún artefacto — verifiqué esto contra las tablas de conteo de ambas rondas de math-audit y, para los deferrals literales, con grep real (comando citado arriba) sobre el blog file, no por inferencia.

---

## 5) Separación de roles — declaración

| Etapa | Agente/sesión | ¿Comparte instancia indebidamente? |
|---|---|---|
| Gate 00 (topic intake) + 01-brief.yaml | Claude Code, sesión de chat con el usuario | No aplica restricción de SoD a esta etapa. |
| Research (02-dossier.md, sources.yaml) | Claude Code subagent (general-purpose), sesión fresca, sustituyendo a ChatGPT por indisponibilidad de tokens (declarado en 01-brief.yaml) | No — Research no está sujeto a la restricción dura de §2; lanzado sin contexto de Gate00/brief. |
| Outline (03-outline.md) + Draft (04-draft.md + blog file) | Claude Code, misma sesión de chat con el usuario | Outline y Draft comparten sesión — **permitido explícitamente** por la regla dura de `EDITORIAL_AI_PIPELINE.md` §2, que solo prohíbe que DraftAgent comparta instancia con MathAuditAgent o ComplianceAgent. |
| Math-audit ronda 1 (05-math-audit.md) | Claude Code subagent, sesión fresca sin exposición previa al draft, sustituyendo a ChatGPT | No — instancia distinta de Draft. |
| Math-audit ronda 2 (05-math-audit-round2.md) | Claude Code subagent, sesión fresca sin exposición previa a la sesión que corrigió el draft ni a la ronda 1 | No — instancia distinta de Draft y de ronda 1. |
| Correcciones "Bucket C" post-ronda-2 | Misma sesión que Outline/Draft (declarado en 04-draft.md) | Permitido — son ediciones de redacción de una frase, sin recálculo ni re-fetch, clasificadas explícitamente como Bucket C por el propio auditor de ronda 2, que es la vía correcta según `EDITORIAL_AI_PIPELINE.md` §9.2 (Bucket C no requiere sesión fresca). |
| Compliance (06-compliance.md, este archivo) | Claude Code subagent, sesión fresca, sin exposición previa al draft ni a las auditorías más allá de leer los artefactos ya escritos | Correcto — instancia distinta de Draft, Math-audit ronda 1 y ronda 2. |
| Human sign-off | PENDIENTE | No aplica todavía — requerido por `regulatory_sensitivity: alta` antes de publicar. |

**Conclusión de SoD: sin violaciones.** La única "reutilización de sesión" (Outline+Draft, y Draft aplicando ediciones Bucket C) está expresamente permitida por las reglas duras del pipeline y fue documentada con transparencia en cada artefacto.

---

## 6) Veredicto final

**CONDITIONAL**

Justificación: cero defectos bloqueantes de tipo `FAIL` — no hay violación de separación de roles, y ninguna cifra crítica queda sin respaldo de fuente oficial **en la cadena de artefactos** (todas las fuentes existen y están documentadas en `sources.yaml`/`02-dossier.md`/las dos rondas de math-audit). Los defectos encontrados (#1 y #2) son de **citación** (la fuente existe y está verificada, pero no está enlazada en el artículo publicado) y de **precisión de una nota de límites** — ambos resolubles en Bucket C, sin investigación nueva, por lo que no alcanzan el umbral de "compliance error" que exigiría `FAIL` según la definición del playbook. Pero el puntaje ponderado NORMA_YMYL recalculado (**8.725/10**) queda muy por debajo del umbral de 9.5 exigido para `PASS`, y persiste un ítem genuino de la clase `TODO:SOURCE` (DEFECT #3 — SIS aditivo, sin fuente oficial que lo resuelva pese a fetch exhaustivo en tres sesiones distintas, y sin encajar limpiamente en las excepciones de deferral de NORMA_YMYL §2.4) que el propio brief exige resolver como parte del entregable de `requires_calculation=true`.

**Publicación bloqueada hasta:**
1. Resolver DEFECT #1 (Bucket C — agregar a "Fuentes oficiales" las 4 URLs verificadas y faltantes: tasa SIS, tope 50 UF, ~80% renta imponible, AFP Planvital; corregir el enlace de la línea 131 a la URL específica de la tasa SIS).
2. Resolver DEFECT #2 (Bucket C — reformular `articleLead.limits[2]` para no atribuir a una sola fuente un enlace 92J↔Compendio que ninguna fuente fetcheada declara explícitamente).
3. Resolver DEFECT #3 (Bucket A — consulta institucional directa sobre si el SIS/comisión se suman al 10% elegido; recalcular el ejemplo numérico si corresponde).
4. Sign-off humano explícito (obligatorio por `regulatory_sensitivity: alta`, independientemente de este veredicto).
5. (No bloqueante pero recomendado antes de publicar) Registrar los dos ids de datos volátiles pendientes (DEFECT #4).

No se modificó `src/data/blog/cotizacion-voluntaria-afp-independiente.md`, ningún artefacto anterior del pipeline, ni ningún gate de publicación. No se creó `07-publish-packet.md`. Ningún gate fue marcado como aprobado — eso es exclusivo de sign-off humano.
