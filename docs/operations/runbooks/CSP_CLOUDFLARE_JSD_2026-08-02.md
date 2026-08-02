# CSP y Cloudflare JavaScript Detections

**Estado:** `READY_FOR_DEPLOYMENT_VALIDATION`
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

La verificación de producción permanece pendiente hasta que este diff se
despliegue. Preview/build solo demuestran la configuración de origen, no la
respuesta final de la zona.

## Rollback

Retirar únicamente `Cache-Control: no-transform` si se demuestra una regresión
material de entrega, volver a desplegar y documentar el resultado. No relajar
CSP. La alternativa es desactivar Bot Fight Mode o adoptar una protección
configurable compatible con nonce dinámico.
