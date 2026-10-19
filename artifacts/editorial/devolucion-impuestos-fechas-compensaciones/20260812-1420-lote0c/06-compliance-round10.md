# Compliance — ronda 10 — devolución de impuestos

**Estado:** PASS de compliance, sin defectos MUST detectados; score NORMA §7
9,56/10. La firma y decisión final siguen pendientes de HumanEditor. Este
informe no es un sign-off ni declara publicable el artículo.

**Rol:** ComplianceAgent, revisión fresca e independiente.
**Fecha de auditoría y refetch:** 2026-10-03, America/Santiago.

## Alcance, independencia y método

Se revisaron el artículo `src/data/blog/devolucion-impuestos-fechas-compensaciones.md`
y `git diff HEAD`, NORMA_YMYL §§1.1, 5.1–5.3 y 7, DoD §2,
`07-publish-packet.md`, `draft-fix-CHANGELOG.md`, `src/data/correcciones.json`
y el informe R9 solo como contexto. Los hechos y la resolución del hallazgo
AT2027 se revalidaron contra las páginas oficiales abiertas en vivo el
2026-10-03; R9 no se tomó como evidencia actual.

La única ruta escrita por esta revisión es `06-compliance-round10.md`. No se
editaron el artículo, packet, changelog, registro ni gates; no se ejecutaron
pruebas ni se hizo commit. No fui DraftAgent.

## Fuentes oficiales refetcheadas

| Fuente | Resultado observado el 2026-10-03 | Evaluación del claim |
|---|---|---|
| [SII FAQ 001.140.0516.011](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm) | Actualizada el 13-04-2026. Indica que la devolución por rectificatoria se recibe alrededor de tres semanas después de que SII autoriza los montos a TGR, y permite consultar la autorización en línea. | Respalda el plazo aproximado en el artículo. La URL se enlaza en la misma frase del cuerpo (línea 84), en `articleLead.officialSources` y en referencias. |
| [SII FAQ 001.140.3095.025](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm) | Actualizada el 03-07-2025. Para declaraciones con pago, el impuesto impago se reajusta por IPC; multa de 10% si el atraso no excede cinco meses y luego aumenta 2% por mes o fracción, con tope de 30% del impuesto adeudado; también aplica interés penal diario vigente por semestre. Para declaraciones con devolución o sin pago, la multa se regula entre 1 UTM y 1 UTA. | Coincide con el resumen del cuerpo (línea 86), que diferencia los tres resultados y no da un monto individual. La URL está junto a la regla en el cuerpo y también en `officialSources` y referencias. |
| [Comunicado SII Operación Renta AT2026, 31-03-2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) | Publica depósitos el 29-04, 15-05 y 27-05; cheques el 29-05. Indica cheque a domicilio para devoluciones superiores a $3.000.000 y pago en cajas BancoEstado para montos inferiores. | Las fechas y el umbral visibles en la tabla y texto del artículo (líneas 92–104) coinciden. La tabla y el umbral no tienen hunk en el diff de esta ronda. |
| [Portal SII Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/) | Fetch directo completado, pero devolvió cero líneas de texto extraíble. El URL identifica el portal del ciclo 2026; el contenido no fue inspeccionable por esta interfaz. | La revisión no permite afirmar qué texto concreto contiene la página ni convertir la búsqueda en prueba exhaustiva. El artículo limita el resultado a los tres recursos revisados y aclara que no es una declaración del SII sobre otros recursos. |
| [Datos informativos SII AT2026](https://www.sii.cl/valores_y_fechas/renta/datos_informativos_2026.html) | El fetch muestra el encabezado “Datos informativos operación renta año tributario 2026” y opciones para personas, empresas y pequeños contribuyentes. | Confirma el alcance temático AT2026 de esa página; no prueba por sí sola una ausencia general de calendario AT2027. |
| [Índice de noticias SII 2026](https://www.sii.cl/noticias/2026/index.html) y [noticia del 01-09-2026 sobre DJ N°1965](https://www.sii.cl/noticias/2026/010926noti02pcr.htm) | El fetch directo del índice expuso solo controles de selección. La búsqueda web del índice devolvió entradas de 2026, entre ellas la noticia del 1 de septiembre; la noticia directa trata de la DJ N°1965 aplicable desde Operación Renta 2027, no presenta un calendario general de fechas. | Se revalidó independientemente la referencia contextual de la DJ. El fetch directo no permite describir exhaustivamente el índice; el texto del artículo evita inferir que el SII no haya publicado nada en otros recursos. |

### Alcance AT2027 y proximidad de enlaces

La afirmación nueva en `articleLead.answer` (artículo, línea 23) dice que,
en el portal Renta 2026, los datos informativos AT2026 y el índice de
noticias 2026 consultados al 2026-10-03, “no encontré” un calendario de
fechas AT2027. Añade expresamente que la búsqueda es acotada y no constituye
una declaración del SII sobre otros recursos. El párrafo del cuerpo (línea
88) formula la misma conclusión acotada; no atribuye al SII una negación
general. La nota de vigencia (línea 185) mantiene el mismo alcance. Así,
R9 queda resuelto: la conclusión no excede “no se encontró calendario
general en esos recursos”.

Interpreto “enlazadas junto a la afirmación” como enlaces visibles en su
contexto inmediato, no necesariamente embebidos en cada palabra de la misma
oración. En el lead, los tres nombres aparecen en `answer` y las tres URLs
correspondientes figuran en `officialSources`; el componente actual las
presenta en el panel “Fuentes oficiales” dentro de la misma tarjeta de
resumen, junto al texto de respuesta. En el cuerpo, los tres recursos están
enlazados directamente en el párrafo de AT2027. En la nota de vigencia, esas
URLs también aparecen juntas en la sección de fuentes inmediatamente
anterior. Con esa interpretación funcional, la proximidad está satisfecha;
no hallé una afirmación AT2027 sin fuente contextual. La limitación del
fetch del portal se conserva como límite metodológico, no como hallazgo de
contenido.

El cuerpo añade que el índice incluye el comunicado AT2026 y la noticia DJ
N°1965. La noticia de DJ se comprobó en su página oficial; aunque el fetch
directo del índice no extrajo sus entradas, la afirmación central se mantiene
acotada y no depende de ese detalle para sostener que no se encontró allí un
calendario general.

## Otras comprobaciones

- **Vigencia y actualización:** `updatedDate`, `articleLead.validAsOf` y
  “Revisado el” coinciden en 2026-10-03. La nueva cobertura sobre sanciones
  y la evidencia AT2027 son cambios sustantivos bajo NORMA §§5.1 y 5.3; no
  se hizo un cambio cosmético de fecha.
- **Corrección material:** `src/data/correcciones.json` conserva una entrada
  única `devolucion-impuestos-fechas-sanciones-atraso` fechada 2026-10-03.
  Describe las reglas de atraso, el plazo de rectificatoria y la corrección
  de alcance AT2027, con fuentes y prevención. Cumple el registro de NORMA
  §5.4; no se duplicó ni reescribió el historial.
- **Sanciones y cálculo:** el resumen conserva los componentes y categorías
  de la FAQ 3095. El texto dice expresamente que no se calcula multa ni se
  presume condonación para el caso individual. No hay operación matemática
  nueva que requiera `05-math-audit.md`; el packet indica
  `requires_calculation=false`.
- **Tabla y umbral:** las fechas AT2026 y el criterio superior/inferior a
  $3.000.000 siguen intactos y coinciden con el comunicado de 31-03-2026.
  Esta ronda no modifica su valor ni dirección.
- **DoD §2:** el H1 corresponde a la intención de fechas de devolución. La
  pieza tiene secciones funcionalmente equivalentes a qué cambia/qué hacer,
  pasos, casos frecuentes, errores, preguntas frecuentes, fuentes y
  vigencia; incluye el caso real de fechas AT2026 en la tabla. No detecté
  incumplimiento estructural de §2.
- **Packet:** el addendum R9 registra el corte y los tres recursos, sin
  marcar gates ni firmar. En el packet los `[X]` encontrados están dentro de
  frases que dicen que no se marcaron gates; no hay casillas de gate
  completadas por esta ronda. La firma humana sigue pendiente.
- **Separación de funciones:** el packet atribuye el draft original a otro
  agente; el changelog atribuye la reparación al DraftAgent. Esta sesión
  independiente solo auditó y escribió este informe. No encontré evidencia
  de que ComplianceAgent y DraftAgent sean la misma instancia.

## Scorecard NORMA §7

| Dimensión | Peso | Nota | Ponderado | Justificación |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9,6 | 3,360 | Fechas del ciclo cerrado y próximos pasos concretos; el estado AT2027 queda acotado por recursos y fecha. |
| Precisión + fuentes | 25% | 9,6 | 2,400 | Las dos FAQ nuevas coinciden con el resumen y están citadas en contexto; el calendario AT2026 coincide con el comunicado. |
| Vigencia + calendario | 15% | 9,5 | 1,425 | Señales de vigencia sincronizadas y afirmación AT2027 limitada; el portal devolvió cero texto extraíble, lo que reduce la verificabilidad independiente de ese recurso. |
| Excepciones + cobertura | 15% | 9,6 | 1,440 | Distingue pago, devolución y sin pago; no estima sanción individual ni promete condonación. |
| Claridad + estructura | 10% | 9,3 | 0,930 | Sigue una secuencia útil y cumple DoD §2; el párrafo de sanciones concentra varias condiciones y resulta denso. |
| **Total** | **100%** |  | **9,555/10** | **9,56/10 redondeado; alcanza NORMA §7 sin defecto MUST detectado.** |

## Veredicto y límites

**Veredicto de compliance: PASS (9,56/10; sin defectos MUST detectados).**
R9 queda resuelto con el alcance local de AT2027 y enlaces contextuales; el
plazo de rectificatoria, las reglas generales de sanción, vigencia, tabla,
umbral y registro material también pasan esta revisión. La única observación
no bloqueante es la densidad del párrafo de sanciones. El portal Renta 2026
no produjo texto extraíble en el fetch en vivo, por lo que no afirmo haber
inspeccionado exhaustivamente su contenido. No se cambió ni firmó ningún
gate; la aprobación final corresponde al editor humano.
