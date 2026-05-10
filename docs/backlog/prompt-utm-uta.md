# Prompt – New Conversation: Artículo "UTM en Chile"

## Estado
Listo para usar. Pega como mensaje inicial de una nueva conversación con el agente.

**Backlog origin:** `docs/backlog/artifacts/inventario-por-silo-2026-04-08.md` → Silo 8 UF/Costo de Vida PARCIAL, ítem #3.
**Silos que completa:** UF/Costo de Vida llega a 4 artículos ✅ (umbral ≥4 alcanzado en artículos; falta 1 glosario → tarea separada).

---

## Prompt completo

---

## Task Brief

- **Objective:** Create a new article to complete the *UF/Costo de Vida* silo (currently 3 articles, minimum required: 4). The article covers **la UTM (Unidad Tributaria Mensual) and UTA (Unidad Tributaria Anual) in Chile**: what they are, how they reajust monthly by IPC, and their practical uses (tax brackets, traffic fines, state proceedings, APV limits).
- **In scope:**
  - `src/config/editorial-topic-policy.mjs` — register `utm-uta-unidades-tributarias` in `uf-costo-de-vida` **(MUST do before creating the article file or check:frontmatter will FAIL)**
  - `src/data/blog/utm-chile-que-es-como-funciona.md` (new file)
  - `artifacts/editorial/utm-chile-que-es-como-funciona/<run-id>/` (full editorial pipeline artifacts)
  - `scripts/hero-images/manifest.json`, `prompts.json`, `status.json` (pipeline updates after scan)
  - `scripts/hero-images/prompt-plan.mjs` (SLUG_OVERRIDES entry if auto-selected scene is semantically wrong)
  - Return cross-links in: `src/data/blog/que-es-la-uf.md`, `src/data/blog/que-es-el-ipc-chile-como-se-calcula.md`, `src/data/glossary/utm.md`, `src/data/glossary/uta.md`
- **Out of scope:** `src/domain/**`, `src/application/**`, routing changes, any existing article rewrites beyond targeted cross-link additions. Do NOT create `inflacion.md` glossary entry (separate follow-up task). Do NOT touch calculators or page layouts.
- **Invariants/Contracts to preserve:** `URL.PUBLIC.NO_POST_ID`, `FRONTMATTER.VALID`, `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`, `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS`, `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`, hero image publication invariant
- **Required gates:** `pnpm run check:frontmatter`, `pnpm run check:hero-images`, `pnpm run check:hero-prompts`, `pnpm run check:editorial-structure`, `pnpm run check:dialect`, `pnpm run check:images`
- **Deliverable:** Mergeable article file + full editorial artifact set + topic policy registered + hero prompt registered + hero image placed at `public/images/hero/utm-chile-que-es-como-funciona.avif` + all gates passing

---

## Authority Check

`1) docs/AI_ENGINEERING_CONSTITUTION.md → 2) AGENTS.md → 3) context/*.md → 4) source code`

---

## Project Context (Monedario.cl)

- **Site:** Monedario.cl — Chilean personal finance media site. YMYL domain.
- **Tech stack:** Astro 6.1.4, Zod content schemas, pnpm, TypeScript, MDX-adjacent markdown blog
- **Content schema:** `src/content.config.ts` — blog collection with mandatory Zod validation
- **Workspace root:** `/home/carlos/VS_Code_Projects/Monedario`
- **Scaffold helper:** `pnpm run scaffold:editorial-artifacts -- --slug <slug>` — creates artifact folder structure. Article file MUST exist before running it.

---

## ⚠️ CRITICAL FIRST STEP: Topic Registry (Hardened Cluster)

`uf-costo-de-vida` is a **HARDENED_OWNERSHIP_CLUSTER**. `check:frontmatter` will **FAIL** if the article's `canonicalTopic` is not registered in `CANONICAL_TOPIC_REGISTRY` in `src/config/editorial-topic-policy.mjs` before the article is validated.

**Do this BEFORE creating the article file:**

Open `src/config/editorial-topic-policy.mjs` and add to the `"uf-costo-de-vida"` entry:

```js
"utm-uta-unidades-tributarias": {
  ownerSlug: "utm-chile-que-es-como-funciona",
  intentLabel: "entender UTM y UTA como unidades tributarias reajustables en Chile",
},
```

Current state of `"uf-costo-de-vida"` in `CANONICAL_TOPIC_REGISTRY` (three existing entries, add a fourth):

```js
"uf-costo-de-vida": {
  "uf-reajustes-costo-de-vida": {
    ownerSlug: "que-es-la-uf",
    intentLabel: "entender UF y reajustes de costo de vida",
  },
  "ipc-inflacion-costo-de-vida": {
    ownerSlug: "que-es-el-ipc-chile-como-se-calcula",
    intentLabel: "entender IPC e inflacion de costo de vida",
  },
  "reajuste-arriendo-contrato-uf-ipc": {
    ownerSlug: "reajuste-arriendo-uf-ipc-chile",
    intentLabel: "interpretar reajuste de arriendo en UF o IPC",
  },
  // ADD BELOW ↓
  "utm-uta-unidades-tributarias": {
    ownerSlug: "utm-chile-que-es-como-funciona",
    intentLabel: "entender UTM y UTA como unidades tributarias reajustables en Chile",
  },
},
```

---

## Silo: UF / Costo de Vida

**Status:** PARCIAL → will become COMPLETO (articles) after this task. Glosario still needs 1 entry as a separate follow-up task.

**Existing articles in silo (`cluster: uf-costo-de-vida`, `category: general`):**

| Slug | Title (summary) | topicRole |
|------|-----------------|-----------|
| `que-es-la-uf` | What UF is, how it updates daily, how it affects rent/mortgages | owner |
| `que-es-el-ipc-chile-como-se-calcula` | What IPC is, how INE calculates it, what it adjusts | owner |
| `reajuste-arriendo-uf-ipc-chile` | How to calculate rent reajuste using UF or IPC | owner |

**Existing content also relevant to this silo (glossary):**
- `src/data/glossary/utm.md` — term `"Unidad Tributaria Mensual (UTM)"`, relatedTerms: `["ipc", "uf", "sii"]` — no link to blog article yet
- `src/data/glossary/uta.md` — term `"Unidad Tributaria Anual (UTA)"`, relatedTerms: `["utm", "operacion-renta", "global-complementario"]` — links to operacion-renta hub
- `src/data/glossary/ipc.md` — term `"Índice de Precios al Consumidor (IPC)"`, relatedTerms: `["uf", "utm"]`

**Proposed new article:**
- **Slug:** `utm-chile-que-es-como-funciona`
- **Topic:** What the UTM (Unidad Tributaria Mensual) and UTA (Unidad Tributaria Anual) are, how they reajust monthly by IPC, their practical uses in Chilean daily life (tax brackets, traffic fines, APV limits, state proceedings) and how they differ from UF.
- **Primary search intent:** "qué es la UTM Chile" / "UTM valor 2026" / "para qué sirve la UTM" / "diferencia UTM UTA" / "diferencia UTM UF"

---

## Frontmatter Schema (critical constraints)

```yaml
title: "UTM en Chile: qué es, cómo funciona y para qué sirve"
description: "..."              # 140–160 chars, no keyword stuffing
slug: utm-chile-que-es-como-funciona
author: "Equipo Monedario"
pubDate: 2026-XX-XXT12:00:00Z  # fill with today's date at 12:00
updatedDate: 2026-XX-XXT12:00:00Z  # same as pubDate on first publish
tags:
  - utm
  - uta
  - uf
  - ipc
  - inflacion
  - impuestos
category: general              # MUST be this — matches all existing uf-costo-de-vida articles
cluster: uf-costo-de-vida      # MUST be this string
topicRole: owner
canonicalTopic: utm-uta-unidades-tributarias   # MUST be registered first (see CRITICAL FIRST STEP above)
lang: es-CL
featured: false
draft: false
heroImage: /images/hero/utm-chile-que-es-como-funciona.avif
articleLead:
  answer: "..."                # 1–2 sentences: concrete answer — what UTM is, when it changes monthly
  calculatorHref: "/calculadoras/impuesto-segunda-categoria/"
  calculatorLabel: "Calcular impuesto de segunda categoría"
  nextStepHref: "/posts/que-es-la-uf/"
  nextStepLabel: "Ver cómo funciona la UF"
  validAsOf: 2026-XX-XX        # UNQUOTED YAML date — NOT "2026-XX-XX" (quoted string fails Zod z.date())
  officialSources:
    - label: "SII — Unidad Tributaria Mensual"
      href: "https://www.sii.cl/..."     # verify real SII URL at time of writing
    - label: "SII — Unidad Tributaria Anual"
      href: "https://www.sii.cl/..."
  covers:
    - "Qué es la UTM y la UTA"
    - "Cómo se reajusta la UTM cada mes"
    - "Usos prácticos: multas, impuestos, trámites"
    - "Diferencia UTM vs UF"
  limits:
    - "Los valores exactos de UTM cambian cada mes — verifica en SII.cl antes de aplicarlos."
    - "No sustituye asesoría tributaria para casos específicos."
faqs:
  - q: "¿Cuánto vale la UTM hoy?"
    a: "El valor de la UTM cambia mensualmente. Puedes ver el valor vigente en SII.cl. El SII lo publica el primer día hábil de cada mes."
  - q: "¿Cuál es la diferencia entre UTM y UTA?"
    a: "La UTM es mensual; la UTA equivale a 12 veces la UTM del mes de diciembre y se usa para calcular los tramos anuales del Impuesto Global Complementario."
  - q: "¿Cuál es la diferencia entre UTM y UF?"
    a: "La UF se actualiza diariamente y se usa en hipotecas, arriendos y créditos del sector privado. La UTM cambia mensualmente y es el estándar para obligaciones con el Estado: multas, impuestos, trámites."
  - q: "¿Las multas de tránsito se cobran en UTM?"
    a: "Sí. La Ley de Tránsito (N°18.290) expresa muchas sanciones en UTM. El monto en pesos se calcula multiplicando las UTM por el valor vigente al momento del pago."
  - q: "¿Cómo afecta el IPC a la UTM?"
    a: "La UTM se reajusta cada mes según la variación del IPC del mes anterior. Si el IPC fue positivo (inflación), la UTM sube; si fue negativo (deflación), puede bajar."
```

**CRITICAL — `validAsOf` must be an unquoted YAML date.** Using `"2026-XX-XX"` (with quotes) causes a runtime `InvalidContentEntryDataError` because Zod parses `z.date()` from YAML native date, not a string.

**NOTE — `category: general` is correct** for this cluster. The `allowsGeneralCategoryInCluster` function in `editorial-topic-policy.mjs` explicitly allows it for `topicRole: owner` in `uf-costo-de-vida`. All three existing articles in this silo use `category: general`.

---

## YMYL Editorial Standards (`docs/editorial/NORMA_YMYL.md`)

**YMYL risk level: medium.** Article describes a fiscal unit (UTM/UTA). Requires accurate current values and official SII sourcing. No personalized financial advice, but any wrong value (wrong UTA bracket threshold, wrong UTM value) could mislead readers on their tax obligations.

All MUST criteria are blocking for publication:

1. **Respuesta Ancla in ≤2 screens** — The query answer must appear in the first useful section. Pattern:
   > **Respuesta rápida:** {regla concreta — what UTM is, how often it changes}.
   > **Valor vigente:** {current month's value — source at SII.cl, note it changes monthly}.
   > **Vigencia:** {fecha del dato}.
   > **Fuente:** {SII link}.
2. **Declarative rule first** — No "depende..." without listing what it depends on.
3. **Explicit vigencia** — Every stated value includes "vigente a 2026-XX-XX" or equivalent.
4. **Official sources** — At least 1 official SII source for all numerical values.
5. **Exceptions listed** — Any exception to general UTM rules must be explicitly stated.
6. **No reform confusion** — If mentioning law changes, distinguish enacted vs. pending.
7. **Label synthesized content** — Any table derived from official SII data must note "datos orientativos — verifica en SII.cl".
8. **Internal coherence** — No contradictions between FAQs, tables, and body text values.
9. **Valid frontmatter + freshness signals** — `updatedDate` matches the writing date.

---

## Editorial Pipeline (mandatory for YMYL)

Per `context/EDITORIAL_AI_PIPELINE.md` + AGENTS.md Rule 2.8/2.9:

**Required artifact set** at `artifacts/editorial/utm-chile-que-es-como-funciona/<run-id>/`:
1. `01-brief.yaml`
2. `02-dossier.md` — sources, legal references, SII URLs, key numbers (current UTM value, UTA = 12 × UTM December, tax bracket thresholds in UTA, traffic fine scale in UTM)
3. `03-outline.md`
4. `04-draft.md`
5. `05-math-audit.md` — verify: UTA = 12 × UTM December formula; any example bracket-to-peso conversion; cross-check against SII official table
6. `06-compliance.md` — verify: correct citation of SII sources; no outdated bracket values; law citations (Código Tributario Art. 8, Ley N°18.290) are accurate
7. `07-publish-packet.md` — separation-of-duties proof + final gate checklist + HumanEditor sign-off field

**Scaffold helper:**
```bash
pnpm run scaffold:editorial-artifacts -- --slug utm-chile-que-es-como-funciona
```
**Important:** The article file must exist BEFORE running the scaffold command. Run it after creating `utm-chile-que-es-como-funciona.md`.

**Separation of duties rule:** DraftAgent ≠ MathAuditAgent ≠ ComplianceAgent. Record distinct role identities in `07-publish-packet.md`.

---

## Intra-silo Linking (required)

### Links FROM the new article to existing content:
- `/glosario/utm/` — when referencing the formal definition of UTM
- `/glosario/uta/` — when explaining UTA in the UTA section
- `/posts/que-es-la-uf/` — in the UTM vs UF comparison section
- `/posts/que-es-el-ipc-chile-como-se-calcula/` — when explaining that UTM reajusts monthly by IPC
- `/calculadoras/operacion-renta/` — when discussing UTA tramos of Impuesto Global Complementario
- `/calculadoras/impuesto-segunda-categoria/` — when explaining how the second-category tax (sueldos) uses UTM-based brackets

### Return cross-links to ADD in existing files:

**1. `src/data/blog/que-es-la-uf.md`**
- Section: `## La UF y el IPC no son lo mismo` (around line 143 in the file)
- Add at the END of that section:
  > "Si también quieres entender la UTM — la otra unidad que se reajusta por IPC pero para obligaciones con el Estado (multas, trámites, tramos de impuesto) — revisa [UTM en Chile: qué es y para qué sirve](/posts/utm-chile-que-es-como-funciona/)."
- Read the actual file before inserting to confirm the exact surrounding text and match whitespace/formatting.

**2. `src/data/glossary/utm.md`**
- At the very end of the file (after the last paragraph), add:
  > "**Artículo relacionado:** [UTM en Chile: qué es, cómo funciona y para qué sirve](/posts/utm-chile-que-es-como-funciona/) →"
- Read the actual file before inserting.

**3. `src/data/glossary/uta.md`**
- The file already has a "Lee la guía completa" line pointing to the operacion-renta hub. Add an ADDITIONAL line:
  > "**Ver también:** [UTM en Chile: qué es y para qué sirve](/posts/utm-chile-que-es-como-funciona/) — incluye UTM, UTA y diferencias con la UF."
- Read the actual file before inserting. Do not remove the existing operacion-renta link.

**4. `src/data/blog/que-es-el-ipc-chile-como-se-calcula.md`**
- Section: `## Qué ajusta el IPC en tu vida cotidiana` or just before the `## Fuentes` section at the end
- Add a mention that UTM also reajusts monthly by IPC, with a link:
  > "La UTM (Unidad Tributaria Mensual) también usa el IPC mensual como base de reajuste — si recibes o pagas multas, realizas trámites estatales, o calculas tramos de impuesto a la renta, revisa [UTM en Chile: qué es y para qué sirve](/posts/utm-chile-que-es-como-funciona/)."
- Read the actual file before inserting.

---

## Hero Image Pipeline (AGENTS.md Rule 2.10 — 8-step manual workflow)

After the article file AND topic policy edit are done:

```bash
# Step 1: Update manifest
node scripts/hero-images/scan-articles.mjs

# Step 2: Generate prompts
node scripts/hero-images/build-prompts.mjs
```

**Step 3:** Inspect the new entry in `scripts/hero-images/prompts.json` for slug `utm-chile-que-es-como-funciona`:
- Keywords like "utm", "tributaria", "impuesto", "fiscal" will likely match a fiscal/tax scene
- Appropriate imagery: official document + calendar (monthly update) + fiscal forms
- Verify `sceneId`, `palette.hex`, and `prompt` are semantically coherent for the topic (UTM = monthly fiscal reference unit, state obligations, tax brackets)

**Step 4:** If the auto-selected scene doesn't fit (e.g., wrong palette, generic scene unrelated to fiscal/state), add a `SLUG_OVERRIDES` entry in `scripts/hero-images/prompt-plan.mjs`. Check the `RULES` array first for the available scene IDs and valid `recipeId` values, then add:

```js
"utm-chile-que-es-como-funciona": {
  id: "impuestos",   // or the correct scene id — verify in RULES array
  template: "A",
  recipeId: "...",   // verify in prompt-plan.mjs
  colorKey: "Impuestos / Formularios / Renta",
  readerSituation: "Persona que necesita entender la UTM mensual: qué es, su valor, cómo afecta multas e impuestos",
  toneClass: "neutral",
  overrideEvidence: ["UTM is a fiscal/tributary unit — tax/fiscal scene is semantically appropriate"],
  overrideKeywords: ["utm", "tributaria", "fiscal", "mensual", "impuesto"],
},
```
Then re-run `node scripts/hero-images/build-prompts.mjs`.

**Step 5–6:** Use the `prompt` field from `prompts.json` for slug `utm-chile-que-es-como-funciona` in the AI image tool of choice to manually generate the hero image. Convert the output to `.avif` (max 80 KB, 1536×1024) and place at:
```
public/images/hero/utm-chile-que-es-como-funciona.avif
```

**Step 7:** Set the entry in `scripts/hero-images/status.json`:
```json
"utm-chile-que-es-como-funciona": { "state": "done" }
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
"UTM en Chile: qué es, cómo funciona y para qué sirve"

### Intro (respuesta ancla)
Open with a concrete, direct answer: what is UTM, when does it change (first business day of each month), what governs it (reajuste by prior month's IPC), and where to check today's value (SII.cl). Include a "Respuesta rápida" callout with current value + SII source link. Note explicitly that the value changes monthly and readers should verify at SII.

### H2: ¿Qué es la UTM?
- Definition: Unidad Tributaria Mensual — a monthly reajustable unit of account for state obligations in Chile
- Not a currency — a reference basket unit, similar in concept to UF but for fiscal/state use
- Governed by the Código Tributario (DL 830/1974, Art. 8 — verify exact citation)
- Reajusts monthly by the prior month's IPC variation: if IPC was +0.4%, UTM rises ~0.4%
- Cross-link to `/posts/que-es-el-ipc-chile-como-se-calcula/` when explaining the IPC connection

### H2: UTM vs UTA — dos unidades de la misma familia
- Table: UTM (monthly, base unit) vs UTA (annual = 12 × UTM of December of that year)
- When each appears: UTM for individual transactions, monthly obligations, traffic fines; UTA for annual tax brackets (Global Complementario)
- **Respuesta rápida** callout: UTA = 12 × UTM December. Example with illustrative numbers (label as "orientativo — verifica en SII").
- Link to `/glosario/uta/` for the formal definition
- Link to `/calculadoras/operacion-renta/` when mentioning Global Complementario brackets

### H2: La UTM vs la UF — ¿cuál es la diferencia?
| Característica | UTM | UF |
|---|---|---|
| Frecuencia | Mensual | Diaria |
| Quién la define | SII (Servicio de Impuestos Internos) | Banco Central |
| Ámbito principal | Estado: multas, impuestos, trámites | Privado: hipotecas, arriendos, créditos |
| Sigue la inflación | Sí (IPC mensual) | Sí (IPC mensual, con desfase) |

- Declarative rule: both track IPC, but on different cadences and in different domains
- Cross-link to `/posts/que-es-la-uf/` for the UF explanation

### H2: Usos prácticos de la UTM en tu vida
- **Multas de tránsito y sanciones legales** — La Ley de Tránsito (N°18.290) expresa muchas sanciones en UTM. Conversion: UTM × valor vigente al pago. Example (label "orientativo").
- **Tramos del Impuesto a la Renta** — Global Complementario uses UTA brackets (= 12 UTM Dec). The exención threshold, rates, and bracket limits are all in UTA from SII. Link to `/calculadoras/operacion-renta/`.
- **APV Régimen A** — Bono estatal máximo: 6 UTM anuales. Link to `/calculadoras/impuesto-segunda-categoria/` if relevant.
- **Costos de trámites del Estado** — Aranceles judiciales, consulares, notariales, CBR — many are expressed in UTM.
- **Multas tributarias del SII** — The SII expresses late payment fines and penalties in UTM/UTA.
- Table: summary of contexts where UTM appears (label "resumen orientativo").

### H2: ¿Dónde ver el valor vigente de la UTM?
1. **SII.cl** — direct URL: https://www.sii.cl/valores_y_fechas/utm/ (verify and update at time of writing)
2. **Banco Central** — historical series via si3.bcentral.cl
- Note: the article's stated value is from the month of writing — always verify at SII before using in any real payment/calculation.

### FAQs (frontmatter `faqs` array — 5 Q&A pairs, as drafted in frontmatter above)

---

## Key Numbers to Verify Before Writing (ResearchAgent task)

Before drafting, confirm from SII.cl:
- Current UTM value for the month of writing (SII annual UTM table: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm or equivalent)
- Current UTA value (= 12 × UTM of December of the prior calendar year)
- Impuesto Global Complementario 2026 brackets in UTA (SII official current-year table)
- Impuesto Segunda Categoría 2026 brackets in UTA (SII)
- The specific legal citation for UTM: Código Tributario DL 830/1974, Art. 8 (verify it's still Art. 8)
- Traffic fine scale in UTM (Ley N°18.290 de Tránsito — verify current scale for at least 2 examples)
- All numbers must be sourced in `02-dossier.md` before drafting.

**IMPORTANT:** Because UTM changes monthly, the article must prominently remind readers to verify the current value at SII.cl rather than relying on any specific value stated in the article.

---

## Forbidden Patterns

- Do NOT derive public URLs from `post.id` (invariant `URL.PUBLIC.NO_POST_ID`)
- Do NOT use quoted strings for YAML dates: `validAsOf: "2026-04-XX"` FAILS; use unquoted `validAsOf: 2026-04-XX`
- Do NOT use `"draft": true` (article must be published when merged)
- Do NOT write "Depende..." as anchor answer without listing exhaustively what it depends on
- Do NOT merge without `05-math-audit.md` AND `06-compliance.md` completed
- Do NOT set `state: done` in `status.json` before the `.avif` file physically exists at `public/images/hero/utm-chile-que-es-como-funciona.avif`
- Do NOT skip topic policy registration — check:frontmatter will block on unregistered canonical topic for hardened clusters
- Do NOT auto-generate hero image via API

---

## Post-completion Silo State

After this article is merged, the UF/Costo de Vida silo will be:

| Dimensión | Contenido | Cuenta | Umbral | ¿Cumple? |
|-----------|-----------|--------|--------|----------|
| **Artículos** | `que-es-la-uf`, `que-es-el-ipc-chile-como-se-calcula`, `reajuste-arriendo-uf-ipc-chile`, **`utm-chile-que-es-como-funciona`** | 4 | ≥4 | ✅ |
| **Calculadoras** | `conversor-uf`, `reajuste-arriendo` | 2 | ≥1 | ✅ |
| **Glosario** | `ipc`, `uf` | 2 | ≥3 | ❌ |

**Silo status after this article:** PARCIAL on glosario only. Follow-up task: create `src/data/glossary/inflacion.md` to complete the silo.

---

## Reference Files to Read First

1. `AGENTS.md` — full execution protocol
2. `context/INVARIANTS.md` — invariant registry
3. `context/CONTRACTS.md` — contract registry
4. `docs/editorial/NORMA_YMYL.md` — editorial quality norms
5. `context/EDITORIAL_AI_PIPELINE.md` — artifact pipeline
6. `src/content.config.ts` — Zod frontmatter schema (especially `articleLead`, `faqs`, `validAsOf`)
7. `src/config/editorial-topic-policy.mjs` — confirm current `uf-costo-de-vida` state before adding entry
8. `src/data/blog/que-es-la-uf.md` — reference frontmatter pattern for this cluster + cross-link target
9. `src/data/blog/que-es-el-ipc-chile-como-se-calcula.md` — reference article format + cross-link target
10. `scripts/hero-images/prompt-plan.mjs` — RULES array + SLUG_OVERRIDES for hero prompt

---
