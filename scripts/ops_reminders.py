"""Recordatorios locales de operación de Monedario.

Lee `docs/operations/ops-schedule.json` (fuente única de pendientes con fecha)
y avisa lo que vence en la ventana configurada. Pensado para un systemd user
timer diario (ver `docs/operations/OPS-CALENDAR.md`): notifica al escritorio
con `notify-send` y, si hay un topic de ntfy configurado, manda push al
teléfono (mismo canal que usa el monitor de Reddit).

Config del topic (opcional), en orden de prioridad:
  1) variable de entorno `MONEDARIO_OPS_NTFY_TOPIC`
  2) archivo `~/.config/monedario-ops.env` con `NTFY_TOPIC=<topic>` (modo 600)

Uso:
  python3 scripts/ops_reminders.py [--days 7] [--all] [--notify]
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import urllib.error
import urllib.request
from datetime import date, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SCHEDULE_PATH = REPO_ROOT / "docs" / "operations" / "ops-schedule.json"
ENV_PATH = Path.home() / ".config" / "monedario-ops.env"
NTFY_URL = "https://ntfy.sh"
# Un pendiente vencido sigue recordándose estos días antes de dejar de molestar.
OVERDUE_GRACE_DAYS = 3


def load_schedule(path: Path = SCHEDULE_PATH) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def relative_label(item_date: date, today: date) -> str:
    delta = (item_date - today).days
    if delta == 0:
        return "hoy"
    if delta == 1:
        return "mañana"
    if delta > 1:
        return f"en {delta} días"
    return f"vencido hace {-delta} d"


def due_items(data: dict, today: date, days: int) -> list[dict]:
    """Pendientes con fecha dentro de [hoy - gracia, hoy + días]."""
    limit = today + timedelta(days=days)
    floor = today - timedelta(days=OVERDUE_GRACE_DAYS)
    out = []
    for item in data.get("items", []):
        start = date.fromisoformat(item["date"])
        end = date.fromisoformat(item["end_date"]) if item.get("end_date") else start
        if start <= limit and end >= floor:
            out.append(item)
    return sorted(out, key=lambda it: it["date"])


def format_lines(items: list[dict], today: date) -> list[str]:
    lines = []
    for item in items:
        start = date.fromisoformat(item["date"])
        end = date.fromisoformat(item["end_date"]) if item.get("end_date") else None
        when = relative_label(start, today)
        if end and end != start:
            when = f"{when}, hasta {end.isoformat()}"
        owner = f" [{item['owner']}]" if item.get("owner") else ""
        lines.append(f"→ {start.isoformat()} ({when}) {item['title']}{owner}")
    return lines


def ntfy_topic() -> str | None:
    topic = os.environ.get("MONEDARIO_OPS_NTFY_TOPIC")
    if topic:
        return topic.strip()
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            if line.startswith("NTFY_TOPIC="):
                return line.split("=", 1)[1].strip()
    return None


def notify_desktop(title: str, message: str) -> bool:
    if not os.environ.get("DBUS_SESSION_BUS_ADDRESS") or not shutil.which("notify-send"):
        return False
    try:
        subprocess.run(["notify-send", "-a", "Monedario", title, message], check=False, timeout=10)
        return True
    except OSError, subprocess.SubprocessError:
        return False


def notify_ntfy(title: str, message: str) -> bool:
    topic = ntfy_topic()
    if not topic:
        return False
    # Los headers HTTP son latin-1: un guion largo (u otro UTF-8) revienta
    # urllib. El título va ASCII y el cuerpo (UTF-8) sí admite acentos.
    safe_title = title.encode("ascii", "replace").decode("ascii")
    request = urllib.request.Request(
        f"{NTFY_URL}/{topic}",
        data=message.encode("utf-8"),
        headers={"Title": safe_title, "Tags": "calendar"},
    )
    try:
        with urllib.request.urlopen(request, timeout=10):
            return True
    except urllib.error.URLError, OSError, ValueError:
        return False


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Recordatorios de operación de Monedario")
    parser.add_argument("--days", type=int, default=7, help="ventana hacia adelante (default 7)")
    parser.add_argument("--all", action="store_true", help="imprime todo el calendario")
    parser.add_argument(
        "--notify", action="store_true", help="envía notificación (escritorio/ntfy)"
    )
    parser.add_argument("--schedule", type=Path, default=SCHEDULE_PATH)
    args = parser.parse_args(argv)

    data = load_schedule(args.schedule)
    today = date.today()

    if args.all:
        lines = format_lines(data.get("items", []), today)
        lines += [
            f"· {it['title']} (sin fecha) [{it.get('owner', '-')}]"
            for it in data.get("undated", [])
        ]
        print("\n".join(lines))
        return 0

    items = due_items(data, today, args.days)
    if not items:
        print(f"Sin pendientes en los próximos {args.days} días ({today.isoformat()}).")
        return 0

    lines = format_lines(items, today)
    print(f"Monedario · pendientes a {today.isoformat()} (ventana {args.days} días)")
    print("\n".join(lines))

    if args.notify:
        title = "Monedario: pendientes"
        sent = notify_desktop(title, "\n".join(lines))
        sent = notify_ntfy(title, "\n".join(lines)) or sent
        if not sent:
            print("aviso: sin escritorio ni topic ntfy configurado; nada que notificar.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
