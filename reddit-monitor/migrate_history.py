#!/usr/bin/env python3
"""
Migracion unica: importa el historico actual (digest-*.md, descartados.jsonl,
scan_stats.jsonl, runs.log) a reddit_monitor.db, para no perder el estado de
"Pendiente"/"Atendido" ni el historial de auditoria al pasar a la DB como
fuente principal.

Es SEGURO correrlo mas de una vez: usa INSERT OR IGNORE contra el permalink
(unico) para matches, asi que reimportar no duplica. discarded/scan_stats/
scan_runs historicos SI se pueden duplicar si se corre dos veces — por eso
el script se niega a correr si reddit_monitor.db ya tiene un scan_run con
filter_version 'legacy-import' (ya se importo antes).

Uso: python3 migrate_history.py <directorio_de_trabajo>
"""
import json
import re
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

import db as dbmod
# RM-015: ENTRY_RE canonica (unica fuente en entries.py).
from entries import ENTRY_RE, REDDIT_LINK_PREFIX

CHILE_TZ = timezone(timedelta(hours=-3))
LEGACY_FILTER_VERSION = "legacy-import"

CONF_SCORE = {"Alta": 2, "Media": 1, "Baja": 0}


def split_sections(text: str):
    pend_match = re.search(r"^## Pendiente\s*\n", text, flags=re.MULTILINE)
    aten_match = re.search(r"^## Atendido\s*\n", text, flags=re.MULTILINE)
    if not pend_match or not aten_match:
        return "", ""
    return text[pend_match.end(): aten_match.start()], text[aten_match.end():]


def parse_day(day_str: str, pendiente_block: str, atendido_block: str) -> list[dict]:
    rows = []
    for block, status in ((pendiente_block, "pendiente"), (atendido_block, "atendido")):
        for m in ENTRY_RE.finditer(block):
            gd = m.groupdict()
            hh, mm = gd["time"].split(":")
            dt = datetime.strptime(day_str, "%Y-%m-%d").replace(
                hour=int(hh), minute=int(mm), tzinfo=CHILE_TZ
            )
            signals = [s.strip() for s in gd["signals"].split(",")] if gd["signals"] != "—" else []
            link = gd["link"]
            permalink = link[len(REDDIT_LINK_PREFIX):] if link.startswith(REDDIT_LINK_PREFIX) else link
            # Permalink de post: /r/<sub>/comments/<id>/<slug>/  (5 segmentos)
            # Permalink de comentario: /r/<sub>/comments/<id>/<slug>/<comment_id>/ (6 segmentos)
            n_segments = len([p for p in permalink.split("/") if p])
            rows.append({
                "permalink": permalink,
                "type": "comment" if n_segments >= 6 else "post",
                "subreddit": gd["sub"],
                "created_utc": dt.timestamp(),
                "keyword": gd["kw"].strip(),
                "confidence": gd["conf"],
                "intent_score": CONF_SCORE.get(gd["conf"], 0),
                "signals": signals,
                "snippet": gd["snippet"].strip(),
                "status": status,
            })
    return rows


def import_digests(workdir: Path, conn) -> int:
    n = 0
    for path in sorted(workdir.glob("digest-*.md")):
        day_str = path.stem.replace("digest-", "")
        text = path.read_text(encoding="utf-8")
        pend, aten = split_sections(text)
        for row in parse_day(day_str, pend, aten):
            cur = conn.execute(
                "INSERT OR IGNORE INTO matches (permalink, type, subreddit, created_utc, "
                "detected_at, snippet, confidence, intent_score, intent_signals, "
                "filter_version, status, status_changed_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (row["permalink"], row["type"], row["subreddit"], row["created_utc"],
                 datetime.fromtimestamp(row["created_utc"], tz=CHILE_TZ).isoformat(),
                 row["snippet"], row["confidence"], row["intent_score"],
                 json.dumps(row["signals"], ensure_ascii=False), LEGACY_FILTER_VERSION,
                 row["status"], row["status"] == "atendido" and datetime.now(tz=CHILE_TZ).isoformat() or None),
            )
            if cur.rowcount:
                n += 1
                match_id = cur.lastrowid
                conn.execute(
                    "INSERT OR IGNORE INTO match_keywords (match_id, keyword) VALUES (?, ?)",
                    (match_id, row["keyword"]),
                )
    return n


def import_runs_log(workdir: Path, conn) -> dict[str, int]:
    """Devuelve un mapa ts_iso -> run_id para poder asociar scan_stats y
    discarded (que en el formato viejo no tienen run_id explicito, solo un
    campo 'ts' compartido dentro de la misma corrida)."""
    ts_to_run_id = {}
    path = workdir / "runs.log"
    if not path.exists():
        return ts_to_run_id
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        if entry.get("script") != "monitor":
            continue
        cur = conn.execute(
            "INSERT INTO scan_runs (started_at, status, lookback_seconds, "
            "gap_extended_hours, n_new, n_discarded, error_detail, filter_version) "
            "VALUES (?, ?, ?, NULL, 0, 0, ?, ?)",
            (entry["ts"], entry.get("status", "ok"), 75 * 60,
             entry.get("detail") if entry.get("status") == "error" else None,
             LEGACY_FILTER_VERSION),
        )
        ts_to_run_id[entry["ts"]] = cur.lastrowid
    return ts_to_run_id


def import_scan_stats(workdir: Path, conn, ts_to_run_id: dict[str, int]) -> int:
    path = workdir / "scan_stats.jsonl"
    if not path.exists():
        return 0
    n = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        row = json.loads(line)
        run_id = ts_to_run_id.get(row.get("ts"))
        conn.execute(
            "INSERT INTO scan_stats (run_id, subreddit, posts_scanned, comments_scanned, "
            "posts_en_ventana, comments_en_ventana) VALUES (?, ?, ?, ?, ?, ?)",
            (run_id, row["subreddit"], row.get("posts_scanned", 0), row.get("comments_scanned", 0),
             row.get("posts_en_ventana", 0), row.get("comments_en_ventana", 0)),
        )
        n += 1
    return n


def import_discarded(workdir: Path, conn, ts_to_run_id: dict[str, int]) -> int:
    path = workdir / "descartados.jsonl"
    if not path.exists():
        return 0
    n = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        row = json.loads(line)
        run_id = ts_to_run_id.get(row.get("ts"))
        reason = row.get("signals", [""])[0] if row.get("signals") else None
        conn.execute(
            "INSERT INTO discarded (run_id, permalink, type, subreddit, created_utc, "
            "detected_at, keyword, confidence, reason, snippet, filter_version) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (run_id, row.get("permalink"), row.get("type", "comment"), row["subreddit"],
             row.get("created_utc"), row.get("ts", datetime.now(tz=CHILE_TZ).isoformat()),
             row.get("keyword"), row.get("confidence"), reason, row.get("snippet"),
             LEGACY_FILTER_VERSION),
        )
        n += 1
    return n


def already_imported(conn) -> bool:
    row = conn.execute(
        "SELECT COUNT(*) AS c FROM scan_runs WHERE filter_version = ?", (LEGACY_FILTER_VERSION,)
    ).fetchone()
    return row["c"] > 0


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: migrate_history.py <directorio_de_trabajo>", file=sys.stderr)
        return 2
    workdir = Path(sys.argv[1])
    conn = dbmod.connect(workdir / "reddit_monitor.db")
    try:
        if already_imported(conn):
            print("Ya se importo el historico antes (hay scan_runs con filter_version="
                  f"'{LEGACY_FILTER_VERSION}'). No se hace nada — si quieres reimportar, "
                  "borra esas filas a mano primero.")
            return 0
        with conn:
            ts_to_run_id = import_runs_log(workdir, conn)
            n_stats = import_scan_stats(workdir, conn, ts_to_run_id)
            n_discarded = import_discarded(workdir, conn, ts_to_run_id)
            n_matches = import_digests(workdir, conn)
        print(f"Importado: {n_matches} matches, {n_discarded} descartados, "
              f"{n_stats} filas de scan_stats, {len(ts_to_run_id)} corridas de runs.log.")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
