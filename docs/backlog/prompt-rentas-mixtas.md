# Prompt – New Conversation: Artículo "Rentas Mixtas"

## Estado
Listo para usar. Pega como mensaje inicial de una nueva conversación con el agente.

---

## Prompt completo

---

## Task Brief

- **Objective:** Create a new article to fill the structural gap in the *Impuestos Personas* silo (currently 3 articles, minimum required: 4). The article covers **rentas mixtas en Chile**: how an employee who also issues *boletas de honorarios* must declare, what determines whether they owe extra taxes or get a refund, and how both income sources interact in *Operación Renta*.
- **In scope:**
  - `src/data/blog/rentas-mixtas-sueldo-honorarios.md` (new file)
  - `artifacts/editorial/rentas-mixtas-sueldo-honorarios/<run-id>/` (editorial pipeline artifacts)
  - `scripts/hero-images/manifest.json`, `prompts.json`, `status.json` (pipeline updates after scan)
  - `scripts/hero-images/prompt-plan.mjs` (SLUG_OVERRIDES if needed)
- **Out of scope:** `src/domain/**`, `src/application/**`, routing changes, any existing article rewrites. Do NOT touch other blog articles unless adding a single targeted cross-link.
- **Invariants/Contracts to preserve:** `URL.PUBLIC.NO_POST_ID`, `FRONTMATTER.VALID`, `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`, `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS`, `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`, hero image publication invariant
- **Required gates:** `pnpm run check:frontmatter`, `pnpm run check:hero-images`, `pnpm run check:hero-prompts`, `pnpm run check:editorial-structure`, `pnpm run check:dialect`, `pnpm run check:images`
- **Deliverable:** Mergeable article file + full editorial artifact set + hero prompt registered + hero image placed at `public/images/hero/rentas-mixtas-sueldo-honorarios.avif` + all gates passing

---

## Authority Check

`1) docs/AI_ENGINEERING_CONSTITUTION.md → 2) AGENTS.md → 3) context/*.md → 4) source code`

---

## Project Context (Monedario.cl)

- **Site:** Monedario.cl — Chilean personal finance media site. YMYL domain.
- **Tech stack:** Astro 6.1.4, Zod content schemas, pnpm, TypeScript, MDX-adjacent markdown blog
- **Content schema:** `src/content.config.ts` — blog collection with mandatory Zod validation
- **Workspace root:** `/home/carlos/VS_Code_Projects/Monedario`

---

## Silo: Impuestos Personas

**Status:** PARCIAL — 3 articles, minimum 4 required.

**Existing articles in silo (`cluster: impuestos-personas`):**
| Slug | Title (summary) | topicRole |
|------|-----------------|-----------|
| `boleta-honorarios-2026-retencion-cobertura` | 15.25% retention on honorarios, liquid amount, annual coverage | owner |
| `devolucion-impuestos-fechas-compensaciones` | When the SII refund arrives, what's offset | owner |
| `operacion-renta-f22-checklist` | F22 checklist: review, send, rectify | owner |

**Existing calculators (same silo):**
- `/calculadoras/impuesto-segunda-categoria/`
- `/calculadoras/operacion-renta/`

**Proposed new article:**
- **Slug:** `rentas-mixtas-sueldo-honorarios`
- **Topic:** How to declare when you have *both* a salary (renta del trabajo dependiente) and income from *boletas de honorarios* (renta del trabajo independiente) — specifically: which form, who must declare (no proposal), how the second-category tax retention on salaries and the PPM on honorarios are reconciled, and what drives a refund vs. extra payment.
- **Search intent:** "sueldo y boletas operación renta" / "rentas mixtas declaración impuestos chile" / "tengo sueldo y boletas cuánto impuesto pago"

---

## Frontmatter Schema (critical constraints)

```yaml
title: "..."                            # H1 — target keyword near start
description: "..."                      # 140–160 chars, no keyword stuffing
slug: rentas-mixtas-sueldo-honorarios
author: "Equipo Monedario"
pubDate: 2026-04-XX T12:00:00Z          # today's date at 12:00
updatedDate: 2026-04-XX T12:00:00Z      # same as pubDate on first publish
tags:
  - impuestos
  - rentas-mixtas
  - honorarios
  - operacion-renta
  - sii
category: impuestos                     # MUST be this string
cluster: impuestos-personas             # MUST be this string
topicRole: owner
canonicalTopic: rentas-mixtas           # new canonical topic
lang: es-CL
featured: false
draft: false
heroImage: /images/hero/rentas-mixtas-sueldo-honorarios.avif
articleLead:
  answer: "..."                         # 1–2 sentences: the direct, concrete answer
  calculatorHref: "/calculadoras/operacion-renta/"
  calculatorLabel: "Simular resultado Operación Renta"
  nextStepHref: "/posts/operacion-renta-f22-checklist/"
  nextStepLabel: "Ir al checklist F22"
  validAsOf: 2026-04-XX                 # UNQUOTED date — NOT "2026-04-XX" (would fail Zod z.date())
  officialSources:
    - label: "SII — Impuesto de Segunda Categoría"
      href: "https://www.sii.cl/..."    # verify real URL
    - label: "SII — Operación Renta 2026"
      href: "https://www.sii.cl/..."
  covers:
    - "..."
    - "..."
  limits:
    - "No sustituye declaración real ante SII."
    - "No reemplaza asesoría tributaria."
faqs:
  - q: "¿Tengo que declarar si tengo sueldo y boletas?"
    a: "Sí, siempre. La propuesta del SII no incluye automáticamente las boletas..."
  - q: "¿Qué pasa con el impuesto de segunda categoría que ya me retuvieron?"
    a: "..."
  - q: "¿Cómo se calcula si me corresponde pagar más o recuperar?"
    a: "..."
```

**CRITICAL — `validAsOf` must be an unquoted YAML date.** Using `"2026-04-XX"` (with quotes) causes a runtime `InvalidContentEntryDataError` because Zod parses `z.date()` from YAML native date, not from a string.

---

## YMYL Editorial Standards (`docs/editorial/NORMA_YMYL.md`)

All MUST criteria are blocking for publication:

1. **Respuesta Ancla in ≤2 screens** — The query answer (rule + number) must appear in the first useful section. Pattern:
   > **Respuesta rápida (regla general):** {regla concreta}.
   > **Excepción(es):** {lista breve}.
   > **Vigencia:** {fecha}.
   > **Fuente(s):** {link(s) oficial(es)}.
2. **Declarative rule first** — No "depende..." without listing what it depends on; no meta-process preambles before the rule.
3. **Explicit vigencia** — Every rule includes "vigente a 2026-XX-XX" or equivalent.
4. **Official sources** — At least 1 official source per critical YMYL rule (SII, SUSESO, BCN, ChileAtiende, CMF, SPensiones).
5. **Exceptions listed** — Common exceptions or edge cases must be enumerated.
6. **No reform confusion** — If discussing law changes, separate "aprobado", "entra en vigencia", "se implementa".
7. **Label synthesized content** — Tables/summaries derived from legal articles must be marked `"resumen orientativo"`.
8. **Internal coherence** — No contradictions between sections, FAQs, and summaries.
9. **Valid frontmatter + freshness signals** — `updatedDate` matches the last substantive review.

---

## Editorial Pipeline (mandatory for YMYL)

Per `context/EDITORIAL_AI_PIPELINE.md` + AGENTS.md Rule 2.8/2.9:

**Required artifact set** at `artifacts/editorial/rentas-mixtas-sueldo-honorarios/<run-id>/`:
1. `01-brief.yaml`
2. `02-dossier.md` — sources, legal references, key numbers
3. `03-outline.md`
4. `04-draft.md`
5. `05-math-audit.md` — mandatory (`requires_calculation=true`)
6. `06-compliance.md` — mandatory (`regulatory_sensitivity=alta`)
7. `07-publish-packet.md` — separation-of-duties proof + final gate

**Scaffold helper:**
```bash
pnpm run scaffold:editorial-artifacts -- --slug rentas-mixtas-sueldo-honorarios
```

**Separation of duties rule:** The DraftAgent role cannot be the same as MathAuditAgent or ComplianceAgent. Record distinct role identities in the publish packet.

---

## Intra-silo linking (required)

Add cross-links in the new article to:
- `/posts/boleta-honorarios-2026-retencion-cobertura/` — for the 15.25% retention section
- `/posts/operacion-renta-f22-checklist/` — for the F22 filing section
- `/posts/devolucion-impuestos-fechas-compensaciones/` — when discussing refund timing
- `/calculadoras/operacion-renta/` — as the main action CTA
- `/calculadoras/impuesto-segunda-categoria/` — when explaining how 2nd category tax works

Also add a return cross-link phrase in `operacion-renta-f22-checklist.md` if possible (the article already mentions "Trabajador con boletas de honorarios además del sueldo" — could link to the new article from that row in the table). **Declare this as in-scope if you add it.**

---

## Hero Image Pipeline (AGENTS.md Rule 2.10 — 8-step manual workflow)

After the article file is created:

```bash
# Step 1: Update manifest
node scripts/hero-images/scan-articles.mjs

# Step 2: Generate prompts
node scripts/hero-images/build-prompts.mjs
```

**Step 3:** Inspect the new entry in `scripts/hero-images/prompts.json` for slug `rentas-mixtas-sueldo-honorarios`:
- Verify `sceneId`, `palette.hex`, and `prompt` are semantically correct for the topic (taxes, mixed income, salary + invoice documents)
- Good palette: tax-neutral tones, document/form imagery

**Step 4:** If the auto-selected scene is wrong (e.g., matched "empleados" instead of "impuestos/documentos"), add a `SLUG_OVERRIDES` entry in `scripts/hero-images/prompt-plan.mjs`:
```js
"rentas-mixtas-sueldo-honorarios": {
  id: "impuestos", // or closest scene id — check RULES array for valid ids
  template: "A",
  recipeId: "...",  // check available recipes in prompt-plan.mjs
  colorKey: "Impuestos / Formularios / Renta",
  readerSituation: "Persona con sueldo y boletas que necesita entender su declaración anual...",
  toneClass: "neutral",
  overrideEvidence: ["slug override: mixed income tax declaration article"],
  overrideKeywords: ["impuesto", "renta", "formulario"],
},
```
Then re-run `node scripts/hero-images/build-prompts.mjs`.

**Step 5–6:** Use the `prompt` field from `prompts.json` in the AI image tool of choice to manually generate the hero image. Convert to `.avif` (max 80 KB, 1536×1024) and place at:
```
public/images/hero/rentas-mixtas-sueldo-honorarios.avif
```

**Step 7:** Set entry in `scripts/hero-images/status.json`:
```json
"rentas-mixtas-sueldo-honorarios": { "state": "done" }
```

**Step 8:** Verify gate passes:
```bash
pnpm run check:hero-images
```

---

## CI Gates to Pass Before Merge

```bash
pnpm run check:frontmatter
pnpm run check:hero-images
pnpm run check:hero-prompts
pnpm run check:editorial-structure
pnpm run check:dialect
pnpm run check:images
pnpm run astro check
```

Full build (final validation):
```bash
pnpm run build
```

---

## Content Outline (suggested — agent may refine)

### H1 title suggestion
"Rentas mixtas en Chile: cómo declarar cuando tienes sueldo y boletas de honorarios"

### Intro (respuesta ancla)
Open with the concrete answer: who must always declare (no proposal option), what determines the final result (Global Complementario vs. what was retained via 2nd category + PPM), vigencia.

### H2: ¿Qué son las rentas mixtas y por qué no hay propuesta del SII?
- Definition: dependent (sueldo) + independent (boletas) income in same fiscal year
- Why the SII cannot pre-fill: each payer retains independently; the total base is only calculable at year-end
- Table: scenarios (pure sueldo, only boletas, both) → action required

### H2: Cómo se calcula el resultado (pagas más o recuperas)
- Global Complementario tramos 2026 (SII source)
- How 2nd category tax retained from salary + PPM from boletas are credited against the final tax
- When you owe more: high honorarios income that pushed you to a higher bracket
- When you recover: excessive monthly retention on salary (e.g., 2 employers simultaneously)
- **Respuesta rápida** callout with the formula logic
- Link to `/calculadoras/operacion-renta/`

### H2: Paso a paso para declarar (checklist)
- What you need: certificado de remuneraciones, boletas emitidas, PPM pagado
- Where: sii.cl → Servicios Online → Renta → Declarar
- Key fields in F22 for mixed income
- Link to `/posts/operacion-renta-f22-checklist/`

### H2: Casos frecuentes y excepciones
- Two simultaneous employers + honorarios (cumulative bracket effect)
- Low honorarios amount: may still be below annual threshold → no additional tax
- APV Régimen B: reduces taxable base, can offset mixed income bracket push
- Link to `/posts/boleta-honorarios-2026-retencion-cobertura/` for PPM explanation

### H2: Cuándo esperar devolución vs. cuándo pagar
- Timeline for refund (if eligible): link to `/posts/devolucion-impuestos-fechas-compensaciones/`
- Payment deadline for those who owe

### FAQs (frontmatter `faqs` array — 3–5 Q&A pairs)

---

## Key Numbers to Verify (ResearchAgent task)

Before writing, confirm from SII:
- Global Complementario 2026 tramos (rates and UTA thresholds) — SII.cl oficial
- PPM rate for boletas 2026 (currently 0.75% on honorarios bruto per boleta) 
- Retention rate 2026: 15.25% (established by Ley N°21.133)
- Maximum boleta income exempt from Global Complementario (verify threshold)
- All numbers must be sourced in `02-dossier.md` before drafting

---

## Forbidden Patterns

- Do NOT derive public URLs from `post.id` (invariant `URL.PUBLIC.NO_POST_ID`)
- Do NOT use quoted strings for YAML dates: `validAsOf: "2026-04-XX"` FAILS; use `validAsOf: 2026-04-XX`
- Do NOT use `"draft": true` (article must be published when merged)
- Do NOT write "Depende..." as an anchor answer without listing what it depends on
- Do NOT merge without `05-math-audit.md` and `06-compliance.md` completed (both mandatory for this topic)
- Do NOT auto-generate hero image via API; the `state: done` in status.json must only be set after the `.avif` file exists at the correct path

---

## Reference Files to Read First

1. `AGENTS.md` — full execution protocol
2. `context/INVARIANTS.md` — invariant registry
3. `context/CONTRACTS.md` — contract registry
4. `docs/editorial/NORMA_YMYL.md` — editorial quality norms
5. `context/EDITORIAL_AI_PIPELINE.md` — artifact pipeline
6. `src/content.config.ts` — Zod frontmatter schema (especially `articleLead`, `faqs`, `validAsOf`)
7. `src/data/blog/boleta-honorarios-2026-retencion-cobertura.md` — reference frontmatter pattern
8. `src/data/blog/operacion-renta-f22-checklist.md` — reference article format + cross-link target
9. `scripts/hero-images/prompt-plan.mjs` — RULES + SLUG_OVERRIDES for hero prompt

---
