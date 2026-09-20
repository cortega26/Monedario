#!/usr/bin/env python3
"""
Reporte semanal de crecimiento — Monedario.cl (Reddit).
SOLO LECTURA: nunca publica, comenta, vota ni interactua con Reddit.

Toma los digest-YYYY-MM-DD.md de los ultimos 7 dias (generados por
monitor.py) y produce:
  1. Un ranking de keywords/temas mas recurrentes -> candidatos a articulo
     o calculadora nueva (brecha de contenido).
  2. Volumen y tasa de atencion (Pendiente vs Atendido) por subreddit.
  3. Chequeo de oportunidades de wiki/recursos: para cada subreddit
     monitoreado, revisa si tiene wiki publico, si alguna pagina parece
     ser de "recursos"/"herramientas"/"plataformas", y si ya menciona
     "monedario". Si el wiki existe pero la pagina de recursos esta vacia
     o no menciona Monedario, lo marca como oportunidad de contacto con
     moderadores.

Uso: python3 weekly_report.py <directorio_de_trabajo>
Requiere credentials.json y los digest-*.md en el mismo directorio.
Escribe reporte-semanal-<AAAA>-W<NN>.md en el mismo directorio.
"""
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path
from datetime import datetime, timezone, timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent))
import db as dbmod  # noqa: E402 — escritura via db.connect, nunca sqlite3 directo
from monitor import get_token, api_get, load_config, log_run  # noqa: E402
# RM-015: ENTRY_RE canonica (unica fuente en entries.py).
from entries import ENTRY_RE  # noqa: E402

CHILE_TZ = timezone(timedelta(hours=-3))
RESOURCE_PAGE_HINTS = ["recurso", "herramienta", "plataforma", "resource", "tool", "links", "enlaces"]


def parse_digest_file(path: Path) -> tuple[list[dict], list[dict]]:
    text = path.read_text(encoding="utf-8")
    pend_match = re.search(r"^## Pendiente\s*\n", text, flags=re.MULTILINE)
    aten_match = re.search(r"^## Atendido\s*\n", text, flags=re.MULTILINE)
    if not pend_match or not aten_match:
        return [], []
    pendiente_raw = text[pend_match.end(): aten_match.start()]
    atendido_raw = text[aten_match.end():]

    def entries(raw: str) -> list[dict]:
        out = []
        for m in ENTRY_RE.finditer(raw):
            out.append(m.groupdict())
        return out

    return entries(pendiente_raw), entries(atendido_raw)


def collect_week(workdir: Path, days: int = 7) -> tuple[list[dict], list[dict], list[str]]:
    today = datetime.now(tz=CHILE_TZ).date()
    cutoff_date = today - timedelta(days=days - 1)
    all_pend, all_aten, files_used = [], [], []

    for path in sorted(workdir.glob("digest-*.md")):
        m = re.match(r"digest-(\d{4}-\d{2}-\d{2})\.md", path.name)
        if not m:
            continue
        file_date = datetime.strptime(m.group(1), "%Y-%m-%d").date()
        if file_date < cutoff_date:
            continue
        pend, aten = parse_digest_file(path)
        all_pend.extend(pend)
        all_aten.extend(aten)
        files_used.append(path.name)

    return all_pend, all_aten, files_used


def collect_all_time(workdir: Path) -> tuple[list[dict], list[dict]]:
    """Igual que collect_week pero sin limite de fecha — para KPIs
    acumulados historicos, no solo de la semana. RM-010: incluye tambien
    archive/*.md (rotacion de 90d mueve digests viejos ahi) para que los
    KPIs no se reseteen al archivar; si un nombre existe en ambos lados,
    manda el archivo vivo (raiz) y la copia archivada se ignora."""
    all_pend, all_aten = [], []
    seen: set[str] = set()
    paths = sorted(workdir.glob("digest-*.md")) + sorted(workdir.glob("archive/*.md"))
    for path in paths:
        if path.name in seen:
            continue
        seen.add(path.name)
        if path.parent == workdir and not re.match(r"digest-\d{4}-\d{2}-\d{2}\.md", path.name):
            continue
        # archive/*.md: se acepta cualquier .md; parse_digest_file devuelve
        # ([], []) si el archivo no trae secciones Pendiente/Atendido.
        pend, aten = parse_digest_file(path)
        all_pend.extend(pend)
        all_aten.extend(aten)
    return all_pend, all_aten


def load_kpis(workdir: Path) -> dict:
    path = workdir / "kpis.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"wiki_mentions_first_seen": {}}


def update_kpis(workdir: Path, kpis: dict, wiki_lines: list[str], today_str: str) -> bool:
    """Actualiza kpis.json con nuevas menciones confirmadas en wikis.
    Devuelve True si hubo cambios (para decidir si comitear)."""
    changed = False
    for line in wiki_lines:
        m = re.match(r"- r/(\S+): Monedario YA aparece mencionado", line)
        if m:
            sub = m.group(1)
            if sub not in kpis["wiki_mentions_first_seen"]:
                kpis["wiki_mentions_first_seen"][sub] = today_str
                changed = True
    if changed:
        (workdir / "kpis.json").write_text(
            json.dumps(kpis, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    return changed


def keyword_ranking(pend: list[dict], aten: list[dict]) -> Counter:
    """Ranking de keywords de la semana (fuente unica: lo usa el reporte en
    Markdown y el writer RM-020, para que ambos vean los mismos numeros)."""
    return Counter(e["kw"] for e in (pend + aten))


# --- RM-020: writer content_gaps desde el ranking semanal -------------------
# Mapeo al esquema REAL de schema.sql (content_gaps NO tiene columnas
# week/hits/disposition: solo keyword UNIQUE, first/last_seen_at,
# times_seen, status, content_url, notes — no se agregan columnas para no
# subir la version de esquema RM-016 ni exigir migracion):
#   week  -> etiqueta [gap-week:AAAA-WNN] en notes + last_seen_at (la
#            etiqueta es lo que hace idempotente el re-proceso: la misma
#            semana aplicada dos veces no suma dos veces).
#   hits  -> times_seen (acumula; solo suma semanas no vistas antes).
#   disposition candidate|article|calculator|rejected -> dominio status
#            existente: candidate = 'detectado' (unico estado que escribe
#            este writer, al insertar); article|calculator = 'publicado'
#            (+ content_url) y rejected = 'descartado', ambos solo por
#            triage humano en la UI; 'en_backlog' es intermedio humano.
#            El writer NUNCA pisa status/content_url/first_seen_at en
#            conflicto: el triage humano manda.
# Gate: CONTENT_GAPS_ENABLED=1 (default OFF — sin la variable no se escribe
# nada; ver content_gaps_enabled()).

def content_gaps_enabled() -> bool:
    """Feature flag RM-020: default OFF, se habilita con =1."""
    return os.environ.get("CONTENT_GAPS_ENABLED", "") == "1"


def gap_week_tag(week_label: str) -> str:
    return f"[gap-week:{week_label}]"


def write_content_gaps(db_path: Path, ranking: dict[str, int],
                       week_label: str, now_iso: str | None = None) -> dict[str, int]:
    """Upsert idempotente por (keyword, week) del ranking semanal a
    content_gaps, SOLO via db.connect. Devuelve conteo
    {inserted, updated, skipped}. Re-correr la misma semana es no-op."""
    now_iso = now_iso or datetime.now(tz=CHILE_TZ).isoformat()
    tag = gap_week_tag(week_label)
    stats = {"inserted": 0, "updated": 0, "skipped": 0}
    conn = dbmod.connect(db_path)
    try:
        with conn:
            for keyword, hits in ranking.items():
                kw = (keyword or "").strip()
                if not kw or hits <= 0:
                    continue
                row = conn.execute(
                    "SELECT times_seen, last_seen_at, notes FROM content_gaps WHERE keyword = ?",
                    (kw,),
                ).fetchone()
                if row is None:
                    conn.execute(
                        "INSERT INTO content_gaps (keyword, first_seen_at, times_seen, "
                        "last_seen_at, status, notes) VALUES (?, ?, ?, ?, 'detectado', ?)",
                        (kw, now_iso, hits, now_iso, tag),
                    )
                    stats["inserted"] += 1
                elif tag in (row["notes"] or ""):
                    stats["skipped"] += 1  # semana ya aplicada: no-op
                else:
                    prev_notes = (row["notes"] or "").strip()
                    notes = f"{prev_notes} {tag}".strip()
                    conn.execute(
                        "UPDATE content_gaps SET times_seen = ?, last_seen_at = ?, notes = ? "
                        "WHERE keyword = ?",
                        (row["times_seen"] + hits, now_iso, notes, kw),
                    )
                    stats["updated"] += 1
    finally:
        conn.close()
    return stats


def check_wiki_opportunities(token: str, user_agent: str, subreddits: list[str]) -> list[str]:
    lines = []
    for sub in subreddits:
        try:
            pages_resp = api_get(f"/r/{sub}/wiki/pages", token, user_agent)
            pages = pages_resp.get("data", [])
        except Exception:
            lines.append(f"- r/{sub}: sin wiki publico accesible (o restringido).")
            continue

        if not pages:
            lines.append(f"- r/{sub}: tiene wiki pero sin paginas.")
            continue

        candidate_pages = [p for p in pages if any(hint in p.lower() for hint in RESOURCE_PAGE_HINTS)]
        if not candidate_pages:
            lines.append(
                f"- r/{sub}: wiki con {len(pages)} paginas, ninguna parece ser de "
                f"recursos/herramientas — revisar manualmente si vale la pena proponer una."
            )
            continue

        mentioned = False
        empty_pages = []
        for page in candidate_pages[:5]:
            try:
                content = api_get(f"/r/{sub}/wiki/{page}", token, user_agent)
                md = content.get("data", {}).get("content_md", "") or ""
            except Exception:
                continue
            if "monedario" in md.lower():
                mentioned = True
            if len(md.strip()) < 20:
                empty_pages.append(page)

        if mentioned:
            lines.append(f"- r/{sub}: Monedario YA aparece mencionado en su wiki de recursos. ✅")
        elif empty_pages:
            lines.append(
                f"- r/{sub}: existe pagina de recursos ({', '.join(empty_pages)}) pero esta vacia/casi vacia "
                f"— oportunidad: contactar moderadores y ofrecer Monedario como recurso cuando la llenen."
            )
        else:
            lines.append(
                f"- r/{sub}: tiene pagina(s) de recursos con contenido ({', '.join(candidate_pages[:5])}) "
                f"y Monedario NO aparece — oportunidad: revisar y proponer inclusion a los moderadores."
            )

    return lines


def render_report(pend: list[dict], aten: list[dict], files_used: list[str],
                   wiki_lines: list[str], week_label: str, time_estimates: dict,
                   all_time_pend: list[dict], all_time_aten: list[dict],
                   kpis: dict) -> str:
    all_entries = pend + aten
    kw_counter = keyword_ranking(pend, aten)
    sub_counter = Counter(e["sub"] for e in all_entries)
    conf_counter = Counter(e["conf"] for e in all_entries)

    total = len(all_entries)
    atendidos = len(aten)
    tasa = f"{(atendidos / total * 100):.0f}%" if total else "—"

    lines = [f"# Reporte semanal de crecimiento — Monedario.cl ({week_label})\n\n"]
    lines.append(f"Basado en: {', '.join(files_used) if files_used else 'sin datos esta semana'}\n\n")
    lines.append(f"**Total de menciones relevantes:** {total} · **Atendidas:** {atendidos} ({tasa}) "
                 f"· **Alta confianza:** {conf_counter.get('Alta', 0)} · **Media:** {conf_counter.get('Media', 0)}\n\n")

    lines.append("## ¿El nivel de confianza predice lo que realmente atiendes?\n\n")
    lines.append(
        "Si 'Alta' no se atiende mas que 'Media', el heuristico no esta discriminando "
        "de verdad y conviene recalibrarlo.\n\n"
    )
    lines.append("| Confianza | Total | Atendidos | Tasa de atención |\n|---|---|---|---|\n")
    for conf in ("Alta", "Media", "Baja"):
        conf_total = sum(1 for e in all_entries if e["conf"] == conf)
        conf_aten = sum(1 for e in aten if e["conf"] == conf)
        if conf_total:
            conf_tasa = f"{(conf_aten / conf_total * 100):.0f}%"
            lines.append(f"| {conf} | {conf_total} | {conf_aten} | {conf_tasa} |\n")
    lines.append("\n")

    total_minutes = sum(time_estimates.get(e["conf"], 2) for e in all_entries)
    lines.append("## Estimación de tiempo\n\n")
    if total_minutes:
        lines.append(
            f"~{total_minutes} min ({total_minutes / 60:.1f} h) para responder bien cada mención de "
            f"esta semana, según los minutos por nivel de confianza definidos en config.json "
            f"(`time_estimate_minutes`).\n\n"
        )
    else:
        lines.append("Sin menciones esta semana — 0 min estimados.\n\n")

    lines.append("## KPIs acumulados (histórico completo, no solo esta semana)\n\n")
    all_time_total = len(all_time_pend) + len(all_time_aten)
    all_time_atendidos = len(all_time_aten)
    at_tasa = f"{(all_time_atendidos / all_time_total * 100):.0f}%" if all_time_total else "—"
    lines.append(f"- Menciones relevantes detectadas en total: {all_time_total}\n")
    lines.append(f"- Atendidas en total: {all_time_atendidos} ({at_tasa})\n")
    mentions = kpis.get("wiki_mentions_first_seen", {})
    if mentions:
        lines.append(f"- Wikis donde Monedario ya está listado: {len(mentions)} "
                      f"({', '.join(f'r/{s} desde {d}' for s, d in mentions.items())})\n")
    else:
        lines.append("- Wikis donde Monedario ya está listado: 0 todavía\n")
    lines.append("\n")

    lines.append("## Brechas de contenido (keywords mas recurrentes)\n\n")
    if kw_counter:
        lines.append("| Keyword | Menciones | ¿Vale la pena un articulo/calculadora? |\n|---|---|---|\n")
        for kw, count in kw_counter.most_common(15):
            sugerencia = "Sí — revisar si Monedario ya lo cubre" if count >= 2 else "Vigilar"
            lines.append(f"| {kw} | {count} | {sugerencia} |\n")
    else:
        lines.append("Sin coincidencias esta semana.\n")
    lines.append("\n")

    lines.append("## Volumen por subreddit\n\n")
    if sub_counter:
        lines.append("| Subreddit | Menciones |\n|---|---|\n")
        for sub, count in sub_counter.most_common():
            lines.append(f"| r/{sub} | {count} |\n")
    else:
        lines.append("Sin datos.\n")
    lines.append("\n")

    lines.append("## Oportunidades de wiki / recursos\n\n")
    lines.extend(f"{line}\n" for line in wiki_lines)
    lines.append("\n")

    lines.append("## Recordatorio de playbook\n\n")
    lines.append(
        "Responde primero de forma util (sin link) y enlaza solo cuando aporte algo que no cabe en el "
        "comentario. Usa UTM en cada link que compartas (ver utm_link.py). No automatices respuestas ni "
        "publiques nada sin revisión manual.\n"
    )

    return "".join(lines)


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: weekly_report.py <directorio_de_trabajo>", file=sys.stderr)
        return 2

    workdir = Path(sys.argv[1])

    try:
        cfg = load_config(workdir)
        creds = json.loads((workdir / "credentials.json").read_text(encoding="utf-8"))
        token = get_token(creds["client_id"], creds["client_secret"], creds["user_agent"])

        pend, aten, files_used = collect_week(workdir)
        all_time_pend, all_time_aten = collect_all_time(workdir)

        try:
            wiki_lines = check_wiki_opportunities(token, creds["user_agent"], cfg["subreddits"])
        except Exception as exc:  # noqa: BLE001
            wiki_lines = [f"(no se pudo revisar wikis esta semana: {exc})"]

        today = datetime.now(tz=CHILE_TZ)
        iso_year, iso_week, _ = today.isocalendar()
        week_label = f"{iso_year}-W{iso_week:02d}"
        report_path = workdir / f"reporte-semanal-{week_label}.md"

        kpis = load_kpis(workdir)
        kpis_changed = update_kpis(workdir, kpis, wiki_lines, today.strftime("%Y-%m-%d"))

        report_path.write_text(
            render_report(pend, aten, files_used, wiki_lines, week_label,
                          cfg.get("time_estimate_minutes", {}),
                          all_time_pend, all_time_aten, kpis),
            encoding="utf-8",
        )

        # RM-020: writer content_gaps, default OFF (CONTENT_GAPS_ENABLED=1).
        # Un fallo aqui no tumba el reporte: el Markdown ya esta escrito.
        gaps_line = ""
        if content_gaps_enabled():
            try:
                gaps_stats = write_content_gaps(
                    workdir / "reddit_monitor.db", keyword_ranking(pend, aten), week_label,
                )
                gaps_line = (
                    f"content_gaps: {gaps_stats['inserted']} nuevas, "
                    f"{gaps_stats['updated']} actualizadas, "
                    f"{gaps_stats['skipped']} ya aplicadas ({week_label})"
                )
            except Exception as exc:  # noqa: BLE001
                gaps_line = f"content_gaps: OMITIDO por error ({exc})"
    except Exception as exc:  # noqa: BLE001
        log_run(workdir, "weekly_report", "error", str(exc))
        print(f"ERROR: {exc}", file=sys.stderr)
        print("COMMIT: runs.log")
        return 1

    summary = f"Reporte generado: {report_path.name} ({len(pend) + len(aten)} entradas analizadas)"
    log_run(workdir, "weekly_report", "ok", summary)
    print(summary)
    if gaps_line:
        print(gaps_line)
    commit_files = [report_path.name, "runs.log"]
    if kpis_changed:
        commit_files.append("kpis.json")
    print(f"COMMIT: {','.join(commit_files)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
