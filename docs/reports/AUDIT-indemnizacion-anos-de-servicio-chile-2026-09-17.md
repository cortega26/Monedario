# Auditoría de exactitud — `indemnizacion-anos-de-servicio-chile` (2026-09-17)

- **Artículo:** `src/data/blog/indemnizacion-anos-de-servicio-chile.md`
- **Slug:** `indemnizacion-anos-de-servicio-chile`
- **Tipo:** READ-ONLY. No se editó ningún archivo fuente. Este reporte es el único archivo creado.
- **Fecha de auditoría:** 2026-09-17 (UTC)
- **Frontmatter del artículo:** `pubDate: 2026-03-12`, `updatedDate: 2026-03-12`, `validAsOf: 2026-04-12`
- **Norma aplicada:** `docs/editorial/NORMA_YMYL.md` v1.0 (checklist §6 + scorecard §7)
- **Postura:** adversarial. Se intentó encontrar defectos contra fuente primaria.

## Veredicto

**FINDINGS — no apto para publicación sin correcciones.**

| Severidad | Cantidad |
| --------- | -------- |
| Alta      | 5        |
| Media     | 6        |
| Baja      | 3        |
| **Total** | **14**   |

- **NEEDS-HUMAN-VERIFY:** 8 (todo bloqueo bot de BCN LeyChile; nada rellenado desde memoria).
- **Gates de lectura:** todos en verde (detalle en §6); ninguno detecta estos defectos de fondo.
- **Matemática de ejemplos:** verificada correcta (detalle en §5).
- **Links internos / hero / volatileData:** sin roturas (detalle en §5).

## 1. Tabla de hallazgos

> Formato por hallazgo: afirmación + ubicación + severidad + evidencia/URL o NEEDS-HUMAN-VERIFY + fix sugerido.

### Severidad alta

#### F1 — Horas extra "habituales" como parte de la base: contradice la ley

- **Afirmación del artículo (L113):** "Incluye como regla general: sueldo base, **horas extraordinarias si son habituales**, gratificaciones proporcionales cuando corresponde."
- **Realidad primaria:** el art. 172 excluye taxativamente los "pagos por sobretiempo", y la DT instruye que las horas extra **no** se incluyen **aun pagadas mensualmente**.
- **Evidencia:**
  - SUSESO (espejo oficial del articulado), art. 172: "con exclusión de la asignación familiar legal, **pagos por sobretiempo** y beneficios o asignaciones que se otorguen en forma esporádica o por una sola vez al año" — <https://www.suseso.gob.cl/612/w3-propertyvalue-69871.html>
  - DT, consulta "¿Cuáles son las remuneraciones…?": "aun cuando sean pagados en forma mensual **no deben incluirse: Las horas extras**…" — <https://dt.gob.cl/portal/1628/w3-article-60585.html> (fetcheado 2026-09-17)
- **Fix sugerido:** mover horas extra a la lista de exclusiones citando art. 172 + DT 60585. Verificar si la calculadora del sitio replica el error (fuera de alcance de este audit, se deja como NHV-8).

#### F2 — Omite el tope de 90 UF a la base de cálculo en la sección de fórmula

- **Afirmación/omisión (L84–L107, L119–L123):** la fórmula "30 días × años (máx. 11)" se presenta sin el tope del art. 172 inc. final: "no se considerará una remuneración mensual superior a **90 UF del último día del mes anterior al pago**". Las 90 UF solo aparecen en el FAQ tributario, encuadradas como exención de impuesto, no como tope de la base legal.
- **Evidencia:** SUSESO, art. 172, inc. final (mismo URL que F1); DT, "¿Tiene algún límite el monto…?": "El límite… es de 90 UF" — <https://www.dt.gob.cl/m/1620/w3-article-60604.html> (no fetcheado en cuerpo; ABSTRACT verificado por snippet — confirmar en refresh).
- **Impacto:** para rentas altas el ejemplo del artículo sobrestima la indemnización legal.
- **Fix sugerido:** agregar el tope a la fórmula + fecha de medición de la UF + ejemplo con renta > 90 UF.

#### F3 — Omite el requisito mínimo de 1 año de vigencia del contrato

- **Omisión (L56–L64, L70–L73):** la "regla base" nunca exige que el contrato haya estado vigente **un año o más**. Un lector con 8 meses despedido por necesidades concluiría que le corresponde proporcional.
- **Evidencia:** DT, "¿Cuándo existe el derecho…?": "Existe el derecho cuando el contrato de trabajo **ha durado un año o más**… y, además, la causal… es necesidades de la empresa o el desahucio" — <https://www.dt.gob.cl/portal/1628/w3-article-60593.html> (fetcheado 2026-09-17). SUSESO, art. 163 inc. 1: "Si el contrato hubiere estado vigente **un año o más**…" — <https://www.suseso.gob.cl/612/w3-propertyvalue-69844.html>
- **Fix sugerido:** primera condición de elegibilidad en la regla base + nota de que la fracción > 6 meses opera **después** del primer año.

#### F4 — "Término de obra: no corresponde" — desactualizado desde Ley 21.122 (2018)

- **Afirmación del artículo (L79):** "Vencimiento del plazo o término de obra (art. 159 N°4 y N°5)" → "No corresponde como regla general".
- **Realidad primaria:** el art. 163 inc. 3–4 establece para contrato **por obra o faena vigente un mes o más**, terminado por la causal del art. 159 N°5, una indemnización de **2,5 días de remuneración por cada mes trabajado y fracción superior a 15 días** (base art. 172).
- **Evidencia:** SUSESO, art. 163, inc. 3–4 (mismo URL que F3, fetcheado 2026-09-17).
- **Fix sugerido:** corregir la fila N°5 con la indemnización de obra/faena, requisitos (≥ 1 mes, causal N°5) e incompatibilidad con art. 168 inc. 1. Es el mismo patrón "procedimiento desactualizado" del pilot sibling.

#### F5 — Recomienda la vía judicial (art. 160 → 168) pero omite la caducidad de 60 días hábiles

- **Afirmación del artículo (L143–L144 + L150):** ante causal disciplinaria falsa, "corresponde indemnización… más recargos… Este camino requiere acción judicial"; el único plazo dado es "prescripción… de 2 años".
- **Realidad primaria:** el art. 168 inc. 1 da **60 días hábiles desde la separación** para recurrir al juzgado (suspendible por reclamo ante la Inspección, con tope absoluto de **90 días hábiles**). El plazo de 2 años (art. 510) es la prescripción general, no la caducidad de esta acción.
- **Evidencia:** SUSESO, art. 168, inc. 1 y final (verbatim 60/90 días hábiles) — <https://www.suseso.gob.cl/612/w3-propertyvalue-69859.html> (fetcheado 2026-09-17).
- **Impacto:** lector que espera "hasta 2 años" pierde la recalificación y sus recargos.
- **Fix sugerido:** cuadro de plazos doble (60/90 días acción art. 168 vs. 2 años prescripción general art. 510) con cita. NHV-5 cubre confirmación BCN del art. 510.

### Severidad media

#### F6 — Colación/movilización "puede excluirse" invierte el default de la DT

- **Afirmación (L115):** "Puede excluirse… asignaciones no imponibles como colación o movilización".
- **Realidad primaria:** la DT incluye **colación, movilización, cheques restaurant, desgaste de herramientas y viáticos si se pagan mensualmente**; la exclusión del art. 41 inc. 2° exige condiciones (compensar gasto efectivo, etc., calificadas caso a caso). El default para asignaciones mensuales fijas es **inclusión** (Dictamen 6305/418).
- **Evidencia:** DT 60585 (mismo URL que F1): "debe incluirse, entre otros… asignaciones de colación y movilización… Lo mismo ocurre… si tales beneficios son pagados en forma mensual".
- **Fix sugerido:** reescribir como regla mensualidad-primero + excepción condicionada + derivación a Inspección/asesoría para casos límite.

#### F7 — Omite la regla de remuneraciones variables (promedio 3 meses)

- **Afirmación (L115–L117):** "comisiones que varían… tratamiento especial… conviene pedir la fórmula exacta que usó el empleador".
- **Realidad primaria:** regla concreta y pública: art. 172 inc. 2 — "promedio percibido… en los **últimos tres meses calendario**". Deferir al empleador sin dar la regla es deferral injustificado (§2.4 NORMA).
- **Evidencia:** SUSESO art. 172 (URL F1); DT Ord. 2387/2015 y 4563/2016 citan el mismo texto.
- **Fix sugerido:** agregar la regla de 3 meses + ejemplo mínimo.

#### F8 — Recargos del art. 168 sin porcentajes

- **Afirmación (L73, L144):** "pueden corresponder recargos" — sin cifras.
- **Realidad primaria:** tabla pública: **30%** (161 improcedente), **50%** (159 injustificada o sin causal), **80%** (160 indebida), **100%** (160 N°1/5/6 carente de motivo plausible).
- **Evidencia:** SUSESO art. 168 letras a)–c) + inc. 100% (URL F5).
- **Fix sugerido:** tabla de recargos con letras del artículo, etiquetada "resumen orientativo".

#### F9 — Omite el desahucio como causal habilitante

- **Omisión (L70–L73):** lista solo necesidades (161) e injustificado (168). La DT condiciona el derecho a "**necesidades de la empresa o el desahucio** del empleador" (art. 161).
- **Evidencia:** DT 60593 (URL F3).
- **Fix sugerido:** agregar desahucio con nota de alcance (cargos de confianza / casa particular según régimen).

#### F10 — Brechas NORMA YMYL: vigencia invisible, sin etiqueta orientativa, fuentes genéricas

- **Vigencia (MUST 3):** `validAsOf: 2026-04-12` vive solo en frontmatter; el cuerpo no muestra "Vigencia:" ni "Última revisión". La plantilla §2.3 (regla + excepciones + vigencia + fuentes) no aparece en la primera sección útil.
- **Inferencias (§3.2):** la síntesis de causales (L70–L80) es síntesis jurídica sin la etiqueta obligatoria "resumen orientativo" + limitadores (el `articleAdvisory` genérico no sustituye el texto normativo).
- **Fuentes (MUST 4):** `officialSources` apunta a raíces genéricas (`bcn.cl/leychile/navegar?idNorma=207436`, `dt.gob.cl/portal/1626/w3-channel.html`) en vez de deep links a las consultas/articulados que sí respaldan cada regla (DT 60593, DT 60585, SUSESO 69844/69871, SII ja009).
- **Fix sugerido:** bloque Respuesta rápida visible con vigencia + deep links por regla + nota orientativa verbatim.

#### F11 — FAQ tributario 90 UF impreciso y sin citas

- **Afirmación (L147):** "hasta el límite de 90 UF por año trabajado está exenta de IUSC. Lo que supere ese tope puede quedar afecto."
- **Realidad primaria (SII, Ord. N°009/2017):** (i) las indemnizaciones del art. 178 CT (legales + colectivas) **no constituyen renta**; (ii) el tope 90 UF es del **art. 172** y aplica a la base de la indemnización **legal**; (iii) el exceso asume carácter de **voluntaria** y tributa por art. 17 N°13 LIR (promedio 24 meses, excl. gratificaciones/participaciones/bonos, reajustado por IPC; IUSC art. 46 devengado en 12 meses); (iv) falta la fecha de medición (UF del **último día del mes anterior al pago**).
- **Evidencia:** SII, Ord. N°009 de 05-01-2017 — <https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/ley_impuesto_renta/2017/ja009.htm> (fetcheado 2026-09-17).
- **Fix sugerido:** reescribir con distinción legal/pactada/voluntaria + medición UF + citas SII (Ord. 009, Circ. 29/1991, Circ. 10/1999) + mantener derivación a asesoría solo para el caso individual.

### Severidad baja

#### F12 — "El tope de 11 es el piso… no el techo": redacción invertida

- **Ubicación (L123).** El tope legal es un **máximo** del régimen supletorio (330 días); lo que la ley protege como piso es que el pacto **no puede ser inferior** (art. 163 inc. 1: el pacto rige "siempre que… fuere de un monto superior"). Decir que el tope "es el piso" confunde.
- **Fix sugerido:** "El tope de 11 años es el máximo del régimen legal supletorio; las partes pueden pactar más (el pacto solo reemplaza a la regla legal si la supera)."

#### F13 — `validAsOf` (2026-04-12) un mes posterior a `updatedDate` (2026-03-12) sin traza

- **Ubicación:** frontmatter L7–L8 vs. L29. Publicación y última actualización idénticas; la fecha de vigencia es un mes posterior sin bump de `updatedDate` ni línea de registro (§5 NORMA). `reviewPolicy.computedAt: 2026-05-06` es posterior a ambas.
- **Fix sugerido:** al refrescar, alinear `updatedDate` = fecha del cambio sustantivo + 1 línea de registro (qué cambió / por qué / fuentes).

#### F14 — Cobertura: excepciones y plazos útiles omitidos

- **Omitidos:** (i) trabajadores contratados **antes del 14-08-1981** sin tope de 11 años (régimen transitorio — confirmar en NHV-6); (ii) **casa particular**: indemnización a todo evento 1,11% (art. 163 inc. final, 165–166); (iii) finiquito a disposición dentro de **10 días hábiles** (DT 60593).
- **Fix sugerido:** fila de excepciones breves con las tres notas.

### Observación fuera de alcance (no cuenta en el veredicto; no se edita)

- **OBS-1:** `src/data/laws/codigo-del-trabajo.md` L75 atribuye el desahucio al "Art. 163" (es art. 161) y L76 da recargos de "20–80%" (la tabla real es 30/50/80/100% + 100% calificado). Misma clase de defecto que el pilot sibling; corregir en tarea separada con ADR si aplica.
- **OBS-2:** el pilar `finiquito-e-indemnizaciones-en-chile.md` L81 ("Si la antigüedad tiene meses incompletos, se paga proporcional") contradice el art. 163 (fracción **> 6 meses = año completo**, no proporcional) y al artículo auditado (L100, correcto). Incoherencia interna del clúster (MUST 8 a nivel clúster).

## 2. Checklist NORMA YMYL (§6) aplicada

| #   | Criterio                                              | Resultado |
| --- | ----------------------------------------------------- | --------- |
| 6.1 | Respuesta rápida con número/regla concreta            | Parcial — `articleLead.answer` existe en frontmatter; el cuerpo no replica la plantilla §2.3 con vigencia+fuentes visibles |
| 6.1 | Responde la query sin meta-proceso                    | Sí |
| 6.1 | Excepciones enumeradas                                | Parcial — faltan 1 año mínimo, desahucio, obra/faena 2,5 días, 90 UF base, casa particular, pre-1981 |
| 6.2 | Cada regla crítica con fuente oficial                 | Parcial — fuentes genéricas; sin deep links; sin citas SII/172/168 |
| 6.2 | Vigencia / marco temporal                             | No — solo frontmatter, invisible en cuerpo |
| 6.2 | Sin contradicciones internas                          | No — F1 contradice art. 172; OBS-2 contradice al pilar |
| 6.2 | Deferrals justificados (§2.4)                         | No — F7/F8 difieren datos públicos fetcheables |
| 6.3 | Reformas aprobado/vigencia/implementación             | N/A — el artículo no menciona reformas (correcto no inventarlas) |
| 6.4 | Síntesis marcada "orientativo" + limitadores          | No — ver F10 |
| 6.5 | `updatedDate` solo ante cambio sustantivo + coherente | Observado — ver F13 (sin cambio desde 2026-03-12, correcto no haberlo tocado; la anomalía es el `validAsOf` huérfano) |

**Scorecard indicativo (§7):** respuesta ancla 6/10 · precisión+fuentes 5/10 · vigencia+calendario 5/10 · excepciones+cobertura 5/10 · claridad+estructura 7/10 → **≈ 5,6/10** (lejos del umbral 9,5). Es indicativo, no gate formal.

## 3. Freshness assessment

- **Régimen:** `empleo-ingresos`, `manual_review`, cadencia 180 días.
- **ReviewDate efectiva:** 2026-04-12 (`validAsOf`) → **vence 2026-10-09** (22 días desde la auditoría; `daysSinceReview: 158`).
- **Gate `check-editorial-timeliness`:** verde hoy (`stale=0, drift=0`), pero el artículo lleva **~189 días sin cambio sustantivo** (desde 2026-03-12) y entra en ventana de refresh.
- **Sin `volatileData` declarado y `dataTriggers: []`:** coherente — las cifras duras están en UF (90 UF) o son ilustrativas ($950.000). No hay deriva de snapshot.
- **Reformas:** ninguna reforma aprobada que cambie los arts. 163/172/168 detectada en esta auditoría. Existe iniciativa parlamentaria para eliminar el tope de 330 días (Cámara, ficha 82391, citada en búsqueda) — **no aprobada**: no debe aparecer como vigente; como máximo, nota de seguimiento legislativo verificada (NHV-7).
- **Conclusión:** refresh sustantivo **debido ahora** (no por SLA vencido sino por 5 altas + ventana de 22 días). El refresh debe actualizar `updatedDate` + registro de 1 línea (§5 NORMA).

## 4. NEEDS-HUMAN-VERIFY (8)

LeyChile bloquea bots (verificado: `bcn.cl/leychile/navegar?idNorma=207436` devuelve shell JS sin texto). Nada abajo se rellenó desde memoria; todo requiere confirmación humana en texto completo BCN salvo espejo oficial indicado.

| #     | Qué confirmar                                                            | URL exacta                                                                                          | Estado en este audit                                           |
| ----- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| NHV-1 | Art. 163 texto vigente: 1 año mínimo, 30 días, fracción > 6 meses, 330 días, 2,5 días obra/faena, casa particular | <https://www.bcn.cl/leychile/navegar?idNorma=207436> (art. 163)                                     | Corroborado por espejo oficial SUSESO 69844, pendiente canónico |
| NHV-2 | Art. 172 texto vigente: base, exclusiones, promedio 3 meses variables, 90 UF último día mes anterior | Misma norma BCN (art. 172) + <https://www.suseso.gob.cl/612/w3-propertyvalue-69871.html>             | Corroborado por espejo SUSESO + DT Ords. 2387/4563 (snippets)   |
| NHV-3 | Arts. 159/160/161 numerales y desahucio inc. 2°                           | Misma norma BCN (arts. 159–161)                                                                     | Mapeo del artículo plausible pero no verificado en canónico     |
| NHV-4 | Art. 168: recargos 30/50/80/100% + 60/90 días hábiles                    | Misma norma BCN (art. 168) + <https://www.suseso.gob.cl/612/w3-propertyvalue-69859.html>             | Corroborado por espejo SUSESO verbatim                          |
| NHV-5 | Art. 510 inc. 1°: prescripción 2 años desde exigibilidad                 | Misma norma BCN (art. 510)                                                                          | Afirmación del artículo plausible, no verificada en canónico    |
| NHV-6 | Excepción pre-14.08.1981 sin tope (art. transitorio) + art. 178 y 17 N°13 LIR texto completo | BCN CT transitorios + <https://www.sii.cl/pagina/actualizada/noticias/2002/dl824.htm> (vía SUSESO 187173 parcial) | Parcial (UChile RET + SII Ord. 009); falta canónico |
| NHV-7 | Status iniciativa elimina-tope-330-días (Cámara ficha 82391) y Ley 21.122 vigencia obra/faena | <https://camara.cl/verDOC.aspx?prmFICHATIPO=DIP&prmID=82391&prmLOCAL=0&prmTipo=FICHAPARLAMENTARIA>    | Solo snippet; no citar como vigente                             |
| NHV-8 | Lógica de `/calculadoras/finiquito-indemnizacion/` (¿aplica 90 UF? ¿excluye horas extra? ¿exige 1 año?) | `src/pages/calculadoras/finiquito-indemnizacion.astro`                                              | No auditada (fuera de alcance); riesgo de replicar F1–F3        |

## 5. Verificaciones que sí cerraron

- **Ejemplos numéricos:** $950.000 × 7 = **$6.650.000** ✓; × 8 = **$7.600.000** ✓; diferencia $950.000 ✓. Regla de borde bien aplicada (4 meses no suma; 8 meses sí). 330/30 = 11 años ✓.
- **Links internos (4/4 resuelven; gate `check-internal-links` verde, 267 links, 0 rotos):** `/posts/finiquito-e-indemnizaciones-en-chile/` (pilar existe) · `/calculadoras/finiquito-indemnizacion/` (`src/pages/calculadoras/finiquito-indemnizacion.astro` existe) · `/glosario/gratificacion/` (`src/data/glossary/gratificacion.md` existe; resuelve por gate) · `/guias/uf-costo-de-vida/` (`src/pages/guias/uf-costo-de-vida/` existe).
- **Hero image:** `public/images/hero/indemnizacion-anos-de-servicio-chile.avif` + variantes `@mobile`/`@tablet` existen; gate `check-hero-images` verde (53/53).
- **Frontmatter:** `check-frontmatter` OK (53 artículos, 0 errores de bloqueo). Cluster `empleo-ingresos` + `topicRole: support` + `canonicalTopic: finiquito-indemnizaciones` consistente con el pilar (`topicRole: owner`, mismo `canonicalTopic`). GTM bidireccional pilar↔apoyo presente en ambos `articleLead`.
- **`volatileData`:** ausente con `dataTriggers: []` — aceptable (sin cifras CLP duras propias; 90 UF en UF; ejemplos ilustrativos).

## 6. Gates de solo lectura (salida verbatim)

- `node scripts/check-frontmatter.mjs` → `[check-frontmatter] OK (no blocking errors).` (53 artículos; exit 0)
- `node scripts/check-editorial-structure.mjs` → WARN no bloqueante **ajeno al artículo**: 2 descripciones largas (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`) + 2 warnings intra-clúster de esos mismos archivos. Target sin warnings. (exit 0)
- `node scripts/check-dialect.mjs` → `[check-dialect] OK. validated=53 files` (exit 0)
- `node scripts/check-editorial-timeliness.mjs` → `published=53 stale=0 drift=0` (exit 0). Registro del target: `reviewDate 2026-04-12, dueDate 2026-10-09, daysSinceReview 158, daysUntilDue 22, cadenceDays 180, sourceMode manual_review`.
- `node scripts/check-internal-links.mjs` → `Scanned 53 published articles, 267 internal links. No broken links found.` (exit 0)
- `node scripts/check-legal-citations.mjs` → `OK. laws=23 blog=53 pages=63 registry=21` (exit 0)
- `node scripts/check-official-host-registry.mjs` → `OK. hosts=38` (exit 0)
- `node scripts/check-hero-images.mjs` → `OK` 53/53 (exit 0)

## 7. Qué exigiría un refresh (lista explícita)

1. Reescribir § base con las **4 condiciones de elegibilidad** (1 año mínimo · causal 161 incl. desahucio · 30 días última remuneración · fracción > 6 meses) + tope 330 días/11 años + tope 90 UF con fecha de medición UF.
2. Corregir fila N°5 (obra/faena 2,5 días/mes, requisitos e incompatibilidad art. 168) y agregar fila desahucio.
3. Reescribir § "última remuneración" según art. 172 + DT 60585: horas extra a exclusiones; colación/movilización por regla de mensualidad; gratificación mensual sí / anual no; variables = promedio 3 meses + ejemplo.
4. Tabla de recargos art. 168 (30/50/80/100) + cuadro de plazos (60/90 días hábiles vs. 2 años art. 510) en el FAQ judicial.
5. Reescribir FAQ tributario con distinción art. 178 / art. 172 / art. 17 N°13 + medición UF + citas SII (Ord. 009/2017, Circ. 29/1991, Circ. 10/1999).
6. Agregar bloque visible "Respuesta rápida (regla general) / Excepciones / Vigencia / Fuentes" con deep links (DT 60593, DT 60585, SUSESO 69844/69871/69859, SII ja009) + nota "resumen orientativo" verbatim en la síntesis de causales.
7. Corregir redacción F12; agregar excepciones F14; alinear `updatedDate` + registro §5; resolver NHV-1–7 contra BCN/SII en sesión de refresh (separación de deberes: quien redacte no audita).
8. Derivadas recomendadas (otras tareas, no este refresh): corregir OBS-1 (leyes registry) y OBS-2 (pilar "proporcional"); auditar la calculadora (NHV-8).

## 8. Fuentes primarias fetcheadas en esta auditoría (con fecha de recupero 2026-09-17)

1. DT — "¿Cuándo existe el derecho a la indemnización por años de servicio?" — <https://www.dt.gob.cl/portal/1628/w3-article-60593.html> (últ. mod. 07/10/2021)
2. DT — "¿Cuáles son las remuneraciones…?" — <https://dt.gob.cl/portal/1628/w3-article-60585.html> (últ. mod. 07/10/2021)
3. SUSESO — CT art. 163 (texto) — <https://www.suseso.gob.cl/612/w3-propertyvalue-69844.html>
4. SUSESO — CT art. 168 (texto, recargos + 60/90 días) — <https://www.suseso.gob.cl/612/w3-propertyvalue-69859.html>
5. SII — Ord. N°009/2017 (90 UF, art. 178 vs. 17 N°13) — <https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/ley_impuesto_renta/2017/ja009.htm>
6. Vía snippet (no cuerpo): SUSESO art. 172 — <https://www.suseso.gob.cl/612/w3-propertyvalue-69871.html>; DT Ords. 2387/2015, 4563/2016; DT "¿Tiene algún límite…?" 60604.

_BCN LeyChile devuelve app-shell JS a bots: todo lo BCN-dependiente quedó en NHV, sin rellenar desde memoria._
