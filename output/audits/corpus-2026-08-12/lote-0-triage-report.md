# Triage Report — Lote 0 (SLA vencidos, cluster impuestos-personas)

**Fecha de auditoría:** 2026-08-12
**Fase:** A2 — Auditoría read-only (ComplianceAgent, sesión adversarial)
**Alcance:** 4 artículos, cluster `impuestos-personas`, `sourceMode=manual_review` / `manual_review_with_official_sources`, SLA de revisión vencido el 2026-08-09 (revisión efectiva 2026-05-11 + 90 días)
**Fichas individuales:** `output/audits/corpus-2026-08-12/fichas/<slug>.md`
**Restricciones aplicadas:** sesión de solo lectura sobre contenido — cero archivos de `src/data/blog/**` modificados, ningún gate marcado, ningún artefacto de pipeline retroactivo creado

---

## 1. Hipótesis probada

Los cuatro artículos describen la Operación Renta AT2026, cuyo período de declaración cerró en mayo de 2026 (hoy es 2026-08-12). Se probó si el texto presenta como vigente un ciclo ya cerrado (plazos en futuro, "puedes declarar hasta el...", propuestas disponibles), y si la retención de honorarios cita el porcentaje correspondiente al año en curso según el escalonamiento de la Ley 21.133.

**Resultado: hipótesis confirmada en 3 de 4 artículos.**

| Artículo | ¿Ciclo cerrado presentado como vigente? |
|---|---|
| `operacion-renta-f22-checklist` | **Sí — el más grave.** Afirma en presente indicativo: *"La plataforma del SII está abierta desde el 1 de abril... sin pago (con devolución), hasta el 8 de mayo de 2026"*. Pieza `featured`, `homepagePriority: 200`. |
| `devolucion-impuestos-fechas-compensaciones` | Sí. Intro y sección "Qué hacer ahora" tratan el calendario AT2026 como accionable hoy, sin nota de cierre de ventana. |
| `rentas-mixtas-sueldo-honorarios` | Sí, versión más leve. `articleLead.answer` dice *"debes declarar Operación Renta 2026 obligatoriamente"* sin señalar que la ventana ya cerró. |
| `boleta-honorarios-2026-retencion-cobertura` | **No.** La retención 15,25% es válida durante todo 2026; el artículo no describe un ciclo cerrado como vigente. |

La retención de honorarios (15,25% para 2026) se verificó correcta en los cuatro artículos que la citan — no hay error de escalonamiento Ley 21.133.

---

## 2. Verdictos y scorecard (NORMA §7)

| Artículo | Verdicto | Score | Ancla 35% | Precisión/fuentes 25% | Vigencia 15% | Excepciones 15% | Claridad 10% |
|---|---|---|---|---|---|---|---|
| `boleta-honorarios-2026-retencion-cobertura` | **CONDITIONAL** | 8,95/10 | 9,5 | 9,5 | 7,0 | 9,0 | 8,5 |
| `devolucion-impuestos-fechas-compensaciones` | **FAIL** | 6,75/10 | 6,0 | 8,5 | 3,0 | 8,5 | 8,0 |
| `operacion-renta-f22-checklist` | **FAIL** | 6,575/10 | 5,0 | 9,0 | 2,0 | 9,5 | 8,5 |
| `rentas-mixtas-sueldo-honorarios` | **FAIL** | 7,225/10 | 7,5 | 6,5 | 5,0 | 9,5 | 8,0 |

Umbral de publicación NORMA §7: 9,5/10. Ninguno de los cuatro lo alcanza; ninguno tenía verdicto previo registrado (retrofit).

---

## 3. Hallazgo de exactitud numérica (R5)

**1 hallazgo confirmado**, con los cuatro datos exigidos por el método de verificación (valor en el artículo | valor oficial | URL | fecha de recuperación):

| Artículo | Cifra en el artículo | Valor oficial | Fuente | Fetch |
|---|---|---|---|---|
| `rentas-mixtas-sueldo-honorarios` (líneas 53, 69) | Tramo exento IGC 13,5 UTA = **$11.322.018** | **$11.265.804** — cita literal SII: *"13,5 UTA del mes dic. de 2025 = $11.265.804"* | https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html | 2026-08-12 |

Diferencia: +$56.214 (+0,5%). La fórmula del artículo es correcta (13,5 × UTA dic-2025 = 13,5 × $834.504 = $11.265.804 exacto); el valor final publicado no coincide con esa misma fórmula, lo que sugiere un error de dato o redondeo en algún paso de la elaboración, no un error conceptual.

**Cifras verificadas y correctas** (sin discrepancia) en los cuatro artículos:

| Cifra | Valor en artículo(s) | Fuente oficial | Fetch |
|---|---|---|---|
| Retención boletas 2026 y escalonamiento Ley 21.133 | 2025:14,5% / 2026:15,25% / 2027:16,0% / 2028:17,0% | SII, aumento gradual | 2026-08-12 |
| Umbral exención cotización honorarios | 5 IMM (año base 2025) | ChileAtiende, ficha 12016 | 2026-08-12 |
| Base de cotización honorarios | 80% del bruto boleteado | ChileAtiende, ficha 12016 | 2026-08-12 |
| Calendario depósito devoluciones AT2026 | 29 abril / 15 mayo / 27 mayo; cheques 29 mayo | SII, comunicado 31-03-2026 | 2026-08-12 |
| Crédito gastos educación | $174.803 (4,4 UF al 31-12-2025) por hijo | SII, beneficio educación AT2026 | 2026-08-12 |
| Préstamo Solidario COVID-19, 4ª cuota | 30% del monto, tope 5% de ingresos anuales | SII / prensa oficial | 2026-08-12 |

---

## 4. Clasificación por bucket (protocolo §9.2 EDITORIAL_AI_PIPELINE)

### BUCKET A — Humano (no se toca en esta ni en ninguna sesión de agente sin sign-off)
- SLA vencido en los 4 artículos (2026-08-09) — decidir refresco con verificación real vs. confirmación de vigencia sin cambio sustantivo (`NORMA` §5.2 prohíbe mover fecha "para que se vea fresca").
- Reencuadre temporal del ciclo cerrado en `operacion-renta-f22-checklist` (máxima prioridad: pieza featured/portada) y `devolucion-impuestos-fechas-compensaciones`.
- Reencuadre más leve del mismo problema en `rentas-mixtas-sueldo-honorarios`.
- Corrección de cifra $11.322.018 → $11.265.804 en `rentas-mixtas-sueldo-honorarios`.
- Ausencia de `articleLead` en `devolucion-impuestos-fechas-compensaciones` y `operacion-renta-f22-checklist`.

### BUCKET B — Re-auditoría en sesión fresca
- Deferral border-line ("facilidades de pago, consulta en sii.cl") en `operacion-renta-f22-checklist` y `rentas-mixtas-sueldo-honorarios` — si se decide fetchear condiciones generales de convenio SII.
- Compliance fresca (Fase C) obligatoria sobre cualquier pieza que entre a remediación sustantiva por R2 o R5.

### BUCKET C — Resolvable en sesión de contenido (estructural, sin cambio sustantivo)
- H2 no alineados a nomenclatura literal DoD §2 en los 4 artículos — SHOULD, no bloqueante (nota de precedencia del plan §6).
- `rentas-mixtas-sueldo-honorarios` es el más incompleto en este eje: sin H2 "Errores comunes", sin H2 "Preguntas frecuentes" visible en cuerpo, sin H2 "Fuentes" dedicado.

**Acción en esta sesión:** ninguna. Todos los hallazgos con impacto en contenido son Bucket A o B. Los hallazgos Bucket C se dejan documentados para cuando se abra una sesión de remediación estructural, pero no se ejecutan aquí porque el criterio de "solo lectura sobre contenido" de esta auditoría los incluye.

---

## 5. Cifras propuestas para `volatileData`

Para que este barrido no deba repetirse completo en seis meses:

- Tramo exento IGC (13,5 UTA en pesos) — cambia cada año con la UTA de diciembre.
- Umbral 5 IMM para exención de cotización de honorarios — cambia con el IMM anual.
- Calendario de depósito de devoluciones AT — se republica cada año tributario.
- Monto del crédito por gastos de educación (4,4 UF en pesos) — cambia con la UF de cierre de año.
- Escalonamiento de retención de boletas Ley 21.133 — horizonte fijo hasta 2028, pero el marcador "vigente" debe re-verificarse cada enero.

---

## 6. Verificación del gate (no se cierra en esta sesión)

```
$ pnpm run check:editorial-timeliness
[check-editorial-timeliness] published=53 stale=4 drift=0 report=output/validation/editorial-timeliness/report.json
[check-editorial-timeliness] FAIL:
- src/data/blog/boleta-honorarios-2026-retencion-cobertura.md: review SLA expired on 2026-08-09 (90d cadence, sourceMode=manual_review_with_official_sources).
- src/data/blog/devolucion-impuestos-fechas-compensaciones.md: review SLA expired on 2026-08-09 (90d cadence, sourceMode=manual_review).
- src/data/blog/operacion-renta-f22-checklist.md: review SLA expired on 2026-08-09 (90d cadence, sourceMode=manual_review).
- src/data/blog/rentas-mixtas-sueldo-honorarios.md: review SLA expired on 2026-08-09 (90d cadence, sourceMode=manual_review).
[ELIFECYCLE] Command failed with exit code 1.
```

`stale=4` se mantiene sin cambios respecto del inicio de la sesión: esta auditoría diagnostica el gate, no lo cierra. `git status --short src/data/blog/` confirma cero archivos de contenido modificados.

---

## 7. Bloqueadores para cerrar el gate

1. 3 de 4 artículos tienen verdicto **FAIL** por vigencia y/o exactitud numérica; requieren remediación sustantiva (Fase B, sesión distinta a esta) antes de que el SLA pueda cerrarse de forma legítima.
2. Mover `validAsOf`/`updatedDate` sin corregir el contenido subyacente fabricaría señal de frescura, prohibido por `NORMA_YMYL` §5.2.
3. `operacion-renta-f22-checklist` debe tratarse con prioridad máxima dentro del lote por ser pieza `featured` con `homepagePriority: 200` — es la de mayor exposición y el hallazgo de vigencia más severo.
4. Cierre del gate requiere, como mínimo: Fase B (run de pipeline por artículo con hallazgo sustantivo) → Fase C (compliance fresca) → firma humana en `07-publish-packet.md`. Ningún agente marca gates.

---

**Fin del reporte. No se ejecutó remediación. La firma es humana.**
