# Gate 06 — Compliance Review: fondo-emergencia-chile

Status: CONDITIONAL — TODO:SOURCE items unresolved; publication blocked until resolved
Role: ComplianceAgent (Claude Code — fresh session, adversarial)
Fecha de revisión: 2026-05-04
Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/fondo-emergencia/02-research.md`
  - `docs/editorial/artifacts/fondo-emergencia/04-draft.md`
  - `src/data/blog/fondo-emergencia-chile.md` (blog file, versión publicable — diverge levemente del draft; se revisó el blog file)
  - `docs/editorial/artifacts/fondo-emergencia/07-publish-packet.md`
  - `docs/editorial/artifacts/fondo-emergencia/05-math-audit.md` — AUSENTE (Gate 05 no ejecutado aún)

> **Nota SoD:** Este review se ejecuta sin output de Gate 05 (`05-math-audit.md` ausente). El pipeline permite esto ("if present"). El veredicto se emite sobre la base disponible; Gate 05 podría revelar defectos adicionales que requieran re-audit de Gate 06.

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9.0/10 | 3.15/3.50 | `articleLead.answer` directo; H2 "¿Cuánto debe tener?" declara la regla de 3–6 meses con claridad. Penalización leve: sin fuente oficial linkeada en el lead. |
| Precisión + fuentes | 25% | 6.5/10 | 1.63/2.50 | Dos TODO:SOURCE sin resolver (C1, C4); ninguna fuente oficial linkeada en el cuerpo del artículo publicable. |
| Vigencia + calendario | 15% | 9.5/10 | 1.43/1.50 | "Vigente al 2026-05-03" al inicio y "Fecha de corte: 2026-05-03" al final. Sin calendarios de reforma. |
| Excepciones + cobertura | 15% | 9.0/10 | 1.35/1.50 | Split 3 vs 4–6 meses explícito; instrumentos por tipo de liquidez bien diferenciados; sección "errores comunes" cubre edge cases. |
| Claridad + estructura | 10% | 9.0/10 | 0.90/1.00 | H2s claros, flujo lógico, disclaimers apropiados, `articleAdvisory` presente, tono educativo sin lenguaje prescriptivo. |
| **TOTAL** | 100% | — | **8.46/10** | **Por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — CONDITIONAL — Claim "3 a 6 meses" sin fuente oficial verificada

**Severidad:** CONDITIONAL (bloquea publicación hasta resolver)
**Ubicación:** Blog file línea 56; `articleLead.answer`; Claim C1 en 02-research.md
**Descripción:** El artículo presenta "3 a 6 meses de gastos esenciales" como "referencia estándar en educación financiera" sin vincular a ninguna fuente oficial (CMF, BancoEstado educativo, u otra institución chilena). El research dossier marca esto como TODO:SOURCE (R1): verificar si CMF Chile usa exactamente este rango en su material educativo.
**NORMA_YMYL:** MUST #4 — "Para cada regla crítica YMYL: al menos 1 fuente oficial".
**Observación:** El claim no es una regla normativa (no hay ley que fije este rango), sino una orientación de educación financiera. Si CMF no usa exactamente este rango, el artículo debe ajustar el lenguaje a "orientación general de educación financiera, sin definición normativa oficial" — lo que igualmente requiere verificación.
**Resolución (Bucket A — human):**
- Navegar https://www.cmfchile.cl/educa/ y verificar si CMF usa el rango 3–6 meses.
- Si confirma: agregar link a la fuente CMF en el cuerpo del artículo.
- Si usa rango distinto: ajustar el texto del artículo y del `articleLead.answer` para reflejar el rango correcto y citar la fuente.
- Si no hay fuente oficial que respalde el rango exacto: reformular como "orientación general de planificación financiera (sin definición normativa en Chile)" y eliminar la insinuación de que es un estándar reconocido oficialmente.

---

### DEFECT #2 — CONDITIONAL — Claim de penalización por retiro anticipado de DAP sin fuente regulatoria

**Severidad:** CONDITIONAL (bloquea publicación hasta resolver)
**Ubicación:** Blog file línea 91; Claim C4 en 02-research.md
**Descripción:** El artículo dice "el retiro anticipado de un DAP puede implicar penalización o pérdida de intereses". El research dossier (R2) indica que el mecanismo exacto de penalización requiere verificación de la circular CMF vigente sobre depósitos a plazo. El blog file ya suavizó el lenguaje del draft ("puede implicar" en vez de "tiene penalización") y agrega "Verifica las condiciones específicas con tu banco antes de contratarlo." — esto reduce el riesgo del claim, pero no lo elimina.
**NORMA_YMYL:** MUST #4 parcial — el claim implica una consecuencia regulatoria/operativa que debería estar respaldada.
**Resolución (Bucket A — human):**
- Opción A (más sólida): Verificar la circular CMF aplicable a depósitos a plazo. Agregar nota: "Según la normativa CMF vigente (Circular N°X), el retiro anticipado de un DAP implica [mecanismo]."
- Opción B (más conservadora si no se puede verificar el mecanismo exacto): Eliminar la referencia al mecanismo de penalización y reemplazar por: "La disponibilidad y condiciones de retiro anticipado de un DAP varían según el contrato y entidad — consulta con tu banco antes de contratar."

---

### DEFECT #3 — NOTE (no bloquea veredicto CONDITIONAL) — Sin fuente oficial linkeada en el cuerpo

**Severidad:** NOTE — no bloquea publicación si D1 y D2 se resuelven
**Descripción:** Ninguna fuente oficial (CMF, SII, BancoEstado) está hyperlinkeada en el cuerpo del artículo. Las URLs del research dossier (S1, S2, S5) tienen estado TODO:VERIFY_URL. Para fortalecer E-E-A-T y cumplir NORMA_YMYL a nivel 9.5+, al menos una fuente oficial debería estar linkeada en el artículo publicado.
**Resolución:** Al resolver D1 (verificar CMF), agregar el link directo a la sección relevante de CMF educa en el cuerpo del artículo.

---

## Separation of Duties Declaration

| Stage | Role | Tool / Session | SoD Status |
|---|---|---|---|
| 02 Research | ResearchAgent | Claude Code — Sprint 2B session (2026-05-03) | ✓ Diferente de ComplianceAgent |
| 03 Outline | OutlineAgent | Claude Code — Sprint 2B session (2026-05-03) | ✓ Diferente de ComplianceAgent |
| 04 Draft | DraftAgent | Claude Code — Sprint 2B session (2026-05-03) | ✓ Diferente de ComplianceAgent |
| 05 Math audit | MathAuditAgent | ChatGPT — sesión fresca (PENDIENTE) | ⬜ No ejecutado |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-04 (esta sesión, sin carga previa del contexto de drafting) | ✓ SoD cumplido |

**SoD verdict:** ✅ No hay violación de separación de roles. DraftAgent (Sprint 2B) es una sesión distinta de ComplianceAgent (sesión actual, 2026-05-04, iniciada sin contexto previo de drafting). Gate 05 pendiente — no genera defecto de SoD, solo defecto de pipeline incompleto.

---

## Overall Verdict

**CONDITIONAL**

No hay defectos bloqueantes de tipo FAIL (sin violaciones SoD, sin claims regulatorios falsos, sin errores aritméticos detectados, sin inferencias jurídicas sin etiqueta). El artículo está bien estructurado, tiene tono educativo apropiado y cumple los MUST de vigencia, coherencia y estructura.

**Bloqueantes para pasar a PASS:**
1. Resolver D1: verificar y citar la fuente oficial del rango 3–6 meses.
2. Resolver D2: verificar y citar el mecanismo regulatorio de penalización por retiro anticipado de DAP, o suavizar el claim para eliminarlo si no hay fuente disponible.
3. Una vez D1 y D2 resueltos, Gate 06 puede re-evaluarse en una nueva sesión fresca para emitir veredicto PASS.

**NORMA_YMYL score estimado post-resolución (si D1 y D2 se resuelven satisfactoriamente):** ~9.6/10 (precisión+fuentes sube de 6.5 a ~9.5; resto se mantiene).

**Gate 05 pendiente:** Este veredicto podría cambiar si MathAuditAgent (ChatGPT) identifica errores aritméticos o inconsistencias numéricas no detectados en esta revisión. Se recomienda ejecutar Gate 05 antes de resolver D1/D2 para evitar trabajo duplicado si el draft necesita cambios sustantivos.
