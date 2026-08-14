# Compliance Review — devolucion-impuestos-fechas-compensaciones

Status: BLOCKED — DEFECTS FOUND
Role: ComplianceAgent (Claude Code — fresh session, adversarial), sesión `06-compliance-fresh-20260812`, sin exposición previa al draft ni a la sesión `20260812-1420-lote0c` que lo produjo.

## 0. Alcance de esta revisión

Revisión adversarial de la remediación Fase B (run `20260812-1420-lote0c`) sobre el hallazgo de la ficha de auditoría `output/audits/corpus-2026-08-12/fichas/devolucion-impuestos-fechas-compensaciones.md` (verdicto original FAIL 6,75/10; hallazgo principal R2 — ciclo AT2026 cerrado presentado como vigente). Se revisaron, en orden: NORMA_YMYL.md, la ficha original, `01-brief.yaml`, `02-dossier.md`, `03-outline.md`, `04-draft.md`, el archivo publicado real `src/data/blog/devolucion-impuestos-fechas-compensaciones.md`, y `07-publish-packet.md`. Todas las fuentes citadas se refetchearon en vivo el 2026-08-12/13 (no se confió en el fetch previo documentado en los artifacts).

Ningún contenido fetcheado (SII, WebSearch) contenía instrucciones embebidas dirigidas al agente; no se encontró texto que ameritara la etiqueta `PROMPT_INJECTION_CANDIDATE`.

## 1. ¿Se resuelve genuinamente el hallazgo R2 (ciclo cerrado presentado como vigente)?

**Sí, en la primera pantalla, sin ambigüedad.** `articleLead.answer` abre con "El ciclo AT2026 ya cerró" y el primer párrafo del cuerpo repite: "**Estado del ciclo AT2026 (revisado el 12 de agosto de 2026): ya cerró.**" El H2 inmediatamente siguiente se titula "Ciclo AT2026 cerrado: qué hacer hoy". No hay ninguna oración en presente/futuro inmediato que sugiera que el ciclo sigue abierto. El calendario de fechas se presenta explícitamente re-encuadrado ("(calendario del ciclo AT2026, ya ejecutado)") como referencia histórica, no como plazo vigente. R1 (ausencia de `articleLead`) también queda resuelto: existe `articleLead` completo y conforme al schema de `src/content.config.ts` (verificado campo por campo — `answer`, `validAsOf`, `officialSources[]` con `href` válido, `covers[]`, `limits[]`, `calculatorHref/Label`, `nextStepHref/Label`).

## 2. ¿Se inventó alguna fecha de AT2027?

**No.** El artículo declara explícitamente "el SII todavía no publica el calendario de la Operación Renta AT2027" sin fijar fecha. Verificación independiente vía `WebSearch` ("SII calendario Operación Renta AT2027 fecha publicación", 2026-08-12/13): ningún resultado oficial (SII, TGR, ChileAtiende, prensa) menciona un calendario AT2027 publicado. Consistente con lo documentado en el dossier.

## 3. Verificación en vivo de fuentes citadas

| Fuente | Uso en el artículo | Resultado del refetch (2026-08-12/13) |
|---|---|---|
| SII, comunicado 31-03-2026 (`.../noticias/2026/310326noti01pcr.htm`) | Calendario depósito/cheque AT2026 | **Confirmado verbatim.** 1–8 abr → 29-04-2026 / cheque 29-05-2026; 9–23 abr → 15-05-2026; 24 abr–8 may → 27-05-2026. Coincide exactamente con la tabla publicada. |
| SII FAQ 001_140_8954 (consulta de estado / rectificatoria) | Cita en `articleLead.answer` y como base de la sección "declaraste y nunca te llegó el depósito" | **Confirmado verbatim.** "A partir de la segunda semana de junio del año en curso" el contribuyente puede "verificar el detalle de las observaciones... y podrá rectificar por internet" vía Servicios online → Declaración de Renta → Consulta y seguimiento. El artículo no afirma que el trámite "sigue abierto" hoy (agosto) de forma explícita — solo instruye a usar la herramienta, sin declarar vigencia temporal del trámite. Esto **evita** la variante "vigencia sigue abierta sin fuente" del patrón de falla hermano. |
| SII FAQ 001_140_0516 (rectificatoria con devolución, plazo vía TGR) | "aproximadamente tres semanas" tras autorización SII a TGR | **Confirmado verbatim.** "recibirán su devolución correspondiente alrededor de tres semanas después de que el Servicio de Impuestos Internos autorice los montos a la Tesorería General de la República." |
| SII FAQ 001_140_8951 (fechas de devolución) | Citada dos veces en "Fuentes y referencias primarias" con dos descripciones distintas | **Discrepancia encontrada** — ver DEFECT #2. |
| SII servicios_online/1044-2696 (consulta y seguimiento) | Deferral legítimo hacia consulta de cuenta individual | Sin cambios en este run; deferral apunta a un dato individual no fetcheable de forma genérica (R4 PASS/N-A ya establecido, no re-auditado a fondo por no ser objeto de este run). |
| ChileAtiende, ficha 3178 | Referencia general de Operación Renta | Confirma consecuencia de no declarar ("generarás multas e intereses") pero **no describe mecanismo** de declaración fuera de plazo — ver DEFECT #1. |

## 4. Guía nueva "declaraste y nunca te llegó el depósito" / "no alcanzaste a declarar" — ¿se repite el patrón de falla del run hermano f22-checklist?

**Parcialmente sí — una de las dos variantes del patrón se repite.**

- **Variante "vigencia sigue abierta de un trámite" (contradicción articleLead↔cuerpo): NO se repite.** No hay contradicción entre `articleLead.answer` y el cuerpo (verificado oración por oración, ver §5.1 abajo); tampoco se afirma explícitamente que un trámite "sigue abierto"/"disponible" hoy — el grep sobre el archivo publicado (`abierto|disponible|sigue|vigente`) solo encuentra usos correctos: negaciones de vigencia del calendario cerrado y una referencia genérica futura ("año tributario vigente"). El DraftAgent evitó aquí el error exacto que sí cometió en el run hermano.

- **Variante "mecanismo de declaración fuera de plazo sin fuente": SÍ se repite.** Ver DEFECT #1 abajo — es el hallazgo principal de esta revisión.

## 5. Coherencia interna

### 5.1 `articleLead.answer` vs. cuerpo

Se verificó oración por oración: (1) "ciclo AT2026 ya cerró" ↔ primer párrafo del cuerpo, idéntico; (2) fechas de depósito/cheque ↔ tabla, idénticas; (3) guía para quien declaró y no recibió depósito ↔ sección "Si declaraste dentro de AT2026 y nunca te llegó el depósito", consistente; (4) guía para quien no alcanzó a declarar ↔ sección correspondiente, consistente; (5) AT2027 sin calendario ↔ sección "Próximo ciclo (AT2027)", consistente. **Sin contradicciones.**

### 5.2 `requires_calculation`

`01-brief.yaml` declara `requires_calculation: false`. Verificado: el draft y el blog file no introducen ni modifican ninguna cifra calculada. Las únicas cifras nuevas del reencuadre son citas directas de fuente ("tres semanas", "segunda semana de junio"), no cálculos derivados. **Correcto — no había expectativa de `05-math-audit.md` y su ausencia es consistente con la separación de funciones declarada.**

### 5.3 Deferrals y `TODO:SOURCE`

`grep -iE "TODO:SOURCE|TODO|FIXME"` sobre el blog publicado: **sin resultados.** Ningún deferral ilegítimo nuevo: la única cifra explícitamente deferida (monto de multa/interés por declarar fuera de plazo) cumple NORMA §2.4 condición 2 (depende de si hay pago/devolución y de elegibilidad de condonación — caso por caso). El *mecanismo* en sí ("aún puedes declarar fuera de plazo en sii.cl") no debió deferirse — ver DEFECT #1.

## 6. DEFECTS

**DEFECT #1 — MAJOR — Afirmación procedural sin fuente citada, reproduce el patrón de falla del run hermano f22-checklist — Resolución: Bucket B**

`articleLead.answer` y el cuerpo (sección "Si no alcanzaste a declarar dentro de AT2026") afirman: *"aún puedes declarar fuera de plazo en sii.cl → Servicios online → Renta"*. Esta afirmación procedural **no está respaldada por ninguna** de las 7 entradas en "Fuentes y referencias primarias" del artículo publicado, ni aparece documentada en `02-dossier.md` como claim con fuente propia — el dossier solo trata este bloque como deferral legítimo del *monto* de la multa, sin reconocer que el *mecanismo* mismo requería su propia cita.

Verificación en vivo (2026-08-12/13): **sí existe** una fuente oficial pública y fetcheable que respalda exactamente esta afirmación — SII FAQ `001_140_2444.htm` ("¿Qué debe hacer un contribuyente que no ha declarado...?"), cita literal: acceder al *"sitio web del SII, sección Servicios online, menú Declaración de renta, opción Declarar Renta (F22)"* para presentar declaraciones atrasadas, con multas/reajustes/intereses si el contribuyente estaba obligado a declarar. Esta URL nunca fue fetcheada ni citada por el DraftAgent — el claim se afirmó sin verificación, lo cual NORMA §1.1 MUST 4 / §2.4 clasifica como "defecto de pipeline equivalente a un `TODO:SOURCE` no resuelto" cuando la fuente es pública y fetcheable, como es el caso aquí.

Esto reproduce el núcleo del patrón de falla documentado en el run hermano `operacion-renta-f22-checklist` (mecanismo de declaración fuera de plazo sin fuente). La variante "vigencia 'sigue abierta' de un trámite" del mismo patrón **no** se repite en esta pieza (ver §4).

Resolución: DraftAgent (sesión nueva, con separación de funciones) debe fetchear y citar `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2444.htm`, agregarla a `articleLead.officialSources` y a "Fuentes y referencias primarias", y someter el resultado a una nueva revisión de ComplianceAgent en sesión fresca antes de publicación.

**DEFECT #2 — MENOR — Fuente duplicada con etiqueta no respaldada por el contenido real de la página (defecto preexistente, no introducido por este run) — Resolución: Bucket B**

En "Fuentes y referencias primarias" del blog publicado, la URL `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8951.htm` aparece **dos veces** con descripciones distintas: "fechas de devolución AT 2026" y "causas de no recepción pese a declaración aceptada (retenciones y datos bancarios)". Refetch en vivo confirma que el contenido de esa página trata **únicamente** las fechas de devolución por tramo de presentación; no contiene ninguna información sobre causas de no recepción, retenciones ni datos bancarios. La segunda etiqueta no está respaldada por la URL citada.

Este defecto es preexistente a la remediación de este run (`01-brief.yaml` `scope.out` excluye explícitamente re-escribir fuentes no tocadas por el reencuadre temporal, y `02-dossier.md` trata estas 5 fuentes originales como "ya citadas... se conservan sin cambio"). La ficha de auditoría original (R3) contó "6 fuentes oficiales" sin detectar que dos de las siete entradas de la lista comparten URL y que una de las dos etiquetas no coincide con el contenido real de la página. No es atribuible al DraftAgent de esta sesión, pero permanece como defecto abierto en el artículo publicado y compromete la trazabilidad exigida por NORMA §1.1 MUST 4.

Resolución: localizar la fuente oficial correcta para la afirmación "causas de no recepción / retenciones / datos bancarios" (o retirar la afirmación si no es fetcheable) en un run de remediación futuro. Fuera del alcance declarado de este run — no es imputable al DraftAgent de `20260812-1420-lote0c`, pero bloquea igualmente un veredicto PASS del artículo publicado en su estado actual.

## 7. Scorecard NORMA §7

| Dimensión | Peso | Nota | Ponderado |
|---|---|---|---|
| Respuesta ancla | 35% | 9,5/10 — respuesta ancla concreta en la primera pantalla (`articleLead.answer` + apertura del cuerpo), sin meta-proceso, cierre del ciclo declarado sin ambigüedad | 3,325 |
| Precisión + fuentes | 25% | 7,0/10 — cifras del calendario y plazos verificadas exactas contra fuente oficial, pero DEFECT #1 (afirmación procedural sin fuente) y DEFECT #2 (fuente duplicada con etiqueta no respaldada) | 1,750 |
| Vigencia + calendario | 15% | 9,5/10 — `validAsOf`, nota de cierre explícita, AT2027 correctamente señalado como no publicado sin inventar fecha | 1,425 |
| Excepciones + cobertura | 15% | 9,0/10 — cubre los tres casos del lector (declaró sin depósito / no alcanzó a declarar / próximo ciclo); deferral del monto de multa correctamente justificado por caso | 1,350 |
| Claridad + estructura | 10% | 9,0/10 — estructura clara, prosa directa, sin patrones prohibidos §2.2 | 0,900 |
| **Total** | | | **8,75/10** |

**Nota sobre la relación score↔veredicto:** NORMA §1 define "≥9,5/10" como el cumplimiento de **todos** los requisitos MUST. DEFECT #1 es una violación de MUST 4 (fuente oficial para regla crítica YMYL, fetcheable y no fetcheada). Por definición, un artículo que falla un MUST no puede calificar como ≥9,5/10 ni ser publicado, independientemente de la cercanía numérica del score ponderado.

## 8. Separación de funciones

| Etapa | Agente / sesión |
|---|---|
| Auditoría original (ficha) | ComplianceAgent adversarial, sesión previa, 2026-08-12 (`output/audits/corpus-2026-08-12/fichas/`) |
| 01-brief.yaml, 02-dossier.md, 03-outline.md, 04-draft.md, actualización del blog file, 07-publish-packet.md | DraftAgent (Claude Code), sesión `20260812-1420-lote0c` |
| 06-compliance.md (este documento) | ComplianceAgent (Claude Code, sesión fresca), sin exposición al draft ni a la sesión `20260812-1420-lote0c` |
| Firma de publicación | HumanEditor — pendiente |

**Sin violación de separación de funciones detectada.** Cuatro roles, cuatro sesiones distintas, consistente con `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.

## 9. Veredicto final

**Status: BLOCKED — DEFECTS FOUND**
**Veredicto: FAIL (8,75/10 nominal; bloqueado por violación de MUST 4, independiente del score)**

Justificación: el reencuadre temporal (hallazgo principal R2) está genuinamente resuelto — la primera pantalla declara sin ambigüedad que el ciclo AT2026 cerró, no se inventó ninguna fecha AT2027, y la variante "vigencia sigue abierta sin fuente" del patrón de falla del run hermano no se repite. Sin embargo, la nueva guía "no alcanzaste a declarar dentro de AT2026" introduce una afirmación procedural (mecanismo de declaración fuera de plazo) sin fuente citada — DEFECT #1, que sí es una repetición parcial del patrón de falla del run hermano `operacion-renta-f22-checklist` y constituye una violación de NORMA §1.1 MUST 4. Se identificó además un defecto preexistente de trazabilidad de fuentes (DEFECT #2) no atribuible a este run pero que sigue bloqueando un veredicto limpio del artículo publicado. Ninguno de los dos defectos requiere descartar el reencuadre ya aplicado: ambos son resolubles agregando/corrigiendo citas, sin tocar las cifras del calendario AT2026 ni la estructura ya validada.

Pendiente: firma humana. Ningún gate de `07-publish-packet.md` fue marcado por este agente.
