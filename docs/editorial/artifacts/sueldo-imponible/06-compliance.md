# Gate 06 — Compliance Review: sueldo-imponible-chile

Status: CONDITIONAL — valores de referencia sin verificar (tope UF, tramos ISC, tope APV); Gate 05 obligatorio
Role: ComplianceAgent (Claude Code — fresh session, adversarial)
Fecha de revisión: 2026-05-04
Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/sueldo-imponible/02-research.md` (implícito en contexto del draft)
  - `docs/editorial/artifacts/sueldo-imponible/04-draft.md`
  - `src/data/blog/sueldo-imponible-chile.md` (blog file — versión publicable; se revisó el blog file)
  - `docs/editorial/artifacts/sueldo-imponible/05-math-audit.md` — AUSENTE (Gate 05 obligatorio por `requires_calculation: true`)

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 8.5/10 | 2.98/3.50 | `articleLead.answer` preciso y directo. Tabla imponibles/no imponibles es fortaleza del artículo. Penalización: la promesa "cómo determina el ISC" en `covers` no se cumple completamente — la sección ISC no muestra la tabla de tramos. |
| Precisión + fuentes | 25% | 7.5/10 | 1.88/2.50 | BCN (art. 41), SPensiones y SII linkeados. Tope UF "~87,1" es referencia sin verificar. Tramos ISC y tope APV sin valores concretos. AFP "~10,5%" sin verificar por AFP específico. |
| Vigencia + calendario | 15% | 9.5/10 | 1.43/1.50 | Cut-off 2026-05-03 presente arriba y abajo. Nota explícita de actualización para tope UF, tramos ISC. |
| Excepciones + cobertura | 15% | 8.5/10 | 1.28/1.50 | Ambigüedad bono asistencia cubierta; colación y movilización claros; APV explicado. Penalización: ISC section no cubre el mecanismo de retención mensual con valores reales. |
| Claridad + estructura | 10% | 9.0/10 | 0.90/1.00 | H2 claros; tabla bien formateada; pseudocódigo de cálculo útil; "orientativo" en ejemplo. |
| **TOTAL** | 100% | — | **8.47/10** | **Por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — CONDITIONAL — Tope máximo imponible "~87,1 UF" sin verificar

**Severidad:** CONDITIONAL (bloquea publicación)
**Ubicación:** Blog file línea 94
**Descripción:** El artículo incluye "valor de referencia: ~87,1 UF mensuales" para el tope máximo imponible de cotizaciones previsionales, con redirect a SPensiones. Este valor es una cifra específica que si estuviese desactualizada induciría error en los cálculos del lector. El "~" y el redirect mitigan pero no eliminan el riesgo: un lector puede usar ese número sin verificar.
**NORMA_YMYL:** MUST #4 (fuente oficial) y §4 (valores actualizables deben declarar su fuente con fecha).
**Resolución (Bucket A — human + MathAuditAgent):**
- Verificar el tope máximo imponible vigente en https://www.spensiones.cl/ al momento de publicar.
- Si confirma ~87,1 UF: cambiar texto a "XX,X UF mensuales (vigente a [fecha], según Superintendencia de Pensiones)" con link.
- Si el valor es distinto: actualizar el número y la fecha.
- Alternativa conservadora: eliminar el número de referencia y dejar solo el redirect a SPensiones.

---

### DEFECT #2 — CONDITIONAL — Sección ISC sin tabla de tramos: promesa no cumplida

**Severidad:** CONDITIONAL (bloquea publicación — incumple `articleLead.covers`)
**Ubicación:** Blog file líneas 96–100; `articleLead.covers` ítem 2
**Descripción:** El frontmatter promete "Cómo la base imponible determina AFP, salud, AFC e ISC". La sección ISC del artículo describe el mecanismo (7 tramos, 0%–40%, en UTM) pero no incluye la tabla de tramos, redirigiendo al SII. Para AFP, salud y AFC se dan tasas concretas (~10,5%, 7%, 0,6%). Para el ISC no se da ninguna cifra — hay asimetría informativa que deja incumplida la promesa del `covers`.
**NORMA_YMYL:** MUST #1 (respuesta concreta para la query principal) y §2.2 (patrones prohibidos: "verificar en SII" sin dar la regla).
**Resolución — Opción A (más sólida, Bucket A):** Incluir la tabla de tramos ISC vigentes con tasas en UTM, fuente SII y fecha de corte. Se convierte en dato actualizable pero completa la promesa.
**Resolución — Opción B (conservadora, Bucket C):** Ajustar `articleLead.covers` ítem 2 para reflejar lo que realmente cubre: "Cómo la base imponible determina AFP, salud y AFC (tasas orientativas; ISC depende del tramo)." Esto no añade datos nuevos pero alinea la promesa con el contenido real, eliminando el defecto de incumplimiento.

---

### DEFECT #3 — NOTE — Tope APV sin valor de referencia

**Severidad:** NOTE (no bloquea si D1 y D2 se resuelven)
**Ubicación:** Blog file línea 104
**Descripción:** El tope legal del APV Modalidad A se describe como "un tope legal anual definido en UTM (verifica el límite vigente con tu AFP o en el SII)" sin dar ningún valor de referencia. A diferencia del tope UF (D1), aquí el artículo no incluye un número que pueda inducirnos a error — es puramente un redirect. Esto es defensivamente correcto, pero deja al lector sin contexto de magnitud.
**Resolución (opcional):** Si se verifica el tope APV en SII al publicar, agregar el valor de referencia con fecha y fuente. No bloqueante.

---

### DEFECT #4 — NOTE — Gate 05 obligatorio no ejecutado

**Severidad:** NOTE de proceso
**Descripción:** `requires_calculation: true` activa `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC`. El pseudocódigo de cálculo, los porcentajes (10,5%, 7%, 0,6%) y el ejemplo numérico deben verificarse adversarialmente por MathAuditAgent (ChatGPT). En particular, "~10,5%" para AFP es una aproximación que varía por AFP; Gate 05 debe confirmar si es precisa como referencia o si debe ajustarse.
**Resolución (Bucket A — human):** Ejecutar Gate 05 antes de publicar.

---

## Separation of Duties Declaration

| Stage | Role | Tool / Session | SoD Status |
|---|---|---|---|
| 02 Research | ResearchAgent | Claude Code — Sprint 2B session | ✓ |
| 04 Draft | DraftAgent | Claude Code — Sprint 2B session | ✓ |
| 05 Math audit | MathAuditAgent | ChatGPT — sesión fresca (PENDIENTE — OBLIGATORIO) | ⬜ |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-04 (esta sesión) | ✓ SoD cumplido |

---

## Overall Verdict

**CONDITIONAL**

Artículo bien estructurado con tabla de componentes imponibles/no imponibles como pieza central — es la fortaleza real del artículo. Fuentes oficiales linkeadas en frontmatter y cuerpo. No hay claims falsos ni inferencias legales sin etiqueta.

**Bloqueantes para pasar a PASS:**
1. D1: Verificar y actualizar tope UF imponible desde SPensiones con fecha explícita.
2. D2: Incluir tabla tramos ISC vigentes (Opción A) OR ajustar promesa en `covers` (Opción B, Bucket C — puede hacerse esta sesión si el humano autoriza la reducción del scope del artículo).
3. Gate 05 obligatorio (D4).
4. Re-evaluar Gate 06 en sesión fresca tras resolución de D1/D2.

**Acción Bucket C disponible en esta sesión (D2 Opción B):** Si el humano autoriza reducir el scope del artículo en lugar de agregar la tabla ISC, el ajuste de `articleLead.covers` puede hacerse en esta sesión sin esperar verificación de datos externos.
