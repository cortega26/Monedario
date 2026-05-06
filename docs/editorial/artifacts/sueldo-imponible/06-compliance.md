# Gate 06 — Compliance Review: sueldo-imponible-chile

Status: BLOCKED — DEFECTS FOUND (1 defecto bloqueante en covers frontmatter)
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha: 2026-05-06
Cycle: Reemplaza 06-compliance.md del 2026-05-05 (post-remediación anterior)

Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/briefs/sueldo-imponible.md`
  - `docs/editorial/artifacts/sueldo-imponible/04-draft.md`
  - `docs/editorial/artifacts/sueldo-imponible/05-math-audit.md`
  - `src/data/blog/sueldo-imponible-chile.md` (versión post-remediación 2026-05-05)

---

## Verificación de remediaciones (puntos de atención post-2026-05-05)

| Punto de atención | Estado |
|---|---|
| ERROR: Tope AFP/salud ~87,1 UF → 90,0 UF | ✓ RESUELTO — blog file dice "90,0 UF mensuales" |
| Tope AFC 135,2 UF diferenciado | ✓ RESUELTO — diferenciado correctamente de 90,0 UF AFP/salud |
| ERROR: AFP "dobla comisión" → separado | ✓ RESUELTO — "$126.000 (10,5%); comisión AFP es adicional y varía" |
| ERROR: APV topes en UTM → UF | ✓ RESUELTO — "Los topes se expresan en UF" |
| ISC ejemplo $9.882 insertado | ✓ RESUELTO — verificado por MathAuditAgent (tabla SII AT 2026) |
| APV Modalidad A "beneficio 15%" eliminado | ✓ RESUELTO EN CUERPO — "beneficio tributario directo" sin tasa (conservador) |
| APV Modalidad A covers bullet | ✗ DEFECTO BLOQUEANTE — ver DEFECT #1 |

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 8.0/10 | 2.800 | `articleLead.answer` preciso y directo. Tabla imponibles/no imponibles es fortaleza. Topes 90,0/135,2 UF diferenciados. Deducción: (1) covers bullet #4 "Cómo el APV Modalidad A puede reducir la base del ISC" es factualmente incorrecto — Modalidad A es crédito; Modalidad B reduce la base. (2) Ejemplo no muestra el sueldo líquido final calculado. |
| Precisión + fuentes | 25% | 7.5/10 | 1.875 | Topes UF corregidos y verificados. ISC $9.882 verificado. AFP separado correctamente. UF vs UTM corregido. Deducción: (1) covers bullet APV Modalidad A = error normativo activo. (2) Cotización salud 7% sin cita de Ley 18.469/18.933. (3) AFC 0,6%/2,4% sin cita de Ley 19.728. (4) APV art. 42 bis LIR sin URL BCN. |
| Vigencia + calendario | 15% | 9.0/10 | 1.350 | `validAsOf: 2026-05-03` presente. Notas de actualización para tope UF e ISC presentes. Links SP y SII. |
| Excepciones + cobertura | 15% | 8.5/10 | 1.275 | Bono de asistencia condicional cubierto. Colación/movilización claros. APV explicado con art. 42 bis LIR. Deducción: ISC tramos no reproducidos (solo "7 tramos, 0% a 40%, ver SII"). |
| Claridad + estructura | 10% | 8.5/10 | 0.850 | H2 claros. Pseudocódigo de cálculo útil. Tabla bien formateada. Deducción: ejemplo no cierra con sueldo líquido calculado. |
| **TOTAL** | 100% | — | **8.15/10** | **Por debajo del umbral 9.5 — no PASS; error bloqueante presente → FAIL** |

---

## DEFECTS

**DEFECT #1 — BLOQUEANTE — Error normativo en covers frontmatter: APV Modalidad A mal atribuida (NORMA_YMYL MUST #8 + error de cumplimiento)**

Ubicación: `src/data/blog/sueldo-imponible-chile.md`, frontmatter `articleLead.covers`, ítem #4.

El frontmatter contiene:
```
- "Cómo el APV Modalidad A puede reducir la base del ISC."
```

Esta afirmación es **factualmente incorrecta**. APV Modalidad A genera un crédito tributario directo sobre el monto cotizado (beneficio fiscal). APV Modalidad B es la que reduce la base imponible del ISC. El propio cuerpo del artículo lo dice correctamente:
- "Modalidad A: genera un beneficio tributario directo sobre el monto cotizado" ✓
- "Modalidad B: reduce la base imponible del ISC" ✓

La sección `articleLead.covers` es contenido user-facing que aparece en la vista previa del artículo y en snippets de búsqueda. Un lector que decide si APV Modalidad A o B le conviene puede tomar una decisión incorrecta basándose en este bullet.

Esto viola NORMA_YMYL MUST #8 (Coherencia interna: contradice directamente el cuerpo del artículo) y constituye un "error de cumplimiento" per las instrucciones de auditoría (claim crítico con contenido incorrecto sobre una decisión financiera).

El report del 2026-05-05 clasificó este como MINOR y no lo identificó como bloqueante. Esta auditoría lo clasifica como BLOQUEANTE porque el covers bullet es contenido user-facing con información factualmente incorrecta sobre una elección financiera con implicancias tributarias reales.

Resolution: Corregir el covers bullet #4 a: `"Cómo el APV puede reducir la base del ISC (Modalidad B) o generar un crédito tributario directo (Modalidad A)."` O bien: `"Cómo el APV Modalidad B reduce la base del ISC y qué diferencia a la Modalidad A."` Verificar también que no haya inconsistencia similar en otros artículos del cluster (cross-article coherence).

---

**DEFECT #2 — MINOR — Cotización salud 7%: sin cita legal (NORMA_YMYL MUST #4)**

Ubicación: Sección "Cómo afecta el imponible a AFP, salud y AFC" y ejemplo numérico.

El artículo afirma "Cotización de salud: 7% Fonasa o el plan isapre pactado" y calcula $84.000 en el ejemplo. La aritmética es correcta (math audit: TODO:SOURCE resuelto por softening). Sin embargo, la tasa del 7% obligatorio de salud no tiene cita legal (Ley 18.469 Fonasa / Ley 18.933 Isapre). Para contenido YMYL de cotizaciones laborales, la fuente de la tasa obligatoria debe ser trazable.

Resolution: Agregar referencia a la norma legal ("según Ley 18.469/18.933") o reformular como "la tasa mínima legal de salud (verifica con tu institución o en el Ministerio de Salud)."

---

**DEFECT #3 — MINOR — AFC 0,6% / 2,4%: sin cita de Ley 19.728 (NORMA_YMYL MUST #4)**

Ubicación: Sección "Cómo afecta el imponible a AFP, salud y AFC" y ejemplo.

Las tasas del Seguro de Cesantía se presentan sin citar la Ley 19.728 que las establece ni enlace a AFC Chile. El math audit marcó esto como TODO:SOURCE.

Resolution: Agregar "Ley 19.728 (Seguro de Cesantía)" o enlace a AFC Chile con nota "tasas vigentes según Ley 19.728 — verifica actualizaciones en AFC Chile."

---

**DEFECT #4 — MINOR — APV: terminología "Modalidad A/B" sin URL art. 42 bis LIR (NORMA_YMYL MUST #4)**

Ubicación: Sección "APV y reducción de la base imponible".

El artículo referencia "artículo 42 bis de la LIR" sin enlace a BCN. La terminología "Modalidad A / B" es denominación de mercado — el art. 42 bis no necesariamente usa ese lenguaje. La referencia al artículo sin URL reduce la trazabilidad.

Resolution: Agregar URL a BCN para art. 42 bis LIR (`idNorma=6368`), o a la FAQ SII sobre APV que use el lenguaje "Modalidad A/B" explícitamente.

---

**DEFECT #5 — NOTE — Ejemplo no muestra sueldo líquido final (NORMA_YMYL SHOULD)**

Ubicación: Sección "Ejemplo numérico orientativo".

El ejemplo muestra todos los descuentos pero termina con "Sueldo líquido: $1.200.000 menos los descuentos anteriores" sin dar el número calculado. Los descuentos verificados suman ~$227.082 ($126.000 + $84.000 + $7.200 + $9.882), dando un líquido orientativo de ~$972.918. No calcular este total reduce la utilidad del ejemplo sin reducir el riesgo.

Resolution: Calcular el sueldo líquido final orientativo con nota "La comisión AFP no está incluida — varía por institución y puede agregar entre $X y $Y al descuento total."

---

## Resolución de TODO:SOURCE del math audit (Gate 05)

| TODO:SOURCE del math audit | Resolución en blog file | Estado |
|---|---|---|
| ERROR: Tope ~87,1 UF (desactualizado) | Corregido a 90,0 UF / 135,2 UF diferenciados | RESUELTO |
| ERROR: AFP "dobla comisión" | Separado correctamente en cuerpo y ejemplo | RESUELTO |
| ERROR: APV topes en UTM | Corregido a "Los topes se expresan en UF" | RESUELTO |
| VERIFIED: ISC $9.882 en ejemplo | Insertado y verificado | RESUELTO |
| TODO:SOURCE: Salud 7% sin fuente | No resuelto — claim permanece sin cita legal | PENDIENTE → DEFECT #2 |
| TODO:SOURCE: AFC 0,6%/2,4% sin fuente | No resuelto — claim permanece sin Ley 19.728 | PENDIENTE → DEFECT #3 |
| TODO:SOURCE: APV Modalidad A "15%" | Eliminado (conservador: "beneficio tributario directo") | RESUELTO EN CUERPO |
| ⚠️ NUEVO: covers bullet APV Modalidad A = base reduction | No detectado en ciclo anterior — error en frontmatter | NUEVO → DEFECT #1 BLOQUEANTE |

**TODO:SOURCE activos en el blog file: 0 (pero 1 defecto bloqueante en frontmatter y 2 claims sin fuente en cuerpo)**

---

## Declaración de Separación de Deberes (SoD)

| Stage | Rol | Agente / Sesión | Estado |
|---|---|---|---|
| Gate 01 Brief | Autor | Humano | ✓ |
| Gate 02–03 Research / Outline | DraftAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| Gate 04 Draft | DraftAgent | Claude Code — Sprint 2B (2026-05-03) | ✓ |
| Remediación | DraftAgent | Claude Code — sesión fresca 2026-05-05 | ✓ |
| Gate 05 Math Audit | MathAuditAgent | ChatGPT — sesión fresca 2026-05-05 | ✓ Ejecutado — Veredicto FAIL (parcialmente resuelto) |
| Gate 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-06 (esta sesión) | ✓ SoD cumplido |
| Gate 07 Publish Packet | Solo humano | — | ⬜ Pendiente |

SoD: CONFORME. INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES cumplido.

---

## Veredicto final

**FAIL**

La remediación del 2026-05-05 resolvió los tres ERROREs del math audit (topes UF correctos, AFP separado, APV en UF no UTM) y completó el ejemplo ISC con $9.882. Sin embargo, la remediación introdujo o dejó sin detectar un error normativo bloqueante en el frontmatter `articleLead.covers`:

**DEFECT #1 BLOQUEANTE**: El bullet "Cómo el APV Modalidad A puede reducir la base del ISC" es factualmente incorrecto — Modalidad A es un crédito tributario, no una reducción de base. Modalidad B es la que reduce la base. Este error aparece en contenido user-facing (covers) y contradice directamente el cuerpo del artículo, que sí lo tiene correcto. El report anterior (2026-05-05) no identificó este defecto como bloqueante.

**Artículo no autorizado para Gate 07 hasta que DraftAgent corrija DEFECT #1.**

Los DEFECTS #2–#4 son menores y también deben resolverse antes de Gate 07 (nueva ronda DraftAgent requerida de todos modos por DEFECT #1).

Ruta a re-auditoría:
1. DraftAgent corrige covers bullet APV (DEFECT #1) — obligatorio.
2. DraftAgent agrega citas Ley 18.469/18.933 para salud 7% (DEFECT #2).
3. DraftAgent agrega Ley 19.728 para AFC (DEFECT #3).
4. DraftAgent agrega URL art. 42 bis LIR (DEFECT #4).
5. Nueva ronda Gate 06 en sesión fresca antes de Gate 07.
