"""
Tests para monitor.py — cubren especificamente los dos bugs reales que
aparecieron durante el desarrollo (para que no vuelvan a pasar):
  1. "(vacío)" contado como entrada del indice.
  2. f-string con backslash (regresion de sintaxis).
Ademas cubre el matching por limite de palabra, el filtro de intencion,
y el ciclo completo de split/parse/build de las secciones Pendiente/Atendido.

Ejecutar con: python3 -m pytest test_monitor.py -v
"""
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import monitor as m  # noqa: E402


DEFAULT_KW = m.DEFAULT_CONFIG["keywords"]
DEFAULT_PHRASES = m.DEFAULT_CONFIG["intent_phrases"]
DEFAULT_STARTERS = m.DEFAULT_CONFIG["interrogative_starters"]


# --- matched_keywords: limite de palabra ---

def test_uf_no_matchea_dentro_de_sufrir():
    assert m.matched_keywords("no quiero sufrir mas", DEFAULT_KW) == []


def test_uf_matchea_como_palabra_completa():
    hits = m.matched_keywords("cuesta 4500 UF el depa", DEFAULT_KW)
    assert "uf" in hits


def test_multi_palabra_matchea():
    hits = m.matched_keywords("necesito una tarjeta de credito nueva", DEFAULT_KW)
    assert "tarjeta de credito" in hits


def test_sin_match_no_hay_hits():
    assert m.matched_keywords("hoy salio el sol y fui a caminar", DEFAULT_KW) == []


# --- intent_score ---

def test_pregunta_da_score_positivo():
    score, signals = m.intent_score("¿alguien sabe si conviene invertir en fondos mutuos?",
                                     DEFAULT_PHRASES, DEFAULT_STARTERS)
    assert score >= 1


def test_mencion_incidental_da_score_cero():
    score, signals = m.intent_score("me quede sin sueldo por las vacaciones de diciembre",
                                     DEFAULT_PHRASES, DEFAULT_STARTERS)
    assert score == 0


def test_confidence_label():
    assert m.confidence_label(0) == "Baja"
    assert m.confidence_label(1) == "Media"
    assert m.confidence_label(2) == "Alta"
    assert m.confidence_label(5) == "Alta"


# --- disambiguate_keywords / has_finance_context: bug real del 17/09 ---
# ("invertir" en r/chile sobre aviones F-35 se colo como falso positivo)

DEFAULT_AMBIGUOUS = m.DEFAULT_CONFIG["ambiguous_keywords"]
DEFAULT_CONTEXT = m.DEFAULT_CONFIG["finance_context_words"]


def test_invertir_sin_contexto_financiero_se_descarta():
    texto = "el gobierno va a invertir en la compra de aviones F-35"
    kws = m.matched_keywords(texto, DEFAULT_KW)
    valid, dropped = m.disambiguate_keywords(texto, kws, DEFAULT_AMBIGUOUS, DEFAULT_CONTEXT)
    assert "invertir" in dropped
    assert "invertir" not in valid


def test_invertir_con_contexto_financiero_se_mantiene():
    texto = "alguien sabe si conviene invertir mi plata en fondos mutuos"
    kws = m.matched_keywords(texto, DEFAULT_KW)
    valid, dropped = m.disambiguate_keywords(texto, kws, DEFAULT_AMBIGUOUS, DEFAULT_CONTEXT)
    assert "invertir" in valid
    assert "invertir" not in dropped


def test_impuesto_sin_contexto_financiero_se_descarta():
    texto = "eso fue impuesto por Hollywood en la decada de los 80"
    kws = m.matched_keywords(texto, DEFAULT_KW)
    valid, dropped = m.disambiguate_keywords(texto, kws, DEFAULT_AMBIGUOUS, DEFAULT_CONTEXT)
    assert "impuesto" in dropped
    assert "impuesto" not in valid


def test_impuesto_con_contexto_financiero_se_mantiene():
    texto = "el impuesto a la renta subio este año, alguien mas noto la diferencia en el sueldo"
    kws = m.matched_keywords(texto, DEFAULT_KW)
    valid, dropped = m.disambiguate_keywords(texto, kws, DEFAULT_AMBIGUOUS, DEFAULT_CONTEXT)
    assert "impuesto" in valid
    assert "impuesto" not in dropped


def test_keyword_no_ambigua_no_se_toca():
    texto = "necesito ayuda con mi tarjeta de credito"
    kws = m.matched_keywords(texto, DEFAULT_KW)
    valid, dropped = m.disambiguate_keywords(texto, kws, DEFAULT_AMBIGUOUS, DEFAULT_CONTEXT)
    assert "tarjeta de credito" in valid
    assert dropped == []


def test_has_finance_context_no_se_autovalida():
    # "invertir" no deberia contar como su propio contexto
    assert m.has_finance_context("voy a invertir tiempo en esto", "invertir", DEFAULT_CONTEXT) is False


# --- parse_entries / rebuild_index: regresion del bug "(vacío)" ---

def test_parse_entries_ignora_placeholder_vacio():
    block = "\n(vacío)\n"
    assert m.parse_entries(block) == []


def test_parse_entries_cuenta_solo_entradas_reales():
    block = (
        "### 10:00 — r/chile [Alta]\n**Keyword:** ahorro\n"
        "**Señales de intención:** signo de interrogacion\n"
        "**Enlace:** https://reddit.com/r/chile/x\n> hola\n"
        "### 11:00 — r/chile [Media]\n**Keyword:** deuda\n"
        "**Señales de intención:** duda\n"
        "**Enlace:** https://reddit.com/r/chile/y\n> chao\n"
    )
    entries = m.parse_entries(block)
    assert len(entries) == 2


def test_rebuild_index_no_cuenta_vacio_como_entrada(tmp_path):
    (tmp_path / "digest-2026-01-01.md").write_text(
        "# Test — 2026-01-01\n\n## Pendiente\n\n(sin pendientes)\n\n"
        "## Atendido\n\n(vacío)\n",
        encoding="utf-8",
    )
    m.rebuild_index(tmp_path)
    index_text = (tmp_path / "index.md").read_text(encoding="utf-8")
    assert "| 2026-01-01 | 0 | 0 |" in index_text


# --- build_day_file: preserva Atendido, ordena Pendiente por confianza ---

def test_build_day_file_ordena_por_confianza():
    entry_media = (
        "### 09:00 — r/chile [Media]\n**Keyword:** deuda\n"
        "**Señales de intención:** duda\n**Enlace:** https://reddit.com/r/chile/a\n> a\n"
    )
    entry_alta = (
        "### 10:00 — r/chile [Alta]\n**Keyword:** ahorro\n"
        "**Señales de intención:** duda, signo de interrogacion\n"
        "**Enlace:** https://reddit.com/r/chile/b\n> b\n"
    )
    result = m.build_day_file("", "2026-01-01", [entry_media, entry_alta])
    pos_alta = result.index("[Alta]")
    pos_media = result.index("[Media]")
    assert pos_alta < pos_media


def test_build_day_file_preserva_atendido_sin_tocarlo():
    existing = (
        "# Test — 2026-01-01\n\n## Pendiente\n\n(sin pendientes)\n\n"
        "## Atendido\n### 08:00 — r/chile [Media]\n**Keyword:** ahorro\n"
        "**Señales de intención:** duda\n**Enlace:** https://reddit.com/r/chile/z\n"
        "> ya respondido (nota manual de Carlos)\n"
    )
    nueva_entrada = (
        "### 09:00 — r/chile [Alta]\n**Keyword:** deuda\n"
        "**Señales de intención:** duda, signo de interrogacion\n"
        "**Enlace:** https://reddit.com/r/chile/nuevo\n> nueva\n"
    )
    result = m.build_day_file(existing, "2026-01-01", [nueva_entrada])
    assert "ya respondido (nota manual de Carlos)" in result
    assert "r/chile/nuevo" in result


def test_existing_permalinks_dedup():
    text = (
        "## Pendiente\n### 09:00 — r/chile [Alta]\n**Enlace:** https://reddit.com/r/chile/a\n"
        "## Atendido\n### 08:00 — r/chile [Media]\n**Enlace:** https://reddit.com/r/chile/b\n"
    )
    links = m.existing_permalinks(text)
    assert "/r/chile/a" in links
    assert "/r/chile/b" in links


# --- load_config: crea default si no existe, respeta lo existente ---

def test_load_config_crea_default_si_no_existe(tmp_path):
    cfg = m.load_config(tmp_path)
    assert "chile" in cfg["subreddits"]
    assert (tmp_path / "config.json").exists()


def test_load_config_respeta_config_existente(tmp_path):
    import json
    custom = dict(m.DEFAULT_CONFIG)
    custom["subreddits"] = ["chile"]
    (tmp_path / "config.json").write_text(json.dumps(custom), encoding="utf-8")
    cfg = m.load_config(tmp_path)
    assert cfg["subreddits"] == ["chile"]


# --- last_success_ts: ventana ampliada tras corridas saltadas ---

def test_last_success_ts_sin_runs_log_devuelve_none(tmp_path):
    assert m.last_success_ts(tmp_path) is None


def test_last_success_ts_ignora_errores_y_toma_el_ultimo_ok(tmp_path):
    import json
    lines = [
        {"ts": "2026-09-18T08:00:00-03:00", "script": "monitor", "status": "ok", "detail": "x"},
        {"ts": "2026-09-18T09:15:00-03:00", "script": "monitor", "status": "error", "detail": "y"},
        {"ts": "2026-09-18T10:30:00-03:00", "script": "monitor", "status": "error", "detail": "z"},
    ]
    (tmp_path / "runs.log").write_text(
        "\n".join(json.dumps(l, ensure_ascii=False) for l in lines) + "\n", encoding="utf-8"
    )
    ts = m.last_success_ts(tmp_path)
    from datetime import datetime
    expected = datetime.fromisoformat("2026-09-18T08:00:00-03:00").timestamp()
    assert ts == expected


def test_last_success_ts_ignora_lineas_corruptas(tmp_path):
    (tmp_path / "runs.log").write_text(
        'no es json\n{"ts": "2026-09-18T08:00:00-03:00", "status": "ok"}\n{"status": "ok"}\n',
        encoding="utf-8",
    )
    from datetime import datetime
    expected = datetime.fromisoformat("2026-09-18T08:00:00-03:00").timestamp()
    assert m.last_success_ts(tmp_path) == expected


# --- RM-006: politica de reintentos de api_get (mock transport, sin red) ---

class _FakeHTTPResponse:
    def __init__(self, payload: bytes):
        self._payload = payload

    def read(self):
        return self._payload

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


def _http_error(code, retry_after=None):
    headers = {"Retry-After": retry_after} if retry_after is not None else None
    return urllib.error.HTTPError(
        "https://oauth.reddit.com/r/x/new", code, f"HTTP {code}", headers, None
    )


def _ok_response():
    return _FakeHTTPResponse(b'{"data": {"children": []}}')


def _mock_urlopen(monkeypatch, script, calls, timeouts):
    """Reemplaza urlopen por un guion: cada elemento es excepcion (raise) o
    respuesta (return). Registra el timeout de cada llamada."""
    def fake_urlopen(req, timeout=None):
        calls.append(req)
        timeouts.append(timeout)
        nxt = script.pop(0)
        if isinstance(nxt, Exception):
            raise nxt
        return nxt
    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)


def test_api_get_429_honra_retry_after_con_tope(monkeypatch):
    calls, timeouts, sleeps = [], [], []
    monkeypatch.setattr(time, "sleep", lambda s: sleeps.append(s))
    _mock_urlopen(monkeypatch, [_http_error(429, "3600"), _ok_response()], calls, timeouts)
    assert m.api_get("/r/x/new", "tok", "ua") == {"data": {"children": []}}
    assert timeouts == [20, 20]  # timeout historico preservado
    assert sleeps == [60.0]  # Retry-After 3600s capado a 60s


def test_api_get_429_sin_retry_after_usa_backoff(monkeypatch):
    sleeps = []
    monkeypatch.setattr(time, "sleep", lambda s: sleeps.append(s))
    _mock_urlopen(monkeypatch, [_http_error(429, "junk"), _ok_response()], [], [])
    m.api_get("/r/x/new", "tok", "ua")
    assert sleeps == [1.5]  # 1.5*(attempt 0+1), header inparseable


@pytest.mark.parametrize("code", [401, 403])
def test_api_get_401_403_fail_fast_una_sola_llamada(monkeypatch, code):
    calls, timeouts, sleeps = [], [], []
    monkeypatch.setattr(time, "sleep", lambda s: sleeps.append(s))
    _mock_urlopen(monkeypatch, [_http_error(code)], calls, timeouts)
    with pytest.raises(urllib.error.HTTPError):
        m.api_get("/r/x/new", "tok", "ua")
    assert len(calls) == 1  # fail-fast: sin reintentos
    assert sleeps == []


def test_api_get_5xx_reintenta_y_luego_levanta(monkeypatch):
    calls, timeouts, sleeps = [], [], []
    monkeypatch.setattr(time, "sleep", lambda s: sleeps.append(s))
    _mock_urlopen(
        monkeypatch, [_http_error(500), _http_error(503), _http_error(500)],
        calls, timeouts,
    )
    with pytest.raises(urllib.error.HTTPError):
        m.api_get("/r/x/new", "tok", "ua")
    assert len(calls) == 3  # intento + 2 reintentos, luego levanta la ultima
    assert len(sleeps) == 2
    assert timeouts == [20, 20, 20]


# --- RM-007: refresh de token mid-run (exactamente una vez) ---

def _write_min_creds_cfg(workdir, subs):
    (workdir / "credentials.json").write_text(
        json.dumps({"client_id": "id", "client_secret": "sec", "user_agent": "ua"}),
        encoding="utf-8",
    )
    (workdir / "config.json").write_text(
        json.dumps({"subreddits": subs}), encoding="utf-8"
    )


def _ok_stats(sub):
    return {"subreddit": sub, "posts_scanned": 0, "comments_scanned": 0,
            "posts_en_ventana": 0, "comments_en_ventana": 0}


def test_rm007_refresh_exactamente_una_vez_y_retoma(monkeypatch, tmp_path):
    _write_min_creds_cfg(tmp_path, ["a", "b"])
    seen_tokens = []

    def fake_get_token(cid, sec, ua):
        tok = f"tok{len(seen_tokens)}"
        seen_tokens.append(tok)
        return tok

    monkeypatch.setattr(m, "get_token", fake_get_token)
    calls = []

    def fake_collect(sub, token, ua, cutoff, cfg):
        calls.append((sub, token))
        if sub == "a" and token == "tok0":
            raise _http_error(401)
        return [], [], _ok_stats(sub)

    monkeypatch.setattr(m, "collect_items", fake_collect)
    new_items, *_ = m.run(tmp_path)
    assert new_items == []
    assert seen_tokens == ["tok0", "tok1"]  # inicial + un solo refresh
    assert calls == [("a", "tok0"), ("a", "tok1"), ("b", "tok1")]  # retoma + sigue


def test_rm007_401_persistente_no_loopea(monkeypatch, tmp_path):
    _write_min_creds_cfg(tmp_path, ["a"])
    token_calls = []
    monkeypatch.setattr(
        m, "get_token", lambda *a: token_calls.append(1) or f"tok{len(token_calls)}"
    )
    collect_calls = []

    def fake_collect(sub, token, ua, cutoff, cfg):
        collect_calls.append(token)
        raise _http_error(401)

    monkeypatch.setattr(m, "collect_items", fake_collect)
    with pytest.raises(RuntimeError):
        m.run(tmp_path)
    assert len(token_calls) == 2  # inicial + 1 refresh, el 2do 401 no refresca
    assert len(collect_calls) == 2  # intento + 1 reintento, sin loop


# --- RM-009: dead-letter ntfy con tope ---

def test_rm009_dead_letter_topea_en_50_y_recorta_viejos(tmp_path):
    for i in range(55):
        m.record_ntfy_failure(tmp_path, f"ctx-{i}", f"detail-{i}")
    lines = (tmp_path / m.NTFY_FAILURES_FILE).read_text(encoding="utf-8").splitlines()
    assert len(lines) == 50
    assert json.loads(lines[0])["context"] == "ctx-5"  # las 5 mas viejas fuera
    assert json.loads(lines[-1])["context"] == "ctx-54"  # se quedan las nuevas


# --- RM-010: rotacion conserva lo nuevo ---

def test_rm010_rotacion_conserva_lo_nuevo(tmp_path):
    path = tmp_path / "probe.log"
    path.write_text("".join(f"linea-{i}\n" for i in range(10)), encoding="utf-8")
    m._trim_file_to_last_n_lines(path, 3)
    assert path.read_text(encoding="utf-8").splitlines() == [
        "linea-7", "linea-8", "linea-9",
    ]


def test_lexicon_normalize_no_depende_de_unicodedata_local():
    # Regresion: lexicon.py redefinia normalize/strip_accents con un
    # `unicodedata` sin importar (NameError silenciado como "aviso"). Debe
    # re-exportar las funciones unicas de normalize.py.
    import lexicon
    import normalize as norm

    assert lexicon.normalize is norm.normalize
    assert lexicon.strip_accents is norm.strip_accents
    assert lexicon.normalize("Ahorré Éxito") == "ahorre exito"


# --- descarte temprano de autores propios (own_authors) ---

def _raw_comment(author, body="Alguien sabe como calcular el dividendo hipotecario? "
                              "necesito ayuda con mi credito hipotecario"):
    return {"body": body, "author": author, "permalink": "/r/chile/comments/x/y/z/",
            "created_utc": 1.0, "score": 1, "subreddit_subscribers": 1000}


def _cfg_with(own):
    cfg = dict(m.DEFAULT_CONFIG)
    cfg["own_authors"] = own
    return cfg


def test_control_un_tercero_si_genera_match():
    items, _ = m.process_comment(_raw_comment("otro_usuario"), "chile", _cfg_with(["yo"]))
    assert items  # sin este control, los tests de abajo pasarian por una razon equivocada


@pytest.mark.parametrize("author", ["yo", "YO", "u/yo", "/u/Yo", " yo "])
def test_comentario_propio_se_descarta_temprano(author):
    items, discarded = m.process_comment(_raw_comment(author), "chile", _cfg_with(["yo"]))
    assert items == [] and discarded == []  # ni match ni "descartado por intencion"


def test_post_propio_tambien_se_descarta():
    post = {"title": "Como calculo el dividendo hipotecario?", "selftext": "ayuda con mi credito hipotecario",
            "author": "Yo", "permalink": "/r/chile/comments/x/", "created_utc": 1.0,
            "score": 1, "num_comments": 0, "subreddit_subscribers": 1000}
    assert m.process_post(post, "chile", _cfg_with(["yo"])) == ([], [])


def test_own_authors_vacio_o_ausente_no_filtra_a_nadie():
    assert m.process_comment(_raw_comment("yo"), "chile", _cfg_with([]))[0]
    cfg = dict(m.DEFAULT_CONFIG)
    cfg.pop("own_authors")
    assert m.process_comment(_raw_comment("yo"), "chile", cfg)[0]


def test_autor_borrado_o_faltante_no_se_confunde_con_uno_propio():
    cfg = _cfg_with(["yo", "", "   "])  # entradas vacias no deben matchear nada
    assert m.process_comment(_raw_comment("[deleted]"), "chile", cfg)[0]
    assert m.process_comment(_raw_comment(None), "chile", cfg)[0]


def test_own_authors_como_string_se_tolera():
    assert m.own_author_set({"own_authors": "Yo"}) == {"yo"}
