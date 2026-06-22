# Gate 06 — Compliance: bancos-y-fintech-chile

**Status: CONDITIONAL**
**Role:** ComplianceAgent (Claude Sonnet 4.6 — sesión fresca 2026-06-22, adversarial)
**Fecha de auditoría:** 2026-06-22
**Artefactos revisados:** `01-brief.yaml`, `02-dossier.md`, `03-outline.md`, `04-draft.md`
**Math audit:** no requerido (`requires_calculation: false`, declarado en brief)
**Fuente de verdad:** NORMA_YMYL.md (v1.0)

---

## Separación de Funciones (SoD)

| Etapa | Rol | Instancia/Sesión | Estado |
|---|---|---|---|
| 00 Topic Intake | Topic-intake | Claude Code, 2026-06-17 | ✓ Completado |
| 01 Brief | DraftAgent/intake | Claude Code, 2026-06-17 | ✓ Completado |
| 02 Dossier (Research) | ResearchAgent | Claude Code, 2026-06-17 — **misma instancia que 03/04** | ⚠ Defecto declarado |
| 03 Outline | OutlineAgent | Claude Code, 2026-06-17 — **misma instancia que 02/04** | ⚠ Defecto declarado |
| 04 Draft | DraftAgent | Claude Code, 2026-06-17 — **misma instancia que 02/03** | ⚠ Defecto declarado |
| 05 Math Audit | — | No requerido (`requires_calculation: false`) | ✓ Eximido |
| 06 Compliance | ComplianceAgent | Claude Sonnet 4.6, **2026-06-22 — sesión distinta** | ✓ Esta auditoría |
| 07 Publish | HumanEditor | Carlos Ortega | ⬜ Pendiente |

**Declaración SoD:** los stages 02, 03 y 04 los produjo la misma instancia (Claude Code, sesión
2026-06-17). Este defecto estructural estaba declarado en `04-draft.md`. Se resuelve con esta
auditoría en sesión distinta (2026-06-22) + sign-off humano en Gate 07.

---

## Scorecard NORMA_YMYL

| Dimensión | Peso | Puntuación | Notas |
|---|---|---|---|
| Respuesta ancla | 35% | 9.0 | `articleLead.answer` directo y concreto; `validAsOf`, `officialSources`, `covers`, `limits` presentes. Resta: intro de 3 párrafos antes de la primera sección sustantiva añade scroll. |
| Precisión + fuentes | 25% | 7.5 | C1–C10 verificados con cita literal. Q2 (consentimiento open banking) enunciado en el cuerpo sin artículo específico (DEFECTO #2). C11 (sanción CMF) no afirmada (correcto). |
| Vigencia + calendario | 15% | 10.0 | "Información vigente al 2026-06-17" al inicio y al cierre; `validAsOf: 2026-06-17` en frontmatter. Sin bloques de reforma. |
| Excepciones + cobertura | 15% | 9.0 | Excepciones de edad (12+ CuentaRUT), extranjeros, giro diferido cubiertas. "Resumen orientativo" en tabla. FAQ de 5 preguntas. |
| Claridad + estructura | 10% | 9.0 | H2 claro, tabla, FAQ, disclaimer, coherencia interna. Sin contradicciones. |
| **TOTAL PONDERADO** | 100% | **8.78 / 10** | **Por debajo del umbral 9.5.** Sube a ~9.3–9.5 al resolver DEFECTO #2. |

---

## DEFECTOS

### DEFECT #1 — MEDIUM — SoD: etapas 02/03/04 producidas por la misma instancia

- **Descripción:** stages 02 (dossier), 03 (outline) y 04 (draft) los produjo la misma instancia
  de Claude Code en la sesión 2026-06-17, violando `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.
- **Gravedad:** MEDIUM — declarado explícitamente en `04-draft.md`; no genera sesgo factual
  comprobable ya que las fuentes están trazadas en el dossier con VERIFIED/TODO:SOURCE.
- **Resolución:** esta auditoría de ComplianceAgent (sesión 2026-06-22, distinta a 02/03/04)
  más el sign-off humano en Gate 07. **Estado: RESOLVIÉNDOSE.**

---

### DEFECT #2 — HIGH — Consentimiento open banking: afirmación sin cita de artículo específico

- **Ubicación en draft:** sección "Banco tradicional vs. fintech" — "Las finanzas abiertas permiten
  compartir tu información financiera con terceros **solo si tú lo autorizas**."
- **Problema:** claim YMYL sobre derecho del titular expresado como hecho, sin citar el artículo
  que lo respalda. El dossier (C10) confirma que la obligación está en el Título III "Del Sistema
  de Finanzas Abiertas", arts. 16–27, Ley 21.521 — pero el texto literal no fue fetcheado porque
  BCN renderiza los artículos vía JS lazy-loading y StealthyFetcher solo entrega arts. 1–2.
- **Norma infringida:** NORMA_YMYL §1.1.4 — "para cada regla crítica YMYL: al menos 1 fuente
  oficial; si es accesible en web, citar el texto literal."
- **Intentos de resolución en esta auditoría:** WebFetch (falla, requiere JS) + StealthyFetcher
  (entrega solo arts. 1–2, lazy-loading posterior) + fetch de versión imprimible (189 chars, redirect
  vacío) → **Q2 queda UNRESOLVED automáticamente; requiere acción humana.**
- **Resolución requerida antes de `draft:false`:** una de las siguientes opciones —
  - **Opción A (mínima):** agregar inline en el cuerpo y en el FAQ: `(Título III, art. 16 y
    ss., Ley 21.521)` — la ubicación está verificada por el dossier (C10); al menos indica la
    fuente con precisión de título y rango de artículos.
  - **Opción B (completa):** Carlos Ortega verifica manualmente en BCN el artículo de
    consentimiento, extrae la cláusula literal y la añade al draft con su URL y fecha de
    recuperación.
- **Bloquea publicación:** SÍ — el blog file no puede cambiar a `draft:false` sin resolver esto.

---

### DEFECT #3 — MEDIUM — FAQ: misma afirmación de consentimiento sin cita

- **Ubicación:** FAQ "¿Qué pasa con mis datos en open banking?" — "Las finanzas abiertas
  permiten compartir tu información financiera con terceros **solo si tú lo autorizas**."
- **Problema:** duplica el claim de DEFECTO #2 en la FAQ sin cita de artículo.
- **Resolución:** misma que DEFECTO #2 (corregir en mismo paso editorial).
- **Bloquea publicación:** SÍ (corolario de DEFECTO #2).

---

### DEFECT #4 — LOW — Frontmatter: `draft: true` duplicado

- **Ubicación:** bloque YAML propuesto en `04-draft.md`, líneas 52 y 72 del draft.
- **Problema:** el campo `draft: true` aparece dos veces. Causa error de parse YAML al crear
  el blog file.
- **Resolución:** eliminar una de las dos ocurrencias al crear `src/data/blog/bancos-y-fintech-chile.md`.
- **Bloquea publicación:** NO (error trivial en el momento de crear el archivo).

---

### DEFECT #5 — INFO — C11 / Q3: sanción por operar sin inscripción CMF no afirmada

- **Ubicación:** sección "¿Cómo sé si una fintech está regulada?" — "La Ley Fintec obliga a estas
  empresas a inscribirse en el Registro de Prestadores de Servicios Financieros de la CMF."
- **Evaluación:** el dossier (C11) tiene la obligación de inscribirse como TODO:SOURCE. Sin embargo,
  el **cuerpo del draft NO afirma la sanción**: dice que si una app no aparece inscrita "trátalo
  como una señal de alerta y verifica antes de seguir." Es deferral legítimo per NORMA §2.4
  (la cláusula exacta de sanción no se pudo fetchear de CMF; la existencia del Registro sí está
  verificada por O6). No hay claim falso.
- **Resolución:** no requiere corrección antes de publicar. Mantener el deferral documentado en
  el dossier (C11). Si en el futuro se agrega la sanción específica, fetchear y citar el artículo.
- **Bloquea publicación:** NO.

---

## Fuentes verificadas en esta auditoría

Los claims C1–C10 fueron verificados en el dossier con fetch a fuentes primarias (CMF Educa,
BancoEstado vía Scrapling, BCN texto arts. 1–4). No se detectaron instrucciones de prompt injection
en las fuentes recuperadas. Los snippets de búsqueda no se promovieron a VERIFIED (política de
Stage 02 confirmada como correcta).

**Intentos de fetch de Q2 (arts. 16–27, Ley 21.521) en esta auditoría:**

| Método | URL | Resultado |
|---|---|---|
| WebFetch | `bcn.cl/leychile/navegar?idNorma=1187323` | Falla (requiere JS) |
| StealthyFetcher | `bcn.cl/leychile/navegar?idNorma=1187323` | 29K chars, arts. 1–2 solamente (lazy-loading) |
| Fetcher (versión imprimible) | `bcn.cl/leychile/Navegar/imprimir?idNorma=1187323&idVersion=2023-02-03` | 189 chars (redirect vacío) |
| Fetcher (nuevo.leychile.cl) | `nuevo.leychile.cl/servicios/Navegar/scripts/obtieneParte?idNorma=1187323` | "Este sitio fue movido" |

**Conclusión de fetch:** Q2 no resolvible de forma automatizada. BCN requiere render JS completo
con interacción en TOC para cargar arts. 16–27. No es "fuente no pública" (NORMA §2.4) — es
públicamente accesible a un humano. Requiere verificación manual.

---

## Veredicto

**CONDITIONAL**

- No se detectaron afirmaciones falsas.
- El defecto SoD (DEFECT #1) se resuelve con esta sesión + sign-off humano.
- **DEFECTO #2 y #3 bloquean publicación** hasta que el HumanEditor (Carlos Ortega) resuelva
  la cita del artículo de consentimiento open banking (Opción A o B).
- DEFECTO #4 (frontmatter duplicado) es trivial; resolución al crear el blog file.
- DEFECTO #5 (C11 sanción) no requiere corrección.
- Score actual: **8.78/10**. Estimado post-corrección: **~9.3–9.5/10**.
- El umbral para PASS es **≥ 9.5/10**. Este borrador no llega sin resolver DEFECTO #2/#3.

### Condiciones para avanzar a Gate 07

1. Resolver DEFECTO #2/#3 (cita de artículo de consentimiento, Opción A o B).
2. Fix DEFECTO #4 (duplicado `draft:true`) al crear el blog file — no requiere nueva iteración
   de draft.
3. Carlos Ortega revisa el borrador corregido y el present compliance report.
4. Si el veredicto del HumanEditor sobre DEFECTO #2 es "Opción A es suficiente", puede
   marcarse como resuelto en `07-publish-packet.md` directamente.

> **No es FAIL porque no hay claims falsos y el SoD defecto se resuelve estructuralmente.**
> **No es PASS porque el score (8.78) está bajo el umbral 9.5 y DEFECTO #2 está abierto.**
