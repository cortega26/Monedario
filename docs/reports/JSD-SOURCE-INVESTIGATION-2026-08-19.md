# Investigación: fuente de la inyección de Cloudflare JavaScript Detections

**Fecha:** 2026-08-19
**Modo:** investigación read-only + cambio mínimo autorizado (PUT `enable_js=false`)
**Estado:** causa raíz confirmada y mitigada — `enable_js=false` en producción (HTTP 200); PR #427 (sin merge) retira `no-transform` para restaurar la compresión
**Relacionado:** [Runbook CSP y Cloudflare JavaScript Detections](../operations/runbooks/CSP_CLOUDFLARE_JSD_2026-08-02.md), PR #425, PR #426, PR #427, TD-0099

## Contexto

Con `Cache-Control: no-transform` (rollback PR #426) la inyección de JSD está
suprimida y revalidada. Antes del rollback, un navegador Chromium limpio recibía,
en respuestas 200 ordinarias, un bootstrap Cloudflare que crea
`window.__CF$cv$params` y carga `/cdn-cgi/challenge-platform/scripts/jsd/main.js`
(bloqueado por la CSP hash-only). Bot Fight Mode está OFF en el dashboard, por lo
que se investigó la fuente real de la inyección.

## 1. Estado efectivo medido

**Medido por API (HTTP 200) con un token dedicado con permiso `Zone > Bot Management`:**
`GET /zones/{zone_id}/bot_management` devolvió **`enable_js: true`** con **`fight_mode: false`**,
`stale_zone_configuration` ausente, `ai_bots_protection`/`content_bots_protection`/`crawler_protection`
en `disabled`, `is_robots_txt_managed: true`, `cf_robots_variant: off`, `using_latest_model: true`.

El token anterior de `.env.local` no tiene permiso sobre `bot_management`
(`GET` → 403 `{"code":10000,"message":"Authentication error"}`) — por eso el
2026-08-02 no se pudo medir ni desactivar.

## 2. Fuente más probable

**JavaScript Detections (`enable_js=true`)** — no Bot Fight Mode. **Confirmado por API el 2026-08-19**
(`enable_js: true`, `fight_mode: false`): son estados independientes en
`BotFightModeConfiguration`, y en zonas Free el toggle "JS detections" del
dashboard no se expone, por lo que el estado persiste sin un control visible.

> "For Bot Fight Mode customers, JavaScript Detections is automatically enabled
> and cannot be disabled."

BFM está OFF en el dashboard, pero en el esquema de la API
(`BotFightModeConfiguration`) `fight_mode` y `enable_js` son booleanos
**independientes**: `enable_js` puede permanecer activo con `fight_mode=false`.
En zonas Free el toggle "JS detections" del dashboard no se expone, por lo que el
estado persiste sin un control visible.

## 3. Evidencia

1. **Patrón de inyección idéntico al documentado para JSD:** script inline +
   source hacia el Challenge Platform con paths `/cdn-cgi/challenge-platform/…`,
   en respuestas 200 ordinarias de HTML page view (observado 02-08 y 19-08 en
   Chromium limpio).
2. **Solo page views, no AJAX/curl:** la doc: "JavaScript is injected only in
   response to requests for HTML pages or page views, excluding AJAX calls. API
   and mobile application traffic is unaffected." Coincide con la ausencia de
   inyección en curl sin fingerprint de navegador.
3. **Supresión por `no-transform` (confirmación concluyente):** la doc: "If the
   origin response includes a `Cache-Control: no-transform` directive, Cloudflare
   does not inject the JavaScript Detections script." Es exactamente el
   comportamiento observado en PR #425 (inyección al retirarlo) y PR #426
   (ausencia al restaurarlo). Ninguna otra función de Cloudflare se suprime por
   `no-transform`.
4. **Error CSP coincidente:** el ejemplo oficial de la doc ("Refused to execute
   inline script because it violates the following Content Security Policy
   directive: 'script-src self'… a hash … or a nonce") es idéntico al error
   observado con la CSP hash-only.

### Funciones descartadas (inspeccionan o retan, no inyectan en 200 ordinarios)

| Función | Estado medido | Rol |
|---|---|---|
| Bot Fight Mode (`fight_mode`) | OFF (dashboard) | Enforcement; al activarse auto-habilita JSD |
| Cloudflare Managed Free Ruleset v74 | Activo (31 reglas, `block`, fase `http_request_firewall_managed`) | Inspección/block por reglas; no inyecta |
| Browser Integrity Check (`browser_check`) | `on` | Inspección de headers; reto a peticiones sospechosas |
| Managed Challenges | — | Página interstitial (no inyección en 200 normales) |
| DDoS L7 v3397 / Normalization v6 | Activos | Inspección/limpieza |
| WAF custom rules | No existen (entrypoint 404) | Nada ejecuta `cf.bot_management.js_detection.passed`; JSD es informativo, sin enforcement |

## 4. Permiso/API exacto requerido (por qué el 403 del token anterior)

Documentación de la API (`/api/resources/bot_management/methods/get/`):

> "Accepted Permissions (at least one required): `Bot Management Write`,
> `Bot Management Read`"

El 403 `code 10000` = el token no incluye ese permiso. Nota: el permiso "Bot
Management" se ofrece en la UI de API Tokens a cuentas con acceso a bot
management; para Free quizá no esté disponible, y la verificación del estado
`enable_js` tendría que ser manual en el dashboard (Security → Settings →
"JS detections", solo visible para SBFM/Enterprise).

## 5. Cambio mínimo para desactivar solo JSD (sin tocar WAF/DDoS/proxy)

Opción A — API: `PUT /zones/{zone_id}/bot_management` con body
`{"enable_js": false}` (manteniendo `fight_mode=false` y el resto intacto).
Requería token con `Bot Management Write`.

Opción B — Opt-out confirmado por doc para Free: `Cache-Control: no-transform`
en el origin (fue la mitigación del PR #426, ya retirada por el PR #427).

## 6. Cambios ejecutados

- **2026-08-19 (autorizado por el usuario):** `PUT /zones/{zone_id}/bot_management`
  con body `{"enable_js": false}` → **HTTP 200**, `success: true`. GET inmediato
  confirmó: `enable_js: false`, `fight_mode: false`, y el resto de campos
  idénticos al snapshot previo (`ai_bots_protection`/`content_bots_protection`/
  `crawler_protection` `disabled`, `ai_training`/`ai_search`/`ai_user` `disabled`,
  `is_robots_txt_managed: true`, `cf_robots_variant: off`,
  `ai_bots_migration_opt_out: false`, `using_latest_model: true`,
  `stale_zone_configuration` ausente). **Solo `enable_js` cambió.**
- **PR #427 (2026-08-19, sin merge):** retira `no-transform` de todas las reglas
  `Cache-Control` de `public/_headers` para restaurar la compresión del edge,
  con invariante de test invertido (ninguna regla con `no-transform`) y TTL
  intactos. Post-deploy: verificar `Content-Encoding` presente y ausencia de
  `__CF$cv$params` en Chromium limpio (verificación obligatoria del runbook).