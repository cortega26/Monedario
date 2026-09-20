# Playbook — Monitor de Reddit para Monedario.cl

Guía de uso completa del sistema, tal como quedó armado. El código vive en
`~/VS_Code_Projects/products/monedario/reddit-monitor/` (versionado en este
repositorio) y corre en la VM en `/home/ubuntu/reddit-monitor/`.

## Interfaz web (ciclo diario recomendado)

`https://reddit.monedario.cl` (HTTP Basic Auth, usuario `carlos`, contraseña en
`WEB_PASSWORD` del `.env` de la VM; el sitio envía `noindex` y su `robots.txt`
bloquea todo). Reemplaza la edición manual de los digests, que se siguen
generando como respaldo.

| Página | Para qué sirve |
|---|---|
| **Cola** (`/`) | Pendientes ordenados por prioridad y urgencia. *Marcar atendido* guarda la acción (y el link con UTM si lo usaste) y la etiqueta `accionable`. *Descartar porque…* pide el motivo en un clic (ver tabla más abajo). |
| **Atendidos** (`/atendidos`) | Historial de atendidos y descartados, con el motivo del descarte. |
| **Revisión** (`/revision`) | Dos bloques: los descartes previos sin motivo (asígnales el real) y una muestra para calibrar el filtro (casos donde las reglas y la capa semántica discrepan, incluidos descartes automáticos que quizá eran buenos). |
| **Wikis** (`/wikis`) | Seguimiento de wikis de recursos por subreddit. |

Cada decisión en la cola o en `/revision` es una **etiqueta** que alimenta la
mejora del filtro: no es trámite, es lo que permite decidir con datos si hace
falta un modelo.

## El ciclo diario con digests (alternativa manual)

1. Abre `index.md` — te dice, por día, cuántos pendientes y atendidos hay
   sin que abras archivo por archivo.
2. Abre el `digest-YYYY-MM-DD.md` de hoy (o el más reciente con pendientes).
   Dentro de "## Pendiente" las entradas ya vienen ordenadas por confianza:
   **[Alta]** primero, luego **[Media]**. Empieza por ahí.
3. Para cada entrada que te interese: lee el hilo completo en Reddit (el
   snippet del digest es solo un adelanto, el contexto real puede cambiar
   si vale la pena responder).
4. Responde de forma útil **sin link primero**. Solo agregas un link a
   Monedario si aporta algo que no cabe en el comentario (una calculadora,
   datos actualizados). Genera ese link con:
   ```
   python3 utm_link.py <url_de_monedario> <subreddit> [nota_opcional]
   ```
   así puedes medir después qué hilos convierten de verdad en Google
   Analytics (Adquisición de tráfico → filtrar por `reddit.com`).
5. Cuando termines con una entrada (respondiste, o decidiste que no vale
   la pena), muévela de `## Pendiente` a `## Atendido` en el mismo archivo
   — puedes agregarle una nota tipo "(respondido 17/09)". El script nunca
   toca lo que ya está en Atendido, así que es 100% seguro editarlo a mano.

No hace falta que hagas esto todos los días — el sistema no pierde nada
si te atrasas dos o tres días, las entradas quedan esperando en Pendiente.

## Etiquetas y ciclo de feedback

Motivos disponibles y cómo se traducen a etiqueta (fuente única: `reviews.py`):

| Motivo | Etiqueta (objetivo: ¿accionable?) | ¿Es del tema? | Cuándo |
|---|---|---|---|
| `accionable` | relevante | sí | Atendido, o "sí valía la pena" en `/revision` |
| `tema_sin_accion` | ruido | sí | Es de finanzas, pero no hay cómo aportar |
| `ya_resuelto` | ruido | sí | Ya tiene buenas respuestas o está cerrado |
| `ruido` | ruido | no | No es un tema financiero |

Separar "no es del tema" de "es del tema, sin cómo aportar" importa: mezclados,
un modelo aprendería a rechazar temas buenos. Las etiquetas importadas de
decisiones históricas (`descarte_previo`) son **implícitas** y pesan 0,3 frente
a 1,0 de las explícitas.

**Etapas** (estado al 2026-09-19):

1. **Captura de etiquetas** — hecha: motivos en la cola, `/revision`, migración v3.
2. **Línea base** — hecha la herramienta; falta volumen de etiquetas.
   `python3 eval_filter.py .` (en la VM, dentro de `~/reddit-monitor`) mide la
   precisión de las reglas, los falsos negativos y el AUC de `ml_confidence`,
   con intervalos de Wilson y aviso "no concluyente" bajo 30 casos. **Sin
   descartes automáticos etiquetados, el recall es desconocido, no bueno.**
3. **Modo sombra** — pendiente: un clasificador puntúa cada item y se guarda
   junto a la decisión de las reglas, sin decidir nada.
4. **Promoción** — pendiente. Puerta: 150 o más etiquetas explícitas (40 o más
   por clase) y mejor precisión que las reglas en datos apartados. Primero solo
   ordena la cola; los de baja puntuación pasan a "baja prioridad", nunca se
   descartan (para no perder falsos negativos).

Hallazgo que condiciona el diseño: los prototipos actuales de la capa semántica
no discriminan (`ml_confidence` fue más alto en los descartados que en los
pendientes); la ruta prevista es usar los embeddings como *features* de un
clasificador entrenado con estas etiquetas, no como regla fija.

## Subreddits monitoreados

`chile`, `Santiago`, `RepublicadeChile`, `FinanzasChile`, `AskChile`,
`ChileInversiones`, `derechoenchile`, `ChileStartup`, `chile_autos`, `ChileIT`
(`config.json`). Criterio del 2026-09-19: sub chileno, al menos 1.000 miembros,
actividad real y matches con las keywords; se descartaron `BolsaChile` (0,1
posts/día, último post hace 142 días) y los subs hispanos o españoles
(`finanzas`, `inversionESP`, `Inversiones`: otra normativa y moneda). Medido
sobre los últimos 100 posts de cada sub.

Este monitor es el **único** sistema que escucha Reddit para Monedario: el
Worker de alertas de Cloudflare se retiró (nunca llegó a funcionar; ver
`docs/adr/ADR-20260919-reddit-single-monitor.md`). Los avisos van por ntfy y la
cola web.

## El ciclo semanal (lunes, ya generado solo)

Cada lunes 09:00 aparece `reporte-semanal-<AAAA>-W<NN>.md`. Revísalo antes
de planear contenido de la semana. Trae:

- **Brechas de contenido**: qué keywords se repitieron más → candidatos a
  artículo o calculadora nueva.
- **Tabla de confianza vs. atención real**: si "Alta" no se atiende más
  que "Media" con el tiempo, avísame — significa que el heurístico de
  intención necesita recalibrarse.
- **Estimación de tiempo**: cuántos minutos/horas tomaría responder bien
  todo lo relevante de la semana — úsalo para decidir cuánto tiempo
  dedicarle sin que se coma el tiempo de escribir contenido nuevo.
- **KPIs acumulados**: total histórico de menciones y atención, y en qué
  wikis de subreddits ya quedó listado Monedario.
- **Oportunidades de wiki**: cuando marque un subreddit con página de
  recursos vacía o sin mencionar Monedario, escríbele a los moderadores
  ofreciendo el recurso, con tu identidad clara. Es la forma más durable
  de generar tráfico — una vez listado, sigue funcionando solo.

## Cómo afinar el sistema (sin pedirme que edite Python)

Todo lo ajustable vive en `config.json`, se crea solo con valores por
defecto en la primera corrida. Puedes editarlo directo:

- `subreddits`: agrega o quita subs a monitorear.
- `own_authors`: tus cuentas de Reddit (sin `u/`, sin distinguir mayúsculas).
  Todo lo que escriban se descarta antes de clasificarlo, para que el monitor
  no te sugiera responder a tus propias respuestas. Si ya se coló algo,
  `python3 purge_own_authors.py .` cuenta los matches propios (dry-run) y
  `--apply` los borra junto con sus etiquetas (haz `bash backup_db.sh` antes).
- `resource_map`: qué recurso de Monedario sugerir según el hilo. Lista
  ordenada de grupos `{label, url, phrases}`; gana el primer grupo cuyas
  frases aparecen en el título o el snippet (sin acentos ni mayúsculas, por
  palabra completa). La cola muestra "Sugerencia: …" y prellena la URL del
  formulario de atender. Solo se aceptan URLs `https://`. Aplica al momento,
  incluso a los pendientes ya guardados. Los grupos actuales vienen de las 5
  búsquedas del antiguo Worker de alertas (calculadoras). Ojo: es una
  coincidencia por frase exacta, con cobertura baja (unos pocos hilos por
  semana); sirve para agregar frases o guías del blog, no para adivinar.
- `keywords`: agrega términos que veas que faltan (o quita los que generen
  demasiado ruido — revisa `descartados.jsonl` para detectar cuáles).
- `intent_phrases` / `interrogative_starters`: las señales que detectan
  pregunta/pedido de consejo real. Si ves en `descartados.jsonl` casos que
  SÍ eran relevantes y se descartaron, esa es la señal de que falta una
  frase aquí.
- `time_estimate_minutes`: cuántos minutos asumir por nivel de confianza
  al calcular la estimación de tiempo semanal.

Los cambios aplican en la siguiente corrida automáticamente — no hay que
reiniciar nada ni avisarme.

## Auditoría (para cuando quieras revisar si el sistema está funcionando bien)

- `runs.log`: una línea por corrida (horaria y semanal) con éxito/error.
  Si algo empieza a fallar seguido, aparece ahí — vale la pena mirarlo de
  vez en cuando.
- `descartados.jsonl`: keywords que matchearon pero el filtro de intención
  descartó. Muestréalo cada tanto para chequear que no estemos botando
  contenido relevante (falsos negativos) ni generando ruido por ambigüedad
  de palabras (ej. "impuesto" como sustantivo vs. participio).
- `scan_stats.jsonl`: cuánto se escaneó por subreddit en cada corrida,
  para poder calcular tasa de hit real si algún día quieres ajustar el
  set de keywords con base en datos, no en intuición.

## Mantenimiento

- El código vive en `monitor.py`, `app.py` (web), `weekly_report.py`,
  `reviews.py`, `dataset.py`, `eval_filter.py`, `utm_link.py` y sus tests
  (`test_monitor.py`, `test_fase06.py`, `test_reviews.py`, `test_eval.py`).
  Antes de desplegar cambios: `python3 -m pytest test_monitor.py test_reviews.py
  test_eval.py` en local. `test_fase06.py` necesita spaCy, que solo está en la
  VM (allí: `python3 -m pytest -p no:anyio test_fase06.py`).
- `credentials.json` nunca se sube a ningún lado (está en `.gitignore`) —
  solo vive en tu computador y se usa localmente en cada corrida.
- El código está versionado en el repositorio `monedario` (carpeta
  `reddit-monitor/`); los datos de ejecución (DB, logs, digests) están en
  `.gitignore` y no se suben.

### Esquema y migraciones

`schema_meta.schema_version` declara la versión de la DB y `db.connect()` **falla
rápido** si no coincide con la que espera el código. Versiones: v1 base, v2 Fase
0.6 (columnas ML), v3 etiquetas humanas (`reason`, `on_topic`, `source` en
`human_reviews`). Para subir una DB antigua, en este orden (ambas idempotentes):

```bash
python3 migrate_fase06_schema.py .   # v1 -> v2
python3 migrate_v3_reviews.py .      # v2 -> v3 (además importa etiquetas implícitas)
```

Al añadir un cambio de esquema: `schema.sql` corre en **cada** conexión antes de
migrar, así que nunca debe crear índices ni restricciones sobre columnas nuevas
(una DB vieja fallaría al conectar). Cada migración sella su propia versión, no
la que espera el código actual, y la última sube `EXPECTED_SCHEMA_VERSION` en
`db.py`.

### Desplegar cambios a la VM

Para el primer despliegue está `deploy.sh`; para actualizar código:

1. Parar `reddit-monitor.timer` y `reddit-monitor-web.service` (nunca
   `pogo-lab.service`, que comparte la VM).
2. Respaldar: `bash backup_db.sh` y un `tar` del código.
3. Copiar el árbol con `tar` por SSH, excluyendo `*.db*`, `credentials.json`,
   `.env`, logs y digests. Los `.sh` deben conservar el bit de ejecución.
4. Migrar (sección anterior).
5. Escaneo manual: `sudo systemctl start reddit-monitor.service` y revisar
   `runs.log`.
6. Reactivar timer y servicio web.
7. Verificar con GET **autenticados** de `/`, `/revision`, `/atendidos` y
   `/wikis` (un 401 solo prueba que la ruta existe; `curl -I` da 405 porque
   FastAPI no atiende HEAD en rutas GET).

### Copia offsite de la DB (RM-012, mensual sugerido)

`backup_db.sh` corre en la VM y guarda 14 días de backups en
`/home/ubuntu/reddit-monitor/backups/`. La VM no tiene R2, así que la
copia offsite se trae **desde tu PC** (el script corre en la VM; la
dirección correcta es pull, no push). Un one-liner con las mismas
convenciones `VM_HOST`/`VM_KEY` de `deploy.sh`:

```bash
VM_KEY=~/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key; VM_HOST=ubuntu@159.112.147.154; LATEST=$(ssh -i $VM_KEY $VM_HOST 'ls -t /home/ubuntu/reddit-monitor/backups/reddit_monitor-*.db.gz | head -n1') && scp -i $VM_KEY $VM_HOST:$LATEST ./$(basename $LATEST) && gunzip -c $(basename $LATEST) > /tmp/offsite-check.db && sqlite3 /tmp/offsite-check.db "PRAGMA integrity_check;" && rm -f /tmp/offsite-check.db
```

Debe imprimir `ok`. Procedimiento completo de restauración: `RESTORE.md`.

### Rotación de digests (90d)

Mueve a `archive/` los `digest-*.md` de más de 90 días (nada que mover
hoy: solo existen los de 2026-09-17 y 2026-09-18):

```bash
find . -maxdepth 1 -name 'digest-*.md' -mtime +90 -exec mv {} archive/ \;
```

`archive/` queda excluido automáticamente: los globs `digest-*.md` de
`rebuild_index` (monitor.py) y `collect_week` (weekly_report.py) no son
recursivos, así que `index.md` y el reporte semanal siguen funcionando.
Excepción conocida (diferido a Wave 3): `collect_all_time` de
weekly_report.py lee solo digests del nivel superior, así que los KPIs
acumulados futuros no verán el historial archivado — antes de archivar,
deja que un reporte semanal corra para consolidar `kpis.json`.

## Lo que NO hacemos, nunca

- No automatizamos respuestas ni publicaciones. Todo lo que sale de tu
  cuenta de Reddit lo escribes tú, a mano.
- No usamos varias cuentas para simular consenso ni votamos artificialmente.
- No enlazamos donde el contenido no aporta valor real a la pregunta.
