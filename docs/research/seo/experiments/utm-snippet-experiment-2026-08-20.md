# Experimento SEO: valor UTM en vivo en el snippet del conversor-utm

**Estado:** PENDIENTE DE MERGE/DEPLOY — el experimento aún no está activo (el PR #436 no está mergeado ni desplegado; el snippet dinámico solo existe en la rama).
**Fecha de inicio:** a determinar — el experimento comienza tras el merge/deploy del PR #436; no hay fecha efectiva de inicio hasta entonces.
**Fecha de evaluación:** inicio + 14 días mínimo, desde la primera evidencia de reprocesamiento del snippet por Google **posterior al deploy** (fecha de la primera impresión con el snippet nuevo en GSC "Recursos de página" o la última fecha de detección del snippet previo).

## Motivación

El conversor-utm concentra ~99% de la pérdida de clicks de la auditoría A/B (06–19 ago): -1.554 de -1.576 clicks, CTR 0.41% vs 0.72% del periodo B, mientras competidores nuevos (`utmchile.cl`, `valor-utm.cl`, `simplo.cl`, `indicadoreschile.cl`) capturan la intención dominante "¿cuánto vale la UTM hoy?" con el valor visible en SERP. El snippet estático actual no responde esa intención; el experimento expone el valor UTM vigente en title y description.

## Antecedente revertido

El commit `e0317d86` (2026-08-08) ya había introducido el valor en vivo; fue revertido en `a5796fa7` (2026-08-08, 3.5 h después) por **política, no por bug**: las páginas de dinero estaban dentro de la ventana de medición OBS-01 (PR #354) y cualquier cambio de title habría contaminado el baseline de CTR (ver `plans/README.md`). OBS-01 cerró con baseline validado (`33aaaf65`, PR #354) y el freeze del cohorte quedó LEVANTADO; `conversor-utm` no está en los freeze-paths de `check-obs01-freeze.mjs`. El motivo de bloqueo ya expiró.

## Snippet

### Anterior (control, estático)

- **Title:** `Conversor UTM a Pesos Chilenos: valor de hoy del SII | Monedario` (57 chars)
- **Description:** `Convierte cualquier monto en UTM a pesos chilenos al valor oficial del SII de hoy: multas, impuestos y trámites. Incluye conversión inversa (pesos a UTM) y tabla de referencia.`

### Nuevo (experimental, dinámico — valor vigente en build)

- **Title:** `UTM hoy: $71.649 — Convierte UTM a pesos | Monedario` (52 chars con el valor del 2026-08-20; límite del repo 65)
- **Description:** `Valor de la UTM hoy: $71.649. Convierte cualquier cantidad de UTM a pesos chilenos y consulta valores históricos actualizados.`

El valor se resuelve en build desde `getEconomicParameters()` (`src/application/use-cases/GetEconomicParameters.ts`), misma fuente de verdad que el cuerpo de la página: provider económico (`snapshot` por defecto / `live` mindicador, con fallback interno), validado por `assertEconomicParameters` (utm > 0 finito). Si el valor no está disponible, el provider devuelve el fallback interno y el gate de frescura (`evaluateCriticalMonthlyFreshness`, throw si stale) bloquea el build — nunca se publica un snippet sin valor. No hay valor hardcodeado en el snippet.

## Hipótesis

> Exponer el valor UTM vigente en el title/description del conversor-utm aumenta el CTR del snippet en las queries de intención de valor ("utm hoy", "valor utm hoy", "cuánto vale la utm", "utm a pesos") respecto del periodo control, sin pérdida en queries de conversión ("utm a peso chileno", "convertir utm a clp").

- **Medida primaria:** CTR en el cluster conversor-utm (agregado y por query objetivo).
- **Medidas secundarias:** clicks, impresiones, posición media.

## Queries objetivo (tracking en GSC)

`utm hoy`, `valor utm hoy`, `cuánto vale la utm`, `cuanto vale la utm`, `utm 2026`, `valor utm agosto 2026` (+ variantes `valor de la utm hoy`, `que vale la utm hoy`) y las de conversión: `utm a peso chileno`, `convertir utm a clp`, `utm a pesos chilenos`.

## Ventana de medición y reglas

- **Duración mínima:** 14 días desde la primera evidencia de reprocesamiento del snippet por Google **después del deploy** (no desde el deploy ni desde la creación del PR).
- **No hay auto-revert** por fluctuaciones de horas o pocos días: la posición/CTR del SERP oscila por demanda estacional (agosto 2026 vs julio = pico estacional UTM) y competidores; una caída corta NO es señal de fallo del experimento.
- **Revert inmediato (técnico)** solo si: error de build, valor incorrecto en el snippet publicado, H1/canonical/JSON-LD alterados, o gates de CI rotos.
- **Evaluación:** comparar CTR/clicks/impressions/position del cluster conversor-utm y de las queries objetivo entre ventana experimental y las 2 semanas previas (línea base jul-ago), más el seguimiento de competidores del SERP.

## Alcance y no-alcance

- **Solo** `src/pages/calculadoras/conversor-utm.astro` (title/description del Layout).
- No se tocan: H1, canonical, JSON-LD, FAQ, internal links, layout, otras calculadoras, otros titles/descriptions.
- No se realizó ninguna otra optimización SEO en esta tarea.

## Gates verificados (2026-08-20)

- `pnpm run test`: 157 files / 1367 tests PASS
- `pnpm run check:ci`: exit 0 (warnings preexistentes ajenos: small-details sueldo-liquido y urlcheck)
- `pnpm run build`: 327 páginas, 0 rotos, check-postbuild 6/6 OK
- HTML generado: `<title>UTM hoy: $71.649 — Convierte UTM a pesos | Monedario</title>` (52 chars), description con valor vigente, H1 y canonical intactos, JSON-LD presente (2 bloques)

## Cambios en el repo

- Branch: `feat/seo/utm-snippet-experiment` (PR #436, sin merge)
- Commit: `02eae483` (HEAD de la rama; el hash en `main` se completará tras el merge)
- Archivo modificado: `src/pages/calculadoras/conversor-utm.astro`