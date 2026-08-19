# CSP y Cloudflare JavaScript Detections

**Estado:** `REVERSAL-PENDING-MERGE` (2026-08-19, PR #427 — segunda reversión de `no-transform`; **sin merge**; ver "Actualización 2026-08-19 (2ª reversión)")
**Estado anterior:** `VALIDATED` (2026-08-02, deploy PR #382 + fix de override en `_headers` commit `09dc219d`) → rollback PREPARADO el 2026-08-19 (PR #426, ver "Actualización 2026-08-19")
**Fecha de reproducción:** 2026-08-02
**Ruta:** `https://monedario.cl/calculadoras/conversor-utm/`

## Evidencia y causa

Un navegador Chromium limpio recibe un error CSP para un script inline no
presente en `dist`. La respuesta HTML contiene un bootstrap agregado por
Cloudflare que crea `window.__CF$cv$params` y carga
`/cdn-cgi/challenge-platform/scripts/jsd/main.js`. El contenido incluye Ray ID y
timestamp por request, por lo que su SHA-256 cambia y no puede declararse en el
build.

Cloudflare documenta que Bot Fight Mode activa JavaScript Detections y que, sin
nonce, su snippet inline puede producir exactamente este error. La API de zona
respondió 403 para `/bot_management`, así que no se cambió la protección de bots.
La misma documentación establece que una respuesta con `Cache-Control:
no-transform` no recibe la inyección JSD.

La CSP efectiva permite hashes generados, `'self'`, `'wasm-unsafe-eval'` para
Pagefind y orígenes explícitos. No contiene wildcard, `'unsafe-inline'` en
`script-src` ni `'unsafe-eval'`.

## Corrección mínima (2026-08-02, vigente hasta la 2ª reversión del PR #427)

`public/_headers` declaraba `Cache-Control: no-transform` en el bloque global **y en
cada regla específica que define su propio `Cache-Control`** (calculadoras, posts,
guias, home, assets, etc.). Cloudflare no combina valores del mismo header entre
reglas: la regla más específica reemplaza por completo el valor global, por lo que
un `no-transform` solo en `/*` dejaba desprotegidas las rutas con regla propia — fue
el motivo por el que la inyección JSD reapareció en `/calculadoras/*` pese al fix
inicial (2026-08-02, validación post-merge). El invariante del test era: todo
`Cache-Control` de `_headers` debía incluir `no-transform` (histórico; la 2ª
reversión del PR #427 lo invierte a "ninguna regla debe incluirlo"). Además, los
orígenes de Ko-fi salieron de la CSP global y quedaron limitados a
`/apoyar/*`.

Esto preserva la CSP hash-only y evita las alternativas inseguras: no agrega
`'unsafe-inline'`, nonce estático, wildcard ni un hash copiado de una respuesta.
Tampoco carga Ko-fi fuera de la página de apoyo.

## Verificación reproducible (2026-08-02, contexto del fix original)

Verificación vigente en esa fecha (cuando `no-transform` estaba activo):

1. Ejecutar build y confirmar que `dist/_headers` contiene `no-transform` y los
   hashes generados.
2. Desplegar el cambio y esperar el TTL HTML máximo de cinco minutos.
3. Con un perfil Chromium limpio, abrir producción y exigir:
   - header efectivo con `no-transform`;
   - ausencia de `__CF$cv$params` en el HTML;
   - cero errores `Executing inline script violates`;
   - cálculo, analítica, sharing y búsqueda funcionales.
4. Si Cloudflare ignora `no-transform`, detener el despliegue y desactivar Bot
   Fight Mode desde **Security → Bots**; en plan Free no admite skip por ruta.

Nota operativa (2026-08-02): el token de `.env.local` no tiene permiso de
Cache Purge (API de zona devuelve 10000), así que la propagación del edge en
dominio custom depende del TTL de 5 min; la URL limpia puede seguir sirviendo
el HTML pre-deploy mientras tanto (verificar con `?cb=<timestamp>` para leer
el origen). Para purgar a mano se requiere un token con permiso
`Zone > Cache Purge`.

La verificación de producción permanece pendiente hasta que este diff se
despliegue. Preview/build solo demuestran la configuración de origen, no la
respuesta final de la zona.

## Rollback (2026-08-02, contexto del fix original)

Retirar únicamente `Cache-Control: no-transform` si se demuestra una regresión
material de entrega, volver a desplegar y documentar el resultado. No relajar
CSP. La alternativa es desactivar Bot Fight Mode o adoptar una protección
configurable compatible con nonce dinámico. La inversión de este criterio (2ª
reversión) se documenta en la sección "Actualización 2026-08-19 — causa raíz
confirmada y 2ª reversión (PR #427)" y su "Rollback" correspondiente.

## Actualización 2026-08-19 — reversión experimental retirada (rollback)

**Qué se probó:** el PR #425 (merge `909f4d05`) retiró `no-transform` de todas
las reglas para restaurar la compresión del edge, tras la auditoría de Ahrefs
"Slow pages" (`docs/latest_audits/ahrefs-slow-pages-2026-08-18.md`, archivo
retirado con el revert). Bot Fight Mode estaba verificado **OFF** manualmente el
2026-08-19 (Managed Ruleset activo, sin BFM).

**Resultado de la reversión:** la compresión volvió al origin
(`Content-Encoding: br`, `cache-control` sin `no-transform` en respuesta
cache-busted y en URLs revalidadas; el edge conservó objetos stale >15 min por
falta de permiso de Cache Purge, comportamiento ya documentado arriba). **Pero
JSD re-inyectó su bootstrap en respuestas de navegador pese a BFM OFF:**

- DOM Chromium limpio (`https://monedario.cl/?cb=20260819-validacion1`,
  2026-08-19 ~15:45 UTC): `window.__CF$cv$params={r:'a2da4897ff387d01',t:'MTc4NzE1NDMwNw=='}`
  + `<script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js">` inyectado
  en `<head>`.
- Consola: `Executing inline script violates ... The action has been blocked`
  (bootstrap JSD bloqueado por la CSP hash-only; hash dinámico no declarable)
  y violaciones report-only de `/cdn-cgi/challenge-platform/`.
- curl (sin fingerprint de navegador): HTML sin `__CF$cv$params` — la inyección
  es condicional al cliente, como en la evidencia original del 02-08.

**Conclusión:** con BFM OFF verificado, la inyección JSD continúa (el toggle de
JavaScript Detections puede estar activo por separado, o el Managed Ruleset la
produce); el escudo `no-transform` sigue siendo necesario y la compresión del
edge permanece deshabilitada por seguridad.

**Rollback ejecutado (PR #426, merge `75165187`, 2026-08-19, desplegado):** revert
`dabed860` de `909f4d05` — restauró `no-transform` en todas las reglas
`Cache-Control` de `public/_headers` y el invariante del test ("toda regla debe
incluir no-transform"). Revalidación post-deploy: `no-transform` efectivo en el
edge (origin `?cb` MISS, `/accessibilidad/` DYNAMIC con `no-transform`, edge
`/`, `/glosario/uf/`, `/posts/liquidacion-de-sueldo/` con age 11), cero
`__CF$cv$params`/`challenge-platform` en Chromium limpio, consola vacía en 5
páginas, búsqueda, calculadora, analítica (202) y sharing funcionales.

## Actualización 2026-08-19 — causa raíz confirmada y 2ª reversión (PR #427)

**Causa raíz confirmada por API (2026-08-19):** con un token dedicado con
permiso `Zone > Bot Management` se leyó `GET /zones/{zone_id}/bot_management`
(HTTP 200): **`enable_js: true`** con **`fight_mode: false`**. La inyección de
`__CF$cv$params` + `/cdn-cgi/challenge-platform/scripts/jsd/main.js` era
**JavaScript Detections (`enable_js`)** — no Bot Fight Mode (ya OFF) ni el
Managed Ruleset. `stale_zone_configuration` ausente (sin configuración obsoleta
heredada). El token anterior no tenía permiso sobre `bot_management` (403
`10000`), por eso el 02-08 no se pudo medir ni desactivar.

**Cambio ejecutado en Cloudflare (2026-08-19, autorizado):** `PUT
/zones/{zone_id}/bot_management` con body `{"enable_js": false}` → HTTP 200.
GET inmediato confirmó: `enable_js: false`, `fight_mode: false`, y el resto de
campos de Bot Management sin cambios (`ai_bots_protection`, `content_bots_protection`,
`crawler_protection` `disabled`; `is_robots_txt_managed` true; `cf_robots_variant`
off; `using_latest_model` true; `stale_zone_configuration` ausente). Solo
`enable_js` cambió.

**2ª reversión (PR #427, 2026-08-19, SIN MERGE):** con la fuente de la inyección
desactivada explícitamente, se retira de nuevo `no-transform` de todas las
reglas `Cache-Control` de `public/_headers` para restaurar la compresión del
edge. **No se toca** CSP, TTL (`max-age`), WAF, configuración de Cloudflare, código
ni rutas. El invariante del test pasa de "toda regla debe incluir no-transform" a
"ninguna regla debe incluir no-transform", conservando la red de seguridad de TTL
(`max-age=300` en las reglas HTML). Verificación post-deploy obligatoria abajo.

## Verificación reproducible (post-deploy del PR #427 — OBLIGATORIA)

1. Ejecutar build y confirmar que `dist/_headers` no contiene `no-transform` y
   conserva los hashes generados (`pnpm run check:postbuild` o
   `node scripts/check-postbuild.mjs dist`).
2. Desplegar y esperar el TTL HTML máximo de cinco minutos.
3. Con `curl` (negociando `Accept-Encoding: br, gzip, zstd`) y con un perfil
   Chromium limpio, exigir en producción:
   - **`Content-Encoding` presente** (zstd/br/gzip según negociación y plan) en
     HTML y en `/posts/*`, `/tags/*`, `/calculadoras/*`, `/glosario/*`,
     `/leyes/*`, `/guias/*`, y en assets `/_astro/*`;
   - multiplicación de bytes eliminada (HTML de ~92 KB → ~25 KB sobre el cable);
   - ausencia de `__CF$cv$params` en el HTML (sin inyección JSD — ahora
     desactivada en Cloudflare);
   - cero errores `Executing inline script violates` en consola;
   - cálculo, analítica, sharing y búsqueda funcionales.
4. Si el HTML trae `__CF$cv$params` o aparecen violaciones CSP de
   `/cdn-cgi/challenge-platform/`, ejecutar el rollback (abajo)
   **inmediatamente** y re-verificar.

Nota operativa (2026-08-02): el token de `.env.local` no tiene permiso de
Cache Purge (API de zona devuelve 10000), así que la propagación del edge en
dominio custom depende del TTL de 5 min; la URL limpia puede seguir sirviendo
el HTML pre-deploy mientras tanto (verificar con `?cb=<timestamp>` para leer
el origen). Para purgar a mano se requiere un token con permiso
`Zone > Cache Purge`.

## Rollback

Si reaparece la inyección JSD (`__CF$cv$params` / errores CSP de
`/cdn-cgi/challenge-platform/`) tras este deploy:

1. Restaurar `no-transform` en **todas** las reglas `Cache-Control` de
   `public/_headers` (el invariante anterior: Cloudflare no combina valores del
   mismo header entre reglas, la regla más específica reemplaza a la global).
2. Revertir el test `tests/integration/csp-hashes.test.ts` al invariante
   "toda regla debe incluir no-transform".
3. Desplegar, esperar el TTL de 5 min y re-verificar ausencia de JSD.
4. Revisar en Cloudflare que `enable_js` siga en `false` y `fight_mode` en
   `false` (Security → Bots; el estado actual se leyó por API el 2026-08-19).
5. Registrar el resultado en este runbook y en `docs/TECH_DEBT_BACKLOG.md`
   (TD-0099) con fecha y evidencia.

Alternativas de fondo si JSD vuelve: verificar por API (token con permiso
`Zone > Bot Management`) que `enable_js`/`fight_mode` sigan desactivados;
si se reactivan, apagarlos desde **Security → Bots** (en plan Free no admite
skip por ruta) o con `PUT /zones/{zone_id}/bot_management` con
`{"enable_js": false}`. No relajar CSP (`unsafe-inline`, wildcard).
