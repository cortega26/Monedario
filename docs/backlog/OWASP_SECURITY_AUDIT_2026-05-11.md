# Auditoría OWASP — Hallazgos y backlog

> Generado: 2026-05-11 tras auditoría full-site con `owasp-security-check`.
> Application type: Static Site (Astro v6 SSG) · YMYL financial education · monedario.cl

---

## Resumen

| Severidad | Count | Área | Estado |
|-----------|-------|------|--------|
| 🔴 CRITICAL | 3 | Secrets, Security Headers, Env management | ✅ 3/3 cerrados 2026-06-28 |
| 🟠 HIGH | 3 | XSS surface, SW versioning, API key guard | ✅ 2/3 cerrados (SEC-004 solo monitoreo) |
| 🟡 MEDIUM | 3 | PII en analytics, canonical validation, OG redirect | ✅ 3/3 cerrados 2026-06-28 |

**Auditoría cerrada:** 8/9 implementados, 1 en monitoreo preventivo (SEC-004).

---

## 🔴 CRITICAL

### SEC-001 — Hardcoded Cloudflare identifiers en scripts ✅ CORREGIDO 2026-06-28

**Archivo:** `scripts/data-signals/cloudflare-fetch.mjs:37-38` (originalmente)
**Archivo adicional:** `scripts/data-signals/fetch-analytics-export.mjs:33` (descubierto en revisión)

**Estado original:**
```javascript
const DEFAULT_ZONE_ID    = "9d53871bed75e9ad5d4cc5da84a18fcf";
const DEFAULT_ACCOUNT_ID = "7e153214690ac7430fde021f1f2b2916";
```

**Corrección ejecutada 2026-06-28:**
- `cloudflare-fetch.mjs`: ya usaba `getRequiredEnv()` para `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_ANALYTICS_TOKEN`
- `fetch-analytics-export.mjs`: eliminado fallback hardcodeado `?? "7e153214690ac7430fde021f1f2b2916"` → ahora usa `getRequiredEnv("CLOUDFLARE_ACCOUNT_ID")`
- Barrido: 0 IDs hardcodeados restantes en todo el repo

**Prioridad:** ~~P1~~ → **CERRADO** · **Estimación:** 5 min

---

### SEC-002 — Missing security headers (CSP, HSTS, XFO, nosniff) ✅ IMPLEMENTADO (pre-existente)

**Archivo:** `public/_headers` — desplegado en producción vía Cloudflare Pages

**Estado actual (verificado 2026-06-28):**
- ✅ `Content-Security-Policy` — `default-src 'self'; script-src 'self' [hashes sha256] [externos]; connect-src 'self' [externos]; frame-ancestors 'none'; base-uri 'self'`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ✅ `Permissions-Policy` — restringe cámara, micrófono, geolocalización, etc.
- ✅ `! Access-Control-Allow-Origin` — evita fugas CORS
- ✅ Build de Astro inyecta hashes `sha256-*` en `dist/_headers` para scripts inline (más restrictivo que `'unsafe-inline'`)

**Prioridad:** ~~P1~~ → **CERRADO** · **Estimación:** ya en producción

---

### SEC-003 — Archivos `.env` en disco ✅ VERIFICADO 2026-06-28

**Archivos:** `.env`, `.env.local`

**Problema:** Existen en el working directory. Aunque `.gitignore` los excluye, si contienen `OPENAI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS_JSON` o `CLOUDFLARE_ANALYTICS_TOKEN` y alguna vez se trackearon, habría exposición histórica.

**Verificación ejecutada 2026-06-28:**
```bash
git log --diff-filter=A --all -- .env .env.local .env.*
```
- `.env` — **nunca commiteado** ✅
- `.env.local` — **nunca commiteado** ✅
- `.env.example` — commiteado 3×, solo contiene valores públicos (`TPI_ECONOMIC_PROVIDER_MODE=snapshot`, placeholders comentados). `OPENAI_API_KEY` aparece comentado y vacío (`# OPENAI_API_KEY=`).
- `.gitignore` bloquea `.env`, `.env.local`, `.env.production`. `git check-ignore` confirma que los archivos actuales están excluidos.

**Resultado:** Sin exposición histórica. No se requiere rotación de credenciales ni BFG.

**Prioridad:** ~~P0 si hay exposición histórica~~ → **CERRADO** · **Estimación:** verificado en 5 min

---

## 🟠 HIGH

### SEC-004 — `set:html` sobre contenido markdown renderizado

**Archivo:** `src/components/GlossaryContentWrapper.astro:8`

```astro
<Fragment set:html={processedHtml} />
```

**Problema:** El contenido renderizado de artículos MDX se inyecta con `set:html`. La función `injectGlossaryLinks` solo añade tags `<a>` controlados, pero el slot acepta cualquier HTML generado por el pipeline de contenido.

**Riesgo actual:** Bajo — el contenido es authored por un editor de confianza (Carlos Ortega) y Astro escapa HTML por defecto en la renderización markdown. Si en el futuro se aceptan contribuciones externas, esto es un vector de stored XSS.

**Fix inmediato:** No requiere cambio hoy.

**Monitoreo futuro:** Si se implementa UGC o guest posts, agregar DOMPurify antes del `set:html`.

**Prioridad:** P3 (vigilancia) · **Estimación:** — (preventivo)

---

### SEC-005 — Service worker sin versionado por build hash ✅ YA IMPLEMENTADO (pre-existente)

**Archivo:** `public/sw.js:2-3`, `src/integrations/sw-version.ts`

**Estado actual (verificado 2026-06-28):**
- `sw.js` usa placeholders `monedario-__SW_CACHE_VERSION__` y `monedario-assets-__SW_CACHE_VERSION__`
- Integración Astro `sw-version` (hook `astro:build:done`) reemplaza con `GITHUB_SHA` (7 chars) en CI, o `Date.now().toString(36)` en local
- Cada deploy obtiene un cache key único basado en el commit hash
- `dist/sw.js` confirmado: `monedario-mqy626ra`, `monedario-assets-mqy626ra`

**Prioridad:** ~~P2~~ → **CERRADO** · **Estimación:** ya en producción

---

### SEC-006 — OpenAI API key sin validación de formato previa ✅ CORREGIDO 2026-06-28

**Archivos:** `scripts/hero-images/generate-images.mjs:213`, `scripts/hero-images/pipeline.mjs:8`

**Corrección ejecutada 2026-06-28:**
- `generate-images.mjs`: agregado guard `!apiKey.startsWith("sk-")` tras la verificación de existencia
- `pipeline.mjs`: extraída validación antes de instanciar `new OpenAI()` — falla temprano con mensaje claro
- Ambos archivos emiten: `"OPENAI_API_KEY does not appear to be a valid OpenAI key (expected sk-… prefix)."`

**Prioridad:** ~~P2~~ → **CERRADO** · **Estimación:** 5 min

---

## 🟡 MEDIUM

### SEC-007 — Términos de búsqueda enviados a Google Analytics ✅ CORREGIDO 2026-06-28

**Archivo:** `src/pages/buscar.astro`

**Corrección ejecutada 2026-06-28:**
- Agregada función `sanitizeSearchTerm(term)` que reemplaza:
  - RUT chileno (`XX.XXX.XXX-X`) → `[RUT]`
  - Emails → `[email]`
  - Teléfonos chilenos (`+56 9 XXXX XXXX`) → `[tel]`
- Aplicada en los 3 puntos de emisión: `search_submit` (form submit), `search_result_click`, `search_submit` (debounce)
- Los patrones originales no se pierden — se reemplazan con etiquetas genéricas que preservan la señal analítica sin PII

**Prioridad:** ~~P2~~ → **CERRADO** · **Estimación:** 10 min

---

### SEC-008 — Canonical URL sin validación de dominio propio ✅ CORREGIDO 2026-06-28

**Archivo:** `src/content.config.ts:63-70`

**Corrección ejecutada 2026-06-28:**
- Agregado `.refine()` que valida que el hostname del canonical coincida con `new URL(SITE.website).hostname` (monedario.cl)
- Se mantiene la validación HTTPS (`protocol: /^https$/`)
- Mensaje de error: `Field "canonical" must point to monedario.cl.`
- `astro check`: 0 errors, 0 warnings, 0 hints

**Prioridad:** ~~P2~~ → **CERRADO** · **Estimación:** 5 min

---

### SEC-009 — OG image remota sin restricción de dominios ✅ CORREGIDO 2026-06-28

**Archivo:** `src/layouts/PostDetails.astro:66-88`

**Corrección ejecutada 2026-06-28:**
- Agregada allowlist `ALLOWED_OG_IMAGE_DOMAINS` con el hostname del propio sitio
- URLs remotas se validan contra la allowlist antes de usarse como `og:image`
- Dominios no permitidos emiten `console.warn` y caen al fallback (dynamic OG image o `og.png` por defecto)
- La allowlist es extensible: agregar dominios adicionales es explícito e intencional

**Prioridad:** ~~P3~~ → **CERRADO** · **Estimación:** 10 min

---

## Orden de ejecución (completado 2026-06-28)

| Orden | ID | Estado |
|-------|----|--------|
| 1 | SEC-003 | ✅ Verificado — sin exposición histórica |
| 2 | SEC-002 | ✅ Ya implementado en `public/_headers` |
| 3 | SEC-001 | ✅ Fallback hardcodeado eliminado de `fetch-analytics-export.mjs` |
| 4 | SEC-006 | ✅ Validación `sk-` en `generate-images.mjs` + `pipeline.mjs` |
| 5 | SEC-005 | ✅ Ya implementado con integración Astro `sw-version` |
| 6 | SEC-007 | ✅ `sanitizeSearchTerm()` en `buscar.astro` (RUT, email, tel) |
| 7 | SEC-008 | ✅ `refine()` de dominio en `content.config.ts` |
| 8 | SEC-009 | ✅ Allowlist `ALLOWED_OG_IMAGE_DOMAINS` en `PostDetails.astro` |
| — | SEC-004 | ⏸️ Monitoreo preventivo — sin acción hoy |
