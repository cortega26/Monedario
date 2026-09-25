# PLAN — Distribución por siembra en comunidades (manual, cero costo)

**Estado:** PROPUESTO (ejecución manual inmediata)
**Fecha:** 2026-09-25 · **Owner de ejecución:** Carlos Ortega
**Prioridad:** P1 (distribución) · **Esfuerzo:** 60–90 min/semana ·
**Riesgo:** MED (reglas de cada comunidad; hacerlo mal = ban o spam)
**Fuente:** `docs/operations/COMMUNITY_SEEDING_KIT.md`,
`reddit-monitor/config.json` (10 subreddits),
`PLAN-zero-cost-distribution-2026-09-25.md` (canal 2).

## Objetivo

Convertir hilos donde la pregunta calza exacto con una calculadora existente
en sesiones calificadas y reconocimiento de marca, respondiendo como persona
con autoría declarada y el enlace al final. Sin automatización, sin DMs
masivos, sin gasto.

## Regla de oro (del kit, no negociable)

> Spam = empujas tu link. Siembra = resuelves el problema; el link es
> secundario. Test: si borras la URL y la respuesta igual sirve, no es spam.

Cinco reglas operativas:

1. Responde completo en el comentario (dato real primero).
2. Ratio ~10:1 aporte:promoción.
3. Solo en hilos donde la pregunta calza exacto.
4. Transparencia: "lo hice yo / soy de Monedario".
5. Gancho honesto: gratis, sin registro, sin publicidad, no guarda datos.

## Superficies y prioridad

| Superficie | Subreddits/espacios | Nota |
|---|---|---|
| Reddit (monitor ya escucha) | `r/chile`, `r/Santiago`, `r/RepublicadeChile`, `r/FinanzasChile`, `r/AskChile`, `r/ChileInversiones`, `r/derechoenchile`, `r/ChileStartup` | Leer reglas de autopromoción de cada uno antes de postear |
| Facebook | grupos de finanzas personales y deudores Chile | Mismas reglas; sin enlaces si el grupo los prohíbe |
| Foros/Quora ES | hilos de UTM/UF/finiquito indexados por Google | Respuestas que rankean y traen tráfico de cola larga |

`r/chile_autos` y `r/ChileIT` quedan fuera por afinidad temática baja.

## Loop operativo semanal (60–90 min)

1. **Domingo/lunes:** abrir la cola del monitor (`reddit-monitor/`, UI de
   triage) y filtrar hilos de los últimos 7 días con pregunta financiera
   concreta.
2. **Selección (máx. 3):** el hilo calza con una página existente y la
   respuesta se puede dar completa sin el link.
3. **Verificación:** contrastar la cifra o regla con la fuente en repo
   (`src/config/afpCommissions.ts`, snapshot económico, tablas de la página).
   Si es volátil (UF, UTM, tasa), no afirmar el monto: explicar la regla y
   enlazar la calculadora.
4. **Redacción:** adaptar la plantilla A–E del kit (AFP, Renta, UF, Finiquito,
   Sueldo líquido); reescribir con palabras propias y tono del hilo.
5. **Publicación manual** (nunca bot) con autoría declarada y link UTM al
   final: `?utm_source=reddit&utm_medium=community&utm_campaign=<slug>`.
6. **Registro** en el log de abajo (fecha, espacio, hilo, página enlazada,
   resultado a 72 h).
7. **Revisión mensual (30 min):** qué hilos rankearon/respondieron, qué
   preguntas se repiten (candidatas a FAQ en página existente, sin URL nueva).

Cadencia: 2–3 respuestas/semana; ráfagas gatillan filtros de spam.

## Plantillas y munición

- Reusar A–E del kit y añadir 2 plantillas para los temas de mayor demanda
  medida: **UTM/UF** ("¿a cuánto está?" → regla + calculadora) y
  **DICOM/Boletín** ("¿cómo salgo gratis?" → guía existente). Agregar al kit
  cuando se usen (no antes de validar que se postean).
- Datos verificados de uso permitido: los del kit (comisiones AFP, UF del
  día, Operación Renta). No publicar cifras nuevas sin fuente en repo.

## Métricas

| Métrica | Cómo | Línea base | Objetivo |
|---|---|---|---|
| Respuestas/semana | log del plan | 0 | 2–3 |
| Ratio aporte:promoción | log | n/d | ≥10:1 |
| Sesiones referidas | Cloudflare (panel) + UTM cuando exista captura landing | sin datos | tendencia semanal |
| Branded queries | GSC (>10 queries "monedario") | sin baseline | registrar baseline en F1 y subir |
| Hilos removidos por reglas | log | 0 | 0; 2 en un sub → dejar de postear ahí |

Brecha de medición: el colector no captura UTM del landing hoy; la mejora
está secuenciada post-W40 en el plan maestro. Mientras tanto, proxy = GSC
branded + Cloudflare.

## STOP / kill criteria

- Automatización, bots o DMs masivos → STOP del canal.
- 2 remociones por reglas en el mismo espacio → dejar ese espacio.
- Un espacio prohíbe enlaces → participar sin link o no participar.
- Tono promocional o link primero → no publicar; reescribir.
- Temas de salud/legal sensible sin fuente → no responder.

## Change Control Record

1. Scope: manual + docs (log y, si aplica, plantillas nuevas en el kit).
2. Impacted modules: `docs/operations/COMMUNITY_SEEDING_KIT.md`,
   este plan; cero código.
3. Invariantes: sin URLs promocionadas fuera de páginas existentes; sin
   tracking individual; autoría declarada.
4. Contract preservation: n/a (sin cambios de eventos).
5. Rollback: borrar/editar respuestas propias si se detecta error; revert del
   commit de docs si se tocó el kit.
6. Regression risk: reputacional si se percibe spam; mitigación: reglas 1–5 y
   kill criteria.

## Rollback

- Respuesta errónea: corregir en el hilo o eliminar; registrar el motivo.
- Espacio hostil: salir y no volver hasta revisar reglas.

## Progress log

- 2026-09-25 — Plan creado. Pendiente primera semana de ejecución (2–3
  respuestas) y baseline de branded queries.
- 2026-09-25 — Semana 1 preparada: 3 borradores listos con links UTM desde la
  cola del monitor (r/chile despido, r/chile Fonasa, r/FinanzasChile tarjeta);
  publicación manual pendiente. Plantillas F (Fonasa) y G (tarjeta/pago
  mínimo) añadidas al kit; lista de subs alineada con el monitor.
