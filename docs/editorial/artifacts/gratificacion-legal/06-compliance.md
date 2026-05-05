# Gate 06 — Compliance Review: gratificacion-legal-chile

Status: CONDITIONAL — TODO:SOURCE items (IMM vigente, tope calculado) y ejemplo incompleto bloquean publicación
Role: ComplianceAgent (Claude Code — fresh session, adversarial)
Fecha de revisión: 2026-05-04
Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/gratificacion-legal/02-research.md`
  - `docs/editorial/artifacts/gratificacion-legal/04-draft.md`
  - `src/data/blog/gratificacion-legal-chile.md` (blog file — versión publicable; se revisó el blog file)
  - `docs/editorial/artifacts/gratificacion-legal/07-publish-packet.md`
  - `docs/editorial/artifacts/gratificacion-legal/05-math-audit.md` — AUSENTE (Gate 05 no ejecutado; **OBLIGATORIO** por `requires_calculation: true`)

> **Alerta Gate 05:** `requires_calculation: true` activa `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC`. Gate 05 no ha corrido. Este compliance se emite sobre el estado actual del draft; Gate 05 podría cambiar el veredicto si encuentra errores en la fórmula o en la aplicación del tope. Se **recomienda fuertemente** ejecutar Gate 05 antes de resolver los defectos de Gate 06 para evitar trabajo duplicado.

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 9.0/10 | 3.15/3.50 | `articleLead.answer` declara modalidad 25 % y tope 4,75 IMM con claridad. Fuentes oficiales en frontmatter y en cuerpo (BCN, DT). Penalización leve: el ejemplo numérico queda incompleto (tope y resultado sin calcular por IMM pendiente). |
| Precisión + fuentes | 25% | 7.5/10 | 1.88/2.50 | BCN (arts. 47–52) y DT linkeados en cuerpo. IMM vigente (C4) sin verificar; tope calculado (C5) sin resolver. Claim "30 días" sin artículo CT específico. C9 (ordinario DT periodicidad) no verificado aunque suavizado a "práctica". |
| Vigencia + calendario | 15% | 9.5/10 | 1.43/1.50 | "Vigente al 2026-05-03" al inicio; "Fecha de corte" con link a Mintrab al final. Nota explícita sobre actualización del IMM por decreto supremo. |
| Excepciones + cobertura | 15% | 9.5/10 | 1.43/1.50 | Ambas modalidades explicadas; escenario de pérdidas cubierto; pago proporcional (art. 52 CT) tratado; FAQ con 3 casos reales comunes. |
| Claridad + estructura | 10% | 8.5/10 | 0.85/1.00 | Flujo H2 claro. Penalización por ejemplo numérico incompleto: la sección promete "fórmula exacta y tope de 4,75 IMM" y el resultado final queda en blanco. |
| **TOTAL** | 100% | — | **8.74/10** | **Por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — CONDITIONAL — Ejemplo numérico incompleto: tope y resultado sin valor

**Severidad:** CONDITIONAL (bloquea publicación)
**Ubicación:** Blog file líneas 85–95; draft líneas 129–145
**Descripción:** El artículo promete "la fórmula exacta y el tope de 4,75 IMM" (`articleLead.covers`). El ejemplo numérico calcula la gratificación bruta correctamente ($9.600.000 × 0,25 = $2.400.000), pero el tope y el resultado final quedan sin calcular porque el valor del IMM vigente (C4) no fue confirmado antes de publicar el blog file. El lector ve:
  - ✅ Remuneraciones imponibles: $9.600.000
  - ✅ Gratificación bruta (25%): $2.400.000
  - ❌ Tope legal: "IMM vigente × 4,75 (ver IMM actual en Ministerio del Trabajo)" — sin número
  - ❌ Gratificación efectiva: "el menor entre $2.400.000 y el tope calculado" — sin número
Un ejemplo que no se completa no cumple la función del artículo y contradice la promesa del frontmatter.
**NORMA_YMYL:** MUST #1 (Respuesta Ancla — el cálculo prometido no se completa) y §1.2 SHOULD (ejemplo numérico cuando la intención es cálculo).
**Resolución (Bucket A — human + MathAuditAgent):**
1. Ejecutar Gate 05 (MathAuditAgent ChatGPT): verificar IMM vigente desde Mintrab y completar el ejemplo (tope = IMM × 4,75; resultado = min($2.400.000, tope)).
2. Actualizar el blog file `src/data/blog/gratificacion-legal-chile.md` líneas 91–94 con los valores reales.
3. Si el IMM cambió desde 2026-05-03, actualizar `validAsOf` y `articleAdvisory`.

---

### DEFECT #2 — CONDITIONAL — IMM vigente (C4) y tope calculado (C5) sin verificar

**Severidad:** CONDITIONAL (bloquea publicación — dato volátil central del artículo)
**Ubicación:** Research dossier R1/R2; draft líneas 123–128; blog file línea 91
**Descripción:** El valor del IMM vigente (C4) y el tope calculado de 4,75 × IMM (C5) son los datos centrales del artículo. Ambos están marcados como TODO:SOURCE en el research dossier. El blog file no incluye ningún valor concreto, redirigiendo al lector a Mintrab. Sin estos valores, el artículo no puede cumplir su propósito editorial de calcular el tope real.
**Nota:** Este defecto no es independiente de D1 — resolverlos en conjunto es lo correcto.
**Resolución (Bucket A — human):** Verificar el IMM vigente en https://www.mintrab.gob.cl/, calcular 4,75 × IMM, e integrar al ejemplo numérico (D1).

---

### DEFECT #3 — NOTE (no bloquea CONDITIONAL) — Claim "30 días" sin artículo CT explícito

**Severidad:** NOTE
**Ubicación:** Blog file línea 53
**Descripción:** "Todo trabajador...tiene derecho a gratificación legal, siempre que haya trabajado al menos 30 días durante el ejercicio." Este es un claim de elegibilidad específico. El research dossier lista C8 como "VERIFIED (fuente conocida)" apuntando al art. 47 CT, pero no especifica si los "30 días" está en el texto del artículo o es una interpretación DT. El artículo no cita el artículo CT que establece este requisito.
**Resolución (Bucket A — human):** Verificar en el texto del art. 47 CT (BCN) si el requisito de 30 días está explícito. Si está en el texto legal, agregar la referencia "(art. 47 CT)" junto al claim. Si es interpretación DT, citarlo como "según la Dirección del Trabajo".

---

### DEFECT #4 — NOTE (no bloquea CONDITIONAL) — Gate 05 obligatorio no ejecutado

**Severidad:** NOTE de proceso
**Descripción:** `requires_calculation: true` activa `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC`. La fórmula `min(gratificación_bruta, tope_anual)` y el ejemplo numérico deben ser verificados adversarialmente por MathAuditAgent (ChatGPT) antes de publicar. Este gate no es opcional para este artículo.
**Resolución (Bucket A — human):** Ejecutar Gate 05 con el playbook de `context/EDITORIAL_AI_PIPELINE.md §8` en ChatGPT antes de resolver D1/D2.

---

## Separation of Duties Declaration

| Stage | Role | Tool / Session | SoD Status |
|---|---|---|---|
| 02 Research | ResearchAgent | Claude Code — Sprint 2B session (2026-05-03) | ✓ |
| 03 Outline | OutlineAgent | Claude Code — Sprint 2B session (2026-05-03) | ✓ |
| 04 Draft | DraftAgent | Claude Code — Sprint 2B session (2026-05-03) | ✓ |
| 05 Math audit | MathAuditAgent | ChatGPT — sesión fresca (PENDIENTE — OBLIGATORIO) | ⬜ |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-04 (esta sesión) | ✓ SoD cumplido |

**SoD verdict:** ✅ No violación de roles. DraftAgent (Sprint 2B) es sesión distinta de ComplianceAgent (sesión 2026-05-04).

---

## Overall Verdict

**CONDITIONAL**

El artículo tiene sólida estructura legal, fuentes oficiales (BCN, DT, Mintrab) linkeadas en el cuerpo, vigencia explícita, excepciones cubiertas y tono educativo apropiado. No hay claims falsos ni inferencias sin etiquetar.

**Bloqueantes para pasar a PASS:**
1. **D1 + D2 (dependientes):** Verificar IMM vigente en Mintrab → completar ejemplo numérico (tope y resultado) → actualizar blog file.
2. Ejecutar Gate 05 (MathAuditAgent — ChatGPT, obligatorio) antes de modificar el blog file para evitar doble trabajo si el math audit detecta errores en la fórmula.
3. Verificar claim "30 días" contra texto art. 47 CT (D3) — menor pero recomendado.
4. Re-evaluar Gate 06 en sesión fresca tras resolución de D1/D2 para emitir veredicto PASS.

**NORMA_YMYL score estimado post-resolución:** ~9.6/10 (precisión+fuentes sube cuando IMM verificado y ejemplo completo; claridad+estructura sube cuando ejemplo queda completo).
