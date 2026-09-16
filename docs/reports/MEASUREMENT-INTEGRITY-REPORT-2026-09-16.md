# Reporte de cierre — Integridad de medición first-party (2026-09-16)

**Plan:** `docs/backlog/PLAN-measurement-integrity-2026-09-16.md` ·
**Owner de decisión:** Carlos Ortega · **Fecha:** 2026-09-16
**Alcance del reporte:** fases F0–F4 de ESTE plan;cambios de código del
worker (09-11 → 09-15) pertenecen a sus propios planes y aquí solo se
citan como estado verificado en lectura.

## 1. Estado de auditoría (F0 — 10/10, LIMPIO con 1 gap conocido)

Checklist §4/§5-adaptado/§9/§11 verificado en lectura sobre
`src/scripts/analytics.ts`, `src/contracts/analytics-events.ts`,
`workers/analytics-collector/**`, `public/_headers` y emisores:
inicialización única, no-duplicación, ClientRouter deshabilitado en
posts/guías/calculadoras, `page_path` como único localizador (sin
`page_location`/`page_title`/`hostname` por diseño), supresión
dev/test parcial-por-diseño (403 server-side a `Origin !=
monedario.cl`), fail-safe (timeout 3 s, keepalive, `.catch`
silencioso), CSP mínima (`connect-src 'self'`, collector same-origin),
privacidad re-verificada (allowlist + `FORBIDDEN_KEY_PATTERN` +
`rejectUnknown`, sin query/hash, `support_confirmed` sin emisores).
STOP triggers: ninguno. Tests medición F0: 7 archivos, 113/113 verdes.

## 2. Problemas encontrados (3, todos contenidos)

1. **Gap NextSteps (verificado, NO corregido aquí):**
   `src/components/NextSteps.astro:61,143-146,172-179` omite
   `calculator_id` fuera de `/calculadoras/<slug>/` → alimenta los
   buckets `calculator`/`unknown` (`next_step_click` 2 + `source_click`
   8 en W36). Owned por `PLAN-result-panel-conversion-2026-09-16.md`
   F1; aquí solo se documenta el efecto en atribución (derivadas §3–§4).
2. **W37 truncada a 5 días:** el export first-party declara ventana
   09-07 → 09-13 pero trae fechas 09-07 → 09-11 (321 filas). Excluida
   como evidencia por doctrina 7/7 (metodología §5); W36 queda única
   semana de comparación.
3. **Pausa de ingesta 09-11 (externa a este plan, estado verificado):**
   `ab4416ba` puso `ANALYTICS_DISABLED = "1"` por agotamiento de cuota
   KV; `47511b8b` (#477, 09-12) migró contadores/rate-limit fuera de KV
   (SQLite DO) y re-habilitó (`"0"`); deploy success 09-15 con ese HEAD.
   Sin impacto en la evidencia W36 (previa a la pausa).

## 3. Arquitectura verificada

Emisores (`calculator_id` = slug, `CLIENT_ONLY_PARAMS` nunca
transmitidos) → transporte same-origin `/api/analytics/event`
(allowlist + sanitización cliente) → worker `monedario-analytics-collector`
(`rejectUnknown`, rate limit, contadores DO) → R2
`analytics-exports/YYYY-Www.json` → scorecard semanal. Cero trackers
de terceros, cero orígenes nuevos en CSP (verificable en diff).

## 4. Archivos cambiados por ESTE plan (solo docs, cero código)

- `docs/operations/CALCULATOR-REGISTRY.md` (F1, creado; 22/22).
- `docs/operations/MEASUREMENT-COMPARISON-METHODOLOGY.md` (F2a, creado).
- `docs/operations/DERIVED-METRICS-DEFINITIONS.md` (F2b, creado).
- `docs/operations/ANALYTICS-VALIDATION-PROCEDURE.md` (F3, creado).
- `docs/reports/MEASUREMENT-INTEGRITY-REPORT-2026-09-16.md` (F4, este).
- Progress log del plan (entradas F2–F4).

Sin rutas, slugs, frontmatter, contenido, config ni código tocados.

## 5. Estado de taxonomía

v2 congelada (`ANALYTICS_SCHEMA_VERSION = 2`): 30 nombres allowlisted,
doble validación cliente + worker, payloads ≤2048 B, `destination_url`
solo interna, legado normalizado antes del boundary de privacidad.
`support_confirmed` definido pero no emitido (cero riesgo de
confirmación no fiable). `calculator_error` definido, no emitido
sitewide (cero ≠ sano —ver diccionario).

## 6. Estado del registry

22/22 `calculator_id` estables (slug = ruta con trailing slash),
categorías del set sugerido, emisores verificados 22/22, cross-check
W36 22/22 IDs resueltos. Buckets `calculator`/`unknown`: esperados,
fuera de tabla. Gate F1: PASS.

## 7. Evaluación de privacidad

Agregado sin montos, resultados, texto libre, PII ni identificadores
persistentes; IP solo como clave efímera de rate limit (120 s, no
exportada); UTM solo como tráfico agregado etiquetado (sin cohortes ni
retorno individual); consentimiento innecesario por diseño. Sin
hallazgos: ningún STOP de PII se activó en F0–F4.

## 8. Estado de tests

F0: 113/113 verdes (7 archivos analytics). F3 (hoy, sin cambios de
código): verifier unitario 33/33 verde; chequeo de forma W36 SHAPE OK;
`--help` del verifier exit 0. Suite completa no re-corrida en F2–F4
(fases docs-only, nada que regressar).

## 9. Configuración manual aún requerida (owner, post-deploy)

- Corrida viva del verifier (5 chequeos + smoke) con secretos.
- End-to-end en preview con acciones reales view/start/complete/intent
  y filas visibles en R2 (procedimiento §2–§4).
- Confirmación de volumen post-09-15 (primera semana completa con
  ingesta DO como única semana comparable futura; W36 sigue baseline
  histórico, no mezclar instrumentos KV↔DO sin nota).

## 10. Procedimiento de validación

Puntero único: `docs/operations/ANALYTICS-VALIDATION-PROCEDURE.md`
(prerrequisitos, pasos por evento, uso del verifier, filas esperadas,
rollback-if-red, evidencia ejecutada vs diferida el 2026-09-16).

## 11. Brechas remanentes

- Atribución `next_step_*`/`source_click` fuera de calculadoras (gap
  NextSteps → panel F1).
- `share_*` sin eventos en W36 (emisión/instrumentación, no demanda).
- `support_click`/`alert_interest_submit` en 0 con n bajo (`SIN DATOS
  SUFICIENTES`, nunca 0%).
- Verifier vivo + e2e real diferidos (§9).

## 12. Riesgos

- Leer ratios cruzados como conversión (mitigado: doctrina + ejemplo UF
  2.350% en metodología R4).
- Usar semanas incompletas o mezclar eras KV↔DO como comparables
  (mitigado: regla 7/7 + §9).
- Cron KV-era vs DO-era: el deploy 09-15 ya corre `30 5 * * MON` con
  ingesta DO; re-verificar paridad tras cualquier cambio de worker.

## 13. Experimentos Sprint-1 propuestos (no implementados)

1. Ampliación CTA post-resultado (apoyada en `next_step` W36 n = 117 ≥
   99; veredicto según registry, owned por plan panel).
2. Subir entrega de `support_shown` (n = 18 vs `n_min` 598: ~34 semanas
   a ritmo actual, fuera de ventana sin más exposición).
3. Instrumentar share y medir base 1 semana antes de cualquier regla
   +50% (supuesto interino p = 1%).
4. `source_click` direccional con Wilson semanal por 4 semanas
   comparables (sin veredicto puntual).
5. Alertas (`alert_interest_*`): ~7 semanas a ritmo W36 para `n_min`
   149; no decidir antes.

## 14. Cierre y gates del plan

F0 CLEAR · F1 DONE (22/22) · F2 FIRMADO por el owner 2026-09-16
(doctrina, este reporte + F2a/F2b) · F3 evidencia parcial registrada
(partes vivas diferidas con motivo) · F4 este documento (FIRMADO por el
owner 2026-09-16). Métricas del plan: emisores 22/22, duplicados/PII 0,
terceros nuevos 0, tests verdes.
Pendiente de deploy del worker: **ninguno** al 2026-09-16 (último
deploy success 09-15 cubre cron, auth header-only e ingesta DO).
STOP triggers activados en F2–F4: ninguno.
