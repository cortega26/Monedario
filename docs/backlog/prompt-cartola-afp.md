# Prompt – New Conversation: Artículo "Cómo leer la cartola AFP"

## Estado
Listo para usar. Pega todo lo que está debajo de la línea `---` como mensaje inicial de una nueva conversación con el agente.

---

## Task Brief

- **Objective:** Create a new article for the *Pensiones y AFP* silo (currently 4 articles, adding a 5th). The article covers **how to read and interpret a Chilean AFP quarterly statement (cartola trimestral)**: what each section and field means, what to verify for errors, and what to do if something is wrong. Ticket: MON-211.
- **In scope:**
  - `src/data/blog/como-leer-cartola-afp-chile.md` (new file)
  - `src/config/editorial-topic-policy.mjs` — **must register new canonicalTopic `cartola-afp` in the `pensiones-afp` cluster** before `check:frontmatter` will pass (hardened cluster requirement)
  - `artifacts/editorial/como-leer-cartola-afp-chile/<run-id>/` (editorial pipeline artifacts)
  - `scripts/hero-images/manifest.json`, `prompts.json`, `status.json` (pipeline updates after scan)
  - `scripts/hero-images/prompt-plan.mjs` (SLUG_OVERRIDES if needed)
  - `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md` — add one targeted cross-link sentence (return link to new article)
  - `src/data/blog/fondos-afp-a-b-c-d-e.md` — add one targeted cross-link sentence
  - `src/data/glossary/afp.md` — add one targeted cross-link sentence
- **Out of scope:** `src/domain/**`, `src/application/**`, routing changes, any article rewrites beyond the declared return cross-link sentences. Do NOT touch non-AFP silo articles.
- **Invariants/Contracts to preserve:** `URL.PUBLIC.NO_POST_ID`, `FRONTMATTER.VALID`, `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`, `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS`, `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`, hero image publication invariant
- **Required gates:** `pnpm run check:frontmatter`, `pnpm run check:hero-images`, `pnpm run check:hero-prompts`, `pnpm run check:editorial-structure`, `pnpm run check:dialect`, `pnpm run check:images`, `pnpm run astro check`, `pnpm run build`
- **Deliverable:** Mergeable article file + canonical topic registered + full editorial artifact set + hero prompt registered + hero image placed at `public/images/hero/como-leer-cartola-afp-chile.avif` + all gates passing

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

## Silo: Pensiones y AFP (`cluster: pensiones-afp`) — HARDENED CLUSTER

**Current articles in silo:**

| Slug | Title | canonicalTopic |
|------|-------|----------------|
| `fondos-afp-a-b-c-d-e` | Fondos AFP A, B, C, D y E: diferencias, riesgo y cuál te conviene | `elegir-fondos-afp` |
| `como-cambiarse-de-afp` | ¿Puedo cambiarme de AFP? Cómo hacerlo y qué considerar en 2026 | `cambio-afp` |
| `que-es-la-cuenta-2-afp` | Cuenta 2 de la AFP: ahorro flexible, retiros e impuestos | `cuenta2-afp` |
| `reforma-previsional-2025-que-cambia-y-como-te-afecta` | Reforma previsional 2025: qué cambia y cómo te afecta | `reforma-previsional-cambios` |

**Calculators:** `/calculadoras/comisiones-afp/`, `/calculadoras/simulador-jubilacion/`

**New article:**
- **Slug:** `como-leer-cartola-afp-chile`
- **canonicalTopic (new):** `cartola-afp`
- **Topic:** How a Chilean worker reads and interprets their AFP quarterly statement — each section, each field, what to verify, how to spot errors, how to complain.
- **Search intent:** "cómo leer cartola AFP" / "cartola AFP qué significa cada campo" / "cómo reclamar error en cartola AFP"

---

## CRITICAL: Hardened Cluster — Register canonicalTopic First

**`pensiones-afp` is in `HARDENED_OWNERSHIP_CLUSTERS`** (see `src/config/editorial-topic-policy.mjs`).

`check:frontmatter` will FAIL with:
> `Unregistered canonicalTopic "cartola-afp" for hardened cluster "pensiones-afp". Add it to the central registry before publishing.`

**You MUST add this entry** to `CANONICAL_TOPIC_REGISTRY["pensiones-afp"]` in `src/config/editorial-topic-policy.mjs` before running the frontmatter check. The exact current state of that registry block and the exact edit required are shown in the **"CANONICAL_TOPIC_REGISTRY — Current `pensiones-afp` Block"** section below.

Do this as one of the first steps, alongside creating the article file.

---

## Frontmatter Schema (critical constraints)

The complete Zod constraints and a reference frontmatter are provided in the **"Frontmatter Schema — Zod Constraints"** and **"Reference Frontmatter"** sections below. Summary for the new article:

```yaml
title: "Cómo leer la cartola AFP: qué significa cada campo y cómo detectar errores"  # 55 chars — adjust if needed
description: "Guía completa para leer la cartola AFP trimestral: qué muestra cada sección, qué errores buscar y cómo reclamar ante la Superintendencia de Pensiones."  # 163 chars
slug: como-leer-cartola-afp-chile
author: "Equipo Monedario"
pubDate: 2026-04-09T12:00:00Z
updatedDate: 2026-04-09T12:00:00Z
tags:
  - afp
  - pensiones
  - cartola
  - previsión
category: prevision                      # MUST be this for pensiones-afp cluster
cluster: pensiones-afp                   # MUST be this string
topicRole: owner
canonicalTopic: cartola-afp             # MUST match what you register in the policy file
lang: es-CL
featured: false
draft: false
heroImage: /images/hero/como-leer-cartola-afp-chile.avif
articleLead:
  answer: "..."                          # 1–2 sentences: the direct, concrete answer
  calculatorHref: "/calculadoras/comisiones-afp/"
  calculatorLabel: "Comparar comisiones AFP"
  nextStepHref: "/posts/fondos-afp-a-b-c-d-e/"
  nextStepLabel: "Entiende los fondos que aparecen en tu cartola"
  validAsOf: 2026-04-09                  # UNQUOTED — NOT "2026-04-09" (z.date() fails on strings)
  officialSources:
    - label: "Superintendencia de Pensiones — Cartola trimestral"
      href: "https://www.spensiones.cl/..."    # replace with verified URL from research
  covers:
    - "Qué contiene cada sección de la cartola AFP."
    - "Cómo detectar errores en cotizaciones o comisiones."
    - "Cómo reclamar ante la AFP y ante la SP si corresponde."
  limits:
    - "No sustituye asesoría previsional personalizada."
    - "No cubre retiros extraordinarios ni productos de rentas vitalicias."
faqs:
  - q: "¿Con qué frecuencia llega la cartola AFP?"
    a: "..."
  - q: "¿Qué sección muestra cuánto gané o perdí?"
    a: "..."
  - q: "¿Por qué la rentabilidad de mi cartola es distinta a la del fondo?"
    a: "..."
  - q: "¿Qué hago si falta un mes de cotización en la cartola?"
    a: "..."
  - q: "¿Dónde puedo reclamar si hay un error?"
    a: "..."
```

**CRITICAL — `validAsOf` must be an unquoted YAML date.** Using `"2026-04-09"` (with quotes) causes a runtime `InvalidContentEntryDataError` because Zod parses `z.date()` from YAML native date, not from a string.

---

## YMYL Editorial Standards (`docs/editorial/NORMA_YMYL.md`)

This article has **medium YMYL sensitivity** (interpretive, not transactional — the reader reads their cartola, does not execute financial operations). However, all MUST criteria still apply:

1. **Respuesta Ancla in ≤2 screens** — The key answer (what the cartola shows, how often it arrives) must appear in the first useful section. Pattern:
   > **Respuesta rápida:** {regla concreta — ej. "La cartola AFP es trimestral, la recibes en enero, abril, julio y octubre"}.
   > **Vigencia:** {fecha}.
   > **Fuente:** {link oficial SP}.
2. **Declarative rule first** — No filler preamble before the core answer.
3. **Explicit vigencia** — Every field description includes "vigente a 2026-04-09" or equivalent caveat.
4. **Official sources** — At least 1 official SP source per structural section described.
5. **No false precision** — Do not cite specific rentabilidad percentages for any given period (this changes daily); cite the field name instead.
6. **Label synthesized content** — Tables mapping field → explanation must be marked `"resumen orientativo"`.
7. **Internal coherence** — No contradiction between body and FAQs.

---

## Editorial Pipeline (mandatory for YMYL)

Per `context/EDITORIAL_AI_PIPELINE.md` + AGENTS.md Rule 2.8/2.9:

**Required artifact set** at `artifacts/editorial/como-leer-cartola-afp-chile/<run-id>/`:
1. `01-brief.yaml`
2. `02-dossier.md` — SP sources, key circular references, field inventory
3. `03-outline.md`
4. `04-draft.md`
5. `05-math-audit.md` — mark `requires_calculation: false`; verify field descriptions are accurate (no numeric formulas to audit, but factual field labels must be verified against SP norms)
6. `06-compliance.md` — mandatory for YMYL; verify all SP field descriptions match current norma; mark `regulatory_sensitivity: media`
7. `07-publish-packet.md` — separation-of-duties proof + final gate

**Scaffold helper:**
```bash
pnpm run scaffold:editorial-artifacts -- --slug como-leer-cartola-afp-chile --cut-off-date 2026-04-09
```

**Separation of duties rule:** The DraftAgent role cannot be the same as MathAuditAgent or ComplianceAgent. Record distinct role identities in the publish packet.

---

## Content Structure (required)

### H1 title suggestion
"Cómo leer la cartola AFP: qué significa cada campo y cómo detectar errores"

### Intro (respuesta ancla — first section)
Direct answer: what the cartola is, how often it arrives (trimestral: Jan/Apr/Jul/Oct), where to find it (physical mail + online via AFP portal), vigencia note, SP source link.

### H2: Las secciones de tu cartola AFP
Describe the five standard sections present in all AFP cartolas (format standardized by Superintendencia de Pensiones):

1. **Datos del afiliado** — nombre, RUT, AFP, tipo de fondo
2. **Saldo por tipo de cuenta** — cuenta obligatoria, cuenta de ahorro voluntario (Cuenta 2), cuenta de ahorro de indemnización (si aplica)
3. **Cotizaciones del período** — meses del trimestre, renta imponible declarada, cotización obligatoria, comisión AFP cobrada, bono/aporte del empleador (si aplica)
4. **Rentabilidad** — rentabilidad del fondo en el período, rentabilidad acumulada
5. **Información de contacto y reclamo** — cómo contactar la AFP, referencia a SP

Deliver this section as a **table** with columns: `Sección | Qué muestra | Qué verificar` — labeled as `resumen orientativo`. Source each field against SP normas.

### H2: Qué verificar en tu cartola (errores más comunes)
- Mes con cotización faltante (empleador no declaró)
- Renta imponible incorrecta (debería coincidir con tu liquidación de sueldo)
- Comisión cobrada incorrecta (debería coincidir con la comisión oficial de tu AFP en ese período — link to `/calculadoras/comisiones-afp/`)
- Fondo equivocado (debería ser el que elegiste — link to `/posts/fondos-afp-a-b-c-d-e/`)
- Cotizaciones de trabajador independiente (PPM): si tienes boletas, verificar que el PPM aparezca

### H2: Cómo reclamar si hay un error
- Paso 1: contactar la AFP directamente (portal web, fono, sucursal)
- Paso 2: si no resuelve en 15 días hábiles → reclamar ante la Superintendencia de Pensiones (SP Atiende: spensiones.cl)
- Plazo para presentar reclamo ante SP: hasta 4 años desde el período en cuestión (cite norma SP)
- Link: `https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-6200.html` (verify current URL)

### H2: Preguntas frecuentes
Incorporate the 5 FAQs from frontmatter as section content plus `faqs` array in frontmatter.

---

## Research Tasks (before drafting)

Before writing content, verify from official SP sources:

1. **Cartola field names and structure** — SP defines the minimum information per cartola in its circulares to AFPs. Find current circular/norma (search `spensiones.cl/normativa` for "cartola" or "información al afiliado"). Confirm the section names and field labels in the current (2026) format.
2. **Cotización rates 2026** — confirm the obligatory 10% base + AFP commission range. Cross-reference with `cuanto-descuenta-la-afp-de-tu-sueldo.md` for consistency.
3. **SP complaint channel** — verify current URL for "SP Atiende" or the reclamos portal.
4. **Delivery frequency** — confirm trimestral (4× per year) is still the current legal requirement.

All source URLs must appear in `02-dossier.md` before drafting.

---

## Intra-silo Linking (required)

**From new article → existing:**
- `/posts/fondos-afp-a-b-c-d-e/` — when explaining the "fondo" field in the cartola
- `/posts/como-cambiarse-de-afp/` — when mentioning what to do if you want to change fund
- `/posts/cuanto-descuenta-la-afp-de-tu-sueldo/` — when explaining the cotización and comisión fields
- `/calculadoras/comisiones-afp/` — as the action CTA for verifying commission correctness
- `/glosario/afp/` — on first mention of AFP

**Return cross-links (add one sentence to each existing file):**
- `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md` — add a sentence where the article discusses the descuento AFP appearing in the *liquidación de sueldo*, linking to the new article. Example: "Puedes verificar que ese descuento apareció correctamente en tu [cartola AFP trimestral](/posts/como-leer-cartola-afp-chile/)."
- `src/data/blog/fondos-afp-a-b-c-d-e.md` — add a sentence in the section about how to know which fund you're in, linking to the new article. Example: "Tu [cartola AFP](/posts/como-leer-cartola-afp-chile/) confirma en qué fondo estás y muestra la rentabilidad del trimestre."
- `src/data/glossary/afp.md` — add a "Ver también" or in-text reference to `/posts/como-leer-cartola-afp-chile/`.

Declare these three files as in-scope in your change record.

---

## Hero Image Pipeline (AGENTS.md Rule 2.10 — 8-step manual workflow)

After the article file and `editorial-topic-policy.mjs` are updated:

```bash
# Step 1: Update manifest
node scripts/hero-images/scan-articles.mjs

# Step 2: Generate prompts
node scripts/hero-images/build-prompts.mjs
```

**Step 3:** Inspect the new entry in `scripts/hero-images/prompts.json` for slug `como-leer-cartola-afp-chile`:
- Verify `sceneId`, `palette.hex`, and `prompt` are semantically correct for the topic (AFP, retirement savings, a financial statement/document)
- Good scene: `declaracion-renta` or a document/finances scene — NOT `empleo` or `cesantia`
- Good palette: blues or warm financial tones (not red/alarm)

**Step 4:** If the auto-selected scene is wrong, add a `SLUG_OVERRIDES` entry in `scripts/hero-images/prompt-plan.mjs`. Check the `RULES` array and available `recipeId` values in that file to pick the right one. Then re-run `node scripts/hero-images/build-prompts.mjs`.

**Step 5–6:** Use the `prompt` field from `prompts.json` to manually generate the hero image in your AI image tool. Convert to `.avif` (max 80 KB, 1536×1024) and place at:
```
public/images/hero/como-leer-cartola-afp-chile.avif
```

**Step 7:** Set entry in `scripts/hero-images/status.json`:
```json
"como-leer-cartola-afp-chile": { "state": "done" }
```

**Step 8:** Verify gate passes:
```bash
pnpm run check:hero-images
```

---

## CI Gates to Pass Before Merge

```bash
pnpm run check:frontmatter       # will fail until canonicalTopic is registered
pnpm run check:hero-images
pnpm run check:hero-prompts
pnpm run check:editorial-structure
pnpm run check:dialect
pnpm run check:images
pnpm run astro check
pnpm run build
```

**Run order:** Register `canonicalTopic` in `editorial-topic-policy.mjs` first, then create the article, then run `check:frontmatter`.

---

## Forbidden Patterns

- Do NOT derive public URLs from `post.id` (invariant `URL.PUBLIC.NO_POST_ID`)
- Do NOT use quoted strings for YAML dates: `validAsOf: "2026-04-09"` FAILS; use `validAsOf: 2026-04-09`
- Do NOT use `draft: true` (article must be published)
- Do NOT publish without registering `cartola-afp` in `CANONICAL_TOPIC_REGISTRY["pensiones-afp"]` — `check:frontmatter` will block
- Do NOT cite specific fund rentabilidad percentages in prose — these change constantly; describe the field structure only
- Do NOT reproduce screenshots or visual layouts from any specific AFP — describe fields generically per SP norma
- Do NOT merge without `05-math-audit.md` and `06-compliance.md` completed
- Do NOT set `status.json` to `"state": "done"` until the `.avif` file physically exists at the correct path

---

## Frontmatter Schema — Zod Constraints (exact, from `src/content.config.ts`)

The blog collection schema validates with Zod. All fields below are the ones relevant to this article:

```typescript
title: z.string().trim().min(1)                   // non-empty
description: z.string().trim().min(1)              // non-empty; check:editorial-structure enforces 120–200 chars
slug: z.string().trim().min(1)
pubDate: z.date()                                  // YAML native date: 2026-04-09T12:00:00Z
updatedDate: z.date().optional()                   // must be >= pubDate if present
tags: z.array(z.string()).default([])
category: z.enum(["ahorro-inversion","impuestos","prevision","deuda-credito",
                  "seguridad-financiera","empleo-ingresos","general"])
cluster: z.enum([...CLUSTERS])                     // "pensiones-afp" is valid
topicRole: z.enum(["owner","support","reference"]).optional()
canonicalTopic: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional()
  // topicRole and canonicalTopic must both be present or both absent
lang: z.literal("es-CL")
draft: z.boolean().default(false)
featured: z.boolean().default(false)
heroImage: z.string().or(image()).optional()
articleLead: z.object({
  answer: z.string().trim().min(24),
  calculatorHref: z.string().optional(),
  calculatorLabel: z.string().optional(),
  nextStepHref: z.string().optional(),
  nextStepLabel: z.string().optional(),
  validAsOf: z.date().optional(),                  // MUST be unquoted YAML date
  officialSources: z.array(z.object({
    label: z.string().min(2),
    href: z.url()                                  // must be absolute HTTPS URL
  })).default([]),
  covers: z.array(z.string().min(4)).default([]),
  limits: z.array(z.string().min(4)).default([]),
}).optional()
faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional().default([])
```

---

## Reference Frontmatter (from `fondos-afp-a-b-c-d-e.md` — exact current file)

Use this as the pattern reference for the new article (same cluster):

```yaml
---
title: "Fondos AFP A, B, C, D y E: diferencias, riesgo y cuál te conviene"
author: "Equipo Monedario"
pubDate: 2026-02-23T11:00:00Z
updatedDate: 2026-03-12T19:08:00Z
slug: fondos-afp-a-b-c-d-e
featured: true
lang: es-CL
draft: false
tags:
  - afp
  - fondos
  - pensiones
  - inversiones
category: prevision
cluster: pensiones-afp
topicRole: owner
canonicalTopic: elegir-fondos-afp
description: "Explicación clara de los fondos AFP A, B, C, D y E: en qué invierte cada uno, cuánto riesgo tienen y cuál conviene según tu edad y perfil."
heroImage: /images/hero/fondos-afp-a-b-c-d-e.avif
articleLead:
  answer: "En 2026 los multifondos A, B, C, D y E siguen vigentes. La decisión útil hoy todavía es elegir riesgo según horizonte y tolerancia, pero sin olvidar que la reforma ya aprobó el paso a fondos generacionales desde 2027."
  calculatorHref: "/calculadoras/simulador-jubilacion/"
  calculatorLabel: "Proyectar jubilación"
  nextStepHref: "/posts/como-cambiarse-de-afp/"
  nextStepLabel: "Cómo cambiarte de AFP paso a paso"
  validAsOf: 2026-03-12
  officialSources:
    - label: "Superintendencia de Pensiones"
      href: "https://www.spensiones.cl/"
    - label: "BCN — Ley 21.735"
      href: "https://www.bcn.cl/leychile/navegar?idNorma=1212060"
  covers:
    - "Diferencias de riesgo y composición entre fondos."
    - "Qué decisión sirve hoy mientras siguen vigentes."
    - "Cómo se cruza con la transición a fondos generacionales."
  limits:
    - "No sustituye recomendación personalizada de inversión."
    - "No define por sí sola si debes cambiarte de AFP."
    - "No resume toda la reforma previsional."
---
```

---

## CANONICAL_TOPIC_REGISTRY — Current `pensiones-afp` Block (exact)

Current state in `src/config/editorial-topic-policy.mjs`:

```js
"pensiones-afp": {
  "cambio-afp": {
    ownerSlug: "como-cambiarse-de-afp",
    intentLabel: "cambiarse de AFP",
  },
  "elegir-fondos-afp": {
    ownerSlug: "fondos-afp-a-b-c-d-e",
    intentLabel: "elegir fondos AFP",
  },
  "cuenta2-afp": {
    ownerSlug: "que-es-la-cuenta-2-afp",
    intentLabel: "cuenta 2 AFP",
  },
  "reforma-previsional-cambios": {
    ownerSlug: "reforma-previsional-2025-que-cambia-y-como-te-afecta",
    intentLabel: "reforma previsional y cambios vigentes",
  },
},
```

**Add this entry before the closing `},`:**

```js
  "cartola-afp": {
    ownerSlug: "como-leer-cartola-afp-chile",
    intentLabel: "leer e interpretar la cartola AFP",
  },
```

---

## Return Cross-links — Exact Insertion Context

### 1. `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md`

The article ends with (lines 161–169):
```
Si estás comparando alternativas, te conviene revisar cómo cambiarte de AFP, la lógica de fondos
previsionales y, si el problema ya no es solo AFP, pasar después al cálculo completo o a la
clasificación de descuentos. La [guía de pensiones y AFP en Chile](/guias/pensiones-afp/) ordena
todas esas dudas previsionales en un solo lugar.
```

Add a sentence **after that paragraph**, before `### Fuentes oficiales para el bloque 2025-2027`:
> Para confirmar que el descuento que aparece en tu liquidación coincide con lo que la AFP registró en tu cuenta, revisa tu [cartola trimestral AFP](/posts/como-leer-cartola-afp-chile/).

### 2. `src/data/blog/fondos-afp-a-b-c-d-e.md`

The article ends with (lines 210–220):
```
Para convertir esta elección en una decisión completa, cruza esta guía con una decisión de
administradora o con un desglose de cotización solo si esa pregunta realmente cambió.

Si quieres salir de la lógica "fondo por fondo" y mirar el cambio estructural del sistema, cambia
después a una guía de reforma previsional.
```

Add a sentence **after the first of those two paragraphs**:
> Para verificar en qué fondo estás efectivamente registrado y ver la rentabilidad del período, consulta tu [cartola AFP trimestral](/posts/como-leer-cartola-afp-chile/).

### 3. `src/data/glossary/afp.md`

The glossary entry ends with:
```
**Lee la guía completa:** [Pensiones y AFP en Chile](/guias/pensiones-afp/) →
```

Add a second "Ver también" line after it:
```
**Cómo leer tu estado de cuenta:** [Cómo leer la cartola AFP](/posts/como-leer-cartola-afp-chile/) →
```

---

## NORMA_YMYL Checklist (blocking before publish)

From `docs/editorial/NORMA_YMYL.md` — all MUST be true:

1. ☐ **Respuesta Ancla ≤2 pantallas** — La pregunta principal tiene respuesta concreta (número/regla/criterio) en la primera sección útil.
2. ☐ **Regla declarada de forma afirmativa** — No "depende..." sin listar de qué depende. No meta-proceso antes de la regla.
3. ☐ **Vigencia explícita** — Cada regla indica "vigente a 2026-04-09" o equivalente.
4. ☐ **Fuentes oficiales mínimas** — Al menos 1 fuente oficial (SPensiones) por regla YMYL crítica.
5. ☐ **Excepciones relevantes enumeradas** — Casos especiales o condiciones listados.
6. ☐ **No inferencias sin etiqueta** — Toda síntesis de normas SP marcada como "resumen orientativo".
7. ☐ **Coherencia interna** — Sin contradicciones entre secciones, FAQ y resúmenes.
8. ☐ **Frontmatter válido y señales de frescura** — `updatedDate` coincide con la revisión más reciente.

**Plantilla "Respuesta Ancla" obligatoria (insertar al inicio de la sección clave):**
> **Respuesta rápida:** {regla concreta}.
> **Vigencia:** {fecha}.
> **Fuente(s):** {link(s) oficial(es)}.

---

## Editorial Pipeline — Artifact Contracts

From `context/EDITORIAL_AI_PIPELINE.md`:

| Phase | Role | Assigned to |
|---|---|---|
| Research | `ResearchAgent` | Gemini |
| Outline | `OutlineAgent` | GPT derivative |
| Draft | `DraftAgent` | Claude |
| Math audit | `MathAuditAgent` | GPT derivative |
| Compliance (Chile) | `ComplianceAgent` | Gemini |
| Final publication decision | `HumanEditor` | Human |

**Hard rule:** `DraftAgent` must be different from both `MathAuditAgent` and `ComplianceAgent`.

Canonical run folder: `artifacts/editorial/como-leer-cartola-afp-chile/<run-id>/`
Run-id format: `YYYYMMDD-HHMM-<shortid>`

Required files:
1. `01-brief.yaml`
2. `02-dossier.md` — sources, SP circular references, field inventory with retrieval date
3. `03-outline.md`
4. `04-draft.md`
5. `05-math-audit.md` — set `requires_calculation: false`; verdict must be PASS or FAIL, not blank
6. `06-compliance.md` — set `regulatory_sensitivity: media`; all NORMA_YMYL MUST criteria checked
7. `07-publish-packet.md` — duties table + HumanEditor sign-off checkpoint + all CI gates

**Publication is blocked if:**
- Any artifact contains unresolved `TODO:SOURCE`
- `DraftAgent` == `MathAuditAgent` or `ComplianceAgent` (duties must be different role identities)
- `07-publish-packet.md` does not have `[x] HumanEditor sign-off`

---

## Key Invariants (from `context/INVARIANTS.md`)

| Invariant ID | Meaning | Gate |
|---|---|---|
| `URL.PUBLIC.NO_POST_ID` | Public URLs cannot be derived from `post.id` | `pnpm run check:no-postid-urls` |
| `FRONTMATTER.VALID` | Blog frontmatter meets required policy | `pnpm run check:frontmatter` |
| `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED` | YMYL content must display explicit cut-off date visible to reader | Manual review |
| `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS` | Critical numbers require source traceability | Manual review + MathAuditReport |
| `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` | Drafting cannot be audited by the same agent role | Manual review + publish packet |
| `INVARIANT.EDITORIAL.CANONICAL_TOPIC_REGISTRY_HARDENED_CLUSTERS` | Hardened clusters must use registered canonical topics | `pnpm run check:frontmatter` |
| `INVARIANT.EDITORIAL.HERO_IMAGE_PUBLISHED_REQUIRED` | Published article must have resolvable hero image | `pnpm run check:hero-images` |

---
