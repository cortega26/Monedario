# Gate 06 — Compliance Review: sueldo-imponible-chile

Status: CONDITIONAL — residual TODO:SOURCE (salud 7%, AFC rates sin fuente oficial) y score NORMA_YMYL < 9,5 bloquean PASS
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha de revisión: 2026-05-05
Reemplaza: 06-compliance.md del 2026-05-04 (pre-remediación)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/sueldo-imponible.md`
  - `docs/editorial/artifacts/sueldo-imponible/04-draft.md`
  - `docs/editorial/artifacts/sueldo-imponible/05-math-audit.md`
  - `src/data/blog/sueldo-imponible-chile.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones del 2026-05-05

| Punto de atención | Estado |
|---|---|
| Tope AFP/salud "~87,1 UF" → 90,0 UF | ✓ RESUELTO — artículo dice "90,0 UF mensuales" |
| Tope AFC 135,2 UF diferenciado | ✓ RESUELTO — diferenciado correctamente de AFP/salud |
| ERROR AFP "dobla comisión" → separado | ✓ RESUELTO — "$126.000 (10,5%) + comisión adicional" |
| ERROR APV topes en UTM → UF | ✓ RESUELTO — artículo dice "Los topes se expresan en UF" |
| ISC ejemplo $9.882 insertado | ✓ RESUELTO — verificado por MathAuditAgent (tabla SII AT 2026) |
| APV Modalidad A "beneficio 15%" eliminado | ✓ RESUELTO — ahora dice "beneficio tributario directo" (conservador) |
| Gate 05 ejecutado | ✓ RESUELTO — MathAuditAgent ChatGPT sesión 2026-05-05 |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9,0/10 | 3,15/3,50 | `articleLead.answer` preciso y directo. Tabla imponibles/no imponibles es fortaleza. Penalización: ejemplo no calcula el sueldo líquido final (solo "menos los descuentos anteriores"); ISC tramos no reproducidos en el artículo. |
| Precisión + fuentes | 25% | 8,0/10 | 2,00/2,50 | Tope AFP/salud 90,0 UF y AFC 135,2 UF corregidos. ISC $9.882 verificado. Penalización: (1) cotización salud 7% sin cita legal oficial (art./ley que establece la tasa). (2) AFC 0,6%/0,6% trabajador/empleador sin cita de Ley 19.728. (3) APV distinción A/B conservadora pero sin fuente que cierre terminología oficial "Modalidad A/B". |
| Vigencia + calendario | 15% | 9,5/10 | 1,43/1,50 | Corte 2026-05-03 presente; notas de actualización para tope UF y tramos ISC. |
| Excepciones + cobertura | 15% | 8,5/10 | 1,28/1,50 | Bono de asistencia cubierto; colación/movilización claros; APV explicado con art. 42 bis LIR. Penalización: ISC section no da tramos concretos (solo "7 tramos expresados en UTM, 0% a 40%, ver SII"). |
| Claridad + estructura | 10% | 9,0/10 | 0,90/1,00 | H2 claros; pseudocódigo de cálculo útil; tabla bien formateada. Leve penalización: ejemplo numérico no cierra con sueldo líquido calculado. |
| **TOTAL** | 100% | — | **8,76/10** | **Por debajo del umbral 9,5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — MINOR — Cotización salud 7%: sin fuente legal citada

**Severidad:** MINOR
**Ubicación:** Sección "Cómo afecta el imponible a AFP, salud y AFC" y ejemplo numérico.
**Descripción:** El artículo afirma "Cotización de salud: 7% Fonasa o el plan isapre pactado" y calcula "$84.000" en el ejemplo. El math audit marcó este claim como TODO:SOURCE: la aritmética es correcta pero el dossier no aporta cita legal oficial. La tasa del 7% obligatorio de salud está establecida en la Ley 18.469 (Fonasa) y la Ley 18.933 (Isapre), pero ninguna es citada en el artículo ni en el frontmatter de `officialSources`.
**NORMA_YMYL:** MUST #4 (fuentes oficiales mínimas para cada regla crítica YMYL).
**Resolución:** Agregar referencia a la norma legal que establece el 7% (Ley 18.469/18.933 o la regulación Fonasa vigente). Alternativamente, reformular como "la tasa mínima legal, vigente según la normativa de salud — verifica con tu institución" con link al MINSAL o Superintendencia de Salud.

---

### DEFECT #2 — MINOR — AFC 0,6% / 2,4%: sin fuente legal citada

**Severidad:** MINOR
**Ubicación:** Sección "Cómo afecta el imponible a AFP, salud y AFC" y ejemplo.
**Descripción:** El artículo presenta "AFC (Seguro de Cesantía): 0,6% el trabajador; 2,4% el empleador" como hecho normativo. El math audit marcó esto como TODO:SOURCE. Las tasas del Seguro de Cesantía están en la Ley 19.728, pero no se cita. El artículo no enlaza a la fuente oficial de la AFC (SENCE/AFC Chile).
**NORMA_YMYL:** MUST #4 (fuentes oficiales mínimas para cada regla crítica YMYL).
**Resolución:** Agregar referencia "Ley 19.728 (Seguro de Cesantía)" o enlace a AFC Chile con nota "tasas vigentes según Ley 19.728; verifica actualizaciones en AFC Chile."

---

### DEFECT #3 — MINOR — APV Modalidad A/B: distinción conservadora pero TODO:SOURCE no cerrado

**Severidad:** MINOR
**Ubicación:** Sección "APV y reducción de la base imponible".
**Descripción:** El artículo distingue Modalidad A ("beneficio tributario directo sobre el monto cotizado, de acuerdo con el artículo 42 bis de la LIR") de Modalidad B ("reduce la base imponible del ISC, con topes distintos establecidos en el mismo artículo"). La referencia al art. 42 bis LIR es correcta. Sin embargo, el math audit no cerró formalmente la terminología "Modalidad A / Modalidad B" contra la LIR o el SII. El claim es conservador y no hace promesas de tasa específica, pero la distinción oficial entre "Modalidad A" y "Modalidad B" debería estar respaldada por el SII o el texto del art. 42 bis LIR.
**NORMA_YMYL:** MUST #4 (fuentes oficiales mínimas).
**Resolución:** Agregar URL al art. 42 bis de la LIR en BCN (`idNorma=6368`) o a la FAQ del SII sobre APV, que use la terminología "Modalidad A / B" explícitamente.

---

### DEFECT #4 — NOTE — Ejemplo no calcula el sueldo líquido final

**Severidad:** NOTE (no bloquea)
**Descripción:** El artículo promete en el título "qué es, qué incluye y cómo afecta tus descuentos". El ejemplo muestra todos los descuentos calculados sobre $1.200.000 pero termina con "Sueldo líquido: $1.200.000 menos los descuentos anteriores" sin dar el número final. La suma de los descuentos calculados es aproximadamente $227.082 ($126.000 + $84.000 + $7.200 + $9.882), lo que daría un líquido de ~$972.918. No calcular este final reduce la utilidad del ejemplo sin reducir su riesgo — los descuentos intermedios ya están verificados.
**Resolución:** Calcular el sueldo líquido final en el ejemplo y marcarlo como "orientativo" (el artículo no incluye la comisión AFP exacta, lo que introduce una variable). Añadir nota: "La comisión AFP varía por institución y puede agregar entre $X y $Y al descuento total."

---

## Separation of Duties Declaration

| Stage | Role | Agente / Sesión | Estado |
|---|---|---|---|
| 02 Research | ResearchAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| 03 Outline | OutlineAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| 04 Draft | DraftAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| Remediation | DraftAgent | Claude Code — sesión 2026-05-05 | ✓ |
| 05 Math audit | MathAuditAgent | ChatGPT — sesión fresca 2026-05-05 | ✓ Ejecutado |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-05 (esta sesión) | ✓ SoD cumplido |
| 07 Publish packet | Solo humano | — | ⬜ Pendiente |

**SoD verdict:** ✓ Sin violación de roles. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido.

---

## Veredicto Final

**CONDITIONAL**

La remediación del 2026-05-05 resolvió los tres ERROREs del math audit (tope UF actualizado a 90,0/135,2 UF, AFP desglosado correctamente, APV en UF no UTM) y completó el ejemplo ISC con $9.882. No quedan ERROREs de cálculo ni marcadores TODO:SOURCE visibles en el artículo publicable.

**Razones del CONDITIONAL (no PASS):**
1. DEFECT #1: Cotización salud 7% sin cita legal oficial (Ley 18.469/18.933).
2. DEFECT #2: AFC 0,6%/2,4% sin cita de Ley 19.728.
3. DEFECT #3: APV terminología "Modalidad A/B" sin URL al art. 42 bis LIR o FAQ SII.
4. Score NORMA_YMYL 8,76/10 < 9,5.

**Ruta a PASS:**
- Agregar citas legales para cotización salud (DEFECT #1) y AFC (DEFECT #2).
- Agregar URL al art. 42 bis LIR para APV (DEFECT #3).
- Calcular sueldo líquido final en ejemplo orientativo (DEFECT #4, opcional pero mejora score).
- **Nueva ronda de DraftAgent requerida antes de Gate 07.**
