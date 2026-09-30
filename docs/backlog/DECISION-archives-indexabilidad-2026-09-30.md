# Decisión — indexabilidad de `/archives/` (evidencia GSC 2026-09-30)

- **Estado:** ABIERTA — decisión del owner.
- **Origen:** plan 128 §8 (validación GSC) y plan 136 (habilitadores N1–N7).
- **Base de evidencia:** exports GSC W32–W39 (2026-08-03 → 2026-09-27) y URL
  Inspection W39, sobre `11f0a26d` + este plan.
- **Ninguna opción fue ejecutada.** Este documento no autoriza cambios.

## Evidencia

| Dato | Resultado |
|---|---|
| Impresiones / clics de `/archives/` en 8 semanas | **0i / 0c** |
| Coverage W39 | «Crawled - currently not indexed» |
| Indexación global del sitio (W39) | 173/185 PASS (94 %) |
| Decisión vigente | Plan 116 (SEO-03): mantener y enlazar desde `/posts/` para sacarlo de orphan |
| Estado técnico | Indexable por defecto en `src/config/indexability.ts` (sin regla propia); incluida en sitemap; servida con `showArchives` de `SITE` |

Lectura: Google rastreó la página y decidió no indexarla; el enlace desde
`/posts/` no cambió esa decisión en la ventana medida. No hay señal de uso
orgánico ni de daño. Es una página de navegación interna de escaso valor SERP.

## Mecanismo si se decide cambiar (contrato plan 120)

- Regla nueva en `src/config/indexability.ts` (patrón `/archives/`), consumida
  por `Layout.astro` (meta robots), sitemap y guardas.
- **ADR obligatorio** (cambio de contrato/layer) + snapshot de rutas y RSS
  antes/después según `docs/development/` y `context/INVARIANTS.md`.
- `/archives/` no es YMYL: no aplica separación de funciones editorial, pero sí
  el protocolo de cambios de superficie.
- Ventana: cualquier cambio queda **post-W40** (el plan 128 no lo considera
  urgente) y fuera del freeze de títulos; no crea URLs nuevas.

## Opciones

| # | Opción | Efecto | Costo/riesgo | Veredicto propuesto |
|---|---|---|---|---|
| A | **Mantener** (status quo del plan 116) | Sin cambios; re-evaluar con más ventanas | Cero; el coste es mantener una URL sin señal | Válida si no hay urgencia |
| B | **`noindex,follow` vía contrato** | Sale del índice, sigue crawlable; enlaces internos intactos | ADR + guardas + snapshot; irreversible a corto plazo si se revierte | Procedente si se quiere higiene de índice; no hay evidencia de beneficio SEO |
| C | **Consolidar/redirigir a `/posts/`** | Elimina la ruta | Cambio de ruta: snapshot + ADR + riesgo de enlaces externos; mayor superficie de error | No recomendada con la evidencia actual |
| D | **Diferir la decisión** documentándola hasta después de 2026-11-02 (FOCO) o hasta acumular otra ventana | Sin cambios ahora; decisión con deadline | Cero; el tema queda vivo en backlog | **Recomendación operativa de esta sesión** |

## Lo que falta

- Tu decisión (A/B/C/D). Si es B o C, se abre plan propio con ADR y snapshots.
- Ninguna opción requiere datos adicionales; la evidencia GSC ya es suficiente
  para decidir y para sostener que no hay urgencia.

## Rollback

- Sin cambios en esta sesión: no aplica. Si se ejecuta B en el futuro, la
  reversión es quitar la regla del contrato y regenerar (el índice de Google
  re-crawlea por sí solo; no hay garantía de timing).