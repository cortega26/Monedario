# Title and Meta Description Proposals — Phase 2 Wave 1

**Date:** 2026-04-24  
**Scope:** Pages surfaced in Wave 1 (buscar.astro chips + top-traffic pages)  
**Authority:** `context/CONTRACTS.md` — CONTRACT.EDITORIAL.META_DESCRIPTION  
**Application rule:** Only `no-claim-change` proposals are applied in Wave 1. All others require editorial sign-off or source verification before touching.

---

## Classification key

| Class | Meaning | Wave 1 action |
|---|---|---|
| `no-claim-change` | Character-count fix or formatting only; no change to factual claims | APPLY NOW |
| `editorial-review-needed` | Wording change that affects the promise or claim | DO NOT apply — flag for Wave 5 editorial pipeline |
| `YMYL-source-needed` | Specific financial claim requiring official source verification | DO NOT apply — blocked until NORMA_YMYL.md pipeline |

### CONTRACT.EDITORIAL.META_DESCRIPTION thresholds
- Recommended: 70–155 chars
- Warning: 156–200 chars (allowed, but a risk signal)
- Blocking: > 200 chars (must fix before publish)

---

## Inspected pages

### 1. Homepage — `src/pages/index.astro`

| Field | Current | Length | Status |
|---|---|---|---|
| `<title>` | Monedario \| Calculadoras y guías para decisiones financieras en Chile | 67 chars | Within limit |
| `description` | Calculadoras y guías para entender sueldo líquido, AFP, impuestos, crédito, UF y presupuesto con información clara y práctica para Chile. | 138 chars | ✅ Recommended |

**Proposal:** No change needed. Both title and description are within the recommended range and accurately reflect page content.  
**Classification:** N/A — current state is compliant.

---

### 2. Calculadoras index — `src/pages/calculadoras/index.astro`

| Field | Current | Length | Status |
|---|---|---|---|
| `<title>` | Calculadoras Financieras en Chile \| Monedario | 46 chars | Within limit |
| `description` | Explora calculadoras gratuitas agrupadas por ingresos, previsión, deuda y UF para llegar más rápido a la herramienta correcta. | 125 chars | ✅ Recommended |

**Proposal:** No change needed.  
**Classification:** N/A — current state is compliant.

---

### 3. Calculadora de Sueldo Líquido — `src/pages/calculadoras/sueldo-liquido.astro`

| Field | Current | Length | Status |
|---|---|---|---|
| `<title>` | Calculadora de Sueldo Líquido y Bruto Chile 2026 | 48 chars | Within limit |
| `description` | Calcula tu sueldo líquido desde el bruto, o el bruto necesario para recibir el líquido que quieres. Desglose de AFP, salud, cesantía e impuesto. Gratis y actualizada 2026. | 168 chars | ⚠️ Warning (156–200) |

**Issue:** Description is 168 chars — in the warning zone per CONTRACT.EDITORIAL.META_DESCRIPTION.

**Proposed description (editorial-review-needed):**
> "Calcula tu sueldo líquido o el bruto necesario para tu meta de líquido. Desglose de AFP, salud, cesantía e impuesto incluido. Actualizada 2026."
> (144 chars — ✅ recommended range)

**Why editorial-review-needed:** Removing "desde el bruto" and compressing "el bruto necesario para recibir el líquido que quieres" changes the framing even without changing the factual claim. Needs editorial sign-off before applying.

**Wave 1 action:** DO NOT apply — flag for editorial review in Wave 5.

---

### 4. Calculadora de Finiquito — `src/pages/calculadoras/finiquito-indemnizacion.astro`

| Field | Current | Length | Status |
|---|---|---|---|
| `<title>` | Calculadora de Finiquito e Indemnización \| Chile | 49 chars | Within limit |
| `description` | Estima finiquito, aviso previo, años de servicio y feriado proporcional con supuestos visibles para revisar tu salida laboral. | 126 chars | ✅ Recommended |

**Proposal:** No change needed.  
**Classification:** N/A — current state is compliant.

---

### 5. DICOM article — `src/data/blog/donde-ver-si-estoy-en-dicom-gratis.md`

| Field | Current | Length | Status |
|---|---|---|---|
| `title` | Dónde ver si estás en DICOM gratis en Chile y qué revisar primero | 66 chars | Within limit |
| `description` | Guía práctica para separar Informe de Deudas CMF, Boletín Comercial y reportes privados tipo DICOM, y partir por el reporte correcto sin pagar de más. | 151 chars | ✅ Recommended |

**Proposal:** No change needed.  
**Classification:** N/A — current state is compliant.

---

### 6. Liquidación de sueldo — `src/data/blog/liquidacion-de-sueldo.md`

| Field | Current | Length | Status |
|---|---|---|---|
| `title` | Liquidación de sueldo en Chile: cómo auditar el comprobante y sus líneas clave | 80 chars | Within limit |
| `description` | Guía para auditar tu liquidación de sueldo en Chile: qué debe mostrar el comprobante, qué respaldos pedir y qué líneas revisar antes de darlo por bueno. | 152 chars | ✅ Recommended |

**Proposal:** No change needed.  
**Classification:** N/A — current state is compliant.

---

### 7. AFP article — `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md`

| Field | Current | Length | Status |
|---|---|---|---|
| `title` | Descuento AFP en tu sueldo: cotización obligatoria, comisión y cómo revisarlo | 78 chars | Within limit |
| `description` | Desglose de la línea AFP en tu sueldo: cotización obligatoria, comisión, reforma vigente y cómo revisar ese descuento sin abrir todo el cálculo del líquido. | 157 chars | ⚠️ Warning (156–200) |

**Issue:** Description is 157 chars — just past the 155-char recommended ceiling.

**Proposed description (no-claim-change):**
> "Desglose de la línea AFP en tu sueldo: cotización obligatoria, comisión, reforma vigente y cómo revisar ese descuento sin recalcular el líquido."
> (144 chars — ✅ recommended range)

**Why no-claim-change:** Replacing "sin abrir todo el cálculo del líquido" with "sin recalcular el líquido" carries identical meaning. No factual claim altered.

**Wave 1 action:** APPLY — this is a `no-claim-change` trim. Applied to `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md`.

---

### 8. Operación Renta — `src/data/blog/operacion-renta-f22-checklist.md`

| Field | Current | Length | Status |
|---|---|---|---|
| `title` | Operación Renta F22 en Chile: checklist para revisar, enviar y rectificar sin errores | 86 chars | Within limit |
| `description` | Checklist práctico para revisar la propuesta del SII, enviar tu Formulario 22 y corregir observaciones sin atrasar tu devolución en Operación Renta. | 149 chars | ✅ Recommended |

**Proposal:** No change needed.  
**Classification:** N/A — current state is compliant.

---

### 9. Boleta de honorarios — `src/data/blog/boleta-honorarios-2026-retencion-cobertura.md`

| Field | Current | Length | Status |
|---|---|---|---|
| `title` | Boleta de honorarios 2026: retención 15,25%, líquido recibido y cobertura anual | 80 chars | Within limit |
| `description` | Explicación práctica de la retención 2026 en boletas de honorarios, cuánto recibes líquido y cómo se conecta con la cobertura previsional anual. | 145 chars | ✅ Recommended |

**Proposal:** No change needed.  
**Classification:** N/A — current state is compliant.

---

## Wave 1 applied changes

Only one `no-claim-change` item was identified for immediate application:

| Page | Field | Change | Applied |
|---|---|---|---|
| `cuanto-descuenta-la-afp-de-tu-sueldo.md` | `description` | Trim 157 → 144 chars (no-claim-change wording) | Yes — in Wave 1 |

All other pages are already within the recommended 70–155 char range, or their adjustments require editorial review (Wave 5).

---

## Deferred proposals (Wave 5 editorial pipeline)

| Page | Issue | Class | Notes |
|---|---|---|---|
| `sueldo-liquido.astro` | Description 168 chars (warning) | `editorial-review-needed` | Shortening requires rewording the bidirectional calc claim |

---

## Pages not yet inspected (beyond Wave 1 scope)

All other blog posts, glossary entries, and calculator pages not linked from buscar.astro chips are outside Wave 1 scope. A full audit should be conducted in Wave 5 using `pnpm run check:frontmatter` as the primary gate.
