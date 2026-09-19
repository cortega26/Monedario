#!/usr/bin/env python3
"""
Monitor de Reddit para Monedario.cl (Carlos Ortega).
SOLO LECTURA: nunca publica, comenta, vota ni interactua con Reddit.

Cada corrida:
  1. Carga config.json (subreddits, keywords, señales de intencion). Si no
     existe, lo crea con valores por defecto — asi se puede ajustar despues
     sin tocar este archivo.
  2. Se autentica contra la API de Reddit (OAuth client_credentials, solo
     lectura) usando credentials.json guardado localmente.
  3. Trae posts y comentarios nuevos de los subreddits configurados.
  4. Filtra por palabras clave (con limite de palabra, \\b, para evitar
     falsos positivos tipo "uf" dentro de "sufrir").
  5. Filtra ademas por señales de intencion real (pregunta / pedido de
     consejo) para no llenar el digest de menciones incidentales.
  6. Escribe/actualiza el archivo del dia (digest-YYYY-MM-DD.md, hora Chile)
     con dos secciones: "Pendiente" (nuevo) y "Atendido" (lo que Carlos ya
     movio a mano — el script nunca la toca). Reordena "Pendiente" por
     confianza (Alta primero) y luego por hora.
  7. Reconstruye index.md listando todos los digest-*.md presentes.
  8. Deja constancia de la corrida (exito/error, cuantos items) en runs.log
     (una linea JSON por corrida) para poder auditar fallos silenciosos.
  9. [Fase 0] Escribe ademas todo lo anterior a reddit_monitor.db (SQLite),
     que pasa a ser la fuente de datos para la interfaz web (Fase 1+). El
     Markdown se mantiene en paralelo — no es una migracion de golpe, ambos
     conviven hasta que la web app este lista y probada.

Uso: python3 monitor.py <directorio_de_trabajo>
El directorio debe contener credentials.json. Idealmente tambien contiene
config.json y los digest-*.md existentes (staged desde la carpeta real)
para poder deduplicar y reconstruir el indice correctamente.
"""
import json
import math
import re
import sqlite3
import sys
import time
import traceback
import unicodedata
import urllib.error
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone, timedelta

import db as dbmod
import lexicon

CHILE_TZ = timezone(timedelta(hours=-3))

# Se sube a mano cada vez que se ajustan keywords/intent_phrases/interrogative_starters
# de forma que cambie el comportamiento del heuristico. Permite comparar
# precision/recall de matches "antes" vs "despues" de un ajuste sin que se
# mezclen en el mismo analisis (ver human_reviews en schema.sql).
# v2-2026-09: se agrega matching por lema + stem ademas del regex exacto
# (Fase 0.6) — el conjunto de items que pasa el filtro de keywords puede
# ser distinto a v1, por eso corresponde subir la version.
FILTER_VERSION = "v2-2026-09"

# Si las librerias de ML (sentence-transformers/spacy/nltk) no estan
# instaladas o fallan al cargar, el monitor sigue funcionando igual que
# antes de la Fase 0.6 — la capa semantica es un observador opcional, nunca
# un requisito para que el heuristico de reglas (la fuente de verdad hoy)
# siga corriendo.
try:
    import semantic as semanticmod
    _SEMANTIC_AVAILABLE = True
except ImportError:
    semanticmod = None
    _SEMANTIC_AVAILABLE = False

DEFAULT_CONFIG = {
    "subreddits": [
        "chile", "Santiago", "RepublicadeChile", "FinanzasChile",
        "AskChile", "BolsaChile",
    ],
    "keywords": [
        # finanzas personales generales
        "ahorro", "tarjeta de credito", "afp", "deuda", "invertir",
        "presupuesto", "dicom", "credito de consumo", "jubilacion",
        "finanzas personales", "fondo mutuo", "renta fija",
        "cuenta de ahorro", "sueldo", "gastos",
        # especificas de lo que Monedario ya publica o podria publicar
        "calculadora de", "declaracion de renta", "boleta de honorarios",
        "cotizaciones", "isapre", "fonasa", "dividendo hipotecario", "uf",
        "ipc", "leasing", "credito hipotecario", "prestamo",
        "interes compuesto", "impuesto",
    ],
    # --- Filtro de intencion (heuristica basada en reglas, sin dependencias) ---
    # Objetivo: separar menciones incidentales de la keyword ("me quede sin
    # sueldo por las vacaciones") de casos donde el autor realmente esta
    # preguntando, pidiendo consejo u opinando sobre el tema financiero.
    "intent_phrases": [
        "alguien sabe", "alguien tiene", "alguien maneja", "alguien conoce",
        "alguien me puede", "alguien me explica", "recomiendan",
        "recomendacion", "recomendaciones", "me recomiendan", "consejo",
        "consejos", "duda", "dudas", "ayuda", "ayudenme", "me ayudan",
        "sirve", "vale la pena", "conviene", "no conviene",
        "opiniones sobre", "que opinan", "opinan de", "experiencia con",
        "sugerencias", "tips de", "como hago", "como puedo", "donde puedo",
        "cual es mejor", "cual conviene", "es buena idea", "es mala idea",
        "que me recomiendan", "necesito consejo", "necesito ayuda",
        "me pueden ayudar", "vale la pena invertir", "como funciona",
        "que tan bueno es", "que tan malo es",
    ],
    "interrogative_starters": [
        "que ", "como ", "cual ", "cuales ", "donde ", "cuando ", "por que ",
        "porque ", "cuanto ", "cuanta ", "cuantos ", "cuantas ", "alguien ",
    ],
    "lookback_seconds": 75 * 60,  # 75 min: cubre el intervalo de 60 min con margen
    # tope superior de la ventana ampliada (ver last_success_ts / run()) para
    # que una corrida saltada no dispare un lookback absurdo si runs.log
    # tiene un dato corrupto o faltan muchisimas corridas seguidas.
    "max_lookback_seconds": 24 * 60 * 60,  # 24h
    # minutos estimados que toma redactar una buena respuesta segun confianza
    # (usado por weekly_report.py para estimar carga de tiempo semanal)
    "time_estimate_minutes": {"Alta": 6, "Media": 3, "Baja": 1},
    # --- Desambiguacion de keywords con doble sentido ---
    # "invertir" (plata) vs "invertir en aviones/tiempo/esfuerzo"; "impuesto"
    # (tributo) vs "impuesto por" (participio de imponer). Para estas, exigir
    # que aparezca tambien algun termino de contexto financiero en el mismo
    # texto — si no, se descarta como ambiguo (queda registrado en
    # descartados.jsonl igual, para poder auditar).
    "ambiguous_keywords": ["invertir", "impuesto"],
    "finance_context_words": [
        "plata", "dinero", "ahorro", "ahorros", "ahorrar", "inversion",
        "inversiones", "invertir", "fondo", "fondos", "banco", "cuenta",
        "ingreso", "ingresos", "gasto", "gastos", "deuda", "deudas",
        "credito", "creditos", "interes", "intereses", "rentabilidad",
        "accion", "acciones", "bolsa", "afp", "impuesto", "impuestos",
        "tributario", "tributaria", "renta", "presupuesto", "financiero",
        "financiera", "finanzas", "sueldo", "salario", "hipotecario",
        "dividendo", "uf", "ipc",
    ],
    # --- Fase 0.6: matching expandido (lema + stem) ---------------------
    "use_lemma_matching": True,
    "use_stem_matching": True,
    # Variantes que ni la lematizacion ni el stemming conectan con su
    # keyword (derivaciones con prefijo, verbos muy irregulares). Se
    # agregan a mano cuando se detecten en descartados.jsonl / discarded.
    "related_terms": {
        "deuda": ["endeudado", "endeudarse", "endeudarme", "endeudada"],
        "jubilacion": ["jubilarme", "jubilarse", "pensionarme"],
    },
    # --- Fase 0.6: capa semantica en modo OBSERVACION --------------------
    # No decide nada todavia (ver semantic.py). Prototipos editables aca
    # mismo, igual que las keywords — no hace falta tocar Python para
    # ajustarlos a medida que se acumulen revisiones en human_reviews.
    "ml_enabled": True,
    "ml_prototypes_intent": [
        "Estoy buscando consejo sobre como manejar mi dinero o mis finanzas personales",
        "Tengo una duda especifica sobre ahorro, inversion, creditos o impuestos en Chile",
        "Alguien me puede recomendar que hacer con mis ahorros o mi presupuesto",
        "Quiero saber si me conviene invertir en esto o aquello",
        "Necesito ayuda para entender como funciona un tramite financiero o tributario",
    ],
    "ml_prototypes_noise": [
        "Me quejo de mi sueldo o mi trabajo sin pedir consejo financiero, solo desahogandome",
        "Menciono plata o deuda de pasada dentro de una historia personal que no es sobre finanzas",
        "Hablo de politica, noticias o critico a otra persona, sin relacion a dinero",
        "Cuento una anecdota o experiencia de vida donde la plata aparece pero no es el tema central",
        "Hago una broma, insulto o comentario coloquial sin pedir informacion ni consejo",
    ],
}


def load_config(workdir: Path) -> dict:
    """Carga config.json del directorio de trabajo. Si no existe, lo crea
    con los valores por defecto (asi Carlos puede editarlo despues sin
    tocar Python)."""
    config_path = workdir / "config.json"
    if config_path.exists():
        cfg = json.loads(config_path.read_text(encoding="utf-8"))
        # completa con defaults cualquier clave que falte (config viejo)
        for key, value in DEFAULT_CONFIG.items():
            cfg.setdefault(key, value)
        return cfg
    config_path.write_text(
        json.dumps(DEFAULT_CONFIG, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return dict(DEFAULT_CONFIG)


# --- RM-009/RM-010: dead-letter ntfy + rotacion de logs -------------------------
# Los logs JSONL crecen linea a linea en cada corrida (timer cada 60 min) sin
# limite. Al escribir, cada archivo se recorta a sus ultimas N lineas: barato
# a esta escala y evita crecimiento silencioso del disco en la VM.
LOG_TAIL_LINES = 5000  # runs.log, scan_stats.jsonl, descartados.jsonl
NTFY_FAILURES_FILE = "ntfy_failures.jsonl"  # RM-009: dead-letter de ntfy
NTFY_FAILURES_CAP = 50  # se conservan solo los ultimos 50 fallos


def _trim_file_to_last_n_lines(path: Path, keep: int) -> None:
    """Recorta un archivo de texto a sus ultimas `keep` lineas. Nunca levanta
    excepcion: rotar no debe tumbar la corrida que lo invoca."""
    try:
        if not path.exists():
            return
        with path.open("r", encoding="utf-8") as f:
            lines = f.readlines()
        if len(lines) > keep:
            with path.open("w", encoding="utf-8") as f:
                f.writelines(lines[-keep:])
    except Exception as exc:  # noqa: BLE001
        print(f"aviso: no se pudo rotar {path.name}: {exc}", file=sys.stderr)


def record_ntfy_failure(workdir: Path, context: str, detail: str) -> None:
    """Dead-letter local de notificaciones ntfy fallidas (RM-009).

    Hoy los envios de ntfy viven en run_monitor.sh / run_weekly_report.sh
    (`curl ... || true`), fuera del alcance Python de esta wave: esta funcion
    es el mecanismo Python para registrar cada fallo tragado, con tope de
    NTFY_FAILURES_CAP lineas (se descartan las mas viejas). Cablear los
    wrappers shell a este mecanismo queda como follow-up documentado.
    Nunca levanta excepcion."""
    entry = {
        "ts": datetime.now(tz=CHILE_TZ).isoformat(),
        "context": context,
        "detail": detail,
    }
    path = workdir / NTFY_FAILURES_FILE
    try:
        with path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        _trim_file_to_last_n_lines(path, NTFY_FAILURES_CAP)
    except Exception as exc:  # noqa: BLE001
        print(f"aviso: no se pudo registrar fallo ntfy: {exc}", file=sys.stderr)


def log_run(workdir: Path, script: str, status: str, detail: str) -> None:
    """Deja una linea JSON en runs.log con el resultado de esta corrida,
    para poder auditar fallos que de otro modo quedarian silenciosos
    (cada corrida es una sesion efimera nueva sin memoria de la anterior)."""
    entry = {
        "ts": datetime.now(tz=CHILE_TZ).isoformat(),
        "script": script,
        "status": status,
        "detail": detail,
    }
    log_path = workdir / "runs.log"
    with log_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    _trim_file_to_last_n_lines(log_path, LOG_TAIL_LINES)


def last_success_ts(workdir: Path) -> float | None:
    """Devuelve el timestamp unix (epoch) de la ultima corrida con
    status 'ok' registrada en runs.log, o None si no hay ninguna (primera
    corrida) o el archivo no existe todavia.

    Se usa para ampliar la ventana de busqueda cuando una o mas corridas se
    saltaron (contenedor sin acceso al computador, error de API, etc.): al
    no haber quedado un renglon 'ok' para esos intervalos, el hueco entre la
    ultima corrida exitosa y ahora queda cubierto automaticamente por la
    siguiente corrida que si funcione, en vez de perderse."""
    log_path = workdir / "runs.log"
    if not log_path.exists():
        return None
    last_ts = None
    with log_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("status") != "ok":
                continue
            try:
                last_ts = datetime.fromisoformat(entry["ts"]).timestamp()
            except (KeyError, ValueError, TypeError):
                continue
    return last_ts


def append_jsonl(workdir: Path, filename: str, rows: list[dict]) -> None:
    if not rows:
        return
    path = workdir / filename
    with path.open("a", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    _trim_file_to_last_n_lines(path, LOG_TAIL_LINES)


def strip_accents(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def normalize(text: str) -> str:
    return strip_accents(text or "").lower()


def get_token(client_id: str, client_secret: str, user_agent: str) -> str:
    auth = f"{client_id}:{client_secret}".encode()
    import base64

    headers = {
        "Authorization": "Basic " + base64.b64encode(auth).decode(),
        "User-Agent": user_agent,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
    req = urllib.request.Request(
        "https://www.reddit.com/api/v1/access_token",
        data=data,
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        payload = json.loads(resp.read().decode())
    return payload["access_token"]


# --- RM-006: politica de reintentos -------------------------------------------------
# Reintentables: 429 (rate limit, honrando Retry-After) y 5xx, mas errores de
# red sin codigo HTTP (URLError/timeout). Fail-fast: cualquier otro HTTPError
# (401/403/404/...) — reintentar un 401 solo quema cuota y esconde un token
# muerto (el refresh mid-run de RM-007 vive en run(), no aqui).
API_RETRY_BACKOFF_BASE_S = 1.5  # igual que el backoff historico 1.5*(attempt+1)
API_RETRY_MAX_DELAY_S = 60.0  # tope: ni Retry-After ni backoff esperan mas
API_TIMEOUT_S = 20  # timeout historico, sin cambios


def _is_retryable_status(code: int) -> bool:
    """Solo 429 y 5xx se reintentan. Todo otro codigo HTTP falla rapido."""
    return code == 429 or 500 <= code <= 599


def _retry_delay_s(attempt: int, retry_after: str | None) -> float:
    """Espera antes del siguiente intento: Retry-After (capado) si el
    servidor lo mando, si no backoff exponencial capado."""
    if retry_after is not None:
        try:
            return min(max(float(retry_after), 0.0), API_RETRY_MAX_DELAY_S)
        except (TypeError, ValueError):
            pass
    return min(API_RETRY_BACKOFF_BASE_S * (attempt + 1), API_RETRY_MAX_DELAY_S)


def api_get(path: str, token: str, user_agent: str, retries: int = 2) -> dict:
    headers = {"Authorization": f"Bearer {token}", "User-Agent": user_agent}
    req = urllib.request.Request(f"https://oauth.reddit.com{path}", headers=headers)
    last_exc = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=API_TIMEOUT_S) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as exc:  # noqa: BLE001
            if not _is_retryable_status(exc.code):
                raise  # 401/403/4xx: fail-fast, sin reintentos
            last_exc = exc
            if attempt < retries:
                retry_after = exc.headers.get("Retry-After") if exc.headers else None
                time.sleep(_retry_delay_s(attempt, retry_after))
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            if attempt < retries:
                time.sleep(_retry_delay_s(attempt, None))
    raise last_exc


def matched_keywords(text: str, keywords: list[str]) -> list[str]:
    """Matching exacto original (regex \\b), sin cambios — se mantiene tal
    cual para no alterar el comportamiento que ya conocen los tests
    existentes. El matching EXPANDIDO (que ademas suma lema/stem/variantes)
    vive en find_keywords_expanded(), usado por collect_items()."""
    norm = normalize(text)
    hits = []
    for kw in keywords:
        pattern = r"\b" + re.escape(normalize(kw)) + r"\b"
        if re.search(pattern, norm):
            hits.append(kw)
    return hits


def find_keywords_expanded(text: str, cfg: dict) -> tuple[list[str], dict[str, str]]:
    """[Fase 0.6] Version usada en produccion: regex exacto + lema + stem +
    variantes manuales (related_terms). Se degrada solo al regex exacto si
    spaCy/nltk no estan instalados o fallan al cargar — nunca revienta la
    corrida por esto."""
    keywords = cfg["keywords"]
    try:
        found, method = lexicon.expanded_keyword_matches(
            text, keywords, cfg.get("related_terms"),
            use_lemma=cfg.get("use_lemma_matching", True),
            use_stem=cfg.get("use_stem_matching", True),
        )
        return list(found), method
    except Exception as exc:  # noqa: BLE001
        print(f"aviso: matching expandido fallo, se usa solo regex exacto: {exc}", file=sys.stderr)
        found = matched_keywords(text, keywords)
        return found, {kw: "regex" for kw in found}


def score_semantic(text: str, cfg: dict) -> tuple[float | None, float | None, str | None]:
    """[Fase 0.6, modo observacion] Devuelve (margin, ml_confidence,
    model_version), o (None, None, None) si esta deshabilitado o algo
    falla — nunca bloquea la corrida principal."""
    if not cfg.get("ml_enabled", True) or not _SEMANTIC_AVAILABLE:
        return None, None, None
    try:
        margin, conf = semanticmod.compute_margin(
            text, cfg.get("ml_prototypes_intent", []), cfg.get("ml_prototypes_noise", [])
        )
        return margin, conf, semanticmod.MODEL_VERSION
    except Exception as exc:  # noqa: BLE001
        print(f"aviso: scoring semantico fallo para un item: {exc}", file=sys.stderr)
        return None, None, None


def has_finance_context(text: str, keyword: str, context_words: list[str]) -> bool:
    """Para keywords ambiguas (ej. 'invertir' = plata vs. 'invertir en
    aviones'), exige que aparezca algun otro termino de contexto financiero
    en el mismo texto. Excluye la propia keyword de la lista de contexto
    para no validarse a si misma trivialmente."""
    norm = normalize(text)
    kw_norm = normalize(keyword)
    for word in context_words:
        word_norm = normalize(word)
        if word_norm == kw_norm:
            continue
        if re.search(r"\b" + re.escape(word_norm) + r"\b", norm):
            return True
    return False


def disambiguate_keywords(text: str, keywords: list[str], ambiguous: list[str],
                           context_words: list[str]) -> tuple[list[str], list[str]]:
    """Filtra 'keywords' (ya matcheadas) quitando las ambiguas que no tienen
    contexto financiero de respaldo. Devuelve (keywords_validas, ambiguas_descartadas)."""
    valid, dropped = [], []
    for kw in keywords:
        if kw in ambiguous and not has_finance_context(text, kw, context_words):
            dropped.append(kw)
        else:
            valid.append(kw)
    return valid, dropped


def intent_score(text: str, intent_phrases: list[str], interrogative_starters: list[str]) -> tuple[int, list[str]]:
    """Puntaje heuristico de intencion real (pregunta/pedido de consejo),
    no solo mencion incidental de la keyword. Devuelve (score, señales)."""
    norm = normalize(text)
    signals = []

    if "?" in text or "¿" in text:
        signals.append("signo de interrogacion")

    for phrase in intent_phrases:
        if phrase in norm:
            signals.append(f"frase: '{phrase}'")

    stripped = norm.strip()
    for starter in interrogative_starters:
        if stripped.startswith(starter) or f". {starter}" in norm or f", {starter}" in norm:
            signals.append(f"interrogativo: '{starter.strip()}'")
            break

    unique_signals = list(dict.fromkeys(signals))
    return len(unique_signals), unique_signals


def confidence_label(score: int) -> str:
    if score >= 2:
        return "Alta"
    if score == 1:
        return "Media"
    return "Baja"


def collect_items(subreddit: str, token: str, user_agent: str, cutoff: float, cfg: dict) -> tuple[list[dict], list[dict], dict]:
    """Devuelve (items_aceptados, items_descartados, stats_de_escaneo).

    items_descartados: matches de keyword que NO pasaron el filtro de
    intencion — se registran (sin mostrarse en el digest) para poder
    auditar despues si el filtro esta botando cosas relevantes (falsos
    negativos). stats: conteos crudos para poder calcular tasa de hit
    historica, incluso si nunca hubo match.

    [Fase 0] Cada item ahora tambien guarda score/num_comments/
    subreddit_subscribers/author (gratis, ya vienen en la respuesta de la
    API) y la lista COMPLETA de keywords que matchearon (antes solo se
    guardaba la primera) — necesario para poder medir que keyword especifica
    genera ruido vs señal real."""
    items = []
    discarded = []
    keywords = cfg["keywords"]
    intent_phrases = cfg["intent_phrases"]
    interrogative_starters = cfg["interrogative_starters"]
    stats = {"subreddit": subreddit, "posts_scanned": 0, "comments_scanned": 0,
              "posts_en_ventana": 0, "comments_en_ventana": 0}

    listing = api_get(f"/r/{subreddit}/new?limit=50", token, user_agent)
    posts = listing.get("data", {}).get("children", [])
    stats["posts_scanned"] = len(posts)
    for child in posts:
        d = child.get("data", {})
        if d.get("created_utc", 0) < cutoff:
            continue
        stats["posts_en_ventana"] += 1
        title = d.get("title", "")
        body = d.get("selftext", "")
        full_text = f"{title} {body}"
        kws_raw, kw_methods = find_keywords_expanded(full_text, cfg)
        kws, kws_ambiguos = disambiguate_keywords(
            full_text, kws_raw, cfg["ambiguous_keywords"], cfg["finance_context_words"]
        )
        engagement = {
            "score": d.get("score"),
            "num_comments": d.get("num_comments"),
            "subreddit_subscribers": d.get("subreddit_subscribers"),
            "author": d.get("author"),
        }
        snippet_text = (title or body)[:220].replace("\n", " ").strip()
        if kws_ambiguos:
            margin, ml_conf, ml_ver = score_semantic(full_text, cfg)
            discarded.append({
                "type": "post",
                "subreddit": subreddit,
                "permalink": d.get("permalink", ""),
                "created_utc": d.get("created_utc", 0),
                "keyword": kws_ambiguos[0],
                "confidence": "Baja",
                "signals": ["descartado: ambiguedad de sentido sin contexto financiero"],
                "snippet": snippet_text,
                "keyword_match_methods": kw_methods,
                "ml_semantic_margin": margin, "ml_confidence": ml_conf, "ml_model_version": ml_ver,
            })
        if kws:
            score, signals = intent_score(full_text, intent_phrases, interrogative_starters)
            margin, ml_conf, ml_ver = score_semantic(full_text, cfg)
            record = {
                "type": "post",
                "subreddit": subreddit,
                "permalink": d.get("permalink", ""),
                "created_utc": d.get("created_utc", 0),
                "keyword": kws[0],
                "keywords": kws,
                "keyword_match_methods": kw_methods,
                "title": title,
                "confidence": confidence_label(score),
                "intent_score": score,
                "signals": signals,
                "snippet": snippet_text,
                "ml_semantic_margin": margin, "ml_confidence": ml_conf, "ml_model_version": ml_ver,
                **engagement,
            }
            if score >= 1:
                items.append(record)
            else:
                discarded.append(record)

    comments = api_get(f"/r/{subreddit}/comments?limit=50", token, user_agent)
    com_children = comments.get("data", {}).get("children", [])
    stats["comments_scanned"] = len(com_children)
    for child in com_children:
        d = child.get("data", {})
        if d.get("created_utc", 0) < cutoff:
            continue
        stats["comments_en_ventana"] += 1
        body = d.get("body", "")
        kws_raw, kw_methods = find_keywords_expanded(body, cfg)
        kws, kws_ambiguos = disambiguate_keywords(
            body, kws_raw, cfg["ambiguous_keywords"], cfg["finance_context_words"]
        )
        # los comentarios no traen num_comments (serian los del post padre,
        # requeriria una llamada extra a la API que no vale la pena solo
        # para el score de prioridad) — se deja en None, compute_priority_score
        # lo trata como neutro, no como cero.
        engagement = {
            "score": d.get("score"),
            "num_comments": None,
            "subreddit_subscribers": d.get("subreddit_subscribers"),
            "author": d.get("author"),
        }
        snippet_text = body[:220].replace("\n", " ").strip()
        if kws_ambiguos:
            margin, ml_conf, ml_ver = score_semantic(body, cfg)
            discarded.append({
                "type": "comment",
                "subreddit": subreddit,
                "permalink": d.get("permalink", ""),
                "created_utc": d.get("created_utc", 0),
                "keyword": kws_ambiguos[0],
                "confidence": "Baja",
                "signals": ["descartado: ambiguedad de sentido sin contexto financiero"],
                "snippet": snippet_text,
                "keyword_match_methods": kw_methods,
                "ml_semantic_margin": margin, "ml_confidence": ml_conf, "ml_model_version": ml_ver,
            })
        if kws:
            score, signals = intent_score(body, intent_phrases, interrogative_starters)
            margin, ml_conf, ml_ver = score_semantic(body, cfg)
            record = {
                "type": "comment",
                "subreddit": subreddit,
                "permalink": d.get("permalink", ""),
                "created_utc": d.get("created_utc", 0),
                "keyword": kws[0],
                "keywords": kws,
                "keyword_match_methods": kw_methods,
                "title": None,
                "confidence": confidence_label(score),
                "intent_score": score,
                "signals": signals,
                "snippet": snippet_text,
                "ml_semantic_margin": margin, "ml_confidence": ml_conf, "ml_model_version": ml_ver,
                **engagement,
            }
            if score >= 1:
                items.append(record)
            else:
                discarded.append(record)

    return items, discarded, stats


CONF_RANK = {"Alta": 0, "Media": 1, "Baja": 2}


def render_entry(item: dict) -> str:
    dt = datetime.fromtimestamp(item["created_utc"], tz=CHILE_TZ)
    ts = dt.strftime("%H:%M")
    signals = ", ".join(item.get("signals", [])) or "—"
    return (
        f"### {ts} — r/{item['subreddit']} [{item['confidence']}]\n"
        f"**Keyword:** {item['keyword']}\n"
        f"**Señales de intención:** {signals}\n"
        f"**Enlace:** https://reddit.com{item['permalink']}\n"
        f"> {item['snippet']}\n"
    )


def split_sections(text: str) -> tuple[str, str, str]:
    """Devuelve (encabezado, bloque_pendiente_raw, bloque_atendido_raw)."""
    pend_match = re.search(r"^## Pendiente\s*\n", text, flags=re.MULTILINE)
    aten_match = re.search(r"^## Atendido\s*\n", text, flags=re.MULTILINE)
    if not pend_match or not aten_match:
        return text, "", ""
    header = text[: pend_match.start()]
    pendiente = text[pend_match.end(): aten_match.start()]
    atendido = text[aten_match.end():]
    return header, pendiente, atendido


def parse_entries(block: str) -> list[str]:
    parts = re.split(r"(?=^### )", block, flags=re.MULTILINE)
    return [p for p in parts if p.lstrip().startswith("### ")]


def entry_sort_key(entry: str) -> tuple:
    conf_match = re.search(r"\[(Alta|Media|Baja)\]", entry)
    time_match = re.search(r"^### (\d{2}:\d{2})", entry, flags=re.MULTILINE)
    conf_rank = CONF_RANK.get(conf_match.group(1), 3) if conf_match else 3
    time_str = time_match.group(1) if time_match else "00:00"
    return (conf_rank, time_str)


def build_day_file(existing_text: str, day_str: str, new_entries: list[str]) -> str:
    if not existing_text.strip():
        header = f"# Monitoreo Reddit — Monedario.cl — {day_str}\n\n"
        pendiente_entries = new_entries
        atendido_block = "\n(vacío)\n"
    else:
        header, pendiente_raw, atendido_block = split_sections(existing_text)
        if not header.strip():
            header = f"# Monitoreo Reddit — Monedario.cl — {day_str}\n\n"
        pendiente_entries = parse_entries(pendiente_raw) + new_entries

    pendiente_entries.sort(key=entry_sort_key)
    pendiente_block = "".join(pendiente_entries) if pendiente_entries else "\n(sin pendientes)\n"

    if not atendido_block.strip():
        atendido_block = "\n(vacío)\n"

    return (
        f"{header}## Pendiente\n{pendiente_block}\n"
        f"## Atendido\n{atendido_block}"
    )


def existing_permalinks(text: str) -> set[str]:
    return set(re.findall(r"https://reddit\.com(/r/\S+)", text))


def rebuild_index(workdir: Path) -> None:
    rows = []
    for path in sorted(workdir.glob("digest-*.md"), reverse=True):
        text = path.read_text(encoding="utf-8")
        _, pend, aten = split_sections(text)
        n_pend = len(parse_entries(pend))
        n_aten = len(parse_entries(aten))
        day = path.stem.replace("digest-", "")
        rows.append((day, n_pend, n_aten, path.name))

    lines = ["# Índice — Monitoreo Reddit Monedario.cl\n\n"]
    lines.append("| Fecha | Pendientes | Atendidos | Archivo |\n")
    lines.append("|---|---|---|---|\n")
    for day, n_pend, n_aten, fname in rows:
        lines.append(f"| {day} | {n_pend} | {n_aten} | {fname} |\n")
    (workdir / "index.md").write_text("".join(lines), encoding="utf-8")


def existing_db_permalinks(workdir: Path) -> set[str]:
    """Permalinks ya guardados en la DB (matches), para no duplicar si el
    script se corre mas de una vez sobre la misma ventana (overlap por
    diseño de 75 min) una vez que la DB sea la fuente principal."""
    db_path = workdir / "reddit_monitor.db"
    if not db_path.exists():
        return set()
    conn = dbmod.connect(db_path)
    try:
        rows = conn.execute("SELECT permalink FROM matches").fetchall()
        return {r["permalink"] for r in rows}
    finally:
        conn.close()


def write_to_db(workdir: Path, *, started_at_iso: str, status: str,
                 lookback_seconds: int, gap_extended_hours: float | None,
                 new_items: list[dict], all_discarded: list[dict],
                 all_stats: list[dict], error_detail: str | None,
                 now_ts: float) -> None:
    """Escribe la corrida completa a SQLite. Se llama siempre (exito o
    error parcial) para que scan_runs sea un historial completo, igual que
    runs.log hoy."""
    db_path = workdir / "reddit_monitor.db"
    conn = dbmod.connect(db_path)
    try:
        with conn:
            cur = conn.execute(
                "INSERT INTO scan_runs (started_at, status, lookback_seconds, "
                "gap_extended_hours, n_new, n_discarded, error_detail, filter_version) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (started_at_iso, status, lookback_seconds, gap_extended_hours,
                 len(new_items), len(all_discarded), error_detail, FILTER_VERSION),
            )
            run_id = cur.lastrowid

            for s in all_stats:
                conn.execute(
                    "INSERT INTO scan_stats (run_id, subreddit, posts_scanned, "
                    "comments_scanned, posts_en_ventana, comments_en_ventana) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (run_id, s["subreddit"], s["posts_scanned"], s["comments_scanned"],
                     s["posts_en_ventana"], s["comments_en_ventana"]),
                )

            for it in new_items:
                priority = dbmod.compute_priority_score(
                    it["created_utc"], now_ts, it.get("score"),
                    it.get("num_comments"), it.get("subreddit_subscribers"),
                )
                cur = conn.execute(
                    "INSERT OR IGNORE INTO matches (run_id, permalink, type, subreddit, "
                    "created_utc, detected_at, title, snippet, score, num_comments, "
                    "subreddit_subscribers, author, confidence, intent_score, "
                    "intent_signals, filter_version, keyword_match_methods, priority_score, "
                    "ml_semantic_margin, ml_confidence, ml_model_version, status) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')",
                    (run_id, it["permalink"], it["type"], it["subreddit"],
                     it["created_utc"], started_at_iso, it.get("title"), it["snippet"],
                     it.get("score"), it.get("num_comments"), it.get("subreddit_subscribers"),
                     it.get("author"), it["confidence"], it["intent_score"],
                     json.dumps(it.get("signals", []), ensure_ascii=False),
                     FILTER_VERSION, json.dumps(it.get("keyword_match_methods", {}), ensure_ascii=False),
                     priority, it.get("ml_semantic_margin"), it.get("ml_confidence"),
                     it.get("ml_model_version")),
                )
                if cur.rowcount:
                    match_id = cur.lastrowid
                    for kw in it.get("keywords", [it.get("keyword")]):
                        if kw:
                            conn.execute(
                                "INSERT OR IGNORE INTO match_keywords (match_id, keyword) VALUES (?, ?)",
                                (match_id, kw),
                            )

            for d in all_discarded:
                reason = d.get("signals", [""])[0] if d.get("signals") else None
                conn.execute(
                    "INSERT INTO discarded (run_id, permalink, type, subreddit, created_utc, "
                    "detected_at, keyword, confidence, reason, snippet, filter_version, "
                    "keyword_match_methods, ml_semantic_margin, ml_confidence, ml_model_version) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (run_id, d.get("permalink"), d["type"], d["subreddit"],
                     d.get("created_utc"), started_at_iso, d.get("keyword"),
                     d.get("confidence"), reason, d.get("snippet"), FILTER_VERSION,
                     json.dumps(d.get("keyword_match_methods", {}), ensure_ascii=False),
                      d.get("ml_semantic_margin"), d.get("ml_confidence"), d.get("ml_model_version")),
                )
    finally:
        conn.close()


# --- RM-008: cierre de la divergencia silenciosa Markdown-ahead-of-DB ------------
# Si write_to_db falla, el digest/JSONL ya estan escritos: sin marca visible,
# la corrida parece sana. El remedio minimo es doble: fila scan_runs con
# status='degraded' + aviso visible al pie del digest del dia.
DB_DEGRADED_MARKER = (
    "> ⚠️ Aviso de integridad (RM-008): esta corrida escribió el digest pero "
    "falló la escritura a SQLite — la cola web puede estar incompleta para "
    "este día (scan_runs='degraded', ver runs.log)."
)


def write_degraded_run(workdir: Path, *, started_at_iso: str, lookback_seconds: int,
                       gap_extended_hours: float | None, n_new: int, n_discarded: int,
                       error_detail: str | None, db_error: str) -> None:
    """Fila minima de scan_runs cuando write_to_db fallo: deja constancia del
    estado 'degraded' sin reintentar los inserts hijos (que pueden ser la
    causa del fallo). Si la DB se creo con un schema.sql anterior a RM-008
    (CHECK sin 'degraded'), cae a 'error' con prefijo en error_detail."""
    db_path = workdir / "reddit_monitor.db"
    conn = dbmod.connect(db_path)
    try:
        combined = "; ".join(p for p in (error_detail, f"db_degraded: {db_error}") if p)
        try:
            with conn:
                conn.execute(
                    "INSERT INTO scan_runs (started_at, status, lookback_seconds, "
                    "gap_extended_hours, n_new, n_discarded, error_detail, filter_version) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (started_at_iso, "degraded", lookback_seconds, gap_extended_hours,
                     n_new, n_discarded, combined or None, FILTER_VERSION),
                )
        except sqlite3.IntegrityError:
            with conn:
                conn.execute(
                    "INSERT INTO scan_runs (started_at, status, lookback_seconds, "
                    "gap_extended_hours, n_new, n_discarded, error_detail, filter_version) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (started_at_iso, "error", lookback_seconds, gap_extended_hours,
                     n_new, n_discarded, f"degraded: {combined}" if combined else "degraded", FILTER_VERSION),
                )
    finally:
        conn.close()


def run(workdir: Path) -> tuple[list[dict], str, bool, int, float | None, bool, str | None]:
    """Ejecuta la logica principal. Devuelve (new_items, day_str, config_creado,
    n_discarded, gap_extended_hours, db_degraded, db_error). gap_extended_hours es None si la
    ventana fue la normal (75 min), o la ventana efectiva en horas si se
    amplio por una o mas corridas saltadas. db_degraded es True si la escritura
    a SQLite fallo (RM-008: scan_runs='degraded' + aviso visible en el digest),
    con db_error describiendo la causa."""
    config_path_existed = (workdir / "config.json").exists()
    cfg = load_config(workdir)
    creds = json.loads((workdir / "credentials.json").read_text(encoding="utf-8"))
    token = get_token(creds["client_id"], creds["client_secret"], creds["user_agent"])

    now_chile = datetime.now(tz=CHILE_TZ)
    day_str = now_chile.strftime("%Y-%m-%d")
    digest_path = workdir / f"digest-{day_str}.md"

    # Ventana normal: lookback_seconds (75 min por defecto). Si la ultima
    # corrida exitosa quedo mas atras que eso (una o mas corridas se
    # saltaron), se amplia para cubrir tambien ese hueco, con un tope de
    # max_lookback_seconds.
    now_ts = time.time()
    lookback_seconds = cfg["lookback_seconds"]
    gap_extended_hours = None
    last_ok = last_success_ts(workdir)
    if last_ok is not None:
        gap_seconds = now_ts - last_ok
        if gap_seconds > lookback_seconds:
            lookback_seconds = min(gap_seconds + 5 * 60, cfg["max_lookback_seconds"])
            gap_extended_hours = round(lookback_seconds / 3600, 1)

    cutoff = now_ts - lookback_seconds
    all_items = []
    all_discarded = []
    all_stats = []
    errors = []
    token_refreshed = False  # RM-007: un solo refresh por corrida, sin loops
    for sub in cfg["subreddits"]:
        try:
            items, discarded, stats = collect_items(sub, token, creds["user_agent"], cutoff, cfg)
        except urllib.error.HTTPError as exc:
            if exc.code != 401 or token_refreshed:
                errors.append(f"r/{sub}: {exc}")
                print(f"aviso: fallo consultando r/{sub}: {exc}", file=sys.stderr)
                continue
            # Token muerto a mitad de corrida: refrescar UNA vez y reintentar
            # este mismo sub (los subs siguientes ya usan el token nuevo).
            # Si el refresh o el reintento fallan, se registra el error igual
            # que cualquier otro fallo por sub (aislamiento preservado).
            try:
                token = get_token(creds["client_id"], creds["client_secret"], creds["user_agent"])
                token_refreshed = True
            except Exception as exc2:  # noqa: BLE001
                errors.append(f"r/{sub}: refresh de token fallo: {exc2}")
                print(f"aviso: fallo refrescando token en r/{sub}: {exc2}", file=sys.stderr)
                continue
            try:
                items, discarded, stats = collect_items(sub, token, creds["user_agent"], cutoff, cfg)
            except Exception as exc3:  # noqa: BLE001
                errors.append(f"r/{sub}: {exc3}")
                print(f"aviso: fallo consultando r/{sub} tras refresh: {exc3}", file=sys.stderr)
                continue
        except Exception as exc:  # noqa: BLE001
            errors.append(f"r/{sub}: {exc}")
            print(f"aviso: fallo consultando r/{sub}: {exc}", file=sys.stderr)
            continue
        all_items.extend(items)
        all_discarded.extend(discarded)
        all_stats.append(stats)

    existing_text = digest_path.read_text(encoding="utf-8") if digest_path.exists() else ""
    # Dedup contra TODO lo que exista para hoy (Pendiente + Atendido) Y
    # contra lo que ya este en la DB de cualquier dia — asi un mismo hilo
    # visto en dos corridas con ventanas solapadas nunca se duplica en
    # ninguna de las dos fuentes.
    already = existing_permalinks(existing_text) | existing_db_permalinks(workdir)
    new_items = [it for it in all_items if it["permalink"] not in already]

    if new_items:
        new_entries = [render_entry(it) for it in new_items]
        updated = build_day_file(existing_text, day_str, new_entries)
        digest_path.write_text(updated, encoding="utf-8")
    elif not digest_path.exists():
        digest_path.write_text(build_day_file("", day_str, []), encoding="utf-8")

    rebuild_index(workdir)

    # Se escriben aunque haya habido errores parciales en algunos subs —
    # la data de los subs que sí funcionaron sigue siendo valiosa para
    # auditoria de falsos negativos y calculo de tasa de hit.
    now_iso = now_chile.isoformat()
    for row in all_discarded:
        row["ts"] = now_iso
    for row in all_stats:
        row["ts"] = now_iso
    append_jsonl(workdir, "descartados.jsonl", all_discarded)
    append_jsonl(workdir, "scan_stats.jsonl", all_stats)

    error_detail = "; ".join(errors) if errors else None
    db_degraded = False
    db_error: str | None = None
    try:
        write_to_db(
            workdir,
            started_at_iso=now_iso,
            status="error" if errors else "ok",
            lookback_seconds=lookback_seconds,
            gap_extended_hours=gap_extended_hours,
            new_items=new_items,
            all_discarded=all_discarded,
            all_stats=all_stats,
            error_detail=error_detail,
            now_ts=now_ts,
        )
    except Exception as exc:  # noqa: BLE001
        # RM-008: la DB dejo de ser un espejo silencioso. Si falla, la corrida
        # queda marcada 'degraded' (scan_runs + runs.log via main()) y el
        # digest lleva un aviso visible al pie: Markdown-ahead-of-DB nunca mas
        # silencioso. Los fallos del remedio tampoco tumban la corrida.
        db_degraded = True
        db_error = f"{type(exc).__name__}: {exc}"
        print(f"aviso: fallo escribiendo a SQLite: {exc}", file=sys.stderr)
        try:
            write_degraded_run(
                workdir,
                started_at_iso=now_iso,
                lookback_seconds=lookback_seconds,
                gap_extended_hours=gap_extended_hours,
                n_new=len(new_items),
                n_discarded=len(all_discarded),
                error_detail=error_detail,
                db_error=db_error,
            )
        except Exception as exc2:  # noqa: BLE001
            print(f"aviso: fallo registrando estado degraded: {exc2}", file=sys.stderr)
        try:
            existing_digest = digest_path.read_text(encoding="utf-8") if digest_path.exists() else ""
            if DB_DEGRADED_MARKER not in existing_digest:
                with digest_path.open("a", encoding="utf-8") as f:
                    f.write(f"\n{DB_DEGRADED_MARKER}\n")
        except Exception as exc3:  # noqa: BLE001
            print(f"aviso: no se pudo marcar degraded en el digest: {exc3}", file=sys.stderr)

    if errors and db_degraded:  # R-04: degraded domina; los sub-errores van al detalle
        db_error = "; ".join(p for p in (db_error, "; ".join(errors)) if p)
    if errors and not db_degraded:
        raise RuntimeError("; ".join(errors))

    return new_items, day_str, not config_path_existed, len(all_discarded), gap_extended_hours, db_degraded, db_error


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: monitor.py <directorio_de_trabajo>", file=sys.stderr)
        return 2

    workdir = Path(sys.argv[1])

    try:
        (new_items, day_str, config_created, n_discarded, gap_extended_hours,
         db_degraded, db_error) = run(workdir)
    except Exception as exc:  # noqa: BLE001
        log_run(workdir, "monitor", "error", f"{exc}\n{traceback.format_exc()[-800:]}")
        print(f"ERROR: {exc}", file=sys.stderr)
        print("COMMIT: runs.log,descartados.jsonl,scan_stats.jsonl,reddit_monitor.db")
        return 1

    subs_hit = sorted({it["subreddit"] for it in new_items})
    commit_files = ["index.md", "runs.log", "descartados.jsonl", "scan_stats.jsonl", "reddit_monitor.db"]
    if new_items or db_degraded:
        # db_degraded: el digest cambio aunque no haya items nuevos (lleva el
        # aviso visible RM-008 al pie) y debe commitearse igual.
        commit_files.insert(0, f"digest-{day_str}.md")
    if config_created:
        commit_files.append("config.json")

    gap_note = f" [ventana ampliada a {gap_extended_hours}h por corrida(s) saltada(s)]" if gap_extended_hours else ""
    degraded_note = f" [db degradado: {db_error}]" if db_degraded else ""
    run_status = "degraded" if db_degraded else "ok"

    if new_items:
        summary = f"{len(new_items)} coincidencias nuevas en: {', '.join(subs_hit)} ({n_discarded} descartadas por intencion){gap_note}{degraded_note}"
        log_run(workdir, "monitor", run_status, summary)
        print(summary)
    else:
        summary = (f"Sin novedades ({n_discarded} descartadas por intencion){gap_note}{degraded_note}" if n_discarded
                    else f"Sin novedades{gap_note}{degraded_note}")
        log_run(workdir, "monitor", run_status, summary)
        print("Sin novedades" if not gap_note and not degraded_note else summary)

    print(f"COMMIT: {','.join(commit_files)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
