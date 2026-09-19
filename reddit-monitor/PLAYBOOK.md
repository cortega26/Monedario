# Playbook — Monitor de Reddit para Monedario.cl

Guía de uso completa del sistema, tal como quedó armado. Todo vive en
`~/VS_Code_Projects/products/monedario/reddit-monitor/`.

## El ciclo diario (5-10 min, cuando te acomode)

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

- El código vive en `monitor.py`, `weekly_report.py`, `utm_link.py`,
  `test_monitor.py`. Corre `python3 -m pytest test_monitor.py` si en algún
  momento tocas algo tú mismo, antes de dejar que la tarea programada use
  la versión nueva.
- `credentials.json` nunca se sube a ningún lado (está en `.gitignore`) —
  solo vive en tu computador y se usa localmente en cada corrida.
- Si aún no lo hiciste: `git init && git add . && git commit -m "setup"`
  en esta carpeta, para tener historial y poder revertir si algo se rompe.

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
