# 03-outline — Centro Operación Renta

**Status: DRAFT — pending human editorial review**  
**Role:** OutlineAgent  
**Role-concentration note:** This file was produced by Claude acting as OutlineAgent. `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` requires role separation between pipeline stages. All AI roles in this session are Claude. This structural defect is declared in 06-compliance.md and resolved by human sign-off on 07-publish-packet.md.

---

## Article metadata

| Field | Value |
|-------|-------|
| Slug | `operacion-renta-centro` |
| Cluster | `impuestos-personas` |
| Hub parent | `/guias/impuestos-personas/` |
| Calculator sibling | `/calculadoras/operacion-renta/` (coexistencia válida) |
| Word count target | 1,800–2,400 words |
| Schema targets | `FAQPage`, `HowTo` (eligibility decision), `Article` |
| Primary query target | "operación renta 2026 Chile" |
| Filing year | 2026 (2025 tax year) |

---

## H1

**Centro Operación Renta 2026: guía completa para declarar en Chile**

*SEO note:* Includes "operación renta 2026" and "declarar en Chile". Year-stamped for freshness signal.

---

## Content structure

### [Respuesta rápida] ¿Debo declarar la renta en 2026?

*Purpose:* Fulfils CONTRACT.YMYL_RESPONSE_STRUCTURE. Answers the dominant user intent in ≤4 sentences before any qualifying detail. Required block per NORMA_YMYL.md.*

Structure:
- **Regla general (rule):** Who must declare, in one direct sentence
- **Excepciones:** Who is exempt (single-employer, correct withholding)
- **Vigencia:** 2026 campaign for 2025 tax year; deadline note with TODO:SOURCE
- **Fuentes:** SII (sii.cl), Ley de Impuesto a la Renta

---

### H2: ¿Quién DEBE declarar el Formulario 22?

*Source mapping:* 02-research.md §2.1*

Sub-sections:
- Trabajadores con dos o más empleadores (H3)
- Trabajadores con ingresos por honorarios (H3) — cites 15.25% PPM [VERIFIED per Ley 21.133]
- Personas con rentas del exterior (H3)
- Personas con ingresos por arriendo (H3) — [TODO:SOURCE thresholds]
- Ganancias de capital (H3) — [TODO:SOURCE thresholds post Ley 21.210]

*DraftAgent note:* Each H3 requires a direct answer sentence, then a 2–3 sentence explanation. No bracket tables in this section (bracket detail in calculator CTA section).

---

### H2: ¿Quién NO necesita declarar?

*Source mapping:* 02-research.md §2.3*

Sub-sections:
- Trabajador con empleador único (H3) — explains why (employer handles withholding)
- Pensionados sin ingresos adicionales (H3)
- Ingresos bajo el umbral de exención (H3) — [TODO:SOURCE current UTM threshold]

*DraftAgent note:* This section reduces user anxiety and prevents unnecessary filings. Keep factual and direct.

---

### H2: Plazos Operación Renta 2026

*Source mapping:* 02-research.md §3*

Structure:
- Opening date of SII portal — [TODO:SOURCE]
- Deadline for online filing — [TODO:SOURCE; historically April 30]
- What happens if you miss the deadline (multas preview — links to ¿qué hacer si debo? section)

*DraftAgent note:* Every date in this section requires a TODO:SOURCE tag visible in the draft. No specific dates may appear without official 2026 SII Resolución citation.

---

### H2: Calculadora Operación Renta — ¿cuánto me devuelven?

*Purpose:* Non-competing CTA to sibling calculator at `/calculadoras/operacion-renta/`. Fulfils localDelta from 01-artifact.md.*

Structure:
- 2-sentence intro explaining what the calculator does
- Embedded CTA card / inline link to `/calculadoras/operacion-renta/`
- Brief note on what the calculator needs (ingresos, retenciones) to estimate the result

*DraftAgent note:* This is the conversion point. The article explains context; the calculator answers "cuánto". Keep this section brief and clearly signposted.

---

### H2: ¿Cuándo me pagan la devolución?

*Source mapping:* 02-research.md §8*

Structure:
- Propuesta aceptada: timeline (fast-track) — [TODO:SOURCE TGR 2026 timeline]
- Declaración manual: timeline — [TODO:SOURCE]
- Registro de cuenta bancaria en TGR (how-to, 3 steps)
- Sin cuenta registrada: cheque por correo (slower)

*DraftAgent note:* Users reading this have already decided they have a refund coming. Prioritise actionable steps. Register TGR account before filing.

---

### H2: Formulario 22 — secciones que más confunden

*Source mapping:* 02-research.md §4*

Structure:
- Table: key Form 22 sections with plain-language explanation
- What appears pre-filled vs. what requires manual entry
- Boletas de honorarios: confirmation that electronic boletas are pre-loaded

*DraftAgent note:* [TODO:SOURCE — verify current Form 22 line numbers for 2025 return from SII portal. Do NOT use prior-year line numbers without verification.]*

---

### H2: ¿Qué hacer si el resultado es que debo pagar?

*Source mapping:* 02-research.md §7*

Structure:
- Paying immediately online (Webpay/SII portal)
- Convenio de pago for taxpayers who cannot pay in full — [TODO:SOURCE current terms]
- Multas por declaración tardía — [TODO:SOURCE penalty schedule]
- What NOT to do: ignoring the notice (SII enforcement escalation)

*DraftAgent note:* YMYL risk is highest in this section. All penalty amounts require TODO:SOURCE. Frame as procedural guidance, not legal advice.

---

### H2: Retención de honorarios — ¿qué fue el 15,25%?

*Source mapping:* 02-research.md §5*

Structure:
- What PPM is and why it appears on Form 22 as a credit
- 15.25% rate per Ley 21.133 [VERIFIED]
- How to locate it on Form 22 — [TODO:SOURCE line number]
- Workers who did NOT have 15.25% withheld (old-style boletas, pre-reform contracts) — [TODO:SOURCE any transition provisions still in effect for 2025]

*DraftAgent note:* The 15.25% figure is confirmed. Do not add a TODO:SOURCE on the rate itself. Add TODO:SOURCE only for line numbers and transition provisions.

---

### H2: Preguntas frecuentes

*Purpose:* FAQPage schema target. 4–6 questions.*

Planned FAQ items:
1. ¿Puedo declarar después del 30 de abril? (deadline extension/late filing consequences)
2. ¿Qué pasa si tengo deudas con el SII y me corresponde devolución? (offset against arrears)
3. ¿Cómo sé si tengo propuesta de declaración automática? (propuesta pre-llenada access)
4. ¿Necesito contador para declarar? (self-filing guidance)
5. ¿Qué documentos necesito tener a mano? (checklist)

*DraftAgent note:* Each FAQ answer must be ≤100 words, direct, and cite the applicable source (SII/TGR). No "consulte a un contador" as the primary answer — this is a self-service guide.*

---

### Footer: Información vigente para Operación Renta 2026

*Purpose:* Fulfils INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED.*

Standard freshness footer:
- Information verified as of [cut-off date]
- Primary source: SII (sii.cl) — verify current deadlines and figures directly before acting
- TGR (tgr.cl) for refund timeline
- Last reviewed: [human editor completes at publication]

---

## Internal links plan

| From section | Target | Anchor text | Relationship |
|-------------|--------|-------------|-------------|
| Calculadora CTA | `/calculadoras/operacion-renta/` | "Calcular mi resultado" | Coexistencia válida |
| Parent hub breadcrumb | `/guias/impuestos-personas/` | "Impuestos para personas" | Hub parent |
| UTM mentions | `/glosario/utm/` (if exists) | "UTM" | Glossary |
| UF mentions | `/glosario/uf/` (if exists) | "UF" | Glossary |
| RLI definition | Hub article if exists | "Renta Líquida Imponible" | Cluster internal link |

---

## Excluded topics (out of scope for this article)

| Topic | Why excluded |
|-------|-------------|
| Impuesto a empresas (1ra categoría) | Out of scope — this guide is for natural persons only |
| IVA / boleta de ventas | Different tax; different form |
| PYME regime | Business-focused; different tax treatment |
| SII auditoria / fiscalización process | Beyond filing scope; legal advisory territory |
| Specific tax planning strategies | YMYL risk; requires NORMA_YMYL.md human sign-off on advice framing |
