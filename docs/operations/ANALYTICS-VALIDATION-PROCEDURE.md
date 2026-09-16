# Procedimiento de validación analytics end-to-end

**Owner:** `docs/backlog/PLAN-measurement-integrity-2026-09-16.md` (F3) ·
**Fecha:** 2026-09-16 · **Estado:** procedimiento FIRMADO por el owner
2026-09-16; ejecución parcial (partes read-only ejecutadas, partes con
credenciales diferidas —ver §7).
**Runbook de deploy:** `docs/operations/runbooks/analytics-worker-deployment.md` ·
**Verifier:** `scripts/data-signals/verify-analytics-worker-deployment.mjs` (plan 051).

Cadena validada: acción real en navegador → evento con nombre y
parámetros correctos → visible en el export R2
(`analytics-exports/YYYY-Www.json`).

## 1. Prerrequisitos

- Preview o local contra el collector (`/api/analytics/event`); **nunca
  PII real** (usar valores de prueba; el worker rechaza payloads con
  campos desconocidos y el cliente sanitiza por allowlist).
- Semana de prueba completa o ventana explícita; semana <7 días no
  decide (metodología §4), pero sí sirve para validar presencia de
  filas.
- Credenciales solo para las partes que las exigen (§5): token
  Cloudflare (`Workers Scripts:Read`, `R2:Read`) y `EXPORT_SECRET`
  (solo smoke). Sin ellas, ejecutar solo §7-partes-read-only.
- Taxonomía v2 vigente (`src/contracts/analytics-events.ts`) y
  diccionario (`docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md`).

## 2. Pasos por evento

Para cada fila: ejecutar la acción, confirmar el evento en `dataLayer`
(bus local de debug, no Google) y luego confirmar la fila agregada en
el export R2 de la semana. `calculator_id` = slug de la página
(`CALCULATOR-REGISTRY.md`).

| Evento | Acción real | Nombre/parámetros esperados | Fila esperada en export |
|---|---|---|---|
| `calculator_view` | Cargar `/calculadoras/<slug>/` | `calculator_view`, `calculator_id=<slug>`, `page_type=calculator`, `app_version` | `{event_name: calculator_view, calculator_id: <slug>, count ≥ 1}` |
| `calculator_start` | Primera interacción sustantiva (foco en input o botón) | `calculator_start`, `calculator_id`, `interaction_variant ∈ {focus,input,button}` | fila `calculator_start` para el `slug`, una por vista |
| `calculator_complete` | Completar inputs hasta renderizar un resultado válido | `calculator_complete`, `calculator_id` (+ `outcome`/`mode` acotados donde aplique) | fila `calculator_complete`; recalcular no suma (dedupe) |
| `next_step_click` (intent) | Clic en el enlace contextual post-resultado | `next_step_click`, `calculator_id`, `next_step_id` (+ UTM propias si las lleva) | fila `next_step_click` con ese `next_step_id` en `dimensions` |
| `source_click` (intent) | Clic en fuente oficial/metodología | `source_click`, `source_type ∈ {official,methodology,snapshot}` | fila `source_click` |
| `support_click` / `share_success` / `alert_interest_submit` (intent) | Clic a `/apoyar/` / compartir exitoso / "Me interesa" | nombres respectivos con `support_location=post_result` / `share_method` / variante | filas respectivas; `support_confirmed` **no** es validable (sin emisores hasta callback fiable) |

Nota NextSteps (gap conocido, owned por plan panel F1): fuera de
`/calculadoras/<slug>/` el `next_step_click` puede llegar sin
`calculator_id` (bucket `calculator`). En la validación, un clic sin
`calculator_id` confirma **emisión** pero no **atribución**; registrarlo
como tal, no como fallo del collector.

## 3. Cómo correr el verifier 051

Solo lectura (no escribe R2, no necesita `EXPORT_SECRET`):

```bash
pnpm run data-signals:analytics:verify:local
```

Con semana explícita y smoke autenticado (**re-escribe** el artefacto
R2 de esa semana —comportamiento diseñado del endpoint manual):

```bash
pnpm run data-signals:analytics:verify:local -- --week=2026-W36 --smoke-export
```

Tras un deploy reciente, exigir frescura de la versión activa:

```bash
pnpm run data-signals:analytics:verify:local -- --deployed-not-before=2026-09-15T01:36:00Z
```

Salida esperada: cinco líneas `PASS` + `PARIDAD OK`, exit 0. Sin
credenciales en el shell, usar `run-with-local-env` (`:local` carga
`.env.local`/`.env`); en este entorno sin secretos el verifier falla
en configuración (exit 2), lo que también es evidencia válida de que
no hubo acceso de escritura (ver §7).

## 4. Filas de evidencia esperadas

Tras el smoke o el cron del lunes (`30 5 * * MON`), el export de la
semana debe contener, como mínimo, una fila por cada par
(`event_name`, `calculator_id`) ejercitado, con `week` y `window`
coincidentes, `schemaVersion: 2`, 7 fechas distintas y conteos
enteros ≥ 0. Ejemplo de fila válida (forma, no dato real):

```json
{"date": "2026-09-15", "event_name": "calculator_complete",
 "dimensions": "5.5.1", "count": 3, "calculator_id": "conversor-utm"}
```

Chequeo de forma ejecutable sin credenciales (ver §7): validar
`source`, `schemaVersion`, `week`, `window`, 7/7 fechas, tipos de
campos y ausencia de conteos negativos.

## 5. Rollback-if-red

| Síntoma | Causa probable | Acción |
|---|---|---|
| `cron-exacto: FAIL` | Build vivo con trigger viejo o cron no propagado | Redeploy del HEAD; si recién desplegado, esperar ≤15 min y re-correr |
| `auth-rechaza-query-string: FAIL` (200) | Build con auth por query-string (incidente W28) | Redeploy inmediato del build header-only |
| `smoke-export-autenticado: FAIL` (401/403) | `EXPORT_SECRET` distinto o build sin header auth | `wrangler secret put EXPORT_SECRET`; re-verificar |
| `version-activa: FAIL` (STALE) | Deploy no llegó a activarse | `wrangler rollback` o redeploy; re-verificar |
| `r2-frescura: FAIL` (304/404) | Handler roto o semana sin export | Logs del worker (`worker:analytics:tail`); verificar `--week` |
| Fila esperada ausente en export | Emisor caído, ingesta pausada o allowlist | Revisar emisor + estado de ingesta antes de tocar el collector |

Rollback canónico (runbook §4):

```bash
pnpm exec wrangler rollback --config workers/analytics-collector/wrangler.toml
```

Tras el rollback, re-verificar en modo read-only y registrar motivo en
el log de operaciones. Detalle de causas en el runbook §5.

## 6. Criterio de gate F3

Evidencia de corrida: verifier en verde (o diferido con motivo
registrado) + filas del §2 visibles en export + chequeo de forma en
verde. Un `FAIL` del verifier es paridad rota (ir a §5), nunca
"ruido".

## 7. Evidencia ejecutada 2026-09-16 (este plan, sin deploy)

**Ejecutado (read-only, sin credenciales, sin escrituras):**

- Verifier `--help`: exit 0, uso impreso correctamente
  (`verify-analytics-worker-deployment.mjs`).
- Chequeo de forma sobre `analytics/2026-W36.json`: **SHAPE OK** —
  357 filas, 7/7 fechas (08-31 → 09-06), 0 filas malformadas, 0
  conteos negativos, `source=first-party-events`, `schemaVersion=2`.
- Tests unitarios del verifier:
  `tests/scripts/verify-analytics-worker-deployment.test.ts` —
  **33/33 verdes** (`pnpm exec vitest run`, 729 ms).
- Estado de deploy (lectura vía `gh`, sin tocar producción): último
  run `deploy-analytics-collector.yml` **success** 2026-09-15T01:35:58Z
  (`34917907337`, head `7bf96a81`), posterior a los cambios del worker
  del 11–14 sep (pausa de ingesta, migración KV→DO, cron
  `30 5 * * MON`). Run previo del 09-11 en `failure`: hubo un deploy
  fallido intermedio, ya superado por el del 09-15.

**Diferido (requiere secretos o navegador real, no disponible en esta
sesión; lo ejecuta el owner post-deploy):**

- Verifier vivo (5 chequeos contra Cloudflare + smoke de export).
- Acciones reales view/start/complete/intent en preview con filas
  visibles en R2 (§2).
- Confirmación de reanudación de ingesta tras la pausa del 09-11
  (ver reporte de cierre § Brechas).

STOP triggers tocados: ninguno (cero PII en eventos, cero requests a
terceros, cero cambios de código en este plan).
