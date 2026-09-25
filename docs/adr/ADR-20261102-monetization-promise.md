# ADR-20261102-monetization-promise

Date: 2026-09-25
Status: Proposed — **BORRADOR**, decisión pendiente el 2026-11-02. No
ejecutar, no cambiar copy y no implementar opciones comerciales antes de esa
fecha.

## Context

Monedario sostiene una promesa pública de neutralidad — "sin publicidad, sin
conflicto de interés" — en 9 puntos de copy (Anexo A de
`docs/backlog/DECISION-monetization-2026-11-02.md`) y, al mismo tiempo,
acumula $0 de ingresos con un tráfico pequeño y concentrado (W38: 617 clics
GSC, ~16,4k pageviews/semana; `conversor-utm` ≈ 69% de los clics). El plan
madre firmado (`PLAN-monetization-reevaluation-2026-09-16.md`) autorizó solo
medición (F0/F1) y discovery B2B documental (F2); cualquier cambio de promesa
o implementación comercial queda bloqueado hasta la revisión 2026-11-02
(F3/F4), con evidencia reproducible y umbrales pre-declarados.

El stack de medición ya está listo para monetizar sin retrabajo: eventos
`affiliate_click` y `lead_submit` tipados sin emisores
(ADR-20260921-precontract-monetization-events) y transporte solo-producción
(ADR-20260921-production-only-transport). Activarlos el día de una firma es
un switch, no un proyecto.

## Decision

**Pendiente.** Este ADR enumera las opciones A–E con criterios de
elegibilidad y consecuencias; la opción elegida se registra aquí el
2026-11-02 y recién entonces cambia de estado (`Aceptado` o `Rechazado`).
Fuente de la matriz y del calendario:
`docs/backlog/DECISION-monetization-2026-11-02.md`.

### Opción A — Ko-fi post-resultado + compartir (sin cambio de promesa)

Mantener la vía voluntaria actual, con entrega visible solo post-resultado.
Sin cambio de copy ni de superficies. Elegible sin umbral; su evidencia
informa énfasis, no bloquea.

### Opción B — Afiliado ético en 1–2 clusters

Enlaces a productos ya explicados (APV, DAP, tarjetas) con
`rel=sponsored/nofollow`, disclosure `es-CL` visible antes del enlace,
orden por costo transparente y exclusión total de veredictos YMYL. Elegible
solo con partner dispuesto por escrito y comisión proyectada ≥ costo de
mantenimiento (Gate D) con margen.

### Opción C — Display/AdSense

No elegible como primera oleada: costo en LCP/CLS/CSP y erosión diferencial
de la promesa en las superficies de mayor confianza (calculadoras YMYL
críticas). Solo se revisita si A, B y D fallan y el owner prioriza
explícitamente ingresos de corto plazo.

### Opción D — B2B embed privado / licencia

Embed privado de calculadoras con fuentes oficiales para payroll/HR/fintech/
medios, sin tracking del lector. Elegible solo con memo F2 completo
(10 conversaciones → 2 demos → 1 disposición a pagar), precio que cubra
mantención + margen, contrato de calidad de datos y
`url-freeze-exceptions.json` completa.

### Opción E — Freemium

Diferida. No compite el 2026-11-02; sin camino de evidencia en la ventana.

## Consequences

Positivo: la decisión llega con evidencia y umbrales pre-declarados; activar
la vía elegida no requiere re-tipar eventos ni reconstruir medición. Las
opciones son reversibles con kill-switch y no se arrastran entre sí.

Trade-offs y costo operativo por opción:

| Opción | Costo de mantención | Riesgo de confianza | Cambio de copy |
|---|---|---|---|
| A | nulo | bajo | ninguno |
| B | por partner + disclosure | medio (percepción de sesgo) | sí, disclosure |
| C | nulo (tercero) | alto | sí, promesa |
| D | por contrato (SLA, auditoría) | bajo (embed privado) | ninguno público |
| E | producto | medio | sí |

No decidir también tiene consecuencia: mantener $0 es compatible con
continuidad mientras Gate D sea sostenible, pero no genera evidencia de
demanda dispuesta a pagar.

## Alternatives considered

- **Tipar eventos y cambiar la promesa de inmediato:** descartado — viola la
  ventana FOCO y `NO_SILENT_CHANGES`; el paquete de decisión existe para no
  improvisar.
- **AdSense como primer experimento:** descartado — el costo de confianza
  supera el ingreso esperado a este tráfico, y el plan madre lo excluye como
  primera oleada.
- **Copiar un modelo de afiliación de competidores:** descartado —
  `EXTERNAL_PATTERNS_NON_AUTHORITATIVE` +
  `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.
- **No medir y decidir por sensación:** descartado — sin `n_min` no hay
  veredicto (`UTILITY_LED_EXPERIMENT_REGISTRY.md`).

## Verification

Pre-decisión (este commit, docs-only):

- `pnpm run check:docs` y `pnpm run format:check` verdes.
- Cero cambios en rutas, RSS, copy público, tracking o contratos
  (`check:routes`, `check:rss` no aplican sin build; no se tocan).

Post-decisión (si se acepta B o D), verificación obligatoria:

- Excepción completa en `url-freeze-exceptions.json` con decisión `APPROVED`.
- `check:routes` + `check:rss` sin altas/bajas inesperadas; snapshot antes y
  después.
- Disclosure y `rel` verificados en tests/inspección; exclusión YMYL
  auditada con separación de deberes.
- Rollback probado: kill-switch por cluster + revert del commit de
  implementación; eventos nuevos detrás de allowlist sin migración de datos.
