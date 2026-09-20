"""
Fase 1 — interfaz web de reddit-monitor.

Decision de diseño deliberada: formularios HTML planos, sin HTMX ni
JavaScript. Se hablo de HTMX en el diseño original, pero se cambia aqui a
proposito: esta app se despliega y prueba de forma remota (sin poder
depurar JS en vivo en la VM), asi que se prioriza robustez sobre pulido.
Sigue cumpliendo el objetivo real: reemplaza la edicion manual de
Markdown, funciona bien desde el celular, sin recargar nada raro.

Auth: HTTP Basic, un solo usuario, contraseña en variable de entorno
WEB_PASSWORD (ver .env). Suficiente para una herramienta interna de un
solo usuario detras de un subdominio no adivinable — no se monta
Cloudflare Access para mantener la superficie de configuracion minima.
"""
import json
import os
import secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path

from fastapi import FastAPI, Depends, Form, HTTPException, Request
from fastapi.responses import RedirectResponse, HTMLResponse, PlainTextResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.templating import Jinja2Templates

import assist
import db as dbmod
import reviews
import resources
import review_sampling
import threads

CHILE_TZ = timezone(timedelta(hours=-3))
# RM-018: pagina de la cola con el mismo tope que /atendidos (LIMIT 100).
QUEUE_PAGE_SIZE = 100
# Tope de seguridad de filas pendientes que se agrupan por consulta.
QUEUE_MAX_ROWS = 2000
BASE_DIR = Path(__file__).parent
DB_PATH = Path(os.environ.get("REDDIT_MONITOR_DB", BASE_DIR / "reddit_monitor.db"))
WEB_PASSWORD = os.environ.get("WEB_PASSWORD", "")
CONFIG_PATH = BASE_DIR / "config.json"

app = FastAPI(title="Monedario — Reddit monitor")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
security = HTTPBasic()


@app.middleware("http")
async def block_indexing(request: Request, call_next):
    """Herramienta interna, nunca debe indexarse ni seguirse desde buscadores.
    Header explicito en TODAS las respuestas, ademas del meta tag en el HTML
    y de /robots.txt — defensa en profundidad, no depende de un solo mecanismo
    (ni de que Google respete el meta tag si algun dia la Basic Auth se cae)."""
    response = await call_next(request)
    response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    return response


@app.get("/robots.txt", response_class=PlainTextResponse)
def robots_txt():
    return "User-agent: *\nDisallow: /\n"


def check_auth(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    if not WEB_PASSWORD:
        # Sin WEB_PASSWORD configurada, no se bloquea nadie — pero se dejo
        # asi para que el despliegue nunca falle por un .env incompleto;
        # el script de despliegue exige la contraseña antes de arrancar.
        return "carlos"
    correct_user = secrets.compare_digest(credentials.username, "carlos")
    correct_pass = secrets.compare_digest(credentials.password, WEB_PASSWORD)
    if not (correct_user and correct_pass):
        raise HTTPException(
            status_code=401, detail="Credenciales invalidas",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


def require_same_origin(request: Request) -> None:
    """Bloqueo CSRF mínimo (RM-018): los navegadores envían siempre el header
    Sec-Fetch-Site en cada request; curl y los scripts de salud no lo envían.
    Se rechaza solo el cross-site declarado; la ausencia del header se permite
    para no romper verify_fase1.sh ni usos API directos."""
    site = (request.headers.get("sec-fetch-site") or "").lower()
    if site and site != "same-origin":
        raise HTTPException(status_code=403, detail="Origen cruzado rechazado")


def get_conn():
    conn = dbmod.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


def urgency_badge(created_utc: float) -> tuple[str, str]:
    """(clase_css, etiqueta) segun edad del post — el growth hacker pidio
    esto explicitamente: un hilo respondido a los 20 min capta mucho mas
    trafico organico que uno respondido a las 6 horas."""
    age_hours = (datetime.now(tz=timezone.utc).timestamp() - created_utc) / 3600
    if age_hours < 1:
        return "urgente", f"{int(age_hours * 60)} min"
    if age_hours < 6:
        return "reciente", f"{age_hours:.1f} h"
    if age_hours < 24:
        return "normal", f"{age_hours:.0f} h"
    return "viejo", f"{age_hours / 24:.0f} d"


def load_assessments(conn, keys: list[str]) -> dict[str, dict]:
    """Ultimo analisis del asistente IA por hilo, listo para la plantilla. Es
    contenido no confiable (lo escribio un modelo a partir de texto de Reddit):
    la plantilla lo escapa como todo lo demas."""
    if not keys:
        return {}
    marks = ",".join("?" * len(keys))
    out = {}
    for a in conn.execute(f"SELECT * FROM ai_assessments WHERE thread_key IN ({marks}) ORDER BY id", keys):
        limits = json.loads(a["context_limits"] or "[]")
        out[a["thread_key"]] = {
            "classification": a["classification"], "reason": a["reason"], "mode": a["mode"],
            "opportunity": a["opportunity"], "context_sufficient": bool(a["context_sufficient"]),
            "draft": a["draft"] if not a["draft_blocked"] else None,
            "draft_blocked": a["draft_blocked"],
            "warnings": json.loads(a["draft_warnings"] or "[]"),
            "verify": json.loads(a["pending_verification"] or "[]"),
            "limits": limits, "model": a["model"], "created_at": a["created_at"][:16],
            "would_discard": a["classification"] == "no_financiero" and bool(a["context_sufficient"])
                              and a["mode"] == "observacion",
        }
    return out


@app.get("/", response_class=HTMLResponse)
def queue(request: Request, page: int = 1, user: str = Depends(check_auth), conn=Depends(get_conn)):
    # Los pendientes se agrupan por hilo (un post y sus comentarios = una
    # tarjeta) y se paginan los HILOS, no las filas. n_pendientes sigue siendo
    # el total de filas; n_hilos, el de tarjetas.
    page = max(1, page)
    all_rows = conn.execute(
        "SELECT * FROM matches WHERE status = 'pendiente' "
        "ORDER BY priority_score DESC NULLS LAST, created_utc DESC LIMIT ?",
        (QUEUE_MAX_ROWS,),
    ).fetchall()
    groups = threads.group_by_thread(all_rows)
    total = len(all_rows)
    n_pages = max(1, -(-len(groups) // QUEUE_PAGE_SIZE))
    page = min(page, n_pages)
    page_groups = groups[(page - 1) * QUEUE_PAGE_SIZE: page * QUEUE_PAGE_SIZE]
    resource_map = resources.load_resource_map(CONFIG_PATH)
    ai = load_assessments(conn, [g["key"] for g in page_groups])
    items = []
    for g in page_groups:
        r = g["primary"]
        cls, label = urgency_badge(r["created_utc"])
        items.append({
            "resource": resources.suggest_resource(f"{r['title'] or ''} {r['snippet']}", resource_map),
            "id": r["id"], "subreddit": r["subreddit"], "permalink": r["permalink"],
            "snippet": r["snippet"], "confidence": r["confidence"],
            "ml_confidence": r["ml_confidence"], "urgency_class": cls, "urgency_label": label,
            "type": r["type"],
            "extras": [{"id": e["id"], "snippet": e["snippet"], "confidence": e["confidence"]}
                       for e in g["extras"]],
            "extra_ids": [e["id"] for e in g["extras"]],
            "comment_only": not g["has_post"],
            "ai": ai.get(g["key"]),
        })
    # RM-018: "hoy" en hora Chile, no UTC. status_changed_at se guarda en
    # ISO con offset -03:00 (ver CHILE_TZ): SQLite lo normaliza a UTC al
    # parsear, asi que '-3 hours' lo devuelve a dia-calendario chileno
    # (mismo offset fijo que usa todo el resto del proyecto).
    hoy_cl = datetime.now(tz=CHILE_TZ).date().isoformat()
    n_atendidos_hoy = conn.execute(
        "SELECT COUNT(*) c FROM matches WHERE status='atendido' "
        "AND date(status_changed_at, '-3 hours') = ?",
        (hoy_cl,),
    ).fetchone()["c"]
    return templates.TemplateResponse(request, "queue.html", {
        "items": items, "n_pendientes": total, "n_hilos": len(groups),
        "n_atendidos_hoy": n_atendidos_hoy,
        "page": page, "n_pages": n_pages,
    })


def thread_mates(conn, match_id: int, candidate_ids: list[int]) -> list[int]:
    """De `candidate_ids`, los que siguen pendientes y son del MISMO hilo que
    `match_id`. Filtrar aqui evita que un id ajeno del formulario toque otros
    hilos."""
    primary = conn.execute("SELECT permalink FROM matches WHERE id = ?", (match_id,)).fetchone()
    if not primary or not candidate_ids:
        return []
    key = threads.thread_key(primary["permalink"])
    marks = ",".join("?" * len(candidate_ids))
    rows = conn.execute(
        f"SELECT id, permalink FROM matches WHERE status = 'pendiente' AND id IN ({marks})",
        candidate_ids,
    ).fetchall()
    return [r["id"] for r in rows if r["id"] != match_id and threads.thread_key(r["permalink"]) == key]


@app.post("/matches/{match_id}/atender")
def atender(
    match_id: int,
    request: Request,
    incluyo_link: bool = Form(False),
    url_monedario: str = Form(""),
    nota: str = Form(""),
    ids: list[int] = Form([]),
    user: str = Depends(check_auth),
    conn=Depends(get_conn),
):
    require_same_origin(request)
    match = conn.execute("SELECT * FROM matches WHERE id = ?", (match_id,)).fetchone()
    if not match:
        raise HTTPException(status_code=404, detail="No existe ese match")

    utm_url = None
    if incluyo_link and url_monedario.strip():
        from utm_link import build_link
        utm_url = build_link(url_monedario.strip(), match["subreddit"], f"match{match_id}")

    now_iso = datetime.now(tz=CHILE_TZ).isoformat()
    with conn:
        conn.execute(
            "UPDATE matches SET status='atendido', status_changed_at=? WHERE id=?",
            (now_iso, match_id),
        )
        conn.execute(
            "INSERT INTO actions (match_id, responded_at, response_has_link, utm_url, notes) "
            "VALUES (?, ?, ?, ?, ?) "
            "ON CONFLICT(match_id) DO UPDATE SET responded_at=excluded.responded_at, "
            "response_has_link=excluded.response_has_link, utm_url=excluded.utm_url, notes=excluded.notes",
            (match_id, now_iso, int(incluyo_link), utm_url, nota.strip() or None),
        )
    # Etapa 1 del ciclo de feedback: atender = relevante y accionable.
    reviews.record_review(conn, "accionable", match_id=match_id, now_iso=now_iso)
    # Al responder el hilo, sus otros comentarios pendientes dejan de tener
    # sentido. Se cierran SIN etiqueta humana: no es un juicio sobre ellos y
    # no debe entrar al entrenamiento del filtro.
    mates = thread_mates(conn, match_id, ids)
    if mates:
        marks = ",".join("?" * len(mates))
        with conn:
            conn.execute(
                f"UPDATE matches SET status='descartado', status_note='hilo_atendido', "
                f"status_changed_at=? WHERE id IN ({marks})",
                [now_iso, *mates],
            )
    return RedirectResponse(url="/", status_code=303)


@app.post("/matches/{match_id}/restaurar")
def restaurar(match_id: int, request: Request, user: str = Depends(check_auth), conn=Depends(get_conn)):
    """Devuelve a la cola un descarte automatico (IA). La persona se hace cargo del
    hilo: queda en ai_holds y el asistente no vuelve a tocarlo. No crea etiquetas."""
    require_same_origin(request)
    if not conn.execute("SELECT 1 FROM matches WHERE id = ?", (match_id,)).fetchone():
        raise HTTPException(status_code=404, detail="No existe ese match")
    now_iso = datetime.now(tz=CHILE_TZ).isoformat()
    if not assist.restore_thread(conn, match_id, now_iso):
        raise HTTPException(status_code=409, detail="Ese match no es un descarte automatico")
    return RedirectResponse(url="/atendidos", status_code=303)


MOTIVOS_DESCARTE = ("ruido", "tema_sin_accion", "ya_resuelto")


@app.post("/matches/{match_id}/descartar")
def descartar(
    match_id: int,
    request: Request,
    motivo: str = Form("ruido"),
    ids: list[int] = Form([]),
    user: str = Depends(check_auth),
    conn=Depends(get_conn),
):
    require_same_origin(request)
    if motivo not in MOTIVOS_DESCARTE:
        raise HTTPException(status_code=422, detail="Motivo de descarte invalido")
    if not conn.execute("SELECT 1 FROM matches WHERE id = ?", (match_id,)).fetchone():
        raise HTTPException(status_code=404, detail="No existe ese match")
    now_iso = datetime.now(tz=CHILE_TZ).isoformat()
    # El motivo es una decision sobre el HILO: se aplica al principal y a sus
    # comentarios pendientes (que la tarjeta muestra plegados).
    for target in [match_id, *thread_mates(conn, match_id, ids)]:
        with conn:
            conn.execute(
                "UPDATE matches SET status='descartado', status_note=?, status_changed_at=? WHERE id=?",
                (motivo, now_iso, target),
            )
        reviews.record_review(conn, motivo, match_id=target, now_iso=now_iso)
    return RedirectResponse(url="/", status_code=303)


@app.get("/wikis", response_class=HTMLResponse)
def wikis(request: Request, user: str = Depends(check_auth), conn=Depends(get_conn)):
    subreddits = sorted({r["subreddit"] for r in conn.execute("SELECT DISTINCT subreddit FROM matches")})
    rows = {r["subreddit"]: r for r in conn.execute("SELECT * FROM subreddit_wiki_status")}
    items = []
    for sub in subreddits:
        status = rows.get(sub)
        items.append({
            "subreddit": sub,
            "checked": bool(status["checked"]) if status else False,
            "has_monedario": bool(status["has_monedario"]) if status else False,
            "notes": status["notes"] if status else "",
        })
    return templates.TemplateResponse(request, "wikis.html", {"items": items})


@app.post("/wikis/{subreddit}")
def update_wiki(
    subreddit: str,
    request: Request,
    checked: bool = Form(False),
    has_monedario: bool = Form(False),
    notes: str = Form(""),
    user: str = Depends(check_auth),
    conn=Depends(get_conn),
):
    require_same_origin(request)
    now_iso = datetime.now(tz=CHILE_TZ).isoformat()
    with conn:
        conn.execute(
            "INSERT INTO subreddit_wiki_status (subreddit, checked, has_monedario, notes, updated_at) "
            "VALUES (?, ?, ?, ?, ?) "
            "ON CONFLICT(subreddit) DO UPDATE SET checked=excluded.checked, "
            "has_monedario=excluded.has_monedario, notes=excluded.notes, updated_at=excluded.updated_at",
            (subreddit, int(checked), int(has_monedario), notes.strip() or None, now_iso),
        )
    return RedirectResponse(url="/wikis", status_code=303)


@app.get("/atendidos", response_class=HTMLResponse)
def atendidos(request: Request, user: str = Depends(check_auth), conn=Depends(get_conn)):
    rows = conn.execute(
        "SELECT m.*, a.utm_url, a.notes AS action_notes FROM matches m "
        "LEFT JOIN actions a ON a.match_id = m.id "
        "WHERE m.status IN ('atendido', 'descartado') "
        "ORDER BY m.status_changed_at DESC LIMIT 100"
    ).fetchall()
    ai = load_assessments(conn, [threads.thread_key(r["permalink"]) for r in rows if (r["status_note"] or "").startswith("ia_")])
    items = [{**dict(r), "auto": (r["status_note"] or "").startswith("ia_"),
              "ai": ai.get(threads.thread_key(r["permalink"]))} for r in rows]
    return templates.TemplateResponse(request, "atendidos.html", {"items": items})


REVISION_BATCH = 10

# Descartes que Carlos ya hizo (importados como etiqueta implicita sin
# motivo): asignarles el motivo real es lo que mas rinde por clic, porque
# separa "no es finanzas" de "es del tema pero no aporta responder".
IMPLICIT_SQL = (
    "SELECT m.id, m.permalink, m.subreddit, m.snippet, m.confidence, m.ml_confidence, "
    "'match' AS source FROM matches m JOIN human_reviews hr ON hr.match_id = m.id "
    "WHERE hr.source = 'implicita' AND hr.reason = ? ORDER BY m.id DESC LIMIT ?"
)


@app.get("/revision", response_class=HTMLResponse)
def revision(request: Request, user: str = Depends(check_auth), conn=Depends(get_conn)):
    implicit = [dict(r) for r in conn.execute(IMPLICIT_SQL, (reviews.MOTIVO_IMPLICITO, REVISION_BATCH))]
    sample = review_sampling.build_queue(conn, REVISION_BATCH)
    n_explicit = conn.execute(
        "SELECT COUNT(*) c FROM human_reviews WHERE source = 'explicita'"
    ).fetchone()["c"]
    n_implicit = conn.execute(
        "SELECT COUNT(*) c FROM human_reviews WHERE source = 'implicita' AND reason = ?",
        (reviews.MOTIVO_IMPLICITO,),
    ).fetchone()["c"]
    return templates.TemplateResponse(request, "revision.html", {
        "implicit": implicit, "sample": sample,
        "n_explicit": n_explicit, "n_implicit": n_implicit,
    })


@app.post("/revision/{source}/{item_id}")
def revision_guardar(
    source: str,
    item_id: int,
    request: Request,
    motivo: str = Form(...),
    user: str = Depends(check_auth),
    conn=Depends(get_conn),
):
    require_same_origin(request)
    if source not in ("match", "discarded"):
        raise HTTPException(status_code=404, detail="Origen invalido")
    if motivo not in reviews.MOTIVOS:
        raise HTTPException(status_code=422, detail="Motivo invalido")
    table = "matches" if source == "match" else "discarded"
    if not conn.execute(f"SELECT 1 FROM {table} WHERE id = ?", (item_id,)).fetchone():
        raise HTTPException(status_code=404, detail="No existe ese item")
    kwargs = {"match_id": item_id} if source == "match" else {"discarded_id": item_id}
    reviews.record_review(conn, motivo, **kwargs)
    return RedirectResponse(url="/revision", status_code=303)
