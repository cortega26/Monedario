# Revisión de compliance — ronda 8 — devolucion-impuestos-fechas-compensaciones

Status: BLOCKED — DEFECTS FOUND — 9,525/10; falta evidencia de separación de funciones para la revisión del 2 de octubre. No se encontró un defecto en las dos correcciones de fuente revisadas.

Role: ComplianceAgent (Codex, revisión independiente y adversarial)

Veredicto: **FAIL**. La evidencia disponible no demuestra una infracción de separación de funciones, pero tampoco permite verificar quién redactó la revisión del 2 de octubre. El pipeline exige que esa separación quede documentada antes de publicar.

## 0. Alcance y método

Se leyeron NORMA_YMYL §§1.1, 5.1–5.3 y 7; `docs/editorial/DEFINITION_OF_DONE.md` §2; y `context/EDITORIAL_AI_PIPELINE.md`, incluidos §§2, 4, Stage 06 y §9. Se revisaron el artículo en el árbol de trabajo, su diff contra HEAD `4ebfafb42915c23acf1d735248b881009e9ae193`, `07-publish-packet.md`, `draft-fix-CHANGELOG.md` y `06-compliance-round7.md` solo como contexto.

Las fuentes SII se refetchearon el **2026-10-02** mediante sus URL oficiales directas, listadas abajo. La entrada de correcciones públicas se verificó de forma independiente. No se modificó el artículo, el paquete, el changelog ni el registro; este informe es la única escritura de esta revisión. No se ejecutaron pruebas ni se marcó ningún gate. La firma de `HumanEditor` sigue reservada.

## 1. Refetch de fuentes SII — 2026-10-02

| Fuente oficial y URL directa | Evidencia recuperada | Resultado frente al artículo |
|---|---|---|
| [FAQ SII 001.140.0516.011](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm) | ID `001.140.0516.011`; actualizada el 13-04-2026. Dice que la devolución por rectificatoria se recibe alrededor de tres semanas después de que el SII autoriza los montos a TGR. | Confirmado. El artículo agrega esta fuente a `articleLead.officialSources`, la enlaza junto a la afirmación de las tres semanas y la incluye en “Fuentes y referencias primarias”. La regla y la atribución son fieles a la FAQ. |
| [FAQ SII 001.140.3095.025](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm) | ID `001.140.3095.025`; actualizada el 03-07-2025. Distingue: (1) declaración con pago, 10% de los impuestos reajustados si el atraso no supera cinco meses; luego 2% por mes o fracción, con tope de 30%, más interés penal diario; (2) declaración tardía con devolución, multa de 1 UTM a 1 UTA; y (3) declaración sin pago “sin movimiento” o “calzada”, también 1 UTM a 1 UTA. | Confirmado. El artículo resume los tres resultados, conserva el tope y el interés penal, aclara que la FAQ no enumera ese interés para los dos últimos casos y remite el monto individual y la eventual condonación al caso personal. No promete un resultado individual ni hace un cálculo tributario. También aparece en `articleLead.officialSources`, junto al reclamo en el cuerpo y en la lista de fuentes. |
| [Portal SII Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/) y [índice de noticias SII 2026](https://www.sii.cl/noticias/2026/index.html) | Consulta en vivo: el portal corresponde a Operación Renta 2026; el índice de noticias muestra publicaciones hasta septiembre de 2026 y ninguna con calendario AT2027. La referencia a Operación Renta 2027 en el índice corresponde a una nueva DJ, no a un calendario. | La formulación acotada del artículo —no encontró calendario AT2027 en esas páginas al 02-10-2026— coincide con la consulta. No se infirió una fecha futura a partir del comunicado AT2026. |
| [Comunicado SII de calendario AT2026, 31-03-2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) | Publica depósitos el 29 de abril, 15 de mayo y 27 de mayo; cheques el 29 de mayo; cheque a domicilio sobre $3.000.000 y retiro en BancoEstado bajo esa cifra. | El calendario y el umbral del artículo coinciden. El diff contra HEAD no modifica la tabla ni la frase del umbral. |

## 2. Diff, frescura y paquete

- Las dos correcciones de ronda 7 quedan resueltas: FAQ específica junto a la regla de tres semanas y rangos oficiales de multa respaldados por FAQ `001.140.3095.025`.
- El artículo alinea `updatedDate: 2026-10-02`, `articleLead.validAsOf: 2026-10-02` y “Revisado el: 2026-10-02”. El cambio es sustantivo según NORMA §5.1 porque incorpora una fuente para un plazo concreto y amplía cobertura de rangos de multas. `draft-fix-CHANGELOG.md` documenta los cambios, su razón y las fuentes; el nuevo Addendum del paquete registra el corte actual y conserva las fechas históricas.
- El diff del paquete contra HEAD contiene solamente `## Addendum 2026-10-02`. El checklist histórico no se reescribió y los gates continúan sin marcar `[X]`.
- No hay cambios de `title`, `slug` ni `canonicalTopic`. El H1 deriva del título sin cambios; no hay una propiedad `canonical` explícita en el frontmatter ni cambio de ruta en el diff. El único encabezado cambiado es un H2 de encuadre del ciclo.
- La tabla de fechas AT2026 y el umbral `$3.000.000` no tienen hunk en el diff; siguen coincidiendo con el comunicado SII refetcheado.
- La corrección material quedó registrada en `src/data/correcciones.json`: entrada `devolucion-impuestos-plazo-y-multas`, fecha `2026-10-02`, página `/posts/devolucion-impuestos-fechas-compensaciones/`, con las dos FAQ como fuentes. La revisión confirma presencia y alcance de la entrada; no se ejecutó `check:correcciones`.

## 3. DEFECTS

### DEFECT #1 — MAYOR — Falta atribución del autor/sesión para el cambio del 2026-10-02

El paquete identifica al `DraftAgent` del run original como Claude Code, sesión `20260812-1420-lote0c`. El nuevo Addendum y `draft-fix-CHANGELOG.md` no identifican quién produjo la revisión del artículo del 2026-10-02 ni su rol/sesión. El pipeline §4 exige prueba documentada de que `DraftAgent`, `MathAuditAgent` y `ComplianceAgent` son instancias distintas; Stage 06 también requiere mapear los agentes que produjeron cada fase. La atribución de un run previo no demuestra quién hizo este cambio posterior.

No hay evidencia suficiente para afirmar que hubo una infracción real de separación de funciones. Sin embargo, la evidencia obligatoria para verificarla en esta revisión está incompleta y el gate editorial no puede darse por satisfecho.

**Resolución:** registrar en el changelog o addendum el rol y la sesión/instancia que produjo el cambio del 2026-10-02 y documentar su separación respecto de esta ComplianceAgent. Si aplica la regla de misma familia de modelo, dejar constancia de la sesión fresca exigida. Ruta: `artifacts/editorial/devolucion-impuestos-fechas-compensaciones/20260812-1420-lote0c/draft-fix-CHANGELOG.md` y/o `07-publish-packet.md`.

## 4. Scorecard NORMA §7

| Dimensión | Peso | Nota | Ponderado | Justificación |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9,5 | 3,325 | Conserva las fechas concretas y orienta sobre rectificatoria, atraso y revisión del siguiente ciclo. |
| Precisión + fuentes | 25% | 9,5 | 2,375 | Las dos FAQ nuevas se refetchearon y coinciden; las afirmaciones preexistentes no fueron objeto del refetch de esta ronda. |
| Vigencia + calendario | 15% | 10,0 | 1,500 | Los tres campos de frescura coinciden al 2026-10-02; AT2026 está cerrado y AT2027 se acota a las páginas consultadas. |
| Excepciones + cobertura | 15% | 9,5 | 1,425 | Diferencia pago, devolución y ausencia de pago; deja el monto individual y condonación sujetos al caso. |
| Claridad + estructura | 10% | 9,0 | 0,900 | Contenido trazable y organizado; el resumen de multas en la apertura es denso. |
| **Total** | **100%** |  | **9,525/10** | |

## 5. Separación de funciones y cierre

| Fase relevante | Evidencia disponible |
|---|---|
| DraftAgent | El paquete atribuye el run original a Claude Code, sesión `20260812-1420-lote0c`; el autor/sesión del cambio del 2026-10-02 no está registrado. |
| MathAuditAgent | El paquete declara `requires_calculation=false`; no se requiere `05-math-audit.md` para este cambio. |
| ComplianceAgent | Esta revisión independiente de Codex; no se redactó ni editó contenido del artículo. |
| HumanEditor | Firma pendiente; permanece reservada al editor humano. |

**Veredicto: FAIL.** Las dos correcciones solicitadas están verificadas, el registro público ya incluye este cambio material y no hay discrepancia en la tabla AT2026, el umbral ni los datos de frescura. Sigue abierto el defecto de trazabilidad de autoría para el cambio actual; hasta documentar la atribución requerida, no se puede afirmar que la prueba de separación de funciones esté completa. No se declara una violación de separación de funciones ni se autoriza publicación. Todos los gates permanecen sin marcar.
