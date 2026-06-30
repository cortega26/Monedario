# Plan: trigger manual y parametrizable del export de analytics

Fecha: 2026-06-30
Estado: Pendiente

## Origen

Seguimiento de OBS-01 (`PLAN-calculator-led-growth-2026-06-28.md`, PR-02). El
2026-06-29 el cron `57 7 * * 1` del worker `monedario-analytics-collector` **no
disparó en su primera ocurrencia**, por lo que el export semanal W26 nunca se
escribió en R2 (causa raíz confirmada vía logs de observabilidad; ver
`docs/operations/logs/progress_log.md`, entradas 2026-06-30). El incidente dejó
en evidencia que **no existe ninguna forma de re-disparar o backfillear el export
sin depender del cron**: hubo que reconstruirlo con un script local que importa
las funciones del worker y escribe a R2 vía REST.

## Diagnóstico

1. **El endpoint manual documentado no existe.** `workers/analytics-collector/wrangler.toml`
   describe `EXPORT_SECRET` como protección de "el endpoint manual de export
   (GET /api/analytics/export?secret=...)" y `EXPORT_GITHUB_TOKEN`, pero el handler
   `fetch` desplegado solo acepta `POST` de eventos (cualquier GET → 405). La
   documentación promete una capacidad que el código no implementa.
2. **El export no es parametrizable por semana.** El handler `scheduled` siempre
   exporta `previousCompleteISOWeekInTz()` (la semana completa anterior a `now`).
   No hay manera de pedir una semana arbitraria → sin capacidad de backfill nativa.

## Scope

- **In scope:** implementar en el worker un endpoint HTTP manual de export,
  protegido por `EXPORT_SECRET`, parametrizable por semana (`?week=YYYY-Www`,
  default = semana completa anterior), que reutilice exactamente la misma lógica
  que el handler `scheduled` (aggregate → validate → R2 `put`) y devuelva un
  resumen JSON (no los datos crudos). Refactor para compartir la lógica entre
  `scheduled` y el endpoint manual.
- **Out of scope:** cambiar el contrato del artefacto, el schema de eventos, el
  esquema de claves KV, el cron existente, o rutas/contenido públicos del sitio.
- **Operaciones:** secreto `EXPORT_SECRET` vía `wrangler secret put`, deploy del
  worker y verificación.

## Autoridad e invariantes

- `AGENTS.md`, `context/INVARIANTS.md`.
- Contrato de eventos y requisitos del collector: `PLAN-calculator-led-growth-2026-06-28.md`
  §7 (eventos permitidos, campos prohibidos, sin PII, sin raw events).
- El endpoint manual NO debe exponer datos crudos ni PII: solo dispara el export
  a R2 y responde con metadatos (week, window, rows, totalEvents).

## Diseño propuesto

- Extraer la lógica del cuerpo de `scheduled` a una función `runExport(env, week)`
  que: calcule/valide la ventana, liste KV, agregue, construya y valide el
  artefacto, y haga `put` a R2. Devolver `{ week, window, rows, totalEvents }`.
- `scheduled` llama `runExport(env, previousCompleteISOWeekInTz())`.
- En `fetch`, añadir una rama `GET /api/analytics/export`:
  - Requiere `?secret=` y comparación en tiempo constante con `env.EXPORT_SECRET`;
    si falta/!= → 401/403. Si `EXPORT_SECRET` no está configurado → 503.
  - `?week=YYYY-Www` opcional (validar formato; default = semana anterior).
  - Llama `runExport` y responde 200 con el resumen JSON.
  - Mantener el rate-limit y el resto de guards del handler `fetch`.

## Pasos

- [ ] Refactor: extraer `runExport(env, week)` reutilizada por `scheduled` y `fetch`.
- [ ] Implementar la rama `GET /api/analytics/export` con auth por `EXPORT_SECRET`
      (comparación en tiempo constante) y parámetro `?week=`.
- [ ] Tests en `tests/workers/analytics-collector/`: auth (sin/mal secreto),
      week inválida, default week, y que `runExport` produzca artefacto válido.
- [ ] Configurar el secreto: `wrangler secret put EXPORT_SECRET`.
- [ ] Actualizar `wrangler.toml` (comentarios) y documentar el endpoint.
- [ ] Deploy (`wrangler deploy`) y verificación: disparar el endpoint para W26
      (backfill real, idéntico al artefacto reconstruido) y para W27; confirmar
      objetos en R2 y comparar con el export manual.
- [ ] Registrar evidencia en `docs/operations/logs/progress_log.md`.

## Notas

- Mientras este plan no se ejecute, el backfill/re-disparo se hace con el script
  local de reconstrucción (importa las funciones del worker + REST a KV/R2). La
  escritura a R2 de producción requiere una regla de permiso explícita en el
  harness (la autorización verbal no basta).
- El token de Cloudflare ya tiene scope `Workers Observability:Read`, por lo que
  los logs del worker son consultables para verificar disparos del cron.
