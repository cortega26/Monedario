# Autoridad de métricas

Tres fuentes, tres preguntas distintas. Ninguna responde lo de las otras y
está prohibido mezclar sus denominadores en un mismo cálculo.

## GSC — demanda (`output/operations/data-signals/gsc/`)

- **Responde:** qué buscan los chilenos y qué páginas capturan esa demanda
  (clics, impresiones, CTR, posición por query/página; W37: ~999 clics /
  ~194k impresiones).
- **No responde:** qué pasa después del clic (sin comportamiento on-site),
  ni quién (sin usuarios, sin cohortes).
- **Cadencia:** semanal vía data-signals. Ventana por semana ISO.

## Recolector propio — comportamiento (`output/operations/data-signals/analytics/`)

- **Responde:** qué hacen los visitantes en el sitio: vistas, inicios y
  completitud por calculadora, errores, siguiente paso, fuentes, shares
  (W37: 1.016 `calculator_view` / 686 `calculator_start` / 633
  `calculator_complete` — conteos de eventos, no usuarios únicos).
- **No responde:** identidad entre sesiones (sin cookies, sin fingerprint),
  cohortes 7/30 días, atribución multisesión. "Retorno" solo como tráfico
  agregado etiquetado con UTM, nunca como usuario recurrente.
- **Solo producción transmite** (ADR-20260921-production-only-transport):
  previews, dev, localhost y E2E nunca entran a los agregados.
- **Cadencia:** exportación semanal del worker (cron lunes 05:30 UTC) a R2,
  consolidada por data-signals. Retención local: 90 días
  (ver `output/operations/data-signals/README.md`).
- **Deduplicación:** `calculator_complete` una vez por calculadora/vista
  (recalculos no suman); recalcular la página resetea el ciclo.

## Cloudflare — baseline (`output/operations/data-signals/cloudflare/`)

- **Responde:** carga real del sitio (visitas, tráfico, cache ratio) y
  rendimiento (LCP/CLS/INP p75): la red de seguridad cookieless que mide
  incluso con adblock.
- **No responde:** comportamiento (qué calculadora, qué resultado), ni
  intención comercial.

## Reglas de lectura

1. Tasas solo dentro de la misma fuente y ventana (p. ej. completitud =
   `calculator_complete` / `calculator_start` del recolector, misma semana).
   Nunca clics GSC / eventos del recolector / visitas CF entre sí.
2. Cero en un evento = cero observado, no necesariamente roto; cruzarlo con
   la columna `mode`/`validation` del export y el diccionario de eventos
   (`docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md`), que marca
   qué eventos están definidos pero no emitidos (p. ej. `affiliate_click`,
   `lead_submit` hasta la firma).
3. UTMs miden activaciones de enlaces propios en agregado; no prueban retorno
   ni enlazan sesiones.
4. GA4 no existe en este stack por decisión (Fase 2, 2026-09-21): entra solo
   con contrato de monetización firmado, solo en rutas del funnel y degradado.
