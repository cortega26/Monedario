# CSP y Cloudflare JavaScript Detections

**Estado:** `VALIDATED` (2026-08-02, deploy PR #382 + fix de override en `_headers` commit `09dc219d`) → **REVALIDADO** el 2026-08-19 tras rollback del intento de reversión (ver "Actualización 2026-08-19")
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

## Corrección mínima

`public/_headers` declara `Cache-Control: no-transform` en el bloque global **y en
cada regla específica que define su propio `Cache-Control`** (calculadoras, posts,
guias, home, assets, etc.). Cloudflare no combina valores del mismo header entre
reglas: la regla más específica reemplaza por completo el valor global, por lo que
un `no-transform` solo en `/*` deja desprotegidas las rutas con regla propia — fue
el motivo por el que la inyección JSD reapareció en `/calculadoras/*` pese al fix
inicial (2026-08-02, validación post-merge). Invariante verificable en tests:
todo `Cache-Control` de `_headers` debe incluir `no-transform`. Además, los
orígenes de Ko-fi salieron de la CSP global y quedaron limitados a
`/apoyar/*`.

Esto preserva la CSP hash-only y evita las alternativas inseguras: no agrega
`'unsafe-inline'`, nonce estático, wildcard ni un hash copiado de una respuesta.
Tampoco carga Ko-fi fuera de la página de apoyo.

## Verificación reproducible

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

## Rollback

Retirar únicamente `Cache-Control: no-transform` si se demuestra una regresión
material de entrega, volver a desplegar y documentar el resultado. No relajar
CSP. La alternativa es desactivar Bot Fight Mode o adoptar una protección
configurable compatible con nonce dinámico.

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

**Rollback ejecutado (2026-08-19):** revert `dabed860` de `909f4d05` —
restaurado `no-transform` en todas las reglas `Cache-Control` de
`public/_headers` y el invariante del test ("toda regla debe incluir
no-transform"). Re-verificación post-deploy pendiente: esperar TTL de 5 min y
confirmar en Chromium limpio la ausencia de `__CF$cv$params` y de errores
`Executing inline script violates`. El reporte de Ahrefs "Slow pages" queda
abierto; cualquier reintento de compresión requiere primero identificar y
desactivar la fuente real de la inyección JSD (no BFM, que ya está OFF).
