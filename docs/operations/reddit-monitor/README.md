# Migrar reddit-monitor a tu VM Oracle (`pogo-lab-prod-a1`)

> **Documento histórico** de la migración inicial a la VM (septiembre 2026). Para
> operar el sistema hoy (interfaz web, etiquetas, migraciones, despliegue) ver
> [PLAYBOOK.md](PLAYBOOK.md).

## Qué encontré / qué hice

Con tu permiso entré a `Pogo-lab` y ubiqué todo lo necesario:

- La VM ya existe y corre en producción: `159.112.147.154`
  (`pogo-lab.tooltician.com`), 2 OCPU / 12GB RAM (ARM Ampere A1, capa
  gratuita), Ubuntu 22.04. Hoy aloja tu app Pogo-lab/tooltician (Django +
  nginx + Postgres vía Docker). **No toqué nada de eso.**
- La llave SSH ya existe: `infra/keys/vm_key` (usuario `ubuntu`).
- `monitor.py` y `weekly_report.py` solo usan librería estándar de Python
  (json, re, urllib, etc.) — no hace falta instalar dependencias en la VM,
  ya trae `python3`.
- El monitor **no** es un repo git todavía (`reddit-monitor/` no tiene
  `.git`), así que dejé el push a GitHub como opcional/comentado en los
  wrappers, no lo activé.

Intenté conectarme yo mismo por SSH desde mi sandbox en la nube para
dejarlo corriendo de una — pero el puerto 22 dio timeout. Es casi seguro
que el Security List de tu VCN en OCI solo permite SSH desde tu IP (buena
práctica), no desde la IP de este sandbox. Por seguridad no voy a pedirte
que abras el puerto 22 a cualquier IP solo para esto. Así que dejé todo
listo para que lo ejecutes tú, en un paso, desde tu propia terminal (que
ya tiene acceso SSH funcionando, según tu propia doc `deploy-tooltician.md`).

También borré de mi entorno cualquier copia de `vm_key`, `credentials.json`
y `.env-oci` que había traído para investigar — ya no las necesito y no
deben quedar dando vueltas.

## Cómo correrlo (1 comando)

Desde tu PC:

```bash
cd ~/VS_Code_Projects/products/monedario/reddit-monitor
bash /ruta/donde/descargaste/deploy.sh
```

El script (`deploy.sh`) hace todo:

1. Crea `/home/ubuntu/reddit-monitor` en la VM.
2. Copia el código y el estado actual (digests, runs.log, etc.) por
   `rsync`, sin tocar nada de la app Pogo-lab que ya corre ahí.
3. Copia `credentials.json` aparte, por `scp` directo.
4. Copia los wrappers y las unidades systemd (monitor + reporte semanal).
5. Te pregunta el "topic" de ntfy.sh que quieras usar para notificaciones
   (gratis, sin cuenta) y lo guarda en un `.env` en la VM.
6. Instala y activa dos `systemd timer`: uno cada 1h15m para `monitor.py`,
   otro los lunes 09:00 para `weekly_report.py` — igual cadencia que
   tienes hoy.
7. Corre una prueba inmediata y te muestra el log.

Antes de correrlo: instala la app **ntfy** en tu celular (Android/iOS) o
simplemente abre `https://ntfy.sh/<el-topic-que-elijas>` en el navegador
del celular y activa notificaciones — así te llegan los avisos de
coincidencias nuevas sin pasar por Claude.

## Qué NO hice (y por qué)

- No activé `git push` de los digests — no había repo. Si lo quieres,
  crea uno (`git init` en `reddit-monitor/`, un repo nuevo en GitHub) y
  descomenta el bloque de git en `run_monitor.sh` / `run_weekly_report.sh`.
- No cambié nada en la app Pogo-lab/tooltician que ya corre en esa VM —
  el monitor queda en su propia carpeta (`/home/ubuntu/reddit-monitor`),
  su propio usuario systemd, sin compartir puertos ni contenedores.

## Qué hacer con la tarea programada de Claude actual

Una vez que esto corra solo en la VM, la tarea programada de Claude que
intentaba conectarse a tu PC ya no aporta nada — puedes:

- Desactivarla (lo más simple, ya que la VM cubre la detección y la
  alerta), o
- Pedirme que la reemplace por algo más útil: una tarea diaria que lea
  los digests desde GitHub (si activas el push) y te mande un resumen
  editorial con ángulos de contenido para Monedario.

Dime cuál prefieres cuando confirmes que el despliegue en la VM quedó
funcionando.

## Verificar que quedó corriendo

```bash
VM_KEY=~/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key
ssh -i $VM_KEY ubuntu@159.112.147.154 'systemctl list-timers | grep reddit'
ssh -i $VM_KEY ubuntu@159.112.147.154 'journalctl -u reddit-monitor.service -n 30 --no-pager'
```
