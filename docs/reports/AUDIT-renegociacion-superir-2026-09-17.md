# Auditoría adversarial — `renegociacion-superir` (2026-09-17)

- **Slug:** `renegociacion-superir`
- **Archivo:** `src/data/blog/renegociacion-superir.md` (268 líneas)
- **Frontmatter:** `pubDate 2026-02-24`, `updatedDate 2026-03-12`,
  `articleLead.validAsOf 2026-04-12`, `reviewPolicy cadenceLabel annual / maxDays 365`,
  sin campo `volatileData`
- **Veredicto:** **FINDINGS** — 2 Medium, 8 Low, 2 Observaciones, 5 NEEDS-HUMAN-VERIFY
- **Método:** lectura completa del artículo + verificación adversarial contra
  fuentes primarias (Ley 20.720 texto vigente vía `get_norma_json`,
  Superir, ChileAtiende — todas fetcheadas el 2026-09-17/18). Nada se completó de memoria.

## 1. Gates read-only (verbatim, nada flaggea este slug)

- `check-frontmatter`: `[check-frontmatter] OK (no blocking errors).`
  (54 artículos escaneados; contadores de deprecación y transición en 0)
- `check-editorial-structure`: WARN global **ajeno al slug**
  (`bancos-y-fintech-chile.md` y `finanzas-para-migrantes-chile.md`:
  description >155 y 0 intra-cluster links). Este artículo: sin flags.
- `check-dialect`: `[check-dialect] OK. validated=54 files skipped_by_marker=0`
- `check-editorial-timeliness`: `[check-editorial-timeliness] published=53 stale=0
  drift=0`. Registro del slug: `reviewDate 2026-04-12` (desde `validAsOf`),
  `daysSinceReview 159`, `dueDate 2027-04-12`, `stale false`, `volatileData []`,
  `hasOfficialSources true`.
- `check-internal-links`: `Scanned 53 published articles, 268 internal links.
  No broken links found.` Los 5 destinos de este artículo existen en disco
  (`simulador-renegociacion`, `credito-consumo`, `prepago-credito`,
  `guias/uf-costo-de-vida/`, `cae-costo-real-credito-chile.md`).
- `check-hero-images`: OK. Asset existe:
  `public/images/hero/renegociacion-superir.avif` (7150 bytes).

## 2. Tabla de findings

| # | Claim + ubicación | Sev | Evidencia / URL | Fix sugerido |
|---|---|---|---|---|
| F1 | "que en conjunto superan 80 UF (~$3.500.000 aproximadamente…)" — Requisito 1, L94 | **Medium** | `src/infrastructure/economic/economic-parameters.snapshot.json`: UF $40.950,90 al 2026-09-17 → 80 UF = **$3.276.072** (~6,8% bajo lo afirmado). A marzo-2026 la UF era menor, luego el error al publicar era ~8–10%. Dirección del daño: sobrestima el umbral → lectores con 80–85 UF (~$3,3–3,5M) podrían autoexcluirse. Figura volátil **no registrada** (no hay `volatileData`; convención existente: `economic.uf.value` con `sync: reference`, v. `que-es-la-uf.md`) | Eliminar la conversión a CLP (mantener link a `/guias/uf-costo-de-vida/`) o registrar `volatileData: [{id: economic.uf.value, sync: reference}]` |
| F2 | FAQ "La renegociación no congela tus cuentas ni te impide operar financieramente" — L257-258 | **Medium** | Ley 20.720, **art. 264 N°4**: los contratos se mantienen "**con la sola excepción de suspender las líneas de crédito o sobregiro**"; **art. 264 N°6**: el deudor "**no podrá ejecutar actos ni celebrar contratos relativos a sus bienes embargables**… bajo apercibimiento de ser tenido por depositario alzado". Afirmación sin fuente en el FAQ y falsa en lectura amplia | Acotar: "no se congelan tus cuentas por el solo hecho de solicitarla; pero el banco puede suspender líneas de crédito/sobregiro y no puedes enajenar bienes embargables (art. 264 N°4 y 6, Ley 20.720)" |
| F3 | "No te van a quitar la casa por iniciar este proceso" — L72 | Low | La protección (no iniciar liquidaciones/ejecuciones en contra) rige "**desde la publicación de la Resolución de Admisibilidad**" (art. 264 inc. 1°), no desde la presentación. Además el artículo **omite** el verdadero escudo (art. 264 N°1–4: no nuevas ejecuciones, se suspende devengo de intereses moratorios, continuidad de contratos), que es argumento de venta | Reformular con timing correcto + agregar bloque "qué te protege desde la admisibilidad (art. 264)" |
| F4 | "La ley exige mínimo dos acreedores distintos" — L202 | Low | Art. 260 exige "dos o más obligaciones… **provenientes de obligaciones diversas**" (modal Superir: "obligaciones distintas"). Obligaciones diversas ≠ necesariamente acreedores distintos | "dos o más obligaciones distintas (en la práctica, frente a acreedores distintos)" |
| F5 | "te da solo 15 días hábiles para rectificar… debes empezar de cero" — L116, L176-178 | Low | Art. 262 N°2: subsanar "**en el plazo que la misma Superintendencia le fije**" — los 15 días son **operacionales** (confirmados en `superir.gob.cl/perfil-deudor-requisito-renegociacion/`), no legales. "Empezar de cero" (re-postulación) es inferencia: la ley solo dice "inadmisible" | Atribuir ("la Superir fija 15 días hábiles en la práctica") y suavizar re-postulación (ver H2) |
| F6 | Exclusiones: solo menciona alimentos — L238-242 | Low | Art. 260 inc. 3° excluye además **delitos/cuasidelitos civiles** y **multas y sanciones pecuniarias** (todas deben igual declararse, art. 260 inc. 4°/261) | Completar la lista de obligaciones excluidas |
| F7 | Trazabilidad legal: el cuerpo nunca nombra "Ley 20.720" ni números de artículo | Low | NORMA_YMYL MUST #4 se cumple vía links oficiales, pero sin cita ("arts. 260-261") el lector no puede contrastar | Agregar "(arts. 260-261, Ley 20.720)" en requisitos y "(art. 264)" en efectos |
| F8 | Sin etiqueta "resumen orientativo" en síntesis jurídica (NORMA_YMYL §3.2) | Low | Es guía procedimental sin tabla de causales/impacto → caso borde; a nivel SHOULD | Evaluar etiqueta en el bloque de requisitos/efectos al refrescar |
| F9 | Omisiones materiales YMYL | Low (c/u) | (a) Régimen de acreedores garantizados/fiadores, art. 266 (hipotecario en contra **puede ejecutar su garantía**) — crítico para deudores hipotecarios. (b) Rehabilitación + extinción de saldos, art. 268. (c) Modificación por una sola vez, art. 272 A. (d) Causales de término anticipado incl. bienes ocultos, art. 269. (e) Tiempos de audiencia 15–30 días, arts. 263/265 | Agregar notas breves en refresh (no bloquean) |
| F10 | "con el Estado como árbitro" — L72 | Low | Superir y arts. 265-267: la Superir actúa como **facilitadora/mediadora**, no árbitro | "con el Estado como mediador" |
| F11 (obs) | `validAsOf 2026-04-12` > `updatedDate 2026-03-12` | Obs | Gate-clean (revisión posterior a la edición, `dueDate 2027-04-12`). El corte **sí es visible** (lead `validAsOf` → `ArticleDecisionIntro.astro` renderiza "Información con fecha de corte…"), luego NORMA_YMYL vigencia-visible se cumple; pero el corte tiene 5 meses en contenido de insolvencia | Re-atestiguar `validAsOf` en el refresh |
| F12 (obs) | Modales Superir clasifican a profesionales art. 42 N°2 como "Empresa Deudora" | Obs | Texto legacy en el propio sitio Superir; **contradice** el art. 2 N°13 vigente (solo primera categoría, Ley 21.563 D.O. 10.05.2023) y ChileAtiende ("si emites boletas de honorarios, también puedes acceder"). El artículo se alinea con estatuto + ChileAtiende → correcto, sin cambio; solo contexto humano | Considerar línea aclaratoria si lectores reportan confusión |

## 3. Verificado vía `get_norma_json` vs pendiente humano

Técnica: `nuevo.leychile.cl/servicios/Navegar/get_norma_json` con User-Agent de
navegador (401 sin él), primero con `idLey=20720` para resolver
**idNorma=1058072** ("Última Versión", pub. 2014-01-09), luego extracción por
artículo con el prototipo `/tmp/opencode/bcn-spike/extract.mjs`.
Verificados contra texto legal literal: umbral 2+ deudas/>90 días/>80 UF
(art. 260), regla 24 meses primera categoría vía defs. Empresa/Persona Deudora
(art. 2 N°13/25, mod. Ley 21.563), 5 declaraciones juradas incl. excepción
laboral (art. 261 a–e), 10 días hábiles admisibilidad + plazo fijado por Superir
(art. 262), escudo y restricciones desde admisibilidad (art. 264 N°1–6),
flujo de audiencias y quórum deudor + 2+ acreedores >50% (arts. 265-267),
repactar/novar/**remitir** (art. 266, respalda "condonación"),
remisión a tribunal–Liquidación (arts. 267/269), rehabilitación y extinción
(art. 268). Verificados vía fetch web oficial: requisitos y 15 días operativos,
audiencias telemáticas, gratuidad/sin abogado, lista documental, ClaveÚnica,
dirección y horario Santiago, pagarés post-acuerdo, limpieza CMF/Boletín,
honorarios elegibles (ChileAtiende explícito). Enlaces externos del artículo
(CMF `conocetudeuda…`, CMF `informedeudas…`, `boletincomercial.cl`): HTTP 200.

NEEDS-HUMAN-VERIFY (5): H1 — vigencia exigida de certificados ("seis meses…",
verificable solo en el listado descargable PDF de Superir). H2 — re-postulación
tras inadmisibilidad ("empezar de cero"). H3 — ausencia de reforma en trámite al
capítulo de renegociación al 2026-09-18. H4 — práctica Superir ante múltiples
obligaciones distintas con un solo acreedor (borde de F4). H5 — "liquidaciones de
los últimos meses": cuántos meses exige la NCG/listado.

## 4. Freshness assessment

Gate-clean (cadencia anual, vence 2027-04-12) y última enmienda estatutaria
asimilada (Ley 21.563, D.O. 10.05.2023, reflejada en el texto vigente
fetcheado). Pero: figura UF/CLP errada y a la deriva (F1), corte visible de hace
5 meses (F11) y omisiones YMYL (F9) → **refresh recomendado dentro de 30 días**,
no bloqueante de publicación.

## 5. Refresh-requirements (lista explícita)

1. F1: eliminar o registrar la conversión 80 UF→CLP.
2. F2: acotar claim de cuentas/operación con art. 264 N°4 y 6.
3. F3: timing de la protección (desde admisibilidad) + bloque escudo art. 264.
4. F5: atribuir los 15 días como práctica Superir.
5. F6+F7: completar excluidos + citar Ley 20.720 y artículos.
6. F9: notas de garantizados, rehabilitación, modificación única, término anticipado.
7. F8/F10: evaluar etiqueta orientativa + "mediadora".
8. Re-atestiguar `validAsOf` (+ resolver H1–H5) y registrar el cambio según §5.3 de la norma.
