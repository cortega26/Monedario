# Auditoría adversarial — reforma-previsional-2025-que-cambia-y-como-te-afecta (2026-09-17)

**Slug:** `reforma-previsional-2025-que-cambia-y-como-te-afecta`
**Archivo:** `src/data/blog/reforma-previsional-2025-que-cambia-y-como-te-afecta.md`
**Tipo:** read-only. No se editó ningún archivo existente. Único output: este reporte.
**Fecha de auditoría:** 2026-09-17. **Cutoff del artículo auditado:** `validAsOf 2026-04-12` / `updatedDate 2026-03-12`.
**Veredicto:** **FINDINGS — 2 alta / 5 media / 4 baja (11 hallazgos). 5 NEEDS-HUMAN-VERIFY.**

## 1. Frontmatter y señales de frescura (inventario)

| Campo | Valor | Observación |
|---|---|---|
| `title` | "Reforma previsional 2025: qué cambia y cómo te afecta" | OK |
| `description` | Guía práctica de la reforma … (gate OK, sin warning de largo) | OK |
| `pubDate` | 2026-03-03T23:00:00Z | OK |
| `updatedDate` | 2026-03-12T19:05:00Z | Ver F11: anterior a `validAsOf` |
| `category / cluster` | `prevision / pensiones-afp` | OK, cluster endurecido |
| `topicRole / canonicalTopic` | `owner / reforma-previsional-cambios` | OK, coincide con `src/config/editorial-topic-policy.mjs:109-112` |
| `heroImage` | `/images/hero/reforma-previsional-2025-que-cambia-y-como-te-afecta.avif` | OK: existen `.avif` + `@mobile` + `@tablet` en `public/images/hero/` |
| `articleAdvisory` | Calendario puede ajustarse por norma posterior | OK, veraz pero insuficiente frente a cambios YA ocurridos |
| `articleLead.validAsOf` | 2026-04-12 | Desfasado ~5 meses al 2026-09-17; tabla "Hoy" congelada a esa fecha |
| `articleLead.officialSources` | BCN Ley 21.735 + 2 páginas SPensiones | Formalmente OK; faltan NCG 350 (BAC/CEV) y página de cotización empleador |
| `reviewPolicy` | `semiannual / maxDays 180`, `dataTriggers: []` | Ver F7: triggers vacíos en artículo de cifras volátiles |
| `volatileData` | ausente (`[]` según reporte de timeliness) | Ver F7 |
| Timeliness gate | `reviewDate 2026-04-12, dueDate 2026-10-09, stale false, daysUntilDue 22` (reporte del 2026-09-15) | No stale por gate, pero stale semántico real (ver §4) |

## 2. Checklist NORMA_YMYL v1.0 + CONTRACT.YMYL_RESPONSE_STRUCTURE

| Requisito | Estado |
|---|---|
| MUST 1 Respuesta ancla ≤ 2 pantallas con regla concreta | Parcial: "Lo esencial en 3 minutos" trae números, pero hoy son incorrectos (F2) |
| MUST 2 Regla afirmativa | Cumple en forma |
| MUST 3 Vigencia explícita | Cumple en forma ("fecha de corte 2026-04-12"), pero la fecha expiró en efecto (F2, F11) |
| MUST 4 ≥1 fuente oficial por regla crítica YMYL | Parcial: BAC/CEV/CRP operativos sin fuente (F3–F5) |
| MUST 5 Excepciones relevantes | Cumple parcial (licencias, independientes, plazo fijo) |
| MUST 6 Separar aprobación / vigencia / implementación (reformas) | **Falla**: no existe capa de vigencia legal (F6); además hay error factual de promulgación (F1) |
| MUST 7 Síntesis jurídica etiquetada "resumen orientativo" | **Falla** leve: tabla Hoy/Después sin etiqueta (F9) |
| MUST 8 Coherencia interna | Cumple (no hay contradicciones internas; el problema es contra la realidad) |
| MUST 9 Frontmatter y frescura | Parcial (F7, F11) |
| SHOULD interlinking | Cumple: 3 links internos, todos resuelven (ver §5) |

## 3. Tabla de hallazgos

| # | Afirmación + ubicación | Sev. | Evidencia / URL o NEEDS-HUMAN-VERIFY | Fix sugerido |
|---|---|---|---|---|
| F1 | L54: "En julio de 2025 se promulgó la reforma" | alta | **Falso.** Fecha Promulgación: 20-MAR-2025; Publicación: 26-MAR-2025. Fuentes: export BCN (`Fecha Publicación: 26-MAR-2025 \| Fecha Promulgación: 20-MAR-2025`, vía `nuevo.leychile.cl … Ley-21735_26-MAR-2025`); Subsecretaría de Previsión Social 2025-03-26 ("promulgada la semana pasada … publicada este miércoles"); SP `w3-article-16483.html` ("Ley N° 21.735, del 26 de marzo de 2025") | Reescribir: "promulgada el 20-03-2025 y publicada el 26-03-2025 (Ley 21.735)". Cita primaria + fecha de recuperación |
| F2 | L62, L83–L87: "Hoy … 1% desde agosto de 2025" (corte 2026-04-12) | alta | **Falso al 2026-09-17.** Desde remuneraciones de agosto 2026 (pago septiembre 2026) la cotización de cargo del empleador es **3,5 %**: 0,1 % cuenta individual + 0,9 % Cotización con Rentabilidad Protegida + 2,5 % SSP (SIS + CEV), recaudado por IPS al FAPP. Fuente primaria: SP `w3-propertyvalue-10906.html` ("A partir del 1 de agosto de 2026 y hasta julio de 2027 la cotización … será de 3,5 % … 0,1 % … 0,9 % … CRP … 2,5 % … SIS … CEV"). Corroboran AFP PlanVital 2026-07-30 y Emol 2026-08-02 | Actualizar tabla Hoy a 3,5 % con desglose 0,1/0,9/2,5; mover `validAsOf`; registrar calendario como `volatileData` o trigger de revisión anual de agosto |
| F3 | L165 menciona "CRP" una vez, sin definir; resto del artículo la ignora | media | CRP = Cotización con Rentabilidad Protegida: transitoria 30 años, se reintegra con reajustes e intereses desde edad legal de pensión. **Recaudación iniciada con remuneraciones de agosto 2026** (SP `w3-propertyvalue-10906.html`; SP-16615: "De ese 6 % … 4,5 % … directo … 1,5 % … CRP"). El artículo la trata como abstracción futura cuando ya se está cobrando | Definir CRP en Cambio 1, explicar 0,9 % vigente y devolución a la pensión; citar SP |
| F4 | L127–L129: "No conviene prometer un monto fijo [BAC] … debe usarse para entender estructura y calendario" | media | Regla BAC ya definida y **pagándose desde enero 2026** (antes del propio corte 2026-04-12 del artículo): 0,1 UF por año cotizado, tope 25 años; requisitos mujeres 120 meses → 180 gradual / hombres 240 meses; NCG N° 350 del 12-09-2025. Fuente primaria: SP `w3-article-16708.html` (16-09-2025) | Publicar regla BAC concreta + tabla de gradualidad mujeres + nota de anualidad-descuento para pensionados desde ago-2025; citar NCG 350 |
| F5 | CEV ausente en todo el artículo | media | Compensación por Diferencias de Expectativa de Vida: **pagándose desde enero 2026** a mujeres 65+ (escala 100/75/50/25/15/5 % según edad de pensión; mínimo 0,25 UF/mes; tope 18 UF autofinanciada). Fuente primaria: SP `w3-article-16708.html`. Una guía "cómo te afecta" omite una de las dos prestaciones en pago | Agregar bloque CEV con requisitos NCG 350 (incluye regla FAPP/50 años) y vínculo con el 2,5 % SSP |
| F6 | Sin capa de vigencia legal en todo el artículo | media | CONTRACT.YMYL_RESPONSE_STRUCTURE §3 exige aprobado / rige / se implementa / hoy-vs-después. El artículo solo tiene hoy-vs-después. Falta: publicada 26-03-2025; **vigencia general diferida al 01-04-2027** con normas de vigencia anticipada y posterior vía transitorios (nota de versión BCN, vía snippet `nuevo.leychile.cl`). Sin esto el lector no distingue ley vigente de ley aplicable | Agregar bloque "Qué está aprobado / desde cuándo rige / desde cuándo se aplica" con fechas BCN + transitorios clave (lagunas may-2025, PGU sep-2025/2026/2027, BAC-CEV ene-2026, CRP ago-2026, FG abr-2027) |
| F7 | Sin `volatileData`; `reviewPolicy.dataTriggers: []` | media | `check:editorial-timeliness` confirma `volatileData: []`. Las cifras del calendario (tasa empleador, desglose, montos BAC/CEV, fecha FG) son el caso paradigmático de dato volátil, pero el registry (`src/config/editorial-volatile-data-registry.json`) no tiene dataset de calendario previsional | Opción A: nuevo dataset `pensions.reform.employer_schedule` (fuente canónica SP) + declarar dependencia `strict`/`reference`. Opción B (mínimo): poblar `dataTriggers` con hitos fechados (ago-2026, ene-2026, abr-2027) y documentar por qué no hay dataset. Decisión humana |
| F8 | L165: "CRP" sin definición previa ni posterior | baja | Búsqueda en archivo: única ocurrencia, sin expansión del acrónimo | Expandir a "Cotización con Rentabilidad Protegida (CRP)" en primera mención |
| F9 | Tabla L83–L87 sintetiza la ley sin etiqueta "resumen orientativo" | baja | NORMA_YMYL §3.2 exige etiqueta + limitador en tablas de impacto | Agregar nota estándar bajo la tabla |
| F10 | Calendario omite Seguro de Lagunas (may-2025) y tramos PGU (sep-2025 82+; sep-2026 75+ $250.275; sep-2027 65+) | baja | Fuente: Subsecretaría Previsión Social 2025-03-26 (lagunas + PGU); tramo sep-2026 vía prensa (Emol 2026-08-02, no primaria — confirmar en IPS/ChileAtiende al refrescar) | Incluir mini-calendario de hitos con estado (operativo/pendiente); el detalle PGU vive en su artículo, aquí basta fecha + link |
| F11 | `validAsOf 2026-04-12` posterior a `updatedDate 2026-03-12`; gate `stale=0` con contenido semánticamente desactualizado | baja | Reporte timeliness verbatim: `reviewDate 2026-04-12, dueDate 2026-10-09, stale false`. El gate mide edad, no verdad: no detectó F1–F5 | Al refrescar, alinear `updatedDate ≥ validAsOf`; considerar nota de deuda técnica: gate de edad no captura staleness de calendario (revisión humana anual de agosto) |

## 4. Freshness assessment al 2026-09-17: ¿sigue exacto el calendario?

**No.** Lo que era correcto al corte 2026-04-12 y sigue vigente: 0,1 % directo a cuenta individual; transición a fondos generacionales en abril de 2027 (SP-16668: Régimen de Inversión a publicar máx. sep-2026 — es decir, este mes — y transición abr-2027); meta 7 % nueva cotización / 8,5 % total empleador / 18,5 % total sistema hacia agosto de 2033 (con verificación BCN pendiente, ver NHV-1); multifondos A–E aún vigentes en 2026; aporte patronal no reduce sueldo líquido.

Lo que el rollout ya contradijo o superó: tasa "hoy" 1 % → **3,5 %** desde ago-2026 (F2); CRP en recaudación (F3); BAC y CEV en pago desde ene-2026 con reglas públicas (F4–F5); PGU tramo 75+ en sep-2026 (F10); promulgación "julio 2025" (F1, nunca fue correcta). El gate `stale=0 / dueDate 2026-10-09` (~20 días restantes al 2026-09-17) subestima la urgencia: hay 2 altas factuales en producción hoy.

## 5. Verificaciones de pie (resuelven OK)

- **Links internos:** `check-internal-links` OK (53 artículos, 267 links, 0 rotos). Los 3 del artículo resuelven a archivos existentes: `/posts/fondos-afp-a-b-c-d-e/`, `/posts/boleta-honorarios-2026-retencion-cobertura/`, `/posts/pgu-pension-garantizada-universal/` (+ `/calculadoras/apv/` existe como `src/pages/calculadoras/apv.astro`).
- **Hero image:** `check-hero-images` OK; existen las 3 variantes (base + `@mobile` + `@tablet`).
- **Fuentes oficiales citadas:** 3 en `articleLead` + 4 en "Fuentes oficiales" (BCN idNorma=1212060; SP-16615, SP-16668, SP-16708). SP-16708 ya estaba citada aunque su contenido (BAC/CEV concretos) no se incorporó — deferral injustificado según NORMA §2.4.
- **Fetch directo:** SP-16615, SP-16668, SP-16708 y SP-propertyvalue-10906 recuperados y citados con valor literal. **LeyChile bloquea bots** (página devuelve aviso de conexión/navegador incompatible) → todo lo BCN-dependiente va a NHV, nada se completó de memoria.

## 6. NEEDS-HUMAN-VERIFY (5, todo BCN-dependiente)

- **NHV-1.** Calendario gradual completo y meta final: confirmar en `https://www.bcn.cl/leychile/navegar?idNorma=1212060` (texto Ley 21.735, artículos transitorios) las tasas año por año 2025→2033, que el 7 % nuevo + SIS = 8,5 % total empleador, y el endpoint "agosto de 2033".
- **NHV-2.** Vigencia legal general diferida al 01-04-2027 y mapa de vigencias anticipadas/posteriores por transitorio (misma URL BCN).
- **NHV-3.** Fondos generacionales con elección explícita de perfil dentro de rangos de cohorte (L151–L154 del artículo) — confirmar en texto BCN.
- **NHV-4.** Independientes: opción de cotizar mensualmente al SSP desde agosto 2025 + esquema anual por Operación Renta (L97–L99) — confirmar en texto BCN / norma SP aplicable.
- **NHV-5.** Aporte patronal en contratos a plazo fijo, indefinido y jornada parcial con proporcionalidad del Código del Trabajo (L171–L173) — confirmar en texto BCN.

## 7. Qué exigiría un refresh (lista explícita, sin ejecutar)

1. Reescribir L54 (F1) y tabla Hoy/Después + bullets L60–L64 (F2) con tasa 3,5 % y desglose; `validAsOf` → fecha real de revisión; `updatedDate` ≥ esa fecha (F11).
2. Nuevos bloques operativos: CRP (F3), BAC con montos y requisitos (F4), CEV con escala y topes (F5), mini-calendario de hitos con estado (F6, F10).
3. Bloque de vigencia legal contratado (F6) con citas BCN verificadas por humano (NHV-1…NHV-5).
4. Micro-correcciones: definir CRP (F8), etiqueta "resumen orientativo" (F9).
5. Decisión de gobierno de datos: dataset `volatileData` de calendario previsional o `dataTriggers` fechados (F7) — ver `src/config/editorial-volatile-data-registry.json` y `docs/backlog/PLAN-content-refresh-consolidation-2026-09-16.md` (este slug está en Lote 3 con sens. alta, artefactos B→D→O→d→P +C).
6. Separación de deberes (INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES): quien redacte el refresh no puede firmarlo en compliance; gates de publicación los firma humano.
7. Re-ejecutar `check:ci` + verificación de rutas/RSS si cambia el cuerpo (no se toca slug).

## 8. Salidas de gates (verbatim, read-only)

- `node scripts/check-frontmatter.mjs` → `[check-frontmatter] Scanned 53 articles.` … `[check-frontmatter] OK (no blocking errors).` EXIT 0.
- `node scripts/check-editorial-structure.mjs` → WARN solo en 2 slugs ajenos (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`, description larga + 0 intra-cluster links); este artículo sin warnings. EXIT 0.
- `node scripts/check-dialect.mjs` → `[check-dialect] OK. validated=53 files skipped_by_marker=0` EXIT 0.
- `node scripts/check-editorial-timeliness.mjs` → `[check-editorial-timeliness] published=53 stale=0 drift=0 report=output/validation/editorial-timeliness/report.json` EXIT 0.
- `node scripts/check-internal-links.mjs` → `Scanned 53 published articles, 267 internal links. No broken links found.` EXIT 0.
- `node scripts/check-hero-images.mjs` → `Checked published articles: 53 … OK` EXIT 0.

## 9. Nota sobre auditoría piloto hermana

No se encontró en disco un artefacto de "pilot audit" hermano identificable bajo `docs/reports/` (últimos: `CONTENT-REFRESH-QUEUE-2026-09-16.md`, `MEASUREMENT-INTEGRITY-REPORT-2026-09-16.md`). La cola F0 confirma contexto útil: este slug va en Lote 3, sensibilidad alta, vencimiento 2026-10-09, artefactos +C. Si el piloto vive fuera del repo, cruzar sus defectos vivos con F1–F5 antes del refresh.
