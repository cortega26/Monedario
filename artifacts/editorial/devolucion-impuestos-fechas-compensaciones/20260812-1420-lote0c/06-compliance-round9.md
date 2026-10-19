# Compliance — ronda 9 — devolución de impuestos

Status: BLOCKED — DEFECTS FOUND

Role: ComplianceAgent (Codex, sesión fresca e independiente, adversarial)

Fecha de auditoría y refetch: 2026-10-03, America/Santiago.

## Alcance e independencia

Única ruta escrita: este informe. Se revisaron el artículo actual y su `git
diff HEAD`, `07-publish-packet.md`, `draft-fix-CHANGELOG.md`, el registro
`src/data/correcciones.json`, NORMA_YMYL §§1.1, 5.1–5.3 y 7, y
`docs/editorial/DEFINITION_OF_DONE.md` §2. Los informes de rondas anteriores
se trataron solo como contexto; los hechos señalados abajo se comprobaron
contra el checkout actual y fuentes refetcheadas. No se editaron artículo,
packet, changelog, registro ni gates. No se ejecutaron pruebas y no se hizo
commit.

## Fuentes oficiales refetcheadas

| Fuente (consulta 2026-10-03) | Evidencia viva | Evaluación |
|---|---|---|
| [SII FAQ 001.140.0516.011](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm) | Actualizada 13-04-2026. Dice que la devolución por rectificatoria se recibe alrededor de tres semanas después de que SII autoriza los montos a TGR. | Coincide con el artículo. La FAQ aparece junto a la afirmación de plazo, en `articleLead.officialSources` y en “Fuentes y referencias primarias”. |
| [SII FAQ 001.140.3095.025](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm) | Actualizada 03-07-2025. Distingue declaraciones con pago (reajuste IPC, multa 10% si el atraso no excede cinco meses, luego 2% por mes o fracción hasta 30%, e interés penal diario vigente por semestre) de declaraciones con devolución o sin pago (multa de 1 UTM a 1 UTA). | El resumen del artículo conserva esas categorías y componentes. No calcula una sanción individual ni promete un monto. La FAQ está citada junto al resumen, en `officialSources` y en referencias. |
| [Comunicado SII AT2026, 31-03-2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) y [FAQ SII de fechas 001.140.8951.001](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8951.htm) | Depósitos 29-04, 15-05 y 27-05; cheques 29-05. Comunicado: más de $3.000.000, cheque a domicilio; menos de $3.000.000, disponible en BancoEstado. La FAQ reproduce las tres fechas. | La tabla AT2026 y el umbral del artículo coinciden. Ninguna de esas líneas tiene hunk en el diff del artículo. |
| [SII FAQ 001.140.8366.009](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8366.htm) | Actualizada 14-04-2026. Explica datos bancarios y retenciones; también publica el sentido inverso del umbral: menos de $3 millones al domicilio y más de $3 millones en BancoEstado. | La contradicción de fuentes SII sigue publicada. El artículo acota expresamente el uso de esta FAQ a retenciones/datos bancarios y cita el comunicado AT2026 para el calendario y umbral. Refetch independiente de la [página SII del mecanismo de pago por caja AT2016](https://www.sii.cl/portales/renta/2016/pagodevimpxcaja.html): exige devolución igual o inferior a $3.000.000 para pago por caja y documenta el tope de $3.000.000 en BancoEstado. Esto corrobora la dirección del comunicado, aunque es material antiguo y no se usa como autoridad del ciclo AT2026. |
| [SII, datos informativos AT2026](https://www.sii.cl/valores_y_fechas/renta/datos_informativos_2026.html) | La página muestra “Datos informativos operación renta año tributario 2026”. | Confirma el contenido AT2026 de esa página, pero por sí sola no acredita la afirmación general de que el SII no haya publicado AT2027 en ningún recurso. |
| [SII, índice de destacados](https://www.sii.cl/destacados/index.html), [portal Renta 2026](https://www.sii.cl/destacados/renta/2026/) e [índice de noticias 2026](https://www.sii.cl/noticias/2026/index.html) | El índice de destacados muestra Renta 2026 (el fetch lo identifica como rastreado el mes anterior); el portal Renta 2026 se abrió hoy pero no devolvió texto extraíble; el índice de noticias devolvió solo controles de selección. La búsqueda del sitio por “Operación Renta AT2027 calendario” no devolvió resultados. | No se localizó calendario AT2027 en los recursos consultados. La extracción incompleta y un resultado de búsqueda vacío no prueban una ausencia general en todo el SII. |
| [SII FAQ 001.140.8954.001](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8954.htm), [FAQ 001.140.0595.014](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0595.htm) y [p7renta.htm](https://www.sii.cl/contribuyentes/p7renta.htm) | La primera explica la consulta de observaciones/compensación y rectificación por internet; la segunda indica cómo regularizar declaraciones de años anteriores; p7renta confirma la anotación “No declarante F22”, que puede impedir trámites, y regularización por internet para quien estaba obligado. | Respaldan las instrucciones generales y la anotación descrita. p7renta también respalda que la obligación depende de cada persona. |
| [ChileAtiende, Declaración de Renta](https://www.chileatiende.gob.cl/fichas/3178-declaracion-de-renta) | Fetch devolvió 403. | Limitación de verificación de esta referencia. Las afirmaciones críticas revisadas arriba tienen respaldo directo del SII. |

## Diff, vigencia y registro

- El diff del artículo contra HEAD actualiza `updatedDate` y
  `articleLead.validAsOf` a 2026-10-03; el párrafo inicial y la línea
  “Revisado el” también declaran 3 de octubre. La corrección sí es sustantiva:
  añade evidencia y cobertura concreta sobre el plazo de rectificatoria y las
  sanciones generales. Las fechas de revisión son coherentes con NORMA §§5.1
  y 5.3.
- `title`, `slug` y `canonicalTopic` no cambian; el H1 renderizado deriva del
  `title` y tampoco cambia. El archivo no declara un campo `canonical`
  explícito. El diff no contiene cambios de ruta.
- Las filas del calendario AT2026 y la frase del umbral $3.000.000 están
  intactas y coinciden con el comunicado AT2026 refetcheado. La FAQ 8366
  mantiene una contradicción con ese comunicado, pero el artículo delimita
  su uso y no la usa como evidencia del umbral.
- El diff de `07-publish-packet.md` añade solamente `Addendum 2026-10-03`.
  No reescribe el checklist histórico y no hay gates `[X]` ni firma humana.
- `src/data/correcciones.json` contiene la entrada material
  `devolucion-impuestos-fechas-sanciones-atraso`, fechada 2026-10-03, con la
  URL del artículo, los hechos corregidos y ambas FAQ como fuentes. Cumple
  NORMA §5.4.
- El changelog declara la reparación como trabajo de DraftAgent fresco. El
  packet identifica al DraftAgent del run original como Claude Code,
  sesión `20260812-1420-lote0c`; el changelog de esta reparación no da un
  identificador único de sesión. No encontré evidencia de que auditor y
  autor sean la misma instancia. Esta auditoría es una sesión nueva e
  independiente y no editó el draft. No se produjo `05-math-audit.md` porque
  `requires_calculation=false`; los porcentajes, topes y plazos se
  transcriben de fuentes oficiales, sin cálculo individual. `HumanEditor`
  conserva la decisión final y la firma.

## DoD §2 — estructura mínima

El H1 derivado del título coincide con la intención principal. Los H2
representan funcionalmente los apartados exigidos: el cierre de AT2026 y qué
hacer hoy (qué cambió / cómo proceder), la guía numerada y datos requeridos
(cómo se hace), “Si te pasa X, haz Y” (casos), errores, preguntas frecuentes,
fuentes y vigencia. La tabla de fechas AT2026 aporta un caso real con fechas
concretas. No encontré un defecto de estructura bajo DoD §2.

## DEFECTS

### DEFECT #1 — MAYOR — Alcance demasiado amplio para la afirmación negativa AT2027

`articleLead.answer` y el cuerpo afirman que “el SII todavía no publica el
calendario de la Operación Renta AT2027” (cuerpo, sección “Próximo ciclo”).
El registro de vigencia también dice que al consultar recursos oficiales no
se encontró calendario. Los refetches del 2026-10-03 confirman que la página
de datos enlazada contiene material AT2026 y que el destacado consultado
muestra Renta 2026; no recuperaron una declaración del SII que diga que no
existe publicación AT2027. El portal específico no entregó texto extraíble y
el índice de noticias tampoco permitió una revisión exhaustiva. Esto sustenta
“no encontramos calendario AT2027 en los recursos consultados”, no la
afirmación general de que el SII no lo publicó en ningún lugar.

Incumple NORMA §1.1 #4: la afirmación factual negativa no queda respaldada con
una fuente oficial directa que pruebe su alcance. El corte temporal del
artículo y la mención a datos AT2026 ayudan a contextualizarla, pero no
acotan de forma suficiente el conjunto de recursos revisados. También afecta
la Respuesta Ancla.

**Resolución:** acotar tanto `articleLead.answer` como el párrafo a los
recursos oficiales efectivamente revisados (“en las páginas SII consultadas
al 2026-10-03 no encontré un calendario AT2027”), y citar/listar esas páginas
concretas en el artículo. Si se desea mantener la afirmación general, hace
falta evidencia oficial explícita y exhaustiva. No corregido en esta ronda.

## Scorecard NORMA §7

| Dimensión | Peso | Nota | Ponderado | Justificación |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9,5 | 3,325 | Da el estado del ciclo AT2026 y acciones concretas; la afirmación AT2027 tiene alcance probatorio demasiado amplio. |
| Precisión + fuentes | 25% | 9,0 | 2,250 | Las dos FAQ nuevas coinciden y se citan en contexto; queda el defecto de evidencia para la afirmación negativa AT2027. |
| Vigencia + calendario | 15% | 9,0 | 1,350 | Fechas y umbral AT2026 coinciden; las señales de revisión están sincronizadas, con una limitación en el alcance de AT2027. |
| Excepciones + cobertura | 15% | 9,5 | 1,425 | Distingue declaraciones con pago, devolución y sin pago; no estima sanciones individuales ni promete aplicación de condonación. |
| Claridad + estructura | 10% | 9,4 | 0,940 | Secuencia útil y H2 funcionales; el párrafo de sanciones es denso, aunque conserva las categorías y condiciones. |
| **Total** | **100%** |  | **9,290/10** | **No alcanza 9,5; el defecto es bloqueante.** |

## Separación de funciones y veredicto

| Fase | Evidencia y estado |
|---|---|
| Draft original | `07-publish-packet.md` atribuye el run original a DraftAgent (Claude Code), sesión `20260812-1420-lote0c`. |
| Reparación 2026-10-03 | `draft-fix-CHANGELOG.md` la atribuye a DraftAgent editorial fresco; no consigna ID de sesión. |
| MathAuditAgent | No aplica cálculo según brief y packet (`requires_calculation=false`); no hay artifact 05 para este run. |
| ComplianceAgent | Esta ronda 9: sesión fresca e independiente; no redactó ni editó el contenido auditado. |
| HumanEditor | Decisión y firma pendientes. |

**Veredicto: FAIL.** El refetch confirma las dos correcciones materiales,
conserva el calendario y umbral AT2026 y el artículo registra la corrección
material. Sin embargo, permanece un DEFECTO MAYOR: la afirmación de que SII
no publicó calendario AT2027 excede lo que prueban los recursos consultados.
El score de 9,290/10 también queda bajo el mínimo de NORMA §7. No se declara
publicable el artículo; no se marca ningún gate ni se firma el paquete.
