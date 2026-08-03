# Analytics Worker Deployment — Runbook

Despliegue y verificación de paridad del worker `monedario-analytics-collector`.
Contexto y decisiones: `docs/adr/ADR-20260716-analytics-worker-deployment-parity.md`.
Comandos canónicos: `workers/analytics-collector/README.md`.

---

## 1. Prerrequisitos

### Token de Cloudflare (mínimamente scoped)

| Permiso | Uso |
|---|---|
| Workers Scripts:Edit | deploy + rollback |
| Workers Routes:Edit | ruta `monedario.cl/api/analytics/*` |
| Workers R2 Storage:Read | chequeo de frescura del verifier |

No se necesita scope de Observability para el verifier. No usar tokens amplios
de cuenta.

### Configuración de GitHub Actions

- Secret `CLOUDFLARE_API_TOKEN` — token mínimamente scoped (tabla de arriba).
- Variable `CLOUDFLARE_ACCOUNT_ID` — account ID de Cloudflare.
- Secret `EXPORT_SECRET` — opcional: habilita el smoke de export autenticado
  dentro del workflow. Sin él, la verificación corre en modo read-only y el
  smoke queda para ejecución local (paso 3).

Verificación local de configuración:

```bash
pnpm exec wrangler whoami
```

---

## 2. Desplegar (vía workflow)

```bash
gh workflow run deploy-analytics-collector.yml --ref main
```

El workflow: valida configuración → tests enfocados del worker → dry-run de
wrangler → `wrangler deploy` → verifier de paridad (versión activa, cron exacto
`57 7 * * MON`, rechazo de query-string, smoke de export si `EXPORT_SECRET`
está configurado, frescura R2).

Seguir el run:

```bash
gh run list --workflow=deploy-analytics-collector.yml --limit=5
gh run watch
```

**Un run falla de forma explícita si la paridad está rota** — por diseño no se
reporta "ok" con un worker stale.

### Check-list de evidencia post-merge (no secreta)

Tras el merge y el dispatch (paso 5 del plan): registrar en el PR o en el log
de operaciones cada uno de estos puntos:

- [ ] Run del workflow `deploy-analytics-collector.yml` en verde (commit
      desplegado = HEAD del branch/PR).
- [ ] `version-activa: PASS` con el deployment/version id y `created_on`.
- [ ] `cron-exacto: PASS` — `["57 7 * * MON"]`.
- [ ] `auth-rechaza-query-string: PASS` — HTTP 401.
- [ ] `smoke-export-autenticado: PASS` — HTTP 200, solo metadatos
      (`week`, `window`, `rows`, `totalEvents`).
- [ ] `r2-frescura: PASS` — objeto `analytics-exports/{week}.json` re-escrito,
      con `last-modified` y `content-length`.

Nunca copiar en la evidencia: tokens, `EXPORT_SECRET`, account ID, ni bodies
de respuesta.

---

## 3. Verificar paridad localmente (lectura)

Modo read-only (no escribe R2):

```bash
pnpm run data-signals:analytics:verify:local
```

Con semana explícita y smoke de export autenticado (re-escribe el artefacto
R2 de esa semana — comportamiento diseñado del endpoint manual):

```bash
pnpm run data-signals:analytics:verify:local -- --week=2026-W31 --smoke-export
```

Tras un deploy reciente, exigir que la versión activa sea posterior al
instante del deploy:

```bash
pnpm run data-signals:analytics:verify:local -- --deployed-not-before=2026-08-03T14:00:00Z
```

Salida esperada: cinco líneas `PASS` y `PARIDAD OK`; exit 0. Cualquier `FAIL`
o exit != 0 es una paridad rota (ir a §5).

Nota: `:local` carga credenciales desde `.env.local`/`.env` vía
`run-with-local-env.mjs`. En shells con variables exportadas explícitamente se
puede usar el script sin sufijo.

---

## 4. Rollback a una versión conocida

```bash
# Volver al deployment anterior
pnpm exec wrangler rollback --config workers/analytics-collector/wrangler.toml

# Listar deployments/versiones para elegir una versión conocida
pnpm exec wrangler deployments list --config workers/analytics-collector/wrangler.toml
```

Tras el rollback, re-verificar paridad en modo read-only; documentar el
rollback y su motivo en el log de operaciones.

---

## 5. Diagnóstico: paridad rota

| Síntoma en el verifier | Causa probable | Acción |
|---|---|---|
| `cron-exacto: FAIL` | Build vivo con trigger viejo (`57 7 * * 1`/domingo) o cron no propagado | Desplegar el HEAD correcto; si el workflow ya desplegó, esperar ≤15 min (el verifier reintenta solo) y re-correr |
| `auth-rechaza-query-string: FAIL` (responde 200) | Build vivo con auth por query-string (incidente W28) | Redeploy inmediato del build header-only |
| `smoke-export-autenticado: FAIL` (401/403) | `EXPORT_SECRET` del worker distinto al local, o build sin header auth | Sincronizar `wrangler secret put EXPORT_SECRET`; re-verificar |
| `version-activa: FAIL` (STALE) | Deploy no llegó a estar activo (falló en caliente) | `wrangler rollback` o redeploy; re-verificar |
| `r2-frescura: FAIL` (304) | Export manual no escribió R2 (handler roto) | Revisar logs del worker (`pnpm run worker:analytics:tail`) |
| `r2-frescura: FAIL` (404) | Semana sin export o semana futura | Verificar `--week`; la frescura semanal la cubre el gate data-signals/weekly-search-ops |

### Incidente conocido del pasado

2026-06-29: el cron `57 7 * * 1` no disparó la primera ocurrencia tras ser
registrado (~13 h después del deploy). Con el verifier, ese tipo de desfase se
detecta en el chequeo `cron-exacto`/`r2-frescura` del run de deploy, no una
semana después.

---

## 6. Rotación de secretos

### `EXPORT_SECRET` (worker + GitHub)

1. Nuevo valor: `pnpm exec wrangler secret put EXPORT_SECRET --config workers/analytics-collector/wrangler.toml`.
2. Si el workflow de deploy usa el smoke: actualizar el secret de GitHub
   `EXPORT_SECRET` con el mismo valor.
3. Verificar: `pnpm run data-signals:analytics:verify:local -- --week=<semana> --smoke-export`.

### `CLOUDFLARE_API_TOKEN`

1. Crear token en dash.cloudflare.com con el scope mínimo (§1).
2. `gh secret set CLOUDFLARE_API_TOKEN --body "..."`.
3. Verificar: `pnpm run data-signals:analytics:verify:local` (read-only).

Los secretos nunca viajan en URLs ni se registran en archivos trackeados.
