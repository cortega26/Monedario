# CSP y Cloudflare JavaScript Detections

**Estado:** `REVERSAL-PENDING-MERGE` (2026-08-18, PR #425 — reversión de `no-transform` para restaurar compresión en el edge; **sin merge, sin deploy a la fecha**)
**Estado anterior:** `VALIDATED` (2026-08-02, deploy PR #382 + fix de override en `_headers` commit `09dc219d`)
**Fecha de reproducción:** 2026-08-02
**Ruta:** `https://monedario.cl/calculadoras/conversor-utm/`

## Evidencia y causa (2026-08-02)

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

## Corrección mínima (2026-08-02, ya revertida)

`public/_headers` declaraba `Cache-Control: no-transform` en el bloque global **y en
cada regla específica que define su propio `Cache-Control`** (calculadoras, posts,
guias, home, assets, etc.). Cloudflare no combina valores del mismo header entre
reglas: la regla más específica reemplaza por completo el valor global, por lo que
un `no-transform` solo en `/*` dejaba desprotegidas las rutas con regla propia — fue
el motivo por el que la inyección JSD reapareció en `/calculadoras/*` pese al fix
inicial (2026-08-02, validación post-merge). Además, los
orígenes de Ko-fi salieron de la CSP global y quedaron limitados a
`/apoyar/*`.

Esto preserva la CSP hash-only y evita las alternativas inseguras: no agrega
`'unsafe-inline'`, nonce estático, wildcard ni un hash copiado de una respuesta.
Tampoco carga Ko-fi fuera de la página de apoyo.

## Actualización 2026-08-18 — reversión propuesta: restaurar la compresión del edge

**Contexto:** auditoría de rendimiento por el reporte de Ahrefs "Slow pages"
(55 URLs el 2026-08-17, 199 el 2026-08-18). Diagnóstico:
`docs/latest_audits/ahrefs-slow-pages-2026-08-18.md`.

**Causa raíz:** Cloudflare no comprime respuestas con `Cache-Control:
no-transform` (documentado en developers.cloudflare.com, Origin Cache
Control / Compression). Desde el 2026-08-02 todo el sitio se sirvió sin
`Content-Encoding`: HTML de 40–167 KB y CSS compartido de 108 KB sin comprimir,
payload de ~2.5–4× en el cable. Las 199 URLs lentas de Ahrefs coinciden con todo
documento HTML ≥ 44.7 KB (umbral de tamaño, no familia).

**Cambio propuesto (PR #425, sin merge):** retirar `no-transform` de **todas**
las reglas `Cache-Control` de `public/_headers`. **No se toca** la CSP, los TTL
(`max-age`), ni configuración alguna de Cloudflare.

**Nota 2026-08-19 (verificación manual en Cloudflare):** Bot Fight Mode está
**actualmente desactivado**; el Cloudflare Managed Ruleset/WAF sigue activo,
pero no es Bot Fight Mode. El runbook del 02-08 lo documentaba activo en esa
fecha, cuando la API de zona devolvía 403. Con BFM OFF, el mecanismo que
inyectaba JavaScript Detections no está activo en el estado actual.

**Riesgo asumido:** sin `no-transform`, si BFM/JS Detections llegara a
reactivarse podría re-inyectar su bootstrap en el HTML y violar la CSP hash-only
(error de consola `Executing inline script violates`; el bootstrap no bloquea la
página). Se mitiga con la verificación post-deploy obligatoria (abajo) y el
rollback inmediato si reaparece.

## Verificación reproducible (post-deploy del PR #425 — OBLIGATORIA)

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
   - ausencia de `__CF$cv$params` en el HTML (sin inyección JSD);
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
4. Registrar el resultado en este runbook y en `docs/TECH_DEBT_BACKLOG.md`
   (TD-0099) con fecha y evidencia.

Alternativas de fondo si JSD vuelve: verificar en Cloudflare que Bot Fight
Mode continúe **desactivado** (estado confirmado manualmente el 2026-08-19) y,
si estuviera activo, apagarlo desde **Security → Bots** (en plan Free no admite
skip por ruta; el token actual recibe 403 en `/bot_management`); evaluar
excepciones del Managed Ruleset para el dominio, o adoptar una protección
configurable compatible con nonce dinámico. No relajar CSP
(`unsafe-inline`, wildcard).
