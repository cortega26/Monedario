# Gate 04 — Draft: como-elegir-inversion-segun-plazo-riesgo-objetivos

Status: DRAFT (archivos materializados, fuente única) — pending ComplianceAgent (gate 06, nueva sesión Claude Code)
Role: DraftAgent (Claude Code — ED-016); materialización + remediación 2026-06-25
Fecha de corte: 2026-06-25
requires_calculation: false
regulatory_sensitivity: media

> **⚠️ FUENTE AUTORITATIVA — leer antes de auditar (ComplianceAgent):**
> Este artefacto **ya no embebe una copia del artículo ni del componente**. Audita los
> archivos reales, que son la única fuente de verdad:
> - Artículo: `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx`
> - Componente: `src/components/InversionReadinessChecklist.astro`
>
> **Por qué (incidente 2026-06-25):** este `04-draft.md` contenía una copia embebida del
> artículo en un bloque ```` ```mdx ````. Tras la remediación (abajo), esa copia quedó
> desactualizada respecto del blog file, y una revisión que leía el bloque embebido seguía
> evaluando el draft viejo (puntaje sin cambios). Para eliminar la divergencia de raíz, la
> copia se reemplazó por este puntero. **No reintroducir copias embebidas del artículo.**

> **Corrida DraftAgent 2026-06-25 — qué cambió respecto del draft 2026-05-21:**
> 1. Se crearon los archivos reales: `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx`
>    (con `draft: true`, excluido de rutas/RSS/OG por `getCollection("blog", ({data}) => !data.draft)`)
>    y `src/components/InversionReadinessChecklist.astro`.
> 2. Fecha de corte y `validAsOf` actualizados a 2026-06-25 (fecha de verificación real de fuentes, ver `02-research.md` §Verification Log).
> 3. Alineación con fuentes verificadas: el cuerpo refuerza el lenguaje condicional para los umbrales
>    no fijados por CMF ("muchas guías sugieren tres o más meses; no es una norma") y para el horizonte;
>    añade el encuadre CMF de renta fija/variable (art. 518/1655) y mantiene la remisión al SII para
>    tributación (R6/R7/R8 verificados a nivel de artículo, sin detallar tasas).
> 4. Endurecimiento del componente: `escapeHtml` en el render de resultados y guardas de null en los
>    listeners (defensa básica, aunque el contenido es estático y de una sola instancia en la página).

> **Remediación DraftAgent 2026-06-25 (post-revisión 9.15/10):** se cerró la brecha hacia
> ≥9.5 con tres cambios mapeados a la rúbrica NORMA_YMYL (presentes en el blog file):
> 1. **Respuesta ancla (35%):** lista numerada de las 5 preguntas insertada al inicio del
>    cuerpo (tras el advisory), para que la respuesta concreta no quede "circulada" por el
>    H2 de posicionamiento (MUST #1/#2).
> 2. **Inferencia etiquetada + excepciones (Precisión/Cobertura):** la tabla "Cuatro
>    escenarios" se rotuló como **"Resumen orientativo"** con limitador de variabilidad
>    (MUST #7) y se añadió una nota de **excepciones comunes** (deuda de alto/bajo costo,
>    aporte periódico vs. monto único) (MUST #5).
> 3. **Claridad (10%):** el H3 interno del componente pasó de "¿Estás listo para invertir?"
>    a "Checklist de prerequisitos" para no duplicar el H2 del artículo (MUST #8).
> Checks verdes: dialect, frontmatter, editorial-structure (long_fail=0, short=0),
> editorial-artifacts (compliant, estricto). Render verificado con Playwright (6/6 escenarios).

---

> **SEPARATION OF DUTIES NOTICE**
> Este draft fue producido por DraftAgent (Claude Code, sesión ED-016).
> Gate 05 (MathAuditAgent) no aplica para esta pieza — no hay cálculos numéricos.
> Si durante revisión humana se decide agregar retornos históricos, proyecciones o
> ejemplos con montos/tasas, escalar a MathAuditAgent antes de gate 06.
> Gate 06 (ComplianceAgent) debe ejecutarse en una nueva sesión de Claude Code,
> sin contexto de esta sesión. Ver `context/EDITORIAL_AI_PIPELINE.md` §2 y §8.

---

## Draft del artículo

**Fuente autoritativa (auditar este archivo):**
`src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx`

El artículo completo (frontmatter, cuerpo, advisory, respuesta ancla, tabla de escenarios y
FAQ) vive en ese archivo. Este artefacto no mantiene una copia para evitar divergencia. El
`pubDate` y `heroImage` reales quedan para el gate 07 (humano); el blog file usa `draft: true`
y un `pubDate` provisional mientras tanto.

## Componente InversionReadinessChecklist

**Fuente autoritativa (auditar este archivo):**
`src/components/InversionReadinessChecklist.astro`

Componente Astro autocontenido (sin dependencias externas, sin cookies, sin llamadas a API).
Checklist de 5 preguntas binarias cuyo resultado mapea preparación, nunca recomendación de
producto. El advisory YMYL aparece dentro de cada resultado.

---

> **Remediación de gate 06 (2026-06-25, post-CONDITIONAL 9.70/10):** se resolvieron los
> 4 defectos LOW de `06-compliance.md`:
> - **DEFECT #1 (advisory componente):** se agregó un bloque advisory estático con el texto
>   completo exigido por el brief ("Contenido educativo… horizonte, tolerancia a pérdidas,
>   liquidez, costos e impuestos"), visible al cargar el componente (no solo en el resultado).
> - **DEFECT #3 (interlinking):** se materializaron los 3 outbound faltantes en el cuerpo,
>   intra-cluster: `deposito-a-plazo-uf-vs-pesos` (§3.3), `como-invertir-en-etfs-desde-chile`
>   (§3.4) y `fondos-mutuos-comisiones-rescate-impuestos` (§3.5).
> - **DEFECT #4 (asesor CMF):** se enlazó "asesor de inversión registrado en la CMF" a la
>   página CMF Educa de Asesores de Inversión (verificada por fetch 2026-06-25) y se corrigió
>   la terminología: desde la Ley Fintec 21.521 el registro es el de Prestadores de Servicios
>   Financieros (RPSF). Resuelve también el deferral señalado.
> - **DEFECT #2 (Tabla de contenidos):** **FALSO POSITIVO.** El plugin `remarkStripTocSection`
>   en `astro.config.ts` (líneas 54-66, 270) elimina el heading "Tabla de contenidos" del
>   MDAST en build; el TOC se renderiza vía `TOCSidebar.astro` (aside). Es la convención de
>   los 10+ posts publicados (p. ej. `que-es-el-apv.mdx`). No requiere cambio; sin defecto real.
> Re-auditoría de gate 06 recomendada para confirmar PASS (cero defectos) sobre el blog file.

> **Remediación de gate 06 — 2ª ronda (2026-06-25):** la re-auditoría mantuvo 2 defectos
> bucket C; ambos resueltos:
> - **TOC heading:** se **eliminó** el marcador `## Tabla de contenidos` del artículo. Aunque
>   `remarkStripTocSection` ya lo strippeaba en build (no generaba heading vacío) y la TOC la
>   renderiza `TOCSidebar`, se optó por la otra opción ofrecida por el auditor (eliminar el
>   heading) para cerrar el hallazgo a nivel de fuente. `check:toc-i18n` no exige el marcador
>   (solo bloquea el texto en inglés); el resto de H2 supera `min_h2`.
> - **Gastos esenciales (§3.1):** se agregaron ejemplos concretos (arriendo o dividendo,
>   alimentación, servicios básicos, salud, transporte) y la exclusión de gastos
>   discrecionales, anclados en el claim C3 del research (estándar educativo verificado).
> Checks verdes: astro sync, editorial-structure, dialect, editorial-artifacts.

## Notas post-draft

1. **TODO:SOURCE bloqueantes (R6, R7, R8 — tributación DAP / fondos mutuos / ETFs):**
   verificados con fetch real el 2026-06-25 (ver `02-research.md` §Verification Log). El blog
   file cita el artículo de la LIR aplicable (Art. 20 N°2 / 108-109 / 107) y remite al SII sin
   detallar tasas. No quedan TODO:SOURCE abiertos.
2. **Fecha de corte:** 2026-06-25 (visible en el cuerpo del blog file). Confirmar/ajustar en
   el 07-publish-packet con la fecha de publicación real.
3. **heroImage:** asignada manualmente en
   `public/images/hero/como-elegir-inversion-segun-plazo-riesgo-objetivos.avif`, con
   variantes responsivas `@tablet` y `@mobile`. El frontmatter ya usa la ruta canónica.
4. **pubDate:** provisional `2026-06-25` con `draft: true`; el valor real lo fija el 07-publish-packet.
5. **Dialecto:** tuteo chileno, sin voseo. `check:dialect` pasa.
6. **Migración canónica:** gobernanza (01-brief.yaml, 02-dossier.md, sources.yaml, metadata.yaml)
   en `artifacts/editorial/como-elegir-inversion-segun-plazo-riesgo-objetivos/20260625-1405-ed016/`.
   `check:editorial-artifacts` compliant en modo estricto.
7. **`articleLead.officialSources`:** verificar en gate 06 que las URLs CMF/SII/BCN apuntan a
   secciones vigentes (fueron consultadas el 2026-06-25).
