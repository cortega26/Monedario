# PLAN — Refresco y consolidación de contenido (sin URLs nuevas,
hasta 2026-11-02)

**Estado:** F0 FIRMADO 2026-09-16 — F1 (lote 1) autorizado
**Fecha:** 2026-09-16
**Owner de decisión:** Carlos Ortega
**Prioridad:** P1 (calidad/contenido) · **Esfuerzo:** M (por lotes) ·
**Riesgo:** MED (YMYL, ownership, enlaces)
**Fuente:** inventario 53 posts / 11 clusters (colas `bancos-fintech: 1`,
`finanzas-migrantes: 1`, `presupuesto-control-financiero: 2`), W37 GSC,
`PLAN-auditoria-corpus-publicado-2026-08-12.md` (lote 0 en PR #423
pendiente de firma humana)

## Objetivo y límites

Elevar exactitud, vigencia y autoridad tópica del corpus existente
mediante refrescos por lote y consolidación de enlaces, sin expandir
inventario.

En alcance:

- Lotes de refresco YMYL sobre top-10 GSC + SLA `timeliness` vencidos:
  `Respuesta rápida` + vigencia + separación aprobado/vigencia/aplicación
  (`CONTRACT.YMYL_RESPONSE_STRUCTURE`), `volatileData` re-sincronizado
  contra snapshot, fuentes oficiales vivas, `Fecha de corte` visible.
- Ownership: resolver colisiones `owner/support/reference` +
  `canonicalTopic` en clusters endurecidos (`sueldo-remuneraciones`,
  `pensiones-afp`, `ahorro-e-inversion`, `uf-costo-de-vida`); `support`
  sin owner → reasignar o marcar, nunca duplicar owner.
- Enlaces: `HUB_REQUIRED` (`/guias/<cluster>/`) + intra-cluster ≥1 por
  artículo; inter-cluster ≤2 por edición con justificación causal
  (prerrequisito / dependencia de decisión / mitigación de riesgo).
- `CalculatorExplainerSection` + CTA calculadora↔artículo donde falte,
  sobre piezas existentes.
- Registro de deuda donde el refresco exija reescritura mayor.

Fuera de alcance (BLOCKED hasta 2026-11-02 o excepción aprobada):

- Nuevos artículos, calculadoras, hubs, clusters, leyes, glosario, SEO
  programático.
- Cambios de slugs/canonical; consolidación masiva o eliminación de
  páginas (evidencia URL por URL + aprobación humana + plan reversible).
- Marcar gates `[X]` en `07-publish-packet.md` (solo humanos); mismo
  agente redacta + audita/cumple (separación de deberes).
- Hero images nuevas salvo corrección de integridad (requieren creación
  manual + `check:hero-images`).

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
  `context/*.md` → implementación.
- Invariantes: todos los `INVARIANT.EDITORIAL.*` (estructura, dialecto
  `es-CL`, títulos/slugs únicos, meta-description, cluster declarado y
  válido, enlaces, `TIMELINESS_REVIEW_SLA`, hero images, AVIF),
  `SEPARATION_OF_DUTIES`, `OWNERSHIP_BEFORE_EXPANSION`,
  `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`.
- Contratos: `FRONTMATTER_POLICY`, `ARTICLE_STRUCTURE`, `TITLE_H1`,
  `META_DESCRIPTION`, `INTERNAL_LINKING`, `CLUSTER_POLICY`,
  `INTER_CLUSTER_LINKING`, `TOPIC_OWNERSHIP`, `TIMELINESS_POLICY`,
  `VOLATILE_DATA`, `HERO_IMAGE_PIPELINE`, `INLINE_IMAGE_FORMAT`,
  `EXTERNAL_URLCHECK` (fase 2 bloqueante en PR).
- Supuestos: A1 lote 0 (`impuestos-personas`, PR #423) necesita firma
  humana antes de replicar su patrón; A2 `evergreen` solo vía
  `slugOverrides`, nunca como default; A3 cluster coverage <95% mantiene
  `cluster_missing` en warning-first.

## Change Control Record

1. Scope declaration: ver arriba.
2. Impacted modules: `src/data/blog/**` (lotes), `src/config/*`
   (timeliness/volatile/topic-policy solo si el lote lo exige + ADR),
   `artifacts/editorial/<slug>/<run-id>/` (brief→packet por pieza
   YMYL), `docs/reports/*`, `output/validation/*`.
3. Invariant preservation: pipeline completo por pieza YMYL sustantiva;
   draft ≠ math-audit ≠ compliance (sesión fresca si misma familia);
   `TODO:SOURCE = 0` para publicar; cut-off visible.
4. Contract preservation: sin duplicar títulos/slugs/descriptions; sin
   Markdown H1; longitud description 70–155 (máx duro 200); AVIF o
   excepción justificada.
5. Boundary integrity: contenido no importa runtime; `check:boundaries`
   verde.
6. Test coverage impact: gates `check:frontmatter`,
   `check:editorial-structure`, `check:dialect`,
   `check:reader-facing-copy`, `check:editorial-artifacts`,
   `check:editorial-timeliness`, `check:images`, `check:hero-images`,
   `check:hero-prompts`, `check:urls:external:ci` deben pasar por lote.
7. Rollback strategy: revert por artículo/lote; snapshots ruta/RSS
   antes/después; sin migración de datos.
8. Regression risk: MED — drift de ownership, canibalización, links
   rotos externos. Mitigación: `audit:topic-overlap`,
   `audit:cannibalization`, ownership review en PR, canary externo.

## Competitive Adaptation Appendix

- benchmarkSet: observación estructural de hubs competidores permitida
  como insumo; nunca como autoridad de corrección YMYL.
- patternHypothesis: hubs + intra-links explícitos mejoran discovery y
  autoridad tópica sin contenido nuevo.
- localDelta: simplificar ramas para lector chileno, umbrales SII/AFP
  vigentes, fuentes primarias chilenas.
- nonCopyBoundaries: no se copia texto, claims, estrategia URL ni
  comparativas comerciales.
- ownerTarget: por lote (p. ej. `pensiones-afp::cambiarse-de-afp`);
  declarar `ownerTarget` por artículo tocado.
- successSignal: `stale = 0` en lote, intra-cluster warnings → 0,
  `audit:topic-overlap` sin double-owners, GSC del lote no peor a 28 d.
- ownership conflict check: obligatorio por lote; conflicto sin
  resolver = `HALT`.

## Fases y gates

1. **F0 — Cola y ownership (read-only).** `audit:topic-overlap` +
   `audit:cannibalization` + `check:editorial-timeliness`; ordenar por
   GSC × staleness × riesgo YMYL. Lotes 1–5 tras lote 0 firmado.
2. **F1 — Refresco YMYL por lote (pipeline completo).**
   `01-brief` → `02-dossier` (fuentes oficiales + benchmark separado +
   notas prompt-injection) → `03-outline` (diferenciación explícita) →
   `04-draft` (cut-off + TODO:SOURCE) → `05-math-audit` (si
   `requires_calculation`) → `06-compliance` (si `alta`) → packet con
   mapa de roles y evidencia de gates. Humano firma.
3. **F2 — Enlaces + hub.** Hub-link + intra ≥1; inter ≤2/edit con
   justificación en notas de PR. Verificar
   `check:editorial-structure` warnings → 0 en lote.
4. **F3 — Medios y externo.** AVIF/`inlineImageExceptions`,
   `check:hero-images/prompts` si se tocó imagen,
   `check:urls:external:ci` (bloqueante) + `canary`.
5. **F4 — Cierre de lote.** `check:frontmatter`, `check:editorial`,
   `check:editorial-timeliness`, `check:routes`, `check:rss`; snapshot
   antes/después si hubo movimiento de rutas (no esperado).

STOP/HALT: ownership sin resolver; `TODO:SOURCE > 0`; compliance `alta`
sin firma; `blocking=true` externo; slug/canon tocado sin ADR +
snapshots; mismo agente en draft y auditoría.

## Métricas

| Métrica | Meta por lote |
|---|---|
| `stale` timeliness | 0 |
| `cluster_link_warning` / hub faltante | 0 |
| Double-owners por topic | 0 |
| `duplicate_titles/slugs/descriptions` | 0 |
| Externos `blocking=true` | 0 |
| GSC lote (28 d) | no peor que base |

## Rollback

Revert por artículo; restaurar frontmatter + body; re-correr gates del
lote + `check:routes`/`check:rss`. Contenido publicado con error
factual → corrección forward con nuevo packet, no rewrite silencioso.

## Progress log

- 2026-09-16 — Plan creado (TODO).
- 2026-09-16 — Precondición lote 0 resuelta: PR #423 (`impuestos-personas`)
  verificado MERGED 2026-08-14. Lotes 1–5 pueden encolarse; cada lote
  mantiene pipeline completo + firma humana propia.
- 2026-09-16 — F0 ejecutado (read-only, TODO sin completar): cola en
  `docs/reports/CONTENT-REFRESH-QUEUE-2026-09-16.md` (lotes 1–5, 46
  artículos; `impuestos-personas` excluido por lote 0). Señales:
  `audit:topic-overlap` OK sin double-owners, `audit:cannibalization` OK,
  `check:editorial-timeliness` OK (`stale=0`), GSC W36 como orden
  principal (W37 truncado, solo contraste). Sin HALT activo; F0 sigue
  TODO pendiente de sign-off del owner.
- 2026-09-16 — Piloto lote 1 disparado: `informe-deudas-cmf-vs-dicom` (brief→dossier→outline→draft); auditorías matemática/compliance en sesiones separadas; sin packet ni merge sin firma humana.
- 2026-09-16 — Compliance HOLD (14 flags, 12/12 TODO bloquean) + checklist humano emitido (`HUMAN-VERIFY-checklist.md`, 12 ítems A–L con URLs exactas, ~30 min). Resto lote 1 en pausa hasta workflow de parche probado.
- 2026-09-16 — Piloto draft cerrado (DraftAgent, run `2026-09-16-pilot-01`): 01-brief + 02-dossier + 03-outline + 04-draft en `artifacts/editorial/informe-deudas-cmf-vs-dicom/2026-09-16-pilot-01/`; 05/06/07 NO producidos (separación de deberes). Hallazgos para auditores: heredero vía CMF sin papel (no presencial) y re-atribución Ley 20.575→19.812/19.628 pendientes de verificación; TODO:SOURCE = 12 en draft. Siguiente: math-audit + compliance en sesiones frescas separadas.
- 2026-09-16 — Piloto compliance cerrado (ComplianceAgent, sesión fresca, run `2026-09-16-pilot-01`): `06-compliance.md` emitido con veredicto HOLD-CONDITIONAL (score 7,2/10; 14 flags 6A/7M/1B; TODO:SOURCE 12/12 bloqueantes; `requires_calculation=false` confirmado, 05 N/A); 4 preguntas del drafter verificadas (atribución Ley 20.575 errónea, heredero CMF-sin-papel, desfase y citas BCN pendientes); escala a humano (Bucket A) sin packet ni firma de gates.
- 2026-09-16 — Compliance delta cerrado (ComplianceAgent, sesión fresca, run `2026-09-16-pilot-01`): `06-compliance-delta.md` emitido con veredicto HOLD (12/14 RESOLVED en artículo, 14/14 en draft v2; residuales: R4-C(c) alegación L142 y R9 castigos L122, texto pre-existente no removido por el hotfix); frontmatter acotado a updatedDate/validAsOf, `requires_calculation=false` se mantiene; packet y firma siguen humanos.
- 2026-09-17 — Compliance delta2 cerrado (ComplianceAgent, sesión fresca): `06-compliance-delta2.md` con veredicto LIFT HOLD (article-side), 14/14 CLOSED en workdir (ex-residuales R4-C(c)/R9 ausentes, R3 magnitud retirada con reemplazo sourced, R6 inciso presente); presign §7(b)(1) adjudicado stale-observation parcial; packet y firma siguen humanos.
- 2026-09-17 — Owner confirma apertura personal en navegador de las URLs del checklist (HUMAN-BROWSER-CONFIRMATION.md); correlación Playwright retirada como no-hallazgo. Resta solo el packet 07 + firma (human-only).
