# Compliance YMYL — rentas mixtas — round 13

Status: **PASS — 9,71/10; publicación aún en HOLD por revalidación humana**
Role: ComplianceAgent (OpenAI GPT-6 — subagente fresco, independiente y adversarial)
Fecha: 2026-10-03 (America/Santiago)
Artículo revisado: `src/data/blog/rentas-mixtas-sueldo-honorarios.md`
Run: `20260812-1345-lote0b`

## Alcance y método

Revisé el artículo vigente y su `git diff HEAD`, el registro `src/data/correcciones.json`, el packet y changelog, `05-math-audit-round4.md`, NORMA_YMYL §§1.1, 5.1–5.3 y 7, Definition of Done §2, y las secciones pertinentes del pipeline editorial. Usé R12 como lista de defectos que debía volver a comprobar, no como fuente de hechos ni de veredicto.

No edité el artículo, packet, changelog ni registry; no ejecuté gates o tests y no marqué ni firmé ninguna casilla. Las fuentes externas se usaron solo como evidencia.

## Fuentes primarias refetchadas

Las páginas web SII se refetcharon el 2026-10-03, aproximadamente a las
04:37 UTC; la hora exacta no quedó registrada. El PDF de Línea 23 se abrió en
Chrome el 2026-10-03, sin hora exacta registrada: §§23.2 se leyeron en esa
vista en vivo; §§23.4 y 23.7 se cotejaron con la extracción completa
previamente guardada en `source-extract-l23-at2026.txt`.

| Fuente | Comprobación |
|---|---|
| [SII, Instrucciones F22 AT2026, Línea 23](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf), §§23.2, 23.4 y 23.7 | En la vista en vivo de Chrome, §23.2 confirma el límite mensual de 50 UF para el descuento por empleador y la reliquidación anual para aportes directos. La extracción completa previamente guardada confirma §23.4 (límite agregado de 600 UF y prelación APV B mensual, APV B directo y APV A) y §23.7 (los ahorros con rebaja mensual ya aplicada no se vuelven a registrar en el código 765). |
| [SII, FAQ de regímenes APV 001.140.5883.011](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm) | Distingue que A no rebaja la base al depositar y B sí, con tributación al retirar. La página informa actualización 2025-07-23. |
| [Superintendencia de Pensiones, Compendio, Capítulo XII](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html), nums. 5–7 | Confirma bonificación A de 15% destinada a anticipar o incrementar pensión, tope de 6 UTM y límite de aportes elegibles de diez veces las cotizaciones obligatorias del mismo año; especifica depósito TGR en la cuenta previsional. |
| [TGR, Convenios de pago](https://tgr.gob.cl/convenios-de-pago/) | Abrí el producto “Convenio para deudas vencidas de Impuestos Fiscales y Aduaneros”: hasta 24 cuotas, pie de 10%–30% sujeto al comportamiento de pago y existencia de garantía, y mínimo de 1 UTM. El artículo atribuye el rango a ese producto. |
| [Portal SII Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/) e [índice de noticias SII 2026](https://www.sii.cl/noticias/2026/index.html) | Ambos abiertos en Chrome. El portal visible corresponde a Operación Renta 2026; el índice llega a noticias del 1 de octubre. No encontré calendario AT2027 en esos dos recursos. La comprobación del artículo está fechada y acotada a esas páginas. |
| [SII, información Personas Naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html) y [FAQ de obligación por honorarios 001.140.0972.009](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0972.htm) | Refetch del umbral/tramo AT2026 y regla de obligación por honorarios; el valor citado en el artículo es 13,5 UTA / $11.265.804. Para el resto de los 25 grupos numéricos sin cambios, reaudité la cobertura y las referencias primarias en MathAudit R4; no recalculé nuevamente cada grupo desde cero. |

## Reauditoría de hallazgos R12 y restantes controles

### MUST

Ninguno abierto.

- **APV B / F22 (R12 #1): resuelto en el artículo vigente.** El texto separa la rebaja mensual por empleador, ya aplicada al IUSC y no repetida en código 765, de la rebaja anual por aportes directos vía reliquidación. También indica revisar la propuesta y corregirla solo si falta información, y evita afirmar que toda persona con APV B debe declarar por la misma razón. Cada regla se cita junto a las instrucciones SII §23.2/§23.7 y la FAQ APV. El tope/prelación se citan en la viñeta contigua con §§23.2/23.4.
- **Registro público AT2027 (R12 #2): resuelto.** La entrada existente `rentas-mixtas-apv-y-convenios` en `src/data/correcciones.json` incluye ahora la afirmación anterior amplia y su corrección acotada al portal e índice consultados, con fecha 2026-10-03 y fuentes. No se creó una entrada duplicada.
- **Estado del packet / sign-off (R12 #3): reconciliado y aún sin firma vigente.** El estado actual identifica el `[x]` como aprobación histórica de una versión anterior, conserva HOLD para esta versión y deja pendiente la revalidación de HumanEditor. La sección de checklist está rotulada como histórica. No interpreté esa casilla como sign-off actual ni la cambié. Esta revisión satisface el control de Compliance fresca que el packet pedía; el sign-off humano sigue pendiente.
- **Resto de claims críticos y cifras:** MathAudit R4 informa PASS, 25/25 grupos numéricos VERIFIED, 0 TODO y 0 ERROR. Reconfirmé la cobertura de umbral/tramo $11.265.804, retención 14,5% acotada a boletas 2025/AT2026, calendario AT2026 y cifras TGR/APV. El diff actual no altera montos, porcentajes ni tabla calendario; APV B y el estado AT2027 sí fueron contrastados de nuevo arriba. No encontré una afirmación crítica sin fuente oficial próxima.

### SHOULD

- **Trazabilidad de la versión de MathAudit R4:** R4 documenta que el artículo no tenía diff contra HEAD al momento de esa auditoría. El artículo vigente sí tiene cambios posteriores en fechas de revisión, redacción/citas APV B y observación AT2027. Los 25 grupos numéricos y la tabla calendario permanecen iguales, y los claims nuevos/cambiados fueron comprobados en esta revisión. Si se vuelve a editar el packet, conviene describir R4 como auditoría de los grupos numéricos que permanecen sin cambio y enlazar esta revisión para el texto APV B y la fecha AT2027, en vez de dar a entender que R4 examinó el diff posterior.

## Estructura, citas y preservación

- DoD §2: un solo H1; incluye los H2 requeridos para qué es/cambia, paso a paso, casos frecuentes, errores comunes, preguntas frecuentes y fuentes/vigencia; contiene un ejemplo numérico AT2026. **Cumple.**
- NORMA §1.1: respuesta concreta al comienzo; vigencia explícita; excepciones pertinentes; fuentes oficiales directas junto a los claims tributarios críticos; no hallé contradicciones entre respuesta, tabla, FAQ y cuerpo. La fecha `updatedDate`, `articleLead.validAsOf` y “revisado el” visible coinciden en 2026-10-03.
- NORMA §§5.1–5.3: el cambio de redacción APV B y la actualización acotada del estado del calendario son sustantivos y tienen fecha de revisión. La entrada del registry y el changelog registran qué cambió, por qué y con qué fuentes.
- El diff conserva title, slug, H1 y `canonicalTopic`; el frontmatter no declara un campo de URL `canonical`. El slug que determina la ruta pública no cambió. La tabla de fechas de depósito AT2026 y sus valores no cambiaron.

## Scorecard — NORMA_YMYL §7

| Dimensión | Puntaje | Peso | Ponderado |
|---|---:|---:|---:|
| Respuesta ancla | 9,8 | 35% | 3,430 |
| Precisión y fuentes | 9,6 | 25% | 2,400 |
| Vigencia y calendario | 9,8 | 15% | 1,470 |
| Excepciones y cobertura | 9,6 | 15% | 1,440 |
| Claridad y estructura | 9,7 | 10% | 0,970 |
| **Total** |  | **100%** | **9,71/10** |

## Separación de funciones y estado de publicación

| Etapa | Evidencia/procedencia | Resultado |
|---|---|---|
| Draft / cambios posteriores | Packet atribuye el run a DraftAgent; el changelog identifica las correcciones posteriores y sus fuentes. | Separado de esta instancia de Compliance. |
| MathAudit R4 | `05-math-audit-round4.md`, MathAuditAgent fresco/adversarial según el artefacto. | PASS para 25 grupos cuantitativos; alcance temporal precisado arriba. |
| Compliance R13 | Esta revisión independiente y fresca. | PASS, sin MUST abierto. |
| HumanEditor | Packet: revalidación de esta versión pendiente; la casilla marcada es histórica. | No firmada por este agente. |

**Veredicto de Compliance: PASS — 9,71/10.** Los dos hallazgos materiales de R12 que requerían corrección están atendidos, el estado histórico del packet está explicado y no queda un MUST abierto. La publicación sigue en **HOLD** hasta la revalidación y sign-off vigentes de HumanEditor. Este informe no marca gates ni autoriza publicación.
