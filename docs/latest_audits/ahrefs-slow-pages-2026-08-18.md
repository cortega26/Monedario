# Auditoría: "Slow pages" reportadas por Ahrefs en Monedario

**Fecha:** 2026-08-18
**Repo:** cortega26/Monedario
**Alcance:** fase estrictamente read-only (sin cambios de código, sin commits/PRs)
**Contexto observado por el usuario:**
- Ahrefs analizó 341 URLs · Health Score: 100 · Errors: 0.
- 2026-08-17: reportó `Slow page [New]`: 55 URLs.
- 2026-08-18: reportó `Slow page`: 199 URLs.

**Objetivo:** determinar si las ~199 páginas lentas comparten una o pocas causas transversales y distinguir un problema real de performance de un artefacto del crawler de Ahrefs.

---

## 1. Métricas medidas (producción real)

**Edge CDN (Cloudflare, PoP Santiago)** — 51 URLs × 3 repeticiones (todas las familias):
- TTFB mediana: 44–91 ms · total: 49–165 ms · `cf-cache-status`: 100% HIT.
- Sin diferencia por user-agent (AhrefsBot/Googlebot/curl/python): misma respuesta, mismo tamaño, HIT.

**Origen (Cloudflare Pages, cache-busted con query param)**:
- Desde Chile: TTFB 62–95 ms.
- Desde US (us1.check-host.net): 140–290 ms (archivo más grande, 167 KB, en frío/origen: 202–290 ms total).

**Vantage global** (check-host.net): Brasil 92 ms · Países Bajos 64 ms · Italia 53 ms · Suiza 129 ms · Finlandia 145 ms · US 112–255 ms · Canadá 380 ms.

**Carga renderizada completa** (Chrome, contexto frío, como el renderer de Ahrefs):
- Post: 12 requests · 197 KB · `load` 237 ms · TTFB 37 ms.
- Sin recursos externos bloqueantes; `<img>` con `loading="lazy"`; héroes AVIF de 5–20 KB; fonts self-hosted (~65 KB).

**Inventario completo**: 316 URLs únicas medidas (sitemap 184 + 130 tags + auxiliares; Ahrefs analizó 341 ≈ 184 + 130 tags + paginación `/posts/N/`). 100% `200`, **cero redirects, cero errores, cero variación por UA**. Sin inyección JSD (`__CF$cv$params` ausente), sin `cf-mitigated`.

**Compresión**: ninguna respuesta lleva `Content-Encoding` (HTML 40–167 KB y CSS compartido 108 KB servidos sin comprimir).

---

## 2. Patrón común entre las páginas afectadas

**No es una familia: es un umbral de tamaño de HTML.** Las 199 URLs "lentas" coinciden exactamente con *todo documento HTML ≥ 44.7 KB* (la 199ª tiene 44 672 B; la 200ª 44 655 B):

| Set | Composición |
|---|---|
| 199 "lentas" (HTML ≥ 44.7 KB) | 77 tags + 53 posts + 23 calculadoras + 22 leyes + 12 guías + 12 estáticas (archives, home, glosario-hub…) |
| 117 "no lentas" (HTML < 44.7 KB) | 54 entradas de glosario + 53 tags pequeños + 4 guías + 2 leyes + 4 estáticas |

Dato extra: el 17/08 el set "[New] 55" ≈ el conjunto **HTML ≥ 80 KB (54 URLs)** + 1 — el mismo mecanismo con umbral más alto el primer día y más bajo el segundo. Todo cuadra con "tiempo de descarga ∝ tamaño del documento" sobre una ruta lenta, no con un componente/layout compartido.

---

## 3. Causa raíz / hipótesis ordenadas por evidencia

### H1 — Regresión real del sitio: compresión deshabilitada site-wide desde el 2026-08-02 (VERIFICADA)

`public/_headers` declara `Cache-Control: … no-transform` en **todas** las reglas desde el commit `09dc219d` (fix CSP/JS-Detections, TD-0099, runbook `docs/operations/runbooks/CSP_CLOUDFLARE_JSD_2026-08-02.md`). Cloudflare documenta: *"Compression is disabled when the `no-transform` directive is present"* (developers.cloudflare.com, Origin Cache Control / Compression).

Resultado medido: ninguna respuesta lleva `Content-Encoding`. Antes del 02-08 las rutas `/posts/*`, `/tags/*`, `/calculadoras/*`, `/guias/*`, `/leyes/*`, `/glosario/*` **no** tenían `no-transform` y Cloudflare servía Brotli (~70% menos bytes). Desde el 02-08 el payload de cada página se multiplicó por ~2.5–4× en el cable. Transversal, permanente y confirmado.

### H2 — El flag de Ahrefs es tiempo de descarga del documento y su bot renderiza (PROBABLE, inferido)

El issue "Slow page" de Ahrefs = "the HTML code of the page took a long time to load" (>3 s), y AhrefsSiteAudit *crawls and renders* páginas (carga scripts e imágenes). Sobre la infraestructura de Ahrefs (EE.UU. → SCL, renderer con límites de CPU/banda):
- páginas de 100–380 KB **sin comprimir**,
- TTL de 5 min (`max-age=300`, `REVALIDATED` observado: cada pasada del crawl re-descarga todo),
- deploys cada ~6 h (worker de snapshot económico 06:15/10:15/14:15 UTC → ETags nuevos en todo el HTML),

es la combinación que explica el umbral de 44.7 KB → 199 URLs.

### H3 — Bot Fight Mode (DESCARTADA para el estado actual: BFM OFF verificado 2026-08-19)

El runbook del 02-08 documentaba **Bot Fight Mode activo** en esa fecha (plan free; API de zona devolvía 403, no se pudo desactivar entonces) y, con él, JavaScript Detections. Sin embargo, la verificación manual en la consola de Cloudflare del **2026-08-19** confirma que **Bot Fight Mode está actualmente desactivado** (el Cloudflare Managed Ruleset/WAF sigue activo, pero no es Bot Fight Mode). Por tanto H3 queda **descartada/no aplicable al estado actual** de la zona: no hay un mecanismo de BFM activo que tarpiteara las IPs de Ahrefs en esta ventana.

### Descartadas

- Origen lento (60–95 ms medidos).
- CDN lento (HIT 40–90 ms).
- Assets pesados (todo < 400 KB por página con scroll completo; héroes AVIF 5–20 KB).
- Redirects (0), errores (0), variación por UA (ninguna).
- Cambio estructural del sitio el 16–18/08: **no hubo** — solo commits del worker de snapshot económico (valores UF/DAP).

---

## 4. Medido / inferido / no verificable

- **Medido**: tiempos desde Chile y 8 países; HIT/MISS/origen; ausencia de compresión (H1); tamaños y composición por familia; cero redirects/errores/variación por UA; timeline de `_headers` (compresión off desde 02-08); ausencia de cambios estructurales 15–18/08.
- **Inferido**: que Ahrefs mide descarga del documento (según docs públicos de Ahrefs: "Slow page = HTML took a long time to load"); que su ruta/límites de renderer son peores que los de check-host; que el umbral de 3 s + tamaño explica las 199 URLs.
- **No verificable sin el snapshot de Ahrefs**: el set exacto de 199 URLs y su load time por URL; la distribución de su métrica "Content encoding" (si marca ~199 páginas como sin comprimir, H1 queda probada directamente); si el proyecto cambió crawl speed / JS rendering en Ahrefs; la hora exacta del crawl. (Nota: Bot Fight Mode, candidato a explicar un comportamiento solo-para-bots, quedó descartado — verificado OFF el 2026-08-19.)

---

## 5. Cambio mínimo recomendado (por causa)

1. **H1 (raíz, mayor impacto) — restaurar la compresión en el edge**:
   - El bloqueante es `no-transform` (escudo anti-JSD impuesto el 02-08). Con **Bot Fight Mode ya desactivado** (verificado manualmente el 2026-08-19), el riesgo JSD que motivó el escudo es materialmente menor; la retirada de `no-transform` es ahora un cambio de bajo riesgo, condicionado a la validación post-deploy del runbook.
   - Mientras tanto, evaluar el trade-off documentado en el runbook: sin `no-transform`, JavaScript Detections podría re-inyectar su bootstrap y violar la CSP (error de consola, sin romper funcionalidad visible).
   - Alternativa intermedia sin tocar Cloudflare: precomprimir en build (`dist/**/*.br`) no es suficiente en Pages sin reglas de Content-Encoding; no recomendado.
2. **H2 (mitigación de medición) — subir el TTL del HTML**: `max-age=300` → `max-age=3600` (o `s-maxage` mayor) para rutas no volátiles (`/posts/*`, `/tags/*`, `/glosario/*`, `/leyes/*`, `/guias/*`), manteniendo `must-revalidate` solo en las volátiles (`/uf-hoy/`, `/api/indicadores-hoy.json`, convertidores). Reduce re-descargas y revalidaciones durante un crawl largo y para usuarios repetidos. No afecta LCP real.
3. **Observacional — confirmar con el snapshot de Ahrefs**: revisar en Site Audit la columna "Content encoding" (si ~199 URLs salen como sin comprimir, H1 queda probada) y los load times por URL (correlación con HTML ≥ 45 KB). Re-crawl post-fix para validar.

---

## 6. Impacto estimado

- **Restaurar compresión**: payload por página cae ~60–70% (HTML 167 KB → ~30 KB; CSS 108 KB → ~16 KB). Usuarios reales en Chile: −100–300 ms por carga completa en fibra; −1–2 s en 3G. Para Ahrefs: páginas de 300–380 KB bajan a ~100–150 KB → muy probablemente salen del reporte "Slow pages".
- **Subir TTL del HTML**: menos revalidaciones; impacto moderado en mediciones, riesgo bajo (contenido volátil ya cubierto por reglas `must-revalidate`).
- **No intervenir**: el próximo crawl dirá si es persistente o artefacto. Riesgo: el reporte sigue creciendo y Health Score podría bajar (hoy 100/Errors 0; "slow pages" es warning, no error).

---

## 7. ¿Vale la pena intervenir?

**Sí, con un cambio de bajo riesgo y alto retorno** (compresión + TTL), **condicionado a verificar primero en el snapshot de Ahrefs** que las ~199 URLs lentas correlacionan con HTML ≥ 45 KB y/o "Content encoding = sin comprimir" (confirma H1).

Plan sugerido:
1. Confirmar en Ahrefs (Content encoding + load time por URL).
2. Retirar `no-transform` (PR #425; con BFM ya OFF, verificado 19-08, el riesgo JSD es bajo) → validar post-deploy `Content-Encoding: br` y ausencia de JSD → rollback inmediato si JSD reaparece.
3. Subir TTL de HTML no volátil a 1 h.
4. Observar el próximo crawl (2–3 días) y comparar el set de lentas.

**Prioridad del hallazgo**: 1 causa común transversal (payload sin comprimir desde 02-08) que explica el set por tamaño; el *gatillo temporal* (55 → 199 entre 17 y 18/08) no tiene correlato en cambios del sitio y apunta al lado de la medición (crawl/renderer de Ahrefs) — parcialmente no verificable sin el snapshot.

---

## Anexo: metodología

- Medición: `curl` con `Accept-Encoding: br, gzip` (51 URLs × 3 reps desde Chile) + check-host.net (8 países, incl. US, HIT y origen/cache-bust) + Chrome headless vía DevTools (carga fría completa).
- Inventario: sitemap + hub de tags (316 URLs únicas), una sola pasada sin reintentos.
- Composición por familia: análisis de `dist/` (build local == producción, verificado byte a byte en 6 páginas) y de las respuestas de producción.
- Sin pruebas de carga ni comportamiento agresivo.