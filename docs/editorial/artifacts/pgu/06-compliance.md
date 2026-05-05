# Gate 06 — Compliance Review: pgu-pension-garantizada-universal

Status: CONDITIONAL — TODO:SOURCE visible en blog file (monto y fórmula PGU), requisito residencia sin verificar; artículo en estado pre-publicable con defectos críticos no resueltos
Role: ComplianceAgent (Claude Code — fresh session, adversarial)
Fecha de revisión: 2026-05-04
Archivos revisados:
  - `docs/editorial/NORMA_YMYL.md`
  - `docs/editorial/artifacts/pgu/04-draft.md`
  - `src/data/blog/pgu-pension-garantizada-universal.md` (blog file — se revisó el blog file)
  - `docs/editorial/artifacts/pgu/05-math-audit.md` — AUSENTE (Gate 05 obligatorio por `requires_calculation: true`)

> **Alerta `regulatory_sensitivity: alta`**: Este artículo trata un beneficio estatal de pensión con requisitos de elegibilidad legales. Cualquier error en los requisitos, montos o fórmulas puede afectar decisiones de jubilación de personas vulnerables. El estándar de verificación es el más alto del pipeline.

---

## NORMA_YMYL Scorecard

| Dimensión | Peso | Puntuación | Ponderado | Notas |
|---|---|---|---|---|
| Respuesta ancla | 35% | 7.0/10 | 2.45/3.50 | Lead declarativo: "El monto se reajusta periódicamente — verifica en IPS." Sin valor de referencia. La sección de complemento AFP tiene un TODO:SOURCE explícito visible en el blog file. El artículo reconoce sus propias brechas — lo que es honesto pero indica estado de borrador, no publicable. |
| Precisión + fuentes | 25% | 6.5/10 | 1.63/2.50 | IPS y ChileAtiende linkeados. Monto PGU sin verificar. Fórmula complemento sin verificar. Requisito de residencia no verificado contra texto BCN. Percentil 90% no verificado. |
| Vigencia + calendario | 15% | 9.0/10 | 1.35/1.50 | Cut-off presente; reajuste PGU advertido prominentemente. Penalización: el artículo admite que datos clave pueden estar desactualizados. |
| Excepciones + cobertura | 15% | 8.5/10 | 1.28/1.50 | Casos sin AFP, extranjeros, APV, invalidez cubiertos. Complemento AFP: mecanismo explicado pero sin fórmula. |
| Claridad + estructura | 10% | 8.0/10 | 0.80/1.00 | H2s claros; tono apropiado. Penalización: TODO:SOURCE visible en el cuerpo del blog file; sección de complemento AFP explícitamente incompleta al lector. |
| **TOTAL** | 100% | — | **7.51/10** | **Significativamente por debajo del umbral 9.5 — no PASS** |

---

## DEFECTS

### DEFECT #1 — CONDICIONAL CRÍTICO — TODO:SOURCE visible en el blog file publicable

**Severidad:** CONDICIONAL CRÍTICO — bloqueo absoluto de publicación; si se activa `draft: false` con esta línea presente, el lector verá el texto interno de pipeline
**Ubicación:** `src/data/blog/pgu-pension-garantizada-universal.md` línea 98
**Descripción:** El blog file contiene el siguiente bloque visible al lector:
```
> TODO:SOURCE (MathAuditAgent + Human): verificar fórmula de reducción PGU según pensión AFP base,
> con el umbral vigente a la fecha de corte. Sin este dato, la sección de complemento no puede publicarse con cifras.
```
Este texto de pipeline no es parte del artículo editorial — es una anotación interna del DraftAgent que quedó en el blog file. Si se publica, el lector lo verá. Publicar este texto:
1. Revela el proceso interno del pipeline al lector.
2. Admite que la sección no puede publicarse sin datos adicionales.
3. Confunde la sección de complemento AFP, que ya de por sí es incompleta.
**NORMA_YMYL:** Gate G6 del publish packet — "No hay TODO:SOURCE sin resolver en el artículo publicado."
**Resolución (Bucket C — esta sesión, autorización humana implícita en encargo de Gate 06):**
Eliminar el bloque `> TODO:SOURCE` (línea 98 del blog file) y reemplazar por texto editorial apropiado que describa la brecha sin revelar el proceso interno. Ver propuesta al final de este documento.

---

### DEFECT #2 — CONDITIONAL — Monto PGU sin valor de referencia

**Severidad:** CONDITIONAL (bloquea publicación)
**Ubicación:** Blog file líneas 51, 70–72; `articleLead.answer`; `articleLead.covers` ítem 2
**Descripción:** El artículo promete "El monto vigente y cuándo se reajusta" (`covers`) pero no da ningún valor — ni siquiera aproximado. Redirige al IPS para el valor actualizado. Para un artículo de beneficio estatal con `regulatory_sensitivity: alta`, esto es defensivamente correcto (evitar publicar un monto desactualizado), pero deja la promesa del `covers` sin cumplir.
**Evaluación del trade-off:**
- Opción A (más sólida): Verificar el monto PGU vigente en IPS/Ministerio del Trabajo e incluirlo con fecha de vigencia explícita: "CLP $XXX.XXX mensual (vigente desde [decreto], según IPS — sujeto a reajuste periódico)."
- Opción B (conservadora, compatible con el artículo actual): Mantener el redirect al IPS pero ajustar `covers` ítem 2 a "Cuándo y por qué se reajusta el monto" en lugar de prometer "El monto vigente" — elimina la promesa incumplida.
**Resolución:** Bucket A requiere verificación en IPS (human). Bucket B del covers puede hacerse en Bucket C.

---

### DEFECT #3 — CONDITIONAL — Fórmula complemento PGU/AFP sin verificar ni completar

**Severidad:** CONDITIONAL (bloquea publicación — `regulatory_sensitivity: alta`)
**Ubicación:** Blog file líneas 94–100
**Descripción:** La sección "PGU y pensión AFP: ¿se complementan o se restan?" describe el mecanismo conceptualmente pero declara explícitamente que la fórmula exacta "debe verificarse en la Superintendencia de Pensiones" y que el MathAuditAgent debe completar el cálculo. La sección está incompleta por diseño del DraftAgent — no hay fórmula, no hay valores de umbral, no hay ejemplo.
**NORMA_YMYL:** MUST #1 (respuesta concreta) y MUST #4 (fuente oficial para regla crítica con efectos en ingresos de jubilados).
**Resolución (Bucket A — human + MathAuditAgent):**
1. Gate 05 (ChatGPT): verificar fórmula de reducción PGU en Superintendencia de Pensiones. Documentar los umbrales vigentes.
2. Actualizar la sección con la fórmula verificada, ejemplo numérico y fuente con fecha de vigencia.

---

### DEFECT #4 — CONDITIONAL — Requisito residencia "20 años desde los 20 años de edad" sin verificar

**Severidad:** CONDITIONAL (bloquea publicación — eligibility claim de beneficio estatal)
**Ubicación:** Blog file línea 62–63
**Descripción:** El artículo establece: "mínimo 20 años en Chile a partir de los 20 años de edad". Este es un requisito de eligibilidad específico para un beneficio estatal. El texto puede ser correcto como principio general, pero la formulación exacta (20 años contados "a partir de los 20 años de edad") debe estar respaldada por el texto legal exacto de la ley que crea la PGU (BCN). Si la ley tiene condiciones adicionales (ej: años continuos en los últimos N años), el artículo podría inducir a error a personas que no califican.
**NORMA_YMYL:** MUST #4 — "fuente oficial para regla crítica" y §4 — "no confundir aprobación/vigencia/implementación" (en beneficios, no confundir el requisito general con condiciones adicionales de verificación).
**Resolución (Bucket A — human):** Verificar el texto exacto del requisito de residencia en BCN (ley vigente que crea la PGU) y actualizar la línea con la cita del artículo legal específico.

---

### DEFECT #5 — NOTE — Percentil 90%: criterio no verificado contra normativa vigente

**Severidad:** NOTE
**Ubicación:** Blog file línea 65–66
**Descripción:** El criterio del "90% de menores ingresos" está marcado como TODO:SOURCE (C4 del draft) — verificar si sigue siendo percentil 90% en el Ministerio de Desarrollo Social. El artículo lo describe correctamente como un criterio que "la mayoría" cumple, sin dar un umbral de ingresos, lo cual es apropiado dada la complejidad del criterio.
**Resolución (Bucket A — human):** Verificar en Ministerio de Desarrollo Social que el criterio sigue siendo percentil 90%. Si cambió, actualizar el artículo.

---

### DEFECT #6 — NOTE — Gate 05 obligatorio no ejecutado

**Severidad:** NOTE de proceso — especialmente crítico para `regulatory_sensitivity: alta`
**Descripción:** `requires_calculation: true`. Gate 05 (MathAuditAgent — ChatGPT) es obligatorio antes de publicar. Debe verificar los TODO:SOURCE de C1 (monto), C5 (fórmula complemento), C3 (residencia) y C4 (percentil).

---

## Bucket C — Acción disponible esta sesión (D1)

**D1 puede resolverse en esta sesión** (eliminar TODO:SOURCE del blog file):

```
ANTES (línea 98 del blog file):
> TODO:SOURCE (MathAuditAgent + Human): verificar fórmula de reducción PGU según pensión AFP base,
> con el umbral vigente a la fecha de corte. Sin este dato, la sección de complemento no puede publicarse con cifras.

DESPUÉS (reemplazar por):
> La fórmula exacta de complemento entre pensión AFP y PGU depende de los umbrales vigentes a la fecha de cálculo. Para conocer el monto aplicable a tu caso, consulta directamente con el [IPS](https://www.ips.gob.cl/) o la [Superintendencia de Pensiones](https://www.spensiones.cl/).
```

Esta acción elimina el texto de pipeline del blog file sin resolver el defecto de fondo (D3 sigue pendiente). Requiere autorización explícita del humano para modificar el blog file.

---

## Separation of Duties Declaration

| Stage | Role | Tool / Session | SoD Status |
|---|---|---|---|
| 04 Draft | DraftAgent | Claude Code — Sprint 2B session | ✓ |
| 05 Math audit | MathAuditAgent | ChatGPT — PENDIENTE (OBLIGATORIO, regulatory_sensitivity=alta) | ⬜ |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-04 | ✓ SoD cumplido |

---

## Overall Verdict

**CONDITIONAL**

El artículo tiene estructura correcta y no contiene claims falsos — la estrategia defensiva de redirigir al IPS para el monto es legítima pero deja la promesa del artículo sin cumplir. El defecto más urgente es D1: un TODO:SOURCE de pipeline que quedó en el blog file y que sería visible al publicar. Los defectos D2/D3/D4 requieren trabajo humano y MathAuditAgent (Gate 05) antes de que este artículo pueda pasar a PASS.

**Este artículo es el más complejo del sprint y el que más trabajo de verificación humana requiere.** El monto PGU, la fórmula de complemento AFP y el texto legal exacto del requisito de residencia son los tres blockers principales.

**Orden recomendado de resolución:**
1. D1 (Bucket C, esta sesión si autorizado): eliminar TODO:SOURCE del blog file.
2. Gate 05 (human + ChatGPT): verificar C1 (monto), C5 (fórmula), C3 (residencia), C4 (percentil).
3. D2 (Bucket A): actualizar monto o ajustar `covers`.
4. D3 (Bucket A): completar sección complemento AFP con fórmula verificada.
5. D4 (Bucket A): verificar texto exact requisito de residencia en BCN.
6. Re-evaluar Gate 06 en sesión fresca.
