# Reauditoría delta de compliance — 2026-10-27

## Identidad, alcance y veredicto

- Checkout: `/tmp/opencode/wt-audit-descuentos`
- SHA auditado: `1bcbe16c01eb37936ba48b64dc499a5b4bc38787` (HEAD detached, como se especificó).
- Cambio de remediación: `0114d705cddd530dfe461fd0898cdd7cfda5cc99`; el otro padre de HEAD es `3fc293ede140aaba941f5018d76dbd06f418107f`.
- Modelo declarado: **OpenAI GPT-6** (Codex runtime; GPT-6 es el identificador exacto que expone esta sesión; no se expone identificador de build/revisión). La remediación declarada fue DeepSeek V4.1 Flash, por lo que son familias distintas.
- Fuentes primarias abiertas directamente y reconsultadas el 2026-10-27; extractos nuevos en [evidence/15](evidence/15-delta-reaudit-primary-sources-2026-10-27.txt). Evidencia del checkout y superficies en [evidence/16](evidence/16-delta-reaudit-local-surfaces-2026-10-27.txt). No se reutilizaron `evidence/11–14` como prueba.
- Alcance de resultado: D9, D10, D11, D12, D15 y D17. D1–D8, D13, D14, D16 (causa 2) y D18 no se reabren; no se detectó empeoramiento en las superficies diferidas inspeccionadas. `humanSignoff` permanece `null`.

**Veredicto: CONDITIONAL.** D15 y D17 se cerraron. D9, D10, D11 y D12 siguen abiertos por variantes o condiciones omitidas; además se registra D19 por una palabra que no coincide en una cita directa. No se satisfizo el criterio de cero defectos product abiertos.

## Revisión defecto por defecto

### D9 — cuota sindical y arts. 322–323

**Cambio verificado.** El cuerpo de `descuentos-de-sueldo.md:112` ya incluye: (a) persona no afiliada que acepta la extensión y debe la cuota pactada —total o parcial— según el acuerdo; (b) persona que cambia o deja el sindicato y sigue afecta al instrumento vigente, pagando la cuota ordinaria completa mientras dure ese instrumento.

**Trazabilidad y exactitud.** BCN, art. 322, condiciona la obligación del no afiliado a aceptar la extensión y pagar según acuerdo; el acuerdo requiere criterios objetivos, generales y no arbitrarios. Art. 323 limita la continuidad al instrumento del sindicato al que pertenecía y a su período vigente. Art. 262 regula el descuento y su requerimiento. La prosa del cuerpo respeta esos límites: no crea pago para quien no acepta extensión ni más allá de la vigencia del instrumento. DT ORD. 443/2026 se usa para la renuncia comunicada mientras existe requerimiento vigente, no para extender el alcance de los arts. 322–323.

**Residual.** La FAQ principal (`:195–196`) solo responde sobre afiliados y requerimiento sindical; `primer-empleo-chile-guia-completa.md:112` también deja la referencia como “si estás afiliado”. Estas copias breves aún no comunican los supuestos de no afiliación y exafiliación. El cuerpo corregido se reproduce en `llms-full.txt`; la pregunta en negrita no genera FAQPage con el extractor actual.

**Estado: OPEN.** La regla añadida al cuerpo es correcta y no crea una obligación inexistente; el hecho corregido no está propagado a todas las superficies editoriales relevantes.

### D10 — seguro de cesantía: 0,6%, casa particular y exclusiones

**Cambio verificado.** `descuentos-de-sueldo.md:108` añade que casa particular no paga el 0,6% a cargo del trabajador y que el 3% es de cargo patronal, y enumera aprendices, menores de 18 y pensionados con sus excepciones. La FAQ frontmatter de primer empleo (`primer-empleo-chile-guia-completa.md:46`) incluye la excepción de casa particular.

**Trazabilidad y exactitud.** Ley 19.728, art. 2, excluye contrato de aprendizaje, menores de 18 hasta cumplirlos y pensionados, con excepción de pensión por invalidez parcial o trabajador de casa particular. Art. 5 asigna el 0,6% a la persona trabajadora con contrato indefinido salvo casa particular, y financia el 3% de casa particular íntegramente con cargo al empleador cualquiera sea la duración. AFC distingue porcentajes y el tope AFC 135,2 UF de 2026; informa 11 años por relación laboral/cotización 133 y continuidad patronal de 0,8% al FCS después. Ley art. 7 requiere cotizar por cada remuneración, cada una hasta su tope, y mantener registros por empleador. No se atribuyen al art. 2 las categorías adicionales que AFC enumera en su FAQ.

**Residual en contenido relacionado y cálculo.** La excepción no se propagó a `descuentos-de-sueldo.md:156,173`, `primer-empleo-chile-guia-completa.md:110,191,224`, `liquidacion-de-sueldo.md:105` ni `sueldo-imponible-chile.md:96,109,156`, donde el 0,6% aparece como descuento general. Más claro aún, `seguro-de-cesantia.md:77` atribuye a casa particular 0,6% a cargo de la persona trabajadora y 2,4% patronal, contrario a Ley 19.728, art. 5. El resumen de la ley (`src/data/laws/ley-19728-seguro-cesantia.md:39–41`) sí indica 0% trabajador y 3% empleador.

El motor de sueldo líquido (`CalculateMonthlyPayrollBase.ts:3,92–110`) solo distingue `indefinido` y `plazo-fijo`; aplica 0,6% a todo contrato indefinido y no permite indicar casa particular. La página de calculadora muestra esa misma distinción sin excepción (`sueldo-liquido.astro:98–100,259,560–568,822–831`). Una trabajadora de casa particular con contrato indefinido no se puede representar sin que el motor le descuente el 0,6%. La página de cobertura `seguro-cesantia.astro:347–358` también presenta el reparto del contrato indefinido como explicación general y no incluye la variante doméstica; el resumen del mismo supuesto debe leerse junto con el artículo 5.

**Estado: OPEN.** El cuerpo y una FAQ mejoraron, pero hay variantes explícitas en tabla, artículos relacionados y cálculo. La atribución del aporte patronal está corregida en el cuerpo principal y es incorrecta en la tabla de `seguro-de-cesantia.md`.

### D11 — embargo del art. 57

**Cambio verificado.** `descuentos-de-sueldo.md:136` incorpora el exceso sobre 56 UF, hasta 50% y referencia a tribunal.

**Hallazgo.** El art. 57 permite embargar en general la parte que excede 56 UF. El 50% está limitado a tres supuestos: alimentos debidos por ley y decretados judicialmente; defraudación, hurto o robo cometidos por el trabajador contra su empleador en ejercicio de su cargo; remuneraciones adeudadas a personas que trabajaron para el deudor. El texto reformado dice “en supuestos como”, que deja abierta la lista; agrupa defraudación/hurto/robo sin la condición trabajador-contra-empleador-en-ejercicio-del-cargo y omite el tercer supuesto. La referencia a tribunal no repara esas dos brechas.

**Estado: OPEN.** El nuevo umbral y la referencia judicial son correctos; la regla de hasta 50% sigue demasiado abierta e incompleta.

### D12 — ORD. 1578, revisión semanal y jornada vigente

**Cambio verificado.** `descuentos-de-sueldo.md:142` distingue descuento del tiempo no trabajado de una multa, indica que el descuento no es inmediato y exige comprobar al término de la semana el incumplimiento imputable. También identifica las 45 horas como límite histórico del dictamen de 27-03-2018 y las 42 horas vigentes desde el 26-04-2026.

**Fuente.** ORD. 1578 rechaza el descuento inmediato por incumplimiento diario y requiere comprobar al término de la semana si la jornada convenida se incumplió por causa imputable. La DT confirma 42 horas desde el 26-04-2026 y 40 desde el 26-04-2028. La atribución está correcta.

**Residual.** La FAQ `descuentos-de-sueldo.md:192–193` responde que el descuento procede si el atraso es imputable y no repite la verificación semanal. Esa versión puede leerse como permiso de descuento inmediato.

**Estado: OPEN.** El cuerpo largo ya satisface la regla y fecha; la FAQ conserva una versión incompleta.

### D15 — lista prohibida del art. 58

**Cambio verificado.** `descuentos-de-sueldo.md:134` quitó la cita anterior a DT ORD. 2453/187 y enlaza directamente BCN, Código del Trabajo, art. 58, inciso 5. La reconstrucción del artículo confirma que ese inciso contiene la prohibición de deducir por habitación, luz, agua, herramientas, medicinas, atención médica, otras prestaciones en especie y multas no autorizadas en el reglamento interno.

**Hallazgo separado.** La fuente y el inciso son correctos. La cita publicada usa en singular el sustantivo sobre medicamentos que BCN presenta en plural. Se registra como D19, no como persistencia de la atribución anterior de D15.

**Estado D15: RESOLVED.** D19 queda OPEN.

### D17 — tasa de salud y tope

**Cambio verificado.** El cuerpo y `articleLead.officialSources` incorporan Superintendencia de Salud. Su página afirma que la cotización legal es 7% de la remuneración o renta imponible y explica el tope de 90 UF y máximo de 6,3 UF, atribuyendo el tope a la Superintendencia de Pensiones. El artículo mantiene la fuente SP para 90 UF de salud y 135,2 UF de AFC en 2026.

**Estado: RESOLVED.** La fuente nueva prueba la tasa; la fuente de 90 UF permanece bien atribuida.

## Reconstrucción del art. 58 y casos adversariales

La estructura normativa verificada en BCN, contrastada con DT ORD. 3456/37 y ORD. 262/4, queda así:

1. El primer inciso ordena deducciones legales obligatorias: impuestos, seguridad social, cuotas sindicales según la legislación y obligaciones con instituciones previsionales u organismos públicos.
2. El segundo permite pacto escrito para vivienda, ahorro para vivienda y educación propia/familiar; los créditos sin interés para esos fines pueden descontarse hasta 30% si se paga directamente a la institución financiera o servicio educacional.
3. El tercer inciso permite pagos de cualquier naturaleza acordados por escrito, con límite individual de 15% de la remuneración total.
4. El inciso cuarto establece 45% conjunto. La DT lo interpreta para los descuentos facultativos o permitidos de los incisos 2 y 3; los obligatorios, como el crédito social CCAF, no se suman a ese tope.
5. El inciso quinto prohíbe descuentos por habitación, luz, agua, herramientas, medicinas, atención médica, prestaciones en especie y multas no autorizadas por el reglamento interno. Los párrafos siguientes prohíben cargar impagos de efectos de comercio recibidos por autorización del empleador y pérdidas/daños causados por terceros cuando no hubo responsabilidad del trabajador; las autorizaciones y procedimientos de efectos de comercio deben constar por escrito.

Los límites 15%, 30% y 45% están bien descritos en el cuerpo principal: el 30% corresponde a créditos sin interés para vivienda/educación con pago directo, el 15% a pagos generales por escrito, y ambos quedan dentro del 45% conjunto aplicable a las deducciones facultativas/permitidas. No son topes sumables de 60%. La cuota sindical y el crédito social CCAF se tratan como obligatorios y fuera del tope conjunto interpretado para los incisos 2 y 3.

Casos revisados: no afiliado con extensión aceptada; exafiliado bajo instrumento vigente; casa particular; persona pensionada y excepciones de invalidez parcial/casa particular; aprendiz y menor de 18; pluriempleo con cotización por remuneración y registro por empleador; embargo judicial; topes 15/30/45. La corrección principal cubre varios casos, con los residuales enumerados en D9–D12.

## Rastro de las otras superficies

- **Cuerpo:** las modificaciones principales están en `descuentos-de-sueldo.md`; se localizaron FAQ/tablas residuales en ese archivo y en páginas relacionadas.
- **Metadatos:** `articleLead.officialSources` añade Superintendencia de Salud y BCN para arts. 57–58.
- **Datos estructurados:** el artículo no define `faqs:` frontmatter y las preguntas son párrafos en negrita, no H3. El extractor de `ArticleJsonLd.astro` solo genera FAQPage desde preguntas H3 o faqs frontmatter; la inspección fue de fuente, no del JSON-LD generado.
- **Catálogo/LLM:** `calculatorPortfolio.ts` no contiene tasas o afirmaciones concretas de estos artículos. `llms.txt` remite al archivo completo y `llms-full.txt` reproduce el cuerpo; por ello las FAQ y tablas residuales se copian allí.
- **Contenido relacionado y motor:** hallazgos D9/D10 anteriores; `seguro-de-cesantia.md:77` es una atribución incorrecta explícita y el motor de nómina no permite distinguir casa particular.
- **Tests estáticos:** se leyó `tests/static-analysis/descuentos-clasificacion-guard.test.ts`. Sus ocho casos cubren frases generales, topes y clasificación, pero no las distinciones de arts. 322–323, las excepciones AFC, todos los supuestos de art. 57, la verificación semanal/42 horas ni la nueva fuente BCN y su cita. No se ejecutó.

## Defecto nuevo

**D19 (baja, producto, OPEN):** `descuentos-de-sueldo.md:134` pone “entrega de medicina” entre comillas; BCN art. 58, inciso 5, dice “entrega de medicinas”. Es una diferencia textual en una cita directa. Se conserva D15 como resuelto porque la atribución a BCN y el inciso ya son correctos.

## Diferidos, reproducibilidad y limitaciones

La comparación del commit de remediación con su padre confirma cambios editoriales en las superficies del delta; la comparación de las superficies diferidas con el target no mostró cambios en los archivos revisados. D1–D8, D13, D14, D16 (causa 2) y D18 quedan en su estado anterior. No se completó humanSignoff.

Reproducción: preflight especificado por el usuario; `git rev-parse HEAD`; `git status --short --branch`; `git log -2 --oneline --parents`; diff del padre de remediación a `0114d705cddd530dfe461fd0898cdd7cfda5cc99`; `rg` y `nl -ba` sobre superficies citadas en evidence/16; apertura directa de cada URL listada en evidence/15 el 2026-10-27; `python3 -m json.tool` y `git diff --check` al cerrar. Entorno: Linux 7.0.0-38-generic x86_64, Python 3.13.12, Node v24.19.0, pnpm 11.7.0.

CodeGraph se inicializó en el worktree tras autorización explícita del usuario (946 archivos; 11.044 nodos; 27.942 aristas). La exploración confirmó la ruta del FAQ estructurado, la salida llms-full y el motor de nómina; se complementó con inspección directa de fuentes. No se ejecutaron tests ni build. La inspección de datos estructurados es solo de fuente; no se revisó salida generada ni runtime público. El veredicto no sustituye firma humana ni constituye una determinación de publicación.
