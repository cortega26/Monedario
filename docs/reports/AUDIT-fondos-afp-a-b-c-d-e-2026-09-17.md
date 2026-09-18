# Auditoría adversarial — fondos-afp-a-b-c-d-e (2026-09-17)

**Slug:** `fondos-afp-a-b-c-d-e`
**Archivo:** `src/data/blog/fondos-afp-a-b-c-d-e.md`
**Tipo:** read-only. No se editó ningún archivo existente. Único output: este reporte.
**Fecha de auditoría:** 2026-09-17. **Cutoff del artículo auditado:** `validAsOf 2026-04-12` / `updatedDate 2026-03-12`.
**Veredicto:** **FINDINGS — 2 alta / 4 media / 8 baja (14 hallazgos). 4 NEEDS-HUMAN-VERIFY (todo BCN-dependiente).**

Matiz de equidad importante: al corte `validAsOf 2026-04-12` el bloque 2025-2027 era correcto (la tasa 1 % rigió hasta julio de 2026). Los 2 hallazgos altos son **staleness factual en producción hoy**, no fabricación original. El gate de timeliness no los detectó (§8, F14).

## 1. Frontmatter y señales de frescura (inventario)

| Campo | Valor | Observación |
|---|---|---|
| `title` / `seoTitle` | "Fondos AFP A, B, C, D y E: diferencias, riesgo y cuál te conviene" / "Fondos AFP A, B, C, D y E: Cuál Elegir \| Monedario" | OK |
| `description` | Explicación clara de los fondos AFP… | OK (sin warning de largo en gate) |
| `pubDate` | 2026-02-23T11:00:00Z | OK |
| `updatedDate` | 2026-03-12T19:08:00Z | Ver F13: anterior a `validAsOf` |
| `slug` | fondos-afp-a-b-c-d-e | OK, coincide con filename |
| `featured / lang / draft` | true / es-CL / false | OK |
| `category / cluster` | `prevision / pensiones-afp` | OK, cluster endurecido declarado |
| `topicRole / canonicalTopic` | `owner / elegir-fondos-afp` | OK: registrado en `src/config/editorial-topic-policy.mjs:101-102` con `ownerSlug: "fondos-afp-a-b-c-d-e"` |
| `heroImage` | `/images/hero/fondos-afp-a-b-c-d-e.avif` | OK: existen base + `@mobile` + `@tablet` en `public/images/hero/` |
| `articleLead.answer` | "En 2026 los multifondos A, B, C, D y E siguen vigentes…" | Núcleo verificado (V5); resto del bloque 2025-2027 hoy falso (F1, F2) |
| `articleLead.validAsOf` | 2026-04-12 | Desfasado ~5 meses al 2026-09-17; tabla "Hoy" congelada a esa fecha |
| `articleLead.officialSources` | SPensiones + BCN Ley 21.735 | Formalmente OK; **falta link a DL 3500 / página SP de multifondos** para la sección de límites (F3–F4 contexto, MUST 4) |
| `articleLead.covers / limits` | 3 covers / 3 límites | OK en forma |
| `reviewPolicy` | `semiannual / maxDays 180`, `dataTriggers: []`, `computedAt 2026-05-06` | Ver F5: triggers vacíos |
| `volatileData` | ausente (timeliness reporta `volatileData: []`) | Ver F5 |
| Timeliness gate | `reviewDate 2026-04-12, dueDate 2026-10-09, stale false, daysUntilDue 22` | No stale por gate, pero stale semántico real (F1, F2) |

## 2. Checklist NORMA_YMYL v1.0 + CONTRACT.YMYL_RESPONSE_STRUCTURE

| Requisito | Estado |
|---|---|
| MUST 1 Respuesta ancla ≤ 2 pantallas con regla concreta | Parcial: `articleLead.answer` trae regla concreta, pero el bloque operativo (tasa empleador) es hoy incorrecto (F1, F2) |
| MUST 2 Regla afirmativa | Cumple en forma |
| MUST 3 Vigencia explícita | Parcial: `validAsOf` + fechas 2026/2027 presentes, pero expiradas en efecto (F1, F2) |
| MUST 4 ≥1 fuente oficial por regla crítica YMYL | **Parcial-bajo**: bloque reforma cita 3 fuentes oficiales; **sección de límites A–E, asignación por defecto y dato 2008 no citan ninguna** (F9–F11) |
| MUST 5 Excepciones relevantes | **Falla**: restricciones legales de elección omitidas por completo (F3) |
| MUST 6 Separar aprobación / vigencia / implementación (reformas) | **Falla**: sin capa de aprobado ni de vigencia legal; fila "Vigencia general" mal etiquetada (F4) |
| MUST 7 Síntesis jurídica etiquetada "resumen orientativo" | Parcial: sección edad **sí** la trae (L173); tabla calendario 2025-2027 **no** (F12) |
| MUST 8 Coherencia interna | Cumple (sin contradicciones internas; el problema es contra la realidad) |
| MUST 9 Frontmatter y frescura | Parcial (F5, F13) |
| SHOULD interlinking | Cumple: 4 links internos en cuerpo, todos resuelven (§5). Observación menor: bloque "Si tu duda real es otra" (L55-59) menciona reforma/APV/proyección **sin links** |

## 3. Tabla de hallazgos

| # | Afirmación + ubicación | Sev. | Evidencia / URL o NEEDS-HUMAN-VERIFY | Fix sugerido |
|---|---|---|---|---|
| F1 | L70 + L79 (tabla): "desde **agosto de 2027** el aporte adicional del empleador sube a **3,5 %**" | alta | **Falso (un año de desfase).** Fuente primaria SP `w3-propertyvalue-10906.html`: "**A partir del 1 de agosto de 2026 y hasta julio de 2027** la cotización de cargo del empleador será de **3,5 %**: un 0,1 % irá a la cuenta de capitalización individual obligatoria en la AFP y el resto al FAPP (2,5 % SIS+CEV, 0,9 % CRP→BAC)". Recuperado 2026-09-17 | Reescribir fila: "Agosto 2026 → 3,5 % (0,1 % cuenta individual + 2,5 % SIS/CEV + 0,9 % CRP)". Citar SP con fecha de recuperación |
| F2 | L66-67: "Qué cambia hoy (2026): La cotización adicional del empleador ya comenzó en **1 %** (agosto 2025)" | alta | **Falso al 2026-09-17.** Misma fuente primaria: "entre el 1 de agosto de 2025 y julio de 2026 el aporte del empleador **fue** de 1 %" (pretérito). Desde remuneraciones de agosto 2026 (pago septiembre 2026) rige 3,5 %. Correcto al corte 2026-04-12; falso hoy | Actualizar bullet "Hoy" a 3,5 % con desglose; mover `validAsOf`; registrar calendario como dato volátil o trigger fechado (F5) |
| F3 | Omisión total §"¿Puedo cambiar de fondo?" + guía por edad: **cero mención a restricciones legales de elección** | media | Fuente primaria SP `w3-propertyvalue-9909.html` (literal): "a partir de los **51 años** en el caso de las mujeres y de los **56 años** en el caso de los hombres **no podrán elegir el Fondo A**… Asimismo, las **pensionadas y los pensionados sólo pueden elegir los fondos C, D y E**". Un lector de 58 años puede concluir que el Fondo A está disponible | Agregar bloque de restricciones con cita SP; cruzar con guía por edad (conservadora y compatible, pero incompleta sin la prohibición) |
| F4 | Bloque "Qué cambia entre 2025 y 2027" sin capa **aprobado (ley/norma)** ni **rige (vigencia legal)**; fila "Vigencia general de la reforma \| Septiembre 2025" | media | CONTRACT.YMYL_RESPONSE_STRUCTURE exige aprobado / rige / se implementa / hoy-vs-después. El artículo solo tiene hoy-vs-después. La etiqueta "Vigencia general … Septiembre 2025" es una afirmación de vigencia legal sin fuente y plausiblemente errónea (evidencia hermana apunta a vigencia general diferida al 01-04-2027 — ver NHV-3). Ley 21.735: promulgada 20-03-2025, publicada 26-03-2025 | Agregar las dos capas con citas BCN verificadas por humano (NHV-2, NHV-3); re-etiquetar o eliminar la fila "Vigencia general" |
| F5 | Sin `volatileData`; `reviewPolicy.dataTriggers: []` | media | Timeliness confirma `volatileData: []`. Tasa empleador (F1/F2) y fecha FG son el caso paradigmático de dato volátil; el registry (`src/config/editorial-volatile-data-registry.json`) no tiene dataset de calendario previsional (mismo gap estructural que auditoría hermana) | Opción A: dataset `pensions.reform.employer_schedule` + `pensions.reform.generational_transition` (fuente canónica SP) con dependencia declarada. Opción B (mínimo): `dataTriggers` fechados (ago-2026, sep-2026, abr-2027). Decisión humana |
| F6 | §transición describe FG en una línea ("revisar ese cronograma por separado") cuando ya existe **diseño público concreto** posterior al corte | media | Fuente primaria SP `w3-article-17076.html` (Santiago, 03/07/2026, post-corte): reemplazo de multifondos por **10 FG** asignados por **año de nacimiento** (1 Inicial ≤35, 8 intermedios en cohortes de 5 años, 1 Consolidación 75+), glide path, carteras de referencia; consulta cerró 31-07; "**fecha máxima de publicación** [del Régimen] el **1 de septiembre de 2026**… en **abril de 2027** se producirá la transición". A 7 meses de la migración, el lector no recibe ningún contenido accionable | Ampliar bloque 2027 con diseño 10-FG (propuesta en consulta → verificar si Régimen definitivo ya publicado en sep-2026 al refrescar) + link SP-17076; no mezclar elección vigente hoy con asignación por cohorte futura |
| F7 | L179: "Menores de **35 años** → Fondo B" (límite excluyente) | baja | Fuente primaria SP `w3-propertyvalue-9909.html`, tabla asignación por defecto: "**Mujeres hasta 35 años y hombres hasta 35 años** → B; 36-50 / 36-55 → C; desde 51 / desde 56 → D". "Hasta 35" incluye los 35; "menores de 35" los excluye | Reescribir: "35 años o menos → B" |
| F8 | L119: Fondo C "es también el fondo **por defecto para la mayoría**" | baja | Misma tabla SP: C es default **solo del tramo medio** (36-50/36-55). "Mayoría" no verificado contra padrón por fondo en esta auditoría | Matizar: "el default del tramo medio, el más numeroso" solo con cifra SP, o eliminar "mayoría" |
| F9 | FAQ L212-214: "El Fondo C concentra la mayor parte de los afiliados" | baja | Afirmación estadística **sin fuente citada**; no verificada contra Ficha Estadística Previsional SP en esta auditoría | Citar SP (afiliados por fondo, mes) con fecha, o degradar a "suele concentrar" |
| F10 | L141: "Durante la crisis de 2008 [el Fondo A] llegó a perder **más de 40 %**" | baja | Cifra histórica **sin fuente citada**; no verificada contra rentabilidad histórica SP en esta auditoría (corroboración cualitativa secundaria: AFP Capital 2020-06-24 señala que en 2008-2009 el fondo A tardó 12-18 meses en recuperarse; insuficiente para el número) | Citar serie SP de rentabilidad real anual por fondo 2008 con fecha de recuperación, o retirar el número |
| F11 | L187: cambio de fondo "**gratuito e ilimitado**… cuantas veces quieras sin costo" | baja | Sin fuente primaria recuperada en esta auditoría (la búsqueda devolvió norma de cambio de **AFP**, trámite distinto). Costo/frecuencia del traspaso **entre fondos de la misma AFP** queda sin respaldo | Citar norma SP o ficha ChileAtiende del traspaso entre fondos al refrescar; distinguir de cambio de AFP |
| F12 | Tabla-calendario L74-79 sintetiza la ley sin etiqueta "resumen orientativo" | baja | NORMA_YMYL §3.2 exige etiqueta + limitador en tablas de impacto (la sección de edad L173 sí la trae — inconsistencia interna de aplicación) | Agregar nota estándar bajo la tabla |
| F13 | `validAsOf 2026-04-12` posterior a `updatedDate 2026-03-12` | baja | Mismo patrón que auditoría hermana: la fecha de vigencia declarada es posterior a la última revisión declarada; sugiere `validAsOf` movido sin `updatedDate` | Al refrescar, alinear `updatedDate ≥ validAsOf` |
| F14 | Gate `stale=false` (due 2026-10-09, 22 días) con F1/F2 falsos hoy | baja | Timeliness verbatim §8: el gate mide edad, no verdad | Considerar nota de deuda: gate de edad no captura staleness de calendario (revisión humana anual de agosto, ver F5) |

## 4. Verificado OK contra primaria (resumen, con literal)

- **V1. Límites renta variable A–E: todos exactos.** SP `w3-propertyvalue-9909.html`: "Fondo A 80 %/40 %; B 60 %/25 %; C 40 %/15 %; D 20 %/5 %; E 5 %/0 %" (máx./mín.). Artículo: E máx 5 % ✓, D máx 20 % ✓, C 15–40 % ✓, B máx 60 % ✓, A máx 80 % ✓.
- **V2. Asignación por defecto por edad (bandas, salvo borde F7).** Misma tabla SP: B ≤35, C 36-50/36-55, D desde 51/56 ✓.
- **V3. Máximo dos fondos.** SP-9909: "debe optar por **uno o hasta dos** fondos"; FAQ: "pueden permanecer **hasta en dos** tipos de fondos distintos" ✓ (ejemplo 50/50 del artículo compatible).
- **V4. Cotización obligatoria 10 %.** SP-10906: "actual cotización individual obligatoria de **10 %**" ✓.
- **V5. Multifondos vigentes en 2026; transición abril 2027.** SP `w3-article-16668.html` (07/08/2025): "en **abril de 2027** tendrá lugar la **transición del actual esquema de multifondos** a los Fondos Generacionales" ✓. Lead answer "siguen vigentes" veraz al 2026-09-17.
- **V6. 1 % ago-2025 como historia.** SP-10906: "entre el 1 de agosto de 2025 y julio de 2026 el aporte… **fue** de 1 % (0,1 % individual + 0,9 % FAPP)" ✓ — era verdad al corte, es pasado hoy.
- **V7. Sin descuento al sueldo líquido.** SP-10906: cotización "**de cargo del empleador**" ✓.
- **V8/V9. Régimen FG: deadline 01-09-2026 + diseño 10-FG.** SP-17076 literales citados en F6 ✓ (insumo de refresh, no refutación).

## 5. Verificaciones de pie (resuelven OK)

- **Links internos:** `check-internal-links` OK (53 artículos, 268 links, 0 rotos). Los 5 del artículo resuelven a archivos existentes: `/glosario/multifondo/` → `src/data/glossary/multifondo.md` ✓; `/posts/que-es-la-cuenta-2-afp/`, `/posts/como-leer-cartola-afp-chile/`, `/posts/reforma-previsional-2025-que-cambia-y-como-te-afecta/`, `/posts/como-cambiarse-de-afp/` → `src/data/blog/*.md` ✓; `/calculadoras/simulador-jubilacion/` → `src/pages/calculadoras/simulador-jubilacion.astro` ✓.
- **Hero image:** `check-hero-images` OK; existen las 3 variantes (`fondos-afp-a-b-c-d-e.avif` + `@mobile` + `@tablet`).
- **Gates:** ninguno flaggea este slug (solo warnings ajenos en `bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`).
- **Fetch directo:** SP-9909, SP-10906, SP-16668, SP-17076 recuperados y citados con valor literal. **LeyChile sirve app-shell a bots** (no se intentó extracción Playwright en esta sesión) → todo lo BCN-dependiente va a NHV; nada se completó de memoria. Snippets de buscador se usan solo como punteros, no como evidencia.

## 6. NEEDS-HUMAN-VERIFY (4, todo BCN-dependiente)

- **NHV-1.** Anclaje legal de límites RV + restricciones de elección: confirmar en `https://www.bcn.cl/leychile/Navegar?idNorma=7147` (DL 3500, versión 01-SEP-2026 a 31-MAR-2027) número de artículo y texto vigente de límites por fondo y de prohibición Fondo A (51/56) / pensionados C-D-E.
- **NHV-2.** Calendario gradual completo del aporte empleador y meta final (7 % nuevo + SIS = 8,5 % total; endpoint anual): confirmar en `https://www.bcn.cl/leychile/navegar?idNorma=1212060` (Ley 21.735, transitorios).
- **NHV-3.** Vigencia legal: confirmar en la misma URL BCN si la vigencia general es diferida al 01-04-2027 y el mapa de vigencias anticipadas/posteriores (resuelve F4).
- **NHV-4.** Transición FG abril 2027: confirmar redacción del transitorio (misma URL BCN) + verificar si el Régimen de Inversión definitivo ya se publicó (deadline 01-09-2026; SP-17076 era propuesta en consulta).

## 7. Freshness assessment al 2026-09-17: ¿sigue exacta la descripción multifondos?

**El núcleo multifondos sí; el bloque 2025-2027 no.** Siguen exactos: límites RV (V1), bandas de asignación (V2), tope de dos fondos (V3), 10 % (V4), vigencia del esquema en 2026 y transición en abril 2027 (V5). Lo que el rollout ya contradijo: tasa "hoy" 1 % → **3,5 %** desde ago-2026 (F1, F2); el diseño FG pasó de anuncio a **propuesta pública concreta de 10 FG** con Régimen definitivo vencido el 01-09-2026 (F6). El gate (`stale=false`, vence 2026-10-09, ~22 días) subestima la urgencia: hay 2 altas factuales en producción hoy. El slug está en `CONTENT-REFRESH-QUEUE-2026-09-16.md` Lote 3 (sens. alta, artefactos B→D→O→d→P +C, vencimiento 2026-10-09).

## 8. Qué exigiría un refresh (lista explícita, sin ejecutar)

1. Reescribir bullets L65-70 + tabla L74-79 (F1, F2) con tasa 3,5 % y desglose 0,1/2,5/0,9; `validAsOf` → fecha real; `updatedDate` ≥ esa fecha (F13).
2. Capas aprobado/rige con citas BCN verificadas (F4, NHV-2…NHV-4); re-etiquetar "Vigencia general".
3. Bloque de restricciones de elección con cita SP (F3); corregir borde "menores de 35" (F7).
4. Ampliar transición FG con diseño 10-FG y estado del Régimen definitivo (F6, NHV-4).
5. Fuentes para límites/asignación/2008/cambio-de-fondo (MUST 4; F9–F11); etiqueta "resumen orientativo" en calendario (F12); matizar "mayoría" C (F8).
6. Decisión de gobierno de datos: dataset `volatileData` de calendario previsional o `dataTriggers` fechados (F5).
7. Separación de deberes (INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES): quien redacte el refresh no puede firmarlo en compliance; gates de publicación los firma humano.
8. Re-ejecutar `check:ci` + verificación de rutas/RSS si cambia el cuerpo (no se toca slug).

## 9. Salidas de gates (verbatim, read-only)

- `node scripts/check-frontmatter.mjs` → `[check-frontmatter] Scanned 53 articles.` … `[check-frontmatter] OK (no blocking errors).` EXIT 0.
- `node scripts/check-editorial-structure.mjs` → WARN solo en 2 slugs ajenos (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`, description larga + 0 intra-cluster links); este artículo sin warnings. EXIT 0.
- `node scripts/check-dialect.mjs` → `[check-dialect] OK. validated=53 files skipped_by_marker=0` EXIT 0.
- `node scripts/check-editorial-timeliness.mjs` → `[check-editorial-timeliness] published=53 stale=0 drift=0 report=output/validation/editorial-timeliness/report.json` EXIT 0. Registro del slug: `reviewDate 2026-04-12, dueDate 2026-10-09, daysSinceReview 158, daysUntilDue 22, cadenceDays 180, sourceMode manual_review_with_official_sources, volatileData []`.
- `node scripts/check-internal-links.mjs` → `[check-internal-links] Scanned 53 published articles, 268 internal links.` `No broken links found.` EXIT 0.
- `node scripts/check-hero-images.mjs` → `[check-hero-images] Checked published articles: 53` `Path mode: legacy-compatible` `OK` EXIT 0.
