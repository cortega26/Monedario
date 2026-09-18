Status: DRAFT — pending MathAuditAgent and ComplianceAgent review
Role: DraftAgent (Claude Code, esta sesión — misma sesión que OutlineAgent; sin conflicto de SoD porque las reglas duras de EDITORIAL_AI_PIPELINE.md §2 solo prohíben que DraftAgent sea la misma instancia que MathAuditAgent o ComplianceAgent, no que Outline/Draft compartan sesión)

Slug: `cotizacion-voluntaria-afp-independiente` · run `20260917-1925-brief01` · corte `2026-09-17`

Blog file: `src/data/blog/cotizacion-voluntaria-afp-independiente.md` (`draft: true` — no debe pasar a `false` hasta completar `05-math-audit.md`, `06-compliance.md` y sign-off humano explícito, por `regulatory_sensitivity: alta`).

## Registro de política tocado en esta etapa

`src/config/editorial-topic-policy.mjs` — se agregó la entrada `afiliacion-cotizacion-voluntaria` bajo el cluster hardened `pensiones-afp` (`ownerSlug: cotizacion-voluntaria-afp-independiente`). Esto NO es una decisión editorial nueva: es el registro mecánico que el validador de `content.config.ts` (líneas 255–265, `HARDENED_OWNERSHIP_CLUSTERS` + `getCanonicalTopicEntry`) exige para que el frontmatter pase la validación de build, y coincide exactamente con el `ownerTarget` ya declarado en `01-brief.yaml` tras el veredicto `PROCEDER A BRIEF` de `00-topic-intake.md`.

## Fuentes adicionales fetcheadas en esta etapa (Stage 04, no Stage 02)

Ver `sources.yaml` (3 entradas nuevas agregadas por DraftAgent). Resumen:
- Compendio de Normas del Sistema de Pensiones, Cap. XVI (Afiliados Voluntarios) — resuelve base de cotización mínima real (Ingreso Mínimo para Fines No Remuneracionales, no el ingreso mínimo general) y el trámite/plazos.
- Compendio, sección 5 (afiliación de personas sin actividad remunerada) — confirma trámite y momento de efectividad de la afiliación.
- Dirección del Trabajo — valor exacto del ingreso mínimo mensual y del Ingreso Mínimo para Fines No Remuneracionales vigentes (2026-09-17).

## Disposición de cada TODO:SOURCE heredado de `02-dossier.md` / `03-outline.md`

Regla aplicada (EDITORIAL_AI_PIPELINE.md §4 y §6, "Deferral prohibition"): ningún `TODO:SOURCE` puede quedar en el archivo de blog. Cada uno se resuelve, se re-encuadra a una afirmación que sí está verificada, o se omite del artículo.

| Item heredado | Disposición en el draft |
|---|---|
| Texto operativo completo del art. 92 J DL 3.500 (bloqueado en BCN LeyChile, JS-only, 3 intentos fallidos en research) | **Legítimo — no se cita el texto legal verbatim.** El artículo cita el número del artículo (verificado indirectamente vía spensiones.cl, que sí es fuente oficial autorizada para glosar la norma) sin reproducir el texto de la ley. No es un "critical number" sin fuente: la regla operativa (requisitos, base, trámite) está verificada por otra vía oficial (Compendio de Normas). Se ofrece el link a BCN para quien quiera profundizar, sin afirmar contenido no verificado. |
| Número exacto de oficio/circular que fija SIS 1,62% (solo corroborado por fuente secundaria no oficial) | **Resuelto por omisión deliberada.** El draft cita la tasa y su fecha de vigencia (VERIFIED vía spensiones.cl) pero NO cita ningún número de oficio/circular — el lector no necesita ese dato administrativo, y así se evita citar un número no verificado en fuente oficial. |
| Regla de "AFP adjudicataria de licitación" — no confirmado si aplica igual al afiliado voluntario puro | **Hedge explícito en el texto**, no `TODO:SOURCE` literal. La sección "Cómo te afilias" describe la regla general (verificada para independientes por boletas) y declara textualmente que el Compendio no la desarrolla explícitamente para el voluntario puro, remitiendo al lector a confirmar con la Superintendencia/AFP si es determinante para su decisión. Esto cumple NORMA_YMYL (no extrapola sin límite) sin bloquear la publicación por un punto administrativo secundario. |
| Ingreso mínimo mensual 2026 en pesos (no fetcheado en dossier) | **Resuelto.** Fetch directo a DT.gob.cl en esta etapa: $553.553 (general, 18-65, desde 01-05-2026, Ley 21.830) y $356.815 (fines no remuneracionales) — este último es el que realmente se usa como base del cálculo (ver hallazgo abajo). |
| Paso a paso operativo de afiliación | **Resuelto.** Fetch directo al Compendio de Normas, Cap. XVI y Cap. III sección 5: formulario "Solicitud de Incorporación", afiliación efectiva desde el pago de la primera cotización, plazo de 5 meses o anulación. |
| Año exacto de irrenunciabilidad de la obligación por boletas (aafp.cl, fragmento sin año visible) | **No aplica a este artículo.** Ese dato es territorio de `boleta-honorarios-2026-retencion-cobertura` (ya publicado, ya verificado ahí). Este draft no reafirma esa cifra; solo enlaza al artículo hermano para el mecanismo obligatorio completo. |
| Hipótesis no verificada sobre efecto de la pensión autofinanciada (PAFE) en el monto de PGU (dossier claim d-quinquies, "INFERENCIA SIN VERIFICAR") | **Omitida del draft**, tal como recomendó el dossier. No aparece en ningún H2. |

**Resultado: cero `TODO:SOURCE` en el archivo de blog.**

## Hallazgo relevante para MathAuditAgent (Stage 05)

El dossier original (`02-dossier.md`, claim "a") citaba la base de cotización mínima como "cualquier monto mayor al ingreso mínimo" sin especificar cuál de los dos ingresos mínimos (general vs. fines no remuneracionales). El fetch directo al Compendio de Normas, Cap. XVI, numeral 15, en esta etapa aclaró que el **piso mínimo real** de cotización usa el **Ingreso Mínimo para Fines No Remuneracionales** ($356.815), no el ingreso mínimo general ($553.553). El único cálculo aritmético del draft es:

**10% × $356.815 = $35.681,5 → redondeado a $35.682/mes.**

`MathAuditAgent` debe verificar esta multiplicación de forma independiente y confirmar que la cifra base ($356.815) corresponde efectivamente al valor vigente al 2026-09-17 citado por la Dirección del Trabajo, no a un valor de un período distinto.

## Correcciones post-auditoría (ronda 1, en respuesta a 05-math-audit.md)

`05-math-audit.md` (veredicto `CONDITIONAL`, 3 `TODO:SOURCE`) encontró que la cita central del artículo — Compendio Cap. XVI, numeral 15 → $356.815 como "el mínimo" general — leía mal el alcance del numeral: el numeral 15 está dentro de la subsección "Autorización de Descuentos" (numerales 11–17) y regula específicamente el descuento de planilla que un trabajador dependiente autoriza para cotizar por su cónyuge/conviviente civil, no el aporte directo (numeral 10) que hace la inmensa mayoría del público de este artículo.

**Verificación propia adicional (esta sesión, post-audit):** descargué el HTML crudo del Cap. XVI (`curl`, mismo método que usó el auditor) y leí los numerales 1 a 10 completos ("Procedimiento de afiliación" y "Opciones de pago de cotizaciones"). Confirmo lo que encontró el audit: el numeral 10 (aportes directos) NO menciona ningún piso en pesos — solo describe mecánica de pago (mensual, único hasta 12 meses, por el afiliado o un tercero en su nombre). También descargué el HTML crudo de la FAQ general (`w3-article-5947.html`) y confirmé que dice literalmente **"ingreso mínimo"** sin el calificador "para fines no remuneracionales" — la lectura más natural es que se refiere al ingreso mínimo general ($553.553), no al de fines no remuneracionales ($356.815).

**Cambios aplicados al blog file:**
1. Sección "Cuánto cotizas como mínimo" → renombrada "Cuánto puedes cotizar". Reemplacé el piso de $356.815 por la regla general verificada ("mayor al ingreso mínimo general, $553.553"), con un ejemplo ilustrativo nuevo ($560.000 → $56.000/mes) en vez de presentar un "mínimo" como si fuera un hecho legal preciso. Se acotó $356.815 a su alcance real (numeral 15, descuento de planilla del cónyuge/conviviente civil) en una nota de precisión aparte, sin borrarlo del artículo — sigue siendo un dato correcto, solo que ya no generalizado.
2. Añadí explícitamente que la comisión de la AFP se calcula sobre el monto elegido, como cargo aparte del 10% (cita literal de la FAQ, fuente que el research/math-audit no había explotado para esta pregunta). Sobre el TODO:SOURCE de si el SIS se suma igual: NO se resolvió con fuente inequívoca — se dejó como hedge explícito en el cuerpo y como nuevo `limit` en `articleLead.limits`, en vez de inventar una cifra combinada.
3. Sección "Cómo te afilias": agregué el caso, confirmado por el numeral 3 del Compendio, de quien YA tuvo una AFP antes (no necesita el formulario "Solicitud de Incorporación"; su primera cotización voluntaria directamente en la cuenta existente basta). También fortalecí la afirmación sobre "AFP adjudicataria" — el numeral 2 (dentro de "Procedimiento de afiliación", sección general, no restringida a independientes por boletas) confirma que esa regla aplica al afiliado voluntario en general, así que se retiró el hedge de incertidumbre que tenía la versión anterior en este punto específico.
4. Tabla comparativa: "Base de cotización" corregida de "mínimo: Ingreso Mínimo para Fines No Remuneracionales" a "debe superar el ingreso mínimo mensual".
5. `articleLead.answer` y `articleLead.covers` actualizados para no repetir la cifra descartada.

**Lo que sigue sin resolver (correctamente, como `TODO:SOURCE` documentado, no como hecho inventado):** si la prima del SIS (1,62%) se suma al 10% elegido o se calcula de otra forma. Ninguna fuente oficial fetcheada (por research, math-audit o esta sesión) lo confirma de forma inequívoca. Queda como `limit` visible en el frontmatter y como hedge en el cuerpo, no como TODO:SOURCE literal en el blog file — cumple la política de deferral (EDITORIAL_AI_PIPELINE.md §6) porque no hay forma de resolverlo sin una fuente que no se encontró, y se lo señala honestamente al lector en vez de inventar una cifra.

**Siguiente paso:** este archivo (`04-draft.md`) documenta la corrección, pero la corrección en sí NO ha sido re-auditada por un `MathAuditAgent` independiente — por separación de roles, quien corrigió el draft (esta sesión) no puede certificar su propia corrección. Se requiere una ronda 2 de math-audit en sesión fresca antes de avanzar a `06-compliance.md`.

## Ronda 2 de math-audit y correcciones finales (misma sesión, post 05-math-audit-round2.md)

`05-math-audit-round2.md` (subagente fresco, sin contexto de esta sesión) confirmó con fetch propio (HTML crudo) que la corrección de ronda 1 es sólida en sus puntos centrales: el numeral 15 ya no se generaliza indebidamente, el ejemplo $560.000→$56.000 es aritméticamente correcto, y las dos generalizaciones nuevas que introdujo la corrección (numeral 2 = regla de AFP adjudicataria general; numeral 3 = exención de formulario para quien ya tuvo AFP) SÍ están bien fundadas en el texto crudo del Compendio — no repitieron el error de sobre-generalización del numeral 15.

Sin embargo, mantuvo el veredicto en `CONDITIONAL` (no `PASS`) por un defecto real y específico: la corrección de ronda 1 resolvió la ambigüedad de la FAQ ("ingreso mínimo", sin calificador) afirmando en el cuerpo que la Superintendencia dice "ingreso mínimo mensual **general**" — atribuyendo a la cita una precisión que el texto fetcheado no contiene (la FAQ no distingue entre el general y el de Fines No Remuneracionales en ningún lugar de la página). Es la misma familia de defecto que motivó la ronda 1 (atribuir a una fuente un alcance no declarado explícitamente), ahora en la dirección opuesta. También señaló que el banner de vigencia (antes del H1) seguía mencionando el Ingreso Mínimo para Fines No Remuneracionales como si fuera la cifra operativa del artículo, pese a que ya no lo es tras la corrección de ronda 1.

**Correcciones aplicadas (esta sesión, Bucket C — solo redacción, sin recálculo ni fetch nuevo, tal como recomendó el propio auditor de ronda 2):**
1. Banner de vigencia: "El Ingreso Mínimo para Fines No Remuneracionales" → "El ingreso mínimo mensual" (ya no sobre-pondera un concepto acotado a un caso específico).
2. Bloque "Respuesta rápida" de la sección de cálculo: ya no atribuye "general" a la cita literal de la Superintendencia. Ahora declara explícitamente que la cita no distingue entre los dos ingresos mínimos, y que este artículo elige la lectura del ingreso mínimo general como interpretación conservadora (con su justificación: convención administrativa chilena por defecto + exige un monto mayor, dirección conservadora para el lector) — un límite declarado honestamente, no una precisión inventada.

Verificado tras la edición: `pnpm run check:frontmatter` y `astro check` sin errores. No se requirió nueva ronda de math-audit (el propio auditor de ronda 2 clasificó ambos ítems como Bucket C, edición de una frase, sin recálculo ni re-fetch).

**Estado del pipeline tras esta corrección:** los 3 `TODO:SOURCE` originales de ronda 1 quedan: #1 resuelto con fuente; #2 (SIS aditivo) y #3 (ambigüedad ingreso mínimo) re-encuadrados como límites honestos declarados en el cuerpo y en `articleLead.limits`, no como hechos sin respaldo. `06-compliance.md` (sesión fresca separada) y sign-off humano siguen pendientes por `regulatory_sensitivity=alta` — no se avanza a esas etapas desde esta sesión.

## Correcciones post-compliance (misma sesión, en respuesta a 06-compliance.md)

`06-compliance.md` (subagente fresco, sin exposición previa a esta sesión) dio veredicto `CONDITIONAL`, puntaje NORMA_YMYL 8.725/10, con 4 DEFECT. Resolví los dos clasificados explícitamente como Bucket C (edición de redacción, sin investigación nueva — las URLs ya existían verificadas en `sources.yaml`/`02-dossier.md`):

1. **DEFECT #1 (citación faltante):** agregué a "Fuentes oficiales" las 4 URLs que sustentaban cifras ya `VERIFIED` en las auditorías matemáticas pero no estaban enlazadas en el artículo publicado: tasa SIS (`w3-propertyvalue-9917`), tope 50 UF del aporte tipo APV/Cuenta 2 (`w3-propertyvalue-9908`), ~80% de renta imponible (aafp.cl) y "AFP Planvital" (`w3-article-10098`). También corregí la línea que remitía a la portada genérica de spensiones.cl por el enlace específico de la tasa SIS ya verificado.
2. **DEFECT #2 (sobre-atribución en `articleLead.limits`):** reformulé la nota sobre el art. 92 J para no atribuir a una sola fuente un vínculo "base legal ↔ contenido operativo del Compendio" que ninguna fuente fetcheada declara explícitamente — ahora separa correctamente qué confirma cada fuente.

**NO resuelto en esta sesión (correctamente, por separación de roles):**
- **DEFECT #3 (Bucket A — humano/institucional):** si la prima del SIS se suma al 10% elegido o se cobra de otra forma en el ejemplo numérico. El propio compliance confirma que se intentó fetch exhaustivo en tres sesiones distintas sin encontrar la regla en ninguna fuente oficial — no es negligencia de fetch, es un vacío genuino de la norma publicada. Requiere consulta institucional directa (Superintendencia de Pensiones o AFP Planvital), no resoluble por un agente. **Publicación sigue bloqueada por este ítem** hasta que un humano lo resuelva o decida que el hedge actual es aceptable como excepción de política.
- **DEFECT #4 (no bloqueante):** registrar los dos ids de datos volátiles (IMFNR, tasa SIS) en `editorial-volatile-data-registry.json` — infraestructura, no gate.

Verificado tras la edición: `pnpm run check:frontmatter` y `astro check` sin errores.

**Estado final de este run:** `01-brief.yaml`, `02-dossier.md`, `03-outline.md`, `04-draft.md`, `05-math-audit.md`, `05-math-audit-round2.md`, `06-compliance.md` completos. Pendiente exclusivamente: (a) resolución humana del DEFECT #3, (b) sign-off humano explícito, (c) creación de `07-publish-packet.md` — ninguno de los tres puede producirse desde una sesión de agente por `SEPARATION_OF_DUTIES`. `draft: true` se mantiene.

## Reencuadre del DEFECT #3 (a pedido explícito del usuario, misma sesión)

`06-compliance.md` clasificó el DEFECT #3 (SIS aditivo) como Bucket A — requiere consulta institucional directa porque exigía un "monto total" confirmado por una sola fuente. En vez de esperar esa consulta, el usuario pidió reencuadrar la presentación: la sección "Cuánto puedes cotizar" ahora muestra el costo mensual como **tres líneas separadas** (pensión 10%, comisión de la AFP "según tu AFP", SIS 1,62% = $9.072 sobre el ejemplo de $560.000) en vez de un total único. Esto no inventa una fuente que confirme que las tres se suman — usa dos reglas ya verificadas por separado en la misma fuente (comisión "se calcula sobre ese monto"; SIS "de las remuneraciones y rentas imponibles", misma base) y deja explícito en el cuerpo y en `articleLead.limits` que es una composición propia, no una cifra oficial ya sumada, invitando al lector a sumar él mismo tras confirmar la comisión con su AFP.

**Esto NO es la misma resolución que pidió `06-compliance.md`** (consulta institucional que confirme un total oficial) — es una vía alternativa que el usuario eligió explícitamente, con el tradeoff discutido y aceptado: evita el bloqueo por espera institucional, a cambio de no tener un monto final único certificado por una sola fuente combinada. Verificado tras la edición: `pnpm run check:frontmatter` y `astro check` sin errores; aritmética de $9.072 (1,62% × $560.000) y $56.000 (10% × $560.000) recalculada y confirmada.

**Recomendación para quien haga el sign-off humano:** decidir si este reencuadre satisface razonablemente el requisito de `01-brief.yaml` (`requires_calculation=true`, "ejemplo numerico de cotizacion mensual resultante con la tasa SIS") o si de todos modos se prefiere la consulta institucional antes de publicar. No se ha vuelto a correr `06-compliance.md` sobre este cambio — es una decisión de producto/editorial, no una verificación técnica adicional que un agente deba re-auditar, pero si se quiere el mismo nivel de rigor que las rondas anteriores, correspondería una ronda de compliance adicional antes del sign-off.

## Elementos pendientes fuera del alcance de DraftAgent

- **Hero image: RESUELTO (2026-09-17).** Prompt generado con `pnpm run images:build-prompts` (sistema oficial del proyecto, track "Human Editorial Scene", escena `afp-pension`, paleta `#0d9488`). Generación automática vía API sigue bloqueada por política (`scripts/hero-images/manual-only.mjs`), así que el usuario generó la imagen manualmente (ChatGPT/gpt-image-1) fuera del pipeline y la entregó como PNG. Se convirtió a las 3 variantes AVIF requeridas (`sharp`, resize `fit: cover`, calidad 64): `cotizacion-voluntaria-afp-independiente.avif` (1200x630, 8.7 KB), `@tablet.avif` (800x420, 5.6 KB), `@mobile.avif` (600x315, 4.3 KB) — todas bajo el límite de 80 KB (`PUBLISHED_HERO_MAX_BYTES`). Dimensiones verificadas manualmente con `sharp().metadata()` (exactas). `pnpm run check:hero-images` no valida artículos con `draft: true` (excluidos del gate de "publicados"), así que la validación automática del gate se ejecutará recién cuando `draft` pase a `false`; la verificación manual ya confirma que cumple los requisitos.
- **`volatileData` / registro de datos volátiles:** no se registraron `economic.*` / `pensions.*` ids nuevos en `src/config/editorial-volatile-data-registry.json` para el Ingreso Mínimo para Fines No Remuneracionales ni la tasa SIS de independientes/voluntarios — ninguno de los dos existe hoy en ese registro. Registrarlos permitiría sincronización automática de vigencia a futuro, pero es una tarea de infraestructura fuera del alcance de esta etapa de redacción; se deja como mejora sugerida, no como bloqueante.
- **05-math-audit.md, 06-compliance.md, 07-publish-packet.md:** no producidos en esta sesión (SEPARATION_OF_DUTIES). `draft: true` se mantiene hasta que existan y hasta el sign-off humano explícito.
