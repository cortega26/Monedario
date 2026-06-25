# ADR-20260625-astro-features-adoption

Date: 2026-06-25
Status: Accepted

## Context

Dos ítems de deuda técnica pedían una decisión documentada, no una implementación a
ciegas, sobre features de configuración de Astro:

- **TD-0075** — evaluar `build.inlineStylesheets: "never"` vs `"auto"` con medición LCP
  real (no estática).
- **TD-0077** — registrar en un ADR el estado de adopción de `prefetch`,
  `viewTransitions` e `inlineStylesheets`, para eliminar la ambigüedad de "¿se evaluó y
  descartó, o no se ha considerado?".

Contexto del sitio: Monedario es un sitio de contenido multipágina (Astro 7, sin SPA),
con `build.inlineStylesheets: "never"` explícito. El recurso CSS dominante es una hoja
de Tailwind 4 compartida (`Footer.*.css` ≈ **104 KB**) que se carga como un único
`<link rel="stylesheet">` externo en todas las páginas. Existe un CSP/SRI estricto vía
`@kindspells/astro-shield` (`script-src` por hash + `'self'`; `allowInlineStyles:
"static"`), por lo que cualquier cambio que inline estilos o agregue scripts debe
construir limpio bajo ese guardrail.

### Medición (TD-0075)

Se midió con el harness Lighthouse ya existente del repo (`lighthouserc.cjs` desktop y
`lighthouserc.mobile.cjs` mobile con CPU 4× + emulación), `staticDistDir: dist`, 5 rutas
representativas (home, post largo, calculadora, hub de guías, índice de guías), mediana
de 3 corridas por ruta. Se construyó el sitio con cada valor y se comparó.

LCP mediano (ms):

| Ruta | Mobile `never` | Mobile `auto` | Δ | Desktop `never` | Desktop `auto` |
|---|---:|---:|---:|---:|---:|
| `/` | 1654 | 1508 | −146 | 368 | 404 |
| `/calculadoras/sueldo-liquido/` | 1958 | 1959 | +1 | 490 | 488 |
| `/guias/` | 1507 | 1654 | +147 | 363 | 364 |
| `/guias/ahorro-e-inversion/` | 1503 | 1506 | +3 | 366 | 364 |
| `/posts/como-calcular-sueldo-liquido/` | 1804 | 1804 | 0 | 445 | 410 |

Hallazgo estructural decisivo: `"auto"` solo inlinea hojas **por debajo del umbral de
~4 KB**. El `Footer.css` de 104 KB —el único recurso render-blocking que importa— supera
ese umbral y **permanece externo bajo ambas configuraciones**. Verificación post-build:
solo la home cambió (inlineó ~2.2 KB de CSS específico de página, +3.5% de HTML, −2
requests diminutos); post, calculadora y hubs quedaron **byte-idénticos**. La ruta
`/guias/` es byte-idéntica entre configs y aun así varió +147 ms, lo que fija la
varianza run-to-run del harness en ~±150 ms — banda que se traga la "mejora" de −146 ms
de la home. Conclusión: **delta de LCP dentro del ruido; sin beneficio medible.**

### Verificación (prefetch)

Se construyó con `prefetch: { prefetchAll: true, defaultStrategy: "hover" }`:

- Build limpia; CSP shield inyectó los mismos 21 hashes que el baseline.
- El runtime de prefetch se emite como script same-origin (`/_astro/prefetch.*.js`),
  cubierto por `'self'` en `script-src` (los hashes del CSP son para inline scripts; un
  script externo same-origin no necesita hash). Sin violación CSP.
- Lighthouse mobile sobre la build con prefetch: Performance idéntica al baseline
  (100/98/100/100/99), TBT 0 en las 5 rutas, LCP dentro de la banda de ruido. Sin
  regresión (criterio TD-0077: ninguna feature degrada Performance > 5 puntos).

## Decision

| Feature | Estado | Razón | Próxima revisión |
|---|---|---|---|
| `build.inlineStylesheets` | **Mantener `"never"`** | El CSS render-blocking dominante (104 KB Tailwind) queda externo bajo `"auto"` también; delta LCP medido dentro del ruido (±150 ms). `"never"` conserva un único archivo CSS cacheable (mejor para sesiones multipágina/repeat-visit) y minimiza la superficie de estilos inline frente al CSP/SRI shield. | Reabrir solo si el CSS crítico se reduce por debajo del umbral de inline, o si se adopta extracción de CSS crítico por ruta. |
| `prefetch` | **Adoptar** (`prefetchAll: true`, `defaultStrategy: "hover"`) | Sitio multipágina con alta navegación entre calculadoras, blog y glosario. `hover` es conservador: no descarga eagermente en viewport (las páginas de blog/glosario son densas en enlaces), pero hace que la navegación al hacer clic se sienta instantánea. Build limpia bajo CSP; TBT 0; sin regresión de Performance. | — (activa). Revisar si el volumen de prefetch impacta ancho de banda en analytics. |
| `viewTransitions` (`<ClientRouter />`) | **Diferir (evaluada — no adoptar ahora)** | Requiere router de cliente (JS adicional) e interactúa con el Service Worker (cacheo SWR de navegaciones), la superficie de scripts inline del CSP, el re-disparo de analytics y la gestión de scroll/focus entre vistas. El beneficio es cosmético para un sitio estático que ya pinta en < 1.7 s mobile. El costo/riesgo de integración supera la ganancia hoy. | Reconsiderar si se mide un problema real de percepción de navegación, o si el SW/analytics se rediseñan de forma que absorban el cambio sin fricción. |

## Consequences

- `astro.config.ts`: `build.inlineStylesheets` permanece `"never"` (con comentario que
  apunta a este ADR); se agrega el bloque `prefetch`.
- `prefetch` es ahora comportamiento activo: Astro emite `<link rel="prefetch">` en
  runtime al hacer hover sobre enlaces internos. No cambia el HTML estático ni rompe el
  CSP (`'self'` cubre el script).
- La decisión de `inlineStylesheets` queda anclada en datos reproducibles: cualquiera
  puede re-medir con `pnpm run perf:ci` (desktop) o `lhci collect
  --config=lighthouserc.mobile.cjs` (mobile) tras alternar el valor.
- `viewTransitions` queda explícitamente "evaluada y diferida", no "no considerada":
  futuras conversaciones parten de esta línea base.
- Limitación de método declarada: las cifras provienen de Lighthouse lab contra un
  servidor estático en localhost (`staticDistDir`), donde el round-trip del CSS externo
  está subestimado respecto a una red real. Aun así, la conclusión se sostiene porque el
  recurso dominante permanece externo en ambas configuraciones — `"auto"` no puede
  mejorar el critical path que `"never"` ya impone.

## Closes

- TD-0075 — decisión documentada con medición en 3 rutas (de hecho 5) y ambas configs.
- TD-0077 — ADR con tabla de decisión por feature; `prefetch` adoptado y validado sin
  regresión; `inlineStylesheets` cruza a TD-0075; `viewTransitions` diferida con criterio
  de revisión.
