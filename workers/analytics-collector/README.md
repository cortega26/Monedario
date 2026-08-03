# `analytics-collector` Cloudflare Worker

Recolecta eventos first-party de analytics y exporta semanalmente los agregados
de KV a R2. Arquitectura y decisiones de privacidad:
`docs/adr/ADR-20260628-first-party-analytics.md`. Calendario y semántica de
razones: `docs/adr/ADR-20260716-analytics-calendar-and-event-ratios.md`.
Despliegue y verificación de paridad: `docs/adr/ADR-20260716-analytics-worker-deployment-parity.md`
y `docs/operations/runbooks/analytics-worker-deployment.md`.

## Qué hace

1. **Ingesta:** `POST /api/analytics/event` acepta eventos allowlisted
   (calculadoras, next steps, shares, alerts, support). Valida el payload,
   rechaza PII/keys desconocidas y acumula contadores en KV
   (`telemetry:v1` antes del cutover, `telemetry:v2` después — ver ADR de
   calendario).
2. **Export semanal (cron):** cada lunes `57 7 * * MON` UTC agrega los
   contadores de la semana ISO completa anterior y escribe
   `analytics-exports/YYYY-Www.json` en R2 (`ANALYTICS_EXPORTS` →
   `monedario-analytics-exports`). El artefacto es agregado, sin raw events ni
   PII.
3. **Export manual:** `GET /api/analytics/export?week=YYYY-Www` protegido por
   `EXPORT_SECRET` — **solo** por header `Authorization: Bearer <EXPORT_SECRET>`;
   las credenciales en query-string se rechazan (401). El endpoint devuelve
   solo metadatos (`week`, `window`, `rows`, `totalEvents`), nunca `data` ni
   la clave R2.

## Comandos canónicos

Todos usan la config explícita del worker (`--config
workers/analytics-collector/wrangler.toml`).

| Propósito | Comando |
|---|---|
| Autenticación / cuenta | `pnpm exec wrangler whoami` |
| Dry run (sin desplegar) | `pnpm exec wrangler deploy --dry-run --config workers/analytics-collector/wrangler.toml` |
| Dev local (cron emulado) | `pnpm run worker:analytics:dev` |
| Desplegar | `pnpm run worker:analytics:deploy` |
| Tail de logs | `pnpm run worker:analytics:tail` |
| Versión desplegada / cron / paridad | `pnpm run data-signals:analytics:verify:local -- --deployed-not-before=...` |
| Smoke de export autenticado | `pnpm run data-signals:analytics:verify:local -- --smoke-export --week=YYYY-Www` |

Ninguno de estos comandos imprime ni persiste secretos; `EXPORT_SECRET` viaja
solo por header o por `wrangler secret put` (nunca por URL ni en archivos
trackeados).

## Local development

```bash
pnpm run worker:analytics:dev
```

Wrangler levanta el worker local con el emulador de cron (`--test-scheduled`).
Para disparar el handler `scheduled` localmente:

```bash
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

Para el endpoint manual local, configurar `EXPORT_SECRET` en
`.dev.vars` (gitignored):

```ini
# workers/analytics-collector/.dev.vars
EXPORT_SECRET = "valor-solo-local"
```

## Secrets

- `EXPORT_SECRET` — protege el endpoint manual de export. Se configura con:
  ```bash
  pnpm exec wrangler secret put EXPORT_SECRET --config workers/analytics-collector/wrangler.toml
  ```
  Rotación: re-ejecutar el mismo comando con el nuevo valor y actualizar
  `EXPORT_SECRET` en los GitHub secrets si el workflow de deploy lo usa.
- `EXPORT_GITHUB_TOKEN` — opcional, solo si el export semanal se persistiera en
  el repo (hoy el export vive en R2; ver `wrangler.toml`).

## Verificación post-deploy

El despliegue se hace por `.github/workflows/deploy-analytics-collector.yml`
(dispatch manual) y verifica automáticamente:

1. versión activa (posterior al inicio del deploy);
2. cron exacto `57 7 * * MON`;
3. rechazo de credenciales en query-string;
4. smoke de export autenticado por header (con `EXPORT_SECRET` configurado);
5. frescura del artefacto R2 (metadatos vía `If-Modified-Since`, sin descargar
   el contenido).

Si algún chequeo falla, el run falla de forma explícita: un despliegue stale
debe ser visible, no detectarse una semana después.

## Rollback

```bash
# Volver al deployment anterior
pnpm exec wrangler rollback --config workers/analytics-collector/wrangler.toml

# Ver versiones/deployments disponibles
pnpm exec wrangler deployments list --config workers/analytics-collector/wrangler.toml
```

Procedimiento completo (incluido el chequeo de paridad tras el rollback) en
`docs/operations/runbooks/analytics-worker-deployment.md`.

## File map

| Archivo | Propósito |
|---|---|
| `src/index.ts` | Worker: ingesta de eventos, validación estricta, contadores KV, export semanal y endpoint manual. |
| `wrangler.toml` | Config: ruta `monedario.cl/api/analytics/*`, cron `57 7 * * MON`, KV/R2, vars. |
| `tsconfig.json` | TS config del worker. |
| `../../tests/workers/analytics-collector/schema.test.ts` | Tests unitarios del worker (validación, calendario, export, auth por header). |
| `../../scripts/data-signals/verify-analytics-worker-deployment.mjs` | Verifier de paridad de despliegue (versión, cron, auth, R2). |
