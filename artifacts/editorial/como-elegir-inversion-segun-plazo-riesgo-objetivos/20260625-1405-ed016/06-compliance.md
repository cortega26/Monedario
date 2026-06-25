# Gate 06 — Compliance YMYL: como-elegir-inversion-segun-plazo-riesgo-objetivos

Status: PASS — cero defectos, cero TODO:SOURCE, puntaje NORMA_YMYL 9.88/10 ≥ 9.5
Role: ComplianceAgent (Claude Code — sesión fresca, adversarial)
Fecha de auditoría: 2026-06-25 (re-auditoría tras corrección de DEFECTS #1 y #2)
Slug: como-elegir-inversion-segun-plazo-riesgo-objetivos
Run ID: 20260625-1405-ed016

> **Nota:** Esta es una re-auditoría adversarial desde cero tras la corrección de los 2 defectos
> identificados en la auditoría anterior (ambos resueltos). Se verificaron directamente los
> archivos fuente autoritativos (`.mdx` y `.astro`). Reemplaza cualquier versión anterior de
> `06-compliance.md` para este run.

---

## SEPARATION OF DUTIES NOTICE

Esta auditoría se ejecutó en una **sesión de Claude Code independiente** de la sesión de
drafting (gate 04) y de research (gate 02). Se cumple el requisito de separación de deberes
del pipeline editorial (`context/EDITORIAL_AI_PIPELINE.md` §2 y §8). El gate 07 (publish)
queda reservado al editor humano. No se marca ningún gate en `07-publish-packet.md`.

---

## Inputs revisados (en orden)

| # | Archivo | Estado |
|---|---|---|
| 1 | `docs/editorial/NORMA_YMYL.md` | Leído — aplicado como estándar (scorecard §7) |
| 2 | `docs/editorial/artifacts/briefs/como-elegir-inversion-segun-plazo-riesgo-objetivos.md` | Leído — brief completo |
| 3 | `artifacts/editorial/.../20260625-1405-ed016/01-brief.yaml` | Leído — brief canónico |
| 4 | `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx` | Leído — fuente autoritativa del artículo (versión corregida post-DEFECTS #1 y #2) |
| 5 | `src/components/InversionReadinessChecklist.astro` | Leído — fuente autoritativa del componente (sin cambios desde auditoría anterior) |
| 6 | `docs/editorial/artifacts/.../02-research.md` | Leído — catálogo de claims (C1–C17, E1–E4) + Verification Log (fetch real 2026-06-25) |
| 7 | `artifacts/editorial/.../20260625-1405-ed016/sources.yaml` | Leído — fuentes oficiales verificadas |

---

## Resolución de defectos anteriores

| Defecto | Severidad | Estado | Evidencia |
|---|---|---|---|
| DEFECT #1 — Heading "Tabla de contenidos" vacío (línea 93) | MEDIUM | ✅ RESUELTO | El heading fue eliminado. La estructura ahora fluye directamente del párrafo introductorio (línea 91) a `## Por qué esta guía no te dice en qué invertir` (línea 93). Sin secciones vacías. |
| DEFECT #2 — "Gastos esenciales" sin definición orientativa | LOW | ✅ RESUELTO | Líneas 135–138: definición orientativa completa con ejemplos ("arriendo o dividendo, alimentación, servicios básicos (luz, agua, gas, internet), salud y transporte") y exclusión explícita de gastos discrecionales ("entretenimiento, vacaciones o compras no urgentes"). Lenguaje condicional: "se entiende", sin pretensión normativa. |

---

## Scorecard NORMA_YMYL (v1.0 §7)

| Dimensión | Peso | Puntaje | Ponderado | Justificación |
|---|---|---|---|---|
| Respuesta ancla | 35% | **10.0** | 3.50 | Las 5 preguntas concretas aparecen en las primeras ~30 líneas del cuerpo como lista numerada, inmediatamente después del advisory. La vigencia está en blockquote inicial (línea 60). El lead del frontmatter contiene la respuesta ancla en forma afirmativa. Sin rodeos ni "depende" sin enumerar de qué depende. MUST #1 y #2 superados con holgura. |
| Precisión + fuentes | 25% | **9.5** | 2.375 | Claims tributarios citan los artículos correctos de la LIR (Art. 20 N°2, 108, 109, 107) con idNorma=6368 verificado (corregido de 15774 según Verification Log). Definiciones CMF de renta fija/variable respaldadas por artículos 518 y 1655 con enlaces directos en el cuerpo. `articleLead.officialSources` con 5 entradas. Sin deferral injustificado. Observación sin impacto en puntaje: la entrada del SII en `officialSources` apunta al portal raíz (`sii.cl`), mientras las otras 4 fuentes enlazan artículos específicos; las citas legales inline usan correctamente BCN, no SII. |
| Vigencia + calendario | 15% | **10.0** | 1.50 | Fecha de corte 2026-06-25 visible al inicio (línea 60) y al final (línea 307) del cuerpo. Coincide con `validAsOf` y `pubDate` del frontmatter. Sin reformas ni calendarios que requieran bloque "aprobado/vigencia/implementación". `reviewPolicy` configurada. `updatedDate` no aplica (artículo nuevo). |
| Excepciones + cobertura | 15% | **10.0** | 1.50 | Sección "Excepciones comunes" (línea 236) con dos matices concretos: deuda de alto costo vs. bajo costo; aporte periódico vs. monto único. FAQ cubre edad, deudas, capital mínimo y APV con enlaces a artículos dedicados. Matriz de 4 escenarios chilenos con criterios, no productos. Tabla rotulada "Resumen orientativo" con limitador de alcance (MUST #7). "Gastos esenciales" ahora definido con ejemplos orientativos y exclusión de discrecionales (líneas 135–138). Sin vacíos de cobertura. |
| Claridad + estructura | 10% | **10.0** | 1.00 | Estructura H2 alineada con el brief. Lenguaje claro y accesible. Componente autocontenido, bien documentado, con atributos de accesibilidad. Advisory YMYL presente en 3 ubicaciones (inicio del artículo, inicio del componente, dentro de cada resultado). Interlinking hacia todas las guías complementarias del brief. Sin secciones vacías ni placeholders. |
| **TOTAL PONDERADO** | | **9.88** | | 3.50 + 2.375 + 1.50 + 1.50 + 1.00 = 9.875 ≥ 9.5 |

---

## DEFECTS

**Cero defectos.**

Los 2 defectos de la auditoría anterior (2026-06-25, primera pasada) fueron resueltos:

1. ~~DEFECT #1 (MEDIUM) — Heading "Tabla de contenidos" vacío~~ → RESUELTO: heading eliminado.
2. ~~DEFECT #2 (LOW) — "Gastos esenciales" sin definición orientativa~~ → RESUELTO: definición con ejemplos agregada en líneas 135–138.

No se introdujeron nuevos defectos con las correcciones. La re-auditoría completa no encontró problemas adicionales.

---

## Verificación de prohibiciones del brief (lista exhaustiva)

| Prohibición | Estado | Evidencia |
|---|---|---|
| Rankings de productos o instituciones | ✅ AUSENTE | Sin listas rankeadas; sin nombres de instituciones como mejores opciones |
| "Mejor inversión", "conviene más", "deberías invertir en" | ✅ AUSENTE | Lenguaje condicional consistente: "el marco que aplica", "define qué instrumentos analizar", "Ninguna es mejor en abstracto" (línea 193). "Conviene" en FAQ (línea 286) es condicional sobre deuda, no sobre instrumento |
| Carteras modelo por edad | ✅ AUSENTE (mencionadas para advertir contra ellas) | FAQ (línea 277): "Las carteras modelo por edad son orientaciones generales que simplifican factores que varían mucho entre personas" |
| Porcentajes normativos por perfil (60/40, etc.) | ✅ AUSENTE | Sin asignaciones porcentuales |
| Retornos históricos o proyecciones | ✅ AUSENTE | "20%" y "30%" en §3.4 (líneas 177, 180) son escenarios hipotéticos de autoevaluación ("¿venderías?"), no claims de mercado |
| APV en profundidad | ✅ AUSENTE | Solo mención contextual en FAQ; remite a `/posts/que-es-el-apv/` (línea 302) |
| Recomendación personalizada | ✅ AUSENTE | Checklist mapea preparación (6 claves: `bloqueante`, `horizonte`, `liquidez`, `riesgo`, `listoConPendiente`, `listo`), nunca producto |

---

## Verificación de claims legales/tributarios

| Claim en el artículo | Artículo LIR citado | Coincide con Verification Log | Coincide con sources.yaml | ¿Detalla tasas? |
|---|---|---|---|---|
| Intereses DAP → rentas de capitales mobiliarios | Art. 20 N°2 (línea 200) | ✅ R6 RESUELTO | ✅ SII FAQ `001_140_2738.htm` | No — solo cita el artículo y remite al SII |
| Mayor valor rescate fondos mutuos | Art. 108 y 109 (línea 202) | ✅ R7 RESUELTO | ✅ SII JA `ja1959.htm`, Circular 39/2022 | No — cita los artículos y remite |
| ETFs → posible exención | Art. 107 (línea 204) | ✅ R8 RESUELTO | ✅ Circular 39/2022 | No — "bajo condiciones específicas que detalla la normativa vigente del SII" |
| Ley sobre Impuesto a la Renta | DL 824, idNorma=6368 | ✅ Corregido de 15774 en Verification Log | ✅ BCN | N/A |

Los 4 enlaces a BCN en el artículo (3 inline en §3.5 + 1 en footer) usan correctamente `idNorma=6368`. Sin ocurrencias del idNorma antiguo (15774).

---

## Verificación de umbrales numéricos como heurística (no norma CMF)

| Umbral | Ubicación | ¿Presentado como norma CMF? | Consistente con Verification Log |
|---|---|---|---|
| "3 o más meses" (fondo emergencia) | Checklist P1 + cuerpo §3.1 | **No.** Checklist subtitle: "orientaciones de educación financiera, no normas chilenas". Cuerpo (línea 134): "no es una norma, sino un punto de partida razonable." | ✅ R1: CMF no fija número |
| "12 meses" (horizonte) | Checklist P2 | **No.** Mismo subtítulo del checklist. | ✅ R2: CMF no fija umbral |
| "2–4 años" (pie departamento) | Tabla escenarios | **No.** Rango descriptivo. | ✅ Sin claim normativo |
| "+10 años" (jubilación) | Tabla escenarios | **No.** Ídem. | ✅ Sin claim normativo |
| "20% en un mes" (tolerancia) | Cuerpo §3.4 (línea 177) | **No.** Escenario hipotético de autoevaluación. | ✅ Sin claim factual |

---

## Verificación del componente InversionReadinessChecklist.astro

| Requisito | Estado | Evidencia |
|---|---|---|
| Sin dependencias JS externas | ✅ | Script vanilla inline; sin imports ni librerías |
| Sin cookies ni almacenamiento | ✅ | Sin `localStorage`, `sessionStorage`, `document.cookie` |
| Sin llamadas a API externas | ✅ | Sin `fetch`, `XMLHttpRequest` |
| Resultado mapea preparación (no producto) | ✅ | Claves: `bloqueante`, `horizonte`, `liquidez`, `riesgo`, `listoConPendiente`, `listo` |
| Sin nombres de productos/instituciones/porcentajes | ✅ | CTA enlazan solo a artículos internos y CMF Educa |
| Advisory YMYL estático al inicio del componente | ✅ | Líneas 16–20: texto completo del brief |
| Advisory YMYL en cada resultado | ✅ | Constante `ADVISORY` (línea 197) insertada en `renderResult()` |
| Escape HTML en contenido dinámico | ✅ | Función `escapeHtml()` aplicada a todos los datos dinámicos |
| Accesibilidad básica | ✅ | `role="group"`, `aria-label`, `aria-live="polite"` |
| Botón disabled hasta completar | ✅ | `submitBtn.disabled = !allAnswered(getAnswers())` |
| Sin fuga de datos del usuario | ✅ | Todo client-side y efímero |

---

## Verificación de outbound links del brief

| Artículo outbound (brief) | ¿Enlazado en cuerpo .mdx? | ¿Enlazado en checklist? |
|---|---|---|
| `fondo-emergencia-chile` | ✅ (líneas 73, 141) | ✅ (resultado `bloqueante`) |
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | ✅ (líneas 107, 244, 260) | ✅ (varios resultados) |
| `deposito-a-plazo-uf-vs-pesos` | ✅ (línea 165) | ✅ (resultado `horizonte`) |
| `fondos-mutuos-comisiones-rescate-impuestos` | ✅ (línea 201) | ❌ |
| `como-invertir-en-etfs-desde-chile` | ✅ (línea 185) | ❌ |

Los 5 outbound links del brief están presentes en el cuerpo del artículo. Los 2 ausentes del checklist no constituyen defecto: el checklist enlaza recursos pertinentes a cada resultado de preparación, no tiene la obligación de replicar todos los enlaces del cuerpo.

---

## Verificación del advisory YMYL (triple presencia)

| Ubicación | ¿Coincide con brief? |
|---|---|
| Cuerpo del artículo (líneas 77–80) | ✅ Texto base idéntico + oración adicional sobre asesor CMF (mejora) |
| Componente — estático (líneas 16–20) | ✅ Texto exacto del brief |
| Componente — cada resultado (línea 197) | ✅ Versión resumida suplementaria (el texto completo ya aparece estático) |

---

## Verificación de coherencia interna

| Par evaluado | Estado |
|---|---|
| Lead (5 preguntas) ↔ Lista numerada (líneas 84–88) ↔ Checklist (5 preguntas) | ✅ |
| §3.1 (fondo emergencia) ↔ Checklist P1 | ✅ |
| §3.2 (horizonte) ↔ Checklist P2 | ✅ |
| §3.3 (liquidez) ↔ Checklist P3 | ✅ |
| §3.4 (tolerancia) ↔ Checklist P4 | ✅ |
| §3.5 (tributación) ↔ Checklist P5 | ✅ |
| Tabla de escenarios ↔ Secciones de criterios | ✅ |
| FAQ "edad ideal" ↔ Posicionamiento (§1) | ✅ |
| FAQ "deudas" ↔ Excepciones comunes | ✅ |
| FAQ "capital mínimo" ↔ Escenario E4 | ✅ |
| FAQ "APV" ↔ Sección "Qué hacer" | ✅ |

---

## Verificación de TODO:SOURCE y deferral

| Item | Estado |
|---|---|
| ¿`TODO:SOURCE` en el blog file? | ❌ Ninguno |
| ¿`TODO:` de cualquier tipo en el blog file? | ❌ Ninguno |
| ¿Deferral injustificado (NORMA_YMYL §2.4)? | ❌ Ninguno. Todos los deferrals son legítimos: (a) condiciones tributarias cambiantes → remisión al SII/BCN; (b) condiciones contractuales variables → remisión al contrato/reglamento; (c) situación individual compleja → remisión a asesor registrado CMF |
| ¿Valores concretos del Verification Log no incluidos? | ✅ Correcto: exención de 13,5 UTA y 20 UTM NO se incluyen; solo se citan los artículos de la LIR |
| ¿idNorma correcto en todos los enlaces BCN? | ✅ 6368 en los 4 enlaces |

---

## Nota sobre gate 05 (MathAuditAgent)

`requires_calculation: false` y `math_audit_required: false` — confirmado. El artículo no contiene: cálculos de retorno, tasas de interés, proyecciones, montos en UF/UTM/CLP, fórmulas aritméticas, tablas de amortización ni promesas de rentabilidad. Los números presentes son exclusivamente umbrales heurísticos educativos (3, 12 meses), rangos descriptivos (2–4 años, +10 años) y escenarios hipotéticos de autoevaluación (20%, 30% en §3.4). **No se requiere escalar a MathAuditAgent.**

---

## Separation of Duties — Declaración completa

| Gate | Etapa | Agente / Rol | Sesión / Fecha | ¿Misma instancia que ComplianceAgent? |
|---|---|---|---|---|
| 01 | Brief | **Humano** — Carlos Ortega | 2026-06-25 | No |
| 02 | Research / Dossier | **ResearchAgent** (Claude Code) | 2026-06-25 (fetch real) | No — sesión independiente |
| 03 | Outline | **Agent** (Claude Code) | Previa a gate 04, mismo run_id | No — gate distinto |
| 04 | Draft | **DraftAgent** (Claude Code) | 2026-06-25 (run_id: 20260625-1405-ed016) | No — sesión independiente |
| 05 | Math Audit | N/A | — | N/A (`requires_calculation: false`) |
| **06** | **Compliance YMYL** | **ComplianceAgent** (Claude Code — sesión fresca, adversarial) | **2026-06-25** (re-auditoría) | **— (esta sesión)** |
| 07 | Publish Packet | **Humano** — editor | Pendiente | No — `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` |

**Conclusión SoD:** Separación de deberes preservada en todos los gates aplicables. ComplianceAgent (gate 06) ≠ DraftAgent (gate 04) ≠ ResearchAgent (gate 02). Editor humano (gate 07) independiente. **Sin violación de `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.**

---

## Veredicto final

**PASS — cero defectos, cero TODO:SOURCE, puntaje NORMA_YMYL 9.88/10 ≥ 9.5**

**Fundamento:**

El artículo cumple **todos** los MUST de NORMA_YMYL v1.0 sin excepciones:

1. ✅ Respuesta ancla concreta y afirmativa — las 5 preguntas en las primeras ~30 líneas (10/10)
2. ✅ Fuentes oficiales verificadas con fetch real del 2026-06-25; artículos de la LIR correctamente citados con idNorma=6368; definiciones CMF respaldadas por artículos específicos (9.5/10)
3. ✅ Vigencia explícita y coherente en cuerpo, frontmatter y footer (10/10)
4. ✅ Excepciones cubiertas con sección dedicada + FAQ + 4 escenarios + etiqueta de inferencia + definición de gastos esenciales (10/10)
5. ✅ Estructura clara sin secciones vacías, lenguaje accesible, componente seguro y autocontenido (10/10)

**No hay:**
- Recomendaciones personalizadas, rankings, carteras modelo ni promesas de rentabilidad
- Deferral injustificado (todos los deferrals califican bajo NORMA_YMYL §2.4)
- `TODO:SOURCE` ni marcadores `TODO:` de ningún tipo en el blog file
- Errores factuales en citas de la LIR o definiciones CMF
- Violación de separación de deberes
- Fuga de datos del usuario en el componente interactivo
- `PROMPT_INJECTION_CANDIDATE`

**Los 2 defectos de la auditoría anterior fueron resueltos completamente:**
1. ~~DEFECT #1 (MEDIUM) — TOC vacío~~ → Heading eliminado.
2. ~~DEFECT #2 (LOW) — "Gastos esenciales" sin definición~~ → Definición orientativa con ejemplos y exclusiones agregada (líneas 135–138).

**El artículo está listo para continuar a gate 07 (publish packet, editor humano).** Las tareas pendientes para el editor humano son: heroImage, confirmación de `pubDate`, sign-off final de gates, remoción de `draft: true`, y publicación. No se marca ningún gate en `07-publish-packet.md` — eso es exclusivo del editor humano.

---

**Fin del informe de compliance.**
