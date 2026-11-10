# ADR-20261110-deploy-health-and-ingestion-resilience

Date: 2026-11-10
Status: Accepted

## Context

Entre el 2026-11-02 y el 2026-11-10 el sitio publicó UF y dólar de hace una
semana, aunque el Worker de snapshot siguió haciendo commits con valores
frescos. Tres defectos independientes se sumaron sin que nada lo señalara:

1. **Una excepción de gobernanza venció y bloqueó el deploy.** La excepción de
   `/posts/cotizacion-voluntaria-afp-independiente/` expiró el 2026-11-02;
   `check-indexable-url-freeze` (parte de `pnpm run build`) pasó a fallar en
   cada build de producción de Cloudflare Pages, y `check:routes` en el CI de
   todos los PRs. El único aviso fue un issue de CI (#755) que nadie atendió.
2. **Faltaban los secretos `BCCH_USER`/`BCCH_PASSWORD` en GitHub Actions**, así
   que las ingestas de UF e IPC fallaban en su primer paso.
3. **La ingesta del IPC era frágil.** Descargaba 27 años de mindicador.cl con un
   solo intento por año y omitía los años que fallaban; ese hueco lo rellenaba
   el BCCh (otra base y redondeo), el guard de revisión de valores veía 32
   "cambios" y abortaba. Un fallo transitorio de la fuente se convertía en un
   bloqueo que parecía una revisión de datos.

## Decision

- **El deploy no depende de un reloj de gobernanza.** En el build de Cloudflare
  Pages (`CF_PAGES=1`) una excepción vencida se degrada a advertencia; una URL
  sin aprobar sigue fallando. CI (PR y programado) conserva la exigencia
  estricta. Además, toda excepción a ≤14 días de vencer produce una
  advertencia en el gate.
- **Se vigila el sitio publicado, no el repositorio.** `deploy-health.yml`
  (cada 6 h) compara las fechas de UF y dólar de la portada en vivo con la
  fecha de Santiago y revisa excepciones vencidas o por vencer; mantiene un
  único issue abierto mientras haya un problema (`check:deploy-health`).
- **La ingesta tolera la fuente intermitente.** Cada año se reintenta 3 veces
  con espera creciente; si sigue fallando se conservan las entradas ya
  publicadas de ese año; los años cerrados ya publicados no se vuelven a pedir
  (solo el año en curso y el anterior; `--full-refetch` fuerza todo). El guard
  de revisión de valores no se relaja.
- Los secretos del BCCh quedan en el repositorio.

## Consequences

- Un fallo de mindicador.cl ya no bloquea ni reescribe el histórico; la ingesta
  pasa de ~7 min con fallos a ~1,5 min.
- Una excepción vencida deja de tumbar la publicación, pero sigue rompiendo el
  CI y generando el issue de `deploy-health`: la decisión de renovarla o
  promoverla sigue siendo del owner, solo que ya no con el sitio caído.
- El histórico cerrado solo se corrige con `--full-refetch` y revisión humana.
