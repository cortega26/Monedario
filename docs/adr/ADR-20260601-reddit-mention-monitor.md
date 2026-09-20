# ADR-20260601-reddit-mention-monitor

Date: 2026-06-01
Status: Superseded by ADR-20260919-reddit-single-monitor

## Context

El diagnóstico de crecimiento (sesión 2026-05-30, ver `MEMORY` SEO growth lever) concluyó que la
restricción de Monedario no es técnica (CWV en 100, sin canibalización, sin fuga de indexación) sino
de **adquisición/autoridad**: el sitio rankea en posición ~10 con casi cero clicks. El lever de bajo
costo es la **siembra en comunidades** (`docs/operations/COMMUNITY_SEEDING_KIT.md`): responder con
valor donde la gente ya pregunta por temas que las calculadoras resuelven.

Para sembrar sin spamear hace falta **escuchar** esas conversaciones en tiempo casi real. Hacerlo a
mano no escala; revisar Reddit manualmente varias veces al día es inviable.

## Decision

Construir un **Cloudflare Worker con Cron Trigger** (`workers/reddit-mention-monitor/`) que cada 15
minutos busca un set de keywords en la API de Reddit y empuja a un **webhook de Discord** solo los
posts nuevos, con la calculadora sugerida para responder.

- **Auth:** app-only OAuth (`client_credentials`), scope `read`, contra `oauth.reddit.com`. Sin
  contexto de usuario, sin refresh token (se pide token por corrida).
- **Dedup entre corridas:** Cloudflare KV (`REDDIT_SEEN`), key = post id (`t3_…`), TTL 7 días. Solo
  se alerta lo no visto; marcar-visto ocurre **después** de un alert exitoso (un fallo de Discord
  reintenta a la siguiente corrida).
- **Filtro de intención:** keyword→calculadora declaradas en `src/keywords.ts`; se descarta NSFW y
  posts bajo un umbral de score configurable. Esta es la ventaja sobre F5Bot (que solo matchea
  keyword, sin intención).
- **Listen-only:** el Worker nunca postea a Reddit. Solo escucha y avisa; responder es trabajo humano
  con criterio (kit de siembra).

### Viabilidad (criterio `docs/development/CRITERIO_VIABILIDAD.md`)

- **Datos:** endpoint `/search` público vía OAuth. ✅
- **Legal/ToS:** el free tier de Reddit es *non-commercial only*. Monedario **no monetiza** (gratis,
  sin ads, sin captura de datos — decisión Cloudflare-only de TD-0084), por lo que cumple. ✅
- **Rate budget:** ~5 requests por corrida (1 token + ~5 keyword groups) × 4 corridas/hora = ~24/h,
  muy por debajo de los 60 req/min del free tier. ✅
- **Técnica:** mismo patrón que el Worker de snapshot económico (ADR-20260516); runtime V8 isolates
  soporta `fetch` + KV nativamente. ✅

## Consequences

### Positive
- Escucha autónoma 24/7 sin depender de una máquina encendida; alertas en ≤15 min.
- Costo $0: Workers free (100k req/día), KV free (100k lecturas/día), Cron gratis, Discord gratis.
- Cierra el loop de crecimiento: escuchar → responder con el kit → medir con el tooling GSC
  (`audit:striking-distance`, clics de marca).
- Aislado: no toca el sitio Astro ni otros workers; su fallo no afecta producción.

### Trade-offs / Risks
- **Keyword ≠ intención perfecta:** habrá falsos positivos; el responder humano filtra. El umbral de
  score y el mapeo por grupo lo mitigan.
- **Secreto Discord webhook:** quien lo tenga puede postear al canal. Mitigación: es un canal privado
  del owner; rotar regenerando el webhook.
- **Cambios de API Reddit:** si Reddit endurece el free tier o el non-commercial, hay que reevaluar.
  Rollback es `wrangler delete`.
- **Observabilidad V1 pasiva:** Workers Logs en el dashboard; fallos silenciosos hasta mirar. V2
  podría alertar fallos al mismo Discord.

## Alternatives considered

- **F5Bot (gratis):** funciona y es cero-código, pero matchea keyword sin intención y el free tier
  topa ~50 alertas/día por keyword. Descartado como primario por falta de filtrado; sigue siendo el
  fallback si el Worker se vuelve costoso de mantener.
- **Script local + cron:** cero secretos en la nube, pero requiere la máquina del owner encendida; no
  es real-time autónomo. Descartado por el requisito de "delay mínimo".
- **Google Alerts:** no indexa Reddit de forma fiable (días de retraso, pierde comentarios).
  Descartado.
- **Monitor comercial (Syften, etc.):** de pago y orientado a uso comercial; innecesario para este
  volumen.

## Rollback
`wrangler delete --config workers/reddit-mention-monitor/wrangler.toml`; opcionalmente borrar el KV
namespace y revocar el app de Reddit + el webhook de Discord.
