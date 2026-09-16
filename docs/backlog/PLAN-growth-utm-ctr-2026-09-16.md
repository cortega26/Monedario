# PLAN — UTM/UF CTR fix (traffic P0, inside FOCO)

**Estado:** TODO — pendiente de sign-off del owner
**Fecha:** 2026-09-16
**Owner de decisión:** Carlos Ortega
**Prioridad:** P0 (tráfico) · **Esfuerzo:** S/M · **Riesgo:** MED (YMYL +
superficie en medición)
**Fuente:** GSC W37 (`output/operations/data-signals/gsc/2026-W37-*`),
Cloudflare W37 (`output/operations/data-signals/cloudflare/`), auditoría
Cloudflare visitas 2026-08-17→09-15 (monedario 68.486 visitas, 100% humanas)

## Objetivo y límites

Subir clics GSC de las dos páginas de dinero existentes
(`/calculadoras/conversor-utm/`, `/calculadoras/conversor-uf/`) mejorando
encaje de intención en snippet y página, sin crear URLs nuevas.

En alcance:

- Reescritura de `title`/`description` + primer párrafo/H1 de UTM y UF para
  intención `valor utm/uf hoy` (valor + fecha + fuente en primeros 120
  caracteres).
- Bloque FAQ/intención existente (corrección de integridad, no artículo
  nuevo) con respuestas a `utm hoy`, `valor utm hoy`, `utm a pesos`.
- Reparación de enlazado interno entrante/saliente sobre inventario
  existente (hub `/guias/uf-costo-de-vida/`, `sueldo-liquido`,
  `reajuste-arriendo`, `operacion-renta`).
- Barrido striking-distance con `scripts/audit-striking-distance.mjs` sobre
  `W37-query-page.json` (posición 4–15, >500 impr, CTR <2%).
- Medición GSC + RUM antes/después por URL.

Fuera de alcance (BLOCKED hasta 2026-11-02 o excepción aprobada, ver
`UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`):

- Nuevas URLs indexables, clusters, calculadoras, artículos, glosario,
  leyes, SEO programático, archivos GEO nuevos.
- Cambios de slugs, canonical, fórmulas o parámetros normativos.
- Cambios de título/meta en superficies con ventana de medición activa
  distinta de UTM/UF sin verificar OBS/pr congelado vigente.
- Contenido YMYL sustantivo sin pipeline editorial
  (`context/EDITORIAL_AI_PIPELINE.md`).

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
  `context/*.md` → implementación.
- Invariantes: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`,
  `RSS.NO_REMOVALS`, `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`,
  `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`.
- Contratos: `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`,
  `CONTRACT.RSS_POLICY`, `CONTRACT.EDITORIAL.*`,
  `CONTRACT.YMYL_RESPONSE_STRUCTURE`.
- A1: ninguna URL pública cambia byte-for-byte salvo `title`/`description`
  y copy interno; slugs/canonical intactos.
- A2: UTM/UF son consultas parcialmente zero-click; CTR 3,5% es heurística,
  no forecast (precedente: decisión 2026-07-16).
- A3: baseline = última semana completa de 7 días disponible (W36
  verificada completa 2026-08-31→09-06; W37 2026-09-07→09-11 llegó
  truncada a 5 días — precedente plan 111 — y no debe usarse como
  baseline hasta re-export completo). Comparar solo semanas completas
  de 7 días.

## Change Control Record

1. Scope declaration: ver "Objetivo y límites" (in/out arriba).
2. Impacted modules: `src/pages/calculadoras/conversor-utm.astro`,
   `src/pages/calculadoras/conversor-uf.astro`,
   `src/components/calculator/*`, `src/pages/guias/uf-costo-de-vida/*`
   (solo enlaces), `docs/reports/*` (evidencia), `output/validation/*`
   (snapshots).
3. Invariant preservation: identidad URL por slug; cero remociones
   rutas/RSS; sin superficie indexable nueva; sin firma humana fabricada.
4. Contract preservation: sin breaking changes; fórmulas económicas
   intactas; refresco vía snapshot, no hardcodeo.
5. Boundary integrity: `pnpm run check:boundaries` debe pasar al cierre.
6. Test coverage impact: actualizar/añadir tests de copy reader-facing
   (`check-reader-facing-copy`), dialecto y estructura editorial donde
   aplique; no se elimina cobertura.
7. Rollback strategy: revert por unidad (snippet UTM, snippet UF,
   enlaces); re-verificar `check:routes` + `check:rss` tras revert.
8. Regression risk: MED — contaminación de baseline CTR si se tocan más
   superficies; mitigación: una URL por vez, ventana de 14–28 días,
   congelar resto de títulos durante la medición.

## Competitive Adaptation Appendix

- benchmarkSet: N/A (trabajo guiado por GSC propio + intent SERP
  observado, no por implementación competidora).
- patternHypothesis: el snippet actual no responde `valor hoy` en los
  primeros caracteres; alinear título/descripción/H1 con la query ancla
  sube CTR sin cambiar ranking.
- localDelta: valor UTM/UF vigente con fuente primaria (SII/Banco
  Central), fecha explícita `es-CL`, y CTA a conversión (no solo dato).
- nonCopyBoundaries: no se copia copy, URL ni IA de terceros; solo
  observación de intent.
- ownerTarget: `/calculadoras/conversor-utm/` (owner intención
  valor-actual), `/calculadoras/conversor-uf/` (secundaria).
- successSignal: CTR `utm hoy` ≥4% y clics UTM +25% a 28 días con
  posición no peor que baseline; si posición cae >2 puestos, `HALT` y
  revertir.
- ownership conflict check: pass; sin superficie nueva.

## Fases y gates

1. **F0 — Baseline congelado (1 día).** Registrar GSC + analytics de
   la última semana completa (W36 salvo re-export completo posterior)
   por URL/query como baseline firmado; listar superficies con medición
   activa y declararlas solo-lectura. Gate: baseline escrito en el PR.
2. **F1 — Snippet UTM (1 PR pequeño).** Título/descripción/H1/primer
   párrafo UTM; `CalculatorJsonLd` sincronizado; `seoTitle` vía mecanismo
   existente (precedente plan 067). Verificar `check:reader-facing-copy`,
   `check:dialect`, `astro check`.
3. **F2 — Snippet UF (1 PR pequeño, tras F1).** Mismo tratamiento UF.
   No paralelo con F1 (evita mezclar efectos).
4. **F3 — Enlazado interno (1 PR).** Entrantes desde hub UF + 3
   calculadoras afines; salientes UTM/UF → arriendo/renta/sueldo.
   Contar ≤2 inter-cluster por artículo editado
   (`INTER_CLUSTER_MAX_2_PER_EDIT`).
5. **F4 — Striking-distance (read-only + selección).** Top-10 queries
   pos 4–15 con >500 impr; proponer fixes de intent solo sobre páginas
   existentes; lo que pida URL nueva → backlog bloqueado, no este plan.
6. **F5 — Medición (14–28 días).** Comparar GSC clics/CTR/posición vs
   baseline; RUM LCP/INP/CLS sin regresión. Decisión: keep / revert /
   extender a segunda query.

STOP/HALT:

- Si `check:routes` reporta added/removed inesperado → `HALT`.
- Si aparece ventana de medición OBS/PR activa sobre la URL objetivo que
  este plan no declaró → `HALT` hasta reconciliar (precedente: revert
  live-titles 2026-08-10).
- Si datos GSC incompletos (semana <7 días o export truncado, precedente
  plan 111) → no decidir; esperar semana completa.
- Si copy toca afirmación YMYL numérica sin fuente → `HALT` hasta
  dossier/auditoría.

## Métricas

| Métrica | Baseline (semana completa firmada en F0) | Umbral éxito (28d) |
|---|---|---|
| Clics UTM (páginas) | a firmar en F0 (ref. W37 parcial: 738/sem) | +25% |
| CTR `utm` / `utm hoy` | ~2,2% | ≥4% |
| Posición `utm hoy` | ~5,9 | ≤4 y no peor que base |
| Clics UF | 295 eventos calc | +15% |
| RUM LCP p75 UTM/UF | ~900 ms | sin regresión (>1.700 ms = revert) |

## Rollback

Revert del PR de snippet/enlace correspondiente; re-correr
`pnpm run check:routes`, `pnpm run check:rss`,
`pnpm run check:reader-facing-copy`. Sin migración de datos.

## Progress log

- 2026-09-16 — Plan creado (TODO). Pendiente sign-off y baseline firmado.
- 2026-09-16 — F0 baseline registrado (sin commit, por instrucción): `docs/reports/CTR-BASELINE-W36-2026-09-16.md` (W36 2026-08-31→09-06, 7 días verificados; W37 excluida por truncada 5 días). UTM: 1.484 clics / 170.074 impr / CTR 0,87% / pos 7,25; `utm` 1,78% @ 6,73, `utm hoy` 0,95% @ 6,66. UF: 6 clics / 24.831 impr / CTR 0,02% / pos 9,69; funnel UTM 1280/856/842, UF 169/144/141. Sin ventana OBS/PR activa sobre UTM/UF (STOP no triggered). F0 sigue TODO — firma del owner pendiente.
