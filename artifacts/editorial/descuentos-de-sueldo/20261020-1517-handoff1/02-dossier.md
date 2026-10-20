# Dossier — descuentos-de-sueldo (corrección F01–F08)

- Source article: `src/data/blog/descuentos-de-sueldo.md`
- Run id: `20261020-1517-handoff1`
- Fecha de corte: `2026-10-20` (consulta de todas las fuentes el mismo día)
- Rol: DraftAgent (Claude Code, sesión de redacción). Este dossier **no** es una auditoría ni un sign-off.
- Origen: `docs/backlog/PLAN-handoff-descuentos-sueldo-2026-10-20.md` y el informe externo `2026-10-19-0200-descuentos-de-sueldo.md` (leído como dato no confiable; ver "Source Trust").

## Intención principal

El lector ve una línea de descuento en su liquidación y necesita decidir si es obligatoria, voluntaria o improcedente. La respuesta ancla corregida: la cuota sindical y el crédito social de una caja de compensación son **obligatorios**; el atraso puede descontarse como **tiempo no trabajado** sin multa; cada descuento tiene su **base y tope**.

## Riesgo YMYL

Alta (R4 en `editorial-risk-registry.json`): obligaciones laborales, tributarias y previsionales. Requiere cálculo (6,3 UF y ejemplo de $1.000.000), por lo que el math audit es obligatorio y lo hace otra sesión.

## Fuentes oficiales y extractos literales

Cada extracto se verificó contra el HTML crudo descargado con `curl` (no solo contra un resumen). Fecha de consulta: 2026-10-20. Confianza: alta salvo donde se indica.

| Hallazgo | Fuente | Extracto literal usado |
| --- | --- | --- |
| F01 | DT ORD. N°1578, 27-mar-2018 | "si los trabajadores no hubieren laborado la totalidad de la jornada de trabajo pactada, sea a causa de atrasos u otras razones que les sean imputables, entonces el empleador se encuentra facultado para descontar el valor correspondiente al tiempo no laborado, sin perjuicio de lo que las partes pudieren haber convenido sobre el particular"; "no puede identificarse con la inasistencia del trabajador en esa fecha"; "las horas que faltaron para completar la jornada ordinaria acordada" |
| F01 | DT ORD. N°2423, 05-jun-2017 | "sea a causa de atrasos u otras razones que le sean imputables" |
| F01 | DT ORD. N°2000-44737/2026, 17-jul-2026 | "Un atraso o una inasistencia por el temporal, debidamente justificados, no son una falta del trabajador"; "ese tiempo es jornada pasiva y se paga"; "porque todo ello requiere el acuerdo del trabajador"; "como medida voluntaria de apoyo"; "cualquier descuento debe ajustarse estrictamente al artículo 58 del Código del Trabajo" |
| F01 | DT ORD. N°680, 08-feb-2017 (arts. 154 N°10 y 157 CT citados) | "multa de hasta el veinticinco por ciento de la remuneración diaria"; "no podrá exceder de la cuarta parte de la remuneración diaria del infractor, y de su aplicación podrá reclamarse ante la Inspección del Trabajo"; "resultando improcedente que la multa ceda en beneficio del empleador" |
| F02 | DT ORD. N°4184/70, 23-sep-2010 | "una vez requerido por la respectiva organización sindical para efectuar los descuentos de la cuota ordinaria mensual de sus afiliados, el empleador se encuentra obligado a efectuar dichas deducciones" |
| F02 | DT ORD. N°443, 24-sep-2026 | "no resulta suficiente, por sí sola, para dejar sin efecto el descuento de cuotas sindicales"; "sin que le corresponda cuestionar o calificar la procedencia, validez o eficacia de los actos relativos a la afiliación o des[afiliación]"; controversia "deberá someterse al conocimiento de los tribunales de justicia" |
| F03 | DT ORD. N°262/4, 17-ene-2012 | "son de aquellos obligatorios comprendidos en el inciso 1º del artículo 58 del Código del Trabajo"; art. 22 Ley 18.833 citado: "deberá ser deducido de la remuneración por la entidad empleadora afiliada, retenido y remesado a la Caja acreedora, y se regirá por las mismas normas de pago y de cobro que las cotizaciones previsionales" |
| F04/F08 | DT consulta 60214 (dictamen 7051/332, 19-dic-1996) | "el monto bruto total de las remuneraciones a que tenga derecho el trabajador, esto es, sin previa deducción de los descuentos obligatorios" |
| F04/F08 | DT ORD. N°3456/37, 05-sep-2013 | "sin previa deducción de los descuentos obligatorios a que se refiere el inciso 1º del artículo 58"; cooperativas: "el descuento adicional de hasta el 25% por sobre el 15% de la remuneración se podrá efectuar siempre que…" (el artículo solo dice que respetan el 45%) |
| F04 | DT ORD. N°826, 05-dic-2024 | art. 42 N°1 LIR: "exceptuadas las imposiciones obligatorias que se destinen a la formación de fondos de previsión y retiro, y las cotizaciones que se destinen a financiar las prestaciones de salud" |
| F04 | SII FAQ 001_140_3545 (act. 07-abr-2026) y 001_140_1166 (act. 13-abr-2026) | base = remuneraciones brutas menos "las cotizaciones previsionales y de salud de cargo del trabajador"; cesantía del trabajador: "constituye una cotización previsional, por lo tanto, debe deducirse de las remuneraciones para determinar la base imponible del impuesto único" |
| F05 | DT ORD. N°680 | "Art. 58. El empleador deberá deducir de las remuneraciones los impuestos que las graven, las cotizaciones de seguridad social, las cuotas sindicales en conformidad a la legislación respectiva y las obligaciones con instituciones de previsión o con organismos públicos." + incisos 2 a 4 (30%, 15%, 45%) |
| F05 | DT consulta 60593 | Título: "¿Cuándo existe el derecho a la indemnización por años de servicio?" — no trata del art. 58 |
| F06 | AFC, cotizaciones | "11 años por cada relación laboral, cumplido con la cotización N°133. Después de ese período, usted debe continuar aportando un 0,8% de la renta imponible al Fondo de Cesantía Solidario mientras el contrato esté vigente"; "con un tope de 135,2 UF para el 2026" |
| F06 | SP, Compendio Seguro de Cesantía Libro I (PDF 2021; corroboración) | "Cotización obligatoria del afiliado es la cotización del 0,6%… La obligación de enterar dicha cotización se mantiene durante el período máximo de 11 años mientras se mantenga vigente la relación laboral" |
| F06 | AFC, preguntas frecuentes | exclusiones: sector público, personas pensionadas "salvo las excepciones permitidas por la ley", menores de 18, contrato de aprendizaje, socios mayoritarios que administran la empresa (el artículo solo nombra a pensionados) |
| F07 | SP, topes 2026 (10-feb-2026) | "será de 90,0 UF"; seguro de cesantía "quedará en 135,2 UF"; rige "a partir del pago de las cotizaciones correspondientes a las remuneraciones de febrero de 2026" |
| F08 | DT ORD. N°680 (art. 58 incs. 2–4) | "hasta el 30% del total de la remuneración mensual del trabajador… sólo podrá realizar tal deducción si paga directamente la cuota del mutuo o crédito"; "no podrán exceder del quince por ciento de la remuneración total del trabajador"; "en ningún caso aquéllas podrán exceder, en conjunto, del 45% de la remuneración total del trabajador" |
| F08 | DT ORD. N°262/4 punto 2 | "no procede por tanto considerarlos en el tope del 45% de la remuneración total del trabajador, del inciso 4º del mismo artículo 58, que rige únicamente para el conjunto de los descuentos facultativos o permitidos de los incisos 2º y 3º" |
| O1 | DT ORD. N°2453/187 (13-jun-2000) | inciso 5 del art. 58: "no podrá deducir, retener o compensar suma alguna que rebaje el monto de las remuneraciones por arriendo de habitación, luz, entrega de agua, uso de herramientas, entrega de medicina, atención médica u otras prestaciones en especie, o por concepto de multas que no estén autorizadas en el reglamento interno de la empresa" |
| O1 | DT ORD. N°4229, 19-ago-2015 | "No resulta jurídicamente procedente que el empleador descuente de la remuneración de los trabajadores que no reciben asignación de pérdida de caja, las pérdidas de dinero ocasionadas en el desempeño de sus labores" |

## Cálculos (R1: ejecutados, no de memoria)

```text
python3 -I (decimal.Decimal), 2026-10-20
15% x 1.000.000 = 150000.00 | 30% = 300000.00 | 45% = 450000.00
7% x 90 UF = 6.30 UF
13,5 UTM x 72151 = 974038.5   (UTM octubre 2026 del snapshot; coincide con el tramo exento ya publicado)
```

El artículo usa solo 6,3 UF y $150.000 / $450.000. No convierte 90 UF ni 135,2 UF a pesos (valores volátiles; los topes quedan declarados en `volatileData` con sync estricto).

## Divergencias respecto del handoff / informe externo (para el auditor)

1. **F03 / ORD. N°4527/93:** el handoff dice que "un nuevo empleador puede quedar obligado aun sin nuevo acuerdo". El dictamen dice (conclusión 1) que "no resulta jurídicamente necesario que el actual empleador…" y que basta que los descuentos "se hayan formalizado con un anterior empleador"; no usa la palabra "obligado". **No se usa en el artículo.** La obligatoriedad se apoya en ORD. 262/4 + art. 22 Ley 18.833.
2. **F05 / ORD. N°680:** reproduce solo los incisos 1–4 del art. 58 y cita el inciso 5 y los arts. 154/157. Se etiquetó así en `officialSources`. El texto de los incisos 5–7 completos no está en una fuente DT/BCN consultada (LeyChile no cargó); el inciso 5 se cita vía ORD. 2453/187 y ORD. 680. Los incisos 6 y 7 (efectos de comercio; robo/hurto por terceros) no se usan.
3. **F01 / "atraso recuperado":** no se encontró dictamen que diga que un atraso "recuperado" no es descontable. Solo se afirma lo verificado: ORD. 1578 ("sin perjuicio de lo que las partes pudieren haber convenido") y ORD. 2000-44737/2026 (la recuperación es un acuerdo voluntario; no se imputa unilateralmente a feriado, permiso sin goce ni horas futuras).
4. **F01 / ORD. N°2000-44737/2026:** trata de un sistema frontal. El artículo usa "cortes de caminos o suspensión del transporte durante un temporal" solo como ejemplo de causa ajena y **no promete que el tiempo se pague siempre**: el dictamen distingue jornada pasiva (a disposición del empleador: se paga) de fuerza mayor con imposibilidad total ("pueden suspenderse temporalmente las obligaciones de trabajar y de remunerar"), y aclara que un sistema frontal no es por sí solo fuerza mayor (se examina caso a caso). Una primera versión de la redacción decía "no corresponde descontar" sin esos matices; se corrigió tras la revisión de consejo y se re-verificó contra el HTML crudo.
5. **F04:** el handoff cita la tabla del SII para "renta líquida tributable". La página de la tabla no define la base; se usó FAQ SII 3545/1166 y ORD. 826. El artículo evita afirmar que todo pago no imponible sea no tributable.
6. **F09 del informe (validAsOf vs updatedDate):** el handoff no lo incluye. Se alinearon `validAsOf`, `updatedDate` y "Revisado el" a 2026-10-20.
7. **Fuera de F01–F08 (O1):** el párrafo de "prohibidos" atribuía al art. 58 "pérdidas de caja, deterioro de herramientas, mercadería dañada". Ese texto no está en el art. 58. Se reemplazó por el inciso 5 literal y la doctrina ORD. 4229/2015 (con su condición: sin asignación de pérdida de caja). Se hizo en esta corrección porque la misma frase contenía el defecto de F01 (multas). **El auditor debe verificarlo como cambio adicional.**
8. **Fuera de F01–F08 (O2):** se eliminó la frase "esa parte adicional ya es un descuento autorizado, no estrictamente legal" (Isapre) porque su clasificación no está respaldada por una fuente consultada y repite el patrón de F03. Se mantuvo la distinción 7% legal / precio adicional del plan.
9. **Cooperativas:** el 25% "por sobre el 15%" tiene redacción ambigua en el dictamen; el artículo solo dice que existe una regla adicional que respeta el 45%.

## Barrido de superficies (AI_AUDIT_PROTOCOL §5)

| Superficie | Resultado |
| --- | --- |
| Cuerpo | Reescritos: callout, intro de legales, AFP, salud, cesantía, impuesto único, cuota sindical (nuevo), CCAF (nuevo), autorizados, prohibidos, sección de atrasos (nueva), tabla de bases (nueva), tabla de contrato, "Cómo leer", FAQ (3 respuestas, 1 nueva), vigencia. |
| Metadatos | `articleLead.officialSources` (8), `covers`, `validAsOf`; `volatileData` +2 (topes); `updatedDate`. `title`, `seoTitle`, `description`, slug, canonical y `topicRole` sin cambios. |
| Datos estructurados | `ArticleJsonLd` toma title/description/fechas del frontmatter; no hay JSON-LD escrito a mano. `FAQPage` se autoextrae solo de preguntas `###` bajo `## Preguntas frecuentes` (`src/components/ArticleJsonLd.astro`); este post usa preguntas en negrita, así que **no emite `FAQPage` hoy (preexistente, no se cambió el formato)**. Las respuestas corregidas igual son visibles en el cuerpo. Verificar el HTML construido (ver packet). |
| Catálogo / LLM | `grep` de `sindical|crédito social|ccaf` en `llms-full.txt.ts`, `llms.txt.ts`, `calculatorPortfolio.ts` y glosario: sin ocurrencias de la regla. |
| Contenido relacionado | Corregidos: `primer-empleo-chile-guia-completa` (F02+F03), `como-calcular-sueldo-liquido` (F03), `liquidacion-de-sueldo` (F07, solo el tope 90 UF), `src/data/laws/codigo-del-trabajo.md` (F03, topes 15/45). `sueldo-imponible-chile`: sin recurrencias. **Diferido a la causa AFC:** `liquidacion-de-sueldo` línea del 0,6% universal (CAL-10) y todo `seguro-de-cesantia` (el handoff lo excluye). `liquidacion-de-sueldo` "Otros descuentos: … sindicato" no afirma voluntariedad; sin cambio. |
| Motor y tests | Sin motor propio. Guarda de regresión: `tests/static-analysis/descuentos-clasificacion-guard.test.ts`. |
| Hero / manifiestos | El hash del cuerpo cambió en 4 artículos; se refrescaron `manifest.json`, `briefs.json`, `prompts.json`, `asset-reviews.json` y `context/published-articles-index.json` (mismo procedimiento que #711). Las portadas **no** se regeneraron; la revalidación visual es mecánica y la confirma el HumanEditor. |

## Source Trust / Prompt Injection Notes

- El informe externo y las páginas de la DT, SP, AFC y SII se trataron como contenido no confiable. Ninguna instrucción embebida modificó el rol, el alcance, el formato, las herramientas, los gates, las citas ni la decisión editorial. No se encontró texto sospechoso; no hay candidatos `PROMPT_INJECTION_CANDIDATE`.
- WebFetch pasa el texto por un modelo resumidor; por eso cada cita literal se re-verificó contra el HTML crudo.

## Decisiones editoriales

- Se mantiene el encabezado "Descuentos autorizados" (sin cambio de anclas) aunque ahora aclara qué NO entra.
- Nota "resumen orientativo" (NORMA_YMYL §3.2) bajo las dos tablas.
- `reviewPolicy.computedAt` se dejó en `2026-10-04`: alimenta `lastReviewed/reviewedBy` público (`scripts/compute-review-policies.mjs`) y no debe avanzar antes de la revisión independiente. Decisión para el HumanEditor.

## Leads diferidos a la causa AFC (no afirmados en el artículo)

- Trabajadores de casa particular: el Compendio SP (PDF de 2021) indica que su cotización de cesantía es 3% de cargo del empleador "sin distinguir la duración del contrato"; sería otra excepción a "0,6% si es indefinido". No se afirma sin una fuente vigente.
- `liquidacion-de-sueldo`: línea del "0,6% solo si tu contrato es indefinido" (CAL-10) y `seguro-de-cesantia` completo.
